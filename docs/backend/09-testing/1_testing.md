---
sidebar_position: 1
title: "1. Testing Backend"
---

# Testing Backend

Testing là viết code để tự động kiểm tra xem code chính của bạn có chạy đúng hay không, thay vì phải bấm thử bằng tay mỗi lần. Bài này đi qua tháp testing (unit, integration, E2E), cách test hàm thuần, test API kèm database, test luồng người dùng đầy đủ, load test và phương pháp TDD. Có test tốt giúp bạn sửa code mà không sợ làm hỏng chỗ khác, và yên tâm hơn mỗi khi deploy.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Testing Pyramid** — nhiều `Unit test` (nhanh, rẻ, test pure function), vừa `Integration test` (API + DB thật), ít `E2E test` (< 10 flow critical).
- **Unit test** không touch DB/network — mock external dependency (vd `vi.mock`); Integration test dùng DB thật qua Docker Compose / `Testcontainers` / Supertest.
- **`E2E`** test full stack — `Playwright` cho web, hoặc API-only test chạy trọn flow (signup → cart → checkout → verify DB).
- **Load testing** với `k6` (hoặc Artillery/Locust/Gatling) — đo throughput, latency p50/p95/p99, error rate; các pattern smoke/load/stress/spike/soak.
- ⭐ **`TDD`** = Red-Green-Refactor (viết test fail trước, code cho pass, rồi refactor) — không dogmatic, mục tiêu là **code có test**.
- **Coverage target 70-80% overall** — tập trung critical path + business logic + edge case; 100% coverage không đáng chase.

:::

---

## Mục lục

- [Testing Pyramid](#testing-pyramid)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [E2E Testing](#e2e-testing)
- [Load Testing](#load-testing)
- [TDD](#tdd)

---

## Testing Pyramid

```
        /\
       /E2E\          ít, slow, expensive — critical user flow
      /------\
     / Integ. \       trung bình, cover service + DB
    /----------\
   /    Unit    \     nhiều, fast, cheap — function logic
  /--------------\
```

:::tip[Ví dụ đời thường]

Nghĩ như **kiểm tra một chiếc xe trước khi giao cho khách**:

- **Unit test** — vặn thử từng con ốc, bóp thử cái còi. Nhanh, làm được hàng trăm lần trong một phút, hỏng chỗ nào biết ngay chỗ đó.
- **Integration test** — lắp cụm phanh vào bánh rồi đạp thử. Chậm hơn, nhưng bắt được lỗi kiểu "từng món đều tốt mà ráp vào lại không ăn khớp".
- **E2E test** — lái nguyên chiếc xe một vòng quanh phố. Giống thật nhất nhưng lâu, và khi xe chết máy giữa đường bạn vẫn phải mò xem hỏng ở đâu.

Vì vậy tháp mới có hình tam giác: vặn ốc thì làm thật nhiều, còn lái thử cả vòng chỉ làm với vài kịch bản quan trọng nhất.

:::

| Layer | Mục tiêu | Tốc độ | Số lượng |
|-------|---------|--------|---------|
| **Unit** | Pure function, util | ms | Hàng trăm |
| **Integration** | API + DB + service | seconds | Hàng chục |
| **E2E** | Full user flow | tens of seconds | < 10 critical |

---

## Unit Testing

Test **pure function**, không touch DB/network.

```ts
// utils/price.ts
export function calculateTotal(items: Item[], discountPct: number): number {
  const subtotal = items.reduce((sum, i) => sum + i.price, 0);
  return subtotal * (1 - discountPct / 100);
}
```

```ts
// utils/price.test.ts (Vitest)
import { describe, it, expect } from "vitest";
import { calculateTotal } from "./price";

describe("calculateTotal", () => {
  it("no discount", () => {
    const items = [{ price: 100 }, { price: 200 }];
    expect(calculateTotal(items, 0)).toBe(300);
  });

  it("10% discount", () => {
    const items = [{ price: 100 }];
    expect(calculateTotal(items, 10)).toBe(90);
  });

  it("empty items", () => {
    expect(calculateTotal([], 10)).toBe(0);
  });
});
```

**Mock external dependency**:

:::tip[Ví dụ đời thường]

Mock giống **ma-nơ-canh trong tiệm may**. Bạn muốn thử cái áo vừa may nhưng không thể lôi khách tới mỗi lần sửa một đường chỉ — nên bạn khoác lên con ma-nơ-canh có số đo y hệt.

Ở đây "khách" là database, là API thanh toán, là dịch vụ gửi email — những thứ chậm, tốn tiền, hoặc lúc có lúc không. Bạn thay chúng bằng bản giả **luôn trả về đúng thứ bạn quy định**, để test chỉ còn soi đúng phần logic mình viết.

Cái giá: ma-nơ-canh không phải người thật. Đối tác đổi kiểu trả về mà mock của bạn vẫn "vừa như in" thì test vẫn xanh, trong khi production đã gãy.

:::

```ts
import { vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: vi.fn() },
  },
}));

it("returns user when found", async () => {
  vi.mocked(db.user.findUnique).mockResolvedValue({ id: 1, name: "An" });
  const result = await getUser(1);
  expect(result.name).toBe("An");
});
```

---

## Integration Testing

Test **multiple component + real DB**.

:::tip[Ví dụ đời thường]

Đây là lúc bạn **ráp cụm phanh vào bánh rồi đạp thử**, thay vì chỉ ngắm từng con ốc: code service, câu query và cái bảng trong DB cùng làm việc thật.

Còn `Testcontainers` giống **thuê một cái bếp tạm để nấu thử**: trước mỗi đợt test dựng lên một database mới toanh, test xong đập bỏ. Nhờ vậy không ai sợ làm bẩn dữ liệu của người khác, và máy bạn với máy CI đều nấu trong cùng một cái bếp.

Cái giá: dựng bếp mất vài chục giây, nên loại test này không thể chạy mỗi lần bạn bấm `Ctrl+S` như unit test.

:::

```ts
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { db } from "@/lib/db";
import { createUser, getUser } from "@/services/user";

describe("User service integration", () => {
  beforeAll(async () => {
    await db.$executeRaw`TRUNCATE users`;
  });

  it("create and retrieve user", async () => {
    const created = await createUser({ name: "An", email: "an@example.com" });
    expect(created.id).toBeDefined();

    const fetched = await getUser(created.id);
    expect(fetched.name).toBe("An");
  });
});
```

**Test database** options:

- **Docker compose** — spin up Postgres test container.
- **Testcontainers** — Node lib, spin up DB per test suite.
- **In-memory SQLite** — fast nhưng khác Postgres behavior.
- **Production schema** clone với truncate.

```ts
// Testcontainers
import { PostgreSqlContainer } from "@testcontainers/postgresql";

let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  container = await new PostgreSqlContainer().start();
  process.env.DATABASE_URL = container.getConnectionUri();
  await migrate();
}, 60_000);

afterAll(async () => {
  await container.stop();
});
```

**API integration** với Supertest:

```ts
import request from "supertest";
import { app } from "@/app";

it("POST /users creates user", async () => {
  const res = await request(app)
    .post("/users")
    .send({ name: "An", email: "an@example.com" })
    .expect(201);

  expect(res.body.id).toBeDefined();
});
```

---

## E2E Testing

Test **full stack** — UI, API, DB, third-party.

**Playwright** (web app):

```ts
import { test, expect } from "@playwright/test";

test("user signup flow", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign up" }).click();

  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByText("Welcome")).toBeVisible();
});
```

**API-only E2E**:

```ts
it("complete order flow", async () => {
  // Signup
  const { body: { token } } = await request(app)
    .post("/auth/signup")
    .send({ email, password });

  // Add to cart
  await request(app)
    .post("/cart/items")
    .set("Authorization", `Bearer ${token}`)
    .send({ productId, qty: 2 });

  // Checkout
  const checkout = await request(app)
    .post("/checkout")
    .set("Authorization", `Bearer ${token}`)
    .send({ paymentMethod: "card_test" });

  expect(checkout.status).toBe(201);
  expect(checkout.body.orderId).toBeDefined();

  // Verify DB
  const order = await db.order.findUnique({ where: { id: checkout.body.orderId } });
  expect(order.status).toBe("pending");
});
```

---

## Load Testing

Test **performance under load** — bao nhiêu user concurrent?

:::tip[Ví dụ đời thường]

Cầu mới xây xong không ai cho xe cộ chạy vào ngay — người ta **cho đoàn xe tải chở đá chạy lên trước** rồi đo xem cầu võng bao nhiêu. Load test là đúng việc đó với server của bạn.

Và thứ cần đo không phải "trung bình có nhanh không", mà là **những người xui nhất**:

- `p50` — một nửa số khách được phục vụ nhanh hơn mức này.
- `p95`, `p99` — 5% và 1% khách chậm nhất phải chờ bao lâu.

Trung bình 200ms nghe rất đẹp, nhưng nếu `p99` là 8 giây thì cứ 100 người lại có 1 người ngồi nhìn màn hình xoay rồi bỏ đi. Mục tiêu của load test là **biết trước điểm gãy**, thay vì để khách phát hiện hộ.

:::

**k6** (modern):

```js
// load-test.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 100 },   // ramp up
    { duration: "1m", target: 100 },     // hold
    { duration: "30s", target: 0 },      // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],   // 95% < 500ms
    http_req_failed: ["rate<0.01"],     // < 1% error
  },
};

export default function () {
  const res = http.get("https://api.example.com/users");
  check(res, { "status is 200": (r) => r.status === 200 });
  sleep(1);
}
```

```bash
k6 run load-test.js
```

**Alternative**:

- **Artillery** — Node-based, YAML config.
- **Locust** — Python, distributed.
- **Gatling** — JVM, mature.
- **JMeter** — GUI, enterprise.

:::info[Phân tích]

**Load testing metrics quan trọng**:

- **Throughput** — request/second sustainable.
- **Latency** — p50, p95, p99 (median, tail).
- **Error rate** — % request fail.
- **Saturation** — CPU, memory, DB connection.

**Pattern test**:

1. **Smoke** — vài user, verify basic work.
2. **Load** — typical user count, sustained.
3. **Stress** — push past capacity, find break point.
4. **Spike** — burst sudden user.
5. **Soak** — long duration, find memory leak.

Goal: **biết hệ thống chịu được bao nhiêu** trước khi user thấy degradation.
Plan scale accordingly.

:::

---

## TDD

**Test-Driven Development** — viết test trước, code sau.

:::tip[Ví dụ đời thường]

Giống việc **chốt tiêu chí nghiệm thu trước khi thợ bắt đầu xây**. Chủ nhà nói rõ: tường phải thẳng, đổ nước không đọng, bật công tắc là đèn sáng — rồi thợ mới làm, làm xong đo lại đúng những tiêu chí đó.

- **RED** — viết ra tiêu chí, đo thử: tất nhiên trượt, vì chưa xây gì.
- **GREEN** — xây vừa đủ để đo là đạt.
- **REFACTOR** — dọn dẹp cho gọn, đo lại vẫn đạt.

Cái lợi thật nằm ở chỗ: viết tiêu chí trước buộc bạn nghĩ xong "thứ này dùng thế nào" rồi mới lao vào code. Còn khi chính bạn cũng chưa biết mình đang xây cái gì thì đừng ép TDD — đặt tiêu chí cho thứ chưa hình dung ra chỉ tổ mất công.

:::

Loop **Red-Green-Refactor**:

```
1. RED — viết test fail (chưa có code).
2. GREEN — code minimum để pass test.
3. REFACTOR — clean code, test vẫn pass.
```

Example:

```ts
// 1. RED — test fail
it("formats currency VND", () => {
  expect(formatVND(1000)).toBe("1.000 ₫");
});
// Run → fail (formatVND chưa tồn tại)

// 2. GREEN — minimum code
export function formatVND(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n) + " ₫";
}
// Run → pass

// 3. REFACTOR — improve nếu cần, test vẫn pass.
```

:::tip[Mẹo]

**Khi nào TDD work tốt**:

- ✅ Pure function với input/output rõ.
- ✅ Bug fix — viết test reproduce trước, fix sau.
- ✅ Refactor — test là safety net.
- ❌ Exploration code — chưa biết shape final.
- ❌ UI design — visual hard to assert.

Đừng **dogmatic** — TDD là tool, không phải religion. Pattern phổ biến
hơn:

```
1. Sketch code (no test).
2. Verify works.
3. Add test sau khi shape ổn định.
4. Refactor với test bảo vệ.
```

Goal: **code có test**, không phải "test trước hay sau".

:::

:::info[Phân tích]

**Coverage target backend 2026**:

| Layer | Target |
|-------|--------|
| **Utility / pure function** | 90%+ |
| **Service / business logic** | 80%+ |
| **API endpoint** | 70%+ |
| **Database layer** | 60%+ (integration test cover) |
| **Overall** | 70-80% |

100% coverage **không đáng** chase — diminishing return:

- Sau 80%, mỗi % thêm tốn 2-3x effort.
- Code generated, boilerplate không cần test.
- Type checking đã cover phần lớn type bug.

Focus test **critical path + business logic + edge case**. Không cần
test getter/setter, simple mapping.

Tool đo coverage:

- **Vitest** built-in (`--coverage`).
- **Istanbul** — Node ecosystem.
- **Coveralls**, **Codecov** — CI dashboard.

:::
