---
sidebar_position: 5
title: "Error Boundaries"
---

# Error Boundaries

## Vấn đề

Khi một component throw error trong quá trình render, **toàn bộ React app** crash và hiển thị màn hình trắng. Error Boundary bắt lỗi và hiển thị fallback UI.

## Error Boundary là gì?

Error Boundary là component bắt JavaScript errors trong **child component tree** (render, lifecycle, constructor) và hiển thị fallback UI thay vì crash cả app.

> Error Boundary chỉ viết được bằng **class component** — chưa có hook tương đương.

```tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Sử dụng

```tsx
function App() {
  return (
    <ErrorBoundary fallback={<p>App error. Please refresh.</p>}>
      <Header />
      <ErrorBoundary fallback={<p>Failed to load content.</p>}>
        <MainContent />
      </ErrorBoundary>
      <ErrorBoundary fallback={<p>Sidebar unavailable.</p>}>
        <Sidebar />
      </ErrorBoundary>
    </ErrorBoundary>
  );
}
```

### Chiến lược đặt Error Boundary

- **Root level** — fallback toàn app
- **Route level** — mỗi trang có boundary riêng
- **Feature level** — widget/section độc lập
- **Component level** — component không ổn định (3rd party)

## react-error-boundary (thư viện)

Thay vì viết class component, dùng thư viện `react-error-boundary`:

```bash
npm install react-error-boundary
```

```tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        // Log to error tracking service
        logErrorToService(error, info);
      }}
      onReset={() => {
        // Reset app state khi user nhấn "Try again"
      }}
    >
      <AppContent />
    </ErrorBoundary>
  );
}
```

## Error Boundary KHÔNG bắt

- Event handlers (dùng try/catch thường)
- Async code (setTimeout, fetch — dùng try/catch)
- Server-side rendering
- Errors trong chính Error Boundary

```tsx
// Event handler errors — dùng try/catch
function Button() {
  const handleClick = () => {
    try {
      riskyOperation();
    } catch (error) {
      // Handle error
      setError(error.message);
    }
  };

  return <button onClick={handleClick}>Click</button>;
}

// Async errors — dùng try/catch
useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await fetch('/api/data');
    } catch (error) {
      setError(error.message);
    }
  };
  fetchData();
}, []);
```

## Kết hợp với Suspense

```tsx
function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Suspense fallback={<Spinner />}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
// Nếu lazy load fail → ErrorBoundary bắt
// Nếu đang load → Suspense hiển thị Spinner
```

---

## Câu hỏi phỏng vấn

### Câu 1: Error Boundary là gì và tại sao cần?
**Đáp án:**

Error Boundary là React component bắt **JavaScript errors trong child component tree** (render, lifecycle, constructor) và hiển thị **fallback UI** thay vì để toàn bộ app crash (màn hình trắng).

```tsx
class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null };

  // Cập nhật state khi có lỗi → render fallback
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  // Log lỗi ra monitoring service
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h2>Something went wrong</h2>;
    }
    return this.props.children;
  }
}

// Sử dụng
<ErrorBoundary fallback={<p>Error occurred</p>}>
  <MyComponent />
</ErrorBoundary>
```

**Tại sao cần:** Không có Error Boundary, một lỗi nhỏ trong bất kỳ component nào sẽ crash **toàn bộ app**. Error Boundary giới hạn phạm vi ảnh hưởng, chỉ phần bị lỗi hiển thị fallback, phần còn lại hoạt động bình thường.

### Câu 2: Error Boundary KHÔNG bắt được những lỗi nào?
**Đáp án:**

Error Boundary **KHÔNG** bắt được 4 loại lỗi:

1. **Event handlers** — lỗi trong onClick, onChange, etc.
2. **Async code** — setTimeout, fetch, Promise.
3. **Server-side rendering** (SSR).
4. **Errors trong chính Error Boundary** (lỗi ở boundary component).

```tsx
// ❌ Error Boundary KHÔNG bắt lỗi event handler
function Button() {
  const handleClick = () => {
    throw new Error('Click error'); // Error Boundary KHÔNG bắt
  };
  return <button onClick={handleClick}>Click</button>;
}

// ✅ Dùng try/catch cho event handler
function Button() {
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    try {
      riskyOperation();
    } catch (err) {
      setError(err.message);
    }
  };

  return error ? <p>{error}</p> : <button onClick={handleClick}>Click</button>;
}

// ✅ Dùng try/catch cho async code
useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await fetch('/api/data');
    } catch (err) {
      setError(err.message);
    }
  };
  fetchData();
}, []);
```

### Câu 3: Chiến lược đặt Error Boundary trong app?
**Đáp án:**

Đặt Error Boundary theo nhiều tầng, từ tổng quát đến chi tiết:

```tsx
function App() {
  return (
    // Tầng 1: Root level — fallback toàn app (trang lỗi chung)
    <ErrorBoundary fallback={<FullPageError />}>
      <Header />

      {/* Tầng 2: Route level — mỗi trang có boundary riêng */}
      <ErrorBoundary fallback={<PageError />}>
        <Routes>
          <Route path="/dashboard" element={
            // Tầng 3: Feature level — widget/section độc lập
            <ErrorBoundary fallback={<p>Dashboard error</p>}>
              <Dashboard />
            </ErrorBoundary>
          } />
        </Routes>
      </ErrorBoundary>

      {/* Tầng 3: Component level — 3rd party không ổn định */}
      <ErrorBoundary fallback={<p>Sidebar unavailable</p>}>
        <ThirdPartySidebar />
      </ErrorBoundary>
    </ErrorBoundary>
  );
}
```

**Nguyên tắc:**
- **Root level**: bắt mọi lỗi không được handle, hiện trang lỗi toàn app.
- **Route level**: lỗi một trang không ảnh hưởng navbar/sidebar.
- **Feature level**: widget lỗi không crash toàn trang.
- **Component level**: wrap 3rd party hoặc component không ổn định.
