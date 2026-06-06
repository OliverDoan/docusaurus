---
sidebar_position: 1
title: "1. Data Fetching Patterns"
---

# Data Fetching Patterns

**Data fetching patterns** (các mẫu lấy dữ liệu) là những cách tổ chức việc lấy dữ liệu sao cho trang tải nhanh và mượt hơn. Bài này giới thiệu các kỹ thuật như lấy dữ liệu **parallel** (song song — chạy nhiều request cùng lúc) so với **sequential** (tuần tự — chạy lần lượt), **preloading** (tải trước dữ liệu sớm) và tránh **waterfall** (hiệu ứng thác nước — các request chờ nhau nối tiếp gây chậm). Hiểu các mẫu này giúp người mới tối ưu hiệu năng trong Next.js.

---

## Mục lục

- [Parallel vs Sequential](#parallel-vs-sequential)
- [Preloading Data](#preloading-data)
- [Waterfall Prevention](#waterfall-prevention)
- [Streaming + Suspense](#streaming--suspense)

---

## Parallel vs Sequential

**Sequential** — fetch tuần tự (mỗi cái đợi cái trước):

```tsx
async function Page() {
  const user = await fetchUser();         // 1s
  const orders = await fetchOrders();     // 1s
  const products = await fetchProducts(); // 1s
  // Total: 3s
}
```

**Parallel** — fetch song song:

```tsx
async function Page() {
  const [user, orders, products] = await Promise.all([
    fetchUser(),
    fetchOrders(),
    fetchProducts(),
  ]);
  // Total: max(1s) = 1s
}
```

Quy tắc: **luôn parallel khi không có dependency**.

---

## Sequential cần thiết khi có dependency

```tsx
async function Page() {
  const user = await fetchUser();                  // 1s
  const orders = await fetchOrders(user.id);       // 1s — cần user.id
  // Total: 2s (không tránh được)
}
```

---

## Preloading Data

Khi data **sẽ cần** nhưng không phải ngay → preload song song:

```tsx
import { preload } from "@/lib/cache";

async function Page() {
  preload(userId); // trigger fetch nhưng không await

  return (
    <>
      <Header /> {/* render trước */}
      <UserDetail userId={userId} /> {/* await ở đây, đã fetch xong */}
    </>
  );
}

// utils
export async function preload(userId: string) {
  void fetchUser(userId); // fire-and-forget
}
```

**Pattern: preload trong layout** — data fetch khi parent render, sẵn
sàng khi child cần:

```tsx
// app/dashboard/layout.tsx
import { preloadUser } from "@/lib/preload";

export default async function Layout({ children }) {
  preloadUser(); // start fetch
  return <>{children}</>;
}

// app/dashboard/page.tsx
async function Page() {
  const user = await fetchUser(); // dedupe — đã trong cache từ layout
}
```

---

## Waterfall Prevention

**Anti-pattern — Component waterfall**:

```tsx
// SAI — mỗi component await tuần tự
async function Page() {
  return (
    <>
      <User />     {/* await fetchUser */}
      <Orders />   {/* await fetchOrders — chỉ start khi User done */}
      <Products /> {/* await fetchProducts — chỉ start khi Orders done */}
    </>
  );
}
```

Tại sao? Server Component render tuần tự. Mỗi `await` block render kế tiếp.

**Fix** — preload + parallel:

```tsx
async function Page() {
  // Preload ngay đầu
  const userPromise = fetchUser();
  const ordersPromise = fetchOrders();
  const productsPromise = fetchProducts();

  return (
    <>
      <User promise={userPromise} />
      <Orders promise={ordersPromise} />
      <Products promise={productsPromise} />
    </>
  );
}

async function User({ promise }) {
  const user = await promise;
  return <div>{user.name}</div>;
}
```

Hoặc dùng **Suspense + lazy** — Next.js stream khi resolve:

```tsx
function Page() {
  return (
    <>
      <Suspense fallback={<UserSkeleton />}>
        <User />
      </Suspense>
      <Suspense fallback={<OrdersSkeleton />}>
        <Orders />
      </Suspense>
    </>
  );
}

async function User() {
  const user = await fetchUser();
  return <div>{user.name}</div>;
}

async function Orders() {
  const orders = await fetchOrders();
  return <ul>{orders.map(...)}</ul>;
}
```

Mỗi Suspense boundary **independent** — User và Orders fetch song song,
render khi sẵn sàng.

:::info[Phân tích]

**Suspense + Promise pattern (React 19)**:

```tsx
function Page() {
  const userPromise = fetchUser();      // start ngay
  const ordersPromise = fetchOrders();  // start ngay

  return (
    <>
      <Suspense fallback={<Skeleton />}>
        <UserDetail promise={userPromise} />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <OrderList promise={ordersPromise} />
      </Suspense>
    </>
  );
}

function UserDetail({ promise }) {
  const user = use(promise); // React 19 use hook
  return <div>{user.name}</div>;
}
```

Lợi ích:

- Cả 2 promise start **song song** ngay từ đầu.
- Mỗi Suspense resolve **độc lập**.
- HTML stream theo từng resolve.

Đây là pattern data fetching **chuẩn nhất** cho App Router 2026.

:::

---

## Streaming + Suspense

Khi component có data nặng → wrap Suspense để stream:

```tsx
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <Chart />
      </Suspense>

      <Suspense fallback={<RecentSkeleton />}>
        <RecentActivity />
      </Suspense>
    </div>
  );
}
```

User experience:

1. Browser nhận HTML "Dashboard" + 3 skeleton **ngay**.
2. Stats resolve sau 0.5s → swap skeleton thành data.
3. Chart resolve sau 1s → swap.
4. RecentActivity resolve sau 2s → swap.

Mỗi phần load **độc lập**, **song song**. So với fetch hết rồi mới render
= 2s nothing visible.

:::tip[Mẹo]

**Loading.tsx vs Suspense thủ công**:

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <PageSkeleton />;
}

// app/dashboard/page.tsx
async function Dashboard() {
  const data = await fetchAll(); // loading.tsx hiển thị
  return <div>{/* ... */}</div>;
}
```

Loading.tsx wrap **toàn page**. Nếu data từng phần load thời gian khác
nhau → user thấy skeleton lâu.

**Suspense thủ công** trong page → cho phép từng phần load độc lập:

```tsx
async function Dashboard() {
  return (
    <>
      <PageHeader /> {/* render ngay với layout */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
    </>
  );
}
```

Combo cả hai cho UX tốt nhất:

- `loading.tsx` → khi navigation đến page.
- Suspense con → khi page mount, từng phần load.

:::

:::warning[Cần lưu ý]

**Trade-off của streaming**:

1. **TTFB cao hơn** — server bắt đầu stream nhưng response time đo có
   thể tệ hơn (HTTP header arrived sau).
2. **HTML structure** — phải có placeholder, không phải HTML rỗng.
3. **SEO** — Google crawl được stream HTML, nhưng cẩn thận với critical content.

Khi data load **rất nhanh** (`<100ms`), Suspense không có ích — page render
một lần là tốt hơn. Suspense shine khi:

- Data lâu (>500ms).
- Multiple sources song song.
- UX cần feedback ngay.

:::
