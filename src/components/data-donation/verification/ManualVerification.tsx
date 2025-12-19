// src/components/data-donation/verification/ManualVerification.tsx
'use client';

import React, { useState } from 'react';
import { VerificationResult } from '@/types/verification';
import { FlagSubmissionData } from '@/types/datadonation';

interface ManualVerificationProps {
  submission: FlagSubmissionData;
  verification: VerificationResult;
  onDecision: (decision: 'approve' | 'reject' | 'request_more_info', notes: string) => void;
}

export default function ManualVerification({ submission, verification, onDecision }: ManualVerificationProps) {
  const [activeTab, setActiveTab] = useState<'google' | 'social' | 'evidence' | 'notes'>('google');
  const [googleResults, setGoogleResults] = useState<any[]>([]);
  const [socialProfiles, setSocialProfiles] = useState<any[]>([]);
  const [evidenceVerification, setEvidenceVerification] = useState<any[]>([]);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSearch = async () => {
    // Mock Google search
    setGoogleResults([
      { title: 'Entity mentioned in scam report', url: 'https://example.com', snippet: '...' },
      { title: 'LinkedIn profile', url: 'https://linkedin.com', snippet: '...' }
    ]);
  };

  const handleSocialSearch = async () => {
    // Mock social search
    setSocialProfiles([
      { platform: 'Twitter', handle: '@entity', followers: 1234 },
      { platform: 'LinkedIn', company: 'Entity LLC' }
    ]);
  };

  const handleEvidenceCheck = async (index: number) => {
    // Mock evidence verification
    const newEvidence = [...evidenceVerification];
    newEvidence[index] = { verified: true, notes: 'Link accessible and relevant' };
    setEvidenceVerification(newEvidence);
  };

  return (
    <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-xl font-bold text-white">🔍 Manual Verification</h3>
        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
          Stage 2: Admin Review
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b border-sifter-border mb-6">
        <div className="flex gap-4">
          {['google', 'social', 'evidence', 'notes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 px-1 font-medium ${activeTab === tab ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400'}`}
            >
              {tab === 'google' && '🔍 Google Search'}
              {tab === 'social' && '👥 Social Media'}
              {tab === 'evidence' && '📎 Evidence Check'}
              {tab === 'notes' && '📝 Admin Notes'}
            </button>
          ))}
        </div>
      </div>

      {/* Google Search Tab */}
      {activeTab === 'google' && (
        <div className="space-y-4">
          <button onClick={handleGoogleSearch} className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg">
            Search Google for "{submission.entityName} scam"
          </button>
          {googleResults.map((result, idx) => (
            <div key={idx} className="p-3 border border-sifter-border rounded-lg">
              <div className="font-medium text-white">{result.title}</div>
              <div className="text-sm text-gray-400">{result.snippet}</div>
              <a href={result.url} className="text-blue-400 text-sm">View</a>
            </div>
          ))}
        </div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          <button onClick={handleSocialSearch} className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg">
            Find social profiles for "{submission.entityName}"
          </button>
          {socialProfiles.map((profile, idx) => (
            <div key={idx} className="p-3 border border-sifter-border rounded-lg">
              <div className="font-medium text-white">{profile.platform}</div>
              <div className="text-sm text-gray-400">{profile.handle || profile.company}</div>
            </div>
          ))}
        </div>
      )}

      {/* Evidence Check Tab */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          {submission.evidence?.map((evidence, idx) => (
            <div key={idx} className="p-4 border border-sifter-border rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium text-white">Evidence #{idx + 1}</div>
                  <div className="text-sm text-gray-400 truncate">{evidence.url}</div>
                </div>
                <button
                  onClick={() => handleEvidenceCheck(idx)}
                  className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm"
                >
                  Verify
                </button>
              </div>
              {evidenceVerification[idx] && (
                <div className="p-2 bg-green-500/10 rounded text-sm text-green-400">
                  ✓ Verified: {evidenceVerification[idx].notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admin Notes Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            className="w-full h-40 p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white"
            placeholder="Add verification notes, findings, and reasoning for decision..."
          />
          
          {/* Decision Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => onDecision('approve', adminNotes)}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50"
            >
              ✅ Approve
            </button>
            <button
              onClick={() => onDecision('request_more_info', adminNotes)}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg disabled:opacity-50"
            >
              📝 Request More Info
            </button>
            <button
              onClick={() => onDecision('reject', adminNotes)}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50"
            >
              ❌ Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}