---
sidebar_position: 1
title: "1. Docker la gi? Tai sao can Docker?"
---

# Docker là gì? Tại sao cần Docker?

Bạn đã bao giờ gặp tình huống này chưa:

- **"Trên máy tao chạy được mà?"** — Câu nói kinh điển khi deploy code lên server
- Cài Node.js version 18 cho project A, nhưng project B cần version 16
- Setup môi trường dev mất cả ngày: cài database, cài Redis, cài đủ thứ dependency
- Onboard member mới vào team — mất 2 ngày chỉ để setup môi trường

Nếu bạn từng gặp bất kỳ tình huống nào ở trên, **Docker** chính là giải pháp.

---

## 1. Docker là gì?

**Docker** là một nền tảng mã nguồn mở giúp bạn **đóng gói, phân phối và chạy ứng dụng** trong các môi trường cô lập gọi là **container**.

Hãy tưởng tượng Docker như một **hộp vận chuyển tiêu chuẩn (shipping container)**:

```
🏭 Nhà máy (Developer máy tính)
    ↓ Đóng gói vào container
📦 Container (App + tất cả dependency)
    ↓ Vận chuyển
🏢 Cảng đích (Server production)
    ↓ Mở container ra, chạy ngay
✅ Hoạt động giống hệt như ở nhà máy
```

### Định nghĩa đơn giản

> **Docker = Ứng dụng của bạn + Mọi thứ nó cần để chạy → Đóng gói thành 1 đơn vị duy nhất**

Cái "mọi thứ nó cần" bao gồm:
- Hệ điều hành (OS) cơ bản (thường là Linux nhẹ)
- Runtime (Node.js, Python, Java...)
- Thư viện và dependency
- Code ứng dụng
- File cấu hình

---

## 2. Tại sao cần Docker?

### Vấn đề 1: "Works on my machine"

**Không có Docker:**

```
Developer A: Node.js 18, npm 9, Ubuntu 22.04
Developer B: Node.js 16, npm 8, macOS
Server:      Node.js 20, npm 10, Amazon Linux

→ Mỗi người một môi trường khác nhau → Bug khó tái hiện
```

**Có Docker:**

```
Developer A: Docker → Container (Node.js 18, npm 9, Ubuntu 22.04)
Developer B: Docker → Container (Node.js 18, npm 9, Ubuntu 22.04)
Server:      Docker → Container (Node.js 18, npm 9, Ubuntu 22.04)

→ Môi trường GIỐNG HỆT nhau → Không còn "trên máy tao chạy được"
```

### Vấn đề 2: Cài đặt môi trường phức tạp

**Không có Docker** — setup một project full-stack:

```bash
# Mất cả ngày...
1. Cài Node.js đúng version
2. Cài PostgreSQL, tạo database, import schema
3. Cài Redis
4. Cài Elasticsearch
5. Cấu hình environment variables
6. Cầu nguyện mọi thứ hoạt động 🙏
```

**Có Docker** — cùng project đó:

```bash
# Mất 1 phút
docker compose up
# Xong. Tất cả đã chạy.
```

### Vấn đề 3: Xung đột phiên bản

**Không có Docker:**

```
Project A cần: PostgreSQL 14, Node 16, Redis 6
Project B cần: PostgreSQL 16, Node 20, Redis 7

→ Cài cả 2 version trên cùng máy? Nightmare!
```

**Có Docker:**

```
Project A → Container riêng (PostgreSQL 14, Node 16, Redis 6)
Project B → Container riêng (PostgreSQL 16, Node 20, Redis 7)

→ Mỗi project chạy trong "thế giới" riêng, không xung đột
```

---

## 3. Docker vs Virtual Machine (VM)

Nhiều người nhầm Docker với máy ảo (Virtual Machine). Hãy so sánh:

### Virtual Machine

```
┌──────────────────────────────┐
│         App A    App B       │
│       ┌───────┐ ┌───────┐   │
│       │ Bins  │ │ Bins  │   │
│       │ Libs  │ │ Libs  │   │
│       ├───────┤ ├───────┤   │
│       │Guest  │ │Guest  │   │  ← Mỗi VM có 1 HĐH riêng (nặng!)
│       │  OS   │ │  OS   │   │
│       └───────┘ └───────┘   │
│      ┌───────────────────┐   │
│      │    Hypervisor     │   │  ← Phần mềm ảo hoá
│      └───────────────────┘   │
│      ┌───────────────────┐   │
│      │     Host OS       │   │
│      └───────────────────┘   │
│      ┌───────────────────┐   │
│      │    Hardware       │   │
│      └───────────────────┘   │
└──────────────────────────────┘
```

### Docker Container

```
┌──────────────────────────────┐
│       App A      App B       │
│     ┌───────┐  ┌───────┐    │
│     │ Bins  │  │ Bins  │    │
│     │ Libs  │  │ Libs  │    │
│     └───────┘  └───────┘    │
│    ┌─────────────────────┐   │
│    │   Docker Engine     │   │  ← Chia sẻ kernel của Host OS
│    └─────────────────────┘   │
│    ┌─────────────────────┐   │
│    │      Host OS        │   │
│    └─────────────────────┘   │
│    ┌─────────────────────┐   │
│    │     Hardware        │   │
│    └─────────────────────┘   │
└──────────────────────────────┘
```

### So sánh chi tiết

| Tiêu chí | Virtual Machine | Docker Container |
|-----------|----------------|-----------------|
| **Khởi động** | Vài phút | Vài giây |
| **Dung lượng** | Hàng GB (có cả OS) | Hàng MB (chỉ app + libs) |
| **Hiệu suất** | Chậm hơn (qua Hypervisor) | Gần như native |
| **Cô lập** | Hoàn toàn (OS riêng) | Chia sẻ kernel |
| **Số lượng** | 5-10 VMs/máy | Hàng trăm containers/máy |
| **Use case** | Cần OS khác nhau | Cùng OS, khác ứng dụng |

### Khi nào dùng gì?

- **VM**: Khi cần chạy Windows trên máy Mac, hoặc cần cô lập hoàn toàn (security)
- **Docker**: Khi cần chạy nhiều ứng dụng, microservices, môi trường development

---

## 4. Các khái niệm cốt lõi

Trước khi đi sâu, hãy làm quen với 4 khái niệm quan trọng nhất:

### Image (Ảnh)

**Image** là bản thiết kế (blueprint) của container. Nó chứa mọi thứ cần thiết để chạy ứng dụng.

```
Image = OS cơ bản + Runtime + Dependencies + Code + Config
```

Tương tự: Image giống như **file ISO** cài Windows — bạn dùng nó để tạo ra nhiều máy (container).

### Container

**Container** là một instance đang chạy của Image. Bạn có thể tạo nhiều container từ 1 image.

```
Image (node:18) → Container 1 (app-frontend)
                → Container 2 (app-backend)
                → Container 3 (app-worker)
```

Tương tự: Nếu Image là **khuôn bánh**, thì Container là **những chiếc bánh** được làm ra từ khuôn đó.

### Dockerfile

**Dockerfile** là file text chứa các bước hướng dẫn để build một Image.

```dockerfile
FROM node:18           # Bắt đầu từ image Node.js 18
WORKDIR /app           # Thư mục làm việc
COPY package.json .    # Copy file package.json
RUN npm install        # Cài dependency
COPY . .               # Copy toàn bộ code
CMD ["npm", "start"]   # Lệnh chạy khi container khởi động
```

### Docker Hub (Registry)

**Docker Hub** là "kho ứng dụng" chứa hàng triệu Image có sẵn, giống như npm cho Node.js hay App Store cho iPhone.

```bash
docker pull node:18        # Tải image Node.js 18 từ Docker Hub
docker pull postgres:16    # Tải image PostgreSQL 16
docker pull redis:7        # Tải image Redis 7
docker pull nginx:latest   # Tải image Nginx
```

---

## 5. Docker giải quyết vấn đề gì trong thực tế?

### Cho Developer

| Tình huống | Không có Docker | Có Docker |
|-----------|----------------|-----------|
| Setup project | Cài thủ công từng tool | `docker compose up` |
| Chuyển máy | Setup lại từ đầu | Copy Dockerfile, chạy |
| Onboard member | Viết tài liệu dài 10 trang | Gửi Dockerfile + `docker compose up` |
| Test nhiều version | Cài đè lên nhau | Chạy container khác version |

### Cho DevOps / Deployment

| Tình huống | Không có Docker | Có Docker |
|-----------|----------------|-----------|
| Deploy lên server | SSH, cài đặt thủ công | Push image, pull và chạy |
| Scale ứng dụng | Mua server mới, cài lại | Tạo thêm container |
| Rollback | Pray and revert | Chạy lại image version cũ |
| CI/CD | Script phức tạp | Build image → Push → Deploy |

---

## 6. Luồng làm việc với Docker

```
1. Viết code         → Code ứng dụng như bình thường
2. Viết Dockerfile   → Mô tả cách đóng gói ứng dụng
3. Build Image       → docker build -t my-app .
4. Chạy Container    → docker run my-app
5. Push lên Registry → docker push my-app
6. Pull trên Server  → docker pull my-app
7. Chạy trên Server  → docker run my-app
```

---

## 7. Tổng kết

| Khái niệm | Giải thích |
|-----------|-----------|
| **Docker** | Nền tảng đóng gói và chạy ứng dụng trong container |
| **Container** | Môi trường cô lập, nhẹ, chạy ứng dụng |
| **Image** | Bản thiết kế để tạo container |
| **Dockerfile** | File hướng dẫn cách build image |
| **Docker Hub** | Kho chứa image công khai |

### Docker KHÔNG phải là:
- ❌ Máy ảo (Virtual Machine) — Docker nhẹ hơn nhiều
- ❌ Chỉ dành cho production — Dùng trong development cũng rất hiệu quả
- ❌ Chỉ dành cho Linux — Chạy được trên Windows, macOS, Linux
- ❌ Khó học — Chỉ cần vài lệnh cơ bản là bắt đầu được

---

**Bài tiếp theo**: Chúng ta sẽ cài đặt Docker và chạy container đầu tiên.
