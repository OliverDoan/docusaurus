---
sidebar_position: 1
title: "1. CI/CD: Pipelines, GitHub Actions"
---

# CI/CD: Pipelines, GitHub Actions

CI/CD là việc tự động hoá các bước build, test và deploy mỗi khi bạn push code, để không phải làm thủ công và tránh sai sót. Bài này giải thích sự khác nhau giữa CI, CD và Continuous Deployment, cách viết pipeline bằng GitHub Actions, các bước thường gặp trong pipeline và những chiến lược deploy như rolling, blue-green, canary. Nắm CI/CD giúp bạn đưa code lên sản phẩm nhanh, an toàn và lặp lại được.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Phân biệt 3 khái niệm** — `CI` (auto build + test mỗi PR), `CD` Continuous Delivery (auto deploy staging, manual approve prod), Continuous Deployment (auto deploy prod sau khi pass test).
- ⭐ **`GitHub Actions`** dominate 2026 — config bằng `.github/workflows/*.yml`, trigger push/PR/schedule/manual, `matrix` để test nhiều version song song, `services` để spin up DB test.
- **Pipeline typical** — checkout → setup → cache → install → lint → typecheck → test → build → build/push Docker image → deploy; tối ưu bằng cache + parallel jobs + conditional.
- **Deploy strategies** — Rolling (no downtime), Blue-Green (switch atomic, tốn 2x infra), Canary (release dần cho subset user), Feature flags (tách deploy khỏi release, instant rollback).
- **Best practices** — pipeline < 10 phút, reproducible/idempotent, branch protection, required check, secrets management, rollback ready.
- **Pitfalls** — flaky test, CI chậm, secret leak trong log, deploy nhầm environment.

:::

---

## Mục lục

- [CI vs CD vs Continuous Deployment](#ci-vs-cd-vs-continuous-deployment)
- [Platforms](#platforms)
- [GitHub Actions](#github-actions)
- [Pipeline pattern](#pipeline-pattern)
- [Deployment strategies](#deployment-strategies)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## CI vs CD vs Continuous Deployment

:::tip[Ví dụ đời thường]

Hình dung một **xưởng bánh**:

- **CI** — mẻ bột nào trộn xong cũng đem **cân, nếm, kiểm tra** ngay. Sai là biết liền, không để dồn tới cuối ngày.
- **CD (Continuous Delivery)** — bánh đạt chuẩn được **đóng gói, xếp sẵn lên xe**, chỉ chờ quản lý gật đầu là chở đi.
- **Continuous Deployment** — không cần ai gật đầu nữa: **đạt chuẩn là xe chạy thẳng ra cửa hàng**.

Khác nhau chỉ ở **cái gật đầu cuối cùng**. Bỏ được nó thì giao hàng nhanh hơn hẳn, nhưng bạn phải tin tuyệt đối vào khâu kiểm tra, vì không còn ai đứng chặn giữa lỗi và khách hàng.

:::

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

:::tip[Ví dụ đời thường]

`matrix` giống việc **thử một công thức bánh trên nhiều loại lò**: lò gas, lò điện, nồi chiên không dầu. Cùng công thức nhưng mỗi lò ra một kết quả, nên phải nướng thử hết mới dám bán.

Bạn chỉ khai báo danh sách "lò" (phiên bản runtime, hệ điều hành), GitHub tự nhân bản job ra chạy song song — khỏi phải chép tay mỗi lò một workflow giống hệt nhau.

:::

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

:::tip[Ví dụ đời thường]

Pipeline chính là **dây chuyền lắp ráp**: code đi qua từng trạm theo đúng thứ tự, trạm nào không đạt thì băng chuyền dừng, hàng lỗi không đi tiếp được.

Và cũng như nhà máy thật, người ta tăng tốc bằng hai mẹo quen thuộc:

- **Cache** — nguyên liệu hay dùng thì trữ sẵn trong kho, khỏi chạy ra chợ mua lại mỗi lần (`node_modules`).
- **Chạy song song** — sơn, kiểm tra, dán tem là ba việc không phụ thuộc nhau nên xếp ba tổ làm cùng lúc; chỉ khâu đóng thùng mới phải đợi đủ cả ba.

:::

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

:::tip[Ví dụ đời thường]

Quán của bạn muốn **đổi món mới trong thực đơn** mà khách không bực. Có mấy cách:

| Cách đổi | Ngoài đời | Cái giá phải trả |
| --- | --- | --- |
| **Rolling** | Thay dần từng bàn, quán vẫn mở bình thường | Có lúc bàn này món cũ, bàn kia món mới |
| **Blue-Green** | Dựng hẳn quán y hệt bên cạnh, xong thì chuyển bảng hiệu qua | Phải nuôi hai quán cùng lúc |
| **Canary** | Mời **vài khách** ăn thử trước, ổn mới bán đại trà | Setup rườm rà, phải ngồi theo dõi sát |

Chữ `canary` đến từ chuyện thợ mỏ mang **con chim hoàng yến** xuống hầm: chim lăn ra trước thì người còn kịp chạy. Deploy canary cũng vậy — chấp nhận 1% người dùng gặp lỗi để 99% còn lại không bị.

:::

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

:::tip[Ví dụ đời thường]

Feature flag giống **kéo sẵn dây điện tới bóng đèn nhưng chưa bật công tắc**. Thợ đi dây ban ngày, xong xuôi từ lâu; tối chỉ cần gạt công tắc là đèn sáng, thấy chói quá thì gạt xuống, tắt trong một giây.

Nhờ vậy **đưa code lên** và **cho người dùng thấy tính năng** thành hai việc tách rời: code nằm sẵn trên production cả tuần cũng không sao, muốn bật cho 5% khách trước cũng được.

Cái giá: trong nhà giờ có cả đống công tắc. Không dọn dẹp thì vài tháng sau chẳng ai nhớ cái nào còn dùng, và code phải gánh cả hai nhánh cũ lẫn mới.

:::

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

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. Phân biệt `Continuous Integration`, `Continuous Delivery` và `Continuous Deployment`. Ranh giới nằm ở bước nào?
2. CI giải quyết vấn đề gì so với cách merge code thủ công theo tuần/tháng (`integration hell`)?
3. Một pipeline điển hình gồm những stage nào, theo thứ tự nào, và vì sao lại là thứ tự đó?
4. Vì sao build phải `reproducible` và `idempotent`? Điều gì hỏng nếu chạy lại pipeline mà ra kết quả khác?
5. Trong `GitHub Actions`, phân biệt `workflow`, `job`, `step` và `runner`. Job chạy song song hay tuần tự mặc định, và `needs` dùng để làm gì?
6. Những `trigger` nào thường dùng (`push`, `pull_request`, `schedule`, `workflow_dispatch`)? Vì sao pipeline cho PR khác pipeline cho nhánh main?
7. `matrix` build dùng để làm gì? Cho một ví dụ bạn thực sự cần nó.
8. `services` trong GitHub Actions giúp gì khi integration test cần một database thật?
9. Caching trong CI (`actions/cache`, Docker layer cache) hoạt động ra sao? Cache key đặt sai dẫn tới hậu quả gì?
10. Pipeline của bạn mất 40 phút. Bạn tối ưu theo những hướng nào và ưu tiên cái gì trước?
11. Quản lý `secrets` trong CI/CD như thế nào? Vì sao secret không được xuất hiện trong log, làm sao mask nó, và PR từ fork có đọc được secret không?
12. `artifact` khác `cache` ở điểm nào? Vì sao nên build một lần rồi promote cùng một artifact qua các environment thay vì build lại ở mỗi env?
13. `branch protection` và `required status check` phục vụ mục đích gì trong quy trình?
14. So sánh rolling, `blue-green` và `canary` deploy về downtime, chi phí hạ tầng, tốc độ rollback và độ phức tạp.
15. Rolling deploy làm v1 và v2 tồn tại đồng thời. Điều đó ảnh hưởng gì tới `database migration`, và bạn thiết kế migration tương thích ngược ra sao (expand-contract)?
16. `feature flag` tách "deploy" khỏi "release" như thế nào? Nợ kỹ thuật kèm theo là gì?
17. Với `canary`, bạn dựa vào tín hiệu nào để quyết định tăng traffic hay rollback tự động?
18. Chiến lược rollback của bạn là gì khi bản vừa deploy bị hỏng? Rollback code có đủ không nếu migration đã chạy?
19. `smoke test` sau deploy kiểm tra những gì, và khác gì với test đã chạy ở bước CI?
20. Một job trong CI đỏ nhưng chạy ở local lại xanh. Bạn điều tra theo hướng nào?
21. Vì sao deploy nhầm environment là sự cố nghiêm trọng, và bạn dùng cơ chế nào để chặn (environment protection, approval gate, naming convention)?
22. Bạn đo hiệu quả của quy trình CI/CD bằng chỉ số nào? Giải thích 4 chỉ số `DORA`: deployment frequency, lead time, change failure rate, MTTR.
