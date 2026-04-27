---
sidebar_position: 5
title: "5. Streaming & Suspense"
---

# Streaming & Suspense


---

## Mục lục

- [Streaming SSR là gì?](#streaming-ssr-là-gì)
- [React Suspense](#react-suspense)
- [loading.tsx — Suspense Boundary tự động](#loadingtsx-suspense-boundary-tự-động)
- [Partial Rendering — Nội dung hiện dần](#partial-rendering-nội-dung-hiện-dần)
- [Nested Suspense Boundaries](#nested-suspense-boundaries)
- [Streaming với Server Components](#streaming-với-server-components)
- [Sequential vs Parallel Data Fetching với Suspense](#sequential-vs-parallel-data-fetching-với-suspense)
- [Real-world Example: Dashboard hoàn chỉnh](#real-world-example-dashboard-hoàn-chỉnh)
- [Best Practices](#best-practices)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tổng kết](#tổng-kết)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Streaming SSR là gì?

Trong SSR truyền thống, server phải hoàn thành toàn bộ HTML rồi mới gửi cho client. **Streaming SSR** cho phép server gửi HTML **từng phần** (chunks) ngay khi chúng sẵn sàng.

```
// SSR truyền thống
Server: [Fetch ALL data] → [Render ALL HTML] → [Send ALL to client]
Client: [Nhận HTML]      → [Hiển thị]        → [Hydrate]

// Streaming SSR
Server: [Fetch data A] → [Send HTML A] → [Fetch data B] → [Send HTML B]
Client: [Hiển thị A]   → [Hydrate A]   → [Hiển thị B]   → [Hydrate B]
```

### Lợi ích của Streaming

| Tiêu chí | SSR truyền thống | Streaming SSR |
|-----------|-------------------|---------------|
| Time to First Byte (TTFB) | Chậm (chờ tất cả) | Nhanh (gửi ngay phần đầu) |
| First Contentful Paint (FCP) | Chậm | Nhanh |
| Trải nghiệm người dùng | Màn hình trắng lâu | Nội dung hiện dần |
| SEO | Tốt | Tốt |

## React Suspense

`Suspense` là một React component cho phép bạn **"treo"** (suspend) việc render một phần UI cho đến khi dữ liệu sẵn sàng, đồng thời hiển thị fallback UI.

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';
import UserProfile from './UserProfile';
import RecentOrders from './RecentOrders';
import Recommendations from './Recommendations';

export default function DashboardPage() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {/* Mỗi section có loading state riêng */}
      <Suspense fallback={<ProfileSkeleton />}>
        <UserProfile />
      </Suspense>

      <Suspense fallback={<OrdersSkeleton />}>
        <RecentOrders />
      </Suspense>

      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations />
      </Suspense>
    </div>
  );
}
```

### Cách Suspense hoạt động

1. React bắt đầu render component tree
2. Gặp component cần fetch data → component "suspend" (ném một Promise)
3. React hiển thị `fallback` UI thay thế
4. Khi Promise resolve → React render lại component với data thực

```tsx
// Component này tự động "suspend" khi fetch data
// (Server Component async function)
async function UserProfile() {
  // React sẽ "suspend" trong khi chờ fetch
  const user = await fetch('https://api.example.com/user', {
    cache: 'no-store',
  }).then(res => res.json());

  return (
    <div className="profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

## loading.tsx — Suspense Boundary tự động

Trong Next.js App Router, file `loading.tsx` tạo một Suspense boundary **tự động** bao quanh `page.tsx`.

```
app/
├── dashboard/
│   ├── loading.tsx    ← Suspense fallback tự động
│   ├── page.tsx       ← Được wrap trong Suspense
│   └── layout.tsx     ← KHÔNG bị wrap
```

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent" />
      <span className="ml-3">Đang tải...</span>
    </div>
  );
}
```

Đây tương đương với:

```tsx
// Next.js tự động tạo cấu trúc này
<Layout>
  <Suspense fallback={<Loading />}>
    <Page />
  </Suspense>
</Layout>
```

### Skeleton Loading Pattern

```tsx
// app/dashboard/loading.tsx
// Skeleton UI giống cấu trúc trang thật
export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
```

## Partial Rendering — Nội dung hiện dần

Streaming cho phép hiển thị **một phần** trang trước, trong khi các phần khác vẫn đang tải. Đây gọi là **Partial Rendering**.

```tsx
// app/product/[id]/page.tsx
import { Suspense } from 'react';

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div>
      {/* Phần này render ngay lập tức */}
      <header>
        <nav>...</nav>
      </header>

      {/* Thông tin sản phẩm — tải nhanh */}
      <Suspense fallback={<ProductInfoSkeleton />}>
        <ProductInfo id={params.id} />
      </Suspense>

      {/* Đánh giá — tải chậm hơn, nhưng không block phần trên */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews productId={params.id} />
      </Suspense>

      {/* Sản phẩm liên quan — tải chậm nhất */}
      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProducts productId={params.id} />
      </Suspense>
    </div>
  );
}
```

### Thứ tự hiển thị

```
Thời gian →

0s:  [Header] [Nav] [ProductInfoSkeleton] [ReviewsSkeleton] [RelatedSkeleton]
1s:  [Header] [Nav] [ProductInfo ✓]       [ReviewsSkeleton] [RelatedSkeleton]
3s:  [Header] [Nav] [ProductInfo ✓]       [Reviews ✓]       [RelatedSkeleton]
5s:  [Header] [Nav] [ProductInfo ✓]       [Reviews ✓]       [Related ✓]
```

## Nested Suspense Boundaries

Bạn có thể **lồng nhau** nhiều Suspense boundaries để kiểm soát loading state chi tiết hơn.

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';

export default function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Sidebar — tải nhanh */}
      <Suspense fallback={<SidebarSkeleton />}>
        <aside className="col-span-3">
          <Sidebar />
        </aside>
      </Suspense>

      {/* Main content area */}
      <main className="col-span-9 space-y-6">
        {/* Stats overview — tải nhanh */}
        <Suspense fallback={<StatsSkeleton />}>
          <StatsOverview />
        </Suspense>

        {/* Charts section — chứa nested Suspense */}
        <Suspense fallback={<ChartsSkeleton />}>
          <div className="grid grid-cols-2 gap-4">
            {/* Mỗi chart tải độc lập */}
            <Suspense fallback={<ChartSkeleton />}>
              <RevenueChart />
            </Suspense>
            <Suspense fallback={<ChartSkeleton />}>
              <UsersChart />
            </Suspense>
          </div>
        </Suspense>

        {/* Recent activity */}
        <Suspense fallback={<ActivitySkeleton />}>
          <RecentActivity />
        </Suspense>
      </main>
    </div>
  );
}
```

### Quy tắc đặt Suspense

| Cấp độ | Khi nào dùng | Ví dụ |
|--------|-------------|-------|
| Page-level | Toàn bộ trang tải cùng lúc | `loading.tsx` |
| Section-level | Các section tải độc lập | Dashboard panels |
| Component-level | Từng component tải riêng | Individual charts |

## Streaming với Server Components

Server Components async tự động tích hợp với Streaming:

```tsx
// app/feed/page.tsx
import { Suspense } from 'react';

// Server Component — async function
async function NewsFeed() {
  // Fetch này "suspend" component cho đến khi có data
  const articles = await fetch('https://api.example.com/articles', {
    next: { revalidate: 60 },
  }).then(res => res.json());

  return (
    <ul className="space-y-4">
      {articles.map((article: any) => (
        <li key={article.id} className="p-4 border rounded-lg">
          <h3 className="font-bold">{article.title}</h3>
          <p className="text-gray-600">{article.summary}</p>
        </li>
      ))}
    </ul>
  );
}

// Server Component — async, tải chậm hơn
async function TrendingTopics() {
  const topics = await fetch('https://api.example.com/trending', {
    cache: 'no-store',
  }).then(res => res.json());

  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((topic: any) => (
        <span key={topic.id} className="px-3 py-1 bg-blue-100 rounded-full text-sm">
          #{topic.name}
        </span>
      ))}
    </div>
  );
}

export default function FeedPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Bảng tin</h1>

      <Suspense fallback={<p>Đang tải chủ đề nổi bật...</p>}>
        <TrendingTopics />
      </Suspense>

      <Suspense fallback={<p>Đang tải bài viết...</p>}>
        <NewsFeed />
      </Suspense>
    </div>
  );
}
```

## Sequential vs Parallel Data Fetching với Suspense

### Sequential (chậm hơn — request nối tiếp)

```tsx
// BAD: Sequential — request 2 chờ request 1 xong
async function UserDashboard({ userId }: { userId: string }) {
  // Request 1: 2 giây
  const user = await fetchUser(userId);
  // Request 2: chờ request 1 xong, thêm 2 giây nữa
  const posts = await fetchUserPosts(userId);
  // Tổng: 4 giây

  return (
    <div>
      <h2>{user.name}</h2>
      <PostList posts={posts} />
    </div>
  );
}
```

### Parallel với Suspense (nhanh hơn)

```tsx
// GOOD: Song song với Suspense boundaries riêng biệt
export default function UserDashboard({ userId }: { userId: string }) {
  return (
    <div>
      <Suspense fallback={<UserSkeleton />}>
        <UserInfo userId={userId} />
      </Suspense>

      <Suspense fallback={<PostsSkeleton />}>
        <UserPosts userId={userId} />
      </Suspense>
    </div>
  );
}

// Mỗi component fetch riêng — song song tự nhiên
async function UserInfo({ userId }: { userId: string }) {
  const user = await fetchUser(userId); // 2 giây
  return <h2>{user.name}</h2>;
}

async function UserPosts({ userId }: { userId: string }) {
  const posts = await fetchUserPosts(userId); // 2 giây (song song với trên)
  return <PostList posts={posts} />;
}

// Tổng: 2 giây (thay vì 4 giây)
```

### Parallel với Promise.all (cùng component)

```tsx
// GOOD: Song song trong cùng component
async function UserDashboard({ userId }: { userId: string }) {
  // Khởi tạo cả 2 request cùng lúc
  const [user, posts] = await Promise.all([
    fetchUser(userId),
    fetchUserPosts(userId),
  ]);

  return (
    <div>
      <h2>{user.name}</h2>
      <PostList posts={posts} />
    </div>
  );
}
```

## Real-world Example: Dashboard hoàn chỉnh

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';

// --- Skeleton Components ---
function CardSkeleton() {
  return <div className="h-28 bg-gray-100 rounded-xl animate-pulse" />;
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-10 bg-gray-100 rounded animate-pulse" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-14 bg-gray-50 rounded animate-pulse" />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />;
}

// --- Data Components (Server) ---
async function StatsCards() {
  const stats = await fetch('https://api.example.com/stats', {
    next: { revalidate: 300 }, // Cache 5 phút
  }).then(res => res.json());

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat: any) => (
        <div key={stat.label} className="p-4 bg-white rounded-xl shadow">
          <p className="text-sm text-gray-500">{stat.label}</p>
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className={stat.change > 0 ? 'text-green-500' : 'text-red-500'}>
            {stat.change > 0 ? '+' : ''}{stat.change}%
          </p>
        </div>
      ))}
    </div>
  );
}

async function RevenueChart() {
  const data = await fetch('https://api.example.com/revenue-chart', {
    next: { revalidate: 3600 }, // Cache 1 giờ
  }).then(res => res.json());

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h3 className="font-bold mb-4">Doanh thu</h3>
      {/* Render chart với data */}
      <div className="h-56">Chart: {JSON.stringify(data.summary)}</div>
    </div>
  );
}

async function RecentOrders() {
  const orders = await fetch('https://api.example.com/orders/recent', {
    cache: 'no-store', // Luôn lấy data mới nhất
  }).then(res => res.json());

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h3 className="font-bold mb-4">Đơn hàng gần đây</h3>
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-500">
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: any) => (
            <tr key={order.id} className="border-t">
              <td className="py-3">{order.id}</td>
              <td>{order.customer}</td>
              <td>{order.total.toLocaleString('vi-VN')}đ</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Main Page ---
export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats tải đầu tiên — cache 5 phút nên nhanh */}
      <Suspense fallback={
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
      }>
        <StatsCards />
      </Suspense>

      {/* Chart và Orders tải song song */}
      <div className="grid grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <RevenueChart />
        </Suspense>

        <Suspense fallback={<TableSkeleton />}>
          <RecentOrders />
        </Suspense>
      </div>
    </div>
  );
}
```

## Best Practices

### 1. Đặt Suspense ở đúng cấp độ

```tsx
// BAD: Quá ít Suspense — toàn bộ trang loading cùng lúc
<Suspense fallback={<FullPageSpinner />}>
  <Header />
  <Sidebar />
  <MainContent />
  <Footer />
</Suspense>

// GOOD: Suspense cho từng section độc lập
<Header />
<div className="flex">
  <Suspense fallback={<SidebarSkeleton />}>
    <Sidebar />
  </Suspense>
  <Suspense fallback={<ContentSkeleton />}>
    <MainContent />
  </Suspense>
</div>
<Footer />
```

### 2. Skeleton UI nên giống layout thật

```tsx
// BAD: Generic spinner
function Loading() {
  return <div className="spinner" />;
}

// GOOD: Skeleton giống cấu trúc thật
function ProductCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg">
      <div className="h-48 bg-gray-200 rounded mb-4 animate-pulse" />
      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2 animate-pulse" />
      <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}
```

### 3. Tránh Suspense waterfall

```tsx
// BAD: Nested await tạo waterfall
async function Page() {
  const user = await fetchUser();        // 1s
  const posts = await fetchPosts(user.id); // 1s (chờ user xong)
  const comments = await fetchComments(posts[0].id); // 1s (chờ posts xong)
  // Tổng: 3s tuần tự
}

// GOOD: Tách thành Suspense boundaries song song khi có thể
function Page() {
  return (
    <>
      <Suspense fallback={<UserSkeleton />}>
        <UserSection />
      </Suspense>
      <Suspense fallback={<PostsSkeleton />}>
        <PostsSection />
      </Suspense>
    </>
  );
}
```

## Lỗi thường gặp

### 1. Quên Suspense boundary cho async component

```tsx
// BAD: Async component không có Suspense
export default function Page() {
  return (
    <div>
      <AsyncComponent /> {/* Lỗi nếu không có Suspense */}
    </div>
  );
}

// GOOD: Wrap trong Suspense
export default function Page() {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <AsyncComponent />
      </Suspense>
    </div>
  );
}
```

### 2. Dùng Suspense cho Client Components không đúng cách

```tsx
// Suspense chỉ hoạt động với:
// 1. Server Components async
// 2. React.lazy()
// 3. Libraries hỗ trợ Suspense (SWR, React Query)

// WRONG: Suspense không "bắt" được useEffect
'use client';
function MyComponent() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);
  // Suspense sẽ KHÔNG hiển thị fallback cho useEffect
}
```

### 3. Suspense boundary quá rộng hoặc quá hẹp

```tsx
// Quá rộng: Mọi thứ loading cùng lúc → trải nghiệm tệ
<Suspense fallback={<FullPageLoader />}>
  <EntireApp />
</Suspense>

// Quá hẹp: Quá nhiều loading spinners → rối mắt
<div>
  <Suspense fallback={<Spinner />}><Title /></Suspense>
  <Suspense fallback={<Spinner />}><Subtitle /></Suspense>
  <Suspense fallback={<Spinner />}><Paragraph /></Suspense>
</div>

// Vừa phải: Group các phần liên quan
<Suspense fallback={<HeaderSkeleton />}>
  <Header /> {/* Title + Subtitle cùng nhóm */}
</Suspense>
<Suspense fallback={<ContentSkeleton />}>
  <Content /> {/* Main content */}
</Suspense>
```

## Tổng kết

| Khái niệm | Mô tả |
|-----------|-------|
| Streaming SSR | Gửi HTML từng phần, không chờ toàn bộ |
| Suspense | React component quản lý loading state |
| `loading.tsx` | Suspense boundary tự động cho route |
| Partial Rendering | Hiển thị phần sẵn sàng trước |
| Skeleton UI | Loading placeholder giống layout thật |
| Parallel fetching | Tách Suspense boundaries để fetch song song |

## Câu hỏi phỏng vấn

### Câu 1: Streaming SSR khác gì SSR truyền thống?

**Trả lời:**

SSR truyền thống phải hoàn thành toàn bộ data fetching và HTML rendering trước khi gửi response. Server gửi một response hoàn chỉnh.

Streaming SSR sử dụng HTTP streaming để gửi HTML từng phần ngay khi sẵn sàng. Phần nào render xong gửi trước, phần nào chưa xong gửi placeholder (Suspense fallback). Khi data sẵn sàng, server stream thêm HTML và đoạn script nhỏ để thay thế placeholder.

Lợi ích: TTFB nhanh hơn, FCP nhanh hơn, người dùng thấy nội dung sớm hơn.

### Câu 2: Suspense hoạt động như thế nào trong React?

**Trả lời:**

Suspense là một error boundary đặc biệt cho async operations. Khi component con "suspend" (throw một Promise), Suspense bắt lấy Promise đó, hiển thị fallback UI, và chờ Promise resolve. Khi resolve xong, React render lại component con với data thực.

Trong Next.js, Server Components async tự động tích hợp với Suspense. File `loading.tsx` tạo Suspense boundary tự động cho route segment.

### Câu 3: Khi nào nên dùng nhiều Suspense boundaries thay vì một cái bao quát?

**Trả lời:**

Dùng nhiều Suspense boundaries khi:
- Các phần UI tải data từ nguồn khác nhau với tốc độ khác nhau
- Muốn hiển thị progressive content (phần nhanh hiện trước)
- Các section độc lập, không phụ thuộc nhau

Dùng một Suspense boundary khi:
- Dữ liệu liên quan chặt chẽ, không có ý nghĩa hiển thị riêng lẻ
- Muốn tránh quá nhiều loading spinners gây rối mắt
- Phần UI nhỏ, không cần chia nhỏ

### Câu 4: Làm sao tránh Suspense waterfall?

**Trả lời:**

Suspense waterfall xảy ra khi các data fetches phụ thuộc tuần tự. Cách tránh:

1. **Tách thành Suspense boundaries song song**: Mỗi component fetch riêng trong Suspense boundary riêng
2. **Dùng `Promise.all`**: Khi cần nhiều data trong cùng component
3. **Preload pattern**: Khởi tạo fetch sớm trước khi component render
4. **Parallel Routes**: Dùng `@slot` trong App Router để tải song song

### Câu 5: `loading.tsx` khác gì với Suspense thủ công?

**Trả lời:**

`loading.tsx` là convention của Next.js, tự động tạo Suspense boundary bao quanh `page.tsx` (không bao layout). Đây là cách nhanh nhất để thêm loading state cho một route.

Suspense thủ công cho phép kiểm soát chi tiết hơn: đặt ở bất kỳ cấp độ nào, wrap bất kỳ component nào, và có thể lồng nhau. Dùng khi cần streaming granular hơn `loading.tsx`.
