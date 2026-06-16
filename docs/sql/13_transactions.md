---
sidebar_position: 13
title: "13. Transactions — Giao dịch"
---

# Transactions — Giao dịch

Transaction (giao dịch) là một nhóm câu lệnh SQL được thực thi theo nguyên tắc "tất cả hoặc không gì cả": hoặc mọi thao tác đều thành công, hoặc tất cả bị hủy về trạng thái ban đầu. Nhờ vậy dữ liệu không bao giờ rơi vào trạng thái nửa vời, ví dụ chuyển tiền mà trừ một bên nhưng chưa cộng bên kia. Bài này giải thích bốn thuộc tính ACID, các mức cô lập, SAVEPOINT, và cả hiện tượng deadlock.

---

## Mục lục

- [Vì sao cần transaction?](#vì-sao-cần-transaction)
- [Transaction là gì](#transaction-là-gì)
- [ACID — Bốn thuộc tính cốt lõi](#acid--bốn-thuộc-tính-cốt-lõi)
- [Transaction Isolation Levels](#transaction-isolation-levels)
- [Các hiện tượng xảy ra khi thiếu cô lập](#các-hiện-tượng-xảy-ra-khi-thiếu-cô-lập)
- [Bảng tổng hợp mức cô lập và hiện tượng](#bảng-tổng-hợp-mức-cô-lập-và-hiện-tượng)
- [Câu lệnh điều khiển Transaction](#câu-lệnh-điều-khiển-transaction)
- [SAVEPOINT — Điểm lưu giữa chừng](#savepoint--điểm-lưu-giữa-chừng)
- [Ví dụ thực tế đầy đủ](#ví-dụ-thực-tế-đầy-đủ)
- [Deadlock — Khoá chết](#deadlock--khoá-chết)

---

## Vì sao cần transaction?

**Vấn đề:**
Một nghiệp vụ thường gồm **nhiều bước phụ thuộc nhau**. Ví dụ chuyển tiền = trừ tài khoản A **và** cộng tài khoản B. Nếu chạy rời rạc, chỉ cần lỗi hoặc mất điện giữa chừng (đã trừ A nhưng chưa cộng B) là dữ liệu **SAI nghiêm trọng** — tiền biến mất. Ngoài ra, nhiều người thao tác đồng thời lên cùng dữ liệu gây tranh chấp, đọc nhầm số liệu nửa vời.

```sql
-- Chạy rời rạc, không bảo vệ
UPDATE accounts SET balance = balance - 500000 WHERE account_id = 'A';
-- ❌ Mất điện ngay tại đây → A đã bị trừ, B chưa được cộng → mất tiền
UPDATE accounts SET balance = balance + 500000 WHERE account_id = 'B';
```

**Giải pháp:**
**Transaction** gom nhiều lệnh thành **một đơn vị** "tất cả hoặc không gì cả", tuân theo tính chất **ACID**. Dùng `BEGIN` để mở, `COMMIT` để xác nhận, hoặc `ROLLBACK` để huỷ toàn bộ khi có lỗi. Mức cô lập (isolation level) kiểm soát việc đọc đồng thời để tránh tranh chấp.

```sql
-- Gom thành một transaction an toàn
BEGIN;

UPDATE accounts SET balance = balance - 500000 WHERE account_id = 'A';
UPDATE accounts SET balance = balance + 500000 WHERE account_id = 'B';

COMMIT;   -- Nếu mọi bước thành công
-- ROLLBACK;  -- Nếu bất kỳ bước nào lỗi → huỷ sạch, dữ liệu nguyên vẹn
```

:::tip[Dùng thực tế]
- **Chuyển tiền:** trừ tài khoản nguồn + cộng tài khoản đích phải đi cùng nhau.
- **Đặt hàng:** trừ tồn kho + tạo đơn — nếu hết hàng thì huỷ cả hai.
- **Ghi nhiều bảng liên quan:** tạo đơn + chi tiết đơn + lịch sử cùng lúc.
- **Rollback khi một bước lỗi:** một câu lệnh thất bại thì huỷ toàn bộ, không để dữ liệu nửa vời.
:::

---

## Transaction là gì

**Transaction** (giao dịch) là một đơn vị công việc logic bao gồm một hoặc nhiều câu lệnh SQL, được thực thi theo nguyên tắc **all-or-nothing**: hoặc tất cả các thao tác đều thành công và được ghi vào cơ sở dữ liệu, hoặc không có thao tác nào được áp dụng cả.

**Ví dụ kinh điển — chuyển tiền ngân hàng:**

Giả sử cần chuyển 500.000 VNĐ từ tài khoản A sang tài khoản B. Thao tác này gồm hai bước:

1. Trừ 500.000 VNĐ khỏi tài khoản A.
2. Cộng 500.000 VNĐ vào tài khoản B.

Nếu bước 1 thành công nhưng hệ thống gặp lỗi trước bước 2, tiền sẽ biến mất. Transaction đảm bảo: nếu bất kỳ bước nào thất bại, toàn bộ giao dịch bị huỷ và dữ liệu trở về trạng thái ban đầu.

```sql
BEGIN;

UPDATE accounts SET balance = balance - 500000 WHERE account_id = 'A';
UPDATE accounts SET balance = balance + 500000 WHERE account_id = 'B';

COMMIT;
```

:::info[Phân tích]
Nếu câu lệnh `UPDATE` thứ hai thất bại (ví dụ tài khoản B không tồn tại), chỉ cần gọi `ROLLBACK` là tài khoản A được phục hồi về số dư ban đầu — không mất tiền.
:::

---

## ACID — Bốn thuộc tính cốt lõi

Mọi hệ quản trị cơ sở dữ liệu quan hệ đều đảm bảo transaction tuân theo bốn thuộc tính ACID:

| Thuộc tính | Tên tiếng Việt | Ý nghĩa |
|---|---|---|
| **A**tomicity | Tính nguyên tử | Tất cả hoặc không có gì được ghi vào CSDL |
| **C**onsistency | Tính nhất quán | CSDL luôn chuyển từ trạng thái hợp lệ này sang trạng thái hợp lệ khác |
| **I**solation | Tính cô lập | Các transaction đồng thời không ảnh hưởng lẫn nhau |
| **D**urability | Tính bền vững | Sau khi COMMIT, dữ liệu được lưu vĩnh viễn dù hệ thống sập |

**Atomicity — Tính nguyên tử:**
Toàn bộ các thao tác trong transaction được coi là một khối không thể chia tách. Ví dụ: trừ tiền tài khoản A VÀ cộng tiền tài khoản B phải xảy ra đồng thời hoặc không xảy ra gì.

**Consistency — Tính nhất quán:**
Transaction chỉ được COMMIT khi CSDL vẫn đáp ứng tất cả ràng buộc (constraints, triggers, rules). Ví dụ: số dư tài khoản không được phép âm sau khi chuyển tiền nếu có ràng buộc `CHECK (balance >= 0)`.

**Isolation — Tính cô lập:**
Kết quả tạm thời của một transaction đang thực thi không được hiển thị cho các transaction khác cho đến khi COMMIT. Ví dụ: trong lúc đang xử lý chuyển tiền, một query khác không được thấy số dư tạm thời bị trừ ở A nhưng chưa cộng vào B.

**Durability — Tính bền vững:**
Sau khi `COMMIT` thành công, dữ liệu được ghi vào đĩa (transaction log). Dù máy chủ mất điện ngay sau đó, dữ liệu vẫn được phục hồi.

:::warning[Cần lưu ý]
ACID là cam kết của hệ thống RDBMS truyền thống (PostgreSQL, MySQL InnoDB, Oracle). Một số CSDL NoSQL hy sinh một phần ACID để đổi lấy hiệu năng và khả năng mở rộng.
:::

---

## Transaction Isolation Levels

SQL chuẩn định nghĩa bốn mức cô lập, từ yếu nhất đến mạnh nhất:

| Mức cô lập | Mô tả |
|---|---|
| **Read Uncommitted** | Đọc được dữ liệu chưa COMMIT của transaction khác |
| **Read Committed** | Chỉ đọc dữ liệu đã COMMIT — mặc định của PostgreSQL |
| **Repeatable Read** | Đọc lại cùng một hàng trong transaction luôn cho kết quả như nhau |
| **Serializable** | Cao nhất — các transaction thực thi như thể tuần tự, không đồng thời |

Cú pháp đặt mức cô lập trong PostgreSQL:

```sql
-- Đặt cho transaction hiện tại
BEGIN;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- ... các câu lệnh ...
COMMIT;

-- Đặt mặc định cho toàn session
SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

---

## Các hiện tượng xảy ra khi thiếu cô lập

**Dirty Read — Đọc bẩn:**
Transaction A đọc dữ liệu mà transaction B đã sửa nhưng chưa COMMIT. Nếu B sau đó ROLLBACK, A đang làm việc với dữ liệu không tồn tại.

```sql
-- Session B (chưa COMMIT)
BEGIN;
UPDATE products SET price = 0 WHERE id = 1;
-- Chưa COMMIT

-- Session A (mức Read Uncommitted) đọc price = 0 — dữ liệu sai!
SELECT price FROM products WHERE id = 1;
```

**Non-repeatable Read — Đọc không lặp lại:**
Transaction A đọc một hàng, sau đó transaction B sửa và COMMIT hàng đó. Khi A đọc lại cùng hàng đó, kết quả khác lần đầu.

**Phantom Read — Đọc ma:**
Transaction A thực hiện query trả về tập hàng, sau đó B INSERT thêm hàng mới thoả điều kiện đó và COMMIT. Khi A query lại, xuất hiện hàng "ma" chưa có lần trước.

---

## Bảng tổng hợp mức cô lập và hiện tượng

| Mức cô lập | Dirty Read | Non-repeatable Read | Phantom Read |
|---|---|---|---|
| Read Uncommitted | Có thể xảy ra | Có thể xảy ra | Có thể xảy ra |
| Read Committed | Ngăn chặn | Có thể xảy ra | Có thể xảy ra |
| Repeatable Read | Ngăn chặn | Ngăn chặn | Có thể xảy ra |
| Serializable | Ngăn chặn | Ngăn chặn | Ngăn chặn |

:::tip[Mẹo]
PostgreSQL mặc định dùng **Read Committed** — đủ tốt cho hầu hết ứng dụng web. Chỉ nâng lên **Serializable** khi cần tính đúng đắn tuyệt đối (ví dụ: hệ thống tài chính, đặt vé giới hạn số lượng).
:::

---

## Câu lệnh điều khiển Transaction

| Câu lệnh | Ý nghĩa |
|---|---|
| `BEGIN` hoặc `START TRANSACTION` | Bắt đầu một transaction mới |
| `COMMIT` | Xác nhận và lưu vĩnh viễn tất cả thay đổi |
| `ROLLBACK` | Huỷ toàn bộ thay đổi, trở về trạng thái trước khi BEGIN |

```sql
-- Hai cú pháp tương đương để bắt đầu transaction
BEGIN;
-- hoặc
START TRANSACTION;

-- Xác nhận thay đổi
COMMIT;

-- Huỷ toàn bộ thay đổi
ROLLBACK;
```

:::info[Phân tích]
Trong PostgreSQL, mỗi câu lệnh SQL đơn lẻ (không có `BEGIN` tường minh) tự động chạy trong một transaction ẩn và tự COMMIT ngay. Đây gọi là **autocommit mode**.
:::

---

## SAVEPOINT — Điểm lưu giữa chừng

`SAVEPOINT` cho phép đặt một điểm kiểm tra bên trong transaction. Nếu có lỗi, có thể ROLLBACK về điểm đó thay vì huỷ toàn bộ transaction.

```sql
BEGIN;

INSERT INTO orders (customer_id, total) VALUES (101, 250000);

SAVEPOINT after_order;

INSERT INTO order_items (order_id, product_id, qty) VALUES (1, 55, 2);
-- Giả sử product_id = 55 không tồn tại → lỗi foreign key

ROLLBACK TO SAVEPOINT after_order;
-- Chỉ huỷ INSERT order_items, order vẫn còn

INSERT INTO order_items (order_id, product_id, qty) VALUES (1, 10, 2);

COMMIT;
-- Lưu cả order lẫn order_items hợp lệ
```

```sql
-- Xoá một savepoint khi không còn cần
RELEASE SAVEPOINT after_order;
```

:::tip[Mẹo]
SAVEPOINT rất hữu ích trong các stored procedure hoặc ứng dụng cần xử lý lỗi từng phần mà không muốn mất toàn bộ công việc đã thực hiện.
:::

---

## Ví dụ thực tế đầy đủ

Kịch bản: hệ thống đặt hàng — tạo đơn hàng, trừ tồn kho, ghi lịch sử.

```sql
-- Tạo bảng ví dụ
CREATE TABLE accounts (
    account_id VARCHAR(10) PRIMARY KEY,
    owner      VARCHAR(100) NOT NULL,
    balance    NUMERIC(15, 2) NOT NULL CHECK (balance >= 0)
);

INSERT INTO accounts VALUES ('ACC001', 'Nguyễn Văn A', 2000000);
INSERT INTO accounts VALUES ('ACC002', 'Trần Thị B', 500000);

CREATE TABLE transfer_log (
    log_id      SERIAL PRIMARY KEY,
    from_acc    VARCHAR(10),
    to_acc      VARCHAR(10),
    amount      NUMERIC(15, 2),
    transferred_at TIMESTAMP DEFAULT NOW()
);
```

```sql
-- Transaction chuyển tiền hoàn chỉnh
BEGIN;

-- Kiểm tra số dư trước khi trừ
DO $$
DECLARE
    v_balance NUMERIC;
BEGIN
    SELECT balance INTO v_balance FROM accounts WHERE account_id = 'ACC001';

    IF v_balance < 300000 THEN
        RAISE EXCEPTION 'Số dư không đủ: % VNĐ', v_balance;
    END IF;
END $$;

-- Trừ tiền tài khoản nguồn
UPDATE accounts
SET balance = balance - 300000
WHERE account_id = 'ACC001';

-- Cộng tiền tài khoản đích
UPDATE accounts
SET balance = balance + 300000
WHERE account_id = 'ACC002';

-- Ghi lịch sử giao dịch
INSERT INTO transfer_log (from_acc, to_acc, amount)
VALUES ('ACC001', 'ACC002', 300000);

COMMIT;

-- Kiểm tra kết quả
SELECT account_id, owner, balance FROM accounts;
```

```sql
-- Ví dụ ROLLBACK khi chuyển tiền vượt số dư
BEGIN;

UPDATE accounts
SET balance = balance - 5000000  -- Vượt số dư, vi phạm CHECK constraint
WHERE account_id = 'ACC001';
-- PostgreSQL sẽ raise error do CHECK (balance >= 0)

-- Huỷ toàn bộ transaction
ROLLBACK;

-- Số dư ACC001 vẫn giữ nguyên
SELECT balance FROM accounts WHERE account_id = 'ACC001';
```

:::info[Phân tích]
Khi PostgreSQL gặp lỗi vi phạm constraint bên trong một transaction, trạng thái transaction chuyển sang **aborted**. Mọi câu lệnh tiếp theo trong block đó sẽ bị từ chối cho đến khi gọi `ROLLBACK`. Đây là lý do nên luôn bắt lỗi và ROLLBACK trong code ứng dụng.
:::

---

## Deadlock — Khoá chết

**Deadlock** xảy ra khi hai transaction chờ nhau giải phóng khoá, tạo thành vòng tròn chờ không bao giờ kết thúc.

```sql
-- Session 1
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE account_id = 'ACC001';
-- Session 1 giữ khoá ACC001, chờ khoá ACC002

-- Session 2 (đồng thời)
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE account_id = 'ACC002';
-- Session 2 giữ khoá ACC002, chờ khoá ACC001

-- Deadlock! PostgreSQL phát hiện và tự động ROLLBACK một trong hai session
```

:::warning[Cần lưu ý]
PostgreSQL tự động phát hiện deadlock và ROLLBACK transaction có chi phí thấp hơn. Ứng dụng phải bắt lỗi `ERROR: deadlock detected` (code 40P01) và thử lại transaction. Để phòng tránh deadlock, hãy luôn truy cập các bảng và hàng theo thứ tự nhất quán trong mọi transaction.
:::
