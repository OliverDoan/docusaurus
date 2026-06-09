---
sidebar_position: 5
title: "5. Query Optimization"
---

# Query Optimization

Tối ưu truy vấn là kỹ năng quan trọng giúp ứng dụng chạy nhanh và chịu tải tốt khi dữ liệu lớn dần. Một câu query viết cẩu thả có thể khiến database phải làm việc gấp nhiều lần cần thiết. Bài này chỉ ra các vấn đề thường gặp như N+1, cách thêm index, chỉ lấy fields cần thiết, phân trang và dùng connection pooling.

---

## Mục lục

- [N+1 Problem](#n1-problem)
- [Indexing](#indexing)
- [Select chỉ fields cần thiết](#select-chỉ-fields-cần-thiết)
- [Pagination](#pagination)
- [Connection Pooling](#connection-pooling)
- [Tóm tắt](#tóm-tắt)

---

## N+1 Problem

```js
// BAD: N+1 queries
const users = await User.find();
for (const user of users) {
  const posts = await Post.find({ authorId: user.id }); // N queries thêm!
}

// GOOD: Eager loading (Mongoose)
const users = await User.find().populate('posts');

// GOOD: Eager loading (Prisma)
const users = await prisma.user.findMany({
  include: { posts: true },
});
```

## Indexing

```prisma
// Prisma — thêm index
model Post {
  id       Int    @id @default(autoincrement())
  title    String
  authorId Int

  @@index([authorId])     // Single index
  @@index([authorId, createdAt]) // Compound index
}
```

```js
// Mongoose — thêm index
const postSchema = new mongoose.Schema({
  title: String,
  authorId: { type: mongoose.Schema.Types.ObjectId, index: true },
  tags: [String],
});

postSchema.index({ authorId: 1, createdAt: -1 }); // Compound index
```

## Select chỉ fields cần thiết

```js
// BAD: Lấy tất cả fields
const users = await prisma.user.findMany();

// GOOD: Chỉ lấy fields cần thiết
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true },
});
```

## Pagination

```js
// Offset pagination
async function getUsers(page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({ skip, take: limit, orderBy: { id: 'asc' } }),
    prisma.user.count(),
  ]);

  return {
    data: users,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

## Connection Pooling

```js
// Prisma tự quản lý connection pool
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=10',
    },
  },
});
```

## Tóm tắt

- Tránh N+1 bằng eager loading (`populate`, `include`)
- Thêm index cho fields thường query
- `select` chỉ fields cần thiết
- Pagination cho danh sách lớn
- Connection pooling cho performance
