---
sidebar_position: 1
title: "1. Docker Compose là gì?"
---

# Docker Compose là gì?

Trong thực tế, ứng dụng không chỉ có 1 container. Một ứng dụng web thường cần: web server, database, cache, queue... Docker Compose giúp quản lý tất cả chúng.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Gói cả app đa container vào 1 file** — khai báo services, network, volume, biến môi trường trong `docker-compose.yml`, chỉ `docker compose up` là bật tất cả.
- **Services gọi nhau bằng tên** — Compose tự tạo network + DNS nội bộ nên `web` kết nối `db:5432` mà không cần IP.
- **`depends_on` quản lý thứ tự start** còn `volumes` giữ dữ liệu bền qua các lần tạo lại container.
- **Lệnh cốt lõi**: `docker compose up -d` để bật, `docker compose down` (thêm `-v` để xoá cả volume) để dừng và dọn.
- **Không scale được service có host port cố định** — phải bỏ host port hoặc đặt load balancer phía trước.

:::

---

## Mục lục

- [Vì sao có Docker Compose?](#vì-sao-có-docker-compose)
- [1. Vấn đề: Quản lý nhiều containers](#1-vấn-đề-quản-lý-nhiều-containers)
- [2. Docker Compose là gì?](#2-docker-compose-là-gì)
- [3. File docker-compose.yml cơ bản](#3-file-docker-composeyml-cơ-bản)
- [4. Các lệnh Docker Compose](#4-các-lệnh-docker-compose)
- [5. Networking trong Compose](#5-networking-trong-compose)
- [6. Bài tập thực hành](#6-bài-tập-thực-hành)
- [Tổng kết](#tổng-kết)

---

## Vì sao có Docker Compose?

**Vấn đề:** App thực tế hiếm khi chỉ có 1 container. Một hệ thống thường gồm nhiều thành phần cùng chạy: web + database + redis + worker. Khởi động từng cái bằng `docker run` với cả tá cờ (`-p`, `-v`, `-e`, `--network`) thì dài dằng dặc, khó nhớ, dễ gõ sai. Chưa kể phải tự tạo network, tự nhớ thứ tự start, và rất khó chia sẻ nguyên si setup này cho đồng nghiệp.

```bash
# Mỗi service một lệnh dài, dễ sai, khó chia sẻ
docker network create app-net
docker run -d --name db --network app-net -e POSTGRES_PASSWORD=secret -v pgdata:/var/lib/postgresql/data postgres:16
docker run -d --name cache --network app-net redis:7-alpine
docker run -d --name worker --network app-net -e REDIS_URL=redis://cache:6379 my-worker:latest
docker run -d --name web --network app-net -p 3000:3000 \
  -e DATABASE_URL=postgresql://postgres:secret@db:5432/postgres \
  -e REDIS_URL=redis://cache:6379 my-app:latest
# Phải nhớ đúng thứ tự, đúng tên network, đúng từng cờ...
```

**Giải pháp:** **Docker Compose** cho phép khai báo TOÀN BỘ ứng dụng đa container trong MỘT file `docker-compose.yml` (services, network, volume, env), rồi chỉ cần `docker compose up` để bật tất cả. Cấu hình nằm trong git nên ai cũng tái lập được y hệt.

```yaml
# docker-compose.yml — cả hệ thống gói gọn trong 1 file
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:secret@db:5432/postgres
      REDIS_URL: redis://cache:6379
    depends_on: [db, cache]

  worker:
    build: ./worker
    environment:
      REDIS_URL: redis://cache:6379
    depends_on: [cache]

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

:::tip[Dùng thực tế]

- **Dựng full-stack bằng 1 lệnh:** web + db + cache lên hết chỉ với `docker compose up -d`.
- **Môi trường dev đồng nhất:** cả team clone repo và chạy cùng một config, hết cảnh "máy tôi chạy được".
- **Chạy stack test trong CI:** bật nguyên hệ thống để test rồi `down` sạch sẽ sau khi xong.
- **Bật/tắt toàn bộ nhanh gọn:** `up` để khởi động, `down` để dọn dẹp tất cả container và network.

:::

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

| Không có Compose          | Có Compose               |
| ------------------------- | ------------------------ |
| Nhiều lệnh docker run dài | 1 file YAML + 1 lệnh     |
| Quản lý network thủ công  | Tự tạo network           |
| Nhớ thứ tự start          | `depends_on` quản lý     |
| Khó chia sẻ setup         | Commit file YAML vào git |
| Dễ quên options           | Mọi config trong 1 file  |

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

Ghép lại với ví dụ web + worker + db + cache ở đầu bài, toàn bộ hệ thống Compose dựng lên trông như sau — chỉ `web` mở port ra ngoài, các service còn lại nói chuyện với nhau qua network nội bộ:

```mermaid
flowchart TD
    U["Trình duyệt<br/>localhost:3000"] -->|"ports 3000:3000"| W
    subgraph NET["Network tự tạo (myproject_default)"]
        W["web"] -->|"db:5432"| DB["db<br/>(PostgreSQL)"]
        W -->|"cache:6379"| C["cache<br/>(Redis)"]
        WK["worker"] -->|"cache:6379"| C
    end
    DB --> V[("volume<br/>pgdata")]
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

| Khái niệm              | Giải thích                         |
| ---------------------- | ---------------------------------- |
| **Docker Compose**     | Tool quản lý multi-container       |
| **docker-compose.yml** | File YAML định nghĩa services      |
| **services**           | Các container cần chạy             |
| **volumes**            | Lưu trữ persistent data            |
| **networks**           | Tự tạo, services gọi nhau bằng tên |
| **depends_on**         | Thứ tự start services              |
| `docker compose up -d` | Start tất cả                       |
| `docker compose down`  | Stop và xoá tất cả                 |
