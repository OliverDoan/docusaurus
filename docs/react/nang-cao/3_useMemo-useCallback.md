---
sidebar_position: 3
title: "useMemo & useCallback"
---

# useMemo & useCallback

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
