// src/components/data-donation/modes/IndividualSubmissionEnhancements.tsx
'use client';

import React, { useState } from 'react';

interface IndividualSubmissionEnhancementsProps {
  onTemplateSelect: (template: string) => void;
  onExperienceShare: (experience: string) => void;
}

export default function IndividualSubmissionEnhancements({
  onTemplateSelect,
  onExperienceShare
}: IndividualSubmissionEnhancementsProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [personalExperience, setPersonalExperience] = useState('');
  
  const templates = [
    { id: 'scam-report', name: 'Scam Report', description: 'Standard scam reporting template' },
    { id: 'rug-pull', name: 'Rug Pull', description: 'For documenting rug pulls' },
    { id: 'fake-credentials', name: 'Fake Credentials', description: 'False claims or impersonation' },
    { id: 'wash-trading', name: 'Wash Trading', description: 'Market manipulation evidence' },
  ];

  return (
    <div className="space-y-4 mt-4">
      {/* Template Selection */}
      <div className="p-4 border border-green-500/30 rounded-xl bg-green-500/10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-green-400">📄</span>
          <span className="font-medium text-white">Report Template</span>
          <span className="text-xs bg-green-500/30 text-green-300 px-2 py-1 rounded">Optional</span>
        </div>
        
        <p className="text-sm text-gray-400 mb-3">
          Select a template to guide your report (recommended for first-time submitters)
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => {
                setSelectedTemplate(template.id);
                onTemplateSelect(template.id);
              }}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedTemplate === template.id
                  ? 'border-green-500 bg-green-500/20'
                  : 'border-gray-700 hover:border-green-500/50'
              }`}
            >
              <div className="font-medium text-white mb-1">{template.name}</div>
              <div className="text-xs text-gray-400">{template.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Experience */}
      <div className="p-4 border border-green-500/30 rounded-xl bg-green-500/10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-green-400">👤</span>
          <span className="font-medium text-white">Personal Experience</span>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Share Your Experience (Optional)
          </label>
          <textarea
            value={personalExperience}
            onChange={(e) => {
              setPersonalExperience(e.target.value);
              onExperienceShare(e.target.value);
            }}
            className="w-full p-3 bg-sifter-dark border border-green-500/30 rounded-lg text-white 
                     focus:border-green-500 focus:outline-none"
            placeholder="Describe your personal experience with this entity. What happened? How were you affected?"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-2">
            This helps our team understand the human impact. Your experience will be anonymized.
          </p>
        </div>
      </div>

      {/* Social Media Integration */}
      <div className="p-4 border border-green-500/30 rounded-xl bg-green-500/10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-green-400">🔗</span>
          <span className="font-medium text-white">Social Media Evidence</span>
        </div>
        
        <p className="text-sm text-gray-400 mb-3">
          Quickly capture social media evidence (public posts only)
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <button className="p-3 border border-gray-700 rounded-lg hover:border-green-500/50 
                   flex items-center justify-center gap-2 text-gray-300 hover:text-white">
            <span>🐦</span>
            <span>Twitter/X</span>
          </button>
          <button className="p-3 border border-gray-700 rounded-lg hover:border-green-500/50 
                   flex items-center justify-center gap-2 text-gray-300 hover:text-white">
            <span>👾</span>
            <span>Reddit</span>
          </button>
        </div>
      </div>

      {/* Individual-Specific Evidence Requirements */}
      <div className="p-4 border border-green-500/30 rounded-xl bg-gray-900/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-amber-400">📋</span>
          <span className="font-medium text-white">Individual Evidence Requirements</span>
        </div>
        <ul className="text-sm text-gray-300 space-y-1">
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Minimum 2 evidence sources required</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Public evidence only (no confidential info)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Templates available for guidance</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">💎</span>
            <span>1x points multiplier (community rate)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}