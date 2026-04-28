---
sidebar_position: 1
title: "1. React + TypeScript"
---

# React + TypeScript

---

## Mục lục

- [Props TypeScript](#props-typescript)
- [State & Event Handlers](#state--event-handlers)
- [Hooks TypeScript](#hooks-typescript)
- [Custom Hooks](#custom-hooks)
- [Context API](#context-api)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Props TypeScript

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

function Button({ label, onClick, disabled, variant = "primary" }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled} className={variant}>
      {label}
    </button>
  );
}

// Usage
<Button label="Click me" onClick={() => console.log("clicked")} />
<Button label="Disabled" onClick={() => {}} disabled variant="secondary" />
```

---

## State & Event Handlers

```typescript
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState<number>(0);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    console.log(event.button);
    setCount(count + 1);
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    console.log(event.target.value);
  };

  return (
    <>
      <input onChange={handleChange} />
      <button onClick={handleClick}>Count: {count}</button>
    </>
  );
}
```

---

## Hooks TypeScript

```typescript
import { useEffect, useRef } from "react";

function MyComponent() {
  // useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null);

  // useEffect — no type annotation needed
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} />;
}
```

---

## Custom Hooks

```typescript
function useFetch<T>(url: string): {
  data: T | null;
  loading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then((result: T) => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

// Usage
const { data, loading } = useFetch<User[]>("/api/users");
```

---

## Context API

```typescript
import { createContext, useContext } from "react";

interface User {
  id: number;
  name: string;
}

interface AuthContextType {
  user: User | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);

  return (
    <AuthContext.Provider value={{ user, logout: () => setUser(null) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Props TypeScript typing cách nào?

**Đáp án:** Define interface với props properties, truyền vào function component: `function MyComponent(props: MyProps)`. Hoặc use destructuring: `function MyComponent({ prop1, prop2 }: MyProps)`. React.FC type cũ, nên dùng function + props interface.

### Câu 2: Event handler type annotation?

**Đáp án:** Use `React.MouseEventHandler<HTMLButtonElement>`, `React.ChangeEventHandler<HTMLInputElement>`, etc. Hoặc inline: `onClick={(event: React.MouseEvent<HTMLButtonElement>) => {...}`. TypeScript infers event type từ element.

### Câu 3: useRef typing?

**Đáp án:** `useRef<HTMLElement>(null)` — generic type parameter specify element type. TypeScript then knows `ref.current` is `HTMLElement | null`, và IDE provides autocomplete cho element properties/methods.
