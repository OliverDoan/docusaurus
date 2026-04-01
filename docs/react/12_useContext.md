---
sidebar_position: 12
title: "useContext & Context API"
---

# useContext & Context API

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
