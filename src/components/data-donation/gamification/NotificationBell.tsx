// src/components/data-donation/gamification/NotificationBell.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { NotificationService, Notification } from '@/services/notifications';

interface NotificationBellProps {
  compact?: boolean;
  onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationBell({ onNotificationClick, compact = false }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications and subscribe to updates
  useEffect(() => {
    // Initial load
    setNotifications(NotificationService.getNotifications());
    setUnreadCount(NotificationService.getUnreadNotifications().length);
    
    // Subscribe to updates
    const unsubscribe = NotificationService.subscribe(() => {
      setNotifications(NotificationService.getNotifications());
      setUnreadCount(NotificationService.getUnreadNotifications().length);
    });
    
    // Clean expired notifications every minute
    const interval = setInterval(() => {
      NotificationService.clearExpired();
    }, 60000);
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    NotificationService.markAsRead(notification.id);
    onNotificationClick?.(notification);
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    NotificationService.markAllAsRead();
  };

  const handleClearAll = () => {
    NotificationService.clearAll();
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full 
                         flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-sifter-card border border-sifter-border rounded-xl 
                      shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-sifter-border">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-400 hover:text-gray-300"
                >
                  Clear all
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {unreadCount} unread • {notifications.length} total
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">No notifications yet</div>
                <div className="text-sm text-gray-500">Submit reports to earn points and badges!</div>
              </div>
            ) : (
              <div className="divide-y divide-sifter-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer hover:bg-sifter-dark/30 transition-colors ${
                      !notification.read ? 'bg-blue-500/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        notification.type === 'points-earned' ? 'bg-amber-500/20 text-amber-400' :
                        notification.type === 'badge-earned' ? 'bg-green-500/20 text-green-400' :
                        notification.type === 'level-up' ? 'bg-blue-500/20 text-blue-400' :
                        notification.type === 'tier-changed' ? 'bg-purple-500/20 text-purple-400' :
                        notification.type === 'streak-extended' ? 'bg-red-500/20 text-red-400' :
                        notification.type === 'submission-approved' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        <span className="text-lg">{notification.icon}</span>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-white">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-sifter-border bg-sifter-dark/50">
            <button
              onClick={() => {
                // Navigate to notifications page
                setIsOpen(false);
              }}
              className="w-full text-center text-sm text-blue-400 hover:text-blue-300 py-2"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}