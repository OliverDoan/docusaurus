---
sidebar_position: 2
title: "2. Viet docker-compose.yml"
---

# Viết docker-compose.yml

Bài này đi chi tiết từng phần của file docker-compose.yml. Sau bài này bạn sẽ tự viết được Compose file cho project của mình.

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
  pgdata:  # Khai báo named volume
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
      - /app/node_modules  # Anonymous volume (Docker quản lý)
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

| Giá trị | Ý nghĩa |
|---------|---------|
| `no` | Không restart (mặc định) |
| `always` | Luôn restart |
| `on-failure` | Restart khi crash |
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

| Thuộc tính | Chức năng |
|-----------|-----------|
| `image` | Dùng image có sẵn |
| `build` | Build từ Dockerfile |
| `ports` | Map port host:container |
| `environment` | Biến môi trường |
| `env_file` | Load biến từ file |
| `volumes` | Mount data |
| `depends_on` | Thứ tự start |
| `restart` | Auto-restart policy |
| `healthcheck` | Kiểm tra sức khoẻ |
| `deploy.resources` | Giới hạn CPU/RAM |
| `networks` | Network tuỳ chỉnh |
| `profiles` | Services tuỳ chọn |
