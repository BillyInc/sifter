// /components/IndividualDashboard.tsx - ALIGNED WITH TYPES
'use client';

import React, { useState, useEffect } from 'react';
import SmartInputParser from './SmartInputParser';
import { 
  SmartInputResult, 
  ProjectData, 
  MetricData,
  WatchlistItem as SharedWatchlistItem, // Use imported type
  AnalysisHistory,
  UserMode,
  VerdictType,
  RiskTier,
  PlatformType
} from '@/types';
import { generateMockProjectData, generateMock13Metrics } from '@/data/mockData';

// Define local type that extends the shared type if needed
interface LocalWatchlistItem extends SharedWatchlistItem {
  // No additional properties needed
}

interface IndividualDashboardProps {
  onAnalyze: (input: string) => void;
  userName?: string;
  watchlist?: LocalWatchlistItem[];
  recentScans?: ProjectData[];
  onAddToWatchlist?: (projectName: string, riskScore: number, verdict: VerdictType) => void;
  onRemoveFromWatchlist?: (projectId: string) => void;
  onViewReport?: (project: ProjectData) => void;
  onModeChange?: () => void;
}

export default function IndividualDashboard({ 
  onAnalyze, 
  userName = 'Investor',
  watchlist: externalWatchlist,
  recentScans: externalRecentScans,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onViewReport,
  onModeChange 
}: IndividualDashboardProps) {
  // Local state for watchlist and recent scans if not provided via props
  const [internalWatchlist, setInternalWatchlist] = useState<LocalWatchlistItem[]>([
    { 
      projectId: '1', 
      projectName: 'DeFi Alpha', 
      riskScore: 23, 
      verdict: 'pass', 
      addedAt: new Date(Date.now() - 1*24*60*60*1000), 
      alertsEnabled: true, 
      lastChecked: new Date() 
    },
    { 
      projectId: '2', 
      projectName: 'TokenSwap Pro', 
      riskScore: 55, 
      verdict: 'flag', 
      addedAt: new Date(Date.now() - 2*24*60*60*1000), 
      alertsEnabled: true, 
      lastChecked: new Date() 
    },
  ]);
  
  const [internalRecentScans, setInternalRecentScans] = useState<ProjectData[]>([
    generateMockProjectData('MoonDoge Protocol'),
    generateMockProjectData('DeFi Alpha'),
    generateMockProjectData('TokenSwap Pro'),
  ]);
  
  // Use external props if provided, otherwise use internal state
  const watchlist = externalWatchlist || internalWatchlist;
  const recentScans = externalRecentScans || internalRecentScans;
  
  const [alerts, setAlerts] = useState([
    { 
      id: '1', 
      type: 'risk_change' as const, 
      projectName: 'TokenSwap Pro', 
      message: 'Risk increased from 47 → 52 → 55', 
      timestamp: new Date(Date.now() - 6*60*60*1000), 
      read: false 
    },
    { 
      id: '2', 
      type: 'new_red_flag' as const, 
      projectName: 'GemToken', 
      message: 'Team member connected to known scams', 
      timestamp: new Date(Date.now() - 10*60*1000), 
      read: false 
    },
  ]);

  const [currentProject, setCurrentProject] = useState<ProjectData | null>(null);
  const [showSimpleReport, setShowSimpleReport] = useState(false);
  const [activeTab, setActiveTab] = useState<'analyze' | 'watchlist' | 'scans' | 'learn' | 'quiz' | 'redflags' | 'projectDetails'>('analyze');
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [showModeSwitch, setShowModeSwitch] = useState(false);
  const [selectedProjectDetails, setSelectedProjectDetails] = useState<any>(null);
  
  // 13 metrics data with weights and descriptions
  const allMetrics = [
    { name: 'Team Identity', weight: 15, description: 'Verification of team member identities and professional backgrounds' },
    { name: 'Team Competence', weight: 12, description: 'Team experience, qualifications, and past project success' },
    { name: 'Contaminated Network', weight: 10, description: 'Associations with suspicious or failed projects' },
    { name: 'Mercenary Keywords', weight: 8, description: 'Analysis of community language focusing on financial extraction' },
    { name: 'Message Time Entropy', weight: 7, description: 'Pattern analysis of posting times and frequency' },
    { name: 'Account Age Entropy', weight: 6, description: 'Age distribution and authenticity of community accounts' },
    { name: 'Tweet Focus', weight: 6, description: 'Consistency and quality of project messaging' },
    { name: 'GitHub Authenticity', weight: 10, description: 'Originality of code vs fork activity' },
    { name: 'Bus Factor', weight: 8, description: 'Project dependency on key individuals' },
    { name: 'Artificial Hype', weight: 6, description: 'Analysis of organic vs paid engagement patterns' },
    { name: 'Founder Distraction', weight: 5, description: 'Multiple project involvement by founders' },
    { name: 'Engagement Authenticity', weight: 4, description: 'Real vs bot engagement analysis' },
    { name: 'Tokenomics', weight: 13, description: 'Token distribution, vesting, and economic design' }
  ];

  // Helper functions for export functionality
  const exportToJSON = (data: any, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareReport = async (project: ProjectData) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Risk Analysis: ${project.displayName}`,
          text: `Check out this risk analysis for ${project.displayName}. Risk Score: ${project.overallRisk.score}/100 (${project.overallRisk.verdict})`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Sharing cancelled or failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const text = `Risk Analysis: ${project.displayName}\nScore: ${project.overallRisk.score}/100\nVerdict: ${project.overallRisk.verdict}\n\nKey Findings:\n${Object.values(project.metrics)
        .flatMap(m => m.flags)
        .slice(0, 3)
        .map(f => `• ${f}`)
        .join('\n')}`;
      
      navigator.clipboard.writeText(text).then(() => {
        alert('Report copied to clipboard!');
      });
    }
  };

  const handleSmartInputResolve = (result: SmartInputResult) => {
    if (result.selectedEntity) {
      const mockData = generateMockProjectData(result.selectedEntity.displayName);
      setCurrentProject(mockData);
      setShowSimpleReport(true);
      
      // Add to recent scans
      setInternalRecentScans(prev => [mockData, ...prev.slice(0, 4)]);
      
      // Trigger analysis
      startAnalysis(result.selectedEntity.displayName);
    }
  };

  const startAnalysis = (projectName: string) => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const mockMetrics = generateMock13Metrics();
      
      // Calculate composite score from mock metrics
      const compositeScore = Math.round(mockMetrics.reduce((sum, m) => sum + (m.contribution || 0), 0));
      const riskScore = compositeScore;
      
      // Determine verdict based on risk score
      let verdict: VerdictType = 'pass';
      if (riskScore >= 60) verdict = 'reject';
      else if (riskScore >= 30) verdict = 'flag';
      
      const mockResults = {
        projectName: projectName,
        riskScore: riskScore,
        compositeScore: compositeScore,
        verdict: verdict,
        metrics: mockMetrics,
        summary: `${projectName} shows ${riskScore >= 60 ? 'concerning patterns' : riskScore >= 30 ? 'mixed signals' : 'promising signals'} across 13 risk metrics.`,
        timestamp: new Date().toISOString(),
        scanDuration: Math.floor(Math.random() * 30) + 30,
        anonymousTeamMembers: Math.floor(Math.random() * 3) + 1,
        mercenaryFocus: Math.floor(Math.random() * 30) + 40
      };
      
      setAnalysisResults(mockResults);
      setIsAnalyzing(false);
      
      if (onAnalyze) {
        onAnalyze(projectName);
      }
    }, 1500);
  };

  const handleAddToWatchlist = (project: ProjectData) => {
    const newItem: LocalWatchlistItem = {
      projectId: `watch_${Date.now()}`,
      projectName: project.displayName,
      riskScore: project.overallRisk.score,
      verdict: project.overallRisk.verdict,
      addedAt: new Date(),
      alertsEnabled: true,
      lastChecked: new Date()
    };
    
    if (onAddToWatchlist) {
      onAddToWatchlist(project.displayName, project.overallRisk.score, project.overallRisk.verdict);
    } else {
      setInternalWatchlist(prev => [...prev, newItem]);
    }
    
    alert(`Added ${project.displayName} to your watchlist!`);
  };

  const handleRescan = (projectName: string) => {
    setInputValue(projectName);
    startAnalysis(projectName);
  };

  const handleViewDetails = (projectName: string) => {
    const project = recentScans.find(p => p.displayName === projectName) || currentProject;
    if (project) {
      setSelectedProjectDetails(project);
      setActiveTab('projectDetails');
    }
  };

  const getSimpleRecommendation = (score: number) => {
    if (score >= 80) return { text: '🚨 HIGH RISK - DO NOT INVEST', color: 'text-red-400', bg: 'bg-red-500/10' };
    if (score >= 60) return { text: '⚠️ MEDIUM RISK - BE CAREFUL', color: 'text-orange-400', bg: 'bg-orange-500/10' };
    if (score >= 40) return { text: '⚠️ MODERATE RISK - DO RESEARCH', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    if (score >= 20) return { text: '✅ LOW RISK - LOOKS GOOD', color: 'text-green-400', bg: 'bg-green-500/10' };
    return { text: '✅ VERY LOW RISK - STRONG', color: 'text-green-400', bg: 'bg-green-500/10' };
  };

  const renderSimpleReport = (project: ProjectData) => {
    // Type guard for project.overallRisk.score
    const score = typeof project.overallRisk.score === 'number' ? project.overallRisk.score : 0;
    const rec = getSimpleRecommendation(score);
    
    // Get flags from metrics - each metric has a flags array
    const flagsWithRecommendations = Object.values(project.metrics)
      .flatMap(m => m.flags.map((flag: string) => ({
        description: flag,
        recommendation: 'Review this aspect carefully before investing.'
      })))
      .slice(0, 3);
    
    return (
      <div className="bg-sifter-card border border-sifter-border rounded-2xl p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{project.displayName}</h2>
            <p className="text-gray-400">Scanned just now • 87 seconds</p>
          </div>
          <button
            onClick={() => setShowSimpleReport(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Risk Summary */}
        <div className={`${rec.bg} border ${rec.color.replace('text', 'border')}/30 rounded-xl p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-white mb-2">{score}/100</div>
              <div className={`text-xl font-semibold ${rec.color}`}>{rec.text}</div>
            </div>
            <div className="text-4xl">
              {score >= 80 ? '🚨' : 
               score >= 60 ? '⚠️' : 
               score >= 40 ? '⚠️' : '✅'}
            </div>
          </div>
        </div>

        {/* Key Findings */}
        <div className="space-y-4 mb-6">
          <h3 className="font-semibold text-white">Key Findings</h3>
          {flagsWithRecommendations.length > 0 ? (
            <div className="space-y-3">
              {flagsWithRecommendations.map((flag, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <span className="text-red-400 mt-1">⚠️</span>
                  <div>
                    <div className="text-white text-sm">{flag.description}</div>
                    <div className="text-red-400 text-xs mt-1">{flag.recommendation}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-green-400">✅</span>
                <div>
                  <div className="text-white">No critical red flags detected</div>
                  <div className="text-green-400 text-sm mt-1">Project appears to have legitimate fundamentals</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAddToWatchlist(project)}
            className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            ⭐ Add to Watchlist
          </button>
          <button
            onClick={() => exportToJSON(project, `${project.displayName}_report.json`)}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            📄 Save Report
          </button>
          <button
            onClick={() => shareReport(project)}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            📤 Share
          </button>
          <button
            onClick={() => setShowSimpleReport(false)}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Check Another
          </button>
        </div>
      </div>
    );
  };

  const render13MetricAnalysis = () => {
    if (!analysisResults) return null;

    return (
      <div className="bg-sifter-card border border-sifter-border rounded-xl p-6 mt-6">
        {/* Quick Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-3xl mb-1">
              {analysisResults.riskScore >= 60 ? '🔴' : 
               analysisResults.riskScore >= 30 ? '🟡' : '🟢'}
            </div>
            <div className={`text-xl font-bold ${
              analysisResults.verdict === 'reject' ? 'text-red-400' :
              analysisResults.verdict === 'flag' ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {analysisResults.verdict === 'reject' ? 'HIGH RISK' :
               analysisResults.verdict === 'flag' ? 'CAUTION ADVISED' : 'LOW RISK'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">{analysisResults.projectName}</div>
            <div className="text-3xl font-bold text-white mt-1">{analysisResults.riskScore}/100</div>
          </div>
        </div>
        
        <div className="text-sm text-gray-400 mb-6">
          Scanned: {new Date().toLocaleDateString('en-US', { 
            month: '2-digit', 
            day: '2-digit', 
            year: 'numeric' 
          })} | Duration: {analysisResults.scanDuration}s
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => {
              if (onAddToWatchlist) {
                onAddToWatchlist(analysisResults.projectName, analysisResults.riskScore, analysisResults.verdict);
              } else {
                const newItem: LocalWatchlistItem = {
                  projectId: `watch_${Date.now()}`,
                  projectName: analysisResults.projectName,
                  riskScore: analysisResults.riskScore,
                  verdict: analysisResults.verdict,
                  addedAt: new Date(),
                  alertsEnabled: true,
                  lastChecked: new Date()
                };
                setInternalWatchlist(prev => [...prev, newItem]);
              }
            }}
            className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
          >
            <span>⭐</span> Add to Watchlist
          </button>
          <button
            onClick={() => handleRescan(analysisResults.projectName)}
            className="px-4 py-3 bg-sifter-dark hover:bg-sifter-border text-gray-300 border border-sifter-border rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
          >
            <span>🔄</span> Scan Again
          </button>
        </div>
        
        {/* COMPLETE 13-METRIC BREAKDOWN */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-white">Complete 13-Metric Breakdown</h4>
            <div className="text-sm text-gray-400">
              Composite Score: <span className="font-bold text-white">{analysisResults.compositeScore}/100</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {analysisResults.metrics.map((metric: MetricData, index: number) => {
              // Type guard: Convert metric.value to number for comparison
              const numericValue = typeof metric.value === 'number' ? metric.value : 0;
              
              return (
                <div key={index} className="bg-sifter-dark border border-sifter-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-white text-sm">{metric.name}</div>
                        <div className={`text-sm font-bold ${
                          numericValue >= 60 ? 'text-red-400' :
                          numericValue >= 30 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {metric.value}/100
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">
                        Weight: {metric.weight}% • Contribution: {metric.contribution.toFixed(1)} points
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full ${
                            numericValue >= 60 ? 'bg-red-500' :
                            numericValue >= 30 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${numericValue}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <div>Low (0-29)</div>
                        <div>Medium (30-59)</div>
                        <div>High (60-100)</div>
                      </div>
                      
                      <div className="text-xs text-gray-500">{metric.key}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const handleModeSwitch = () => {
    if (onModeChange) {
      onModeChange();
    } else {
      setShowModeSwitch(true);
    }
  };

  const handleLocalModeSelect = (mode: UserMode) => {
    if (mode === null) return;
    
    localStorage.setItem('sifter_mode', mode);
    setShowModeSwitch(false);
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = `Switched to ${mode} mode. Refreshing...`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
      window.location.reload();
    }, 1500);
  };

  // Quiz functionality
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);

  const quizQuestions = [
    {
      id: 1,
      question: 'What is the biggest red flag for a crypto project?',
      options: ['Anonymous team', 'Strong community', 'Good website design', 'Active Twitter'],
      correct: 0
    },
    {
      id: 2,
      question: 'How much team allocation is considered reasonable?',
      options: ['5-15%', '30-50%', '70-80%', '90-100%'],
      correct: 0
    },
    {
      id: 3,
      question: 'What does "mercenary community" mean?',
      options: ['Paid military group', 'Users only there for airdrops', 'Professional traders', 'Long-term holders'],
      correct: 1
    }
  ];

  const handleTakeQuiz = () => {
    setActiveTab('quiz');
    setCurrentQuestion(0);
    setQuizAnswers([]);
    setQuizScore(null);
  };

  const handleQuizAnswer = (answerIndex: number) => {
    const newAnswers = [...quizAnswers, answerIndex];
    setQuizAnswers(newAnswers);
    
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const correctAnswers = newAnswers.reduce((acc: number, answer: number, index: number) => {
        return acc + (answer === quizQuestions[index].correct ? 1 : 0);
      }, 0);
      const score = Math.round((correctAnswers / quizQuestions.length) * 100);
      setQuizScore(score);
    }
  };

  // Red flags data
  const redFlags = [
    { id: 1, title: 'Anonymous Team', description: 'No LinkedIn or professional profiles found. Legitimate projects have doxxed teams.', severity: 'high', examples: ['No team photos', 'Generic bios', 'No work history'] },
    { id: 2, title: 'Guaranteed Returns', description: 'Promises specific % returns - this is illegal in most jurisdictions.', severity: 'critical', examples: ['"Guaranteed 100x"', '"Risk-free investment"', '"Cannot lose money"'] },
    { id: 3, title: 'Copy-Paste Code', description: 'GitHub repo is mostly forked with minimal original code.', severity: 'medium', examples: ['0 original commits', 'Forked repository', 'No technical innovation'] },
    { id: 4, title: 'No Token Lockup', description: 'Team tokens unlock immediately at launch.', severity: 'high', examples: ['0% locked', '1-month vesting', 'Immediate selling pressure'] },
    { id: 5, title: 'Fake Followers', description: 'Twitter has bot-like followers with low engagement.', severity: 'medium', examples: ['100k followers, 10 likes', 'Generic comments', 'Sudden follower spikes'] },
    { id: 6, title: 'No Roadmap', description: 'Vague or non-existent plans for the future.', severity: 'medium', examples: ['"To the moon!"', 'No timeline', 'Constantly changing goals'] },
  ];

  const handleCommonRedFlags = () => {
    setActiveTab('redflags');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white">
            👋 Welcome, <span className="text-blue-400">{userName}</span>
          </h1>
          <p className="text-gray-400 text-sm">13-metric risk analysis</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleModeSwitch}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Switch Mode
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-sifter-card border border-sifter-border rounded-lg p-1">
        <div className="flex flex-wrap gap-1">
          {['analyze', 'watchlist', 'scans', 'learn'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-sifter-dark/50'
              }`}
            >
              {tab === 'analyze' && '🔍'}
              {tab === 'watchlist' && '📋'}
              {tab === 'scans' && '📊'}
              {tab === 'learn' && '📚'}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {(tab === 'watchlist' || tab === 'scans') && ` (${tab === 'watchlist' ? watchlist.length : recentScans.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'analyze' && (
        <div className="space-y-6">
          {showSimpleReport && currentProject ? (
            renderSimpleReport(currentProject)
          ) : (
            <div className="bg-sifter-card border border-sifter-border rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Check a Project</h2>
              <p className="text-gray-400 mb-6">
                Is this crypto project safe? Get your answer in 90 seconds.
              </p>
              
              <SmartInputParser
                onResolve={handleSmartInputResolve}
                placeholder="Enter project name, Twitter handle, Discord invite, or website..."
              />
              
              <div className="mt-6 text-sm text-gray-500">
                <p className="mb-2">Examples:</p>
                <div className="flex flex-wrap gap-2">
                  {['MoonDoge Protocol', '@cryptoproject', 'discord.gg/invite', 'projectwebsite.com'].map((example) => (
                    <button
                      key={example}
                      onClick={() => handleSmartInputResolve({
                        input: example,
                        type: example.startsWith('@') ? 'twitter' : 
                               example.includes('discord.gg') ? 'discord' : 
                               example.includes('.com') ? 'website' : 'name',
                        resolvedEntities: [],
                        selectedEntity: {
                          id: 'example',
                          canonicalName: example,
                          displayName: example,
                          platform: example.startsWith('@') ? 'twitter' : 
                                   example.includes('discord.gg') ? 'discord' : 
                                   example.includes('.com') ? 'website' : 'name',
                          url: example.startsWith('http') ? example : 
                               example.startsWith('@') ? `https://twitter.com/${example.substring(1)}` : 
                               example.includes('.') ? `https://${example}` : '',
                          confidence: 100,
                          alternativeNames: [],
                          crossReferences: [],
                          metadata: {}
                        },
                        confidence: 100,
                        searchHistory: [],
                        timestamp: new Date()
                      })}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-3 py-1.5 rounded transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isAnalyzing && (
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4">
                <div className="w-full h-full rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Analyzing {inputValue}</h3>
              <p className="text-gray-400 text-sm mb-4">Scanning 13 risk metrics...</p>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>
          )}

          {/* 13-Metric Analysis Results */}
          {render13MetricAnalysis()}

          {/* Recent Scans */}
          <div className="bg-sifter-card border border-sifter-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Scans</h3>
            <div className="space-y-3">
              {recentScans.slice(0, 3).map((project, idx) => {
                // Type guard for project.overallRisk.score
                const score = typeof project.overallRisk.score === 'number' ? project.overallRisk.score : 0;
                
                return (
                  <div key={idx} className="flex justify-between items-center p-4 border border-sifter-border rounded-lg hover:border-green-500/50 transition-colors">
                    <div>
                      <div className="font-medium text-white">{project.displayName}</div>
                      <div className="text-sm text-gray-400">
                        Scanned: {project.scannedAt.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-lg font-bold ${
                        score >= 80 ? 'text-red-400' :
                        score >= 60 ? 'text-orange-400' :
                        score >= 40 ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {score}/100
                      </div>
                      <button
                        onClick={() => {
                          setCurrentProject(project);
                          setShowSimpleReport(true);
                        }}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm"
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Watchlist Tab */}
      {activeTab === 'watchlist' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Project Watchlist</h2>
              <p className="text-gray-400 text-sm">Track projects you're monitoring</p>
            </div>
          </div>
          
          {watchlist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchlist.map((item) => {
                // Type guard for item.riskScore
                const riskScore = typeof item.riskScore === 'number' ? item.riskScore : 0;
                
                return (
                  <div key={item.projectId} className="bg-sifter-card border border-sifter-border rounded-xl p-5 hover:border-blue-500/30 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-white text-lg mb-1">{item.projectName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.verdict === 'reject' ? 'bg-red-500/20 text-red-400' :
                            item.verdict === 'flag' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {item.verdict.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-400">
                            Score: <span className={`font-bold ${
                              riskScore >= 60 ? 'text-red-400' :
                              riskScore >= 30 ? 'text-yellow-400' : 'text-green-400'
                            }`}>{riskScore}/100</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (onRemoveFromWatchlist) {
                            onRemoveFromWatchlist(item.projectId);
                          } else {
                            setInternalWatchlist(prev => prev.filter(w => w.projectId !== item.projectId));
                          }
                        }}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1 hover:bg-red-500/10 rounded-lg"
                        title="Remove from watchlist"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleRescan(item.projectName)}
                          className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-sm"
                        >
                          <span>🔄</span> Rescan
                        </button>
                        
                        <button
                          onClick={() => handleViewDetails(item.projectName)}
                          className="px-3 py-2 bg-sifter-dark hover:bg-sifter-border text-gray-300 border border-sifter-border rounded-lg transition-colors flex items-center justify-center gap-1.5 text-sm"
                        >
                          <span>📊</span> Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-sifter-card border border-sifter-border rounded-xl">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-white mb-3">Your Watchlist is Empty</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Add projects to your watchlist to track their risk scores over time and get notified of changes.
              </p>
              <button
                onClick={() => setActiveTab('analyze')}
                className="px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Analyze a Project
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scans Tab */}
      {activeTab === 'scans' && (
        <div className="space-y-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-1">Recent Scans</h2>
            <p className="text-gray-400 text-sm">History of all analyzed projects</p>
          </div>
          
          {recentScans.length > 0 ? (
            <div className="space-y-4">
              {recentScans.map((scan, idx) => {
                // Type guard for scan.overallRisk.score
                const score = typeof scan.overallRisk.score === 'number' ? scan.overallRisk.score : 0;
                
                return (
                  <div key={idx} className="bg-sifter-card border border-sifter-border rounded-xl p-5 hover:border-blue-500/30 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`text-2xl ${
                            scan.overallRisk.verdict === 'reject' ? 'text-red-400' :
                            scan.overallRisk.verdict === 'flag' ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {scan.overallRisk.verdict === 'reject' ? '🔴' : 
                             scan.overallRisk.verdict === 'flag' ? '🟡' : '🟢'}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg">{scan.displayName}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                scan.overallRisk.verdict === 'reject' ? 'bg-red-500/20 text-red-400' :
                                scan.overallRisk.verdict === 'flag' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {scan.overallRisk.verdict.toUpperCase()}
                              </div>
                              <div className="text-xs text-gray-400">
                                Score: <span className={`font-bold ${
                                  score >= 60 ? 'text-red-400' :
                                  score >= 30 ? 'text-yellow-400' : 'text-green-400'
                                }`}>{score}/100</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {scan.scannedAt.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRescan(scan.displayName)}
                          className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors flex items-center gap-1.5 text-sm"
                        >
                          <span>🔄</span> Rescan
                        </button>
                        
                        <button
                          onClick={() => handleViewDetails(scan.displayName)}
                          className="px-4 py-2 bg-sifter-dark hover:bg-sifter-border text-gray-300 border border-sifter-border rounded-lg transition-colors flex items-center gap-1.5 text-sm"
                        >
                          <span>📊</span> Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-sifter-card border border-sifter-border rounded-xl">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-3">No Scans Yet</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Analyze your first project to see scan history here. Track how risk scores change over time.
              </p>
              <button
                onClick={() => setActiveTab('analyze')}
                className="px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Analyze a Project
              </button>
            </div>
          )}
        </div>
      )}

      {/* Learn Tab */}
      {activeTab === 'learn' && (
        <div className="space-y-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-1">Learn & Educate</h2>
            <p className="text-gray-400 text-sm">Knowledge to protect your investments</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={handleTakeQuiz}
              className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border border-blue-500/20 rounded-xl p-5 hover:border-blue-500/40 transition-all text-left group"
            >
              <div className="text-3xl mb-3">🧪</div>
              <h3 className="font-bold text-white text-lg mb-2">Risk Assessment Quiz</h3>
              <p className="text-gray-400 text-sm mb-4">Test your ability to spot crypto scams</p>
              <div className="text-blue-400 text-sm font-medium group-hover:text-blue-300">
                Take Quiz →
              </div>
            </button>
            
            <button
              onClick={handleCommonRedFlags}
              className="bg-gradient-to-br from-red-500/10 to-orange-600/10 border border-red-500/20 rounded-xl p-5 hover:border-red-500/40 transition-all text-left group"
            >
              <div className="text-3xl mb-3">🚨</div>
              <h3 className="font-bold text-white text-lg mb-2">Common Red Flags</h3>
              <p className="text-gray-400 text-sm mb-4">Learn the warning signs of scams</p>
              <div className="text-red-400 text-sm font-medium group-hover:text-red-300">
                View Checklist →
              </div>
            </button>
            
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-xl p-5">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="font-bold text-white text-lg mb-2">Due Diligence Checklist</h3>
              <p className="text-gray-400 text-sm mb-3">Essential steps before investing:</p>
              <ul className="text-gray-300 text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Verify team identities</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Check GitHub activity</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Review tokenomics</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Analyze community</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="bg-sifter-card border border-sifter-border rounded-xl p-5">
            <h3 className="font-bold text-white text-lg mb-4">Understanding the 13 Risk Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allMetrics.map((metric, index) => (
                <div key={index} className="bg-sifter-dark/50 border border-sifter-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-white text-sm">{metric.name}</div>
                    <div className="text-xs text-gray-500">Weight: {metric.weight}%</div>
                  </div>
                  <p className="text-gray-400 text-xs">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quiz Tab */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-1">Risk Assessment Quiz</h2>
            <p className="text-gray-400 text-sm">Test your ability to spot crypto scams</p>
          </div>
          
          {quizScore === null ? (
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🧪</div>
                <div className="text-lg font-bold text-white mb-2">
                  Question {currentQuestion + 1} of {quizQuestions.length}
                </div>
                <div className="text-gray-400 text-sm">
                  Score: {quizAnswers.filter((ans, idx) => ans === quizQuestions[idx].correct).length}/{quizQuestions.length}
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4 text-center">
                  {quizQuestions[currentQuestion].question}
                </h3>
              </div>
              
              <div className="space-y-3">
                {quizQuestions[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(idx)}
                    className="w-full p-4 bg-sifter-dark hover:bg-sifter-border border border-sifter-border rounded-lg text-left transition-all hover:border-blue-500/30 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full border border-gray-600 group-hover:border-blue-500 flex items-center justify-center">
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="text-gray-300 group-hover:text-white">
                        {option}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center">
                <div className="flex gap-1">
                  {quizQuestions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-full ${
                        idx <= currentQuestion
                          ? idx < currentQuestion
                            ? quizAnswers[idx] === quizQuestions[idx].correct
                              ? 'bg-green-500'
                              : 'bg-red-500'
                            : 'bg-blue-500'
                          : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">
                {quizScore >= 80 ? '🏆' : quizScore >= 60 ? '👍' : '📚'}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h3>
              <div className={`text-4xl font-bold mb-4 ${
                quizScore >= 80 ? 'text-green-400' :
                quizScore >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {quizScore}%
              </div>
              
              <div className="mb-6">
                <p className="text-gray-300 mb-2">
                  You answered {quizAnswers.filter((ans, idx) => ans === quizQuestions[idx].correct).length} 
                  out of {quizQuestions.length} questions correctly.
                </p>
                {quizScore >= 80 ? (
                  <p className="text-green-400 font-medium">Excellent! You have strong scam detection skills.</p>
                ) : quizScore >= 60 ? (
                  <p className="text-yellow-400 font-medium">Good! You have basic scam detection skills.</p>
                ) : (
                  <p className="text-red-400 font-medium">Keep learning! Review the red flags section.</p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleTakeQuiz}
                  className="px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Take Quiz Again
                </button>
                <button
                  onClick={handleCommonRedFlags}
                  className="px-5 py-3 bg-sifter-dark hover:bg-sifter-border text-gray-300 border border-sifter-border rounded-lg font-medium transition-colors"
                >
                  Learn Red Flags
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Red Flags Tab */}
      {activeTab === 'redflags' && (
        <div className="space-y-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-1">Common Red Flags</h2>
            <p className="text-gray-400 text-sm">Warning signs to watch for in crypto projects</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {redFlags.map((flag) => (
              <div key={flag.id} className={`bg-sifter-card border rounded-xl p-5 ${
                flag.severity === 'critical' ? 'border-red-500/30 bg-red-500/5' :
                flag.severity === 'high' ? 'border-red-500/20 bg-red-500/5' :
                'border-yellow-500/20 bg-yellow-500/5'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`text-lg ${
                        flag.severity === 'critical' ? 'text-red-400' :
                        flag.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {flag.severity === 'critical' ? '🔥' : '⚠️'}
                      </div>
                      <span className={`font-bold ${
                        flag.severity === 'critical' ? 'text-red-400' :
                        flag.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {flag.severity.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{flag.title}</h3>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mb-4">{flag.description}</p>
                
                <div className="bg-sifter-dark/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-2">Examples:</div>
                  <ul className="space-y-1">
                    {flag.examples.map((example, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                        <span className="text-gray-500">•</span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Section */}
      <div className="bg-sifter-card border border-sifter-border rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
          {alerts.filter(a => !a.read).length > 0 && (
            <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
              {alerts.filter(a => !a.read).length} new
            </span>
          )}
        </div>
        
        <div className="space-y-3">
          {alerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className={`p-3 rounded-lg border ${
              alert.read ? 'border-gray-800' : 'border-red-500/30 bg-red-500/5'
            }`}>
              <div className="flex items-start gap-2">
                <span className="text-red-400 mt-1">🚨</span>
                <div>
                  <div className="font-medium text-white">{alert.projectName}</div>
                  <div className="text-sm text-gray-300 mt-1">{alert.message}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {alerts.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No new alerts
            </div>
          )}
        </div>
      </div>

      {/* Mode Switch Modal */}
      {showModeSwitch && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-sifter-card border border-sifter-border rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Switch Mode</h3>
            <p className="text-gray-400 text-sm mb-6">
              Choose your role to customize the dashboard experience:
            </p>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleLocalModeSelect('ea-vc')}
                className="w-full p-4 bg-sifter-dark hover:bg-sifter-border border border-sifter-border rounded-lg text-left transition-all hover:border-purple-500/30 group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🏢</div>
                  <div>
                    <div className="font-bold text-white">EA/VC Mode</div>
                    <div className="text-gray-400 text-xs">Portfolio monitoring and due diligence tools</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleLocalModeSelect('researcher')}
                className="w-full p-4 bg-sifter-dark hover:bg-sifter-border border border-sifter-border rounded-lg text-left transition-all hover:border-blue-500/30 group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🔬</div>
                  <div>
                    <div className="font-bold text-white">Researcher Mode</div>
                    <div className="text-gray-400 text-xs">Deep dive analytics and historical data</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleLocalModeSelect('individual')}
                className="w-full p-4 bg-sifter-dark border border-blue-500/30 rounded-lg text-left group relative"
              >
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Current
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">👤</div>
                  <div>
                    <div className="font-bold text-white">Individual Investor</div>
                    <div className="text-gray-400 text-xs">Simple risk assessment and due diligence</div>
                  </div>
                </div>
              </button>
            </div>
            
            <button
              onClick={() => setShowModeSwitch(false)}
              className="w-full px-4 py-3 bg-sifter-dark hover:bg-sifter-border text-gray-300 border border-sifter-border rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}