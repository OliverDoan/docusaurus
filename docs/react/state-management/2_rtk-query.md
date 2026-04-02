---
sidebar_position: 2
title: "RTK Query"
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
