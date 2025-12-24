import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  UserGamificationProfile, 
  UserTier, 
  UserMode, 
  Badge, 
  Achievement, 
  StreakData,
  Milestone
} from '@/types/dataDonation';
import { GamificationService } from '@/services/gamification';
import { GamificationIntegrationService } from '@/services/gamification-integration';

interface GamificationContextType {
  userProfile: UserGamificationProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserGamificationProfile>) => void;
  processSubmission: (submissionData: any) => Promise<void>;
  redeemReward: (rewardId: string) => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

interface GamificationProviderProps {
  children: ReactNode;
  initialUserId?: string;
  initialMode?: UserMode;
}

export const GamificationProvider: React.FC<GamificationProviderProps> = ({
  children,
  initialUserId = 'user-123',
  initialMode = 'individual'
}) => {
  const [userProfile, setUserProfile] = useState<UserGamificationProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to ensure currentTier is typed correctly
  const ensureUserTierType = (tier: string): UserTier => {
    const validTiers: UserTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'vc-elite', 'research-fellow'];
    return validTiers.includes(tier as UserTier) ? tier as UserTier : 'bronze';
  };

  // Initialize or load user profile
  useEffect(() => {
    const loadInitialProfile = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have saved data in localStorage
        const savedProfile = localStorage.getItem('gamificationProfile');
        
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          
          // FIX: Ensure currentTier is properly typed
          const typedProfile: UserGamificationProfile = {
            ...parsedProfile,
            currentTier: ensureUserTierType(parsedProfile.currentTier),
            streak: parsedProfile.streak || {
              currentStreak: 0,
              longestStreak: 0,
              lastActivity: new Date().toISOString(),
              streakBonus: 1.0
            },
            mode: parsedProfile.mode || initialMode,
            badges: parsedProfile.badges || [],
            achievements: parsedProfile.achievements || []
          };
          
          setUserProfile(typedProfile);
        } else {
          // Create initial profile
          const initialProfile: UserGamificationProfile = {
            userId: initialUserId,
            mode: initialMode,
            totalPoints: 0,
            availablePoints: 0,
            lifetimePoints: 0,
            currentLevel: 1,
            currentTier: 'bronze' as UserTier, // FIX: Type assertion
            badges: [],
            achievements: [],
            streak: {
              currentStreak: 0,
              longestStreak: 0,
              lastActivity: new Date().toISOString(),
              streakBonus: 1.0
            },
            leaderboardPosition: undefined,
            nextMilestone: undefined,
            displayName: undefined,
            pointsMultiplier: 1.0
          };
          
          setUserProfile(initialProfile);
          localStorage.setItem('gamificationProfile', JSON.stringify(initialProfile));
        }
      } catch (err) {
        setError('Failed to load gamification profile');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialProfile();
  }, [initialUserId, initialMode]);

  // Update profile
  const updateProfile = (updates: Partial<UserGamificationProfile>) => {
    setUserProfile(prev => {
      if (!prev) return null;
      
      // FIX: Ensure currentTier is typed correctly if it's being updated
      const typedUpdates: Partial<UserGamificationProfile> = { ...updates };
      
      if (updates.currentTier && typeof updates.currentTier === 'string') {
        typedUpdates.currentTier = ensureUserTierType(updates.currentTier);
      }
      
      const updatedProfile: UserGamificationProfile = {
        ...prev,
        ...typedUpdates
      };
      
      // Save to localStorage
      localStorage.setItem('gamificationProfile', JSON.stringify(updatedProfile));
      
      return updatedProfile;
    });
  };

  // Process submission
  const processSubmission = async (submissionData: any) => {
    if (!userProfile) return;
    
    try {
      setIsLoading(true);
      
      // Use the integration service if you need external integration
      // Otherwise use the basic gamification service
      const result = await GamificationIntegrationService.processSubmissionWithIntegration(
        userProfile,
        submissionData,
        {
          enabled: false, // Set to true if you want external integration
          target: 'slack'
        }
      );
      
      // FIX: Ensure currentTier is typed correctly
      const typedProfile: UserGamificationProfile = {
        ...result.updatedProfile,
        currentTier: ensureUserTierType(result.updatedProfile.currentTier)
      };
      
      setUserProfile(typedProfile);
      localStorage.setItem('gamificationProfile', JSON.stringify(typedProfile));
      
    } catch (err) {
      setError('Failed to process submission');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Redeem reward
  const redeemReward = async (rewardId: string) => {
    if (!userProfile) return;
    
    try {
      setIsLoading(true);
      // Add your redemption logic here
      // For now, just update available points
      updateProfile({
        availablePoints: Math.max(0, userProfile.availablePoints - 100) // Example deduction
      });
    } catch (err) {
      setError('Failed to redeem reward');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GamificationContext.Provider
      value={{
        userProfile,
        isLoading,
        error,
        updateProfile,
        processSubmission,
        redeemReward
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = (): GamificationContextType => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};