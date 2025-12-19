// src/contexts/GamificationContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserGamificationProfile } from '@/types/datadonation';
import { GamificationIntegrationService } from '@/services/gamification-integration';
import { RedemptionService } from '@/services/redemption-service';

interface GamificationContextType {
  userProfile: UserGamificationProfile | null;
  updateProfile: (profile: UserGamificationProfile) => void;
  processSubmission: (basePoints: number, submissionType: string) => Promise<void>;
  redeemReward: (rewardId: string, pointsCost: number) => Promise<boolean>;
  isLoading: boolean;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const DEFAULT_USER_PROFILE: UserGamificationProfile = {
  userId: 'user-123',
  mode: 'individual',
  totalPoints: 1250,
  availablePoints: 1250,
  lifetimePoints: 1500,
  currentLevel: 13,
  currentTier: 'silver',
  badges: [],
  achievements: [],
  streak: {
    currentStreak: 5,
    longestStreak: 10,
    lastActivity: new Date().toISOString(),
    streakBonus: 1.05
  },
  leaderboardPosition: 42
};

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserGamificationProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In real app, load from API/localStorage
    const loadUserProfile = async () => {
      setIsLoading(true);
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setUserProfile(DEFAULT_USER_PROFILE);
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const updateProfile = (profile: UserGamificationProfile) => {
    setUserProfile(profile);
    // In real app, save to backend
  };

  const processSubmission = async (basePoints: number, submissionType: string) => {
    if (!userProfile) return;
    
    setIsLoading(true);
    try {
      const result = await GamificationIntegrationService.processSubmission(
        userProfile,
        basePoints,
        submissionType
      );
      
      setUserProfile(result.updatedProfile);
    } catch (error) {
      console.error('Failed to process submission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const redeemReward = async (rewardId: string, pointsCost: number): Promise<boolean> => {
    if (!userProfile) return false;
    
    setIsLoading(true);
    try {
      // Get reward details
      const rewards = await RedemptionService.getRewards();
      const reward = rewards.find(r => r.id === rewardId);
      
      if (!reward) {
        throw new Error('Reward not found');
      }
      
      // Request redemption
      await RedemptionService.requestRedemption(
        userProfile.userId,
        rewardId,
        pointsCost
      );
      
      // Update user profile (deduct points)
      const updatedProfile = await GamificationIntegrationService.processRedemption(
        userProfile,
        pointsCost,
        reward.name
      );
      
      setUserProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error('Redemption failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GamificationContext.Provider
      value={{
        userProfile,
        updateProfile,
        processSubmission,
        redeemReward,
        isLoading
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}