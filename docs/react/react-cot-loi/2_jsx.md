---
sidebar_position: 2
title: "2. JSX"
---

# JSX

## JSX là gì?

JSX (JavaScript XML) là một phần mở rộng cú pháp cho JavaScript, cho phép viết code giống HTML trong JavaScript. JSX **không phải HTML** — nó được biên dịch thành các lệnh gọi `React.createElement()`.

```jsx
// JSX
const element = <h1 className="title">Hello World</h1>;

// Sau khi biên dịch (Babel/SWC)
const element = React.createElement('h1', { className: 'title' }, 'Hello World');

// Kết quả: một plain object
// { type: 'h1', props: { className: 'title', children: 'Hello World' } }
```

## Rules cơ bản

### 1. Phải có một root element duy nhất

```jsx
// ❌ Lỗi: Adjacent JSX elements must be wrapped
return (
  <h1>Title</h1>
  <p>Content</p>
);

// ✅ Dùng div wrapper
return (
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
);

// ✅ Dùng Fragment (không tạo DOM node thừa)
return (
  <>
    <h1>Title</h1>
    <p>Content</p>
  </>
);

// ✅ Fragment đầy đủ (khi cần key)
return (
  <React.Fragment key={id}>
    <h1>Title</h1>
    <p>Content</p>
  </React.Fragment>
);
```

### 2. Tất cả tag phải đóng

```jsx
// ❌ Lỗi
<img src="photo.jpg">
<input type="text">
<br>

// ✅ Self-closing tags
<img src="photo.jpg" />
<input type="text" />
<br />
```

### 3. camelCase cho attributes

JSX dùng camelCase thay vì HTML attributes:

| HTML | JSX |
|------|-----|
| `class` | `className` |
| `for` | `htmlFor` |
| `tabindex` | `tabIndex` |
| `onclick` | `onClick` |
| `onchange` | `onChange` |
| `readonly` | `readOnly` |
| `maxlength` | `maxLength` |

```jsx
<label htmlFor="name" className="label">
  <input id="name" tabIndex={1} readOnly />
</label>
```

## Expressions trong JSX

Dùng `{}` để nhúng bất kỳ JavaScript expression nào vào JSX:

```jsx
const name = 'React';
const items = ['A', 'B', 'C'];

return (
  <div>
    {/* Biến */}
    <h1>{name}</h1>

    {/* Phép tính */}
    <p>{2 + 2}</p>

    {/* Gọi function */}
    <p>{name.toUpperCase()}</p>

    {/* Ternary */}
    <p>{name ? `Hello ${name}` : 'Hello World'}</p>

    {/* Template literal */}
    <p>{`Welcome to ${name}`}</p>

    {/* Array.map */}
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);
```

> **Lưu ý:** `{}` chỉ chấp nhận **expressions** (có giá trị trả về), không chấp nhận **statements** (if/else, for, switch).

## Inline Styles

Style trong JSX là một **object** với camelCase properties:

```jsx
// ❌ Không dùng string như HTML
<div style="color: red; font-size: 16px">

// ✅ Dùng object
<div style={{ color: 'red', fontSize: '16px' }}>

// ✅ Tách ra biến cho rõ ràng
const headerStyle = {
  color: 'red',
  fontSize: '16px',
  backgroundColor: '#f0f0f0',
  padding: '10px 20px',
};

<div style={headerStyle}>Content</div>
```

## Conditional trong JSX

### Ternary operator

```jsx
<div>
  {isLoggedIn ? <Dashboard /> : <Login />}
</div>
```

### Logical AND (&&)

```jsx
<div>
  {hasNotification && <NotificationBadge />}
</div>
```

> **Cẩn thận với falsy values:** `{0 && <Component />}` sẽ render số `0` trên màn hình. Dùng `{count > 0 && <Component />}` thay thế.

### IIFE hoặc tách function

```jsx
// Khi cần logic phức tạp, tách ra function
function renderStatus(status) {
  switch (status) {
    case 'loading': return <Spinner />;
    case 'error': return <ErrorMessage />;
    case 'success': return <Content />;
    default: return null;
  }
}

return <div>{renderStatus(status)}</div>;
```

## Render danh sách

```jsx
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

return (
  <ul>
    {users.map((user) => (
      <li key={user.id}>{user.name}</li>
    ))}
  </ul>
);
```

**Key** phải là giá trị **unique** và **stable** trong danh sách. Không dùng index làm key nếu danh sách có thể thay đổi thứ tự.

## Spread attributes

```jsx
const buttonProps = {
  type: 'submit',
  className: 'btn-primary',
  disabled: false,
};

// Spread tất cả props
<button {...buttonProps}>Submit</button>

// Tương đương:
<button type="submit" className="btn-primary" disabled={false}>Submit</button>
```

## Kiểu dữ liệu mà JSX KHÔNG render

Các giá trị sau **không hiển thị** trên UI:

```jsx
<div>
  {true}      {/* Không render */}
  {false}     {/* Không render */}
  {null}      {/* Không render */}
  {undefined} {/* Không render */}
</div>
```

Đây là lý do `&&` hoạt động: `{true && <Component />}` → render `<Component />`, còn `{false && <Component />}` → render `false` (không hiển thị).

---

## Câu hỏi phỏng vấn

### Câu 1: JSX khác HTML thế nào?
**Đáp án:**
JSX trông giống HTML nhưng thực chất là cú pháp mở rộng của JavaScript. Các điểm khác biệt chính:

```jsx
// 1. Attributes dùng camelCase, không phải lowercase
<div className="box" />      // JSX: className
<div class="box"></div>       // HTML: class

<label htmlFor="name" />      // JSX: htmlFor
<label for="name"></label>    // HTML: for

// 2. Tất cả tag phải đóng (self-closing)
<img src="photo.jpg" />       // JSX: bắt buộc />
<img src="photo.jpg">         // HTML: không cần đóng

// 3. Chỉ có MỘT root element
// JSX yêu cầu:
return (
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
);

// 4. Nhúng JavaScript expression bằng {}
<p>{2 + 2}</p>               // JSX: dùng {}
// HTML không có cú pháp tương đương

// 5. Style là object, không phải string
<div style={{ color: 'red', fontSize: '16px' }} />   // JSX
<div style="color: red; font-size: 16px"></div>       // HTML

// 6. JSX biên dịch thành React.createElement()
const el = <h1>Hello</h1>;
// => React.createElement('h1', null, 'Hello')
```

### Câu 2: Tại sao cần key trong danh sách JSX?
**Đáp án:**
Key giúp React xác định phần tử nào đã thay đổi, được thêm, hoặc bị xóa khi render danh sách. Không có key (hoặc key sai) sẽ gây ra lỗi UI và giảm hiệu suất.

```jsx
// ✅ Dùng key unique và stable
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

<ul>
  {users.map((user) => (
    <li key={user.id}>{user.name}</li>
  ))}
</ul>

// ❌ Không dùng index khi danh sách thay đổi thứ tự
// Vì React dùng key để map phần tử cũ vs mới
// Index thay đổi khi thêm/xóa → React cập nhật sai component

// ❌ Không dùng Math.random()
// Key mới mỗi render → React unmount/remount tất cả → chậm
<li key={Math.random()}>Item</li>
```

### Câu 3: Fragment là gì và khi nào dùng?
**Đáp án:**
Fragment (`<>...</>` hoặc `<React.Fragment>`) cho phép nhóm nhiều elements mà **không tạo DOM node thừa**. Dùng khi component cần trả về nhiều elements cùng cấp.

```jsx
// ❌ Div wrapper tạo DOM node thừa, có thể phá vỡ layout
function Columns() {
  return (
    <div>
      <td>Col 1</td>
      <td>Col 2</td>
    </div>
    // Kết quả: <div> trong <tr> → HTML không hợp lệ
  );
}

// ✅ Fragment — không tạo DOM node
function Columns() {
  return (
    <>
      <td>Col 1</td>
      <td>Col 2</td>
    </>
  );
}

// ✅ Fragment đầy đủ — khi cần truyền key (trong danh sách)
{users.map((user) => (
  <React.Fragment key={user.id}>
    <dt>{user.name}</dt>
    <dd>{user.email}</dd>
  </React.Fragment>
))}
// Lưu ý: <> </> (shorthand) KHÔNG hỗ trợ key
```

### Câu 4: Falsy values render thế nào trong JSX?
**Đáp án:**
Các giá trị `false`, `null`, `undefined`, và `true` **không hiển thị** trên UI. Tuy nhiên, số `0` và chuỗi rỗng `""` **sẽ hiển thị**.

```jsx
<div>
  {false}     {/* Không render */}
  {null}      {/* Không render */}
  {undefined} {/* Không render */}
  {true}      {/* Không render */}
  {0}         {/* RENDER số 0 trên màn hình! */}
  {""}        {/* Render chuỗi rỗng (không thấy gì) */}
</div>

// ❌ Bug phổ biến với && operator
const count = 0;
{count && <Badge count={count} />}
// count = 0 (falsy) → biểu thức trả về 0 → render "0" trên UI!

// ✅ Cách sửa: dùng so sánh tường minh
{count > 0 && <Badge count={count} />}
// count > 0 = false → không render gì

// ✅ Hoặc dùng ternary
{count ? <Badge count={count} /> : null}
```
