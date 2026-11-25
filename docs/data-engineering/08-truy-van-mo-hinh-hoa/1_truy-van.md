---
sidebar_position: 1
title: "1. Truy vấn (Queries)"
---

# Truy vấn (Queries)

Các chương trước chủ yếu nói về việc đưa dữ liệu từ nơi này sang nơi khác hoặc lưu trữ nó. Chương 8 trả lời câu hỏi: **làm sao để dữ liệu thực sự hữu ích**, thông qua ba việc là truy vấn (query), mô hình hoá (data modeling) và chuyển đổi (transformation). Bài này mở đầu chương và đi sâu vào phần **truy vấn**: truy vấn là gì, chạy thế nào, làm sao cho nhanh và rẻ, và truy vấn trên dữ liệu streaming khác gì batch.

Sách tập trung vào truy vấn trên hệ thống **OLAP** (data warehouse, data lake) với dữ liệu có cấu trúc và bán cấu trúc, dùng SQL làm ngôn ngữ chính. Để cho gọn, sách dùng từ "cơ sở dữ liệu" (database) để chỉ chung query engine cùng nơi lưu trữ mà nó truy vấn, kể cả data warehouse đám mây hay Spark đọc file Parquet trên S3.

**Tương tự đơn giản:** viết SQL giống như gọi món ở nhà hàng. Bạn chỉ nói "tôi muốn gì", còn bếp (query engine và optimizer) quyết định nấu theo thứ tự nào cho nhanh. Hiểu cách bếp làm việc giúp bạn gọi món để bếp đỡ vất vả và hoá đơn đỡ đắt.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Query optimizer quyết định tốc độ truy vấn** — bạn không điều khiển trực tiếp, nhưng đọc được `EXPLAIN` plan và hiểu nó làm gì sẽ giúp viết truy vấn tốt hơn nhiều.
- ⭐ **Chỉ quét dữ liệu bạn cần** — tránh `SELECT *` không điều kiện, dùng pruning (chọn cột, partition, clustering key, index) để giảm lượng dữ liệu quét, đặc biệt với DB tính tiền theo lượng quét.
- **Cẩn thận row explosion** khi join các khoá bị lặp, và ưu tiên CTE thay cho subquery lồng nhau để dễ đọc.
- **Mô hình commit khác nhau giữa các DB** (PostgreSQL, BigQuery, MongoDB) — phải biết DB của mình xử lý nhất quán và ghi đồng thời ra sao.
- **Truy vấn streaming** dựa trên cửa sổ (session, tumbling, sliding), trigger và watermark; join stream cần bộ đệm có thời gian lưu giữ.

:::

---

## Mục lục

- 1. Truy vấn là gì (DDL, DML, DCL, TCL)
- 2. Vòng đời của một truy vấn và query optimizer
- 3. Cải thiện hiệu suất truy vấn
- 4. Truy vấn trên dữ liệu streaming
- Áp vào chuỗi trà sữa Mây
- Tóm tắt

---

## 1. Truy vấn là gì

### Thuật ngữ trong bài — hiểu nôm na

Trước khi vào chi tiết, bảng dưới giải nghĩa các từ sẽ gặp nhiều lần. Ví dụ lấy từ chuỗi trà sữa **Mây** (30 cửa hàng) dùng xuyên suốt topic này.

| Thuật ngữ | Nghĩa đời thường | Ví dụ ở chuỗi Mây |
|---|---|---|
| Truy vấn (query) | Một câu hỏi gửi cho kho dữ liệu, viết theo cú pháp máy hiểu | "Hôm qua cửa hàng Q1-Lê Lợi bán bao nhiêu ly?" |
| SQL | Ngôn ngữ phổ biến nhất để viết câu hỏi đó | `SELECT SUM(so_luong) FROM don_hang WHERE ...` |
| Bảng (table) | Giống một sheet Excel: mỗi hàng là một bản ghi, mỗi cột là một thuộc tính | Bảng `don_hang`, mỗi hàng là một đơn |
| Predicate | Điều kiện lọc, phần `WHERE ...` | Chỉ lấy đơn của ngày 01/03 |
| OLAP | Hệ thống chuyên trả lời câu hỏi phân tích trên rất nhiều dữ liệu | Kho dữ liệu nơi chủ chuỗi xem doanh thu cả năm |
| OLTP | Hệ thống phục vụ thao tác hằng ngày, ghi từng giao dịch nhỏ | Máy POS ghi từng đơn ở quầy |
| Query engine | "Đầu bếp" nhận câu hỏi và đi lục dữ liệu để trả lời | BigQuery, Snowflake, PostgreSQL |
| Index | Mục lục ở cuối sách, giúp tìm nhanh mà không lật từng trang | Index theo `order_id` để tra một đơn ngay lập tức |
| Partition | Chia bảng thành nhiều ngăn kéo theo một tiêu chí, thường là ngày | Mỗi ngày bán hàng là một ngăn riêng |
| Join | Ghép hai bảng dựa trên cột chung | Ghép `don_hang` với `cua_hang` để biết đơn thuộc quận nào |
| Latency (độ trễ) | Khoảng chờ từ lúc hỏi tới lúc có câu trả lời | Dashboard mở mất 2 giây hay 2 phút |

### Truy vấn trông thế nào trên dữ liệu thật

Truy vấn cho phép bạn **truy xuất và tác động lên dữ liệu**. Nhắc lại CRUD ở Chương 5: khi truy vấn lấy dữ liệu, đó là thao tác **R (Read)**. Ví dụ:

```sql
SELECT * FROM foo;            -- lấy mọi bản ghi của bảng foo
SELECT * FROM foo WHERE id=1; -- dùng predicate (điều kiện lọc) để chỉ lấy bản ghi có id = 1
```

Áp vào Mây cho dễ hình dung. Giả sử bảng `don_hang` có vài dòng như sau:

| order_id | thoi_gian | cua_hang | mon | so_luong | gia | kenh |
|---|---|---|---|---|---|---|
| DH001 | 2026-03-01 08:15 | Q1-Lê Lợi | Trà sữa trân châu | 2 | 35000 | quầy |
| DH002 | 2026-03-01 08:20 | Q3-Võ Văn Tần | Trà đào | 1 | 30000 | app |
| DH003 | 2026-03-01 09:05 | Q1-Lê Lợi | Trà sữa matcha | 1 | 40000 | app |
| DH004 | 2026-03-02 10:10 | Q1-Lê Lợi | Trà sữa trân châu | 3 | 35000 | quầy |

Câu hỏi "ngày 01/03, mỗi cửa hàng bán được bao nhiêu tiền?" viết bằng SQL:

```sql
SELECT cua_hang, SUM(so_luong * gia) AS doanh_thu
FROM don_hang
WHERE DATE(thoi_gian) = '2026-03-01'   -- predicate: chỉ lấy ngày 01/03
GROUP BY cua_hang;                      -- gom theo cửa hàng
```

Kết quả trả về là một bảng nhỏ, đúng thứ chủ chuỗi cần:

| cua_hang | doanh_thu |
|---|---|
| Q1-Lê Lợi | 110000 |
| Q3-Võ Văn Tần | 30000 |

Đơn DH004 không có mặt vì thuộc ngày 02/03, bị predicate loại ra. Đây là toàn bộ tinh thần của truy vấn: **mô tả kết quả mong muốn**, để hệ thống tự lo cách lấy.

Nhiều DB còn cho phép **C, U, D** (tạo, cập nhật, xoá). Các nhóm lệnh SQL thường gặp:

### DDL (Data Definition Language) — ngôn ngữ định nghĩa dữ liệu

Dùng để tạo và định nghĩa **đối tượng** trong DB (database, schema, bảng, người dùng). DDL quy định *trạng thái* của các đối tượng đó. Các lệnh thường dùng: `CREATE`, `DROP`, và sửa đổi cấu trúc (sách ghi là `UPDATE`, nhưng trong SQL chuẩn lệnh sửa cấu trúc đối tượng là `ALTER`).

```sql
CREATE DATABASE bar;
CREATE TABLE bar_table (...);
DROP TABLE bar_table;
```

### DML (Data Manipulation Language) — ngôn ngữ thao tác dữ liệu

Sau khi có đối tượng, DML thêm và thay đổi **dữ liệu** bên trong: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `COPY`, `MERGE`. Ví dụ: `INSERT` một bản ghi mới, `UPDATE` bản ghi sẵn có, `SELECT` những bản ghi cụ thể.

### DCL (Data Control Language) — ngôn ngữ kiểm soát dữ liệu

Kiểm soát **quyền truy cập**: `GRANT`, `DENY`, `REVOKE`. Ví dụ sách đưa ra: nhà khoa học dữ liệu mới tên Sarah cần quyền đọc `data_science_db`; vài tháng sau cô nghỉ việc nên phải thu hồi quyền.

```sql
-- Cấp quyền đọc cho Sarah
GRANT SELECT ON data_science_db TO Sarah;
-- Thu hồi quyền khi cô ấy rời công ty (cú pháp chuẩn dùng FROM)
REVOKE SELECT ON data_science_db FROM Sarah;
```

Hiểu DCL giúp bạn xử lý khi ai đó không truy cập được dữ liệu cần thiết, và ngược lại ngăn người không nên thấy dữ liệu.

### TCL (Transaction Control Language) — ngôn ngữ kiểm soát giao dịch

Điều khiển chi tiết giao dịch: xác định điểm commit, điều kiện để rollback. Hai lệnh phổ biến: `COMMIT` và `ROLLBACK`.

| Nhóm | Mục đích | Lệnh tiêu biểu |
|---|---|---|
| DDL | Định nghĩa đối tượng DB | CREATE, DROP, ALTER |
| DML | Đọc/ghi dữ liệu | SELECT, INSERT, UPDATE, DELETE, COPY, MERGE |
| DCL | Phân quyền | GRANT, DENY, REVOKE |
| TCL | Giao dịch | COMMIT, ROLLBACK |

Ở chuỗi Mây, mỗi nhóm lệnh ứng với một việc rất đời thường:

| Nhóm | Việc ở Mây | Ai thường làm |
|---|---|---|
| DDL | Tạo bảng `nhiet_do_tu_mat` khi lắp cảm biến cho tủ mát | Kỹ sư dữ liệu |
| DML | Ghi thêm đơn mới, sửa giá món sau khi đổi menu, đọc doanh thu | Hệ thống POS, kỹ sư, nhà phân tích |
| DCL | Cho kế toán xem bảng lương, nhưng không cho marketing xem | Kỹ sư dữ liệu hoặc quản trị viên |
| TCL | Chuyển nguyên liệu từ kho tổng sang cửa hàng: trừ kho tổng và cộng kho cửa hàng phải cùng thành công hoặc cùng huỷ | Phần mềm kho |

---

## 2. Vòng đời của một truy vấn và query optimizer

Chạy SQL trông đơn giản (viết, chạy, nhận kết quả) nhưng bên dưới có nhiều bước:

```mermaid
flowchart LR
    A["Mã SQL"] --> B["Biên dịch: kiểm tra cú pháp,<br/>đối tượng tồn tại, quyền truy cập"]
    B --> C["Chuyển thành bytecode<br/>các bước thực thi"]
    C --> D["Query optimizer<br/>sắp xếp lại, tái cấu trúc"]
    D --> E["Thực thi và trả kết quả"]
```

1. DB **biên dịch** SQL: phân tích cú pháp, kiểm tra ngữ nghĩa, xác nhận các đối tượng được tham chiếu có tồn tại và người dùng hiện tại có quyền.
2. SQL được chuyển thành **bytecode** (mã trung gian): biểu diễn các bước phải làm theo dạng máy đọc được, hiệu quả.
3. **Query optimizer** phân tích bytecode để quyết định cách thực hiện, sắp xếp lại và tái cấu trúc sao cho dùng tài nguyên hiệu quả nhất.
4. Truy vấn được **thực thi** và trả kết quả.

### Query optimizer

Cùng một truy vấn có thể chạy nhanh chậm rất khác nhau tuỳ cách thực thi. Việc của optimizer là chia truy vấn thành các bước hợp lý theo thứ tự hiệu quả, dựa trên join, index, kích thước dữ liệu phải quét và nhiều yếu tố khác, để **tốn ít chi phí nhất**. Mỗi DB có optimizer khác nhau. Bạn không làm việc trực tiếp với optimizer, nhưng hiểu chức năng của nó giúp viết truy vấn hiệu quả hơn, và bạn cần biết phân tích hiệu suất bằng `EXPLAIN` plan hoặc công cụ profiling truy vấn.

**Ví dụ ở Mây:** câu hỏi "doanh thu ngày 01/03 của các cửa hàng ở Quận 1" cần ghép bảng `don_hang` (hàng triệu dòng) với bảng `cua_hang` (30 dòng). Bảng dưới cho thấy hai kế hoạch cùng ra một đáp án nhưng khối lượng việc chênh nhau rất xa.

| Bước | Kế hoạch vụng | Kế hoạch optimizer chọn |
|---|---|---|
| 1 | Ghép toàn bộ đơn hàng (5 triệu dòng) với bảng cửa hàng | Lọc đơn ngày 01/03 trước, còn khoảng 15 nghìn dòng |
| 2 | Lọc ngày 01/03 trên 5 triệu dòng đã ghép | Lọc cửa hàng Quận 1, còn 4 cửa hàng |
| 3 | Lọc Quận 1 | Ghép 15 nghìn dòng với 4 cửa hàng |
| 4 | Cộng tổng | Cộng tổng |
| Khối lượng | Xử lý hàng triệu dòng | Xử lý vài chục nghìn dòng |

Nguyên tắc rút ra: **lọc càng sớm càng đỡ việc**. Optimizer thường tự làm điều này, nhưng không phải lúc nào cũng làm được (xem row explosion ngay dưới).

---

## 3. Cải thiện hiệu suất truy vấn

Gặp truy vấn chậm là chuyện tất yếu. Nguyên tắc của sách: **đừng chống lại DB của bạn**, hãy học cách phát huy điểm mạnh và bù đắp điểm yếu của nó.

### 3.1. Tối ưu chiến lược join và schema

Một tập dữ liệu đơn lẻ hiếm khi hữu ích; giá trị đến từ việc kết hợp nhiều tập. Sách giả định bạn đã quen các loại join (inner, outer, left, cross) và các kiểu quan hệ (1-1, 1-nhiều, nhiều-1, nhiều-nhiều). Ngay cả DB dạng cột (trước đây nổi tiếng join chậm) nay thường join rất tốt.

Các kỹ thuật:

- **Pre-join (nối trước dữ liệu):** nếu các truy vấn phân tích cứ lặp đi lặp lại cùng một phép join, hãy nối sẵn một lần rồi cho truy vấn đọc từ bản đã nối. Cách làm: nới lỏng chuẩn hoá để làm bảng rộng hơn, dùng kiểu dữ liệu mới (array, struct) thay cho quan hệ thực thể hay phải join; hoặc giữ schema chuẩn hoá nhưng tạo thêm các bảng nối sẵn cho những use case phổ biến; hoặc dùng materialized view (xem bài 4).
- **Đơn giản hoá điều kiện join:** logic join phức tạp tốn nhiều tính toán. Nhiều DB hướng hàng cho phép đánh index trên giá trị tính toán, ví dụ PostgreSQL cho tạo index trên chuỗi đã chuyển chữ thường; khi optimizer gặp hàm `lower()` trong predicate nó có thể dùng index. Hoặc tạo cột dẫn xuất mới để join (nhưng phải hướng dẫn người dùng join trên cột này).

### 3.2. Row explosion (bùng nổ số hàng)

Xảy ra khi có rất nhiều kết quả khớp **nhiều-nhiều** do khoá join bị lặp hoặc do logic join.

**Ví dụ:** khoá join trong bảng A có giá trị X lặp 5 lần, bảng B cũng có X lặp 10 lần. Kết quả là tích chéo: 5 × 10 = 50 hàng đầu ra. Nếu còn nhiều khoá lặp khác nữa, số hàng tăng vọt, ngốn tài nguyên hoặc làm truy vấn thất bại.

Cần biết optimizer của DB xử lý join thế nào. Có DB tự sắp xếp lại join và predicate, có DB thì không. Nếu row explosion xảy ra ở giai đoạn đầu của truy vấn thì truy vấn có thể thất bại dù predicate phía sau sẽ loại bỏ các bản lặp. Đưa predicate lên sớm có thể giảm mạnh tài nguyên.

**Minh hoạ ở Mây:** nhà phân tích muốn biết doanh thu theo chương trình khuyến mãi, nên ghép bảng đơn hàng với bảng khuyến mãi theo cột `cua_hang`. Nhưng bảng khuyến mãi có **nhiều dòng cho cùng một cửa hàng** (mỗi tháng một chương trình), nên mỗi đơn bị nhân bản.

Bảng đơn hàng (2 đơn ở Q1-Lê Lợi):

| order_id | cua_hang | gia |
|---|---|---|
| DH001 | Q1-Lê Lợi | 70000 |
| DH003 | Q1-Lê Lợi | 40000 |

Bảng khuyến mãi (3 chương trình ở Q1-Lê Lợi):

| cua_hang | chuong_trinh |
|---|---|
| Q1-Lê Lợi | Mua 2 tặng 1 (tháng 1) |
| Q1-Lê Lợi | Giảm 20% (tháng 2) |
| Q1-Lê Lợi | Tặng topping (tháng 3) |

Kết quả ghép: 2 × 3 = **6 dòng**, và nếu cộng `gia` thì doanh thu bị đội lên gấp 3 (330000 thay vì 110000):

| order_id | cua_hang | gia | chuong_trinh |
|---|---|---|---|
| DH001 | Q1-Lê Lợi | 70000 | Mua 2 tặng 1 (tháng 1) |
| DH001 | Q1-Lê Lợi | 70000 | Giảm 20% (tháng 2) |
| DH001 | Q1-Lê Lợi | 70000 | Tặng topping (tháng 3) |
| DH003 | Q1-Lê Lợi | 40000 | Mua 2 tặng 1 (tháng 1) |
| DH003 | Q1-Lê Lợi | 40000 | Giảm 20% (tháng 2) |
| DH003 | Q1-Lê Lợi | 40000 | Tặng topping (tháng 3) |

Với 2 đơn thì chỉ là con số sai. Với 5 triệu đơn và 36 chương trình, kết quả trung gian lên tới 180 triệu dòng, đủ làm truy vấn chạy mãi không xong. Cách sửa: ghép theo **cả cửa hàng lẫn tháng**, để mỗi đơn chỉ khớp đúng một chương trình.

### 3.3. Dùng CTE thay vì subquery lồng nhau

**CTE (Common Table Expression, biểu thức bảng chung)** cho phép soạn truy vấn phức tạp theo cách dễ đọc, dễ nắm luồng xử lý. Khả năng đọc của truy vấn phức tạp rất quan trọng. CTE cũng thường nhanh hơn việc tạo bảng trung gian bằng script; nếu buộc phải tạo bảng trung gian thì cân nhắc bảng tạm (temporary table).

```sql
-- Ví dụ minh hoạ (do người ghi chép thêm)
WITH don_hang_ngay AS (
    SELECT customer_id, COUNT(*) AS so_don, SUM(amount) AS tong_tien
    FROM orders
    WHERE order_date = '2022-03-01'
    GROUP BY customer_id
)
SELECT c.name, d.so_don, d.tong_tien
FROM don_hang_ngay d
JOIN customers c ON c.id = d.customer_id;
```

### 3.4. Dùng EXPLAIN plan và theo dõi hiệu suất

`EXPLAIN` plan cho biết optimizer chọn kế hoạch rẻ nhất ra sao, các đối tượng DB được dùng (bảng, index, cache...), cùng thống kê hiệu suất và mức tiêu thụ tài nguyên ở từng giai đoạn. Một số DB hiển thị trực quan, số khác trả về qua lệnh `EXPLAIN` bằng SQL.

Ngoài `EXPLAIN`, nên **giám sát** các chỉ số:

- Mức dùng tài nguyên quan trọng: đĩa, bộ nhớ, mạng.
- Thời gian tải dữ liệu so với thời gian xử lý (processing time).
- Thời gian chạy truy vấn, số bản ghi, kích thước dữ liệu quét, lượng dữ liệu bị shuffle.
- Các truy vấn cạnh tranh gây tranh chấp tài nguyên.
- Số kết nối đồng thời đang dùng so với số kết nối có sẵn (đăng ký quá mức sẽ khiến người dùng không kết nối được).

### 3.5. Tránh quét toàn bộ bảng (full table scan)

Mọi truy vấn đều quét dữ liệu nhưng không phải lần quét nào cũng như nhau. Nguyên tắc: **chỉ truy vấn dữ liệu bạn cần**. `SELECT *` không predicate là quét cả bảng, lấy mọi hàng và cột, rất kém và tốn kém, nhất là với DB trả tiền theo lượng byte quét hoặc thời gian tính toán.

Hãy dùng **pruning (cắt tỉa)** để giảm lượng dữ liệu quét. Cách làm khác nhau theo kiểu DB:

| Kiểu DB | Cách pruning |
|---|---|
| Hướng cột (columnar) | Chỉ chọn những cột cần dùng. Với bảng rất lớn (hàng terabyte), Snowflake và BigQuery cho định nghĩa **clustering key** để sắp xếp dữ liệu giúp truy cập từng phần hiệu quả. BigQuery còn cho **partition** bảng thành các phân đoạn nhỏ để chỉ truy vấn partition cần thiết. (Chọn clustering/partition key không phù hợp có thể làm giảm hiệu suất.) |
| Hướng hàng (row-oriented) | Chủ yếu dựa vào **index** của bảng (đã học ở Chương 6). Tạo index phục vụ các truy vấn nhạy cảm nhất về hiệu suất, nhưng không đánh quá nhiều index vì sẽ làm chậm lại. |

**Hình dung pruning bằng tủ hồ sơ:** bảng `don_hang` của Mây được chia **partition theo ngày**, giống một tủ có 365 ngăn kéo, mỗi ngăn đựng đơn của một ngày. Khi hỏi doanh thu ngày 01/03, hệ thống chỉ cần mở đúng một ngăn. Sơ đồ dưới so sánh lượng dữ liệu phải đọc trong hai trường hợp.

```mermaid
flowchart LR
    Q["Câu hỏi<br/>doanh thu ngày 01/03"]
    subgraph khong["Không partition, SELECT *"]
        K1["Đọc cả năm<br/>mọi cột<br/>khoảng 50 GB"]
    end
    subgraph co["Có partition, chỉ chọn 3 cột"]
        P1["Mở ngăn 01/03"]
        P2["Chỉ đọc cột cua_hang,<br/>so_luong, gia"]
        P3["Khoảng 30 MB"]
        P1 --> P2 --> P3
    end
    Q --> K1
    Q --> P1
```

Với kho tính tiền theo dung lượng quét (như BigQuery), chênh lệch 50 GB và 30 MB nghĩa là hoá đơn chênh nhau hàng nghìn lần cho **cùng một câu trả lời**. Các con số trên chỉ để minh hoạ tỷ lệ.

### 3.6. Hiểu cách DB xử lý commit

**Commit** là một thay đổi trong DB: tạo, cập nhật, xoá bản ghi, bảng hoặc đối tượng khác. Nhiều DB hỗ trợ **transaction (giao dịch)**: thực hiện nhiều thao tác cùng lúc mà vẫn giữ trạng thái nhất quán, kể cả khi có lỗi, và xử lý cô lập (isolation) khi nhiều sự kiện đồng thời đọc, ghi, xoá cùng một đối tượng. (Thuật ngữ "transaction" hơi bị dùng quá tải, xem lại Chương 5.)

Bạn cần biết DB của mình xử lý commit và giao dịch thế nào và mức nhất quán của kết quả truy vấn là gì. Nó có tuân thủ **ACID** không? Nếu không, có thể gặp **dirty read** (đọc một hàng mà giao dịch chưa commit đã thay đổi). Dirty read có phải hành vi chấp nhận được không, và bạn xử lý nó thế nào? Ngoài ra, khi cập nhật/xoá theo giao dịch, một số DB tạo file mới để biểu diễn trạng thái mới và giữ file cũ làm điểm tham chiếu khi lỗi. Chạy rất nhiều commit nhỏ trong các DB này tạo ra nhiều file rác, tốn lưu trữ và phải dọn định kỳ.

Sách so sánh ba DB (tính đến thời điểm viết sách):

| DB | Mô hình commit | Ưu điểm | Nhược điểm |
|---|---|---|---|
| **PostgreSQL** (RDBMS, ACID) | Mỗi giao dịch là một gói thao tác cùng thành công hoặc cùng thất bại; truy vấn phân tích thấy bức tranh nhất quán tại một thời điểm | Tính nhất quán chặt | Cần **khoá hàng** (chặn đọc/ghi một số hàng), làm giảm hiệu suất; không tối ưu cho quét lớn hay lượng dữ liệu khổng lồ của phân tích quy mô lớn |
| **BigQuery** | Commit toàn bảng theo thời điểm (snapshot) | Truy vấn đọc luôn đọc từ snapshot đã commit mới nhất, dù chạy 1 giây hay 2 giờ; không khoá bảng khi đọc; ghi tiếp theo tạo commit và snapshot mới | Chỉ cho **một thao tác ghi tại một thời điểm** (ghi đồng thời bị xếp hàng theo thứ tự đến), dù một truy vấn ghi vẫn song song hoá ghi lượng lớn dữ liệu. Snowflake, Spark và các hệ khác dùng mô hình tương tự |
| **MongoDB** | Nhất quán thay đổi được (variable consistency): cấu hình mức nhất quán ở cả cấp DB và từng truy vấn | Khả năng mở rộng và ghi đồng thời rất tốt | Ở một số chế độ, khi quá tải nó có thể **âm thầm loại bỏ ngẫu nhiên các thao tác ghi**. Hợp với ứng dụng chấp nhận mất một phần dữ liệu (ví dụ IoT chỉ cần nhiều phép đo), không hợp với ứng dụng cần dữ liệu và số liệu chính xác |

Sách nhấn mạnh: đây đều là DB tốt khi chọn đúng ứng dụng và cấu hình đúng. Kỹ sư phải hiểu sâu bài toán và công cụ; chọn và cấu hình công nghệ đúng có thể là khác biệt giữa thành công và thất bại lớn (xem thêm Chương 6 về tính nhất quán).

### 3.7. Dọn bản ghi đã xoá bằng VACUUM

Do giao dịch cập nhật/xoá/lập index tạo ra bản ghi mới nhưng vẫn giữ bản ghi cũ (để có thể quay lại trạng thái trước), các **dead record** (bản ghi chết) tích tụ dần và hết cần thiết. Quy trình loại bỏ chúng gọi là **VACUUM**; có thể VACUUM một bảng, nhiều bảng hoặc cả DB.

Lý do cần VACUUM:

1. Giải phóng chỗ cho bản ghi mới: bảng bớt phình, truy vấn nhanh hơn.
2. Bản ghi mới, đúng giúp **query plan chính xác hơn**; bản ghi lỗi thời khiến optimizer đưa ra kế hoạch dưới tối ưu.
3. Loại bỏ các index xấu, cải thiện hiệu suất index.

Cách xử lý theo loại DB:

- **DB dựa trên object storage (BigQuery, Snowflake, Databricks):** nhược điểm duy nhất của việc giữ dữ liệu cũ là tốn dung lượng (chi phí tuỳ mô hình giá lưu trữ). Snowflake không cho VACUUM trực tiếp, bạn chỉnh khoảng thời gian **time travel** để quyết định giữ snapshot bao lâu trước khi tự động VACUUM. BigQuery dùng cửa sổ lịch sử cố định 7 ngày. Databricks thường giữ dữ liệu vô thời hạn cho đến khi VACUUM thủ công; VACUUM quan trọng để kiểm soát chi phí lưu trữ S3.
- **Amazon Redshift:** VACUUM chạy tự động ở nền, nhưng đôi khi người dùng chạy thủ công để tinh chỉnh vì nó ảnh hưởng hiệu suất và dung lượng.
- **DB quan hệ như PostgreSQL, MySQL:** VACUUM càng quan trọng, vì lượng lớn giao dịch có thể làm dead record tích tụ nhanh; kỹ sư cần nắm rõ chi tiết và tác động của nó.

### 3.8. Tận dụng cache kết quả truy vấn

Giả sử một truy vấn nặng chạy thường xuyên trên DB tính phí theo lượng dữ liệu truy vấn; mỗi lần chạy đều tốn tiền. Nhiều DB OLAP đám mây **cache kết quả truy vấn**. Lần đầu chạy là **cold query** (truy vấn nguội, tương tự khái niệm dữ liệu nguội ở Chương 6): lấy dữ liệu từ nhiều nguồn, lọc, join, ví dụ mất 40 giây. Chạy lại cùng truy vấn có thể trả kết quả trong 1 giây hoặc ít hơn vì kết quả đã được cache. Hãy tận dụng để giảm áp lực lên DB và cho trải nghiệm tốt hơn với các truy vấn chạy thường xuyên. Materialized view cũng là một dạng cache truy vấn khác (xem bài 4).

---

## 4. Truy vấn trên dữ liệu streaming

Dữ liệu streaming **luôn chuyển động**, nên truy vấn nó khác truy vấn batch: ta phải điều chỉnh mẫu truy vấn cho hợp với bản chất thời gian thực. Các hệ thống như Kafka và Pulsar giúp truy vấn nguồn streaming dễ hơn.

### 4.1. Các mẫu truy vấn cơ bản trên stream

#### Fast-follower (CDC theo sát)

Nhắc lại CDC liên tục ở Chương 7: về cơ bản nó biến DB phân tích thành một DB "bám sát" (follower) DB production. Một trong những mẫu truy vấn streaming lâu đời nhất là truy vấn DB phân tích này để lấy kết quả và tổng hợp thống kê với độ trễ nhỏ so với production.

Vì sao không chạy thẳng trên DB production? Về nguyên tắc được, trên thực tế thì không: DB production thường không đủ sức vừa xử lý workload production vừa chạy quét phân tích lớn, nên có thể làm chậm hoặc làm sập ứng dụng. Mẫu CDC cơ bản cho phép phân tích gần thời gian thực mà tác động tối thiểu lên production.

Có thể dùng DB giao dịch thường làm follower, nhưng hệ thống hướng OLAP thực thụ có lợi thế rõ rệt. Druid và BigQuery kết hợp **bộ đệm streaming** với **lưu trữ cột dài hạn**, hơi giống kiến trúc Lambda (Chương 3), rất hiệu quả để tính thống kê trên dữ liệu lịch sử rộng với cập nhật gần thời gian thực.

**Giới hạn:** cách này không thay đổi căn bản mẫu truy vấn batch. Bạn vẫn chạy `SELECT` trên trạng thái hiện tại của bảng và bỏ lỡ cơ hội kích hoạt sự kiện một cách động dựa trên thay đổi trong stream.

#### Kiến trúc Kappa

Kappa (Chương 3) coi mọi dữ liệu là **sự kiện** và lưu chúng dưới dạng **stream** thay vì bảng. Nguồn là DB production thì lưu các sự kiện CDC; stream cũng có thể đến trực tiếp từ backend ứng dụng, đội thiết bị IoT hoặc hệ thống bất kỳ sinh sự kiện. Thay vì chỉ xem hệ thống lưu trữ streaming là bộ đệm, Kappa **giữ sự kiện lâu hơn** (tháng hoặc năm, trong khi hệ thống thời gian thực thuần tuý thường chỉ giữ tối đa khoảng một tuần) và cho truy vấn trực tiếp từ đó.

"Ý tưởng lớn" của Kappa: coi hệ lưu trữ streaming vừa là **lớp vận chuyển thời gian thực**, vừa là **DB để truy xuất và truy vấn dữ liệu lịch sử**. Truy vấn có thể thực hiện bằng khả năng truy vấn sẵn có của hệ thống (ví dụ Kafka KSQL hỗ trợ tổng hợp, thống kê, thậm chí sessionization) hoặc công cụ ngoài. Nếu truy vấn phức tạp hơn hoặc cần kết hợp nguồn khác, công cụ như Spark đọc một khoảng thời gian dữ liệu từ Kafka rồi tính kết quả. Hệ lưu trữ streaming cũng có thể cấp dữ liệu cho ứng dụng khác hoặc stream processor như Flink, Beam.

### 4.2. Cửa sổ, trigger, emitted metric và dữ liệu đến muộn

Điểm hạn chế cơ bản của truy vấn batch truyền thống: query engine giống một **người quan sát bên ngoài**, có tác nhân bên ngoài kích hoạt (job theo giờ, quản lý sản phẩm mở dashboard). Ngược lại, hầu hết hệ thống streaming phổ biến hỗ trợ tính toán **kích hoạt trực tiếp từ dữ liệu**: ví dụ đưa ra trung bình/median mỗi khi thu đủ một số bản ghi trong bộ đệm, hay xuất bản tóm tắt khi một phiên người dùng đóng.

**Window (cửa sổ)** là tính năng thiết yếu: các lô nhỏ được xử lý dựa trên trigger động, tạo động theo thời gian. Ba loại thường gặp: session, tumbling (cố định), sliding.

#### Session window

Nhóm các sự kiện xảy ra gần nhau và lọc bỏ các khoảng không hoạt động. Ví dụ: một phiên là khoảng thời gian không có quãng im lặng 5 phút trở lên. Với batch, hệ thống nhóm dữ liệu theo user ID, sắp xếp sự kiện, tìm khoảng trống và ranh giới phiên rồi tính thống kê từng phiên (kỹ sư thường "sessionize" hồi cứu như vậy).

Với streaming, quá trình này diễn ra **động**. Session window được định nghĩa **theo từng khoá** (mỗi user có tập cửa sổ riêng). Hệ thống tích luỹ dữ liệu theo từng user; nếu im lặng 5 phút thì đóng cửa sổ, gửi kết quả và giải phóng dữ liệu; có sự kiện mới của user đó thì mở cửa sổ mới. Session window cũng xử lý dữ liệu đến muộn: ví dụ cho phép trễ tối đa 5 phút để chịu đựng mạng và system latency; nếu một sự kiện đến muộn cho thấy thực ra user vẫn hoạt động trong vòng dưới 5 phút kể từ sự kiện cuối thì hệ thống mở lại cửa sổ.

Giá trị thay đổi lớn khi sessionize động gần thời gian thực: với bản hồi cứu, bạn có thể tự động hoá hành động một ngày hay một giờ sau khi phiên kết thúc (ví dụ email kèm phiếu giảm giá cho sản phẩm user đã xem); với bản động, user có thể nhận thông báo trong app *ngay lập tức* dựa trên hoạt động 15 phút vừa qua.

#### Tumbling window (cửa sổ cố định)

Có các khoảng **cố định**, chạy theo lịch cố định, xử lý toàn bộ dữ liệu từ khi cửa sổ trước đóng. Ví dụ đóng cửa sổ mỗi 20 giây và tính trung bình/median trên dữ liệu đến trong 20 giây đó; thống kê xuất ngay sau khi cửa sổ đóng. Nó tương tự ETL batch hằng ngày/hằng giờ, chỉ khác là mở cửa sổ thường xuyên hơn và kết quả có độ trễ thấp hơn. Sách nhấn mạnh nhiều lần: **batch là trường hợp đặc biệt của streaming**.

#### Sliding window (cửa sổ trượt)

Các sự kiện được nhóm vào cửa sổ có độ dài cố định nhưng các cửa sổ **có thể chồng lên nhau**. Ví dụ tạo cửa sổ 60 giây mới mỗi 30 giây. Cách trượt có thể thay đổi: coi cửa sổ trượt liên tục nhưng chỉ phát thống kê khi thoả điều kiện (trigger), ví dụ cửa sổ trượt 30 giây liên tục nhưng chỉ tính khi user bấm vào một banner cụ thể. Khi nhiều người bấm banner thì tần suất đầu ra rất cao, lúc vắng thì không cần tính.

| Loại cửa sổ | Đặc điểm | Ví dụ |
|---|---|---|
| Session | Theo từng khoá, đóng khi im lặng đủ lâu | Phiên người dùng, đóng sau 5 phút không hoạt động |
| Tumbling | Độ dài cố định, không chồng nhau | Thống kê mỗi 20 giây |
| Sliding | Độ dài cố định, chồng nhau | Cửa sổ 60 giây tạo mỗi 30 giây |

**Ba loại cửa sổ ở chuỗi Mây:**

| Loại cửa sổ | Câu hỏi ở Mây | Cách chia |
|---|---|---|
| Tumbling | Nhiệt độ trung bình tủ mát mỗi 5 phút | 08:00–08:05, 08:05–08:10, 08:10–08:15... không chồng nhau |
| Sliding | Trong 10 phút gần nhất, tủ có lúc nào vượt 8°C không, cập nhật mỗi phút | 08:00–08:10, 08:01–08:11, 08:02–08:12... chồng lên nhau |
| Session | Một khách lướt app đặt món bao lâu rồi mới chốt đơn | Mỗi khách một chuỗi riêng, đóng khi khách im 5 phút |

Ví dụ cụ thể với cảm biến tủ mát của cửa hàng Q1-Lê Lợi, tumbling window 5 phút biến các số đo rời rạc thành từng dòng tổng hợp:

| Số đo thô (thời điểm, °C) | Cửa sổ | Trung bình xuất ra |
|---|---|---|
| 08:01 → 4.0, 08:03 → 4.2 | 08:00–08:05 | 4.1 |
| 08:06 → 4.4, 08:09 → 6.8 | 08:05–08:10 | 5.6 |
| 08:11 → 8.5, 08:14 → 9.1 | 08:10–08:15 | 8.8 (vượt ngưỡng, báo quản lý cửa hàng) |

#### Watermark

Dữ liệu đôi khi đến không đúng thứ tự (Chương 7). **Watermark** là ngưỡng mà cửa sổ dùng để xác định dữ liệu có nằm trong khoảng thời gian đã định hay bị coi là **muộn**. Nếu dữ liệu đến là mới với cửa sổ nhưng có timestamp cũ hơn watermark thì nó được coi là dữ liệu đến muộn (late-arriving data).

**Ví dụ đời thường:** watermark giống giờ chốt sổ của thu ngân. Ca sáng chốt lúc 12:00 nhưng vẫn nhận hoá đơn ca sáng nộp trễ tới 12:10. Hoá đơn ca sáng nộp lúc 12:30 thì bị coi là muộn và xử lý riêng. Ở Mây, đơn từ app đặt món có thể tới trễ vì điện thoại khách mất sóng; sơ đồ dưới cho thấy hệ thống quyết định nhận hay xếp riêng một đơn như vậy.

```mermaid
sequenceDiagram
    participant App as App đặt món
    participant S as Hệ thống streaming
    participant D as Dashboard doanh thu
    App->>S: Đơn DH101 lúc 09.58 tới đúng giờ
    S->>D: Cửa sổ 09.00 tới 10.00 tạm tính
    Note over S: Watermark cho phép trễ tối đa 10 phút
    App->>S: Đơn DH102 lúc 09.59 tới lúc 10.05
    S->>D: Vẫn cộng vào cửa sổ 09.00 tới 10.00
    App->>S: Đơn DH103 lúc 09.57 tới lúc 10.30
    S->>S: Quá watermark, ghi vào bảng dữ liệu đến muộn
```

### 4.3. Kết hợp stream với dữ liệu khác

Cũng như batch, giá trị thường đến từ việc kết hợp dữ liệu. Có thể kết hợp nhiều stream, hoặc một stream với dữ liệu batch lịch sử.

- **Join bảng thông thường:** một số bảng có thể được cấp dữ liệu bởi stream; cách cơ bản nhất là join hai bảng này trong DB như bình thường, stream có thể nuôi một hoặc cả hai bảng.
- **Enrichment (làm giàu):** join một stream với dữ liệu khác để làm giàu thành stream mới. Ví dụ: nhà bán lẻ trực tuyến nhận stream sự kiện từ đối tác chứa product ID và user ID, muốn bổ sung chi tiết sản phẩm và nhân khẩu học người dùng. Họ đưa sự kiện qua hàm serverless để tra cứu sản phẩm và user trong DB trong bộ nhớ (như cache), thêm thông tin vào sự kiện và xuất sang stream khác. Nguồn làm giàu có thể ở bất cứ đâu (bảng trong data warehouse hay RDBMS, file trong object storage); chỉ cần đọc từ nguồn rồi lưu dữ liệu làm giàu ở chỗ stream truy xuất được.
- **Stream-to-stream join:** ngày càng nhiều hệ thống hỗ trợ join trực tiếp giữa các stream. Ví dụ nhà bán lẻ muốn kết hợp sự kiện web với stream từ nền tảng quảng cáo. Có thể đưa cả hai vào Spark nhưng phát sinh phức tạp: hai stream có thể đến điểm join với độ trễ chênh lệch lớn (nền tảng quảng cáo có thể trễ 5 phút; một số sự kiện như đóng phiên hay sự kiện trên điện thoại offline có thể trễ nhiều). Vì vậy kiến trúc join stream điển hình dựa vào **bộ đệm streaming** với thời gian lưu giữ cấu hình được: giữ lâu hơn thì tốn nhiều bộ nhớ và tài nguyên hơn. Mỗi sự kiện được join với dữ liệu trong bộ đệm và cuối cùng bị loại bỏ khi hết thời gian lưu giữ.

```mermaid
flowchart LR
    S1["Stream A"] --> B1["Bộ đệm A<br/>(thời gian lưu giữ)"]
    S2["Stream B"] --> B2["Bộ đệm B<br/>(thời gian lưu giữ)"]
    B1 --> J["Join khi tìm thấy<br/>sự kiện liên quan"]
    B2 --> J
    J --> O["Stream kết quả"]
```

**Enrichment ở Mây:** stream đơn hàng từ app chỉ chứa mã khách và mã món. Trước khi đưa sang bộ phận marketing, hệ thống tra thêm hạng thành viên và tên món, để mỗi sự kiện "tự đủ nghĩa":

| Sự kiện gốc | Sự kiện sau khi làm giàu |
|---|---|
| order DH205, khach K88, mon M03 | order DH205, khach K88 (hạng Vàng, Quận 3), mon M03 (Trà sữa trân châu, 35000) |

---

## Áp vào chuỗi trà sữa Mây

Gom các ý của bài lại, đây là cách đội dữ liệu của Mây dùng truy vấn hằng ngày:

```mermaid
flowchart LR
    subgraph nguon["Nguồn"]
        POS["POS ở quầy"]
        APP["App đặt món"]
        IOT["Cảm biến tủ mát"]
    end
    subgraph kho["Kho dữ liệu OLAP"]
        DH["Bảng don_hang<br/>partition theo ngày"]
        ND["Bảng nhiet_do"]
    end
    subgraph dung["Người dùng"]
        CHU["Chủ chuỗi<br/>dashboard doanh thu"]
        QL["Quản lý cửa hàng<br/>cảnh báo tủ mát"]
    end
    POS -->|"CDC, fast-follower"| DH
    APP -->|"CDC, fast-follower"| DH
    IOT -->|"stream, tumbling 5 phút"| ND
    DH -->|"truy vấn batch, có cache"| CHU
    ND -->|"truy vấn streaming"| QL
```

| Tình huống ở Mây | Kỹ thuật trong bài | Lợi ích |
|---|---|---|
| Chủ chuỗi mở dashboard 20 lần mỗi ngày | Cache kết quả truy vấn | Lần mở thứ hai trở đi gần như tức thì, không tốn thêm tiền quét |
| Báo cáo doanh thu tháng chạy chậm | Partition theo ngày, chỉ chọn cột cần | Quét ít dữ liệu, rẻ và nhanh hơn |
| Không muốn làm chậm máy POS khi phân tích | Fast-follower bằng CDC | Phân tích trên bản sao, quầy thu ngân không bị ảnh hưởng |
| Báo cáo khuyến mãi ra số gấp 3 bất thường | Kiểm tra row explosion | Phát hiện khoá join bị lặp |
| Thôi việc một nhân viên phân tích | DCL `REVOKE` | Thu hồi quyền xem dữ liệu ngay |
| Tủ mát nóng lên giữa ca | Tumbling window và watermark | Cảnh báo trong vài phút thay vì đợi báo cáo cuối ngày |

---

## Tóm tắt

| Chủ đề | Ý chính |
|---|---|
| Các nhóm lệnh SQL | DDL (đối tượng), DML (dữ liệu), DCL (quyền), TCL (giao dịch) |
| Vòng đời truy vấn | Biên dịch, bytecode, optimizer, thực thi |
| Join | Pre-join, đơn giản hoá điều kiện, coi chừng row explosion, dùng CTE |
| Giám sát | `EXPLAIN`, tài nguyên, kết nối, tranh chấp |
| Giảm quét | Chọn cột, partition, clustering, index; tránh `SELECT *` |
| Commit | PostgreSQL (khoá hàng), BigQuery (snapshot, 1 ghi một lúc), MongoDB (nhất quán tuỳ chỉnh) |
| VACUUM | Dọn dead record, cải thiện tốc độ và độ chính xác query plan |
| Cache | Tận dụng cache kết quả truy vấn để giảm chi phí và độ trễ |
| Streaming | Fast-follower CDC, Kappa; cửa sổ session/tumbling/sliding; watermark; enrichment và stream join qua bộ đệm |
