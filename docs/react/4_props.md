---
sidebar_position: 4
title: "Props"
---

# Props

## Props là gì?

Props (properties) là cách truyền dữ liệu từ component cha xuống component con. Props là **read-only** — component con không được phép thay đổi props nhận được.

```tsx
// Cha truyền props
<UserCard name="Alice" age={25} isActive />

// Con nhận props
function UserCard({ name, age, isActive }: {
  name: string;
  age: number;
  isActive: boolean;
}) {
  return (
    <div>
      <h2>{name}</h2>
      <p>Age: {age}</p>
      {isActive && <span>Online</span>}
    </div>
  );
}
```

## Destructuring props

```tsx
// ✅ Destructure trong parameter (phổ biến nhất)
function UserCard({ name, age }: UserCardProps) {
  return <p>{name} - {age}</p>;
}

// ✅ Destructure trong body
function UserCard(props: UserCardProps) {
  const { name, age } = props;
  return <p>{name} - {age}</p>;
}
```

## Default props

```tsx
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

// Default values trong destructuring
function Button({
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

// Sử dụng — các optional props lấy giá trị default
<Button label="Submit" />
<Button label="Delete" variant="danger" size="lg" />
```

## children prop

`children` là prop đặc biệt, nhận nội dung nằm giữa opening và closing tag:

```tsx
interface CardProps {
  title: string;
  children: React.ReactNode;
}

function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="card-body">{children}</div>
    </div>
  );
}

// Sử dụng
<Card title="Profile">
  <p>Name: Alice</p>
  <p>Email: alice@example.com</p>
</Card>
```

### Các kiểu children phổ biến

| Type | Dùng khi |
|------|----------|
| `React.ReactNode` | Bất kỳ content nào (string, number, JSX, null) |
| `React.ReactElement` | Chỉ JSX element (không string/number) |
| `string` | Chỉ text |
| `(data: T) => React.ReactNode` | Render prop pattern |

## Truyền function qua props (Callback)

```tsx
interface TodoItemProps {
  id: number;
  text: string;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
}

function TodoItem({ id, text, onDelete, onToggle }: TodoItemProps) {
  return (
    <li>
      <span onClick={() => onToggle(id)}>{text}</span>
      <button onClick={() => onDelete(id)}>Delete</button>
    </li>
  );
}

// Component cha
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', done: false },
  ]);

  const handleDelete = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const handleToggle = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          id={todo.id}
          text={todo.text}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      ))}
    </ul>
  );
}
```

## Props Drilling — Vấn đề và giải pháp

Props drilling xảy ra khi phải truyền props qua nhiều cấp component trung gian:

```tsx
// ❌ Props drilling: App → Layout → Sidebar → UserInfo
function App() {
  const user = useAuth();
  return <Layout user={user} />;
}

function Layout({ user }) {
  return <Sidebar user={user} />;  // Layout không dùng user
}

function Sidebar({ user }) {
  return <UserInfo user={user} />;  // Sidebar không dùng user
}

function UserInfo({ user }) {
  return <p>{user.name}</p>;  // Chỉ UserInfo cần user
}
```

**Giải pháp:**
- **Context API** (bài 12) — cho state global
- **Composition** — truyền component thay vì data

```tsx
// ✅ Composition: Tránh drilling
function App() {
  const user = useAuth();
  return (
    <Layout sidebar={<Sidebar userInfo={<UserInfo user={user} />} />} />
  );
}
```

## Spread props

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

// Spread để forward tất cả HTML attributes
function Input({ label, ...rest }: InputProps) {
  return (
    <label>
      {label}
      <input {...rest} />
    </label>
  );
}

// Sử dụng — tất cả HTML input attributes đều hoạt động
<Input label="Email" type="email" placeholder="Enter email" required />
```

## Props là immutable

```tsx
// ❌ KHÔNG BAO GIỜ thay đổi props
function BadComponent({ user }: { user: User }) {
  user.name = 'Hacked';  // KHÔNG ĐƯỢC!
  return <p>{user.name}</p>;
}

// ✅ Tạo bản copy nếu cần biến đổi
function GoodComponent({ user }: { user: User }) {
  const displayName = user.name.toUpperCase();  // Tạo giá trị mới
  return <p>{displayName}</p>;
}
```
