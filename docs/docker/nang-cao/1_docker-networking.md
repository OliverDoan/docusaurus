---
sidebar_position: 1
title: "1. Docker Networking"
---

# Docker Networking

Networking là cách các containers giao tiếp với nhau và với thế giới bên ngoài. Bài này giải thích hệ thống mạng trong Docker.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Custom bridge hỗ trợ DNS tự động** — container gọi nhau bằng tên; default bridge chỉ dùng được IP (đổi mỗi lần tạo lại).
- **4 driver chính**: `bridge` (mặc định), `host` (chỉ Linux, bỏ NAT), `none` (cô lập hoàn toàn), `overlay` (Swarm nhiều host).
- **Port mapping `-p 80:80`** để mở dịch vụ ra host cho người dùng bên ngoài truy cập.
- **Compose tự tạo network `<project>_default`**; tách `frontend`/`backend` để `nginx` không chạm thẳng tới `db`.
- **Quản lý**: `docker network create/connect/disconnect/inspect`, `docker network prune` xoá network không dùng.

:::

---

## Mục lục

- [Vì sao cần Docker networking?](#vì-sao-cần-docker-networking)
- [1. Tổng quan Network trong Docker](#1-tổng-quan-network-trong-docker)
- [2. Bridge Network (Mặc định)](#2-bridge-network-mặc-định)
- [3. Host Network](#3-host-network)
- [4. None Network](#4-none-network)
- [5. Quản lý Networks](#5-quản-lý-networks)
- [6. Docker Compose Networking](#6-docker-compose-networking)
- [7. DNS trong Docker](#7-dns-trong-docker)
- [8. Bài tập thực hành](#8-bài-tập-thực-hành)
- [Tổng kết](#tổng-kết)

---

## Vì sao cần Docker networking?

**Vấn đề:**

```bash
# Mỗi container bị CÔ LẬP mạng — nhưng app thực tế cần giao tiếp:
docker run -d --name web my-app        # web cần GỌI tới db
docker run -d --name db postgres:16    # db nằm riêng, không thấy nhau

# IP container THAY ĐỔI mỗi lần tạo lại → không thể hardcode
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' db
# 172.17.0.3   ← chạy lại có thể thành 172.17.0.5

# Người dùng ngoài cũng không truy cập được vào container
curl http://localhost:80   # → connection refused
```

**Giải pháp:**

```bash
# Tạo network ảo (bridge) → container cùng network gọi nhau bằng TÊN (DNS nội bộ)
docker network create app-net
docker run -d --name web --network app-net my-app
docker run -d --name db  --network app-net postgres:16
# web kết nối: postgresql://user:pass@db:5432/mydb   ← dùng tên, không cần IP

# Mở cổng ra host bằng port mapping (-p) cho người dùng truy cập
docker run -d --name web --network app-net -p 80:80 my-app
curl http://localhost:80   # → OK

# Cô lập nhóm service bằng network riêng (frontend / backend)
docker network create backend-net
docker network connect backend-net db   # chỉ service cần thiết mới thấy db
```

:::tip[Dùng thực tế]

- **Web gọi database**: đặt `web` và `db` cùng network, kết nối qua tên `db` thay vì IP.
- **Mở dịch vụ ra ngoài**: `-p 80:80` để người dùng truy cập web qua cổng host.
- **Tách frontend/backend**: dùng network riêng để `nginx` không chạm thẳng tới `db`.
- **Nhiều service trong Compose**: Compose tự tạo network, các service gọi nhau bằng tên service.

:::

---

## 1. Tổng quan Network trong Docker

Khi cài Docker, 3 networks được tạo sẵn:

```bash
docker network ls

# NETWORK ID     NAME      DRIVER    SCOPE
# abc123         bridge    bridge    local
# def456         host      host      local
# ghi789         none      null      local
```

### Các loại Network Driver

| Driver      | Mô tả                                             | Khi nào dùng               |
| ----------- | ------------------------------------------------- | -------------------------- |
| **bridge**  | Network mặc định, containers giao tiếp qua bridge | Hầu hết trường hợp         |
| **host**    | Container dùng network của host trực tiếp         | Cần hiệu năng network cao  |
| **none**    | Không có network                                  | Container cô lập hoàn toàn |
| **overlay** | Network giữa nhiều Docker hosts                   | Docker Swarm               |

---

## 2. Bridge Network (Mặc định)

### Default bridge

Khi chạy `docker run` không chỉ định network, container nằm trong **default bridge**:

```bash
# 2 containers trên default bridge
docker run -d --name web nginx
docker run -d --name app node:20-alpine sleep infinity

# Kiểm tra IP
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' web
# 172.17.0.2

docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' app
# 172.17.0.3

# Ping bằng IP: OK
docker exec app ping 172.17.0.2

# Ping bằng tên: FAIL trên default bridge!
docker exec app ping web
# ping: bad address 'web'
```

### Custom bridge (Khuyến nghị)

Custom bridge hỗ trợ **DNS tự động** — containers gọi nhau bằng tên:

```bash
# Tạo custom bridge
docker network create my-network

# Chạy containers trên custom bridge
docker run -d --name web --network my-network nginx
docker run -d --name app --network my-network node:20-alpine sleep infinity

# Ping bằng tên: OK!
docker exec app ping web
# PING web (172.18.0.2): 56 data bytes
# 64 bytes from 172.18.0.2: seq=0 ttl=64 time=0.123 ms
```

### So sánh Default vs Custom Bridge

|                                | Default Bridge                | Custom Bridge             |
| ------------------------------ | ----------------------------- | ------------------------- |
| **DNS resolution**             | Khong (chỉ IP)                | Co (dùng tên container)   |
| **Cô lập**                     | Tất cả container cùng network | Chỉ container được add    |
| **Kết nối/ngắt khi đang chạy** | Khong                         | Co                        |
| **Cấu hình**                   | Không tuỳ chỉnh được          | Tuỳ chỉnh subnet, gateway |

---

## 3. Host Network

Container dùng trực tiếp network stack của host (không có NAT):

```bash
docker run -d --network host nginx

# Nginx listen trên port 80 của HOST
# Không cần -p port mapping
# Truy cập: http://localhost:80
```

**Use case**: Khi cần hiệu năng network tối đa (giảm overhead NAT).

**Lưu ý**: Chỉ hoạt động trên Linux. macOS/Windows luôn chạy qua VM nên host network không có tác dụng.

---

## 4. None Network

Container hoàn toàn cô lập, không có network:

```bash
docker run -d --network none alpine sleep infinity

# Không có eth0, chỉ có loopback
docker exec <container> ifconfig
# lo: 127.0.0.1
```

**Use case**: Container xử lý data nhạy cảm, không cần network.

---

## 5. Quản lý Networks

### Tạo network

```bash
# Tạo bridge network
docker network create my-net

# Tạo với subnet cụ thể
docker network create --subnet=192.168.100.0/24 my-net

# Tạo với gateway
docker network create --subnet=10.0.0.0/16 --gateway=10.0.0.1 my-net
```

### Kết nối container vào network

```bash
# Kết nối container đang chạy vào network
docker network connect my-net my-container

# Ngắt kết nối
docker network disconnect my-net my-container

# Container có thể thuộc nhiều networks
docker network connect frontend-net my-container
docker network connect backend-net my-container
```

### Xem thông tin

```bash
# Liệt kê networks
docker network ls

# Chi tiết network
docker network inspect my-net

# Xem containers trong network
docker network inspect -f '{{range .Containers}}{{.Name}} {{end}}' my-net
```

### Xoá network

```bash
# Xoá 1 network
docker network rm my-net

# Xoá tất cả network không dùng
docker network prune
```

---

## 6. Docker Compose Networking

### Mặc định

Docker Compose tự tạo network cho project:

```yaml
# docker-compose.yml trong thư mục "myproject"
services:
  web:
    image: my-app
    # Gọi "db" bằng hostname "db"
  db:
    image: postgres:16
```

```bash
docker compose up -d
docker network ls
# → myproject_default
```

### Tách network cho frontend/backend

```yaml
services:
  nginx:
    image: nginx
    networks:
      - frontend
    ports:
      - "80:80"

  api:
    build: .
    networks:
      - frontend
      - backend

  db:
    image: postgres:16
    networks:
      - backend

networks:
  frontend:
  backend:
```

```
Internet → nginx ←frontend→ api ←backend→ db
                                           ↑
         nginx không thể truy cập db (khác network)
```

---

## 7. DNS trong Docker

### Service Discovery

Trong custom bridge và Docker Compose, containers tìm nhau qua **DNS nội bộ** của Docker:

```bash
# Container "web" muốn kết nối "db"
# Docker DNS resolve: "db" → 172.18.0.3

# Trong code ứng dụng:
# DATABASE_URL=postgresql://user:pass@db:5432/mydb
#                                      ^^
#                               Tên container/service
```

### DNS Round Robin (nhiều containers cùng tên)

```bash
docker network create my-net

# 3 containers cùng network alias
docker run -d --network my-net --network-alias api my-api
docker run -d --network my-net --network-alias api my-api
docker run -d --network my-net --network-alias api my-api

# DNS "api" sẽ trả về 3 IP (round robin)
docker run --rm --network my-net alpine nslookup api
```

---

## 8. Bài tập thực hành

```bash
# 1. Tạo custom network
docker network create practice-net

# 2. Chạy 2 containers trên network
docker run -d --name web --network practice-net nginx:alpine
docker run -d --name tools --network practice-net alpine sleep infinity

# 3. Ping bằng tên
docker exec tools ping -c 3 web

# 4. Curl nginx từ tools
docker exec tools wget -qO- http://web:80

# 5. Tạo network thứ 2
docker network create isolated-net
docker run -d --name db --network isolated-net alpine sleep infinity

# 6. db không thể ping web (khác network)
docker exec db ping -c 1 web
# → ping: bad address 'web'

# 7. Kết nối db vào practice-net
docker network connect practice-net db

# 8. Giờ db có thể ping web
docker exec db ping -c 1 web

# 9. Dọn dẹp
docker rm -f web tools db
docker network rm practice-net isolated-net
```

---

## Tổng kết

| Network Driver       | Đặc điểm             | DNS   | Use case              |
| -------------------- | -------------------- | ----- | --------------------- |
| **bridge** (default) | Cô lập cơ bản        | Khong | Test nhanh            |
| **bridge** (custom)  | Cô lập + DNS         | Co    | **Khuyến nghị**       |
| **host**             | Dùng network host    | -     | Hiệu năng cao (Linux) |
| **none**             | Không network        | -     | Cô lập hoàn toàn      |
| **Compose default**  | Custom bridge tự tạo | Co    | Multi-container       |
