// components/IndividualAnalysisView.tsx
'use client';

import React from 'react';
import { ProjectData, MetricData } from '@/types';

interface IndividualAnalysisViewProps {
  projectData: ProjectData;
  onAddToWatchlist: () => void;
  onShare: () => void;
  onScanAnother: () => void;
  onDownloadPDF: () => void;
}

interface RiskFlag {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface RiskLevelInfo {
  label: string;
  color: string;
  icon: string;
}

interface Recommendation {
  main: string;
  reasons: string[];
}

export default function IndividualAnalysisView({
  projectData,
  onAddToWatchlist,
  onShare,
  onScanAnother,
  onDownloadPDF
}: IndividualAnalysisViewProps) {
  const { overallRisk, metrics, displayName, processingTime } = projectData;
  
  // Helper to find a metric by key
  const findMetricByKey = (key: string): MetricData | undefined => {
    return metrics.find(metric => metric.key === key);
  };
  
  // Helper to get metric value with fallback
  const getMetricValue = (metric: MetricData | undefined): number => {
    return metric?.score ?? metric?.value ?? 0;
  };
  
  const getRiskLevel = (score: number): RiskLevelInfo => {
    if (score >= 80) return { label: 'HIGH RISK - DON\'T INVEST', color: 'red', icon: '🚨' };
    if (score >= 60) return { label: 'CAUTION ADVISED', color: 'orange', icon: '⚠️' };
    if (score >= 40) return { label: 'MODERATE RISK', color: 'yellow', icon: '⚡' };
    if (score >= 20) return { label: 'LOW RISK', color: 'blue', icon: '🔍' };
    return { label: 'VERY LOW RISK', color: 'green', icon: '✅' };
  };

  const getRecommendation = (score: number): Recommendation => {
    if (score >= 80) return {
      main: 'DO NOT INVEST in this project',
      reasons: [
        'Multiple critical red flags detected',
        'High probability of scam based on historical patterns',
        'Connected to known bad actors'
      ]
    };
    if (score >= 60) return {
      main: 'Extreme caution advised',
      reasons: [
        'Multiple concerning signals detected',
        'Consider waiting for more development',
        'Monitor community health closely'
      ]
    };
    if (score >= 40) return {
      main: 'Proceed with caution',
      reasons: [
        'Some positive signals mixed with concerns',
        'Do additional research before investing',
        'Check team updates and progress'
      ]
    };
    if (score >= 20) return {
      main: 'Looks promising',
      reasons: [
        'Mostly positive signals',
        'Standard due diligence recommended',
        'Monitor tokenomics and vesting'
      ]
    };
    return {
      main: 'Strong fundamentals',
      reasons: [
        'Excellent risk profile',
        'Appears legitimate and well-structured',
        'Continue monitoring as with any investment'
      ]
    };
  };

  const getTopRedFlags = (): RiskFlag[] => {
    const flags: RiskFlag[] = [];
    
    // Find metrics by key from the array
    const contaminatedNetwork = findMetricByKey('contaminatedNetwork');
    const mercenaryKeywords = findMetricByKey('mercenaryKeywords');
    const teamIdentity = findMetricByKey('teamIdentity');
    const founderDistraction = findMetricByKey('founderDistraction');
    const teamCompetence = findMetricByKey('teamCompetence');
    const githubAuthenticity = findMetricByKey('githubAuthenticity');
    const engagementAuthenticity = findMetricByKey('engagementAuthenticity');
    
    // 1. Check contaminated network (critical risk)
    const contaminatedNetworkValue = getMetricValue(contaminatedNetwork);
    if (contaminatedNetworkValue >= 75) {
      flags.push({
        title: '🚨 Connected to Known Bad Actors',
        description: 'This project is connected to known scam networks.',
        severity: 'critical'
      });
    }
    
    // 2. Check mercenary keywords (high risk)
    const mercenaryKeywordsValue = getMetricValue(mercenaryKeywords);
    if (mercenaryKeywordsValue >= 70) {
      flags.push({
        title: '💰 Mercenary Community',
        description: `High percentage of community focused on financial extraction.`,
        severity: 'high'
      });
    }
    
    // 3. Check team identity (high risk)
    const teamIdentityValue = getMetricValue(teamIdentity);
    if (teamIdentityValue <= 30) {
      flags.push({
        title: '👤 Anonymous Team',
        description: 'Team members are anonymous with no verifiable identities.',
        severity: 'high'
      });
    }
    
    // 4. Check team competence (medium risk)
    const teamCompetenceValue = getMetricValue(teamCompetence);
    if (teamCompetenceValue <= 40) {
      flags.push({
        title: '🎯 Limited Experience',
        description: 'Team lacks proven track record in blockchain/crypto projects.',
        severity: 'medium'
      });
    }
    
    // 5. Check engagement authenticity (medium risk)
    const engagementAuthenticityValue = getMetricValue(engagementAuthenticity);
    if (engagementAuthenticityValue >= 70) {
      flags.push({
        title: '🤖 Artificial Engagement',
        description: 'High percentage of inauthentic or bot-driven community engagement detected.',
        severity: 'medium'
      });
    }
    
    // 6. Check GitHub authenticity (medium risk)
    const githubAuthenticityValue = getMetricValue(githubAuthenticity);
    if (githubAuthenticityValue <= 40) {
      flags.push({
        title: '💻 Copy-Paste Code',
        description: 'Codebase appears to be copied or contains minimal original development.',
        severity: 'medium'
      });
    }
    
    // 7. Check founder distraction (low risk)
    const founderDistractionValue = getMetricValue(founderDistraction);
    if (founderDistractionValue >= 70) {
      flags.push({
        title: '🎯 Distracted Founders',
        description: 'Founders are heavily involved in multiple projects and personal brand building.',
        severity: 'low'
      });
    }
    
    // Return top 5 flags sorted by severity
    return flags
      .sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
      .slice(0, 5);
  };

  const riskLevel = getRiskLevel(overallRisk.score);
  const recommendation = getRecommendation(overallRisk.score);
  const topFlags = getTopRedFlags();

  // Key metrics to display in the quick stats section
  const keyMetrics = [
    { key: 'teamIdentity', label: 'Team Identity' },
    { key: 'contaminatedNetwork', label: 'Network Risk' },
    { key: 'mercenaryKeywords', label: 'Mercenary Focus' },
    { key: 'githubAuthenticity', label: 'Code Quality' }
  ];

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={onScanAnother}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors self-start"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
        
        <div className="flex gap-3 self-start sm:self-auto">
          <button
            onClick={onDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <span>📄</span>
            <span className="hidden sm:inline">Download PDF</span>
          </button>
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <span>📤</span>
            <span className="hidden sm:inline">Share Report</span>
          </button>
        </div>
      </div>

      {/* Risk Banner */}
      <div className={`text-center py-8 rounded-2xl border-2 ${
        riskLevel.color === 'red' ? 'border-red-500/30 bg-red-500/10' :
        riskLevel.color === 'orange' ? 'border-orange-500/30 bg-orange-500/10' :
        riskLevel.color === 'yellow' ? 'border-yellow-500/30 bg-yellow-500/10' :
        riskLevel.color === 'blue' ? 'border-blue-500/30 bg-blue-500/10' :
        'border-green-500/30 bg-green-500/10'
      }`}>
        <div className="text-5xl mb-4">{riskLevel.icon}</div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{riskLevel.label}</h1>
        <div className="text-2xl md:text-4xl font-bold text-white mb-2">{displayName}</div>
        <div className={`text-5xl md:text-6xl font-bold ${
          riskLevel.color === 'red' ? 'text-red-400' :
          riskLevel.color === 'orange' ? 'text-orange-400' :
          riskLevel.color === 'yellow' ? 'text-yellow-400' :
          riskLevel.color === 'blue' ? 'text-blue-400' :
          'text-green-400'
        }`}>
          {overallRisk.score}/100
        </div>
        <div className="text-sm md:text-base text-gray-400 mt-3 px-4">
          Scanned: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()} | 
          Duration: {Math.floor(processingTime / 1000)} seconds
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 px-4">
          <button
            onClick={onAddToWatchlist}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            <span>⭐</span>
            Add to Watchlist
          </button>
          <button
            onClick={onScanAnother}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            <span>🔄</span>
            Scan Again
          </button>
        </div>
      </div>

      {/* Our Recommendation */}
      <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Our Recommendation</h2>
        <div className={`text-lg font-semibold mb-3 ${
          riskLevel.color === 'red' ? 'text-red-400' :
          riskLevel.color === 'orange' ? 'text-orange-400' :
          riskLevel.color === 'yellow' ? 'text-yellow-400' :
          riskLevel.color === 'blue' ? 'text-blue-400' :
          'text-green-400'
        }`}>
          {recommendation.main}
        </div>
        <ul className="space-y-2">
          {recommendation.reasons.map((reason, index) => (
            <li key={index} className="flex items-start gap-2 text-gray-300">
              <span className="mt-1">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Why This Matters */}
      {topFlags.length > 0 && (
        <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Why This Matters</h2>
          
          <div className="space-y-6">
            {topFlags.map((flag, index) => (
              <div key={index} className={`p-4 rounded-lg ${
                flag.severity === 'critical' ? 'bg-red-500/10 border border-red-500/30' :
                flag.severity === 'high' ? 'bg-orange-500/10 border border-orange-500/30' :
                flag.severity === 'medium' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                'bg-blue-500/10 border border-blue-500/30'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">
                    {flag.severity === 'critical' ? '🚨' :
                     flag.severity === 'high' ? '⚠️' :
                     flag.severity === 'medium' ? '⚡' : '🔍'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{flag.title}</h3>
                    <p className="text-gray-300">{flag.description}</p>
                    
                    {flag.severity === 'critical' && (
                      <div className="mt-3">
                        <p className="text-sm text-red-400 font-medium">What this means for you:</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Professional scammers often reuse the same marketing agencies across multiple projects. 
                          When an agency has been involved in multiple scams, it's a strong indicator that the 
                          current project may follow the same pattern.
                        </p>
                      </div>
                    )}
                    
                    {flag.severity === 'high' && (
                      <div className="mt-3">
                        <p className="text-sm text-orange-400 font-medium">Impact:</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Mercenary communities often abandon projects quickly after launch, causing price crashes.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats - Showing 4 key metrics */}
      <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Key Risk Indicators</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {keyMetrics.map(({ key, label }) => {
            const metric = findMetricByKey(key);
            const score = getMetricValue(metric);
            
            return (
              <div key={key} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {Math.round(score)}/100
                </div>
                <div className="text-sm text-gray-400 mt-1">{label}</div>
                <div className="mt-2">
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        score >= 70 ? 'bg-red-500' :
                        score >= 50 ? 'bg-orange-500' :
                        score >= 30 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Show remaining metrics count */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm">Additional metrics analyzed: {metrics.length - keyMetrics.length}</span>
            <button className="text-sm text-blue-400 hover:text-blue-300">
              View all metrics →
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Next Steps</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onScanAnother}
            className="p-4 rounded-lg border border-sifter-border hover:border-blue-500/50 hover:bg-sifter-card/50 transition-all text-left group"
          >
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="font-medium text-white group-hover:text-blue-400">Check Another Project</h3>
            <p className="text-sm text-gray-400 mt-1">Analyze a different project</p>
          </button>
          
          <button className="p-4 rounded-lg border border-sifter-border hover:border-blue-500/50 hover:bg-sifter-card/50 transition-all text-left group">
            <div className="text-3xl mb-2">📚</div>
            <h3 className="font-medium text-white group-hover:text-blue-400">Learn About Scams</h3>
            <p className="text-sm text-gray-400 mt-1">Common red flags to watch for</p>
          </button>
          
          <button className="p-4 rounded-lg border border-sifter-border hover:border-blue-500/50 hover:bg-sifter-card/50 transition-all text-left group">
            <div className="text-3xl mb-2">💬</div>
            <h3 className="font-medium text-white group-hover:text-blue-400">Get Help</h3>
            <p className="text-sm text-gray-400 mt-1">Questions about this report?</p>
          </button>
        </div>
      </div>

      {/* All 13 Metrics Summary */}
      <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">All Metrics Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.slice(0, 12).map((metric) => {
            const score = getMetricValue(metric);
            const name = metric?.name || metric.key;
            
            return (
              <div key={metric.id} className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-white text-sm truncate">{name}</h3>
                  <span className={`text-sm font-semibold px-2 py-1 rounded ${
                    score >= 70 ? 'bg-red-500/20 text-red-400' :
                    score >= 50 ? 'bg-orange-500/20 text-orange-400' :
                    score >= 30 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {Math.round(score)}
                  </span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden mb-1">
                  <div 
                    className={`h-full ${
                      score >= 70 ? 'bg-red-500' :
                      score >= 50 ? 'bg-orange-500' :
                      score >= 30 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Weight: {metric?.weight || 0}%</span>
                  <span>Confidence: {metric?.confidence || 0}%</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {metrics.length > 12 && (
          <div className="mt-6 text-center">
            <button className="text-blue-400 hover:text-blue-300 text-sm">
              + {metrics.length - 12} more metrics available
            </button>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="font-medium text-white mb-3">Disclaimer</h3>
        <p className="text-sm text-gray-400">
          This analysis is for informational purposes only and is not financial advice. 
          Sifter provides risk assessment based on publicly available information and 
          pattern detection. You should conduct your own research and consult with financial 
          professionals before making investment decisions. Only invest what you can afford to lose.
        </p>
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <button className="text-blue-400 hover:text-blue-300">
            Contact Support
          </button>
          <button className="text-blue-400 hover:text-blue-300">
            Report Incorrect Information
          </button>
          <button className="text-blue-400 hover:text-blue-300">
            Methodology & Scoring
          </button>
        </div>
      </div>
    </div>
  );
}
