---
sidebar_position: 4
title: "4. Database Design"
---

# Database Design

> *Schema là thứ khó sửa nhất trong hệ thống — code refactor được trong một sprint, schema sai thì trả nợ hàng năm. Interviewer hỏi nhóm này để xem bạn có tư duy dài hạn không.*
>
> 📌 *Các chủ đề Normalization vs Denormalization, UUID vs Auto-increment, ON DELETE CASCADE, ACID, Isolation levels, Optimistic vs Pessimistic locking đã có bài chi tiết tại [SQL & Databases — Transactions & Design](../09-sql/3_transactions-design.md).*

:::note[Ghi nhớ nhanh]

- ⭐ **ER Diagram = Entity (bảng) + Attribute (cột) + Relationship (cardinality 1-1, 1-N, N-N)**.
- ⭐ **N-N không tồn tại trực tiếp** trong relational DB — luôn tách thành **bảng trung gian (junction table)** chứa 2 FK.
- **Triển khai vật lý** — 1-1: FK + `UNIQUE`; 1-N: FK đặt ở phía "nhiều" (`orders.user_id`). Ký pháp crow's foot.
- **Junction table thường tiến hoá thành entity thật** khi cần thêm attribute (grade, enrolled_at).

:::

---

## Câu 1: ER Diagram là gì? Các thành phần chính? `[Intermediate]`

### Câu hỏi

> ER Diagram là gì? Các thành phần chính gồm những gì? Em mô tả cách thể hiện quan hệ 1-1, 1-N, N-N và cách chuyển N-N thành bảng?

### Giải thích lý thuyết

**ER Diagram (Entity-Relationship Diagram)** là sơ đồ mô hình hoá dữ liệu ở mức khái niệm/logic **trước khi viết DDL** — công cụ giao tiếp giữa dev, BA và stakeholder về cấu trúc dữ liệu.

Ba thành phần chính:

1. **Entity** — đối tượng cần lưu (User, Order, Product) → thành **bảng**. Có *weak entity*: tồn tại phụ thuộc entity khác (OrderItem không có nghĩa nếu thiếu Order).
2. **Attribute** — thuộc tính của entity → thành **cột**; trong đó có **key attribute** (primary key — định danh duy nhất), composite attribute (address gồm street, city), derived attribute (age tính từ birthdate — thường không lưu).
3. **Relationship** — liên kết giữa entity, kèm **cardinality**:

| Quan hệ | Ví dụ | Triển khai vật lý |
| ------- | ----- | ------------------ |
| **1-1** | User — Profile | FK + `UNIQUE` ở một phía (hoặc gộp bảng) |
| **1-N** | User — Orders | FK đặt ở phía "nhiều" (orders.user_id) |
| **N-N** | Student — Course | **Bảng trung gian (junction table)** chứa 2 FK |

Ký pháp phổ biến hiện nay là **crow's foot**: vạch đơn = 1, "chân quạ" = nhiều, vòng tròn = optional (0). Quy tắc quan trọng nhất: **N-N không tồn tại trực tiếp trong relational DB** — luôn phải tách thành bảng trung gian, và bảng trung gian thường "tiến hoá" thành entity thật khi cần thêm attribute (Enrollment có thêm grade, enrolled_at).

### Code minh hoạ

```text
Crow's foot (Mermaid erDiagram):

USER ||--o| PROFILE : has          (1-1: mỗi user có 0..1 profile)
USER ||--o{ ORDER : places         (1-N: user có nhiều order)
STUDENT }o--o{ COURSE : enrolls    (N-N: phải tách junction table)
```

```sql
-- 1-1: FK + UNIQUE
CREATE TABLE profiles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),  -- UNIQUE đảm bảo 1-1
  bio TEXT
);

-- 1-N: FK ở phía "nhiều"
CREATE TABLE orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  total NUMERIC(12,2) NOT NULL
);

-- N-N: junction table — thường tiến hoá thành entity thật
CREATE TABLE enrollments (
  student_id BIGINT NOT NULL REFERENCES students(id),
  course_id  BIGINT NOT NULL REFERENCES courses(id),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  grade NUMERIC(4,2),                       -- attribute riêng của quan hệ
  PRIMARY KEY (student_id, course_id)       -- chặn ghi danh trùng
);
```

### Đáp án mẫu

> "ERD là sơ đồ mô hình hoá dữ liệu trước khi viết DDL, gồm ba thành phần: **entity** thành bảng, **attribute** thành cột trong đó key attribute là primary key, và **relationship** với cardinality. Ký pháp em dùng là crow's foot: vạch đơn là một, chân quạ là nhiều, vòng tròn là optional. Triển khai vật lý: 1-1 dùng FK kèm UNIQUE; 1-N đặt FK ở phía nhiều; còn N-N thì không tồn tại trực tiếp trong relational DB — bắt buộc tách bảng trung gian chứa hai FK với composite primary key để chặn trùng. Kinh nghiệm của em: junction table thường tiến hoá thành entity thật — như Enrollment mọc thêm grade, enrolled_at — nên em đặt tên nó theo nghiệp vụ ngay từ đầu thay vì kiểu `student_course`. ERD với em là công cụ giao tiếp với BA và team trước khi code, rẻ hơn nhiều so với sửa schema sau này."

---

## Câu 2: Surrogate key và Natural key khác nhau như thế nào? `[Intermediate]`

### Câu hỏi

> Surrogate key và natural key là gì? Em chọn loại nào làm primary key và vì sao?

### Giải thích lý thuyết

- **Natural key**: key lấy từ **dữ liệu nghiệp vụ có thật** — email, số CCCD, mã ISBN, order code. Tự mang nghĩa.
- **Surrogate key**: key **nhân tạo do hệ thống sinh**, không mang nghĩa nghiệp vụ — auto-increment ID, UUID.

So sánh:

| Tiêu chí | Natural key | Surrogate key |
| -------- | ----------- | ------------- |
| Ý nghĩa | Tự giải thích, đỡ JOIN khi chỉ cần key | Vô nghĩa, cần JOIN để biết là gì |
| Tính ổn định | **Rủi ro lớn**: nghiệp vụ đổi (user đổi email, công ty đổi mã) → sửa PK + toàn bộ FK | Bất biến vĩnh viễn |
| Kích thước | Thường to (string) → index to, FK to | Nhỏ gọn (int/bigint) |
| Uniqueness | Do thế giới thực "hứa" — có thể vỡ (số điện thoại tái sử dụng) | Hệ thống đảm bảo |

Best practice phổ biến: **surrogate key làm PRIMARY KEY + natural key giữ ràng buộc UNIQUE** — được cả hai: PK ổn định, gọn cho FK/JOIN; nghiệp vụ vẫn được enforce không trùng. Lý do cốt lõi: PK bị "đóng băng" bởi mọi FK tham chiếu nó — thứ gì có khả năng **thay đổi theo nghiệp vụ** thì không được làm PK.

> Chọn loại surrogate nào (auto-increment vs UUID) — xem [bài tại 09-sql](../09-sql/3_transactions-design.md).

### Code minh hoạ

```sql
-- Best practice: surrogate PK + natural key UNIQUE
CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,  -- surrogate: bất biến, gọn
  email TEXT NOT NULL UNIQUE,                          -- natural: nghiệp vụ enforce
  citizen_id TEXT UNIQUE                               -- natural key khác cũng UNIQUE
);

-- Tại sao không lấy email làm PK? User đổi email:
-- PK = email → phải UPDATE users + orders + reviews + ... (mọi bảng có FK)
-- PK = id    → UPDATE 1 cột duy nhất ở 1 bảng
CREATE TABLE orders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id)  -- FK gọn, không bao giờ phải sửa
);
```

### Đáp án mẫu

> "Natural key lấy từ dữ liệu nghiệp vụ thật như email, mã số thuế; surrogate key do hệ thống sinh như auto-increment hay UUID, không mang nghĩa. Em luôn chọn **surrogate làm primary key** vì một lý do cốt lõi: PK bị đóng băng bởi mọi FK tham chiếu nó — natural key thì nghiệp vụ có thể đổi, user đổi email là phải cascade update khắp các bảng; chưa kể uniqueness của natural key do thế giới thực 'hứa' và lời hứa đó hay vỡ. Nhưng natural key không bị bỏ đi — nó thành **ràng buộc UNIQUE**: email vẫn không được trùng, chỉ là không gánh vai trò định danh quan hệ. Công thức của em: surrogate PK cho định danh kỹ thuật, natural key UNIQUE cho ràng buộc nghiệp vụ — được cả hai."

---

## Câu 3: Soft delete là gì? Ưu nhược điểm so với hard delete? `[Intermediate]`

### Câu hỏi

> Soft delete là gì? So với hard delete có ưu nhược điểm gì? Những cái bẫy khi triển khai soft delete?

### Giải thích lý thuyết

- **Hard delete**: `DELETE` thật — dữ liệu biến mất khỏi bảng.
- **Soft delete**: chỉ **đánh dấu đã xoá** (`deleted_at TIMESTAMPTZ NULL` — phổ biến nhất, vừa là cờ vừa là thời điểm) — mọi query nghiệp vụ phải lọc `WHERE deleted_at IS NULL`.

**Ưu điểm soft delete**: khôi phục được (xoá nhầm, user đổi ý); giữ **audit trail/compliance**; không vỡ tham chiếu — order cũ vẫn trỏ tới product đã "xoá"; phân tích được dữ liệu lịch sử.

**Nhược điểm và bẫy (phần ăn điểm):**

1. **Quên filter** — bug kinh điển: một query thiếu `deleted_at IS NULL` là data "ma" hiện về. Phải chặn hệ thống: view, ORM middleware/global scope, RLS — không trông vào kỷ luật từng dev.
2. **UNIQUE constraint vỡ**: user xoá account email `a@x.com` rồi đăng ký lại → `UNIQUE(email)` chặn vì row cũ còn đó. Fix bằng **partial unique index** (`WHERE deleted_at IS NULL`).
3. **FK cascade không chạy**: soft delete cha không tự soft delete con — phải tự xử lý ở application.
4. Bảng phình to, index kém hiệu quả dần; **GDPR right-to-erasure** yêu cầu xoá thật — soft delete không thoả.

Thiết kế trưởng thành: soft delete cho dữ liệu nghiệp vụ cần khôi phục/audit + **cron purge** xoá thật sau N ngày + hard delete (hoặc anonymize) cho yêu cầu GDPR.

### Code minh hoạ

```sql
ALTER TABLE products ADD COLUMN deleted_at TIMESTAMPTZ;  -- NULL = đang sống

-- "Xoá"
UPDATE products SET deleted_at = now() WHERE id = 42;

-- Bẫy UNIQUE: cho phép tái sử dụng email sau khi xoá account
CREATE UNIQUE INDEX users_email_active_uq
  ON users (email) WHERE deleted_at IS NULL;   -- partial unique index

-- Partial index cho query thường nhật — index chỉ chứa row sống, nhỏ và nhanh
CREATE INDEX products_active_idx ON products (category_id) WHERE deleted_at IS NULL;
```

```ts
// Prisma: chặn "quên filter" bằng client extension — áp toàn cục, không trông kỷ luật
const prisma = new PrismaClient().$extends({
  query: {
    product: {
      async findMany({ args, query }) {
        args.where = { deleted_at: null, ...args.where };
        return query(args);
      },
      async delete({ args }) {        // chuyển delete thành update
        return prisma.product.update({
          where: args.where,
          data: { deleted_at: new Date() },
        });
      },
    },
  },
});
```

### Đáp án mẫu

> "Soft delete là đánh dấu xoá bằng cột `deleted_at` thay vì DELETE thật — được khôi phục, giữ audit trail, và không vỡ tham chiếu như order trỏ tới product đã xoá. Nhưng em luôn nói rõ ba cái bẫy: **một**, quên filter `deleted_at IS NULL` ở một query là data ma hiện về — phải chặn bằng ORM middleware hoặc view chứ không trông kỷ luật từng người; **hai**, UNIQUE constraint vỡ — user xoá account rồi đăng ký lại email cũ bị chặn, fix bằng partial unique index `WHERE deleted_at IS NULL`; **ba**, cascade không chạy — soft delete cha phải tự lo con ở tầng app. Thiết kế của em: soft delete cho dữ liệu nghiệp vụ cần khôi phục, kèm cron purge xoá thật sau N ngày để bảng không phình vô hạn, và với GDPR right-to-erasure thì bắt buộc hard delete hoặc anonymize — soft delete không thoả yêu cầu pháp lý đó."

---

## Câu 4: Database migration là gì? Tại sao quan trọng trong CI/CD? `[Senior]`

### Câu hỏi

> Database migration là gì? Tại sao quan trọng trong CI/CD? Em làm sao để migrate không downtime trên hệ thống đang chạy?

### Giải thích lý thuyết

**Migration** là thay đổi schema được viết thành **file code có thứ tự, versioned trong git** — schema tiến hoá có kiểm soát thay vì ai đó chạy `ALTER TABLE` tay trên production. Tool: Prisma Migrate, Flyway, Liquibase, golang-migrate, Alembic... — đều có bảng tracking (`_prisma_migrations`, `flyway_schema_history`) ghi migration nào đã chạy, đảm bảo **mỗi migration chạy đúng một lần, đúng thứ tự**.

Vì sao sống còn với CI/CD:

- **Tái lập được**: môi trường mới (dev, CI, staging) dựng schema giống hệt prod từ lịch sử migration.
- **Review được**: schema change đi qua PR như code.
- **Deploy tự động**: pipeline chạy `migrate deploy` trước khi rollout app — schema và code luôn tương thích theo thứ tự kiểm soát.

**Zero-downtime migration** — phần phân biệt Senior: trong rolling deploy, **code cũ và code mới chạy song song** một lúc → mọi migration phải **backward-compatible** với code cũ. Pattern **expand → migrate → contract**:

1. **Expand**: thêm cột/bảng mới (nullable hoặc có default) — code cũ không biết cũng không sao.
2. **Migrate**: deploy code ghi cả hai nơi / đọc nơi mới; backfill dữ liệu cũ **theo batch**.
3. **Contract**: khi không còn gì dùng cột cũ → migration xoá nó (nhiều ngày sau).

Bẫy khoá bảng kinh điển (PostgreSQL): thêm cột `NOT NULL` không default lên bảng lớn, `CREATE INDEX` không `CONCURRENTLY` — khoá ghi cả bảng nhiều phút.

### Code minh hoạ

```sql
-- ZERO-DOWNTIME: đổi tên cột "name" → "full_name" KHÔNG làm theo cách này:
-- ALTER TABLE users RENAME COLUMN name TO full_name;  ← code cũ chết ngay lập tức

-- Mà theo expand → migrate → contract:

-- Migration 1 (expand): thêm cột mới, code cũ không ảnh hưởng
ALTER TABLE users ADD COLUMN full_name TEXT;

-- Deploy code: ghi cả 2 cột, đọc full_name (fallback name)

-- Migration 2 (backfill theo batch, không khoá bảng lâu)
UPDATE users SET full_name = name
WHERE full_name IS NULL AND id IN (
  SELECT id FROM users WHERE full_name IS NULL LIMIT 10000
); -- lặp đến khi 0 row

-- Migration 3 (contract — vài ngày sau, khi không code nào còn đọc "name")
ALTER TABLE users DROP COLUMN name;
```

```sql
-- Index trên bảng lớn đang chạy: CONCURRENTLY để không khoá ghi
CREATE INDEX CONCURRENTLY idx_orders_user ON orders (user_id);
```

```yaml
# CI/CD: migration chạy trước khi rollout app
deploy:
  steps:
    - run: npx prisma migrate deploy   # apply migration đã commit, idempotent
    - run: kubectl rollout restart deployment/api
```

### Đáp án mẫu

> "Migration là schema change viết thành file versioned trong git, có bảng tracking đảm bảo chạy đúng một lần đúng thứ tự. Nó sống còn với CI/CD vì ba điều: môi trường nào cũng dựng lại được schema giống prod, schema change được review qua PR như code, và pipeline tự chạy `migrate deploy` trước khi rollout nên schema với code luôn tương thích. Phần khó là **zero-downtime**: rolling deploy nghĩa là code cũ và mới chạy song song, nên mọi migration phải backward-compatible — em theo pattern expand-migrate-contract: thêm cột mới trước, deploy code ghi cả hai nơi và backfill theo batch, vài ngày sau mới xoá cột cũ; tuyệt đối không rename trực tiếp. Hai bẫy khoá bảng em luôn check khi review migration: thêm NOT NULL không default lên bảng lớn, và CREATE INDEX thiếu CONCURRENTLY — cả hai đều khoá ghi production nhiều phút."

---

## Câu 5: Database transactions — cách sử dụng trong SQL? `[Intermediate]`

### Câu hỏi

> Transaction là gì? Em trình bày cách dùng BEGIN/COMMIT/ROLLBACK và SAVEPOINT trong SQL, kèm những lưu ý thực tế?

### Giải thích lý thuyết

**Transaction** là nhóm các thao tác được thực thi như **một đơn vị nguyên tử**: hoặc tất cả thành công (`COMMIT`), hoặc tất cả bị huỷ (`ROLLBACK`) — không có trạng thái "xong một nửa". Đây là chữ A (Atomicity) trong ACID; ví dụ chuẩn: chuyển tiền — trừ tài khoản A và cộng tài khoản B phải cùng thành công hoặc cùng thất bại.

Cú pháp:

- `BEGIN` (hoặc `START TRANSACTION`) → các lệnh → `COMMIT` / `ROLLBACK`.
- **`SAVEPOINT`**: điểm đánh dấu giữa transaction — `ROLLBACK TO SAVEPOINT x` huỷ phần sau savepoint nhưng **giữ phần trước**, transaction tiếp tục được. Hữu ích cho bước optional trong flow dài.
- Mặc định client thường chạy **autocommit** — mỗi lệnh là một transaction riêng; `BEGIN` là cách gom nhiều lệnh.

Lưu ý thực tế (phân biệt người đã dùng thật):

- **Transaction phải NGẮN**: lock giữ đến khi commit/rollback — transaction dài chặn writer khác, gây deadlock. Tuyệt đối không chờ I/O ngoài (gọi API, chờ user) giữa transaction.
- PostgreSQL: lệnh lỗi giữa transaction → toàn transaction vào trạng thái **aborted**, mọi lệnh sau bị từ chối đến khi `ROLLBACK` (khác MySQL).
- **Deadlock**: hai transaction khoá chéo tài nguyên — DB tự chọn một nạn nhân để kill; phòng bằng cách **mọi nơi cập nhật nhiều row theo cùng một thứ tự** (vd: luôn theo id tăng dần).

> ACID chi tiết và Isolation levels: xem [bài tại 09-sql](../09-sql/3_transactions-design.md). Transaction trong Prisma: xem [bài ORM](./3_orm.md).

### Code minh hoạ

```sql
-- Chuyển tiền: ví dụ chuẩn của atomicity
BEGIN;

UPDATE accounts SET balance = balance - 500000 WHERE id = 1;
UPDATE accounts SET balance = balance + 500000 WHERE id = 2;

-- Kiểm tra invariant trước khi chốt
SELECT balance FROM accounts WHERE id = 1;  -- nếu âm → ROLLBACK

COMMIT;  -- cả 2 update cùng visible với transaction khác tại thời điểm này

-- SAVEPOINT: bước optional thất bại không huỷ cả flow
BEGIN;
INSERT INTO orders (user_id, total) VALUES (42, 990000);

SAVEPOINT before_voucher;
UPDATE vouchers SET used = used + 1 WHERE code = 'SALE50' AND used < quota;
-- voucher hết quota / lỗi → chỉ huỷ phần voucher:
ROLLBACK TO SAVEPOINT before_voucher;

COMMIT;  -- order vẫn được tạo

-- Chống deadlock: cập nhật nhiều row theo thứ tự thống nhất
UPDATE accounts SET balance = balance - 100
WHERE id IN (1, 2)  -- mọi code path đều khoá theo id tăng dần
ORDER BY id;        -- (với SELECT ... FOR UPDATE thì ORDER BY id rồi update)
```

### Đáp án mẫu

> "Transaction gom nhiều thao tác thành một đơn vị nguyên tử — COMMIT thì tất cả cùng có hiệu lực, ROLLBACK thì như chưa từng xảy ra, không có trạng thái nửa vời; ví dụ chuẩn là chuyển tiền. Cú pháp là BEGIN, các lệnh, rồi COMMIT hoặc ROLLBACK; thêm SAVEPOINT cho bước optional — rollback về savepoint huỷ phần sau nhưng giữ phần trước, như voucher hết quota thì huỷ riêng phần voucher mà order vẫn tạo được. Ba lưu ý thực chiến của em: transaction phải **ngắn** — lock giữ đến commit nên không bao giờ chờ API ngoài giữa chừng; PostgreSQL khi một lệnh lỗi là cả transaction aborted, phải ROLLBACK mới đi tiếp — khác MySQL; và chống deadlock bằng quy ước mọi code path cập nhật nhiều row theo cùng thứ tự id. Isolation level và locking là phần mở rộng tự nhiên của câu này — em có thể đi tiếp nếu anh/chị muốn."
