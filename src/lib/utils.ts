// Shared validation utilities
export const validateWallet = (wallet: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(wallet);
};

export const validateTwitter = (twitter: string): boolean => {
  return twitter.length >= 1 && twitter.length <= 15 && /^[a-zA-Z0-9_]+$/.test(twitter);
};

export const validatePhase2Code = (code: string): boolean => {
  return code.length === 5 && /^69[a-zA-Z0-9]{3}$/.test(code);
};

// File operations utility
export const readWhitelistData = async () => {
  const fs = require('fs').promises;
  const path = require('path');
  
  const dataPath = path.join(process.cwd(), 'private');
  const filePath = path.join(dataPath, 'whitelist-data.json');
  
  try {
    const existingData = await fs.readFile(filePath, 'utf8');
    return JSON.parse(existingData);
  } catch (error) {
    return {
      submissions: [],
      usedCodes: [],
      phase2Codes: []
    };
  }
};

export const writeWhitelistData = async (data: any) => {
  const fs = require('fs').promises;
  const path = require('path');
  
  const dataPath = path.join(process.cwd(), 'private');
  const filePath = path.join(dataPath, 'whitelist-data.json');
  
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};
