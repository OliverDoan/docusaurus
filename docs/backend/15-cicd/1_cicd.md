---
sidebar_position: 1
title: "1. CI/CD: Pipelines, GitHub Actions"
---

# CI/CD: Pipelines, GitHub Actions

---

## Mục lục

- [CI vs CD vs Continuous Deployment](#ci-vs-cd-vs-continuous-deployment)
- [Platforms](#platforms)
- [GitHub Actions](#github-actions)
- [Pipeline pattern](#pipeline-pattern)
- [Deployment strategies](#deployment-strategies)

---

## CI vs CD vs Continuous Deployment

| Term | Meaning |
|------|---------|
| **CI** (Continuous Integration) | Auto build + test mỗi PR/commit |
| **CD** (Continuous Delivery) | Auto deploy to staging, manual approve production |
| **Continuous Deployment** | Auto deploy production sau khi pass test |

Flow chuẩn:

```
[Push code] → [CI: lint + test + build] → [CD: deploy staging]
                                            ↓
                                       [Manual approve]
                                            ↓
                                       [Deploy production]
```

---

## Platforms

| Platform | Khuyến nghị | Đặc điểm |
|----------|-------------|----------|
| **GitHub Actions** | **Có** | Tích hợp GitHub, free generous |
| **GitLab CI** | Có | Strong cho GitLab user |
| **CircleCI** | Có | Mature, fast |
| **Jenkins** | Self-host | Enterprise, mature, complex |
| **ArgoCD** | Có | Kubernetes-native GitOps |
| **Drone** | Self-host | Container-native, light |

Năm 2026, **GitHub Actions** dominate cho open source + startup. Jenkins
giữ enterprise legacy.

---

## GitHub Actions

Config file `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/postgres

      - run: npm run build
```

Trigger:

- `push` — mỗi commit.
- `pull_request` — mỗi PR.
- `schedule` — cron.
- `workflow_dispatch` — manual.
- `release` — tag release.

**Matrix** — test nhiều version:

```yaml
strategy:
  matrix:
    node: [18, 20, 22]
    os: [ubuntu-latest, macos-latest]

steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node }}
```

→ Chạy 6 job (3 node × 2 OS) song song.

---

## Pipeline pattern

**Stage typical**:

```
1. Checkout code
2. Setup runtime (Node, Python)
3. Cache dependency
4. Install
5. Lint
6. Type check (TS)
7. Unit test
8. Integration test (với DB)
9. Build
10. Build Docker image
11. Push image to registry
12. Deploy
```

**Optimization**:

**Cache**:

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'  # cache node_modules
```

**Parallel jobs**:

```yaml
jobs:
  lint: { ... }
  test: { ... }
  build: { ... }
  # Cả 3 chạy song song

  deploy:
    needs: [lint, test, build]  # đợi 3 xong
```

**Conditional**:

```yaml
- run: deploy production
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

---

## Deployment strategies

**1. Rolling deploy** — replace từng instance:

```
[v1, v1, v1, v1]
[v2, v1, v1, v1]  ← deploy v2 instance 1
[v2, v2, v1, v1]
[v2, v2, v2, v1]
[v2, v2, v2, v2]
```

- ✓ No downtime.
- ✗ Mix version trong deploy (DB migration cẩn thận).

**2. Blue-Green** — 2 environment, switch atomic:

```
Blue (current): v1, v1, v1, v1
Green (idle):   ---
                ↓ Deploy v2 to green
Blue:  v1, v1, v1, v1
Green: v2, v2, v2, v2
                ↓ Switch traffic (load balancer)
Blue:  v1, v1, v1, v1  (idle, có thể rollback)
Green: v2, v2, v2, v2  (active)
```

- ✓ Atomic switch, easy rollback.
- ✗ Tốn 2x infrastructure.

**3. Canary** — release dần cho subset user:

```
Step 1: 1% user → v2.
Step 2: 10% user → v2 (sau 1h, không có error).
Step 3: 50% user → v2.
Step 4: 100% user → v2.
```

- ✓ Limit blast radius.
- ✓ Test với real traffic.
- ✗ Phức tạp setup.

**4. Feature flags** — deploy code, toggle feature:

```ts
if (featureFlag.isEnabled("new-checkout", userId)) {
  return newCheckoutFlow();
} else {
  return oldCheckoutFlow();
}
```

Service: **LaunchDarkly**, **Flagsmith**, **PostHog Feature Flags**,
**ConfigCat**.

- ✓ Decouple deploy + release.
- ✓ Instant rollback (toggle off).
- ✓ A/B test.
- ✗ Code complexity (multiple branch).

:::info[Phân tích]

**Strategy theo team size**:

| Team | Strategy |
|------|----------|
| Solo / startup | Rolling deploy (Vercel auto) |
| 5-20 dev | Blue-green + manual approve |
| 20-100 dev | Canary + feature flags |
| 100+ dev | Canary + feature flags + chaos engineering |

Đa số dự án nhỏ-vừa: **rolling deploy** đủ. PaaS như Vercel, Fly.io tự
handle.

Khi cần canary cho microservice, dùng **Service Mesh** (Istio, Linkerd)
hoặc **Argo Rollouts** trong Kubernetes.

:::

:::tip[Mẹo]

**CI/CD best practices 2026**:

1. **Fast feedback** — pipeline < 10 phút.
2. **Reproducible** — same input = same output.
3. **Idempotent** — chạy nhiều lần không lỗi.
4. **Branch protection** — block direct push main.
5. **Required check** — PR phải pass CI mới merge.
6. **Secrets management** — GitHub Secrets, không hardcode.
7. **Artifact** — cache build, share giữa job.
8. **Notification** — Slack alert fail.
9. **Rollback ready** — biết cách revert quickly.
10. **Monitor pipeline** — track flaky test, slow job.

Stack chuẩn cho Node + Postgres app:

```
- GitHub Actions
- Docker build + push to GHCR
- Deploy to Fly.io / Railway / Vercel
- Sentry for error tracking
- Slack notif on fail
```

Setup 1 lần, productive forever.

:::

:::warning[Cần lưu ý]

**Pitfalls CI/CD**:

**1. Flaky test** — sometimes pass, sometimes fail.

- Nguyên nhân: time-dependent, network, race condition, order-dependent.
- Fix: mock external, use freezegun, fixed seed, retry sparingly.

**2. Long CI time** — dev đợi 30+ phút.

- Profile pipeline → bottleneck.
- Parallel tests.
- Cache aggressive.
- Split test → run only changed.

**3. Secret leak** — log show secret.

- Mask in workflow:
  ```yaml
  - run: echo "::add-mask::$SECRET"
  ```
- Don't echo env vars.
- Audit logs sau khi run.

**4. Deploy to wrong env** — staging code lên prod.

- Strict environment naming.
- Approval gate cho prod.
- Smoke test ngay sau deploy.

:::
