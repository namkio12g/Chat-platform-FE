# Frontend WebSocket Updates - Backend Integration

## 📋 Summary

Updated the frontend WebSocket implementation to align with backend changes made on 2025-11-08. The backend now uses a different authentication flow that prevents 403 errors during connection upgrades.

---

## ✅ Changes Made

### 1. **Token Authentication - Multiple Locations**

**Updated:** `src/services/websocket.ts` - `connect()` method

**Changes:**

- Now sends token in **both** `auth.token` AND `query.token`
- Backend checks multiple locations (query.token, query.auth.token, Authorization header)
- Sending in query string is most reliable per backend documentation

**Before:**

```typescript
this.socket = io(WS_BASE_URL, {
  auth: {
    token,
  },
  transports: ['websocket'],
  // ...
});
```

**After:**

```typescript
this.socket = io(WS_BASE_URL, {
  auth: {
    token,
  },
  query: {
    token, // Also send in query string (most reliable)
  },
  transports: ['polling', 'websocket'], // Allow fallback
  // ...
});
```

---

### 2. **Transport Fallback Added**

**Updated:** `src/services/websocket.ts` - `connect()` method

**Changes:**

- Changed from `transports: ['websocket']` to `transports: ['polling', 'websocket']`
- Allows fallback to polling if WebSocket upgrade fails
- Prevents connection failures in restrictive network environments

---

### 3. **Authentication Error Handling**

**Updated:** `src/services/websocket.ts` - `setupEventListeners()` method

**Changes:**

- Added specific handling for `error` events from backend
- Detects authentication failures vs other errors
- Emits `authenticationError` event for auth failures
- Does NOT auto-reconnect on auth errors (user needs to login)

**New Code:**

```typescript
this.socket.on('error', (error) => {
  const errorObj = error as { error?: string; message?: string };
  const isAuthError =
    errorObj.error === 'authentication failed' ||
    errorObj.message?.includes('missing token') ||
    errorObj.message?.includes('authentication failed') ||
    errorObj.message?.toLowerCase().includes('unauthorized');

  if (isAuthError) {
    this.emit('authenticationError', {
      error: errorObj.error || 'authentication failed',
      message: errorObj.message || 'Authentication failed. Please login again.',
      originalError: error,
    });
    // Don't reconnect on auth errors
    return;
  }

  // Emit general error for other error types
  this.emit('error', error);
});
```

---

### 4. **Server Acknowledgment Handler**

**Updated:** `src/services/websocket.ts` - `setupEventListeners()` method

**Changes:**

- Added listener for `server.ack` event
- Stores `resume_token` if provided by backend
- Logs welcome message from server

**New Code:**

```typescript
this.socket.on(
  'server.ack',
  (data: { message?: string; resume_token?: string }) => {
    console.log('✅ Server acknowledgment:', data.message);
    if (data.resume_token) {
      localStorage.setItem('resume_token', data.resume_token);
      console.log('💾 Resume token stored');
    }
    this.emit('serverAck', data);
  }
);
```

---

### 5. **UI Updates for Authentication Errors**

**Updated:** `src/pages/Dashboard/modules/Conversation.tsx`

**Changes:**

- Added `authenticationError` event listener
- Added `serverAck` event listener
- Different error banner styling for auth errors (yellow) vs connection errors (red)
- Different action buttons (Login vs Retry)

**Features:**

- **Connection Errors** (Red banner): Shows "Retry" button
- **Authentication Errors** (Yellow banner): Shows "Login" button
- **Server Acknowledgment**: Clears errors and confirms successful connection

---

## 🔄 Event Flow

### Successful Connection:

```
1. Frontend connects with token in auth.token AND query.token
2. Backend allows connection (no 403)
3. Backend authenticates token
4. Backend emits 'server.ack' event
5. Frontend receives 'server.ack' and clears any errors
6. Connection established ✅
```

### Authentication Failure:

```
1. Frontend connects with token
2. Backend allows connection (no 403)
3. Backend authenticates token → FAILS
4. Backend emits 'error' event with auth failure details
5. Frontend detects auth error
6. Frontend emits 'authenticationError' event
7. UI shows yellow banner with "Login" button
8. Connection closes after 100ms (backend behavior)
9. Frontend does NOT auto-reconnect (user needs to login)
```

### Connection Error:

```
1. Frontend attempts connection
2. Connection fails (network, server down, etc.)
3. Frontend emits 'connectionError' event
4. UI shows red banner with "Retry" button
5. Frontend attempts automatic reconnection
```

---

## 📝 Files Modified

1. **`src/services/websocket.ts`**

   - Updated `connect()` method: Added query.token, polling transport
   - Updated `setupEventListeners()`: Added error handling, server.ack listener
   - Added authentication error detection and handling

2. **`src/pages/Dashboard/modules/Conversation.tsx`**
   - Added `authenticationError` event listener
   - Added `serverAck` event listener
   - Updated error banner to differentiate auth vs connection errors
   - Added `isAuthError` state for UI differentiation

---

## ✅ Testing Checklist

- [x] Token sent in both `auth.token` and `query.token`
- [x] Polling transport fallback enabled
- [x] Authentication errors detected and handled
- [x] Server acknowledgment received and processed
- [x] Resume token stored (if provided)
- [x] UI shows different error banners for auth vs connection errors
- [x] No auto-reconnect on authentication failures
- [x] Manual retry works for connection errors

---

## 🎯 Key Improvements

1. **Better Compatibility**: Token in multiple locations ensures backend can find it
2. **Transport Fallback**: Polling fallback prevents connection failures
3. **Clear Error Handling**: Distinguishes auth errors from connection errors
4. **User-Friendly UI**: Different visual indicators and actions for different error types
5. **Resume Token Support**: Ready for future resume functionality

---

## 🔍 Backend Compatibility

The frontend now fully supports:

- ✅ Backend's new authentication flow (no 403 errors)
- ✅ Multiple token location checking
- ✅ Error event emission for auth failures
- ✅ Server acknowledgment with resume token
- ✅ Connection establishment before authentication

---

## 📚 Related Documentation

- `WEBSOCKET_INTEGRATION_GUIDE.md` - Full integration guide
- `WEBSOCKET_TROUBLESHOOTING.md` - Troubleshooting guide
- Backend documentation in backend repository

---

## 🚀 Next Steps (Optional Enhancements)

1. **Token Refresh**: Implement automatic token refresh on auth errors
2. **Login Redirect**: Add redirect to login page on auth errors
3. **Resume Functionality**: Use resume_token for faster reconnection
4. **Error Recovery**: Add retry logic with token refresh

---

## 💡 Notes

- The backend no longer returns 403 errors during connection
- Authentication happens after connection is established
- Frontend must handle `error` events for auth failures
- Resume token is stored but not yet used (ready for future implementation)
