---
sidebar_position: 2
title: "2. Lists and Keys"
---

# Lists and Keys

Trong React, để hiển thị một **list** (danh sách nhiều phần tử), ta thường lặp qua mảng dữ liệu và trả về một component cho mỗi phần tử. Mỗi phần tử cần một **key** (khóa định danh duy nhất) để React nhận biết phần tử nào đã thêm, sửa hay xóa, từ đó cập nhật giao diện hiệu quả. Chọn key đúng giúp tránh lỗi hiển thị và tăng hiệu năng khi danh sách thay đổi.

---

## Mục lục

- [Vì sao cần key khi render danh sách?](#vì-sao-cần-key-khi-render-danh-sách)
- [Render danh sách](#render-danh-sách)
- [Tại sao cần key?](#tại-sao-cần-key)
- [Chọn key đúng](#chọn-key-đúng)
- [Key trong Fragment](#key-trong-fragment)
- [Anti-pattern](#anti-pattern)

---

## Vì sao cần key khi render danh sách?

**Vấn đề:**

```jsx
// Render mảng thành nhiều element, không có key ổn định
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo, i) => (
        <li key={i}>
          <input defaultValue={todo.text} />
        </li>
      ))}
    </ul>
  );
}
```

Khi list thay đổi (thêm/xoá/sắp xếp), React không biết phần tử nào là phần
tử nào → re-render sai, mất state của input, hiệu năng kém. Dùng `index`
làm key gây bug ngay khi thứ tự đổi: item ở vị trí cũ bị gán nhầm dữ liệu
của item khác.

**Giải pháp:**

```jsx
// key ổn định & duy nhất (thường là id) → React nhận diện đúng từng phần tử
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <input defaultValue={todo.text} />
        </li>
      ))}
    </ul>
  );
}
```

`key` duy nhất giúp React **nhận diện** từng phần tử qua các lần render để
reconcile chính xác, giữ đúng state của từng instance dù list thêm, xoá hay
đảo thứ tự.

:::tip[Dùng thực tế]

- **Render danh sách từ API**: dùng `key={item.id}` (id từ database) để
  React khớp đúng phần tử khi data cập nhật.
- **Todo list thêm/xoá**: key ổn định giúp giữ nguyên state các todo còn
  lại khi xoá một item ở giữa.
- **Bảng có sắp xếp/lọc**: khi sort hay filter, key theo id giữ đúng state
  từng dòng (checkbox, input) thay vì gán nhầm.
- **Tránh dùng index** làm key khi list động (reorder/insert/delete giữa) —
  chỉ dùng index cho list tĩnh, không đổi thứ tự.

:::

---

## Render danh sách

Dùng `.map()` trả về array element:

```jsx
function ProductList({ products }) {
  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

Có thể `.filter()` + `.map()` chain:

```jsx
{products
  .filter(p => p.inStock)
  .map(p => <ProductCard key={p.id} product={p} />)
}
```

---

## Tại sao cần key?

React dùng **key** để **identify** element giữa các lần render. Không có
key → React phải so sánh theo index → re-render thừa và mất state.

Vd: list với input.

```jsx
const [items, setItems] = useState(["a", "b", "c"]);

return items.map((item, i) => (
  <input key={i} defaultValue={item} />
));
```

**Khi prepend item mới** vào đầu list:

```jsx
setItems(["NEW", "a", "b", "c"]);
```

Với `key={index}`:

- Input ở index 0: defaultValue "a" → đổi thành "NEW"
- Input ở index 1: "b" → "a"
- ... → user gõ vào input bị mất hết text

Với `key={item.id}` (id ổn định):

- Input có id mới: tạo mới, defaultValue "NEW"
- Input id "a", "b", "c": **giữ nguyên** instance + state user gõ

:::info[Phân tích]

**Cơ chế reconciliation với key:**

React so sánh array cũ và mới qua **key**:

- Key giống nhau → **giữ nguyên** component instance (state, focus, scroll).
- Key mới → **mount** component mới.
- Key biến mất → **unmount** component.

Không có key → React fallback dùng index → coi mọi item như "cùng instance",
chỉ update props. Hậu quả:

- DOM input vẫn cùng element → state hệ điều hành (caret, IME...) còn nguyên.
- Component state (`useState`) bị nhầm.
- Effect không re-run khi cần.

→ Key đúng là **yêu cầu correctness**, không chỉ performance.

:::

---

## Chọn key đúng

**Ưu tiên** (tốt nhất xuống tệ nhất):

1. **ID từ data** (id từ database, UUID):

```jsx
{users.map(user => <li key={user.id}>{user.name}</li>)}
```

2. **Hash của nội dung** (nếu data không có id, không reorder):

```jsx
{tags.map(tag => <Tag key={tag} name={tag} />)}
```

3. **Index** (chỉ khi list **không reorder, không insert/delete giữa**):

```jsx
{staticList.map((item, i) => <li key={i}>{item}</li>)}
```

:::warning[Cần lưu ý]

**Khi nào KHÔNG được dùng `key={index}`:**

- List có thể **reorder** (sort, drag-drop).
- List có thể **insert/delete giữa** (không chỉ append/pop cuối).
- Item có **state nội bộ** (input, form, animation).

Đa số trường hợp gặp bug với key index là khi list "động". Quy tắc:
**nếu order item có thể đổi → tuyệt đối không dùng index làm key**.

:::

---

## Key trong Fragment

`<>...</>` không nhận `key`. Dùng `<Fragment>` đầy đủ:

```jsx
import { Fragment } from "react";

{items.map(item => (
  <Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.desc}</dd>
  </Fragment>
))}
```

---

## Anti-pattern

**1. Generate key bằng `Math.random()`**:

```jsx
// SAI — key đổi mỗi render → toàn bộ remount
{items.map(item => <li key={Math.random()}>{item.name}</li>)}
```

Bug:
- Input mất focus liên tục.
- Animation reset.
- Performance kém.

**2. Key nằm trong child, không ở element của `.map`**:

```jsx
// Sai — key trên div bên trong
{items.map(item => (
  <li>
    <div key={item.id}>{item.name}</div>
  </li>
))}

// Đúng — key trên element thẳng từ map
{items.map(item => (
  <li key={item.id}>
    <div>{item.name}</div>
  </li>
))}
```

**3. Key trùng**:

```jsx
{items.map(item => (
  <li key={item.category}>{item.name}</li>
))}
// Nhiều item cùng category → key trùng → React warning + bug
```

:::tip[Mẹo]

**Composite key khi không có id duy nhất**:

```jsx
{items.map((item, i) => (
  <li key={`${item.category}-${item.name}-${i}`}>
    {item.name}
  </li>
))}
```

Hoặc thêm `useId` cho client-generated ID (nhưng `useId` không ổn định
giữa render → không phù hợp làm key của data).

Tốt nhất: **đảm bảo data có id từ nguồn** (DB autoincrement, UUID, hash
content).

:::

:::info[Phân tích]

**Key chỉ unique trong cùng một `.map`** — không phải global:

```jsx
function App() {
  return (
    <>
      {usersA.map(u => <UserCard key={u.id} user={u} />)}
      {usersB.map(u => <UserCard key={u.id} user={u} />)}
    </>
  );
}
```

Hai list khác nhau → có thể trùng `id` nhưng React không nhầm vì chúng
thuộc 2 list riêng.

Nhưng nếu **merge thành 1 list**:

```jsx
{[...usersA, ...usersB].map(u => <UserCard key={u.id} user={u} />)}
// Nếu id trùng → bug
```

→ Prefix key khi merge: ``key={`a-${u.id}`}`` cho list A.

:::
