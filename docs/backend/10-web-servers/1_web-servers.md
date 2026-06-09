---
sidebar_position: 1
title: "1. Web Servers: Nginx, Apache, Caddy"
---

# Web Servers: Nginx, Apache, Caddy

Web server là phần mềm đứng giữa internet và code ứng dụng của bạn, lo việc phục vụ file tĩnh, chuyển tiếp request tới backend, xử lý HTTPS và phân phối tải. Bài này giới thiệu ba web server phổ biến nhất là Nginx, Apache và Caddy cùng các khái niệm reverse proxy và load balancing. Hiểu chúng giúp bạn deploy ứng dụng lên server thật một cách an toàn và chịu được nhiều người dùng cùng lúc.

---

## Mục lục

- [Web server làm gì?](#web-server-làm-gì)
- [Nginx (khuyến nghị)](#nginx-khuyến-nghị)
- [Apache](#apache)
- [Caddy](#caddy)
- [Reverse Proxy](#reverse-proxy)
- [Load Balancing](#load-balancing)

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

Architecture phổ biến:

```
[Internet] → [Nginx] → [Node.js app:3000]
                    → [Python app:8000]
                    → [Static files /var/www]
```

---

## Nginx (khuyến nghị)

**Phổ biến nhất 2026** — fast, light, mature.

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
