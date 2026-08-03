---
sidebar_position: 6
title: "6. Tooling & Build Setup"
---

# Tooling & Build Setup

> *Câu hỏi "dùng gì để tạo project React?" tưởng dễ nhưng lộ ngay bạn có cập nhật hệ sinh thái 2026 hay vẫn kẹt ở thời CRA.*

:::note[Ghi nhớ nhanh]

- ⭐ **Vite là mặc định cho SPA** — build tool nhanh nhờ native ESM (esbuild cho dev, Rollup cho production), không ép kiến trúc.
- **Next.js cho app cần SEO/SSR** — full-stack framework với SSR/SSG/ISR, App Router, Server Components, API routes.
- **CRA đã deprecated (2023)** — không dùng cho project mới; `Bun create` là lựa chọn mới, cực nhanh.
- **Chọn theo nhu cầu** — Vite cho dashboard/tool nội bộ, Next.js cho website công ty/SaaS cần render phía server.

:::

---

## Câu 1: Vite vs Next.js vs Bun create vs CRA — chọn cái nào? `[Junior]`

### Câu hỏi

> Khởi tạo một project React mới, em có những lựa chọn nào (Vite, Next.js, Bun create, CRA)? Em chọn cái nào và vì sao?

### Giải thích lý thuyết

| Tool          | Tốc độ     | Khuyến nghị | Khi nào dùng                          |
| ------------- | ---------- | ----------- | ------------------------------------- |
| **Vite**      | Rất nhanh  | **Có**      | SPA, dashboard, tool nội bộ           |
| **Next.js**   | Nhanh      | **Có**      | Website công ty, SaaS, cần SEO        |
| **Bun create**| Cực nhanh  | Có          | Project mới, thử nghiệm               |
| **CRA**       | Chậm       | **Không**   | Legacy, đã deprecated từ 2023         |

Phân biệt bản chất từng cái:

- **Vite** — *build tool* (esbuild cho dev + Rollup cho production). Chỉ lo bundling/dev server, không ép kiến trúc. Cực nhanh nhờ native ESM, transform on-demand thay vì bundle cả codebase.
- **Next.js** — *full-stack framework* trên nền React. Cho SSR/SSG/ISR, App Router, Server Components, API routes. Là cả runtime server chứ không chỉ build tool.
- **Bun create** — `bun` là *runtime + package manager + bundler* viết bằng Zig. `bun create` chỉ là cách scaffold nhanh (có thể scaffold Vite hoặc Next bên dưới) — "cực nhanh" là nói tới tốc độ install/run, không phải một framework riêng.
- **CRA (Create React App)** — đã bị deprecate chính thức 2023, React docs gỡ khỏi Get Started. Webpack chậm, không native ESM, HMR yếu, không còn maintain.

**Điểm mấu chốt**: câu hỏi không phải "cái nào nhanh nhất" mà là **"app này có cần SEO/SSR không?"**

### Code minh hoạ

```bash
# Vite + React + TypeScript — SPA, dashboard
npm create vite@latest my-app -- --template react-ts

# Vite + SWC (compiler Rust, build nhanh hơn Babel)
npm create vite@latest my-app -- --template react-swc-ts

# Next.js — cần SSR/SEO
npx create-next-app@latest my-app

# Bun — scaffold nhanh nhất (vẫn ra Vite/Next bên dưới)
bun create vite my-app
bun create next-app my-app

# CRA — ❌ KHÔNG dùng cho project mới (deprecated)
npx create-react-app my-app
```

```
Cây quyết định:

┌─ Cần SEO / SSR / static gen?  ── YES → Next.js (hoặc Remix / Astro)
│
├─ Mobile app?                  ── YES → React Native + Expo
│
└─ SPA / Dashboard / Admin (không cần SEO)?
   ├─ Ưu tiên tốc độ dev, codebase gọn  → Vite
   ├─ Cần routing + server actions       → Next.js
   └─ File-based router type-safe        → TanStack Start
```

### Đáp án mẫu

> "Năm 2026 thực tế chỉ còn 2 lựa chọn chính: **Vite** và **Next.js**. CRA đã bị deprecate từ 2023 — em không bao giờ tạo project mới bằng CRA, nó dùng Webpack cũ, dev chậm, không còn maintain.
>
> Cách em quyết: hỏi một câu duy nhất — **app này có cần SEO / SSR không?**
>
> - Nếu là trang public cần SEO (website công ty, SaaS marketing, e-commerce, blog) → **Next.js**, vì nó render server, crawler đọc được nội dung, có Metadata API, ISR/SSG sẵn.
> - Nếu là app sau đăng nhập, không cần SEO (dashboard, admin, internal tool) → **Vite**, vì nó nhẹ, dev server cực nhanh nhờ native ESM, không phải gánh cả tầng server của Next.
>
> **Bun create** thì em coi là cách *scaffold nhanh* chứ không phải framework riêng — `bun create vite` hay `bun create next-app` vẫn ra Vite/Next bên dưới, chỉ là install/run nhanh hơn npm 3-4 lần. Em hay dùng `bun install` thay `npm install` để tiết kiệm thời gian, miễn là lib tương thích Bun runtime.
>
> Tóm lại: cần SEO → Next.js; SPA thuần → Vite; còn Bun là package manager/runtime để tăng tốc, không thay thế việc chọn framework."

### Vì sao Vite nhanh hơn CRA/Webpack

1. **Dev mode**: Vite serve file qua **native ES Module** trong browser — không bundle cả codebase, mỗi file transform on-demand. CRA/Webpack phải bundle hết trước khi serve → chậm dần khi project lớn.
2. **Pre-bundle dependencies** bằng esbuild (Go binary, nhanh hơn JS 10-100x) — chỉ làm 1 lần.
3. **HMR thông minh** — chỉ rebuild đúng file thay đổi.
4. **Production** dùng Rollup với tree-shaking + code splitting chuẩn ESM.

### Bẫy thường gặp khi trả lời

| Sai lầm                                          | Đúng là                                                              |
| ------------------------------------------------ | -------------------------------------------------------------------- |
| "Cứ dùng CRA cho nhanh gọn"                       | CRA deprecated từ 2023 — dùng Vite cho SPA                           |
| "Bun là framework thay thế Next/Vite"             | Bun là runtime/PM/bundler; `bun create` chỉ scaffold Vite/Next       |
| "Next.js luôn tốt hơn Vite"                       | Next nặng hơn; SPA không cần SEO thì Vite nhẹ và nhanh dev hơn       |
| "Vite không build production được"                | Vite build production bằng Rollup — tree-shaking + code splitting tốt |
| "Cần SEO thì SPA Vite cũng làm được"              | SPA render client → crawler thấy HTML rỗng; cần SSR/SSG → Next.js    |
