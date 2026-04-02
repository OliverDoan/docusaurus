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
