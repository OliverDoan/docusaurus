---
sidebar_position: 5
title: "5. Giới hạn tài nguyên Container"
---

# Giới hạn tài nguyên Container

Mặc định container có thể dùng toàn bộ tài nguyên của host. Bài này hướng dẫn cách giới hạn CPU, RAM và disk cho mỗi container.

---

## Mục lục

- [1. Tại sao cần giới hạn tài nguyên?](#1-tại-sao-cần-giới-hạn-tài-nguyên)
- [2. Giới hạn Memory (RAM)](#2-giới-hạn-memory-ram)
- [3. Giới hạn CPU](#3-giới-hạn-cpu)
- [4. Giới hạn Disk I/O](#4-giới-hạn-disk-io)
- [5. Giới hạn số Process (PIDs)](#5-giới-hạn-số-process-pids)
- [6. Update Resource Limits](#6-update-resource-limits)
- [7. Monitoring Resources](#7-monitoring-resources)
- [8. Khuyến nghị cho từng loại service](#8-khuyến-nghị-cho-từng-loại-service)
- [9. Bài tập thực hành](#9-bài-tập-thực-hành)
- [Tổng kết](#tổng-kết)

---

## 1. Tại sao cần giới hạn tài nguyên?

Không giới hạn tài nguyên có thể dẫn đến:

- **1 container ngốn hết RAM** → Các container khác bị kill (OOM)
- **1 container chiếm hết CPU** → Các container khác bị chậm
- **Container chạy tràn disk** → Host hết dung lượng

Giới hạn tài nguyên giúp:

- Các container **cùng tồn tại** trên 1 host
- Phát hiện **memory leak** sớm
- Mô phỏng **môi trường production** (server thật có limit)

---

## 2. Giới hạn Memory (RAM)

### Các options

```bash
# Giới hạn RAM tối đa
docker run -d --memory=512m nginx
docker run -d --memory=1g nginx
docker run -d -m 256m nginx  # Viết tắt

# Giới hạn RAM + Swap
docker run -d --memory=512m --memory-swap=1g nginx
# RAM: 512MB, Swap: 512MB (1g - 512m)

# Tắt swap hoàn toàn
docker run -d --memory=512m --memory-swap=512m nginx

# Memory reservation (soft limit)
docker run -d --memory=1g --memory-reservation=512m nginx
```

### Đơn vị

| Đơn vị | Ý nghĩa   |
| ------ | --------- |
| `b`    | bytes     |
| `k`    | kilobytes |
| `m`    | megabytes |
| `g`    | gigabytes |

### OOM (Out of Memory)

Khi container vượt quá memory limit:

```bash
# Container bị kill với exit code 137
docker inspect -f '{{.State.OOMKilled}}' my-container
# true

# Kiểm tra trong logs
docker logs my-container
# Killed
```

**Xử lý**: Tăng memory limit hoặc tối ưu ứng dụng.

---

## 3. Giới hạn CPU

### Các options

```bash
# Giới hạn số CPU cores
docker run -d --cpus=1.5 nginx
# Dùng tối đa 1.5 cores

# CPU shares (tỷ lệ chia sẻ, mặc định 1024)
docker run -d --cpu-shares=512 nginx
# Được 50% CPU khi có cạnh tranh

# Chỉ định CPU cụ thể
docker run -d --cpuset-cpus="0,1" nginx
# Chỉ dùng CPU 0 và CPU 1

# CPU period và quota (nâng cao)
docker run -d --cpu-period=100000 --cpu-quota=50000 nginx
# 50% CPU (quota/period = 50000/100000)
```

### CPU shares vs CPUs

|                     | `--cpus`    | `--cpu-shares`        |
| ------------------- | ----------- | --------------------- |
| **Loại**            | Hard limit  | Soft limit (tỷ lệ)    |
| **Khi nào áp dụng** | Luôn luôn   | Chỉ khi có cạnh tranh |
| **Ví dụ**           | Max 2 cores | Ưu tiên CPU hơn       |

```bash
# Ví dụ: 2 containers trên máy 4 cores

# Container A: --cpu-shares=1024 (mặc định)
# Container B: --cpu-shares=512

# Khi cả 2 cần CPU:
# A nhận 66% CPU (1024 / (1024+512))
# B nhận 33% CPU (512 / (1024+512))

# Khi chỉ A chạy:
# A nhận 100% CPU (shares chỉ áp dụng khi cạnh tranh)
```

---

## 4. Giới hạn Disk I/O

```bash
# Giới hạn tốc độ đọc
docker run -d --device-read-bps=/dev/sda:10mb nginx

# Giới hạn tốc độ ghi
docker run -d --device-write-bps=/dev/sda:10mb nginx

# Giới hạn IOPS (I/O operations per second)
docker run -d --device-read-iops=/dev/sda:1000 nginx
docker run -d --device-write-iops=/dev/sda:1000 nginx
```

---

## 5. Giới hạn số Process (PIDs)

```bash
# Giới hạn tối đa 100 processes
docker run -d --pids-limit=100 nginx
```

Ngăn chặn **fork bomb** (process tạo vô hạn child processes).

---

## 6. Update Resource Limits

Thay đổi limits mà không cần restart:

```bash
# Update memory
docker update --memory=1g my-container

# Update CPU
docker update --cpus=2 my-container

# Update cả 2
docker update --memory=1g --cpus=2 my-container

# Update restart policy
docker update --restart unless-stopped my-container
```

---

## 7. Monitoring Resources

### Docker Stats

```bash
# Realtime
docker stats

# Output:
# NAME     CPU %   MEM USAGE / LIMIT     MEM %   NET I/O          BLOCK I/O
# web      0.5%    45.2MiB / 512MiB      8.83%   1.2kB / 648B     0B / 4.1kB
# db       5.3%    256MiB / 1GiB         25.0%   5.1kB / 3.2kB    12MB / 45MB
# cache    0.1%    12MiB / 256MiB        4.69%   800B / 200B      0B / 0B
```

### Kiểm tra limits đã set

```bash
# Xem memory limit
docker inspect -f '{{.HostConfig.Memory}}' my-container
# 536870912 (bytes) = 512MB

# Xem CPU limit
docker inspect -f '{{.HostConfig.NanoCpus}}' my-container
# 1500000000 = 1.5 CPUs
```

---

## 8. Khuyến nghị cho từng loại service

| Service           | Memory    | CPU | Ghi chú              |
| ----------------- | --------- | --- | -------------------- |
| **Nginx**         | 128-256MB | 0.5 | Nhẹ, ít tài nguyên   |
| **Node.js API**   | 256-512MB | 1-2 | Tuỳ load             |
| **PostgreSQL**    | 512MB-2GB | 1-2 | Tuỳ dataset          |
| **Redis**         | 128-512MB | 0.5 | Chủ yếu dùng RAM     |
| **MongoDB**       | 1-4GB     | 1-2 | Cần nhiều RAM        |
| **Elasticsearch** | 2-8GB     | 2-4 | Rất "đói" tài nguyên |

---

## 9. Bài tập thực hành

```bash
# 1. Chạy container với memory limit
docker run -d --name limited-web --memory=128m -p 8080:80 nginx

# 2. Xem stats
docker stats limited-web --no-stream

# 3. Vào container, thử tạo file lớn (gần limit)
docker exec -it limited-web sh
dd if=/dev/zero of=/tmp/testfile bs=1M count=100
# → Có thể bị OOM kill
exit

# 4. Kiểm tra OOM
docker inspect -f '{{.State.OOMKilled}}' limited-web

# 5. Tăng memory
docker update --memory=512m limited-web

# 6. Dọn dẹp
docker rm -f limited-web
```

---

## Tổng kết

| Tài nguyên     | Flag                   | Ví dụ                             |
| -------------- | ---------------------- | --------------------------------- |
| **RAM (hard)** | `--memory` / `-m`      | `--memory=512m`                   |
| **RAM (soft)** | `--memory-reservation` | `--memory-reservation=256m`       |
| **Swap**       | `--memory-swap`        | `--memory-swap=1g`                |
| **CPU (hard)** | `--cpus`               | `--cpus=1.5`                      |
| **CPU (soft)** | `--cpu-shares`         | `--cpu-shares=512`                |
| **CPU set**    | `--cpuset-cpus`        | `--cpuset-cpus="0,1"`             |
| **PIDs**       | `--pids-limit`         | `--pids-limit=100`                |
| **Disk I/O**   | `--device-read-bps`    | `--device-read-bps=/dev/sda:10mb` |
