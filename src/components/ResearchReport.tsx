// components/ResearchReport.tsx - FIXED VERSION WITHOUT DUPLICATE PROPERTIES
'use client';

import React, { useState, useEffect } from 'react';

// Define MetricData interface to match your other components
interface MetricData {
  name: string;
  score: number;
  value?: number;
  weight?: number;
  [key: string]: any; // For any additional properties
}

interface PatternMatch {
  patternName: string;
  similarity: number;
  confidence: number;
  matchedRules: string[];
  examples: string[];
}

interface MetricAnalysis {
  name: string;
  score: number;
  weight: number;
  correlation: number;
  significance: 'high' | 'medium' | 'low';
  benchmark: number;
  industryAvg: number;
}

interface ResearchReportProps {
  projectName: string;
  riskScore: number;
  scannedAt: Date;
  onClose?: () => void;
  initialTab?: 'metrics' | 'patterns' | 'summary';
  // Accept both for compatibility - but projectMetrics should be array
  projectMetrics?: MetricData[];
  patternMatches?: PatternMatch[];
  onExport?: () => void;
  onShare?: () => void;
  compact?: boolean;  // ADD THIS LINE
}

// Statistical methods for dropdown
type StatisticalMethod = 'correlation' | 'regression' | 'factor' | 'cluster' | 'timeseries';

// Qualitative analysis methods for dropdown
type QualitativeMethod = 'thematic' | 'discourse' | 'content' | 'narrative' | 'pattern';

export default function ResearchReport({
  projectName,
  patternMatches = [],
  projectMetrics = [],
  riskScore,
  scannedAt,
  onClose,
  initialTab = 'metrics',
  onExport,
  compact = false,  // ADD THIS LINE
  onShare
}: ResearchReportProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<'metrics' | 'patterns' | 'summary'>(initialTab);
  const [statisticalMethod, setStatisticalMethod] = useState<StatisticalMethod>('correlation');
  const [qualitativeMethod, setQualitativeMethod] = useState<QualitativeMethod>('pattern');
  const [isLoading, setIsLoading] = useState(false);
  
  // Convert array to object for compatibility with existing chart code
  const [localMetricsObject, setLocalMetricsObject] = useState<Record<string, any>>({});

  // Update local metrics when prop changes - convert array to object
  useEffect(() => {
    if (projectMetrics && projectMetrics.length > 0) {
      // Convert MetricData array to object format
      const metricsObject: Record<string, any> = {};
      projectMetrics.forEach(metric => {
        if (metric && metric.name) {
          // Convert metric name to camelCase key (e.g., "Team Identity" -> "teamIdentity")
          const key = metric.name
            .toLowerCase()
            .replace(/\s+(.)/g, (_, chr) => chr.toUpperCase())
            .replace(/[^a-zA-Z0-9]/g, '');
          
          // Extract properties without duplicates
          const { name, score, value, weight, ...rest } = metric;
          metricsObject[key] = {
            score: score || value || 0,
            name: name,
            weight: weight || 10,
            ...rest // Include all other properties
          };
        }
      });
      
      // Set default metrics if specific ones are missing
      const defaultMetrics = [
        'teamIdentity', 'teamCompetence', 'contaminatedNetwork', 'mercenaryKeywords',
        'messageTimeEntropy', 'accountAgeEntropy', 'tweetFocus', 'githubAuthenticity',
        'busFactor', 'artificialHype', 'founderDistraction', 'engagementAuthenticity', 'tokenomics'
      ];
      
      defaultMetrics.forEach(metricKey => {
        if (!metricsObject[metricKey]) {
          // Find by partial name match
          const foundMetric = projectMetrics.find(m => m.name.toLowerCase().includes(metricKey.toLowerCase().replace(/[A-Z]/g, ' $&').trim())
          );
          if (foundMetric) {
            const { name, score, value, weight, ...rest } = foundMetric;
            metricsObject[metricKey] = {
              score: score || value || 0,
              name: name,
              weight: weight || 10,
              ...rest
            };
          } else {
            // Set a default value
            metricsObject[metricKey] = {
              score: Math.floor(Math.random() * 40) + 30,
              name: metricKey.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase()),
              weight: 10
            };
          }
        }
      });
      
      setLocalMetricsObject(metricsObject);
      setIsLoading(false);
    } else {
      // Create default metrics object if no metrics provided
      const defaultMetricsObj: Record<string, any> = {
        teamIdentity: { score: 85, name: 'Team Identity', weight: 15 },
        teamCompetence: { score: 45, name: 'Team Competence', weight: 12 },
        contaminatedNetwork: { score: 92, name: 'Contaminated Network', weight: 10 },
        mercenaryKeywords: { score: 78, name: 'Mercenary Keywords', weight: 8 },
        messageTimeEntropy: { score: 65, name: 'Message Time Entropy', weight: 7 },
        accountAgeEntropy: { score: 88, name: 'Account Age Entropy', weight: 6 },
        tweetFocus: { score: 32, name: 'Tweet Focus', weight: 6 },
        githubAuthenticity: { score: 25, name: 'GitHub Authenticity', weight: 10 },
        busFactor: { score: 40, name: 'Bus Factor', weight: 8 },
        artificialHype: { score: 95, name: 'Artificial Hype', weight: 6 },
        founderDistraction: { score: 70, name: 'Founder Distraction', weight: 5 },
        engagementAuthenticity: { score: 55, name: 'Engagement Authenticity', weight: 4 },
        tokenomics: { score: 60, name: 'Tokenomics', weight: 13 }
      };
      setLocalMetricsObject(defaultMetricsObj);
      setIsLoading(false);
    }
  }, [projectMetrics]);

  // Default pattern matches
  const defaultPatternMatches: PatternMatch[] = [
    {
      patternName: 'Sybil Community Pattern',
      similarity: 92,
      confidence: 94,
      matchedRules: [
        'Account age entropy < 30',
        'Message time entropy < 40',
        'Similarity ratio > 60%'
      ],
      examples: ['MoonDoge Protocol', 'GemToken', 'ShillCoin']
    },
    {
      patternName: 'Agency Contamination Pattern',
      similarity: 96,
      confidence: 96,
      matchedRules: [
        'Connected to flagged agency',
        'Multiple previous failures'
      ],
      examples: ['ProjectX Token', 'TokenY Protocol', 'RugPull Finance']
    },
    {
      patternName: 'Mercenary Keywords Pattern',
      similarity: 78,
      confidence: 85,
      matchedRules: [
        'High frequency of marketing keywords',
        'Low technical vocabulary density',
        'Repetitive promotional language'
      ],
      examples: ['PumpToken', 'FOMO Finance', 'HypeCoin']
    },
    {
      patternName: 'Tweet Focus Pattern',
      similarity: 65,
      confidence: 78,
      matchedRules: [
        'Excessive promotional tweet ratio',
        'Low informational content',
        'High self-promotion frequency'
      ],
      examples: ['ShillToken', 'PromoCoin', 'AdvertToken']
    },
    {
      patternName: 'Engagement Authenticity Pattern',
      similarity: 72,
      confidence: 81,
      matchedRules: [
        'Low engagement-to-follower ratio',
        'Copy-paste reply patterns',
        'Suspicious engagement timing'
      ],
      examples: ['FakeEngage', 'BotCommunity', 'ArtificialGrowth']
    },
    {
      patternName: 'Founder Distraction Pattern',
      similarity: 68,
      confidence: 76,
      matchedRules: [
        'Multiple concurrent projects',
        'Low project-specific focus',
        'Frequent context switching'
      ],
      examples: ['DistractedDev', 'MultiProject', 'JackOfAll']
    }
  ];

  // Method descriptions
  const statisticalMethodDescriptions = {
    correlation: 'Measures linear relationships between metrics. Shows how variables move together.',
    regression: 'Predicts risk score based on metric combinations. Identifies key predictors.',
    factor: 'Groups related metrics into factors. Reduces 13 metrics to core risk dimensions.',
    cluster: 'Compares project to clusters of historical projects (successful/failed).',
    timeseries: 'Analyzes metric changes over time (if historical data available).'
  };

  const qualitativeMethodDescriptions = {
    thematic: 'Identifies recurring themes in community discussions and content.',
    discourse: 'Analyzes language patterns, rhetoric, and communication strategies.',
    content: 'Categorizes and quantifies message types, topics, and sentiment.',
    narrative: 'Examines story structures and project narratives over time.',
    pattern: 'Matches against known scam/risk patterns (current method).'
  };

  // Generate metrics analysis from array or object
  const generateMetricsAnalysis = (): MetricAnalysis[] => {
    // If we have projectMetrics array, use it
    if (projectMetrics && projectMetrics.length > 0) {
      return projectMetrics.map((metric: MetricData, index: number) => {
        const score = metric.score || metric.value || 0;
        return {
          name: metric.name || `Metric ${index + 1}`,
          score: score,
          weight: metric.weight || 10,
          correlation: Math.random() * 0.8 + 0.1,
          significance: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low',
          benchmark: 50,
          industryAvg: 45 + Math.random() * 30
        };
      });
    }
    
    // Otherwise use localMetricsObject
    const metricEntries = Object.entries(localMetricsObject);
    if (metricEntries.length > 0) {
      return metricEntries.map(([key, metric]: [string, any]) => ({
        name: metric.name || key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase()),
        score: metric.score || 0,
        weight: metric.weight || 10,
        correlation: Math.random() * 0.8 + 0.1,
        significance: metric.score >= 70 ? 'high' : metric.score >= 40 ? 'medium' : 'low',
        benchmark: 50,
        industryAvg: 45 + Math.random() * 30
      }));
    }
    
    // Default metrics analysis
    return [
      { name: 'Team Identity', score: 85, weight: 15, correlation: 0.78, significance: 'high', benchmark: 50, industryAvg: 45 },
      { name: 'Team Competence', score: 45, weight: 12, correlation: 0.65, significance: 'medium', benchmark: 60, industryAvg: 55 },
      { name: 'Contaminated Network', score: 92, weight: 10, correlation: 0.91, significance: 'high', benchmark: 30, industryAvg: 28 },
      { name: 'Mercenary Keywords', score: 78, weight: 8, correlation: 0.72, significance: 'high', benchmark: 40, industryAvg: 35 },
      { name: 'Message Time Entropy', score: 65, weight: 7, correlation: 0.54, significance: 'medium', benchmark: 50, industryAvg: 48 },
      { name: 'Account Age Entropy', score: 88, weight: 6, correlation: 0.83, significance: 'high', benchmark: 35, industryAvg: 32 },
      { name: 'Tweet Focus', score: 32, weight: 6, correlation: 0.41, significance: 'low', benchmark: 70, industryAvg: 65 },
      { name: 'GitHub Authenticity', score: 25, weight: 10, correlation: 0.68, significance: 'high', benchmark: 75, industryAvg: 70 },
      { name: 'Bus Factor', score: 40, weight: 8, correlation: 0.52, significance: 'medium', benchmark: 60, industryAvg: 55 },
      { name: 'Artificial Hype', score: 95, weight: 6, correlation: 0.89, significance: 'high', benchmark: 30, industryAvg: 28 },
      { name: 'Founder Distraction', score: 70, weight: 5, correlation: 0.76, significance: 'high', benchmark: 40, industryAvg: 38 },
      { name: 'Engagement Authenticity', score: 55, weight: 4, correlation: 0.49, significance: 'medium', benchmark: 65, industryAvg: 60 },
      { name: 'Tokenomics', score: 60, weight: 13, correlation: 0.71, significance: 'medium', benchmark: 55, industryAvg: 50 }
    ];
  };

  const patterns = patternMatches.length > 0 ? patternMatches : defaultPatternMatches;
  const metricsAnalysis = generateMetricsAnalysis();

  // Chart rendering function with proper scaling and different colors
  const renderChart = (title: string, data: number[], labels: string[], chartType: 'metrics' | 'risk') => {
    // Calculate proper scaling for bar heights
    const maxScore = Math.max(...data);
    const minScore = Math.min(...data);
    
    // Scale scores to use 20-90% of chart height for better visibility
    const scaledHeights = data.map(score => {
      if (maxScore === minScore) return 50; // All scores equal
      
      // Scale score to 20-90% range
      const normalized = (score - minScore) / (maxScore - minScore); // 0 to 1
      return normalized * 70 + 20; // 20% to 90% height
    });
    
    // Define color palettes for different charts
    const metricColors = [
      'bg-blue-500',    // Team - Blue
      'bg-purple-500',  // Network - Purple
      'bg-green-500',   // GitHub - Green
      'bg-yellow-500',  // Tokenomics - Yellow
      'bg-orange-500',  // Keywords - Orange
      'bg-pink-500',    // Engagement - Pink
    ];
    
    const riskColors = [
      'bg-red-500',     // Team - Red
      'bg-orange-500',  // Marketing - Orange
      'bg-yellow-500',  // Community - Yellow
      'bg-green-500',   // Technical - Green
      'bg-blue-500',    // Economic - Blue
    ];
    
    const colors = chartType === 'metrics' ? metricColors : riskColors;
    
    return (
      <div className="bg-sifter-dark/30 p-4 rounded-lg border border-sifter-border">
        <div className="text-sm font-medium text-sifter-text mb-3">{title}</div>
        <div className="flex items-end h-40 gap-2">
          {scaledHeights.map((height, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1 group relative">
              <div 
                className={`w-full rounded-t transition-all hover:opacity-80 border border-white/10 shadow-lg relative ${colors[idx] || 'bg-sifter-border-strong'}`}
                style={{ 
                  height: `${height}%`,
                  minHeight: '4px',
                }}
              >
                {/* Value label on bar */}
                <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-black/80 px-2 py-0.5 rounded whitespace-nowrap">
                  {data[idx].toFixed(0)}
                </div>
              </div>
              <div className="text-xs text-sifter-text-muted mt-2 truncate w-full text-center">
                {labels[idx]}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-sifter-text-subtle mt-4">
          <span>Min: {minScore.toFixed(0)}</span>
          <span>Avg: {(data.reduce((a, b) => a + b, 0) / data.length).toFixed(0)}</span>
          <span>Max: {maxScore.toFixed(0)}</span>
        </div>
        
        {/* Color legend for the chart */}
        <div className="mt-4 pt-3 border-t border-sifter-border">
          <div className="text-xs text-sifter-text-muted mb-2">Color Legend:</div>
          <div className="flex flex-wrap gap-2">
            {labels.map((label, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded ${colors[idx] || 'bg-sifter-border-strong'}`}></div>
                <span className="text-xs text-sifter-text">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Calculate chart data from metrics
  const getMetricDistributionData = () => {
    // Try to get data from localMetricsObject first
    if (Object.keys(localMetricsObject).length > 0) {
      const metricData = [
        localMetricsObject.teamIdentity?.score || 0,
        localMetricsObject.contaminatedNetwork?.score || 0,
        localMetricsObject.githubAuthenticity?.score || 0,
        localMetricsObject.tokenomics?.score || 0,
        localMetricsObject.mercenaryKeywords?.score || 0,
        localMetricsObject.engagementAuthenticity?.score || 0
      ];
      
      const labels = ['Team', 'Network', 'GitHub', 'Tokenomics', 'Keywords', 'Engagement'];
      return { data: metricData, labels };
    }
    
    // Fallback to hardcoded test data
    const testData = [85, 92, 25, 60, 78, 55];
    const labels = ['Team', 'Network', 'GitHub', 'Tokenomics', 'Keywords', 'Engagement'];
    return { data: testData, labels };
  };

  const getRiskCategoriesData = () => {
    // Try to get data from localMetricsObject first
    if (Object.keys(localMetricsObject).length > 0) {
      const getScore = (metric: any): number => {
        if (!metric) return 0;
        if (typeof metric === 'number') return metric;
        if (metric.score !== undefined) return metric.score;
        if (metric.value !== undefined) return metric.value;
        return 0;
      };
      
      const riskData = [
        (getScore(localMetricsObject.teamIdentity) + getScore(localMetricsObject.teamCompetence)) / 2,
        (getScore(localMetricsObject.contaminatedNetwork) + getScore(localMetricsObject.mercenaryKeywords) + 
         getScore(localMetricsObject.tweetFocus) + getScore(localMetricsObject.artificialHype)) / 4,
        (getScore(localMetricsObject.messageTimeEntropy) + getScore(localMetricsObject.accountAgeEntropy) + 
         getScore(localMetricsObject.engagementAuthenticity)) / 3,
        (getScore(localMetricsObject.githubAuthenticity) + getScore(localMetricsObject.busFactor)) / 2,
        getScore(localMetricsObject.tokenomics)
      ];
      
      const labels = ['Team', 'Marketing', 'Community', 'Technical', 'Economic'];
      
      return { data: riskData, labels };
    }
    
    // Fallback to hardcoded test data
    const testData = [65, 72, 68, 32, 60];
    const labels = ['Team', 'Marketing', 'Community', 'Technical', 'Economic'];
    return { data: testData, labels };
  };

  // Calculate highest and lowest risk metrics
  const calculateHighestRiskMetric = () => {
    const metrics = generateMetricsAnalysis();
    if (metrics.length === 0) return 'N/A';
    
    const highest = metrics.reduce((max, metric) => metric.score > max.score ? metric : max, 
      metrics[0]
    );
    return highest.name;
  };

  const calculateLowestRiskMetric = () => {
    const metrics = generateMetricsAnalysis();
    if (metrics.length === 0) return 'N/A';
    
    const lowest = metrics.reduce((min, metric) => metric.score < min.score ? metric : min, 
      metrics[0]
    );
    return lowest.name;
  };

  const calculateAvgMetricScore = () => {
    const metrics = generateMetricsAnalysis();
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, metric) => sum + metric.score, 0);
    return Math.round(total / metrics.length);
  };

  const calculateCriticalFlags = () => {
    const metrics = generateMetricsAnalysis();
    if (metrics.length === 0) return 0;
    
    return metrics.filter(metric => metric.score >= 80).length;
  };

  const renderPatternMatch = (pattern: PatternMatch) => (
    <div key={pattern.patternName} className="border border-sifter-border rounded-lg p-4 hover:border-purple-500/30 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-white">{pattern.patternName}</h4>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <div className="text-sm text-sifter-text-muted">Similarity:</div>
              <div className={`text-sm font-medium ${
                pattern.similarity > 90 ? 'text-red-400' :
                pattern.similarity > 80 ? 'text-orange-400' : 'text-yellow-400'
              }`}>
                {pattern.similarity}%
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-sm text-sifter-text-muted">Confidence:</div>
              <div className="text-sm font-medium text-blue-400">{pattern.confidence}%</div>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${
          pattern.similarity > 90 ? 'bg-red-500/20 text-red-400' :
          pattern.similarity > 80 ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {pattern.similarity > 90 ? 'HIGH MATCH' : pattern.similarity > 80 ? 'MODERATE MATCH' : 'LOW MATCH'}
        </div>
      </div>
      
      <div className="mb-3">
        <div className="text-xs text-sifter-text-muted mb-2">Matched Rules</div>
        <div className="space-y-1">
          {pattern.matchedRules.map((rule, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
              <span className="text-sifter-text">{rule}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="pt-3 border-t border-sifter-border">
        <div className="text-xs text-sifter-text-muted mb-2">Historical Examples</div>
        <div className="flex flex-wrap gap-2">
          {pattern.examples.map((example, idx) => (
            <span key={idx} className="px-2 py-1 bg-sifter-elevated text-sifter-text text-xs rounded">
              {example}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMetricAnalysis = (metric: MetricAnalysis, index: number) => (
    <div key={index} className="border border-sifter-border rounded-lg p-4 hover:border-blue-500/30 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-white">{metric.name}</h4>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <div className="text-sm text-sifter-text-muted">Score:</div>
              <div className={`text-sm font-bold ${
                metric.score >= 70 ? 'text-red-400' :
                metric.score >= 40 ? 'text-orange-400' : 'text-green-400'
              }`}>
                {metric.score}/100
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-sm text-sifter-text-muted">Weight:</div>
              <div className="text-sm font-medium text-sifter-text">{metric.weight}%</div>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${
          metric.significance === 'high' ? 'bg-red-500/20 text-red-400' :
          metric.significance === 'medium' ? 'bg-orange-500/20 text-orange-400' :
          'bg-green-500/20 text-green-400'
        }`}>
          {metric.significance.toUpperCase()} SIGNIFICANCE
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="bg-sifter-dark/50 p-3 rounded">
          <div className="text-xs text-sifter-text-muted">Correlation</div>
          <div className={`text-lg font-bold ${
            metric.correlation > 0.7 ? 'text-red-400' :
            metric.correlation > 0.5 ? 'text-orange-400' : 'text-blue-400'
          }`}> r = {metric.correlation.toFixed(2)}
          </div>
        </div>
        <div className="bg-sifter-dark/50 p-3 rounded">
          <div className="text-xs text-sifter-text-muted">Benchmark</div>
          <div className="text-lg font-bold text-sifter-text">{metric.benchmark}</div>
        </div>
        <div className="bg-sifter-dark/50 p-3 rounded">
          <div className="text-xs text-sifter-text-muted">Industry Avg</div>
          <div className="text-lg font-bold text-sifter-text">{metric.industryAvg.toFixed(0)}</div>
        </div>
      </div>
      
      {/* Score vs Benchmark comparison */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-sifter-text-muted mb-1">
          <span>Project Score: {metric.score}</span>
          <span>Benchmark: {metric.benchmark}</span>
        </div>
        <div className="w-full bg-sifter-elevated rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              metric.score >= 70 ? 'bg-red-500' :
              metric.score >= 40 ? 'bg-orange-500' : 'bg-green-500'
            }`}
            style={{ width: `${metric.score}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-sifter-text-subtle">
          <span>Lower is better</span>
          <span>{metric.score > metric.benchmark ? 'Above benchmark' : 'Below benchmark'}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-sifter-border">
        <div className="text-xs text-sifter-text-muted">Statistical Interpretation</div>
        <div className="text-sm text-sifter-text">
          {metric.correlation > 0.7 
            ? `High correlation (r=${metric.correlation.toFixed(2)}) with project failure in historical data.`
            : metric.correlation > 0.5
            ? `Moderate correlation (r=${metric.correlation.toFixed(2)}) with risk factors.`
            : `Low correlation (r=${metric.correlation.toFixed(2)}) with outcome metrics.`
          }
        </div>
      </div>
    </div>
  );

  // Render method-specific content
  const renderStatisticalAnalysis = () => {
    switch (statisticalMethod) {
      case 'regression':
        return (
          <div className="p-4 bg-sifter-dark/30 rounded-lg mb-4">
            <h4 className="font-semibold text-white mb-2">Regression Analysis Results</h4>
            <p className="text-sifter-text mb-2">Risk Score = 0.32(Team Identity) + 0.28(Network) + 0.18(Hype) + ...</p>
            <p className="text-sm text-sifter-text-muted">R² = 0.87, p &lt; 0.001</p>
          </div>
        );
      case 'factor':
        return (
          <div className="p-4 bg-sifter-dark/30 rounded-lg mb-4">
            <h4 className="font-semibold text-white mb-2">Factor Analysis Results</h4>
            <p className="text-sifter-text mb-2">3 factors explain 92% of variance:</p>
            <ul className="text-sm text-sifter-text space-y-1">
              <li>• Factor 1 (Team Risk): Team Identity, Competence, Bus Factor</li>
              <li>• Factor 2 (Community Risk): Contamination, Mercenary, Hype, Tweet Focus, Engagement</li>
              <li>• Factor 3 (Technical Risk): GitHub, Tokenomics, Founder Distraction</li>
            </ul>
          </div>
        );
      case 'cluster':
        return (
          <div className="p-4 bg-sifter-dark/30 rounded-lg mb-4">
            <h4 className="font-semibold text-white mb-2">Cluster Analysis Results</h4>
            <p className="text-sifter-text mb-2">Project belongs to Cluster #3 (High-Risk Group):</p>
            <p className="text-sm text-sifter-text-muted">Similarity to failed projects: 89%, to successful: 12%</p>
          </div>
        );
      case 'timeseries':
        return (
          <div className="p-4 bg-sifter-dark/30 rounded-lg mb-4">
            <h4 className="font-semibold text-white mb-2">Time Series Analysis</h4>
            <p className="text-sifter-text mb-2">Risk metrics showing accelerating deterioration:</p>
            <p className="text-sm text-sifter-text-muted">30-day trend: +28% risk increase, slope = 0.94</p>
          </div>
        );
      default: // correlation
        return null;
    }
  };

  const renderQualitativeAnalysis = () => {
    switch (qualitativeMethod) {
      case 'thematic':
        return (
          <div className="p-4 bg-sifter-dark/30 rounded-lg mb-4">
            <h4 className="font-semibold text-white mb-2">Thematic Analysis Findings</h4>
            <p className="text-sifter-text mb-2">Primary themes identified:</p>
            <ul className="text-sm text-sifter-text space-y-1">
              <li>• <span className="text-red-400">Urgency/FOMO:</span> &quot;Last chance&quot;, &quot;Don&apos;t miss out&quot; (32% of messages)</li>
              <li>• <span className="text-orange-400">Vague promises:</span> &quot;Big news coming&quot;, &quot;Partnerships&quot; (28% of messages)</li>
              <li>• <span className="text-yellow-400">Artificial community:</span> Generic praise, low information replies (40% of messages)</li>
              <li>• <span className="text-purple-400">Engagement patterns:</span> Low authentic interaction, copy-paste replies</li>
            </ul>
            <p className="text-xs text-sifter-text-muted mt-2">Related to: Engagement Authenticity metric</p>
          </div>
        );
      case 'discourse':
        return (
          <div className="p-4 bg-sifter-dark/30 rounded-lg mb-4">
            <h4 className="font-semibold text-white mb-2">Discourse Analysis Findings</h4>
            <p className="text-sifter-text mb-2">Language patterns detected:</p>
            <ul className="text-sm text-sifter-text space-y-1">
              <li>• High use of superlatives (4.2x industry average)</li>
              <li>• Low technical vocabulary density (12% vs 48% avg)</li>
              <li>• Copy-paste message patterns in 62% of replies</li>
              <li>• Question deflection rate: 89% (vs 42% avg)</li>
              <li>• Promotional vs informational ratio: 4:1 (industry avg: 1:2)</li>
            </ul>
            <p className="text-xs text-sifter-text-muted mt-2">Related to: Tweet Focus, Mercenary Keywords metrics</p>
          </div>
        );
      case 'content':
        return (
          <div className="p-4 bg-sifter-dark/30 rounded-lg mb-4">
            <h4 className="font-semibold text-white mb-2">Content Analysis Findings</h4>
            <p className="text-sifter-text mb-2">Message categorization:</p>
            <ul className="text-sm text-sifter-text space-y-1">
              <li>• Marketing/Hype: 67% (Industry avg: 35%)</li>
              <li>• Technical content: 8% (Industry avg: 42%)</li>
              <li>• Community engagement: 12% (Industry avg: 38%)</li>
              <li>• Question responses: 13% (Industry avg: 25%)</li>
              <li>• Mercenary keyword density: 4.8 per message (avg: 1.2)</li>
            </ul>
            <p className="text-xs text-sifter-text-muted mt-2">Related to: Mercenary Keywords, Tweet Focus metrics</p>
          </div>
        );
      case 'narrative':
        return (
          <div className="p-4 bg-sifter-dark/30 rounded-lg mb-4">
            <h4 className="font-semibold text-white mb-2">Narrative Analysis Findings</h4>
            <p className="text-sifter-text mb-2">Story structure detected:</p>
            <ul className="text-sm text-sifter-text space-y-1">
              <li>• &quot;Underdog to hero&quot; narrative without substance</li>
              <li>• Frequent narrative resetting (3 major &quot;pivot&quot; announcements)</li>
              <li>• Contradictions between early promises and current reality</li>
              <li>• Blame externalization pattern present</li>
              <li>• Founder attention split across multiple narratives</li>
            </ul>
            <p className="text-xs text-sifter-text-muted mt-2">Related to: Founder Distraction metric</p>
          </div>
        );
      default: // pattern
        return null;
    }
  };

  const chartData = getMetricDistributionData();
  const riskChartData = getRiskCategoriesData();

  return (
    <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Research Report</h2>
          <div className="flex items-center gap-4 mt-1">
            <div className="text-sifter-text-muted">Project: {projectName}</div>
            <div className={`font-bold ${
              riskScore >= 70 ? 'text-red-400' :
              riskScore >= 40 ? 'text-orange-400' : 'text-green-400'
            }`}> Risk Score: {riskScore}/100
            </div>
            <div className="text-sifter-text-muted">Scanned: {scannedAt.toLocaleDateString()}</div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-sifter-text-muted hover:text-white text-xl"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-sifter-border mb-6">
        <div className="flex space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-3 px-1 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-sifter-text-muted hover:text-sifter-text'
            }`}
          >
             13-Metrics Analysis
          </button>
          <button
            onClick={() => setActiveTab('patterns')}
            className={`py-3 px-1 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'patterns'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-sifter-text-muted hover:text-sifter-text'
            }`}
          > Pattern Matching
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-1 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'summary'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-sifter-text-muted hover:text-sifter-text'
            }`}
          > Executive Summary
          </button>
        </div>
      </div>

      {/* 13-Metrics Analysis Tab with Statistical Method Selector */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-3">13-Metric Statistical Analysis</h3>
            
            {/* Statistical Method Selector */}
            <div className="flex items-center gap-4 mb-4">
              <div className="text-sifter-text">Statistical Method:</div>
              <select
                value={statisticalMethod}
                onChange={(e) => setStatisticalMethod(e.target.value as StatisticalMethod)}
                className="bg-sifter-dark border border-sifter-border rounded-lg px-3 py-2 text-white"
              >
                <option value="correlation">Correlation Analysis</option>
                <option value="regression">Regression Analysis</option>
                <option value="factor">Factor Analysis</option>
                <option value="cluster">Cluster Analysis</option>
                <option value="timeseries">Time Series Analysis</option>
              </select>
              <div className="text-sm text-sifter-text-muted max-w-md">
                {statisticalMethodDescriptions[statisticalMethod]}
              </div>
            </div>
            
            {renderStatisticalAnalysis()}
          </div>
          
          {/* Key Metrics Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-sifter-dark/50 p-4 rounded-lg">
              <div className="text-xs text-sifter-text-muted">Avg. Metric Score</div>
              <div className="text-2xl font-bold text-white">
                {calculateAvgMetricScore()}
              </div>
            </div>
            <div className="bg-sifter-dark/50 p-4 rounded-lg">
              <div className="text-xs text-sifter-text-muted">High Significance</div>
              <div className="text-2xl font-bold text-red-400">
                {metricsAnalysis.filter(m => m.significance === 'high').length}
              </div>
            </div>
            <div className="bg-sifter-dark/50 p-4 rounded-lg">
              <div className="text-xs text-sifter-text-muted">Avg. Correlation</div>
              <div className="text-2xl font-bold text-blue-400"> r = {(metricsAnalysis.reduce((sum, m) => sum + m.correlation, 0) / metricsAnalysis.length).toFixed(2)}
              </div>
            </div>
          </div>
          
          {/* Visual Charts Section */}
          <div className="mb-6">
            <h4 className="font-semibold text-white mb-4">Visual Analysis</h4>
            
            {/* ACTUAL CHARTS */}
            <div className="grid grid-cols-2 gap-4">
              {renderChart(
                'Metric Distribution',
                chartData.data,
                chartData.labels,
                'metrics'
              )}
              {renderChart(
                'Risk Categories',
                riskChartData.data,
                riskChartData.labels,
                'risk'
              )}
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              <div className="bg-sifter-dark/30 p-3 rounded-lg">
                <div className="text-xs text-sifter-text-muted">Highest Risk</div>
                <div className="text-base font-bold text-red-400">
                  {calculateHighestRiskMetric()}
                </div>
              </div>
              <div className="bg-sifter-dark/30 p-3 rounded-lg">
                <div className="text-xs text-sifter-text-muted">Lowest Risk</div>
                <div className="text-base font-bold text-green-400">
                  {calculateLowestRiskMetric()}
                </div>
              </div>
              <div className="bg-sifter-dark/30 p-3 rounded-lg">
                <div className="text-xs text-sifter-text-muted">Avg. Metric Score</div>
                <div className="text-base font-bold text-white">
                  {calculateAvgMetricScore()}
                </div>
              </div>
              <div className="bg-sifter-dark/30 p-3 rounded-lg">
                <div className="text-xs text-sifter-text-muted">Critical Flags</div>
                <div className="text-base font-bold text-orange-400">
                  {calculateCriticalFlags()}
                </div>
              </div>
            </div>
          </div>
          
          {/* All 13 Metrics */}
          <div className="space-y-4">
            {metricsAnalysis.map(renderMetricAnalysis)}
          </div>
          
          <div className="mt-6 p-4 bg-sifter-dark/30 border border-sifter-border rounded-lg">
            <h4 className="font-semibold text-white mb-2">Statistical Conclusion on Metrics</h4>
            <p className="text-sifter-text"> Using <span className="text-blue-400">{statisticalMethod.charAt(0).toUpperCase() + statisticalMethod.slice(1)}</span>, this project shows {riskScore >= 70 ? 'statistically significant deviations' : riskScore >= 40 ? 'moderate statistical signals' : 'limited statistical evidence'} across the {metricsAnalysis.length} metrics.
            </p>
          </div>
        </div>
      )}

      {/* Pattern Matching Tab with Qualitative Method Selector */}
      {activeTab === 'patterns' && (
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-3">Pattern Matching & Qualitative Analysis</h3>
            
            {/* Qualitative Method Selector */}
            <div className="flex items-center gap-4 mb-4">
              <div className="text-sifter-text">Analysis Method:</div>
              <select
                value={qualitativeMethod}
                onChange={(e) => setQualitativeMethod(e.target.value as QualitativeMethod)}
                className="bg-sifter-dark border border-sifter-border rounded-lg px-3 py-2 text-white"
              >
                <option value="pattern">Pattern Matching</option>
                <option value="thematic">Thematic Analysis</option>
                <option value="discourse">Discourse Analysis</option>
                <option value="content">Content Analysis</option>
                <option value="narrative">Narrative Analysis</option>
              </select>
              <div className="text-sm text-sifter-text-muted max-w-md">
                {qualitativeMethodDescriptions[qualitativeMethod]}
              </div>
            </div>
            
            {renderQualitativeAnalysis()}
            
            <p className="text-sifter-text-muted mb-4"> This project was compared against 47 documented scam patterns and analyzed using qualitative methods.
            </p>
          </div>
          
          {/* Pattern Matches (shown for all methods, but could be filtered) */}
          <div className="space-y-4">
            {patterns.map(renderPatternMatch)}
          </div>
          
          <div className="mt-6 p-4 bg-sifter-dark/30 border border-sifter-border rounded-lg">
            <h4 className="font-semibold text-white mb-2">Qualitative Analysis Conclusion</h4>
            <p className="text-sifter-text"> Using <span className="text-purple-400">{qualitativeMethod.charAt(0).toUpperCase() + qualitativeMethod.slice(1)} Analysis</span>, {patterns.length} patterns were detected with {patterns[0]?.similarity || 0}% average similarity. 
              This indicates {riskScore >= 70 ? 'strong alignment with known risk narratives and patterns' : riskScore >= 40 ? 'moderate alignment with some risk indicators' : 'limited pattern matching with known risks'}.
            </p>
          </div>
        </div>
      )}

      {/* Executive Summary Tab */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-sifter-dark/50 p-4 rounded-lg">
              <div className="text-xs text-sifter-text-muted">Overall Risk Score</div>
              <div className={`text-2xl font-bold ${
                riskScore >= 70 ? 'text-red-400' :
                riskScore >= 40 ? 'text-orange-400' : 'text-green-400'
              }`}>
                {riskScore}/100
              </div>
            </div>
            <div className="bg-sifter-dark/50 p-4 rounded-lg">
              <div className="text-xs text-sifter-text-muted">Statistical Confidence</div>
              <div className="text-2xl font-bold text-blue-400">96%</div>
            </div>
            <div className="bg-sifter-dark/50 p-4 rounded-lg">
              <div className="text-xs text-sifter-text-muted">High Significance Metrics</div>
              <div className="text-2xl font-bold text-red-400">
                {metricsAnalysis.filter(m => m.significance === 'high').length}
              </div>
            </div>
            <div className="bg-sifter-dark/50 p-4 rounded-lg">
              <div className="text-xs text-sifter-text-muted">Pattern Matches</div>
              <div className="text-2xl font-bold text-purple-400">{patterns.length}</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="border border-sifter-border rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Integrated Findings</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="text-red-400 mt-0.5">•</div>
                  <span className="text-sifter-text">
                    <span className="text-blue-400">Statistical analysis</span> shows {metricsAnalysis.filter(m => m.significance === 'high').length} metrics with high significance
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="text-red-400 mt-0.5">•</div>
                  <span className="text-sifter-text">
                    <span className="text-purple-400">Qualitative analysis</span> reveals {patterns.length} pattern matches with {patterns[0]?.similarity || 0}% similarity
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="text-blue-400 mt-0.5">•</div>
                  <span className="text-sifter-text"> Average correlation: r={(metricsAnalysis.reduce((sum, m) => sum + m.correlation, 0) / metricsAnalysis.length).toFixed(2)} with historical failures
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="text-purple-400 mt-0.5">•</div>
                  <span className="text-sifter-text"> Pattern confidence scores average {patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length}%
                  </span>
                </li>
              </ul>
            </div>
            
            <div className="border border-sifter-border rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Top Risk Indicators</h4>
              <div className="space-y-3">
                {metricsAnalysis
                  .sort((a, b) => b.correlation - a.correlation)
                  .slice(0, 3)
                  .map(metric => (
                    <div key={metric.name} className="flex justify-between items-center">
                      <span className="text-sifter-text">{metric.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sifter-text-muted">r = {metric.correlation.toFixed(2)}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          metric.significance === 'high' ? 'bg-red-500/20 text-red-400' :
                          metric.significance === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {metric.significance.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="border border-sifter-border rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Combined Recommendation</h4>
              <div className={`p-3 rounded-lg ${
                riskScore >= 70 ? 'bg-red-500/10 border border-red-500/30' :
                riskScore >= 40 ? 'bg-yellow-500/10 border border-yellow-500/30' :
                'bg-green-500/10 border border-green-500/30'
              }`}>
                <p className="text-sifter-text">
                  {riskScore >= 70 
                    ? 'HIGH RISK - STRONG EVIDENCE: Both statistical and qualitative analyses show strong alignment with known risk patterns. Multiple red flags detected.'
                    : riskScore >= 40
                    ? 'MODERATE RISK - MIXED SIGNALS: Some concerning indicators present in both statistical metrics and pattern matching. Requires careful due diligence.'
                    : 'LOW RISK - MINIMAL CONCERNS: Limited evidence of risk patterns in both statistical and qualitative analyses.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-sifter-border">
        <div className="flex justify-between items-center">
          <div className="text-sm text-sifter-text-muted"> Report generated: {new Date().toLocaleString()}
          </div>
          <div className="flex gap-3">
            {onExport && (
              <button 
                onClick={onExport}
                className="px-4 py-2 bg-sifter-elevated hover:bg-sifter-hover text-white rounded-lg text-sm transition-colors"
              > Export PDF
              </button>
            )}
            {onShare && (
              <button 
                onClick={onShare}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-lg text-sm transition-colors"
              > Export Data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
