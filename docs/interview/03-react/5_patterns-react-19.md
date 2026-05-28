---
sidebar_position: 5
title: "5. Patterns & React 19"
---

# Patterns & React 19

> *Pattern là "vocabulary" của senior FE. React 19 thay đổi nhiều thứ — interviewer kỳ vọng bạn cập nhật.*

---

## Câu 1: Compound Components — pattern và khi nào dùng `[Intermediate]`

### Câu hỏi

> Em đã thấy `<Select><Select.Trigger /><Select.Content /></Select>` chưa? Pattern này gọi là gì? Khi nào nên dùng?

### Giải thích lý thuyết

**Compound Components**: parent giữ state, expose subcomponent qua property hoặc context. Child component tự subscribe parent state thay vì nhận từng prop.

Lợi ích:
- API trông natural (JSX cấu trúc rõ ràng).
- Flexible composition — user tự lắp ghép.
- Inversion of control — user quyết định layout.

Khi nào dùng:
- Component có **nhiều phần cấu thành** (Modal, Tabs, Select, Menu, Accordion).
- Cần flexibility cao về layout.

### Code minh hoạ

```jsx
// Compound component với Context
import { createContext, useContext, useState } from "react";

const SelectContext = createContext(null);

function Select({ value, onChange, children }) {
  const [open, setOpen] = useState(false);
  return (
    <SelectContext.Provider value={{ value, onChange, open, setOpen }}>
      <div className="select">{children}</div>
    </SelectContext.Provider>
  );
}

Select.Trigger = function Trigger({ children }) {
  const { setOpen, open } = useContext(SelectContext);
  return <button onClick={() => setOpen(!open)}>{children}</button>;
};

Select.Content = function Content({ children }) {
  const { open } = useContext(SelectContext);
  if (!open) return null;
  return <div className="dropdown">{children}</div>;
};

Select.Option = function Option({ value, children }) {
  const ctx = useContext(SelectContext);
  return (
    <div
      onClick={() => { ctx.onChange(value); ctx.setOpen(false); }}
      className={ctx.value === value ? "selected" : ""}
    >
      {children}
    </div>
  );
};

// Usage — natural API
<Select value={selected} onChange={setSelected}>
  <Select.Trigger>Choose option</Select.Trigger>
  <Select.Content>
    <Select.Option value="a">Option A</Select.Option>
    <Select.Option value="b">Option B</Select.Option>
  </Select.Content>
</Select>

// Radix UI, Headless UI dùng pattern này phổ biến
import * as Select from "@radix-ui/react-select";
<Select.Root>
  <Select.Trigger />
  <Select.Portal>
    <Select.Content>
      <Select.Item value="a">A</Select.Item>
    </Select.Content>
  </Select.Portal>
</Select.Root>
```

### Đáp án mẫu

> "Đó là **Compound Components**. Parent giữ state qua Context, các subcomponent (Trigger, Content, Option) subscribe vào context đó thay vì nhận prop. Khi nào dùng: component nhiều phần, user cần flex layout. Ví dụ Modal có Header, Body, Footer — thay vì `<Modal title='X' body={...} footer={...} />`, dùng `<Modal><Modal.Header /><Modal.Body /></Modal>` cho phép user xếp tuỳ ý, thêm element giữa, thậm chí có thể không có Footer. Pattern này là 'inversion of control' — em (component author) định nghĩa các piece, user lắp ghép. Radix UI, Headless UI build trên pattern này — em rất thích vì nó tách 'logic + accessibility' khỏi 'styling'. Trade-off: API hơi verbose hơn, và việc dùng Context khiến mỗi state change re-render cả subtree subcomponent."

---

## Câu 2: Render Props vs Hooks — hooks thay thế hoàn toàn? `[Intermediate]`

### Câu hỏi

> Trước hooks, render props là pattern phổ biến. Hooks có thay thế hoàn toàn không? Khi nào render props vẫn hữu ích?

### Giải thích lý thuyết

**Render props**: component truyền data qua function child.

```jsx
<Mouse>{({ x, y }) => <div>{x}, {y}</div>}</Mouse>
```

Trước hooks: cách phổ biến share stateful logic.

Sau hooks: 95% use case của render props thay được bằng custom hook (đơn giản, type tốt hơn).

Render props **vẫn hữu ích** khi:
- Cần share logic giữa class component (legacy).
- Logic muốn render UI cụ thể (ví dụ headless component có default UI).
- Pass data từ component với "DOM/instance" tới subtree (ví dụ Mouse position, IntersectionObserver entry).

### Code minh hoạ

```jsx
// Render props — cũ
class Mouse extends React.Component {
  state = { x: 0, y: 0 };
  handleMove = (e) => this.setState({ x: e.clientX, y: e.clientY });
  render() {
    return (
      <div onMouseMove={this.handleMove}>
        {this.props.children(this.state)}
      </div>
    );
  }
}

<Mouse>{({ x, y }) => <Cursor x={x} y={y} />}</Mouse>

// Hook — modern
function useMouse() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return pos;
}

function App() {
  const { x, y } = useMouse();
  return <Cursor x={x} y={y} />;
}

// Render props vẫn hữu ích: Headless UI patterns với Slot
// react-aria, Headless UI:
<Combobox value={selected} onChange={setSelected}>
  {({ open, value }) => (
    <>
      <Combobox.Input />
      <Combobox.Button>{open ? "▲" : "▼"}</Combobox.Button>
    </>
  )}
</Combobox>

// Lý do còn dùng: render props cho phép "structural composition" — UI nested
// có thể inject element bất cứ đâu, không chỉ ở 1 slot prop

// Component có UI mặc định + slot override
function DataGrid({ data, renderRow = (row) => <DefaultRow {...row} /> }) {
  return <div>{data.map(renderRow)}</div>;
}

<DataGrid data={users} renderRow={(user) => <CustomRow user={user} />} />
```

### Đáp án mẫu

> "Hooks thay thế ~95% use case của render props với code rõ ràng hơn, type tốt hơn, không bị 'render props hell' (nested function child khó đọc). Render props vẫn có chỗ đứng trong vài trường hợp: thứ nhất là pattern Headless UI/Radix nơi component giữ state nhưng cho phép user inject UI bất kỳ chỗ nào trong tree — render props cho phép pass data tới nhiều slot non-contiguous, hook không làm được. Thứ hai là 'render prop with default UI' — DataGrid nhận `renderRow`, có default nhưng cho override. Quy tắc của em: dùng hook trước; nếu thấy mình cần share state qua component tree với structural flexibility, mới chuyển render props. Đặc biệt với library author — render props pattern + Slot là vũ khí mạnh."

---

## Câu 3: Error Boundary — vẫn cần trong React 19? `[Intermediate]`

### Câu hỏi

> Error Boundary là class component. React 19 đẩy hooks và RSC, em còn cần ErrorBoundary không?

### Giải thích lý thuyết

Error Boundary **vẫn là cách duy nhất** để bắt error trong render phase. Hook không có equivalent (chưa).

Cách hoạt động: class component có `static getDerivedStateFromError` hoặc `componentDidCatch` — catch render error của child, hiển thị fallback.

Limitations:
- Không bắt error trong: event handler, async code, server-side rendering, error trong chính ErrorBoundary.
- Phải là class (chưa có hook).

### Code minh hoạ

```jsx
// Custom ErrorBoundary
class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to monitoring (Sentry, Bugsnag, etc.)
    logError(error, errorInfo);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return this.props.fallback?.(this.state.error, this.reset)
          ?? <DefaultErrorUI error={this.state.error} reset={this.reset} />;
    }
    return this.props.children;
  }
}

// Usage — nested boundary
function App() {
  return (
    <ErrorBoundary fallback={(err) => <GlobalError error={err} />}>
      <Header />
      <ErrorBoundary fallback={(err) => <WidgetError />}>
        <RevenueWidget />
      </ErrorBoundary>
      <ErrorBoundary fallback={(err) => <WidgetError />}>
        <OrdersWidget />
      </ErrorBoundary>
    </ErrorBoundary>
  );
}

// Library: react-error-boundary (functional API)
import { ErrorBoundary } from "react-error-boundary";

<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onReset={() => queryClient.resetQueries()}
  onError={(error, info) => logError(error, info)}
>
  <App />
</ErrorBoundary>

// Bắt error trong event handler — không phải ErrorBoundary
function Component() {
  const handleClick = async () => {
    try {
      await api.doSomething();
    } catch (e) {
      toast.error(e.message);
    }
  };
}

// Combine với Suspense + ErrorBoundary
<ErrorBoundary fallback={<Err />}>
  <Suspense fallback={<Loading />}>
    <AsyncContent />
  </Suspense>
</ErrorBoundary>
```

### Đáp án mẫu

> "Vẫn cần — ErrorBoundary là cách duy nhất bắt error trong render phase. React 19 không có hook equivalent. Em luôn wrap ErrorBoundary ở 3 tầng: root để bắt fatal error toàn app (fallback full-page); per-route để mỗi route lỗi không sập trang khác; per-widget cho dashboard widget độc lập (1 widget fail không kéo cả page). Quan trọng: ErrorBoundary **không** bắt error trong event handler hay async code — phải dùng `try/catch` cho mấy chỗ đó. Em không tự viết class — dùng `react-error-boundary` lib có hook API và FallbackComponent. Combine với Suspense rất power: `<ErrorBoundary><Suspense fallback={Loading}><AsyncStuff /></Suspense></ErrorBoundary>` xử lý cả loading lẫn error declaratively."

---

## Câu 4: React Server Actions (React 19) `[Senior]`

### Câu hỏi

> Server Actions trong React 19/Next.js là gì? Em đã dùng chưa? Trade-off với cách truyền thống (REST endpoint)?

### Giải thích lý thuyết

**Server Action**: function chạy trên server, gọi được trực tiếp từ client component. Khai báo qua `'use server'`.

Benefits:
- **Co-location** — UI + backend logic ở cùng file, dễ maintain.
- **No API layer** — không cần viết `fetch('/api/...')`, framework handle serialize/transport.
- **Progressive enhancement** — form vẫn submit được khi JS chưa load.
- **Type-safe** — function call đầu cuối có type.

Trade-off:
- Coupling với framework (Next.js/Remix/React 19).
- Khó test riêng (action gắn liền component).
- Debugging cross-boundary phức tạp hơn API endpoint.
- Cache invalidation thủ công (`revalidatePath`, `revalidateTag`).

### Code minh hoạ

```jsx
// app/users/page.tsx — Server Component + Server Action

"use server";
async function createUser(formData: FormData) {
  "use server"; // có thể đặt ở function level
  const name = formData.get("name") as string;
  await db.user.create({ data: { name } });
  revalidatePath("/users");
}

export default async function UsersPage() {
  const users = await db.user.findMany();

  return (
    <>
      <form action={createUser}>
        <input name="name" required />
        <button type="submit">Add</button>
      </form>

      <ul>
        {users.map((u) => <li key={u.id}>{u.name}</li>)}
      </ul>
    </>
  );
}

// Client component dùng action — useFormStatus, useActionState
"use client";
import { useActionState } from "react";

function AddUserForm({ action }) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form action={formAction}>
      <input name="name" required />
      <button disabled={pending}>{pending ? "Saving..." : "Add"}</button>
      {state.error && <p>{state.error}</p>}
    </form>
  );
}

// Server action với validation + return value
"use server";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function subscribe(prev, formData) {
  const result = schema.safeParse({ email: formData.get("email") });
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }
  await db.subscriber.create({ data: result.data });
  return { success: true };
}

// So sánh với REST truyền thống
// app/api/users/route.ts (cũ)
export async function POST(req: Request) {
  const body = await req.json();
  const user = await db.user.create({ data: body });
  return NextResponse.json(user);
}

// Client (cũ)
const handleSubmit = async (data) => {
  const res = await fetch("/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
  // ... handle response, type không tự sync với backend
};
```

### Đáp án mẫu

> "Server Action là function 'use server' gọi được trực tiếp từ client như function thường, framework lo phần transport. Lợi ích chính: **co-location** — code form và backend ở cùng file, không cần API route trung gian; **type-safe end-to-end**; và **progressive enhancement** — form submit được kể cả khi JS chưa load (HTML form submit). Em đã dùng cho dự án nội bộ và thấy rất productive cho CRUD admin — viết nhanh gấp đôi vs REST. Trade-off: coupling Next.js/React 19 — không port được sang stack khác; debugging cross-boundary (cái gì chạy server, cái gì client) ban đầu confusing; cache invalidation thủ công với `revalidatePath`/`revalidateTag` — quên là data stale. Em vẫn dùng REST/GraphQL cho API public hoặc cần versioning — Server Action chỉ phù hợp internal app/admin."

---

## Câu 5: React 19 features quan trọng — `use()`, Compiler, Actions `[Senior]`

### Câu hỏi

> Liệt kê 3 thay đổi quan trọng nhất của React 19 và impact lên cách em viết code.

### Giải thích lý thuyết

Highlights React 19:

1. **React Compiler** — tự động memoize component và hooks. Bớt cần viết tay `useMemo`/`useCallback`.
2. **`use()` hook** — đọc Promise/Context inline trong component. Combine với Suspense cho data fetching elegant.
3. **Actions + `useActionState`** — pattern chuẩn cho form/mutation, hỗ trợ pending/error tích hợp.
4. **`ref` là prop** — không cần `forwardRef`.
5. **Document metadata** — `<title>`, `<meta>` trong component tự được hoist vào `<head>`.
6. **`useOptimistic`** — optimistic update built-in.

### Code minh hoạ

```jsx
// 1. React Compiler — không cần memo tay
function Component({ items, query }) {
  // Trước React 19: phải useMemo
  const filtered = items.filter((i) => i.name.includes(query));
  // Compiler tự memoize dựa trên items, query
  return <List items={filtered} />;
}

// 2. use() — đọc Promise và Context có điều kiện
function UserProfile({ userPromise }) {
  const user = use(userPromise); // pause render đến khi resolve
  return <h1>{user.name}</h1>;
}

// Combine với Suspense
<Suspense fallback={<Loading />}>
  <UserProfile userPromise={fetchUser(id)} />
</Suspense>

// use() trong condition (khác hook khác)
function Conditional({ show, promise }) {
  if (!show) return null;
  const value = use(promise); // OK với use(), không OK với useState
  return <div>{value}</div>;
}

// 3. useActionState — form pattern
function Form() {
  const [state, formAction, pending] = useActionState(submitAction, { error: null });

  return (
    <form action={formAction}>
      <input name="name" />
      <button disabled={pending}>Save</button>
      {state.error && <p>{state.error}</p>}
    </form>
  );
}

// 4. ref là prop
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
// Không cần forwardRef nữa

// 5. Document metadata
function BlogPost({ post }) {
  return (
    <>
      <title>{post.title}</title>
      <meta name="description" content={post.summary} />
      <article>{post.content}</article>
    </>
  );
}
// React tự hoist <title>, <meta> vào <head>

// 6. useOptimistic
function Likes({ post }) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    post.likes,
    (current, delta) => current + delta
  );

  return (
    <button onClick={async () => {
      addOptimisticLike(1);          // UI update ngay
      await api.like(post.id);       // server call
    }}>
      Likes: {optimisticLikes}
    </button>
  );
}
```

### Đáp án mẫu

> "Top 3 thay đổi impact lớn nhất với code em viết: thứ nhất là **React Compiler** — tự động memoize, bớt phải viết `useMemo`/`useCallback` mỗi nơi. Code đơn giản hơn rất nhiều, và compiler thường memoize chính xác hơn người viết tay. Thứ hai là **Actions + useActionState** — pattern chuẩn cho form/mutation. Trước em phải tự handle isPending, error, validation; giờ tất cả built-in. Pair với Server Action thì viết form CRUD nhanh chưa từng có. Thứ ba là **`use()` hook + Suspense** — fetching data thành 'thread' trong React: throw Promise, Suspense catch và show fallback. Combine với RSC, fetch ngay trong component không cần useEffect. Bonus: `ref` là prop bình thường — bye-bye `forwardRef`; document metadata hoist tự động — không cần `react-helmet`."

---

## Câu 6: Migrating to React 19 — chiến lược `[Senior]`

### Câu hỏi

> Codebase em đang React 18. Em được giao migrate lên React 19. Chiến lược?

### Giải thích lý thuyết

React 19 có breaking changes:
- Remove APIs deprecated: `propTypes` validation, `defaultProps` cho function component, string refs, legacy context.
- `useRef` cần initial value (TS chặt hơn).
- `act` import từ `react` thay vì `react-dom/test-utils`.
- New JSX transform yêu cầu.

Chiến lược:
1. Đọc full **upgrade guide** + run codemod chính thức.
2. Update React 18.x → latest 18 trước (bridge release).
3. Run TypeScript strict, fix type errors mới.
4. Update lib chính (react-router, react-query, mui...) tới version tương thích.
5. Test e2e + manual smoke test.
6. Adopt feature mới từ từ — không refactor tất cả ngay.

### Code minh hoạ

```bash
# Codemod chính thức
npx codemod@latest react/19/migration-recipe

# Step 1: Bridge release
npm install react@18.3 react-dom@18.3
# Test, fix warnings deprecation

# Step 2: Update React 19
npm install react@19 react-dom@19
npm install --save-dev @types/react@19 @types/react-dom@19

# Step 3: Run codemod
npx codemod@latest react/19/use-context
npx codemod@latest react/19/replace-forwardRef
npx codemod@latest react/19/replace-string-ref

# Step 4: Adopt feature mới dần
```

```jsx
// Trước
import { forwardRef } from "react";
const Button = forwardRef(function Button(props, ref) {
  return <button ref={ref} {...props} />;
});

// Sau
function Button({ ref, ...props }) {
  return <button ref={ref} {...props} />;
}

// useRef cần initial value
const ref = useRef<HTMLInputElement>(null);  // ✅
// const ref = useRef<HTMLInputElement>();   // ❌ React 19 type error

// Context không cần .Provider
<ThemeContext value={...}>...</ThemeContext>
// Cũ:
// <ThemeContext.Provider value={...}>...</ThemeContext.Provider>

// PropTypes — chuyển sang TypeScript
// import PropTypes from "prop-types";
// Button.propTypes = { label: PropTypes.string }; // ❌ deprecated
```

### Đáp án mẫu

> "Em không big bang. Bước 1: upgrade React 18.x lên latest 18.3 trước — đây là bridge release với deprecation warnings cho mọi pattern sẽ break ở 19. Fix tất cả warning, đó là 80% công việc. Bước 2: chạy codemod chính thức (`npx codemod react/19/migration-recipe`) để auto-fix `forwardRef`, string ref, Context. Bước 3: bump package — React 19 + @types/react 19 + lib (react-router, react-query, mui) lên version tương thích. Bước 4: chạy TypeScript strict, fix type errors mới (useRef bắt buộc initial value). Bước 5: smoke test toàn app + e2e regression. Sau khi green, em adopt feature mới từ từ — không refactor mọi component để dùng `use()` ngay. Form mới viết sẽ dùng Actions, form cũ vẫn react-hook-form đến khi có lý do refactor. Tránh 'rewrite everything' — gây bug + chậm release."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "Hooks thay thế hoàn toàn render props"                | Render props vẫn dùng trong Headless UI patterns, structural composition |
| "ErrorBoundary bắt mọi error"                          | Không bắt event handler, async, SSR error                            |
| "RSC chạy ở browser"                                   | RSC render trên server, ship HTML/RSC payload không phải JS          |
| "React 19 Compiler thay thế memo hoàn toàn"            | Compiler tốt nhưng vẫn cần memo tay trong vài edge case               |
| "Server Action thay thế REST"                          | Phù hợp internal app; API public/versioning vẫn nên REST/GraphQL     |
