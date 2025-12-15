/**
 * Sifter Composite Score Configuration
 *
 * Deterministic weighted formula for ranking projects.
 * Weights are tuned based on what actually predicts scams/quality.
 *
 * Score interpretation:
 * - 0-30: High quality, low risk (PROCEED with confidence)
 * - 31-50: Moderate quality, some concerns (PROCEED with caution)
 * - 51-74: Elevated risk, needs deeper review (BORDERLINE)
 * - 75-100: High risk, likely problematic (REJECT)
 */

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
export function getVerdict(score: number): 'REJECT' | 'PROCEED' {
  return score >= 75 ? 'REJECT' : 'PROCEED';
}

/**
 * Get risk tier for display
 */
export function getRiskTier(
  score: number
): {
  tier: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';
  label: string;
  color: string;
  bgColor: string;
} {
  if (score <= 30) {
    return {
      tier: 'LOW',
      label: 'Low Risk',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    };
  }
  if (score <= 50) {
    return {
      tier: 'MODERATE',
      label: 'Moderate Risk',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    };
  }
  if (score <= 74) {
    return {
      tier: 'ELEVATED',
      label: 'Elevated Risk',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    };
  }
  return {
    tier: 'HIGH',
    label: 'High Risk',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
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
