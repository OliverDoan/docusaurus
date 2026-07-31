---
sidebar_position: 4
title: "4. Deployment"
---

# Deployment

Deployment là quá trình đưa ứng dụng Node.js lên chạy thật trên server cho người dùng truy cập. Bài này hướng dẫn chuẩn bị app cho production, đóng gói bằng Docker, quản lý tiến trình với PM2 và cấu hình biến môi trường an toàn. Nắm được những bước này giúp app chạy ổn định và dễ mở rộng.

---

:::note[Ghi nhớ nhanh]

- ⭐ **`PM2` cluster tự hồi phục + đa core** — `pm2 start index.js -i max` tận dụng mọi CPU core, worker crash thì tự restart.
- ⭐ **`Docker` đóng gói môi trường nhất quán** — dev, staging, production chạy y hệt nhau, hết cảnh "works on my machine".
- **Zero-downtime reload** — `pm2 reload` thay process lần lượt nên cập nhật phiên bản mới mà không gián đoạn.
- **Env vars qua platform, không dùng `.env`** — set biến qua hosting/CI-CD (`heroku config:set`, `docker run -e`), tách secret khỏi code.
- **Graceful shutdown** — bắt `SIGTERM` để `server.close()` trước khi thoát, tránh đứt request đang xử lý.

:::

---

## Mục lục

- [Vì sao cần quy trình deployment?](#vì-sao-cần-quy-trình-deployment)
- [Chuẩn bị Production](#chuẩn-bị-production)
- [Docker](#docker)
- [PM2 — Process Manager](#pm2-process-manager)
- [Environment Variables trong Production](#environment-variables-trong-production)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao cần quy trình deployment?

**Vấn đề:** Deploy thủ công — SSH vào server, kéo code, rồi chạy thẳng `node app.js`.

```bash
# Cách làm thủ công, dễ vỡ
ssh user@server
git pull
node app.js
# - App crash là chết hẳn, không có gì tự restart
# - "Works on my machine" — server khác môi trường với máy dev
# - Cập nhật phải tắt app → downtime, người dùng đứt kết nối
# - Chỉ chạy 1 process → lãng phí các nhân CPU còn lại
```

**Giải pháp:** Một quy trình deploy chuẩn — process manager tự restart và chạy cluster đa core, Docker đóng gói môi trường nhất quán, CI/CD tự động build-test-deploy, nginx làm reverse proxy và biến môi trường tách khỏi code.

```yaml
# CI/CD: tự động build - test - deploy khi merge
deploy:
  steps:
    - run: docker build -t my-app .       # đóng gói môi trường nhất quán
    - run: docker run my-app npm test     # chạy test trước khi deploy
    - run: pm2 reload my-app               # zero-downtime reload
```

```bash
# PM2 cluster: tận dụng đa core + tự hồi phục khi crash
pm2 start index.js -i max
```

:::tip[Dùng thực tế]

- **PM2 cluster tự hồi phục:** một worker crash, PM2 tự dựng lại process khác, người dùng không bị gián đoạn.
- **Docker hoá để chạy giống nhau mọi nơi:** đóng gói Node + dependencies vào image, máy dev, staging và production chạy y hệt nhau.
- **Pipeline tự deploy khi merge:** merge vào nhánh chính là CI/CD tự build, test rồi đẩy lên server, không ai phải SSH thủ công.
- **Zero-downtime reload:** `pm2 reload` thay process lần lượt nên cập nhật phiên bản mới mà không có downtime.

:::

## Chuẩn bị Production

```js
// Kiểm tra NODE_ENV
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
  app.use(compression());
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
```

## Docker

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files first (tận dụng Docker cache)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
```

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## PM2 — Process Manager

```bash
npm install -g pm2

# Start app
pm2 start index.js --name my-app

# Cluster mode (tận dụng multi-core)
pm2 start index.js -i max

# Monitoring
pm2 monit

# Logs
pm2 logs my-app

# Auto-restart on file change (dev)
pm2 start index.js --watch
```

## Environment Variables trong Production

```bash
# Không dùng .env file trong production
# Set biến qua hosting platform hoặc CI/CD

# Heroku
heroku config:set DATABASE_URL=postgresql://...

# Docker
docker run -e DATABASE_URL=postgresql://... my-app

# Linux
export DATABASE_URL=postgresql://...
```

## Tóm tắt

- Docker cho reproducible deployments
- PM2 cluster mode tận dụng multi-core CPU
- Set env vars qua hosting platform, không dùng .env
- Graceful shutdown xử lý SIGTERM
