---
sidebar_position: 1
title: "1. Web Servers: Nginx, Apache, Caddy"
---

# Web Servers: Nginx, Apache, Caddy

Web server là phần mềm đứng giữa internet và code ứng dụng của bạn, lo việc phục vụ file tĩnh, chuyển tiếp request tới backend, xử lý HTTPS và phân phối tải. Bài này giới thiệu ba web server phổ biến nhất là Nginx, Apache và Caddy cùng các khái niệm reverse proxy và load balancing. Hiểu chúng giúp bạn deploy ứng dụng lên server thật một cách an toàn và chịu được nhiều người dùng cùng lúc.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Web server đứng giữa internet và app code** — lo serve static file, reverse proxy, SSL termination, load balancing, caching, compression và rate limiting.
- ⭐ **`Nginx` là lựa chọn mặc định 2026** — event-driven nên chịu tải cao, nhẹ (~2MB/worker); `Caddy` mạnh ở auto HTTPS, `Apache` lâu đời với `.htaccess`.
- **Reverse proxy** — ẩn app nội bộ, để Nginx handle TLS còn app chỉ chạy HTTP; app nên bind `127.0.0.1:3000`, đừng expose port trực tiếp.
- **Load balancing** — thuật toán round-robin, `least_conn`, `ip_hash`; Layer 4 (TCP, nhanh) vs Layer 7 (HTTP, linh hoạt).
- **Sticky session** gây bug khi scale stateful app — ưu tiên stateless `JWT` hoặc shared session store (`Redis`).

:::

---

## Mục lục

- [Web server làm gì?](#web-server-làm-gì)
- [Nginx (khuyến nghị)](#nginx-khuyến-nghị)
- [Apache](#apache)
- [Caddy](#caddy)
- [Reverse Proxy](#reverse-proxy)
- [Load Balancing](#load-balancing)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Web server làm gì?

**Web server** đứng giữa internet và app code, làm:

- **Serve static file** (HTML, CSS, JS, image).
- **Reverse proxy** request đến app backend.
- **SSL termination** — handle HTTPS.
- **Load balancing** — phân phối request.
- **Caching** — proxy cache.
- **Compression** — gzip/brotli.
- **Rate limiting**.
- **URL rewrite, redirect**.

:::tip[Ví dụ đời thường]

Web server giống **lễ tân khách sạn**. Khách bước vào không tự đi tìm phòng — họ nói với lễ tân, lễ tân mới dẫn đi:

- Khách xin tờ rơi, bản đồ → lễ tân **đưa luôn** (serve static file).
- Khách cần gặp nhà bếp → lễ tân **gọi nội bộ** xuống bếp (reverse proxy tới app).
- Khách quậy, gọi 100 cuộc một phút → lễ tân **chặn bớt** (rate limit).

Nhờ vậy các phòng ban bên trong không cần biết gì về người ngoài đường, cứ làm việc của mình.

:::

Architecture phổ biến:

```
[Internet] → [Nginx] → [Node.js app:3000]
                    → [Python app:8000]
                    → [Static files /var/www]
```

---

## Nginx (khuyến nghị)

**Phổ biến nhất 2026** — fast, light, mature.

:::tip[Ví dụ đời thường]

Hai kiểu phục vụ trong quán ăn:

- **Apache** — mỗi bàn phân **một nhân viên riêng** đứng cạnh chờ. 1000 bàn thì cần 1000 nhân viên, quán chật cứng người đứng không (thread/process per connection, tốn RAM).
- **Nginx** — **một nhân viên chạy vòng** qua tất cả các bàn, bàn nào giơ tay thì ghé. Phần lớn thời gian khách chỉ ngồi đợi món, nên một người lo được cả trăm bàn (event loop).

Vì thế Nginx nhẹ hơn hẳn khi có rất nhiều kết nối cùng lúc mà đa số đang... rảnh.

:::

Config cơ bản:

```nginx
# /etc/nginx/sites-available/example.com
server {
  listen 80;
  listen [::]:80;
  server_name example.com www.example.com;

  # Redirect HTTP → HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name example.com www.example.com;

  ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

  # Proxy to Node app
  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }

  # Static files
  location /static/ {
    alias /var/www/example/static/;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

Reload config:

```bash
sudo nginx -t        # test syntax
sudo nginx -s reload # reload không downtime
```

:::info[Phân tích]

**Tại sao Nginx phổ biến?**

1. **Event-driven** — handle 10k+ connection / process.
2. **Low memory** — ~2MB per worker.
3. **Mature** — 20+ năm, battle-tested.
4. **Config flexible** — nhiều use case.
5. **Module rich** — gzip, cache, rate limit, auth.

Compare Apache:

- Nginx async event loop, Apache thread/process per connection.
- Nginx faster cho static + high concurrent.
- Apache flexible config `.htaccess` per directory.

Năm 2026, Nginx default cho VPS deploy. Đối thủ chính: **Caddy** (modern,
auto HTTPS), **HAProxy** (load balancer thuần).

:::

---

## Apache

**Lâu đời nhất** — Apache HTTP Server, 1995+.

Setup:

```apache
# /etc/apache2/sites-available/example.com.conf
<VirtualHost *:80>
  ServerName example.com
  Redirect / https://example.com/
</VirtualHost>

<VirtualHost *:443>
  ServerName example.com

  SSLEngine on
  SSLCertificateFile /etc/letsencrypt/live/example.com/fullchain.pem
  SSLCertificateKeyFile /etc/letsencrypt/live/example.com/privkey.pem

  ProxyPreserveHost On
  ProxyPass / http://localhost:3000/
  ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

**`.htaccess`** — config per directory:

```apache
# .htaccess
RewriteEngine On
RewriteRule ^old-page/?$ /new-page [L,R=301]
```

Phù hợp:

- WordPress hosting truyền thống.
- Shared hosting environment.
- Legacy app `.htaccess` setup.

Nhược điểm so Nginx: chậm hơn under high load, memory cao hơn.

---

## Caddy

**Modern web server** — **auto HTTPS** mặc định.

```bash
# Caddyfile (config siêu đơn giản)
example.com {
  reverse_proxy localhost:3000

  handle_path /static/* {
    root * /var/www/static
    file_server
  }
}
```

Lợi ích:

- **Auto Let's Encrypt** — không cần Certbot setup.
- **Config gọn** — vài dòng cho most case.
- **HTTP/3** native.
- **Modern defaults** — secure cipher, HSTS.

Phù hợp:

- Project nhỏ-vừa cần SSL nhanh.
- Dev không muốn config Nginx phức tạp.
- Side project, prototype.

Trade-off:

- Cộng đồng nhỏ hơn Nginx.
- Ít tài liệu cho edge case.
- Performance OK nhưng kém Nginx high-load.

---

## Reverse Proxy

**Reverse Proxy** đứng trước app, forward request.

:::tip[Ví dụ đời thường]

Reverse proxy giống **hộp thư chung của một chung cư**. Người gửi chỉ biết địa chỉ toà nhà, bỏ thư vào một cửa duy nhất; bảo vệ mới chia thư về từng căn hộ.

- Người lạ **không biết** bạn ở căn nào (client không biết app chạy port 3000).
- Bảo vệ **loại thư rác** trước khi phát (rate limit, chặn bot).
- Thư niêm phong được bảo vệ **bóc bao ngoài** rồi mới đưa vào (SSL termination — Nginx lo HTTPS, app chỉ nói HTTP cho gọn).

Cái giá: mọi thư đều đi qua một cửa. Bảo vệ nghỉ thì cả toà nhà mất liên lạc, nên khâu này phải thật chắc.

:::

Lợi ích:

- **Hide internal** — client chỉ thấy port 443, không biết Node port 3000.
- **SSL termination** — Nginx handle TLS, app dùng HTTP đơn giản.
- **Load balance** nhiều app instance.
- **Caching** static response.
- **Security** — block bot, rate limit edge.
- **Compression** — gzip/brotli automatic.

```
[Client HTTPS] → [Nginx :443] → [Node app :3000]
                  ssl term       internal http
```

Cấu trúc thường gặp:

```nginx
upstream backend {
  server 127.0.0.1:3000;
  server 127.0.0.1:3001;
  server 127.0.0.1:3002;
}

server {
  listen 443 ssl http2;
  server_name api.example.com;

  location / {
    proxy_pass http://backend;
    # ... headers
  }
}
```

---

## Load Balancing

**Phân phối** request giữa nhiều server.

:::tip[Ví dụ đời thường]

Bạn là **người điều phối khách vào các quầy** trong siêu thị. Cách chia khách chính là thuật toán load balancing:

| Cách chia | Ngoài đời | Trong Nginx |
| --- | --- | --- |
| Lần lượt | Khách 1 vào quầy A, khách 2 quầy B, khách 3 lại quầy A... | Round-robin (mặc định) |
| Theo sức | Quầy có 2 thu ngân thì nhận gấp đôi khách | `weight=3` |
| Ai đang rảnh | Nhìn hàng nào ngắn nhất thì đẩy khách vào | `least_conn` |
| Khách quen về đúng quầy | Người này lần nào cũng vào quầy A | `ip_hash` (sticky) |

Chia lần lượt nghe công bằng, nhưng chỉ cần một ông khách mua 100 món là quầy đó tắc — lúc ấy `least_conn` sát thực tế hơn.

:::

**Algorithms** Nginx:

```nginx
upstream backend {
  # Round-robin (default)
  server srv1:3000;
  server srv2:3000;

  # Weighted
  server srv1:3000 weight=3;  # gấp 3 lần
  server srv2:3000 weight=1;

  # Least connections
  least_conn;
  server srv1:3000;
  server srv2:3000;

  # IP hash (sticky session)
  ip_hash;
  server srv1:3000;
  server srv2:3000;
}
```

**Health check**:

```nginx
upstream backend {
  server srv1:3000 max_fails=3 fail_timeout=30s;
  server srv2:3000 max_fails=3 fail_timeout=30s;
  server srv3:3000 backup;  # chỉ dùng khi srv1+srv2 down
}
```

**Layer 4 vs Layer 7**:

- **Layer 4 (TCP)** — load balance theo IP/port, fast (HAProxy).
- **Layer 7 (HTTP)** — load balance theo URL/header, flexible (Nginx).

:::tip[Ví dụ đời thường]

Vẫn là chuyện bảo vệ chia thư, nhưng hai mức khác nhau:

- **Layer 4** — chỉ liếc **địa chỉ ngoài phong bì** rồi ném sang xe nào đang trống. Nhanh, nhưng không biết bên trong viết gì.
- **Layer 7** — **mở thư đọc nội dung**: thư đặt hàng chuyển phòng kinh doanh, thư khiếu nại chuyển chăm sóc khách hàng (route theo URL, header).

Cái giá: đọc thư thì chậm hơn ném phong bì. Đổi lại bạn mới làm được kiểu `/api` đi một cụm server, `/static` đi cụm khác.

:::

Cloud load balancer:

- **AWS ALB** (Application Load Balancer) — Layer 7.
- **AWS NLB** (Network Load Balancer) — Layer 4.
- **GCP Load Balancing**.
- **CloudFlare Load Balancer**.

:::info[Phân tích]

**Sticky sessions** — vấn đề scale stateful app:

```
Bug: User login → server 1 lưu session.
     Request tiếp → server 2 không có session → logout!
```

Fix:

**1. Sticky session** (IP hash) — user luôn về cùng server.
- Đơn giản, nhưng load uneven.

**2. Shared session store** (Redis):
- Mọi server đọc/ghi Redis.
- Phổ biến + recommend.

**3. Stateless JWT**:
- Token tự chứa info, không cần server store.
- Scale tốt nhất.

→ Modern app prefer **stateless** (JWT) hoặc **shared Redis** thay vì
sticky session.

:::

:::tip[Mẹo]

**Pattern deploy production VPS 2026**:

```
[CloudFlare]            ← CDN + DDoS + SSL
    ↓
[Nginx]                 ← Reverse proxy + cache static
    ↓
[Docker container]
├─ Node app instances   ← App backend
├─ PostgreSQL          ← DB
└─ Redis               ← Cache + queue
```

Hoặc dùng PaaS bỏ qua Nginx:

```
[Vercel / Render / Fly.io]  ← Built-in CDN, SSL, scaling
    ↓
[App container]
    ↓
[Managed Postgres + Redis]
```

PaaS đắt hơn nhưng tiết kiệm ops time. VPS cheap hơn nhưng tự maintain.

:::

:::warning[Cần lưu ý]

**Đừng expose app port trực tiếp**:

```
# SAI
ufw allow 3000/tcp     # expose Node app port

# ĐÚNG
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 3000           # nội bộ only
```

App nên bind `127.0.0.1:3000`, chỉ Nginx local truy cập:

```js
// Express
app.listen(3000, "127.0.0.1");  // not 0.0.0.0
```

Defense in depth: dù Nginx mis-config, app vẫn không accessible direct.

:::

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. Web server làm những việc gì? Vì sao không nên để app code (Node/Python) trực tiếp nhận request từ internet?
2. Phân biệt `forward proxy` và `reverse proxy`. Mỗi loại đứng ở phía nào và phục vụ ai?
3. Vì sao `Nginx` chịu tải cao hơn Apache ở cùng cấu hình? So sánh mô hình `event-driven` với `process/thread-per-request`.
4. So sánh Nginx, Apache và Caddy. Dự án mới bạn chọn cái nào và vì sao?
5. `.htaccess` của Apache tiện ở điểm gì và đánh đổi lại điều gì về hiệu năng?
6. Trong Nginx, `server` block và `location` block khác nhau ra sao? Nginx chọn `location` khớp theo thứ tự ưu tiên nào?
7. Giải thích `SSL/TLS termination` tại reverse proxy. Sau khi terminate, traffic từ Nginx tới app nên đi HTTP hay HTTPS?
8. Đứng sau reverse proxy, app lấy IP thật của client bằng cách nào? Vai trò của `X-Forwarded-For`, `X-Real-IP`, và rủi ro nếu tin header này vô điều kiện?
9. So sánh các thuật toán load balancing: round-robin, `weight`, `least_conn`, `ip_hash`. Tình huống nào round-robin gây tắc nghẽn?
10. Load balancing ở `Layer 4` khác `Layer 7` thế nào? Đánh đổi giữa tốc độ và khả năng route ra sao?
11. `sticky session` giải quyết vấn đề gì và tạo ra vấn đề gì khi scale? Bạn thay thế nó bằng cách nào?
12. Nginx phát hiện một upstream chết bằng cơ chế nào (`max_fails`, `fail_timeout`, `backup`)? Request đang xử lý dở sẽ ra sao?
13. Cần cấu hình thêm gì để Nginx proxy được `WebSocket`? Vì sao cấu hình proxy mặc định làm rớt kết nối?
14. Bạn cấu hình rate limiting và giới hạn kích thước upload ở Nginx như thế nào? Vì sao nên chặn ở tầng này thay vì tầng app?
15. Vì sao nên bind app vào `127.0.0.1` thay vì `0.0.0.0`? Giải thích theo nguyên tắc `defense in depth`.
16. Người dùng báo lỗi `502 Bad Gateway`. Bạn debug theo thứ tự nào? Phân biệt `502`, `503` và `504`.
17. Nginx serve static file nhanh hơn app server ở điểm nào? `gzip`/`brotli`, cache header và `sendfile` đóng vai trò gì?
18. Làm sao reload config hoặc deploy bản mới mà không downtime? Giải thích `nginx -s reload` và graceful shutdown ở phía upstream.
