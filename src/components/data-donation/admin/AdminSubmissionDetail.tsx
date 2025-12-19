// src/components/data-donation/admin/AdminSubmissionDetail.tsx
'use client';

import React from 'react';
import { AdminSubmission } from '@/types/admin';
import { XMarkIcon, CheckIcon, ExclamationTriangleIcon, LinkIcon } from '@heroicons/react/24/outline';

interface AdminSubmissionDetailProps {
  submission: AdminSubmission;
  onClose: () => void;
  onAction: (action: any) => Promise<void>;
}

export default function AdminSubmissionDetail({
  submission,
  onClose,
  onAction
}: AdminSubmissionDetailProps) {
  const [actionNotes, setActionNotes] = useState('');
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | 'request-info' | 'flag'>();

  const handleSubmitAction = async () => {
    if (!selectedAction || !actionNotes.trim()) return;
    
    await onAction({
      type: selectedAction,
      submissionId: submission.id,
      notes: actionNotes,
      timestamp: new Date()
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-sifter-card border border-sifter-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-sifter-card/95 backdrop-blur-sm border-b border-sifter-border p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Review Submission</h2>
                <p className="text-sm text-gray-400">
                  Case: <span className="font-mono text-blue-400">{submission.caseId}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Entity Info */}
            <div className="mb-6 p-4 bg-sifter-dark/50 border border-sifter-border rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-3">Entity Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Entity Name</div>
                  <div className="text-white font-medium">{submission.entityName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Entity Type</div>
                  <div className="text-white font-medium">{submission.entityType}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Project</div>
                  <div className="text-white font-medium">{submission.projectName || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Submitted By</div>
                  <div className="text-white font-medium">
                    {submission.submittedBy.name || 'Anonymous'} ({submission.submittedBy.mode})
                  </div>
                </div>
              </div>
            </div>

            {/* Auto-Verification Results */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Auto-Verification Results</h3>
              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-3xl font-bold text-white">{submission.autoVerification.confidence}%</div>
                  <div className="text-sm text-gray-400">Confidence Score</div>
                </div>
                
                <div className="space-y-3">
                  {submission.autoVerification.checks.map((check, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-black/30 rounded-lg">
                      {check.result === 'match' || check.result === 'confirmed_bad' || check.result === 'no_contradictions' ? (
                        <CheckIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-white">{check.check.replace('_', ' ')}</div>
                        <div className="text-sm text-gray-400">{check.detail}</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        check.result.includes('match') || check.result.includes('confirmed') || check.result.includes('no_contradictions')
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {check.result.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Evidence Review */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Evidence Review</h3>
              <div className="space-y-3">
                {submission.evidence.map((evidence, idx) => (
                  <div key={idx} className="p-4 border border-sifter-border rounded-xl">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-400">Evidence #{idx + 1}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            evidence.verified ? 'bg-green-500/20 text-green-400' :
                            evidence.accessible ? 'bg-blue-500/20 text-blue-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {evidence.verified ? 'Verified' : evidence.accessible ? 'Accessible' : 'Broken'}
                          </span>
                        </div>
                        <div className="text-white font-medium truncate">{evidence.url}</div>
                        <div className="text-sm text-gray-400 mt-1">Type: {evidence.type}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open(evidence.url, '_blank')}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg"
                          title="Open link"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            // Mark as verified
                            onAction({
                              type: 'verify',
                              submissionId: submission.id,
                              evidenceIndex: idx,
                              verified: true
                            });
                          }}
                          className={`p-2 rounded-lg ${
                            evidence.verified
                              ? 'bg-green-500/20 text-green-400'
                              : 'text-gray-400 hover:text-green-400 hover:bg-green-500/20'
                          }`}
                          title="Mark as verified"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {evidence.notes && (
                      <div className="mt-3 p-3 bg-sifter-dark/50 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Admin Notes</div>
                        <div className="text-white text-sm">{evidence.notes}</div>
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <textarea
                        placeholder="Add notes about this evidence..."
                        className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white text-sm"
                        rows={2}
                        onChange={(e) => {
                          // Update evidence notes
                          onAction({
                            type: 'update-evidence',
                            submissionId: submission.id,
                            evidenceIndex: idx,
                            notes: e.target.value
                          });
                        }}
                        defaultValue={evidence.notes || ''}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues & Flags */}
            {submission.autoVerification.issues.length > 0 && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                  Issues Found
                </h3>
                <ul className="space-y-2">
                  {submission.autoVerification.issues.map((issue, idx) => (
                    <li key={idx} className="text-red-300 flex items-start gap-2">
                      <span>•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Admin Action Section */}
            <div className="p-4 border border-sifter-border rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Take Action</h3>
              
              <div className="grid grid-cols-4 gap-3 mb-4">
                <button
                  onClick={() => setSelectedAction('approve')}
                  className={`p-4 border rounded-xl flex flex-col items-center justify-center transition-all ${
                    selectedAction === 'approve'
                      ? 'border-green-500 bg-green-500/20 text-green-400'
                      : 'border-sifter-border text-gray-400 hover:border-green-500/50'
                  }`}
                >
                  <CheckIcon className="w-6 h-6 mb-2" />
                  <span className="font-medium">Approve</span>
                  <span className="text-xs mt-1">Add to database</span>
                </button>
                
                <button
                  onClick={() => setSelectedAction('reject')}
                  className={`p-4 border rounded-xl flex flex-col items-center justify-center transition-all ${
                    selectedAction === 'reject'
                      ? 'border-red-500 bg-red-500/20 text-red-400'
                      : 'border-sifter-border text-gray-400 hover:border-red-500/50'
                  }`}
                >
                  <XMarkIcon className="w-6 h-6 mb-2" />
                  <span className="font-medium">Reject</span>
                  <span className="text-xs mt-1">Insufficient evidence</span>
                </button>
                
                <button
                  onClick={() => setSelectedAction('request-info')}
                  className={`p-4 border rounded-xl flex flex-col items-center justify-center transition-all ${
                    selectedAction === 'request-info'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-sifter-border text-gray-400 hover:border-blue-500/50'
                  }`}
                >
                  <span className="text-2xl mb-2">❓</span>
                  <span className="font-medium">Request Info</span>
                  <span className="text-xs mt-1">Need more evidence</span>
                </button>
                
                <button
                  onClick={() => setSelectedAction('flag')}
                  className={`p-4 border rounded-xl flex flex-col items-center justify-center transition-all ${
                    selectedAction === 'flag'
                      ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                      : 'border-sifter-border text-gray-400 hover:border-amber-500/50'
                  }`}
                >
                  <ExclamationTriangleIcon className="w-6 h-6 mb-2" />
                  <span className="font-medium">Flag</span>
                  <span className="text-xs mt-1">For senior review</span>
                </button>
              </div>

              {/* Action Notes */}
              {selectedAction && (
                <div className="mt-4">
                  <label className="block text-sm text-gray-400 mb-2">
                    Action Notes (Required)
                  </label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white min-h-[100px]"
                    placeholder="Explain your decision. This will be shared with the submitter..."
                    required
                  />
                </div>
              )}

              {/* Submit Action */}
              {selectedAction && (
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitAction}
                    disabled={!actionNotes.trim()}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      selectedAction === 'approve'
                        ? 'bg-green-500 hover:bg-green-600 text-white' :
                      selectedAction === 'reject'
                        ? 'bg-red-500 hover:bg-red-600 text-white' :
                      selectedAction === 'request-info'
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                        'bg-amber-500 hover:bg-amber-600 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {selectedAction === 'approve' && 'Approve Submission'}
                    {selectedAction === 'reject' && 'Reject Submission'}
                    {selectedAction === 'request-info' && 'Request More Info'}
                    {selectedAction === 'flag' && 'Flag for Review'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}