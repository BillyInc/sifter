// src/components/data-donation/ModeEvidenceRequirements.tsx
'use client';

import React from 'react';
import { MODE_CONFIGS, UserMode } from '@/types/dataDonation';

interface ModeEvidenceRequirementsProps {
  mode: UserMode;
  currentTier: 'quick' | 'standard' | 'full';
  currentEvidenceCount: number;
}

export default function ModeEvidenceRequirements({
  mode,
  currentTier,
  currentEvidenceCount
}: ModeEvidenceRequirementsProps) {
  const config = MODE_CONFIGS[mode];
  const minRequired = config.minEvidenceRequired;
  const hasEnoughEvidence = currentEvidenceCount >= minRequired;
  
  const getTierRequirements = () => {
    switch (currentTier) {
      case 'quick':
        return {
          title: 'Quick Flag Requirements',
          description: 'Optional evidence for investigation flag',
          evidenceNeeded: '0+ pieces (optional)',
          color: 'text-blue-400'
        };
      case 'standard':
        return {
          title: 'Standard Report Requirements',
          description: 'Basic evidence for standard review',
          evidenceNeeded: `Minimum ${minRequired} pieces required`,
          color: hasEnoughEvidence ? 'text-green-400' : 'text-amber-400'
        };
      case 'full':
        return {
          title: 'Full Donation Requirements',
          description: 'Complete evidence package',
          evidenceNeeded: `Minimum ${minRequired} pieces required`,
          color: hasEnoughEvidence ? 'text-green-400' : 'text-red-400'
        };
    }
  };

  const requirements = getTierRequirements();

  return (
    <div className="p-4 border rounded-xl mb-4 bg-sifter-dark/50">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className={`font-medium ${requirements.color}`}>
            {requirements.title}
          </h4>
          <p className="text-sm text-sifter-text-muted">{requirements.description}</p>
        </div>
        <div className={`text-right ${requirements.color}`}>
          <div className="text-lg font-bold">
            {currentEvidenceCount}/{minRequired}
          </div>
          <div className="text-xs">Evidence Pieces</div>
        </div>
      </div>
      
      {/* Evidence Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-sifter-text-muted mb-1">
          <span>Progress</span>
          <span>{currentEvidenceCount} of {minRequired}</span>
        </div>
        <div className="w-full bg-sifter-elevated rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              hasEnoughEvidence ? 'bg-green-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, (currentEvidenceCount / minRequired) * 100)}%` }}
          />
        </div>
      </div>
      
      {/* Allowed Evidence Types */}
      <div className="mt-4">
        <div className="text-sm text-sifter-text-muted mb-2">Allowed Evidence Types:</div>
        <div className="flex flex-wrap gap-2">
          {config.allowedEvidenceTypes.slice(0, 5).map((type) => (
            <span 
              key={type}
              className="px-2 py-1 bg-sifter-elevated/50 text-sifter-text text-xs rounded border border-sifter-border"
            >
              {type.replace('_', ' ')}
            </span>
          ))}
          {config.allowedEvidenceTypes.length > 5 && (
            <span className="px-2 py-1 text-sifter-text-subtle text-xs">
              +{config.allowedEvidenceTypes.length - 5} more
            </span>
          )}
        </div>
      </div>
      
      {/* Mode-Specific Notes */}
      <div className="mt-4 text-xs text-sifter-text-muted">
        {mode === 'ea-vc' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-blue-400"> VC Mode:</span>
              <span>Requires financial/legal documentation</span>
            </div>
            <div className="pl-6">
              • Minimum 4 verifiable sources
              <br />
              • Confidential uploads allowed
              <br />
              • Portfolio context recommended
            </div>
          </>
        )}
        
        {mode === 'researcher' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-purple-400"> Researcher Mode:</span>
              <span>Requires analytical methodology</span>
            </div>
            <div className="pl-6">
              • Minimum 3 data-driven sources
              <br />
              • Methodology documentation required
              <br />
              • Pattern analysis recommended
            </div>
          </>
        )}
        
        {mode === 'individual' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-green-400"> Individual Mode:</span>
              <span>Public evidence only</span>
            </div>
            <div className="pl-6">
              • Minimum 2 public sources
              <br />
              • No confidential information
              <br />
              • Template guidance available
            </div>
          </>
        )}
      </div>
      
      {/* Warning if insufficient */}
      {!hasEnoughEvidence && currentTier !== 'quick' && (
        <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-xs"> Need {minRequired - currentEvidenceCount} more evidence pieces for submission
        </div>
      )}
    </div>
  );
}