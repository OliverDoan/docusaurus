---
sidebar_position: 2
title: "2. Tạo và chạy Container"
---

# Tạo và chạy Container

Bài này đi sâu vào các kịch bản thực tế khi tạo và chạy container, từ web server đến database.

---

## Mục lục

- [1. Chạy Web Server](#1-chạy-web-server)
- [2. Chạy Database](#2-chạy-database)
- [3. Chạy Ứng dụng Development](#3-chạy-ứng-dụng-development)
- [4. Chạy công cụ 1 lần (One-off)](#4-chạy-công-cụ-1-lần-one-off)
- [5. Naming Convention](#5-naming-convention)
- [6. Resource Limits](#6-resource-limits)
- [7. Bài tập thực hành](#7-bài-tập-thực-hành)
- [Tổng kết](#tổng-kết)

---

## 1. Chạy Web Server

### Nginx

```bash
# Chạy Nginx cơ bản
docker run -d --name nginx-server -p 8080:80 nginx:alpine

# Chạy Nginx với HTML custom
docker run -d \
  --name nginx-custom \
  -p 8080:80 \
  -v $(pwd)/html:/usr/share/nginx/html:ro \
  nginx:alpine

# Chạy với config custom
docker run -d \
  --name nginx-custom \
  -p 8080:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  -v $(pwd)/html:/usr/share/nginx/html:ro \
  nginx:alpine
```

### Apache (httpd)

```bash
docker run -d \
  --name apache-server \
  -p 8080:80 \
  -v $(pwd)/html:/usr/local/apache2/htdocs/ \
  httpd:alpine
```

---

## 2. Chạy Database

### PostgreSQL

```bash
docker run -d \
  --name postgres-db \
  -p 5432:5432 \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=secret123 \
  -e POSTGRES_DB=myapp \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16-alpine
```

```bash
# Kết nối vào PostgreSQL
docker exec -it postgres-db psql -U admin -d myapp

# Hoặc dùng psql từ host
psql -h localhost -p 5432 -U admin -d myapp
```

### MySQL

```bash
docker run -d \
  --name mysql-db \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=myapp \
  -e MYSQL_USER=admin \
  -e MYSQL_PASSWORD=secret123 \
  -v mysqldata:/var/lib/mysql \
  mysql:8
```

```bash
# Kết nối vào MySQL
docker exec -it mysql-db mysql -u admin -p
```

### MongoDB

```bash
docker run -d \
  --name mongo-db \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=secret123 \
  -v mongodata:/data/db \
  mongo:7
```

### Redis

```bash
docker run -d \
  --name redis-cache \
  -p 6379:6379 \
  -v redisdata:/data \
  redis:7-alpine
```

```bash
# Kết nối Redis CLI
docker exec -it redis-cache redis-cli
# > SET mykey "hello"
# > GET mykey
# > exit
```

---

## 3. Chạy Ứng dụng Development

### Node.js với Hot Reload

```bash
docker run -d \
  --name node-dev \
  -p 3000:3000 \
  -v $(pwd):/app \
  -w /app \
  node:20-alpine \
  sh -c "npm install && npm run dev"
```

**Giải thích:**

- `-v $(pwd):/app` — Mount thư mục hiện tại vào container
- `-w /app` — Đặt working directory
- Code thay đổi trên host → Container thấy ngay (hot reload)

### Python

```bash
docker run -d \
  --name python-dev \
  -p 8000:8000 \
  -v $(pwd):/app \
  -w /app \
  python:3.12-slim \
  sh -c "pip install -r requirements.txt && python app.py"
```

---

## 4. Chạy công cụ 1 lần (One-off)

Dùng `--rm` để container tự xoá sau khi chạy xong:

### Chạy script

```bash
# Chạy Python script
docker run --rm -v $(pwd):/app -w /app python:3.12 python script.py

# Chạy Node.js script
docker run --rm -v $(pwd):/app -w /app node:20 node script.js
```

### Dùng như CLI tool

```bash
# Dùng curl
docker run --rm curlimages/curl https://api.github.com

# Dùng jq
docker run --rm -i stedolan/jq '.' < data.json

# Dùng AWS CLI
docker run --rm -v ~/.aws:/root/.aws amazon/aws-cli s3 ls
```

### Chạy test

```bash
# Chạy unit tests
docker run --rm -v $(pwd):/app -w /app node:20 npm test

# Chạy lint
docker run --rm -v $(pwd):/app -w /app node:20 npx eslint .
```

---

## 5. Naming Convention

### Đặt tên container

```bash
# Tên rõ ràng, mô tả chức năng
docker run -d --name myapp-web nginx
docker run -d --name myapp-db postgres
docker run -d --name myapp-cache redis

# Tránh tên mơ hồ
docker run -d --name test1 nginx        # ❌
docker run -d --name container123 nginx  # ❌
```

### Quy ước đặt tên

```
<project>-<service>[-<environment>]

Ví dụ:
ecommerce-web
ecommerce-api
ecommerce-db
ecommerce-cache
ecommerce-web-staging
```

---

## 6. Resource Limits

### Giới hạn Memory

```bash
# Giới hạn 512MB RAM
docker run -d --memory=512m nginx

# Giới hạn 1GB RAM + 512MB swap
docker run -d --memory=1g --memory-swap=1536m nginx
```

### Giới hạn CPU

```bash
# Dùng tối đa 1.5 CPU cores
docker run -d --cpus=1.5 nginx

# Dùng 50% CPU
docker run -d --cpu-shares=512 nginx

# Chỉ dùng CPU 0 và 1
docker run -d --cpuset-cpus="0,1" nginx
```

### Kết hợp

```bash
docker run -d \
  --name my-app \
  --memory=512m \
  --cpus=1 \
  --restart unless-stopped \
  -p 3000:3000 \
  my-app:v1.0
```

---

## 7. Bài tập thực hành

### Bài 1: Full-stack đơn giản

```bash
# 1. Chạy PostgreSQL
docker run -d \
  --name practice-db \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=practice \
  postgres:16-alpine

# 2. Chạy Redis
docker run -d \
  --name practice-cache \
  -p 6379:6379 \
  redis:7-alpine

# 3. Kiểm tra
docker ps
# → Thấy 2 containers đang chạy

# 4. Kết nối PostgreSQL
docker exec -it practice-db psql -U postgres -d practice
# \dt  (list tables)
# \q   (thoát)

# 5. Kết nối Redis
docker exec -it practice-cache redis-cli
# PING  → PONG
# exit

# 6. Xem resource usage
docker stats --no-stream

# 7. Dọn dẹp
docker rm -f practice-db practice-cache
docker volume prune
```

### Bài 2: So sánh resource limits

```bash
# Container không giới hạn
docker run -d --name no-limit nginx

# Container giới hạn 128MB RAM
docker run -d --name limited --memory=128m nginx

# So sánh
docker stats --no-stream
# → "limited" có MEM LIMIT = 128MiB

# Dọn dẹp
docker rm -f no-limit limited
```

---

## Tổng kết

| Kịch bản                | Lệnh chính                                          |
| ----------------------- | --------------------------------------------------- |
| **Web server**          | `docker run -d -p 8080:80 nginx`                    |
| **Database**            | `docker run -d -p 5432:5432 -e ... -v ... postgres` |
| **Dev với hot reload**  | `docker run -d -v $(pwd):/app ...`                  |
| **Script 1 lần**        | `docker run --rm ...`                               |
| **Giới hạn tài nguyên** | `--memory=512m --cpus=1`                            |
| **Auto restart**        | `--restart unless-stopped`                          |
