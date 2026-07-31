---
sidebar_position: 3
title: "3. To-Do List"
---

# Project 2: To-Do List

To-Do List là project "kinh điển" để học React vì nó gói gọn gần như mọi kỹ năng nền tảng: quản lý **danh sách trong state**, **render mảng**, **form nhập liệu**, **cập nhật bất biến**, và **lưu dữ liệu** xuống trình duyệt bằng `useEffect` + localStorage.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Cập nhật bất biến** — dùng `[...spread]`, `.map()`, `.filter()` để tạo mảng/object mới; tránh `.push()` hay gán trực tiếp vì React so sánh tham chiếu để biết state đổi.
- ⭐ **Render mảng bằng `.map()`** — mỗi phần tử cần `key` duy nhất, ổn định (dùng `id`, đừng dùng index).
- **Form controlled** — `value` lấy từ state + `onChange` cập nhật state, để state là nguồn sự thật duy nhất.
- **`e.preventDefault()`** — bắt buộc trong hàm xử lý submit để chặn form tải lại trang.
- **Đừng lưu state tính ra được** — danh sách đã lọc nên tính lại từ `todos` + `filter` mỗi lần render.
- **`useEffect(fn, [deps])`** — chạy tác dụng phụ khi `deps` đổi; dùng lưu localStorage với `JSON.stringify`/`parse`.

:::

---

## Mục lục

- [Phân tích bài toán](#phân-tích-bài-toán)
- [Bước 1: State là một mảng](#bước-1-state-là-một-mảng)
- [Bước 2: Render danh sách và vai trò của key](#bước-2-render-danh-sách-và-vai-trò-của-key)
- [Bước 3: Form controlled để nhập việc mới](#bước-3-form-controlled-để-nhập-việc-mới)
- [Bước 4: Thêm việc — cập nhật mảng bất biến](#bước-4-thêm-việc--cập-nhật-mảng-bất-biến)
- [Bước 5: Xoá và đánh dấu hoàn thành](#bước-5-xoá-và-đánh-dấu-hoàn-thành)
- [Bước 6: Lọc theo trạng thái](#bước-6-lọc-theo-trạng-thái)
- [Bước 7: Lưu xuống localStorage với useEffect](#bước-7-lưu-xuống-localstorage-với-useeffect)
- [Thử thách mở rộng](#thử-thách-mở-rộng)
- [Tóm tắt](#tóm-tắt)

---

## Phân tích bài toán

Sản phẩm: một danh sách công việc cho phép **thêm**, **đánh dấu hoàn thành**, **xoá**, **lọc** (tất cả / chưa xong / đã xong), và **giữ lại dữ liệu** sau khi tải lại trang.

Mỗi công việc cần lưu nhiều thông tin nên ta dùng **object**:

```js
{ id: 1, text: "Học React", done: false }
```

Cả danh sách là **mảng các object**. Đây là state chính của ứng dụng.

Khái niệm cốt lõi rút ra:
- State có thể là **mảng/object**, không chỉ số hay chuỗi.
- Render mảng bằng **`.map()`** và mỗi phần tử cần một **`key`** duy nhất.
- Mọi cập nhật phải **bất biến**: tạo mảng/object **mới**, không sửa cái cũ.
- **`useEffect`** chạy "tác dụng phụ" như lưu dữ liệu mỗi khi state đổi.

---

## Bước 1: State là một mảng

Tạo `src/TodoApp.jsx`. Khởi tạo state là mảng vài việc mẫu để có cái mà hiển thị trước:

```jsx
import { useState } from 'react'

function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Học JSX', done: true },
    { id: 2, text: 'Học useState', done: false },
  ])

  return (
    <div>
      <h1>Việc cần làm</h1>
      {/* danh sách sẽ render ở bước sau */}
    </div>
  )
}

export default TodoApp
```

State `todos` là mảng các object — hoàn toàn hợp lệ. React không quan tâm state là kiểu gì, miễn bạn cập nhật qua `setTodos`.

---

## Bước 2: Render danh sách và vai trò của key

Để biến mảng thành giao diện, ta dùng **`.map()`** — duyệt từng phần tử và trả về một JSX:

```jsx
<ul>
  {todos.map((todo) => (
    <li key={todo.id}>
      {todo.text} {todo.done && '✅'}
    </li>
  ))}
</ul>
```

Giải thích:

- **`todos.map(todo => <li>...</li>)`** biến mảng object thành mảng các phần tử `<li>`. React tự render cả mảng JSX này.
- **`key={todo.id}`** — **bắt buộc** khi render danh sách. `key` là một giá trị **duy nhất, ổn định** giúp React nhận diện từng phần tử khi danh sách thay đổi (thêm/xoá/sắp xếp). Nhờ key, React chỉ vẽ lại đúng phần tử đổi thay vì vẽ lại cả danh sách.

:::warning Đừng dùng index của mảng làm key
Nhiều người viết `key={index}`. Cách này gây bug khi xoá/chèn giữa danh sách, vì index thay đổi và React nhầm lẫn các phần tử. Hãy dùng **id ổn định** của dữ liệu. Nếu dữ liệu chưa có id, sinh id khi tạo (xem bước 4).
:::

Nếu mở Console mà thấy cảnh báo `Each child in a list should have a unique "key" prop` — đó chính là nhắc bạn thiếu `key`.

---

## Bước 3: Form controlled để nhập việc mới

Ta cần một ô input để gõ việc mới. Trong React, cách chuẩn là **controlled component**: giá trị ô input được **điều khiển bởi state**.

```jsx
const [text, setText] = useState('')

return (
  <div>
    <input
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="Nhập việc cần làm..."
    />
  </div>
)
```

Cơ chế controlled component:

1. `value={text}` — ô input **luôn hiển thị** giá trị từ state `text`.
2. Khi gõ phím, sự kiện `onChange` chạy, `e.target.value` là nội dung mới trong ô.
3. `setText(...)` cập nhật state → React vẽ lại → ô input hiển thị giá trị mới.

Nghe vòng vo, nhưng lợi ích lớn: **state luôn là nguồn sự thật duy nhất**. Bạn luôn biết chính xác trong ô đang có gì, và có thể xử lý/validate dễ dàng.

:::info Controlled vs uncontrolled
- **Controlled**: giá trị do React state quản lý (`value` + `onChange`). Khuyến nghị dùng.
- **Uncontrolled**: để DOM tự giữ giá trị, đọc ra khi cần bằng `ref`. Ít dùng hơn.
:::

---

## Bước 4: Thêm việc — cập nhật mảng bất biến

Bọc input trong `<form>` và xử lý khi submit:

```jsx
const themViec = (e) => {
  e.preventDefault()                  // chặn trình duyệt tải lại trang
  const noiDung = text.trim()
  if (noiDung === '') return          // không thêm việc rỗng

  const viecMoi = {
    id: Date.now(),                   // dùng mốc thời gian làm id duy nhất
    text: noiDung,
    done: false,
  }

  setTodos([...todos, viecMoi])       // tạo MẢNG MỚI gồm các việc cũ + việc mới
  setText('')                         // xoá ô input
}

return (
  <form onSubmit={themViec}>
    <input value={text} onChange={(e) => setText(e.target.value)} />
    <button type="submit">Thêm</button>
  </form>
)
```

**Điểm quan trọng nhất — cập nhật bất biến (immutable):**

```jsx
setTodos([...todos, viecMoi])   // ĐÚNG: mảng mới
todos.push(viecMoi)             // SAI: sửa thẳng mảng cũ → React không vẽ lại
```

React phát hiện state đổi bằng cách so sánh **tham chiếu** (mảng cũ và mới có phải cùng một object không). Nếu bạn `.push()` vào mảng cũ, tham chiếu **không đổi** → React nghĩ "không có gì thay đổi" → không vẽ lại. Toán tử `...` (spread) tạo ra **mảng mới** chứa các phần tử cũ rồi thêm phần tử mới → tham chiếu khác → React vẽ lại.

:::warning e.preventDefault()
Mặc định `<form>` khi submit sẽ **tải lại cả trang** (hành vi HTML cổ điển), làm mất sạch state. Luôn gọi `e.preventDefault()` ở đầu hàm xử lý submit để chặn việc đó.
:::

---

## Bước 5: Xoá và đánh dấu hoàn thành

Cả hai thao tác đều tuân thủ nguyên tắc bất biến.

**Xoá** — dùng `.filter()` để tạo mảng mới *không chứa* phần tử cần xoá:

```jsx
const xoaViec = (id) => {
  setTodos(todos.filter((todo) => todo.id !== id))
}
```

**Đánh dấu hoàn thành** — dùng `.map()` để tạo mảng mới, riêng phần tử trùng id thì tạo **object mới** với `done` đảo ngược:

```jsx
const toggleViec = (id) => {
  setTodos(
    todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    )
  )
}
```

Giải thích `{ ...todo, done: !todo.done }`:
- `...todo` sao chép mọi thuộc tính của object cũ (`id`, `text`).
- `done: !todo.done` ghi đè riêng thuộc tính `done` bằng giá trị đảo ngược.
- Kết quả là một **object mới** → đảm bảo bất biến.

Cập nhật phần render để gắn sự kiện:

```jsx
<ul>
  {todos.map((todo) => (
    <li key={todo.id}>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => toggleViec(todo.id)}
      />
      <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
        {todo.text}
      </span>
      <button onClick={() => xoaViec(todo.id)}>Xoá</button>
    </li>
  ))}
</ul>
```

Lưu ý ta dùng `onClick={() => xoaViec(todo.id)}` — bọc trong mũi tên để **truyền id** vào hàm mà không gọi ngay.

:::tip Quy tắc vàng về cập nhật state
`.map()`, `.filter()`, `[...spread]` đều **trả về mảng mới** → an toàn cho React.
`.push()`, `.splice()`, `.sort()`, gán `obj.x = ...` đều **sửa thẳng** → tránh dùng với state.
:::

---

## Bước 6: Lọc theo trạng thái

Thêm state cho bộ lọc rồi tính danh sách hiển thị từ `todos`:

```jsx
const [filter, setFilter] = useState('all')   // 'all' | 'active' | 'done'

const todosHienThi = todos.filter((todo) => {
  if (filter === 'active') return !todo.done
  if (filter === 'done') return todo.done
  return true                                  // 'all'
})
```

Rồi render `todosHienThi` thay vì `todos`, và thêm các nút lọc:

```jsx
<div>
  <button onClick={() => setFilter('all')}>Tất cả</button>
  <button onClick={() => setFilter('active')}>Chưa xong</button>
  <button onClick={() => setFilter('done')}>Đã xong</button>
</div>
```

Điểm hay: ta **không lưu thêm** danh sách đã lọc vào state. `todosHienThi` được **tính lại** từ `todos` + `filter` mỗi lần render. Nguyên tắc quan trọng: **đừng lưu vào state thứ có thể tính ra được** từ state khác — dễ gây dữ liệu lệch nhau.

---

## Bước 7: Lưu xuống localStorage với useEffect

Hiện tải lại trang là mất hết việc. Ta lưu xuống **localStorage** (bộ nhớ của trình duyệt) bằng Hook **`useEffect`**.

```jsx
import { useState, useEffect } from 'react'

function TodoApp() {
  // Khởi tạo state: đọc dữ liệu đã lưu (nếu có)
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos')
    return saved ? JSON.parse(saved) : []
  })

  // Mỗi khi todos đổi → lưu lại
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  // ... phần còn lại giữ nguyên
}
```

Giải thích **`useEffect`** — Hook để chạy "tác dụng phụ" (thao tác ngoài việc tính ra giao diện, ví dụ: lưu file, gọi API, đặt timer):

```jsx
useEffect(() => {
  // code chạy SAU khi render
}, [todos])      // mảng phụ thuộc (dependency array)
```

- **Hàm bên trong** chạy sau mỗi lần render *nếu* giá trị trong mảng phụ thuộc thay đổi.
- **`[todos]`** là **mảng phụ thuộc**: "chỉ chạy lại effect khi `todos` đổi". Nhờ đó mỗi lần thêm/xoá/toggle việc, dữ liệu được lưu ngay.

Hai điểm về dependency array:
- `[]` (mảng rỗng) → effect chỉ chạy **một lần** sau lần render đầu (hữu ích để gọi API lúc mở trang).
- **Bỏ trống** (không truyền mảng) → effect chạy **sau mọi lần render** → thường gây lặp thừa, hiếm khi muốn.

Về khởi tạo state, ta dùng **hàm khởi tạo lười** `useState(() => {...})`: truyền một hàm thay vì giá trị, React chỉ gọi nó **một lần** lúc tạo component — tránh đọc localStorage lặp lại mỗi lần render.

`JSON.stringify` / `JSON.parse` cần thiết vì localStorage **chỉ lưu được chuỗi**, nên ta phải đổi mảng ↔ chuỗi JSON.

:::info StrictMode khiến effect chạy 2 lần khi dev
Ở môi trường phát triển, React StrictMode cố ý chạy effect 2 lần để giúp bạn phát hiện lỗi. Ở bản build production thì chỉ chạy đúng số lần. Đừng hoảng nếu thấy effect chạy đôi lúc dev.
:::

---

## Thử thách mở rộng

1. **Đếm số việc chưa xong**: hiển thị "Còn 3 việc chưa làm" (tính từ `todos.filter`).
2. **Sửa nội dung việc**: double-click vào việc để hiện ô input chỉnh sửa.
3. **Nút "Xoá hết việc đã xong"**: lọc bỏ mọi việc `done === true`.
4. **Chặn trùng**: không cho thêm việc có nội dung y hệt việc đã có.
5. **Tách component**: tách `<li>` ra thành component `TodoItem` nhận props `todo`, `onToggle`, `onDelete` — luyện tư duy chia nhỏ.

---

## Tóm tắt

- State có thể là **mảng các object**; cập nhật qua `setTodos`.
- Render mảng bằng **`.map()`**, mỗi phần tử cần **`key` duy nhất, ổn định** (dùng id, không dùng index).
- **Form controlled**: `value` lấy từ state + `onChange` cập nhật state → state là nguồn sự thật.
- **Cập nhật bất biến**: dùng `[...spread]`, `.map()`, `.filter()` (tạo mới); tránh `.push()`, gán trực tiếp.
- Gọi **`e.preventDefault()`** trong xử lý submit form.
- **Đừng lưu state thứ tính ra được** (như danh sách đã lọc) — tính lại khi render.
- **`useEffect(fn, [deps])`** chạy tác dụng phụ khi deps đổi; dùng để lưu localStorage (`JSON.stringify`/`parse`).

Tiếp theo ta học lấy dữ liệu thật từ internet: [App Thời tiết](./4_app-thoi-tiet.md).
