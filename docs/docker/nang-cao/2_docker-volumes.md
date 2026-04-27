---
sidebar_position: 2
title: "2. Docker Volumes"
---

# Docker Volumes

Khi container bị xoá, dữ liệu bên trong cũng mất theo. **Volumes** giải quyết vấn đề này bằng cách lưu trữ dữ liệu bên ngoài container.

---


---

## Mục lục

- [1. Vấn đề: Dữ liệu mất khi xoá container](#1-vấn-đề-dữ-liệu-mất-khi-xoá-container)
- [2. Các loại lưu trữ trong Docker](#2-các-loại-lưu-trữ-trong-docker)
- [3. Named Volumes](#3-named-volumes)
- [4. Bind Mounts](#4-bind-mounts)
- [5. tmpfs Mounts](#5-tmpfs-mounts)
- [6. Volumes trong Docker Compose](#6-volumes-trong-docker-compose)
- [7. Backup và Restore Volumes](#7-backup-và-restore-volumes)
- [8. Best Practices](#8-best-practices)
- [Tổng kết](#tổng-kết)

---

## 1. Vấn đề: Dữ liệu mất khi xoá container

```bash
# Tạo container, ghi dữ liệu
docker run -d --name temp-db postgres:16 -e POSTGRES_PASSWORD=test
# → Tạo database, insert data...

# Xoá container
docker rm -f temp-db
# → TẤT CẢ DATA ĐÃ MẤT!

# Tạo lại container
docker run -d --name temp-db postgres:16 -e POSTGRES_PASSWORD=test
# → Database trống, không có data
```

**Volumes** giúp data tồn tại **độc lập** với container.

---

## 2. Các loại lưu trữ trong Docker

```
┌─────────────────────────────────────────┐
│                Host                      │
│                                          │
│  ┌────────────┐  ┌─────────────────┐    │
│  │  Named     │  │  Bind Mount     │    │
│  │  Volume    │  │  (thư mục host) │    │
│  │            │  │                 │    │
│  │ /var/lib/  │  │ /home/user/     │    │
│  │ docker/    │  │ project/data    │    │
│  │ volumes/   │  │                 │    │
│  └─────┬──────┘  └───────┬─────────┘    │
│        │                 │               │
│        ▼                 ▼               │
│  ┌─────────────────────────────────┐    │
│  │         Container               │    │
│  │    /app/data    /app/config     │    │
│  └─────────────────────────────────┘    │
│                                          │
│  ┌─────────────────────────────────┐    │
│  │  tmpfs (RAM - tạm thời)        │    │
│  │  /app/temp                      │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

| Loại | Lưu ở đâu | Persist | Dùng khi |
|------|-----------|---------|---------|
| **Named Volume** | Docker quản lý | Co | Database, uploads |
| **Bind Mount** | Thư mục host cụ thể | Co | Development, config |
| **tmpfs** | RAM | Khong | Data tạm, sensitive |

---

## 3. Named Volumes

Docker quản lý hoàn toàn, lưu trong `/var/lib/docker/volumes/`:

### Tạo và sử dụng

```bash
# Tạo volume
docker volume create mydata

# Sử dụng volume
docker run -d \
  --name my-db \
  -v mydata:/var/lib/postgresql/data \
  postgres:16

# Volume tự tạo nếu chưa có
docker run -d -v auto-created:/app/data nginx
```

### Ví dụ: PostgreSQL với persistent data

```bash
# Chạy PostgreSQL với named volume
docker run -d \
  --name pg \
  -e POSTGRES_PASSWORD=secret \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16

# Tạo data
docker exec -it pg psql -U postgres -c "CREATE TABLE test (id int, name text);"
docker exec -it pg psql -U postgres -c "INSERT INTO test VALUES (1, 'Docker Volume');"

# Xoá container
docker rm -f pg

# Tạo container MỚI với CÙNG volume
docker run -d \
  --name pg-new \
  -e POSTGRES_PASSWORD=secret \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16

# Data vẫn còn!
docker exec -it pg-new psql -U postgres -c "SELECT * FROM test;"
#  id |     name
# ----+---------------
#   1 | Docker Volume

docker rm -f pg-new
```

### Quản lý volumes

```bash
# Liệt kê
docker volume ls

# Chi tiết
docker volume inspect mydata

# Xoá 1 volume
docker volume rm mydata

# Xoá tất cả volume không dùng
docker volume prune
```

---

## 4. Bind Mounts

Mount thư mục từ host vào container. Bạn kiểm soát hoàn toàn vị trí lưu trữ:

### Cú pháp

```bash
# Mount thư mục
docker run -v /path/on/host:/path/in/container image

# Mount read-only
docker run -v /path/on/host:/path/in/container:ro image

# Dùng đường dẫn hiện tại
docker run -v $(pwd)/data:/app/data image
```

### Use case 1: Development (Hot reload)

```bash
# Mount source code → Thay đổi code trên host, container thấy ngay
docker run -d \
  --name dev \
  -p 3000:3000 \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/package.json:/app/package.json \
  my-app:dev
```

### Use case 2: Custom config

```bash
# Mount file config
docker run -d \
  --name web \
  -p 80:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  -v $(pwd)/html:/usr/share/nginx/html:ro \
  nginx:alpine
```

### Use case 3: Logs

```bash
# Mount thư mục logs ra host
docker run -d \
  -v $(pwd)/logs:/app/logs \
  my-app
```

---

## 5. tmpfs Mounts

Lưu trữ trên RAM, mất khi container dừng:

```bash
docker run -d \
  --tmpfs /app/temp:rw,size=100m \
  my-app

# Hoặc
docker run -d \
  --mount type=tmpfs,destination=/app/temp,tmpfs-size=100m \
  my-app
```

**Use case**: Cache tạm, session data, sensitive data không muốn lưu disk.

---

## 6. Volumes trong Docker Compose

```yaml
services:
  app:
    build: .
    volumes:
      # Bind mount: thư mục hiện tại → container
      - ./src:/app/src

      # Named volume: node_modules
      - node_modules:/app/node_modules

      # Read-only config
      - ./config:/app/config:ro

  db:
    image: postgres:16
    volumes:
      # Named volume cho database data
      - pgdata:/var/lib/postgresql/data

      # Bind mount cho init scripts
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro

# Khai báo named volumes
volumes:
  pgdata:
  node_modules:
```

### Pattern: Tách node_modules

```yaml
services:
  app:
    build: .
    volumes:
      - .:/app                        # Mount toàn bộ code
      - node_modules:/app/node_modules # Nhưng node_modules dùng volume riêng

volumes:
  node_modules:
```

Tại sao? Vì `node_modules` trên host (macOS/Windows) có thể **khác** với `node_modules` trong container (Linux). Dùng volume riêng tránh xung đột.

---

## 7. Backup và Restore Volumes

### Backup

```bash
# Backup volume ra file tar
docker run --rm \
  -v pgdata:/data \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/pgdata-backup.tar.gz -C /data .
```

### Restore

```bash
# Restore volume từ file tar
docker run --rm \
  -v pgdata:/data \
  -v $(pwd):/backup \
  alpine \
  sh -c "cd /data && tar xzf /backup/pgdata-backup.tar.gz"
```

### Backup PostgreSQL (cách tốt hơn)

```bash
# pg_dump
docker exec pg pg_dump -U postgres mydb > backup.sql

# Restore
docker exec -i pg psql -U postgres mydb < backup.sql
```

---

## 8. Best Practices

### 1. Dùng Named Volumes cho data quan trọng

```bash
# ✅ Named volume — Docker quản lý, dễ backup
-v pgdata:/var/lib/postgresql/data

# ❌ Bind mount cho database — Có thể gặp permission issues
-v ./pgdata:/var/lib/postgresql/data
```

### 2. Dùng Bind Mounts cho development

```bash
# ✅ Bind mount source code cho hot reload
-v ./src:/app/src

# ❌ Named volume cho source code — Không sync với host
-v src:/app/src
```

### 3. Read-only khi có thể

```bash
# ✅ Config files nên read-only
-v ./nginx.conf:/etc/nginx/conf.d/default.conf:ro

# Ngăn container vô tình sửa config
```

### 4. Không lưu data quan trọng trong container

```bash
# Luôn dùng volume cho:
# - Database data
# - Upload files
# - Logs
# - Certificates
```

---

## Tổng kết

| Loại | Cú pháp | Dùng khi |
|------|---------|---------|
| **Named Volume** | `-v mydata:/app/data` | Database, persistent data |
| **Bind Mount** | `-v ./src:/app/src` | Development, config |
| **tmpfs** | `--tmpfs /app/temp` | Data tạm, sensitive |
| **Read-only** | `-v ./conf:/etc/conf:ro` | Config files |

| Lệnh | Chức năng |
|-------|-----------|
| `docker volume create` | Tạo volume |
| `docker volume ls` | Liệt kê |
| `docker volume inspect` | Chi tiết |
| `docker volume rm` | Xoá |
| `docker volume prune` | Xoá không dùng |
