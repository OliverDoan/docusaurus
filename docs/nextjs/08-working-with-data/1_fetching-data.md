---
sidebar_position: 1
title: "1. Fetching Data"
---

# Fetching Data

---

## Mục lục

- [Server vs Client fetching](#server-vs-client-fetching)
- [Fetch trong Server Components](#fetch-trong-server-components)
- [Fetch trong Client Components](#fetch-trong-client-components)
- [Khi nào fetch ở đâu?](#khi-nào-fetch-ở-đâu)

---

## Server vs Client fetching

| | Server Components | Client Components |
|--|------------------|-------------------|
| Khi nào fetch | Lúc render server | Sau khi mount browser |
| API key/secret | **An toàn** (không lộ) | Phải proxy qua API |
| Database | **Trực tiếp** | Phải qua API |
| Loading state | Suspense | useState + useEffect |
| SEO content | **Có trong HTML** | Không (render sau) |
| Interaction | Không hot reload data | Re-fetch dễ |

---

## Fetch trong Server Components

**Mặc định trong App Router** — page là Server Component:

```tsx
// app/users/page.tsx
export default async function UsersPage() {
  const users = await fetch("https://api.example.com/users", {
    next: { revalidate: 60 },
  }).then(r => r.json());

  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}
```

**Truy cập DB trực tiếp**:

```tsx
import { db } from "@/lib/db";

export default async function UsersPage() {
  const users = await db.user.findMany();
  return /* ... */;
}
```

Không cần API route trung gian — Server Component **chạy server**.

**Parallel fetching**:

```tsx
async function Dashboard() {
  // Sequential — chậm
  const user = await fetchUser();
  const orders = await fetchOrders();
  const stats = await fetchStats();

  // Parallel — nhanh hơn
  const [user, orders, stats] = await Promise.all([
    fetchUser(),
    fetchOrders(),
    fetchStats(),
  ]);
}
```

:::info[Phân tích]

**Server Component có lợi thế**:

1. **Bundle size 0** — code data fetching không vào client JS.
2. **Database access** trực tiếp, không qua HTTP.
3. **Secret safe** — `process.env.API_KEY` không lộ.
4. **Streaming** — render dần từng phần qua Suspense.
5. **Memoization** — cùng `fetch` URL trong 1 request được dedupe.

```tsx
// Hai component cùng fetch URL → chỉ gọi API 1 lần
async function Header() {
  const user = await fetch("/api/user").then(r => r.json());
  return <p>Hi {user.name}</p>;
}

async function Profile() {
  const user = await fetch("/api/user").then(r => r.json()); // dedupe
  return <p>Email: {user.email}</p>;
}

// Cùng trong page → 1 HTTP call, share result
function Page() {
  return <><Header /><Profile /></>;
}
```

Đây là **React `cache()`** + Next.js fetch dedup built-in.

:::

---

## Fetch trong Client Components

Dùng khi:

- Data **thay đổi sau interaction** (filter, search).
- **Real-time** — polling, WebSocket.
- **User-specific** sau khi authenticate client-side.

```tsx
"use client";

import { useState, useEffect } from "react";

export default function UserDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then(r => r.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner />;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

**TanStack Query** (khuyến nghị) cho Client Component:

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";

export default function UserDashboard() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then(r => r.json()),
  });

  if (isLoading) return <Spinner />;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

TanStack Query lo: cache, refetch, retry, dedupe.

---

## Khi nào fetch ở đâu?

**Quy tắc 2026:**

```
Server Components (default):
- Page initial load.
- SEO content.
- Data từ DB.
- Server-only API (có secret).

Client Components ("use client"):
- Interaction-driven fetch (filter, search).
- Real-time (polling, WebSocket).
- Optimistic UI update.
- Cần useState/useEffect/hook.
```

:::tip[Mẹo]

**Pattern hybrid** — Server fetch initial + Client refresh:

```tsx
// app/users/page.tsx (Server Component)
export default async function UsersPage() {
  const initialUsers = await db.user.findMany(); // SSR/SSG initial

  return <UserListClient initialUsers={initialUsers} />;
}
```

```tsx
// app/users/UserListClient.tsx
"use client";

import { useQuery } from "@tanstack/react-query";

export default function UserListClient({ initialUsers }) {
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then(r => r.json()),
    initialData: initialUsers, // dùng server data làm initial
  });

  return /* ... */;
}
```

Lợi ích:

- Page load nhanh (Server initial).
- Sau đó client refresh tự do (TanStack Query manage).
- SEO + interaction đồng thời.

Pattern này phổ biến trong app vừa cần SEO vừa real-time (e-commerce
product listing, news feed).

:::

:::warning[Cần lưu ý]

**`fetch` extension trong Next.js** thay vì native:

```ts
fetch(url, {
  // Web standard
  method: "GET",
  headers: { ... },
  body: JSON.stringify({ ... }),

  // Next.js extension
  cache: "no-store" | "force-cache",
  next: {
    revalidate: 60,           // ISR
    tags: ["users"],          // tag để revalidateTag
  },
});
```

Next.js override `fetch` global → mọi `fetch` tự động có cache layer. Các
option `cache` và `next` chỉ work trong Server Components / Route Handler.

Trong Client Component, `fetch` là native — không có `next.revalidate`.

:::

:::info[Phân tích]

**Caching layers trong Next.js**:

```
Request → Fetch Cache → Server Cache (Memoization)
                ↓              ↓
        Data Cache       Full Route Cache
        (revalidate)     (per route)
                ↓
            Client Cache (Router Cache)
```

1. **Fetch Cache** — `fetch()` data cache theo URL.
2. **Memoization** — trong 1 render, cùng fetch chỉ chạy 1 lần.
3. **Data Cache** — persist giữa request, revalidate theo tag/path.
4. **Full Route Cache** — pre-rendered HTML.
5. **Router Cache** — client-side, navigation nhanh.

Đây là điểm phức tạp nhất App Router. Hiểu rõ giúp:

- Debug "tại sao data không update".
- Tối ưu performance.
- Quyết định revalidate strategy.

Sẽ học chi tiết ở phần Caching.

:::
