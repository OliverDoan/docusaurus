---
sidebar_position: 3
title: "3. Quan ly multi-container"
---

# Quản lý multi-container

Bài này hướng dẫn các thao tác quản lý hàng ngày khi làm việc với Docker Compose.

---


---

## Mục lục

- [1. Lifecycle Commands](#1-lifecycle-commands)
- [2. Monitoring](#2-monitoring)
- [3. Exec và Run](#3-exec-và-run)
- [4. Scale Services](#4-scale-services)
- [5. Compose Profiles](#5-compose-profiles)
- [6. Multiple Compose Files](#6-multiple-compose-files)
- [7. Useful Patterns](#7-useful-patterns)
- [8. Bài tập thực hành](#8-bài-tập-thực-hành)
- [Tổng kết](#tổng-kết)

---

## 1. Lifecycle Commands

### Start / Stop / Restart

```bash
# Start tất cả services (nền)
docker compose up -d

# Start 1 service cụ thể
docker compose up -d web

# Stop tất cả (giữ containers)
docker compose stop

# Stop 1 service
docker compose stop db

# Start lại services đã stop
docker compose start

# Restart tất cả
docker compose restart

# Restart 1 service
docker compose restart web
```

### Down — Dừng và dọn dẹp

```bash
# Dừng + xoá containers + network
docker compose down

# Dừng + xoá + xoá volumes (MẤT DATA!)
docker compose down -v

# Dừng + xoá + xoá images đã build
docker compose down --rmi local

# Dừng + xoá tất cả (containers, networks, images, volumes)
docker compose down -v --rmi all
```

### Rebuild

```bash
# Build lại images và start
docker compose up -d --build

# Chỉ build (không start)
docker compose build

# Build không cache
docker compose build --no-cache

# Build 1 service
docker compose build web
```

---

## 2. Monitoring

### Xem trạng thái

```bash
docker compose ps

# Output:
# NAME           IMAGE            STATUS           PORTS
# myapp-web-1    my-app:latest    Up 5 minutes     0.0.0.0:3000->3000/tcp
# myapp-db-1     postgres:16      Up 5 minutes     5432/tcp
# myapp-cache-1  redis:7-alpine   Up 5 minutes     6379/tcp
```

### Xem logs

```bash
# Logs tất cả services
docker compose logs

# Follow logs
docker compose logs -f

# Logs 1 service
docker compose logs web
docker compose logs -f --tail 100 web

# Logs nhiều services
docker compose logs web db
```

### Resource stats

```bash
# Xem tài nguyên
docker stats $(docker compose ps -q)
```

---

## 3. Exec và Run

### Exec — Chạy lệnh trong service đang chạy

```bash
# Mở shell
docker compose exec web sh
docker compose exec web bash

# Chạy 1 lệnh
docker compose exec web npm test
docker compose exec db psql -U postgres -d myapp

# Chạy với user khác
docker compose exec --user root web sh
```

### Run — Chạy lệnh 1 lần (tạo container mới)

```bash
# Chạy migration
docker compose run --rm web npm run migrate

# Chạy seed
docker compose run --rm web npm run seed

# Chạy test
docker compose run --rm web npm test

# Mở shell tạm
docker compose run --rm web sh
```

### Khác biệt exec vs run

| | exec | run |
|---|---|---|
| Container | Dùng container đang chạy | Tạo container mới |
| Service phải đang chạy | Co | Khong |
| Ports | Dùng ports đã map | Không map ports (mặc định) |
| Dọn dẹp | Không tạo gì | Dùng `--rm` để tự xoá |

---

## 4. Scale Services

```bash
# Scale web lên 3 instances
docker compose up -d --scale web=3

# Kiểm tra
docker compose ps
# myapp-web-1    Up    0.0.0.0:3001->3000/tcp
# myapp-web-2    Up    0.0.0.0:3002->3000/tcp
# myapp-web-3    Up    0.0.0.0:3003->3000/tcp
```

**Lưu ý**: Khi scale, không thể dùng port cố định. Cần bỏ host port hoặc dùng load balancer:

```yaml
services:
  web:
    build: .
    # Không fix host port
    expose:
      - "3000"

  nginx:
    image: nginx
    ports:
      - "80:80"
    # Nginx làm load balancer cho các web instances
```

---

## 5. Compose Profiles

### Development vs Production

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"

  db:
    image: postgres:16

  # Development tools
  adminer:
    image: adminer
    ports:
      - "8080:8080"
    profiles:
      - dev

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"
      - "8025:8025"
    profiles:
      - dev
```

```bash
# Production: chỉ web + db
docker compose up -d

# Development: web + db + adminer + mailhog
docker compose --profile dev up -d
```

---

## 6. Multiple Compose Files

### Override pattern

```yaml
# docker-compose.yml (base)
services:
  web:
    build: .
    ports:
      - "3000:3000"
  db:
    image: postgres:16
```

```yaml
# docker-compose.override.yml (auto-loaded for dev)
services:
  web:
    volumes:
      - ./src:/app/src  # Hot reload
    environment:
      NODE_ENV: development
```

```yaml
# docker-compose.prod.yml
services:
  web:
    restart: always
    environment:
      NODE_ENV: production
    deploy:
      resources:
        limits:
          memory: 512M
```

```bash
# Development (tự load override)
docker compose up -d

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 7. Useful Patterns

### Database backup

```bash
# Backup PostgreSQL
docker compose exec db pg_dump -U postgres myapp > backup.sql

# Restore
docker compose exec -T db psql -U postgres myapp < backup.sql
```

### Watch mode (auto-rebuild)

```bash
# Rebuild khi code thay đổi (Docker Compose >= 2.22)
docker compose watch
```

```yaml
services:
  web:
    build: .
    develop:
      watch:
        - action: sync
          path: ./src
          target: /app/src
        - action: rebuild
          path: package.json
```

---

## 8. Bài tập thực hành

### Full-stack: Node.js + PostgreSQL + Redis

Tạo file `docker-compose.yml`:

```yaml
services:
  web:
    image: node:20-alpine
    working_dir: /app
    command: sh -c "echo 'App running' && sleep infinity"
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://admin:secret@db:5432/practice
      REDIS_URL: redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: practice
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 5s
      timeout: 5s
      retries: 5

  cache:
    image: redis:7-alpine

volumes:
  pgdata:
```

```bash
# 1. Start
docker compose up -d

# 2. Xem trạng thái
docker compose ps

# 3. Xem logs
docker compose logs

# 4. Exec vào database
docker compose exec db psql -U admin -d practice
# CREATE TABLE users (id SERIAL, name TEXT);
# INSERT INTO users (name) VALUES ('Alice');
# SELECT * FROM users;
# \q

# 5. Exec vào Redis
docker compose exec cache redis-cli
# SET greeting "Hello Docker Compose"
# GET greeting
# exit

# 6. Scale web (thử)
docker compose up -d --scale web=2

# 7. Restart 1 service
docker compose restart cache

# 8. Down (giữ data)
docker compose down

# 9. Up lại → data vẫn còn (nhờ volume)
docker compose up -d
docker compose exec db psql -U admin -d practice -c "SELECT * FROM users;"

# 10. Down + xoá data
docker compose down -v
```

---

## Tổng kết

| Lệnh | Chức năng |
|-------|-----------|
| `docker compose up -d` | Start tất cả |
| `docker compose down` | Stop + remove |
| `docker compose down -v` | Stop + remove + xoá volumes |
| `docker compose ps` | Xem trạng thái |
| `docker compose logs -f` | Follow logs |
| `docker compose exec` | Lệnh trong service đang chạy |
| `docker compose run --rm` | Lệnh 1 lần (container mới) |
| `docker compose --scale` | Scale service |
| `docker compose build` | Build images |
| `docker compose --profile` | Chạy profile cụ thể |
