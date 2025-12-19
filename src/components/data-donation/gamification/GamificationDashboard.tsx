// src/components/data-donation/gamification/GamificationDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { GamificationService } from '@/services/gamification';
import { 
  UserGamificationProfile, LeaderboardEntry, UserMode, UserTier, 
  Badge, Achievement 
} from '@/types/datadonation';

interface GamificationDashboardProps {
  userProfile: UserGamificationProfile;
  leaderboardData?: LeaderboardEntry[];
  onClaimReward?: (rewardId: string) => Promise<void>;
  onViewLeaderboard?: () => void;
}

export default function GamificationDashboard({
  userProfile,
  leaderboardData = [],
  onClaimReward,
  onViewLeaderboard
}: GamificationDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'achievements' | 'leaderboard'>('overview');
  const [filterMode, setFilterMode] = useState<UserMode | 'all'>('all');
  
  // Calculate level progress
  const levelProgress = GamificationService.calculateLevelProgress(userProfile.totalPoints);
  const tierBenefits = GamificationService.getTierBenefits(userProfile.currentTier, userProfile.mode);
  
  // Filter leaderboard by mode
  const filteredLeaderboard = filterMode === 'all' 
    ? leaderboardData 
    : leaderboardData.filter(entry => entry.mode === filterMode);
  
  // Group badges by category
  const badgesByCategory = userProfile.badges.reduce((acc, badge) => {
    if (!acc[badge.category]) acc[badge.category] = [];
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-sifter-border rounded-2xl p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Gamification Profile</h2>
          <p className="text-gray-400">Earn points, unlock badges, and climb the leaderboard</p>
        </div>
        
        {/* Mode indicator */}
        <div className={`px-4 py-2 rounded-lg ${
          userProfile.mode === 'ea-vc' ? 'bg-blue-500/20 text-blue-400' :
          userProfile.mode === 'researcher' ? 'bg-purple-500/20 text-purple-400' :
          'bg-green-500/20 text-green-400'
        } border ${
          userProfile.mode === 'ea-vc' ? 'border-blue-500/30' :
          userProfile.mode === 'researcher' ? 'border-purple-500/30' :
          'border-green-500/30'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {userProfile.mode === 'ea-vc' ? '🏢' :
               userProfile.mode === 'researcher' ? '🔬' : '👤'}
            </span>
            <div>
              <div className="font-medium">{userProfile.mode === 'ea-vc' ? 'VC Mode' :
               userProfile.mode === 'researcher' ? 'Researcher Mode' : 'Individual Mode'}</div>
              <div className="text-xs opacity-80">{userProfile.pointsMultiplier}x points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-sifter-border mb-6">
        <div className="flex gap-4">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'badges', label: 'Badges', icon: '🏆' },
            { id: 'achievements', label: 'Achievements', icon: '🎯' },
            { id: 'leaderboard', label: 'Leaderboard', icon: '🏅' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 font-medium flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Points & Tier Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Points Card */}
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💎</span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Total Points</div>
                    <div className="text-3xl font-bold text-white">{userProfile.totalPoints.toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  <div className="flex justify-between mb-1">
                    <span>Available to redeem</span>
                    <span className="text-amber-400">{userProfile.availablePoints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lifetime earned</span>
                    <span className="text-green-400">{userProfile.lifetimePoints.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Tier Card */}
              <div className={`border rounded-xl p-6 ${
                userProfile.currentTier === 'diamond' || userProfile.currentTier === 'vc-elite' || userProfile.currentTier === 'research-fellow'
                  ? 'bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30' :
                userProfile.currentTier === 'platinum'
                  ? 'bg-gradient-to-br from-gray-500/10 to-gray-600/10 border-gray-500/30' :
                userProfile.currentTier === 'gold'
                  ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/30' :
                userProfile.currentTier === 'silver'
                  ? 'bg-gradient-to-br from-gray-400/10 to-gray-500/10 border-gray-400/30' :
                  'bg-gradient-to-br from-amber-900/10 to-amber-950/10 border-amber-900/30'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    userProfile.currentTier === 'diamond' || userProfile.currentTier === 'vc-elite' || userProfile.currentTier === 'research-fellow'
                      ? 'bg-purple-500/20' :
                    userProfile.currentTier === 'platinum'
                      ? 'bg-gray-500/20' :
                    userProfile.currentTier === 'gold'
                      ? 'bg-amber-500/20' :
                    userProfile.currentTier === 'silver'
                      ? 'bg-gray-400/20' :
                      'bg-amber-900/20'
                  }`}>
                    <span className="text-2xl">
                      {userProfile.currentTier === 'diamond' ? '💎' :
                       userProfile.currentTier === 'platinum' ? '🥇' :
                       userProfile.currentTier === 'gold' ? '🥈' :
                       userProfile.currentTier === 'silver' ? '🥉' : '🔶'}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Current Tier</div>
                    <div className="text-2xl font-bold text-white capitalize">{userProfile.currentTier.replace('-', ' ')}</div>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="text-gray-400 mb-1">Level {userProfile.currentLevel}</div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      style={{ width: `${levelProgress.percent}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {levelProgress.current}/{levelProgress.total} to next level
                  </div>
                </div>
              </div>

              {/* Streak Card */}
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔥</span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Current Streak</div>
                    <div className="text-3xl font-bold text-white">{userProfile.streak.currentStreak} days</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  <div className="flex justify-between mb-1">
                    <span>Longest streak</span>
                    <span className="text-orange-400">{userProfile.streak.longestStreak} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Streak bonus</span>
                    <span className="text-green-400">{userProfile.streak.streakBonus.toFixed(1)}x</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tier Benefits */}
            <div className="border border-sifter-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Tier Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tierBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-sifter-dark/50 rounded-lg">
                    <span className="text-green-400 text-lg">✓</span>
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
              
              {/* Next Tier Info */}
              {userProfile.nextMilestone && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white">Next Milestone</div>
                      <div className="text-sm text-gray-400">{userProfile.nextMilestone.pointsNeeded.toLocaleString()} points needed</div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-medium">{userProfile.nextMilestone.reward}</div>
                      <div className="text-xs text-gray-400">Reward</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-sifter-dark/50 border border-sifter-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{userProfile.badges.length}</div>
                <div className="text-sm text-gray-400">Badges Earned</div>
              </div>
              <div className="bg-sifter-dark/50 border border-sifter-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {userProfile.achievements.filter(a => a.completed).length}
                </div>
                <div className="text-sm text-gray-400">Achievements</div>
              </div>
              <div className="bg-sifter-dark/50 border border-sifter-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {userProfile.leaderboardPosition || '--'}
                </div>
                <div className="text-sm text-gray-400">Leaderboard Rank</div>
              </div>
              <div className="bg-sifter-dark/50 border border-sifter-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {userProfile.pointsMultiplier}x
                </div>
                <div className="text-sm text-gray-400">Points Multiplier</div>
              </div>
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Badges</h3>
              <div className="text-sm text-gray-400">
                Earned {userProfile.badges.length} of {Object.keys(badgesByCategory).length} total badges
              </div>
            </div>

            {Object.entries(badgesByCategory).map(([category, badges]) => (
              <div key={category} className="mb-8">
                <h4 className="font-medium text-white mb-4 capitalize">{category} Badges</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {badges.map((badge) => (
                    <div key={badge.id} className="border border-sifter-border rounded-xl p-4 text-center">
                      <div className="text-4xl mb-3">{badge.icon}</div>
                      <div className="font-medium text-white mb-1">{badge.name}</div>
                      <div className="text-xs text-gray-400 mb-2">{badge.description}</div>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                        badge.rarity === 'legendary' ? 'bg-purple-500/20 text-purple-400' :
                        badge.rarity === 'epic' ? 'bg-red-500/20 text-red-400' :
                        badge.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                        badge.rarity === 'uncommon' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {badge.rarity.toUpperCase()}
                      </div>
                      <div className="text-xs text-amber-400 mt-2">+{badge.pointsReward} points</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Achievements</h3>
              <div className="text-sm text-gray-400">
                {userProfile.achievements.filter(a => a.completed).length} of {userProfile.achievements.length} completed
              </div>
            </div>

            <div className="space-y-4">
              {userProfile.achievements.map((achievement) => (
                <div key={achievement.id} className="border border-sifter-border rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-white mb-1">{achievement.name}</div>
                      <div className="text-sm text-gray-400 mb-3">{achievement.description}</div>
                      
                      {/* Progress */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{Math.round(achievement.progress * achievement.target)}/{achievement.target}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              achievement.completed ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${achievement.progress * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.completed 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-800/50 text-gray-400'
                      }`}>
                        {achievement.completed ? '✓' : '🎯'}
                      </div>
                      <div className="text-amber-400 font-medium mt-2">+{achievement.pointsReward}</div>
                      <div className="text-xs text-gray-400">points</div>
                    </div>
                  </div>
                  
                  {achievement.completed && achievement.completedAt && (
                    <div className="text-xs text-gray-500 mt-3">
                      Completed on {new Date(achievement.completedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
                <p className="text-sm text-gray-400">Top contributors this month</p>
              </div>
              
              {/* Mode Filter */}
              <div className="flex gap-2">
                {['all', 'ea-vc', 'researcher', 'individual'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode as any)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filterMode === mode
                        ? mode === 'ea-vc' ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50' :
                          mode === 'researcher' ? 'bg-purple-500/30 text-purple-400 border border-purple-500/50' :
                          mode === 'individual' ? 'bg-green-500/30 text-green-400 border border-green-500/50' :
                          'bg-gray-700 text-white border border-gray-600'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                    }`}
                  >
                    {mode === 'all' ? 'All Modes' :
                     mode === 'ea-vc' ? '🏢 VCs' :
                     mode === 'researcher' ? '🔬 Researchers' :
                     '👤 Individuals'}
                  </button>
                ))}
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="border border-sifter-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-sifter-dark/50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Contributor</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Mode</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Points</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Level</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Approved</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sifter-border">
                    {filteredLeaderboard.slice(0, 20).map((entry) => (
                      <tr key={entry.userId} className="hover:bg-sifter-dark/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              entry.rank <= 3 ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800/50 text-gray-400'
                            }`}>
                              {entry.rank}
                            </div>
                            {entry.rank <= 3 && (
                              <span className="text-lg">
                                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              entry.mode === 'ea-vc' ? 'bg-blue-500/20 text-blue-400' :
                              entry.mode === 'researcher' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {entry.mode === 'ea-vc' ? '🏢' :
                               entry.mode === 'researcher' ? '🔬' : '👤'}
                            </div>
                            <div>
                              <div className="font-medium text-white">{entry.userName}</div>
                              <div className="text-xs text-gray-400">{entry.badgesCount} badges</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            entry.mode === 'ea-vc' ? 'bg-blue-500/20 text-blue-400' :
                            entry.mode === 'researcher' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {entry.mode === 'ea-vc' ? 'VC' :
                             entry.mode === 'researcher' ? 'Researcher' : 'Individual'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{entry.points.toLocaleString()}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300">Lvl {entry.level}</span>
                            <span className={`text-xs px-2 py-1 rounded capitalize ${
                              entry.tier === 'diamond' || entry.tier === 'vc-elite' || entry.tier === 'research-fellow'
                                ? 'bg-purple-500/20 text-purple-400' :
                              entry.tier === 'platinum'
                                ? 'bg-gray-500/20 text-gray-400' :
                              entry.tier === 'gold'
                                ? 'bg-amber-500/20 text-amber-400' :
                              entry.tier === 'silver'
                                ? 'bg-gray-400/20 text-gray-300' :
                                'bg-amber-900/20 text-amber-700'
                            }`}>
                              {entry.tier}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-300">{entry.approved} approved</div>
                          <div className="text-xs text-gray-500">{entry.submissions} total</div>
                        </td>
                        <td className="py-3 px-4">
                          {entry.change && entry.changeAmount && (
                            <div className={`flex items-center gap-1 ${
                              entry.change === 'up' ? 'text-green-400' :
                              entry.change === 'down' ? 'text-red-400' : 'text-gray-400'
                            }`}>
                              {entry.change === 'up' ? '↑' : entry.change === 'down' ? '↓' : '→'}
                              <span className="text-sm">{entry.changeAmount}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* User's Position */}
              {userProfile.leaderboardPosition && (
                <div className="p-4 border-t border-sifter-border bg-sifter-dark/50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400">Your position:</div>
                      <div className="font-bold text-white">#{userProfile.leaderboardPosition}</div>
                    </div>
                    <button 
                      onClick={onViewLeaderboard}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                               text-white rounded-lg font-medium text-sm transition-all"
                    >
                      View Full Leaderboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 pt-6 border-t border-sifter-border flex justify-between">
        <div className="text-sm text-gray-400">
          Points refresh daily • Leaderboards update hourly
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 
                   border border-gray-700 rounded-lg font-medium text-sm">
            How Points Work
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                   text-white rounded-lg font-medium text-sm">
            Redeem Points
          </button>
        </div>
      </div>
    </div>
  );
}