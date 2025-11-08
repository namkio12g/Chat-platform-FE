import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../../store/hooks';
import { selectUser } from '../../../store/selectors/authSelectors';
import { getAvatarUrl } from '@/constants/avatars';

interface ProfileUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, avatarFile: File | null) => Promise<void>;
}

export const ProfileUpdateModal: React.FC<ProfileUpdateModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const currentUser = useAppSelector(selectUser);
  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with current user data
  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.userName || '');
      setAvatarPreview(
        currentUser.avatar && currentUser.avatar.trim() !== ''
          ? currentUser.avatar
          : getAvatarUrl(currentUser.avatar)
      );
      setAvatarFile(null);
      setError(null);
    }
  }, [isOpen, currentUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max for avatars)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB');
      return;
    }

    setAvatarFile(file);
    setError(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleRemoveAvatar = () => {
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview(
      currentUser?.avatar && currentUser.avatar.trim() !== ''
        ? currentUser.avatar
        : getAvatarUrl(currentUser?.avatar)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(name.trim(), avatarFile);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update profile'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarFile) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview, avatarFile]);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'
      onClick={handleBackdropClick}
    >
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col'>
        {/* Modal Header */}
        <div className='flex items-center justify-between p-4 border-b border-slate-200'>
          <h2 className='text-lg font-semibold text-slate-900'>
            Update Profile
          </h2>
          <button
            onClick={onClose}
            className='text-slate-400 hover:text-slate-600 transition-colors'
            aria-label='Close modal'
            disabled={isSaving}
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

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className='flex-1 overflow-y-auto p-4'>
          <div className='space-y-6'>
            {/* Avatar Section */}
            <div className='flex flex-col items-center'>
              <div className='relative'>
                <div className='w-24 h-24 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center'>
                  <img
                    src={avatarPreview || getAvatarUrl()}
                    alt='Avatar preview'
                    className='w-full h-full object-cover'
                  />
                </div>
                {avatarFile && (
                  <button
                    type='button'
                    onClick={handleRemoveAvatar}
                    className='absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-xs'
                    title='Remove new avatar'
                  >
                    ×
                  </button>
                )}
              </div>
              <label className='mt-4 cursor-pointer'>
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleAvatarChange}
                  className='hidden'
                  disabled={isSaving}
                />
                <span className='px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-700 transition-colors inline-block'>
                  {avatarFile ? 'Change Avatar' : 'Upload Avatar'}
                </span>
              </label>
            </div>

            {/* Name Input */}
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-slate-700 mb-2'
              >
                Name
              </label>
              <input
                id='name'
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'
                placeholder='Enter your name'
                disabled={isSaving}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className='p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm'>
                {error}
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className='flex items-center justify-end gap-3 p-4 border-t border-slate-200'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors'
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type='submit'
            onClick={handleSubmit}
            disabled={isSaving || !name.trim()}
            className='px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2'
          >
            {isSaving ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                <span>Saving...</span>
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

