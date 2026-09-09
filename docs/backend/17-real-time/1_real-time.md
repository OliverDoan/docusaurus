---
sidebar_position: 1
title: "1. WebSocket, SSE, Long Polling"
---

# WebSocket, SSE, Long Polling

Đây là các kỹ thuật giúp server và trình duyệt trao đổi dữ liệu theo thời gian thực, ví dụ như chat, thông báo tức thì hay xem giá cổ phiếu cập nhật liên tục mà không cần tải lại trang. Hiểu chúng quan trọng vì mỗi cách phù hợp với một tình huống khác nhau: một chiều hay hai chiều, đơn giản hay cần độ trễ thấp. Bài này giới thiệu WebSocket, SSE, Long Polling và WebRTC; phần chi tiết nằm bên dưới.

---

:::note[Ghi nhớ nhanh]

- ⭐ **`SSE` (one-way server→client, chạy trên HTTP, auto-reconnect sẵn) vs `WebSocket` (hai chiều, full-duplex TCP)** — mỗi cái hợp một tình huống.
- ⭐ **Nhiều case "chat" thực ra dùng `SSE` + fetch POST** đơn giản hơn setup WebSocket; SSE cũng chuẩn cho AI streaming.
- **`WebSocket` là stateful** — scale cần sticky session + Redis pub/sub để broadcast giữa các server.
- **`Long Polling` đã legacy** (2026); **`WebRTC`** cho video/audio P2P nên dùng managed (LiveKit, Daily...).
- **Managed service** (Pusher, Ably, Supabase Realtime, Liveblocks) giảm ~90% effort so với tự build.

:::

---

## Mục lục

- [Real-time options](#real-time-options)
- [Server-Sent Events (SSE)](#server-sent-events-sse)
- [WebSocket](#websocket)
- [Long Polling](#long-polling)
- [WebRTC](#webrtc)
- [Lựa chọn](#lựa-chọn)

---

## Real-time options

| Option | Direction | Use case |
|--------|-----------|---------|
| **Polling** | Client pull | Simple, low-frequency update |
| **Long Polling** | Client pull, server delay | Legacy compat |
| **SSE** | Server → Client | One-way notification |
| **WebSocket** | Bi-directional | Chat, gaming, collab |
| **WebRTC** | Peer-to-peer | Video call, file transfer |

So sánh cách trao đổi dữ liệu — Polling hỏi lặp lại tốn request, còn WebSocket giữ một kết nối hai chiều mở liên tục:

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: Polling — hỏi lặp lại (nhiều request rỗng)
    C->>S: Có gì mới không?
    S-->>C: Chưa
    C->>S: Có gì mới không?
    S-->>C: Có! dữ liệu
    Note over C,S: WebSocket — 1 kết nối 2 chiều
    C->>S: Handshake (nâng cấp lên WebSocket)
    S-->>C: Đã mở kết nối
    S-->>C: Đẩy dữ liệu ngay khi có
    C->>S: Gửi tin nhắn bất cứ lúc nào
```

---

## Server-Sent Events (SSE)

**One-way** server → client, qua HTTP.

:::tip[Ví dụ đời thường]

`SSE` giống **cái đài phát thanh**: bạn dò đúng kênh, đài cứ thế nói, bạn cứ thế nghe. Đài **không nghe được bạn** — muốn góp ý thì phải nhắn tin bằng đường khác (một request `fetch`/POST bình thường). Mất sóng thì máy tự dò lại giúp bạn (auto-reconnect có sẵn trong trình duyệt).

Đúng kiểu này là: bảng giá cổ phiếu chạy, thông báo mới nhảy lên, và AI gõ từng chữ ra màn hình.

:::

```ts
// Server (Node Express)
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ time: Date.now() })}\n\n`);
  }, 1000);

  req.on("close", () => clearInterval(interval));
});
```

```ts
// Client (browser)
const source = new EventSource("/events");

source.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};

source.onerror = () => {
  console.log("SSE disconnected, auto-reconnect");
};
```

**Ưu**:

- **Simple HTTP** — proxy/firewall friendly.
- **Auto-reconnect** built-in browser.
- **Text-based** — easy debug.
- **HTTP/2 multiplex** — many SSE 1 connection.

**Nhược**:

- **One-way** — không client → server (dùng fetch riêng).
- **Browser limit** — 6 SSE / domain (HTTP/2 OK).
- **No binary**.

**Phù hợp**:

- Stock price updates.
- Notification.
- AI chat streaming (ChatGPT, Claude).
- Activity feed.

---

## WebSocket

**Full-duplex** TCP connection, sau khi handshake HTTP upgrade.

:::tip[Ví dụ đời thường]

`WebSocket` giống **cuộc gọi điện thoại**: quay số một lần (handshake), sau đó **đường dây mở suốt**, hai bên nói xen kẽ nhau lúc nào cũng được, không phải bấm số lại cho từng câu.

Cái giá phải trả: tổng đài phải **giữ dây cho từng người**, kể cả lúc không ai nói. Nghìn người online là nghìn sợi dây phải nuôi. Có nhiều tổng đài thì phải đảm bảo bạn luôn quay về đúng tổng đài đang cầm dây của mình (`sticky session`), và các tổng đài phải nối với nhau để chuyển lời qua lại (Redis pub/sub).

:::

```ts
// Server (Node với ws)
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (data) => {
    console.log("Received:", data.toString());

    // Echo back
    ws.send(data);

    // Broadcast to all
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  ws.on("close", () => console.log("Client disconnected"));
});
```

```ts
// Client (browser)
const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => ws.send("Hello");
ws.onmessage = (event) => console.log(event.data);
ws.onclose = () => console.log("Disconnected");
```

**Library** Node:

- **ws** — minimal.
- **Socket.IO** — feature-rich (fallback, room, ack).
- **uWebSockets.js** — high performance.
- **Bun WebSocket** — built-in.

**Socket.IO** popular:

```ts
import { Server } from "socket.io";

const io = new Server(httpServer);

io.on("connection", (socket) => {
  socket.join("room1");

  socket.on("message", (data) => {
    io.to("room1").emit("message", data);
  });
});
```

Features:

- **Room** — group socket.
- **Acknowledgment** — confirm receive.
- **Auto-reconnect**.
- **Fallback** (long-polling cho old browser).
- **Namespace**.

**Phù hợp**:

- Real-time chat.
- Collaborative editor (Figma, Google Docs).
- Multiplayer game.
- Live trading.

:::info[Phân tích]

**WebSocket scaling challenge**:

WebSocket = **stateful connection**. Khác stateless HTTP:

- Server cần giữ connection — không scale = trivial.
- **Sticky session** với load balancer.
- **Pub/Sub backend** để broadcast giữa server (Redis).

Pattern scale:

```
[Client1] → [LB sticky] → [WS Server 1]
[Client2] → [LB sticky] → [WS Server 2]
                              ↕
                          [Redis Pub/Sub]
```

Client1 send msg → WS Server 1 → publish Redis → WS Server 2 receive →
forward to Client2.

Library handle:

- **Socket.IO Redis adapter**.
- **Pusher** — managed service.
- **Ably**, **Liveblocks**, **Soketi**.

Managed service đáng cân nhắc cho startup — đỡ ops phức tạp.

:::

---

## Long Polling

**Client** request, server giữ connection cho đến khi có data hoặc timeout.

:::tip[Ví dụ đời thường]

- **Polling** — cứ 5 giây bạn lại **gọi hỏi shipper "tới chưa anh?"**. 9/10 cuộc nhận về "chưa", tốn tiền điện thoại mà tin vẫn trễ tới 5 giây.
- **Long Polling** — bạn gọi một cuộc rồi **giữ máy chờ im lặng**; shipper tới nơi mới lên tiếng, hoặc 30 giây không có gì thì cúp và bạn gọi lại cuộc mới. Ít cuộc gọi rỗng hơn, tin cũng đến nhanh hơn.

Nhưng vẫn là **gọi đi gọi lại**, mỗi cuộc lại chào hỏi từ đầu, và server phải ôm cả đống cuộc đang treo máy. Đã có "đài phát thanh" (`SSE`) và "điện thoại hai chiều" (`WebSocket`) thì không ai làm vậy nữa.

:::

```ts
// Client
async function poll() {
  while (true) {
    try {
      const res = await fetch("/long-poll", { timeout: 30000 });
      const data = await res.json();
      processData(data);
    } catch (err) {
      await sleep(1000);
    }
  }
}
```

```ts
// Server — Express
app.get("/long-poll", async (req, res) => {
  const data = await waitForUpdate(30000); // timeout 30s
  res.json(data);
});
```

**Ưu**:

- Compat browser cũ (IE).
- Firewall friendly (HTTP).

**Nhược**:

- **High latency** so WebSocket.
- **HTTP overhead** mỗi poll.
- **Server connection** stack up.

Năm 2026, **legacy**. Dùng SSE hoặc WebSocket thay.

---

## WebRTC

**Peer-to-peer** giữa browser/native, **không qua server** (sau setup).

:::tip[Ví dụ đời thường]

`WebRTC` giống **hai người nhờ tổng đài nối máy, xong rồi nói thẳng với nhau**. Tổng đài (signaling server) chỉ làm mỗi việc lúc đầu: trao "số nhà" của hai bên cho nhau (offer, answer, ICE). Nối được rồi thì **hình và tiếng đi thẳng từ máy này sang máy kia**, không vòng qua tổng đài nữa — nhờ vậy mới mượt.

Cái giá phải trả: nhà ai cũng có tường rào (NAT/firewall) nên nhiều ca vẫn phải đi vòng qua **một chỗ trung chuyển** (TURN server) rất tốn băng thông. Họp 10 người mà ai cũng gửi hình cho 9 người còn lại thì máy chịu không nổi — nên video conference hãy dùng dịch vụ managed (SFU).

:::

Use case:

- **Video / audio call** (Google Meet, Zoom).
- **File transfer**.
- **Live streaming** P2P.

**3 component**:

- **MediaStream** — audio/video stream.
- **RTCPeerConnection** — connection between peers.
- **RTCDataChannel** — arbitrary data P2P.

Signaling server (WebSocket) để 2 peer **tìm thấy nhau**:

```
Peer A → Signaling Server → Peer B
         (offer, answer, ICE)
                ↓
Peer A ←─────── direct P2P ────────→ Peer B
                (audio/video/data)
```

Setup phức tạp. Library hỗ trợ:

- **Simple-peer** (Node + browser).
- **PeerJS**.
- **LiveKit** — managed WebRTC SFU.
- **Daily.co**, **Agora**, **Twilio Video**.

Cho video conference, **dùng managed** thay tự build (TURN/STUN, scale).

---

## Lựa chọn

```
Use case?

├─ Chat 1-1, room chat                      → WebSocket
├─ Streaming AI response                     → SSE
├─ Live notification                         → SSE
├─ Collaborative editor (Figma-like)         → WebSocket
├─ Live dashboard, stock price               → SSE / WebSocket
├─ Video / voice call                        → WebRTC (managed)
└─ Update mỗi 30s+                           → Polling đơn giản
```

:::tip[Mẹo]

**SSE vs WebSocket — khi nào chọn?**

| | SSE | WebSocket |
|--|-----|-----------|
| Direction | Server → Client | Bi-directional |
| Protocol | HTTP | TCP (upgraded từ HTTP) |
| Auto-reconnect | **Native** | Cần lib |
| Binary | Không | Có |
| Browser support | Modern | Modern |
| Server complexity | Low | Medium-High |
| Scale | HTTP load balancer | Sticky + pub/sub backend |

**Default SSE** khi:

- Chỉ cần server push (notification, AI streaming, live updates).
- Đỡ infra cost.

**WebSocket** khi:

- Cần bi-directional (chat).
- Low latency critical.
- Binary data (gaming, file).

Nhiều case "chat" thực ra **dùng SSE** + fetch POST cho gửi tin — đơn giản
hơn WebSocket setup.

:::

:::info[Phân tích]

**Real-time platform 2026**:

**Managed**:

- **Pusher** — phổ biến.
- **Ably** — feature-rich.
- **Liveblocks** — collab editor specific.
- **Soketi** — open-source Pusher-compatible.
- **Supabase Realtime** — Postgres trigger + WebSocket.
- **PartyKit** — Cloudflare Workers + WebSocket.

**Self-host**:

- **Socket.IO** + Redis adapter.
- **Centrifugo** — Go-based, mạnh.
- **NATS** — messaging + pub/sub.

Cho startup 2026, **Supabase Realtime** hoặc **Liveblocks** giảm 90% effort
so với roll-your-own.

:::
