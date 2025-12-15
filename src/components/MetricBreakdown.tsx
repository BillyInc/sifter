// components/MetricBreakdown.tsx - UPDATED WITH SHARE DIALOG
'use client';

import React, { useState } from 'react';
import {
  MetricScore,
  TeamIdentityMetric,
  ContaminatedNetworkMetric,
  MercenaryKeywordsMetric,
  EntropyMetric,
  TweetFocusMetric,
  GithubMetric,
  BusFactorMetric,
  HypeMetric,
  FounderDistractionMetric,
  EngagementMetric,
  TokenomicsMetric,
  TeamCompetenceMetric,
  ProjectData
} from '@/types';

// Define a union type for all metrics
type MetricType = 
  | TeamIdentityMetric 
  | TeamCompetenceMetric 
  | ContaminatedNetworkMetric 
  | MercenaryKeywordsMetric 
  | EntropyMetric 
  | TweetFocusMetric 
  | GithubMetric 
  | BusFactorMetric 
  | HypeMetric 
  | FounderDistractionMetric 
  | EngagementMetric 
  | TokenomicsMetric;

interface MetricDefinition {
  name: string;
  metric: MetricType;
  weight: number;
  icon: string;
  description: string;
}

interface MetricBreakdownProps {
  metrics: {
    teamIdentity: TeamIdentityMetric;
    teamCompetence: TeamCompetenceMetric;
    contaminatedNetwork: ContaminatedNetworkMetric;
    mercenaryKeywords: MercenaryKeywordsMetric;
    messageTimeEntropy: EntropyMetric;
    accountAgeEntropy: EntropyMetric;
    tweetFocus: TweetFocusMetric;
    githubAuthenticity: GithubMetric;
    busFactor: BusFactorMetric;
    artificialHype: HypeMetric;
    founderDistraction: FounderDistractionMetric;
    engagementAuthenticity: EngagementMetric;
    tokenomics: TokenomicsMetric;
  };
  onExport?: () => void;
  onBack?: () => void;
  projectName?: string;
  riskScore?: number;
  projectData?: ProjectData;
}

// Helper function to safely access metric properties
const getMetricVerdict = (metric: MetricType): string => {
  if ('verdict' in metric && typeof metric.verdict === 'string') {
    return metric.verdict;
  }
  return 'unknown';
};

const getMetricSummary = (metric: MetricType): string => {
  if ('summary' in metric && typeof metric.summary === 'string') {
    return metric.summary;
  }
  
  // Fallback based on score
  const score = 'score' in metric ? metric.score : 0;
  if (score >= 80) return 'Critical risk level';
  if (score >= 60) return 'High risk level';
  if (score >= 40) return 'Moderate risk level';
  if (score >= 20) return 'Low risk level';
  return 'Minimal risk level';
};

export default function MetricBreakdown({
  metrics,
  onExport,
  onBack,
  projectName = 'Unknown Project',
  riskScore = 0,
  projectData
}: MetricBreakdownProps) {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const toggleMetric = (metricName: string) => {
    setExpandedMetric(expandedMetric === metricName ? null : metricName);
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'moderate': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const metricDefinitions: MetricDefinition[] = [
    { name: 'Team Identity', metric: metrics.teamIdentity, weight: 13, icon: '👤', description: 'Team legitimacy and identity verification' },
    { name: 'Team Competence', metric: metrics.teamCompetence, weight: 11, icon: '🎓', description: 'Technical ability and track record' },
    { name: 'Contaminated Network', metric: metrics.contaminatedNetwork, weight: 19, icon: '🕸️', description: 'Connections to known bad actors' },
    { name: 'Mercenary Keywords', metric: metrics.mercenaryKeywords, weight: 9, icon: '💰', description: 'Financial vs genuine community discourse' },
    { name: 'Message Time Entropy', metric: metrics.messageTimeEntropy, weight: 5, icon: '⏰', description: 'Natural vs coordinated posting patterns' },
    { name: 'Account Age Entropy', metric: metrics.accountAgeEntropy, weight: 5, icon: '📅', description: 'Organic vs bulk account creation' },
    { name: 'Tweet Focus', metric: metrics.tweetFocus, weight: 7, icon: '🐦', description: 'Narrative consistency and coherence' },
    { name: 'GitHub Authenticity', metric: metrics.githubAuthenticity, weight: 10, icon: '💻', description: 'Real development vs copy-paste code' },
    { name: 'Bus Factor', metric: metrics.busFactor, weight: 2, icon: '🚌', description: 'Single point of failure risk' },
    { name: 'Artificial Hype', metric: metrics.artificialHype, weight: 5, icon: '📈', description: 'Organic vs paid growth campaigns' },
    { name: 'Founder Distraction', metric: metrics.founderDistraction, weight: 6, icon: '🎯', description: 'Focus on building vs personal brand' },
    { name: 'Engagement Authenticity', metric: metrics.engagementAuthenticity, weight: 10, icon: '💬', description: 'Genuine vs performative engagement' },
    { name: 'Tokenomics', metric: metrics.tokenomics, weight: 7, icon: '📊', description: 'Economic structure and fairness' },
  ];

  const overallScore = riskScore || 
    Math.round(metricDefinitions.reduce((sum, def) => {
      const score = 'score' in def.metric ? def.metric.score : 0;
      return sum + (score * def.weight / 100);
    }, 0));

  // Simple ShareDialog component
  const ShareDialog = ({ isOpen, onClose, projectData }: any) => {
    if (!isOpen) return null;

    const shareToClipboard = async () => {
      if (!projectData) return;
      
      const shareText = `Sifter Analysis: ${projectData.displayName}\nRisk Score: ${projectData.overallRisk.score}/100 (${projectData.overallRisk.verdict.toUpperCase()})\n${projectData.overallRisk.summary || ''}`;
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
        {metricDefinitions.map((def) => {
          const metricScore = 'score' in def.metric ? def.metric.score : 0;
          const verdict = getMetricVerdict(def.metric);
          const summary = getMetricSummary(def.metric);
          
          return (
            <div
              key={def.name}
              className={`border border-sifter-border rounded-xl p-4 cursor-pointer transition-all hover:border-gray-600 ${
                expandedMetric === def.name ? 'bg-gray-900/50' : ''
              }`}
              onClick={() => toggleMetric(def.name)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{def.icon}</span>
                  <div>
                    <h3 className="font-medium text-white">{def.name}</h3>
                    <p className="text-xs text-gray-500">Weight: {def.weight}%</p>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${getMetricColor(metricScore)}`}>
                  {metricScore}/100
                </div>
              </div>
              
              <div className={`${getMetricBgColor(metricScore)} rounded-lg h-2 mb-3`}>
                <div 
                  className={`h-full rounded-lg ${getMetricColor(metricScore).replace('text-', 'bg-')}`}
                  style={{ width: `${metricScore}%` }}
                />
              </div>
              
              <p className="text-sm text-gray-400 mb-3">{def.description}</p>
              
              {expandedMetric === def.name && (
                <div className="mt-4 pt-4 border-t border-sifter-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{getStatusIcon(verdict)}</span>
                    <span className="font-medium text-white capitalize">{verdict} Risk</span>
                  </div>
                  <p className="text-sm text-gray-400">{summary}</p>
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