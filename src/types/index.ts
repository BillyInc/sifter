// src/types/index.ts - UPDATED VERSION
// ============= CORE TYPES =============
export type AnalysisState = 'idle' | 'loading' | 'complete' | 'error';
export type UserMode = 'ea-vc' | 'researcher' | 'individual' | null;
export type VerdictType = 'pass' | 'flag' | 'reject';
export type VerdictResult = VerdictType | 'unknown';
export type RiskTier = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
export type PlatformType = 'twitter' | 'discord' | 'telegram' | 'github' | 'website' | 'name' | 'unknown';
export type InputType = 'twitter' | 'discord' | 'telegram' | 'github' | 'website' | 'name' | 'unknown';
export type BlitzMode = 'hyper' | 'momentum' | 'deep';

// ============= DATA DONATION TYPES =============
export type EntityType = 'marketing-agency' | 'advisor-consultant' | 'influencer-kol' | 'team-member' | 'unknown';
export type SubmissionStatus = 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'needs-info';
export type EvidenceType = 'twitter_post' | 'reddit_thread' | 'blockchain_transaction' | 'news_article' | 'archived_website' | 'telegram' | 'other';
export type EvidenceStatus = 'pending' | 'verified' | 'disputed' | 'invalid';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type ContributorTier = 'tier-1' | 'tier-2' | 'tier-3' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'vc-elite' | 'research-fellow';
export type UserTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'vc-elite' | 'research-fellow';
export type RewardType = 'access' | 'feature' | 'recognition' | 'physical';

// ============= SUBMISSION FORM DATA =============
export interface SubmissionFormData {
  id: string;
  caseId: string;
  entityType: EntityType;
  entityDetails: {
    fullName: string;
    twitterHandle?: string;
    telegramHandle?: string;
    linkedinProfile?: string;
    website?: string;
    notes?: string;
  };
  affectedProjects: Array<{
    id?: string;
    projectName: string;
    incidentDescription: string;
    date: string; // MM/YYYY
    evidence?: string[];
    riskScore?: number;
  }>;
  evidence: Array<{
    id: string;
    url: string;
    description: string;
    type: 'twitter' | 'reddit' | 'news' | 'archive' | 'blockchain' | 'telegram' | 'other';
    status: 'pending' | 'verified' | 'disputed' | 'invalid';
    submittedAt?: Date;
    severity?: SeverityLevel;
  }>;
  submitterInfo: {
    email: string;
    name?: string;
    anonymous: boolean;
    acknowledgements: boolean[];
    mode?: UserMode;
  };
  mode: UserMode;
  status: SubmissionStatus;
  submittedAt: string;
  confidenceScore?: number;
  impactScore?: number;
  pointsAwarded?: number;
  updatedAt?: string;
  title?: string;
  description?: string;
  severity?: SeverityLevel;
  category?: string;
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

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  category: 'all' | 'vc' | 'researcher' | 'individual';
  pointsCost: number;
  quantityAvailable?: number;
  quantityRemaining?: number;
  tierRequirement?: UserTier;
  modeRequirement?: UserMode;
  features?: string[];
  redemptionInstructions: string;
  isAvailable?: boolean;
  expiryDate?: string;
  createdAt: string;
  imageUrl?: string;
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

// ============= MODE SPECIFIC DATA TYPES =============
export interface HyperModeData {
  contractSafety: {
    mintAuthority: string;
    freezeAuthority: string;
    lpLocked: string;
    taxSettings: string;
    proxyContract: string;
  };
}

export interface MomentumModeData {
  momentumMetrics: {
    priceChange24h: string;
    volumeChange: string;
    holderGrowth: string;
    socialEngagement: string;
    whaleActivity: string;
    volatilityIndex: string;
  };
}

export interface DeepModeData {
  deepAnalysis: {
    codeAudit: string;
    teamDoxxing: string;
    tokenDistribution: string;
    roadmapClarity: string;
    communityGovernance: string;
    liquidityDepth: string;
    vestingSchedule: string;
  };
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
    input?: string;
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
  blitzMode?: BlitzMode;
  twitterScan?: TwitterScanResult;
  snaData?: SNAData;
  modeSpecificData?: ModeSpecificData; // Add this property
}

// ... [existing code above]

// ============= RESEARCH PATTERN TYPES =============
export interface PatternExample {
  projectName: string;
  outcome: 'rug' | 'failure' | 'abandoned' | 'success';
  evidence: string[];
  similarityScore: number;
}

export interface DetectionRule {
  condition: string;
  weight: number;
  description: string;
}

export interface ScamPattern {
  id: string;
  name: string;
  description: string;
  confidence: number;
  examples: PatternExample[];
  detectionRules: DetectionRule[];
}

// ============= CHAIN DETECTION TYPES =============

// ... [rest of your existing code]

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

// ============= BLITZ MODE & TWITTER TYPES =============
export interface TwitterScanResult {
  preLaunchMentions: number;
  postLaunchMentions: number;
  highRiskAccounts: string[];
  coordinationScore: number;
  evidence: string[];
  preLaunchInsiderFlag: boolean;
}

export interface SNANode {
  id: string;
  label: string;
  group: 'deployer' | 'promoter' | 'rugger' | 'financial' | 'clean';
  level: number; // hop distance
  riskScore?: number;
}

export interface SNAEdge {
  from: string;
  to: string;
  label: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  dashes?: boolean;
}

export interface SNAData {
  nodes: SNANode[];
  edges: SNAEdge[];
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
  'bronze': {
    id: 'bronze',
    name: 'Bronze',
    credibilityWeight: 1.0,
    basePoints: 50,
    verificationPriority: 'standard',
    maxPoints: 999,
  },
  'silver': {
    id: 'silver',
    name: 'Silver',
    credibilityWeight: 1.5,
    basePoints: 75,
    verificationPriority: 'high',
    minPoints: 1000,
    maxPoints: 4999,
  },
  'gold': {
    id: 'gold',
    name: 'Gold',
    credibilityWeight: 2.0,
    basePoints: 100,
    verificationPriority: 'priority',
    minPoints: 5000,
  },
  'platinum': {
    id: 'platinum',
    name: 'Platinum',
    credibilityWeight: 2.5,
    basePoints: 150,
    verificationPriority: 'priority',
    minPoints: 10000,
  },
  'diamond': {
    id: 'diamond',
    name: 'Diamond',
    credibilityWeight: 3.0,
    basePoints: 200,
    verificationPriority: 'priority',
    minPoints: 25000,
  },
  'vc-elite': {
    id: 'vc-elite',
    name: 'VC Elite',
    credibilityWeight: 3.5,
    basePoints: 250,
    verificationPriority: 'priority',
    minPoints: 50000,
  },
  'research-fellow': {
    id: 'research-fellow',
    name: 'Research Fellow',
    credibilityWeight: 4.0,
    basePoints: 300,
    verificationPriority: 'priority',
    minPoints: 100000,
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
  if (points >= 50000) return 'vc-elite';
  if (points >= 25000) return 'diamond';
  if (points >= 10000) return 'platinum';
  if (points >= 5000) return 'gold';
  if (points >= 1000) return 'silver';
  return 'bronze';
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

// ============= UTILITY TYPES =============
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ============= CHAIN DETECTION TYPES =============
export type ChainType = 'solana' | 'ethereum' | 'base' | 'polygon' | 'avalanche' | 'arbitrum' | 'unknown';

export interface ChainInfo {
  id: ChainType;
  name: string;
  nativeSymbol: string;
  icon: string;
  color: string;
  explorerUrl: string;
  isEVM: boolean;
}

export const CHAIN_INFO: Record<ChainType, ChainInfo> = {
  'solana': {
    id: 'solana',
    name: 'Solana',
    nativeSymbol: 'SOL',
    icon: '◎',
    color: '#00FFA3',
    explorerUrl: 'https://solscan.io/token/',
    isEVM: false
  },
  'ethereum': {
    id: 'ethereum',
    name: 'Ethereum',
    nativeSymbol: 'ETH',
    icon: '⧫',
    color: '#627EEA',
    explorerUrl: 'https://etherscan.io/token/',
    isEVM: true
  },
  'base': {
    id: 'base',
    name: 'Base',
    nativeSymbol: 'ETH',
    icon: '⎔',
    color: '#0052FF',
    explorerUrl: 'https://basescan.org/token/',
    isEVM: true
  },
  'polygon': {
    id: 'polygon',
    name: 'Polygon',
    nativeSymbol: 'MATIC',
    icon: '⬢',
    color: '#8247E5',
    explorerUrl: 'https://polygonscan.com/token/',
    isEVM: true
  },
  'avalanche': {
    id: 'avalanche',
    name: 'Avalanche',
    nativeSymbol: 'AVAX',
    icon: '❄️',
    color: '#E84142',
    explorerUrl: 'https://snowtrace.io/token/',
    isEVM: true
  },
  'arbitrum': {
    id: 'arbitrum',
    name: 'Arbitrum',
    nativeSymbol: 'ETH',
    icon: '⎔',
    color: '#28A0F0',
    explorerUrl: 'https://arbiscan.io/token/',
    isEVM: true
  },
  'unknown': {
    id: 'unknown',
    name: 'Unknown',
    nativeSymbol: '?',
    icon: '❓',
    color: '#666666',
    explorerUrl: '',
    isEVM: false
  }
};

// ============= CHAIN DETECTION FUNCTIONS =============
export function detectChainFromAddress(address: string): ChainType {
  const cleanAddress = address.trim();
  
  // Check known addresses first
  const knownAddresses: Partial<Record<ChainType, string[]>> = {
    'solana': [
      'So11111111111111111111111111111111111111112', // SOL
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
      'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
    ],
    'ethereum': [
      '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
      '0x6982508145454Ce325dDbE47a25d4ec3d2311933', // PEPE
    ],
    'base': [
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
      '0x4200000000000000000000000000000000000006', // WETH
      '0x4ed4e862860bed51a9570b96d89af5e1b0efefed', // DEGEN
    ],
    'polygon': [
      '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDC
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC (old)
    ],
    'avalanche': [
      '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC
      '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', // USDT
    ],
    'arbitrum': [
      '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC
    ]
  };
  
  for (const [chain, addresses] of Object.entries(knownAddresses)) {
    if (addresses?.some(addr => addr.toLowerCase() === cleanAddress.toLowerCase())) {
      return chain as ChainType;
    }
  }
  
  // Detect by format
  if (/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
    // EVM address - random assignment for demo
    const evmChains: ChainType[] = ['ethereum', 'base', 'polygon', 'avalanche', 'arbitrum'];
    return evmChains[Math.floor(Math.random() * evmChains.length)];
  }
  
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(cleanAddress)) {
    return 'solana';
  }
  
  return 'unknown';
}
export function isMultiChainAddress(input: string): boolean {
  const cleanInput = input.trim();
  
  // Ethereum/Base/Polygon/Arbitrum/etc (0x...)
  if (/^0x[a-fA-F0-9]{40}$/.test(cleanInput)) {
    return true;
  }
  
  // Solana (base58, 32-44 chars)
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(cleanInput)) {
    return true;
  }
  
  // Avalanche X-Chain (C-chain uses 0x, P-Chain different)
  if (cleanInput.startsWith('0x') && cleanInput.length === 42) {
    return true;
  }
  
  return false;
}

export function getChainIcon(chain: ChainType): string {
  return CHAIN_INFO[chain]?.icon || '❓';
}

export function getChainColor(chain: ChainType): string {
  return CHAIN_INFO[chain]?.color || '#666666';
}

// ============= FORMATTING FUNCTIONS =============
export function formatAddress(address: string, chain?: ChainType): string {
  if (!address) return '';
  
  if (chain === 'solana') {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }
  
  // Default EVM formatting
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatProcessingTime(ms: number, chain?: ChainType): string {
  const seconds = Math.floor(ms / 1000);
  
  if (chain === 'solana') {
    if (seconds < 5) return '3–5 seconds';
    if (seconds < 10) return '5–8 seconds';
    return '8–12 seconds';
  }
  
  if (chain === 'base') {
    if (seconds < 8) return '5–8 seconds';
    if (seconds < 15) return '8–15 seconds';
    return '15–25 seconds';
  }
  
  // Default
  if (seconds < 10) return '5–10 seconds';
  if (seconds < 30) return '10–30 seconds';
  if (seconds < 60) return '30–60 seconds';
  if (seconds < 120) return '1–2 minutes';
  return '2–5 minutes';
}

// ============= TYPE GUARDS =============
export function isProjectData(obj: any): obj is ProjectData {
  return obj && 
    typeof obj.id === 'string' && 
    typeof obj.displayName === 'string' &&
    Array.isArray(obj.metrics) &&
    obj.overallRisk &&
    typeof obj.overallRisk.score === 'number';
}

export function isSmartInputResult(obj: any): obj is SmartInputResult {
  return obj &&
    typeof obj.input === 'string' &&
    Array.isArray(obj.resolvedEntities) &&
    typeof obj.confidence === 'number';
}

export function isBatchProcessingJob(obj: any): obj is BatchProcessingJob {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.status === 'string' &&
    Array.isArray(obj.projects);
}


// ============= PARTNER PACKET TYPES =============
export interface PartnerPacketProject {
  name: string;
  riskScore: number;
  verdict: VerdictType | 'unknown'; // Allow 'unknown' as valid value
  redFlags: string[];
  processingTime: number;
  scannedAt: Date;
}

export interface PartnerPacketSummary {
  total: number;
  passed: number;
  flagged: number;
  rejected: number;
  averageRiskScore: number;
  processingTime: number;
  generatedAt: string;
  redFlagDistribution?: Record<string, number>;
}

export interface PartnerPacket {
  summary: PartnerPacketSummary;
  projects: PartnerPacketProject[];
}

// Add to your existing types in types/index.ts

export interface HyperBlitzAnalysis {
  mode: 'hyper';
  token: string;
  age: string;
  chain: string;
  scanTime: string;
  volumeSpike: string;
  contractSafety: {
    mintAuthority: string;
    freezeAuthority: string;
    lpLocked: string;
    lpLockedTime?: string;
  };
  networkStructure: {
    totalAccounts: number;
    clusters: Array<{
      id: string;
      size: number;
      connected: string;
      density: number;
      leader?: string;
      centrality: number;
    }>;
    overallDensity: number;
  };
  timingAnalysis: {
    prePumpActivity: {
      clusterTweets: string;
      sequence: string[];
      interval: string;
    };
    volumeCorrelation: {
      tweetCluster: number;
      volumeSpike: string;
      timing: string;
    };
    coordinationEvidence: {
      talkingPoints: string[];
      crossPlatform: boolean;
      pattern: string;
    };
  };
  historicalContext: {
    clusterHistory: {
      tokensPromoted: number;
      failures: number;
      patternMatch: number;
    };
    individualRisk: Array<{
      account: string;
      tokens: number;
      failureRate: number;
    }>;
    contaminationScore: number;
  };
  financialCorrelation: {
    whaleActivity: Array<{
      whale: string;
      action: string;
      amount: string;
      timing: string;
    }>;
    whalePromoterConnections: {
      promotersFollowing: number;
      pattern: string;
    };
    exitLiquidity: {
      topBuyers: string;
      expectedDump: string;
      drainCapacity: string;
    };
  };
  onChainMomentum: {
    volume: string;
    holderConcentration: string;
    liquidity: string;
    exitRisk: string;
    slippage: string;
  };
  verdict: string;
  recommendation: string;
}

export interface MomentumBlitzAnalysis {
  mode: 'momentum';
  token: string;
  age: string;
  chain: string;
  scanTime: string;
  priceContext: {
    current: string;
    change24h: string;
    ath: string;
    volume: string;
    trend: 'rising' | 'declining' | 'stable';
  };
  communityHealth: {
    messageTimingEntropy: number;
    accountAgeEntropy: number;
    engagementDistribution: number;
  };
  networkEvolution: {
    initial: {
      cleanStructure: boolean;
      density: number;
      founderCentrality: number;
    };
    current: {
      promoterInfiltration: number;
      density: number;
      founderCentrality: number;
      promoterCentrality: number;
    };
    healthTrend: string;
  };
  engagementQuality: {
    substantiveDiscussion: number;
    mercenaryContent: number;
    spamBotContent: number;
  };
  founderActivity: {
    tweetFocus: {
      projectUpdates: number;
      promotionalContent: number;
      personalContent: number;
    };
    responsePatterns: {
      technical: number;
      price: number;
      timeline: number;
    };
    activityTrend: string;
  };
  artificialHype: {
    coordinationPatterns: {
      naturalBursts: number;
      lightCoordination: boolean;
      sustainedManipulation: boolean;
    };
    botNetwork: {
      amplificationRate: number;
      followerQuality: number;
      engagementPatterns: string;
    };
    influencePurchasing: {
      followerGrowth: string;
      fakeEngagement: number;
    };
  };
  verdict: string;
  recommendation: string;
}

export interface DeepBlitzAnalysis {
  mode: 'deep';
  token: string;
  chain: string;
  scanTime: string;
  overallScore: number;
  metrics: Array<{
    name: string;
    score: number;
    weight: number;
    points: number;
  }>;
  strengths: string[];
  weaknesses: string[];
  criticalFlags: Array<{
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }>;
  networkAwareStrategy: {
    positionSizing: string;
    entryTiming: string[];
    exitStrategy: {
      immediate: string[];
      gradual: string[];
    };
  };
  verdict: string;
  recommendation: string;
}

// Add to your types file or create locally in IndividualAnalysisView.tsx

interface ModeSpecificData {
  hyperBlitzReport?: {
    token: string;
    age: string;
    chain: string;
    volumeSpike: string;
    contractSafety: string;
    mintAuthority: string;
    freezeAuthority: string;
    lpLocked: string;
    taxSettings: string;
    proxyContract: string;
    networkStructure?: {
      totalAccounts: number;
      clustersDetected: number;
      networkDensity: string;
    };
    timingAnalysis?: {
      prePumpActivity: string;
      volumeCorrelation: string;
      coordinationEvidence: string;
    };
    historicalContext?: {
      clusterHistory: string;
      failureRate: string;
      networkContaminationScore: number;
    };
    financialCorrelation?: {
      whaleActivity: string;
      whalePromoterConnections: string;
      exitLiquidity: string;
    };
    onChainMomentum?: {
      volume: string;
      holderConcentration: string;
      liquidity: string;
      exitRisk: string;
    };
    verdict: string;
    criticalIssues: string[];
    recommendation: string;
  };
  
  momentumBlitzReport?: {
    token: string;
    age: string;
    chain: string;
    priceChange: string;
    currentPrice: string;
    ath: string;
    volume: string;
    volumeTrend: string;
    communityHealth: {
      messageTimingEntropy: string;
      accountAgeEntropy: string;
      engagementDistribution: string;
    };
    networkEvolution: {
      initialNetwork: {
        highRiskConnections: number;
        density: string;
        founderCentrality: string;
      };
      currentNetwork: {
        newClusters: number;
        density: string;
        founderCentrality: string;
        promoterCentrality: string;
      };
      trend: string;
      promoterInfiltration: string;
      communitySegmentation: string;
    };
    engagementQuality: {
      substantiveDiscussion: string;
      mercenaryContent: string;
      spamBotContent: string;
      trend: string;
    };
    founderActivity: {
      tweetFocus: {
        projectUpdates: string;
        promotionalContent: string;
        personalContent: string;
      };
      responsePatterns: {
        technicalQuestions: string;
        priceQuestions: string;
        responseRate: string;
      };
      activityTrend: string;
      githubCommits: string;
    };
    artificialHype: {
      coordinationPatterns: string;
      botNetwork: {
        amplificationRate: string;
        followerQuality: string;
        fakeEngagement: string;
      };
      influencePurchasing: string;
      followerGrowth: string;
    };
    networkBasedAssessment: {
      strengths: string[];
      concerns: string[];
      pressurePoints: {
        tippingPoint: string;
        timeframe: string;
      };
    };
    verdict: string;
    recommendation: string;
  };
  
  deepBlitzReport?: {
    token: string;
    analysisTime: string;
    chain: string;
    overallScore: number;
    overallVerdict: string;
    metrics: Array<{
      key: string;
      name: string;
      weight: number;
      score: number;
      points: string;
      status: string;
      breakdown: string;
    }>;
    criticalRedFlags: string[];
    strengths: string[];
    networkAwareStrategy: {
      positionSizing: string;
      entryTiming: string;
      exitStrategy: string;
      monitoringChecklist: string[];
    };
    finalVerdict: string;
    recommendation: string;
  };
}


export type AnalysisReport = HyperBlitzAnalysis | MomentumBlitzAnalysis | DeepBlitzAnalysis;