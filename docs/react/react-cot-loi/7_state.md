---
sidebar_position: 7
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

---

## Câu hỏi phỏng vấn

### Câu 1: State và Props khác nhau thế nào?
**Đáp án:**
State là dữ liệu **nội bộ** do component tự quản lý, có thể thay đổi và gây re-render. Props là dữ liệu **truyền từ cha**, read-only và component con không được thay đổi.

```jsx
function Parent() {
  // State — nội bộ, có thể thay đổi
  const [count, setCount] = useState(0);

  // count truyền xuống Child thành props
  return <Child count={count} />;
}

function Child({ count }) {
  // count ở đây là PROPS — read-only
  // ❌ count = 5;  → KHÔNG ĐƯỢC thay đổi props
  // ✅ Chỉ đọc và hiển thị
  return <p>{count}</p>;
}
```

| | State | Props |
|---|---|---|
| Quản lý bởi | Component hiện tại | Component cha |
| Có thể thay đổi | Co (qua setter) | Khong (read-only) |
| Khi thay đổi | Re-render component | Cha re-render → con re-render |
| Mục đích | Dữ liệu thay đổi theo thời gian | Cấu hình component từ bên ngoài |

### Câu 2: Tại sao state phải immutable trong React?
**Đáp án:**
React dùng **so sánh reference** (===) để xác định state có thay đổi hay không. Nếu mutate object/array trực tiếp, reference không đổi nên React không nhận ra thay đổi và **không re-render**.

```jsx
const [user, setUser] = useState({ name: 'Alice', age: 25 });

// ❌ Mutate trực tiếp — React KHÔNG re-render
const handleWrong = () => {
  user.name = 'Bob';     // Thay đổi object gốc
  setUser(user);          // Cùng reference → React bỏ qua
  // user === user → true → React nghĩ không có gì thay đổi
};

// ✅ Tạo object mới — React re-render
const handleCorrect = () => {
  setUser({ ...user, name: 'Bob' }); // Object mới, reference mới
  // newObject === user → false → React biết cần re-render
};

// Tương tự với array:
const [items, setItems] = useState([1, 2, 3]);

// ❌ Mutate array
items.push(4);
setItems(items); // Cùng reference → không re-render

// ✅ Tạo array mới
setItems([...items, 4]); // Array mới → re-render
```

### Câu 3: Updater function là gì và khi nào cần dùng?
**Đáp án:**
Updater function (dạng `prev => newState`) đảm bảo luôn dùng giá trị state **mới nhất** khi tính toán state tiếp theo. Cần dùng khi state mới **phụ thuộc vào state cũ**, đặc biệt khi gọi setState nhiều lần liên tiếp.

```jsx
const [count, setCount] = useState(0);

// ❌ Không dùng updater — bug khi gọi liên tiếp
const incrementThrice = () => {
  setCount(count + 1); // count = 0 → set 1
  setCount(count + 1); // count vẫn = 0 (closure) → set 1
  setCount(count + 1); // count vẫn = 0 → set 1
  // Kết quả: count = 1 (không phải 3!)
};

// ✅ Dùng updater function — luôn đúng
const incrementThrice = () => {
  setCount((prev) => prev + 1); // prev = 0 → return 1
  setCount((prev) => prev + 1); // prev = 1 → return 2
  setCount((prev) => prev + 1); // prev = 2 → return 3
  // Kết quả: count = 3
};

// Quy tắc đơn giản:
// - State mới KHÔNG phụ thuộc state cũ → setCount(5)
// - State mới PHỤ THUỘC state cũ → setCount(prev => prev + 1)
```

### Câu 4: State batching là gì?
**Đáp án:**
State batching là cơ chế React **gom nhóm** nhiều lần cập nhật state trong cùng một event handler và chỉ **re-render một lần duy nhất**. Từ React 18, batching hoạt động trong mọi ngữ cảnh (event handler, setTimeout, Promise, etc.).

```jsx
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    // React BATCH cả 3 setState → chỉ 1 lần re-render
    setName('Alice');
    setEmail('alice@example.com');
    setLoading(true);
    // Không re-render 3 lần riêng biệt!
  };

  // React 18+: Batching cũng hoạt động trong async
  const handleAsync = async () => {
    const data = await fetchData();
    // Trước React 18: 2 lần re-render
    // React 18+: Batch thành 1 lần re-render
    setName(data.name);
    setEmail(data.email);
  };

  // Nếu CẦN re-render ngay lập tức (hiếm khi cần):
  // import { flushSync } from 'react-dom';
  // flushSync(() => setName('Alice'));  // Re-render ngay
  // flushSync(() => setEmail('alice@example.com')); // Re-render lần nữa

  return <div>{name} - {email}</div>;
}
```

### Câu 5: Derived state là gì và tại sao không nên tạo state thừa?
**Đáp án:**
Derived state (state suy ra) là giá trị có thể **tính được** từ state hoặc props hiện có. Không nên tạo state riêng cho giá trị derived vì sẽ gây ra đồng bộ state phức tạp và bug tiềm ẩn.

```jsx
// ❌ State thừa — fullName có thể tính từ firstName + lastName
function UserForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState(''); // THỪA!

  // Phải nhớ đồng bộ fullName mỗi khi firstName/lastName thay đổi
  // Quên đồng bộ → bug!
  useEffect(() => {
    setFullName(`${firstName} ${lastName}`);
  }, [firstName, lastName]);
}

// ✅ Tính trực tiếp — không cần state, không cần effect
function UserForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const fullName = `${firstName} ${lastName}`; // Tính mỗi render
  // Luôn đúng, không cần đồng bộ
}

// ✅ Với tính toán tốn kém → dùng useMemo
function ProductList({ products, filter }) {
  // Chỉ tính lại khi products hoặc filter thay đổi
  const filteredProducts = useMemo(
    () => products.filter((p) => p.name.includes(filter)),
    [products, filter]
  );
  return <ul>{filteredProducts.map(/* ... */)}</ul>;
}
```

Quy tắc: Nếu giá trị **tính được** từ state/props khác → **đừng tạo state**, hãy tính trực tiếp trong render.
