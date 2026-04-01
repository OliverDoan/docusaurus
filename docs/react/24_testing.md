---
sidebar_position: 24
title: "Testing"
---

# Testing React Components

## Công cụ

| Công cụ | Vai trò |
|---------|---------|
| **Vitest** / **Jest** | Test runner |
| **React Testing Library** | Render và query components |
| **@testing-library/user-event** | Simulate user interactions |
| **MSW (Mock Service Worker)** | Mock API calls |

## Setup (Vitest + React Testing Library)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
});
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom';
```

## Nguyên tắc Testing Library

> Test hành vi, không test implementation details.

- Query theo cách **user** thấy: text, role, label
- **Không** test state nội bộ, lifecycle, hay tên class
- **Không** dùng `querySelector` hay test CSS classes

### Thứ tự ưu tiên query

1. `getByRole` — accessible role (button, textbox, heading)
2. `getByLabelText` — form elements qua label
3. `getByPlaceholderText` — input placeholder
4. `getByText` — text content hiển thị
5. `getByTestId` — cuối cùng, khi không có cách nào khác

## Ví dụ: Test component đơn giản

```tsx
// UserCard.tsx
function UserCard({ name, email }: { name: string; email: string }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
}

// UserCard.test.tsx
import { render, screen } from '@testing-library/react';

test('renders user name and email', () => {
  render(<UserCard name="Alice" email="alice@test.com" />);

  expect(screen.getByRole('heading', { name: 'Alice' })).toBeInTheDocument();
  expect(screen.getByText('alice@test.com')).toBeInTheDocument();
});
```

## Test interactions

```tsx
// Counter.tsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

// Counter.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('increments counter on button click', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  expect(screen.getByText('Count: 0')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Increment' }));
  expect(screen.getByText('Count: 1')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Increment' }));
  expect(screen.getByText('Count: 2')).toBeInTheDocument();
});

test('resets counter', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  await user.click(screen.getByRole('button', { name: 'Increment' }));
  await user.click(screen.getByRole('button', { name: 'Increment' }));
  await user.click(screen.getByRole('button', { name: 'Reset' }));

  expect(screen.getByText('Count: 0')).toBeInTheDocument();
});
```

## Test form

```tsx
// LoginForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('submits form with email and password', async () => {
  const user = userEvent.setup();
  const handleSubmit = vi.fn();

  render(<LoginForm onSubmit={handleSubmit} />);

  await user.type(screen.getByLabelText('Email'), 'alice@test.com');
  await user.type(screen.getByLabelText('Password'), 'password123');
  await user.click(screen.getByRole('button', { name: 'Login' }));

  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'alice@test.com',
    password: 'password123',
  });
});

test('shows validation error for empty email', async () => {
  const user = userEvent.setup();
  render(<LoginForm onSubmit={vi.fn()} />);

  await user.click(screen.getByRole('button', { name: 'Login' }));

  expect(screen.getByText('Email is required')).toBeInTheDocument();
});
```

## Test async (API calls)

### Với MSW (Mock Service Worker)

```tsx
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ]);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('loads and displays users', async () => {
  render(<UserList />);

  // Đợi loading xong
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // waitFor: đợi cho đến khi assertion pass
  await screen.findByText('Alice');
  expect(screen.getByText('Bob')).toBeInTheDocument();
});

test('shows error when API fails', async () => {
  server.use(
    http.get('/api/users', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  render(<UserList />);

  await screen.findByText(/error/i);
});
```

## Test hooks

```tsx
import { renderHook, act } from '@testing-library/react';

test('useCounter increments', () => {
  const { result } = renderHook(() => useCounter(0));

  expect(result.current.count).toBe(0);

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});

test('useDebounce delays value update', async () => {
  vi.useFakeTimers();

  const { result, rerender } = renderHook(
    ({ value }) => useDebounce(value, 300),
    { initialProps: { value: 'hello' } }
  );

  expect(result.current).toBe('hello');

  rerender({ value: 'world' });
  expect(result.current).toBe('hello'); // Chưa thay đổi

  act(() => {
    vi.advanceTimersByTime(300);
  });
  expect(result.current).toBe('world'); // Thay đổi sau delay

  vi.useRealTimers();
});
```

## Các pattern test phổ biến

### Test conditional rendering

```tsx
test('shows admin panel for admin users', () => {
  render(<Dashboard user={{ role: 'admin' }} />);
  expect(screen.getByText('Admin Panel')).toBeInTheDocument();
});

test('hides admin panel for regular users', () => {
  render(<Dashboard user={{ role: 'user' }} />);
  expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
});
```

### Test với Context

```tsx
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </ThemeProvider>
  );
}

test('shows user name from auth context', () => {
  renderWithProviders(<UserMenu />);
  expect(screen.getByText('Alice')).toBeInTheDocument();
});
```

### Snapshot testing (dùng hạn chế)

```tsx
test('matches snapshot', () => {
  const { container } = render(<UserCard name="Alice" />);
  expect(container).toMatchSnapshot();
});
// Cẩn thận: snapshot dễ vỡ, khó review, ít giá trị
// Ưu tiên test hành vi hơn snapshot
```

## Checklist test React

- [ ] Render với props khác nhau
- [ ] User interactions (click, type, submit)
- [ ] Conditional rendering (show/hide elements)
- [ ] Loading, error, empty states
- [ ] Form validation
- [ ] API calls (success + error)
- [ ] Accessibility (roles, labels)
