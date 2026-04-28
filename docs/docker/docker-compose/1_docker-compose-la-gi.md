---
sidebar_position: 1
title: "1. Docker Compose là gì?"
---

# Docker Compose là gì?

Trong thực tế, ứng dụng không chỉ có 1 container. Một ứng dụng web thường cần: web server, database, cache, queue... Docker Compose giúp quản lý tất cả chúng.

---


---

## Mục lục

- [1. Vấn đề: Quản lý nhiều containers](#1-vấn-đề-quản-lý-nhiều-containers)
- [2. Docker Compose là gì?](#2-docker-compose-là-gì)
- [3. File docker-compose.yml cơ bản](#3-file-docker-composeyml-cơ-bản)
- [4. Các lệnh Docker Compose](#4-các-lệnh-docker-compose)
- [5. Networking trong Compose](#5-networking-trong-compose)
- [6. Bài tập thực hành](#6-bài-tập-thực-hành)
- [Tổng kết](#tổng-kết)

---

## 1. Vấn đề: Quản lý nhiều containers

### Không có Docker Compose

Mỗi lần start project, phải chạy từng container:

```bash
# Tạo network
docker network create myapp-net

# Chạy database
docker run -d \
  --name myapp-db \
  --network myapp-net \
  -e POSTGRES_PASSWORD=secret \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16

# Chạy Redis
docker run -d \
  --name myapp-cache \
  --network myapp-net \
  redis:7-alpine

# Chạy app
docker run -d \
  --name myapp-web \
  --network myapp-net \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://postgres:secret@myapp-db:5432/postgres \
  -e REDIS_URL=redis://myapp-cache:6379 \
  my-app:latest

# Muốn dừng? Chạy lại 3 lệnh docker stop...
# Muốn xoá? Chạy lại 3 lệnh docker rm...
```

### Có Docker Compose

Viết 1 file, chạy 1 lệnh:

```yaml
# docker-compose.yml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:secret@db:5432/postgres
      REDIS_URL: redis://cache:6379
    depends_on:
      - db
      - cache

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

  cache:
    image: redis:7-alpine

volumes:
  pgdata:
```

```bash
# Start tất cả
docker compose up -d

# Stop tất cả
docker compose down
```

---

## 2. Docker Compose là gì?

**Docker Compose** là tool để định nghĩa và chạy ứng dụng multi-container bằng file YAML.

### Ưu điểm

| Không có Compose | Có Compose |
|-----------------|-----------|
| Nhiều lệnh docker run dài | 1 file YAML + 1 lệnh |
| Quản lý network thủ công | Tự tạo network |
| Nhớ thứ tự start | `depends_on` quản lý |
| Khó chia sẻ setup | Commit file YAML vào git |
| Dễ quên options | Mọi config trong 1 file |

### Cài đặt

Docker Compose đã được tích hợp sẵn trong Docker Desktop. Kiểm tra:

```bash
docker compose version
# Docker Compose version v2.x.x
```

---

## 3. File docker-compose.yml cơ bản

### Cấu trúc

```yaml
# Version (tuỳ chọn, Docker Compose V2 không cần)

# Services: Các container
services:
  service-name-1:
    image: ...
    ports: ...
    environment: ...

  service-name-2:
    build: ...
    volumes: ...

# Volumes: Lưu trữ persistent
volumes:
  volume-name:

# Networks: Mạng tuỳ chỉnh (tuỳ chọn)
networks:
  network-name:
```

### Ví dụ đơn giản: Nginx + HTML

```yaml
# docker-compose.yml
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro
```

```bash
# Tạo thư mục HTML
mkdir html
echo "<h1>Hello Docker Compose!</h1>" > html/index.html

# Chạy
docker compose up -d

# Mở http://localhost:8080

# Dừng
docker compose down
```

---

## 4. Các lệnh Docker Compose

### Lệnh cơ bản

```bash
# Start tất cả services (nền)
docker compose up -d

# Start và build lại images
docker compose up -d --build

# Dừng tất cả services
docker compose down

# Dừng và xoá volumes
docker compose down -v

# Dừng và xoá images
docker compose down --rmi all
```

### Quản lý services

```bash
# Xem trạng thái
docker compose ps

# Xem logs
docker compose logs
docker compose logs -f          # Follow
docker compose logs web         # Logs 1 service
docker compose logs -f --tail 50 web

# Exec vào service
docker compose exec web sh
docker compose exec db psql -U postgres

# Restart 1 service
docker compose restart web

# Stop 1 service
docker compose stop db

# Start 1 service
docker compose start db
```

### Build

```bash
# Build images
docker compose build

# Build không dùng cache
docker compose build --no-cache

# Build 1 service
docker compose build web
```

### Scale

```bash
# Chạy 3 instances của service web
docker compose up -d --scale web=3

# Lưu ý: Không thể scale nếu service dùng port cố định
# Phải bỏ host port hoặc dùng load balancer
```

---

## 5. Networking trong Compose

### Mặc định

Docker Compose **tự động tạo network** cho tất cả services. Các services có thể gọi nhau bằng **tên service**:

```yaml
services:
  web:
    image: my-app
    environment:
      # "db" là tên service, Docker tự resolve thành IP
      DATABASE_URL: postgresql://postgres:secret@db:5432/mydb
      REDIS_URL: redis://cache:6379

  db:
    image: postgres:16

  cache:
    image: redis:7-alpine
```

```
web ──── "db:5432" ────→ db (PostgreSQL)
web ──── "cache:6379" ──→ cache (Redis)
```

### Tên mạng

```bash
# Xem networks đã tạo
docker network ls
# → myproject_default (tên thư mục + _default)
```

---

## 6. Bài tập thực hành

### Tạo một blog đơn giản với WordPress + MySQL

```yaml
# docker-compose.yml
services:
  wordpress:
    image: wordpress:latest
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wp_user
      WORDPRESS_DB_PASSWORD: wp_pass
      WORDPRESS_DB_NAME: wordpress
    depends_on:
      - db
    volumes:
      - wp_data:/var/www/html

  db:
    image: mysql:8
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wp_user
      MYSQL_PASSWORD: wp_pass
      MYSQL_ROOT_PASSWORD: root_pass
    volumes:
      - db_data:/var/lib/mysql

volumes:
  wp_data:
  db_data:
```

```bash
# Chạy
docker compose up -d

# Mở http://localhost:8080 → Cài đặt WordPress

# Xem logs
docker compose logs -f

# Xem trạng thái
docker compose ps

# Dừng (giữ data)
docker compose down

# Dừng và xoá data
docker compose down -v
```

---

## Tổng kết

| Khái niệm | Giải thích |
|-----------|-----------|
| **Docker Compose** | Tool quản lý multi-container |
| **docker-compose.yml** | File YAML định nghĩa services |
| **services** | Các container cần chạy |
| **volumes** | Lưu trữ persistent data |
| **networks** | Tự tạo, services gọi nhau bằng tên |
| **depends_on** | Thứ tự start services |
| `docker compose up -d` | Start tất cả |
| `docker compose down` | Stop và xoá tất cả |
