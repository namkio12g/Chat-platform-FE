import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import {
  selectCurrentConversation,
  selectConversationMessages,
  selectConversationPagination,
  selectConversationDetails,
} from '../../../store/selectors/chatSelectors';
import {
  setConversationMessages,
  prependConversationMessages,
  clearConversationMessages,
  addConversationMessage,
  setConversationDetails,
  setCurrentConversation,
} from '../../../store/slices/chatSlice';
import { api } from '../../../services/api';
import type { ConversationMessage } from '../../../store/slices/chatSlice';
import { selectUser } from '../../../store/selectors/authSelectors';
import websocketManager from '../../../services/websocket';

function Topbar({ conversationId }: { conversationId: number | null }) {
  const currentUser = useAppSelector(selectUser);
  const conversationDetails = useAppSelector(selectConversationDetails);
  const dispatch = useAppDispatch();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());

  // Get conversation details
  const conversation = conversationId
    ? conversationDetails[conversationId]
    : null;

  // Fetch conversation details when conversationId changes
  useEffect(() => {
    if (!conversationId) {
      return;
    }

    // Only fetch if we don't already have the details
    if (conversationDetails[conversationId]) {
      return;
    }

    const fetchConversationDetails = async () => {
      try {
        const details = await api.getConversation(conversationId);
        dispatch(setConversationDetails(details));
      } catch (error) {
        console.error('Failed to fetch conversation details:', error);
      }
    };

    fetchConversationDetails();
  }, [conversationId, conversationDetails, dispatch]);

  // Listen to WebSocket connection status
  useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
      setConnectionError(null);
      setIsReconnecting(false);
    };
    const handleDisconnected = () => {
      setIsConnected(false);
      setIsReconnecting(false);
    };
    const handleConnectionError = (data: unknown) => {
      const error = data as { message?: string };
      setConnectionError(error?.message || 'Connection error');
      setIsReconnecting(true);
    };
    const handleMaxReconnectAttempts = (data: unknown) => {
      const error = data as { message?: string };
      setConnectionError(error?.message || 'Failed to connect');
      setIsReconnecting(false);
    };

    websocketManager.on('connected', handleConnected);
    websocketManager.on('disconnected', handleDisconnected);
    websocketManager.on('connectionError', handleConnectionError);
    websocketManager.on(
      'maxReconnectAttemptsReached',
      handleMaxReconnectAttempts
    );

    // Check initial connection status
    setIsConnected(websocketManager.getConnectionStatus());

    return () => {
      websocketManager.off('connected', handleConnected);
      websocketManager.off('disconnected', handleDisconnected);
      websocketManager.off('connectionError', handleConnectionError);
      websocketManager.off(
        'maxReconnectAttemptsReached',
        handleMaxReconnectAttempts
      );
    };
  }, []);

  // Setup WebSocket listeners for typing status
  useEffect(() => {
    if (!conversationId) {
      setTypingUsers(new Set());
      return;
    }

    const handleUserTyping = (data: unknown) => {
      const payload = data as { userId: number; typing: boolean };
      const userId = payload.userId;

      console.log('⌨️ Received typing event:', {
        userId,
        typing: payload.typing,
        currentUserId: currentUser?.id,
      });

      // Ignore typing events from current user
      if (userId === currentUser?.id) {
        console.log('⌨️ Ignoring own typing event');
        return;
      }

      if (payload.typing) {
        console.log('⌨️ Adding user to typing list:', userId);
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          updated.add(userId);
          console.log('⌨️ Current typing users:', Array.from(updated));
          return updated;
        });
      } else {
        console.log('⌨️ Removing user from typing list:', userId);
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          console.log(
            '⌨️ Current typing users after remove:',
            Array.from(next)
          );
          return next;
        });
      }
    };

    websocketManager.on('userTyping', handleUserTyping);

    return () => {
      websocketManager.off('userTyping', handleUserTyping);
      setTypingUsers(new Set());
    };
  }, [conversationId, currentUser?.id]);

  const handleManualReconnect = () => {
    setConnectionError(null);
    setIsReconnecting(true);
    websocketManager.manualReconnect();
  };

  // Get the conversation name
  const getConversationName = () => {
    if (!conversationId) {
      return 'Select a conversation';
    }

    if (!conversation) {
      return 'Loading...';
    }

    // For direct conversations, get the other user's name from members
    if (conversation.type === 'direct') {
      const otherMember = conversation.members.find(
        (m) => m.user_id !== currentUser?.id
      );
      return otherMember?.user?.username || 'Unknown User';
    }

    // For group conversations, use the name or fallback
    return conversation.name || 'Group Chat';
  };

  // Get typing user names
  const getTypingUserNames = () => {
    if (!conversation || typingUsers.size === 0) return [];

    const typingNames: string[] = [];
    typingUsers.forEach((userId) => {
      if (conversation.type === 'direct') {
        const member = conversation.members.find((m) => m.user_id === userId);
        if (member) {
          typingNames.push(member.user?.username || `User ${userId}`);
        }
      } else {
        // For group chats, find member by user_id
        const member = conversation.members.find((m) => m.user_id === userId);
        if (member) {
          typingNames.push(member.user?.username || `User ${userId}`);
        } else {
          typingNames.push(`User ${userId}`);
        }
      }
    });
    return typingNames;
  };

  return (
    <div className='h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3'>
      <div className='w-8 h-8 rounded-full bg-green-400 relative'>
        {isConnected && (
          <div className='absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-green-500'></div>
        )}
      </div>
      <div className='flex flex-col'>
        <span className='text-sm font-medium'>{getConversationName()}</span>
        {typingUsers.size > 0 ? (
          <div className='text-xs text-slate-500 flex items-center gap-1'>
            <div className='flex gap-0.5'>
              <div className='w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce'></div>
              <div
                className='w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce'
                style={{ animationDelay: '0.15s' }}
              ></div>
              <div
                className='w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce'
                style={{ animationDelay: '0.3s' }}
              ></div>
            </div>
            <span className='italic'>
              {getTypingUserNames().join(', ')}{' '}
              {typingUsers.size === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        ) : (
          <span className='text-xs text-slate-500'>
            {isConnected
              ? 'Online'
              : isReconnecting
              ? 'Reconnecting...'
              : connectionError
              ? 'Disconnected'
              : 'Connecting...'}
          </span>
        )}
        {connectionError && !isReconnecting && (
          <button
            onClick={handleManualReconnect}
            className='text-xs text-blue-500 hover:text-blue-600 mt-0.5 text-left'
            title='Click to reconnect'
          >
            Reconnect
          </button>
        )}
      </div>
      <div className='ml-auto flex items-center gap-3 text-slate-500'>
        <button className='hover:text-slate-700 transition-colors' title='Info'>
          🛈
        </button>
        <button
          className='hover:text-slate-700 transition-colors'
          title='Notifications'
        >
          🔔
        </button>
        <button className='hover:text-slate-700 transition-colors' title='Call'>
          📞
        </button>
        <button
          className='hover:text-slate-700 transition-colors'
          title='More options'
        >
          ⋯
        </button>
      </div>
    </div>
  );
}

interface PendingMessage {
  clientId: string;
  content: string;
  conversationId: number;
  timestamp: number;
  previewUrl?: string;
}

function MessageList({ conversationId }: { conversationId: number | null }) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);
  const messages = useAppSelector(selectConversationMessages);
  const pagination = useAppSelector(selectConversationPagination);
  const conversationDetails = useAppSelector(selectConversationDetails);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const processedMessageIdsRef = useRef<Set<number>>(new Set());
  const pendingMessagesRef = useRef<Map<string, PendingMessage>>(new Map());
  const [pendingUpdate, setPendingUpdate] = useState(0);

  const conversationMessages = conversationId
    ? messages[conversationId] || []
    : [];
  const conversationPagination = conversationId
    ? pagination[conversationId] || { offset: 0, total: 0, hasMore: false }
    : { offset: 0, total: 0, hasMore: false };

  // Get conversation details
  const conversation = conversationId
    ? conversationDetails[conversationId]
    : null;

  // Get display name for sender (using conversation name logic)
  const getSenderDisplayName = (message: ConversationMessage) => {
    if (!conversation) {
      // Fallback to sender username if conversation details not loaded
      return message.sender?.username || `User ${message.sender_id}`;
    }

    // For direct conversations, get the other user's name from members (conversation name)
    if (conversation.type === 'direct') {
      const otherMember = conversation.members.find(
        (m) => m.user_id !== currentUser?.id
      );
      return otherMember?.user?.username || 'Unknown User';
    }

    // For group conversations, show the sender's username
    return message.sender?.username || `User ${message.sender_id}`;
  };

  // Get pending messages for current conversation (use pendingUpdate to trigger re-render)
  const pendingMessages = Array.from(
    pendingMessagesRef.current.values()
  ).filter((p) => p.conversationId === conversationId);

  // Use pendingUpdate to ensure re-render when pending messages change
  void pendingUpdate;

  // Format time for display
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  // Clear processed message IDs and pending messages when conversation changes
  useEffect(() => {
    processedMessageIdsRef.current.clear();
    // Clear pending messages for other conversations
    Array.from(pendingMessagesRef.current.entries()).forEach(
      ([clientId, pending]) => {
        if (pending.conversationId !== conversationId) {
          pendingMessagesRef.current.delete(clientId);
        }
      }
    );
  }, [conversationId]);

  // Expose function to add pending messages
  useEffect(() => {
    // Store the callback in a way that can be called from Composer
    (
      window as unknown as {
        addPendingMessage?: (
          clientId: string,
          content: string,
          conversationId: number,
          previewUrl?: string
        ) => void;
      }
    ).addPendingMessage = (
      clientId: string,
      content: string,
      convId: number,
      previewUrl?: string
    ) => {
      if (convId === conversationId) {
        pendingMessagesRef.current.set(clientId, {
          clientId,
          content,
          conversationId: convId,
          timestamp: Date.now(),
          previewUrl,
        });
        setPendingUpdate((prev) => prev + 1); // Force re-render
      }
    };
    return () => {
      delete (
        window as unknown as {
          addPendingMessage?: (
            clientId: string,
            content: string,
            conversationId: number
          ) => void;
        }
      ).addPendingMessage;
    };
  }, [conversationId]);

  // Helper function to show browser notification
  const showBrowserNotification = useCallback(
    (title: string, body: string, conversationId?: number) => {
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        console.log('🔔 Browser does not support notifications');
        return;
      }

      // Check if permission is granted
      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: conversationId ? `conv-${conversationId}` : undefined,
          requireInteraction: false,
        });

        // Auto-close notification after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        // Handle notification click
        notification.onclick = () => {
          window.focus();
          notification.close();
          // Optionally navigate to conversation if conversationId is provided
          if (conversationId) {
            dispatch(setCurrentConversation(conversationId));
          }
        };
      } else if (Notification.permission === 'default') {
        // Request permission
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            showBrowserNotification(title, body, conversationId);
          }
        });
      }
    },
    [dispatch]
  );

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch((err) => {
        console.error('Failed to request notification permission:', err);
      });
    }
  }, []);

  // Setup WebSocket listeners for incoming messages
  useEffect(() => {
    const handleNewMessage = (data: unknown) => {
      const message = data as ConversationMessage & { client_id?: string };
      console.log('📨 Received new message via WebSocket:', {
        messageId: message.id,
        conversationId: message.conversation_id,
        currentConversationId: conversationId,
        senderId: message.sender_id,
        senderUsername: message.sender?.username,
        content: message.content?.substring(0, 50),
        hasMedia: message.media?.length > 0,
        mediaCount: message.media?.length || 0,
        clientId: message.client_id,
        createdAt: message.created_at,
        fullMessage: message,
      });

      // Check if message is from a different conversation or tab is not active
      const isDifferentConversation =
        message.conversation_id !== conversationId;
      const isTabHidden = document.hidden || !document.hasFocus();

      // Show notification if message is from different conversation or tab is not active
      if (isDifferentConversation || isTabHidden) {
        const senderName =
          message.sender?.username || `User ${message.sender_id}`;
        const messagePreview = message.content
          ? message.content.substring(0, 50)
          : message.media && message.media.length > 0
          ? '📷 Sent an image'
          : 'Sent a message';

        showBrowserNotification(
          senderName,
          messagePreview,
          message.conversation_id
        );
      }

      // Only add message if it belongs to the current conversation
      if (message && message.conversation_id === conversationId) {
        // Deduplication: Check if we've already processed this message
        if (processedMessageIdsRef.current.has(message.id)) {
          console.log('⚠️ Message already processed, skipping:', message.id);
          return;
        }

        console.log('✅ Adding message to conversation:', conversationId);

        // Validate message structure - ensure sender object exists
        const validatedMessage: ConversationMessage = !message.sender
          ? {
              ...message,
              sender: {
                id: message.sender_id,
                username: `User ${message.sender_id}`,
              },
            }
          : message;

        // If this message has a client_id, remove it from pending messages
        if (
          message.client_id &&
          pendingMessagesRef.current.has(message.client_id)
        ) {
          console.log(
            '✅ Message confirmed by server, removing from pending:',
            message.client_id
          );
          const pending = pendingMessagesRef.current.get(message.client_id);
          // Clean up preview URL if it exists
          if (pending?.previewUrl) {
            URL.revokeObjectURL(pending.previewUrl);
          }
          pendingMessagesRef.current.delete(message.client_id);
          setPendingUpdate((prev) => prev + 1); // Force re-render to remove pending message
        }

        // Mark message as processed
        processedMessageIdsRef.current.add(validatedMessage.id);

        // Add message to Redux store
        dispatch(addConversationMessage(validatedMessage));

        // Auto-scroll to bottom when new message arrives
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        console.log('⚠️ Message ignored - different conversation:', {
          messageConversationId: message?.conversation_id,
          currentConversationId: conversationId,
        });
      }
    };

    websocketManager.on('newMessage', handleNewMessage);

    return () => {
      websocketManager.off('newMessage', handleNewMessage);
    };
  }, [conversationId, dispatch, showBrowserNotification]);

  // Setup WebSocket listener for notification_received events
  useEffect(() => {
    const handleNotificationReceived = (data: unknown) => {
      const notification = data as {
        id: number;
        type: string;
        title: string;
        message: string;
        conversation_id?: number;
        message_id?: number;
      };

      console.log('🔔 Notification received:', notification);

      // Show browser notification
      if (notification.title && notification.message) {
        const isTabHidden = document.hidden || !document.hasFocus();
        const isCurrentConversation =
          notification.conversation_id === conversationId;

        // Show notification if tab is hidden or it's not the current conversation
        if (isTabHidden || !isCurrentConversation) {
          showBrowserNotification(
            notification.title,
            notification.message,
            notification.conversation_id
          );
        }
      }
    };

    websocketManager.on('newNotification', handleNotificationReceived);

    return () => {
      websocketManager.off('newNotification', handleNotificationReceived);
    };
  }, [conversationId, showBrowserNotification]);

  // Join/leave room when conversation changes
  useEffect(() => {
    if (!conversationId) {
      return;
    }

    // Join the conversation room
    websocketManager.joinRoom(conversationId);

    return () => {
      // Leave the room when conversation changes
      websocketManager.leaveRoom(conversationId);
    };
  }, [conversationId]);

  // Load initial messages when conversation changes
  useEffect(() => {
    if (!conversationId) {
      return;
    }

    const loadMessages = async () => {
      setIsLoading(true);
      try {
        // Clear previous messages for this conversation
        dispatch(clearConversationMessages(conversationId));

        // Load first 10 messages
        const response = await api.getConversationMessages(
          conversationId,
          10,
          0
        );

        // Track loaded message IDs to prevent duplicates
        response.messages.forEach((msg) => {
          processedMessageIdsRef.current.add(msg.id);
        });

        dispatch(
          setConversationMessages({
            conversationId,
            messages: response.messages,
            total: response.total,
            offset: 0,
          })
        );
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [conversationId, dispatch]);

  // Scroll to bottom when initial messages are loaded or new messages are added
  useEffect(() => {
    if (conversationMessages.length > 0 && messagesEndRef.current) {
      const container = messagesContainerRef.current;
      if (container) {
        // If we just loaded initial messages (offset is 0), scroll to bottom
        const isInitialLoad = conversationPagination.offset === 0;
        if (isInitialLoad) {
          // Use setTimeout to ensure DOM is updated
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
          }, 0);
        } else {
          // Auto-scroll to bottom for new messages if user is near bottom
          const isNearBottom =
            container.scrollHeight -
              container.scrollTop -
              container.clientHeight <
            150;
          if (isNearBottom) {
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 50);
          }
        }
      }
    }
  }, [conversationMessages.length, conversationPagination.offset]);

  // Load more messages when scrolling to top
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || !conversationId || isLoadingMore) {
      return;
    }

    // Check if scrolled to top (within 50px)
    if (container.scrollTop < 50 && conversationPagination.hasMore) {
      setIsLoadingMore(true);
      const currentOffset = conversationPagination.offset;
      const newOffset = currentOffset + 10;

      api
        .getConversationMessages(conversationId, 10, newOffset)
        .then((response) => {
          // Track loaded message IDs to prevent duplicates
          response.messages.forEach((msg) => {
            processedMessageIdsRef.current.add(msg.id);
          });

          // Store scroll position before prepending
          const scrollTop = container.scrollTop;
          const scrollHeight = container.scrollHeight;

          dispatch(
            prependConversationMessages({
              conversationId,
              messages: response.messages,
              total: response.total,
              offset: newOffset,
            })
          );

          // Restore scroll position after prepending (maintain scroll position)
          setTimeout(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight;
              const scrollDiff = newScrollHeight - scrollHeight;
              container.scrollTop = scrollTop + scrollDiff;
            }
          }, 0);
        })
        .catch((error) => {
          console.error('Failed to load more messages:', error);
        })
        .finally(() => {
          setIsLoadingMore(false);
        });
    }
  }, [
    conversationId,
    conversationPagination.hasMore,
    conversationPagination.offset,
    isLoadingMore,
    dispatch,
  ]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  if (!conversationId) {
    return (
      <div className='flex-1 overflow-y-auto bg-sky-50/40 flex items-center justify-center'>
        <div className='text-center text-slate-500'>
          <p className='text-lg font-medium mb-2'>No conversation selected</p>
          <p className='text-sm'>Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex-1 overflow-y-auto bg-sky-50/40 flex items-center justify-center'>
        <div className='text-center text-slate-500'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2'></div>
          <p className='text-sm'>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      className='flex-1 overflow-y-auto bg-sky-50/40 relative'
    >
      {isLoadingMore && (
        <div className='sticky top-0 bg-sky-50/40 py-2 flex justify-center z-10'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500'></div>
        </div>
      )}
      <div className='p-6 space-y-4'>
        {conversationMessages.length === 0 && pendingMessages.length === 0 ? (
          <div className='text-center text-slate-500 py-8'>
            <p className='text-sm'>No messages yet</p>
            <p className='text-xs mt-1'>Start the conversation!</p>
          </div>
        ) : (
          <>
            {/* Render regular messages */}
            {conversationMessages.map((message: ConversationMessage) => {
              const isOwnMessage = message.sender_id === currentUser?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isOwnMessage ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-md rounded-lg p-3 text-sm ${
                      isOwnMessage
                        ? 'bg-sky-500 text-white'
                        : 'bg-white shadow-sm'
                    }`}
                  >
                    {!isOwnMessage && (
                      <div className='text-xs font-medium mb-1 opacity-80'>
                        {getSenderDisplayName(message)}
                      </div>
                    )}
                    {message.content && (
                      <div className='mb-2'>{message.content}</div>
                    )}
                    {message.media && message.media.length > 0 && (
                      <div className='mb-2 space-y-2'>
                        {message.media.map((media) => (
                          <div
                            key={media.id}
                            className='rounded-lg overflow-hidden'
                          >
                            <img
                              src={media.url}
                              alt={media.filename}
                              className='max-w-full max-h-96 object-contain'
                              loading='lazy'
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <div
                      className={`text-xs mt-1 flex items-center gap-1 ${
                        isOwnMessage ? 'text-sky-100' : 'text-slate-500'
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Render pending messages (messages being sent) */}
            {pendingMessages.map((pending) => (
              <div key={pending.clientId} className='flex justify-end'>
                <div className='max-w-md rounded-lg p-3 text-sm bg-sky-500 text-white opacity-70'>
                  {pending.content && pending.content !== '(image)' && (
                    <div className='mb-2'>{pending.content}</div>
                  )}
                  {pending.previewUrl && (
                    <div className='mb-2 rounded-lg overflow-hidden'>
                      <img
                        src={pending.previewUrl}
                        alt='Sending...'
                        className='max-w-full max-h-96 object-contain'
                      />
                    </div>
                  )}
                  <div className='text-xs mt-1 text-sky-100 flex items-center gap-1'>
                    <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-sky-100'></div>
                    <span>Sending...</span>
                  </div>
                </div>
              </div>
            ))}
            git{' '}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

function Composer({ conversationId }: { conversationId: number | null }) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('Image size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate: must have either message or image
    if (!conversationId || (!message.trim() && !selectedFile) || isSending) {
      return;
    }

    const messageContent = message.trim();
    const tempMessage = messageContent;
    const tempFile = selectedFile;
    const tempPreview = previewUrl;
    setMessage('');
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setIsSending(true);
    setUploading(true);

    try {
      // Generate a unique client ID for this message (for deduplication)
      const clientId = `client_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Check WebSocket connection before sending
      if (!websocketManager.getConnectionStatus()) {
        throw new Error('WebSocket not connected. Please wait for connection.');
      }

      let mediaId: number | undefined;

      // Step 1: Upload image if selected
      if (tempFile) {
        try {
          const uploadResult = await api.uploadMedia(tempFile);
          mediaId = uploadResult.media_id;
          console.log('📸 Image uploaded:', uploadResult);
        } catch (uploadError) {
          console.error('❌ Failed to upload image:', uploadError);
          throw new Error('Failed to upload image. Please try again.');
        }
      }

      // Step 2: Send message via WebSocket (with or without media)
      websocketManager.sendMessage(
        conversationId,
        messageContent || '', // Allow empty message if only sending image
        clientId,
        mediaId
      );

      console.log('📤 Message sent:', {
        conversationId,
        content: messageContent || '(image only)',
        clientId,
        mediaId,
      });

      // Add pending message via window function
      const addPending = (
        window as unknown as {
          addPendingMessage?: (
            clientId: string,
            content: string,
            conversationId: number,
            previewUrl?: string
          ) => void;
        }
      ).addPendingMessage;
      if (addPending && conversationId) {
        addPending(
          clientId,
          messageContent || '(image)',
          conversationId,
          tempPreview || undefined
        );
      }

      // The message will be added to Redux when we receive the 'message.created' event
      // from the WebSocket server response
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      // Restore message and file if sending failed
      setMessage(tempMessage);
      setSelectedFile(tempFile);
      setPreviewUrl(tempPreview);

      // Show user-friendly error
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to send message. Please check your connection and try again.';

      alert(errorMessage);
    } finally {
      setIsSending(false);
      setUploading(false);
      // Focus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  // Handle typing status
  const handleTyping = () => {
    if (!conversationId) return;

    // Send typing.start if not already typing
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      console.log('⌨️ Starting to type in conversation:', conversationId);
      websocketManager.startTyping(conversationId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to send typing.stop after 3 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        console.log('⌨️ Stopping typing in conversation:', conversationId);
        websocketManager.stopTyping(conversationId);
      }
    }, 3000);
  };

  // Stop typing when message is sent
  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (isTypingRef.current && conversationId) {
      isTypingRef.current = false;
      websocketManager.stopTyping(conversationId);
    }
  }, [conversationId]);

  // Cleanup typing on unmount
  useEffect(() => {
    return () => {
      stopTyping();
    };
  }, [stopTyping]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      stopTyping();
      handleSend(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    handleTyping();
  };

  const handleInputBlur = () => {
    stopTyping();
  };

  if (!conversationId) {
    return (
      <div className='h-16 bg-white border-t border-slate-200 flex items-center px-4 gap-3'>
        <input
          className='flex-1 h-10 rounded-full bg-slate-100 px-4 outline-none'
          placeholder='Select a conversation to start messaging'
          disabled
        />
      </div>
    );
  }

  const isConnected = websocketManager.getConnectionStatus();

  return (
    <div className='bg-white border-t border-slate-200'>
      {/* Image Preview */}
      {previewUrl && (
        <div className='px-4 pt-3 pb-2 relative'>
          <div className='relative inline-block'>
            <img
              src={previewUrl}
              alt='Preview'
              className='max-w-xs max-h-48 rounded-lg object-contain'
            />
            <button
              type='button'
              onClick={handleRemoveImage}
              className='absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center text-xs'
              title='Remove image'
            >
              ×
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSend} className='h-16 flex items-center px-4 gap-3'>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleFileSelect}
          className='hidden'
        />
        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          className='w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center'
          title='Add image'
          disabled={isSending || !isConnected}
        >
          <span className='text-lg'>📷</span>
        </button>
        <input
          ref={inputRef}
          type='text'
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onBlur={handleInputBlur}
          className='flex-1 h-10 rounded-full bg-slate-100 px-4 outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all'
          placeholder={
            isConnected
              ? selectedFile
                ? 'Add a caption (optional)...'
                : 'Type a message...'
              : 'Connecting...'
          }
          disabled={!isConnected || isSending}
        />
        <button
          type='submit'
          disabled={
            (!message.trim() && !selectedFile) || isSending || !isConnected
          }
          className='px-4 h-10 rounded-full bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2'
        >
          {uploading ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
              <span>Uploading...</span>
            </>
          ) : isSending ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
              <span>Sending...</span>
            </>
          ) : (
            'Send'
          )}
        </button>
      </form>
    </div>
  );
}

export function Conversation() {
  const conversationId = useAppSelector(selectCurrentConversation);
  const currentUser = useAppSelector(selectUser);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const hasConnectedRef = useRef(false); // Prevent multiple connection attempts

  // Initialize WebSocket connection when component mounts
  useEffect(() => {
    if (currentUser && !hasConnectedRef.current) {
      hasConnectedRef.current = true; // Mark as connected
      // Listen for connection errors
      const handleMaxReconnectAttempts = (data: unknown) => {
        const error = data as { message?: string };
        setConnectionError(
          error?.message ||
            'Failed to connect to WebSocket server. Please ensure the backend server is running on port 9090.'
        );
      };

      // Listen for authentication errors (backend emits 'error' event for auth failures)
      const handleAuthenticationError = (data: unknown) => {
        const error = data as { message?: string; error?: string };
        console.error('🔐 WebSocket authentication failed:', error);
        setIsAuthError(true);
        setConnectionError(
          error?.message ||
            'Authentication failed. Please login again to continue using real-time features.'
        );
        // Note: In a real app, you might want to:
        // - Redirect to login page
        // - Clear auth tokens
        // - Refresh token and reconnect
        // For now, we just show the error message
      };

      // Listen for server acknowledgment
      const handleServerAck = (data: unknown) => {
        const ack = data as { message?: string; resume_token?: string };
        console.log('✅ Server welcome:', ack.message);
        // Connection successful, clear any errors
        setConnectionError(null);
        setIsAuthError(false);
      };

      websocketManager.on(
        'maxReconnectAttemptsReached',
        handleMaxReconnectAttempts
      );
      websocketManager.on('authenticationError', handleAuthenticationError);
      websocketManager.on('serverAck', handleServerAck);
      websocketManager.connect();

      return () => {
        websocketManager.off(
          'maxReconnectAttemptsReached',
          handleMaxReconnectAttempts
        );
        websocketManager.off('authenticationError', handleAuthenticationError);
        websocketManager.off('serverAck', handleServerAck);
      };
    }

    return () => {
      // Cleanup: disconnect WebSocket when component unmounts
      // Note: In a real app, you might want to keep the connection alive
      // and only disconnect on logout
      hasConnectedRef.current = false; // Reset on unmount
    };
  }, [currentUser]);

  return (
    <section className='flex-1 flex flex-col'>
      {connectionError && (
        <div
          className={`border-b px-4 py-2 flex items-center justify-between ${
            isAuthError
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className='flex items-center gap-2'>
            <span
              className={`text-sm ${
                isAuthError ? 'text-yellow-800' : 'text-red-600'
              }`}
            >
              {isAuthError ? '🔐' : '⚠️'} {connectionError}
            </span>
          </div>
          {!isAuthError && (
            <button
              onClick={() => {
                setConnectionError(null);
                setIsAuthError(false);
                websocketManager.manualReconnect();
              }}
              className='text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors'
            >
              Retry
            </button>
          )}
          {isAuthError && (
            <button
              onClick={() => {
                // In a real app, redirect to login or refresh token
                // For now, just clear the error
                setConnectionError(null);
                setIsAuthError(false);
                // Example: window.location.href = '/login';
              }}
              className='text-xs px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors'
            >
              Login
            </button>
          )}
        </div>
      )}
      <Topbar conversationId={conversationId} />
      <MessageList conversationId={conversationId} />
      <Composer conversationId={conversationId} />
    </section>
  );
}
