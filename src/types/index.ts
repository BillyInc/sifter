// src/types/index.ts - CONSOLIDATED VERSION WITH DATA DONATION TYPES
// ============= CORE TYPES =============
export type AnalysisState = 'idle' | 'loading' | 'complete' | 'error';
export type UserMode = 'ea-vc' | 'researcher' | 'individual' | null;
export type VerdictType = 'pass' | 'flag' | 'reject';
export type VerdictResult = VerdictType | 'unknown';
export type RiskTier = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
export type PlatformType = 'twitter' | 'discord' | 'telegram' | 'github' | 'website' | 'name' | 'unknown';

// ============= DATA DONATION TYPES =============
export type EntityType = 'marketing-agency' | 'advisor-consultant' | 'influencer-kol' | 'team-member';
export type SubmissionStatus = 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'needs-info';
export type EvidenceType = 'twitter_post' | 'reddit_thread' | 'blockchain_transaction' | 'news_article' | 'archived_website' | 'telegram' | 'other';
export type EvidenceStatus = 'pending' | 'verified' | 'disputed' | 'invalid';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type ContributorTier = 'tier-1' | 'tier-2' | 'tier-3';

// src/types/index.ts - UPDATED SubmissionFormData
export interface SubmissionFormData {
  id: string;
  caseId: string;
  entityType: 'marketing-agency' | 'advisor-consultant' | 'influencer-kol' | 'team-member';
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
    id: string;
    url: string;
    description: string;
    type: 'twitter' | 'reddit' | 'news' | 'archive' | 'blockchain' | 'telegram' | 'other';
    status: 'pending' | 'verified' | 'disputed' | 'invalid';
    submittedAt?: Date;
  }>;
  submitterInfo: {
    email: string;
    name?: string;
    anonymous: boolean;
    acknowledgements: boolean[];
  };
  mode: UserMode;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'needs-info';
  submittedAt: string;
  confidenceScore?: number;
  impactScore?: number; // ADD THIS
  pointsAwarded?: number; // ADD THIS
  updatedAt?: string;
  // Add any other missing properties you're using
  title?: string; // Add if used
  description?: string; // Add if used
  severity?: 'low' | 'medium' | 'high' | 'critical'; // Add if used
}

export interface EvidenceItem {
  id: string;
  entityId: string;
  evidenceType: EvidenceType;
  originalUrl: string;
  archivedUrl?: string;
  screenshotUrl?: string;
  ipfsHash?: string;
  evidenceTitle: string;
  evidenceDescription: string;
  severity: SeverityLevel;
  verificationStatus: EvidenceStatus;
  submittedBy: string;
  verifiedBy?: string;
  submittedAt: Date;
}

export interface DisputeFormData {
  relationship: 'authorized-representative' | 'individual-named' | 'disputing-with-authorization' | 'other';
  fullName: string;
  positionTitle: string;
  officialEmail: string;
  phoneNumber?: string;
  disputeCategories: string[];
  detailedExplanation: string;
  counterEvidence: Array<{
    type: string;
    file?: File;
    url?: string;
    description: string;
  }>;
  requestedResolution: string;
  resolutionExplanation: string;
  verificationMethod: 'email' | 'document' | 'video-call';
}

export interface ContributorTierInfo {
  id: ContributorTier;
  name: string;
  credibilityWeight: number;
  basePoints: number;
  verificationPriority: 'priority' | 'high' | 'standard';
  minPoints?: number;
  maxPoints?: number;
}

export interface UserPointsData {
  availablePoints: number;
  pointsInPool: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  currentMultiplier: number;
  tier: ContributorTier;
  nextMilestone?: {
    pointsNeeded: number;
    reward: string;
  };
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  category: 'badge' | 'access' | 'physical' | 'service';
  availability: 'available' | 'limited' | 'sold-out';
  imageUrl?: string;
  claimable: boolean;
}

// ============= EVIDENCE & FLAG TYPES =============
export interface Evidence {
  type: string;
  content: string;
  source: string;
  confidence: number;
  timestamp?: Date;
}

export interface MetricFlag {
  type: 'warning' | 'critical' | 'info';
  message: string;
  metric: string;
  severity: number;
}

export interface SubMetric {
  name: string;
  value: number;
  weight: number;
  description: string;
}

export interface MetricBreakdown {
  subMetrics: SubMetric[];
  weightedScore: number;
  calculationDetails: string;
  algorithmVersion?: string;
}

// ============= SMART INPUT TYPES =============
export interface ResolvedEntity {
  id: string;
  canonicalName: string;
  displayName: string;
  platform: PlatformType;
  url?: string;
  confidence: number;
  alternativeNames: string[];
  crossReferences: string[];
  metadata: Record<string, any>;
}

export interface SmartInputResult {
  input: string;
  type: InputType;
  resolvedEntities: ResolvedEntity[];
  selectedEntity?: ResolvedEntity | null;
  confidence: number;
  searchHistory: string[];
  timestamp: Date;
}

// ============= METRIC TYPES =============
export interface MetricData {
  id: string;
  key: string;
  name: string;
  value: number;
  weight: number;
  contribution: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
  confidence: number;
  flags: string[];
  evidence: string[];
  score: number;
  scoreValue?: number;
  subline?: string;
  breakdown?: any;
}

export type MetricScore = number;

export interface ScoreBreakdown {
  name: string;
  weight: number;
  score: number;
  contribution: number;
  percentOfTotal: number;
}

// ============= VERDICT & ANALYSIS TYPES =============
export interface VerdictData {
  projectName: string;
  riskScore: number;
  verdict: VerdictType;
  confidence: number;
  processingTime: number;
  summary: string;
  recommendations: string[];
  detailedMetrics: MetricData[];
  inputValue: string;
  metrics: MetricData[];
  compositeScore: number;
  riskTier: RiskTier;
  breakdown: ScoreBreakdown[];
  analyzedAt: string;
}

// ============= DETECTION RULES & PATTERNS =============
export interface DetectionRule {
  condition: string;
  weight: number;
  description: string;
}

export interface PatternExample {
  projectName: string;
  outcome: string;
  evidence: string[];
  similarityScore: number;
}

export interface ScamPattern {
  id: string;
  name: string;
  description: string;
  confidence: number;
  examples: PatternExample[];
  detectionRules?: DetectionRule[];
}

// ============= PROJECT DATA TYPES =============
export interface ProjectData {
  id: string;
  canonicalName: string;
  displayName: string;
  description?: string;
  sources: Array<{
    type: string;
    url: string;
    [key: string]: any;
  }>;
  platform?: PlatformType | string;
  overallRisk: {
    score: number;
    verdict: VerdictType;
    tier: RiskTier;
    confidence: number;
    breakdown?: string[];
    summary?: string;
  };
  metrics: MetricData[];
  scannedAt: Date;
  processingTime: number;
  weight?: number;
  analyzedAt?: string;
  flags?: any[];
  recommendations?: any[];
}

// ============= BATCH PROCESSING TYPES =============
export interface BatchProject {
  id: string;
  name: string;
  input: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  riskScore?: number;
  verdict?: VerdictType;
  redFlags?: string[];
  processingTime?: number;
  scannedAt?: Date;
  metrics?: MetricData[];
  weight?: number;
  confidence?: number;
}

export interface BatchSummary {
  total: number;
  passed: number;
  flagged: number;
  rejected: number;
  averageRiskScore: number;
  processingTime: number;
  redFlagDistribution: Record<string, number>;
}

export interface BatchProcessingJob {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'complete' | 'failed' | 'error';
  projects: BatchProject[];
  summary: BatchSummary;
  createdAt: Date;
  completedAt?: Date;
}

// ============= USER & HISTORY TYPES =============
export interface WatchlistItem {
  projectId: string;
  projectName: string;
  riskScore: number;
  verdict: VerdictType;
  addedAt: Date;
  alertsEnabled: boolean;
  lastChecked: Date;
}

export interface AnalysisHistory {
  id: string;
  projectName: string;
  riskScore: number;
  verdict: VerdictType;
  scannedAt: Date;
  processingTime: number;
}

// ============= PARTNER PACKET =============
export interface PartnerPacket {
  summary: {
    total: number;
    passed: number;
    flagged: number;
    rejected: number;
    averageRiskScore: number;
    processingTime: number;
    generatedAt: string;
    redFlagDistribution: Record<string, number>;
  };
  projects: Array<{
    name: string;
    riskScore: number;
    verdict: string;
    redFlags: string[];
    processingTime: number;
    scannedAt: Date;
  }>;
}

// ============= COMPOSITE SCORE CONFIGURATION =============
export interface MetricWeight {
  key: string;
  name: string;
  weight: number;
  description: string;
}

export const METRIC_WEIGHTS: MetricWeight[] = [
  {
    key: 'team_identity',
    name: 'Team Identity',
    weight: 0.12,
    description: 'Are team members doxxed with verifiable backgrounds?',
  },
  {
    key: 'team_competence',
    name: 'Team Competence',
    weight: 0.10,
    description: 'Do they have relevant experience and track record?',
  },
  {
    key: 'likely_agency',
    name: 'Likely Agency',
    weight: 0.15,
    description: 'Signs of paid marketing agency involvement',
  },
  {
    key: 'mod_overlap',
    name: 'Mod overlap',
    weight: 0.08,
    description: 'Moderators shared with known rugged/scam projects',
  },
  {
    key: 'mercenary_ratio',
    name: 'Mercenary ratio',
    weight: 0.10,
    description: 'Percentage of community that are paid promoters',
  },
  {
    key: 'community_type',
    name: 'Community Type',
    weight: 0.12,
    description: 'Organic vs botted/artificial community growth',
  },
  {
    key: 'tweet_focus',
    name: 'Tweet focus (30d)',
    weight: 0.06,
    description: 'Balance of product vs hype content',
  },
  {
    key: 'ghost_admins',
    name: 'Ghost admins',
    weight: 0.05,
    description: 'Hidden admin accounts with elevated permissions',
  },
  {
    key: 'recycled_github',
    name: 'Recycled GitHub',
    weight: 0.08,
    description: 'Code originality and contributor authenticity',
  },
  {
    key: 'farming_velocity',
    name: 'Farming velocity spike',
    weight: 0.04,
    description: 'Sudden spikes in airdrop farming activity',
  },
  {
    key: 'bot_similarity',
    name: 'Bot-like similarity',
    weight: 0.04,
    description: 'Pattern matching against known bot behaviors',
  },
  {
    key: 'mutual_follow_deficit',
    name: 'Mutual-follow deficit',
    weight: 0.06,
    description: 'Network reciprocity compared to organic baseline',
  },
];

// ============= DATA DONATION CONSTANTS =============
export const TIER_INFO: Record<ContributorTier, ContributorTierInfo> = {
  'tier-1': {
    id: 'tier-1',
    name: 'Institutional',
    credibilityWeight: 2.0,
    basePoints: 100,
    verificationPriority: 'priority',
    minPoints: 5000,
  },
  'tier-2': {
    id: 'tier-2',
    name: 'Professional',
    credibilityWeight: 1.5,
    basePoints: 75,
    verificationPriority: 'high',
    minPoints: 1000,
    maxPoints: 4999,
  },
  'tier-3': {
    id: 'tier-3',
    name: 'Community',
    credibilityWeight: 1.0,
    basePoints: 50,
    verificationPriority: 'standard',
    maxPoints: 999,
  },
};

export const DEFAULT_POINTS_DATA: UserPointsData = {
  availablePoints: 0,
  pointsInPool: 0,
  lifetimeEarned: 0,
  lifetimeRedeemed: 0,
  currentMultiplier: 1.0,
  tier: 'tier-3',
  nextMilestone: {
    pointsNeeded: 1000,
    reward: 'Tier 2 Upgrade',
  },
};

// ============= COMPOSITE SCORE FUNCTIONS =============
export function calculateCompositeScore(
  metricScores: Record<string, number>
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const metric of METRIC_WEIGHTS) {
    const score = metricScores[metric.key];
    if (score !== undefined) {
      weightedSum += score * metric.weight;
      totalWeight += metric.weight;
    }
  }

  if (totalWeight > 0 && totalWeight < 1.0) {
    weightedSum = weightedSum / totalWeight;
  }

  return Math.round(weightedSum);
}

export function getVerdict(score: number): VerdictType {
  if (score >= 70) return 'reject';
  if (score >= 40) return 'flag';
  return 'pass';
}

export function getRiskTier(
  score: number
): {
  tier: RiskTier;
  label: string;
  color: string;
  bgColor: string;
} {
  if (score < 20) {
    return {
      tier: 'LOW',
      label: 'Low Risk',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    };
  }
  if (score < 40) {
    return {
      tier: 'MODERATE',
      label: 'Moderate Risk',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    };
  }
  if (score < 60) {
    return {
      tier: 'ELEVATED',
      label: 'Elevated Risk',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    };
  }
  if (score < 80) {
    return {
      tier: 'HIGH',
      label: 'High Risk',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    };
  }
  return {
    tier: 'CRITICAL',
    label: 'Critical Risk',
    color: 'text-red-500',
    bgColor: 'bg-red-600/10',
  };
}

export function getScoreBreakdown(
  metricScores: Record<string, number>
): Array<{
  name: string;
  weight: number;
  score: number;
  contribution: number;
  percentOfTotal: number;
}> {
  const compositeScore = calculateCompositeScore(metricScores);

  return METRIC_WEIGHTS.map((metric) => {
    const score = metricScores[metric.key] ?? 0;
    const contribution = score * metric.weight;
    return {
      name: metric.name,
      weight: metric.weight,
      score,
      contribution,
      percentOfTotal: compositeScore > 0 ? (contribution / compositeScore) * 100 : 0,
    };
  }).sort((a, b) => b.contribution - a.contribution);
}

// ============= DATA DONATION UTILITIES =============
export function calculateSubmissionPoints(formData: SubmissionFormData, tier: ContributorTier): number {
  const basePoints = TIER_INFO[tier].basePoints;
  const evidenceBonus = formData.evidence.filter(e => e.url.trim()).length * 10;
  const projectBonus = formData.affectedProjects.length * 5;
  const multiplier = TIER_INFO[tier].credibilityWeight;
  
  const total = (basePoints + evidenceBonus + projectBonus) * multiplier;
  return Math.floor(total);
}

export function getTierFromPoints(points: number): ContributorTier {
  if (points >= 5000) return 'tier-1';
  if (points >= 1000) return 'tier-2';
  return 'tier-3';
}

// ============= HELPER FUNCTIONS =============
export const isProceedVerdict = (verdict: VerdictType): boolean => {
  return verdict === 'pass' || verdict === 'flag';
};

export const verdictToLegacy = (verdict: VerdictType): 'REJECT' | 'PROCEED' => {
  return verdict === 'reject' ? 'REJECT' : 'PROCEED';
};

export const legacyToVerdict = (legacy: 'REJECT' | 'PROCEED'): VerdictType => {
  return legacy === 'REJECT' ? 'reject' : 'pass';
};

export const getMetricValue = (metric: MetricData): number => {
  if (typeof metric.value === 'number') return metric.value;
  if (metric.scoreValue !== undefined) return metric.scoreValue;
  if (typeof metric.value === 'string') {
    const parsed = parseFloat(metric.value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const getMetricValueFromArray = (metrics: MetricData[], key: string): number => {
  const metric = metrics.find(m => 
    m.key === key || 
    m.name.toLowerCase().includes(key.toLowerCase()) ||
    key.toLowerCase().includes(m.name.toLowerCase())
  );
  
  if (!metric) return 0;
  
  return getMetricValue(metric);
};

export const getMetricByKey = getMetricValueFromArray;

export type InputType = 'twitter' | 'discord' | 'telegram' | 'github' | 'website' | 'name' | 'unknown';

// ============= UTILITY TYPES =============
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
