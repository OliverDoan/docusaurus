---
sidebar_position: 1
title: "Internet hoạt động ra sao?"
---

# Internet hoạt động ra sao?

Trước khi viết backend, bạn cần hiểu Internet vận hành thế nào: máy tính nói chuyện với nhau qua IP và các giao thức như HTTP/HTTPS, tên miền được phân giải thành IP nhờ DNS, và web app được đặt ở đâu đó (hosting) để mọi người truy cập. Bài này giải thích các khái niệm nền tảng đó cùng cách trình duyệt tải một trang web, giúp bạn debug và tối ưu backend tốt hơn về sau.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Internet chạy trên `TCP/IP`** — mỗi máy có `IP` riêng, giao tiếp qua các protocol như HTTP, FTP, SMTP, DNS.
- ⭐ **`HTTPS = HTTP + TLS`** — bắt buộc ở production để chống nghe lén và giả mạo dữ liệu.
- **`DNS` phân giải tên miền thành IP** — theo chuỗi cache OS → resolver → root → TLD → authoritative server.
- **Hosting có nhiều loại** — shared, VPS, cloud, PaaS, serverless; xu hướng 2026 là PaaS + Serverless (khỏi lo ops).
- **Hiểu luồng browser tải trang** (DNS → TCP → TLS → request → render) giúp tối ưu backend: TTFB, compression, cookie nhỏ.

:::

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

TCP/IP – Bộ giao thức chuẩn của Internet, gồm:

- TCP (Transmission Control Protocol): đảm bảo dữ liệu được gửi đầy đủ, đúng thứ tự, không lỗi.
- IP (Internet Protocol): chịu trách nhiệm định tuyến và đánh địa chỉ để dữ liệu đến đúng máy đích.

Protocol (giao thức) – Bộ quy tắc chung quy định cách các máy tính "nói chuyện" với nhau. Ví dụ:

- HTTP/HTTPS: truy cập web
- FTP: truyền file
- SMTP: gửi email
- DNS: chuyển tên miền (google.com) thành IP address
---

## HTTP / HTTPS

**HTTP (HyperText Transfer Protocol)** — giao thức request/response cho web. Nhược điểm: dữ liệu truyền dạng văn bản thô, dễ bị đọc lén.



**HTTPS (HTTP Secure)** = HTTP + **TLS encryption** — chống nghe lén, tamper. Bắt buộc
trong production.

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
