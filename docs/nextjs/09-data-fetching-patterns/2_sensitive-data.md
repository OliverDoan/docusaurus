---
sidebar_position: 2
title: "2. Sensitive Data và Server Actions"
---

# Sensitive Data và Server Actions

Dữ liệu nhạy cảm (**sensitive data**) là những thông tin bí mật như khóa API, mật khẩu, token mà tuyệt đối không được lộ ra phía trình duyệt. **Server Actions** (hàm chạy trên máy chủ) là cơ chế của Next.js cho phép bạn xử lý logic và truy cập dữ liệu ngay trên server mà không cần tự viết API riêng. Bài này hướng dẫn cách giữ thông tin bí mật ở phía server và tránh rò rỉ ra client khi gửi dữ liệu đi.

---

## Mục lục

- [Server-only data](#server-only-data)
- [Environment Variables](#environment-variables)
- [Server Actions](#server-actions)
- [Data leak prevention](#data-leak-prevention)

---

## Server-only data

Một số data **không bao giờ** được vào client bundle:

- Database credentials.
- API keys.
- User password, token.
- Internal user data (email khác user, role, balance).

**Pattern dùng `server-only` package**:

```bash
npm install server-only
```

```ts
// lib/db.ts
import "server-only"; // throw nếu import từ client

import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();
```

```tsx
"use client";

// SAI — sẽ build error
import { prisma } from "@/lib/db";
```

Bảo vệ compile-time — không thể vô tình expose.

---

## Environment Variables

Next.js phân loại env:

| Prefix | Available | Use case |
|--------|-----------|----------|
| `DATABASE_URL`, `API_KEY` | **Server only** | Secret |
| `NEXT_PUBLIC_*` | **Server + Client** | Public config |

```env
# .env.local
DATABASE_URL=postgresql://...
JWT_SECRET=...
STRIPE_SECRET_KEY=...

NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_GA_ID=G-XXXXX
```

```ts
// Server Component / API route — đọc được tất cả
const dbUrl = process.env.DATABASE_URL;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Client Component — chỉ NEXT_PUBLIC_*
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // ✓
const dbUrl = process.env.DATABASE_URL;          // undefined!
```

:::warning[Cần lưu ý]

**Đừng đặt secret trong `NEXT_PUBLIC_*`** — chúng được **inline vào client
bundle**. Bất kỳ ai mở DevTools đều thấy.

```env
# SAI — secret bị expose
NEXT_PUBLIC_STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_API_TOKEN=...

# ĐÚNG
STRIPE_SECRET_KEY=sk_live_...           # server only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_  # public OK
```

Stripe có **publishable key** (public OK) và **secret key** (server only)
— đừng nhầm.

:::

**Type-safe env với Zod**:

```ts
// env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  NEXT_PUBLIC_API_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

```ts
// lib/db.ts
import { env } from "@/env";
const db = new Client(env.DATABASE_URL); // type-safe
```

Validate at startup → nếu thiếu env, app fail ngay khi start.

---

## Server Actions

**Server Action** = function chạy trên server, gọi từ Client Component.

```tsx
// app/actions.ts
"use server";

import { db } from "@/lib/db";

export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  await db.user.create({ data: { name, email } });
}
```

**Gọi từ form**:

```tsx
"use client";

import { createUser } from "@/app/actions";

export default function CreateUserForm() {
  return (
    <form action={createUser}>
      <input name="name" />
      <input name="email" />
      <button type="submit">Create</button>
    </form>
  );
}
```

**Gọi từ JS** — sau button click, không qua form:

```tsx
"use client";

import { createUser } from "@/app/actions";

export default function Button() {
  const handleClick = async () => {
    const formData = new FormData();
    formData.append("name", "An");
    await createUser(formData);
  };

  return <button onClick={handleClick}>Create</button>;
}
```

:::info[Phân tích]

**Server Action thay thế cho API route trong nhiều case**:

| | API Route | Server Action |
|--|-----------|---------------|
| URL accessible | **Có** | Không (internal RPC) |
| Method | GET, POST, PUT, DELETE | POST only |
| Type-safe call | Khai báo thủ công | **Tự động** từ TS |
| Code split | Riêng | Cùng component file |
| Form `action` prop | Không | **Có** (native HTML) |
| Progressive enhancement | Không | **Có** (work no-JS) |
| Public API | **Có** | Không |

**Khi nào API Route, khi nào Server Action?**

| Use case | Dùng |
|----------|------|
| Form submit, button action | **Server Action** |
| Internal mutation, CRUD | **Server Action** |
| Public API cho mobile/third-party | API Route |
| Webhook (Stripe, GitHub) | API Route |
| OAuth callback | API Route |
| File upload phức tạp | API Route hoặc Action với FormData |

Server Action **đơn giản hơn API route** trong 90% case mutation internal.

:::

**Type-safe với Zod**:

```ts
"use server";

import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  const result = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!result.success) {
    return { error: result.error.flatten() };
  }

  await db.user.create({ data: result.data });
  return { success: true };
}
```

**Action với `useActionState`** (React 19):

```tsx
"use client";

import { useActionState } from "react";
import { createUser } from "./actions";

export default function Form() {
  const [state, formAction, isPending] = useActionState(createUser, null);

  return (
    <form action={formAction}>
      <input name="name" />
      {state?.error?.fieldErrors.name && (
        <p>{state.error.fieldErrors.name[0]}</p>
      )}
      <button disabled={isPending}>{isPending ? "..." : "Save"}</button>
    </form>
  );
}
```

---

## Data leak prevention

**1. Filter response từ Server Component**:

```tsx
// SAI — pass full user object
async function Page() {
  const user = await db.user.findUnique({ where: { id } });
  // user có: password hash, secret_token, internal_notes
  return <UserCard user={user} />; // hash + token vào client!
}

// ĐÚNG — chọn field public
async function Page() {
  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true }, // không password
  });
  return <UserCard user={user} />;
}
```

**2. Validate access trước query**:

```ts
"use server";

export async function deletePost(postId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const post = await db.post.findUnique({ where: { id: postId } });
  if (post.authorId !== session.userId) {
    throw new Error("Forbidden"); // không phải owner
  }

  await db.post.delete({ where: { id: postId } });
}
```

**3. `taint` API** (experimental) — đánh dấu data nhạy cảm:

```ts
import { experimental_taintObjectReference as taint } from "react";

async function getUser(id: string) {
  const user = await db.user.findUnique({ where: { id } });
  taint("Don't pass full user to client", user);
  return user;
}
```

Nếu vô tình pass `user` qua Server → Client boundary, React **throw**
tại build time.

:::tip[Mẹo]

**Quy tắc tổng quát cho data**:

1. **Default: server-only** — load DB trong Server Component.
2. **Whitelist field** trả về (Prisma `select`, Drizzle pick).
3. **Validate access** mọi mutation (Server Action / API route).
4. **`server-only` package** cho file chỉ server.
5. **Env không bao giờ có secret trong `NEXT_PUBLIC_*`**.
6. **Audit dependency** — đảm bảo lib không leak secret (key trong window).

Pattern này gọi là **"Server-first, opt-in client"** — mặc định an toàn.

:::

:::warning[Cần lưu ý]

**Server Action endpoint vẫn public** dù không URL visible:

- Next.js compile thành endpoint hash (vd `/_next/data/...`).
- Hash random nhưng predictable nếu attacker xem source.
- **Phải validate input** ngay đầu function — đừng dựa vào UI.

```ts
"use server";

export async function deleteUser(userId: string) {
  // Đừng giả định "chỉ admin gọi function này"
  const session = await getSession();
  if (session?.role !== "admin") {
    throw new Error("Forbidden"); // BẮT BUỘC check
  }

  await db.user.delete({ where: { id: userId } });
}
```

Nguyên tắc bảo mật: **never trust the client**.

:::
