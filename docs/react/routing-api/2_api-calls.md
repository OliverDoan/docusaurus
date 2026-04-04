---
sidebar_position: 2
title: "Gọi API — Fetch & Axios"
---

# Gọi API — Fetch & Axios

## Fetch API (built-in)

Fetch là API native của trình duyệt, không cần cài thêm thư viện.

### GET request

```tsx
async function fetchUsers(): Promise<User[]> {
  const response = await fetch('https://api.example.com/users');

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
```

### POST request

```tsx
async function createUser(data: CreateUserDto): Promise<User> {
  const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create user');
  }

  return response.json();
}
```

### PUT / DELETE

```tsx
// PUT
await fetch(`/api/users/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedData),
});

// DELETE
await fetch(`/api/users/${id}`, { method: 'DELETE' });
```

## Axios

Axios cung cấp API thuận tiện hơn Fetch — tự parse JSON, interceptors, timeout, cancel.

```bash
npm install axios
```

### Setup instance

```tsx
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor — tự thêm token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor — xử lý lỗi chung
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### CRUD operations

```tsx
import api from './api';

// GET
const { data: users } = await api.get<User[]>('/users');

// GET với params
const { data } = await api.get('/users', {
  params: { page: 1, limit: 10, search: 'alice' },
});
// → GET /users?page=1&limit=10&search=alice

// POST
const { data: newUser } = await api.post<User>('/users', {
  name: 'Alice',
  email: 'alice@test.com',
});

// PUT
await api.put(`/users/${id}`, updatedData);

// DELETE
await api.delete(`/users/${id}`);
```

## Fetch vs Axios

| | Fetch | Axios |
|---|---|---|
| Cài đặt | Không cần (native) | Cần `npm install` |
| JSON parse | Manual (`.json()`) | Tự động |
| Error handling | Chỉ reject khi network fail | Reject khi status >= 400 |
| Interceptors | ❌ | ✅ |
| Timeout | Manual (AbortController) | Config sẵn |
| Cancel request | AbortController | CancelToken / AbortController |
| Bundle size | 0 KB | ~13 KB |

## Pattern: Gọi API trong React component

### Loading / Error / Data states

```tsx
function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();

        if (!cancelled) setUsers(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUsers();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (users.length === 0) return <p>No users found</p>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## AbortController — Hủy request

Khi component unmount hoặc dependency thay đổi trước khi request hoàn thành, cần hủy request cũ:

```tsx
useEffect(() => {
  const controller = new AbortController();

  fetch(`/api/users/${userId}`, { signal: controller.signal })
    .then((res) => res.json())
    .then((data) => setUser(data))
    .catch((err) => {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    });

  return () => controller.abort();
}, [userId]);
```

### Axios với AbortController

```tsx
useEffect(() => {
  const controller = new AbortController();

  api.get(`/users/${userId}`, { signal: controller.signal })
    .then(({ data }) => setUser(data))
    .catch((err) => {
      if (!axios.isCancel(err)) {
        setError(err.message);
      }
    });

  return () => controller.abort();
}, [userId]);
```

## Custom Hook: useFetch

Tách logic fetch thành hook tái sử dụng:

```tsx
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        setData(json);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}

// Sử dụng
function UserProfile({ userId }: { userId: string }) {
  const { data: user, loading, error } = useFetch<User>(`/api/users/${userId}`);

  if (loading) return <Spinner />;
  if (error) return <p>Error: {error}</p>;
  return <h1>{user?.name}</h1>;
}
```

## Thực hành: TMDB API

```tsx
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Service layer
async function getPopularMovies(page = 1) {
  const response = await fetch(
    `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`
  );
  if (!response.ok) throw new Error('Failed to fetch movies');
  return response.json();
}

// Component
function MovieList() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getPopularMovies(page).then((data) => setMovies(data.results));
  }, [page]);

  return (
    <div>
      {movies.map((movie) => (
        <div key={movie.id}>
          <img
            src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
            alt={movie.title}
          />
          <h3>{movie.title}</h3>
        </div>
      ))}
      <button onClick={() => setPage((p) => p + 1)}>Next Page</button>
    </div>
  );
}
```

## Nên dùng TanStack Query cho production

Với ứng dụng thực tế, tự viết loading/error/caching rất phức tạp. Dùng **TanStack Query** (xem bài State Management):

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: () => api.get('/users').then((r) => r.data),
});
```

---

## Cau hoi phong van

### Cau 1: Fetch vs Axios: nen chon cai nao, tai sao?

**Dap an:**

Tuy thuoc vao quy mo du an va yeu cau cu the:

**Chon Fetch khi:**
- Du an nho, it API calls.
- Muon giam bundle size (0 KB vi la native API).
- Khong can interceptors hay cau hinh phuc tap.

**Chon Axios khi:**
- Du an lon, nhieu API calls.
- Can interceptors (tu dong gan token, xu ly loi chung).
- Can timeout, retry, cancel request de dang.
- Team muon code ngan gon, it boilerplate.

```tsx
// === FETCH: Phai xu ly thu cong nhieu thu ===
async function getUser(id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/users/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,  // Phai tu them token moi lan
    },
  });

  // Fetch KHONG reject khi status 4xx/5xx — phai check thu cong
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();  // Phai goi .json() thu cong
}

// === AXIOS: Ngan gon, tu dong hoa nhieu viec ===
// Config 1 lan, ap dung cho moi request
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  return config;
});

async function getUser(id: string) {
  const { data } = await api.get<User>(`/users/${id}`);
  // Tu dong parse JSON, tu dong reject khi status >= 400
  return data;
}
```

**Ket luan thuc te:** Trong du an production, **Axios + TanStack Query** la combo pho bien nhat vi giam boilerplate va cung cap caching/retry san.

### Cau 2: Tai sao can AbortController khi goi API trong useEffect?

**Dap an:**

Khi component unmount hoac dependency thay doi **truoc khi request hoan thanh**, neu khong huy request cu se gay ra:

1. **Memory leak** — set state tren component da unmount.
2. **Race condition** — request cu tra ve sau request moi, ghi de data sai.
3. **Warning trong React** — "Can't perform a React state update on an unmounted component".

```tsx
// === SAI: Khong huy request ===
useEffect(() => {
  fetch(`/api/users/${userId}`)
    .then((res) => res.json())
    .then((data) => setUser(data));  // Component co the da unmount!
}, [userId]);

// === DUNG: Dung AbortController de huy ===
useEffect(() => {
  const controller = new AbortController();

  async function loadUser() {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        signal: controller.signal,  // Gan signal vao request
      });
      const data = await response.json();
      setUser(data);  // Chi chay neu request KHONG bi huy
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request bi huy — khong lam gi (binh thuong)
        return;
      }
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  loadUser();

  // Cleanup: huy request khi component unmount hoac userId thay doi
  return () => controller.abort();
}, [userId]);

// === VI DU RACE CONDITION ===
// userId thay doi: 1 → 2 → 3 rat nhanh
// Khong co AbortController:
//   Request 1 (500ms) → Request 2 (200ms) → Request 3 (800ms)
//   Ket qua: setUser(user2), setUser(user1), setUser(user3)
//   → Hien thi user3 nhung truoc do nhap nhay sai data!
//
// Co AbortController:
//   Request 1 (abort!) → Request 2 (abort!) → Request 3 (800ms)
//   Ket qua: chi setUser(user3) → Dung!
```

### Cau 3: Pattern loading/error/data state management khi fetch?

**Dap an:**

Moi API call deu co 3 trang thai can quan ly: **loading**, **error**, va **data**. Day la pattern chuan de xu ly day du cac truong hop.

```tsx
// === Pattern co ban: 3 state rieng biet ===
function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      try {
        setLoading(true);
        setError(null);  // Reset error truoc moi lan fetch

        const response = await fetch('/api/users', {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
    return () => controller.abort();
  }, []);

  // Render theo thu tu uu tien: loading → error → empty → data
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  if (users.length === 0) return <EmptyState message="No users found" />;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// === Pattern nang cao: useReducer cho state phuc tap ===
type State<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

type Action<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: T }
  | { type: 'FETCH_ERROR'; error: string };

function fetchReducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case 'FETCH_START':
      return { status: 'loading' };
    case 'FETCH_SUCCESS':
      return { status: 'success', data: action.payload };
    case 'FETCH_ERROR':
      return { status: 'error', error: action.error };
    default:
      return state;
  }
}
```

### Cau 4: Interceptors trong Axios dung de lam gi?

**Dap an:**

Interceptors la middleware chay **truoc moi request** (request interceptor) hoac **sau moi response** (response interceptor). Dung de xu ly cac logic chung ma khong phai lap lai o moi API call.

```tsx
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
});

// === REQUEST INTERCEPTOR ===
// Chay TRUOC moi request gui di
api.interceptors.request.use(
  (config) => {
    // 1. Tu dong gan token vao header
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Log request (debug)
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// === RESPONSE INTERCEPTOR ===
// Chay SAU moi response nhan duoc
api.interceptors.response.use(
  (response) => {
    // Response thanh cong (2xx) — tra ve binh thuong
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 1. Token het han (401) — tu dong refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/auth/refresh', { refreshToken });

        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);  // Gui lai request cu voi token moi
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    // 2. Server error (500) — hien thong bao chung
    if (error.response?.status >= 500) {
      alert('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default api;
```

**Cac use case pho bien cua interceptors:**
- Tu dong gan Authorization token.
- Refresh token khi het han (401).
- Redirect ve login khi unauthorized.
- Log request/response de debug.
- Hien thi thong bao loi chung (toast notification).
- Them loading indicator toan cuc.

### Cau 5: Tai sao nen dung TanStack Query thay vi tu viet data fetching?

**Dap an:**

Tu viet data fetching voi `useEffect` + `useState` se gap rat nhieu van de khi ung dung lon. TanStack Query (React Query) giai quyet tat ca nhung van de do.

```tsx
// === TU VIET: Phai xu ly nhieu thu ===
function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/users', { signal: controller.signal });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        if (!cancelled) setUsers(data);
      } catch (err) {
        if (!cancelled && (err as Error).name !== 'AbortError') {
          setError((err as Error).message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; controller.abort(); };
  }, []);

  // Khong co: caching, retry, refetch, pagination, optimistic update...
  // Phai tu viet TAT CA!

  if (loading) return <Spinner />;
  if (error) return <p>Error: {error}</p>;
  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}

// === TANSTACK QUERY: 3 dong thay the tat ca ===
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function UserList() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<User[]>('/users').then((r) => r.data),
    staleTime: 5 * 60 * 1000,   // Cache 5 phut — khong fetch lai neu data con "tuoi"
    retry: 3,                     // Tu dong retry 3 lan khi that bai
    refetchOnWindowFocus: true,   // Refetch khi user quay lai tab
  });

  if (isLoading) return <Spinner />;
  if (error) return <p>Error: {error.message}</p>;
  return <ul>{users?.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}

// Mutation (POST/PUT/DELETE) voi optimistic update
function CreateUserButton() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newUser: CreateUserDto) => api.post('/users', newUser),
    onSuccess: () => {
      // Tu dong refetch danh sach users sau khi tao thanh cong
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate({ name: 'Alice', email: 'alice@test.com' })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Creating...' : 'Create User'}
    </button>
  );
}
```

**Nhung gi TanStack Query lam san (khong phai tu viet):**
- **Caching** — khong fetch lai du lieu da co.
- **Automatic retry** — tu dong thu lai khi that bai.
- **Background refetch** — cap nhat data khi user quay lai tab.
- **Deduplication** — nhieu component goi cung query chi fetch 1 lan.
- **Pagination & Infinite scroll** — ho tro san.
- **Optimistic updates** — cap nhat UI truoc khi server xac nhan.
- **DevTools** — debug query state truc quan.
