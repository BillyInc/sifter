// components/IndividualAnalysisView.tsx
'use client';

import React from 'react';
import { ProjectData } from '@/types';

interface IndividualAnalysisViewProps {
  projectData: ProjectData;
  onAddToWatchlist: () => void;
  onShare: () => void;
  onScanAnother: () => void;
  onDownloadPDF: () => void;
}

export default function IndividualAnalysisView({
  projectData,
  onAddToWatchlist,
  onShare,
  onScanAnother,
  onDownloadPDF
}: IndividualAnalysisViewProps) {
  const { overallRisk, metrics, displayName, processingTime } = projectData;
  
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: 'HIGH RISK - DON\'T INVEST', color: 'red', icon: '🚨' };
    if (score >= 60) return { label: 'CAUTION ADVISED', color: 'orange', icon: '⚠️' };
    if (score >= 40) return { label: 'MODERATE RISK', color: 'yellow', icon: '⚡' };
    if (score >= 20) return { label: 'LOW RISK', color: 'blue', icon: '🔍' };
    return { label: 'VERY LOW RISK', color: 'green', icon: '✅' };
  };

  const getRecommendation = (score: number) => {
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

  const getTopRedFlags = () => {
    const flags = [];
    
    // Check contaminated network
    if (metrics.contaminatedNetwork.score >= 75) {
      flags.push({
        title: '🚨 Connected to Known Scammers',
        description: `This project is connected to "${metrics.contaminatedNetwork.flaggedEntities[0]?.name || 'a known scam agency'}" which has a ${metrics.contaminatedNetwork.flaggedEntities[0]?.trackRecord.failedProjects || 'high'} failure rate.`,
        severity: 'critical'
      });
    }
    
    // Check mercenary keywords
    if (metrics.mercenaryKeywords.mercenaryRatio > 0.5) {
      flags.push({
        title: '💰 Mercenary Community',
        description: `Community is ${(metrics.mercenaryKeywords.mercenaryRatio * 100).toFixed(0)}% focused on financial extraction with minimal genuine discussion.`,
        severity: 'high'
      });
    }
    
    // Check team identity
    if (metrics.teamIdentity.score <= 30) {
      flags.push({
        title: '👤 Anonymous Team',
        description: `${metrics.teamIdentity.anonymousCount} team members are anonymous with no verifiable identities.`,
        severity: 'high'
      });
    }
    
    // Check founder distraction
    if (metrics.founderDistraction.score >= 70) {
      flags.push({
        title: '🎯 Distracted Founders',
        description: 'Founders are heavily involved in multiple projects and personal brand building.',
        severity: 'medium'
      });
    }
    
    return flags.slice(0, 3); // Return top 3 flags
  };

  const riskLevel = getRiskLevel(overallRisk.score);
  const recommendation = getRecommendation(overallRisk.score);
  const topFlags = getTopRedFlags();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={onScanAnother}
          className="flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={onDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <span>📄</span>
            Download PDF
          </button>
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <span>📤</span>
            Share Report
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
        <h1 className="text-3xl font-bold text-white mb-2">{riskLevel.label}</h1>
        <div className="text-4xl font-bold text-white mb-2">{displayName}</div>
        <div className={`text-6xl font-bold ${
          riskLevel.color === 'red' ? 'text-red-400' :
          riskLevel.color === 'orange' ? 'text-orange-400' :
          riskLevel.color === 'yellow' ? 'text-yellow-400' :
          riskLevel.color === 'blue' ? 'text-blue-400' :
          'text-green-400'
        }`}>
          {overallRisk.score}/100
        </div>
        <div className="text-gray-400 mt-3">
          Scanned: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()} | Duration: {Math.floor(processingTime / 1000)} seconds
        </div>
        
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onAddToWatchlist}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            <span>⭐</span>
            Add to Watchlist
          </button>
          <button
            onClick={onScanAnother}
            className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
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
              <span>•</span>
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
                'bg-yellow-500/10 border border-yellow-500/30'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {flag.severity === 'critical' ? '🚨' :
                     flag.severity === 'high' ? '⚠️' : '⚡'}
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-sifter-card border border-sifter-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {Math.round(metrics.teamIdentity.score)}/100
          </div>
          <div className="text-sm text-gray-400 mt-1">Team Identity</div>
        </div>
        <div className="bg-sifter-card border border-sifter-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {Math.round(metrics.contaminatedNetwork.score)}/100
          </div>
          <div className="text-sm text-gray-400 mt-1">Network Risk</div>
        </div>
        <div className="bg-sifter-card border border-sifter-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {(metrics.mercenaryKeywords.mercenaryRatio * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-gray-400 mt-1">Mercenary Focus</div>
        </div>
        <div className="bg-sifter-card border border-sifter-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {Math.round(metrics.founderDistraction.score)}/100
          </div>
          <div className="text-sm text-gray-400 mt-1">Founder Focus</div>
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

      {/* Disclaimer */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="font-medium text-white mb-3">Disclaimer</h3>
        <p className="text-sm text-gray-400">
          This analysis is for informational purposes only and is not financial advice. 
          Sifter provides risk assessment based on publicly available information and 
          pattern detection. You should conduct your own research and consult with financial 
          professionals before making investment decisions. Only invest what you can afford to lose.
        </p>
        <div className="flex gap-4 mt-4 text-sm">
          <button className="text-blue-400 hover:text-blue-300">
            Contact Support
          </button>
          <button className="text-blue-400 hover:text-blue-300">
            Report Incorrect Information
          </button>
        </div>
      </div>
    </div>
  );
}