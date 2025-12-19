// src/components/data-donation/admin/AdminReviewDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AdminSubmission, AdminStats, Dispute, EvidenceVaultItem } from '@/types/admin';
import { SearchIcon, FilterIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon, FlagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ManualVerification from './ManualVerification';
import EmailTemplates from './EmailTemplates';
import DisputeForm from './DisputeForm';
import DisputesQueuePanel from './disputes/DisputesQueuePanel';
import EvidenceVault from './evidence/EvidenceVault';
import RewardsDashboard from './rewards/RewardsDashboard'; // Add this import

interface AdminReviewDashboardProps {
  adminName: string;
  submissions: AdminSubmission[];
  stats: AdminStats;
  onAction: (action: any) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function AdminReviewDashboard({
  adminName,
  submissions,
  stats,
  onAction,
  onRefresh
}: AdminReviewDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'auto-verified' | 'needs-verification' | 'flagged'>('all');
  const [sortBy, setSortBy] = useState<'oldest' | 'priority' | 'confidence'>('oldest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<AdminSubmission | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showEmailTemplate, setShowEmailTemplate] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [decision, setDecision] = useState<'approved' | 'rejected' | 'needs_more_evidence'>('approved');
  const [adminNotes, setAdminNotes] = useState('');

  // ADD THESE STATE VARIABLES
  const [activeTab, setActiveTab] = useState<'submissions' | 'disputes' | 'evidence' | 'rewards'>('submissions');
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [evidenceVault, setEvidenceVault] = useState<EvidenceVaultItem[]>([]);

  // Integration in AdminReviewDashboard - Add to action buttons:
  const handleReviewSubmission = (submission: AdminSubmission) => {
    // Show modal with ManualVerification, EmailTemplates, and DisputeForm access
    setSelectedSubmission(submission);
    setShowVerificationModal(true);
    setShowEmailTemplate(false);
    setShowDisputeForm(false);
  };

  const handleManualVerificationDecision = (
    decision: 'approved' | 'rejected' | 'needs_more_evidence', 
    notes: string
  ) => {
    setDecision(decision);
    setAdminNotes(notes);
    // Show email template after decision
    setShowEmailTemplate(true);
  };

  const handleCloseModal = () => {
    setShowVerificationModal(false);
    setShowEmailTemplate(false);
    setShowDisputeForm(false);
    setSelectedSubmission(null);
  };

  // ADD THESE HANDLER FUNCTIONS
  const fetchDisputes = async () => {
    try {
      // TODO: Fetch disputes from API
      const response = await fetch('/api/admin/disputes');
      const data = await response.json();
      setDisputes(data);
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    }
  };

  const handleUpdateDispute = async (disputeId: string, updates: Partial<Dispute>) => {
    try {
      await onAction({
        type: 'update-dispute',
        disputeId,
        updates
      });
      await fetchDisputes();
    } catch (error) {
      console.error('Failed to update dispute:', error);
    }
  };

  const handleSendResolution = async (dispute: Dispute, resolution: any) => {
    try {
      await onAction({
        type: 'send-resolution',
        disputeId: dispute.id,
        resolution
      });
    } catch (error) {
      console.error('Failed to send resolution:', error);
    }
  };

  // Add fetchEvidenceVault function
  const fetchEvidenceVault = async () => {
    try {
      // TODO: Fetch evidence vault data
      const response = await fetch('/api/admin/evidence-vault');
      const data = await response.json();
      setEvidenceVault(data);
    } catch (error) {
      console.error('Failed to fetch evidence vault:', error);
    }
  };

  const handleVerifyEvidence = async (evidenceId: string) => {
    try {
      await onAction({
        type: 'verify-evidence',
        evidenceId
      });
      await fetchEvidenceVault();
    } catch (error) {
      console.error('Failed to verify evidence:', error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (activeTab === 'disputes') fetchDisputes();
    if (activeTab === 'evidence') fetchEvidenceVault();
  }, [activeTab]);

  // Filter and sort submissions
  const filteredSubmissions = submissions
    .filter(sub => {
      if (filter === 'all') return true;
      return sub.status === filter;
    })
    .filter(sub => {
      if (!searchQuery) return true;
      return (
        sub.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.submittedBy.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'confidence':
          return b.autoVerification.confidence - a.autoVerification.confidence;
        default:
          return 0;
      }
    });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'auto-verified':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'needs-verification':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'flagged':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'under-review':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/20 text-red-400';
      case 'high':
        return 'bg-orange-500/20 text-orange-400';
      case 'medium':
        return 'bg-amber-500/20 text-amber-400';
      case 'low':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'ea-vc':
        return '🏢';
      case 'researcher':
        return '🔬';
      case 'individual':
        return '👤';
      default:
        return '👤';
    }
  };

  return (
    <>
      <div className="bg-sifter-card border border-sifter-border rounded-2xl overflow-hidden">
        {/* Header with Tabs */}
        <div className="p-6 border-b border-sifter-border bg-sifter-dark/50">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white">SIFTER ADMIN DASHBOARD</h1>
              <p className="text-gray-400 mt-1">
                Admin: <span className="text-blue-400">{adminName}</span> • 
                {activeTab === 'submissions' && ' Reviewing Submissions'}
                {activeTab === 'disputes' && ' Managing Disputes'}
                {activeTab === 'evidence' && ' Evidence Vault'}
                {activeTab === 'rewards' && ' Rewards & Gamification'}
              </p>
            </div>
            <div className="text-right">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 
                         border border-blue-500/30 rounded-lg text-sm font-medium 
                         flex items-center gap-2 disabled:opacity-50"
              >
                {isRefreshing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Queue
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="mt-6">
            <div className="flex gap-2 border-b border-sifter-border">
              {[
                { id: 'submissions', label: 'Submissions', icon: '📝', count: submissions.length },
                { id: 'disputes', label: 'Disputes', icon: '🛡️', count: disputes.length },
                { id: 'evidence', label: 'Evidence Vault', icon: '🔒', count: evidenceVault.length },
                { id: 'rewards', label: 'Rewards', icon: '🏆', count: stats.totalPending }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 -mb-px border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activeTab === tab.id 
                        ? 'bg-blue-500/30 text-blue-300' 
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6">
          {activeTab === 'submissions' && (
            // Your existing submissions content (all the code you already have)
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="bg-black/20 rounded-xl p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-sifter-dark/50 border border-sifter-border rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">{stats.totalPending}</div>
                    <div className="text-sm text-gray-400">Pending Review</div>
                  </div>
                  <div className="bg-sifter-dark/50 border border-sifter-border rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-400">{stats.autoVerified}</div>
                    <div className="text-sm text-gray-400">Auto-verified</div>
                    <div className="text-xs text-green-400 mt-1">Review These First →</div>
                  </div>
                  <div className="bg-sifter-dark/50 border border-sifter-border rounded-xl p-4">
                    <div className="text-2xl font-bold text-amber-400">{stats.needsVerification}</div>
                    <div className="text-sm text-gray-400">Needs Verification</div>
                  </div>
                  <div className="bg-sifter-dark/50 border border-sifter-border rounded-xl p-4">
                    <div className="text-2xl font-bold text-red-400">{stats.flagged}</div>
                    <div className="text-sm text-gray-400">Flagged</div>
                  </div>
                  <div className="bg-sifter-dark/50 border border-sifter-border rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">{stats.avgResponseTime}h</div>
                    <div className="text-sm text-gray-400">Avg Response Time</div>
                    <div className="text-xs text-amber-400 mt-1">Target: &lt;48 hours ▼</div>
                  </div>
                </div>

                {/* Response Time Warning */}
                {stats.oldestUnreviewed > 48 && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-red-400">
                      <ExclamationCircleIcon className="w-5 h-5" />
                      <span className="font-medium">Warning:</span>
                      <span>Oldest unreviewed submission is {stats.oldestUnreviewed} hours old</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Filters and Search */}
              <div className="p-6 border border-sifter-border rounded-xl bg-sifter-dark/30">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by entity name, case ID, or email..."
                        className="w-full pl-10 pr-4 py-2 bg-sifter-dark border border-sifter-border 
                                 rounded-lg text-white placeholder-gray-500 focus:outline-none 
                                 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex gap-2">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as any)}
                      className="px-4 py-2 bg-sifter-dark border border-sifter-border rounded-lg text-white"
                    >
                      <option value="all">All Submissions</option>
                      <option value="auto-verified">Auto-verified</option>
                      <option value="needs-verification">Needs Verification</option>
                      <option value="flagged">Flagged</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-4 py-2 bg-sifter-dark border border-sifter-border rounded-lg text-white"
                    >
                      <option value="oldest">Sort: Oldest First</option>
                      <option value="priority">Sort: Priority</option>
                      <option value="confidence">Sort: Confidence</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submissions List */}
              <div>
                <div className="space-y-4">
                  {filteredSubmissions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-sifter-dark/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircleIcon className="w-10 h-10 text-green-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-3">Queue Empty!</h3>
                      <p className="text-gray-400 max-w-md mx-auto">
                        All submissions have been reviewed. Great work! 🎉
                      </p>
                    </div>
                  ) : (
                    filteredSubmissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="border border-sifter-border rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors"
                      >
                        {/* Submission Header */}
                        <div className="p-4 border-b border-sifter-border bg-sifter-dark/30">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(submission.status)}`}>
                                  {submission.status.replace('-', ' ').toUpperCase()}
                                </span>
                                <span className="font-mono text-sm text-gray-400">{submission.caseId}</span>
                                <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(submission.priority)}`}>
                                  {submission.priority.toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {getModeIcon(submission.submittedBy.mode)} {submission.submittedBy.mode}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold text-white">{submission.entityName}</h3>
                              <p className="text-sm text-gray-400">
                                {submission.entityType} • {submission.projectName || 'No project specified'}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <div className={`text-2xl font-bold mb-1 ${
                                submission.autoVerification.confidence >= 80 ? 'text-green-400' :
                                submission.autoVerification.confidence >= 50 ? 'text-amber-400' :
                                'text-red-400'
                              }`}>
                                {submission.autoVerification.confidence}%
                              </div>
                              <div className="text-xs text-gray-500">Confidence</div>
                              <div className="text-sm text-gray-400 mt-2">
                                <ClockIcon className="w-4 h-4 inline mr-1" />
                                {submission.estimatedReviewTime}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Submission Details */}
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {/* Submitted Info */}
                            <div className="bg-sifter-dark/50 p-3 rounded-lg">
                              <div className="text-sm text-gray-400 mb-1">Submitted By</div>
                              <div className="text-white font-medium">{submission.submittedBy.name || 'Anonymous'}</div>
                              <div className="text-xs text-gray-400 truncate">{submission.submittedBy.email}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(submission.submittedAt).toLocaleDateString()} • {new Date(submission.submittedAt).toLocaleTimeString()}
                              </div>
                            </div>

                            {/* Auto-Verification Results */}
                            <div className="bg-sifter-dark/50 p-3 rounded-lg">
                              <div className="text-sm text-gray-400 mb-1">Auto-Verification Results</div>
                              <div className="space-y-1">
                                {submission.autoVerification.checks.slice(0, 3).map((check, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm">
                                    {check.result === 'match' || check.result === 'confirmed_bad' || check.result === 'no_contradictions' ? (
                                      <span className="text-green-400">✓</span>
                                    ) : (
                                      <span className="text-red-400">✗</span>
                                    )}
                                    <span className="text-gray-300">{check.check}</span>
                                  </div>
                                ))}
                                {submission.autoVerification.checks.length > 3 && (
                                  <div className="text-xs text-gray-500">
                                    +{submission.autoVerification.checks.length - 3} more checks
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Evidence Summary */}
                            <div className="bg-sifter-dark/50 p-3 rounded-lg">
                              <div className="text-sm text-gray-400 mb-1">Evidence Summary</div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-300">Total Links:</span>
                                  <span className="text-white">{submission.evidence.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-300">Accessible:</span>
                                  <span className="text-green-400">
                                    {submission.evidence.filter(e => e.accessible).length}/{submission.evidence.length}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-300">Verified:</span>
                                  <span className="text-blue-400">
                                    {submission.evidence.filter(e => e.verified).length}/{submission.evidence.length}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex gap-3">
                            {submission.status === 'auto-verified' && (
                              <>
                                <button
                                  onClick={() => onAction({
                                    type: 'approve',
                                    submissionId: submission.id,
                                    notes: 'Auto-verified with high confidence'
                                  })}
                                  className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 
                                           border border-green-500/30 rounded-lg font-medium transition-colors 
                                           flex items-center justify-center gap-2"
                                >
                                  <CheckCircleIcon className="w-4 h-4" />
                                  Quick Approve
                                </button>
                                <button
                                  onClick={() => handleReviewSubmission(submission)}
                                  className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 
                                           border border-blue-500/30 rounded-lg font-medium transition-colors"
                                >
                                  Review Details
                                </button>
                              </>
                            )}
                            
                            {submission.status === 'needs-verification' && (
                              <button
                                onClick={() => handleReviewSubmission(submission)}
                                className="flex-1 px-4 py-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 
                                         border border-amber-500/30 rounded-lg font-medium transition-colors 
                                         flex items-center justify-center gap-2"
                              >
                                Start Verification
                              </button>
                            )}
                            
                            {submission.status === 'flagged' && (
                              <button
                                onClick={() => onAction({
                                  type: 'reject',
                                  submissionId: submission.id,
                                  notes: 'Insufficient evidence, defamation risk'
                                })}
                                className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 
                                         border border-red-500/30 rounded-lg font-medium transition-colors 
                                         flex items-center justify-center gap-2"
                              >
                                <FlagIcon className="w-4 h-4" />
                                Reject & Email Submitter
                              </button>
                            )}

                            <button
                              onClick={() => onAction({
                                type: 'request-info',
                                submissionId: submission.id,
                                notes: 'Requesting additional evidence'
                              })}
                              className="px-4 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 
                                       border border-purple-500/30 rounded-lg font-medium transition-colors"
                            >
                              Request More Info
                            </button>

                            <button
                              onClick={() => onAction({
                                type: 'reject',
                                submissionId: submission.id,
                                notes: 'Insufficient evidence'
                              })}
                              className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 
                                       border border-red-500/30 rounded-lg font-medium transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Load More */}
                {filteredSubmissions.length > 0 && filteredSubmissions.length < submissions.length && (
                  <div className="mt-8 text-center">
                    <button className="px-6 py-3 bg-sifter-dark border border-sifter-border rounded-lg 
                             text-gray-400 hover:text-white hover:border-blue-500/50 transition-colors">
                      Load More... ({submissions.length - filteredSubmissions.length} more pending)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'disputes' && (
            <DisputesQueuePanel
              disputes={disputes}
              onUpdateDispute={handleUpdateDispute}
              onSendResolution={handleSendResolution}
              onRefresh={() => fetchDisputes()}
            />
          )}
          
          {activeTab === 'evidence' && (
            <EvidenceVault
              evidence={evidenceVault}
              onVerifyEvidence={handleVerifyEvidence}
              onRefresh={() => fetchEvidenceVault()}
            />
          )}
          
          {activeTab === 'rewards' && (
            <RewardsDashboard
              stats={stats}
              submissions={submissions}
              onAction={onAction}
            />
          )}
        </div>

        {/* Footer Stats - Only show for submissions tab */}
        {activeTab === 'submissions' && (
          <div className="p-6 border-t border-sifter-border bg-sifter-dark/50">
            <div className="flex justify-between items-center text-sm text-gray-400">
              <div>
                Showing {filteredSubmissions.length} of {submissions.length} submissions
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30"></div>
                  <span>Auto-verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/30"></div>
                  <span>Needs verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30"></div>
                  <span>Flagged</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* In modal */}
      {showVerificationModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-sifter-card border border-sifter-border rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 p-4 border-b border-sifter-border bg-sifter-dark/95 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Manual Verification</h2>
                <p className="text-sm text-gray-400">Case ID: {selectedSubmission.caseId}</p>
              </div>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <ManualVerification
                submission={{
                  id: selectedSubmission.id,
                  caseId: selectedSubmission.caseId,
                  entityName: selectedSubmission.entityName,
                  entityType: selectedSubmission.entityType,
                  projectName: selectedSubmission.projectName || '',
                  submittedBy: selectedSubmission.submittedBy,
                  evidence: selectedSubmission.evidence,
                  autoVerification: selectedSubmission.autoVerification
                }}
                verification={selectedSubmission.autoVerification}
                onDecision={handleManualVerificationDecision}
              />
              
              {showEmailTemplate && (
                <div className="mt-8 pt-6 border-t border-sifter-border">
                  <EmailTemplates
                    submissionId={selectedSubmission.id}
                    entityName={selectedSubmission.entityName}
                    decision={decision}
                    adminNotes={adminNotes}
                    onSend={() => {
                      // Handle email sending
                      console.log('Email sent for submission:', selectedSubmission.id);
                      handleCloseModal();
                    }}
                    onCancel={() => {
                      setShowEmailTemplate(false);
                      setShowVerificationModal(false);
                    }}
                  />
                </div>
              )}
              
              {/* Dispute link/button */}
              {!showEmailTemplate && (
                <div className="mt-6 pt-6 border-t border-sifter-border">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-white">Entity Response Options</h3>
                      <p className="text-sm text-gray-400">Allow the reported entity to respond or file a dispute</p>
                    </div>
                    <button 
                      onClick={() => setShowDisputeForm(true)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 
                               border border-red-500/30 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      🛡️ File Dispute (Entity Response)
                    </button>
                  </div>
                  
                  {showDisputeForm && (
                    <div className="mt-4 p-4 border border-red-500/30 rounded-lg bg-sifter-dark/50">
                      <DisputeForm
                        submissionId={selectedSubmission.id}
                        entityName={selectedSubmission.entityName}
                        entityEmail={selectedSubmission.entityEmail || ''}
                        onSubmit={(disputeData) => {
                          console.log('Dispute filed for submission:', selectedSubmission.id, disputeData);
                          // Handle dispute submission
                          onAction({
                            type: 'file-dispute',
                            submissionId: selectedSubmission.id,
                            disputeData: disputeData
                          });
                          setShowDisputeForm(false);
                        }}
                        onCancel={() => setShowDisputeForm(false)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}