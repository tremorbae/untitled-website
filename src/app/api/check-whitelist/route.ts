import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet } = body;

    // Validate required fields
    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Read consolidated data
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      const dataPath = path.join(process.cwd(), 'private');
      const filePath = path.join(dataPath, 'whitelist-data.json');
      
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
        // File doesn't exist, no submissions yet
        return NextResponse.json(
          { found: false, message: 'No whitelist submissions found' },
          { status: 200 }
        );
      }

      // Check for matching submission by wallet address only
      const normalizedWallet = wallet.trim().toLowerCase();
      
      for (const submission of data.submissions) {
        const existingWallet = submission.wallet.trim().toLowerCase();
        
        if (existingWallet === normalizedWallet) {
          // Check all submissions for this wallet to determine phase status
          const walletSubmissions = data.submissions.filter(s => 
            s.wallet.trim().toLowerCase() === normalizedWallet
          );
          
          const hasPhase2 = walletSubmissions.some(s => s.code);
          const hasPhase3 = walletSubmissions.some(s => !s.code);
          
          return NextResponse.json(
            { 
              found: true,
              submission: {
                twitter: submission.twitter,
                wallet: submission.wallet,
                code: submission.code,
                phase2: hasPhase2,
                phase3: hasPhase3, // Only yes if actually submitted for Phase 3
                timestamp: submission.timestamp
              }
            },
            { status: 200 }
          );
        }
      }

      // No matching submission found
      return NextResponse.json(
        { found: false, message: 'Not found on whitelist' },
        { status: 200 }
      );

    } catch (error) {
      console.error('Error checking whitelist:', error);
      return NextResponse.json(
        { error: 'Unable to check whitelist status' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Check whitelist API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Whitelist checker API endpoint is active' },
    { status: 200 }
  );
}
