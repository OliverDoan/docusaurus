---
sidebar_position: 3
title: "3. Security & Testing Strategy"
---

# Security & Testing Strategy

> *Phần này không có "challenging algorithm" — chỉ test bạn có nghĩ về production thật hay không. Câu trả lời "em chưa quan tâm bảo mật" gần như chắc chắn fail.*

:::note[Ghi nhớ nhanh]

- ⭐ **`XSS`: React escape JSX text, nguy hiểm ở `dangerouslySetInnerHTML`** — sanitize bằng `DOMPurify` (whitelist tags/attrs/URL), validate `href`, CSP + server-side sanitize (defense in depth).
- ⭐ **Auth: `httpOnly cookie` không localStorage** — access token ngắn (15m) + refresh token dài (30d) có `rotation`; dùng NextAuth/Auth.js/Clerk thay tự code.
- **`Testing pyramid`** — nhiều `unit` (Vitest 60-70%), vừa `integration` (RTL + MSW), ít `E2E` (Playwright, chỉ critical flow); target >80% line.
- **`CI/CD` 4 layer** — pre-commit hook → PR pipeline (typecheck/lint/test/build/preview) → E2E trên preview → main deploy + nightly full E2E.
- **`Feature flag` không chỉ để A/B test** — còn kill switch, gradual rollout, trunk-based dev; tránh flag rot (có deadline cleanup).
- **`GDPR`: consent trước khi track** — right to access/deletion/portability, data minimization, redact PII trong log, không dark pattern.

:::

---

## Câu 1: XSS — em prevent thế nào trong React app? `[Senior]`

### Câu hỏi

> User có thể submit comment có HTML. Em render comment ra page. Em làm sao để tránh XSS?

### Giải thích lý thuyết

**XSS** (Cross-Site Scripting): attacker chèn JS vào page, chạy với context của user → steal cookie, key logger, ...

Loại XSS:
- **Reflected** — script từ URL/form input phản hồi lại.
- **Stored** — script lưu DB, mỗi user load đều dính.
- **DOM-based** — JS đọc DOM input không sanitize.

React mặc định **escape JSX text** — `{userInput}` an toàn. Nguy hiểm khi:
- `dangerouslySetInnerHTML`.
- URL trong `href`/`src` (`javascript:` scheme).
- Inject vào `<script>`, `<style>`.

### Code minh hoạ

```jsx
// React mặc định escape — SAFE
function Comment({ text }) {
  return <p>{text}</p>;  // <script> trong text được render literal
}

// dangerouslySetInnerHTML — DANGEROUS nếu không sanitize
function BadComment({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
  // Attacker: <img src=x onerror="fetch('/api/csrf-attack')">
}

// SAFE: DOMPurify
import DOMPurify from "isomorphic-dompurify";

function SafeComment({ html }) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br"],
    ALLOWED_ATTR: ["href", "title"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i, // chỉ http/https/mailto
  });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}

// URL injection
function BadLink({ url }) {
  return <a href={url}>Click</a>;
  // Attacker: url = "javascript:alert(document.cookie)"
}

function SafeLink({ url }) {
  // Validate URL
  let safe = "#";
  try {
    const u = new URL(url, window.location.origin);
    if (u.protocol === "http:" || u.protocol === "https:") {
      safe = u.toString();
    }
  } catch {}
  return <a href={safe}>Click</a>;
}

// Markdown rendering an toàn
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeSanitize) // strip nguy hiểm
  .use(rehypeStringify);

const safeHtml = await processor.process(userMarkdown);

// CSP header — defense in depth
// Block inline script + external script không whitelist
"Content-Security-Policy": "default-src 'self'; script-src 'self' 'nonce-XXX'"

// Server-side: validate + sanitize input trước khi lưu DB
"use server";
async function postComment(content: string) {
  const clean = DOMPurify.sanitize(content); // sanitize trước khi save
  await db.comment.create({ data: { content: clean } });
}
```

### Đáp án mẫu

> "React mặc định escape JSX text — `{userInput}` an toàn. Nguy hiểm khi: thứ nhất, `dangerouslySetInnerHTML` — phải sanitize bằng **DOMPurify** với whitelist tags/attrs/URLs. Em config `ALLOWED_URI_REGEXP` chỉ chấp nhận http/https/mailto — chặn `javascript:` scheme. Thứ hai, **URL injection** trong `href`/`src` — validate `URL(value)` và check protocol. Thứ ba, **Markdown rendering** — dùng rehype-sanitize trong unified pipeline. Defense in depth: **CSP header** với `script-src 'self' 'nonce-X'` — kể cả attacker chèn được script tag, browser block vì không có nonce. **Server-side sanitize** trước khi lưu DB (không chỉ rely render-time) — nếu có chỗ nào render quên sanitize, vẫn an toàn. Quy tắc của em: never trust user input ở mọi layer (client form validation + server validation + DB constraint), sanitize ở write time, vẫn sanitize ở read time với content không trust được. Bonus: scan source bằng **ESLint plugin `react/no-danger`** để bắt `dangerouslySetInnerHTML` thiếu sanitize trong PR review."

---

## Câu 2: Authentication flow design `[Senior]`

### Câu hỏi

> Em design auth flow cho Next.js app: login, refresh token, logout, "remember me". Em làm thế nào?

### Giải thích lý thuyết

Best practice 2024-2025:

- **httpOnly cookie** cho session token (không localStorage).
- **Short-lived access token** (15-60 phút) + **long-lived refresh token** (7-30 ngày).
- **Auto refresh** khi access expired.
- **Refresh token rotation** — mỗi lần refresh, server tạo refresh token mới, invalidate cũ.
- **CSRF protection** với sameSite cookie + CSRF token.
- **OAuth2/OIDC** thay self-implemented (NextAuth, Auth.js, Clerk, Supabase Auth).

### Code minh hoạ

```typescript
// Lib: NextAuth.js v5 / Auth.js
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google,
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const user = await verifyUser(credentials.email, credentials.password);
        return user;
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 }, // 1 hour
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
});

// Server Component check auth
// app/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect("/signin");

  return <div>Welcome, {session.user.email}</div>;
}

// Protect Server Action
"use server";
export async function deletePost(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if (!isAdmin(session.user)) throw new Error("Forbidden");

  await db.post.delete({ where: { id } });
}

// Custom JWT + refresh token flow (nếu không dùng NextAuth)
"use server";
async function login(email: string, password: string) {
  const user = await verifyUser(email, password);

  const accessToken = jwt.sign(
    { sub: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = generateRefreshToken();
  await db.refreshToken.create({
    data: { token: hash(refreshToken), userId: user.id, expiresAt: addDays(30) },
  });

  const cookieStore = await cookies();
  cookieStore.set("access", accessToken, {
    httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 15,
  });
  cookieStore.set("refresh", refreshToken, {
    httpOnly: true, secure: true, sameSite: "strict", maxAge: 60 * 60 * 24 * 30,
    path: "/api/auth/refresh",
  });
}

// Refresh endpoint
// app/api/auth/refresh/route.ts
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const refresh = cookieStore.get("refresh")?.value;
  if (!refresh) return new Response("Unauthorized", { status: 401 });

  const stored = await db.refreshToken.findUnique({ where: { token: hash(refresh) } });
  if (!stored || stored.expiresAt < new Date()) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Rotation: invalidate cũ, tạo mới
  await db.refreshToken.delete({ where: { id: stored.id } });
  const newRefresh = generateRefreshToken();
  await db.refreshToken.create({
    data: { token: hash(newRefresh), userId: stored.userId, expiresAt: addDays(30) },
  });

  const newAccess = jwt.sign({ sub: stored.userId }, process.env.JWT_SECRET, { expiresIn: "15m" });

  cookieStore.set("access", newAccess, { ... });
  cookieStore.set("refresh", newRefresh, { ... });
  return Response.json({ ok: true });
}

// Middleware: check + auto refresh
// middleware.ts
import { NextResponse } from "next/server";

export async function middleware(req) {
  const access = req.cookies.get("access")?.value;
  const refresh = req.cookies.get("refresh")?.value;

  if (!access && refresh) {
    // Auto refresh
    const res = await fetch(`${req.nextUrl.origin}/api/auth/refresh`, {
      method: "POST",
      headers: { cookie: req.headers.get("cookie") ?? "" },
    });
    if (res.ok) {
      const next = NextResponse.next();
      // Forward set-cookie từ refresh response
      res.headers.getSetCookie?.().forEach((c) => next.headers.append("set-cookie", c));
      return next;
    }
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (!access) return NextResponse.redirect(new URL("/signin", req.url));
  return NextResponse.next();
}

// Logout
"use server";
async function logout() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get("refresh")?.value;
  if (refresh) {
    await db.refreshToken.delete({ where: { token: hash(refresh) } });
  }
  cookieStore.delete("access");
  cookieStore.delete("refresh");
}
```

### Đáp án mẫu

> "Em **không** tự implement auth từ đầu — dùng **NextAuth.js v5 (Auth.js)** hoặc **Clerk** cho production. Lý do: auth là bảo mật critical, edge case nhiều (password reset, email verification, OAuth flow, MFA) — tự code dễ miss. Auth.js handle session JWT, OAuth, callback đầy đủ. Architecture: **httpOnly cookie** chứa session token (KHÔNG localStorage — XSS), `secure: true`, `sameSite: 'lax'` cho CSRF protection. **Short-lived access token (15min) + long-lived refresh token (30 days)** với **rotation** — mỗi refresh tạo refresh token mới, invalidate cũ, detect compromise. Refresh token có `path: '/api/auth/refresh'` chỉ gửi cho endpoint refresh — minimize exposure. **Middleware** check session, auto refresh nếu access expired. **Server Component + Server Action** call `auth()` để get session — type-safe. **Authorization**: phân biệt 401 (chưa auth → redirect signin) vs 403 (auth nhưng không quyền → toast). 'Remember me' implement qua refresh token duration: checked = 30 ngày, unchecked = session cookie expire khi browser close. MFA em add khi compliance yêu cầu — TOTP qua Authenticator app, hoặc passkey (modern, không cần password)."

---

## Câu 3: Testing pyramid cho FE app `[Senior]`

### Câu hỏi

> Em strategy test cho app FE thế nào? Unit, integration, E2E — tỷ lệ và tool?

### Giải thích lý thuyết

Testing pyramid:

```
        /\
       /E2E\          5-10%   Critical user flow (login, checkout)
      /------\
     / Integ. \       20-30%  Component + hook + state
    /----------\
   / Unit tests \     60-70%  Pure function, util, simple component
  /--------------\
```

Tools 2024-2025:
- **Vitest** — modern, fast, ESM-first, ngon hơn Jest cho Vite/Next.
- **React Testing Library** — DOM testing, user-centric.
- **MSW** — mock API ở network layer.
- **Playwright** — E2E modern, support multi-browser.
- **Storybook + interactions** — visual + component test.

### Code minh hoạ

```typescript
// 1. Unit test — pure function
import { describe, it, expect } from "vitest";
import { formatCurrency } from "./utils";

describe("formatCurrency", () => {
  it.each([
    [1000, "1.000 ₫"],
    [1000000, "1.000.000 ₫"],
    [0, "0 ₫"],
  ])("formats %d → %s", (input, expected) => {
    expect(formatCurrency(input)).toBe(expected);
  });
});

// 2. Integration test — component + API
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.get("/api/users", () => HttpResponse.json([{ id: "1", name: "An" }])),
  http.post("/api/users", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: "2", ...body }, { status: 201 });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("UserForm", () => {
  it("creates user successfully", async () => {
    render(<UserForm />);

    await userEvent.type(screen.getByLabelText(/name/i), "Bình");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/đã lưu/i)).toBeInTheDocument();
    });
  });

  it("shows validation error", async () => {
    render(<UserForm />);
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(await screen.findByText(/tên không được rỗng/i)).toBeInTheDocument();
  });
});

// 3. E2E test — Playwright
import { test, expect } from "@playwright/test";

test("user can complete checkout", async ({ page }) => {
  await page.goto("/");

  // Add product to cart
  await page.getByRole("link", { name: /sản phẩm/i }).click();
  await page.getByRole("button", { name: /thêm vào giỏ/i }).first().click();

  // Cart
  await page.getByRole("link", { name: /giỏ hàng/i }).click();
  await expect(page.getByText(/1 sản phẩm/i)).toBeVisible();

  // Checkout
  await page.getByRole("button", { name: /thanh toán/i }).click();
  await page.getByLabel(/họ tên/i).fill("Nguyễn Văn An");
  await page.getByLabel(/email/i).fill("an@example.com");
  await page.getByLabel(/địa chỉ/i).fill("123 Đường ABC");

  await page.getByRole("button", { name: /đặt hàng/i }).click();

  // Success
  await expect(page.getByText(/đặt hàng thành công/i)).toBeVisible();
});

// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  projects: [
    { name: "chromium", use: devices["Desktop Chrome"] },
    { name: "mobile", use: devices["Pixel 5"] },
    { name: "webkit", use: devices["Desktop Safari"] },
  ],
  webServer: { command: "npm run dev", port: 3000, reuseExistingServer: true },
});

// 4. Visual regression với Storybook + Chromatic
// Button.stories.tsx
export default { title: "Button", component: Button };
export const Primary = { args: { variant: "primary" } };
export const Disabled = { args: { disabled: true } };

// chromatic publish → screenshot mỗi story, detect diff trong PR
```

### Đáp án mẫu

> "Em theo pyramid: nhiều unit, vừa integration, ít E2E. **Unit (60-70%)** với Vitest cho pure function, utility, parser, validator — chạy ms, fail loud. **Integration (20-30%)** với React Testing Library + MSW: render component, mock API ở network layer (MSW intercept fetch — không mock module), test user flow trong 1 component/feature. MSW quan trọng vì nó test cả serialization/parsing thật, không mock function level. **E2E (5-10%)** với Playwright: chỉ critical flow — login, checkout, signup, payment. E2E chậm và brittle, em không cover edge case ở đây — chỉ happy path + 1-2 error path. Cross-browser: chromium + webkit + mobile pixel để catch issue browser-specific. **Visual regression** với Storybook + Chromatic: catch UI drift trong component library. Coverage target: **>80% lines, >70% branches** với Vitest coverage. Em không chase 100% — diminishing return. Trade-off: chú trọng tests đúng layer — 90% unit, 10% E2E là sai (miss integration bug); 0% unit + 100% E2E cũng sai (test chậm, fail flaky). CI: unit + integration mỗi PR (~1 phút), E2E nightly hoặc trên main merge (~10 phút)."

---

## Câu 4: CI/CD cho FE production `[Senior]`

### Câu hỏi

> Em set up CI/CD cho team 10 dev, ship mỗi tuần. Em chạy gì trong pipeline?

### Giải thích lý thuyết

Pipeline tiêu chuẩn:

1. **Pre-commit hook** — lint, format, type check (lint-staged).
2. **PR pipeline**:
   - Install + cache deps.
   - Typecheck.
   - Lint.
   - Unit + integration test.
   - Build.
   - Preview deploy (Vercel preview hoặc Netlify deploy preview).
   - E2E test trên preview URL.
3. **Main merge**:
   - All above + production deploy.
   - Smoke test post-deploy.
   - Sentry source map upload.
4. **Nightly**:
   - Full E2E suite cross-browser.
   - Visual regression.
   - Lighthouse CI.

### Code minh hoạ

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  install:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile

  typecheck:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck

  lint:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  test:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm test --coverage
      - uses: codecov/codecov-action@v4

  build:
    needs: [typecheck, lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm build

  e2e:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps
      - run: pnpm e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  lighthouse:
    if: github.event_name == 'pull_request'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            ${{ github.event.deployment_status.environment_url }}
          uploadArtifacts: true

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: [e2e]
    runs-on: ubuntu-latest
    steps:
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: --prod
```

```json
// package.json
{
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "build": "next build",
    "prepare": "husky"
  }
}

// .husky/pre-commit
pnpm exec lint-staged

// lint-staged.config.js
export default {
  "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"],
};

// Bundle size budget
// .github/workflows/bundle-budget.yml
- uses: github/super-linter@v6
- run: pnpm build
- uses: andresz1/size-limit-action@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
```

### Đáp án mẫu

> "Pipeline em set 4 layer. **Pre-commit hook** (husky + lint-staged) — eslint fix + prettier format chỉ trên file staged, chạy dưới 2s, không annoy dev. **PR pipeline** chạy parallel: typecheck, lint, unit test với coverage upload Codecov, build. Nếu pass → deploy preview Vercel — URL tự comment vào PR. **E2E test trên preview URL** với Playwright — chạy ~3-5 phút, parallel matrix cross-browser. **Lighthouse CI** measure preview performance — fail nếu LCP/CLS regress. **Bundle size budget** với size-limit — fail nếu bundle JS tăng quá threshold. **Main merge**: deploy production + smoke test + Sentry source map upload + Vercel Cron alert nếu metric regress. **Nightly**: full E2E cross-browser, visual regression Chromatic. Convention chặt: PR phải green trước merge (branch protection rule), required check là typecheck + lint + test + e2e. Để CI nhanh: dùng pnpm + GitHub Actions cache cho node_modules + Playwright browser cache. Turborepo remote cache nếu monorepo. Em tránh: chạy E2E mọi PR (chậm, flaky) → chỉ critical flow trên PR, full suite nightly. Test rule: nếu nightly fail thường xuyên, refactor test thay vì retry."

---

## Câu 5: Feature flag — strategy production `[Senior]`

### Câu hỏi

> Em deploy feature mới nhưng chưa muốn enable cho mọi user. Em design feature flag system thế nào?

### Giải thích lý thuyết

Feature flag uses:
- **Kill switch** — disable feature lỗi không cần rollback.
- **Gradual rollout** — 1% → 10% → 50% → 100%.
- **A/B test** — variant flag.
- **Targeting** — feature cho beta user, internal team, specific country.
- **Trunk-based development** — merge feature chưa hoàn thiện (hide behind flag).

Solutions:
- Self-hosted: **GrowthBook** (open-source), **Unleash**.
- Managed: **LaunchDarkly**, **Statsig**, **PostHog**.
- Simple: env variable + config in code.

### Code minh hoạ

```typescript
// GrowthBook (open-source, self-host được)
// next.config.js
import { GrowthBook, GrowthBookProvider } from "@growthbook/growthbook-react";

// app/providers.tsx
const gb = new GrowthBook({
  apiHost: process.env.NEXT_PUBLIC_GROWTHBOOK_HOST,
  clientKey: process.env.NEXT_PUBLIC_GROWTHBOOK_KEY,
  enableDevMode: process.env.NODE_ENV === "development",
});

export function Providers({ children, user }) {
  useEffect(() => {
    gb.setAttributes({
      id: user.id,
      country: user.country,
      plan: user.plan,
      employee: user.email.endsWith("@example.com"),
    });
    gb.loadFeatures();
  }, [user]);

  return <GrowthBookProvider growthbook={gb}>{children}</GrowthBookProvider>;
}

// Component dùng flag
import { useFeatureIsOn, useFeatureValue } from "@growthbook/growthbook-react";

function NewSearchUI() {
  const isOn = useFeatureIsOn("new-search-ui");
  if (!isOn) return <OldSearchUI />;
  return <NewSearchComponent />;
}

function PricingPage() {
  const variant = useFeatureValue("pricing-variant", "control");
  return variant === "control" ? <PricingV1 /> : <PricingV2 />;
}

// Server-side check
// app/feature-check.ts
"use server";
export async function checkFeature(name: string, user: User) {
  const gb = new GrowthBook({ ... });
  await gb.loadFeatures();
  gb.setAttributes({ id: user.id, country: user.country });
  return gb.isOn(name);
}

// Targeting trong GrowthBook dashboard:
// - Rule 1: country === "VN" → enable
// - Rule 2: employee === true → enable
// - Rule 3: 10% rollout
// - Default: disabled

// Simple inline pattern cho startup nhỏ
// lib/features.ts
const FEATURES = {
  newCheckout: process.env.NEXT_PUBLIC_FEATURE_NEW_CHECKOUT === "true",
  betaSearch: process.env.NEXT_PUBLIC_FEATURE_BETA_SEARCH === "true",
};

export function useFeature(name: keyof typeof FEATURES) {
  return FEATURES[name];
}

// Hoặc per-user qua cookie/session
export function useFeature(name: string) {
  const { user } = useAuth();
  const enabledForUser = user?.features?.includes(name);
  return enabledForUser || FEATURES[name];
}

// Cleanup flag — sau khi 100% rollout
// Phải delete code path cũ + flag → tránh code rot
// Pattern: comment TODO với deadline + tracking ticket
// useFeatureIsOn("new-search-ui") // TODO: cleanup after 2025-12-01, ticket JIRA-1234
```

### Đáp án mẫu

> "Em dùng **GrowthBook** self-hosted (open-source, không lock vendor) hoặc **Statsig** managed. Architecture: SDK load feature definition từ API; component check flag qua `useFeatureIsOn('feature-name')`. Targeting rule define ở dashboard: 'country === VN', 'employee === true', '10% gradual rollout', '@beta user'. Phía dev không hard-code logic targeting trong code — chỉ check flag, business owner config targeting qua UI. **Use cases**: **kill switch** — feature lỗi production, em flip flag tắt ngay, không cần rollback deploy. **Gradual rollout** — 1% → 10% → 50% → 100% theo dõi metric mỗi nấc. **A/B test** kết hợp với analytics. **Internal beta** — enable cho employee email domain. **Targeting** geo — feature mới chỉ enable VN trước. Server-side check cho server component (call SDK trong RSC). **Anti-pattern em tránh**: flag tồn tại forever — code rot. Mỗi flag có TODO comment với deadline + ticket cleanup. CI script alert nếu flag > 90 ngày chưa cleanup. Cho team nhỏ chưa cần platform: simple env variable + per-user feature column trong DB là đủ start."

---

## Câu 6: Privacy & GDPR — em handle thế nào? `[Senior]`

### Câu hỏi

> App em chạy ở EU. Em cần làm gì để GDPR compliance ở FE?

### Giải thích lý thuyết

GDPR + ePrivacy requirements:

1. **Cookie consent** — chỉ track sau khi user consent. Necessary cookie OK, analytics/marketing cần explicit consent.
2. **Right to access** — user xem được data đang lưu.
3. **Right to deletion** — user xoá account + data.
4. **Right to portability** — export data dạng machine-readable.
5. **Data minimization** — chỉ collect data cần thiết.
6. **PII handling** — encrypt at rest + transit, log không có PII.
7. **Cookie banner** UI: chấp nhận, từ chối, customize đều **prominently** (không dark pattern).

### Code minh hoạ

```typescript
// Cookie consent với @consentmanager/react
// Hoặc tự build đơn giản
"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Consent = {
  necessary: true;        // luôn true
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
};

const defaultConsent: Consent = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

const ConsentContext = createContext<{
  consent: Consent;
  update: (c: Partial<Consent>) => void;
}>({ consent: defaultConsent, update: () => {} });

export function ConsentProvider({ children }) {
  const [consent, setConsent] = useState<Consent>(defaultConsent);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("consent");
    if (stored) {
      setConsent(JSON.parse(stored));
    } else {
      setShown(true);
    }
  }, []);

  const update = (c: Partial<Consent>) => {
    const next = { ...consent, ...c };
    setConsent(next);
    localStorage.setItem("consent", JSON.stringify(next));
    setShown(false);

    // Trigger analytics load/unload
    if (next.analytics) {
      window.gtag?.("consent", "update", { analytics_storage: "granted" });
    }
  };

  return (
    <ConsentContext.Provider value={{ consent, update }}>
      {children}
      {shown && <ConsentBanner onAccept={(c) => update(c)} />}
    </ConsentContext.Provider>
  );
}

// Cookie banner UI
function ConsentBanner({ onAccept }) {
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  return (
    <div role="dialog" aria-labelledby="consent-title">
      <h2 id="consent-title">Quản lý cookie</h2>
      <p>Chúng tôi dùng cookie để cải thiện trải nghiệm.</p>

      {expanded ? (
        <>
          <label><input type="checkbox" checked disabled /> Cookie cần thiết</label>
          <label><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> Analytics</label>
          <label><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> Marketing</label>
          <button onClick={() => onAccept({ analytics, marketing, preferences: false })}>Lưu lựa chọn</button>
        </>
      ) : (
        <>
          <button onClick={() => onAccept({ analytics: false, marketing: false, preferences: false })}>
            Chỉ cần thiết
          </button>
          <button onClick={() => onAccept({ analytics: true, marketing: true, preferences: true })}>
            Chấp nhận tất cả
          </button>
          <button onClick={() => setExpanded(true)}>Tuỳ chỉnh</button>
        </>
      )}
    </div>
  );
}

// Conditional load analytics
function Analytics() {
  const { consent } = useContext(ConsentContext);
  if (!consent.analytics) return null;

  return (
    <Script
      src="https://www.googletagmanager.com/gtag/js?id=G-XXX"
      strategy="afterInteractive"
    />
  );
}

// User data access/deletion endpoints
// app/api/me/export/route.ts
export async function GET() {
  const session = await auth();
  const userData = await db.collectAllUserData(session.user.id);
  return new Response(JSON.stringify(userData), {
    headers: { "Content-Disposition": "attachment; filename=my-data.json" },
  });
}

// app/api/me/delete/route.ts
export async function DELETE() {
  const session = await auth();
  await db.deleteAllUserData(session.user.id);
  await sendEmail(session.user.email, "Account deletion confirmed");
  return Response.json({ ok: true });
}

// Logging — strip PII
import pino from "pino";

const logger = pino({
  redact: ["email", "password", "ssn", "phone", "*.creditCard"],
});

logger.info({ user: { id: "u1", email: "a@b.com" } }, "Login");
// Output: {"user": {"id": "u1", "email": "[Redacted]"}}
```

### Đáp án mẫu

> "EU/GDPR compliance không phải optional — fine có thể lên 4% doanh thu toàn cầu. Em check 6 thứ. **Cookie consent**: banner show ngay lần load đầu, **không** track analytics/marketing trước khi user consent. Banner phải có 3 option ngang nhau: 'chấp nhận tất cả', 'chỉ cần thiết', 'tuỳ chỉnh' — không dark pattern (button refuse phải dễ thấy như button accept). Lưu choice vào localStorage + reload conditional analytics. **Right to access + deletion + portability**: endpoint `/api/me/export` trả JSON tất cả data user, `/api/me/delete` xoá hoàn toàn (không soft-delete) + email confirm. **Data minimization**: chỉ collect field cần — review schema regular. Don't store IP nếu không thực sự cần. **PII in logs**: pino với `redact: ['email', 'password', 'creditCard']` — log không leak PII. **Encryption**: HTTPS bắt buộc (HSTS), DB encrypted at rest (managed Postgres mặc định có). **Third-party processor**: list trong privacy policy, có DPA agreement. **Data breach**: phải notify trong 72h — em set up Sentry alert + incident response runbook. Bonus: dùng platform như Cookiebot, OneTrust nếu không muốn tự build — IAB TCF compliance complex. Lawyer review privacy policy + ToS — không tự viết."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "React tự động ngăn XSS"                               | Chỉ với JSX text; `dangerouslySetInnerHTML` vẫn nguy hiểm            |
| "JWT trong localStorage để gọi API tiện"               | XSS đọc được; httpOnly cookie + secure mới đúng                      |
| "E2E test cover được hết bug nên ít unit test cũng OK" | E2E chậm + brittle; pyramid balanced mới hiệu quả                    |
| "Feature flag chỉ cho A/B test"                        | Còn cho kill switch, gradual rollout, trunk-based dev                |
| "GDPR chỉ áp dụng cho app EU"                          | Áp dụng cho mọi app có user EU; cần xác định jurisdiction            |
