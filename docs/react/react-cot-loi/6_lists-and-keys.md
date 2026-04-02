---
sidebar_position: 6
title: "Danh sách & Keys"
---

# Danh sách & Keys

## Render danh sách với map()

```tsx
const fruits = ['Apple', 'Banana', 'Cherry'];

function FruitList() {
  return (
    <ul>
      {fruits.map((fruit) => (
        <li key={fruit}>{fruit}</li>
      ))}
    </ul>
  );
}
```

## Key là gì và tại sao quan trọng?

Key giúp React **xác định** phần tử nào đã thay đổi, được thêm, hoặc bị xóa trong danh sách. Không có key đúng → React phải render lại toàn bộ danh sách.

### React dùng key để diff

```
// Danh sách cũ:
<li key="1">Alice</li>
<li key="2">Bob</li>

// Danh sách mới (thêm Charlie ở đầu):
<li key="3">Charlie</li>
<li key="1">Alice</li>
<li key="2">Bob</li>

// Với key: React biết chỉ cần thêm key="3", giữ nguyên key="1" và key="2"
// Không key: React nghĩ cả 3 phần tử đều thay đổi → render lại hết
```

## Chọn key đúng

### Dùng ID duy nhất (tốt nhất)

```tsx
interface User {
  id: number;
  name: string;
}

{users.map((user) => (
  <UserCard key={user.id} user={user} />
))}
```

### Khi nào KHÔNG nên dùng index làm key?

```tsx
// ❌ Index làm key — BUG khi thêm/xóa/sắp xếp
{items.map((item, index) => (
  <input key={index} defaultValue={item.name} />
))}
// Nếu xóa phần tử đầu:
// Trước: [A(key=0), B(key=1), C(key=2)]
// Sau:   [B(key=0), C(key=1)]
// React nghĩ key=0 vẫn là phần tử cũ → giữ lại input value của A cho B!
```

**Dùng index CHỈ KHI:**
- Danh sách **tĩnh**, không bao giờ thay đổi thứ tự
- Không có phần tử nào bị thêm/xóa
- Các phần tử không có ID

```tsx
// ✅ OK dùng index — danh sách tĩnh
const menuItems = ['Home', 'About', 'Contact'];
{menuItems.map((item, index) => (
  <li key={index}>{item}</li>
))}
```

### Tạo key khi không có ID

```tsx
// Dùng crypto.randomUUID() khi tạo item
const addTodo = (text: string) => {
  setTodos((prev) => [
    ...prev,
    { id: crypto.randomUUID(), text, done: false },
  ]);
};

// ❌ KHÔNG tạo key ngẫu nhiên trong render
{items.map((item) => (
  // Key mới mỗi lần render → React remount component mỗi lần!
  <Item key={Math.random()} data={item} />
))}
```

## Rules của key

1. **Unique trong cùng danh sách** — không cần unique toàn app
2. **Stable** — không thay đổi giữa các lần render
3. **Không dùng `Math.random()`** hoặc `Date.now()` làm key
4. Key là cho React, **không được truyền vào component** qua props

```tsx
// key KHÔNG truyền vào component
<UserCard key={user.id} id={user.id} user={user} />
// Trong UserCard: props.key → undefined
// Cần truyền id riêng nếu component cần dùng
```

## Render danh sách phức tạp

### Danh sách nhóm (grouped)

```tsx
interface GroupedData {
  [category: string]: Item[];
}

function GroupedList({ data }: { data: GroupedData }) {
  return (
    <div>
      {Object.entries(data).map(([category, items]) => (
        <section key={category}>
          <h2>{category}</h2>
          <ul>
            {items.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
```

### Key với Fragment

```tsx
// Fragment ngắn <> không hỗ trợ key
// Dùng Fragment đầy đủ khi cần key
import { Fragment } from 'react';

{users.map((user) => (
  <Fragment key={user.id}>
    <dt>{user.name}</dt>
    <dd>{user.email}</dd>
  </Fragment>
))}
```

## Key để reset component

Key không chỉ dùng cho danh sách — thay đổi key sẽ **unmount rồi remount** component:

```tsx
// Khi userId thay đổi → ProfileForm unmount hoàn toàn
// → mount lại với state mới (reset form)
<ProfileForm key={userId} userId={userId} />
```

Đây là cách đơn giản nhất để "reset" một component về trạng thái ban đầu.
