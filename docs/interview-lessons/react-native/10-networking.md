---
sidebar_position: 10
title: "Networking"
---

# Networking

## 1. Networking -- Fetch, WebSocket, Connectivity

Bài học: [1. Networking -- Fetch, WebSocket, Connectivity](../../react-native/10-networking/1_networking.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. fetch vs axios?**

<details className="qa">
<summary>Xem đáp án</summary>

- **fetch**: built-in, đủ cho cơ bản, không có interceptor
- **axios**: lib bên ngoài, có interceptor, transform, timeout chuẩn, error handling tốt hơn

Production thường dùng axios. fetch ok cho simple case.

</details>

**2. React Query lợi ích gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Caching** tự động -- không call lại nếu data fresh
- **Background refetch** -- giữ data mới
- **Loading/error state** -- không cần useState manual
- **Optimistic update** -- UI update ngay, rollback nếu fail
- **Pagination/infinite** -- support built-in

Thay thế ~50% code useEffect + useState gọi API.

</details>

**3. WebSocket khi nào dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

Real-time 2 chiều:

- **Chat** (Messenger, Discord)
- **Notification** push live
- **Dashboard** số liệu live
- **Game** multiplayer
- **Collaborative editing** (Figma, Google Docs)

HTTP polling tốn pin/data -- WebSocket hiệu quả hơn.

</details>

**4. NetInfo dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Detect connectivity -- show banner "Mat mang", queue request khi offline, switch giữa wifi/cellular. Quan trọng cho mobile -- user thường xuyên mất mạng.

</details>

**5. Localhost không hoạt động trên device thật?**

<details className="qa">
<summary>Xem đáp án</summary>

Device thật khác máy dev. Cần:

- **Cùng wifi**, dùng IP máy dev (`192.168.x.x`)
- **ngrok** -- expose localhost ra public URL
- **adb reverse** (Android) -- forward port

Production luôn dùng URL public, không localhost.

</details>
