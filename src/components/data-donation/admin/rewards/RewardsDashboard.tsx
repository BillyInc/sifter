// src/components/data-donation/admin/rewards/RewardsDashboard.tsx
'use client';

import React, { useState } from 'react';

export default function RewardsDashboard() {
  const [activeTab, setActiveTab] = useState<'points' | 'badges' | 'leaderboard'>('points');

  const demoData = {
    totalPoints: 1250,
    badges: [
      { name: 'First Flag', icon: '🚩', earned: true },
      { name: 'Evidence Collector', icon: '📚', earned: true },
      { name: 'Dispute Resolver', icon: '⚖️', earned: false },
      { name: 'Top Contributor', icon: '🏆', earned: false },
    ],
    leaderboard: [
      { rank: 1, name: 'CryptoVigilante', points: 4500 },
      { rank: 2, name: 'BlockchainSheriff', points: 3200 },
      { rank: 3, name: 'DeFiDetective', points: 2800 },
      { rank: 4, name: 'You', points: 1250 },
    ],
    recentRewards: [
      { type: 'submission', points: 100, description: 'Submitted CryptoScam Inc evidence' },
      { type: 'verification', points: 50, description: 'Verified 3 evidence links' },
      { type: 'review', points: 150, description: 'Reviewed 2 submissions' },
    ]
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Rewards & Gamification</h2>
        <p className="text-gray-400">Incentivize participation through points and badges</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
          <div className="text-3xl font-bold text-yellow-400">{demoData.totalPoints}</div>
          <div className="text-gray-400">Your Points</div>
          <div className="text-sm text-yellow-400 mt-2">Top 15% of contributors</div>
        </div>
        
        <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
          <div className="text-3xl font-bold text-blue-400">
            {demoData.badges.filter(b => b.earned).length}
          </div>
          <div className="text-gray-400">Badges Earned</div>
          <div className="text-sm text-blue-400 mt-2">{4 - demoData.badges.filter(b => b.earned).length} more to unlock</div>
        </div>
        
        <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
          <div className="text-3xl font-bold text-purple-400">4th</div>
          <div className="text-gray-400">Leaderboard Rank</div>
          <div className="text-sm text-purple-400 mt-2">1750 points to next rank</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-sifter-border">
        {['points', 'badges', 'leaderboard'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-3 -mb-px font-medium ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'points' && (
          <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
            <h3 className="font-medium text-white mb-4">Recent Points Activity</h3>
            <div className="space-y-4">
              {demoData.recentRewards.map((reward, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border border-sifter-border rounded-lg">
                  <div>
                    <div className="text-white">{reward.description}</div>
                    <div className="text-sm text-gray-400">{reward.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-medium">+{reward.points} points</div>
                    <div className="text-xs text-gray-500">2 hours ago</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-sifter-border">
              <h4 className="font-medium text-white mb-3">How to Earn Points</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-sifter-border rounded-lg p-4">
                  <div className="text-green-400 font-medium mb-1">Submit Evidence</div>
                  <div className="text-sm text-gray-400">50-200 points per verified submission</div>
                </div>
                <div className="border border-sifter-border rounded-lg p-4">
                  <div className="text-blue-400 font-medium mb-1">Verify Links</div>
                  <div className="text-sm text-gray-400">10-50 points per link verification</div>
                </div>
                <div className="border border-sifter-border rounded-lg p-4">
                  <div className="text-purple-400 font-medium mb-1">Review Submissions</div>
                  <div className="text-sm text-gray-400">100-300 points per review</div>
                </div>
                <div className="border border-sifter-border rounded-lg p-4">
                  <div className="text-yellow-400 font-medium mb-1">Gitcoin Grants</div>
                  <div className="text-sm text-gray-400">Convert points to grants quarterly</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
            <h3 className="font-medium text-white mb-4">Badges & Achievements</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {demoData.badges.map((badge, idx) => (
                <div key={idx} className={`border rounded-lg p-4 text-center ${
                  badge.earned 
                    ? 'border-green-500/30 bg-green-500/5' 
                    : 'border-sifter-border opacity-50'
                }`}>
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <div className="font-medium text-white mb-1">{badge.name}</div>
                  <div className={`text-xs ${badge.earned ? 'text-green-400' : 'text-gray-500'}`}>
                    {badge.earned ? 'Earned ✓' : 'Locked 🔒'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
            <h3 className="font-medium text-white mb-4">Top Contributors</h3>
            <div className="space-y-3">
              {demoData.leaderboard.map((user) => (
                <div key={user.rank} className={`flex items-center justify-between p-3 rounded-lg ${
                  user.name === 'You' 
                    ? 'bg-blue-500/10 border border-blue-500/30' 
                    : 'border border-sifter-border'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      user.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                      user.rank === 2 ? 'bg-gray-500/20 text-gray-400' :
                      user.rank === 3 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-sifter-dark text-gray-400'
                    }`}>
                      {user.rank}
                    </div>
                    <div>
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-sm text-gray-400">
                        {user.points.toLocaleString()} points
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-medium">Top {user.rank === 1 ? '1%' : user.rank === 2 ? '3%' : '5%'}</div>
                    <div className="text-xs text-gray-500">Active contributor</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="border border-sifter-border rounded-xl p-6">
        <h3 className="font-medium text-white mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg">
            Claim Gitcoin Grant
          </button>
          <button className="px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 rounded-lg">
            Invite Friends (+100 pts)
          </button>
          <button className="px-4 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg">
            View Reward History
          </button>
        </div>
      </div>
    </div>
  );
}