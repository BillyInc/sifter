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
import { createMetricsArray } from '@/utils/metricHelpers';

import { generateDetailedMetricEvidence } from '@/utils/metricHelpers';

// NEW: Import Data Donation Components
import { SubmissionForm, TrackingDashboard, EvidenceUpload } from '@/components/data-donation/universal';
import PointsDisplay from '@/components/data-donation/universal/PointsDisplay'; // Added
import DisputeForm from '@/components/data-donation/universal/DisputeForm'; // Added
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
import { generateMockProjectData } from '@/data/mockData'; // Fixed import




// Fix ExportDropdown component with proper error handling
const ExportDropdown = ({ projectData }: { projectData: ProjectData | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  if (!projectData) return null;

  


  const [showQuickModeSwitch, setShowQuickModeSwitch] = useState(false);
  
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
          setUserTier(pointsData.tier || 'tier-3');
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

  // ADD THIS NEW useEffect:
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
  
  window.addEventListener('keydown', handleEscape);
  return () => window.removeEventListener('keydown', handleEscape);
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


  // Helper function to generate detailed, specific evidence
// Helper function to generate detailed, specific evidence
const generateDetailedMetricEvidence = (
  metricKey: string,
  score: number,
  projectData: {
    teamMembers?: Array<{ name: string; role: string; linkedin?: string; github?: string; twitter?: string }>;
    githubRepo?: string;
    socialAccounts?: { twitter?: string; discord?: string; telegram?: string };
    advisors?: Array<{ name: string; previousProjects?: string[] }>;
    marketingAgencies?: Array<{ name: string; trackRecord?: string[] }>;
    communityModerators?: Array<{ name: string; handle: string; history?: string }>;
    tokenContract?: string;
    launchDate?: Date;
  }
): string => {
  const completionLine = `\n\n---\n✓ Analysis Complete - ${new Date().toLocaleString()}`;

  switch (metricKey) {
    case 'teamIdentity':
      if (score >= 60) {
        // HIGH RISK - Provide specific missing information
        const anonymous = projectData.teamMembers?.filter(m => !m.linkedin) || [];
        const noGithub = projectData.teamMembers?.filter(m => !m.github) || [];
        return `**Critical Identity Issues Found:**
- **Anonymous Team Members:** ${anonymous.length} out of ${projectData.teamMembers?.length || 0} team members have no verifiable LinkedIn profiles
  - ${anonymous.map(m => `"${m.name}" (${m.role}): No LinkedIn, ${m.twitter ? `only Twitter @${m.twitter}` : 'no social media'}`).join('\n  - ') || 'All team members anonymous'}
- **Unverifiable Claims:**
  - Founder "CryptoBuilder123" claims 10 years blockchain experience but LinkedIn account created 4 months ago
  - Lead developer has no prior GitHub commits before ${projectData.launchDate ? new Date(projectData.launchDate).toISOString().split('T')[0] : 'project launch'}
- **Red Flags:**
  - Twitter handle @${projectData.socialAccounts?.twitter || 'teamhandle'} created ${projectData.launchDate ? Math.floor((Date.now() - new Date(projectData.launchDate).getTime()) / (1000 * 60 * 60 * 24)) : '90'} days ago
  - No team member photos match reverse image search results
  - Email domains are free Gmail/ProtonMail accounts, not company domain
**Evidence Sources:**
- LinkedIn Search: ${projectData.teamMembers?.length || 0} profiles checked
- GitHub Analysis: ${noGithub.length} members with no commit history
- Social Media Verification: Cross-referenced ${projectData.socialAccounts ? 'Twitter, Discord, Telegram' : 'available platforms'}${completionLine}`;
      } else if (score >= 30) {
        // MEDIUM RISK - Partial verification
        return `**Partial Identity Verification:**
- **Verified Members:** ${projectData.teamMembers?.filter(m => m.linkedin).length || 0} out of ${projectData.teamMembers?.length || 0} have LinkedIn profiles
  - ${projectData.teamMembers?.filter(m => m.linkedin).map(m => `${m.name} (${m.role}): LinkedIn verified, ${m.github ? 'GitHub active' : 'no GitHub'}`).join('\n  - ') || 'Some verification exists'}
- **Concerns:**
  - ${projectData.teamMembers?.filter(m => !m.linkedin).length || 0} team members still using pseudonyms
  - Limited work history verification (1-2 years visible)
  - Some gaps in professional background
- **Positive Signs:**
  - Core team members have consistent online presence
  - No obvious red flags in available profiles
  - Team responds to verification requests
**Recommendation:** Request additional KYC documentation before major investment.${completionLine}`;
      } else {
        // LOW RISK - Strong verification
        return `**Strong Identity Verification:**
- **Fully Verified Team:** ${projectData.teamMembers?.map(m => ` - **${m.name}** (${m.role})
  • LinkedIn: ${m.linkedin || 'Verified'} (5+ years history)
  • GitHub: ${m.github || 'Active'} (2,000+ contributions)
  • Twitter: ${m.twitter || '@verified'} (established account)
`).join('') || 'All team members fully verified with professional backgrounds'}
- **Track Record:**
  - Team previously worked together at [Previous Company]
  - Combined 25+ years blockchain development experience
  - 3 successful projects launched (all still operational)
- **Public Presence:**
  - Regular conference speakers
  - Published technical papers
  - Active in developer communities
**Verification Methods:**
- LinkedIn profiles verified through mutual connections
- GitHub history shows consistent quality contributions
- Video calls conducted with key team members
- Background checks completed${completionLine}`;
      }

    case 'teamCompetence':
      if (score >= 60) {
        // HIGH RISK - Lack of technical skills
        const repoUrl = projectData.githubRepo || 'github.com/project/repo';
        return `**Severe Technical Competency Gaps:**
- **Claimed vs Actual Skills:**
  - **Claim:** "Building next-generation Layer 2 scaling solution"
  - **Reality:** No Solidity developers identified in team
  - Lead developer "${projectData.teamMembers?.[0]?.name || 'DevLead'}" has only 2 months GitHub activity
- **Repository Analysis (${repoUrl}):**
  - Total commits: 47
  - Original code: 12% (88% forked/copied)
  - Active contributors: 1 (others made only README edits)
  - Last meaningful commit: 18 days ago
  - Code complexity score: 2/10 (very basic)
- **Code Quality Issues:**
  - 73% code similarity to "Generic DeFi Template" on GitHub
  - No unit tests found
  - No smart contract audits in team history
  - Security best practices not followed
- **Missing Expertise:**
  - No cryptography specialists
  - No previous L2 experience
  - No formal Computer Science degrees
  - No professional software engineering background
**Risk Assessment:** Team lacks fundamental skills to deliver on technical promises.${completionLine}`;
      } else if (score >= 30) {
        // MEDIUM RISK - Some competence but limited
        return `**Moderate Technical Competence:**
- **Team Skills Audit:**
  - ${projectData.teamMembers?.filter(m => m.github).length || 1} developer(s) with 1-2 years blockchain experience
  - GitHub shows mix of original (50%) and forked (50%) code
  - Previous projects: 1 completed, 1 abandoned
- **Repository Activity (${projectData.githubRepo || 'github.com/project/repo'}):**
  - Commits per month: 25-30 (moderate pace)
  - Contributors: 2-3 regular participants
  - Code quality: Average (some refactoring needed)
  - Documentation: Basic but present
- **Positive Indicators:**
  - Team responsive to technical questions
  - Some original architectural decisions
  - Learning and improving over time
- **Areas of Concern:**
  - Limited testing infrastructure
  - No formal audit yet scheduled
  - Dependency on external libraries
**Recommendation:** Team can deliver basic functionality but may struggle with complex features.${completionLine}`;
      } else {
        // LOW RISK - Strong technical team
        return `**Exceptional Technical Competence:**
- **Team Credentials:** ${projectData.teamMembers?.map(m => ` - **${m.name}** (${m.role})
  • 7+ years Solidity development
  • GitHub: ${m.github || '5,000+'} contributions
  • Previous Projects: Uniswap V2 contributor, Aave protocol
  • Education: MIT Computer Science
`).join('') || 'Highly qualified team with proven track record'}
- **Repository Excellence (${projectData.githubRepo || 'github.com/project/repo'}):**
  - Total commits: 1,247
  - Original code: 85%
  - Active contributors: 5 core + 12 regular
  - Test coverage: 94%
  - Code quality score: 9/10
  - Documentation: Comprehensive with tutorials
- **Achievements:**
  - 3 previous successful blockchain projects (all still operational)
  - Smart contracts audited by Trail of Bits and ConsenSys
  - Published 5 technical papers
  - Regular speakers at Ethereum conferences
- **Innovation:**
  - Novel consensus mechanism implementation
  - Original cryptographic primitives
  - Industry-first gas optimization techniques
**Verdict:** Team demonstrates elite-level technical capabilities.${completionLine}`;
      }

    case 'contaminatedNetwork':
      if (score >= 60) {
        // HIGH RISK - Connected to bad actors
        return `**Dangerous Network Associations Detected:**
- **Marketing Agency Red Flags:**
  - **"CryptoGrowth Labs"** (${projectData.marketingAgencies?.[0]?.name || 'Primary Agency'})
    • Previous clients: RugPullToken (exit scam, $2.3M stolen), MoonScam (abandoned), PumpAndDump (rug pulled)
    • Failure rate: 3 out of 4 projects failed within 6 months
    • Known for aggressive pump-and-dump marketing tactics
    • Blacklisted by CoinGecko for suspicious activity
- **Problematic Influencer Connections:**
  - **@CryptoShillKing** (Community Moderator)
    • Promoted 5 projects that failed (SafeMoon copy, SquidGame token, etc.)
    • 15,000 followers are 73% bot accounts (SocialBlade analysis)
    • Receives undisclosed payments for promotion
  - **@BlockchainGuru247** (Advisor)
    • Connected to 2 confirmed exit scams in 2023
    • Currently under investigation by SEC
    • LinkedIn profile fake (stock photo detected)
- **Network Analysis Findings:**
  - 47% of team's Twitter followers overlap with known scam projects
  - Shared wallet addresses with RugToken project
  - Same IP addresses used in Discord server as failed project XYZ
**Transaction Evidence:**
- Wallet 0x742d...a8f3 received funds from confirmed scam address
- Marketing payments traced to same agency that marketed 3 rug pulls
- Smart contract deployed by same address as previous failed token
**Conclusion:** This project shares infrastructure and personnel with confirmed scam operations.${completionLine}`;
      } else if (score >= 30) {
        // MEDIUM RISK - Mixed associations
        return `**Mixed Network Signals:**
- **Marketing Partners:**
  - **"${projectData.marketingAgencies?.[0]?.name || 'Digital Marketing Co'}"**
    • Track record: 6 successful projects, 2 failed projects
    • Success rate: 75% (industry average: 60%)
    • Some clients underperformed but no confirmed scams
    • Reputation: Mixed reviews, generally legitimate
- **Advisory Board:** ${projectData.advisors?.map(a => ` - **${a.name}**: Previously advised ${a.previousProjects?.length || 0} projects
  • ${a.previousProjects?.[0] || 'ProjectX'}: Still operational but low activity
  • ${a.previousProjects?.[1] || 'ProjectY'}: Failed but no malicious intent
`).join('') || 'Advisors have mixed but not alarming track records'}
- **Community Moderators:**
  - Some moderators promoted projects that later failed
  - No evidence of intentional scam involvement
  - Possible poor judgment rather than malicious intent
**Recommendation:** Proceed with caution. Not definitive red flags but warrants additional due diligence.${completionLine}`;
      } else {
        // LOW RISK - Clean network
        return `**Clean Network Associations:**
- **Reputable Marketing Partners:**
  - **"${projectData.marketingAgencies?.[0]?.name || 'Top Tier Marketing'}"**
    • 10+ successful blockchain projects
    • Clients include: Chainlink, The Graph, Polygon
    • Industry awards: Best Crypto Marketing Agency 2023
    • No failed projects in 3-year history
- **Distinguished Advisory Board:** ${projectData.advisors?.map(a => ` - **${a.name}**: Ethereum Foundation member
  • Advised: Uniswap, Aave, Compound
  • LinkedIn: 25,000+ connections in crypto industry
  • Reputation: Impeccable, no failed projects
`).join('') || 'All advisors have sterling reputations'}
- **Legitimate Community Leadership:**
  - Moderators have clean track records
  - No connections to failed or scam projects
  - Active in reputable crypto communities
  - Transparent about affiliations
**Network Analysis:**
- 0 connections to known bad actors
- Associated with top-tier projects and institutions
- Strong reputation in developer community
**Conclusion:** Project has excellent network positioning with trustworthy partners.${completionLine}`;
      }

    case 'mercenaryKeywords':
      if (score >= 60) {
        // HIGH RISK - Excessive pump language
        return `**Excessive Mercenary Language Detected:**
- **Keyword Frequency Analysis (Last 30 Days):**
  - "moon" / "mooning": 47 instances
  - "100x" / "1000x": 23 instances
  - "last chance": 31 instances
  - "don't miss out": 18 instances
  - "guaranteed returns": 12 instances
  - "life-changing": 27 instances
  - "financial freedom": 15 instances
- **Content Breakdown:**
  - Marketing/Hype: 62%
  - Price Speculation: 26%
  - Technical Discussion: 8%
  - Community Building: 4%
- **Marketing-to-Technical Ratio: 8:1** (Industry Standard: 2:1)
- **Discord Analysis:**
  - Price speculation messages: 847 (62% of total)
  - Technical discussions: 163 (12% of total)
  - General chat: 356 (26% of total)
- **Specific Examples:**
  - "This is your LAST CHANCE to get in before we 1000x! Don't miss the moon mission! 🚀🚀🚀"
  - "Financial freedom awaits! Join now before it's too late!"
  - "Guaranteed 100x or your money back!" (Note: Impossible to guarantee)
- **Red Flag Patterns:**
  - Urgency manipulation: 31 instances of "last chance" / "running out"
  - Unrealistic promises: 23 instances of "100x" or higher claims
  - FOMO creation: 89% of posts contain urgency language
**Risk Assessment:** Language patterns match known pump-and-dump schemes.${completionLine}`;
      } else if (score >= 30) {
        // MEDIUM RISK - Moderate promotional content
        return `**Moderate Promotional Language:**
- **Keyword Analysis:**
  - Pump keywords present but not dominant
  - "moon" / "mooning": 8 instances (last 30 days)
  - "10x" / "100x": 5 instances
  - Mix of hype and substance
- **Content Distribution:**
  - Marketing: 40%
  - Community Content: 30%
  - Technical Updates: 20%
  - Educational: 10%
- **Marketing-to-Technical Ratio: 2:1** (Acceptable)
- **Positive Signs:**
  - Some educational content present
  - Technical updates included in announcements
  - Not exclusively focused on price
- **Areas for Improvement:**
  - Could increase technical content ratio
  - Reduce speculative price discussions
  - More focus on use cases and development
**Recommendation:** Watch for escalation of hype language over time.${completionLine}`;
      } else {
        // LOW RISK - Balanced content
        return `**Balanced Professional Communication:**
- **Content Analysis (Last 30 Days):**
  - Technical Updates: 45%
  - Educational Content: 30%
  - Community Highlights: 15%
  - Marketing: 10%
- **Marketing-to-Technical Ratio: 1:3** (Very Healthy)
- **Keyword Profile:**
  - Minimal pump language detected
  - Focus on "innovation," "development," "research"
  - Professional tone maintained
  - Realistic expectations set
- **Communication Quality:**
  - Regular development progress updates
  - Technical documentation emphasized
  - Educational content for users
  - Transparent about challenges
- **Community Engagement:**
  - Technical discussions encouraged: 45% of Discord activity
  - Price speculation discouraged by moderators
  - Focus on long-term vision and utility
- **Example Posts:**
  - "New smart contract optimization reduces gas costs by 23%. Details in our technical blog."
  - "Development update: Test network deployed, audit scheduled for Q2."
  - "Community AMA focuses on protocol mechanics and use cases."
**Verdict:** Professional communication aligned with legitimate project goals.${completionLine}`;
      }

    case 'messageTimeEntropy':
      if (score >= 60) {
        // HIGH RISK - Bot-like patterns
        return `**Suspicious Coordinated Activity Detected:**
- **Posting Time Analysis (Last 14 Days):**
  - 73% of messages posted within same 2-hour windows daily
  - Peak posting times: 10:00-12:00 UTC (847 messages)
  - Secondary peak: 18:00-20:00 UTC (623 messages)
  - Off-peak hours: <5 messages per hour (organic communities: 20-30)
- **Coordination Evidence:**
  - **Day 1:** 234 messages between 10:15-10:47 UTC (32 minutes)
  - **Day 3:** 189 messages between 10:08-10:39 UTC (31 minutes)
  - **Day 7:** 267 messages between 10:12-10:51 UTC (39 minutes)
  - Pattern repeats daily with <5 minute variance
- **Account Clustering:**
  - 127 accounts post exclusively during 10:00-12:00 UTC window
  - Zero activity outside coordinated windows
  - No natural timezone distribution observed
- **Statistical Analysis:**
  - Expected entropy for organic community: 0.75-0.85
  - Measured entropy: 0.23 (highly concentrated)
  - Probability of natural occurrence: <0.001%
- **Bot Farm Indicators:**
  - Identical posting intervals (within 2-second precision)
  - No variation for weekends/holidays
  - Activity stops abruptly at scheduled times
  - Matches known bot network patterns
**Time Distribution Chart:**
\`\`\`
00:00-06:00: ▁▁▁ (12 messages)
06:00-12:00: ████████████ (1,247 messages)
12:00-18:00: ▁▁▁▁ (34 messages)
18:00-24:00: █████ (623 messages)
\`\`\`
**Conclusion:** Clear evidence of artificial, coordinated activity. Not organic community behavior.${completionLine}`;
      } else if (score >= 30) {
        // MEDIUM RISK - Some irregular patterns
        return `**Irregular Activity Patterns:**
- **Time Distribution:**
  - Mostly natural with some concentration
  - Peak hours: 14:00-18:00 UTC (moderate spike)
  - Activity present across 24-hour cycle
  - Some timezone clustering detected
- **Analysis:**
  - 40-60% of messages during peak 4-hour window
  - Explainable by US/EU timezone overlap
  - Some off-peak activity present
  - Weekend patterns differ from weekdays (good sign)
- **Minor Concerns:**
  - Slight clustering in posting times
  - Some accounts only active during peaks
  - Could be organic or mild coordination
- **Positive Indicators:**
  - Activity continues during off-peak hours
  - Natural variation day-to-day
  - Holiday activity patterns change appropriately
**Recommendation:** Monitor for increasing coordination over time.${completionLine}`;
      } else {
        // LOW RISK - Natural patterns
        return `**Natural Activity Patterns:**
- **24-Hour Distribution:**
  - Messages spread across all time zones
  - Peak activity: 14:00-18:00 UTC (US/EU overlap) - 28%
  - Night activity: 00:00-08:00 UTC - 18%
  - Gradual transitions between peaks
- **Statistical Health:**
  - Entropy score: 0.82 (optimal: 0.75-0.85)
  - Natural timezone distribution
  - Weekend patterns differ from weekdays
  - Holiday activity shows expected drops
- **Community Characteristics:**
  - Global participation evident
  - 24/7 activity with natural ebbs and flows
  - No suspicious coordination detected
  - Conversation threads span multiple hours
- **Time Zone Analysis:**
  - North America: 35% of messages
  - Europe: 40% of messages
  - Asia: 20% of messages
  - Other: 5% of messages
**Activity Flow:**
\`\`\`
00:00-06:00: ███ (Asia peak)
06:00-12:00: ████ (Europe peak)
12:00-18:00: █████ (EU/US overlap)
18:00-24:00: ████ (US peak)
\`\`\`
**Verdict:** Organic community with natural global participation patterns.${completionLine}`;
      }

    case 'accountAgeEntropy':
      if (score >= 60) {
        // HIGH RISK - Sybil attack pattern
        return `**Bulk Account Creation Detected (Sybil Attack):**
- **Critical Finding:**
  - **847 community accounts created within 7-day period**
  - Creation dates: March 15-22, 2024
  - 92% of active community members have accounts <30 days old
- **Account Age Breakdown:**
  - 0-7 days old: 423 accounts (46%)
  - 8-14 days old: 267 accounts (29%)
  - 15-30 days old: 157 accounts (17%)
  - 31-90 days old: 47 accounts (5%)
  - 90+ days old: 23 accounts (3%)
- **Statistical Red Flags:**
  - Expected natural distribution: Gradual slope
  - Observed distribution: Massive spike at project launch
  - Probability of organic occurrence: <0.0001%
- **Creation Pattern Analysis:**
  - **March 15:** 143 accounts created
  - **March 16:** 187 accounts created
  - **March 17:** 201 accounts created
  - **March 18:** 156 accounts created
  - **March 19:** 89 accounts created
  - **March 20:** 47 accounts created
  - **March 21:** 24 accounts created
- **Supporting Evidence:**
  - Sequential usernames detected: user_1247, user_1248, user_1249
  - Similar profile pictures (12 distinct images used 847 times)
  - Identical bio templates with variable substitution
  - Email pattern matching: [randomstring]@tempmail.com
- **Behavior Patterns:**
  - 89% of flagged accounts have <10 total messages
  - Messages posted within coordinated time windows
  - Copy-paste content detected (45% message similarity)
**Age Distribution Chart:**
\`\`\`
<7 days: ██████████████████ (423)
8-14 days: ███████████ (267)
15-30 days: ███████ (157)
31-90 days: ██ (47)
90+ days: ▁ (23)
\`\`\`
**Conclusion:** Clear Sybil attack. Community artificially inflated with fake accounts.${completionLine}`;
      } else if (score >= 30) {
        // MEDIUM RISK - Some clustering
        return `**Account Creation Clustering Detected:**
- **Age Distribution:**
  - 0-30 days: 45% of accounts
  - 31-90 days: 25% of accounts
  - 91-180 days: 15% of accounts
  - 180+ days: 15% of accounts
- **Observations:**
  - Some concentration in recent account creation
  - Could be explained by organic growth spike
  - Not as extreme as typical Sybil attacks
  - Older accounts do exist and are active
- **Minor Concerns:**
  - Slight clustering around project milestones
  - Some usernames follow patterns
  - Higher-than-average new account ratio
- **Positive Signs:**
  - Active participation from older accounts
  - Natural variation in creation dates
  - No obvious automation detected
**Recommendation:** Acceptable but monitor for increasing manipulation.${completionLine}`;
      } else {
        // LOW RISK - Natural distribution
        return `**Natural Account Age Distribution:**
- **Healthy Age Spread:**
  - 0-30 days: 22% of accounts
  - 31-90 days: 18% of accounts
  - 91-180 days: 25% of accounts
  - 180+ days: 35% of accounts
- **Growth Pattern:**
  - Gradual community growth over 18-month period
  - Natural curve following project development
  - 78% of active members have accounts >6 months old
  - Oldest accounts: 24+ months
- **Account Quality:**
  - Diverse creation dates across timeline
  - No bulk creation events detected
  - Active participation from long-term members
  - New member onboarding appears organic
- **Community Maturity Indicators:**
  - Core community established before marketing push
  - Long-term members hold leadership positions
  - New members mentored by established community
  - Natural retention curve observed
**Age Distribution Chart:**
\`\`\`
0-30 days: ████ (22%)
31-90 days: ███ (18%)
91-180 days: █████ (25%)
180+ days: ███████ (35%)
\`\`\`
**Verdict:** Organic community growth with healthy age distribution.${completionLine}`;
      }

    case 'tweetFocus':
      if (score >= 60) {
        // HIGH RISK - Excessive promotion focus
        return `**Twitter Content Heavily Promotional:**
- **Content Analysis (Last 100 Tweets):**
  - Promotional/Hype: 65 tweets (65%)
  - Price Speculation: 20 tweets (20%)
  - Technical Updates: 8 tweets (8%)
  - Community Engagement: 5 tweets (5%)
  - Educational Content: 2 tweets (2%)
- **Healthy Benchmark:**
  - Educational/Technical should be ≥30%
  - Promotional should be ≤25%
  - **Current ratio is inverted (red flag)**
- **Tweet Examples:**
  **Promotional (Typical):**
  - "🚀🚀🚀 TO THE MOON! Last chance to get in before 100x! Don't miss out! #crypto #moon #gains"
  - "This is IT! The opportunity of a lifetime! Join now or regret forever! 💎🙌"
  - "MASSIVE announcement coming! Get ready for LIFE-CHANGING gains! 🔥🔥🔥"
  **Technical (Rare):**
  - "Smart contract update deployed" (no details provided)
  - "Development continues" (vague, no specifics)
- **Content Quality Metrics:**
  - Average tweet length: 47 characters (mostly emojis)
  - Technical detail level: Very low
  - Educational value: Minimal
  - Emoji-to-word ratio: 1:3 (excessive)
- **Thread Analysis:**
  - 0 technical deep-dive threads
  - 0 development update threads
  - 23 hype threads about price predictions
  - 15 threads about "upcoming announcements"
- **Engagement Pattern:**
  - High engagement on hype posts (bots/mercenaries)
  - Low engagement on rare technical posts
  - Comment section filled with spam
**Red Flag Summary:**
- No substantive technical content
- Purely marketing-focused account
- Matches pump-and-dump Twitter patterns
- Zero educational value for community
**Recommendation:** Avoid. Twitter presence designed to pump price, not build legitimate project.${completionLine}`;
      } else if (score >= 30) {
        // MEDIUM RISK - Leans promotional
        return `**Twitter Content Leans Promotional:**
- **Content Distribution (Last 100 Tweets):**
  - Marketing/Promotional: 40 tweets (40%)
  - Community Content: 30 tweets (30%)
  - Technical Updates: 20 tweets (20%)
  - Educational: 10 tweets (10%)
- **Analysis:**
  - More promotional than ideal (should be ~25%)
  - Some technical content present
  - Could improve educational content ratio
  - Not as bad as pure pump accounts
- **Positive Aspects:**
  - Technical updates included regularly
  - Some development progress shown
  - Community highlights featured
  - Not purely price-focused
- **Areas for Improvement:**
  - Increase technical deep-dives
  - More educational threads
  - Less hype language
  - Focus on utility and use cases
**Recommendation:** Acceptable but monitor for increasing hype over time.${completionLine}`;
      } else {
        // LOW RISK - Balanced content
        return `**Well-Balanced Twitter Content:**
- **Content Distribution (Last 100 Tweets):**
  - Technical Updates: 45 tweets (45%)
  - Educational Content: 30 tweets (30%)
  - Community Highlights: 15 tweets (15%)
  - Marketing: 10 tweets (10%)
- **Content Quality:**
  - Regular development progress threads (weekly)
  - Technical documentation emphasized
  - Educational content for newcomers
  - Minimal price speculation
- **Example High-Quality Threads:**
  **Technical Update Thread (12 tweets):**
  - "Development Update 🧵 This week we optimized gas costs..."
  - Detailed technical explanations
  - Code snippets and diagrams
  - Links to documentation
  **Educational Thread (8 tweets):**
  - "How our protocol works 🧵 Let's dive into the mechanics..."
  - Clear explanations of complex concepts
  - Visual diagrams
  - Use case examples
- **Engagement Quality:**
  - Thoughtful questions in comments
  - Technical discussions encouraged
  - Community members help answer questions
  - High signal-to-noise ratio
- **Content Characteristics:**
  - Average technical thread: 10-15 tweets
  - Detailed explanations with visuals
  - Regular cadence (not just during pumps)
  - Professional tone maintained
**Verdict:** Twitter account serves educational and developmental purpose, not just marketing.${completionLine}`;
      }

    case 'githubAuthenticity':
      if (score >= 60) {
        // HIGH RISK - Copied code
        const repoUrl = projectData.githubRepo || 'github.com/project/repo';
        return `**Code Authenticity Failure:**
- **Repository: ${repoUrl}**
- **Fork Detection Analysis:**
  - 73% code similarity to "OpenZeppelin Generic Template"
  - 85% of contracts copied from existing projects
  - Minimal original development detected
- **File-by-File Breakdown:**
  **contracts/Token.sol:**
  - Similarity: 95% match to StandardERC20.sol
  - Changes: Only token name and symbol
  - Lines changed: 3 out of 247
  **contracts/Staking.sol:**
  - Similarity: 89% match to MasterChef.sol (SushiSwap)
  - Changes: Variable names only
  - Lines changed: 12 out of 389
  **contracts/Router.sol:**
  - Similarity: 92% match to Uniswap V2 Router
  - Changes: Comments removed
  - Lines changed: 7 out of 521
- **Commit Analysis:**
  - Total commits: 47
  - Original commits: 6 (12.7%)
  - Copy-paste commits: 41 (87.3%)
  - Last original contribution: 23 days ago
  - Commit messages: Generic ("update", "fix", "changes")
- **Contributor Activity:**
  - Main developer: ${projectData.teamMembers?.[0]?.name || 'DevUser'} (89% of commits)
  - Contributor 2: 8 commits (all README edits)
  - Contributor 3: 3 commits (comment changes only)
  - No external contributors
  - No pull requests from community
  - Zero code review activity
- **Code Quality Metrics:**
  - Cyclomatic complexity: 2.1/10 (very basic)
  - Test coverage: 0% (no tests written)
  - Documentation: Auto-generated comments only
  - Security analysis: 12 medium-severity vulnerabilities (Slither)
Specific Code Comparison:
\`\`\`solidity
// Their code (contracts/Token.sol, line 45-48):
function transfer(address to, uint256 amount) public returns (bool) {
  _transfer(msg.sender, to, amount);
  return true;
}

// OpenZeppelin ERC20.sol (identical):
function transfer(address to, uint256 amount) public returns (bool) {
  _transfer(msg.sender, to, amount);
  return true;
}
\`\`\`
\`\`\`solidity
// Their code (contracts/Staking.sol, line 127-134):
function deposit(uint256 _pid, uint256 _amount) public {
  PoolInfo storage pool = poolInfo[_pid];
  UserInfo storage user = userInfo[_pid][msg.sender];
  updatePool(_pid);
  // ... rest identical to MasterChef
}

// SushiSwap MasterChef.sol (identical):
function deposit(uint256 _pid, uint256 _amount) public {
  PoolInfo storage pool = poolInfo[_pid];
  UserInfo storage user = userInfo[_pid][msg.sender];
  updatePool(_pid);
  // ... exact same implementation
}
\`\`\`
Innovation Score: 0/10
No novel algorithms
No unique features
No improvements over templates
Pure copy-paste with rebranding
Conclusion: This is not original development. Project is essentially a branded template with no technical innovation.${completionLine}`;
      } else if (score >= 30) {
        // MEDIUM RISK - Mix of copied and original
        return `**Mixed Code Authenticity:**
Repository: ${projectData.githubRepo || 'github.com/project/repo'}
Code Origin Analysis:
Original code: 50%
Forked/template code: 40%
Third-party libraries: 10%
Development Activity:
Total commits: 156
Regular contribution pace: 15-20 commits/month
Contributors: 2-3 regular developers
Some community pull requests
Positive Indicators:
Some original architectural decisions
Custom features beyond templates
Active development ongoing
Code quality improving over time
Concerns:
Heavy reliance on existing frameworks
Limited novel implementation
Test coverage: 45% (should be 80%+)
Some copied code without clear attribution
Code Quality:
Complexity: Average (5/10)
Documentation: Basic but present
Security: Some best practices followed
Recommendation: Team shows ability to build on existing code but limited innovation demonstrated.${completionLine}`;
      } else {
        // LOW RISK - Mostly original
        return `**Authentic Original Development:**
Repository: ${projectData.githubRepo || 'github.com/project/repo'}
Code Authenticity Metrics:
Original code: 85%
Novel implementations: 65%
Template/library usage: 15% (appropriate)
Development Quality:
Total commits: 1,247
Active development: 40-60 commits/month
Core contributors: 5 developers
Community contributors: 12 regular
Pull requests: 89 merged, 23 open
Innovation Indicators:
Novel consensus mechanism implementation
Original cryptographic primitives
Custom gas optimization techniques
Unique smart contract patterns
Code Quality Excellence:
Test coverage: 94%
Documentation: Comprehensive with examples
Code review: All PRs reviewed by 2+ developers
Security: Regular audits, no critical issues
Complexity score: 9/10 (sophisticated)
Technical Achievements:
3 peer-reviewed papers published
Conference presentations on novel approaches
Open-source contributions to other projects
Industry recognition for innovation
Commit Quality:
Detailed commit messages
Clear development roadmap
Regular refactoring
Continuous improvement visible
Verdict: Genuine technical innovation with high-quality original development.${completionLine}`;
      }

    case 'busFactor':
      if (score >= 60) {
        // HIGH RISK - Single point of failure
        return `**Critical Single Point of Failure:**
Dependency Analysis:
Lead Developer "${projectData.teamMembers?.[0]?.name || 'DevLead'}"
• 89% of all commits (1,247 out of 1,402 total)
• Only person with admin access
• Sole holder of deployment keys
• Controls all infrastructure access
Commit Distribution:
Developer 1 (Lead): 89% of commits
Developer 2: 8% of commits (mostly documentation)
Developer 3: 3% of commits (minor bug fixes)
Others: 0% meaningful contributions
Critical Knowledge Concentration:
Core protocol logic: 1 person understands
Smart contract architecture: 1 person designed
Deployment procedures: 1 person knows
Infrastructure setup: 1 person manages
Access Control Issues:
GitHub admin: 1 person
AWS infrastructure: 1 person
Domain registrar: 1 person
Treasury multisig: Requires lead dev signature
Social media accounts: 1 person has passwords
Documentation Gaps:
No succession plan documented
No knowledge transfer procedures
No redundancy planning
Critical processes undocumented
Risk Scenarios:
If Lead Developer Leaves:
Protocol upgrades: IMPOSSIBLE
Bug fixes: SEVERELY DELAYED
Infrastructure issues: CANNOT RESOLVE
Smart contract issues: NO ONE QUALIFIED
Project continuation: QUESTIONABLE
If Lead Developer Unavailable (illness, accident):
Emergency responses: IMPOSSIBLE
Security incidents: CANNOT ADDRESS
Community support: SEVERELY LIMITED
Historical Precedent:
Lead developer took 2-week vacation → project stalled
No commits during absence
Community questions unanswered
Bug reports accumulated
Team Dependencies:
No cross-training evident
No pair programming practices
No code review culture
Single points of failure throughout
Bus Factor Score: 1 (Critical)
Industry standard: 3-5 core contributors
Healthy projects: No person >30% of contributions
This project: 89% single contributor
Conclusion: Extreme vulnerability. Project would likely fail if lead developer departed.${completionLine}`;
      } else if (score >= 30) {
        // MEDIUM RISK - Limited distribution
        return `**Moderate Development Concentration:**
Contributor Analysis:
Primary developer: 45% of commits
Secondary developer: 35% of commits
Tertiary developer: 15% of commits
Others: 5% of commits
Knowledge Distribution:
Core logic: 2 people understand
Infrastructure: 2 people have access
Deployment: 2 people can execute
Code review: Usually 1-2 reviewers
Access Control:
GitHub admin: 2 people
AWS/Infrastructure: 2 people
Multisig treasury: 3 of 5 signers
Redundancy exists but limited
Concerns:
Still concentrated among 2-3 people
Limited succession planning
Some single points of failure remain
Could benefit from broader distribution
Positive Signs:
Multiple people can maintain project
Some redundancy in critical areas
Knowledge sharing occurs
Team can function if one person leaves
Bus Factor: 2-3 (Manageable but could improve)
Recommendation: Adequate for current stage but should expand core team.${completionLine}`;
      } else {
        // LOW RISK - Well distributed
        return `**Healthy Development Distribution:**
Contributor Profile:
5 core contributors
No single contributor >30% of commits
Balanced workload distribution:
• Developer A: 22%
• Developer B: 19%
• Developer C: 18%
• Developer D: 16%
• Developer E: 14%
• Community: 11%
Knowledge Distribution:
Core protocol: 3+ people fully understand
Each major component: 2+ people expert
Cross-training documented and practiced
Regular knowledge sharing sessions
Access & Security:
GitHub admin: 3 people
Infrastructure access: 4 people
Deployment keys: 3 of 5 multisig
Social media: Shared team access
Treasury: 4 of 7 multisig
Succession Planning:
Documented procedures for all critical tasks
Onboarding documentation complete
Regular cross-training exercises
Clear escalation procedures
Development Practices:
All PRs require 2+ reviewers
Pair programming encouraged
Weekly knowledge sharing sessions
Comprehensive documentation maintained
Resilience Testing:
Team members take vacations regularly
Project continues during absences
Emergency procedures tested
Backup systems verified
Community Involvement:
12 regular community contributors
34 merged community pull requests
Active code review from community
Open development process
Bus Factor: 5+ (Excellent)
Industry best practice: 3-5
Project can survive loss of any single member
Strong redundancy throughout
Verdict: Project has healthy distribution of knowledge and responsibility. Low single-point-of-failure risk.${completionLine}`;
      }

    case 'artificialHype':
      if (score >= 60) {
        // HIGH RISK - Fake engagement
        return `**Artificial Engagement Detected:**
Engagement Anomalies:
Follower Analysis:
Total followers: 18,247
Suspicious followers: 13,456 (74%)
Characteristics of suspicious accounts:
• 0-5 followers themselves
• Following 500-2,000 accounts
• No profile picture or generic image
• Created within same 2-week period
• No organic posting activity
Like-to-Comment Ratio Analysis:
Typical Post Engagement:
• Likes: 2,847
• Comments: 22
• Ratio: 129:1 (Organic average: 10-15:1)
Pattern Evidence:
• Likes arrive in batches (200-300 within minutes)
• Comments are generic ("Great project!", "To the moon!")
• 45% of comments are identical or near-identical
• Comment accounts have no other activity
Follower Spike Analysis:
March 15, 2024: Gained 15,247 followers in 48 hours
No major announcement during this period
No viral content posted
No legitimate reason for organic spike
Pattern:
Normal growth: 50-100 followers/day
Spike days: 7,000-15,000 followers/day
Post-spike: Immediate return to low growth
Classic bot purchase pattern
Engagement Quality Metrics:
SocialBlade Analysis:
Engagement Rate: 0.3% (Healthy: 2-5%)
Follower Quality Score: 23/100
Bot Probability: 87%
Twitter Audit Results:
Real followers: 4,791 (26%)
Fake followers: 13,456 (74%)
Inactive followers: 2,134 (12%)
Geographic Distribution:
67% of followers from countries known for bot farms
• Indonesia: 3,247 followers
• Bangladesh: 2,891 followers
• India (suspicious regions): 2,456 followers
Target market (US/EU): Only 18% of followers
Mismatch indicates purchased followers
Activity Pattern Analysis:
Likes Arrival Pattern (Typical Post):
0-5 minutes: 856 likes (bot burst)
5-30 minutes: 1,247 likes (continued bot activity)
30+ minutes: 744 likes (trickle)
Organic pattern: Gradual increase over hours
Observed: Sudden burst then sharp decline
Comment Content Analysis:
Generic comments: 78%
Copy-paste messages: 45%
Thoughtful engagement: 7%
Bot-like responses: 70%
Common Bot Comments:
"Great project! 🚀🚀🚀"
"To the moon! 💎🙌"
"Best team ever! LFG!"
"This will 100x! 📈" (Repeated hundreds of times)
Retweet Analysis:
Average retweets: 847 per post
Organic engagement calculation: ~50-100 expected
90% of retweets from accounts with <10 followers
No personalized retweet comments
Batch retweeting detected (200+ within 5 minutes)
Comparison to Legitimate Projects:
Similar-sized Legitimate Project:
Followers: 20,000
Likes per post: 300-500
Comments per post: 30-60
Ratio: 10:1 (healthy)
This Project:
Followers: 18,247
Likes per post: 2,847
Comments per post: 22
Ratio: 129:1 (artificial)
Evidence Sources:
SocialBlade: socialblade.com/twitter/user/[handle]
Twitter Audit: twitteraudit.com/[handle]
Follower Analysis: Manual sampling of 500 followers
Engagement Tracking: 30-day observation period
Conclusion: Overwhelming evidence of purchased followers, likes, and artificial engagement. Community is not organic.${completionLine}`;
      } else if (score >= 30) {
        // MEDIUM RISK - Some artificial elements
        return `**Mixed Engagement Signals:**
Engagement Metrics:
Like-to-comment ratio: 25:1 (slightly high)
Follower quality: 60% appear organic
Some suspicious patterns but not dominant
Growth rate: Somewhat uneven
Observations:
Occasional follower spikes coincide with announcements
Most engagement appears genuine
Some generic comments but not majority
Mix of quality and low-quality interactions
Positive Indicators:
Many followers have established accounts
Thoughtful comments present
Community discussions occur
Geographic distribution reasonable
Areas of Concern:
Some follower spikes unexplained
Engagement could be more consistent
Some bot-like accounts present
Quality varies significantly
Recommendation: Mostly organic but some artificial enhancement suspected. Not as severe as pure bot operations.${completionLine}`;
      } else {
        // LOW RISK - Organic engagement
        return `**Authentic Organic Engagement:**
Healthy Engagement Metrics:
Follower Quality:
Total followers: 12,456
Real, active followers: 11,234 (90%)
Average follower age: 3.2 years
Average follower count: 247 (healthy range)
Profile completion: 85% have bios and pictures
Engagement Ratios:
Like-to-comment: 12:1 (optimal: 10-15:1)
Engagement rate: 4.2% (excellent: 3-5%)
Quality interaction score: 87/100
Growth Pattern:
Steady growth: 3-5% monthly
No suspicious spikes
Organic correlation with development milestones
Natural retention curve
Comment Quality:
Unique comments: 92%
Average length: 45 words
Technical discussions: 35%
Thoughtful questions: 28%
Generic praise: 12% (normal)
Community Characteristics:
Active discussions in threads
Questions get detailed responses
Community members help each other
Long-form conversation threads common
Geographic Distribution:
Aligned with target markets:
• North America: 35%
• Europe: 40%
• Asia: 20%
• Other: 5%
Matches project focus and language
Engagement Timing:
Likes accumulate gradually over 24-48 hours
Comments spread throughout day
Natural timezone distribution
No burst patterns
SocialBlade Metrics:
Grade: A
Engagement authenticity: 94%
Bot probability: <5%
Growth rate: Healthy and sustainable
Comparison to Industry:
Engagement rate: 4.2% (Industry avg: 2-3%)
Comment quality: Above average
Follower retention: Excellent
Community health: Top 10%
Verdict: Genuine organic community with high-quality engagement. No evidence of artificial manipulation.${completionLine}`;
      }

    case 'founderDistraction':
      if (score >= 60) {
        // HIGH RISK - Founder spread too thin
        return `**Severe Founder Distraction:**
Concurrent Project Management:
Active Projects (Confirmed):
This Project - ${projectData.launchDate ? new Date(projectData.launchDate).toLocaleDateString() : 'Current'}
NFT Collection Launch - Running simultaneously
DeFi Protocol "XYZ" - Still in development
Consulting Business - Active client work
Total: 4 simultaneous major commitments
Time Allocation Analysis (Social Media Activity):
This project: 25% of posts
NFT project: 35% of posts
Personal brand/consulting: 30% of posts
Other ventures: 10% of posts
Technical Contribution Tracking:
This Project:
Last meaningful GitHub commit: 23 days ago
Last technical post: 18 days ago
Last community AMA: 34 days ago
Average response time to technical questions: 4-7 days
Other Projects:
NFT project: Daily commits visible
Consulting clients: Regular Twitter mentions
Personal brand: Daily content posted
Communication Patterns:
Twitter Activity (Last 100 Posts):
This project: 23 posts (23%)
NFT collection: 37 posts (37%)
Personal brand: 28 posts (28%)
General crypto: 12 posts (12%)
Red Flag Examples:
March 15: "Excited to announce my NEW NFT collection! 10k unique pieces, minting soon!"
Posted 3 days after this project's major milestone
No mention of this project
March 22: "Just closed 3 new consulting clients! DM for advisory services!"
Active business competing for time
March 28: "Working on revolutionary new DeFi protocol! Details coming soon!"
Third blockchain project announced
Community Response:
Discord members asking "Where is the founder?"
Technical questions unanswered for days
Development progress slower than promised
Team members report founder unavailability
Commitment Analysis:
Promised vs Actual:
Promised: "Full-time dedication to this project"
Reality: Visible work on 3 other major projects
Promised: "Weekly development updates"
Reality: Last update 3 weeks ago
Promised: "Daily community engagement"
Reality: Responds every 3-5 days
Calendar Analysis:
Conference appearances: 3 in last month (all for other projects)
Podcast interviews: 5 (1 mentioned this project)
Speaking engagements: 4 (0 about this project)
Development Impact:
Roadmap delays: 6 weeks behind schedule
Features cut: 3 major features removed
Team turnover: 2 developers left (cited lack of direction)
Partnership discussions: Stalled (founder not responsive)
Financial Red Flags:
Treasury funds used for founder's other ventures? (Unverified but suspected)
Shared resources across projects
Unclear separation of business interests
Historical Pattern:
Founder's previous project "ABC" abandoned after 8 months
Reason cited: "Moving on to new opportunities"
This project may follow same pattern
Risk Assessment:
Probability founder abandons project: HIGH
Current attention level: 25% or less
Commitment trajectory: Declining
Project sustainability: Questionable
Conclusion: Founder is severely overextended. Project is not receiving necessary attention. High abandonment risk.${completionLine}`;
      } else if (score >= 30) {
        // MEDIUM RISK - Some distraction
        return `**Moderate Founder Distraction:**
Project Portfolio:
This project: Primary focus
Side project: 1 other active venture
Consulting: Occasional work
Time Allocation:
This project: 60-70% of activity
Other projects: 20-30%
Personal/other: 10%
Technical Engagement:
Last GitHub commit: 7 days ago
Response time: 1-2 days
Generally available but not always immediate
Observations:
Founder manages multiple projects
This one appears to be priority
Some delays attributable to divided attention
Not critical but worth monitoring
Positive Signs:
Regular meaningful contributions
Responds to important issues
Progress continues
Team not concerned about availability
Recommendation: Acceptable for current stage but should consolidate focus for critical development phases.${completionLine}`;
      } else {
        // LOW RISK - Fully dedicated
        return `**Full Founder Commitment:**
Project Focus:
This project: 90%+ of professional activity
No competing ventures identified
Clear, singular focus
Technical Engagement:
Last GitHub commit: Today
Average response time: <4 hours
Daily community presence
Weekly development updates
Activity Breakdown (Social Media):
This project: 85% of posts
General industry: 10%
Personal: 5%
Communication Quality:
Regular detailed technical posts
Active in community discussions
Responsive to questions
Transparent about progress and challenges
Development Leadership:
Drives technical decisions
Participates in code reviews
Mentors team members
Sets clear direction
Time Investment Evidence:
GitHub commits: Daily
Discord presence: Multiple times daily
Twitter updates: 2-3x weekly with substance
Team meetings: Regular attendance
AMAs: Monthly and well-prepared
Community Feedback:
"Founder is always available"
"Great communication"
"Clear this is the priority"
High satisfaction with accessibility
Commitment Indicators:
Declined speaking opportunities to focus on development
Turned down consulting clients
No other blockchain projects
Long-term vision clearly articulated
Verdict: Founder demonstrates exceptional commitment and focus. Project receives full attention it deserves.${completionLine}`;
      }

    case 'engagementAuthenticity':
      if (score >= 60) {
        // HIGH RISK - Fake community interaction
        return `**Artificial Community Interaction Detected:**
Message Quality Analysis (1,000 Recent Messages):
Copy-Paste Detection:
Identical messages: 267 (26.7%)
Near-identical (1-2 word changes): 178 (17.8%)
Total low-effort: 445 (44.5%)
Common Copy-Paste Templates:
"Great project! Can't wait for launch! 🚀🚀🚀" (repeated 47 times)
"Best team in crypto! LFG! 💎🙌" (repeated 38 times)
"This will moon! Get in early!" (repeated 52 times)
"Amazing community! 🔥" (repeated 31 times)
Reply Analysis:
Average Reply Characteristics:
Length: 8 words (Organic average: 25-40 words)
Unique content: 55%
Substantive responses: 23%
Generic reactions: 77%
Question Response Rate:
Technical questions asked: 89
Questions answered meaningfully: 21 (23.6%)
Questions ignored: 42 (47.2%)
Generic non-answers: 26 (29.2%)
Healthy benchmark: 70%+ meaningful response rate
Engagement Distribution:
Top 10 Community Members:
Generate 78% of all messages
Other 890 members: 22% of messages
Natural distribution: 30-40% from top 10
Current: Heavily concentrated (red flag)
Participation Quality Metrics:
Content Type Breakdown:
Price speculation: 47%
Generic hype: 31%
Technical discussion: 12%
Useful community help: 10%
Bot Behavior Indicators:
Suspicious Patterns:
34 accounts post same message within 5-minute window
127 accounts never deviate from 3-4 phrase templates
89 accounts only post during coordinated time windows
156 accounts have never asked a question
Conversation Thread Analysis:
Typical Exchange:
User A: "When moon?"
User B: "Soon! 🚀"
User C: "To the moon! 💎"
User D: "LFG! 🔥"
No actual information exchanged
No meaningful discussion
Pure noise
Healthy Exchange (Rarely Seen):
User: "How does the staking mechanism work?"
Mod: [No response for 3 days]
Help Quality Assessment:
Support Ticket Analysis:
Questions asking for technical help: 67
Questions answered with useful info: 12 (18%)
Questions answered with "DYOR": 23 (34%)
Questions ignored: 32 (48%)
Red Flag Examples:
Discord Screenshot Evidence:
March 15, 10:47 AM: 23 users post variations of "great project" within 3 minutes
March 18, 2:15 PM: 17 users post identical rocket emojis in sequence
March 22, 8:23 PM: Coordinated "LFG" spam from 31 accounts
Community Value Metrics:
Information Quality:
Useful information shared: 8% of messages
Redundant hype: 62% of messages
Spam/noise: 30% of messages
Healthy benchmark:
Useful information: 40-50%
Community building: 30-40%
Off-topic/casual: 10-20%
Comparison to Legitimate Projects:
Similar Project with Real Community:
Average message length: 42 words
Copy-paste rate: 5%
Question response rate: 76%
Top 10 contributor share: 32%
This Project:
Average message length: 8 words
Copy-paste rate: 45%
Question response rate: 23%
Top 10 contributor share: 78%
Evidence Summary:
High copy-paste rate (45% vs healthy 5%)
Low message quality (8 words vs healthy 25-40)
Poor question response (23% vs healthy 70%+)
Concentrated engagement (78% vs healthy 30-40%)
Conclusion: Community interaction is largely artificial. Real users receive minimal support. Engagement designed for appearance, not value.${completionLine}`;
      } else if (score >= 30) {
        // MEDIUM RISK - Mixed authenticity
        return `**Mixed Community Authenticity:**
Engagement Analysis:
Unique replies: 60%
Copy-paste content: 20%
Moderate quality: 20%
Reply Characteristics:
Average length: 22 words
Some thoughtful responses
Some generic content
Question response rate: 50%
Community Participation:
Distribution: Moderately concentrated
Top contributors: 45% of messages
Good mix of voices
Some authentic discussions
Areas for Improvement:
Increase response quality
Encourage deeper discussions
Reduce generic comments
Better question handling
Assessment: Community shows mix of authentic and surface-level engagement. Not ideal but not suspicious.${completionLine}`;
      } else {
        // LOW RISK - Authentic engagement
        return `**High-Quality Authentic Engagement:**
Message Quality Analysis (1,000 Recent Messages):
Content Uniqueness:
Unique, thoughtful messages: 85%
Helpful information sharing: 12%
Casual social: 3%
Copy-paste/spam: <1%
Reply Characteristics:
Average Reply Quality:
Length: 47 words (well-developed thoughts)
Technical accuracy: High
Helpfulness: Excellent
Personalization: 92% unique
Question Response Analysis:
Technical Questions:
Questions asked: 127
Meaningful answers provided: 104 (82%)
Average response time: 3.2 hours
Follow-up discussions: 78%
Quality of Answers:
Detailed explanations with examples
Links to documentation
Community members help each other
Moderators provide expert input
Participation Distribution:
Engagement Spread:
Top 10 contributors: 28% of messages (healthy)
Next 40 contributors: 42% of messages
Long tail: 30% of messages
Natural healthy distribution
Discussion Quality Examples:
Typical Technical Exchange:
User A: "I'm confused about how the staking rewards are calculated. Can someone explain the formula?"
Mod: "Great question! The formula is: rewards = (stake_amount × APY × time_staked) / (365 × total_staked). Here's a detailed thread explaining each variable: [link]"
User B: "To add to that, I created a calculator here: [link]. You can input your stake amount and see estimated rewards."
User A: "Thank you both! This is super helpful. So if I stake 1000 tokens for 6 months at current APY..."
Mod: "Exactly! Let me know if you have other questions."
Real information exchanged
Multiple participants helping
Substantive follow-up discussion
Community Value Metrics:
Content Type Distribution:
Technical discussions: 35%
Community support: 28%
Project updates discussion: 22%
Social/casual: 12%
Off-topic: 3%
Help Quality:
Support Effectiveness:
Help requests: 89
Successfully resolved: 82 (92%)
Average resolution time: 4.7 hours
User satisfaction: High (based on feedback)
Engagement Depth:
Conversation Threads:
Average thread length: 12 messages
Meaningful back-and-forth
Questions lead to explanations
Community members mentor newcomers
Community Characteristics:
Positive Indicators:
Members teach each other
Technical accuracy valued
Friendly, welcoming atmosphere
Constructive criticism welcomed
Moderators accessible and helpful
Activity Patterns:
Consistent participation across time zones
No coordinated posting
Natural conversation flow
Questions answered at all hours
Comparison to Healthy Communities:
Message quality: Above average
Response rates: Excellent (82% vs benchmark 70%)
Engagement distribution: Optimal
Help effectiveness: Outstanding (92%)
Verdict: Genuine, high-value community with authentic interactions. Members actively help each other. Strong foundation for project success.${completionLine}`;
      }

    case 'tokenomics':
      if (score >= 60) {
        // HIGH RISK - Exploitative distribution
        const contractAddress = projectData.tokenContract || '0x742d...a8f3';
        return `**Critical Tokenomics Red Flags:**
Token Contract: ${contractAddress}
Distribution Analysis:
Team Allocation: 35% (⚠️ Standard: 15-20%)
Wallet Breakdown:
0x742d...a8f3 (Team Multisig): 15% (150M tokens)
0x8b3e...9c21 (Founder Wallet): 12% (120M tokens)
0x3f21...7a9d (Advisors): 8% (80M tokens)
Total Team Control: 35%
Vesting Schedule: 3 months (⚠️ Standard: 24-48 months)
Unlock Timeline:
Launch: 20% unlocked immediately
Month 1: Additional 30% unlocked
Month 2: Additional 30% unlocked
Month 3: Final 20% unlocked (100% liquid)
Risk: Team can dump entire allocation in 90 days
Liquidity Analysis:
Liquidity Lock:
Amount locked: $250,000
Duration: 6 months only (Standard: 24+ months)
Lock contract: "QuickLock Protocol" (unaudited)
Warning: Lock can be extended OR cancelled
Liquidity Depth:
Current liquidity: $180,000
Market cap: $12M
Liquidity ratio: 1.5% (Should be 10%+)
Risk: Extremely shallow liquidity
Whale Concentration:
Top Holders Distribution:
0x742d...a8f3: 18.5% (185M tokens)
0x8b3e...9c21: 15.2% (152M tokens)
0x3f21...7a9d: 13.8% (138M tokens)
0x9d44...2b7c: 11.3% (113M tokens)
0x1a82...5e9f: 8.2% (82M tokens)
Top 5: 67% of total supply
Top 20: 89% of total supply
Risk Calculation:
If top 5 wallets dump: Price drop estimated at 90%+
Coordinated exit would completely crash token
Retail investors would be unable to exit
Early Investor Terms:
Presale Details:
Presale price: $0.06
Launch price: $0.10
Discount: 40%
Unlock: IMMEDIATE (no vesting!)
Profit Potential:
Current price: $0.12
Presale ROI: 100% (2x)
If reaches $0.60: 1000% (10x)
Dump Risk:
Presale raised: $2.4M
Current value: $4.8M
Incentive to dump: $2.4M profit available immediately
Private Sale Analysis:
Tier 1 (VCs):
Price: $0.04
Allocation: 10% (100M tokens)
Vesting: 6 months (way too short)
First unlock: ${projectData.launchDate ? new Date(new Date(projectData.launchDate).getTime() + 1802460601000).toISOString().split('T')[0] : '6 months from launch'}
Profit potential: 200-300% locked in
Missing Protections:
No Buy-Back Mechanism:
No treasury allocation for price support
No automatic buy-back function
No floor price protection
No Burn Schedule:
No deflationary mechanism
Total supply remains constant
No token sink to reduce circulation
No Anti-Whale Limits:
No max transaction size
No wallet holding limits
No cooldown periods
Whales can dump unlimited amounts
No Transaction Taxes:
No sell tax to discourage dumping
No reflection to holders
No liquidity generation
On-Chain Evidence:
Contract Analysis (Etherscan):
View contract: etherscan.io/token/${contractAddress}
Top holders: etherscan.io/token/${contractAddress}#balances
Liquidity pool: uniswap.info/pair/0x...
Lock contract: app.quicklock.com/lock/0x...
Transaction History:
Large transfers detected: 23 transfers >1M tokens
Wallet clustering: Evidence of related wallets
Suspicious patterns: Tokens moving between team wallets
Comparison to Healthy Tokenomics:
This Project:
Team allocation: 35%
Vesting: 3 months
Liquidity lock: 6 months
Top 5 holders: 67%
Industry Standard:
Team allocation: 15-20%
Vesting: 24-48 months
Liquidity lock: 24+ months
Top 5 holders: <25%
Economic Model Flaws:
Utility Analysis:
Token use cases: Governance only (weak)
Revenue sharing: None
Staking rewards: From inflation (not sustainable)
Burn mechanism: None
Sustainability:
No revenue generation
No value accrual mechanism
Relies entirely on new buyers
Classic pump-and-dump economics
Price Impact Simulation:
Scenario 1: Single Whale Dumps
Whale sells 10% of supply (100M tokens)
Current liquidity: $180K
Price impact: -78%
Resulting price: $0.026 (from $0.12)
Scenario 2: Team Exits After Vesting
Month 3: Team fully vested (350M tokens)
Team sells 50% (175M tokens)
Price impact: -95%+
Token effectively dead
Historical Precedent:
Similar Projects:
"SquidGame Token": 97% team allocation, rug pulled
"SaveTheKids": 30% team, dumped after 1 month
"SQUID": No liquidity, exit scam
This project shares characteristics:
High team allocation ✓
Short vesting ✓
Weak liquidity ✓
No protections ✓
Risk Assessment:
Dump probability: EXTREMELY HIGH
Sustainability: NONE
Investor protection: ZERO
Long-term viability: NONEXISTENT
Conclusion: Tokenomics designed to maximize team profit at expense of investors. All signs point to eventual rug pull or coordinated dump. AVOID.${completionLine}`;
      } else if (score >= 30) {
        // MEDIUM RISK - Acceptable but not optimal
        return `**Acceptable Tokenomics with Concerns:**
Token Contract: ${projectData.tokenContract || '0x...'}
Distribution:
Team allocation: 20-25%
Vesting: 12-18 months
Liquidity lock: 12 months
Top 10 wallets: 35-45%
Positive Aspects:
Team allocation within acceptable range (upper limit)
Some vesting protection exists
Liquidity is locked
Distribution not terrible
Concerns:
Vesting could be longer (24+ months ideal)
Moderate whale concentration
Limited token utility
No deflationary mechanisms
Missing Elements:
Could benefit from buy-back program
Anti-whale protections would help
More robust utility needed
Longer liquidity lock preferable
Assessment: Not ideal but manageable. Acceptable risk for speculative investment but not for long-term hold.${completionLine}`;
      } else {
        // LOW RISK - Strong tokenomics
        return `**Healthy Sustainable Tokenomics:**
Token Contract: ${projectData.tokenContract || '0x...'}
Fair Distribution:
Allocation Breakdown:
Public sale: 35%
Ecosystem/Development: 25%
Team: 15% (vested 48 months)
Advisors: 5% (vested 24 months)
Liquidity: 15%
Marketing: 5%
Team Vesting Structure:
12-month cliff (no tokens for first year)
Linear vesting over 48 months after cliff
Total lock period: 60 months
No team dumps possible for years
Liquidity Protection:
Liquidity Lock:
Amount: $2.5M (20% of initial market cap)
Duration: 24 months (renewable)
Lock contract: Audited by CertiK
Multi-sig controlled: 5 of 9 signers required
Depth Analysis:
Liquidity-to-market-cap: 12% (excellent)
Slippage for $10K trade: 0.8% (very good)
Price impact protection: Strong
Decentralized Supply:
Top Holders:
Top 5 wallets: 18% of supply
Top 20 wallets: 42% of supply
No single wallet >6%
Healthy distribution curve
Wallet Categories:
Known team wallets: Locked per vesting
DEX liquidity: 15%
CEX holdings: 12%
Staking contracts: 23%
Retail holders: 50%
Token Utility & Value Accrual:
Use Cases:
Governance: Vote on protocol changes
Staking: Earn yield from protocol revenue
Fee Discounts: Reduced trading fees
Revenue Share: 50% of protocol fees distributed
Collateral: Use in lending protocols
Revenue Model:
Protocol generates $500K/month in fees
50% distributed to stakers
Creates real yield (not inflation)
Sustainable economics
Deflationary Mechanisms:
Burn Schedule:
2% of all transaction fees burned
Quarterly buyback and burn from treasury
Current burn rate: 0.5% of supply per year
Target: Reduce supply to 80% over 5 years
Burn History:
Total burned: 15M tokens (3% of supply)
Verifiable on-chain: etherscan.io/token/${projectData.tokenContract || '0x...'}/burns
Consistent quarterly burns executed
Investor Protections:
Anti-Whale Measures:
Max transaction: 0.5% of supply per trade
Cooldown period: 1 hour between large sells
Gradual unwinding required for large positions
Price Stability Mechanisms:
Treasury buy-back fund: $1.2M allocated
Automatic buy-back triggers at -20% weekly drop
Circuit breakers: Trading paused if >30% hourly drop
Transparency:
All team wallets publicly disclosed
Vesting schedule on-chain and verifiable
Treasury transactions published monthly
Audit reports publicly available
Economic Sustainability:
Revenue Streams:
Trading fees: $300K/month
Staking fees: $150K/month
Partnership revenue: $50K/month
Total: $500K/month sustainable income
Staking APY:
Current: 12% (from real yield, not inflation)
Sustainable long-term: 8-10%
Not dependent on new buyers
Backed by actual protocol revenue
Vesting Schedule Verification:
Smart Contract Enforced:
Vesting contract audited: certik.io/projects/${projectData.tokenContract || 'token'}
Immutable unlock schedule
No admin backdoors
Transparent and verifiable
Team Unlock Timeline:
Year 1: 0% unlocked (cliff)
Year 2: 25% unlocked (linear)
Year 3: 50% unlocked (linear)
Year 4: 75% unlocked (linear)
Year 5: 100% unlocked (linear)
Comparison to Best Practices:
This Project:
Team allocation: 15% ✓
Vesting: 48 months ✓
Liquidity lock: 24 months ✓
Top 5 holders: 18% ✓
Real utility: Yes ✓
Revenue model: Yes ✓
Burn mechanism: Yes ✓
Anti-whale: Yes ✓
Industry Leaders (Uniswap, Aave, etc.):
All criteria met ✓
Long-term Viability:
Self-sustaining revenue model
Real value accrual to token holders
Deflationary pressure over time
Strong liquidity protection
Aligned incentives (team locked for years)
Verdict: Exemplary tokenomics. Strong investor protections, sustainable economics, fair distribution. Built for long-term success, not pump-and-dump.${completionLine}`;
      }

    default:
      return `Analysis complete. No specific metric matched.${completionLine}`;
  }
};




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
  
  // Add this function inside the Home component, before the return statement
const getRewardsForMode = (mode: UserMode | null): Reward[] => {
  if (!mode) return []; // Return empty array if no mode selected
 
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

  // ✅ ADD THIS NEW FUNCTION:
const handleNewSubmission = useCallback(() => {
  if (!isLoggedIn) {
    setShowAuthModal(true);
    return;
  }
   setShowTrackingDashboard(false);  // ✅ ADD THIS LINE - Close dashboard first
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ResearcherDashboard
          onAnalyze={handleResearcherAnalyze}
          userEmail={userEmail}
          
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
        const mockMetrics = createMetricsArray();
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
              instanceId="main-analysis" // ✅ ADD THIS
                metrics={detailedMetrics}  // ✅ Use the state that has detailed evidence!
                projectName={verdictData.projectName}
                riskScore={verdictData.riskScore}
                projectData={projectData || undefined}  // ✅ Convert null to undefined
                onExport={() => {
                  if (projectData) {
                    ExportService.exportMetricsToCSV(detailedMetrics, projectData.displayName);
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
                Login or create an account to access Sifter 1.0 and choose your workflow mode.
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
              instanceId="main-analysis" // ✅ ADD THIS
                metrics={detailedMetrics}  // ✅ Use the state that has detailed evidence!
                projectName={verdictData.projectName}
                riskScore={verdictData.riskScore}
                projectData={projectData || undefined}  // ✅ Convert null to undefined
                onExport={() => {
                  if (projectData) {
                    ExportService.exportMetricsToCSV(detailedMetrics, projectData.displayName);
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
                  onNewSubmission={handleNewSubmission}  // ← ADD THIS LINE
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
                // Deduct points
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
          
          {selectedEntityForDispute.length > 0 ? (
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
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-gray-400 mb-4">No entity selected for dispute</p>
              <button
                onClick={() => setShowDisputeForm(false)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
              >
                Close
              </button>
            </div>
          )}
        </div>{showDisputeForm && (
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
          
          {/* ONLY DisputeForm - no other components */}
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
                  <h1 className="text-xl font-bold text-white">SIFTER 1.0</h1>
                  {userMode && (
                    <p className="text-xs text-gray-500">{getModeDisplayName(userMode)}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                {/* Data Donation Button */}
  {isLoggedIn && userMode && (
  <div className="hidden md:flex items-center gap-2">
    {/* Desktop: Show all buttons in a row */}
    <button
      onClick={() => setShowTrackingDashboard(true)}
      className="px-3 py-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 
               border border-amber-500/30 rounded-lg font-medium text-xs transition-colors 
               flex items-center justify-center gap-1.5 whitespace-nowrap h-9"
    >
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      <span>Data Donation</span>
      {userPoints > 0 && (
        <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
          {userPoints} pts
        </span>
      )}
    </button>
    
    <button
      onClick={() => setShowPointsDisplay(true)}
      className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
               text-white rounded-lg font-medium text-xs transition-all 
               flex items-center justify-center gap-1.5 whitespace-nowrap h-9"
    >
      <span>🏆</span>
      <span>Points & Rewards</span>
    </button>

    <button
      onClick={() => setShowDisputeForm(true)}
      className="px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 
               text-white rounded-lg font-medium text-xs transition-all 
               flex items-center justify-center gap-1.5 whitespace-nowrap h-9"
    >
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3l-6.928-12c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>Submit Dispute</span>
    </button>

    <button
      onClick={() => setShowSubmissionForm(true)}
      className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
               text-white rounded-lg font-medium text-xs transition-all 
               flex items-center justify-center gap-1.5 whitespace-nowrap h-9"
    >
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Submit Report</span>
    </button>
  </div>
)}

{/* Mobile: Show dropdown menu */}
{isLoggedIn && userMode && (
   <div className="md:hidden relative mobile-data-menu">
    <button
      onClick={() => setShowMobileDataMenu(!showMobileDataMenu)}
      className="p-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 
               border border-amber-500/30 rounded-lg transition-colors relative"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
      </svg>
      {userPoints > 0 && (
        <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
          {userPoints}
        </span>
      )}
    </button>
    
    {showMobileDataMenu && (
      <div className="absolute right-0 top-full mt-2 w-56 bg-sifter-card border border-sifter-border rounded-lg shadow-xl z-50">
        <div className="p-2 space-y-1">
          <button
            onClick={() => {
              setShowTrackingDashboard(true);
              setShowMobileDataMenu(false);
            }}
            className="w-full text-left px-3 py-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm">Data Donation</span>
          </button>
          
          <button
            onClick={() => {
              setShowPointsDisplay(true);
              setShowMobileDataMenu(false);
            }}
            className="w-full text-left px-3 py-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>🏆</span>
            <span className="text-sm">Points & Rewards</span>
          </button>
          
          <button
            onClick={() => {
              setShowDisputeForm(true);
              setShowMobileDataMenu(false);
            }}
            className="w-full text-left px-3 py-2 text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3l-6.928-12c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm">Submit Dispute</span>
          </button>
          
          <button
            onClick={() => {
              setShowSubmissionForm(true);
              setShowMobileDataMenu(false);
            }}
            className="w-full text-left px-3 py-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">Submit Report</span>
          </button>
        </div>
      </div>
    )}
  </div>
)}
  
  
  {isLoggedIn && userMode && (
    <div className="flex items-center gap-2 ml-2 pl-2 border-l border-sifter-border">
      <div className={`px-2.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
        userMode === 'ea-vc' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
        userMode === 'researcher' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
        'bg-green-500/20 text-green-400 border border-green-500/30'
      }`}>
        {getModeDisplayName(userMode)}
      </div>
      <div className="text-right">
        <p className="text-xs font-medium text-white truncate max-w-[120px]">{userName}</p>
        <p className="text-xs text-gray-500 truncate max-w-[120px]">{userEmail}</p>
      </div>
      <button
        onClick={handleLogout}
        className="text-gray-400 hover:text-white text-xs hover:bg-gray-800/50 
                 px-2.5 py-1.5 rounded-lg transition-colors font-medium h-9 
                 flex items-center justify-center"
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
                <span className="font-medium text-gray-400">SIFTER 1.0</span> - Automated Project Due Diligence
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
