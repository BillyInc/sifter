// components/BatchSummary.tsx
'use client';

import React from 'react';
import { BatchProcessingJob } from '@/types';

interface BatchSummaryProps {
  job: BatchProcessingJob;
}

export default function BatchSummary({ job }: BatchSummaryProps) {
  const { summary } = job;
  
  const getPercentage = (count: number) => {
    return ((count / summary.total) * 100).toFixed(1);
  };

  return (
    <div className="bg-sifter-card border border-sifter-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Batch Results Summary</h2>
          <p className="text-gray-400">
            {job.name} • Completed: {job.completedAt?.toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Processing Time</div>
          <div className="text-2xl font-bold text-white">{summary.processingTime} min</div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900/50 p-6 rounded-xl">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-sm text-gray-400 mb-1">Total Scanned</div>
          <div className="text-3xl font-bold text-white">{summary.total} projects</div>
        </div>
        
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl">
          <div className="text-4xl mb-2">🚫</div>
          <div className="text-sm text-gray-400 mb-1">Reject (Don't forward)</div>
          <div className="text-3xl font-bold text-red-400">
            {summary.rejected} ({getPercentage(summary.rejected)}%)
          </div>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-xl">
          <div className="text-4xl mb-2">⚠️</div>
          <div className="text-sm text-gray-400 mb-1">Flag (Needs review)</div>
          <div className="text-3xl font-bold text-yellow-400">
            {summary.flagged} ({getPercentage(summary.flagged)}%)
          </div>
        </div>
        
        <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-xl">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-sm text-gray-400 mb-1">Pass (Forward to partner)</div>
          <div className="text-3xl font-bold text-green-400">
            {summary.passed} ({getPercentage(summary.passed)}%)
          </div>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="mb-8">
        <h3 className="font-medium text-white mb-4">Risk Score Distribution</h3>
        <div className="h-8 bg-gray-900 rounded-lg overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center text-white text-xs font-medium"
            style={{ width: `${getPercentage(summary.rejected)}%` }}
          >
            {getPercentage(summary.rejected)}%
          </div>
          <div
            className="h-full bg-gradient-to-r from-yellow-600 to-yellow-500 flex items-center justify-center text-black text-xs font-medium"
            style={{ width: `${getPercentage(summary.flagged)}%` }}
          >
            {getPercentage(summary.flagged)}%
          </div>
          <div
            className="h-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center text-white text-xs font-medium"
            style={{ width: `${getPercentage(summary.passed)}%` }}
          >
            {getPercentage(summary.passed)}%
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>🚫 Reject ({summary.rejected})</span>
          <span>⚠️ Flag ({summary.flagged})</span>
          <span>✅ Pass ({summary.passed})</span>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900/50 p-5 rounded-xl">
          <div className="text-sm text-gray-400 mb-2">Average Risk Score</div>
          <div className={`text-3xl font-bold ${
            summary.averageRiskScore >= 60 ? 'text-red-400' :
            summary.averageRiskScore >= 40 ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {summary.averageRiskScore}/100
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {summary.averageRiskScore >= 60 ? 'High overall risk' :
             summary.averageRiskScore >= 40 ? 'Moderate overall risk' : 'Low overall risk'}
          </div>
        </div>
        
        <div className="bg-gray-900/50 p-5 rounded-xl">
          <div className="text-sm text-gray-400 mb-2">Top Red Flag</div>
          <div className="text-2xl font-bold text-white">
            {Object.entries(summary.redFlagDistribution)
              .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Most common issue across rejected projects
          </div>
        </div>
        
        <div className="bg-gray-900/50 p-5 rounded-xl">
          <div className="text-sm text-gray-400 mb-2">Success Rate</div>
          <div className="text-3xl font-bold text-green-400">
            {getPercentage(summary.passed)}%
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Projects passing initial screening
          </div>
        </div>
      </div>

      {/* Red Flag Distribution */}
      {summary.redFlagDistribution && (
        <div className="mt-8">
          <h3 className="font-medium text-white mb-4">Common Red Flags</h3>
          <div className="space-y-3">
            {Object.entries(summary.redFlagDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([flag, count], index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-300">{flag}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(count / summary.rejected) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-medium w-10 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}