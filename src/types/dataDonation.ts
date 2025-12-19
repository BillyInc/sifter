// Data Donation Core Types

// Enums
export type EntityType = 'marketing-agency' | 'advisor-consultant' | 'influencer-kol' | 'team-member';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type SubmissionStatus = 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'needs-info';
export type UserMode = 'ea-vc' | 'researcher' | 'individual';
export type SubmissionTier = 'quick' | 'standard' | 'full';
export type EvidenceStatus = 'pending' | 'verified' | 'disputed' | 'invalid';
export type UserTier = 'tier-1' | 'tier-2' | 'tier-3';

// Evidence Types
export type EvidenceType = 
  | 'twitter_post' | 'reddit_thread' | 'blockchain_transaction' 
  | 'news_article' | 'archived_website' | 'portfolio_page'
  | 'linkedin_profile' | 'discord_export' | 'telegram_export'
  | 'email_correspondence' | 'legal_document' | 'press_release'
  | 'audit_report' | 'github_commit' | 'financial_record'
  | 'contract_document' | 'confidential_source' | 'pattern_analysis'
  | 'data_analysis' | 'academic_source' | 'personal_experience';

// Core Interfaces
export interface SubmissionFormData {
  id?: string;
  entityType: EntityType;
  entityDetails: {
    fullName: string;
    twitterHandle?: string;
    telegramHandle?: string;
    linkedinProfile?: string;
    website?: string;
  };
  affectedProjects: Array<{
    id?: string;
    projectName: string;
    incidentDescription: string;
    date: string; // MM/YYYY
    evidence?: string[];
  }>;
  evidence: Array<{
    id?: string;
    url: string;
    description: string;
    type?: EvidenceType;
    status?: EvidenceStatus;
  }>;
  submitterInfo: {
    email: string;
    name?: string;
    anonymous: boolean;
    acknowledgements: boolean[];
  };
  mode?: UserMode;
  status?: SubmissionStatus;
  caseId?: string;
  submittedAt?: string;
  confidenceScore?: number;
}

export interface SubmissionStatusData {
  id: string;
  caseId: string;
  entityName: string;
  status: SubmissionStatus;
  submittedAt: Date;
  estimatedReview: Date;
  impact?: number;
}

export interface UserPointsData {
  availablePoints: number;
  pointsInPool: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  currentMultiplier: number;
  tier: UserTier;
  nextMilestone?: {
    pointsNeeded: number;
    reward: string;
  };
}

export interface EvidenceItem {
  id: string;
  entityId: string;
  type: EvidenceType;
  originalUrl: string;
  archivedUrl?: string;
  screenshotUrl?: string;
  ipfsHash?: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  status: EvidenceStatus;
  submittedBy: string;
  verifiedBy?: string;
  submittedAt: Date;
}

// Flag Submission Types
export interface QuickFlagData {
  entityName: string;
  context: string;
  mode: UserMode;
  severity?: SeverityLevel;
  reason?: string;
  portfolioContext?: string;
  methodologyNotes?: string;
  points: number;
}

export interface StandardFlagData {
  evidence: string[];
  description: string;
  severity: SeverityLevel;
}

export interface FlagSubmissionData {
  tier: SubmissionTier;
  mode: UserMode;
  entityName: string;
  context: string;
  projectName?: string;
  riskScore?: number;
  
  // Tier-specific data
  quickData?: QuickFlagData;
  standardData?: StandardFlagData;
  fullData?: SubmissionFormData;
  
  // Metadata
  points: number;
  timestamp: string;
  submissionId?: string;
}

// VC-specific Types
export interface VCPortfolioItem {
  id: string;
  name: string;
  status: 'active' | 'exited' | 'considering' | 'rejected';
  investedAmount?: number;
  dateAdded: string;
}

// Mode Configuration
export interface ModeConfig {
  // Submission
  minEvidenceRequired: number;
  allowedEvidenceTypes: EvidenceType[];
  formComplexity: 'simple' | 'standard' | 'advanced';
  
  // Review
  reviewSLA: string; // e.g., "12-24h"
  reviewMethod: 'auto' | 'peer' | 'admin' | 'hybrid';
  autoApproveThreshold: number;
  autoRejectThreshold: number;
  
  // Points
  pointMultiplier: number;
  basePoints: {
    quick: number;
    standard: number;
    full: number;
  };
  
  // Features
  features: {
    bulkUpload: boolean;
    apiAccess: boolean;
    confidentialUpload: boolean;
    portfolioIntegration: boolean;
    methodologyRequired: boolean;
    templateLibrary: boolean;
    socialMediaIntegration: boolean;
  };
}

// Mode Configuration Constants
export const MODE_CONFIGS: Record<UserMode, ModeConfig> = {
  'ea-vc': {
    minEvidenceRequired: 4,
    allowedEvidenceTypes: [
      'legal_document', 'financial_record', 'contract_document',
      'email_correspondence', 'confidential_source', 'portfolio_page',
      'twitter_post', 'reddit_thread', 'news_article', 'archived_website'
    ],
    formComplexity: 'advanced',
    reviewSLA: '12-24h',
    reviewMethod: 'hybrid',
    autoApproveThreshold: 85,
    autoRejectThreshold: 20,
    pointMultiplier: 5,
    basePoints: { quick: 50, standard: 500, full: 2500 },
    features: {
      bulkUpload: true,
      apiAccess: true,
      confidentialUpload: true,
      portfolioIntegration: true,
      methodologyRequired: false,
      templateLibrary: false,
      socialMediaIntegration: false
    }
  },
  'researcher': {
    minEvidenceRequired: 3,
    allowedEvidenceTypes: [
      'data_analysis', 'pattern_analysis', 'academic_source',
      'blockchain_transaction', 'github_commit', 'audit_report',
      'twitter_post', 'reddit_thread', 'news_article', 'archived_website'
    ],
    formComplexity: 'advanced',
    reviewSLA: '24-48h',
    reviewMethod: 'peer',
    autoApproveThreshold: 75,
    autoRejectThreshold: 30,
    pointMultiplier: 3,
    basePoints: { quick: 30, standard: 300, full: 1500 },
    features: {
      bulkUpload: false,
      apiAccess: false,
      confidentialUpload: false,
      portfolioIntegration: false,
      methodologyRequired: true,
      templateLibrary: false,
      socialMediaIntegration: false
    }
  },
  'individual': {
    minEvidenceRequired: 2,
    allowedEvidenceTypes: [
      'twitter_post', 'reddit_thread', 'news_article',
      'archived_website', 'personal_experience'
    ],
    formComplexity: 'simple',
    reviewSLA: '48-72h',
    reviewMethod: 'admin',
    autoApproveThreshold: 60,
    autoRejectThreshold: 40,
    pointMultiplier: 1,
    basePoints: { quick: 10, standard: 100, full: 500 },
    features: {
      bulkUpload: false,
      apiAccess: false,
      confidentialUpload: false,
      portfolioIntegration: false,
      methodologyRequired: false,
      templateLibrary: true,
      socialMediaIntegration: true
    }
  }
};

// Utility Types
export type ModeFeatures = keyof ModeConfig['features'];
export type ReviewMethod = ModeConfig['reviewMethod'];
export type FormComplexity = ModeConfig['formComplexity'];

// Helper Type for Partial Updates
export type PartialSubmissionFormData = Partial<SubmissionFormData> & {
  id?: string;
  entityType?: EntityType;
};

// Type Guards
export function isFullSubmission(data: FlagSubmissionData): data is FlagSubmissionData & { fullData: SubmissionFormData } {
  return data.tier === 'full' && data.fullData !== undefined;
}

export function isStandardSubmission(data: FlagSubmissionData): data is FlagSubmissionData & { standardData: StandardFlagData } {
  return data.tier === 'standard' && data.standardData !== undefined;
}

export function isQuickSubmission(data: FlagSubmissionData): data is FlagSubmissionData & { quickData: QuickFlagData } {
  return data.tier === 'quick' && data.quickData !== undefined;
}

// Point Calculation Function Type
export type PointsCalculator = (
  tier: SubmissionTier,
  mode: UserMode,
  severity?: SeverityLevel,
  evidenceCount?: number
) => number;

// src/types/datadonation.ts - ADD gamification types

export interface UserGamificationProfile {
  userId: string;
  mode: UserMode;
  totalPoints: number;
  availablePoints: number;
  lifetimePoints: number;
  currentLevel: number;
  currentTier: UserTier;
  badges: Badge[];
  achievements: Achievement[];
  streak: StreakData;
  leaderboardPosition?: number;
  nextMilestone?: Milestone;
}

export type UserTier = 
  | 'bronze'    // 0-999 points
  | 'silver'    // 1000-4999 points
  | 'gold'      // 5000-9999 points
  | 'platinum'  // 10000-24999 points
  | 'diamond'   // 25000+ points
  | 'vc-elite'  // Special VC tier
  | 'research-fellow'; // Special researcher tier

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'submission' | 'verification' | 'impact' | 'consistency' | 'special';
  pointsReward: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: string;
  pointsReward: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivity: string;
  streakBonus: number; // Multiplier for current streak
}

export interface Milestone {
  pointsNeeded: number;
  reward: string;
  unlocks: string[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  mode: UserMode;
  points: number;
  level: number;
  tier: UserTier;
  badgesCount: number;
  submissions: number;
  approved: number;
  impact: number;
  change?: 'up' | 'down' | 'same';
  changeAmount?: number;
}

export interface GamificationConfig {
  // Tier thresholds
  tierThresholds: Record<UserTier, number>;
  
  // Level calculation: level = floor(points / 100) + 1
  levelMultiplier: number;
  
  // Badge definitions
  badges: BadgeDefinition[];
  
  // Achievement definitions
  achievements: AchievementDefinition[];
  
  // Streak bonuses
  streakBonuses: number[]; // [2, 5, 10, 20, 30] days → multiplier
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'submission' | 'verification' | 'impact' | 'consistency' | 'special';
  pointsReward: number;
  criteria: (user: UserGamificationProfile) => boolean;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  target: number;
  pointsReward: number;
  progressFn: (user: UserGamificationProfile) => number;
}


// First, update the FlagSubmissionData type to include gamification
// src/types/datadonation.ts - Add to existing types:

export interface FlagSubmissionData {
  tier: 'quick' | 'standard' | 'full';
  mode: UserMode;
  entityName: string;
  context: string;
  projectName?: string;
  riskScore?: number;
  
  // Tier-specific data
  quickData?: QuickFlagData;
  standardData?: StandardFlagData;
  fullData?: SubmissionFormData;
  
  // Gamification metadata
  pointsAwarded: number;
  badgesEarned: Badge[];
  achievementsProgress: Achievement[];
  streakUpdated: boolean;
  timestamp: string;
  submissionId: string;
}

// Add new types for gamification tracking
export interface SubmissionGamificationResult {
  pointsAwarded: number;
  badgesEarned: Badge[];
  achievementsProgress: Achievement[];
  streakUpdated: boolean;
  newLevel?: number;
  levelUp?: boolean;
  tierChanged?: boolean;
  newTier?: UserTier;
}


// src/types/datadonation.ts - Add redemption types

export type RewardType = 
  | 'discount'
  | 'access'
  | 'feature'
  | 'recognition'
  | 'physical'
  | 'digital';

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  category: 'vc' | 'researcher' | 'individual' | 'all';
  pointsCost: number;
  quantityAvailable?: number;
  quantityRemaining?: number;
  tierRequirement?: UserTier;
  modeRequirement?: UserMode;
  features?: string[];
  redemptionInstructions: string;
  expiryDate?: string;
  createdAt: string;
}

export interface RedemptionRequest {
  id: string;
  userId: string;
  rewardId: string;
  pointsCost: number;
  status: 'pending' | 'approved' | 'fulfilled' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  fulfilledAt?: string;
  adminNotes?: string;
  userNotes?: string;
}