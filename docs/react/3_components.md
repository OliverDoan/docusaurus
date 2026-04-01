---
sidebar_position: 3
title: "Components"
---

# Components

## Function Component

Cách viết component chính thức và được khuyến khích hiện nay:

```tsx
// Cách 1: Function declaration
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}

// Cách 2: Arrow function
const Greeting = ({ name }: { name: string }) => {
  return <h1>Hello, {name}</h1>;
};

// Sử dụng
<Greeting name="React" />
```

### Quy tắc đặt tên

- Component **bắt buộc** viết hoa chữ cái đầu: `UserCard`, `Header`, `LoginForm`
- React phân biệt HTML tag (`<div>`, `<span>`) và component (`<UserCard>`) dựa vào chữ cái đầu

```jsx
// ❌ React hiểu đây là HTML tag "userCard"
function userCard() { return <div>Card</div>; }

// ✅ React hiểu đây là component
function UserCard() { return <div>Card</div>; }
```

## Class Component (Legacy)

Class component là cách viết cũ, vẫn hoạt động nhưng **không nên dùng cho code mới**:

```tsx
import { Component } from 'react';

interface Props {
  name: string;
}

interface State {
  count: number;
}

class Counter extends Component<Props, State> {
  state: State = { count: 0 };

  increment = () => {
    this.setState((prev) => ({ count: prev.count + 1 }));
  };

  render() {
    return (
      <div>
        <p>{this.props.name}: {this.state.count}</p>
        <button onClick={this.increment}>+</button>
      </div>
    );
  }
}
```

### So sánh Function vs Class

| | Function Component | Class Component |
|---|---|---|
| Cú pháp | Đơn giản, ít boilerplate | Verbose, cần `this` |
| State | `useState` | `this.state` / `this.setState` |
| Side effects | `useEffect` | Lifecycle methods |
| Logic reuse | Custom hooks | HOC, render props |
| Performance | Dễ optimize với hooks | Khó optimize hơn |
| Status | **Tiêu chuẩn hiện tại** | Legacy |

## Cấu trúc một component tốt

```tsx
// 1. Imports
import { useState, useEffect } from 'react';
import { fetchUser } from '../api/users';
import { UserAvatar } from './UserAvatar';

// 2. Types
interface UserProfileProps {
  userId: string;
  showAvatar?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
}

// 3. Component
export function UserProfile({ userId, showAvatar = true }: UserProfileProps) {
  // 3a. Hooks
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 3b. Effects
  useEffect(() => {
    fetchUser(userId).then((data) => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);

  // 3c. Early returns
  if (loading) return <Spinner />;
  if (!user) return <p>User not found</p>;

  // 3d. Render
  return (
    <div>
      {showAvatar && <UserAvatar src={user.avatar} />}
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

## Component Composition

Ưu tiên **composition** thay vì inheritance:

```tsx
// ❌ Tránh: Component quá nhiều props để xử lý mọi trường hợp
<Card
  variant="product"
  showImage
  showPrice
  showRating
  showAddToCart
  imagePosition="left"
/>

// ✅ Composition: Linh hoạt, dễ mở rộng
<Card>
  <Card.Image src={product.image} position="left" />
  <Card.Body>
    <Card.Title>{product.name}</Card.Title>
    <Card.Price value={product.price} />
    <Card.Rating value={product.rating} />
  </Card.Body>
  <Card.Footer>
    <AddToCartButton productId={product.id} />
  </Card.Footer>
</Card>
```

### children prop

```tsx
// Layout component dùng children
function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

// Sử dụng
<PageLayout>
  <h1>Home Page</h1>
  <p>Welcome!</p>
</PageLayout>
```

### Render props pattern

```tsx
// Truyền content qua named props
function Dialog({
  header,
  body,
  footer,
}: {
  header: React.ReactNode;
  body: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="dialog">
      <div className="dialog-header">{header}</div>
      <div className="dialog-body">{body}</div>
      {footer && <div className="dialog-footer">{footer}</div>}
    </div>
  );
}

<Dialog
  header={<h2>Confirm</h2>}
  body={<p>Are you sure?</p>}
  footer={<button>OK</button>}
/>
```

## Tổ chức components

### Theo feature (khuyến khích)

```
src/
├── features/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── useAuth.ts
│   ├── products/
│   │   ├── ProductList.tsx
│   │   ├── ProductCard.tsx
│   │   └── useProducts.ts
│   └── cart/
│       ├── Cart.tsx
│       ├── CartItem.tsx
│       └── useCart.ts
├── components/          # Shared/reusable components
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── Spinner.tsx
└── App.tsx
```

### Nguyên tắc

- **Single Responsibility**: Mỗi component làm một việc
- **Small components**: 50-150 dòng là lý tưởng
- **Tách logic ra custom hooks**: Component chỉ lo render
- **Flat structure**: Tránh nested quá 3 cấp trong thư mục
