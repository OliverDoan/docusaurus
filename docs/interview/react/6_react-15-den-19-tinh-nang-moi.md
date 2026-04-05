---
sidebar_position: 6
title: "React 15 → 19: Toàn bộ tính năng mới & lý do ra đời"
---

# React 15 → 19: Toàn bộ tính năng mới & lý do ra đời

Neu ban hoc React tu phien ban 15, ban da bo lo rat nhieu thay doi lon. Bai nay se di qua **toan bo** nhung tinh nang moi tu React 16 den React 19, giai thich **ly do** tung tinh nang ra doi, va cho code vi du thuc te.

---

## Tong quan: React qua cac phien ban

| Phien ban | Nam | Thay doi lon nhat |
|-----------|-----|-------------------|
| React 15 | 2016 | Stack reconciler, class components, `createClass` |
| React 16 | 2017 | **Fiber**, Error Boundaries, Portals, Fragments |
| React 16.3 | 2018 | **New Context API**, `getDerivedStateFromProps` |
| React 16.6 | 2018 | `React.memo`, `React.lazy`, `Suspense` |
| React 16.8 | 2019 | **Hooks** -- thay doi lon nhat ke tu React ra doi |
| React 17 | 2020 | Khong co tinh nang moi (buoc dem) |
| React 18 | 2022 | **Concurrent rendering**, automatic batching, `useTransition` |
| React 19 | 2024 | **Actions**, `use()`, Server Components, React Compiler |

---

## Phan 1: React 16 -- Viet lai tu dau

### 1.1 Fiber Architecture `[Senior]`

**Van de voi React 15:** React 15 dung **Stack Reconciler** -- khi bat dau render, no chay dong bo tu dau den cuoi, **khong the dung giua chung**. Voi component tree lon, main thread bi block, UI lag, animation giat.

**Giai phap:** React 16 viet lai hoan toan reconciler thanh **Fiber**. Fiber chia render thanh cac "units of work" nho, co the:
- Tam dung va tiep tuc sau
- Uu tien cong viec (user input > animation > data fetch)
- Huy cong viec khong can thiet

```tsx
// React 15: render dong bo, block main thread
// render(App) -> render(Header) -> render(Nav) -> ... -> XONG
// Neu tree co 10,000 nodes, main thread bi block ca 10,000 nodes

// React 16+: render co the bi ngat
// render(App) -> render(Header) -> [user click!] -> xu ly click -> tiep tuc render(Nav)
```

**Tai sao quan trong?** Fiber la nen tang cho tat ca concurrent features sau nay (useTransition, Suspense, Server Components). Khong co Fiber, React 18 va 19 khong the ton tai.

---

### 1.2 Error Boundaries `[Intermediate]`

**Van de voi React 15:** Mot loi JavaScript trong bat ky component nao se **crash toan bo app** -- white screen, khong co cach recover.

**Giai phap:** Error Boundaries -- class components co the "bat" loi cua children va hien thi fallback UI.

```tsx
// React 15: loi 1 component = crash ca app
// React 16+: Error Boundary bat loi va hien fallback

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
    // Log loi len monitoring service (Sentry, DataDog...)
    console.error('Error caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Su dung
function App() {
  return (
    <ErrorBoundary fallback={<p>Co loi xay ra. Vui long thu lai.</p>}>
      <UserProfile />
    </ErrorBoundary>
  );
}
```

**Luu y:** Error Boundaries chi bat loi trong **render**, lifecycle methods, va constructors. Khong bat duoc loi trong event handlers, async code, hay SSR.

---

### 1.3 Portals `[Intermediate]`

**Van de:** Modals, tooltips, dropdowns can render **ngoai** parent DOM hierarchy (de tranh `overflow: hidden`, z-index issues), nhung van thuoc React tree.

**Giai phap:** `ReactDOM.createPortal(child, container)` -- render child vao bat ky DOM node nao, nhung events van bubble len React tree binh thuong.

```tsx
import { createPortal } from 'react-dom';

function Modal({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) {
  if (!isOpen) return null;

  // Render vao document.body thay vi parent component
  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
      </div>
    </div>,
    document.body
  );
}

// onClick trong Modal VAN bubble len App (React tree, khong phai DOM tree)
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

**Van de voi React 15:** Moi component PHAI return **mot** root element. Muon tra ve nhieu elements phai wrap trong `<div>`, tao ra DOM thua.

**Giai phap:** `<React.Fragment>` hoac cu phap ngan `<>...</>` -- nhom elements ma khong tao DOM node.

```tsx
// React 15: phai co wrapper div
function OldWay() {
  return (
    <div> {/* div nay khong can thiet, lam hong CSS */}
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

// Fragment voi key (trong loops)
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

**Van de:** React 15 co context API nhung no la **experimental**, khong stable, va bi warning khi dung. Prop drilling la van de lon.

**Giai phap:** Context API moi voi `createContext`, `Provider`, va `Consumer` (sau nay la `useContext` hook).

```tsx
// React 15: experimental context (KHONG NEN DUNG)
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
  // Khong can truyen props qua tung cap
  return <ThemedButton />;
}

function ThemedButton() {
  const theme = useContext(ThemeContext); // 'dark'
  return <button className={theme}>Click me</button>;
}
```

---

### 1.6 React.memo (React 16.6) `[Intermediate]`

**Van de:** `PureComponent` chi hoat dong voi class components. Function components khong co cach skip re-render khi props khong doi.

**Giai phap:** `React.memo` -- HOC cho function components, tuong duong `PureComponent`.

```tsx
// React 15: chi class PureComponent
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

### 1.7 Hooks (React 16.8) -- Thay doi lon nhat `[Intermediate]`

**Van de voi class components:**
1. **`this` binding** -- phai bind methods trong constructor hoac dung arrow functions
2. **Lifecycle methods phuc tap** -- logic bi trai rai giua `componentDidMount`, `componentDidUpdate`, `componentWillUnmount`
3. **Khong the reuse stateful logic** -- HOC va render props gay wrapper hell
4. **Class kho minify/optimize** hon functions

**Giai phap:** Hooks -- dung state va lifecycle trong function components.

```tsx
// React 15: class component
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    this.increment = this.increment.bind(this); // Phai bind!
  }

  componentDidMount() {
    document.title = `Count: ${this.state.count}`;
  }

  componentDidUpdate() {
    document.title = `Count: ${this.state.count}`; // Logic bi lap lai!
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

// React 16.8+: hooks -- ngan gon, ro rang
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  // Mount + update logic o MOT CHO
  useEffect(() => {
    document.title = `Count: ${count}`;
    return () => { /* cleanup */ };
  }, [count]);

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Bang tong hop Hooks co ban

| Hook | Muc dich | Thay the class API |
|------|----------|--------------------|
| `useState` | Luu state | `this.state` + `this.setState` |
| `useEffect` | Side effects | `componentDidMount` + `componentDidUpdate` + `componentWillUnmount` |
| `useContext` | Doc Context | `static contextType` / `Context.Consumer` |
| `useReducer` | State phuc tap | `this.setState` voi reducer logic |
| `useRef` | Mutable ref / DOM ref | `React.createRef()` |
| `useMemo` | Ghi nho gia tri | Manual trong `shouldComponentUpdate` |
| `useCallback` | Ghi nho function | Bind trong constructor |

---

## Phan 2: React 17 -- Buoc dem, khong co tinh nang moi

### 2.1 New JSX Transform `[Intermediate]`

**Van de:** Moi file dung JSX phai `import React from 'react'` o dong dau, du khong dung React truc tiep. Thua va kho chiu.

**Giai phap:** JSX transform moi -- compiler tu dong them import, khong can viet thu cong nua.

```tsx
// React 15-16: BAT BUOC import React
import React from 'react'; // Xoa dong nay => loi

function App() {
  return <h1>Hello</h1>;
}

// React 17+: KHONG CAN import React
function App() {
  return <h1>Hello</h1>; // OK, compiler tu xu ly
}
```

### 2.2 Event Delegation thay doi `[Senior]`

**Van de:** React 15-16 attach tat ca events vao `document`. Khi co nhieu React trees (micro-frontends), events bi xung dot.

**Giai phap:** React 17 attach events vao **root DOM container** thay vi document.

```tsx
// React 15-16: document.addEventListener(...)
// React 17+: rootElement.addEventListener(...)
// => An toan cho micro-frontends va nhieu React roots
```

---

## Phan 3: React 18 -- Concurrent React

### 3.1 createRoot API `[Intermediate]`

**Van de:** `ReactDOM.render()` luon render dong bo. Can API moi de opt-in concurrent features.

**Giai phap:** `createRoot` -- bat buoc de dung concurrent features.

```tsx
// React 15-17: cu
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));

// React 18+: moi -- bat buoc cho concurrent features
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

### 3.2 Automatic Batching `[Intermediate]`

**Van de voi React 15-17:** Chi batch state updates trong React event handlers. Trong `setTimeout`, `Promise`, native events -- moi `setState` gay 1 re-render rieng.

**Giai phap:** React 18 batch **tat ca** state updates, bat ke context.

```tsx
// React 15-17: trong setTimeout, moi setState = 1 render
setTimeout(() => {
  setCount(1);  // render 1
  setFlag(true); // render 2 => 2 renders!
}, 100);

// React 18+: luon batch
setTimeout(() => {
  setCount(1);   // batch
  setFlag(true); // batch => chi 1 render!
}, 100);

// Muon force render ngay (hiem khi can):
import { flushSync } from 'react-dom';
flushSync(() => setCount(1));  // render ngay
flushSync(() => setFlag(true)); // render ngay
```

### 3.3 useTransition `[Senior]`

**Van de:** Khi user go search, moi keystroke trigger render danh sach lon => input bi lag.

**Giai phap:** `useTransition` danh dau state update la "non-urgent". React uu tien render input truoc, defer render danh sach.

```tsx
import { useState, useTransition } from 'react';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value); // Urgent: cap nhat input ngay

    startTransition(() => {
      // Non-urgent: React co the interrupt neu co input moi
      setResults(filterHugeList(e.target.value));
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <p>Dang tim...</p>}
      <ul>
        {results.map(r => <li key={r}>{r}</li>)}
      </ul>
    </div>
  );
}
```

### 3.4 useDeferredValue `[Senior]`

**Van de:** Giong useTransition nhung cho truong hop ban **khong kiem soat** state update (VD: props tu parent).

**Giai phap:** `useDeferredValue` tao phien ban "lag" cua gia tri.

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
  // Render 10,000 items -- se dung gia tri "cu" khi user dang go
  const items = filterItems(query);
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>;
});
```

### 3.5 useId `[Intermediate]`

**Van de:** Khi SSR, IDs generated tren server va client co the khac nhau => hydration mismatch.

**Giai phap:** `useId` tao unique ID consistent giua server va client.

```tsx
import { useId } from 'react';

function FormField({ label }: { label: string }) {
  const id = useId(); // ':r1:', ':r2:'... stable giua SSR va client

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </div>
  );
}
```

### 3.6 useSyncExternalStore `[Senior]`

**Van de:** Khi subscribe vao external store (Redux, Zustand, browser APIs) trong concurrent mode, co the doc duoc gia tri **khong nhat quan** giua cac components (tearing).

**Giai phap:** `useSyncExternalStore` dam bao tat ca components doc cung 1 snapshot.

```tsx
import { useSyncExternalStore } from 'react';

// Custom hook: subscribe vao browser online status
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

## Phan 4: React 19 -- Actions, Server Components & React Compiler

React 19 la ban cap nhat lon nhat ke tu Hooks. Tap trung vao: **don gian hoa async operations**, **Server Components**, va **tu dong optimization**.

### 4.1 Hook `use()` -- doc Promise va Context trong render `[Senior]`

**Van de:** Doc async data trong component can nhieu boilerplate: useState + useEffect + loading/error states. Context chi doc duoc o top level (rules of hooks).

**Giai phap:** `use()` co the doc Promise va Context **bat ky dau** trong component, ke ca trong if/for (khong bi rang buoc nhu hooks thuong).

```tsx
import { use, Suspense } from 'react';

// use() voi Promise -- doc data truc tiep
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  // use() "doi" Promise resolve, Suspense hien fallback trong khi cho
  const user = use(userPromise);

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

function App() {
  // Tao Promise O NGOAI component (hoac trong useMemo)
  const userPromise = fetchUser(1);

  return (
    <Suspense fallback={<p>Loading user...</p>}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}

// use() voi Context -- doc context CO DIEU KIEN
function Button({ showIcon }: { showIcon: boolean }) {
  // TRUOC: useContext luon doc, khong the dung trong if
  // const theme = useContext(ThemeContext);

  // REACT 19: use() co the doc trong if
  if (showIcon) {
    const theme = use(ThemeContext);
    return <button className={theme}>With Icon</button>;
  }
  return <button>No Icon</button>;
}
```

**Tai sao `use()` khong phai la hook thuong?** Vi no khong bat dau bang `use` + ten (nhu useState), va khong bi rang buoc boi Rules of Hooks. No la primitive moi cua React.

---

### 4.2 Actions va `useActionState` `[Senior]`

**Van de:** Xu ly form submission can nhieu boilerplate: useState cho pending/error, try/catch, manual reset. Khong co cach chuan.

**Giai phap:** **Actions** -- truyen async function vao `action` prop cua `<form>`. `useActionState` quan ly state cua action (pending, result, error).

```tsx
import { useActionState } from 'react';

// Action function -- nhan state truoc do va formData
async function submitForm(
  previousState: { message: string } | null,
  formData: FormData
) {
  const name = formData.get('name') as string;

  if (!name) {
    return { message: 'Ten khong duoc de trong!' };
  }

  // Goi API
  const res = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ name }),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    return { message: 'Loi server, thu lai sau.' };
  }

  return { message: `Da tao user: ${name}` };
}

function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(submitForm, null);
  // state: ket qua tra ve tu action
  // formAction: function truyen vao <form action>
  // isPending: dang xu ly hay khong

  return (
    <form action={formAction}>
      <input name="name" placeholder="Ten" disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Dang tao...' : 'Tao user'}
      </button>
      {state?.message && <p>{state.message}</p>}
    </form>
  );
}
```

**Tai sao action thay vi onSubmit?**
- `action` tu dong wrap trong transition (isPending mien phi)
- Hoat dong voi chua co JavaScript (progressive enhancement)
- Tich hop voi Server Actions (React Server Components)

---

### 4.3 `useFormStatus` `[Intermediate]`

**Van de:** Component con trong form can biet form dang pending hay khong, nhung khong co cach truy cap state cua parent form.

**Giai phap:** `useFormStatus` cho component con doc pending state cua form cha gan nhat.

```tsx
import { useFormStatus } from 'react-dom';

// Component con -- tu dong biet form parent dang pending
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Dang gui...' : 'Gui'}
    </button>
  );
}

// Form parent -- khong can truyen pending xuong
function ContactForm() {
  async function sendMessage(formData: FormData) {
    'use server'; // Server Action (neu dung RSC)
    await saveMessage(formData);
  }

  return (
    <form action={sendMessage}>
      <input name="message" placeholder="Nhan tin..." />
      <SubmitButton /> {/* Tu dong biet form dang pending! */}
    </form>
  );
}
```

---

### 4.4 `useOptimistic` `[Senior]`

**Van de:** Khi user like post hay gui comment, phai doi server response moi cap nhat UI => cam giac cham.

**Giai phap:** `useOptimistic` hien thi gia tri "lac quan" ngay lap tuc, rollback neu loi.

```tsx
import { useOptimistic, useActionState } from 'react';

interface Message {
  id: number;
  text: string;
  sending?: boolean;
}

function MessageList({ messages }: { messages: Message[] }) {
  // optimisticMessages hien thi ngay, ke ca khi server chua tra loi
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    // Merge function: state hien tai + gia tri moi => state optimistic
    (currentMessages, newMessage: string) => [
      ...currentMessages,
      { id: Date.now(), text: newMessage, sending: true },
    ]
  );

  async function sendMessage(formData: FormData) {
    const text = formData.get('message') as string;
    addOptimisticMessage(text); // Hien thi NGAY LAP TUC

    // Gui len server -- neu loi, React tu dong rollback
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
            {msg.sending && ' (dang gui...)'}
          </li>
        ))}
      </ul>

      <form action={sendMessage}>
        <input name="message" placeholder="Nhan tin..." />
        <button type="submit">Gui</button>
      </form>
    </div>
  );
}
```

---

### 4.5 ref la prop binh thuong -- khong can forwardRef nua `[Intermediate]`

**Van de voi React 15-18:** De truyen ref vao function component, phai wrap trong `forwardRef` -- verbose va kho doc.

**Giai phap React 19:** `ref` la prop binh thuong, `forwardRef` khong con can thiet.

```tsx
// React 15-18: phai dung forwardRef
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

// React 19: ref la prop binh thuong!
function NewInput({ label, ref }: { label: string; ref?: React.Ref<HTMLInputElement> }) {
  return (
    <div>
      <label>{label}</label>
      <input ref={ref} />
    </div>
  );
}

// Su dung -- giong nhau
function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  return <NewInput label="Email" ref={inputRef} />;
}
```

---

### 4.6 Ref cleanup functions `[Intermediate]`

**Van de:** Truoc React 19, khi element unmount, ref callback nhan `null`. Khong co cach "cleanup" (VD: disconnect observer).

**Giai phap:** Ref callback co the return cleanup function, giong useEffect.

```tsx
// React 15-18: khong co cleanup cho ref
function OldWay() {
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  // Phai dung useEffect rieng de cleanup
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

        // Cleanup! Chay khi element unmount
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

**Van de:** Quan ly `<title>`, `<meta>`, `<link>` trong React phai dung thu vien nhu react-helmet. Khong co cach native.

**Giai phap React 19:** Render `<title>`, `<meta>`, `<link>` truc tiep trong component -- React tu dong hoist len `<head>`.

```tsx
// React 15-18: can react-helmet
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
// React tu dong di chuyen <title>, <meta>, <link> vao <head>!
```

---

### 4.8 Server Components (RSC) `[Senior]`

**Van de:**
1. Client phai download JavaScript cho moi component, ke ca nhung component chi render HTML tinh
2. Data fetching phai qua API: server -> API -> client -> render
3. Secrets (API keys, DB connections) khong the dung tren client

**Giai phap:** Server Components chay **chi tren server**, tra ve HTML. Khong gui JavaScript xuong client.

```tsx
// Server Component (mac dinh trong Next.js App Router)
// File: app/users/page.tsx

// Truy cap database TRUC TIEP -- khong can API route!
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
      {/* SearchBar la Client Component -- co interactivity */}
      <SearchBar />
    </div>
  );
}

// Client Component -- can 'use client' directive
// File: app/users/SearchBar.tsx
'use client';

import { useState } from 'react';

function SearchBar() {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

**Server Components vs Client Components:**

| Tieu chi | Server Component | Client Component |
|----------|-----------------|-----------------|
| Chay o dau | Chi server | Server (SSR) + Client |
| JavaScript gui xuong client | **Khong** | **Co** |
| Dung hooks (useState, useEffect) | **Khong** | **Co** |
| Truy cap database/file system | **Co** | **Khong** |
| Dung secrets (API keys) | **Co** | **Khong** |
| Event handlers (onClick) | **Khong** | **Co** |
| Directive | Khong can (mac dinh) | `'use client'` |

---

### 4.9 Server Actions `[Senior]`

**Van de:** Client muon goi logic tren server phai tu tao API route, xu ly serialization, error handling.

**Giai phap:** Server Actions -- goi function tren server tu client, nhu goi function binh thuong.

```tsx
// Server Action -- chay tren server
// File: app/actions.ts
'use server';

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  // Truy cap DB truc tiep -- day la server code!
  await db.insert(users).values({ name, email });

  // Revalidate cache
  revalidatePath('/users');
}

// Client Component -- goi Server Action
// File: app/users/CreateForm.tsx
'use client';

import { createUser } from '../actions';

function CreateUserForm() {
  return (
    <form action={createUser}>
      <input name="name" placeholder="Ten" />
      <input name="email" placeholder="Email" />
      <button type="submit">Tao</button>
    </form>
  );
}
// Khi submit, React tu dong:
// 1. Serialize FormData
// 2. Gui POST request den server
// 3. Chay createUser() tren server
// 4. Revalidate va cap nhat UI
```

---

### 4.10 React Compiler (React Forget) `[Senior]`

**Van de:** Developer phai tu quyet dinh khi nao dung `useMemo`, `useCallback`, `React.memo`. Dung sai => performance xau hoac overhead thua.

**Giai phap:** **React Compiler** tu dong analyze code va them memoization cho ban. Khong can viet `useMemo`/`useCallback` thu cong nua.

```tsx
// TRUOC React Compiler: phai tu memo
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

// SAU React Compiler: viet binh thuong, compiler tu optimize!
function ProductList({ products, query }: Props) {
  // Compiler tu dong memo gia tri nay
  const filtered = products.filter(p => p.name.includes(query));

  // Compiler tu dong memo function nay
  const handleSelect = (id: string) => {
    setSelected(id);
  };

  return <List items={filtered} onSelect={handleSelect} />;
}
```

**React Compiler yeu cau:**
- Code tuan theo Rules of React (pure components, khong mutation)
- Cai dat `babel-plugin-react-compiler` hoac `eslint-plugin-react-compiler`
- Hien tai dang duoc dung tai Meta (Instagram, Facebook)

---

## Phan 5: Bang tong hop -- moi tinh nang va ly do ra doi

| Tinh nang | Phien ban | Van de giai quyet | Thay the cai gi |
|-----------|-----------|-------------------|-----------------|
| Fiber | 16 | Render dong bo block main thread | Stack reconciler |
| Error Boundaries | 16 | 1 loi crash ca app | Khong co |
| Portals | 16 | Modal/tooltip bi z-index, overflow issues | Hack DOM thu cong |
| Fragments | 16 | Wrapper div thua | Khong co |
| New Context API | 16.3 | Prop drilling, experimental API cu | Context cu (experimental) |
| React.memo | 16.6 | Function component khong the skip re-render | PureComponent (chi class) |
| React.lazy + Suspense | 16.6 | Code splitting can thu vien rieng | react-loadable |
| Hooks | 16.8 | Class component problems (this, lifecycle, reuse logic) | Class components |
| JSX Transform | 17 | Phai import React moi file | `import React` |
| createRoot | 18 | Can API moi cho concurrent | `ReactDOM.render` |
| Automatic Batching | 18 | Chi batch trong event handlers | Manual batching |
| useTransition | 18 | UI lag khi render nang | Debounce/throttle |
| useDeferredValue | 18 | Khong kiem soat duoc state update | Khong co |
| useId | 18 | Hydration mismatch IDs | Math.random() / counter |
| useSyncExternalStore | 18 | Tearing trong concurrent mode | Khong co |
| `use()` | 19 | Boilerplate doc async data | useState + useEffect |
| useActionState | 19 | Form submission boilerplate | useState + try/catch |
| useFormStatus | 19 | Child khong biet form pending | Prop drilling isPending |
| useOptimistic | 19 | UI cham cho server response | Manual optimistic state |
| ref as prop | 19 | forwardRef verbose | forwardRef |
| Ref cleanup | 19 | Khong cleanup duoc ref | useEffect workaround |
| Document metadata | 19 | Can react-helmet cho title/meta | react-helmet |
| Server Components | 19 | Client JS qua nhieu, khong truy cap DB | API routes |
| Server Actions | 19 | Tu tao API route cho mutations | REST API / tRPC |
| React Compiler | 19 | Tu dung useMemo/useCallback | useMemo, useCallback |

---

## Loi thuong gap khi tra loi

1. **Noi "React 19 chi la minor update"** -- Sai. React 19 la thay doi paradigm lon: Actions thay doi cach xu ly forms, Server Components thay doi cach nghi ve client/server boundary, React Compiler thay doi cach optimize.

2. **Nham Server Components voi SSR** -- SSR render component thanh HTML tren server roi **gui JavaScript xuong client** de hydrate. Server Components **khong gui JavaScript** -- chi HTML. Chung khac nhau ve ban chat.

3. **Noi "Hooks thay the class components"** -- Dung ve logic, nhung Error Boundaries van phai dung class component (chua co hook tuong duong). Day la ngoai le duy nhat.

4. **Khong biet ly do ra doi cua tung feature** -- Trong phong van, chi biet "cach dung" la chua du. Ban can giai thich **van de gi** ma feature do giai quyet. VD: useTransition giai quyet UI lag, khong phai chi la "hook moi".

5. **Nham `use()` voi `useEffect` cho data fetching** -- `use()` doc Promise **trong render phase** va tich hop voi Suspense. `useEffect` chay **sau render**. Chung co model hoan toan khac nhau.

6. **Khong biet React Compiler la gi** -- Day la xu huong tuong lai cua React. Compiler se lam cho useMemo/useCallback tro nen khong can thiet. Hieu dieu nay cho thay ban follow React ecosystem.
