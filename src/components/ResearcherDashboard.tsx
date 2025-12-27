// components/ResearcherDashboard.tsx - CORRECTED WITH ACTUAL TYPES
'use client';

import React, { useState, useEffect } from 'react';

import { PointsDisplay } from '@/components/data-donation/gamification';
import { RewardsShop } from '@/components/data-donation/gamification';
import { createMetricsArray } from '@/utils/metricHelpers';
import { generateDetailedMetricEvidence } from '@/utils/metricHelpers';

import { DisputeForm } from '@/components/data-donation/universal';

import SmartInputParser from './SmartInputParser';
import MetricBreakdown from './MetricBreakdown';
import ResearchReport from './ResearchReport';
import ResearchCharts from './ResearchCharts';
import { 
  SmartInputResult, 
  ProjectData, 
  AnalysisHistory, 
  ScamPattern, 
  MetricData,
  PatternExample,
  DetectionRule,
  VerdictType,
  EvidenceItem 
} from '@/types';
import { generateMockProjectData } from '@/data/mockData';
import { ExportService } from '@/services/exportService';

// Import the actual types
import type { 
  UserGamificationProfile, 
  Reward,
  EntityType,
  EvidenceType,
  UserMode
} from '@/types/dataDonation';

// Helper function to get metric value by key or name
export const getMetricValue = (metrics: MetricData[], keyOrName: string): number => {
  if (!metrics || !Array.isArray(metrics)) return 0;
  
  const metric = metrics.find(m => 
    m.key === keyOrName || 
    (m.name && m.name.toLowerCase().includes(keyOrName.toLowerCase())) ||
    (keyOrName.toLowerCase().includes(m.name?.toLowerCase() || ''))
  );
  
  if (!metric) return 0;
  
  // Try to get numeric value from different possible properties
  if (typeof metric.value === 'number') return metric.value;
  if (typeof metric.score === 'number') return metric.score;
  if (typeof metric.scoreValue === 'number') return metric.scoreValue;
  if (typeof metric.contribution === 'number') return metric.contribution;
  
  // Try to convert string value to number
  if (typeof metric.value === 'string') {
    const parsed = parseFloat(metric.value);
    if (!isNaN(parsed)) return parsed;
  }
  
  return 0;
};

// Update ResearcherDashboardProps interface to match page.tsx
interface ResearcherDashboardProps {
  onAnalyze: (input: string) => void;
  userEmail: string;
  
  onExportPDF?: (data: ProjectData) => void;
  onExportJSON?: (data: ProjectData) => void;
  onExportCSV?: (data: ProjectData) => void;
  currentProjectData?: ProjectData;
  projectMetrics?: MetricData[];
  userName?: string;
  // NEW: Accept AnalysisHistory[] instead of internal conversion
  recentScans?: AnalysisHistory[];
  // NEW: Callback updates to match page.tsx
  onAddToWatchlist?: (projectName: string, riskScore: number, verdict: VerdictType) => void;
  onViewReport?: (scanId: string) => void;
  onRemoveFromWatchlist?: (projectId: string) => void;
}

export default function ResearcherDashboard({ 
  onAnalyze, 
  userEmail,

  onExportPDF,
  onExportJSON,
  onExportCSV,
  currentProjectData,
  projectMetrics = [],
  userName,
  // NEW props
  recentScans: externalRecentScans,
  onAddToWatchlist,
  onViewReport,
  onRemoveFromWatchlist
}: ResearcherDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analyze' | 'compare' | 'patterns' | 'database' | 'exports'>('analyze');
  const [currentProject, setCurrentProject] = useState<ProjectData | null>(currentProjectData || null);
  const [comparisonProjects, setComparisonProjects] = useState<ProjectData[]>([]);
  
  // Use external recentScans if provided, otherwise use internal mock data
  const [internalRecentScans, setInternalRecentScans] = useState<AnalysisHistory[]>([
    { id: '1', projectName: 'MoonDoge Protocol', riskScore: 89, verdict: 'reject', scannedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), processingTime: 87 },
    { id: '2', projectName: 'CryptoGrowth Labs Analysis', riskScore: 93, verdict: 'reject', scannedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), processingTime: 120 },
    { id: '3', projectName: 'DeFi Alpha Protocol', riskScore: 23, verdict: 'pass', scannedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), processingTime: 92 },
    { id: '4', projectName: 'TokenSwap Pro', riskScore: 55, verdict: 'flag', scannedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), processingTime: 78 },
  ]);
  
  const recentScans = externalRecentScans || internalRecentScans;
  const [filteredProjects, setFilteredProjects] = useState<ProjectData[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<{[key: string]: boolean}>({});
  const [showAllMetrics, setShowAllMetrics] = useState<{[key: string]: boolean}>({});
  
  const [projectInput, setProjectInput] = useState('');
  
  const [analysisOptions, setAnalysisOptions] = useState({
    includeComparative: true,
    generateStatisticalTests: true,
    exportRawData: true,
    customWeighting: false,
    patternMatching: true,
    historicalComparison: true
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showResearchReport, setShowResearchReport] = useState(false);
  const [reportActiveTab, setReportActiveTab] = useState<'metrics' | 'patterns' | 'summary'>('metrics');
  
  const [customWeights, setCustomWeights] = useState({
    teamIdentity: 13,
    teamCompetence: 11,
    contaminatedNetwork: 19,
    mercenaryKeywords: 9,
    messageTimeEntropy: 5,
    accountAgeEntropy: 5,
    tweetFocus: 7,
    githubAuthenticity: 10,
    busFactor: 2,
    artificialHype: 5,
    founderDistraction: 6,
    engagementAuthenticity: 10,
    tokenomics: 7
  });

  const [patterns, setPatterns] = useState<ScamPattern[]>([
    {
      id: 'p1',
      name: 'Sybil Community Pattern',
      description: 'Bulk account creation + coordinated messaging',
      confidence: 94,
      examples: [
        { projectName: 'MoonDoge Protocol', outcome: 'rug', evidence: [], similarityScore: 92 },
        { projectName: 'GemToken', outcome: 'failure', evidence: [], similarityScore: 88 },
        { projectName: 'ShillCoin', outcome: 'abandoned', evidence: [], similarityScore: 85 },
      ],
      detectionRules: [
        { condition: 'Account age entropy < 30', weight: 25, description: 'Bulk account creation detection' },
        { condition: 'Message time entropy < 40', weight: 35, description: 'Coordinated posting patterns' },
        { condition: 'Similarity ratio > 60%', weight: 40, description: 'Copy-pasta message detection' },
      ]
    },
    {
      id: 'p2',
      name: 'Agency Contamination Pattern',
      description: 'Known rug agencies with track record',
      confidence: 96,
      examples: [
        { projectName: 'ProjectX Token', outcome: 'rug', evidence: [], similarityScore: 96 },
        { projectName: 'TokenY Protocol', outcome: 'abandoned', evidence: [], similarityScore: 87 },
        { projectName: 'RugPull Finance', outcome: 'rug', evidence: [], similarityScore: 94 },
      ],
      detectionRules: [
        { condition: 'Connected to flagged agency', weight: 60, description: 'Agency reputation database match' },
        { condition: 'Multiple previous failures', weight: 40, description: 'Historical failure rate analysis' },
      ]
    },
  ]);

  const [databaseStats, setDatabaseStats] = useState({
    flaggedEntities: 50,
    projectsScanned: 127,
    patternsDocumented: 47,
    historicalSuccessRate: 76,
    avgProcessingTime: 87,
    lastUpdated: '2 hours ago',
  });

  const handleRemoveFromComparison = (projectId: string) => {
  setComparisonProjects(prev => prev.filter(p => p.id !== projectId));
};

  // Get metric values using helper function
  const founderDistractionValue = getMetricValue(projectMetrics, 'founderDistraction');
  const mercenaryKeywordsValue = getMetricValue(projectMetrics, 'mercenaryKeywords');
  const contaminatedNetworkValue = getMetricValue(projectMetrics, 'contaminatedNetwork');
  const teamIdentityValue = getMetricValue(projectMetrics, 'teamIdentity');

  // Update currentProject when prop changes
  useEffect(() => {
    if (currentProjectData) {
      setCurrentProject(currentProjectData);
    }
  }, [currentProjectData]);

  // Convert AnalysisHistory[] to display format for charts and tables
  useEffect(() => {
    const displayProjects = recentScans.map(scan => {
      const mockData = generateMockProjectData(scan.projectName);
      
      return {
        ...mockData,
        id: scan.id,
        canonicalName: scan.projectName.toLowerCase().replace(/\s+/g, '-'),
        displayName: scan.projectName,
        overallRisk: {
          ...mockData.overallRisk,
          score: scan.riskScore,
          verdict: scan.verdict
        },
        scannedAt: scan.scannedAt,
        weight: 100
      } as ProjectData;
    });
    setFilteredProjects(displayProjects);
  }, [recentScans]);

  const toggleProjectDetails = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const toggleAllMetrics = (projectId: string) => {
    setShowAllMetrics(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const handleSmartInputResolve = (result: SmartInputResult) => {
    if (result.selectedEntity) {
      setProjectInput(result.selectedEntity.displayName);
      runDeepAnalysis(result.selectedEntity.displayName);
    }
  };

  const runDeepAnalysis = async (projectName: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);
    
    setTimeout(() => {
      clearInterval(interval);
      const mockData = generateMockProjectData(projectName);
      setCurrentProject(mockData);
      
      const newAnalysis: AnalysisHistory = {
        id: `analysis_${Date.now()}`,
        projectName: mockData.displayName,
        riskScore: mockData.overallRisk.score,
        verdict: mockData.overallRisk.verdict,
        scannedAt: new Date(),
        processingTime: mockData.processingTime
      };
      
      setInternalRecentScans(prev => [newAnalysis, ...prev.slice(0, 9)]);
      setActiveTab('analyze');
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      
      // Call parent's onAnalyze if provided
      if (onAnalyze) {
        onAnalyze(projectName);
      }
    }, 3000);
  };

  const runStatisticalTest = () => {
    setReportActiveTab('metrics');
    if (!currentProject) {
      const mockData = generateMockProjectData(projectInput || 'New Project');
      setCurrentProject(mockData);
    }
    setShowResearchReport(true);
  };

  const runHistoricalPattern = () => {
    setReportActiveTab('patterns');
    if (!currentProject) {
      const mockData = generateMockProjectData(projectInput || 'New Project');
      setCurrentProject(mockData);
    }
    setShowResearchReport(true);
  };

  const handleAddToComparison = (projectName: string) => {
    const mockComparison = generateMockProjectData(projectName);
    setComparisonProjects(prev => {
      const exists = prev.some(p => p.displayName === projectName);
      if (exists) return prev;
      return [...prev, mockComparison].slice(0, 5);
    });
    setActiveTab('compare');
  };

  const handleExportAnalysis = async (format: 'csv' | 'json' | 'pdf', projectData?: ProjectData) => {
    try {
      const dataToExport = projectData || currentProject;
      if (!dataToExport) {
        alert('No project data to export. Please run an analysis first.');
        return;
      }

      switch (format) {
        case 'csv':
          if (onExportCSV) {
            onExportCSV(dataToExport);
          } else {
            ExportService.exportMetricsToCSV(dataToExport.metrics, dataToExport.displayName);
          }
          break;
          
        case 'json':
          if (onExportJSON) {
            onExportJSON(dataToExport);
          } else {
            ExportService.exportProjectAnalysis(dataToExport);
          }
          break;
          
        case 'pdf':
          if (onExportPDF) {
            onExportPDF(dataToExport);
          } else {
            ExportService.exportToPDF(dataToExport);
          }
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleShareAnalysis = async (platform?: 'twitter' | 'linkedin' | 'clipboard') => {
    if (!currentProject) {
      alert('No analysis to share. Please run an analysis first.');
      return;
    }
    
    try {
      let success = false;
      
      if (platform === 'twitter' || platform === 'linkedin') {
        success = await ExportService.shareAnalysis(currentProject, platform);
      } else {
        success = await ExportService.shareAnalysis(currentProject, 'clipboard');
        if (success) {
          alert('Analysis summary copied to clipboard!');
        }
      }
      
      if (!success && platform !== 'clipboard') {
        alert('Failed to share. Please try again.');
      }
    } catch (error) {
      console.error('Error sharing analysis:', error);
      alert('Failed to share analysis. Please try again.');
    }
  };

  const toggleAdvancedOptions = () => {
    setShowAdvancedOptions(!showAdvancedOptions);
  };

  const resetCustomWeights = () => {
    setCustomWeights({
      teamIdentity: 13,
      teamCompetence: 11,
      contaminatedNetwork: 19,
      mercenaryKeywords: 9,
      messageTimeEntropy: 5,
      accountAgeEntropy: 5,
      tweetFocus: 7,
      githubAuthenticity: 10,
      busFactor: 2,
      artificialHype: 5,
      founderDistraction: 6,
      engagementAuthenticity: 10,
      tokenomics: 7
    });
  };

  const renderComparisonChart = () => {
    if (comparisonProjects.length === 0) return null;
    
    const metrics = [
      { name: 'Team Identity', key: 'teamIdentity' },
      { name: 'Contaminated Network', key: 'contaminatedNetwork' },
      { name: 'GitHub Auth', key: 'githubAuthenticity' },
      { name: 'Tokenomics', key: 'tokenomics' }
    ];
    
    return (
      <div className="bg-gray-900/30 p-4 rounded-lg">
        <div className="text-sm font-medium text-gray-300 mb-3">Metric Comparison</div>
        <div className="grid grid-cols-4 gap-4">
          {metrics.map((metric, metricIdx) => (
            <div key={metricIdx} className="space-y-2">
              <div className="text-xs text-gray-400">{metric.name}</div>
              {comparisonProjects.map((project, projIdx) => {
                const metricValue = getMetricValue(project.metrics, metric.key);
                return (
                  <div key={projIdx} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      metricValue >= 80 ? 'bg-red-500' :
                      metricValue >= 60 ? 'bg-orange-500' :
                      metricValue >= 40 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    <div className="text-xs text-gray-300 truncate">{project.displayName}</div>
                    <div className="text-xs font-medium text-white ml-auto">
                      {metricValue}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // UPDATED: Handle viewing report from scan ID
  const handleViewFullReport = (scanId: string) => {
    const scan = recentScans.find(s => s.id === scanId);
    if (scan) {
      const mockData = generateMockProjectData(scan.projectName);
      setCurrentProject(mockData);
      setShowResearchReport(true);
    }
  };

  // UPDATED: Handle comparing project from scan
  const handleCompareProject = (scanId: string) => {
    const scan = recentScans.find(s => s.id === scanId);
    if (scan) {
      handleAddToComparison(scan.projectName);
    }
  };

  // UPDATED: Handle exporting project from scan
  const handleExportProject = (scanId: string) => {
    const scan = recentScans.find(s => s.id === scanId);
    if (scan) {
      const mockData = generateMockProjectData(scan.projectName);
      setCurrentProject(mockData);
      
      const format = prompt('Choose export format: csv, json, or pdf', 'csv');
      if (format && ['csv', 'json', 'pdf'].includes(format.toLowerCase())) {
        handleExportAnalysis(format.toLowerCase() as 'csv' | 'json' | 'pdf', mockData);
      }
    }
  };

  // UPDATED: Handle adding to watchlist from scan
  const handleAddToWatchlistFromScan = (scanId: string) => {
    const scan = recentScans.find(s => s.id === scanId);
    if (scan && onAddToWatchlist) {
      onAddToWatchlist(scan.projectName, scan.riskScore, scan.verdict);
      alert(`Added ${scan.projectName} to watchlist!`); // Add confirmation
    } else if (scan) {
      // Fallback: Use internal state if no callback provided
      alert(`Added ${scan.projectName} to watchlist!`);
    }
  };


  const calculateHighestRiskMetric = (): string => {
    if (!currentProject || !currentProject.metrics) return 'N/A';
    
    let highestName = '';
    let highestScore = -1;
    
    currentProject.metrics.forEach(metric => {
      const value = getMetricValue([metric], metric.key || metric.name || '');
      if (value > highestScore) {
        highestScore = value;
        highestName = metric.name || metric.key || 'N/A';
      }
    });
    
    return highestName;
  };

  const calculateLowestRiskMetric = (): string => {
    if (!currentProject || !currentProject.metrics) return 'N/A';
    
    let lowestName = '';
    let lowestScore = 101;
    
    currentProject.metrics.forEach(metric => {
      const value = getMetricValue([metric], metric.key || metric.name || '');
      if (value < lowestScore) {
        lowestScore = value;
        lowestName = metric.name || metric.key || 'N/A';
      }
    });
    
    return lowestName;
  };

  const calculateAvgMetricScore = (): number => {
    if (!currentProject || !currentProject.metrics) return 0;
    
    const total = currentProject.metrics.reduce((sum, metric) => {
      return sum + getMetricValue([metric], metric.key || metric.name || '');
    }, 0);
    
    return Math.round(total / currentProject.metrics.length);
  };

  const calculateCriticalFlags = (): number => {
    if (!currentProject || !currentProject.metrics) return 0;
    
    return currentProject.metrics.filter(metric => {
      const value = getMetricValue([metric], metric.key || metric.name || '');
      return value >= 80;
    }).length;
  };

  const renderExportTable = () => {
    const exportData = [
      { name: 'MoonDoge_analysis.csv', date: '2 hours ago', size: '2.4 MB', type: 'csv' },
      { name: 'CryptoGrowth_patterns.json', date: '1 day ago', size: '1.8 MB', type: 'json' },
      { name: 'Q4_2024_report.pdf', date: '3 days ago', size: '5.2 MB', type: 'pdf' },
    ];

    const handleDownload = (exportFile: typeof exportData[0]) => {
      if (!currentProject) {
        alert('Please run an analysis first to export data.');
        return;
      }
      
      switch (exportFile.type) {
        case 'csv':
          handleExportAnalysis('csv', currentProject);
          break;
        case 'json':
          handleExportAnalysis('json', currentProject);
          break;
        case 'pdf':
          handleExportAnalysis('pdf', currentProject);
          break;
      }
    };

    return (
      <div className="border border-sifter-border rounded-lg p-4">
        <h4 className="font-medium text-white mb-3">Recent Exports</h4>
        <div className="space-y-2">
          {exportData.map((exportFile, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-gray-900/30 rounded">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded ${
                  exportFile.type === 'csv' ? 'bg-blue-500/20' :
                  exportFile.type === 'json' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {exportFile.type === 'csv' ? '📊' : exportFile.type === 'json' ? '💾' : '📄'}
                </div>
                <div>
                  <div className="font-medium text-white text-sm">{exportFile.name}</div>
                  <div className="text-xs text-gray-500">{exportFile.date} • {exportFile.size}</div>
                </div>
              </div>
              <button 
                onClick={() => handleDownload(exportFile)}
                className="text-purple-400 hover:text-purple-300 text-sm px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 rounded transition-colors"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Create proper user profile based on actual types
  const userProfile: UserGamificationProfile = {
    userId: userEmail || 'researcher',
    mode: 'researcher' as UserMode,
    totalPoints: 1250,
    availablePoints: 850,
    lifetimePoints: 2500,
    currentLevel: 3,
    currentTier: 'gold',
    badges: [
      {
        id: 'first_submission',
        name: 'First Submission',
        description: 'Made your first evidence submission',
        icon: '🥇',
        earnedAt: new Date().toISOString(),
        rarity: 'common',
        category: 'submission',
        pointsReward: 50
      },
      {
        id: 'pattern_discoverer',
        name: 'Pattern Discoverer',
        description: 'Identified a new scam pattern',
        icon: '🔍',
        earnedAt: new Date().toISOString(),
        rarity: 'rare',
        category: 'impact',
        pointsReward: 200
      }
    ],
    achievements: [
      {
        id: 'submit_10_evidences',
        name: 'Evidence Collector',
        description: 'Submit 10 pieces of evidence',
        progress: 7,
        target: 10,
        completed: false,
        pointsReward: 150
      },
      {
        id: 'high_accuracy',
        name: 'High Accuracy',
        description: 'Maintain 80%+ accuracy on submissions',
        progress: 85,
        target: 80,
        completed: true,
        completedAt: new Date().toISOString(),
        pointsReward: 100
      }
    ],
    streak: {
      currentStreak: 14,
      longestStreak: 21,
      lastActivity: new Date().toISOString(),
      streakBonus: 1.5
    },
    leaderboardPosition: 42,
    nextMilestone: {
      pointsNeeded: 500,
      reward: 'Premium Analysis Tools',
      unlocks: ['Extended data export', 'API access', 'Historical analysis', 'Custom reports']
    },
    displayName: userName || userEmail || 'Researcher',
    pointsMultiplier: 1.2
  };

  // Create proper rewards based on actual types
  const rewards: Reward[] = [
    {
      id: 'premium_report',
      name: 'Premium Research Report',
      description: 'Get access to premium analysis features and detailed reports',
      type: 'access',
      category: 'researcher',
      pointsCost: 1000,
      quantityAvailable: 50,
      quantityRemaining: 35,
      tierRequirement: 'silver',
      modeRequirement: 'researcher',
      features: ['Extended data export', 'API access', 'Historical analysis'],
      redemptionInstructions: 'Access will be granted within 24 hours of redemption',
      createdAt: new Date().toISOString()
    },
    {
      id: 'export_credits',
      name: 'Export Credits',
      description: '5 additional export credits for CSV/JSON/PDF exports',
      type: 'feature',
      category: 'researcher',
      pointsCost: 500,
      quantityAvailable: 100,
      quantityRemaining: 75,
      tierRequirement: 'bronze',
      modeRequirement: 'researcher',
      features: ['5 export credits', 'Unlimited formats'],
      redemptionInstructions: 'Credits added automatically to your account',
      createdAt: new Date().toISOString()
    },
    {
      id: 'priority_queue',
      name: 'Priority Analysis',
      description: 'Jump to front of analysis queue for 5 projects',
      type: 'feature',
      category: 'researcher',
      pointsCost: 750,
      quantityAvailable: 20,
      quantityRemaining: 12,
      tierRequirement: 'gold',
      modeRequirement: 'researcher',
      features: ['Priority processing', '5 project slots'],
      redemptionInstructions: 'Priority status activated immediately',
      createdAt: new Date().toISOString()
    },
    {
      id: 'data_access',
      name: 'Extended Data Access',
      description: 'Access to historical analysis database for 30 days',
      type: 'access',
      category: 'researcher',
      pointsCost: 1500,
      quantityAvailable: 30,
      quantityRemaining: 18,
      tierRequirement: 'gold',
      modeRequirement: 'researcher',
      features: ['Full database access', '30-day duration', 'API endpoints'],
      redemptionInstructions: 'Access token sent via email within 2 hours',
      createdAt: new Date().toISOString()
    },
    {
      id: 'api_access',
      name: 'API Access',
      description: 'Programmatic access to analysis data and endpoints',
      type: 'access',
      category: 'researcher',
      pointsCost: 2000,
      quantityAvailable: 10,
      quantityRemaining: 4,
      tierRequirement: 'platinum',
      modeRequirement: 'researcher',
      features: ['Full API access', 'Rate limits 1000/hour', 'Webhook support'],
      redemptionInstructions: 'API key and documentation sent within 48 hours',
      createdAt: new Date().toISOString()
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-xl">🔬</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Research Lab</h1>
              <p className="text-gray-400 text-sm">Deep analysis, data export, comparative studies</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
       
          
          <div className="text-right">
            <div className="text-sm text-gray-400">Researcher</div>
            <div className="font-medium text-white">{userName || userEmail || 'Researcher'}</div>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-sm font-medium">
            🔬 Researcher Mode
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-sifter-card border border-sifter-border rounded-lg p-3 hover:border-purple-500/30 transition-colors">
          <div className="text-lg font-bold text-white">{databaseStats.flaggedEntities}</div>
          <div className="text-xs text-gray-400">Flagged Entities</div>
        </div>
        <div className="bg-sifter-card border border-sifter-border rounded-lg p-3 hover:border-purple-500/30 transition-colors">
          <div className="text-lg font-bold text-white">{databaseStats.projectsScanned}</div>
          <div className="text-xs text-gray-400">Projects</div>
        </div>
        <div className="bg-sifter-card border border-sifter-border rounded-lg p-3 hover:border-purple-500/30 transition-colors">
          <div className="text-lg font-bold text-white">{databaseStats.patternsDocumented}</div>
          <div className="text-xs text-gray-400">Patterns</div>
        </div>
        <div className="bg-sifter-card border border-sifter-border rounded-lg p-3 hover:border-purple-500/30 transition-colors">
          <div className="text-lg font-bold text-green-400">{databaseStats.historicalSuccessRate}%</div>
          <div className="text-xs text-gray-400">Accuracy</div>
        </div>
        <div className="bg-sifter-card border border-sifter-border rounded-lg p-3 hover:border-purple-500/30 transition-colors">
          <div className="text-lg font-bold text-white">{databaseStats.avgProcessingTime}s</div>
          <div className="text-xs text-gray-400">Avg. Time</div>
        </div>
        <div className="bg-sifter-card border border-sifter-border rounded-lg p-3 hover:border-purple-500/30 transition-colors">
          <div className="text-lg font-bold text-blue-400">13</div>
          <div className="text-xs text-gray-400">Metrics</div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="border-b border-sifter-border">
        <div className="flex overflow-x-auto space-x-4 sm:space-x-6 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {(['analyze', 'compare', 'patterns', 'database', 'exports'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab === 'analyze' && <>🔬 <span className="hidden sm:inline">Analysis</span></>}
              {tab === 'compare' && <>📊 <span className="hidden sm:inline">Compare</span></>}
              {tab === 'patterns' && <>📚 <span className="hidden sm:inline">Patterns</span></>}
              {tab === 'database' && <>🗄️ <span className="hidden sm:inline">Database</span></>}
              {tab === 'exports' && <>📤 <span className="hidden sm:inline">Export</span></>}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            {/* New Analysis Section */}
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">New Analysis</h3>
                <button
                  onClick={toggleAdvancedOptions}
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  {showAdvancedOptions ? '▲ Hide' : '▼ Advanced'} Options
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Project Identifier</label>
                  <SmartInputParser 
                    onResolve={handleSmartInputResolve}
                    placeholder="Enter Twitter, Discord, GitHub, website, or project name..."
                    disabled={isAnalyzing}
                  />
                </div>
                
                {showAdvancedOptions && (
                  <div className="border border-sifter-border rounded-lg p-4 bg-gray-900/30 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Analysis Type</label>
                        <select 
                          className="w-full bg-sifter-dark border border-sifter-border rounded-lg px-3 py-2 text-white text-sm"
                          defaultValue="standard"
                        >
                          <option value="standard">Standard 13-metric analysis</option>
                          <option value="deep">Deep network analysis</option>
                          <option value="historical">Historical pattern matching</option>
                          <option value="custom">Custom metric weighting</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Statistical Tests</label>
                        <select 
                          className="w-full bg-sifter-dark border border-sifter-border rounded-lg px-3 py-2 text-white text-sm"
                          defaultValue="all"
                        >
                          <option value="all">All tests (Chi-square, Correlation, ANOVA)</option>
                          <option value="chi-square">Chi-square test only</option>
                          <option value="correlation">Correlation analysis</option>
                          <option value="anova">ANOVA analysis</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-sm text-gray-400">Advanced Options</div>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 text-sm text-gray-300">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-600 bg-sifter-dark" 
                            checked={analysisOptions.includeComparative}
                            onChange={(e) => setAnalysisOptions({...analysisOptions, includeComparative: e.target.checked})}
                          />
                          Comparative analysis
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-300">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-600 bg-sifter-dark" 
                            checked={analysisOptions.generateStatisticalTests}
                            onChange={(e) => setAnalysisOptions({...analysisOptions, generateStatisticalTests: e.target.checked})}
                          />
                          Statistical tests
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-300">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-600 bg-sifter-dark" 
                            checked={analysisOptions.exportRawData}
                            onChange={(e) => setAnalysisOptions({...analysisOptions, exportRawData: e.target.checked})}
                          />
                          Export raw data
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-300">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-600 bg-sifter-dark" 
                            checked={analysisOptions.patternMatching}
                            onChange={(e) => setAnalysisOptions({...analysisOptions, patternMatching: e.target.checked})}
                          />
                          Pattern matching
                        </label>
                      </div>
                    </div>
                    
                    {analysisOptions.customWeighting && (
                      <div className="border-t border-sifter-border pt-4">
                        <div className="flex justify-between items-center mb-3">
                          <div className="text-sm font-medium text-gray-300">Custom Metric Weights</div>
                          <button
                            onClick={resetCustomWeights}
                            className="text-xs text-purple-400 hover:text-purple-300"
                          >
                            Reset to Default
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {Object.entries(customWeights).map(([metric, weight]) => (
                            <div key={metric} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">{metric.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className="text-white">{weight}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="30"
                                value={weight}
                                onChange={(e) => setCustomWeights({...customWeights, [metric]: parseInt(e.target.value)})}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isAnalyzing ? (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-300">Running deep analysis...</div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-700 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analysisProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Collecting data...</span>
                      <span>{analysisProgress}%</span>
                      <span>Running tests...</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const projectName = projectInput || 'New Project';
                        runDeepAnalysis(projectName);
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                      disabled={!projectInput}
                    >
                      <span>🔬</span>
                      Run Deep Analysis
                    </button>
                    <button
                      onClick={runStatisticalTest}
                      className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      Run Statistical Test
                    </button>
                    <button
                      onClick={runHistoricalPattern}
                      className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      Historical Pattern
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Current Analysis Results */}
            {currentProject && !isAnalyzing && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Analysis Results</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentProject(null)}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      ✕ Clear Results
                    </button>
                    <button
                      onClick={() => handleAddToComparison(currentProject.displayName)}
                      className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-medium transition-colors"
                    >
                      📈 Add to Comparison
                    </button>
                    <button
                      onClick={() => setShowResearchReport(true)}
                      className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium transition-colors"
                    >
                      📊 View Full Report
                    </button>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-gray-900/30 p-3 rounded-lg">
                    <div className="text-xs text-gray-400">Highest Risk</div>
                    <div className="text-base font-bold text-red-400">
                      {calculateHighestRiskMetric()}
                    </div>
                  </div>
                  <div className="bg-gray-900/30 p-3 rounded-lg">
                    <div className="text-xs text-gray-400">Lowest Risk</div>
                    <div className="text-base font-bold text-green-400">
                      {calculateLowestRiskMetric()}
                    </div>
                  </div>
                  <div className="bg-gray-900/30 p-3 rounded-lg">
                    <div className="text-xs text-gray-400">Avg. Metric Score</div>
                    <div className="text-base font-bold text-white">
                      {calculateAvgMetricScore()}
                    </div>
                  </div>
                  <div className="bg-gray-900/30 p-3 rounded-lg">
                    <div className="text-xs text-gray-400">Critical Flags</div>
                    <div className="text-base font-bold text-orange-400">
                      {calculateCriticalFlags()}
                    </div>
                  </div>
                </div>
                
                <MetricBreakdown
                instanceId="main-analysis" // ✅ ADD THIS
                  metrics={currentProject.metrics}
                  projectName={currentProject.displayName}
                  riskScore={currentProject.overallRisk.score}
                  onExport={() => handleExportAnalysis('pdf', currentProject)}
                  projectData={currentProject}
                />
              </div>
            )}

            {/* Analysis Dashboard */}
            {filteredProjects.length > 0 && (
              <div className="bg-sifter-card border border-sifter-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Analysis Dashboard</h2>
                    <p className="text-gray-400 text-sm">13-metric risk assessment results</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        if (currentProject) {
                          handleExportAnalysis('csv', currentProject);
                        } else if (filteredProjects.length > 0) {
                          handleExportAnalysis('csv', filteredProjects[0]);
                        } else {
                          alert('Please run an analysis first to export data.');
                        }
                      }}
                      className="px-4 py-2 bg-sifter-dark hover:bg-sifter-border text-gray-300 border border-sifter-border rounded-lg font-medium transition-colors text-sm"
                    >
                      Export Data
                    </button>
                    <button 
                      onClick={() => setActiveTab('compare')}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      Compare Selected
                    </button>
                  </div>
                </div>

                {/* Charts Section - Now uses filteredProjects (converted from recentScans) */}
                <ResearchCharts projects={filteredProjects} />

               

                {/* Detailed Analysis */}
                <div className="mt-8">
                  <h3 className="font-bold text-white mb-4">Detailed Analysis by Project</h3>
                  
                  {recentScans.map((scan) => (
                    <div key={scan.id} className="mb-4">
                      <div className="bg-sifter-dark border border-sifter-border rounded-lg p-4">
                        {/* Project Header */}
                        <button
                          onClick={() => toggleProjectDetails(scan.id)}
                          className="w-full flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`text-xl ${
                              scan.riskScore >= 60 ? 'text-red-400' :
                              scan.riskScore >= 30 ? 'text-yellow-400' : 'text-green-400'
                            }`}>
                              {scan.riskScore >= 60 ? '🔴' : 
                               scan.riskScore >= 30 ? '🟡' : '🟢'}
                            </div>
                            <div>
                              <div className="font-bold text-white">{scan.projectName}</div>
                              <div className="flex items-center gap-2 text-sm">
                                <div className={`px-2 py-0.5 rounded-full text-xs ${
                                  scan.verdict === 'reject' ? 'bg-red-500/20 text-red-400' :
                                  scan.verdict === 'flag' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {scan.verdict.toUpperCase()}
                                </div>
                                <div className="text-gray-400">
                                  Score: <span className="font-bold">{scan.riskScore}/100</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-gray-400">
                            {expandedProjects[scan.id] ? '▲' : '▼'}
                          </div>
                        </button>

                        {/* Collapsible Content */}
                        {expandedProjects[scan.id] && (
                          <div className="mt-4 pt-4 border-t border-sifter-border">
                            {/* Get corresponding ProjectData for metrics */}
                            {(() => {
                              const projectData = filteredProjects.find(p => p.id === scan.id);
                              if (!projectData) return null;
                              
                              return (
                                <>
                                  {/* Quick Stats with ACTUAL metrics */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                    <div className="text-center p-3 bg-sifter-card rounded-lg">
                                      <div className="text-lg font-bold text-white">{getMetricValue(projectData.metrics, 'teamIdentity')}</div>
                                      <div className="text-xs text-gray-400">Team Identity</div>
                                    </div>
                                    <div className="text-center p-3 bg-sifter-card rounded-lg">
                                      <div className="text-lg font-bold text-white">{getMetricValue(projectData.metrics, 'contaminatedNetwork')}</div>
                                      <div className="text-xs text-gray-400">Network Risk</div>
                                    </div>
                                    <div className="text-center p-3 bg-sifter-card rounded-lg">
                                      <div className="text-lg font-bold text-white">{getMetricValue(projectData.metrics, 'githubAuthenticity')}</div>
                                      <div className="text-xs text-gray-400">Code Auth</div>
                                    </div>
                                    <div className="text-center p-3 bg-sifter-card rounded-lg">
                                      <div className="text-lg font-bold text-white">{getMetricValue(projectData.metrics, 'tokenomics')}</div>
                                      <div className="text-xs text-gray-400">Tokenomics</div>
                                    </div>
                                  </div>

                                  {/* Metric Breakdown */}
                                  <div>
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="font-bold text-white">Metric Breakdown</h4>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleAllMetrics(scan.id);
                                        }}
                                        className="text-sm text-blue-400 hover:text-blue-300"
                                      >
                                        {showAllMetrics[scan.id] ? 'Show Less' : 'Show All'}
                                      </button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      {projectData.metrics
                                        .slice(0, showAllMetrics[scan.id] ? undefined : 3)
                                        .map((metric, index) => {
                                          const metricValue = getMetricValue([metric], metric.key || metric.name || '');
                                          return (
                                            <div key={index} className="flex items-center justify-between p-3 bg-sifter-card rounded-lg">
                                              <div className="text-sm text-gray-300">
                                                {metric.name || metric.key || `Metric ${index}`}
                                              </div>
                                              <div className="flex items-center gap-3">
                                                <div className={`text-sm font-bold ${
                                                  metricValue >= 60 ? 'text-red-400' :
                                                  metricValue >= 30 ? 'text-yellow-400' : 'text-green-400'
                                                }`}>
                                                  {metricValue}/100
                                                </div>
                                                <div className="w-16 bg-gray-800 rounded-full h-2">
                                                  <div 
                                                    className={`h-2 rounded-full ${
                                                      metricValue >= 60 ? 'bg-red-500' :
                                                      metricValue >= 30 ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`}
                                                    style={{ width: `${metricValue}%` }}
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                    </div>
                                  </div>
                                </>
                              );
                            })()}

                            {/* Action Buttons - UPDATED to use scan ID */}
                            <div className="flex gap-2 mt-4">
                              <button 
                                onClick={() => handleViewFullReport(scan.id)}
                                className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors text-sm"
                              >
                                View Full Report
                              </button>
                              <button 
                                onClick={() => handleCompareProject(scan.id)}
                                className="px-3 py-2 bg-sifter-dark hover:bg-sifter-border text-gray-300 border border-sifter-border rounded-lg transition-colors text-sm"
                              >
                                Compare
                              </button>
                              <button 
                                onClick={() => handleExportProject(scan.id)}
                                className="px-3 py-2 bg-sifter-dark hover:bg-sifter-border text-gray-300 border border-sifter-border rounded-lg transition-colors text-sm"
                              >
                                Export
                              </button>
                              <button 
                                onClick={() => handleAddToWatchlistFromScan(scan.id)}
                                className="px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg transition-colors text-sm"
                              >
                                ⭐ Add to Watchlist
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Compare Tab */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Comparative Analysis</h3>
                <div className="text-sm text-gray-400">
                  {comparisonProjects.length} project{comparisonProjects.length !== 1 ? 's' : ''} selected
                </div>

                  {comparisonProjects.length > 0 && (
            <button
              onClick={() => setComparisonProjects([])}
              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-sm transition-colors"
            >
              Clear All
            </button>
          )}



              </div>
              
              {comparisonProjects.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📊</div>
                  <h4 className="text-base font-medium text-white mb-2">No projects to compare</h4>
                  <p className="text-gray-400 text-sm mb-4">Add projects from recent analyses to compare metrics</p>
                  <button
                    onClick={() => setActiveTab('analyze')}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Go to Analysis
                  </button>
                </div>
              ) : (
                <>
                  {renderComparisonChart()}
                  
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="border-b border-sifter-border">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Metric</th>
                          {comparisonProjects.map((project, idx) => (
                            <th key={idx} className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  project.overallRisk.score >= 80 ? 'bg-red-500' :
                                  project.overallRisk.score >= 60 ? 'bg-orange-500' :
                                  project.overallRisk.score >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}></div>
                                {project.displayName}
                                <div className="text-xs text-gray-500">({project.overallRisk.score})</div>
                                                                  {/* ADD THIS BUTTON: */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveFromComparison(project.id);
                                        }}
                                        className="ml-2 text-red-400 hover:text-red-300 text-xs"
                                        title="Remove from comparison"
                                      >
                                        ✕
                                      </button>
                              </div>
                            </th>
                          ))}
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Avg</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Team Identity', key: 'teamIdentity' },
                          { name: 'Contaminated Network', key: 'contaminatedNetwork' },
                          { name: 'Mercenary Keywords', key: 'mercenaryKeywords' },
                          { name: 'GitHub Auth', key: 'githubAuthenticity' },
                          { name: 'Founder Distraction', key: 'founderDistraction' },
                          { name: 'Tokenomics', key: 'tokenomics' },
                        ].map(({ name, key }) => (
                          <tr key={key} className="border-b border-sifter-border/30 hover:bg-gray-900/20">
                            <td className="py-3 px-4 text-gray-300 text-sm">{name}</td>
                            {comparisonProjects.map((project, idx) => {
                              const metricValue = getMetricValue(project.metrics, key);
                              return (
                                <td key={idx} className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-8 h-1.5 rounded-full ${
                                      metricValue >= 80 ? 'bg-red-500' :
                                      metricValue >= 60 ? 'bg-orange-500' :
                                      metricValue >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}></div>
                                    <span className="font-medium text-white text-sm">{metricValue}</span>
                                  </div>
                                </td>
                              );
                            })}
                            <td className="py-3 px-4 text-gray-400 text-sm">
                              {Math.round(
                                comparisonProjects.reduce((sum, p) => sum + getMetricValue(p.metrics, key), 0) / 
                                comparisonProjects.length
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              <div className="mt-6 pt-5 border-t border-sifter-border">
                <h4 className="font-medium text-white mb-3 text-sm">Add Projects to Comparison</h4>
                <div className="grid grid-cols-3 gap-3">
                  {recentScans.slice(0, 6).map((scan) => (
                    <button
                      key={scan.id}
                      onClick={() => handleAddToComparison(scan.projectName)}
                      disabled={comparisonProjects.some(p => p.displayName === scan.projectName)}
                      className="text-left p-3 border border-sifter-border rounded-lg hover:border-purple-500/50 hover:bg-sifter-card/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex justify-between items-start">
                        <div className="truncate">
                          <div className="font-medium text-white text-sm truncate">{scan.projectName}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {scan.scannedAt.toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          scan.riskScore >= 80 ? 'bg-red-500/20 text-red-400' :
                          scan.riskScore >= 60 ? 'bg-orange-500/20 text-orange-400' :
                          scan.riskScore >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {scan.riskScore}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && (
          <div className="space-y-4">
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Pattern Library</h3>
                <div className="text-sm text-gray-400">
                  {patterns.length} documented patterns
                </div>
              </div>
              
              <div className="space-y-4">
                {patterns.map((pattern) => (
                  <div key={pattern.id} className="border border-sifter-border rounded-lg p-4 hover:border-purple-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-white text-base">{pattern.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            pattern.confidence > 90 ? 'bg-green-500/20 text-green-400' :
                            pattern.confidence > 80 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                            {pattern.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{pattern.description}</p>
                      </div>
                      <button
                        onClick={() => runHistoricalPattern()}
                        className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded text-sm transition-colors"
                      >
                        Test Pattern
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {pattern.detectionRules?.map((rule, idx) => (
                        <div key={idx} className="bg-gray-900/50 p-3 rounded">
                          <div className="text-xs text-gray-400 mb-1">{rule.condition}</div>
                          <div className="text-sm text-white">{rule.description}</div>
                          <div className="text-xs text-gray-500 mt-1">Weight: {rule.weight}%</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-3 border-t border-sifter-border">
                      <div className="text-sm font-medium text-gray-300 mb-2">Historical Matches</div>
                      <div className="space-y-2">
                        {pattern.examples?.map((example, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="text-gray-300">{example.projectName}</div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                example.outcome === 'rug' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {example.outcome.toUpperCase()}
                              </span>
                              <span className="text-gray-400">Match: {example.similarityScore}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Database Tab */}
        {activeTab === 'database' && (
          <div className="space-y-4">
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Database Explorer</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="text-lg font-bold text-white">{databaseStats.flaggedEntities}</div>
                  <div className="text-sm text-gray-400">Flagged Entities</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="text-lg font-bold text-white">{databaseStats.projectsScanned}</div>
                  <div className="text-sm text-gray-400">Projects Scanned</div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="text-lg font-bold text-white">{databaseStats.patternsDocumented}</div>
                  <div className="text-sm text-gray-400">Patterns</div>
                </div>
              </div>

              <div className="border border-sifter-border rounded-lg overflow-hidden">
                <div className="bg-gray-900/50 p-3 border-b border-sifter-border">
                  <h4 className="font-medium text-white">Flagged Entities</h4>
                </div>
                <div className="divide-y divide-sifter-border">
                  {[
                    { name: 'CryptoGrowth Labs', type: 'agency', confidence: 'verified', projects: 5, failed: 3, successRate: 40 },
                    { name: 'BlockPromote', type: 'agency', confidence: 'high', projects: 8, failed: 2, successRate: 75 },
                    { name: 'TokenBoost', type: 'influencer', confidence: 'medium', projects: 12, failed: 4, successRate: 67 },
                    { name: 'Alpha Advisors', type: 'advisor', confidence: 'verified', projects: 7, failed: 3, successRate: 57 },
                  ].map((entity, idx) => (
                    <div key={idx} className="p-3 hover:bg-gray-900/30 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-white">{entity.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded">
                              {entity.type}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              entity.confidence === 'verified' ? 'bg-red-500/30 text-red-400' :
                              entity.confidence === 'high' ? 'bg-orange-500/30 text-orange-400' :
                              'bg-yellow-500/30 text-yellow-400'
                            }`}>
                              {entity.confidence}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Track Record</div>
                          <div className="text-base font-semibold text-red-400">
                            {entity.failed}/{entity.projects} failed
                          </div>
                          <div className="text-xs text-gray-500">
                            {entity.successRate}% success rate
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exports Tab */}
        {activeTab === 'exports' && (
          <div className="space-y-4">
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Data Export</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => {
                    if (currentProject) {
                      handleExportAnalysis('csv');
                    } else {
                      alert('Please run an analysis first to export data.');
                    }
                  }}
                  className="bg-gray-900/50 border border-sifter-border rounded-xl p-4 hover:border-purple-500/50 hover:bg-gray-900/70 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!currentProject}
                >
                  <div className="text-3xl mb-2">📊</div>
                  <h4 className="font-semibold text-white mb-1">CSV Export</h4>
                  <p className="text-sm text-gray-400">Raw data tables for spreadsheet analysis</p>
                </button>
                
                <button
                  onClick={() => {
                    if (currentProject) {
                      handleExportAnalysis('json');
                    } else {
                      alert('Please run an analysis first to export data.');
                    }
                  }}
                  className="bg-gray-900/50 border border-sifter-border rounded-xl p-4 hover:border-purple-500/50 hover:bg-gray-900/70 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!currentProject}
                >
                  <div className="text-3xl mb-2">💾</div>
                  <h4 className="font-semibold text-white mb-1">JSON Export</h4>
                  <p className="text-sm text-gray-400">Structured data for programmatic analysis</p>
                </button>
                
                <button
                  onClick={() => {
                    if (currentProject) {
                      handleExportAnalysis('pdf');
                    } else {
                      alert('Please run an analysis first to export data.');
                    }
                  }}
                  className="bg-gray-900/50 border border-sifter-border rounded-xl p-4 hover:border-purple-500/50 hover:bg-gray-900/70 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!currentProject}
                >
                  <div className="text-3xl mb-2">📄</div>
                  <h4 className="font-semibold text-white mb-1">PDF Export</h4>
                  <p className="text-sm text-gray-400">Formatted research report</p>
                </button>
              </div>

              {renderExportTable()}
            </div>
          </div>
        )}
      </div>



      
      

      {/* Research Report Modal */}
      {showResearchReport && currentProject && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ResearchReport
              projectName={currentProject.displayName}
              riskScore={currentProject.overallRisk.score}
              scannedAt={new Date()}
              onClose={() => {
                setShowResearchReport(false);
              }}
              initialTab={reportActiveTab}
                      projectMetrics={currentProject.metrics?.length >= 13 ? currentProject.metrics : projectMetrics}  // ✅ FIX: Fallback to full projectMetrics
              onExport={() => handleExportAnalysis('pdf', currentProject)}
              onShare={() => handleShareAnalysis('clipboard')}
            />
          </div>
        </div>
      )}
       



    </div>
  );
}
