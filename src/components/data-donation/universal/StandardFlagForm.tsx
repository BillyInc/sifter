'use client';

import React, { useState } from 'react';

export interface StandardFlagFormProps {
  entityData: string[]; // [entityName, entityType, projectName, riskScore, context]
  userData: string[]; // [userId, userEmail, userMode, userName]
  onSubmit: (flagData: any[]) => void;
  onCancel: () => void;
  showQuickActions?: boolean;
  onEvidenceCountChange?: (count: number) => void;  // ← ADD THIS

}

export default function StandardFlagForm({
  entityData = ['', '', '', '', ''],
  userData = ['', '', '', ''],
  onSubmit,
  onCancel,
  showQuickActions = true
}: StandardFlagFormProps) {
  const [view, setView] = useState<'quick' | 'detailed'>(showQuickActions ? 'quick' : 'detailed');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('high');
  
  // Unpack data
  const [entityName, entityType, projectName, riskScore, context] = entityData;
  const [userId, userEmail, userMode, userName] = userData;
  
  // Quick flag options
  const quickOptions = [
    {
      id: 'scam-promotion',
      label: 'Scam Promotion',
      description: 'Promoting known scams or fraudulent projects',
      points: 500,
      icon: '🚨'
    },
    {
      id: 'fake-credentials',
      label: 'Fake Credentials',
      description: 'False credentials, experience, or partnerships',
      points: 300,
      icon: '🎭'
    },
    {
      id: 'rug-association',
      label: 'Rug Pull Association',
      description: 'Directly associated with past rug pulls',
      points: 750,
      icon: '💸'
    },
    {
      id: 'wash-trading',
      label: 'Wash Trading',
      description: 'Engaging in wash trading or fake volume',
      points: 400,
      icon: '🔄'
    },
    {
      id: 'impersonation',
      label: 'Impersonation',
      description: 'Impersonating legitimate entities or people',
      points: 600,
      icon: '👤'
    },
    {
      id: 'artificial-hype',
      label: 'Artificial Hype',
      description: 'Creating fake engagement or hype',
      points: 250,
      icon: '📈'
    }
  ];

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [customDescription, setCustomDescription] = useState('');
  const [evidenceLinks, setEvidenceLinks] = useState<string[]>(['']);

  // Handle quick flag selection
  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  // Handle evidence link changes
  const handleEvidenceLinkChange = (index: number, value: string) => {
    const newLinks = [...evidenceLinks];
    newLinks[index] = value;
    setEvidenceLinks(newLinks);
  };

  const handleAddEvidenceLink = () => {
    setEvidenceLinks([...evidenceLinks, '']);
  };

  const handleRemoveEvidenceLink = (index: number) => {
    if (evidenceLinks.length > 1) {
      const newLinks = evidenceLinks.filter((_, i) => i !== index);
      setEvidenceLinks(newLinks);
    }
  };

  // Calculate total points
  const calculateTotalPoints = () => {
    let total = 0;
    selectedOptions.forEach(optionId => {
      const option = quickOptions.find(opt => opt.id === optionId);
      if (option) total += option.points;
    });
    
    // Add bonus for custom description
    if (customDescription.trim().length > 50) total += 100;
    
    // Add bonus for evidence links
    const validLinks = evidenceLinks.filter(link => link.trim());
    total += validLinks.length * 50;
    
    return total;
  };

  // Handle submission
  const handleSubmit = async (isQuick: boolean) => {
    setIsSubmitting(true);
    
    try {
      // Prepare flag data in array format
      const flagData = [
        // Basic info
        entityName,
        entityType,
        projectName,
        riskScore,
        context,
        
        // User info
        userId,
        userEmail,
        userMode,
        userName,
        
        // Flag details
        isQuick ? 'quick' : 'detailed',
        selectedSeverity,
        selectedOptions,
        customDescription,
        evidenceLinks.filter(link => link.trim()),
        
        // Points and metadata
        calculateTotalPoints(),
        new Date().toISOString(),
        `FLAG-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`
      ];
      
      await onSubmit(flagData);
    } catch (error) {
      console.error('Flag submission failed:', error);
      alert('Failed to submit flag. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Severity options
  const severityOptions = [
    { id: 'critical', label: 'Critical', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '🔥' },
    { id: 'high', label: 'High', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: '⚠️' },
    { id: 'medium', label: 'Medium', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: '🚩' },
    { id: 'low', label: 'Low', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '📌' }
  ];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-sifter-card border border-sifter-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-sifter-card/95 backdrop-blur-sm border-b border-sifter-border p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Flag Entity</h2>
                <p className="text-sm text-gray-400">
                  Entity: <span className="text-red-400 font-medium">{entityName}</span>
                  {projectName && ` • Project: ${projectName}`}
                </p>
              </div>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* View Toggle */}
            {showQuickActions && (
              <div className="mt-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setView('quick')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      view === 'quick'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-sifter-dark text-gray-400 hover:text-white'
                    }`}
                  >
                    🚀 Quick Flag
                  </button>
                  <button
                    onClick={() => setView('detailed')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      view === 'detailed'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-sifter-dark text-gray-400 hover:text-white'
                    }`}
                  >
                    🔍 Detailed Report
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Entity Info Summary */}
            <div className="mb-8 p-4 bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/30 rounded-xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Entity Name</div>
                  <div className="text-white font-medium truncate">{entityName || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Entity Type</div>
                  <div className="text-white font-medium">{entityType || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Risk Score</div>
                  <div className={`font-bold ${
                    parseInt(riskScore) > 80 ? 'text-red-400' :
                    parseInt(riskScore) > 60 ? 'text-orange-400' :
                    parseInt(riskScore) > 40 ? 'text-amber-400' :
                    'text-green-400'
                  }`}>
                    {riskScore || '0'}/100
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Context</div>
                  <div className="text-white font-medium truncate">{context || 'General flagging'}</div>
                </div>
              </div>
            </div>

            {/* Quick Flag View */}
            {view === 'quick' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Quick Flag Options</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Select one or more reasons for flagging this entity. Each selection adds to your points.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickOptions.map((option) => (
                      <div
                        key={option.id}
                        onClick={() => handleOptionToggle(option.id)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${
                          selectedOptions.includes(option.id)
                            ? 'border-blue-500 bg-gradient-to-r from-blue-500/10 to-blue-600/10'
                            : 'border-sifter-border hover:border-blue-500/50 hover:bg-sifter-dark/30'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{option.icon}</div>
                            <div>
                              <h4 className="font-medium text-white">{option.label}</h4>
                              <p className="text-sm text-gray-400 mt-1">{option.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-amber-400 font-bold">+{option.points}</div>
                            <div className="text-xs text-gray-500">Points</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Severity Selection */}
                <div>
                  <h4 className="font-medium text-white mb-3">Severity Level</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {severityOptions.map((severity) => (
                      <button
                        key={severity.id}
                        type="button"
                        onClick={() => setSelectedSeverity(severity.id)}
                        className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-all ${
                          selectedSeverity === severity.id
                            ? `${severity.color} border-2`
                            : 'border-sifter-border hover:border-blue-500/50'
                        }`}
                      >
                        <span className="text-2xl mb-2">{severity.icon}</span>
                        <span className="text-sm">{severity.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Report View */}
            {view === 'detailed' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Detailed Report</h3>
                  <p className="text-sm text-gray-400">
                    Provide a comprehensive report with evidence and context.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Detailed Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    className="w-full p-4 bg-sifter-dark border border-sifter-border rounded-lg text-white min-h-[150px] focus:border-blue-500 focus:outline-none"
                    placeholder="Provide a detailed explanation of why this entity should be flagged. Include specific incidents, dates, and impacts..."
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Minimum 100 characters recommended. Current: {customDescription.length}
                  </div>
                </div>

                {/* Evidence Links */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm text-gray-400">
                      Evidence Links <span className="text-red-400">*</span>
                    </label>
                    <span className="text-xs text-gray-500">
                      {evidenceLinks.filter(link => link.trim()).length} links added
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {evidenceLinks.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="url"
                          value={link}
                          onChange={(e) => handleEvidenceLinkChange(index, e.target.value)}
                          className="flex-1 p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          placeholder={`Evidence link #${index + 1} (Twitter, Reddit, news article, etc.)`}
                          required={index === 0}
                        />
                        {evidenceLinks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEvidenceLink(index)}
                            className="px-4 py-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-lg"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={handleAddEvidenceLink}
                      className="w-full p-3 border border-dashed border-sifter-border rounded-lg text-gray-400 hover:text-white hover:border-blue-500 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Another Evidence Link
                    </button>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-500">
                    ⚠️ Links must be publicly accessible (Twitter, Reddit, news sites, etc.)
                  </div>
                </div>

                {/* Severity Selection */}
                <div>
                  <h4 className="font-medium text-white mb-3">Severity Assessment</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {severityOptions.map((severity) => (
                      <button
                        key={severity.id}
                        type="button"
                        onClick={() => setSelectedSeverity(severity.id)}
                        className={`p-4 border rounded-xl flex flex-col items-center justify-center transition-all ${
                          selectedSeverity === severity.id
                            ? `${severity.color} border-2`
                            : 'border-sifter-border hover:border-blue-500/50'
                        }`}
                      >
                        <span className="text-3xl mb-2">{severity.icon}</span>
                        <span className="font-medium">{severity.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Points Summary */}
            <div className="mt-8 p-4 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-400">Estimated Points Earned</div>
                  <div className="text-2xl font-bold text-amber-400">{calculateTotalPoints()} points</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Mode Bonus</div>
                  <div className="text-lg font-medium text-white">
                    {userMode === 'ea-vc' ? '3x' : userMode === 'researcher' ? '2x' : '1x'} Multiplier
                  </div>
                </div>
              </div>
              
              {selectedOptions.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-gray-400 mb-2">Selected Flags:</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedOptions.map(optionId => {
                      const option = quickOptions.find(opt => opt.id === optionId);
                      return option ? (
                        <span key={optionId} className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-sm">
                          {option.icon} {option.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4 justify-end">
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              
              {view === 'quick' ? (
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting || selectedOptions.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
                           text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-white inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    `Quick Flag (${calculateTotalPoints()} points)`
                  )}
                </button>
              ) : (
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting || !customDescription.trim() || evidenceLinks.filter(l => l.trim()).length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                           text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-white inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    `Submit Detailed Report (${calculateTotalPoints()} points)`
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}