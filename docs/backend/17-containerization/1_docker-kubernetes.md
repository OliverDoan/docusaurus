---
sidebar_position: 1
title: "1. Docker và Kubernetes"
---

# Docker và Kubernetes

Docker giúp đóng gói ứng dụng cùng mọi thứ nó cần vào một "container" gọn nhẹ, để chạy ở đâu cũng giống nhau, không còn cảnh "máy tôi chạy được mà máy bạn thì lỗi". Kubernetes là công cụ điều phối nhiều container ở quy mô lớn với khả năng tự mở rộng và tự phục hồi. Bài này giới thiệu container so với máy ảo, lệnh Docker cơ bản, Dockerfile, Docker Compose, khái niệm Kubernetes và các best practice khi chạy container trên production.

---

## Mục lục

- [Container vs VM](#container-vs-vm)
- [Docker basics](#docker-basics)
- [Dockerfile](#dockerfile)
- [Docker Compose](#docker-compose)
- [Kubernetes](#kubernetes)
- [Container best practices](#container-best-practices)

---

## Container vs VM

```
VM:                          Container:
┌──────────────┐              ┌──────────────┐
│  App         │              │  App         │
├──────────────┤              ├──────────────┤
│  Guest OS    │              │  Bins/Libs   │
├──────────────┤              ├──────────────┤
│  Hypervisor  │              │  Docker Engine│
├──────────────┤              ├──────────────┤
│  Host OS     │              │  Host OS     │
├──────────────┤              ├──────────────┤
│  Hardware    │              │  Hardware    │
└──────────────┘              └──────────────┘

Heavy (~GB)                   Light (~MB)
Boot: phút                    Boot: giây
Isolated hoàn toàn            Share kernel
```

Container = OS-level virtualization. Share kernel → light + fast.

---

## Docker basics

**Install**: https://docs.docker.com/get-docker/

```bash
# Image management
docker pull nginx:alpine
docker images
docker rmi nginx:alpine

# Container management
docker run -d --name web -p 80:80 nginx:alpine
docker ps
docker ps -a
docker logs web
docker exec -it web sh
docker stop web
docker rm web

# Cleanup
docker system prune -a
```

---

## Dockerfile

Recipe build image:

```dockerfile
# Multi-stage build cho Node app
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Non-root user
RUN addgroup -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nodejs

COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

USER nodejs
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

Build + run:

```bash
docker build -t my-app:1.0 .
docker run -d -p 3000:3000 --name app my-app:1.0
```

**Layer caching** — sắp xếp instruction để max cache:

```dockerfile
# Dependency ít đổi → layer trên
COPY package*.json ./
RUN npm ci

# Code đổi nhiều → layer dưới
COPY . .
RUN npm run build
```

Khi code đổi, chỉ rebuild từ `COPY . .` xuống. `npm ci` (chậm) dùng cache.

:::tip[Mẹo]

**Best practices Dockerfile**:

1. **Multi-stage build** — image production không có dev dep.
2. **Alpine** base image — nhỏ hơn (5-10x).
3. **Non-root user** — security.
4. **`.dockerignore`** — không copy node_modules, .git:

```
node_modules
.git
.env
*.log
.DS_Store
dist
```

5. **Specific version tag** — không dùng `:latest`.
6. **Healthcheck**:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1
```

7. **Combine RUN** — giảm layer:

```dockerfile
# Tệ — 3 layer
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*

# Tốt — 1 layer
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*
```

Image size target: **< 100MB** cho Node app.

:::

---

## Docker Compose

Define multi-container stack:

```yaml
# compose.yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/myapp
      REDIS_URL: redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

```bash
docker compose up -d         # start
docker compose ps            # status
docker compose logs -f app   # log
docker compose down          # stop
docker compose down -v       # stop + remove volume
```

Phù hợp:

- **Local dev** — full stack 1 command.
- **CI test** — spin up DB, Redis cho integration test.
- **Simple production** — single host deploy.

---

## Kubernetes

**K8s** — orchestrate container ở scale: multi-host, auto-scaling, self-healing.

**Object cơ bản**:

| Object | Mô tả |
|--------|-------|
| **Pod** | Đơn vị nhỏ nhất, 1+ container |
| **Deployment** | Manage Pod (rolling update, scale) |
| **Service** | Network endpoint, load balance Pod |
| **Ingress** | HTTP routing từ ngoài vào |
| **ConfigMap** | Config non-secret |
| **Secret** | Sensitive data (password, key) |
| **PersistentVolume** | Storage persistent |
| **StatefulSet** | Pod stateful (DB) |
| **DaemonSet** | 1 Pod per node (logging agent) |
| **Job/CronJob** | Run-to-completion task |

**Deployment example**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels: { app: my-app }
  template:
    metadata:
      labels: { app: my-app }
    spec:
      containers:
        - name: app
          image: my-registry/my-app:1.0
          ports: [{ containerPort: 3000 }]
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: url
          resources:
            requests: { cpu: "100m", memory: "128Mi" }
            limits: { cpu: "500m", memory: "512Mi" }
          livenessProbe:
            httpGet: { path: /health, port: 3000 }
            initialDelaySeconds: 30
          readinessProbe:
            httpGet: { path: /ready, port: 3000 }
---
apiVersion: v1
kind: Service
metadata:
  name: my-app
spec:
  selector: { app: my-app }
  ports: [{ port: 80, targetPort: 3000 }]
```

```bash
kubectl apply -f deployment.yaml
kubectl get pods
kubectl logs my-app-xyz
kubectl scale deployment my-app --replicas=5
kubectl rollout undo deployment my-app
```

:::info[Phân tích]

**Khi nào dùng Kubernetes?**

✅ Có:

- **Microservice** scale (10+ service).
- **Multi-region** deploy.
- **High availability** SLA strict.
- **Hybrid cloud** / multi-cloud.
- **Enterprise** team có DevOps dedicated.

❌ Không:

- **App nhỏ** (1-3 service).
- **Solo dev / startup nhỏ**.
- **No DevOps experience**.

Alternative đơn giản hơn:

- **Docker Compose** + VPS — single host.
- **Vercel, Fly.io, Railway, Render** — managed.
- **Nomad** — đơn giản hơn k8s.
- **Docker Swarm** — built-in Docker.

K8s **overhead 10-20% productivity** với team mới — đáng giá chỉ khi
thực sự scale cần.

Năm 2026, **trend là "K8s-lite"** — Fly.io, Vercel, Railway, Cloudflare
hide k8s phức tạp, expose app-level API. Đa số startup không touch k8s
trực tiếp.

:::

---

## Container best practices

**Security**:

- **Non-root user** trong container.
- **Read-only filesystem** khi có thể.
- **Minimal base** (alpine, distroless).
- **Scan image** với Trivy, Snyk.
- **Sign image** với cosign.
- **Update base image** đều đặn.

**Performance**:

- **Multi-stage build**.
- **`.dockerignore`** strict.
- **Layer order** từ ít đổi đến nhiều đổi.
- **Cache mount** cho dependency install:

```dockerfile
# BuildKit cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

**Observability**:

- **Stdout/stderr logs** (12-factor).
- **Healthcheck** + readiness probe.
- **Metric endpoint** (Prometheus `/metrics`).
- **Distributed tracing** trace ID.

**Image registry**:

- **GitHub Container Registry (GHCR)** — free public, generous private.
- **Docker Hub** — phổ biến.
- **AWS ECR**, **GCP Artifact Registry** — cloud native.
- **Self-host**: Harbor.

:::tip[Mẹo]

**Production container checklist**:

- [ ] Image < 100MB (Node app).
- [ ] Non-root user.
- [ ] No secret trong image (mount/env).
- [ ] Health check endpoint.
- [ ] Graceful shutdown (SIGTERM handler).
- [ ] Log to stdout.
- [ ] Resource limit set.
- [ ] Image scan trong CI.
- [ ] Tag với version, không latest.
- [ ] Multi-arch build (amd64 + arm64 nếu cần).

Graceful shutdown Node:

```ts
let server: Server;

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down");
  server.close(() => {
    db.$disconnect();
    process.exit(0);
  });

  // Force exit after 30s
  setTimeout(() => process.exit(1), 30_000);
});
```

K8s pod terminate → SIGTERM → app cleanup → exit. Không cleanup =
connection drop, user thấy error.

:::
