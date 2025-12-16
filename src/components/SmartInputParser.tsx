// components/SmartInputParser.tsx - FIXED VERSION
'use client';

import React, { useState } from 'react';
import { InputType, SmartInputResult, ResolvedEntity, PlatformType } from '@/types';

interface SmartInputParserProps {
  onResolve: (result: SmartInputResult) => void;
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
}

export default function SmartInputParser({ 
  onResolve, 
  placeholder, 
  disabled,
  compact = false
}: SmartInputParserProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedType, setDetectedType] = useState<InputType>('unknown');
  const [showDisambiguation, setShowDisambiguation] = useState(false);
  const [candidates, setCandidates] = useState<ResolvedEntity[]>([]);

  const detectInputType = (value: string): InputType => {
    const normalized = value.trim().toLowerCase();
    
    if (normalized.startsWith('@')) return 'twitter';
    if (normalized.includes('discord.gg/') || normalized.includes('discord.com/invite/')) return 'discord';
    if (normalized.includes('t.me/') || normalized.includes('telegram.me/')) return 'telegram';
    if (normalized.includes('github.com/')) return 'github';
    if (normalized.startsWith('http') || (normalized.includes('.') && !normalized.includes(' '))) return 'website';
    if (normalized.length > 2 && /^[a-zA-Z0-9\s]+$/.test(normalized)) return 'name';
    
    return 'unknown';
  };

  const convertInputTypeToPlatformType = (inputType: InputType): PlatformType => {
    switch (inputType) {
      case 'twitter': return 'twitter';
      case 'discord': return 'discord';
      case 'telegram': return 'telegram';
      case 'github': return 'github';
      case 'website': return 'website';
      case 'name': return 'name';
      default: return 'unknown';
    }
  };

  const resolveInput = async (value: string): Promise<ResolvedEntity[]> => {
    const type = detectInputType(value);
    setDetectedType(type);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const platformType = convertInputTypeToPlatformType(type);
    
    const mockCandidates: ResolvedEntity[] = [
      {
        id: `entity_${Date.now()}_1`,
        canonicalName: value.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        displayName: value,
        platform: platformType,
        url: getPlatformUrl(type, value),
        confidence: 85,
        alternativeNames: [value, value.replace(/\s+/g, '')],
        crossReferences: [],
        metadata: {
          followers: type === 'twitter' || type === 'name' ? 10000 : undefined,
          members: type === 'discord' ? 5000 : undefined,
          stars: type === 'github' ? 250 : undefined,
          description: `Mock ${type} project`
        }
      }
    ];
    
    // Add second candidate sometimes for disambiguation demo
    if (Math.random() > 0.5 && type === 'name') {
      mockCandidates.push({
        id: `entity_${Date.now()}_2`,
        canonicalName: `${value.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v2`,
        displayName: `${value} V2`,
        platform: platformType,
        url: getPlatformUrl(type, `${value}_v2`),
        confidence: 65,
        alternativeNames: [`${value} V2`, `${value} Version 2`],
        crossReferences: [],
        metadata: {
          followers: 5000,
          members: undefined,
          stars: undefined,
          description: `Alternative ${type} project`
        }
      });
    }
    
    return mockCandidates;
  };

  const getPlatformUrl = (type: InputType, value: string): string => {
    const cleanValue = value.replace(/^@/, '').replace(/\s+/g, '');
    
    switch (type) {
      case 'twitter': return `https://twitter.com/${cleanValue}`;
      case 'discord': return `https://discord.gg/${cleanValue}`;
      case 'telegram': return `https://t.me/${cleanValue}`;
      case 'github': return `https://github.com/${cleanValue}`;
      case 'website': return cleanValue.startsWith('http') ? cleanValue : `https://${cleanValue}`;
      case 'name': return '';
      default: return '';
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || disabled) return;
    
    setIsProcessing(true);
    try {
      const candidates = await resolveInput(input);
      
      if (candidates.length === 1) {
        const result: SmartInputResult = {
          input,
          type: detectedType,
          resolvedEntities: candidates,
          selectedEntity: candidates[0],
          confidence: candidates[0].confidence,
          searchHistory: [],
          timestamp: new Date()
        };
        onResolve(result);
      } else if (candidates.length > 1) {
        setCandidates(candidates);
        setShowDisambiguation(true);
      } else {
        const result: SmartInputResult = {
          input,
          type: detectedType,
          resolvedEntities: [],
          selectedEntity: null,
          confidence: 0,
          searchHistory: [],
          timestamp: new Date()
        };
        onResolve(result);
      }
    } catch (error) {
      console.error('Error resolving input:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectCandidate = (candidate: ResolvedEntity) => {
    const result: SmartInputResult = {
      input,
      type: detectedType,
      resolvedEntities: candidates,
      selectedEntity: candidate,
      confidence: candidate.confidence,
      searchHistory: [],
      timestamp: new Date()
    };
    onResolve(result);
    setShowDisambiguation(false);
    setCandidates([]);
  };

  const getTypeIcon = (type: InputType) => {
    switch (type) {
      case 'twitter': return '🐦';
      case 'discord': return '💬';
      case 'telegram': return '📱';
      case 'github': return '💻';
      case 'website': return '🌐';
      case 'name': return '🏷️';
      default: return '❓';
    }
  };

  const getTypeColor = (type: InputType) => {
    switch (type) {
      case 'twitter': return 'text-blue-400';
      case 'discord': return 'text-indigo-400';
      case 'telegram': return 'text-blue-300';
      case 'github': return 'text-gray-300';
      case 'website': return 'text-green-400';
      case 'name': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (e.target.value.trim()) {
              setDetectedType(detectInputType(e.target.value));
            }
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={placeholder || "Enter Twitter handle, Discord invite, GitHub repo, website, or project name..."}
          disabled={disabled || isProcessing}
          className={`w-full bg-sifter-dark border border-sifter-border rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            compact 
              ? 'px-4 py-3 text-sm pr-28' 
              : 'px-6 py-4 text-lg pr-40'
          }`}
        />
        
        <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 ${compact ? 'gap-1.5' : 'gap-3'}`}>
          {input && (
            <div className={`flex items-center ${compact ? 'gap-1' : 'gap-1.5'}`}>
              <span className={`${getTypeColor(detectedType)} ${compact ? 'text-xs' : 'text-sm'}`}>
                {getTypeIcon(detectedType)}
              </span>
              {!compact && (
                <span className="text-xs text-gray-400 bg-gray-800/50 px-1.5 py-0.5 rounded">
                  {detectedType}
                </span>
              )}
            </div>
          )}
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!input.trim() || disabled || isProcessing}
            className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
              compact 
                ? 'px-3 py-1.5 text-sm min-w-20' 
                : 'px-4 py-2 text-base min-w-24'
            }`}
          >
            {isProcessing ? (
              <>
                <div className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} border-2 border-white/30 border-t-white rounded-full animate-spin`}></div>
                {!compact && <span className="ml-1.5">Processing</span>}
              </>
            ) : (
              <>
                <span className={compact ? 'text-sm' : ''}>🔍</span>
                {!compact && <span className="ml-1.5">Analyze</span>}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Input examples - hide in compact mode */}
      {!compact && (
        <div className="mt-3 text-sm text-gray-500 flex flex-wrap gap-2">
          <span className="text-gray-600">Examples:</span>
          <button
            type="button"
            onClick={() => setInput('@moonrocket_fi')}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-2 py-1 rounded transition-colors"
          >
            @moonrocket_fi
          </button>
          <button
            type="button"
            onClick={() => setInput('discord.gg/crypto')}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-2 py-1 rounded transition-colors"
          >
            discord.gg/crypto
          </button>
          <button
            type="button"
            onClick={() => setInput('github.com/projectx')}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-2 py-1 rounded transition-colors"
          >
            github.com/projectx
          </button>
          <button
            type="button"
            onClick={() => setInput('https://project.com')}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-2 py-1 rounded transition-colors"
          >
            project.com
          </button>
        </div>
      )}

      {/* Disambiguation Modal */}
      {showDisambiguation && candidates.length > 0 && (
        <div className={`mt-4 border border-sifter-border rounded-xl bg-sifter-card overflow-hidden ${compact ? 'p-3' : 'p-4'}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-medium text-white ${compact ? 'text-sm' : 'text-base'}`}>
              Multiple matches found
            </h3>
            <button
              type="button"
              onClick={() => setShowDisambiguation(false)}
              className="text-gray-400 hover:text-white text-lg"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            {candidates.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => handleSelectCandidate(candidate)}
                className={`w-full text-left rounded-lg border transition-all group hover:border-blue-500/50 hover:bg-sifter-card/50 ${
                  candidate.confidence > 70 
                    ? 'border-blue-500/30 bg-blue-500/5' 
                    : 'border-sifter-border bg-gray-900/30'
                } ${compact ? 'p-3' : 'p-4'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`${getTypeColor(detectedType)} ${compact ? 'text-base' : 'text-lg'}`}>
                      {getTypeIcon(detectedType)}
                    </span>
                    <div>
                      <div className={`font-medium text-white group-hover:text-blue-400 transition-colors ${compact ? 'text-sm' : 'text-base'}`}>
                        {candidate.displayName}
                      </div>
                      {!compact && candidate.metadata.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{candidate.metadata.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-bold ${
                      candidate.confidence > 80 ? 'text-green-400' :
                      candidate.confidence > 60 ? 'text-yellow-400' :
                      'text-orange-400'
                    } ${compact ? 'text-base' : 'text-lg'}`}>
                      {candidate.confidence}%
                    </div>
                    {!compact && (
                      <div className="text-xs text-gray-400">confidence</div>
                    )}
                  </div>
                </div>
                
                {!compact && candidate.metadata && (
                  <div className="mt-2 flex gap-4 text-xs text-gray-500">
                    {candidate.metadata.followers !== undefined && (
                      <span>👥 {candidate.metadata.followers.toLocaleString()}</span>
                    )}
                    {candidate.metadata.members !== undefined && (
                      <span>💬 {candidate.metadata.members.toLocaleString()}</span>
                    )}
                    {candidate.metadata.stars !== undefined && (
                      <span>⭐ {candidate.metadata.stars.toLocaleString()}</span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {compact && (
            <button
              type="button"
              onClick={() => setShowDisambiguation(false)}
              className="mt-3 w-full text-center text-gray-400 hover:text-white text-sm py-2 border-t border-sifter-border/50"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}