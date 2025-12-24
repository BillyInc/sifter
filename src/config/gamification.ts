// src/config/gamification.ts
import { GamificationConfig, UserMode, UserGamificationProfile } from '@/types/dataDonation';

export const GAMIFICATION_CONFIG: GamificationConfig = {
  // Tier thresholds (points required)
  tierThresholds: {
    'bronze': 0,
    'silver': 1000,
    'gold': 5000,
    'platinum': 10000,
    'diamond': 25000,
    'vc-elite': 50000,    // Special VC tier
    'research-fellow': 30000 // Special researcher tier
  },
  
  // Level calculation
  levelMultiplier: 100, // 100 points per level
  
  // Streak bonuses: [days, multiplier]
  streakBonuses: [1, 1.1, 1.2, 1.5, 2.0], // Day 2: 1.1x, Day 3: 1.2x, etc.
  
  // Badge definitions
  badges: [
    // Submission badges
    {
      id: 'first-report',
      name: 'First Report',
      description: 'Submitted your first report',
      icon: '🎯',
      rarity: 'common',
      category: 'submission',
      pointsReward: 100,
      criteria: (user) => user.totalPoints >= 100
    },
    {
      id: 'trusted-contributor',
      name: 'Trusted Contributor',
      description: '10 approved submissions',
      icon: '✅',
      rarity: 'uncommon',
      category: 'submission',
      pointsReward: 500,
      criteria: (user) => user.totalPoints >= 1000
    },
    {
      id: 'expert-analyst',
      name: 'Expert Analyst',
      description: '50 approved submissions',
      icon: '🔬',
      rarity: 'rare',
      category: 'submission',
      pointsReward: 2000,
      criteria: (user) => user.totalPoints >= 5000
    },
    {
      id: 'master-investigator',
      name: 'Master Investigator',
      description: '100 approved submissions',
      icon: '🕵️',
      rarity: 'epic',
      category: 'submission',
      pointsReward: 5000,
      criteria: (user) => user.totalPoints >= 10000
    },
    
    // Impact badges
    {
      id: 'community-protector',
      name: 'Community Protector',
      description: 'Your reports protected 100+ users',
      icon: '🛡️',
      rarity: 'rare',
      category: 'impact',
      pointsReward: 1000,
      criteria: (user) => user.totalPoints >= 3000
    },
    {
      id: 'pattern-spotter',
      name: 'Pattern Spotter',
      description: 'Identified a recurring scam pattern',
      icon: '🎯',
      rarity: 'epic',
      category: 'impact',
      pointsReward: 2500,
      criteria: (user) => user.totalPoints >= 7500
    },
    
    // Consistency badges
    {
      id: 'week-warrior',
      name: 'Week Warrior',
      description: '7-day submission streak',
      icon: '🔥',
      rarity: 'uncommon',
      category: 'consistency',
      pointsReward: 500,
      criteria: (user) => user.streak.currentStreak >= 7
    },
    {
      id: 'month-master',
      name: 'Month Master',
      description: '30-day submission streak',
      icon: '⚡',
      rarity: 'rare',
      category: 'consistency',
      pointsReward: 1500,
      criteria: (user) => user.streak.currentStreak >= 30
    },
    
    // Mode-specific badges
    {
      id: 'vc-portfolio-guardian',
      name: 'Portfolio Guardian',
      description: 'VC: Protected $1M+ in portfolio value',
      icon: '🏢',
      rarity: 'epic',
      category: 'special',
      pointsReward: 5000,
      criteria: (user) => user.mode === 'ea-vc' && user.totalPoints >= 10000
    },
    {
      id: 'research-pioneer',
      name: 'Research Pioneer',
      description: 'Researcher: Published groundbreaking analysis',
      icon: '📚',
      rarity: 'epic',
      category: 'special',
      pointsReward: 3000,
      criteria: (user) => user.mode === 'researcher' && user.totalPoints >= 8000
    }
  ],
  
  // Achievement definitions
  achievements: [
    {
      id: 'submit-5-reports',
      name: 'Getting Started',
      description: 'Submit 5 reports',
      target: 5,
      pointsReward: 250,
      progressFn: (user) => Math.min(user.totalPoints / 500, 1) // Simplified
    },
    {
      id: 'reach-silver-tier',
      name: 'Rising Star',
      description: 'Reach Silver Tier',
      target: 1000,
      pointsReward: 1000,
      progressFn: (user) => Math.min(user.totalPoints / 1000, 1)
    },
    {
      id: 'earn-5-badges',
      name: 'Badge Collector',
      description: 'Earn 5 different badges',
      target: 5,
      pointsReward: 1000,
      progressFn: (user) => Math.min(user.badges.length / 5, 1)
    }
  ]
};