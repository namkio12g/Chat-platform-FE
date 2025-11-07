import React, { useState, useEffect, useCallback } from 'react';
import { useThrottle } from '../../../hooks/useThrottle';
import { UserSearchModal } from './UserSearchModal';
import { api } from '../../../services/api';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { selectUser } from '../../../store/selectors/authSelectors';
import { setCurrentConversation } from '../../../store/slices/chatSlice';
import { getAvatarUrl } from '@/constants/avatars';

const statusSelection = [
  {
    id: 1,
    name: 'All',
  },

  {
    id: 2,
    name: 'Unread',
  },
  {
    id: 3,
    name: 'Read',
  },
];

interface ConversationItem {
  id: number;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  avatarUrl: string;
  type: 'direct' | 'group';
  members?: Array<{
    user_id: number;
    role: string;
    user: {
      id: number;
      username: string;
      avatar_url: string;
    };
  }>;
}

// Format date to "11:24 AM" format
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

export const ThreadList = () => {
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [filteredData, setFilteredData] = useState<ConversationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUser = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

  // Throttle search input with 300ms delay
  const throttledSearch = useThrottle(search, 300);

  // Transform API conversation to component format
  const transformConversation = useCallback(
    (conv: {
      id: number;
      type: 'direct' | 'group';
      name: string | null;
      members: Array<{
        user_id: number;
        role: string;
        user: {
          id: number;
          username: string;
          avatar_url: string;
        };
      }>;
      created_at: string;
    }): ConversationItem => {
      // For direct conversations, get the other user's name
      let displayName = '';
      let avatarUrl = '';
      if (conv.type === 'direct') {
        const otherMember = conv.members.find(
          (m) => m.user_id !== currentUser?.id
        );
        displayName = otherMember?.user?.username || 'Unknown User';
        avatarUrl = otherMember?.user?.avatar_url || '';
      } else {
        // For group conversations, use the name or fallback
        displayName = conv.name || 'Group Chat';
      }

      return {
        id: conv.id,
        name: displayName,
        lastMessage: 'No messages yet', // TODO: Get last message from API when available
        lastMessageTime: formatTime(conv.created_at),
        type: conv.type,
        members: conv.members,
        avatarUrl: avatarUrl,
      };
    },
    [currentUser?.id]
  );

  // Fetch conversations from API
  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getConversations(50, 0);
      if (response.conversations === null) {
        setConversations([]);
        setFilteredData([]);
        return;
      }
      const transformed = response.conversations.map(transformConversation);
      setConversations(transformed);
      setFilteredData(transformed);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Failed to load conversations. Please try again.');
      setConversations([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  }, [transformConversation]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setIsSearching(true);
  };

  const handleStatus = (id: number) => {
    setStatus(id);
  };

  const handleConversationClick = (conversationId: number) => {
    dispatch(setCurrentConversation(conversationId));
  };

  const handleUserSelect = async (userId: number) => {
    try {
      // Create a direct conversation with the selected user
      // Based on API Integration Guide section 3.1
      const conversation = await api.createDirectConversation(userId);
      console.log('Conversation created:', conversation);

      // Refresh the conversation list
      await loadConversations();
    } catch (error) {
      console.error('Failed to create conversation:', error);
      // Error is already handled by UserSearchModal toast
    }
  };

  // Filter conversations based on search
  useEffect(() => {
    if (throttledSearch.trim() === '') {
      setFilteredData(conversations);
    } else {
      setFilteredData(
        conversations.filter((item) =>
          item.name.toLowerCase().includes(throttledSearch.toLowerCase())
        )
      );
    }
    setIsSearching(false);
  }, [throttledSearch, conversations]);
  return (
    <section className='GoChat-thread-list w-80 bg-white border-r border-slate-200 flex flex-col'>
      <div className='p-3 border-b border-slate-200'>
        <input
          className='w-full h-9 rounded-lg bg-slate-100 px-3 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200'
          placeholder='Find or start a new chat'
          value={search}
          onChange={handleSearch}
        />
      </div>
      <div className='message-status-selection py-2 border-b border-slate-200 flex flex-row gap-2 overflow-x-auto relative'>
        {statusSelection.map((item) => (
          <button
            key={item.id}
            className='message-status-button w-full items-center justify-center flex relative'
            onClick={() => handleStatus(item.id)}
          >
            <div
              className={`w-fit px-4 py-1 h-full bg-slate-200 rounded-lg transition-colors duration-200 ${
                status === item.id ? 'bg-blue-500 text-white' : ''
              }`}
            >
              {item.name}
            </div>
          </button>
        ))}
        {/* Sliding indicator line */}
        <div
          className='sliding-indicator'
          style={{
            width: `${100 / statusSelection.length}%`,
            left: `${((status - 1) * 100) / statusSelection.length}%`,
          }}
        />
      </div>
      <div className='flex-1 overflow-y-auto'>
        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500'></div>
            <span className='ml-2 text-sm text-slate-500'>
              Loading conversations...
            </span>
          </div>
        ) : error ? (
          <div className='flex flex-col items-center justify-center py-8 text-center px-4'>
            <div className='w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-3'>
              <svg
                className='w-8 h-8 text-red-400'
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
            <p className='text-sm text-slate-500 mb-1'>{error}</p>
            <button
              onClick={loadConversations}
              className='mt-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
            >
              Retry
            </button>
          </div>
        ) : isSearching ? (
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500'></div>
            <span className='ml-2 text-sm text-slate-500'>Searching...</span>
          </div>
        ) : filteredData.length === 0 && search.trim() !== '' ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
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
              No conversations found
            </p>
            <p className='text-xs text-slate-400'>
              Try searching with different keywords
            </p>
          </div>
        ) : filteredData.length === 0 ? (
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
                  d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                />
              </svg>
            </div>
            <p className='text-sm text-slate-500 mb-1'>No conversations yet</p>
            <p className='text-xs text-slate-400'>
              Start a new chat to begin messaging
            </p>
          </div>
        ) : (
          filteredData.map((item) => (
            <div
              key={item.id}
              className='flex items-start gap-3 px-3 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100'
              onClick={() => handleConversationClick(item.id)}
            >
              <div className='w-10 h-10 rounded-full bg-slate-200 relative flex-shrink-0'>
                <img
                  src={getAvatarUrl(item`.avatarUrl`)}
                  alt={item.name}
                  className='w-full h-full rounded-full object-cover'
                />
                <div className='absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-green-500'></div>
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between'>
                  <p className='font-medium text-sm text-slate-900 truncate'>
                    {item.name}
                  </p>
                  <span className='text-xs text-slate-400 flex-shrink-0 ml-2'>
                    {item.lastMessageTime}
                  </span>
                </div>
                <p className='text-xs text-slate-500 truncate'>
                  {item.lastMessage}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fixed Button at Bottom */}
      <div className='relative border-t border-slate-200 bg-white p-3'>
        <button
          onClick={() => setIsModalOpen(true)}
          className='w-full py-3 px-4 rounded-lg  flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors duration-200'
        >
          <svg
            className='w-5 h-5'
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
          <span>New Chat</span>
        </button>
      </div>

      {/* User Search Modal */}
      <UserSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectUser={handleUserSelect}
      />
    </section>
  );
};
