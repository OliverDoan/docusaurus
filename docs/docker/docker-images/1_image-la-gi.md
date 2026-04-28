---
sidebar_position: 1
title: "1. Docker Image là gì?"
---

# Docker Image là gì?

Docker Image là nền tảng của mọi thứ trong Docker. Hiểu rõ Image sẽ giúp bạn build ứng dụng hiệu quả và tối ưu hơn.

---


---

## Mục lục

- [1. Image — Bản thiết kế của Container](#1-image-bản-thiết-kế-của-container)
- [2. Cấu trúc Layers](#2-cấu-trúc-layers)
- [3. Xem thông tin Image](#3-xem-thông-tin-image)
- [4. Image ID và Digest](#4-image-id-và-digest)
- [5. Quản lý Image Tags](#5-quản-lý-image-tags)
- [6. Dangling Images](#6-dangling-images)
- [7. Bài tập thực hành](#7-bài-tập-thực-hành)
- [Tổng kết](#tổng-kết)

---

## 1. Image — Bản thiết kế của Container

**Docker Image** là một gói (package) read-only chứa mọi thứ cần thiết để chạy ứng dụng:

```
Docker Image = OS cơ bản + Runtime + Libraries + Code + Config
```

### So sánh dễ hiểu

| Thế giới thực | Docker |
|---------------|--------|
| File ISO cài Windows | Docker Image |
| Máy tính đã cài từ ISO | Docker Container |
| Khuôn bánh | Image |
| Chiếc bánh | Container |
| Class trong OOP | Image |
| Object (instance) | Container |

### Đặc điểm quan trọng

1. **Read-only**: Image không thể thay đổi sau khi build
2. **Layered**: Được xây dựng từ nhiều lớp (layers)
3. **Portable**: Chạy được trên bất kỳ máy nào có Docker
4. **Shareable**: Chia sẻ qua Registry (Docker Hub)

---

## 2. Cấu trúc Layers

Mỗi Image được tạo từ nhiều **layers** xếp chồng lên nhau:

```
Image: my-node-app

┌─────────────────────────────────────┐
│ Layer 6: CMD ["node", "server.js"]  │  ← Lệnh chạy
├─────────────────────────────────────┤
│ Layer 5: COPY . .                   │  ← Code ứng dụng (~2MB)
├─────────────────────────────────────┤
│ Layer 4: RUN npm install            │  ← node_modules (~150MB)
├─────────────────────────────────────┤
│ Layer 3: COPY package*.json .       │  ← File config (~5KB)
├─────────────────────────────────────┤
│ Layer 2: WORKDIR /app               │  ← Metadata (~0B)
├─────────────────────────────────────┤
│ Layer 1: FROM node:18-alpine        │  ← Base image (~130MB)
└─────────────────────────────────────┘
```

### Tại sao dùng Layers?

**1. Caching — Build nhanh hơn**

Nếu chỉ thay đổi code (Layer 5), Docker chỉ build lại layer 5 và 6. Layers 1-4 lấy từ cache.

```
Lần build đầu:  Layer 1 (build) → 2 (build) → 3 (build) → 4 (build) → 5 (build)
Lần build sau:  Layer 1 (cache) → 2 (cache) → 3 (cache) → 4 (cache) → 5 (build lại)

→ Từ 5 phút xuống 10 giây!
```

**2. Sharing — Tiết kiệm ổ cứng**

```
Image A (node:18-alpine → frontend)  ──┐
                                        ├── Chia sẻ layer node:18-alpine (130MB)
Image B (node:18-alpine → backend)   ──┘

→ Chỉ lưu 130MB thay vì 260MB
```

**3. Distribution — Tải nhanh hơn**

Khi pull image, Docker chỉ tải những layers chưa có trên máy.

---

## 3. Xem thông tin Image

### Liệt kê images

```bash
docker images

# REPOSITORY     TAG          IMAGE ID       CREATED        SIZE
# node           18-alpine    abc123def456   3 days ago     172MB
# nginx          alpine       789ghi012jkl   1 week ago     43MB
# postgres       16           mno345pqr678   2 days ago     432MB
```

### Xem layers của image

```bash
docker history node:18-alpine

# IMAGE          CREATED       CREATED BY                                      SIZE
# abc123def456   3 days ago    CMD ["node"]                                    0B
# <missing>      3 days ago    ENTRYPOINT ["docker-entrypoint.sh"]            0B
# <missing>      3 days ago    COPY docker-entrypoint.sh /usr/local/bin/      326B
# <missing>      3 days ago    RUN /bin/sh -c apk add --no-cache...           7.8MB
# <missing>      3 days ago    ENV NODE_VERSION=18.19.0                        0B
# <missing>      2 weeks ago   /bin/sh -c #(nop)  CMD ["/bin/sh"]             0B
# <missing>      2 weeks ago   /bin/sh -c #(nop) ADD file:...                 7.38MB
```

### Xem chi tiết image

```bash
docker inspect node:18-alpine

# Hiện JSON chi tiết: OS, architecture, layers, env vars, exposed ports...
```

### Xem dung lượng thực tế

```bash
docker system df

# TYPE            TOTAL   ACTIVE   SIZE      RECLAIMABLE
# Images          5       2        1.23GB    800MB (65%)
```

---

## 4. Image ID và Digest

### Image ID

Mỗi image có một **ID** duy nhất (SHA256 hash):

```bash
docker images --no-trunc

# REPOSITORY   TAG    IMAGE ID                                                            SIZE
# nginx        alpine sha256:a8758716bb6af0d1e4fca24e5f25d658e3fee48c5086d4aed82... 43MB
```

### Image Digest

**Digest** là hash của image trên Registry, đảm bảo image bạn pull chính xác là image bạn muốn:

```bash
docker images --digests

# REPOSITORY   TAG    DIGEST                                                        SIZE
# nginx        alpine sha256:abcdef1234567890abcdef1234567890abcdef12345678...     43MB
```

```bash
# Pull image theo digest (chính xác tuyệt đối)
docker pull nginx@sha256:abcdef1234567890...
```

---

## 5. Quản lý Image Tags

### Tag là gì?

**Tag** là nhãn đặt cho image, thường dùng để chỉ version:

```bash
# Cùng 1 image, nhiều tags
node:20          # Version 20
node:20.11       # Version 20.11
node:20.11.0     # Version chính xác
node:20-alpine   # Version 20, Alpine Linux
node:lts         # Long Term Support
node:latest      # Mới nhất
```

### Gắn tag cho image

```bash
# Gắn tag mới cho image có sẵn
docker tag my-app:latest my-app:v1.0
docker tag my-app:latest my-app:v1.0.0

# Gắn tag cho push lên registry
docker tag my-app:latest username/my-app:v1.0
```

### Xoá tag

```bash
# Xoá tag (không xoá image nếu còn tag khác)
docker rmi my-app:v1.0
```

---

## 6. Dangling Images

**Dangling image** là image không có tag (hiện `<none>`), thường xuất hiện sau khi rebuild:

```bash
docker images

# REPOSITORY   TAG       IMAGE ID       SIZE
# my-app       latest    abc123456789   250MB
# <none>       <none>    def987654321   245MB   ← Dangling image
```

### Dọn dẹp dangling images

```bash
# Xoá tất cả dangling images
docker image prune

# Xoá tất cả images không dùng (bao gồm cả có tag)
docker image prune -a
```

---

## 7. Bài tập thực hành

```bash
# 1. Pull 3 images khác nhau
docker pull nginx:alpine
docker pull node:20-alpine
docker pull python:3.12-slim

# 2. Liệt kê images, so sánh dung lượng
docker images

# 3. Xem layers của nginx
docker history nginx:alpine

# 4. Inspect chi tiết node image
docker inspect node:20-alpine

# 5. Tag nginx với tên mới
docker tag nginx:alpine my-nginx:v1

# 6. Liệt kê lại, thấy my-nginx:v1 xuất hiện
docker images

# 7. Xoá tag mới
docker rmi my-nginx:v1

# 8. Xem dung lượng
docker system df
```

---

## Tổng kết

| Khái niệm | Giải thích |
|-----------|-----------|
| **Image** | Gói read-only chứa OS + runtime + code |
| **Layer** | Mỗi lệnh Dockerfile tạo 1 layer |
| **Tag** | Nhãn version cho image (`node:20-alpine`) |
| **Dangling** | Image không có tag (`<none>`) |
| **Image ID** | SHA256 hash duy nhất cho mỗi image |
| **Digest** | Hash trên Registry, đảm bảo tính toàn vẹn |
