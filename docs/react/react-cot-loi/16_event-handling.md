---
sidebar_position: 16
title: "16. Xử lý sự kiện"
---

# Xử lý sự kiện (Event Handling)


---

## Mục lục

- [Cú pháp cơ bản](#cú-pháp-cơ-bản)
- [Synthetic Events](#synthetic-events)
- [Event Handler Patterns](#event-handler-patterns)
- [Event Propagation](#event-propagation)
- [Event Delegation](#event-delegation)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Cú pháp cơ bản

```tsx
// HTML thường
<button onclick="handleClick()">Click</button>

// React — camelCase, truyền function reference (không gọi function)
<button onClick={handleClick}>Click</button>
```

### Function reference vs Function call

```tsx
// ✅ Truyền function reference — React gọi khi click
<button onClick={handleClick}>Click</button>

// ❌ Gọi function ngay khi render — chạy liên tục!
<button onClick={handleClick()}>Click</button>

// ✅ Cần truyền argument → dùng arrow function
<button onClick={() => handleDelete(id)}>Delete</button>
```

## Synthetic Events

React bọc native DOM events trong **SyntheticEvent** — cung cấp API nhất quán trên mọi trình duyệt:

```tsx
function Form() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Ngăn submit mặc định
    // Xử lý form
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log(e.clientX, e.clientY);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
      <button onClick={handleClick}>Submit</button>
    </form>
  );
}
```

### Các event type thường dùng

| Event | Type | Element |
|-------|------|---------|
| `onClick` | `React.MouseEvent` | button, div, ... |
| `onChange` | `React.ChangeEvent` | input, select, textarea |
| `onSubmit` | `React.FormEvent` | form |
| `onKeyDown` | `React.KeyboardEvent` | input, div |
| `onFocus` / `onBlur` | `React.FocusEvent` | input, button |
| `onMouseEnter` / `onMouseLeave` | `React.MouseEvent` | bất kỳ |
| `onScroll` | `React.UIEvent` | div, window |

## Event Handler Patterns

### Inline handler (logic đơn giản)

```tsx
<button onClick={() => setCount((c) => c + 1)}>+1</button>
```

### Named handler (logic phức tạp hơn)

```tsx
function TodoItem({ todo, onDelete }: Props) {
  const handleDelete = () => {
    if (window.confirm('Delete this todo?')) {
      onDelete(todo.id);
    }
  };

  return (
    <li>
      {todo.text}
      <button onClick={handleDelete}>Delete</button>
    </li>
  );
}
```

### Handler với nhiều elements

```tsx
function Tabs() {
  const [activeTab, setActiveTab] = useState('home');

  // Một handler cho nhiều tab — truyền argument qua closure
  const handleTabClick = (tab: string) => () => {
    setActiveTab(tab);
  };

  return (
    <nav>
      <button onClick={handleTabClick('home')}>Home</button>
      <button onClick={handleTabClick('about')}>About</button>
      <button onClick={handleTabClick('contact')}>Contact</button>
    </nav>
  );
}
```

## Event Propagation

### Bubbling (mặc định)

Event bubbles lên từ con → cha:

```tsx
function Parent() {
  return (
    <div onClick={() => console.log('Parent clicked')}>
      <button onClick={() => console.log('Button clicked')}>
        Click me
      </button>
    </div>
  );
}
// Click button → "Button clicked" → "Parent clicked"
```

### stopPropagation

```tsx
function Child() {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn event bubble lên cha
    console.log('Only child handles this');
  };

  return <button onClick={handleClick}>Click</button>;
}
```

### preventDefault

Ngăn hành vi mặc định của trình duyệt:

```tsx
// Ngăn form submit (reload trang)
<form onSubmit={(e) => { e.preventDefault(); /* ... */ }}>

// Ngăn link navigation
<a href="/page" onClick={(e) => { e.preventDefault(); /* ... */ }}>

// Ngăn right-click menu
<div onContextMenu={(e) => { e.preventDefault(); /* ... */ }}>
```

## Event Delegation

React tự động dùng **event delegation** — attach một event listener duy nhất ở root, không phải ở mỗi element. Bạn không cần lo về performance khi có nhiều event handlers.

```tsx
// React chỉ attach 1 listener ở root
// Dù có 1000 button, vẫn chỉ 1 listener
{items.map((item) => (
  <button key={item.id} onClick={() => handleClick(item.id)}>
    {item.name}
  </button>
))}
```

---

## Câu hỏi phỏng vấn

### Câu 1: SyntheticEvent là gì?
**Đáp án:**
SyntheticEvent là wrapper mà React tạo ra bọc quanh native DOM events. Nó cung cấp **API nhất quán** trên mọi trình duyệt (cross-browser compatibility), với cùng properties và methods dù trình duyệt nào.

```tsx
function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
  // e là SyntheticEvent, không phải native MouseEvent
  console.log(e.type);        // 'click'
  console.log(e.target);      // DOM element được click
  console.log(e.currentTarget); // DOM element có handler
  console.log(e.nativeEvent);  // Native browser event gốc

  e.preventDefault();    // Hoạt động giống native
  e.stopPropagation();   // Hoạt động giống native
}

<button onClick={handleClick}>Click</button>
```

**Đặc điểm quan trọng:**
- SyntheticEvent có cùng interface với native events (`preventDefault`, `stopPropagation`, `target`,...)
- React dùng **event pooling** (React < 17) hoặc tạo event mới mỗi lần (React 17+)
- Truy cập native event gốc qua `e.nativeEvent` khi cần

### Câu 2: Event delegation trong React hoạt động thế nào?
**Đáp án:**
React tự động dùng **event delegation** -- thay vì attach event listener cho mỗi DOM element, React attach **một listener duy nhất ở root** (React 17+: root container, React 16: `document`).

```tsx
// Dù render 1000 buttons, React chỉ attach 1 click listener ở root
function ItemList({ items }: { items: Item[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <button onClick={() => handleClick(item.id)}>
            {item.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

**Cách hoạt động:**
1. React attach 1 listener cho mỗi event type ở root container
2. Khi event xảy ra, React xác định target element
3. React tìm component tương ứng và gọi handler phù hợp
4. SyntheticEvent simulate bubbling theo React component tree

**Lợi ích:** Hiệu quả bộ nhớ (ít listeners), tự động cleanup khi component unmount, hoạt động nhất quán với dynamic elements (thêm/xóa items không cần add/remove listeners).

### Câu 3: stopPropagation và preventDefault khác nhau thế nào?
**Đáp án:**
- `stopPropagation()` — **Ngăn event bubble lên** parent elements. Event không được cha nhận.
- `preventDefault()` — **Ngăn hành vi mặc định** của trình duyệt. Event vẫn bubble bình thường.

```tsx
function Example() {
  return (
    <div onClick={() => console.log('Parent')}>
      {/* stopPropagation: ngăn bubble, parent KHÔNG nhận event */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log('Button 1');
        }}
      >
        Stop Propagation
      </button>
      {/* Click → chỉ log "Button 1", KHÔNG log "Parent" */}

      {/* preventDefault: ngăn hành vi mặc định, event VẪN bubble */}
      <form
        onSubmit={(e) => {
          e.preventDefault(); // Ngăn trang reload
          console.log('Form submitted');
        }}
      >
        <button type="submit">Submit</button>
      </form>
      {/* Submit → "Form submitted" + "Parent" (vẫn bubble) */}

      {/* Dùng cả hai */}
      <a
        href="https://example.com"
        onClick={(e) => {
          e.preventDefault();     // Ngăn navigate đến URL
          e.stopPropagation();    // Ngăn bubble lên parent
          console.log('Link clicked');
        }}
      >
        Custom Link
      </a>
    </div>
  );
}
```

**Tóm tắt:** `preventDefault` liên quan đến **hành vi trình duyệt** (submit form, navigate link, right-click menu). `stopPropagation` liên quan đến **event flow** trong component tree.
