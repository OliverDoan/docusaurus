---
sidebar_position: 1
title: "1. Testing"
---

# Testing


---

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Nội dung](#nội-dung)
- [1. Jest Setup cho Next.js](#1-jest-setup-cho-nextjs)
- [2. React Testing Library](#2-react-testing-library)
- [3. Testing Server Components](#3-testing-server-components)
- [4. Testing Client Components](#4-testing-client-components)
- [5. Testing Route Handlers](#5-testing-route-handlers)
- [6. Playwright cho E2E Testing](#6-playwright-cho-e2e-testing)
- [7. Test Organization va Best Practices](#7-test-organization-va-best-practices)
- [8. Coverage Reporting](#8-coverage-reporting)
- [9. Lỗi thường gặp](#9-lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Giới thiệu

Testing (kiểm thử) là một phần **cực kỳ quan trọng** trong quy trình phát triển phần mềm. Trong Next.js, chúng ta cần test nhiều loại thành phần khác nhau:

- **Server Components** - render trên server
- **Client Components** - render trên trình duyệt
- **Route Handlers** - các API endpoint
- **Middleware** - logic xử lý request
- **E2E flows** - luồng người dùng từ đầu đến cuối

Next.js hỗ trợ tốt cho 3 công cụ testing chính:

| Công cụ | Loại test | Mục đích |
|---------|-----------|----------|
| Jest | Unit / Integration | Test logic, components riêng lẻ |
| React Testing Library | Component | Test behavior của UI |
| Playwright | E2E | Test toàn bộ luồng người dùng |

---

## Nội dung

1. [Jest Setup cho Next.js](#1-jest-setup-cho-nextjs)
2. [React Testing Library](#2-react-testing-library)
3. [Testing Server Components](#3-testing-server-components)
4. [Testing Client Components](#4-testing-client-components)
5. [Testing Route Handlers](#5-testing-route-handlers)
6. [Playwright cho E2E Testing](#6-playwright-cho-e2e-testing)
7. [Test Organization va Best Practices](#7-test-organization-va-best-practices)
8. [Coverage Reporting](#8-coverage-reporting)
9. [Lỗi thường gặp](#9-loi-thuong-gap)
10. [Câu hỏi phỏng vấn](#cau-hoi-phong-van)

---

## 1. Jest Setup cho Next.js

### 1.1 Cai dat dependencies

Next.js cung cấp package `next/jest` giúp cấu hình Jest cực kỳ đơn giản:

```bash
# Cài đặt Jest và các thư viện liên quan
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### 1.2 Cau hinh Jest voi next/jest

Tạo file `jest.config.ts` ở thư mục gốc:

```tsx
// jest.config.ts
import type { Config } from "jest";
import nextJest from "next/jest";

// next/jest tự động cấu hình transform, module mapping, v.v.
const createJestConfig = nextJest({
  // Trỏ đến thư mục chứa next.config.js
  dir: "./",
});

const config: Config = {
  // Sử dụng jsdom để giả lập DOM trong test
  testEnvironment: "jsdom",

  // Setup file chạy trước mỗi test
  setupFilesAfterSetup: ["<rootDir>/jest.setup.ts"],

  // Chỉ test các file có đuôi .test.ts hoặc .test.tsx
  testMatch: ["**/__tests__/**/*.(test|spec).(ts|tsx)"],

  // Bỏ qua thư mục node_modules và .next
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],

  // Module aliases phải khớp với tsconfig paths
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

// next/jest sẽ merge config của bạn với config mặc định
export default createJestConfig(config);
```

### 1.3 Setup file

Tạo `jest.setup.ts`:

```tsx
// jest.setup.ts
// Import matchers bổ sung từ jest-dom
// Giúp bạn dùng các assertion như toBeInTheDocument(), toHaveTextContent()
import "@testing-library/jest-dom";
```

### 1.4 Them script vao package.json

```bash
# Trong package.json, thêm scripts:
# "test": "jest",
# "test:watch": "jest --watch",
# "test:coverage": "jest --coverage"
```

Chạy thử:

```bash
npm test
```

---

## 2. React Testing Library

React Testing Library (RTL) giúp test components theo cách **người dùng thực sự tương tác** - không test implementation details.

### 2.1 Render Components

```tsx
// components/Greeting.tsx
interface GreetingProps {
  name: string;
}

export function Greeting({ name }: GreetingProps) {
  return <h1>Xin chao, {name}!</h1>;
}
```

```tsx
// __tests__/Greeting.test.tsx
import { render, screen } from "@testing-library/react";
import { Greeting } from "@/components/Greeting";

describe("Greeting component", () => {
  it("hien thi ten nguoi dung", () => {
    // Render component
    render(<Greeting name="Thuan" />);

    // Tìm element chứa text mong muốn
    const heading = screen.getByRole("heading", { level: 1 });

    // Kiểm tra nội dung
    expect(heading).toHaveTextContent("Xin chao, Thuan!");
  });

  it("render dung vai tro heading", () => {
    render(<Greeting name="An" />);

    // getByRole tìm theo accessibility role
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });
});
```

### 2.2 User Events

`@testing-library/user-event` giả lập hành vi người dùng chính xác hơn `fireEvent`:

```tsx
// components/Counter.tsx
"use client";
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p data-testid="count">So dem: {count}</p>
      <button onClick={() => setCount((prev) => prev + 1)}>Tang</button>
      <button onClick={() => setCount((prev) => prev - 1)}>Giam</button>
    </div>
  );
}
```

```tsx
// __tests__/Counter.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Counter } from "@/components/Counter";

describe("Counter component", () => {
  it("tang so dem khi nhan nut Tang", async () => {
    // Khởi tạo user event instance
    const user = userEvent.setup();
    render(<Counter />);

    // Click nút "Tang"
    await user.click(screen.getByRole("button", { name: "Tang" }));

    // Kiểm tra giá trị đã tăng
    expect(screen.getByTestId("count")).toHaveTextContent("So dem: 1");
  });

  it("giam so dem khi nhan nut Giam", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole("button", { name: "Giam" }));

    expect(screen.getByTestId("count")).toHaveTextContent("So dem: -1");
  });

  it("tang va giam nhieu lan", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    // Click Tang 3 lần
    await user.click(screen.getByRole("button", { name: "Tang" }));
    await user.click(screen.getByRole("button", { name: "Tang" }));
    await user.click(screen.getByRole("button", { name: "Tang" }));

    // Click Giam 1 lần
    await user.click(screen.getByRole("button", { name: "Giam" }));

    // 3 - 1 = 2
    expect(screen.getByTestId("count")).toHaveTextContent("So dem: 2");
  });
});
```

### 2.3 Async Testing

Test các component có side effects bất đồng bộ:

```tsx
// components/UserProfile.tsx
"use client";
import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
}

export function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (!res.ok) throw new Error("Khong tim thay nguoi dung");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId]);

  if (loading) return <p>Dang tai...</p>;
  if (error) return <p role="alert">Loi: {error}</p>;
  if (!user) return null;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

```tsx
// __tests__/UserProfile.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { UserProfile } from "@/components/UserProfile";

// Mock global fetch
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("UserProfile", () => {
  it("hien thi loading roi hien thi thong tin user", async () => {
    // Mock fetch trả về user data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "Nguyen Van A",
        email: "a@example.com",
      }),
    });

    render(<UserProfile userId={1} />);

    // Ban đầu hiển thị loading
    expect(screen.getByText("Dang tai...")).toBeInTheDocument();

    // Chờ cho data load xong
    await waitFor(() => {
      expect(screen.getByText("Nguyen Van A")).toBeInTheDocument();
    });

    expect(screen.getByText("a@example.com")).toBeInTheDocument();
  });

  it("hien thi loi khi fetch that bai", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<UserProfile userId={999} />);

    // Chờ hiển thị thông báo lỗi
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Loi: Khong tim thay nguoi dung"
      );
    });
  });
});
```

---

## 3. Testing Server Components

Server Components không dùng hooks hay browser APIs, nên test đơn giản hơn:

```tsx
// app/products/page.tsx (Server Component)
async function getProducts() {
  const res = await fetch("https://api.example.com/products", {
    cache: "no-store",
  });
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <h1>Danh sach san pham</h1>
      <ul>
        {products.map((p: { id: number; name: string; price: number }) => (
          <li key={p.id}>
            {p.name} - {p.price.toLocaleString("vi-VN")} VND
          </li>
        ))}
      </ul>
    </div>
  );
}
```

```tsx
// __tests__/ProductsPage.test.tsx
import { render, screen } from "@testing-library/react";
import ProductsPage from "@/app/products/page";

// Mock fetch ở module level
global.fetch = jest.fn();

describe("ProductsPage (Server Component)", () => {
  it("hien thi danh sach san pham", async () => {
    // Mock API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [
        { id: 1, name: "Ao thun", price: 150000 },
        { id: 2, name: "Quan jean", price: 350000 },
      ],
    });

    // Server component trả về Promise, cần await
    const Component = await ProductsPage();
    render(Component);

    expect(screen.getByText("Danh sach san pham")).toBeInTheDocument();
    expect(screen.getByText(/Ao thun/)).toBeInTheDocument();
    expect(screen.getByText(/Quan jean/)).toBeInTheDocument();
  });
});
```

> **Lưu ý:** Khi test Server Components, bạn cần await component function vì nó trả về Promise.

---

## 4. Testing Client Components

Client Components có `"use client"` directive, sử dụng hooks và browser APIs:

```tsx
// components/SearchBar.tsx
"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  }, [query, router]);

  return (
    <div>
      <input
        type="text"
        placeholder="Tim kiem..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Tim kiem"
      />
      <button onClick={handleSearch}>Tim</button>
    </div>
  );
}
```

```tsx
// __tests__/SearchBar.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "@/components/SearchBar";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe("SearchBar", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("dieu huong den trang search khi nhap va click", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    // Nhập từ khóa vào ô tìm kiếm
    const input = screen.getByLabelText("Tim kiem");
    await user.type(input, "next.js tutorial");

    // Click nút Tìm
    await user.click(screen.getByRole("button", { name: "Tim" }));

    // Kiểm tra router.push được gọi đúng
    expect(mockPush).toHaveBeenCalledWith(
      "/search?q=next.js%20tutorial"
    );
  });

  it("khong dieu huong khi query rong", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    // Click Tìm mà không nhập gì
    await user.click(screen.getByRole("button", { name: "Tim" }));

    expect(mockPush).not.toHaveBeenCalled();
  });
});
```

---

## 5. Testing Route Handlers

Route Handlers là API endpoints trong App Router:

```tsx
// app/api/todos/route.ts
import { NextRequest, NextResponse } from "next/server";

// Giả lập database đơn giản
const todos = [
  { id: 1, title: "Hoc Next.js", completed: false },
  { id: 2, title: "Viet unit test", completed: true },
];

export async function GET() {
  return NextResponse.json(todos);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate input
  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json(
      { error: "Title la bat buoc" },
      { status: 400 }
    );
  }

  const newTodo = {
    id: todos.length + 1,
    title: body.title,
    completed: false,
  };

  todos.push(newTodo);
  return NextResponse.json(newTodo, { status: 201 });
}
```

```tsx
// __tests__/api/todos.test.ts
import { GET, POST } from "@/app/api/todos/route";
import { NextRequest } from "next/server";

describe("GET /api/todos", () => {
  it("tra ve danh sach todos", async () => {
    // Gọi trực tiếp handler function
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });
});

describe("POST /api/todos", () => {
  it("tao todo moi thanh cong", async () => {
    // Tạo mock request
    const request = new NextRequest("http://localhost:3000/api/todos", {
      method: "POST",
      body: JSON.stringify({ title: "Todo moi" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.title).toBe("Todo moi");
    expect(data.completed).toBe(false);
  });

  it("tra ve loi 400 khi thieu title", async () => {
    const request = new NextRequest("http://localhost:3000/api/todos", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Title la bat buoc");
  });
});
```

---

## 6. Playwright cho E2E Testing

Playwright giúp test toàn bộ luồng người dùng trên trình duyệt thật.

### 6.1 Cai dat

```bash
# Cài đặt Playwright
npm install -D @playwright/test

# Cài đặt browsers (Chromium, Firefox, WebKit)
npx playwright install
```

### 6.2 Cau hinh

```tsx
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // Thư mục chứa test files
  testDir: "./e2e",

  // Timeout cho mỗi test
  timeout: 30_000,

  // Chạy dev server trước khi test
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },

  // Test trên nhiều trình duyệt
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
});
```

### 6.3 Viet E2E test

```tsx
// e2e/navigation.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Dieu huong trang web", () => {
  test("truy cap trang chu va thay noi dung", async ({ page }) => {
    // Truy cập trang chủ
    await page.goto("/");

    // Kiểm tra tiêu đề trang
    await expect(page).toHaveTitle(/Next.js App/);

    // Kiểm tra heading hiển thị
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("dang nhap thanh cong", async ({ page }) => {
    await page.goto("/login");

    // Điền form đăng nhập
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByLabel("Mật khẩu").fill("password123");

    // Click nút đăng nhập
    await page.getByRole("button", { name: "Dang nhap" }).click();

    // Chờ chuyển hướng đến dashboard
    await expect(page).toHaveURL("/dashboard");

    // Kiểm tra hiển thị tên người dùng
    await expect(page.getByText("Xin chao, User!")).toBeVisible();
  });

  test("hien thi loi khi dang nhap sai", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Mật khẩu").fill("wrongpass");
    await page.getByRole("button", { name: "Dang nhap" }).click();

    // Kiểm tra thông báo lỗi
    await expect(page.getByText("Email hoac mat khau khong dung")).toBeVisible();
  });
});
```

### 6.4 Test voi API mocking

```tsx
// e2e/products.spec.ts
import { test, expect } from "@playwright/test";

test("hien thi san pham tu API", async ({ page }) => {
  // Mock API response
  await page.route("**/api/products", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: 1, name: "San pham A", price: 100000 },
        { id: 2, name: "San pham B", price: 200000 },
      ]),
    });
  });

  await page.goto("/products");

  // Kiểm tra sản phẩm hiển thị
  await expect(page.getByText("San pham A")).toBeVisible();
  await expect(page.getByText("San pham B")).toBeVisible();
});
```

---

## 7. Test Organization va Best Practices

### 7.1 Cau truc thư mục

```
project/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   └── api/
│   │       └── todos/
│   │           └── route.ts
│   ├── components/
│   │   ├── Counter.tsx
│   │   └── __tests__/          # Unit tests cạnh component
│   │       └── Counter.test.tsx
│   └── lib/
│       ├── utils.ts
│       └── __tests__/
│           └── utils.test.ts
├── e2e/                         # E2E tests tách riêng
│   ├── navigation.spec.ts
│   └── auth.spec.ts
├── jest.config.ts
└── playwright.config.ts
```

### 7.2 Best Practices

**Do (Nên làm):**
- Test behavior, khong test implementation
- Dung `getByRole`, `getByLabelText` thay vi `getByTestId`
- Mock o muc nho nhat có thể
- Moi test độc lập, không phụ thuộc test khac

**Don't (Không nen lam):**
- Không test CSS styling truc tiep
- Không test thư viện bên thứ 3
- Không viet test qua chi tiet ve implementation
- Không để test phụ thuộc vao thứ tự chay

---

## 8. Coverage Reporting

### 8.1 Cau hinh coverage

```bash
# Chạy test với coverage
npx jest --coverage
```

Jest sẽ in bảng coverage ra terminal:

```
---------------------|---------|----------|---------|---------|
File                 | % Stmts | % Branch | % Funcs | % Lines |
---------------------|---------|----------|---------|---------|
All files            |   85.71 |    83.33 |   88.89 |   86.96 |
 components/         |   90.00 |   100.00 |   85.71 |   91.67 |
  Counter.tsx        |  100.00 |   100.00 |  100.00 |  100.00 |
  SearchBar.tsx      |   80.00 |   100.00 |   75.00 |   83.33 |
---------------------|---------|----------|---------|---------|
```

### 8.2 Cau hinh coverage threshold

```tsx
// jest.config.ts - thêm phần nay
const config: Config = {
  // ...config khac
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  // Bỏ qua các file không cần test
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/e2e/",
    "jest.config.ts",
  ],
};
```

---

## 9. Lỗi thường gặp

### Lỗi 1: "Cannot find module next/jest"

```bash
# Nguyên nhân: chưa cài đặt đúng dependencies
# Giải pháp:
npm install -D jest @types/jest ts-jest
```

### Lỗi 2: "useRouter is not a function" trong test

```tsx
// Nguyên nhân: chưa mock next/navigation
// Giải pháp: thêm mock ở đầu file test

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
```

### Lỗi 3: "act() warning" khi test async component

```tsx
// Nguyên nhân: state update xảy ra sau khi test kết thúc
// Giải pháp: dùng waitFor hoặc findBy queries

// SAI:
render(<AsyncComponent />);
expect(screen.getByText("Data")).toBeInTheDocument(); // Lỗi!

// DUNG:
render(<AsyncComponent />);
await waitFor(() => {
  expect(screen.getByText("Data")).toBeInTheDocument();
});
```

### Lỗi 4: Playwright test chay cham

```tsx
// Giải pháp: chỉ chạy trên 1 browser khi develop
// playwright.config.ts
export default defineConfig({
  projects: process.env.CI
    ? [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
        { name: "firefox", use: { ...devices["Desktop Firefox"] } },
      ]
    : [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

---

## Câu hỏi phỏng vấn

### Câu 1: Jest va Playwright khac nhau nhu thế nào? Khi nào dùng cai nao?

**Trả lời:**

| Tiêu chí | Jest | Playwright |
|----------|------|------------|
| Loai test | Unit, Integration | E2E |
| Môi trường | jsdom (giả lập) | Browser that |
| Tốc độ | Nhanh | Cham hon |
| Phạm vi | 1 component/function | Toan bo luông |

- **Jest**: Test logic riêng le, component behavior, API handlers. Chay nhanh, phù hợp cho TDD.
- **Playwright**: Test luông người dùng từ đầu den cuoi trên browser that. Cham hon nhung sát với thực tế hon.

Trong dự án thực tế, nen dung **ca hai**: Jest cho unit/integration tests (chạy mỗi khi commit), Playwright cho E2E tests (chạy trước khi deploy).

### Câu 2: Lam sao test mot Server Component trong Next.js?

**Trả lời:**

Server Components la async functions tra ve JSX. De test:

1. Import truc tiep component function
2. Await kết quả (vi no la async)
3. Render kết quả voi React Testing Library

```tsx
// Server component tra ve Promise<JSX.Element>
const Component = await MyServerComponent();
render(Component);
expect(screen.getByText("Expected text")).toBeInTheDocument();
```

Lưu ý can mock `fetch` hoac bất kỳ API call nao trong component.

### Câu 3: Tai sao nen dung getByRole thay vi getByTestId?

**Trả lời:**

`getByRole` tim element dua tren accessibility role (nhu `button`, `heading`, `textbox`). Ưu điểm:

- Dam bao component accessible cho người dùng screen reader
- Test gan với cách người dùng thực sự tương tác
- Không phụ thuộc vao data-testid (implementation detail)

Chi dung `getByTestId` khi không có cach nào khác để xác định element.

### Câu 4: Lam sao mock API calls trong Playwright?

**Trả lời:**

Dung `page.route()` để intercept va mock HTTP requests:

```tsx
await page.route("**/api/data", (route) => {
  route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ message: "Mocked data" }),
  });
});
```

Dieu nay giup test E2E ma không phụ thuộc vao backend that, dam bao test ổn định va nhanh hơn.

### Câu 5: Coverage bao nhiêu la du?

**Trả lời:**

- **80%** la muc tieu tot cho hầu hết dự án
- **100%** khong thực tế va không cần thiet
- Quan trong hon coverage la **chat luông test**: test dung behavior, cover edge cases, va test cac luông loi

Tap trung coverage vao:
- Business logic quan trọng
- Components co nhieu trạng thái
- API handlers co validation phức tạp
- Utility functions được dùng nhiều nơi
