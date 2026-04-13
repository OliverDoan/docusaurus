---
sidebar_position: 4
title: "4. Unit, Integration, E2E, TDD, Testing Library, Cypress"
---

# Unit, Integration, E2E, TDD, Testing Library, Cypress

Testing là chủ đề mà nhiều frontend developer "biết phải test" nhưng không biết **test cái gì**, **ở level nào**, và **bao nhiêu là đủ**. Bài này giúp bạn trả lời những câu hỏi phỏng vấn thực tế về chiến lược testing trong frontend.

---

## Câu 1: Testing Pyramid vs Testing Trophy -- khác nhau thế nào? `[Intermediate]`

### Giải thích lý thuyết

**Testing Pyramid** (Martin Fowler) là mô hình truyền thống:

```
        /  E2E  \          ← Ít nhất, chậm nhất, đắt nhất
       /----------\
      / Integration \      ← Nhiều hơn E2E
     /----------------\
    /    Unit Tests     \  ← Nhiều nhất, nhanh nhất, rẻ nhất
   /--------------------\
```

**Testing Trophy** (Kent C. Dodds) là mô hình hiện đại cho frontend:

```
        /  E2E  \          ← Ít, cho critical paths
       /----------\
      / Integration \      ← NHIỀU NHẤT -- test như user dùng
     /----------------\
    /   Unit Tests     \   ← Cho pure logic (utils, hooks)
   /--------------------\
  /   Static Analysis    \  ← TypeScript, ESLint (miễn phí confidence)
 /------------------------\
```

**Tại sao Trophy phù hợp hơn cho frontend?** Vì frontend chủ yếu là **integration** -- component render HTML, handle events, call API, update state. Test một component isolated (unit test mock hết) cho ít confidence. Test component **với DOM thật** và **state thật** (integration) cho confidence cao hơn.

### Bảng so sánh

| Tiêu chí | Testing Pyramid | Testing Trophy |
|----------|----------------|----------------|
| **Focus** | Unit tests chiếm majority | Integration tests chiếm majority |
| **Triết lý** | Test từng unit isolated | Test như user thực sự dùng |
| **Mocking** | Mock nhiều | Mock ít (chỉ mock network) |
| **Confidence per test** | Thấp (quá isolated) | Cao (test real interactions) |
| **Speed** | Rất nhanh | Nhanh (jsdom) |
| **Phù hợp** | Backend, pure logic | Frontend, UI components |

### Code ví dụ

```typescript
// UNIT TEST -- pure logic, không cần DOM
// utils/formatPrice.ts
export function formatPrice(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

// utils/formatPrice.test.ts
describe('formatPrice', () => {
  it('formats cents to currency string', () => {
    expect(formatPrice(1999)).toBe('$19.99');
    expect(formatPrice(0)).toBe('$0.00');
    expect(formatPrice(100, 'EUR')).toBe('€1.00');
  });
});

// INTEGRATION TEST -- component + DOM + state + event
// LoginForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('submits with valid credentials', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();

    render(<LoginForm onSubmit={mockSubmit} />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(mockSubmit).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });
});
```

### Đáp án mẫu

> "Tôi theo Testing Trophy của Kent C. Dodds -- integration tests chiếm majority. Lý do: frontend chủ yếu là integration giữa component, DOM, state, và events. Unit test cho pure functions (formatPrice, validation logic), integration test cho components (render + interact + assert), E2E cho critical user flows (login, checkout). Static analysis (TypeScript + ESLint) là layer miễn phí ở đáy. Nguyên tắc: test càng giống cách user dùng thì confidence càng cao."

---

## Câu 2: Testing Library -- triết lý và best practices? `[Intermediate]`

### Giải thích lý thuyết

**React Testing Library** (RTL) được xây dựng trên triết lý:

> "The more your tests resemble the way your software is used, the more confidence they can give you."

RTL khuyến khích:
- Query by **role**, **label**, **text** -- cách user tìm elements
- **Không** query by `className`, `testId` (trừ khi không có cách khác)
- Test **behavior**, không test **implementation details**

### Priority of Queries (quan trọng nhất -> ít quan trọng nhất)

```
1. getByRole        ← Accessible, user thấy gì
2. getByLabelText   ← Form elements
3. getByPlaceholderText ← Khi không có label
4. getByText        ← Non-interactive elements
5. getByDisplayValue ← Current value of form elements
6. getByAltText     ← Images
7. getByTitle       ← SVG, tooltips
8. getByTestId      ← Last resort
```

### Code ví dụ

**BAD -- test implementation details:**

```typescript
// BAD: Test dựa vào internal state và className
import { render } from '@testing-library/react';
import { Counter } from './Counter';

test('counter works', () => {
  const { container } = render(<Counter />);

  // BAD: Query by className (implementation detail)
  const button = container.querySelector('.increment-btn');
  // BAD: Check internal state
  expect(container.querySelector('.count').textContent).toBe('0');

  button?.click();
  expect(container.querySelector('.count').textContent).toBe('1');
});
```

**GOOD -- test user behavior:**

```typescript
// GOOD: Test như user sử dụng
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

test('increments count when button is clicked', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  // GOOD: Query by role (cách user tìm element)
  expect(screen.getByRole('heading')).toHaveTextContent('Count: 0');

  // GOOD: Interact như user
  await user.click(screen.getByRole('button', { name: 'Increment' }));

  // GOOD: Assert những gì user thấy
  expect(screen.getByRole('heading')).toHaveTextContent('Count: 1');
});
```

**Test async operations:**

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from './UserProfile';

// Mock API (dùng MSW tốt hơn, nhưng đây là ví dụ đơn giản)
jest.mock('../api/users', () => ({
  fetchUser: jest.fn().mockResolvedValue({
    name: 'Alice',
    email: 'alice@example.com',
  }),
}));

test('loads and displays user profile', async () => {
  render(<UserProfile userId="123" />);

  // Loading state
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // Wait for data
  await waitFor(() => {
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  expect(screen.getByText('alice@example.com')).toBeInTheDocument();
});

test('shows error when fetch fails', async () => {
  const { fetchUser } = require('../api/users');
  fetchUser.mockRejectedValueOnce(new Error('Network error'));

  render(<UserProfile userId="123" />);

  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load user');
  });
});
```

**Test custom hooks:**

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

test('useCounter increments and decrements', () => {
  const { result } = renderHook(() => useCounter(0));

  expect(result.current.count).toBe(0);

  act(() => {
    result.current.increment();
  });
  expect(result.current.count).toBe(1);

  act(() => {
    result.current.decrement();
  });
  expect(result.current.count).toBe(0);
});
```

### Đáp án mẫu

> "Testing Library triết lý là test user behavior, không implementation details. Tôi query bằng getByRole (accessible name), getByLabelText (form fields), getByText (content) -- đúng thứ tự priority. Không bao giờ query by className hay internal state. Dùng userEvent (không fireEvent) vì nó simulate user interactions chính xác hơn (typing, clicking). Kết quả: khi refactor component mà behavior không đổi, tests không break -- đó là confidence thực sự."

---

## Câu 3: E2E Testing -- Cypress vs Playwright? `[Senior]`

### Giải thích lý thuyết

**E2E (End-to-End) tests** chạy browser thật, tương tác với app như user thật. Chúng test **toàn bộ stack** -- frontend, API, database.

| Feature | Cypress | Playwright |
|---------|---------|------------|
| **Browsers** | Chrome, Firefox, Edge (Webkit limited) | Chrome, Firefox, Safari (WebKit) |
| **Language** | JavaScript/TypeScript only | JS/TS, Python, Java, C# |
| **Architecture** | Runs inside browser | Controls browser from outside |
| **Parallelism** | Paid (Cypress Cloud) hoặc tự setup | Built-in, free |
| **Auto-wait** | Có (commands are auto-retried) | Có (actions auto-wait for elements) |
| **API testing** | `cy.request()` | `request` context |
| **Network mocking** | `cy.intercept()` | `page.route()` |
| **Debugging** | Time-travel, screenshots, video | Trace viewer, screenshots, video |
| **Speed** | Chậm hơn (single browser) | Nhanh hơn (parallel by default) |
| **Learning curve** | Dễ hơn | Trung bình |
| **Community** | Lớn, mature | Đang grow nhanh |

### Code ví dụ

**Cypress E2E test:**

```typescript
// cypress/e2e/login.cy.ts
describe('Login Flow', () => {
  beforeEach(() => {
    // Reset state
    cy.visit('/login');
  });

  it('successfully logs in with valid credentials', () => {
    // Type credentials
    cy.get('[data-testid="email-input"]').type('user@example.com');
    cy.get('[data-testid="password-input"]').type('password123');

    // Mock API response
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { token: 'fake-jwt-token', user: { name: 'Alice' } },
    }).as('loginRequest');

    // Submit
    cy.get('[data-testid="login-button"]').click();

    // Wait for API call
    cy.wait('@loginRequest');

    // Assert redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome, Alice').should('be.visible');
  });

  it('shows error for invalid credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { error: 'Invalid credentials' },
    }).as('loginRequest');

    cy.get('[data-testid="email-input"]').type('wrong@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpass');
    cy.get('[data-testid="login-button"]').click();

    cy.wait('@loginRequest');
    cy.contains('Invalid credentials').should('be.visible');
  });
});
```

**Playwright E2E test:**

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('successfully logs in with valid credentials', async ({ page }) => {
    // Mock API
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'fake-jwt-token',
          user: { name: 'Alice' },
        }),
      });
    });

    // Fill form
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Assert
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText('Welcome, Alice')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid credentials' }),
      });
    });

    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpass');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});
```

### Đáp án mẫu

> "Tôi chọn Playwright cho dự án mới vì: multi-browser support thực sự (đặc biệt Safari/WebKit), parallel execution miễn phí, và API locators giống Testing Library (getByRole, getByLabel). Cypress tốt cho team đã quen và ecosystem addons. Key principle: E2E chỉ test critical user flows (login, checkout, payment) -- 5-10 tests, không phải 500. Nếu E2E suite chạy hơn 10 phút, đó là quá nhiều."

---

## Câu 4: Mocking strategies -- MSW vs jest.mock? `[Senior]`

### Giải thích lý thuyết

Mocking là cần thiết khi test code phụ thuộc external services (API, database, third-party). Hai approaches phổ biến:

1. **jest.mock**: Mock ở module level -- thay thế toàn bộ module bằng fake
2. **MSW (Mock Service Worker)**: Mock ở network level -- intercept HTTP requests

**MSW ưu việt hơn** vì nó mock ở đúng boundary: network. Code từ component đến fetch call đều chạy thật, chỉ response là fake.

### Code ví dụ

**jest.mock approach:**

```typescript
// BAD: Mock ở module level -- quá sâu
jest.mock('../api/users', () => ({
  fetchUser: jest.fn().mockResolvedValue({ name: 'Alice' }),
  createUser: jest.fn().mockResolvedValue({ id: 1, name: 'Bob' }),
}));

test('displays user', async () => {
  render(<UserProfile userId="1" />);
  // Nếu component đổi từ fetchUser sang useSWR, test break
  // Vì mock gắn chặt với implementation
});
```

**MSW approach (recommended):**

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock GET /api/users/:id
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Alice',
      email: 'alice@example.com',
    });
  }),

  // Mock POST /api/users
  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: '123', ...body },
      { status: 201 }
    );
  }),

  // Mock error
  http.get('/api/users/404', () => {
    return HttpResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }),
];
```

```typescript
// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```typescript
// jest.setup.ts (hoặc vitest.setup.ts)
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

```typescript
// UserProfile.test.tsx
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { render, screen, waitFor } from '@testing-library/react';
import { UserProfile } from './UserProfile';

test('displays user data from API', async () => {
  // Default handler trả về Alice
  render(<UserProfile userId="1" />);

  await waitFor(() => {
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });
});

test('handles API error gracefully', async () => {
  // Override handler cho test case này
  server.use(
    http.get('/api/users/:id', () => {
      return HttpResponse.json(
        { error: 'Server error' },
        { status: 500 }
      );
    })
  );

  render(<UserProfile userId="1" />);

  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });
});

test('shows loading state', async () => {
  // Delay response để test loading state
  server.use(
    http.get('/api/users/:id', async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return HttpResponse.json({ id: '1', name: 'Alice' });
    })
  );

  render(<UserProfile userId="1" />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
```

### Bảng so sánh

| Tiêu chí | jest.mock | MSW |
|----------|-----------|-----|
| **Mock level** | Module/function | Network (HTTP) |
| **Coupling** | Gắn chặt implementation | Loose, chỉ gắn API contract |
| **Refactor-proof** | Thấp (đổi internal → break) | Cao (đổi internal, giữ API → OK) |
| **Reusable** | Mỗi test file mock riêng | Handlers dùng chung test + Storybook + dev |
| **Browser support** | Không | Có (Service Worker) |
| **Learning curve** | Dễ | Trung bình |
| **Setup** | Zero | Cần setup server |

### Đáp án mẫu

> "Tôi dùng MSW cho API mocking vì nó mock ở network level -- tất cả code từ component đến HTTP client đều chạy thật, chỉ response là mock. Khi refactor từ fetch sang axios hay useSWR, tests không break. Bonus: handlers dùng chung cho tests, Storybook, và dev environment. jest.mock tôi chỉ dùng cho third-party modules không qua network (analytics SDK, local storage wrapper)."

---

## Câu 5: TDD trong frontend -- có thực tế không? `[Senior]`

### Giải thích lý thuyết

**TDD (Test-Driven Development)** trong frontend hoàn toàn khả thi, nhưng cần adjust approach:

1. **RED**: Viết test mô tả behavior mong muốn -- test fail
2. **GREEN**: Implement minimum code để test pass
3. **REFACTOR**: Clean up code, giữ tests passing

TDD **không phù hợp** cho: UI exploration, prototyping, styling. TDD **rất phù hợp** cho: form validation, business logic, state management, API integration.

### Code ví dụ

**TDD cho Todo App:**

```typescript
// Step 1: RED -- viết test trước
// TodoList.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoList } from './TodoList';

test('adds a new todo when form is submitted', async () => {
  const user = userEvent.setup();
  render(<TodoList />);

  // Type todo text
  await user.type(screen.getByRole('textbox'), 'Buy groceries');

  // Submit
  await user.click(screen.getByRole('button', { name: 'Add' }));

  // Assert todo appears in list
  expect(screen.getByText('Buy groceries')).toBeInTheDocument();

  // Assert input is cleared
  expect(screen.getByRole('textbox')).toHaveValue('');
});

test('does not add empty todo', async () => {
  const user = userEvent.setup();
  render(<TodoList />);

  await user.click(screen.getByRole('button', { name: 'Add' }));

  // No items in list
  expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
});

test('toggles todo completion', async () => {
  const user = userEvent.setup();
  render(<TodoList />);

  // Add a todo first
  await user.type(screen.getByRole('textbox'), 'Buy groceries');
  await user.click(screen.getByRole('button', { name: 'Add' }));

  // Toggle completion
  await user.click(screen.getByRole('checkbox'));

  // Assert it is marked as completed
  expect(screen.getByRole('checkbox')).toBeChecked();
});

test('deletes a todo', async () => {
  const user = userEvent.setup();
  render(<TodoList />);

  // Add a todo
  await user.type(screen.getByRole('textbox'), 'Buy groceries');
  await user.click(screen.getByRole('button', { name: 'Add' }));

  // Delete it
  await user.click(screen.getByRole('button', { name: 'Delete' }));

  // Assert it is gone
  expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
});
```

```typescript
// Step 2: GREEN -- implement minimum
// TodoList.tsx
import { useState } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  function addTodo() {
    if (!input.trim()) return;

    const newTodo: Todo = {
      id: Date.now(),
      text: input.trim(),
      completed: false,
    };

    setTodos((prev) => [...prev, newTodo]);
    setInput('');
  }

  function toggleTodo(id: number) {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  function deleteTodo(id: number) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); addTodo(); }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Đáp án mẫu

> "TDD trong frontend rất thực tế cho logic-heavy components: forms, state management, validation rules. Workflow: viết test mô tả user behavior (user type, click, expect to see X), rồi implement component. Không dùng TDD cho styling hay UI exploration -- đó là lúc cần Storybook. Lợi ích lớn nhất: tests drive API design -- khi viết test trước, bạn thiết kế component API từ perspective người dùng, kết quả là API tự nhiên hơn."

---

## Câu 6: Test coverage -- khi nào đủ? Target bao nhiêu phần trăm? `[Intermediate]`

### Giải thích lý thuyết

Test coverage đo **bao nhiêu % code** được execute bởi tests. Nhưng **coverage cao không đồng nghĩa với tests tốt** -- bạn có thể đạt 100% coverage mà không assert gì cả.

**Các loại coverage:**
- **Statement coverage**: % statements được execute
- **Branch coverage**: % branches (if/else) được test
- **Function coverage**: % functions được gọi
- **Line coverage**: % lines được execute

### Code ví dụ

**Config coverage (Jest):**

```json
{
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.stories.{ts,tsx}",
      "!src/**/*.d.ts",
      "!src/index.tsx",
      "!src/types/**"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 80,
        "lines": 80,
        "statements": 80
      },
      "src/utils/": {
        "branches": 90,
        "functions": 95,
        "lines": 95
      }
    }
  }
}
```

**Config coverage (Vitest):**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.d.ts',
        'src/types/**',
      ],
      thresholds: {
        lines: 80,
        branches: 70,
        functions: 80,
        statements: 80,
      },
    },
  },
});
```

### Bảng coverage guidelines

| Code Type | Target Coverage | Lý do |
|-----------|----------------|-------|
| **Utils/helpers** | 90-100% | Pure functions, dễ test, quan trọng |
| **Custom hooks** | 80-90% | Business logic core |
| **Components (logic)** | 70-80% | Test behavior, không test styling |
| **Components (UI)** | 50-70% | Visual test (Storybook) bổ sung |
| **Pages** | 30-50% | E2E tests cover phần này |
| **Config files** | 0% | Exclude khỏi coverage |

### Đáp án mẫu

> "Target 80% overall, nhưng phân bổ không đều: utils và business logic 90%+, components 70-80%, pages 30-50% (E2E bổ sung). Quan trọng hơn con số là chất lượng test -- 1 integration test asserting đúng behavior có value hơn 10 unit tests chỉ để boost coverage. Tôi config CI fail nếu coverage drop dưới threshold, và set higher thresholds cho critical paths (auth, payment). Nhưng không bao giờ target 100% -- chi phí maintain tests cuối cùng không worth confidence gained."

---

### Bảng so sánh Testing Tools

| Tool | Type | Speed | DX | Ecosystem | Best For |
|------|------|-------|-----|-----------|----------|
| **Jest** | Unit + Integration | Nhanh | Tốt | Lớn nhất | Existing projects |
| **Vitest** | Unit + Integration | Rất nhanh | Tốt nhất | Growing | Vite projects, new projects |
| **Testing Library** | Integration | Nhanh (jsdom) | Tốt | Lớn | Component testing |
| **Cypress** | E2E | Chậm | Rất tốt (GUI) | Lớn | E2E, visual testing |
| **Playwright** | E2E | Nhanh | Tốt | Growing | Multi-browser E2E |
| **MSW** | Mocking | N/A | Tốt | Lớn | API mocking |
| **Storybook** | Visual | N/A | Tốt | Lớn | Component dev + visual testing |

---

## Lỗi thường gặp khi trả lời

1. **Nói "unit test là quan trọng nhất trong frontend".** Trong frontend, integration tests (Testing Library) cho confidence cao hơn isolated unit tests. Testing Trophy, không Testing Pyramid.

2. **Test implementation details.** Nếu test query by className, check internal state, hoặc assert số lần render -- đó là coupling với implementation. Khi refactor, test break mà không có bug thật.

3. **Dùng `fireEvent` thay vì `userEvent`.** `fireEvent` dispatch DOM event trực tiếp. `userEvent` simulate user interactions đầy đủ (focus, keydown, keyup, input, blur...). Dùng `userEvent.setup()` để có behavior chính xác nhất.

4. **Mock quá nhiều.** Mỗi mock là assumption -- nếu real implementation khác mock, test pass nhưng app fail. Minimize mocks, chỉ mock network boundary (MSW).

5. **E2E test mọi thứ.** E2E chậm, flaky, expensive. Chỉ test 5-10 critical user flows. Mọi thứ khác test ở integration level.

6. **Chỉ biết Cypress mà không biết Playwright.** Playwright đang grow rất nhanh, nhiều team chuyển từ Cypress sang Playwright. Cần biết cả hai và trade-offs.
