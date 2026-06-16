---
sidebar_position: 4
title: "4. Best Practices và bảo mật"
---

# Best Practices và Bảo mật

Bài này tổng hợp các best practices quan trọng nhất khi làm việc với Docker, từ viết Dockerfile đến bảo mật.

---

## Mục lục

- [Vì sao cần best practices & bảo mật?](#vì-sao-cần-best-practices--bảo-mật)
- [1. Dockerfile Best Practices](#1-dockerfile-best-practices)
- [2. Security Best Practices](#2-security-best-practices)
- [3. Performance Best Practices](#3-performance-best-practices)
- [4. Development Best Practices](#4-development-best-practices)
- [5. Networking Best Practices](#5-networking-best-practices)
- [6. Tổng kết Checklist](#6-tổng-kết-checklist)

---

## Vì sao cần best practices & bảo mật?

**Vấn đề:** Image/container làm "cho chạy được" thường KHÔNG an toàn và cồng kềnh.

```dockerfile
# ❌ Image kiểu "miễn là chạy"
FROM node:latest                 # tag latest, đổi bất cứ lúc nào
COPY . .                         # copy luôn cả .env, .git
ENV DB_PASSWORD=super-secret-123 # secret nhúng cứng vào layer → lộ vĩnh viễn
RUN npm install
CMD ["node", "server.js"]        # chạy bằng root → chiếm container = nguy hiểm cho host
```

Hậu quả: chạy bằng **root** (kẻ tấn công thoát container có thể tác động tới host), image nền to chứa nhiều CVE, **secret** lộ vĩnh viễn trong lịch sử layer (dù sau đó có xoá), tag `latest` không kiểm soát, và không hề quét lỗ hổng.

**Giải pháp:** Áp dụng best practices bảo mật theo nguyên tắc least privilege.

```dockerfile
# ✅ An toàn + gọn nhẹ
# Stage build
FROM node:20.11-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Stage runtime — distroless, không shell, bề mặt tấn công nhỏ
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=build /app /app
USER nonroot                     # không chạy bằng root
# KHÔNG nhúng secret — truyền qua env/secret lúc runtime
CMD ["server.js"]
```

```bash
# Ghim version + quét lỗ hổng trong CI trước khi deploy
docker build -t my-app:1.4.2 .
trivy image --exit-code 1 --severity HIGH,CRITICAL my-app:1.4.2

# Secret truyền lúc runtime, không nằm trong image
docker run -e DB_PASSWORD="$DB_PASSWORD" my-app:1.4.2
```

:::tip[Dùng thực tế]

- **Thêm USER non-root:** service Node/Python production luôn `USER appuser` thay vì root, để nếu bị chiếm container thì thiệt hại bị giới hạn.
- **Dùng distroless/alpine:** đổi image runtime sang distroless giảm bề mặt tấn công (không shell, không package thừa) và giảm số CVE phải vá.
- **Không COPY .env vào image:** thêm `.env`, `.git` vào `.dockerignore`; cấu hình nhạy cảm truyền qua env/secret lúc `docker run` hoặc orchestrator.
- **Quét image bằng Trivy/Scout trong CI:** chặn pipeline khi có lỗ hổng HIGH/CRITICAL, tránh đẩy image dính CVE lên production.

:::

---

## 1. Dockerfile Best Practices

### Chọn base image tốt

```dockerfile
# ✅ Alpine — nhỏ, ít CVE
FROM node:20-alpine

# ✅ Slim — vừa phải
FROM python:3.12-slim

# ❌ Full — lớn, nhiều package không cần
FROM node:20
FROM ubuntu:latest
```

### Specific tags, không dùng latest

```dockerfile
# ✅ Version cụ thể — reproducible builds
FROM node:20.11-alpine
FROM postgres:16.1-alpine

# ❌ Latest — thay đổi bất cứ lúc nào
FROM node:latest
FROM postgres:latest
```

### Thứ tự COPY để tối ưu cache

```dockerfile
# ✅ Dependency files trước → code sau
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# ❌ Copy tất cả trước → Mỗi lần đổi code, npm install lại
COPY . .
RUN npm install
```

### Gộp RUN commands

```dockerfile
# ✅ 1 layer, dọn dẹp trong cùng layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# ❌ Nhiều layers, file tạm vẫn tồn tại trong layer trước
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*
```

### Dùng COPY thay vì ADD

```dockerfile
# ✅ COPY rõ ràng
COPY package.json .

# ❌ ADD có tính năng ẩn (auto-extract, URL download)
ADD package.json .
```

### .dockerignore đầy đủ

```
node_modules
.git
.env
.env.local
*.md
test
coverage
.DS_Store
.vscode
.idea
dist
build
tmp
logs
```

---

## 2. Security Best Practices

### Chạy với non-root user

```dockerfile
# ✅ Tạo và chuyển sang non-root user
FROM node:20-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY --chown=appuser:appgroup . .
RUN npm ci --only=production

USER appuser
CMD ["node", "server.js"]
```

```bash
# Kiểm tra user trong container
docker exec my-app whoami
# appuser (không phải root)
```

### Không lưu secrets trong image

```dockerfile
# ❌ Secret trong Dockerfile → Ai inspect image cũng thấy
ENV API_KEY=sk-super-secret-key
RUN echo "password123" > /app/.env

# ✅ Truyền qua environment khi run
# docker run -e API_KEY=sk-xxx my-app

# ✅ Dùng Docker secrets
# docker run --secret api_key my-app
```

### Scan image cho vulnerabilities

```bash
# Docker Scout (tích hợp sẵn)
docker scout quickview my-app:latest
docker scout cves my-app:latest

# Trivy (open source)
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image my-app:latest
```

### Không mount Docker socket

```bash
# ❌ Container có toàn quyền với Docker host!
docker run -v /var/run/docker.sock:/var/run/docker.sock my-app

# Chỉ mount khi thật sự cần (monitoring tools, CI/CD agents)
```

### Read-only filesystem

```bash
# Container chỉ đọc, không ghi được
docker run --read-only \
  --tmpfs /tmp \
  --tmpfs /app/cache \
  my-app
```

### Giới hạn capabilities

```bash
# Bỏ tất cả capabilities, chỉ thêm cần thiết
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE my-app
```

---

## 3. Performance Best Practices

### Image nhỏ = Deploy nhanh

```
node:20          350MB → Pull: 30s
node:20-slim     200MB → Pull: 15s
node:20-alpine   130MB → Pull: 8s
```

### Multi-stage builds

```dockerfile
# Build stage: 800MB (có devDependencies + build tools)
# Prod stage:  120MB (chỉ production deps + built code)
```

### Layer cache hiệu quả

```
Thay đổi code → Chỉ rebuild 1-2 layers → Build trong 10 giây
Thay vì rebuild từ đầu → 5 phút
```

### Resource limits

```yaml
# Ngăn 1 container chiếm hết tài nguyên
deploy:
  resources:
    limits:
      cpus: "1"
      memory: 512M
```

---

## 4. Development Best Practices

### Dùng docker-compose.override.yml

```yaml
# docker-compose.yml (base — cho cả dev và prod)
services:
  app:
    build: .
    ports:
      - "3000:3000"

# docker-compose.override.yml (auto-loaded cho dev)
services:
  app:
    volumes:
      - ./src:/app/src
    environment:
      NODE_ENV: development
    command: npm run dev
```

### Hot reload với bind mounts

```yaml
services:
  app:
    volumes:
      - ./src:/app/src # Code hot reload
      - node_modules:/app/node_modules # Tránh xung đột
volumes:
  node_modules:
```

### Makefile cho Docker commands

```makefile
# Makefile
.PHONY: up down build logs shell db-shell migrate seed

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose up -d --build

logs:
	docker compose logs -f

shell:
	docker compose exec app sh

db-shell:
	docker compose exec db psql -U postgres

migrate:
	docker compose exec app npm run migrate

seed:
	docker compose exec app npm run seed

clean:
	docker compose down -v --rmi local
	docker system prune -f
```

```bash
make up        # Start
make logs      # Xem logs
make shell     # Vào container
make clean     # Dọn dẹp
```

---

## 5. Networking Best Practices

### Tách network cho frontend và backend

```yaml
services:
  nginx:
    networks: [frontend]
  api:
    networks: [frontend, backend]
  db:
    networks: [backend] # Không thể truy cập từ nginx

networks:
  frontend:
  backend:
```

### Không expose port không cần thiết

```yaml
services:
  db:
    image: postgres:16
    # ❌ Expose ra ngoài
    ports:
      - "5432:5432"

    # ✅ Chỉ expose nội bộ (trong Docker network)
    expose:
      - "5432"
```

---

## 6. Tổng kết Checklist

### Dockerfile

- [ ] Specific base image tag (không dùng `latest`)
- [ ] Alpine hoặc slim image
- [ ] COPY dependency files trước code
- [ ] Gộp RUN commands
- [ ] Non-root USER
- [ ] HEALTHCHECK
- [ ] .dockerignore đầy đủ
- [ ] Multi-stage build cho production

### Security

- [ ] Non-root user
- [ ] Không hardcode secrets
- [ ] Scan vulnerabilities
- [ ] Read-only filesystem (khi có thể)
- [ ] Minimal capabilities
- [ ] Network isolation

### Operations

- [ ] Resource limits (CPU, RAM)
- [ ] Restart policy
- [ ] Log rotation
- [ ] Health checks
- [ ] Backup strategy
- [ ] Monitoring
