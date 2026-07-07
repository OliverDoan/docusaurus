---
sidebar_position: 2
title: "2. React 19 Features"
---

# React 19 Features

React 19 là phiên bản mới mang đến nhiều tính năng giúp viết ứng dụng gọn và mạnh hơn, như **Server Components** (component chạy trên máy chủ), hook `use` để đọc dữ liệu bất đồng bộ, cùng **Actions** (cơ chế xử lý hành động như gửi form). Bài này giới thiệu các tính năng nổi bật của React 19 dành cho người mới làm quen. Bạn chưa cần nhớ hết, chỉ cần hiểu mỗi tính năng giải quyết vấn đề gì.

---

## Mục lục

- [Vì sao React 19 thêm các tính năng này?](#vì-sao-react-19-thêm-các-tính-năng-này)
- [Server Components](#server-components)
- [use hook](#use-hook)
- [Actions và useActionState](#actions-và-useactionstate)
- [useOptimistic](#useoptimistic)
- [Document Metadata](#document-metadata)
- [React Compiler](#react-compiler)

---

## Vì sao React 19 thêm các tính năng này?

**Vấn đề:**

```jsx
// React 18: xử lý form/mutation phải tự quản nhiều state thủ công
function LoginForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      await login(e.target.email.value);
    } catch (err) {
      setError(err.message); // tự set lỗi
    } finally {
      setIsPending(false); // tự reset pending — lặp ở mọi form
    }
  }
  // ...
}

// Truyền ref qua component con phải bọc forwardRef rườm rà
const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);

// Đọc Promise/Context bị giới hạn — không gọi được trong if
function Comp({ shouldLoad }) {
  if (shouldLoad) {
    const ctx = useContext(MyContext); // ❌ vi phạm rules of hooks
  }
}
```

**Giải pháp:**

```jsx
// React 19: Actions + useActionState gói sẵn pending/error/submit
function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, {});
  return (
    <form action={formAction}>
      <input name="email" />
      {state.error && <p>{state.error}</p>}
      <button disabled={isPending}>{isPending ? "..." : "Login"}</button>
    </form>
  );
}

// useOptimistic: cập nhật lạc quan dễ dàng, tự rollback nếu fail
const [optimistic, addOptimistic] = useOptimistic(todos, (s, t) => [...s, t]);

// use(): đọc Promise/Context linh hoạt, được phép trong if
function Comp({ shouldLoad }) {
  if (shouldLoad) {
    const data = use(dataPromise); // ✅ OK
    return <div>{data}</div>;
  }
}

// ref là prop thường — bỏ forwardRef
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

:::tip[Dùng thực tế]

- **Form submit (login, đăng ký)**: `useActionState` tự lo trạng thái `pending` và thông báo lỗi — không còn `useState` rải rác, code gọn và đồng nhất.
- **Optimistic UI khi like/comment/thêm todo**: `useOptimistic` hiển thị thay đổi ngay khi bấm, mượt UX; nếu server lỗi React tự rollback về state thật.
- **Đọc dữ liệu bất đồng bộ**: `use()` đọc Promise kết hợp `<Suspense>` để hiện spinner, gọi được cả trong nhánh điều kiện.
- **Truyền ref gọn gàng**: nhận `ref` như prop bình thường để focus input hay đo kích thước, không phải bọc `forwardRef`.

:::

---

## Server Components

**React Server Components (RSC)** — component chạy **trên server**, gửi
HTML/data về client. Hoạt động trong Next.js App Router (production-ready
2024+).

```tsx
// app/users/page.tsx — Server Component (default)
async function UsersPage() {
  const users = await db.user.findMany(); // truy cập DB trực tiếp
  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}
```

**Client Component** — phải đánh dấu `"use client"`:

```tsx
// app/components/Counter.tsx
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

| | Server Component | Client Component |
|--|-----------------|------------------|
| Chạy ở | Server | Browser |
| Bundle size | **0** (không vào client) | Có |
| Hook (useState, useEffect) | **Không** | Có |
| Access DB, fs, env | **Có** | Không |
| Interactive | Không | **Có** |
| Đánh dấu | Mặc định | `"use client"` đầu file |

:::info[Phân tích]

**Lợi ích RSC**:

1. **Bundle nhỏ hơn** — code data fetching không vào client.
2. **Truy cập DB trực tiếp** — không cần API route.
3. **Secret an toàn** — API key, DB connection chỉ ở server.
4. **Streaming** — render dần từng phần.
5. **Composition** — Server Component có thể wrap Client Component:

```tsx
// page.tsx (Server)
import { Counter } from "./Counter"; // Client component

async function Page() {
  const data = await fetchData(); // server
  return (
    <div>
      <h1>{data.title}</h1>
      <Counter initial={data.count} /> {/* Client island */}
    </div>
  );
}
```

Pattern: **Server Component cho dữ liệu, Client Component cho interaction**.

Luồng request khi kết hợp Server Component và Client Component:

```mermaid
flowchart TD
  A["Request từ Browser"] --> B["Server chạy Server Component"]
  B --> C["Truy cập DB / API / env"]
  C --> D["Render ra HTML và payload"]
  D --> E["Gửi về Client"]
  E --> F{"Cần tương tác?"}
  F -->|"Có"| G["Client Component<br/>use client - useState, onClick"]
  F -->|"Không"| H["Hiển thị tĩnh (bundle 0 KB)"]
```

Trade-off:

- Học curve cao — phải nghĩ "boundary".
- Caching layer phức tạp.
- Một số lib chưa compat (Styled Components cần wrapper).

:::

---

## use hook

Đọc Promise hoặc Context, **được phép trong condition**:

```jsx
import { use } from "react";

function UserDetail({ promise }: { promise: Promise<User> }) {
  const user = use(promise); // suspend nếu chưa resolve
  return <div>{user.name}</div>;
}

function Page() {
  const userPromise = fetchUser(1);
  return (
    <Suspense fallback={<Spinner />}>
      <UserDetail promise={userPromise} />
    </Suspense>
  );
}
```

Khác `useContext` — `use` được dùng trong `if`:

```jsx
function Component({ shouldLoad }) {
  if (shouldLoad) {
    const data = use(dataPromise); // OK
    return <div>{data}</div>;
  }
  return null;
}
```

---

## Actions và useActionState

**Server Action** (Next.js App Router):

```tsx
"use server";

async function createUser(formData: FormData) {
  await db.user.create({
    data: { name: formData.get("name") as string },
  });
  revalidatePath("/users");
}
```

```tsx
"use client";

<form action={createUser}>
  <input name="name" />
  <button>Create</button>
</form>
```

**`useActionState`** — manage state + pending + error:

```tsx
"use client";
import { useActionState } from "react";

async function loginAction(prevState, formData) {
  const email = formData.get("email");
  try {
    await login(email);
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
}

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, {});

  return (
    <form action={formAction}>
      <input name="email" />
      {state.error && <p>{state.error}</p>}
      <button disabled={isPending}>
        {isPending ? "..." : "Login"}
      </button>
    </form>
  );
}
```

Trình tự khi submit một form dùng `useActionState` (trạng thái pending/error
được gói sẵn):

```mermaid
sequenceDiagram
  participant U as Nguoi dung
  participant F as Form
  participant A as useActionState
  participant S as Server
  U->>F: bam Submit
  F->>A: goi formAction
  A->>A: isPending = true
  A->>S: gui du lieu
  S-->>A: tra ket qua hoac loi
  A->>A: isPending = false
  A-->>F: cap nhat state va error
  F-->>U: hien ket qua
```

**`useFormStatus`** — child component biết form đang pending:

```tsx
"use client";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "..." : "Save"}</button>;
}
```

---

## useOptimistic

Update UI **ngay lập tức** với optimistic value, rollback nếu fail:

```tsx
"use client";
import { useOptimistic } from "react";

function TodoList({ todos, addTodo }) {
  const [optimisticTodos, addOptimistic] = useOptimistic(
    todos,
    (state, newTodo) => [...state, { ...newTodo, pending: true }]
  );

  async function formAction(formData) {
    const text = formData.get("text");
    addOptimistic({ id: Math.random(), text }); // UI update ngay
    await addTodo(text); // server action
  }

  return (
    <>
      <ul>
        {optimisticTodos.map(t => (
          <li key={t.id} className={t.pending ? "opacity-50" : ""}>
            {t.text}
          </li>
        ))}
      </ul>
      <form action={formAction}>
        <input name="text" />
        <button>Add</button>
      </form>
    </>
  );
}
```

UX: user thấy item xuất hiện ngay khi click, không phải đợi server response.
Nếu server fail → React tự rollback về state thật.

---

## Document Metadata

React 19 tự **hoist `<title>`, `<meta>`, `<link>`** vào `<head>`:

```jsx
function BlogPost({ post }) {
  return (
    <article>
      <title>{post.title} - Blog</title>
      <meta name="description" content={post.summary} />
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}
```

Trước đây phải dùng `react-helmet` hoặc Next.js `<Head>`. Giờ vanilla
React 19 đã support.

---

## React Compiler

[React Compiler](https://react.dev/learn/react-compiler) — auto-memoize
component và value. Khi production-ready:

- **Không cần** `useCallback`, `useMemo`, `React.memo` thủ công.
- Compiler analyze code, insert memoization tự động.
- Backwards compatible.

```jsx
// Hôm nay
function Page() {
  const value = useMemo(() => compute(props), [props]);
  const handler = useCallback(() => doSomething(value), [value]);
  return <Child handler={handler} />;
}

// Với React Compiler
function Page() {
  const value = compute(props); // tự memo
  const handler = () => doSomething(value); // tự memo
  return <Child handler={handler} />;
}
```

:::info[Phân tích]

**React Compiler tình trạng 2026:**

- **Stage**: production-ready cho Meta apps, opt-in cho cộng đồng.
- **Cài đặt**: babel-plugin, hoặc SWC transform.
- **Tích hợp**: Next.js có flag, Vite có plugin.

Khi compiler stable:

- Code đơn giản hơn — không phải nghĩ về memoization.
- Performance đồng đều — không bỏ sót useMemo cần thiết.
- Junior dev viết code performant hơn mặc nhiên.

Hiện tại (2026), **bật khi có cơ hội** — kiểm tra compatibility với
codebase trước. ESLint plugin `eslint-plugin-react-compiler` cảnh báo
code không compatible (mutation, side effect trong render).

:::

:::tip[Mẹo]

**Migration sang React 19**:

1. **Update dependencies** — React 19 + dependency cần compat.
2. **Remove `forwardRef`** — codemod `react-codemod forward-refs-to-refs`.
3. **Remove `PropTypes`** — TS thay thế.
4. **Test với Strict Mode** — bắt bug effect, cleanup.
5. **Cân nhắc Compiler** — opt-in dần.

Một số breaking change minor — đa số app upgrade từ 18 không gặp issue lớn.

:::

:::warning[Cần lưu ý]

**React 19 Server Components chỉ hoạt động trong framework hỗ trợ:**

- **Next.js App Router** — đầy đủ nhất.
- **TanStack Start** — đang implement.
- **Remix v2+** — limited support.
- **Vite SPA** — **không** có RSC.

Project Vite không thể dùng `"use server"` actions. Vẫn dùng được hooks
mới (`use`, `useActionState`, `useOptimistic`) trong client.

:::
