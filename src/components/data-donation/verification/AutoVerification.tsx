// src/components/data-donation/verification/AutoVerification.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { VerificationCheck, AutoVerificationData, MODE_VERIFICATION_THRESHOLDS } from '@/types/verification';
import { UserMode, FlagSubmissionData } from '@/types/datadonation';

interface AutoVerificationProps {
  submission: FlagSubmissionData;
  onComplete: (result: AutoVerificationData) => void;
}

export default function AutoVerification({ submission, onComplete }: AutoVerificationProps) {
  const [checks, setChecks] = useState<VerificationCheck[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  // From PDF: Stage 1 Auto-Verification checks
  const verificationSteps = [
    {
      id: 'entity_match',
      name: 'Entity Database Match',
      description: 'Check if entity already exists in database',
      weight: 30,
      run: async () => {
        // Simulate fuzzy match logic from PDF
        await new Promise(resolve => setTimeout(resolve, 800));
        const exists = Math.random() > 0.7; // 30% chance entity exists
        
        return {
          status: exists ? 'passed' : 'warning',
          details: exists 
            ? 'Entity found in database with 95% match confidence'
            : 'New entity - not in database'
        };
      }
    },
    {
      id: 'project_outcome',
      name: 'Project Outcome Verification',
      description: 'Check if project is known scam/rug',
      weight: 25,
      run: async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const isKnownScam = Math.random() > 0.5;
        
        return {
          status: isKnownScam ? 'passed' : 'warning',
          details: isKnownScam
            ? 'Project confirmed as scam/rug in database'
            : 'Project not in scam database'
        };
      }
    },
    {
      id: 'evidence_accessibility',
      name: 'Evidence Link Verification',
      description: 'Verify evidence links are accessible and relevant',
      weight: 20,
      run: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const accessibility = Math.random();
        const accessible = accessibility > 0.3;
        
        return {
          status: accessible ? 'passed' : 'failed',
          details: accessible
            ? 'All evidence links verified and accessible'
            : `Some links inaccessible (${Math.round((1 - accessibility) * 100)}% failed)`
        };
      }
    },
    {
      id: 'data_consistency',
      name: 'Data Consistency Check',
      description: 'Cross-reference with existing data',
      weight: 15,
      run: async () => {
        await new Promise(resolve => setTimeout(resolve, 700));
        const hasContradictions = Math.random() > 0.8;
        
        return {
          status: hasContradictions ? 'failed' : 'passed',
          details: hasContradictions
            ? 'Found contradictions with existing database entries'
            : 'No contradictions found with existing data'
        };
      }
    },
    {
      id: 'submitter_reputation',
      name: 'Submitter Reputation Check',
      description: 'Check submitter history and reputation',
      weight: 10,
      run: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const goodReputation = Math.random() > 0.3;
        
        return {
          status: goodReputation ? 'passed' : 'warning',
          details: goodReputation
            ? 'Submitter has good history with previous submissions'
            : 'Submitter has limited or mixed history'
        };
      }
    }
  ];

  useEffect(() => {
    if (isRunning && currentStep < verificationSteps.length) {
      runCheck(currentStep);
    } else if (currentStep >= verificationSteps.length) {
      completeVerification();
    }
  }, [currentStep, isRunning]);

  const runCheck = async (stepIndex: number) => {
    const step = verificationSteps[stepIndex];
    
    // Update UI to show check running
    setChecks(prev => [...prev, {
      id: step.id,
      name: step.name,
      description: step.description,
      status: 'pending',
      timestamp: new Date(),
      weight: step.weight
    }]);

    try {
      const result = await step.run();
      
      // Update check with result
      setChecks(prev => prev.map(check => 
        check.id === step.id 
          ? { ...check, ...result, timestamp: new Date() }
          : check
      ));

      // Update confidence based on check result
      if (result.status === 'passed') {
        setConfidence(prev => prev + step.weight);
      } else if (result.status === 'failed') {
        setConfidence(prev => Math.max(0, prev - (step.weight / 2)));
      }

      // Move to next step
      setTimeout(() => setCurrentStep(prev => prev + 1), 500);
    } catch (error) {
      console.error(`Check ${step.id} failed:`, error);
      setCurrentStep(prev => prev + 1);
    }
  };

  const completeVerification = () => {
    setIsRunning(false);
    
    // Determine auto-decision based on confidence and mode thresholds
    const thresholds = MODE_VERIFICATION_THRESHOLDS[submission.mode];
    let autoDecision: 'auto_approved' | 'auto_rejected' | 'needs_manual_review';
    
    if (confidence >= thresholds.autoApprove) {
      autoDecision = 'auto_approved';
    } else if (confidence <= thresholds.autoReject) {
      autoDecision = 'auto_rejected';
    } else {
      autoDecision = 'needs_manual_review';
    }

    const result: AutoVerificationData = {
      confidence,
      checks: checks.map(check => ({
        check: check.id,
        result: check.status === 'passed' ? 'match' : 
                check.status === 'failed' ? 'contradictions_found' : 'accessible',
        detail: check.details,
        points: check.status === 'passed' ? check.weight : 
                check.status === 'failed' ? -check.weight/2 : 0
      })),
      autoDecision
    };

    onComplete(result);
  };

  const getStatusColor = (status: VerificationCheck['status']) => {
    switch (status) {
      case 'passed': return 'text-green-400 bg-green-400/10';
      case 'failed': return 'text-red-400 bg-red-400/10';
      case 'warning': return 'text-amber-400 bg-amber-400/10';
      case 'pending': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: VerificationCheck['status']) => {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'warning': return '⚠️';
      case 'pending': return '⏳';
      default: return '📝';
    }
  };

  return (
    <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Auto-Verification</h3>
          <p className="text-sm text-gray-400">
            Stage 1: Automated checks (PDF Section: Verification Workflow)
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{confidence}%</div>
          <div className="text-sm text-gray-400">Confidence Score</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Verification Progress</span>
          <span>{currentStep} of {verificationSteps.length} checks</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / verificationSteps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Confidence Thresholds */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`p-3 border rounded-lg text-center ${
          confidence >= MODE_VERIFICATION_THRESHOLDS[submission.mode].autoApprove
            ? 'border-green-500 bg-green-500/10'
            : 'border-gray-700'
        }`}>
          <div className="text-sm text-gray-400">Auto-Approve</div>
          <div className="font-bold text-white">
            ≥{MODE_VERIFICATION_THRESHOLDS[submission.mode].autoApprove}%
          </div>
        </div>
        <div className={`p-3 border rounded-lg text-center ${
          confidence <= MODE_VERIFICATION_THRESHOLDS[submission.mode].autoReject
            ? 'border-red-500 bg-red-500/10'
            : 'border-gray-700'
        }`}>
          <div className="text-sm text-gray-400">Auto-Reject</div>
          <div className="font-bold text-white">
            ≤{MODE_VERIFICATION_THRESHOLDS[submission.mode].autoReject}%
          </div>
        </div>
        <div className="p-3 border border-gray-700 rounded-lg text-center">
          <div className="text-sm text-gray-400">Mode</div>
          <div className="font-bold text-white capitalize">{submission.mode}</div>
        </div>
      </div>

      {/* Verification Checks */}
      <div className="space-y-3">
        {checks.map((check) => (
          <div key={check.id} className="p-4 border border-gray-800 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <span className={`text-lg ${getStatusIcon(check.status)}`} />
                <div>
                  <h4 className="font-medium text-white">{check.name}</h4>
                  <p className="text-sm text-gray-400">{check.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(check.status)}`}>
                  {check.status.toUpperCase()}
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  Weight: {check.weight} pts
                </div>
              </div>
            </div>
            
            {check.details && (
              <div className="mt-2 p-2 bg-gray-900/50 rounded text-sm text-gray-300">
                {check.details}
              </div>
            )}
            
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>ID: {check.id}</span>
              <span>{check.timestamp.toLocaleTimeString()}</span>
            </div>
          </div>
        ))}

        {/* Pending Checks */}
        {isRunning && currentStep < verificationSteps.length && (
          <div className="p-4 border border-blue-500/30 rounded-lg bg-blue-500/5">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
              <div>
                <h4 className="font-medium text-white">
                  Running: {verificationSteps[currentStep]?.name}
                </h4>
                <p className="text-sm text-gray-400">
                  {verificationSteps[currentStep]?.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decision Preview */}
      {!isRunning && (
        <div className="mt-6 p-4 border rounded-lg bg-gradient-to-r from-gray-900/50 to-gray-800/50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-white">Auto-Verification Complete</h4>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              confidence >= MODE_VERIFICATION_THRESHOLDS[submission.mode].autoApprove
                ? 'bg-green-500/20 text-green-400'
                : confidence <= MODE_VERIFICATION_THRESHOLDS[submission.mode].autoReject
                ? 'bg-red-500/20 text-red-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              {confidence >= MODE_VERIFICATION_THRESHOLDS[submission.mode].autoApprove
                ? '🚀 AUTO-APPROVE'
                : confidence <= MODE_VERIFICATION_THRESHOLDS[submission.mode].autoReject
                ? '❌ AUTO-REJECT'
                : '📋 NEEDS MANUAL REVIEW'}
            </span>
          </div>
          
          <div className="text-sm text-gray-400 space-y-2">
            <p>
              Confidence score of <span className="text-white font-medium">{confidence}%</span> 
              {confidence >= MODE_VERIFICATION_THRESHOLDS[submission.mode].autoApprove
                ? ' exceeds auto-approve threshold.'
                : confidence <= MODE_VERIFICATION_THRESHOLDS[submission.mode].autoReject
                ? ' falls below auto-reject threshold.'
                : ' requires manual review.'}
            </p>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-gray-800/50 rounded">
                <div className="text-gray-400">Next Step</div>
                <div className="text-white">
                  {confidence >= MODE_VERIFICATION_THRESHOLDS[submission.mode].autoApprove
                    ? 'Add to database'
                    : confidence <= MODE_VERIFICATION_THRESHOLDS[submission.mode].autoReject
                    ? 'Send rejection email'
                    : 'Admin review queue'}
                </div>
              </div>
              <div className="p-2 bg-gray-800/50 rounded">
                <div className="text-gray-400">Estimated Time</div>
                <div className="text-white">
                  {confidence >= MODE_VERIFICATION_THRESHOLDS[submission.mode].autoApprove
                    ? 'Immediate'
                    : confidence <= MODE_VERIFICATION_THRESHOLDS[submission.mode].autoReject
                    ? 'Immediate'
                    : MODE_VERIFICATION_THRESHOLDS[submission.mode].sla}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}