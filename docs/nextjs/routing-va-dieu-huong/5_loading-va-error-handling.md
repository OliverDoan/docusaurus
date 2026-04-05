---
sidebar_position: 5
title: "Loading & Error Handling"
---

# Loading & Error Handling

## Tổng quan

Next.js App Router cung cấp **file conventions** để xử lý loading states và errors ở cấp route segment. Thay vì viết logic loading/error thủ công, bạn chỉ cần tạo file đúng tên — Next.js tự động wrap chúng trong React Suspense và Error Boundary.

| File | Vai trò | React tương đương |
|------|---------|-------------------|
| `loading.tsx` | Loading UI khi route đang tải | `Suspense` fallback |
| `error.tsx` | Error UI khi route gặp lỗi | `ErrorBoundary` |
| `not-found.tsx` | 404 page | Custom 404 |
| `global-error.tsx` | Error UI cho toàn bộ app (root) | Root `ErrorBoundary` |

### Cách Next.js wrap các file này

Khi bạn tạo `loading.tsx` và `error.tsx` trong một route, Next.js tự động tạo cấu trúc sau:

```tsx
// Next.js tự động tạo cấu trúc này (bạn KHÔNG cần viết)
<Layout>
  <ErrorBoundary fallback={<Error />}>
    <Suspense fallback={<Loading />}>
      <Page />
    </Suspense>
  </ErrorBoundary>
</Layout>
```

## loading.tsx — Automatic Loading UI

`loading.tsx` tạo loading UI **tự động** cho route segment. Nó wrap page trong React Suspense — khi page đang fetch data hoặc render, loading UI hiển thị ngay lập tức.

### Cách tạo

```
app/
├── dashboard/
│   ├── loading.tsx      → Loading UI cho /dashboard
│   ├── page.tsx         → Page chính
│   └── analytics/
│       ├── loading.tsx  → Loading UI riêng cho /dashboard/analytics
│       └── page.tsx
```

### Loading đơn giản

```tsx
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
        <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
      </div>
    </div>
  );
}
```

### Skeleton Loading (UX tốt hơn)

Skeleton loading tạo layout giống trang thật nhưng với placeholder — giúp user biết nội dung sắp xuất hiện ở đâu.

```tsx
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 border rounded-lg space-y-3"
          >
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-28 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="border rounded-lg overflow-hidden">
        {/* Table header */}
        <div className="bg-gray-50 p-4 flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-4 flex-1 bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>

        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-t flex gap-4">
            {Array.from({ length: 5 }).map((_, j) => (
              <div
                key={j}
                className="h-4 flex-1 bg-gray-100 rounded animate-pulse"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Instant Loading — Tại sao loading.tsx quan trọng?

Khi user navigate đến route mới, Next.js hiển thị `loading.tsx` **ngay lập tức** (instant) trong khi page đang được render trên server. Điều này tạo cảm giác app rất nhanh:

```
User click link
     ↓
loading.tsx hiển thị NGAY (< 100ms)
     ↓
Server render page (có thể mất 1-3 giây)
     ↓
Page thay thế loading.tsx (streaming)
```

### Streaming với Suspense thủ công

Ngoài `loading.tsx`, bạn có thể dùng `Suspense` trực tiếp để **streaming từng phần** của page:

```tsx
// app/dashboard/page.tsx
import { Suspense } from "react";

// Component fetch data chậm
async function RevenueChart() {
  // Giả sử API này mất 3 giây
  const data = await fetch("https://api.example.com/revenue", {
    cache: "no-store",
  }).then((res) => res.json());

  return (
    <div className="border rounded-lg p-4">
      <h3>Doanh thu</h3>
      {/* Render biểu đồ */}
    </div>
  );
}

// Component fetch data nhanh
async function QuickStats() {
  const stats = await fetch("https://api.example.com/stats").then(
    (res) => res.json()
  );

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 border rounded">
        <p>Đơn hàng: {stats.orders}</p>
      </div>
      <div className="p-4 border rounded">
        <p>Khách hàng: {stats.customers}</p>
      </div>
      <div className="p-4 border rounded">
        <p>Sản phẩm: {stats.products}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats tải nhanh — hiện trước */}
      <Suspense
        fallback={
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 rounded animate-pulse"
              />
            ))}
          </div>
        }
      >
        <QuickStats />
      </Suspense>

      {/* Biểu đồ tải chậm — hiện sau */}
      <Suspense
        fallback={
          <div className="h-64 bg-gray-100 rounded animate-pulse flex items-center justify-center">
            <p className="text-gray-400">Đang tải biểu đồ...</p>
          </div>
        }
      >
        <RevenueChart />
      </Suspense>
    </div>
  );
}
```

Kết quả: QuickStats hiện trước (nhanh), RevenueChart hiện sau (chậm) — mỗi phần stream độc lập.

## error.tsx — Error Boundary cho Route Segments

`error.tsx` bắt **runtime errors** trong route segment và hiển thị error UI thay vì crash toàn bộ app.

### Cách tạo

```tsx
// app/dashboard/error.tsx
// PHẢI là Client Component
"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log error lên service (Sentry, LogRocket, ...)
  useEffect(() => {
    console.error("Dashboard error:", error);
    // Gửi lên error tracking service
    // reportError(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          Đã xảy ra lỗi!
        </h2>
        <p className="text-gray-600 mb-4">
          Không thể tải dữ liệu dashboard. Vui lòng thử lại.
        </p>

        {/* Hiện error message trong development */}
        {process.env.NODE_ENV === "development" && (
          <pre className="text-left bg-red-50 p-4 rounded text-sm mb-4 overflow-auto">
            {error.message}
          </pre>
        )}

        <div className="flex gap-3 justify-center">
          {/* reset() thử render lại route segment */}
          <button
            onClick={() => reset()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Thử lại
          </button>

          {/* Quay về trang chủ */}
          <a
            href="/"
            className="border px-4 py-2 rounded hover:bg-gray-50"
          >
            Về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}
```

### error.tsx phải là Client Component

`error.tsx` **bắt buộc** phải có `"use client"` directive vì:
1. Error Boundary là feature của React chỉ hoạt động ở client
2. Cần handle user interaction (nút "Thử lại")
3. Cần chạy side effects (log error)

### error.tsx KHÔNG bắt lỗi trong layout.tsx cùng cấp

Đây là điểm quan trọng: `error.tsx` bắt lỗi từ `page.tsx` và các route con, nhưng **KHÔNG bắt lỗi từ `layout.tsx` cùng cấp**. Lý do: layout wrap bên ngoài error boundary.

```
Layout (error ở đây KHÔNG bị bắt bởi error.tsx cùng cấp)
  └── ErrorBoundary (error.tsx)
        └── Page (error ở đây BỊ bắt)
```

Để bắt lỗi trong layout, đặt `error.tsx` ở **route cha**:

```
app/
├── error.tsx             → Bắt lỗi từ layout.tsx của route con
└── dashboard/
    ├── layout.tsx        → Lỗi ở đây bị bắt bởi app/error.tsx
    ├── error.tsx         → Bắt lỗi từ page.tsx
    └── page.tsx
```

## not-found.tsx — Trang 404

`not-found.tsx` hiển thị khi gọi hàm `notFound()` hoặc khi URL không match route nào.

### Global 404 page

```tsx
// app/not-found.tsx — 404 page cho toàn bộ app
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="text-center max-w-lg">
        {/* Số 404 lớn */}
        <h1 className="text-9xl font-bold text-gray-200">404</h1>

        <h2 className="text-2xl font-bold text-gray-800 -mt-8 mb-4">
          Trang không tồn tại
        </h2>

        <p className="text-gray-600 mb-8">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã
          được di chuyển đến địa chỉ khác.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Về trang chủ
          </Link>
          <Link
            href="/sitemap"
            className="border px-6 py-3 rounded-lg hover:bg-gray-50"
          >
            Xem sitemap
          </Link>
        </div>

        {/* Gợi ý tìm kiếm */}
        <div className="mt-12">
          <p className="text-sm text-gray-500 mb-3">
            Có thể bạn đang tìm:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/blog"
              className="text-blue-500 hover:underline text-sm"
            >
              Blog
            </Link>
            <Link
              href="/products"
              className="text-blue-500 hover:underline text-sm"
            >
              Sản phẩm
            </Link>
            <Link
              href="/about"
              className="text-blue-500 hover:underline text-sm"
            >
              Giới thiệu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### not-found.tsx cho route cụ thể

```tsx
// app/blog/[slug]/not-found.tsx
// 404 riêng cho blog — gợi ý bài viết khác
import Link from "next/link";

export default function BlogNotFound() {
  return (
    <div className="max-w-2xl mx-auto p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">
        Bài viết không tồn tại
      </h2>
      <p className="text-gray-600 mb-6">
        Bài viết bạn đang tìm có thể đã bị xóa hoặc URL không
        chính xác.
      </p>
      <Link
        href="/blog"
        className="text-blue-500 hover:underline"
      >
        Xem tất cả bài viết
      </Link>
    </div>
  );
}
```

### Gọi notFound() trong Server Component

```tsx
// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await fetch(
    `https://api.example.com/posts/${slug}`
  );

  // Nếu không tìm thấy → trigger not-found.tsx
  if (!post.ok) {
    notFound();
    // Code sau notFound() KHÔNG chạy
  }

  const data = await post.json();

  return (
    <article>
      <h1>{data.title}</h1>
      <div>{data.content}</div>
    </article>
  );
}
```

## global-error.tsx — Root Error Handling

`global-error.tsx` bắt lỗi ở **root layout** (`app/layout.tsx`) — nơi mà `error.tsx` thông thường không bao phủ.

### Đặc điểm quan trọng

1. `global-error.tsx` **thay thế toàn bộ root layout** khi active — nên phải render `<html>` và `<body>` tags
2. Chỉ active trong **production** — development hiện error overlay thay thế
3. Đây là "phòng tuyến cuối cùng" để bắt lỗi

```tsx
// app/global-error.tsx
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    // PHẢI render html và body vì thay thế root layout
    <html lang="vi">
      <body>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
          <div className="text-center max-w-lg">
            <h1 className="text-4xl font-bold text-red-600 mb-4">
              Lỗi hệ thống
            </h1>
            <p className="text-gray-600 mb-6">
              Ứng dụng gặp lỗi nghiêm trọng. Chúng tôi đã ghi nhận
              và đang khắc phục.
            </p>

            {/* Error digest — mã lỗi để report */}
            {error.digest && (
              <p className="text-sm text-gray-400 mb-4">
                Mã lỗi: {error.digest}
              </p>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => reset()}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
              >
                Tải lại ứng dụng
              </button>
              <a
                href="/"
                className="border px-6 py-3 rounded-lg hover:bg-gray-100"
              >
                Về trang chủ
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
```

## Nested Error Boundaries

Error boundaries hoạt động theo **cây component** — lỗi "nổi bọt" (bubble up) đến error boundary gần nhất.

### Cấu trúc nested errors

```
app/
├── error.tsx                → Bắt lỗi từ layout con, fallback cuối
├── layout.tsx               → Root layout
├── dashboard/
│   ├── error.tsx            → Bắt lỗi dashboard page
│   ├── layout.tsx
│   ├── page.tsx
│   ├── analytics/
│   │   ├── error.tsx        → Bắt lỗi analytics
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx         → Lỗi ở đây nổi lên dashboard/error.tsx
```

### Ví dụ: Lỗi ở analytics không ảnh hưởng dashboard khác

```tsx
// app/dashboard/analytics/error.tsx
"use client";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="border border-red-200 bg-red-50 rounded-lg p-6">
      <h3 className="text-red-600 font-medium mb-2">
        Không thể tải phân tích
      </h3>
      <p className="text-sm text-red-500 mb-4">
        Module phân tích gặp lỗi. Các phần khác của dashboard vẫn
        hoạt động bình thường.
      </p>
      <button
        onClick={() => reset()}
        className="text-sm bg-red-600 text-white px-3 py-1 rounded"
      >
        Tải lại phân tích
      </button>
    </div>
  );
}
```

Khi `/dashboard/analytics/page.tsx` throw error:
- `analytics/error.tsx` bắt lỗi → chỉ phần analytics hiện error UI
- Dashboard sidebar, header, navigation vẫn hoạt động bình thường
- User có thể navigate đến `/dashboard/settings` mà không cần reload

## Recovery from Errors — Hàm reset()

`reset()` function cố gắng **re-render route segment** — tức là thử lại mà không reload toàn bộ trang.

### reset() hoạt động thế nào

```tsx
"use client";

import { useEffect, useState } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    // Log error
    console.error(`Error (attempt ${retryCount + 1}):`, error);
  }, [error, retryCount]);

  const handleRetry = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount((prev) => prev + 1);
      reset(); // Thử render lại route segment
    }
  };

  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold text-red-600 mb-4">
        Đã xảy ra lỗi
      </h2>

      {retryCount < MAX_RETRIES ? (
        <div>
          <p className="text-gray-600 mb-4">
            Đã thử {retryCount}/{MAX_RETRIES} lần.
          </p>
          <button
            onClick={handleRetry}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">
            Đã thử {MAX_RETRIES} lần nhưng vẫn lỗi. Vui lòng
            liên hệ hỗ trợ.
          </p>
          <a
            href="/"
            className="text-blue-500 hover:underline"
          >
            Về trang chủ
          </a>
        </div>
      )}
    </div>
  );
}
```

### Khi nào reset() hoạt động vs không hoạt động

**reset() hoạt động** khi:
- Lỗi tạm thời (network timeout, API down tạm)
- Data đã thay đổi kể từ lần lỗi (user khác đã fix data)
- Race condition đã qua

**reset() KHÔNG hoạt động** khi:
- Bug trong code (sẽ lỗi lại ngay)
- Data cố định bị sai (cần fix data)
- Environment issue (missing env var)

## Custom Error Pages với Styling đẹp

### Error page thân thiện cho production

```tsx
// app/dashboard/error.tsx
"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Gửi error lên Sentry/LogRocket/DataDog
    // Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Icon lỗi */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            Không thể tải trang
          </h2>
          <p className="text-gray-500 mt-2">
            Đã xảy ra lỗi khi tải nội dung. Vui lòng thử lại
            hoặc quay về trang chủ.
          </p>
        </div>

        {/* Error details (chỉ development) */}
        {process.env.NODE_ENV === "development" && (
          <details className="mb-6 bg-gray-50 rounded-lg p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              Chi tiết lỗi (development only)
            </summary>
            <pre className="mt-2 text-xs text-red-600 overflow-auto whitespace-pre-wrap">
              {error.message}
              {"\n\n"}
              {error.stack}
            </pre>
          </details>
        )}

        {/* Error digest cho support */}
        {error.digest && (
          <p className="text-center text-xs text-gray-400 mb-4">
            Mã lỗi: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition"
          >
            Thử lại
          </button>

          <Link
            href="/dashboard"
            className="w-full text-center border py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Về Dashboard
          </Link>

          <Link
            href="/"
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Tổng hợp: Cấu trúc error handling hoàn chỉnh

```
app/
├── global-error.tsx         → Bắt lỗi root layout (phòng tuyến cuối)
├── error.tsx                → Bắt lỗi chung cho các route không có error.tsx riêng
├── not-found.tsx            → 404 page chung
├── loading.tsx              → Loading chung
├── layout.tsx
│
├── dashboard/
│   ├── error.tsx            → Error riêng cho dashboard
│   ├── loading.tsx          → Skeleton loading cho dashboard
│   ├── not-found.tsx        → 404 riêng: "Module không tồn tại"
│   ├── layout.tsx
│   ├── page.tsx
│   ├── analytics/
│   │   ├── error.tsx        → Error riêng: "Không tải được analytics"
│   │   ├── loading.tsx      → Skeleton biểu đồ
│   │   └── page.tsx
│   └── settings/
│       ├── loading.tsx
│       └── page.tsx         → Lỗi ở đây nổi lên dashboard/error.tsx
│
└── blog/
    ├── loading.tsx           → Skeleton danh sách bài
    ├── page.tsx
    └── [slug]/
        ├── loading.tsx       → Skeleton bài viết
        ├── not-found.tsx     → "Bài viết không tồn tại"
        └── page.tsx
```

## Lỗi thường gặp

### 1. Quên `"use client"` trong error.tsx

```tsx
// SAI: error.tsx PHẢI là Client Component
export default function Error({ error, reset }) {
  return <div>Error</div>; // Sẽ KHÔNG hoạt động
}

// ĐÚNG: Thêm "use client"
"use client";
export default function Error({ error, reset }) {
  return <div>Error</div>;
}
```

### 2. Nghĩ error.tsx bắt lỗi trong layout.tsx cùng cấp

```
app/dashboard/
├── layout.tsx     → Lỗi ở đây KHÔNG bị bắt bởi error.tsx bên dưới
├── error.tsx      → Chỉ bắt lỗi từ page.tsx và route con
└── page.tsx
```

Giải pháp: Đặt `error.tsx` ở route CHA để bắt lỗi trong layout.

### 3. Loading state không hiển thị cho data fetch trong layout

```tsx
// app/dashboard/layout.tsx
export default async function Layout({ children }) {
  // Data fetch ở layout KHÔNG trigger loading.tsx cùng cấp
  const user = await getUser();
  return <div>{children}</div>;
}
```

`loading.tsx` chỉ wrap `page.tsx`, không wrap `layout.tsx`. Nếu layout fetch data chậm, dùng Suspense thủ công bên trong layout.

### 4. notFound() trong Client Component

```tsx
// SAI: notFound() chỉ dùng trong Server Components
"use client";
import { notFound } from "next/navigation";

export default function ClientPage() {
  notFound(); // Lỗi!
}

// ĐÚNG: Dùng router.push('/not-found') hoặc dùng trong Server Component
```

### 5. global-error.tsx thiếu html/body tags

```tsx
// SAI: Thiếu html và body
"use client";
export default function GlobalError({ error, reset }) {
  return <div>Global Error</div>; // Trang sẽ hiển thị sai
}

// ĐÚNG: Render đầy đủ html và body
"use client";
export default function GlobalError({ error, reset }) {
  return (
    <html lang="vi">
      <body>
        <div>Global Error</div>
      </body>
    </html>
  );
}
```

## Câu hỏi phỏng vấn

### Câu 1: loading.tsx hoạt động thế nào? Nó liên quan gì đến React Suspense?

**Trả lời:** `loading.tsx` là syntactic sugar của Next.js. Khi bạn tạo file `loading.tsx` trong một route, Next.js tự động wrap `page.tsx` trong React `Suspense` component với `loading.tsx` làm fallback:

```tsx
// Next.js tạo tự động:
<Suspense fallback={<Loading />}>
  <Page />
</Suspense>
```

Khi page đang render trên server (fetching data, computing), Suspense hiển thị loading fallback ngay lập tức. Khi page ready, React **streaming** HTML của page xuống thay thế loading UI — không cần full page reload. Đây gọi là **instant loading state** — user thấy phản hồi ngay, không phải đợi blank screen.

### Câu 2: error.tsx không bắt lỗi trong layout.tsx cùng cấp. Tại sao và cách xử lý?

**Trả lời:** Do cách Next.js wrap components:

```tsx
<Layout>               // Layout ở BÊN NGOÀI ErrorBoundary
  <ErrorBoundary>      // error.tsx
    <Page />           // page.tsx — lỗi ở đây bị bắt
  </ErrorBoundary>
</Layout>
```

ErrorBoundary chỉ bắt lỗi từ **children bên trong**. Layout nằm **bên ngoài** nên lỗi trong layout không bị bắt.

Cách xử lý:
1. Đặt `error.tsx` ở **route cha** — nó sẽ bắt lỗi từ layout của route con
2. Dùng `global-error.tsx` cho root layout (`app/layout.tsx`)
3. Trong layout, wrap phần có thể lỗi trong try/catch hoặc Error Boundary thủ công

### Câu 3: Hàm reset() hoạt động thế nào? Khi nào nên dùng?

**Trả lời:** `reset()` cố gắng **re-render route segment** mà không reload toàn bộ trang. Nó clear React error state và thử render lại component tree từ đầu.

Nên dùng khi:
- Lỗi có thể tạm thời (network timeout, API temporarily unavailable)
- User action có thể fix lỗi (ví dụ: data đã được tạo bởi request khác)

Không nên dùng khi:
- Lỗi do bug trong code (sẽ lỗi lại ngay)
- Environment issue (missing config)

Best practice: Giới hạn số lần retry (max 3 lần), sau đó hiện message "liên hệ hỗ trợ". Log mỗi lần retry để monitor.

### Câu 4: So sánh `not-found.tsx` và `error.tsx`. Khi nào dùng cái nào?

**Trả lời:**

| Tiêu chí | `not-found.tsx` | `error.tsx` |
|----------|-----------------|-------------|
| **Trigger** | Gọi `notFound()` hoặc URL không match | Runtime error/exception |
| **HTTP Status** | 404 | 500 (hoặc khác) |
| **Use case** | Resource không tồn tại (bài viết bị xóa, URL sai) | Server error, API fail, bug |
| **Client Component** | Không bắt buộc | Bắt buộc (`"use client"`) |
| **Props** | Không có props | `error` object + `reset` function |

Dùng `notFound()` khi bạn **biết chắc** resource không tồn tại (query database trả về null). Dùng `error.tsx` cho lỗi **không mong đợi** (API timeout, parse error, null reference).

### Câu 5: Làm sao thiết kế error handling strategy cho production app?

**Trả lời:** Chiến lược 4 tầng:

1. **global-error.tsx**: Phòng tuyến cuối — bắt lỗi root layout, hiện trang lỗi cơ bản với html/body tags
2. **app/error.tsx**: Error boundary chung — bắt lỗi từ mọi route không có error.tsx riêng
3. **Route-specific error.tsx**: Error boundary cho từng module quan trọng (dashboard, checkout) — UI lỗi phù hợp ngữ cảnh (VD: "Không tải được đơn hàng" thay vì "Đã xảy ra lỗi" chung chung)
4. **Suspense + try/catch trong component**: Xử lý lỗi cục bộ trước khi bubble lên error boundary

Thêm vào đó:
- **Error tracking**: Gửi error lên Sentry/DataDog từ `useEffect` trong error.tsx
- **Error digest**: Next.js tự tạo digest (hash) cho error — hiển thị cho user để báo support
- **Graceful degradation**: Phần lỗi hiện fallback UI, phần còn lại vẫn hoạt động (nhờ nested error boundaries)
- **Skeleton loading**: Dùng skeleton thay vì spinner — giảm CLS (Cumulative Layout Shift) và tạo perceived performance tốt hơn
