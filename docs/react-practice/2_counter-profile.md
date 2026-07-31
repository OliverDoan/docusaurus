---
sidebar_position: 2
title: "2. Counter & Profile Card"
---

# Project 1: Counter & Profile Card

Project đầu tiên cố tình nhỏ để bạn nắm vững **3 trụ cột của React**: component, props và state. Ta sẽ làm 2 thứ: một **thẻ hồ sơ cá nhân** (Profile Card) để hiểu component & props, và một **bộ đếm** (Counter) để hiểu state & sự kiện.

---

:::note[Ghi nhớ nhanh]

- ⭐ **3 trụ cột React** — `component` (hàm trả về JSX), `props` (dữ liệu cha truyền xuống, chỉ đọc), `state` (dữ liệu riêng, đổi được).
- ⭐ **`useState` tạo state** — `const [count, setCount] = useState(0)`; luôn cập nhật qua hàm set để React vẽ lại, không gán trực tiếp.
- **Component viết hoa chữ đầu** — React phân biệt component (`ProfileCard`) với thẻ HTML thường (`div`).
- **`props` chỉ đọc, một chiều** — dữ liệu chảy từ cha xuống con, con không được sửa props.
- **Sự kiện phải truyền một hàm** — `onClick={() => setCount(count + 1)}`, đừng gọi hàm ngay kẻo lỗi "Too many re-renders".
- **Render có điều kiện** — dùng `&&` (có/không) và `? :` (chọn 1 trong 2) ngay trong JSX.

:::

---

## Mục lục

- [Phân tích bài toán](#phân-tích-bài-toán)
- [Bước 1: Component đầu tiên](#bước-1-component-đầu-tiên)
- [Bước 2: Truyền dữ liệu bằng props](#bước-2-truyền-dữ-liệu-bằng-props)
- [Bước 3: Tái sử dụng component](#bước-3-tái-sử-dụng-component)
- [Bước 4: State với useState — làm bộ đếm](#bước-4-state-với-usestate--làm-bộ-đếm)
- [Bước 5: Xử lý nhiều sự kiện](#bước-5-xử-lý-nhiều-sự-kiện)
- [Bước 6: Render có điều kiện](#bước-6-render-có-điều-kiện)
- [Thử thách mở rộng](#thử-thách-mở-rộng)
- [Tóm tắt](#tóm-tắt)

---

## Phân tích bài toán

Trước khi viết, hãy hình dung sản phẩm:

- **Profile Card**: một thẻ hiển thị ảnh, tên và nghề nghiệp. Ta muốn hiển thị **nhiều thẻ khác nhau** mà không phải viết lại code → cần `props`.
- **Counter**: một con số kèm nút `+` và `-`. Bấm nút thì số thay đổi và giao diện cập nhật ngay → cần `state`.

Khái niệm cốt lõi rút ra:
- **Component** = một hàm trả về JSX, là một mảnh giao diện tái sử dụng được.
- **Props** = dữ liệu **truyền từ ngoài vào** component (chỉ đọc, không sửa).
- **State** = dữ liệu **riêng của component**, thay đổi được; khi đổi thì React **vẽ lại** component.

---

## Bước 1: Component đầu tiên

Tạo file mới `src/ProfileCard.jsx`. Một component chỉ là **một hàm viết hoa chữ đầu** trả về JSX:

```jsx
function ProfileCard() {
  return (
    <div className="card">
      <h2>Nguyễn Văn A</h2>
      <p>Lập trình viên Frontend</p>
    </div>
  )
}

export default ProfileCard
```

Giải thích:

- **Tên hàm viết hoa chữ đầu** (`ProfileCard`, không phải `profileCard`). Đây là quy tắc bắt buộc: React phân biệt component (viết hoa) với thẻ HTML thường (viết thường như `div`).
- **`export default`** để file khác có thể `import` component này.

Giờ dùng nó trong `App.jsx`:

```jsx
import ProfileCard from './ProfileCard.jsx'

function App() {
  return (
    <div>
      <h1>Danh bạ</h1>
      <ProfileCard />
    </div>
  )
}

export default App
```

Lưu lại — thẻ hồ sơ hiện ra. Bạn vừa **ghép component con vào component cha**.

---

## Bước 2: Truyền dữ liệu bằng props

Hiện thẻ luôn hiển thị cứng "Nguyễn Văn A". Để mỗi thẻ một nội dung khác nhau, ta truyền dữ liệu vào qua **props** — y như truyền tham số cho một hàm.

Sửa `ProfileCard.jsx` để **nhận** props:

```jsx
function ProfileCard({ name, job }) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>{job}</p>
    </div>
  )
}

export default ProfileCard
```

Và trong `App.jsx`, **truyền** props vào như thuộc tính HTML:

```jsx
<ProfileCard name="Nguyễn Văn A" job="Lập trình viên Frontend" />
```

Giải thích:

- Props được truyền vào dưới dạng `name="..."` `job="..."`, giống thuộc tính HTML.
- Trong component, React gom tất cả props thành **một object**. Ta dùng cú pháp **destructuring** `{ name, job }` để lấy ra từng giá trị cho gọn.
- `{name}` và `{job}` trong JSX chèn giá trị vào giao diện.

:::info Props là một chiều và chỉ đọc
Dữ liệu luôn chảy **từ cha xuống con** (one-way data flow). Component con **không được sửa** props của mình — coi props như tham số chỉ đọc. Muốn thay đổi, dữ liệu phải đổi ở component cha rồi truyền xuống lại.
:::

---

## Bước 3: Tái sử dụng component

Đây là sức mạnh của component: viết một lần, dùng nhiều lần với dữ liệu khác nhau.

```jsx
import ProfileCard from './ProfileCard.jsx'

function App() {
  return (
    <div>
      <h1>Danh bạ</h1>
      <ProfileCard name="Nguyễn Văn A" job="Frontend Developer" />
      <ProfileCard name="Trần Thị B" job="Backend Developer" />
      <ProfileCard name="Lê Văn C" job="Designer" />
    </div>
  )
}

export default App
```

Ba thẻ, cùng một component, ba nội dung khác nhau. Nếu sau này muốn đổi giao diện thẻ (thêm viền, đổi màu), bạn chỉ sửa **một chỗ** trong `ProfileCard.jsx` và cả ba thẻ đều đổi theo.

---

## Bước 4: State với useState — làm bộ đếm

Props là dữ liệu từ ngoài vào. Còn dữ liệu **tự thay đổi bên trong** component (như con số của bộ đếm) thì dùng **state**.

Tạo file `src/Counter.jsx`:

```jsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Giá trị: {count}</p>
      <button onClick={() => setCount(count + 1)}>Tăng</button>
    </div>
  )
}

export default Counter
```

Giải thích kỹ dòng quan trọng nhất — `const [count, setCount] = useState(0)`:

- **`useState`** là một **Hook** (hàm đặc biệt của React, luôn bắt đầu bằng `use`). Nó tạo ra một ô nhớ state.
- **`useState(0)`** — `0` là **giá trị khởi tạo** của state.
- Nó trả về một **mảng 2 phần tử**, ta destructuring ra:
  - **`count`** — giá trị hiện tại của state (để đọc/hiển thị).
  - **`setCount`** — hàm để **cập nhật** state. Chỉ được đổi state qua hàm này.

**Vì sao không gán thẳng `count = count + 1`?** Vì React cần biết state đã đổi để **vẽ lại** giao diện. Gán trực tiếp, React không hay biết gì → màn hình không cập nhật. Gọi `setCount(...)` chính là cách "báo cho React": dữ liệu đổi rồi, hãy vẽ lại.

**`onClick={() => setCount(count + 1)}`** — gắn sự kiện click. Lưu ý truyền **một hàm** (`() => ...`), không phải gọi hàm ngay (`setCount(count + 1)` không có mũi tên sẽ chạy ngay khi render → sai).

Thêm `<Counter />` vào `App.jsx` để thử.

:::warning Lỗi kinh điển: gọi hàm thay vì truyền hàm
```jsx
<button onClick={setCount(count + 1)}>   // SAI: chạy ngay khi render
<button onClick={() => setCount(count + 1)}>  // ĐÚNG: chỉ chạy khi click
```
Lỗi sai gây ra vòng lặp cập nhật vô tận ("Too many re-renders").
:::

---

## Bước 5: Xử lý nhiều sự kiện

Thêm nút giảm và nút reset:

```jsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  const tang = () => setCount(count + 1)
  const giam = () => setCount(count - 1)
  const reset = () => setCount(0)

  return (
    <div>
      <p>Giá trị: {count}</p>
      <button onClick={giam}>−</button>
      <button onClick={reset}>Reset</button>
      <button onClick={tang}>+</button>
    </div>
  )
}

export default Counter
```

Khi xử lý phức tạp hơn, ta tách logic ra **hàm riêng** (`tang`, `giam`, `reset`) rồi truyền tên hàm vào `onClick`. Lúc này truyền tên hàm `onClick={tang}` (không có ngoặc) là đúng, vì ta đưa *bản thân hàm* cho React giữ, chờ click mới gọi.

:::tip Cập nhật state dựa trên giá trị cũ
Khi state mới phụ thuộc state cũ, nên dùng dạng hàm để chắc chắn lấy đúng giá trị mới nhất:
```jsx
setCount(prev => prev + 1)
```
`prev` là giá trị hiện tại do React đưa vào. Cách này an toàn hơn khi có nhiều cập nhật liên tiếp.
:::

---

## Bước 6: Render có điều kiện

Hãy hiển thị cảnh báo khi số âm. React không có cú pháp `if` ngay trong JSX, nhưng ta dùng được toán tử JavaScript:

```jsx
return (
  <div>
    <p>Giá trị: {count}</p>

    {/* Toán tử && : chỉ hiện phần bên phải khi điều kiện đúng */}
    {count < 0 && <p style={{ color: 'red' }}>Cảnh báo: số âm!</p>}

    {/* Toán tử 3 ngôi: chọn 1 trong 2 */}
    <p>{count === 0 ? 'Đang ở mốc 0' : 'Khác 0'}</p>

    <button onClick={giam}>−</button>
    <button onClick={tang}>+</button>
  </div>
)
```

Hai kỹ thuật cần nhớ:

- **`điều_kiện && <JSX>`** — hiện `<JSX>` khi điều kiện đúng, ngược lại không hiện gì. Dùng khi "có hoặc không".
- **`điều_kiện ? <A> : <B>`** — chọn `<A>` hoặc `<B>`. Dùng khi "cái này hoặc cái kia".

:::warning Bẫy với toán tử &&
`{count && <p>...</p>}` khi `count = 0` sẽ in ra số `0` trên màn hình (vì `0` là giá trị "falsy" nhưng vẫn được render). Hãy viết điều kiện trả về boolean rõ ràng như `{count > 0 && ...}`.
:::

---

## Thử thách mở rộng

Tự làm để thực sự thành thạo:

1. **Bước nhảy tuỳ chỉnh**: thêm 2 nút "+5" và "−5".
2. **Giới hạn**: không cho `count` vượt quá 10 hay nhỏ hơn 0 (dùng điều kiện trong hàm `tang`/`giam`).
3. **Đổi màu theo giá trị**: số > 5 hiện màu xanh, số < 0 hiện màu đỏ (dùng toán tử 3 ngôi cho thuộc tính `style`).
4. **Profile Card có avatar**: thêm prop `avatarUrl` và hiển thị `<img src={avatarUrl} />`.
5. **Prop mặc định**: nếu không truyền `job`, hiển thị "Chưa cập nhật" (gợi ý: `{ name, job = "Chưa cập nhật" }`).

---

## Tóm tắt

- **Component** là hàm viết hoa chữ đầu, trả về JSX; ghép component con vào cha để dựng giao diện.
- **Props** là dữ liệu truyền từ cha xuống con, **chỉ đọc**; giúp tái sử dụng một component với nhiều nội dung.
- **`useState`** tạo state riêng của component: `const [giá_trị, hàm_set] = useState(khởi_tạo)`.
- Luôn cập nhật state qua **hàm set** (không gán trực tiếp), để React vẽ lại giao diện.
- Sự kiện: truyền **một hàm** vào `onClick` (`() => ...` hoặc tên hàm), đừng gọi hàm ngay.
- **Render có điều kiện** bằng `&&` (có/không) và `? :` (chọn 1 trong 2).

Tiếp theo ta làm app phức tạp hơn với danh sách và form: [To-Do List](./3_todo-list.md).
