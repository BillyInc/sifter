// src/data/mockData.ts - UPDATED AND COMPLETE VERSION
import {
  MetricData,
  ProjectData,
  TeamIdentityMetric,
  TeamCompetenceMetric,
  ContaminatedNetworkMetric,
  MercenaryKeywordsMetric,
  EntropyMetric,
  TweetFocusMetric,
  GithubMetric,
  BusFactorMetric,
  HypeMetric,
  FounderDistractionMetric,
  EngagementMetric,
  TokenomicsMetric,
  SocialSource,
  CommunitySource,
  CodeSource,
  WebsiteSource,
  FlaggedEntity,
  AssociatedProject,
  Evidence,
  SubMetric,
  MetricFlag,
  ProfessionalSignal,
  TeamMember,
  GrowthData,
  Tweet,
  CommunityMessage,
  CommunityMember,
  Commit,
  Contributor,
  Technology,
  WebsiteContent
} from '@/types';

// ============= EVIDENCE GENERATORS =============
const generateEvidence = (type: string, count: number): Evidence[] => {
  return Array(count).fill(0).map((_, i) => ({
    type: i % 5 === 0 ? 'url' : 
           i % 5 === 1 ? 'archive' : 
           i % 5 === 2 ? 'screenshot' : 
           i % 5 === 3 ? 'blockchain' : 'social',
    source: `Evidence Source ${i + 1}`,
    url: `https://example.com/evidence/${type}/${i}`,
    timestamp: new Date(Date.now() - Math.random() * 30 * 86400000),
    confidence: Math.floor(Math.random() * 30) + 70,
    description: `${type} evidence #${i + 1} for verification`
  }));
};

// ============= METRIC DATA GENERATORS =============
export const generateMock13Metrics = (): MetricData[] => {
  const metrics = [
    { key: 'teamIdentity', name: 'Team Identity', weight: 13, description: 'Team legitimacy and identity verification' },
    { key: 'teamCompetence', name: 'Team Competence', weight: 11, description: 'Technical ability and track record' },
    { key: 'contaminatedNetwork', name: 'Contaminated Network', weight: 19, description: 'Connections to known bad actors' },
    { key: 'mercenaryKeywords', name: 'Mercenary Keywords', weight: 9, description: 'Financial vs genuine community discourse' },
    { key: 'messageTimeEntropy', name: 'Message Time Entropy', weight: 5, description: 'Natural vs coordinated posting patterns' },
    { key: 'accountAgeEntropy', name: 'Account Age Entropy', weight: 5, description: 'Organic vs bulk account creation' },
    { key: 'tweetFocus', name: 'Tweet Focus', weight: 7, description: 'Narrative consistency and coherence' },
    { key: 'githubAuthenticity', name: 'GitHub Authenticity', weight: 10, description: 'Real development vs copy-paste code' },
    { key: 'busFactor', name: 'Bus Factor', weight: 2, description: 'Single point of failure risk' },
    { key: 'artificialHype', name: 'Artificial Hype', weight: 5, description: 'Organic vs paid growth campaigns' },
    { key: 'founderDistraction', name: 'Founder Distraction', weight: 6, description: 'Focus on building vs personal brand' },
    { key: 'engagementAuthenticity', name: 'Engagement Authenticity', weight: 10, description: 'Genuine vs performative engagement' },
    { key: 'tokenomics', name: 'Tokenomics', weight: 7, description: 'Economic structure and fairness' },
  ];

  return metrics.map(metric => {
    const score = Math.floor(Math.random() * 100);
    const contribution = score * metric.weight / 100;
    const confidence = Math.floor(Math.random() * 30) + 70;
    const status = score < 20 ? 'low' : score < 40 ? 'moderate' : score < 70 ? 'high' : 'critical';
    
    return {
      key: metric.key,
      name: metric.name,
      value: score,
      weight: metric.weight,
      contribution,
      description: metric.description,
      score,
      confidence,
      status,
      breakdown: {
        subMetrics: [
          { name: 'Sub-metric 1', score: Math.floor(Math.random() * 100), weight: 50, description: 'First component' },
          { name: 'Sub-metric 2', score: Math.floor(Math.random() * 100), weight: 30, description: 'Second component' },
          { name: 'Sub-metric 3', score: Math.floor(Math.random() * 100), weight: 20, description: 'Third component' }
        ],
        weightedScore: score,
        calculationDetails: 'Weighted average of sub-metrics'
      },
      flags: score > 70 ? [
        {
          severity: score > 80 ? 'critical' : 'high',
          description: score > 80 ? 'Critical issue detected' : 'High risk detected',
          evidence: ['Evidence 1', 'Evidence 2'],
          recommendation: 'Further investigation required'
        }
      ] : [],
      evidence: generateEvidence(metric.key, 2)
    } as MetricData;
  });
};

// ============= TEAM DATA =============
const generateTeamMembers = (): TeamMember[] => {
  const names = ['Alex Johnson', 'Sam Chen', 'Taylor Smith', 'Jordan Williams', 'Morgan Lee'];
  const roles = ['CEO', 'CTO', 'Lead Developer', 'Marketing Lead', 'Community Manager'];
  
  return names.slice(0, Math.floor(Math.random() * 4) + 2).map((name, i) => ({
    name,
    role: roles[i],
    isAnonymous: Math.random() > 0.7,
    professionalProfiles: {
      linkedIn: Math.random() > 0.4 ? `https://linkedin.com/in/${name.toLowerCase().replace(' ', '')}` : undefined,
      github: Math.random() > 0.4 ? `https://github.com/${name.toLowerCase().replace(' ', '')}` : undefined,
      twitter: Math.random() > 0.4 ? `https://twitter.com/${name.toLowerCase().replace(' ', '')}` : undefined
    },
    verification: {
      hasProfessionalPhoto: Math.random() > 0.6,
      hasWorkHistory: Math.random() > 0.5,
      connections: Math.floor(Math.random() * 500) + 50,
      contributions: Math.floor(Math.random() * 1000) + 100,
      followers: Math.floor(Math.random() * 5000) + 500
    }
  }));
};

const generateProfessionalSignals = (): ProfessionalSignal[] => {
  return [
    { type: 'linkedin', strength: Math.floor(Math.random() * 100), verified: Math.random() > 0.3 },
    { type: 'github', strength: Math.floor(Math.random() * 100), verified: Math.random() > 0.4 },
    { type: 'twitter', strength: Math.floor(Math.random() * 100), verified: Math.random() > 0.5 },
    { type: 'conference', strength: Math.floor(Math.random() * 100), verified: Math.random() > 0.6 },
    { type: 'publication', strength: Math.floor(Math.random() * 100), verified: Math.random() > 0.7 }
  ];
};

// ============= NETWORK DATA =============
const generateFlaggedEntities = (): FlaggedEntity[] => {
  const hasContamination = Math.random() > 0.6;
  if (!hasContamination) return [];
  
  const entities: FlaggedEntity[] = [
    {
      name: 'CryptoGrowth Labs',
      type: 'agency',
      confidence: 'verified',
      trackRecord: {
        totalProjects: 5,
        failedProjects: 3,
        successRate: 0.4,
        averageTimeToFailure: 47
      },
      evidence: generateEvidence('agency', 3),
      lastVerified: new Date(),
      associatedProjects: [
        {
          name: 'ProjectX Token',
          outcome: 'rug',
          launchDate: new Date('2024-03-12'),
          failureDate: new Date('2024-05-08'),
          lossAmount: 2300000,
          evidence: generateEvidence('project_failure', 4)
        },
        {
          name: 'TokenY Protocol',
          outcome: 'abandoned',
          launchDate: new Date('2024-01-15'),
          failureDate: new Date('2024-03-20'),
          lossAmount: 1500000,
          evidence: generateEvidence('project_failure', 3)
        }
      ]
    }
  ];
  
  if (Math.random() > 0.5) {
    entities.push({
      name: 'BlockPromote Agency',
      type: 'agency',
      confidence: 'high',
      trackRecord: {
        totalProjects: 8,
        failedProjects: 2,
        successRate: 0.75,
        averageTimeToFailure: 92
      },
      evidence: generateEvidence('agency', 2),
      lastVerified: new Date(Date.now() - 86400000),
      associatedProjects: [
        {
          name: 'GemCoin',
          outcome: 'failure',
          launchDate: new Date('2023-11-01'),
          failureDate: new Date('2024-02-15'),
          lossAmount: 800000,
          evidence: generateEvidence('project_failure', 3)
        }
      ]
    });
  }
  
  return entities;
};

// ============= SOCIAL MEDIA DATA =============
const generateMockTweets = (count: number): Tweet[] => {
  const topics = ['launch', 'partnership', 'technology', 'community', 'tokenomics', 'roadmap'];
  const sentiments = ['positive', 'neutral', 'negative'];
  
  return Array(count).fill(0).map((_, i) => ({
    id: `tweet_${Date.now()}_${i}`,
    text: `Announcing our ${topics[i % topics.length]} update! This is exciting news for the ${sentiments[i % sentiments.length]} community.`,
    timestamp: new Date(Date.now() - Math.random() * 30 * 86400000),
    likes: Math.floor(Math.random() * 500),
    retweets: Math.floor(Math.random() * 200),
    replies: Math.floor(Math.random() * 100)
  }));
};

const generateMockMessages = (count: number): CommunityMessage[] => {
  const messages = [
    "When moon? When lambo?",
    "Can someone explain the tokenomics?",
    "Great project, excited for the future!",
    "How do I join the whitelist?",
    "The technology looks promising",
    "Any updates on the audit?",
    "Loving the community here",
    "When is the airdrop?",
    "Team seems experienced",
    "Roadmap looks ambitious"
  ];
  
  return Array(count).fill(0).map((_, i) => ({
    id: `msg_${Date.now()}_${i}`,
    author: `user${Math.floor(Math.random() * 100)}`,
    content: messages[i % messages.length],
    timestamp: new Date(Date.now() - Math.random() * 7 * 86400000),
    reactions: Math.floor(Math.random() * 20),
    threadDepth: Math.floor(Math.random() * 5)
  }));
};

const generateMockMembers = (count: number): CommunityMember[] => {
  return Array(count).fill(0).map((_, i) => ({
    id: `member_${i}`,
    username: `crypto_user_${i}`,
    joinDate: new Date(Date.now() - Math.random() * 90 * 86400000),
    messageCount: Math.floor(Math.random() * 200),
    isBotLikely: Math.random() > 0.9
  }));
};

const generateGrowthHistory = (days: number): GrowthData[] => {
  let count = 1000;
  return Array(days).fill(0).map((_, i) => {
    const change = Math.random() * 100 - 30;
    count += change;
    return {
      date: new Date(Date.now() - (days - i) * 86400000),
      count: Math.max(count, 0),
      change
    };
  });
};

// ============= GITHUB DATA =============
const generateCommits = (count: number): Commit[] => {
  const messages = [
    "Fix bug in smart contract",
    "Update README",
    "Add test coverage",
    "Refactor code",
    "Add new feature",
    "Update dependencies",
    "Fix security issue",
    "Improve documentation",
    "Optimize performance",
    "Initial commit"
  ];
  
  return Array(count).fill(0).map((_, i) => ({
    hash: `abc123${i}`,
    author: `dev${i % 5}`,
    message: messages[i % messages.length],
    timestamp: new Date(Date.now() - Math.random() * 180 * 86400000),
    filesChanged: Math.floor(Math.random() * 10) + 1
  }));
};

const generateContributors = (count: number): Contributor[] => {
  return Array(count).fill(0).map((_, i) => ({
    username: `contributor${i}`,
    commits: Math.floor(Math.random() * 100) + 10,
    additions: Math.floor(Math.random() * 5000) + 100,
    deletions: Math.floor(Math.random() * 2000) + 50,
    firstCommit: new Date(Date.now() - Math.random() * 180 * 86400000),
    lastCommit: new Date(Date.now() - Math.random() * 7 * 86400000)
  }));
};

// ============= PROJECT DATA GENERATOR =============
export const generateMockProjectData = (projectName: string): ProjectData => {
  const now = new Date();
  const baseScore = Math.floor(Math.random() * 100);
  const hasContamination = baseScore > 70;
  
  // Generate base metrics
  const teamIdentityScore = Math.max(0, Math.min(100, baseScore + (Math.random() * 20 - 10)));
  const contaminatedNetworkScore = hasContamination ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 30);
  const mercenaryScore = baseScore > 60 ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 60);
  
  // Calculate overall score
  const weights = [13, 11, 19, 9, 5, 5, 7, 10, 2, 5, 6, 10, 7];
  const scores = [
    teamIdentityScore,
    Math.floor(Math.random() * 100),
    contaminatedNetworkScore,
    mercenaryScore,
    Math.floor(Math.random() * 100),
    Math.floor(Math.random() * 100),
    Math.floor(Math.random() * 100),
    Math.floor(Math.random() * 100),
    Math.floor(Math.random() * 100),
    Math.floor(Math.random() * 100),
    Math.floor(Math.random() * 100),
    Math.floor(Math.random() * 100),
    Math.floor(Math.random() * 100)
  ];
  
  const overallScore = Math.round(
    scores.reduce((sum, score, i) => sum + (score * weights[i] / 100), 0)
  );
  
  const verdict: 'pass' | 'flag' | 'reject' = 
    overallScore < 30 ? 'pass' :
    overallScore < 60 ? 'flag' : 'reject';
  
  const confidence = Math.floor(Math.random() * 20) + 80;
  
  return {
    id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    canonicalName: projectName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    displayName: projectName,
    sources: {
      twitter: {
        handle: `@${projectName.replace(/\s+/g, '')}`,
        url: `https://twitter.com/${projectName.replace(/\s+/g, '')}`,
        followers: Math.floor(Math.random() * 50000) + 1000,
        tweets: generateMockTweets(50),
        engagementRate: Math.random() * 0.15,
        growthHistory: generateGrowthHistory(30)
      } as SocialSource,
      discord: {
        inviteUrl: `https://discord.gg/${Math.random().toString(36).substr(2, 8)}`,
        memberCount: Math.floor(Math.random() * 20000) + 1000,
        messages: generateMockMessages(200),
        members: generateMockMembers(100),
        growthHistory: generateGrowthHistory(30)
      } as CommunitySource,
      github: {
        url: `https://github.com/${projectName.replace(/\s+/g, '').toLowerCase()}`,
        stars: Math.floor(Math.random() * 1000) + 100,
        forks: Math.floor(Math.random() * 200) + 10,
        commits: generateCommits(100),
        contributors: generateContributors(8),
        issues: [],
        pullRequests: []
      } as CodeSource,
      website: {
        url: `https://${projectName.replace(/\s+/g, '').toLowerCase()}.io`,
        domainAge: Math.floor(Math.random() * 365) + 30,
        ssl: true,
        technology: [
          { name: 'React', version: '18.2.0', confidence: 95 },
          { name: 'Next.js', version: '14.0.0', confidence: 90 },
          { name: 'TypeScript', version: '5.0.0', confidence: 85 }
        ],
        content: {
          title: `${projectName} - Decentralized Protocol`,
          description: `The future of ${projectName.toLowerCase()} is here`,
          keywords: ['blockchain', 'crypto', 'defi', 'web3'],
          hasWhitepaper: Math.random() > 0.3,
          hasDocs: Math.random() > 0.5
        }
      } as WebsiteSource
    },
    metrics: {
      teamIdentity: {
        score: teamIdentityScore,
        confidence: confidence,
        status: teamIdentityScore < 20 ? 'low' : teamIdentityScore < 50 ? 'moderate' : teamIdentityScore < 70 ? 'high' : 'critical',
        breakdown: {
          subMetrics: [
            { name: 'LinkedIn Presence', score: Math.floor(Math.random() * 100), weight: 20, description: 'Professional network verification' },
            { name: 'GitHub Activity', score: Math.floor(Math.random() * 100), weight: 15, description: 'Code contribution history' },
            { name: 'Twitter Verification', score: Math.floor(Math.random() * 100), weight: 15, description: 'Social media authenticity' },
            { name: 'Photo Verification', score: Math.floor(Math.random() * 100), weight: 10, description: 'Professional vs stock images' },
            { name: 'Location Disclosure', score: Math.floor(Math.random() * 100), weight: 10, description: 'Geographic transparency' },
            { name: 'Conference Appearances', score: Math.floor(Math.random() * 100), weight: 15, description: 'Industry participation' },
            { name: 'Work History', score: Math.floor(Math.random() * 100), weight: 15, description: 'Professional background' }
          ],
          weightedScore: teamIdentityScore,
          calculationDetails: 'Weighted average of 7 professional identity signals'
        },
        flags: teamIdentityScore < 50 ? [
          {
            severity: teamIdentityScore < 30 ? 'critical' : 'high',
            description: teamIdentityScore < 30 ? 'Completely anonymous team' : 'Partially anonymous team members',
            evidence: ['Team page analysis', 'Social media verification'],
            recommendation: 'Avoid projects with anonymous teams - no accountability'
          }
        ] : [],
        evidence: generateEvidence('team_identity', 3),
        teamMembers: generateTeamMembers(),
        doxxedPercentage: teamIdentityScore,
        anonymousCount: Math.floor((100 - teamIdentityScore) / 100 * 5),
        professionalSignals: generateProfessionalSignals()
      } as TeamIdentityMetric,
      
      teamCompetence: {
        score: scores[1],
        confidence: confidence,
        status: scores[1] < 20 ? 'low' : scores[1] < 50 ? 'moderate' : scores[1] < 70 ? 'high' : 'critical',
        breakdown: {
          subMetrics: [
            { name: 'GitHub Reputation', score: Math.floor(Math.random() * 100), weight: 30, description: 'Code quality and activity' },
            { name: 'Past Project Success', score: Math.floor(Math.random() * 100), weight: 30, description: 'Historical track record' },
            { name: 'Technical Content', score: Math.floor(Math.random() * 100), weight: 20, description: 'Publications and documentation' },
            { name: 'Education Credentials', score: Math.floor(Math.random() * 100), weight: 15, description: 'Academic and professional background' },
            { name: 'Documentation Quality', score: Math.floor(Math.random() * 100), weight: 5, description: 'Project documentation completeness' }
          ],
          weightedScore: scores[1],
          calculationDetails: 'Five-dimensional competence assessment'
        },
        flags: scores[1] < 40 ? [
          {
            severity: 'high',
            description: 'Limited demonstrated competence or experience',
            evidence: ['GitHub analysis', 'Professional history review'],
            recommendation: 'Verify team capabilities before investing'
          }
        ] : [],
        evidence: generateEvidence('team_competence', 2),
        githubReputation: Math.floor(Math.random() * 100),
        pastProjectSuccess: Math.floor(Math.random() * 100),
        technicalContent: Math.floor(Math.random() * 100),
        educationCredentials: Math.floor(Math.random() * 100),
        documentationQuality: Math.floor(Math.random() * 100)
      } as TeamCompetenceMetric,
      
      contaminatedNetwork: {
        score: contaminatedNetworkScore,
        confidence: confidence + 5,
        status: contaminatedNetworkScore < 20 ? 'low' : contaminatedNetworkScore < 50 ? 'moderate' : contaminatedNetworkScore < 75 ? 'high' : 'critical',
        breakdown: {
          subMetrics: [
            { name: 'Agency Analysis', score: hasContamination ? 80 : 20, weight: 40, description: 'Marketing agency track record' },
            { name: 'Advisor Analysis', score: Math.floor(Math.random() * 100), weight: 35, description: 'Advisor involvement history' },
            { name: 'Influencer Analysis', score: Math.floor(Math.random() * 100), weight: 15, description: 'Promoter reputation' },
            { name: 'Moderator Overlap', score: Math.floor(Math.random() * 100), weight: 10, description: 'Community management patterns' }
          ],
          weightedScore: contaminatedNetworkScore,
          calculationDetails: 'Weighted analysis of professional network associations'
        },
        flags: hasContamination ? [
          {
            severity: 'critical',
            description: `Connected to known rug agency${hasContamination ? ': CryptoGrowth Labs' : ''}`,
            evidence: ['Agency database match', 'Historical failure analysis'],
            recommendation: 'Immediate rejection - high probability of rug pull'
          }
        ] : [],
        evidence: hasContamination ? generateEvidence('network', 5) : generateEvidence('network', 2),
        flaggedEntities: generateFlaggedEntities(),
        agencyConnections: [],
        advisorConnections: [],
        influencerConnections: [],
        networkRiskScore: contaminatedNetworkScore
      } as ContaminatedNetworkMetric,
      
      mercenaryKeywords: {
        score: mercenaryScore,
        confidence: confidence,
        status: mercenaryScore < 20 ? 'low' : mercenaryScore < 40 ? 'moderate' : mercenaryScore < 65 ? 'high' : 'critical',
        breakdown: {
          subMetrics: [
            { name: 'Mercenary Ratio', score: Math.floor(mercenaryScore * 100), weight: 50, description: 'Financial extraction focus' },
            { name: 'Genuine Ratio', score: Math.floor((100 - mercenaryScore) * 0.7), weight: 30, description: 'Authentic community discussion' },
            { name: 'Technical Ratio', score: Math.floor((100 - mercenaryScore) * 0.3), weight: 20, description: 'Technical substance' }
          ],
          weightedScore: mercenaryScore,
          calculationDetails: 'Three-category keyword balance analysis'
        },
        flags: mercenaryScore > 50 ? [
          {
            severity: mercenaryScore > 70 ? 'critical' : 'high',
            description: mercenaryScore > 70 ? 'Extreme financialization focus' : 'High mercenary discourse',
            evidence: ['Keyword analysis', 'Message sentiment analysis'],
            recommendation: 'Community appears focused on extraction, not building'
          }
        ] : [],
        evidence: generateEvidence('keywords', 3),
        mercenaryRatio: mercenaryScore / 100,
        genuineRatio: (100 - mercenaryScore) * 0.7 / 100,
        technicalRatio: (100 - mercenaryScore) * 0.3 / 100,
        keywordAnalysis: {
          tier1Mercenary: ['guaranteed allocation', 'free money', 'risk-free'],
          tier2Mercenary: ['airdrop farming', 'wen moon', 'maximize allocation'],
          tier3Mercenary: ['airdrop', '100x', 'gem', 'moon'],
          tier1Genuine: ['helped me understand', 'thanks for explaining'],
          tier2Genuine: ['curious about', 'how do i'],
          tier3Genuine: ['gm', 'welcome', 'thanks'],
          tier1Technical: ['consensus mechanism', 'cryptographic proof'],
          tier2Technical: ['protocol', 'validator', 'smart contract'],
          tier3Technical: ['wallet', 'transaction', 'gas']
        },
        sampleMessages: [
          {
            text: "Guaranteed 100x allocation if you join now!!! Free airdrop for early members!!!",
            author: "user123",
            timestamp: new Date(),
            mercenaryScore: 95,
            reactionCount: 47
          },
          {
            text: "Can someone explain the tokenomics? I'm confused about the vesting schedule.",
            author: "learner456",
            timestamp: new Date(),
            mercenaryScore: 15,
            reactionCount: 12
          }
        ]
      } as MercenaryKeywordsMetric,
      
      // For brevity, I'll continue with the remaining 9 metrics in a simplified way
      // In practice, each would have similar detailed structure
      messageTimeEntropy: {
        score: scores[4],
        confidence: confidence,
        status: scores[4] < 20 ? 'low' : scores[4] < 50 ? 'moderate' : scores[4] < 70 ? 'high' : 'critical',
        breakdown: { subMetrics: [], weightedScore: scores[4], calculationDetails: 'Shannon entropy calculation' },
        flags: [],
        evidence: [],
        entropyValue: Math.random() * 4,
        maxEntropy: 4.58,
        normalizedEntropy: (Math.random() * 4 / 4.58) * 100,
        concentrationScore: Math.random() * 100,
        patternAnalysis: {
          hourlyDistribution: Array(24).fill(0).map(() => Math.random() * 100),
          concentrationPeaks: [2, 3, 4],
          temporalPatterns: ['Bot-like scheduling detected']
        }
      } as EntropyMetric,
      
      accountAgeEntropy: {
        score: scores[5],
        confidence: confidence,
        status: scores[5] < 20 ? 'low' : scores[5] < 50 ? 'moderate' : scores[5] < 70 ? 'high' : 'critical',
        breakdown: { subMetrics: [], weightedScore: scores[5], calculationDetails: 'Account age distribution analysis' },
        flags: [],
        evidence: [],
        entropyValue: Math.random() * 4,
        maxEntropy: 4.58,
        normalizedEntropy: (Math.random() * 4 / 4.58) * 100,
        concentrationScore: Math.random() * 100,
        patternAnalysis: {
          hourlyDistribution: Array(24).fill(0).map(() => Math.random() * 100),
          concentrationPeaks: [2, 3, 4],
          temporalPatterns: ['Bulk account creation detected']
        }
      } as EntropyMetric,
      
      tweetFocus: {
        score: scores[6],
        confidence: confidence,
        status: scores[6] < 20 ? 'low' : scores[6] < 50 ? 'moderate' : scores[6] < 70 ? 'high' : 'critical',
        breakdown: { subMetrics: [], weightedScore: scores[6], calculationDetails: 'Topic modeling and consistency analysis' },
        flags: [],
        evidence: [],
        topicConcentration: Math.random(),
        keywordConsistency: Math.random(),
        topics: [
          { name: 'Token Launch', weight: 0.4, keywords: ['launch', 'token', 'distribution'] },
          { name: 'Technology', weight: 0.3, keywords: ['protocol', 'smart contract', 'blockchain'] },
          { name: 'Community', weight: 0.3, keywords: ['community', 'discord', 'telegram'] }
        ],
        weeklyOverlap: [0.7, 0.8, 0.6, 0.9]
      } as TweetFocusMetric,
      
      githubAuthenticity: {
        score: scores[7],
        confidence: confidence,
        status: scores[7] < 20 ? 'low' : scores[7] < 50 ? 'moderate' : scores[7] < 70 ? 'high' : 'critical',
        breakdown: { subMetrics: [], weightedScore: scores[7], calculationDetails: 'GitHub activity and originality analysis' },
        flags: [],
        evidence: [],
        originalityScore: Math.random() * 100,
        commitActivity: Math.random() * 100,
        contributorDiversity: Math.random() * 100,
        issueEngagement: Math.random() * 100,
        codeQuality: Math.random() * 100
      } as GithubMetric,
      
      busFactor: {
        score: scores[8],
        confidence: confidence,
        status: scores[8] < 20 ? 'low' : scores[8] < 50 ? 'moderate' : scores[8] < 70 ? 'high' : 'critical',
        breakdown: { subMetrics: [], weightedScore: scores[8], calculationDetails: 'Single point of failure analysis' },
        flags: [],
        evidence: [],
        busFactorValue: Math.random() * 5 + 1,
        contributionConcentration: Math.random(),
        activeContributors: Math.floor(Math.random() * 20) + 1,
        dependencyAnalysis: {
          code: Math.random() * 100,
          community: Math.random() * 100,
          social: Math.random() * 100,
          weightedAverage: Math.random() * 100
        }
      } as BusFactorMetric,
      
      artificialHype: {
        score: scores[9],
        confidence: confidence,
        status: scores[9] < 20 ? 'low' : scores[9] < 50 ? 'moderate' : scores[9] < 70 ? 'high' : 'critical',
        breakdown: { subMetrics: [], weightedScore: scores[9], calculationDetails: 'Growth pattern and campaign detection' },
        flags: [],
        evidence: [],
        growthSpikes: [
          {
            date: new Date(),
            magnitude: Math.random() * 10,
            platform: 'twitter',
            retention: Math.random()
          }
        ],
        retentionRate: Math.random(),
        campaignDetection: [
          {
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
            platforms: ['twitter', 'discord'],
            intensity: Math.random() * 100,
            patterns: ['coordinated posting', 'paid promotion']
          }
        ],
        volatilityScore: Math.random() * 100
      } as HypeMetric,
      
      founderDistraction: {
        score: scores[10],
        confidence: confidence,
        status: scores[10] < 20 ? 'low' : scores[10] < 50 ? 'moderate' : scores[10] < 70 ? 'high' : 'critical',
        breakdown: { subMetrics: [], weightedScore: scores[10], calculationDetails: 'Founder focus and activity analysis' },
        flags: [],
        evidence: [],
        twitterActivity: Math.random() * 100,
        speakingCircuit: Math.random() * 100,
        concurrentProjects: Math.random() * 100,
        contentCreation: Math.random() * 100,
        githubActivity: Math.random() * 100,
        founders: [
          {
            name: 'John Crypto',
            distractionScore: Math.floor(Math.random() * 100),
            activityBreakdown: {
              projectFocused: Math.random() * 100,
              personalBrand: Math.random() * 100,
              otherProjects: Math.random() * 100,
              technicalWork: Math.random() * 100
            }
          }
        ]
      } as FounderDistractionMetric,
      
      engagementAuthenticity: {
        score: scores[11],
        confidence: confidence,
        status: scores[11] < 20 ? 'low' : scores[11] < 50 ? 'moderate' : scores[11] < 70 ? 'high' : 'critical',
        breakdown: { subMetrics: [], weightedScore: scores[11], calculationDetails: 'Community engagement quality analysis' },
        flags: [],
        evidence: [],
        copyPastaScore: Math.random() * 100,
        threadDepth: Math.random() * 10,
        participationDistribution: Math.random(),
        questionAnswerRate: Math.random(),
        sentimentDiversity: Math.random(),
        botDetectionScore: Math.random() * 100
      } as EngagementMetric,
      
      tokenomics: {
        score: scores[12],
        confidence: confidence,
        status: scores[12] < 20 ? 'low' : scores[12] < 50 ? 'moderate' : scores[12] < 70 ? 'high' : 'critical',
        breakdown: { subMetrics: [], weightedScore: scores[12], calculationDetails: 'Economic structure analysis' },
        flags: scores[12] > 60 ? [
          {
            severity: scores[12] > 80 ? 'critical' : 'high',
            description: scores[12] > 80 ? 'Critical tokenomics issues' : 'Concerning economic structure',
            evidence: ['Allocation analysis', 'Vesting schedule review'],
            recommendation: 'Review tokenomics carefully before investing'
          }
        ] : [],
        evidence: generateEvidence('tokenomics', 2),
        disclosureStatus: Math.random() > 0.5 ? 'full' : Math.random() > 0.5 ? 'partial' : 'none',
        teamAllocation: Math.floor(Math.random() * 40),
        vestingPeriod: Math.floor(Math.random() * 48) + 12,
        unlockSchedule: [
          { month: 1, percentage: 5, description: 'Initial unlock' },
          { month: 6, percentage: 10, description: 'Cliff end' },
          { month: 12, percentage: 15, description: 'Year 1' },
          { month: 24, percentage: 20, description: 'Year 2' },
          { month: 36, percentage: 25, description: 'Year 3' }
        ],
        liquidityAllocation: Math.floor(Math.random() * 10) + 2,
        insiderConcentration: Math.floor(Math.random() * 60) + 20,
        redFlags: scores[12] > 70 ? [
          { severity: 'high', description: 'Short vesting period', impact: 'Quick exit possible' },
          { severity: 'medium', description: 'High team allocation', impact: 'Centralized control' }
        ] : []
      } as TokenomicsMetric
    },
    overallRisk: {
      score: overallScore,
      verdict,
      confidence,
      summary: overallScore < 30 ? 'Low risk project with strong fundamentals' :
               overallScore < 60 ? 'Moderate risk, requires careful review' :
               'High risk, multiple critical red flags detected'
    },
    processingTime: Math.floor(Math.random() * 90000) + 30000,
    scannedAt: now
  };
};

// Backward compatibility
export function extractProjectName(input: string): string {
  const clean = input.replace(/^@/, '').replace(/https?:\/\//, '').split(/[/?]/)[0];
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

// For backward compatibility with existing code
export const getPlaceholderData = (input: string) => {
  const projectName = extractProjectName(input);
  const projectData = generateMockProjectData(projectName);
  
  return {
    projectName: projectData.displayName,
    riskScore: projectData.overallRisk.score,
    verdict: projectData.overallRisk.verdict,
    confidence: projectData.overallRisk.confidence,
    processingTime: projectData.processingTime,
    summary: projectData.overallRisk.summary,
    recommendations: [
      projectData.overallRisk.score < 30 ? 'Proceed with investment' :
      projectData.overallRisk.score < 60 ? 'Review carefully before proceeding' :
      'Do not invest'
    ],
    detailedMetrics: Object.values(projectData.metrics)
  };
};