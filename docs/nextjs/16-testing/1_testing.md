---
sidebar_position: 1
title: "1. Testing Next.js App"
---

# Testing Next.js App

**Testing** (kiểm thử) là việc viết các đoạn mã tự động để kiểm tra ứng dụng chạy đúng như mong đợi, giúp phát hiện lỗi trước khi đưa lên môi trường thật. Bài này hướng dẫn cách kiểm thử các thành phần đặc trưng của Next.js như Server Component, Client Component và Server Action. Với người mới, thói quen viết test giúp bạn tự tin sửa code mà không lo làm hỏng tính năng cũ.

---

## Mục lục

- [Setup Vitest](#setup-vitest)
- [Test Server Component](#test-server-component)
- [Test Client Component](#test-client-component)
- [Test Server Action](#test-server-action)
- [E2E với Playwright](#e2e-với-playwright)
- [Storybook](#storybook)

---

## Setup Vitest

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./") },
  },
});
```

```ts
// test/setup.ts
import "@testing-library/jest-dom/vitest";
```

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui"
  }
}
```

---

## Test Server Component

Server Component **async** — chưa có official test util từ React. Workaround:

**Cách 1 — Test logic riêng**:

```ts
// app/posts/page.tsx
export default async function Page() {
  const posts = await getPosts();
  return <PostList posts={posts} />;
}
```

```ts
// posts.test.ts
import { describe, it, expect, vi } from "vitest";
import { getPosts } from "@/lib/posts";

vi.mock("@/lib/db", () => ({
  db: {
    post: {
      findMany: vi.fn().mockResolvedValue([{ id: 1, title: "Hi" }]),
    },
  },
}));

describe("getPosts", () => {
  it("trả danh sách posts", async () => {
    const posts = await getPosts();
    expect(posts).toHaveLength(1);
  });
});
```

→ Test **business logic** thay vì render Server Component.

**Cách 2 — Render bằng `renderToString`** (experimental):

```ts
import { renderToString } from "react-dom/server";

const html = renderToString(await Page());
expect(html).toContain("Hi");
```

Workaround vì test framework hiện chưa support async component natively.

---

## Test Client Component

Standard React Testing Library:

```tsx
// Counter.tsx
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}
```

```ts
// Counter.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Counter } from "./Counter";

describe("Counter", () => {
  it("increment khi click", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    expect(screen.getByText("Count: 0")).toBeInTheDocument();
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Count: 1")).toBeInTheDocument();
  });
});
```

---

## Test Server Action

Test function trực tiếp:

```ts
// app/actions.ts
"use server";

export async function createPost(formData: FormData) {
  const title = formData.get("title");
  if (!title) throw new Error("Title required");
  return db.post.create({ data: { title: title as string } });
}
```

```ts
// actions.test.ts
import { describe, it, expect, vi } from "vitest";
import { createPost } from "./actions";

vi.mock("@/lib/db", () => ({
  db: { post: { create: vi.fn() } },
}));

describe("createPost", () => {
  it("throw khi thiếu title", async () => {
    const formData = new FormData();
    await expect(createPost(formData)).rejects.toThrow("Title required");
  });

  it("tạo post khi có title", async () => {
    const formData = new FormData();
    formData.append("title", "Hello");
    await createPost(formData);
    expect(db.post.create).toHaveBeenCalledWith({ data: { title: "Hello" } });
  });
});
```

---

## E2E với Playwright

```bash
npm init playwright@latest
```

Auto setup config + sample tests.

```ts
// tests/auth.spec.ts
import { test, expect } from "@playwright/test";

test("login flow", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill("user@example.com");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByText("Welcome back")).toBeVisible();
});
```

Run:

```bash
npx playwright test
npx playwright test --ui   # UI mode
npx playwright codegen      # record interaction
```

:::info[Phân tích]

**Playwright vs Cypress**:

| | Playwright | Cypress |
|--|-----------|---------|
| Vendor | Microsoft | Cypress.io |
| Multi-browser | **Chromium, Firefox, WebKit** | Chrome, Firefox, Edge |
| Parallel | Native | Cần Cypress Cloud |
| Speed | **Nhanh hơn** | Chậm hơn |
| Network mocking | Native | Native |
| Debugging | Trace viewer (cực mạnh) | Time travel |
| Mobile testing | Emulation | Emulation |
| Adoption 2026 | **Tăng** | Giảm |

Playwright được khuyến nghị hơn 2024+ — performance, multi-browser, tooling.

:::

---

## Storybook

Develop + test component **isolated**:

```bash
npx storybook@latest init
```

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "./Button";

const meta = {
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary", children: "Save" },
};

export const Disabled: Story = {
  args: { disabled: true, children: "Disabled" },
};
```

Run:

```bash
npm run storybook
```

Lợi ích:

- Develop component không cần render trong app context.
- Document API tự động từ TypeScript.
- Visual regression test (Chromatic).
- Stakeholder review UI without dev environment.

:::tip[Mẹo]

**Testing strategy cho Next.js project:**

| Layer | Tool | Mục tiêu |
|-------|------|----------|
| **Unit** | Vitest | Pure function, hook, util |
| **Component** | Vitest + RTL | Client Component logic |
| **Integration** | Vitest + MSW | API + component combined |
| **E2E** | Playwright | Critical user flow |
| **Visual** | Storybook + Chromatic | UI regression |

**Coverage target**:

- Utils: 90%+ (pure, dễ test).
- Components: 70%+ (UI, optional).
- API routes: 80%+ (logic, validation).
- E2E: 3-5 critical flow (login, checkout, signup).

Đừng cố 100% — diminishing return sau 80%. Focus test:

- Logic có **branch nhiều**.
- Code đã có bug (regression).
- Business critical (payment, auth).

:::

:::warning[Cần lưu ý]

**Server Component testing đang còn evolve**:

- React team working on official test utility.
- Workaround tạm: test logic riêng, render bằng `renderToString`.
- E2E (Playwright) thực sự test page Server Component → chạy thật.

Đợi feature stable. Hiện tại E2E + unit test cho logic riêng là pattern
phổ biến.

Lib alternative đang phát triển:

- `next/experimental/testing` — official Next.js test utility (đang work).
- `vitest-environment-nextjs` — community.

:::

:::info[Phân tích]

**Mock với MSW** (Mock Service Worker) cho test:

```bash
npm install -D msw
```

```ts
// test/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users", () => {
    return HttpResponse.json([{ id: 1, name: "An" }]);
  }),
];
```

```ts
// test/setup.ts
import { setupServer } from "msw/node";
import { handlers } from "./mocks/handlers";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

MSW intercept `fetch` ở network layer → component test mà không touch
network thật. Compat cả unit test + E2E.

:::
