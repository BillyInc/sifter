// app/page.tsx - UPDATED WITH LANDING PAGE AND CANCEL FUNCTIONALITY
'use client';

import React, { useState, useEffect } from 'react';
import SmartInputParser from '@/components/SmartInputParser';
import MetricBreakdown from '@/components/MetricBreakdown';
import LoadingState from '@/components/LoadingState';
import VerdictCard from '@/components/VerdictCard';
import IndividualDashboard from '@/components/IndividualDashboard';
import ResearcherDashboard from '@/components/ResearcherDashboard';
import EABatchDashboard from '@/components/EABatchDashboard';
import LandingPage from '../components/LandingPage'; // if app/page.tsx is in app folder
// Add this import at the top with your other imports
import { ExportService } from '@/services/exportService';
import { 
  AnalysisState, 
  VerdictData, 
  UserMode, 
  SmartInputResult, 
  MetricData,
  ScoreBreakdown,
  BatchProcessingJob,
  BatchProject,
  ProjectData,
  WatchlistItem,
  AnalysisHistory,
  TeamIdentityMetric,
  TeamCompetenceMetric,
  ContaminatedNetworkMetric,
  MercenaryKeywordsMetric,
  EntropyMetric,
  TweetFocusMetric,
  GithubMetric,
  BusFactorMetric,
  HypeMetric,
  FounderDistractionMetric,
  EngagementMetric,
  TokenomicsMetric
} from '@/types';
import { generateMock13Metrics, generateMockProjectData } from '@/data/mockData';

// Add this function inside your component (not as a separate file)
const ExportDropdown = ({ projectData }: { projectData: ProjectData }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 
                 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 
                 flex items-center gap-2"
      >
        📥 Export
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-sifter-card border border-sifter-border 
                      rounded-lg shadow-xl z-50">
          <div className="py-1">
            <button
              onClick={() => {
                ExportService.exportToPDF(projectData);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-sifter-dark/50 flex items-center gap-3"
            >
              <span>📄</span>
              <div>
                <div className="font-medium text-white">PDF Report</div>
                <div className="text-xs text-gray-500">Professional document</div>
              </div>
            </button>
            <button
              onClick={() => {
                ExportService.exportProjectAnalysis(projectData);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-sifter-dark/50 flex items-center gap-3"
            >
              <span>📊</span>
              <div>
                <div className="font-medium text-white">JSON Data</div>
                <div className="text-xs text-gray-500">Full analysis data</div>
              </div>
            </button>
            <button
              onClick={() => {
                ExportService.exportMetricsToCSV(projectData.metrics, projectData.displayName);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-sifter-dark/50 flex items-center gap-3"
            >
              <span>📈</span>
              <div>
                <div className="font-medium text-white">CSV Metrics</div>
                <div className="text-xs text-gray-500">Spreadsheet data</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [state, setState] = useState<AnalysisState>('idle');
  const [currentInput, setCurrentInput] = useState('');
  const [verdictData, setVerdictData] = useState<VerdictData | null>(null);
  const [detailedMetrics, setDetailedMetrics] = useState<MetricData[]>([]);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  
  // Mode and auth states
  const [showModeModal, setShowModeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [userMode, setUserMode] = useState<UserMode>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  // Individual Mode states
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    {
      projectId: 'moonrocket_123',
      projectName: 'MoonDoge Protocol',
      riskScore: 89,
      verdict: 'reject' as const,
      addedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      alertsEnabled: true,
      lastChecked: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      projectId: 'tokenswap_456',
      projectName: 'TokenSwap Pro',
      riskScore: 55,
      verdict: 'flag' as const,
      addedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      alertsEnabled: true,
      lastChecked: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      projectId: 'defialpha_789',
      projectName: 'DeFi Alpha',
      riskScore: 23,
      verdict: 'pass' as const,
      addedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      alertsEnabled: true,
      lastChecked: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ]);

  const [recentScans, setRecentScans] = useState<AnalysisHistory[]>([
    {
      id: 'scan_1',
      projectName: 'MoonDoge Protocol',
      riskScore: 89,
      verdict: 'reject' as const,
      scannedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      processingTime: 87000
    },
    {
      id: 'scan_2',
      projectName: 'TokenSwap Pro',
      riskScore: 55,
      verdict: 'flag' as const,
      scannedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      processingTime: 92000
    },
    {
      id: 'scan_3',
      projectName: 'DeFi Alpha',
      riskScore: 23,
      verdict: 'pass' as const,
      scannedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      processingTime: 89000
    }
  ]);

  // EA/VC Mode state for batch view
  const [showBatchView, setShowBatchView] = useState(true);

  // Batch mode states
  const [recentBatches, setRecentBatches] = useState<BatchProcessingJob[]>([]);
  const [batchStats, setBatchStats] = useState({
    totalProcessed: 0,
    averageProcessingTime: 0,
    rejectionRate: 0,
    lastBatchDate: new Date()
  });

  // Debug
  useEffect(() => {
    console.log('🔍 page.tsx state:', { userMode, isLoggedIn, state });
  }, [userMode, isLoggedIn, state]);

  // Check for existing session on mount - REMOVED AUTO SHOW MODAL
  useEffect(() => {
    const savedUser = localStorage.getItem('sifter_user');
    const savedMode = localStorage.getItem('sifter_mode');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setIsLoggedIn(true);
        setUserName(userData.name);
        setUserEmail(userData.email);
        setUserMode(userData.mode as UserMode);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('sifter_user');
      }
    } else if (savedMode) {
      setUserMode(savedMode as UserMode);
    }
    // REMOVED: Auto-show mode modal on first load
  }, []);

  // Helper function to generate recommendations
  const generateRecommendations = (riskScore: number): string[] => {
    if (riskScore >= 80) return ['DO NOT INVEST', 'High probability of scam', 'Multiple critical red flags detected'];
    if (riskScore >= 60) return ['Extreme caution advised', 'Multiple concerning signals', 'Consider waiting for more data'];
    if (riskScore >= 40) return ['Moderate risk', 'Some positive signals', 'Do additional research'];
    if (riskScore >= 20) return ['Low risk', 'Mostly positive signals', 'Standard due diligence recommended'];
    return ['Very low risk', 'Strong fundamentals', 'Appears legitimate'];
  };

  // Helper function to convert MetricData[] to the object format expected by MetricBreakdown
  const convertMetricsToObject = (metricsArray: MetricData[]) => {
    const baseMetric = (score: number): any => ({
      score,
      confidence: Math.floor(Math.random() * 30) + 70,
      status: score < 30 ? 'low' : score < 50 ? 'moderate' : score < 70 ? 'high' : 'critical',
      breakdown: { 
        subMetrics: [], 
        weightedScore: score, 
        calculationDetails: 'Mock data conversion' 
      },
      flags: [],
      evidence: []
    });

    const metricsMap: Record<string, MetricData> = {};
    metricsArray.forEach(metric => {
      metricsMap[metric.key] = metric;
    });

    return {
      teamIdentity: {
        ...baseMetric(typeof metricsMap.teamIdentity?.value === 'number' ? metricsMap.teamIdentity.value : 0),
        teamMembers: [],
        doxxedPercentage: typeof metricsMap.teamIdentity?.value === 'number' ? metricsMap.teamIdentity.value : 0,
        anonymousCount: Math.floor((100 - (typeof metricsMap.teamIdentity?.value === 'number' ? metricsMap.teamIdentity.value : 0)) / 100 * 5),
        professionalSignals: []
      } as TeamIdentityMetric,
      
      teamCompetence: {
        ...baseMetric(typeof metricsMap.teamCompetence?.value === 'number' ? metricsMap.teamCompetence.value : 0),
        githubReputation: typeof metricsMap.teamCompetence?.value === 'number' ? metricsMap.teamCompetence.value : 0,
        pastProjectSuccess: typeof metricsMap.teamCompetence?.value === 'number' ? metricsMap.teamCompetence.value : 0,
        technicalContent: typeof metricsMap.teamCompetence?.value === 'number' ? metricsMap.teamCompetence.value : 0,
        educationCredentials: typeof metricsMap.teamCompetence?.value === 'number' ? metricsMap.teamCompetence.value : 0,
        documentationQuality: typeof metricsMap.teamCompetence?.value === 'number' ? metricsMap.teamCompetence.value : 0
      } as TeamCompetenceMetric,
      
      contaminatedNetwork: {
        ...baseMetric(typeof metricsMap.contaminatedNetwork?.value === 'number' ? metricsMap.contaminatedNetwork.value : 0),
        flaggedEntities: [],
        agencyConnections: [],
        advisorConnections: [],
        influencerConnections: [],
        networkRiskScore: typeof metricsMap.contaminatedNetwork?.value === 'number' ? metricsMap.contaminatedNetwork.value : 0
      } as ContaminatedNetworkMetric,
      
      mercenaryKeywords: {
        ...baseMetric(typeof metricsMap.mercenaryKeywords?.value === 'number' ? metricsMap.mercenaryKeywords.value : 0),
        mercenaryRatio: (typeof metricsMap.mercenaryKeywords?.value === 'number' ? metricsMap.mercenaryKeywords.value : 0) / 100,
        genuineRatio: Math.random() * 0.5,
        technicalRatio: 1 - Math.random() * 0.5,
        keywordAnalysis: {
          tier1Mercenary: [],
          tier2Mercenary: [],
          tier3Mercenary: [],
          tier1Genuine: [],
          tier2Genuine: [],
          tier3Genuine: [],
          tier1Technical: [],
          tier2Technical: [],
          tier3Technical: []
        },
        sampleMessages: []
      } as MercenaryKeywordsMetric,
      
      messageTimeEntropy: {
        ...baseMetric(typeof metricsMap.messageTimeEntropy?.value === 'number' ? metricsMap.messageTimeEntropy.value : 0),
        entropyValue: Math.random() * 4,
        maxEntropy: 4.58,
        normalizedEntropy: (Math.random() * 4 / 4.58) * 100,
        concentrationScore: Math.random() * 100,
        patternAnalysis: {
          hourlyDistribution: Array(24).fill(0).map(() => Math.random() * 100),
          concentrationPeaks: [2, 3, 4],
          temporalPatterns: ['Bot-like scheduling detected']
        }
      } as EntropyMetric,
      
      accountAgeEntropy: {
        ...baseMetric(typeof metricsMap.accountAgeEntropy?.value === 'number' ? metricsMap.accountAgeEntropy.value : 0),
        entropyValue: Math.random() * 4,
        maxEntropy: 4.58,
        normalizedEntropy: (Math.random() * 4 / 4.58) * 100,
        concentrationScore: Math.random() * 100,
        patternAnalysis: {
          hourlyDistribution: Array(24).fill(0).map(() => Math.random() * 100),
          concentrationPeaks: [2, 3, 4],
          temporalPatterns: ['Bulk account creation']
        }
      } as EntropyMetric,
      
      tweetFocus: {
        ...baseMetric(typeof metricsMap.tweetFocus?.value === 'number' ? metricsMap.tweetFocus.value : 0),
        topicConcentration: Math.random(),
        keywordConsistency: Math.random(),
        topics: [
          { name: 'Token Launch', weight: 0.4, keywords: ['launch', 'token', 'distribution'] },
          { name: 'Technology', weight: 0.3, keywords: ['protocol', 'smart contract', 'blockchain'] },
          { name: 'Community', weight: 0.3, keywords: ['community', 'discord', 'telegram'] }
        ],
        weeklyOverlap: [0.7, 0.8, 0.6, 0.9]
      } as TweetFocusMetric,
      
      githubAuthenticity: {
        ...baseMetric(typeof metricsMap.githubAuthenticity?.value === 'number' ? metricsMap.githubAuthenticity.value : 0),
        originalityScore: typeof metricsMap.githubAuthenticity?.value === 'number' ? metricsMap.githubAuthenticity.value : 0,
        commitActivity: typeof metricsMap.githubAuthenticity?.value === 'number' ? metricsMap.githubAuthenticity.value : 0,
        contributorDiversity: typeof metricsMap.githubAuthenticity?.value === 'number' ? metricsMap.githubAuthenticity.value : 0,
        issueEngagement: typeof metricsMap.githubAuthenticity?.value === 'number' ? metricsMap.githubAuthenticity.value : 0,
        codeQuality: typeof metricsMap.githubAuthenticity?.value === 'number' ? metricsMap.githubAuthenticity.value : 0
      } as GithubMetric,
      
      busFactor: {
        ...baseMetric(typeof metricsMap.busFactor?.value === 'number' ? metricsMap.busFactor.value : 0),
        busFactorValue: Math.random() * 5 + 1,
        contributionConcentration: Math.random(),
        activeContributors: Math.floor(Math.random() * 20) + 1,
        dependencyAnalysis: {
          code: Math.random() * 100,
          community: Math.random() * 100,
          social: Math.random() * 100,
          weightedAverage: Math.random() * 100
        }
      } as BusFactorMetric,
      
      artificialHype: {
        ...baseMetric(typeof metricsMap.artificialHype?.value === 'number' ? metricsMap.artificialHype.value : 0),
        growthSpikes: [],
        retentionRate: Math.random(),
        campaignDetection: [],
        volatilityScore: Math.random() * 100
      } as HypeMetric,
      
      founderDistraction: {
        ...baseMetric(typeof metricsMap.founderDistraction?.value === 'number' ? metricsMap.founderDistraction.value : 0),
        twitterActivity: Math.random() * 100,
        speakingCircuit: Math.random() * 100,
        concurrentProjects: Math.random() * 100,
        contentCreation: Math.random() * 100,
        githubActivity: Math.random() * 100,
        founders: []
      } as FounderDistractionMetric,
      
      engagementAuthenticity: {
        ...baseMetric(typeof metricsMap.engagementAuthenticity?.value === 'number' ? metricsMap.engagementAuthenticity.value : 0),
        copyPastaScore: Math.random() * 100,
        threadDepth: Math.random() * 10,
        participationDistribution: Math.random(),
        questionAnswerRate: Math.random(),
        sentimentDiversity: Math.random(),
        botDetectionScore: Math.random() * 100
      } as EngagementMetric,
      
      tokenomics: {
        ...baseMetric(typeof metricsMap.tokenomics?.value === 'number' ? metricsMap.tokenomics.value : 0),
        disclosureStatus: Math.random() > 0.5 ? 'full' : Math.random() > 0.5 ? 'partial' : 'none',
        teamAllocation: Math.floor(Math.random() * 40),
        vestingPeriod: Math.floor(Math.random() * 48) + 12,
        unlockSchedule: [],
        liquidityAllocation: Math.floor(Math.random() * 10) + 2,
        insiderConcentration: Math.floor(Math.random() * 60) + 20,
        redFlags: []
      } as TokenomicsMetric
    };
  };

  // Handle smart input
  const handleSmartInputResolve = (result: SmartInputResult) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    
    setCurrentInput(result.input);
    setState('loading');
    
    setTimeout(() => {
      const mockMetrics = generateMock13Metrics();
      setDetailedMetrics(mockMetrics);
      
      const mockProjectData = generateMockProjectData(result.selectedEntity?.displayName || result.input);
      setProjectData(mockProjectData);
      
      const compositeScore = Math.round(
        mockMetrics.reduce((sum: number, m: MetricData) => sum + m.contribution, 0) 
      );
      
      const verdict: VerdictData = {
        projectName: result.selectedEntity?.displayName || result.input,
        riskScore: compositeScore,
        verdict: compositeScore >= 60 ? 'reject' : compositeScore >= 30 ? 'flag' : 'pass',
        confidence: Math.floor(Math.random() * 30) + 70,
        processingTime: Math.floor(Math.random() * 90000) + 30000,
        summary: compositeScore < 30 ? 'Low risk project' :
                 compositeScore < 60 ? 'Moderate risk, needs review' :
                 'High risk, avoid investment',
        recommendations: generateRecommendations(compositeScore),
        detailedMetrics: mockMetrics,
        inputValue: result.input,
        metrics: mockMetrics,
        compositeScore,
        riskTier: compositeScore < 25 ? 'LOW' : 
                 compositeScore < 50 ? 'MODERATE' : 
                 compositeScore < 75 ? 'ELEVATED' : 'HIGH',
        breakdown: mockMetrics.map((m: MetricData): ScoreBreakdown => ({
          name: m.name,
          weight: m.weight,
          score: typeof m.value === 'number' ? m.value : 0,
          contribution: m.contribution,
          percentOfTotal: m.weight / 100
        })).sort((a: ScoreBreakdown, b: ScoreBreakdown) => b.contribution - a.contribution),
        analyzedAt: new Date().toISOString()
      };
      
      setVerdictData(verdict);
      setState('complete');
    }, 2000);
  };

  const handleReset = () => {
    setState('idle');
    setCurrentInput('');
    setVerdictData(null);
    setDetailedMetrics([]);
    setProjectData(null);
  };

  const handleReject = () => {
    alert('Project rejected. Returning to search.');
    handleReset();
  };

  const handleProceed = () => {
    alert('Proceeding to full due diligence workflow...');
  };

  const getRandomDuration = () => {
    return Math.floor(Math.random() * (90000 - 75000 + 1)) + 75000;
  };

  // Batch upload handler
  const handleBatchUpload = (files: File[]) => {
    console.log('Batch upload:', files);
    
    // Create a new batch job
    const newJob: BatchProcessingJob = {
      id: 'batch_' + Date.now(),
      name: `Batch Upload ${new Date().toLocaleDateString()}`,
      status: 'processing',
      totalProjects: files.length,
      processedCount: 0,
      startTime: new Date(),
      estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
    };
    
    // Add to recent batches
    setRecentBatches(prev => [newJob, ...prev.slice(0, 4)]); // Keep only last 5
    
    // Update stats
    setBatchStats(prev => ({
      ...prev,
      totalProcessed: prev.totalProcessed + files.length,
      lastBatchDate: new Date()
    }));
    
    // Simulate processing completion after 3 seconds
    setTimeout(() => {
      setRecentBatches(prev => 
        prev.map(job => 
          job.id === newJob.id 
            ? { ...job, status: 'completed', processedCount: files.length } 
            : job
        )
      );
      
      // Update batch stats with mock data
      setBatchStats(prev => ({
        totalProcessed: prev.totalProcessed,
        averageProcessingTime: Math.floor(Math.random() * 60000) + 30000, // 30-90 seconds
        rejectionRate: Math.floor(Math.random() * 40) + 10, // 10-50%
        lastBatchDate: new Date()
      }));
      
      // Call the upload complete callback
      handleBatchUploadComplete(newJob);
    }, 3000);
  };

  // EA Batch Mode Handlers
  const handleBatchUploadComplete = (job: BatchProcessingJob) => {
    console.log('Batch job completed:', job.name);
    alert(`Batch processing complete! Processed ${job.totalProjects} projects.`);
  };

  const handleViewProjectDetails = (project: BatchProject) => {
    console.log('View project details:', project.name);
    // You can implement modal or navigation to project details
  };

  // Mode selection handlers
  const handleModeSelect = (mode: UserMode) => {
    setUserMode(mode);
    if (mode) {
      localStorage.setItem('sifter_mode', mode);
    }
  };

  const handleModeConfirm = () => {
    if (userMode) {
      setShowModeModal(false);
      setShowAuthModal(true);
    }
  };

  const handleModeCancel = () => {
    setShowModeModal(false);
  };

  // Auth handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const emailInput = document.getElementById('loginEmail') as HTMLInputElement;
    const passwordInput = document.getElementById('loginPassword') as HTMLInputElement;
    
    if (!emailInput || !passwordInput) return;
    
    const email = emailInput.value;
    const password = passwordInput.value;
    
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    
    const userData = {
      email,
      name: email.split('@')[0],
      mode: userMode
    };
    
    localStorage.setItem('sifter_user', JSON.stringify(userData));
    setIsLoggedIn(true);
    setUserName(userData.name);
    setUserEmail(email);
    setShowAuthModal(false);
    
    alert(`Welcome back, ${userData.name}!`);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const nameInput = document.getElementById('signupName') as HTMLInputElement;
    const emailInput = document.getElementById('signupEmail') as HTMLInputElement;
    const passwordInput = document.getElementById('signupPassword') as HTMLInputElement;
    const confirmInput = document.getElementById('signupConfirm') as HTMLInputElement;
    
    if (!nameInput || !emailInput || !passwordInput || !confirmInput) return;
    
    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirm = confirmInput.value;
    
    if (!name || !email || !password || !confirm) {
      alert('Please fill in all fields');
      return;
    }
    
    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }
    
    const userData = {
      email,
      name,
      mode: userMode
    };
    
    localStorage.setItem('sifter_user', JSON.stringify(userData));
    setIsLoggedIn(true);
    setUserName(name);
    setUserEmail(email);
    setShowAuthModal(false);
    
    alert(`Account created! Welcome to Sifter, ${name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('sifter_user');
    setIsLoggedIn(false);
    setUserName('');
    setUserEmail('');
    setUserMode(null);
    setShowModeModal(true);
    handleReset();
  };

  // Get mode display name
  const getModeDisplayName = (mode: UserMode) => {
    if (!mode) return '';
    return mode === 'ea-vc' ? 'VC/EA Mode' :
           mode === 'researcher' ? 'Researcher Mode' :
           'Individual Investor Mode';
  };

  // Get mode-specific greeting
  const getModeGreeting = () => {
    if (!userMode || !isLoggedIn) return 'Analyze Any Project';
    
    switch(userMode) {
      case 'ea-vc':
        return 'Deal Flow Screening';
      case 'researcher':
        return 'Research Lab';
      case 'individual':
        return 'Protect Your Investment';
      default:
        return 'Analyze Any Project';
    }
  };

  // Get mode-specific description
  const getModeDescription = () => {
    if (!userMode || !isLoggedIn) {
      return 'Enter a Twitter handle, Discord invite, Telegram link, GitHub repo, website URL, or just the project name. We\'ll analyze 13 key risk metrics.';
    }
    
    switch(userMode) {
      case 'ea-vc':
        return 'Batch processing for deal flow. Quick Pass/Flag/Reject with volume-optimized UI.';
      case 'researcher':
        return 'Deep analysis with data export, comparisons, and pattern library access.';
      case 'individual':
        return 'Mobile-friendly single project checks with simple yes/no/maybe results.';
      default:
        return 'Enter a Twitter handle, Discord invite, Telegram link, GitHub repo, website URL, or just the project name.';
    }
  };

  // Render Researcher Mode
  const renderResearcherMode = () => {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ResearcherDashboard
          onAnalyze={(input) => {
            setCurrentInput(input);
            setState('loading');
            
            setTimeout(() => {
              const mockMetrics = generateMock13Metrics();
              setDetailedMetrics(mockMetrics);
              
              const mockProjectData = generateMockProjectData(input);
              setProjectData(mockProjectData);
              
              const compositeScore = Math.round(
                mockMetrics.reduce((sum: number, m: MetricData) => sum + m.contribution, 0) 
              );
              
              const verdict: VerdictData = {
                projectName: input,
                riskScore: compositeScore,
                verdict: compositeScore >= 60 ? 'reject' : compositeScore >= 30 ? 'flag' : 'pass',
                confidence: Math.floor(Math.random() * 30) + 70,
                processingTime: Math.floor(Math.random() * 90000) + 30000,
                summary: compositeScore < 30 ? 'Low risk project' :
                         compositeScore < 60 ? 'Moderate risk, needs review' :
                         'High risk, avoid investment',
                recommendations: generateRecommendations(compositeScore),
                detailedMetrics: mockMetrics,
                inputValue: input,
                metrics: mockMetrics,
                compositeScore,
                riskTier: compositeScore < 25 ? 'LOW' : 
                         compositeScore < 50 ? 'MODERATE' : 
                         compositeScore < 75 ? 'ELEVATED' : 'HIGH',
                breakdown: mockMetrics.map((m: MetricData): ScoreBreakdown => ({
                  name: m.name,
                  weight: m.weight,
                  score: typeof m.value === 'number' ? m.value : 0,
                  contribution: m.contribution,
                  percentOfTotal: m.weight / 100
                })).sort((a: ScoreBreakdown, b: ScoreBreakdown) => b.contribution - a.contribution),
                analyzedAt: new Date().toISOString()
              };
              
              setVerdictData(verdict);
              setState('complete');
            }, 1500);
          }}
          userEmail={userEmail}
          onModeChange={() => setShowModeModal(true)}
          // ADD THESE EXPORT PROPS:
          onExportPDF={(data) => ExportService.exportToPDF(data)}
          onExportJSON={(data) => ExportService.exportProjectAnalysis(data)}
          onExportCSV={(data) => ExportService.exportMetricsToCSV(data.metrics, data.displayName)}
          currentProjectData={projectData}
        />
      </div>
    );
  };

  // Render Individual Investor Mode
  const renderIndividualInvestorMode = () => {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <IndividualDashboard
          onAnalyze={(input) => {
            setCurrentInput(input);
            setState('loading');
            
            setTimeout(() => {
              const mockMetrics = generateMock13Metrics();
              setDetailedMetrics(mockMetrics);
              
              const mockProjectData = generateMockProjectData(input);
              setProjectData(mockProjectData);
              
              setState('complete');
            }, 1500);
          }}
          watchlist={watchlist}
          recentScans={recentScans}
          onAddToWatchlist={(projectName, riskScore, verdict) => {
            const newItem: WatchlistItem = {
              projectId: `watch_${Date.now()}`,
              projectName,
              riskScore,
              verdict: verdict as 'pass' | 'flag' | 'reject',
              addedAt: new Date(),
              alertsEnabled: true,
              lastChecked: new Date()
            };
            setWatchlist([newItem, ...watchlist]);
          }}
          onViewReport={(id) => {
            const scan = recentScans.find(s => s.id === id);
            if (scan) {
              if (!recentScans.find(s => s.projectName === scan.projectName)) {
                setRecentScans([scan, ...recentScans]);
              }
            }
          }}
          onRemoveFromWatchlist={(projectId) => {
            setWatchlist(watchlist.filter(item => item.projectId !== projectId));
          }}
          userName={userName}
          projectMetrics={detailedMetrics}
          onModeChange={() => setShowModeModal(true)}
        />
      </div>
    );
  };

  // Render Standard View (for other modes or logged out)
  const renderStandardView = () => {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        {state === 'idle' && (
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              {isLoggedIn && userName ? `Welcome back, ${userName}!` : getModeGreeting()}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {getModeDescription()}
            </p>
          </div>
        )}

        <div className="mt-8">
          {/* Smart Input Parser - REMOVED THE SWITCH BUTTON ISSUE */}
          {state === 'idle' && (
            <div className="max-w-4xl mx-auto">
              <SmartInputParser 
                onResolve={handleSmartInputResolve}
                placeholder={getModeDescription()}
                disabled={!isLoggedIn}
                compact={false} // Ensure it's not compact
              />
            </div>
          )}

          {state === 'loading' && (
            <LoadingState
              projectName={currentInput}
              onComplete={() => {
                const mockMetrics = generateMock13Metrics();
                setDetailedMetrics(mockMetrics);
                
                const compositeScore = Math.round(
                  mockMetrics.reduce((sum: number, m: MetricData) => sum + m.contribution, 0) 
                );
                
                const verdict: VerdictData = {
                  projectName: currentInput,
                  riskScore: compositeScore,
                  verdict: compositeScore >= 60 ? 'reject' : compositeScore >= 30 ? 'flag' : 'pass',
                  confidence: Math.floor(Math.random() * 30) + 70,
                  processingTime: Math.floor(Math.random() * 90000) + 30000,
                  summary: compositeScore < 30 ? 'Low risk project' :
                           compositeScore < 60 ? 'Moderate risk, needs review' :
                           'High risk, avoid investment',
                  recommendations: generateRecommendations(compositeScore),
                  detailedMetrics: mockMetrics,
                  inputValue: currentInput,
                  metrics: mockMetrics,
                  compositeScore,
                  riskTier: compositeScore < 25 ? 'LOW' : 
                           compositeScore < 50 ? 'MODERATE' : 
                           compositeScore < 75 ? 'ELEVATED' : 'HIGH',
                  breakdown: mockMetrics.map((m: MetricData): ScoreBreakdown => ({
                    name: m.name,
                    weight: m.weight,
                    score: typeof m.value === 'number' ? m.value : 0,
                    contribution: m.contribution,
                    percentOfTotal: m.weight / 100
                  })).sort((a: ScoreBreakdown, b: ScoreBreakdown) => b.contribution - a.contribution),
                  analyzedAt: new Date().toISOString()
                };
                
                setVerdictData(verdict);
                setState('complete');
              }}
              duration={getRandomDuration()}
            />
          )}

          {state === 'complete' && verdictData && (
            <div className="space-y-8">
              {/* ADD EXPORT BUTTONS BEFORE VERDICT CARD */}
              <div className="flex justify-end gap-3 mb-4">
                {/* Export buttons */}
                {projectData && (
                  <>
                    <button
                      onClick={() => ExportService.exportToPDF(projectData)}
                      className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 
                               border border-blue-500/30 rounded-lg flex items-center gap-2"
                    >
                      📄 Export PDF
                    </button>
                    <button
                      onClick={() => ExportService.exportProjectAnalysis(projectData)}
                      className="px-4 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 
                               border border-purple-500/30 rounded-lg flex items-center gap-2"
                    >
                      📊 Export JSON
                    </button>
                    <button
                      onClick={() => ExportService.shareAnalysis(projectData)}
                      className="px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 
                               border border-green-500/30 rounded-lg flex items-center gap-2"
                    >
                      🔗 Share
                    </button>
                  </>
                )}
              </div>
              
              <VerdictCard
                data={verdictData}
                onReject={handleReject}
                onProceed={handleProceed}
                onReset={handleReset}
              />
              
              <MetricBreakdown
                metrics={convertMetricsToObject(detailedMetrics)}
                projectName={verdictData.projectName}
                riskScore={verdictData.riskScore}
                onExport={() => {
                  if (projectData) {
                    ExportService.exportMetricsToCSV(projectData.metrics, projectData.displayName);
                  } else {
                    alert('No project data available to export');
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Demo Toggle - REMOVED SWITCH BUTTON ISSUE */}
        {state === 'idle' && isLoggedIn && userMode !== 'ea-vc' && userMode !== 'individual' && userMode !== 'researcher' && (
          <div className="mt-12 text-center">
            <p className="text-gray-600 text-sm mb-3">Quick demo:</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  const mockResult: SmartInputResult = {
                    input: '@moonrocket_fi',
                    type: 'twitter',
                    resolvedEntities: [{
                      id: 'mock_1',
                      canonicalName: 'moonrocket_fi',
                      displayName: 'MoonRocket Finance',
                      platform: 'twitter',
                      url: 'https://twitter.com/moonrocket_fi',
                      confidence: 85,
                      alternativeNames: ['MoonRocket', 'moonrocket'],
                      crossReferences: [],
                      metadata: { followers: 15000, description: 'DeFi project' }
                    }],
                    selectedEntity: {
                      id: 'mock_1',
                      canonicalName: 'moonrocket_fi',
                      displayName: 'MoonRocket Finance',
                      platform: 'twitter',
                      url: 'https://twitter.com/moonrocket_fi',
                      confidence: 85,
                      alternativeNames: ['MoonRocket', 'moonrocket'],
                      crossReferences: [],
                      metadata: { followers: 15000, description: 'DeFi project' }
                    },
                    confidence: 85,
                    searchHistory: [],
                    timestamp: new Date()
                  };
                  handleSmartInputResolve(mockResult);
                }}
                className="text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors"
              >
                View REJECT example
              </button>
              <button
                onClick={() => {
                  const mockResult: SmartInputResult = {
                    input: 'aave',
                    type: 'name',
                    resolvedEntities: [{
                      id: 'mock_2',
                      canonicalName: 'aave',
                      displayName: 'Aave Protocol',
                      platform: 'website',
                      url: 'https://aave.com',
                      confidence: 90,
                      alternativeNames: ['Aave', 'Aave Finance'],
                      crossReferences: [],
                      metadata: { description: 'DeFi lending protocol' }
                    }],
                    selectedEntity: {
                      id: 'mock_2',
                      canonicalName: 'aave',
                      displayName: 'Aave Protocol',
                      platform: 'website',
                      url: 'https://aave.com',
                      confidence: 90,
                      alternativeNames: ['Aave', 'Aave Finance'],
                      crossReferences: [],
                      metadata: { description: 'DeFi lending protocol' }
                    },
                    confidence: 90,
                    searchHistory: [],
                    timestamp: new Date()
                  };
                  handleSmartInputResolve(mockResult);
                }}
                className="text-sm text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 px-4 py-2 rounded-lg transition-colors"
              >
                View PROCEED example
              </button>
            </div>
          </div>
        )}

        {/* Login prompt for non-logged in users */}
        {state === 'idle' && !isLoggedIn && (
          <div className="mt-12 text-center">
            <div className="inline-block bg-sifter-card border border-sifter-border rounded-xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Sign in to Start Analyzing</h3>
              <p className="text-gray-400 text-sm mb-6">
                Login or create an account to access Sifter 1.2 and choose your workflow mode.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Single Analysis View for EA/VC Mode
  const renderEAVCSingleAnalysis = () => {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setShowBatchView(true)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Batch Dashboard
          </button>
          <div className="text-sm text-gray-500">
            Single Project Analysis (EA/VC Mode)
          </div>
        </div>
        
        {/* Single analysis content - reuse your standard view logic */}
        <div className="mt-8">
          {state === 'idle' && (
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Single Project Analysis
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Analyze a single project with detailed metrics for EA/VC review
              </p>
            </div>
          )}

          {state === 'idle' && (
            <div className="max-w-4xl mx-auto">
              <SmartInputParser 
                onResolve={handleSmartInputResolve}
                placeholder="Enter Twitter handle, Discord, Telegram, GitHub, or project name..."
                disabled={false}
                compact={false}
              />
            </div>
          )}

          {state === 'loading' && (
            <LoadingState
              projectName={currentInput}
              onComplete={() => {
                const mockMetrics = generateMock13Metrics();
                setDetailedMetrics(mockMetrics);
                
                const compositeScore = Math.round(
                  mockMetrics.reduce((sum: number, m: MetricData) => sum + m.contribution, 0) 
                );
                
                const verdict: VerdictData = {
                  projectName: currentInput,
                  riskScore: compositeScore,
                  verdict: compositeScore >= 60 ? 'reject' : compositeScore >= 30 ? 'flag' : 'pass',
                  confidence: Math.floor(Math.random() * 30) + 70,
                  processingTime: Math.floor(Math.random() * 90000) + 30000,
                  summary: compositeScore < 30 ? 'Low risk project' :
                           compositeScore < 60 ? 'Moderate risk, needs review' :
                           'High risk, avoid investment',
                  recommendations: generateRecommendations(compositeScore),
                  detailedMetrics: mockMetrics,
                  inputValue: currentInput,
                  metrics: mockMetrics,
                  compositeScore,
                  riskTier: compositeScore < 25 ? 'LOW' : 
                           compositeScore < 50 ? 'MODERATE' : 
                           compositeScore < 75 ? 'ELEVATED' : 'HIGH',
                  breakdown: mockMetrics.map((m: MetricData): ScoreBreakdown => ({
                    name: m.name,
                    weight: m.weight,
                    score: typeof m.value === 'number' ? m.value : 0,
                    contribution: m.contribution,
                    percentOfTotal: m.weight / 100
                  })).sort((a: ScoreBreakdown, b: ScoreBreakdown) => b.contribution - a.contribution),
                  analyzedAt: new Date().toISOString()
                };
                
                setVerdictData(verdict);
                setState('complete');
              }}
              duration={getRandomDuration()}
            />
          )}

          {state === 'complete' && verdictData && (
            <div className="space-y-8">
              {/* ADD EXPORT BUTTONS FOR EA/VC SINGLE ANALYSIS */}
              <div className="flex justify-end gap-3 mb-4">
                {projectData && (
                  <>
                    <ExportDropdown projectData={projectData} />
                    <button
                      onClick={() => ExportService.shareAnalysis(projectData)}
                      className="px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 
                               border border-green-500/30 rounded-lg flex items-center gap-2"
                    >
                      🔗 Share
                    </button>
                  </>
                )}
              </div>
              
              <VerdictCard
                data={verdictData}
                onReject={handleReject}
                onProceed={handleProceed}
                onReset={() => {
                  setState('idle');
                  setCurrentInput('');
                  setVerdictData(null);
                  setDetailedMetrics([]);
                  setProjectData(null);
                }}
              />
              
              <MetricBreakdown
                metrics={convertMetricsToObject(detailedMetrics)}
                projectName={verdictData.projectName}
                riskScore={verdictData.riskScore}
                onExport={() => {
                  if (projectData) {
                    ExportService.exportMetricsToCSV(projectData.metrics, projectData.displayName);
                  } else {
                    alert('No project data available to export');
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-sifter-dark">
      {/* Mode Selection Modal */}
      {showModeModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-sifter-card border border-sifter-border rounded-2xl max-w-3xl w-full p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-sifter-blue to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">SIFTER 1.2</h1>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Choose Your Workflow</h2>
              <p className="text-gray-400">Select your primary mode to customize your experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* EA/VC Mode */}
              <div className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                userMode === 'ea-vc'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-sifter-border hover:border-blue-500/50 hover:bg-sifter-card/50'
              }`}
              onClick={() => handleModeSelect('ea-vc')}>
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="font-bold text-white mb-2 text-lg">VC/EA Mode</h3>
                <div className="text-sm text-gray-400 space-y-2">
                  <p>Batch processing, Pass/Flag/Reject</p>
                  <div className="mt-3 pt-3 border-t border-sifter-border/50">
                    <p className="text-xs text-gray-500">Features:</p>
                    <ul className="text-xs text-gray-400 mt-1 space-y-1">
                      <li>• Batch upload (100 projects)</li>
                      <li>• Quick Pass/Flag/Reject</li>
                      <li>• Export for partner handoff</li>
                      <li>• Rejection memo generator</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Researcher Mode */}
              <div className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                userMode === 'researcher'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-sifter-border hover:border-purple-500/50 hover:bg-sifter-card/50'
              }`}
              onClick={() => handleModeSelect('researcher')}>
                <div className="text-4xl mb-4">🔬</div>
                <h3 className="font-bold text-white mb-2 text-lg">Researcher Mode</h3>
                <div className="text-sm text-gray-400 space-y-2">
                  <p>Deep analysis, export data, comparisons</p>
                  <div className="mt-3 pt-3 border-t border-sifter-border/50">
                    <p className="text-xs text-gray-500">Features:</p>
                    <ul className="text-xs text-gray-400 mt-1 space-y-1">
                      <li>• Single deep dives</li>
                      <li>• Data export (CSV/JSON)</li>
                      <li>• Historical comparisons</li>
                      <li>• Pattern library access</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Individual Investor Mode */}
              <div className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                userMode === 'individual'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-sifter-border hover:border-green-500/50 hover:bg-sifter-card/50'
              }`}
              onClick={() => handleModeSelect('individual')}>
                <div className="text-4xl mb-4">👤</div>
                <h3 className="font-bold text-white mb-2 text-lg">Individual Investor Mode</h3>
                <div className="text-sm text-gray-400 space-y-2">
                  <p>Simple yes/no, mobile-friendly</p>
                  <div className="mt-3 pt-3 border-t border-sifter-border/50">
                    <p className="text-xs text-gray-500">Features:</p>
                    <ul className="text-xs text-gray-400 mt-1 space-y-1">
                      <li>• Mobile-first interface</li>
                      <li>• Simple yes/no/maybe</li>
                      <li>• Push notifications</li>
                      <li>• Saved watchlist</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleModeCancel}
                className="px-8 py-3 rounded-lg font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleModeConfirm}
                disabled={!userMode}
                className={`px-8 py-3 rounded-lg font-medium transition-all ${
                  userMode
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue to Login
              </button>
            </div>
            <p className="text-gray-500 text-sm text-center mt-4">
              (You can change this later in Settings)
            </p>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-sifter-card border border-sifter-border rounded-2xl max-w-md w-full">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-white">Welcome to Sifter 1.2</h3>
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    setShowModeModal(true);
                  }}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="flex border-b border-sifter-border mb-6">
                <button
                  onClick={() => setAuthTab('login')}
                  className={`flex-1 py-3 font-medium ${
                    authTab === 'login'
                      ? 'text-blue-500 border-b-2 border-blue-500'
                      : 'text-gray-400'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setAuthTab('signup')}
                  className={`flex-1 py-3 font-medium ${
                    authTab === 'signup'
                      ? 'text-blue-500 border-b-2 border-blue-500'
                      : 'text-gray-400'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {authTab === 'login' ? (
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email</label>
                      <input
                        id="loginEmail"
                        type="email"
                        className="w-full bg-sifter-dark border border-sifter-border rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Password</label>
                      <input
                        id="loginPassword"
                        type="password"
                        className="w-full bg-sifter-dark border border-sifter-border rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAuthModal(false);
                          setShowModeModal(true);
                        }}
                        className="flex-1 bg-gray-800 text-gray-300 hover:bg-gray-700 py-3 rounded-lg font-medium transition-all"
                      >
                        Back to Modes
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all"
                      >
                        Login
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignup}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                      <input
                        id="signupName"
                        type="text"
                        className="w-full bg-sifter-dark border border-sifter-border rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email</label>
                      <input
                        id="signupEmail"
                        type="email"
                        className="w-full bg-sifter-dark border border-sifter-border rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Password</label>
                      <input
                        id="signupPassword"
                        type="password"
                        className="w-full bg-sifter-dark border border-sifter-border rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Create a strong password"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                      <input
                        id="signupConfirm"
                        type="password"
                        className="w-full bg-sifter-dark border border-sifter-border rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAuthModal(false);
                          setShowModeModal(true);
                        }}
                        className="flex-1 bg-gray-800 text-gray-300 hover:bg-gray-700 py-3 rounded-lg font-medium transition-all"
                      >
                        Back to Modes
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all"
                      >
                        Create Account
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header - Only show when logged in */}
      {isLoggedIn && (
        <header className="border-b border-sifter-border bg-sifter-dark/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sifter-blue to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">SIFTER 1.2</h1>
                  {userMode && (
                    <p className="text-xs text-gray-500">{getModeDisplayName(userMode)}</p>
                  )}
                </div>
              </div>
              
              {/* User Info and Mode Badge */}
              <div className="flex items-center gap-6">
                {/* ADD THIS: Export button when analysis is complete */}
                {state === 'complete' && projectData && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => ExportService.exportToPDF(projectData)}
                      className="px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 
                               border border-blue-500/30 rounded-lg text-sm font-medium 
                               flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export PDF
                    </button>
                    
                    {/* Share button */}
                    <button
                      onClick={() => ExportService.shareAnalysis(projectData)}
                      className="px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 
                               border border-green-500/30 rounded-lg text-sm font-medium 
                               flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                  </div>
                )}
                
                {isLoggedIn && userMode && (
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      userMode === 'ea-vc' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      userMode === 'researcher' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                      'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {getModeDisplayName(userMode)}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white">{userName}</p>
                      <p className="text-xs text-gray-500">{userEmail}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-gray-400 hover:text-white text-sm hover:bg-gray-800/50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
                
                <nav className="flex items-center gap-4">
                  <span className="text-gray-500 text-sm">Project Due Diligence</span>
                </nav>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto">
        {!isLoggedIn ? (
          // Show Landing Page when not logged in
          renderLandingPage()
        ) : userMode === 'ea-vc' && isLoggedIn ? (
          showBatchView ? (
            <div className="px-4 py-8">
              <EABatchDashboard
                onBatchUpload={handleBatchUpload}
                onSingleAnalysis={() => setShowBatchView(false)}
                onBack={() => setShowModeModal(true)}
                userEmail={userEmail}
                onAnalyze={(input) => {
                  setCurrentInput(input);
                  setShowBatchView(false);
                  setState('loading');
                  
                  setTimeout(() => {
                    const mockMetrics = generateMock13Metrics();
                    setDetailedMetrics(mockMetrics);
                    
                    const compositeScore = Math.round(
                      mockMetrics.reduce((sum: number, m: MetricData) => sum + m.contribution, 0) 
                    );
                    
                    const verdict: VerdictData = {
                      projectName: input,
                      riskScore: compositeScore,
                      verdict: compositeScore >= 60 ? 'reject' : compositeScore >= 30 ? 'flag' : 'pass',
                      confidence: Math.floor(Math.random() * 30) + 70,
                      processingTime: Math.floor(Math.random() * 90000) + 30000,
                      summary: compositeScore < 30 ? 'Low risk project' :
                               compositeScore < 60 ? 'Moderate risk, needs review' :
                               'High risk, avoid investment',
                      recommendations: generateRecommendations(compositeScore),
                      detailedMetrics: mockMetrics,
                      inputValue: input,
                      metrics: mockMetrics,
                      compositeScore,
                      riskTier: compositeScore < 25 ? 'LOW' : 
                               compositeScore < 50 ? 'MODERATE' : 
                               compositeScore < 75 ? 'ELEVATED' : 'HIGH',
                      breakdown: mockMetrics.map((m: MetricData): ScoreBreakdown => ({
                        name: m.name,
                        weight: m.weight,
                        score: typeof m.value === 'number' ? m.value : 0,
                        contribution: m.contribution,
                        percentOfTotal: m.weight / 100
                      })).sort((a: ScoreBreakdown, b: ScoreBreakdown) => b.contribution - a.contribution),
                      analyzedAt: new Date().toISOString()
                    };
                    
                    setVerdictData(verdict);
                    setState('complete');
                  }, 2000);
                }}
                onBatchUploadComplete={handleBatchUploadComplete}
                onViewProjectDetails={handleViewProjectDetails}
                onModeChange={() => setShowModeModal(true)}
                recentBatches={recentBatches}
                batchStats={batchStats}
                // ADD THESE:
                onExportBatch={(projects) => {
                  if (projects.length > 0) {
                    ExportService.exportAllAnalyses(projects);
                  }
                }}
                onExportPartnerPacket={(batchSummary, projects) => {
                  const packet = ExportService.generatePartnerPacket(batchSummary, projects);
                  ExportService.exportPartnerPacket(packet);
                }}
                onExportBatchCSV={(projects) => {
                  ExportService.exportBatchToCSV(
                    projects.map(p => ({
                      name: p.displayName,
                      riskScore: p.overallRisk.score,
                      verdict: p.overallRisk.verdict,
                      redFlags: [] // You'll need to extract these from metrics
                    }))
                  );
                }}
              />
            </div>
          ) : (
            renderEAVCSingleAnalysis()
          )
        ) : userMode === 'researcher' && isLoggedIn ? (
          renderResearcherMode()
        ) : userMode === 'individual' && isLoggedIn ? (
          renderIndividualInvestorMode()
        ) : (
          renderStandardView()
        )}
      </div>

      {/* Footer - Only show when logged in */}
      {isLoggedIn && (
        <footer className="fixed bottom-0 left-0 right-0 border-t border-sifter-border bg-sifter-dark/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="text-gray-600 text-xs">
                <span className="font-medium text-gray-400">SIFTER 1.2</span> - Automated Project Due Diligence
              </div>
              {userMode && (
                <div className="text-gray-500 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Active: {getModeDisplayName(userMode)}
                </div>
              )}
            </div>
          </div>
        </footer>
      )}
    </main>
  );
}