---
sidebar_position: 1
title: "1. Frontend Architecture"
---

# Frontend Architecture

> *Đây là vòng quyết định Senior vs Mid. Interviewer sẽ vẽ một sản phẩm trên giấy và bảo "thiết kế cho anh xem". Không có đáp án đúng — chỉ có lý lẽ chặt chẽ và trade-off rõ ràng.*

:::note[Ghi nhớ nhanh]

- ⭐ **Không có đáp án đúng, chỉ có `trade-off`** — mỗi quyết định kiến trúc phải có lý do (không cargo cult), cân bằng performance + DX + maintainability + team scale.
- ⭐ **Migration dùng `Strangler Fig`, không `big bang rewrite`** — build phần mới bằng stack mới, thay thế legacy dần qua `anti-corruption layer`; rewrite toàn bộ hầu như luôn fail.
- **`Monorepo` (Turborepo) vs `Polyrepo`** — monorepo cho atomic change + code sharing; polyrepo cho team độc lập + ownership tách biệt.
- **`Micro-frontend` chỉ đáng khi scale lớn** — 50+ dev, nhiều team; team nhỏ (&lt;20) là over-engineering.
- **Design system: ưu tiên `shadcn/ui` + `Radix` + `Tailwind`** — own code, a11y built-in, bundle nhỏ; `design tokens` define 1 chỗ qua CSS variable.
- **Error handling 3 tầng** — `component` (try/catch) → `Error Boundary` (render error) → `global` (window.onerror + Sentry).

:::

---

## Câu 1: Thiết kế kiến trúc cho ứng dụng cỡ trung `[Senior]`

### Câu hỏi

> Em hãy thiết kế kiến trúc FE cho một e-commerce app: 50 page, 20 dev, ship hàng tuần. Em chọn stack và folder structure thế nào?

### Giải thích lý thuyết

Câu này không có "đáp án đúng". Interviewer đánh giá:

- Có **lý do** cho mỗi quyết định không (không cargo cult).
- Có nhận biết **trade-off** không.
- Có nghĩ về **team scale** (20 dev cần convention chặt) không.
- Có quan tâm **performance** + **DX** + **maintainability** balance.

Stack tham khảo cho app cỡ trung (2024-2025):
- **Framework**: Next.js (App Router) hoặc Remix.
- **State**: TanStack Query (server) + Zustand (client).
- **Styling**: Tailwind + Radix UI.
- **Form**: react-hook-form + Zod.
- **Testing**: Vitest + Playwright.
- **Type**: TypeScript strict.
- **Lint**: ESLint + Prettier + lint-staged.
- **Monorepo** (optional): Turborepo nếu có multiple package.

### Code minh hoạ

```
my-ecommerce/
├── apps/
│   ├── web/                    # Next.js main app
│   ├── admin/                  # Admin panel
│   └── docs/                   # Internal docs (Docusaurus)
├── packages/
│   ├── ui/                     # Shared design system
│   │   ├── components/
│   │   ├── tokens.css
│   │   └── package.json
│   ├── api-client/             # Shared API SDK với type
│   ├── utils/                  # Helper functions
│   └── eslint-config/          # Shared lint rules
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

```
apps/web/
├── app/                        # Next.js App Router
│   ├── (marketing)/           # Route group: marketing pages
│   │   ├── about/
│   │   ├── pricing/
│   │   └── layout.tsx
│   ├── (shop)/                # Route group: shop pages
│   │   ├── products/
│   │   │   ├── [slug]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── error.tsx
│   │   │   └── page.tsx
│   │   ├── cart/
│   │   └── checkout/
│   ├── (account)/             # Authenticated routes
│   │   ├── orders/
│   │   ├── settings/
│   │   └── layout.tsx          # Auth check
│   ├── api/                    # Route handlers
│   │   ├── webhook/
│   │   └── revalidate/
│   ├── layout.tsx
│   └── page.tsx
├── components/                 # App-specific components
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGallery.tsx
│   │   └── ProductReviews.tsx
│   ├── cart/
│   └── checkout/
├── features/                    # Feature-based modules (nếu phức tạp)
│   ├── search/
│   │   ├── api.ts
│   │   ├── store.ts
│   │   ├── components/
│   │   └── hooks/
│   └── recommendations/
├── lib/                         # Shared utilities
│   ├── auth.ts
│   ├── db.ts
│   ├── stripe.ts
│   └── utils.ts
├── hooks/                       # Cross-cutting hooks
├── styles/
├── public/
├── middleware.ts
├── instrumentation.ts           # Sentry setup
└── next.config.js
```

### Đáp án mẫu

> "Cho e-commerce 50 page và 20 dev, em đề xuất stack: **Next.js App Router** (RSC + streaming + image opt built-in), **TanStack Query** cho server state + **Zustand** cho client state, **Tailwind + Radix UI** cho styling/component (Radix là headless với a11y built-in), **react-hook-form + Zod** cho form, **Vitest + Playwright** cho test, **TypeScript strict** + ESLint + Prettier. Folder structure: dùng **route group** trong App Router để organize page theo concern — `(marketing)`, `(shop)`, `(account)` — mỗi group có layout riêng. Components chia theo **domain** (`components/product/`, `components/cart/`) chứ không theo type (`components/buttons/`). Cho feature phức tạp (search với filter, recommendations), tạo `features/<name>/` chứa api + store + components + hooks — colocate liên quan. Với 20 dev, em dùng **monorepo Turborepo** tách: `packages/ui` (design system), `packages/api-client` (SDK gen từ OpenAPI), `packages/utils` — chia ownership team rõ. Convention enforce qua ESLint + commit hook. Hàng tuần ship cần CI/CD chặt: typecheck + test + build + deploy preview cho mỗi PR."

---

## Câu 2: Monorepo vs Polyrepo `[Senior]`

### Câu hỏi

> Team em có 1 web app, 1 mobile app (React Native), 1 admin panel, 1 marketing site. Em chia monorepo hay polyrepo? Lý do?

### Giải thích lý thuyết

| Yếu tố                  | Monorepo                                       | Polyrepo                              |
| ----------------------- | ---------------------------------------------- | ------------------------------------- |
| Code sharing            | Dễ (import package trực tiếp)                  | Khó (publish npm, version bump)       |
| Atomic change           | Cross-package PR trong 1 commit                 | Multiple PR, sync version             |
| CI                      | Cần Turbo/Nx để smart rebuild                  | Mỗi repo CI độc lập                   |
| Onboarding              | Clone 1 repo                                   | Clone nhiều                           |
| Ownership/access        | Khó (toàn repo open)                           | Dễ (per-repo permission)              |
| Build time              | Có thể chậm nếu không cache                    | Mỗi repo độc lập                      |
| Version conflict        | Single version policy                           | Mỗi repo tự version                   |

Best fit:
- **Monorepo**: team sharing code nhiều, cần atomic change cross-package.
- **Polyrepo**: team độc lập, ownership rõ, ít code sharing.

### Code minh hoạ

```bash
# Monorepo với Turborepo
my-org/
├── apps/
│   ├── web/                  # Next.js
│   ├── mobile/               # Expo React Native
│   ├── admin/                # Admin panel
│   └── marketing/            # Marketing site (Astro)
├── packages/
│   ├── ui/                   # Shared design system
│   ├── api-client/           # SDK generated từ OpenAPI
│   ├── types/                # Shared TypeScript types
│   ├── utils/                # Helpers
│   └── eslint-config/
├── turbo.json
└── pnpm-workspace.yaml
```

```json
// turbo.json — task pipeline
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

```json
// pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

```typescript
// apps/web — import shared package
import { Button, Card } from "@my-org/ui";
import { api } from "@my-org/api-client";
import type { User } from "@my-org/types";

// Atomic change: thêm field vào type, update API + web + mobile cùng 1 PR
// Polyrepo: phải publish @my-org/types v2.0, sau đó bump cả web và mobile
```

```bash
# Turbo commands
turbo build              # build tất cả
turbo build --filter=web # chỉ web (+ deps)
turbo dev                # dev mode parallel
turbo test --filter=...HEAD^1  # chỉ package changed
```

### Đáp án mẫu

> "Em chọn **monorepo với Turborepo**. Lý do: web/mobile/admin chia sẻ rất nhiều code — design system, API client, types, business logic. Polyrepo buộc em publish npm package mỗi lần đổi type → bump version → update consumer → 3 PR đồng bộ — slow và dễ ra of sync. Monorepo cho phép atomic change: 1 PR update type ở `packages/types`, update web + mobile + admin cùng commit. Stack: pnpm workspace cho linking, Turborepo cho task pipeline + remote cache (CI build 30s thay vì 5 phút sau khi cache hit). Mỗi app trong `apps/`, shared trong `packages/`. Trade-off em accept: repo to (5GB sau vài tháng — cần git LFS hoặc partial clone), CI cần config matrix để chỉ test package affected, và quyền access toàn repo (chia ownership qua CODEOWNERS). Polyrepo em chọn khi: team hoàn toàn độc lập, không share code, hoặc compliance yêu cầu access tách biệt (đặc biệt cho payment service riêng). Nx là alternative — feature-rich hơn Turborepo nhưng curve dốc."

---

## Câu 3: Micro-frontends — khi nào cần thực sự? `[Senior]`

### Câu hỏi

> Em đã nghe micro-frontend. App của em (5 dev) có nên dùng không?

### Giải thích lý thuyết

**Micro-frontend**: chia FE app thành các "module" độc lập, owned bởi team khác nhau, deploy riêng, integrate ở runtime hoặc build.

Tech: Module Federation (Webpack 5), single-spa, Module Federation Vite, iframe-based.

Khi nên dùng:
- **Multiple teams** (50+ dev, vài chục team) cần ship độc lập.
- Code base cũ phải co-exist với code mới.
- Multiple framework (React + Vue + Angular legacy).

Khi KHÔNG nên:
- Team nhỏ (dưới 20 người).
- App đơn giản, không có lý do team boundaries.
- Performance critical (overhead loading multiple bundles).

Trade-off:
- Tăng complexity infra (deploy, version, communication).
- Shared design system khó maintain consistency.
- Cross-team coordination cho breaking change.
- Bundle duplication nếu không share dependencies.

### Code minh hoạ

```javascript
// Module Federation (Webpack 5) — runtime integration
// host/webpack.config.js
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "host",
      remotes: {
        cart: "cart@http://cart.example.com/remoteEntry.js",
        checkout: "checkout@http://checkout.example.com/remoteEntry.js",
      },
      shared: { react: { singleton: true }, "react-dom": { singleton: true } },
    }),
  ],
};

// host App
import React, { lazy, Suspense } from "react";
const Cart = lazy(() => import("cart/Cart"));
const Checkout = lazy(() => import("checkout/Checkout"));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Cart />
      <Checkout />
    </Suspense>
  );
}

// cart/webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "cart",
      filename: "remoteEntry.js",
      exposes: {
        "./Cart": "./src/Cart",
      },
      shared: { react: { singleton: true } },
    }),
  ],
};

// Alternative: iframe-based (đơn giản hơn nhưng UX kém)
<iframe src="https://cart.example.com" />

// Alternative: build-time integration (kém linh hoạt nhưng đơn giản)
// Mỗi team build npm package, host install và compose
```

### Đáp án mẫu

> "Với 5 dev, em **không** dùng micro-frontend. Lợi của MFE là team độc lập deploy — nhưng team nhỏ thì không cần đánh đổi complexity. Coordination 5 người ngồi cùng phòng đã đủ rồi, không cần infra phức tạp. Em chỉ recommend MFE khi: organization 50+ FE dev với nhiều team chuyên domain (cart, checkout, search, recommendation), cần ship deploy độc lập, hoặc co-exist legacy + new tech. Tech phổ biến: **Module Federation Webpack 5** (Vite cũng có plugin). Trade-off real em đã thấy: bundle duplication nếu không config `shared` đúng (mỗi MFE ship React riêng → user tải React 5 lần); design system consistency khó (mỗi team tự update version); cross-team integration test khó (mỗi MFE thay đổi có thể break host); performance worse (initial load chậm hơn monolithic vì nhiều bundle entry). Alternative đơn giản: chia monorepo theo team, single deploy nhưng feature ownership rõ — đủ cho phần lớn case. Một dấu hiệu thực sự cần MFE: có >2 framework đang cùng tồn tại và không thể consolidate."

---

## Câu 4: Design System — build hay dùng có sẵn? `[Senior]`

### Câu hỏi

> Em build app từ scratch. Design system: tự build, dùng MUI/Ant Design, hay headless + Tailwind?

### Giải thích lý thuyết

3 hướng chính:

| Option                        | Pros                                                   | Cons                                                  |
| ----------------------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| **MUI/Ant Design/Chakra**     | Ship nhanh, đầy đủ component, docs tốt                 | Bundle to, hard customize, "MUI smell" trong UI       |
| **Headless (Radix/Headless UI) + Tailwind** | Custom UI tự do, accessibility built-in, small bundle | Phải code mỗi component, slower start |
| **shadcn/ui** (copy-paste)    | Best of both: code own, không lock vào lib version    | Phải maintain own copy, bug fix manual                |
| **Tự build từ scratch**       | Fully custom                                            | Tốn thời gian, dễ miss a11y                          |

Trend 2024-2025: **shadcn/ui** dominate cho app mới — copy code vào codebase, tự own, dựa Radix + Tailwind.

### Code minh hoạ

```tsx
// shadcn/ui — install qua CLI, code copy vào app
// npx shadcn-ui@latest add button

// Code generated trong components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);

// Build design tokens với CSS variable
// app/globals.css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}

.dark {
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --background: 222.2 84% 4.9%;
}

// tailwind.config.ts — reference variable
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
    },
    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
    },
  },
},

// MUI alternative
import { Button } from "@mui/material";
<Button variant="contained" color="primary">Click</Button>
// ~80kb bundle, customize qua theme provider (verbose)
```

### Đáp án mẫu

> "Em chọn **shadcn/ui + Radix + Tailwind** cho 80% case. Lý do: shadcn không phải npm package — em copy code vào codebase, own hoàn toàn. Không bị lock vào version, tự bug fix, tự customize. Radix lo accessibility (modal focus trap, dropdown keyboard nav, ARIA roles) — tự code dễ miss. Tailwind cho styling control hoàn toàn. Bundle chỉ chứa component dùng — nhỏ hơn rất nhiều so với MUI/Ant. Design tokens em define qua CSS variable trong `globals.css` — HSL color cho theme switching dễ. **MUI/Ant Design** em chọn khi: cần ship MVP cực nhanh và không có designer; app internal admin tool — UI consistency không quá quan trọng. Trade-off: 'MUI look' nhận ra được, customize sâu cần override theme phức tạp. **Build từ scratch** chỉ khi: design rất unique (creative agency, branded), team có nhiều dev có thời gian, hoặc cần performance tối đa. Một detail: design tokens (color, spacing, radius) **bắt buộc** define ở 1 chỗ — dù choice nào — để đổi theme/dark mode chỉ 1 file."

---

## Câu 5: Error handling strategy — toàn bộ app `[Senior]`

### Câu hỏi

> Em design error handling strategy cho app production. Layer nào catch error, hiển thị gì cho user, log như thế nào?

### Giải thích lý thuyết

3 tầng error handling:

1. **Component-level** — try/catch trong event handler, async function trong component.
2. **Error Boundary** — catch error render phase, hiển thị fallback UI cho subtree.
3. **Global** — `window.onerror`, `unhandledrejection`, Sentry global handler.

User-facing messages:
- **Expected error** (validation, 404): clear message, actionable.
- **Unexpected** (5xx, JS error): generic message + "thử lại" + report tự động.
- **Network** (offline, timeout): cần retry button, indicate connectivity.

Logging:
- Component error → log với context (user, route, props).
- Production: source map upload để stack trace readable.
- Tránh log PII (email, password) — security risk.

### Code minh hoạ

```tsx
// 1. ErrorBoundary tầng global + per-route
import { ErrorBoundary } from "react-error-boundary";

function App() {
  return (
    <ErrorBoundary FallbackComponent={GlobalError} onError={logError}>
      <Header />
      <Routes>
        <Route path="/dashboard" element={
          <ErrorBoundary FallbackComponent={DashboardError} onReset={() => queryClient.resetQueries()}>
            <Dashboard />
          </ErrorBoundary>
        } />
      </Routes>
    </ErrorBoundary>
  );
}

function GlobalError({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <h1>Có lỗi xảy ra</h1>
      <p>Chúng tôi đã được thông báo và đang xử lý.</p>
      <button onClick={resetErrorBoundary}>Thử lại</button>
      <button onClick={() => location.reload()}>Tải lại trang</button>
    </div>
  );
}

// 2. Global handler cho async error (không vào ErrorBoundary)
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  Sentry.captureException(event.reason);
});

window.addEventListener("error", (event) => {
  console.error("Uncaught error:", event.error);
  Sentry.captureException(event.error);
});

// 3. Component-level — async event handler
async function handleSubmit() {
  try {
    setLoading(true);
    await api.submit(data);
    toast.success("Đã lưu");
  } catch (e) {
    if (e instanceof NetworkError) {
      toast.error("Mất kết nối. Vui lòng kiểm tra mạng.");
      return;
    }
    if (e instanceof ApiError && e.status === 422) {
      setFieldErrors(e.fieldErrors);
      return;
    }
    // Unknown error
    Sentry.captureException(e, { extra: { data } });
    toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
  } finally {
    setLoading(false);
  }
}

// 4. TanStack Query — error/retry built-in
const { data, error, isError, refetch } = useQuery({
  queryKey: ["products"],
  queryFn: fetchProducts,
  retry: 3,
  retryDelay: (i) => Math.min(1000 * 2 ** i, 30000), // exponential backoff
});

if (isError) {
  return (
    <div>
      <p>Không tải được danh sách sản phẩm</p>
      <button onClick={() => refetch()}>Thử lại</button>
    </div>
  );
}

// 5. Custom error class
class ApiError extends Error {
  constructor(public status: number, public fieldErrors?: Record<string, string>) {
    super(`API error: ${status}`);
    this.name = "ApiError";
  }
}

class NetworkError extends Error {
  constructor() {
    super("Network error");
    this.name = "NetworkError";
  }
}

// Sentry setup
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  beforeSend(event) {
    // Filter PII
    if (event.user?.email) delete event.user.email;
    return event;
  },
  ignoreErrors: ["AbortError", "ResizeObserver loop"],
});
```

### Đáp án mẫu

> "Em design 3 tầng. **Tầng 1 — Component**: try/catch trong async event handler (form submit, button click). Phân loại error: validation → field error inline; network → toast 'mất kết nối'; expected business (409 conflict) → user-friendly message; unknown → toast generic + Sentry log. **Tầng 2 — Error Boundary**: wrap 3 level — global (catch fatal), per-route (mỗi route fail không sập trang khác), per-widget (dashboard widget độc lập). Dùng `react-error-boundary` lib với FallbackComponent + onReset. **Tầng 3 — Global**: `window.onerror` và `unhandledrejection` listener bắt mọi thứ lọt qua. Sentry init ở instrumentation.ts cho cả server + client + edge. **User-facing**: expected error có actionable message ('Email đã được sử dụng, đăng nhập?'); unexpected có generic + Try Again + Reload. **Logging**: Sentry với source map upload, filter PII trong `beforeSend`, ignore noise như AbortError. **TanStack Query** auto retry với exponential backoff — em tận dụng. Quan trọng: **đo error rate** ở dashboard, alert khi spike — không chờ user report."

---

## Câu 6: Migration strategy — legacy → modern stack `[Senior]`

### Câu hỏi

> Codebase em là jQuery + Backbone, 5 năm tuổi. Sếp muốn modern hoá. Em đề xuất chiến lược thế nào?

### Giải thích lý thuyết

3 chiến lược migration:

1. **Big bang rewrite**: ngừng feature, rewrite từ đầu. **Hầu như luôn fail** — quá lâu, business mất kiên nhẫn, requirements drift.
2. **Strangler Fig**: incremental — wrap legacy, build feature mới bằng tech mới, replace legacy từng phần.
3. **Side-by-side**: build app mới parallel, gradually migrate user/feature.

Best practice: **Strangler Fig + Module Federation hoặc iframe** cho transition.

Steps:
1. Audit code, identify "boundary" (feature có thể tách).
2. Set up new stack parallel (Next.js/React).
3. Build feature mới bằng stack mới, embed vào legacy.
4. Migrate feature cũ từng phần (theo priority business).
5. Cuối cùng retire legacy.

### Code minh hoạ

```html
<!-- Legacy app render bằng Backbone -->
<div id="legacy-app">
  <header>...legacy header...</header>
  <main id="content">
    <!-- Backbone view render -->
  </main>
</div>

<!-- Embed React app cho feature mới -->
<div id="react-cart"></div>

<script>
  // Mount React app vào div
  import { createRoot } from "react-dom/client";
  import { CartFeature } from "./cart-feature";

  const root = createRoot(document.getElementById("react-cart"));
  root.render(<CartFeature />);

  // Bridge state giữa Backbone và React
  Backbone.cartCollection.on("change", () => {
    // Trigger re-render React
    cartStore.setState({ items: Backbone.cartCollection.toJSON() });
  });
</script>
```

```typescript
// Pattern: Anti-corruption layer
// Wrap legacy API/state để React không phụ thuộc legacy detail

// adapters/cart-adapter.ts
import { Backbone } from "@legacy/app";

export class CartAdapter {
  static getItems() {
    return Backbone.cartCollection.toJSON();
  }

  static addItem(productId: string, qty: number) {
    Backbone.cartCollection.add({ productId, qty });
  }

  static subscribe(callback: () => void) {
    Backbone.cartCollection.on("change", callback);
    return () => Backbone.cartCollection.off("change", callback);
  }
}

// React hook bridge
function useCart() {
  const [items, setItems] = useState(() => CartAdapter.getItems());

  useEffect(() => {
    return CartAdapter.subscribe(() => setItems(CartAdapter.getItems()));
  }, []);

  return { items, addItem: CartAdapter.addItem };
}

// Cuối cùng: React app dùng useCart như bình thường
function CartFeature() {
  const { items, addItem } = useCart();
  return <CartList items={items} />;
}
```

```javascript
// Strangler Fig với routing
// Proxy: route nào đã migrate → new app, còn lại → legacy
const nginx = `
location /products {
  proxy_pass http://new-app.internal;
}

location /cart {
  proxy_pass http://new-app.internal;
}

location / {
  proxy_pass http://legacy-app.internal;
}
`;

// User experience seamless — chỉ thấy 1 domain
```

### Đáp án mẫu

> "Em **không** đề xuất big bang rewrite — đó là cách chắc chắn fail nhất. 5 năm tuổi nghĩa là có data, có business logic, có edge case mà nobody nhớ — viết lại sẽ miss và regression. Em đề xuất **Strangler Fig pattern**: build feature mới bằng stack mới, gradually replace legacy. Step 1: audit codebase, identify 'boundary' — feature nào tách được (cart, search, profile)? Step 2: setup Next.js parallel infrastructure, không touch legacy. Step 3: feature mới ship bằng Next.js, embed vào legacy qua iframe hoặc Module Federation cho UX seamless. Step 4: migrate feature cũ từng phần — ưu tiên feature đang đau (slow, buggy, hard to maintain) hoặc feature có biz roadmap mạnh (cart nếu sắp launch new payment). Pattern quan trọng: **anti-corruption layer** — wrap legacy state/API qua adapter, React app không phụ thuộc Backbone detail trực tiếp. Step 5: khi legacy còn ít, decide retire timeline. Timeline thực tế: 6-18 tháng tuỳ size. Selling internal: mỗi sprint vẫn ship feature business, không gián đoạn — chứng minh ROI sớm, đỡ political risk."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "Có công nghệ mới nên migrate"                         | Migrate phải có business reason: maintenance cost, hiring, perf, ...|
| "Monorepo dễ scale hơn polyrepo"                       | Tuỳ team size + workflow; cả 2 có trade-off                          |
| "Micro-frontend là kiến trúc hiện đại"                 | Chỉ value với scale lớn; team nhỏ là over-engineering                |
| "Build design system riêng tốt hơn dùng lib"           | Tốn nhiều effort; chỉ value khi đã có designer dedicated             |
| "Big bang rewrite nhanh hơn migration từ từ"           | Hầu như luôn fail — requirements drift, no incremental value         |
