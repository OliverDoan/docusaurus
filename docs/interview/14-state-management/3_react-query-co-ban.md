---
sidebar_position: 3
title: "3. React Query — Cơ bản"
---

# React Query — Cơ bản

> _Tổng hợp các câu hỏi phỏng vấn về TanStack Query (React Query) từ cơ bản đến trung cấp, tập trung vào cách quản lý server state hiệu quả trong ứng dụng React._

:::note[Ghi nhớ nhanh]

- ⭐ **Chuyên quản lý server state** — React Query lo việc fetch, cache, đồng bộ dữ liệu API; khác với client state (Redux/Zustand).
- ⭐ **`useQuery`** — tự động fetch khi mount, trả về `data`/`isLoading`/`isError`, cần `queryKey` làm định danh cache.
- **`staleTime` vs `gcTime`** — `staleTime` quyết định khi nào data bị coi là "cũ" cần refetch; `gcTime` (trước là `cacheTime`) quyết định khi nào xoá cache khỏi bộ nhớ.
- **Tự động refetch** — khi window focus lại, mạng reconnect, hoặc data đã stale.
- **Deduplicate & cache dùng chung** — nhiều component cùng `queryKey` chỉ gọi API một lần.

:::

---

## Câu 1: React Query (TanStack Query) là gì? Mục đích chính của nó là gì? `[Basic]`

### Câu hỏi

> React Query (TanStack Query) là gì? Tại sao nó ra đời và mục đích chính của thư viện này là gì?

### Giải thích lý thuyết

**TanStack Query** (tên cũ: React Query) là thư viện quản lý **server state** cho React. Nó được tạo ra để giải quyết các vấn đề phổ biến khi làm việc với dữ liệu từ API:

- Fetching, caching, synchronizing và updating dữ liệu từ server.
- Loại bỏ boilerplate code của việc quản lý loading/error state thủ công.
- Tự động refetch dữ liệu khi cần thiết (window focus, network reconnect...).
- Deduplicate các request trùng lặp.

**Vấn đề trước khi có React Query:**

Trước đây, lập trình viên phải tự quản lý toàn bộ vòng đời của một API call:

```tsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  fetch('/api/users')
    .then(res => res.json())
    .then(data => { setData(data); setLoading(false); })
    .catch(err => { setError(err); setLoading(false); });
}, []);
```

React Query thay thế toàn bộ pattern này bằng `useQuery`.

**Các tính năng nổi bật:**

| Tính năng | Mô tả |
|---|---|
| Caching tự động | Dữ liệu được cache theo `queryKey` |
| Background refetching | Tự động làm mới dữ liệu khi stale |
| Deduplication | Nhiều component dùng chung 1 request |
| Pagination / Infinite scroll | Hook chuyên biệt `useInfiniteQuery` |
| Optimistic updates | Cập nhật UI trước khi server phản hồi |

### Code minh hoạ

```tsx
// Trước React Query — boilerplate nhiều
function UserListOld() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(data => { setUsers(data); setLoading(false); })
      .catch(err => { setError(err); setLoading(false); });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// Với React Query — gọn hơn nhiều
import { useQuery } from '@tanstack/react-query';

function UserList() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

### Đáp án mẫu

> TanStack Query là thư viện quản lý **server state** cho React, giúp fetching, caching, đồng bộ hóa dữ liệu từ API một cách tự động. Mục đích chính là loại bỏ boilerplate code khi làm việc với async data, cung cấp caching thông minh và tự động refetch — những thứ mà các giải pháp global state (Redux, Zustand) không được thiết kế để xử lý.

---

## Câu 2: `useQuery` hook hoạt động như thế nào? Các tham số cơ bản (`queryKey`, `queryFn`) là gì? `[Basic]`

### Câu hỏi

> Giải thích cách `useQuery` hoạt động. `queryKey` và `queryFn` là gì và đóng vai trò gì?

### Giải thích lý thuyết

`useQuery` là hook cốt lõi của React Query dùng để **đọc (fetch) dữ liệu** từ server.

**`queryKey` — Khóa định danh:**

- Là một mảng dùng để **định danh duy nhất** cho một query.
- React Query dùng `queryKey` để:
  - Tra cứu cache (có dữ liệu cached chưa?).
  - Quyết định khi nào cần refetch.
  - Invalidate cache đúng query.
- Nên đặt `queryKey` chứa tất cả biến mà `queryFn` phụ thuộc vào.

**`queryFn` — Hàm fetch dữ liệu:**

- Là một hàm async trả về **Promise** chứa dữ liệu.
- Phải **throw error** nếu request thất bại (React Query dựa vào rejected Promise để phát hiện lỗi).
- Nhận `QueryFunctionContext` làm tham số (chứa `queryKey`, `signal`...).

**Vòng đời của một query:**

1. Component mount → `useQuery` chạy.
2. Kiểm tra cache theo `queryKey`.
3. Nếu không có cache hoặc data đã stale → gọi `queryFn`.
4. Trả về `{ data, isLoading, error, isFetching, ... }`.

### Code minh hoạ

```tsx
import { useQuery } from '@tanstack/react-query';

// queryFn — hàm fetch trả về Promise
const fetchUser = async (userId: number) => {
  const res = await fetch(`/api/users/${userId}`);
  if (!res.ok) {
    // PHẢI throw error để React Query bắt được
    throw new Error('Failed to fetch user');
  }
  return res.json();
};

function UserProfile({ userId }: { userId: number }) {
  const {
    data: user,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    // queryKey chứa userId vì queryFn phụ thuộc vào nó
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    // Tuỳ chọn thêm
    staleTime: 5 * 60 * 1000, // 5 phút
    retry: 3,
  });

  if (isLoading) return <p>Đang tải...</p>;
  if (isError) return <p>Lỗi: {error.message}</p>;

  return (
    <div>
      <h1>{user.name}</h1>
      {/* isFetching: true khi đang background refetch */}
      {isFetching && <span>Đang cập nhật...</span>}
    </div>
  );
}

// queryKey với object — cho query phức tạp
function UserList({ filters }: { filters: { role: string; page: number } }) {
  const { data } = useQuery({
    queryKey: ['users', filters], // React Query so sánh deep equality
    queryFn: () => fetch(`/api/users?role=${filters.role}&page=${filters.page}`).then(r => r.json()),
  });

  return <div>{/* render */}</div>;
}
```

### Đáp án mẫu

> `useQuery` nhận `queryKey` (mảng dùng làm cache key) và `queryFn` (hàm async trả về dữ liệu). `queryKey` phải chứa tất cả biến mà `queryFn` phụ thuộc vào, vì React Query dùng nó để quyết định khi nào refetch và để invalidate đúng cache. `queryFn` phải throw error khi thất bại để React Query xử lý retry và error state.

---

## Câu 3: `QueryClientProvider` là gì? Tại sao cần wrap app bằng nó? `[Basic]`

### Câu hỏi

> `QueryClientProvider` là gì? Tại sao cần wrap toàn bộ ứng dụng bằng nó?

### Giải thích lý thuyết

**`QueryClient`** là instance trung tâm của React Query, chứa:

- **Cache** — toàn bộ dữ liệu đã fetch được lưu ở đây.
- **Default options** — cấu hình mặc định cho tất cả queries/mutations.
- **Query management** — quản lý việc refetch, invalidation, cancellation.

**`QueryClientProvider`** là Context Provider truyền `QueryClient` xuống toàn bộ component tree thông qua React Context. Nếu không có nó:

- Các hook như `useQuery`, `useMutation` không biết dùng `QueryClient` nào.
- Các component không thể chia sẻ cache với nhau.

**Tại sao cần wrap ở root?**

- Đảm bảo tất cả components trong app có thể truy cập cùng một `QueryClient`.
- Cache được chia sẻ toàn cục — hai component cùng dùng `queryKey: ['users']` sẽ không fetch 2 lần.
- React Query DevTools cần truy cập `QueryClient` để hiển thị.

### Code minh hoạ

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Tạo QueryClient — thường ở ngoài component để tránh tạo lại mỗi render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,   // 1 phút — áp dụng cho tất cả queries
      retry: 1,               // Retry 1 lần khi thất bại
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Wrap root component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Tất cả components con đều có thể dùng useQuery, useMutation */}
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/users" element={<UserList />} />
        </Routes>
      </Router>

      {/* DevTools — chỉ hiển thị trong development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// Component con dùng useQuery bình thường
function UserList() {
  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  });
  return <div>{/* render */}</div>;
}

// Component khác cùng queryKey — KHÔNG fetch lại, dùng cache chung
function UserCount() {
  const { data } = useQuery({
    queryKey: ['users'], // Cùng key → dùng cache của UserList
    queryFn: () => fetch('/api/users').then(r => r.json()),
  });
  return <span>Total: {data?.length}</span>;
}
```

### Đáp án mẫu

> `QueryClientProvider` dùng React Context để truyền instance `QueryClient` — nơi chứa cache và cấu hình — xuống toàn bộ component tree. Cần wrap ở root để mọi component đều chia sẻ cùng một cache: hai component dùng cùng `queryKey` sẽ không tạo ra 2 network request riêng biệt mà dùng chung dữ liệu cached.

---

## Câu 4: Sự khác biệt giữa `isLoading` và `isFetching` trong `useQuery`? `[Intermediate]`

### Câu hỏi

> Phân biệt `isLoading` và `isFetching` trong `useQuery`. Khi nào dùng cái nào?

### Giải thích lý thuyết

Đây là một điểm dễ nhầm lẫn trong React Query:

| Trạng thái | Ý nghĩa | Khi nào `true` |
|---|---|---|
| `isLoading` | **Lần đầu** fetch, chưa có data trong cache | Query đang fetch VÀ chưa có cached data |
| `isFetching` | Đang fetch (bao gồm cả background refetch) | Bất cứ khi nào `queryFn` đang chạy |

**Chi tiết:**

- `isLoading = true` khi: `isFetching === true` VÀ `data === undefined` (chưa có cache).
- `isFetching = true` khi: query đang thực hiện network request, dù đã có cached data hay chưa.
- Khi refetch trong background (window focus, interval): `isFetching = true` nhưng `isLoading = false` (vì đã có data cũ trong cache).

**Khi nào dùng cái nào?**

- Dùng `isLoading` để hiển thị **skeleton/spinner lần đầu** (chưa có data gì).
- Dùng `isFetching` để hiển thị **indicator "đang cập nhật"** khi đã có data rồi nhưng đang làm mới.

**Trong v5, còn có `isPending`:**

- `isPending` thay thế `isLoading` cho các trường hợp query bị disabled hoặc chưa có data.

### Code minh hoạ

```tsx
import { useQuery } from '@tanstack/react-query';

function ProductList() {
  const {
    data: products,
    isLoading,   // true chỉ lần đầu, khi chưa có cache
    isFetching,  // true mỗi khi đang fetch (kể cả background)
    isError,
  } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(r => r.json()),
    staleTime: 30 * 1000, // 30 giây
  });

  // isLoading: hiện skeleton khi chưa có data gì
  if (isLoading) {
    return (
      <div>
        <ProductSkeleton />
        <ProductSkeleton />
        <ProductSkeleton />
      </div>
    );
  }

  if (isError) return <p>Không thể tải danh sách sản phẩm.</p>;

  return (
    <div>
      {/* isFetching: badge nhỏ "Đang cập nhật" khi có data rồi */}
      {isFetching && (
        <div className="refresh-badge">Đang cập nhật dữ liệu...</div>
      )}

      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}

// Bảng tóm tắt trạng thái theo tình huống:
// Tình huống                    | isLoading | isFetching | data
// ------------------------------|-----------|------------|--------
// Lần đầu fetch                 | true      | true       | undefined
// Đang background refetch       | false     | true       | data cũ
// Fetch xong, data fresh        | false     | false      | data mới
// Query bị disabled             | false     | false      | undefined
```

### Đáp án mẫu

> `isLoading` chỉ `true` khi đang fetch lần đầu và chưa có data trong cache — dùng để hiển thị skeleton/spinner. `isFetching` là `true` bất cứ khi nào `queryFn` đang chạy, kể cả background refetch khi đã có cached data — dùng để hiển thị indicator "đang cập nhật" nhỏ hơn để không làm gián đoạn UX.

---

## Câu 5: Tại sao React Query được coi là giải pháp "server state" không phải "global state"? `[Intermediate]`

### Câu hỏi

> Giải thích sự khác biệt giữa "server state" và "client state". Tại sao React Query phù hợp cho server state nhưng không phải là global state manager?

### Giải thích lý thuyết

**Client state vs Server state:**

| Đặc điểm | Client State | Server State |
|---|---|---|
| Nguồn gốc | Được tạo và sở hữu bởi frontend | Tồn tại trên server, frontend chỉ có bản copy |
| Đồng bộ | Luôn up-to-date | Có thể stale (cũ so với server) |
| Ví dụ | Modal open/closed, form input, theme, tab đang chọn | Danh sách users, sản phẩm, đơn hàng từ API |
| Công cụ phù hợp | useState, Zustand, Redux | React Query, SWR |

**Vì sao server state phức tạp hơn?**

Server state có các vấn đề đặc thù:
- **Caching:** Không nên fetch lại mỗi khi component mount.
- **Stale data:** Dữ liệu hiển thị có thể khác với dữ liệu thật trên server.
- **Deduplication:** Nhiều component cùng cần 1 resource.
- **Background update:** Cần làm mới khi user quay lại tab.
- **Pagination, infinite scroll:** Logic phức tạp.

**Redux/Zustand xử lý server state như thế nào?**

Với Redux, lập trình viên phải tự viết:
- Action creators cho fetch/success/error.
- Reducer để cập nhật state.
- Middleware (redux-thunk/saga) để handle async.
- Cache invalidation logic.
- Loading/error flags.

React Query đã giải quyết tất cả những vấn đề này sẵn.

**Kết hợp cả hai:**

Một ứng dụng thực tế thường dùng cả hai:
- **React Query** cho server state (dữ liệu từ API).
- **Zustand/useState** cho client state (UI state).

### Code minh hoạ

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { create } from 'zustand';

// CLIENT STATE — dùng Zustand (UI state, không liên quan server)
interface UIStore {
  selectedProductId: number | null;
  isFilterOpen: boolean;
  setSelectedProduct: (id: number | null) => void;
  toggleFilter: () => void;
}

const useUIStore = create<UIStore>(set => ({
  selectedProductId: null,
  isFilterOpen: false,
  setSelectedProduct: id => set({ selectedProductId: id }),
  toggleFilter: () => set(state => ({ isFilterOpen: !state.isFilterOpen })),
}));

// SERVER STATE — dùng React Query (dữ liệu từ API)
function ProductPage() {
  // Client state
  const { selectedProductId, setSelectedProduct, isFilterOpen, toggleFilter } = useUIStore();

  // Server state — React Query tự lo caching, refetch, stale check
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(r => r.json()),
    staleTime: 5 * 60 * 1000, // Cache 5 phút, không fetch lại khi navigate
  });

  const { data: selectedProduct } = useQuery({
    queryKey: ['product', selectedProductId],
    queryFn: () => fetch(`/api/products/${selectedProductId}`).then(r => r.json()),
    enabled: selectedProductId !== null, // Chỉ fetch khi đã chọn
  });

  return (
    <div>
      <button onClick={toggleFilter}>
        {isFilterOpen ? 'Đóng' : 'Mở'} bộ lọc {/* client state */}
      </button>
      {isLoading ? <p>Đang tải...</p> : (
        <ul>
          {products?.map(p => (
            <li key={p.id} onClick={() => setSelectedProduct(p.id)}>
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Đáp án mẫu

> Server state là dữ liệu tồn tại trên server mà frontend chỉ có bản copy — có thể stale bất cứ lúc nào. React Query được thiết kế đặc biệt cho server state vì nó tự động xử lý caching, stale detection, background refetch và deduplication. Trong khi đó, Redux/Zustand phù hợp hơn cho client state (UI state) — những thứ chỉ tồn tại trong trình duyệt như trạng thái modal, form, theme.

---

## Câu 6: Cách cấu hình React Query với `QueryClient` và `QueryClientProvider`? `[Basic]`

### Câu hỏi

> Làm thế nào để cấu hình React Query? Các option phổ biến của `QueryClient` là gì?

### Giải thích lý thuyết

`QueryClient` nhận object `defaultOptions` để đặt cấu hình mặc định cho toàn bộ app. Các options có thể được override ở từng `useQuery` cụ thể.

**Cấu trúc `defaultOptions`:**

```
QueryClient({
  defaultOptions: {
    queries: { ... },   // Áp dụng cho tất cả useQuery
    mutations: { ... }, // Áp dụng cho tất cả useMutation
  }
})
```

**Các option quan trọng cho `queries`:**

| Option | Mặc định | Mô tả |
|---|---|---|
| `staleTime` | `0` | Thời gian data được coi là fresh (ms) |
| `gcTime` | `5 * 60 * 1000` | Thời gian giữ cache sau khi không dùng (ms) |
| `retry` | `3` | Số lần retry khi thất bại |
| `refetchOnWindowFocus` | `true` | Refetch khi tab được focus lại |
| `refetchOnMount` | `true` | Refetch khi component mount nếu data stale |
| `refetchOnReconnect` | `true` | Refetch khi mạng kết nối lại |

### Code minh hoạ

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Cấu hình QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data được coi là fresh trong 2 phút
      // Trong 2 phút, component remount sẽ không refetch
      staleTime: 2 * 60 * 1000,

      // Cache tồn tại 10 phút sau khi không có observer nào
      gcTime: 10 * 60 * 1000,

      // Retry 2 lần khi thất bại (sau 1s, 2s)
      retry: 2,

      // Tắt refetch khi focus lại window (phù hợp cho data ít thay đổi)
      refetchOnWindowFocus: false,

      // Thời gian chờ giữa các lần retry (exponential backoff)
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Không retry mutation (tránh tạo duplicate data)
      retry: 0,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      {/* Chỉ hiển thị trong development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}

// Override config cho từng query cụ thể
function RealTimePrice({ productId }: { productId: number }) {
  const { data } = useQuery({
    queryKey: ['price', productId],
    queryFn: () => fetch(`/api/prices/${productId}`).then(r => r.json()),
    // Override default — giá thay đổi liên tục, staleTime ngắn hơn
    staleTime: 10 * 1000,        // 10 giây
    refetchInterval: 30 * 1000,  // Tự động refetch mỗi 30 giây
    refetchOnWindowFocus: true,  // Override default false
  });

  return <span>Giá: {data?.price.toLocaleString()}đ</span>;
}
```

### Đáp án mẫu

> `QueryClient` được khởi tạo với `defaultOptions` để đặt cấu hình mặc định như `staleTime` (thời gian data được coi là fresh), `retry`, `refetchOnWindowFocus`. Những config này có thể được override ở từng `useQuery` riêng. `QueryClientProvider` truyền instance này xuống toàn bộ component tree qua Context.

---

## Câu 7: `refetchOnWindowFocus` trong React Query là gì? Khi nào nên tắt nó? `[Intermediate]`

### Câu hỏi

> `refetchOnWindowFocus` là gì? Giải thích cơ chế hoạt động và khi nào nên tắt tính năng này.

### Giải thích lý thuyết

**`refetchOnWindowFocus`** là tính năng React Query tự động **refetch data khi user quay lại tab/cửa sổ trình duyệt**. Đây là behavior mặc định (`true`).

**Cơ chế hoạt động:**

1. React Query lắng nghe sự kiện `focus` trên `window` và `visibilitychange` trên `document`.
2. Khi user switch sang tab khác rồi quay lại → React Query kiểm tra xem data có stale không.
3. Nếu data đã stale → tự động gọi `queryFn` trong background.
4. UI vẫn hiển thị data cũ trong khi refetch, sau đó cập nhật khi có data mới.

**Tại sao tính năng này hữu ích?**

- User mở tab Facebook, đọc tin tức, rồi quay lại app → data đã cũ 30 phút.
- Với `refetchOnWindowFocus: true`, data tự động cập nhật khi user quay lại.

**Khi nào nên TẮT (`false`)?**

- Dữ liệu **ít thay đổi** (danh sách quốc gia, cấu hình hệ thống, danh mục sản phẩm).
- **Form đang có unsaved changes** — refetch có thể gây nhầm lẫn.
- **Dashboard analytics** — user đang phân tích, không muốn data thay đổi.
- **Testing** — tránh unexpected behavior trong test.
- Khi đã có **WebSocket** hoặc **polling** để update real-time.

### Code minh hoạ

```tsx
import { useQuery } from '@tanstack/react-query';

// Ví dụ 1: Tắt hoàn toàn ở QueryClient (global)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Ví dụ 2: Tắt cho từng query cụ thể
function CountrySelector() {
  const { data: countries } = useQuery({
    queryKey: ['countries'],
    queryFn: () => fetch('/api/countries').then(r => r.json()),
    // Danh sách quốc gia hầu như không thay đổi
    staleTime: Infinity,           // Không bao giờ stale
    refetchOnWindowFocus: false,   // Không cần refetch khi focus
    gcTime: 24 * 60 * 60 * 1000,  // Cache 24 giờ
  });

  return <select>{countries?.map(c => <option key={c.code}>{c.name}</option>)}</select>;
}

// Ví dụ 3: Bật cho query cần real-time
function NotificationBell() {
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetch('/api/notifications').then(r => r.json()),
    staleTime: 0,                  // Luôn stale
    refetchOnWindowFocus: true,    // Cập nhật ngay khi user quay lại
    refetchInterval: 60 * 1000,   // Còn polling mỗi 1 phút
  });

  return <span>{notifications?.unread} thông báo mới</span>;
}

// Ví dụ 4: Dùng callback function để kiểm soát động
function SmartDataFetcher({ isFormDirty }: { isFormDirty: boolean }) {
  const { data } = useQuery({
    queryKey: ['formData'],
    queryFn: () => fetch('/api/data').then(r => r.json()),
    // Tắt refetch khi form có thay đổi chưa lưu
    refetchOnWindowFocus: !isFormDirty,
  });

  return <div>{/* render */}</div>;
}
```

### Đáp án mẫu

> `refetchOnWindowFocus` tự động refetch data khi user quay lại tab, đảm bảo dữ liệu luôn mới. Nên tắt khi dữ liệu ít thay đổi (danh mục, cấu hình), khi user đang có unsaved form changes, hoặc khi đã có cơ chế update khác như WebSocket. Tắt ở global `QueryClient` cho app ổn định, hoặc override cho từng query cụ thể.

---

## Câu 8: Cách xử lý error trong React Query? `[Intermediate]`

### Câu hỏi

> React Query xử lý error như thế nào? Mô tả các cách để catch và hiển thị lỗi.

### Giải thích lý thuyết

React Query cung cấp nhiều lớp để xử lý error:

**1. Cấp độ query (`isError`, `error`):**

- Mỗi `useQuery` trả về `isError` và `error` object.
- Đây là cách phổ biến nhất.

**2. Error Boundary:**

- Dùng với option `throwOnError: true` để ném error lên React Error Boundary.
- Phù hợp để hiển thị fallback UI toàn màn hình.

**3. Global error handler (`onError` callback):**

- Cấu hình ở `QueryCache` để xử lý tất cả errors tập trung.
- Phù hợp để show toast notification, log lỗi.

**4. `retry` và `retryDelay`:**

- React Query tự động retry `3` lần mặc định trước khi báo lỗi.
- Tùy chỉnh logic retry với `retryDelay`.

**Lưu ý quan trọng:**

- `queryFn` phải **throw error** hoặc return **rejected Promise**.
- Nếu API trả về `{ error: 'Not found' }` với status 200, React Query sẽ coi là thành công.
- Phải tự check và throw trong `queryFn` nếu API có convention này.

### Code minh hoạ

```tsx
import { useQuery, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Cách 1: Global error handler — show toast cho tất cả errors
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Log tập trung
      console.error(`Query [${query.queryKey}] thất bại:`, error);

      // Chỉ show toast cho lỗi không mong đợi (đã có data cached)
      if (query.state.data !== undefined) {
        toast.error(`Cập nhật thất bại: ${error.message}`);
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Cách 2: Xử lý tại component
function UserProfile({ userId }: { userId: number }) {
  const {
    data: user,
    isError,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      // PHẢI check status và throw nếu cần
      if (!res.ok) {
        if (res.status === 404) throw new Error('Người dùng không tồn tại');
        if (res.status === 403) throw new Error('Không có quyền truy cập');
        throw new Error(`Lỗi server: ${res.status}`);
      }
      return res.json();
    },
    retry: (failureCount, error) => {
      // Không retry với lỗi 404, 403
      if (error.message.includes('không tồn tại')) return false;
      if (error.message.includes('quyền truy cập')) return false;
      return failureCount < 3;
    },
  });

  if (isLoading) return <p>Đang tải...</p>;

  if (isError) {
    return (
      <div className="error-container">
        <p>Lỗi: {error.message}</p>
        <button onClick={() => refetch()}>Thử lại</button>
      </div>
    );
  }

  return <div>{user.name}</div>;
}

// Cách 3: throwOnError + React Error Boundary
function UserCard({ userId }: { userId: number }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => {
      if (!r.ok) throw new Error('Fetch failed');
      return r.json();
    }),
    throwOnError: true, // Ném lên Error Boundary thay vì xử lý ở đây
  });

  return <div>{user?.name}</div>;
}

// Error Boundary bọc ngoài
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <ErrorBoundary fallback={<div>Có lỗi xảy ra. Vui lòng tải lại trang.</div>}>
      <UserCard userId={1} />
    </ErrorBoundary>
  );
}
```

### Đáp án mẫu

> React Query xử lý error qua ba lớp: (1) `isError`/`error` tại từng component để hiển thị lỗi cục bộ, (2) global `QueryCache.onError` để log và show toast tập trung, (3) `throwOnError: true` để delegate lên React Error Boundary. `queryFn` phải throw error rõ ràng; React Query tự động retry (mặc định 3 lần) trước khi chuyển sang trạng thái error.

---

## Câu 9: `QueryKey` trong React Query nên được thiết kế như thế nào? `[Intermediate]`

### Câu hỏi

> Làm thế nào để thiết kế `queryKey` tốt? Các best practices và anti-patterns là gì?

### Giải thích lý thuyết

`QueryKey` là nền tảng của hệ thống cache trong React Query. Thiết kế `queryKey` tốt giúp cache hoạt động chính xác và invalidation đúng chỗ.

**Cấu trúc `queryKey`:**

- Luôn là **mảng** (array) — `['users']`, `['users', 1]`, `['users', { role: 'admin' }]`.
- React Query so sánh key bằng **deep equality** (so sánh từng phần tử).
- Thứ tự phần tử trong mảng có nghĩa.

**Nguyên tắc thiết kế:**

1. **Từ chung đến cụ thể:** `['users']` → `['users', 1]` → `['users', 1, 'posts']`.
2. **Chứa tất cả biến phụ thuộc:** Nếu `queryFn` dùng `userId`, `queryKey` phải có `userId`.
3. **Nhất quán trong codebase:** Dùng query key factories để tránh typo.
4. **Có thể invalidate theo prefix:** `queryClient.invalidateQueries({ queryKey: ['users'] })` sẽ invalidate `['users']`, `['users', 1]`, `['users', { role: 'admin' }]`.

**Anti-patterns:**

- Dùng string thay vì array: `queryKey: 'users'` — hoạt động nhưng mất khả năng invalidate theo prefix.
- Bỏ sót biến phụ thuộc trong key: data sẽ hiển thị sai.
- Dùng `new Date()` hoặc `Math.random()` trong key: tạo key mới mỗi render, vô hiệu hóa cache.

### Code minh hoạ

```tsx
// PATTERN: Query Key Factory — tập trung quản lý keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: { role?: string; page?: number }) =>
    [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  posts: (userId: number) => [...userKeys.detail(userId), 'posts'] as const,
};

// Sử dụng
function UserList({ role, page }: { role: string; page: number }) {
  const { data } = useQuery({
    queryKey: userKeys.list({ role, page }), // ['users', 'list', { role, page }]
    queryFn: () => fetch(`/api/users?role=${role}&page=${page}`).then(r => r.json()),
  });
  return <div>{/* render */}</div>;
}

function UserDetail({ userId }: { userId: number }) {
  const { data } = useQuery({
    queryKey: userKeys.detail(userId), // ['users', 'detail', 1]
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
  });
  return <div>{/* render */}</div>;
}

// Invalidation theo prefix — xóa toàn bộ cache liên quan đến users
const queryClient = useQueryClient();

// Invalidate tất cả queries có prefix ['users']
queryClient.invalidateQueries({ queryKey: userKeys.all });

// Chỉ invalidate detail của user 1
queryClient.invalidateQueries({ queryKey: userKeys.detail(1) });

// ANTI-PATTERNS cần tránh
function BadComponent({ userId }: { userId: number }) {
  const { data } = useQuery({
    // WRONG: Bỏ sót biến phụ thuộc — khi userId thay đổi, data không refetch
    queryKey: ['user'],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
  });

  const { data: data2 } = useQuery({
    // WRONG: Dùng Date.now() — key thay đổi mỗi render, cache vô nghĩa
    queryKey: ['user', Date.now()],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  });

  return <div>{/* render */}</div>;
}
```

### Đáp án mẫu

> `queryKey` nên được thiết kế từ chung đến cụ thể, chứa tất cả biến mà `queryFn` phụ thuộc vào. Best practice là dùng **query key factory** — object tập trung định nghĩa tất cả keys — để tránh typo và dễ invalidate theo prefix. Không bao giờ dùng giá trị dynamic như `Date.now()` trong key vì sẽ vô hiệu hóa cache.

---

## Câu 10: `staleTime` và `gcTime` (trước là `cacheTime`) là gì? Sự khác biệt? `[Intermediate]`

### Câu hỏi

> Giải thích `staleTime` và `gcTime` trong React Query. Sự khác biệt giữa hai khái niệm này là gì?

### Giải thích lý thuyết

Đây là hai khái niệm quan trọng nhất để hiểu cơ chế cache của React Query:

**`staleTime` — Thời gian "tươi":**

- Khoảng thời gian data được coi là **fresh (tươi)** sau khi fetch.
- Trong thời gian `staleTime`, React Query **KHÔNG** refetch data dù có trigger (window focus, component remount...).
- Sau `staleTime`, data trở thành **stale** — React Query sẽ refetch khi có cơ hội.
- Mặc định: `0` (data stale ngay lập tức sau khi fetch).

**`gcTime` (Garbage Collection Time) — Thời gian giữ cache:**

- Khoảng thời gian React Query giữ cache trong bộ nhớ **sau khi không có component nào subscribe**.
- Khi component unmount và không có component nào khác dùng query đó → timer bắt đầu.
- Sau `gcTime`, cache bị xóa khỏi bộ nhớ.
- Mặc định: `5 * 60 * 1000` (5 phút).
- Tên cũ trong v4: `cacheTime`.

**Sơ đồ vòng đời:**

```
fetch() → data fresh (staleTime) → data stale → component unmount → gcTime → cache xóa
```

**Kết hợp hai giá trị:**

| `staleTime` | `gcTime` | Hành vi |
|---|---|---|
| `0` (default) | `5 phút` | Refetch mỗi khi có trigger, cache giữ 5 phút |
| `5 phút` | `5 phút` | Không refetch trong 5 phút, cache giữ 5 phút |
| `Infinity` | `Infinity` | Không bao giờ stale, cache không bao giờ xóa |
| `0` | `0` | Refetch liên tục, cache xóa ngay khi unmount |

**Lưu ý quan trọng:**

- `gcTime` phải lớn hơn hoặc bằng `staleTime` để có ý nghĩa.
- Data stale vẫn **hiển thị được** trong UI cho đến khi bị garbage collected.
- Khi component remount sau khi data stale nhưng cache chưa bị xóa: hiển thị data cũ ngay lập tức + refetch background.

### Code minh hoạ

```tsx
import { useQuery } from '@tanstack/react-query';

// Ví dụ 1: Dữ liệu thay đổi liên tục — staleTime ngắn
function LiveOrderStatus({ orderId }: { orderId: string }) {
  const { data } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetch(`/api/orders/${orderId}`).then(r => r.json()),
    staleTime: 0,              // Stale ngay — luôn refetch khi có trigger
    gcTime: 30 * 1000,         // Cache chỉ 30 giây sau unmount
    refetchInterval: 10 * 1000, // Poll mỗi 10 giây
  });

  return <p>Trạng thái: {data?.status}</p>;
}

// Ví dụ 2: Dữ liệu ít thay đổi — staleTime dài
function CategoryList() {
  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then(r => r.json()),
    staleTime: 30 * 60 * 1000,  // Fresh trong 30 phút
    gcTime: 60 * 60 * 1000,    // Cache 1 giờ sau unmount
  });

  return <ul>{data?.map(c => <li key={c.id}>{c.name}</li>)}</ul>;
}

// Ví dụ 3: Dữ liệu tĩnh — không bao giờ stale
function CountryList() {
  const { data } = useQuery({
    queryKey: ['countries'],
    queryFn: () => fetch('/api/countries').then(r => r.json()),
    staleTime: Infinity,  // Không bao giờ stale trong session
    gcTime: Infinity,     // Không bao giờ xóa cache
  });

  return <select>{data?.map(c => <option key={c.code}>{c.name}</option>)}</select>;
}

// Minh hoạ timeline:
//
// t=0:   Component mount → fetch() → data fresh
// t=0-5m: staleTime=5m → data FRESH (không refetch dù window focus)
// t=5m:  data STALE → refetch khi window focus hoặc component remount
// t=5m:  Component unmount → gcTime timer bắt đầu (5 phút)
// t=10m: gcTime hết → cache bị XÓA khỏi bộ nhớ
// t=10m: Component remount → fetch lại từ đầu (không có cache)
```

### Đáp án mẫu

> `staleTime` xác định bao lâu data được coi là "tươi" — trong thời gian đó React Query không refetch. `gcTime` xác định bao lâu data được giữ trong bộ nhớ sau khi không có component nào sử dụng nó. Sự khác biệt: `staleTime` kiểm soát **khi nào refetch**, còn `gcTime` kiểm soát **khi nào xóa cache**. Data stale vẫn có thể hiển thị được (sẽ hiển thị ngay + refetch background), còn data bị garbage collected thì phải fetch lại từ đầu.

---
