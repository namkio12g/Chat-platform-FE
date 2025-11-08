// Native WebSocket implementation for Gorilla WebSocket backend
// Backend endpoint: ws://localhost:9090/ws
// Protocol: JSON-based messages with type and payload

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:9090/ws';

type EventHandler = (data: unknown) => void;

interface WebSocketMessage {
  type: string;
  payload: unknown;
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private isConnected = false;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private readonly PING_INTERVAL = 30000; // 30 seconds

  connect() {
    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      console.warn('⚠️ Connection already in progress, skipping...');
      return;
    }

    // If already connected and socket is open, don't reconnect
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      console.warn('⚠️ Already connected, skipping...');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('❌ No access token available for WebSocket connection');
      return;
    }

    // Close existing connection
    if (this.ws) {
      this.ws.close();
    }

    this.isConnecting = true;

    // Build WebSocket URL with token
    const wsUrl = `${WS_BASE_URL}?token=${encodeURIComponent(token)}`;
    console.log('🔌 Connecting to WebSocket:', wsUrl.replace(token, '***'));

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      this.isConnecting = false;
      this.emit('connectionError', {
        message: 'Failed to create WebSocket connection',
        error,
      });
    }
  }

  private setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('✅ WebSocket connected');
      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      // Start ping interval (every 30 seconds)
      this.pingInterval = setInterval(() => {
        if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
          this.send('ping', Date.now());
        }
      }, this.PING_INTERVAL);

      this.emit('connected');
    };

    this.ws.onclose = (event) => {
      console.log('❌ WebSocket disconnected:', event.code, event.reason);
      this.isConnected = false;
      this.isConnecting = false;
      this.cleanup();

      if (event.code !== 1000) {
        // Not a normal closure
        this.emit('disconnected', event.reason || 'Connection closed');
        this.attemptReconnect();
      } else {
        this.emit('disconnected', 'Normal closure');
      }
    };

    this.ws.onerror = (error) => {
      console.error('🔴 WebSocket error:', error);
      this.isConnecting = false;
      this.emit('connectionError', {
        message: 'WebSocket connection error',
        error,
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data) as WebSocketMessage;
        this.handleMessage(response);
      } catch (error) {
        console.error('❌ Failed to parse message:', error, event.data);
      }
    };
  }

  private handleMessage(response: WebSocketMessage) {
    const { type, payload } = response;

    switch (type) {
      case 'server.ack': {
        console.log('✅ Server acknowledgment:', payload);
        const ack = payload as { message?: string; resume_token?: string };
        if (ack.resume_token) {
          localStorage.setItem('resume_token', ack.resume_token);
          console.log('💾 Resume token stored');
        }
        this.emit('serverAck', payload);
        break;
      }

      case 'message.created': {
        console.log('📨 New message received:', payload);
        // Emit newMessage event with the full message payload
        this.emit('newMessage', payload);
        break;
      }

      case 'typing.start':
        console.log(`👤 User ${payload} is typing...`);
        this.emit('userTyping', { userId: payload, typing: true });
        break;

      case 'typing.stop':
        console.log(`👤 User ${payload} stopped typing`);
        this.emit('userTyping', { userId: payload, typing: false });
        break;

      case 'presence.online':
        console.log(`🟢 User ${payload} is online`);
        this.emit('userStatusChange', { userId: payload, status: 'online' });
        break;

      case 'presence.offline':
        console.log(`🔴 User ${payload} is offline`);
        this.emit('userStatusChange', { userId: payload, status: 'offline' });
        break;

      case 'delivery.updated':
        console.log('📬 Delivery receipt updated:', payload);
        this.emit('deliveryUpdated', payload);
        break;

      case 'pong':
        console.log('🏓 Pong received:', payload);
        break;

      case 'error': {
        console.error('❌ Server error:', payload);
        const errorObj = payload as { error?: string; message?: string };
        const isAuthError =
          errorObj.error === 'authentication failed' ||
          errorObj.message?.includes('missing token') ||
          errorObj.message?.includes('authentication failed') ||
          errorObj.message?.toLowerCase().includes('unauthorized');

        if (isAuthError) {
          this.emit('authenticationError', {
            error: errorObj.error || 'authentication failed',
            message:
              errorObj.message || 'Authentication failed. Please login again.',
            originalError: payload,
          });
        } else {
          this.emit('error', payload);
        }
        break;
      }

      case 'notification_received':
        console.log('🔔 New notification:', payload);
        this.emit('newNotification', payload);
        break;

      case 'notification_count': {
        const countData = payload as { unread_count?: number; user_id?: number };
        this.emit('notificationCountUpdate', countData.unread_count || 0);
        break;
      }

      case 'notification_read': {
        console.log('✅ Notification read:', payload);
        this.emit('notificationRead', payload);
        break;
      }

      case 'mark_all_read_success': {
        console.log('✅ All notifications marked as read');
        this.emit('markAllReadSuccess', payload);
        break;
      }

      default:
        console.warn('⚠️ Unknown message type:', type, payload);
    }
  }

  private send(type: string, payload: unknown) {
    if (!this.isConnected || this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket not connected, cannot send message');
      return;
    }

    const message: WebSocketMessage = {
      type,
      payload,
    };

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  }

  // Public methods for sending events
  sendMessage(
    conversationId: number,
    content: string,
    clientId?: string,
    mediaId?: number
  ) {
    const payload: {
      room_id: string;
      message: string;
      client_id?: string;
      media_id?: number;
    } = {
      room_id: `conv-${conversationId}`,
      message: content,
      ...(clientId && { client_id: clientId }),
      ...(mediaId && { media_id: mediaId }),
    };

    console.log('📤 Sending message via WebSocket:', {
      event: 'message.send',
      payload: {
        ...payload,
        message: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      }, // Log truncated
    });

    this.send('message.send', payload);
  }

  joinRoom(conversationId: number) {
    if (!this.isConnected || this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket not connected, cannot join room');
      return;
    }

    const roomId = `conv-${conversationId}`;
    console.log('🚪 Joining room:', roomId);
    this.send('join_room', { room_id: roomId });
  }

  leaveRoom(conversationId: number) {
    if (!this.isConnected || this.ws?.readyState !== WebSocket.OPEN) {
      return;
    }

    const roomId = `conv-${conversationId}`;
    console.log('🚪 Leaving room:', roomId);
    this.send('leave_room', { room_id: roomId });
  }

  startTyping(conversationId: number) {
    if (!this.isConnected || this.ws?.readyState !== WebSocket.OPEN) {
      return;
    }

    const roomId = `conv-${conversationId}`;
    this.send('typing.start', { room_id: roomId });
  }

  stopTyping(conversationId: number) {
    if (!this.isConnected || this.ws?.readyState !== WebSocket.OPEN) {
      return;
    }

    const roomId = `conv-${conversationId}`;
    this.send('typing.stop', { room_id: roomId });
  }

  sendDeliveryReceipt(
    conversationId: number,
    messageId: string,
    status: string
  ) {
    if (!this.isConnected || this.ws?.readyState !== WebSocket.OPEN) {
      return;
    }

    this.send('delivery.receipt', {
      room_id: `conv-${conversationId}`,
      message_id: messageId,
      status,
    });
  }

  resume(resumeToken: string) {
    if (!this.isConnected || this.ws?.readyState !== WebSocket.OPEN) {
      return;
    }

    this.send('resume', { resume_token: resumeToken });
  }

  acknowledgeNotification(notificationId: number) {
    if (!this.isConnected || this.ws?.readyState !== WebSocket.OPEN) {
      return;
    }

    this.send('notification_ack', { notification_id: notificationId });
  }

  requestNotificationCount() {
    if (!this.isConnected || this.ws?.readyState !== WebSocket.OPEN) {
      return;
    }

    this.send('get_notification_count', {});
  }

  // Event emitter pattern
  on(event: string, handler: EventHandler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(handler);
  }

  off(event: string, handler: EventHandler) {
    this.eventHandlers.get(event)?.delete(handler);
  }

  private emit(event: string, data?: unknown) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached', {
        message: 'Max reconnection attempts reached',
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Max 30s

    console.log(
      `🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  disconnect() {
    console.log('🔌 Disconnecting WebSocket...');
    this.cleanup();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.eventHandlers.clear();

    console.log('✅ WebSocket disconnected and cleaned up');
  }

  manualReconnect() {
    console.log('🔄 Manual reconnect requested');
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.cleanup();
    setTimeout(() => {
      this.connect();
    }, 500);
  }

  getConnectionStatus(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  getMaxReconnectAttempts(): number {
    return this.maxReconnectAttempts;
  }
}

// Export singleton instance
export const websocketManager = new WebSocketManager();
export default websocketManager;
