// src/services/notifications.ts
import { Badge, Achievement, UserTier } from '@/types/datadonation';

export type NotificationType = 
  | 'points-earned'
  | 'badge-earned'
  | 'achievement-completed'
  | 'level-up'
  | 'tier-changed'
  | 'streak-extended'
  | 'submission-approved'
  | 'submission-rejected'
  | 'leaderboard-change';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string;
  data?: any;
  read: boolean;
  createdAt: string;
  expiresAt?: string;
}

export class NotificationService {
  private static notifications: Notification[] = [];
  
  // Create notification for points earned
  static notifyPointsEarned(points: number, reason: string): Notification {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'points-earned',
      title: 'Points Earned!',
      message: `You earned ${points} points for ${reason}`,
      icon: '💎',
      data: { points },
      read: false,
      createdAt: new Date().toISOString()
    };
    
    this.addNotification(notification);
    return notification;
  }
  
  // Create notification for badge earned
  static notifyBadgeEarned(badge: Badge): Notification {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'badge-earned',
      title: 'New Badge!',
      message: `You earned the "${badge.name}" badge: ${badge.description}`,
      icon: badge.icon,
      data: { badge },
      read: false,
      createdAt: new Date().toISOString()
    };
    
    this.addNotification(notification);
    return notification;
  }
  
  // Create notification for level up
  static notifyLevelUp(oldLevel: number, newLevel: number): Notification {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'level-up',
      title: 'Level Up!',
      message: `You advanced from Level ${oldLevel} to Level ${newLevel}`,
      icon: '⭐',
      data: { oldLevel, newLevel },
      read: false,
      createdAt: new Date().toISOString()
    };
    
    this.addNotification(notification);
    return notification;
  }
  
  // Create notification for tier change
  static notifyTierChanged(oldTier: UserTier, newTier: UserTier): Notification {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'tier-changed',
      title: 'Tier Promotion!',
      message: `You advanced from ${oldTier} to ${newTier} tier`,
      icon: '💎',
      data: { oldTier, newTier },
      read: false,
      createdAt: new Date().toISOString()
    };
    
    this.addNotification(notification);
    return notification;
  }
  
  // Create notification for streak extended
  static notifyStreakExtended(streak: number): Notification {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'streak-extended',
      title: 'Streak Extended!',
      message: `You have a ${streak}-day submission streak`,
      icon: '🔥',
      data: { streak },
      read: false,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    
    this.addNotification(notification);
    return notification;
  }
  
  // Create notification for submission approved
  static notifySubmissionApproved(submissionId: string, points: number): Notification {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'submission-approved',
      title: 'Submission Approved!',
      message: `Your submission #${submissionId} was approved. ${points} points added.`,
      icon: '✅',
      data: { submissionId, points },
      read: false,
      createdAt: new Date().toISOString()
    };
    
    this.addNotification(notification);
    return notification;
  }
  
  // Create notification for leaderboard change
  static notifyLeaderboardChange(oldRank: number, newRank: number): Notification {
    const change = oldRank - newRank;
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'leaderboard-change',
      title: change > 0 ? 'Rank Improved!' : 'Rank Update',
      message: change > 0 
        ? `You moved up ${change} positions to rank #${newRank}`
        : `You are now rank #${newRank} on the leaderboard`,
      icon: change > 0 ? '🏆' : '📊',
      data: { oldRank, newRank, change },
      read: false,
      createdAt: new Date().toISOString()
    };
    
    this.addNotification(notification);
    return notification;
  }
  
  // Add notification to store
  private static addNotification(notification: Notification): void {
    this.notifications.unshift(notification); // Add to beginning
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }
    
    // Trigger UI update (in a real app, you'd use a state management system)
    this.triggerUpdate();
  }
  
  // Get all notifications
  static getNotifications(): Notification[] {
    return this.notifications;
  }
  
  // Get unread notifications
  static getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }
  
  // Mark notification as read
  static markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.triggerUpdate();
    }
  }
  
  // Mark all as read
  static markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.triggerUpdate();
  }
  
  // Clear expired notifications
  static clearExpired(): void {
    const now = new Date();
    this.notifications = this.notifications.filter(n => {
      if (!n.expiresAt) return true;
      return new Date(n.expiresAt) > now;
    });
    this.triggerUpdate();
  }
  
  // Clear all notifications
  static clearAll(): void {
    this.notifications = [];
    this.triggerUpdate();
  }
  
  // Subscribe to updates
  private static subscribers: (() => void)[] = [];
  
  static subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  private static triggerUpdate(): void {
    this.subscribers.forEach(callback => callback());
  }
}