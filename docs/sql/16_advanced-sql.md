---
sidebar_position: 16
title: "16. SQL nâng cao (Window Functions)"
---

# SQL nâng cao (Window Functions)

Window function (hàm cửa sổ) cho phép tính toán trên một nhóm dòng liên quan đến dòng hiện tại mà vẫn giữ nguyên từng dòng chi tiết, khác với GROUP BY vốn gộp các dòng lại. Đây là công cụ mạnh để xếp hạng, tính tổng tích lũy, so sánh giữa các dòng kề nhau. Bài này giới thiệu ROW_NUMBER, RANK, DENSE_RANK, LEAD/LAG, PARTITION BY, running total, NTILE và cả CTE với WITH RECURSIVE.

---

## Mục lục

- [Window Function là gì](#window-function-là-gì)
- [So sánh Window Function vs GROUP BY](#so-sánh-window-function-vs-group-by)
- [ROW_NUMBER](#row_number)
- [RANK vs DENSE_RANK](#rank-vs-dense_rank)
- [LEAD và LAG](#lead-và-lag)
- [PARTITION BY và Frame Clause](#partition-by-và-frame-clause)
- [Running Total với SUM OVER](#running-total-với-sum-over)
- [NTILE — Phân nhóm đều](#ntile--phân-nhóm-đều)
- [CTE và WITH RECURSIVE](#cte-và-with-recursive)
- [Ví dụ thực tế: Top 3 sản phẩm mỗi category](#ví-dụ-thực-tế-top-3-sản-phẩm-mỗi-category)

---

## Window Function là gì

**Window Function** (hàm cửa sổ) cho phép tính toán trên một tập hợp các dòng liên quan đến dòng hiện tại — gọi là **"cửa sổ"** (window) — mà **không gộp các dòng lại** như `GROUP BY`.

Cú pháp tổng quát:

```sql
ten_ham() OVER (
    PARTITION BY cot_phan_nhom
    ORDER BY     cot_sap_xep
    ROWS BETWEEN hang_dau AND hang_cuoi
)
```

Trong đó:

| Thành phần | Ý nghĩa |
|---|---|
| `PARTITION BY` | Chia dữ liệu thành các nhóm độc lập (như GROUP BY nhưng không gộp row) |
| `ORDER BY` | Xác định thứ tự tính toán trong mỗi partition |
| `ROWS BETWEEN` | Xác định phạm vi frame (tùy chọn, mặc định phụ thuộc hàm) |

:::info[Phân tích]
Window Function **không làm mất dòng**. Kết quả trả về cùng số dòng với bảng gốc, mỗi dòng kèm thêm giá trị tính toán từ "cửa sổ" xung quanh nó.
:::

---

## So sánh Window Function vs GROUP BY

Giả sử bảng `don_hang`:

| id | nhan_vien | doanh_thu |
|---|---|---|
| 1 | An | 500 |
| 2 | Bình | 300 |
| 3 | An | 700 |
| 4 | Bình | 400 |

**Dùng GROUP BY** — gộp dòng, mất chi tiết:

```sql
SELECT nhan_vien, SUM(doanh_thu) AS tong
FROM don_hang
GROUP BY nhan_vien;
```

Kết quả chỉ còn 2 dòng, mất thông tin từng đơn hàng.

**Dùng Window Function** — giữ nguyên tất cả dòng:

```sql
SELECT
    id,
    nhan_vien,
    doanh_thu,
    SUM(doanh_thu) OVER (PARTITION BY nhan_vien) AS tong_theo_nv
FROM don_hang;
```

| id | nhan_vien | doanh_thu | tong_theo_nv |
|---|---|---|---|
| 1 | An | 500 | 1200 |
| 2 | Bình | 300 | 700 |
| 3 | An | 700 | 1200 |
| 4 | Bình | 400 | 700 |

:::tip[Mẹo]
Dùng Window Function khi bạn cần **vừa giữ chi tiết từng dòng, vừa thêm thống kê tổng hợp** vào cùng một kết quả.
:::

---

## ROW_NUMBER

`ROW_NUMBER()` đánh số thứ tự liên tiếp cho mỗi dòng trong partition, bắt đầu từ 1.

```sql
SELECT
    id,
    nhan_vien,
    doanh_thu,
    ROW_NUMBER() OVER (
        PARTITION BY nhan_vien
        ORDER BY doanh_thu DESC
    ) AS stt
FROM don_hang;
```

**Ứng dụng phổ biến — khử bản ghi trùng lặp:**

```sql
-- Giữ lại 1 dòng mới nhất cho mỗi email trùng
WITH xep_hang AS (
    SELECT *,
        ROW_NUMBER() OVER (
            PARTITION BY email
            ORDER BY created_at DESC
        ) AS rn
    FROM khach_hang
)
SELECT * FROM xep_hang WHERE rn = 1;
```

:::info[Phân tích]
`ROW_NUMBER()` luôn tạo số thứ tự **duy nhất**, kể cả khi các dòng có giá trị ORDER BY bằng nhau. Đây là điểm khác biệt so với `RANK` và `DENSE_RANK`.
:::

---

## RANK vs DENSE_RANK

Cả hai đều xếp hạng nhưng xử lý **hạng bằng nhau** khác nhau:

| Hàm | Khi bằng nhau | Số tiếp theo |
|---|---|---|
| `RANK()` | Cùng hạng, bỏ qua số tiếp theo | Có khoảng trống |
| `DENSE_RANK()` | Cùng hạng, không bỏ qua | Liên tiếp, không khoảng trống |

```sql
SELECT
    ten_sp,
    doanh_so,
    RANK()       OVER (ORDER BY doanh_so DESC) AS rank_co_khoang,
    DENSE_RANK() OVER (ORDER BY doanh_so DESC) AS dense_rank_lien_tiep
FROM san_pham;
```

Ví dụ kết quả khi hai sản phẩm cùng doanh số 1000:

| ten_sp | doanh_so | rank_co_khoang | dense_rank_lien_tiep |
|---|---|---|---|
| Áo | 1000 | 1 | 1 |
| Quần | 1000 | 1 | 1 |
| Giày | 800 | 3 | 2 |
| Túi | 600 | 4 | 3 |

:::warning[Cần lưu ý]
Dùng `RANK()` khi muốn phản ánh đúng "vị trí thực" (hạng 3 thật sự là hạng 3). Dùng `DENSE_RANK()` khi muốn đánh số liên tục không bỏ trống, ví dụ lấy "top 3 hạng" mà mỗi hạng là một bậc riêng.
:::

---

## LEAD và LAG

`LAG()` lấy giá trị của dòng **phía trước**, `LEAD()` lấy giá trị dòng **phía sau** trong cùng partition.

```sql
-- Tính chênh lệch doanh thu so với tháng trước
SELECT
    thang,
    doanh_thu,
    LAG(doanh_thu, 1) OVER (ORDER BY thang)            AS dt_thang_truoc,
    doanh_thu - LAG(doanh_thu, 1) OVER (ORDER BY thang) AS chenh_lech
FROM doanh_thu_thang;
```

| thang | doanh_thu | dt_thang_truoc | chenh_lech |
|---|---|---|---|
| 2024-01 | 10000 | NULL | NULL |
| 2024-02 | 12000 | 10000 | 2000 |
| 2024-03 | 11000 | 12000 | -1000 |
| 2024-04 | 15000 | 11000 | 4000 |

**Cú pháp đầy đủ với giá trị mặc định:**

```sql
LAG(cot, so_dong_lui, gia_tri_mac_dinh)  OVER (...)
LEAD(cot, so_dong_tien, gia_tri_mac_dinh) OVER (...)
```

```sql
-- Thay NULL tháng đầu bằng 0
SELECT
    thang,
    doanh_thu,
    LAG(doanh_thu, 1, 0) OVER (ORDER BY thang) AS dt_thang_truoc
FROM doanh_thu_thang;
```

:::tip[Mẹo]
`LEAD` và `LAG` rất hữu ích cho **phân tích chuỗi thời gian**: so sánh tháng này với tháng trước, dự báo xu hướng, phát hiện đột biến bất thường.
:::

---

## PARTITION BY và Frame Clause

`PARTITION BY` chia dữ liệu thành các nhóm độc lập. Mỗi nhóm được tính toán riêng.

**Frame Clause** xác định phạm vi dòng trong cửa sổ:

```sql
-- ROWS BETWEEN: phạm vi theo số dòng vật lý
SUM(doanh_thu) OVER (
    ORDER BY ngay
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
) AS trung_binh_7_ngay

-- RANGE BETWEEN: phạm vi theo giá trị (mặc định của hầu hết hàm)
SUM(doanh_thu) OVER (
    ORDER BY ngay
    RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
) AS luy_ke
```

| Từ khóa | Ý nghĩa |
|---|---|
| `UNBOUNDED PRECEDING` | Từ dòng đầu tiên của partition |
| `N PRECEDING` | N dòng phía trước dòng hiện tại |
| `CURRENT ROW` | Dòng hiện tại |
| `N FOLLOWING` | N dòng phía sau dòng hiện tại |
| `UNBOUNDED FOLLOWING` | Đến dòng cuối cùng của partition |

---

## Running Total với SUM OVER

Tính **tổng tích lũy** (running total / cumulative sum):

```sql
SELECT
    ngay,
    doanh_thu,
    SUM(doanh_thu) OVER (
        ORDER BY ngay
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS tong_luy_ke
FROM doanh_thu_ngay;
```

| ngay | doanh_thu | tong_luy_ke |
|---|---|---|
| 2024-01-01 | 500 | 500 |
| 2024-01-02 | 300 | 800 |
| 2024-01-03 | 700 | 1500 |
| 2024-01-04 | 200 | 1700 |

:::info[Phân tích]
Nếu bỏ `ROWS BETWEEN`, PostgreSQL mặc định dùng `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. Với `ROWS BETWEEN` tường minh, kết quả chính xác hơn khi có nhiều dòng cùng giá trị ORDER BY.
:::

---

## NTILE — Phân nhóm đều

`NTILE(n)` chia các dòng thành **n nhóm bằng nhau** (hoặc gần bằng nhau), đánh số từ 1 đến n.

```sql
-- Chia khách hàng thành 4 nhóm theo doanh thu (tứ phân vị)
SELECT
    khach_hang_id,
    tong_mua,
    NTILE(4) OVER (ORDER BY tong_mua DESC) AS nhom_tu_phan_vi
FROM thong_ke_khach;
```

Nhóm 1 là top 25% chi tiêu nhiều nhất, nhóm 4 là 25% chi tiêu ít nhất.

:::tip[Mẹo]
`NTILE` thường dùng trong **phân tích RFM** (Recency, Frequency, Monetary) để phân loại khách hàng theo hành vi mua sắm.
:::

---

## CTE và WITH RECURSIVE

**CTE (Common Table Expression)** dùng `WITH` để đặt tên cho subquery tạm thời, giúp truy vấn dễ đọc và tái sử dụng.

```sql
WITH doanh_thu_nv AS (
    SELECT nhan_vien_id, SUM(gia_tri) AS tong
    FROM don_hang
    GROUP BY nhan_vien_id
),
xep_hang AS (
    SELECT *,
        RANK() OVER (ORDER BY tong DESC) AS hang
    FROM doanh_thu_nv
)
SELECT * FROM xep_hang WHERE hang <= 5;
```

**WITH RECURSIVE** cho phép CTE tự tham chiếu — hữu ích với dữ liệu **phân cấp** (cây tổ chức, danh mục lồng nhau):

```sql
-- Duyệt cây phân cấp nhân viên
WITH RECURSIVE cap_bac AS (
    -- Base case: CEO (không có cấp trên)
    SELECT id, ten, quan_ly_id, 0 AS cap
    FROM nhan_vien
    WHERE quan_ly_id IS NULL

    UNION ALL

    -- Recursive: nhân viên cấp dưới
    SELECT nv.id, nv.ten, nv.quan_ly_id, cb.cap + 1
    FROM nhan_vien nv
    JOIN cap_bac cb ON nv.quan_ly_id = cb.id
)
SELECT * FROM cap_bac ORDER BY cap, ten;
```

:::warning[Cần lưu ý]
`WITH RECURSIVE` có thể chạy vô hạn nếu dữ liệu có vòng lặp (A quản lý B, B quản lý A). Luôn thêm điều kiện dừng hoặc dùng `CYCLE` (PostgreSQL 14+) để phát hiện chu trình.
:::

---

## Ví dụ thực tế: Top 3 sản phẩm mỗi category

Bài toán: Lấy **3 sản phẩm bán chạy nhất** cho mỗi danh mục sản phẩm.

```sql
-- Bước 1: Tính tổng doanh số mỗi sản phẩm
WITH doanh_so_sp AS (
    SELECT
        sp.id             AS san_pham_id,
        sp.ten            AS ten_sp,
        sp.danh_muc_id,
        dm.ten            AS ten_danh_muc,
        SUM(ct.so_luong)  AS tong_doanh_so
    FROM san_pham sp
    JOIN chi_tiet_don_hang ct ON ct.san_pham_id = sp.id
    JOIN danh_muc dm          ON dm.id = sp.danh_muc_id
    GROUP BY sp.id, sp.ten, sp.danh_muc_id, dm.ten
),

-- Bước 2: Xếp hạng trong từng danh mục
xep_hang AS (
    SELECT
        *,
        ROW_NUMBER() OVER (
            PARTITION BY danh_muc_id
            ORDER BY tong_doanh_so DESC
        ) AS hang_trong_danh_muc
    FROM doanh_so_sp
)

-- Bước 3: Lấy top 3 mỗi danh mục
SELECT
    ten_danh_muc,
    hang_trong_danh_muc AS hang,
    ten_sp,
    tong_doanh_so
FROM xep_hang
WHERE hang_trong_danh_muc <= 3
ORDER BY ten_danh_muc, hang_trong_danh_muc;
```

Kết quả mẫu:

| ten_danh_muc | hang | ten_sp | tong_doanh_so |
|---|---|---|---|
| Áo | 1 | Áo sơ mi trắng | 450 |
| Áo | 2 | Áo polo navy | 380 |
| Áo | 3 | Áo thun basic | 310 |
| Quần | 1 | Quần jean slim | 520 |
| Quần | 2 | Quần kaki | 290 |
| Quần | 3 | Quần short | 240 |

:::info[Phân tích]
Đây là pattern **Top-N per group** rất phổ biến trong thực tế. Dùng `ROW_NUMBER()` thay vì `RANK()` để đảm bảo chính xác 3 dòng mỗi danh mục, tránh trường hợp có nhiều hơn 3 sản phẩm cùng doanh số bằng nhau.
:::

---
