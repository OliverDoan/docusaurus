---
sidebar_position: 1
title: "1. Testing Strategy"
---

# Testing Strategy

> *Câu hỏi testing chia 2 nhóm: junior trả lời "em viết Jest test"; senior trả lời "em đo coverage không phải KPI, em viết test khi nào value cao hơn cost". Hiểu sự khác biệt = câu trả lời tốt.*

---

## Câu 1: Test Pyramid — em hiểu thế nào? `[Intermediate]`

### Câu hỏi

> Test pyramid là gì? Tỷ lệ em phân bổ test trong dự án thực tế là bao nhiêu? Có thay đổi với "test trophy" không?

### Giải thích lý thuyết

**Test Pyramid** (Mike Cohn, 2009):

```
       /\
      /E2E\         5-10%
     /------\
    / Integ. \     15-25%
   /----------\
  / Unit tests \   65-80%
 /--------------\
```

Lý do pyramid:
- Unit fast (ms) → nhiều, run every change.
- Integration trung bình (giây) → ít hơn.
- E2E chậm (phút), flaky → ít nhất, chỉ critical path.

**Test Trophy** (Kent C. Dodds, 2018):

```
      Static (TS, ESLint)
   /-----------------------\
  /     Integration         \   ← phần lớn focus
 /-----------------------------\
/      Unit       /     E2E     \
/-------------------\-------------\
```

Trophy argues: integration test cho **best ROI** trong React app — test component + interaction + state, gần với user behavior. Unit test cho pure function, util, custom hook. E2E chỉ critical flow.

### Code minh hoạ

```typescript
// Unit test — pure function
import { describe, it, expect } from "vitest";
import { calculateDiscount, formatCurrency } from "./utils";

describe("calculateDiscount", () => {
  it.each([
    [100, 10, 90],
    [100, 0, 100],
    [50, 50, 25],
  ])("calculateDiscount(%d, %d) = %d", (price, percent, expected) => {
    expect(calculateDiscount(price, percent)).toBe(expected);
  });

  it("throws on negative price", () => {
    expect(() => calculateDiscount(-10, 5)).toThrow();
  });
});

// Integration test — component + API mock
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.get("/api/products", () => HttpResponse.json([
    { id: "1", name: "iPhone", price: 999 },
    { id: "2", name: "MacBook", price: 1999 },
  ])),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("ProductList", () => {
  it("renders products from API", async () => {
    render(<ProductList />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("iPhone")).toBeInTheDocument();
      expect(screen.getByText("MacBook")).toBeInTheDocument();
    });
  });

  it("filters by search query", async () => {
    const user = userEvent.setup();
    render(<ProductList />);

    await screen.findByText("iPhone");
    await user.type(screen.getByPlaceholderText(/search/i), "Mac");

    await waitFor(() => {
      expect(screen.queryByText("iPhone")).not.toBeInTheDocument();
      expect(screen.getByText("MacBook")).toBeInTheDocument();
    });
  });

  it("shows error when API fails", async () => {
    server.use(
      http.get("/api/products", () => new HttpResponse(null, { status: 500 }))
    );

    render(<ProductList />);

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });
});

// E2E test — Playwright (critical flow only)
import { test, expect } from "@playwright/test";

test("user can complete purchase", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /products/i }).click();
  await page.getByRole("button", { name: /add to cart/i }).first().click();
  await page.getByRole("link", { name: /cart/i }).click();
  await page.getByRole("button", { name: /checkout/i }).click();

  await page.getByLabel(/email/i).fill("test@example.com");
  await page.getByLabel(/card number/i).fill("4242424242424242");
  await page.getByRole("button", { name: /place order/i }).click();

  await expect(page.getByText(/order confirmed/i)).toBeVisible();
});
```

### Đáp án mẫu

> "Test pyramid khuyên nhiều unit, ít E2E vì cost/speed tradeoff. Test trophy của Kent C. Dodds argue cho **integration test có ROI cao nhất** trong React app — test component + interaction + API mock — gần với user behavior. Em theo trophy hơn pyramid: ~50% integration, ~30% unit (pure function, util, custom hook), ~10% E2E (critical flow), ~10% visual regression. Lý do: unit test component React thường low value — test implementation thay vì user experience. Integration với React Testing Library + MSW test 'user xem được gì + click gì' — refactor implementation không break test. E2E em chỉ cover happy path critical (signup, checkout, payment) — slow + flaky nên không edge case. Mantra của em: **'Test public behavior, not implementation'**. Coverage 80% là sanity check, không phải KPI — 100% coverage không đồng nghĩa quality."

---

## Câu 2: React Testing Library — pattern và anti-pattern `[Intermediate]`

### Câu hỏi

> Em viết test React thế nào? Liệt kê 3 pattern em luôn dùng và 3 anti-pattern em luôn tránh.

### Giải thích lý thuyết

RTL philosophy: **"The more your tests resemble the way your software is used, the more confidence they can give you."** — Kent C. Dodds.

3 nguyên tắc:
1. Query như user (accessible role, label, text), không phải implementation (className, testId).
2. Async behavior với `findBy*` và `waitFor`, không `setTimeout`.
3. Fire event qua `userEvent` (real interaction), không `fireEvent` low-level.

### Code minh hoạ

```typescript
// ✅ PATTERN 1: Query priority (accessibility-first)
// Order theo recommendation của Testing Library:
// 1. Accessible — getByRole, getByLabelText, getByPlaceholderText, getByText
// 2. Semantic — getByAltText, getByTitle
// 3. TestId — getByTestId (cuối cùng, khi không có cách nào khác)

// ❌ ANTI: testid khắp nơi
const button = screen.getByTestId("submit-btn");

// ✅ Đúng: accessible name
const button = screen.getByRole("button", { name: /submit/i });

// ✅ PATTERN 2: userEvent over fireEvent
import userEvent from "@testing-library/user-event";

it("submits form", async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  // userEvent simulate real user — focus, type from keyboard, dispatch events theo đúng order
  await user.type(screen.getByLabelText(/email/i), "test@example.com");
  await user.type(screen.getByLabelText(/password/i), "secret123");
  await user.click(screen.getByRole("button", { name: /sign in/i }));

  expect(await screen.findByText(/welcome/i)).toBeInTheDocument();
});

// ❌ ANTI: fireEvent — low-level, không trigger blur/focus đúng
fireEvent.change(input, { target: { value: "test" } });

// ✅ PATTERN 3: Async với findBy* và waitFor
// findBy* = waitFor + getBy* — chờ element xuất hiện
const button = await screen.findByRole("button", { name: /save/i });

// waitFor cho assertion tự định
await waitFor(() => {
  expect(mockSubmit).toHaveBeenCalledWith({ email: "test@example.com" });
});

// ❌ ANTI: setTimeout
await new Promise(r => setTimeout(r, 1000));
expect(screen.getByText("loaded")).toBeInTheDocument();
// Flaky — quá nhanh hoặc quá chậm tùy machine

// ✅ ANTI-PATTERN tránh

// ❌ Test implementation detail
it("calls useState", () => {
  // ... spy on useState — vô nghĩa
});

// ❌ Snapshot test cho component to
it("matches snapshot", () => {
  expect(render(<Dashboard />).asFragment()).toMatchSnapshot();
  // Snapshot dài hàng nghìn dòng → nobody review → useless
});
// Snapshot OK cho: small component, error boundary, util output

// ❌ Test internal state
it("sets count state", () => {
  const { container } = render(<Counter />);
  // Try to access component instance — không nên
});

// ✅ Test public behavior
it("increments count on click", async () => {
  const user = userEvent.setup();
  render(<Counter />);
  await user.click(screen.getByRole("button", { name: /increment/i }));
  expect(screen.getByText("1")).toBeInTheDocument();
});

// Custom hook test — renderHook
import { renderHook, act } from "@testing-library/react";

describe("useCounter", () => {
  it("increments", () => {
    const { result } = renderHook(() => useCounter(0));
    act(() => result.current.increment());
    expect(result.current.count).toBe(1);
  });

  it("respects initial value", () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });
});

// Wrap với provider
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);
const { result } = renderHook(() => useUser(), { wrapper });
```

### Đáp án mẫu

> "3 pattern em luôn dùng. **Query accessibility-first**: `getByRole({ name })` ưu tiên, `getByLabelText` cho form input, `getByText` cho copy. `getByTestId` chỉ khi không có cách nào khác — testid là implementation detail, không sustainable. **userEvent over fireEvent**: `userEvent.setup()` simulate real interaction (focus, blur, keyboard event) trong order đúng — fireEvent low-level miss blur/focus. **Async với findBy/waitFor**: `findByRole` = waitFor + getBy, retry đến khi element xuất hiện. Tránh `setTimeout` — flaky theo machine speed. 3 anti-pattern em tránh: **snapshot test cho component lớn** — nghìn dòng nobody review, fail mỗi PR; **test implementation detail** (spy on useState, access internal state) — refactor break test; **test với data-testid khắp nơi** — refactor markup → test broken dù UX không đổi. Quy tắc của em: 'test cái user thấy + tương tác, không phải code'."

---

## Câu 3: MSW vs jest.mock — khi nào dùng cái nào? `[Senior]`

### Câu hỏi

> Em mock API call trong test. `jest.mock("axios")`, MSW, hay `nock`?

### Giải thích lý thuyết

| Tool        | Layer mock                       | Pros                                          | Cons                                          |
| ----------- | -------------------------------- | --------------------------------------------- | --------------------------------------------- |
| `jest.mock` | Module level                     | Đơn giản, fast                                | Test biết về implementation (axios/fetch)     |
| **MSW**     | Network (Service Worker / Node)  | Mock ở level network — test không biết HTTP client | Setup phức tạp hơn                       |
| `nock`      | Node HTTP interceptor             | Chính xác về HTTP                              | Node-only, không dùng được browser test       |

MSW thắng vì:
- Test không bị couple với HTTP client (axios → fetch không break test).
- Share mock handler giữa test + Storybook + dev.
- Real HTTP behavior — serialize, parse, status code.

### Code minh hoạ

```typescript
// 1. jest.mock — couple với implementation
import axios from "axios";
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

it("fetches users", async () => {
  mockedAxios.get.mockResolvedValue({ data: [{ id: "1", name: "An" }] });

  render(<UserList />);

  expect(await screen.findByText("An")).toBeInTheDocument();
  expect(mockedAxios.get).toHaveBeenCalledWith("/api/users");
});
// → Refactor axios → fetch: test break dù behavior không đổi

// 2. MSW — mock ở network level
// mocks/handlers.ts
import { http, HttpResponse, delay } from "msw";

export const handlers = [
  http.get("/api/users", async () => {
    await delay(100); // simulate network
    return HttpResponse.json([{ id: "1", name: "An" }]);
  }),

  http.post("/api/users", async ({ request }) => {
    const body = await request.json();
    if (!body.email) {
      return HttpResponse.json({ error: "Email required" }, { status: 422 });
    }
    return HttpResponse.json({ id: "new", ...body }, { status: 201 });
  }),

  http.get("/api/users/:id", ({ params }) => {
    if (params.id === "404") {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({ id: params.id, name: "Test User" });
  }),

  // Network error simulation
  http.get("/api/error", () => {
    return HttpResponse.error();
  }),
];

// mocks/server.ts (Node — Jest/Vitest)
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);

// mocks/browser.ts (Browser — Storybook/dev)
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

// vitest.setup.ts
import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Test code — không quan tâm HTTP client
import { render, screen } from "@testing-library/react";

it("fetches users", async () => {
  render(<UserList />);
  expect(await screen.findByText("An")).toBeInTheDocument();
});
// → Refactor axios → fetch: test vẫn pass

// Override handler trong test cụ thể
it("handles 500 error", async () => {
  server.use(
    http.get("/api/users", () => new HttpResponse(null, { status: 500 }))
  );
  render(<UserList />);
  expect(await screen.findByText(/error/i)).toBeInTheDocument();
});

// 3. Dùng MSW cho dev mode (siêu hữu ích)
// main.tsx
async function enableMocking() {
  if (process.env.NODE_ENV !== "development") return;
  if (!process.env.VITE_ENABLE_MSW) return;

  const { worker } = await import("./mocks/browser");
  return worker.start();
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
});
// → Dev không cần backend running, mock data cho FE development
```

### Đáp án mẫu

> "Em dùng **MSW** cho 95% case. Lý do: MSW mock ở **network layer** — test không biết app dùng axios hay fetch. Refactor HTTP client → test pass nguyên. Mock handler reusable cho test + Storybook + dev mode (FE develop được khi BE chưa ready). `jest.mock('axios')` em chỉ dùng cho module có side-effect không phải HTTP (analytics SDK, storage). `nock` em không dùng vì Node-only. MSW setup: handler array trong `mocks/handlers.ts`, `setupServer` cho Vitest, `setupWorker` cho browser. Trong test cụ thể có thể `server.use(...)` để override handler cho edge case (500 error, slow network). Bonus: MSW v2 dùng Fetch API standard (Request/Response) — match với native, không proprietary mock API. Một practice em luôn enforce: `onUnhandledRequest: 'error'` — test fail nếu có request không mock → forces test author phải explicit về dependency."

---

## Câu 4: E2E testing strategy — Playwright vs Cypress `[Senior]`

### Câu hỏi

> Em chọn Playwright hay Cypress cho E2E? Quyết định dựa trên gì?

### Giải thích lý thuyết

| Aspect              | Playwright                              | Cypress                                |
| ------------------- | --------------------------------------- | -------------------------------------- |
| Browser             | Chromium, WebKit, Firefox               | Chrome, Edge, Firefox, WebKit (limited)|
| Tab/multi-page      | Native support                          | Limited (one tab per test)             |
| Parallel            | Built-in, fast                          | Cypress Cloud (paid) hoặc shard manual |
| Network mock        | route.fulfill (built-in)                | cy.intercept (built-in)                |
| API testing         | request.* (great)                       | cy.request (basic)                     |
| Auto-wait           | Có (auto-retry locator)                 | Có                                     |
| Iframe              | Native                                  | Plugin needed                          |
| Test runner         | Jest-like (test, expect)                | Mocha-like                             |
| Speed               | Faster (parallel native)                | Slower without Cloud                   |
| Mobile emulation    | Native                                  | Có                                     |
| Visual regression   | @playwright/test built-in screenshot    | percy / Argos (third-party)            |

Trend 2024-2025: **Playwright dominate** cho project mới — parallel free, multi-browser, multi-tab, fast.

### Code minh hoạ

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ["html"],
    ["junit", { outputFile: "junit.xml" }],
    process.env.CI ? ["github"] : ["list"],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",        // record trace nếu retry
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    { name: "chromium", use: devices["Desktop Chrome"] },
    { name: "webkit", use: devices["Desktop Safari"] },
    { name: "firefox", use: devices["Desktop Firefox"] },
    { name: "mobile-chrome", use: devices["Pixel 7"] },
    { name: "mobile-safari", use: devices["iPhone 14"] },
  ],

  webServer: {
    command: "pnpm dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});

// Page Object Model — maintainable structure
// pages/LoginPage.ts
import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(public page: Page) {
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole("button", { name: /sign in/i });
    this.errorMessage = page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

// Test
import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

test.describe("Authentication", () => {
  test("user can login with valid credentials", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login("user@test.com", "password123");

    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test("shows error with invalid credentials", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login("user@test.com", "wrong");

    await expect(login.errorMessage).toHaveText(/invalid credentials/i);
  });
});

// API testing trong Playwright
test("API: create user", async ({ request }) => {
  const response = await request.post("/api/users", {
    data: { email: "test@example.com", name: "Test" },
  });

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(201);

  const body = await response.json();
  expect(body).toMatchObject({ email: "test@example.com" });
});

// Auth state reuse — login 1 lần, share state
// auth.setup.ts
import { test as setup } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill("user@test.com");
  await page.getByLabel(/password/i).fill("password");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("/dashboard");

  // Save auth state
  await page.context().storageState({ path: "playwright/.auth/user.json" });
});

// Test config — use saved auth
projects: [
  { name: "setup", testMatch: /.*\.setup\.ts/ },
  {
    name: "authenticated",
    use: { ...devices["Desktop Chrome"], storageState: "playwright/.auth/user.json" },
    dependencies: ["setup"],
  },
];

// Visual regression
test("homepage visual", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("homepage.png", { maxDiffPixels: 100 });
});

// Mobile viewport
test("mobile menu opens", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await page.getByRole("button", { name: /menu/i }).click();
  await expect(page.getByRole("navigation")).toBeVisible();
});
```

### Đáp án mẫu

> "Em chọn **Playwright** cho dự án mới. Lý do thực dụng: **parallel native free** (Cypress charge cho Cypress Cloud); **multi-browser thật** (WebKit là Safari engine — quan trọng cho iOS user); **multi-tab/window** native (auth flow OAuth, popup); **API testing đầy đủ** trong cùng framework. Cypress vẫn ngon cho team đã có investment lớn — DX tốt với time travel debugging. Strategy E2E của em: **chỉ critical flow** (signup, login, checkout, payment, important conversion). Phần lớn coverage để cho integration test. **Page Object Model** organize selector + action — maintain dễ. **Auth state reuse** — `storageState` save sau login 1 lần, share giữa test → tốc độ x5. **Cross-browser**: chromium luôn run, webkit + mobile run trên main branch (catch Safari/mobile bug). **Trace + video on failure** — debug CI failure dễ hơn nhiều. **Visual regression** built-in `toHaveScreenshot`. Avoid: test mọi feature E2E (slow + flaky); UI test brittle vì depend on copy/animation; data setup phức tạp trong UI (dùng API request setup data, test UI sau)."

---

## Câu 5: TDD — em có thực sự áp dụng không? `[Senior]`

### Câu hỏi

> Trong codebase em, em viết test trước hay sau code? Honest opinion về TDD?

### Interviewer test gì

- Em có **honest** về practice của em không.
- Em có **practical** thay vì dogmatic không.
- Em có context-aware khi nào dùng TDD không.

### Đáp án mẫu

> "Em honest: em **không** strict TDD cho mọi line code. TDD lý thuyết hay nhưng thực tế tùy context. Cách em áp dụng:
>
> **Em viết test trước cho**: (1) **bug fix** — viết test reproduce bug TRƯỚC, fix code, đảm bảo test pass + không regression. Đây là TDD pure value. (2) **Pure logic** — utility function (parser, validator, business rule) — interface rõ, test trước force em nghĩ về edge case. (3) **API contract** — function với input/output rõ ràng. (4) **Bug class lặp lại** — sau khi fix bug, em viết test để prevent regression future.
>
> **Em viết test sau cho**: (1) **UI component** — em ship UI thấy được trước, iterate với designer/PM, lock UI rồi mới write test. Test trước cho UI thường waste vì UI thay đổi nhiều. (2) **Exploration/spike** — em prototype để hiểu vấn đề, throwaway code. Viết test trước là premature commit. (3) **Integration scaffold** — wire-up code thường straightforward, test sau OK.
>
> **Em không skip test cho**: bất cứ code go production. Test sau vẫn là test.
>
> Honest opinion về TDD: nó là **disciplinary tool**, không phải religion. Lợi ích thật của TDD không phải 'no bug' (vì test cũng có thể sai) — mà là **forces em design API trước khi implement**, **catch design flaw sớm** (hard to test = bad design), **document expected behavior** qua test. Anti-pattern em từng làm: viết test sau khi code chỉ để có coverage 80% — test không value, brittle, fail mỗi refactor. Quy tắc của em: **test viết khi và chỉ khi value cao hơn cost** — không TDD cho mọi line, không 100% coverage, nhưng phải có test cho mọi business logic và bug fix."

### Tips

- **Honest** — fake "em luôn TDD" interviewer biết ngay là không thật.
- Show **context-awareness** — biết khi nào dùng, khi nào không.
- Highlight **why** TDD valuable (design feedback) thay vì just "best practice".

---

## Câu 6: Coverage là KPI hay sanity check? `[Senior]`

### Câu hỏi

> Sếp em yêu cầu test coverage ≥ 90% cho mọi PR. Em phản ứng thế nào?

### Interviewer test gì

- Em có **disagree** với metric tệ không.
- Em có **propose** alternative không.
- Em có hiểu **coverage không equal quality** không.

### Đáp án mẫu

> "Em raise concern theo cách constructive. **Coverage 90% gate** có thể incentivize hành vi xấu: dev viết test trash để pass coverage (assertion vô nghĩa, test private function với mock 100%), tránh viết code khó test (defensive code, branch hiếm gặp) → architectural compromise.
>
> Em propose alternative với manager:
>
> **Coverage as sanity check, không gate**: target 70-80% line coverage là lành mạnh. Dưới đó có thể missing critical path. Trên đó là diminishing return — 95% → 100% cost gấp 3x effort của 70% → 95%.
>
> **Quality metric thay coverage**: (1) **Mutation testing** với Stryker — đo test có catch được bug thật không (mutate code, test phải fail). (2) **Test critical path coverage** — flow signup/checkout/payment phải 100%, util infrastructure có thể 60%. (3) **Bug escape rate** — bao nhiêu production bug do test miss → trend tốt hơn coverage số.
>
> **Cultural change**: code review check **test value** — reviewer hỏi 'test này test gì? Nếu xoá code, test có fail không?'. Nếu xoá implementation mà test vẫn pass = test vô nghĩa (test implementation thay vì behavior).
>
> Em present với manager: '90% coverage gate sẽ slow team xuống và không guarantee quality. Em đề xuất 75% baseline + critical path 100% + mutation test cho core business logic.' Em backup bằng data: research show diminishing return sau 75-80%.
>
> Nếu manager insist 90% — em comply NHƯNG document concern và monitor: track bug escape rate, dev velocity, PR cycle time. Sau 3 tháng có data → present lại đánh giá lại.
>
> Em **không**: silently comply (passive); refuse outright (career suicide); cheat coverage với fake test (worst của 2 thế giới)."

### Tips

- Show **assertive disagreement** với data, không emotional.
- **Propose concrete alternative** — không chỉ complain.
- **Disagree-and-commit** nếu manager vẫn insist — không sabotage.

---

## Câu 7: Test cho async behavior phức tạp `[Senior]`

### Câu hỏi

> Em test component sử dụng TanStack Query, optimistic update, retry logic. Strategy?

### Giải thích lý thuyết

Async test phức tạp với:
- Race condition (request A finish sau B).
- Optimistic update + rollback.
- Retry với backoff.
- Stale-while-revalidate.

Pattern:
- MSW với `delay` simulate network latency.
- `waitFor` cho final state, không assert intermediate.
- Test **observable behavior** từ user perspective.

### Code minh hoạ

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse, delay } from "msw";

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },  // disable retry trong test
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

// 1. Test optimistic update
describe("LikeButton", () => {
  it("shows optimistic count immediately", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("/api/posts/:id/like", async () => {
        await delay(500);  // chậm để observe optimistic
        return HttpResponse.json({ likes: 11 });
      })
    );

    renderWithQuery(<LikeButton postId="1" initialLikes={10} />);

    expect(screen.getByText("10")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /like/i }));

    // Optimistic UI ngay
    expect(screen.getByText("11")).toBeInTheDocument();

    // Sau khi server xong, vẫn 11 (server xác nhận)
    await waitFor(() => {
      expect(screen.getByText("11")).toBeInTheDocument();
    });
  });

  it("rollbacks on error", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("/api/posts/:id/like", async () => {
        await delay(200);
        return new HttpResponse(null, { status: 500 });
      })
    );

    renderWithQuery(<LikeButton postId="1" initialLikes={10} />);

    await user.click(screen.getByRole("button", { name: /like/i }));

    // Optimistic update — UI hiển thị 11
    expect(screen.getByText("11")).toBeInTheDocument();

    // Sau error, rollback về 10
    await waitFor(() => {
      expect(screen.getByText("10")).toBeInTheDocument();
    });

    expect(screen.getByText(/failed/i)).toBeInTheDocument();
  });
});

// 2. Test retry behavior
describe("DataFetcher with retry", () => {
  it("retries 3 times before giving up", async () => {
    let attempt = 0;
    server.use(
      http.get("/api/data", () => {
        attempt++;
        if (attempt < 3) return new HttpResponse(null, { status: 500 });
        return HttpResponse.json({ data: "success" });
      })
    );

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 3,
          retryDelay: 0,  // không delay trong test
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DataFetcher />
      </QueryClientProvider>
    );

    expect(await screen.findByText(/success/i)).toBeInTheDocument();
    expect(attempt).toBe(3);
  });
});

// 3. Test race condition (request newer overwrites older)
describe("SearchBox", () => {
  it("only shows result of latest query", async () => {
    const user = userEvent.setup();

    server.use(
      http.get("/api/search", async ({ request }) => {
        const url = new URL(request.url);
        const q = url.searchParams.get("q");

        // Simulate: "a" returns chậm, "ab" returns nhanh
        if (q === "a") {
          await delay(500);
          return HttpResponse.json([{ id: "1", name: "Apple" }]);
        }
        if (q === "ab") {
          await delay(50);
          return HttpResponse.json([{ id: "2", name: "Banana" }]);
        }
        return HttpResponse.json([]);
      })
    );

    renderWithQuery(<SearchBox />);

    const input = screen.getByRole("searchbox");

    await user.type(input, "a");
    // Tại đây, "a" request đang pending

    await user.type(input, "b");
    // Tại đây, "ab" request gửi

    // Đợi result
    await waitFor(() => {
      expect(screen.getByText("Banana")).toBeInTheDocument();
    });

    // "Apple" KHÔNG được hiển thị (race condition prevented)
    expect(screen.queryByText("Apple")).not.toBeInTheDocument();
  });
});

// 4. Test debounce
describe("AutoSave", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("only saves after 500ms of inactivity", async () => {
    const saveFn = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<AutoSaveInput onSave={saveFn} />);

    await user.type(screen.getByRole("textbox"), "hello");

    // Chưa save
    expect(saveFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(saveFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    // Đã 500ms — save trigger
    expect(saveFn).toHaveBeenCalledWith("hello");
  });
});
```

### Đáp án mẫu

> "Async test phức tạp em theo 4 nguyên tắc. **Nguyên tắc 1 — Disable retry trong query client test config** — tránh test chạy lâu vì retry. Override khi test specific retry behavior. **Nguyên tắc 2 — MSW với delay** simulate network latency, không mock function level. Optimistic update test có delay đủ để observe intermediate state. **Nguyên tắc 3 — waitFor cho final state**, không assert intermediate fragile. Optimistic: assert UI update ngay sau click (sync) + final state sau response. Rollback: assert UI revert sau error. **Nguyên tắc 4 — Race condition test với MSW conditional response** — handler check query param trả response khác nhau với delay khác nhau. Test verify: chỉ result của latest request hiển thị, request cũ bị cancel/ignored. **Debounce/throttle**: dùng `vi.useFakeTimers()` + `vi.advanceTimersByTime()` để control thời gian — không phải chờ thật. **Custom provider wrapper** `renderWithQuery` cho mọi test query — tránh boilerplate. Bonus: test 'observable behavior' từ user perspective — KHÔNG test internal state của react-query (cacheTime, queryFn return). Test user thấy gì, click gì, sau cùng thấy gì. Refactor implementation react-query→swr không break test nếu viết đúng."

---

## Câu 8: Visual regression testing `[Senior]`

### Câu hỏi

> Em đã làm visual regression chưa? Khi nào value, khi nào không?

### Giải thích lý thuyết

**Visual regression**: chụp screenshot UI, compare với baseline. Catch unintended visual change.

Tools:
- **Chromatic** (paid, integrate Storybook) — best DX.
- **Percy** (paid, BrowserStack).
- **Argos CI** (open source + paid).
- **Playwright** built-in `toHaveScreenshot()`.
- **Loki** (Storybook plugin).

Value:
- Design system / component library — change visual = bug.
- Marketing landing page — pixel-perfect matters.
- Cross-browser visual consistency.

Cost:
- Flaky (anti-aliasing, font rendering, animation).
- False positive — need diff threshold.
- Baseline maintenance — every legit change updates many snapshot.

### Code minh hoạ

```typescript
// 1. Chromatic + Storybook
// Button.stories.tsx
export default {
  title: "UI/Button",
  component: Button,
};

export const Primary = { args: { variant: "primary", children: "Click me" } };
export const Disabled = { args: { variant: "primary", disabled: true, children: "Click me" } };
export const Loading = { args: { variant: "primary", loading: true, children: "Click me" } };

// .github/workflows/chromatic.yml
- run: pnpm chromatic --project-token=${{ secrets.CHROMATIC_TOKEN }}
// Chromatic build Storybook, screenshot mọi story, diff với baseline
// PR comment với visual diff URL

// 2. Playwright built-in
test("homepage visual", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Mask dynamic content
  await page.evaluate(() => {
    document.querySelectorAll(".timestamp").forEach(el => el.textContent = "FIXED");
  });

  await expect(page).toHaveScreenshot("homepage.png", {
    maxDiffPixels: 100,
    threshold: 0.2,
    fullPage: true,
    animations: "disabled",
  });
});

// Multi-viewport
const viewports = [
  { name: "mobile", width: 375, height: 667 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const vp of viewports) {
  test(`homepage ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");
    await expect(page).toHaveScreenshot(`homepage-${vp.name}.png`);
  });
}

// 3. Handle dynamic content
test("user profile (mask dynamic)", async ({ page }) => {
  await page.goto("/profile");

  await expect(page).toHaveScreenshot("profile.png", {
    mask: [
      page.locator(".created-at"),    // mask timestamp
      page.locator(".avatar"),         // mask user avatar (random)
      page.locator("[data-dynamic]"),  // mask explicit dynamic
    ],
  });
});

// 4. Wait for fonts (tránh font swap shift)
test("with custom font", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot();
});

// 5. Argos CI integration
// argos-cli upload → CI comment với visual diff URL
- run: pnpm playwright test
- run: pnpm argos upload --token=${{ secrets.ARGOS_TOKEN }} playwright-screenshots/
```

### Đáp án mẫu

> "Visual regression value cao cho 3 use case: (1) **design system / component library** — change visual = breaking change cho consumer, must catch. (2) **Marketing landing page** — pixel-perfect matters cho conversion. (3) **Cross-browser visual consistency** — bug Safari/Firefox khó catch khác. Cost cao cho: (a) app to với content dynamic (timestamp, user-generated content) — mask hoặc skip; (b) animation/transition state — disable hoặc capture frame cụ thể; (c) font swap (FOUT) — wait `document.fonts.ready`. **Tool choice**: cho component library em dùng **Chromatic + Storybook** — DX tốt, diff UI clear, baseline approval workflow. Cho page-level visual em dùng **Playwright `toHaveScreenshot()` + Argos CI** — free option. **Pitfalls em luôn handle**: mask dynamic content (`mask: [page.locator('.timestamp')]`); disable animation (`animations: 'disabled'`); wait font ready; multi-viewport (mobile/tablet/desktop); threshold tolerance (`maxDiffPixels: 100, threshold: 0.2`) — strict 0 sẽ flaky vì sub-pixel rendering. **Cost-benefit**: em **không** visual test mọi page. Critical visual (component lib, hero, pricing) — yes. CRUD admin — no. ROI low thì waste maintenance."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "100% coverage là target"                              | Diminishing return; quality > quantity                               |
| "Snapshot test cho mọi component"                      | Snapshot to → nobody review → useless. Chỉ cho small component       |
| "jest.mock everything"                                 | Couple test với implementation; MSW mock network                    |
| "TDD luôn — viết test trước"                           | Context-dependent; bug fix yes, UI exploration no                    |
| "E2E test cover hết bug"                               | E2E chậm, flaky; integration test ROI cao hơn                        |
| "Test internal state để chắc chắn"                     | Test public behavior, refactor không break test                      |
| "Visual regression cho mọi page"                       | Flaky + maintenance; chỉ design system + critical landing            |
