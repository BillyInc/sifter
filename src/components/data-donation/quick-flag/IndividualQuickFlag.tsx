// src/components/data-donation/quick-flag/IndividualQuickFlag.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { QuickFlagData, UserMode } from '@/types/dataDonation';

interface IndividualQuickFlagProps {
  entityName: string;
  context: string;
  onSubmit: (data: QuickFlagData) => Promise<void>;
  onCancel?: () => void;
  onEvidenceCountChange?: (count: number) => void;
  onTemplateSelect?: (template: string) => void;
  onExperienceShare?: (experience: string) => void;
}

export default function IndividualQuickFlag({
  entityName,
  context,
  onSubmit,
  onCancel,
  onEvidenceCountChange,
  onTemplateSelect,
  onExperienceShare
}: IndividualQuickFlagProps) {
  const [reason, setReason] = useState('');
  const [severity, setSeverity] = useState<'critical' | 'high' | 'medium'>('medium');
  const [template, setTemplate] = useState('');
  const [personalExperience, setPersonalExperience] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evidenceLinks, setEvidenceLinks] = useState<string[]>(['']);

  // Template options for individual users
  const templateOptions = [
    { id: 'scam-experience', label: '🕵️ Scam Experience', description: 'Personal scam encounter' },
    { id: 'community-warning', label: '📢 Community Warning', description: 'Warning others in community' },
    { id: 'project-review', label: '📝 Project Review', description: 'Detailed project analysis' },
    { id: 'social-media', label: '📱 Social Media', description: 'Suspicious social media activity' },
    { id: 'other', label: '🔍 Other', description: 'Custom template' }
  ];

  // Update evidence count
  useEffect(() => {
    const count = evidenceLinks.filter(link => link.trim() !== '').length;
    onEvidenceCountChange?.(count);
  }, [evidenceLinks, onEvidenceCountChange]);

  // Update template selection
  useEffect(() => {
    onTemplateSelect?.(template);
  }, [template, onTemplateSelect]);

  // Update experience
  useEffect(() => {
    onExperienceShare?.(personalExperience);
  }, [personalExperience, onExperienceShare]);

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
        mode: 'individual' as UserMode,
        severity,
        reason: reason.trim() || undefined,
        methodologyNotes: personalExperience.trim() || undefined,
        points: 10 // Individuals get 10 points for quick flags
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
        <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
          <span className="text-xl">👤</span>
        </div>
        <div>
          <h3 className="font-bold text-white">Quick Flag</h3>
          <p className="text-sm text-green-300">Quickly report this entity</p>
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

        {/* Template Selection */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Select Template Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {templateOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setTemplate(option.id)}
                className={`p-3 border rounded-lg text-sm text-left transition-all ${
                  template === option.id
                    ? 'bg-green-500/20 border-green-500/30 text-green-300'
                    : 'border-sifter-border text-gray-400 hover:border-green-500/50 hover:bg-green-500/10'
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
                    : 'border-sifter-border text-gray-400 hover:border-green-500/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Evidence Links */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm text-gray-400">
              Evidence Links (Optional)
            </label>
            <button
              type="button"
              onClick={handleAddEvidenceLink}
              className="text-xs text-green-400 hover:text-green-300"
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
                className="flex-1 p-2 bg-sifter-dark border border-sifter-border rounded-lg text-white text-sm focus:border-green-500 focus:outline-none"
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

        {/* Personal Experience */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Your Experience (Optional)
          </label>
          <textarea
            value={personalExperience}
            onChange={(e) => setPersonalExperience(e.target.value)}
            className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-green-500 focus:outline-none"
            placeholder="Share your personal experience with this entity..."
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            This helps the community understand real-world impacts
          </p>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Brief Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-green-500 focus:outline-none"
            placeholder="Why are you flagging this entity?"
            rows={2}
          />
        </div>

        {/* Points Info */}
        <div className="p-3 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">Points Earned</div>
            <div className="text-lg font-bold text-amber-400">10</div>
          </div>
          <div className="text-xs text-green-400 mt-1">
            ⭐ Community Contribution: Share your experience to help others
          </div>
          {template && (
            <div className="text-xs text-green-300 mt-1">
              📝 Template: {templateOptions.find(t => t.id === template)?.label}
            </div>
          )}
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
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
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
                <span className="text-xs bg-white/20 px-2 py-1 rounded">10 pts</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}