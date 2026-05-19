---
sidebar_position: 3
title: "3. Conditional Rendering"
---

# Conditional Rendering

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [Ternary operator](#ternary-operator)
- [Logical && operator](#logical--operator)
- [Early return](#early-return)
- [Switch / lookup object](#switch--lookup-object)

---

## Tổng quan

React không có template syntax đặc biệt — dùng **JavaScript** để
conditional render.

```jsx
function Greeting({ user }) {
  if (!user) {
    return <p>Vui lòng đăng nhập</p>;
  }
  return <p>Xin chào {user.name}</p>;
}
```

---

## Ternary operator

Trong JSX, dùng ternary cho conditional inline:

```jsx
function Status({ isOnline }) {
  return (
    <div>
      {isOnline ? <span className="green">●</span> : <span className="gray">●</span>}
    </div>
  );
}

// Hoặc render nội dung khác
return (
  <div>
    {isLoading ? <Spinner /> : <Content data={data} />}
  </div>
);
```

Lồng — đọc khó, hạn chế:

```jsx
{status === "loading" ? <Loading />
  : status === "error" ? <Error />
  : status === "success" ? <Content />
  : null}
```

→ Khi có 3+ nhánh, dùng `switch` hoặc lookup object.

---

## Logical && operator

Render khi điều kiện đúng (không có nhánh else):

```jsx
function Notification({ unread }) {
  return (
    <div>
      Inbox
      {unread > 0 && <span className="badge">{unread}</span>}
    </div>
  );
}
```

:::warning[Cần lưu ý]

**`&&` với số 0 sẽ render 0**:

```jsx
const items = [];

return (
  <div>
    {items.length && <List items={items} />}
  </div>
);
// Khi items.length = 0 → render số 0 trên màn hình!
```

Lý do: `0` là falsy nhưng vẫn là **giá trị hợp lệ** để render. React
render `0` thành text.

Fix:

```jsx
// 1. Convert sang boolean
{items.length > 0 && <List />}
{Boolean(items.length) && <List />}
{!!items.length && <List />}

// 2. Dùng ternary với null
{items.length > 0 ? <List /> : null}
```

Tương tự với `""`, `NaN`. Đáng ngạc nhiên: `null`, `undefined`, `false`,
`true` không render.

:::

---

## Early return

Khi component có **nhiều case "không render gì"**, dùng early return cho rõ:

```jsx
function UserProfile({ user, isLoading, error }) {
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return null;

  // Happy path — đỡ lồng if
  return (
    <div>
      <Avatar src={user.avatar} />
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
    </div>
  );
}
```

So với lồng ternary — dễ đọc hơn nhiều:

```jsx
// Tệ — pyramid
return isLoading
  ? <Spinner />
  : error
    ? <ErrorMessage error={error} />
    : !user
      ? null
      : <div>...</div>;
```

:::tip[Mẹo]

**Pattern "guard clauses"** áp dụng cho React component:

1. Loại bỏ case không hợp lệ **trước**.
2. Trả về sớm — không lồng.
3. **Happy path** ở cuối, không indent sâu.

Quy tắc: nếu indent > 3 cấp, refactor sang early return.

:::

---

## Switch / lookup object

Khi có nhiều branch, dùng **lookup object** thay switch:

```jsx
function StatusBadge({ status }) {
  const styles = {
    pending: "bg-yellow-500",
    active: "bg-green-500",
    done: "bg-blue-500",
    failed: "bg-red-500",
  };

  return (
    <span className={`badge ${styles[status]}`}>
      {status}
    </span>
  );
}
```

Lookup component:

```jsx
function Page({ route }) {
  const pages = {
    home: <HomePage />,
    about: <AboutPage />,
    contact: <ContactPage />,
  };

  return pages[route] ?? <NotFound />;
}
```

:::info[Phân tích]

**Lookup object vs switch — khi nào dùng cái nào?**

| Tình huống | Dùng |
|-----------|------|
| Map giá trị → giá trị tĩnh | Lookup object |
| Map giá trị → component | Lookup object |
| Logic phức tạp, fall-through | Switch |
| Cần exhaustive type check | Switch (với TypeScript) |

Với TypeScript, switch tận dụng **discriminated union** + exhaustive
check:

```tsx
type Status = "pending" | "active" | "done" | "failed";

function badge(s: Status): string {
  switch (s) {
    case "pending": return "yellow";
    case "active":  return "green";
    case "done":    return "blue";
    case "failed":  return "red";
    default:
      const _exhaustive: never = s; // ép check hết case
      throw new Error("Unhandled");
  }
}
```

Thêm `Status` mới → TS báo lỗi tại `_exhaustive` → buộc xử lý. Lookup
object không có cơ chế này.

:::

:::tip[Mẹo]

**Anti-pattern — set state trong render** để conditional:

```jsx
// SAI — infinite loop
function Component({ data }) {
  if (data.length === 0) {
    setHasData(false); // → re-render → check lại → re-render...
  }
  return <div />;
}

// ĐÚNG — dùng useEffect hoặc tính trong render
function Component({ data }) {
  const hasData = data.length > 0; // derive, không cần state
  return <div>{hasData ? <List /> : <Empty />}</div>;
}
```

Quy tắc vàng: **render phải là pure function của props + state**. Không
side effect trong render.

:::
