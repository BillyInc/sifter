'use client';

import React from 'react';
import { UserMode, SubmissionFormData } from '@/types';

export interface TrackingDashboardProps {
  submissions: SubmissionFormData[];
  userMode: UserMode;
  onViewDetails: (submissionId: string) => void;
  onAddEvidence: (submissionId: string) => void;
  onExportSubmissions: () => void;
  userPoints?: number;
  userName?: string;
  onNewSubmission: () => void;  // ← ADD THIS
}

function TrackingDashboard({
  submissions,
  userMode,
  onViewDetails,
  onAddEvidence,
  onExportSubmissions,
  onNewSubmission,  // ← ADD THIS
  userPoints = 0,
  userName = 'User'
}: TrackingDashboardProps) {
  // Calculate stats
  const stats = {
    total: submissions.length,
    approved: submissions.filter(s => s.status === 'approved').length,
    pending: submissions.filter(s => s.status === 'submitted' || s.status === 'under-review').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    avgConfidence: submissions.length > 0 
      ? Math.round(submissions.reduce((sum, s) => sum + (s.confidenceScore || 0), 0) / submissions.length)
      : 0,
    totalImpact: submissions.reduce((sum, s) => sum + (s.impactScore || 0), 0)
  };

  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    'draft': { label: 'Draft', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: '📝' },
    'submitted': { label: 'Submitted', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '📤' },
    'under-review': { label: 'Under Review', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: '🔍' },
    'approved': { label: 'Approved', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '✅' },
    'rejected': { label: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '❌' },
    'needs-info': { label: 'Needs Info', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: '❓' }
  };

  const modeConfig: Record<string, { name: string; color: string; badge: string }> = {
    'ea-vc': { name: 'VC/EA Mode', color: 'from-blue-500/10 to-blue-600/20', badge: '🏢' },
    'researcher': { name: 'Researcher Mode', color: 'from-purple-500/10 to-purple-600/20', badge: '🔬' },
    'individual': { name: 'Individual Mode', color: 'from-green-500/10 to-green-600/20', badge: '👤' }
  };

  // Handle null userMode
  const currentMode = userMode || 'individual';
  const modeStyle = modeConfig[currentMode] || modeConfig['individual'];

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 'Today' : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className={`bg-gradient-to-br ${modeStyle.color} border border-sifter-border rounded-2xl overflow-hidden`}>
      {/* Header */}
      <div className="p-6 border-b border-sifter-border">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">Data Donation Dashboard</h2>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-sm">
                {modeStyle.badge} {modeStyle.name}
              </span>
            </div>
            <p className="text-gray-400">
              Track your submissions, impact, and rewards
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-white mb-1">{userPoints}</div>
            <div className="text-sm text-gray-400">Total Points</div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="p-6 bg-black/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-sifter-dark/50 border border-sifter-border rounded-xl p-4">
            <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Submissions</div>
          </div>
          <div className="bg-sifter-dark/50 border border-sifter-border rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.approved}</div>
            <div className="text-sm text-gray-400">Approved</div>
          </div>
          <div className="bg-sifter-dark/50 border border-sifter-border rounded-xl p-4">
            <div className="text-2xl font-bold text-amber-400 mb-1">{stats.pending}</div>
            <div className="text-sm text-gray-400">In Review</div>
          </div>
          <div className="bg-sifter-dark/50 border border-sifter-border rounded-xl p-4">
            <div className="text-2xl font-bold text-white mb-1">{stats.avgConfidence}%</div>
            <div className="text-sm text-gray-400">Avg Confidence</div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="p-6 border-b border-sifter-border bg-sifter-dark/30">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">
            My Submissions ({submissions.length})
          </h3>
          <div className="flex gap-3">
            <button
              onClick={onExportSubmissions}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 
                       border border-blue-500/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button  onClick={onNewSubmission} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                     text-white rounded-lg font-medium text-sm transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Submission
            </button>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="p-6">
        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-sifter-dark/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No Submissions Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Start contributing to the community by submitting your first data donation. 
              Earn points, climb tiers, and help protect others from bad actors.
            </p>
            <button   onClick={onNewSubmission} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                     text-white rounded-lg font-medium transition-all text-lg">
              Submit Your First Report
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => {
              const status = statusConfig[submission.status || 'draft'];
              const confidenceColor = getConfidenceColor(submission.confidenceScore || 0);
              const daysAgo = getDaysAgo(submission.submittedAt || new Date().toISOString());

              return (
                <div 
                  key={submission.id} 
                  className="border border-sifter-border rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors bg-sifter-dark/30"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
                            {status.icon} {status.label}
                          </span>
                          <span className="text-sm text-gray-500 font-mono">{submission.caseId}</span>
                          <span className="text-xs text-gray-500">{daysAgo}</span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {submission.entityDetails?.fullName || 'Unnamed Entity'}
                        </h3>
                        
                        <p className="text-sm text-gray-400 mb-3">
                          {submission.affectedProjects?.[0]?.incidentDescription?.substring(0, 120)}
                          {submission.affectedProjects?.[0]?.incidentDescription?.length > 120 ? '...' : ''}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-xl font-bold ${confidenceColor} mb-1`}>
                          {submission.confidenceScore}%
                        </div>
                        <div className="text-xs text-gray-500">Confidence</div>
                      </div>
                    </div>

                    {/* Metrics Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-sifter-dark/50 p-3 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Projects</div>
                        <div className="text-white font-medium">
                          {submission.affectedProjects?.length || 0} affected
                        </div>
                      </div>
                      <div className="bg-sifter-dark/50 p-3 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Evidence</div>
                        <div className="text-white font-medium">
                          {submission.evidence?.filter(e => e.url).length || 0} pieces
                        </div>
                      </div>
                      <div className="bg-sifter-dark/50 p-3 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Impact Score</div>
                        <div className="text-green-400 font-medium">
                          {submission.impactScore || 'Calculating...'}
                        </div>
                      </div>
                      <div className="bg-sifter-dark/50 p-3 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Points Earned</div>
                        <div className="text-amber-400 font-medium">
                          {submission.pointsAwarded || 'Pending'}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => onViewDetails(submission.id!)}
                        className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 
                                 border border-blue-500/30 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </button>
                      
                      {submission.status === 'needs-info' && (
                        <button
                          onClick={() => onAddEvidence(submission.id!)}
                          className="flex-1 px-4 py-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 
                                   border border-amber-500/30 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Evidence
                        </button>
                      )}
                      
                      {submission.status === 'approved' && (
                        <button className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 
                                 border border-green-500/30 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Approved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination/Info */}
        {submissions.length > 0 && (
          <div className="mt-8 pt-6 border-t border-sifter-border flex justify-between items-center text-sm text-gray-400">
            <div>
              Showing {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30"></div>
                <span>Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/30"></div>
                <span>In Review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30"></div>
                <span>Rejected</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackingDashboard;
