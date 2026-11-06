'use client';

import React from 'react';
import Link from 'next/link';
import { UserMenu } from '@/components/auth/UserMenu';
import { Button, Card, Badge, Logo } from '@/components/ui';
import { METRIC_WEIGHTS } from '@/types';
import { ACCOUNT_MODES } from '@/data/accountModes';

interface LandingPageProps {
  onGetStarted: () => void;
  compact?: boolean;
}

/** Input kinds recognised by SmartInputParser.detectInputType. */
const ACCEPTED_INPUTS = ['Twitter handle', 'Discord invite', 'Telegram link', 'GitHub repo', 'Website URL', 'Project name'];

/** Verdict buckets from `getVerdict` in src/types. */
const VERDICTS = [
  { key: 'pass', label: 'Pass', tone: 'success' as const, text: 'No material red flags across the weighted metrics.' },
  { key: 'flag', label: 'Flag', tone: 'warning' as const, text: 'Elevated risk on one or more metrics. Review the breakdown before proceeding.' },
  { key: 'reject', label: 'Reject', tone: 'danger' as const, text: 'Strong risk signals. The composite score crosses the reject threshold.' },
];

const STEPS = [
  { n: 1, title: 'Enter a project', text: 'Paste any identifier. Sifter detects the type and resolves the entity.' },
  { n: 2, title: 'Automated analysis', text: 'Every metric is scored in parallel and combined into a weighted composite.' },
  { n: 3, title: 'Get a verdict', text: 'Pass, Flag or Reject, with the full metric breakdown and export options.' },
];

const metricsByWeight = [...METRIC_WEIGHTS].sort((a, b) => b.weight - a.weight);
const maxWeight = metricsByWeight[0]?.weight ?? 1;

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-sifter-dark text-sifter-text">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-sifter-border bg-sifter-dark/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" aria-label="Sifter home" className="rounded-lg">
            <Logo size="sm" />
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-4">
            <a href="#metrics" className="hidden sm:inline text-sm text-sifter-text-muted hover:text-sifter-text transition-colors"> Metrics
            </a>
            <a href="#how-it-works" className="hidden sm:inline text-sm text-sifter-text-muted hover:text-sifter-text transition-colors"> How it works
            </a>
            <UserMenu />
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.18),transparent_60%)]"
          />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-20 text-center animate-fade-up">
            <Badge tone="info" className="mb-6"> Automated due diligence for Web3 projects
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-balance"> Know what you&apos;re backing{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sifter-blue to-purple-400">before you commit</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-sifter-text-muted max-w-2xl mx-auto text-balance"> Sifter scores a project across {METRIC_WEIGHTS.length} weighted risk metrics spanning team, community, marketing and code,
              then returns a clear Pass, Flag or Reject verdict.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" onClick={onGetStarted} trailingIcon={<span aria-hidden="true">→</span>}> Get started
              </Button>
              <Link href="/login" className="rounded-lg">
                <Button size="lg" variant="secondary"> Sign in
                </Button>
              </Link>
            </div>

            <div className="mt-10">
              <p className="text-xs uppercase tracking-wider text-sifter-text-subtle mb-3">Works with</p>
              <ul className="flex flex-wrap justify-center gap-2" aria-label="Accepted input types">
                {ACCEPTED_INPUTS.map((label) => (
                  <li key={label}>
                    <Badge tone="neutral">{label}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section id="metrics" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 scroll-mt-20">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">What Sifter measures</h2>
            <p className="mt-3 text-sifter-text-muted"> Each metric is scored from 0 to 100 and weighted by how strongly it predicts scams or poor execution.
              Heavier bars carry more influence on the composite score.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {metricsByWeight.map((m) => (
              <li key={m.key}>
                <Card padding="sm" interactive className="h-full">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-sifter-text">{m.name}</h3>
                    <span className="font-mono text-xs text-sifter-text-muted tabular-nums">{Math.round(m.weight * 100)}%</span>
                  </div>
                  <p className="mt-1.5 text-sm text-sifter-text-muted">{m.description}</p>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-sifter-border overflow-hidden" aria-hidden="true">
                    <div className="h-full rounded-full bg-sifter-blue" style={{ width: `${(m.weight / maxWeight) * 100}%` }} />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        {/* Verdicts */}
        <section className="border-y border-sifter-border bg-sifter-card/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">One of three verdicts</h2>
            <p className="mt-3 text-sifter-text-muted max-w-2xl"> The weighted metric scores combine into a single composite. The verdict tells you what to do next; the breakdown tells you why.
            </p>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {VERDICTS.map((v) => (
                <li key={v.key}>
                  <Card className="h-full">
                    <Badge tone={v.tone}>{v.label}</Badge>
                    <p className="mt-3 text-sm text-sifter-text-muted">{v.text}</p>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 scroll-mt-20">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How it works</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="flex-none w-9 h-9 rounded-full bg-sifter-blue/15 text-blue-300 border border-sifter-blue/30 flex items-center justify-center font-semibold">
                  {s.n}
                </span>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-sifter-text-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Account types */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <Card tone="elevated" padding="lg">
            <div className="md:flex md:items-end md:justify-between gap-8">
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold tracking-tight">Built for how you work</h2>
                <p className="mt-2 text-sifter-text-muted">Pick an account type when you sign up. You can switch modes later.</p>
              </div>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {ACCOUNT_MODES.map((mode) => (
                <li key={mode.value}>
                  <Link
                    href={`/register?mode=${mode.value}`}
                    className="group block h-full rounded-xl border border-sifter-border bg-sifter-card p-4 transition-colors duration-base hover:border-sifter-blue/60 hover:bg-sifter-hover"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{mode.label}</span>
                      <span aria-hidden="true" className="text-sifter-text-subtle group-hover:text-sifter-blue transition-colors">→</span>
                    </div>
                    <p className="mt-1 text-sm text-sifter-text-muted">{mode.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </main>

      <footer className="border-t border-sifter-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-sifter-text-subtle">
          <span>SIFTER 1.0 · Automated project due diligence</span>
          <Link href="/terms" className="hover:text-sifter-text transition-colors"> Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}
