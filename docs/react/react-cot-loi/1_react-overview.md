---
sidebar_position: 1
title: "1. Tổng quan React"
---

# Tổng quan React

## React là gì?

React là một thư viện JavaScript do Facebook (Meta) phát triển, dùng để xây dựng giao diện người dùng (UI). React tập trung vào **view layer** — phần hiển thị của ứng dụng.

Đặc điểm chính:
- **Declarative**: Mô tả UI trông như thế nào, React lo phần cập nhật DOM
- **Component-Based**: Chia UI thành các component nhỏ, tái sử dụng được
- **Learn Once, Write Anywhere**: Dùng cho web (ReactDOM), mobile (React Native), desktop (Electron)

## Virtual DOM

React sử dụng **Virtual DOM** — một bản sao nhẹ của DOM thật trong bộ nhớ.

### Quy trình hoạt động:

1. Khi state thay đổi, React tạo một Virtual DOM mới
2. So sánh (diff) Virtual DOM mới với Virtual DOM cũ
3. Tính toán những thay đổi tối thiểu cần thiết
4. Chỉ cập nhật những phần thay đổi lên DOM thật

```
State thay đổi
     ↓
Tạo Virtual DOM mới
     ↓
Diffing (so sánh cũ vs mới)
     ↓
Reconciliation (tính toán thay đổi tối thiểu)
     ↓
Cập nhật DOM thật (chỉ phần thay đổi)
```

### Tại sao không thao tác DOM trực tiếp?

Thao tác DOM trực tiếp rất **chậm** vì mỗi lần thay đổi DOM, trình duyệt phải:
- Tính lại layout (reflow)
- Vẽ lại giao diện (repaint)

Virtual DOM giúp **gom nhóm** (batch) các thay đổi và chỉ cập nhật DOM thật một lần.

## Cách React render

### Hai giai đoạn render:

**1. Render Phase** (có thể bị gián đoạn)
- Gọi function component (hoặc `render()` của class component)
- Tạo React elements (Virtual DOM)
- Thực hiện diffing

**2. Commit Phase** (không thể gián đoạn)
- Cập nhật DOM thật
- Chạy side effects (`useEffect`, `useLayoutEffect`)

```jsx
function App() {
  // Render phase: React gọi function này
  // để tạo React elements
  return <h1>Hello React</h1>;
  // Commit phase: React cập nhật DOM
}
```

## React Element vs Component

```jsx
// React Element — một object mô tả UI
const element = <h1>Hello</h1>;
// Thực chất là: React.createElement('h1', null, 'Hello')
// Kết quả: { type: 'h1', props: { children: 'Hello' } }

// React Component — một function trả về React elements
function Greeting() {
  return <h1>Hello</h1>;
}
```

**Element** là một plain object mô tả một node trên màn hình. **Component** là function (hoặc class) trả về elements.

## Tạo dự án React

### Cách phổ biến nhất hiện tại:

```bash
# Vite (khuyến khích)
npm create vite@latest my-app -- --template react-ts

# Next.js (full-stack framework)
npx create-next-app@latest my-app

# Remix
npx create-remix@latest
```

> **Lưu ý:** `create-react-app` (CRA) đã không còn được khuyến khích sử dụng từ 2023. Nên dùng Vite hoặc một framework như Next.js.

### Cấu trúc dự án Vite + React cơ bản:

```
my-app/
├── public/          # Static assets
├── src/
│   ├── assets/      # Images, fonts
│   ├── components/  # Shared components
│   ├── App.tsx      # Root component
│   ├── main.tsx     # Entry point
│   └── index.css    # Global styles
├── index.html       # HTML template
├── vite.config.ts   # Vite config
├── tsconfig.json    # TypeScript config
└── package.json
```

## One-way Data Flow

React sử dụng **luồng dữ liệu một chiều** (unidirectional data flow):

```
Parent Component
     ↓ (props)
Child Component
     ↓ (props)
Grandchild Component
```

- Dữ liệu chỉ truyền **từ cha xuống con** qua props
- Con muốn gửi dữ liệu lên cha → gọi callback function được cha truyền xuống qua props
- Giúp dễ debug vì biết chính xác dữ liệu đến từ đâu

## Strict Mode

```jsx
import { StrictMode } from 'react';

// Trong main.tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`StrictMode` chỉ chạy trong development, giúp phát hiện:
- Component render không pure (gọi function 2 lần để kiểm tra)
- Side effects bị thiếu cleanup trong `useEffect`
- API deprecated

---

## Câu hỏi phỏng vấn

### Câu 1: Virtual DOM là gì và hoạt động thế nào?
**Đáp án:**
Virtual DOM là một bản sao nhẹ của DOM thật, được lưu trong bộ nhớ dưới dạng JavaScript object. Khi state thay đổi, React tạo một Virtual DOM mới, so sánh (diffing) với Virtual DOM cũ, tính toán những thay đổi tối thiểu (reconciliation), rồi chỉ cập nhật những phần thay đổi lên DOM thật.

```jsx
// Khi state thay đổi, React không cập nhật toàn bộ DOM
// Mà chỉ cập nhật phần thay đổi:

// Bước 1: State thay đổi -> tạo Virtual DOM mới
// Bước 2: Diff Virtual DOM cũ vs mới
// Bước 3: Tìm ra thay đổi tối thiểu
// Bước 4: Cập nhật DOM thật (chỉ phần thay đổi)

function App() {
  const [count, setCount] = useState(0);
  // Khi setCount -> React chỉ cập nhật text node "{count}"
  // Không render lại toàn bộ <div>
  return (
    <div>
      <h1>Title không đổi</h1>
      <p>Count: {count}</p>
    </div>
  );
}
```

Lợi ích: Giảm số lần thao tác DOM thật (vốn rất chậm vì gây reflow/repaint), tăng hiệu suất ứng dụng.

### Câu 2: Render phase và Commit phase khác nhau thế nào?
**Đáp án:**
React chia quá trình render thành 2 giai đoạn:

- **Render Phase**: React gọi function component, tạo React elements (Virtual DOM), thực hiện diffing. Giai đoạn này **có thể bị gián đoạn** và **không có side effects** nào lên DOM.
- **Commit Phase**: React cập nhật DOM thật, chạy side effects (`useEffect`, `useLayoutEffect`). Giai đoạn này **không thể bị gián đoạn**.

```jsx
function MyComponent() {
  // === RENDER PHASE ===
  // React gọi function này để tạo React elements
  const result = expensiveCalculation();

  // === COMMIT PHASE (sau khi return) ===
  // React lấy kết quả JSX và cập nhật DOM thật
  // Sau đó chạy useEffect
  useEffect(() => {
    // Side effect chạy trong commit phase
    document.title = result;
  }, [result]);

  return <div>{result}</div>;
}
```

### Câu 3: React Element và Component khác nhau thế nào?
**Đáp án:**
- **React Element** là một plain JavaScript object mô tả một node trên màn hình. Nó được tạo bởi JSX hoặc `React.createElement()` và là **immutable** (không thay đổi sau khi tạo).
- **React Component** là một function (hoặc class) **trả về** React elements. Component có thể nhận props, quản lý state và được tái sử dụng.

```jsx
// React Element — một plain object
const element = <h1>Hello</h1>;
// Tương đương: React.createElement('h1', null, 'Hello')
// Kết quả: { type: 'h1', props: { children: 'Hello' } }
console.log(typeof element); // "object"

// React Component — một function trả về elements
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>;
}
// Greeting là component, <Greeting name="React" /> tạo ra element
console.log(typeof Greeting); // "function"

// Mỗi lần render, component tạo element mới
// Nhưng React chỉ cập nhật DOM khi element thay đổi
```

### Câu 4: One-way data flow là gì và tại sao React sử dụng nó?
**Đáp án:**
One-way data flow (luồng dữ liệu một chiều) có nghĩa là dữ liệu chỉ truyền **từ component cha xuống component con** qua props. Component con **không thể trực tiếp thay đổi** dữ liệu của cha.

```jsx
// Dữ liệu chỉ chạy một chiều: Parent -> Child
function Parent() {
  const [message, setMessage] = useState('Hello');

  // Truyền data xuống qua props
  // Truyền callback để con "gửi" dữ liệu lên
  return (
    <Child
      message={message}
      onUpdate={(newMsg) => setMessage(newMsg)}
    />
  );
}

function Child({ message, onUpdate }) {
  // Không thể thay đổi message trực tiếp
  // Phải gọi callback của cha
  return (
    <div>
      <p>{message}</p>
      <button onClick={() => onUpdate('Updated!')}>
        Update
      </button>
    </div>
  );
}
```

Lợi ích:
- **Dễ debug**: Biết chính xác dữ liệu đến từ đâu (từ cha nào truyền xuống)
- **Dễ dự đoán**: Luồng dữ liệu rõ ràng, không có side effects ẩn
- **Dễ bảo trì**: Thay đổi state ở một nơi, tất cả components phụ thuộc tự động cập nhật
