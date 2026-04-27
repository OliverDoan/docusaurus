---
sidebar_position: 8
title: "8. useEffect"
---

# useEffect


---

## Mục lục

- [useEffect là gì?](#useeffect-là-gì)
- [Dependency Array](#dependency-array)
- [Cleanup function](#cleanup-function)
- [Data fetching](#data-fetching)
- [Các lỗi thường gặp](#các-lỗi-thường-gặp)
- [useEffect với Strict Mode](#useeffect-với-strict-mode)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## useEffect là gì?

`useEffect` cho phép thực hiện **side effects** trong function component — những thao tác xảy ra "bên ngoài" quá trình render: gọi API, subscriptions, thao tác DOM, timers.

```tsx
useEffect(() => {
  // Side effect code
  return () => {
    // Cleanup (optional)
  };
}, [dependencies]);
```

## Dependency Array

Dependency array quyết định **khi nào** effect chạy:

```tsx
// 1. Không có dependency array → chạy SAU MỖI LẦN render
useEffect(() => {
  console.log('Runs after every render');
});

// 2. Mảng rỗng → chỉ chạy SAU LẦN RENDER ĐẦU TIÊN (mount)
useEffect(() => {
  console.log('Runs only once on mount');
}, []);

// 3. Có dependencies → chạy khi dependency thay đổi
useEffect(() => {
  console.log(`userId changed to: ${userId}`);
}, [userId]);

// 4. Nhiều dependencies → chạy khi BẤT KỲ dependency nào thay đổi
useEffect(() => {
  fetchData(userId, page);
}, [userId, page]);
```

## Cleanup function

Cleanup chạy **trước** khi effect chạy lại hoặc khi component unmount:

```tsx
// Timer
useEffect(() => {
  const intervalId = setInterval(() => {
    setSeconds((s) => s + 1);
  }, 1000);

  return () => clearInterval(intervalId); // Cleanup timer
}, []);

// Event listener
useEffect(() => {
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);

  return () => window.removeEventListener('resize', handleResize);
}, []);

// WebSocket
useEffect(() => {
  const ws = new WebSocket('wss://api.example.com');
  ws.onmessage = (event) => setMessages((prev) => [...prev, event.data]);

  return () => ws.close();
}, []);
```

### Thứ tự chạy

```
Mount:     render → effect chạy
Update:    render → cleanup cũ → effect mới
Unmount:   cleanup cuối cùng
```

## Data fetching

### Pattern cơ bản

```tsx
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false; // Flag để tránh set state sau unmount

    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();

        if (!cancelled) {
          setUser(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      cancelled = true; // Cleanup: cancel nếu userId thay đổi trước khi fetch xong
    };
  }, [userId]);

  if (loading) return <Spinner />;
  if (error) return <p>Error: {error}</p>;
  if (!user) return <p>Not found</p>;

  return <div>{user.name}</div>;
}
```

### AbortController (cách tốt hơn)

```tsx
useEffect(() => {
  const controller = new AbortController();

  fetch(`/api/users/${userId}`, { signal: controller.signal })
    .then((res) => res.json())
    .then((data) => setUser(data))
    .catch((err) => {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    });

  return () => controller.abort(); // Hủy request cũ
}, [userId]);
```

> **Lưu ý:** Trong production, nên dùng thư viện data fetching như **TanStack Query (React Query)**, **SWR**, hoặc framework data loading (Next.js, Remix) thay vì tự viết useEffect + fetch.

## Các lỗi thường gặp

### 1. Thiếu dependency

```tsx
// ❌ Bug: effect dùng userId nhưng không khai báo dependency
useEffect(() => {
  fetchUser(userId);
}, []); // ESLint sẽ cảnh báo

// ✅ Khai báo đầy đủ
useEffect(() => {
  fetchUser(userId);
}, [userId]);
```

### 2. Object/array dependency gây infinite loop

```tsx
// ❌ Infinite loop: object mới mỗi render → dependency luôn "thay đổi"
function App({ userId }) {
  const options = { userId, page: 1 }; // Object mới mỗi render

  useEffect(() => {
    fetchData(options);
  }, [options]); // Loop vô tận!

  // ✅ Cách 1: Dùng primitive values
  useEffect(() => {
    fetchData({ userId, page: 1 });
  }, [userId]); // userId là primitive → so sánh đúng

  // ✅ Cách 2: useMemo
  const options = useMemo(() => ({ userId, page: 1 }), [userId]);
  useEffect(() => {
    fetchData(options);
  }, [options]);
}
```

### 3. Không cần useEffect

```tsx
// ❌ Không cần effect để tính derived state
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ Tính trực tiếp
const fullName = `${firstName} ${lastName}`;

// ❌ Không cần effect để handle event
useEffect(() => {
  if (submitted) {
    sendData(form);
  }
}, [submitted]);

// ✅ Xử lý trong event handler
const handleSubmit = () => {
  sendData(form);
};
```

### Quy tắc: Bạn có thể KHÔNG cần useEffect nếu

- Tính toán giá trị từ state/props khác → **tính trực tiếp trong render**
- Xử lý user event → **dùng event handler**
- Biến đổi dữ liệu trước khi render → **tính trong render hoặc useMemo**

## useEffect với Strict Mode

Trong development + Strict Mode, React chạy effect **hai lần** (mount → unmount → mount) để kiểm tra cleanup đúng. Nếu UI bị lỗi khi Strict Mode bật → cleanup function có vấn đề.

---

## Câu hỏi phỏng vấn

### Câu 1: Dependency array trong useEffect hoạt động thế nào?
**Đáp án:**
Dependency array quyết định **khi nào** effect chạy lại. React so sánh từng phần tử trong dependency array bằng `Object.is` (tương đương `===`) giữa render hiện tại và render trước. Nếu bất kỳ dependency nào thay đổi, effect chạy lại.

```jsx
// 1. Không có dependency array → chạy SAU MỖI LẦN render
useEffect(() => {
  console.log('Every render');
});

// 2. Mảng rỗng [] → chạy MỘT LẦN sau mount
useEffect(() => {
  console.log('Only on mount');
}, []);

// 3. Có dependencies → chạy khi dependency thay đổi
useEffect(() => {
  fetchUser(userId);
}, [userId]);
// userId: "1" → "2" → effect chạy lại
// userId: "2" → "2" → effect KHÔNG chạy (giá trị không đổi)

// 4. Object/array dependency — CẨN THẬN
useEffect(() => {
  fetchData(options);
}, [options]);
// Object mới mỗi render (dù giá trị giống) → reference khác → effect chạy lại!
// Giải pháp: dùng primitive values hoặc useMemo
```

React so sánh bằng reference, không phải deep equality. Đây là lý do object/array trong dependency dễ gây infinite loop.

### Câu 2: Cleanup function trong useEffect dùng để làm gì?
**Đáp án:**
Cleanup function dùng để **dọn dẹp** side effects trước đó: hủy timer, xóa event listener, đóng WebSocket, cancel request. Cleanup chạy **trước khi effect chạy lại** (khi dependency thay đổi) và **khi component unmount**.

```jsx
useEffect(() => {
  // 1. Setup: đăng ký side effect
  const intervalId = setInterval(() => {
    setCount((c) => c + 1);
  }, 1000);

  // 2. Cleanup: hủy side effect
  return () => {
    clearInterval(intervalId);
  };
}, []);

// Thứ tự thực thi:
// Mount:   setup chạy
// Update:  cleanup CŨ chạy → setup MỚI chạy
// Unmount: cleanup cuối cùng chạy

// Ví dụ thực tế — event listener:
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeModal();
  };
  window.addEventListener('keydown', handleKeyDown);

  return () => window.removeEventListener('keydown', handleKeyDown);
  // Nếu không cleanup → event listener tích lũy mỗi lần render
  // → memory leak + handler chạy nhiều lần
}, [closeModal]);
```

Không có cleanup → memory leak, event listener trùng lặp, request cũ ghi đè kết quả mới.

### Câu 3: Vòng lặp vô hạn (infinite loop) trong useEffect xảy ra khi nào?
**Đáp án:**
Infinite loop xảy ra khi effect **thay đổi một dependency** của chính nó, hoặc khi dependency là object/array **được tạo mới mỗi render**.

```jsx
// ❌ Case 1: Effect thay đổi dependency của chính nó
const [count, setCount] = useState(0);
useEffect(() => {
  setCount(count + 1); // Thay đổi count → dependency thay đổi → effect chạy lại → loop!
}, [count]);

// ❌ Case 2: Object dependency tạo mới mỗi render
function App({ userId }) {
  const options = { userId, page: 1 }; // Object MỚI mỗi render

  useEffect(() => {
    fetchData(options);
  }, [options]); // options reference mới → effect chạy → re-render → loop!
}

// ✅ Sửa Case 2: Dùng primitive values
useEffect(() => {
  fetchData({ userId, page: 1 });
}, [userId]); // userId là primitive → so sánh đúng

// ✅ Hoặc useMemo
const options = useMemo(() => ({ userId, page: 1 }), [userId]);
useEffect(() => {
  fetchData(options);
}, [options]); // Chỉ thay đổi khi userId thay đổi

// ❌ Case 3: Không có dependency array + setState
useEffect(() => {
  setData(transform(data)); // Mỗi render → setState → re-render → loop!
});
```

### Câu 4: Khi nào KHÔNG cần dùng useEffect?
**Đáp án:**
Nhiều trường hợp lập trình viên dùng useEffect nhưng thực ra không cần. Quy tắc: nếu có thể tính trực tiếp trong render hoặc xử lý trong event handler, **đừng dùng useEffect**.

```jsx
// ❌ Không cần effect để tính derived state
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ Tính trực tiếp
const fullName = `${firstName} ${lastName}`;

// ❌ Không cần effect để xử lý user event
const [submitted, setSubmitted] = useState(false);
useEffect(() => {
  if (submitted) sendData(form);
}, [submitted]);

// ✅ Xử lý trong event handler
const handleSubmit = () => {
  sendData(form);
};

// ❌ Không cần effect để transform data cho render
useEffect(() => {
  setFilteredList(items.filter((i) => i.active));
}, [items]);

// ✅ Tính trong render (hoặc useMemo nếu tốn kém)
const filteredList = items.filter((i) => i.active);
// hoặc
const filteredList = useMemo(
  () => items.filter((i) => i.active),
  [items]
);
```

Chỉ dùng useEffect cho **side effects thực sự**: fetch data, subscriptions, DOM manipulation, timers.

### Câu 5: AbortController dùng trong useEffect như thế nào?
**Đáp án:**
AbortController dùng để **hủy HTTP request** khi component unmount hoặc khi dependency thay đổi (userId mới trước khi request cũ hoàn thành). Đây là cách tốt hơn so với dùng biến `cancelled` flag.

```jsx
useEffect(() => {
  const controller = new AbortController();

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        signal: controller.signal, // Gắn signal vào request
      });
      const data = await response.json();
      setUser(data);
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request bị hủy — KHÔNG phải lỗi thật
        // Không setState, không log error
        return;
      }
      // Lỗi thật — xử lý
      setError(error.message);
    }
  };

  fetchUser();

  // Cleanup: hủy request khi userId thay đổi hoặc unmount
  return () => controller.abort();
}, [userId]);

// Tại sao cần AbortController?
// 1. userId thay đổi nhanh: "1" → "2" → "3"
//    Không abort: request userId=1 có thể resolve SAU userId=3
//    → setUser(data của user 1) → UI hiển thị sai!
// 2. Component unmount: request hoàn thành → setState trên unmounted component
//    → Warning: "Can't perform a React state update on an unmounted component"

// So sánh với cancelled flag:
// AbortController: hủy request thật sự (tiết kiệm bandwidth)
// cancelled flag: request vẫn chạy, chỉ bỏ qua kết quả
```
