---
sidebar_position: 1
title: "1. Kiến thức tiên quyết"
---

# Kiến thức tiên quyết cho React Native

React Native không yêu cầu kinh nghiệm native (Swift/Kotlin), nhưng cần nền **JavaScript + React** vững. Bài này tóm tắt những kiến thức **bắt buộc** trước khi bắt đầu RN.

**Tương tự đơn giản:** Học RN giống học **lái xe ô tô** -- bạn cần biết đi xe đạp (JavaScript), biết các biển báo (React, JSX) trước. RN chỉ là "phiên bản nâng cấp" của những kỹ năng đó cho mobile.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Cần nền JavaScript ES6+ và React vững, KHÔNG cần biết Swift/Kotlin** — RN là bước nâng cấp của kỹ năng web sang mobile.
- **ES6 phải nắm** — arrow function, destructuring, spread/rest, async/await, array methods (`map`/`filter`/`reduce`).
- **Flexbox là hệ layout chính** — RN mặc định `flexDirection: 'column'` (web là `row`), không có `rem`/`em`.
- **React: function component + hooks** — `useState`, `useEffect`, JSX (không phải HTML), Fragment `<>...</>`.
- ⭐ **Props (truyền từ ngoài, immutable) vs State (nội bộ, đổi qua setter)** — không mutate trực tiếp, luôn tạo object/array mới.

:::

---

## Mục lục

- [1. JavaScript Basics](#1-javascript-basics)
- [2. CSS Basics (Flexbox)](#2-css-basics-flexbox)
- [3. React Basics](#3-react-basics)
- [4. JSX](#4-jsx)
- [5. Components, State, Props](#5-components-state-props)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. JavaScript Basics

Phải nắm vững ES6+:

### Variable, scope

```js
const PI = 3.14;            // immutable reference
let count = 0;               // mutable
// var -- TRANH dung (function-scoped, hoisting)
```

### Arrow function

```js
const add = (a, b) => a + b;
const greet = name => `Xin chao ${name}`;
const log = () => console.log('Hello');
```

### Destructuring

```js
const user = { name: 'Alice', age: 25 };
const { name, age } = user;

const arr = [1, 2, 3];
const [first, ...rest] = arr;
```

### Spread / Rest

```js
const arr = [1, 2, 3];
const newArr = [...arr, 4, 5]; // [1,2,3,4,5]

const obj = { a: 1 };
const newObj = { ...obj, b: 2 }; // {a:1, b:2}

function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
```

### Async / Await

```js
async function fetchUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    return await res.json();
  } catch (err) {
    console.error(err);
  }
}
```

### Array methods

```js
const nums = [1, 2, 3, 4, 5];
nums.map(x => x * 2);              // [2,4,6,8,10]
nums.filter(x => x > 2);            // [3,4,5]
nums.reduce((sum, x) => sum + x, 0); // 15
nums.find(x => x > 3);              // 4
nums.some(x => x > 3);              // true
nums.every(x => x > 0);             // true
```

---

## 2. CSS Basics (Flexbox)

RN dùng **Flexbox** làm chính. Khác CSS web một chút:

- **`display: flex` mặc định** -- mọi View đều flex
- **`flexDirection: 'column'` mặc định** (web là row)

```jsx
<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
  <Text>Left</Text>
  <Text>Right</Text>
</View>
```

| Property         | Vai trò                              |
| ---------------- | ------------------------------------ |
| `flexDirection`  | row / column                         |
| `justifyContent` | căn theo trục chính                  |
| `alignItems`     | căn theo trục phụ                    |
| `flex: 1`        | chiếm hết không gian còn lại         |
| `padding`, `margin` | spacing                          |
| `width`, `height`| kích thước (px, không có rem/em)     |

---

## 3. React Basics

```jsx
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log(`Count is ${count}`);
  }, [count]);

  return (
    <View>
      <Text>{count}</Text>
      <Button onPress={() => setCount(count + 1)} title="+1" />
    </View>
  );
}
```

### Hooks phổ biến

| Hook              | Vai trò                                 |
| ----------------- | --------------------------------------- |
| `useState`        | Local state                             |
| `useEffect`       | Side effect (fetch, subscribe)          |
| `useContext`      | Truy cập Context                        |
| `useRef`          | Tham chiếu element/value persistent     |
| `useMemo`         | Cache giá trị tính toán                 |
| `useCallback`     | Cache function reference                |
| `useReducer`      | State phức tạp (reducer pattern)        |

---

## 4. JSX

JSX = JavaScript + XML syntax. **JSX không phải HTML**.

```jsx
// JSX
const element = <Text style={{ color: 'red' }}>Hello {name}</Text>;

// Tuong duong JS
const element = React.createElement(Text, { style: { color: 'red' } }, 'Hello ', name);
```

### Quy tắc

- Component **viết hoa**: `<MyComponent />`
- Component **HTML/native** viết thường: `<View />` (nhưng V hoa vì là React component)
- **camelCase** cho prop: `onPress`, `backgroundColor`
- **Đóng tag**: `<Image />` (self-close), `<View></View>`
- **Một root element**: phải wrap trong `<>...</>` (Fragment) hoặc `<View>`

```jsx
// Fragment
return (
  <>
    <Text>A</Text>
    <Text>B</Text>
  </>
);
```

---

## 5. Components, State, Props

### Component

```jsx
// Function component (khuyen nghi)
function Greeting({ name }) {
  return <Text>Hello {name}</Text>;
}

// Su dung
<Greeting name="Alice" />
```

### Props

Dữ liệu **truyền vào** component, **immutable**.

```jsx
function UserCard({ user, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <Text>{user.name}</Text>
    </Pressable>
  );
}

<UserCard
  user={{ name: 'Alice' }}
  onPress={() => console.log('clicked')}
/>
```

### State

Dữ liệu **nội bộ** component, có thể thay đổi.

```jsx
function Toggle() {
  const [isOn, setIsOn] = useState(false);

  return (
    <Pressable onPress={() => setIsOn(!isOn)}>
      <Text>{isOn ? 'ON' : 'OFF'}</Text>
    </Pressable>
  );
}
```

### Lifecycle với useEffect

```jsx
function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Mount + khi dependency thay doi
    fetch('/api/users')
      .then(r => r.json())
      .then(setUsers);

    return () => {
      // Cleanup (unmount)
      console.log('Cleanup');
    };
  }, []); // [] -- chi chay 1 lan khi mount

  return (
    <View>
      {users.map(u => <Text key={u.id}>{u.name}</Text>)}
    </View>
  );
}
```

---

## Khi nào dùng?

- **Nắm trước khi học RN:**
  - JS ES6+ (arrow, destructuring, async/await)
  - React (components, hooks, JSX)
  - Flexbox (CSS căn bản)
- **Không cần (lúc đầu):**
  - Native iOS/Android
  - Webpack config sâu
- **Best practice:**
  - Học **TypeScript** song song -- chuẩn industry
  - Học **React** trước RN (web dễ hơn để debug)
  - Practice với mini-project React thuần trước

---

## Lỗi thường gặp

### Lỗi 1: Quên `key` khi map array

```jsx
// SAI -- React khong biet phan tu nao thay doi
{users.map(u => <Text>{u.name}</Text>)}

// DUNG
{users.map(u => <Text key={u.id}>{u.name}</Text>)}
```

### Lỗi 2: Mutate state

```jsx
// SAI -- mutate truc tiep
const [arr, setArr] = useState([1, 2]);
arr.push(3);            // KHONG re-render
setArr(arr);

// DUNG -- tao moi
setArr([...arr, 3]);
```

### Lỗi 3: useEffect không có dependency

```jsx
// SAI -- chay moi render (infinite loop)
useEffect(() => {
  setCount(count + 1);
});

// DUNG
useEffect(() => {
  // chay 1 lan
}, []);
```

### Lỗi 4: Trộn `class` và `function` component

```jsx
// CU
class App extends React.Component { ... }

// MOI (khuyen nghi)
function App() { ... }
```

Mọi project mới dùng function component + hooks.

---

## Câu hỏi phỏng vấn

### Câu 1: Props vs State khác gì?

**Trả lời:**

- **Props**: dữ liệu **truyền từ ngoài vào**, immutable trong component
- **State**: dữ liệu **nội bộ**, có thể thay đổi bằng setter

Props giống "tham số function". State giống "biến local".

### Câu 2: useEffect chạy khi nào?

**Trả lời:**

- **`useEffect(fn)`**: chạy sau **mỗi render**
- **`useEffect(fn, [])`**: chỉ 1 lần khi **mount**
- **`useEffect(fn, [a, b])`**: chạy khi **a hoặc b thay đổi**
- **Return function**: chạy lúc **cleanup** (unmount hoặc trước rerun)

### Câu 3: Flexbox trong RN khác CSS web thế nào?

**Trả lời:**

- **`flexDirection` mặc định là `column`** (web là `row`)
- **`display` không tồn tại** -- mọi view là flex
- **Không có `block`, `inline`** -- chỉ flex
- **Không có `%` cho margin/padding parent** -- dùng `flex`, `width`/`height` cụ thể

### Câu 4: Class vs Function component?

**Trả lời:**

- **Function component + hooks**: hiện đại, ngắn, dễ test -- chuẩn từ React 16.8
- **Class component**: cũ, dài, vẫn hoạt động nhưng không khuyến khích cho code mới

Mọi project mới dùng function component.

### Câu 5: JSX có bắt buộc không?

**Trả lời:** **Không** -- có thể dùng `React.createElement(...)` thủ công. Nhưng JSX **dễ đọc hơn nhiều** -- mọi project React/RN đều dùng JSX. JSX được compile thành `createElement` qua Babel.
