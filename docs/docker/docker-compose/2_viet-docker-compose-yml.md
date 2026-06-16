---
sidebar_position: 2
title: "2. Viết docker-compose.yml"
---

# Viết docker-compose.yml

Bài này đi chi tiết từng phần của file docker-compose.yml. Sau bài này bạn sẽ tự viết được Compose file cho project của mình.

---

## Mục lục

- [Vì sao cần file docker-compose.yml?](#vì-sao-cần-file-docker-composeyml)
- [1. Service Configuration](#1-service-configuration)
- [2. Ports](#2-ports)
- [3. Environment Variables](#3-environment-variables)
- [4. Volumes](#4-volumes)
- [5. depends_on](#5-dependson)
- [6. Restart Policy](#6-restart-policy)
- [7. Resource Limits](#7-resource-limits)
- [8. Healthcheck](#8-healthcheck)
- [9. Networks](#9-networks)
- [10. Profiles](#10-profiles)
- [11. Ví dụ tổng hợp](#11-ví-dụ-tổng-hợp)
- [Tổng kết](#tổng-kết)

---

## Vì sao cần file docker-compose.yml?

**Vấn đề:** Một ứng dụng thực tế thường gồm nhiều service chạy cùng nhau — web server, database, cache, v.v. Nếu khởi động thủ công từng container bằng `docker run`, mỗi lệnh kéo theo hàng loạt flag dài, dễ sai và không lặp lại được:

```bash
# Khởi động thủ công — dễ quên flag, dễ sai thứ tự
docker run -d --name db \
  -e POSTGRES_DB=myapp \
  -e POSTGRES_PASSWORD=secret \
  -v pgdata:/var/lib/postgresql/data \
  --network app-net \
  postgres:16-alpine

docker run -d --name cache \
  --network app-net \
  redis:7-alpine

docker run -d --name web \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://postgres:secret@db:5432/myapp \
  -e REDIS_URL=redis://cache:6379 \
  --network app-net \
  --depends ... \   # không có flag này trong docker run!
  my-app:latest
```

**Giải pháp:** File `docker-compose.yml` khai báo toàn bộ services, mạng, volume và biến môi trường ở một nơi duy nhất dưới dạng YAML. Chỉ cần một lệnh là dựng toàn bộ hạ tầng, đồng thời version hoá được trong Git:

```yaml
# docker-compose.yml — thay thế toàn bộ các lệnh docker run ở trên
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

  cache:
    image: redis:7-alpine

  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:secret@db:5432/myapp
      REDIS_URL: redis://cache:6379
    depends_on:
      - db
      - cache

volumes:
  pgdata:
```

```bash
# Dựng toàn bộ — chỉ một lệnh
docker compose up -d
```

:::tip[Dùng thực tế]
- **Local development**: dựng nhanh môi trường dev với DB + cache mà không cần cài đặt thủ công.
- **Onboarding thành viên mới**: clone repo, chạy `docker compose up` là có ngay môi trường giống nhau trên mọi máy.
- **CI/CD pipeline**: spin up service dependencies (DB, Redis) cho integration test rồi tear down sau khi chạy xong.
- **Demo & staging**: deploy toàn bộ stack lên VPS chỉ với một lệnh, dễ rollback bằng Git.
:::

---

## 1. Service Configuration

### Dùng image có sẵn

```yaml
services:
  db:
    image: postgres:16-alpine
```

### Build từ Dockerfile

```yaml
services:
  web:
    build: .
    # Hoặc chi tiết hơn:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NODE_VERSION: "20"
```

### Cả hai (build + image name)

```yaml
services:
  web:
    build: .
    image: my-app:latest
    # Build từ Dockerfile, đặt tên image là my-app:latest
```

---

## 2. Ports

```yaml
services:
  web:
    image: nginx
    ports:
      # host:container
      - "8080:80"
      - "8443:443"

      # Chỉ container port (host port ngẫu nhiên)
      - "80"

      # Chỉ bind localhost
      - "127.0.0.1:8080:80"
```

---

## 3. Environment Variables

### Inline

```yaml
services:
  web:
    image: my-app
    environment:
      NODE_ENV: production
      DB_HOST: db
      DB_PORT: "5432"
      DB_USER: admin
      DB_PASSWORD: secret
```

### Dạng list

```yaml
services:
  web:
    image: my-app
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=5432
```

### Từ file .env

```yaml
services:
  web:
    image: my-app
    env_file:
      - .env
      - .env.local
```

```env
# .env
NODE_ENV=production
DB_HOST=db
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=secret
```

### Biến trong Compose file

Docker Compose hỗ trợ **variable substitution** từ file `.env` ở cùng thư mục:

```env
# .env (cùng thư mục với docker-compose.yml)
POSTGRES_VERSION=16
APP_PORT=3000
```

```yaml
services:
  db:
    image: postgres:${POSTGRES_VERSION}-alpine

  web:
    ports:
      - "${APP_PORT}:3000"
```

---

## 4. Volumes

### Named volumes

```yaml
services:
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata: # Khai báo named volume
```

### Bind mounts (mount thư mục host)

```yaml
services:
  web:
    build: .
    volumes:
      # Bind mount: thư mục host → container
      - ./src:/app/src

      # Read-only
      - ./config:/app/config:ro

      # Named volume
      - node_modules:/app/node_modules

volumes:
  node_modules:
```

### Anonymous volumes

```yaml
services:
  web:
    volumes:
      - /app/node_modules # Anonymous volume (Docker quản lý)
```

---

## 5. depends_on

Kiểm soát thứ tự khởi động:

### Cơ bản

```yaml
services:
  web:
    build: .
    depends_on:
      - db
      - cache
    # web sẽ start SAU db và cache

  db:
    image: postgres:16

  cache:
    image: redis:7-alpine
```

### Với health check (khuyến nghị)

```yaml
services:
  web:
    build: .
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started

  db:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  cache:
    image: redis:7-alpine
```

**Lưu ý**: `depends_on` chỉ kiểm soát thứ tự **start**, không đảm bảo service đã **sẵn sàng**. Dùng `condition: service_healthy` để chờ service thật sự ready.

---

## 6. Restart Policy

```yaml
services:
  web:
    image: my-app
    restart: unless-stopped

  db:
    image: postgres:16
    restart: always
```

| Giá trị          | Ý nghĩa                       |
| ---------------- | ----------------------------- |
| `no`             | Không restart (mặc định)      |
| `always`         | Luôn restart                  |
| `on-failure`     | Restart khi crash             |
| `unless-stopped` | Restart trừ khi manually stop |

---

## 7. Resource Limits

```yaml
services:
  web:
    image: my-app
    deploy:
      resources:
        limits:
          cpus: "1.5"
          memory: 512M
        reservations:
          cpus: "0.5"
          memory: 256M
```

---

## 8. Healthcheck

```yaml
services:
  web:
    image: my-app
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

  db:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

---

## 9. Networks

### Mặc định (đủ cho hầu hết trường hợp)

```yaml
# Tất cả services tự động nằm trong 1 network
services:
  web:
    image: my-app
  db:
    image: postgres:16
# web có thể gọi db bằng hostname "db"
```

### Custom networks

```yaml
services:
  web:
    image: my-app
    networks:
      - frontend
      - backend

  db:
    image: postgres:16
    networks:
      - backend

  nginx:
    image: nginx
    networks:
      - frontend

networks:
  frontend:
  backend:

# nginx ↔ web: OK (cùng frontend)
# web ↔ db: OK (cùng backend)
# nginx ↔ db: KHÔNG (khác network)
```

---

## 10. Profiles

Chạy một số services tuỳ chọn:

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"

  db:
    image: postgres:16

  # Chỉ chạy khi cần debug
  adminer:
    image: adminer
    ports:
      - "8080:8080"
    profiles:
      - debug

  # Chỉ chạy khi cần monitoring
  prometheus:
    image: prom/prometheus
    profiles:
      - monitoring
```

```bash
# Chỉ web + db
docker compose up -d

# Thêm adminer
docker compose --profile debug up -d

# Thêm monitoring
docker compose --profile monitoring up -d
```

---

## 11. Ví dụ tổng hợp

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "${APP_PORT:-3000}:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@db:5432/myapp
      REDIS_URL: redis://cache:6379
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "1"
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  cache:
    image: redis:7-alpine
    volumes:
      - redisdata:/data
    restart: unless-stopped

volumes:
  pgdata:
  redisdata:
```

```env
# .env
APP_PORT=3000
DB_PASSWORD=supersecret123
```

---

## Tổng kết

| Thuộc tính         | Chức năng               |
| ------------------ | ----------------------- |
| `image`            | Dùng image có sẵn       |
| `build`            | Build từ Dockerfile     |
| `ports`            | Map port host:container |
| `environment`      | Biến môi trường         |
| `env_file`         | Load biến từ file       |
| `volumes`          | Mount data              |
| `depends_on`       | Thứ tự start            |
| `restart`          | Auto-restart policy     |
| `healthcheck`      | Kiểm tra sức khoẻ       |
| `deploy.resources` | Giới hạn CPU/RAM        |
| `networks`         | Network tuỳ chỉnh       |
| `profiles`         | Services tuỳ chọn       |
