// Data Donation Core Types

// Enums
export type EntityType = 'marketing-agency' | 'advisor-consultant' | 'influencer-kol' | 'team-member';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type SubmissionStatus = 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'needs-info';
export type UserMode = 'ea-vc' | 'researcher' | 'individual';
export type SubmissionTier = 'quick' | 'standard' | 'full';
export type EvidenceStatus = 'pending' | 'verified' | 'disputed' | 'invalid';

// Evidence Types
export type EvidenceType = 
  | 'twitter' | 'reddit' | 'news' | 'archive' | 'blockchain' | 'telegram' | 'other';

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

export interface StandardFlagFormData {
  // Array format for evidence: ["url|description|type", "url|description|type"]
  evidence: string[];
  description: string;
  severity: SeverityLevel;
}

export interface FlagSubmissionData {
  submissionId?: string;
  tier: SubmissionTier;
  mode: UserMode;
  entityName: string;
  context: string;
  projectName?: string;
  riskScore?: number;
  
  // Tier-specific data
  quickData?: QuickFlagData;
  standardData?: StandardFlagFormData;
  evidence?: Evidence[];
  
  // Gamification metadata
  pointsAwarded: number;
  badgesEarned: Badge[];
  achievementsProgress: Achievement[];
  streakUpdated: boolean;
  timestamp: string;
  
  // Legacy properties for backward compatibility
  points?: number;
  fullData?: SubmissionFormData;
}

// VC-specific Types
export interface VCPortfolioItem {
  id: string;
  name: string;
  status: 'active' | 'exited' | 'considering' | 'rejected';
  investedAmount?: number;
  dateAdded: string;
  investmentAmount?: number;  // Add alias or use investedAmount consistently
  fund?: string;
  projectName?: string;
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
      'twitter', 'reddit', 'news', 'archive', 'blockchain', 'telegram', 'other'
      // Remove: 'legal_document', 'financial_record', 'contract_document',
      // 'email_correspondence', 'confidential_source', 'portfolio_page'
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
      'twitter', 'reddit', 'news', 'archive', 'blockchain', 'telegram', 'other'
      // Remove: 'data_analysis', 'pattern_analysis', 'academic_source',
      // 'blockchain_transaction', 'github_commit', 'audit_report'
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
      'twitter', 'reddit', 'news', 'archive', 'blockchain', 'telegram', 'other'
      // Remove: 'personal_experience'
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

export function isStandardSubmission(data: FlagSubmissionData): data is FlagSubmissionData & { standardData: StandardFlagFormData } {
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

// Gamification Types
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
  displayName?: string;
  pointsMultiplier?: number;
   name?: string;          // User's display name (e.g., "John Doe")
  email?: string;         // User's email for identification/contact
}

// Fix duplicate UserTier declaration
export type UserTier = "bronze" | "silver" | "gold" | "platinum" | "diamond" | "vc-elite" | "research-fellow";

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

export interface SubmissionGamificationResult {
  pointsAwarded: number;
  badgesEarned: Badge[];
  achievementsProgress: Achievement[];
  streakUpdated: boolean;
  newLevel?: number;
  levelUp?: boolean;
  tierChanged?: boolean;
  newTier?: UserTier;
  updatedStreak?: StreakData; // Added for gamification UI feedback
}

// Reward and Redemption Types
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
   isAvailable?: boolean;  // ✅ ADD THIS to the type definition
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

// Additional missing types
export interface Evidence {
  id?: string;
  url: string;
  description: string;
  type: 'url' | 'file' | 'document' | 'image';
  status?: EvidenceStatus;
  submissionId: string;
  archiveUrl?: string;
  uploadedAt: string;
  verified: boolean;
  archived: boolean;
}

export interface EntityEntry {
  id: string;
  name: string;
  type: EntityType;
  riskScore?: number;
  submissionCount?: number;
  description: string;
  lastFlagged?: string;
   allegations?: Array<{    // ✅ ADD THIS
    id: string;
    description: string;
  }>;
    evidenceCount: number;
  lastUpdated: string;
  status?: string;
  createdAt?: string;
  
  // ... other properties
}

export interface Dispute {
  id: string;
  submissionId: string;
  reason: string;
  status: 'open' | 'under-review' | 'resolved' | 'dismissed';
  submittedBy: string;
  submittedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  // ... other properties
}

export interface EvidenceVaultItem {
  id: string;
  entityId: string;
  evidenceType: EvidenceType;
  originalUrl: string;
  archivedUrl?: string;
  ipfsHash?: string;
  submittedBy: string;
  submittedAt: string;
  verified: boolean;
  verificationNotes?: string;
  // ... other properties
}

// Helper functions for array format operations
export const ArrayHelpers = {
  // Convert evidence array format to objects
  parseEvidenceArray: (evidenceArray: string[]): Array<{url: string, description: string, type?: EvidenceType}> => {
    return evidenceArray.map(item => {
      const parts = item.split('|');
      return {
        url: parts[0] || '',
        description: parts[1] || '',
        type: parts[2] as EvidenceType || undefined
      };
    });
  },
  
  // Convert evidence objects to array format
  formatEvidenceArray: (evidenceObjects: Array<{url: string, description: string, type?: EvidenceType}>): string[] => {
    return evidenceObjects.map(e => `${e.url}|${e.description}|${e.type || 'other'}`);
  },
  
  // Calculate points from evidence array
  calculateEvidencePoints: (evidenceArray: string[], mode: UserMode): number => {
    const validEvidence = evidenceArray.filter(item => item.includes('|') && item.split('|')[0].trim());
    const basePoints = validEvidence.length * 10;
    const multiplier = MODE_CONFIGS[mode].pointMultiplier;
    return basePoints * multiplier;
  }
};
export type CompatibleSubmissionFormData = {
  entityType: string;
  entityDetails: {
    fullName: string;
    twitterHandle?: string;
    telegramHandle?: string;
    linkedinProfile?: string;
    website?: string;
  };
  affectedProjects: Array<{
    projectName: string;
    incidentDescription: string;
    date: string;
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
};
