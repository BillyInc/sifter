// src/components/data-donation/modes/VCSubmissionEnhancements.tsx
'use client';

import React, { useState } from 'react';
import { VCPortfolioItem } from '@/types/datadonation';

interface VCSubmissionEnhancementsProps {
  portfolioData?: VCPortfolioItem[];
  onConfidentialToggle: (isConfidential: boolean) => void;
  onPortfolioSelect: (portfolioItems: string[]) => void;
}

export default function VCSubmissionEnhancements({
  portfolioData = [],
  onConfidentialToggle,
  onPortfolioSelect
}: VCSubmissionEnhancementsProps) {
  const [isConfidential, setIsConfidential] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string[]>([]);
  
  const handleConfidentialToggle = (checked: boolean) => {
    setIsConfidential(checked);
    onConfidentialToggle(checked);
  };
  
  const handlePortfolioToggle = (portfolioId: string) => {
    const newSelected = selectedPortfolio.includes(portfolioId)
      ? selectedPortfolio.filter(id => id !== portfolioId)
      : [...selectedPortfolio, portfolioId];
    
    setSelectedPortfolio(newSelected);
    onPortfolioSelect(newSelected);
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Confidential Upload Option */}
      <div className="p-4 border border-blue-500/30 rounded-xl bg-blue-500/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-blue-400">🔒</span>
            <span className="font-medium text-white">Confidential Submission</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isConfidential}
              onChange={(e) => handleConfidentialToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer 
                         peer-checked:after:translate-x-full peer-checked:after:border-white 
                         after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                         after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                         peer-checked:bg-blue-600">
            </div>
          </label>
        </div>
        <p className="text-sm text-blue-300">
          When enabled: Evidence is encrypted, visible only to Sifter admins, 
          and subject to NDA protections. Required for legal/financial documents.
        </p>
      </div>

      {/* Portfolio Context */}
      {portfolioData.length > 0 && (
        <div className="p-4 border border-blue-500/30 rounded-xl bg-blue-500/10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-blue-400">🏢</span>
            <span className="font-medium text-white">Portfolio Context</span>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            Link this submission to relevant portfolio projects (optional but recommended)
          </p>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {portfolioData.map((item) => (
              <div
                key={item.id}
                onClick={() => handlePortfolioToggle(item.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedPortfolio.includes(item.id)
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-700 hover:border-blue-500/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-white">{item.name}</div>
                    <div className="text-xs text-gray-400">
                      {item.status} • Added {item.dateAdded}
                      {item.investedAmount && ` • $${item.investedAmount.toLocaleString()}`}
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded border ${
                    selectedPortfolio.includes(item.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-600'
                  }`}>
                    {selectedPortfolio.includes(item.id) && (
                      <div className="w-full h-full flex items-center justify-center text-xs text-white">✓</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VC-Specific Evidence Requirements */}
      <div className="p-4 border border-blue-500/30 rounded-xl bg-gray-900/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-amber-400">📋</span>
          <span className="font-medium text-white">VC Evidence Requirements</span>
        </div>
        <ul className="text-sm text-gray-300 space-y-1">
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Minimum 4 evidence sources required</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>At least 1 financial/legal document</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Portfolio context strongly recommended</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-400">💎</span>
            <span>5x points multiplier applied</span>
          </li>
        </ul>
      </div>
    </div>
  );
}