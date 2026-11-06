// src/components/data-donation/gamification/RewardsShop.tsx
'use client';

import React, { useState } from 'react';
import { Reward, UserGamificationProfile, UserMode, UserTier } from '@/types/dataDonation';
import { NotificationService } from '@/services/notifications';

interface RewardsShopProps {
  userProfile: UserGamificationProfile;
  rewards: Reward[];
  onRedeem: (rewardId: string) => Promise<boolean>;
  isAvailable?: boolean;  //  ADD THIS
  onPurchaseCredits?: () => void;  //  ADD THIS
  showCategories?: boolean;  //  ADD THIS
}

export default function RewardsShop({ userProfile, rewards, onRedeem,  onPurchaseCredits, showCategories = true  }: RewardsShopProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | UserMode>('all');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [userNotes, setUserNotes] = useState('');

  // Filter rewards based on user eligibility
  const eligibleRewards = rewards.filter(reward => {
    // Check category filter
    if (selectedCategory !== 'all' && reward.category !== 'all' && reward.category !== selectedCategory) {
      return false;
    }
    
    // Check tier requirement
    if (reward.tierRequirement) {
      const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'vc-elite', 'research-fellow'];
      const userTierIndex = tierOrder.indexOf(userProfile.currentTier);
      const requiredTierIndex = tierOrder.indexOf(reward.tierRequirement);
      if (userTierIndex < requiredTierIndex) return false;
    }
    
    // Check mode requirement
    if (reward.modeRequirement && reward.modeRequirement !== userProfile.mode) {
      return false;
    }
    
    // Check if user has enough points
    if (reward.pointsCost > userProfile.availablePoints) {
      return false;
    }
    
    // Check quantity available
    if (reward.quantityRemaining !== undefined && reward.quantityRemaining <= 0) {
      return false;
    }
    
    return true;
  });

  const handleRedeem = async () => {
    if (!selectedReward) return;
    
    setIsRedeeming(true);
    try {
      const success = await onRedeem(selectedReward.id);
      
      if (success) {
        // Show success notification
        NotificationService.notifyPointsEarned(
          -selectedReward.pointsCost,
          `Redeemed: ${selectedReward.name}`
        );
        
        // Reset
        setSelectedReward(null);
        setUserNotes('');
        
        alert(` Reward redemption requested! Our team will process it within 24-48 hours.`);
      }
    } catch (error) {
      console.error('Redemption failed:', error);
      alert('Redemption failed. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  // Categories for filter
  const categories = [
    { id: 'all', label: 'All Rewards', icon: '' },
    { id: 'ea-vc', label: 'VC Rewards', icon: '' },
    { id: 'researcher', label: 'Researcher Rewards', icon: '' },
    { id: 'individual', label: 'Individual Rewards', icon: '' }
  ];

  // Group rewards by type
  const rewardsByType = eligibleRewards.reduce((acc, reward) => {
    if (!acc[reward.type]) acc[reward.type] = [];
    acc[reward.type].push(reward);
    return acc;
  }, {} as Record<string, Reward[]>);

  const typeLabels = {
    discount: 'Discounts',
    access: 'Access',
    feature: 'Features',
    recognition: 'Recognition',
    physical: 'Physical',
    digital: 'Digital'
  };

  return (
    <div className="bg-sifter-card border border-sifter-border rounded-2xl p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Rewards Shop</h2>
        <p className="text-sifter-text-muted">Redeem your points for exclusive rewards</p>
        
        {/* Points Display */}
        <div className="mt-4 p-4 bg-sifter-elevated border border-amber-500/30 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-sifter-text-muted">Available Points</div>
              <div className="text-3xl font-bold text-amber-400">{userProfile.availablePoints.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-sifter-text-muted">Total Points</div>
              <div className="text-2xl font-bold text-white">{userProfile.totalPoints.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/*  ADD THIS: Optional "Get More Points" button */}
       {onPurchaseCredits && (
       <button
      onClick={onPurchaseCredits}
      className="mt-3 w-full px-4 py-2 bg-amber-600 
                 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg 
                 font-medium text-sm transition-all"
        > Get More Points
       </button>
      )}




      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="font-medium text-white mb-3">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                selectedCategory === category.id
                  ? category.id === 'ea-vc' ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50' :
                    category.id === 'researcher' ? 'bg-purple-500/30 text-purple-400 border border-purple-500/50' :
                    category.id === 'individual' ? 'bg-green-500/30 text-green-400 border border-green-500/50' :
                    'bg-sifter-hover text-white border border-sifter-border'
                  : 'bg-sifter-elevated text-sifter-text-muted hover:bg-sifter-hover border border-sifter-border'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="space-y-8">
        {Object.entries(rewardsByType).map(([type, typeRewards]) => (
          <div key={type}>
            <h3 className="text-lg font-semibold text-white mb-4">{typeLabels[type as keyof typeof typeLabels] || type}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeRewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`border rounded-xl p-4 hover:border-blue-500/50 transition-colors cursor-pointer ${
                    selectedReward?.id === reward.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-sifter-border bg-sifter-dark/30'
                  }`}
                  onClick={() => setSelectedReward(reward)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-white mb-1">{reward.name}</h4>
                      <div className={`text-xs px-2 py-1 rounded inline-block ${
                        reward.category === 'vc' ? 'bg-blue-500/20 text-blue-400' :
                        reward.category === 'researcher' ? 'bg-purple-500/20 text-purple-400' :
                        reward.category === 'individual' ? 'bg-green-500/20 text-green-400' :
                        'bg-sifter-elevated text-sifter-text-muted'
                      }`}>
                        {reward.category === 'all' ? 'All Users' : reward.category.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        
                        <span>{reward.pointsCost.toLocaleString()}</span>
                      </div>
                      {reward.tierRequirement && (
                        <div className={`text-xs mt-1 px-2 py-1 rounded-full ${
                          reward.tierRequirement === 'vc-elite' ? 'bg-purple-500/20 text-purple-400' :
                          reward.tierRequirement === 'research-fellow' ? 'bg-blue-500/20 text-blue-400' :
                          reward.tierRequirement === 'diamond' ? 'bg-cyan-500/20 text-cyan-400' :
                          reward.tierRequirement === 'platinum' ? 'bg-sifter-elevated text-sifter-text-muted' :
                          reward.tierRequirement === 'gold' ? 'bg-amber-500/20 text-amber-400' :
                          reward.tierRequirement === 'silver' ? 'bg-sifter-elevated text-sifter-text-muted' :
                          'bg-amber-900/20 text-amber-700'
                        }`}>
                          {reward.tierRequirement}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-sifter-text mb-3">{reward.description}</p>
                  
                  {/* Features */}
                  {reward.features && reward.features.length > 0 && (
                    <div className="mb-3">
                      <ul className="space-y-1">
                        {reward.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="text-xs text-sifter-text-muted flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Availability */}
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-sifter-border/50">
                    {reward.quantityRemaining !== undefined && (
                      <div className="text-xs text-sifter-text-muted">
                        {reward.quantityRemaining > 0 
                          ? `${reward.quantityRemaining} left` 
                          : 'Out of stock'}
                      </div>
                    )}
                    <div className={`text-xs px-2 py-1 rounded ${
                      reward.pointsCost > userProfile.availablePoints
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {reward.pointsCost > userProfile.availablePoints
                        ? 'Need more points'
                        : 'Available to redeem'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {eligibleRewards.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-white mb-2">No rewards available</h3>
            <p className="text-sifter-text-muted">
              {selectedCategory !== 'all' 
                ? `No rewards available for your current category and tier. Keep earning points!`
                : 'No rewards match your current points balance and tier.'}
            </p>
          </div>
        )}
      </div>

      {/* Redemption Modal */}
      {selectedReward && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-sifter-card border border-sifter-border rounded-2xl max-w-lg w-full p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Redeem Reward</h3>
              <p className="text-sifter-text-muted">Confirm your reward redemption request</p>
            </div>
            
            {/* Reward Summary */}
            <div className="bg-sifter-dark/50 border border-sifter-border rounded-xl p-4 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium text-white mb-1">{selectedReward.name}</h4>
                  <p className="text-sm text-sifter-text">{selectedReward.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-400">
                    {selectedReward.pointsCost.toLocaleString()}
                  </div>
                  <div className="text-sm text-sifter-text-muted">points</div>
                </div>
              </div>
              
              <div className="text-sm text-sifter-text-muted mb-3">
                {selectedReward.redemptionInstructions}
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-sifter-border/50">
                <div className="text-sm text-sifter-text-muted">Your points after redemption:</div>
                <div className="text-lg font-bold text-white">
                  {(userProfile.availablePoints - selectedReward.pointsCost).toLocaleString()}
                </div>
              </div>
            </div>
            
            {/* User Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2"> Notes (Optional)
              </label>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Add any notes for the admin team..."
                className="w-full h-24 px-3 py-2 bg-sifter-dark border border-sifter-border rounded-lg 
                         text-white placeholder:text-sifter-text-subtle focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Confirmation */}
            <div className="mb-6 p-4 bg-sifter-elevated border border-amber-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="text-amber-400 mt-1">ℹ</div>
                <div className="text-sm text-amber-300"> After redemption, our team will process your request within 24-48 hours. 
                  You'll receive a notification when your reward is ready.
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedReward(null);
                  setUserNotes('');
                }}
                className="flex-1 px-4 py-3 bg-sifter-elevated text-sifter-text hover:bg-sifter-hover rounded-lg font-medium"
                disabled={isRedeeming}
              > Cancel
              </button>
              <button
                onClick={handleRedeem}
                disabled={isRedeeming || selectedReward.pointsCost > userProfile.availablePoints}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                  selectedReward.pointsCost > userProfile.availablePoints || isRedeeming
                    ? 'bg-sifter-hover text-sifter-text-subtle cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
              >
                {isRedeeming ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Processing...
                  </span>
                ) : (
                  'Confirm Redemption'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}