---
sidebar_position: 4
title: "4. Database Migrations"
---

# Database Migrations


---

## Mục lục

- [Migration là gì?](#migration-là-gì)
- [Prisma Migrations](#prisma-migrations)
- [Knex.js Migrations](#knexjs-migrations)
- [Best Practices](#best-practices)
- [Tóm tắt](#tóm-tắt)

---

## Migration là gì?

Migration là cách quản lý thay đổi schema database theo phiên bản — giống git cho database.

## Prisma Migrations

```bash
# Tạo migration mới
npx prisma migrate dev --name add-user-avatar

# Áp dụng migration (production)
npx prisma migrate deploy

# Reset database (xoá tất cả data!)
npx prisma migrate reset

# Xem trạng thái migrations
npx prisma migrate status
```

### Workflow

1. Thay đổi `schema.prisma`
2. Chạy `npx prisma migrate dev --name descriptive-name`
3. Prisma tự tạo SQL migration file
4. Migration được áp dụng tự động

```prisma
// Thêm field mới
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  avatar    String?  // Thêm field này
  bio       String   @default("")  // Thêm với default value
}
```

## Knex.js Migrations

Nếu không dùng Prisma, Knex.js là lựa chọn phổ biến:

```bash
npm install knex pg
npx knex init
```

```js
// migrations/20240101_create_users.js
exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').unique().notNullable();
    table.timestamps(true, true); // created_at, updated_at
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
```

```bash
# Chạy migrations
npx knex migrate:latest

# Rollback
npx knex migrate:rollback
```

## Best Practices

1. **Mỗi migration làm một việc** — dễ rollback
2. **Đặt tên rõ ràng** — `add-user-avatar`, `create-orders-table`
3. **Luôn commit migration files** vào git
4. **Test migration trên staging** trước production
5. **Backup database** trước khi chạy migration trên production

## Tóm tắt

- Migrations quản lý schema changes theo version
- Prisma tự generate SQL, Knex.js viết thủ công
- Luôn test trước trên staging
- Commit migration files vào git
