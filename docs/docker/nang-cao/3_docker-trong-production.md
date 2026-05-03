---
sidebar_position: 3
title: "3. Docker trong Production"
---

# Docker trong Production

Chạy Docker trong production khác rất nhiều so với development. Bài này hướng dẫn các nguyên tắc và best practices khi deploy Docker lên production.

---

## Mục lục

- [1. Development vs Production](#1-development-vs-production)
- [2. Dockerfile cho Production](#2-dockerfile-cho-production)
- [3. Docker Compose cho Production](#3-docker-compose-cho-production)
- [4. Logging trong Production](#4-logging-trong-production)
- [5. Health Checks](#5-health-checks)
- [6. Deployment Strategies](#6-deployment-strategies)
- [7. Monitoring](#7-monitoring)
- [8. Backup Strategy](#8-backup-strategy)
- [9. Checklist Production](#9-checklist-production)
- [Tổng kết](#tổng-kết)

---

## 1. Development vs Production

| Yếu tố           | Development             | Production                     |
| ---------------- | ----------------------- | ------------------------------ |
| **Dockerfile**   | Cài devDependencies     | Chỉ production dependencies    |
| **Source code**  | Bind mount (hot reload) | COPY vào image                 |
| **Debug**        | Port debug mở           | Đóng hết                       |
| **Logging**      | stdout đủ               | Structured logging, log driver |
| **Restart**      | Manual                  | Auto-restart                   |
| **Health check** | Tuỳ chọn                | Bắt buộc                       |
| **Security**     | Chạy root OK            | Non-root bắt buộc              |
| **Resources**    | Không giới hạn          | Giới hạn CPU/RAM               |

---

## 2. Dockerfile cho Production

### Multi-stage build

```dockerfile
# ====== Stage 1: Dependencies ======
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ====== Stage 2: Build ======
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ====== Stage 3: Production ======
FROM node:20-alpine

# Security: Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy chỉ production dependencies
COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules

# Copy built code
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/package.json ./

# Environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --spider -q http://localhost:3000/health || exit 1

# Non-root user
USER appuser

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

---

## 3. Docker Compose cho Production

```yaml
# docker-compose.prod.yml
services:
  app:
    image: myregistry/my-app:${VERSION:-latest}
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 1G
        reservations:
          cpus: "0.5"
          memory: 256M
      replicas: 2
    restart: always
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: myapp
    volumes:
      - pgdata:/var/lib/postgresql/data
    deploy:
      resources:
        limits:
          memory: 2G
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 10s
      timeout: 5s
      retries: 5

  cache:
    image: redis:7-alpine
    volumes:
      - redisdata:/data
    deploy:
      resources:
        limits:
          memory: 512M
    restart: always

volumes:
  pgdata:
  redisdata:
```

---

## 4. Logging trong Production

### Log Drivers

```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m" # Mỗi file log tối đa 10MB
        max-file: "5" # Giữ tối đa 5 file
        compress: "true" # Nén file cũ
```

### Structured Logging

Ứng dụng nên log dạng JSON:

```javascript
// Thay vì
console.log("User logged in: john");

// Dùng structured logging
console.log(
  JSON.stringify({
    level: "info",
    event: "user_login",
    user: "john",
    timestamp: new Date().toISOString(),
  }),
);
```

---

## 5. Health Checks

### Tại sao cần Health Check?

- Load balancer biết container nào **khoẻ** để gửi traffic
- Docker biết khi nào cần **restart** container
- `depends_on` biết khi nào service **sẵn sàng**

### Health endpoint trong ứng dụng

```javascript
// /health endpoint
app.get("/health", async (req, res) => {
  try {
    // Kiểm tra database connection
    await db.query("SELECT 1");

    // Kiểm tra Redis connection
    await redis.ping();

    res.status(200).json({ status: "healthy" });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
    });
  }
});
```

---

## 6. Deployment Strategies

### Rolling Update

```bash
# Build image mới
docker build -t my-app:v2.0 .
docker push myregistry/my-app:v2.0

# Trên server: Pull và restart
docker compose pull
docker compose up -d

# Docker sẽ restart từng service
```

### Blue-Green Deployment

```bash
# Đang chạy v1 (blue) trên port 3000
# Deploy v2 (green) trên port 3001

docker run -d --name app-green -p 3001:3000 my-app:v2.0

# Test v2 OK → Switch nginx sang port 3001
# Xoá v1
docker rm -f app-blue
```

### Đơn giản nhất: Pull + Up

```bash
# Script deploy.sh
#!/bin/bash
cd /app

# Pull images mới
docker compose pull

# Restart với images mới
docker compose up -d --remove-orphans

# Dọn dẹp images cũ
docker image prune -f

echo "Deployed at $(date)"
```

---

## 7. Monitoring

### Docker Stats

```bash
# Monitor realtime
docker stats

# Định kỳ lưu stats
docker stats --no-stream --format \
  "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" >> /var/log/docker-stats.log
```

### Checklist monitoring

- [ ] CPU/Memory usage mỗi container
- [ ] Container restarts (restart count)
- [ ] Health check status
- [ ] Disk usage (`docker system df`)
- [ ] Log volume

---

## 8. Backup Strategy

### Database backup tự động

```bash
#!/bin/bash
# backup.sh - Chạy hàng ngày qua cron

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL
docker exec postgres-db pg_dump -U postgres myapp | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Giữ 7 ngày backup
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Cron job: Backup mỗi ngày lúc 2AM
0 2 * * * /app/backup.sh >> /var/log/backup.log 2>&1
```

### Volume backup

```bash
# Backup volume
docker run --rm \
  -v pgdata:/data:ro \
  -v /backups:/backup \
  alpine tar czf /backup/pgdata-$(date +%Y%m%d).tar.gz -C /data .
```

---

## 9. Checklist Production

Trước khi deploy lên production:

### Image

- [ ] Multi-stage build (image nhỏ)
- [ ] Non-root user
- [ ] Specific image tags (không dùng `latest`)
- [ ] `.dockerignore` đầy đủ
- [ ] Scan vulnerabilities

### Container

- [ ] Resource limits (CPU, Memory)
- [ ] Health checks
- [ ] Restart policy (`unless-stopped` hoặc `always`)
- [ ] Log rotation (`max-size`, `max-file`)

### Data

- [ ] Named volumes cho persistent data
- [ ] Backup strategy
- [ ] Không bind mount source code

### Security

- [ ] Không hardcode secrets
- [ ] Secrets qua env vars hoặc Docker secrets
- [ ] Network isolation (frontend/backend)
- [ ] Minimal base images (Alpine)

### Monitoring

- [ ] Health check endpoints
- [ ] Resource monitoring
- [ ] Log aggregation
- [ ] Alert khi container unhealthy/restart

---

## Tổng kết

| Aspect         | Recommendation                       |
| -------------- | ------------------------------------ |
| **Dockerfile** | Multi-stage, non-root, specific tags |
| **Resources**  | Always set limits                    |
| **Health**     | Always add health checks             |
| **Restart**    | `unless-stopped` or `always`         |
| **Logging**    | JSON driver + rotation               |
| **Secrets**    | Env vars, never hardcode             |
| **Backup**     | Automated daily backups              |
| **Deploy**     | Pull + Up, or Blue-Green             |
