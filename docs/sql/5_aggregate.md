---
sidebar_position: 5
title: "5. Truy vấn tổng hợp (Aggregate)"
---

# Truy vấn tổng hợp (Aggregate)

Truy vấn tổng hợp dùng các hàm như SUM, COUNT, AVG, MIN, MAX để gộp nhiều dòng dữ liệu thành một giá trị thống kê. Bài này giải thích aggregate function là gì, cách gom nhóm với GROUP BY, lọc nhóm bằng HAVING và những bẫy hay gặp (đặc biệt là cách xử lý NULL). Đây là nền tảng để làm báo cáo như tổng doanh thu, số đơn hàng hay điểm trung bình.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Hàm tổng hợp** — `SUM` / `COUNT` / `AVG` / `MIN` / `MAX` gộp nhiều dòng thành một giá trị, tính ngay tại DB thay vì kéo hết về ứng dụng.
- **`GROUP BY` gom nhóm** — mọi cột trong `SELECT` phải nằm trong `GROUP BY` hoặc được bao trong aggregate.
- **`WHERE` vs `HAVING`** — `WHERE` lọc dòng trước gom nhóm, `HAVING` lọc nhóm sau aggregate; ưu tiên `WHERE` để lọc sớm.
- ⭐ **NULL bị bỏ qua** trong mọi aggregate trừ `COUNT(*)` — dùng `COALESCE` nếu muốn coi `NULL` là 0.
- **Ba biến thể `COUNT`** — `COUNT(*)` đếm cả NULL, `COUNT(col)` bỏ NULL, `COUNT(DISTINCT col)` bỏ NULL và trùng.

:::

---

## Mục lục

- [Vì sao cần hàm tổng hợp (aggregate)?](#vì-sao-cần-hàm-tổng-hợp-aggregate)
- [Aggregate function là gì](#aggregate-function-là-gì)
- [SUM, COUNT, AVG, MIN, MAX](#sum-count-avg-min-max)
- [GROUP BY — gom nhóm dữ liệu](#group-by--gom-nhóm-dữ-liệu)
- [HAVING — lọc nhóm sau aggregate](#having--lọc-nhóm-sau-aggregate)
- [Bẫy hay gặp](#bẫy-hay-gặp)

---

## Vì sao cần hàm tổng hợp (aggregate)?

**Vấn đề:**

```sql
-- Muốn biết TỔNG doanh thu, nhưng nếu kéo hết bản ghi về ứng dụng để tự cộng:
SELECT thanh_tien FROM don_hang;  -- trả về hàng triệu dòng
-- Ứng dụng phải tải toàn bộ → truyền tải khổng lồ, chậm, tốn bộ nhớ
```

Tự đếm số đơn, cộng doanh thu hay tính điểm trung bình ở phía ứng dụng buộc database phải gửi mọi dòng dữ liệu qua mạng. Dữ liệu càng lớn, càng chậm và càng tốn RAM.

**Giải pháp:**

```sql
-- Tính NGAY tại database, chỉ trả về kết quả gọn (1 con số)
SELECT SUM(thanh_tien) AS tong_doanh_thu FROM don_hang;

-- Nhóm theo cột với GROUP BY rồi lọc nhóm bằng HAVING
SELECT trang_thai, COUNT(*) AS so_don
FROM don_hang
GROUP BY trang_thai
HAVING COUNT(*) > 100;
```

Hàm tổng hợp `COUNT` / `SUM` / `AVG` / `MIN` / `MAX` kết hợp `GROUP BY` (gom nhóm theo cột) và `HAVING` (lọc nhóm) giúp database tính toán tại chỗ và chỉ trả về kết quả đã thu gọn — cực kỳ hiệu quả cho báo cáo và thống kê.

:::tip[Dùng thực tế]
- **Đếm đơn theo trạng thái**: `COUNT(*)` + `GROUP BY trang_thai` để biết bao nhiêu đơn đang chờ, đang giao, đã hủy.
- **Doanh thu theo tháng**: `SUM(thanh_tien)` + `GROUP BY` theo tháng để dựng biểu đồ báo cáo.
- **Trung bình đánh giá sản phẩm**: `AVG(diem_danh_gia)` + `GROUP BY san_pham_id` để xếp hạng sản phẩm.
- **Lọc nhóm bằng HAVING**: chỉ giữ khách hàng có tổng chi tiêu `> X` để chạy chương trình khách VIP.
:::

---

## Aggregate function là gì

Aggregate function (hàm tổng hợp) nhận **nhiều row đầu vào** và trả về **một giá trị duy nhất**. Đây là nền tảng để tạo báo cáo thống kê như tổng doanh thu, số đơn hàng, điểm trung bình, v.v.

```sql
-- Không có aggregate: trả về nhiều row
SELECT gia_ban FROM san_pham;

-- Có aggregate: gộp tất cả row thành 1 giá trị
SELECT SUM(gia_ban) FROM san_pham;
```

:::info[Phân tích]
Aggregate function hoạt động theo hai chế độ:

- **Toàn bảng**: không có `GROUP BY` — gộp toàn bộ bảng thành 1 row kết quả.
- **Theo nhóm**: kết hợp `GROUP BY` — mỗi nhóm cho ra 1 row kết quả riêng.
:::

---

## SUM, COUNT, AVG, MIN, MAX

### SUM — tổng giá trị

```sql
-- Tổng doanh thu toàn bộ đơn hàng
SELECT SUM(thanh_tien) AS tong_doanh_thu
FROM don_hang;

-- Tổng số lượng sản phẩm theo từng danh mục
SELECT danh_muc, SUM(so_luong_ton) AS tong_ton_kho
FROM san_pham
GROUP BY danh_muc;
```

### COUNT — đếm số dòng

Ba cú pháp `COUNT` có hành vi khác nhau:

```sql
-- COUNT(*): đếm tất cả row, bao gồm cả NULL
SELECT COUNT(*) AS tong_don_hang
FROM don_hang;

-- COUNT(col): đếm row mà cột đó KHÔNG NULL
SELECT COUNT(ngay_giao_hang) AS so_don_da_giao
FROM don_hang;

-- COUNT(DISTINCT col): đếm giá trị duy nhất, bỏ trùng
SELECT COUNT(DISTINCT khach_hang_id) AS so_khach_hang_mua
FROM don_hang;
```

:::info[Phân tích]
| Cú pháp | Đếm NULL? | Đếm trùng? |
|---|---|---|
| `COUNT(*)` | Có | Có |
| `COUNT(col)` | Không | Có |
| `COUNT(DISTINCT col)` | Không | Không |
:::

### AVG — giá trị trung bình

```sql
-- Giá bán trung bình của toàn bộ sản phẩm
SELECT AVG(gia_ban) AS gia_trung_binh
FROM san_pham;

-- Điểm đánh giá trung bình theo sản phẩm
SELECT san_pham_id,
       ROUND(AVG(diem_danh_gia), 2) AS diem_tb
FROM danh_gia
GROUP BY san_pham_id;
```

:::warning[Cần lưu ý]
`AVG` bỏ qua các giá trị `NULL` khi tính toán. Nếu một cột có 10 row nhưng 3 row là `NULL`, PostgreSQL chỉ tính trung bình trên 7 giá trị còn lại — kết quả có thể khác với mong đợi nếu `NULL` mang nghĩa "bằng 0".

Để xử lý `NULL` như số 0:
```sql
SELECT AVG(COALESCE(diem_danh_gia, 0)) AS diem_tb_bao_gom_null
FROM danh_gia;
```
:::

### MIN và MAX — giá trị nhỏ nhất, lớn nhất

```sql
-- Giá thấp nhất và cao nhất trong kho
SELECT
    MIN(gia_ban) AS gia_thap_nhat,
    MAX(gia_ban) AS gia_cao_nhat
FROM san_pham;

-- Ngày đặt hàng đầu tiên và gần nhất của mỗi khách
SELECT khach_hang_id,
       MIN(ngay_dat) AS lan_dau_mua,
       MAX(ngay_dat) AS lan_gan_nhat
FROM don_hang
GROUP BY khach_hang_id;
```

:::tip[Mẹo]
`MIN` và `MAX` hoạt động được với kiểu dữ liệu văn bản (so sánh theo bảng chữ cái) và kiểu ngày tháng — không chỉ riêng số.
:::

---

## GROUP BY — gom nhóm dữ liệu

`GROUP BY` chia các row thành từng nhóm theo giá trị của một hoặc nhiều cột, sau đó aggregate function được áp dụng riêng cho mỗi nhóm.

### GROUP BY một cột

```sql
-- Tổng doanh thu theo từng tháng
SELECT
    DATE_TRUNC('month', ngay_dat) AS thang,
    SUM(thanh_tien)               AS doanh_thu
FROM don_hang
GROUP BY DATE_TRUNC('month', ngay_dat)
ORDER BY thang;
```

### GROUP BY nhiều cột

```sql
-- Doanh thu theo năm và theo danh mục sản phẩm
SELECT
    EXTRACT(YEAR FROM ngay_dat) AS nam,
    danh_muc,
    SUM(thanh_tien)             AS doanh_thu
FROM don_hang
JOIN san_pham USING (san_pham_id)
GROUP BY EXTRACT(YEAR FROM ngay_dat), danh_muc
ORDER BY nam, danh_muc;
```

:::warning[Cần lưu ý]
**Quy tắc bắt buộc của GROUP BY**: mọi cột xuất hiện trong `SELECT` mà **không** nằm trong aggregate function đều **phải** có mặt trong mệnh đề `GROUP BY`.

```sql
-- SAI: ten_san_pham không trong GROUP BY và không được aggregate
SELECT danh_muc, ten_san_pham, SUM(so_luong_ton)
FROM san_pham
GROUP BY danh_muc;
-- Lỗi: column "san_pham.ten_san_pham" must appear in the GROUP BY clause

-- ĐÚNG
SELECT danh_muc, ten_san_pham, SUM(so_luong_ton)
FROM san_pham
GROUP BY danh_muc, ten_san_pham;
```
:::

---

## HAVING — lọc nhóm sau aggregate

`WHERE` lọc **row trước khi** gom nhóm. `HAVING` lọc **nhóm sau khi** aggregate đã được tính.

```sql
-- Chỉ lấy danh mục có tổng tồn kho trên 100 sản phẩm
SELECT danh_muc, SUM(so_luong_ton) AS tong_ton
FROM san_pham
GROUP BY danh_muc
HAVING SUM(so_luong_ton) > 100;

-- Khách hàng đã đặt từ 5 đơn trở lên
SELECT khach_hang_id, COUNT(*) AS so_don
FROM don_hang
GROUP BY khach_hang_id
HAVING COUNT(*) >= 5
ORDER BY so_don DESC;
```

### WHERE và HAVING — kết hợp cùng nhau

```sql
-- Bước 1 (WHERE): chỉ xét đơn hàng từ năm 2024
-- Bước 2 (GROUP BY): gom theo khách hàng
-- Bước 3 (HAVING): chỉ giữ khách có tổng chi tiêu > 10,000,000
SELECT khach_hang_id,
       COUNT(*)         AS so_don,
       SUM(thanh_tien)  AS tong_chi_tieu
FROM don_hang
WHERE EXTRACT(YEAR FROM ngay_dat) = 2024
GROUP BY khach_hang_id
HAVING SUM(thanh_tien) > 10000000
ORDER BY tong_chi_tieu DESC;
```

### So sánh WHERE và HAVING

| Tiêu chí | WHERE | HAVING |
|---|---|---|
| Thời điểm lọc | Trước `GROUP BY` | Sau `GROUP BY` |
| Lọc đơn vị | Row đơn lẻ | Nhóm (kết quả aggregate) |
| Dùng aggregate được không? | Không | Có |
| Ảnh hưởng hiệu suất | Giảm dữ liệu sớm, nhanh hơn | Lọc sau khi đã tính toán |

:::tip[Mẹo]
Khi có thể lọc bằng cả `WHERE` lẫn `HAVING`, ưu tiên dùng `WHERE` vì nó loại bỏ row sớm hơn, giúp PostgreSQL xử lý ít dữ liệu hơn trước khi gom nhóm.
:::

---

## Bẫy hay gặp

### NULL bị bỏ qua trong aggregate (trừ COUNT)

```sql
-- Bảng luong có 5 nhân viên, 2 người chưa có lương (NULL)
SELECT COUNT(*)       AS tong_nhan_vien,  -- Kết quả: 5
       COUNT(luong)   AS co_du_lieu_luong, -- Kết quả: 3
       AVG(luong)     AS luong_trung_binh  -- Tính trên 3 người, KHÔNG phải 5
FROM nhan_vien;
```

:::warning[Cần lưu ý]
Chỉ `COUNT(*)` đếm cả row có `NULL`. Tất cả aggregate function còn lại (`SUM`, `AVG`, `MIN`, `MAX`, `COUNT(col)`) đều **bỏ qua** `NULL`. Hãy dùng `COALESCE` nếu muốn `NULL` được xử lý như một giá trị cụ thể.
:::

### GROUP BY với cột sai (không đồng nhất trong nhóm)

```sql
-- Muốn lấy tên sản phẩm đắt nhất theo danh mục — SAI CÁCH:
SELECT danh_muc, ten_san_pham, MAX(gia_ban)
FROM san_pham
GROUP BY danh_muc;
-- PostgreSQL báo lỗi vì ten_san_pham không nằm trong GROUP BY

-- ĐÚNG: Dùng subquery hoặc DISTINCT ON
SELECT DISTINCT ON (danh_muc) danh_muc, ten_san_pham, gia_ban
FROM san_pham
ORDER BY danh_muc, gia_ban DESC;
```

### Không dùng alias cột trong HAVING

```sql
-- SAI: PostgreSQL không nhận alias ở HAVING (alias được định nghĩa trong SELECT,
-- nhưng HAVING được đánh giá trước SELECT về mặt logic)
SELECT danh_muc, SUM(thanh_tien) AS tong_dt
FROM don_hang
JOIN san_pham USING (san_pham_id)
GROUP BY danh_muc
HAVING tong_dt > 5000000; -- Lỗi: column "tong_dt" does not exist

-- ĐÚNG: Lặp lại biểu thức aggregate trong HAVING
SELECT danh_muc, SUM(thanh_tien) AS tong_dt
FROM don_hang
JOIN san_pham USING (san_pham_id)
GROUP BY danh_muc
HAVING SUM(thanh_tien) > 5000000;
```

:::tip[Mẹo]
Thứ tự logic thực thi của một câu SQL có GROUP BY là:
`FROM` → `JOIN` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`

Hiểu thứ tự này giúp bạn biết mệnh đề nào "thấy" được alias của mệnh đề nào.
:::
