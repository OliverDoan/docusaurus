---
sidebar_position: 1
title: "1. Routing Patterns"
---

# Routing Patterns

**Routing pattern** (mẫu định tuyến) là các kỹ thuật đặt tên thư mục đặc biệt để tạo URL linh hoạt hơn trong Next.js. Bài này giới thiệu **dynamic route** (route động — URL chứa tham số thay đổi như `/blog/[id]`), **catch-all route** (route bắt mọi đoạn URL còn lại) và **route group** (nhóm route để tổ chức mà không ảnh hưởng đường dẫn). Đây là những mẫu giúp bạn xử lý các trang có cấu trúc URL phức tạp.

---

## Mục lục

- [Dynamic Routes](#dynamic-routes)
- [Catch-all Routes](#catch-all-routes)
- [Optional Catch-all](#optional-catch-all)
- [Route Groups](#route-groups)
- [Parallel Routes](#parallel-routes)
- [Intercepting Routes](#intercepting-routes)

---

## Dynamic Routes

Route với **param động** — dùng `[name]`:

```
app/blog/[slug]/page.tsx     → /blog/hello, /blog/about-me
app/users/[id]/page.tsx      → /users/1, /users/2
```

Truy cập param:

```tsx
// app/users/[id]/page.tsx
export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <p>User {id}</p>;
}
```

Nested dynamic:

```
app/[category]/[product]/page.tsx
→ /electronics/laptop
```

```tsx
const { category, product } = await params;
// category: "electronics", product: "laptop"
```

---

## Catch-all Routes

`[...slug]` — match **1 hoặc nhiều segment**:

```
app/docs/[...slug]/page.tsx
→ /docs/a
→ /docs/a/b
→ /docs/a/b/c
```

```tsx
export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  // slug = ["a", "b", "c"]
  return <div>{slug.join(" / ")}</div>;
}
```

**Không match** `/docs` (không có segment).

---

## Optional Catch-all

`[[...slug]]` — match **0 hoặc nhiều segment**:

```
app/docs/[[...slug]]/page.tsx
→ /docs
→ /docs/a
→ /docs/a/b
```

```tsx
const { slug } = await params;
// slug undefined cho /docs
// slug = ["a"] cho /docs/a
```

Phù hợp với app như Notion, CMS — route động + có root page.

---

## Route Groups

`(name)` — gom route **không ảnh hưởng URL**:

```
app/
├── (marketing)/
│   ├── layout.tsx           # layout marketing
│   ├── about/page.tsx       → /about (không có /marketing)
│   └── pricing/page.tsx     → /pricing
└── (app)/
    ├── layout.tsx           # layout app sau login
    ├── dashboard/page.tsx   → /dashboard
    └── settings/page.tsx    → /settings
```

Lợi ích:

- **Layout khác nhau** cho các nhóm route.
- **Organize file** mà không tạo nested URL.
- **Cô lập concern** (public vs authenticated).

:::info[Phân tích]

**Use case phổ biến cho route group:**

**1. Public + Auth layout:**

```
app/
├── (public)/
│   ├── layout.tsx       # navbar marketing
│   ├── page.tsx         → /
│   ├── about/page.tsx   → /about
│   └── pricing/page.tsx → /pricing
└── (app)/
    ├── layout.tsx       # navbar dashboard
    ├── dashboard/page.tsx
    └── settings/page.tsx
```

**2. Tách auth wrap riêng:**

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx       # centered card layout
└── (main)/
    ├── layout.tsx       # full app layout
    └── ...
```

Mỗi group có layout riêng — không phải condition trong 1 layout chung.

:::

---

## Parallel Routes

Render **nhiều page cùng lúc** trong 1 layout, qua **slot** `@name`:

```
app/
├── layout.tsx
├── @analytics/
│   └── page.tsx           # slot @analytics
├── @team/
│   └── page.tsx           # slot @team
└── page.tsx
```

```tsx
// app/layout.tsx
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2">
      <div>{children}</div>
      <div>
        {analytics}
        {team}
      </div>
    </div>
  );
}
```

Use case:

- **Dashboard với widget độc lập** — analytics, team, notifications load
  song song.
- **Modal route** — kết hợp với Intercepting Routes.
- **Tab giữ scroll** — mỗi tab là parallel slot.

**Independent error/loading**:

```
app/
├── @analytics/
│   ├── page.tsx
│   ├── error.tsx       # chỉ analytics fail không ảnh hưởng team
│   └── loading.tsx
└── @team/
    ├── page.tsx
    └── error.tsx
```

Mỗi slot có error/loading riêng — granular UX.

---

## Intercepting Routes

**Intercept** một route để render trong layout hiện tại thay vì navigate
full:

```
app/
├── feed/
│   ├── page.tsx              # /feed
│   └── @modal/
│       └── (..)photos/[id]/
│           └── page.tsx      # intercept /photos/:id
└── photos/
    └── [id]/
        └── page.tsx          # /photos/:id (page thật)
```

Convention:

- `(.)` cùng cấp.
- `(..)` cấp trên.
- `(..)(..)` 2 cấp trên.
- `(...)` từ root.

Use case **kinh điển — Instagram modal photo**:

```
1. User ở /feed
2. Click vào photo → URL = /photos/123
3. Instead of full navigate, render modal trên /feed
4. Refresh page → vào /photos/123 trang thật
```

```tsx
// app/feed/@modal/(..)photos/[id]/page.tsx
import { Modal } from "@/components/Modal";

export default async function PhotoModal({ params }) {
  const photo = await fetchPhoto((await params).id);
  return (
    <Modal>
      <img src={photo.url} />
    </Modal>
  );
}
```

```tsx
// app/photos/[id]/page.tsx — full page, dùng khi refresh
export default async function PhotoPage({ params }) {
  const photo = await fetchPhoto((await params).id);
  return <img src={photo.url} />;
}
```

:::info[Phân tích]

**Intercepting Routes cực kỳ powerful cho UX**:

Cho phép **deep linking** + **seamless modal**:

- Click photo trong feed → modal mở, URL đổi.
- User share URL → người khác mở thấy **full page** (không modal).
- Back button → đóng modal, về feed.
- Refresh → full page (không lost context).

Đây là pattern khó implement với SPA thường — yêu cầu coordinate router
+ modal state + URL state. Next.js App Router làm tự nhiên qua file
convention.

Pinterest, Twitter, Instagram đều dùng pattern này.

:::

:::tip[Mẹo]

**Combine Parallel + Intercepting**:

Route layout với slot `@modal` + intercept là pattern hoàn chỉnh cho modal:

```
app/
├── @modal/
│   └── default.tsx       # render null khi không có intercept
├── layout.tsx
├── feed/
│   ├── page.tsx
│   └── (..)photos/[id]/
│       └── page.tsx      # intercept khi đang ở feed
└── photos/
    └── [id]/
        └── page.tsx      # full page
```

```tsx
// app/layout.tsx
export default function Layout({ children, modal }) {
  return (
    <>
      {children}
      {modal} {/* render modal slot */}
    </>
  );
}

// app/@modal/default.tsx
export default function Default() {
  return null; // không có gì để hiển thị mặc định
}
```

`default.tsx` cần thiết — fallback khi slot không match route.

:::

:::warning[Cần lưu ý]

**Routing pattern này phức tạp** — đừng dùng overengineer:

- Đa số app **không cần** Parallel/Intercepting.
- Dynamic routes + Route Groups đủ cho 90% case.
- Chỉ dùng Parallel/Intercepting khi UX **thực sự cần** (modal deep link,
  dashboard widget độc lập).

Trade-off:

- File structure phức tạp hơn.
- Debug khó hơn (parallel slot không hiện trong nav).
- Team mới onboard phải đọc docs.

Bắt đầu đơn giản, scale lên khi cần.

:::
