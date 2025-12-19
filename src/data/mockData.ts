// data/mockData.ts - FIXED VERSION
import { ProjectData, MetricData, AnalysisHistory, VerdictType } from '@/types';

// Define source interface
interface ProjectSource {
  type: 'twitter' | 'github' | 'website' | 'discord' | 'telegram';
  url: string;
  username?: string;
  repo?: string;
  followers?: number;
  verified?: boolean;
  domainAge?: number;
  sslValid?: boolean;
  members?: number;
  [key: string]: any;
}

export const generateMockProjectData = (projectName: string): ProjectData => {
  const baseScore = Math.floor(Math.random() * 100);
  
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
    }
  ];

  // Calculate overall risk score
  const overallRiskScore = Math.round(
    metrics.reduce((sum, metric) => {
      const score = typeof metric.score === 'number' ? metric.score : 
                   typeof metric.value === 'number' ? metric.value : 0;
      return sum + (score * metric.weight) / 100;
    }, 0)
  );

  // Determine verdict
  let verdict: VerdictType;
  if (overallRiskScore >= 70) {
    verdict = 'reject';
  } else if (overallRiskScore >= 40) {
    verdict = 'flag';
  } else {
    verdict = 'pass';
  }

  // Determine tier
  const getTier = (score: number) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MODERATE';
    return 'LOW';
  };

  // Generate sources array as objects
  const sources: ProjectSource[] = [
    {
      type: 'twitter',
      url: `https://twitter.com/${projectName.toLowerCase().replace(/\s+/g, '')}`,
      username: projectName.replace(/\s+/g, ''),
      followers: Math.floor(Math.random() * 10000) + 1000,
      verified: Math.random() > 0.7
    },
    {
      type: 'github',
      url: `https://github.com/${projectName.toLowerCase().replace(/\s+/g, '-')}`,
      repo: `${projectName.toLowerCase().replace(/\s+/g, '-')}/main`,
      stars: Math.floor(Math.random() * 500) + 50,
      forks: Math.floor(Math.random() * 100) + 10
    },
    {
      type: 'website',
      url: `https://${projectName.toLowerCase().replace(/\s+/g, '')}.com`,
      domainAge: Math.floor(Math.random() * 365) + 30,
      sslValid: true
    }
  ];

  return {
    id: `project_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    canonicalName: projectName.toLowerCase().replace(/\s+/g, '-'),
    displayName: projectName,
    description: `Risk analysis for ${projectName} - ${verdict.toUpperCase()} verdict with score ${overallRiskScore}/100`,
    platform: Math.random() > 0.5 ? 'Twitter' : 'Discord',
    sources: sources,
    overallRisk: {
      score: overallRiskScore,
      verdict: verdict,
      tier: getTier(overallRiskScore),
      confidence: Math.floor(Math.random() * 30) + 70,
      breakdown: [
        `Team Identity: ${getMetricScore(metrics, 'teamIdentity')}/100`,
        `Contaminated Network: ${getMetricScore(metrics, 'contaminatedNetwork')}/100`,
        `Tokenomics: ${getMetricScore(metrics, 'tokenomics')}/100`
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

// Generate mock analysis history
export const generateMockAnalysisHistory = (count: number = 4): AnalysisHistory[] => {
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

  const history: AnalysisHistory[] = [];
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
      verdict: verdict,
      scannedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      processingTime: Math.floor(Math.random() * 120) + 30
    });
  }

  return history;
};

// Generate mock metrics only
export const generateMockMetrics = (count: number = 6): MetricData[] => {
  const metrics: MetricData[] = [];
  const metricNames = [
    { key: 'teamIdentity', name: 'Team Identity' },
    { key: 'contaminatedNetwork', name: 'Contaminated Network' },
    { key: 'mercenaryKeywords', name: 'Mercenary Keywords' },
    { key: 'githubAuthenticity', name: 'GitHub Authenticity' },
    { key: 'founderDistraction', name: 'Founder Distraction' },
    { key: 'tokenomics', name: 'Tokenomics' }
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
