---
sidebar_position: 2
title: "2. PostgreSQL title: "PostgreSQL & Prisma" Prisma"
---

# PostgreSQL & Prisma

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
