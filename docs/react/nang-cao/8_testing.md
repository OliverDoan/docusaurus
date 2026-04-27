---
sidebar_position: 8
title: "8. Testing"
---

# Testing React Components


---

## Mục lục

- [Công cụ](#công-cụ)
- [Setup (Vitest + React Testing Library)](#setup-vitest-react-testing-library)
- [Nguyên tắc Testing Library](#nguyên-tắc-testing-library)
- [Ví dụ: Test component đơn giản](#ví-dụ-test-component-đơn-giản)
- [Test interactions](#test-interactions)
- [Test form](#test-form)
- [Test async (API calls)](#test-async-api-calls)
- [Test hooks](#test-hooks)
- [Các pattern test phổ biến](#các-pattern-test-phổ-biến)
- [Checklist test React](#checklist-test-react)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

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

---

## Câu hỏi phỏng vấn

### Câu 1: React Testing Library khuyến khích test theo cách nào?
**Đáp án:**

React Testing Library khuyến khích **test hành vi (behavior)** từ góc nhìn user, **không test implementation details** (state nội bộ, lifecycle, class names):

```tsx
// ❌ Test implementation details
test('sets isOpen state to true', () => {
  const { result } = renderHook(() => useModal());
  act(() => result.current.open());
  expect(result.current.isOpen).toBe(true); // Test state nội bộ
});

// ❌ Test DOM structure / CSS classes
test('has correct class', () => {
  const { container } = render(<Button />);
  expect(container.querySelector('.btn-primary')).toBeTruthy(); // Test class name
});

// ✅ Test hành vi — giống cách user tương tác
test('opens modal when button is clicked', async () => {
  const user = userEvent.setup();
  render(<ModalButton />);

  // User thấy gì? → button "Open"
  await user.click(screen.getByRole('button', { name: 'Open' }));

  // User thấy gì sau khi click? → modal content hiển thị
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('Modal Content')).toBeVisible();
});
```

**Nguyên tắc:** "The more your tests resemble the way your software is used, the more confidence they can give you."

### Câu 2: getByRole vs getByTestId: ưu tiên cái nào?
**Đáp án:**

**Luôn ưu tiên getByRole** vì nó phản ánh cách user (và assistive technology) thấy component. `getByTestId` chỉ là phương án cuối cùng:

```tsx
// Thứ tự ưu tiên (từ cao → thấp):
// 1. getByRole — accessible role
screen.getByRole('button', { name: 'Submit' });
screen.getByRole('heading', { level: 2 });
screen.getByRole('textbox', { name: 'Email' });

// 2. getByLabelText — form elements qua label
screen.getByLabelText('Email');

// 3. getByPlaceholderText — input placeholder
screen.getByPlaceholderText('Enter email...');

// 4. getByText — visible text content
screen.getByText('Welcome back!');

// 5. getByTestId — CUỐI CÙNG, khi không có cách nào khác
screen.getByTestId('custom-dropdown');
// Cần thêm data-testid vào HTML → không phản ánh user experience
```

**Tại sao getByRole tốt hơn:**
- Đảm bảo component **accessible** (screen reader đọc được).
- Test phản ánh cách user thực sự tìm element.
- Không phụ thuộc vào implementation (class name, test id có thể thay đổi).

### Câu 3: MSW (Mock Service Worker) là gì?
**Đáp án:**

MSW (Mock Service Worker) là thư viện **intercept network requests** ở tầng service worker, cho phép mock API responses mà không cần thay đổi code ứng dụng:

```tsx
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// 1. Định nghĩa handlers
const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ]);
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: '3', ...body }, { status: 201 });
  }),
];

// 2. Setup server
const server = setupServer(...handlers);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 3. Test — component gọi fetch bình thường, MSW intercept
test('loads users', async () => {
  render(<UserList />);
  await screen.findByText('Alice');
  expect(screen.getByText('Bob')).toBeInTheDocument();
});

// 4. Override handler cho error case
test('shows error on API failure', async () => {
  server.use(
    http.get('/api/users', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );
  render(<UserList />);
  await screen.findByText(/error/i);
});
```

**Lợi ích:** Không cần mock fetch/axios trực tiếp, code ứng dụng không thay đổi, hoạt động với bất kỳ HTTP client nào, có thể dùng cả trong browser (development) và Node.js (testing).

### Câu 4: Test custom hooks bằng cách nào?
**Đáp án:**

Dùng `renderHook` từ `@testing-library/react` để test custom hooks trong môi trường React, và `act` để wrap state updates:

```tsx
import { renderHook, act } from '@testing-library/react';

// Hook cần test
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);
  const reset = () => setCount(initial);
  return { count, increment, decrement, reset };
}

// Test
test('useCounter starts with initial value', () => {
  const { result } = renderHook(() => useCounter(10));
  expect(result.current.count).toBe(10);
});

test('useCounter increments and decrements', () => {
  const { result } = renderHook(() => useCounter(0));

  act(() => {
    result.current.increment();
  });
  expect(result.current.count).toBe(1);

  act(() => {
    result.current.decrement();
  });
  expect(result.current.count).toBe(0);
});

// Test hook với async logic
test('useFetch loads data', async () => {
  // Setup MSW handler trước
  const { result } = renderHook(() => useFetch<User[]>('/api/users'));

  // Ban đầu loading
  expect(result.current.loading).toBe(true);

  // Đợi fetch hoàn thành
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.data).toHaveLength(2);
  expect(result.current.error).toBeNull();
});

// Test hook với rerender (thay đổi params)
test('useDebounce delays value', () => {
  vi.useFakeTimers();

  const { result, rerender } = renderHook(
    ({ value }) => useDebounce(value, 300),
    { initialProps: { value: 'hello' } }
  );

  rerender({ value: 'world' });
  expect(result.current).toBe('hello'); // Chưa thay đổi

  act(() => vi.advanceTimersByTime(300));
  expect(result.current).toBe('world'); // Thay đổi sau delay

  vi.useRealTimers();
});
```

**Lưu ý:** Luôn wrap state updates trong `act()`. Dùng `waitFor` cho async operations. Dùng `rerender` để test hook với props thay đổi.
