import React, { useState, useEffect } from 'react';
import { useThrottle } from '../../../hooks/useThrottle';
import { api } from '../../../services/api';
import { toast } from 'sonner';
import { useAppSelector } from '../../../store/hooks';
import { selectUser } from '../../../store/selectors/authSelectors';
import { getAvatarUrl } from '@/constants/avatars';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: number) => void;
}

interface SearchedUser {
  id: number;
  username: string;
  email: string;
}

export const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
}) => {
  // Get current user from Redux store
  const currentUser = useAppSelector(selectUser);

  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<SearchedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingConversation, setCreatingConversation] = useState<
    number | null
  >(null);

  // Throttle search input with 300ms delay
  const throttledSearch = useThrottle(searchQuery, 300);


  // Fetch users from API when search query changes
  useEffect(() => {
    const fetchUsers = async () => {
      if (throttledSearch.trim().length < 2) {
        setUsers([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const response = await api.searchUsers(throttledSearch.trim(), 20, 0);
        // Handle both 'users' and 'results' response structures
        const responseData = response as {
          users?: SearchedUser[];
          results?: SearchedUser[];
        };
        setUsers(responseData.users || responseData.results || []);
      } catch (err) {
        console.error('Error searching users:', err);
        setError('Failed to search users. Please try again.');
        setUsers([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchUsers();
  }, [throttledSearch]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setUsers([]);
      setError(null);
      setIsSearching(false);
      setCreatingConversation(null);
    }
  }, [isOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleUserClick = (userId: number) => {
    onSelectUser(userId);
    onClose();
  };

  // Handle creating a new conversation with a user
  // Based on API Integration Guide section 3.1
  const handleCreateConversation = async (
    e: React.MouseEvent<HTMLButtonElement>,
    userId: number,
    username: string
  ) => {
    e.stopPropagation(); // Prevent row click event

    // Validate current user is logged in
    if (!currentUser || !currentUser.id) {
      toast.error('Authentication required', {
        description: 'Please log in to create a conversation.',
      });
      return;
    }

    // Prevent creating conversation with yourself
    if (currentUser.id === userId) {
      toast.error('Invalid action', {
        description: 'You cannot create a conversation with yourself.',
      });
      return;
    }

    // Validate and convert recipient ID to number
    const recipientId = Number(userId);

    if (
      !recipientId ||
      recipientId <= 0 ||
      !Number.isInteger(recipientId) ||
      isNaN(recipientId)
    ) {
      console.error('Invalid recipient ID:', {
        userId,
        recipientId,
        type: typeof userId,
      });
      toast.error('Invalid user', {
        description: 'Please select a valid user to start a conversation.',
      });
      return;
    }

    setCreatingConversation(recipientId);

    try {
      // Create direct conversation - POST /api/v1/conversations/direct
      // Backend expects recipient_id field (lowercase with underscore)
      // Current user ID is automatically extracted from JWT token
      console.log('Creating conversation with recipient_id:', {
        originalUserId: userId,
        convertedRecipientId: recipientId,
        type: typeof recipientId,
        currentUser: currentUser?.id,
      });
      await api.createDirectConversation(recipientId);

      toast.success(`Conversation created with ${username}!`, {
        description: 'You can now start chatting.',
      });

      // Call the onSelectUser callback to handle navigation/refresh
      onSelectUser(userId);

      // Close modal after successful creation
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error creating conversation:', err);

      // Extract error message
      const error = err as {
        response?: { data?: { message?: string; details?: string } };
        message?: string;
      };

      // Get detailed error message if available
      const errorMessage =
        error?.response?.data?.details ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create conversation. Please try again.';

      toast.error('Failed to create conversation', {
        description: errorMessage,
      });
    } finally {
      setCreatingConversation(null);
    }
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
        {/* Modal Header */}
        <div className='flex items-center justify-between p-4 border-b border-slate-200'>
          <h2 className='text-lg font-semibold text-slate-900'>Search Users</h2>
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

        {/* Search Input */}
        <div className='p-4 border-b border-slate-200'>
          <div className='relative'>
            <input
              type='text'
              className='w-full h-10 rounded-lg bg-slate-100 px-3 pl-10 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200'
              placeholder='Search by username or email...'
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
            />
            <div className='absolute left-3 top-1/2 transform -translate-y-1/2'>
              <svg
                className='w-5 h-5 text-slate-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>
            {isSearching && (
              <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500'></div>
              </div>
            )}
          </div>
          {searchQuery.length > 0 && searchQuery.length < 2 && (
            <p className='text-xs text-slate-400 mt-2'>
              Type at least 2 characters to search
            </p>
          )}
        </div>

        {/* User List - Scrollable */}
        <div className='flex-1 overflow-y-auto'>
          {error ? (
            <div className='flex flex-col items-center justify-center py-8 text-center px-4'>
              <div className='w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-3'>
                <svg
                  className='w-8 h-8 text-red-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <p className='text-sm text-red-600 mb-1'>{error}</p>
              <p className='text-xs text-slate-400'>Please try again later</p>
            </div>
          ) : searchQuery.trim().length >= 2 &&
            users.length === 0 &&
            !isSearching ? (
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
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
              </div>
              <p className='text-sm text-slate-500 mb-1'>No users found</p>
              <p className='text-xs text-slate-400'>
                Try searching with different keywords
              </p>
            </div>
          ) : searchQuery.trim().length === 0 ? (
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
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
              </div>
              <p className='text-sm text-slate-500 mb-1'>
                Start typing to search
              </p>
              <p className='text-xs text-slate-400'>
                Search for users by username or email
              </p>
            </div>
          ) : (
            <div className='divide-y divide-slate-100'>
              {users.map((user) => (
                <div
                  key={user.id}
                  className='flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors'
                >
                  <div
                    className='flex items-center gap-3 flex-1 min-w-0 cursor-pointer'
                    onClick={() => handleUserClick(user.id)}
                  >
                    <div className='w-10 h-10 rounded-full bg-slate-200 relative flex-shrink-0'>
                      <img
                        src={getAvatarUrl()}
                        alt={user.username}
                        className='w-full h-full rounded-full object-cover'
                      />
                      <div className='absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-green-500'></div>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-sm text-slate-900 truncate'>
                        {user.username}
                      </p>
                      <p className='text-xs text-slate-500 truncate'>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className='flex-shrink-0'>
                    <button
                      onClick={(e) => {
                        console.log('Button clicked - User data:', {
                          userId: user.id,
                          username: user.username,
                          fullUser: user,
                        });
                        handleCreateConversation(e, user.id, user.username);
                      }}
                      disabled={creatingConversation === user.id}
                      className='px-3 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5'
                      title='Create conversation'
                    >
                      {creatingConversation === user.id ? (
                        <>
                          <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-white'></div>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className='w-3.5 h-3.5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M12 4v16m8-8H4'
                            />
                          </svg>
                          <span>Chat</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
