---
sidebar_position: 1
title: "1. Tại sao chọn Next.js?"
---

# Tại sao chọn Next.js?

---

## Mục lục

- [Next.js là gì?](#nextjs-là-gì)
- [Vấn đề Next.js giải quyết](#vấn-đề-nextjs-giải-quyết)
- [SPA vs SSR](#spa-vs-ssr)
- [Tại sao chọn frontend framework?](#tại-sao-chọn-frontend-framework)
- [Tại sao chọn Next.js trong số React framework?](#tại-sao-chọn-nextjs-trong-số-react-framework)

---

## Next.js là gì?

**Next.js** là framework full-stack React do **Vercel** phát triển. Nó
bổ sung lên React:

- **Routing** file-based.
- **Server-side rendering (SSR)**, **Static generation (SSG)**, **ISR**.
- **Server Components**, **Server Actions** (React 19).
- **Image, Font, Script** optimization.
- **Bundler** (Turbopack/Webpack).
- **Build / deploy** workflow.

---

## Vấn đề Next.js giải quyết

React core chỉ là **UI library** — không giải quyết:

- Routing.
- Data fetching.
- Rendering strategy (SSR/SSG/CSR).
- SEO.
- Performance optimization.
- Deployment.

Trước Next.js, dev phải **tự ghép** Webpack + React Router + Redux + Express
+ tools khác → mỗi project setup khác nhau.

Next.js đóng gói **best practice** thành framework — install xong là code
được.

---

## SPA vs SSR

| | SPA (Single Page App) | SSR (Server-Side Rendering) |
|--|----------------------|-----------------------------|
| Render lần đầu | Browser tải JS rồi render | Server render HTML, gửi về |
| Bundle | Lớn (toàn app) | Nhỏ hơn (theo route) |
| TTI (Time to Interactive) | Chậm | Nhanh hơn |
| SEO | Khó (crawler phải chạy JS) | Tốt |
| Server cần thiết | CDN tĩnh | Node server hoặc edge |

```
SPA flow:
[Browser] → load index.html (empty) → load JS → fetch data → render

SSR flow:
[Browser] → request page → [Server] render HTML → return → hydrate JS
```

:::info[Phân tích]

**Hydration** — bước quan trọng trong SSR:

1. Server render HTML tĩnh, gửi về browser.
2. Browser hiển thị HTML ngay (FCP nhanh).
3. JavaScript download trong background.
4. React "hydrate" — gắn event listener vào HTML đã có.
5. App trở nên interactive (TTI).

Hydration mismatch (HTML server khác với React client render) → bug khó debug.
Một số nguyên nhân:

- `Date.now()`, `Math.random()` khác giữa server/client.
- `typeof window === "undefined"` check rồi render khác.
- Browser extension thêm DOM.
- Locale formatter khác (server UTC vs client local).

→ Server Components (React 19) giảm hydration cost — chỉ Client Component
cần hydrate.

:::

---

## Tại sao chọn frontend framework?

So với React thuần + Vite SPA:

**Framework như Next.js bổ sung:**

- **SEO** — Google crawler dễ index.
- **Performance** — code splitting tự động, optimize asset.
- **Convention** — file-based routing, project structure.
- **Server functions** — Server Actions thay API routes.
- **DX** — fast refresh, error overlay, image/font optimization.

**Khi nào KHÔNG cần framework:**

- Internal tool, dashboard (không cần SEO).
- App đăng nhập ngay (không có public page).
- Prototype nhanh, ít route.

→ Khi đó **Vite + React + React Router** đủ và đơn giản hơn.

---

## Tại sao chọn Next.js trong số React framework?

| | Next.js | Remix/RR v7 | Astro | TanStack Start |
|--|---------|-------------|-------|----------------|
| Tuổi | 2016 (chín) | 2020 (chín) | 2021 | 2024 (early) |
| Routing | File-based | File-based | File-based | File-based |
| Rendering | SSR/SSG/ISR/RSC | SSR/SPA | Island | SSR |
| Server Components | **First-class** | Partial | Không | Đang implement |
| Server Actions | **Có** | Action loader | Không | Đang implement |
| Image Optimization | **Built-in** | Cần lib | Built-in | Cần lib |
| Vendor | Vercel | Shopify | Open source | Open source |
| Ecosystem | **Lớn nhất** | Vừa | Vừa | Mới |
| Popularity 2026 | **#1** | Tăng | Tăng | Early |

:::info[Phân tích]

**Lợi thế cụ thể của Next.js 2026:**

1. **React 19 first-class** — Server Components, Actions, `use`,
   `useActionState` đều tested kỹ trong Next.js.
2. **Turbopack** stable — bundler bằng Rust, dev nhanh hơn nhiều.
3. **App Router** đã mature — phần lớn breaking change đã xong.
4. **Ecosystem rộng**:
   - **Vercel hosting** — deploy 1 click.
   - **next-auth / Auth.js** — auth provider phổ biến nhất.
   - **next-intl** — i18n.
   - **next-mdx-remote** — MDX content.
   - Mọi UI library đều có Next.js example.
5. **Documentation** chất lượng cao, có App Router playground.

**Trade-off:**

- **Learning curve cao** với App Router (boundary, cache layer).
- **Vendor lock-in** một số feature (Edge Functions, ISR có cache provider).
- **Bundle to** hơn Vite SPA cùng tính năng.

Phần lớn project React production hiện đại chọn Next.js vì **ít rủi ro**:
ecosystem rộng, ai cũng biết, tuyển dev dễ.

:::

:::tip[Mẹo]

**Khi nào dùng Next.js?**

✅ Có khi:

- Cần SEO (blog, marketing, e-commerce).
- Cần SSR/SSG cho first paint nhanh.
- App có cả public page + dashboard.
- Cần Server Components (đỡ bundle JS).
- Cần Server Actions (không tạo API route).

❌ Không khi:

- Internal tool, không SEO.
- Backend riêng (Java, Go) + frontend SPA → Vite đủ.
- Cần control bundle tối đa.
- App offline-first / PWA-heavy.
- Cần kiểm soát build cực kỳ chi tiết.

:::

:::warning[Cần lưu ý]

**Next.js không phải "React thuần"** — nó có quy ước riêng:

- File structure cố định (`app/`, `page.tsx`, `layout.tsx`).
- Server vs Client component boundary.
- Cache layer phức tạp (Data Cache, Router Cache, Full Route Cache).
- Special files: `loading.tsx`, `error.tsx`, `not-found.tsx`.

Học Next.js = **học framework**, không chỉ học React. Đầu tư 2-3 tuần để
nắm App Router model là đáng — sau đó productive nhanh.

:::
