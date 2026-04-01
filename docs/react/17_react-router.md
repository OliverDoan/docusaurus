---
sidebar_position: 17
title: "React Router"
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
