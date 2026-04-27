---
sidebar_position: 4
title: "4. Environment va bien moi truong"
---

# Environment và biến môi trường

Quản lý biến môi trường đúng cách là kỹ năng quan trọng khi làm việc với Docker Compose. Bài này hướng dẫn tất cả các cách truyền và quản lý biến môi trường.

---


---

## Mục lục

- [1. Tại sao cần biến môi trường?](#1-tại-sao-cần-biến-môi-trường)
- [2. Các cách truyền biến môi trường](#2-các-cách-truyền-biến-môi-trường)
- [3. Thứ tự ưu tiên](#3-thứ-tự-ưu-tiên)
- [4. Nhiều file .env cho nhiều môi trường](#4-nhiều-file-env-cho-nhiều-môi-trường)
- [5. Secrets (Bảo mật)](#5-secrets-bảo-mật)
- [6. Kiểm tra biến môi trường](#6-kiểm-tra-biến-môi-trường)
- [7. Best Practices](#7-best-practices)
- [8. Bài tập thực hành](#8-bài-tập-thực-hành)
- [Tổng kết](#tổng-kết)

---

## 1. Tại sao cần biến môi trường?

Biến môi trường giúp:
- **Tách config ra khỏi code** (12-Factor App)
- **Khác nhau giữa các môi trường** (dev, staging, production)
- **Bảo mật**: Không hardcode passwords/API keys trong code

```yaml
# ❌ SAI: Hardcode password
services:
  db:
    environment:
      POSTGRES_PASSWORD: MySuperSecretP@ss123  # Ai xem git cũng biết

# ✅ ĐÚNG: Dùng biến
services:
  db:
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}  # Lấy từ .env file
```

---

## 2. Các cách truyền biến môi trường

### Cách 1: Inline trong docker-compose.yml

```yaml
services:
  web:
    image: my-app
    environment:
      NODE_ENV: production
      PORT: "3000"
      DB_HOST: db
```

### Cách 2: Dạng list

```yaml
services:
  web:
    image: my-app
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_HOST=db
```

### Cách 3: File .env với env_file

```yaml
services:
  web:
    image: my-app
    env_file:
      - .env
```

```env
# .env
NODE_ENV=production
PORT=3000
DB_HOST=db
DB_PASSWORD=secret123
```

### Cách 4: Variable Substitution

File `.env` ở cùng thư mục với `docker-compose.yml` được Compose **tự động đọc** cho variable substitution:

```env
# .env
POSTGRES_VERSION=16
APP_PORT=3000
DB_PASSWORD=secret123
```

```yaml
services:
  db:
    image: postgres:${POSTGRES_VERSION}-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  web:
    ports:
      - "${APP_PORT}:3000"
```

### Cách 5: Giá trị mặc định

```yaml
services:
  web:
    ports:
      # Nếu APP_PORT không set → dùng 3000
      - "${APP_PORT:-3000}:3000"
    environment:
      # Nếu NODE_ENV không set → dùng development
      NODE_ENV: ${NODE_ENV:-development}
```

### Cách 6: Từ shell environment

```bash
# Export biến trên shell
export DB_PASSWORD=secret123

# Docker Compose sẽ dùng biến từ shell
docker compose up -d
```

---

## 3. Thứ tự ưu tiên

Khi cùng 1 biến được set ở nhiều nơi, Docker Compose ưu tiên theo thứ tự (cao → thấp):

1. **Shell environment** (export)
2. **docker-compose.yml** `environment:`
3. **env_file** (.env.local, .env.production)
4. **Dockerfile** `ENV`
5. **.env file** (variable substitution)

---

## 4. Nhiều file .env cho nhiều môi trường

### Cấu trúc

```
project/
├── docker-compose.yml
├── .env                 # Mặc định (development)
├── .env.production      # Production
├── .env.staging         # Staging
└── .env.local           # Local overrides (git ignored)
```

### Sử dụng

```bash
# Development (mặc định, đọc .env)
docker compose up -d

# Production
docker compose --env-file .env.production up -d

# Staging
docker compose --env-file .env.staging up -d
```

### Ví dụ các file .env

```env
# .env (development)
NODE_ENV=development
DB_HOST=db
DB_PASSWORD=dev_password
APP_PORT=3000
LOG_LEVEL=debug
```

```env
# .env.production
NODE_ENV=production
DB_HOST=prod-db.example.com
DB_PASSWORD=super_secret_prod_password
APP_PORT=80
LOG_LEVEL=warn
```

---

## 5. Secrets (Bảo mật)

### Docker Secrets (Compose)

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password

  web:
    build: .
    secrets:
      - api_key

secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    file: ./secrets/api_key.txt
```

```bash
# Tạo file secret
mkdir secrets
echo "supersecret123" > secrets/db_password.txt
echo "sk-abc123" > secrets/api_key.txt
```

### .gitignore

```gitignore
# Bảo mật: KHÔNG commit secrets
.env.local
.env.production
secrets/
```

---

## 6. Kiểm tra biến môi trường

### Xem config đã resolve

```bash
# Xem docker-compose.yml sau khi resolve biến
docker compose config

# Output:
# services:
#   db:
#     image: postgres:16-alpine
#     environment:
#       POSTGRES_PASSWORD: secret123  ← Đã resolve từ ${DB_PASSWORD}
```

### Xem biến trong container

```bash
# Xem tất cả biến
docker compose exec web env

# Xem 1 biến cụ thể
docker compose exec web printenv DATABASE_URL
```

---

## 7. Best Practices

### 1. Tách biến theo mục đích

```env
# .env

# === App ===
NODE_ENV=development
APP_PORT=3000
LOG_LEVEL=debug

# === Database ===
DB_HOST=db
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=secret
DB_NAME=myapp

# === Redis ===
REDIS_HOST=cache
REDIS_PORT=6379

# === External APIs ===
# Lấy từ .env.local (git ignored)
# API_KEY=sk-xxx
```

### 2. Document biến cần thiết

```env
# .env.example (commit vào git, KHÔNG có giá trị thật)
NODE_ENV=development
APP_PORT=3000

DB_HOST=db
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=       # Tạo password mạnh
DB_NAME=myapp

API_KEY=           # Lấy từ dashboard
```

### 3. Validate biến bắt buộc

Trong code ứng dụng:

```javascript
// Node.js
const required = ['DATABASE_URL', 'REDIS_URL', 'API_KEY'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env: ${key}`);
    process.exit(1);
  }
}
```

---

## 8. Bài tập thực hành

Tạo project với nhiều môi trường:

```env
# .env
COMPOSE_PROJECT_NAME=practice
POSTGRES_VERSION=16
NODE_VERSION=20
APP_PORT=3000
DB_PASSWORD=dev123
```

```yaml
# docker-compose.yml
services:
  web:
    image: node:${NODE_VERSION}-alpine
    ports:
      - "${APP_PORT:-3000}:3000"
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      DATABASE_URL: postgresql://admin:${DB_PASSWORD}@db:5432/practice
    command: sh -c "echo 'NODE_ENV=$NODE_ENV' && echo 'DB=$DATABASE_URL' && sleep infinity"
    depends_on:
      - db

  db:
    image: postgres:${POSTGRES_VERSION}-alpine
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: practice
```

```bash
# 1. Xem config đã resolve
docker compose config

# 2. Chạy
docker compose up -d

# 3. Xem biến trong container
docker compose exec web env

# 4. Override biến từ shell
APP_PORT=4000 docker compose up -d
# → Port 4000 thay vì 3000

# 5. Dọn dẹp
docker compose down
```

---

## Tổng kết

| Cách | Khi nào dùng |
|------|-------------|
| `environment:` inline | Biến không nhạy cảm, ít biến |
| `env_file: .env` | Nhiều biến, tách file riêng |
| Variable substitution `${}` | Dynamic config (version, port) |
| `${VAR:-default}` | Giá trị mặc định |
| `--env-file` flag | Chọn file .env theo môi trường |
| `secrets:` | Passwords, API keys (production) |
| `.env.example` | Document biến cần thiết |
