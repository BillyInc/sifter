// components/placeholder.ts - FIXED VERSION
import { MetricData, ProjectData, VerdictType, RiskTier } from '@/types';

// Define sub-interface for metric breakdown
interface SubMetric {
  name: string;
  score: number;
  weight: number;
  description: string;
}

// Define metric breakdown structure
interface MetricBreakdown {
  components: SubMetric[];
  total: number;
  weightedScore: number;
}

// Define metric flag structure
interface MetricFlag {
  type: 'warning' | 'critical' | 'info';
  message: string;
  severity: number;
}

// Define evidence structure
interface Evidence {
  type: 'link' | 'text' | 'screenshot';
  content: string;
  url?: string;
  description: string;
  confidence: number;
}

// Define verdict result structure
interface VerdictResult {
  verdict: VerdictType;
  score: number;
  confidence: number;
  summary: string;
  breakdown: string[];
}

// Helper function to get risk tier based on score
const getRiskTier = (score: number): RiskTier => {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MODERATE';
  return 'LOW';
};

// Mock data generation function
export const generateMockProjectData = (projectName: string): ProjectData => {
  const baseScore = Math.floor(Math.random() * 100);
  
  // Generate metrics with proper types
  const metrics: MetricData[] = [
    {
      id: '1',
      key: 'teamIdentity',
      name: 'Team Identity',
      value: Math.floor(Math.random() * 100),
      weight: 13,
      contribution: Math.floor(Math.random() * 20),
      status: Math.random() > 0.7 ? 'critical' : Math.random() > 0.5 ? 'high' : Math.random() > 0.3 ? 'moderate' : 'low',
      confidence: Math.floor(Math.random() * 30) + 70,
      flags: Math.random() > 0.8 ? ['Anonymous team', 'No LinkedIn profiles'] : [],
      evidence: Math.random() > 0.7 ? ['Team analysis report'] : [],
      score: Math.floor(Math.random() * 100),
      scoreValue: Math.floor(Math.random() * 100),
      subline: Math.random() > 0.5 ? 'Team transparency issues detected' : undefined,
      breakdown: {
        components: [
          { name: 'LinkedIn Presence', score: Math.floor(Math.random() * 100), weight: 40, description: 'Professional social media presence' },
          { name: 'GitHub Activity', score: Math.floor(Math.random() * 100), weight: 30, description: 'Code contribution history' },
          { name: 'Domain History', score: Math.floor(Math.random() * 100), weight: 30, description: 'Domain registration details' }
        ],
        total: Math.floor(Math.random() * 100),
        weightedScore: Math.floor(Math.random() * 100)
      }
    },
    {
      id: '2',
      key: 'contaminatedNetwork',
      name: 'Contaminated Network',
      value: Math.floor(Math.random() * 100),
      weight: 19,
      contribution: Math.floor(Math.random() * 20),
      status: Math.random() > 0.7 ? 'critical' : Math.random() > 0.5 ? 'high' : Math.random() > 0.3 ? 'moderate' : 'low',
      confidence: Math.floor(Math.random() * 30) + 70,
      flags: Math.random() > 0.8 ? ['Known bad actor connections', 'Previous rug associations'] : [],
      evidence: Math.random() > 0.7 ? ['Network analysis report'] : [],
      score: Math.floor(Math.random() * 100),
      scoreValue: Math.floor(Math.random() * 100),
      subline: Math.random() > 0.5 ? 'Suspicious connections detected' : undefined,
      breakdown: {
        components: [
          { name: 'Agency Links', score: Math.floor(Math.random() * 100), weight: 50, description: 'Connections to known agencies' },
          { name: 'Historical Associations', score: Math.floor(Math.random() * 100), weight: 30, description: 'Past project associations' },
          { name: 'Sybil Detection', score: Math.floor(Math.random() * 100), weight: 20, description: 'Fake account detection' }
        ],
        total: Math.floor(Math.random() * 100),
        weightedScore: Math.floor(Math.random() * 100)
      }
    },
    {
      id: '3',
      key: 'mercenaryKeywords',
      name: 'Mercenary Keywords',
      value: Math.floor(Math.random() * 100),
      weight: 9,
      contribution: Math.floor(Math.random() * 20),
      status: Math.random() > 0.7 ? 'critical' : Math.random() > 0.5 ? 'high' : Math.random() > 0.3 ? 'moderate' : 'low',
      confidence: Math.floor(Math.random() * 30) + 70,
      flags: Math.random() > 0.8 ? ['High concentration of hype words', 'Copy-pasta messaging'] : [],
      evidence: Math.random() > 0.7 ? ['Keyword analysis report'] : [],
      score: Math.floor(Math.random() * 100),
      scoreValue: Math.floor(Math.random() * 100),
      subline: Math.random() > 0.5 ? 'Excessive hype language detected' : undefined,
      breakdown: {
        components: [
          { name: 'Hype Word Frequency', score: Math.floor(Math.random() * 100), weight: 60, description: 'Frequency of hype words in messaging' },
          { name: 'Message Similarity', score: Math.floor(Math.random() * 100), weight: 40, description: 'Copy-paste message detection' }
        ],
        total: Math.floor(Math.random() * 100),
        weightedScore: Math.floor(Math.random() * 100)
      }
    },
    {
      id: '4',
      key: 'githubAuthenticity',
      name: 'GitHub Authenticity',
      value: Math.floor(Math.random() * 100),
      weight: 10,
      contribution: Math.floor(Math.random() * 20),
      status: Math.random() > 0.7 ? 'critical' : Math.random() > 0.5 ? 'high' : Math.random() > 0.3 ? 'moderate' : 'low',
      confidence: Math.floor(Math.random() * 30) + 70,
      flags: Math.random() > 0.8 ? ['Forked repositories only', 'No recent commits'] : [],
      evidence: Math.random() > 0.7 ? ['GitHub analysis report'] : [],
      score: Math.floor(Math.random() * 100),
      scoreValue: Math.floor(Math.random() * 100),
      subline: Math.random() > 0.5 ? 'Limited development activity' : undefined,
      breakdown: {
        components: [
          { name: 'Commit History', score: Math.floor(Math.random() * 100), weight: 40, description: 'Recent commit activity' },
          { name: 'Repository Quality', score: Math.floor(Math.random() * 100), weight: 30, description: 'Code quality assessment' },
          { name: 'Contributor Count', score: Math.floor(Math.random() * 100), weight: 30, description: 'Number of active contributors' }
        ],
        total: Math.floor(Math.random() * 100),
        weightedScore: Math.floor(Math.random() * 100)
      }
    },
    {
      id: '5',
      key: 'founderDistraction',
      name: 'Founder Distraction',
      value: Math.floor(Math.random() * 100),
      weight: 6,
      contribution: Math.floor(Math.random() * 20),
      status: Math.random() > 0.7 ? 'critical' : Math.random() > 0.5 ? 'high' : Math.random() > 0.3 ? 'moderate' : 'low',
      confidence: Math.floor(Math.random() * 30) + 70,
      flags: Math.random() > 0.8 ? ['Multiple active projects', 'Frequent project hopping'] : [],
      evidence: Math.random() > 0.7 ? ['Founder activity report'] : [],
      score: Math.floor(Math.random() * 100),
      scoreValue: Math.floor(Math.random() * 100),
      subline: Math.random() > 0.5 ? 'Founder appears overextended' : undefined,
      breakdown: {
        components: [
          { name: 'Project Count', score: Math.floor(Math.random() * 100), weight: 50, description: 'Number of concurrent projects' },
          { name: 'Time Allocation', score: Math.floor(Math.random() * 100), weight: 30, description: 'Estimated time spent per project' },
          { name: 'Historical Pattern', score: Math.floor(Math.random() * 100), weight: 20, description: 'Past project abandonment rate' }
        ],
        total: Math.floor(Math.random() * 100),
        weightedScore: Math.floor(Math.random() * 100)
      }
    },
    {
      id: '6',
      key: 'tokenomics',
      name: 'Tokenomics',
      value: Math.floor(Math.random() * 100),
      weight: 7,
      contribution: Math.floor(Math.random() * 20),
      status: Math.random() > 0.7 ? 'critical' : Math.random() > 0.5 ? 'high' : Math.random() > 0.3 ? 'moderate' : 'low',
      confidence: Math.floor(Math.random() * 30) + 70,
      flags: Math.random() > 0.8 ? ['High team allocation', 'No vesting schedule'] : [],
      evidence: Math.random() > 0.7 ? ['Tokenomics analysis report'] : [],
      score: Math.floor(Math.random() * 100),
      scoreValue: Math.floor(Math.random() * 100),
      subline: Math.random() > 0.5 ? 'Unbalanced token distribution' : undefined,
      breakdown: {
        components: [
          { name: 'Team Allocation', score: Math.floor(Math.random() * 100), weight: 40, description: 'Percentage allocated to team' },
          { name: 'Vesting Schedule', score: Math.floor(Math.random() * 100), weight: 30, description: 'Token lockup period' },
          { name: 'Inflation Rate', score: Math.floor(Math.random() * 100), weight: 30, description: 'Annual token inflation' }
        ],
        total: Math.floor(Math.random() * 100),
        weightedScore: Math.floor(Math.random() * 100)
      }
    }
  ];

  // Calculate overall risk score as a number
  const overallRiskScore = Math.round(
    metrics.reduce((sum, metric) => {
      const score = typeof metric.score === 'number' ? metric.score : 
                   typeof metric.value === 'number' ? metric.value : 0;
      return sum + (score * metric.weight) / 100;
    }, 0)
  );

  // Determine verdict based on score
  let verdict: VerdictType;
  if (overallRiskScore >= 70) {
    verdict = 'reject';
  } else if (overallRiskScore >= 40) {
    verdict = 'flag';
  } else {
    verdict = 'pass';
  }

  // Get risk tier based on score (using uppercase)
  const tier = getRiskTier(overallRiskScore);
  
  // Calculate confidence based on metrics confidence
  const confidence = Math.round(
    metrics.reduce((sum, metric) => sum + metric.confidence, 0) / metrics.length
  );

  // Generate sources array
  const sources = [
    {
      type: 'twitter',
      url: 'https://twitter.com/mockproject',
      username: 'MockProject',
      followers: Math.floor(Math.random() * 10000) + 1000,
      verified: Math.random() > 0.5
    },
    {
      type: 'github',
      url: 'https://github.com/mockproject',
      repo: 'mockproject/repo',
      stars: Math.floor(Math.random() * 500) + 50,
      forks: Math.floor(Math.random() * 100) + 10
    },
    {
      type: 'website',
      url: 'https://mockproject.com',
      domainAge: Math.floor(Math.random() * 365) + 30,
      sslValid: true
    }
  ];

  return {
    id: `project_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    canonicalName: projectName.toLowerCase().replace(/\s+/g, '-'),
    displayName: projectName,
    description: `Comprehensive analysis for ${projectName} - ${verdict.toUpperCase()} verdict with ${overallRiskScore}/100 risk score`,
    platform: Math.random() > 0.5 ? 'Twitter' : 'Discord',
    sources: sources,
    overallRisk: {
      score: overallRiskScore,
      verdict: verdict,
      tier: tier,
      confidence: confidence,
      breakdown: [
        `Team Identity: ${getMetricScore(metrics, 'teamIdentity')}/100`,
        `Contaminated Network: ${getMetricScore(metrics, 'contaminatedNetwork')}/100`,
        `Tokenomics: ${getMetricScore(metrics, 'tokenomics')}/100`,
        `GitHub Authenticity: ${getMetricScore(metrics, 'githubAuthenticity')}/100`,
        `Founder Distraction: ${getMetricScore(metrics, 'founderDistraction')}/100`
      ]
    },
    metrics: metrics,
    scannedAt: new Date(),
    processingTime: Math.floor(Math.random() * 120) + 60
  };
};

// Helper function to get metric score
const getMetricScore = (metrics: MetricData[], key: string): number => {
  const metric = metrics.find(m => m.key === key);
  if (!metric) return 0;
  
  if (typeof metric.score === 'number') return metric.score;
  if (typeof metric.value === 'number') return metric.value;
  if (typeof metric.scoreValue === 'number') return metric.scoreValue;
  
  return 0;
};

// Export additional helper functions
export const generateMockMetrics = (count: number = 6): MetricData[] => {
  const metrics: MetricData[] = [];
  const metricNames = [
    { key: 'teamIdentity', name: 'Team Identity' },
    { key: 'contaminatedNetwork', name: 'Contaminated Network' },
    { key: 'mercenaryKeywords', name: 'Mercenary Keywords' },
    { key: 'githubAuthenticity', name: 'GitHub Authenticity' },
    { key: 'founderDistraction', name: 'Founder Distraction' },
    { key: 'tokenomics', name: 'Tokenomics' },
    { key: 'teamCompetence', name: 'Team Competence' },
    { key: 'messageTimeEntropy', name: 'Message Time Entropy' },
    { key: 'accountAgeEntropy', name: 'Account Age Entropy' },
    { key: 'tweetFocus', name: 'Tweet Focus' },
    { key: 'busFactor', name: 'Bus Factor' },
    { key: 'artificialHype', name: 'Artificial Hype' },
    { key: 'engagementAuthenticity', name: 'Engagement Authenticity' }
  ];

  for (let i = 0; i < Math.min(count, metricNames.length); i++) {
    const { key, name } = metricNames[i];
    const score = Math.floor(Math.random() * 100);
    
    metrics.push({
      id: `${i + 1}`,
      key,
      name,
      value: score,
      weight: Math.floor(Math.random() * 15) + 5,
      contribution: Math.floor(Math.random() * 20),
      status: score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 40 ? 'moderate' : 'low',
      confidence: Math.floor(Math.random() * 30) + 70,
      flags: score >= 80 ? [`High risk detected for ${name}`] : [],
      evidence: [],
      score: score,
      scoreValue: score,
      subline: score >= 80 ? 'Critical issue detected' : score >= 60 ? 'High risk area' : undefined
    });
  }

  return metrics;
};

export const generateMockAnalysisHistory = (count: number = 4): Array<{
  id: string;
  projectName: string;
  riskScore: number;
  verdict: VerdictType;
  scannedAt: Date;
  processingTime: number;
}> => {
  const projects = [
    'MoonDoge Protocol',
    'CryptoGrowth Labs Analysis',
    'DeFi Alpha Protocol',
    'TokenSwap Pro',
    'Web3 Innovation Lab',
    'Blockchain Security Audit',
    'NFT Marketplace Analysis',
    'DeFi Yield Protocol'
  ];

  const history = [];
  for (let i = 0; i < Math.min(count, projects.length); i++) {
    const score = Math.floor(Math.random() * 100);
    let verdict: VerdictType;
    if (score >= 70) {
      verdict = 'reject';
    } else if (score >= 40) {
      verdict = 'flag';
    } else {
      verdict = 'pass';
    }

    history.push({
      id: `${i + 1}`,
      projectName: projects[i],
      riskScore: score,
      verdict,
      scannedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      processingTime: Math.floor(Math.random() * 120) + 30
    });
  }

  return history;
};
