# ChatterGo Backend - API Integration Guide

## 📋 **TỔNG HỢP API CHATTERGO - BACKEND**

### **🔗 Base URL:** `http://localhost:9090`

---

## **1. 🔐 AUTHENTICATION APIs**

### **1.1 Đăng ký tài khoản**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```
**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "is_active": true
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### **1.2 Đăng nhập**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### **1.3 Refresh Token**
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### **1.4 Đăng xuất**
```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

---

## **2. 👤 USER APIs**

### **2.1 Lấy thông tin user theo ID**
```http
GET /api/v1/users/{id}
```

### **2.2 Lấy thông tin user theo email**
```http
GET /api/v1/users?email=user@example.com
```

### **2.3 Lấy profile của user hiện tại**
```http
GET /api/v1/users/profile
Authorization: Bearer <access_token>
```

### **2.4 Cập nhật profile**
```http
PATCH /api/v1/users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "username": "new_username",
  "email": "new_email@example.com"
}
```

---

## **3. 💬 CONVERSATION APIs**

### **3.1 Tạo cuộc trò chuyện trực tiếp**
```http
POST /api/v1/conversations/direct
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "participant_id": 2
}
```

### **3.2 Tạo cuộc trò chuyện nhóm**
```http
POST /api/v1/conversations/group
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Nhóm chat ABC",
  "participant_ids": [2, 3, 4]
}
```

### **3.3 Lấy danh sách cuộc trò chuyện**
```http
GET /api/v1/conversations?limit=20&offset=0
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "conversations": [
    {
      "id": 1,
      "type": "direct",
      "name": null,
      "members": [
        {
          "user_id": 1,
          "role": "member",
          "user": {
            "id": 1,
            "username": "alice"
          }
        }
      ],
      "created_at": "2025-11-05T16:30:00Z"
    }
  ],
  "total": 1
}
```

### **3.4 Lấy thông tin cuộc trò chuyện**
```http
GET /api/v1/conversations/{id}
Authorization: Bearer <access_token>
```

---

## **4. 📨 MESSAGE APIs**

### **4.1 Gửi tin nhắn**
```http
POST /api/v1/conversations/{id}/messages
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "Hello everyone!"
}
```

**Response:**
```json
{
  "id": 1,
  "conversation_id": 1,
  "sender_id": 1,
  "content": "Hello everyone!",
  "created_at": "2025-11-05T16:30:00Z",
  "sender": {
    "id": 1,
    "username": "alice"
  },
  "media": []
}
```

### **4.2 Lấy tin nhắn trong cuộc trò chuyện**
```http
GET /api/v1/conversations/{id}/messages?limit=50&offset=0
Authorization: Bearer <access_token>
```

### **4.3 Cập nhật tin nhắn**
```http
PATCH /api/v1/messages/{id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "Updated message content"
}
```

### **4.4 Xóa tin nhắn**
```http
DELETE /api/v1/messages/{id}
Authorization: Bearer <access_token>
```

---

## **5. 📎 MEDIA APIs (File Upload)**

### **5.1 Tạo presigned URL**
```http
POST /api/v1/media/presign
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "filename": "image.jpg",
  "mime_type": "image/jpeg",
  "size": 1048576
}
```

**Response:**
```json
{
  "upload_url": "http://localhost:9090/api/v1/media/upload?media_id=...",
  "media_id": "1699123456_abc123def.jpg",
  "expires_at": 1699124356
}
```

### **5.2 Upload file trực tiếp**
```http
POST /api/v1/media/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- file: [SELECT FILE]
- message_id: 1 (optional)
```

**Response:**
```json
{
  "media_id": 1,
  "url": "http://localhost:9090/uploads/1699123456_abc123def.jpg",
  "filename": "image.jpg",
  "mime_type": "image/jpeg",
  "size": 1048576
}
```

### **5.3 Lấy thông tin media**
```http
GET /api/v1/media/{id}
Authorization: Bearer <access_token>
```

### **5.4 Xóa media**
```http
DELETE /api/v1/media/{id}
Authorization: Bearer <access_token>
```

### **5.5 Truy cập file đã upload**
```http
GET /uploads/{filename}
# Public access, không cần authorization
```

---

## **6. 🔔 NOTIFICATION APIs**

### **6.1 Lấy danh sách thông báo**
```http
GET /api/v1/notifications?limit=20&offset=0
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "notifications": [
    {
      "id": 1,
      "user_id": 2,
      "type": "message",
      "title": "Tin nhắn mới từ Alice",
      "message": "Hello there!",
      "data": "{\"conversation_id\":1,\"sender_name\":\"Alice\"}",
      "status": "unread",
      "conversation_id": 1,
      "message_id": 5,
      "created_at": "2025-11-05T16:30:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

### **6.2 Lấy thông báo chưa đọc**
```http
GET /api/v1/notifications/unread
Authorization: Bearer <access_token>
```

### **6.3 Đánh dấu thông báo đã đọc**
```http
PATCH /api/v1/notifications/{id}/read
Authorization: Bearer <access_token>
```

### **6.4 Đánh dấu tất cả đã đọc**
```http
PATCH /api/v1/notifications/read-all
Authorization: Bearer <access_token>
```

### **6.5 Lấy cài đặt thông báo**
```http
GET /api/v1/notifications/preferences
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "message_notifications": true,
  "mention_notifications": true,
  "conversation_notifications": true,
  "system_notifications": true,
  "email_notifications": false,
  "push_notifications": true,
  "do_not_disturb": false,
  "do_not_disturb_start": null,
  "do_not_disturb_end": null
}
```

### **6.6 Cập nhật cài đặt thông báo**
```http
PATCH /api/v1/notifications/preferences
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "message_notifications": false,
  "do_not_disturb": true,
  "do_not_disturb_start": "22:00",
  "do_not_disturb_end": "06:00"
}
```

---

## **7. 🔍 SEARCH APIs**

### **7.1 Tìm kiếm tổng hợp**
```http
GET /api/v1/search?q=keyword&type=all&limit=20&offset=0
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "query": "keyword",
  "type": "all",
  "results": {
    "users": [
      {
        "id": 1,
        "username": "alice",
        "email": "alice@example.com"
      }
    ],
    "messages": [
      {
        "id": 5,
        "conversation_id": 1,
        "content": "This message contains the keyword",
        "sender": {
          "username": "alice"
        }
      }
    ],
    "conversations": [
      {
        "id": 1,
        "name": "Keyword Discussion",
        "type": "group"
      }
    ]
  },
  "limit": 20,
  "offset": 0
}
```

### **7.2 Tìm kiếm user**
```http
GET /api/v1/search/users?q=alice&limit=10&offset=0
Authorization: Bearer <access_token>
```

### **7.3 Tìm kiếm tin nhắn**
```http
GET /api/v1/search/messages?q=hello&conversation_id=1&limit=10&offset=0
Authorization: Bearer <access_token>
```

---

## **8. 🌐 WEBSOCKET Integration**

### **8.1 Kết nối WebSocket**
```javascript
const socket = io('ws://localhost:9090', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### **8.2 WebSocket Events**

#### **Tin nhắn:**
```javascript
// Gửi tin nhắn
socket.emit('message_send', {
  room_id: 'conversation_1',
  message: 'Hello everyone!'
});

// Nhận tin nhắn mới
socket.on('message_created', (message) => {
  console.log('New message:', message);
});

// Typing indicators
socket.emit('typing_start', { room_id: 'conversation_1' });
socket.emit('typing_stop', { room_id: 'conversation_1' });

socket.on('typing_start', (userId) => {
  console.log(`User ${userId} is typing...`);
});
```

#### **Thông báo:**
```javascript
// Nhận thông báo mới
socket.on('notification_received', (notification) => {
  console.log('New notification:', notification);
  showNotificationToUser(notification);
});

// Cập nhật số lượng thông báo chưa đọc
socket.on('notification_count', (data) => {
  updateNotificationBadge(data.unread_count);
});

// Xác nhận đã đọc thông báo
socket.emit('notification_ack', {
  notification_id: 123
});

// Lấy số lượng thông báo chưa đọc
socket.emit('get_notification_count');
```

#### **Presence (Online/Offline):**
```javascript
// Join room
socket.emit('join_room', { room_id: 'conversation_1' });

// Leave room
socket.emit('leave_room', { room_id: 'conversation_1' });

// User online/offline events
socket.on('user_online', (userId) => {
  updateUserStatus(userId, 'online');
});

socket.on('user_offline', (userId) => {
  updateUserStatus(userId, 'offline');
});
```

---

## **9. 🔧 UTILITY APIs**

### **9.1 Health Check**
```http
GET /ping
```

**Response:**
```json
{
  "ok": true
}
```

### **9.2 API Documentation**
```http
GET /swagger/index.html
# Swagger UI documentation
```

---

## **10. 📱 FRONTEND INTEGRATION GUIDE**

### **10.1 Authentication Service**
```javascript
class AuthService {
  async register(email, username, password) {
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password })
    });
    
    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    return data;
  }

  async login(email, password) {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    return data;
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }
    return data;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}
```

### **10.2 API Client**
```javascript
class ApiClient {
  constructor(baseUrl = 'http://localhost:9090') {
    this.baseUrl = baseUrl;
    this.authService = new AuthService();
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: this.authService.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Token expired, try refresh
        await this.authService.refreshToken();
        // Retry request with new token
        config.headers = this.authService.getAuthHeaders();
        const retryResponse = await fetch(url, config);
        return this.handleResponse(retryResponse);
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Conversations
  async getConversations(limit = 20, offset = 0) {
    return this.request(`/api/v1/conversations?limit=${limit}&offset=${offset}`);
  }

  async getConversation(conversationId) {
    return this.request(`/api/v1/conversations/${conversationId}`);
  }

  async createDirectConversation(participantId) {
    return this.request('/api/v1/conversations/direct', {
      method: 'POST',
      body: JSON.stringify({ participant_id: participantId })
    });
  }

  async createGroupConversation(name, participantIds) {
    return this.request('/api/v1/conversations/group', {
      method: 'POST',
      body: JSON.stringify({ name, participant_ids: participantIds })
    });
  }

  // Messages
  async getMessages(conversationId, limit = 50, offset = 0) {
    return this.request(`/api/v1/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`);
  }

  async sendMessage(conversationId, content) {
    return this.request(`/api/v1/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }

  async updateMessage(messageId, content) {
    return this.request(`/api/v1/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content })
    });
  }

  async deleteMessage(messageId) {
    return this.request(`/api/v1/messages/${messageId}`, {
      method: 'DELETE'
    });
  }

  // Search
  async search(query, type = 'all', limit = 20, offset = 0) {
    const params = new URLSearchParams({
      q: query,
      type,
      limit: limit.toString(),
      offset: offset.toString()
    });
    return this.request(`/api/v1/search?${params}`);
  }

  async searchUsers(query, limit = 20, offset = 0) {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      offset: offset.toString()
    });
    return this.request(`/api/v1/search/users?${params}`);
  }

  async searchMessages(query, conversationId = null, limit = 20, offset = 0) {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      offset: offset.toString()
    });
    if (conversationId) {
      params.append('conversation_id', conversationId.toString());
    }
    return this.request(`/api/v1/search/messages?${params}`);
  }

  // Notifications
  async getNotifications(limit = 20, offset = 0) {
    return this.request(`/api/v1/notifications?limit=${limit}&offset=${offset}`);
  }

  async getUnreadNotifications() {
    return this.request('/api/v1/notifications/unread');
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/api/v1/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/api/v1/notifications/read-all', {
      method: 'PATCH'
    });
  }

  async getNotificationPreferences() {
    return this.request('/api/v1/notifications/preferences');
  }

  async updateNotificationPreferences(preferences) {
    return this.request('/api/v1/notifications/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences)
    });
  }

  // Users
  async getUserProfile() {
    return this.request('/api/v1/users/profile');
  }

  async updateUserProfile(updates) {
    return this.request('/api/v1/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async getUser(userId) {
    return this.request(`/api/v1/users/${userId}`);
  }
}
```

### **10.3 WebSocket Manager**
```javascript
class WebSocketManager {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.socket = null;
    this.eventHandlers = {};
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token available for WebSocket connection');
      return;
    }

    this.socket = io('ws://localhost:9090', {
      auth: { token },
      transports: ['websocket'],
      upgrade: true
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', reason);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.handleReconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.emit('connectionError', error);
      this.handleReconnection();
    });

    // Message events
    this.socket.on('message_created', (message) => {
      this.emit('newMessage', message);
    });

    this.socket.on('message_updated', (message) => {
      this.emit('messageUpdated', message);
    });

    this.socket.on('message_deleted', (messageId) => {
      this.emit('messageDeleted', messageId);
    });

    // Notification events
    this.socket.on('notification_received', (notification) => {
      this.emit('newNotification', notification);
    });

    this.socket.on('notification_read', (data) => {
      this.emit('notificationRead', data);
    });

    this.socket.on('notification_count', (data) => {
      this.emit('notificationCountUpdate', data.unread_count);
    });

    // Typing events
    this.socket.on('typing_start', (data) => {
      this.emit('userTyping', { userId: data.user_id, typing: true, conversationId: data.conversation_id });
    });

    this.socket.on('typing_stop', (data) => {
      this.emit('userTyping', { userId: data.user_id, typing: false, conversationId: data.conversation_id });
    });

    // Presence events
    this.socket.on('user_online', (userId) => {
      this.emit('userStatusChange', { userId, status: 'online' });
    });

    this.socket.on('user_offline', (userId) => {
      this.emit('userStatusChange', { userId, status: 'offline' });
    });

    // Error events
    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });
  }

  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  // Event emitter pattern
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  off(event, handler) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
    }
  }

  emit(event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }
  }

  // Send events
  sendMessage(roomId, message) {
    if (this.isConnected) {
      this.socket.emit('message_send', { room_id: roomId, message });
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  joinRoom(roomId) {
    if (this.isConnected) {
      this.socket.emit('join_room', { room_id: roomId });
    }
  }

  leaveRoom(roomId) {
    if (this.isConnected) {
      this.socket.emit('leave_room', { room_id: roomId });
    }
  }

  startTyping(roomId) {
    if (this.isConnected) {
      this.socket.emit('typing_start', { room_id: roomId });
    }
  }

  stopTyping(roomId) {
    if (this.isConnected) {
      this.socket.emit('typing_stop', { room_id: roomId });
    }
  }

  acknowledgeNotification(notificationId) {
    if (this.isConnected) {
      this.socket.emit('notification_ack', { notification_id: notificationId });
    }
  }

  requestNotificationCount() {
    if (this.isConnected) {
      this.socket.emit('get_notification_count');
    }
  }

  markAllNotificationsAsRead() {
    if (this.isConnected) {
      this.socket.emit('mark_all_read');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}
```

### **10.4 File Upload Service**
```javascript
class FileUploadService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  async uploadFile(file, messageId = null, onProgress = null) {
    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(`File size ${this.formatFileSize(file.size)} exceeds maximum allowed size ${this.formatFileSize(maxSize)}`);
    }

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain',
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }

    // Direct upload method
    const formData = new FormData();
    formData.append('file', file);
    if (messageId) {
      formData.append('message_id', messageId);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was aborted'));
      });

      const token = localStorage.getItem('access_token');
      xhr.open('POST', '/api/v1/media/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  }

  async uploadWithPresign(file, onProgress = null) {
    // Get presigned URL
    const presignResponse = await this.apiClient.request('/api/v1/media/presign', {
      method: 'POST',
      body: JSON.stringify({
        filename: file.name,
        mime_type: file.type,
        size: file.size
      })
    });

    // Upload to presigned URL
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      const token = localStorage.getItem('access_token');
      xhr.open('POST', presignResponse.upload_url);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType === 'text/plain') return '📄';
    return '📎';
  }
}
```

### **10.5 Complete Integration Example**
```javascript
class ChatterGoApp {
  constructor() {
    this.authService = new AuthService();
    this.apiClient = new ApiClient();
    this.wsManager = new WebSocketManager(this.apiClient);
    this.fileUploadService = new FileUploadService(this.apiClient);
    
    this.currentUser = null;
    this.currentConversation = null;
    this.conversations = [];
    this.messages = [];
    this.notifications = [];
    
    this.init();
  }

  async init() {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        this.currentUser = await this.apiClient.getUserProfile();
        this.setupWebSocket();
        this.loadInitialData();
      } catch (error) {
        console.error('Failed to load user profile:', error);
        this.authService.logout();
      }
    }

    this.setupEventListeners();
  }

  setupWebSocket() {
    this.wsManager.connect();

    // Handle WebSocket events
    this.wsManager.on('newMessage', (message) => {
      this.handleNewMessage(message);
    });

    this.wsManager.on('newNotification', (notification) => {
      this.handleNewNotification(notification);
    });

    this.wsManager.on('notificationCountUpdate', (count) => {
      this.updateNotificationBadge(count);
    });

    this.wsManager.on('userTyping', (data) => {
      this.handleTypingIndicator(data);
    });
  }

  setupEventListeners() {
    // Login form
    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      try {
        const result = await this.authService.login(
          formData.get('email'),
          formData.get('password')
        );
        
        this.currentUser = result.user;
        this.setupWebSocket();
        this.loadInitialData();
        this.showChatInterface();
      } catch (error) {
        this.showError('Login failed: ' + error.message);
      }
    });

    // Send message form
    document.getElementById('messageForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const messageInput = document.getElementById('messageInput');
      const content = messageInput.value.trim();
      
      if (content && this.currentConversation) {
        try {
          await this.apiClient.sendMessage(this.currentConversation.id, content);
          messageInput.value = '';
        } catch (error) {
          this.showError('Failed to send message: ' + error.message);
        }
      }
    });

    // File upload
    document.getElementById('fileInput')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const result = await this.fileUploadService.uploadFile(file, null, (progress) => {
            this.updateUploadProgress(progress);
          });
          
          // Send message with file attachment
          const content = `📎 ${file.name}`;
          await this.apiClient.sendMessage(this.currentConversation.id, content);
        } catch (error) {
          this.showError('File upload failed: ' + error.message);
        }
      }
    });

    // Search
    document.getElementById('searchInput')?.addEventListener('input', 
      this.debounce(async (e) => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
          try {
            const results = await this.apiClient.search(query);
            this.displaySearchResults(results);
          } catch (error) {
            console.error('Search failed:', error);
          }
        }
      }, 300)
    );
  }

  async loadInitialData() {
    try {
      // Load conversations
      const conversationsData = await this.apiClient.getConversations();
      this.conversations = conversationsData.conversations;
      this.displayConversations();

      // Load notifications
      const notificationsData = await this.apiClient.getUnreadNotifications();
      this.notifications = notificationsData.notifications;
      this.updateNotificationBadge(notificationsData.count);

      // Request notification count via WebSocket
      this.wsManager.requestNotificationCount();
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }

  handleNewMessage(message) {
    if (this.currentConversation && message.conversation_id === this.currentConversation.id) {
      this.messages.push(message);
      this.displayMessage(message);
      this.scrollToBottom();
    }

    // Update conversation list
    this.updateConversationLastMessage(message);
  }

  handleNewNotification(notification) {
    this.notifications.unshift(notification);
    this.displayNotification(notification);
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  }

  // Utility methods
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  showError(message) {
    // Implement error display logic
    console.error(message);
  }

  // UI update methods would go here...
  displayConversations() { /* Implementation */ }
  displayMessage(message) { /* Implementation */ }
  displaySearchResults(results) { /* Implementation */ }
  updateNotificationBadge(count) { /* Implementation */ }
  // ... etc
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  window.chatterGoApp = new ChatterGoApp();
});
```

---

## **11. 🎯 INTEGRATION CHECKLIST**

### **Frontend cần implement:**

#### **✅ Authentication:**
- [ ] Login/Register forms
- [ ] Token management (access + refresh)
- [ ] Auto-refresh expired tokens
- [ ] Logout functionality
- [ ] Protected routes

#### **✅ Chat Interface:**
- [ ] Conversation list với real-time updates
- [ ] Message display với sender info và timestamps
- [ ] Send message form với validation
- [ ] File upload interface với progress indicator
- [ ] Typing indicators
- [ ] Online/offline status indicators
- [ ] Message pagination (load more)

#### **✅ Notifications:**
- [ ] Notification badge/counter
- [ ] Notification dropdown/panel
- [ ] Mark as read functionality
- [ ] Notification settings page
- [ ] Real-time notification display
- [ ] Browser notifications (với permission)
- [ ] Do Not Disturb settings

#### **✅ Search:**
- [ ] Search input với debouncing
- [ ] Search results display (users, messages, conversations)
- [ ] Filter by type dropdown
- [ ] Pagination for search results
- [ ] Search history/suggestions
- [ ] Highlight search terms in results

#### **✅ WebSocket:**
- [ ] Connection management
- [ ] Event listeners setup
- [ ] Reconnection logic với exponential backoff
- [ ] Error handling và user feedback
- [ ] Connection status indicator

#### **✅ File Handling:**
- [ ] File picker/drag-drop interface
- [ ] Upload progress indicator
- [ ] File preview (images)
- [ ] File type icons
- [ ] File size validation
- [ ] Multiple file upload support

#### **✅ UI/UX:**
- [ ] Responsive design
- [ ] Loading states
- [ ] Error messages
- [ ] Empty states
- [ ] Infinite scroll for messages
- [ ] Message status indicators (sent, delivered, read)

---

## **12. 🔒 SECURITY & ERROR HANDLING**

### **Headers cần thiết:**
```javascript
const headers = {
  'Authorization': `Bearer ${access_token}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};
```

### **Error Handling Pattern:**
```javascript
async function handleApiResponse(response) {
  if (response.status === 401) {
    // Token expired, redirect to login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
    return;
  }
  
  if (response.status === 403) {
    throw new Error('Access denied');
  }
  
  if (response.status >= 500) {
    throw new Error('Server error. Please try again later.');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
}
```

### **Input Validation:**
```javascript
function validateMessage(content) {
  if (!content || content.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }
  
  if (content.length > 1000) {
    throw new Error('Message too long (max 1000 characters)');
  }
  
  return content.trim();
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  return email;
}
```

### **Rate Limiting:**
```javascript
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.requests = [];
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}
```

---

## **13. 🚀 DEPLOYMENT NOTES**

### **Environment Variables:**
```javascript
const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:9090',
  WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:9090',
  MAX_FILE_SIZE: process.env.REACT_APP_MAX_FILE_SIZE || 10485760, // 10MB
  ENABLE_NOTIFICATIONS: process.env.REACT_APP_ENABLE_NOTIFICATIONS !== 'false'
};
```

### **Production Considerations:**
- **HTTPS**: Sử dụng HTTPS cho production
- **WSS**: WebSocket Secure cho production
- **CDN**: Serve static files qua CDN
- **Caching**: Implement proper caching strategies
- **Error Tracking**: Integrate với Sentry hoặc similar
- **Analytics**: Track user interactions
- **Performance**: Code splitting và lazy loading

---

## **14. 📞 SUPPORT & TROUBLESHOOTING**

### **Common Issues:**

#### **401 Unauthorized:**
- Check JWT token validity
- Ensure proper Authorization header format
- Verify token hasn't expired

#### **CORS Errors:**
- Backend đã cấu hình CORS cho localhost:3000, 5173, 8080
- Kiểm tra Origin header

#### **WebSocket Connection Failed:**
- Verify JWT token
- Check network connectivity
- Ensure WebSocket server is running

#### **File Upload Failed:**
- Check file size limits (10MB)
- Verify file type is allowed
- Ensure proper form-data encoding

### **Debug Tools:**
```javascript
// Enable debug logging
localStorage.setItem('debug', 'chattergo:*');

// WebSocket debug
socket.on('connect', () => console.log('WS Connected'));
socket.on('disconnect', (reason) => console.log('WS Disconnected:', reason));
socket.on('error', (error) => console.error('WS Error:', error));
```

---

Đây là tài liệu integration hoàn chỉnh cho ChatterGo Backend API. Sử dụng tài liệu này để implement frontend một cách hiệu quả và đầy đủ! 🎉
