---
sidebar_position: 2
title: "2. RTK Query"
---

# RTK Query

## RTK Query là gì?

RTK Query là data fetching & caching tool tích hợp trong Redux Toolkit. Tự động quản lý loading state, caching, invalidation, polling — không cần viết thunk hay slice cho API calls.

## Tạo API Slice

```tsx
// services/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface CreateUserDto {
  name: string;
  email: string;
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.example.com',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Post'],
  endpoints: (builder) => ({
    // GET /users
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),

    // GET /users/:id
    getUser: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // POST /users
    createUser: builder.mutation<User, CreateUserDto>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'], // Refetch danh sách users
    }),

    // PUT /users/:id
    updateUser: builder.mutation<User, { id: string; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),

    // DELETE /users/:id
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

// Auto-generated hooks
export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = api;
```

## Thêm vào Store

```tsx
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services/api';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
```

## Sử dụng Queries

```tsx
function UserList() {
  const { data: users, isLoading, error, refetch } = useGetUsersQuery();

  if (isLoading) return <Spinner />;
  if (error) return <p>Error loading users</p>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {users?.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

// Query với parameters
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading } = useGetUserQuery(userId);

  if (isLoading) return <Spinner />;
  return <h1>{user?.name}</h1>;
}

// Skip query (không fetch cho đến khi có điều kiện)
const { data } = useGetUserQuery(userId, { skip: !userId });
```

## Sử dụng Mutations

```tsx
function CreateUserForm() {
  const [createUser, { isLoading, error }] = useCreateUserMutation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({ name, email }).unwrap();
      setName('');
      setEmail('');
      // Danh sách users TỰ ĐỘNG refetch nhờ invalidatesTags
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create'}
      </button>
      {error && <p>Error creating user</p>}
    </form>
  );
}
```

## Cache & Tags

RTK Query tự động cache data. Tags kiểm soát khi nào cache bị invalidate:

```
1. useGetUsersQuery() → fetch → cache với tag 'User'
2. createUser mutation → thành công → invalidatesTags: ['User']
3. RTK Query tự động refetch tất cả queries có providesTags: ['User']
4. UI tự cập nhật
```

### Tag patterns

```tsx
// Tag cho toàn bộ list
providesTags: ['User']

// Tag cho từng item
providesTags: (result) =>
  result
    ? [
        ...result.map(({ id }) => ({ type: 'User' as const, id })),
        { type: 'User', id: 'LIST' },
      ]
    : [{ type: 'User', id: 'LIST' }]
```

## Polling (auto-refresh)

```tsx
// Tự fetch lại mỗi 30 giây
const { data } = useGetUsersQuery(undefined, {
  pollingInterval: 30000,
});
```

## Query với pagination

```tsx
// API endpoint
getUsers: builder.query<PaginatedResponse<User>, { page: number; limit: number }>({
  query: ({ page, limit }) => `/users?page=${page}&limit=${limit}`,
  providesTags: ['User'],
}),

// Component
function PaginatedUserList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetUsersQuery({ page, limit: 10 });

  return (
    <div>
      {isLoading ? <Spinner /> : (
        <ul>
          {data?.items.map((user) => <li key={user.id}>{user.name}</li>)}
        </ul>
      )}
      {isFetching && <p>Updating...</p>}
      <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>Prev</button>
      <button onClick={() => setPage((p) => p + 1)}>Next</button>
    </div>
  );
}
```

## Kỹ thuật nâng cao

### Optimistic update

```tsx
updateUser: builder.mutation({
  query: ({ id, data }) => ({ url: `/users/${id}`, method: 'PUT', body: data }),
  async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
    // Cập nhật cache NGAY LẬP TỨC (optimistic)
    const patchResult = dispatch(
      api.util.updateQueryData('getUsers', undefined, (draft) => {
        const user = draft.find((u) => u.id === id);
        if (user) Object.assign(user, data);
      })
    );

    try {
      await queryFulfilled; // Đợi server response
    } catch {
      patchResult.undo(); // Rollback nếu lỗi
    }
  },
}),
```

### Prefetching

```tsx
const dispatch = useAppDispatch();

// Prefetch khi hover
<li onMouseEnter={() => dispatch(api.util.prefetch('getUser', userId, {}))}>
  {user.name}
</li>
```

---

## Câu hỏi phỏng vấn

### Câu 1: RTK Query khác gì so với tự viết useEffect + fetch?
**Đáp án:**

Tự viết `useEffect + fetch` phải xử lý **rất nhiều thứ thủ công** mà RTK Query đã giải quyết sẵn:

| Vấn đề | useEffect + fetch | RTK Query |
|---|---|---|
| Loading/error state | Tự quản lý useState | Tự động (isLoading, error) |
| Caching | Không có | Tự động cache, dedup |
| Refetch khi data cũ | Tự viết logic | Tự động (cache invalidation) |
| Race conditions | Phải tự handle | Xử lý sẵn |
| Deduplication | Không có | Cùng query chỉ fetch 1 lần |
| Polling | Tự viết setInterval | `pollingInterval` option |
| Prefetching | Tự viết | `prefetch` utility |

```tsx
// ❌ Tự viết — nhiều boilerplate, dễ bug
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false; // Race condition handling
    setLoading(true);
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setUsers(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  // Còn phải handle: refetch, caching, dedup, stale data...
}

// ✅ RTK Query — tất cả đã có sẵn
function UserList() {
  const { data: users, isLoading, error, refetch } = useGetUsersQuery();
  // Caching, dedup, refetch, error handling — tất cả tự động
}
```

### Câu 2: Tags (providesTags, invalidatesTags) hoạt động thế nào?
**Đáp án:**

Tags là hệ thống **cache invalidation** của RTK Query, hoạt động theo mô hình publish-subscribe:

1. **providesTags**: Query endpoint **đăng ký** tag — "data này thuộc nhóm tag X"
2. **invalidatesTags**: Mutation endpoint **vô hiệu hóa** tag — "tag X đã cũ, cần refetch"
3. RTK Query tự động refetch tất cả queries có tag bị invalidate

```tsx
endpoints: (builder) => ({
  // Query CUNG CẤP tag 'User'
  getUsers: builder.query<User[], void>({
    query: () => '/users',
    providesTags: (result) =>
      result
        ? [
            ...result.map(({ id }) => ({ type: 'User' as const, id })),
            { type: 'User', id: 'LIST' },
          ]
        : [{ type: 'User', id: 'LIST' }],
  }),

  // Mutation VÔ HIỆU HÓA tag 'User' → getUsers tự refetch
  createUser: builder.mutation<User, CreateUserDto>({
    query: (body) => ({ url: '/users', method: 'POST', body }),
    invalidatesTags: [{ type: 'User', id: 'LIST' }],
  }),

  // Chỉ invalidate 1 user cụ thể
  updateUser: builder.mutation({
    query: ({ id, data }) => ({ url: `/users/${id}`, method: 'PUT', body: data }),
    invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
  }),
})
```

Flow: `createUser` thành công → invalidate tag `User:LIST` → `getUsers` tự động refetch → UI cập nhật danh sách mới.

### Câu 3: Optimistic update trong RTK Query triển khai ra sao?
**Đáp án:**

Optimistic update là kỹ thuật **cập nhật UI ngay lập tức** trước khi server phản hồi, sau đó rollback nếu lỗi. RTK Query hỗ trợ qua `onQueryStarted`:

```tsx
updateUser: builder.mutation<User, { id: string; data: Partial<User> }>({
  query: ({ id, data }) => ({
    url: `/users/${id}`,
    method: 'PUT',
    body: data,
  }),
  async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
    // Bước 1: Cập nhật cache NGAY LẬP TỨC (trước khi server trả về)
    const patchResult = dispatch(
      api.util.updateQueryData('getUsers', undefined, (draft) => {
        const user = draft.find((u) => u.id === id);
        if (user) Object.assign(user, data);
      })
    );

    try {
      // Bước 2: Đợi server response
      await queryFulfilled;
      // Thành công → cache đã đúng, không cần làm gì thêm
    } catch {
      // Bước 3: Lỗi → ROLLBACK về state trước
      patchResult.undo();
    }
  },
}),
```

Flow:
1. User click "Save" → **UI cập nhật ngay** (không chờ loading)
2. Request gửi đến server
3. Server OK → giữ nguyên, Server lỗi → **undo** về trạng thái cũ

Ưu điểm: UX mượt mà, user không phải chờ spinner cho mỗi thao tác nhỏ.

### Câu 4: Khi nào nên dùng RTK Query vs TanStack Query?
**Đáp án:**

| Tiêu chí | RTK Query | TanStack Query |
|---|---|---|
| Đã dùng Redux | **Nên dùng** — tích hợp sẵn trong store | Phải thêm layer riêng |
| Không dùng Redux | Phải setup cả Redux store | **Nên dùng** — standalone |
| Cache invalidation | Tag-based (providesTags) | Key-based (queryKey) |
| Optimistic updates | `onQueryStarted` + `patchResult` | `onMutate` + `context` |
| Infinite scroll | Không hỗ trợ sẵn | `useInfiniteQuery` tích hợp |
| SSR/Next.js | Cần setup thêm | Hỗ trợ tốt hơn |
| Bundle size | Đã có nếu dùng RTK | ~13KB thêm |
| DevTools | Redux DevTools | TanStack Query DevTools |

**Chọn RTK Query khi:**
- Dự án đã dùng Redux Toolkit
- Cần server state + client state trong cùng store
- Team quen thuộc với Redux ecosystem

**Chọn TanStack Query khi:**
- Không dùng Redux (dùng Zustand, Jotai, hoặc không cần global state)
- Cần infinite scroll, pagination phức tạp
- Dự án Next.js / SSR
- Chỉ cần quản lý server state, client state đơn giản
