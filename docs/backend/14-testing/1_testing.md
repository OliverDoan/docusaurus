---
sidebar_position: 1
title: "1. Testing Backend"
---

# Testing Backend

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
