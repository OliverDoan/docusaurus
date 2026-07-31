---
sidebar_position: 5
title: "5. Query Optimization"
---

# Query Optimization

Tối ưu truy vấn là kỹ năng quan trọng giúp ứng dụng chạy nhanh và chịu tải tốt khi dữ liệu lớn dần. Một câu query viết cẩu thả có thể khiến database phải làm việc gấp nhiều lần cần thiết. Bài này chỉ ra các vấn đề thường gặp như N+1, cách thêm index, chỉ lấy fields cần thiết, phân trang và dùng connection pooling.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Tránh N+1 bằng eager loading** — thay vì query DB trong vòng lặp, gộp thành 1 query với `populate` (Mongoose) hoặc `include` (Prisma).
- **Indexing** — thêm index cho cột hay dùng để lọc/join/sắp xếp để tránh full scan; dùng `EXPLAIN ANALYZE` để phát hiện.
- **Select chỉ field cần thiết** — tránh `SELECT *`, dùng `select` để giảm dữ liệu tải về.
- **Pagination** — luôn phân trang danh sách lớn bằng limit/offset (`skip`/`take`) hoặc cursor.
- **Connection pooling** — tái sử dụng kết nối (Prisma tự quản lý, cấu hình qua `connection_limit`) để chịu tải tốt hơn.

:::

---

## Mục lục

- [Vì sao cần tối ưu query?](#vì-sao-cần-tối-ưu-query)
- [N+1 Problem](#n1-problem)
- [Indexing](#indexing)
- [Select chỉ fields cần thiết](#select-chỉ-fields-cần-thiết)
- [Pagination](#pagination)
- [Connection Pooling](#connection-pooling)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao cần tối ưu query?

**Vấn đề:** Lúc ít dữ liệu, query nào cũng nhanh nên dễ bỏ qua. Nhưng khi bảng lớn lên (hàng triệu dòng) thì query bắt đầu chậm: thiếu index → database quét toàn bảng (full scan); lặp query trong vòng lặp (N+1); `SELECT *` tải về thừa dữ liệu; thiếu phân trang nên lấy hết bảng một lúc. App chậm dần, DB nghẽn.

```js
// Bảng nhỏ: nhanh — bảng lớn: chậm dần
const users = await User.find(); // SELECT * — tải hết mọi cột
for (const user of users) {
  const posts = await Post.find({ authorId: user.id }); // N+1: 1 query / user
}
// Cột authorId không có index -> mỗi lần lọc quét toàn bảng Post (full scan)
```

**Giải pháp:** Thêm `INDEX` đúng cột dùng để lọc/join/sắp xếp; tránh N+1 bằng eager loading (join/populate); dùng `EXPLAIN`/`ANALYZE` để đọc kế hoạch thực thi và phát hiện full scan; chỉ chọn cột cần dùng; phân trang bằng limit/offset hoặc cursor.

```sql
-- Thêm index cho cột hay lọc / sắp xếp
CREATE INDEX idx_post_author ON post (author_id);

-- Đọc kế hoạch thực thi để tìm full scan
EXPLAIN ANALYZE SELECT id, title FROM post WHERE author_id = 42 LIMIT 20;
```

```js
// Gộp N+1 thành 1 query bằng eager loading
const users = await User.find().populate('posts');

// Chỉ chọn cột cần + phân trang
const posts = await prisma.post.findMany({
  select: { id: true, title: true },
  take: 20,
  skip: 0,
});
```

:::tip[Dùng thực tế]

- Trang danh sách load chậm: thêm index cho cột ở `WHERE`/`ORDER BY` để bỏ full scan.
- Vòng lặp gọi DB cho từng phần tử: gộp N+1 thành 1 query bằng join/eager loading.
- Query nghi ngờ chậm: chạy `EXPLAIN ANALYZE` để xem có full scan hay không.
- Danh sách lớn (log, đơn hàng): luôn phân trang (limit/offset hoặc cursor), không lấy hết một lần.

:::

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
