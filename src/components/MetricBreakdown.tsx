
// components/MetricBreakdown.tsx - UPDATED TO ACCEPT ARRAY
'use client';

import React, { useState } from 'react';
import {
  MetricData,
  ProjectData
} from '@/types';

interface MetricBreakdownProps {
  metrics: MetricData[]; // ✅ CHANGED FROM OBJECT TO ARRAY
  onExport?: () => void;
  onBack?: () => void;
  projectName?: string;
  riskScore?: number;
  projectData?: ProjectData;
  instanceId?: string; // ✅ ADD THIS
   compact?: boolean; // Add this

}



// Helper function to get metric properties
const getMetricVerdict = (score: number): string => {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'moderate';
  if (score >= 20) return 'low';
  return 'minimal';
};

const getMetricSummary = (metric: MetricData): string => {
  // ✅ NO EVIDENCE CHECK - Just go straight to flags
  if (metric.flags && metric.flags.length > 0) {
    return `Flag: ${metric.flags[0]}`;
  }
  
  // Fallback based on score
  const score = metric.value as number;
  if (score >= 80) return 'Critical risk level - Immediate attention required';
  if (score >= 60) return 'High risk level - Significant concerns';
  if (score >= 40) return 'Moderate risk level - Some concerns';
  if (score >= 20) return 'Low risk level - Minor concerns';
  return 'Minimal risk level - Within acceptable range';
};

// Define metric details with icons and descriptions
const metricDetails: Record<string, { icon: string; description: string; weight: number }> = {
  teamIdentity: { icon: '👤', description: 'Team legitimacy and identity verification', weight: 13 },
  teamCompetence: { icon: '🎓', description: 'Technical ability and track record', weight: 11 },
  contaminatedNetwork: { icon: '🕸️', description: 'Connections to known bad actors', weight: 19 },
  mercenaryKeywords: { icon: '💰', description: 'Financial vs genuine community discourse', weight: 9 },
  messageTimeEntropy: { icon: '⏰', description: 'Natural vs coordinated posting patterns', weight: 5 },
  accountAgeEntropy: { icon: '📅', description: 'Organic vs bulk account creation', weight: 5 },
  tweetFocus: { icon: '🐦', description: 'Narrative consistency and coherence', weight: 7 },
  githubAuthenticity: { icon: '💻', description: 'Real development vs copy-paste code', weight: 10 },
  busFactor: { icon: '🚌', description: 'Single point of failure risk', weight: 2 },
  artificialHype: { icon: '📈', description: 'Organic vs paid growth campaigns', weight: 5 },
  founderDistraction: { icon: '🎯', description: 'Focus on building vs personal brand', weight: 6 },
  engagementAuthenticity: { icon: '💬', description: 'Genuine vs performative engagement', weight: 10 },
  tokenomics: { icon: '📊', description: 'Economic structure and fairness', weight: 7 },
};

export default function MetricBreakdown({
  metrics,
  onExport,
  onBack,
  projectName = 'Unknown Project',
  riskScore = 0,
  projectData,
  instanceId = '' // ✅ ADD THIS with default empty string
}: MetricBreakdownProps) {
  console.log('🔍 MetricBreakdown RENDERED with instanceId:', instanceId);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const toggleMetric = (metricId: string) => {
    setExpandedMetric(expandedMetric === metricId ? null : metricId);
  };

  const getMetricColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    if (score >= 20) return 'text-blue-400';
    return 'text-green-400';
  };

  const getMetricBgColor = (score: number) => {
    if (score >= 80) return 'bg-red-500/10';
    if (score >= 60) return 'bg-orange-500/10';
    if (score >= 40) return 'bg-yellow-500/10';
    if (score >= 20) return 'bg-blue-500/10';
    return 'bg-green-500/10';
  };

  const getStatusIcon = (score: number) => {
    if (score >= 80) return '🔴';
    if (score >= 60) return '🟠';
    if (score >= 40) return '🟡';
    if (score >= 20) return '🟢';
    return '⚪';
  };

  // Process metrics array into display format
  const processedMetrics = metrics.map((metric, index) => {  // ✅ Add index here
    
        const score = typeof metric.value === 'number' ? metric.value : 0;
    const details = metricDetails[metric.key] || { 
      icon: '📊', 
      description: metric.name || 'No description available',
      weight: metric.weight || 10 
    };

    return {
      ...metric,
      id: `${instanceId}_${metric.key}_${index}`,  // ✅ Simplified, unique per instance
      score,
      icon: details.icon,
      description: details.description,
      weight: details.weight,
      verdict: getMetricVerdict(score),
      summary: getMetricSummary(metric)
    };
   
  });


// ✅ SIMPLE DEBUG - JUST THIS:
console.log('Metric IDs:', processedMetrics.map(m => m.id));
console.log('expandedMetric:', expandedMetric);

const overallScore = riskScore || 
    Math.round(processedMetrics.reduce((sum, metric) => {
      return sum + (metric.score * metric.weight / 100);
    }, 0));
  // Simple ShareDialog component
  const ShareDialog = ({ isOpen, onClose, projectData }: any) => {
    if (!isOpen) return null;

    const shareToClipboard = async () => {
      if (!projectData) return;
      
      const shareText = `Sifter Analysis: ${projectData.displayName}\nRisk Score: ${projectData.overallRisk.score}/100 (${projectData.overallRisk.verdict.toUpperCase()})\nMetrics Analyzed: ${projectData.metrics.length}`;
      const shareUrl = window.location.href;
      
      try {
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        alert('Analysis summary copied to clipboard!');
        onClose();
      } catch (err) {
        console.error('Failed to copy:', err);
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = `${shareText}\n\n${shareUrl}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Analysis summary copied to clipboard!');
        onClose();
      }
    };

    const shareToTwitter = () => {
      if (!projectData) return;
      
      const shareText = `Sifter Analysis: ${projectData.displayName} - ${projectData.overallRisk.score}/100 risk score`;
      const shareUrl = window.location.href;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(twitterUrl, '_blank', 'noopener,noreferrer');
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-sifter-card border border-sifter-border rounded-xl p-6 max-w-md w-full">
          <h3 className="text-xl font-bold text-white mb-4">Share Analysis</h3>
          <p className="text-gray-400 text-sm mb-6">
            Share this analysis summary with others
          </p>
          
          <div className="space-y-3">
            <button
              onClick={shareToClipboard}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to Clipboard
            </button>
            
            <button
              onClick={shareToTwitter}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.213c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Share on Twitter
            </button>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-sifter-dark hover:bg-sifter-border text-gray-300 border border-sifter-border rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-sifter-card border border-sifter-border rounded-2xl p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            <h2 className="text-2xl font-bold text-white">13-Metric Analysis</h2>
          </div>
          <p className="text-gray-400 mt-1">{projectName}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">Overall Risk Score</div>
            <div className={`text-3xl font-bold ${getMetricColor(overallScore)}`}>
              {overallScore}/100
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShareDialog(true)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
            
            {onExport && (
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
   {processedMetrics.map((metric) => {
  const isExpanded = expandedMetric === metric.id;
  
  return (
    <div
      key={metric.id}
      className={`border border-sifter-border rounded-xl cursor-pointer transition-all duration-400 overflow-hidden hover:border-gray-600
        ${isExpanded
          ? 'bg-gray-900/50 border-gray-700 shadow-2xl'  // Expanded: full height + highlight
          : 'max-h-36 hover:bg-gray-800/30'               // Collapsed: FORCED short ~144px
        }`}
      onClick={() => toggleMetric(metric.id)}
    >
      {/* Header - always visible, matches your original screenshot spacing/fonts */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <span className="text-3xl flex-shrink-0">{metric.icon}</span>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-white">{metric.name}</h3>
            <p className="text-sm text-gray-400 mt-1">{metric.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <div className={`text-3xl font-bold ${getMetricColor(metric.score)}`}>
              {metric.score}/100
            </div>
            <p className="text-xs text-gray-500 mt-1">Weight: {metric.weight}%</p>
          </div>

          <svg
            className={`w-6 h-6 text-gray-500 transition-transform duration-400 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* EXPANDED CONTENT - slides in */}
      {isExpanded && (
        <div className="px-6 pb-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className={`${getMetricBgColor(metric.score)} rounded-lg h-3`}>
              <div
                className={`h-full rounded-lg ${getMetricColor(metric.score).replace('text-', 'bg-')}`}
                style={{ width: `${metric.score}%` }}
              />
            </div>
          </div>

          {/* Risk Verdict + Summary */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{getStatusIcon(metric.score)}</span>
              <span className="text-lg font-semibold text-white capitalize">{metric.verdict} Risk</span>
            </div>
            <p className="text-base text-gray-300 leading-relaxed">{metric.summary}</p>
          </div>

          {/* Detailed Analysis - SCROLLBAR RESTORED & WORKING ✅ */}
          {metric.evidence && metric.evidence.length > 0 && (
            <div className="mb-6">
              <h4 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                🔍 Detailed Analysis
              </h4>
              <div className="max-h-96 overflow-y-auto text-base text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-900/40 rounded-xl p-5 border border-gray-800 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                {metric.evidence[0]}
              </div>
            </div>
          )}

          {/* Red Flags */}
          {metric.flags && metric.flags.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-3">Red Flags</p>
              <div className="flex flex-wrap gap-2">
                {metric.flags.slice(0, 6).map((flag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-red-500/20 text-red-400 text-sm rounded-full border border-red-500/30"
                  >
                    {flag}
                  </span>
                ))}
                {metric.flags.length > 6 && (
                  <span className="px-4 py-2 bg-gray-800 text-gray-400 text-sm rounded-full">
                    +{metric.flags.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
})}
      </div>

      {/* Add ShareDialog at the end of the return */}
      {showShareDialog && projectData && (
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          projectData={projectData}
        />
      )}
    </div>
  );
}
