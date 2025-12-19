// src/components/evidence/VerificationDemo.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface VerificationDemoProps {
  evidenceId: string;
}

export default function VerificationDemo({ evidenceId }: VerificationDemoProps) {
  const [verificationStep, setVerificationStep] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [results, setResults] = useState({
    original: false,
    archive: false,
    screenshot: false,
    ipfs: false
  });

  const verificationSteps = [
    {
      name: 'Original URL',
      description: 'Checking if the original link is accessible',
      icon: '🔗',
      key: 'original'
    },
    {
      name: 'Archive.org',
      description: 'Verifying Wayback Machine archive',
      icon: '📚',
      key: 'archive'
    },
    {
      name: 'Screenshot',
      description: 'Checking stored screenshot',
      icon: '🖼️',
      key: 'screenshot'
    },
    {
      name: 'IPFS',
      description: 'Verifying IPFS pin',
      icon: '🌐',
      key: 'ipfs'
    }
  ];

 