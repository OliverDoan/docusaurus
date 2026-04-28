---
sidebar_position: 5
title: "5. Code Splitting & Lazy Loading"
---

# Code Splitting & Lazy Loading


---

## Mục lục

- [Code Splitting là gì?](#code-splitting-là-gì)
- [Lazy Loading — React.lazy()](#lazy-loading--reactlazy)
- [Suspense — Boundary loading](#suspense--boundary-loading)
- [Dynamic imports](#dynamic-imports)
- [Route-based Code Splitting](#route-based-code-splitting)
- [Bundle Analysis](#bundle-analysis)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Code Splitting là gì?

**Code splitting** chia **1 big bundle** thành **nhiều small chunks**, load **on-demand** (chỉ khi cần).

```
Trước (1 bundle):
bundle.js (2MB) — chứa tất cả code

Sau code splitting:
main.js (500KB)
admin.js (600KB) — load chỉ khi user vào /admin
dashboard.js (500KB) — load chỉ khi user vào /dashboard
```

**Lợi ích:**
- ✅ Smaller initial bundle → faster first load
- ✅ Lazy load code → faster page transitions
- ✅ User chỉ download cần thiết

---

## Lazy Loading — React.lazy()

`React.lazy()` lazy load component **dùng dynamic import**.

```javascript
import React, { lazy, Suspense } from 'react';

// Lazy load component
const AdminPanel = lazy(() => import('./AdminPanel'));
const Dashboard = lazy(() => import('./Dashboard'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
}

// Khi user navigate /admin → AdminPanel.js download + load
// Khi user navigate /dashboard → Dashboard.js download + load
```

---

## Suspense — Boundary loading

`Suspense` display **fallback UI** khi lazy component loading.

```javascript
function App() {
  return (
    <div>
      <Header /> {/* always render */}

      <Suspense fallback={<Skeleton />}>
        <AdminPanel />
      </Suspense>

      <Footer /> {/* always render */}
    </div>
  );
}

// User thấy: Header + Skeleton + Footer
// Khi AdminPanel load xong → replace Skeleton
```

---

## Dynamic imports

**Dynamic imports** load module **conditionally**.

```javascript
// Import on-demand
async function handleClickAdmin() {
  const { AdminModule } = await import('./admin');
  AdminModule.init();
}

// Webpack automatically splits into chunk
// admin.js only downloaded khi user click
```

---

## Route-based Code Splitting

Most common pattern — **split per route**.

```javascript
import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/contact', element: <Contact /> }
]);

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

// Each route = separate chunk
// User only downloads cần thiết
```

---

## Bundle Analysis

**Analyze bundle** để identify opportunities.

```bash
# Install webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer

# webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
};

# npm run build
# → Interactive visualization: xem cái gì lớn nhất

# Identify large libraries → split hoặc remove
```

---

## Câu hỏi phỏng vấn

### Câu 1: Code splitting là gì? Lợi ích?

**Đáp án:** Code splitting chia big bundle → multiple smaller chunks, load on-demand. Lợi ích: (1) Faster initial load (small main bundle), (2) Lazy load code (faster transitions), (3) Better resource utilization (download only what user needs).

### Câu 2: React.lazy() hoạt động thế nào?

**Đáp án:** React.lazy() nhận dynamic import, return lazy component. Khi component được render, JS chunk download + load. Phải wrap bằng Suspense để handle loading state.

### Câu 3: Khi nào split code?

**Đáp án:** (1) Per route — most common, (2) Per feature (modals, tabs), (3) Large libraries — defer until needed. Use webpack-bundle-analyzer để identify opportunities.
