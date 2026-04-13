---
sidebar_position: 1
title: "1. TypeScript với React"
---

# TypeScript với React

## Tại sao dùng TypeScript?

- **Phát hiện lỗi sớm** — lỗi type được bắt khi viết code, không phải runtime
- **Autocomplete** — IDE gợi ý chính xác props, methods
- **Refactor an toàn** — đổi tên, thay đổi type → lỗi hiện ngay
- **Documentation** — types là docs tự động cho code

## Cài đặt

```bash
# Vite + React + TypeScript
npm create vite@latest my-app -- --template react-ts
```

## TypeScript cơ bản

### Kiểu dữ liệu

```ts
// Primitive types
const name: string = 'Alice';
const age: number = 25;
const isActive: boolean = true;

// Arrays
const items: string[] = ['a', 'b', 'c'];
const numbers: Array<number> = [1, 2, 3];

// Tuple
const pair: [string, number] = ['Alice', 25];

// Union type
let status: 'loading' | 'success' | 'error' = 'loading';
let value: string | number = 'hello';

// null / undefined
let user: User | null = null;
let name: string | undefined = undefined;
```

### Interface vs Type

```ts
// Interface — mô tả hình dạng object, extendable
interface User {
  id: string;
  name: string;
  email: string;
  age?: number; // Optional
}

// Extend interface
interface AdminUser extends User {
  role: 'admin';
  permissions: string[];
}

// Type — flexible hơn, dùng cho union, intersection, utility types
type Status = 'loading' | 'success' | 'error';
type Response<T> = { data: T; error: null } | { data: null; error: string };

// Intersection
type AdminUser = User & { role: 'admin' };
```

**Quy tắc:** Dùng `interface` cho object shapes (props, models). Dùng `type` cho unions, intersections, utility types.

### Generics

```ts
// Generic function
function getFirst<T>(items: T[]): T | undefined {
  return items[0];
}

getFirst<string>(['a', 'b']); // string
getFirst([1, 2, 3]);          // number (inferred)

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

const response: ApiResponse<User[]> = {
  data: [{ id: '1', name: 'Alice', email: 'a@b.com' }],
  status: 200,
  message: 'OK',
};
```

## Typing Props

### Cơ bản

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';  // Optional
  disabled?: boolean;
}

function Button({ label, onClick, variant = 'primary', disabled = false }: ButtonProps) {
  return (
    <button className={`btn-${variant}`} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### children

```tsx
interface CardProps {
  title: string;
  children: React.ReactNode;  // Bất kỳ nội dung nào React render được
}

function Card({ title, children }: CardProps) {
  return (
    <div>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
```

### Event handlers

```tsx
interface FormProps {
  onSubmit: (data: FormData) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
```

### Extending HTML attributes

```tsx
// Button kế thừa tất cả HTML button attributes
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

function Button({ variant = 'primary', children, ...rest }: ButtonProps) {
  return (
    <button className={`btn-${variant}`} {...rest}>
      {children}
    </button>
  );
}

// Tất cả HTML props đều hoạt động
<Button variant="primary" type="submit" disabled aria-label="Submit">
  Submit
</Button>
```

## Typing Hooks

### useState

```tsx
// Type inferred từ giá trị khởi tạo
const [count, setCount] = useState(0);              // number
const [name, setName] = useState('');                // string

// Cần explicit type khi khởi tạo null hoặc complex types
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Item[]>([]);
```

### useRef

```tsx
// DOM element ref — khởi tạo null
const inputRef = useRef<HTMLInputElement>(null);
const divRef = useRef<HTMLDivElement>(null);

// Mutable ref — giá trị bất kỳ
const timerRef = useRef<number>(0);
const countRef = useRef<number>(0);
```

### useReducer

```tsx
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'set'; payload: number };

interface State {
  count: number;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    case 'decrement': return { count: state.count - 1 };
    case 'set': return { count: action.payload };
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0 });
dispatch({ type: 'set', payload: 10 }); // Type-safe
```

### useContext

```tsx
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be within ThemeProvider');
  return context;
}
```

## Typing Custom Hooks

```tsx
interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}

// Sử dụng — type inferred
const { data: users } = useFetch<User[]>('/api/users');
// users: User[] | null
```

## Utility Types hữu ích

```ts
// Partial — tất cả fields optional
type UpdateUser = Partial<User>;
// { id?: string; name?: string; email?: string; }

// Required — tất cả fields bắt buộc
type RequiredUser = Required<User>;

// Pick — chọn một số fields
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: string; name: string; }

// Omit — bỏ một số fields
type CreateUser = Omit<User, 'id'>;
// { name: string; email: string; }

// Record — object với key-value types
type UserMap = Record<string, User>;

// Exclude / Extract — cho union types
type Status = 'loading' | 'success' | 'error';
type ActiveStatus = Exclude<Status, 'loading'>; // 'success' | 'error'
```

## Generic Component

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Sử dụng — T inferred từ items
<List
  items={users}
  keyExtractor={(user) => user.id}
  renderItem={(user) => <span>{user.name}</span>}
/>
```

---

## Câu hỏi phỏng vấn

### Câu 1: Interface vs Type trong TypeScript khác nhau thế nào?
**Đáp án:**

- `interface` dùng để mô tả hình dạng (shape) của object, hỗ trợ **extends** và **declaration merging** (khai báo nhiều lần cùng tên sẽ tự merge).
- `type` linh hoạt hơn, dùng cho **union types**, **intersection types**, **utility types**, và các kiểu phức tạp.

```ts
// Interface — extendable, dùng cho object shapes
interface User {
  id: string;
  name: string;
}

interface AdminUser extends User {
  role: 'admin';
}

// Declaration merging — chỉ interface có
interface User {
  email: string; // Tự merge vào User ở trên
}

// Type — dùng cho union, intersection
type Status = 'loading' | 'success' | 'error';
type Response = { data: string } | { error: string };

// Type intersection
type AdminUser = User & { role: 'admin' };
```

**Quy tắc:** Dùng `interface` cho props, models (object shapes). Dùng `type` cho unions, mapped types, utility types.

### Câu 2: Cách type props cho React component?
**Đáp án:**

Định nghĩa interface cho props, sau đó dùng destructuring trong function parameter:

```tsx
// 1. Định nghĩa interface
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary'; // Optional prop
  disabled?: boolean;
}

// 2. Dùng trong component
function Button({ label, onClick, variant = 'primary', disabled = false }: ButtonProps) {
  return (
    <button className={`btn-${variant}`} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// 3. Children prop
interface CardProps {
  title: string;
  children: React.ReactNode; // Bất kỳ nội dung React render được
}

// 4. Kế thừa HTML attributes
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
```

### Câu 3: Generic component trong React viết thế nào?
**Đáp án:**

Generic component cho phép tạo component tái sử dụng với nhiều kiểu dữ liệu khác nhau, TypeScript sẽ tự infer type từ props:

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Sử dụng — T tự infer là User từ items
<List
  items={users}
  keyExtractor={(user) => user.id}
  renderItem={(user) => <span>{user.name}</span>}
/>

// Hoặc chỉ định explicit
<List<Product>
  items={products}
  keyExtractor={(p) => p.id}
  renderItem={(p) => <span>{p.name} - ${p.price}</span>}
/>
```

### Câu 4: Utility types (Partial, Pick, Omit) dùng khi nào?
**Đáp án:**

Utility types giúp tạo type mới từ type có sẵn mà không cần viết lại:

```ts
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

// Partial<T> — tất cả fields trở thành optional
// Dùng khi: update form (chỉ gửi fields thay đổi)
type UpdateUser = Partial<User>;
// { id?: string; name?: string; email?: string; age?: number; }

function updateUser(id: string, data: Partial<User>) {
  // data có thể chỉ có { name: 'New Name' }
}

// Pick<T, K> — chọn một số fields
// Dùng khi: chỉ cần vài fields từ type lớn
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: string; name: string; }

// Omit<T, K> — bỏ một số fields
// Dùng khi: tạo type không có field nào đó (vd: create không cần id)
type CreateUser = Omit<User, 'id'>;
// { name: string; email: string; age: number; }

// Record<K, V> — object với key-value types
// Dùng khi: tạo dictionary/map
type UserMap = Record<string, User>;
```
