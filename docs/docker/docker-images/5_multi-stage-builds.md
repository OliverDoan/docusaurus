---
sidebar_position: 5
title: "5. Multi-stage Builds"
---

# Multi-stage Builds

Multi-stage build là kỹ thuật nâng cao giúp tạo ra image production nhỏ gọn. Đây là best practice quan trọng nhất khi Dockerize ứng dụng.

---


---

## Mục lục

- [1. Vấn đề: Image quá lớn](#1-vấn-đề-image-quá-lớn)
- [2. Multi-stage Build là gì?](#2-multi-stage-build-là-gì)
- [3. Cú pháp](#3-cú-pháp)
- [4. Ví dụ thực tế](#4-ví-dụ-thực-tế)
- [5. So sánh kết quả](#5-so-sánh-kết-quả)
- [6. Build stage cụ thể](#6-build-stage-cụ-thể)
- [7. Tips nâng cao](#7-tips-nâng-cao)
- [8. Bài tập thực hành](#8-bài-tập-thực-hành)
- [Tổng kết](#tổng-kết)

---

## 1. Vấn đề: Image quá lớn

Khi build ứng dụng, bạn cần **build tools** (compiler, dev dependencies...) nhưng **không cần chúng khi chạy**.

### Ví dụ: React app

```dockerfile
# ❌ Image chứa cả build tools — quá lớn!
FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm install          # Cài CẢ devDependencies (webpack, babel...)
COPY . .
RUN npm run build        # Build ra thư mục dist/

# Image chứa: node_modules (500MB) + source code + build tools
# Nhưng chỉ cần: thư mục dist/ (~5MB) + web server

EXPOSE 3000
CMD ["npx", "serve", "-s", "dist"]

# → Image size: ~800MB (cần thực tế: ~50MB)
```

---

## 2. Multi-stage Build là gì?

Multi-stage build cho phép dùng **nhiều FROM** trong 1 Dockerfile. Mỗi FROM tạo một "stage" riêng biệt:

```dockerfile
# ====== Stage 1: Build ======
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ====== Stage 2: Production ======
FROM nginx:alpine

# Chỉ copy kết quả build từ stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
# → Image size: ~50MB (thay vì 800MB!)
```

### Cách hoạt động

```
Stage 1 (builder):                    Stage 2 (production):
┌──────────────────────┐              ┌──────────────────────┐
│ node:20-alpine       │              │ nginx:alpine         │
│ + node_modules       │   COPY       │ + dist/ files only   │
│ + source code        │ ─────────→   │                      │
│ + build tools        │  (chỉ dist/) │ → Image cuối ~50MB   │
│ + dist/ (kết quả)   │              └──────────────────────┘
│                      │
│ → Stage này bị bỏ   │
└──────────────────────┘
```

**Chỉ stage cuối cùng** trở thành image. Các stages trước chỉ là bước trung gian.

---

## 3. Cú pháp

### Đặt tên stage với AS

```dockerfile
FROM node:20-alpine AS builder
# ...

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
```

### Copy từ stage khác

```dockerfile
# Copy từ stage đã đặt tên
COPY --from=builder /app/dist ./dist

# Copy từ stage theo số thứ tự (0-indexed)
COPY --from=0 /app/dist ./dist
```

### Copy từ image bên ngoài

```dockerfile
# Copy binary từ image khác (không cần build)
COPY --from=golang:1.22-alpine /usr/local/go/bin/go /usr/local/bin/go
```

---

## 4. Ví dụ thực tế

### React / Vue / Angular (Frontend)

```dockerfile
# ====== Stage 1: Build ======
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ====== Stage 2: Serve ======
FROM nginx:alpine

# Copy nginx config tuỳ chỉnh (nếu có)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Node.js (Backend API)

```dockerfile
# ====== Stage 1: Install dependencies ======
FROM node:20-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ====== Stage 2: Build (nếu dùng TypeScript) ======
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ====== Stage 3: Production ======
FROM node:20-alpine

WORKDIR /app

# Copy production dependencies từ stage deps
COPY --from=deps /app/node_modules ./node_modules

# Copy compiled code từ stage builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
EXPOSE 3000

USER node
CMD ["node", "dist/server.js"]
```

### Python (FastAPI)

```dockerfile
# ====== Stage 1: Build ======
FROM python:3.12-slim AS builder

WORKDIR /app

# Cài build dependencies (gcc, etc.)
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ====== Stage 2: Production ======
FROM python:3.12-slim

WORKDIR /app

# Copy chỉ installed packages (không cần gcc)
COPY --from=builder /install /usr/local

COPY . .

RUN useradd --create-home appuser
USER appuser

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Go (Golang)

Go là ví dụ hoàn hảo cho multi-stage vì build ra binary duy nhất:

```dockerfile
# ====== Stage 1: Build ======
FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server .

# ====== Stage 2: Production ======
FROM scratch

# Copy binary duy nhất
COPY --from=builder /app/server /server

EXPOSE 8080
ENTRYPOINT ["/server"]

# → Image size: ~10MB! (từ scratch, chỉ có binary)
```

---

## 5. So sánh kết quả

| Ứng dụng | Không multi-stage | Có multi-stage | Giảm |
|----------|------------------|---------------|------|
| React app | ~800MB | ~50MB | 94% |
| Node.js API | ~350MB | ~150MB | 57% |
| Python API | ~500MB | ~200MB | 60% |
| Go API | ~400MB | ~10MB | 97% |

---

## 6. Build stage cụ thể

Bạn có thể build chỉ 1 stage (hữu ích khi debug):

```bash
# Chỉ build stage "builder"
docker build --target builder -t my-app:builder .

# Build stage cuối (mặc định)
docker build -t my-app:prod .
```

### Use case: Dev vs Prod

```dockerfile
# ====== Stage 1: Base ======
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ====== Stage 2: Development ======
FROM base AS development
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# ====== Stage 3: Production ======
FROM base AS production
RUN npm ci --only=production
COPY . .
CMD ["node", "server.js"]
```

```bash
# Build cho dev
docker build --target development -t my-app:dev .

# Build cho prod
docker build --target production -t my-app:prod .
```

---

## 7. Tips nâng cao

### Cache mount (BuildKit)

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine
WORKDIR /app

COPY package*.json ./

# Mount npm cache → Không cần tải lại packages đã có
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production

COPY . .
CMD ["node", "server.js"]
```

```bash
# Bật BuildKit
DOCKER_BUILDKIT=1 docker build -t my-app .
```

### Secret mount (không lưu secrets vào image)

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine
WORKDIR /app

# Mount secret khi build — KHÔNG lưu vào image
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm ci --only=production
```

```bash
docker build --secret id=npmrc,src=.npmrc -t my-app .
```

---

## 8. Bài tập thực hành

Tạo một React app đơn giản và build với multi-stage:

```bash
# Tạo React app
npx create-react-app docker-multi-stage
cd docker-multi-stage
```

Tạo Dockerfile:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
```

```bash
# Build
docker build -t react-app .

# Kiểm tra dung lượng
docker images react-app
# → Khoảng 40-50MB thay vì 800MB+

# Chạy
docker run -d -p 8080:80 react-app
# → Mở http://localhost:8080
```

---

## Tổng kết

| Khái niệm | Giải thích |
|-----------|-----------|
| **Multi-stage** | Nhiều FROM trong 1 Dockerfile |
| **AS** | Đặt tên cho stage |
| **COPY --from** | Copy file từ stage khác |
| **--target** | Build chỉ 1 stage cụ thể |
| **Stage cuối** | Chỉ stage cuối thành image |
| **Kết quả** | Image nhỏ hơn 50-97% |

### Khi nào dùng Multi-stage?

- Ứng dụng cần **build step** (compile, transpile, bundle)
- Muốn tách **dev dependencies** khỏi production image
- Cần image production **nhỏ gọn và bảo mật**
- Hầu như **luôn luôn** nên dùng cho production
