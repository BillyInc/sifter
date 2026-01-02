'use client';

import React, { useState, useCallback } from 'react';
import { EvidenceItem } from '@/types';

// REMOVE this duplicate interface declaration
// interface EvidenceUploadProps {
//   submissionId: string;
//   existingEvidence: EvidenceItem[];
//   onUpload: (evidence: Omit<EvidenceItem, 'id' | 'submittedAt'>[]) => Promise<void>;
//   onCancel: () => void;
//   mode: 'ea-vc' | 'researcher' | 'individual';
//   maxFiles?: number;
// }

// Add this exported interface at the TOP (before the component)
export interface EvidenceUploadProps {
  submissionId: string;
  existingEvidence: EvidenceItem[];
  onUpload: (evidence: Omit<EvidenceItem, 'id' | 'submittedAt'>[]) => Promise<void>;
  onCancel: () => void;
  mode: 'ea-vc' | 'researcher' | 'individual';
  maxFiles?: number;
  compact?: boolean;
  
}

export default function EvidenceUpload({
  submissionId,
  existingEvidence = [],
  onUpload,
  onCancel,
  compact = false,  // ADD THIS LINE

  mode,
  maxFiles = 10
}: EvidenceUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [evidenceItems, setEvidenceItems] = useState<Omit<EvidenceItem, 'id' | 'submittedAt'>[]>(
    existingEvidence.map(e => ({
      entityId: e.entityId,
      evidenceType: e.evidenceType,
      originalUrl: e.originalUrl,
      archivedUrl: e.archivedUrl,
      screenshotUrl: e.screenshotUrl,
      ipfsHash: e.ipfsHash,
      evidenceTitle: e.evidenceTitle,
      evidenceDescription: e.evidenceDescription,
      severity: e.severity,
      verificationStatus: 'pending',
      submittedBy: '',
      verifiedBy: e.verifiedBy
    }))
  );
  
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'url' | 'file' | 'screenshot'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<EvidenceItem['evidenceType']>('twitter_post');
  const [selectedSeverity, setSelectedSeverity] = useState<EvidenceItem['severity']>('medium');

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }
    
    setFiles(prev => [...prev, ...imageFiles]);
    
    // Create evidence items for each file
    const newEvidenceItems: Omit<EvidenceItem, 'id' | 'submittedAt'>[] = imageFiles.map(file => ({
      entityId: submissionId,
      evidenceType: 'twitter_post',
      originalUrl: URL.createObjectURL(file),
      archivedUrl: undefined,
      screenshotUrl: URL.createObjectURL(file),
      ipfsHash: undefined,
      evidenceTitle: file.name,
      evidenceDescription: `Uploaded screenshot: ${file.name}`,
      severity: 'medium',
      verificationStatus: 'pending',
      submittedBy: '',
      verifiedBy: undefined
    }));
    
    setEvidenceItems(prev => [...prev, ...newEvidenceItems]);
  }, [files, maxFiles, submissionId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }
    
    setFiles(prev => [...prev, ...imageFiles]);

    const newEvidenceItems: Omit<EvidenceItem, 'id' | 'submittedAt'>[] = imageFiles.map(file => ({
      entityId: submissionId,
      evidenceType: 'twitter_post',
      originalUrl: URL.createObjectURL(file),
      archivedUrl: undefined,
      screenshotUrl: URL.createObjectURL(file),
      ipfsHash: undefined,
      evidenceTitle: file.name,
      evidenceDescription: `Uploaded file: ${file.name}`,
      severity: 'medium',
      verificationStatus: 'pending',
      submittedBy: '',
      verifiedBy: undefined
    }));

    setEvidenceItems(prev => [...prev, ...newEvidenceItems]);
  };

  const handleAddUrl = () => {
    if (!urlInput.trim() || !description.trim()) {
      alert('Please provide both URL and description');
      return;
    }

    const newEvidence: Omit<EvidenceItem, 'id' | 'submittedAt'> = {
      entityId: submissionId,
      evidenceType: selectedType,
      originalUrl: urlInput,
      archivedUrl: undefined,
      screenshotUrl: undefined,
      ipfsHash: undefined,
      evidenceTitle: `Evidence from ${new URL(urlInput).hostname}`,
      evidenceDescription: description,
      severity: selectedSeverity,
      verificationStatus: 'pending',
      submittedBy: '',
      verifiedBy: undefined
    };

    setEvidenceItems(prev => [...prev, newEvidence]);
    setUrlInput('');
    setDescription('');
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setEvidenceItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidenceItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (evidenceItems.length === 0) {
      alert('Please add at least one piece of evidence');
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(evidenceItems);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload evidence. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const evidenceTypes = [
    { value: 'twitter_post' as const, label: 'Twitter/X Post', icon: '🐦' },
    { value: 'reddit_thread' as const, label: 'Reddit Thread', icon: '👾' },
    { value: 'blockchain_transaction' as const, label: 'Blockchain TX', icon: '⛓️' },
    { value: 'news_article' as const, label: 'News Article', icon: '📰' },
    { value: 'archived_website' as const, label: 'Archived Website', icon: '💾' }
  ];

  const severityLevels = [
    { value: 'low' as const, label: 'Low', color: 'text-green-400 bg-green-400/10' },
    { value: 'medium' as const, label: 'Medium', color: 'text-amber-400 bg-amber-400/10' },
    { value: 'high' as const, label: 'High', color: 'text-orange-400 bg-orange-400/10' },
    { value: 'critical' as const, label: 'Critical', color: 'text-red-400 bg-red-400/10' }
  ];

  return (
    <div className="bg-sifter-card border border-sifter-border rounded-2xl p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Add Evidence</h2>
          <p className="text-sm text-gray-400">
            Submission ID: <span className="font-mono text-blue-400">{submissionId}</span>
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white text-2xl"
        >
          ✕
        </button>
      </div>

      {/* Evidence Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-sifter-dark/50 border border-sifter-border rounded-lg p-4">
          <div className="text-2xl font-bold text-white mb-1">{evidenceItems.length}</div>
          <div className="text-sm text-gray-400">Total Evidence</div>
        </div>
        <div className="bg-sifter-dark/50 border border-sifter-border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400 mb-1">{files.length}</div>
          <div className="text-sm text-gray-400">Files</div>
        </div>
        <div className="bg-sifter-dark/50 border border-sifter-border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {evidenceItems.filter(e => e.verificationStatus === 'verified').length}
          </div>
          <div className="text-sm text-gray-400">Verified</div>
        </div>
        <div className="bg-sifter-dark/50 border border-sifter-border rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-400 mb-1">
            {evidenceItems.filter(e => e.severity === 'critical').length}
          </div>
          <div className="text-sm text-gray-400">Critical</div>
        </div>
      </div>

      {/* Add Evidence Tabs */}
      <div className="mb-8">
        <div className="border-b border-sifter-border mb-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('url')}
              className={`pb-3 font-medium ${activeTab === 'url' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400'}`}
            >
              Add URL
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`pb-3 font-medium ${activeTab === 'file' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400'}`}
            >
              Upload Files
            </button>
            <button
              onClick={() => setActiveTab('screenshot')}
              className={`pb-3 font-medium ${activeTab === 'screenshot' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-400'}`}
            >
              Take Screenshot
            </button>
          </div>
        </div>

        {/* URL Input */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Evidence URL</label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="https://twitter.com/user/status/123456..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white min-h-[100px] focus:border-blue-500 focus:outline-none"
                placeholder="What does this evidence show? Why is it important?"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Evidence Type</label>
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as EvidenceItem['evidenceType'])}
                  className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  {evidenceTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Severity</label>
                <select 
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value as EvidenceItem['severity'])}
                  className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  {severityLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleAddUrl}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                       text-white rounded-lg font-medium transition-all"
            >
              Add URL Evidence
            </button>
          </div>
        )}

        {/* File Upload */}
        {activeTab === 'file' && (
          <div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-sifter-border rounded-xl p-8 text-center hover:border-blue-500 transition-colors"
            >
              <div className="w-16 h-16 bg-sifter-dark/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-white mb-2">Drop files here or click to upload</p>
              <p className="text-sm text-gray-400 mb-4">
                Supports JPG, PNG, PDF (Max 10MB each)
              </p>
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 
                         border border-blue-500/30 rounded-lg cursor-pointer transition-colors"
              >
                Choose Files
              </label>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-white mb-3">Selected Files ({files.length})</h4>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-sifter-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sifter-dark/50 rounded flex items-center justify-center">
                          <span className="text-lg">
                            {file.type.startsWith('image/') ? '🖼️' : '📄'}
                          </span>
                        </div>
                        <div>
                          <div className="text-white text-sm">{file.name}</div>
                          <div className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Screenshot Tool */}
        {activeTab === 'screenshot' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-sifter-dark/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📸</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Take Screenshot</h3>
            <p className="text-gray-400 mb-6">
              Use browser extensions or screen capture tools to take screenshots, then upload them as files.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <button className="p-4 border border-sifter-border rounded-lg hover:border-blue-500 transition-colors">
                <span className="text-2xl mb-2 block">🔧</span>
                <span className="text-sm">Browser Extension</span>
              </button>
              <button className="p-4 border border-sifter-border rounded-lg hover:border-blue-500 transition-colors">
                <span className="text-2xl mb-2 block">💻</span>
                <span className="text-sm">Screen Capture</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Evidence List */}
      {evidenceItems.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Evidence List</h3>
          <div className="space-y-3">
            {evidenceItems.map((evidence, index) => (
              <div key={index} className="border border-sifter-border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs ${severityLevels.find(s => s.value === evidence.severity)?.color}`}>
                        {evidence.severity.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {evidenceTypes.find(t => t.value === evidence.evidenceType)?.icon} 
                        {evidenceTypes.find(t => t.value === evidence.evidenceType)?.label}
                      </span>
                    </div>
                    <h4 className="font-medium text-white">{evidence.evidenceTitle}</h4>
                    <p className="text-sm text-gray-400 mt-1">{evidence.evidenceDescription}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveEvidence(index)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-xs text-gray-500 truncate" title={evidence.originalUrl}>
                  {evidence.originalUrl}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={isUploading || evidenceItems.length === 0}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                   text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <svg className="animate-spin w-4 h-4 text-white inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            `Upload Evidence (${evidenceItems.length})`
          )}
        </button>
      </div>
    </div>
  );
}

// REMOVE this duplicate export at the end - you already have it at the top
// export interface EvidenceUploadProps {
//   submissionId: string;
//   existingEvidence: EvidenceItem[];
//   onUpload: (evidence: Omit<EvidenceItem, 'id' | 'submittedAt'>[]) => Promise<void>;
//   onCancel: () => void;
//   mode: 'ea-vc' | 'researcher' | 'individual';
//   maxFiles?: number;
// }

// REMOVE this duplicate export default - you already have it at line 15
// export default EvidenceUpload;
