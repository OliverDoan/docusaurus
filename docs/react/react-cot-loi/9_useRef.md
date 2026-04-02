---
sidebar_position: 9
title: "useRef"
---

# useRef

## useRef là gì?

`useRef` tạo một object `{ current: value }` tồn tại suốt vòng đời component. Khác với state, thay đổi ref **không gây re-render**.

```tsx
const ref = useRef(initialValue);
// ref.current = initialValue
```

## Hai use case chính

### 1. Truy cập DOM element

```tsx
function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={handleFocus}>Focus Input</button>
    </div>
  );
}
```

### 2. Lưu giá trị mutable không gây re-render

```tsx
function StopWatch() {
  const [time, setTime] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const start = () => {
    // Lưu intervalId vào ref (không cần re-render)
    intervalRef.current = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <div>
      <p>{time}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

## Ref vs State

| | `useRef` | `useState` |
|---|---|---|
| Gây re-render | ❌ | ✅ |
| Giữ giá trị giữa render | ✅ | ✅ |
| Đồng bộ | Ngay lập tức | Sau render tiếp theo |
| Dùng cho | DOM, timer IDs, previous values | UI data |

```tsx
// ref.current thay đổi NGAY LẬP TỨC
const countRef = useRef(0);
countRef.current = 5;
console.log(countRef.current); // 5 (ngay lập tức)

// state thay đổi SAU RENDER TIẾP THEO
const [count, setCount] = useState(0);
setCount(5);
console.log(count); // 0 (vẫn là giá trị cũ trong render hiện tại)
```

## DOM operations với ref

### Scroll đến element

```tsx
function ChatMessages({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat">
      {messages.map((msg) => (
        <div key={msg.id}>{msg.text}</div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
```

### Đo kích thước element

```tsx
function MeasuredBox() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (boxRef.current) {
      const { width, height } = boxRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);

  return (
    <div ref={boxRef}>
      Size: {dimensions.width}x{dimensions.height}
    </div>
  );
}
```

### Video/Audio control

```tsx
function VideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div>
      <video ref={videoRef} src={src} />
      <button onClick={() => videoRef.current?.play()}>Play</button>
      <button onClick={() => videoRef.current?.pause()}>Pause</button>
    </div>
  );
}
```

## Previous value pattern

Lưu giá trị trước đó của state/props:

```tsx
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current; // Trả về giá trị CŨ (trước khi effect cập nhật)
}

// Sử dụng
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <p>
      Current: {count}, Previous: {prevCount}
    </p>
  );
}
```

## Callback ref

Khi cần chạy code ngay khi element mount/unmount:

```tsx
function AutoFocusInput() {
  // Callback ref — gọi khi element mount (node !== null)
  // và unmount (node === null)
  const callbackRef = (node: HTMLInputElement | null) => {
    if (node) {
      node.focus();
    }
  };

  return <input ref={callbackRef} />;
}
```

## forwardRef

Truyền ref từ component cha vào DOM element của component con:

```tsx
import { forwardRef } from 'react';

interface InputProps {
  label: string;
  type?: string;
}

const CustomInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, type = 'text' }, ref) => {
    return (
      <label>
        {label}
        <input ref={ref} type={type} />
      </label>
    );
  }
);

// Component cha có thể access DOM element của con
function Form() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <CustomInput ref={inputRef} label="Name" />
      <button onClick={() => inputRef.current?.focus()}>
        Focus
      </button>
    </div>
  );
}
```

## Lưu ý quan trọng

- **Không đọc/ghi `ref.current` trong quá trình render** (ngoại trừ khởi tạo lần đầu)
- Ref thay đổi không gây re-render → UI không cập nhật
- Dùng ref cho DOM và giá trị mutable, dùng state cho UI data
