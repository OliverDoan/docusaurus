---
sidebar_position: 5
title: "5. Docker với CI/CD"
---

# Docker với CI/CD

Docker và CI/CD là cặp đôi hoàn hảo. Bài này hướng dẫn cách sử dụng Docker trong pipeline CI/CD với GitHub Actions.

---


---

## Mục lục

- [1. Tại sao Docker + CI/CD?](#1-tại-sao-docker-cicd)
- [2. GitHub Actions + Docker](#2-github-actions-docker)
- [3. Multi-platform Builds](#3-multi-platform-builds)
- [4. Deploy to Server](#4-deploy-to-server)
- [5. CI/CD Pipeline hoàn chỉnh](#5-cicd-pipeline-hoàn-chỉnh)
- [6. Caching trong CI](#6-caching-trong-ci)
- [7. Bài tập thực hành](#7-bài-tập-thực-hành)
- [Tổng kết](#tổng-kết)

---

## 1. Tại sao Docker + CI/CD?

### Không có Docker

```
Developer push code → CI server cài Node.js → Cài dependencies
→ Chạy tests → Build → Deploy lên server (cài lại mọi thứ)

Vấn đề:
- CI server cần cài đúng version Node.js
- "CI chạy được, server chạy không được"
- Mỗi deploy phải cài lại dependencies trên server
```

### Có Docker

```
Developer push code → CI build Docker image → Chạy tests trong container
→ Push image lên Registry → Server pull image → Chạy container

Ưu điểm:
- Môi trường giống hệt nhau (CI = Server)
- Deploy = Pull image + Run container
- Rollback = Chạy image version cũ
```

---

## 2. GitHub Actions + Docker

### Build và Test

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: testdb
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t my-app:test .

      - name: Run tests
        run: |
          docker run --rm \
            --network host \
            -e DATABASE_URL=postgresql://postgres:test@localhost:5432/testdb \
            my-app:test npm test
```

### Build và Push to Registry

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/my-app:latest
            ${{ secrets.DOCKER_USERNAME }}/my-app:${{ github.sha }}
```

### Build và Push to GitHub Container Registry

```yaml
name: Build and Push to GHCR

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:latest
            ghcr.io/${{ github.repository }}:${{ github.sha }}
```

---

## 3. Multi-platform Builds

Build image chạy được trên cả AMD64 (Intel) và ARM64 (Apple Silicon, AWS Graviton):

```yaml
name: Multi-platform Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ghcr.io/${{ github.repository }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## 4. Deploy to Server

### SSH Deploy

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: build-and-push  # Chạy sau khi build xong

    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /app
            docker compose pull
            docker compose up -d --remove-orphans
            docker image prune -f
```

### Deploy script trên server

```bash
#!/bin/bash
# /app/deploy.sh

set -e

echo "$(date): Starting deployment..."

cd /app

# Pull latest images
docker compose pull

# Start with new images
docker compose up -d --remove-orphans

# Wait for health check
sleep 10

# Verify
if docker compose ps | grep -q "unhealthy"; then
  echo "DEPLOY FAILED: unhealthy containers"
  docker compose logs --tail 50
  exit 1
fi

# Cleanup
docker image prune -f

echo "$(date): Deployment completed!"
```

---

## 5. CI/CD Pipeline hoàn chỉnh

```yaml
name: Full CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ====== Step 1: Test ======
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build test image
        run: docker build --target builder -t test-image .
      - name: Run tests
        run: docker run --rm test-image npm test

  # ====== Step 2: Build & Push ======
  build:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    permissions:
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

  # ====== Step 3: Deploy ======
  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /app
            docker compose pull
            docker compose up -d
            docker image prune -f
```

### Luồng pipeline

```
Push code → Test → Build Image → Push to Registry → Deploy to Server
                      │
  PR → Test (không deploy)
```

---

## 6. Caching trong CI

### GitHub Actions cache

```yaml
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
    cache-from: type=gha        # Đọc cache từ GitHub Actions
    cache-to: type=gha,mode=max # Lưu cache vào GitHub Actions
```

### Layer caching

```yaml
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
    cache-from: type=registry,ref=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:buildcache
    cache-to: type=registry,ref=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:buildcache,mode=max
```

---

## 7. Bài tập thực hành

Tạo một pipeline đơn giản cho project Node.js:

1. Tạo `.github/workflows/ci.yml` trong project
2. Config: Build image khi push
3. Chạy test trong container
4. Push image lên GHCR khi merge vào main

```bash
# Kiểm tra workflow chạy đúng
# Push code → Xem tab "Actions" trên GitHub
```

---

## Tổng kết

| Bước | Công cụ | Mô tả |
|------|---------|--------|
| **Test** | `docker build --target test` | Chạy test trong container |
| **Build** | `docker/build-push-action` | Build multi-platform image |
| **Push** | GHCR / Docker Hub | Lưu image lên registry |
| **Deploy** | SSH / Webhook | Pull + restart trên server |
| **Cache** | GHA cache / Registry cache | Tăng tốc build |

### Quy trình khuyến nghị

```
1. Developer push code
2. CI chạy tests
3. CI build Docker image
4. CI push image lên Registry
5. CD deploy image lên server
6. Health check xác nhận deploy thành công
```
