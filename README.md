# Chat Platform

Hướng dẫn cài đặt và chạy dự án Chat Platform.

## Yêu cầu hệ thống

- Node.js >= 18.x
- npm hoặc yarn
- Backend server chạy trên `http://localhost:9090`

## Các bước cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd chat-platform
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

Đảm bảo backend server đang chạy trên `http://localhost:9090`. Nếu backend chạy trên port khác, cập nhật trong file `vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:9090', // Thay đổi port nếu cần
    // ...
  }
}
```

### 4. Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173` (hoặc port khác nếu 5173 đã được sử dụng).

## Scripts khác

- `npm run build` - Build production
- `npm run preview` - Preview production build
- `npm run lint` - Chạy ESLint

## Lưu ý

- Đảm bảo backend server đã được khởi động trước khi chạy frontend
- WebSocket connection sẽ tự động kết nối khi đăng nhập thành công
- Cần có token authentication để sử dụng các tính năng

