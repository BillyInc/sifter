'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
} from 'chart.js';
import { Bar, Pie, Line, Radar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
);

// FIXED: Update ChartData interface to allow both string and string[]
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[] | string; // FIXED: Can be string[] OR string
    borderColor?: string[] | string;    // FIXED: Can be string[] OR string
    borderWidth?: number;
    tension?: number;
  }[];
}

interface ResearchChartsProps {
  riskCategories?: any[];
  metricDistribution?: any[];
  projects?: any[];
}

export default function ResearchCharts({
  riskCategories = [],
  metricDistribution = [],
  projects = []
}: ResearchChartsProps) {
  
  // Default mock data if none provided
  const defaultRiskCategories = [
    { category: 'Team Risk', count: 12, color: '#EF4444' },
    { category: 'Tokenomics Risk', count: 8, color: '#F59E0B' },
    { category: 'Community Risk', count: 15, color: '#10B981' },
    { category: 'Technical Risk', count: 6, color: '#3B82F6' },
    { category: 'Market Risk', count: 9, color: '#8B5CF6' },
  ];

  const defaultMetricDistribution = [
    { metric: 'Team Identity', weight: 15, color: '#EF4444' },
    { metric: 'Team Competence', weight: 12, color: '#F59E0B' },
    { metric: 'Contaminated Network', weight: 10, color: '#10B981' },
    { metric: 'Mercenary Keywords', weight: 8, color: '#3B82F6' },
    { metric: 'GitHub Authenticity', weight: 10, color: '#8B5CF6' },
    { metric: 'Tokenomics', weight: 13, color: '#EC4899' },
    { metric: 'Bus Factor', weight: 8, color: '#6366F1' },
  ];

  // FIXED: Use array for borderColor
  const riskData: ChartData = {
    labels: (riskCategories.length > 0 ? riskCategories : defaultRiskCategories).map(item => item.category),
    datasets: [
      {
        label: 'Projects Count',
        data: (riskCategories.length > 0 ? riskCategories : defaultRiskCategories).map(item => item.count),
        backgroundColor: (riskCategories.length > 0 ? riskCategories : defaultRiskCategories).map(item => item.color),
        borderColor: (riskCategories.length > 0 ? riskCategories : defaultRiskCategories).map(() => '#1F2937'), // FIXED: array
        borderWidth: 1,
      },
    ],
  };

  // FIXED: Use array for borderColor
  const metricData: ChartData = {
    labels: (metricDistribution.length > 0 ? metricDistribution : defaultMetricDistribution).map(item => item.metric),
    datasets: [
      {
        label: 'Weight %',
        data: (metricDistribution.length > 0 ? metricDistribution : defaultMetricDistribution).map(item => item.weight),
        backgroundColor: (metricDistribution.length > 0 ? metricDistribution : defaultMetricDistribution).map(item => item.color),
        borderColor: (metricDistribution.length > 0 ? metricDistribution : defaultMetricDistribution).map(() => '#1F2937'), // FIXED: array
        borderWidth: 1,
      },
    ],
  };

  // FIXED: Handle empty projects array safely
  const projectTimelineData = {
    labels: (projects?.slice(0, 5) || []).map((p: any) => {
      const name = p.displayName || p.projectName || p.name || 'Project';
      return name.length > 15 ? name.substring(0, 15) + '...' : name;
    }),
    datasets: [
      {
        label: 'Risk Score',
        data: (projects?.slice(0, 5) || []).map((p: any) => {
          return p.overallRisk?.score || p.riskScore || 0;
        }),
        borderColor: '#3B82F6', // FIXED: string (not array)
        backgroundColor: 'rgba(59, 130, 246, 0.1)', // FIXED: string (not array)
        tension: 0.3,
      },
      {
        label: 'Composite Score',
        data: (projects?.slice(0, 5) || []).map((p: any) => {
          return p.compositeScore || p.overallRisk?.score || p.riskScore || 0;
        }),
        borderColor: '#10B981', // FIXED: string (not array)
        backgroundColor: 'rgba(16, 185, 129, 0.1)', // FIXED: string (not array)
        tension: 0.3,
      },
    ],
  };

  // FIXED: Use strings for backgroundColor and borderColor
  const radarData = {
    labels: ['Team', 'Tokenomics', 'Community', 'Technical', 'Market'],
    datasets: [
      {
        label: 'Average Scores',
        data: [65, 59, 80, 81, 56],
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // FIXED: string
        borderColor: '#3B82F6', // FIXED: string
        borderWidth: 2,
      },
      {
        label: 'Your Portfolio',
        data: [75, 45, 90, 70, 65],
        backgroundColor: 'rgba(16, 185, 129, 0.2)', // FIXED: string
        borderColor: '#10B981', // FIXED: string
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#D1D5DB',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#9CA3AF',
          maxRotation: 45,
        },
        grid: {
          color: 'rgba(55, 65, 81, 0.3)',
        },
      },
      y: {
        ticks: {
          color: '#9CA3AF',
        },
        grid: {
          color: 'rgba(55, 65, 81, 0.3)',
        },
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#D1D5DB',
          padding: 20,
          font: {
            size: 11
          }
        }
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#D1D5DB',
        }
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#9CA3AF',
        },
        grid: {
          color: 'rgba(55, 65, 81, 0.3)',
        },
      },
      y: {
        ticks: {
          color: '#9CA3AF',
        },
        grid: {
          color: 'rgba(55, 65, 81, 0.3)',
        },
        min: 0,
        max: 100,
      },
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#D1D5DB',
        }
      },
    },
    scales: {
      r: {
        angleLines: {
          color: 'rgba(55, 65, 81, 0.3)',
        },
        grid: {
          color: 'rgba(55, 65, 81, 0.3)',
        },
        pointLabels: {
          color: '#D1D5DB',
        },
        ticks: {
          color: '#9CA3AF',
          backdropColor: 'transparent',
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Categories Chart */}
        <div className="bg-sifter-card border border-sifter-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Risk Categories Distribution</h3>
            <div className="text-xs text-gray-400">Across all projects</div>
          </div>
          <div className="h-72">
            <Bar data={riskData} options={options} />
          </div>
          <div className="mt-4 text-sm text-gray-400">
            Shows the distribution of different risk types across analyzed projects.
          </div>
        </div>

        {/* Metric Weight Distribution */}
        <div className="bg-sifter-card border border-sifter-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Metric Weight Distribution</h3>
            <div className="text-xs text-gray-400">13-metric analysis</div>
          </div>
          <div className="h-72">
            <Pie data={metricData} options={pieOptions} />
          </div>
          <div className="mt-4 text-sm text-gray-400">
            Shows the weight distribution of the 13 risk metrics in the composite score.
          </div>
        </div>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Risk Timeline */}
        <div className="bg-sifter-card border border-sifter-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Project Risk Timeline</h3>
            <div className="text-xs text-gray-400">Top 5 projects</div>
          </div>
          <div className="h-64">
            <Line data={projectTimelineData} options={lineOptions} />
          </div>
          <div className="mt-4 text-sm text-gray-400">
            Compares risk scores vs composite scores across different projects.
          </div>
        </div>

        {/* Risk Radar Chart */}
        <div className="bg-sifter-card border border-sifter-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Risk Profile Radar</h3>
            <div className="text-xs text-gray-400">Portfolio analysis</div>
          </div>
          <div className="h-64">
            <Radar data={radarData} options={radarOptions} />
          </div>
          <div className="mt-4 text-sm text-gray-400">
            Compares average portfolio scores against your selected projects.
          </div>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-sifter-card border border-sifter-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">13</div>
          <div className="text-xs text-gray-400">Metrics Analyzed</div>
        </div>
        <div className="bg-sifter-card border border-sifter-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">87</div>
          <div className="text-xs text-gray-400">Avg. Score</div>
        </div>
        <div className="bg-sifter-card border border-sifter-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">42%</div>
          <div className="text-xs text-gray-400">High Risk</div>
        </div>
        <div className="bg-sifter-card border border-sifter-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">1.2s</div>
          <div className="text-xs text-gray-400">Avg. Scan Time</div>
        </div>
      </div>
    </div>
  );
}