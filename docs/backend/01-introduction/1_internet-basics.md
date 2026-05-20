---
sidebar_position: 1
title: "1. Internet hoạt động ra sao?"
---

# Internet hoạt động ra sao?

---

## Mục lục

- [Internet là gì?](#internet-là-gì)
- [HTTP / HTTPS](#http--https)
- [Domain Name và DNS](#domain-name-và-dns)
- [Hosting](#hosting)
- [Browser hoạt động ra sao?](#browser-hoạt-động-ra-sao)

---

## Internet là gì?

**Internet** = mạng lưới toàn cầu của các máy tính kết nối qua **TCP/IP**.
Mỗi máy có **IP address** duy nhất, giao tiếp với nhau qua các **protocol**.

Stack mạng cơ bản (TCP/IP):

| Layer | Ví dụ |
|-------|-------|
| **Application** | HTTP, DNS, SMTP, SSH |
| **Transport** | TCP (reliable), UDP (fast) |
| **Network** | IP (routing) |
| **Link** | Ethernet, Wi-Fi |

---

## HTTP / HTTPS

**HTTP (HyperText Transfer Protocol)** — giao thức request/response cho web.

Request:

```
GET /api/users HTTP/1.1
Host: example.com
Accept: application/json
Authorization: Bearer token123
```

Response:

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 234

{"users": [...]}
```

**Status codes:**

- **1xx** Informational.
- **2xx** Success (200 OK, 201 Created, 204 No Content).
- **3xx** Redirect (301 Permanent, 302 Found, 304 Not Modified).
- **4xx** Client error (400 Bad Request, 401 Unauthorized, 403 Forbidden,
  404 Not Found, 429 Too Many Requests).
- **5xx** Server error (500 Internal, 502 Bad Gateway, 503 Unavailable,
  504 Timeout).

**HTTPS** = HTTP + **TLS encryption** — chống nghe lén, tamper. Bắt buộc
trong production.

:::info[Phân tích]

**HTTP versions** evolve theo thời gian:

- **HTTP/1.1** (1997): mỗi request 1 connection (hoặc keep-alive). Phổ
  biến nhất.
- **HTTP/2** (2015): multiplex nhiều stream trong 1 connection, header
  compression. Đa số website hiện đại dùng.
- **HTTP/3** (2022): dùng **QUIC** (UDP-based) thay TCP — nhanh hơn,
  recover packet loss tốt.

Backend developer cần biết:

- **Idempotent** methods: GET, PUT, DELETE — gọi lại an toàn.
- **Safe** methods: GET, HEAD — không thay đổi state.
- **Cacheable**: GET (default), POST cần header.

:::

---

## Domain Name và DNS

**Domain Name** = tên dễ nhớ thay IP (`example.com` thay `93.184.216.34`).

Phân cấp:

```
.com               → TLD (top-level domain)
example.com        → second-level (mua từ registrar)
www.example.com    → subdomain
api.example.com    → subdomain
```

**DNS (Domain Name System)** — phân giải tên thành IP.

Flow khi vào `example.com`:

```
1. Browser hỏi OS local cache.
2. OS hỏi resolver (ISP hoặc 1.1.1.1, 8.8.8.8).
3. Resolver hỏi Root server → ".com" TLD server.
4. TLD hỏi authoritative server của example.com.
5. Trả IP về.
6. Browser kết nối IP đó.
```

**DNS record types:**

| Type | Mục đích |
|------|---------|
| `A` | Domain → IPv4 |
| `AAAA` | Domain → IPv6 |
| `CNAME` | Alias domain → domain khác |
| `MX` | Mail server |
| `TXT` | Metadata (SPF, DKIM, verification) |
| `NS` | Nameserver |
| `CAA` | Authorize ai issue SSL cert |

:::tip[Mẹo]

**DNS TTL** quyết định thời gian cache:

- TTL ngắn (60s): đổi DNS nhanh, nhưng load cao.
- TTL dài (1h, 24h): ít load, đổi DNS phải đợi.

Khi migrate server, **giảm TTL trước 24h**, đổi xong tăng lại. Pattern
chuẩn cho mọi DNS change quan trọng.

:::

---

## Hosting

**Hosting** = nơi đặt server để app accessible từ internet.

Loại:

| Loại | Giá | Use case |
|------|-----|---------|
| **Shared hosting** | Rẻ | Static site nhỏ |
| **VPS** | Vừa | App vừa, control hệ thống |
| **Dedicated server** | Đắt | High-traffic, compliance |
| **Cloud (AWS, GCP, Azure)** | Variable | Scale linh hoạt |
| **PaaS** (Vercel, Render, Fly.io) | Variable | App-focused, no ops |
| **Serverless** (Lambda, Vercel Functions) | Pay-per-use | Spike traffic |

Năm 2026, **PaaS + Serverless** là xu hướng — focus code, ops do platform handle.

---

## Browser hoạt động ra sao?

Khi nhập URL vào browser:

```
1. Parse URL (protocol, domain, path).
2. DNS lookup → IP.
3. TCP handshake với server (3-way).
4. TLS handshake (nếu HTTPS).
5. Gửi HTTP request.
6. Nhận response (HTML).
7. Parse HTML → DOM tree.
8. Parse CSS → CSSOM.
9. Combine → Render tree.
10. Layout (geometry).
11. Paint (pixels).
12. Compositing (layers).
13. Execute JavaScript (parse + compile + run).
14. Repeat for dependencies (CSS, JS, images).
```

:::info[Phân tích]

**Hiểu browser flow giúp backend optimize**:

- **TTFB (Time to First Byte)** — server response time. Optimize: cache,
  CDN, database query.
- **Resource hint**: `<link rel="preconnect">`, `dns-prefetch`, `preload`.
- **Compression**: gzip/brotli giảm 70-80% size text.
- **HTTP/2 Server Push** (deprecated, dùng `<link rel="preload">` thay).
- **Cookie size**: limit ~4KB, gửi mọi request → giữ nhỏ.

Backend không chỉ là "trả JSON" — cách trả ảnh hưởng frontend
performance trực tiếp.

:::

:::tip[Mẹo]

**Kiến thức nền tảng cần thiết cho backend dev**:

1. **TCP vs UDP** — TCP reliable, UDP fast (DNS, video).
2. **Ports** — well-known (80, 443, 22, 5432).
3. **NAT, Firewall** — public IP vs private IP.
4. **VPN, Proxy** — qua middleman.
5. **REST principles** — chuẩn API web.
6. **JSON, XML, Form data** — format truyền.
7. **Status codes** — biết ý nghĩa, dùng đúng.

Không cần master ngay — học khi gặp. Nhưng nắm khái niệm để debug được
khi network issue.

:::
