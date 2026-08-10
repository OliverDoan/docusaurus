---
id: java-fe-100-ngay
title: Kế hoạch học Java + Frontend trong 100 ngày
sidebar_label: Java + FE (100 ngày)
sidebar_position: 1
description: Lộ trình 100 ngày, mỗi ngày 2h Java (từ đầu) + 1h Frontend (mid → senior/staff, nhịp nhanh).
---

> **Cam kết mỗi ngày:** 3 giờ
> - **Java:** 2 giờ/ngày → tổng **200 giờ** (học từ đầu, hướng backend)
> - **Frontend (FE):** 1 giờ/ngày → tổng **100 giờ** (**mid → senior/staff, nhịp nhanh**)
> **Thời hạn:** 100 ngày (khoảng 14 tuần + 2 ngày)

---

## Mục tiêu sau 100 ngày

- **Java:** Nắm chắc Java Core → OOP → Collections → Stream/Lambda → Concurrency → JDBC → Spring Boot → REST API + JPA. Làm được 1 project backend hoàn chỉnh.
- **Frontend:** Từ mid → sẵn sàng **senior/staff**. Nén nền tảng, đi sâu và rộng: **TS làm chủ, React internals, server state, GraphQL, testing, performance, Next.js/RSC, kiến trúc & monorepo, design system, micro-frontend, auth/security, observability, frontend system design**.
- **Kết quả cuối:** 1 project full-stack production-ready (Spring Boot API + React/Next.js) — có auth JWT, test, performance đạt chuẩn, observability, deploy CI/CD.

---

## Định hướng phần FE (nhịp nhanh cho mid)

Vì bạn đã là mid, phần FE **nén tối đa nền tảng** (TS/React cơ bản chỉ điểm qua để chốt kiến thức) và dồn thời gian cho **chiều sâu + chiều rộng của senior**:

- Nền (TS mastery, React internals, hooks, perf): **gói gọn ~2 tuần**.
- **Next.js chuyên sâu chiếm trọn 2 tuần (Ngày 41–55)** — RSC, caching 4 lớp, Server Actions, BFF/auth nối Spring Boot.
- Phần còn lại đẩy tới: **GraphQL, real-time, micro-frontend, design system, state machines, observability, browser internals, frontend system design, CI/CD** — những thứ tách senior/staff khỏi mid.
- Với mỗi chủ đề: luôn hỏi *"khi nào dùng, khi nào KHÔNG, đánh đổi & chi phí vận hành là gì"*.

---

## Nguyên tắc học (đọc trước khi bắt đầu)

1. **Học chủ động:** Mỗi ngày phải **gõ code**, không chỉ đọc/xem video.
2. **Ghi chú ngắn:** Cuối mỗi ngày viết 3-5 dòng "hôm nay học được gì + đánh đổi".
3. **Ôn tập ngắt quãng:** Cuối mỗi tuần dành buổi cuối để ôn lại tuần đó.
4. **Đừng cầu toàn:** Không hiểu 100% cũng đi tiếp, quay lại sau khi có ngữ cảnh.
5. **Commit lên GitHub mỗi ngày.**
6. **FE nhịp nhanh:** Nếu 1 chủ đề bạn đã biết, dùng buổi đó để đào sâu "vì sao/đánh đổi" thay vì học lại cú pháp.

---

## Tổng quan lộ trình

| Giai đoạn | Ngày | Java | Frontend (mid → senior/staff, nhịp nhanh) |
|-----------|------|------|-------------------------------------------|
| **1** | 1–20 | Java Core (cú pháp, control flow, mảng, method) | TS mastery + React internals + state + server state + forms |
| **2** | 21–40 | OOP (class, kế thừa, đa hình, interface) | GraphQL + real-time + Testing (RTL/E2E/CI) + Performance deep |
| **3** | 41–55 | Collections + Generics + Exception | **Next.js chuyên sâu (2 tuần)**: App Router → caching → Server Actions → BFF/auth |
| **4** | 56–70 | Stream/Lambda + Concurrency + I/O | Kiến trúc/monorepo/design system + Micro-frontend + Security/Observability |
| **5** | 71–85 | JDBC + Spring Boot + REST API | Browser internals + a11y/PWA + CI/CD + Frontend system design |
| **6** | 86–100 | JPA/Hibernate + Testing + Project backend | Polish + Project full-stack nối Spring Boot |

---

## GIAI ĐOẠN 1 — Java Core & Nền FE nén nhanh (Ngày 1–20)

### Tuần 1 (Ngày 1–7)

| Ngày | Java (2h) | Frontend (1h) |
|------|-----------|---------------|
| 1 | Cài JDK, IntelliJ. "Hello World". JVM/JRE/JDK | TS: structural typing, `type` vs `interface`, generics + constraints |
| 2 | Biến, kiểu dữ liệu nguyên thủy | TS: utility types + conditional types + `infer` |
| 3 | Toán tử, ép kiểu (casting) | TS: mapped types, template literal types, discriminated unions, narrowing |
| 4 | if/else, switch | TS nâng cao: `satisfies`, const assertion, branded types, typed API client |
| 5 | Vòng lặp: for, while, do-while | React internals: render/reconciliation, keys, vì sao re-render |
| 6 | break, continue, vòng lặp lồng nhau | React hooks sâu: `useState`/`useEffect`/`useRef` (batching, cleanup, ref) |
| 7 | **Ôn tập tuần 1** + 5 bài tập nhỏ | React perf: `useMemo`/`useCallback`/`React.memo` + DevTools Profiler |

### Tuần 2 (Ngày 8–14)

| Ngày | Java (2h) | Frontend (1h) |
|------|-----------|---------------|
| 8 | Mảng 1 chiều | React: custom hooks + `useReducer` |
| 9 | Mảng 2 chiều | React: Context đúng cách + compound components |
| 10 | String + method | React patterns: render props/HOC, control props, state reducer |
| 11 | StringBuilder, == vs equals | Concurrent React: `useTransition`, `useDeferredValue`, `Suspense` |
| 12 | Method: tham số, return | State: client vs server state; **Zustand** (store, selector) |
| 13 | Method overloading, scope | **Redux Toolkit + RTK Query** — khi nào thực sự cần |
| 14 | **Ôn tập tuần 2** + bài tập | **State machines với XState** (senior topic: modeling state) |

### Tuần 3 (Ngày 15–20)

| Ngày | Java (2h) | Frontend (1h) |
|------|-----------|---------------|
| 15 | Đệ quy | **TanStack Query**: query, mutation, invalidation |
| 16 | Scanner | TanStack Query: caching, `staleTime`/`gcTime`, optimistic update |
| 17 | Thuật toán: max/min, sort đơn giản | TanStack Query: infinite/pagination, prefetch, dependent, `select` |
| 18 | Bài tập: đảo mảng, số nguyên tố | **React Hook Form + Zod** (uncontrolled, perf, validation) |
| 19 | Debug IntelliJ, đọc stack trace | Form nâng cao: field array, async validation, dynamic fields |
| 20 | **Ôn tập GĐ1** — máy tính console | **Mini app**: TanStack Query + RHF/Zod + Zustand (mock API) |

**Cột mốc ngày 20:** Java — chương trình console. FE — làm chủ TS + React internals + chọn đúng state/server-state + form nâng cao.

---

## GIAI ĐOẠN 2 — OOP & GraphQL/Real-time/Testing (Ngày 21–40)

### Tuần 4 (Ngày 21–27)

| Ngày | Java (2h) | Frontend (1h) |
|------|-----------|---------------|
| 21 | Class và Object | GraphQL: schema, query, mutation — mô hình tư duy |
| 22 | Constructor, this | Apollo Client / urql: normalized cache |
| 23 | Access modifier, getter/setter | GraphQL Codegen: typed operations end-to-end |
| 24 | static | GraphQL subscription; **REST vs GraphQL — chọn khi nào** |
| 25 | Package, cấu trúc project | WebSocket trên FE (kết nối, lifecycle, reconnect) |
| 26 | Kế thừa, super | SSE + real-time patterns (presence, optimistic, conflict) |
| 27 | **Ôn tập tuần 4** + bài tập class | Real-time mini app (chat/notification) |

### Tuần 5 (Ngày 28–34)

| Ngày | Java (2h) | Frontend (1h) |
|------|-----------|---------------|
| 28 | Đa hình, overriding | Testing philosophy (trophy) + Vitest/Jest mock/spy |
| 29 | Abstract class | RTL: query đúng cách, `userEvent`, test tương tác |
| 30 | Interface | MSW: mock API + test async |
| 31 | Interface default method | Test custom hook (`renderHook`) + integration test |
| 32 | Composition, aggregation | Playwright: locator, assertion, Page Object Model |
| 33 | final, Enum | Playwright: network mock, fixtures, xử lý flaky |
| 34 | **Ôn tập tuần 5** — hệ thống lớp học OOP | Test trong CI (GitHub Actions) + coverage gate |

### Tuần 6 (Ngày 35–40)

| Ngày | Java (2h) | Frontend (1h) |
|------|-----------|---------------|
| 35 | Object: toString/equals/hashCode | Core Web Vitals (LCP/CLS/INP): đo bằng Lighthouse + RUM |
| 36 | Nested/inner class | Code splitting: `lazy`, `Suspense`, route-based, dynamic import |
| 37 | Encapsulation, Inheritance | Bundle analysis + tree-shaking + tối ưu dependency nặng |
| 38 | SOLID (ví dụ) | Virtualization (react-window/virtual) cho list lớn |
| 39 | Bài tập OOP (ngân hàng) | Image/font optimization, preload/prefetch, tránh CLS |
| 40 | **Ôn tập GĐ2** — quản lý thư viện (OOP) | **Audit + tối ưu 1 app**, đo Core Web Vitals trước/sau |

**Cột mốc ngày 40:** Java — áp dụng OOP. FE — làm chủ GraphQL, real-time, testing (unit + E2E + CI) và performance có đo lường.

---

## GIAI ĐOẠN 3 — Collections & Next.js chuyên sâu (Ngày 41–55)

> 💡 **Next.js chiếm trọn 2 tuần này (Ngày 41–55).** Mỗi buổi ánh xạ tới một module trong [**Phụ lục A — Next.js chuyên sâu**](#nextjs-deep-dive) (ghi chú `M1`–`M8`) — bảng dưới là lịch, phụ lục là phần đào sâu "khi nào dùng / đánh đổi". Bám **Next.js 15 + React 19**.

### Tuần 7 (Ngày 41–47) — Routing · Rendering · Data fetching

| Ngày | Java (2h) | Frontend (1h) — Next.js |
|------|-----------|-------------------------|
| 41 | Collections tổng quan, List | **M1** App Router: `layout`/`page`/`loading`/`error`/`not-found`, navigation, `<Link>` prefetch |
| 42 | ArrayList | **M1** Dynamic routes `[id]`/catch-all, Route Groups `(group)`, private `_folder`, `generateStaticParams` |
| 43 | LinkedList vs ArrayList | **M1** Parallel Routes `@slot` + Intercepting Routes (modal giữ URL) |
| 44 | Set (HashSet/TreeSet) | **M2** RSC vs Client Components, ranh giới `use client`, truyền Server Comp làm `children` |
| 45 | Map (HashMap/TreeMap) | **M2** Static vs dynamic rendering, segment config, streaming + Suspense, PPR, edge/node |
| 46 | Iterator | **M3** `fetch` caching semantics, Request Memoization, `React.cache`, dedupe |
| 47 | **Ôn tập tuần 7** + bài tập Collections | **M3** Sequential vs parallel fetching, phá waterfall, preload pattern |

### Tuần 8 (Ngày 48–55) — Caching · Mutations · BFF · Auth

| Ngày | Java (2h) | Frontend (1h) — Next.js |
|------|-----------|-------------------------|
| 48 | Generics: class/method | **M4** Caching 4 lớp: Request Memo · Data Cache · Full Route Cache · Router Cache |
| 49 | Bounded type, wildcard | **M4** Invalidation: `revalidateTag`/`revalidatePath`, time vs on-demand, opt-out từng lớp |
| 50 | Comparable/Comparator | **M5** Server Actions: form action, `useActionState`, `useFormStatus`, progressive enhancement |
| 51 | Exception, try-catch-finally | **M5** `useOptimistic`, revalidate sau mutation, bảo mật action (Zod, authz, rate limit) |
| 52 | Checked vs unchecked | **M6** Route Handlers (`app/api`), streaming, **BFF** proxy tới Spring Boot (giấu token) |
| 53 | throw/throws, custom exception | **M7** Middleware (matcher, redirect/rewrite), `await cookies()/headers()`, bảo vệ route nhiều tầng |
| 54 | Bài tập exception | **M7** Auth.js v5 / JWT httpOnly cookie + refresh flow (nối Spring Security) |
| 55 | **Ôn tập GĐ3** — quản lý danh bạ | **M8** Metadata/SEO + OG image động + `next/image`/`next/font` + bundle-analyzer → **mini Next.js app** |

**Cột mốc ngày 55:** Java — Collections/Generics/Exception. FE — **làm chủ Next.js App Router**: giải thích được *"request này render ở đâu, cache lớp nào, invalidate thế nào"* cho mọi route; dựng được BFF + auth httpOnly cookie nối Spring Boot. (Chi tiết + đánh đổi mỗi module: [Phụ lục A](#nextjs-deep-dive).)

---

## GIAI ĐOẠN 4 — Stream/Concurrency & Kiến trúc/Micro-frontend/Security (Ngày 56–70)

### Tuần 9 (Ngày 56–62) — Kiến trúc · Monorepo · Design system

| Ngày | Java (2h) | Frontend (1h) |
|------|-----------|---------------|
| 56 | Lambda, functional interface | Kiến trúc FE: feature-based / clean, bulletproof-react |
| 57 | Stream: filter/map/collect | Design patterns FE + dependency boundaries (tránh circular dep) |
| 58 | Stream: sorted/distinct/limit | **Monorepo**: pnpm workspace + Turborepo (cache, task pipeline) |
| 59 | Stream: reduce/min/max/sum | Bundler sâu: Vite/esbuild/SWC/Turbopack, tree-shaking, chunk strategy |
| 60 | Optional | **Design system**: tokens, theming, dark mode |
| 61 | Method reference | Storybook + headless UI (Radix / React Aria) |
| 62 | **Ôn tập tuần 9** + bài tập Stream | Component API design (composition, polymorphism, `as` prop) + boilerplate |

### Tuần 10 (Ngày 63–70) — Micro-frontend · Security · Observability

| Ngày | Java (2h) | Frontend (1h) |
|------|-----------|---------------|
| 63 | Thread, Runnable | Micro-frontend: khái niệm, khi nào dùng / khi nào KHÔNG |
| 64 | synchronized, race condition | Module Federation (host & remote) + chia sẻ dependency, versioning |
| 65 | ExecutorService, thread pool | Micro-frontend: routing & state cross-app — tách 1 app thành 2 MFE |
| 66 | File I/O text | Bảo mật FE: XSS, CSRF, CSP, sanitization |
| 67 | BufferedReader/Writer | Supply-chain security: dependency audit, lockfile, SRI |
| 68 | try-with-resources | OAuth2 / OIDC flow (mở rộng auth từ GĐ3 — kết nối identity provider) |
| 69 | Bài tập I/O + Stream | Observability: Sentry (server + client) + source maps, RUM |
| 70 | **Ôn tập GĐ4** — phân tích file log | Performance monitoring + feature flags — sẵn sàng nối Spring Boot |

**Cột mốc ngày 70:** Java — Stream/concurrency/I/O. FE — thiết kế được kiến trúc/monorepo/design system, làm chủ micro-frontend, security & observability.

---

## GIAI ĐOẠN 5 — Spring Boot & Browser internals / System design (Ngày 71–85)

### Tuần 11 (Ngày 71–77)

| Ngày | Java (2h) | Frontend (1h) |
|------|-----------|---------------|
| 71 | Maven/Gradle, dependency | Browser internals: event loop, macro/microtask |
| 72 | JDBC: kết nối, query | Rendering pipeline: layout/paint/composite, repaint vs reflow |
| 73 | Spring Boot, Spring Initializr | Memory leak trong SPA: phát hiện & sửa (heap snapshot) |
| 74 | DI, Bean, @Component | Animation: Framer Motion / CSS, performance animation (GPU) |
| 75 | @RestController, GET đầu tiên | PWA + offline: service worker, cache strategy, background sync |
| 76 | @GetMapping/@PostMapping | Accessibility nâng cao: WCAG, screen reader, focus management |
| 77 | **Ôn tập tuần 11** + REST API đơn giản | i18n/l10n nâng cao, RTL layout, formatting (Intl) |

### Tuần 12 (Ngày 78–85)

| Ngày | Java (2h) | Frontend (1h) |
|------|-----------|---------------|
| 78 | @RequestBody/@PathVariable/@RequestParam | CI/CD FE: lint/test/build/deploy, preview environment |
| 79 | Service layer | Deploy strategies: canary / blue-green / rollback, trunk-based development |
| 80 | HTTP status, ResponseEntity | Typed REST client + error handling nối Spring Boot |
| 81 | @ExceptionHandler | CORS — bản chất & xử lý khi gọi Spring Boot |
| 82 | Validation @Valid | **Frontend system design**: cấu trúc app quy mô lớn |
| 83 | application.properties | Tổng hợp: chọn kiến trúc render ở quy mô (CSR/SSR/SSG/ISR/edge/PPR) — ra quyết định |
| 84 | Test API (Postman/curl) | Contract testing / đồng bộ type: OpenAPI → TS codegen |
| 85 | **Ôn tập GĐ5** — REST API CRUD (chưa DB) | **Kết nối end-to-end** React ↔ Spring Boot (auth + CRUD) |

**Cột mốc ngày 85:** Java — REST API Spring Boot. FE — hiểu sâu browser/rendering, làm chủ a11y/PWA/CI-CD và tư duy frontend system design.

---

## GIAI ĐOẠN 6 — JPA, Testing & Project full-stack (Ngày 86–100)

### Tuần 13 (Ngày 86–92)

| Ngày | Java (2h) | Frontend (1h) |
|------|-----------|---------------|
| 86 | JPA/Hibernate, @Entity/@Id | Error boundary + Suspense cho data + graceful degradation |
| 87 | Spring Data JPA, Repository | Advanced TanStack Query: infinite + optimistic + offline persist |
| 88 | CRUD với JpaRepository | Real-time nối backend: WebSocket/SSE từ Spring |
| 89 | @OneToMany/@ManyToOne | Performance final pass: đưa Core Web Vitals về "xanh" |
| 90 | Query method, @Query | a11y + i18n final pass cho project |
| 91 | Kết nối DB thật (H2/MySQL/Postgres) | Áp design system vào project cuối |
| 92 | **Ôn tập tuần 13** — API CRUD + DB | Chốt thiết kế frontend project cuối (production-ready) |

### Tuần 14 + 2 ngày (Ngày 93–100)

| Ngày | Java (2h) | Frontend (1h) |
|------|-----------|---------------|
| 93 | Unit test JUnit 5 | Nối React/Next ↔ Spring Boot (typed client, env, CORS) |
| 94 | Mockito | CRUD qua API thật bằng TanStack Query |
| 95 | Test Service/Controller (MockMvc) | Auth end-to-end: JWT từ Spring Security → protected route |
| 96 | **Project** — thiết kế API | **Project** — dựng khung production-ready (monorepo/design system) |
| 97 | Project — CRUD + validation + auth | Project — hoàn thiện tính năng + state + optimistic update |
| 98 | Project — xử lý lỗi, hoàn thiện API | Project — test (RTL + Playwright) + audit performance + Sentry |
| 99 | Project — test + refactor + README | Project — responsive, a11y, deploy (Vercel) + CI/CD |
| 100 | **Tổng kết** — deploy backend, cập nhật CV | **Tổng kết** — portfolio, README, review kiến trúc/tradeoff |

**Cột mốc ngày 100:** Project full-stack production-ready (Spring Boot + React/Next.js): auth JWT, test, Core Web Vitals xanh, observability, CI/CD — portfolio thể hiện năng lực FE senior + backend junior.

---

## Phụ lục A — Next.js chuyên sâu (mid → senior) {#nextjs-deep-dive}

> **Cách dùng:** đây là phần **đào sâu cho 2 tuần Next.js** đã xếp vào **Tuần 7–8 (Ngày 41–55)** của lộ trình chính. Mỗi module (`M1`–`M10`) tương ứng các buổi trong bảng ngày-theo-ngày ở trên; phần dưới bổ sung chiều sâu "khi nào dùng / đánh đổi". Module 9–10 (i18n/error/testing, deploy) áp dụng dần trong **giai đoạn project cuối** (Ngày 86–100).
>
> **Phiên bản:** Bám **Next.js 15 + React 19** (App Router). Lưu ý các request API giờ **bất đồng bộ** — `cookies()`, `headers()`, `params`, `searchParams` phải `await`; mặc định caching đã đổi so với Next 14 (`fetch` **không** còn cache mặc định, `GET` Route Handler **không** static mặc định). Luôn kiểm chứng với docs theo version bạn dùng.
>
> **Tư duy xuyên suốt:** với mỗi tính năng, hỏi *"chạy ở Server hay Client? cache ở lớp nào? invalidate thế nào? đánh đổi gì?"*.

### Module 1 — App Router & Routing nâng cao
- File conventions: `layout` · `template` · `page` · `loading` · `error` · `not-found` · `global-error` · `route`.
- Dynamic segments: `[id]`, catch-all `[...slug]`, optional catch-all `[[...slug]]`; `generateStaticParams`, `dynamicParams`.
- **Route Groups** `(group)` (gom route không ảnh hưởng URL) · private folders `_folder` · colocation.
- **Parallel Routes** `@slot` (dashboard nhiều pane) · **Intercepting Routes** `(.)`, `(..)`, `(...)` (modal giữ URL).
- Navigation: `<Link>` prefetch, `useRouter`, `usePathname`, `useSearchParams`; soft vs hard navigation.
- **Đầu ra:** dựng 1 dashboard có parallel routes + modal bằng intercepting route.

### Module 2 — Rendering model (đào sâu)
- **RSC vs Client Components**: ranh giới `use client`, cách "đẩy `use client` xuống lá" để giảm JS gửi về client.
- Composition then chốt: **truyền Server Component làm `children` của Client Component** (giữ được server rendering trong cây client).
- Static vs Dynamic Rendering; điều gì "ép" một route sang dynamic (`cookies()`, `headers()`, `searchParams`, `no-store`).
- `export const dynamic` / `revalidate` / `fetchCache` / `runtime` — segment config options.
- **Streaming SSR** với `loading.tsx` + `<Suspense>`; đặt Suspense boundary ở đâu cho đúng.
- **Partial Prerendering (PPR)**: shell tĩnh + lỗ hổng động; khi nào bật.
- **Edge vs Node.js runtime** — giới hạn API, cold start, khi nào chọn edge.

### Module 3 — Data fetching
- `fetch` với caching semantics: `cache: 'force-cache' | 'no-store'`, `next: { revalidate, tags }`.
- **Request Memoization** (dedupe trong 1 request) vs `React.cache()` cho hàm non-fetch.
- Sequential vs parallel fetching — nhận diện & phá **waterfall** (khởi tạo promise song song, `Promise.all`).
- Preloading pattern (`preload()` idiom) để nạp dữ liệu sớm.
- Fetch ở đâu: RSC (khuyến nghị) vs Route Handler vs client (TanStack Query) — chọn theo bài toán.
- **Đầu ra:** trang list + detail không waterfall, đo bằng Network/Server timing.

### Module 4 — Caching 4 lớp (phần dễ sai nhất)
- **Request Memoization** (per-request) → **Data Cache** (persist, cross-request) → **Full Route Cache** (build/revalidate) → **Router Cache** (client, in-memory).
- Time-based (`revalidate`) vs **on-demand** (`revalidateTag`, `revalidatePath`).
- Khi nào dữ liệu bị "dính cache" ngoài ý muốn & cách opt-out từng lớp.
- `unstable_cache` / `use cache` (tùy version) cho hàm tính toán nặng.
- **Đầu ra:** vẽ sơ đồ 4 lớp cho 1 route thật + kịch bản invalidate sau mutation.

### Module 5 — Server Actions & mutations
- Khai báo `'use server'`; form action, progressive enhancement (chạy cả khi JS chưa load).
- `useActionState` (trạng thái + validation trả về) · `useFormStatus` (pending) · `useOptimistic` (optimistic UI).
- Revalidate sau mutation: `revalidateTag` / `revalidatePath`; redirect sau action.
- Bảo mật Server Action: coi như public endpoint — validate (Zod), authz, chống CSRF, rate limit.
- **Đầu ra:** CRUD 1 resource hoàn toàn bằng Server Actions + optimistic.

### Module 6 — Route Handlers & BFF
- `app/api/.../route.ts`: `GET/POST/...`, đọc `Request`, trả `Response`/`NextResponse`.
- Streaming response, webhook, file upload; caching cho GET handler.
- **BFF pattern**: Next đứng trước Spring Boot — proxy/aggregate API, giấu token server-side.
- **Đầu ra:** 1 route handler proxy tới Spring Boot, ẩn base URL + gắn Authorization.

### Module 7 — Auth & Middleware
- `middleware.ts`: `matcher`, redirect/rewrite, set header/cookie; giới hạn (chạy edge, nhẹ).
- Đọc `cookies()` / `headers()` trong RSC & Server Action (bất đồng bộ ở Next 15).
- Chiến lược bảo vệ route: middleware (chặn sớm) vs layout/page (authz chi tiết) — kết hợp.
- **Auth.js (NextAuth v5)** hoặc tự quản JWT; lưu **access token httpOnly cookie**, refresh token flow.
- **Đầu ra:** đăng nhập → set httpOnly cookie từ route handler → middleware bảo vệ `/app/*` → RSC đọc user.

### Module 8 — Performance & SEO
- `next/image` (sizes, priority, placeholder) · `next/font` (self-host, tránh layout shift).
- `next/dynamic` + `ssr: false` cho component nặng/chỉ-client; code splitting theo route.
- **Metadata API**: static `metadata` vs `generateMetadata`; OG image động bằng `ImageResponse`.
- `@next/bundle-analyzer`; theo dõi RSC payload size; Turbopack dev/build.
- **Đầu ra:** Lighthouse ≥ 95, đo Core Web Vitals trước/sau.

### Module 9 — i18n, error handling, instrumentation, testing
- i18n với App Router (sub-path routing, middleware chọn locale).
- `error.tsx` / `global-error.tsx`, error recovery (`reset()`); phân biệt lỗi expected vs unexpected.
- `instrumentation.ts` + tích hợp Sentry (server + client), source maps.
- Testing: giới hạn khi unit-test RSC → ưu tiên **Playwright** cho luồng App Router; test Server Actions/Route Handlers.
- Draft/Preview mode cho CMS.

### Module 10 — Deploy & vận hành
- Vercel (mặc định) vs **self-host**: `output: 'standalone'`, Docker, ISR khi self-host.
- Env & config: `NEXT_PUBLIC_*` vs server-only; runtime config.
- Caching ở tầng hạ tầng (CDN) phối hợp với Data/Route Cache.
- Monitoring: Web Vitals reporting, logging, feature flags.
- **Đầu ra:** deploy project cuối (Next.js FE) + nối Spring Boot API, có CI/CD.

**Cột mốc Next.js:** giải thích được *"request này render ở đâu, cache ở lớp nào, invalidate thế nào"* cho bất kỳ trang nào; dựng được BFF + auth httpOnly cookie nối Spring Boot.

---

## Tài nguyên gợi ý

### Java
- **Đọc:** mục **Java (gpcoder)** ngay trên site này, GeeksforGeeks Java, Baeldung (Spring)
- **Video:** Java Brains, Amigoscode (Spring Boot)
- **Sách:** *Head First Java*, *Effective Java* (đọc sau khi vững cơ bản)
- **Docs:** [docs.oracle.com/en/java](https://docs.oracle.com/en/java/), [spring.io/guides](https://spring.io/guides)

### Frontend (mid → senior/staff)
- **TypeScript:** [Total TypeScript](https://www.totaltypescript.com/), [type-challenges](https://github.com/type-challenges/type-challenges)
- **React internals:** [react.dev](https://react.dev/) (*Learn* + *Reference*), overreacted.io (Dan Abramov), Josh W. Comeau
- **Server state:** [TanStack Query docs](https://tanstack.com/query/latest); **State machines:** [XState docs](https://stately.ai/docs)
- **GraphQL:** [Apollo docs](https://www.apollographql.com/docs/), [GraphQL Codegen](https://the-guild.dev/graphql/codegen)
- **Testing:** [Testing Library](https://testing-library.com/), epicweb.dev (Kent C. Dodds), [Playwright](https://playwright.dev/)
- **Next.js:** [nextjs.org/learn](https://nextjs.org/learn) + [App Router docs](https://nextjs.org/docs/app); đọc kỹ mục *Caching*, *Rendering*, *Server Actions*, *Middleware*. Xem thêm [Phụ lục A — Next.js chuyên sâu](#nextjs-deep-dive). Tham khảo *"làm sao React server components hoạt động"* (Josh W. Comeau) để hiểu RSC từ gốc.
- **Performance:** [web.dev](https://web.dev/), [patterns.dev](https://www.patterns.dev/)
- **Kiến trúc/DS:** bulletproof-react (GitHub), [Storybook](https://storybook.js.org/), [Radix UI](https://www.radix-ui.com/), [Turborepo](https://turbo.build/)
- **Micro-frontend:** [Module Federation docs](https://module-federation.io/), micro-frontends.org
- **Observability:** [Sentry docs](https://docs.sentry.io/), web-vitals library
- **System design FE:** *Frontend System Design* (GreatFrontEnd), Patterns.dev

---

## Bảng theo dõi tiến độ (tick khi hoàn thành)

- [ ] Tuần 1 (Ngày 1–7)
- [ ] Tuần 2 (Ngày 8–14)
- [ ] Tuần 3 (Ngày 15–20) — **Cột mốc GĐ1**
- [ ] Tuần 4 (Ngày 21–27)
- [ ] Tuần 5 (Ngày 28–34)
- [ ] Tuần 6 (Ngày 35–40) — **Cột mốc GĐ2**
- [ ] Tuần 7 (Ngày 41–47) — Next.js: routing/rendering/data
- [ ] Tuần 8 (Ngày 48–55) — Next.js: caching/actions/BFF/auth — **Cột mốc GĐ3**
- [ ] Tuần 9 (Ngày 56–62) — Kiến trúc/monorepo/design system
- [ ] Tuần 10 (Ngày 63–70) — Micro-frontend/security/observability — **Cột mốc GĐ4**
- [ ] Tuần 11 (Ngày 71–77)
- [ ] Tuần 12 (Ngày 78–85) — **Cột mốc GĐ5**
- [ ] Tuần 13 (Ngày 86–92)
- [ ] Tuần 14 (Ngày 93–100) — **Cột mốc cuối: Project full-stack**

---

> **Ghi nhớ:** FE nhịp nhanh — nếu chủ đề nào bạn đã biết, đừng học lại cú pháp mà đào sâu *"khi nào dùng, khi nào KHÔNG, đánh đổi & chi phí vận hành"*. Đó là thứ tách senior/staff khỏi mid. Kiên trì 3h/ngày đều đặn quan trọng hơn học dồn rồi bỏ. 💪
