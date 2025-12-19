// src/components/data-donation/admin/index.tsx
'use client';

import React, { useState, useEffect } from 'react';
import AdminReviewDashboard from './AdminReviewDashboard';
import AdminSubmissionDetail from './AdminSubmissionDetail';
import { AdminSubmission, AdminStats } from '@/types/admin';

// Mock data - replace with your API calls
const mockSubmissions: AdminSubmission[] = [
  {
    id: 'sub-1',
    caseId: 'SR-2024-1247',
    entityName: 'CryptoGrowth Labs',
    entityType: 'Marketing Agency',
    projectName: 'ProjectX Token',
    submittedBy: {
      userId: 'user-123',
      email: 'vc@example.com',
      name: 'John VC',
      mode: 'ea-vc'
    },
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    autoVerification: {
      confidence: 87,
      checks: [
        { check: 'entity_known', result: 'match', detail: 'Matches existing database entry: CryptoGrowth Labs' },
        { check: 'project_outcome', result: 'confirmed_bad', detail: 'Project ProjectX = known rug (confirmed)' },
        { check: 'evidence_accessibility', result: 'accessible', detail: '3/3 evidence links accessible' },
        { check: 'data_consistency', result: 'no_contradictions', detail: 'No contradictions with existing database' }
      ],
      issues: []
    },
    evidence: [
      { url: 'https://twitter.com/cryptogrowth/status/...', type: 'twitter_post', accessible: true, verified: true },
      { url: 'https://archive.org/web/2024/projectx', type: 'archived_website', accessible: true, verified: true },
      { url: 'https://reddit.com/r/CryptoScams/...', type: 'reddit_thread', accessible: true, verified: true }
    ],
    status: 'auto-verified',
    priority: 'high',
    estimatedReviewTime: '2 hours ago'
  },
  {
    id: 'sub-2',
    caseId: 'SR-2024-1246',
    entityName: 'CryptoMax Agency',
    entityType: 'Marketing Agency',
    projectName: 'ScamCoin',
    submittedBy: {
      userId: 'user-456',
      email: 'researcher@example.com',
      name: 'Alice Researcher',
      mode: 'researcher'
    },
    submittedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    autoVerification: {
      confidence: 52,
      checks: [
        { check: 'entity_known', result: 'contradictions_found', detail: 'Entity NOT in database (new submission)' },
        { check: 'project_outcome', result: 'confirmed_bad', detail: 'Project ScamCoin = known rug (confirmed)' },
        { check: 'evidence_accessibility', result: 'accessible', detail: '2/2 evidence links accessible' }
      ],
      issues: ['Only 2 evidence sources (prefer 3+)', 'New entity needs independent verification']
    },
    evidence: [
      { url: 'https://twitter.com/cryptomax/status/...', type: 'twitter_post', accessible: true, verified: true },
      { url: 'https://reddit.com/r/CryptoScams/...', type: 'reddit_thread', accessible: true, verified: false }
    ],
    status: 'needs-verification',
    priority: 'medium',
    estimatedReviewTime: '8 hours ago'
  },
  {
    id: 'sub-3',
    caseId: 'SR-2024-1245',
    entityName: 'John Doe',
    entityType: 'Advisor',
    submittedBy: {
      userId: 'user-789',
      email: 'anonymous@example.com',
      name: 'Anonymous',
      mode: 'individual'
    },
    submittedAt: new Date(Date.now() - 15 * 60 * 60 * 1000), // 15 hours ago
    autoVerification: {
      confidence: 12,
      checks: [
        { check: 'evidence_accessibility', result: 'contradictions_found', detail: 'Evidence link 1: 404 error (link broken)' },
        { check: 'evidence_accessibility', result: 'contradictions_found', detail: 'Evidence link 2: Points to private message (not acceptable)' }
      ],
      issues: [
        'Submitter is anonymous (no follow-up possible)',
        'Entity "John Doe" matches 47 LinkedIn profiles (unclear which one)',
        'Possible defamation risk (common name, weak evidence)'
      ]
    },
    evidence: [
      { url: 'https://broken-link.example.com', type: 'website', accessible: false, verified: false },
      { url: 'https://t.me/private/chat', type: 'telegram', accessible: false, verified: false }
    ],
    status: 'flagged',
    priority: 'critical',
    estimatedReviewTime: '15 hours ago'
  }
];

const mockStats: AdminStats = {
  totalPending: 23,
  autoVerified: 7,
  needsVerification: 12,
  flagged: 4,
  avgResponseTime: 18,
  oldestUnreviewed: 31
};

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<AdminSubmission[]>(mockSubmissions);
  const [stats, setStats] = useState<AdminStats>(mockStats);
  const [selectedSubmission, setSelectedSubmission] = useState<AdminSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: any) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Admin action:', action);
    
    // Update submission status based on action
    if (action.type === 'approve') {
      setSubmissions(prev => prev.filter(s => s.id !== action.submissionId));
      setStats(prev => ({ ...prev, totalPending: prev.totalPending - 1 }));
    } else if (action.type === 'reject') {
      setSubmissions(prev => prev.filter(s => s.id !== action.submissionId));
      setStats(prev => ({ ...prev, totalPending: prev.totalPending - 1 }));
    } else if (action.type === 'assign') {
      // Mark as under review
      setSubmissions(prev => prev.map(s => 
        s.id === action.submissionId 
          ? { ...s, status: 'under-review', assignedTo: 'Current Admin' }
          : s
      ));
    }
    
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-sifter-dark p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <AdminReviewDashboard
          adminName="Sarah Kim"
          submissions={submissions}
          stats={stats}
          onAction={handleAction}
          onRefresh={handleRefresh}
        />
        
        {selectedSubmission && (
          <AdminSubmissionDetail
            submission={selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
            onAction={handleAction}
          />
        )}
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-8">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-center">Processing action...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}