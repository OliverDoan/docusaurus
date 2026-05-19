---
sidebar_position: 1
title: "1. Context API"
---

# Context API

---

## Mục lục

- [Context là gì?](#context-là-gì)
- [createContext và Provider](#createcontext-và-provider)
- [useContext](#usecontext)
- [Pattern Context + custom hook](#pattern-context--custom-hook)
- [Hạn chế của Context](#hạn-chế-của-context)

---

## Context là gì?

**Context** = cơ chế built-in của React để **truyền data xuống subtree**
mà không phải pass prop từng cấp (prop drilling).

```
App
└── Layout
    └── Header
        └── Nav
            └── UserMenu  ← cần user data
```

Không có Context, phải pass `user` qua 4 cấp:

```jsx
<App>
  <Layout user={user}>
    <Header user={user}>
      <Nav user={user}>
        <UserMenu user={user} />
```

Với Context:

```jsx
<UserContext.Provider value={user}>
  <App />  {/* mọi component sâu trong subtree đọc được user */}
</UserContext.Provider>
```

---

## createContext và Provider

```jsx
import { createContext } from "react";

const ThemeContext = createContext("light"); // default value

function App() {
  const [theme, setTheme] = useState("dark");

  return (
    <ThemeContext.Provider value={theme}>
      <Layout />
    </ThemeContext.Provider>
  );
}
```

Provider có thể lồng nhau:

```jsx
<UserContext.Provider value={user}>
  <ThemeContext.Provider value={theme}>
    <LocaleContext.Provider value={locale}>
      <App />
    </LocaleContext.Provider>
  </ThemeContext.Provider>
</UserContext.Provider>
```

---

## useContext

```jsx
import { useContext } from "react";

function Button() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click</button>;
}
```

Khi `value` của Provider đổi → **mọi consumer dùng `useContext`** re-render.

---

## Pattern Context + custom hook

Pattern chuẩn — wrap Context + Provider + custom hook trong 1 file:

```tsx
import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextValue {
  user: User | null;
  login: (email: string, pw: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, pw: string) => {
    const u = await api.login(email, pw);
    setUser(u);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth phải dùng trong AuthProvider");
  }
  return ctx;
}
```

Dùng:

```jsx
// Top-level
<AuthProvider>
  <App />
</AuthProvider>

// Bất kỳ component
function Profile() {
  const { user, logout } = useAuth();
  return <button onClick={logout}>{user.name}</button>;
}
```

:::info[Phân tích]

**Lợi ích pattern này:**

1. **Encapsulation** — implementation Context giấu trong file, caller
   chỉ thấy hook.
2. **Type-safe** — hook trả về type non-null, không cần check ở mọi
   call site.
3. **Defensive** — throw error nếu dùng ngoài Provider → bug rõ ràng,
   không silent.
4. **Refactor dễ** — đổi từ Context sang Zustand chỉ cần đổi `useAuth`
   implementation.

Đây là pattern de-facto cho mọi Context trong React app hiện đại.

:::

---

## Hạn chế của Context

**1. Mọi consumer re-render khi value đổi**:

```jsx
const AppContext = createContext();

function App() {
  const [user, setUser] = useState();
  const [theme, setTheme] = useState();
  const [notifs, setNotifs] = useState([]);

  return (
    <AppContext.Provider value={{ user, theme, notifs, setUser, setTheme }}>
      <Header />   {/* re-render khi BẤT KỲ field đổi */}
      <Sidebar />
      <Main />
    </AppContext.Provider>
  );
}
```

**2. Object literal làm value → re-render mỗi render parent**:

```jsx
// Tệ — value mới mỗi render
<AppContext.Provider value={{ user, theme }}>

// Tốt — memoize
const value = useMemo(() => ({ user, theme }), [user, theme]);
<AppContext.Provider value={value}>
```

**3. Không có selector** — đọc 1 field cũng nhận toàn bộ value:

```jsx
// Component chỉ cần `theme` nhưng re-render khi `user` đổi
function ThemedButton() {
  const { theme } = useAuth();
  return <button className={theme} />;
}
```

:::warning[Cần lưu ý]

**Context phù hợp với data hiếm đổi:**

- Theme (đổi vài lần / session).
- Auth (đổi khi login/logout).
- Locale (đổi rare).
- Feature flag.

**Không phù hợp với:**

- Form state (đổi mỗi keystroke).
- Real-time data (đổi liên tục).
- App state phức tạp (nhiều subscriber với pattern khác nhau).

Với 3 case này, dùng **Zustand**, **Jotai**, hoặc **Redux Toolkit** —
có selector, optimization built-in.

:::

**4. Provider hell**:

```jsx
<AuthProvider>
  <ThemeProvider>
    <LocaleProvider>
      <ToastProvider>
        <ModalProvider>
          <App />
        </ModalProvider>
      </ToastProvider>
    </LocaleProvider>
  </ThemeProvider>
</AuthProvider>
```

→ Hard to read. Combine helper:

```jsx
function Providers({ children }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LocaleProvider>
          <ToastProvider>
            <ModalProvider>
              {children}
            </ModalProvider>
          </ToastProvider>
        </LocaleProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// Hoặc compose function — gọn hơn
const Providers = composeProviders(
  AuthProvider, ThemeProvider, LocaleProvider, ToastProvider, ModalProvider
);
```

:::tip[Mẹo]

**Chia nhỏ context theo "update frequency"**:

```jsx
// User ít đổi
<UserContext.Provider value={user}>

// Theme ít đổi
<ThemeContext.Provider value={theme}>

// Toast đổi nhiều — tách riêng để không re-render User/Theme consumer
<ToastContext.Provider value={toasts}>
```

Quy tắc: **mỗi Context = 1 concern**, không nhồi nhiều thứ vào cùng object.
Một số dev tách thêm:

- `UserStateContext` cho data.
- `UserDispatchContext` cho action (setter).

→ Component dùng `useUserState` re-render khi data đổi, dùng `useUserDispatch`
không re-render (vì dispatch ổn định).

:::
