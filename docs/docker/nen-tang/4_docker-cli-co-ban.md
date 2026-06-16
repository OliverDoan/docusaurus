---
sidebar_position: 4
title: "4. Docker CLI cơ bản"
---

# Docker CLI cơ bản

Bài này tổng hợp các lệnh Docker CLI bạn sẽ dùng hàng ngày. Hãy thực hành từng lệnh trên máy để quen tay.

---

## Mục lục

- [Vì sao cần Docker CLI?](#vì-sao-cần-docker-cli)
- [1. Nhóm lệnh quản lý Image](#1-nhóm-lệnh-quản-lý-image)
- [2. Nhóm lệnh quản lý Container](#2-nhóm-lệnh-quản-lý-container)
- [3. Nhóm lệnh thông tin và debug](#3-nhóm-lệnh-thông-tin-và-debug)
- [4. Nhóm lệnh dọn dẹp](#4-nhóm-lệnh-dọn-dẹp)
- [5. Bảng tóm tắt lệnh hay dùng](#5-bảng-tóm-tắt-lệnh-hay-dùng)
- [6. Bài tập thực hành](#6-bài-tập-thực-hành)
- [Tổng kết](#tổng-kết)

---

## Vì sao cần Docker CLI?

**Vấn đề:** Docker chạy theo mô hình client–server. Bên trong, Docker daemon (`dockerd`) quản lý toàn bộ image, container, network và volume qua một REST API. Nếu phải gọi API thô, mỗi thao tác đơn giản cũng trở nên rườm rà:

```bash
# Gọi REST API thô — dài dòng, khó nhớ, khó viết vào script
curl --unix-socket /var/run/docker.sock \
  -X POST "http://localhost/v1.43/containers/create" \
  -H "Content-Type: application/json" \
  -d '{"Image":"nginx","HostConfig":{"PortBindings":{"80/tcp":[{"HostPort":"8080"}]}}}'
```

**Giải pháp:** Docker CLI (`docker ...`) là client dòng lệnh chính thức, đóng gói các lệnh REST phức tạp thành cú pháp ngắn gọn, nhất quán, dễ ghi nhớ và tích hợp trực tiếp vào shell script hay pipeline CI/CD:

```bash
# Lệnh tương đương — 1 dòng, dễ đọc, dễ tái sử dụng
docker run -d -p 8080:80 nginx
```

:::tip[Dùng thực tế]
- Khởi động nhanh môi trường dev (database, cache, proxy) bằng vài lệnh `docker run` mà không cần cài đặt thủ công.
- Viết script CI/CD để build image, push lên registry và deploy container tự động.
- Debug ứng dụng đang chạy trong container bằng `docker logs`, `docker exec`, `docker stats`.
- Dọn dẹp tài nguyên tồn đọng (image cũ, container dừng) trên máy dev hoặc server với `docker system prune`.
:::

---

## 1. Nhóm lệnh quản lý Image

### Tải image từ Docker Hub

```bash
# Cú pháp: docker pull <image>:<tag>
docker pull nginx              # Tải nginx, tag mặc định là "latest"
docker pull nginx:1.25         # Tải nginx version cụ thể
docker pull node:18-alpine     # Tải Node.js 18 bản Alpine (nhẹ)
docker pull postgres:16        # Tải PostgreSQL 16
```

### Liệt kê image trên máy

```bash
docker images
# Hoặc
docker image ls

# Output:
# REPOSITORY   TAG        IMAGE ID       CREATED       SIZE
# nginx        latest     a8758716bb6a   2 days ago    187MB
# node         18-alpine  1a2b3c4d5e6f   1 week ago    172MB
# postgres     16         9f8g7h6i5j4k   3 days ago    432MB
```

### Xoá image

```bash
# Xoá 1 image
docker rmi nginx

# Xoá theo IMAGE ID
docker rmi a8758716bb6a

# Xoá tất cả image không dùng
docker image prune

# Xoá TẤT CẢ image (cẩn thận!)
docker image prune -a
```

### Tìm kiếm image trên Docker Hub

```bash
docker search nginx
# Hiện danh sách các image liên quan đến "nginx"
```

---

## 2. Nhóm lệnh quản lý Container

### Chạy container

```bash
# Cú pháp cơ bản
docker run <image>

# Chạy và vào terminal của container
docker run -it ubuntu bash

# Chạy nền (detach mode)
docker run -d nginx

# Đặt tên cho container
docker run -d --name my-web nginx

# Map port: host_port:container_port
docker run -d -p 8080:80 --name my-web nginx

# Kết hợp nhiều option
docker run -d \
  --name my-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -v $(pwd):/app \
  node:18-alpine
```

### Giải thích các flags quan trọng

| Flag        | Ý nghĩa                          | Ví dụ                        |
| ----------- | -------------------------------- | ---------------------------- |
| `-d`        | Chạy nền (detach)                | `docker run -d nginx`        |
| `-it`       | Interactive + TTY (vào terminal) | `docker run -it ubuntu bash` |
| `-p`        | Map port host:container          | `-p 8080:80`                 |
| `--name`    | Đặt tên container                | `--name my-app`              |
| `-e`        | Đặt biến môi trường              | `-e DB_HOST=localhost`       |
| `-v`        | Mount volume                     | `-v ./data:/app/data`        |
| `--rm`      | Tự xoá khi dừng                  | `docker run --rm nginx`      |
| `--restart` | Tự restart                       | `--restart unless-stopped`   |

### Liệt kê container

```bash
# Container đang chạy
docker ps

# Tất cả container (bao gồm đã dừng)
docker ps -a

# Chỉ hiện ID
docker ps -q

# Output:
# CONTAINER ID   IMAGE   COMMAND                  STATUS          PORTS                  NAMES
# abc123def456   nginx   "/docker-entrypoint.…"   Up 5 minutes    0.0.0.0:8080->80/tcp   my-web
```

### Dừng và xoá container

```bash
# Dừng container (graceful - gửi SIGTERM)
docker stop my-web

# Dừng ngay lập tức (SIGKILL)
docker kill my-web

# Xoá container đã dừng
docker rm my-web

# Dừng và xoá cùng lúc
docker rm -f my-web

# Xoá tất cả container đã dừng
docker container prune

# Dừng tất cả container đang chạy
docker stop $(docker ps -q)
```

### Vào bên trong container đang chạy

```bash
# Mở bash shell trong container
docker exec -it my-web bash

# Chạy 1 lệnh trong container
docker exec my-web ls /usr/share/nginx/html

# Mở shell cho Alpine-based image (không có bash)
docker exec -it my-app sh
```

### Xem logs

```bash
# Xem logs
docker logs my-web

# Xem logs realtime (follow)
docker logs -f my-web

# Xem 50 dòng cuối
docker logs --tail 50 my-web

# Xem logs với timestamp
docker logs -t my-web
```

---

## 3. Nhóm lệnh thông tin và debug

### Xem chi tiết container/image

```bash
# Chi tiết container
docker inspect my-web

# Chỉ lấy IP address
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' my-web

# Chi tiết image
docker inspect nginx
```

### Xem tài nguyên sử dụng

```bash
# Realtime stats (CPU, RAM, Network)
docker stats

# Stats của 1 container
docker stats my-web

# Output:
# CONTAINER ID   NAME     CPU %   MEM USAGE / LIMIT   NET I/O          BLOCK I/O
# abc123def456   my-web   0.03%   5.6MiB / 7.77GiB   1.3kB / 648B     0B / 0B
```

### Xem processes trong container

```bash
docker top my-web
```

### Copy file giữa host và container

```bash
# Copy từ host vào container
docker cp ./index.html my-web:/usr/share/nginx/html/

# Copy từ container ra host
docker cp my-web:/var/log/nginx/access.log ./nginx-access.log
```

---

## 4. Nhóm lệnh dọn dẹp

Docker có thể chiếm nhiều ổ cứng theo thời gian. Dọn dẹp thường xuyên:

```bash
# Xem dung lượng Docker đang chiếm
docker system df

# Output:
# TYPE            TOTAL   ACTIVE   SIZE      RECLAIMABLE
# Images          15      3        5.23GB    4.1GB (78%)
# Containers      5       2        120MB     80MB (66%)
# Local Volumes   8       3        2.1GB     1.5GB (71%)
# Build Cache     20      0        1.8GB     1.8GB

# Dọn dẹp tất cả không dùng (images, containers, networks, cache)
docker system prune

# Dọn dẹp bao gồm cả images không dùng
docker system prune -a

# Dọn dẹp volumes không dùng
docker volume prune
```

---

## 5. Bảng tóm tắt lệnh hay dùng

### Image

| Lệnh                       | Mô tả                     |
| -------------------------- | ------------------------- |
| `docker pull <image>`      | Tải image                 |
| `docker images`            | Liệt kê images            |
| `docker rmi <image>`       | Xoá image                 |
| `docker image prune`       | Xoá images không dùng     |
| `docker build -t <name> .` | Build image từ Dockerfile |

### Container

| Lệnh                          | Mô tả                       |
| ----------------------------- | --------------------------- |
| `docker run <image>`          | Tạo + chạy container        |
| `docker ps`                   | Liệt kê container đang chạy |
| `docker ps -a`                | Liệt kê tất cả container    |
| `docker stop <name>`          | Dừng container              |
| `docker rm <name>`            | Xoá container               |
| `docker exec -it <name> bash` | Vào container               |
| `docker logs <name>`          | Xem logs                    |

### Hệ thống

| Lệnh                  | Mô tả                   |
| --------------------- | ----------------------- |
| `docker system df`    | Xem dung lượng          |
| `docker system prune` | Dọn dẹp                 |
| `docker stats`        | Monitor tài nguyên      |
| `docker info`         | Thông tin Docker Engine |

---

## 6. Bài tập thực hành

Hãy thử làm theo các bước sau:

```bash
# 1. Tải image nginx
docker pull nginx

# 2. Chạy container với tên "practice-web", map port 9090:80
docker run -d --name practice-web -p 9090:80 nginx

# 3. Mở http://localhost:9090 trên trình duyệt

# 4. Xem logs
docker logs practice-web

# 5. Vào bên trong container
docker exec -it practice-web bash

# 6. Bên trong container, xem file HTML mặc định
cat /usr/share/nginx/html/index.html

# 7. Thoát container
exit

# 8. Dừng container
docker stop practice-web

# 9. Xoá container
docker rm practice-web

# 10. Xem dung lượng Docker
docker system df
```

---

## Tổng kết

Các lệnh cần nhớ để bắt đầu:

1. `docker run` — Chạy container
2. `docker ps` — Xem container
3. `docker stop` / `docker rm` — Dừng / Xoá container
4. `docker logs` — Xem logs
5. `docker exec -it` — Vào container
6. `docker images` — Xem images
7. `docker system prune` — Dọn dẹp
