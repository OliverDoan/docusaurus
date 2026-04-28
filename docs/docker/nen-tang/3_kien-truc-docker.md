---
sidebar_position: 3
title: "3. Kiến trúc Docker"
---

# Kiến trúc Docker

Hiểu cách Docker hoạt động bên trong sẽ giúp bạn debug nhanh hơn và sử dụng Docker hiệu quả hơn. Bài này giải thích kiến trúc Docker từ tổng quan đến chi tiết.

---


---

## Mục lục

- [1. Kiến trúc Client-Server](#1-kiến-trúc-client-server)
- [2. Docker Daemon (dockerd)](#2-docker-daemon-dockerd)
- [3. Docker Image chi tiết](#3-docker-image-chi-tiết)
- [4. Docker Container chi tiết](#4-docker-container-chi-tiết)
- [5. Docker Registry](#5-docker-registry)
- [6. Cách Docker cô lập Container](#6-cách-docker-cô-lập-container)
- [7. Tổng kết kiến trúc](#7-tổng-kết-kiến-trúc)

---

## 1. Kiến trúc Client-Server

Docker sử dụng mô hình **Client-Server**:

```
┌─────────────────────────────────────────────────┐
│                  Docker Client                   │
│  (docker CLI — nơi bạn gõ lệnh)                │
│                                                  │
│  docker build    docker run    docker pull       │
└───────────────────┬─────────────────────────────┘
                    │ REST API
                    ▼
┌─────────────────────────────────────────────────┐
│                Docker Daemon (dockerd)            │
│  (chạy ngầm, xử lý mọi yêu cầu)               │
│                                                  │
│  ┌──────────┐ ┌───────────┐ ┌────────────┐     │
│  │ Images   │ │Containers │ │ Networks   │     │
│  └──────────┘ └───────────┘ └────────────┘     │
│  ┌──────────┐ ┌───────────┐                     │
│  │ Volumes  │ │ Registry  │                     │
│  └──────────┘ └───────────┘                     │
└─────────────────────────────────────────────────┘
```

### Ba thành phần chính

| Thành phần | Vai trò | Ví dụ |
|-----------|--------|-------|
| **Docker Client** | Giao diện người dùng (CLI) | `docker run`, `docker build` |
| **Docker Daemon** | Xử lý mọi thao tác | Tạo container, build image |
| **Docker Registry** | Kho lưu trữ image | Docker Hub, GitHub Container Registry |

---

## 2. Docker Daemon (dockerd)

**Docker Daemon** là "bộ não" của Docker. Nó chạy ngầm (background) và quản lý:

- **Images**: Tải, build, lưu trữ image
- **Containers**: Tạo, chạy, dừng, xoá container
- **Networks**: Kết nối các container với nhau
- **Volumes**: Lưu trữ dữ liệu persistent

```bash
# Kiểm tra Docker Daemon đang chạy
docker info

# Trên Linux, quản lý daemon bằng systemd
sudo systemctl status docker
sudo systemctl start docker
sudo systemctl stop docker
```

---

## 3. Docker Image chi tiết

### Image là gì?

Image là một **hệ thống file read-only** được xây dựng theo các **lớp (layers)**.

### Cấu trúc layers

```
┌──────────────────────────────┐
│  Layer 5: COPY . .           │  ← Code ứng dụng
├──────────────────────────────┤
│  Layer 4: RUN npm install    │  ← Dependencies
├──────────────────────────────┤
│  Layer 3: COPY package.json  │  ← File config
├──────────────────────────────┤
│  Layer 2: WORKDIR /app       │  ← Tạo thư mục
├──────────────────────────────┤
│  Layer 1: FROM node:18       │  ← Base image (OS + Node.js)
└──────────────────────────────┘
```

### Tại sao dùng layers?

**Caching**: Nếu một layer không thay đổi, Docker sẽ dùng lại (cache) thay vì build lại.

```dockerfile
FROM node:18          # Layer 1 — Cache (không đổi)
WORKDIR /app          # Layer 2 — Cache (không đổi)
COPY package.json .   # Layer 3 — Cache nếu package.json không đổi
RUN npm install       # Layer 4 — Cache nếu layer 3 cache
COPY . .              # Layer 5 — Chỉ layer này build lại khi code thay đổi
```

**Chia sẻ**: Nhiều image có thể chia sẻ cùng base layer, tiết kiệm ổ cứng.

```
Image A (node:18 → app-frontend)  ──┐
                                     ├── Chia sẻ layer node:18
Image B (node:18 → app-backend)   ──┘
```

### Xem layers của image

```bash
# Xem lịch sử layers
docker history node:18

# Xem chi tiết image
docker inspect node:18
```

---

## 4. Docker Container chi tiết

### Container là gì bên trong?

Container là một **instance đang chạy** của image, với thêm một **writable layer** ở trên cùng.

```
┌──────────────────────────────┐
│  Writable Layer (Container)  │  ← Dữ liệu thay đổi khi chạy
├──────────────────────────────┤
│  Read-only Layers (Image)    │  ← Không thể thay đổi
│  Layer 5: App code           │
│  Layer 4: Dependencies       │
│  Layer 3: Config             │
│  Layer 2: Workdir            │
│  Layer 1: Base OS + Runtime  │
└──────────────────────────────┘
```

### Container sử dụng gì từ Host?

Docker container chia sẻ **kernel** của Host OS nhưng cô lập:

| Cô lập | Chia sẻ |
|--------|--------|
| Filesystem (riêng) | Kernel Linux |
| Process space (riêng) | CPU / RAM (giới hạn được) |
| Network (riêng) | |
| Users (riêng) | |

### Vòng đời của Container

```
Created → Running → Paused → Running → Stopped → Removed
  ↑         ↑        ↑         ↑          ↑         ↑
docker   docker    docker    docker    docker    docker
create    start    pause    unpause     stop       rm
```

```bash
# Tạo container (chưa chạy)
docker create --name my-app nginx

# Chạy container
docker start my-app

# Tạm dừng
docker pause my-app

# Tiếp tục
docker unpause my-app

# Dừng container
docker stop my-app

# Xoá container
docker rm my-app

# Hoặc tạo + chạy cùng lúc
docker run --name my-app nginx
```

---

## 5. Docker Registry

### Registry là gì?

Registry là nơi lưu trữ và phân phối Docker Image, giống như GitHub cho code.

### Các Registry phổ biến

| Registry | URL | Đặc điểm |
|----------|-----|-----------|
| **Docker Hub** | hub.docker.com | Mặc định, lớn nhất |
| **GitHub Container Registry** | ghcr.io | Tích hợp GitHub |
| **Amazon ECR** | aws.amazon.com/ecr | Tích hợp AWS |
| **Google Artifact Registry** | cloud.google.com | Tích hợp GCP |

### Luồng hoạt động

```
Developer                 Registry               Server
    │                        │                      │
    │── docker build ──→     │                      │
    │── docker push ───→  Lưu image                 │
    │                        │                      │
    │                        │ ←── docker pull ─────│
    │                        │                      │── docker run
```

```bash
# Tải image từ Docker Hub
docker pull nginx:latest

# Đẩy image lên Docker Hub
docker login
docker tag my-app username/my-app:v1.0
docker push username/my-app:v1.0
```

---

## 6. Cách Docker cô lập Container

Docker sử dụng các tính năng của Linux kernel:

### Namespaces (Không gian tên)

Cô lập tài nguyên giữa các container:

| Namespace | Cô lập gì | Ý nghĩa |
|-----------|-----------|---------|
| **PID** | Process IDs | Mỗi container có PID 1 riêng |
| **NET** | Network | Mỗi container có IP riêng |
| **MNT** | Mount points | Mỗi container có filesystem riêng |
| **UTS** | Hostname | Mỗi container có hostname riêng |
| **IPC** | Inter-process comm. | Container không thể truy cập process khác |
| **USER** | User IDs | Container có user riêng |

### Control Groups (cgroups)

Giới hạn tài nguyên mỗi container sử dụng:

```bash
# Giới hạn RAM
docker run --memory=512m nginx

# Giới hạn CPU
docker run --cpus=1.5 nginx

# Giới hạn cả hai
docker run --memory=1g --cpus=2 nginx
```

### Union File System (UnionFS)

Cho phép kết hợp nhiều layers thành một filesystem duy nhất:

```
Container nhìn thấy:
/app/
├── index.js        (từ Layer 5)
├── node_modules/   (từ Layer 4)
├── package.json    (từ Layer 3)
└── ...

Thực tế là tổ hợp của 5 layers riêng biệt
```

---

## 7. Tổng kết kiến trúc

```
┌─────────────────────────────────────────────────┐
│                  Bạn (User)                      │
│            gõ lệnh docker                        │
└─────────────────┬───────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────┐
│              Docker Client (CLI)                 │
│         Gửi lệnh qua REST API                   │
└─────────────────┬───────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────┐
│            Docker Daemon (dockerd)               │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │              Container Runtime              │ │
│  │  (containerd + runc)                       │ │
│  │                                            │ │
│  │  ┌──────┐  ┌──────┐  ┌──────┐            │ │
│  │  │ C1   │  │ C2   │  │ C3   │  ...       │ │
│  │  └──────┘  └──────┘  └──────┘            │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Namespaces ── Cô lập container                  │
│  Cgroups    ── Giới hạn tài nguyên               │
│  UnionFS   ── Hệ thống file theo layers          │
└─────────────────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────┐
│              Linux Kernel (Host)                 │
└─────────────────────────────────────────────────┘
```

### Ghi nhớ

| Khái niệm | Một câu |
|-----------|--------|
| **Client** | Nơi bạn gõ lệnh |
| **Daemon** | Nơi xử lý lệnh |
| **Image** | Bản thiết kế read-only, gồm nhiều layers |
| **Container** | Image + writable layer đang chạy |
| **Registry** | Kho lưu trữ image online |
| **Namespace** | Cô lập tài nguyên |
| **Cgroup** | Giới hạn tài nguyên |
| **Layer** | Mỗi lệnh Dockerfile tạo 1 layer |
