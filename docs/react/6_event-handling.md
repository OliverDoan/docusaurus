---
sidebar_position: 6
title: "Xử lý sự kiện"
---

# Xử lý sự kiện (Event Handling)

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
