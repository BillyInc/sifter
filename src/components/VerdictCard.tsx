'use client';

import { useState } from 'react';
import { VerdictData, MetricData } from '@/types';
import { getRiskTier } from '@/data/scoring';

interface VerdictCardProps {
  data: VerdictData;
  onReject: () => void;
  onProceed: () => void;
  onReset: () => void;
  compact?: boolean;
}

function MetricRow({
  metric,
  isLast,
  showWeight,
  compact = false,
}: {
  metric: MetricData;
  isLast: boolean;
  showWeight: boolean;
  compact?: boolean;
}) {
  const getScoreColor = (score: number | undefined) => {
    const safeScore = score || 0;
    if (safeScore >= 70) return 'text-red-400';
    if (safeScore >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getScoreBg = (score: number | undefined) => {
    const safeScore = score || 0;
    if (safeScore >= 70) return 'bg-red-500/10';
    if (safeScore >= 40) return 'bg-yellow-500/10';
    return 'bg-green-500/10';
  };

  const metricScore = metric.score || (typeof metric.value === 'number' ? metric.value : 0);
  const isComposite = metric.key === 'composite_score';

  return (
    <div
      className={`${compact ? 'py-2' : 'py-3'} ${
        !isLast ? 'border-b border-gray-800/50' : ''
      } ${isComposite ? 'pt-4 mt-2 border-t border-gray-700' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`${compact ? 'text-sm' : 'text-sm'} font-medium ${
                isComposite
                  ? `text-white ${compact ? 'text-base' : 'text-base'}`
                  : 'text-gray-300'
              }`}
            >
              {metric.name}
            </span>
            {showWeight && !isComposite && (
              <span className={`${compact ? 'text-xs' : 'text-xs'} text-gray-600`}>
                ({(metric.weight * 100).toFixed(0)}%)
              </span>
            )}
            {isComposite && (
              <span
                className={`${compact ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5'} rounded ${getScoreBg(
                  metricScore
                )} ${getScoreColor(metricScore)}`}
              >
                {metricScore >= 75 ? 'HIGH RISK' : metricScore >= 50 ? 'ELEVATED' : metricScore >= 30 ? 'MODERATE' : 'LOW RISK'}
              </span>
            )}
          </div>
          {metric.subline && !compact && (
            <p className={`${compact ? 'text-xs' : 'text-xs'} text-gray-500 mt-1`}>
              {metric.subline}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`${compact ? 'text-xs' : 'text-sm'} ${
              isComposite
                ? `font-bold ${compact ? 'text-base' : 'text-lg'} ${getScoreColor(metricScore)}`
                : 'text-gray-400'
            }`}
          >
            {metric.value}
          </span>
          {!isComposite && (
            <div className="flex items-center gap-2">
              <div
                className={`${compact ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-xs'} rounded-full flex items-center justify-center font-medium ${getScoreBg(
                  metricScore
                )} ${getScoreColor(metricScore)}`}
              >
                {metricScore}
              </div>
              {showWeight && (
                <div className={`${compact ? 'w-10' : 'w-12'} text-right`}>
                  <span className={`${compact ? 'text-xs' : 'text-xs'} text-gray-500`}>
                    +{metric.contribution.toFixed(compact ? 0 : 1)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreBreakdownChart({ data, compact = false }: { data: VerdictData; compact?: boolean }) {
  const getBarColor = (score: number) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const sortedBreakdown = [...data.breakdown].sort(
    (a, b) => b.contribution - a.contribution
  );

  return (
    <div className={`${compact ? 'bg-gray-900/30 p-3 rounded' : 'bg-gray-900/50 rounded-lg p-4'}`}>
      <h4 className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-300 ${compact ? 'mb-2' : 'mb-3'}`}>
        Score Breakdown (by contribution)
      </h4>
      <div className={`space-y-${compact ? '1.5' : '2'}`}>
        {sortedBreakdown.slice(0, compact ? 3 : undefined).map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <div
              className={`${compact ? 'w-24 text-xs' : 'w-32 text-xs'} text-gray-400 truncate`}
              title={item.name}
            >
              {item.name}
            </div>
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBarColor(item.score)} transition-all duration-500`}
                style={{
                  width: `${Math.min((item.contribution / data.compositeScore) * 100, 100)}%`,
                }}
              />
            </div>
            <div className={`${compact ? 'w-14' : 'w-16'} text-right`}>
              <span className={`${compact ? 'text-xs' : 'text-xs'} text-gray-500`}>
                +{item.contribution.toFixed(compact ? 0 : 1)}
              </span>
            </div>
          </div>
        ))}
        {compact && sortedBreakdown.length > 3 && (
          <div className="text-xs text-gray-500 pt-1 text-center">
            +{sortedBreakdown.length - 3} more metrics
          </div>
        )}
      </div>
      <div className={`${compact ? 'mt-2 pt-2' : 'mt-3 pt-3'} border-t border-gray-800 flex justify-between items-center`}>
        <span className={`${compact ? 'text-xs' : 'text-sm'} text-gray-400`}>
          Total Score
        </span>
        <span className={`${compact ? 'text-base' : 'text-lg'} font-bold text-white`}>
          {data.compositeScore}/100
        </span>
      </div>
    </div>
  );
}

export default function VerdictCard({
  data,
  onReject,
  onProceed,
  onReset,
  compact = false,
}: VerdictCardProps) {
  const [showWeights, setShowWeights] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const isReject = data.verdict?.toLowerCase() === 'reject';
  const riskTierInfo = getRiskTier(data.compositeScore);

  return (
    <div className={`w-full ${compact ? 'max-w-xl' : 'max-w-2xl'} mx-auto`}>
      {/* Verdict Header */}
      <div
        className={`${compact ? 'rounded-xl p-4' : 'rounded-t-2xl p-6'} ${
          isReject
            ? 'bg-gradient-to-r from-red-900/80 to-red-800/80'
            : 'bg-gradient-to-r from-green-900/80 to-green-800/80'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className={`flex items-center gap-${compact ? '2' : '3'} ${compact ? 'mb-1' : 'mb-2'}`}>
              {isReject ? (
                <svg
                  className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} text-red-400`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              ) : (
                <svg
                  className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} text-green-400`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <h2
                className={`${compact ? 'text-xl' : 'text-2xl'} font-bold ${
                  isReject ? 'text-red-100' : 'text-green-100'
                }`}
              >
                {data.verdict?.toUpperCase()}
              </h2>
            </div>
            <p className={`${compact ? 'text-sm' : 'text-sm'} text-white/80`}>
              {data.projectName}
            </p>
            <p className={`${compact ? 'text-xs' : 'text-xs'} text-white/50 font-mono ${compact ? 'mt-0.5' : 'mt-1'}`}>
              {data.inputValue}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`${compact ? 'text-4xl' : 'text-5xl'} font-bold ${
                isReject ? 'text-red-300' : 'text-green-300'
              }`}
            >
              {data.compositeScore}
            </div>
            <div className={`${compact ? 'text-xs' : 'text-sm'} ${riskTierInfo.color}`}>
              {riskTierInfo.label}
            </div>
            <div className={`${compact ? 'text-xs' : 'text-xs'} text-white/40`}>
              Composite Score
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`bg-sifter-card ${compact ? 'border-x border-sifter-border px-4 py-2' : 'border-x border-sifter-border px-6 py-3'} flex justify-between items-center border-b border-gray-800`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWeights(!showWeights)}
            className={`${compact ? 'text-xs px-2 py-0.5' : 'text-xs px-3 py-1'} rounded-full transition-colors ${
              showWeights
                ? 'bg-sifter-blue text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {showWeights ? 'Hide Weights' : 'Show Weights'}
          </button>
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className={`${compact ? 'text-xs px-2 py-0.5' : 'text-xs px-3 py-1'} rounded-full transition-colors ${
              showBreakdown
                ? 'bg-sifter-blue text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {showBreakdown ? 'Hide Breakdown' : 'Score Breakdown'}
          </button>
        </div>
        <div className={`${compact ? 'text-xs' : 'text-xs'} text-gray-500`}>
          {data.metrics.length} metrics weighted
        </div>
      </div>

      {/* Score Breakdown Chart */}
      {showBreakdown && (
        <div className={`bg-sifter-card border-x border-sifter-border ${compact ? 'px-4 py-3' : 'px-6 py-4'} border-b border-gray-800`}>
          <ScoreBreakdownChart data={data} compact={compact} />
        </div>
      )}

      {/* Metrics List */}
      <div className={`bg-sifter-card border-x border-sifter-border ${compact ? 'px-4 py-1' : 'px-6 py-2'}`}>
        {data.metrics.slice(0, compact ? 5 : undefined).map((metric, index) => (
          <MetricRow
            key={metric.key}
            metric={metric}
            isLast={index === (compact ? Math.min(4, data.metrics.length - 1) : data.metrics.length - 1)}
            showWeight={showWeights}
            compact={compact}
          />
        ))}
        {compact && data.metrics.length > 5 && (
          <div className="py-2 text-center border-t border-gray-800/50 mt-2">
            <span className="text-xs text-gray-500">
              +{data.metrics.length - 5} more metrics
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div
        className={`${compact ? 'rounded-b-xl p-4' : 'rounded-b-2xl p-6'} border border-t-0 ${
          isReject
            ? 'bg-red-950/30 border-red-900/30'
            : 'bg-sifter-card border-sifter-border'
        }`}
      >
        <div className={`flex ${compact ? 'flex-col gap-2' : 'flex-col sm:flex-row gap-3'}`}>
          {isReject ? (
            <>
              <button
                onClick={onReject}
                className={`flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold ${compact ? 'py-2 px-4 text-sm' : 'py-3 px-6'} rounded-lg transition-colors`}
              >
                Reject
              </button>
              <button
                onClick={onProceed}
                className={`flex-1 bg-transparent hover:bg-white/5 text-gray-300 hover:text-white font-medium ${compact ? 'py-2 px-4 text-sm' : 'py-3 px-6'} rounded-lg border border-gray-600 hover:border-gray-500 transition-colors`}
              >
                {compact ? 'Proceed Anyway' : 'Proceed to Due Diligence anyway'}
              </button>
            </>
          ) : (
            <button
              onClick={onProceed}
              className={`flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold ${compact ? 'py-2 px-4 text-sm' : 'py-3 px-6'} rounded-lg transition-colors`}
            >
              {compact ? 'Proceed' : 'Proceed to Due Diligence'}
            </button>
          )}
        </div>
        <button
          onClick={onReset}
          className={`w-full ${compact ? 'mt-2' : 'mt-3'} text-gray-500 hover:text-gray-400 ${compact ? 'text-xs' : 'text-sm'} transition-colors`}
        >
          Analyze another project
        </button>
      </div>

      {/* Timestamp */}
      <p className={`text-center text-gray-600 ${compact ? 'text-xs mt-2' : 'text-xs mt-4'}`}>
        Analyzed at{' '}
        {new Date(data.analyzedAt).toLocaleString('en-US', {
          dateStyle: 'short',
          timeStyle: 'short',
        })}
      </p>
    </div>
  );
}
