---
sidebar_position: 5
title: "Render có điều kiện"
---

# Render có điều kiện (Conditional Rendering)

## if/else (Early return)

Dùng khi muốn render hoàn toàn khác nhau:

```tsx
function Dashboard({ user }: { user: User | null }) {
  if (!user) {
    return <LoginPage />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard user={user} />;
  }

  return <UserDashboard user={user} />;
}
```

## Ternary operator

Dùng khi chọn giữa 2 phần tử trong JSX:

```tsx
function StatusBadge({ isOnline }: { isOnline: boolean }) {
  return (
    <span className={isOnline ? 'badge-green' : 'badge-gray'}>
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
}
```

### Tránh nested ternary

```tsx
// ❌ Khó đọc
{status === 'loading' ? <Spinner /> : status === 'error' ? <Error /> : <Content />}

// ✅ Tách ra function hoặc dùng early return
function renderContent(status: string) {
  if (status === 'loading') return <Spinner />;
  if (status === 'error') return <Error />;
  return <Content />;
}

return <div>{renderContent(status)}</div>;
```

## Logical AND (&&)

Dùng khi chỉ render hoặc không render:

```tsx
function Notification({ count }: { count: number }) {
  return (
    <div>
      {count > 0 && <Badge count={count} />}
    </div>
  );
}
```

### Cẩn thận với falsy values

```tsx
// ❌ Bug: Render số 0 trên màn hình
{count && <Badge count={count} />}
// Khi count = 0 → render "0" (vì 0 là falsy nhưng JSX render số)

// ✅ Dùng so sánh tường minh
{count > 0 && <Badge count={count} />}

// ❌ Bug: Render chuỗi rỗng
{text.length && <p>{text}</p>}
// Khi text = '' → text.length = 0 → render "0"

// ✅ Dùng Boolean
{text.length > 0 && <p>{text}</p>}
// hoặc
{Boolean(text.length) && <p>{text}</p>}
```

## Nullish coalescing (??)

```tsx
// Hiển thị giá trị mặc định khi null/undefined
function UserName({ name }: { name?: string | null }) {
  return <span>{name ?? 'Anonymous'}</span>;
}
```

## Object mapping (thay switch)

```tsx
const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'yellow', icon: '⏳' },
  approved: { label: 'Approved', color: 'green', icon: '✅' },
  rejected: { label: 'Rejected', color: 'red', icon: '❌' },
} as const;

type Status = keyof typeof STATUS_CONFIG;

function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_CONFIG[status];
  return (
    <span style={{ color: config.color }}>
      {config.icon} {config.label}
    </span>
  );
}
```

## Render danh sách có điều kiện

```tsx
function ItemList({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <EmptyState message="No items found" />;
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.name}
          {item.isNew && <span className="new-badge">NEW</span>}
        </li>
      ))}
    </ul>
  );
}
```

## Pattern: Component hiển thị theo điều kiện

```tsx
// Component wrapper để show/hide
function Show({
  when,
  fallback = null,
  children,
}: {
  when: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  return when ? <>{children}</> : <>{fallback}</>;
}

// Sử dụng
<Show when={isLoggedIn} fallback={<LoginButton />}>
  <UserMenu />
</Show>
```

---

## Câu hỏi phỏng vấn

### Câu 1: Có những cách render có điều kiện nào trong React?
**Đáp án:**
React hỗ trợ nhiều cách render có điều kiện, mỗi cách phù hợp với tình huống khác nhau:

```jsx
function ConditionalDemo({ status, count, user }) {
  // 1. if/else (early return) — khi render hoàn toàn khác nhau
  if (!user) return <LoginPage />;

  // 2. Ternary operator — chọn giữa 2 phần tử trong JSX
  const badge = user.isAdmin ? <AdminBadge /> : <UserBadge />;

  // 3. Logical AND (&&) — render hoặc không render
  const notification = count > 0 && <Badge count={count} />;

  // 4. Nullish coalescing (??) — giá trị mặc định cho null/undefined
  const displayName = user.name ?? 'Anonymous';

  // 5. Object mapping — thay thế switch/case
  const STATUS_MAP = {
    loading: <Spinner />,
    error: <ErrorMessage />,
    success: <Content />,
  };
  const content = STATUS_MAP[status] ?? null;

  // 6. Tách ra helper function — khi logic phức tạp
  function renderRole(role) {
    if (role === 'admin') return <AdminPanel />;
    if (role === 'editor') return <EditorPanel />;
    return <ViewerPanel />;
  }

  return (
    <div>
      {badge}
      {notification}
      <p>{displayName}</p>
      {content}
      {renderRole(user.role)}
    </div>
  );
}
```

### Câu 2: Cần cẩn thận gì khi dùng toán tử && trong JSX?
**Đáp án:**
Toán tử `&&` trong JavaScript trả về giá trị **falsy đầu tiên** (không phải `false`). Trong JSX, số `0` là falsy nhưng **vẫn được render** trên màn hình, gây bug.

```jsx
// ❌ Bug: Khi count = 0 → render "0" trên UI
function Notification({ count }) {
  return <div>{count && <Badge count={count} />}</div>;
  // count = 0 → 0 && <Badge /> → trả về 0
  // JSX render số 0 → hiển thị "0" trên màn hình!
}

// ❌ Tương tự với string.length
function Message({ text }) {
  return <div>{text.length && <p>{text}</p>}</div>;
  // text = "" → text.length = 0 → render "0"
}

// ✅ Cách sửa 1: So sánh tường minh (KHUYẾN KHÍCH)
{count > 0 && <Badge count={count} />}

// ✅ Cách sửa 2: Chuyển sang Boolean
{Boolean(count) && <Badge count={count} />}
{!!count && <Badge count={count} />}

// ✅ Cách sửa 3: Dùng ternary
{count ? <Badge count={count} /> : null}
```

Quy tắc: Luôn đảm bảo vế trái của `&&` trả về `true/false`, không phải `0` hay `""`.

### Câu 3: Object mapping pattern dùng thay switch như thế nào?
**Đáp án:**
Object mapping pattern dùng object literal để ánh xạ giá trị đến JSX tương ứng, thay thế cho switch/case. Pattern này gọn hơn, dễ mở rộng, và dễ tách ra khỏi component.

```jsx
// ❌ Switch/case — verbose, khó tách ra
function StatusBadge({ status }) {
  switch (status) {
    case 'pending': return <span style={{ color: 'yellow' }}>Pending</span>;
    case 'approved': return <span style={{ color: 'green' }}>Approved</span>;
    case 'rejected': return <span style={{ color: 'red' }}>Rejected</span>;
    default: return null;
  }
}

// ✅ Object mapping — gọn, dễ mở rộng, dễ tách file
const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: 'yellow' },
  approved: { label: 'Approved', color: 'green' },
  rejected: { label: 'Rejected', color: 'red' },
} as const;

type Status = keyof typeof STATUS_CONFIG;

function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  return <span style={{ color: config.color }}>{config.label}</span>;
}

// Dễ mở rộng: chỉ cần thêm entry vào object
// Dễ test: có thể test STATUS_CONFIG riêng biệt
// Dễ tách: export STATUS_CONFIG ra file constants
```
