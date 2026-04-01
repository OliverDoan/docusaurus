---
sidebar_position: 10
title: "useEffect"
---

# useEffect

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
