import { NextRequest, NextResponse } from 'next/server';
import { validateWallet, validateTwitter, validatePhase2Code, readWhitelistData, writeWhitelistData } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { twitter, wallet, code } = body;

    // Validate required fields
    if (!twitter || !wallet) {
      return NextResponse.json(
        { error: 'Twitter username and wallet address are required' },
        { status: 400 }
      );
    }

    // Validate inputs using shared utilities
    if (!validateWallet(wallet)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    if (!validateTwitter(twitter)) {
      return NextResponse.json(
        { error: 'Invalid Twitter username' },
        { status: 400 }
      );
    }

    if (code && !validatePhase2Code(code)) {
      return NextResponse.json(
        { error: 'Invalid Phase 2 code format' },
        { status: 400 }
      );
    }

    // Validate Phase 2 access code if provided
    if (code) {
      try {
        // Read consolidated data using shared utility
        let data = await readWhitelistData();
        
        // Check if the provided code is valid
        if (!data.phase2Codes.includes(code.toUpperCase())) {
          return NextResponse.json(
            { error: 'Invalid Phase 2 access code' },
            { status: 400 }
          );
        }

        // Check if code has already been used
        if (data.usedCodes.includes(code.toUpperCase())) {
          return NextResponse.json(
            { error: 'This Phase 2 access code has already been used' },
            { status: 400 }
          );
        }
        
      } catch (error) {
        console.error('Error validating Phase 2 code:', error);
        return NextResponse.json(
          { error: 'Unable to validate access code' },
          { status: 500 }
        );
      }
    }

    // Here you would typically:
    // 1. Check for duplicate submissions
    // 2. Store in database
    // 3. Send confirmation email
    
    // For now, we'll just log the submission and return success
    const submission = {
      twitter,
      wallet,
      code: code || null,
      timestamp: new Date().toISOString()
    };

    console.log('Whitelist submission:', submission);

    // Store in a single consolidated data file
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      const dataPath = path.join(process.cwd(), 'private');
      const filePath = path.join(dataPath, 'whitelist-data.json');
      
      // Ensure data directory exists
      await fs.mkdir(dataPath, { recursive: true });
      
      // Read existing data
      let data: {
        submissions: any[];
        usedCodes: string[];
        phase2Codes: string[];
      } = {
        submissions: [],
        usedCodes: [],
        phase2Codes: []
      };
      
      try {
        const existingData = await fs.readFile(filePath, 'utf8');
        data = JSON.parse(existingData);
      } catch (error) {
        // File doesn't exist or is empty, create initial structure
        // Load Phase 2 codes if file is new
        try {
          const codesPath = path.join(process.cwd(), 'private', 'phase2-codes.json');
          const codesData = await fs.readFile(codesPath, 'utf8');
          const { codes } = JSON.parse(codesData);
          data.phase2Codes = codes;
        } catch (codesError) {
          console.error('Error loading Phase 2 codes:', codesError);
        }
      }

      // Check for duplicate submissions (allow Phase 2 users to also submit for Phase 3)
      const normalizedTwitter = twitter.trim().toLowerCase();
      const normalizedWallet = wallet.trim().toLowerCase();
      
      for (const existingSubmission of data.submissions) {
        const existingTwitter = existingSubmission.twitter.trim().toLowerCase();
        const existingWallet = existingSubmission.wallet.trim().toLowerCase();
        const hasCode = existingSubmission.code !== null && existingSubmission.code !== undefined;
        const currentHasCode = code !== null && code !== undefined;
        
        // Same Twitter username with same phase type (both with code or both without code)
        if (existingTwitter === normalizedTwitter && hasCode === currentHasCode) {
          return NextResponse.json(
            { error: `This Twitter username has already been submitted for Phase ${currentHasCode ? '2' : '3'}` },
            { status: 400 }
          );
        }
        
        // Same wallet address with same phase type (both with code or both without code)
        if (existingWallet === normalizedWallet && hasCode === currentHasCode) {
          return NextResponse.json(
            { error: `This wallet address has already been submitted for Phase ${currentHasCode ? '2' : '3'}` },
            { status: 400 }
          );
        }
      }
      
      // Add new submission
      data.submissions.push(submission);
      
      // Mark Phase 2 code as used if provided
      if (code) {
        if (!data.usedCodes.includes(code.toUpperCase())) {
          data.usedCodes.push(code.toUpperCase());
        }
      }
      
      // Write back to consolidated file
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      
    } catch (fileError) {
      console.error('Error saving submission:', fileError);
      // Continue even if file saving fails
    }

    return NextResponse.json(
      { 
        message: 'Successfully submitted to whitelist',
        data: {
          twitter,
          wallet: wallet.slice(0, 6) + '...' + wallet.slice(-4), // Mask wallet address
          code: code ? 'provided' : 'none',
          submitted: true
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Whitelist API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Whitelist API endpoint is active' },
    { status: 200 }
  );
}
