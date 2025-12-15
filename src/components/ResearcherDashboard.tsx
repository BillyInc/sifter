// components/ResearcherDashboard.tsx - UPDATED WITH WORKING EXPORTS
'use client';

import React, { useState, useEffect } from 'react';
import SmartInputParser from './SmartInputParser';
import MetricBreakdown from './MetricBreakdown';
import ResearchReport from './ResearchReport';
import ResearchCharts from './ResearchCharts';
import { SmartInputResult, ProjectData, AnalysisHistory, ScamPattern } from '@/types';
import { generateMockProjectData } from '@/data/mockData';
import { ExportService } from '@/services/exportService';

interface ResearcherDashboardProps {
  onAnalyze: (input: string) => void;
  userEmail?: string;
  onModeChange?: () => void;
}

export default function ResearcherDashboard({ 
  onAnalyze, 
  userEmail,
  onModeChange
}: ResearcherDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analyze' | 'compare' | 'patterns' | 'database' | 'exports'>('analyze');
  const [currentProject, setCurrentProject] = useState<ProjectData | null>(null);
  const [comparisonProjects, setComparisonProjects] = useState<ProjectData[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<AnalysisHistory[]>([
    { id: '1', projectName: 'MoonDoge Protocol', riskScore: 89, verdict: 'reject', scannedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), processingTime: 87 },
    { id: '2', projectName: 'CryptoGrowth Labs Analysis', riskScore: 93, verdict: 'reject', scannedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), processingTime: 120 },
    { id: '3', projectName: 'DeFi Alpha Protocol', riskScore: 23, verdict: 'pass', scannedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), processingTime: 92 },
    { id: '4', projectName: 'TokenSwap Pro', riskScore: 55, verdict: 'flag', scannedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), processingTime: 78 },
  ]);
  
  const [filteredProjects, setFilteredProjects] = useState<ProjectData[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<{[key: string]: boolean}>({});
  const [showAllMetrics, setShowAllMetrics] = useState<{[key: string]: boolean}>({});
  const [showModeSwitchModal, setShowModeSwitchModal] = useState(false);
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

  // Helper function to get project name from either ProjectData or AnalysisHistory
  const getProjectName = (project: ProjectData | AnalysisHistory): string => {
    return 'displayName' in project ? project.displayName : project.projectName;
  };

  // Initialize filteredProjects
  useEffect(() => {
    const mockFilteredProjects = savedAnalyses.map(analysis => {
      const mockData = generateMockProjectData(analysis.projectName);
      return {
        ...mockData,
        id: analysis.id,
        overallRisk: {
          ...mockData.overallRisk,
          score: analysis.riskScore,
          verdict: analysis.verdict
        },
        scannedAt: analysis.scannedAt
      };
    });
    setFilteredProjects(mockFilteredProjects);
  }, [savedAnalyses]);

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
      
      setSavedAnalyses(prev => [newAnalysis, ...prev.slice(0, 9)]);
      setActiveTab('analyze');
      setIsAnalyzing(false);
      setAnalysisProgress(0);
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

  // FIXED: Handle export with proper error handling and PDF generation
  const handleExportAnalysis = async (format: 'csv' | 'json' | 'pdf', projectData?: ProjectData) => {
    try {
      const dataToExport = projectData || currentProject;
      if (!dataToExport) {
        alert('No project data to export. Please run an analysis first.');
        return;
      }

      switch (format) {
        case 'csv':
          ExportService.exportMetricsToCSV(dataToExport.metrics, dataToExport.displayName);
          break;
          
        case 'json':
          ExportService.exportProjectAnalysis(dataToExport);
          break;
          
        case 'pdf':
          // Use the exportSimplePDF method from ExportService
          ExportService.exportSimplePDF(dataToExport);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // FIXED: Proper clipboard sharing with success feedback
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
              {comparisonProjects.map((project, projIdx) => (
                <div key={projIdx} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    (project.metrics as any)[metric.key]?.score >= 80 ? 'bg-red-500' :
                    (project.metrics as any)[metric.key]?.score >= 60 ? 'bg-orange-500' :
                    (project.metrics as any)[metric.key]?.score >= 40 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <div className="text-xs text-gray-300 truncate">{project.displayName}</div>
                  <div className="text-xs font-medium text-white ml-auto">
                    {(project.metrics as any)[metric.key]?.score || 0}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // FIXED: Use getProjectName helper function
  const handleViewFullReport = (project: ProjectData | AnalysisHistory) => {
    const projectName = getProjectName(project);
    const mockData = generateMockProjectData(projectName);
    setCurrentProject(mockData);
    setShowResearchReport(true);
  };

  // FIXED: Use getProjectName helper function
  const handleCompareProject = (project: ProjectData | AnalysisHistory) => {
    const projectName = getProjectName(project);
    handleAddToComparison(projectName);
  };

  // FIXED: Use getProjectName helper function with proper export
  const handleExportProject = (project: ProjectData | AnalysisHistory) => {
    const projectName = getProjectName(project);
    const mockData = generateMockProjectData(projectName);
    setCurrentProject(mockData);
    
    // Let user choose export format
    const format = prompt('Choose export format: csv, json, or pdf', 'csv');
    if (format && ['csv', 'json', 'pdf'].includes(format.toLowerCase())) {
      handleExportAnalysis(format.toLowerCase() as 'csv' | 'json' | 'pdf', mockData);
    }
  };

  const handleModeSwitchClick = () => {
    if (onModeChange) {
      setShowModeSwitchModal(true);
    }
  };

  const confirmModeSwitch = () => {
    if (onModeChange) {
      onModeChange();
    }
    setShowModeSwitchModal(false);
  };

  const calculateHighestRiskMetric = () => {
    if (!currentProject) return 'N/A';
    const metrics = Object.entries(currentProject.metrics);
    const highest = metrics.reduce((max, [name, metric]: [string, any]) => 
      metric.score > max.score ? {name, score: metric.score} : max, 
      {name: '', score: 0}
    );
    return highest.name.replace(/([A-Z])/g, ' $1').trim();
  };

  const calculateLowestRiskMetric = () => {
    if (!currentProject) return 'N/A';
    const metrics = Object.entries(currentProject.metrics);
    const lowest = metrics.reduce((min, [name, metric]: [string, any]) => 
      metric.score < min.score ? {name, score: metric.score} : min, 
      {name: '', score: 100}
    );
    return lowest.name.replace(/([A-Z])/g, ' $1').trim();
  };

  const calculateAvgMetricScore = () => {
    if (!currentProject) return 0;
    return Math.round(Object.values(currentProject.metrics).reduce((sum: number, metric: any) => sum + metric.score, 0) / 13);
  };

  const calculateCriticalFlags = () => {
    if (!currentProject) return 0;
    return Object.values(currentProject.metrics).reduce((count: number, metric: any) => 
      count + (metric.score >= 80 ? 1 : 0), 0
    );
  };

  // FIXED: Export table with working download buttons
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
          ExportService.exportMetricsToCSV(currentProject.metrics, currentProject.displayName);
          break;
        case 'json':
          ExportService.exportProjectAnalysis(currentProject);
          break;
        case 'pdf':
          // Use the exportSimplePDF method from ExportService
          ExportService.exportSimplePDF(currentProject);
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
          <button
            onClick={handleModeSwitchClick}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Switch Mode
          </button>
          
          <div className="text-right">
            <div className="text-sm text-gray-400">Researcher</div>
            <div className="font-medium text-white">{userEmail || 'Researcher'}</div>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-sm font-medium">
            🔬 Researcher Mode
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-6 gap-3">
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
        <div className="flex space-x-6">
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
                  metrics={currentProject.metrics}
                  projectName={currentProject.displayName}
                  riskScore={currentProject.overallRisk.score}
                  onExport={() => handleExportAnalysis('pdf', currentProject)}
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
                    {/* FIXED: Export Data button with proper functionality */}
                    <button 
                      onClick={() => {
                        if (currentProject) {
                          handleExportAnalysis('csv', currentProject);
                        } else if (filteredProjects.length > 0) {
                          // Export the first project as an example
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

                {/* Charts Section */}
                <ResearchCharts projects={filteredProjects} />

                {/* Detailed Analysis */}
                <div className="mt-8">
                  <h3 className="font-bold text-white mb-4">Detailed Analysis by Project</h3>
                  
                  {filteredProjects.map((project) => (
                    <div key={project.id} className="mb-4">
                      <div className="bg-sifter-dark border border-sifter-border rounded-lg p-4">
                        {/* Project Header */}
                        <button
                          onClick={() => toggleProjectDetails(project.id)}
                          className="w-full flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`text-xl ${
                              project.overallRisk.score >= 60 ? 'text-red-400' :
                              project.overallRisk.score >= 30 ? 'text-yellow-400' : 'text-green-400'
                            }`}>
                              {project.overallRisk.score >= 60 ? '🔴' : 
                               project.overallRisk.score >= 30 ? '🟡' : '🟢'}
                            </div>
                            <div>
                              <div className="font-bold text-white">{project.displayName}</div>
                              <div className="flex items-center gap-2 text-sm">
                                <div className={`px-2 py-0.5 rounded-full text-xs ${
                                  project.overallRisk.verdict === 'reject' ? 'bg-red-500/20 text-red-400' :
                                  project.overallRisk.verdict === 'flag' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {project.overallRisk.verdict.toUpperCase()}
                                </div>
                                <div className="text-gray-400">
                                  Score: <span className="font-bold">{project.overallRisk.score}/100</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-gray-400">
                            {expandedProjects[project.id] ? '▲' : '▼'}
                          </div>
                        </button>

                        {/* Collapsible Content */}
                        {expandedProjects[project.id] && (
                          <div className="mt-4 pt-4 border-t border-sifter-border">
                            {/* Quick Stats with ACTUAL metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                              <div className="text-center p-3 bg-sifter-card rounded-lg">
                                <div className="text-lg font-bold text-white">{project.metrics?.teamIdentity?.score || 0}</div>
                                <div className="text-xs text-gray-400">Team Identity</div>
                              </div>
                              <div className="text-center p-3 bg-sifter-card rounded-lg">
                                <div className="text-lg font-bold text-white">{project.metrics?.contaminatedNetwork?.score || 0}</div>
                                <div className="text-xs text-gray-400">Network Risk</div>
                              </div>
                              <div className="text-center p-3 bg-sifter-card rounded-lg">
                                <div className="text-lg font-bold text-white">{project.metrics?.githubAuthenticity?.score || 0}</div>
                                <div className="text-xs text-gray-400">Code Auth</div>
                              </div>
                              <div className="text-center p-3 bg-sifter-card rounded-lg">
                                <div className="text-lg font-bold text-white">{project.metrics?.tokenomics?.score || 0}</div>
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
                                    toggleAllMetrics(project.id);
                                  }}
                                  className="text-sm text-blue-400 hover:text-blue-300"
                                >
                                  {showAllMetrics[project.id] ? 'Show Less' : 'Show All'}
                                </button>
                              </div>
                              
                              <div className="space-y-2">
                                {Object.entries(project.metrics || {})
                                  .slice(0, showAllMetrics[project.id] ? undefined : 3)
                                  .map(([key, metric]: [string, any], index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-sifter-card rounded-lg">
                                      <div className="text-sm text-gray-300">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className={`text-sm font-bold ${
                                          metric.score >= 60 ? 'text-red-400' :
                                          metric.score >= 30 ? 'text-yellow-400' : 'text-green-400'
                                        }`}>
                                          {metric.score}/100
                                        </div>
                                        <div className="w-16 bg-gray-800 rounded-full h-2">
                                          <div 
                                            className={`h-2 rounded-full ${
                                              metric.score >= 60 ? 'bg-red-500' :
                                              metric.score >= 30 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                            style={{ width: `${metric.score}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>

                            {/* Action Buttons - FIXED with proper handlers */}
                            <div className="flex gap-2 mt-4">
                              <button 
                                onClick={() => handleViewFullReport(project)}
                                className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors text-sm"
                              >
                                View Full Report
                              </button>
                              <button 
                                onClick={() => handleCompareProject(project)}
                                className="px-3 py-2 bg-sifter-dark hover:bg-sifter-border text-gray-300 border border-sifter-border rounded-lg transition-colors text-sm"
                              >
                                Compare
                              </button>
                              <button 
                                onClick={() => handleExportProject(project)}
                                className="px-3 py-2 bg-sifter-dark hover:bg-sifter-border text-gray-300 border border-sifter-border rounded-lg transition-colors text-sm"
                              >
                                Export
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
                              const metric = (project.metrics as any)[key];
                              return (
                                <td key={idx} className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-8 h-1.5 rounded-full ${
                                      metric?.score >= 80 ? 'bg-red-500' :
                                      metric?.score >= 60 ? 'bg-orange-500' :
                                      metric?.score >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}></div>
                                    <span className="font-medium text-white text-sm">{metric?.score || 0}</span>
                                    </div>
                                </td>
                              );
                            })}
                            <td className="py-3 px-4 text-gray-400 text-sm">
                              {Math.round(
                                comparisonProjects.reduce((sum, p) => sum + ((p.metrics as any)[key]?.score || 0), 0) / 
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
                  {savedAnalyses.slice(0, 6).map((analysis) => (
                    <button
                      key={analysis.id}
                      onClick={() => handleAddToComparison(analysis.projectName)}
                      disabled={comparisonProjects.some(p => p.displayName === analysis.projectName)}
                      className="text-left p-3 border border-sifter-border rounded-lg hover:border-purple-500/50 hover:bg-sifter-card/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex justify-between items-start">
                        <div className="truncate">
                          <div className="font-medium text-white text-sm truncate">{analysis.projectName}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {analysis.scannedAt.toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          analysis.riskScore >= 80 ? 'bg-red-500/20 text-red-400' :
                          analysis.riskScore >= 60 ? 'bg-orange-500/20 text-orange-400' :
                          analysis.riskScore >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {analysis.riskScore}
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
                      {pattern.detectionRules.map((rule, idx) => (
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
                        {pattern.examples.map((example, idx) => (
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

        {/* Exports Tab - FIXED with working buttons */}
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

      {/* Mode Switch Modal */}
      {showModeSwitchModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-sifter-card border border-sifter-border rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Switch Mode</h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to switch modes? Your current research session will be saved.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={confirmModeSwitch}
                className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
              >
                Switch Mode
              </button>
              <button
                onClick={() => setShowModeSwitchModal(false)}
                className="flex-1 px-4 py-3 bg-sifter-dark hover:bg-sifter-border text-gray-300 border border-sifter-border rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
              metrics={currentProject.metrics}
              onExport={() => handleExportAnalysis('pdf', currentProject)}
              onShare={() => handleShareAnalysis('clipboard')}
            />
          </div>
        </div>
      )}
    </div>
  );
}