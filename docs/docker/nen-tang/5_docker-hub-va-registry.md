---
sidebar_position: 5
title: "5. Docker Hub va Registry"
---

# Docker Hub và Registry

Docker Hub là nơi bạn tìm, tải và chia sẻ Docker Image. Bài này hướng dẫn cách sử dụng Docker Hub hiệu quả và hiểu hệ thống Registry.

---

## 1. Docker Hub là gì?

**Docker Hub** (hub.docker.com) là registry công khai lớn nhất thế giới, tương tự:
- **npm** cho Node.js packages
- **PyPI** cho Python packages
- **GitHub** cho source code

Docker Hub chứa hàng triệu image, chia thành:

| Loại | Ví dụ | Đặc điểm |
|------|-------|-----------|
| **Official Images** | `nginx`, `node`, `postgres` | Docker Inc. kiểm duyệt, đáng tin cậy |
| **Verified Publisher** | `bitnami/nginx` | Nhà cung cấp xác minh |
| **Community** | `username/my-app` | Người dùng tự đăng |

---

## 2. Tìm và chọn Image

### Tìm trên Docker Hub

```bash
# Tìm kiếm bằng CLI
docker search node

# Output:
# NAME                 DESCRIPTION                  STARS   OFFICIAL
# node                 Node.js JavaScript runtime   13000   [OK]
# bitnami/node         Bitnami Node.js image        200
# ...
```

### Tiêu chí chọn Image tốt

1. **Official Image** (có nhãn "Official"): Ưu tiên số 1
2. **Số stars** cao: Cộng đồng tin tưởng
3. **Cập nhật gần đây**: Image còn được maintain
4. **Có documentation** rõ ràng

### Image Tags (Phiên bản)

Mỗi image có nhiều **tags** (phiên bản):

```bash
# Xem tags trên Docker Hub hoặc dùng CLI
docker pull node:20          # Node.js 20 (LTS)
docker pull node:20-alpine   # Node.js 20 Alpine (nhẹ)
docker pull node:20-slim     # Node.js 20 Slim (vừa)
docker pull node:latest      # Luôn là version mới nhất
```

### Hiểu các biến thể Image

| Tag suffix | Base OS | Dung lượng | Khi nào dùng |
|-----------|---------|-----------|-------------|
| (không có) | Debian | ~300-900MB | Cần đầy đủ tools |
| `-slim` | Debian (minimal) | ~150-200MB | Cần gọn hơn |
| `-alpine` | Alpine Linux | ~50-100MB | Production, CI/CD |
| `-bookworm` | Debian 12 | ~300-900MB | Cần Debian cụ thể |

```bash
# So sánh dung lượng
docker pull node:20           # ~350MB
docker pull node:20-slim      # ~200MB
docker pull node:20-alpine    # ~130MB
```

**Khuyến nghị**: Dùng **alpine** cho production (nhẹ, ít lỗ hổng bảo mật). Dùng bản **đầy đủ** khi cần compile native modules.

---

## 3. Official Images thường dùng

### Web Server & Proxy

```bash
docker pull nginx:alpine       # Web server / Reverse proxy
docker pull httpd:alpine       # Apache HTTP server
docker pull traefik:latest     # Reverse proxy cho microservices
```

### Ngôn ngữ lập trình

```bash
docker pull node:20-alpine     # Node.js
docker pull python:3.12-slim   # Python
docker pull openjdk:21-slim    # Java
docker pull golang:1.22-alpine # Go
```

### Database

```bash
docker pull postgres:16-alpine  # PostgreSQL
docker pull mysql:8             # MySQL
docker pull mongo:7             # MongoDB
docker pull redis:7-alpine      # Redis
```

### Công cụ khác

```bash
docker pull ubuntu:24.04        # Ubuntu OS
docker pull alpine:3.19         # Alpine Linux (siêu nhẹ, ~5MB)
docker pull busybox             # Shell utilities (~1MB)
```

---

## 4. Tạo tài khoản và đẩy Image

### Đăng ký Docker Hub

1. Truy cập [hub.docker.com](https://hub.docker.com)
2. Đăng ký tài khoản (miễn phí)

### Đăng nhập từ CLI

```bash
docker login

# Nhập username và password
# Login Succeeded
```

### Đẩy (Push) image lên Docker Hub

```bash
# Bước 1: Build image
docker build -t my-app .

# Bước 2: Gắn tag theo format username/image:tag
docker tag my-app yourusername/my-app:v1.0
docker tag my-app yourusername/my-app:latest

# Bước 3: Push
docker push yourusername/my-app:v1.0
docker push yourusername/my-app:latest
```

### Kéo (Pull) image

```bash
# Người khác có thể pull image của bạn
docker pull yourusername/my-app:v1.0
```

---

## 5. Private Registry

### Khi nào cần Private Registry?

- Code công ty không muốn public
- Cần kiểm soát truy cập
- Cần tốc độ pull nhanh hơn (cùng mạng nội bộ)

### Docker Hub Private Repos

Docker Hub miễn phí cho phép **1 private repository**. Trả phí để có thêm.

### GitHub Container Registry (ghcr.io)

```bash
# Login bằng GitHub token
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Tag image
docker tag my-app ghcr.io/username/my-app:v1.0

# Push
docker push ghcr.io/username/my-app:v1.0

# Pull
docker pull ghcr.io/username/my-app:v1.0
```

### Các Private Registry khác

| Registry | Cloud | Ghi chú |
|----------|-------|---------|
| **Amazon ECR** | AWS | Tích hợp ECS, EKS |
| **Google Artifact Registry** | GCP | Tích hợp GKE |
| **Azure Container Registry** | Azure | Tích hợp AKS |
| **Harbor** | Self-hosted | Mã nguồn mở |

---

## 6. Image Naming Convention

### Cấu trúc tên đầy đủ

```
[registry]/[namespace]/[repository]:[tag]
```

| Phần | Ví dụ | Mặc định |
|------|-------|----------|
| `registry` | `ghcr.io`, `ecr.aws` | `docker.io` (Docker Hub) |
| `namespace` | `library`, `username` | `library` (official images) |
| `repository` | `nginx`, `my-app` | (bắt buộc) |
| `tag` | `latest`, `v1.0`, `alpine` | `latest` |

### Ví dụ

```bash
# Đầy đủ
docker.io/library/nginx:latest

# Viết tắt (Docker Hub official)
nginx:latest
nginx           # tag mặc định là "latest"

# User image trên Docker Hub
username/my-app:v1.0

# GitHub Container Registry
ghcr.io/username/my-app:v1.0
```

---

## 7. Best Practices

### Chọn Image

1. **Luôn dùng tag cụ thể**, tránh `latest`:
   ```bash
   # Tốt — version rõ ràng, reproducible
   FROM node:20-alpine

   # Tránh — "latest" thay đổi liên tục, build có thể khác nhau
   FROM node:latest
   ```

2. **Ưu tiên official images**
3. **Dùng alpine khi có thể** (nhẹ, ít CVE)

### Quản lý Image

```bash
# Định kỳ dọn dẹp images cũ
docker image prune -a

# Kiểm tra dung lượng
docker system df
```

### Bảo mật

- Không push image chứa secrets (API keys, passwords)
- Scan image trước khi deploy:
  ```bash
  docker scout quickview nginx:alpine
  ```
- Cập nhật base image thường xuyên

---

## Tổng kết

| Khái niệm | Mô tả |
|-----------|--------|
| **Docker Hub** | Registry công khai mặc định |
| **Official Image** | Image được Docker Inc. kiểm duyệt |
| **Tag** | Phiên bản của image (`node:20-alpine`) |
| **Alpine** | Bản Linux siêu nhẹ, ưu tiên cho production |
| **Private Registry** | Kho image riêng (ghcr.io, ECR, ACR...) |
| **docker pull** | Tải image về |
| **docker push** | Đẩy image lên registry |
