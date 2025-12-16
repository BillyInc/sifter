// components/ShareDialog.tsx
'use client';

import React, { useState } from 'react';
import { ProjectData } from '@/types';
import { ExportService } from '@/services/exportService';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectData: ProjectData;
  shareUrl?: string;
}

type SharePlatform = 'twitter' | 'linkedin' | 'email' | 'copy';

export default function ShareDialog({ isOpen, onClose, projectData, shareUrl }: ShareDialogProps) {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');

  if (!isOpen) return null;

  const handleShare = async (platform: SharePlatform) => {
    setSelectedPlatform(platform);

    if (platform === 'copy') {
      const textToCopy = shareUrl || window.location.href;
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      return;
    }

    if (platform === 'email') {
      if (email) {
        const subject = `Sifter Analysis: ${projectData.displayName}`;
        const body = `Check out this Sifter Analysis:\n\nProject: ${projectData.displayName}\nRisk Score: ${projectData.overallRisk.score}/100\nVerdict: ${projectData.overallRisk.verdict.toUpperCase()}\n\nView full report: ${shareUrl || window.location.href}`;
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
        
        // Mock email sending UI feedback
        setEmailSent(true);
        setTimeout(() => {
          setEmailSent(false);
          setEmail('');
        }, 3000);
      }
      return;
    }

    // Handle social media sharing using ExportService.shareAnalysis
    if (platform === 'twitter' || platform === 'linkedin') {
      await ExportService.shareAnalysis(projectData, platform);
    }
  };

  const shareOptions: { id: SharePlatform; name: string; icon: string; color: string }[] = [
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'hover:bg-blue-500/20 hover:border-blue-500/50' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'hover:bg-blue-700/20 hover:border-blue-700/50' },
    { id: 'copy', name: 'Copy Link', icon: '🔗', color: 'hover:bg-gray-500/20 hover:border-gray-500/50' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-sifter-card border border-sifter-border rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Share Analysis</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Project Summary */}
        <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-white">{projectData.displayName}</h4>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              projectData.overallRisk.score >= 80 ? 'bg-red-500/30 text-red-400' :
              projectData.overallRisk.score >= 60 ? 'bg-orange-500/30 text-orange-400' :
              projectData.overallRisk.score >= 40 ? 'bg-yellow-500/30 text-yellow-400' :
              'bg-green-500/30 text-green-400'
            }`}>
              {projectData.overallRisk.score}/100
            </div>
          </div>
          <p className="text-sm text-gray-300">
            Verdict: <span className="font-medium text-white">{projectData.overallRisk.verdict.toUpperCase()}</span>
            <br />
            Confidence: <span className="font-medium text-white">{projectData.overallRisk.confidence}%</span>
          </p>
        </div>

        {/* Share Options */}
        <div className="mb-6">
          <h4 className="font-medium text-white mb-4">Share via</h4>
          <div className="grid grid-cols-3 gap-3">
            {shareOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleShare(option.id)}
                className={`p-4 border border-sifter-border rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${option.color} ${
                  selectedPlatform === option.id ? 'border-blue-500 bg-blue-500/10' : ''
                }`}
              >
                <span className="text-2xl">{option.icon}</span>
                <span className="text-sm text-gray-300">{option.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Email Share */}
        <div className="mb-6">
          <h4 className="font-medium text-white mb-3">Email Report</h4>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recipient@example.com"
              className="flex-1 bg-sifter-dark border border-sifter-border rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={() => handleShare('email')}
              disabled={!email}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              {emailSent ? '✓ Sent' : 'Send'}
            </button>
          </div>
          {emailSent && (
            <p className="text-green-400 text-sm mt-2">Email client opened for {email}</p>
          )}
        </div>

        {/* Share URL */}
        <div className="mb-6">
          <h4 className="font-medium text-white mb-3">Shareable Link</h4>
          <div className="flex gap-2">
            <div className="flex-1 bg-sifter-dark border border-sifter-border rounded-lg px-4 py-3 text-gray-400 text-sm truncate">
              {shareUrl || window.location.href}
            </div>
            <button
              onClick={() => handleShare('copy')}
              className={`px-4 py-3 ${copied ? 'bg-green-800 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-700'} text-white rounded-lg font-medium transition-colors`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Export Options */}
        <div>
          <h4 className="font-medium text-white mb-3">Export Options</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => ExportService.exportMetricsToCSV(projectData.metrics, projectData.displayName)}
              className="p-3 border border-sifter-border rounded-lg hover:border-green-500/50 hover:bg-green-500/10 transition-colors flex items-center gap-2"
            >
              <span className="text-xl">📊</span>
              <span className="text-sm text-gray-300">CSV</span>
            </button>
            <button
              onClick={() => ExportService.exportProjectAnalysis(projectData)}
              className="p-3 border border-sifter-border rounded-lg hover:border-blue-500/50 hover:bg-blue-500/10 transition-colors flex items-center gap-2"
            >
              <span className="text-xl">💾</span>
              <span className="text-sm text-gray-300">JSON</span>
            </button>
            <button
              onClick={() => ExportService.exportToPDF(projectData)}
              className="p-3 border border-sifter-border rounded-lg hover:border-red-500/50 hover:bg-red-500/10 transition-colors flex items-center gap-2"
            >
              <span className="text-xl">📄</span>
              <span className="text-sm text-gray-300">PDF</span>
            </button>
            <button
              onClick={() => ExportService.exportResearchReport(projectData)}
              className="p-3 border border-sifter-border rounded-lg hover:border-purple-500/50 hover:bg-purple-500/10 transition-colors flex items-center gap-2"
            >
              <span className="text-xl">🔬</span>
              <span className="text-sm text-gray-300">Research</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}