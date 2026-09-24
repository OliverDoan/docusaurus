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

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Container khác `VM` ở chỗ nào? Vì sao container khởi động tính bằng giây còn VM tính bằng phút?**

<details className="qa">
<summary>Xem đáp án</summary>

Container là **OS-level virtualization**: mọi container share kernel của host, chỉ đóng gói thêm app cùng bins/libs. VM thì ảo hoá phần cứng qua hypervisor, mỗi máy ảo phải cõng nguyên một Guest OS.

| Tiêu chí | VM | Container |
|---|---|---|
| Kích thước | ~GB | ~MB |
| Khởi động | Phút | Giây |
| Cách ly | Hoàn toàn, kernel riêng | Share kernel, yếu hơn một bậc |

Boot VM chậm vì phải khởi động cả một hệ điều hành: init kernel, load driver, chạy service nền. Container không có bước đó — chạy container thực chất là tạo tiến trình mới trên kernel đang chạy sẵn, cộng thêm namespace (cách ly PID, network, mount) và cgroup (giới hạn CPU/RAM). Không có OS để boot thì không mất phút nào.

Đổi lại, cách ly kém hơn: lỗ hổng ở kernel dùng chung ảnh hưởng mọi container — như các căn hộ chung một toà nhà.

</details>

**2. Phân biệt `image`, `container` và `layer`. Vì sao image là immutable mà container vẫn ghi được dữ liệu?**

<details className="qa">
<summary>Xem đáp án</summary>

- `Dockerfile` — công thức build.
- `image` — kết quả build, **immutable**, gồm nhiều `layer` read-only xếp chồng; mỗi instruction trong Dockerfile sinh ra một layer.
- `container` — một instance đang chạy của image.

Khi chạy container, Docker giữ nguyên các layer của image ở chế độ read-only rồi thêm lên trên cùng một **writable layer** riêng cho container đó, hoạt động theo cơ chế copy-on-write: ghi file mới thì file nằm ở layer này; sửa file có sẵn thì file được copy lên layer trên rồi mới sửa, bản gốc trong image không hề đổi.

Nhờ vậy một image immutable có thể chia sẻ cho hàng chục container cùng lúc mà không nhân bản dữ liệu. Hệ quả: dữ liệu ghi bên trong container **mất sạch khi container bị xoá**, muốn giữ lại phải đưa ra ngoài bằng `volume`.

</details>

**3. Docker tận dụng `layer cache` theo thứ tự nào? Vì sao `COPY package.json` phải đứng trước `COPY . .`?**

<details className="qa">
<summary>Xem đáp án</summary>

Docker build tuần tự từng instruction, mỗi instruction thành một layer và được cache. Khi rebuild, Docker dùng lại layer cũ nếu instruction và input không đổi; **chỉ cần một layer invalid là mọi layer phía sau đều phải build lại**.

Dependency thì hiếm đổi, còn code đổi liên tục. Nên tách:

```dockerfile
COPY package*.json ./
RUN npm ci          # cache, chỉ chạy lại khi package.json đổi
COPY . .
RUN npm run build
```

Nếu `COPY . .` đứng trước `npm ci`, sửa một dấu chấm phẩy cũng làm layer copy đổi hash, kéo theo `npm ci` (bước chậm nhất) phải chạy lại từ đầu mỗi lần build.

Nguyên tắc: **thứ ít đổi xếp trước, thứ đổi nhiều xếp sau**. Kèm `.dockerignore` để `node_modules`, `.git` không lọt vào build context làm hỏng cache.

</details>

**4. `multi-stage build` giải quyết vấn đề gì? Bạn kéo image một app Node từ 1GB xuống dưới 150MB bằng những cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`multi-stage build` tách quá trình build khỏi image chạy: stage builder có đủ toolchain (devDependencies, compiler, source code), stage runner chỉ `COPY --from=builder` đúng artifact cần thiết. Image production vì thế không mang theo source, dev dependency hay công cụ build — vừa nhẹ vừa giảm bề mặt tấn công.

Các cách kéo size xuống:

- Multi-stage, stage cuối chỉ copy `dist` và `node_modules` production.
- Base `node:20-alpine` hoặc distroless thay cho image full (nhỏ hơn 5-10 lần).
- `npm ci --only=production` ở stage deps.
- `.dockerignore` loại `node_modules`, `.git`, `dist`, log khỏi build context.
- Gộp `RUN` và xoá cache apt/npm ngay trong cùng lệnh — xoá ở layer sau không làm giảm size vì layer trước vẫn còn.

Mục tiêu bài đặt ra: image **dưới 100MB** cho một app Node.

</details>

**5. `RUN`, `CMD` và `ENTRYPOINT` chạy vào thời điểm nào và khác nhau ra sao? Khi nào dùng ENTRYPOINT thay cho CMD?**

<details className="qa">
<summary>Xem đáp án</summary>

`RUN` chạy **lúc build**, kết quả được ghi thành một layer trong image (cài package, build code). `CMD` và `ENTRYPOINT` không chạy lúc build — chúng chỉ khai báo **lệnh mặc định lúc container start**.

Khác nhau giữa hai cái sau: `CMD` dễ bị ghi đè, `docker run my-app sh` là thay hẳn lệnh. `ENTRYPOINT` cố định phần thực thi, còn tham số truyền thêm ở `docker run` được **nối vào sau** ENTRYPOINT (với dạng exec).

Dùng ENTRYPOINT khi image đóng vai một "executable" cố định và chỉ muốn người dùng đổi tham số; kết hợp cả hai để CMD làm tham số mặc định:

```dockerfile
ENTRYPOINT ["node", "dist/cli.js"]
CMD ["--help"]
```

Dùng CMD khi muốn dev thoải mái override để vào shell debug. Luôn ưu tiên dạng exec (JSON array) để tiến trình app là PID 1 và nhận được `SIGTERM`.

</details>

**6. Phân biệt `COPY` với `ADD`, `ARG` với `ENV`. Vì sao truyền secret qua `ARG` trong Dockerfile là sai?**

<details className="qa">
<summary>Xem đáp án</summary>

| Instruction | Hành vi |
|---|---|
| `COPY` | Copy file/thư mục từ build context vào image — đơn giản, dễ đoán |
| `ADD` | Như COPY, nhưng còn tự giải nén file tar và tải được URL |
| `ARG` | Biến **chỉ tồn tại lúc build**, truyền qua `--build-arg` |
| `ENV` | Biến môi trường, **tồn tại cả lúc runtime** bên trong container |

Khuyến nghị: mặc định dùng `COPY`, chỉ dùng `ADD` khi thực sự cần giải nén — hành vi ngầm của ADD dễ gây bất ngờ và có rủi ro bảo mật khi tải từ URL.

Vì sao secret qua `ARG` là sai: giá trị build-arg được ghi vào **metadata/history của image**, ai chạy `docker history` cũng đọc được, dù biến không còn tồn tại lúc runtime. Secret phải được đưa vào lúc chạy (env, mount file, secret manager) hoặc dùng BuildKit với `--mount=type=secret` để không lưu lại layer.

</details>

**7. Vì sao nên chạy container bằng `non-root user`? Còn cách nào khác để thu nhỏ bề mặt tấn công của image?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định container chạy bằng `root`. Nếu attacker chiếm được tiến trình, họ là root trong container — kết hợp với lỗ hổng kernel hoặc cấu hình mount sai (docker socket, host path) là có đường leo thang ra host. Chạy non-root giới hạn thiệt hại ngay từ đầu:

```dockerfile
RUN addgroup -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nodejs
USER nodejs
```

Các cách khác:

- Base image tối thiểu — `alpine` hoặc distroless, không shell, không package manager để attacker dùng.
- Multi-stage build để image chạy không có compiler và dev dependency.
- Read-only root filesystem, chỉ mở ghi ở đúng volume cần thiết.
- Không nhét secret vào image, mount lúc chạy.
- Scan image bằng Trivy hoặc Snyk trong CI, ký image bằng cosign, cập nhật base image đều đặn.
- Pin tag version cụ thể thay vì `:latest`.

</details>

**8. Dữ liệu trong container mất khi container bị xoá — `volume` và `bind mount` khác nhau ra sao, khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | `volume` | `bind mount` |
|---|---|---|
| Vị trí lưu | Do Docker quản lý | Một đường dẫn cụ thể trên host |
| Khai báo | `postgres_data:/var/lib/postgresql/data` | `./src:/app/src` |
| Portable | Có, không phụ thuộc cấu trúc thư mục host | Không, gắn chặt với máy |
| Quản lý, backup | Qua Docker CLI | Thao tác file thường trên host |

Dùng `volume` cho **dữ liệu production cần bền**: data directory của Postgres, Redis — đúng như `postgres_data` và `redis_data` trong compose ở trên. Docker quản lý nên hoạt động đồng nhất trên Linux, macOS, Windows và dễ backup.

Dùng `bind mount` chủ yếu cho **local dev**: mount source code vào container để hot reload, hoặc mount file config từ host. Đổi lại nó phụ thuộc máy dev và có thể chậm hoặc lệch permission trên macOS, Windows.

</details>

**9. Các container nói chuyện với nhau qua Docker network như thế nào? `docker compose` giúp được gì so với chạy tay từng `docker run`?**

<details className="qa">
<summary>Xem đáp án</summary>

Docker tạo một bridge network và các container cùng network gọi nhau qua **DNS nội bộ theo tên service**. Trong compose ở trên, app trỏ tới database bằng `postgresql://postgres:password@db:5432/myapp` — `db` chính là tên service, không cần biết IP. Khai báo `ports` chỉ cần khi muốn mở ra ngoài host.

Chạy tay thì phải tự `docker network create`, tự nhớ `--name`, `-e`, `-v`, `-p` cho từng container và tự canh thứ tự khởi động — rất dễ sót.

`docker compose` gom tất cả vào một file `compose.yaml`:

- Tự tạo network chung, các service thấy nhau qua tên.
- Khai báo volume, env, `depends_on` ở một chỗ, versioned trong git.
- Dựng và dẹp cả stack bằng một lệnh: `docker compose up -d`, `docker compose down -v`.

Phù hợp local dev, CI integration test và deploy đơn giản trên single host.

</details>

**10. Khi nào một dự án thực sự cần `Kubernetes`, và khi nào Docker Compose hoặc PaaS là đủ?**

<details className="qa">
<summary>Xem đáp án</summary>

Nên dùng K8s khi: nhiều microservice (cỡ 10+), deploy multi-region, SLA high availability nghiêm ngặt, hybrid hoặc multi-cloud, và team có DevOps chuyên trách.

Không nên khi: app chỉ 1-3 service, solo dev hoặc startup nhỏ, team chưa có kinh nghiệm vận hành. K8s lấy đi khoảng **10-20% productivity** của team mới vì phải học Pod/Service/Ingress/RBAC, dựng CI, monitoring và tự nuôi cluster.

Lựa chọn nhẹ hơn:

- `Docker Compose` cộng một VPS cho deploy single host.
- PaaS như Vercel, Fly.io, Railway, Render — managed, không phải nuôi cluster.
- Nomad hoặc Docker Swarm nếu cần orchestration nhưng muốn đơn giản.

Xu hướng hiện nay là "K8s-lite": các nền tảng giấu k8s phía sau và chỉ expose API ở mức app, nên phần lớn startup không cần chạm trực tiếp vào k8s.

</details>

**11. Giải thích quan hệ `Pod` → `ReplicaSet` → `Deployment`. Vì sao hiếm khi tạo Pod trực tiếp?**

<details className="qa">
<summary>Xem đáp án</summary>

`Pod` là đơn vị nhỏ nhất K8s lên lịch, gồm một hoặc nhiều container dùng chung network và volume. `ReplicaSet` đảm bảo **luôn có đúng N pod** khớp selector đang chạy — pod chết thì tạo lại. `Deployment` quản lý ReplicaSet và lo phần đổi phiên bản: mỗi lần đổi image, nó tạo ReplicaSet mới, tăng dần pod mới, giảm dần pod cũ (rolling update), đồng thời giữ lịch sử để rollback.

Hiếm khi tạo Pod trực tiếp vì Pod là **ephemeral và không tự hồi phục**: node chết hoặc pod bị xoá là mất hẳn, không ai tạo lại; cũng không có scale, không có rolling update, không có `kubectl rollout undo`.

Triết lý của K8s là khai báo trạng thái mong muốn ở mức Deployment (`replicas: 3`) rồi để control plane tự giữ cho thực tế khớp với khai báo đó.

</details>

**12. `ClusterIP`, `NodePort` và `LoadBalancer` khác nhau thế nào? `Ingress` đứng ở đâu trong bức tranh đó?**

<details className="qa">
<summary>Xem đáp án</summary>

| Service type | Phạm vi truy cập |
|---|---|
| `ClusterIP` | Mặc định — IP ảo chỉ truy cập được **bên trong cluster** |
| `NodePort` | Mở một port cố định trên **mọi node**, vào qua `IP-node:port` |
| `LoadBalancer` | Nhờ cloud provider cấp một load balancer ngoài, có IP public |

Cả ba đều load balance tới các pod khớp selector; `NodePort` và `LoadBalancer` thực chất xây trên nền `ClusterIP`.

`Ingress` nằm ở tầng cao hơn, làm việc ở mức HTTP/HTTPS (L7). Nó không phải một Service type mà là **tập quy tắc routing** theo host và path, trỏ về các `ClusterIP` Service phía sau, kèm TLS termination. Thay vì mỗi service một LoadBalancer rất tốn tiền, ta dùng một LoadBalancer duy nhất cho ingress controller rồi route nội bộ cho mọi service.

</details>

**13. `liveness probe` và `readiness probe` khác nhau ở hậu quả khi fail. Cấu hình nhầm liveness cho app khởi động chậm sẽ gây hiện tượng gì, và `startup probe` cứu thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều là health check định kỳ nhưng hậu quả khác hẳn:

- `readinessProbe` fail → pod bị **gỡ khỏi endpoint của Service**, không nhận traffic nữa nhưng vẫn sống; pass lại thì được đưa vào lại.
- `livenessProbe` fail → kubelet coi container hỏng và **restart container**.

Nếu app khởi động chậm (warm cache, chạy migration) mà liveness đặt `initialDelaySeconds` quá ngắn, app chưa kịp sẵn sàng đã bị kill, restart rồi lại bị kill — pod rơi vào vòng lặp `CrashLoopBackOff` dù code hoàn toàn đúng.

`startupProbe` giải quyết đúng chỗ đó: khi được khai báo, liveness và readiness **bị hoãn cho tới khi startup probe pass**. Ta cho startup probe một ngưỡng thời gian rộng rãi dành riêng cho lần khởi động, còn liveness vẫn giữ chu kỳ ngắn để phát hiện app treo lúc đang chạy.

</details>

**14. `requests` và `limits` của CPU/memory ảnh hưởng ra sao tới việc scheduling? Vượt memory limit (`OOMKilled`) khác gì vượt CPU limit (throttling)?**

<details className="qa">
<summary>Xem đáp án</summary>

`requests` là phần tài nguyên pod **được đảm bảo** và là căn cứ scheduler chọn node: K8s chỉ đặt pod lên node còn đủ request chưa dùng. Đặt request quá cao thì pod kẹt ở `Pending` vì không node nào nhận; quá thấp thì node bị nhồi quá tải.

`limits` là trần cứng lúc chạy:

| Vượt trần | Hậu quả |
|---|---|
| Memory | Kernel `OOMKilled` container, pod restart — chết đột ngột, request đang xử lý bị đứt |
| CPU | Bị **throttle** — tiến trình bị bóp lại, chạy chậm, latency tăng, nhưng không chết |

Khác biệt cốt lõi: CPU là tài nguyên chia nhỏ được nên hệ thống chỉ cần làm chậm tiến trình; memory thì không, đã cấp là không lấy lại được, cách duy nhất là giết tiến trình. Vì vậy `OOMKilled` biểu hiện thành restart liên tục, còn CPU throttling biểu hiện thành p99 latency xấu đi mà pod vẫn "healthy".

</details>

**15. Mô tả một `rolling update`: K8s thay pod theo trình tự nào, và cần những gì để user không thấy lỗi trong lúc deploy?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi image trong Deployment đổi, K8s tạo ReplicaSet mới và thay pod **từng phần** theo `maxSurge` và `maxUnavailable`: dựng thêm pod bản mới, chờ pod đó pass readiness probe rồi mới đưa vào endpoint của Service, sau đó mới xoá bớt một pod bản cũ, lặp lại tới khi thay hết. Pod bị xoá nhận `SIGTERM` trước khi chết.

Để user không thấy lỗi cần:

- `readinessProbe` chính xác — thiếu nó thì traffic vào pod chưa sẵn sàng.
- `graceful shutdown`: pod cũ ngừng nhận request mới nhưng xử lý nốt request đang dở rồi mới exit.
- Đủ `replicas` và `maxUnavailable` hợp lý để luôn còn pod phục vụ.
- Thay đổi schema database phải **backward compatible**, vì hai phiên bản chạy song song trong lúc deploy.
- Sẵn sàng `kubectl rollout undo` để quay lui nhanh khi phát hiện lỗi.

</details>

**16. App nên làm gì khi nhận tín hiệu `SIGTERM`? `graceful shutdown` liên quan thế nào tới `terminationGracePeriodSeconds`?**

<details className="qa">
<summary>Xem đáp án</summary>

`SIGTERM` là tín hiệu "chuẩn bị tắt". App nên ngừng nhận connection mới, đóng listener, xử lý nốt request đang dở, đóng kết nối DB và queue, rồi exit 0:

```ts
process.on("SIGTERM", async () => {
  server.close(() => {
    db.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 30_000);
});
```

Liên hệ với `terminationGracePeriodSeconds` (mặc định 30 giây): khi xoá pod, K8s gửi SIGTERM rồi **đếm ngược** khoảng thời gian này; hết hạn mà tiến trình chưa thoát thì nhận `SIGKILL` cắt ngang không thương tiếc.

Vì vậy timeout tự thoát trong app phải **ngắn hơn** grace period, còn grace period phải đủ dài cho request lâu nhất. Không xử lý SIGTERM thì mỗi lần deploy hay scale down đều làm đứt connection và user thấy lỗi.

</details>

**17. `ConfigMap` khác `Secret` ra sao? Secret trong K8s mặc định chỉ `base64` — vậy bảo mật thật sự đến từ đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

`ConfigMap` chứa cấu hình **không nhạy cảm** (URL service, feature flag, log level). `Secret` dành cho dữ liệu nhạy cảm (password, API key, TLS cert). Về cách dùng thì gần giống nhau, đều mount được thành biến môi trường hoặc file — như `secretKeyRef` trong Deployment ở trên.

Khác biệt nằm ở cách cluster đối xử: Secret được đánh dấu riêng để áp RBAC chặt hơn, hạn chế lộ ra trong log và có thể bật encryption at rest cho etcd.

`base64` **không phải mã hoá**, chỉ là encoding để chứa dữ liệu nhị phân, ai đọc được object là decode ra ngay. Bảo mật thật đến từ:

- RBAC siết quyền đọc Secret theo namespace và service account.
- Bật encryption at rest cho etcd, siết truy cập vào etcd và node.
- Dùng external secret manager (Vault, AWS Secrets Manager) đồng bộ vào cluster.
- Không commit secret vào git, nếu buộc phải thì mã hoá bằng sealed-secrets hoặc SOPS.

</details>

**18. `StatefulSet` khác `Deployment` ở điểm nào, và vì sao database cần StatefulSet?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | `Deployment` | `StatefulSet` |
|---|---|---|
| Danh tính pod | Ngẫu nhiên, pod thay thế được cho nhau | Ổn định, đánh số `db-0`, `db-1` |
| Thứ tự | Tạo và xoá song song | Tạo tuần tự từ 0, xoá theo chiều ngược lại |
| Storage | Thường không có state riêng | Mỗi pod một PersistentVolumeClaim riêng, giữ nguyên khi pod tạo lại |
| Network | Chỉ qua Service | Thêm hostname ổn định qua headless Service |

Deployment giả định pod là **stateless và thay thế được**: giết pod nào cũng như nhau, tạo lại là xong.

Database không như vậy. Mỗi node giữ dữ liệu riêng trên đĩa, có vai trò riêng (primary hay replica), và replica phải join theo đúng thứ tự, trỏ tới primary bằng một địa chỉ ổn định. StatefulSet cho đúng ba thứ đó: danh tính cố định, volume gắn liền với danh tính, và thứ tự khởi động/tắt xác định.

</details>

**19. Một pod đứng ở trạng thái `CrashLoopBackOff`. Bạn debug theo các bước nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Trạng thái này nghĩa là container start rồi chết liên tục, K8s restart lại với khoảng chờ tăng dần. Trình tự debug:

1. `kubectl describe pod <name>` — đọc Events và `Last State` để lấy exit code (137 thường là bị kill hoặc OOM, 1 là app tự thoát do lỗi).
2. `kubectl logs <name> --previous` — log của lần chạy trước khi crash, thường chứa stack trace thật.
3. Soi các nguyên nhân hay gặp: thiếu env, Secret hoặc ConfigMap; không kết nối được DB; migration fail; sai đường dẫn file config; `CMD` sai.
4. Kiểm tra `livenessProbe` — delay quá ngắn với app khởi động chậm sẽ kill nhầm, cân nhắc thêm `startupProbe`.
5. Kiểm tra resource — thấy `OOMKilled` nghĩa là memory limit quá thấp.
6. Nếu vẫn bí: chạy đúng image bằng `docker run` ở local, hoặc override command thành lệnh chờ rồi `kubectl exec` vào soi filesystem, permission, biến môi trường.

</details>
