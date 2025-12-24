// src/components/data-donation/gamification/PointsDisplay.tsx
'use client';

import React from 'react';
import { UserGamificationProfile } from '@/types/dataDonation';

interface PointsDisplayProps {
  userProfile: UserGamificationProfile;
  showStreak?: boolean;
  showLevel?: boolean;
  compact?: boolean;
  showRank?: boolean;  // ← Add this
  onLevelUp?: () => void;  // ✅ ADD THIS

  onPointsClick?: () => void;
}

export default function PointsDisplay({
  userProfile,
  showStreak = true,
  showLevel = true,
  compact = false,
  showRank = false,  // ← Add this
  

  onPointsClick
}: PointsDisplayProps) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'diamond':
      case 'vc-elite':
      case 'research-fellow':
        return 'from-purple-500/20 to-purple-600/20 text-purple-400 border-purple-500/30';
      case 'platinum':
        return 'from-gray-500/20 to-gray-600/20 text-gray-400 border-gray-500/30';
      case 'gold':
        return 'from-amber-500/20 to-amber-600/20 text-amber-400 border-amber-500/30';
      case 'silver':
        return 'from-gray-400/20 to-gray-500/20 text-gray-300 border-gray-400/30';
      default:
        return 'from-amber-900/20 to-amber-950/20 text-amber-700 border-amber-900/30';
    }
  };

  if (compact) {
    return (
      <div 
        onClick={onPointsClick}
        className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
      >
        {/* Points */}
        <div className="text-right">
          <div className="text-lg font-bold text-amber-400">{userProfile.totalPoints.toLocaleString()}</div>
          <div className="text-xs text-gray-400">points</div>
        </div>

              {showRank && userProfile.leaderboardPosition && (
        <div className="mt-3 pt-3 border-t border-sifter-border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Leaderboard Rank</span>
            <span className="text-lg font-bold text-purple-400">
              #{userProfile.leaderboardPosition}
            </span>
          </div>
        </div>
      )}

        
        {/* Tier Badge */}
        <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${getTierColor(userProfile.currentTier)}`}>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {userProfile.currentTier === 'diamond' ? '💎' :
               userProfile.currentTier === 'platinum' ? '🥇' :
               userProfile.currentTier === 'gold' ? '🥈' :
               userProfile.currentTier === 'silver' ? '🥉' : '🔶'}
            </span>
            <span className="text-xs font-medium capitalize">
              {userProfile.currentTier.replace('-', ' ')}
            </span>
          </div>
        </div>
        
        {/* Streak */}
        {showStreak && userProfile.streak.currentStreak > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-red-400">🔥</span>
            <span className="text-sm font-medium text-white">{userProfile.streak.currentStreak}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={onPointsClick}
      className="bg-gradient-to-br from-gray-900 to-black border border-sifter-border rounded-xl p-4 cursor-pointer hover:border-blue-500/50 transition-colors"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-sm text-gray-400">Your Points</div>
          <div className="text-3xl font-bold text-amber-400">{userProfile.totalPoints.toLocaleString()}</div>
        </div>
        
        {/* Level */}
        {showLevel && (
          <div className="text-right">
            <div className="text-sm text-gray-400">Level</div>
            <div className="text-2xl font-bold text-white">{userProfile.currentLevel}</div>
          </div>
        )}
      </div>
      
      {/* Tier Display */}
      <div className={`mb-3 px-3 py-2 rounded-lg bg-gradient-to-r ${getTierColor(userProfile.currentTier)}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {userProfile.currentTier === 'diamond' ? '💎' :
               userProfile.currentTier === 'platinum' ? '🥇' :
               userProfile.currentTier === 'gold' ? '🥈' :
               userProfile.currentTier === 'silver' ? '🥉' : '🔶'}
            </span>
            <span className="font-medium capitalize">{userProfile.currentTier.replace('-', ' ')} Tier</span>
          </div>
          <span className="text-xs opacity-80">
            {userProfile.pointsMultiplier}x multiplier
          </span>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center">
          <div className="text-sm text-gray-400">Available</div>
          <div className="text-lg font-medium text-green-400">
            {userProfile.availablePoints.toLocaleString()}
          </div>
        </div>
        
        {showStreak && (
          <div className="text-center">
            <div className="text-sm text-gray-400">Streak</div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-red-400">🔥</span>
              <span className="text-lg font-medium text-white">{userProfile.streak.currentStreak}</span>
              <span className="text-xs text-gray-400">days</span>
            </div>
          </div>
        )}
        
        <div className="text-center">
          <div className="text-sm text-gray-400">Badges</div>
          <div className="text-lg font-medium text-white">{userProfile.badges.length}</div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-gray-400">Rank</div>
          <div className="text-lg font-medium text-blue-400">
            {userProfile.leaderboardPosition ? `#${userProfile.leaderboardPosition}` : '--'}
          </div>
        </div>
      </div>
    </div>
  );
}