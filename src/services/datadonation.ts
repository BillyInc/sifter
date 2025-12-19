// src/services/datadonation.ts
import { 
  SubmissionFormData, 
  FlagSubmissionData, 
  UserGamificationProfile, 
  UserMode,
  Badge,
  Achievement,
  LeaderboardEntry
} from '@/types/datadonation';
import { GamificationService } from './gamification';

export class DataDonationService {
  private static API_BASE = '/api/data-donation';
  
  // ======================
  // SUBMISSION MANAGEMENT
  // ======================
  
  static async submitFlag(flagData: FlagSubmissionData): Promise<{
    success: boolean;
    submissionId: string;
    pointsAwarded: number;
    newBadges?: Badge[];
    newAchievements?: Achievement[];
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flagData)
      });
      
      if (!response.ok) throw new Error('Submission failed');
      
      const result = await response.json();
      
      // Update local gamification profile
      await this.updateGamificationProfile(
        flagData.mode,
        flagData.points,
        flagData.tier
      );
      
      return result;
    } catch (error) {
      console.error('Flag submission error:', error);
      throw error;
    }
  }
  
  static async submitFullDonation(submissionData: SubmissionFormData): Promise<{
    success: boolean;
    caseId: string;
    reviewEstimate: string;
    pointsAwarded: number;
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/submit-full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      
      if (!response.ok) throw new Error('Full donation submission failed');
      
      return await response.json();
    } catch (error) {
      console.error('Full donation submission error:', error);
      throw error;
    }
  }
  
  static async getSubmissionStatus(submissionId: string): Promise<{
    status: string;
    estimatedReview: string;
    adminNotes?: string;
    evidenceStatus: any[];
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/status/${submissionId}`);
      if (!response.ok) throw new Error('Failed to fetch status');
      return await response.json();
    } catch (error) {
      console.error('Status fetch error:', error);
      throw error;
    }
  }
  
  static async getSubmissionsByUser(userId: string, mode: UserMode): Promise<any[]> {
    try {
      const response = await fetch(`${this.API_BASE}/user/${userId}?mode=${mode}`);
      if (!response.ok) throw new Error('Failed to fetch user submissions');
      return await response.json();
    } catch (error) {
      console.error('User submissions fetch error:', error);
      throw error;
    }
  }
  
  // ======================
  // GAMIFICATION
  // ======================
  
  static async updateGamificationProfile(
    mode: UserMode, 
    pointsEarned: number,
    tier: 'quick' | 'standard' | 'full'
  ): Promise<UserGamificationProfile> {
    try {
      // Get current profile
      const profile = await this.getUserGamificationProfile();
      
      // Update points
      profile.totalPoints += pointsEarned;
      profile.availablePoints += pointsEarned;
      profile.lifetimePoints += pointsEarned;
      
      // Update tier and level
      profile.currentTier = GamificationService.calculateTier(profile.totalPoints, mode);
      profile.currentLevel = GamificationService.calculateLevel(profile.totalPoints);
      
      // Update streak
      profile.streak = GamificationService.updateStreak(profile.streak);
      
      // Check for new badges
      const newBadges = GamificationService.checkBadges(profile);
      if (newBadges.length > 0) {
        profile.badges.push(...newBadges);
        // Award badge points
        newBadges.forEach(badge => {
          profile.totalPoints += badge.pointsReward;
          profile.availablePoints += badge.pointsReward;
        });
      }
      
      // Check achievements
      const updatedAchievements = GamificationService.checkAchievements(profile);
      profile.achievements = updatedAchievements;
      
      // Save updated profile
      await this.saveGamificationProfile(profile);
      
      return profile;
    } catch (error) {
      console.error('Gamification update error:', error);
      throw error;
    }
  }
  
  static async getUserGamificationProfile(): Promise<UserGamificationProfile> {
    try {
      // In a real app, fetch from API
      // For now, return mock data or from localStorage
      const saved = localStorage.getItem('gamification_profile');
      if (saved) {
        return JSON.parse(saved);
      }
      
      // Default profile
      return {
        userId: 'user-' + Math.random().toString(36).substr(2, 9),
        mode: 'individual',
        totalPoints: 0,
        availablePoints: 0,
        lifetimePoints: 0,
        currentLevel: 1,
        currentTier: 'bronze',
        badges: [],
        achievements: [],
        streak: {
          currentStreak: 0,
          longestStreak: 0,
          lastActivity: new Date().toISOString(),
          streakBonus: 1.0
        }
      };
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }
  
  static async saveGamificationProfile(profile: UserGamificationProfile): Promise<void> {
    try {
      // In a real app, save to API
      // For now, save to localStorage
      localStorage.setItem('gamification_profile', JSON.stringify(profile));
    } catch (error) {
      console.error('Save profile error:', error);
      throw error;
    }
  }
  
  static async getLeaderboard(
    timeframe: 'daily' | 'weekly' | 'monthly' | 'alltime' = 'alltime',
    mode?: UserMode
  ): Promise<LeaderboardEntry[]> {
    try {
      const url = `${this.API_BASE}/leaderboard?timeframe=${timeframe}${mode ? `&mode=${mode}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      
      const data = await response.json();
      
      // Apply gamification sorting and ranking
      return GamificationService.generateLeaderboard(data, mode, timeframe);
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      
      // Return mock data for development
      return this.getMockLeaderboardData(mode);
    }
  }
  
  static async redeemPoints(
    userId: string, 
    points: number, 
    rewardType: string
  ): Promise<{
    success: boolean;
    newBalance: number;
    rewardDetails: any;
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, points, rewardType })
      });
      
      if (!response.ok) throw new Error('Redemption failed');
      
      return await response.json();
    } catch (error) {
      console.error('Redemption error:', error);
      throw error;
    }
  }
  
  // ======================
  // EVIDENCE MANAGEMENT
  // ======================
  
  static async uploadEvidence(
    evidence: File | string, 
    submissionId: string,
    isConfidential: boolean = false
  ): Promise<{
    success: boolean;
    evidenceId: string;
    url: string;
    type: string;
  }> {
    try {
      const formData = new FormData();
      
      if (typeof evidence === 'string') {
        // URL evidence
        formData.append('url', evidence);
        formData.append('type', 'url');
      } else {
        // File evidence
        formData.append('file', evidence);
        formData.append('type', 'file');
      }
      
      formData.append('submissionId', submissionId);
      formData.append('confidential', isConfidential.toString());
      
      const response = await fetch(`${this.API_BASE}/evidence/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Evidence upload failed');
      
      return await response.json();
    } catch (error) {
      console.error('Evidence upload error:', error);
      throw error;
    }
  }
  
  static async verifyEvidence(evidenceId: string): Promise<{
    verified: boolean;
    confidence: number;
    issues?: string[];
    archiveUrl?: string;
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/evidence/verify/${evidenceId}`);
      if (!response.ok) throw new Error('Evidence verification failed');
      return await response.json();
    } catch (error) {
      console.error('Evidence verification error:', error);
      throw error;
    }
  }
  
  static async archiveEvidence(evidenceId: string): Promise<{
    archived: boolean;
    archiveUrl: string;
    timestamp: string;
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/evidence/archive/${evidenceId}`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Evidence archiving failed');
      
      return await response.json();
    } catch (error) {
      console.error('Evidence archive error:', error);
      throw error;
    }
  }
  
  // ======================
  // MODE-SPECIFIC FEATURES
  // ======================
  
  static async getVCPortfolioData(userId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.API_BASE}/vc/portfolio/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch VC portfolio');
      return await response.json();
    } catch (error) {
      console.error('VC portfolio fetch error:', error);
      return []; // Return empty array for non-VC users
    }
  }
  
  static async submitVCBatch(entities: any[], portfolioContext: any): Promise<{
    success: boolean;
    processed: number;
    failed: number;
    totalPoints: number;
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/vc/batch-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entities, portfolioContext })
      });
      
      if (!response.ok) throw new Error('VC batch submission failed');
      
      return await response.json();
    } catch (error) {
      console.error('VC batch submission error:', error);
      throw error;
    }
  }
  
  static async getResearcherTools(methodology: string): Promise<{
    patterns: any[];
    crossReferences: any[];
    analysisSuggestions: string[];
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/researcher/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methodology })
      });
      
      if (!response.ok) throw new Error('Failed to fetch researcher tools');
      
      return await response.json();
    } catch (error) {
      console.error('Researcher tools error:', error);
      throw error;
    }
  }
  
  static async getCommunityTemplates(): Promise<any[]> {
    try {
      const response = await fetch(`${this.API_BASE}/community/templates`);
      if (!response.ok) throw new Error('Failed to fetch community templates');
      return await response.json();
    } catch (error) {
      console.error('Community templates error:', error);
      return []; // Return empty array if failed
    }
  }
  
  // ======================
  // DISPUTE MANAGEMENT
  // ======================
  
  static async submitDispute(disputeData: any): Promise<{
    success: boolean;
    disputeId: string;
    estimatedResolution: string;
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(disputeData)
      });
      
      if (!response.ok) throw new Error('Dispute submission failed');
      
      return await response.json();
    } catch (error) {
      console.error('Dispute submission error:', error);
      throw error;
    }
  }
  
  static async getDisputeStatus(disputeId: string): Promise<{
    status: string;
    lastUpdated: string;
    nextStep?: string;
    resolution?: any;
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/dispute/status/${disputeId}`);
      if (!response.ok) throw new Error('Failed to fetch dispute status');
      return await response.json();
    } catch (error) {
      console.error('Dispute status error:', error);
      throw error;
    }
  }
  
  // ======================
  // ANALYTICS & REPORTING
  // ======================
  
  static async getUserAnalytics(userId: string, mode: UserMode): Promise<{
    submissionStats: any;
    impactMetrics: any;
    qualityScore: number;
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/analytics/user/${userId}?mode=${mode}`);
      if (!response.ok) throw new Error('Failed to fetch user analytics');
      return await response.json();
    } catch (error) {
      console.error('User analytics error:', error);
      throw error;
    }
  }
  
  static async getImpactReport(submissionId: string): Promise<{
    usersProtected: number;
    financialLossPrevented?: number;
    similarPatterns: any[];
    communityImpact: string;
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/impact/${submissionId}`);
      if (!response.ok) throw new Error('Failed to fetch impact report');
      return await response.json();
    } catch (error) {
      console.error('Impact report error:', error);
      throw error;
    }
  }
  
  // ======================
  // UTILITIES
  // ======================
  
  private static getMockLeaderboardData(mode?: UserMode): LeaderboardEntry[] {
    // Mock data for development
    const mockUsers = [
      { id: '1', name: 'CryptoGuardian', mode: 'ea-vc' as UserMode, points: 12500, submissions: 42, approved: 38 },
      { id: '2', name: 'DeFiDetective', mode: 'researcher' as UserMode, points: 8900, submissions: 28, approved: 25 },
      { id: '3', name: 'RugPullHunter', mode: 'individual' as UserMode, points: 5400, submissions: 19, approved: 17 },
      { id: '4', name: 'VCInsight', mode: 'ea-vc' as UserMode, points: 11200, submissions: 35, approved: 32 },
      { id: '5', name: 'ChainAnalyst', mode: 'researcher' as UserMode, points: 7200, submissions: 24, approved: 21 },
      { id: '6', name: 'CommunityWatch', mode: 'individual' as UserMode, points: 3800, submissions: 15, approved: 13 },
    ];
    
    const filtered = mode ? mockUsers.filter(user => user.mode === mode) : mockUsers;
    
    return filtered.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      userName: user.name,
      mode: user.mode,
      points: user.points,
      level: GamificationService.calculateLevel(user.points),
      tier: GamificationService.calculateTier(user.points, user.mode),
      badgesCount: Math.floor(user.points / 1000),
      submissions: user.submissions,
      approved: user.approved,
      impact: user.approved * 100,
      change: ['up', 'down', 'same'][Math.floor(Math.random() * 3)] as any,
      changeAmount: Math.floor(Math.random() * 10) + 1
    }));
  }
  
  static async validateEntityName(entityName: string): Promise<{
    exists: boolean;
    similar?: any[];
    riskScore?: number;
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/validate/entity?name=${encodeURIComponent(entityName)}`);
      if (!response.ok) throw new Error('Entity validation failed');
      return await response.json();
    } catch (error) {
      console.error('Entity validation error:', error);
      return { exists: false };
    }
  }
  
  static async checkDuplicateSubmission(
    entityName: string, 
    evidence: string[]
  ): Promise<{
    isDuplicate: boolean;
    existingCaseId?: string;
    similarityScore: number;
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/check-duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityName, evidence })
      });
      
      if (!response.ok) throw new Error('Duplicate check failed');
      
      return await response.json();
    } catch (error) {
      console.error('Duplicate check error:', error);
      return { isDuplicate: false, similarityScore: 0 };
    }
  }
}

// Create a default export instance for convenience
export default new DataDonationService();