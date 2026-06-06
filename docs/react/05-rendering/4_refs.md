---
sidebar_position: 4
title: "4. Refs"
---

# Refs

**Ref** (tham chiếu tới phần tử DOM hoặc giá trị tồn tại qua các lần render) cho phép bạn truy cập trực tiếp một phần tử DOM hoặc lưu một giá trị mà không gây re-render khi nó thay đổi. Trong component dạng hàm, ta tạo ref bằng hook `useRef`. Ref thường dùng để focus ô input, đo kích thước phần tử, hoặc lưu các giá trị tạm như timer.

---

## Mục lục

- [Refs là gì?](#refs-là-gì)
- [useRef](#useref)
- [Truy cập DOM element](#truy-cập-dom-element)
- [Ref cho component](#ref-cho-component)
- [Callback ref](#callback-ref)

---

## Refs là gì?

**Ref** = "tham chiếu" tới element DOM hoặc giá trị **persist giữa các
render** mà không trigger re-render khi đổi.

Use case chính:

- Truy cập **DOM element** thật (focus, scroll, measure).
- Lưu giá trị mutable không cần render (timer id, previous value).
- Imperative integration với thư viện non-React (chart, video player).

---

## useRef

Hook `useRef(initialValue)` trả về object `{ current: ... }`:

```jsx
import { useRef } from "react";

function Counter() {
  const renderCount = useRef(0);

  renderCount.current++;
  console.log("Render", renderCount.current);

  return <p>...</p>;
}
```

- `ref.current` sửa được, **không** trigger re-render.
- Giá trị persist qua mọi lần render.

---

## Truy cập DOM element

```jsx
import { useRef, useEffect } from "react";

function AutoFocusInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus(); // truy cập DOM thật
  }, []);

  return <input ref={inputRef} />;
}
```

Pattern phổ biến:

```jsx
function VideoPlayer() {
  const videoRef = useRef(null);

  const play = () => videoRef.current.play();
  const pause = () => videoRef.current.pause();

  return (
    <>
      <video ref={videoRef} src="/movie.mp4" />
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
    </>
  );
}
```

Scroll to element:

```jsx
function Page() {
  const sectionRef = useRef(null);

  const scrollToSection = () => {
    sectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <button onClick={scrollToSection}>Go to section</button>
      <div style={{ height: "2000px" }}></div>
      <section ref={sectionRef}>Target</section>
    </>
  );
}
```

:::warning[Cần lưu ý]

**Không truy cập ref trong render**:

```jsx
function Bad({ data }) {
  const ref = useRef(null);

  // SAI — ref.current là null khi render đầu, chưa mount
  const width = ref.current?.offsetWidth;

  return <div ref={ref}>{width}</div>;
}

// ĐÚNG — đo trong useEffect (sau khi commit DOM)
function Good() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(ref.current.offsetWidth);
  }, []);

  return <div ref={ref}>{width}</div>;
}
```

Hoặc dùng `useLayoutEffect` để đo trước khi browser paint (tránh flicker).

:::

---

## Ref cho component

Trong React **19+** — function component có thể nhận `ref` qua props
trực tiếp:

```jsx
function MyInput({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

// Caller
function Form() {
  const inputRef = useRef(null);
  return <MyInput ref={inputRef} />;
}
```

Trước React 19 — phải dùng `forwardRef`:

```jsx
import { forwardRef } from "react";

const MyInput = forwardRef(function MyInput(props, ref) {
  return <input ref={ref} {...props} />;
});
```

:::info[Phân tích]

**React 19 đơn giản hoá ref** — không cần `forwardRef` cho function
component nữa:

```jsx
// React 18
const Button = forwardRef(({ children, ...props }, ref) => (
  <button ref={ref} {...props}>{children}</button>
));

// React 19
function Button({ children, ref, ...props }) {
  return <button ref={ref} {...props}>{children}</button>;
}
```

Migration: chạy codemod `react-codemod forward-refs-to-refs`. Hoặc làm
tay khi quay lại file.

Class component vẫn có `React.createRef()` và bind ref qua `ref={this.myRef}`
như cũ — không thay đổi.

:::

---

## Callback ref

Thay vì pass `ref` object, pass **function**:

```jsx
function Component() {
  const measureRef = (node) => {
    if (node) {
      console.log("Mounted, width:", node.offsetWidth);
    }
  };

  return <div ref={measureRef}>...</div>;
}
```

Callback ref được gọi:

- **Mount**: với DOM node.
- **Unmount**: với `null`.

Hữu dụng khi:

- Cần **đo element** ngay khi mount (không phải đợi effect).
- Cần **conditional ref**:

```jsx
<div ref={isMounted ? measureRef : null}>
```

- Dùng với **callback ref pattern** cho measure (`react-use-measure`):

```jsx
import useMeasure from "react-use-measure";

function Component() {
  const [ref, { width, height }] = useMeasure();
  return <div ref={ref}>{width} x {height}</div>;
}
```

:::tip[Mẹo]

**Use case "imperative handle"** — cho parent gọi method trên component:

```jsx
import { useImperativeHandle, useRef } from "react";

function FancyInput({ ref }) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = ""; },
  }));

  return <input ref={inputRef} />;
}

// Parent
function Form() {
  const fancyRef = useRef(null);

  return (
    <>
      <FancyInput ref={fancyRef} />
      <button onClick={() => fancyRef.current.focus()}>Focus</button>
      <button onClick={() => fancyRef.current.clear()}>Clear</button>
    </>
  );
}
```

Pattern này hữu ích cho **headless component** nhưng nên **tránh khi
có thể** — React khuyến khích flow data, không imperative.

Khi cần focus/scroll, ưu tiên: state-driven (prop `autoFocus`) →
imperative ref (last resort).

:::

:::warning[Cần lưu ý]

**Đừng abuse ref để thay state.** Ref không trigger re-render → component
sẽ "không thấy" thay đổi:

```jsx
// SAI
function Counter() {
  const count = useRef(0);

  return (
    <button onClick={() => count.current++}>
      Count: {count.current}  {/* hiển thị KHÔNG update */}
    </button>
  );
}

// ĐÚNG
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

Quy tắc: **nếu giá trị hiện trong UI → dùng state**, **nếu chỉ cần
behind-the-scenes → dùng ref**.

:::
