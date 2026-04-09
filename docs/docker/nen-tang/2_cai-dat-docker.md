---
sidebar_position: 2
title: "Cai dat Docker"
---

# Cài đặt Docker

Bài này hướng dẫn cài đặt Docker trên cả 3 hệ điều hành: **macOS**, **Windows** và **Linux (Ubuntu)**. Sau khi cài xong, bạn sẽ chạy container đầu tiên.

---

## 1. Docker Desktop vs Docker Engine

Trước khi cài, cần hiểu 2 phiên bản:

| | Docker Desktop | Docker Engine |
|---|---|---|
| **Dành cho** | macOS, Windows | Linux |
| **Giao diện** | Có GUI (giao diện đồ họa) | Chỉ có CLI (dòng lệnh) |
| **Bao gồm** | Docker Engine + Docker Compose + GUI | Chỉ Docker Engine |
| **Phù hợp** | Developer cá nhân | Server production |

**Khuyến nghị**: Nếu dùng macOS hoặc Windows → cài **Docker Desktop**. Nếu dùng Linux → cài **Docker Engine**.

---

## 2. Cài trên macOS

### Yêu cầu hệ thống
- macOS 12 (Monterey) trở lên
- Chip Apple Silicon (M1/M2/M3) hoặc Intel
- Ít nhất 4GB RAM

### Bước 1: Tải Docker Desktop

Truy cập [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) và tải bản cho macOS.

Hoặc cài bằng Homebrew (khuyến nghị):

```bash
brew install --cask docker
```

### Bước 2: Mở Docker Desktop

```bash
# Mở Docker Desktop
open /Applications/Docker.app
```

Lần đầu mở sẽ cần:
- Cấp quyền hệ thống (nhập password)
- Đợi Docker Engine khởi động (icon trên menu bar chuyển sang xanh)

### Bước 3: Xác minh cài đặt

```bash
docker --version
# Docker version 27.x.x, build xxxxxxx

docker compose version
# Docker Compose version v2.x.x
```

---

## 3. Cài trên Windows

### Yêu cầu hệ thống
- Windows 10/11 (64-bit)
- WSL 2 (Windows Subsystem for Linux) đã bật
- Ít nhất 4GB RAM

### Bước 1: Bật WSL 2

Mở **PowerShell** với quyền Admin:

```powershell
# Bật WSL
wsl --install

# Khởi động lại máy
# Sau khi restart, WSL 2 sẽ được cài tự động
```

### Bước 2: Tải Docker Desktop

Truy cập [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) và tải bản cho Windows.

### Bước 3: Cài đặt

- Chạy file `.exe` đã tải
- Chọn **Use WSL 2 instead of Hyper-V** (khuyến nghị)
- Hoàn tất cài đặt và khởi động lại máy

### Bước 4: Xác minh

Mở **Command Prompt** hoặc **PowerShell**:

```bash
docker --version
docker compose version
```

---

## 4. Cài trên Ubuntu/Debian Linux

### Bước 1: Gỡ phiên bản cũ (nếu có)

```bash
sudo apt-get remove docker docker-engine docker.io containerd runc
```

### Bước 2: Cài đặt dependencies

```bash
sudo apt-get update
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

### Bước 3: Thêm Docker GPG key

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

### Bước 4: Thêm Docker repository

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### Bước 5: Cài Docker Engine

```bash
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Bước 6: Chạy Docker không cần sudo

```bash
# Thêm user hiện tại vào group docker
sudo usermod -aG docker $USER

# Đăng xuất và đăng nhập lại, hoặc chạy:
newgrp docker
```

### Bước 7: Xác minh

```bash
docker --version
docker compose version
```

---

## 5. Chạy Container đầu tiên

Sau khi cài xong, hãy chạy thử:

```bash
docker run hello-world
```

Kết quả sẽ hiện ra:

```
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
...
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

### Chuyện gì vừa xảy ra?

```
1. docker run hello-world
   ↓
2. Docker tìm image "hello-world" trên máy → Không có
   ↓
3. Docker tải (pull) image từ Docker Hub
   ↓
4. Docker tạo container từ image
   ↓
5. Container chạy, in ra message
   ↓
6. Container dừng lại (vì đã in xong)
```

---

## 6. Chạy thử một web server

Hãy chạy một web server Nginx trong container:

```bash
# Chạy Nginx container
# -d: chạy nền (detach)
# -p 8080:80: map port 8080 máy host → port 80 trong container
# --name: đặt tên cho container
docker run -d -p 8080:80 --name my-nginx nginx
```

Mở trình duyệt, truy cập `http://localhost:8080` — bạn sẽ thấy trang Welcome của Nginx.

### Dọn dẹp

```bash
# Dừng container
docker stop my-nginx

# Xoá container
docker rm my-nginx
```

---

## 7. Cấu hình Docker Desktop (tuỳ chọn)

Vào **Docker Desktop → Settings** để tuỳ chỉnh:

### Resources (Tài nguyên)

| Cấu hình | Khuyến nghị |
|----------|------------|
| **CPUs** | 50% số core (VD: 4 core → để 2) |
| **Memory** | 4GB cho dev thông thường, 8GB nếu chạy nhiều service |
| **Disk** | 60GB trở lên |

### General

- **Start Docker Desktop when you sign in**: Bật nếu dùng Docker thường xuyên
- **Use Docker Compose V2**: Nên bật (mặc định đã bật)

---

## 8. Xác minh hoàn chỉnh

Chạy các lệnh sau để đảm bảo mọi thứ hoạt động:

```bash
# Kiểm tra Docker version
docker --version

# Kiểm tra Docker Compose
docker compose version

# Kiểm tra Docker Engine
docker info

# Chạy container test
docker run hello-world

# Xem container đang chạy
docker ps

# Xem tất cả container (bao gồm đã dừng)
docker ps -a

# Xem images đã tải về
docker images
```

---

## 9. Xử lý lỗi thường gặp

### macOS: "Docker Desktop is not running"

```bash
# Mở Docker Desktop
open /Applications/Docker.app
# Đợi icon trên menu bar chuyển xanh
```

### Linux: "permission denied"

```bash
# Thêm user vào group docker
sudo usermod -aG docker $USER
# Đăng xuất và đăng nhập lại
```

### Windows: "WSL 2 is not installed"

```powershell
# Mở PowerShell Admin
wsl --install
# Khởi động lại máy
```

### Chung: "Cannot connect to Docker daemon"

```bash
# Kiểm tra Docker service
sudo systemctl status docker

# Khởi động lại Docker
sudo systemctl restart docker
```

---

## Tổng kết

| Hệ điều hành | Cách cài | Ghi chú |
|-------------|---------|---------|
| **macOS** | `brew install --cask docker` | Hoặc tải từ web |
| **Windows** | Tải Docker Desktop + WSL 2 | Cần bật WSL 2 trước |
| **Ubuntu** | `apt-get install docker-ce` | Thêm user vào group docker |

Bạn đã có Docker trên máy. Bài tiếp theo sẽ tìm hiểu **kiến trúc Docker** hoạt động như thế nào.
