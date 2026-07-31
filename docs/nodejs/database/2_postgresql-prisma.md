---
sidebar_position: 2
title: "2. PostgreSQL & Prisma"
---

# PostgreSQL & Prisma

PostgreSQL là cơ sở dữ liệu quan hệ mạnh mẽ và phổ biến, còn Prisma là một ORM hiện đại giúp bạn làm việc với database bằng code an toàn kiểu (type-safe). Dùng Prisma, bạn định nghĩa schema một lần rồi tự sinh ra code truy vấn và migration, đỡ phải viết SQL thủ công. Bài này giới thiệu cách cài đặt, viết schema, chạy migration và thực hiện CRUD với Prisma.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Prisma là ORM type-safe** — query có autocomplete và bắt lỗi tên cột ngay lúc compile, tự tham số hoá nên chống SQL injection.
- **Schema-first** — khai báo model và quan hệ trong `schema.prisma`, Prisma sinh ra client và migration.
- **`prisma migrate dev`** — đổi model rồi chạy lệnh này để tạo migration tự động.
- **CRUD** — `create`, `findMany`, `findUnique`, `update`, `delete`; dùng `include` cho quan hệ và `select` cho field cụ thể.
- **`prisma studio`** — công cụ xem và sửa dữ liệu trực quan trong browser.

:::

---

## Mục lục

- [Vì sao dùng Prisma?](#vì-sao-dùng-prisma)
- [Prisma là gì?](#prisma-là-gì)
- [Cài đặt](#cài-đặt)
- [Schema](#schema)
- [Migration](#migration)
- [CRUD Operations](#crud-operations)
- [Filtering & Pagination](#filtering-pagination)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao dùng Prisma?

**Vấn đề:** Viết SQL dạng chuỗi thủ công rồi tự map kết quả sang object rất dễ sai cú pháp và **không type-safe** — gõ nhầm tên cột chỉ phát hiện lúc chạy. Nối chuỗi còn mở ra nguy cơ SQL injection, và mỗi lần đổi schema phải sửa SQL ở khắp nơi.

```js
// Tự viết SQL + tự map kết quả: dễ lỗi, không type-safe
const sql = `SELECT id, name, emial FROM users WHERE name = '${name}'`; // sai cột "emial" + nguy cơ SQL injection
const { rows } = await pool.query(sql);
const users = rows.map((r) => ({ id: r.id, name: r.name, email: r.emial })); // lỗi lúc chạy, không lúc compile
```

**Giải pháp:** Khai báo model trong `schema.prisma`, Prisma sinh ra client **type-safe**: có autocomplete, bắt lỗi ngay lúc compile, query bằng method đã tham số hoá (an toàn khỏi SQL injection), migration tự động theo schema và quan hệ khai báo rõ ràng.

```ts
// Query type-safe: tên cột sai sẽ báo lỗi lúc compile
const users = await prisma.user.findMany({
  where: { name: 'Alice' },
  select: { id: true, name: true, email: true },
});
```

:::tip[Dùng thực tế]
- **Query type-safe:** `prisma.user.findMany()` có autocomplete và bắt lỗi tên cột lúc compile.
- **Đổi schema an toàn:** sửa model rồi chạy `npx prisma migrate dev` để tạo migration tự động.
- **Quan hệ rõ ràng:** lấy kèm dữ liệu liên quan bằng `include: { posts: true }`.
- **Chống SQL injection:** mọi tham số được Prisma tự tham số hoá, không nối chuỗi.
:::

## Prisma là gì?

Prisma là **ORM** hiện đại cho Node.js/TypeScript, hỗ trợ PostgreSQL, MySQL, SQLite, MongoDB.

## Cài đặt

```bash
npm install prisma @prisma/client
npx prisma init
```

## Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
}
```

## Migration

```bash
# Tạo migration từ schema
npx prisma migrate dev --name init

# Xem database trong browser
npx prisma studio
```

## CRUD Operations

```js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create
const user = await prisma.user.create({
  data: { name: 'Alice', email: 'alice@example.com' },
});

// Read
const users = await prisma.user.findMany();
const user = await prisma.user.findUnique({ where: { email: 'alice@example.com' } });

// Read with relations
const userWithPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true },
});

// Update
const updated = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Alice Updated' },
});

// Delete
await prisma.user.delete({ where: { id: 1 } });
```

## Filtering & Pagination

```js
const users = await prisma.user.findMany({
  where: {
    name: { contains: 'alice', mode: 'insensitive' },
    createdAt: { gte: new Date('2024-01-01') },
  },
  orderBy: { createdAt: 'desc' },
  skip: 0,
  take: 10,
  select: { id: true, name: true, email: true },
});
```

## Tóm tắt

- Prisma cung cấp type-safe database access
- Schema-first approach với auto-migration
- `include` cho relations, `select` cho fields cụ thể
- Prisma Studio để xem data trực quan
