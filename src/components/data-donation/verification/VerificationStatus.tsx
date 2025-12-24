// src/components/data-donation/verification/VerificationStatus.tsx
'use client';

import React from 'react';
import { VerificationResult, REVIEW_WORKFLOWS } from '@/types/verification';
import { UserMode } from '@/types/dataDonation';

interface VerificationStatusProps {
  result: VerificationResult;
  mode: UserMode;
  onViewDetails?: () => void;
  onTakeAction?: (action: string) => void;
}

export default function VerificationStatus({
  result,
  mode,
  onViewDetails,
  onTakeAction
}: VerificationStatusProps) {
  const workflow = REVIEW_WORKFLOWS[mode];
  
  const getStatusConfig = (status: VerificationResult['status']) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-blue-500/20 text-blue-400', icon: '⏳', label: 'Pending' };
      case 'auto-verified':
        return { color: 'bg-green-500/20 text-green-400', icon: '🤖', label: 'Auto-Verified' };
      case 'needs-review':
        return { color: 'bg-amber-500/20 text-amber-400', icon: '📋', label: 'Needs Review' };
      case 'rejected':
        return { color: 'bg-red-500/20 text-red-400', icon: '❌', label: 'Rejected' };
      case 'approved':
        return { color: 'bg-green-500/20 text-green-400', icon: '✅', label: 'Approved' };
      default:
        return { color: 'bg-gray-500/20 text-gray-400', icon: '📝', label: 'Unknown' };
    }
  };

  const getNextStepConfig = (nextStep?: string) => {
    switch (nextStep) {
      case 'admin_review':
        return { color: 'bg-purple-500/20 text-purple-400', icon: '👔', label: 'Admin Review' };
      case 'peer_review':
        return { color: 'bg-blue-500/20 text-blue-400', icon: '👥', label: 'Peer Review' };
      case 'legal_review':
        return { color: 'bg-red-500/20 text-red-400', icon: '⚖️', label: 'Legal Review' };
      case 'community_review':
        return { color: 'bg-green-500/20 text-green-400', icon: '🌐', label: 'Community Review' };
      default:
        return { color: 'bg-gray-500/20 text-gray-400', icon: '📋', label: 'Pending Assignment' };
    }
  };

  const statusConfig = getStatusConfig(result.status);
  const nextStepConfig = getNextStepConfig(result.nextStep);

  return (
    <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Verification Status</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm ${statusConfig.color}`}>
              {statusConfig.icon} {statusConfig.label}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm ${nextStepConfig.color}`}>
              {nextStepConfig.icon} {nextStepConfig.label}
            </span>
            <span className="px-3 py-1 rounded-full text-sm bg-gray-500/20 text-gray-400">
              🏢 {mode.toUpperCase()} MODE
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{result.confidenceScore}%</div>
          <div className="text-sm text-gray-400">Confidence</div>
        </div>
      </div>

      {/* Workflow Stages */}
      <div className="mb-6">
        <h4 className="font-medium text-white mb-3">{workflow.totalTime} Review Process</h4>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(workflow).map(([key, stage]) => {
            if (key === 'totalTime') return null;if (key === 'totalTime' || key.includes('requires')) return null;  // ✅ Skip non-stage 
            
            const isCurrent = key === 'stage2'; // Simplified logic
            const isCompleted = key === 'stage1'; // Simplified logic
            
            return (
              <div
                key={key}
                className={`p-3 border rounded-lg text-center ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-500/10'
                    : isCompleted
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-700'
                }`}
              >
                <div className="text-xs text-gray-400 mb-1">
                  {key.replace('stage', 'Stage ')}
                </div>
                <div className="font-medium text-white capitalize">
                  {typeof stage === 'string' ? stage.replace(/_/g, ' ') : ''}  {/* ✅ Safe replace */}

                </div>
                {isCurrent && (
                  <div className="text-xs text-blue-400 mt-1">Current</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confidence Breakdown */}
      <div className="mb-6">
        <h4 className="font-medium text-white mb-3">Confidence Breakdown</h4>
        <div className="space-y-3">
          {result.checks.map((check) => (
            <div key={check.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-sm ${
                  check.status === 'passed' ? 'text-green-400' :
                  check.status === 'failed' ? 'text-red-400' :
                  'text-amber-400'
                }`}>
                  {check.status === 'passed' ? '✅' :
                   check.status === 'failed' ? '❌' : '⚠️'}
                </span>
                <div>
                  <div className="text-sm text-white">{check.name}</div>
                  <div className="text-xs text-gray-400">{check.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm ${
                  check.status === 'passed' ? 'text-green-400' :
                  check.status === 'failed' ? 'text-red-400' :
                  'text-amber-400'
                }`}>
                  {check.status === 'passed' ? `+${check.weight}` :
                   check.status === 'failed' ? `-${check.weight/2}` : '0'} pts
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-sifter-border">
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 
                     border border-blue-500/30 rounded-lg font-medium transition-colors"
          >
            View Full Details
          </button>
        )}
        
        {onTakeAction && result.status === 'needs-review' && (
          <button
            onClick={() => onTakeAction('review')}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 
                     hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium"
          >
            Start Review
          </button>
        )}
        
        {onTakeAction && result.status === 'auto-verified' && (
          <button
            onClick={() => onTakeAction('approve')}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 
                     hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium"
          >
            Confirm Approval
          </button>
        )}
      </div>

      {/* Timestamps */}
      <div className="flex justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-sifter-border">
        <div>
          <div>Submitted: {result.createdAt.toLocaleDateString()}</div>
          <div>{result.createdAt.toLocaleTimeString()}</div>
        </div>
        <div className="text-right">
          <div>Last Updated: {result.updatedAt.toLocaleDateString()}</div>
          <div>{result.updatedAt.toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  );
}