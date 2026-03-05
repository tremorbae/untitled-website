'use client';

import { useEffect } from 'react';

export default function JsonLd() {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Schizostimmys",
      "description": "Join the Schizostimmys network - a generative NFT collection launching June 2026 on Ethereum. Sign up for phase 3 whitelist now. Limited spots available.",
      "url": "https://schizostimmys.xyz",
      "image": "https://schizostimmys.xyz/ss logo.png",
      "creator": {
        "@type": "Organization",
        "name": "Schizostimmys",
        "url": "https://schizostimmys.xyz"
      },
      "potentialAction": {
        "@type": "InteractAction",
        "target": "https://schizostimmys.xyz",
        "name": "Join Phase 3 Whitelist"
      },
      "mainEntity": {
        "@type": "CreativeWork",
        "name": "Schizostimmys",
        "description": "Generative NFT collection on Ethereum",
        "dateCreated": "2026-06-01",
        "genre": ["Digital Art", "NFT", "Generative Art"],
        "keywords": "NFT, Ethereum, generative art, crypto art, blockchain, digital collectibles"
      }
    });
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}
