---
sidebar_position: 1
title: "1. CI/CD: Pipelines, GitHub Actions"
---

# CI/CD: Pipelines, GitHub Actions

CI/CD là việc tự động hoá các bước build, test và deploy mỗi khi bạn push code, để không phải làm thủ công và tránh sai sót. Bài này giải thích sự khác nhau giữa CI, CD và Continuous Deployment, cách viết pipeline bằng GitHub Actions, các bước thường gặp trong pipeline và những chiến lược deploy như rolling, blue-green, canary. Nắm CI/CD giúp bạn đưa code lên sản phẩm nhanh, an toàn và lặp lại được.

[![Sơ đồ tóm tắt bài: CI/CD: Pipelines, GitHub Actions](/img/backend/cicd.webp)](pathname:///img/backend/cicd.webp)

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

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt `Continuous Integration`, `Continuous Delivery` và `Continuous Deployment`. Ranh giới nằm ở bước nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Term | Nội dung |
|---|---|
| `CI` (Continuous Integration) | Mỗi commit/PR tự động build + test, phát hiện lỗi ngay |
| `CD` (Continuous Delivery) | Bản build đạt chuẩn được đóng gói và tự deploy lên staging, production **chờ người duyệt** |
| Continuous Deployment | Pass hết test là tự deploy thẳng production, không cần ai duyệt |

Ranh giới giữa hai chữ CD nằm đúng ở **cái gật đầu cuối cùng**. Giống xưởng bánh: CI là cân và nếm từng mẻ; Continuous Delivery là bánh đã xếp sẵn lên xe chờ quản lý duyệt; Continuous Deployment là đạt chuẩn thì xe chạy thẳng ra cửa hàng.

Flow chuẩn:

```
Push code → CI (lint + test + build) → deploy staging
                                          ↓
                                     Manual approve
                                          ↓
                                    Deploy production
```

Bỏ được bước duyệt thì giao hàng nhanh hơn hẳn, nhưng đổi lại phải tin tuyệt đối vào khâu kiểm tra tự động — vì không còn ai đứng chặn giữa lỗi và khách hàng.

</details>

**2. CI giải quyết vấn đề gì so với cách merge code thủ công theo tuần/tháng (`integration hell`)?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi mỗi người ôm nhánh riêng nhiều tuần rồi mới merge, mọi thứ dồn vào một lúc: conflict chồng chất, hai người sửa cùng một module theo hai hướng, bug chỉ lộ ra khi ráp lại, và không ai biết commit nào gây ra. Đó là `integration hell` — công sức bỏ ra tăng theo cấp số nhân với thời gian nhánh sống.

CI đảo ngược điều đó bằng cách **hợp nhất liên tục, mỗi lần một chút**:

- Merge nhỏ và thường xuyên → conflict ít và dễ giải quyết.
- Build + test chạy tự động mỗi PR → bug lộ ra trong vài phút, khi tác giả còn nhớ code.
- Phạm vi nghi ngờ hẹp lại còn đúng một diff → truy nguyên nhân nhanh.
- Nhánh main luôn ở trạng thái xanh, nên lúc nào cũng có thể release.

Kèm theo `branch protection` và required check, CI còn đảm bảo không ai đẩy code chưa qua kiểm tra vào main. Cái giá là phải đầu tư cho test đủ tin cậy và pipeline đủ nhanh.

</details>

**3. Một pipeline điển hình gồm những stage nào, theo thứ tự nào, và vì sao lại là thứ tự đó?**

<details className="qa">
<summary>Xem đáp án</summary>

```
1. Checkout code
2. Setup runtime (Node, Python)
3. Cache dependency
4. Install
5. Lint
6. Type check
7. Unit test
8. Integration test (với DB)
9. Build
10. Build Docker image
11. Push image lên registry
12. Deploy
```

Thứ tự tuân theo nguyên tắc **fail fast, rẻ trước đắt sau**: lint và typecheck chạy trong vài giây, bắt được lỗi ngớ ngẩn trước khi tốn phút dựng database cho integration test. Unit test đứng trước integration test cũng vì lẽ đó.

Build đứng sau test vì không có lý do gì đóng gói một bản code đã biết là sai. Push image chỉ xảy ra khi build thành công, và deploy là bước cuối, thường kèm điều kiện chỉ chạy trên nhánh main.

Thực tế lint, typecheck và test là ba việc độc lập nên thường tách thành job chạy song song, rồi job deploy khai báo `needs` để đợi cả ba xong — vừa nhanh vừa giữ được ràng buộc thứ tự ở chỗ thực sự cần.

</details>

**4. Vì sao build phải `reproducible` và `idempotent`? Điều gì hỏng nếu chạy lại pipeline mà ra kết quả khác?**

<details className="qa">
<summary>Xem đáp án</summary>

**Reproducible** = cùng input cho cùng output. **Idempotent** = chạy lại nhiều lần không gây lỗi hay tác dụng phụ ngoài ý muốn.

Nếu không có hai tính chất đó:

- Bản chạy trên máy dev khác bản trên CI, khác bản trên production → lỗi "máy tôi chạy được" không bao giờ dứt.
- Chạy lại pipeline để retry một bước lại cho ra artifact khác → thứ bạn test không còn là thứ bạn deploy.
- Rollback mất ý nghĩa: build lại từ đúng commit cũ mà ra bản khác thì không có gì đảm bảo nó chạy được như trước.
- Điều tra sự cố bế tắc vì không tái hiện được trạng thái đã gây lỗi.

Cách giữ:

- Dùng lockfile và `npm ci` thay vì `npm install`.
- Ghim phiên bản base image, runtime, action theo tag/digest cụ thể thay vì `latest`.
- Không phụ thuộc trạng thái còn sót trên runner; mỗi lần chạy bắt đầu sạch.
- Build **một lần**, rồi promote đúng artifact đó qua các environment.

</details>

**5. Trong `GitHub Actions`, phân biệt `workflow`, `job`, `step` và `runner`. Job chạy song song hay tuần tự mặc định, và `needs` dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Workflow** — một file YAML trong `.github/workflows/`, gắn với các trigger. Là đơn vị lớn nhất.
- **Job** — một nhóm bước chạy trên **một máy riêng**. Các job không dùng chung filesystem; muốn chuyển dữ liệu phải qua artifact hoặc cache.
- **Step** — một lệnh (`run`) hoặc một action (`uses`) bên trong job, chạy tuần tự và dùng chung workspace.
- **Runner** — cỗ máy thực thi job, do GitHub cấp (`ubuntu-latest`) hoặc tự host.

Mặc định các job **chạy song song**. `needs` khai báo phụ thuộc để ép thứ tự:

```yaml
jobs:
  lint: { }
  test: { }
  build: { }
  deploy:
    needs: [lint, test, build]
```

Ba job đầu chạy cùng lúc, `deploy` chờ cả ba xanh mới bắt đầu. Đây là cách rút ngắn pipeline mà vẫn giữ ràng buộc "không deploy khi chưa test xong".

</details>

**6. Những `trigger` nào thường dùng (`push`, `pull_request`, `schedule`, `workflow_dispatch`)? Vì sao pipeline cho PR khác pipeline cho nhánh main?**

<details className="qa">
<summary>Xem đáp án</summary>

- `push` — chạy khi có commit đẩy lên nhánh được chỉ định.
- `pull_request` — chạy cho mỗi PR và mỗi lần cập nhật PR.
- `schedule` — chạy theo cron, hợp với suite đầy đủ hằng đêm, quét bảo mật, dọn dẹp.
- `workflow_dispatch` — chạy tay từ giao diện, dùng cho deploy có chủ đích hoặc rollback.
- `release` — chạy khi tạo tag/release.

PR và main khác nhau vì **mục đích khác nhau**. Pipeline PR tối ưu cho phản hồi nhanh: lint, typecheck, unit test, integration test, build thử — đủ để quyết định có merge không, và tuyệt đối không deploy. Pipeline main mới là nơi build image, push registry, deploy staging rồi production.

Còn một lý do quan trọng: PR đến từ fork bị hạn chế quyền và không được cấp secret, nên các bước cần secret (push image, deploy) không thể nằm trong pipeline PR.

</details>

**7. `matrix` build dùng để làm gì? Cho một ví dụ bạn thực sự cần nó.**

<details className="qa">
<summary>Xem đáp án</summary>

`matrix` khai báo một danh sách tổ hợp tham số, GitHub tự nhân bản job ra chạy song song cho từng tổ hợp — khỏi phải chép tay nhiều workflow gần giống nhau.

```yaml
strategy:
  matrix:
    node: [18, 20, 22]
    os: [ubuntu-latest, macos-latest]
```

Cấu hình trên sinh ra 6 job (3 phiên bản Node × 2 hệ điều hành) chạy đồng thời. Giống việc thử một công thức bánh trên nhiều loại lò: cùng công thức nhưng mỗi lò ra một kết quả.

Trường hợp thực sự cần: bạn phát hành một **thư viện npm** cam kết hỗ trợ Node 18 trở lên. Chỉ test trên Node 22 thì không phát hiện được API mới dùng nhầm khiến Node 18 gãy — matrix bắt được ngay.

Các tình huống khác: test nhiều phiên bản Postgres/Python, build binary cho nhiều nền tảng, chạy cùng bộ test trên nhiều biến thể cấu hình.

Lưu ý: số job nhân lên rất nhanh, nên giới hạn tổ hợp thật sự cần hỗ trợ để khỏi đốt runner vô ích.

</details>

**8. `services` trong GitHub Actions giúp gì khi integration test cần một database thật?**

<details className="qa">
<summary>Xem đáp án</summary>

`services` dựng sẵn các container phụ trợ chạy song song với job, và map port ra để test kết nối vào — nghĩa là bạn có Postgres/Redis thật ngay trên runner mà không cần viết script cài đặt.

```yaml
services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_PASSWORD: test
    ports: ['5432:5432']
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-retries 5
```

Rồi truyền connection string cho bước test qua biến môi trường `DATABASE_URL`.

Giá trị thực tế:

- Integration test chạy với DB **cùng loại và cùng phiên bản** production, không phải mock hay SQLite — bắt được lỗi SQL, migration, constraint.
- Container sinh ra rồi mất theo job nên mỗi lần chạy đều sạch, không dính dữ liệu cũ.
- Phần `health-cmd` quan trọng: không chờ DB sẵn sàng thì test sẽ fail ngẫu nhiên vì chạy trước lúc Postgres kịp khởi động.

Khi cần điều khiển vòng đời container tinh vi hơn, người ta dùng `Testcontainers` ngay trong test thay cho `services`.

</details>

**9. Caching trong CI (`actions/cache`, Docker layer cache) hoạt động ra sao? Cache key đặt sai dẫn tới hậu quả gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Cache lưu lại kết quả tốn thời gian để lần chạy sau dùng lại — giống trữ sẵn nguyên liệu hay dùng trong kho thay vì chạy ra chợ mỗi lần. `actions/cache` (hoặc tuỳ chọn `cache: 'npm'` của `setup-node`) lưu thư mục dependency theo một **cache key**; key trùng thì tải về, không trùng thì chạy từ đầu rồi lưu lại. Docker layer cache thì tái dùng các layer mà instruction và input chưa đổi.

Key thường được tính từ hash của lockfile, kèm OS và phiên bản runtime.

Đặt key sai gây hai kiểu hỏng ngược nhau:

- **Key quá "chặt"** (đổi liên tục, ví dụ gắn commit SHA): gần như không bao giờ hit, cache vô dụng mà vẫn tốn thời gian upload.
- **Key quá "lỏng"** (không gồm hash lockfile): cập nhật dependency rồi vẫn nhận cache cũ → CI test nhầm phiên bản, xanh ở CI mà hỏng ở production. Đây là kiểu nguy hiểm hơn hẳn vì rất khó ngờ.

Với Docker, sắp xếp Dockerfile sao cho bước copy lockfile và cài dependency nằm **trước** bước copy source code, nếu không mọi thay đổi code đều phá cache.

</details>

**10. Pipeline của bạn mất 40 phút. Bạn tối ưu theo những hướng nào và ưu tiên cái gì trước?**

<details className="qa">
<summary>Xem đáp án</summary>

Trước hết **đo**: xem thời gian từng job và từng step để tìm nút thắt, thay vì tối ưu theo cảm tính. Mục tiêu tham chiếu là dưới 10 phút.

Thứ tự ưu tiên:

1. **Cache dependency** — thường là món rẻ nhất mà ăn nhiều nhất; cài lại `node_modules` mỗi lần là lãng phí rõ ràng.
2. **Chạy song song** — tách lint, typecheck, unit test, integration test thành các job độc lập; chỉ job deploy mới `needs` cả nhóm.
3. **Fail fast** — đặt bước nhanh và rẻ lên trước để hỏng sớm thì dừng sớm.
4. **Chia nhỏ theo phạm vi** — chỉ chạy test liên quan tới phần thay đổi ở PR, để bộ đầy đủ cho nhánh main và cho lịch chạy hằng đêm.
5. **Tối ưu Docker build** — sắp xếp layer hợp lý, dùng multi-stage build, bật layer cache.
6. **Runner mạnh hơn** khi các cách trên đã cạn — tốn tiền nhưng đôi khi rẻ hơn thời gian chờ của cả team.

Song song đó, xử lý flaky test: chạy lại cả pipeline vì một test chập chờn cũng là một dạng "chậm".

</details>

**11. Quản lý `secrets` trong CI/CD như thế nào? Vì sao secret không được xuất hiện trong log, làm sao mask nó, và PR từ fork có đọc được secret không?**

<details className="qa">
<summary>Xem đáp án</summary>

Secret lưu trong kho bí mật của nền tảng (GitHub Secrets, cấp theo repo/environment/organization) và được inject vào job dưới dạng biến môi trường lúc chạy. Tuyệt đối không hardcode trong repo, kể cả repo private.

Không được để secret lọt vào log vì log CI thường ai trong tổ chức cũng đọc được, được lưu lại lâu dài và có thể bị đẩy sang công cụ bên thứ ba. Một lần lộ là phải xoay vòng lại toàn bộ khoá đó.

Cách phòng:

- Không `echo` biến môi trường, không bật chế độ debug in toàn bộ env.
- Mask thủ công khi giá trị sinh ra lúc chạy:
  ```yaml
  - run: echo "::add-mask::$SECRET"
  ```
- Kiểm tra lại log sau khi chạy, đặc biệt với các bước mới thêm.
- Cấp quyền tối thiểu và ưu tiên credential ngắn hạn (OIDC) thay vì khoá tĩnh dài hạn.

Về fork: PR từ fork **không** được cấp secret, và token chỉ có quyền đọc — chính là để người lạ không thể gửi PR chứa script in secret ra ngoài. Hệ quả thực tế: mọi bước cần secret phải nằm ở workflow chạy sau khi merge.

</details>

**12. `artifact` khác `cache` ở điểm nào? Vì sao nên build một lần rồi promote cùng một artifact qua các environment thay vì build lại ở mỗi env?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `cache` | `artifact` |
|---|---|---|
| Mục đích | Tăng tốc, tái dùng thứ tốn công tạo lại | Lưu **kết quả** để job/bước sau dùng hoặc để tải về |
| Tính đúng đắn | Mất cache thì chỉ chậm hơn, kết quả không đổi | Mất artifact thì luồng gãy — nó là dữ liệu thật |
| Vòng đời | Bị thu hồi theo dung lượng, không đảm bảo còn | Giữ theo thời hạn lưu trữ đã cấu hình |

Vì các job chạy trên máy riêng, artifact (hoặc Docker image trong registry) là cách chuyển kết quả build sang job deploy.

Build một lần rồi promote qua staging → production quan trọng vì:

- Thứ bạn test **chính xác** là thứ bạn deploy; build lại có thể ra khác do dependency trôi, base image đổi, hay biến môi trường build khác.
- Tiết kiệm thời gian và chi phí, mỗi lần promote chỉ là đổi tag/tham chiếu.
- Rollback đơn giản: trỏ lại image cũ vẫn còn nguyên trong registry.
- Truy vết rõ ràng: một image digest ứng với một commit, đi suốt các môi trường.

Khác biệt giữa các môi trường nên nằm ở **cấu hình lúc chạy**, không nằm trong artifact.

</details>

**13. `branch protection` và `required status check` phục vụ mục đích gì trong quy trình?**

<details className="qa">
<summary>Xem đáp án</summary>

Chúng biến các quy ước "mọi người nhớ làm nhé" thành ràng buộc kỹ thuật mà công cụ tự thực thi.

`branch protection` bảo vệ nhánh quan trọng (thường là main):

- Chặn push thẳng, buộc mọi thay đổi đi qua PR.
- Yêu cầu số lượt review tối thiểu, có thể yêu cầu code owner duyệt.
- Chặn force push và xoá nhánh, giữ lịch sử không bị viết lại.

`required status check` quy định PR phải có những job CI nào xanh mới được merge, và thường kèm yêu cầu nhánh phải cập nhật với main trước khi merge — để tránh trường hợp hai PR riêng lẻ đều xanh nhưng ghép lại thì hỏng.

Giá trị mang lại: main luôn ở trạng thái có thể release, chất lượng không phụ thuộc vào việc ai đó có nhớ chạy test hay không, và có dấu vết rõ ràng cho audit. Cái giá là phải giữ CI nhanh và ổn định — nếu CI hay đỏ vì flaky test, ràng buộc này sẽ nhanh chóng bị kêu ca và bị xin ngoại lệ.

</details>

**14. So sánh rolling, `blue-green` và `canary` deploy về downtime, chi phí hạ tầng, tốc độ rollback và độ phức tạp.**

<details className="qa">
<summary>Xem đáp án</summary>

| | Rolling | `Blue-Green` | `Canary` |
|---|---|---|---|
| Downtime | Không | Không | Không |
| Hạ tầng | Như cũ | Gấp đôi trong lúc chuyển | Như cũ, cần định tuyến theo tỉ lệ |
| Rollback | Chậm, phải cuốn ngược từng instance | Nhanh nhất, chuyển traffic về môi trường cũ | Nhanh, chỉ cần kéo tỉ lệ về 0 |
| Mix version | Có, trong suốt quá trình | Gần như không | Có, theo chủ đích |
| Phức tạp | Thấp | Trung bình | Cao, cần metric và tự động hoá |
| Phát hiện lỗi | Sau khi đã lan | Sau khi đã chuyển toàn bộ | Sớm, chỉ ảnh hưởng một phần nhỏ |

Rolling thay dần từng instance, hợp với đa số dự án nhỏ và vừa; PaaS như Vercel, Fly.io làm sẵn. Blue-green dựng hẳn môi trường song song rồi chuyển bảng hiệu một phát. Canary mời vài phần trăm khách "ăn thử" trước — tên gọi đến từ chuyện thợ mỏ mang chim hoàng yến xuống hầm.

Theo quy mô đội: solo/startup dùng rolling; 5-20 dev dùng blue-green kèm duyệt tay; từ 20 dev trở lên mới đáng đầu tư canary cộng feature flag, thường qua service mesh hoặc Argo Rollouts.

</details>

**15. Rolling deploy làm v1 và v2 tồn tại đồng thời. Điều đó ảnh hưởng gì tới `database migration`, và bạn thiết kế migration tương thích ngược ra sao (expand-contract)?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong lúc cuốn, v1 và v2 cùng nói chuyện với **một database**. Nên mọi migration phá vỡ tương thích — đổi tên cột, xoá cột, thêm cột `NOT NULL` không default — sẽ làm instance phiên bản kia lỗi ngay. Rollback càng nguy hiểm hơn, vì schema đã tiến mà code lại lùi.

`Expand-contract` chia migration thành ba giai đoạn tách rời nhau theo thời gian:

- **Expand** — chỉ thêm, không phá: thêm cột mới cho phép NULL, thêm bảng mới. Cả v1 lẫn v2 đều chạy được.
- **Migrate** — deploy code ghi vào **cả** chỗ cũ lẫn chỗ mới, đồng thời backfill dữ liệu cũ. Code đọc dần chuyển sang chỗ mới.
- **Contract** — khi không còn phiên bản nào dùng cột cũ, mới xoá nó ở một lần release sau.

Nguyên tắc kèm theo:

- Tách bước chạy migration khỏi bước deploy code, và luôn để migration chạy trước ở trạng thái tương thích ngược.
- Tránh khoá bảng lâu trên bảng lớn; thêm index ở chế độ concurrent nếu DB hỗ trợ.
- Đổi tên = thêm mới + copy + xoá sau, không bao giờ đổi tên trực tiếp.

</details>

**16. `feature flag` tách "deploy" khỏi "release" như thế nào? Nợ kỹ thuật kèm theo là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Code mới được đưa lên production nhưng nằm sau một công tắc:

```ts
if (featureFlag.isEnabled("new-checkout", userId)) {
  return newCheckoutFlow();
} else {
  return oldCheckoutFlow();
}
```

Giống kéo sẵn dây điện tới bóng đèn nhưng chưa bật công tắc. Nhờ vậy **deploy** (code lên máy chủ) và **release** (người dùng thấy tính năng) thành hai việc độc lập:

- Merge sớm, nhánh sống ngắn, tránh conflict lớn.
- Bật cho 5% khách trước, bật riêng cho nội bộ, hoặc chạy A/B test.
- Rollback tức thì bằng cách gạt công tắc xuống, không cần deploy lại.

Nợ kỹ thuật:

- Mỗi flag nhân đôi số nhánh cần test; vài flag là số tổ hợp đã bùng nổ.
- Không dọn dẹp thì vài tháng sau không ai nhớ flag nào còn dùng, code gánh cả logic cũ lẫn mới.
- Bản thân hệ thống flag thành một điểm phụ thuộc: nó chết thì ứng dụng ứng xử ra sao?

Cách kiểm soát: đặt hạn dùng cho mỗi flag, có người chịu trách nhiệm, và coi việc xoá flag là một phần của định nghĩa "xong". Dịch vụ phổ biến: LaunchDarkly, Flagsmith, PostHog, ConfigCat.

</details>

**17. Với `canary`, bạn dựa vào tín hiệu nào để quyết định tăng traffic hay rollback tự động?**

<details className="qa">
<summary>Xem đáp án</summary>

So sánh nhóm canary với nhóm chạy bản cũ **trong cùng khoảng thời gian** — so với số liệu hôm qua rất dễ nhầm vì tải và hành vi người dùng khác nhau.

Tín hiệu kỹ thuật:

- Error rate (`5xx`, exception) — tăng là lý do rollback rõ ràng nhất.
- Latency `p95`/`p99`, không nhìn trung bình.
- Saturation: CPU, memory, connection pool, độ trễ hàng đợi.
- Log lỗi mới xuất hiện, cảnh báo từ Sentry.

Tín hiệu nghiệp vụ (thường quan trọng hơn mà hay bị bỏ): tỉ lệ checkout thành công, tỉ lệ đăng nhập được, doanh thu trên mỗi phiên. Có những bug không sinh ra lỗi HTTP nào cả mà vẫn làm sập doanh thu.

Cách vận hành:

- Tăng theo nấc, mỗi nấc giữ đủ lâu để thu được lượng mẫu có ý nghĩa (1% → 10% → 50% → 100%).
- Đặt ngưỡng tự động rollback ngay từ đầu, và mặc định nghi ngờ bản mới khi số liệu xấu.
- Chuẩn bị sẵn đường lùi; công cụ như Argo Rollouts hay service mesh làm tự động việc phân tích này.

</details>

**18. Chiến lược rollback của bạn là gì khi bản vừa deploy bị hỏng? Rollback code có đủ không nếu migration đã chạy?**

<details className="qa">
<summary>Xem đáp án</summary>

Ưu tiên **khôi phục dịch vụ trước, điều tra sau**:

1. Nếu tính năng nằm sau `feature flag` → tắt flag, xong trong vài giây.
2. Nếu không → chuyển traffic về bản trước: đổi lại tag image, hạ tỉ lệ canary về 0, hoặc chuyển ngược blue-green.
3. Giữ lại log, metric và một bản trace để điều tra sau khi hệ thống đã ổn.

Rollback code **không** đủ khi migration đã chạy. Schema đã tiến lên mà code lùi lại thì bản cũ có thể gãy ngay (cột bị xoá, kiểu dữ liệu đổi), thậm chí dữ liệu mới ghi theo cấu trúc mới sẽ không đọc được bằng code cũ. Đảo ngược migration lại càng rủi ro vì có thể mất dữ liệu.

Vì thế nguyên tắc là làm migration **tương thích ngược** theo `expand-contract`: ở mọi thời điểm, cả phiên bản code trước và sau đều chạy được với schema hiện tại. Khi đó rollback code luôn an toàn, và bước xoá cột cũ chỉ thực hiện sau khi chắc chắn không còn ai dùng.

Cuối cùng, rollback phải được **tập dượt** — biện pháp chưa từng thử thì không tính là có.

</details>

**19. `smoke test` sau deploy kiểm tra những gì, và khác gì với test đã chạy ở bước CI?**

<details className="qa">
<summary>Xem đáp án</summary>

`Smoke test` là một tập rất nhỏ các kiểm tra chạy **trên chính môi trường vừa deploy**, trả lời câu hỏi "hệ thống có sống và có phục vụ được không": health check trả 200, kết nối được database và cache, đăng nhập được, một luồng đọc chính hoạt động, phiên bản đang chạy đúng là bản vừa deploy.

Khác biệt với test ở CI:

- CI chạy trên runner với dữ liệu giả và cấu hình test; smoke test chạy với **hạ tầng thật**, secret thật, biến môi trường thật, DNS và load balancer thật.
- CI bắt bug logic; smoke test bắt bug triển khai: thiếu biến môi trường, migration chưa chạy, credential hết hạn, service phụ thuộc chưa sẵn sàng, cấu hình trỏ nhầm.
- CI chạy hàng trăm case trong nhiều phút; smoke test chỉ vài case, xong trong vài chục giây vì nó nằm trên đường găng của việc deploy.

Nên để smoke test tự động chạy ngay sau mỗi lần deploy và tự kích hoạt rollback khi đỏ. Trên production, dùng tài khoản và dữ liệu test riêng để không làm bẩn dữ liệu thật.

</details>

**20. Một job trong CI đỏ nhưng chạy ở local lại xanh. Bạn điều tra theo hướng nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Đi theo danh sách khác biệt giữa hai môi trường, từ khả năng cao xuống thấp:

- **Dependency** — local còn `node_modules` cũ; CI cài sạch từ lockfile. Thử xoá sạch rồi cài lại bằng `npm ci` ở local.
- **Biến môi trường** — local có file `.env`, CI thì không; hoặc CI thiếu secret nên rơi vào nhánh lỗi.
- **Trạng thái database** — local có sẵn dữ liệu từ lần chạy trước che mất lỗi; CI luôn bắt đầu rỗng, nên test phụ thuộc dữ liệu cũ sẽ lộ ra.
- **Thứ tự và tính song song** — CI chạy toàn bộ suite, có thể song song; local hay chạy lẻ một file. Thử chạy cả suite và đổi thứ tự.
- **Khác biệt nền tảng** — hệ điều hành, phiên bản runtime, múi giờ, locale, phân biệt hoa thường trong tên file (macOS dễ dãi, Linux thì không).
- **Timing** — runner CI yếu hơn nên timeout chạm ngưỡng, race condition lộ ra. Đây thường là dấu hiệu test flaky chứ không phải lỗi hạ tầng.
- **Cache CI** — key sai khiến job dùng dependency cũ.

Công cụ hỗ trợ: bật log chi tiết, upload artifact khi fail, và nếu cần thì mở phiên debug ngay trên runner.

</details>

**21. Vì sao deploy nhầm environment là sự cố nghiêm trọng, và bạn dùng cơ chế nào để chặn (environment protection, approval gate, naming convention)?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì hậu quả chạm thẳng vào dữ liệu thật và khách hàng thật: code chưa kiểm thử chạy trên production, migration thử nghiệm chạy trên database thật, job nền gửi email hay trừ tiền thật, và trong nhiều trường hợp không có đường hoàn tác. Chiều ngược lại cũng tệ: cấu hình production lọt xuống staging làm lộ dữ liệu thật cho môi trường có ít kiểm soát hơn.

Các lớp phòng vệ nên xếp chồng lên nhau:

- **Environment protection** — mỗi môi trường là một thực thể riêng, có secret riêng, giới hạn nhánh nào được deploy vào đó (chỉ main mới được chạm production).
- **Approval gate** — production yêu cầu người có thẩm quyền duyệt trước khi job chạy.
- **Naming convention rõ ràng** — tên cluster, database, project, tài khoản cloud phân biệt không thể nhầm; tránh viết tắt na ná nhau.
- **Điều kiện trong workflow** — dùng `if` để chốt nhánh và loại sự kiện thay vì dựa vào người vận hành chọn đúng.
- **Không dùng credential dài hạn có quyền trên nhiều môi trường**; mỗi môi trường một danh tính riêng, quyền tối thiểu.
- **Smoke test và cảnh báo ngay sau deploy** để phát hiện sớm nếu vẫn lọt.

</details>

**22. Bạn đo hiệu quả của quy trình CI/CD bằng chỉ số nào? Giải thích 4 chỉ số `DORA`: deployment frequency, lead time, change failure rate, MTTR.**

<details className="qa">
<summary>Xem đáp án</summary>

Bốn chỉ số `DORA` chia thành hai cặp bổ khuyết cho nhau:

**Về tốc độ:**

- **Deployment frequency** — tần suất đưa thay đổi lên production. Cao nghĩa là lô hàng nhỏ, rủi ro mỗi lần thấp.
- **Lead time for changes** — thời gian từ lúc commit tới lúc chạy trên production. Phản ánh độ trơn của toàn bộ đường ống, gồm cả thời gian chờ review và chờ duyệt.

**Về độ ổn định:**

- **Change failure rate** — tỉ lệ lần deploy gây sự cố phải hotfix hoặc rollback.
- **MTTR** (mean time to restore) — trung bình bao lâu để khôi phục dịch vụ sau sự cố.

Phải nhìn cả bốn cùng lúc: đẩy tần suất lên mà change failure rate tăng vọt thì không phải cải tiến. Ngược lại, đội mạnh thường tốt ở cả bốn, vì lô nhỏ vừa dễ test vừa dễ rollback.

Chỉ số vận hành nên theo dõi kèm: thời gian chạy pipeline (mục tiêu dưới 10 phút), tỉ lệ job đỏ vì flaky test, thời gian chờ review. Lưu ý dùng chúng để cải tiến quy trình, đừng biến thành chỉ tiêu chấm điểm cá nhân.

</details>
