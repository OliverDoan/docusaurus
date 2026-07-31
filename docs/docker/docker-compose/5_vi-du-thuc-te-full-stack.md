---
sidebar_position: 5
title: "5. Ví dụ thực tế: Full-stack app"
---

# Ví dụ thực tế: Full-stack app

Bài này tổng hợp kiến thức Docker Compose qua các ví dụ full-stack thực tế mà bạn sẽ gặp trong công việc.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Tổng hợp các stack thực tế** — Node.js + PostgreSQL + Redis, Next.js + Prisma, và Nginx reverse proxy + microservices.
- **Reverse proxy**: `nginx` phía trước dùng `expose` cho service nội bộ, route `/` về frontend và `/api/` về backend.
- **Multi-stage `target: development`** kết hợp `profiles: dev` để bật thêm adminer/pgAdmin/MailHog khi cần.
- **Chạy migration** qua `docker compose run --rm migrate`; dùng volume riêng cho `node_modules` tránh xung đột host.
- **Workflow hàng ngày**: `up -d` để bật, `logs -f app` khi debug, backup/restore bằng `pg_dump`/`psql`.

:::

---

## Mục lục

- [1. Node.js + PostgreSQL + Redis](#1-nodejs-postgresql-redis)
- [2. Next.js + PostgreSQL + Prisma](#2-nextjs-postgresql-prisma)
- [3. Nginx Reverse Proxy + Multiple Services](#3-nginx-reverse-proxy-multiple-services)
- [4. Development Environment hoàn chỉnh](#4-development-environment-hoàn-chỉnh)
- [5. Workflow thường dùng](#5-workflow-thường-dùng)
- [Tổng kết](#tổng-kết)

---

## 1. Node.js + PostgreSQL + Redis

Stack phổ biến nhất cho web application:

```yaml
# docker-compose.yml
services:
  # ====== Application ======
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      PORT: 3000
      DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-secret}@db:5432/${DB_NAME:-myapp}
      REDIS_URL: redis://cache:6379
    volumes:
      - ./src:/app/src # Hot reload cho development
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    restart: unless-stopped

  # ====== Database ======
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-secret}
      POSTGRES_DB: ${DB_NAME:-myapp}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql # SQL khởi tạo
    ports:
      - "5432:5432" # Expose cho dev tools (DBeaver, pgAdmin)
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: always

  # ====== Cache ======
  cache:
    image: redis:7-alpine
    volumes:
      - redisdata:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  # ====== Database Admin (dev only) ======
  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - db
    profiles:
      - dev

volumes:
  pgdata:
  redisdata:
```

```bash
# Development (với adminer)
docker compose --profile dev up -d

# Production
docker compose up -d
```

---

## 2. Next.js + PostgreSQL + Prisma

Stack phổ biến cho React full-stack:

```yaml
services:
  app:
    build:
      context: .
      target: development # Multi-stage: dùng stage dev
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:secret@db:5432/nextapp
    volumes:
      - ./src:/app/src
      - ./prisma:/app/prisma
    depends_on:
      db:
        condition: service_healthy
    command: npm run dev

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: nextapp
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Chạy migration khi cần
  migrate:
    build: .
    environment:
      DATABASE_URL: postgresql://postgres:secret@db:5432/nextapp
    command: npx prisma migrate deploy
    depends_on:
      db:
        condition: service_healthy
    profiles:
      - tools

volumes:
  pgdata:
```

```bash
# Start app
docker compose up -d

# Chạy migration
docker compose run --rm migrate
# Hoặc
docker compose --profile tools run --rm migrate

# Chạy Prisma Studio
docker compose exec app npx prisma studio
```

---

## 3. Nginx Reverse Proxy + Multiple Services

Kiến trúc microservices đơn giản:

```yaml
services:
  # ====== Reverse Proxy ======
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - frontend
      - api
    restart: always

  # ====== Frontend ======
  frontend:
    build:
      context: ./frontend
    expose:
      - "3000"
    restart: unless-stopped

  # ====== Backend API ======
  api:
    build:
      context: ./backend
    expose:
      - "4000"
    environment:
      DATABASE_URL: postgresql://postgres:secret@db:5432/myapp
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  # ====== Database ======
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: always

volumes:
  pgdata:
```

File `nginx.conf`:

```nginx
upstream frontend {
    server frontend:3000;
}

upstream api {
    server api:4000;
}

server {
    listen 80;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API
    location /api/ {
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```
Trình duyệt → nginx:80
                ├── / → frontend:3000
                └── /api/ → api:4000
```

---

## 4. Development Environment hoàn chỉnh

```yaml
services:
  # ====== App ======
  app:
    build:
      context: .
      target: development
    ports:
      - "3000:3000"
      - "9229:9229" # Node.js debugger
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:dev@db:5432/devdb
      REDIS_URL: redis://cache:6379
    volumes:
      - .:/app
      - node_modules:/app/node_modules
    command: npm run dev
    depends_on:
      db:
        condition: service_healthy

  # ====== Database ======
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: devdb
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 5s
      timeout: 5s
      retries: 5

  # ====== Cache ======
  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # ====== Mail (dev) ======
  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025" # SMTP
      - "8025:8025" # Web UI
    profiles:
      - dev

  # ====== DB Admin ======
  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@local.dev
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    profiles:
      - dev

volumes:
  pgdata:
  node_modules:
```

```bash
# Start cơ bản
docker compose up -d

# Start đầy đủ dev tools
docker compose --profile dev up -d

# Truy cập:
# App:     http://localhost:3000
# pgAdmin: http://localhost:5050
# MailHog: http://localhost:8025
```

---

## 5. Workflow thường dùng

### Setup project lần đầu

```bash
# 1. Clone repo
git clone <repo-url> && cd <project>

# 2. Copy env
cp .env.example .env
# Sửa .env nếu cần

# 3. Start
docker compose up -d

# 4. Chạy migration
docker compose exec app npm run migrate

# 5. Seed data
docker compose exec app npm run seed

# 6. Mở trình duyệt
open http://localhost:3000
```

### Hàng ngày

```bash
# Sáng: Start
docker compose up -d

# Xem logs khi debug
docker compose logs -f app

# Chạy tests
docker compose exec app npm test

# Chiều: Stop
docker compose stop
```

### Database operations

```bash
# Chạy migration
docker compose exec app npm run migrate

# Reset database
docker compose down -v
docker compose up -d
docker compose exec app npm run migrate
docker compose exec app npm run seed

# Backup
docker compose exec db pg_dump -U postgres myapp > backup.sql

# Restore
docker compose exec -T db psql -U postgres myapp < backup.sql
```

---

## Tổng kết

| Pattern                      | Mô tả                                 |
| ---------------------------- | ------------------------------------- |
| **App + DB + Cache**         | Stack phổ biến nhất                   |
| **Reverse Proxy**            | Nginx phía trước, route đến services  |
| **Multi-stage dev/prod**     | `--target` để chọn stage              |
| **Profiles**                 | `--profile dev` cho dev tools         |
| **Override files**           | `docker-compose.override.yml` cho dev |
| **Volume cho node_modules**  | Tránh xung đột host/container         |
| **Healthcheck + depends_on** | Đợi DB ready trước khi start app      |
