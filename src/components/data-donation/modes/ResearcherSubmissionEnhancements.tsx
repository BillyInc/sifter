// src/components/data-donation/modes/ResearcherSubmissionEnhancements.tsx
'use client';

import React, { useState } from 'react';

interface ResearcherSubmissionEnhancementsProps {
  onMethodologyChange: (methodology: string) => void;
  onPatternAnalysisChange: (analysis: string) => void;
}

export default function ResearcherSubmissionEnhancements({
  onMethodologyChange,
  onPatternAnalysisChange
}: ResearcherSubmissionEnhancementsProps) {
  const [methodology, setMethodology] = useState('');
  const [patternAnalysis, setPatternAnalysis] = useState('');

  return (
    <div className="space-y-4 mt-4">
      {/* Methodology Documentation */}
      <div className="p-4 border border-purple-500/30 rounded-xl bg-purple-500/10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-purple-400">📊</span>
          <span className="font-medium text-white">Research Methodology</span>
          <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded">Required</span>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Methodology Description *
            </label>
            <textarea
              value={methodology}
              onChange={(e) => {
                setMethodology(e.target.value);
                onMethodologyChange(e.target.value);
              }}
              className="w-full p-3 bg-sifter-dark border border-purple-500/30 rounded-lg text-white 
                       focus:border-purple-500 focus:outline-none"
              placeholder="Describe your research methodology, data sources, and analytical approach..."
              rows={4}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Analysis Tools Used
              </label>
              <select className="w-full p-2 bg-sifter-dark border border-purple-500/30 rounded-lg text-white">
                <option>On-chain analysis</option>
                <option>Social graph mapping</option>
                <option>Pattern recognition</option>
                <option>Statistical analysis</option>
                <option>Cross-referencing</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Data Sources
              </label>
              <select multiple className="w-full p-2 bg-sifter-dark border border-purple-500/30 rounded-lg text-white">
                <option>Blockchain data</option>
                <option>Social media</option>
                <option>News articles</option>
                <option>Academic papers</option>
                <option>Public databases</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Analysis */}
      <div className="p-4 border border-purple-500/30 rounded-xl bg-purple-500/10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-purple-400">🔍</span>
          <span className="font-medium text-white">Pattern Analysis</span>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Pattern Recognition Notes (Optional)
          </label>
          <textarea
            value={patternAnalysis}
            onChange={(e) => {
              setPatternAnalysis(e.target.value);
              onPatternAnalysisChange(e.target.value);
            }}
            className="w-full p-3 bg-sifter-dark border border-purple-500/30 rounded-lg text-white 
                     focus:border-purple-500 focus:outline-none"
            placeholder="Note any patterns, recurring signatures, or connections to known entities..."
            rows={3}
          />
        </div>
      </div>

      {/* Researcher-Specific Evidence Requirements */}
      <div className="p-4 border border-purple-500/30 rounded-xl bg-gray-900/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-amber-400">📋</span>
          <span className="font-medium text-white">Researcher Evidence Requirements</span>
        </div>
        <ul className="text-sm text-gray-300 space-y-1">
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Minimum 3 evidence sources required</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Methodology documentation required</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Data-driven analysis preferred</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-purple-400">💎</span>
            <span>3x points multiplier applied</span>
          </li>
        </ul>
      </div>
    </div>
  );
}