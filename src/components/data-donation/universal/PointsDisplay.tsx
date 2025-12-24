'use client';

import React from 'react';

interface PointsDisplayProps {
  pointsData: number[];
  userTier: string;
  onEnterRewardPool: (points: number) => void;
  onRedeemPoints: (points: number) => void;
  userMode: 'ea-vc' | 'researcher' | 'individual';
  
}

export default function PointsDisplay({
  pointsData = [0, 0, 0, 0, 0], // [availablePoints, lifetimeEarned, pointsInPool, multiplier, nextMilestone]
  userTier = 'tier-3',
  onEnterRewardPool,
  onRedeemPoints,
  userMode = 'individual'
}: PointsDisplayProps) {
  // Unpack points data array
  const [availablePoints, lifetimeEarned, pointsInPool, multiplier, nextMilestone] = pointsData;
  
  // Tier configurations
  const tierConfig = {
    'tier-1': {
      name: 'Institutional',
      color: 'from-purple-500/20 to-purple-600/20',
      textColor: 'text-purple-400',
      badge: '🏢',
      multiplier: 2.0,
      minPoints: 10000
    },
    'tier-2': {
      name: 'Professional',
      color: 'from-blue-500/20 to-blue-600/20',
      textColor: 'text-blue-400',
      badge: '👔',
      multiplier: 1.5,
      minPoints: 5000
    },
    'tier-3': {
      name: 'Community',
      color: 'from-green-500/20 to-green-600/20',
      textColor: 'text-green-400',
      badge: '👤',
      multiplier: 1.0,
      minPoints: 0
    }
  };

  // Mode configurations
  const modeConfig = {
    'ea-vc': {
      name: 'VC/EA Mode',
      icon: '🏢',
      color: 'from-blue-500/10 to-blue-600/20',
      pointEarning: 'Earn 3x points for verified entities'
    },
    'researcher': {
      name: 'Researcher Mode',
      icon: '🔬',
      color: 'from-purple-500/10 to-purple-600/20',
      pointEarning: 'Earn 2x points for deep analysis evidence'
    },
    'individual': {
      name: 'Individual Mode',
      icon: '👤',
      color: 'from-green-500/10 to-green-600/20',
      pointEarning: 'Earn 1x points for community reports'
    }
  };

  const currentTier = tierConfig[userTier as keyof typeof tierConfig] || tierConfig['tier-3'];
  const currentMode = modeConfig[userMode];

  // Calculate progress to next tier
  const calculateTierProgress = () => {
    const nextTierPoints = {
      'tier-3': 5000,
      'tier-2': 10000,
      'tier-1': Infinity
    };
    
    const nextTier = userTier === 'tier-3' ? 'tier-2' : userTier === 'tier-2' ? 'tier-1' : null;
    const pointsNeeded = nextTier ? nextTierPoints[nextTier as keyof typeof nextTierPoints] : 0;
    const progress = nextTier ? Math.min(100, (lifetimeEarned / pointsNeeded) * 100) : 100;
    
    return { nextTier, pointsNeeded, progress };
  };

  const { nextTier, pointsNeeded, progress } = calculateTierProgress();

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className={`bg-gradient-to-br ${currentMode.color} border border-sifter-border rounded-2xl p-6`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-white">Points & Rewards</h2>
            <span className={`px-3 py-1 rounded-full ${currentTier.color} ${currentTier.textColor} text-sm font-medium`}>
              {currentTier.badge} {currentTier.name}
            </span>
          </div>
          <p className="text-gray-400">
            {currentMode.pointEarning} • Multiplier: {multiplier}x
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-4xl font-bold text-white mb-1">{formatNumber(availablePoints)}</div>
          <div className="text-sm text-gray-400">Available Points</div>
        </div>
      </div>

      {/* Points Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-sifter-dark/50 border border-sifter-border rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Lifetime Earned</div>
          <div className="text-2xl font-bold text-white">{formatNumber(lifetimeEarned)}</div>
        </div>
        
        <div className="bg-sifter-dark/50 border border-sifter-border rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">In Reward Pool</div>
          <div className="text-2xl font-bold text-green-400">{formatNumber(pointsInPool)}</div>
        </div>
        
        <div className="bg-sifter-dark/50 border border-sifter-border rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Current Multiplier</div>
          <div className="text-2xl font-bold text-amber-400">{multiplier}x</div>
        </div>
        
        <div className="bg-sifter-dark/50 border border-sifter-border rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Next Milestone</div>
          <div className="text-2xl font-bold text-purple-400">{formatNumber(nextMilestone)}</div>
        </div>
      </div>

      {/* Tier Progress */}
      {nextTier && (
        <div className="mb-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="text-sm font-medium text-white mb-1">
                Progress to {tierConfig[nextTier as keyof typeof tierConfig]?.name} Tier
              </div>
              <div className="text-xs text-gray-400">
                {formatNumber(pointsNeeded - lifetimeEarned)} points needed
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white">{progress.toFixed(1)}%</div>
              <div className="text-xs text-gray-400">Complete</div>
            </div>
          </div>
          
          <div className="w-full bg-sifter-border rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="text-sm text-gray-300">
            Unlock: <span className="text-white font-medium">
              {tierConfig[nextTier as keyof typeof tierConfig]?.multiplier}x multiplier
            </span>
          </div>
        </div>
      )}

      {/* Recent Rewards */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Rewards</h3>
        <div className="space-y-3">
          {[
            { id: 1, type: 'Submission Approved', points: 500, date: '2 hours ago' },
            { id: 2, type: 'Evidence Verified', points: 250, date: '1 day ago' },
            { id: 3, type: 'Entity Confirmed', points: 1000, date: '3 days ago' },
            { id: 4, type: 'Pattern Discovered', points: 750, date: '1 week ago' }
          ].map((reward) => (
            <div key={reward.id} className="flex justify-between items-center p-3 border border-sifter-border rounded-lg hover:bg-sifter-dark/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🏆</span>
                </div>
                <div>
                  <div className="text-white font-medium">{reward.type}</div>
                  <div className="text-xs text-gray-400">{reward.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-amber-400">+{reward.points}</div>
                <div className="text-xs text-gray-400">Points</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onEnterRewardPool(availablePoints)}
          disabled={availablePoints < 1000}
          className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            availablePoints >= 1000
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span className="text-xl">🎰</span>
          Enter Reward Pool
        </button>
        
        <button
          onClick={() => onRedeemPoints(availablePoints)}
          disabled={availablePoints < 500}
          className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            availablePoints >= 500
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span className="text-xl">💎</span>
          Redeem Points
        </button>
        
        <button className="px-6 py-3 bg-sifter-dark border border-sifter-border hover:bg-sifter-dark/80 
                 text-gray-300 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
          <span className="text-xl">🏪</span>
          Rewards Shop
        </button>
      </div>

      {/* Points Info */}
      <div className="mt-8 pt-6 border-t border-sifter-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-white font-medium mb-1">Submission</div>
            <div className="text-amber-400">500-1500 pts</div>
          </div>
          <div className="text-center">
            <div className="text-white font-medium mb-1">Evidence</div>
            <div className="text-amber-400">250-500 pts</div>
          </div>
          <div className="text-center">
            <div className="text-white font-medium mb-1">Verification</div>
            <div className="text-amber-400">1000 pts</div>
          </div>
          <div className="text-center">
            <div className="text-white font-medium mb-1">Impact</div>
            <div className="text-amber-400">Multiplier</div>
          </div>
        </div>
      </div>
    </div>
  );
}