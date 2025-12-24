'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Dispute } from '@/types/dispute';
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, DocumentTextIcon, EnvelopeIcon, PhoneIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DisputesQueuePanelProps {
  disputes: Dispute[];
  onUpdateDispute: (disputeId: string, updates: Partial<Dispute>) => Promise<void>;
  onSendResolution: (dispute: Dispute, resolution: any) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function DisputesQueuePanel({
  disputes,
  onUpdateDispute,
  onSendResolution,
  onRefresh
}: DisputesQueuePanelProps) {
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [filterStatus, setFilterStatus] = useState<Dispute['status'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'due_date'>('newest');
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [resolution, setResolution] = useState<'accepted' | 'partial' | 'rejected' | null>(null);
  const [emailPreviewType, setEmailPreviewType] = useState<'confirmation' | 'verification' | 'resolution'>('resolution');

  // Fix searchParams null check
  const searchParams = useSearchParams();
  const caseId = searchParams?.get('caseId') || '';

  // Status counts
  const statusCounts = {
    pending: disputes.filter(d => d.status === 'pending').length,
    under_review: disputes.filter(d => d.status === 'under_review').length,
    needs_info: disputes.filter(d => d.status === 'needs_info').length,
    resolved: disputes.filter(d => d.status.startsWith('resolved_')).length
  };

  // Filter and sort disputes
  const filteredDisputes = (filterStatus === 'all' ? disputes : disputes.filter(d => d.status === filterStatus))
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.filedAt).getTime() - new Date(a.filedAt).getTime();
        case 'oldest':
          return new Date(a.filedAt).getTime() - new Date(b.filedAt).getTime();
        case 'due_date':
          return new Date(a.resolutionDueDate).getTime() - new Date(b.resolutionDueDate).getTime();
        default:
          return 0;
      }
    });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const handleResolveDispute = async (res: 'accepted' | 'partial' | 'rejected') => {
    if (!selectedDispute) return;
    
    setResolution(res);
    setIsProcessing(true);
    try {
      await onUpdateDispute(selectedDispute.id, {
        status: `resolved_${res}` as Dispute['status'],
        resolvedAt: new Date().toISOString(),
        resolution: {
          decision: res,
          changesMade: getResolutionChanges(res),
          notes: adminNotes,
          updatedEntryPreview: getUpdatedEntryPreview(selectedDispute, res)
        }
      });
      
      // Send resolution email
      await onSendResolution(selectedDispute, {
        resolution: res,
        notes: adminNotes,
        changesMade: getResolutionChanges(res)
      });
      
      setSelectedDispute(null);
      setAdminNotes('');
      setResolution(null);
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getResolutionChanges = (resolution: string): string[] => {
    switch (resolution) {
      case 'accepted':
        return ['Entry updated based on provided evidence', 'Risk score adjusted'];
      case 'partial':
        return ['Some information corrected', 'Context added to entry'];
      case 'rejected':
        return ['Dispute rejected - insufficient evidence', 'Original entry maintained'];
      default:
        return [];
    }
  };

  const getUpdatedEntryPreview = (dispute: Dispute, resolution: string): string => {
    return `Updated entry for ${dispute.entityName} after ${resolution} resolution`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'under_review':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'needs_info':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'resolved_accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'resolved_partial':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'resolved_rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getVerificationIcon = (method?: string) => {
    switch (method) {
      case 'email':
        return <EnvelopeIcon className="w-4 h-4" />;
      case 'document':
        return <DocumentTextIcon className="w-4 h-4" />;
      case 'call':
        return <PhoneIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Fix implicit any types
  const handleEvidence = (evidence: any, idx: number) => {
    // Your logic for handling evidence
    console.log(`Evidence ${idx}:`, evidence);
  };

  const handleCategory = (category: string, idx: number) => {
    // Your logic for handling category
    console.log(`Category ${idx}: ${category}`);
  };

  // Email Preview Templates
  const getEmailTemplate = (type: 'confirmation' | 'verification' | 'resolution') => {
    if (!selectedDispute) return { subject: '', body: '' };
    
    const templates = {
      confirmation: {
        subject: `Dispute Confirmation: ${selectedDispute.caseId}`,
        body: `Dear ${selectedDispute.disputerName},

Thank you for submitting your dispute regarding ${selectedDispute.entityName}.

Case ID: ${selectedDispute.caseId}
Filed: ${new Date(selectedDispute.filedAt).toLocaleDateString()}
Due Date: ${new Date(selectedDispute.resolutionDueDate).toLocaleDateString()}

We will contact you within 24 hours to verify your identity via ${selectedDispute.verificationMethod}.

You can track your dispute status at:
https://sifter.com/disputes/track?caseId=${selectedDispute.caseId}

Sincerely,
The SIFTER Team`
      },
      
      verification: {
        subject: `Identity Verification Required: ${selectedDispute.caseId}`,
        body: `Dear ${selectedDispute.disputerName},

We need to verify your identity for dispute ${selectedDispute.caseId}.

Verification Method: ${selectedDispute.verificationMethod === 'call' ? 'Phone Call' : selectedDispute.verificationMethod === 'email' ? 'Email Reply' : 'Document Upload'}

Please respond to this email to confirm your identity and proceed with the dispute review.

If you requested a phone call, we will call you at the number provided.

If you need to change your verification method, please reply to this email.

Sincerely,
The SIFTER Team`
      },
      
      resolution: {
        subject: `Dispute Resolution: ${selectedDispute.caseId} - ${resolution ? resolution.charAt(0).toUpperCase() + resolution.slice(1) : 'Decision'}`,
        body: `Dear ${selectedDispute.disputerName},

Your dispute ${selectedDispute.caseId} regarding ${selectedDispute.entityName} has been reviewed.

RESOLUTION: ${resolution ? resolution.toUpperCase() : 'PENDING'}

${
  resolution === 'accepted' 
    ? `Your dispute has been accepted. The following changes will be made to the entry:
       - ${adminNotes || 'Entry will be updated based on provided evidence'}

       The updated entry will be visible within 24 hours.`
  : resolution === 'partial'
    ? `Your dispute has been partially accepted. Some changes will be made:
       - ${adminNotes || 'Specific corrections will be applied to the entry'}

       The entity entry will be updated accordingly.`
  : resolution === 'rejected'
    ? `Your dispute has been rejected. The original entry will be maintained because:
       - ${adminNotes || 'Insufficient counter-evidence provided'}

       You may submit additional evidence for reconsideration within 30 days.`
  : 'A decision is pending. You will be notified once the review is complete.'
}

You can view the updated entry at:
https://sifter.com/entities/${selectedDispute.entityId}

If you have questions about this decision, please reply to this email.

Sincerely,
The SIFTER Team`
      }
    };

    return templates[type];
  };

  const currentEmailTemplate = getEmailTemplate(emailPreviewType);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-sifter-card border border-blue-500/30 rounded-xl p-4">
          <div className="text-sm text-gray-400">Pending Review</div>
          <div className="text-3xl font-bold text-blue-400">{statusCounts.pending}</div>
          <div className="text-xs text-gray-500 mt-1">Awaiting assignment</div>
        </div>
        <div className="bg-sifter-card border border-yellow-500/30 rounded-xl p-4">
          <div className="text-sm text-gray-400">Under Review</div>
          <div className="text-3xl font-bold text-yellow-400">{statusCounts.under_review}</div>
          <div className="text-xs text-gray-500 mt-1">Active investigations</div>
        </div>
        <div className="bg-sifter-card border border-orange-500/30 rounded-xl p-4">
          <div className="text-sm text-gray-400">Needs Info</div>
          <div className="text-3xl font-bold text-orange-400">{statusCounts.needs_info}</div>
          <div className="text-xs text-gray-500 mt-1">Awaiting response</div>
        </div>
        <div className="bg-sifter-card border border-green-500/30 rounded-xl p-4">
          <div className="text-sm text-gray-400">Resolved</div>
          <div className="text-3xl font-bold text-green-400">{statusCounts.resolved}</div>
          <div className="text-xs text-gray-500 mt-1">Completed cases</div>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Dispute Management Queue</h2>
          <p className="text-gray-400 text-sm">
            {filteredDisputes.length} disputes • {disputes.filter(d => new Date(d.resolutionDueDate) < new Date()).length} overdue
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-sm font-medium flex items-center gap-2"
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
                Refresh
              </>
            )}
          </button>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-sifter-dark border border-sifter-border rounded-lg text-white text-sm"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="due_date">Sort: Due Date</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'pending', 'under_review', 'needs_info', 'resolved_accepted', 'resolved_partial', 'resolved_rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === status
                ? status.includes('resolved_accepted') ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                  status.includes('resolved_partial') ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                  status.includes('resolved_rejected') ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                  status === 'pending' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                  status === 'under_review' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                  status === 'needs_info' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' :
                  'bg-gray-700 text-white border border-gray-600'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300 border border-gray-700'
            }`}
          >
            {status.replace('_', ' ').replace('resolved ', '')}
            {status !== 'all' && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-black/30">
                {disputes.filter(d => status === 'all' || d.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Disputes Table */}
      <div className="border border-sifter-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sifter-dark">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Case ID</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Entity</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Disputer</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Filed</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Due</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Verification</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sifter-border">
              {filteredDisputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-sifter-dark/50">
                  <td className="p-4">
                    <div className="font-mono text-blue-400">{dispute.caseId}</div>
                    <div className="text-xs text-gray-500">
                      {dispute.categories.length} categories
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-white">{dispute.entityName}</div>
                    <div className="text-sm text-gray-400">{dispute.entityType}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-white">{dispute.disputerName}</div>
                    <div className="text-sm text-gray-400">{dispute.disputerTitle}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[150px]">
                      {dispute.disputerEmail}
                    </div>
                  </td>
                  <td className="p-4 text-gray-400">
                    {new Date(dispute.filedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="p-4">
                    <div className={`font-medium ${
                      new Date(dispute.resolutionDueDate) < new Date()
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}>
                      {new Date(dispute.resolutionDueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    {new Date(dispute.resolutionDueDate) < new Date() && (
                      <div className="text-xs text-red-400">Overdue</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      {getVerificationIcon(dispute.verificationMethod)}
                      <span className="text-sm">{dispute.verificationMethod || 'Pending'}</span>
                      {dispute.isVerified && (
                        <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(dispute.status)}`}>
                      {dispute.status.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedDispute(dispute)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded text-sm"
                      >
                        Review
                      </button>
                      {dispute.status === 'pending' && (
                        <button
                          onClick={() => onUpdateDispute(dispute.id, { status: 'under_review' })}
                          className="px-3 py-1 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30 rounded text-sm"
                        >
                          Start Review
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredDisputes.length === 0 && (
        <div className="text-center py-12 border border-sifter-border rounded-xl">
          <div className="w-20 h-20 bg-sifter-dark/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">No disputes found!</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            {filterStatus === 'all' 
              ? "There are currently no disputes in the system."
              : `No disputes with status "${filterStatus.replace('_', ' ')}".`}
          </p>
        </div>
      )}

      {/* Dispute Detail Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] overflow-y-auto p-4">
          <div className="min-h-screen flex items-center justify-center">
            <div className="bg-sifter-card border border-sifter-border rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 p-6 border-b border-sifter-border bg-sifter-card flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">Dispute Review</h2>
                  <p className="text-gray-400">
                    {selectedDispute.caseId} • {selectedDispute.entityName}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedDispute(null);
                    setResolution(null);
                    setAdminNotes('');
                    setEmailPreviewType('resolution');
                  }}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Dispute Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-sifter-dark/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">Disputer Info</div>
                    <div className="text-white font-medium">{selectedDispute.disputerName}</div>
                    <div className="text-sm text-gray-400">{selectedDispute.disputerTitle}</div>
                    <div className="text-sm text-blue-400">{selectedDispute.disputerEmail}</div>
                  </div>
                  
                  <div className="bg-sifter-dark/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">Timeline</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Filed:</span>
                        <span className="text-white">{new Date(selectedDispute.filedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Due:</span>
                        <span className={new Date(selectedDispute.resolutionDueDate) < new Date() ? 'text-red-400' : 'text-white'}>
                          {new Date(selectedDispute.resolutionDueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Age:</span>
                        <span className="text-white">
                          {Math.floor((new Date().getTime() - new Date(selectedDispute.filedAt).getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-sifter-dark/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">Verification</div>
                    <div className="text-white font-medium">{selectedDispute.verificationMethod || 'Not specified'}</div>
                    <div className="text-sm text-gray-400">
                      Verified: {selectedDispute.isVerified ? 'Yes' : 'No'}
                    </div>
                    {!selectedDispute.isVerified && (
                      <button 
                        onClick={() => {
                          setEmailPreviewType('verification');
                          onUpdateDispute(selectedDispute.id, { 
                            verificationMethod: selectedDispute.verificationMethod || 'email' 
                          });
                        }}
                        className="mt-2 px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm rounded"
                      >
                        Request Verification
                      </button>
                    )}
                  </div>
                </div>

                {/* Categories & Explanation */}
                <div className="border border-sifter-border rounded-lg p-6">
                  <h3 className="font-medium text-white mb-4">Dispute Details</h3>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-2">Categories:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedDispute.categories.map((category, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                          {category.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Explanation:</div>
                    <div className="bg-sifter-dark p-4 rounded-lg whitespace-pre-wrap">
                      {selectedDispute.explanation}
                    </div>
                  </div>
                </div>

                {/* Counter Evidence */}
                <div className="border border-sifter-border rounded-lg p-6">
                  <h3 className="font-medium text-white mb-4">Counter Evidence ({selectedDispute.counterEvidence.length})</h3>
                  
                  <div className="space-y-4">
                    {selectedDispute.counterEvidence.map((evidence, idx) => (
                      <div key={evidence.id} className="bg-sifter-dark/50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-white">{evidence.title}</h4>
                            <div className="text-sm text-gray-400">{evidence.type}</div>
                          </div>
                          <span className="text-xs text-gray-500">
                             {evidence.uploadedAt ? new Date(evidence.uploadedAt).toLocaleDateString() : 'Unknown date'}  {/* ✅ Add null check */}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{evidence.description}</p>
                        {evidence.url && (
                          <a 
                            href={evidence.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            View Evidence →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Email Preview */}
                <div className="border border-sifter-border rounded-lg p-6">
                  <h3 className="font-medium text-white mb-4">Email Preview</h3>
                  
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setEmailPreviewType('confirmation')}
                      className={`px-3 py-2 rounded text-sm ${
                        emailPreviewType === 'confirmation' 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      Confirmation
                    </button>
                    <button
                      onClick={() => setEmailPreviewType('verification')}
                      className={`px-3 py-2 rounded text-sm ${
                        emailPreviewType === 'verification' 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      Verification
                    </button>
                    <button
                      onClick={() => setEmailPreviewType('resolution')}
                      className={`px-3 py-2 rounded text-sm ${
                        emailPreviewType === 'resolution' 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      Resolution
                    </button>
                  </div>
                  
                  <div className="bg-white text-black rounded-lg overflow-hidden">
                    <div className="border-b p-4">
                      <div className="text-sm text-gray-500">To: {selectedDispute.disputerEmail}</div>
                      <div className="text-sm text-gray-500">From: disputes@sifter.com</div>
                      <div className="font-medium mt-2">{currentEmailTemplate.subject}</div>
                    </div>
                    
                    <div className="p-4 font-sans whitespace-pre-wrap text-sm min-h-[200px]">
                      {currentEmailTemplate.body}
                    </div>
                    
                    <div className="border-t p-4 bg-gray-50">
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            const emailWindow = window.open('', 'email-preview');
                            if (emailWindow) {
                              emailWindow.document.write(`
                                <html>
                                  <body style="font-family: sans-serif; padding: 20px;">
                                    <h2>${currentEmailTemplate.subject}</h2>
                                    <pre style="white-space: pre-wrap; font-family: inherit;">${currentEmailTemplate.body}</pre>
                                  </body>
                                </html>
                              `);
                            }
                          }}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                        >
                          Open Preview
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(currentEmailTemplate.body);
                            alert('Email content copied to clipboard!');
                          }}
                          className="px-4 py-2 border border-gray-300 rounded text-sm"
                        >
                          Copy Content
                        </button>
                        <button
                          onClick={() => alert(`Email would be sent to: ${selectedDispute.disputerEmail}`)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                        >
                          Send Email
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resolution Options */}
                <div className="border border-sifter-border rounded-lg p-6">
                  <h3 className="font-medium text-white mb-4">Resolution</h3>
                  
                  <div className="mb-6">
                    <label className="block text-white font-medium mb-3">Admin Notes:</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full h-32 px-4 py-3 bg-sifter-dark border border-sifter-border rounded-lg text-white resize-none"
                      placeholder="Add notes about your investigation. These will be included in the resolution email."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => {
                        setResolution('accepted');
                        setEmailPreviewType('resolution');
                      }}
                      disabled={isProcessing}
                      className={`p-4 rounded-lg disabled:opacity-50 ${
                        resolution === 'accepted'
                          ? 'bg-green-500/30 border-2 border-green-500 text-green-400'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                      }`}
                    >
                      <div className="font-medium mb-1">Accept Dispute</div>
                      <div className="text-sm text-gray-400">Update entry as requested</div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setResolution('partial');
                        setEmailPreviewType('resolution');
                      }}
                      disabled={isProcessing}
                      className={`p-4 rounded-lg disabled:opacity-50 ${
                        resolution === 'partial'
                          ? 'bg-yellow-500/30 border-2 border-yellow-500 text-yellow-400'
                          : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30'
                      }`}
                    >
                      <div className="font-medium mb-1">Partial Acceptance</div>
                      <div className="text-sm text-gray-400">Make some changes</div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setResolution('rejected');
                        setEmailPreviewType('resolution');
                      }}
                      disabled={isProcessing}
                      className={`p-4 rounded-lg disabled:opacity-50 ${
                        resolution === 'rejected'
                          ? 'bg-red-500/30 border-2 border-red-500 text-red-400'
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                      }`}
                    >
                      <div className="font-medium mb-1">Reject Dispute</div>
                      <div className="text-sm text-gray-400">Maintain original entry</div>
                    </button>
                  </div>
                  
                  {resolution && (
                    <div className="mt-6 p-4 bg-sifter-dark/50 border border-sifter-border rounded-lg">
                      <h4 className="font-medium text-white mb-2">Ready to submit resolution?</h4>
                      <p className="text-gray-400 text-sm mb-4">
                        This will update the dispute status and send the resolution email.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleResolveDispute(resolution)}
                          disabled={isProcessing}
                          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Processing...
                            </>
                          ) : (
                            'Submit Resolution'
                          )}
                        </button>
                        <button
                          onClick={() => setResolution(null)}
                          className="px-6 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {isProcessing && !resolution && (
                    <div className="mt-4 text-center text-gray-400">
                      Processing resolution...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}