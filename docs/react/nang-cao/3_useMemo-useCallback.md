---
sidebar_position: 3
title: "3. useMemo & useCallback"
---

# useMemo & useCallback


---

## Mục lục

- [Vấn đề: Tính toán lại không cần thiết](#vấn-đề-tính-toán-lại-không-cần-thiết)
- [useMemo](#usememo)
- [useCallback](#usecallback)
- [Khi nào nên dùng?](#khi-nào-nên-dùng)
- [Kết hợp với React.memo](#kết-hợp-với-reactmemo)
- [Quy tắc vàng](#quy-tắc-vàng)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vấn đề: Tính toán lại không cần thiết

Mỗi lần component re-render, tất cả code trong function body chạy lại — kể cả tính toán nặng và function definitions:

```tsx
function ProductList({ products, filter }: Props) {
  // Chạy lại MỖI LẦN render, dù products và filter không đổi
  const filtered = products.filter((p) => p.category === filter);
  const sorted = filtered.sort((a, b) => a.price - b.price);

  // Function mới mỗi render
  const handleClick = (id: string) => {
    console.log(id);
  };

  return <List items={sorted} onClick={handleClick} />;
}
```

## useMemo

Cache kết quả tính toán, chỉ tính lại khi dependencies thay đổi:

```tsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

### Ví dụ

```tsx
function ProductList({ products, filter }: Props) {
  // Chỉ tính lại khi products hoặc filter thay đổi
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.category === filter)
      .sort((a, b) => a.price - b.price);
  }, [products, filter]);

  return (
    <ul>
      {filteredProducts.map((product) => (
        <li key={product.id}>{product.name} - ${product.price}</li>
      ))}
    </ul>
  );
}
```

## useCallback

Cache function definition, chỉ tạo function mới khi dependencies thay đổi:

```tsx
const memoizedFn = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

`useCallback(fn, deps)` tương đương `useMemo(() => fn, deps)`.

### Ví dụ

```tsx
function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);

  // Không tạo function mới mỗi render
  const handleDelete = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []); // [] vì dùng updater function, không phụ thuộc todos

  const handleToggle = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }, []);

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      ))}
    </ul>
  );
}
```

## Khi nào nên dùng?

### Nên dùng useMemo

- Tính toán **nặng** (filter/sort/map trên danh sách lớn)
- Tạo object/array truyền vào `useEffect` dependency
- Giá trị truyền vào component con đã wrap `React.memo`

### Nên dùng useCallback

- Function truyền vào component con đã wrap `React.memo`
- Function truyền vào `useEffect` dependency
- Function dùng trong custom hook cần stable reference

### KHÔNG nên dùng

```tsx
// ❌ Tính toán nhẹ — overhead của useMemo lớn hơn lợi ích
const fullName = useMemo(() => `${first} ${last}`, [first, last]);
// ✅ Tính trực tiếp
const fullName = `${first} ${last}`;

// ❌ useCallback cho function không truyền xuống component con memo
const handleClick = useCallback(() => setOpen(true), []);
// ✅ Inline function đủ tốt
const handleClick = () => setOpen(true);
```

## Kết hợp với React.memo

`useMemo`/`useCallback` có ý nghĩa nhất khi kết hợp với `React.memo`:

```tsx
// Component con — chỉ re-render khi props thay đổi
const TodoItem = memo(function TodoItem({
  todo,
  onDelete,
}: {
  todo: Todo;
  onDelete: (id: string) => void;
}) {
  return (
    <li>
      {todo.text}
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </li>
  );
});

// Component cha
function TodoList({ todos }: { todos: Todo[] }) {
  // useCallback để onDelete stable → TodoItem không re-render thừa
  const handleDelete = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onDelete={handleDelete} />
      ))}
    </ul>
  );
}
```

## Quy tắc vàng

1. **Đo trước, optimize sau** — Dùng React DevTools Profiler xác định component nào chậm
2. **Không premature optimization** — useMemo/useCallback thêm complexity
3. Nếu component render nhanh (~1ms), optimization không cần thiết
4. Focus vào: danh sách dài, tính toán nặng, component tree sâu

---

## Câu hỏi phỏng vấn

### Câu 1: useMemo vs useCallback khác gì nhau?
**Đáp án:**

- **useMemo** cache **kết quả** của một phép tính (giá trị).
- **useCallback** cache **function definition** (tham chiếu hàm).

Thực tế, `useCallback(fn, deps)` tương đương `useMemo(() => fn, deps)`.

```tsx
// useMemo — cache GIÁ TRỊ (kết quả tính toán)
const sortedList = useMemo(() => {
  return items.sort((a, b) => a.price - b.price);
}, [items]);

// useCallback — cache HÀM (function reference)
const handleDelete = useCallback((id: string) => {
  setItems((prev) => prev.filter((item) => item.id !== id));
}, []);

// useCallback tương đương:
const handleDelete = useMemo(() => {
  return (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };
}, []);
```

### Câu 2: Khi nào KHÔNG nên dùng useMemo/useCallback?
**Đáp án:**

Không nên dùng khi:

1. **Tính toán nhẹ** — overhead của useMemo (so sánh deps, cache) lớn hơn lợi ích.
2. **Function không truyền xuống memo component** — useCallback không có tác dụng nếu component con không dùng React.memo.
3. **Props thay đổi mỗi render** — memo check luôn fail, thêm overhead vô ích.

```tsx
// ❌ Tính toán nhẹ — KHÔNG cần useMemo
const fullName = useMemo(() => `${first} ${last}`, [first, last]);
// ✅ Tính trực tiếp
const fullName = `${first} ${last}`;

// ❌ useCallback cho function không truyền xuống memo component
const handleClick = useCallback(() => setOpen(true), []);
// ✅ Inline function đủ tốt
const handleClick = () => setOpen(true);

// ❌ useMemo với primitive value
const doubled = useMemo(() => count * 2, [count]);
// ✅ Phép tính đơn giản, tính trực tiếp
const doubled = count * 2;
```

### Câu 3: useMemo kết hợp React.memo thế nào?
**Đáp án:**

`React.memo` ngăn component re-render khi props không đổi (shallow comparison). `useMemo`/`useCallback` đảm bảo props truyền xuống có **stable reference**, giúp `React.memo` hoạt động hiệu quả:

```tsx
// Component con — wrap React.memo
const TodoItem = memo(function TodoItem({
  todo,
  onDelete,
}: {
  todo: Todo;
  onDelete: (id: string) => void;
}) {
  return (
    <li>
      {todo.text}
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </li>
  );
});

// Component cha
function TodoList({ todos }: { todos: Todo[] }) {
  // useCallback để onDelete có stable reference
  // → TodoItem không re-render khi cha re-render
  const handleDelete = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Nếu KHÔNG dùng useCallback:
  // handleDelete là function MỚI mỗi render
  // → React.memo so sánh thấy khác → TodoItem re-render thừa

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onDelete={handleDelete} />
      ))}
    </ul>
  );
}
```

### Câu 4: Premature optimization là gì?
**Đáp án:**

Premature optimization (tối ưu sớm) là việc optimize **trước khi biết có vấn đề performance thực sự**. Với useMemo/useCallback, premature optimization gây ra:

1. **Code phức tạp hơn** — khó đọc, khó maintain.
2. **Overhead thêm** — React phải lưu cache, so sánh dependencies mỗi render.
3. **False sense of security** — tưởng đã optimize nhưng thực tế không cải thiện gì.

```tsx
// ❌ Premature optimization — memo KHẮP NƠI
function App() {
  const title = useMemo(() => 'Hello World', []);          // Không cần
  const handleClick = useCallback(() => alert('hi'), []);  // Không cần
  const style = useMemo(() => ({ color: 'red' }), []);     // Không cần

  return <h1 style={style} onClick={handleClick}>{title}</h1>;
}

// ✅ Đo trước, optimize sau
// Bước 1: Viết code bình thường
// Bước 2: Dùng React DevTools Profiler → tìm component chậm
// Bước 3: Chỉ optimize component thực sự chậm
// Bước 4: Đo lại để xác nhận cải thiện
```

**Quy tắc:** "Measure first, optimize second." Nếu component render dưới ~1ms, optimization không cần thiết.
