'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export type NotificationType = 'leave' | 'task' | 'attendance' | 'general' | 'project' | 'evaluation' | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type Notification = {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  userId: string;
  metadata?: Record<string, any>;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'userId'>) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  clearAll: () => Promise<void>;
};

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchNotifications = React.useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/notifications?userId=${user.uid}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        })));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.uid) return;

    try {
      const response = await fetch(`/api/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const removeNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'userId'>) => {
    if (!user?.uid) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...notification,
          userId: user.uid,
        }),
      });
      
      if (response.ok) {
        const newNotification = await response.json();
        setNotifications(prev => [
          {
            ...newNotification,
            timestamp: new Date(newNotification.timestamp),
          },
          ...prev,
        ]);

        // Show toast for high priority notifications
        if (notification.priority === 'high' || notification.priority === 'urgent') {
          toast({
            title: notification.title,
            description: notification.message,
            variant: notification.priority === 'urgent' ? 'destructive' : 'default',
          });
        }
      }
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const clearAll = async () => {
    if (!user?.uid) return;

    try {
      const response = await fetch(`/api/notifications/clear-all`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });
      
      if (response.ok) {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  // Fetch notifications on mount and when user changes
  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll for new notifications every 30 seconds
  React.useEffect(() => {
    if (!user?.uid) return;

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, user?.uid]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = React.useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    addNotification,
    fetchNotifications,
    clearAll,
  }), [notifications, unreadCount, loading]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = React.useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}