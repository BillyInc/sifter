// /src/types/index.ts
// Core types for Sifter crypto project analysis platform

// ============= CORE TYPES =============
export type AnalysisState = 'idle' | 'loading' | 'complete' | 'error';
export type UserMode = 'ea-vc' | 'researcher' | 'individual' | null;
export type VerdictType = 'pass' | 'flag' | 'reject';
export type VerdictResult = VerdictType | 'unknown';
export type RiskTier = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
export type PlatformType = 'twitter' | 'discord' | 'telegram' | 'github' | 'website' | 'name' | 'unknown';

// ============= SMART INPUT TYPES =============
export interface SmartInputResult {
  input: string;
  type: PlatformType;
  resolvedEntities: ResolvedEntity[];
  selectedEntity?: ResolvedEntity;
  confidence: number;
  searchHistory: string[];
  timestamp: Date;
}

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

// ============= METRIC TYPES =============
export interface MetricData {
  id: string;
  key: string;
  name: string;
  value: number | string;
  weight: number;
  contribution: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
  confidence: number;
  flags: string[];
  evidence: string[];
}

// Add the missing MetricScore type that's being imported elsewhere
export type MetricScore = number;

export interface ScoreBreakdown {
  name: string;
  weight: number;
  score: number;
  contribution: number;
  percentOfTotal: number;
}

// ============= VERDICT DATA =============
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

// ============= PROJECT DATA TYPES =============
export interface ProjectData {
  id: string;
  canonicalName: string;
  displayName: string;
  sources: string[];
  metrics: MetricData[];
  overallRisk: {
    score: number;
    verdict: VerdictType;
    tier: RiskTier; // Changed from string to RiskTier for consistency
    confidence: number;
  };
  scannedAt: Date;
  processingTime: number;
  weight?: number;
  analyzedAt?: string;
  flags?: any[];
  recommendations?: any[];
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

// ============= DETAILED METRIC INTERFACES =============
export interface TeamIdentityMetric {
  score: number;
  confidence: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
  breakdown: any;
  flags: string[];
  evidence: string[];
  teamMembers: any[];
  doxxedPercentage: number;
  anonymousCount: number;
  professionalSignals: any[];
}

export interface TeamCompetenceMetric {
  score: number;
  confidence: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
  breakdown: any;
  flags: string[];
  evidence: string[];
  githubReputation: number;
  pastProjectSuccess: number;
  technicalContent: number;
  educationCredentials: number;
  documentationQuality: number;
}

export interface ContaminatedNetworkMetric {
  score: number;
  confidence: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
  breakdown: any;
  flags: string[];
  evidence: string[];
  flaggedEntities: any[];
  agencyConnections: any[];
  advisorConnections: any[];
  influencerConnections: any[];
  networkRiskScore: number;
}

export interface MercenaryKeywordsMetric {
  score: number;
  confidence: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
  breakdown: any;
  flags: string[];
  evidence: string[];
  mercenaryRatio: number;
  genuineRatio: number;
  technicalRatio: number;
  keywordAnalysis: any;
  sampleMessages: any[];
}

export interface EntropyMetric {
  score: number;
  confidence: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
  breakdown: any;
  flags: string[];
  evidence: string[];
  entropyValue: number;
  maxEntropy: number;
  normalizedEntropy: number;
  concentrationScore: number;
  patternAnalysis: any;
}

export interface TweetFocusMetric {
  score: number;
  confidence: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
  breakdown: any;
  flags: string[];
  evidence: string[];
  topicConcentration: number;
  keywordConsistency: number;
  topics: any[];
  weeklyOverlap: number[];
}

export interface GithubMetric {
  score: number;
  confidence: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
  breakdown: any;
  flags: string[];
  evidence: string[];
  originalityScore: number;
  commitActivity: number;
  contributorDiversity: number;
  issueEngagement: number;
  codeQuality: number;
}

export interface BusFactorMetric {
  score: number;
  confidence: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
  breakdown: any;
  flags: string[];
  evidence: string[];
  busFactorValue: number;
  contributionConcentration: number;
  activeContributors: number;
  dependencyAnalysis: any;
}

export interface HypeMetric {
  score: number;
  confidence: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
  breakdown: any;
  flags: string[];
  evidence: string[];
  growthSpikes: any[];
  retentionRate: number;
  campaignDetection: any[];
  volatilityScore: number;
}

export interface FounderDistractionMetric {
  score: number;
  confidence: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
  breakdown: any;
  flags: string[];
  evidence: string[];
  twitterActivity: number;
  speakingCircuit: number;
  concurrentProjects: number;
  contentCreation: number;
  githubActivity: number;
  founders: any[];
}

export interface EngagementMetric {
  score: number;
  confidence: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
  breakdown: any;
  flags: string[];
  evidence: string[];
  copyPastaScore: number;
  threadDepth: number;
  participationDistribution: number;
  questionAnswerRate: number;
  sentimentDiversity: number;
  botDetectionScore: number;
}

export interface TokenomicsMetric {
  score: number;
  confidence: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
  breakdown: any;
  flags: string[];
  evidence: string[];
  disclosureStatus: string;
  teamAllocation: number;
  vestingPeriod: number;
  unlockSchedule: any[];
  liquidityAllocation: number;
  insiderConcentration: number;
  redFlags: string[];
}

// ============= METRICS OBJECT =============
export interface MetricsObject {
  teamIdentity: TeamIdentityMetric;
  teamCompetence: TeamCompetenceMetric;
  contaminatedNetwork: ContaminatedNetworkMetric;
  mercenaryKeywords: MercenaryKeywordsMetric;
  messageTimeEntropy: EntropyMetric;
  accountAgeEntropy: EntropyMetric;
  tweetFocus: TweetFocusMetric;
  githubAuthenticity: GithubMetric;
  busFactor: BusFactorMetric;
  artificialHype: HypeMetric;
  founderDistraction: FounderDistractionMetric;
  engagementAuthenticity: EngagementMetric;
  tokenomics: TokenomicsMetric;
}

// ============= EXPORT TYPES =============
export interface PartnerPacket {
  summary: {
    total: number;
    passed: number;
    flagged: number;
    rejected: number;
    averageRiskScore: number;
    processingTime: number;
    generatedAt: string;
    redFlagDistribution: Record<string, number>; // ADDED: Fixes the missing property error
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

// ============= COMPONENT PROPS =============
export interface LandingPageProps {
  onGetStarted: () => void;
}

// ============= UTILITY TYPES =============
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;