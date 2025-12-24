// src/components/data-donation/quick-flag/ResearcherQuickFlag.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { QuickFlagData, UserMode } from '@/types/dataDonation';

interface ResearcherQuickFlagProps {
  entityName: string;
  context: string;
  onSubmit: (data: QuickFlagData) => Promise<void>;
  onCancel?: () => void;
  onEvidenceCountChange?: (count: number) => void;
  onMethodologyChange?: (methodology: string) => void;
  onPatternAnalysisChange?: (pattern: string) => void;
}

export default function ResearcherQuickFlag({
  entityName,
  context,
  onSubmit,
  onCancel,
  onEvidenceCountChange,
  onMethodologyChange,
  onPatternAnalysisChange
}: ResearcherQuickFlagProps) {
  const [severity, setSeverity] = useState<'critical' | 'high' | 'medium'>('high');
  const [methodology, setMethodology] = useState('');
  const [patternAnalysis, setPatternAnalysis] = useState('');
  const [dataSources, setDataSources] = useState<string[]>(['on-chain', 'social']);
  const [evidenceLinks, setEvidenceLinks] = useState<string[]>(['']);
  const [analysisDepth, setAnalysisDepth] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableDataSources = [
    'on-chain', 'social media', 'news', 'academic', 'forum', 'discord', 'telegram', 'github',
    'whitepaper', 'code audit', 'financial', 'legal', 'reputation'
  ];

  // Update evidence count
  useEffect(() => {
    const count = evidenceLinks.filter(link => link.trim() !== '').length;
    onEvidenceCountChange?.(count);
  }, [evidenceLinks, onEvidenceCountChange]);

  // Update methodology
  useEffect(() => {
    onMethodologyChange?.(methodology);
  }, [methodology, onMethodologyChange]);

  // Update pattern analysis
  useEffect(() => {
    onPatternAnalysisChange?.(patternAnalysis);
  }, [patternAnalysis, onPatternAnalysisChange]);

  const toggleDataSource = (source: string) => {
    setDataSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const handleAddEvidenceLink = () => {
    setEvidenceLinks([...evidenceLinks, '']);
  };

  const handleRemoveEvidenceLink = (index: number) => {
    const newLinks = [...evidenceLinks];
    newLinks.splice(index, 1);
    setEvidenceLinks(newLinks);
  };

  const handleEvidenceLinkChange = (index: number, value: string) => {
    const newLinks = [...evidenceLinks];
    newLinks[index] = value;
    setEvidenceLinks(newLinks);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        entityName,
        context,
        mode: 'researcher' as UserMode,
        severity,
        methodologyNotes: methodology.trim() || undefined,
        points: 30 // Researchers get 30 points for quick flags
      });
    } catch (error) {
      console.error('Quick flag submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validEvidenceLinks = evidenceLinks.filter(link => link.trim() !== '');

  return (
    <div className="bg-sifter-card border border-sifter-border rounded-xl p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
          <span className="text-xl">🔬</span>
        </div>
        <div>
          <h3 className="font-bold text-white">Researcher Quick Flag</h3>
          <p className="text-sm text-purple-300">Analytical flagging with methodology</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Entity Info */}
        <div className="p-3 bg-sifter-dark/50 border border-sifter-border rounded-lg">
          <div className="text-xs text-gray-400">Entity</div>
          <div className="font-medium text-white truncate">{entityName}</div>
          <div className="text-xs text-gray-400 mt-1">{context}</div>
        </div>

        {/* Analysis Depth */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Analysis Depth
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'quick', label: '🚀 Quick Scan', description: '5-10 min review' },
              { id: 'standard', label: '📊 Standard', description: '15-30 min analysis' },
              { id: 'deep', label: '🔍 Deep Dive', description: '1+ hour research' }
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setAnalysisDepth(option.id as any)}
                className={`p-3 border rounded-lg text-sm text-left transition-all ${
                  analysisDepth === option.id
                    ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                    : 'border-sifter-border text-gray-400 hover:border-purple-500/50 hover:bg-purple-500/10'
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-xs mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Severity Selection */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Severity Assessment
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'critical', label: '🔥 Critical', color: 'bg-red-500/20 border-red-500/30' },
              { id: 'high', label: '⚠️ High', color: 'bg-orange-500/20 border-orange-500/30' },
              { id: 'medium', label: '🚩 Medium', color: 'bg-amber-500/20 border-amber-500/30' }
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSeverity(option.id as any)}
                className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                  severity === option.id
                    ? `${option.color} text-white`
                    : 'border-sifter-border text-gray-400 hover:border-purple-500/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Data Sources Used
          </label>
          <div className="flex flex-wrap gap-2">
            {availableDataSources.map((source) => (
              <button
                key={source}
                type="button"
                onClick={() => toggleDataSource(source)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  dataSources.includes(source)
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                    : 'bg-gray-800/50 text-gray-400 border border-sifter-border hover:border-purple-500/50'
                }`}
              >
                {source}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Selected: {dataSources.join(', ')}
          </p>
        </div>

        {/* Evidence Links */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm text-gray-400">
              Evidence Links
            </label>
            <button
              type="button"
              onClick={handleAddEvidenceLink}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              + Add Link
            </button>
          </div>
          {evidenceLinks.map((link, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="url"
                value={link}
                onChange={(e) => handleEvidenceLinkChange(index, e.target.value)}
                className="flex-1 p-2 bg-sifter-dark border border-sifter-border rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                placeholder="https://example.com/evidence"
              />
              {evidenceLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveEvidenceLink(index)}
                  className="px-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <p className="text-xs text-gray-500 mt-1">
            {validEvidenceLinks.length} evidence link(s) added
          </p>
        </div>

        {/* Methodology */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Methodology & Approach
          </label>
          <textarea
            value={methodology}
            onChange={(e) => setMethodology(e.target.value)}
            className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-purple-500 focus:outline-none"
            placeholder="Describe your research methodology. e.g., 'Used on-chain analysis tools to track fund flows...'"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            Helps other researchers understand and verify your findings
          </p>
        </div>

        {/* Pattern Analysis */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Pattern Analysis
          </label>
          <textarea
            value={patternAnalysis}
            onChange={(e) => setPatternAnalysis(e.target.value)}
            className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-purple-500 focus:outline-none"
            placeholder="Patterns identified. e.g., 'Similar to rug pull pattern #3, shows same token distribution method...'"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            Compare with known patterns in the database
          </p>
        </div>

        {/* Points Info */}
        <div className="p-3 bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">Points Earned</div>
            <div className="text-lg font-bold text-amber-400">30</div>
          </div>
          <div className="text-xs text-purple-400 mt-1">
            🔬 Researcher Mode: {analysisDepth === 'deep' ? 'Deep Dive (Bonus)' : 
                               analysisDepth === 'standard' ? 'Standard Analysis' : 'Quick Scan'}
          </div>
          <div className="text-xs text-purple-300 mt-1">
            📊 Sources: {dataSources.length} data sources
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-sifter-border">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 
                     text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                🔬 Quick Flag
                <span className="text-xs bg-white/20 px-2 py-1 rounded">30 pts</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}