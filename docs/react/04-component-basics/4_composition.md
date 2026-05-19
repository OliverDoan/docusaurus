---
sidebar_position: 4
title: "4. Composition"
---

# Composition

---

## Mục lục

- [Composition là gì?](#composition-là-gì)
- [children prop](#children-prop)
- [Slot pattern](#slot-pattern)
- [Compound Components](#compound-components)
- [Composition vs Inheritance](#composition-vs-inheritance)

---

## Composition là gì?

**Composition** = ghép nhiều component lại thành component lớn hơn,
không phải kế thừa.

React **không khuyến khích inheritance** (vd `class A extends B` để
reuse UI). Composition là cách chính thức để reuse.

```jsx
// Component nhỏ
function Avatar({ src, alt }) {
  return <img src={src} alt={alt} className="rounded-full" />;
}

function UserName({ name }) {
  return <h2 className="font-bold">{name}</h2>;
}

// Ghép thành component lớn
function UserCard({ user }) {
  return (
    <div className="card">
      <Avatar src={user.avatar} alt={user.name} />
      <UserName name={user.name} />
    </div>
  );
}
```

---

## children prop

Mọi component **mặc định có prop `children`** — chứa JSX giữa thẻ:

```jsx
function Card({ children }) {
  return (
    <div className="card shadow-md p-4">
      {children}
    </div>
  );
}

// Dùng
<Card>
  <h1>Title</h1>
  <p>Body content</p>
</Card>
```

Cho phép parent **quyết định nội dung** trong Card mà không cần định
nghĩa trước.

---

## Slot pattern

Khi cần **nhiều "vùng" tùy biến** trong component, dùng prop dạng JSX:

```jsx
function Layout({ header, sidebar, main, footer }) {
  return (
    <div className="layout">
      <header>{header}</header>
      <div className="content">
        <aside>{sidebar}</aside>
        <main>{main}</main>
      </div>
      <footer>{footer}</footer>
    </div>
  );
}

<Layout
  header={<NavBar />}
  sidebar={<Sidebar />}
  main={<HomePage />}
  footer={<Footer />}
/>
```

Pattern "slot" này phổ biến trong Vue, Astro — React làm qua prop nhận
ReactNode.

---

## Compound Components

Pattern **phối hợp nhiều component liên quan**, chia sẻ state ngầm:

```jsx
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>
    <Button>Save</Button>
  </Card.Footer>
</Card>
```

Implementation:

```jsx
function Card({ children }) {
  return <div className="card">{children}</div>;
}

Card.Header = function CardHeader({ children }) {
  return <header className="card-header">{children}</header>;
};

Card.Body = function CardBody({ children }) {
  return <div className="card-body">{children}</div>;
};

Card.Footer = function CardFooter({ children }) {
  return <footer className="card-footer">{children}</footer>;
};
```

Hoặc với named export:

```jsx
export function Card({ children }) { /* ... */ }
export function CardHeader({ children }) { /* ... */ }
export function CardBody({ children }) { /* ... */ }
export function CardFooter({ children }) { /* ... */ }

// Dùng
import { Card, CardHeader, CardBody, CardFooter } from "./Card";
```

:::info[Phân tích]

**Compound Components share state qua Context API:**

```jsx
import { createContext, useContext, useState } from "react";

const AccordionContext = createContext();

function Accordion({ children }) {
  const [openItem, setOpenItem] = useState(null);
  return (
    <AccordionContext.Provider value={{ openItem, setOpenItem }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ id, title, children }) {
  const { openItem, setOpenItem } = useContext(AccordionContext);
  const isOpen = openItem === id;

  return (
    <div className="accordion-item">
      <button onClick={() => setOpenItem(isOpen ? null : id)}>
        {title}
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}

Accordion.Item = AccordionItem;
```

Dùng:

```jsx
<Accordion>
  <Accordion.Item id="1" title="Q1">A1</Accordion.Item>
  <Accordion.Item id="2" title="Q2">A2</Accordion.Item>
</Accordion>
```

Caller không phải biết về state — chỉ compose. Đây là pattern của **Radix
UI**, **Headless UI**, **Mantine** — cực kỳ powerful cho UI library.

:::

---

## Composition vs Inheritance

**React không có inheritance** trong hệ thống component (dù class JS
có `extends`).

```jsx
// Sai trong React — đừng làm
class FancyButton extends Button {}
```

Thay vào đó:

```jsx
// Composition — wrap component
function FancyButton(props) {
  return <Button {...props} className="fancy" />;
}
```

Lý do composition tốt hơn:

- **Flexible** — parent control 100% layout.
- **Loose coupling** — không phụ thuộc internal của base.
- **Easier to refactor** — đổi base không ảnh hưởng wrapper.

:::tip[Mẹo]

**Pattern phổ biến tận dụng composition**:

**1. Render props** — truyền function làm prop:

```jsx
<DataLoader render={data => <List data={data} />} />
```

**2. Higher-Order Component (HOC)** — function nhận component, trả về
component mới (xem phần Rendering):

```jsx
const EnhancedComponent = withAuth(MyComponent);
```

**3. Custom Hook** — share logic không phải UI:

```jsx
function useUser() {
  // logic chung
}

// Dùng trong nhiều component
function ComponentA() {
  const user = useUser();
}
```

Trong React hiện đại (2026), **custom hooks** là cách reuse logic ưa
chuộng nhất — gọn, linh hoạt, type-safe.

:::

:::warning[Cần lưu ý]

**`React.cloneElement` để inject prop vào children** — pattern cũ, nay
ít dùng:

```jsx
function Form({ children }) {
  return (
    <form>
      {React.Children.map(children, child =>
        React.cloneElement(child, { className: "field" })
      )}
    </form>
  );
}
```

Vấn đề:

- **Không type-safe** — TS không biết prop được inject.
- **Khó reason about** — debug đau đầu.
- **Buộc child là element**, không cho phép text/fragment.

→ Thay bằng **Context API**:

```jsx
const FormContext = createContext();

function Form({ children }) {
  return (
    <FormContext.Provider value={{ className: "field" }}>
      <form>{children}</form>
    </FormContext.Provider>
  );
}

function Field() {
  const { className } = useContext(FormContext);
  return <input className={className} />;
}
```

Type-safe, transparent, dễ test.

:::
