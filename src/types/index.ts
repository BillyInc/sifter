// src/types/index.ts - CONSOLIDATED VERSION
// ============= CORE TYPES =============
export type AnalysisState = 'idle' | 'loading' | 'complete' | 'error';
export type UserMode = 'ea-vc' | 'researcher' | 'individual' | null;
export type VerdictType = 'pass' | 'flag' | 'reject';
export type VerdictResult = VerdictType | 'unknown';
export type RiskTier = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
export type PlatformType = 'twitter' | 'discord' | 'telegram' | 'github' | 'website' | 'name' | 'unknown';

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
  type: InputType; // Changed from PlatformType to InputType
  resolvedEntities: ResolvedEntity[];
   selectedEntity?: ResolvedEntity | null; // Make it nullable
  confidence: number;
  searchHistory: string[];
  timestamp: Date;
}

// ============= METRIC TYPES =============
export interface MetricData {
  id: string;
  key: string;
  name: string;
  value: number; // CHANGE: Make this always number, not string | number
  weight: number;
  contribution: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
  confidence: number;
  flags: string[];
  evidence: string[];
  score: number;           // Required
  scoreValue?: number;     // Optional
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
    [key: string]: any; // Additional source-specific properties

  }>;
  platform?: PlatformType | string;
  overallRisk: {
    score: number;
    verdict: VerdictType;
    tier: RiskTier;
    confidence: number;
      breakdown?: string[]; // ADD: Make this optional
      summary?: string; // Add summary property
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

// Weights sum to 1.0 (100%)
// Higher weight = more impact on final score
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
    weight: 0.15, // Heavy weight - agencies are a huge red flag
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

// Validate weights sum to 1.0
const totalWeight = METRIC_WEIGHTS.reduce((sum, m) => sum + m.weight, 0);
if (Math.abs(totalWeight - 1.0) > 0.001) {
  console.warn(`Warning: Metric weights sum to ${totalWeight}, expected 1.0`);
}

// ============= COMPOSITE SCORE FUNCTIONS =============
/**
 * Calculate composite score from individual metric scores
 * Each metric score should be 0-100 (higher = riskier)
 */
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

  // Normalize if some metrics are missing
  if (totalWeight > 0 && totalWeight < 1.0) {
    weightedSum = weightedSum / totalWeight;
  }

  return Math.round(weightedSum);
}

/**
 * Get verdict based on composite score
 */
export function getVerdict(score: number): VerdictType {
  if (score >= 70) return 'reject';
  if (score >= 40) return 'flag';
  return 'pass';
}

/**
 * Get risk tier for display
 */
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

/**
 * Get weight contribution breakdown for transparency
 */
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

// In your types/index.ts
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
  
  return getMetricValue(metric); // Reuse the first function
};

// Or as an alias for convenience
export const getMetricByKey = getMetricValueFromArray;

export type InputType = 'twitter' | 'discord' | 'telegram' | 'github' | 'website' | 'name' | 'unknown';

// ============= UTILITY TYPES =============
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;