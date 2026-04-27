---
sidebar_position: 4
title: "4. Props"
---

# Props


---

## Mục lục

- [Props là gì?](#props-là-gì)
- [Destructuring props](#destructuring-props)
- [Default props](#default-props)
- [children prop](#children-prop)
- [Truyền function qua props (Callback)](#truyền-function-qua-props-callback)
- [Props Drilling — Vấn đề và giải pháp](#props-drilling-vấn-đề-và-giải-pháp)
- [Spread props](#spread-props)
- [Props là immutable](#props-là-immutable)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

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

---

## Câu hỏi phỏng vấn

### Câu 1: Props và State khác nhau thế nào?
**Đáp án:**
Props và State đều là dữ liệu ảnh hưởng đến việc render, nhưng có nguồn gốc và cách quản lý khác nhau:

```jsx
function Parent() {
  // State: dữ liệu NỘI BỘ, do component tự quản lý
  const [count, setCount] = useState(0);

  // Props: dữ liệu TRUYỀN TỪ CHA xuống con
  return <Child count={count} onIncrement={() => setCount(count + 1)} />;
}

function Child({ count, onIncrement }) {
  // count là PROPS — read-only, không thể thay đổi
  // Muốn thay đổi → gọi callback (onIncrement) để cha cập nhật state
  return <button onClick={onIncrement}>Count: {count}</button>;
}
```

| | Props | State |
|---|---|---|
| Nguồn gốc | Từ component cha | Bên trong component |
| Quyền thay đổi | Read-only (immutable) | Có thể thay đổi (via setter) |
| Khi thay đổi | Cha re-render → con re-render | Component re-render |
| Mục đích | Cấu hình component từ bên ngoài | Quản lý dữ liệu nội bộ |

### Câu 2: Props drilling là gì và cách giải quyết?
**Đáp án:**
Props drilling là tình trạng phải truyền props qua nhiều cấp component trung gian, dù các component trung gian không sử dụng props đó.

```jsx
// ❌ Props drilling: theme truyền qua 3 cấp trung gian
function App() {
  const [theme, setTheme] = useState('dark');
  return <Layout theme={theme} />;       // Layout không dùng theme
}
function Layout({ theme }) {
  return <Sidebar theme={theme} />;      // Sidebar không dùng theme
}
function Sidebar({ theme }) {
  return <UserMenu theme={theme} />;     // UserMenu không dùng theme
}
function UserMenu({ theme }) {
  return <div className={theme}>Menu</div>; // Chỉ UserMenu cần
}

// ✅ Giải pháp 1: Context API
const ThemeContext = createContext('light');

function App() {
  const [theme, setTheme] = useState('dark');
  return (
    <ThemeContext.Provider value={theme}>
      <Layout />   {/* Không cần truyền theme */}
    </ThemeContext.Provider>
  );
}

function UserMenu() {
  const theme = useContext(ThemeContext); // Lấy trực tiếp
  return <div className={theme}>Menu</div>;
}

// ✅ Giải pháp 2: Composition
function App() {
  const [theme, setTheme] = useState('dark');
  return (
    <Layout>
      <Sidebar>
        <UserMenu theme={theme} />  {/* Truyền trực tiếp */}
      </Sidebar>
    </Layout>
  );
}
```

### Câu 3: Truyền callback function qua props hoạt động thế nào?
**Đáp án:**
Vì React dùng one-way data flow (cha → con), component con muốn "gửi" dữ liệu lên cha phải gọi một callback function mà cha truyền xuống qua props.

```jsx
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React' },
  ]);

  // Callback được truyền xuống con
  const handleDelete = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          text={todo.text}
          onDelete={() => handleDelete(todo.id)}
        />
      ))}
    </ul>
  );
}

function TodoItem({ text, onDelete }: {
  text: string;
  onDelete: () => void;
}) {
  // Con gọi callback → cha cập nhật state → cả hai re-render
  return (
    <li>
      {text}
      <button onClick={onDelete}>Delete</button>
    </li>
  );
}
```

Luồng: Con gọi `onDelete()` → Cha thực thi `handleDelete()` → State cha thay đổi → Cha re-render → Con re-render với dữ liệu mới.

### Câu 4: Tại sao props phải immutable?
**Đáp án:**
Props phải immutable (không thay đổi) để đảm bảo luồng dữ liệu một chiều rõ ràng, giúp React dự đoán được khi nào cần re-render và tránh side effects không mong muốn.

```jsx
// ❌ Mutate props → phá vỡ data flow, gây bug khó tìm
function BadComponent({ user }) {
  user.name = 'Hacked';  // KHÔNG ĐƯỢC!
  // Thay đổi này ảnh hưởng đến component cha
  // vì object truyền theo reference
  return <p>{user.name}</p>;
}

// ✅ Tạo giá trị mới nếu cần biến đổi
function GoodComponent({ user }) {
  const displayName = user.name.toUpperCase(); // Tạo giá trị mới
  return <p>{displayName}</p>;
}

// ✅ Nếu cần "thay đổi" dữ liệu → gọi callback để cha cập nhật
function EditableUser({ user, onUpdate }) {
  const handleChange = (e) => {
    // Tạo object mới, không mutate props
    onUpdate({ ...user, name: e.target.value });
  };
  return <input value={user.name} onChange={handleChange} />;
}
```

Nếu props bị mutate: React không nhận ra thay đổi (vì reference giống), component không re-render, UI không đồng bộ với dữ liệu.
