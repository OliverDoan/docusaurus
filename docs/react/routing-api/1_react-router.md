---
sidebar_position: 1
title: "1. React Router"
---

# React Router

## Cài đặt

```bash
npm install react-router-dom
```

## Setup cơ bản

```tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/products">Products</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Dynamic Routes (URL Params)

```tsx
// Route definition
<Route path="/users/:userId" element={<UserProfile />} />

// Component — lấy params
import { useParams } from 'react-router-dom';

function UserProfile() {
  const { userId } = useParams<{ userId: string }>();

  return <div>User ID: {userId}</div>;
}

// Link
<Link to={`/users/${user.id}`}>{user.name}</Link>
```

## Nested Routes

```tsx
function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

// Layout component — dùng Outlet để render child routes
import { Outlet, NavLink } from 'react-router-dom';

function DashboardLayout() {
  return (
    <div className="dashboard">
      <aside>
        <NavLink to="/dashboard" end>Home</NavLink>
        <NavLink to="/dashboard/settings">Settings</NavLink>
        <NavLink to="/dashboard/profile">Profile</NavLink>
      </aside>
      <main>
        <Outlet /> {/* Child route render ở đây */}
      </main>
    </div>
  );
}
```

### NavLink

`NavLink` tự thêm class `active` khi route match:

```tsx
<NavLink
  to="/about"
  className={({ isActive }) => isActive ? 'nav-active' : ''}
>
  About
</NavLink>
```

## Programmatic Navigation

```tsx
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(credentials);

    // Navigate sau khi login thành công
    navigate('/dashboard');

    // Thay thế history (không back được)
    navigate('/dashboard', { replace: true });

    // Quay lại trang trước
    navigate(-1);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Query Parameters

```tsx
import { useSearchParams } from 'react-router-dom';

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || 'all';
  const page = Number(searchParams.get('page')) || 1;

  // URL: /products?category=electronics&page=2

  const handleFilter = (category: string) => {
    setSearchParams({ category, page: '1' });
  };

  return (
    <div>
      <p>Category: {category}, Page: {page}</p>
      <button onClick={() => handleFilter('electronics')}>Electronics</button>
    </div>
  );
}
```

## Protected Routes

```tsx
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Sử dụng
<Routes>
  <Route path="/login" element={<Login />} />

  {/* Các route cần auth */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/settings" element={<Settings />} />
  </Route>
</Routes>
```

## useLocation

```tsx
import { useLocation } from 'react-router-dom';

function Breadcrumb() {
  const location = useLocation();
  // location.pathname: "/dashboard/settings"
  // location.search: "?tab=general"
  // location.state: data passed via navigate

  return <p>Current: {location.pathname}</p>;
}
```

## Passing state qua navigation

```tsx
// Gửi state
navigate('/checkout', { state: { cartItems, total } });
<Link to="/checkout" state={{ cartItems, total }}>Checkout</Link>

// Nhận state
function Checkout() {
  const location = useLocation();
  const { cartItems, total } = location.state || {};

  return <div>Total: {total}</div>;
}
```

## Lazy Loading Routes

```tsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

---

## Cau hoi phong van

### Cau 1: SPA routing khac gi so voi truyen thong (MPA)?

**Dap an:**

Trong **MPA (Multi-Page Application)**, moi lan nguoi dung click link, trinh duyet gui request len server va tai lai toan bo trang HTML moi. Dieu nay gay ra hien tuong "nhap nhay" va mat thoi gian tai lai CSS, JS, hinh anh.

Trong **SPA (Single-Page Application)**, chi tai HTML mot lan duy nhat. Khi chuyen trang, JavaScript thay doi URL tren thanh dia chi (dung History API) va render lai component tuong ung ma **khong reload trang**.

```tsx
// SPA: React Router xu ly routing phia client
// Khi user click Link, chi re-render component — khong tai lai trang
<BrowserRouter>
  <Link to="/about">About</Link>  {/* Khong gui request len server */}

  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
  </Routes>
</BrowserRouter>

// MPA: Moi link la mot request HTTP moi
// <a href="/about">About</a>  → Server tra ve trang HTML moi hoan toan
```

**So sanh:**

| | MPA | SPA |
|---|---|---|
| Chuyen trang | Reload toan bo trang | Chi re-render component |
| Toc do | Cham (tai lai HTML/CSS/JS) | Nhanh (chi fetch data) |
| SEO | Tot (server-rendered) | Can SSR/SSG ho tro |
| UX | Nhap nhay khi chuyen trang | Muot ma, nhu ung dung native |

### Cau 2: Nested routes va Outlet hoat dong the nao?

**Dap an:**

**Nested routes** cho phep dinh nghia route con nam ben trong route cha. Route cha cung cap layout chung (sidebar, header), con `<Outlet />` la vi tri ma route con se duoc render vao.

```tsx
// Dinh nghia nested routes
<Routes>
  <Route path="/dashboard" element={<DashboardLayout />}>
    {/* index route: render khi truy cap /dashboard */}
    <Route index element={<DashboardHome />} />
    {/* /dashboard/settings */}
    <Route path="settings" element={<Settings />} />
    {/* /dashboard/profile */}
    <Route path="profile" element={<Profile />} />
  </Route>
</Routes>

// DashboardLayout — layout chung cho moi route con
function DashboardLayout() {
  return (
    <div className="dashboard">
      <aside>
        <NavLink to="/dashboard" end>Home</NavLink>
        <NavLink to="/dashboard/settings">Settings</NavLink>
      </aside>
      <main>
        {/* Outlet = noi route con duoc render */}
        <Outlet />
      </main>
    </div>
  );
}

// Khi truy cap /dashboard/settings:
// → DashboardLayout render truoc (sidebar + header)
// → <Outlet /> duoc thay the bang <Settings />
```

**Co che hoat dong:**
1. React Router match URL voi route tree tu ngoai vao trong.
2. Route cha render truoc, cung cap layout.
3. `<Outlet />` la "placeholder" — React Router tu dong render route con match vao vi tri nay.
4. Keyword `index` chi dinh route mac dinh khi truy cap dung path cha.

### Cau 3: Protected routes trien khai ra sao?

**Dap an:**

Protected routes ngan nguoi dung chua dang nhap truy cap vao cac trang can xac thuc. Pattern pho bien la tao mot **wrapper component** kiem tra trang thai auth, neu chua login thi redirect ve trang login.

```tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// Hook kiem tra auth (vi du don gian)
function useAuth() {
  const token = localStorage.getItem('token');
  return { isAuthenticated: !!token };
}

// Protected Route wrapper
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // redirect ve /login, luu lai trang nguoi dung muon truy cap
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Neu da login, render route con qua Outlet
  return <Outlet />;
}

// Su dung trong route config
function App() {
  return (
    <Routes>
      {/* Route cong khai */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />

      {/* Route can auth — boc trong ProtectedRoute */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

// Trang Login — redirect ve trang truoc sau khi login thanh cong
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleLogin = async () => {
    await loginAPI(credentials);
    navigate(from, { replace: true }); // Quay lai trang truoc
  };

  return <form onSubmit={handleLogin}>...</form>;
}
```

### Cau 4: Lazy loading routes giup gi cho performance?

**Dap an:**

Mac dinh, tat ca component duoc bundle vao mot file JS duy nhat. Voi ung dung lon, file nay co the rat nang (vai MB), khien trang tai cham lan dau.

**Lazy loading** chia code thanh nhieu file nho (code splitting). Moi route chi tai code khi nguoi dung thuc su truy cap, giam dang ke thoi gian tai ban dau.

```tsx
import { lazy, Suspense } from 'react';

// KHONG lazy: Tat ca import ngay tu dau
// import Dashboard from './pages/Dashboard';  // 200KB
// import Settings from './pages/Settings';    // 150KB
// import Analytics from './pages/Analytics';  // 300KB
// → Tong: 650KB tai ngay lap tuc

// CO lazy: Chi tai khi can
const Dashboard = lazy(() => import('./pages/Dashboard'));   // Tai khi vao /dashboard
const Settings = lazy(() => import('./pages/Settings'));     // Tai khi vao /settings
const Analytics = lazy(() => import('./pages/Analytics'));   // Tai khi vao /analytics

function App() {
  return (
    <BrowserRouter>
      {/* Suspense hien thi fallback trong luc tai component */}
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />  {/* Home tai ngay */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// Ket qua:
// - Lan dau tai trang: chi tai Home (~50KB)
// - Vao /dashboard: tai them Dashboard chunk (~200KB)
// - Vao /analytics: tai them Analytics chunk (~300KB)
// → User khong phai doi tai 650KB ngay tu dau!
```

**Loi ich:**
- **Giam initial bundle size** — trang tai nhanh hon.
- **Tai theo nhu cau** — chi tai code khi nguoi dung can.
- **Suspense** hien thi loading indicator trong luc tai chunk.

### Cau 5: useNavigate vs Link khac nhau the nao?

**Dap an:**

Ca hai deu dung de chuyen trang, nhung khac nhau ve cach su dung va thoi diem thuc thi.

| | `<Link>` | `useNavigate` |
|---|---|---|
| Loai | Component (JSX) | Hook (tra ve ham) |
| Dung trong | Template/JSX | Logic/event handler |
| Render | The `<a>` tren UI | Khong render gi |
| Khi nao | User click truc tiep | Sau khi xu ly logic xong |

```tsx
import { Link, useNavigate } from 'react-router-dom';

function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();

  // === Link: Dung khi muon user click truc tiep ===
  // Render the <a>, ho tro accessibility (keyboard, screen reader)
  return (
    <div>
      <Link to={`/products/${product.id}`}>
        {product.name}
      </Link>

      {/* === useNavigate: Dung khi can xu ly logic truoc khi chuyen trang === */}
      <button onClick={async () => {
        await addToCart(product.id);    // Xu ly logic truoc
        navigate('/cart');              // Roi moi chuyen trang
      }}>
        Add to Cart
      </button>

      {/* useNavigate voi options */}
      <button onClick={() => {
        navigate('/checkout', {
          replace: true,                // Thay the history entry (khong back duoc)
          state: { productId: product.id },  // Truyen data
        });
      }}>
        Buy Now
      </button>

      {/* Quay lai trang truoc */}
      <button onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  );
}
```

**Nguyen tac chon:**
- **`<Link>`**: Khi hien thi mot duong link tren UI de user click. Uu tien dung `Link` vi ho tro accessibility tot (right-click, Ctrl+Click mo tab moi).
- **`useNavigate`**: Khi can chuyen trang **sau khi thuc hien logic** (submit form, login, them vao gio hang) hoac dieu huong co dieu kien.
