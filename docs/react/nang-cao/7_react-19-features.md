---
sidebar_position: 7
title: "React 19"
---

# React 19 — Tính năng mới

## Tổng quan

React 19 (stable 2024) mang đến nhiều cải tiến lớn, đặc biệt cho Server Components và form handling.

## Actions

Actions đơn giản hóa việc xử lý form mutations với pending states, errors, và optimistic updates:

### useTransition cho async operations

```tsx
function UpdateNameForm() {
  const [name, setName] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await updateName(name);
      if (result.error) {
        // Handle error
      }
    });
  };

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={handleSubmit} disabled={isPending}>
        {isPending ? 'Updating...' : 'Update'}
      </button>
    </div>
  );
}
```

### useActionState

Hook mới kết hợp state + action + pending:

```tsx
import { useActionState } from 'react';

function AddToCartForm({ itemId }: { itemId: string }) {
  const [message, formAction, isPending] = useActionState(
    async (previousState: string | null, formData: FormData) => {
      const result = await addToCart(itemId);
      if (result.success) {
        return 'Added to cart!';
      }
      return 'Failed to add to cart';
    },
    null // Initial state
  );

  return (
    <form action={formAction}>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Adding...' : 'Add to Cart'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
```

## useOptimistic

Hiển thị kết quả ngay lập tức (optimistic) trong khi chờ server response:

```tsx
import { useOptimistic } from 'react';

function MessageList({
  messages,
  sendMessage,
}: {
  messages: Message[];
  sendMessage: (text: string) => Promise<void>;
}) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (currentMessages, newMessage: string) => [
      ...currentMessages,
      { id: 'temp', text: newMessage, sending: true },
    ]
  );

  const handleSend = async (formData: FormData) => {
    const text = formData.get('message') as string;
    addOptimisticMessage(text); // Hiển thị ngay
    await sendMessage(text);    // Chờ server
  };

  return (
    <div>
      {optimisticMessages.map((msg) => (
        <p key={msg.id} style={{ opacity: msg.sending ? 0.5 : 1 }}>
          {msg.text}
        </p>
      ))}
      <form action={handleSend}>
        <input name="message" />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

## use() Hook

Đọc resources (Promises, Context) trong render:

```tsx
import { use } from 'react';

// Đọc Promise
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise); // Suspense handles loading
  return <h1>{user.name}</h1>;
}

// Đọc Context có điều kiện (useState/useContext không cho phép)
function StatusDisplay({ showTheme }: { showTheme: boolean }) {
  if (showTheme) {
    const theme = use(ThemeContext); // OK! use() cho phép gọi trong if
    return <p>Theme: {theme}</p>;
  }
  return <p>No theme</p>;
}
```

## ref as prop

Không cần `forwardRef` nữa — ref truyền trực tiếp qua props:

```tsx
// React 19: ref là prop bình thường
function CustomInput({ ref, ...props }: { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}

// Sử dụng
const inputRef = useRef<HTMLInputElement>(null);
<CustomInput ref={inputRef} />

// Trước React 19: cần forwardRef
const CustomInput = forwardRef<HTMLInputElement>((props, ref) => {
  return <input ref={ref} {...props} />;
});
```

## Document Metadata

Render `<title>`, `<meta>`, `<link>` trực tiếp trong component:

```tsx
function BlogPost({ post }: { post: Post }) {
  return (
    <article>
      <title>{post.title}</title>
      <meta name="description" content={post.summary} />
      <meta property="og:title" content={post.title} />
      <link rel="canonical" href={`/blog/${post.slug}`} />

      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
// React tự động hoist vào <head>
```

## Stylesheets

React 19 quản lý thứ tự load CSS:

```tsx
function Component() {
  return (
    <>
      <link rel="stylesheet" href="/styles/base.css" precedence="default" />
      <link rel="stylesheet" href="/styles/theme.css" precedence="high" />
      <div className="themed-content">...</div>
    </>
  );
}
// React đảm bảo CSS load trước khi hiển thị component
```

## Cải tiến khác

### Cleanup cho ref callbacks

```tsx
// React 19: ref callback trả về cleanup function
<div ref={(node) => {
  // Setup
  node.addEventListener('click', handler);

  // Cleanup (mới trong React 19)
  return () => {
    node.removeEventListener('click', handler);
  };
}} />
```

### Hỗ trợ Custom Elements (Web Components)

```tsx
// React 19 hỗ trợ đầy đủ custom elements
<my-component
  custom-attr="value"
  onMyEvent={handleEvent}
/>
```

### Cải thiện Error Reporting

React 19 cung cấp thông tin lỗi tốt hơn, bao gồm diffs cho hydration mismatches.

---

## Câu hỏi phỏng vấn

### Câu 1: useActionState là gì và dùng thế nào?
**Đáp án:**

`useActionState` là hook mới trong React 19, kết hợp **state + action + pending status** trong một hook. Đặc biệt hữu ích cho form handling:

```tsx
import { useActionState } from 'react';

function AddToCartForm({ itemId }: { itemId: string }) {
  // [state, formAction, isPending]
  const [message, formAction, isPending] = useActionState(
    async (previousState: string | null, formData: FormData) => {
      // previousState: state trước đó (lần đầu là initialState)
      // formData: dữ liệu form tự động thu thập
      const result = await addToCart(itemId);
      if (result.success) {
        return 'Added to cart!';
      }
      return 'Failed to add';
    },
    null // Initial state
  );

  return (
    <form action={formAction}>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Adding...' : 'Add to Cart'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
```

**Lợi ích so với cách cũ:** Không cần tự quản lý `isLoading`, `error`, `result` bằng nhiều useState riêng lẻ. Một hook xử lý tất cả.

### Câu 2: useOptimistic hook giải quyết vấn đề gì?
**Đáp án:**

`useOptimistic` giải quyết vấn đề **UI chờ server response** bằng cách hiển thị kết quả dự kiến **ngay lập tức** (optimistic update), sau đó cập nhật lại khi server phản hồi:

```tsx
import { useOptimistic } from 'react';

function MessageList({ messages, sendMessage }: Props) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages, // State thật từ server
    (currentMessages, newMessage: string) => [
      ...currentMessages,
      { id: 'temp', text: newMessage, sending: true }, // UI tạm
    ]
  );

  const handleSend = async (formData: FormData) => {
    const text = formData.get('message') as string;
    addOptimisticMessage(text); // Hiển thị NGAY (không chờ server)
    await sendMessage(text);    // Gửi lên server
    // Khi server trả về → messages prop update → optimistic state tự reset
  };

  return (
    <div>
      {optimisticMessages.map((msg) => (
        <p key={msg.id} style={{ opacity: msg.sending ? 0.5 : 1 }}>
          {msg.text}
        </p>
      ))}
      <form action={handleSend}>
        <input name="message" />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

**Vấn đề giải quyết:** User không phải chờ spinner/loading khi thực hiện action. UI phản hồi ngay lập tức, tạo trải nghiệm mượt mà hơn.

### Câu 3: use() hook khác useContext thế nào?
**Đáp án:**

`use()` là hook mới trong React 19 có thể đọc **Promises** và **Context**, với điểm khác biệt quan trọng: **gọi được trong điều kiện (if/else) và vòng lặp**, điều mà useContext không cho phép:

```tsx
import { use } from 'react';

// 1. Đọc Promise — kết hợp với Suspense
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise); // Suspense tự handle loading
  return <h1>{user.name}</h1>;
}

// 2. Đọc Context CÓ ĐIỀU KIỆN — useContext KHÔNG làm được
function StatusDisplay({ showTheme }: { showTheme: boolean }) {
  if (showTheme) {
    const theme = use(ThemeContext); // ✅ OK với use()
    return <p>Theme: {theme}</p>;
  }
  return <p>No theme</p>;
}

// ❌ useContext KHÔNG cho phép gọi trong if
function StatusDisplay({ showTheme }: { showTheme: boolean }) {
  if (showTheme) {
    const theme = useContext(ThemeContext); // ❌ Vi phạm Rules of Hooks!
  }
}
```

**Tóm tắt:** `use()` linh hoạt hơn useContext vì không bị ràng buộc bởi Rules of Hooks (phải gọi ở top level). Ngoài ra còn đọc được Promise.

### Câu 4: React 19 thay đổi gì về ref forwarding?
**Đáp án:**

React 19 cho phép truyền `ref` trực tiếp như **prop bình thường**, không cần `forwardRef` wrapper nữa:

```tsx
// ✅ React 19: ref là prop bình thường
function CustomInput({ ref, placeholder }: {
  ref?: React.Ref<HTMLInputElement>;
  placeholder?: string;
}) {
  return <input ref={ref} placeholder={placeholder} />;
}

// Sử dụng
const inputRef = useRef<HTMLInputElement>(null);
<CustomInput ref={inputRef} placeholder="Enter text..." />

// ❌ Trước React 19: phải dùng forwardRef
const CustomInput = forwardRef<HTMLInputElement, Props>((props, ref) => {
  return <input ref={ref} {...props} />;
});
```

**Lợi ích:**
- **Đơn giản hơn** — bớt một layer wrapper (forwardRef).
- **TypeScript dễ hơn** — ref là prop bình thường, type như prop khác.
- **Dễ đọc hơn** — component function nhận ref trực tiếp trong params.

`forwardRef` vẫn hoạt động nhưng sẽ deprecated trong tương lai.
