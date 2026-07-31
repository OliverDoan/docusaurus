---
sidebar_position: 1
title: "1. Networking -- Fetch, WebSocket, Connectivity"
---

# Networking -- Gọi API và kết nối mạng

Hầu hết app mobile gọi API server. RN có **Fetch API** (giống browser), **WebSocket**, và detect **connectivity status**.

**Tương tự đơn giản:** App mobile giống **điện thoại của bạn** -- không có sóng = không gọi được. Networking là module quản lý "sóng" của app: gọi REST API, real-time WebSocket, check có mạng không.

---

:::note[Ghi nhớ nhanh]

- ⭐ **React Query / TanStack Query** — quản lý server state đúng cách (caching, retry, loading/error state); dùng cho ~90% app production thay vì `useEffect` + `useState` thủ công.
- **`fetch` vs `axios`** — `fetch` built-in đủ cho case cơ bản; `axios` có interceptor (tự thêm token, refresh token khi 401).
- ⭐ **HTTPS bắt buộc** — iOS/Android chặn HTTP cleartext mặc định; luôn kiểm tra `res.ok` trước khi `res.json()`.
- **WebSocket** — realtime 2 chiều (chat, notification, dashboard live) kèm logic tự reconnect khi đổi 4G ↔ wifi.
- **NetInfo** — detect offline để hiện banner; nhớ timeout request bằng `AbortController` và abort khi unmount tránh memory leak.

:::

---

## Mục lục

- [Vì sao networking trong RN cần lưu ý riêng?](#vì-sao-networking-trong-rn-cần-lưu-ý-riêng)
- [1. Fetch API](#1-fetch-api)
- [2. Axios](#2-axios)
- [3. WebSocket](#3-websocket)
- [4. Connectivity Status (NetInfo)](#4-connectivity-status-netinfo)
- [5. React Query / TanStack Query](#5-react-query-tanstack-query)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao networking trong RN cần lưu ý riêng?

App mobile phụ thuộc **mạng di động chập chờn**: rớt sóng, đổi qua lại 4G ↔ wifi, offline, độ trễ cao. Khác web ở chỗ không có CORS/cookie tự động như trình duyệt, và mặc định iOS/Android **chặn HTTP cleartext** (bắt buộc HTTPS). Bỏ qua các điều này dễ làm app treo, lỗi, hoặc lộ dữ liệu.

**Vấn đề:**

```tsx
// Gọi API kiểu "web": coi như luôn có mạng, dùng HTTP, không retry
const res = await fetch('http://api.example.com/users'); // HTTP -> bị chặn cleartext
const data = await res.json();
setUsers(data); // mạng rớt giữa chừng -> app treo / crash, không có cache xem offline
```

**Giải pháp:**

```tsx
// HTTPS + axios/fetch + React Query lo loading/error/retry/cache + NetInfo check mạng
import NetInfo from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const net = await NetInfo.fetch();
      if (!net.isConnected) throw new Error('Offline'); // chủ động xử lý mất mạng
      const res = await fetch('https://api.example.com/users'); // HTTPS bắt buộc
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    retry: 3,            // tự retry khi mạng yếu
    staleTime: 60_000,   // cache để xem khi mất mạng
  });
}
```

:::tip[Dùng thực tế]

- Gọi REST API có **retry** khi mạng yếu để không fail ngay lần đầu rớt sóng.
- Hiện **banner offline** (NetInfo) khi user mất mạng thay vì để màn hình trắng.
- **Cache** dữ liệu (React Query) để vẫn xem được nội dung cũ khi mất mạng.
- **Realtime chat** qua WebSocket, tự reconnect khi đổi 4G ↔ wifi.

:::

---

## 1. Fetch API

API built-in, giống browser:

```jsx
const response = await fetch('https://api.example.com/users');
const data = await response.json();
console.log(data);
```

### POST với body

```jsx
const response = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
});

if (!response.ok) {
  throw new Error(`HTTP ${response.status}`);
}

const created = await response.json();
```

### Timeout với AbortController

```jsx
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10_000);

try {
  const res = await fetch(url, { signal: controller.signal });
  clearTimeout(timeout);
} catch (e) {
  if (e.name === 'AbortError') {
    console.log('Timeout');
  }
}
```

### Upload file

```jsx
const formData = new FormData();
formData.append('file', {
  uri: 'file:///path/to/image.jpg',
  type: 'image/jpeg',
  name: 'photo.jpg',
});

await fetch('/upload', {
  method: 'POST',
  body: formData,
  // KHONG set Content-Type -- browser/RN tu set kem boundary
});
```

---

## 2. Axios

`axios` -- thư viện HTTP phổ biến, nhiều tính năng hơn fetch:

```bash
npm install axios
```

```jsx
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor -- them token tu dong
api.interceptors.request.use(async config => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor -- refresh token
api.interceptors.response.use(
  res => res,
  async error => {
    if (error.response?.status === 401) {
      await refreshToken();
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);

// Use
const { data } = await api.get('/users');
await api.post('/users', { name: 'Alice' });
```

---

## 3. WebSocket

Real-time 2 chiều: chat, notification, live update.

```jsx
const ws = new WebSocket('wss://chat.example.com');

ws.onopen = () => {
  console.log('Connected');
  ws.send(JSON.stringify({ type: 'auth', token }));
};

ws.onmessage = (e) => {
  const data = JSON.parse(e.data);
  console.log('Received:', data);
};

ws.onerror = (e) => console.error(e.message);
ws.onclose = (e) => console.log('Closed:', e.code, e.reason);

// Gui message
ws.send(JSON.stringify({ type: 'chat', message: 'hi' }));

// Dong
ws.close();
```

### Reconnect logic

```jsx
function useWebSocket(url) {
  const ws = useRef(null);

  useEffect(() => {
    function connect() {
      ws.current = new WebSocket(url);
      ws.current.onclose = () => {
        setTimeout(connect, 3000); // reconnect sau 3s
      };
    }
    connect();
    return () => ws.current?.close();
  }, [url]);
}
```

### Library: socket.io-client

Khi server dùng Socket.IO:

```bash
npm install socket.io-client
```

```jsx
import io from 'socket.io-client';

const socket = io('https://server.com');
socket.on('connect', () => {});
socket.emit('chat', { msg: 'hi' });
socket.on('reply', data => {});
```

---

## 4. Connectivity Status (NetInfo)

Detect có mạng không, loại mạng.

```bash
npx expo install @react-native-community/netinfo
```

```jsx
import NetInfo from '@react-native-community/netinfo';

// Lay trang thai 1 lan
const state = await NetInfo.fetch();
console.log(state.isConnected);     // true/false
console.log(state.type);              // 'wifi', 'cellular', 'none'
console.log(state.isInternetReachable);

// Listen thay doi
const unsub = NetInfo.addEventListener(state => {
  if (!state.isConnected) {
    showToast('Mat ket noi');
  }
});

return () => unsub();
```

### Hook version

```jsx
import { useNetInfo } from '@react-native-community/netinfo';

function MyComponent() {
  const netInfo = useNetInfo();

  if (!netInfo.isConnected) {
    return <Text>Khong co mang</Text>;
  }

  return <MainContent />;
}
```

---

## 5. React Query / TanStack Query

Library quản lý server state -- caching, refetch, optimistic update.

```bash
npm install @tanstack/react-query
```

```jsx
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserList />
    </QueryClientProvider>
  );
}

function UserList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then(r => r.data),
    staleTime: 60_000,           // 1 phut moi refetch
  });

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Loi: {error.message}</Text>;

  return (
    <FlatList
      data={data}
      refreshing={isLoading}
      onRefresh={refetch}
      renderItem={({ item }) => <UserRow user={item} />}
    />
  );
}

// Mutation
function CreateUser() {
  const mutation = useMutation({
    mutationFn: (newUser) => api.post('/users', newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return (
    <Pressable onPress={() => mutation.mutate({ name: 'Alice' })}>
      <Text>Tao</Text>
    </Pressable>
  );
}
```

**Lợi ích:**

- Auto caching
- Auto refetch khi focus
- Loading/error state built-in
- Optimistic update
- Pagination/infinite query

---

## Khi nào dùng?

- **fetch**: API call đơn giản
- **axios**: cần interceptor, transform, timeout chuẩn
- **WebSocket**: real-time (chat, notification, dashboard live)
- **NetInfo**: detect offline, show banner
- **React Query**: 90% production app -- quản lý API state đúng cách
- **Best practice:**
  - Wrap fetch trong custom hook (`useFetch`, `useApi`)
  - **Timeout** mọi request
  - **Retry logic** với exponential backoff
  - Handle offline gracefully
  - **React Query** thay vì useEffect + useState manual

---

## Lỗi thường gặp

### Lỗi 1: Không handle network error

```jsx
// SAI
const res = await fetch(url);
const data = await res.json(); // 500 van parse, sai

// DUNG
const res = await fetch(url);
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const data = await res.json();
```

### Lỗi 2: Quên Content-Type cho POST JSON

```jsx
// SAI -- server khong hieu body
fetch(url, { method: 'POST', body: JSON.stringify(data) });

// DUNG
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
```

### Lỗi 3: Hardcode IP/host

```jsx
// SAI -- IP dev khac prod
const API = 'http://192.168.1.100:3000';

// DUNG -- env
import Constants from 'expo-constants';
const API = Constants.expoConfig.extra.apiUrl;
```

### Lỗi 4: Memory leak khi unmount

```jsx
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal });
  return () => controller.abort();
}, []);
```

### Lỗi 5: Localhost trên device thật

Device thật không thấy `localhost` của máy dev. Dùng IP máy dev hoặc ngrok.

---

## Câu hỏi phỏng vấn

### Câu 1: fetch vs axios?

**Trả lời:**

- **fetch**: built-in, đủ cho cơ bản, không có interceptor
- **axios**: lib bên ngoài, có interceptor, transform, timeout chuẩn, error handling tốt hơn

Production thường dùng axios. fetch ok cho simple case.

### Câu 2: React Query lợi ích gì?

**Trả lời:**

- **Caching** tự động -- không call lại nếu data fresh
- **Background refetch** -- giữ data mới
- **Loading/error state** -- không cần useState manual
- **Optimistic update** -- UI update ngay, rollback nếu fail
- **Pagination/infinite** -- support built-in

Thay thế ~50% code useEffect + useState gọi API.

### Câu 3: WebSocket khi nào dùng?

**Trả lời:** Real-time 2 chiều:

- **Chat** (Messenger, Discord)
- **Notification** push live
- **Dashboard** số liệu live
- **Game** multiplayer
- **Collaborative editing** (Figma, Google Docs)

HTTP polling tốn pin/data -- WebSocket hiệu quả hơn.

### Câu 4: NetInfo dùng để làm gì?

**Trả lời:** Detect connectivity -- show banner "Mat mang", queue request khi offline, switch giữa wifi/cellular. Quan trọng cho mobile -- user thường xuyên mất mạng.

### Câu 5: Localhost không hoạt động trên device thật?

**Trả lời:** Device thật khác máy dev. Cần:

- **Cùng wifi**, dùng IP máy dev (`192.168.x.x`)
- **ngrok** -- expose localhost ra public URL
- **adb reverse** (Android) -- forward port

Production luôn dùng URL public, không localhost.
