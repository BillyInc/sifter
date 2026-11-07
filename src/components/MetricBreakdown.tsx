'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MetricData, ProjectData, VerdictType, getRiskTier, getVerdict } from '@/types';
import { Badge, Button, cn } from '@/components/ui';

interface MetricBreakdownProps {
  metrics: MetricData[];
  onExport?: () => void;
  onBack?: () => void;
  projectName?: string;
  riskScore?: number;
  projectData?: ProjectData;
  instanceId?: string;
  compact?: boolean;
  /**
   * Whether `riskScore` was computed from these same metric rows. When false the
   * contribution strip is presented as a weighted comparison, never as a share
   * of the headline. Defaults to a numeric check for callers that do not say.
   */
  headlineFromMetrics?: boolean;
  /**
   * The verdict the analysis already assigned. Pass it so this view matches the
   * verdict card shown alongside it; the fallback only derives one from the score.
   */
  verdict?: VerdictType;
}

/** Plain-language description per metric key. Weights come from the metric data itself. */
const METRIC_DESCRIPTIONS: Record<string, string> = {
  teamIdentity: 'Team legitimacy and identity verification',
  teamCompetence: 'Technical ability and track record',
  contaminatedNetwork: 'Connections to known bad actors',
  mercenaryKeywords: 'Financial vs genuine community discourse',
  messageTimeEntropy: 'Natural vs coordinated posting patterns',
  accountAgeEntropy: 'Organic vs bulk account creation',
  tweetFocus: 'Narrative consistency and coherence',
  githubAuthenticity: 'Real development vs copy-paste code',
  busFactor: 'Single point of failure risk',
  artificialHype: 'Organic vs paid growth campaigns',
  founderDistraction: 'Focus on building vs personal brand',
  engagementAuthenticity: 'Genuine vs performative engagement',
  tokenomics: 'Economic structure and fairness',
};

/** Display weights used only when a metric row carries no weight of its own. */
const METRIC_WEIGHTS_FALLBACK: Record<string, number> = {
  teamIdentity: 13, teamCompetence: 11, contaminatedNetwork: 19, mercenaryKeywords: 9,
  messageTimeEntropy: 5, accountAgeEntropy: 5, tweetFocus: 7, githubAuthenticity: 10,
  busFactor: 2, artificialHype: 5, founderDistraction: 6, engagementAuthenticity: 10, tokenomics: 7,
};

type Level = 'minimal' | 'low' | 'moderate' | 'high' | 'critical';

const levelOf = (score: number): Level => score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 40 ? 'moderate' : score >= 20 ? 'low' : 'minimal';

const LEVEL_STYLE: Record<Level, { text: string; bar: string; label: string }> = {
  minimal: { text: 'text-green-300', bar: 'bg-green-400', label: 'Minimal risk' },
  low: { text: 'text-green-300', bar: 'bg-green-500', label: 'Low risk' },
  moderate: { text: 'text-amber-300', bar: 'bg-amber-400', label: 'Moderate risk' },
  high: { text: 'text-orange-300', bar: 'bg-orange-500', label: 'High risk' },
  critical: { text: 'text-red-300', bar: 'bg-red-500', label: 'Critical risk' },
};

const VERDICT_TONE = { pass: 'success', flag: 'warning', reject: 'danger' } as const;
const VERDICT_LABEL = { pass: 'Pass', flag: 'Flag', reject: 'Reject' } as const;

const summaryOf = (metric: MetricData, score: number): string => {
  if (metric.flags && metric.flags.length > 0) return metric.flags[0];
  return LEVEL_STYLE[levelOf(score)].label + ' on this signal.';
};

export default function MetricBreakdown({
  metrics,
  onExport,
  onBack,
  projectName = 'Unknown project',
  riskScore = 0,
  projectData,
  instanceId = '',
  compact = false,
  headlineFromMetrics,
  verdict: verdictProp,
}: MetricBreakdownProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const shareDialogRef = useRef<HTMLDialogElement>(null);
  const shareTriggerRef = useRef<HTMLButtonElement>(null);

  // Native <dialog> gives focus containment and Escape for free.
  useEffect(() => {
    const dialog = shareDialogRef.current;
    if (!dialog) return;
    if (showShare && !dialog.open) dialog.showModal();
    if (!showShare && dialog.open) dialog.close();
  }, [showShare]);

  // Runs for Escape, Cancel and the action buttons alike; returns focus to the opener.
  const handleShareClose = () => {
    setShowShare(false);
    shareTriggerRef.current?.focus();
  };

  const rows = useMemo(() => {
    const processed = metrics.map((metric, index) => {
      const score = typeof metric.value === 'number' ? metric.value : typeof metric.score === 'number' ? metric.score : 0;
      const weight = metric.weight ?? METRIC_WEIGHTS_FALLBACK[metric.key] ?? 0;
      return {
        ...metric,
        id: `${instanceId}_${metric.key}_${index}`,
        score,
        weight,
        contribution: (score * weight) / 100,
        description: METRIC_DESCRIPTIONS[metric.key] || metric.name || '',
        level: levelOf(score),
        summary: summaryOf(metric, score),
      };
    });
    return processed.sort((a, b) => b.contribution - a.contribution);
  }, [metrics, instanceId]);

  const totalContribution = rows.reduce((sum, r) => sum + r.contribution, 0);
  const overallScore = riskScore || Math.round(totalContribution);
  // The strip is only a "share of the score" when these rows actually produced it.
  // Callers that pass a headline computed elsewhere say so via headlineFromMetrics;
  // otherwise fall back to a numeric check against the rows' own total.
  const stripMatchesHeadline =
    headlineFromMetrics ?? (!riskScore || Math.abs(riskScore - Math.round(totalContribution)) <= 1);
  const verdict = verdictProp ?? getVerdict(overallScore);
  const tier = getRiskTier(overallScore);
  const topDrivers = rows.slice(0, 3);

  const toggle = (id: string) => setExpanded((cur) => (cur === id ? null : id));

  const copySummary = async () => {
    const text = `Sifter analysis: ${projectName}\nRisk score ${overallScore}/100 (${VERDICT_LABEL[verdict]})\n${window.location.href}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard unavailable; nothing else to do */
    }
    setShowShare(false);
  };

  const shareToX = () => {
    const text = `Sifter analysis: ${projectName}, ${overallScore}/100 risk score`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`,
      '_blank',
      'noopener,noreferrer',
    );
    setShowShare(false);
  };

  return (
    <section className="rounded-2xl border border-sifter-border bg-sifter-card overflow-hidden" aria-label="Risk analysis">
      {/* Verdict */}
      <header className={cn('border-b border-sifter-border', compact ? 'p-4' : 'p-6 sm:p-8')}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} aria-label="Back" className="-ml-2 mt-1 px-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Button>
            )}
            <div className="min-w-0">
              <p className="text-sm text-sifter-text-muted">Risk analysis</p>
              <h2 className={cn('font-bold tracking-tight text-sifter-text truncate', compact ? 'text-xl' : 'text-2xl sm:text-3xl')}>
                {projectName}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone={VERDICT_TONE[verdict]}>{VERDICT_LABEL[verdict]}</Badge>
                <span className={cn('text-sm', tier.color)}>{tier.label}</span>
                <span className="text-sm text-sifter-text-subtle">
                  {rows.length} metrics, weighted
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-6">
            <div className="text-right">
              <div className={cn('font-bold tabular-nums leading-none tracking-tight', tier.color, compact ? 'text-4xl' : 'text-5xl sm:text-6xl')}>
                {overallScore}
                <span className="text-lg font-medium text-sifter-text-subtle">/100</span>
              </div>
              <p className="mt-1.5 text-xs text-sifter-text-subtle">Higher means riskier</p>
            </div>
            <div className="flex gap-2">
              <Button ref={shareTriggerRef} variant="secondary" size="sm" onClick={() => setShowShare(true)}>
                Share
              </Button>
              {onExport && (
                <Button variant="secondary" size="sm" onClick={onExport}> Export
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Contribution strip: how much each metric pushed the score up */}
        {totalContribution > 0 && (
          <div className="mt-6">
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-sifter-dark" aria-hidden="true">
              {rows.map((r) => r.contribution > 0 ? (
                  <div
                    key={r.id}
                    title={`${r.name}: ${Math.round((r.contribution / totalContribution) * 100)}% of ${stripMatchesHeadline ? 'score' : 'weighted total'}`}
                    className={cn('h-full border-r border-sifter-card last:border-r-0', LEVEL_STYLE[r.level].bar)}
                    style={{ width: `${(r.contribution / totalContribution) * 100}%` }}
                  />
                ) : null,
              )}
            </div>
            {/* The bar is visual only; this list gives screen-reader and keyboard users the same shares. */}
            <ul
              className="sr-only"
              aria-label={stripMatchesHeadline ? 'Share of risk score by metric' : 'Weighted metric scores compared'}
            >
              {rows.map((r) =>
                r.contribution > 0 ? (
                  <li key={r.id}>
                    {r.name}: {Math.round((r.contribution / totalContribution) * 100)}% of{' '}
                    {stripMatchesHeadline ? 'the score' : 'the weighted total'}
                  </li>
                ) : null,
              )}
            </ul>
            <p className="mt-2 text-sm text-sifter-text-muted">
              {stripMatchesHeadline ? 'Driven mostly by' : 'Highest weighted signals:'}{' '}
              {topDrivers.map((d, i) => (
                <React.Fragment key={d.id}>
                  <span className="text-sifter-text">{d.name}</span>
                  {i < topDrivers.length - 1 ? (i === topDrivers.length - 2 ? ' and ' : ', ') : '.'}
                </React.Fragment>
              ))}
            </p>
          </div>
        )}
      </header>

      {/* Ranked metrics */}
      <ul className="divide-y divide-sifter-border" aria-label="Metrics, highest contribution first">
        {rows.map((m) => {
          const isOpen = expanded === m.id;
          const style = LEVEL_STYLE[m.level];
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => toggle(m.id)}
                aria-expanded={isOpen}
                className={cn(
                  'w-full text-left grid items-center gap-x-4 gap-y-1 transition-colors duration-base hover:bg-sifter-hover',
                  'grid-cols-[1fr_auto] sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto_auto]',
                  compact ? 'px-4 py-2.5' : 'px-6 py-3.5',
                )}
              >
                <div className="min-w-0">
                  <div className="font-medium text-sifter-text truncate">{m.name}</div>
                  <div className="text-xs text-sifter-text-subtle truncate">{m.description}</div>
                </div>
                <div className="hidden sm:block">
                  <div className="h-1.5 w-full rounded-full bg-sifter-dark overflow-hidden" aria-hidden="true">
                    <div className={cn('h-full rounded-full', style.bar)} style={{ width: `${m.score}%` }} />
                  </div>
                </div>
                <div className="hidden sm:block text-xs text-sifter-text-subtle tabular-nums w-14 text-right">{m.weight}% wt</div>
                <div className={cn('font-semibold tabular-nums text-right w-12', style.text)}>{m.score}</div>
              </button>

              {isOpen && (
                <div className={cn('bg-sifter-dark/50', compact ? 'px-4 pb-4' : 'px-6 pb-6')}>
                  <p className={cn('pt-3 text-sm font-medium', style.text)}>{style.label}</p>
                  <p className="mt-1 text-sm text-sifter-text-muted">{m.summary}</p>

                  {m.evidence && m.evidence.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-sifter-text mb-2">What we found</p>
                      <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-sifter-border bg-sifter-card p-4 text-sm leading-relaxed text-sifter-text-muted">
                        {m.evidence[0]}
                      </div>
                    </div>
                  )}

                  {m.flags && m.flags.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-sifter-text mb-2">Red flags</p>
                      <ul className="flex flex-wrap gap-2">
                        {m.flags.slice(0, 6).map((flag, i) => (
                          <li key={i}>
                            <Badge tone="danger">{flag}</Badge>
                          </li>
                        ))}
                        {m.flags.length > 6 && (
                          <li>
                            <Badge tone="neutral">+{m.flags.length - 6} more</Badge>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <dialog
        ref={shareDialogRef}
        aria-labelledby="share-title"
        onClose={handleShareClose}
        className="w-full max-w-md rounded-xl border border-sifter-border bg-sifter-card p-6 text-sifter-text shadow-popover backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <h3 id="share-title" className="text-lg font-bold text-sifter-text">Share this analysis</h3>
        <p className="mt-1 text-sm text-sifter-text-muted">Copies the project name, score and a link to this page.</p>
        <div className="mt-5 grid gap-2">
          <Button variant="secondary" fullWidth onClick={copySummary}>Copy summary</Button>
          <Button variant="secondary" fullWidth onClick={shareToX}>Post on X</Button>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" onClick={() => setShowShare(false)}>Cancel</Button>
        </div>
      </dialog>
      {/* projectData is accepted for API compatibility with callers that pass it. */}
      {projectData ? null : null}
    </section>
  );
}
