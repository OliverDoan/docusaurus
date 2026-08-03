---
sidebar_position: 12
title: "12. React Internals"
---

# React Internals

> _Hiểu cơ chế bên trong React — Fiber, synthetic events, event delegation, portal, và chiến lược migration — giúp bạn lập luận chính xác khi debug và thiết kế ứng dụng phức tạp._

:::note[Ghi nhớ nhanh]

- ⭐ **React Fiber** — kiến trúc reconciler mới (React 16+) biểu diễn mỗi đơn vị công việc thành Fiber node, cho phép gián đoạn, ưu tiên hóa (Lanes) và concurrent rendering.
- **Synthetic events + event delegation** — React gắn listener ở root container (từ React 17, thay vì `document`) để hỗ trợ nhiều bản React trên cùng trang.
- **Portal** — render DOM ra ngoài parent nhưng event vẫn bubble theo React tree (không theo DOM tree).
- **`act()` trong test** — bọc thao tác cập nhật state để đảm bảo effect/re-render chạy xong; RTL tự bọc, còn thao tác async cần `waitFor`/`findBy`.
- **Migrate Class sang Hooks** — làm dần từng component, không đập đi viết lại toàn bộ.

:::

---

## Câu 1: React Fiber là gì? `[Advanced]`

### Câu hỏi

> React Fiber là gì? Nó giải quyết vấn đề gì so với thuật toán reconciliation cũ (Stack Reconciler)? Fiber node chứa những thông tin gì?

### Giải thích lý thuyết

**Stack Reconciler (trước React 16)** hoạt động đệ quy đồng bộ — một khi bắt đầu render cây component, nó không thể bị gián đoạn. Với cây lớn, điều này chặn main thread, gây giật lag UI.

**React Fiber** (từ React 16) là kiến trúc reconciler mới, biểu diễn mỗi "đơn vị công việc" thành một đối tượng JS gọi là **Fiber node**. Fiber cho phép:

| Tính năng | Stack Reconciler | Fiber |
|---|---|---|
| Có thể gián đoạn | Không | Có |
| Ưu tiên hoá công việc | Không | Có (Lanes/Priority) |
| Concurrent rendering | Không | Có |
| Suspense / Time Slicing | Không | Có |

**Hai giai đoạn chính:**

1. **Render phase (có thể gián đoạn):** React duyệt cây Fiber, tính toán thay đổi, tạo `workInProgress` tree. Giai đoạn này thuần tuý — không có side effect.
2. **Commit phase (đồng bộ, không thể gián đoạn):** React áp dụng thay đổi lên DOM thật, chạy `useEffect`, `useLayoutEffect`.

**Fiber node** là một plain object chứa:
- `type` — loại element (`div`, `MyComponent`, ...)
- `key` — key để reconcile danh sách
- `stateNode` — DOM node hoặc instance class component
- `return`, `child`, `sibling` — con trỏ tạo thành linked list thay vì call stack
- `pendingProps`, `memoizedProps`, `memoizedState`
- `lanes` — thông tin ưu tiên (React 18+)
- `flags` — các side effect cần áp dụng (`Placement`, `Update`, `Deletion`, ...)

**Double buffering:** React duy trì hai cây — `current` (đang hiển thị) và `workInProgress` (đang tính toán). Khi commit xong, hai cây được hoán đổi.

### Code minh hoạ

```jsx
// Minh hoạ khái niệm "đơn vị công việc" của Fiber
// React tự quản lý nội bộ — đây chỉ là mô phỏng tư duy

function performUnitOfWork(fiber) {
  // 1. Thực hiện công việc cho fiber hiện tại (gọi render/function component)
  beginWork(fiber);

  // 2. Nếu có con, trả về con để xử lý tiếp
  if (fiber.child) {
    return fiber.child;
  }

  // 3. Không có con → hoàn thành fiber, leo lên sibling hoặc parent
  let current = fiber;
  while (current) {
    completeWork(current);
    if (current.sibling) return current.sibling;
    current = current.return; // quay về parent
  }
}

// Vòng lặp công việc — có thể yield để nhường main thread
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1; // nhường thread nếu hết thời gian
  }
  requestIdleCallback(workLoop); // lên lịch lần tiếp theo
}
```

```jsx
// Quan sát Fiber tree qua React DevTools hoặc __SECRET_INTERNALS
import React from 'react';

function App() {
  return <div>Hello Fiber</div>;
}

// Trong DevTools, mỗi component hiển thị là một Fiber node
// Tab "Components" → chọn component → xem hooks, props, state
// Tab "Profiler" → ghi lại render → xem thời gian từng Fiber
```

### Đáp án mẫu

> Fiber là kiến trúc reconciler của React từ v16, thay thế Stack Reconciler đệ quy đồng bộ. Mỗi Fiber node là một plain object đại diện cho một đơn vị công việc, được liên kết qua `child`/`sibling`/`return` thay vì call stack. Điều này cho phép React tạm dừng, tiếp tục, hoặc hủy bỏ công việc giữa chừng, là nền tảng của Concurrent Rendering, Suspense, và Transitions trong React 18+.

---

## Câu 2: Tại sao test React component phải wrap trong `act()`? Khi nào React Testing Library tự wrap, khi nào cần `waitFor`/`findBy`? `[Advanced]`

### Câu hỏi

> Giải thích mục đích của `act()` trong React testing. React Testing Library xử lý `act()` như thế nào? Phân biệt khi nào dùng `waitFor` vs `findBy`.

### Giải thích lý thuyết

**`act()` là gì?**

React cần "flush" tất cả state updates, effects, và re-renders trước khi bạn assert. Nếu không, bạn sẽ assert trên DOM chưa được cập nhật. `act()` đảm bảo React xử lý hoàn chỉnh một "batch" công việc trước khi trả về.

**React Testing Library (RTL) và `act()`:**

RTL tự động wrap nhiều utilities trong `act()`:
- `render()` — wrap trong `act()`
- `fireEvent.*` — wrap trong `act()`
- `userEvent.*` (từ `@testing-library/user-event`) — wrap trong `act()`

**Khi nào cần `waitFor` hoặc `findBy`:**

| Tình huống | Giải pháp |
|---|---|
| Thay đổi đồng bộ | `getBy*` — throw ngay nếu không tìm thấy |
| Thay đổi bất đồng bộ (fetch, timer) | `findBy*` = `waitFor` + `getBy*` |
| Assert nhiều điều kiện bất đồng bộ | `waitFor(() => { expect(...) })` |
| Chờ element biến mất | `waitForElementToBeRemoved` |

**Lưu ý quan trọng:**
- Dùng `findBy*` thay `waitFor(getBy*)` khi có thể — ngắn gọn hơn.
- Không dùng `waitFor` cho assertions đồng bộ — sẽ che giấu lỗi thật.
- Cảnh báo `"not wrapped in act(...)"` thường xảy ra với `useEffect` chạy async hoặc `setTimeout`.

### Code minh hoạ

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';

// ❌ SAI: Không chờ async update
test('sai - không chờ async', async () => {
  render(<UserProfile userId={1} />);
  // fetch user chạy trong useEffect, DOM chưa cập nhật
  expect(screen.getByText('Alice')).toBeInTheDocument(); // FAIL
});

// ✅ ĐÚNG: Dùng findBy để chờ element xuất hiện
test('đúng - dùng findBy', async () => {
  render(<UserProfile userId={1} />);
  // findBy tự động retry cho đến khi tìm thấy hoặc timeout
  const name = await screen.findByText('Alice');
  expect(name).toBeInTheDocument();
});

// ✅ ĐÚNG: Dùng waitFor khi cần assert nhiều thứ
test('đúng - dùng waitFor', async () => {
  render(<UserProfile userId={1} />);
  await waitFor(() => {
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });
});

// ✅ ĐÚNG: Khi cần act() thủ công (ví dụ: timer)
test('đúng - act thủ công với timer', () => {
  jest.useFakeTimers();
  render(<ToastMessage />);

  act(() => {
    jest.advanceTimersByTime(3000); // giả lập 3s trôi qua
  });

  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  jest.useRealTimers();
});

// ✅ ĐÚNG: userEvent tự wrap act
test('đúng - userEvent', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  await user.click(screen.getByRole('button', { name: 'Tăng' }));
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

### Đáp án mẫu

> `act()` đảm bảo React flush toàn bộ state updates và effects trước khi assertion. React Testing Library tự động wrap `render()`, `fireEvent`, và `userEvent` trong `act()`, nên thường không cần gọi thủ công. Dùng `findBy*` hoặc `waitFor` cho các thay đổi bất đồng bộ (fetch, timer); `getBy*` cho thay đổi đồng bộ. `findBy*` là shorthand của `waitFor` + `getBy*` và nên được ưu tiên khi chỉ cần chờ một element.

---

## Câu 3: React dùng event delegation với synthetic events. Tại sao React 17 đổi việc attach listener từ `document` sang root container? `[Advanced]`

### Câu hỏi

> Giải thích cơ chế synthetic events và event delegation trong React. Tại sao React 17 thay đổi điểm attach từ `document` sang root DOM container? Thay đổi này ảnh hưởng gì đến ứng dụng?

### Giải thích lý thuyết

**Synthetic Events:**

React không attach event listener lên từng DOM node. Thay vào đó, React dùng **event delegation** — attach một listener duy nhất lên một node cha, lắng nghe tất cả events bubble lên. Khi event xảy ra, React tạo `SyntheticEvent` — wrapper chuẩn hoá cross-browser API của native event.

**Trước React 17 (attach vào `document`):**

```
click → button → div → body → document ← React listener
```

React attach listener vào `document`. Vấn đề:
- Nếu code bên ngoài React gọi `event.stopPropagation()` ở tầng `document`, React không nhận được event.
- Khó microfrontend: nhiều React app trên cùng trang gây xung đột listener trên `document`.
- Khi dùng với jQuery hoặc thư viện legacy, `stopPropagation()` có thể chặn React bất ngờ.

**Từ React 17 (attach vào root container):**

```
click → button → div → root-container ← React listener → body → document
```

React attach listener vào root DOM node (e.g., `div#root`). Lợi ích:
- Nhiều phiên bản React có thể cùng tồn tại trên một trang (microfrontend, gradual upgrade).
- `event.stopPropagation()` trong native handler ở tầng ngoài React tree không ảnh hưởng đến React's listener.
- Dễ unmount một React root mà không để lại "zombie listener" trên `document`.

**Tác động migration:**

- Nếu dùng `document.addEventListener` và gọi `event.stopPropagation()`, có thể làm React không nhận event → cần kiểm tra lại logic.
- Với microfrontend, mỗi React root giờ isolate listener của mình.

### Code minh hoạ

```jsx
// React 17+: listener attach vào root container
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
// → React đặt listener vào div#root, không phải document

// ❌ VẤN ĐỀ TRƯỚC React 17:
// native listener ở document có thể chặn React
document.addEventListener('click', (e) => {
  e.stopPropagation(); // Chặn tất cả! React không nhận click nào cả
});

// ✅ SAU React 17:
// native listener ở document không ảnh hưởng React (listener ở root, trong document)
document.addEventListener('click', (e) => {
  e.stopPropagation(); // Chỉ chặn bubble lên trên root, React vẫn nhận event
});
```

```jsx
// Microfrontend: hai React app độc lập trên cùng trang
// React 17+ hỗ trợ tốt vì mỗi root có listener riêng

// App 1 - React 17
const root1 = ReactDOM.createRoot(document.getElementById('app-1'));
root1.render(<LegacyApp />);

// App 2 - React 18
const root2 = ReactDOM.createRoot(document.getElementById('app-2'));
root2.render(<ModernApp />);

// Hai root hoàn toàn độc lập về event handling
```

```jsx
// SyntheticEvent: chuẩn hoá cross-browser
function Button() {
  const handleClick = (syntheticEvent) => {
    // syntheticEvent.nativeEvent → native DOM event
    // syntheticEvent.target, .currentTarget → chuẩn hoá
    // syntheticEvent.preventDefault() → hoạt động nhất quán mọi browser
    console.log(syntheticEvent.type); // "click"
    console.log(syntheticEvent.nativeEvent instanceof MouseEvent); // true
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Đáp án mẫu

> React dùng event delegation — attach một listener duy nhất thay vì gắn lên từng node. Trước React 17, listener đặt ở `document`, gây xung đột khi nhiều React root cùng tồn tại hoặc khi code native gọi `stopPropagation()` ở tầng `document`. Từ React 17, listener chuyển về root container, giúp các React app isolate với nhau, hỗ trợ microfrontend, và tránh xung đột với thư viện bên ngoài.

---

## Câu 4: React Portal render component ở DOM khác (ngoài parent), nhưng event vẫn bubble qua React tree. Giải thích cơ chế này. `[Advanced]`

### Câu hỏi

> `ReactDOM.createPortal` cho phép render vào DOM node nằm ngoài parent. Tuy nhiên, event từ Portal vẫn bubble lên React component tree theo đúng thứ tự. Giải thích tại sao và điều này có ý nghĩa gì trong thực tế.

### Giải thích lý thuyết

**Portal là gì?**

`ReactDOM.createPortal(children, domNode)` render `children` vào `domNode` trong DOM thật, thay vì vào DOM node của component cha. Thường dùng cho: modal, tooltip, dropdown, notification — những thứ cần thoát khỏi `overflow: hidden` hoặc `z-index` của parent.

**Hai "cây" khác nhau:**

| Cây | Vị trí Portal |
|---|---|
| **DOM tree** | Nằm ngoài parent component (e.g., trực tiếp dưới `body`) |
| **React tree (Fiber tree)** | Vẫn là con của component đã gọi `createPortal` |

**Cơ chế event bubbling:**

React theo dõi event bubbling theo **React tree**, không theo DOM tree. Khi user click vào element bên trong Portal:
1. Native event bubble theo DOM tree lên `div#root` (nơi React listener đặt).
2. React nhận event, tra cứu Fiber tree để xác định path bubbling.
3. Event bubble lên theo **Fiber tree** — qua component cha đã tạo Portal — không phải theo DOM.

Kết quả: `onClick` handler trên parent component (trong React tree) **được gọi** dù DOM node của Portal nằm ngoài parent trong DOM.

**Ý nghĩa thực tế:**

- Click bên ngoài modal (`useEffect` + `document.addEventListener`) vẫn hoạt động đúng.
- `stopPropagation()` trong Portal sẽ chặn event bubble trong React tree.
- Context từ component cha vẫn hoạt động bình thường trong Portal.
- Cần cẩn thận với `event.stopPropagation()` khi muốn "click outside to close" — nên dùng `mousedown` và kiểm tra `contains()` thay vì stopPropagation.

### Code minh hoạ

```jsx
import { createPortal } from 'react-dom';
import { useState } from 'react';

// Modal component dùng Portal
function Modal({ onClose, children }) {
  return createPortal(
    // DOM: render vào document.body
    // React tree: vẫn là con của component gọi Modal
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()} // chặn bubble đến overlay
      >
        {children}
      </div>
    </div>,
    document.body // DOM destination
  );
}

// Parent component
function App() {
  const [open, setOpen] = useState(false);

  return (
    // onClick này SẼ được gọi khi click bên trong Modal
    // vì React bubble theo Fiber tree, không theo DOM tree
    <div onClick={() => console.log('Clicked in React tree!')}>
      <button onClick={() => setOpen(true)}>Mở Modal</button>

      {open && (
        <Modal onClose={() => setOpen(false)}>
          <p>Nội dung modal</p>
          {/* DOM: button này nằm ở body */}
          {/* React tree: button này là con của App */}
        </Modal>
      )}
    </div>
  );
}
```

```jsx
// Demo: event bubble theo React tree
function Parent() {
  return (
    <div onClick={() => console.log('Parent clicked!')}>
      <Child />
    </div>
  );
}

function Child() {
  // Portal render ra ngoài div của Parent trong DOM
  // nhưng click vào đây VẪN log "Parent clicked!"
  return createPortal(
    <button>Click tôi</button>,
    document.getElementById('portal-root')
  );
}

// DOM structure:
// <div id="root">
//   <div onclick="Parent clicked!">
//     <!-- không có gì ở đây trong DOM -->
//   </div>
// </div>
// <div id="portal-root">
//   <button>Click tôi</button>  ← DOM node thật của Portal
// </div>

// Nhưng khi click button → console log "Parent clicked!" ← React tree thắng
```

### Đáp án mẫu

> Portal render DOM node ra ngoài parent trong DOM tree, nhưng React duy trì mối quan hệ cha-con trong Fiber tree. Event bubbling trong React theo Fiber tree, không theo DOM tree. Khi click bên trong Portal, React listener ở root nhận native event, sau đó bubble event qua Fiber tree — qua component cha đã gọi `createPortal`. Điều này cho phép context, state, và event handler của parent hoạt động bình thường dù DOM node nằm ở vị trí khác.

---

## Câu 5: Dự án cũ dùng Class Components, chiến lược migrate sang Hooks là gì? `[Intermediate]`

### Câu hỏi

> Bạn tiếp nhận một dự án lớn dùng Class Components. Chiến lược migrate từng bước sang Hooks như thế nào? Những rủi ro nào cần chú ý?

### Giải thích lý thuyết

**Tại sao migrate?**

- Hooks cho phép tái sử dụng stateful logic (custom hooks) mà HOC/render props không làm được gọn.
- Code ngắn hơn, dễ đọc hơn.
- Class components vẫn được React hỗ trợ — không bắt buộc migrate, nhưng ecosystem đang chuyển dịch.

**Chiến lược migrate từng bước:**

**Bước 1: Audit và phân loại**
- Phân loại component theo độ phức tạp: simple (chỉ render), stateful, lifecycle-heavy.
- Ưu tiên migrate leaf components (không có con) trước — ít rủi ro nhất.

**Bước 2: Tạo custom hooks cho logic phức tạp**
- Extract `componentDidMount` + `componentDidUpdate` + `componentWillUnmount` thành `useEffect`.
- Extract state và methods thành custom hooks có thể test độc lập.

**Bước 3: Migrate từng component**
- Class → Function component + hooks.
- Giữ nguyên props interface — không thay đổi API với parent.
- Viết test trước khi migrate (regression test).

**Bước 4: Xử lý các trường hợp đặc biệt**

| Class pattern | Hooks tương đương |
|---|---|
| `this.state` / `setState` | `useState` |
| `componentDidMount` | `useEffect(() => {}, [])` |
| `componentDidUpdate` | `useEffect(() => {}, [deps])` |
| `componentWillUnmount` | `useEffect(() => { return cleanup }, [])` |
| `shouldComponentUpdate` | `React.memo` + `useMemo` |
| `getDerivedStateFromProps` | Tính toán trong render hoặc `useMemo` |
| `getSnapshotBeforeUpdate` | `useLayoutEffect` + `useRef` |
| `componentDidCatch` | Vẫn cần Class — `ErrorBoundary` chưa có Hook |
| `this.forceUpdate()` | `useReducer` dispatch dummy action |

**Rủi ro cần chú ý:**

- `ErrorBoundary` bắt buộc là Class Component — không migrate được sang Hook.
- `this.setState` callback (chạy sau render) → dùng `useEffect` để mô phỏng.
- `getDerivedStateFromProps` thường là code smell — review logic thay vì dịch 1:1.
- Closure stale state trong `useEffect` — Class dùng `this` nên không gặp vấn đề này.

### Code minh hoạ

```jsx
// ===== TRƯỚC: Class Component =====
class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: null, loading: true, error: null };
  }

  async componentDidMount() {
    try {
      const user = await fetchUser(this.props.userId);
      this.setState({ user, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.setState({ loading: true });
      try {
        const user = await fetchUser(this.props.userId);
        this.setState({ user, loading: false });
      } catch (error) {
        this.setState({ error: error.message, loading: false });
      }
    }
  }

  render() {
    const { user, loading, error } = this.state;
    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>Lỗi: {error}</div>;
    return <div>{user.name}</div>;
  }
}

// ===== SAU: Function Component + Hooks =====

// Bước 1: Extract custom hook (có thể test độc lập)
function useUser(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false; // tránh state update sau unmount

    setLoading(true);
    fetchUser(userId)
      .then((data) => {
        if (!cancelled) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true; // cleanup khi userId thay đổi hoặc unmount
    };
  }, [userId]); // re-run khi userId thay đổi — thay thế componentDidUpdate

  return { user, loading, error };
}

// Bước 2: Component sạch, tập trung vào render
function UserProfile({ userId }) {
  const { user, loading, error } = useUser(userId);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  return <div>{user.name}</div>;
}
```

```jsx
// ErrorBoundary: KHÔNG thể migrate sang Hook — vẫn giữ Class
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Có lỗi xảy ra. Vui lòng tải lại trang.</div>;
    }
    return this.props.children;
  }
}

// Dùng ErrorBoundary wrap các Function Components đã migrate
function App() {
  return (
    <ErrorBoundary>
      <UserProfile userId={1} /> {/* Đã migrate sang Hook */}
    </ErrorBoundary>
  );
}
```

### Đáp án mẫu

> Chiến lược migrate từng bước: audit và phân loại component theo độ phức tạp, bắt đầu từ leaf components ít rủi ro nhất, extract logic phức tạp thành custom hooks để test độc lập, rồi chuyển từng Class thành Function component + hooks. Giữ nguyên props interface trong quá trình migration. Lưu ý quan trọng: `ErrorBoundary` bắt buộc là Class Component và không thể migrate; stale closure trong `useEffect` là vấn đề phổ biến không có trong Class; `getDerivedStateFromProps` thường là code smell cần review thay vì dịch 1:1.

---
