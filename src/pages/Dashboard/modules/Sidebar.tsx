import { useState } from 'react';
import { User, Users, Settings, DoorOpen } from 'lucide-react';
import '../styles.scss';
import { logoutUser } from '@/store/thunks/authThunks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { selectUser } from '@/store/selectors/authSelectors';
import { ProfileUpdateModal } from './ProfileUpdateModal';
import { api } from '@/services/api';
import { setUser } from '@/store/slices/authSlice';
import { getAvatarUrl } from '@/constants/avatars';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
    </aside>
  );
};
