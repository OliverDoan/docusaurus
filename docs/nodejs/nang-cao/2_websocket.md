---
sidebar_position: 2
title: "2. WebSocket & Real-time"
---

# WebSocket & Real-time

WebSocket cho phép server và client trao đổi dữ liệu hai chiều theo thời gian thực, thay vì client cứ phải hỏi server liên tục. Bài này dùng thư viện Socket.IO để gửi/nhận event và nhóm các kết nối lại bằng rooms. Đây là nền tảng cho chat, thông báo và các app cập nhật trực tiếp.

---

## Mục lục

- [Socket.IO](#socketio)
- [Rooms](#rooms)
- [Tóm tắt](#tóm-tắt)

---

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
