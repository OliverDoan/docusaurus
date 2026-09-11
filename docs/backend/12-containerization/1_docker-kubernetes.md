---
sidebar_position: 1
title: "1. Docker và Kubernetes"
---

# Docker và Kubernetes

Docker giúp đóng gói ứng dụng cùng mọi thứ nó cần vào một "container" gọn nhẹ, để chạy ở đâu cũng giống nhau, không còn cảnh "máy tôi chạy được mà máy bạn thì lỗi". Kubernetes là công cụ điều phối nhiều container ở quy mô lớn với khả năng tự mở rộng và tự phục hồi. Bài này giới thiệu container so với máy ảo, lệnh Docker cơ bản, Dockerfile, Docker Compose, khái niệm Kubernetes và các best practice khi chạy container trên production.

[![Sơ đồ tóm tắt bài: Docker và Kubernetes](/img/backend/docker-kubernetes.webp)](pathname:///img/backend/docker-kubernetes.webp)

---

:::note[Ghi nhớ nhanh]

- ⭐ **Container nhẹ hơn VM** — share kernel host (OS-level virtualization) nên chỉ ~MB, boot theo giây; giải quyết "máy tôi chạy được mà máy bạn thì lỗi".
- **Dockerfile** là recipe build image — dùng `multi-stage build` để loại dev dependency, base `alpine`, non-root user, `.dockerignore`, tag version cụ thể (không `:latest`); target < 100MB cho Node app.
- **`Docker Compose`** define multi-container stack (app + db + redis) trong 1 file — phù hợp local dev, CI test, deploy đơn giản single-host.
- ⭐ **`Kubernetes`** orchestrate container ở scale (Pod/Deployment/Service/Ingress...) với auto-scaling + self-healing — chỉ đáng dùng khi thực sự cần (nhiều microservice, HA strict); app nhỏ nên dùng Compose/Fly.io/Railway.
- **Layer caching** — sắp xếp instruction từ ít đổi (`COPY package*.json` + install) đến nhiều đổi (`COPY . .`) để tối đa cache.
- **Production checklist** — non-root, no secret trong image, healthcheck, graceful shutdown (SIGTERM), log stdout, resource limit, scan image trong CI.

:::

---

## Mục lục

- [Container vs VM](#container-vs-vm)
- [Docker basics](#docker-basics)
- [Dockerfile](#dockerfile)
- [Docker Compose](#docker-compose)
- [Kubernetes](#kubernetes)
- [Container best practices](#container-best-practices)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

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

:::tip[Ví dụ đời thường]

Cùng là chỗ ở riêng, nhưng có hai kiểu:

- **VM** — mỗi hộ **xây hẳn một căn nhà**, tự đào móng, tự kéo điện nước, tự lắp máy phát (Guest OS). Kín cổng cao tường, nhưng nặng nề và xây rất lâu.
- **Container** — mỗi hộ **một căn hộ trong chung cư**, dùng chung móng và hệ thống điện nước của toà nhà (kernel của host). Cửa vẫn khoá riêng, đồ đạc riêng, nhưng nhận nhà trong vài giây.

Cái giá phải trả: hàng xóm chung một toà. Nếu **hạ tầng chung** có sự cố hay lỗ hổng thì mọi căn hộ đều dính — nên container cách ly kém hơn VM một bậc.

:::

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

:::tip[Ví dụ đời thường]

Ba thứ hay bị lẫn với nhau:

- **`Dockerfile`** — **công thức nấu ăn**: ghi từng bước, lấy nồi nào, cho nguyên liệu gì, nấu ra sao.
- **`image`** — **hộp cơm đã nấu xong và niêm phong** theo công thức đó. Nó nằm im, chỉ để nhân bản và phát đi.
- **`container`** — hộp cơm **được mở ra và đang dùng**. Từ một hộp mẫu bạn nhân ra mười phần y hệt, ai ăn phần nấy, bẩn phần nào vứt phần đó, hộp mẫu vẫn nguyên vẹn.

Vì vậy container **xoá đi là mất sạch mọi thứ ghi bên trong**, quay về đúng như lúc đóng gói. Muốn giữ lại thì phải để ra ngoài, ở `volume`.

:::

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

:::tip[Ví dụ đời thường]

Image được xếp thành **nhiều tầng chồng lên nhau** như bánh kem, và Docker nhớ từng tầng: build lại mà tầng đó không đổi thì nó bê nguyên tầng cũ ra dùng.

Nhưng đã động vào một tầng thì **mọi tầng nằm trên nó phải làm lại từ đầu**. Nếu bạn `COPY . .` (code đổi liên tục) rồi mới `npm ci`, thì sửa một dấu chấm phẩy cũng phải ngồi cài lại toàn bộ thư viện.

Nên quy tắc là: **thứ ít đổi xếp dưới, thứ đổi liên tục xếp trên**.

:::

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

:::tip[Ví dụ đời thường]

App thật hiếm khi chạy một mình: nó cần thêm database, thêm Redis, và cả ba phải **thấy nhau qua mạng nội bộ**. Dựng tay từng cái, nhớ từng cổng, từng mật khẩu — rất dễ sót.

`Docker Compose` là **tờ sơ đồ bày gian bếp**: ghi sẵn cần những quầy nào, quầy nào cắm vào đâu, quầy nào phải mở trước. Đưa tờ giấy đó ra, gõ một lệnh là cả gian bếp dựng xong, gõ lệnh kia là dẹp sạch.

:::

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

:::tip[Ví dụ đời thường]

Docker cho bạn **một công nhân biết việc**. Kubernetes là **ông quản đốc của cả phân xưởng**:

- Bạn không ra lệnh "gọi anh A vào làm", bạn dán bảng nội quy: "ca này **luôn phải có 3 người** đứng máy" (`replicas: 3`).
- Một người ngã bệnh giữa ca? Quản đốc **tự gọi người thay** mà không cần hỏi bạn (self-healing).
- Đơn dồn về? Tự **gọi thêm người** (auto-scaling).
- Đổi quy trình mới? Thay **từng người một**, dây chuyền không phải dừng (rolling update).

Cái giá phải trả: nuôi một ông quản đốc rất tốn. Xưởng chỉ có hai ba người thì tự phân công còn nhanh hơn — nên app nhỏ dùng Compose hay Fly.io/Railway là đủ.

:::

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

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. Container khác `VM` ở chỗ nào? Vì sao container khởi động tính bằng giây còn VM tính bằng phút?
2. Phân biệt `image`, `container` và `layer`. Vì sao image là immutable mà container vẫn ghi được dữ liệu?
3. Docker tận dụng `layer cache` theo thứ tự nào? Vì sao `COPY package.json` phải đứng trước `COPY . .`?
4. `multi-stage build` giải quyết vấn đề gì? Bạn kéo image một app Node từ 1GB xuống dưới 150MB bằng những cách nào?
5. `RUN`, `CMD` và `ENTRYPOINT` chạy vào thời điểm nào và khác nhau ra sao? Khi nào dùng ENTRYPOINT thay cho CMD?
6. Phân biệt `COPY` với `ADD`, `ARG` với `ENV`. Vì sao truyền secret qua `ARG` trong Dockerfile là sai?
7. Vì sao nên chạy container bằng `non-root user`? Còn cách nào khác để thu nhỏ bề mặt tấn công của image?
8. Dữ liệu trong container mất khi container bị xoá — `volume` và `bind mount` khác nhau ra sao, khi nào dùng cái nào?
9. Các container nói chuyện với nhau qua Docker network như thế nào? `docker compose` giúp được gì so với chạy tay từng `docker run`?
10. Khi nào một dự án thực sự cần `Kubernetes`, và khi nào Docker Compose hoặc PaaS là đủ?
11. Giải thích quan hệ `Pod` → `ReplicaSet` → `Deployment`. Vì sao hiếm khi tạo Pod trực tiếp?
12. `ClusterIP`, `NodePort` và `LoadBalancer` khác nhau thế nào? `Ingress` đứng ở đâu trong bức tranh đó?
13. `liveness probe` và `readiness probe` khác nhau ở hậu quả khi fail. Cấu hình nhầm liveness cho app khởi động chậm sẽ gây hiện tượng gì, và `startup probe` cứu thế nào?
14. `requests` và `limits` của CPU/memory ảnh hưởng ra sao tới việc scheduling? Vượt memory limit (`OOMKilled`) khác gì vượt CPU limit (throttling)?
15. Mô tả một `rolling update`: K8s thay pod theo trình tự nào, và cần những gì để user không thấy lỗi trong lúc deploy?
16. App nên làm gì khi nhận tín hiệu `SIGTERM`? `graceful shutdown` liên quan thế nào tới `terminationGracePeriodSeconds`?
17. `ConfigMap` khác `Secret` ra sao? Secret trong K8s mặc định chỉ `base64` — vậy bảo mật thật sự đến từ đâu?
18. `StatefulSet` khác `Deployment` ở điểm nào, và vì sao database cần StatefulSet?
19. Một pod đứng ở trạng thái `CrashLoopBackOff`. Bạn debug theo các bước nào?
