// BatchFlagButton.tsx
'use client';

import React from 'react';

interface BatchFlagButtonProps {
  projectName: string;
  entityName: string;
  riskScore: number;
  context: string;
  onFlag: (entityData: {
    entityName: string;
    projectName: string;
    context: string;
    riskScore?: number;
  }) => void;
}

export default function BatchFlagButton({
  projectName,
  entityName,
  riskScore,
  context,
  onFlag
}: BatchFlagButtonProps) {
  const handleClick = () => {
    onFlag({
      entityName,
      projectName,
      context,
      riskScore
    });
  };

  return (
    <button
      onClick={handleClick}
      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-sm transition-colors flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      Flag Entity
    </button>
  );
}
