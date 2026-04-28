---
sidebar_position: 1
title: "1. Container là gì?"
---

# Container là gì?

Container là khái niệm trung tâm của Docker. Bài này giải thích chi tiết container hoạt động như thế nào và cách tương tác với chúng.

---


---

## Mục lục

- [1. Container — Instance đang chạy của Image](#1-container-instance-đang-chạy-của-image)
- [2. Cấu trúc bên trong Container](#2-cấu-trúc-bên-trong-container)
- [3. Vòng đời Container](#3-vòng-đời-container)
- [4. docker run chi tiết](#4-docker-run-chi-tiết)
- [5. Tương tác với Container đang chạy](#5-tương-tác-với-container-đang-chạy)
- [6. Restart Policies](#6-restart-policies)
- [7. Biến môi trường](#7-biến-môi-trường)
- [8. Port Mapping](#8-port-mapping)
- [9. Bài tập thực hành](#9-bài-tập-thực-hành)
- [Tổng kết](#tổng-kết)

---

## 1. Container — Instance đang chạy của Image

**Container** là một môi trường cô lập, nhẹ, chạy ứng dụng. Nó được tạo ra từ Image.

```
Image (bản thiết kế)  →  Container (đang chạy)
      read-only              read-write
      tĩnh (static)          động (running process)
      chia sẻ được           riêng biệt
```

### So sánh

| Image | Container |
|-------|-----------|
| Class | Object |
| Khuôn bánh | Chiếc bánh |
| File ISO | Máy tính đã cài |
| Dockerfile → build | Image → run |
| Không thay đổi | Có thể thay đổi (writable layer) |

### Một Image → Nhiều Containers

```bash
# Tạo 3 containers từ 1 image
docker run -d --name web-1 -p 8081:80 nginx
docker run -d --name web-2 -p 8082:80 nginx
docker run -d --name web-3 -p 8083:80 nginx

# 3 containers độc lập, không ảnh hưởng nhau
```

---

## 2. Cấu trúc bên trong Container

```
┌─────────────────────────────────────┐
│           Container                  │
│                                      │
│  ┌─────────────────────────────┐    │
│  │     Writable Layer          │    │  ← Dữ liệu thay đổi khi chạy
│  │  (container layer)          │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │     Image Layers            │    │  ← Read-only
│  │  (shared across containers) │    │
│  └─────────────────────────────┘    │
│                                      │
│  PID namespace  → Process riêng      │
│  NET namespace  → Network riêng      │
│  MNT namespace  → Filesystem riêng   │
│  USER namespace → Users riêng        │
└─────────────────────────────────────┘
```

### Writable Layer

Khi container chạy, Docker thêm một **writable layer** lên trên các image layers:

- File mới tạo → Lưu vào writable layer
- File sửa → Copy từ image layer lên writable layer rồi sửa (Copy-on-Write)
- File xoá → Đánh dấu "xoá" trong writable layer

**Quan trọng**: Khi xoá container, writable layer cũng bị xoá → mất dữ liệu!

---

## 3. Vòng đời Container

```
                  docker create
                       │
                       ▼
                   ┌────────┐
                   │Created │
                   └───┬────┘
                       │ docker start
                       ▼
    docker restart ┌────────┐ docker pause
         ┌────────│Running │────────┐
         │        └───┬────┘        │
         │            │             ▼
         │            │        ┌────────┐
         │            │        │Paused  │
         │            │        └───┬────┘
         │            │            │ docker unpause
         │            │◄───────────┘
         │            │
         │            │ docker stop / docker kill
         │            ▼
         │       ┌─────────┐
         └───────│Stopped  │
                 └───┬─────┘
                     │ docker rm
                     ▼
                 ┌─────────┐
                 │Removed  │
                 └─────────┘
```

### Các trạng thái

| Trạng thái | Mô tả | Lệnh vào | Lệnh ra |
|-----------|--------|----------|---------|
| **Created** | Đã tạo, chưa chạy | `docker create` | `docker start` |
| **Running** | Đang chạy | `docker start/run` | `docker stop/kill` |
| **Paused** | Tạm dừng (freeze) | `docker pause` | `docker unpause` |
| **Stopped** | Đã dừng | `docker stop` | `docker start/rm` |
| **Removed** | Đã xoá | `docker rm` | — |

---

## 4. docker run chi tiết

`docker run` = `docker create` + `docker start`:

```bash
# Cú pháp đầy đủ
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```

### Các chế độ chạy

#### Foreground (mặc định)

```bash
# Chạy và thấy output trực tiếp
docker run nginx
# Ctrl+C để dừng
```

#### Detached (-d)

```bash
# Chạy nền
docker run -d nginx
# Container chạy ngầm, trả về container ID
```

#### Interactive (-it)

```bash
# Mở terminal trong container
docker run -it ubuntu bash
# Bạn "ở trong" container, gõ lệnh Linux

# Thoát container: gõ exit hoặc Ctrl+D
```

#### Auto-remove (--rm)

```bash
# Tự xoá container khi dừng
docker run --rm nginx
# Phù hợp cho task 1 lần (test, script...)
```

---

## 5. Tương tác với Container đang chạy

### Exec — Chạy lệnh trong container

```bash
# Mở bash shell
docker exec -it my-container bash

# Mở sh (cho Alpine)
docker exec -it my-container sh

# Chạy 1 lệnh
docker exec my-container ls /app
docker exec my-container cat /etc/hostname
docker exec my-container env  # Xem biến môi trường
```

### Attach — Kết nối vào process chính

```bash
# Kết nối vào stdout/stderr của container
docker attach my-container

# Thoát mà không dừng container: Ctrl+P, Ctrl+Q
```

### Khác biệt exec vs attach

| | exec | attach |
|---|---|---|
| **Tạo process mới** | Co | Khong |
| **Kết nối vào** | Process mới | Process chính (PID 1) |
| **Dừng container khi exit** | Khong | Co (nếu dùng Ctrl+C) |
| **Use case** | Debug, chạy lệnh | Xem output |

---

## 6. Restart Policies

Docker có thể tự restart container khi nó crash:

```bash
# Không tự restart (mặc định)
docker run --restart no nginx

# Luôn restart (trừ khi manually stop)
docker run --restart always nginx

# Restart khi exit code khác 0 (crash)
docker run --restart on-failure nginx

# Restart khi crash, tối đa 5 lần
docker run --restart on-failure:5 nginx

# Restart trừ khi manually stop (khuyến nghị)
docker run --restart unless-stopped nginx
```

| Policy | Khi nào restart |
|--------|----------------|
| `no` | Không bao giờ |
| `always` | Luôn luôn (kể cả reboot máy) |
| `on-failure` | Chỉ khi crash (exit code != 0) |
| `unless-stopped` | Như `always` nhưng không restart nếu đã manually stop |

---

## 7. Biến môi trường

### Truyền biến khi run

```bash
# Truyền 1 biến
docker run -e NODE_ENV=production my-app

# Truyền nhiều biến
docker run \
  -e NODE_ENV=production \
  -e DB_HOST=localhost \
  -e DB_PORT=5432 \
  my-app

# Truyền từ file
docker run --env-file .env my-app
```

### File .env

```env
# .env
NODE_ENV=production
DB_HOST=db
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=secret123
```

### Xem biến môi trường trong container

```bash
docker exec my-app env
docker exec my-app printenv NODE_ENV
```

---

## 8. Port Mapping

### Cú pháp

```bash
# Map port host:container
docker run -p 8080:80 nginx
# → Truy cập localhost:8080 → container port 80

# Map nhiều ports
docker run -p 8080:80 -p 8443:443 nginx

# Map port ngẫu nhiên
docker run -P nginx
# Docker tự chọn port trống trên host

# Map chỉ localhost (không public)
docker run -p 127.0.0.1:8080:80 nginx
```

### Xem port mapping

```bash
docker port my-container
# 80/tcp -> 0.0.0.0:8080
```

---

## 9. Bài tập thực hành

```bash
# 1. Chạy Ubuntu container với interactive mode
docker run -it --rm ubuntu bash

# Bên trong container:
cat /etc/os-release     # Xem version Ubuntu
whoami                  # Xem user hiện tại
hostname                # Xem hostname
ps aux                  # Xem processes
exit                    # Thoát (container tự xoá do --rm)

# 2. Chạy Nginx nền với port mapping
docker run -d --name web -p 9090:80 nginx

# 3. Exec vào container
docker exec -it web bash
ls /usr/share/nginx/html/
cat /etc/nginx/nginx.conf
exit

# 4. Xem logs
docker logs web

# 5. Xem stats
docker stats web --no-stream

# 6. Dọn dẹp
docker rm -f web
```

---

## Tổng kết

| Khái niệm | Giải thích |
|-----------|-----------|
| **Container** | Instance đang chạy của Image |
| **Writable layer** | Layer đọc-ghi, mất khi xoá container |
| **docker run** | Tạo + chạy container |
| **docker exec** | Chạy lệnh trong container đang chạy |
| **-d** | Chạy nền |
| **-it** | Interactive terminal |
| **-p** | Map port host:container |
| **-e** | Biến môi trường |
| **--restart** | Tự restart khi crash |
| **--rm** | Tự xoá khi dừng |
