---
sidebar_position: 6
title: "6. React Query — Nâng cao"
---

# React Query — Nâng cao

> _Các câu hỏi nâng cao về React Query v5: prefetching, infinite queries, dependent queries, hydration với Next.js, Suspense, persistence và so sánh với SWR._

---

## Câu 1: Prefetching trong React Query hoạt động như thế nào? `[Intermediate]`

### Câu hỏi

> Prefetching là gì? Làm thế nào để tải trước dữ liệu trước khi người dùng thực sự cần đến nó trong React Query?

### Giải thích lý thuyết

**Prefetching** là kỹ thuật tải trước dữ liệu vào cache trước khi component cần render. Khi component thực sự mount và gọi `useQuery`, dữ liệu đã có sẵn trong cache → không có loading state, UX mượt mà hơn.

React Query cung cấp hai cách prefetch chính:

| Phương thức | Khi nào dùng |
|---|---|
| `queryClient.prefetchQuery()` | Prefetch phía client (hover, navigation) |
| `dehydrate` + `HydrationBoundary` | Prefetch phía server (Next.js SSR/RSC) |

**Luồng hoạt động:**
1. Gọi `prefetchQuery` với cùng `queryKey` và `queryFn` như `useQuery` sẽ dùng.
2. Dữ liệu được ghi vào `QueryCache`.
3. Khi `useQuery` chạy, nó tìm thấy cache hit → trả về data ngay lập tức, không fetch lại (nếu còn trong `staleTime`).

### Code minh hoạ

```tsx
import {
  useQueryClient,
  useQuery,
  QueryClient,
} from '@tanstack/react-query';

const fetchProduct = async (id: number) => {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('Fetch failed');
  return res.json();
};

// ── Client-side prefetch khi hover vào link ──
function ProductLink({ id }: { id: number }) {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    // Tải trước dữ liệu, không re-render component này
    queryClient.prefetchQuery({
      queryKey: ['product', id],
      queryFn: () => fetchProduct(id),
      staleTime: 60_000, // Không prefetch lại nếu cache còn mới dưới 1 phút
    });
  };

  return (
    <a href={`/products/${id}`} onMouseEnter={handleMouseEnter}>
      Xem sản phẩm {id}
    </a>
  );
}

// ── Khi navigate đến trang, data đã có sẵn ──
function ProductPage({ id }: { id: number }) {
  const { data } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
    staleTime: 60_000,
  });

  // data không undefined ngay từ đầu nếu prefetch thành công
  return <div>{data?.name}</div>;
}

// ── Server-side prefetch (Next.js App Router) ──
// app/products/[id]/page.tsx
async function ProductPageServer({ params }: { params: { id: string } }) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['product', Number(params.id)],
    queryFn: () => fetchProduct(Number(params.id)),
  });

  const { dehydrate, HydrationBoundary } = await import('@tanstack/react-query');

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductPage id={Number(params.id)} />
    </HydrationBoundary>
  );
}
```

### Đáp án mẫu

> Prefetching ghi dữ liệu vào `QueryCache` trước khi component cần. Phía client dùng `queryClient.prefetchQuery()` (ví dụ khi hover), phía server dùng kết hợp `prefetchQuery` + `dehydrate` + `HydrationBoundary`. Khi `useQuery` chạy với cùng key và data còn trong `staleTime`, nó đọc thẳng từ cache mà không fetch lại.

---

## Câu 2: Infinite queries (`useInfiniteQuery`) là gì? Dùng cho pagination như thế nào? `[Advanced]`

### Câu hỏi

> Giải thích `useInfiniteQuery` trong React Query v5. Cách triển khai "load more" (cursor-based pagination) và "load previous" như thế nào?

### Giải thích lý thuyết

`useInfiniteQuery` được thiết kế cho **scroll vô tận / load more**, nơi mỗi lần fetch trả về một "trang" dữ liệu và bạn muốn tích lũy tất cả các trang.

**Khác biệt so với `useQuery`:**

| | `useQuery` | `useInfiniteQuery` |
|---|---|---|
| `data` | object đơn | `{ pages: T[], pageParams: unknown[] }` |
| Pagination | Thay thế data | Tích lũy pages |
| Trigger fetch tiếp | Thay `queryKey` | `fetchNextPage()` / `fetchPreviousPage()` |

**Các config quan trọng trong v5:**
- `initialPageParam` — giá trị `pageParam` cho lần fetch đầu tiên (bắt buộc).
- `getNextPageParam(lastPage, allPages, lastPageParam)` — trả về `pageParam` cho trang tiếp theo; trả về `undefined` nếu không còn trang.
- `getPreviousPageParam` — tương tự cho hướng ngược.

### Code minh hoạ

```tsx
import {
  useInfiniteQuery,
  InfiniteData,
} from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

interface Post {
  id: number;
  title: string;
  cursor: string; // cursor của item cuối trong trang này
}

interface PostsPage {
  posts: Post[];
  nextCursor: string | null;
}

const fetchPosts = async ({
  pageParam,
}: {
  pageParam: string | null;
}): Promise<PostsPage> => {
  const url = pageParam
    ? `/api/posts?cursor=${pageParam}`
    : '/api/posts';
  const res = await fetch(url);
  return res.json();
};

function PostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<
    PostsPage,
    Error,
    InfiniteData<PostsPage>,
    string[],
    string | null
  >({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    initialPageParam: null,                          // v5: bắt buộc
    getNextPageParam: (lastPage) => lastPage.nextCursor, // null → không còn trang
  });

  // Auto fetch khi cuộn đến cuối
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending') return <p>Đang tải...</p>;
  if (status === 'error') return <p>Lỗi tải dữ liệu</p>;

  return (
    <div>
      {data.pages.map((page, i) => (
        <div key={i}>
          {page.posts.map((post) => (
            <div key={post.id}>{post.title}</div>
          ))}
        </div>
      ))}

      {/* Sentinel element — khi vào viewport thì load thêm */}
      <div ref={ref} style={{ height: 1 }} />

      {isFetchingNextPage && <p>Đang tải thêm...</p>}
      {!hasNextPage && <p>Đã hết bài viết</p>}
    </div>
  );
}
```

### Đáp án mẫu

> `useInfiniteQuery` tích lũy nhiều trang vào `data.pages`. Cần khai báo `initialPageParam` và `getNextPageParam` (trả về `undefined` khi hết trang). Gọi `fetchNextPage()` để tải trang tiếp theo — thường kết hợp với `IntersectionObserver` để tự động load khi cuộn xuống cuối.

---

## Câu 3: Dependent queries (query phụ thuộc) trong React Query là gì? `[Intermediate]`

### Câu hỏi

> Dependent queries là gì? Làm thế nào để đảm bảo query B chỉ chạy sau khi query A hoàn thành và có dữ liệu?

### Giải thích lý thuyết

**Dependent query** là pattern khi query B cần kết quả của query A làm đầu vào. Ví dụ: cần lấy `userId` từ profile trước, rồi mới fetch danh sách orders của user đó.

React Query kiểm soát điều này qua option **`enabled`** — khi `enabled: false`, query không chạy. Khi `enabled` chuyển sang `true` (do dependency có dữ liệu), query tự động kích hoạt.

**Lưu ý quan trọng:**
- `enabled` nhận `boolean`. Dùng `!!value` để convert giá trị có thể `undefined`.
- Nếu query A `error`, query B sẽ không bao giờ chạy → cần xử lý trường hợp này.
- Có thể chain nhiều cấp phụ thuộc.

### Code minh hoạ

```tsx
import { useQuery } from '@tanstack/react-query';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Order {
  id: number;
  userId: number;
  total: number;
}

function UserOrders() {
  // ── Query A: lấy thông tin user hiện tại ──
  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isErrorUser,
  } = useQuery<User>({
    queryKey: ['current-user'],
    queryFn: async () => {
      const res = await fetch('/api/me');
      return res.json();
    },
  });

  // ── Query B: chỉ chạy khi user.id có giá trị ──
  const {
    data: orders,
    isLoading: isLoadingOrders,
  } = useQuery<Order[]>({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/orders?userId=${user!.id}`);
      return res.json();
    },
    enabled: !!user?.id, // Query B bị "pause" cho đến khi user.id tồn tại
  });

  // ── Query C: phụ thuộc vào cả user và orders ──
  const firstOrderId = orders?.[0]?.id;
  const { data: orderDetail } = useQuery({
    queryKey: ['order-detail', firstOrderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${firstOrderId}`);
      return res.json();
    },
    enabled: !!firstOrderId, // Chỉ chạy khi đã có orders
  });

  if (isLoadingUser) return <p>Đang tải user...</p>;
  if (isErrorUser) return <p>Không thể tải thông tin user</p>;
  if (isLoadingOrders) return <p>Đang tải đơn hàng...</p>;

  return (
    <div>
      <h2>Đơn hàng của {user?.name}</h2>
      {orders?.map((order) => (
        <div key={order.id}>Đơn #{order.id} — {order.total.toLocaleString()}đ</div>
      ))}
    </div>
  );
}
```

### Đáp án mẫu

> Dùng option `enabled` để kiểm soát khi nào query được phép chạy. Đặt `enabled: !!dependencyValue` — khi `dependencyValue` là `undefined` (query A chưa xong), query B bị treo. Khi query A hoàn thành và trả về data, `enabled` thành `true` và query B tự động kích hoạt.

---

## Câu 4: Cách kết hợp React Query với Next.js Server Components (hydration)? `[Advanced]`

### Câu hỏi

> Giải thích pattern dehydrate/hydrate trong React Query khi dùng với Next.js App Router và React Server Components.

### Giải thích lý thuyết

Với Next.js App Router, Server Components chạy trên server (không có browser state). React Query cung cấp pattern **dehydrate/hydrate** để:

1. **Server**: fetch data, serialize cache thành JSON (dehydrate).
2. **Client**: nhận JSON, khôi phục cache (hydrate) → `useQuery` đọc từ cache, không cần fetch lại.

**Các thành phần chính:**

| Thành phần | Vai trò |
|---|---|
| `QueryClient` (server) | Instance riêng cho mỗi request, tránh leak data giữa users |
| `dehydrate(queryClient)` | Serialize cache thành plain object |
| `HydrationBoundary` | Component client nhận `state` prop, restore cache |
| `makeQueryClient()` | Factory tạo QueryClient với config chuẩn |

**Lưu ý quan trọng:**
- Mỗi server request phải tạo **QueryClient mới** — không share instance.
- `staleTime` nên đặt `>0` trên server để tránh refetch ngay lập tức sau hydrate.

### Code minh hoạu

```tsx
// ── lib/query-client.ts ──
import { QueryClient } from '@tanstack/react-query';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data từ server không stale ngay sau hydrate
        staleTime: 60 * 1000,
      },
    },
  });
}

// ── app/providers.tsx (Client Component) ──
'use client';

import { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { makeQueryClient } from '@/lib/query-client';

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: luôn tạo mới
    return makeQueryClient();
  }
  // Browser: reuse instance (tránh mất cache khi re-render)
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// ── app/posts/page.tsx (Server Component) ──
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { makeQueryClient } from '@/lib/query-client';
import { PostList } from './PostList';

async function fetchPosts() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts');
  return res.json();
}

export default async function PostsPage() {
  const queryClient = makeQueryClient(); // Instance mới cho mỗi request

  // Prefetch trên server
  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });

  return (
    // Truyền state đã dehydrate xuống client
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostList />
    </HydrationBoundary>
  );
}

// ── app/posts/PostList.tsx (Client Component) ──
'use client';

import { useQuery } from '@tanstack/react-query';

export function PostList() {
  const { data } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts');
      return res.json();
    },
    // Data đã có từ server → không hiện loading state
  });

  return (
    <ul>
      {data?.map((post: { id: number; title: string }) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### Đáp án mẫu

> Trên Server Component, tạo `QueryClient` mới cho mỗi request, gọi `prefetchQuery`, rồi bọc children trong `HydrationBoundary state={dehydrate(queryClient)}`. Phía client, `useQuery` với cùng key tìm thấy data đã hydrate trong cache → render ngay không có loading. Bắt buộc tạo QueryClient mới mỗi request để tránh data leak giữa các user.

---

## Câu 5: `useSuspenseQuery` khác gì `useQuery`? Khi nào dùng? `[Advanced]`

### Câu hỏi

> `useSuspenseQuery` trong React Query v5 hoạt động như thế nào? Nó khác `useQuery` ở điểm gì và khi nào nên dùng?

### Giải thích lý thuyết

**`useSuspenseQuery`** tích hợp với React Suspense — thay vì trả về `{ isLoading, isError, data }`, nó:
- **Throw promise** khi data đang fetch → React Suspense bắt và render fallback.
- **Throw error** khi fetch thất bại → React Error Boundary bắt.
- **Luôn trả về `data` đã có** (không bao giờ `undefined`) sau khi resolve.

**So sánh chi tiết:**

| Đặc điểm | `useQuery` | `useSuspenseQuery` |
|---|---|---|
| Loading state | `isLoading: true`, `data: undefined` | Suspend component, render Suspense fallback |
| Error state | `isError: true`, `error` object | Throw error đến Error Boundary |
| `data` type | `T \| undefined` | `T` (guaranteed) |
| TypeScript | Phải kiểm tra `data` trước khi dùng | Dùng `data` trực tiếp |
| Cần Error Boundary | Không bắt buộc | Bắt buộc |
| `enabled: false` | Hỗ trợ | Không hỗ trợ |

**Khi nên dùng `useSuspenseQuery`:**
- Muốn viết component không có branch loading/error.
- Dùng chung với `React.Suspense` và Error Boundary đã có sẵn.
- Server Components + streaming với Next.js.
- Muốn TypeScript đảm bảo `data` không `undefined`.

### Code minh hoạ

```tsx
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
}

// ── Component dùng useSuspenseQuery ──
// Không cần kiểm tra isLoading hay isError trong component
function ProductDetail({ id }: { id: number }) {
  const { data: product } = useSuspenseQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error('Không tìm thấy sản phẩm');
      return res.json();
    },
  });

  // data luôn là Product (không phải Product | undefined)
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.price.toLocaleString()}đ</p>
    </div>
  );
}

// ── Error Boundary đơn giản ──
import { Component, ReactNode } from 'react';

class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ── Sử dụng: bắt buộc có Suspense + ErrorBoundary ──
function ProductPage({ id }: { id: number }) {
  return (
    <ErrorBoundary fallback={<p>Lỗi tải sản phẩm</p>}>
      <Suspense fallback={<p>Đang tải...</p>}>
        <ProductDetail id={id} />
      </Suspense>
    </ErrorBoundary>
  );
}

// ── So sánh với useQuery (cần nhiều branch hơn) ──
function ProductDetailClassic({ id }: { id: number }) {
  const { data: product, isLoading, isError } = useSuspenseQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      return res.json();
    },
  });

  // Phải xử lý từng trạng thái
  if (isLoading) return <p>Đang tải...</p>;
  if (isError) return <p>Lỗi</p>;
  if (!product) return null;

  return <div>{product.name}</div>;
}
```

### Đáp án mẫu

> `useSuspenseQuery` throw promise khi loading (để Suspense hiển thị fallback) và throw error khi thất bại (để Error Boundary xử lý). Đổi lại, `data` luôn có type `T` — không bao giờ `undefined`, giúp code sạch hơn, TypeScript an toàn hơn. Dùng khi đã có Suspense và Error Boundary trong cây component. Không hỗ trợ `enabled: false`.

---

## Câu 6: `persistQueryClient` trong React Query dùng để làm gì? `[Advanced]`

### Câu hỏi

> Giải thích mục đích và cách sử dụng `persistQueryClient` trong React Query v5. Khi nào nên dùng feature này?

### Giải thích lý thuyết

**`persistQueryClient`** cho phép lưu trữ `QueryCache` vào bộ nhớ persistent (localStorage, IndexedDB, AsyncStorage...) và khôi phục lại khi app khởi động. Điều này giúp:

- **Offline support**: App vẫn hiển thị data kũ khi mất mạng.
- **Instant load**: Lần mở app tiếp theo hiển thị ngay data từ cache, không cần chờ fetch.
- **Giảm số lần gọi API**: Dữ liệu ít thay đổi không cần fetch lại mỗi session.

**Các thành phần:**

| Thành phần | Vai trò |
|---|---|
| `persistQueryClient` | Kết nối QueryClient với persister |
| `createSyncStoragePersister` | Persister dùng `localStorage` / `sessionStorage` |
| `createAsyncStoragePersister` | Persister dùng storage bất đồng bộ (IndexedDB, AsyncStorage) |
| `maxAge` | Thời gian tối đa cache tồn tại (ms), mặc định 24 giờ |
| `buster` | String để vô hiệu hóa cache cũ khi deploy version mới |

**Lưu ý quan trọng:**
- `localStorage` có giới hạn ~5MB — cần cẩn thận với data lớn.
- Dùng `buster` để xóa cache cũ khi cấu trúc data thay đổi sau deploy.
- Sensitive data không nên persist (token, thông tin cá nhân nhạy cảm).

### Code minh hoạ

```tsx
// ── main.tsx ──
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache sẽ được coi là valid trong 5 phút
      staleTime: 5 * 60 * 1000,
      // Giữ cache trong 24 giờ (phải khớp hoặc nhỏ hơn maxAge của persister)
      gcTime: 24 * 60 * 60 * 1000,
    },
  },
});

// Persister dùng localStorage
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'MY_APP_QUERY_CACHE', // Key trong localStorage
  // Giới hạn kích thước để tránh tràn localStorage
  throttleTime: 1000, // Debounce ghi 1 giây
});

// Kết nối QueryClient với persister
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 24 * 60 * 60 * 1000, // Cache tồn tại tối đa 24 giờ
  buster: process.env.REACT_APP_VERSION ?? '', // Xóa cache khi deploy version mới
  // Chỉ persist các query được đánh dấu, không persist tất cả
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      query.state.status === 'success' &&
      // Không persist data nhạy cảm
      !query.queryKey.includes('user-private'),
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

// ── Dùng bình thường trong component ──
// Lần đầu: fetch từ API
// Lần sau (reload trang): đọc từ localStorage trước, sau đó background refetch
function ProductList() {
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      return res.json();
    },
  });

  // isLoading = false nếu data được restore từ localStorage
  if (isLoading) return <p>Lần đầu tải...</p>;

  return (
    <ul>
      {data?.map((p: { id: number; name: string }) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

### Đáp án mẫu

> `persistQueryClient` serialize `QueryCache` vào storage (localStorage, IndexedDB...) và khôi phục khi app khởi động lại. Lợi ích: instant load lần mở tiếp theo và offline support. Cần cấu hình `maxAge` (cache hết hạn sau bao lâu) và `buster` (string thay đổi theo version để invalidate cache cũ). Không nên persist data nhạy cảm; dùng `shouldDehydrateQuery` để lọc.

---

## Câu 7: So sánh React Query với SWR? Khi nào chọn cái nào? `[Intermediate]`

### Câu hỏi

> React Query và SWR đều là thư viện data fetching phổ biến. Chúng khác nhau như thế nào? Khi nào nên chọn React Query và khi nào nên chọn SWR?

### Giải thích lý thuyết

Cả hai đều implement **stale-while-revalidate** pattern nhưng có triết lý và tính năng khác nhau.

**So sánh tổng quan:**

| Tiêu chí | React Query | SWR |
|---|---|---|
| Tác giả | TanStack (Tanner Linsley) | Vercel |
| Bundle size | ~13KB (minzipped) | ~4KB (minzipped) |
| Mutations | `useMutation` đầy đủ | Tự xử lý hoặc dùng `useSWRMutation` |
| Infinite scroll | `useInfiniteQuery` | `useSWRInfinite` |
| Devtools | React Query Devtools (GUI) | Không có chính thức |
| Caching | Nhiều tầng, queryKey-based | Key-based đơn giản hơn |
| Prefetching | Đầy đủ, cả SSR | Hỗ trợ cơ bản |
| Persistence | Plugin `persistQueryClient` | Không có sẵn |
| Suspense | `useSuspenseQuery` | `suspense: true` option |
| Optimistic updates | Hỗ trợ tốt | Hỗ trợ tốt |
| Next.js integration | Đầy đủ (dehydrate/hydrate) | Tối ưu cho Next.js (cùng tác giả) |
| Learning curve | Cao hơn | Thấp hơn |
| TypeScript | Xuất sắc | Tốt |

**Khi nào chọn React Query:**
- App phức tạp với nhiều mutations, cần `useMutation` + `onSuccess`/`onError`/`onSettled`.
- Cần Devtools để debug cache.
- Cần offline persistence.
- Cần pagination/infinite scroll phức tạp.
- Team cần kiểm soát chi tiết cache invalidation.

**Khi nào chọn SWR:**
- Next.js project đơn giản, chỉ cần fetching.
- Bundle size là ưu tiên hàng đầu.
- Team nhỏ, muốn API đơn giản, ít config.
- Chủ yếu là GET, mutation đơn giản.

### Code minh hoạ

```tsx
// ── Cùng một use case — Fetch + Mutate ──

// === React Query ===
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

function RQExample() {
  const queryClient = useQueryClient();

  const { data: todos } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/api/todos').then((r) => r.json()),
  });

  const { mutate: addTodo, isPending } = useMutation({
    mutationFn: (title: string) =>
      fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ title }),
      }).then((r) => r.json()),
    onSuccess: () => {
      // Invalidate cache sau khi thêm thành công
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error) => {
      console.error('Thêm thất bại:', error);
    },
  });

  return (
    <div>
      <ul>{todos?.map((t: { id: number; title: string }) => <li key={t.id}>{t.title}</li>)}</ul>
      <button
        onClick={() => addTodo('Việc mới')}
        disabled={isPending}
      >
        {isPending ? 'Đang thêm...' : 'Thêm việc'}
      </button>
    </div>
  );
}

// === SWR (cùng use case) ===
import useSWR, { useSWRConfig } from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function SWRExample() {
  const { mutate: globalMutate } = useSWRConfig();
  const { data: todos } = useSWR('/api/todos', fetcher);

  const addTodo = async (title: string) => {
    await fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    // Revalidate bằng cách gọi mutate với key
    globalMutate('/api/todos');
  };

  return (
    <div>
      <ul>{todos?.map((t: { id: number; title: string }) => <li key={t.id}>{t.title}</li>)}</ul>
      <button onClick={() => addTodo('Việc mới')}>Thêm việc</button>
    </div>
  );
}
// SWR không có built-in isPending cho mutation → phải tự quản lý state
```

### Đáp án mẫu

> React Query phù hợp cho app phức tạp: cần `useMutation` với nhiều callbacks, Devtools, persistence, infinite queries nâng cao. SWR phù hợp cho app đơn giản ưu tiên bundle nhỏ và API dễ dùng, đặc biệt trong Next.js. Với project mới có nhiều mutations và cần debug cache, chọn React Query. Với landing page hay app Next.js nhỏ chỉ cần fetch data, SWR là lựa chọn gọn nhẹ hơn.

---
