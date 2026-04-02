---
sidebar_position: 1
title: "ES6+ cần biết cho React"
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
