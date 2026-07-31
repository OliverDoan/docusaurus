---
sidebar_position: 3
title: "3. Quản lý Container"
---

# Quản lý Container

Bài này hướng dẫn cách quản lý container hiệu quả: liệt kê, lọc, update, và các thao tác hàng ngày.

---

:::note[Ghi nhớ nhanh]

- ⭐ **`docker ps` / `docker ps -a`** — xem container đang chạy / tất cả; lọc bằng `--filter` (status, name, ancestor, label) và tuỳ biến hiển thị bằng `--format`.
- ⭐ **`docker stop` (graceful, SIGTERM→SIGKILL) vs `docker kill` (SIGKILL ngay)** — `stop` cho app cleanup, `kill` khi container bị treo.
- **`docker update`** đổi được `--memory`, `--cpus`, `--restart` mà không tạo lại container; nhưng **không** đổi được port mapping/volume.
- **Xem chi tiết**: `docker inspect` (JSON, dùng `-f` để lọc), `docker top` (processes), `docker diff` (file đã thay đổi).
- **Dọn dẹp**: `docker container prune` xoá container đã dừng; ưu tiên Dockerfile hơn `docker commit` vì reproducible và version control.

:::

---

## Mục lục

- [Vì sao cần quản lý container?](#vì-sao-cần-quản-lý-container)
- [1. Liệt kê và lọc Container](#1-liệt-kê-và-lọc-container)
- [2. Dừng và khởi động lại](#2-dừng-và-khởi-động-lại)
- [3. Đổi tên Container](#3-đổi-tên-container)
- [4. Update Container đang chạy](#4-update-container-đang-chạy)
- [5. Xem thông tin chi tiết](#5-xem-thông-tin-chi-tiết)
- [6. Export và Import Container](#6-export-và-import-container)
- [7. Labels — Gắn nhãn Container](#7-labels-gắn-nhãn-container)
- [8. Lệnh quản lý hàng ngày](#8-lệnh-quản-lý-hàng-ngày)
- [Tổng kết](#tổng-kết)

---

## Vì sao cần quản lý container?

**Vấn đề:** Mỗi lần chạy `docker run`, Docker tạo ra một container mới và để nó tồn tại mãi — dù đã dừng hay thoát. Sau vài tuần làm việc, máy tích lũy hàng chục container "zombie" chiếm ổ đĩa, giữ cổng mạng, và tiêu tốn RAM.

```bash
# Tình huống thực tế: khởi động web app nhưng cổng 3000 đã bị giữ
docker run -p 3000:3000 my-app
# Error: Bind for 0.0.0.0:3000 failed: port is already allocated

# Nhìn lại — có đến 15 container đang chiếm tài nguyên
docker ps -a
# CONTAINER ID   IMAGE     STATUS                     NAMES
# a1b2c3d4e5f6   my-app    Exited (1) 2 days ago      my-app_1
# b2c3d4e5f6a1   my-app    Exited (0) 5 days ago      my-app_2
# c3d4e5f6a1b2   nginx     Up 3 hours                 web-prod
# ...
```

**Giải pháp:** Các lệnh quản lý container cho phép theo dõi vòng đời (đang chạy, đã dừng, đã thoát), dừng/khởi động lại khi cần, và dọn dẹp định kỳ để hệ thống luôn gọn gàng.

```bash
# Dừng container đúng cách (graceful shutdown)
docker stop my-app

# Xoá container không còn dùng
docker rm my-app

# Dọn sạch tất cả container đã dừng chỉ với một lệnh
docker container prune
# Deleted Containers: a1b2c3d4e5f6, b2c3d4e5f6a1
# Total reclaimed space: 1.2GB
```

:::tip[Dùng thực tế]
- **Dev hàng ngày:** Chạy `docker ps -a` mỗi sáng để kiểm tra container nào bị treo hoặc thoát bất thường.
- **Giải phóng cổng bị giữ:** Tìm và dừng container đang chiếm cổng trước khi chạy lại ứng dụng.
- **Tiết kiệm ổ đĩa:** Chạy `docker container prune` cuối ngày để xoá các container Exited không còn cần.
- **CI/CD pipeline:** Xoá container cũ sau mỗi lần build để tránh xung đột tên và cổng giữa các lần chạy.
:::

---

## 1. Liệt kê và lọc Container

### Liệt kê cơ bản

```bash
# Container đang chạy
docker ps

# Tất cả container (bao gồm đã dừng)
docker ps -a

# Chỉ hiện container ID
docker ps -q

# Container dừng gần nhất
docker ps -l
```

### Lọc container

```bash
# Lọc theo trạng thái
docker ps -a --filter "status=running"
docker ps -a --filter "status=exited"
docker ps -a --filter "status=paused"

# Lọc theo tên
docker ps -a --filter "name=my-app"

# Lọc theo image
docker ps -a --filter "ancestor=nginx"

# Lọc theo label
docker ps -a --filter "label=env=production"

# Kết hợp nhiều filter
docker ps -a --filter "status=running" --filter "ancestor=nginx"
```

### Format output

```bash
# Custom format
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"

# JSON format
docker ps --format json

# Chỉ hiện tên
docker ps --format "{{.Names}}"
```

---

## 2. Dừng và khởi động lại

### Stop vs Kill

```bash
# Stop: Gửi SIGTERM → đợi 10s → SIGKILL
docker stop my-container

# Stop với timeout tuỳ chỉnh (đợi 30s)
docker stop -t 30 my-container

# Kill: Gửi SIGKILL ngay lập tức
docker kill my-container
```

|                  | docker stop             | docker kill       |
| ---------------- | ----------------------- | ----------------- |
| **Signal**       | SIGTERM → SIGKILL       | SIGKILL           |
| **Graceful**     | Co (app có thể cleanup) | Khong             |
| **Khi nào dùng** | Bình thường             | Container bị treo |

### Khởi động lại

```bash
# Start container đã dừng
docker start my-container

# Restart (stop + start)
docker restart my-container

# Restart với timeout
docker restart -t 5 my-container
```

### Thao tác hàng loạt

```bash
# Dừng tất cả container
docker stop $(docker ps -q)

# Xoá tất cả container đã dừng
docker container prune

# Xoá tất cả container (bao gồm đang chạy)
docker rm -f $(docker ps -aq)
```

---

## 3. Đổi tên Container

```bash
# Đổi tên
docker rename old-name new-name

# Ví dụ
docker rename my-app my-app-v2
```

---

## 4. Update Container đang chạy

Cập nhật cấu hình mà không cần tạo lại container:

```bash
# Thay đổi memory limit
docker update --memory=1g my-container

# Thay đổi CPU limit
docker update --cpus=2 my-container

# Thay đổi restart policy
docker update --restart unless-stopped my-container

# Kết hợp
docker update --memory=512m --cpus=1 --restart always my-container
```

**Lưu ý**: Không thể update port mapping hoặc volume mount. Phải tạo lại container.

---

## 5. Xem thông tin chi tiết

### Inspect

```bash
# Toàn bộ thông tin (JSON)
docker inspect my-container

# Chỉ lấy IP address
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' my-container

# Chỉ lấy trạng thái
docker inspect -f '{{.State.Status}}' my-container

# Xem mounts
docker inspect -f '{{json .Mounts}}' my-container | python3 -m json.tool

# Xem environment variables
docker inspect -f '{{json .Config.Env}}' my-container

# Xem port bindings
docker inspect -f '{{json .NetworkSettings.Ports}}' my-container
```

### Top — Processes trong container

```bash
docker top my-container

# Output:
# UID    PID    PPID   CMD
# root   1234   1230   nginx: master process
# nginx  1240   1234   nginx: worker process
```

### Diff — File đã thay đổi

```bash
docker diff my-container

# Output:
# C /var          ← Changed
# A /var/log/app  ← Added
# D /tmp/cache    ← Deleted
```

---

## 6. Export và Import Container

### Tạo Image từ Container đang chạy

```bash
# Commit container thành image mới
docker commit my-container my-custom-image:v1

# Commit với message
docker commit -m "Added custom config" my-container my-custom-image:v1

# Commit với author
docker commit -a "dev@example.com" -m "Custom nginx" my-container custom-nginx:v1
```

**Lưu ý**: `docker commit` tạo image từ trạng thái hiện tại của container. Tuy nhiên, nên dùng **Dockerfile** thay vì commit vì Dockerfile:

- Reproducible (có thể build lại)
- Version control (lưu trong git)
- Transparent (biết image chứa gì)

### Export/Import

```bash
# Export container ra file tar
docker export my-container > container-backup.tar

# Import file tar thành image
docker import container-backup.tar my-imported-image:v1
```

---

## 7. Labels — Gắn nhãn Container

Labels giúp tổ chức và quản lý containers:

```bash
# Gắn label khi run
docker run -d \
  --name web-prod \
  --label env=production \
  --label team=backend \
  --label version=1.0 \
  nginx

# Lọc theo label
docker ps --filter "label=env=production"
docker ps --filter "label=team=backend"
```

---

## 8. Lệnh quản lý hàng ngày

### Workflow cơ bản

```bash
# Sáng: Kiểm tra containers
docker ps -a

# Xem nào đang unhealthy
docker ps --filter "health=unhealthy"

# Xem resource usage
docker stats --no-stream

# Xem logs của container có vấn đề
docker logs --tail 100 problem-container

# Restart container có vấn đề
docker restart problem-container

# Cuối ngày: Dọn dẹp
docker container prune
docker image prune
```

### Script dọn dẹp

```bash
# Dọn dẹp toàn bộ Docker không dùng
docker system prune -a --volumes

# Xem dung lượng trước/sau
docker system df
```

---

## Tổng kết

| Thao tác          | Lệnh                                             |
| ----------------- | ------------------------------------------------ |
| **Liệt kê**       | `docker ps [-a]`                                 |
| **Lọc**           | `docker ps --filter "..."`                       |
| **Dừng**          | `docker stop` (graceful) / `docker kill` (force) |
| **Khởi động**     | `docker start` / `docker restart`                |
| **Đổi tên**       | `docker rename`                                  |
| **Update config** | `docker update --memory=1g`                      |
| **Chi tiết**      | `docker inspect`                                 |
| **Processes**     | `docker top`                                     |
| **File changes**  | `docker diff`                                    |
| **Commit**        | `docker commit` (ưu tiên Dockerfile)             |
| **Dọn dẹp**       | `docker container prune`                         |
