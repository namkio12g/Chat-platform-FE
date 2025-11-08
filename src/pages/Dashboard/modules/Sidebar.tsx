import { useState, useEffect } from 'react';
import { User, Users, Settings, DoorOpen, Bell } from 'lucide-react';
import '../styles.scss';
import { logoutUser } from '@/store/thunks/authThunks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { selectUser } from '@/store/selectors/authSelectors';
import { ProfileUpdateModal } from './ProfileUpdateModal';
import { NotificationModal } from './NotificationModal';
import { api } from '@/services/api';
import { setUser } from '@/store/slices/authSlice';
import { getAvatarUrl } from '@/constants/avatars';
import websocketManager from '@/services/websocket';
import { setCurrentConversation } from '@/store/slices/chatSlice';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUser = useAppSelector(selectUser);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());
    if (logoutUser.fulfilled.match(result)) {
      toast.success('Logged out successfully');
    } else {
      toast.error('Failed to logout');
    }
    navigate('/login');
  };

  // Load unread notification count
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const result = await api.getUnreadNotifications();
        setUnreadCount(result.count);
      } catch (error) {
        console.error('Failed to load unread count:', error);
      }
    };

    loadUnreadCount();
    websocketManager.requestNotificationCount();

    // Listen for notification count updates
    const handleNotificationCountUpdate = (count: unknown) => {
      setUnreadCount(count as number);
    };

    const handleNewNotification = () => {
      setUnreadCount((prev) => prev + 1);
    };

    websocketManager.on('notificationCountUpdate', handleNotificationCountUpdate);
    websocketManager.on('newNotification', handleNewNotification);

    return () => {
      websocketManager.off('notificationCountUpdate', handleNotificationCountUpdate);
      websocketManager.off('newNotification', handleNewNotification);
    };
  }, []);

  const handleProfileUpdate = async (name: string, avatarFile: File | null) => {
    let updatedUser = currentUser;

    // Step 1: Upload avatar if provided
    if (avatarFile) {
      updatedUser = await api.uploadAvatar(avatarFile);
      dispatch(setUser(updatedUser));
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Avatar updated successfully');
    }

    // Step 2: Update username if changed
    if (name && name.trim() !== currentUser?.userName) {
      updatedUser = await api.updateProfile(name.trim());
      dispatch(setUser(updatedUser));
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (!avatarFile) {
        toast.success('Profile updated successfully');
      }
    }

    // If both avatar and name were updated, show a combined message
    if (avatarFile && name && name.trim() !== currentUser?.userName) {
      toast.success('Profile and avatar updated successfully');
    }
  };

  const handleNotificationClick = (conversationId: number) => {
    dispatch(setCurrentConversation(conversationId));
  };
  return (
    <aside
      className={`GoChat-sidebar bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-4 px-4 ${
        isOpen ? 'expanded' : 'collapsed'
      }`}
    >
      <button
        className='sidebar-toggle-btn w-full h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center'
        onClick={toggleSidebar}
      >
        ≡
      </button>
      <div className='sidebar-item flex p-2 rounded-lg bg-slate-200 items-center gap-2 w-full'>
        <User className='w-4 h-4 flex-shrink-0' />
        <span className={`sidebar-text ${isOpen ? 'expanded' : 'collapsed'}`}>
          Friends
        </span>
      </div>
      <div className='sidebar-item flex p-2 rounded-lg bg-slate-200 items-center gap-2 w-full'>
        <Users className='w-4 h-4 flex-shrink-0' />
        <span className={`sidebar-text ${isOpen ? 'expanded' : 'collapsed'}`}>
          Groups
        </span>
      </div>
      <div className='sidebar-item flex p-2 rounded-lg bg-slate-200 items-center gap-2 w-full'>
        <Settings className='w-4 h-4 flex-shrink-0' />
        <span className={`sidebar-text ${isOpen ? 'expanded' : 'collapsed'}`}>
          Settings
        </span>
      </div>
      <div
        className='sidebar-item flex p-2 rounded-lg bg-slate-200 items-center gap-2 w-full'
        onClick={handleLogout}
      >
        <DoorOpen className='w-4 h-4 flex-shrink-0' />
        <span className={`sidebar-text ${isOpen ? 'expanded' : 'collapsed'}`}>
          Logout
        </span>
      </div>
      {/* Notification Icon */}
      <div
        className='relative cursor-pointer hover:opacity-80 transition-opacity'
        onClick={() => setIsNotificationModalOpen(true)}
        title='Notifications'
      >
        <Bell className='w-6 h-6 text-slate-600' />
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div
        className={`sidebar-avatar mt-auto rounded-full bg-slate-300 cursor-pointer hover:opacity-80 transition-opacity ${
          isOpen ? 'expanded' : 'collapsed'
        }`}
        onClick={() => setIsProfileModalOpen(true)}
        style={{
          backgroundImage: `url(${getAvatarUrl(currentUser?.avatar)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        title='Click to update profile'
      />

      {/* Profile Update Modal */}
      <ProfileUpdateModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleProfileUpdate}
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onNotificationClick={handleNotificationClick}
      />
    </aside>
  );
};
