---
sidebar_position: 5
title: "5. React Query — Query control"
---

# React Query — Query control

> _Các câu hỏi phỏng vấn về kiểm soát truy vấn trong React Query v5: placeholder data, select, parallel queries, cancel, keepPreviousData, enabled và query filters._

---

## Câu 1: Placeholder data và initial data trong React Query khác gì nhau? `[Intermediate]`

### Câu hỏi

> Phân biệt `placeholderData` và `initialData` trong `useQuery`. Khi nào dùng cái nào?

### Giải thích lý thuyết

| Thuộc tính | Nguồn dữ liệu | Lưu vào cache | Trigger fetch | Trạng thái |
|---|---|---|---|---|
| `initialData` | Dữ liệu thật (đã fetch từ nơi khác) | Có | Không (nếu còn fresh) | `success` |
| `placeholderData` | Dữ liệu tạm / giả | Không | Có (luôn fetch) | `success` nhưng `isPlaceholderData: true` |

**`initialData`** — Dùng khi bạn đã có dữ liệu thật từ cache khác hoặc SSR. React Query coi đây là dữ liệu hợp lệ, sẽ không fetch lại cho đến khi `staleTime` hết hạn. Dữ liệu được ghi vào cache.

**`placeholderData`** — Dùng để hiển thị UI tạm trong lúc chờ fetch. Dữ liệu không được ghi vào cache. Sau khi fetch xong, placeholder bị thay thế hoàn toàn. Có thể kiểm tra bằng `isPlaceholderData`.

### Code minh hoạ

```tsx
import { useQuery } from '@tanstack/react-query'

// --- initialData: dữ liệu thật, không trigger fetch ngay ---
function ProfileWithInitial({ prefetchedUser }: { prefetchedUser: User }) {
  const { data } = useQuery({
    queryKey: ['user', prefetchedUser.id],
    queryFn: () => fetchUser(prefetchedUser.id),
    initialData: prefetchedUser,          // Ghi vào cache
    initialDataUpdatedAt: Date.now(),     // Đánh dấu thời điểm dữ liệu mới nhất
    staleTime: 60_000,                    // Không fetch lại trong 60s
  })

  return <div>{data?.name}</div>
}

// --- placeholderData: dữ liệu tạm, luôn fetch ---
const PLACEHOLDER_USER: User = { id: 0, name: 'Đang tải...', email: '' }

function ProfileWithPlaceholder({ userId }: { userId: number }) {
  const { data, isPlaceholderData } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    placeholderData: PLACEHOLDER_USER,   // Không ghi vào cache
  })

  return (
    <div style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
      {data?.name}
    </div>
  )
}
```

### Đáp án mẫu

> `initialData` phù hợp với SSR hoặc khi dữ liệu đã có sẵn trong bộ nhớ — nó được lưu vào cache và có thể tránh fetch không cần thiết. `placeholderData` chỉ là dữ liệu hiển thị tạm thời, không vào cache, luôn trigger fetch và có flag `isPlaceholderData` để phân biệt.

---

## Câu 2: `select` option trong `useQuery` dùng để làm gì? `[Intermediate]`

### Câu hỏi

> `select` trong `useQuery` hoạt động như thế nào? Nó giúp gì cho hiệu năng?

### Giải thích lý thuyết

`select` là một hàm transform được gọi sau khi dữ liệu fetch về. Nó nhận `data` thô từ `queryFn` và trả về dữ liệu đã biến đổi cho component.

**Lợi ích:**
- **Tách biệt logic transform** khỏi component — component chỉ nhận đúng shape cần thiết.
- **Memoization tự động** — React Query chỉ re-render component nếu kết quả của `select` thay đổi (so sánh shallow), ngay cả khi cache gốc thay đổi.
- **Nhiều component có thể dùng cùng query nhưng select khác nhau** — cache chỉ lưu 1 bản, mỗi component tự transform.

### Code minh hoạ

```tsx
import { useQuery } from '@tanstack/react-query'

interface ApiResponse {
  users: Array<{ id: number; name: string; role: string; active: boolean }>
  total: number
}

// Component chỉ cần danh sách tên admin đang active
function AdminList() {
  const { data: adminNames } = useQuery({
    queryKey: ['users'],
    queryFn: (): Promise<ApiResponse> => fetch('/api/users').then(r => r.json()),
    // select transform dữ liệu, chỉ re-render khi adminNames thay đổi
    select: (response) =>
      response.users
        .filter((u) => u.role === 'admin' && u.active)
        .map((u) => u.name),
  })

  return (
    <ul>
      {adminNames?.map((name) => <li key={name}>{name}</li>)}
    </ul>
  )
}

// Component khác dùng cùng query, select khác
function UserCount() {
  const { data: count } = useQuery({
    queryKey: ['users'],
    queryFn: (): Promise<ApiResponse> => fetch('/api/users').then(r => r.json()),
    select: (response) => response.total, // Chỉ lấy total
  })

  return <span>Tổng: {count} người dùng</span>
}
```

### Đáp án mẫu

> `select` transform dữ liệu sau khi fetch, giúp component chỉ nhận đúng dữ liệu cần thiết. React Query tự động memoize kết quả của `select`, nên component chỉ re-render khi giá trị transform thực sự thay đổi — cải thiện hiệu năng đáng kể khi nhiều component dùng chung một query.

---

## Câu 3: Parallel queries và `useQueries` trong React Query là gì? `[Intermediate]`

### Câu hỏi

> Khi cần fetch nhiều query cùng lúc, dùng parallel queries hay `useQueries`? Khác nhau thế nào?

### Giải thích lý thuyết

**Parallel queries (tĩnh)** — Gọi nhiều `useQuery` trong cùng một component. Các query chạy song song tự nhiên vì mỗi hook là độc lập. Phù hợp khi số lượng query cố định tại compile-time.

**`useQueries` (động)** — Dùng khi số lượng query thay đổi theo runtime (ví dụ: fetch nhiều item theo danh sách id). Nhận một mảng query options, trả về mảng kết quả tương ứng.

| | Parallel queries | `useQueries` |
|---|---|---|
| Số query | Cố định | Động (runtime) |
| Cú pháp | Nhiều `useQuery` | 1 `useQueries` với mảng |
| Combine kết quả | Thủ công | Có option `combine` |

### Code minh hoạ

```tsx
import { useQuery, useQueries } from '@tanstack/react-query'

// --- Parallel queries tĩnh ---
function Dashboard() {
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers(),
  })

  const statsQuery = useQuery({
    queryKey: ['stats'],
    queryFn: () => fetchStats(),
  })

  if (usersQuery.isLoading || statsQuery.isLoading) return <div>Đang tải...</div>

  return (
    <div>
      <UserList users={usersQuery.data} />
      <Stats stats={statsQuery.data} />
    </div>
  )
}

// --- useQueries động ---
function PostList({ postIds }: { postIds: number[] }) {
  const postQueries = useQueries({
    queries: postIds.map((id) => ({
      queryKey: ['post', id],
      queryFn: () => fetchPost(id),
      staleTime: 30_000,
    })),
    // combine: gộp tất cả kết quả thành 1 object (React Query v5)
    combine: (results) => ({
      posts: results.map((r) => r.data).filter(Boolean),
      isLoading: results.some((r) => r.isLoading),
      isError: results.some((r) => r.isError),
    }),
  })

  if (postQueries.isLoading) return <div>Đang tải bài viết...</div>

  return (
    <ul>
      {postQueries.posts?.map((post) => (
        <li key={post?.id}>{post?.title}</li>
      ))}
    </ul>
  )
}
```

### Đáp án mẫu

> Parallel queries (nhiều `useQuery`) dùng khi số lượng query cố định — các hook chạy song song tự nhiên. `useQueries` dùng khi số lượng query phụ thuộc vào dữ liệu runtime, nhận mảng options và hỗ trợ option `combine` để gộp kết quả thành một shape duy nhất.

---

## Câu 4: Cách cancel queries trong React Query khi component unmount? `[Advanced]`

### Câu hỏi

> React Query xử lý việc cancel request khi component unmount như thế nào? Làm sao để tích hợp `AbortSignal`?

### Giải thích lý thuyết

React Query v5 truyền `signal` (`AbortSignal`) vào `queryFn` theo mặc định. Khi:
- Component unmount
- Query bị invalidate trong lúc đang fetch
- Query key thay đổi trước khi fetch hoàn tất

React Query sẽ tự động abort signal. `queryFn` cần sử dụng `signal` này và truyền vào fetch/axios để request thực sự bị hủy ở tầng network.

**Lợi ích:** Tránh race condition, tiết kiệm băng thông, không cập nhật state sau unmount.

### Code minh hoạ

```tsx
import { useQuery, QueryFunctionContext } from '@tanstack/react-query'
import axios from 'axios'

// --- Với Fetch API (tự động nhờ signal) ---
function SearchResults({ keyword }: { keyword: string }) {
  const { data } = useQuery({
    queryKey: ['search', keyword],
    queryFn: async ({ signal }: QueryFunctionContext) => {
      // Truyền signal vào fetch — request bị hủy khi signal.aborted = true
      const res = await fetch(`/api/search?q=${keyword}`, { signal })
      if (!res.ok) throw new Error('Search failed')
      return res.json()
    },
    enabled: keyword.length > 2,
  })

  return <div>{data?.length ?? 0} kết quả</div>
}

// --- Với Axios ---
async function fetchPostWithAxios(
  id: number,
  signal: AbortSignal
) {
  const { data } = await axios.get(`/api/posts/${id}`, {
    signal, // Axios v0.22+ hỗ trợ AbortSignal
  })
  return data
}

function PostDetail({ postId }: { postId: number }) {
  const { data } = useQuery({
    queryKey: ['post', postId],
    queryFn: ({ signal }) => fetchPostWithAxios(postId, signal),
  })

  return <div>{data?.title}</div>
}

// --- Manual cancel (hiếm dùng) ---
import { useQueryClient } from '@tanstack/react-query'

function CancelButton({ queryKey }: { queryKey: string[] }) {
  const queryClient = useQueryClient()

  return (
    <button onClick={() => queryClient.cancelQueries({ queryKey })}>
      Hủy tải
    </button>
  )
}
```

### Đáp án mẫu

> React Query v5 tự động truyền `AbortSignal` qua tham số `signal` của `queryFn`. Truyền `signal` này vào `fetch` hoặc `axios` để hủy request thực sự ở tầng network khi component unmount hoặc query bị invalidate. Có thể cancel thủ công bằng `queryClient.cancelQueries()`.

---

## Câu 5: `keepPreviousData` (`placeholderData` với identity function) dùng khi nào? `[Intermediate]`

### Câu hỏi

> Trong React Query v5, `keepPreviousData` đã bị thay thế bằng gì? Dùng pattern này để giải quyết vấn đề gì?

### Giải thích lý thuyết

Trong React Query v4 có option `keepPreviousData: true`. Từ v5, option này bị loại bỏ và được thay bằng:

```tsx
placeholderData: (previousData) => previousData
// Hoặc dùng helper:
import { keepPreviousData } from '@tanstack/react-query'
placeholderData: keepPreviousData
```

**Vấn đề giải quyết:** Khi người dùng chuyển trang (pagination) hoặc thay đổi filter, query key thay đổi — React Query xóa dữ liệu cũ và hiển thị loading state. Điều này gây "nhấp nháy" UX xấu.

Với `placeholderData: keepPreviousData`, dữ liệu trang/filter trước được giữ nguyên hiển thị (với opacity thấp hơn nếu muốn) trong lúc chờ dữ liệu mới.

### Code minh hoạ

```tsx
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useState } from 'react'

interface Post {
  id: number
  title: string
}

interface PagedResponse {
  posts: Post[]
  totalPages: number
}

function PaginatedPosts() {
  const [page, setPage] = useState(1)

  const { data, isPlaceholderData, isFetching } = useQuery({
    queryKey: ['posts', { page }],
    queryFn: (): Promise<PagedResponse> =>
      fetch(`/api/posts?page=${page}`).then((r) => r.json()),
    // Giữ dữ liệu trang cũ khi chuyển trang
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

  return (
    <div>
      {/* Hiển thị mờ khi đang tải trang mới */}
      <div style={{ opacity: isPlaceholderData ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        {data?.posts.map((post) => (
          <div key={post.id}>{post.title}</div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Trước
        </button>

        <span>Trang {page} / {data?.totalPages ?? '?'}</span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={isPlaceholderData || page === data?.totalPages}
        >
          Sau
        </button>

        {isFetching && <span>Đang cập nhật...</span>}
      </div>
    </div>
  )
}
```

### Đáp án mẫu

> Trong React Query v5, `keepPreviousData` được thay bằng `placeholderData: keepPreviousData` (import helper từ `@tanstack/react-query`). Pattern này giữ dữ liệu cũ hiển thị trong lúc fetch dữ liệu mới khi query key thay đổi (pagination, filter), tránh hiện tượng nhấp nháy UX. Kiểm tra `isPlaceholderData` để biết đang hiển thị dữ liệu cũ.

---

## Câu 6: `enabled` option trong `useQuery` dùng để làm gì? `[Intermediate]`

### Câu hỏi

> `enabled` option trong `useQuery` hoạt động thế nào? Cho ví dụ các trường hợp sử dụng thực tế.

### Giải thích lý thuyết

`enabled` là boolean (hoặc hàm trả về boolean) kiểm soát việc query có được chạy hay không. Khi `enabled: false`:
- Query không tự động fetch
- Query ở trạng thái `pending` với `fetchStatus: 'idle'`
- Vẫn có thể fetch thủ công bằng `refetch()`

**Các use case phổ biến:**

| Use case | Pattern |
|---|---|
| Dependent query (query B phụ thuộc query A) | `enabled: !!dataFromQueryA` |
| Chỉ fetch khi user đăng nhập | `enabled: isAuthenticated` |
| Lazy query (fetch theo yêu cầu) | `enabled: false` + `refetch()` |
| Debounce search | `enabled: searchTerm.length > 2` |

### Code minh hoạ

```tsx
import { useQuery } from '@tanstack/react-query'

// --- Dependent queries: fetch user trước, rồi mới fetch orders ---
function UserOrders({ userId }: { userId: number | null }) {
  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId!),
    enabled: userId !== null,
  })

  const ordersQuery = useQuery({
    queryKey: ['orders', userQuery.data?.id],
    queryFn: () => fetchOrders(userQuery.data!.id),
    // Chỉ fetch orders khi đã có user data
    enabled: !!userQuery.data,
  })

  if (userQuery.isLoading) return <div>Đang tải thông tin người dùng...</div>
  if (ordersQuery.isLoading) return <div>Đang tải đơn hàng...</div>

  return <OrderList orders={ordersQuery.data} />
}

// --- Lazy query: chỉ fetch khi user bấm nút ---
function LazySearch() {
  const [keyword, setKeyword] = useState('')
  const [shouldSearch, setShouldSearch] = useState(false)

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['search', keyword],
    queryFn: () => searchPosts(keyword),
    enabled: false, // Không tự fetch
  })

  const handleSearch = () => {
    setShouldSearch(true)
    refetch() // Fetch thủ công
  }

  return (
    <div>
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Nhập từ khóa..."
      />
      <button onClick={handleSearch} disabled={isFetching}>
        {isFetching ? 'Đang tìm...' : 'Tìm kiếm'}
      </button>
      {data?.map((post) => <div key={post.id}>{post.title}</div>)}
    </div>
  )
}

// --- Debounce search ---
import { useDebounce } from './hooks/useDebounce'

function SearchBox() {
  const [input, setInput] = useState('')
  const debouncedInput = useDebounce(input, 300)

  const { data } = useQuery({
    queryKey: ['search', debouncedInput],
    queryFn: () => searchPosts(debouncedInput),
    enabled: debouncedInput.length > 2, // Chỉ fetch khi nhập >= 3 ký tự
  })

  return (
    <div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      {data?.map((post) => <div key={post.id}>{post.title}</div>)}
    </div>
  )
}
```

### Đáp án mẫu

> `enabled` kiểm soát khi nào query được thực thi. Dùng cho dependent queries (query B chờ kết quả query A), lazy fetch (fetch theo yêu cầu kết hợp với `refetch()`), hoặc conditional fetch như chỉ search khi input đủ dài. Khi `enabled: false`, query ở trạng thái `idle` và không tiêu tốn tài nguyên mạng.

---

## Câu 7: Query Filters trong React Query là gì? Dùng ở đâu? `[Advanced]`

### Câu hỏi

> Query Filters trong React Query là gì? Chúng được dùng trong những API nào và có những loại filter nào?

### Giải thích lý thuyết

**Query Filters** là object dùng để lọc một tập hợp các query trong cache. Chúng được dùng trong các API của `queryClient` như `invalidateQueries`, `refetchQueries`, `cancelQueries`, `removeQueries`, `resetQueries`, và trong `useIsFetching`.

**Các filter properties:**

| Property | Kiểu | Mô tả |
|---|---|---|
| `queryKey` | `QueryKey` | Lọc theo key (prefix match) |
| `exact` | `boolean` | `true` = match chính xác, `false` = prefix |
| `type` | `'active' \| 'inactive' \| 'all'` | Lọc theo trạng thái observer |
| `stale` | `boolean` | Lọc query đã stale |
| `fetchStatus` | `'fetching' \| 'paused' \| 'idle'` | Lọc theo fetch status |
| `predicate` | `(query) => boolean` | Custom filter function |

### Code minh hoạ

```tsx
import { useQueryClient, useIsFetching } from '@tanstack/react-query'

function QueryControlExample() {
  const queryClient = useQueryClient()

  // Invalidate tất cả query có prefix key ['posts']
  const invalidateAllPosts = () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] })
  }

  // Invalidate CHÍNH XÁC query ['posts', { page: 1 }]
  const invalidatePageOne = () => {
    queryClient.invalidateQueries({
      queryKey: ['posts', { page: 1 }],
      exact: true,
    })
  }

  // Chỉ refetch các query đang active (có component đang subscribe)
  const refetchActiveOnly = () => {
    queryClient.refetchQueries({
      queryKey: ['posts'],
      type: 'active',
    })
  }

  // Xóa các query đã stale khỏi cache
  const removeStaleQueries = () => {
    queryClient.removeQueries({
      stale: true,
      type: 'inactive', // Chỉ xóa query không có observer
    })
  }

  // Custom predicate: invalidate tất cả query của user cụ thể
  const invalidateUserData = (userId: number) => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey
        // key[1] là object hoặc number chứa userId
        return Array.isArray(key) &&
          typeof key[1] === 'object' &&
          key[1] !== null &&
          'userId' in key[1] &&
          (key[1] as { userId: number }).userId === userId
      },
    })
  }

  return (
    <div>
      <button onClick={invalidateAllPosts}>Làm mới tất cả posts</button>
      <button onClick={invalidatePageOne}>Làm mới trang 1</button>
      <button onClick={refetchActiveOnly}>Refetch active queries</button>
      <button onClick={removeStaleQueries}>Xóa stale queries</button>
      <button onClick={() => invalidateUserData(42)}>Làm mới dữ liệu user 42</button>
    </div>
  )
}

// useIsFetching với filter
function GlobalLoadingBar() {
  // Đếm số lượng query có prefix ['posts'] đang fetch
  const isFetchingPosts = useIsFetching({ queryKey: ['posts'] })

  return isFetchingPosts > 0 ? (
    <div className="loading-bar">Đang tải dữ liệu bài viết...</div>
  ) : null
}
```

### Đáp án mẫu

> Query Filters là object cấu hình dùng để chỉ định tập hợp query cần thao tác trong `invalidateQueries`, `refetchQueries`, `cancelQueries`, `removeQueries` và `useIsFetching`. Các filter chính gồm: `queryKey` (prefix match mặc định, `exact: true` để match chính xác), `type` (lọc active/inactive/all), `stale`, `fetchStatus`, và `predicate` (custom function). Hiểu query filters giúp kiểm soát cache invalidation chính xác, tránh invalidate quá nhiều hoặc quá ít.

---
