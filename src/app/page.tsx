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
import { createMetricsArray } from '@/utils/metricHelpers';

// Import Data Donation Components
import { SubmissionForm, TrackingDashboard, EvidenceUpload } from '@/components/data-donation/universal';
import PointsDisplay from '@/components/data-donation/universal/PointsDisplay';
import DisputeForm from '@/components/data-donation/universal/DisputeForm';
import StandardFlagForm from '@/components/data-donation/universal/StandardFlagForm';
import { RewardsShop } from '@/components/data-donation/gamification';
import type { Reward, RewardType, UserTier } from '@/types/dataDonation';

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
import { generateMockProjectData } from '@/data/mockData';

// Fix ExportDropdown component with proper error handling
const ExportDropdown = ({ projectData, compact = false }: { projectData: ProjectData | null; compact?: boolean }) => {
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
        className={`${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2'} bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg flex items-center gap-2 transition-colors`}
      >
        {isExporting ? (
          <>
            <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            📥 Export
          </>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-sifter-card border border-sifter-border rounded-lg shadow-lg z-50">
          <div className="p-1">
            <button
              onClick={() => handleExport('pdf')}
              className="w-full text-left px-3 py-2 text-gray-300 hover:bg-blue-500/10 hover:text-blue-400 rounded text-sm transition-colors"
            >
              📄 Export as PDF
            </button>
            <button
              onClick={() => handleExport('json')}
              className="w-full text-left px-3 py-2 text-gray-300 hover:bg-green-500/10 hover:text-green-400 rounded text-sm transition-colors"
            >
              📊 Export as JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="w-full text-left px-3 py-2 text-gray-300 hover:bg-purple-500/10 hover:text-purple-400 rounded text-sm transition-colors"
            >
              📈 Export as CSV
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
  const [userMode, setUserMode] = useState<UserMode | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [showMobileDataMenu, setShowMobileDataMenu] = useState(false);
  
  // COMPACT MODE STATE
  const [compactMode, setCompactMode] = useState(false);

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

  // Batch mode states
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
  const [showPointsDisplay, setShowPointsDisplay] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [showStandardForm, setShowStandardForm] = useState(false);
  
  const [dataDonationSubmissions, setDataDonationSubmissions] = useState<SubmissionFormData[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [selectedEntityForFlagging, setSelectedEntityForFlagging] = useState<string[]>([]);
  const [selectedEntityForDispute, setSelectedEntityForDispute] = useState<string[]>([]);
  const [dataDonationPrefill, setDataDonationPrefill] = useState<any>(null);
  
  // Points states
  const [userPoints, setUserPoints] = useState(0);
  const [lifetimePoints, setLifetimePoints] = useState(0);
  const [poolPoints, setPoolPoints] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [nextMilestone, setNextMilestone] = useState(1000);
  const [userTier, setUserTier] = useState<UserTier>('bronze');

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
          setUserTier(pointsData.tier || 'bronze');
        }
      } catch (err) {
        console.error('Failed to parse saved user:', err);
        localStorage.removeItem('sifter_user');
      }
    }
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.mobile-data-menu') && showMobileDataMenu) {
        setShowMobileDataMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileDataMenu]);

  // Keyboard shortcuts for compact mode
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDisputeForm) {
          setShowDisputeForm(false);
          setSelectedEntityForDispute([]);
        }
        if (showStandardForm) {
          setShowStandardForm(false);
          setSelectedEntityForFlagging([]);
        }
        if (showSubmissionForm) {
          setShowSubmissionForm(false);
          setDataDonationPrefill(null);
        }
        if (showEvidenceUpload) {
          setShowEvidenceUpload(false);
          setSelectedSubmissionId(null);
        }
        if (showTrackingDashboard) {
          setShowTrackingDashboard(false);
        }
        if (showPointsDisplay) {
          setShowPointsDisplay(false);
        }
      }
    };
    
    // Compact mode keyboard shortcut
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCompactMode(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [
    showDisputeForm, 
    showStandardForm, 
    showSubmissionForm, 
    showEvidenceUpload, 
    showTrackingDashboard,
    showPointsDisplay
  ]);

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

  // Get rewards based on user mode
  const getRewardsForMode = (mode: UserMode | null): Reward[] => {
    if (!mode) return [];
   
    const baseRewards: Reward[] = [
      // Individual Mode Rewards
      {
        id: 'premium_report',
        name: 'Premium Report',
        description: 'Get an in-depth analysis report with advanced metrics',
        type: 'access' as RewardType,
        category: 'individual',
        pointsCost: 500,
        quantityAvailable: 100,
        quantityRemaining: 55,
        tierRequirement: 'silver' as UserTier,
        modeRequirement: 'individual' as UserMode,
        features: ['In-depth analysis', 'Risk breakdown', 'Recommendations'],
        redemptionInstructions: 'The report will be available in your account within 24 hours.',
        createdAt: new Date('2024-01-01').toISOString()
      },
      {
        id: 'api_tier',
        name: 'API Free Tier',
        description: 'Access to Sifter API with 100 requests/month',
        type: 'access' as RewardType,
        category: 'all',
        pointsCost: 1000,
        quantityAvailable: 50,
        quantityRemaining: 30,
        tierRequirement: 'gold' as UserTier,
        features: ['100 API calls/month', 'Full endpoint access', 'Documentation'],
        redemptionInstructions: 'API key will be sent to your email within 1 hour.',
        createdAt: new Date('2024-01-01').toISOString()
      },
      {
        id: 'gift_card_10',
        name: '$10 Amazon Gift Card',
        description: 'Redeem points for a $10 Amazon gift card',
        type: 'physical' as RewardType,
        category: 'all',
        pointsCost: 2000,
        quantityAvailable: 25,
        quantityRemaining: 15,
        tierRequirement: 'silver' as UserTier,
        features: ['$10 value', 'Instant delivery', 'No expiration'],
        redemptionInstructions: 'Gift card code will be emailed within 24 hours.',
        createdAt: new Date('2024-01-15').toISOString()
      },
      {
        id: 'gift_card_25',
        name: '$25 Amazon Gift Card',
        description: 'Redeem points for a $25 Amazon gift card',
        type: 'physical' as RewardType,
        category: 'all',
        pointsCost: 4500,
        quantityAvailable: 15,
        quantityRemaining: 8,
        tierRequirement: 'gold' as UserTier,
        features: ['$25 value', 'Instant delivery', 'No expiration'],
        redemptionInstructions: 'Gift card code will be emailed within 24 hours.',
        createdAt: new Date('2024-01-15').toISOString()
      },
      {
        id: 'cash_paypal_50',
        name: '$50 PayPal Cash',
        description: 'Direct PayPal transfer of $50',
        type: 'physical' as RewardType,
        category: 'all',
        pointsCost: 9000,
        quantityAvailable: 10,
        quantityRemaining: 5,
        tierRequirement: 'platinum' as UserTier,
        features: ['$50 cash', 'PayPal transfer', 'Processed within 48h'],
        redemptionInstructions: 'PayPal email required. Transfer within 2 business days.',
        createdAt: new Date('2024-02-01').toISOString()
      },
      
      // Researcher Mode Rewards
      {
        id: 'researcher_export_credits',
        name: 'Export Credits Pack',
        description: '10 additional export credits for CSV/JSON/PDF',
        type: 'feature' as RewardType,
        category: 'researcher',
        pointsCost: 750,
        quantityAvailable: 100,
        quantityRemaining: 75,
        tierRequirement: 'bronze' as UserTier,
        modeRequirement: 'researcher' as UserMode,
        features: ['10 export credits', 'All formats', 'Never expires'],
        redemptionInstructions: 'Credits added automatically to your account.',
        createdAt: new Date('2024-01-01').toISOString()
      },
      {
        id: 'researcher_database_access',
        name: 'Extended Database Access',
        description: 'Full historical database access for 30 days',
        type: 'access' as RewardType,
        category: 'researcher',
        pointsCost: 2000,
        quantityAvailable: 30,
        quantityRemaining: 18,
        tierRequirement: 'gold' as UserTier,
        modeRequirement: 'researcher' as UserMode,
        features: ['30-day access', 'Full history', 'API endpoints', 'Raw data exports'],
        redemptionInstructions: 'Access token sent via email within 2 hours.',
        createdAt: new Date('2024-01-10').toISOString()
      },
      
      // VC/EA Mode Rewards
      {
        id: 'vc_priority_queue',
        name: 'Priority Batch Processing',
        description: 'Skip the queue for 10 batch analyses',
        type: 'feature' as RewardType,
        category: 'vc',
        pointsCost: 1500,
        quantityAvailable: 20,
        quantityRemaining: 12,
        tierRequirement: 'gold' as UserTier,
        modeRequirement: 'ea-vc' as UserMode,
        features: ['10 priority slots', 'Instant processing', 'Dedicated support'],
        redemptionInstructions: 'Priority status activated immediately.',
        createdAt: new Date('2024-01-05').toISOString()
      },
      {
        id: 'vc_custom_template',
        name: 'Custom Report Template',
        description: 'Branded report template for your VC firm',
        type: 'feature' as RewardType,
        category: 'vc',
        pointsCost: 3000,
        quantityAvailable: 10,
        quantityRemaining: 6,
        tierRequirement: 'platinum' as UserTier,
        modeRequirement: 'ea-vc' as UserMode,
        features: ['Custom branding', 'VC-specific metrics', 'White-label reports'],
        redemptionInstructions: 'Our team will contact you within 48 hours.',
        createdAt: new Date('2024-02-01').toISOString()
      }
    ];

    // Filter by mode
    if (mode === 'individual') {
      return baseRewards.filter(r => r.category === 'individual' || r.category === 'all');
    } else if (mode === 'researcher') {
      return baseRewards.filter(r => r.category === 'researcher' || r.category === 'all');
    } else if (mode === 'ea-vc') {
      return baseRewards.filter(r => r.category === 'vc' || r.category === 'all');
    }
    
    return baseRewards;
  };

  // ==================== DATA DONATION HANDLERS ====================
  const handleSubmitDataDonation = useCallback(async (formData: SubmissionFormData) => {
    try {
      // Add points based on submission quality
      const basePoints = 50;
      const evidenceBonus = formData.evidence.filter((e: any) => e.url).length * 10;
      const projectBonus = formData.affectedProjects.length * 5;
      const tierMultiplier = userTier === 'gold' ? 2.0 : userTier === 'silver' ? 1.5 : 1.0;
      
      const pointsEarned = Math.floor((basePoints + evidenceBonus + projectBonus) * tierMultiplier);
      const newPoints = userPoints + pointsEarned;
      const newLifetimePoints = lifetimePoints + pointsEarned;
      
      setUserPoints(newPoints);
      setLifetimePoints(newLifetimePoints);
      
      // Update user tier if needed
      if (newLifetimePoints >= 1000 && userTier === 'bronze') {
        setUserTier('silver');
        setMultiplier(1.5);
      } else if (newLifetimePoints >= 5000 && userTier === 'silver') {
        setUserTier('gold');
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

  const handleNewSubmission = useCallback(() => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setShowTrackingDashboard(false);
    setShowSubmissionForm(true);
    setDataDonationPrefill(null);
  }, [isLoggedIn]);

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
      const pointsEarned = flagData[flagData.length - 3] || 0;
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
    setShowStandardForm(true);
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

  // Handle smart input
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
      
      const mockMetrics = createMetricsArray();
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

  // Batch upload handler
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
        metrics: createMetricsArray()
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

  // Helper function for IndividualDashboard
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

  // Helper function for IndividualDashboard
  const handleViewReport = useCallback((id: string) => {
    const scan = recentScans.find(s => s.id === id);
    if (scan) {
      console.log('Viewing report:', scan.projectName);
      // In a real app, you might navigate to a report view
    }
  }, [recentScans]);

  // Helper function for IndividualDashboard
  const handleRemoveFromWatchlist = useCallback((projectId: string) => {
    setWatchlist(watchlist.filter(item => item.projectId !== projectId));
  }, [watchlist]);

  // Render Researcher Mode
  const renderResearcherMode = useCallback(() => {
    const handleResearcherAnalyze = (input: string) => {
      if (!validateInput(input)) return;
      
      setCurrentInput(input);
      setState('loading');
      
      setTimeout(() => {
        const mockMetrics = createMetricsArray();
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
      <div className={`max-w-7xl mx-auto ${compactMode ? 'px-2 py-4' : 'px-4 py-8'}`}>
        <ResearcherDashboard
          onAnalyze={handleResearcherAnalyze}
          userEmail={userEmail}
          onExportPDF={handleExportPDF}
          onExportJSON={handleExportJSON}
          onExportCSV={handleExportCSV}
          currentProjectData={projectData || undefined}
          projectMetrics={detailedMetrics}
          userName={userName}
          compact={compactMode}
        />
      </div>
    );
  }, [userEmail, userName, projectData, detailedMetrics, generateRecommendations, validateInput, compactMode]);

  // Render Individual Investor Mode
  const renderIndividualInvestorMode = useCallback(() => {
    const handleIndividualAnalyze = (input: string) => {
      if (!validateInput(input)) return;
      
      setCurrentInput(input);
      setState('loading');
      
      setTimeout(() => {
        const mockMetrics = createMetricsArray();
        setDetailedMetrics(mockMetrics);
        
        const mockProjectData = generateMockProjectData(input);
        setProjectData(mockProjectData);
        
        setState('complete');
      }, 1500);
    };

    return (
      <div className={`max-w-7xl mx-auto ${compactMode ? 'px-2 py-4' : 'px-4 py-8'}`}>
        <IndividualDashboard
          onAnalyze={handleIndividualAnalyze}
          watchlist={watchlist}
          recentScans={recentScans}
          onAddToWatchlist={handleAddToWatchlist}
          onViewReport={handleViewReport}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
          userName={userName}
          projectMetrics={detailedMetrics}
          currentProject={projectData || undefined}
          compact={compactMode}
        />
      </div>
    );
  }, [watchlist, recentScans, userName, detailedMetrics, projectData, validateInput, compactMode, handleAddToWatchlist, handleViewReport, handleRemoveFromWatchlist]);

  // Render Standard View
  const renderStandardView = useCallback(() => {
    return (
      <div className={`max-w-7xl mx-auto ${compactMode ? 'px-2 py-4' : 'px-4 py-12'}`}>
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`${compactMode ? 'text-sm' : 'text-base'}`}>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="mt-1 text-xs text-red-300 hover:text-red-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {state === 'idle' && (
          <div className={`text-center ${compactMode ? 'mb-6' : 'mb-12'}`}>
            <h2 className={`${compactMode ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'} font-bold text-white mb-3`}>
              {isLoggedIn && userName ? `Welcome back, ${userName}!` : getModeGreeting}
            </h2>
            <p className={`${compactMode ? 'text-sm' : 'text-base'} text-gray-400 max-w-2xl mx-auto`}>
              {getModeDescription}
            </p>
          </div>
        )}

        <div className={compactMode ? 'mt-4' : 'mt-8'}>
          {state === 'idle' && (
            <div className={`max-w-4xl mx-auto ${compactMode ? 'p-2' : 'p-0'}`}>
              <SmartInputParser 
                onResolve={handleSmartInputResolve}
                placeholder={getModeDescription}
                disabled={!isLoggedIn}
                compact={compactMode}
              />
            </div>
          )}

          {state === 'loading' && (
            <LoadingState
              projectName={currentInput}
              onComplete={() => {
                const mockMetrics = createMetricsArray();
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
              compact={compactMode}
            />
          )}

          {state === 'complete' && verdictData && (
            <div className={compactMode ? 'space-y-4' : 'space-y-8'}>
              <div className={`flex justify-end gap-2 ${compactMode ? 'mb-2' : 'mb-4'}`}>
                {projectData && (
                  <>
                    <ExportDropdown projectData={projectData} compact={compactMode} />
                    <button
                      onClick={() => ExportService.shareAnalysis(projectData)}
                      className={`${compactMode ? 'px-3 py-1.5 text-xs' : 'px-4 py-2'} bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 rounded-lg flex items-center gap-1.5`}
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
                compact={compactMode}
              />
              
              <MetricBreakdown
                instanceId="main-analysis"
                metrics={detailedMetrics}
                projectName={verdictData.projectName}
                riskScore={verdictData.riskScore}
                projectData={projectData || undefined}
                onExport={() => {
                  if (projectData) {
                    ExportService.exportMetricsToCSV(detailedMetrics, projectData.displayName);
                  } else {
                    alert('No project data available to export');
                  }
                }}
                compact={compactMode}
              />
            </div>
          )}

          {state === 'error' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Analysis Failed</h3>
              <p className="text-gray-400 mb-4">{error || 'An unexpected error occurred'}</p>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium text-sm"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {state === 'idle' && isLoggedIn && userMode !== 'ea-vc' && userMode !== 'individual' && userMode !== 'researcher' && (
          <div className={`text-center ${compactMode ? 'mt-6' : 'mt-12'}`}>
            <p className="text-gray-600 text-xs mb-2">Quick demo:</p>
            <div className="flex justify-center gap-2">
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
                className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded transition-colors"
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
                className="text-xs text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 px-3 py-1.5 rounded transition-colors"
              >
                View PROCEED example
              </button>
            </div>
          </div>
        )}

        {state === 'idle' && !isLoggedIn && (
          <div className={`text-center ${compactMode ? 'mt-6' : 'mt-12'}`}>
            <div className={`inline-block bg-sifter-card border border-sifter-border rounded-xl ${compactMode ? 'p-4' : 'p-6'} max-w-md mx-auto`}>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Sign in to Start Analyzing</h3>
              <p className="text-gray-400 text-xs mb-4">
                Login or create an account to access Sifter 1.0 and choose your workflow mode.
              </p>
              <button
                onClick={() => setShowModeModal(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2.5 rounded-lg font-medium text-sm transition-all"
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
    isLoggedIn, userName, getModeGreeting, getModeDescription, compactMode,
    handleSmartInputResolve, getRandomDuration, generateRecommendations,
    handleReject, handleProceed, handleReset
  ]);

  // Render Single Analysis View for EA/VC Mode
  const renderEAVCSingleAnalysis = useCallback(() => {
    return (
      <div className={`max-w-7xl mx-auto ${compactMode ? 'px-2 py-4' : 'px-4 py-8'}`}>
        <div className={`flex items-center justify-between ${compactMode ? 'mb-4' : 'mb-6'}`}>
          <button
            onClick={() => setShowBatchView(true)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Batch Dashboard
          </button>
          <div className="text-xs text-gray-500">
            Single Project Analysis (EA/VC Mode)
          </div>
        </div>
        
        <div className="mt-4">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {state === 'idle' && (
            <div className={`text-center ${compactMode ? 'mb-6' : 'mb-8'}`}>
              <h2 className={`${compactMode ? 'text-xl' : 'text-2xl'} font-bold text-white mb-3`}>
                Single Project Analysis
              </h2>
              <p className={`${compactMode ? 'text-sm' : 'text-base'} text-gray-400 max-w-2xl mx-auto`}>
                Analyze a single project with detailed metrics for EA/VC review
              </p>
            </div>
          )}

          {state === 'idle' && (
            <div className={`max-w-4xl mx-auto ${compactMode ? 'p-2' : 'p-0'}`}>
              <SmartInputParser 
                onResolve={handleSmartInputResolve}
                placeholder="Enter Twitter handle, Discord, Telegram, GitHub, or project name..."
                disabled={false}
                compact={compactMode}
              />
            </div>
          )}

          {state === 'loading' && (
            <LoadingState
              projectName={currentInput}
              onComplete={() => {
                const mockMetrics = createMetricsArray();
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
              compact={compactMode}
            />
          )}

          {state === 'complete' && verdictData && (
            <div className={compactMode ? 'space-y-4' : 'space-y-6'}>
              <div className={`flex justify-end gap-2 ${compactMode ? 'mb-2' : 'mb-3'}`}>
                {projectData && (
                  <>
                    <ExportDropdown projectData={projectData} compact={compactMode} />
                    <button
                      onClick={() => ExportService.shareAnalysis(projectData)}
                      className={`${compactMode ? 'px-3 py-1.5 text-xs' : 'px-4 py-2'} bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 rounded-lg flex items-center gap-1.5`}
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
                compact={compactMode}
              />
              
              <MetricBreakdown
                instanceId="main-analysis"
                metrics={detailedMetrics}
                projectName={verdictData.projectName}
                riskScore={verdictData.riskScore}
                projectData={projectData || undefined}
                onExport={() => {
                  if (projectData) {
                    ExportService.exportMetricsToCSV(detailedMetrics, projectData.displayName);
                  } else {
                    alert('No project data available to export');
                  }
                }}
                compact={compactMode}
              />
            </div>
          )}

          {state === 'error' && (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Analysis Failed</h3>
              <p className="text-gray-400 mb-4">{error || 'An unexpected error occurred'}</p>
              <button
                onClick={() => {
                  setState('idle');
                  setError(null);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium text-sm"
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
    generateRecommendations, handleReject, handleProceed, compactMode
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
                  onNewSubmission={handleNewSubmission}
                />
              </div>
            </div>
          </div>
        </div>
      )}

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
                
                {/* Points Display */}
                <div className="mb-8">
                  <PointsDisplay
                    pointsData={[userPoints, lifetimePoints, poolPoints, multiplier, nextMilestone]}
                    userTier={userTier}
                    userMode={userMode || 'individual'}
                    onEnterRewardPool={handleEnterRewardPool}
                    onRedeemPoints={handleRedeemPoints}
                  />
                </div>

                {/* Rewards Shop */}
                <div>
                  <RewardsShop
                    userProfile={{
                      userId: userEmail,
                      mode: userMode || 'individual',
                      totalPoints: userPoints,
                      availablePoints: userPoints,
                      lifetimePoints: lifetimePoints,
                      currentLevel: Math.floor(lifetimePoints / 1000) + 1,
                      currentTier: userTier,
                      badges: [],
                      achievements: [],
                      streak: {
                        currentStreak: 7,
                        longestStreak: 14,
                        lastActivity: new Date().toISOString(),
                        streakBonus: 1.5
                      },
                      leaderboardPosition: 42,
                      nextMilestone: {
                        pointsNeeded: nextMilestone,
                        reward: 'Premium Features',
                        unlocks: ['API access', 'Priority support', 'Custom reports']
                      },
                      displayName: userName,
                      pointsMultiplier: multiplier
                    }}
                    rewards={getRewardsForMode(userMode || 'individual')}
                    onRedeem={async (rewardId: string) => {
                      console.log('Redeeming reward:', rewardId);
                      const reward = getRewardsForMode(userMode || 'individual').find(r => r.id === rewardId);
                      if (reward) {
                        setUserPoints(prev => prev - reward.pointsCost);
                        alert(`Successfully redeemed: ${reward.name}!`);
                        return true;
                      }
                      return false;
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDisputeForm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-4 pt-20">
            <div className="bg-sifter-card border border-sifter-border rounded-2xl max-w-6xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">File a Dispute</h2>
                  <button
                    onClick={() => {
                      setShowDisputeForm(false);
                      setSelectedEntityForDispute([]);
                    }}
                    className="text-gray-400 hover:text-white text-2xl hover:bg-gray-800/50 rounded-lg p-2 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <DisputeForm 
                  entityData={selectedEntityForDispute.length > 0 ? selectedEntityForDispute : ['', '', '', '', '']}
                  userData={[userName, userEmail, userMode || 'individual', '']}
                  onSubmit={handleSubmitDispute}
                  onCancel={() => {
                    setShowDisputeForm(false);
                    setSelectedEntityForDispute([]);
                  }}
                  userMode={userMode || 'individual'}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showStandardForm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-4 pt-20">
            <div className="bg-sifter-card border border-sifter-border rounded-2xl max-w-6xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Flag Entity</h2>
                  <button
                    onClick={() => {
                      setShowStandardForm(false);
                      setSelectedEntityForFlagging([]);
                    }}
                    className="text-gray-400 hover:text-white text-2xl hover:bg-gray-800/50 rounded-lg p-2 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                {selectedEntityForFlagging.length > 0 ? (
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
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🚩</div>
                    <p className="text-gray-400 mb-4">No entity selected for flagging</p>
                    <button
                      onClick={() => setShowStandardForm(false)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode Selection Modal */}
      {showModeModal && !isLoggedIn && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-sifter-card border border-sifter-border rounded-2xl max-w-3xl w-full p-4 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-sifter-blue to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">SIFTER 1.0</h1>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Choose Your Workflow</h2>
              <p className="text-sm sm:text-base text-gray-400">Select your primary mode to customize your experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* EA/VC Mode */}
              <div className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                userMode === 'ea-vc'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-sifter-border hover:border-blue-500/50 hover:bg-sifter-card/50'
              }`}
              onClick={() => handleModeSelect('ea-vc')}>
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🏢</div>
                <h3 className="font-bold text-white mb-2 text-base sm:text-lg">VC/EA Mode</h3>
                <div className="text-xs sm:text-sm text-gray-400 space-y-2">
                  <p>Batch processing, Pass/Flag/Reject</p>
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-sifter-border/50">
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
              <div className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                userMode === 'researcher'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-sifter-border hover:border-purple-500/50 hover:bg-sifter-card/50'
              }`}
              onClick={() => handleModeSelect('researcher')}>
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🔬</div>
                <h3 className="font-bold text-white mb-2 text-base sm:text-lg">Researcher Mode</h3>
                <div className="text-xs sm:text-sm text-gray-400 space-y-2">
                  <p>Deep analysis, export data, comparisons</p>
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-sifter-border/50">
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
              <div className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                userMode === 'individual'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-sifter-border hover:border-green-500/50 hover:bg-sifter-card/50'
              }`}
              onClick={() => handleModeSelect('individual')}>
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">👤</div>
                <h3 className="font-bold text-white mb-2 text-base sm:text-lg">Individual Investor Mode</h3>
                <div className="text-xs sm:text-sm text-gray-400 space-y-2">
                  <p>Simple yes/no, mobile-friendly</p>
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-sifter-border/50">
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

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={handleModeCancel}
                className="px-6 sm:px-8 py-3 rounded-lg font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleModeConfirm}
                disabled={!userMode}
                className={`px-6 sm:px-8 py-3 rounded-lg font-medium transition-all order-1 sm:order-2 ${
                  userMode
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue to Login
              </button>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm text-center mt-4">
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
                <h3 className="text-xl font-bold text-white">Welcome to Sifter 1.0</h3>
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
        <header className={`border-b border-sifter-border bg-sifter-dark/50 backdrop-blur-sm ${compactMode ? 'py-2' : 'py-4'}`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`${compactMode ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-br from-sifter-blue to-blue-600 rounded-lg flex items-center justify-center`}>
                  <svg className={`${compactMode ? 'w-4 h-4' : 'w-6 h-6'} text-white`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h1 className={`${compactMode ? 'text-base font-bold' : 'text-xl font-bold'} text-white`}>SIFTER</h1>
                  {userMode && (
                    <p className={`${compactMode ? 'text-[10px]' : 'text-xs'} text-gray-500`}>{getModeDisplayName(userMode)}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Compact mode toggle button */}
                <button
                  onClick={() => setCompactMode(!compactMode)}
                  className={`px-2 py-1 text-xs ${
                    compactMode 
                      ? 'bg-gray-800 text-gray-300 border border-gray-700' 
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  } rounded-lg transition-colors hidden sm:block`}
                  title={compactMode ? "Switch to normal view" : "Switch to compact view"}
                >
                  {compactMode ? "↔️" : "↕️"}
                </button>
                
                {/* Data Donation Button */}
                {isLoggedIn && userMode && (
                  <div className="hidden md:flex items-center gap-2">
                    <button
                      onClick={() => setShowTrackingDashboard(true)}
                      className={`${compactMode ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-xs'} bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap`}
                    >
                      <svg className={`${compactMode ? 'w-3 h-3' : 'w-3.5 h-3.5'} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Data Donation</span>
                      {userPoints > 0 && (
                        <span className="bg-amber-500 text-white text-xs px-1 py-0.5 rounded-full font-bold">
                          {userPoints}
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* Mobile: Show dropdown menu */}
                {isLoggedIn && userMode && (
                  <div className="md:hidden relative mobile-data-menu">
                    <button
                      onClick={() => setShowMobileDataMenu(!showMobileDataMenu)}
                      className={`p-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg transition-colors relative`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                      {userPoints > 0 && (
                        <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-1 py-0.5 rounded-full font-bold">
                          {userPoints}
                        </span>
                      )}
                    </button>
                    
                    {showMobileDataMenu && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-sifter-card border border-sifter-border rounded-lg shadow-xl z-50">
                        <div className="p-1 space-y-1">
                          <button
                            onClick={() => {
                              setShowTrackingDashboard(true);
                              setShowMobileDataMenu(false);
                            }}
                            className="w-full text-left px-3 py-2 text-amber-400 hover:bg-amber-500/10 rounded text-sm transition-colors flex items-center gap-2"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-xs">Data Donation</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setCompactMode(!compactMode);
                              setShowMobileDataMenu(false);
                            }}
                            className="w-full text-left px-3 py-2 text-blue-400 hover:bg-blue-500/10 rounded text-sm transition-colors flex items-center gap-2"
                          >
                            <span>{compactMode ? "↔️" : "↕️"}</span>
                            <span className="text-xs">{compactMode ? "Normal View" : "Compact View"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {isLoggedIn && userMode && (
                  <div className="flex items-center gap-2 ml-2 pl-2 border-l border-sifter-border">
                    <div className={`${compactMode ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-xs'} rounded-full font-medium whitespace-nowrap ${
                      userMode === 'ea-vc' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      userMode === 'researcher' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                      'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {getModeDisplayName(userMode)}
                    </div>
                    <div className="text-right">
                      <p className={`${compactMode ? 'text-xs' : 'text-sm'} font-medium text-white truncate max-w-[100px]`}>{userName}</p>
                      <p className={`${compactMode ? 'text-[10px]' : 'text-xs'} text-gray-500 truncate max-w-[100px]`}>{userEmail}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className={`${compactMode ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-xs'} text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors font-medium flex items-center justify-center`}
                    >
                      Logout
                    </button>
                  </div>
                )}
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
               compact={compactMode}
            />
          </div>
        ) : userMode === 'ea-vc' && isLoggedIn ? (
          showBatchView ? (
            <div className={`${compactMode ? 'px-2 py-4' : 'px-4 py-8'}`}>
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
                    const mockMetrics = createMetricsArray();
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
                recentBatches={recentBatches}
                batchStats={batchStats}
                onExportBatch={(projects: BatchProject[]) => {
                  if (projects.length > 0) {
                    const projectDataArray: ProjectData[] = projects.map(p => ({
                      id: p.id,
                      canonicalName: p.name.toLowerCase().replace(/\s+/g, '-'),
                      displayName: p.name,
                      sources: [],
                      metrics: createMetricsArray(),
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
                      weight: 100,
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
                compact={compactMode}
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
        <footer className={`fixed bottom-0 left-0 right-0 border-t border-sifter-border bg-sifter-dark/80 backdrop-blur-sm ${compactMode ? 'py-1.5' : 'py-3'}`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center">
              <div className={`${compactMode ? 'text-[10px]' : 'text-xs'} text-gray-600`}>
                <span className={`${compactMode ? 'text-xs' : 'text-sm'} font-medium text-gray-400`}>SIFTER 1.0</span> - Automated Project Due Diligence
              </div>
              {userMode && (
                <div className={`${compactMode ? 'text-[10px]' : 'text-xs'} text-gray-500 flex items-center gap-1.5`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${compactMode ? 'animate-pulse' : 'animate-pulse'} bg-blue-500`}></span>
                  Active: {getModeDisplayName(userMode)}
                  {compactMode && (
                    <span className="text-gray-600 ml-1">| Ctrl+K to toggle view</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </footer>
      )}
    </main>
  );
}