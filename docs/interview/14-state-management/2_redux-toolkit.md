---
sidebar_position: 2
title: "2. Redux Toolkit"
---

# Redux Toolkit

> _Redux Toolkit (RTK) là bộ công cụ chính thức giúp viết Redux hiệu quả hơn, ít boilerplate hơn và dễ bảo trì hơn trong các dự án React hiện đại._

---

## Câu 1: Redux Toolkit (RTK) là gì? Tại sao nên dùng RTK thay vì Redux thuần? `[Intermediate]`

### Câu hỏi

> Redux Toolkit là gì? Hãy so sánh RTK với Redux thuần và giải thích lý do nên ưu tiên sử dụng RTK trong dự án mới.

### Giải thích lý thuyết

Redux Toolkit là thư viện chính thức được đội ngũ Redux phát triển nhằm giải quyết các vấn đề phổ biến khi dùng Redux thuần:

- **Quá nhiều boilerplate**: Redux thuần yêu cầu viết action types, action creators, reducers riêng biệt.
- **Cấu hình phức tạp**: Cần tự cài đặt middleware (redux-thunk, redux-saga), DevTools Extension.
- **Dễ mắc lỗi mutation**: Reducer phải trả về state mới, dễ vô tình mutate state.

RTK tích hợp sẵn:

| Tính năng | Redux thuần | Redux Toolkit |
|---|---|---|
| Boilerplate | Nhiều | Tối thiểu |
| Immer (immutable) | Tự cài | Tích hợp sẵn |
| Redux Thunk | Tự cài | Tích hợp sẵn |
| DevTools | Tự cấu hình | Tự động |
| RTK Query | Không có | Tích hợp sẵn |

### Code minh hoạ

```ts
// Redux thuần — nhiều boilerplate
const INCREMENT = 'counter/increment'
const DECREMENT = 'counter/decrement'

const increment = () => ({ type: INCREMENT })
const decrement = () => ({ type: DECREMENT })

function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case INCREMENT:
      return { ...state, value: state.value + 1 }
    case DECREMENT:
      return { ...state, value: state.value - 1 }
    default:
      return state
  }
}

// RTK — gọn gàng, an toàn hơn
import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1 }, // Immer xử lý immutability
    decrement: (state) => { state.value -= 1 },
  },
})

const store = configureStore({ reducer: { counter: counterSlice.reducer } })
```

### Đáp án mẫu

> RTK là bộ công cụ chính thức của Redux giúp giảm boilerplate, tích hợp sẵn Immer (immutability), Redux Thunk và DevTools. Nên dùng RTK thay Redux thuần vì code ngắn hơn, ít lỗi hơn và được khuyến nghị chính thức từ đội ngũ Redux.

---

## Câu 2: createSlice trong RTK hoạt động như thế nào? `[Intermediate]`

### Câu hỏi

> Hãy giải thích `createSlice` trong Redux Toolkit. Nó tạo ra những gì và cách sử dụng trong component React?

### Giải thích lý thuyết

`createSlice` là API trung tâm của RTK, nhận vào một object cấu hình và tự động tạo ra:

- **Action creators**: Các hàm tạo action, đặt tên theo `name/reducerKey`.
- **Action types**: Chuỗi định danh dạng `"sliceName/actionName"`.
- **Reducer**: Hàm reducer tổng hợp xử lý tất cả actions.

Bên trong reducer của `createSlice`, RTK dùng thư viện **Immer** nên có thể viết code "trông có vẻ mutate" nhưng thực chất vẫn tạo ra state mới — an toàn và immutable.

Cấu trúc object cấu hình:

| Trường | Mô tả |
|---|---|
| `name` | Tiền tố cho action types |
| `initialState` | Giá trị state ban đầu |
| `reducers` | Object chứa các reducer functions |
| `extraReducers` | Xử lý actions từ slice khác hoặc `createAsyncThunk` |

### Code minh hoạ

```ts
// store/todoSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Todo {
  id: number
  text: string
  completed: boolean
}

interface TodoState {
  items: Todo[]
}

const initialState: TodoState = { items: [] }

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<string>) => {
      // Immer cho phép "mutate" trực tiếp — thực ra vẫn immutable
      state.items.push({
        id: Date.now(),
        text: action.payload,
        completed: false,
      })
    },
    toggleTodo: (state, action: PayloadAction<number>) => {
      const todo = state.items.find((t) => t.id === action.payload)
      if (todo) {
        todo.completed = !todo.completed
      }
    },
    removeTodo: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((t) => t.id !== action.payload)
    },
  },
})

// Export action creators và reducer
export const { addTodo, toggleTodo, removeTodo } = todoSlice.actions
export default todoSlice.reducer
```

```tsx
// components/TodoList.tsx
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { addTodo, toggleTodo, removeTodo } from '../store/todoSlice'

export function TodoList() {
  const dispatch = useDispatch()
  const todos = useSelector((state: RootState) => state.todos.items)

  return (
    <div>
      <button onClick={() => dispatch(addTodo('Học RTK'))}>Thêm todo</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <span
              style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
              onClick={() => dispatch(toggleTodo(todo.id))}
            >
              {todo.text}
            </span>
            <button onClick={() => dispatch(removeTodo(todo.id))}>Xoá</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Đáp án mẫu

> `createSlice` nhận `name`, `initialState` và `reducers`, tự động sinh ra action creators và reducer tương ứng. Nhờ tích hợp Immer, reducer có thể viết theo kiểu "mutate trực tiếp" mà vẫn đảm bảo immutability. Export `actions` để dispatch và `reducer` để đăng ký vào store.

---

## Câu 3: createAsyncThunk được dùng để làm gì? Các trạng thái lifecycle (pending/fulfilled/rejected) của nó là gì? `[Intermediate]`

### Câu hỏi

> Giải thích `createAsyncThunk` trong RTK. Ba trạng thái lifecycle `pending`, `fulfilled`, `rejected` là gì và cách xử lý chúng trong `extraReducers`?

### Giải thích lý thuyết

`createAsyncThunk` là utility giúp xử lý các tác vụ bất đồng bộ (gọi API, đọc file...) trong Redux. Nó tự động dispatch ba action tương ứng với vòng đời của Promise:

| Trạng thái | Thời điểm dispatch | Mục đích thường dùng |
|---|---|---|
| `pending` | Khi Promise bắt đầu chạy | Bật loading indicator |
| `fulfilled` | Khi Promise resolve thành công | Lưu data vào state |
| `rejected` | Khi Promise reject hoặc throw | Hiển thị lỗi |

Các action này được xử lý trong `extraReducers` của slice (không phải `reducers`) vì chúng được tạo bên ngoài slice.

### Code minh hoạ

```ts
// store/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: number
  name: string
  email: string
}

interface UserState {
  data: User | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  data: null,
  loading: false,
  error: null,
}

// Tạo async thunk — nhận typePrefix và payloadCreator
export const fetchUser = createAsyncThunk(
  'user/fetchById', // action type prefix
  async (userId: number, thunkAPI) => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
    if (!response.ok) {
      // Dùng rejectWithValue để truyền lỗi tuỳ chỉnh
      return thunkAPI.rejectWithValue('Không tìm thấy người dùng')
    }
    const data: User = await response.json()
    return data // Giá trị này sẽ là action.payload trong fulfilled
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.data = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string ?? 'Có lỗi xảy ra'
      })
  },
})

export const { clearUser } = userSlice.actions
export default userSlice.reducer
```

```tsx
// components/UserProfile.tsx
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import { fetchUser } from '../store/userSlice'

export function UserProfile({ userId }: { userId: number }) {
  const dispatch = useDispatch<AppDispatch>()
  const { data, loading, error } = useSelector((state: RootState) => state.user)

  useEffect(() => {
    dispatch(fetchUser(userId))
  }, [dispatch, userId])

  if (loading) return <p>Đang tải...</p>
  if (error) return <p>Lỗi: {error}</p>
  if (!data) return null

  return (
    <div>
      <h2>{data.name}</h2>
      <p>{data.email}</p>
    </div>
  )
}
```

### Đáp án mẫu

> `createAsyncThunk` bọc một hàm async và tự động dispatch `pending` (bắt đầu), `fulfilled` (thành công) và `rejected` (thất bại). Xử lý ba trạng thái này trong `extraReducers` của slice để quản lý loading, data và error state một cách nhất quán.

---

## Câu 4: RTK Query là gì? Lợi ích so với cách fetch data thủ công? `[Advanced]`

### Câu hỏi

> RTK Query là gì? So sánh lợi ích của RTK Query so với việc dùng `createAsyncThunk` + `useEffect` để fetch data thủ công.

### Giải thích lý thuyết

RTK Query là một data fetching và caching solution được tích hợp sẵn trong Redux Toolkit (từ v1.6). Nó giải quyết toàn bộ vòng đời của server state mà không cần code thủ công.

So sánh hai cách tiếp cận:

| Tiêu chí | Thủ công (thunk + useEffect) | RTK Query |
|---|---|---|
| Loading state | Tự quản lý | Tự động (`isLoading`) |
| Caching | Không có | Tự động theo tag |
| Re-fetch thông minh | Không có | Tự động (window focus, interval) |
| Deduplication | Không có | Tự động gộp request trùng |
| Optimistic updates | Phức tạp | Hỗ trợ sẵn |
| Invalidation cache | Thủ công | Khai báo tag |
| Boilerplate | Nhiều | Rất ít |

RTK Query tự động tạo ra:
- React hooks (`useGetUsersQuery`, `useCreateUserMutation`...)
- Slice và reducer quản lý cache
- Middleware xử lý caching, invalidation, polling

### Code minh hoạ

```ts
// Cách thủ công — phải tự quản lý mọi thứ
// store/userSlice.ts + component = ~80 dòng code

// RTK Query — khai báo một lần, dùng mọi nơi
// store/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface Post {
  id: number
  title: string
  body: string
}

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://jsonplaceholder.typicode.com' }),
  tagTypes: ['Post'], // Dùng để invalidate cache
  endpoints: (builder) => ({
    // Query endpoint — đọc data
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
      providesTags: ['Post'], // Cache được tag 'Post'
    }),
    getPostById: builder.query<Post, number>({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
    // Mutation endpoint — thay đổi data
    createPost: builder.mutation<Post, Partial<Post>>({
      query: (body) => ({
        url: '/posts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Post'], // Tự động xoá cache 'Post' sau khi tạo thành công
    }),
  }),
})

// RTK Query tự động export hooks
export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
} = postsApi
```

```tsx
// components/PostList.tsx — sử dụng hook cực kỳ gọn
import { useGetPostsQuery, useCreatePostMutation } from '../store/api'

export function PostList() {
  // Tự động fetch, cache, re-fetch khi cần
  const { data: posts, isLoading, isError, refetch } = useGetPostsQuery()
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation()

  if (isLoading) return <p>Đang tải bài viết...</p>
  if (isError) return <p>Có lỗi xảy ra khi tải bài viết.</p>

  return (
    <div>
      <button
        onClick={() => createPost({ title: 'Bài mới', body: 'Nội dung...' })}
        disabled={isCreating}
      >
        {isCreating ? 'Đang tạo...' : 'Tạo bài viết'}
      </button>
      <ul>
        {posts?.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

### Đáp án mẫu

> RTK Query là data fetching layer tích hợp trong RTK, tự động xử lý caching, deduplication, invalidation và re-fetching. So với cách thủ công dùng `createAsyncThunk`, RTK Query giảm đáng kể boilerplate, tự động sinh hooks và quản lý cache thông minh hơn — đặc biệt phù hợp với ứng dụng có nhiều tương tác với API.

---

## Câu 5: Cách định nghĩa API với createApi trong RTK Query như thế nào? `[Advanced]`

### Câu hỏi

> Mô tả chi tiết cách dùng `createApi` để định nghĩa một API service trong RTK Query, bao gồm `baseQuery`, `endpoints`, `tagTypes` và cách tích hợp vào Redux store.

### Giải thích lý thuyết

`createApi` là entry point chính của RTK Query. Mỗi "API service" là một slice độc lập, nên thông thường mỗi backend service tương ứng một `createApi`.

Các thành phần quan trọng:

| Thành phần | Vai trò |
|---|---|
| `reducerPath` | Key duy nhất trong Redux store |
| `baseQuery` | Hàm xử lý HTTP request (dùng `fetchBaseQuery` hoặc custom) |
| `tagTypes` | Khai báo các tag dùng để quản lý cache invalidation |
| `endpoints` | Định nghĩa các query/mutation |
| `providesTags` | Endpoint cung cấp tag gì cho cache |
| `invalidatesTags` | Mutation xoá tag nào sau khi thành công |

`fetchBaseQuery` hỗ trợ tự động đính kèm token xác thực qua `prepareHeaders`.

### Code minh hoạ

```ts
// store/authApi.ts — ví dụ API với xác thực JWT
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from './index'

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  user: User
  token: string
}

export const authApi = createApi({
  reducerPath: 'authApi', // Phải unique trong store
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL ?? 'http://localhost:3000',
    // Tự động đính kèm Bearer token vào mỗi request
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['User', 'Profile'],
  endpoints: (builder) => ({
    // Mutation: đăng nhập (không cần cache)
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    // Query: lấy danh sách users (có cache theo tag)
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
    // Query: lấy user theo id
    getUserById: builder.query<User, number>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    // Mutation: cập nhật user — invalidate cache user đó và danh sách
    updateUser: builder.mutation<User, { id: number; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useLoginMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
} = authApi
```

```ts
// store/index.ts — tích hợp vào Redux store
import { configureStore } from '@reduxjs/toolkit'
import { authApi } from './authApi'
import authReducer from './authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer, // Đăng ký reducer của API
  },
  middleware: (getDefaultMiddleware) =>
    // Thêm middleware của RTK Query (xử lý caching, polling, invalidation)
    getDefaultMiddleware().concat(authApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

```tsx
// components/UserManagement.tsx — sử dụng trong component
import { useGetUsersQuery, useUpdateUserMutation } from '../store/authApi'

export function UserManagement() {
  // Polling tự động mỗi 30 giây
  const { data: users, isLoading, isFetching } = useGetUsersQuery(undefined, {
    pollingInterval: 30000,
  })
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()

  const handleUpdate = async (id: number) => {
    try {
      await updateUser({ id, data: { role: 'admin' } }).unwrap()
      // unwrap() throw lỗi nếu mutation thất bại
      alert('Cập nhật thành công!')
    } catch (error) {
      alert('Cập nhật thất bại!')
    }
  }

  if (isLoading) return <p>Đang tải...</p>

  return (
    <div>
      {isFetching && <span>Đang làm mới...</span>}
      <ul>
        {users?.map((user) => (
          <li key={user.id}>
            {user.name}
            <button onClick={() => handleUpdate(user.id)} disabled={isUpdating}>
              Nâng quyền
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Đáp án mẫu

> `createApi` nhận `reducerPath` (key trong store), `baseQuery` (cấu hình HTTP, có thể đính kèm token qua `prepareHeaders`), `tagTypes` (danh sách tag cho cache) và `endpoints` (khai báo query/mutation). Mỗi endpoint dùng `providesTags`/`invalidatesTags` để kiểm soát cache. Sau khi tạo, đăng ký `reducer` và `middleware` vào store — RTK Query tự động sinh hooks để dùng trong component.

---
