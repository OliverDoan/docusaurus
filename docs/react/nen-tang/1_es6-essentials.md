---
sidebar_position: 1
title: "1. ES6+ cần biết cho React"
---

# ES6+ cần biết cho React

## Arrow Functions

```js
// Function truyền thống
function greet(name) {
  return `Hello ${name}`;
}

// Arrow function — cú pháp ngắn gọn
const greet = (name) => `Hello ${name}`;

// Nhiều dòng
const greet = (name) => {
  const message = `Hello ${name}`;
  return message;
};

// Không có arguments, không bind this
// Arrow function kế thừa `this` từ scope bao ngoài → lý tưởng cho React
```

### Trong React

```jsx
// Event handler
<button onClick={() => setCount(count + 1)}>+</button>

// Component
const UserCard = ({ name }) => <h2>{name}</h2>;

// Array methods
{users.map((user) => <li key={user.id}>{user.name}</li>)}
```

## Destructuring

### Object destructuring

```js
const user = { name: 'Alice', age: 25, email: 'alice@test.com' };

// Truyền thống
const name = user.name;
const age = user.age;

// Destructuring
const { name, age, email } = user;

// Đổi tên
const { name: userName, age: userAge } = user;

// Giá trị mặc định
const { name, role = 'user' } = user; // role = 'user' nếu undefined
```

### Array destructuring

```js
const colors = ['red', 'green', 'blue'];

// Destructuring
const [first, second, third] = colors;

// Bỏ qua phần tử
const [, , third] = colors; // third = 'blue'

// React useState dùng array destructuring
const [count, setCount] = useState(0);
```

### Trong React props

```jsx
// Destructure props trực tiếp trong parameter
function UserCard({ name, age, isActive = false }) {
  return <p>{name} - {age}</p>;
}
```

## Spread & Rest Operators (...)

### Spread — "trải" phần tử ra

```js
// Array
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]

// Object
const user = { name: 'Alice', age: 25 };
const updated = { ...user, age: 26 }; // { name: 'Alice', age: 26 }
```

### Rest — "gom" phần tử còn lại

```js
// Function parameters
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3); // 6

// Object destructuring
const { name, ...rest } = { name: 'Alice', age: 25, email: 'a@b.com' };
// name = 'Alice', rest = { age: 25, email: 'a@b.com' }
```

### Trong React

```jsx
// Spread props
const buttonProps = { type: 'submit', disabled: false };
<button {...buttonProps}>Submit</button>

// Forward remaining props
function Input({ label, ...rest }) {
  return (
    <label>
      {label}
      <input {...rest} />
    </label>
  );
}

// Immutable state update (QUAN TRỌNG)
setUser({ ...user, name: 'Bob' }); // Tạo object mới
setItems([...items, newItem]);      // Tạo array mới
```

## Template Literals

```js
const name = 'React';
const version = 19;

// Truyền thống
const msg = 'Hello ' + name + ' v' + version;

// Template literal — dùng backtick ` và ${expression}
const msg = `Hello ${name} v${version}`;

// Multiline
const html = `
  <div>
    <h1>${title}</h1>
    <p>${content}</p>
  </div>
`;

// Trong React
<p className={`btn btn-${variant}`}>Click</p>
```

## Modules (import / export)

```js
// Named export
export const API_URL = 'https://api.example.com';
export function fetchUser(id) { /* ... */ }

// Named import — tên phải khớp
import { API_URL, fetchUser } from './api';

// Default export — mỗi file chỉ 1 default
export default function App() { return <div>App</div>; }

// Default import — đặt tên tùy ý
import App from './App';
import MyApp from './App'; // Cũng OK

// Import tất cả
import * as api from './api';
api.fetchUser(1);
```

### Trong React

```jsx
import { useState, useEffect } from 'react';      // Named
import UserCard from './components/UserCard';        // Default
import { API_URL } from './config';                  // Named
```

## Array Methods (dùng rất nhiều trong React)

### map — biến đổi từng phần tử

```js
const numbers = [1, 2, 3];
const doubled = numbers.map((n) => n * 2); // [2, 4, 6]

// React: render danh sách
{users.map((user) => <UserCard key={user.id} user={user} />)}
```

### filter — lọc phần tử

```js
const numbers = [1, 2, 3, 4, 5];
const even = numbers.filter((n) => n % 2 === 0); // [2, 4]

// React: xóa item
setTodos(todos.filter((todo) => todo.id !== id));
```

### find — tìm phần tử đầu tiên thỏa điều kiện

```js
const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
const alice = users.find((u) => u.id === 1); // { id: 1, name: 'Alice' }
```

### reduce — gom thành một giá trị

```js
const items = [{ price: 10 }, { price: 20 }, { price: 30 }];
const total = items.reduce((sum, item) => sum + item.price, 0); // 60
```

### some / every — kiểm tra điều kiện

```js
const ages = [18, 20, 15, 25];
ages.some((age) => age < 18);  // true (có ít nhất 1)
ages.every((age) => age >= 18); // false (không phải tất cả)
```

## Optional Chaining (?.) & Nullish Coalescing (??)

```js
// Optional chaining — trả về undefined thay vì throw error
const city = user?.address?.city; // undefined nếu user hoặc address null

// Nullish coalescing — giá trị mặc định cho null/undefined
const name = user?.name ?? 'Anonymous';

// Khác || — ?? chỉ check null/undefined, || check tất cả falsy
const count = 0;
count || 10;  // 10 (0 là falsy)
count ?? 10;  // 0  (?? chỉ thay thế null/undefined)

// Trong React
<p>{user?.profile?.bio ?? 'No bio available'}</p>
```

## Promises & Async/Await

```js
// Promise
fetch('/api/users')
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error(error));

// Async/Await — cú pháp sạch hơn
async function fetchUsers() {
  try {
    const response = await fetch('/api/users');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch:', error);
  }
}

// Trong React useEffect
useEffect(() => {
  const loadData = async () => {
    const data = await fetchUsers();
    setUsers(data);
  };
  loadData();
}, []);
```

## Ternary Operator

```js
// if/else truyền thống
let message;
if (isLoggedIn) {
  message = 'Welcome';
} else {
  message = 'Please login';
}

// Ternary — điều kiện ? giá_trị_true : giá_trị_false
const message = isLoggedIn ? 'Welcome' : 'Please login';

// Trong JSX (dùng rất nhiều)
{isLoggedIn ? <Dashboard /> : <Login />}
```

## Short-circuit Evaluation

```js
// && — trả về giá trị cuối nếu tất cả truthy
true && 'Hello';   // 'Hello'
false && 'Hello';  // false

// Trong JSX — render có điều kiện
{isAdmin && <AdminPanel />}
{error && <ErrorMessage text={error} />}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Arrow function khác gì regular function? Giải thích cách `this` hoạt động trong từng loại.

**Đáp án:**

Arrow function và regular function khác nhau ở nhiều điểm, nhưng quan trọng nhất là cách xử lý `this`:

**Regular function** tạo ra `this` riêng của nó, phụ thuộc vào **cách hàm được gọi** (call-site). Khi dùng làm method trong object, `this` trỏ đến object đó. Nhưng khi truyền hàm làm callback, `this` có thể bị mất.

**Arrow function** **không có `this` riêng** — nó kế thừa `this` từ scope bao ngoài (lexical `this`). Đây là lý do arrow function được ưa chuộng trong React.

```js
// Regular function — `this` phụ thuộc call-site
const obj = {
  name: 'Alice',
  greet: function () {
    console.log(this.name); // 'Alice' — gọi qua obj.greet()
  },
  greetLater: function () {
    setTimeout(function () {
      console.log(this.name); // undefined — `this` là window/global
    }, 1000);
  },
};

// Arrow function — `this` kế thừa từ scope bao ngoài
const obj2 = {
  name: 'Bob',
  greetLater: function () {
    setTimeout(() => {
      console.log(this.name); // 'Bob' — arrow kế thừa `this` từ greetLater
    }, 1000);
  },
};
```

**Trong React**, arrow function giúp tránh lỗi `this` khi truyền event handler:

```jsx
// Class component — regular function mất `this`
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    // Phải bind thủ công
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    return <button onClick={this.handleClick}>{this.state.count}</button>;
  }
}

// Class component — arrow function tự bind `this`
class Counter extends React.Component {
  state = { count: 0 };

  handleClick = () => {
    this.setState({ count: this.state.count + 1 }); // `this` luôn đúng
  };

  render() {
    return <button onClick={this.handleClick}>{this.state.count}</button>;
  }
}
```

Ngoài `this`, arrow function còn khác ở chỗ:
- **Không có `arguments` object** — dùng rest parameter `(...args)` thay thế.
- **Không dùng làm constructor** — không thể gọi `new ArrowFunc()`.
- **Không có `prototype`** property.

### Câu 2: Destructuring được dùng ở đâu trong React? Cho ví dụ cụ thể với props, state và API response.

**Đáp án:**

Destructuring là kỹ thuật **cốt lõi** trong React, xuất hiện ở hầu hết mọi nơi:

**1. Destructuring props trong function component:**

```jsx
// Không destructure — code dài dòng
function UserCard(props) {
  return (
    <div>
      <h2>{props.name}</h2>
      <p>{props.email}</p>
      <span>{props.role}</span>
    </div>
  );
}

// Destructure trong parameter — clean hơn
function UserCard({ name, email, role = 'member' }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{email}</p>
      <span>{role}</span>
    </div>
  );
}
```

**2. Destructuring `useState` — array destructuring:**

```jsx
// useState trả về array [giá_trị, hàm_set]
const [count, setCount] = useState(0);
const [user, setUser] = useState(null);
const [items, setItems] = useState([]);

// Nested destructuring với object state
const [formData, setFormData] = useState({
  name: '',
  email: '',
  address: { city: '', zip: '' },
});
const { name, email, address: { city } } = formData;
```

**3. Destructuring API response:**

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const response = await fetch(`/api/users/${userId}`);
      const { data, error, meta } = await response.json();

      if (error) {
        console.error(error);
        return;
      }

      // Destructure chỉ lấy field cần thiết
      const { name, email, avatar, role } = data;
      setUser({ name, email, avatar, role });
    };
    loadUser();
  }, [userId]);

  if (!user) return <p>Loading...</p>;

  const { name, email, avatar } = user;
  return (
    <div>
      <img src={avatar} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
}
```

**4. Destructuring trong custom hooks:**

```jsx
// Custom hook trả về object — người dùng chọn field cần dùng
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => { /* ... */ };
  const logout = async () => { /* ... */ };

  return { user, loading, login, logout };
}

// Sử dụng — chỉ lấy những gì cần
const { user, logout } = useAuth();
```

### Câu 3: Giải thích cách dùng spread/rest operator để cập nhật state bất biến (immutable) trong React. Tại sao phải làm vậy?

**Đáp án:**

React dùng **so sánh tham chiếu (reference equality)** để quyết định có re-render hay không. Nếu bạn mutate trực tiếp state object/array, tham chiếu không thay đổi, React **không nhận ra** state đã thay đổi và **không re-render**.

**Tại sao phải immutable:**

```jsx
// SAI — mutate trực tiếp, React KHÔNG re-render
const handleAddItem = () => {
  user.hobbies.push('gaming'); // Mutate array gốc
  setUser(user); // Cùng tham chiếu → React bỏ qua
};

// ĐÚNG — tạo object/array MỚI, React nhận ra thay đổi
const handleAddItem = () => {
  setUser({
    ...user,
    hobbies: [...user.hobbies, 'gaming'], // Tham chiếu mới
  });
};
```

**Các pattern cập nhật immutable với spread:**

```jsx
const [user, setUser] = useState({
  name: 'Alice',
  age: 25,
  address: { city: 'Hanoi', zip: '100000' },
  hobbies: ['reading', 'coding'],
});

// 1. Cập nhật field đơn giản
setUser({ ...user, name: 'Bob' });

// 2. Cập nhật nested object
setUser({
  ...user,
  address: { ...user.address, city: 'HCMC' },
});

// 3. Thêm phần tử vào array
setUser({
  ...user,
  hobbies: [...user.hobbies, 'gaming'],
});

// 4. Xóa phần tử khỏi array (dùng filter)
setUser({
  ...user,
  hobbies: user.hobbies.filter((h) => h !== 'coding'),
});

// 5. Cập nhật phần tử trong array (dùng map)
const [todos, setTodos] = useState([
  { id: 1, text: 'Learn React', done: false },
  { id: 2, text: 'Build app', done: false },
]);

setTodos(
  todos.map((todo) =>
    todo.id === 1 ? { ...todo, done: true } : todo
  )
);
```

**Rest operator để loại bỏ field:**

```jsx
// Xóa field khỏi object (không dùng delete — vì delete mutate)
const { password, ...safeUser } = user;
setUser(safeUser); // Object mới không có field password

// Ứng dụng: lọc props trước khi truyền xuống
function TextInput({ label, error, ...inputProps }) {
  return (
    <div>
      <label>{label}</label>
      <input {...inputProps} />
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

### Câu 4: `||` và `??` khác nhau như thế nào? Khi nào nên dùng cái nào trong React?

**Đáp án:**

**`||` (Logical OR):** Trả về vế phải nếu vế trái là **falsy** — bao gồm `false`, `0`, `""` (chuỗi rỗng), `null`, `undefined`, `NaN`.

**`??` (Nullish Coalescing):** Trả về vế phải **chỉ khi** vế trái là `null` hoặc `undefined`.

```js
// || coi 0, "", false là falsy → thay thế
0 || 'default';       // 'default' (0 là falsy)
'' || 'default';      // 'default' ("" là falsy)
false || 'default';   // 'default' (false là falsy)
null || 'default';    // 'default'
undefined || 'default'; // 'default'

// ?? chỉ thay thế null/undefined
0 ?? 'default';       // 0 (giữ nguyên)
'' ?? 'default';      // '' (giữ nguyên)
false ?? 'default';   // false (giữ nguyên)
null ?? 'default';    // 'default'
undefined ?? 'default'; // 'default'
```

**Trong React, sự khác biệt này rất quan trọng:**

```jsx
function ProductCard({ product }) {
  // BUG: Sản phẩm miễn phí (price = 0) hiển thị "Liên hệ" thay vì 0
  const displayPrice = product.price || 'Liên hệ';

  // ĐÚNG: Chỉ hiển thị "Liên hệ" khi price là null/undefined
  const displayPrice = product.price ?? 'Liên hệ';

  return <p>Giá: {displayPrice}</p>;
}

function UserSettings({ settings }) {
  // BUG: Nếu user tắt notifications (false), || sẽ bật lại
  const notificationsEnabled = settings.notifications || true; // Luôn true!

  // ĐÚNG: Chỉ default true khi chưa set (null/undefined)
  const notificationsEnabled = settings.notifications ?? true;

  return <Toggle value={notificationsEnabled} />;
}

function SearchResults({ results, query }) {
  // BUG: results = [] (rỗng) vẫn hiển thị "Đang tải..."
  // vì [].length = 0 là falsy
  const count = results?.length || 'Đang tải...';

  // ĐÚNG: Hiển thị 0 khi mảng rỗng, "Đang tải..." khi chưa có data
  const count = results?.length ?? 'Đang tải...';

  return <p>Tìm thấy {count} kết quả cho "{query}"</p>;
}
```

**Quy tắc chung:**
- Dùng `??` khi bạn muốn giữ nguyên `0`, `""`, `false` (đây là giá trị hợp lệ).
- Dùng `||` khi bạn muốn fallback cho **mọi giá trị falsy**.
- Trong React, **ưu tiên `??`** vì `0`, `""`, `false` thường là giá trị hợp lệ từ API hoặc user input.

### Câu 5: So sánh Promise `.then()` chain và `async/await`. Khi nào nên dùng cái nào trong React?

**Đáp án:**

Cả hai đều xử lý bất đồng bộ, nhưng `async/await` là syntax sugar trên Promise, giúp code đọc dễ hơn.

**So sánh trực quan:**

```js
// Promise .then() chain
function fetchUserData(userId) {
  return fetch(`/api/users/${userId}`)
    .then((response) => {
      if (!response.ok) throw new Error('Fetch failed');
      return response.json();
    })
    .then((user) => fetch(`/api/posts?userId=${user.id}`))
    .then((response) => response.json())
    .then((posts) => {
      console.log('Posts:', posts);
      return posts;
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

// async/await — cùng logic, dễ đọc hơn
async function fetchUserData(userId) {
  try {
    const userResponse = await fetch(`/api/users/${userId}`);
    if (!userResponse.ok) throw new Error('Fetch failed');
    const user = await userResponse.json();

    const postsResponse = await fetch(`/api/posts?userId=${user.id}`);
    const posts = await postsResponse.json();

    console.log('Posts:', posts);
    return posts;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

**Trong React — `useEffect` không được là async trực tiếp:**

```jsx
// SAI — useEffect không nhận async function
useEffect(async () => {
  const data = await fetchUsers(); // ESLint warning!
  setUsers(data);
}, []);

// ĐÚNG — tạo async function bên trong
useEffect(() => {
  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  loadUsers();
}, []);
```

**Chạy song song với `Promise.all`:**

```jsx
// Tuần tự — chậm (tổng thời gian = request1 + request2)
async function loadDashboard() {
  const users = await fetchUsers();     // 2 giây
  const products = await fetchProducts(); // 3 giây
  // Tổng: 5 giây
  return { users, products };
}

// Song song — nhanh (tổng thời gian = max(request1, request2))
async function loadDashboard() {
  const [users, products] = await Promise.all([
    fetchUsers(),     // 2 giây
    fetchProducts(),  // 3 giây
  ]);
  // Tổng: 3 giây
  return { users, products };
}

// Trong React
useEffect(() => {
  const loadData = async () => {
    try {
      const [users, categories] = await Promise.all([
        fetch('/api/users').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
      ]);
      setUsers(users);
      setCategories(categories);
    } catch (error) {
      setError('Failed to load data');
    }
  };
  loadData();
}, []);
```

**Khi nào dùng cái nào:**
- **`async/await`**: Ưu tiên dùng trong hầu hết trường hợp vì dễ đọc, dễ debug, và xử lý lỗi rõ ràng với `try/catch`.
- **`.then()` chain**: Khi cần truyền callback ngắn gọn, hoặc kết hợp với `Promise.all`/`Promise.race` trong biểu thức inline.
- **`Promise.all`**: Khi có nhiều request **độc lập** cần chạy song song để tối ưu performance.
