---
sidebar_position: 23
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
