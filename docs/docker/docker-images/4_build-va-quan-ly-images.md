---
sidebar_position: 4
title: "4. Build và quản lý Images"
---

# Build và quản lý Images

Bài này hướng dẫn chi tiết quá trình build image, tối ưu hoá cache, và quản lý images hiệu quả.

---

## Mục lục

- [1. Docker Build chi tiết](#1-docker-build-chi-tiết)
- [2. Tối ưu Layer Caching](#2-tối-ưu-layer-caching)
- [3. Giảm dung lượng Image](#3-giảm-dung-lượng-image)
- [4. Xem và phân tích Image](#4-xem-và-phân-tích-image)
- [5. Tag Strategy (Chiến lược đánh tag)](#5-tag-strategy-chiến-lược-đánh-tag)
- [6. Export và Import Image](#6-export-và-import-image)
- [7. Quản lý Images hàng ngày](#7-quản-lý-images-hàng-ngày)
- [8. Bài tập thực hành](#8-bài-tập-thực-hành)
- [Tổng kết](#tổng-kết)

---

## 1. Docker Build chi tiết

### Lệnh build cơ bản

```bash
# Build từ Dockerfile trong thư mục hiện tại
docker build -t my-app:v1.0 .

# Giải thích:
# docker build  → Lệnh build
# -t my-app:v1.0 → Đặt tên:tag cho image
# .             → Build context (thư mục chứa Dockerfile)
```

### Các options build thường dùng

```bash
# Chỉ định Dockerfile khác
docker build -f Dockerfile.prod -t my-app:prod .

# Truyền build arguments
docker build --build-arg NODE_VERSION=20 -t my-app .

# Không dùng cache (build lại từ đầu)
docker build --no-cache -t my-app .

# Hiện chi tiết quá trình build
docker build --progress=plain -t my-app .

# Build cho platform khác (VD: build trên Mac M1 cho Linux AMD64)
docker build --platform linux/amd64 -t my-app .
```

---

## 2. Tối ưu Layer Caching

### Nguyên tắc caching

Docker cache mỗi layer. Nếu một layer thay đổi, tất cả layers sau nó đều phải build lại.

```
Layer 1: FROM node:20-alpine     ← Cache ✅
Layer 2: WORKDIR /app            ← Cache ✅
Layer 3: COPY package.json .     ← Cache ✅ (file không đổi)
Layer 4: RUN npm install         ← Cache ✅
Layer 5: COPY . .                ← REBUILD ❌ (code thay đổi)
Layer 6: CMD ["npm", "start"]    ← REBUILD ❌
```

### Sai: Copy code trước khi cài dependency

```dockerfile
# ❌ SAI: Mỗi lần đổi code → npm install lại!
FROM node:20-alpine
WORKDIR /app
COPY . .                 # Code thay đổi → layer này rebuild
RUN npm install          # → Layer này cũng rebuild (mất 2 phút!)
CMD ["npm", "start"]
```

### Đúng: Copy package.json trước

```dockerfile
# ✅ ĐÚNG: npm install chỉ chạy lại khi package.json thay đổi
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./    # Hiếm khi thay đổi → cache
RUN npm install          # Cache nếu package.json không đổi
COPY . .                 # Chỉ layer này rebuild khi code thay đổi
CMD ["npm", "start"]
```

### Gộp RUN commands

```dockerfile
# ❌ Nhiều layers không cần thiết
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y wget
RUN rm -rf /var/lib/apt/lists/*

# ✅ Gộp thành 1 layer
RUN apt-get update && \
    apt-get install -y curl wget && \
    rm -rf /var/lib/apt/lists/*
```

---

## 3. Giảm dung lượng Image

### Chọn base image nhỏ

```bash
# So sánh dung lượng Node.js images
node:20          # ~350MB
node:20-slim     # ~200MB
node:20-alpine   # ~130MB
```

### Xoá cache và file tạm trong cùng RUN

```dockerfile
# ❌ File tạm vẫn tồn tại trong layer trước
RUN apt-get update && apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*

# ✅ Xoá trong cùng layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*
```

### Dùng npm ci thay vì npm install

```dockerfile
# npm ci: Nhanh hơn, deterministic, phù hợp CI/CD
RUN npm ci --only=production

# Xoá npm cache
RUN npm ci --only=production && npm cache clean --force
```

### Sử dụng .dockerignore

```
node_modules
.git
.env
*.md
test
coverage
.DS_Store
```

---

## 4. Xem và phân tích Image

### Xem layers và dung lượng

```bash
# Xem layers
docker history my-app:v1.0

# Xem chi tiết
docker inspect my-app:v1.0

# Xem tổng dung lượng
docker images my-app
```

### Dive — Tool phân tích layers

[Dive](https://github.com/wagoodman/dive) là tool tuyệt vời để phân tích layers:

```bash
# Cài Dive (macOS)
brew install dive

# Phân tích image
dive my-app:v1.0
```

Dive cho phép:

- Xem dung lượng từng layer
- Tìm file lớn không cần thiết
- Đánh giá hiệu quả image

---

## 5. Tag Strategy (Chiến lược đánh tag)

### Semantic Versioning

```bash
# Build với version cụ thể
docker build -t my-app:1.0.0 .
docker build -t my-app:1.0 .
docker build -t my-app:1 .
docker build -t my-app:latest .

# Gắn nhiều tags cho cùng 1 build
docker tag my-app:1.0.0 my-app:1.0
docker tag my-app:1.0.0 my-app:1
docker tag my-app:1.0.0 my-app:latest
```

### Git-based Tags

```bash
# Dùng git commit hash
docker build -t my-app:$(git rev-parse --short HEAD) .

# Dùng git tag
docker build -t my-app:$(git describe --tags) .
```

### Timestamp Tags

```bash
# Dùng timestamp
docker build -t my-app:$(date +%Y%m%d-%H%M%S) .
# → my-app:20240115-143022
```

---

## 6. Export và Import Image

### Save image ra file

```bash
# Lưu image ra file tar
docker save -o my-app.tar my-app:v1.0

# Hoặc nén
docker save my-app:v1.0 | gzip > my-app.tar.gz
```

### Load image từ file

```bash
# Load từ file tar
docker load -i my-app.tar

# Load từ file nén
gunzip -c my-app.tar.gz | docker load
```

### Use case

- Chuyển image giữa các máy không có internet
- Backup image quan trọng
- Chia sẻ image qua USB/email

---

## 7. Quản lý Images hàng ngày

### Liệt kê và lọc

```bash
# Tất cả images
docker images

# Lọc theo repository
docker images my-app

# Lọc theo pattern
docker images --filter "reference=my-app:v*"

# Chỉ hiện dangling images
docker images --filter "dangling=true"

# Format output
docker images --format "{{.Repository}}:{{.Tag}} - {{.Size}}"
```

### Dọn dẹp

```bash
# Xoá 1 image
docker rmi my-app:v1.0

# Xoá dangling images
docker image prune

# Xoá tất cả images không dùng
docker image prune -a

# Xoá images cũ hơn 24h
docker image prune -a --filter "until=24h"
```

---

## 8. Bài tập thực hành

### Bài 1: Tối ưu Dockerfile

So sánh thời gian build giữa 2 Dockerfile sau:

**Dockerfile.bad:**

```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
```

**Dockerfile.good:**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
CMD ["node", "server.js"]
```

```bash
# Build cả 2
docker build -f Dockerfile.bad -t app-bad .
docker build -f Dockerfile.good -t app-good .

# So sánh dung lượng
docker images | grep app-

# Thay đổi 1 dòng code, build lại cả 2
# → app-good build nhanh hơn nhiều (npm install được cache)
```

### Bài 2: Multi-tag

```bash
# Build image
docker build -t my-app:1.0.0 .

# Gắn thêm tags
docker tag my-app:1.0.0 my-app:1.0
docker tag my-app:1.0.0 my-app:latest

# Kiểm tra
docker images my-app
# → 3 tags cùng IMAGE ID
```

---

## Tổng kết

| Kỹ thuật               | Lợi ích                                          |
| ---------------------- | ------------------------------------------------ |
| **Layer ordering**     | Copy dependency files trước code → cache tốt hơn |
| **Alpine images**      | Giảm 50-80% dung lượng                           |
| **Gộp RUN**            | Ít layers, nhỏ hơn                               |
| **.dockerignore**      | Build context nhỏ hơn, build nhanh hơn           |
| **npm ci**             | Cài nhanh, deterministic                         |
| **Multi-tag**          | Quản lý version tốt hơn                          |
| **docker image prune** | Giải phóng ổ cứng                                |
