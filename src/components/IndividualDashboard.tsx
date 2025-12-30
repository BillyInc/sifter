'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Network } from 'vis-network';
import axios from 'axios';

import { PointsDisplay } from '@/components/data-donation/gamification';
import { RewardsShop } from '@/components/data-donation/gamification';

import { DisputeForm } from '@/components/data-donation/universal';

import SmartInputParser from './SmartInputParser';
import { ExportService } from '@/services/exportService';
import { 
  SmartInputResult, 
  MetricData,
  WatchlistItem as SharedWatchlistItem,
  AnalysisHistory,
  UserMode,
  VerdictType,
  BlitzMode,
  TwitterScanResult,
  SNAData,
  ProjectData
} from '@/types';
import { generateMockProjectData, generateMockMetrics } from '@/data/mockData';

// Import the actual types from datadonation
import { 
  Reward,
  UserGamificationProfile,
  RewardType,
  UserTier,
  Badge,
  Achievement,
  StreakData,
  Milestone
} from '@/types/dataDonation';

// Import MetricBreakdown
import MetricBreakdown from '@/components/MetricBreakdown';  // adjust path if needed

// Helper function to create a metric data object WITH detailed evidence
const createMetricData = (key: string, name: string, score: number): MetricData => {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const detailedEvidence = generateDetailedMetricEvidence(key, normalizedScore, {});
  
  return {
    id: `metric_${key}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    key,
    name,
    value: normalizedScore,
    weight: 10,
    contribution: normalizedScore * 0.1,
    status: score < 30 ? 'low' : score < 50 ? 'moderate' : score < 70 ? 'high' : 'critical',
    confidence: Math.floor(Math.random() * 30) + 70,
    flags: [],
    evidence: [detailedEvidence],  // ✅ Now has detailed evidence!
    score: normalizedScore,
    scoreValue: normalizedScore
  };
};

// Create metrics array with all 13 metrics and DETAILED evidence
const generateMockMetricsWithEvidence = (): MetricData[] => {
  const metrics: MetricData[] = [];
  
  metrics.push(createMetricData('teamIdentity', 'Team Identity', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('teamCompetence', 'Team Competence', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('contaminatedNetwork', 'Contaminated Network', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('mercenaryKeywords', 'Mercenary Keywords', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('messageTimeEntropy', 'Message Time Entropy', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('accountAgeEntropy', 'Account Age Entropy', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('tweetFocus', 'Tweet Focus', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('githubAuthenticity', 'GitHub Authenticity', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('busFactor', 'Bus Factor', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('artificialHype', 'Artificial Hype', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('founderDistraction', 'Founder Distraction', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('engagementAuthenticity', 'Engagement Authenticity', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('tokenomics', 'Tokenomics', Math.floor(Math.random() * 100)));
  
  return metrics;
};


interface LocalWatchlistItem extends SharedWatchlistItem {}

interface IndividualDashboardProps {
  onAnalyze?: (input: string) => void;
  userName?: string;
  watchlist?: LocalWatchlistItem[];
  recentScans?: AnalysisHistory[];
  onAddToWatchlist?: (projectName: string, riskScore: number, verdict: VerdictType) => void;
  onRemoveFromWatchlist?: (projectId: string) => void;
  onViewReport?: (scanId: string) => void;
  
  projectMetrics?: MetricData[];
  currentProject?: ProjectData;
}

export default function IndividualDashboard({ 
  onAnalyze, 
  userName = 'Investor',
  watchlist: externalWatchlist,
  recentScans: externalRecentScans,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onViewReport,
  
  projectMetrics = [],
  currentProject
}: IndividualDashboardProps) {
  // State
  const [internalWatchlist, setInternalWatchlist] = useState<LocalWatchlistItem[]>([
    { projectId: '1', projectName: 'DeFi Alpha', riskScore: 23, verdict: 'pass', addedAt: new Date(), alertsEnabled: true, lastChecked: new Date() },
    { projectId: '2', projectName: 'TokenSwap Pro', riskScore: 55, verdict: 'flag', addedAt: new Date(), alertsEnabled: true, lastChecked: new Date() },
  ]);
  
  const [internalRecentScans, setInternalRecentScans] = useState<AnalysisHistory[]>([
    { id: 'scan_1', projectName: 'MoonDoge Protocol', riskScore: 89, verdict: 'reject', scannedAt: new Date(), processingTime: 87000 },
    { id: 'scan_2', projectName: 'DeFi Alpha', riskScore: 23, verdict: 'pass', scannedAt: new Date(), processingTime: 89000 },
    { id: 'scan_3', projectName: 'TokenSwap Pro', riskScore: 55, verdict: 'flag', scannedAt: new Date(), processingTime: 92000 }
  ]);
  
  const watchlist = externalWatchlist || internalWatchlist;
  const recentScans = externalRecentScans || internalRecentScans;
  
  const [activeTab, setActiveTab] = useState<'analyze' | 'watchlist' | 'scans' | 'learn'>('analyze');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{
    projectName: string;
    riskScore: number;
    verdict: VerdictType;
    metrics: MetricData[];
    scanDuration: number;
    sourceType?: string;    // ✅ Add this
  sourceUrl?: string;     // ✅ Add this
  } | null>(null);
  const [showModeSwitch, setShowModeSwitch] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const [receivedMetrics, setReceivedMetrics] = useState<MetricData[]>(projectMetrics || []);
  const [receivedProject, setReceivedProject] = useState<ProjectData | undefined>(currentProject);
  
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const exportButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportMenuRef.current && 
        !exportMenuRef.current.contains(event.target as Node) &&
        exportButtonRef.current &&
        !exportButtonRef.current.contains(event.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (projectMetrics && projectMetrics.length > 0) {
      setReceivedMetrics(projectMetrics);
      console.log('IndividualDashboard: Received metrics:', projectMetrics.length);
    }
  }, [projectMetrics]);

  useEffect(() => {
    if (currentProject) {
      setReceivedProject(currentProject);
      console.log('IndividualDashboard: Received project:', currentProject.displayName);
    }
  }, [currentProject]);

  const safeToNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const resetAnalysis = () => {
    setAnalysisResults(null);
    setIsAnalyzing(false);
  };

  const startAnalysis = async (projectName: string) => {
    setIsAnalyzing(true);
    setAnalysisResults(null);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
 // Use received metrics if available, otherwise generate full 13 metrics
  const metricsToUse = receivedMetrics.length >= 13 
    ? receivedMetrics 
    : generateMockMetricsWithEvidence(); // ✅ Now generates metrics with detailed evidence
  
    const compositeScore = Math.round(metricsToUse.reduce((sum, m) => sum + (m.contribution || 0), 0));
    const riskScore = Math.min(100, Math.max(0, compositeScore));
    let verdict: VerdictType = 'pass';
    if (riskScore >= 60) verdict = 'reject';
    else if (riskScore >= 30) verdict = 'flag';
    
    const results = {
      projectName,
      riskScore,
      verdict,
      metrics: metricsToUse,
      scanDuration: Math.floor(Math.random() * 30) + 30,
       sourceType: sourceType || 'manual',  // ✅ Add this
    sourceUrl: sourceUrl || projectName,   // ✅ Add this
    };
    
    setAnalysisResults(results);
    setIsAnalyzing(false);
    
    const newScan: AnalysisHistory = {
      id: `scan_${Date.now()}`,
      projectName,
      riskScore,
      verdict,
      scannedAt: new Date(),
      processingTime: results.scanDuration * 1000
    };
    
    setInternalRecentScans(prev => [newScan, ...prev.slice(0, 4)]);
    
    if (onAnalyze) onAnalyze(projectName);
  };

  const handleSmartInputResolve = (result: SmartInputResult) => {
  if (result.selectedEntity) {
    startAnalysis(
      result.selectedEntity.displayName,
      result.selectedEntity.platform || 'website',
      result.selectedEntity.url || result.input
    );
  }
};

  const addToWatchlist = (projectName: string, riskScore: number, verdict: VerdictType) => {
    const newItem: LocalWatchlistItem = {
      projectId: `watch_${Date.now()}`,
      projectName,
      riskScore,
      verdict,
      addedAt: new Date(),
      alertsEnabled: true,
      lastChecked: new Date()
    };
    
    if (onAddToWatchlist) {
      onAddToWatchlist(projectName, riskScore, verdict);
    } else {
      setInternalWatchlist(prev => [...prev, newItem]);
    }
  };

  const exportToJSON = (data: any, fileName: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportToCSV = (data: any[], fileName: string) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const cell = row[header];
        return typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

const exportToPDF = () => {
  if (!analysisResults) {
    alert('No analysis results to export');
    return;
  }
  
  const projectData: ProjectData = {
    id: `temp_${Date.now()}`,
    displayName: analysisResults.projectName,
    canonicalName: analysisResults.projectName.toLowerCase().replace(/\s+/g, '-'),
    overallRisk: {
      score: analysisResults.riskScore,
      verdict: analysisResults.verdict,
      tier: analysisResults.riskScore < 20 ? 'LOW' : 
            analysisResults.riskScore < 40 ? 'MODERATE' : 
            analysisResults.riskScore < 60 ? 'ELEVATED' : 
            analysisResults.riskScore < 80 ? 'HIGH' : 'CRITICAL',
      confidence: 85,
      breakdown: [`Risk score: ${analysisResults.riskScore}/100`]
    },
    metrics: analysisResults.metrics,
    sources: [
  {
    type: analysisResults.sourceType || 'manual',
    url: analysisResults.sourceUrl || analysisResults.projectName,
    input: analysisResults.projectName
  }
],
    scannedAt: new Date(),
    processingTime: analysisResults.scanDuration * 1000
  };
  
  // Use ExportService if available
  if (typeof ExportService !== 'undefined' && ExportService.exportToPDF) {
    ExportService.exportToPDF(projectData);
  } else {
    alert('PDF export feature coming soon!');
  }
  
  setShowExportMenu(false);
};

  const exportWatchlist = (format: 'json' | 'csv' | 'pdf') => {
    const data = watchlist.map(item => ({
      'Project Name': item.projectName,
      'Risk Score': item.riskScore,
      'Verdict': item.verdict.toUpperCase(),
      'Added Date': item.addedAt.toISOString().split('T')[0],
      'Last Checked': item.lastChecked.toISOString().split('T')[0],
      'Alerts Enabled': item.alertsEnabled ? 'Yes' : 'No'
    }));
    
    const fileName = `sifter-watchlist-${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'json') exportToJSON(data, fileName);
    else if (format === 'csv') exportToCSV(data, fileName);
    else if (format === 'pdf') exportToPDF();
  };

  const exportRecentScans = (format: 'json' | 'csv' | 'pdf') => {
    const data = recentScans.map(scan => ({
      'Project Name': scan.projectName,
      'Risk Score': scan.riskScore,
      'Verdict': scan.verdict.toUpperCase(),
      'Scan Date': scan.scannedAt.toISOString().split('T')[0],
      'Processing Time (s)': Math.round(scan.processingTime / 1000),
      'Scan ID': scan.id
    }));
    
    const fileName = `sifter-scans-${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'json') exportToJSON(data, fileName);
    else if (format === 'csv') exportToCSV(data, fileName);
    else if (format === 'pdf') exportToPDF();
  };

  const exportAnalysisResults = (format: 'json' | 'csv' | 'pdf') => {
    if (!analysisResults) return;
    
    const flatData = [{
      'Project Name': analysisResults.projectName,
      'Risk Score': analysisResults.riskScore,
      'Verdict': analysisResults.verdict.toUpperCase(),
      'Scan Duration (s)': analysisResults.scanDuration,
      'Scan Date': new Date().toISOString().split('T')[0],
      'Total Metrics': analysisResults.metrics.length
    }];
    
    const fileName = `sifter-analysis-${analysisResults.projectName}-${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'json') {
      const data = {
        ...flatData[0],
        metrics: analysisResults.metrics
      };
      exportToJSON(data, fileName);
    } else if (format === 'csv') {
      exportToCSV(flatData, fileName);
    } else if (format === 'pdf') {
      exportToPDF();
    }
  };

  const ScoreBadge = ({ score, verdict }: { score: number; verdict: VerdictType }) => {
    const colors = {
      reject: 'bg-red-500/20 text-red-400 border-red-500/30',
      flag: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      pass: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    
    const icons = {
      reject: '🔴',
      flag: '🟡',
      pass: '🟢'
    };
    
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-sm ${colors[verdict]}`}>
        <span className="text-xs">{icons[verdict]}</span>
        <span className="font-bold">{score}/100</span>
        <span className="text-xs">{verdict.toUpperCase()}</span>
      </div>
    );
  };

  const MetricBar = ({ metric, index }: { metric: MetricData; index: number }) => {
    const value = safeToNumber(metric.value);
    const width = `${value}%`;
    const color = value >= 60 ? 'bg-red-500' : value >= 30 ? 'bg-yellow-500' : 'bg-green-500';
    
    return (
      <div className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-300">{metric.name}</span>
          <span className="text-xs font-semibold">{value}/100</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${color}`}
            style={{ width }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>
    );
  };

  const renderAnalyzeTab = () => {
    const [inputValue, setInputValue] = useState('');
    const [showBlitzSelector, setShowBlitzSelector] = useState(false);
    const [selectedBlitzMode, setSelectedBlitzMode] = useState<BlitzMode>('deep');
    const [isMemecoin, setIsMemecoin] = useState(false);

    const handleSmartInputResolve = async (result: SmartInputResult) => {
      if (!result.selectedEntity) return;

      setInputValue(result.input);

      const tokenAgeMinutes = Math.floor(Math.random() * 60);
      const hasVolumeSpike = Math.random() > 0.6;
      const detectedAsMemecoin = tokenAgeMinutes < 20 || hasVolumeSpike;

      setIsMemecoin(detectedAsMemecoin);

      if (detectedAsMemecoin) {
        setSelectedBlitzMode('hyper');
        setShowBlitzSelector(true);
      } else {
        setSelectedBlitzMode('deep');
        performAnalysis(result.selectedEntity.displayName, 'deep');
      }
    };

    const performAnalysis = (projectName: string, mode: BlitzMode) => {
      setIsAnalyzing(true);

      setTimeout(() => {
        const allMetrics = generateMockMetricsWithEvidence();
        let filteredMetrics = allMetrics;

        if (mode === 'hyper') {
          filteredMetrics = allMetrics.filter(m =>
            ['contaminatedNetwork', 'tokenomics', 'teamIdentity', 'githubAuthenticity'].includes(m.key)
          );
        } else if (mode === 'momentum') {
          filteredMetrics = allMetrics.filter(m =>
            ['communityHealth', 'engagementAuthenticity', 'mercenaryKeywords', 'tweetFocus', 'artificialHype', 'contaminatedNetwork'].includes(m.key)
          );
        }

        const compositeScore = Math.round(filteredMetrics.reduce((sum, m) => sum + m.contribution, 0));

        const mockTwitterScan: TwitterScanResult = {
          preLaunchMentions: mode === 'hyper' && Math.random() > 0.5 ? 3 : 0,
          postLaunchMentions: Math.floor(Math.random() * 20) + 5,
          highRiskAccounts: Math.random() > 0.4 ? ['@scammer1', '@promoterX'] : [],
          coordinationScore: Math.random() * 100,
          evidence: ['Pre-launch coordination detected'],
          preLaunchInsiderFlag: Math.random() > 0.5
        };

        const mockSNA: SNAData = {
          nodes: [
            { id: 'deployer', label: 'Deployer Wallet', group: 'deployer', level: 0 },
            ...mockTwitterScan.highRiskAccounts.map((acc, i) => ({
              id: `risk${i}`,
              label: acc,
              group: 'promoter' as const,
              level: i % 2 === 0 ? 1 : 2,
              riskScore: 70 + Math.random() * 30
            }))
          ],
          edges: mockTwitterScan.highRiskAccounts.length > 0 ? [
            { from: 'deployer', to: 'risk0', label: 'Direct Promotion', severity: 'high' },
            { from: 'risk0', to: 'risk1', label: 'Shared Network', severity: 'medium', dashes: true }
          ] : []
        };

        const projectData: ProjectData = {
          id: `proj_${Date.now()}`,
          displayName: projectName,
          canonicalName: projectName.toLowerCase().replace(/\s+/g, '-'),
          overallRisk: {
            score: compositeScore,
            verdict: compositeScore >= 60 ? 'reject' : compositeScore >= 30 ? 'flag' : 'pass',
            tier: compositeScore < 25 ? 'LOW' : compositeScore < 50 ? 'MODERATE' : compositeScore < 75 ? 'ELEVATED' : 'HIGH',
            confidence: 85
          },
          metrics: filteredMetrics,
          sources: [{ type: 'manual', url: '' }],
          scannedAt: new Date(),
          processingTime: mode === 'hyper' ? 8000 : mode === 'momentum' ? 52000 : 227000,
          blitzMode: mode,
          twitterScan: mockTwitterScan,
          snaData: mockSNA
        };

        if (onAnalyze) {
          // Assume parent handles navigation
        }

        setAnalysisResults({
          projectName,
          riskScore: compositeScore,
          verdict: projectData.overallRisk.verdict,
          metrics: filteredMetrics,
          scanDuration: projectData.processingTime / 1000,
          blitzMode: mode,
          twitterScan: mockTwitterScan,
          snaData: mockSNA
        });

        setIsAnalyzing(false);
        setShowBlitzSelector(false);
      }, 2000);
    };

    if (isAnalyzing) {
      return (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white">Running {selectedBlitzMode === 'hyper' ? 'Hyper' : selectedBlitzMode === 'momentum' ? 'Momentum' : 'Deep'}-Blitz Analysis...</p>
          </div>
        </div>
      );
    }

    if (analysisResults) {
      return (
        <div className="animate-fadeIn space-y-4">
          <div className="bg-sifter-card border border-sifter-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={resetAnalysis}
                    className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white text-sm"
                  >
                    ← Back
                  </button>
                  <h2 className="text-lg font-bold text-white truncate">{analysisResults.projectName}</h2>
                </div>
                <p className="text-xs text-gray-400">
                  Scanned just now • {analysisResults.scanDuration}s
                </p>
              </div>
              <ScoreBadge score={analysisResults.riskScore} verdict={analysisResults.verdict} />
            </div>

            <div className="space-y-4">
              <div className={`p-3 rounded-lg border text-sm ${
                analysisResults.verdict === 'reject' ? 'bg-red-500/10 border-red-500/20' :
                analysisResults.verdict === 'flag' ? 'bg-yellow-500/10 border-yellow-500/20' :
                'bg-green-500/10 border-green-500/20'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {analysisResults.verdict === 'reject' ? '🚨' :
                     analysisResults.verdict === 'flag' ? '⚠️' : '✅'}
                  </span>
                  <div>
                    <h3 className="font-bold text-white">
                      {analysisResults.verdict === 'reject' ? 'High Risk Detected' :
                       analysisResults.verdict === 'flag' ? 'Caution Advised' : 'Low Risk'}
                    </h3>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {analysisResults.verdict === 'reject' ? 'Multiple red flags detected.' :
                       analysisResults.verdict === 'flag' ? 'Some concerning metrics found.' :
                       'Project shows promising fundamentals.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addToWatchlist(analysisResults.projectName, analysisResults.riskScore, analysisResults.verdict)}
                  className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5"
                >
                  ⭐ Add to Watchlist
                </button>
                <button
                  onClick={() => startAnalysis(analysisResults.projectName)}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5"
                >
                  🔄 Rescan
                </button>
              </div>

              <div className="mt-6">
                <h3 className="font-bold text-white mb-4 text-lg">13-Metric Risk Breakdown</h3>
                
                <MetricBreakdown 
                  metrics={analysisResults.metrics}
                    projectName={analysisResults.projectName}
                    riskScore={analysisResults.riskScore}
                     onExport={() => exportAnalysisResults('pdf')}
                    projectData={receivedProject || {
                      id: `temp_${Date.now()}`,
                      displayName: analysisResults.projectName,
                      canonicalName: analysisResults.projectName.toLowerCase().replace(/\s+/g, '-'),
                      overallRisk: {
                        score: analysisResults.riskScore,
                        verdict: analysisResults.verdict,
                        tier: analysisResults.riskScore < 20 ? 'LOW' : 
                              analysisResults.riskScore < 40 ? 'MODERATE' : 
                              analysisResults.riskScore < 60 ? 'ELEVATED' : 
                              analysisResults.riskScore < 80 ? 'HIGH' : 'CRITICAL',
                        confidence: 85,
                        breakdown: [
                          `Analysis complete for ${analysisResults.projectName}`,
                          `Risk score: ${analysisResults.riskScore}/100`,
                          `Verdict: ${analysisResults.verdict.toUpperCase()}`
                        ]
                      },
                      metrics: analysisResults.metrics,
                      sources: [
                        {
                          type: 'unknown',
                          url: '',
                          input: analysisResults.projectName
                        }
                      ],
                      scannedAt: new Date(),
                      processingTime: analysisResults.scanDuration * 1000
                    }}
                    instanceId="individual-dashboard"
                    />
              </div>
            </div>
          </div>

          <div className="bg-sifter-card border border-sifter-border rounded-xl p-5">
            <h3 className="font-bold text-white mb-3 text-sm">Recent Scans</h3>
            <div className="space-y-2">
              {recentScans.slice(0, 2).map((scan) => (
                <div 
                  key={scan.id}
                  onClick={() => startAnalysis(scan.projectName)}
                  className="flex items-center justify-between p-3 border border-sifter-border rounded-lg hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer transition-all group"
                >
                  <div className="truncate">
                    <div className="font-medium text-white text-sm group-hover:text-blue-300 truncate">{scan.projectName}</div>
                    <div className="text-xs text-gray-400">{scan.scannedAt.toLocaleDateString()}</div>
                  </div>
                  <ScoreBadge score={scan.riskScore} verdict={scan.verdict} />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <SmartInputParser onResolve={handleSmartInputResolve} />

        {showBlitzSelector && (
          <div className="bg-sifter-card border border-blue-500/30 rounded-xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              Memecoin Detected — Choose Your Scan Speed
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => performAnalysis(inputValue, 'hyper')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedBlitzMode === 'hyper'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-sifter-border hover:border-blue-500/50'
                }`}
              >
                <div className="text-5xl mb-3">⚡</div>
                <h4 className="font-bold text-white text-lg">Hyper-Blitz</h4>
                <p className="text-sm text-gray-400 mt-2">5–10 seconds • New launches</p>
              </button>

              <button
                onClick={() => performAnalysis(inputValue, 'momentum')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedBlitzMode === 'momentum'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-sifter-border hover:border-purple-500/50'
                }`}
              >
                <div className="text-5xl mb-3">📈</div>
                <h4 className="font-bold text-white text-lg">Momentum-Blitz</h4>
                <p className="text-sm text-gray-400 mt-2">30–90 seconds • Active tokens</p>
              </button>

              <button
                onClick={() => performAnalysis(inputValue, 'deep')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedBlitzMode === 'deep'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-sifter-border hover:border-green-500/50'
                }`}
              >
                <div className="text-5xl mb-3">🔍</div>
                <h4 className="font-bold text-white text-lg">Deep-Blitz</h4>
                <p className="text-sm text-gray-400 mt-2">2–5 minutes • Full analysis</p>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderWatchlistTab = () => (
    <div className="animate-fadeIn">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white mb-1">Your Watchlist</h2>
        <p className="text-xs text-gray-400">Projects you're actively monitoring</p>
      </div>
      
      {watchlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {watchlist.map((item) => (
            <div key={item.projectId} className="bg-sifter-card border border-sifter-border rounded-xl p-4 hover:border-blue-500/30 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm truncate mb-2">{item.projectName}</h3>
                  <ScoreBadge score={item.riskScore} verdict={item.verdict} />
                </div>
                <button
                  onClick={() => {
                    if (onRemoveFromWatchlist) {
                      onRemoveFromWatchlist(item.projectId);
                    } else {
                      setInternalWatchlist(prev => prev.filter(w => w.projectId !== item.projectId));
                    }
                  }}
                  className="text-gray-500 hover:text-red-400 transition-all hover:scale-110 p-1 ml-2"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => startAnalysis(item.projectName)}
                  className="px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5"
                >
                  🔄 Rescan
                </button>
                <button
                  onClick={() => startAnalysis(item.projectName)}
                  className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5"
                >
                  📊 Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-sifter-card border border-sifter-border rounded-xl">
          <div className="text-4xl mb-3 animate-bounce">📋</div>
          <h3 className="text-lg font-bold text-white mb-2">Watchlist Empty</h3>
          <p className="text-sm text-gray-400 mb-4">Add projects to track their risk scores over time.</p>
          <button
            onClick={() => setActiveTab('analyze')}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95"
          >
            Analyze a Project
          </button>
        </div>
      )}
    </div>
  );

  const renderScansTab = () => (
    <div className="animate-fadeIn">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white mb-1">Recent Scans</h2>
        <p className="text-xs text-gray-400">History of all analyzed projects</p>
      </div>
      
      <div className="space-y-3">
        {recentScans.map((scan) => (
          <div key={scan.id} className="bg-sifter-card border border-sifter-border rounded-xl p-4 hover:border-blue-500/30 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`text-2xl ${
                  scan.verdict === 'reject' ? 'text-red-400' :
                  scan.verdict === 'flag' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {scan.verdict === 'reject' ? '🔴' : 
                   scan.verdict === 'flag' ? '🟡' : '🟢'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-sm truncate">{scan.projectName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-xs text-gray-400">
                      {scan.scannedAt.toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      • {Math.round(scan.processingTime / 1000)}s
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <ScoreBadge score={scan.riskScore} verdict={scan.verdict} />
                <button
                  onClick={() => startAnalysis(scan.projectName)}
                  className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs transition-all hover:scale-105 active:scale-95"
                >
                  🔄 Rescan
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLearnTab = () => (
    <div className="animate-fadeIn">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white mb-1">Learn & Educate</h2>
        <p className="text-xs text-gray-400">Knowledge to protect your investments</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-sifter-card border border-sifter-border rounded-xl p-5">
          <h3 className="font-bold text-white mb-3 text-sm">Common Red Flags</h3>
          <div className="space-y-2.5">
            {[
              { id: 1, title: 'Anonymous Team', desc: 'No professional profiles', severity: 'high' },
              { id: 2, title: 'Guaranteed Returns', desc: 'Promises specific profits', severity: 'critical' },
              { id: 3, title: 'Copy-Paste Code', desc: 'Mostly forked repository', severity: 'medium' },
              { id: 4, title: 'No Token Lockup', desc: 'Immediate team unlocks', severity: 'high' },
              { id: 5, title: 'Fake Followers', desc: 'Bot-like engagement', severity: 'medium' },
              { id: 6, title: 'No Roadmap', desc: 'Vague future plans', severity: 'medium' }
            ].map((flag) => (
              <div 
                key={flag.id}
                className={`p-3 rounded-lg border transition-all hover:scale-[1.02] cursor-pointer ${
                  flag.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 hover:border-red-500/40' :
                  flag.severity === 'high' ? 'bg-red-500/5 border-red-500/10 hover:border-red-500/30' :
                  'bg-yellow-500/5 border-yellow-500/10 hover:border-yellow-500/30'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`text-lg ${
                    flag.severity === 'critical' ? 'text-red-400' :
                    flag.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {flag.severity === 'critical' ? '🔥' : '⚠️'}
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm">{flag.title}</h4>
                    <p className="text-xs text-gray-300 mt-0.5">{flag.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border border-blue-500/20 rounded-xl p-5">
            <div className="text-3xl mb-3">🧪</div>
            <h3 className="font-bold text-white text-sm mb-2">Risk Assessment Quiz</h3>
            <p className="text-xs text-gray-400 mb-4">Test your scam detection skills</p>
            <button
              onClick={() => setActiveTab('analyze')}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95 w-full"
            >
              Start Quiz
            </button>
          </div>
          
          <div className="bg-sifter-card border border-sifter-border rounded-xl p-5">
            <h3 className="font-bold text-white mb-3 text-sm">Quick Tips</h3>
            <ul className="space-y-2">
              {[
                '✅ Always verify team identities',
                '✅ Check GitHub for original code',
                '✅ Review token lockup schedules',
                '✅ Analyze community engagement',
                '✅ Watch for unrealistic promises'
              ].map((tip, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-green-400">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const handleRedeemReward = async (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return false;
    
    if (!reward.isAvailable) {
      alert('This reward is currently unavailable!');
      return false;
    }
    
    if (userProfile.availablePoints < reward.pointsCost) {
      alert(`Not enough points! You need ${reward.pointsCost} points but have ${userProfile.availablePoints}.`);
      return false;
    }
    
    // Check tier requirement
    const tierOrder: UserTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'vc-elite', 'research-fellow'];
    if (reward.tierRequirement) {
      const userTierIndex = tierOrder.indexOf(userProfile.currentTier);
      const requiredTierIndex = tierOrder.indexOf(reward.tierRequirement);
      if (userTierIndex < requiredTierIndex) {
        alert(`This reward requires ${reward.tierRequirement} tier or higher. You are currently ${userProfile.currentTier}.`);
        return false;
      }
    }
    
    // Check mode requirement
    if (reward.modeRequirement && reward.modeRequirement !== userProfile.mode) {
      alert(`This reward is only available for ${reward.modeRequirement} mode users.`);
      return false;
    }
    
    try {
      // In a real app, this would be an API call
      console.log(`Redeeming reward: ${reward.name} for ${reward.pointsCost} points`);
      
      // Update user points
      setUserProfile(prev => ({
        ...prev,
        availablePoints: prev.availablePoints - reward.pointsCost,
        totalPoints: prev.totalPoints - reward.pointsCost
      }));
      
      // Update reward quantity if applicable
      if (reward.quantityRemaining !== undefined) {
        setRewards(prev => prev.map(r => 
          r.id === rewardId 
            ? { ...r, quantityRemaining: (r.quantityRemaining || 1) - 1 }
            : r
        ));
      }
      
      // Show success message
      alert(`Successfully redeemed: ${reward.name}!\n\n${reward.redemptionInstructions}\n\nYou've been charged ${reward.pointsCost} points.`);
      
      return true;
    } catch (error) {
      console.error('Failed to redeem reward:', error);
      alert('Failed to redeem reward. Please try again.');
      return false;
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn relative min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-30">
        <div>
          <h1 className="text-xl font-bold text-white">
            👋 Welcome, <span className="text-blue-400">{userName}</span>
          </h1>
          <p className="text-xs text-gray-400">13-metric risk analysis</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => alert('Share feature coming soon!')}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <span className="text-sm">📤</span>
            Share
          </button>
          
          <div className="relative">
            <button
              ref={exportButtonRef}
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <span className="text-sm">📥</span>
              Export
              <span className={`text-xs transition-transform ${showExportMenu ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {showExportMenu && (
              <div 
                ref={exportMenuRef}
                className="absolute top-full right-0 mt-1.5 z-50 animate-fadeIn shadow-2xl"
              >
                <div className="bg-sifter-card border border-sifter-border rounded-lg w-56 overflow-hidden">
                  <div className="p-3 border-b border-sifter-border bg-sifter-card/95">
                    <h3 className="font-bold text-white text-sm">Export Data</h3>
                    <p className="text-xs text-gray-400">Choose format and data</p>
                  </div>
                  
                  <div className="p-1.5 max-h-80 overflow-y-auto">
                    {analysisResults && (
                      <div className="mb-1.5">
                        <div className="px-2 py-1 text-xs font-medium text-gray-500">CURRENT ANALYSIS</div>
                        <button onClick={() => exportAnalysisResults('json')} className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded text-sm flex items-center gap-2">
                          <span className="text-blue-400">📊</span>
                          <span className="text-white">Export as JSON</span>
                        </button>
                        <button onClick={() => exportAnalysisResults('csv')} className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded text-sm flex items-center gap-2">
                          <span className="text-green-400">📈</span>
                          <span className="text-white">Export as CSV/Excel</span>
                        </button>
                        <button onClick={() => exportAnalysisResults('pdf')} className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded text-sm flex items-center gap-2">
                          <span className="text-red-400">📄</span>
                          <span className="text-white">Export as PDF</span>
                        </button>
                      </div>
                    )}
                    
                    <div className="mb-1.5">
                      <div className="px-2 py-1 text-xs font-medium text-gray-500">WATCHLIST</div>
                      <button onClick={() => exportWatchlist('json')} className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded text-sm flex items-center gap-2">
                        <span className="text-green-400">📋</span>
                        <span className="text-white">Export as JSON</span>
                      </button>
                      <button onClick={() => exportWatchlist('csv')} className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded text-sm flex items-center gap-2">
                        <span className="text-green-400">📈</span>
                        <span className="text-white">Export as CSV/Excel</span>
                      </button>
                      <button onClick={() => exportWatchlist('pdf')} className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded text-sm flex items-center gap-2">
                        <span className="text-green-400">📄</span>
                        <span className="text-white">Export as PDF</span>
                      </button>
                    </div>
                    
                    <div className="mb-1.5">
                      <div className="px-2 py-1 text-xs font-medium text-gray-500">RECENT SCANS</div>
                      <button onClick={() => exportRecentScans('json')} className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded text-sm flex items-center gap-2">
                        <span className="text-purple-400">📊</span>
                        <span className="text-white">Export as JSON</span>
                      </button>
                      <button onClick={() => exportRecentScans('csv')} className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded text-sm flex items-center gap-2">
                        <span className="text-purple-400">📈</span>
                        <span className="text-white">Export as CSV/Excel</span>
                        </button>
                        <button onClick={() => exportRecentScans('pdf')} className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded text-sm flex items-center gap-2">
                          <span className="text-purple-400">📄</span>
                          <span className="text-white">Export as PDF</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-1.5 border-t border-sifter-border">
                      <button onClick={() => setShowExportMenu(false)} className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-sifter-card border border-sifter-border rounded-lg p-1">
        <div className="flex overflow-x-auto gap-1 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { id: 'analyze', icon: '🔍', label: 'Analyze' },
            { id: 'watchlist', icon: '📋', label: `Watchlist (${watchlist.length})` },
            { id: 'scans', icon: '📊', label: `Scans (${recentScans.length})` },
            { id: 'learn', icon: '📚', label: 'Learn' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'analyze') resetAnalysis();
                setActiveTab(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {activeTab === 'analyze' && renderAnalyzeTab()}
        {activeTab === 'watchlist' && renderWatchlistTab()}
        {activeTab === 'scans' && renderScansTab()}
        {activeTab === 'learn' && renderLearnTab()}
      </div>
    </div>

    );
  }