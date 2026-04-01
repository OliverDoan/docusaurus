---
sidebar_position: 5
title: "State"
---

# State

## State là gì?

State là dữ liệu **nội bộ** của component, khi state thay đổi → component **re-render** (render lại UI). Khác với props (nhận từ cha), state được quản lý bởi chính component đó.

## useState

```tsx
import { useState } from 'react';

function Counter() {
  // Khai báo state: [giá trị hiện tại, hàm cập nhật]
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

### Khởi tạo state

```tsx
// Giá trị đơn giản
const [name, setName] = useState('');
const [count, setCount] = useState(0);
const [isOpen, setIsOpen] = useState(false);

// Object
const [user, setUser] = useState<User | null>(null);

// Array
const [items, setItems] = useState<string[]>([]);

// Lazy initialization — chỉ chạy 1 lần ở render đầu tiên
// Dùng khi tính toán giá trị khởi tạo tốn kém
const [data, setData] = useState(() => {
  return JSON.parse(localStorage.getItem('data') || '{}');
});
```

## Cập nhật state đúng cách

### Nguyên tắc quan trọng: State là immutable

```tsx
// ❌ KHÔNG BAO GIỜ mutate state trực tiếp
const [user, setUser] = useState({ name: 'Alice', age: 25 });

// SAI: Thay đổi trực tiếp object
user.name = 'Bob';
setUser(user); // React không nhận ra thay đổi!

// ✅ ĐÚNG: Tạo object mới
setUser({ ...user, name: 'Bob' });
```

### Cập nhật object

```tsx
const [form, setForm] = useState({
  name: '',
  email: '',
  address: {
    city: '',
    zip: '',
  },
});

// Cập nhật field đơn giản
setForm({ ...form, name: 'Alice' });

// Cập nhật nested object
setForm({
  ...form,
  address: { ...form.address, city: 'Hanoi' },
});
```

### Cập nhật array

```tsx
const [todos, setTodos] = useState([
  { id: 1, text: 'Learn React' },
]);

// Thêm phần tử
setTodos([...todos, { id: 2, text: 'Learn TypeScript' }]);

// Xóa phần tử
setTodos(todos.filter((todo) => todo.id !== 1));

// Cập nhật phần tử
setTodos(
  todos.map((todo) =>
    todo.id === 1 ? { ...todo, text: 'Updated' } : todo
  )
);

// Sắp xếp (tạo array mới trước)
setTodos([...todos].sort((a, b) => a.text.localeCompare(b.text)));
```

## Updater function

Khi state mới phụ thuộc vào state cũ, **luôn dùng updater function**:

```tsx
// ❌ Có thể sai khi gọi nhiều lần liên tiếp
setCount(count + 1);
setCount(count + 1);
setCount(count + 1);
// Kết quả: count chỉ tăng 1 (không phải 3)
// Vì cả 3 lần đều dùng cùng giá trị count

// ✅ Updater function — luôn đúng
setCount((prev) => prev + 1);
setCount((prev) => prev + 1);
setCount((prev) => prev + 1);
// Kết quả: count tăng 3
```

**Quy tắc:** Nếu state mới dựa trên state cũ → dùng `(prev) => newState`.

## State batching

React tự động **gom nhóm** (batch) các cập nhật state trong cùng một event handler, chỉ render lại **một lần**:

```tsx
function handleClick() {
  setName('Alice');    // Không render
  setAge(25);          // Không render
  setIsActive(true);   // Không render
  // → React render MỘT LẦN với cả 3 thay đổi
}
```

Từ React 18, batching hoạt động trong mọi context (event handler, setTimeout, Promise, etc.).

## State vs biến thường

```tsx
function Counter() {
  // ❌ Biến thường — reset mỗi lần render, không gây re-render
  let count = 0;

  // ✅ State — giữ giá trị giữa các lần render, gây re-render khi thay đổi
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

| | State (`useState`) | Biến thường (`let`) |
|---|---|---|
| Giữ giá trị giữa render | ✅ | ❌ (reset) |
| Gây re-render khi thay đổi | ✅ | ❌ |
| Dùng cho | UI data | Tính toán tạm trong render |

## Derived state (state suy ra)

Không tạo state cho giá trị có thể tính từ state/props khác:

```tsx
// ❌ Thừa state — fullName có thể tính từ firstName + lastName
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [fullName, setFullName] = useState(''); // THỪA!

// ✅ Tính trực tiếp khi render
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const fullName = `${firstName} ${lastName}`; // Derived value

// ❌ Thừa — filteredItems có thể tính từ items + filter
const [items, setItems] = useState([]);
const [filter, setFilter] = useState('');
const [filteredItems, setFilteredItems] = useState([]); // THỪA!

// ✅ Tính trực tiếp
const [items, setItems] = useState([]);
const [filter, setFilter] = useState('');
const filteredItems = items.filter((item) =>
  item.name.includes(filter)
);
```

## Lifting state up

Khi hai component cùng cấp cần chia sẻ state → đưa state lên component cha chung:

```tsx
// State nằm ở cha, truyền xuống qua props
function TemperatureConverter() {
  const [celsius, setCelsius] = useState(0);

  return (
    <div>
      <CelsiusInput
        value={celsius}
        onChange={setCelsius}
      />
      <FahrenheitDisplay
        value={celsius * 9 / 5 + 32}
      />
    </div>
  );
}
```
