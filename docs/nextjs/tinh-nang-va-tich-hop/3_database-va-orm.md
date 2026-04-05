---
sidebar_position: 3
title: "Database & ORM"
---

# Database & ORM

## Kết nối database trong Next.js

Next.js là fullstack framework — bạn truy cập database trực tiếp từ Server Components, Server Actions, và Route Handlers mà không cần tạo API riêng.

### Các database phổ biến

| Database | Loại | Khi nào dùng |
|----------|------|-------------|
| **PostgreSQL** | SQL | Hầu hết ứng dụng, quan hệ phức tạp |
| **MySQL** | SQL | Ứng dụng truyền thống, WordPress ecosystem |
| **SQLite** | SQL (file) | Prototype, embedded, nhỏ gọn |
| **MongoDB** | NoSQL | Dữ liệu linh hoạt, schema-less |
| **Supabase** | PostgreSQL + BaaS | Muốn database + auth + storage sẵn |
| **PlanetScale** | MySQL (serverless) | Serverless, branching database |
| **Neon** | PostgreSQL (serverless) | PostgreSQL cho serverless deployment |

### ORM phổ biến

| ORM | Ưu điểm | Nhược điểm |
|-----|---------|------------|
| **Prisma** | Type-safe, migrations mạnh, phổ biến nhất | Bundle size lớn, query engine riêng |
| **Drizzle** | Nhẹ, gần SQL, edge-compatible | Ít tài liệu hơn Prisma |
| **Kysely** | Type-safe SQL query builder | Không có migrations built-in |

## Prisma ORM — Hướng dẫn chi tiết

Prisma là ORM phổ biến nhất cho TypeScript/Next.js. Nó cung cấp type-safe database access, migrations, và GUI để quản lý data.

### Setup Prisma

```bash
# Cài đặt Prisma
npm install prisma --save-dev
npm install @prisma/client

# Khởi tạo Prisma (tạo thư mục prisma/ và file schema)
npx prisma init
```

Lệnh `npx prisma init` tạo ra:

```
prisma/
└── schema.prisma    ← Định nghĩa database schema
.env                 ← Chứa DATABASE_URL
```

### Schema.prisma — Định nghĩa cấu trúc database

```prisma
// prisma/schema.prisma

// Cấu hình Prisma Client
generator client {
  provider = "prisma-client-js"
}

// Kết nối database
datasource db {
  provider = "postgresql"  // "mysql", "sqlite", "mongodb"
  url      = env("DATABASE_URL")
}

// ===== Models (tương ứng với tables trong database) =====

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  hashedPassword String?
  avatar        String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  posts         Post[]
  comments      Comment[]
  profile       Profile?

  @@map("users")  // Tên table trong database
}

model Profile {
  id        String  @id @default(cuid())
  bio       String?
  website   String?

  // Relation 1-1 với User
  userId    String  @unique
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model Post {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  content     String
  published   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relation N-1 với User
  authorId    String
  author      User      @relation(fields: [authorId], references: [id], onDelete: Cascade)

  // Relation 1-N với Comment
  comments    Comment[]

  // Relation M-N với Category
  categories  Category[]

  // Index cho tìm kiếm nhanh
  @@index([authorId])
  @@index([slug])
  @@map("posts")
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())

  // Relations
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@map("comments")
}

model Category {
  id    String @id @default(cuid())
  name  String @unique
  slug  String @unique

  // Relation M-N với Post (Prisma tự tạo join table)
  posts Post[]

  @@map("categories")
}

// Enum cho role
enum Role {
  USER
  MODERATOR
  ADMIN
}
```

### Migrations — Quản lý thay đổi database

```bash
# Tạo migration mới (so sánh schema hiện tại với database)
npx prisma migrate dev --name init
# Prisma tạo file SQL trong prisma/migrations/
# và tự động chạy migration + generate client

# Xem status các migrations
npx prisma migrate status

# Reset database (XÓA toàn bộ data!)
npx prisma migrate reset

# Áp dụng migrations cho production
npx prisma migrate deploy

# Tạo lại Prisma Client (sau khi thay đổi schema)
npx prisma generate

# Mở Prisma Studio — GUI quản lý data
npx prisma studio
```

### PrismaClient Singleton Pattern

Trong Next.js development, hot module replacement (HMR) tạo nhiều PrismaClient instances. Pattern singleton giải quyết vấn đề này.

```tsx
// lib/prisma.ts — Singleton PrismaClient

import { PrismaClient } from "@prisma/client";

// Khai báo biến global để giữ PrismaClient qua HMR
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Dùng instance cũ nếu có, tạo mới nếu không
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development"
    ? ["query", "error", "warn"]  // Log queries trong development
    : ["error"],                   // Chỉ log errors trong production
});

// Lưu instance vào global trong development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

:::warning
Nếu không dùng singleton pattern, mỗi lần hot reload sẽ tạo connection mới. Sau vài lần reload, bạn sẽ nhận lỗi: "Too many database connections".
:::

### CRUD Operations

#### Create — Tạo dữ liệu

```tsx
import { prisma } from "@/lib/prisma";

// Tạo 1 user
const user = await prisma.user.create({
  data: {
    name: "Nguyễn Văn A",
    email: "a@example.com",
    hashedPassword: await bcrypt.hash("password123", 12),
  },
});

// Tạo user kèm profile (nested create)
const userWithProfile = await prisma.user.create({
  data: {
    name: "Trần Thị B",
    email: "b@example.com",
    profile: {
      create: {
        bio: "Lập trình viên fullstack",
        website: "https://example.com",
      },
    },
  },
  include: {
    profile: true, // Trả về cả profile
  },
});

// Tạo nhiều records cùng lúc
const users = await prisma.user.createMany({
  data: [
    { name: "User 1", email: "user1@example.com" },
    { name: "User 2", email: "user2@example.com" },
    { name: "User 3", email: "user3@example.com" },
  ],
  skipDuplicates: true, // Bỏ qua nếu email đã tồn tại
});
```

#### Read — Đọc dữ liệu

```tsx
// Lấy 1 user theo ID
const user = await prisma.user.findUnique({
  where: { id: "clx..." },
});

// Lấy 1 user theo email
const userByEmail = await prisma.user.findUnique({
  where: { email: "a@example.com" },
});

// Lấy user đầu tiên thỏa điều kiện
const firstAdmin = await prisma.user.findFirst({
  where: { role: "ADMIN" },
});

// Lấy danh sách users với điều kiện phức tạp
const users = await prisma.user.findMany({
  where: {
    AND: [
      { role: "USER" },
      {
        OR: [
          { name: { contains: "Nguyễn", mode: "insensitive" } },
          { email: { endsWith: "@example.com" } },
        ],
      },
      { createdAt: { gte: new Date("2024-01-01") } },
    ],
  },
  orderBy: { createdAt: "desc" },   // Sắp xếp mới nhất trước
  skip: 0,                           // Bỏ qua N records (phân trang)
  take: 10,                          // Lấy 10 records
  select: {                          // Chỉ lấy các trường cần thiết
    id: true,
    name: true,
    email: true,
    _count: {                        // Đếm relations
      select: { posts: true },
    },
  },
});

// Đếm số lượng
const totalUsers = await prisma.user.count({
  where: { role: "USER" },
});

// Lấy user kèm posts và comments (include relations)
const userWithPosts = await prisma.user.findUnique({
  where: { id: "clx..." },
  include: {
    posts: {
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        comments: {
          take: 3,
          orderBy: { createdAt: "desc" },
        },
        categories: true,
      },
    },
    profile: true,
  },
});
```

#### Update — Cập nhật dữ liệu

```tsx
// Cập nhật 1 user
const updatedUser = await prisma.user.update({
  where: { id: "clx..." },
  data: {
    name: "Tên mới",
    role: "MODERATOR",
  },
});

// Cập nhật hoặc tạo mới (upsert)
const upsertedUser = await prisma.user.upsert({
  where: { email: "new@example.com" },
  update: { name: "Tên cập nhật" },        // Nếu đã tồn tại → update
  create: {                                  // Nếu chưa tồn tại → create
    name: "Người dùng mới",
    email: "new@example.com",
  },
});

// Cập nhật nhiều records
const updatedCount = await prisma.user.updateMany({
  where: { role: "USER" },
  data: { role: "MODERATOR" },
});
// updatedCount.count = số records đã cập nhật
```

#### Delete — Xóa dữ liệu

```tsx
// Xóa 1 user
const deletedUser = await prisma.user.delete({
  where: { id: "clx..." },
});

// Xóa nhiều users
const deletedCount = await prisma.user.deleteMany({
  where: {
    createdAt: { lt: new Date("2023-01-01") },
    posts: { none: {} }, // Chỉ xóa user không có post nào
  },
});
```

### Relations trong Prisma

```tsx
// ===== Tạo post kèm categories (M-N relation) =====
const post = await prisma.post.create({
  data: {
    title: "Hướng dẫn Next.js",
    slug: "huong-dan-nextjs",
    content: "Nội dung bài viết...",
    authorId: userId,
    categories: {
      // Kết nối với categories đã có
      connect: [
        { slug: "nextjs" },
        { slug: "react" },
      ],
    },
  },
  include: {
    author: true,
    categories: true,
  },
});

// ===== Cập nhật relations =====
const updatedPost = await prisma.post.update({
  where: { id: postId },
  data: {
    categories: {
      // Thêm category mới
      connect: { slug: "typescript" },
      // Xóa category cũ
      disconnect: { slug: "react" },
    },
  },
});

// ===== Transactions — nhiều operations trong 1 transaction =====
const [post, notification] = await prisma.$transaction([
  prisma.post.create({
    data: { title: "New Post", slug: "new-post", content: "...", authorId: userId },
  }),
  prisma.notification.create({
    data: { userId: adminId, message: "Bài viết mới được tạo" },
  }),
]);
// Nếu 1 operation fail → tất cả đều rollback
```

## Drizzle ORM — Alternative nhẹ hơn

Drizzle ORM nổi bật với bundle size nhỏ, gần SQL syntax, và tương thích edge runtime.

```bash
# Cài đặt Drizzle với PostgreSQL
npm install drizzle-orm pg
npm install drizzle-kit --save-dev
```

### Định nghĩa schema

```tsx
// db/schema.ts

import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enum
export const roleEnum = pgEnum("role", ["USER", "MODERATOR", "ADMIN"]);

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").default("USER"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Posts table
export const posts = pgTable("posts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  content: text("content").notNull(),
  published: boolean("published").default(false),
  authorId: text("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

### Query với Drizzle

```tsx
// db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// ===== CRUD Operations =====

// Lấy tất cả users
const allUsers = await db.select().from(schema.users);

// Lấy user theo email
const user = await db.query.users.findFirst({
  where: (users, { eq }) => eq(users.email, "a@example.com"),
  with: {
    posts: true, // Include relations
  },
});

// Tạo user mới
const newUser = await db.insert(schema.users).values({
  name: "Nguyễn Văn A",
  email: "a@example.com",
}).returning();

// Cập nhật
await db.update(schema.users)
  .set({ name: "Tên mới" })
  .where(eq(schema.users.id, userId));

// Xóa
await db.delete(schema.users)
  .where(eq(schema.users.id, userId));
```

## Database Connection Pooling (Serverless)

Trong môi trường serverless (Vercel, AWS Lambda...), mỗi function invocation có thể tạo connection mới. Connection pooling giúp tái sử dụng connections.

### Prisma với connection pooling

```bash
# .env.local

# Direct URL — cho migrations (kết nối trực tiếp)
DIRECT_DATABASE_URL="postgresql://user:pass@db.host:5432/mydb"

# Pooled URL — cho application (qua connection pooler)
DATABASE_URL="postgresql://user:pass@db.host:6543/mydb?pgbouncer=true"
```

```prisma
// prisma/schema.prisma

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")          // Pooled connection
  directUrl = env("DIRECT_DATABASE_URL")   // Direct connection (migrations)
}
```

### Prisma Accelerate (managed pooling)

```bash
# Cài đặt Prisma Accelerate extension
npm install @prisma/extension-accelerate
```

```tsx
// lib/prisma.ts — với Prisma Accelerate
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

export const prisma = new PrismaClient().$extends(withAccelerate());

// Dùng caching ở query level
const posts = await prisma.post.findMany({
  cacheStrategy: {
    ttl: 60,      // Cache 60 giây
    swr: 120,     // Stale-while-revalidate 120 giây
  },
});
```

## Sử dụng với Server Components và Server Actions

### Server Components — đọc data

```tsx
// app/posts/page.tsx — Server Component đọc data trực tiếp

import { prisma } from "@/lib/prisma";

export default async function PostsPage() {
  // Gọi database trực tiếp — không cần API
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: {
      author: {
        select: { name: true, avatar: true },
      },
      _count: {
        select: { comments: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <h1>Bài viết</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>Tác giả: {post.author.name}</p>
          <p>Bình luận: {post._count.comments}</p>
        </article>
      ))}
    </div>
  );
}
```

### Server Actions — ghi data

```tsx
// app/posts/new/page.tsx

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default function NewPostPage() {
  async function createPost(formData: FormData) {
    "use server";

    // Kiểm tra authentication
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Bạn cần đăng nhập");
    }

    // Validate input
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    if (!title?.trim() || !content?.trim()) {
      throw new Error("Tiêu đề và nội dung là bắt buộc");
    }

    // Tạo slug từ title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Tạo post trong database
    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        authorId: session.user.id,
      },
    });

    // Revalidate cache và redirect
    revalidatePath("/posts");
    redirect(`/posts/${post.slug}`);
  }

  return (
    <form action={createPost}>
      <input name="title" placeholder="Tiêu đề bài viết" required />
      <textarea name="content" placeholder="Nội dung..." required />
      <button type="submit">Đăng bài</button>
    </form>
  );
}
```

## Environment Variables cho Database URL

```bash
# .env.local — file này KHÔNG được commit vào git

# PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"

# MySQL
DATABASE_URL="mysql://username:password@localhost:3306/mydb"

# SQLite (cho development/prototype)
DATABASE_URL="file:./dev.db"

# Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Neon PostgreSQL (serverless)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

:::danger
**KHÔNG BAO GIỜ** commit DATABASE_URL vào git. Thêm `.env.local` vào `.gitignore`:

```bash
# .gitignore
.env
.env.local
.env.production
```
:::

## Lỗi thường gặp

### 1. "Too many database connections"

```tsx
// SAI — tạo PrismaClient mới mỗi lần import
// lib/prisma.ts
export const prisma = new PrismaClient(); // Mỗi HMR tạo instance mới!

// ĐÚNG — dùng singleton pattern (xem phần PrismaClient Singleton ở trên)
```

### 2. Quên chạy `prisma generate` sau khi thay đổi schema

```bash
# Sau khi sửa schema.prisma, PHẢI chạy:
npx prisma generate
# Nếu không, TypeScript types sẽ outdated

# Hoặc chạy migrate dev (đã bao gồm generate)
npx prisma migrate dev --name add_new_field
```

### 3. N+1 Query Problem

```tsx
// SAI — N+1 queries (1 query lấy posts + N queries lấy author)
const posts = await prisma.post.findMany();
for (const post of posts) {
  const author = await prisma.user.findUnique({
    where: { id: post.authorId },
  }); // Mỗi loop là 1 query!
}

// ĐÚNG — dùng include để eager load
const posts = await prisma.post.findMany({
  include: {
    author: true, // Prisma tự join, chỉ 1-2 queries
  },
});
```

### 4. Gọi Prisma trong Client Component

```tsx
// SAI — Prisma không chạy được ở browser
"use client";
import { prisma } from "@/lib/prisma"; // ERROR!

export function PostList() {
  const posts = await prisma.post.findMany(); // Không thể!
}

// ĐÚNG — gọi Prisma trong Server Component hoặc Server Action
// Server Component (không có "use client")
export default async function PostList() {
  const posts = await prisma.post.findMany(); // OK!
}
```

### 5. Quên handle relation cascade khi xóa

```prisma
// SAI — xóa user nhưng posts vẫn tham chiếu đến user → lỗi foreign key
model Post {
  authorId String
  author   User @relation(fields: [authorId], references: [id])
}

// ĐÚNG — thêm onDelete cascade
model Post {
  authorId String
  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)
  // Khi xóa User → tự động xóa tất cả Posts của user đó
}
```

## Câu hỏi phỏng vấn

### Câu 1: Tại sao cần PrismaClient singleton pattern trong Next.js?

**Trả lời:**

Trong development, Next.js sử dụng Hot Module Replacement (HMR) — mỗi lần save file, module được reload. Nếu `new PrismaClient()` nằm ở top-level của module, mỗi lần HMR sẽ tạo instance mới, mở connection mới đến database. Sau nhiều lần reload, bạn sẽ hết connection pool.

Singleton pattern lưu PrismaClient instance vào `globalThis` (biến global không bị clear khi HMR). Mỗi lần import, nó kiểm tra xem đã có instance chưa — nếu có thì tái sử dụng, nếu chưa thì tạo mới. Trong production thì không cần vì không có HMR, nhưng pattern này vẫn đảm bảo chỉ có 1 instance.

### Câu 2: N+1 query problem là gì? Cách giải quyết trong Prisma?

**Trả lời:**

N+1 query xảy ra khi: lấy danh sách N records (1 query), rồi lặp qua từng record để lấy relation (N queries). Tổng cộng N+1 queries thay vì 1-2 queries.

Cách giải quyết trong Prisma:
- Dùng `include` để eager load relations — Prisma sẽ tự dùng JOIN hoặc batch query.
- Dùng `select` cùng nested `select` để chỉ lấy fields cần thiết.
- Với trường hợp phức tạp, dùng `$queryRaw` để viết custom SQL.

### Câu 3: Prisma và Drizzle khác nhau thế nào? Khi nào chọn cái nào?

**Trả lời:**

**Prisma:**
- Schema-first: định nghĩa schema trong `.prisma` file, generate TypeScript types.
- Migration system mạnh mẽ, Prisma Studio GUI.
- Bundle size lớn (query engine riêng), không chạy được ở edge runtime (trừ khi dùng Accelerate/Data Proxy).
- Chọn khi: cần DX tốt nhất, project phức tạp, team nhiều người.

**Drizzle:**
- Code-first: định nghĩa schema bằng TypeScript, gần SQL syntax hơn.
- Bundle size nhỏ, chạy được ở edge runtime.
- Ít abstraction hơn — bạn hiểu SQL sẽ dùng tốt hơn.
- Chọn khi: cần performance tối đa, deploy trên edge (Cloudflare Workers, Vercel Edge), team quen SQL.

### Câu 4: Connection pooling quan trọng thế nào trong serverless?

**Trả lời:**

Serverless functions (Vercel, AWS Lambda) có đặc điểm: mỗi invocation có thể tạo connection mới, và nhiều functions chạy đồng thời. Nếu không có connection pooling, 100 concurrent requests có thể tạo 100 database connections, dễ vượt quá giới hạn database.

Connection pooler (PgBouncer, Prisma Accelerate, Supabase Pooler) đứng giữa application và database, quản lý pool connections. 100 requests có thể share 10-20 connections thực. Đây là **bắt buộc** cho production serverless deployments.

### Câu 5: Làm sao tối ưu database queries trong Next.js?

**Trả lời:**

1. **Select chỉ fields cần thiết** — dùng `select` thay vì lấy toàn bộ record.
2. **Eager load relations** — dùng `include` để tránh N+1.
3. **Pagination** — dùng `skip`/`take` thay vì lấy toàn bộ.
4. **Database indexes** — thêm `@@index` cho fields thường query.
5. **Caching** — dùng React `cache()` hoặc `unstable_cache` để cache kết quả.
6. **Parallel queries** — dùng `Promise.all()` cho các queries độc lập.
7. **Connection pooling** — bắt buộc cho serverless.
8. **Raw queries** — dùng `$queryRaw` cho complex queries mà ORM không tối ưu được.
