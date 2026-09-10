---
sidebar_position: 2
title: "2. Class Components (Legacy)"
---

# Class Components (Legacy)

**Class component** (component viết dưới dạng lớp ES6) là cách tạo component cũ trong React, trước khi **hooks** (các hàm giúp dùng state và vòng đời trong functional component) ra đời năm 2019. Ngày nay hầu như không ai viết code mới bằng class component nữa, nhưng bạn vẫn nên hiểu nó để đọc code cũ và nắm được lý do hooks xuất hiện. Bài này giới thiệu cách khai báo class component, quản lý **state** (dữ liệu nội bộ thay đổi theo thời gian) và các **lifecycle method** (phương thức chạy ở từng giai đoạn vòng đời component).

---

:::note[Ghi nhớ nhanh]

- ⭐ **Class component là cách viết cũ** — Hooks (React 16.8, 2019) đã thay thế cho 99% use case mới; không viết code mới bằng class.
- **State qua `this.state` / `this.setState`** — `setState` là async và batched, dùng dạng updater `setState(prev => ...)` khi phụ thuộc state cũ.
- **Lifecycle 3 giai đoạn** — `componentDidMount`, `componentDidUpdate`, `componentWillUnmount`; một `useEffect` thay được cả ba.
- ⭐ **Error Boundary vẫn buộc dùng class** — React chưa có hook tương đương (`getDerivedStateFromError`, `componentDidCatch`).
- **Vẫn cần biết để đọc & maintain code legacy** — codebase trước 2019 đầy class component; migrate dần sang hooks.

:::

---

## Mục lục

- [Vì sao (từng) có class component?](#vì-sao-từng-có-class-component)
- [Tại sao vẫn cần biết?](#tại-sao-vẫn-cần-biết)
- [Khai báo class component](#khai-báo-class-component)
- [State và setState](#state-và-setstate)
- [Lifecycle methods](#lifecycle-methods)
- [Khi nào còn gặp class component?](#khi-nào-còn-gặp-class-component)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao (từng) có class component?

**Vấn đề:** Trước khi có Hooks (React < 16.8), functional component
**không giữ được state** và **không có lifecycle** — chỉ là "dumb
component" nhận props rồi render ra UI. Không có cách nào để component
có dữ liệu nội bộ thay đổi theo thời gian hay phản ứng theo vòng đời
(mount/update/unmount).

```jsx
// Trước Hooks: functional component chỉ render, không state
function Counter() {
  let count = 0; // reset mỗi lần render, không giữ được
  return <button onClick={() => count++}>Count: {count}</button>;
  // Bấm nút → count++ nhưng UI không cập nhật, không có gì re-render
}
```

**Giải pháp:** Class component (`extends React.Component`) cho component
một nơi giữ **state** riêng (`this.state` / `this.setState`) và bộ
**lifecycle method** (`componentDidMount`, `componentDidUpdate`,
`componentWillUnmount`...) để chạy logic ở từng giai đoạn vòng đời.

```jsx
import { Component } from "react";

class Counter extends Component {
  state = { count: 0 }; // state riêng, giữ qua các lần render

  render() {
    return (
      <button onClick={() => this.setState(p => ({ count: p.count + 1 }))}>
        Count: {this.state.count}
      </button>
    );
  }
}
```

Ngày nay phần lớn việc này đã được thay bằng Hooks, nhưng vẫn cần hiểu
class component vì còn trong codebase cũ và Error Boundary đến nay vẫn
phải dùng class.

:::tip[Dùng thực tế]

- **Đọc & bảo trì code cũ** — codebase trước 2019 đầy class component.
- **Error Boundary** — React vẫn chưa có hook tương đương, buộc dùng class.
- **Hiểu lịch sử lifecycle** — biết vì sao `useEffect` ra đời để thay thế.
- **Migrate dần sang hooks** — nắm class để convert an toàn từng phần.

:::

---

## Tại sao vẫn cần biết?

Hooks (React 16.8, 2019) đã thay thế class component cho 99% use case
mới. Nhưng vẫn nên biết để:

- **Đọc code legacy** — codebase trước 2019.
- **Maintain dự án cũ** — migrate dần sang hooks.
- **Hiểu khái niệm** — lifecycle, this, bind... để giải thích tại sao
  hooks ra đời.

:::warning[Cần lưu ý]

**Không viết code mới bằng class component.** React docs đã chuyển sang
hooks-first hoàn toàn. Hooks:

- Code ngắn hơn 30-50%.
- Không có `this` binding rắc rối.
- Reuse logic dễ qua custom hooks.
- Type-safe với TypeScript tốt hơn.

Class component **vẫn được hỗ trợ** vô thời hạn — không bị remove. Chỉ
là không khuyến nghị cho code mới.

:::

---

## Khai báo class component

```jsx
import { Component } from "react";

class Welcome extends Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}

// Dùng
<Welcome name="An" />
```

Với TypeScript:

```tsx
interface Props { name: string; }
interface State { count: number; }

class Counter extends Component<Props, State> {
  state: State = { count: 0 };

  render() {
    return <p>Count: {this.state.count}</p>;
  }
}
```

---

## State và setState

State khởi tạo trong constructor hoặc class field:

```jsx
class Counter extends Component {
  state = { count: 0 };

  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    return (
      <button onClick={this.increment}>
        Count: {this.state.count}
      </button>
    );
  }
}
```

`setState` có 2 dạng:

```jsx
// Dạng 1: object — không nên khi update dựa vào state cũ
this.setState({ count: this.state.count + 1 });

// Dạng 2: updater function — đúng khi dựa vào state trước
this.setState(prev => ({ count: prev.count + 1 }));
```

:::warning[Cần lưu ý]

**`setState` là async + batched** — đừng dựa vào `this.state` ngay sau
khi gọi:

```jsx
this.setState({ count: 1 });
console.log(this.state.count); // có thể vẫn là giá trị cũ

// Multiple setState gộp lại
this.setState({ count: this.state.count + 1 });
this.setState({ count: this.state.count + 1 });
// Cả 2 thấy count cũ → kết quả +1, không phải +2

// Đúng cách
this.setState(prev => ({ count: prev.count + 1 }));
this.setState(prev => ({ count: prev.count + 1 }));
// +2
```

Cùng issue áp dụng cho hooks `useState` — nguyên tắc giống nhau.

:::

---

## Lifecycle methods

3 giai đoạn lifecycle:

| Phase | Method |
|-------|--------|
| **Mounting** | `constructor` → `render` → `componentDidMount` |
| **Updating** | `shouldComponentUpdate` → `render` → `componentDidUpdate` |
| **Unmounting** | `componentWillUnmount` |

Vòng đời của một class component đi qua các trạng thái sau:

```mermaid
stateDiagram-v2
    [*] --> ctor
    ctor --> render1
    render1 --> didMount
    didMount --> Idle
    Idle --> render2: props hoặc state đổi
    render2 --> didUpdate
    didUpdate --> Idle
    Idle --> willUnmount: bị gỡ khỏi UI
    willUnmount --> [*]
    state "constructor" as ctor
    state "render (Mounting)" as render1
    state "componentDidMount" as didMount
    state "Đang hiển thị" as Idle
    state "render (Updating)" as render2
    state "componentDidUpdate" as didUpdate
    state "componentWillUnmount" as willUnmount
```

```jsx
class DataLoader extends Component {
  state = { data: null, loading: true };

  componentDidMount() {
    // Chạy sau khi component mount
    fetch("/api").then(r => r.json()).then(data => {
      this.setState({ data, loading: false });
    });
  }

  componentDidUpdate(prevProps) {
    // Chạy sau khi update
    if (this.props.id !== prevProps.id) {
      this.reload();
    }
  }

  componentWillUnmount() {
    // Cleanup trước khi unmount
    this.abortController?.abort();
  }

  render() {
    if (this.state.loading) return <p>Loading...</p>;
    return <div>{JSON.stringify(this.state.data)}</div>;
  }
}
```

:::info[Phân tích]

**Hooks tương đương lifecycle:**

| Lifecycle | Hooks |
|-----------|-------|
| `constructor` | `useState` initial value |
| `componentDidMount` | `useEffect(() => {}, [])` |
| `componentDidUpdate` | `useEffect(() => {}, [deps])` |
| `componentWillUnmount` | `useEffect` return cleanup |
| `shouldComponentUpdate` | `React.memo` + `useMemo`/`useCallback` |
| `getDerivedStateFromProps` | Tính từ props trong render |
| `getSnapshotBeforeUpdate` | `useLayoutEffect` |

Một `useEffect` thay thế **3 lifecycle method** (mount, update, unmount)
trong một chỗ — dễ đọc, không bị tách logic.

Vd Pattern data fetching:

```jsx
// Class — 3 chỗ
class C extends Component {
  componentDidMount() { this.fetch(); }
  componentDidUpdate(prev) { if (prev.id !== this.props.id) this.fetch(); }
  componentWillUnmount() { this.controller.abort(); }
}

// Hook — 1 chỗ
function C({ id }) {
  useEffect(() => {
    const ctrl = new AbortController();
    fetchData(id, ctrl.signal);
    return () => ctrl.abort(); // cleanup
  }, [id]); // re-fetch khi id đổi
}
```

:::

---

## Khi nào còn gặp class component?

Năm 2026, gần như **chỉ còn 2 lý do**:

**1. Error Boundary** — đến nay React **vẫn chưa có hook tương đương**:

```jsx
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logErrorToSentry(error, info);
  }

  render() {
    if (this.state.hasError) {
      return <p>Đã có lỗi</p>;
    }
    return this.props.children;
  }
}
```

Có thư viện `react-error-boundary` wrap thành component dễ dùng hơn.

**2. Codebase legacy** — không bao giờ migrate hết. Hiểu để đọc.

:::tip[Mẹo]

**Migrate class → hook**: làm dần từng component, không phải đập đi xây
lại toàn bộ. Tool hỗ trợ:

- **react-codemod** — script tự convert lifecycle → hooks.
- **VSCode refactor** — đôi khi work.
- Làm tay với pattern đã biết — an toàn nhất.

Ưu tiên migrate component có **logic đơn giản** trước. Component có
`shouldComponentUpdate`, `getSnapshotBeforeUpdate`, error boundary —
để cuối hoặc giữ class.

:::

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. Class component là gì? Tối thiểu cần những gì để một class trở thành component React hợp lệ?
2. Vì sao `render()` phải thuần và không có side effect? Điều gì xảy ra nếu gọi `setState` ngay trong `render()`?
3. Vì sao trong class phải viết `this.props.name` chứ không phải `props.name` như function component?
4. Khởi tạo state bằng `constructor` khác bằng class field ra sao? `super(props)` dùng để làm gì và quên nó thì lỗi gì xảy ra?
5. Vì sao method của class bị mất `this` khi truyền làm event handler? Kể ba cách khắc phục và ưu nhược của từng cách.
6. `setState` là bất đồng bộ và được gộp lô (`batched`) nghĩa là gì? Vì sao gọi `this.setState({count: this.state.count + 1})` hai lần liên tiếp chỉ tăng một?
7. Khi nào bắt buộc phải dùng dạng updater `setState(prev => ...)`? Nguyên tắc này có áp dụng cho `useState` không?
8. `setState` nhận thêm một callback thứ hai — dùng để làm gì và tương đương với cái gì trong thế giới Hooks?
9. `setState` gộp nông (`shallow merge`) state cũ với state mới, còn `useState` thì thay thế hoàn toàn. Sự khác biệt này gây bug thế nào khi migrate?
10. Kể ba giai đoạn của vòng đời class component và các method thuộc từng giai đoạn theo đúng thứ tự chạy.
11. `componentDidMount` dùng để làm gì? Vì sao nên gọi API ở đây thay vì trong `constructor` hay `render`?
12. Trong `componentDidUpdate(prevProps)`, vì sao phải so sánh `prevProps` trước khi gọi `setState`? Không so sánh thì hiện tượng gì xảy ra?
13. `componentWillUnmount` thường phải dọn những thứ gì? Không dọn thì hậu quả cụ thể là gì?
14. `shouldComponentUpdate` và `PureComponent` hoạt động ra sao? So sánh nông có cạm bẫy gì với props dạng object hay function?
15. Vì sao các method `componentWillMount`, `componentWillReceiveProps`, `componentWillUpdate` bị đánh dấu unsafe? Chúng xung đột với cơ chế render bất đồng bộ ở điểm nào?
16. `getDerivedStateFromProps` vì sao là `static` và không truy cập được `this`? Khi nào thật sự cần tới nó, và vì sao đa số trường hợp là dùng sai?
17. `getSnapshotBeforeUpdate` giải quyết bài toán gì? Cho một tình huống thực tế như giữ vị trí cuộn trong khung chat.
18. Ánh xạ vòng đời sang Hooks: một `useEffect` thay thế được cả mount, update và unmount như thế nào? Có lifecycle nào KHÔNG có bản tương đương một-một không?
19. `Error Boundary` là gì? `getDerivedStateFromError` khác `componentDidCatch` ở vai trò nào, và nên đặt chúng ở đâu trong cây component?
20. Error Boundary KHÔNG bắt được những loại lỗi nào (event handler, code bất đồng bộ, lỗi trong chính boundary)? Với những loại đó bạn xử lý ra sao?
21. Vì sao tới nay Error Boundary vẫn buộc phải viết bằng class? Thư viện `react-error-boundary` giúp gì cho bạn?
22. Trước khi có Hooks, người ta chia sẻ logic bằng `HOC` và `render props`. Hai cách đó gặp vấn đề gì (`wrapper hell`, va chạm tên prop) mà custom hook giải quyết được?
23. Bạn lập kế hoạch migrate một codebase đầy class component sang Hooks thế nào? Component nào làm trước, component nào để cuối, và bạn bảo đảm không hỏng bằng cách nào?
