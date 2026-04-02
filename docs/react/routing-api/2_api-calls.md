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
