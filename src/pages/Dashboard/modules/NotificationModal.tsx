import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { useAppDispatch } from '@/store/hooks';
import { setCurrentConversation } from '@/store/slices/chatSlice';
import websocketManager from '@/services/websocket';

interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data: string;
  status: 'unread' | 'read';
  conversation_id?: number;
  message_id?: number;
  created_at: string;
  updated_at: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick?: (conversationId: number) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onNotificationClick,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const dispatch = useAppDispatch();

  // Load notifications
  const loadNotifications = async (reset = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const currentOffset = reset ? 0 : offset;
      const result = await api.getNotifications(20, currentOffset);

      if (reset) {
        setNotifications(result.notifications);
        setOffset(20);
      } else {
        setNotifications((prev) => [...prev, ...result.notifications]);
        setOffset((prev) => prev + 20);
      }

      setHasMore(
        currentOffset + result.notifications.length < result.total
      );
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Load unread count
  const loadUnreadCount = async () => {
    try {
      const result = await api.getUnreadNotifications();
      setUnreadCount(result.count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadNotifications(true);
      loadUnreadCount();
      websocketManager.requestNotificationCount();
    }
  }, [isOpen]);

  // WebSocket listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleNewNotification = (data: unknown) => {
      const notification = data as Notification;
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast.info(notification.title, {
        description: notification.message,
      });
    };

    const handleNotificationCountUpdate = (count: unknown) => {
      setUnreadCount(count as number);
    };

    const handleNotificationRead = (data: unknown) => {
      const payload = data as { notification_id: number; status: string };
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === payload.notification_id
            ? { ...n, status: payload.status as 'read' | 'unread' }
            : n
        )
      );
      if (payload.status === 'read') {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    };

    const handleMarkAllReadSuccess = () => {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: 'read' as const }))
      );
      setUnreadCount(0);
    };

    websocketManager.on('newNotification', handleNewNotification);
    websocketManager.on('notificationCountUpdate', handleNotificationCountUpdate);
    websocketManager.on('notificationRead', handleNotificationRead);
    websocketManager.on('markAllReadSuccess', handleMarkAllReadSuccess);

    return () => {
      websocketManager.off('newNotification', handleNewNotification);
      websocketManager.off('notificationCountUpdate', handleNotificationCountUpdate);
      websocketManager.off('notificationRead', handleNotificationRead);
      websocketManager.off('markAllReadSuccess', handleMarkAllReadSuccess);
    };
  }, [isOpen]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await api.markNotificationAsRead(notificationId);
      websocketManager.acknowledgeNotification(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, status: 'read' as const } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      websocketManager.markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: 'read' as const }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (notification.status === 'unread') {
      handleMarkAsRead(notification.id);
    }

    if (notification.conversation_id) {
      dispatch(setCurrentConversation(notification.conversation_id));
      if (onNotificationClick) {
        onNotificationClick(notification.conversation_id);
      }
      onClose();
    }
  };

  // Format time
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'
      onClick={handleBackdropClick}
    >
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-slate-200'>
          <div className='flex items-center gap-2'>
            <h2 className='text-lg font-semibold text-slate-900'>
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className='px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-medium'>
                {unreadCount}
              </span>
            )}
          </div>
          <div className='flex items-center gap-2'>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className='text-xs text-sky-600 hover:text-sky-700 font-medium'
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={onClose}
              className='text-slate-400 hover:text-slate-600 transition-colors'
              aria-label='Close modal'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className='flex-1 overflow-y-auto'>
          {isLoading && notifications.length === 0 ? (
            <div className='flex items-center justify-center py-8'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500'></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-8 text-center px-4'>
              <div className='w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3'>
                <svg
                  className='w-8 h-8 text-slate-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                  />
                </svg>
              </div>
              <p className='text-sm text-slate-500 mb-1'>No notifications</p>
              <p className='text-xs text-slate-400'>
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className='divide-y divide-slate-100'>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                    notification.status === 'unread' ? 'bg-sky-50/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className='flex items-start gap-3'>
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        notification.status === 'unread'
                          ? 'bg-sky-500'
                          : 'bg-transparent'
                      }`}
                    />
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1 min-w-0'>
                          <p
                            className={`text-sm font-medium ${
                              notification.status === 'unread'
                                ? 'text-slate-900'
                                : 'text-slate-600'
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className='text-xs text-slate-500 mt-1 line-clamp-2'>
                            {notification.message}
                          </p>
                        </div>
                        <span className='text-xs text-slate-400 flex-shrink-0'>
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {hasMore && (
                <div className='p-4 text-center'>
                  <button
                    onClick={() => loadNotifications(false)}
                    disabled={isLoading}
                    className='text-sm text-sky-600 hover:text-sky-700 font-medium disabled:opacity-50'
                  >
                    {isLoading ? 'Loading...' : 'Load more'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

