// src/components/data-donation/admin/evidence/EvidenceVault.tsx
'use client';

import React, { useState } from 'react';
import { EvidenceVaultItem } from '@/types/evidence-vault';
import { CheckCircleIcon, ExclamationCircleIcon, ClockIcon, LinkIcon, DocumentIcon, ArchiveBoxIcon, PhotoIcon, ServerIcon } from '@heroicons/react/24/outline';

interface EvidenceVaultProps {
  evidence: EvidenceVaultItem[];
  onVerifyEvidence: (evidenceId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function EvidenceVault({
  evidence,
  onVerifyEvidence,
  onRefresh
}: EvidenceVaultProps) {
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceVaultItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get unique entities
  const entities = Array.from(new Set(evidence.map(e => e.entityName)));

  // Filter evidence
  const filteredEvidence = evidence.filter(item => {
    if (filterEntity !== 'all' && item.entityName !== filterEntity) return false;
    if (filterStatus !== 'all' && item.verificationStatus !== filterStatus) return false;
    return true;
  });

  // Group by entity
  const evidenceByEntity = filteredEvidence.reduce((acc, item) => {
    if (!acc[item.entityName]) {
      acc[item.entityName] = [];
    }
    acc[item.entityName].push(item);
    return acc;
  }, {} as Record<string, EvidenceVaultItem[]>);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'disputed':
        return 'bg-red-500/20 text-red-400';
      case 'invalid':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'twitter_post':
        return '🐦';
      case 'blockchain_transaction':
        return '⛓️';
      case 'news_article':
        return '📰';
      case 'archived_website':
        return '📄';
      case 'legal_document':
        return '⚖️';
      case 'discord_export':
        return '💬';
      case 'telegram_export':
        return '📱';
      default:
        return '📎';
    }
  };

  const getBackupStatus = (item: EvidenceVaultItem) => {
    const backups = [
      { name: 'Original', icon: LinkIcon, status: item.verificationResults?.originalAccessible },
      { name: 'Archive', icon: ArchiveBoxIcon, status: item.verificationResults?.archiveAccessible },
      { name: 'Screenshot', icon: PhotoIcon, status: item.verificationResults?.screenshotExists },
      { name: 'IPFS', icon: ServerIcon, status: item.verificationResults?.ipfsAccessible }
    ];
    
    return backups;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Evidence Vault</h2>
          <p className="text-gray-400 text-sm">
            {evidence.length} evidence items • {evidence.filter(e => e.verificationStatus === 'verified').length} verified
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
                Verifying...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Verify All
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Filter by Entity</label>
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="w-full px-4 py-2 bg-sifter-dark border border-sifter-border rounded-lg text-white"
          >
            <option value="all">All Entities</option>
            {entities.map(entity => (
              <option key={entity} value={entity}>{entity}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 bg-sifter-dark border border-sifter-border rounded-lg text-white"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="disputed">Disputed</option>
            <option value="invalid">Invalid</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-sifter-card border border-green-500/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-400">
            {evidence.filter(e => e.verificationResults?.originalAccessible).length}
          </div>
          <div className="text-sm text-gray-400">Original Links Active</div>
        </div>
        
        <div className="bg-sifter-card border border-blue-500/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-400">
            {evidence.filter(e => e.verificationResults?.archiveAccessible).length}
          </div>
          <div className="text-sm text-gray-400">Archived Copies</div>
        </div>
        
        <div className="bg-sifter-card border border-purple-500/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-purple-400">
            {evidence.filter(e => e.verificationResults?.screenshotExists).length}
          </div>
          <div className="text-sm text-gray-400">Screenshots</div>
        </div>
        
        <div className="bg-sifter-card border border-amber-500/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-amber-400">
            {evidence.filter(e => e.verificationResults?.ipfsAccessible).length}
          </div>
          <div className="text-sm text-gray-400">IPFS Backups</div>
        </div>
      </div>

      {/* Evidence by Entity */}
      <div className="space-y-6">
        {Object.entries(evidenceByEntity).map(([entityName, entityEvidence]) => (
          <div key={entityName} className="border border-sifter-border rounded-xl overflow-hidden">
            {/* Entity Header */}
            <div className="p-4 border-b border-sifter-border bg-sifter-dark/30">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-white">{entityName}</h3>
                  <p className="text-sm text-gray-400">
                    {entityEvidence.length} evidence items • Last verified: {
                      entityEvidence.length > 0 
                        ? new Date(Math.max(...entityEvidence.map(e => new Date(e.lastVerified || e.capturedDate).getTime()))).toLocaleDateString()
                        : 'Never'
                    }
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Verify all evidence for this entity
                    entityEvidence.forEach(ev => onVerifyEvidence(ev.id));
                  }}
                  className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded text-sm"
                >
                  Verify All
                </button>
              </div>
            </div>

            {/* Evidence Items */}
            <div className="divide-y divide-sifter-border">
              {entityEvidence.map((item) => (
                <div key={item.id} className="p-4 hover:bg-sifter-dark/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">{getTypeIcon(item.type)}</span>
                        <div>
                          <div className="font-medium text-white">{item.title}</div>
                          <div className="text-sm text-gray-400 flex items-center gap-2">
                            <span>{item.type.replace('_', ' ')}</span>
                            <span>•</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.verificationStatus)}`}>
                              {item.verificationStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {item.description && (
                        <p className="text-gray-300 text-sm mb-3">{item.description}</p>
                      )}
                      
                      {/* Backup Status */}
                      <div className="flex flex-wrap gap-4 mt-3">
                        {getBackupStatus(item).map((backup, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <backup.icon className={`w-4 h-4 ${
                              backup.status ? 'text-green-400' : 'text-gray-500'
                            }`} />
                            <span className={`text-sm ${backup.status ? 'text-green-400' : 'text-gray-500'}`}>
                              {backup.name}
                            </span>
                            {backup.status ? (
                              <CheckCircleIcon className="w-4 h-4 text-green-400" />
                            ) : (
                              <ExclamationCircleIcon className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-sm text-gray-400 mb-2">
                        {new Date(item.capturedDate).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => setSelectedEvidence(item)}
                        className="px-3 py-1 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded text-sm"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvidence.length === 0 && (
        <div className="text-center py-12 border border-sifter-border rounded-xl">
          <div className="w-20 h-20 bg-sifter-dark/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <DocumentIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">No evidence found</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            {filterEntity !== 'all' || filterStatus !== 'all'
              ? "No evidence matches your filters."
              : "No evidence has been archived yet."}
          </p>
        </div>
      )}

      {/* Evidence Detail Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] overflow-y-auto p-4">
          <div className="min-h-screen flex items-center justify-center">
            <div className="bg-sifter-card border border-sifter-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 p-6 border-b border-sifter-border bg-sifter-card flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">Evidence Details</h2>
                  <p className="text-gray-400">
                    {selectedEvidence.entityName} • {selectedEvidence.type.replace('_', ' ')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEvidence(null)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Evidence Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Title</div>
                      <div className="text-white font-medium">{selectedEvidence.title}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Description</div>
                      <div className="text-gray-300">{selectedEvidence.description}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Submitted By</div>
                      <div className="text-white">{selectedEvidence.submittedBy}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Capture Date</div>
                      <div className="text-white">{new Date(selectedEvidence.capturedDate).toLocaleDateString()}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Last Verified</div>
                      <div className="text-white">
                        {selectedEvidence.lastVerified 
                          ? new Date(selectedEvidence.lastVerified).toLocaleDateString()
                          : 'Never'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Severity</div>
                      <div className={`px-3 py-1 inline-block rounded-full text-sm ${
                        selectedEvidence.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        selectedEvidence.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        selectedEvidence.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {selectedEvidence.severity}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Backup Verification */}
                <div className="border border-sifter-border rounded-lg p-6">
                  <h3 className="font-medium text-white mb-4">Backup Verification Status</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getBackupStatus(selectedEvidence).map((backup, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border ${
                        backup.status 
                          ? 'border-green-500/30 bg-green-500/10' 
                          : 'border-gray-500/30 bg-gray-500/10'
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          <backup.icon className={`w-5 h-5 ${backup.status ? 'text-green-400' : 'text-gray-500'}`} />
                          <span className="font-medium text-white">{backup.name}</span>
                          {backup.status ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-400 ml-auto" />
                          ) : (
                            <ExclamationCircleIcon className="w-5 h-5 text-gray-500 ml-auto" />
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          {backup.status ? 'Verified and accessible' : 'Not available'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Links */}
                <div className="border border-sifter-border rounded-lg p-6">
                  <h3 className="font-medium text-white mb-4">Evidence Links</h3>
                  
                  <div className="space-y-3">
                    {selectedEvidence.originalUrl && (
                      <div className="flex items-center justify-between p-3 bg-sifter-dark/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <LinkIcon className="w-5 h-5 text-blue-400" />
                          <div>
                            <div className="text-white">Original URL</div>
                            <div className="text-sm text-gray-400 truncate max-w-[300px]">
                              {selectedEvidence.originalUrl}
                            </div>
                          </div>
                        </div>
                        <a 
                          href={selectedEvidence.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-sm"
                        >
                          Open
                        </a>
                      </div>
                    )}
                    
                    {selectedEvidence.archivedUrl && (
                      <div className="flex items-center justify-between p-3 bg-sifter-dark/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <ArchiveBoxIcon className="w-5 h-5 text-green-400" />
                          <div>
                            <div className="text-white">Archived URL</div>
                            <div className="text-sm text-gray-400 truncate max-w-[300px]">
                              {selectedEvidence.archivedUrl}
                            </div>
                          </div>
                        </div>
                        <a 
                          href={selectedEvidence.archivedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded text-sm"
                        >
                          Open
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="border border-sifter-border rounded-lg p-6">
                  <h3 className="font-medium text-white mb-4">Actions</h3>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => onVerifyEvidence(selectedEvidence.id)}
                      className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg"
                    >
                      Verify Now
                    </button>
                    
                    <button
                      onClick={() => {
                        // Archive this evidence
                        console.log('Archive evidence:', selectedEvidence.id);
                      }}
                      className="px-4 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg"
                    >
                      Create Archive
                    </button>
                    
                    <button
                      onClick={() => {
                        // Take screenshot
                        console.log('Take screenshot of:', selectedEvidence.id);
                      }}
                      className="px-4 py-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg"
                    >
                      Take Screenshot
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}