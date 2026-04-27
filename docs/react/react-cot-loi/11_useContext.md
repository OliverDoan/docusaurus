---
sidebar_position: 11
title: "11. useContext & Context API"
---

# useContext & Context API


---

## Mục lục

- [Vấn đề Context giải quyết](#vấn-đề-context-giải-quyết)
- [Tạo và sử dụng Context](#tạo-và-sử-dụng-context)
- [Ví dụ thực tế: Authentication Context](#ví-dụ-thực-tế-authentication-context)
- [Nhiều Context lồng nhau](#nhiều-context-lồng-nhau)
- [Khi nào dùng Context?](#khi-nào-dùng-context)
- [Performance với Context](#performance-với-context)
- [Pattern: Context + useReducer](#pattern-context-usereducer)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vấn đề Context giải quyết

Khi nhiều component ở các cấp khác nhau cần cùng một dữ liệu, truyền props qua từng cấp (prop drilling) rất cồng kềnh. Context cho phép "teleport" data đến bất kỳ component nào trong tree.

## Tạo và sử dụng Context

### Bước 1: Tạo Context

```tsx
import { createContext } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Tạo context với giá trị mặc định
const ThemeContext = createContext<ThemeContextType | null>(null);
```

### Bước 2: Tạo Provider

```tsx
import { useState, ReactNode } from 'react';

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Bước 3: Custom hook để consume

```tsx
import { useContext } from 'react';

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### Bước 4: Sử dụng

```tsx
// Wrap app với Provider
function App() {
  return (
    <ThemeProvider>
      <Header />
      <Main />
    </ThemeProvider>
  );
}

// Dùng ở bất kỳ component nào bên trong Provider
function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={theme}>
      <button onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'dark' : 'light'}
      </button>
    </header>
  );
}
```

## Ví dụ thực tế: Authentication Context

```tsx
// auth-context.tsx
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    setUser(data.user);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: user !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

## Nhiều Context lồng nhau

```tsx
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LocaleProvider>
          <Router>
            <AppContent />
          </Router>
        </LocaleProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

## Khi nào dùng Context?

**Dùng Context cho:**
- Theme (light/dark)
- Authentication (user hiện tại)
- Locale/Language
- Cấu hình global

**KHÔNG dùng Context cho:**
- Mọi state — Context không phải state management
- Data thay đổi thường xuyên, nhiều consumer (performance issue)
- Server state (dùng TanStack Query, SWR thay thế)

## Performance với Context

Khi Context value thay đổi, **tất cả** component dùng `useContext` đó sẽ re-render:

```tsx
// ❌ Object mới mỗi render → tất cả consumer re-render
function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  return (
    <AppContext.Provider value={{ user, setUser, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
  // Khi chỉ user thay đổi, component chỉ dùng theme cũng re-render!
}

// ✅ Tách Context: mỗi concern một context
<UserContext.Provider value={{ user, setUser }}>
  <ThemeContext.Provider value={{ theme, setTheme }}>
    {children}
  </ThemeContext.Provider>
</UserContext.Provider>

// ✅ useMemo cho value
function Provider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
```

## Pattern: Context + useReducer

Kết hợp Context với useReducer cho state management phức tạp hơn:

```tsx
// Xem bài useReducer để biết chi tiết pattern này
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Context API giải quyết vấn đề gì?
**Đáp án:**
Context API giải quyết vấn đề **prop drilling** — khi cần truyền data qua nhiều cấp component trung gian mà các component đó không sử dụng data đó.

```tsx
// KHÔNG có Context: prop drilling qua 3 cấp
function App() {
  const [user, setUser] = useState<User | null>(null);
  return <Layout user={user} />; // Layout không dùng user
}
function Layout({ user }: { user: User | null }) {
  return <Sidebar user={user} />; // Sidebar không dùng user
}
function Sidebar({ user }: { user: User | null }) {
  return <UserAvatar user={user} />; // Chỉ UserAvatar cần user
}

// CÓ Context: component nào cần thì tự lấy
function App() {
  return (
    <UserProvider>
      <Layout />
    </UserProvider>
  );
}
function Layout() { return <Sidebar />; } // Không cần biết về user
function Sidebar() { return <UserAvatar />; }
function UserAvatar() {
  const { user } = useUser(); // Lấy trực tiếp từ Context
  return <img src={user?.avatar} />;
}
```

### Câu 2: Context có vấn đề gì về performance?
**Đáp án:**
Khi Context value thay đổi, **tất cả** component gọi `useContext` đều re-render, kể cả khi component chỉ dùng một phần value không thay đổi.

```tsx
// VẤN ĐỀ: Thay đổi user → ThemeButton cũng re-render dù chỉ dùng theme
const AppContext = createContext<{
  user: User | null;
  theme: string;
} | null>(null);

function ThemeButton() {
  const { theme } = useContext(AppContext)!; // Re-render khi user thay đổi!
  return <button className={theme}>Click</button>;
}

// GIẢI PHÁP 1: Tách Context riêng cho mỗi concern
<UserContext.Provider value={{ user, setUser }}>
  <ThemeContext.Provider value={{ theme, setTheme }}>
    {children}
  </ThemeContext.Provider>
</UserContext.Provider>

// GIẢI PHÁP 2: useMemo cho context value
function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
```

### Câu 3: Khi nào dùng Context, khi nào dùng state management library?
**Đáp án:**
**Dùng Context cho:**
- Data ít thay đổi: theme, locale, auth user
- Ít consumers (< 20 components dùng)
- Ứng dụng nhỏ/trung bình

**Dùng state management library (Redux, Zustand, Jotai) cho:**
- Data thay đổi thường xuyên (real-time data, frequent updates)
- Nhiều consumers cần select từng phần state (tránh re-render thừa)
- Cần middleware (logging, persistence, async actions)
- Ứng dụng lớn, state phức tạp

```tsx
// Context phù hợp: theme (thay đổi ít, ít consumer)
const ThemeContext = createContext<'light' | 'dark'>('light');

// Zustand phù hợp: shopping cart (thay đổi thường xuyên, nhiều consumer)
const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  totalPrice: 0,
}));
// Mỗi component chỉ subscribe phần state cần → tránh re-render thừa
const totalPrice = useCartStore((state) => state.totalPrice);
```

### Câu 4: Tại sao nên dùng useMemo cho context value?
**Đáp án:**
Mỗi lần Provider component re-render, nếu tạo object mới cho `value`, React thấy reference thay đổi và re-render **tất cả consumers**, kể cả khi data bên trong không đổi.

```tsx
// SAI: Object mới mỗi render → consumers re-render không cần thiết
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [count, setCount] = useState(0); // State khác

  // Mỗi khi count thay đổi, Provider re-render,
  // value là object MỚI → tất cả consumers re-render!
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ĐÚNG: useMemo giữ reference ổn định khi user không đổi
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [count, setCount] = useState(0);

  const value = useMemo(
    () => ({ user, login, logout }),
    [user] // Chỉ tạo object mới khi user thay đổi
  );

  // count thay đổi → Provider re-render
  // nhưng value giữ nguyên reference → consumers KHÔNG re-render
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```
