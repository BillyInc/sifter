// components/placeholder.ts - FIXED VERSION
import { MetricData, ProjectData, VerdictType, RiskTier } from '@/types';
import { createMetricsArray } from '@/utils/metricHelpers';

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
   const metrics = createMetricsArray();
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
