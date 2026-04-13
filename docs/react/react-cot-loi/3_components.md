---
sidebar_position: 3
title: "3. Components"
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

---

## Câu hỏi phỏng vấn

### Câu 1: Function component và Class component khác gì nhau?
**Đáp án:**
Function component là cách viết được khuyến khích hiện nay, sử dụng hooks để quản lý state và side effects. Class component là cách viết cũ (legacy), dùng lifecycle methods.

```jsx
// Function Component (hiện đại)
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// Class Component (legacy)
class Counter extends React.Component {
  state = { count: 0 };

  componentDidUpdate() {
    document.title = `Count: ${this.state.count}`;
  }

  render() {
    return (
      <button onClick={() => this.setState({ count: this.state.count + 1 })}>
        {this.state.count}
      </button>
    );
  }
}
```

Khác biệt chính:
- **Cú pháp**: Function đơn giản hơn, class cần `this`, `render()`, `constructor()`
- **State**: Function dùng `useState`, class dùng `this.state` / `this.setState`
- **Side effects**: Function dùng `useEffect`, class dùng lifecycle methods (`componentDidMount`, `componentDidUpdate`, `componentWillUnmount`)
- **Logic reuse**: Function dùng custom hooks (dễ), class dùng HOC/render props (phức tạp)

### Câu 2: Composition và inheritance khác nhau thế nào trong React?
**Đáp án:**
React ưu tiên **composition** (kết hợp) thay vì **inheritance** (kế thừa). Composition linh hoạt hơn vì cho phép truyền JSX/components qua props thay vì tạo cây kế thừa cứng nhắc.

```jsx
// ❌ Inheritance approach (KHÔNG nên dùng trong React)
class SpecialButton extends Button {
  render() {
    return <button className="special">{this.props.children}</button>;
  }
}

// ✅ Composition approach (KHUYẾN KHÍCH)
// Component "chứa" component khác qua children hoặc named props
function Card({ header, children, footer }) {
  return (
    <div className="card">
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

// Sử dụng — linh hoạt, dễ mở rộng
<Card
  header={<h2>User Profile</h2>}
  footer={<button>Save</button>}
>
  <p>Name: Alice</p>
  <p>Email: alice@example.com</p>
</Card>
```

Lý do ưu tiên composition: linh hoạt hơn, dễ test, dễ thay đổi, tránh tight coupling giữa các components.

### Câu 3: children prop là gì?
**Đáp án:**
`children` là một prop đặc biệt trong React, chứa nội dung nằm giữa opening tag và closing tag của component. Nó cho phép component "bọc" nội dung bất kỳ, tạo layout components và wrapper patterns.

```jsx
// Khai báo component nhận children
function Modal({ title, children }: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// Sử dụng — nội dung giữa tags trở thành children
<Modal title="Confirm Delete">
  <p>Are you sure you want to delete this item?</p>
  <button>Yes</button>
  <button>Cancel</button>
</Modal>

// children có thể là bất kỳ React.ReactNode:
// - String, number
// - JSX elements
// - Arrays
// - null, undefined (không render gì)
```

### Câu 4: Quy tắc đặt tên component trong React là gì?
**Đáp án:**
Component **bắt buộc** phải viết hoa chữ cái đầu (PascalCase). React dựa vào chữ cái đầu để phân biệt giữa HTML tag và custom component.

```jsx
// ❌ Viết thường → React hiểu là HTML tag
function userCard() {
  return <div>Card</div>;
}
// <userCard /> → React tìm HTML tag "usercard" → không hoạt động đúng

// ✅ Viết hoa chữ đầu → React hiểu là component
function UserCard() {
  return <div>Card</div>;
}
// <UserCard /> → React gọi function UserCard()

// Quy tắc đặt tên:
// PascalCase: UserCard, LoginForm, ProductList
// Mô tả rõ chức năng: SearchBar (không phải Bar)
// Prefix theo loại: useAuth (hook), withAuth (HOC)

// Lưu ý với component gán vào biến:
const components = {
  header: HeaderComponent,
  footer: FooterComponent,
};

// ❌ Không thể dùng trực tiếp
// <components.header /> → lỗi vì chữ thường

// ✅ Gán vào biến PascalCase trước
const SelectedComponent = components.header;
<SelectedComponent />
```
