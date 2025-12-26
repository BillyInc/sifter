// data/mockData.ts - FIXED VERSION
import { ProjectData, MetricData, AnalysisHistory, VerdictType } from '@/types';
import { generateDetailedMetricEvidence } from '@/utils/metricHelpers';
import { createMetricsArray } from '@/utils/metricHelpers';

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
   const metrics = createMetricsArray(); // Already has detailed evidence!

  // Calculate overall risk score
  const overallRiskScore = Math.round(
     metrics.reduce((sum: number, metric: MetricData) => {  // ✅ Explicit types
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
export const generateMockMetrics = (count: number = 13): MetricData[] => {
  const metrics: MetricData[] = [];
  const metricNames = [
    { id: '1', key: 'teamIdentity', name: 'Team Identity', value: 85, score: 85, weight: 15, contribution: 12.75, status: 'high', confidence: 85, flags: [], evidence: [] },
    { id: '2', key: 'teamCompetence', name: 'Team Competence', value: 60, score: 60, weight: 12, contribution: 7.2, status: 'moderate', confidence: 75, flags: [], evidence: [] },
    { id: '3', key: 'contaminatedNetwork', name: 'Contaminated Network', value: 45, score: 45, weight: 10, contribution: 4.5, status: 'moderate', confidence: 65, flags: [], evidence: [] },
    { id: '4', key: 'mercenaryKeywords', name: 'Mercenary Keywords', value: 70, score: 70, weight: 8, contribution: 5.6, status: 'high', confidence: 80, flags: [], evidence: [] },
    { id: '5', key: 'messageTimeEntropy', name: 'Message Time Entropy', value: 30, score: 30, weight: 7, contribution: 2.1, status: 'low', confidence: 90, flags: [], evidence: [] },
    { id: '6', key: 'accountAgeEntropy', name: 'Account Age Entropy', value: 25, score: 25, weight: 6, contribution: 1.5, status: 'low', confidence: 85, flags: [], evidence: [] },
    { id: '7', key: 'tweetFocus', name: 'Tweet Focus', value: 50, score: 50, weight: 5, contribution: 2.5, status: 'moderate', confidence: 70, flags: [], evidence: [] },
    { id: '8', key: 'githubAuthenticity', name: 'GitHub Authenticity', value: 40, score: 40, weight: 8, contribution: 3.2, status: 'moderate', confidence: 75, flags: [], evidence: [] },
    { id: '9', key: 'busFactor', name: 'Bus Factor', value: 75, score: 75, weight: 9, contribution: 6.75, status: 'high', confidence: 80, flags: [], evidence: [] },
    { id: '10', key: 'artificialHype', name: 'Artificial Hype', value: 65, score: 65, weight: 6, contribution: 3.9, status: 'high', confidence: 70, flags: [], evidence: [] },
    { id: '11', key: 'founderDistraction', name: 'Founder Distraction', value: 55, score: 55, weight: 5, contribution: 2.75, status: 'moderate', confidence: 65, flags: [], evidence: [] },
    { id: '12', key: 'engagementAuthenticity', name: 'Engagement Authenticity', value: 35, score: 35, weight: 4, contribution: 1.4, status: 'moderate', confidence: 60, flags: [], evidence: [] },
    { id: '13', key: 'tokenomics', name: 'Tokenomics', value: 80, score: 80, weight: 5, contribution: 4.0, status: 'high', confidence: 85, flags: [], evidence: [] }

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
