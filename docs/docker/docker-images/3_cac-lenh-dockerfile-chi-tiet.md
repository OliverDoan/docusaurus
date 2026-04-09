---
sidebar_position: 3
title: "Cac lenh Dockerfile chi tiet"
---

# Các lệnh Dockerfile chi tiết

Bài trước đã giới thiệu các lệnh cơ bản. Bài này đi sâu vào tất cả các lệnh Dockerfile và cách sử dụng nâng cao.

---

## 1. ENTRYPOINT vs CMD

Đây là câu hỏi phổ biến nhất: **ENTRYPOINT và CMD khác gì nhau?**

### CMD — Lệnh mặc định (có thể ghi đè)

```dockerfile
FROM node:20-alpine
CMD ["node", "server.js"]
```

```bash
# Chạy mặc định
docker run my-app
# → Thực thi: node server.js

# GHI ĐÈ CMD
docker run my-app node test.js
# → Thực thi: node test.js (CMD bị thay thế)
```

### ENTRYPOINT — Lệnh cố định (không bị ghi đè)

```dockerfile
FROM node:20-alpine
ENTRYPOINT ["node"]
```

```bash
# Phải truyền argument
docker run my-app server.js
# → Thực thi: node server.js

docker run my-app test.js
# → Thực thi: node test.js
```

### Kết hợp ENTRYPOINT + CMD

```dockerfile
FROM node:20-alpine
ENTRYPOINT ["node"]
CMD ["server.js"]
```

```bash
# Chạy mặc định
docker run my-app
# → Thực thi: node server.js

# Ghi đè CMD (phần argument)
docker run my-app test.js
# → Thực thi: node test.js

# ENTRYPOINT vẫn giữ nguyên "node"
```

### Khi nào dùng gì?

| Tình huống | Dùng |
|-----------|------|
| Ứng dụng thông thường | `CMD` |
| CLI tool (luôn chạy 1 binary) | `ENTRYPOINT` |
| Binary + arguments thay đổi | `ENTRYPOINT + CMD` |

### Dạng exec vs shell

```dockerfile
# Dạng exec (khuyến nghị) — Chạy trực tiếp, nhận signals đúng
CMD ["node", "server.js"]
ENTRYPOINT ["node", "server.js"]

# Dạng shell — Chạy qua /bin/sh -c, signals có thể bị mất
CMD node server.js
ENTRYPOINT node server.js
```

---

## 2. ARG — Build-time variables

**ARG** là biến chỉ tồn tại trong quá trình build (không có trong container):

```dockerfile
# Khai báo ARG
ARG NODE_VERSION=20

# Sử dụng trong FROM
FROM node:${NODE_VERSION}-alpine

ARG APP_ENV=production

# Sử dụng trong RUN
RUN echo "Building for ${APP_ENV}"

# ARG không tồn tại khi container chạy!
CMD ["node", "server.js"]
```

```bash
# Override ARG khi build
docker build --build-arg NODE_VERSION=18 -t my-app .
docker build --build-arg APP_ENV=staging -t my-app .
```

### ARG vs ENV

| | ARG | ENV |
|---|---|---|
| **Có khi build** | Co | Co |
| **Có khi chạy container** | Khong | Co |
| **Override cách nào** | `--build-arg` | `-e` hoặc `--env` |
| **Use case** | Version, build config | Runtime config |

---

## 3. LABEL — Metadata

**LABEL** thêm metadata vào image:

```dockerfile
LABEL maintainer="email@example.com"
LABEL version="1.0"
LABEL description="My Node.js application"

# Hoặc gộp thành 1 lệnh
LABEL maintainer="email@example.com" \
      version="1.0" \
      description="My Node.js application"
```

```bash
# Xem labels
docker inspect --format='{{json .Config.Labels}}' my-app
```

---

## 4. HEALTHCHECK — Kiểm tra sức khoẻ

**HEALTHCHECK** cho Docker biết cách kiểm tra container có khoẻ không:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .

# Kiểm tra mỗi 30 giây
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
```

### Các tham số

| Tham số | Mặc định | Ý nghĩa |
|---------|----------|---------|
| `--interval` | 30s | Kiểm tra mỗi bao lâu |
| `--timeout` | 30s | Timeout cho mỗi lần check |
| `--start-period` | 0s | Thời gian chờ trước khi bắt đầu check |
| `--retries` | 3 | Số lần fail trước khi đánh dấu "unhealthy" |

### Trạng thái health

```bash
docker ps
# CONTAINER ID   IMAGE    STATUS
# abc123         my-app   Up 5 min (healthy)     ← Khoẻ
# def456         my-app   Up 3 min (unhealthy)   ← Có vấn đề
# ghi789         my-app   Up 1 min (health: starting) ← Đang check
```

---

## 5. VOLUME — Khai báo mount point

**VOLUME** khai báo thư mục cần persist data:

```dockerfile
FROM postgres:16

# Khai báo thư mục data cần lưu trữ
VOLUME /var/lib/postgresql/data
```

```bash
# Docker tự tạo anonymous volume cho thư mục này
docker run -d postgres:16

# Hoặc bạn chỉ định volume cụ thể
docker run -d -v pgdata:/var/lib/postgresql/data postgres:16
```

---

## 6. USER — Chạy với user không phải root

Mặc định container chạy với `root`. Nên chuyển sang user khác vì lý do bảo mật:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Tạo user và group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --chown=appuser:appgroup . .
RUN npm ci --only=production

# Chuyển sang user không phải root
USER appuser

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 7. SHELL — Thay đổi shell mặc định

```dockerfile
# Mặc định trên Linux: /bin/sh -c
# Mặc định trên Windows: cmd /S /C

# Thay đổi sang bash
SHELL ["/bin/bash", "-c"]

RUN echo "Đang dùng bash"
```

---

## 8. STOPSIGNAL — Signal khi dừng container

```dockerfile
# Mặc định: SIGTERM
STOPSIGNAL SIGTERM

# Dùng SIGQUIT cho Nginx graceful shutdown
STOPSIGNAL SIGQUIT
```

---

## 9. Ví dụ Dockerfile hoàn chỉnh

### Node.js Production

```dockerfile
# ====== Build Arguments ======
ARG NODE_VERSION=20

# ====== Base Image ======
FROM node:${NODE_VERSION}-alpine

# ====== Metadata ======
LABEL maintainer="dev@example.com"
LABEL version="1.0"

# ====== Setup ======
WORKDIR /app

# Tạo non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# ====== Dependencies ======
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ====== Application Code ======
COPY --chown=appuser:appgroup . .

# ====== Environment ======
ENV NODE_ENV=production
ENV PORT=3000

# ====== Health Check ======
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# ====== Security ======
USER appuser

# ====== Runtime ======
EXPOSE 3000
CMD ["node", "server.js"]
```

### Python FastAPI Production

```dockerfile
ARG PYTHON_VERSION=3.12

FROM python:${PYTHON_VERSION}-slim

LABEL maintainer="dev@example.com"

WORKDIR /app

# System dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code
COPY . .

# Non-root user
RUN useradd --create-home --shell /bin/bash appuser
USER appuser

ENV PYTHONUNBUFFERED=1

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 10. Tổng kết tất cả lệnh Dockerfile

| Lệnh | Chức năng | Ghi chú |
|-------|-----------|---------|
| `FROM` | Image cơ sở | Bắt buộc, dòng đầu tiên |
| `WORKDIR` | Thư mục làm việc | Tạo nếu chưa có |
| `COPY` | Copy file vào image | Dùng thường xuyên nhất |
| `ADD` | COPY + giải nén + URL | Ưu tiên COPY |
| `RUN` | Chạy lệnh khi build | Mỗi RUN = 1 layer |
| `CMD` | Lệnh mặc định khi chạy | Ghi đè được |
| `ENTRYPOINT` | Lệnh cố định khi chạy | Không ghi đè được |
| `ENV` | Biến môi trường | Tồn tại khi chạy container |
| `ARG` | Biến build-time | Chỉ tồn tại khi build |
| `EXPOSE` | Khai báo port | Chỉ là documentation |
| `VOLUME` | Khai báo mount point | Cho persistent data |
| `USER` | Chuyển user | Nên dùng non-root |
| `HEALTHCHECK` | Kiểm tra sức khoẻ | Khuyến nghị cho production |
| `LABEL` | Metadata | Version, maintainer |
| `SHELL` | Thay đổi shell | Hiếm khi dùng |
| `STOPSIGNAL` | Signal dừng | Mặc định SIGTERM |
