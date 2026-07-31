---
sidebar_position: 4
title: "4. Database Migrations"
---

# Database Migrations

Migration là cách quản lý thay đổi cấu trúc database theo từng phiên bản, giống như dùng git cho database vậy. Nhờ migration, cả team có thể đồng bộ schema và dễ dàng quay lui khi cần. Bài này giới thiệu cách dùng migration với Prisma và Knex.js, kèm các best practice quan trọng khi áp dụng lên production.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Migration = version control cho schema** — mỗi thay đổi là một file có version lưu trong git, áp dụng nhất quán trên mọi môi trường.
- **`up`/`down`** — `up` áp dụng thay đổi, `down` để rollback khi lỗi; DB tự ghi nhớ migration nào đã chạy.
- **Prisma** — `migrate dev` (tạo + áp dụng khi dev), `migrate deploy` (production), `migrate status` xem trạng thái.
- **Knex.js** — lựa chọn phổ biến khi không dùng Prisma, viết `exports.up`/`exports.down` thủ công.
- **Best practices** — mỗi migration làm một việc, đặt tên rõ ràng, commit vào git, test trên staging và backup trước khi chạy production.

:::

---

## Mục lục

- [Migration là gì?](#migration-là-gì)
- [Vì sao cần migration?](#vì-sao-cần-migration)
- [Prisma Migrations](#prisma-migrations)
- [Knex.js Migrations](#knexjs-migrations)
- [Best Practices](#best-practices)
- [Tóm tắt](#tóm-tắt)

---

## Migration là gì?

Migration là cách quản lý thay đổi schema database theo phiên bản — giống git cho database.

## Vì sao cần migration?

**Vấn đề:** Sửa schema thủ công bằng tay (chạy `ALTER TABLE` trực tiếp) trên từng môi trường (dev, staging, prod) và từng máy đồng nghiệp. Schema dễ lệch nhau, không ai chắc môi trường nào đang đúng, không rollback được, deploy hay gãy.

```sql
-- Mỗi người tự gõ tay trên DB của mình, không lưu ở đâu cả
ALTER TABLE users ADD COLUMN avatar VARCHAR(255);
-- Máy bạn chạy rồi, máy đồng nghiệp quên → schema lệch
-- Lên prod gõ sai/quên cột → app gãy, không lùi lại được
```

**Giải pháp:** Mỗi thay đổi schema là một file có version, lưu trong git. Áp dụng tuần tự (`up`) và lùi lại (`down`) một cách nhất quán trên mọi môi trường. DB tự ghi nhớ migration nào đã chạy nên không chạy trùng.

```bash
# File migration có version, commit vào git
# 20240101_add_user_avatar.js  (up: thêm cột, down: xoá cột)

npx knex migrate:latest    # áp dụng tuần tự các migration chưa chạy
npx knex migrate:rollback  # lùi lại khi lỗi
```

:::tip[Dùng thực tế]

- Thêm cột/bảng mới mà vẫn có version, ai cũng biết schema đang ở đâu.
- Đồng bộ schema giữa cả team: pull code về, chạy migrate là khớp ngay.
- Chạy migrate tự động trong pipeline CI/CD mỗi lần deploy.
- Rollback nhanh về trạng thái trước khi migration mới gây lỗi.

:::

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
