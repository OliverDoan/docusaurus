---
sidebar_position: 4
title: "4. Logs va Debug Container"
---

# Logs và Debug Container

Khi container gặp vấn đề, bạn cần biết cách xem logs và debug. Bài này dạy bạn các kỹ thuật troubleshooting container.

---


---

## Mục lục

- [1. Docker Logs](#1-docker-logs)
- [2. Debug Container không chạy được](#2-debug-container-không-chạy-được)
- [3. Exec — Debug container đang chạy](#3-exec-debug-container-đang-chạy)
- [4. Docker Events](#4-docker-events)
- [5. Resource Monitoring](#5-resource-monitoring)
- [6. Healthcheck Debugging](#6-healthcheck-debugging)
- [7. Troubleshooting Checklist](#7-troubleshooting-checklist)
- [Tổng kết](#tổng-kết)

---

## 1. Docker Logs

### Xem logs cơ bản

```bash
# Xem toàn bộ logs
docker logs my-container

# Follow logs (realtime)
docker logs -f my-container

# Xem N dòng cuối
docker logs --tail 100 my-container

# Logs với timestamp
docker logs -t my-container

# Logs từ thời điểm cụ thể
docker logs --since 2024-01-15T10:00:00 my-container

# Logs trong 30 phút gần nhất
docker logs --since 30m my-container

# Logs từ 1 giờ trước đến 30 phút trước
docker logs --since 1h --until 30m my-container
```

### Kết hợp các options

```bash
# Follow + Tail + Timestamp
docker logs -f --tail 50 -t my-container

# Lọc logs với grep
docker logs my-container 2>&1 | grep "ERROR"
docker logs my-container 2>&1 | grep -i "warning"
```

### stdout vs stderr

Docker logs thu thập cả **stdout** và **stderr**:

```bash
# Chỉ stdout
docker logs my-container 2>/dev/null

# Chỉ stderr
docker logs my-container 1>/dev/null
```

---

## 2. Debug Container không chạy được

### Container exit ngay sau khi start

```bash
# Xem exit code
docker ps -a --filter "name=my-container"
# STATUS: Exited (1) 5 minutes ago

# Xem logs để tìm lỗi
docker logs my-container

# Xem chi tiết exit code
docker inspect -f '{{.State.ExitCode}}' my-container
docker inspect -f '{{.State.Error}}' my-container
```

### Exit codes phổ biến

| Exit Code | Ý nghĩa | Nguyên nhân thường gặp |
|----------|---------|----------------------|
| 0 | Thành công | Container chạy xong task |
| 1 | Lỗi ứng dụng | Code lỗi, missing config |
| 126 | Permission denied | Không có quyền thực thi |
| 127 | Command not found | Lệnh CMD/ENTRYPOINT sai |
| 137 | Killed (SIGKILL) | Out of Memory (OOM) |
| 139 | Segfault (SIGSEGV) | Lỗi memory ứng dụng |
| 143 | Terminated (SIGTERM) | Docker stop (graceful) |

### Chạy container với shell để debug

```bash
# Override CMD để vào shell
docker run -it --rm my-app sh

# Bên trong container:
ls /app/               # Kiểm tra file có đủ không
cat /app/package.json  # Kiểm tra config
node -v                # Kiểm tra runtime
npm start              # Chạy thủ công để xem lỗi
```

### Debug container đã exit

```bash
# Tạo image từ container đã exit
docker commit exited-container debug-image

# Chạy debug image với shell
docker run -it --rm debug-image sh
```

---

## 3. Exec — Debug container đang chạy

```bash
# Mở shell
docker exec -it my-container sh

# Kiểm tra processes
docker exec my-container ps aux

# Kiểm tra network
docker exec my-container ping google.com
docker exec my-container curl http://localhost:3000/health
docker exec my-container netstat -tlnp

# Kiểm tra filesystem
docker exec my-container df -h
docker exec my-container ls -la /app

# Kiểm tra environment
docker exec my-container env
docker exec my-container printenv DATABASE_URL

# Kiểm tra DNS
docker exec my-container nslookup db
docker exec my-container cat /etc/resolv.conf
```

---

## 4. Docker Events

Docker events cho bạn theo dõi mọi sự kiện xảy ra:

```bash
# Theo dõi events realtime
docker events

# Lọc events theo container
docker events --filter container=my-container

# Lọc events theo loại
docker events --filter type=container
docker events --filter event=start
docker events --filter event=die

# Events trong khoảng thời gian
docker events --since 1h --until 30m
```

### Output mẫu

```
2024-01-15T10:30:00 container start abc123 (image=nginx, name=web)
2024-01-15T10:30:05 container health_status abc123 (health_status=healthy)
2024-01-15T10:35:00 container die abc123 (exitCode=137)
```

---

## 5. Resource Monitoring

### Docker Stats

```bash
# Realtime stats
docker stats

# Snapshot (không follow)
docker stats --no-stream

# Stats 1 container
docker stats my-container

# Format
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### Output giải thích

```
CONTAINER   CPU %   MEM USAGE / LIMIT   MEM %   NET I/O        BLOCK I/O
web         0.5%    45MiB / 7.77GiB     0.56%   1.2kB / 648B   0B / 4.1kB
db          2.3%    256MiB / 512MiB     50%     5.1kB / 3.2kB  12MB / 45MB
```

| Cột | Ý nghĩa |
|-----|---------|
| CPU % | Phần trăm CPU đang dùng |
| MEM USAGE/LIMIT | RAM đang dùng / Giới hạn |
| MEM % | Phần trăm RAM |
| NET I/O | Network input / output |
| BLOCK I/O | Disk read / write |

### Phát hiện OOM (Out of Memory)

```bash
# Container bị kill do OOM có exit code 137
docker inspect -f '{{.State.OOMKilled}}' my-container
# true → Bị OOM kill

# Giải pháp: Tăng memory limit
docker update --memory=1g my-container
```

---

## 6. Healthcheck Debugging

```bash
# Xem health status
docker ps
# STATUS: Up 5 min (healthy)
# STATUS: Up 3 min (unhealthy)

# Xem chi tiết health check
docker inspect -f '{{json .State.Health}}' my-container | python3 -m json.tool

# Output:
# {
#   "Status": "unhealthy",
#   "FailingStreak": 3,
#   "Log": [
#     {
#       "Start": "2024-01-15T10:00:00Z",
#       "End": "2024-01-15T10:00:03Z",
#       "ExitCode": 1,
#       "Output": "curl: (7) Failed to connect"
#     }
#   ]
# }
```

---

## 7. Troubleshooting Checklist

Khi container có vấn đề, kiểm tra theo thứ tự:

### 1. Container không start được

```bash
# Bước 1: Xem logs
docker logs my-container

# Bước 2: Xem exit code
docker inspect -f '{{.State.ExitCode}}' my-container

# Bước 3: Chạy với shell để debug
docker run -it --rm my-image sh

# Bước 4: Kiểm tra file và permissions
docker run -it --rm my-image ls -la /app
```

### 2. Container chạy nhưng không truy cập được

```bash
# Bước 1: Kiểm tra port mapping
docker port my-container

# Bước 2: Kiểm tra app có listen đúng port
docker exec my-container netstat -tlnp

# Bước 3: Kiểm tra app có listen 0.0.0.0 (không phải 127.0.0.1)
docker exec my-container curl http://localhost:3000

# Bước 4: Kiểm tra firewall/network
docker exec my-container ping google.com
```

### 3. Container bị chậm

```bash
# Bước 1: Xem resource usage
docker stats my-container --no-stream

# Bước 2: Kiểm tra OOM
docker inspect -f '{{.State.OOMKilled}}' my-container

# Bước 3: Xem processes
docker top my-container

# Bước 4: Tăng resource limits
docker update --memory=2g --cpus=2 my-container
```

### 4. Container restart liên tục

```bash
# Bước 1: Xem restart count
docker inspect -f '{{.RestartCount}}' my-container

# Bước 2: Xem logs trước mỗi lần restart
docker logs --tail 50 my-container

# Bước 3: Tạm tắt auto-restart để debug
docker update --restart no my-container
```

---

## Tổng kết

| Công cụ | Dùng khi |
|---------|---------|
| `docker logs` | Xem output của ứng dụng |
| `docker exec` | Chạy lệnh trong container đang chạy |
| `docker inspect` | Xem chi tiết cấu hình container |
| `docker stats` | Monitor CPU/RAM/Network |
| `docker events` | Theo dõi sự kiện Docker |
| `docker top` | Xem processes trong container |
| `docker diff` | Xem file đã thay đổi |
| Exit code 137 | OOM Kill → Tăng memory |
| Exit code 127 | Command not found → Kiểm tra CMD |
