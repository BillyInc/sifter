// src/services/gamification.ts
import { 
  UserGamificationProfile, 
  UserTier, 
  Badge, 
  Achievement, 
  StreakData, 
  LeaderboardEntry,
  SubmissionGamificationResult,
  UserMode
} from '@/types/dataDonation';
import { GAMIFICATION_CONFIG } from '@/config/gamification';

export class GamificationService {
  // Calculate user's current tier
  static calculateTier(points: number, mode: string): UserTier {
    const thresholds = GAMIFICATION_CONFIG.tierThresholds;
    
    if (mode === 'ea-vc' && points >= thresholds['vc-elite']) return 'vc-elite';
    if (mode === 'researcher' && points >= thresholds['research-fellow']) return 'research-fellow';
    
    if (points >= thresholds.diamond) return 'diamond';
    if (points >= thresholds.platinum) return 'platinum';
    if (points >= thresholds.gold) return 'gold';
    if (points >= thresholds.silver) return 'silver';
    return 'bronze';
  }
  
  // Calculate user's level
  static calculateLevel(points: number): number {
    return Math.floor(points / GAMIFICATION_CONFIG.levelMultiplier) + 1;
  }
  
  // Calculate progress to next level
  static calculateLevelProgress(points: number): { current: number; total: number; percent: number } {
    const level = this.calculateLevel(points);
    const pointsForCurrentLevel = (level - 1) * GAMIFICATION_CONFIG.levelMultiplier;
    const pointsForNextLevel = level * GAMIFICATION_CONFIG.levelMultiplier;
    const pointsInLevel = points - pointsForCurrentLevel;
    const pointsNeeded = GAMIFICATION_CONFIG.levelMultiplier;
    const percent = (pointsInLevel / pointsNeeded) * 100;
    
    return {
      current: pointsInLevel,
      total: pointsNeeded,
      percent: Math.min(100, percent)
    };
  }
  
  // Check and award badges
  static checkBadges(user: UserGamificationProfile): Badge[] {
    const newBadges: Badge[] = [];
    const existingBadgeIds = user.badges.map(b => b.id);
    
    GAMIFICATION_CONFIG.badges.forEach(badgeDef => {
      if (!existingBadgeIds.includes(badgeDef.id) && badgeDef.criteria(user)) {
        newBadges.push({
          id: badgeDef.id,
          name: badgeDef.name,
          description: badgeDef.description,
          icon: badgeDef.icon,
          earnedAt: new Date().toISOString(),
          rarity: badgeDef.rarity,
          category: badgeDef.category,
          pointsReward: badgeDef.pointsReward
        });
      }
    });
    
    return newBadges;
  }
  
  // Check and update achievements
  static checkAchievements(user: UserGamificationProfile): Achievement[] {
    const updatedAchievements = [...user.achievements];
    
    GAMIFICATION_CONFIG.achievements.forEach(achievementDef => {
      const existingIndex = updatedAchievements.findIndex(a => a.id === achievementDef.id);
      const progress = achievementDef.progressFn(user);
      const isCompleted = progress >= 1;
      
      if (existingIndex === -1) {
        // New achievement
        updatedAchievements.push({
          id: achievementDef.id,
          name: achievementDef.name,
          description: achievementDef.description,
          progress: Math.min(progress, 1),
          target: achievementDef.target,
          completed: isCompleted,
          completedAt: isCompleted ? new Date().toISOString() : undefined,
          pointsReward: achievementDef.pointsReward
        });
      } else {
        // Update existing achievement
        const achievement = updatedAchievements[existingIndex];
        if (!achievement.completed) {
          achievement.progress = Math.min(progress, 1);
          if (isCompleted) {
            achievement.completed = true;
            achievement.completedAt = new Date().toISOString();
          }
        }
      }
    });
    
    return updatedAchievements;
  }
  
  // Update streak
  static updateStreak(currentStreak: StreakData): StreakData {
    const now = new Date();
    const lastActivity = new Date(currentStreak.lastActivity);
    const diffDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    let newStreak = currentStreak.currentStreak;
    let longestStreak = currentStreak.longestStreak;
    
    if (diffDays === 1) {
      // Consecutive day
      newStreak += 1;
      longestStreak = Math.max(longestStreak, newStreak);
    } else if (diffDays > 1) {
      // Streak broken
      newStreak = 1;
    }
    // diffDays === 0 means already logged today, keep streak
    
    // Calculate streak bonus multiplier
    let streakBonus = 1.0;
    if (newStreak >= 30) streakBonus = 2.0;
    else if (newStreak >= 20) streakBonus = 1.5;
    else if (newStreak >= 10) streakBonus = 1.2;
    else if (newStreak >= 5) streakBonus = 1.1;
    else if (newStreak >= 2) streakBonus = 1.05;
    
    return {
      currentStreak: newStreak,
      longestStreak: longestStreak,
      lastActivity: now.toISOString(),
      streakBonus: streakBonus
    };
  }
  
  // Calculate points with bonuses
  static calculatePointsWithBonuses(
    basePoints: number, 
    mode: string, 
    streakMultiplier: number = 1
  ): number {
    const modeMultiplier = {
      'ea-vc': 5,
      'researcher': 3,
      'individual': 1
    }[mode] || 1;
    
    const totalMultiplier = modeMultiplier * streakMultiplier;
    return Math.floor(basePoints * totalMultiplier);
  }
  
  // Generate leaderboard data
  static generateLeaderboard(
    entries: LeaderboardEntry[], 
    mode?: string, 
    timeframe: 'daily' | 'weekly' | 'monthly' | 'alltime' = 'alltime'
  ): LeaderboardEntry[] {
    let filtered = mode ? entries.filter(e => e.mode === mode) : entries;
    
    // Sort by points (descending)
    filtered.sort((a, b) => b.points - a.points);
    
    // Add rank and change indicators
    return filtered.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      change: this.calculateRankChange(entry.userId, index, timeframe)
    }));
  }
  
  private static calculateRankChange(userId: string, currentRank: number, timeframe: string): 'up' | 'down' | 'same' {
    // In a real app, you'd compare with previous rank from database
    // For now, return random for demo
    const changes = ['up', 'down', 'same'] as const;
    return changes[Math.floor(Math.random() * 3)];
  }
  
  // Get tier benefits
  static getTierBenefits(tier: UserTier, mode: string): string[] {
    const benefits: Record<UserTier, string[]> = {
      'bronze': ['Basic submission access', 'Public leaderboard view'],
      'silver': ['Bronze benefits +', 'Faster review (48h)', 'Basic analytics'],
      'gold': ['Silver benefits +', 'Priority review (24h)', 'Advanced analytics', 'Badge display'],
      'platinum': ['Gold benefits +', 'VIP review (12h)', 'Portfolio alerts', 'API access'],
      'diamond': ['Platinum benefits +', 'Direct admin contact', 'Custom reports', 'Advisory role'],
      'vc-elite': ['Diamond benefits +', 'Deal room access', 'Legal team support', 'Portfolio scanning'],
      'research-fellow': ['Diamond benefits +', 'Research grant eligibility', 'Conference invitations', 'Co-authorship']
    };
    
    return benefits[tier] || benefits.bronze;
  }

  // Get next tier info
  static getNextTierInfo(currentPoints: number, mode: string): { 
    nextTier: UserTier; 
    pointsNeeded: number; 
    progressPercent: number 
  } {
    const currentTier = this.calculateTier(currentPoints, mode);
    const thresholds = GAMIFICATION_CONFIG.tierThresholds;
    
    const tierOrder: UserTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'vc-elite', 'research-fellow'];
    const currentIndex = tierOrder.indexOf(currentTier);
    
    if (currentIndex === tierOrder.length - 1) {
      // Already at highest tier
      return {
        nextTier: currentTier,
        pointsNeeded: 0,
        progressPercent: 100
      };
    }
    
    const nextTier = tierOrder[currentIndex + 1];
    const nextThreshold = thresholds[nextTier];
    const currentThreshold = thresholds[currentTier];
    
    const pointsNeeded = nextThreshold - currentPoints;
    const totalRange = nextThreshold - currentThreshold;
    const progressInRange = currentPoints - currentThreshold;
    const progressPercent = Math.min(100, (progressInRange / totalRange) * 100);
    
    return {
      nextTier,
      pointsNeeded,
      progressPercent: Math.round(progressPercent * 100) / 100
    };
  }

  // Calculate total points from achievements
  static calculateAchievementPoints(user: UserGamificationProfile): number {
    return user.achievements
      .filter(a => a.completed)
      .reduce((total, achievement) => total + (achievement.pointsReward || 0), 0);
  }

  // Calculate total points from badges
  static calculateBadgePoints(user: UserGamificationProfile): number {
    return user.badges
      .reduce((total, badge) => total + (badge.pointsReward || 0), 0);
  }

  // Get user's gamification summary
  static getUserGamificationSummary(user: UserGamificationProfile): {
    totalPoints: number;
    tier: UserTier;
    level: number;
    levelProgress: { current: number; total: number; percent: number };
    nextTierInfo: { nextTier: UserTier; pointsNeeded: number; progressPercent: number };
    achievementsCompleted: number;
    badgesEarned: number;
    streak: number;
    pointsFromSubmissions: number;
    pointsFromBadges: number;
    pointsFromAchievements: number;
  } {
    const tier = this.calculateTier(user.totalPoints, user.mode);
    const level = this.calculateLevel(user.totalPoints);
    const levelProgress = this.calculateLevelProgress(user.totalPoints);
    const nextTierInfo = this.getNextTierInfo(user.totalPoints, user.mode);
    const pointsFromBadges = this.calculateBadgePoints(user);
    const pointsFromAchievements = this.calculateAchievementPoints(user);
    const pointsFromSubmissions = user.totalPoints - pointsFromBadges - pointsFromAchievements;
    
    return {
      totalPoints: user.totalPoints,
      tier,
      level,
      levelProgress,
      nextTierInfo,
      achievementsCompleted: user.achievements.filter(a => a.completed).length,
      badgesEarned: user.badges.length,
      streak: user.streak.currentStreak,
      pointsFromSubmissions,
      pointsFromBadges,
      pointsFromAchievements
    };
  }

  // ===== NEW METHODS FOR GAMIFICATION INTEGRATION =====

  // Process submission and calculate gamification rewards
  static processSubmissionRewards(
    userProfile: UserGamificationProfile,
    submissionType: 'quick' | 'standard' | 'full'
  ): SubmissionGamificationResult {
    // Calculate base points based on submission type
    const basePoints = this.getBasePointsForSubmission(userProfile.mode, submissionType);
    
    // Calculate points with bonuses
    const pointsWithBonuses = this.calculatePointsWithBonuses(
      basePoints,
      userProfile.mode,
      userProfile.streak.streakBonus
    );
    
    // Update streak
    const updatedStreak = this.updateStreak(userProfile.streak);
    const streakUpdated = updatedStreak.currentStreak !== userProfile.streak.currentStreak;
    
    // Calculate new total points
    const newTotalPoints = userProfile.totalPoints + pointsWithBonuses;
    
    // Create temporary profile for badge/achievement checks
    const tempProfile = {
      ...userProfile,
      totalPoints: newTotalPoints,
      streak: updatedStreak
    };
    
    // Check for new badges
    const newBadges = this.checkBadges(tempProfile);
    
    // Check for achievements progress
    const updatedAchievements = this.checkAchievements(tempProfile);
    
    // Check for level up
    const oldLevel = this.calculateLevel(userProfile.totalPoints);
    const newLevel = this.calculateLevel(newTotalPoints);
    const levelUp = newLevel > oldLevel;
    
    // Check for tier change
    const oldTier = this.calculateTier(userProfile.totalPoints, userProfile.mode);
    const newTier = this.calculateTier(newTotalPoints, userProfile.mode);
    const tierChanged = newTier !== oldTier;
    
    return {
      pointsAwarded: pointsWithBonuses,
      badgesEarned: newBadges,
      achievementsProgress: updatedAchievements.filter(a => a.progress > 0 && !a.completed),
      streakUpdated,
      newLevel,
      levelUp,
      tierChanged,
      newTier
    };
  }

  // Get base points for different submission types
  static getBasePointsForSubmission(
    mode: UserMode,
    tier: 'quick' | 'standard' | 'full'
  ): number {
    const modeMultipliers = {
      'ea-vc': { quick: 50, standard: 100, full: 200 },
      'researcher': { quick: 30, standard: 60, full: 120 },
      'individual': { quick: 10, standard: 20, full: 40 }
    };
    
    return modeMultipliers[mode]?.[tier] || 10;
  }

  // Create updated user profile after processing submission rewards
  static createUpdatedProfile(
    currentProfile: UserGamificationProfile,
    result: SubmissionGamificationResult
  ): UserGamificationProfile {
    const newTotalPoints = currentProfile.totalPoints + result.pointsAwarded;
    
    // Merge achievements - keep existing progress, update with new progress
    const mergedAchievements = currentProfile.achievements.map(existing => {
      const updated = result.achievementsProgress.find(a => a.id === existing.id);
      return updated || existing;
    });
    
    // Add any new achievements not already in the profile
    const newAchievementIds = new Set(currentProfile.achievements.map(a => a.id));
    result.achievementsProgress.forEach(achievement => {
      if (!newAchievementIds.has(achievement.id)) {
        mergedAchievements.push(achievement);
      }
    });
    
    return {
      ...currentProfile,
      totalPoints: newTotalPoints,
      availablePoints: currentProfile.availablePoints + result.pointsAwarded,
      lifetimePoints: currentProfile.lifetimePoints + result.pointsAwarded,
      currentLevel: result.newLevel || currentProfile.currentLevel,
      currentTier: result.newTier || currentProfile.currentTier,
      badges: [...currentProfile.badges, ...result.badgesEarned],
      achievements: mergedAchievements,
      streak: result.streakUpdated ? {
        ...currentProfile.streak,
        currentStreak: currentProfile.streak.currentStreak + 1,
        lastActivity: new Date().toISOString(),
        streakBonus: result.streakUpdated ? 
          this.updateStreak(currentProfile.streak).streakBonus : 
          currentProfile.streak.streakBonus
      } : currentProfile.streak
    };
  }

  // Process reward redemption (deduct points)
  static processRedemption(
    currentProfile: UserGamificationProfile,
    pointsCost: number
  ): UserGamificationProfile {
    if (currentProfile.availablePoints < pointsCost) {
      throw new Error('Insufficient points');
    }
    
    return {
      ...currentProfile,
      availablePoints: currentProfile.availablePoints - pointsCost
    };
  }

  // Calculate submission quality bonus (for later enhancement)
  static calculateQualityBonus(
    submissionData: any,
    evidenceStrength: 'weak' | 'medium' | 'strong' = 'medium'
  ): number {
    const evidenceMultipliers = {
      'weak': 0.8,
      'medium': 1.0,
      'strong': 1.5
    };
    
    let qualityBonus = 1.0;
    
    // Check for supporting evidence
    if (submissionData.evidence?.length > 0) {
      qualityBonus *= 1.2;
    }
    
    // Check for detailed context
    if (submissionData.context?.length > 200) {
      qualityBonus *= 1.1;
    }
    
    // Check for risk score
    if (submissionData.riskScore && submissionData.riskScore >= 7) {
      qualityBonus *= 1.3;
    }
    
    // Apply evidence strength multiplier
    qualityBonus *= evidenceMultipliers[evidenceStrength];
    
    return Math.min(qualityBonus, 2.0); // Cap at 2x
  }

  // Calculate activity streak multiplier
  static calculateStreakMultiplier(streakDays: number): number {
    if (streakDays >= 30) return 2.0;
    if (streakDays >= 20) return 1.5;
    if (streakDays >= 10) return 1.2;
    if (streakDays >= 5) return 1.1;
    if (streakDays >= 2) return 1.05;
    return 1.0;
  }

  // Validate if user can redeem a reward
  static canRedeemReward(
    userProfile: UserGamificationProfile,
    rewardPoints: number,
    tierRequirement?: UserTier,
    modeRequirement?: UserMode
  ): { canRedeem: boolean; reason?: string } {
    // Check points
    if (userProfile.availablePoints < rewardPoints) {
      return {
        canRedeem: false,
        reason: 'Insufficient points'
      };
    }
    
    // Check tier requirement
    if (tierRequirement) {
      const tierOrder: UserTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'vc-elite', 'research-fellow'];
      const userTierIndex = tierOrder.indexOf(userProfile.currentTier);
      const requiredTierIndex = tierOrder.indexOf(tierRequirement);
      
      if (userTierIndex < requiredTierIndex) {
        return {
          canRedeem: false,
          reason: `Requires ${tierRequirement} tier or higher`
        };
      }
    }
    
    // Check mode requirement
    if (modeRequirement && userProfile.mode !== modeRequirement) {
      return {
        canRedeem: false,
        reason: `Only available for ${modeRequirement} users`
      };
    }
    
    return { canRedeem: true };
  }

  // Get recommended next achievement/badge to work on
  static getNextRecommendedGoal(userProfile: UserGamificationProfile): {
    type: 'badge' | 'achievement';
    id: string;
    name: string;
    description: string;
    progress: number;
    target: number;
  } | null {
    // Check for nearest achievement
    const incompleteAchievements = userProfile.achievements
      .filter(a => !a.completed)
      .sort((a, b) => b.progress - a.progress); // Sort by progress
    
    if (incompleteAchievements.length > 0) {
      const nearestAchievement = incompleteAchievements[0];
      return {
        type: 'achievement',
        id: nearestAchievement.id,
        name: nearestAchievement.name,
        description: nearestAchievement.description,
        progress: nearestAchievement.progress * nearestAchievement.target,
        target: nearestAchievement.target
      };
    }
    
    // Check for next badge that can be earned
    const unearnedBadges = GAMIFICATION_CONFIG.badges
      .filter(badgeDef => !userProfile.badges.some(b => b.id === badgeDef.id))
      .filter(badgeDef => badgeDef.criteria(userProfile))
      .sort((a, b) => a.pointsReward - b.pointsReward); // Sort by difficulty
    
    if (unearnedBadges.length > 0) {
      const nextBadge = unearnedBadges[0];
      return {
        type: 'badge',
        id: nextBadge.id,
        name: nextBadge.name,
        description: nextBadge.description,
        progress: 0,
        target: 1
      };
    }
    
    return null;
  }

  // Calculate XP needed for next level
  static getXPForNextLevel(currentLevel: number): number {
    return currentLevel * GAMIFICATION_CONFIG.levelMultiplier;
  }

  // Calculate XP earned in current level
  static getXPInCurrentLevel(currentPoints: number): number {
    const level = this.calculateLevel(currentPoints);
    const xpForCurrentLevel = (level - 1) * GAMIFICATION_CONFIG.levelMultiplier;
    return currentPoints - xpForCurrentLevel;
  }

  // Get daily bonus status
  static getDailyBonusStatus(userProfile: UserGamificationProfile): {
    hasClaimed: boolean;
    bonusPoints: number;
    streakMultiplier: number;
  } {
    const lastActivity = new Date(userProfile.streak.lastActivity);
    const today = new Date();
    const hasSubmittedToday = lastActivity.toDateString() === today.toDateString();
    
    const baseBonus = 50;
    const streakMultiplier = this.calculateStreakMultiplier(userProfile.streak.currentStreak);
    
    return {
      hasClaimed: hasSubmittedToday,
      bonusPoints: Math.floor(baseBonus * streakMultiplier),
      streakMultiplier
    };
  }
}
