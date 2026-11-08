'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ProjectData, MetricData } from '@/types';
import { TwitterScanResult, SNAData, SNANode, SNAEdge } from '@/types';
import { Network } from 'vis-network';

interface IndividualAnalysisViewProps {
  projectData: ProjectData;
  onAddToWatchlist: () => void;
  onShare: () => void;
  onScanAnother: () => void;
  onDownloadPDF: () => void;
  blitzMode?: 'hyper' | 'momentum' | 'deep';
  twitterScan?: TwitterScanResult;
  snaData?: { nodes: SNANode[]; edges: SNAEdge[] };
  detectedChain?: string;
}

interface RiskFlag {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface RiskLevelInfo {
  label: string;
  color: string;
  icon: string;
}

interface Recommendation {
  main: string;
  reasons: string[];
}

// NetworkGraph Component
const NetworkGraph = ({ data, options }: { data: SNAData; options: any }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const network = new Network(
      containerRef.current,
      {
        nodes: data.nodes,
        edges: data.edges
      },
      options
    );

    return () => {
      network.destroy();
    };
  }, [data, options]);

  return <div ref={containerRef} className="w-full h-full" />;
};

// Helper: Get chain icon and name
const getChainInfo = (chain?: string) => {
  if (!chain) return { icon: '', name: '', color: '' };
  
  const chainMap: Record<string, { icon: string; name: string; color: string }> = {
    'solana': { icon: '', name: 'Solana', color: 'bg-gradient-to-br from-[#00FFA3] to-[#DC1FFF]' },
    'ethereum': { icon: '⧫', name: 'Ethereum', color: 'bg-gradient-to-br from-[#627EEA] to-[#ECF0F1]' },
    'base': { icon: '', name: 'Base', color: 'bg-gradient-to-br from-[#0052FF] to-[#FFFFFF]' },
    'polygon': { icon: '', name: 'Polygon', color: 'bg-gradient-to-br from-[#8247E5] to-[#8B5CF6]' },
    'avalanche': { icon: '', name: 'Avalanche', color: 'bg-gradient-to-br from-[#E84142] to-[#FFFFFF]' },
    'arbitrum': { icon: '', name: 'Arbitrum', color: 'bg-gradient-to-br from-[#2D374B] to-[#96BEDC]' },
    'unknown': { icon: '', name: 'Unknown', color: 'bg-sifter-elevated' }
  };
  
  return chainMap[chain.toLowerCase()] || chainMap['unknown'];
};

// Helper: Format report sections
const formatHyperBlitzReport = (reportData: any, detectedChain?: string) => {
  const chainInfo = getChainInfo(detectedChain);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-sifter-card border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">HYPER-BLITZ SNAPSHOT</h2>
              <p className="text-sm text-sifter-text-muted"> Token: $PEPE2.0 | Age: 4 min 32 sec | Scan Time: 8 sec
              </p>
            </div>
          </div>
          {detectedChain && (
            <div className={`px-3 py-1.5 rounded-lg ${chainInfo.color} bg-opacity-20 flex items-center gap-2`}>
              <span className="text-white font-bold">{chainInfo.icon}</span>
              <span className="text-white text-sm">{chainInfo.name}</span>
            </div>
          )}
        </div>

        {/* Chain and Volume Spike */}
        <div className="mb-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-sifter-text-muted">Chain:</span>
            <span className="text-white font-medium">Solana </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sifter-text-muted">Volume Spike:</span>
            <span className="text-red-400 font-medium">+850% in 2min </span>
          </div>
        </div>

        {/* Contract Safety */}
        <div className="border border-blue-500/20 rounded-lg p-4 bg-blue-500/5 mb-4">
          <h3 className="font-bold text-white mb-3"> CONTRACT SAFETY: CRITICAL </h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">├─</span>
              <span className="text-sifter-text">Mint Authority:</span>
              <span className="text-green-400 ml-2">REVOKED </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">├─</span>
              <span className="text-sifter-text">Freeze Authority:</span>
              <span className="text-green-400 ml-2">REVOKED </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">└─</span>
              <span className="text-sifter-text">LP Locked:</span>
              <span className="text-red-400 ml-2">NO (0 minutes)  DANGER</span>
            </div>
          </div>
        </div>

        {/* Network Structure Map */}
        <div className="border border-blue-500/20 rounded-lg p-4 bg-blue-500/5 mb-4">
          <h3 className="font-bold text-white mb-3"> NETWORK STRUCTURE MAP (SNA ONLY - METRIC #6 INPUT)</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">├─</span>
              <span className="text-sifter-text">Total Accounts Tweeting:</span>
              <span className="text-white ml-2">14</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">├─</span>
              <span className="text-sifter-text">Clusters Detected:</span>
              <span className="text-white ml-2">2</span>
            </div>
            
            {/* Cluster A */}
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">│</span>
              <div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">├─</span>
                  <span className="text-white">Cluster A: 5 accounts (100% connected)</span>
                </div>
                <div className="ml-4 space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">├─</span>
                    <span className="text-sifter-text">Members: @RugPullRicky, @PaidShillX, @TelegramRugger, @PumpBot1, @PumpBot2</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">├─</span>
                    <span className="text-sifter-text">Density: 1.0 (perfectly connected)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">└─</span>
                    <span className="text-sifter-text">Centrality: @RugPullRicky = 0.95 (leader)</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Cluster B */}
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">│</span>
              <div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">└─</span>
                  <span className="text-white">Cluster B: 3 accounts (67% connected)</span>
                </div>
                <div className="ml-4 space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">├─</span>
                    <span className="text-sifter-text">Density: 0.67</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">└─</span>
                    <span className="text-sifter-text">Centrality: @CryptoCelebrity = 0.45</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">├─</span>
              <span className="text-sifter-text">Individual Accounts:</span>
              <span className="text-white ml-2">6 (loose connections)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">└─</span>
              <span className="text-sifter-text">Network Density Overall:</span>
              <span className="text-white ml-2">0.42 (moderate connectivity)</span>
            </div>
          </div>
        </div>

        {/* Timing Analysis */}
        <div className="border border-blue-500/20 rounded-lg p-4 bg-blue-500/5">
          <h3 className="font-bold text-white mb-3"> TIMING ANALYSIS (METRIC #7 + #13 INPUT)</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">├─</span>
              <span className="text-sifter-text">Pre-pump Activity:</span>
            </div>
            <div className="ml-4 space-y-1">
              <div className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">├─</span>
                <span className="text-white">Cluster A: All tweeted T-90s to T-60s</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">├─</span>
                <span className="text-white">Sequence: Ricky→ShillX→Rugger→Bot1→Bot2</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">└─</span>
                <span className="text-white">Interval: 30 seconds between tweets</span>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">├─</span>
              <span className="text-sifter-text">Volume Correlation:</span>
            </div>
            <div className="ml-4 space-y-1">
              <div className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">├─</span>
                <span className="text-white">Tweet cluster: 14 accounts in 2-minute window</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">├─</span>
                <span className="text-white">Volume spike: +500% @ T+30s</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">└─</span>
                <span className="text-white">Perfect timing correlation</span>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">└─</span>
              <span className="text-sifter-text">Coordination Evidence:</span>
            </div>
            <div className="ml-4 space-y-1">
              <div className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">├─</span>
                <span className="text-white">Same talking points: &quot;100x&quot;, &quot;Elon tweet incoming&quot;</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">├─</span>
                <span className="text-white">Cross-platform: Twitter + Telegram simultaneous</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">└─</span>
                <span className="text-white">Pattern: Classic sequential promotion</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Context */}
      <div className="bg-sifter-card border border-blue-500/20 rounded-xl p-6">
        <h3 className="font-bold text-white mb-4"> HISTORICAL CONTEXT ADDED (METRIC #6 SCORING)</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">├─</span>
            <span className="text-sifter-text">Cluster A History:</span>
          </div>
          <div className="ml-4 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">├─</span>
              <span className="text-white">Co-promoted 7 tokens together</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">├─</span>
              <span className="text-white">6 rugged (86% failure rate)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">├─</span>
              <span className="text-white">Same sequence each time</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">└─</span>
              <span className="text-white">Pattern match: 94% similar to failed tokens</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">├─</span>
            <span className="text-sifter-text">Individual Risk Scoring:</span>
          </div>
          <div className="ml-4 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">├─</span>
              <span className="text-white">@RugPullRicky: 47 tokens/30d, 91% fail</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">├─</span>
              <span className="text-white">@PaidShillX: Disclosed promoter, payment trails</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">├─</span>
              <span className="text-white">@TelegramRugger: Admin in 3 rug groups</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">└─</span>
              <span className="text-white">@CryptoCelebrity: 3 failed celebrity tokens</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">└─</span>
            <span className="text-sifter-text">NETWORK CONTAMINATION SCORE:</span>
            <span className="text-red-400 ml-2">15/100 </span>
          </div>
        </div>
      </div>

      {/* Financial Correlation */}
      <div className="bg-sifter-card border border-blue-500/20 rounded-xl p-6">
        <h3 className="font-bold text-white mb-4"> FINANCIAL CORRELATION ADDED</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">├─</span>
            <span className="text-sifter-text">Whale Activity:</span>
          </div>
          <div className="ml-4 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">├─</span>
              <span className="text-white">Whale A: 120 SOL buy @ T-30s (follows 4 promoters)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">├─</span>
              <span className="text-white">Whale B: 85 SOL buy @ T+45s (new wallet)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">└─</span>
              <span className="text-white">Whale C: 200 SOL sell @ T+180s (team dumping)</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">├─</span>
            <span className="text-sifter-text">Whale-Promoter Connections:</span>
          </div>
          <div className="ml-4 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">├─</span>
              <span className="text-white">3 promoting accounts follow Whale A</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">└─</span>
              <span className="text-white">Pattern: Insider whale coordination</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">└─</span>
            <span className="text-sifter-text">Exit Liquidity Analysis:</span>
          </div>
          <div className="ml-4 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span className="text-white">Top 10 buyers: $450K total</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span className="text-white">Expected dump: 45-90 minutes post-pump</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span className="text-white">Team can drain $820K liquidity</span>
            </div>
          </div>
        </div>
      </div>

      {/* On-Chain Momentum */}
      <div className="bg-sifter-card border border-blue-500/20 rounded-xl p-6">
        <h3 className="font-bold text-white mb-4"> ON-CHAIN MOMENTUM</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">├─</span>
            <span className="text-sifter-text">Volume:</span>
            <span className="text-white ml-2">$1.2M</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">├─</span>
            <span className="text-sifter-text">Holder Concentration:</span>
            <span className="text-yellow-400 ml-2">Top 10 = 68% </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">├─</span>
            <span className="text-sifter-text">Liquidity:</span>
            <span className="text-white ml-2">$820K (shallow, 14.2% slippage)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">└─</span>
            <span className="text-sifter-text">Exit Risk:</span>
            <span className="text-white ml-2">Large holders cannot exit without crash</span>
          </div>
        </div>
      </div>

      {/* Verdict and Critical Issues */}
      <div className="border-2 border-red-500 bg-red-500/10 rounded-xl p-6">
        <h3 className="font-bold text-white text-xl mb-3"> VERDICT: EXTREME DANGER - COORDINATED PUMP</h3>
        
        <div className="mb-4">
          <h4 className="text-sifter-text font-medium mb-2">ANALYSIS SUMMARY:</h4>
          <ul className="text-sm text-sifter-text space-y-1">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>SNA MAP: Shows organized cluster of 5 accounts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>TIMING: Sequential pre-pump tweets</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>HISTORY: 86% failure rate as group</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>FINANCIAL: Whale coordination detected</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>SYNTHESIS: Professional pump operation</span>
            </li>
          </ul>
        </div>

        <div className="mb-4">
          <h4 className="text-sifter-text font-medium mb-2">CRITICAL ISSUES:</h4>
          <ul className="text-sm space-y-1">
            <li className="text-red-400 flex items-center gap-2">
              <span>•</span>
              <span>No LP lock = Instant dump capability </span>
            </li>
            <li className="text-red-400 flex items-center gap-2">
              <span>•</span>
              <span>Insider whale coordination </span>
            </li>
            <li className="text-red-400 flex items-center gap-2">
              <span>•</span>
              <span>Professional gang operation </span>
            </li>
            <li className="text-red-400 flex items-center gap-2">
              <span>•</span>
              <span>Exit liquidity insufficient </span>
            </li>
          </ul>
        </div>

        <div className="mt-4 pt-4 border-t border-sifter-border">
          <h4 className="text-white font-bold mb-2">RECOMMENDATION:</h4>
          <p className="text-sifter-text"> AVOID. If gambling: 1% max, 2x stop loss, exit within 30 min.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center gap-2"> View Network Graph
        </button>
        <button className="px-4 py-2 bg-sifter-elevated hover:bg-sifter-hover text-white rounded-lg transition-all flex items-center gap-2"> See Raw SNA Data
        </button>
        <button className="px-4 py-2 bg-sifter-elevated hover:bg-sifter-hover text-white rounded-lg transition-all flex items-center gap-2"> Track Whale Wallets
        </button>
        <button className="px-4 py-2 bg-sifter-elevated hover:bg-sifter-hover text-white rounded-lg transition-all flex items-center gap-2"> Set Alert
        </button>
      </div>
    </div>
  );
};

const formatMomentumBlitzReport = (reportData: any, detectedChain?: string) => {
  const chainInfo = getChainInfo(detectedChain);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-sifter-card border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">MOMENTUM-BLITZ ANALYSIS</h2>
              <p className="text-sm text-sifter-text-muted"> Token: $DEFI_PROTOCOL | Age: 3 days 14 hours | Scan Time: 52 sec
              </p>
            </div>
          </div>
          {detectedChain && (
            <div className={`px-3 py-1.5 rounded-lg ${chainInfo.color} bg-opacity-20 flex items-center gap-2`}>
              <span className="text-white font-bold">{chainInfo.icon}</span>
              <span className="text-white text-sm">{chainInfo.name}</span>
            </div>
          )}
        </div>

        {/* Chain and Price Context */}
        <div className="mb-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-sifter-text-muted">Chain:</span>
            <span className="text-white font-medium">Base </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sifter-text-muted">Price:</span>
            <span className="text-green-400 font-medium">+127% in 24h</span>
          </div>
        </div>

        {/* Price Context */}
        <div className="border border-purple-500/20 rounded-lg p-4 bg-purple-500/5 mb-4">
          <h3 className="font-bold text-white mb-3"> PRICE CONTEXT</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">├─</span>
              <span className="text-sifter-text">Current:</span>
              <span className="text-white ml-2">$0.00042 (+127% 24h)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">├─</span>
              <span className="text-sifter-text">ATH:</span>
              <span className="text-white ml-2">$0.00089 (18 hours ago)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">└─</span>
              <span className="text-sifter-text">Volume:</span>
              <span className="text-white ml-2">$2.4M (24h) | Trend: Declining </span>
            </div>
          </div>
        </div>
      </div>

      {/* Community Health */}
      <div className="bg-sifter-card border border-purple-500/20 rounded-xl p-6">
        <h3 className="font-bold text-white mb-4"> COMMUNITY HEALTH (METRICS #7, #8)</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">├─</span>
            <span className="text-sifter-text">Message Timing Entropy:</span>
            <span className="text-green-400 ml-2">0.72/1.00 </span>
          </div>
          <div className="ml-4 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">└─</span>
              <span className="text-white">Activity distributed across 18 hours</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">└─</span>
              <span className="text-white">No bot clustering detected</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">├─</span>
            <span className="text-sifter-text">Account Age Entropy:</span>
            <span className="text-green-400 ml-2">0.81/1.00 </span>
          </div>
          <div className="ml-4 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">└─</span>
              <span className="text-white">Organic 18-month growth</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">└─</span>
              <span className="text-white">No bot farm spikes</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">└─</span>
            <span className="text-sifter-text">Engagement Distribution:</span>
            <span className="text-green-400 ml-2">0.68/1.00 </span>
          </div>
          <div className="ml-4">
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">└─</span>
              <span className="text-white">Even participation across accounts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Structure Evolution */}
      <div className="bg-sifter-card border border-purple-500/20 rounded-xl p-6">
        <h3 className="font-bold text-white mb-4"> NETWORK STRUCTURE EVOLUTION (SNA MAPPING OVER TIME - METRIC #6)</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">├─</span>
            <span className="text-sifter-text">Initial Network (Launch):</span>
          </div>
          <div className="ml-4 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">├─</span>
              <span className="text-white">Clean structure: 0 high-risk connections</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">├─</span>
              <span className="text-white">Density: 0.35 (healthy decentralization)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">└─</span>
              <span className="text-white">Founder centrality: 0.45 (not dominant)</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">├─</span>
            <span className="text-sifter-text">Current Network (30 days later):</span>
          </div>
          <div className="ml-4 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">├─</span>
              <span className="text-white">New cluster detected: 5 volume promoters</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">├─</span>
              <span className="text-white">Density increased: 0.35 → 0.48</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">├─</span>
              <span className="text-white">Founder centrality: 0.45 → 0.38 (decreasing)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">└─</span>
              <span className="text-white">Promoter centrality: 0.12 → 0.28 (increasing)</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">└─</span>
            <span className="text-sifter-text">Network Health Trend:</span>
            <span className="text-yellow-400 ml-2"> Deteriorating</span>
          </div>
          <div className="ml-4 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span className="text-white">Promoter infiltration: +13% in 30 days</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span className="text-white">Community segmentation beginning</span>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Quality */}
      <div className="bg-sifter-card border border-purple-500/20 rounded-xl p-6">
        <h3 className="font-bold text-white mb-4"> ENGAGEMENT QUALITY (METRICS #10, #11)</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">├─</span>
            <span className="text-sifter-text">Substantive Discussion:</span>
            <span className="text-green-400 ml-2">42% </span>
          </div>
          <div className="ml-4 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">└─</span>
              <span className="text-white">Topics: Technical questions, feature debates</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">└─</span>
              <span className="text-white">Quality: Depth, legitimate interest</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">├─</span>
            <span className="text-sifter-text">Mercenary Content:</span>
            <span className="text-yellow-400 ml-2">31%  (METRIC #11)</span>
          </div>
          <div className="ml-4 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">└─</span>
              <span className="text-white">Week 1: 18% → Week 4: 31% (rising)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">└─</span>
              <span className="text-white">Keywords: &quot;moon&quot; (47), &quot;100x&quot; (8), &quot;gem&quot; (31)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">└─</span>
              <span className="text-white">Urgency triggers increasing</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">└─</span>
            <span className="text-sifter-text">Spam/Bot Content:</span>
            <span className="text-yellow-400 ml-2">27% </span>
          </div>
          <div className="ml-4 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">└─</span>
              <span className="text-white">Patterns: Emoji spam, copy-paste</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">└─</span>
              <span className="text-white">Source: 80% from new accounts (&lt;30 days)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Founder Activity */}
      <div className="bg-sifter-card border border-purple-500/20 rounded-xl p-6">
        <h3 className="font-bold text-white mb-4">‍ FOUNDER ACTIVITY (METRIC #9, #12)</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">├─</span>
            <span className="text-sifter-text">Tweet Focus Analysis:</span>
          </div>
          <div className="ml-4 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">├─</span>
              <span className="text-white">Project Updates: 54% </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">├─</span>
              <span className="text-white">Promotional Content: 28% </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">└─</span>
              <span className="text-white">Personal Content: 18%</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">├─</span>
            <span className="text-sifter-text">Response Patterns:</span>
          </div>
          <div className="ml-4 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">├─</span>
              <span className="text-white">Technical questions: 92% answered</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">├─</span>
              <span className="text-white">Price questions: 45% answered (intentionally vague)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">├─</span>
              <span className="text-white">Timeline questions: 78% answered</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">└─</span>
              <span className="text-white">Pattern: Building-focused, not pumping</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">└─</span>
            <span className="text-sifter-text">Activity Trend:</span>
            <span className="text-green-400 ml-2">Stable </span>
          </div>
          <div className="ml-4 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span className="text-white">Consistent engagement (71% response rate)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span className="text-white">GitHub commits continuing</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span className="text-white">No signs of distraction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Artificial Hype Detection */}
      <div className="bg-sifter-card border border-purple-500/20 rounded-xl p-6">
        <h3 className="font-bold text-white mb-4"> ARTIFICIAL HYPE DETECTION (METRIC #13)</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">├─</span>
            <span className="text-sifter-text">Coordination Patterns:</span>
          </div>
          <div className="ml-4 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">├─</span>
              <span className="text-white">Natural bursts: 8 accounts (news-driven) </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">├─</span>
              <span className="text-white">Light coordination: 5 accounts (not malicious) </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">└─</span>
              <span className="text-white">No sustained manipulation campaigns </span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">├─</span>
            <span className="text-sifter-text">Bot Network Analysis:</span>
          </div>
          <div className="ml-4 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">├─</span>
              <span className="text-white">Amplification rate: 1.2x (normal)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">├─</span>
              <span className="text-white">Follower quality: 68% real accounts </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">└─</span>
              <span className="text-white">Engagement patterns: Human-like </span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-purple-400 mt-1">└─</span>
            <span className="text-sifter-text">Influence Purchasing:</span>
          </div>
          <div className="ml-4 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span className="text-white">Follower growth: 5-7%/week (organic)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span className="text-white">Fake engagement: &lt;8% detected </span>
            </div>
          </div>
        </div>
      </div>

      {/* Network-Based Risk Assessment */}
      <div className="bg-sifter-card border border-purple-500/20 rounded-xl p-6">
        <h3 className="font-bold text-white mb-4"> NETWORK-BASED RISK ASSESSMENT</h3>
        
        <div className="mb-4">
          <h4 className="text-green-400 font-medium mb-2">STRENGTHS (From SNA Map + Metrics):</h4>
          <div className="space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1"></span>
              <span className="text-white">Organic community growth (entropy 0.81)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1"></span>
              <span className="text-white">Founder network still technical-focused</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1"></span>
              <span className="text-white">No direct scammer connections (0-hop contamination)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1"></span>
              <span className="text-white">Natural engagement patterns (no coordination)</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-yellow-400 font-medium mb-2">CONCERNS (From SNA Map + Metrics):</h4>
          <div className="space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1"></span>
              <span className="text-white">Promoter infiltration increasing (+13% in 30 days)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1"></span>
              <span className="text-white">Mercenary content rising (18% → 31%)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1"></span>
              <span className="text-white">Founder centrality decreasing (losing influence)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1"></span>
              <span className="text-white">Network density increasing (becoming more connected)</span>
            </div>
          </div>
        </div>

        <div className="border border-yellow-500/20 rounded-lg p-4 bg-yellow-500/5">
          <h4 className="text-yellow-400 font-medium mb-2">PRESSURE POINTS:</h4>
          <div className="space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span className="text-white">Tipping point: Mercenary content &gt;40%</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span className="text-white">Risk: Shift from building to pumping</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span className="text-white">Timeframe: 2-4 weeks to assess trend</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verdict */}
      <div className="border-2 border-yellow-500 bg-yellow-500/10 rounded-xl p-6">
        <h3 className="font-bold text-white text-xl mb-3"> VERDICT: MODERATE RISK - HEALTHY BUT UNDER PRESSURE</h3>
        
        <div className="mb-4">
          <h4 className="text-sifter-text font-medium mb-2">WHY MODERATE (Not Low):</h4>
          <ul className="text-sm text-sifter-text space-y-1">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Network structure shows promoter infiltration beginning</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Engagement quality metrics deteriorating</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Founder influence declining relative to promoters</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Volume trend declining post-ATH</span>
            </li>
          </ul>
        </div>

        <div className="mt-4 pt-4 border-t border-sifter-border">
          <h4 className="text-white font-bold mb-2">RECOMMENDATION:</h4>
          <p className="text-sifter-text"> CAUTIOUS OPTIMISM • If holding: Maintain, 15-20% stop loss • If entering: Wait for pullback, ≤3% position • Exit signals:  Founder goes silent, mercenary &gt;40%, whales dump • Monitor: Network evolution weekly
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all flex items-center gap-2"> Network Evolution Timeline
        </button>
        <button className="px-4 py-2 bg-sifter-elevated hover:bg-sifter-hover text-white rounded-lg transition-all flex items-center gap-2"> Engagement Quality Monitor
        </button>
        <button className="px-4 py-2 bg-sifter-elevated hover:bg-sifter-hover text-white rounded-lg transition-all flex items-center gap-2"> Compare Network Structures
        </button>
        <button className="px-4 py-2 bg-sifter-elevated hover:bg-sifter-hover text-white rounded-lg transition-all flex items-center gap-2"> Set Threshold Alerts
        </button>
      </div>
    </div>
  );
};

const formatDeepBlitzReport = (reportData: any, detectedChain?: string) => {
  const chainInfo = getChainInfo(detectedChain);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-sifter-card border border-green-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">DEEP-BLITZ COMPREHENSIVE REPORT</h2>
              <p className="text-sm text-sifter-text-muted"> Token: $PROJECT | Analysis: 3 min 47 sec | Generated: Dec 29, 2025
              </p>
            </div>
          </div>
          {detectedChain && (
            <div className={`px-3 py-1.5 rounded-lg ${chainInfo.color} bg-opacity-20 flex items-center gap-2`}>
              <span className="text-white font-bold">{chainInfo.icon}</span>
              <span className="text-white text-sm">{chainInfo.name}</span>
            </div>
          )}
        </div>

        {/* Chain and Overall */}
        <div className="mb-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-sifter-text-muted">Chain:</span>
            <span className="text-white font-medium">Ethereum ⧫</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sifter-text-muted">Overall:</span>
            <span className="text-yellow-400 font-medium">58/100  MODERATE RISK</span>
          </div>
        </div>
      </div>

      {/* 13-Metric Weighted Analysis */}
      <div className="bg-sifter-card border border-green-500/20 rounded-xl p-6">
        <h3 className="font-bold text-white text-xl mb-4"> 13-METRIC WEIGHTED ANALYSIS</h3>
        
        {/* Metric 1 */}
        <div className="mb-4 border border-sifter-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-white">1⃣ TEAM IDENTITY (13% weight): 45/100  → 5.85 points</h4>
            <div className="text-2xl font-bold text-yellow-400">45/100</div>
          </div>
          <div className="space-y-1 text-sm text-sifter-text">
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1">├─</span>
              <span>Founder: Pseudonymous (Twitter: @CryptoBuilder)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1">├─</span>
              <span>Team: 3 anonymous members</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1">├─</span>
              <span>Public Reputation: Zero (no doxxing, no KYC)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1">└─</span>
              <span>Accountability Risk: HIGH - Can disappear</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="mb-4 border border-sifter-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-white">2⃣ TEAM COMPETENCE (11% weight): 35/100  → 3.85 points</h4>
            <div className="text-2xl font-bold text-red-400">35/100</div>
          </div>
          <div className="space-y-1 text-sm text-sifter-text">
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1">├─</span>
              <span>Prior Projects: None verified</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1">├─</span>
              <span>Domain Experience: Unclear (no public track record)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1">├─</span>
              <span>Delivery Track Record: 40% milestones met (2/5)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-1">└─</span>
              <span>Technical Depth: Basic smart contracts only</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="mb-4 border border-sifter-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-white">3⃣ CONTAMINATED NETWORK (19% weight): 92/100  → 17.48 points</h4>
            <div className="text-2xl font-bold text-green-400">92/100</div>
          </div>
          <div className="space-y-2 text-sm text-sifter-text">
            <div>
              <span className="text-sifter-text-muted">SNA MAP OUTPUT:</span>
              <div className="ml-4 mt-1 space-y-1">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">├─</span>
                  <span>Network Structure: 3 clusters (tech, community, minimal promoters)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">├─</span>
                  <span>Density: 0.42 (healthy decentralization)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">├─</span>
                  <span>Centrality: Founder = 0.45 (appropriate leadership)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">└─</span>
                  <span>Connections: Minimal to bad actors</span>
                </div>
              </div>
            </div>
            
            <div>
              <span className="text-sifter-text-muted">DATABASE CHECK (Your Proprietary Data):</span>
              <div className="ml-4 mt-1 space-y-1">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">├─</span>
                  <span>Direct connections to verified bad actors: NONE </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">├─</span>
                  <span>1-hop contamination: 2 accounts (low risk)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">├─</span>
                  <span>2-hop contamination: 5 accounts (moderate)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">└─</span>
                  <span>Network Integrity Score: 92/100 (excellent)</span>
                </div>
              </div>
            </div>
            
            <div>
              <span className="text-sifter-text-muted">HISTORICAL CONTEXT:</span>
              <div className="ml-4 mt-1 space-y-1">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Same network promoted 2 previous tokens (both succeeded)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Founder network = 70% technical connections</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Promoter cluster isolated and small (15% of network)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional metrics would follow same pattern... */}
        {/* For brevity, showing a few key metrics */}

        {/* Metric 8 */}
        <div className="mb-4 border border-sifter-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-white">8⃣ GITHUB AUTHENTICITY (10% weight): 42/100  → 4.20 points</h4>
            <div className="text-2xl font-bold text-yellow-400">42/100</div>
          </div>
          <div className="space-y-2 text-sm text-sifter-text">
            <div>
              <span className="text-sifter-text-muted">Commit Patterns:</span>
              <div className="ml-4 mt-1 space-y-1">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">├─</span>
                  <span>Activity: 11 commits/month (low for DeFi)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">├─</span>
                  <span>Velocity: Declining (8 commits last 30d)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">├─</span>
                  <span>Recency: Active within last 7 days</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">└─</span>
                  <span>Code Quality: Basic, 62% test coverage</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 9 */}
        <div className="mb-4 border border-sifter-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-white">9⃣ BUS FACTOR (2% weight): 30/100  → 0.60 points</h4>
            <div className="text-2xl font-bold text-red-400">30/100</div>
          </div>
          <div className="space-y-1 text-sm text-sifter-text">
            <div>
              <span className="text-sifter-text-muted">SNA CONTEXT:</span>
              <div className="ml-4 mt-1 space-y-1">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>Network structure shows founder centrality = 0.45</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>But technical knowledge concentrated with founder</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>High bus factor despite decentralized network structure</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 13 */}
        <div className="mb-4 border border-sifter-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-white">1⃣3⃣ TOKENOMICS RED FLAGS (7% weight): 71/100  → 4.97 points</h4>
            <div className="text-2xl font-bold text-green-400">71/100</div>
          </div>
          <div className="space-y-2 text-sm text-sifter-text">
            <div>
              <span className="text-sifter-text-muted">Allocation Analysis:</span>
              <div className="ml-4 mt-1 space-y-1">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">├─</span>
                  <span>Fair Launch: 40% public sale</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">├─</span>
                  <span>Team: 15% (12-month cliff)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">├─</span>
                  <span>Ecosystem: 10% (vested)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">├─</span>
                  <span>Liquidity: 30% (locked until April 2025)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">└─</span>
                  <span>Marketing: 5% (UNLOCKED )</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SNA's Role in Metric Assessment */}
      <div className="bg-sifter-card border border-green-500/20 rounded-xl p-6">
        <h3 className="font-bold text-white text-xl mb-4"> SNA&apos;S ROLE IN METRIC ASSESSMENT</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-blue-500/20 rounded-lg p-4 bg-blue-500/5">
            <h4 className="text-blue-400 font-medium mb-2">SNA PROVIDES MAPS FOR THESE METRICS:</h4>
            <ul className="space-y-2 text-sm text-sifter-text">
              <li>• METRIC #3 (Contaminated Network): Network structure, connections, clusters</li>
              <li>• METRIC #5 (Message Times): Timing patterns ACROSS network clusters</li>
              <li>• METRIC #6 (Account Ages): Age distribution WITHIN network clusters</li>
              <li>• METRIC #7 (Tweet Focus): Content distribution ACROSS network segments</li>
              <li>• METRIC #10 (Artificial Hype): Coordination detection BETWEEN accounts</li>
              <li>• METRIC #12 (Engagement): Quality distribution THROUGHOUT network</li>
            </ul>
          </div>
          
          <div className="border border-green-500/20 rounded-lg p-4 bg-green-500/5">
            <h4 className="text-green-400 font-medium mb-2">EXAMPLE WITH SNA CONTEXT:</h4>
            <p className="text-sm text-sifter-text"> Without SNA, Metric #3 would just be &quot;no direct bad actor connections&quot;With SNA: &quot;No direct connections, AND network structure is healthy (decentralized, 
              natural clusters, founder appropriately central)&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Critical Red Flags */}
      <div className="bg-sifter-card border border-red-500/20 rounded-xl p-6">
        <h3 className="font-bold text-white text-xl mb-4"> CRITICAL RED FLAGS (Based on Metrics)</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-red-400 font-medium mb-1">1. ANONYMOUS TEAM (Metric #1: 45/100)</h4>
            <p className="text-sm text-sifter-text">
              • Founder pseudonymous, team unknown<br/>
              • Zero accountability if project fails
            </p>
          </div>
          <div>
            <h4 className="text-red-400 font-medium mb-1">2. DECLINING DEVELOPMENT (Metric #8: 42/100)</h4>
            <p className="text-sm text-sifter-text">
              • GitHub: Only 8 commits last 30 days<br/>
              • No external contributors<br/>
              • High bus factor risk (Metric #9: 30/100)
            </p>
          </div>
          <div>
            <h4 className="text-red-400 font-medium mb-1">3. MARKETING WALLET UNLOCKED (Metric #13)</h4>
            <p className="text-sm text-sifter-text">
              • 5% of supply unlocked (instant dump risk)<br/>
              • No transparent spending plan
            </p>
          </div>
          <div>
            <h4 className="text-red-400 font-medium mb-1">4. ENGAGEMENT QUALITY DECLINING (Metric #12: 65/100)</h4>
            <p className="text-sm text-sifter-text">
              • Substantive discussion: 38% (down from 45%)<br/>
              • Promoter influence increasing
            </p>
          </div>
        </div>
      </div>

      {/* Strengths */}
      <div className="bg-sifter-card border border-green-500/20 rounded-xl p-6">
        <h3 className="font-bold text-white text-xl mb-4"> STRENGTHS (Based on Metrics)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-green-500/20 rounded-lg p-4 bg-green-500/5">
            <h4 className="text-green-400 font-medium mb-2">1. CLEAN NETWORK (Metric #3: 92/100)</h4>
            <ul className="text-sm text-sifter-text space-y-1">
              <li>• No direct connections to verified bad actors</li>
              <li>• Natural, decentralized structure</li>
              <li>• Founder appropriately central (not overly dominant)</li>
            </ul>
          </div>
          <div className="border border-green-500/20 rounded-lg p-4 bg-green-500/5">
            <h4 className="text-green-400 font-medium mb-2">2. ORGANIC COMMUNITY (Metrics #5, #6: 78/100, 84/100)</h4>
            <ul className="text-sm text-sifter-text space-y-1">
              <li>• Natural message timing patterns</li>
              <li>• Organic account age distribution</li>
              <li>• No bot farm indicators</li>
            </ul>
          </div>
          <div className="border border-green-500/20 rounded-lg p-4 bg-green-500/5">
            <h4 className="text-green-400 font-medium mb-2">3. FOUNDER FOCUSED (Metrics #7, #11: 71/100, 68/100)</h4>
            <ul className="text-sm text-sifter-text space-y-1">
              <li>• Building-focused, not distracted</li>
              <li>• Technical network connections</li>
              <li>• Active GitHub development</li>
            </ul>
          </div>
          <div className="border border-green-500/20 rounded-lg p-4 bg-green-500/5">
            <h4 className="text-green-400 font-medium mb-2">4. NO ARTIFICIAL HYPE (Metric #10: 82/100)</h4>
            <ul className="text-sm text-sifter-text space-y-1">
              <li>• No coordinated campaigns detected</li>
              <li>• Organic engagement patterns</li>
              <li>• Low bot amplification</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Network-Aware Investment Strategy */}
      <div className="bg-sifter-card border border-green-500/20 rounded-xl p-6">
        <h3 className="font-bold text-white text-xl mb-4"> NETWORK-AWARE INVESTMENT STRATEGY</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border border-green-500/20 rounded-lg p-4 bg-green-500/5">
            <h4 className="text-green-400 font-medium mb-2">POSITION SIZING</h4>
            <div className="text-lg font-bold text-white">2-5% of crypto portfolio</div>
            <p className="text-sm text-sifter-text mt-1">Clean network (92/100) but technical vulnerabilities</p>
          </div>
          
          <div className="border border-green-500/20 rounded-lg p-4 bg-green-500/5">
            <h4 className="text-green-400 font-medium mb-2">ENTRY TIMING</h4>
            <div className="text-sm text-white">Wait for: Mercenary content &lt;20% (currently 18%)</div>
            <p className="text-sm text-sifter-text mt-1">Ideal: After GitHub activity increases (&gt;15 commits/month)</p>
          </div>
          
          <div className="border border-green-500/20 rounded-lg p-4 bg-green-500/5">
            <h4 className="text-green-400 font-medium mb-2">EXIT STRATEGY</h4>
            <div className="text-sm text-white">IMMEDIATE EXIT:</div>
            <p className="text-sm text-sifter-text mt-1">Founder goes silent &gt;2 weeks • Marketing wallet dumps &gt;50%</p>
          </div>
        </div>

        <div className="border border-blue-500/20 rounded-lg p-4 bg-blue-500/5">
          <h4 className="text-blue-400 font-medium mb-3">NETWORK MONITORING CHECKLIST</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sifter-text text-sm mb-2">Daily/Weekly:</h5>
              <ul className="space-y-1 text-sm text-sifter-text">
                <li className="flex items-center gap-2">
                  <span className="text-blue-400"></span>
                  <span>Network contamination check (maintain 0 direct bad actor connections)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400"></span>
                  <span>Promoter cluster size (alert if &gt;30%)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400"></span>
                  <span>Founder centrality (ideal: 0.4-0.6 range)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400"></span>
                  <span>Engagement quality (sustain &gt;35% substantive)</span>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-sifter-text text-sm mb-2">Monthly:</h5>
              <ul className="space-y-1 text-sm text-sifter-text">
                <li className="flex items-center gap-2">
                  <span className="text-blue-400"></span>
                  <span>GitHub commit velocity (expect ≥15/month)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400"></span>
                  <span>Account age distribution (watch for bot farm spikes)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400"></span>
                  <span>Message timing patterns (detect new coordination)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400"></span>
                  <span>Network structure changes (new clusters, density changes)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Final Verdict */}
      <div className="border-2 border-yellow-500 bg-yellow-500/10 rounded-xl p-6">
        <h3 className="font-bold text-white text-xl mb-4">FINAL VERDICT: MODERATE RISK - SPECULATIVE PLAY</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-green-400 font-medium mb-2">STRENGTHS:</h4>
            <ul className="space-y-2 text-sm text-sifter-text">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Exceptionally clean social network (92/100 on contamination)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Organic community growth patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Focused founder still building</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>No manipulation detected</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-red-400 font-medium mb-2">WEAKNESSES:</h4>
            <ul className="space-y-2 text-sm text-sifter-text">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Anonymous team with declining development velocity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>High bus factor risk</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Marketing wallet unlocked (instant dump risk)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Engagement quality declining</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sifter-border pt-4">
          <h4 className="text-white font-medium mb-2">NETWORK PARADOX:</h4>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-green-400"></span>
              <span className="text-sifter-text">Clean social structure suggests genuine community</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-400"></span>
              <span className="text-sifter-text">Technical/economic vulnerabilities create execution risk</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-sifter-border">
          <h4 className="text-white font-bold text-lg mb-3">RECOMMENDATION:</h4>
          <p className="text-sifter-text text-lg"> Small speculative position only (2-5%). Active monitoring required. Not for passive investors or large allocations. Plan to exit at 2-3x or if network quality deteriorates.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all flex items-center gap-2"> View Interactive Network Graph
        </button>
        <button className="px-4 py-2 bg-sifter-elevated hover:bg-sifter-hover text-white rounded-lg transition-all flex items-center gap-2"> Metric History Timeline
        </button>
        <button className="px-4 py-2 bg-sifter-elevated hover:bg-sifter-hover text-white rounded-lg transition-all flex items-center gap-2"> Whale Wallet Tracking
        </button>
        <button className="px-4 py-2 bg-sifter-elevated hover:bg-sifter-hover text-white rounded-lg transition-all flex items-center gap-2"> Custom Network Alerts
        </button>
      </div>
    </div>
  );
};

export default function IndividualAnalysisView({
  projectData,
  onAddToWatchlist,
  onShare,
  onScanAnother,
  onDownloadPDF,
  blitzMode,
  twitterScan,
  snaData,
  detectedChain,
}: IndividualAnalysisViewProps) {
  const [showSNAGraph, setShowSNAGraph] = useState(false);
  const { overallRisk, metrics, displayName, processingTime, modeSpecificData } = projectData;
  
  const chainInfo = getChainInfo(detectedChain);
  
  const getRiskLevel = (score: number): RiskLevelInfo => {
    if (score >= 80) return { label: 'HIGH RISK - DON\'T INVEST', color: 'red', icon: '' };
    if (score >= 60) return { label: 'CAUTION ADVISED', color: 'orange', icon: '' };
    if (score >= 40) return { label: 'MODERATE RISK', color: 'yellow', icon: '' };
    if (score >= 20) return { label: 'LOW RISK', color: 'blue', icon: '' };
    return { label: 'VERY LOW RISK', color: 'green', icon: '' };
  };

  const getRecommendation = (score: number): Recommendation => {
    if (score >= 80) return {
      main: 'DO NOT INVEST in this project',
      reasons: [
        'Multiple critical red flags detected',
        'High probability of scam based on historical patterns',
        'Connected to known bad actors'
      ]
    };
    if (score >= 60) return {
      main: 'Extreme caution advised',
      reasons: [
        'Multiple concerning signals detected',
        'Consider waiting for more development',
        'Monitor community health closely'
      ]
    };
    if (score >= 40) return {
      main: 'Proceed with caution',
      reasons: [
        'Some positive signals mixed with concerns',
        'Do additional research before investing',
        'Check team updates and progress'
      ]
    };
    if (score >= 20) return {
      main: 'Looks promising',
      reasons: [
        'Mostly positive signals',
        'Standard due diligence recommended',
        'Monitor tokenomics and vesting'
      ]
    };
    return {
      main: 'Strong fundamentals',
      reasons: [
        'Excellent risk profile',
        'Appears legitimate and well-structured',
        'Continue monitoring as with any investment'
      ]
    };
  };

  const riskLevel = getRiskLevel(overallRisk.score);
  const recommendation = getRecommendation(overallRisk.score);

  // Get chain-specific message
  const getChainSpecificMessage = () => {
    if (!detectedChain) return null;
    
    const messages: Record<string, string> = {
      'solana': 'Solana: Known for fast transactions but high memecoin concentration',
      'base': 'Base: L2 chain with growing memecoin ecosystem',
      'ethereum': 'Ethereum: Mature ecosystem but higher gas fees',
      'polygon': 'Polygon: Lower fees with mixed project quality',
      'avalanche': 'Avalanche: Fast chain with growing DeFi presence'
    };
    
    return messages[detectedChain.toLowerCase()] || `Analyzed on ${detectedChain} network`;
  };

  const chainMessage = getChainSpecificMessage();

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={onScanAnother}
          className="flex items-center gap-2 text-sifter-text-muted hover:text-white transition-colors self-start"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg> Back to Dashboard
        </button>
        
        <div className="flex gap-3 self-start sm:self-auto">
          <button
            onClick={onDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-sifter-elevated hover:bg-sifter-hover text-white rounded-lg transition-colors"
          >
            <span></span>
            <span className="hidden sm:inline">Download PDF</span>
          </button>
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-4 py-2 bg-sifter-elevated hover:bg-sifter-hover text-white rounded-lg transition-colors"
          >
            <span></span>
            <span className="hidden sm:inline">Share Report</span>
          </button>
        </div>
      </div>

      {/* Chain Badge if detected */}
      {detectedChain && (
        <div className="flex items-center gap-3 bg-sifter-card/50 border border-sifter-border rounded-xl p-4">
          <div className={`w-12 h-12 rounded-xl ${chainInfo.color} flex items-center justify-center text-white text-xl font-bold`}>
            {chainInfo.icon}
          </div>
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              {chainInfo.name} Network
              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded"> Verified
              </span>
            </h3>
            <p className="text-sm text-sifter-text-muted">{chainMessage}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-sifter-elevated text-sifter-text rounded">
                {detectedChain === 'solana' ? 'Fast Chain' : 
                 detectedChain === 'base' ? 'L2 Security' :
                 'EVM Compatible'}
              </span>
              <span className="text-xs px-2 py-1 bg-sifter-elevated text-sifter-text rounded"> Scan Time: {Math.floor(processingTime / 1000)}s
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={`text-center py-8 rounded-2xl border-2 ${
        riskLevel.color === 'red' ? 'border-red-500/30 bg-red-500/10' :
        riskLevel.color === 'orange' ? 'border-orange-500/30 bg-orange-500/10' :
        riskLevel.color === 'yellow' ? 'border-yellow-500/30 bg-yellow-500/10' :
        riskLevel.color === 'blue' ? 'border-blue-500/30 bg-blue-500/10' :
        'border-green-500/30 bg-green-500/10'
      }`}>
        <div className="text-5xl mb-4">{riskLevel.icon}</div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{riskLevel.label}</h1>
        <div className="text-2xl md:text-4xl font-bold text-white mb-2">{displayName}</div>
        <div className={`text-5xl md:text-6xl font-bold ${
          riskLevel.color === 'red' ? 'text-red-400' :
          riskLevel.color === 'orange' ? 'text-orange-400' :
          riskLevel.color === 'yellow' ? 'text-yellow-400' :
          riskLevel.color === 'blue' ? 'text-blue-400' :
          'text-green-400'
        }`}>
          {overallRisk.score}/100
        </div>
        <div className="text-sm md:text-base text-sifter-text-muted mt-3 px-4"> Scanned: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()} | 
          Duration: {Math.floor(processingTime / 1000)} seconds
          {detectedChain && ` | Network: ${chainInfo.name}`}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 px-4">
          <button
            onClick={onAddToWatchlist}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            <span></span> Add to Watchlist
          </button>
          <button
            onClick={onScanAnother}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-sifter-elevated hover:bg-sifter-hover text-white rounded-lg font-medium transition-colors"
          >
            <span></span> Scan Again
          </button>
        </div>
      </div>

      {/* Blitz Mode Report Display */}
      {blitzMode === 'hyper' && modeSpecificData?.hyperBlitzReport && (
        <div className="animate-fadeIn">
          <div className={`text-center py-4 rounded-xl mb-6 border-2 border-blue-500/50 bg-blue-500/10`}>
            <h2 className="text-xl font-bold text-white">HYPER-BLITZ SNAPSHOT</h2>
            <p className="text-sm text-sifter-text-muted mt-1"> Scan completed in {Math.floor(processingTime / 1000)} seconds
              {detectedChain && (
                <>
                  <br />
                  <span className="text-xs"> Chain: {chainInfo.name} • 
                    {detectedChain === 'solana' && 'Optimized for Solana speed'}
                    {detectedChain === 'base' && 'Optimized for Base L2'}
                  </span>
                </>
              )}
            </p>
          </div>
          
          {formatHyperBlitzReport({
            ...modeSpecificData.hyperBlitzReport,
            scanDuration: processingTime / 1000
          }, detectedChain)}
        </div>
      )}

      {blitzMode === 'momentum' && modeSpecificData?.momentumBlitzReport && (
        <div className="animate-fadeIn">
          <div className={`text-center py-4 rounded-xl mb-6 border-2 border-purple-500/50 bg-purple-500/10`}>
            <h2 className="text-xl font-bold text-white">MOMENTUM-BLITZ ANALYSIS</h2>
            <p className="text-sm text-sifter-text-muted mt-1"> Scan completed in {Math.floor(processingTime / 1000)} seconds
              {detectedChain && (
                <>
                  <br />
                  <span className="text-xs"> Chain: {chainInfo.name} • 
                    {detectedChain === 'solana' && 'Active trading analysis'}
                    {detectedChain === 'base' && 'Trending tokens focus'}
                  </span>
                </>
              )}
            </p>
          </div>
          
          {formatMomentumBlitzReport({
            ...modeSpecificData.momentumBlitzReport,
            scanDuration: processingTime / 1000
          }, detectedChain)}
        </div>
      )}

      {blitzMode === 'deep' && modeSpecificData?.deepBlitzReport && (
        <div className="animate-fadeIn">
          <div className={`text-center py-4 rounded-xl mb-6 border-2 border-green-500/50 bg-green-500/10`}>
            <h2 className="text-xl font-bold text-white">DEEP-BLITZ COMPREHENSIVE REPORT</h2>
            <p className="text-sm text-sifter-text-muted mt-1"> Scan completed in {Math.floor(processingTime / 1000)} seconds
              {detectedChain && (
                <>
                  <br />
                  <span className="text-xs"> Chain: {chainInfo.name} • 
                    {detectedChain === 'solana' && 'Full audit quality'}
                    {detectedChain === 'base' && 'Comprehensive assessment'}
                  </span>
                </>
              )}
            </p>
          </div>
          
          {formatDeepBlitzReport({
            ...modeSpecificData.deepBlitzReport,
            scanDuration: processingTime / 1000
          }, detectedChain)}
        </div>
      )}

      {/* Fallback to generic analysis if no mode-specific data */}
      {(!blitzMode || !modeSpecificData) && (
        <div className="space-y-8">
          <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Our Recommendation</h2>
            <div className={`text-lg font-semibold mb-3 ${
              riskLevel.color === 'red' ? 'text-red-400' :
              riskLevel.color === 'orange' ? 'text-orange-400' :
              riskLevel.color === 'yellow' ? 'text-yellow-400' :
              riskLevel.color === 'blue' ? 'text-blue-400' :
              'text-green-400'
            }`}>
              {recommendation.main}
            </div>
            <ul className="space-y-2">
              {recommendation.reasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-2 text-sifter-text">
                  <span className="mt-1">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
            {detectedChain && (
              <div className="mt-4 p-3 bg-sifter-elevated/50 rounded-lg border border-sifter-border">
                <p className="text-sm text-sifter-text">
                  <span className="font-medium">Chain-specific note:</span> {chainMessage}
                </p>
              </div>
            )}
          </div>

          <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Key Risk Indicators</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.slice(0, 4).map((metric) => {
                const score = metric?.score ?? metric?.value ?? 0;
                
                return (
                  <div key={metric.id} className="bg-sifter-dark/50 border border-sifter-border rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {Math.round(score)}/100
                    </div>
                    <div className="text-sm text-sifter-text-muted mt-1">{metric.name}</div>
                    <div className="mt-2">
                      <div className="h-1 bg-sifter-elevated rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            score >= 70 ? 'bg-red-500' :
                            score >= 50 ? 'bg-orange-500' :
                            score >= 30 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 pt-6 border-t border-sifter-border">
              <div className="flex items-center justify-between text-sifter-text-muted">
                <span className="text-sm">Additional metrics analyzed: {metrics.length - 4}</span>
                <button className="text-sm text-blue-400 hover:text-blue-300"> View all metrics →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Next Steps</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onScanAnother}
            className="p-4 rounded-lg border border-sifter-border hover:border-blue-500/50 hover:bg-sifter-card/50 transition-all text-left group"
          >
            <h3 className="font-medium text-white group-hover:text-blue-400">Check Another Project</h3>
            <p className="text-sm text-sifter-text-muted mt-1">Analyze a different project</p>
          </button>
          
          <button className="p-4 rounded-lg border border-sifter-border hover:border-blue-500/50 hover:bg-sifter-card/50 transition-all text-left group">
            <h3 className="font-medium text-white group-hover:text-blue-400">Learn About Scams</h3>
            <p className="text-sm text-sifter-text-muted mt-1">Common red flags to watch for</p>
          </button>
          
          <button className="p-4 rounded-lg border border-sifter-border hover:border-blue-500/50 hover:bg-sifter-card/50 transition-all text-left group">
            <h3 className="font-medium text-white group-hover:text-blue-400">Get Help</h3>
            <p className="text-sm text-sifter-text-muted mt-1">Questions about this report?</p>
          </button>
        </div>
      </div>

      {snaData && showSNAGraph && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-sifter-card border border-sifter-border rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col">
            <div className="p-4 flex justify-between items-center border-b border-sifter-border">
              <h2 className="text-xl font-bold text-white"> Contaminated Network Graph
                {detectedChain && (
                  <span className="text-sm text-sifter-text-muted ml-2">
                    • {chainInfo.name} Network
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowSNAGraph(false)}
                className="text-2xl text-sifter-text-muted hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <NetworkGraph
                data={snaData}
                options={{
                  nodes: { shape: 'dot', size: 20 },
                  edges: { arrows: 'to', smooth: true },
                  layout: { hierarchical: { direction: 'LR', sortMethod: 'directed' } },
                  physics: { enabled: true },
                  interaction: { hover: true, zoomView: true }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}