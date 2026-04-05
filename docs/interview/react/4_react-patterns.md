---
sidebar_position: 4
title: "HOC, Render Props, Compound Components, Custom Hooks"
---

# HOC, Render Props, Compound Components, Custom Hooks

React patterns la nhung cach to chuc code de **tai su dung logic**, **tach biet concerns**, va **lam code de bao tri**. Trong phong van, nguoi ta muon biet ban co hieu cac patterns nay khong, tai sao chung ton tai, va khi nao nen dung cai nao.

---

## Cau 1: Higher-Order Components (HOC) -- pattern nay hoat dong ra sao? Uu va nhuoc diem? `[Intermediate]`

### Giai thich ly thuyet

**HOC** la mot function nhan vao component va tra ve component moi co them logic. Day la pattern lay cam hung tu higher-order functions trong functional programming.

**Cong thuc**: `const EnhancedComponent = hoc(WrappedComponent)`

HOC pho bien trong class component era (truoc hooks). VD: `connect()` cua Redux, `withRouter` cua React Router, `withStyles` cua Material UI.

**Uu diem**:
- Tai su dung logic giua nhieu components
- Khong thay doi component goc (composition)
- Co the compose nhieu HOCs

**Nhuoc diem**:
- "Wrapper hell" -- nhieu HOC chong len nhau
- Props collision -- HOC va component co the co props trung ten
- Kho debug -- khong ro props tu dau den
- Khong linh hoat bang hooks

### Code vi du

```tsx
import { useState, useEffect, ComponentType } from 'react';

// HOC: them loading state
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

// HOC: them authentication check
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

// Su dung
function UserProfile({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}

// Compose nhieu HOCs -- "wrapper hell"
const EnhancedProfile = withAuth(withLoading(UserProfile));

// Su dung
function App() {
  return <EnhancedProfile name="John" isLoading={false} />;
}
```

### Dap an mau

> "HOC la function nhan component va tra ve component moi voi logic them vao. Pattern nay pho bien truoc hooks -- connect() cua Redux la vi du dien hinh. Nhuoc diem chinh la wrapper hell, props collision, va kho debug. Ngay nay, custom hooks thay the hau het use cases cua HOC vi don gian va minh bach hon."

---

## Cau 2: Render Props pattern -- hoat dong the nao? So voi HOC? `[Intermediate]`

### Giai thich ly thuyet

**Render Props** la pattern truyen mot function lam prop, function nay nhan data va tra ve JSX. Component "chia se logic" goi function nay de render UI.

Co 2 dang:
1. **render prop**: `<Mouse render={(mouse) => <Cat position={mouse} />} />`
2. **children as function**: `<Mouse>{(mouse) => <Cat position={mouse} />}</Mouse>`

**Uu diem so voi HOC**:
- Khong co wrapper hell (composition ro rang hon)
- Khong co props collision
- Linh hoat hon -- quyet dinh render tai noi su dung

**Nhuoc diem**:
- "Callback hell" neu nhieu render props chong nhau
- Performance: inline function tao moi moi render (co the fix voi useCallback)
- Da duoc thay the phan lon boi custom hooks

### Code vi du

```tsx
import { useState, useEffect } from 'react';

// Render Props: chia se mouse position logic
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

// Su dung -- quyet dinh render UI tai noi su dung
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

// Su dung
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

### Dap an mau

> "Render Props truyen function lam prop de component chia se logic va de consumer quyet dinh render. Uu diem so HOC: khong wrapper hell, khong props collision, linh hoat hon. Nhuoc diem: callback nesting khi nhieu render props. Ngay nay, custom hooks thay the hau het use cases nhung render props van co ich trong mot so truong hop nhu Headless UI libraries."

---

## Cau 3: Compound Components pattern -- dung khi nao? `[Senior]`

### Giai thich ly thuyet

**Compound Components** la pattern noi nhom components lam viec cung nhau va chia se state noi bo. User su dung cac sub-components de compose UI theo cach minh muon.

Vi du thuc te: `<select>` va `<option>` -- chung lam viec cung nhau, `<select>` quan ly state, `<option>` hien thi lua chon.

**Dung khi**:
- Xay dung UI library / design system
- Components can linh hoat ve layout nhung chia se logic
- VD: Tabs, Accordion, Menu, Modal, Form...

**2 cach implement**:
1. **React.Children + cloneElement**: cach cu, it linh hoat
2. **Context API**: cach hien dai, linh hoat hon

### Code vi du

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

// Parent component -- quan ly state
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

// Gan sub-components vao parent
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

// --- Su dung -- API cuc ky declarative va linh hoat ---
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
        <p>Mo ta san pham o day.</p>
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

### Dap an mau

> "Compound Components cho phep nhom components chia se state noi bo qua Context. User compose cac sub-components mot cach linh hoat ma khong can biet implementation chi tiet. Pattern nay pho bien trong UI libraries (Radix, Headless UI, Chakra) vi no cung cap API declarative, linh hoat ve layout, va dang encapsulate complexity."

---

## Cau 4: Custom Hooks thay the HOC va Render Props nhu the nao? `[Intermediate]`

### Giai thich ly thuyet

**Custom Hooks** la cach hien dai nhat de tai su dung stateful logic. So voi HOC va Render Props:

- **Khong thay doi component tree** -- khong them wrapper
- **Khong props collision** -- tra ve values ro rang
- **Composable** -- goi nhieu hooks don gian, khong nesting
- **De test** -- test hook doc lap voi component
- **TypeScript friendly** -- inference tot hon

Moi pattern cu (HOC, render props) deu co the viet lai bang custom hook.

### Code vi du

```tsx
import { useState, useEffect, useCallback } from 'react';

// --- Thay the HOC withAuth ---
// Truoc (HOC):
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

// --- Thay the Render Props MouseTracker ---
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

// --- Compose nhieu hooks -- khong nesting ---
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

// Compose -- don gian, khong wrapper hell
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

### Dap an mau

> "Custom hooks la cach hien dai de tai su dung logic -- khong them wrapper, khong props collision, composable tu nhien. Moi HOC hay render props deu co the viet lai bang hook don gian hon. Hooks cung de test hon va co TypeScript support tot hon. Tuy nhien, compound components van co use case rieng (UI composition), va render props van huu ich trong mot so headless UI libraries."

---

## Cau 5: Controlled vs Uncontrolled components -- khac nhau gi? `[Intermediate]`

### Giai thich ly thuyet

**Controlled**: React state la "nguon su that" (source of truth). Moi thay doi input di qua `onChange -> setState -> re-render`.

**Uncontrolled**: DOM la nguon su that. Dung `ref` de doc gia tri khi can (VD: submit form).

**Khi nao dung gi?**
- Controlled: khi can validate realtime, conditional rendering, format input
- Uncontrolled: form don gian, file input, hoac dung voi libraries nhu React Hook Form

### Code vi du

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
      setError('Email phai co @');
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
        value={email}      // React kiem soat gia tri
        onChange={handleChange}  // Moi thay doi di qua React
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
    // Doc gia tri tu DOM khi can
    console.log('Submit:', emailRef.current?.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        ref={emailRef}         // DOM giu gia tri
        defaultValue=""        // Gia tri ban dau (khong phai value)
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

### Bang so sanh

| Tieu chi | Controlled | Uncontrolled |
|----------|-----------|-------------|
| Source of truth | React state | DOM |
| Khi nao read value | Moi luc (state) | Khi can (ref) |
| Re-render | Moi keystroke | Khong (chi khi submit) |
| Validation | Realtime | Khi submit |
| Performance | Nhieu re-renders | It re-renders |
| Use case | Complex forms, conditional logic | Simple forms, file inputs |

### Dap an mau

> "Controlled components dung React state lam source of truth -- moi thay doi di qua onChange/setState. Uncontrolled dung DOM va ref. Controlled cho phep validate realtime va conditional rendering nhung nhieu re-renders hon. Uncontrolled nhe hon, phu hop form don gian. React Hook Form la best of both worlds -- uncontrolled performance voi controlled-like validation."

---

## Cau 6: Container/Presentational pattern -- con huu ich khong? `[Intermediate]`

### Giai thich ly thuyet

**Container/Presentational** (hay Smart/Dumb components) la pattern chia component thanh 2 loai:
- **Container** (Smart): xu ly logic, data fetching, state management
- **Presentational** (Dumb): chi render UI, nhan data qua props, khong co side effects

Pattern nay pho bien truoc hooks. Ngay nay, custom hooks da thay the container components phan lon, nhung y tuong **tach logic va UI** van rat gia tri.

### Code vi du

```tsx
// --- CACH CU: Container / Presentational ---

// Presentational -- chi UI, khong logic
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

// --- CACH HIEN DAI: Custom Hook + Component ---

// Hook -- xu ly logic
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

// Component -- ket hop logic va UI
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

### Dap an mau

> "Container/Presentational chia logic va UI thanh 2 components rieng. Ngay nay, custom hooks thay the container component -- hook giu logic, component giu UI. Y tuong tach biet concerns van rat gia tri, chi la implementation thay doi. Presentational components (pure UI) van huu ich de reuse va test."

---

## Bang so sanh cac React Patterns

| Pattern | Use case | Uu diem | Nhuoc diem | Con dung? |
|---------|----------|---------|------------|-----------|
| **HOC** | Cross-cutting concerns | Reuse logic, composition | Wrapper hell, props collision | It (legacy code) |
| **Render Props** | Flexible rendering | No wrapper, explicit data flow | Callback nesting | Headless UI libs |
| **Compound Components** | UI composition (tabs, menu) | Declarative API, flexible layout | Phuc tap khi implement | Co (UI libraries) |
| **Custom Hooks** | Reuse stateful logic | Don gian, composable, no wrapper | Chi cho logic, khong cho UI | **Chinh** |
| **Controlled/Uncontrolled** | Form handling | Control vs performance | Trade-off | Ca hai |
| **Container/Presentational** | Tach logic/UI | Clear separation | Thu tuc voi hooks | Y tuong van co gia tri |

---

## Loi thuong gap khi tra loi

1. **Noi "HOC la outdated, khong can biet"** -- Sai. Nhieu codebases lon van dung HOC. Ban can hieu de doc va maintain legacy code. Va mot so libraries van dung HOC.

2. **Khong biet Compound Components** -- Day la pattern quan trong trong UI libraries. Neu ban xay dung design system, day la must-know.

3. **Nham Render Props voi Component Props** -- Render props la pattern cu the: truyen **function** de render, khong phai truyen bat ky prop nao.

4. **Noi custom hooks "share state"** -- Sai. Custom hooks share **logic**, khong share state. Moi component goi hook co state rieng biet.

5. **Khong phan biet controlled va uncontrolled** -- Day la cau hoi co ban nhung nhieu nguoi tra loi mo ho. Can noi ro: source of truth nam o dau (React state vs DOM).

6. **Khong biet khi nao dung pattern nao** -- Quan trong nhat khong phai biet tat ca patterns, ma la biet **khi nao** dung cai nao. Custom hooks cho logic reuse, compound components cho UI composition, controlled cho complex forms.
