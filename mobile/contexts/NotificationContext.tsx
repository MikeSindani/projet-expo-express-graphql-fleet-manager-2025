import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_NOTIFICATIONS, MARK_ALL_NOTIFICATIONS_READ, MARK_NOTIFICATION_READ, NOTIFICATION_RECEIVED } from '@/lib/graphql-queries';
import {
    addNotificationReceivedListener,
    addNotificationResponseReceivedListener,
    registerForPushNotificationsAsync,
    scheduleLocalNotification
} from '@/lib/notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user?.organizationId) return;

    try {
      const data = await graphqlClient.query<{ notifications: Notification[] }>(GET_NOTIFICATIONS);
      if (data?.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    // Request notification permissions
    registerForPushNotificationsAsync().then((granted) => {
      setPermissionsGranted(granted || false);
    });

    // Listen for notification interactions
    const receivedSubscription = addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    const responseSubscription = addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);


  // GraphQL Subscription for real-time updates
  useSubscription<{ notificationReceived: Notification }>({
    query: NOTIFICATION_RECEIVED,
    enabled: !!user?.organizationId,
    onData: (data: { notificationReceived: Notification }) => {
       const notification = data?.notificationReceived;
       console.log('🔔 Real-time notification received:', notification);
       if (notification) {
         setNotifications((prev) => [{ ...notification, read: false }, ...prev]);
         if (permissionsGranted) {
           scheduleLocalNotification('Fleet Manager Pro', notification.message);
         }
       }
    },
    onError: (error) => console.log('Subscription error (ignored):', error),
  });

  useEffect(() => {
    if (!user?.organizationId) return;

    // Initial fetch
    fetchNotifications();

    // Occasional refetch as fallback (every 2 minutes instead of 30s)
    const interval = setInterval(() => {
      fetchNotifications();
    }, 120000);

    return () => clearInterval(interval);
  }, [user?.organizationId]);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );

    try {
      await graphqlClient.mutate(MARK_NOTIFICATION_READ, { id });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert if needed, but for read status it's usually fine to ignore or retry
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );

    try {
      await graphqlClient.mutate(MARK_ALL_NOTIFICATIONS_READ);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
