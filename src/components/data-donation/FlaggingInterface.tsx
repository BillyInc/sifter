// src/components/data-donation/FlaggingInterface.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SubmissionForm } from './universal';
import StandardFlagForm from './universal/StandardFlagForm';
import VCQuickFlag from './quick-flag/VCQuickFlag';
import IndividualQuickFlag from './quick-flag/IndividualQuickFlag';
import ResearcherQuickFlag from './quick-flag/ResearcherQuickFlag';
import ModeEvidenceRequirements from './ModeEvidenceRequirements';
import VCSubmissionEnhancements from './modes/VCSubmissionEnhancements';
import ResearcherSubmissionEnhancements from './modes/ResearcherSubmissionEnhancements';
import IndividualSubmissionEnhancements from './modes/IndividualSubmissionEnhancements';
import { 
  UserMode, 
  FlagSubmissionData, 
  QuickFlagData, 
  MODE_CONFIGS, 
  SubmissionGamificationResult, 
  UserGamificationProfile,
  EvidenceType,
  EvidenceStatus
} from '@/types/dataDonation';
import { GamificationService } from '@/services/gamification';

// Create a compatible SubmissionFormData type
type CompatibleSubmissionFormData = {
  entityType: string;
  entityDetails: {
    fullName: string;
    twitterHandle?: string;
    telegramHandle?: string;
    linkedinProfile?: string;
    website?: string;
  };
  affectedProjects: Array<{
    projectName: string;
    incidentDescription: string;
    date: string;
  }>;
  evidence: Array<{
    id?: string;
    url: string;
    description: string;
    type?: EvidenceType;
    status?: EvidenceStatus;
  }>;
  submitterInfo: {
    email: string;
    name?: string;
    anonymous: boolean;
    acknowledgements: boolean[];
  };
  mode?: UserMode;
};

type FlaggingTier = 'quick' | 'standard' | 'full';

interface FlaggingInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  entityData: {
    entityName: string;
    context: string;
    projectName?: string;
    riskScore?: number;
  };
  userData: {
    mode: UserMode;
    userName?: string;
    userEmail?: string;
    vcPortfolioData?: any[];
    currentPoints?: number;
  };
  userProfile: UserGamificationProfile;
  onSubmit: (data: FlagSubmissionData) => Promise<void>;
}

export default function FlaggingInterface({
  isOpen,
  onClose,
  entityData,
  userData,
  userProfile,
  onSubmit
}: FlaggingInterfaceProps) {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<FlaggingTier>('quick');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evidenceCount, setEvidenceCount] = useState(0);
  
  // Gamification states
  const [gamificationResult, setGamificationResult] = useState<SubmissionGamificationResult | null>(null);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  
  // State for mode-specific data
  const [vcConfidential, setVcConfidential] = useState(true);
  const [vcPortfolioContext, setVcPortfolioContext] = useState<string[]>([]);
  const [researcherMethodology, setResearcherMethodology] = useState('');
  const [researcherPatternAnalysis, setResearcherPatternAnalysis] = useState('');
  const [individualTemplate, setIndividualTemplate] = useState('');
  const [individualExperience, setIndividualExperience] = useState('');

  // Calculate points based on tier and mode using mode config
  const calculatePoints = (tier: FlaggingTier, mode: UserMode): number => {
    const config = MODE_CONFIGS[mode];
    const basePoints = config.basePoints[tier];
    return basePoints * config.pointMultiplier;
  };

  // Calculate gamification rewards
  const calculateGamificationRewards = (
    basePoints: number,
    userProfile: UserGamificationProfile
  ): SubmissionGamificationResult => {
    const pointsWithBonuses = GamificationService.calculatePointsWithBonuses(
      basePoints,
      userProfile.mode,
      userProfile.streak.streakBonus
    );
    
    // Update streak
    const updatedStreak = GamificationService.updateStreak(userProfile.streak);
    const streakUpdated = updatedStreak.currentStreak !== userProfile.streak.currentStreak;
    
    // Calculate new total points
    const newTotalPoints = userProfile.totalPoints + pointsWithBonuses;
    
    // Check for new badges
    const tempProfile = {
      ...userProfile,
      totalPoints: newTotalPoints,
      streak: updatedStreak
    };
    const newBadges = GamificationService.checkBadges(tempProfile);
    
    // Check for achievements progress
    const updatedAchievements = GamificationService.checkAchievements(tempProfile);
    
    // Check for level up
    const oldLevel = GamificationService.calculateLevel(userProfile.totalPoints);
    const newLevel = GamificationService.calculateLevel(newTotalPoints);
    const levelUp = newLevel > oldLevel;
    
    // Check for tier change
    const oldTier = GamificationService.calculateTier(userProfile.totalPoints, userProfile.mode);
    const newTier = GamificationService.calculateTier(newTotalPoints, userProfile.mode);
    const tierChanged = newTier !== oldTier;
    
    return {
      pointsAwarded: pointsWithBonuses,
      badgesEarned: newBadges,
      achievementsProgress: updatedAchievements.filter(a => a.progress > 0),
      streakUpdated,
      newLevel,
      levelUp,
      tierChanged,
      newTier
    };
  };

  // Get default tier based on user mode
  const getDefaultTier = (mode: UserMode): FlaggingTier => {
    switch (mode) {
      case 'ea-vc': 
        return 'quick'; // VCs often need quick portfolio flags
      case 'researcher': 
        return 'standard'; // Researchers typically do detailed analysis
      case 'individual': 
        return 'quick'; // Individuals start with simple flags
      default: 
        return 'quick';
    }
  };

  // Get mode-specific icon and color
  const getModeConfig = (mode: UserMode) => {
    switch (mode) {
      case 'ea-vc':
        return { icon: '🏢', color: 'blue', name: 'VC Mode' };
      case 'researcher':
        return { icon: '🔬', color: 'purple', name: 'Researcher Mode' };
      case 'individual':
        return { icon: '👤', color: 'green', name: 'Individual Mode' };
    }
  };

  // Set initial tier based on user mode
  useEffect(() => {
    setSelectedTier(getDefaultTier(userData.mode));
  }, [userData.mode]);

  // Tier options with dynamic points calculation
  const tierOptions = [
    {
      id: 'quick' as const,
      title: '🚩 Quick Flag',
      description: 'Mark for investigation',
      time: '30 seconds',
      evidence: 'Optional',
      icon: '⚡',
      bestFor: userData.mode === 'ea-vc' ? 'Portfolio reviews' : 
               userData.mode === 'researcher' ? 'Initial analysis' : 
               'Quick reporting'
    },
    {
      id: 'standard' as const,
      title: '📝 Standard Report',
      description: 'Basic evidence submission',
      time: '2-5 minutes',
      evidence: '1-2 links required',
      icon: '📋',
      bestFor: 'Most cases'
    },
    {
      id: 'full' as const,
      title: '📊 Full Data Donation',
      description: 'Complete case with all evidence',
      time: '5-10 minutes',
      evidence: '3+ links required',
      icon: '🏆',
      bestFor: 'High-impact submissions'
    }
  ].map(tier => ({
    ...tier,
    points: calculatePoints(tier.id, userData.mode)
  }));

  const handleQuickSubmit = async (data: QuickFlagData) => {
    setIsSubmitting(true);
    try {
      // Calculate base points
      const basePoints = MODE_CONFIGS[userData.mode].basePoints.quick;
      
      // Calculate gamification rewards
      const gamificationRewards = calculateGamificationRewards(basePoints, userProfile);
      
      // Build submission data
      const flagData: FlagSubmissionData = {
        tier: 'quick',
        mode: userData.mode,
        entityName: entityData.entityName,
        context: entityData.context,
        projectName: entityData.projectName,
        riskScore: entityData.riskScore,
        quickData: {
          entityName: entityData.entityName,
          context: entityData.context,
          mode: userData.mode,
          reason: data.reason,
          severity: data.severity,
          portfolioContext: data.portfolioContext || '',
          methodologyNotes: data.methodologyNotes || '',
          points: data.points,
          // Add mode-specific data
          ...(userData.mode === 'ea-vc' && {
            confidential: vcConfidential,
            portfolioItems: vcPortfolioContext
          }),
          ...(userData.mode === 'researcher' && {
            methodology: researcherMethodology
          }),
          ...(userData.mode === 'individual' && {
            template: individualTemplate
          })
        },
        pointsAwarded: gamificationRewards.pointsAwarded,
        badgesEarned: gamificationRewards.badgesEarned,
        achievementsProgress: gamificationRewards.achievementsProgress,
        streakUpdated: gamificationRewards.streakUpdated,
        timestamp: new Date().toISOString(),
        submissionId: `FLAG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Show rewards modal
      setGamificationResult(gamificationRewards);
      setShowRewardsModal(true);
      
      // Submit to backend
      await onSubmit(flagData);
      
    } catch (error) {
      console.error('Flag submission failed:', error);
      setIsSubmitting(false);
    }
  };

  interface StandardFormData {
    evidence: Array<{
      url: string;
      description: string;
      type?: EvidenceType;
      id?: string;
    }>;
    detailedExplanation?: string;
    selectedSeverity?: 'low' | 'medium' | 'high' | 'critical';
  }

  const handleStandardSubmit = async (data: StandardFormData[]) => {
    setIsSubmitting(true);
    try {
      const formData = data[0];
      // Calculate base points
      const basePoints = MODE_CONFIGS[userData.mode].basePoints.standard;
      
      // Calculate gamification rewards
      const gamificationRewards = calculateGamificationRewards(basePoints, userProfile);
      
      const flagData: FlagSubmissionData = {
        tier: 'standard',
        mode: userData.mode,
        entityName: entityData.entityName,
        context: entityData.context,
        projectName: entityData.projectName,
        riskScore: entityData.riskScore,
        standardData: {
          evidence: formData.evidence?.map(e => e.url) || [],
          description: formData.detailedExplanation || '',
          severity: formData.selectedSeverity || 'medium'
        },
        points: calculatePoints('standard', userData.mode),
        pointsAwarded: gamificationRewards.pointsAwarded,
        badgesEarned: gamificationRewards.badgesEarned,
        achievementsProgress: gamificationRewards.achievementsProgress,
        streakUpdated: gamificationRewards.streakUpdated,
        timestamp: new Date().toISOString(),
        submissionId: `REPORT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Show rewards modal
      setGamificationResult(gamificationRewards);
      setShowRewardsModal(true);
      
      // Submit to backend
      await onSubmit(flagData);
      
    } catch (error) {
      console.error('Standard report submission failed:', error);
      setIsSubmitting(false);
    }
  };

  const handleFullSubmit = async (data: CompatibleSubmissionFormData) => {
    setIsSubmitting(true);
    try {
      // Calculate base points
      const basePoints = MODE_CONFIGS[userData.mode].basePoints.full;
      
      // Calculate gamification rewards
      const gamificationRewards = calculateGamificationRewards(basePoints, userProfile);
      
      // Convert to array format evidence for consistency
      //const evidenceArray = data.evidence.map(e => `${e.url}|${e.description}|${e.type || 'other'}`);
      
      const flagData: FlagSubmissionData = {
        tier: 'full',
        mode: userData.mode,
        entityName: entityData.entityName,
        context: entityData.context,
        projectName: entityData.projectName,
        riskScore: entityData.riskScore,
        fullData: {
          entityType: data.entityType as any,
          entityDetails: data.entityDetails,
          affectedProjects: data.affectedProjects,
          evidence: data.evidence,
          submitterInfo: data.submitterInfo,
          mode: userData.mode
        },
        points: calculatePoints('full', userData.mode),
        pointsAwarded: gamificationRewards.pointsAwarded,
        badgesEarned: gamificationRewards.badgesEarned,
        achievementsProgress: gamificationRewards.achievementsProgress,
        streakUpdated: gamificationRewards.streakUpdated,
        timestamp: new Date().toISOString(),
        submissionId: `DONATION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Show rewards modal
      setGamificationResult(gamificationRewards);
      setShowRewardsModal(true);
      
      // Submit to backend
      await onSubmit(flagData);
      
    } catch (error) {
      console.error('Full donation submission failed:', error);
      setIsSubmitting(false);
    }
  };

  // Rewards Modal Component
  const RewardsModal = () => {
    if (!gamificationResult || !showRewardsModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className="bg-sifter-card border border-sifter-border rounded-2xl max-w-lg w-full p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🎉</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Submission Successful!</h3>
            <p className="text-gray-400">You've earned rewards for your contribution</p>
          </div>
          
          {/* Points Awarded */}
          <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-400">Points Awarded</div>
                <div className="text-3xl font-bold text-amber-400">+{gamificationResult.pointsAwarded}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Total Points</div>
                <div className="text-2xl font-bold text-white">
                  {(userProfile.totalPoints + gamificationResult.pointsAwarded).toLocaleString()}
                </div>
              </div>
            </div>
            
            {/* Streak Bonus */}
            {userProfile.streak.streakBonus > 1 && (
              <div className="mt-3 text-sm text-green-400">
                🔥 {userProfile.streak.currentStreak + 1}-day streak bonus: {userProfile.streak.streakBonus.toFixed(1)}x
              </div>
            )}
          </div>
          
          {/* Badges Earned */}
          {gamificationResult.badgesEarned.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-white mb-3">New Badges Unlocked!</h4>
              <div className="grid grid-cols-2 gap-3">
                {gamificationResult.badgesEarned.map((badge) => (
                  <div key={badge.id} className="border border-sifter-border rounded-lg p-3 text-center">
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <div className="font-medium text-white text-sm mb-1">{badge.name}</div>
                    <div className="text-xs text-gray-400">{badge.description}</div>
                    <div className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                      badge.rarity === 'legendary' ? 'bg-purple-500/20 text-purple-400' :
                      badge.rarity === 'epic' ? 'bg-red-500/20 text-red-400' :
                      badge.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                      badge.rarity === 'uncommon' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {badge.rarity.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Level Up */}
          {gamificationResult.levelUp && gamificationResult.newLevel && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">⭐</span>
                <div>
                  <div className="font-bold text-white">Level Up!</div>
                  <div className="text-sm text-blue-300">Reached Level {gamificationResult.newLevel}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Tier Change */}
          {gamificationResult.tierChanged && gamificationResult.newTier && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💎</span>
                <div>
                  <div className="font-bold text-white">Tier Promotion!</div>
                  <div className="text-sm text-purple-300">
                    Advanced to {gamificationResult.newTier.replace('-', ' ')} Tier
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-300 mt-2">
                New benefits unlocked! Check your gamification dashboard.
              </div>
            </div>
          )}
          
          {/* Achievements Progress */}
          {gamificationResult.achievementsProgress.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-white mb-3">Achievements Progress</h4>
              <div className="space-y-2">
                {gamificationResult.achievementsProgress.map((achievement) => (
                  <div key={achievement.id} className="flex justify-between items-center p-2 border border-sifter-border rounded-lg">
                    <div>
                      <div className="text-sm text-white">{achievement.name}</div>
                      <div className="text-xs text-gray-400">
                        {Math.round(achievement.progress * achievement.target)}/{achievement.target}
                      </div>
                    </div>
                    <div className="text-amber-400 font-medium">
                      {achievement.completed ? 'Completed!' : `${Math.round(achievement.progress * 100)}%`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowRewardsModal(false);
                setGamificationResult(null);
                onClose();
              }}
              className="flex-1 px-4 py-3 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Continue
            </button>
            <button
              onClick={() => {
                // Navigate to gamification dashboard
                router.push('/dashboard/gamification');
                setShowRewardsModal(false);
                setGamificationResult(null);
                onClose();
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                       text-white rounded-lg font-medium transition-all"
            >
              View Full Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  const modeConfig = getModeConfig(userData.mode);
  const currentPoints = calculatePoints(selectedTier, userData.mode);

  return (
    <>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-sifter-card border border-sifter-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-sifter-card/95 backdrop-blur-sm border-b border-sifter-border p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white">Flag Entity</h2>
                  <p className="text-sm text-gray-400">
                    Entity: <span className="text-red-400 font-medium">{entityData.entityName}</span>
                    {entityData.projectName && ` • Project: ${entityData.projectName}`}
                    {entityData.riskScore && ` • Risk: ${entityData.riskScore}/100`}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      modeConfig.color === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      modeConfig.color === 'purple' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                      'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {modeConfig.icon} {modeConfig.name}
                    </span>
                    <span className="px-3 py-1 rounded-lg text-sm font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      🎯 {currentPoints} points
                    </span>
                    {userProfile.totalPoints > 0 && (
                      <span className="text-sm text-gray-400">
                        (You have {userProfile.totalPoints.toLocaleString()} total points)
                      </span>
                    )}
                    {userProfile.streak.currentStreak > 0 && (
                      <span className="text-sm text-green-400 flex items-center gap-1">
                        🔥 {userProfile.streak.currentStreak}-day streak
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-white text-2xl disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Tier Selection */}
            <div className="p-6 border-b border-sifter-border">
              <h3 className="text-lg font-semibold text-white mb-4">Select Report Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tierOptions.map((tier) => {
                  const isSelected = selectedTier === tier.id;
                  const colorClass = isSelected ? 
                    (modeConfig.color === 'blue' ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/20' :
                     modeConfig.color === 'purple' ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-purple-600/20' :
                     'border-green-500 bg-gradient-to-br from-green-500/20 to-green-600/20') :
                    'border-sifter-border hover:border-blue-500/50 hover:bg-sifter-dark/30';
                  
                  return (
                    <div
                      key={tier.id}
                      onClick={() => !isSubmitting && setSelectedTier(tier.id)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${colorClass} ${
                        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl">{tier.icon}</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-white">{tier.title}</h4>
                              <div className="text-xs text-gray-400 mt-1">{tier.time}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-amber-400">{tier.points}</div>
                              <div className="text-xs text-gray-400">points</div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mt-2">{tier.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs mt-3">
                        <span className="text-gray-500">📎 {tier.evidence}</span>
                        {tier.bestFor && (
                          <span className={`px-2 py-1 rounded ${
                            modeConfig.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                            modeConfig.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {tier.bestFor}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Points Summary */}
              <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-400">Base Points</div>
                    <div className="text-white font-medium">
                      {MODE_CONFIGS[userData.mode].basePoints[selectedTier]}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Mode Multiplier</div>
                    <div className={`font-bold ${
                      modeConfig.color === 'blue' ? 'text-blue-400' :
                      modeConfig.color === 'purple' ? 'text-purple-400' :
                      'text-green-400'
                    }`}>
                      {MODE_CONFIGS[userData.mode].pointMultiplier}x
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Total Points</div>
                    <div className="text-amber-400 font-bold text-lg">{currentPoints}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-3 text-center">
                  {userData.mode === 'ea-vc' ? 'VC submissions earn 5x points due to quality evidence' :
                   userData.mode === 'researcher' ? 'Researcher submissions earn 3x points for analytical work' :
                   'Individual submissions earn 1x points for community contributions'}
                </div>
                {userProfile.streak.streakBonus > 1 && (
                  <div className="text-xs text-green-400 mt-2 text-center">
                    🔥 Active streak bonus: {userProfile.streak.streakBonus.toFixed(1)}x points
                  </div>
                )}
              </div>
            </div>

            {/* Selected Tier Form */}
            <div className="p-6">
              {isSubmitting ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                  <h3 className="text-lg font-semibold text-white mb-2">Submitting Your Flag...</h3>
                  <p className="text-gray-400">Please wait while we process your submission</p>
                  <p className="text-sm text-amber-400 mt-2">Calculating your rewards...</p>
                </div>
              ) : (
                <>
                  {/* Evidence Requirements Display */}
                  <ModeEvidenceRequirements
                    mode={userData.mode}
                    currentTier={selectedTier}
                    currentEvidenceCount={evidenceCount}
                  />

                  {/* Quick Flag */}
                  {selectedTier === 'quick' && (
                    <div>
                      {userData.mode === 'ea-vc' ? (
                        <VCQuickFlag
                          entityName={entityData.entityName}
                          context={entityData.context}
                          vcPortfolioData={userData.vcPortfolioData}
                          onSubmit={handleQuickSubmit}
                          onCancel={onClose}
                          onEvidenceCountChange={setEvidenceCount}
                          onConfidentialToggle={setVcConfidential}
                          onPortfolioSelect={setVcPortfolioContext}
                        />
                      ) : userData.mode === 'researcher' ? (
                        <ResearcherQuickFlag
                          entityName={entityData.entityName}
                          context={entityData.context}
                          onSubmit={handleQuickSubmit}
                          onCancel={onClose}
                          onEvidenceCountChange={setEvidenceCount}
                          onMethodologyChange={setResearcherMethodology}
                          onPatternAnalysisChange={setResearcherPatternAnalysis}
                        />
                      ) : userData.mode === 'individual' ? (
                        <IndividualQuickFlag
                          entityName={entityData.entityName}
                          context={entityData.context}
                          onSubmit={handleQuickSubmit}
                          onCancel={onClose}
                          onEvidenceCountChange={setEvidenceCount}
                          onTemplateSelect={setIndividualTemplate}
                          onExperienceShare={setIndividualExperience}
                        />
                      ) : null}
                    </div>
                  )}

                  {/* Standard Flag */}
                  {selectedTier === 'standard' && (
                    <div>
                      <StandardFlagForm
                        entityData={[
                          entityData.entityName,
                          '', // submissionId
                          '', // caseId
                          '', // entityType
                          ''  // submitterEmail
                        ]}
                        userData={[
                          userData.userName || '',
                          userData.userEmail || '',
                          userData.mode,
                          ''
                        ]}
                        onSubmit={handleStandardSubmit}
                        onCancel={onClose}
                        onEvidenceCountChange={setEvidenceCount}
                      />
                      
                      {/* Mode-specific enhancements for standard tier */}
                      {userData.mode === 'ea-vc' && (
                        <VCSubmissionEnhancements
                          portfolioData={userData.vcPortfolioData || []}
                          onConfidentialToggle={(value: boolean) => setVcConfidential(value)}
                          onPortfolioSelect={(items: string[]) => setVcPortfolioContext(items)}
                        />
                      )}
                      
                      {userData.mode === 'researcher' && (
                        <ResearcherSubmissionEnhancements
                          onMethodologyChange={(method: string) => setResearcherMethodology(method)}
                          onPatternAnalysisChange={(analysis: string) => setResearcherPatternAnalysis(analysis)}
                        />
                      )}
                      
                      {userData.mode === 'individual' && (
                        <IndividualSubmissionEnhancements
                          onTemplateSelect={(template: string) => setIndividualTemplate(template)}
                          onExperienceShare={(experience: string) => setIndividualExperience(experience)}
                        />
                      )}
                    </div>
                  )}

                  {/* Full Data Donation */}
                  {selectedTier === 'full' && (
                    <div>
                      <SubmissionForm
                        mode={userData.mode}
                        prefillData={{
  entityType: 'marketing-agency', // Default
  entityDetails: {
    fullName: entityData.entityName,
    twitterHandle: '',
    telegramHandle: '',
    linkedinProfile: '',
    website: ''
  },
  affectedProjects: [{
    projectName: entityData.projectName || '',
    incidentDescription: entityData.context,
    date: new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' })
  }],
  evidence: [
    { 
      id: `evidence_${Date.now()}_1`, 
      url: '', 
      description: '', 
      type: 'twitter' as EvidenceType, 
      status: 'pending' as EvidenceStatus 
    },
    { 
      id: `evidence_${Date.now()}_2`, 
      url: '', 
      description: '', 
      type: 'twitter' as EvidenceType, 
      status: 'pending' as EvidenceStatus 
    }
  ],
  submitterInfo: {
    email: userData.userEmail || '',
    name: userData.userName,
    anonymous: false,
    acknowledgements: [false, false, false]
  },
  mode: userData.mode
}}
                        onSubmit={handleFullSubmit}
                        isOpen={true}
                        onClose={onClose}
                        userName={userData.userName}
                        userEmail={userData.userEmail}
                        onEvidenceCountChange={setEvidenceCount}
                      />
                      
                      {/* Mode-specific enhancements for full tier */}
                      {userData.mode === 'ea-vc' && (
                        <div className="mt-6">
                          <VCSubmissionEnhancements
                            portfolioData={userData.vcPortfolioData || []}
                            onConfidentialToggle={(value: boolean) => setVcConfidential(value)}
                            onPortfolioSelect={(items: string[]) => setVcPortfolioContext(items)}
                          />
                        </div>
                      )}
                      
                      {userData.mode === 'researcher' && (
                        <div className="mt-6">
                          <ResearcherSubmissionEnhancements
                            onMethodologyChange={(method: string) => setResearcherMethodology(method)}
                            onPatternAnalysisChange={(analysis: string) => setResearcherPatternAnalysis(analysis)}
                          />
                        </div>
                      )}
                      
                      {userData.mode === 'individual' && (
                        <div className="mt-6">
                          <IndividualSubmissionEnhancements
                            onTemplateSelect={(template: string) => setIndividualTemplate(template)}
                            onExperienceShare={(experience: string) => setIndividualExperience(experience)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-sifter-border bg-sifter-dark/50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>🏆 Points System:</span>
                    <span className="text-amber-400">Quick: {MODE_CONFIGS[userData.mode].basePoints.quick} ×</span>
                    <span className="text-amber-400">Standard: {MODE_CONFIGS[userData.mode].basePoints.standard} ×</span>
                    <span className="text-amber-400">Full: {MODE_CONFIGS[userData.mode].basePoints.full} ×</span>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {selectedTier === 'quick' && '✅ Quick flags are reviewed within 24h'}
                  {selectedTier === 'standard' && '✅ Standard reports are reviewed within 48h'}
                  {selectedTier === 'full' && '✅ Full donations are reviewed within 72h'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Rewards Modal */}
      <RewardsModal />
    </>
  );
}