---
sidebar_position: 9
title: "9. React Router"
---

# React Router

> _React Router là thư viện routing phổ biến nhất trong hệ sinh thái React, cho phép xây dựng Single Page Application với điều hướng phía client. Từ v6 và đặc biệt v6.4+, React Router đã bổ sung nhiều tính năng mạnh mẽ như data loading, actions và error boundaries tích hợp sẵn._

:::note[Ghi nhớ nhanh]

- ⭐ **Hooks điều hướng cốt lõi** — `useParams` đọc dynamic segment từ URL, `useNavigate` chuyển trang bằng code, `useSearchParams` xử lý query string.
- **Nested routes + `Outlet`** — route lồng nhau render layout chung và render con qua `<Outlet />`.
- **Protected routes** — bọc route cần đăng nhập, redirect về login nếu chưa auth.
- **`loader` (v6.4+)** — nạp data trước khi render route, tránh waterfall và loading spinner rời rạc.

:::

---

## Câu 1: `useParams` hook trong React Router dùng để làm gì? `[Basic]`

### Câu hỏi

> `useParams` là gì? Khi nào cần dùng và cách sử dụng như thế nào trong React Router v6?

### Giải thích lý thuyết

`useParams` là một hook của React Router dùng để **đọc các tham số động (dynamic segments)** từ URL hiện tại. Khi bạn định nghĩa một route có dạng `/users/:id`, phần `:id` là một dynamic segment — `useParams` sẽ trả về object chứa giá trị thực tế của segment đó.

**Đặc điểm quan trọng:**
- Chỉ hoạt động bên trong component được render bởi `<Route>` tương ứng (hoặc component con của nó).
- Trả về object với key là tên segment, value là chuỗi string.
- Nếu route không có params, trả về object rỗng `{}`.

| Tình huống | Cách dùng |
|---|---|
| Xem chi tiết bài viết | `/posts/:postId` → `params.postId` |
| Trang profile người dùng | `/users/:username` → `params.username` |
| Nhiều params | `/org/:orgId/repo/:repoId` → `params.orgId`, `params.repoId` |

### Code minh hoạ

```tsx
import { Routes, Route, useParams } from 'react-router-dom';

// Định nghĩa route có dynamic segment
function App() {
  return (
    <Routes>
      <Route path="/users/:userId/posts/:postId" element={<PostDetail />} />
    </Routes>
  );
}

// Component sử dụng useParams
function PostDetail() {
  // useParams trả về object { userId: string, postId: string }
  const { userId, postId } = useParams<{ userId: string; postId: string }>();

  // Lưu ý: params luôn là string, cần convert nếu cần number
  const userIdNum = Number(userId);

  if (!userId || !postId) {
    return <p>Thông tin không hợp lệ</p>;
  }

  return (
    <div>
      <h1>Bài viết #{postId}</h1>
      <p>Tác giả: User #{userId}</p>
    </div>
  );
}
```

### Đáp án mẫu

> `useParams` đọc các dynamic segment từ URL hiện tại, trả về object dạng `{ [paramName]: string }`. Dùng khi cần lấy ID hoặc slug từ URL để fetch dữ liệu. Lưu ý giá trị luôn là `string`, cần ép kiểu nếu logic yêu cầu `number`.

---

## Câu 2: `useNavigate` hook trong React Router v6 dùng như thế nào? `[Basic]`

### Câu hỏi

> `useNavigate` thay thế cho gì trong React Router v5? Cách điều hướng programmatic trong v6 như thế nào?

### Giải thích lý thuyết

Trong React Router v5, điều hướng programmatic (bằng code, không phải click link) được thực hiện qua `useHistory`. **React Router v6 thay thế `useHistory` bằng `useNavigate`** với API gọn hơn và mạnh hơn.

`useNavigate` trả về hàm `navigate` có thể:
- Điều hướng tới đường dẫn mới: `navigate('/path')`
- Điều hướng với state: `navigate('/path', { state: { ... } })`
- Điều hướng tương đối: `navigate(-1)` (quay lại), `navigate(1)` (tiến tới)
- Thay thế history entry (không tạo entry mới): `navigate('/path', { replace: true })`

| Tính năng | React Router v5 (`useHistory`) | React Router v6 (`useNavigate`) |
|---|---|---|
| Điều hướng tới path | `history.push('/path')` | `navigate('/path')` |
| Thay thế entry | `history.replace('/path')` | `navigate('/path', { replace: true })` |
| Quay lại | `history.goBack()` | `navigate(-1)` |
| Tiến tới | `history.goForward()` | `navigate(1)` |

### Code minh hoạ

```tsx
import { useNavigate } from 'react-router-dom';

interface LoginForm {
  email: string;
  password: string;
}

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async (formData: LoginForm) => {
    try {
      await loginApi(formData);

      // Điều hướng sau khi đăng nhập thành công
      // replace: true để không cho phép quay lại trang login
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Đăng nhập thất bại:', error);
    }
  };

  return (
    <div>
      <h1>Đăng nhập</h1>
      <button onClick={() => navigate(-1)}>Quay lại</button>
      {/* Form login */}
    </div>
  );
}

// Điều hướng với state để truyền dữ liệu
function ProductList() {
  const navigate = useNavigate();

  const goToDetail = (productId: string, productName: string) => {
    navigate(`/products/${productId}`, {
      state: { productName }, // state được lưu vào history
    });
  };

  return <button onClick={() => goToDetail('123', 'Laptop')}>Xem chi tiết</button>;
}

// Nhận state tại trang đích
function ProductDetail() {
  const location = useLocation();
  const state = location.state as { productName: string } | null;

  return <h1>{state?.productName ?? 'Sản phẩm'}</h1>;
}
```

### Đáp án mẫu

> `useNavigate` là phiên bản cải tiến của `useHistory` trong v6, trả về hàm `navigate(path, options)`. Dùng `navigate('/path')` để chuyển trang, `navigate(-1)` để quay lại, `navigate('/path', { replace: true })` để thay thế history entry. Thường dùng trong các xử lý sau submit form hoặc sau API call thành công.

---

## Câu 3: Nested routes (route lồng nhau) trong React Router v6 hoạt động như thế nào? `[Intermediate]`

### Câu hỏi

> Giải thích cơ chế Nested Routes trong React Router v6. `<Outlet>` đóng vai trò gì? So sánh với cách làm trong v5.

### Giải thích lý thuyết

Nested Routes là kỹ thuật cho phép **một route chứa các route con bên trong**, tạo ra layout lồng nhau. Đây là tính năng được cải thiện đáng kể trong v6.

**Cơ chế hoạt động:**
- Route cha định nghĩa layout chung (navbar, sidebar...).
- `<Outlet>` là placeholder — nơi React Router render component của route con hiện tại.
- Route con kế thừa path từ route cha (không cần lặp lại prefix).

**So sánh v5 vs v6:**

| Điểm | React Router v5 | React Router v6 |
|---|---|---|
| Định nghĩa nested route | Phải viết `<Route>` bên trong component con | Viết tập trung, khai báo `children` |
| Hiển thị route con | Gọi `{children}` hoặc `<Switch>` trong component | Dùng `<Outlet>` |
| Path của route con | Phải lặp lại prefix đầy đủ | Chỉ viết phần tương đối |
| Index route | Không có | Có `index` prop |

### Code minh hoạ

```tsx
import { Routes, Route, Outlet, NavLink } from 'react-router-dom';

// Layout component dùng Outlet
function DashboardLayout() {
  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar chung cho tất cả route con */}
      <nav>
        <NavLink to="/dashboard">Tổng quan</NavLink>
        <NavLink to="/dashboard/users">Người dùng</NavLink>
        <NavLink to="/dashboard/settings">Cài đặt</NavLink>
      </nav>

      {/* Outlet: nơi render component của route con */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}

function DashboardHome() {
  return <h1>Trang tổng quan</h1>;
}

function UsersPage() {
  return <h1>Danh sách người dùng</h1>;
}

function SettingsPage() {
  return <h1>Cài đặt</h1>;
}

// Khai báo routes tập trung
function App() {
  return (
    <Routes>
      {/* Route cha - render DashboardLayout */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* index: render khi path khớp chính xác /dashboard */}
        <Route index element={<DashboardHome />} />

        {/* Route con - path thực tế: /dashboard/users */}
        <Route path="users" element={<UsersPage />} />

        {/* Route con lồng sâu hơn - path thực tế: /dashboard/users/:userId */}
        <Route path="users/:userId" element={<UserDetail />} />

        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

function UserDetail() {
  const { userId } = useParams<{ userId: string }>();
  return <h2>Chi tiết người dùng #{userId}</h2>;
}
```

### Đáp án mẫu

> Nested Routes trong v6 cho phép khai báo route con bên trong route cha. Component cha dùng `<Outlet>` làm placeholder để React Router render component con tương ứng. Index route (prop `index`) được render khi path khớp chính xác với route cha. So với v5, v6 giúp tổ chức route tập trung, rõ ràng hơn và không cần lặp lại prefix path.

---

## Câu 4: Protected routes (route cần đăng nhập) được implement như thế nào? `[Intermediate]`

### Câu hỏi

> Làm thế nào để bảo vệ một số route chỉ cho phép người dùng đã đăng nhập truy cập trong React Router v6?

### Giải thích lý thuyết

Protected Routes (còn gọi là Private Routes hay Auth Guards) là pattern ngăn người dùng chưa xác thực truy cập các trang yêu cầu đăng nhập. Trong React Router v6, cách implement phổ biến nhất là tạo **wrapper component** sử dụng `<Navigate>` để redirect.

**Các bước:**
1. Kiểm tra trạng thái đăng nhập (từ context, store, hoặc token trong localStorage).
2. Nếu chưa đăng nhập: redirect về trang login, **kèm theo URL hiện tại** trong `state` để sau khi login xong có thể quay lại.
3. Nếu đã đăng nhập: render `<Outlet>` (hoặc `{children}`) cho phép truy cập.

**Lưu ý bảo mật:** Protected Routes chỉ là UX guard — không phải bảo mật thực sự. Bảo mật thật phải được thực hiện ở phía backend (kiểm tra token tại mỗi API request).

### Code minh hoạ

```tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// Hook giả lập kiểm tra auth (thực tế lấy từ AuthContext/Redux)
function useAuth() {
  const token = localStorage.getItem('authToken');
  return { isAuthenticated: Boolean(token) };
}

// Wrapper component bảo vệ route
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect về login, lưu lại URL hiện tại vào state
    // để sau khi login có thể quay lại đúng trang
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Đã đăng nhập: render route con thông qua Outlet
  return <Outlet />;
}

// Wrapper cho route chỉ dành cho Admin
function AdminRoute() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

// Sử dụng trong cấu hình routes
function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes - bọc trong ProtectedRoute */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Admin-only routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}

// Trang Login - redirect về trang trước sau khi đăng nhập
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';

  const handleLogin = async () => {
    await loginApi();
    // Quay lại trang người dùng muốn truy cập
    navigate(from, { replace: true });
  };

  return <button onClick={handleLogin}>Đăng nhập</button>;
}
```

### Đáp án mẫu

> Protected Routes được implement bằng wrapper component kiểm tra trạng thái auth. Nếu chưa đăng nhập, dùng `<Navigate to="/login" state={{ from: location }} replace />` để redirect và lưu URL gốc. Nếu đã đăng nhập, render `<Outlet>` cho phép truy cập. Sau khi login thành công, dùng `navigate(from, { replace: true })` để quay lại đúng trang người dùng muốn vào.

---

## Câu 5: React Router `SearchParams` (query string) được xử lý như thế nào? `[Intermediate]`

### Câu hỏi

> Làm thế nào để đọc và cập nhật query string (ví dụ `?page=2&search=react`) trong React Router v6?

### Giải thích lý thuyết

Query string (search params) là phần sau dấu `?` trong URL, thường dùng cho **bộ lọc, phân trang, tìm kiếm** — các trạng thái có thể bookmark/share được. React Router v6 cung cấp hook `useSearchParams` tương tự `useState` nhưng đồng bộ với URL.

**Đặc điểm của `useSearchParams`:**
- Trả về `[searchParams, setSearchParams]` — API giống `useState`.
- `searchParams` là instance của `URLSearchParams` Web API.
- `setSearchParams` cập nhật URL mà không reload trang.
- Khi gọi `setSearchParams`, **toàn bộ query string bị thay thế** — cần merge thủ công nếu muốn giữ các param khác.

| Tình huống | Cách xử lý |
|---|---|
| Đọc một param | `searchParams.get('page')` |
| Đọc nhiều giá trị cùng key | `searchParams.getAll('tag')` |
| Kiểm tra param tồn tại | `searchParams.has('sort')` |
| Cập nhật một param, giữ các param khác | Spread params hiện tại trước khi set |

### Code minh hoạ

```tsx
import { useSearchParams } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  category: string;
}

function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc các param từ URL
  const page = Number(searchParams.get('page') ?? '1');
  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';

  // Cập nhật search, giữ nguyên các param khác
  const handleSearchChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev); // clone params hiện tại
      if (value) {
        next.set('search', value);
      } else {
        next.delete('search');
      }
      next.set('page', '1'); // reset về trang 1 khi search
      return next;
    });
  };

  // Thay đổi trang
  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
  };

  // Lọc theo category
  const handleCategoryChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set('category', value);
      } else {
        next.delete('category');
      }
      next.set('page', '1');
      return next;
    });
  };

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Tìm kiếm sản phẩm..."
      />

      <select value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
        <option value="">Tất cả danh mục</option>
        <option value="laptop">Laptop</option>
        <option value="phone">Điện thoại</option>
      </select>

      <p>
        Trang {page} | Tìm kiếm: "{search}" | Danh mục: {category || 'Tất cả'}
      </p>

      <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
        Trang trước
      </button>
      <button onClick={() => handlePageChange(page + 1)}>Trang sau</button>
    </div>
  );
}
```

### Đáp án mẫu

> `useSearchParams` là hook đọc và cập nhật query string trong URL, hoạt động như `useState` nhưng đồng bộ với URL. Đọc giá trị qua `searchParams.get('key')`. Khi cập nhật, nên dùng callback `setSearchParams(prev => ...)` và clone `URLSearchParams` để giữ các param không liên quan. Đây là cách chuẩn để quản lý trạng thái filter, search, pagination có thể bookmark được.

---

## Câu 6: Data loading với React Router v6.4+ `loader` functions là gì? `[Advanced]`

### Câu hỏi

> React Router v6.4+ giới thiệu `loader` functions. Đây là gì, hoạt động như thế nào và lợi ích so với fetch data trong `useEffect`?

### Giải thích lý thuyết

React Router v6.4 giới thiệu **Data APIs** — một paradigm mới cho phép định nghĩa logic fetch dữ liệu trực tiếp trong cấu hình route thông qua hàm `loader`. Điều này thay đổi hoàn toàn cách fetch data truyền thống dùng `useEffect`.

**Cách hoạt động:**
1. Khi người dùng điều hướng tới một route, React Router **gọi `loader` trước khi render component**.
2. `loader` fetch dữ liệu và return kết quả.
3. Component nhận dữ liệu qua hook `useLoaderData` — đã sẵn sàng, không cần xử lý loading state thủ công.
4. Cần dùng `createBrowserRouter` (thay vì `<BrowserRouter>`) để kích hoạt Data APIs.

**So sánh hai cách:**

| Tiêu chí | `useEffect` + `useState` | `loader` function |
|---|---|---|
| Thời điểm fetch | Sau khi component mount | Trước khi component render |
| Loading state | Tự quản lý thủ công | React Router xử lý tự động |
| Waterfall fetch | Dễ xảy ra với nested components | Các loader chạy song song |
| Code splitting | Phức tạp hơn | Tích hợp sẵn với `lazy()` |
| Error handling | Try/catch trong useEffect | `errorElement` trong route config |
| Race condition | Cần xử lý thủ công | React Router xử lý tự động |

### Code minh hoạ

```tsx
import {
  createBrowserRouter,
  RouterProvider,
  useLoaderData,
  useNavigation,
  LoaderFunctionArgs,
} from 'react-router-dom';

// Định nghĩa kiểu dữ liệu
interface User {
  id: string;
  name: string;
  email: string;
}

interface Post {
  id: string;
  title: string;
  body: string;
  userId: string;
}

// Loader function: chạy trước khi component render
async function userLoader({ params }: LoaderFunctionArgs): Promise<User> {
  const response = await fetch(`/api/users/${params.userId}`);

  if (!response.ok) {
    // Ném lỗi để React Router bắt và hiển thị errorElement
    throw new Response('Không tìm thấy người dùng', { status: 404 });
  }

  return response.json();
}

// Loader cho trang danh sách - fetch nhiều nguồn song song
async function dashboardLoader(): Promise<{ users: User[]; posts: Post[] }> {
  // Promise.all: fetch song song, không waterfall
  const [usersRes, postsRes] = await Promise.all([
    fetch('/api/users'),
    fetch('/api/posts'),
  ]);

  const [users, posts] = await Promise.all([usersRes.json(), postsRes.json()]);

  return { users, posts };
}

// Component sử dụng useLoaderData - không cần loading state
function UserDetail() {
  // Dữ liệu đã có sẵn, đã được typed đúng kiểu
  const user = useLoaderData() as User;
  const navigation = useNavigation();

  // navigation.state: 'idle' | 'loading' | 'submitting'
  const isLoading = navigation.state === 'loading';

  return (
    <div style={{ opacity: isLoading ? 0.5 : 1 }}>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

function Dashboard() {
  const { users, posts } = useLoaderData() as { users: User[]; posts: Post[] };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Tổng người dùng: {users.length}</p>
      <p>Tổng bài viết: {posts.length}</p>
    </div>
  );
}

// Error component khi loader throw lỗi
function ErrorPage() {
  return <h1>Đã xảy ra lỗi! Không tìm thấy trang.</h1>;
}

// Cấu hình router với Data APIs (phải dùng createBrowserRouter)
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
        loader: dashboardLoader, // Gắn loader vào route
      },
      {
        path: 'users/:userId',
        element: <UserDetail />,
        loader: userLoader,
        errorElement: <ErrorPage />, // Error boundary riêng cho route này
      },
    ],
  },
]);

// Sử dụng RouterProvider thay vì BrowserRouter
function Root() {
  return <RouterProvider router={router} />;
}
```

### Đáp án mẫu

> `loader` functions trong React Router v6.4+ cho phép fetch data **trước khi component render**, loại bỏ pattern `useEffect` + loading state thủ công. Loader chạy song song cho các nested routes (không waterfall), React Router tự xử lý race condition và error handling qua `errorElement`. Component nhận data đã sẵn sàng qua `useLoaderData`. Yêu cầu dùng `createBrowserRouter` thay vì `<BrowserRouter>`. Đây là cách tiếp cận hiện đại, tách biệt rõ data fetching logic ra khỏi UI component.

---
