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

---

## Câu hỏi phỏng vấn

### Câu 1: Tại sao key quan trọng khi render danh sách?
**Đáp án:**
Key là cách React xác định phần tử nào trong danh sách đã thay đổi, được thêm, hoặc bị xóa. Không có key đúng, React phải render lại toàn bộ danh sách thay vì chỉ cập nhật phần tử thay đổi.

```jsx
// Ví dụ: Thêm item mới vào đầu danh sách
// Danh sách cũ:
<li key="a">Alice</li>
<li key="b">Bob</li>

// Danh sách mới (thêm Charlie ở đầu):
<li key="c">Charlie</li>
<li key="a">Alice</li>
<li key="b">Bob</li>

// CÓ key đúng:
// React biết key="a" và key="b" không thay đổi → giữ nguyên
// Chỉ thêm key="c" → hiệu suất tốt

// KHÔNG có key (hoặc dùng index):
// React so sánh theo vị trí:
// Vị trí 0: Alice → Charlie (thay đổi!)
// Vị trí 1: Bob → Alice (thay đổi!)
// Vị trí 2: (mới) → Bob (thêm mới)
// → React cập nhật cả 3 phần tử → chậm và có thể gây bug state
```

### Câu 2: Khi nào dùng index làm key là an toàn?
**Đáp án:**
Dùng index làm key **chỉ an toàn** khi thỏa mãn cả 3 điều kiện: danh sách tĩnh, không thêm/xóa/sắp xếp, và các phần tử không có state nội bộ.

```jsx
// ✅ An toàn dùng index — danh sách tĩnh, chỉ hiển thị
const navItems = ['Home', 'About', 'Contact'];
{navItems.map((item, index) => (
  <li key={index}>{item}</li>
))}

// ❌ KHÔNG an toàn — danh sách thay đổi + có state (input)
function TodoList() {
  const [todos, setTodos] = useState(['Task A', 'Task B', 'Task C']);

  const removeFirst = () => setTodos(todos.slice(1));

  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index}>
          <input defaultValue={todo} />
        </li>
      ))}
      <button onClick={removeFirst}>Remove first</button>
    </ul>
  );
  // Sau khi xóa "Task A":
  // key=0 giữ input value cũ ("Task A") nhưng text thành "Task B"
  // → UI không đồng bộ!
}

// ✅ Dùng unique ID
{todos.map((todo) => (
  <li key={todo.id}>
    <input defaultValue={todo.text} />
  </li>
))}
```

### Câu 3: Dùng key để reset component hoạt động thế nào?
**Đáp án:**
Khi thay đổi key của một component, React coi nó là component **hoàn toàn mới**: unmount component cũ (xóa state) rồi mount component mới (state về mặc định). Đây là kỹ thuật reset component đơn giản nhất.

```jsx
function App() {
  const [selectedUserId, setSelectedUserId] = useState(1);

  return (
    <div>
      <UserList onSelect={setSelectedUserId} />
      {/* Khi selectedUserId thay đổi → key thay đổi
          → ProfileForm unmount hoàn toàn
          → Mount lại ProfileForm mới với state trống */}
      <ProfileForm key={selectedUserId} userId={selectedUserId} />
    </div>
  );
}

function ProfileForm({ userId }) {
  // State này sẽ reset khi key (userId) thay đổi
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <form>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
    </form>
  );
}

// Không cần useEffect để reset state
// Không cần kiểm tra prevProps
// Key thay đổi → tất cả state tự động reset
```

### Câu 4: Làm thế nào tạo key khi dữ liệu không có ID?
**Đáp án:**
Khi dữ liệu không có sẵn ID, tạo ID tại thời điểm **tạo dữ liệu** (không phải lúc render). Tuyệt đối không dùng `Math.random()` hay `Date.now()` trong render vì key sẽ thay đổi mỗi lần render.

```jsx
// ❌ KHÔNG tạo key trong render — key mới mỗi lần render
{items.map((item) => (
  <Item key={Math.random()} data={item} />
  // Mỗi render: key mới → React unmount/remount tất cả
  // → Mất state, animation, focus → chậm
))}

// ❌ KHÔNG dùng Date.now() trong render
{items.map((item) => (
  <Item key={Date.now()} data={item} /> // Tất cả có cùng key!
))}

// ✅ Tạo ID khi THÊM item (trước render)
const addItem = (text: string) => {
  setItems((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(), // Tạo UUID một lần, ổn định
      text,
    },
  ]);
};

// ✅ Dùng ID đã tạo làm key
{items.map((item) => (
  <Item key={item.id} data={item} />
))}

// ✅ Nếu dữ liệu có trường unique (email, slug, ...)
{users.map((user) => (
  <UserCard key={user.email} user={user} />
))}
```
