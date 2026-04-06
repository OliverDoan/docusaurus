---
sidebar_position: 6
title: "React 15 → 19: Toàn bộ tính năng mới & lý do ra đời"
---

# React 15 → 19: Toàn bộ tính năng mới & lý do ra đời

Nếu bạn học React từ phiên bản 15, bạn đã bỏ lỡ rất nhiều thay đổi lớn. Bài này sẽ đi qua **toàn bộ** những tính năng mới từ React 16 đến React 19, giải thích **lý do** từng tính năng ra đời, và cho code ví dụ thực tế.

---

## Tổng quan: React qua các phiên bản

| Phiên bản | Năm | Thay đổi lớn nhất |
|-----------|-----|-------------------|
| React 15 | 2016 | Stack reconciler, class components, `createClass` |
| React 16 | 2017 | **Fiber**, Error Boundaries, Portals, Fragments |
| React 16.3 | 2018 | **New Context API**, `getDerivedStateFromProps` |
| React 16.6 | 2018 | `React.memo`, `React.lazy`, `Suspense` |
| React 16.8 | 2019 | **Hooks** -- thay đổi lớn nhất kể từ React ra đời |
| React 17 | 2020 | Không có tính năng mới (bước đệm) |
| React 18 | 2022 | **Concurrent rendering**, automatic batching, `useTransition` |
| React 19 | 2024 | **Actions**, `use()`, Server Components, React Compiler |

---

## Phần 1: React 16 -- Viết lại từ đầu

### 1.1 Fiber Architecture `[Senior]`

**Vấn đề với React 15:** React 15 dùng **Stack Reconciler** -- khi bắt đầu render, nó chạy đồng bộ từ đầu đến cuối, **không thể dừng giữa chừng**. Với component tree lớn, main thread bị block, UI lag, animation giật.

**Giải pháp:** React 16 viết lại hoàn toàn reconciler thành **Fiber**. Fiber chia render thành các "units of work" nhỏ, có thể:
- Tạm dừng và tiếp tục sau
- Ưu tiên công việc (user input > animation > data fetch)
- Hủy công việc không cần thiết

```tsx
// React 15: render đồng bộ, block main thread
// render(App) -> render(Header) -> render(Nav) -> ... -> XONG
// Nếu tree có 10,000 nodes, main thread bị block cả 10,000 nodes

// React 16+: render có thể bị ngắt
// render(App) -> render(Header) -> [user click!] -> xử lý click -> tiếp tục render(Nav)
```

**Tại sao quan trọng?** Fiber là nền tảng cho tất cả concurrent features sau này (useTransition, Suspense, Server Components). Không có Fiber, React 18 và 19 không thể tồn tại.

---

### 1.2 Error Boundaries `[Intermediate]`

**Vấn đề với React 15:** Một lỗi JavaScript trong bất kỳ component nào sẽ **crash toàn bộ app** -- white screen, không có cách recover.

**Giải pháp:** Error Boundaries -- class components có thể "bắt" lỗi của children và hiển thị fallback UI.

```tsx
// React 15: lỗi 1 component = crash cả app
// React 16+: Error Boundary bắt lỗi và hiện fallback

import { Component, ErrorInfo } from 'react';

class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log lỗi lên monitoring service (Sentry, DataDog...)
    console.error('Error caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Sử dụng
function App() {
  return (
    <ErrorBoundary fallback={<p>Có lỗi xảy ra. Vui lòng thử lại.</p>}>
      <UserProfile />
    </ErrorBoundary>
  );
}
```

**Lưu ý:** Error Boundaries chỉ bắt lỗi trong **render**, lifecycle methods, và constructors. Không bắt được lỗi trong event handlers, async code, hay SSR.

---

### 1.3 Portals `[Intermediate]`

**Vấn đề:** Modals, tooltips, dropdowns cần render **ngoài** parent DOM hierarchy (để tránh `overflow: hidden`, z-index issues), nhưng vẫn thuộc React tree.

**Giải pháp:** `ReactDOM.createPortal(child, container)` -- render child vào bất kỳ DOM node nào, nhưng events vẫn bubble lên React tree bình thường.

```tsx
import { createPortal } from 'react-dom';

function Modal({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) {
  if (!isOpen) return null;

  // Render vào document.body thay vì parent component
  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
      </div>
    </div>,
    document.body
  );
}

// onClick trong Modal VẪN bubble lên App (React tree, không phải DOM tree)
function App() {
  return (
    <div onClick={() => console.log('Click from modal bubbles here!')}>
      <Modal isOpen={true}>
        <button>Click me</button>
      </Modal>
    </div>
  );
}
```

---

### 1.4 Fragments `[Intermediate]`

**Vấn đề với React 15:** Mỗi component PHẢI return **một** root element. Muốn trả về nhiều elements phải wrap trong `<div>`, tạo ra DOM thừa.

**Giải pháp:** `<React.Fragment>` hoặc cú pháp ngắn `<>...</>` -- nhóm elements mà không tạo DOM node.

```tsx
// React 15: phải có wrapper div
function OldWay() {
  return (
    <div> {/* div này không cần thiết, làm hỏng CSS */}
      <td>Hello</td>
      <td>World</td>
    </div>
  );
}

// React 16+: Fragment
function NewWay() {
  return (
    <>
      <td>Hello</td>
      <td>World</td>
    </>
  );
}

// Fragment với key (trong loops)
function Glossary({ items }: { items: { id: string; term: string; desc: string }[] }) {
  return (
    <dl>
      {items.map(item => (
        <React.Fragment key={item.id}>
          <dt>{item.term}</dt>
          <dd>{item.desc}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
```

---

### 1.5 New Context API (React 16.3) `[Intermediate]`

**Vấn đề:** React 15 có context API nhưng nó là **experimental**, không stable, và bị warning khi dùng. Prop drilling là vấn đề lớn.

**Giải pháp:** Context API mới với `createContext`, `Provider`, và `Consumer` (sau này là `useContext` hook).

```tsx
// React 15: experimental context (KHÔNG NÊN DÙNG)
// React 16.3+: stable Context API
import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  // Không cần truyền props qua từng cấp
  return <ThemedButton />;
}

function ThemedButton() {
  const theme = useContext(ThemeContext); // 'dark'
  return <button className={theme}>Click me</button>;
}
```

---

### 1.6 React.memo (React 16.6) `[Intermediate]`

**Vấn đề:** `PureComponent` chỉ hoạt động với class components. Function components không có cách skip re-render khi props không đổi.

**Giải pháp:** `React.memo` -- HOC cho function components, tương đương `PureComponent`.

```tsx
// React 15: chỉ class PureComponent
class OldWay extends React.PureComponent {
  render() {
    return <div>{this.props.name}</div>;
  }
}

// React 16.6+: React.memo cho function components
const NewWay = React.memo(function NewWay({ name }: { name: string }) {
  return <div>{name}</div>;
});
```

---

### 1.7 Hooks (React 16.8) -- Thay đổi lớn nhất `[Intermediate]`

**Vấn đề với class components:**
1. **`this` binding** -- phải bind methods trong constructor hoặc dùng arrow functions
2. **Lifecycle methods phức tạp** -- logic bị trải rải giữa `componentDidMount`, `componentDidUpdate`, `componentWillUnmount`
3. **Không thể reuse stateful logic** -- HOC và render props gây wrapper hell
4. **Class khó minify/optimize** hơn functions

**Giải pháp:** Hooks -- dùng state và lifecycle trong function components.

```tsx
// React 15: class component
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    this.increment = this.increment.bind(this); // Phải bind!
  }

  componentDidMount() {
    document.title = `Count: ${this.state.count}`;
  }

  componentDidUpdate() {
    document.title = `Count: ${this.state.count}`; // Logic bị lặp lại!
  }

  componentWillUnmount() {
    // Cleanup
  }

  increment() {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    return <button onClick={this.increment}>{this.state.count}</button>;
  }
}

// React 16.8+: hooks -- ngắn gọn, rõ ràng
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  // Mount + update logic ở MỘT CHỖ
  useEffect(() => {
    document.title = `Count: ${count}`;
    return () => { /* cleanup */ };
  }, [count]);

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Bảng tổng hợp Hooks cơ bản

| Hook | Mục đích | Thay thế class API |
|------|----------|--------------------|
| `useState` | Lưu state | `this.state` + `this.setState` |
| `useEffect` | Side effects | `componentDidMount` + `componentDidUpdate` + `componentWillUnmount` |
| `useContext` | Đọc Context | `static contextType` / `Context.Consumer` |
| `useReducer` | State phức tạp | `this.setState` với reducer logic |
| `useRef` | Mutable ref / DOM ref | `React.createRef()` |
| `useMemo` | Ghi nhớ giá trị | Manual trong `shouldComponentUpdate` |
| `useCallback` | Ghi nhớ function | Bind trong constructor |

---

## Phần 2: React 17 -- Bước đệm, không có tính năng mới

### 2.1 New JSX Transform `[Intermediate]`

**Vấn đề:** Mỗi file dùng JSX phải `import React from 'react'` ở dòng đầu, dù không dùng React trực tiếp. Thừa và khó chịu.

**Giải pháp:** JSX transform mới -- compiler tự động thêm import, không cần viết thủ công nữa.

```tsx
// React 15-16: BẮT BUỘC import React
import React from 'react'; // Xóa dòng này => lỗi

function App() {
  return <h1>Hello</h1>;
}

// React 17+: KHÔNG CẦN import React
function App() {
  return <h1>Hello</h1>; // OK, compiler tự xử lý
}
```

### 2.2 Event Delegation thay đổi `[Senior]`

**Vấn đề:** React 15-16 attach tất cả events vào `document`. Khi có nhiều React trees (micro-frontends), events bị xung đột.

**Giải pháp:** React 17 attach events vào **root DOM container** thay vì document.

```tsx
// React 15-16: document.addEventListener(...)
// React 17+: rootElement.addEventListener(...)
// => An toàn cho micro-frontends và nhiều React roots
```

---

## Phần 3: React 18 -- Concurrent React

### 3.1 createRoot API `[Intermediate]`

**Vấn đề:** `ReactDOM.render()` luôn render đồng bộ. Cần API mới để opt-in concurrent features.

**Giải pháp:** `createRoot` -- bắt buộc để dùng concurrent features.

```tsx
// React 15-17: cũ
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));

// React 18+: mới -- bắt buộc cho concurrent features
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

### 3.2 Automatic Batching `[Intermediate]`

**Vấn đề với React 15-17:** Chỉ batch state updates trong React event handlers. Trong `setTimeout`, `Promise`, native events -- mỗi `setState` gây 1 re-render riêng.

**Giải pháp:** React 18 batch **tất cả** state updates, bất kể context.

```tsx
// React 15-17: trong setTimeout, mỗi setState = 1 render
setTimeout(() => {
  setCount(1);  // render 1
  setFlag(true); // render 2 => 2 renders!
}, 100);

// React 18+: luôn batch
setTimeout(() => {
  setCount(1);   // batch
  setFlag(true); // batch => chỉ 1 render!
}, 100);

// Muốn force render ngay (hiếm khi cần):
import { flushSync } from 'react-dom';
flushSync(() => setCount(1));  // render ngay
flushSync(() => setFlag(true)); // render ngay
```

### 3.3 useTransition `[Senior]`

**Vấn đề:** Khi user gõ search, mỗi keystroke trigger render danh sách lớn => input bị lag.

**Giải pháp:** `useTransition` đánh dấu state update là "non-urgent". React ưu tiên render input trước, defer render danh sách.

```tsx
import { useState, useTransition } from 'react';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value); // Urgent: cập nhật input ngay

    startTransition(() => {
      // Non-urgent: React có thể interrupt nếu có input mới
      setResults(filterHugeList(e.target.value));
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <p>Đang tìm...</p>}
      <ul>
        {results.map(r => <li key={r}>{r}</li>)}
      </ul>
    </div>
  );
}
```

### 3.4 useDeferredValue `[Senior]`

**Vấn đề:** Giống useTransition nhưng cho trường hợp bạn **không kiểm soát** state update (VD: props từ parent).

**Giải pháp:** `useDeferredValue` tạo phiên bản "lag" của giá trị.

```tsx
import { useDeferredValue, memo } from 'react';

function SearchResults({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <div style={{ opacity: isStale ? 0.6 : 1 }}>
      <HeavyList query={deferredQuery} />
    </div>
  );
}

const HeavyList = memo(({ query }: { query: string }) => {
  // Render 10,000 items -- sẽ dùng giá trị "cũ" khi user đang gõ
  const items = filterItems(query);
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>;
});
```

### 3.5 useId `[Intermediate]`

**Vấn đề:** Khi SSR, IDs generated trên server và client có thể khác nhau => hydration mismatch.

**Giải pháp:** `useId` tạo unique ID consistent giữa server và client.

```tsx
import { useId } from 'react';

function FormField({ label }: { label: string }) {
  const id = useId(); // ':r1:', ':r2:'... stable giữa SSR và client

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </div>
  );
}
```

### 3.6 useSyncExternalStore `[Senior]`

**Vấn đề:** Khi subscribe vào external store (Redux, Zustand, browser APIs) trong concurrent mode, có thể đọc được giá trị **không nhất quán** giữa các components (tearing).

**Giải pháp:** `useSyncExternalStore` đảm bảo tất cả components đọc cùng 1 snapshot.

```tsx
import { useSyncExternalStore } from 'react';

// Custom hook: subscribe vào browser online status
function useOnlineStatus() {
  return useSyncExternalStore(
    // subscribe function
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    // getSnapshot (client)
    () => navigator.onLine,
    // getServerSnapshot (SSR)
    () => true
  );
}

function StatusBar() {
  const isOnline = useOnlineStatus();
  return <p>{isOnline ? 'Online' : 'Offline'}</p>;
}
```

---

## Phần 4: React 19 -- Actions, Server Components & React Compiler

React 19 là bản cập nhật lớn nhất kể từ Hooks. Tập trung vào: **đơn giản hóa async operations**, **Server Components**, và **tự động optimization**.

### 4.1 Hook `use()` -- đọc Promise và Context trong render `[Senior]`

**Vấn đề:** Đọc async data trong component cần nhiều boilerplate: useState + useEffect + loading/error states. Context chỉ đọc được ở top level (rules of hooks).

**Giải pháp:** `use()` có thể đọc Promise và Context **bất kỳ đâu** trong component, kể cả trong if/for (không bị ràng buộc như hooks thường).

```tsx
import { use, Suspense } from 'react';

// use() với Promise -- đọc data trực tiếp
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  // use() "đợi" Promise resolve, Suspense hiện fallback trong khi chờ
  const user = use(userPromise);

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

function App() {
  // Tạo Promise Ở NGOÀI component (hoặc trong useMemo)
  const userPromise = fetchUser(1);

  return (
    <Suspense fallback={<p>Loading user...</p>}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}

// use() với Context -- đọc context CÓ ĐIỀU KIỆN
function Button({ showIcon }: { showIcon: boolean }) {
  // TRƯỚC: useContext luôn đọc, không thể dùng trong if
  // const theme = useContext(ThemeContext);

  // REACT 19: use() có thể đọc trong if
  if (showIcon) {
    const theme = use(ThemeContext);
    return <button className={theme}>With Icon</button>;
  }
  return <button>No Icon</button>;
}
```

**Tại sao `use()` không phải là hook thường?** Vì nó không bắt đầu bằng `use` + tên (như useState), và không bị ràng buộc bởi Rules of Hooks. Nó là primitive mới của React.

---

### 4.2 Actions và `useActionState` `[Senior]`

**Vấn đề:** Xử lý form submission cần nhiều boilerplate: useState cho pending/error, try/catch, manual reset. Không có cách chuẩn.

**Giải pháp:** **Actions** -- truyền async function vào `action` prop của `<form>`. `useActionState` quản lý state của action (pending, result, error).

```tsx
import { useActionState } from 'react';

// Action function -- nhận state trước đó và formData
async function submitForm(
  previousState: { message: string } | null,
  formData: FormData
) {
  const name = formData.get('name') as string;

  if (!name) {
    return { message: 'Tên không được để trống!' };
  }

  // Gọi API
  const res = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ name }),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    return { message: 'Lỗi server, thử lại sau.' };
  }

  return { message: `Đã tạo user: ${name}` };
}

function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(submitForm, null);
  // state: kết quả trả về từ action
  // formAction: function truyền vào <form action>
  // isPending: đang xử lý hay không

  return (
    <form action={formAction}>
      <input name="name" placeholder="Tên" disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Đang tạo...' : 'Tạo user'}
      </button>
      {state?.message && <p>{state.message}</p>}
    </form>
  );
}
```

**Tại sao action thay vì onSubmit?**
- `action` tự động wrap trong transition (isPending miễn phí)
- Hoạt động với chưa có JavaScript (progressive enhancement)
- Tích hợp với Server Actions (React Server Components)

---

### 4.3 `useFormStatus` `[Intermediate]`

**Vấn đề:** Component con trong form cần biết form đang pending hay không, nhưng không có cách truy cập state của parent form.

**Giải pháp:** `useFormStatus` cho component con đọc pending state của form cha gần nhất.

```tsx
import { useFormStatus } from 'react-dom';

// Component con -- tự động biết form parent đang pending
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Đang gửi...' : 'Gửi'}
    </button>
  );
}

// Form parent -- không cần truyền pending xuống
function ContactForm() {
  async function sendMessage(formData: FormData) {
    'use server'; // Server Action (nếu dùng RSC)
    await saveMessage(formData);
  }

  return (
    <form action={sendMessage}>
      <input name="message" placeholder="Nhắn tin..." />
      <SubmitButton /> {/* Tự động biết form đang pending! */}
    </form>
  );
}
```

---

### 4.4 `useOptimistic` `[Senior]`

**Vấn đề:** Khi user like post hay gửi comment, phải đợi server response mới cập nhật UI => cảm giác chậm.

**Giải pháp:** `useOptimistic` hiển thị giá trị "lạc quan" ngay lập tức, rollback nếu lỗi.

```tsx
import { useOptimistic, useActionState } from 'react';

interface Message {
  id: number;
  text: string;
  sending?: boolean;
}

function MessageList({ messages }: { messages: Message[] }) {
  // optimisticMessages hiển thị ngay, kể cả khi server chưa trả lời
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    // Merge function: state hiện tại + giá trị mới => state optimistic
    (currentMessages, newMessage: string) => [
      ...currentMessages,
      { id: Date.now(), text: newMessage, sending: true },
    ]
  );

  async function sendMessage(formData: FormData) {
    const text = formData.get('message') as string;
    addOptimisticMessage(text); // Hiển thị NGAY LẬP TỨC

    // Gửi lên server -- nếu lỗi, React tự động rollback
    await fetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ text }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return (
    <div>
      <ul>
        {optimisticMessages.map(msg => (
          <li key={msg.id} style={{ opacity: msg.sending ? 0.6 : 1 }}>
            {msg.text}
            {msg.sending && ' (đang gửi...)'}
          </li>
        ))}
      </ul>

      <form action={sendMessage}>
        <input name="message" placeholder="Nhắn tin..." />
        <button type="submit">Gửi</button>
      </form>
    </div>
  );
}
```

---

### 4.5 ref là prop bình thường -- không cần forwardRef nữa `[Intermediate]`

**Vấn đề với React 15-18:** Để truyền ref vào function component, phải wrap trong `forwardRef` -- verbose và khó đọc.

**Giải pháp React 19:** `ref` là prop bình thường, `forwardRef` không còn cần thiết.

```tsx
// React 15-18: phải dùng forwardRef
import { forwardRef } from 'react';

const OldInput = forwardRef<HTMLInputElement, { label: string }>(
  function OldInput({ label }, ref) {
    return (
      <div>
        <label>{label}</label>
        <input ref={ref} />
      </div>
    );
  }
);

// React 19: ref là prop bình thường!
function NewInput({ label, ref }: { label: string; ref?: React.Ref<HTMLInputElement> }) {
  return (
    <div>
      <label>{label}</label>
      <input ref={ref} />
    </div>
  );
}

// Sử dụng -- giống nhau
function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  return <NewInput label="Email" ref={inputRef} />;
}
```

---

### 4.6 Ref cleanup functions `[Intermediate]`

**Vấn đề:** Trước React 19, khi element unmount, ref callback nhận `null`. Không có cách "cleanup" (VD: disconnect observer).

**Giải pháp:** Ref callback có thể return cleanup function, giống useEffect.

```tsx
// React 15-18: không có cleanup cho ref
function OldWay() {
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  // Phải dùng useEffect riêng để cleanup
  useEffect(() => {
    if (!element) return;
    const observer = new IntersectionObserver(entries => {
      console.log(entries);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return <div ref={setElement}>Observed</div>;
}

// React 19: ref callback return cleanup function
function NewWay() {
  return (
    <div
      ref={(element) => {
        if (!element) return;
        const observer = new IntersectionObserver(entries => {
          console.log(entries);
        });
        observer.observe(element);

        // Cleanup! Chạy khi element unmount
        return () => observer.disconnect();
      }}
    >
      Observed
    </div>
  );
}
```

---

### 4.7 Document Metadata trong components `[Intermediate]`

**Vấn đề:** Quản lý `<title>`, `<meta>`, `<link>` trong React phải dùng thư viện như react-helmet. Không có cách native.

**Giải pháp React 19:** Render `<title>`, `<meta>`, `<link>` trực tiếp trong component -- React tự động hoist lên `<head>`.

```tsx
// React 15-18: cần react-helmet
// import { Helmet } from 'react-helmet';
// <Helmet><title>My Page</title></Helmet>

// React 19: native support!
function BlogPost({ post }: { post: { title: string; description: string } }) {
  return (
    <article>
      <title>{post.title}</title>
      <meta name="description" content={post.description} />
      <link rel="canonical" href={`https://blog.com/${post.title}`} />

      <h1>{post.title}</h1>
      <p>{post.description}</p>
    </article>
  );
}
// React tự động di chuyển <title>, <meta>, <link> vào <head>!
```

---

### 4.8 Server Components (RSC) `[Senior]`

**Vấn đề:**
1. Client phải download JavaScript cho mọi component, kể cả những component chỉ render HTML tĩnh
2. Data fetching phải qua API: server -> API -> client -> render
3. Secrets (API keys, DB connections) không thể dùng trên client

**Giải pháp:** Server Components chạy **chỉ trên server**, trả về HTML. Không gửi JavaScript xuống client.

```tsx
// Server Component (mặc định trong Next.js App Router)
// File: app/users/page.tsx

// Truy cập database TRỰC TIẾP -- không cần API route!
async function UsersPage() {
  const users = await db.query('SELECT * FROM users');

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(u => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
      {/* SearchBar là Client Component -- có interactivity */}
      <SearchBar />
    </div>
  );
}

// Client Component -- cần 'use client' directive
// File: app/users/SearchBar.tsx
'use client';

import { useState } from 'react';

function SearchBar() {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

**Server Components vs Client Components:**

| Tiêu chí | Server Component | Client Component |
|----------|-----------------|-----------------|
| Chạy ở đâu | Chỉ server | Server (SSR) + Client |
| JavaScript gửi xuống client | **Không** | **Có** |
| Dùng hooks (useState, useEffect) | **Không** | **Có** |
| Truy cập database/file system | **Có** | **Không** |
| Dùng secrets (API keys) | **Có** | **Không** |
| Event handlers (onClick) | **Không** | **Có** |
| Directive | Không cần (mặc định) | `'use client'` |

---

### 4.9 Server Actions `[Senior]`

**Vấn đề:** Client muốn gọi logic trên server phải tự tạo API route, xử lý serialization, error handling.

**Giải pháp:** Server Actions -- gọi function trên server từ client, như gọi function bình thường.

```tsx
// Server Action -- chạy trên server
// File: app/actions.ts
'use server';

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  // Truy cập DB trực tiếp -- đây là server code!
  await db.insert(users).values({ name, email });

  // Revalidate cache
  revalidatePath('/users');
}

// Client Component -- gọi Server Action
// File: app/users/CreateForm.tsx
'use client';

import { createUser } from '../actions';

function CreateUserForm() {
  return (
    <form action={createUser}>
      <input name="name" placeholder="Tên" />
      <input name="email" placeholder="Email" />
      <button type="submit">Tạo</button>
    </form>
  );
}
// Khi submit, React tự động:
// 1. Serialize FormData
// 2. Gửi POST request đến server
// 3. Chạy createUser() trên server
// 4. Revalidate và cập nhật UI
```

---

### 4.10 React Compiler (React Forget) `[Senior]`

**Vấn đề:** Developer phải tự quyết định khi nào dùng `useMemo`, `useCallback`, `React.memo`. Dùng sai => performance xấu hoặc overhead thừa.

**Giải pháp:** **React Compiler** tự động analyze code và thêm memoization cho bạn. Không cần viết `useMemo`/`useCallback` thủ công nữa.

```tsx
// TRƯỚC React Compiler: phải tự memo
function ProductList({ products, query }: Props) {
  const filtered = useMemo(
    () => products.filter(p => p.name.includes(query)),
    [products, query]
  );

  const handleSelect = useCallback((id: string) => {
    setSelected(id);
  }, []);

  return <List items={filtered} onSelect={handleSelect} />;
}

// SAU React Compiler: viết bình thường, compiler tự optimize!
function ProductList({ products, query }: Props) {
  // Compiler tự động memo giá trị này
  const filtered = products.filter(p => p.name.includes(query));

  // Compiler tự động memo function này
  const handleSelect = (id: string) => {
    setSelected(id);
  };

  return <List items={filtered} onSelect={handleSelect} />;
}
```

**React Compiler yêu cầu:**
- Code tuân theo Rules of React (pure components, không mutation)
- Cài đặt `babel-plugin-react-compiler` hoặc `eslint-plugin-react-compiler`
- Hiện tại đang được dùng tại Meta (Instagram, Facebook)

---

## Phần 5: Bảng tổng hợp -- mỗi tính năng và lý do ra đời

| Tính năng | Phiên bản | Vấn đề giải quyết | Thay thế cái gì |
|-----------|-----------|-------------------|-----------------|
| Fiber | 16 | Render đồng bộ block main thread | Stack reconciler |
| Error Boundaries | 16 | 1 lỗi crash cả app | Không có |
| Portals | 16 | Modal/tooltip bị z-index, overflow issues | Hack DOM thủ công |
| Fragments | 16 | Wrapper div thừa | Không có |
| New Context API | 16.3 | Prop drilling, experimental API cũ | Context cũ (experimental) |
| React.memo | 16.6 | Function component không thể skip re-render | PureComponent (chỉ class) |
| React.lazy + Suspense | 16.6 | Code splitting cần thư viện riêng | react-loadable |
| Hooks | 16.8 | Class component problems (this, lifecycle, reuse logic) | Class components |
| JSX Transform | 17 | Phải import React mỗi file | `import React` |
| createRoot | 18 | Cần API mới cho concurrent | `ReactDOM.render` |
| Automatic Batching | 18 | Chỉ batch trong event handlers | Manual batching |
| useTransition | 18 | UI lag khi render nặng | Debounce/throttle |
| useDeferredValue | 18 | Không kiểm soát được state update | Không có |
| useId | 18 | Hydration mismatch IDs | Math.random() / counter |
| useSyncExternalStore | 18 | Tearing trong concurrent mode | Không có |
| `use()` | 19 | Boilerplate đọc async data | useState + useEffect |
| useActionState | 19 | Form submission boilerplate | useState + try/catch |
| useFormStatus | 19 | Child không biết form pending | Prop drilling isPending |
| useOptimistic | 19 | UI chậm chờ server response | Manual optimistic state |
| ref as prop | 19 | forwardRef verbose | forwardRef |
| Ref cleanup | 19 | Không cleanup được ref | useEffect workaround |
| Document metadata | 19 | Cần react-helmet cho title/meta | react-helmet |
| Server Components | 19 | Client JS quá nhiều, không truy cập DB | API routes |
| Server Actions | 19 | Tự tạo API route cho mutations | REST API / tRPC |
| React Compiler | 19 | Tự dùng useMemo/useCallback | useMemo, useCallback |

---

## Lỗi thường gặp khi trả lời

1. **Nói "React 19 chỉ là minor update"** -- Sai. React 19 là thay đổi paradigm lớn: Actions thay đổi cách xử lý forms, Server Components thay đổi cách nghĩ về client/server boundary, React Compiler thay đổi cách optimize.

2. **Nhầm Server Components với SSR** -- SSR render component thành HTML trên server rồi **gửi JavaScript xuống client** để hydrate. Server Components **không gửi JavaScript** -- chỉ HTML. Chúng khác nhau về bản chất.

3. **Nói "Hooks thay thế class components"** -- Đúng về logic, nhưng Error Boundaries vẫn phải dùng class component (chưa có hook tương đương). Đây là ngoại lệ duy nhất.

4. **Không biết lý do ra đời của từng feature** -- Trong phỏng vấn, chỉ biết "cách dùng" là chưa đủ. Bạn cần giải thích **vấn đề gì** mà feature đó giải quyết. VD: useTransition giải quyết UI lag, không phải chỉ là "hook mới".

5. **Nhầm `use()` với `useEffect` cho data fetching** -- `use()` đọc Promise **trong render phase** và tích hợp với Suspense. `useEffect` chạy **sau render**. Chúng có model hoàn toàn khác nhau.

6. **Không biết React Compiler là gì** -- Đây là xu hướng tương lai của React. Compiler sẽ làm cho useMemo/useCallback trở nên không cần thiết. Hiểu điều này cho thấy bạn follow React ecosystem.
