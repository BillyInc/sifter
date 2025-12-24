// src/services/redemption-service.ts
import { Reward, RedemptionRequest, UserGamificationProfile } from '@/types/dataDonation';

// Mock data for example
const MOCK_REWARDS: Reward[] = [
  {
    id: 'reward-1',
    name: 'Early Access to New Features',
    description: 'Get early access to upcoming platform features before general release',
    type: 'access',
    category: 'all',
    pointsCost: 1000,
    redemptionInstructions: 'Access will be granted to your account automatically within 24 hours.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'reward-2',
    name: 'VC Portfolio Scanner Upgrade',
    description: 'Upgraded portfolio scanning with deeper due diligence capabilities',
    type: 'feature',
    category: 'vc',
    pointsCost: 5000,
    tierRequirement: 'gold',
    features: ['Enhanced risk scoring', 'Portfolio-wide threat detection', 'Custom alert rules'],
    redemptionInstructions: 'Our team will contact you to set up your upgraded scanner.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'reward-3',
    name: 'Research Whitepaper Co-authorship',
    description: 'Co-author a research paper with our team',
    type: 'recognition',
    category: 'researcher',
    pointsCost: 10000,
    tierRequirement: 'platinum',
    features: ['Co-authorship credit', 'Publication in industry journal', 'Conference presentation opportunity'],
    redemptionInstructions: 'Our research lead will contact you within 48 hours to discuss topics.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'reward-4',
    name: 'Expert Contributor Badge',
    description: 'Special badge displayed on your profile recognizing expert contributions',
    type: 'recognition',
    category: 'individual',
    pointsCost: 2500,
    tierRequirement: 'silver',
    features: ['Profile badge', 'Featured contributor listing', 'Priority support'],
    redemptionInstructions: 'Badge will be automatically added to your profile.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'reward-5',
    name: 'Platform Subscription Discount',
    description: '50% off annual premium subscription',
    type: 'discount',
    category: 'all',
    pointsCost: 3000,
    quantityAvailable: 100,
    quantityRemaining: 85,
    redemptionInstructions: 'Discount code will be emailed to you. Valid for 30 days.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'reward-6',
    name: 'Sifter Swag Package',
    description: 'Limited edition Sifter merchandise package',
    type: 'physical',
    category: 'all',
    pointsCost: 5000,
    quantityAvailable: 50,
    quantityRemaining: 32,
    features: ['Limited edition t-shirt', 'Sticker pack', 'Collectible pin'],
    redemptionInstructions: 'Provide your shipping address in the notes. Package ships within 2 weeks.',
    createdAt: new Date().toISOString()
  }
];

export class RedemptionService {
  private static redemptionRequests: RedemptionRequest[] = [];
  
  // Get all rewards
  static async getRewards(): Promise<Reward[]> {
    // In real app, fetch from API
    return Promise.resolve(MOCK_REWARDS);
  }
  
  // Request reward redemption
  static async requestRedemption(
    userId: string,
    rewardId: string,
    pointsCost: number,
    userNotes?: string
  ): Promise<RedemptionRequest> {
    // Create redemption request
    const request: RedemptionRequest = {
      id: `redemption-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      rewardId,
      pointsCost,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      userNotes
    };
    
    // Add to requests (in real app, save to database)
    this.redemptionRequests.push(request);
    
    return request;
  }
  
  // Get user's redemption requests
  static async getUserRedemptions(userId: string): Promise<RedemptionRequest[]> {
    return this.redemptionRequests.filter(r => r.userId === userId);
  }
  
  // Get all redemption requests (admin)
  static async getAllRedemptions(): Promise<RedemptionRequest[]> {
    return this.redemptionRequests;
  }
  
  // Update redemption request status (admin)
  static async updateRedemptionStatus(
    requestId: string,
    status: RedemptionRequest['status'],
    adminNotes?: string
  ): Promise<RedemptionRequest> {
    const request = this.redemptionRequests.find(r => r.id === requestId);
    if (!request) {
      throw new Error('Redemption request not found');
    }
    
    request.status = status;
    if (status === 'approved' || status === 'rejected') {
      request.processedAt = new Date().toISOString();
    }
    if (status === 'fulfilled') {
      request.fulfilledAt = new Date().toISOString();
    }
    if (adminNotes) {
      request.adminNotes = adminNotes;
    }
    
    return request;
  }
}