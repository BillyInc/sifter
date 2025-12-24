// app/page.tsx - COMPREHENSIVE FIXES WITH DATA DONATION INTEGRATION
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import SmartInputParser from '@/components/SmartInputParser';
import MetricBreakdown from '@/components/MetricBreakdown';
import LoadingState from '@/components/LoadingState';
import VerdictCard from '@/components/VerdictCard';
import IndividualDashboard from '@/components/IndividualDashboard';
import ResearcherDashboard from '@/components/ResearcherDashboard';
import EABatchDashboard from '@/components/EABatchDashboard';
import LandingPage from '../components/LandingPage';
import { ExportService } from '@/services/exportService';

// NEW: Import Data Donation Components
import { SubmissionForm, TrackingDashboard, EvidenceUpload } from '@/components/data-donation/universal';
import PointsDisplay from '@/components/data-donation/universal/PointsDisplay'; // Added
import DisputeForm from '@/components/data-donation/universal/DisputeForm'; // Added
import StandardFlagForm from '@/components/data-donation/universal/StandardFlagForm';

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
  VerdictType,
  BatchSummary,
  EvidenceItem,
  SubmissionFormData
} from '@/types';
import { generateMockProjectData } from '@/data/mockData'; // Fixed import

// Fix ExportDropdown component with proper error handling
const ExportDropdown = ({ projectData }: { projectData: ProjectData | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  if (!projectData) return null;
  
  const handleExport = async (exportType: 'pdf' | 'json' | 'csv') => {
    try {
      setIsExporting(true);
      
      switch (exportType) {
        case 'pdf':
          await ExportService.exportToPDF(projectData);
          break;
        case 'json':
          await ExportService.exportProjectAnalysis(projectData);
          break;
        case 'csv':
          if (projectData.metrics && projectData.displayName) {
            await ExportService.exportMetricsToCSV(projectData.metrics, projectData.displayName);
          } else {
            throw new Error('Missing metrics or project name');
          }
          break;
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 
                 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 
                 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
          </>
        ) : (
          <>
            📥 Export
            <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-sifter-card border border-sifter-border 
                      rounded-lg shadow-xl z-50">
          <div className="py-1">
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="w-full text-left px-4 py-3 hover:bg-sifter-dark/50 flex items-center gap-3 disabled:opacity-50"
            >
              <span>📄</span>
              <div>
                <div className="font-medium text-white">PDF Report</div>
                <div className="text-xs text-gray-500">Professional document</div>
              </div>
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={isExporting}
              className="w-full text-left px-4 py-3 hover:bg-sifter-dark/50 flex items-center gap-3 disabled:opacity-50"
            >
              <span>📊</span>
              <div>
                <div className="font-medium text-white">JSON Data</div>
                <div className="text-xs text-gray-500">Full analysis data</div>
              </div>
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting || !projectData.metrics}
              className="w-full text-left px-4 py-3 hover:bg-sifter-dark/50 flex items-center gap-3 disabled:opacity-50"
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
  const [error, setError] = useState<string | null>(null);
  
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
      verdict: 'reject',
      addedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      alertsEnabled: true,
      lastChecked: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      projectId: 'tokenswap_456',
      projectName: 'TokenSwap Pro',
      riskScore: 55,
      verdict: 'flag',
      addedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      alertsEnabled: true,
      lastChecked: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      projectId: 'defialpha_789',
      projectName: 'DeFi Alpha',
      riskScore: 23,
      verdict: 'pass',
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
      verdict: 'reject',
      scannedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      processingTime: 87000
    },
    {
      id: 'scan_2',
      projectName: 'TokenSwap Pro',
      riskScore: 55,
      verdict: 'flag',
      scannedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      processingTime: 92000
    },
    {
      id: 'scan_3',
      projectName: 'DeFi Alpha',
      riskScore: 23,
      verdict: 'pass',
      scannedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      processingTime: 89000
    }
  ]);

  // EA/VC Mode state for batch view
  const [showBatchView, setShowBatchView] = useState(true);

  // Batch mode states - FIXED with proper initialization
  const [recentBatches, setRecentBatches] = useState<BatchProcessingJob[]>([]);
  const [batchStats, setBatchStats] = useState({
    totalProcessed: 0,
    averageProcessingTime: 0,
    rejectionRate: 0,
    lastBatchDate: new Date()
  });

  // ==================== DATA DONATION STATES ====================
  const [showDataDonation, setShowDataDonation] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false);
  const [showTrackingDashboard, setShowTrackingDashboard] = useState(false);
  const [showPointsDisplay, setShowPointsDisplay] = useState(false); // Added
  const [showDisputeForm, setShowDisputeForm] = useState(false); // Added
  const [showStandardForm, setShowStandardForm] = useState(false);
  
  const [dataDonationSubmissions, setDataDonationSubmissions] = useState<SubmissionFormData[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [selectedEntityForFlagging, setSelectedEntityForFlagging] = useState<string[]>([]); // Added
  const [selectedEntityForDispute, setSelectedEntityForDispute] = useState<string[]>([]); // Added
  const [dataDonationPrefill, setDataDonationPrefill] = useState<any>(null);
  
  // Points states
  const [userPoints, setUserPoints] = useState(0);
  const [lifetimePoints, setLifetimePoints] = useState(0);
  const [poolPoints, setPoolPoints] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [nextMilestone, setNextMilestone] = useState(1000);
  const [userTier, setUserTier] = useState<'tier-1' | 'tier-2' | 'tier-3'>('tier-3');

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('sifter_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setIsLoggedIn(true);
        setUserName(userData.name);
        setUserEmail(userData.email);
        setUserMode(userData.mode);
        
        // Load data donation submissions
        const savedSubmissions = localStorage.getItem(`sifter_submissions_${userData.email}`);
        if (savedSubmissions) {
          setDataDonationSubmissions(JSON.parse(savedSubmissions));
        }
        
        // Load user points
        const savedPoints = localStorage.getItem(`sifter_points_${userData.email}`);
        if (savedPoints) {
          const pointsData = JSON.parse(savedPoints);
          setUserPoints(pointsData.availablePoints || 0);
          setLifetimePoints(pointsData.lifetimeEarned || 0);
          setPoolPoints(pointsData.pointsInPool || 0);
          setMultiplier(pointsData.multiplier || 1.0);
          setNextMilestone(pointsData.nextMilestone || 1000);
          setUserTier(pointsData.tier || 'tier-3');
        }
      } catch (err) {
        console.error('Failed to parse saved user:', err);
        localStorage.removeItem('sifter_user');
      }
    }
  }, []);

  // Save submissions when they change
  useEffect(() => {
    if (isLoggedIn && userEmail) {
      localStorage.setItem(`sifter_submissions_${userEmail}`, JSON.stringify(dataDonationSubmissions));
    }
  }, [dataDonationSubmissions, isLoggedIn, userEmail]);

  // Save points when they change
  useEffect(() => {
    if (isLoggedIn && userEmail) {
      localStorage.setItem(`sifter_points_${userEmail}`, JSON.stringify({
        availablePoints: userPoints,
        lifetimeEarned: lifetimePoints,
        pointsInPool: poolPoints,
        multiplier: multiplier,
        nextMilestone: nextMilestone,
        tier: userTier
      }));
    }
  }, [userPoints, lifetimePoints, poolPoints, multiplier, nextMilestone, userTier, isLoggedIn, userEmail]);

  // Helper function to generate recommendations - memoized
  const generateRecommendations = useCallback((riskScore: number): string[] => {
    if (riskScore >= 80) return ['DO NOT INVEST', 'High probability of scam', 'Multiple critical red flags detected'];
    if (riskScore >= 60) return ['Extreme caution advised', 'Multiple concerning signals', 'Consider waiting for more data'];
    if (riskScore >= 40) return ['Moderate risk', 'Some positive signals', 'Do additional research'];
    if (riskScore >= 20) return ['Low risk', 'Mostly positive signals', 'Standard due diligence recommended'];
    return ['Very low risk', 'Strong fundamentals', 'Appears legitimate'];
  }, []);

  // Input validation
  const validateInput = useCallback((input: string): boolean => {
    if (!input || !input.trim()) {
      setError('Please enter a valid project name or URL');
      return false;
    }
    if (input.length > 500) {
      setError('Input is too long. Maximum 500 characters.');
      return false;
    }
    return true;
  }, []);

  // FIXED: Convert metrics to array with score property
  const convertMetricsToObject = (): MetricData[] => {
    return [
      {
        id: 'team-identity',
        key: 'teamIdentity',
        name: 'Team Identity',
        value: 85,
        score: 85,
        weight: 15,
        contribution: 12.75,
        status: 'high' as const,
        confidence: 85,
        flags: ['Team anonymous', 'No professional profiles'],
        evidence: ['Twitter analysis', 'LinkedIn search']
      },
      {
        id: 'team-competence',
        key: 'teamCompetence',
        name: 'Team Competence',
        value: 60,
        score: 60,
        weight: 12,
        contribution: 7.2,
        status: 'moderate' as const,
        confidence: 75,
        flags: ['Limited GitHub history'],
        evidence: ['Repo analysis', 'Past projects']
      },
      {
        id: 'contaminated-network',
        key: 'contaminatedNetwork',
        name: 'Contaminated Network',
        value: 45,
        score: 45,
        weight: 10,
        contribution: 4.5,
        status: 'moderate' as const,
        confidence: 65,
        flags: ['Previous failed projects'],
        evidence: ['Network analysis', 'Past associations']
      },
      {
        id: 'mercenary-keywords',
        key: 'mercenaryKeywords',
        name: 'Mercenary Keywords',
        value: 70,
        score: 70,
        weight: 8,
        contribution: 5.6,
        status: 'high' as const,
        confidence: 80,
        flags: ['Aggressive marketing language'],
        evidence: ['Content analysis', 'Social media posts']
      },
      {
        id: 'message-time-entropy',
        key: 'messageTimeEntropy',
        name: 'Message Time Entropy',
        value: 30,
        score: 30,
        weight: 7,
        contribution: 2.1,
        status: 'low' as const,
        confidence: 90,
        flags: [],
        evidence: ['Activity pattern analysis']
      },
      {
        id: 'account-age-entropy',
        key: 'accountAgeEntropy',
        name: 'Account Age Entropy',
        value: 25,
        score: 25,
        weight: 6,
        contribution: 1.5,
        status: 'low' as const,
        confidence: 85,
        flags: [],
        evidence: ['Account creation analysis']
      },
      {
        id: 'tweet-focus',
        key: 'tweetFocus',
        name: 'Tweet Focus',
        value: 50,
        score: 50,
        weight: 5,
        contribution: 2.5,
        status: 'moderate' as const,
        confidence: 70,
        flags: ['Inconsistent messaging'],
        evidence: ['Tweet content analysis']
      },
      {
        id: 'github-authenticity',
        key: 'githubAuthenticity',
        name: 'GitHub Authenticity',
        value: 40,
        score: 40,
        weight: 8,
        contribution: 3.2,
        status: 'moderate' as const,
        confidence: 75,
        flags: ['Few contributions', 'Fork-heavy'],
        evidence: ['Repo analysis', 'Commit history']
      },
      {
        id: 'bus-factor',
        key: 'busFactor',
        name: 'Bus Factor',
        value: 75,
        score: 75,
        weight: 9,
        contribution: 6.75,
        status: 'high' as const,
        confidence: 80,
        flags: ['Single point of failure'],
        evidence: ['Team structure analysis']
      },
      {
        id: 'artificial-hype',
        key: 'artificialHype',
        name: 'Artificial Hype',
        value: 65,
        score: 65,
        weight: 6,
        contribution: 3.9,
        status: 'high' as const,
        confidence: 70,
        flags: ['Suspicious engagement patterns'],
        evidence: ['Social media analysis', 'Engagement metrics']
      },
      {
        id: 'founder-distraction',
        key: 'founderDistraction',
        name: 'Founder Distraction',
        value: 55,
        score: 55,
        weight: 5,
        contribution: 2.75,
        status: 'moderate' as const,
        confidence: 65,
        flags: ['Multiple ongoing projects'],
        evidence: ['Project portfolio analysis']
      },
      {
        id: 'engagement-authenticity',
        key: 'engagementAuthenticity',
        name: 'Engagement Authenticity',
        value: 35,
        score: 35,
        weight: 4,
        contribution: 1.4,
        status: 'moderate' as const,
        confidence: 60,
        flags: ['Low quality interactions'],
        evidence: ['Engagement pattern analysis']
      },
      {
        id: 'tokenomics',
        key: 'tokenomics',
        name: 'Tokenomics',
        value: 80,
        score: 80,
        weight: 5,
        contribution: 4.0,
        status: 'high' as const,
        confidence: 85,
        flags: ['High founder allocation', 'Short vesting'],
        evidence: ['Token distribution analysis']
      }
    ];
  };

  // ==================== DATA DONATION HANDLERS ====================
  const handleSubmitDataDonation = useCallback(async (formData: SubmissionFormData) => {
    try {
      // Add points based on submission quality
      const basePoints = 50;
      const evidenceBonus = formData.evidence.filter((e: any) => e.url).length * 10;
      const projectBonus = formData.affectedProjects.length * 5;
      const tierMultiplier = userTier === 'tier-1' ? 2.0 : userTier === 'tier-2' ? 1.5 : 1.0;
      
      const pointsEarned = Math.floor((basePoints + evidenceBonus + projectBonus) * tierMultiplier);
      const newPoints = userPoints + pointsEarned;
      const newLifetimePoints = lifetimePoints + pointsEarned;
      
      setUserPoints(newPoints);
      setLifetimePoints(newLifetimePoints);
      
      // Update user tier if needed
      if (newLifetimePoints >= 1000 && userTier === 'tier-3') {
        setUserTier('tier-2');
        setMultiplier(1.5);
      } else if (newLifetimePoints >= 5000 && userTier === 'tier-2') {
        setUserTier('tier-1');
        setMultiplier(2.0);
      }
      
      // Add to submissions
      const submissionWithId: SubmissionFormData = {
        ...formData,
        id: `submission_${Date.now()}`,
        caseId: `SR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        pointsAwarded: pointsEarned,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      };
      
      setDataDonationSubmissions(prev => [submissionWithId, ...prev]);
      
      // Show success message
      alert(`Submission successful! You earned ${pointsEarned} points.`);
      
      // Close form
      setShowSubmissionForm(false);
      
    } catch (error) {
      console.error('Data donation submission failed:', error);
      setError('Submission failed. Please try again.');
    }
  }, [userPoints, lifetimePoints, userTier, userEmail]);

  const handleViewSubmissionDetails = useCallback((submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    // You could open a detailed view modal here
    console.log('Viewing submission:', submissionId);
  }, []);

  const handleAddEvidenceToSubmission = useCallback((submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setShowEvidenceUpload(true);
  }, []);

  const handleUploadEvidence = useCallback(async (evidenceItems: Omit<EvidenceItem, 'id' | 'submittedAt'>[]) => {
    try {
      if (!selectedSubmissionId || !userEmail) return;
      
      // Update the submission with new evidence
      setDataDonationSubmissions(prev =>
        prev.map(submission => {
          if (submission.id === selectedSubmissionId) {
            const newEvidence = evidenceItems.map(item => {
              let type: 'twitter' | 'reddit' | 'news' | 'archive' | 'blockchain' | 'telegram' | 'other' = 'other';
              
              if (item.evidenceType === 'twitter_post') type = 'twitter';
              else if (item.evidenceType === 'reddit_thread') type = 'reddit';
              else if (item.evidenceType === 'blockchain_transaction') type = 'blockchain';
              else if (item.evidenceType === 'news_article') type = 'news';
              else if (item.evidenceType === 'archived_website') type = 'archive';

              return {
                id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                url: item.originalUrl,
                description: item.evidenceDescription,
                type,
                status: 'pending' as const,
                submittedAt: new Date()
              };
            });

            return {
              ...submission,
              evidence: [...(submission.evidence || []), ...newEvidence],
              status: 'under-review',
              updatedAt: new Date().toISOString()
            };
          }
          return submission;
        })
      );
      
      alert('Evidence uploaded successfully! Submission is now under review.');
      setShowEvidenceUpload(false);
      setSelectedSubmissionId(null);
    } catch (error) {
      console.error('Evidence upload failed:', error);
      setError('Failed to upload evidence. Please try again.');
    }
  }, [selectedSubmissionId, userEmail]);

  const handleExportSubmissions = useCallback(() => {
    if (dataDonationSubmissions.length === 0) {
      alert('No submissions to export');
      return;
    }
    
    const csvData = dataDonationSubmissions.map(sub => ({
      'Case ID': sub.caseId || 'N/A',
      'Entity Name': sub.entityDetails?.fullName || 'Unknown',
      'Submitted': new Date(sub.submittedAt).toLocaleDateString(),
      'Status': sub.status || 'unknown',
      'Confidence': sub.confidenceScore || 'N/A',
      'Projects Affected': sub.affectedProjects?.length || 0,
      'Points Earned': sub.pointsAwarded || 0
    }));
    
    const headers = Object.keys(csvData[0]);
    const csvRows = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => 
          `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`
        ).join(',')
      )
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sifter-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [dataDonationSubmissions]);

  const handleOpenDataDonationWithContext = useCallback((context: {
    entityName: string;
    projectName: string;
    riskScore?: number;
    context: string;
  }) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    
    setDataDonationPrefill({
      entityName: context.entityName,
      projectName: context.projectName,
      context: context.context
    });
    
    setShowSubmissionForm(true);
  }, [isLoggedIn]);

  // ==================== NEW HANDLERS FOR ADDED COMPONENTS ====================

  // Points Display Handlers
  const handleEnterRewardPool = useCallback((points: number) => {
    if (points < 100) {
      alert('Minimum 100 points required to enter reward pool');
      return;
    }
    
    const poolEntry = Math.min(points, 1000);
    setUserPoints(prev => prev - poolEntry);
    setPoolPoints(prev => prev + poolEntry);
    alert(`Entered ${poolEntry} points into the reward pool!`);
  }, []);

  const handleRedeemPoints = useCallback((points: number) => {
    if (points < 500) {
      alert('Minimum 500 points required to redeem');
      return;
    }
    
    const redeemAmount = Math.min(points, 5000);
    setUserPoints(prev => prev - redeemAmount);
    alert(`Redeemed ${redeemAmount} points! Check your email for reward details.`);
  }, []);

  // Dispute Form Handler
  const handleSubmitDispute = useCallback(async (disputeData: any[]) => {
    try {
      console.log('Dispute submitted:', disputeData);
      alert('Dispute submitted successfully! Our team will review it within 24-48 hours.');
      setShowDisputeForm(false);
    } catch (error) {
      console.error('Dispute submission failed:', error);
      setError('Failed to submit dispute. Please try again.');
    }
  }, []);

  // Flag Entity Handler
  const handleSubmitFlag = useCallback(async (flagData: any[]) => {
    try {
      const pointsEarned = flagData[flagData.length - 3] || 0; // Points from FlagEntity component
      const newPoints = userPoints + pointsEarned;
      const newLifetimePoints = lifetimePoints + pointsEarned;
      
      setUserPoints(newPoints);
      setLifetimePoints(newLifetimePoints);
      
      alert(`Entity flagged successfully! You earned ${pointsEarned} points.`);
      setShowStandardForm(false);
    } catch (error) {
      console.error('Flag submission failed:', error);
      setError('Failed to flag entity. Please try again.');
    }
  }, [userPoints, lifetimePoints]);

  // Quick flag handler for batch context
  const handleQuickStandardForm = useCallback((entityData: {
    entityName: string;
    entityType: string;
    projectName: string;
    riskScore: number;
    context: string;
  }) => {
    setSelectedEntityForFlagging([
      entityData.entityName,
      entityData.entityType,
      entityData.projectName,
      entityData.riskScore.toString(),
      entityData.context
    ]);
   {setShowStandardForm(true)}  // ✅
  }, []);

  // Dispute handler
  const handleOpenDisputeForm = useCallback((entityData: {
    entityName: string;
    submissionId: string;
    caseId: string;
    entityType: string;
    submitterEmail: string;
  }) => {
    setSelectedEntityForDispute([
      entityData.entityName,
      entityData.submissionId,
      entityData.caseId,
      entityData.entityType,
      entityData.submitterEmail
    ]);
    setShowDisputeForm(true);
  }, []);

  // Handle smart input - FIXED with error handling
  const handleSmartInputResolve = useCallback(async (result: SmartInputResult) => {
    try {
      if (!isLoggedIn) {
        setShowAuthModal(true);
        return;
      }
      
      if (!validateInput(result.input)) {
        return;
      }
      
      setError(null);
      setCurrentInput(result.input);
      setState('loading');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockMetrics = convertMetricsToObject();
      setDetailedMetrics(mockMetrics);
      
      const mockProjectData = generateMockProjectData(result.selectedEntity?.displayName || result.input);
      setProjectData(mockProjectData);
      
      const compositeScore = Math.round(
        mockMetrics.reduce((sum, m) => sum + m.contribution, 0) 
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
        breakdown: mockMetrics.map((m): ScoreBreakdown => ({
          name: m.name,
          weight: m.weight,
          score: m.score,
          contribution: m.contribution,
          percentOfTotal: m.weight / 100
        })).sort((a, b) => b.contribution - a.contribution),
        analyzedAt: new Date().toISOString()
      };
      
      setVerdictData(verdict);
      setState('complete');
      
      // Add to recent scans
      if (isLoggedIn && userMode !== 'ea-vc') {
        const newScan: AnalysisHistory = {
          id: `scan_${Date.now()}`,
          projectName: verdict.projectName,
          riskScore: verdict.riskScore,
          verdict: verdict.verdict,
          scannedAt: new Date(),
          processingTime: verdict.processingTime
        };
        setRecentScans(prev => [newScan, ...prev.slice(0, 9)]);
      }
      
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Analysis failed. Please try again.');
      setState('error');
    }
  }, [isLoggedIn, userMode, validateInput, generateRecommendations]);

  const handleReset = useCallback(() => {
    setState('idle');
    setCurrentInput('');
    setVerdictData(null);
    setDetailedMetrics([]);
    setProjectData(null);
    setError(null);
  }, []);

  const handleReject = useCallback(() => {
    alert('Project rejected. Returning to search.');
    handleReset();
  }, [handleReset]);

  const handleProceed = useCallback(() => {
    alert('Proceeding to full due diligence workflow...');
  }, []);

  const getRandomDuration = useCallback(() => {
    return Math.floor(Math.random() * (90000 - 75000 + 1)) + 75000;
  }, []);

  // Batch upload handler - FIXED with proper types
  const handleBatchUpload = useCallback(async (files: File[]) => {
    try {
      console.log('Batch upload:', files);
      
      // Create a new batch job with proper summary
      const newJob: BatchProcessingJob = {
        id: 'batch_' + Date.now(),
        name: `Batch Upload ${new Date().toLocaleDateString()}`,
        status: 'processing',
        projects: [],
        summary: {
          total: files.length,
          passed: 0,
          flagged: 0,
          rejected: 0,
          averageRiskScore: 0,
          processingTime: 0,
          redFlagDistribution: {}
        },
        createdAt: new Date(),
      };
      
      setRecentBatches(prev => [newJob, ...prev.slice(0, 4)]);
      
      setBatchStats(prev => ({
        ...prev,
        totalProcessed: prev.totalProcessed + files.length,
        lastBatchDate: new Date()
      }));
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockProjects: BatchProject[] = files.map((file, index) => ({
        id: `proj_${Date.now()}_${index}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        input: file.name,
        status: 'complete',
        riskScore: Math.floor(Math.random() * 100),
        verdict: Math.random() > 0.6 ? 'reject' : Math.random() > 0.3 ? 'flag' : 'pass',
        redFlags: ['Team anonymity', 'Suspicious tokenomics'],
        processingTime: Math.floor(Math.random() * 90000) + 30000,
        scannedAt: new Date(),
        metrics: convertMetricsToObject()
      }));
      
      // Calculate summary
      const passed = mockProjects.filter(p => p.verdict === 'pass').length;
      const flagged = mockProjects.filter(p => p.verdict === 'flag').length;
      const rejected = mockProjects.filter(p => p.verdict === 'reject').length;
      const averageRiskScore = Math.round(
        mockProjects.reduce((sum, p) => sum + (p.riskScore || 0), 0) / mockProjects.length
      );
      
      const updatedJob: BatchProcessingJob = {
        ...newJob,
        status: 'complete',
        projects: mockProjects,
        summary: {
          total: mockProjects.length,
          passed,
          flagged,
          rejected,
          averageRiskScore,
          processingTime: Math.floor(Math.random() * 60000) + 30000,
          redFlagDistribution: {
            'Team anonymity': Math.floor(Math.random() * 50),
            'Suspicious tokenomics': Math.floor(Math.random() * 30),
            'Contaminated network': Math.floor(Math.random() * 20)
          }
        },
        completedAt: new Date()
      };
      
      setRecentBatches(prev => 
        prev.map(job => job.id === newJob.id ? updatedJob : job)
      );
      
      setBatchStats(prev => ({
        ...prev,
        averageProcessingTime: Math.floor(Math.random() * 60000) + 30000,
        rejectionRate: Math.floor(Math.random() * 40) + 10,
      }));
      
      handleBatchUploadComplete(updatedJob);
      
    } catch (err) {
      console.error('Batch upload failed:', err);
      setError('Batch upload failed. Please try again.');
    }
  }, []);

  // EA Batch Mode Handlers
  const handleBatchUploadComplete = useCallback((job: BatchProcessingJob) => {
    console.log('Batch job completed:', job.name);
    alert(`Batch processing complete! Processed ${job.projects?.length || 0} projects.`);
  }, []);

  const handleViewProjectDetails = useCallback((project: BatchProject) => {
    console.log('View project details:', project.name);
    // In a real app, you might navigate to a project detail page
  }, []);

  // Mode selection handlers
  const handleModeSelect = useCallback((mode: UserMode) => {
    setUserMode(mode);
  }, []);

  const handleModeConfirm = useCallback(() => {
    if (userMode) {
      setShowModeModal(false);
      setShowAuthModal(true);
    }
  }, [userMode]);

  const handleModeCancel = useCallback(() => {
    setShowModeModal(false);
    setUserMode(null);
  }, []);

  // Auth handlers
  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const emailInput = document.getElementById('loginEmail') as HTMLInputElement;
    const passwordInput = document.getElementById('loginPassword') as HTMLInputElement;
    
    if (!emailInput || !passwordInput) {
      setError('Login form elements not found');
      return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
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
      setShowModeModal(false);
      setError(null);
      
      alert(`Welcome back, ${userData.name}!`);
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please try again.');
    }
  }, [userMode]);

  const handleSignup = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const nameInput = document.getElementById('signupName') as HTMLInputElement;
    const emailInput = document.getElementById('signupEmail') as HTMLInputElement;
    const passwordInput = document.getElementById('signupPassword') as HTMLInputElement;
    const confirmInput = document.getElementById('signupConfirm') as HTMLInputElement;
    
    if (!nameInput || !emailInput || !passwordInput || !confirmInput) {
      setError('Signup form elements not found');
      return;
    }
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;
    
    if (!name || !email || !password || !confirm) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    
    try {
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
      setShowModeModal(false);
      setError(null);
      
      alert(`Account created! Welcome to Sifter, ${name}!`);
    } catch (err) {
      console.error('Signup failed:', err);
      setError('Signup failed. Please try again.');
    }
  }, [userMode]);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem('sifter_user');
      setIsLoggedIn(false);
      setUserName('');
      setUserEmail('');
      setUserMode(null);
      setShowModeModal(true);
      handleReset();
      setError(null);
    } catch (err) {
      console.error('Logout failed:', err);
      setError('Logout failed. Please try again.');
    }
  }, [handleReset]);

  // Get mode display name
  const getModeDisplayName = useCallback((mode: UserMode) => {
    if (!mode) return '';
    return mode === 'ea-vc' ? 'VC/EA Mode' :
           mode === 'researcher' ? 'Researcher Mode' :
           'Individual Investor Mode';
  }, []);

  // Get mode-specific greeting
  const getModeGreeting = useMemo(() => {
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
  }, [userMode, isLoggedIn]);

  // Get mode-specific description
  const getModeDescription = useMemo(() => {
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
  }, [userMode, isLoggedIn]);

  // FIXED: Helper function for IndividualDashboard - Add proper types
  const handleAddToWatchlist = useCallback((projectName: string, riskScore: number, verdict: string) => {
    const newItem: WatchlistItem = {
      projectId: `watch_${Date.now()}`,
      projectName,
      riskScore,
      verdict: verdict as VerdictType,
      addedAt: new Date(),
      alertsEnabled: true,
      lastChecked: new Date()
    };
    setWatchlist([newItem, ...watchlist]);
  }, [watchlist]);

  // FIXED: Helper function for IndividualDashboard - Add proper types
  const handleViewReport = useCallback((id: string) => {
    const scan = recentScans.find(s => s.id === id);
    if (scan) {
      console.log('Viewing report:', scan.projectName);
      // In a real app, you might navigate to a report view
    }
  }, [recentScans]);

  // FIXED: Helper function for IndividualDashboard - Add proper types
  const handleRemoveFromWatchlist = useCallback((projectId: string) => {
    setWatchlist(watchlist.filter(item => item.projectId !== projectId));
  }, [watchlist]);

  // Render Researcher Mode - FIXED
  const renderResearcherMode = useCallback(() => {
    const handleResearcherModeChange = () => {
      console.log('Researcher mode change requested');
      setShowModeModal(true);
    };

    const handleResearcherAnalyze = (input: string) => {
      if (!validateInput(input)) return;
      
      setCurrentInput(input);
      setState('loading');
      
      setTimeout(() => {
        const mockMetrics = convertMetricsToObject();
        setDetailedMetrics(mockMetrics);
        
        const mockProjectData = generateMockProjectData(input);
        setProjectData(mockProjectData);
        
        const compositeScore = Math.round(
          mockMetrics.reduce((sum, m) => sum + m.contribution, 0) 
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
          breakdown: mockMetrics.map((m): ScoreBreakdown => ({
            name: m.name,
            weight: m.weight,
            score: m.score,
            contribution: m.contribution,
            percentOfTotal: m.weight / 100
          })).sort((a, b) => b.contribution - a.contribution),
          analyzedAt: new Date().toISOString()
        };
        
        setVerdictData(verdict);
        setState('complete');
      }, 1500);
    };

    const handleExportPDF = (data: ProjectData) => {
      ExportService.exportToPDF(data);
    };

    const handleExportJSON = (data: ProjectData) => {
      ExportService.exportProjectAnalysis(data);
    };

    const handleExportCSV = (data: ProjectData) => {
      if (data && data.metrics) {
        ExportService.exportMetricsToCSV(data.metrics, data.displayName || 'project');
      }
    };

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ResearcherDashboard
          onAnalyze={handleResearcherAnalyze}
          userEmail={userEmail}
          onModeChange={handleResearcherModeChange}
          onExportPDF={handleExportPDF}
          onExportJSON={handleExportJSON}
          onExportCSV={handleExportCSV}
          currentProjectData={projectData || undefined}
          projectMetrics={detailedMetrics}
          userName={userName}
        />
      </div>
    );
  }, [userEmail, userName, projectData, detailedMetrics, generateRecommendations, validateInput]);

  // Render Individual Investor Mode - FIXED
  const renderIndividualInvestorMode = useCallback(() => {
    const handleIndividualModeChange = () => {
      console.log('Individual mode change requested');
      setShowModeModal(true);
    };

    const handleIndividualAnalyze = (input: string) => {
      if (!validateInput(input)) return;
      
      setCurrentInput(input);
      setState('loading');
      
      setTimeout(() => {
        const mockMetrics = convertMetricsToObject();
        setDetailedMetrics(mockMetrics);
        
        const mockProjectData = generateMockProjectData(input);
        setProjectData(mockProjectData);
        
        setState('complete');
      }, 1500);
    };

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <IndividualDashboard
          onAnalyze={handleIndividualAnalyze}
          watchlist={watchlist}
          recentScans={recentScans}
          onAddToWatchlist={handleAddToWatchlist}
          onViewReport={handleViewReport}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
          userName={userName}
          projectMetrics={detailedMetrics}
          onModeChange={handleIndividualModeChange}
          currentProject={projectData || undefined}
        />
      </div>
    );
  }, [watchlist, recentScans, userName, detailedMetrics, projectData, validateInput, handleAddToWatchlist, handleViewReport, handleRemoveFromWatchlist]);

  // Render Standard View
  const renderStandardView = useCallback(() => {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-300 hover:text-red-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {state === 'idle' && (
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              {isLoggedIn && userName ? `Welcome back, ${userName}!` : getModeGreeting}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {getModeDescription}
            </p>
          </div>
        )}

        <div className="mt-8">
          {state === 'idle' && (
            <div className="max-w-4xl mx-auto">
              <SmartInputParser 
                onResolve={handleSmartInputResolve}
                placeholder={getModeDescription}
                disabled={!isLoggedIn}
                compact={false}
              />
            </div>
          )}

          {state === 'loading' && (
            <LoadingState
              projectName={currentInput}
              onComplete={() => {
                const mockMetrics = convertMetricsToObject();
                setDetailedMetrics(mockMetrics);
                
                const compositeScore = Math.round(
                  mockMetrics.reduce((sum, m) => sum + m.contribution, 0) 
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
                  breakdown: mockMetrics.map((m): ScoreBreakdown => ({
                    name: m.name,
                    weight: m.weight,
                    score: m.score,
                    contribution: m.contribution,
                    percentOfTotal: m.weight / 100
                  })).sort((a, b) => b.contribution - a.contribution),
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
                onReset={handleReset}
              />
              
              <MetricBreakdown
                metrics={convertMetricsToObject()}
                projectName={verdictData.projectName}
                riskScore={verdictData.riskScore}
                onExport={() => {
                  if (projectData) {
                    ExportService.exportMetricsToCSV(convertMetricsToObject(), projectData.displayName);
                  } else {
                    alert('No project data available to export');
                  }
                }}
              />
            </div>
          )}

          {state === 'error' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Analysis Failed</h3>
              <p className="text-gray-400 mb-6">{error || 'An unexpected error occurred'}</p>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

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
                onClick={() => setShowModeModal(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }, [
    state, currentInput, verdictData, detailedMetrics, projectData, error,
    isLoggedIn, userName, getModeGreeting, getModeDescription,
    handleSmartInputResolve, getRandomDuration, generateRecommendations,
    handleReject, handleProceed, handleReset
  ]);

  // Render Single Analysis View for EA/VC Mode
  const renderEAVCSingleAnalysis = useCallback(() => {
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
        
        <div className="mt-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

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
                const mockMetrics = convertMetricsToObject();
                setDetailedMetrics(mockMetrics);
                
                const compositeScore = Math.round(
                  mockMetrics.reduce((sum, m) => sum + m.contribution, 0) 
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
                  breakdown: mockMetrics.map((m): ScoreBreakdown => ({
                    name: m.name,
                    weight: m.weight,
                    score: m.score,
                    contribution: m.contribution,
                    percentOfTotal: m.weight / 100
                  })).sort((a, b) => b.contribution - a.contribution),
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
                metrics={convertMetricsToObject()}
                projectName={verdictData.projectName}
                riskScore={verdictData.riskScore}
                onExport={() => {
                  if (projectData) {
                    ExportService.exportMetricsToCSV(convertMetricsToObject(), projectData.displayName);
                  } else {
                    alert('No project data available to export');
                  }
                }}
              />
            </div>
          )}

          {state === 'error' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Analysis Failed</h3>
              <p className="text-gray-400 mb-6">{error || 'An unexpected error occurred'}</p>
              <button
                onClick={() => {
                  setState('idle');
                  setError(null);
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }, [
    showBatchView, state, currentInput, verdictData, detailedMetrics, 
    projectData, error, handleSmartInputResolve, getRandomDuration, 
    generateRecommendations, handleReject, handleProceed
  ]);

  // Main rendering logic
  return (
    <main className="min-h-screen bg-sifter-dark">
      {/* ==================== DATA DONATION MODALS ==================== */}
      
      {/* Submission Form Modal */}
      {showSubmissionForm && (
        <SubmissionForm
          mode={userMode || 'individual'}
          isOpen={showSubmissionForm}
          onClose={() => {
            setShowSubmissionForm(false);
            setDataDonationPrefill(null);
          }}
          onSubmit={handleSubmitDataDonation}
          userName={userName}
          userEmail={userEmail}
          prefillData={dataDonationPrefill}
        />
      )}

      {/* Evidence Upload Modal */}
      {showEvidenceUpload && selectedSubmissionId && (
        <EvidenceUpload
          submissionId={selectedSubmissionId}
          existingEvidence={[]}
          onUpload={handleUploadEvidence}
          onCancel={() => {
            setShowEvidenceUpload(false);
            setSelectedSubmissionId(null);
          }}
          mode={(userMode as 'ea-vc' | 'researcher' | 'individual') || 'individual'}
        />
      )}

      {/* Tracking Dashboard Modal */}
      {showTrackingDashboard && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-4 pt-20">
            <div className="bg-sifter-card border border-sifter-border rounded-2xl max-w-6xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Data Donation Tracking</h2>
                  <button
                    onClick={() => setShowTrackingDashboard(false)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ✕
                  </button>
                </div>
                
                <TrackingDashboard
                  submissions={dataDonationSubmissions}
                  userMode={userMode || 'individual'}
                  onViewDetails={handleViewSubmissionDetails}
                  onAddEvidence={handleAddEvidenceToSubmission}
                  onExportSubmissions={handleExportSubmissions}
                  userPoints={userPoints}
                  userName={userName}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Points Display Modal */}
      {showPointsDisplay && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-4 pt-20">
            <div className="bg-sifter-card border border-sifter-border rounded-2xl max-w-6xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Points & Rewards</h2>
                  <button
                    onClick={() => setShowPointsDisplay(false)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ✕
                  </button>
                </div>
                
                <PointsDisplay
                  pointsData={[userPoints, lifetimePoints, poolPoints, multiplier, nextMilestone]}
                  userTier={userTier}
                  userMode={userMode || 'individual'}
                  onEnterRewardPool={handleEnterRewardPool}
                  onRedeemPoints={handleRedeemPoints}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Form Modal */}
      {showDisputeForm && selectedEntityForDispute.length > 0 && (
        <DisputeForm
          entityData={selectedEntityForDispute}
          userData={[userName, userEmail, userMode || 'individual', '']}
          onSubmit={handleSubmitDispute}
          onCancel={() => {
            setShowDisputeForm(false);
            setSelectedEntityForDispute([]);
          }}
          userMode={userMode || 'individual'}
        />
      )}

      {/* Flag Entity Modal */}
      {showStandardForm && selectedEntityForFlagging.length > 0 && (
        <StandardFlagForm
          entityData={selectedEntityForFlagging}
          userData={[userEmail || 'user', userEmail, userMode || 'individual', userName]}
          onSubmit={handleSubmitFlag}
          onCancel={() => {
            setShowStandardForm(false);
            setSelectedEntityForFlagging([]);
          }}
          showQuickActions={userMode === 'ea-vc'}
        />
      )}

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

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

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
              
              <div className="flex items-center gap-6">
                {/* Data Donation Button */}
                {isLoggedIn && userMode && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowTrackingDashboard(true)}
                      className="px-4 py-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 
                               border border-amber-500/30 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Data Donation
                      {userPoints > 0 && (
                        <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {userPoints} pts
                        </span>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setShowPointsDisplay(true)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                               text-white rounded-lg font-medium text-sm transition-all flex items-center gap-2"
                    >
                      🏆 Points
                    </button>
                    
                    <button
                      onClick={() => setShowSubmissionForm(true)}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
                               text-white rounded-lg font-medium text-sm transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Submit Report
                    </button>
                  </div>
                )}
                
                {state === 'complete' && projectData && (
                  <div className="flex items-center gap-2">
                    <ExportDropdown projectData={projectData} />
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
          <div className="min-h-screen">
            <LandingPage 
              onGetStarted={() => {
                setShowModeModal(true);
              }}
            />
          </div>
        ) : userMode === 'ea-vc' && isLoggedIn ? (
          showBatchView ? (
            <div className="px-4 py-8">
              <EABatchDashboard
                onBatchUpload={handleBatchUpload}
                onSingleAnalysis={() => setShowBatchView(false)}
                onBack={() => setShowModeModal(true)}
                userEmail={userEmail}
                onAnalyze={(input: string) => {
                  if (!validateInput(input)) return;
                  
                  setCurrentInput(input);
                  setShowBatchView(false);
                  setState('loading');
                  
                  setTimeout(() => {
                    const mockMetrics = convertMetricsToObject();
                    setDetailedMetrics(mockMetrics);
                    
                    const compositeScore = Math.round(
                      mockMetrics.reduce((sum, m) => sum + m.contribution, 0) 
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
                      breakdown: mockMetrics.map((m): ScoreBreakdown => ({
                        name: m.name,
                        weight: m.weight,
                        score: m.score,
                        contribution: m.contribution,
                        percentOfTotal: m.weight / 100
                      })).sort((a, b) => b.contribution - a.contribution),
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
                onExportBatch={(projects: BatchProject[]) => {
                  if (projects.length > 0) {
                    const projectDataArray: ProjectData[] = projects.map(p => ({
                      id: p.id,
                      canonicalName: p.name.toLowerCase().replace(/\s+/g, '-'),
                      displayName: p.name,
                      sources: [],
                      metrics: convertMetricsToObject(),
                      overallRisk: {
                        score: p.riskScore || 0,
                        verdict: p.verdict || 'pass',
                        tier: (p.riskScore || 0) < 25 ? 'LOW' : 
                              (p.riskScore || 0) < 50 ? 'MODERATE' : 
                              (p.riskScore || 0) < 75 ? 'ELEVATED' : 'HIGH',
                        confidence: Math.floor(Math.random() * 30) + 70
                      },
                      scannedAt: p.scannedAt || new Date(),
                      processingTime: p.processingTime || 0,
                      weight: 100, // Default weight
                      analyzedAt: new Date().toISOString()
                    }));
                    
                    ExportService.exportAllAnalyses(projectDataArray);
                  }
                }}
                onExportPartnerPacket={(batchSummary: BatchSummary, projects: BatchProject[]) => {
                  const packet = {
                    summary: {
                      total: batchSummary.total,
                      passed: batchSummary.passed,
                      flagged: batchSummary.flagged,
                      rejected: batchSummary.rejected,
                      averageRiskScore: batchSummary.averageRiskScore,
                      processingTime: batchSummary.processingTime,
                      generatedAt: new Date().toISOString()
                    },
                    projects: projects.map(p => ({
                      name: p.name,
                      riskScore: p.riskScore || 0,
                      verdict: p.verdict || 'unknown',
                      redFlags: p.redFlags || [],
                      processingTime: p.processingTime || 0,
                      scannedAt: p.scannedAt || new Date()
                    }))
                  };
                  
                  const blob = new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `partner-packet-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                onExportBatchCSV={(projects: BatchProject[]) => {
                  const csvData = projects.map(p => ({
                    name: p.name || 'Unknown',
                    riskScore: p.riskScore || 0,
                    verdict: p.verdict || 'unknown',
                    redFlags: (p.redFlags || ['No red flags']).join('; ')
                  }));
                  
                  const headers = ['Name', 'Risk Score', 'Verdict', 'Red Flags'];
                  const csvRows = [
                    headers.join(','),
                    ...csvData.map(row => 
                      [
                        `"${row.name.replace(/"/g, '""')}"`,
                        row.riskScore,
                        row.verdict,
                        `"${row.redFlags.replace(/"/g, '""')}"`
                      ].join(',')
                    )
                  ];
                  
                  const csvString = csvRows.join('\n');
                  const blob = new Blob([csvString], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `batch-analysis-${new Date().toISOString().split('T')[0]}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
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
