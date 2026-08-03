---
sidebar_position: 11
title: "11. Advanced Hooks"
---

# Advanced Hooks

> *Các câu hỏi phỏng vấn về hooks nâng cao trong React 18/19 — bao gồm `useImperativeHandle`, `useSyncExternalStore`, `useInsertionEffect` và kỹ thuật kiểm thử custom hooks.*

:::note[Ghi nhớ nhanh]

- ⭐ **`useImperativeHandle` + `forwardRef`** — cho phép cha truy cập ref của con, nhưng chỉ expose tập phương thức chọn lọc (focus, scroll) thay vì toàn bộ DOM node.
- **`useSyncExternalStore`** — subscribe an toàn vào store bên ngoài React, tránh tearing trong concurrent rendering (dùng cho thư viện state).
- **`useInsertionEffect`** — chạy trước mọi layout effect, dành riêng cho thư viện CSS-in-JS inject style.
- **Test custom hooks** — dùng `renderHook` của React Testing Library, không test qua component thật.

:::

---

## Câu 1: useImperativeHandle hook dùng để làm gì? `[Advanced]`

### Câu hỏi

> `useImperativeHandle` là gì? Khi nào nên sử dụng nó và tại sao cần kết hợp với `forwardRef`?

### Giải thích lý thuyết

`useImperativeHandle` cho phép component con kiểm soát những gì component cha có thể truy cập thông qua `ref`. Thay vì để lộ toàn bộ DOM node, component con chỉ export ra một tập hợp phương thức hoặc giá trị đã được chọn lọc.

**Tại sao cần dùng?**

- Mặc định, khi cha gắn `ref` vào component con, React không truyền `ref` qua component boundary.
- `forwardRef` cho phép component con nhận `ref` từ cha.
- `useImperativeHandle` giúp *tuỳ chỉnh* những gì `ref` đó expose ra ngoài, thay vì expose toàn bộ instance DOM.

**Nguyên tắc sử dụng:**

- Chỉ dùng khi cần giao tiếp imperative (focus, scroll, play/pause media).
- Ưu tiên dùng state/props trước; `useImperativeHandle` là giải pháp cuối cùng.
- Trong React 19, `ref` có thể truyền trực tiếp như prop mà không cần `forwardRef`.

| Cách tiếp cận | Khi nào dùng |
|---|---|
| Props/State | Hầu hết các trường hợp |
| `forwardRef` + `useImperativeHandle` | Cần gọi phương thức từ cha (focus, scroll, animate) |
| React 19 ref-as-prop | Thay thế `forwardRef` trong React 19 |

### Code minh hoạ

```tsx
import {
  useRef,
  useImperativeHandle,
  forwardRef,
  type ForwardedRef,
} from 'react';

// Định nghĩa interface của handle để cha có thể gọi
interface VideoPlayerHandle {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
}

interface VideoPlayerProps {
  src: string;
}

// React 18: dùng forwardRef
const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  ({ src }, ref: ForwardedRef<VideoPlayerHandle>) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
      play() {
        videoRef.current?.play();
      },
      pause() {
        videoRef.current?.pause();
      },
      seek(time: number) {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      },
    }));

    return <video ref={videoRef} src={src} />;
  }
);

// Component cha sử dụng
function PlayerPage() {
  const playerRef = useRef<VideoPlayerHandle>(null);

  return (
    <div>
      <VideoPlayer src="/movie.mp4" ref={playerRef} />
      <button onClick={() => playerRef.current?.play()}>Phát</button>
      <button onClick={() => playerRef.current?.pause()}>Dừng</button>
      <button onClick={() => playerRef.current?.seek(30)}>Tua 30s</button>
    </div>
  );
}
```

```tsx
// React 19: ref là prop thông thường, không cần forwardRef
interface InputHandle {
  focus: () => void;
  clear: () => void;
}

interface FancyInputProps {
  ref?: React.Ref<InputHandle>;
  placeholder?: string;
}

function FancyInput({ ref, placeholder }: FancyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current?.focus();
    },
    clear() {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
  }));

  return <input ref={inputRef} placeholder={placeholder} />;
}
```

### Đáp án mẫu

> `useImperativeHandle` tuỳ chỉnh những gì một `ref` được forward expose ra ngoài, giúp component con chỉ lộ các phương thức cần thiết (như `focus`, `play`) thay vì toàn bộ DOM node. Kết hợp với `forwardRef` (React 18) hoặc ref-as-prop (React 19), nó được dùng cho các tình huống imperative như media control, focus management — khi state/props không đủ để điều phối hành vi.

---

## Câu 2: useSyncExternalStore hook là gì và dùng khi nào? `[Advanced]`

### Câu hỏi

> `useSyncExternalStore` giải quyết vấn đề gì? So sánh với cách subscribe thủ công bằng `useEffect`.

### Giải thích lý thuyết

`useSyncExternalStore` (React 18+) là hook dành riêng để subscribe vào **external store** (store bên ngoài React như Redux, Zustand, browser APIs) theo cách **an toàn với Concurrent Mode**.

**Vấn đề với `useEffect` + `useState`:**

- Trong Concurrent Mode, React có thể render nhiều lần trước khi commit.
- Nếu external store thay đổi giữa chừng, UI có thể bị **tearing** — các phần của UI hiển thị dữ liệu từ các snapshot khác nhau.
- `useSyncExternalStore` đảm bảo React luôn đọc snapshot nhất quán.

**Cú pháp:**

```
useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)
```

- `subscribe`: hàm nhận callback, gọi callback khi store thay đổi, trả về hàm unsubscribe.
- `getSnapshot`: trả về snapshot hiện tại của store (phải là pure, trả về cùng giá trị nếu không có thay đổi).
- `getServerSnapshot`: snapshot cho SSR (tuỳ chọn).

| | `useEffect` + `useState` | `useSyncExternalStore` |
|---|---|---|
| Tearing safety | Không an toàn | An toàn |
| SSR support | Cần xử lý thủ công | Có `getServerSnapshot` |
| Boilerplate | Nhiều | Ít hơn |
| Dành cho | State nội bộ | External store |

### Code minh hoạ

```tsx
import { useSyncExternalStore, useCallback } from 'react';

// --- Ví dụ 1: Subscribe vào window.innerWidth ---

function subscribeToWindowWidth(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

function getWindowWidthSnapshot() {
  return window.innerWidth;
}

function getServerSnapshot() {
  return 1024; // Giá trị mặc định phía server
}

function useWindowWidth() {
  return useSyncExternalStore(
    subscribeToWindowWidth,
    getWindowWidthSnapshot,
    getServerSnapshot
  );
}

// --- Ví dụ 2: Custom store đơn giản ---

type Listener = () => void;

class SimpleStore<T> {
  private state: T;
  private listeners = new Set<Listener>();

  constructor(initialState: T) {
    this.state = initialState;
  }

  getSnapshot = (): T => this.state;

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  setState(newState: T) {
    this.state = newState;
    this.listeners.forEach((l) => l());
  }
}

const counterStore = new SimpleStore({ count: 0 });

function useCounter() {
  return useSyncExternalStore(
    counterStore.subscribe,
    counterStore.getSnapshot
  );
}

function Counter() {
  const { count } = useCounter();

  return (
    <div>
      <p>Đếm: {count}</p>
      <button
        onClick={() =>
          counterStore.setState({ count: counterStore.getSnapshot().count + 1 })
        }
      >
        Tăng
      </button>
    </div>
  );
}

// --- Dùng hook windowWidth ---
function ResponsiveLayout() {
  const width = useWindowWidth();
  return <p>Chiều rộng cửa sổ: {width}px</p>;
}
```

### Đáp án mẫu

> `useSyncExternalStore` giải quyết vấn đề **UI tearing** trong Concurrent Mode khi subscribe vào external store. Thay vì dùng `useEffect` + `useState` (có thể đọc dữ liệu không nhất quán giữa các lần render), hook này nhận `subscribe` và `getSnapshot` để React luôn đọc một snapshot duy nhất. Dùng khi tích hợp với state management bên ngoài React (Redux, Zustand) hoặc browser APIs (localStorage, matchMedia, online status).

---

## Câu 3: useInsertionEffect là gì và khi nào dùng? `[Advanced]`

### Câu hỏi

> `useInsertionEffect` khác gì so với `useEffect` và `useLayoutEffect`? Ai nên dùng hook này?

### Giải thích lý thuyết

`useInsertionEffect` (React 18+) chạy **trước khi** React thực hiện bất kỳ DOM mutation nào. Nó được thiết kế đặc biệt cho **CSS-in-JS libraries** cần inject `style` tags vào DOM trước khi browser paint.

**Thứ tự thực thi của các effects:**

```
Render → useInsertionEffect → DOM mutations → useLayoutEffect → Paint → useEffect
```

**So sánh 3 loại effect:**

| Hook | Khi chạy | Truy cập DOM | Dùng cho |
|---|---|---|---|
| `useInsertionEffect` | Trước DOM mutations | Không (không an toàn) | Inject CSS/style tags |
| `useLayoutEffect` | Sau DOM mutations, trước paint | Có | Đo lường DOM, animations |
| `useEffect` | Sau paint | Có | Side effects thông thường |

**Giới hạn quan trọng:**

- Không thể cập nhật state bên trong `useInsertionEffect`.
- Không thể truy cập refs (DOM chưa được mutate).
- Chỉ dành cho tác giả CSS-in-JS libraries, **không phải** code ứng dụng thông thường.

### Code minh hoạu

```tsx
import { useInsertionEffect, useRef } from 'react';

// Mô phỏng cách styled-components / emotion hoạt động nội bộ
const injectedStyles = new Set<string>();

function injectStyle(cssText: string, id: string) {
  if (injectedStyles.has(id)) return;

  const style = document.createElement('style');
  style.setAttribute('data-css-id', id);
  style.textContent = cssText;
  document.head.appendChild(style);
  injectedStyles.add(id);
}

// Hook nội bộ của CSS-in-JS library (không dùng trong app code)
function useStyledComponent(css: string, id: string) {
  useInsertionEffect(() => {
    // Chạy trước DOM mutations → style đã sẵn sàng trước khi React cập nhật DOM
    injectStyle(css, id);
    // Không cần cleanup vì style tags được cache
  }, [css, id]);
}

// Ví dụ sử dụng trong một library giả định
function StyledButton({ children }: { children: React.ReactNode }) {
  const css = `
    .btn-primary {
      background: #3b82f6;
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
    }
    .btn-primary:hover {
      background: #2563eb;
    }
  `;

  useStyledComponent(css, 'btn-primary');

  return <button className="btn-primary">{children}</button>;
}

// --- So sánh thứ tự chạy ---
function OrderDemo() {
  useInsertionEffect(() => {
    console.log('1. useInsertionEffect — trước DOM mutations');
  });

  // useLayoutEffect(() => {
  //   console.log('2. useLayoutEffect — sau DOM mutations, trước paint');
  // });

  // useEffect(() => {
  //   console.log('3. useEffect — sau paint');
  // });

  return <div>Xem console để thấy thứ tự</div>;
}
```

### Đáp án mẫu

> `useInsertionEffect` chạy trước cả `useLayoutEffect`, ngay trước khi React thực hiện DOM mutations. Nó được tạo ra dành riêng cho **tác giả CSS-in-JS libraries** (như styled-components, emotion) để inject style tags vào `document.head` trước khi browser tính toán layout, tránh flash of unstyled content. Code ứng dụng thông thường **không nên** dùng hook này — hãy dùng `useLayoutEffect` hoặc `useEffect` thay thế.

---

## Câu 4: Làm thế nào để test custom hooks? `[Intermediate]`

### Câu hỏi

> Có những cách nào để kiểm thử custom hooks trong React? Khi nào dùng `renderHook` từ React Testing Library?

### Giải thích lý thuyết

Custom hooks không thể gọi trực tiếp bên ngoài component vì chúng phụ thuộc vào React's rules of hooks. Có hai chiến lược kiểm thử:

**1. Test qua component thật (Integration testing)**
- Render một component đơn giản sử dụng hook đó.
- Kiểm tra output/behaviour qua UI.
- Phù hợp khi hook gắn chặt với DOM interaction.

**2. `renderHook` từ `@testing-library/react` (Unit testing)**
- Mount hook trong một wrapper component ảo.
- Trả về `result.current` để truy cập giá trị hook.
- Dùng `act()` để wrap các thao tác gây re-render.
- Phù hợp khi muốn test logic thuần của hook.

**Các điểm cần kiểm thử:**

| Loại | Ví dụ |
|---|---|
| Giá trị khởi tạo | `result.current.count === 0` |
| Sau thao tác | Click → count tăng lên 1 |
| Side effects | Fetch được gọi đúng URL |
| Cleanup | Event listener được remove |
| Error state | Hook xử lý lỗi đúng |

### Code minh hoạ

```tsx
// hooks/useCounter.ts
import { useState, useCallback } from 'react';

interface UseCounterOptions {
  initial?: number;
  min?: number;
  max?: number;
}

interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export function useCounter({
  initial = 0,
  min = -Infinity,
  max = Infinity,
}: UseCounterOptions = {}): UseCounterReturn {
  const [count, setCount] = useState(initial);

  const increment = useCallback(() => {
    setCount((prev) => Math.min(prev + 1, max));
  }, [max]);

  const decrement = useCallback(() => {
    setCount((prev) => Math.max(prev - 1, min));
  }, [min]);

  const reset = useCallback(() => {
    setCount(initial);
  }, [initial]);

  return { count, increment, decrement, reset };
}
```

```tsx
// hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('khởi tạo với giá trị mặc định là 0', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('khởi tạo với giá trị tuỳ chỉnh', () => {
    const { result } = renderHook(() => useCounter({ initial: 10 }));
    expect(result.current.count).toBe(10);
  });

  it('increment tăng count lên 1', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('không vượt quá giá trị max', () => {
    const { result } = renderHook(() => useCounter({ initial: 5, max: 5 }));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(5);
  });

  it('reset trở về giá trị ban đầu', () => {
    const { result } = renderHook(() => useCounter({ initial: 3 }));

    act(() => {
      result.current.increment();
      result.current.increment();
    });

    expect(result.current.count).toBe(5);

    act(() => {
      result.current.reset();
    });

    expect(result.current.count).toBe(3);
  });
});
```

```tsx
// hooks/useFetch.test.ts — Test hook có async và cleanup
import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from './useFetch';

// Mock fetch
global.fetch = jest.fn();

describe('useFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('trả về dữ liệu sau khi fetch thành công', async () => {
    const mockData = { id: 1, name: 'Alice' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() =>
      useFetch<{ id: number; name: string }>('/api/user/1')
    );

    // Trạng thái loading ban đầu
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    // Chờ fetch hoàn thành
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('xử lý lỗi fetch', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useFetch('/api/user/1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.data).toBeNull();
  });
});
```

### Đáp án mẫu

> Để test custom hooks, dùng `renderHook` từ `@testing-library/react` để mount hook trong môi trường ảo, sau đó truy cập giá trị qua `result.current`. Các thao tác gây state change phải được bọc trong `act()`, còn các thao tác async dùng `waitFor()`. Chiến lược này cho phép kiểm thử logic hook độc lập mà không cần render UI đầy đủ — đảm bảo giá trị khởi tạo, transitions, side effects và error handling đều hoạt động đúng.

---
