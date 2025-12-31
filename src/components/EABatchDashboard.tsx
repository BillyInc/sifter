'use client';

import React, { useState } from 'react';
import SmartInputParser from './SmartInputParser';
import MetricBreakdown from './MetricBreakdown';
import {
  BatchProcessingJob,
  BatchProject,
  SmartInputResult,
  ProjectData,
  MetricData,
  VerdictType,
} from '@/types';
import { generateMockProjectData } from '@/data/mockData';
import { ExportService } from '@/services/exportService';
import { BatchFlagButton } from '@/components/data-donation/ea-vc';
import BulkFlaggingModal from '@/components/data-donation/ea-vc/BulkFlaggingOption';
import { generateDetailedMetricEvidence } from '@/utils/metricHelpers';

// ADD THIS WRAPPER COMPONENT HERE
const BatchFlagButtonWrapper: React.FC<{
  projectName: string;
  entityName: string;
  riskScore: number;
  context: string;
  onFlag: (entityData: {
    entityName: string;
    projectName: string;
    context: string;
    riskScore?: number;
  }) => void;
}> = (props) => {
  return <BatchFlagButton {...props} />;
};

// First, let's extend the BatchProject type locally since it's missing flaggedEntity
type ExtendedBatchProject = BatchProject & {
  flaggedEntity?: string; // Add the missing property
};

interface EABatchDashboardProps {
  onBatchUpload: (files: File[]) => void;
  onSingleAnalysis: () => void;
  onBack: () => void;
  userEmail: string;
  onAnalyze: (input: string) => void;
  onBatchUploadComplete: (job: BatchProcessingJob) => void;
  onViewProjectDetails: (project: BatchProject) => void;

  recentBatches?: BatchProcessingJob[];
  batchStats?: {
    totalProcessed: number;
    averageProcessingTime: number;
    rejectionRate: number;
    lastBatchDate: Date;
  };
  // Export props
  onExportBatch?: (projects: BatchProject[]) => void;
  onExportPartnerPacket?: (batchSummary: any, projects: BatchProject[]) => void;
  onExportBatchCSV?: (projects: BatchProject[]) => void;
  // NEW: Data donation props
  onStandardForm?: (entityData: {
    entityName: string;
    projectName: string;
    context: string;
    riskScore?: number;
  }) => void;
  onBulkFlagEntities?: (entities: Array<{
    id: string;
    name: string;
    projectCount: number;
    projects: string[];
    confidence: number;
  }>) => void;
}

// Helper function to create a metric data object WITH FIXED SCORE PROPERTY
const createMetricData = (key: string, name: string, score: number): MetricData => {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const detailedEvidence = generateDetailedMetricEvidence(key, normalizedScore, {});

  return {
    id: `metric_${key}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    key,
    name,
    value: normalizedScore,
    weight: 10,
    contribution: normalizedScore * 0.1,
    status: score < 30 ? 'low' : score < 50 ? 'moderate' : score < 70 ? 'high' : 'critical',
    confidence: Math.floor(Math.random() * 30) + 70,
    flags: [],
    evidence: [detailedEvidence],
    score: normalizedScore,
    scoreValue: normalizedScore
  };
};

// Fixed: Simple function to ensure metrics have score property
const ensureMetricsHaveScore = (metricsArray: MetricData[]): MetricData[] => {
  return metricsArray.map(metric => ({
    ...metric,
    score: typeof metric.value === 'number' ? metric.value : 0
  }));
};

// Create metrics array with all 13 metrics - RANDOMIZED SCORES
const createMetricsArray = (): MetricData[] => {
  const metrics: MetricData[] = [];

  metrics.push(createMetricData('teamIdentity', 'Team Identity', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('teamCompetence', 'Team Competence', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('contaminatedNetwork', 'Contaminated Network', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('mercenaryKeywords', 'Mercenary Keywords', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('messageTimeEntropy', 'Message Time Entropy', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('accountAgeEntropy', 'Account Age Entropy', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('tweetFocus', 'Tweet Focus', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('githubAuthenticity', 'GitHub Authenticity', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('busFactor', 'Bus Factor', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('artificialHype', 'Artificial Hype', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('founderDistraction', 'Founder Distraction', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('engagementAuthenticity', 'Engagement Authenticity', Math.floor(Math.random() * 100)));
  metrics.push(createMetricData('tokenomics', 'Tokenomics', Math.floor(Math.random() * 100)));

  return metrics;
};

// Helper function to convert BatchProject to ProjectData
const convertBatchToProjectData = (batchProject: BatchProject): ProjectData => {
  const metricsArray = createMetricsArray();
  const metricsWithScore = ensureMetricsHaveScore(metricsArray);

  const compositeScore = Math.round(
    metricsWithScore.reduce((sum, m) => sum + (m.score || 0), 0) / metricsWithScore.length
  );

  // Get verdict with proper type
  const getVerdict = (): VerdictType => {
    const score = batchProject.riskScore || compositeScore;
    if (score < 30) return 'pass';
    if (score < 60) return 'flag';
    return 'reject';
  };

  // Get risk tier based on score
  const getRiskTier = (score: number) => {
    if (score < 20) return 'LOW';
    if (score < 40) return 'MODERATE';
    if (score < 60) return 'ELEVATED';
    if (score < 80) return 'HIGH';
    return 'CRITICAL';
  };

  return {
    id: batchProject.id,
    canonicalName: batchProject.name.toLowerCase().replace(/\s+/g, '_'),
    displayName: batchProject.name,
    description: `Batch analysis for ${batchProject.name}`,
    platform: 'batch_analysis',
    sources: [
      {
        type: 'batch_analysis',
        url: 'https://sifter.ai/batch',
        input: batchProject.input || 'batch_input'
      }
    ],
    metrics: metricsWithScore,
    overallRisk: {
      score: batchProject.riskScore || compositeScore,
      verdict: getVerdict(),
      tier: getRiskTier(batchProject.riskScore || compositeScore),
      confidence: Math.floor(Math.random() * 30) + 70,
      breakdown: [
        `Batch analysis complete for ${batchProject.name}`,
        `Risk score: ${batchProject.riskScore || compositeScore}/100`,
        `Verdict: ${getVerdict()}`
      ]
    },
    scannedAt: new Date(),
    processingTime: batchProject.processingTime || 45000,
  };
};

// BatchUpload Component
const BatchUpload = ({
  onUpload,
  onUploadComplete
}: {
  onUpload: (files: File[]) => void;
  onUploadComplete: (job: BatchProcessingJob) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (files: File[]) => {
    onUpload(files);

    const job: BatchProcessingJob = {
      id: `batch_${Date.now()}`,
      name: `Batch Upload ${new Date().toLocaleDateString()}`,
      status: 'processing',
      projects: [],
      summary: {
        total: files.length,
        passed: 0,
        flagged: 0,
        rejected: 0,
        averageRiskScore: 0,
        processingTime: 0,
        redFlagDistribution: {}
      },
      createdAt: new Date(),
      completedAt: undefined
    };

    onUploadComplete(job);
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-sifter-border hover:border-blue-500/50'
          }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const files = Array.from(e.dataTransfer.files);
          handleFileUpload(files);
        }}
      >
        <div className="text-4xl mb-4">📁</div>
        <h4 className="font-semibold text-white mb-2">Drop CSV file here</h4>
        <p className="text-gray-400 text-sm mb-4">or</p>
        <label className="inline-block cursor-pointer">
          <input
            type="file"
            accept=".csv,.json,.txt"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              handleFileUpload(files);
            }}
          />
          <div className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
            Browse Files
          </div>
        </label>
        <p className="text-gray-500 text-xs mt-4">
          Supports CSV, JSON, TXT formats
        </p>
      </div>
    </div>
  );
};

// BatchSummaryComponent
const BatchSummaryComponent = ({
  job,
  batchStats,
  onOpenBulkFlagging
}: {
  job: BatchProcessingJob;
  batchStats: {
    totalProcessed: number;
    averageProcessingTime: number;
    rejectionRate: number;
    lastBatchDate: Date;
  };
  onOpenBulkFlagging?: () => void;
}) => {
  const averageRiskScore = job.summary?.averageRiskScore || 0;
  const totalProjects = job.summary?.total || job.projects?.length || 0;

  return (
    <div className="bg-sifter-card border border-sifter-border rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Batch Summary</h3>

      <div className="flex overflow-x-auto border-b border-sifter-border -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="bg-sifter-dark/50 border border-sifter-border rounded-xl p-4">
          <div className="text-2xl font-bold text-white mb-1">{batchStats.totalProcessed}</div>
          <div className="text-sm text-gray-400">Total Processed</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {Math.round((1 - batchStats.rejectionRate) * 100)}%
          </div>
          <div className="text-sm text-gray-400">Success Rate</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            {Math.round(batchStats.averageProcessingTime / 60)}m
          </div>
          <div className="text-sm text-gray-400">Avg Processing Time</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-red-400 mb-1">
            {Math.round(batchStats.rejectionRate * 100)}%
          </div>
          <div className="text-sm text-gray-400">Rejection Rate</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Last Batch Date</span>
            <span className="text-white font-medium">
              {batchStats.lastBatchDate.toLocaleDateString()}
            </span>
          </div>
        </div>

        {averageRiskScore > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Average Risk Score</span>
              <span className="text-white font-medium">{averageRiskScore}/100</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${averageRiskScore < 30 ? 'bg-green-500' :
                  averageRiskScore < 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                style={{ width: `${averageRiskScore}%` }}
              />
            </div>
          </div>
        )}

        {totalProjects > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Projects in this batch</span>
              <span className="text-white font-medium">{totalProjects}</span>
            </div>
          </div>
        )}
      </div>
      {/* ✅ ADD THIS SECTION HERE - before the closing </div> */}
      {job.summary && job.summary.rejected > 0 && onOpenBulkFlagging && (
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-amber-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.998-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Suspicious entities detected
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Review entities appearing in multiple rejected projects
              </div>
            </div>
            <button
              onClick={onOpenBulkFlagging}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              Review Entities
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ProjectCardWithFlagging Component - NEW
const ProjectCardWithFlagging = ({
  project,
  onViewDetails,
  onStandardForm
}: {
  project: ExtendedBatchProject;
  onViewDetails: (project: BatchProject) => void;
  onStandardForm?: (entityData: {
    entityName: string;
    projectName: string;
    context: string;
    riskScore?: number;
  }) => void;
}) => {
  const riskScore = project.riskScore || 0;
  const topRedFlag = project.redFlags && project.redFlags.length > 0
    ? project.redFlags[0]
    : 'No red flags detected';
  const verdict = project.verdict || 'unknown';

  // Detect if there's a suspicious entity in this project
  const flaggedEntity = project.flaggedEntity || (riskScore > 60 ? `Suspicious Entity (${project.name})` : null);

  return (
    <div className="border-b border-sifter-border/50 hover:bg-sifter-dark/30 p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="font-medium text-white">{project.name}</div>
          <div className="text-xs text-gray-500">{project.input}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${riskScore < 30 ? 'bg-green-500/20 text-green-400' :
            riskScore < 60 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
            <div className={`w-2 h-2 rounded-full ${riskScore < 30 ? 'bg-green-500' :
              riskScore < 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
            {riskScore}/100
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-300">{topRedFlag}</div>
        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${verdict === 'pass' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          verdict === 'flag' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
            'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
          {verdict === 'pass' ? '✓ Pass' :
            verdict === 'flag' ? '⚠ Flag' : '✗ Reject'}
        </div>
      </div>

      {/* NEW: Data donation section for suspicious entities */}
      {flaggedEntity && riskScore > 60 && (
        <div className="mt-3 pt-3 border-t border-amber-500/30">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm text-amber-300 font-medium">
                ⚠️ {flaggedEntity}
              </p>
              <p className="text-xs text-gray-400">
                Detected during batch analysis
              </p>
            </div>
            {onStandardForm && (
              <BatchFlagButtonWrapper
                projectName={project.name}
                entityName={flaggedEntity}
                riskScore={riskScore}
                context="Batch analysis"
                onFlag={onStandardForm}
              />
            )}
          </div>
        </div>
      )}

      <div className="mt-3">
        <button
          onClick={() => onViewDetails(project)}
          className="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors"
        >
          View Full Analysis
        </button>
      </div>
    </div>
  );
};

// BatchResultsTable Component - UPDATED WITH FLAGGING
const BatchResultsTable = ({
  projects,
  onViewDetails,
  onExportBatch,
  onExportBatchCSV,
  onStandardForm
}: {
  projects: ExtendedBatchProject[];
  onViewDetails: (project: BatchProject) => void;
  onExportBatch?: (projects: BatchProject[]) => void;
  onExportBatchCSV?: (projects: BatchProject[]) => void;
  onStandardForm?: (entityData: {
    entityName: string;
    projectName: string;
    context: string;
    riskScore?: number;
  }) => void;
}) => {
  const handleExportCSV = () => {
    if (onExportBatchCSV) {
      onExportBatchCSV(projects);
    } else {
      ExportService.exportBatchToCSV(projects);
    }
  };

  const handleExportPDF = () => {
    if (onExportBatch) {
      onExportBatch(projects);
    } else {
      const projectDataArray = projects.map(convertBatchToProjectData);
      ExportService.exportAllAnalyses(projectDataArray);
    }
  };

  return (
    <div className="bg-sifter-card border border-sifter-border rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Batch Results</h3>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="space-y-2">
          {projects.slice(0, 10).map((project) => (
            <ProjectCardWithFlagging
              key={project.id}
              project={project}
              onViewDetails={onViewDetails}
              onStandardForm={onStandardForm}
            />
          ))}
        </div>
      </div>

      {projects.length > 10 && (
        <div className="mt-6 text-center text-gray-500 text-sm">
          Showing 10 of {projects.length} projects
        </div>
      )}
    </div>
  );
};

export default function EABatchDashboard({
  onBatchUpload,
  onSingleAnalysis,
  onBack,
  userEmail,
  onAnalyze,
  onBatchUploadComplete,
  onViewProjectDetails,

  recentBatches = [],
  batchStats = {
    totalProcessed: 0,
    averageProcessingTime: 0,
    rejectionRate: 0,
    lastBatchDate: new Date()
  },
  // Export props
  onExportBatch,
  onExportPartnerPacket,
  onExportBatchCSV,
  // NEW: Data donation props
  onStandardForm,
  onBulkFlagEntities
}: EABatchDashboardProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('batch');
  const [batchJob, setBatchJob] = useState<BatchProcessingJob | null>(null);
  const [showBatchResults, setShowBatchResults] = useState(false);
  const [showSingleAnalysis, setShowSingleAnalysis] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ExtendedBatchProject | null>(null);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [detailedMetrics, setDetailedMetrics] = useState<MetricData[]>([]);
  const [batchTextInput, setBatchTextInput] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  // NEW: Bulk flagging state
  const [showBulkFlagging, setShowBulkFlagging] = useState(false);
  const [suspiciousEntities, setSuspiciousEntities] = useState<Array<{
    id: string;
    name: string;
    projectCount: number;
    projects: string[];
    confidence: number;
  }>>([]);

  // Single analysis state - MOVED TO TOP LEVEL
  const [inputValue, setInputValue] = useState('');
  const [showBlitzSelector, setShowBlitzSelector] = useState(false);
  const [selectedBlitzMode, setSelectedBlitzMode] = useState<'hyper' | 'momentum' | 'deep'>('deep');
  const [isMemecoin, setIsMemecoin] = useState(false);

  const generateMockBatchProjects = (): ExtendedBatchProject[] => {
    const suspiciousEntities = [
      'RugAgencyX',
      'DevAnonymous',
      'MarketingBotFarm',
      'PumpGroupAlpha',
      'ScamContractor'
    ];

    return Array.from({ length: 50 }, (_, i) => {
      // Create consistent hash from project name for seeding
      const projectName = `Project ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`;
      const seed = projectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

      // Use seed to generate consistent risk score for this project
      const riskScore = (seed % 80) + 20; // Range: 20-100

      let verdict: VerdictType = 'reject';
      if (riskScore < 30) verdict = 'pass';
      else if (riskScore < 60) verdict = 'flag';

      const flaggedEntity = riskScore > 60
        ? suspiciousEntities[(seed % suspiciousEntities.length)]
        : undefined;

      return {
        id: `project_${i}`,
        name: projectName,
        input: `project${i}.com`,
        status: 'complete',
        riskScore,
        verdict,
        redFlags: riskScore > 80 ? ['Known rug agency'] :
          riskScore > 60 ? ['Anonymous team'] :
            riskScore > 40 ? ['Mixed signals'] : [],
        processingTime: Math.floor((seed % 60) * 1000) + 30000,
        scannedAt: new Date(),
        weight: Math.random(),
        confidence: Math.floor((seed % 30)) + 70,
        flaggedEntity
      };
    });
  };
  
  // NEW: Function to detect suspicious entities from batch results
  const analyzeBatchForEntities = (projects: ExtendedBatchProject[]) => {
    const entities: Record<string, {
      id: string;
      name: string;
      projectCount: number;
      projects: string[];
      confidence: number;
    }> = {};

    projects.forEach(project => {
      if (project.flaggedEntity && project.riskScore && project.riskScore > 60) {
        const entityName = project.flaggedEntity;
        if (!entities[entityName]) {
          entities[entityName] = {
            id: `entity_${Object.keys(entities).length}`,
            name: entityName,
            projectCount: 0,
            projects: [],
            confidence: Math.min(95, (project.riskScore || 0) + 10)
          };
        }
        entities[entityName].projectCount++;
        entities[entityName].projects.push(project.name);
      }
    });

    return Object.values(entities);
  };

  const handleBatchUploadComplete = (job: BatchProcessingJob) => {
    setBatchJob(job);
    setProcessing(true);

    // Simulate processing
    setTimeout(() => {
      const mockProjects = generateMockBatchProjects();
      const completedJob: BatchProcessingJob = {
        ...job,
        status: 'complete',
        completedAt: new Date(),
        projects: mockProjects,
        summary: {
          total: mockProjects.length,
          passed: mockProjects.filter(p => p.verdict === 'pass').length,
          flagged: mockProjects.filter(p => p.verdict === 'flag').length,
          rejected: mockProjects.filter(p => p.verdict === 'reject').length,
          averageRiskScore: Math.round(mockProjects.reduce((sum, p) => sum + (p.riskScore || 0), 0) / mockProjects.length),
          processingTime: Math.floor((Date.now() - job.createdAt.getTime()) / 1000),
          redFlagDistribution: {
            'Known rug agency': Math.floor(mockProjects.filter(p => p.verdict === 'reject').length * 0.3),
            'Anonymous team': Math.floor(mockProjects.filter(p => p.verdict === 'reject').length * 0.25),
            'Bot activity': Math.floor(mockProjects.filter(p => p.verdict === 'reject').length * 0.2),
            'Short vesting': Math.floor(mockProjects.filter(p => p.verdict === 'reject').length * 0.15),
            'Other': Math.floor(mockProjects.filter(p => p.verdict === 'reject').length * 0.1)
          }
        }
      };

      setBatchJob(completedJob);
      setProcessing(false);
      setShowBatchResults(true);

      // NEW: Analyze for suspicious entities
      const entities = analyzeBatchForEntities(mockProjects);
      setSuspiciousEntities(entities);

      if (onBatchUploadComplete) {
        onBatchUploadComplete(completedJob);
      }
    }, 2000);
  };

  // NEW: Handle entity flagging
  const handleStandardForm = (entityData: {
    entityName: string;
    projectName: string;
    context: string;
    riskScore?: number;
  }) => {
    if (onStandardForm) {
      onStandardForm(entityData);
    }
    alert(`Flagged entity: ${entityData.entityName} from project: ${entityData.projectName}`);
  };

  // NEW: Handle bulk flagging
  const handleBulkFlag = (entities: Array<{
    id: string;
    name: string;
    projectCount: number;
    projects: string[];
    confidence: number;
  }>) => {
    if (onBulkFlagEntities) {
      onBulkFlagEntities(entities);
    }
    setShowBulkFlagging(false);
    alert(`Flagged ${entities.length} suspicious entities for review`);
  };

  const handleSmartInputResolve = (result: SmartInputResult) => {
    if (result.selectedEntity) {
      const mockMetrics = createMetricsArray();
      const metricsWithScore = ensureMetricsHaveScore(mockMetrics);
      setDetailedMetrics(metricsWithScore);

      const compositeScore = Math.round(
        metricsWithScore.reduce((sum, m) => sum + (m.score || 0), 0) / metricsWithScore.length
      );

      const mockProjectData: ProjectData = {
        id: 'single_project',
        canonicalName: result.selectedEntity.canonicalName || result.selectedEntity.displayName.toLowerCase().replace(/\s+/g, '_'),
        displayName: result.selectedEntity.displayName,
        description: `Single analysis for ${result.selectedEntity.displayName}`,
        platform: result.selectedEntity.platform || 'unknown',
        sources: [
          {
            type: result.selectedEntity.platform || 'website',
            url: result.selectedEntity.url || result.input,
            input: result.input
          }
        ],
        metrics: metricsWithScore,
        overallRisk: {
          score: compositeScore,
          verdict: compositeScore >= 60 ? 'reject' : compositeScore >= 30 ? 'flag' : 'pass',
          tier: compositeScore < 20 ? 'LOW' : compositeScore < 40 ? 'MODERATE' : compositeScore < 60 ? 'ELEVATED' : compositeScore < 80 ? 'HIGH' : 'CRITICAL',
          confidence: 85,
          breakdown: [
            `Single analysis complete for ${result.selectedEntity.displayName}`,
            `Risk score: ${compositeScore}/100`,
            `Verdict: ${compositeScore >= 60 ? 'Reject' : compositeScore >= 30 ? 'Flag' : 'Pass'}`
          ]
        },
        scannedAt: new Date(),
        processingTime: 45000,
      };

      setProjectData(mockProjectData);

      setSelectedProject({
        id: 'single_project',
        name: result.selectedEntity.displayName,
        input: result.input,
        status: 'complete',
        riskScore: compositeScore,
        verdict: compositeScore >= 60 ? 'reject' : compositeScore >= 30 ? 'flag' : 'pass',
        redFlags: compositeScore > 80 ? ['Known rug agency'] :
          compositeScore > 60 ? ['Anonymous team'] :
            compositeScore > 40 ? ['Mixed signals'] : [],
        processingTime: 45000,
        scannedAt: new Date(),
        weight: Math.random(),
        confidence: 85,
        flaggedEntity: undefined
      });

      setShowSingleAnalysis(true);
    }
  };

  const handleTextBatchProcessing = () => {
    const projects = parseTextInput(batchTextInput);
    if (projects.length === 0) {
      alert('Please enter at least one project');
      return;
    }
    if (projects.length > 100) {
      alert(`Maximum 100 projects. You entered ${projects.length}.`);
      return;
    }

    const job: BatchProcessingJob = {
      id: `batch_${Date.now()}`,
      name: `Text Batch ${new Date().toLocaleDateString()}`,
      status: 'processing',
      projects: [],
      summary: {
        total: projects.length,
        passed: 0,
        flagged: 0,
        rejected: 0,
        averageRiskScore: 0,
        processingTime: 0,
        redFlagDistribution: {}
      },
      createdAt: new Date(),
      completedAt: undefined
    };

    handleBatchUploadComplete(job);
  };

  const parseTextInput = (text: string): string[] => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 100);
  };

  const downloadCSVTemplate = () => {
    const csvContent = `Project Name,Twitter,Discord,Website,Notes
MoonDoge Protocol,@moondoge,discord.gg/moondoge,https://moondoge.io,High risk potential
DeFi Alpha,@defialpha,discord.gg/defialpha,https://defialpha.com,Clean project
TokenSwap Pro,@tokenswap,discord.gg/tokenswap,https://tokenswap.pro,Needs review
ChainBridge,@chainbridge,discord.gg/chainbridge,https://chainbridge.io,Good fundamentals
Vault Protocol,@vaultproto,discord.gg/vault,https://vaultprotocol.com,Strong team`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sifter_batch_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAnalyzeClick = () => {
    const input = prompt('Enter project name or URL:');
    if (input) {
      onAnalyze(input);
    }
  };

  // Handle partner packet export - FIXED VERSION
  const handleExportPartnerPacket = () => {
    if (batchJob && batchJob.projects && batchJob.summary) {
      if (onExportPartnerPacket) {
        onExportPartnerPacket(batchJob.summary, batchJob.projects);
      } else {
        // ✅ Create properly typed packet
        const packet = {
          summary: {
            total: batchJob.summary.total,
            passed: batchJob.summary.passed,
            flagged: batchJob.summary.flagged,
            rejected: batchJob.summary.rejected,
            averageRiskScore: batchJob.summary.averageRiskScore,
            processingTime: batchJob.summary.processingTime,
            redFlagDistribution: batchJob.summary.redFlagDistribution || {},
            generatedAt: new Date().toISOString()
          },
          projects: batchJob.projects.map(p => ({
            name: p.name,
            riskScore: p.riskScore || 0,
            verdict: (p.verdict || 'unknown') as VerdictType | 'unknown', // ✅ Explicit type assertion
            redFlags: p.redFlags || [],
            processingTime: p.processingTime || 0,
            scannedAt: p.scannedAt || new Date()
          }))
        };

        ExportService.exportPartnerPacket(packet);
      }
    } else {
      alert('No batch data available to export. Please process a batch first.');
    }
  };

  // Handle export analysis
  const handleExportAnalysis = (projectDataForExport: ProjectData) => {
    ExportService.exportProjectAnalysis(projectDataForExport);
  };

  // Helper function for single analysis
  const performSingleAnalysis = (projectName: string, mode: 'hyper' | 'momentum' | 'deep') => {
    setProcessing(true);

    setTimeout(() => {
      const allMetrics = createMetricsArray();
      let filteredMetrics = allMetrics;

      if (mode === 'hyper') {
        filteredMetrics = allMetrics.filter(m =>
          ['contaminatedNetwork', 'tokenomics', 'teamIdentity', 'githubAuthenticity'].includes(m.key)
        );
      } else if (mode === 'momentum') {
        filteredMetrics = allMetrics.filter(m =>
          ['artificialHype', 'engagementAuthenticity', 'mercenaryKeywords', 'tweetFocus'].includes(m.key)
        );
      }

      const compositeScore = Math.round(filteredMetrics.reduce((sum, m) => sum + m.contribution, 0));

      const mockProjectData: ProjectData = {
        id: `proj_${Date.now()}`,
        displayName: projectName,
        canonicalName: projectName.toLowerCase().replace(/\s+/g, '-'),
        overallRisk: {
          score: compositeScore,
          verdict: compositeScore >= 60 ? 'reject' : compositeScore >= 30 ? 'flag' : 'pass',
          tier: compositeScore < 25 ? 'LOW' : compositeScore < 50 ? 'MODERATE' : compositeScore < 75 ? 'ELEVATED' : 'HIGH',
          confidence: 85
        },
        metrics: filteredMetrics,
        sources: [{ type: 'manual', url: '' }],
        scannedAt: new Date(),
        processingTime: mode === 'hyper' ? 8000 : mode === 'momentum' ? 52000 : 227000,
      };

      setProjectData(mockProjectData);
      setDetailedMetrics(filteredMetrics);
      setSelectedProject({
        id: `project_${Date.now()}`,
        name: projectName,
        input: projectName,
        status: 'complete',
        riskScore: compositeScore,
        verdict: compositeScore >= 60 ? 'reject' : compositeScore >= 30 ? 'flag' : 'pass',
        redFlags: compositeScore > 80 ? ['Known rug agency'] :
          compositeScore > 60 ? ['Anonymous team'] :
            compositeScore > 40 ? ['Mixed signals'] : [],
        processingTime: mockProjectData.processingTime,
        scannedAt: new Date(),
        weight: Math.random(),
        confidence: 85,
        flaggedEntity: undefined
      });

      setProcessing(false);
      setShowSingleAnalysis(true);
    }, 2000);
  };

  // Handle smart input for single analysis
  const handleSmartInputResolveSingle = (result: SmartInputResult) => {
    if (!result.selectedEntity) return;

    setInputValue(result.input);

    const tokenAgeMinutes = Math.floor(Math.random() * 60);
    const hasVolumeSpike = Math.random() > 0.6;
    const detectedAsMemecoin = tokenAgeMinutes < 20 || hasVolumeSpike;

    setIsMemecoin(detectedAsMemecoin);

    if (detectedAsMemecoin) {
      setSelectedBlitzMode('hyper');
      setShowBlitzSelector(true);
    } else {
      setSelectedBlitzMode('deep');
      performSingleAnalysis(result.selectedEntity.displayName, 'deep');
    }
  };

  if (showSingleAnalysis && selectedProject && projectData) {
    const riskScore = selectedProject.riskScore || 0;

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setShowSingleAnalysis(false);
              setSelectedProject(null);
              setProjectData(null);
              setDetailedMetrics([]);
            }}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Batch Results
          </button>
          <h2 className="text-xl font-bold text-white">Project Analysis: {selectedProject.name}</h2>
        </div>

        <MetricBreakdown
          instanceId="batch-analysis"
          metrics={detailedMetrics}
          projectName={selectedProject.name}
          riskScore={riskScore}
          onExport={() => {
            handleExportAnalysis(projectData);
          }}
        />
      </div>
    );
  }

  if (showBatchResults && batchJob) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setShowBatchResults(false);
              setBatchJob(null);
            }}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Upload
          </button>
          <div className="text-right">
            <div className="text-sm text-gray-400">Batch Analysis Complete</div>
            <div className="text-lg font-semibold text-white">{batchJob.name}</div>
          </div>
        </div>

        <BatchSummaryComponent
          job={batchJob}
          batchStats={batchStats}
          onOpenBulkFlagging={() => setShowBulkFlagging(true)}
        />

        {/* Partner Packet Export Button */}
        <div className="flex justify-end">
          <button
            onClick={handleExportPartnerPacket}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            📦 Export Partner Packet
          </button>
        </div>

        {batchJob.projects && batchJob.projects.length > 0 && (
          <BatchResultsTable
            projects={batchJob.projects as ExtendedBatchProject[]}
            onViewDetails={(project) => {
              const enrichedProject = project as ExtendedBatchProject;

              // Convert BatchProject to full ProjectData
              const fullProjectData = convertBatchToProjectData(enrichedProject);

              // Set the states
              setSelectedProject(enrichedProject);
              setProjectData(fullProjectData);
              setDetailedMetrics(fullProjectData.metrics);
              setShowSingleAnalysis(true);

              if (onViewProjectDetails) {
                onViewProjectDetails(project);
              }
            }}
            onExportBatch={onExportBatch}
            onExportBatchCSV={onExportBatchCSV}
            onStandardForm={handleStandardForm}
          />
        )}

        {/* NEW: Bulk Flagging Modal */}
        {suspiciousEntities.length > 0 && (
          <BulkFlaggingModal
            isOpen={showBulkFlagging}
            onClose={() => setShowBulkFlagging(false)}
            entities={suspiciousEntities}
            onFlagAll={() => handleBulkFlag(suspiciousEntities)}
            onFlagSelected={(selectedIds) => {
              const selected = suspiciousEntities.filter(e => selectedIds.includes(e.id));
              handleBulkFlag(selected);
            }}
          />
        )}
      </div>
    );
  }

  // Main dashboard rendering
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">VC/EA Batch Mode</h1>
          <p className="text-gray-400">Batch processing for deal flow screening</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">Analyst</div>
            <div className="font-medium text-white">{userEmail}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-sifter-border">
        <button
          onClick={() => setActiveTab('batch')}
          className={`px-6 py-3 font-medium ${activeTab === 'batch'
            ? 'text-blue-400 border-b-2 border-blue-400'
            : 'text-gray-400 hover:text-gray-300'
            }`}
        >
          📤 Batch Upload
        </button>
        <button
          onClick={() => setActiveTab('single')}
          className={`px-6 py-3 font-medium ${activeTab === 'single'
            ? 'text-blue-400 border-b-2 border-blue-400'
            : 'text-gray-400 hover:text-gray-300'
            }`}
        >
          🔍 Single Project
        </button>
      </div>

      {/* Batch Upload Tab */}
      {activeTab === 'batch' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Upload Section */}
          <div className="space-y-6">
            <div className="bg-sifter-card border border-sifter-border rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Upload Files</h3>
              <BatchUpload
                onUpload={onBatchUpload}
                onUploadComplete={handleBatchUploadComplete}
              />
            </div>

            {/* Recent Batches */}
            {recentBatches.length > 0 && (
              <div className="bg-sifter-card border border-sifter-border rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Batches</h3>
                <div className="space-y-3">
                  {recentBatches.slice(0, 3).map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-3 bg-sifter-dark/50 rounded-lg">
                      <div>
                        <div className="font-medium text-white">{batch.name}</div>
                        <div className="text-sm text-gray-400">
                          {batch.summary?.total || batch.projects?.length || 0} projects • {batch.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${batch.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                        batch.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                        {batch.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Text Input Section */}
          <div className="space-y-6">
            <div className="bg-sifter-card border border-sifter-border rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Batch Text Input</h3>
                <div className="text-sm text-gray-400">
                  {batchTextInput.split('\n').filter(l => l.trim()).length}/100 projects
                </div>
              </div>

              <textarea
                value={batchTextInput}
                onChange={(e) => setBatchTextInput(e.target.value)}
                placeholder={`Enter project names, Twitter handles, Discord invites, or URLs (one per line):

Example:
MoonDoge Protocol
@moondoge_fi
discord.gg/moondoge
https://twitter.com/defialpha
github.com/projectx
https://projectx.com`}
                rows={12}
                className="w-full bg-sifter-dark border border-sifter-border rounded-xl p-4 text-white font-mono text-sm focus:border-blue-500 focus:outline-none resize-none whitespace-pre-wrap break-words"
              />

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-400">
                  Max 100 projects. Supports any format.
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setBatchTextInput('')}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    disabled={!batchTextInput.trim()}
                  >
                    Clear
                  </button>

                  <button
                    onClick={handleTextBatchProcessing}
                    disabled={!batchTextInput.trim() || processing}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Processing...' : 'Process Batch'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-sifter-card border border-sifter-border rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setActiveTab('single');
                  }}
                  className="p-4 border border-sifter-border rounded-xl hover:border-blue-500/50 hover:bg-sifter-card/50 transition-all text-center"
                >
                  <div className="text-2xl mb-2">🔍</div>
                  <div className="font-medium text-white">Single Analysis</div>
                  <div className="text-sm text-gray-400">Analyze one project</div>
                </button>
                <button
                  onClick={handleAnalyzeClick}
                  className="p-4 border border-sifter-border rounded-xl hover:border-blue-500/50 hover:bg-sifter-card/50 transition-all text-center"
                >
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-medium text-white">Quick Analyze</div>
                  <div className="text-sm text-gray-400">Manual input</div>
                </button>
              </div>
            </div>

            {/* CSV Template */}
            <div className="bg-sifter-card border border-sifter-border rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">CSV Template</h3>
              <button
                onClick={downloadCSVTemplate}
                className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Project Tab */}
      {activeTab === 'single' && (
        <div className="space-y-6">
          <div className="bg-sifter-card border border-sifter-border rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Single Project Analysis</h3>
            <p className="text-gray-400 mb-6">Deep dive into one project with 13-metric evaluation</p>

            <div className="max-w-4xl mx-auto">
              <SmartInputParser
                onResolve={handleSmartInputResolveSingle}
                placeholder="Enter project name, Twitter handle, Discord invite, GitHub repo, or website URL..."
                compact={false}
              />
            </div>
          </div>

          {/* Blitz Selector */}
          {showBlitzSelector && (
            <div className="bg-sifter-card border border-blue-500/30 rounded-xl p-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">⚡</span>
                Memecoin Detected — Choose Your Scan Speed
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => performSingleAnalysis(inputValue, 'hyper')}
                  className={`p-6 rounded-lg border-2 transition-all ${selectedBlitzMode === 'hyper'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-sifter-border hover:border-blue-500/50'
                    }`}
                >
                  <div className="text-5xl mb-3">⚡</div>
                  <h4 className="font-bold text-white text-lg">Hyper-Blitz</h4>
                  <p className="text-sm text-gray-400 mt-2">5–10 seconds • New launches</p>
                </button>

                <button
                  onClick={() => performSingleAnalysis(inputValue, 'momentum')}
                  className={`p-6 rounded-lg border-2 transition-all ${selectedBlitzMode === 'momentum'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-sifter-border hover:border-purple-500/50'
                    }`}
                >
                  <div className="text-5xl mb-3">📈</div>
                  <h4 className="font-bold text-white text-lg">Momentum-Blitz</h4>
                  <p className="text-sm text-gray-400 mt-2">30–90 seconds • Active tokens</p>
                </button>

                <button
                  onClick={() => performSingleAnalysis(inputValue, 'deep')}
                  className={`p-6 rounded-lg border-2 transition-all ${selectedBlitzMode === 'deep'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-sifter-border hover:border-green-500/50'
                    }`}
                >
                  <div className="text-5xl mb-3">🔍</div>
                  <h4 className="font-bold text-white text-lg">Deep-Blitz</h4>
                  <p className="text-sm text-gray-400 mt-2">2–5 minutes • Full analysis</p>
                </button>
              </div>
            </div>
          )}

          {/* Quick Examples */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-3">Quick demo:</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => performSingleAnalysis('MoonRocket Finance', 'deep')}
                className="text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors"
              >
                View REJECT example (High Risk 70+)
              </button>
              <button
                onClick={() => performSingleAnalysis('Aave Protocol', 'deep')}
                className="text-sm text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 px-4 py-2 rounded-lg transition-colors"
              >
                View PASS example (Low Risk {'<'}30)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {processing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-sifter-card border border-sifter-border rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4 animate-pulse">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-2">Processing Batch</h3>
              <p className="text-gray-400 mb-6">
                Analyzing {batchJob?.summary?.total || 0} projects...
              </p>
              <div className="w-full bg-gray-800 rounded-full h-2 mb-4 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm text-gray-500">
                This usually takes 1-3 minutes depending on batch size
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}