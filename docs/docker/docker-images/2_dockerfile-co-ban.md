---
sidebar_position: 2
title: "2. Dockerfile cơ bản"
---

# Dockerfile cơ bản

**Dockerfile** là file text chứa các bước hướng dẫn Docker cách build một Image. Đây là kỹ năng quan trọng nhất khi làm việc với Docker.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Dockerfile là file text khai báo từng bước dựng image** — tái tạo được, lưu trong git (Infrastructure as Code), thay cho `docker commit` thủ công.
- ⭐ **Nhớ 4 lệnh cốt lõi**: `FROM` (image cơ sở), `COPY` (đưa file vào), `RUN` (cài đặt khi build), `CMD` (lệnh chạy khi container khởi động).
- **Mỗi lệnh tạo 1 layer được cache** — copy `package*.json` và cài dependency trước, `COPY . .` sau để đổi code không phải cài lại.
- **`COPY` ưu tiên hơn `ADD`** — chỉ dùng `ADD` khi cần tự giải nén tar; `EXPOSE` chỉ là documentation, vẫn cần `-p` khi run.
- **Dùng `.dockerignore`** — loại `node_modules`, `.git`, `.env`... để giảm build context, build nhanh và tránh lộ secret.

:::

---

## Mục lục

- [Vì sao cần Dockerfile?](#vì-sao-cần-dockerfile)
- [1. Dockerfile là gì?](#1-dockerfile-là-gì)
- [2. Các lệnh Dockerfile cơ bản](#2-các-lệnh-dockerfile-cơ-bản)
- [3. Ví dụ thực tế](#3-ví-dụ-thực-tế)
- [4. .dockerignore](#4-dockerignore)
- [5. Build Context](#5-build-context)
- [6. Bài tập thực hành](#6-bài-tập-thực-hành)
- [Tổng kết](#tổng-kết)

---

## Vì sao cần Dockerfile?

**Vấn đề:** Cách "thủ công" để tạo Image là: chạy một container trống, gõ từng lệnh cài đặt bên trong (cài package, copy code, sửa config), rồi dùng `docker commit` để đóng gói thành Image. Cách này có nhiều điểm yếu:

- **Không lặp lại được**: mỗi lần làm lại phải gõ tay từ đầu, dễ sai sót, mỗi người làm một kiểu.
- **Không ai biết Image gồm gì**: các bước cài đặt nằm trong đầu người làm, không được ghi lại.
- **Không có version trong git**: không thể review, không thể quay lại bản cũ.
- **Khó tái tạo**: máy khác, đồng nghiệp khác hay CI không dựng lại được Image y hệt.

**Giải pháp:** Dùng **Dockerfile** — một file **văn bản** khai báo rõ ràng từng bước dựng Image:

```dockerfile
FROM node:20-alpine        # Bắt đầu từ image cơ sở
WORKDIR /app               # Thư mục làm việc
COPY package*.json ./      # Copy file config
RUN npm ci                 # Cài dependencies
COPY . .                   # Copy code
CMD ["npm", "start"]       # Lệnh chạy khi container khởi động
```

Image build từ Dockerfile **có thể tái tạo y hệt**, lưu được trong git (Infrastructure as Code), và mỗi lệnh tạo ra một **layer** được cache để build lại nhanh hơn.

:::tip[Dùng thực tế]

- Định nghĩa Image cho ứng dụng bằng Dockerfile thay vì gõ lệnh thủ công trong container.
- Commit Dockerfile cùng source code để cả team review và quay lại bản cũ khi cần.
- Tận dụng layer cache: chỉ thay đổi nhỏ thì các layer cũ được dùng lại, build nhanh hơn nhiều.
- Chuẩn hoá môi trường giống nhau cho mọi máy dev, staging và CI/CD.

:::

---

## 1. Dockerfile là gì?

Dockerfile giống như một **công thức nấu ăn**:

```
Công thức nấu ăn:              Dockerfile:
1. Lấy nồi (dụng cụ)         FROM node:18-alpine (base image)
2. Cho gạo vào (nguyên liệu)  COPY package.json . (file config)
3. Thêm nước (chuẩn bị)       RUN npm install (cài dependency)
4. Cho thức ăn vào             COPY . . (code)
5. Bật bếp, nấu               CMD ["npm", "start"] (lệnh chạy)
```

### File Dockerfile đầu tiên

Tạo file tên `Dockerfile` (không có extension) trong thư mục project:

```dockerfile
# Bắt đầu từ image Node.js 18 Alpine
FROM node:18-alpine

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy file package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ code vào container
COPY . .

# Khai báo port ứng dụng sử dụng
EXPOSE 3000

# Lệnh chạy khi container khởi động
CMD ["npm", "start"]
```

### Build Image từ Dockerfile

```bash
# Cú pháp: docker build -t <tên_image>:<tag> <đường_dẫn>
docker build -t my-app:v1.0 .

# Dấu "." ở cuối = thư mục hiện tại (chứa Dockerfile)
```

### Chạy container từ Image vừa build

```bash
docker run -d -p 3000:3000 --name my-app my-app:v1.0
```

---

## 2. Các lệnh Dockerfile cơ bản

### FROM — Image cơ sở

Mọi Dockerfile BẮT BUỘC bắt đầu bằng `FROM`:

```dockerfile
# Sử dụng Node.js 18 Alpine
FROM node:18-alpine

# Sử dụng Python 3.12
FROM python:3.12-slim

# Sử dụng image trống (tối thiểu)
FROM scratch
```

### WORKDIR — Thư mục làm việc

Đặt thư mục làm việc cho các lệnh tiếp theo:

```dockerfile
WORKDIR /app

# Tương đương: cd /app (nhưng tạo thư mục nếu chưa có)
# Mọi lệnh sau sẽ chạy trong /app
```

### COPY — Copy file từ host vào image

```dockerfile
# Copy 1 file
COPY package.json .

# Copy nhiều file
COPY package.json package-lock.json ./

# Copy toàn bộ thư mục hiện tại
COPY . .

# Copy và đổi tên
COPY config.json /app/settings.json

# Copy với wildcard
COPY *.json ./
```

### ADD — Giống COPY nhưng có thêm tính năng

```dockerfile
# Giống COPY
ADD package.json .

# Tự giải nén file tar
ADD app.tar.gz /app/

# Tải file từ URL (không khuyến nghị)
ADD https://example.com/file.txt /app/
```

**Khuyến nghị**: Dùng `COPY` trừ khi cần giải nén tar. `COPY` rõ ràng và dễ hiểu hơn.

### RUN — Chạy lệnh khi build

```dockerfile
# Cài đặt packages
RUN npm install

# Chạy nhiều lệnh (dùng && để gộp thành 1 layer)
RUN apt-get update && \
    apt-get install -y curl wget && \
    rm -rf /var/lib/apt/lists/*

# Tạo thư mục
RUN mkdir -p /app/logs
```

### CMD — Lệnh chạy khi container khởi động

```dockerfile
# Dạng exec (khuyến nghị)
CMD ["node", "server.js"]
CMD ["npm", "start"]
CMD ["python", "app.py"]

# Dạng shell
CMD npm start
```

**Lưu ý**: Chỉ có **1 CMD** trong Dockerfile. Nếu viết nhiều CMD, chỉ CMD cuối cùng có hiệu lực.

### EXPOSE — Khai báo port

```dockerfile
# Khai báo container lắng nghe port 3000
EXPOSE 3000

# Khai báo nhiều ports
EXPOSE 3000 8080

# Lưu ý: EXPOSE chỉ là documentation
# Bạn vẫn cần -p khi docker run để map port
```

### ENV — Biến môi trường

```dockerfile
# Đặt biến môi trường
ENV NODE_ENV=production
ENV PORT=3000

# Sử dụng trong các lệnh tiếp theo
RUN echo $NODE_ENV
```

---

## 3. Ví dụ thực tế

### Node.js (Express)

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files trước (tận dụng cache)
COPY package*.json ./
RUN npm ci --only=production

# Copy code
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

### Python (FastAPI)

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Cài dependencies trước
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Static website (Nginx)

```dockerfile
FROM nginx:alpine

# Copy HTML/CSS/JS vào thư mục Nginx
COPY ./dist /usr/share/nginx/html

EXPOSE 80

# Nginx đã có CMD mặc định, không cần khai báo
```

### React (Build + Serve)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Cài serve để phục vụ file tĩnh
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
```

---

## 4. .dockerignore

Giống `.gitignore`, file `.dockerignore` loại trừ file/thư mục khỏi build context:

```
# .dockerignore
node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
Dockerfile
docker-compose.yml
README.md
.DS_Store
coverage
.nyc_output
dist
build
```

### Tại sao cần .dockerignore?

1. **Giảm dung lượng build context** → Build nhanh hơn
2. **Tránh copy `node_modules`** → Dùng `npm install` trong container
3. **Bảo mật** → Không copy `.env` chứa secrets vào image

---

## 5. Build Context

Khi chạy `docker build .`, Docker gửi toàn bộ thư mục (build context) tới Docker Daemon:

```bash
docker build -t my-app .
# Sending build context to Docker daemon  150MB   ← Build context

# Nếu có .dockerignore tốt:
# Sending build context to Docker daemon  2.5MB   ← Nhỏ hơn nhiều!
```

### Chỉ định Dockerfile khác

```bash
# Dùng Dockerfile ở đường dẫn khác
docker build -f docker/Dockerfile.prod -t my-app .

# Dùng Dockerfile với tên khác
docker build -f Dockerfile.dev -t my-app-dev .
```

---

## 6. Bài tập thực hành

Tạo một project đơn giản và Dockerize nó:

### Bước 1: Tạo ứng dụng Node.js

```bash
mkdir docker-practice && cd docker-practice
```

Tạo file `server.js`:

```javascript
const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end("<h1>Xin chào từ Docker!</h1><p>Container đang chạy.</p>");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server đang chạy tại port ${PORT}`);
});
```

Tạo file `package.json`:

```json
{
  "name": "docker-practice",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  }
}
```

### Bước 2: Tạo Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Bước 3: Tạo .dockerignore

```
node_modules
.git
.DS_Store
```

### Bước 4: Build và chạy

```bash
# Build
docker build -t docker-practice:v1 .

# Chạy
docker run -d -p 3000:3000 --name practice docker-practice:v1

# Mở http://localhost:3000

# Dọn dẹp
docker rm -f practice
```

---

## Tổng kết

| Lệnh Dockerfile | Chức năng                             |
| --------------- | ------------------------------------- |
| `FROM`          | Image cơ sở (bắt buộc, dòng đầu tiên) |
| `WORKDIR`       | Thư mục làm việc                      |
| `COPY`          | Copy file từ host vào image           |
| `RUN`           | Chạy lệnh khi build                   |
| `CMD`           | Lệnh chạy khi container khởi động     |
| `EXPOSE`        | Khai báo port (documentation)         |
| `ENV`           | Biến môi trường                       |
| `ADD`           | Giống COPY + giải nén tar             |

### Quy tắc nhớ

```
FROM   → Bắt đầu từ đâu?
COPY   → Copy gì vào?
RUN    → Cài gì?
CMD    → Chạy gì?
```
