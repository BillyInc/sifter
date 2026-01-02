// src/components/data-donation/quick-flag/VCQuickFlag.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { QuickFlagData, UserMode, VCPortfolioItem } from '@/types/dataDonation';

interface VCQuickFlagProps {
  entityName: string;
  context: string;
  vcPortfolioData?: VCPortfolioItem[];
  onSubmit: (data: QuickFlagData) => Promise<void>;
  onCancel?: () => void;
  onEvidenceCountChange?: (count: number) => void;
  onConfidentialToggle?: (confidential: boolean) => void;
  onPortfolioSelect?: (portfolioItems: string[]) => void;
}

export default function VCQuickFlag({
  entityName,
  context,
  vcPortfolioData = [],
  onSubmit,
  onCancel,
  onEvidenceCountChange,
  onConfidentialToggle,
   onPortfolioSelect
}: VCQuickFlagProps) {
  const [severity, setSeverity] = useState<'critical' | 'high' | 'medium'>('high');
  const [portfolioContext, setPortfolioContext] = useState('');
  const [reason, setReason] = useState('');
  const [confidential, setConfidential] = useState(true);
  const [selectedPortfolioItems, setSelectedPortfolioItems] = useState<string[]>([]);
  const [dueDiligenceLevel, setDueDiligenceLevel] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [evidenceLinks, setEvidenceLinks] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update evidence count
  useEffect(() => {
    const count = evidenceLinks.filter(link => link.trim() !== '').length;
    onEvidenceCountChange?.(count);
  }, [evidenceLinks, onEvidenceCountChange]);

  // Update confidential setting
  useEffect(() => {
    onConfidentialToggle?.(confidential);
  }, [confidential, onConfidentialToggle]);

  // Update portfolio selection
  useEffect(() => {
    onPortfolioSelect?.(selectedPortfolioItems);
  }, [selectedPortfolioItems, onPortfolioSelect]);

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

  const togglePortfolioItem = (item: VCPortfolioItem) => {
    const itemId = `${item.projectName}-${item.fund}`;
    setSelectedPortfolioItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        entityName,
        context,
        mode: 'ea-vc' as UserMode,
        severity,
        reason: reason.trim() || undefined,
        portfolioContext: portfolioContext.trim() || undefined,
        points: 50 // VC gets 50 points for quick flags
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
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
          <span className="text-xl">🏢</span>
        </div>
        <div>
          <h3 className="font-bold text-white">VC Quick Flag</h3>
          <p className="text-sm text-blue-300">Quickly flag for portfolio review</p>
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

        {/* Due Diligence Level */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Due Diligence Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'quick', label: '🚀 Quick Review', description: 'Initial screening' },
              { id: 'standard', label: '📊 Standard DD', description: 'Basic due diligence' },
              { id: 'deep', label: '🔍 Deep DD', description: 'Comprehensive analysis' }
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setDueDiligenceLevel(option.id as any)}
                className={`p-3 border rounded-lg text-sm text-left transition-all ${
                  dueDiligenceLevel === option.id
                    ? 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                    : 'border-sifter-border text-gray-400 hover:border-blue-500/50 hover:bg-blue-500/10'
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
                    : 'border-sifter-border text-gray-400 hover:border-blue-500/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Confidential Setting */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="block text-sm text-gray-400">
                Confidential Report
              </label>
              <p className="text-xs text-gray-500">
                Only visible to verified VCs and researchers
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfidential(!confidential)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                confidential ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  confidential ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-blue-400 mb-3">
            {confidential 
              ? '🔒 Report will be kept confidential' 
              : '🌐 Report will be publicly visible'}
          </p>
        </div>

        {/* Portfolio Context */}
        {vcPortfolioData.length > 0 && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Portfolio Context
            </label>
            <div className="space-y-2">
              {vcPortfolioData.map((item, index) => {
                const itemId = `${item.projectName}-${item.fund}`;
                const isSelected = selectedPortfolioItems.includes(itemId);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => togglePortfolioItem(item)}
                    className={`w-full p-3 border rounded-lg text-left transition-all ${
                      isSelected
                        ? 'bg-blue-500/20 border-blue-500/30'
                        : 'border-sifter-border hover:border-blue-500/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-white">{item.projectName}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {item.fund} • {item.investmentAmount} • {item.status}
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                        isSelected 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-500'
                      }`}>
                        {isSelected && '✓'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {selectedPortfolioItems.length} portfolio item(s) selected
            </p>
          </div>
        )}

        {/* Evidence Links */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm text-gray-400">
              Evidence Links
            </label>
            <button
              type="button"
              onClick={handleAddEvidenceLink}
              className="text-xs text-blue-400 hover:text-blue-300"
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
                className="flex-1 p-2 bg-sifter-dark border border-sifter-border rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
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

        {/* Reason */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Due Diligence Findings
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
            placeholder="Key findings from your due diligence. e.g., 'Team background verification issues...'"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            Share insights that other VCs should know
          </p>
        </div>

        {/* Portfolio Context Text */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Additional Context (Optional)
          </label>
          <input
            type="text"
            value={portfolioContext}
            onChange={(e) => setPortfolioContext(e.target.value)}
            className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
            placeholder="e.g., 'Considering for Fund III' or 'Current portfolio company'"
          />
        </div>

        {/* Points Info */}
        <div className="p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">Points Earned</div>
            <div className="text-lg font-bold text-amber-400">50</div>
          </div>
          <div className="text-xs text-blue-400 mt-1">
            🏢 VC Mode: {dueDiligenceLevel === 'deep' ? 'Deep Due Diligence (Bonus)' : 
                       dueDiligenceLevel === 'standard' ? 'Standard Due Diligence' : 'Quick Review'}
          </div>
          <div className="text-xs text-blue-300 mt-1">
            {confidential ? '🔒 Confidential Report' : '🌐 Public Report'} • 
            {selectedPortfolioItems.length > 0 ? ` 📊 ${selectedPortfolioItems.length} portfolio links` : ''}
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
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
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
                🚩 Quick Flag
                <span className="text-xs bg-white/20 px-2 py-1 rounded">50 pts</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}