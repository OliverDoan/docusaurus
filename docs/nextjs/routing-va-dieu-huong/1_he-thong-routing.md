---
sidebar_position: 1
title: "Hệ thống Routing"
---

# Hệ thống Routing

## File-based Routing là gì?

Trong Next.js App Router, **routing dựa trên cấu trúc thư mục** (file-based routing). Bạn không cần cấu hình router riêng như React Router — chỉ cần tạo folder và file, Next.js tự động tạo route tương ứng.

Nguyên tắc cốt lõi:

- **Folder** = route segment (đoạn URL)
- **File `page.tsx`** = UI hiển thị cho route đó
- **File `layout.tsx`** = layout bọc quanh page và các route con

```
app/
├── page.tsx              → /
├── about/
│   └── page.tsx          → /about
├── blog/
│   ├── page.tsx          → /blog
│   └── [slug]/
│       └── page.tsx      → /blog/bai-viet-1, /blog/bai-viet-2
└── dashboard/
    ├── layout.tsx        → Layout chung cho /dashboard/*
    ├── page.tsx          → /dashboard
    └── settings/
        └── page.tsx      → /dashboard/settings
```

### Quy tắc quan trọng

1. **Chỉ `page.tsx` mới tạo route public** — các file khác (components, utils, hooks) đặt cùng folder không ảnh hưởng URL
2. **`layout.tsx` được chia sẻ** giữa các route con — không bị re-render khi navigate giữa các route con
3. **Nested routing** tự động — folder con = route con

```tsx
// app/page.tsx — Trang chủ (/)
export default function HomePage() {
  return (
    <main>
      <h1>Trang chủ</h1>
      <p>Chào mừng đến với ứng dụng Next.js!</p>
    </main>
  );
}
```

```tsx
// app/about/page.tsx — Trang giới thiệu (/about)
export default function AboutPage() {
  return (
    <main>
      <h1>Giới thiệu</h1>
      <p>Đây là trang giới thiệu về chúng tôi.</p>
    </main>
  );
}
```

## Các file đặc biệt trong route

Next.js App Router định nghĩa một loạt file conventions — mỗi file có vai trò riêng:

| File | Vai trò |
|------|---------|
| `page.tsx` | UI chính của route, bắt buộc để route accessible |
| `layout.tsx` | Layout chia sẻ, bọc quanh page và route con |
| `loading.tsx` | Loading UI (tự động wrap trong Suspense) |
| `error.tsx` | Error boundary cho route segment |
| `not-found.tsx` | UI cho 404 |
| `template.tsx` | Giống layout nhưng tạo instance mới mỗi lần navigate |
| `default.tsx` | Fallback UI cho Parallel Routes |
| `route.tsx` | API endpoint (Route Handler) |

### Layout vs Template

```tsx
// app/dashboard/layout.tsx
// Layout giữ state khi navigate giữa route con
// VD: sidebar không bị re-render khi chuyển tab
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      {/* Sidebar giữ nguyên state */}
      <aside className="w-64 bg-gray-100 p-4">
        <nav>
          <a href="/dashboard">Tổng quan</a>
          <a href="/dashboard/settings">Cài đặt</a>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
```

```tsx
// app/dashboard/template.tsx
// Template tạo instance MỚI mỗi lần navigate
// Hữu ích khi cần: animation enter/exit, reset state
export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
}
```

## Route Groups

Route Groups dùng dấu ngoặc tròn `(groupName)` để **tổ chức folder mà không ảnh hưởng URL**.

### Tại sao cần Route Groups?

- Nhóm các route có layout chung mà không thêm segment vào URL
- Tách biệt các phần của ứng dụng (marketing vs dashboard)
- Tạo nhiều root layout cho cùng ứng dụng

```
app/
├── (marketing)/
│   ├── layout.tsx        → Layout cho trang marketing
│   ├── page.tsx          → /
│   ├── about/
│   │   └── page.tsx      → /about
│   └── pricing/
│       └── page.tsx      → /pricing
├── (dashboard)/
│   ├── layout.tsx        → Layout riêng cho dashboard
│   ├── dashboard/
│   │   └── page.tsx      → /dashboard
│   └── settings/
│       └── page.tsx      → /settings
└── (auth)/
    ├── layout.tsx        → Layout cho auth (không header/footer)
    ├── login/
    │   └── page.tsx      → /login
    └── register/
        └── page.tsx      → /register
```

Lưu ý: tên trong ngoặc `(marketing)`, `(dashboard)`, `(auth)` **KHÔNG xuất hiện trong URL**.

```tsx
// app/(marketing)/layout.tsx
// Layout với header và footer cho trang marketing
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="bg-white shadow-sm p-4">
        <nav>Thanh điều hướng marketing</nav>
      </header>
      <main>{children}</main>
      <footer className="bg-gray-800 text-white p-8">
        Footer
      </footer>
    </>
  );
}
```

```tsx
// app/(auth)/layout.tsx
// Layout đơn giản, không header/footer
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">{children}</div>
    </div>
  );
}
```

## Parallel Routes

Parallel Routes cho phép **render đồng thời nhiều page trong cùng một layout**, sử dụng convention `@slotName`.

### Khi nào dùng Parallel Routes?

- Dashboard với nhiều panel độc lập
- Modal hiển thị trên page hiện tại
- Các phần UI load độc lập (một phần lỗi không ảnh hưởng phần khác)

```
app/
├── layout.tsx
├── page.tsx
├── @analytics/
│   ├── page.tsx          → Slot analytics
│   └── loading.tsx       → Loading riêng cho analytics
├── @revenue/
│   ├── page.tsx          → Slot revenue
│   └── error.tsx         → Error boundary riêng
└── @notifications/
    └── page.tsx          → Slot notifications
```

```tsx
// app/layout.tsx — Nhận các slot qua props
export default function DashboardLayout({
  children,
  analytics,
  revenue,
  notifications,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  revenue: React.ReactNode;
  notifications: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 p-6">
      {/* children = page.tsx mặc định */}
      <div className="col-span-2">{children}</div>

      {/* Mỗi slot render độc lập */}
      <div>{analytics}</div>
      <div>{revenue}</div>
      <div className="col-span-2">{notifications}</div>
    </div>
  );
}
```

### default.tsx — Fallback cho Parallel Routes

Khi navigate đến route con mà slot không có page tương ứng, Next.js cần `default.tsx` làm fallback:

```tsx
// app/@analytics/default.tsx
// Hiển thị khi slot analytics không match route hiện tại
export default function AnalyticsDefault() {
  return <div>Đang tải phân tích...</div>;
}
```

## Intercepting Routes

Intercepting Routes cho phép **chặn (intercept) một route và hiển thị nó trong context hiện tại** — thường dùng cho modal.

### Convention

| Pattern | Ý nghĩa |
|---------|---------|
| `(.)` | Intercept cùng cấp |
| `(..)` | Intercept route cha (lên 1 cấp) |
| `(..)(..)` | Intercept lên 2 cấp |
| `(...)` | Intercept từ root `app/` |

### Ví dụ thực tế: Photo Modal

```
app/
├── layout.tsx
├── feed/
│   ├── page.tsx                → Trang feed ảnh
│   └── (.)photo/[id]/
│       └── page.tsx            → Intercepted: hiện modal ảnh
└── photo/[id]/
    └── page.tsx                → Route gốc: trang ảnh đầy đủ
```

Khi user click ảnh trong feed:
1. **Soft navigation** (click Link): `(.)photo/[id]` intercept, hiện modal
2. **Hard navigation** (nhập URL trực tiếp hoặc refresh): `photo/[id]` render trang đầy đủ

```tsx
// app/feed/page.tsx
import Link from "next/link";

export default function FeedPage() {
  const photos = [
    { id: 1, title: "Hoàng hôn Đà Nẵng" },
    { id: 2, title: "Phố cổ Hội An" },
    { id: 3, title: "Vịnh Hạ Long" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {photos.map((photo) => (
        <Link key={photo.id} href={`/photo/${photo.id}`}>
          <div className="bg-gray-200 aspect-square rounded-lg">
            {photo.title}
          </div>
        </Link>
      ))}
    </div>
  );
}
```

```tsx
// app/feed/(.)photo/[id]/page.tsx — Intercepted route (modal)
"use client";

import { useRouter } from "next/navigation";

export default function PhotoModal({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={() => router.back()} // Đóng modal khi click backdrop
    >
      <div
        className="bg-white rounded-lg p-6 max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Ảnh #{params.id}</h2>
        <p>Hiển thị dạng modal (intercepted)</p>
        <button onClick={() => router.back()}>Đóng</button>
      </div>
    </div>
  );
}
```

```tsx
// app/photo/[id]/page.tsx — Route gốc (trang đầy đủ)
export default function PhotoPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="p-8">
      <h1>Ảnh #{params.id}</h1>
      <p>Trang chi tiết ảnh đầy đủ (khi truy cập trực tiếp URL)</p>
      <div className="aspect-video bg-gray-200 rounded-lg mt-4" />
    </main>
  );
}
```

## Colocation — Đặt file cùng route

Next.js App Router cho phép **đặt các file không phải page cùng thư mục route** mà không ảnh hưởng routing. Chỉ file `page.tsx` và `route.tsx` mới tạo route public.

```
app/dashboard/
├── page.tsx              → Route /dashboard (public)
├── layout.tsx            → Layout cho dashboard
├── DashboardChart.tsx    → Component (KHÔNG tạo route)
├── useDashboard.ts       → Custom hook (KHÔNG tạo route)
├── dashboard.types.ts    → TypeScript types (KHÔNG tạo route)
├── dashboard.utils.ts    → Utility functions (KHÔNG tạo route)
└── dashboard.test.tsx    → Test file (KHÔNG tạo route)
```

Lợi ích:
- **Code liên quan nằm cùng chỗ** — dễ tìm, dễ maintain
- **Không cần tạo folder riêng** cho components/hooks/utils
- **Import path ngắn** — không cần `../../components/DashboardChart`

## Private Folders

Prefix `_` đánh dấu folder là **private** — Next.js hoàn toàn bỏ qua khi tạo route:

```
app/
├── _components/          → Shared components (KHÔNG phải route)
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Sidebar.tsx
├── _lib/                 → Shared utilities (KHÔNG phải route)
│   ├── auth.ts
│   ├── db.ts
│   └── utils.ts
├── _hooks/               → Shared hooks (KHÔNG phải route)
│   └── useAuth.ts
├── dashboard/
│   ├── _components/      → Components chỉ dùng trong dashboard
│   │   └── StatCard.tsx
│   └── page.tsx
└── page.tsx
```

### Khi nào dùng Private Folders vs Colocation?

| Tình huống | Giải pháp |
|------------|-----------|
| Component chỉ dùng cho 1 route | Colocation (đặt cùng folder route) |
| Component chia sẻ giữa nhiều route | Private folder `_components/` |
| Utilities dùng chung | Private folder `_lib/` |
| Muốn tách biệt rõ ràng code logic vs route | Private folder |

## Tổng hợp cấu trúc dự án thực tế

```
app/
├── (marketing)/                → Route group: trang công khai
│   ├── layout.tsx
│   ├── page.tsx                → /
│   ├── about/page.tsx          → /about
│   └── pricing/page.tsx        → /pricing
│
├── (auth)/                     → Route group: xác thực
│   ├── layout.tsx
│   ├── login/page.tsx          → /login
│   └── register/page.tsx       → /register
│
├── (dashboard)/                → Route group: dashboard
│   ├── layout.tsx
│   ├── dashboard/
│   │   ├── page.tsx            → /dashboard
│   │   ├── @stats/page.tsx     → Parallel route: thống kê
│   │   └── @activity/page.tsx  → Parallel route: hoạt động
│   └── settings/
│       └── page.tsx            → /settings
│
├── blog/
│   ├── page.tsx                → /blog
│   └── [slug]/page.tsx         → /blog/:slug
│
├── _components/                → Private: shared components
├── _lib/                       → Private: shared utilities
└── _hooks/                     → Private: shared hooks
```

## Lỗi thường gặp

### 1. Quên tạo file `page.tsx`

```
app/about/              → KHÔNG có page.tsx
```

Folder tồn tại nhưng truy cập `/about` sẽ trả về **404**. Mỗi route cần `page.tsx` để accessible.

### 2. Nhầm lẫn Route Group với route thật

```
app/(admin)/dashboard/page.tsx    → URL là /dashboard, KHÔNG phải /admin/dashboard
```

Route Group `(admin)` chỉ dùng để tổ chức code, không xuất hiện trong URL.

### 3. Thiếu `default.tsx` cho Parallel Routes

Khi dùng `@slot`, nếu navigate đến route con mà slot không có page tương ứng, Next.js sẽ báo lỗi. Luôn tạo `default.tsx` cho mỗi slot.

### 4. Intercepting Route sai cấp

```
app/
├── feed/
│   └── (.)photo/[id]/    → (.) intercept cùng cấp — SAI nếu photo/ ở root
└── photo/[id]/
```

Cần kiểm tra kỹ cấp của route gốc so với vị trí intercept. Dùng `(..)` nếu route gốc ở cấp cha.

### 5. Đặt `use client` trong `layout.tsx`

```tsx
// SAI: Layout thường nên là Server Component
"use client";
export default function Layout({ children }) { ... }
```

Layout nên là Server Component. Nếu cần interactivity, tách thành client component con và import vào layout.

## Câu hỏi phỏng vấn

### Câu 1: Next.js App Router xác định route như thế nào?

**Trả lời:** Next.js App Router sử dụng **file-based routing** dựa trên cấu trúc thư mục trong folder `app/`. Mỗi folder đại diện cho một route segment (đoạn URL), và file `page.tsx` bên trong folder đó xác định UI cho route. Chỉ khi folder chứa `page.tsx` thì route mới accessible. Các file khác đặt cùng folder (components, hooks, utils) không ảnh hưởng routing — đây gọi là **colocation**.

### Câu 2: Route Groups dùng để làm gì? Cho ví dụ cụ thể.

**Trả lời:** Route Groups dùng dấu ngoặc tròn `(groupName)` để nhóm các route lại **mà không thêm segment vào URL**. Ví dụ cụ thể: một ứng dụng e-commerce có thể dùng `(shop)` cho trang mua sắm với layout có sidebar danh mục, `(checkout)` cho luồng thanh toán với layout đơn giản, và `(admin)` cho trang quản trị với layout riêng. Tất cả cùng trong `app/` nhưng mỗi nhóm có layout.tsx riêng, URL không chứa tên group.

### Câu 3: Parallel Routes khác gì với việc render nhiều components trong một page?

**Trả lời:** Parallel Routes (`@slot`) có 3 lợi thế so với render components thông thường:
1. **Streaming độc lập** — mỗi slot có thể có `loading.tsx` riêng, một slot load chậm không chặn các slot khác
2. **Error isolation** — mỗi slot có `error.tsx` riêng, một slot lỗi không ảnh hưởng slot khác
3. **Sub-navigation** — mỗi slot có thể có nested routes riêng, navigate độc lập

Còn khi render components thông thường, tất cả phải chờ đợi nhau và chia sẻ cùng error boundary.

### Câu 4: Giải thích cách Intercepting Routes hoạt động. Khi nào nên dùng?

**Trả lời:** Intercepting Routes cho phép "chặn" một route và hiển thị nó trong context hiện tại (thường là modal) khi user soft-navigate (click Link). Khi user hard-navigate (nhập URL trực tiếp hoặc refresh), route gốc hiển thị trang đầy đủ.

Convention: `(.)` cùng cấp, `(..)` lên 1 cấp, `(...)` từ root.

Nên dùng khi: xem chi tiết ảnh/sản phẩm trong modal từ danh sách, xem profile user trong modal, form tạo nhanh hiện modal trên trang hiện tại. Pattern này giúp URL shareable (copy URL gửi bạn vẫn mở được trang đầy đủ) đồng thời giữ UX mượt khi navigate trong app.

### Câu 5: So sánh `layout.tsx` và `template.tsx`. Khi nào dùng cái nào?

**Trả lời:**

| Tiêu chí | `layout.tsx` | `template.tsx` |
|----------|-------------|---------------|
| **Re-render** | Giữ state, không re-render khi navigate giữa route con | Tạo instance mới mỗi lần navigate |
| **State** | Preserved | Reset |
| **Use case** | Sidebar, navigation, shared UI | Enter/exit animation, form reset, analytics page view |
| **Performance** | Tốt hơn (không re-render) | Tốn hơn (tạo mới mỗi lần) |

**Mặc định dùng `layout.tsx`**. Chỉ dùng `template.tsx` khi cần behavior "tạo mới mỗi lần navigate" — ví dụ: animation fade-in mỗi khi chuyển trang, hoặc cần reset form state khi user navigate đi rồi quay lại.

### Câu 6: Private folders `_folderName` khác gì với Route Groups `(groupName)`?

**Trả lời:**
- **Private folders `_folderName`**: Next.js hoàn toàn **bỏ qua** folder này khi scan routes. Dùng để chứa shared code (components, utils, hooks) mà chắc chắn không phải route. Không thể chứa `page.tsx` để tạo route.
- **Route Groups `(groupName)`**: Vẫn là **phần của routing system**, cho phép chứa `page.tsx`, `layout.tsx`, và các route con. Chỉ là tên group không xuất hiện trong URL. Dùng để tổ chức route theo logic nghiệp vụ và chia sẻ layout.

Ví dụ: `_components/` cho shared components, `(marketing)/` cho nhóm các trang marketing có chung layout.
