// src/components/data-donation/gamification/AdminRedemptionPanel.tsx
'use client';

import React, { useState } from 'react';
import { RedemptionRequest, Reward, UserGamificationProfile } from '@/types/dataDonation';

interface AdminRedemptionPanelProps {
  requests: RedemptionRequest[];
  rewards: Record<string, Reward>;
  users: Record<string, UserGamificationProfile>;
  onUpdateRequest: (requestId: string, updates: Partial<RedemptionRequest>) => Promise<void>;
  onSendMessage: (userId: string, message: string) => Promise<void>;
}

export default function AdminRedemptionPanel({
  requests,
  rewards,
  users,
  onUpdateRequest,
  onSendMessage
}: AdminRedemptionPanelProps) {
  const [selectedRequest, setSelectedRequest] = useState<RedemptionRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter requests by status
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const fulfilledRequests = requests.filter(r => r.status === 'fulfilled');

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    try {
      await onUpdateRequest(selectedRequest.id, {
        status: 'approved',
        processedAt: new Date().toISOString(),
        adminNotes
      });
      
      // Notify user
      const reward = rewards[selectedRequest.rewardId];
      await onSendMessage(selectedRequest.userId, 
        `Your redemption request for "${reward?.name}" has been approved! ` +
        `We'll contact you shortly to fulfill your reward.`
      );
      
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Failed to approve request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFulfillRequest = async () => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    try {
      await onUpdateRequest(selectedRequest.id, {
        status: 'fulfilled',
        fulfilledAt: new Date().toISOString(),
        adminNotes: adminNotes || selectedRequest.adminNotes
      });
      
      // Notify user
      const reward = rewards[selectedRequest.rewardId];
      await onSendMessage(selectedRequest.userId, 
        `Your reward "${reward?.name}" has been fulfilled! ` +
        `${reward?.redemptionInstructions || 'Please check your email for details.'}`
      );
      
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Failed to fulfill request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    try {
      await onUpdateRequest(selectedRequest.id, {
        status: 'rejected',
        processedAt: new Date().toISOString(),
        adminNotes
      });
      
      // Notify user
      const reward = rewards[selectedRequest.rewardId];
      await onSendMessage(selectedRequest.userId, 
        `Your redemption request for "${reward?.name}" was rejected. ` +
        `Points have been refunded. Reason: ${adminNotes || 'No reason provided'}`
      );
      
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Failed to reject request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-sifter-card border border-blue-500/30 rounded-xl p-4">
          <div className="text-sm text-gray-400">Pending Requests</div>
          <div className="text-3xl font-bold text-blue-400">{pendingRequests.length}</div>
        </div>
        <div className="bg-sifter-card border border-yellow-500/30 rounded-xl p-4">
          <div className="text-sm text-gray-400">Approved</div>
          <div className="text-3xl font-bold text-yellow-400">{approvedRequests.length}</div>
        </div>
        <div className="bg-sifter-card border border-green-500/30 rounded-xl p-4">
          <div className="text-sm text-gray-400">Fulfilled</div>
          <div className="text-3xl font-bold text-green-400">{fulfilledRequests.length}</div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-sifter-card border border-sifter-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sifter-dark">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-400">User</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Reward</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Points</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Requested</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sifter-border">
              {requests.map((request) => {
                const reward = rewards[request.rewardId];
                const user = users[request.userId];
                
                return (
                  <tr key={request.id} className="hover:bg-sifter-dark/50">
                    <td className="p-4">
                      <div className="font-medium text-white">
                        {user?.displayName || `User ${request.userId.slice(0, 8)}`}
                      </div>
                      <div className="text-sm text-gray-400">{user?.mode}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-white">{reward?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-400">{reward?.category}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-amber-400">{request.pointsCost}</div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        request.status === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                        request.status === 'fulfilled' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {request.status}
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="px-3 py-1 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded text-sm"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-sifter-card border border-sifter-border rounded-2xl max-w-2xl w-full p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Redemption Request</h3>
              <p className="text-gray-400">Review and process this redemption request</p>
            </div>
            
            {/* Request Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* User & Reward Info */}
              <div className="space-y-4">
                <div className="bg-sifter-dark/50 border border-sifter-border rounded-lg p-4">
                  <h4 className="font-medium text-white mb-3">User Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">User:</span>
                      <span className="text-white font-medium">
                        {users[selectedRequest.userId]?.displayName || `User ${selectedRequest.userId.slice(0, 8)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mode:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        users[selectedRequest.userId]?.mode === 'ea-vc' ? 'bg-blue-500/20 text-blue-400' :
                        users[selectedRequest.userId]?.mode === 'researcher' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {users[selectedRequest.userId]?.mode || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Available Points:</span>
                      <span className="text-amber-400 font-bold">
                        {users[selectedRequest.userId]?.availablePoints.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* User Notes */}
                {selectedRequest.userNotes && (
                  <div className="bg-sifter-dark/50 border border-sifter-border rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">User Notes</h4>
                    <p className="text-gray-300 text-sm">{selectedRequest.userNotes}</p>
                  </div>
                )}
              </div>
              
              {/* Reward Details */}
              <div className="bg-sifter-dark/50 border border-sifter-border rounded-lg p-4">
                <h4 className="font-medium text-white mb-3">Reward Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reward:</span>
                    <span className="text-white font-medium">{rewards[selectedRequest.rewardId]?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      rewards[selectedRequest.rewardId]?.category === 'vc' ? 'bg-blue-500/20 text-blue-400' :
                      rewards[selectedRequest.rewardId]?.category === 'researcher' ? 'bg-purple-500/20 text-purple-400' :
                      rewards[selectedRequest.rewardId]?.category === 'individual' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {rewards[selectedRequest.rewardId]?.category || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">{rewards[selectedRequest.rewardId]?.type || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Points Cost:</span>
                    <span className="font-bold text-amber-400">{selectedRequest.pointsCost}</span>
                  </div>
                  <div className="pt-3 border-t border-sifter-border/50">
                    <h5 className="text-sm font-medium text-white mb-2">Redemption Instructions:</h5>
                    <p className="text-sm text-gray-400">
                      {rewards[selectedRequest.rewardId]?.redemptionInstructions || 'No specific instructions.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Admin Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about processing this request..."
                className="w-full h-32 px-3 py-2 bg-sifter-dark border border-sifter-border rounded-lg 
                         text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setAdminNotes('');
                }}
                className="px-4 py-3 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg font-medium flex-1"
                disabled={isProcessing}
              >
                Cancel
              </button>
              
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={handleRejectRequest}
                    disabled={isProcessing}
                    className="px-4 py-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg font-medium"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleApproveRequest}
                    disabled={isProcessing}
                    className="px-4 py-3 bg-blue-500 text-white hover:bg-blue-600 rounded-lg font-medium"
                  >
                    {isProcessing ? 'Processing...' : 'Approve'}
                  </button>
                </>
              )}
              
              {selectedRequest.status === 'approved' && (
                <button
                  onClick={handleFulfillRequest}
                  disabled={isProcessing}
                  className="px-4 py-3 bg-green-500 text-white hover:bg-green-600 rounded-lg font-medium flex-1"
                >
                  {isProcessing ? 'Processing...' : 'Mark as Fulfilled'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}