---
sidebar_position: 4
title: "HOC, Render Props, Compound Components, Custom Hooks"
---

# HOC, Render Props, Compound Components, Custom Hooks

React patterns là những cách tổ chức code để **tái sử dụng logic**, **tách biệt concerns**, và **làm code dễ bảo trì**. Trong phỏng vấn, người ta muốn biết bạn có hiểu các patterns này không, tại sao chúng tồn tại, và khi nào nên dùng cái nào.

---

## Câu 1: Higher-Order Components (HOC) -- pattern này hoạt động ra sao? Ưu và nhược điểm? `[Intermediate]`

### Giải thích lý thuyết

**HOC** là một function nhận vào component và trả về component mới có thêm logic. Đây là pattern lấy cảm hứng từ higher-order functions trong functional programming.

**Công thức**: `const EnhancedComponent = hoc(WrappedComponent)`

HOC phổ biến trong class component era (trước hooks). VD: `connect()` của Redux, `withRouter` của React Router, `withStyles` của Material UI.

**Ưu điểm**:
- Tái sử dụng logic giữa nhiều components
- Không thay đổi component gốc (composition)
- Có thể compose nhiều HOCs

**Nhược điểm**:
- "Wrapper hell" -- nhiều HOC chồng lên nhau
- Props collision -- HOC và component có thể có props trùng tên
- Khó debug -- không rõ props từ đâu đến
- Không linh hoạt bằng hooks

### Code ví dụ

```tsx
import { useState, useEffect, ComponentType } from 'react';

// HOC: thêm loading state
function withLoading<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  return function WithLoadingComponent(
    props: P & { isLoading: boolean }
  ) {
    const { isLoading, ...rest } = props;

    if (isLoading) {
      return <div className="spinner">Loading...</div>;
    }

    return <WrappedComponent {...(rest as P)} />;
  };
}

// HOC: thêm authentication check
function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  return function WithAuthComponent(props: P) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      setChecking(false);
    }, []);

    if (checking) return <p>Checking auth...</p>;
    if (!isAuthenticated) return <p>Please login</p>;

    return <WrappedComponent {...props} />;
  };
}

// Sử dụng
function UserProfile({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}

// Compose nhiều HOCs -- "wrapper hell"
const EnhancedProfile = withAuth(withLoading(UserProfile));

// Sử dụng
function App() {
  return <EnhancedProfile name="John" isLoading={false} />;
}
```

### Đáp án mẫu

> "HOC là function nhận component và trả về component mới với logic thêm vào. Pattern này phổ biến trước hooks -- connect() của Redux là ví dụ điển hình. Nhược điểm chính là wrapper hell, props collision, và khó debug. Ngày nay, custom hooks thay thế hầu hết use cases của HOC vì đơn giản và minh bạch hơn."

---

## Câu 2: Render Props pattern -- hoạt động thế nào? So với HOC? `[Intermediate]`

### Giải thích lý thuyết

**Render Props** là pattern truyền một function làm prop, function này nhận data và trả về JSX. Component "chia sẻ logic" gọi function này để render UI.

Có 2 dạng:
1. **render prop**: `<Mouse render={(mouse) => <Cat position={mouse} />} />`
2. **children as function**: `<Mouse>{(mouse) => <Cat position={mouse} />}</Mouse>`

**Ưu điểm so với HOC**:
- Không có wrapper hell (composition rõ ràng hơn)
- Không có props collision
- Linh hoạt hơn -- quyết định render tại nơi sử dụng

**Nhược điểm**:
- "Callback hell" nếu nhiều render props chồng nhau
- Performance: inline function tạo mới mỗi render (có thể fix với useCallback)
- Đã được thay thế phần lớn bởi custom hooks

### Code ví dụ

```tsx
import { useState, useEffect } from 'react';

// Render Props: chia sẻ mouse position logic
interface MousePosition {
  x: number;
  y: number;
}

interface MouseTrackerProps {
  children: (mouse: MousePosition) => React.ReactNode;
}

function MouseTracker({ children }: MouseTrackerProps) {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return <>{children(position)}</>;
}

// Sử dụng -- quyết định render UI tại nơi sử dụng
function App() {
  return (
    <MouseTracker>
      {(mouse) => (
        <div>
          <p>Mouse: {mouse.x}, {mouse.y}</p>
          <div
            style={{
              position: 'absolute',
              left: mouse.x - 10,
              top: mouse.y - 10,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'red',
            }}
          />
        </div>
      )}
    </MouseTracker>
  );
}

// Render Props cho data fetching
interface FetchProps<T> {
  url: string;
  children: (data: {
    data: T | null;
    loading: boolean;
    error: Error | null;
  }) => React.ReactNode;
}

function Fetch<T>({ url, children }: FetchProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return <>{children({ data, loading, error })}</>;
}

// Sử dụng
function UserPage() {
  return (
    <Fetch<User[]> url="/api/users">
      {({ data, loading, error }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error: {error.message}</p>;
        return (
          <ul>
            {data?.map((u) => <li key={u.id}>{u.name}</li>)}
          </ul>
        );
      }}
    </Fetch>
  );
}
```

### Đáp án mẫu

> "Render Props truyền function làm prop để component chia sẻ logic và để consumer quyết định render. Ưu điểm so HOC: không wrapper hell, không props collision, linh hoạt hơn. Nhược điểm: callback nesting khi nhiều render props. Ngày nay, custom hooks thay thế hầu hết use cases nhưng render props vẫn có ích trong một số trường hợp như Headless UI libraries."

---

## Câu 3: Compound Components pattern -- dùng khi nào? `[Senior]`

### Giải thích lý thuyết

**Compound Components** là pattern nơi nhóm components làm việc cùng nhau và chia sẻ state nội bộ. User sử dụng các sub-components để compose UI theo cách mình muốn.

Ví dụ thực tế: `<select>` và `<option>` -- chúng làm việc cùng nhau, `<select>` quản lý state, `<option>` hiển thị lựa chọn.

**Dùng khi**:
- Xây dựng UI library / design system
- Components cần linh hoạt về layout nhưng chia sẻ logic
- VD: Tabs, Accordion, Menu, Modal, Form...

**2 cách implement**:
1. **React.Children + cloneElement**: cách cũ, ít linh hoạt
2. **Context API**: cách hiện đại, linh hoạt hơn

### Code ví dụ

```tsx
import { createContext, useContext, useState } from 'react';

// --- Compound Component: Tabs ---
interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within <Tabs>');
  }
  return context;
}

// Parent component -- quản lý state
function Tabs({
  defaultTab,
  children,
}: {
  defaultTab: string;
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

// Sub-component: Tab list
function TabList({ children }: { children: React.ReactNode }) {
  return <div className="tab-list" role="tablist">{children}</div>;
}

// Sub-component: Tab trigger
function Tab({ value, children }: { value: string; children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useTabsContext();

  return (
    <button
      role="tab"
      aria-selected={activeTab === value}
      className={activeTab === value ? 'tab active' : 'tab'}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

// Sub-component: Tab content
function TabPanel({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) return null;

  return (
    <div role="tabpanel" className="tab-panel">
      {children}
    </div>
  );
}

// Gán sub-components vào parent
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

// --- Sử dụng -- API cực kỳ declarative và linh hoạt ---
function App() {
  return (
    <Tabs defaultTab="overview">
      <Tabs.List>
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="features">Features</Tabs.Tab>
        <Tabs.Tab value="pricing">Pricing</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="overview">
        <h2>Product Overview</h2>
        <p>Mô tả sản phẩm ở đây.</p>
      </Tabs.Panel>

      <Tabs.Panel value="features">
        <h2>Features</h2>
        <ul>
          <li>Feature 1</li>
          <li>Feature 2</li>
        </ul>
      </Tabs.Panel>

      <Tabs.Panel value="pricing">
        <h2>Pricing</h2>
        <p>Free tier available.</p>
      </Tabs.Panel>
    </Tabs>
  );
}

export default Tabs;
```

### Đáp án mẫu

> "Compound Components cho phép nhóm components chia sẻ state nội bộ qua Context. User compose các sub-components một cách linh hoạt mà không cần biết implementation chi tiết. Pattern này phổ biến trong UI libraries (Radix, Headless UI, Chakra) vì nó cung cấp API declarative, linh hoạt về layout, và đang encapsulate complexity."

---

## Câu 4: Custom Hooks thay thế HOC và Render Props như thế nào? `[Intermediate]`

### Giải thích lý thuyết

**Custom Hooks** là cách hiện đại nhất để tái sử dụng stateful logic. So với HOC và Render Props:

- **Không thay đổi component tree** -- không thêm wrapper
- **Không props collision** -- trả về values rõ ràng
- **Composable** -- gọi nhiều hooks đơn giản, không nesting
- **Dễ test** -- test hook độc lập với component
- **TypeScript friendly** -- inference tốt hơn

Mọi pattern cũ (HOC, render props) đều có thể viết lại bằng custom hook.

### Code ví dụ

```tsx
import { useState, useEffect, useCallback } from 'react';

// --- Thay thế HOC withAuth ---
// Trước (HOC):
// const ProtectedPage = withAuth(Dashboard);

// Sau (Hook):
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setUser)
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return { user, loading, isAuthenticated: !!user };
}

function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!isAuthenticated) return <p>Please login</p>;

  return <h1>Welcome, {user?.name}</h1>;
}

// --- Thay thế Render Props MouseTracker ---
function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return position;
}

function Cursor() {
  const { x, y } = useMousePosition();
  return (
    <div style={{
      position: 'absolute',
      left: x - 10,
      top: y - 10,
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: 'red',
    }} />
  );
}

// --- Compose nhiều hooks -- không nesting ---
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handler = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return size;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Compose -- đơn giản, không wrapper hell
function ResponsiveComponent() {
  const { x, y } = useMousePosition();
  const { width } = useWindowSize();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div>
      <p>Mouse: {x}, {y}</p>
      <p>Width: {width}px</p>
      <p>{isMobile ? 'Mobile' : 'Desktop'}</p>
    </div>
  );
}
```

### Đáp án mẫu

> "Custom hooks là cách hiện đại để tái sử dụng logic -- không thêm wrapper, không props collision, composable tự nhiên. Mọi HOC hay render props đều có thể viết lại bằng hook đơn giản hơn. Hooks cũng dễ test hơn và có TypeScript support tốt hơn. Tuy nhiên, compound components vẫn có use case riêng (UI composition), và render props vẫn hữu ích trong một số headless UI libraries."

---

## Câu 5: Controlled vs Uncontrolled components -- khác nhau gì? `[Intermediate]`

### Giải thích lý thuyết

**Controlled**: React state là "nguồn sự thật" (source of truth). Mỗi thay đổi input đi qua `onChange -> setState -> re-render`.

**Uncontrolled**: DOM là nguồn sự thật. Dùng `ref` để đọc giá trị khi cần (VD: submit form).

**Khi nào dùng gì?**
- Controlled: khi cần validate realtime, conditional rendering, format input
- Uncontrolled: form đơn giản, file input, hoặc dùng với libraries như React Hook Form

### Code ví dụ

```tsx
import { useState, useRef } from 'react';

// --- CONTROLLED ---
function ControlledForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Validate realtime
    if (value && !value.includes('@')) {
      setError('Email phải có @');
    } else {
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!error) {
      console.log('Submit:', email);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}      // React kiểm soát giá trị
        onChange={handleChange}  // Mỗi thay đổi đi qua React
      />
      {error && <span style={{ color: 'red' }}>{error}</span>}
      <button type="submit">Send</button>
    </form>
  );
}

// --- UNCONTROLLED ---
function UncontrolledForm() {
  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Đọc giá trị từ DOM khi cần
    console.log('Submit:', emailRef.current?.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        ref={emailRef}         // DOM giữ giá trị
        defaultValue=""        // Giá trị ban đầu (không phải value)
      />
      <button type="submit">Send</button>
    </form>
  );
}

// --- React Hook Form (Uncontrolled + validation) ---
// import { useForm } from 'react-hook-form';
//
// function HookForm() {
//   const { register, handleSubmit, formState: { errors } } = useForm();
//
//   return (
//     <form onSubmit={handleSubmit(data => console.log(data))}>
//       <input {...register('email', { required: true, pattern: /^\S+@\S+$/ })} />
//       {errors.email && <span>Email invalid</span>}
//       <button type="submit">Send</button>
//     </form>
//   );
// }
```

### Bảng so sánh

| Tiêu chí | Controlled | Uncontrolled |
|----------|-----------|-------------|
| Source of truth | React state | DOM |
| Khi nào read value | Mọi lúc (state) | Khi cần (ref) |
| Re-render | Mỗi keystroke | Không (chỉ khi submit) |
| Validation | Realtime | Khi submit |
| Performance | Nhiều re-renders | Ít re-renders |
| Use case | Complex forms, conditional logic | Simple forms, file inputs |

### Đáp án mẫu

> "Controlled components dùng React state làm source of truth -- mỗi thay đổi đi qua onChange/setState. Uncontrolled dùng DOM và ref. Controlled cho phép validate realtime và conditional rendering nhưng nhiều re-renders hơn. Uncontrolled nhẹ hơn, phù hợp form đơn giản. React Hook Form là best of both worlds -- uncontrolled performance với controlled-like validation."

---

## Câu 6: Container/Presentational pattern -- còn hữu ích không? `[Intermediate]`

### Giải thích lý thuyết

**Container/Presentational** (hay Smart/Dumb components) là pattern chia component thành 2 loại:
- **Container** (Smart): xử lý logic, data fetching, state management
- **Presentational** (Dumb): chỉ render UI, nhận data qua props, không có side effects

Pattern này phổ biến trước hooks. Ngày nay, custom hooks đã thay thế container components phần lớn, nhưng ý tưởng **tách logic và UI** vẫn rất giá trị.

### Code ví dụ

```tsx
// --- CÁCH CŨ: Container / Presentational ---

// Presentational -- chỉ UI, không logic
function UserListView({
  users,
  loading,
  onRefresh,
}: {
  users: User[];
  loading: boolean;
  onRefresh: () => void;
}) {
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <button onClick={onRefresh}>Refresh</button>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name} - {u.email}</li>
        ))}
      </ul>
    </div>
  );
}

// Container -- logic, data fetching
function UserListContainer() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <UserListView
      users={users}
      loading={loading}
      onRefresh={fetchUsers}
    />
  );
}

// --- CÁCH HIỆN ĐẠI: Custom Hook + Component ---

// Hook -- xử lý logic
function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, refetch: fetchUsers };
}

// Component -- kết hợp logic và UI
function UserList() {
  const { users, loading, refetch } = useUsers();

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name} - {u.email}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Đáp án mẫu

> "Container/Presentational chia logic và UI thành 2 components riêng. Ngày nay, custom hooks thay thế container component -- hook giữ logic, component giữ UI. Ý tưởng tách biệt concerns vẫn rất giá trị, chỉ là implementation thay đổi. Presentational components (pure UI) vẫn hữu ích để reuse và test."

---

## Bảng so sánh các React Patterns

| Pattern | Use case | Ưu điểm | Nhược điểm | Còn dùng? |
|---------|----------|---------|------------|-----------|
| **HOC** | Cross-cutting concerns | Reuse logic, composition | Wrapper hell, props collision | Ít (legacy code) |
| **Render Props** | Flexible rendering | No wrapper, explicit data flow | Callback nesting | Headless UI libs |
| **Compound Components** | UI composition (tabs, menu) | Declarative API, flexible layout | Phức tạp khi implement | Có (UI libraries) |
| **Custom Hooks** | Reuse stateful logic | Đơn giản, composable, no wrapper | Chỉ cho logic, không cho UI | **Chính** |
| **Controlled/Uncontrolled** | Form handling | Control vs performance | Trade-off | Cả hai |
| **Container/Presentational** | Tách logic/UI | Clear separation | Thừa với hooks | Ý tưởng vẫn có giá trị |

---

## Lỗi thường gặp khi trả lời

1. **Nói "HOC là outdated, không cần biết"** -- Sai. Nhiều codebases lớn vẫn dùng HOC. Bạn cần hiểu để đọc và maintain legacy code. Và một số libraries vẫn dùng HOC.

2. **Không biết Compound Components** -- Đây là pattern quan trọng trong UI libraries. Nếu bạn xây dựng design system, đây là must-know.

3. **Nhầm Render Props với Component Props** -- Render props là pattern cụ thể: truyền **function** để render, không phải truyền bất kỳ prop nào.

4. **Nói custom hooks "share state"** -- Sai. Custom hooks share **logic**, không share state. Mỗi component gọi hook có state riêng biệt.

5. **Không phân biệt controlled và uncontrolled** -- Đây là câu hỏi cơ bản nhưng nhiều người trả lời mơ hồ. Cần nói rõ: source of truth nằm ở đâu (React state vs DOM).

6. **Không biết khi nào dùng pattern nào** -- Quan trọng nhất không phải biết tất cả patterns, mà là biết **khi nào** dùng cái nào. Custom hooks cho logic reuse, compound components cho UI composition, controlled cho complex forms.
