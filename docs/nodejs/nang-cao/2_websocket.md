---
sidebar_position: 2
title: "2. WebSocket & Real-time"
---

# WebSocket & Real-time

WebSocket cho phép server và client trao đổi dữ liệu hai chiều theo thời gian thực, thay vì client cứ phải hỏi server liên tục. Bài này dùng thư viện Socket.IO để gửi/nhận event và nhóm các kết nối lại bằng rooms. Đây là nền tảng cho chat, thông báo và các app cập nhật trực tiếp.

---

:::note[Ghi nhớ nhanh]

- ⭐ **WebSocket là kết nối hai chiều bền vững** — server chủ động push dữ liệu, độ trễ thấp, thay cho polling tốn tài nguyên.
- ⭐ **`Socket.IO` gửi/nhận bằng event** — `emit` để gửi, `on` để nhận; còn bọc thêm fallback và tự reconnect.
- **`broadcast` để gửi cho người khác** — `socket.broadcast.emit` gửi cho tất cả client trừ chính người gửi.
- **Rooms để nhóm kết nối** — `socket.join(room)` rồi `io.to(room).emit` để gửi cho một nhóm cụ thể.
- **Ứng dụng** — chat, notification, dashboard/giá live, game/cộng tác thời gian thực.

:::

---

## Mục lục

- [Vì sao cần WebSocket?](#vì-sao-cần-websocket)
- [Socket.IO](#socketio)
- [Rooms](#rooms)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao cần WebSocket?

**Vấn đề:**

HTTP là request-response một chiều: client hỏi thì server mới trả, server không tự đẩy dữ liệu mới cho client. Muốn realtime phải polling (hỏi liên tục) → trễ, tốn băng thông, tải nặng server.

```js
// Polling: client phải hỏi server liên tục
setInterval(async () => {
  const res = await fetch('/api/messages');
  const messages = await res.json();
  render(messages); // Tin mới luôn bị trễ, mỗi request tốn tài nguyên
}, 2000);
```

**Giải pháp:**

WebSocket mở một kết nối TCP bền vững, hai chiều full-duplex: server chủ động push, client gửi tức thì, độ trễ thấp. Socket.IO bọc thêm fallback, room và reconnect.

```js
// WebSocket: server chủ động push, không cần hỏi lại
socket.on('chat:message', (data) => {
  render(data); // Nhận ngay khi server gửi, độ trễ thấp
});
```

:::tip[Dùng thực tế]

- Chat realtime: tin nhắn hiện ngay khi gửi.
- Thông báo/notification đẩy từ server xuống client.
- Dashboard/giá live: cập nhật số liệu, giá liên tục.
- Chơi game/cộng tác thời gian thực: đồng bộ trạng thái nhiều người.

:::

## Socket.IO

```bash
npm install socket.io
```

### Server

```js
const http = require('http');
const { Server } = require('socket.io');
const express = require('express');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000' },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Lắng nghe event từ client
  socket.on('chat:message', (data) => {
    // Broadcast cho tất cả clients khác
    socket.broadcast.emit('chat:message', {
      user: data.user,
      text: data.text,
      time: new Date().toISOString(),
    });
  });

  // Join room
  socket.on('room:join', (room) => {
    socket.join(room);
    io.to(room).emit('room:notification', `${socket.id} joined ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3001, () => console.log('Server running on 3001'));
```

### Client

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

// Gửi message
socket.emit('chat:message', { user: 'Alice', text: 'Hello!' });

// Nhận message
socket.on('chat:message', (data) => {
  console.log(`${data.user}: ${data.text}`);
});
```

## Rooms

```js
// Server: gửi cho room cụ thể
io.to('room-123').emit('update', data);

// Server: gửi cho tất cả trừ sender
socket.to('room-123').emit('update', data);
```

## Tóm tắt

- Socket.IO cho real-time bi-directional communication
- Events: `emit` để gửi, `on` để nhận
- Rooms để group connections
- Dùng cho chat, notifications, live updates
