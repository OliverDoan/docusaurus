---
sidebar_position: 2
title: "2. Data Sources: REST, GraphQL, Database, ORM"
---

# Data Sources: REST, GraphQL, Database, ORM

**Data source** (nguồn dữ liệu) là nơi ứng dụng lấy dữ liệu để hiển thị. Bài này giới thiệu các nguồn phổ biến: **REST API** (giao tiếp qua các endpoint URL theo chuẩn HTTP), **GraphQL** (ngôn ngữ truy vấn cho phép lấy đúng dữ liệu cần), **database** (cơ sở dữ liệu — kết nối trực tiếp) và **ORM** (object-relational mapping — thư viện ánh xạ bảng dữ liệu thành đối tượng code, ví dụ Prisma, Drizzle). Người mới sẽ nắm được khi nào nên dùng nguồn nào trong Next.js.

---

## Mục lục

- [REST API](#rest-api)
- [GraphQL](#graphql)
- [Database trực tiếp](#database-trực-tiếp)
- [ORM: Prisma, Drizzle](#orm-prisma-drizzle)
- [Lựa chọn theo project](#lựa-chọn-theo-project)

---

## REST API

Cách phổ biến nhất — fetch từ external API:

```tsx
async function getUsers() {
  const res = await fetch("https://api.example.com/users", {
    headers: { Authorization: `Bearer ${process.env.API_KEY}` },
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default async function UsersPage() {
  const users = await getUsers();
  return <UserList users={users} />;
}
```

**Pattern wrapper**:

```ts
// lib/api.ts
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${process.env.API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.API_KEY}`,
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }

  return res.json();
}
```

```ts
// Dùng
const users = await api<User[]>("/users");
const user = await api<User>(`/users/${id}`);
```

---

## GraphQL

**Apollo Client** (lib phổ biến):

```bash
npm install @apollo/client graphql
```

```tsx
// app/users/page.tsx
import { getApolloClient } from "@/lib/apollo";
import { gql } from "@apollo/client";

const USERS_QUERY = gql`
  query GetUsers {
    users { id name email }
  }
`;

export default async function UsersPage() {
  const { data } = await getApolloClient().query({ query: USERS_QUERY });
  return <UserList users={data.users} />;
}
```

**urql** — alternative nhẹ hơn.

**graphql-request** — minimal client:

```bash
npm install graphql-request
```

```ts
import { GraphQLClient, gql } from "graphql-request";

const client = new GraphQLClient(process.env.GRAPHQL_URL!, {
  headers: { Authorization: `Bearer ${token}` },
});

const data = await client.request(gql`{ users { id name } }`);
```

---

## Database trực tiếp

Server Components có thể truy cập DB **không qua API**:

```tsx
import { sql } from "@vercel/postgres";

export default async function UsersPage() {
  const { rows: users } = await sql`SELECT * FROM users`;
  return <UserList users={users} />;
}
```

**Vercel Postgres** (Neon-backed) — HTTP-based, work Edge Runtime.

Tương tự **Turso (LibSQL)**, **PlanetScale** — DB serverless HTTP-based.

:::info[Phân tích]

**Database driver trên Edge vs Node**:

| Database | Driver Edge-compat | Driver Node only |
|----------|-------------------|------------------|
| Postgres | `@vercel/postgres`, `@neondatabase/serverless` | `pg` (node-postgres) |
| MySQL | `@planetscale/database`, `mysql2` (Node 18+) | `mysql2` |
| SQLite | `@libsql/client` (Turso) | `better-sqlite3` |
| MongoDB | `@vercel/edge-config` | `mongodb` |

**Edge compat** — driver dùng HTTP/fetch thay TCP. Lợi:

- Chạy trong middleware.
- Cold start nhanh.
- Deploy lên Edge Runtime.

Trade-off:

- HTTP overhead per query.
- Không support transaction phức tạp như TCP driver.

Pattern thực dụng:

- **Page** (Node runtime): dùng ORM thường (Prisma, Drizzle với pg).
- **Middleware/Edge route**: dùng HTTP-based driver.

:::

---

## ORM: Prisma, Drizzle

### Prisma

[Prisma](https://www.prisma.io) — ORM phổ biến, schema-first.

```bash
npm install prisma @prisma/client
npx prisma init
```

**Schema**:

```prisma
// prisma/schema.prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String?
  posts Post[]
}

model Post {
  id       Int     @id @default(autoincrement())
  title    String
  authorId Int
  author   User    @relation(fields: [authorId], references: [id])
}
```

**Generate client + migrate**:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

**Dùng**:

```tsx
import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: { posts: true },
  });
  return <UserList users={users} />;
}
```

```ts
// lib/prisma.ts — singleton
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Drizzle

[Drizzle ORM](https://orm.drizzle.team) — SQL-like, type-safe, lightweight.

```bash
npm install drizzle-orm pg
npm install -D drizzle-kit
```

**Schema**:

```ts
// db/schema.ts
import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name"),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  authorId: integer("author_id").references(() => users.id),
});
```

**Query**:

```ts
import { db } from "@/lib/db";
import { users, posts } from "@/db/schema";
import { eq } from "drizzle-orm";

const allUsers = await db.select().from(users);

const user = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: { posts: true },
});
```

:::info[Phân tích]

**Prisma vs Drizzle:**

| | Prisma | Drizzle |
|--|--------|---------|
| Schema | `.prisma` DSL | TypeScript |
| Migration | Tự động sinh | Tự viết hoặc generate |
| Type safety | **Generated** | **Inferred** từ schema |
| Bundle size | Lớn (~5MB) | **Nhỏ** (~50KB) |
| Edge support | Cần Prisma Accelerate | **Native** |
| Maturity | Cao | Mới hơn (2022) |
| Learning curve | Trung bình | Thấp (giống SQL) |

**Drizzle thắng cho 2026** trong nhiều project mới:

- Edge-compat tốt hơn.
- Bundle gọn.
- SQL-like → ai biết SQL viết được.
- TypeScript inferred — không cần codegen.

**Prisma vẫn mạnh** cho:

- DX (devtools, studio).
- Team không biết SQL.
- Migration tự động.

Cả hai đều **production-ready**. Trend: Drizzle tăng nhanh.

:::

---

## Lựa chọn theo project

```
Project mới TypeScript-first?
├─ Có backend riêng (Java/Go/Python) → REST/GraphQL fetch
├─ Full-stack TS → tRPC (type-safe API)
└─ Edge + serverless DB → Drizzle + Neon/Turso

Existing project?
├─ Đã có Prisma → giữ, không migrate
├─ Đã có GraphQL → urql / Apollo
└─ Direct SQL → kysely hoặc raw query

Cần realtime?
├─ Supabase (Postgres + realtime)
└─ Firebase Firestore
```

:::tip[Mẹo]

**Pattern repository cho code dễ test**:

```ts
// lib/repositories/user.ts
import { db } from "@/lib/db";
import { users } from "@/db/schema";

export async function findUser(id: number) {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}

export async function createUser(data: NewUser) {
  return db.insert(users).values(data).returning();
}
```

```ts
// app/users/page.tsx
import { findUser } from "@/lib/repositories/user";

export default async function Page({ params }) {
  const user = await findUser(parseInt((await params).id));
}
```

Lợi ích:

- Component không biết về DB.
- Test với mock repository dễ.
- Migrate ORM sau ít touch component.
- Cache, validation tập trung trong repository.

:::

:::warning[Cần lưu ý]

**Đừng expose DB credentials trong client**:

```tsx
"use client";

// SAI — process.env.DATABASE_URL không bao giờ available client
import { db } from "@/lib/db";
const users = await db.select().from(usersTable);
```

ENV variable không có `NEXT_PUBLIC_*` prefix chỉ **available server-side**.
DB client chỉ chạy Server Component / Server Action / Route Handler.

Compile time Next.js warning, runtime error. Pattern đúng:

- **Server**: query trực tiếp DB.
- **Client**: fetch qua API route hoặc Server Action.

:::
