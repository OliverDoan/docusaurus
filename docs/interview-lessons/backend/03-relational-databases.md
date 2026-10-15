---
sidebar_position: 3
title: "3. Relational Databases"
---

# 3. Relational Databases

## 1. Hệ quản trị Relational Database

Bài học: [1. Hệ quản trị Relational Database](../../backend/03-relational-databases/1_database-systems.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt `RDB`, `RDBMS` và `SQL` — mỗi khái niệm chỉ cái gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba khái niệm ở ba tầng khác nhau:

| Khái niệm | Nó là gì |
| --- | --- |
| **RDB** (Relational Database) | **Mô hình dữ liệu** — quy ước tổ chức data thành bảng có cột và dòng, schema nghiêm ngặt, các bảng nối nhau bằng `foreign key` |
| **RDBMS** | **Phần mềm** hiện thực mô hình đó: PostgreSQL, MySQL/MariaDB, SQLite, MS SQL Server, Oracle |
| **SQL** | **Ngôn ngữ** để giao tiếp với RDBMS — định nghĩa schema, thêm/sửa/xoá/đọc data, phân quyền, quản lý transaction |

Ví dụ trong bài rất dễ nhớ: RDB là **công thức nấu ăn**, RDBMS là **cái bếp thật** nấu theo công thức đó, còn SQL là **thứ tiếng bạn nói với đầu bếp** để đặt món. Vì mọi bếp đều nghe cùng một thứ tiếng, học SQL xong đổi bếp nào cũng gọi món được, chỉ khác chút giọng địa phương (`dialect`).

</details>

**2. Kể 5 nhóm lệnh `DDL`/`DML`/`DQL`/`DCL`/`TCL` và cho ví dụ mỗi nhóm. Nhóm nào nằm trong phạm vi rollback được của một transaction?**

<details className="qa">
<summary>Xem đáp án</summary>

| Nhóm | Tên đầy đủ | Mục đích | Lệnh tiêu biểu |
| --- | --- | --- | --- |
| **DDL** | Data Definition Language | Định nghĩa cấu trúc | `CREATE`, `ALTER`, `DROP`, `TRUNCATE` |
| **DML** | Data Manipulation Language | Thao tác data | `INSERT`, `UPDATE`, `DELETE` |
| **DQL** | Data Query Language | Truy vấn data | `SELECT` |
| **DCL** | Data Control Language | Phân quyền | `GRANT`, `REVOKE` |
| **TCL** | Transaction Control Language | Quản lý giao dịch | `COMMIT`, `ROLLBACK`, `SAVEPOINT` |

**Về rollback:** **DML luôn rollback được** — đó chính là mục đích của transaction. Với **DDL** thì tuỳ engine:

- **PostgreSQL** hỗ trợ DDL có tính transaction, nên `CREATE TABLE`, `ALTER TABLE` nằm trong `BEGIN ... ROLLBACK` vẫn huỷ được. Đây là lý do migration trên Postgres an toàn hơn hẳn.
- **MySQL (InnoDB)** thì DDL gây **commit ngầm** — chạy `ALTER TABLE` là transaction đang mở bị commit luôn, không rollback được.

Nhóm TCL là công cụ điều khiển: `COMMIT` nghĩa là "ghi sổ chính thức", `ROLLBACK` là "xé tờ nháp, coi như chưa làm gì", `SAVEPOINT` cho phép lùi về một mốc giữa chừng.

</details>

**3. `DELETE`, `TRUNCATE` và `DROP` khác nhau thế nào về tốc độ, khả năng rollback và ảnh hưởng tới `AUTO_INCREMENT`/`SEQUENCE`?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `DELETE` | `TRUNCATE` | `DROP` |
| --- | --- | --- | --- |
| Nhóm | DML | DDL | DDL |
| Phạm vi | Xoá từng dòng, có `WHERE` | Xoá sạch mọi dòng, không có `WHERE` | Xoá luôn cả bảng và cấu trúc |
| Tốc độ | Chậm với bảng lớn (ghi log từng dòng) | Rất nhanh (giải phóng cả vùng lưu trữ) | Rất nhanh |
| Rollback | Được | Được trên PostgreSQL; không được trên MySQL (commit ngầm) | Như `TRUNCATE`: Postgres được, MySQL không |
| Trigger | Kích hoạt trigger theo dòng | Không kích hoạt trigger `DELETE` | Không |
| Bộ đếm id | Giữ nguyên | Đặt lại `AUTO_INCREMENT` (MySQL); Postgres chỉ reset sequence khi thêm `RESTART IDENTITY` | Mất luôn cùng bảng |

```sql
DELETE FROM users WHERE id = 1;          -- xoá có điều kiện
TRUNCATE TABLE users RESTART IDENTITY;   -- dọn sạch bảng, reset sequence
DROP TABLE users;                        -- bảng biến mất khỏi schema
```

Kinh nghiệm: cần lọc theo điều kiện thì dùng `DELETE`; dọn sạch bảng tạm hoặc bảng seed thì `TRUNCATE`; `DROP` chỉ dùng trong migration có kiểm soát.

</details>

**4. Vì sao nói học `SQL` quan trọng hơn học một RDBMS cụ thể? `dialect` gây khó khăn gì khi bạn phải chuyển engine?**

<details className="qa">
<summary>Xem đáp án</summary>

SQL là **chuẩn ANSI/ISO**, nên phần lõi — `SELECT`, `JOIN`, `GROUP BY`, subquery, CTE, window function, transaction, thiết kế schema và index — gần như giống nhau trên mọi engine. Nắm được phần này là bạn dùng được Postgres, MySQL hay SQLite; chuyển engine chỉ là học lại vài chi tiết. Ngược lại, thuộc lòng công cụ quản trị của một engine mà không hiểu SQL thì không mang đi đâu được. Quan trọng hơn cả engine vẫn là **hiểu SQL và thiết kế schema đúng**.

**Dialect gây khó ở đâu khi chuyển engine:**

- **Kiểu dữ liệu** — `SERIAL`/`IDENTITY` của Postgres và `AUTO_INCREMENT` của MySQL; `BOOLEAN` trên MySQL thực chất là `TINYINT`; Postgres có `timestamptz`, `UUID`, `ARRAY`, `JSONB` mà MySQL không có tương đương trực tiếp.
- **Hàm** — hàm chuỗi, hàm ngày tháng, nối chuỗi (`||` của Postgres so với `CONCAT` của MySQL) khác nhau.
- **Ngôn ngữ thủ tục** — PL/pgSQL, T-SQL, PL/SQL gần như phải viết lại hoàn toàn.
- **Phân biệt hoa thường và collation** — MySQL mặc định so sánh chuỗi không phân biệt hoa thường, Postgres thì có. Đây là nguồn lỗi âm thầm rất khó phát hiện.

ORM hiện đại (Prisma, Drizzle, TypeORM) che bớt khác biệt này, nên việc migrate không quá khó, nhưng những chỗ viết SQL thô thì vẫn phải rà tay.

</details>

**5. So sánh `PostgreSQL` và `MySQL` ở mức cụ thể: kiểu dữ liệu, `window function`, `JSON`/`JSONB`, `MVCC`, storage engine. Bạn chọn cái nào cho dự án mới và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | PostgreSQL | MySQL |
| --- | --- | --- |
| Kiểu dữ liệu | Rất phong phú: `JSONB`, `ARRAY`, `UUID`, `timestamptz`, `INET`, kiểu tự định nghĩa | Bộ kiểu cơ bản, không có array hay kiểu tự định nghĩa |
| Window function, CTE | Hỗ trợ đầy đủ và lâu đời, có CTE đệ quy | Chỉ có từ MySQL 8, ít tính năng hơn |
| JSON | `JSONB` lưu dạng nhị phân, đánh index được bằng `GIN`, có nhiều toán tử truy vấn | Kiểu `JSON` yếu hơn, index phải qua cột sinh (generated column) |
| MVCC | Giữ nhiều phiên bản dòng ngay trong bảng, cần `VACUUM` dọn dòng chết | InnoDB dùng undo log để dựng lại phiên bản cũ |
| Storage engine | Chỉ một engine tích hợp | Nhiều engine: InnoDB (mặc định, có transaction), MyISAM (cũ, không transaction) |
| Điểm mạnh khác | Full-text search, PostGIS, hệ extension mạnh (pgvector, TimescaleDB) | Hosting rẻ phổ biến, hệ sinh thái WordPress, Vitess/PlanetScale để scale ngang |

**Chọn gì cho dự án mới:** **PostgreSQL** — đây là lựa chọn mặc định năm 2026 cho khoảng 90% dự án mới. Lý do: nhiều tính năng nhất trong nhóm mã nguồn mở, truy vấn phức tạp không bị bó tay, có `JSONB` nên vừa chặt chẽ vừa linh hoạt, transaction ACID đầy đủ, và hệ extension mở đường cho AI, time series, bản đồ. Chỉ chọn MySQL khi đã có ràng buộc sẵn: hệ thống cũ, WordPress, hoặc hosting rẻ chỉ hỗ trợ MySQL.

</details>

**6. MySQL có nhiều storage engine (`InnoDB`, `MyISAM`) còn PostgreSQL chỉ có một. Điều đó ảnh hưởng gì tới transaction và foreign key?**

<details className="qa">
<summary>Xem đáp án</summary>

MySQL tách phần "SQL layer" khỏi phần lưu trữ, nên mỗi bảng có thể dùng một storage engine khác nhau — và **khả năng của bảng phụ thuộc vào engine của chính nó**:

| | InnoDB | MyISAM |
| --- | --- | --- |
| Transaction ACID | Có | **Không** |
| Foreign key | Có, ràng buộc được thực thi | **Không** — khai báo bị bỏ qua âm thầm |
| Khoá | Khoá theo dòng | Khoá cả bảng |
| Khôi phục sau sự cố | Có crash recovery | Dễ hỏng, phải sửa bảng thủ công |

Hệ quả nguy hiểm: một bảng lỡ tạo bằng MyISAM sẽ **im lặng bỏ qua** ràng buộc khoá ngoại và không tham gia transaction — code tưởng đang an toàn nhưng thực ra không. Đây là lỗi kinh điển với hệ thống cũ. Từ MySQL 5.5, InnoDB đã là mặc định, nên nguyên tắc là luôn dùng InnoDB và kiểm tra lại engine của các bảng kế thừa.

**PostgreSQL chỉ có một engine tích hợp sẵn**, nên không có chuyện này: mọi bảng đều có transaction và foreign key như nhau. Đổi lại là ít lựa chọn tinh chỉnh hơn — nhưng với hầu hết ứng dụng, sự nhất quán này có giá trị hơn nhiều.

</details>

**7. Khi nào nên lưu dữ liệu vào cột `JSONB` thay vì tách ra bảng riêng? Đánh index cho `JSONB` bằng loại index nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Nên dùng `JSONB` khi:**

- Dữ liệu có **cấu trúc không cố định** hoặc khác nhau theo từng dòng: thuộc tính sản phẩm theo ngành hàng, cấu hình người dùng, kết quả trả về từ API bên ngoài.
- Dữ liệu chỉ cần **đọc nguyên khối**, hiếm khi lọc hay join theo từng trường bên trong: payload webhook, ảnh chụp trạng thái để phục vụ audit log.
- Schema còn đang thay đổi nhanh trong giai đoạn đầu.

**Nên tách bảng riêng khi:**

- Trường đó thường xuyên nằm trong `WHERE`, `JOIN`, `ORDER BY` hoặc dùng để tổng hợp.
- Cần ràng buộc chặt: `NOT NULL`, `UNIQUE`, `CHECK`, khoá ngoại — `JSONB` không cho bạn những thứ này.
- Quan hệ thực sự là một-nhiều và cần truy vấn từ cả hai phía.

**Index cho `JSONB`:** dùng **`GIN`**.

```sql
-- Index toàn bộ document, hỗ trợ các toán tử chứa
CREATE INDEX idx_meta ON products USING GIN (meta);

-- Gọn và nhanh hơn nếu chỉ dùng toán tử chứa @>
CREATE INDEX idx_meta_path ON products USING GIN (meta jsonb_path_ops);

-- Chỉ một trường hay lọc: index biểu thức B-tree là đủ
CREATE INDEX idx_brand ON products ((meta->>'brand'));
```

Nguyên tắc chung: `JSONB` là cách thoát ra khỏi schema cứng ở vùng rìa dữ liệu, không phải cái cớ để bỏ hẳn việc thiết kế schema.

</details>

**8. So sánh `SQL` và `NoSQL`. Vì sao lý do 'MongoDB scale tốt hơn' thường không đủ để chọn NoSQL cho một app mới?**

<details className="qa">
<summary>Xem đáp án</summary>

| | SQL (quan hệ) | NoSQL (document, key-value, column, graph) |
| --- | --- | --- |
| Schema | Cố định, kiểm tra ở tầng database | Linh hoạt, mỗi document có thể khác nhau |
| Quan hệ | `JOIN` là việc bình thường | Thường phải nhân bản dữ liệu hoặc join ở tầng ứng dụng |
| Transaction | ACID đầy đủ, nhiều bảng | Có nhưng hạn chế hơn, thường ưu tiên tính sẵn sàng |
| Scale | Chủ yếu scale dọc, có replica và sharding | Sinh ra để scale ngang |
| Hợp với | Đa số nghiệp vụ: đơn hàng, tài chính, người dùng | Log, dữ liệu phi cấu trúc, cache, quy mô đọc ghi rất lớn |

**Vì sao lý do "scale tốt hơn" thường không đủ:**

- **Phần lớn ứng dụng không bao giờ chạm tới ngưỡng đó.** Một Postgres trên máy vừa phải xử lý được hàng nghìn giao dịch mỗi giây; tối ưu index và truy vấn còn tác dụng lớn hơn việc đổi database.
- **Cái giá trả ngay lập tức** thì rõ: mất ràng buộc toàn vẹn ở tầng database, tự viết join trong code, dễ lệch dữ liệu do nhân bản, và khó viết truy vấn tổng hợp cho báo cáo.
- **Postgres cũng đã linh hoạt** nhờ `JSONB`, nên lập luận "cần schema mềm" cũng không còn mạnh.
- Bản thân database quan hệ cũng scale được bằng replica đọc, partition và sharding khi thật sự cần.

Đúng như phần cảnh báo trong bài: đừng chọn "MongoDB vì nó scale" khi chưa thực sự cần. NoSQL dùng đúng chỗ, không phải mặc định.

</details>

**9. `SQLite` chỉ cho phép một writer tại một thời điểm — hệ quả gì với ứng dụng web? Trường hợp nào SQLite vẫn dùng production được?**

<details className="qa">
<summary>Xem đáp án</summary>

SQLite là database dạng file, nhúng thẳng trong tiến trình ứng dụng, và **chỉ một writer được ghi tại một thời điểm**. Đúng như ví dụ trong bài: cuốn sổ tay chỉ có một cây bút — nhiều người cùng đọc thì thoải mái, nhưng hai người muốn ghi cùng lúc thì phải chờ nhau.

**Hệ quả với web app:** khi nhiều request cùng ghi, chúng xếp hàng; nếu chờ quá lâu sẽ gặp lỗi kiểu "database is locked". Ngoài ra, vì database nằm ngay trên đĩa của máy chạy app nên **không chạy được nhiều instance dùng chung một database**, tức là không scale ngang theo cách thông thường. Bật chế độ **WAL** giúp người đọc không bị chặn bởi người ghi, cải thiện đáng kể nhưng vẫn không bỏ được giới hạn một writer.

**Vẫn dùng production được khi:**

- Ứng dụng **đọc nhiều, ghi ít**: blog, CMS, trang tài liệu, công cụ nội bộ, dashboard.
- Chạy trên **một máy duy nhất**, cần ít thành phần và độ trễ thấp vì không phải đi qua mạng.
- Có lớp bổ trợ: **Litestream** sao lưu liên tục lên S3, **LiteFS** nhân bản nhiều vùng, **Turso/Cloudflare D1** đưa SQLite ra edge.
- Ứng dụng mobile, desktop, CLI — đây vốn là sân nhà của SQLite.

Không phù hợp khi ghi đồng thời cao, ví dụ luồng thanh toán của một sàn thương mại điện tử.

</details>

**10. So sánh tự host database với dùng managed service (`RDS`, `Neon`, `Supabase`). Bạn mất và được gì ở mỗi hướng?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Tự host (VPS, máy riêng) | Managed service |
| --- | --- | --- |
| Chi phí tiền mặt | Rẻ hơn ở cùng cấu hình | Đắt hơn, nhưng đã gồm công vận hành |
| Vận hành | Bạn tự lo cài đặt, vá bảo mật, nâng phiên bản, giám sát | Nhà cung cấp lo phần lớn |
| Backup, khôi phục | Tự thiết lập và tự kiểm chứng | Backup tự động, thường có point-in-time recovery sẵn |
| Tính sẵn sàng cao | Tự dựng replica, tự làm failover | Bật vài tuỳ chọn là có |
| Kiểm soát | Toàn quyền: extension, tham số kernel, phiên bản | Bị giới hạn theo danh sách nhà cung cấp cho phép |
| Rủi ro | Phụ thuộc vào năng lực đội ngũ | Phụ thuộc nhà cung cấp, khó chuyển đi, chi phí tăng theo quy mô |

Các lựa chọn managed đáng chú ý: **AWS RDS / GCP Cloud SQL** cho kiểu truyền thống, **Neon** với khả năng tạo nhánh database như Git rất tiện cho môi trường preview, **Supabase** gói kèm auth, storage và edge function.

**Quan điểm thực dụng:** đội nhỏ, không có DBA thì gần như luôn nên dùng managed — thời gian tiết kiệm được đáng giá hơn phần chênh lệch chi phí, và rủi ro mất dữ liệu do sơ suất vận hành là thứ đắt nhất. Tự host chỉ hợp lý khi quy mô đủ lớn để chi phí thành vấn đề, hoặc có ràng buộc pháp lý buộc dữ liệu phải nằm trong hạ tầng của mình.

</details>

**11. Giải thích `replication` primary–replica. `Replication lag` gây ra vấn đề gì, và bạn xử lý tình huống `read-after-write` ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Replication primary–replica:** một node **primary** nhận toàn bộ lệnh ghi, rồi truyền luồng thay đổi (WAL của Postgres, binlog của MySQL) sang các **replica**. Replica áp dụng lại các thay đổi đó và phục vụ truy vấn đọc. Mục đích: chia tải đọc, có sẵn bản dự phòng để failover, và tách các truy vấn báo cáo nặng ra khỏi máy chính.

**Replication lag** là độ trễ giữa lúc primary ghi xong và lúc replica áp dụng xong — thường vài mili giây, nhưng có thể lên tới vài giây khi ghi dồn dập hoặc replica quá tải. Hệ quả: đọc từ replica có thể thấy **dữ liệu cũ**.

**Vấn đề `read-after-write`:** người dùng sửa hồ sơ, được báo thành công, nhưng trang tải lại đọc từ replica chưa kịp cập nhật và hiện ra dữ liệu cũ — trông như hệ thống bị lỗi.

Cách xử lý:

- **Đọc từ primary sau khi ghi**, trong một khoảng thời gian ngắn hoặc cho riêng người dùng vừa thao tác (sticky routing).
- **Chốt theo vị trí replication** — ghi lại LSN sau khi ghi, chỉ đọc từ replica đã bắt kịp tới vị trí đó.
- **Đọc đồng bộ** với những nghiệp vụ nhạy cảm (số dư, tồn kho) — luôn đi thẳng vào primary.
- **Cập nhật lạc quan ở giao diện** — hiển thị ngay giá trị vừa gửi, không chờ đọc lại.
- **Giám sát lag** và cảnh báo khi vượt ngưỡng.

</details>

**12. Khi nào cần `sharding` thay vì chỉ nâng cấu hình máy (`vertical scaling`)? `Vitess`/`PlanetScale` giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Thứ tự nên đi theo, chỉ bước sang mức sau khi mức trước hết đường:

1. **Tối ưu trước** — thêm index, sửa truy vấn chậm, bỏ N+1, thêm cache, dùng connection pool. Bước này thường mang lại nhiều nhất.
2. **Vertical scaling** — nâng CPU, RAM, ổ đĩa. Đơn giản, không phải đổi code; giới hạn là kích thước máy lớn nhất và chi phí tăng phi tuyến.
3. **Read replica** — nếu nghẽn nằm ở lượng đọc.
4. **Partition bảng** theo thời gian hoặc theo khoảng giá trị, vẫn trong một database.
5. **Sharding** — chia dữ liệu ra nhiều database theo một khoá.

**Chỉ sharding khi:** lượng ghi vượt sức một node, dữ liệu lớn tới mức một máy không chứa nổi, hoặc cần cô lập dữ liệu theo vùng địa lý hay theo khách hàng. Cái giá rất đắt: mất khả năng join giữa các shard, transaction xuyên shard trở nên khó, chọn sai shard key là bị lệch tải, và việc chia lại shard rất phức tạp.

**Vitess** (nền tảng đứng sau **PlanetScale**) là lớp trung gian đặt trước MySQL, lo giúp phần khó: định tuyến truy vấn tới đúng shard, gộp kết quả, quản lý metadata và chia lại shard mà gần như không ngừng dịch vụ — ứng dụng vẫn nói chuyện như với một MySQL duy nhất. PlanetScale còn bổ sung schema branching, cho phép thay đổi schema theo kiểu nhánh Git.

</details>

**13. Chiến lược backup của bạn là gì: full và incremental khác nhau ra sao, `PITR` (point-in-time recovery) là gì, và làm sao biết bản backup thực sự dùng được?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Full backup** — sao lưu toàn bộ database tại một thời điểm. Khôi phục đơn giản nhất nhưng tốn dung lượng và thời gian, nên thường chạy theo chu kỳ dài (hằng ngày, hằng tuần).
- **Incremental backup** — chỉ lưu phần thay đổi kể từ bản sao lưu trước. Nhanh và nhẹ, nhưng khi khôi phục phải có đủ chuỗi từ bản full gần nhất; mất một mắt xích là hỏng cả chuỗi.
- **PITR (point-in-time recovery)** — khôi phục về **đúng một thời điểm bất kỳ**, bằng cách lấy bản full gần nhất rồi phát lại nhật ký ghi (WAL của Postgres, binlog của MySQL) tới đúng giây mong muốn. Đây là thứ cứu bạn khi ai đó lỡ chạy `DELETE` thiếu `WHERE` lúc 10 giờ 32 phút.

Một chiến lược đầy đủ cần xác định rõ **RPO** (chấp nhận mất tối đa bao nhiêu dữ liệu) và **RTO** (chấp nhận ngừng dịch vụ bao lâu), lưu backup ở nơi tách biệt với database (S3 hoặc vùng khác), mã hoá, và đặt chính sách giữ nhiều mốc thời gian.

**Làm sao biết backup dùng được:** cách duy nhất đáng tin là **khôi phục thử định kỳ** vào một môi trường riêng, rồi kiểm chứng: số dòng ở các bảng chính, vài truy vấn nghiệp vụ, thời gian khôi phục thực tế. Backup chưa từng được khôi phục thử thì chỉ là niềm tin, không phải bản sao lưu.

</details>

**14. Vì sao PostgreSQL cần `connection pool` (`PgBouncer`)? Chuyện gì xảy ra khi môi trường serverless mở quá nhiều connection tới DB?**

<details className="qa">
<summary>Xem đáp án</summary>

PostgreSQL dùng mô hình **một tiến trình cho mỗi connection**. Mỗi kết nối tốn bộ nhớ riêng và tốn chi phí khởi tạo đáng kể, nên `max_connections` thường chỉ đặt ở mức vài trăm. Vượt ngưỡng đó, máy chủ tốn nhiều công chuyển ngữ cảnh và bộ nhớ hơn là làm việc thật — thông lượng đi xuống dù CPU vẫn bận.

**Connection pool** giải quyết bằng cách giữ sẵn một nhóm kết nối và cho ứng dụng dùng luân phiên. `PgBouncer` là pooler đặt ngoài database, nhận hàng nghìn kết nối từ phía ứng dụng nhưng chỉ mở vài chục kết nối thật tới Postgres. Ba chế độ chính là session, transaction và statement; chế độ **transaction** phổ biến nhất vì tận dụng kết nối tốt nhất, đổi lại không dùng được prepared statement theo phiên hay biến phiên.

**Với serverless:** mỗi lần hàm được gọi, một instance mới có thể tự mở connection riêng. Khi traffic tăng đột biến, hàng nghìn instance đồng thời mở kết nối, database nhanh chóng chạm `max_connections` và bắt đầu từ chối với lỗi "too many clients". Nghịch lý là phần tính toán scale rất tốt nhưng database thì gục. Cách xử lý: đặt một pooler trước database (PgBouncer, RDS Proxy, chế độ pooled của Neon/Supabase), dùng driver kết nối qua HTTP, và giới hạn kích thước pool ở mỗi instance.

</details>

**15. Bạn phải migrate một hệ thống đang chạy từ MySQL sang PostgreSQL. Nêu các rủi ro chính và cách giảm downtime.**

<details className="qa">
<summary>Xem đáp án</summary>

**Rủi ro chính:**

- **Khác biệt kiểu dữ liệu** — `AUTO_INCREMENT` sang `SERIAL`/`IDENTITY`, `TINYINT(1)` sang `BOOLEAN`, `DATETIME` sang `timestamptz`, kiểu `ENUM` và `UNSIGNED`.
- **Phân biệt hoa thường** — MySQL mặc định so sánh chuỗi không phân biệt hoa thường, Postgres thì có. Điều này âm thầm làm đổi kết quả đăng nhập theo email, tìm kiếm, ràng buộc `UNIQUE`.
- **SQL thô và stored procedure** — hàm khác nhau, PL/SQL phải viết lại.
- **Dữ liệu bẩn** mà MySQL vốn dễ dãi cho qua: ngày `0000-00-00`, chuỗi rỗng thay cho `NULL`, giá trị vi phạm khoá ngoại mà MyISAM không chặn.
- **Ứng dụng** — driver, ORM, chỉ số hiệu năng đổi, kế hoạch truy vấn khác nên có truy vấn đang nhanh bỗng chậm.

**Cách giảm downtime:**

1. Chuyển đổi schema trước, làm sạch dữ liệu bẩn ngay trên MySQL.
2. Nạp bản sao dữ liệu ban đầu sang Postgres, rồi bật **đồng bộ liên tục** (công cụ CDC như Debezium, hoặc pgloader cho bản nạp đầu).
3. Chạy song song **shadow read** — đọc từ cả hai bên và so sánh kết quả để phát hiện lệch.
4. Chọn cửa sổ chuyển đổi, **khoá ghi trong thời gian ngắn**, chờ đồng bộ bắt kịp, đối chiếu số lượng dòng và tổng kiểm tra.
5. Chuyển ứng dụng sang Postgres, theo dõi sát lỗi và latency.
6. **Giữ đường lùi** — MySQL vẫn chạy và còn đồng bộ ngược trong vài ngày trước khi gỡ bỏ.

</details>

**16. `charset`/`collation` và kiểu thời gian (`timestamp` với `timestamptz`) hay gây lỗi gì trong thực tế? Bạn lưu thời gian theo chuẩn nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Charset và collation:**

- `charset` quy định bảng mã lưu ký tự, `collation` quy định cách so sánh và sắp xếp.
- Lỗi kinh điển trên MySQL: dùng `utf8` — vốn chỉ là UTF-8 tối đa 3 byte — khiến emoji và một số ký tự bị cắt hoặc báo lỗi. Phải dùng `utf8mb4`.
- Collation mặc định của MySQL không phân biệt hoa thường, nên `Admin` và `admin` bị coi là trùng khi kiểm tra `UNIQUE`. Chuyển sang Postgres là hành vi đổi ngay.
- Join giữa hai cột khác collation có thể khiến index không dùng được, truy vấn chậm bất thường.
- Tiếng Việt có dấu sắp xếp đúng hay không cũng phụ thuộc collation.

**Timestamp và timestamptz (PostgreSQL):**

- `timestamp` (không có timezone) lưu con số trần, không mang thông tin múi giờ — hai người ở hai múi giờ đọc ra hai nghĩa khác nhau.
- `timestamptz` lưu thời điểm tuyệt đối theo UTC và quy đổi theo múi giờ của phiên khi đọc. Đây là thứ bạn gần như luôn muốn.

**Quy ước nên theo:** lưu mọi mốc thời gian ở **UTC**, dùng `timestamptz` trên Postgres, truyền qua API theo định dạng **ISO 8601** (ví dụ `2026-09-24T10:32:00Z`), và **chỉ quy đổi sang giờ địa phương ở tầng hiển thị**. Với dữ liệu thuần ngày như ngày sinh thì dùng `DATE`, đừng gắn múi giờ vào.

</details>

---

## 2. Khái niệm Database quan trọng

Bài học: [2. Khái niệm Database quan trọng](../../backend/03-relational-databases/2_database-concepts.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Index` hoạt động ra sao khiến việc tìm row nhanh hơn `full table scan`? Cấu trúc `B-tree` giúp gì ở đây?**

<details className="qa">
<summary>Xem đáp án</summary>

Không có index, database phải **quét tuần tự toàn bộ bảng** và so sánh từng dòng — độ phức tạp `O(n)`, bảng càng lớn càng chậm. Index là một cấu trúc dữ liệu phụ, lưu sẵn giá trị của cột theo thứ tự cùng con trỏ tới vị trí dòng thật, giúp nhảy thẳng tới chỗ cần.

Đúng như ví dụ trong bài: tìm chữ "database" trong cuốn sách 500 trang, không index thì lật từng trang, có index thì mở bảng tra cứu cuối sách xếp sẵn theo bảng chữ cái, tra ra ngay "trang 312".

**B-tree** (chính xác là B+ tree) là cây cân bằng, mỗi node chứa nhiều khoá đã sắp xếp:

- Chiều cao cây rất thấp — vài triệu dòng thường chỉ 3–4 tầng — nên tìm một giá trị chỉ mất `O(log n)` lần đọc.
- Cây luôn tự cân bằng khi thêm hoặc xoá, nên hiệu năng ổn định.
- Vì các khoá đã có thứ tự, B-tree phục vụ được cả tìm chính xác, tìm theo khoảng (`>`, `<`, `BETWEEN`) lẫn `ORDER BY` — đó là lý do nó là loại index mặc định.

</details>

**2. Index có những chi phí nào? Vì sao không nên đánh index cho mọi cột?**

<details className="qa">
<summary>Xem đáp án</summary>

Index không miễn phí:

- **Dung lượng đĩa** — mỗi index là một cấu trúc riêng; bảng có nhiều index có khi tốn chỗ hơn cả dữ liệu gốc.
- **Ghi chậm hơn** — mỗi `INSERT`, `UPDATE`, `DELETE` phải cập nhật lại tất cả index liên quan. Mười index nghĩa là mười lần cập nhật thêm cho mỗi lần ghi.
- **Bộ nhớ** — index muốn nhanh thì phải nằm trong RAM; index thừa chiếm mất chỗ cache của dữ liệu thật sự hữu ích.
- **Chi phí bảo trì** — index bị phình và phân mảnh theo thời gian, cần `VACUUM` hoặc dựng lại.
- **Query planner** có nhiều lựa chọn hơn thì cũng dễ chọn nhầm hơn.

Quay lại ví dụ cuốn sách: bảng tra cứu tốn thêm giấy, và mỗi lần sửa nội dung sách thì phải cập nhật lại bảng tra. Vì vậy không ai làm bảng tra cứu cho mọi từ.

**Chỉ nên index cột dùng cho:** điều kiện `WHERE` thường gặp, khoá `JOIN`, cột dùng `ORDER BY`, và ràng buộc `UNIQUE`. Cách kiểm chứng là đo bằng `EXPLAIN ANALYZE`, đồng thời rà soát và xoá bớt index không bao giờ được dùng tới.

</details>

**3. Phân biệt `clustered index` và `non-clustered index`. Vì sao mỗi bảng chỉ có tối đa một clustered index?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Clustered index | Non-clustered index |
| --- | --- | --- |
| Bản chất | Quyết định **thứ tự lưu trữ vật lý** của dòng trên đĩa; lá của cây chính là dữ liệu dòng | Cấu trúc tách rời, lá chứa khoá cùng con trỏ tới dòng |
| Tốc độ | Nhanh nhất khi tìm theo đúng khoá đó, đặc biệt với truy vấn theo khoảng | Phải đi thêm một bước tra dòng thật (trừ khi là covering index) |
| Số lượng | Tối đa một | Nhiều tuỳ nhu cầu |

**Vì sao chỉ một:** dữ liệu chỉ có thể được sắp xếp vật lý theo **một** thứ tự trên đĩa, giống như một cuốn sách chỉ có thể đóng theo một trình tự trang. Muốn sắp theo thứ tự khác thì phải làm bảng tra cứu riêng — đó chính là non-clustered index.

Lưu ý theo từng engine: **MySQL InnoDB** lưu bảng theo kiểu clustered quanh khoá chính, nên khoá chính nên nhỏ gọn và tăng dần (UUID ngẫu nhiên làm khoá chính gây phân mảnh nặng). **PostgreSQL** không có clustered index theo nghĩa này — dòng nằm trong heap không sắp thứ tự; lệnh `CLUSTER` chỉ sắp lại một lần chứ không tự duy trì.

</details>

**4. Giải thích quy tắc `leftmost prefix` với composite index `(a, b, c)`. Query nào tận dụng được index này, query nào không?**

<details className="qa">
<summary>Xem đáp án</summary>

Composite index sắp xếp dữ liệu theo `a` trước, trong mỗi nhóm `a` mới sắp theo `b`, rồi tới `c`. Vì vậy chỉ dùng được khi truy vấn cung cấp **tiền tố từ trái sang**: `a`, hoặc `a` và `b`, hoặc cả ba.

```sql
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- Tận dụng được
SELECT * FROM orders WHERE user_id = 1 ORDER BY created_at DESC;
SELECT * FROM orders WHERE user_id = 1 AND created_at > '2024-01-01';

-- Không tận dụng được (bỏ qua cột đầu tiên)
SELECT * FROM orders WHERE created_at > '2024-01-01';
```

Ví dụ trong bài rất dễ nhớ: danh bạ xếp theo `(Họ, Tên)` thì tìm mọi người họ Nguyễn được, tìm "Nguyễn Văn" cũng được, nhưng tìm mọi người tên Văn bất kể họ thì phải đọc hết danh bạ.

Hệ quả khi thiết kế: đặt cột hay lọc theo giá trị chính xác lên trước, cột lọc theo khoảng hoặc dùng để sắp xếp ra sau. Một index `(a, b, c)` đã bao gồm luôn công dụng của index `(a)` và `(a, b)`, nên không cần tạo thêm ba index riêng lẻ.

</details>

**5. `Covering index` là gì và vì sao nó nhanh hơn hẳn (`index-only scan`)?**

<details className="qa">
<summary>Xem đáp án</summary>

**Covering index** là index chứa **đủ mọi cột mà truy vấn cần** — cả cột trong điều kiện lọc lẫn cột trong danh sách `SELECT`. Khi đó database đọc xong index là có kết quả, **không phải quay lại bảng** để lấy dòng thật. PostgreSQL gọi bước này là **index-only scan**.

```sql
-- Truy vấn chỉ cần user_id và total
SELECT user_id, total FROM orders WHERE user_id = 1;

-- Index thường: tìm trong index rồi phải đọc thêm heap
CREATE INDEX idx_a ON orders(user_id);

-- Covering index: mọi thứ nằm sẵn trong index
CREATE INDEX idx_b ON orders(user_id) INCLUDE (total);
```

Vì sao nhanh hơn hẳn: bước quay lại bảng là **truy cập ngẫu nhiên trên đĩa**, mỗi dòng một lần; với truy vấn trả về hàng nghìn dòng, đây thường là phần tốn thời gian nhất. Index cũng nhỏ hơn bảng nên nhiều khả năng đã nằm sẵn trong cache.

Lưu ý riêng của PostgreSQL: index-only scan chỉ thật sự bỏ qua heap khi visibility map cho biết trang đó toàn dòng còn hiển thị, tức là bảng cần được `VACUUM` thường xuyên. Mệnh đề `INCLUDE` cho phép nhét cột phụ vào index mà không làm cồng kềnh phần khoá.

</details>

**6. Kể các trường hợp database bỏ qua index dù cột đã có index: bọc hàm lên cột, `LIKE '%abc'`, ép kiểu ngầm, selectivity thấp. Mỗi trường hợp khắc phục ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Bọc hàm lên cột** — index lưu giá trị gốc, không lưu giá trị đã biến đổi:

```sql
WHERE LOWER(email) = 'a@b.com'          -- bỏ qua index trên email
WHERE DATE(created_at) = '2024-01-01'   -- bỏ qua index trên created_at
```

Khắc phục: tạo index biểu thức `CREATE INDEX ON users (LOWER(email))`, hoặc viết lại thành điều kiện khoảng `created_at >= '2024-01-01' AND created_at < '2024-01-02'`.

**`LIKE '%abc'`** — ký tự đại diện ở đầu làm mất tiền tố, B-tree không định vị được. `LIKE 'abc%'` thì vẫn dùng index bình thường. Khắc phục: dùng full-text search, index `GIN` với `pg_trgm`, hoặc lưu thêm cột đảo chuỗi nếu chỉ cần khớp phần đuôi.

**Ép kiểu ngầm** — so sánh cột `VARCHAR` với số, hoặc `bigint` với chuỗi, khiến database phải chuyển kiểu cả cột. Khắc phục: truyền đúng kiểu từ tầng ứng dụng, thống nhất kiểu giữa các bảng khi join.

**Selectivity thấp** — điều kiện khớp quá nhiều dòng (ví dụ cột `is_active` mà 95% là `true`), planner tính ra quét tuần tự còn rẻ hơn. Đây là **lựa chọn đúng**, không phải lỗi. Khắc phục nếu thật sự cần: dùng partial index chỉ cho nhóm thiểu số, hoặc ghép cột đó vào composite index cùng cột có tính phân biệt cao.

Ngoài ra, thống kê lỗi thời cũng làm planner ước lượng sai — chạy `ANALYZE` để cập nhật.

</details>

**7. `Partial index` và `unique index` khác index thường thế nào, khi nào bạn dùng chúng?**

<details className="qa">
<summary>Xem đáp án</summary>

**Partial index** chỉ đánh index cho phần dòng thoả một điều kiện:

```sql
CREATE INDEX idx_orders_pending ON orders(created_at) WHERE status = 'pending';
```

Dùng khi truy vấn thường chỉ quan tâm một nhóm nhỏ trong bảng lớn: đơn hàng đang chờ xử lý, bản ghi chưa bị xoá mềm, job trong hàng đợi. Lợi ích là index nhỏ hơn rất nhiều nên nằm gọn trong RAM, tra nhanh hơn và làm chậm thao tác ghi ít hơn. Điều kiện của truy vấn phải khớp được với điều kiện của index thì planner mới dùng.

**Unique index** vừa là index vừa là **ràng buộc**: database từ chối mọi giá trị trùng.

```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

Dùng cho những trường buộc phải duy nhất: email, tên đăng nhập, mã đơn hàng. Quan trọng là đây là cách duy nhất chống trùng **đáng tin cậy** — kiểm tra ở tầng ứng dụng rồi mới ghi sẽ hỏng khi hai request chạy đồng thời. Lưu ý trên PostgreSQL, nhiều giá trị `NULL` vẫn được xem là khác nhau nên không bị chặn.

Hai thứ này kết hợp được: unique index có điều kiện, ví dụ email chỉ cần duy nhất trong nhóm tài khoản chưa bị xoá.

</details>

**8. Bạn đọc output của `EXPLAIN ANALYZE` như thế nào? Phân biệt `Seq Scan` với `Index Scan`, và ý nghĩa của cost ước lượng so với thời gian thực tế.**

<details className="qa">
<summary>Xem đáp án</summary>

`EXPLAIN` in ra **kế hoạch ước lượng**, còn `EXPLAIN ANALYZE` **chạy thật** rồi in kèm số liệu thực tế.

```sql
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'an@example.com';
```

Cách đọc: kế hoạch là một cây, **đọc từ node lá trở lên**. Mỗi node cho biết cách lấy dữ liệu, chi phí ước lượng và kết quả thật.

Các loại node hay gặp:

- **`Seq Scan`** — quét tuần tự cả bảng. Không hẳn là xấu: với bảng nhỏ hoặc khi truy vấn lấy phần lớn số dòng, đây là cách rẻ nhất.
- **`Index Scan`** — tra index rồi lấy dòng tương ứng từ bảng. Hợp khi kết quả ít.
- **`Index Only Scan`** — đọc xong index là đủ, nhanh nhất.
- **`Bitmap Heap Scan`** — nằm giữa hai thái cực, hợp với số dòng ở mức trung bình.
- Các node join: `Nested Loop`, `Hash Join`, `Merge Join`.

**Cost ước lượng so với thời gian thực tế:** `cost=0.00..8.27` là đơn vị chi phí nội bộ, không phải mili giây, chỉ dùng để so sánh giữa các phương án. `actual time` mới là thời gian thật. Điều đáng chú ý nhất là so sánh **`rows` ước lượng với `rows` thực tế**: lệch nhau nhiều lần nghĩa là thống kê lỗi thời hoặc planner ước lượng sai, dẫn tới chọn nhầm kế hoạch — hãy chạy `ANALYZE` để cập nhật. Ngoài ra nên để ý số vòng lặp (`loops`) cao bất thường và các bước sắp xếp phải đổ ra đĩa.

</details>

**9. Phân biệt `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, `FULL OUTER JOIN` và `CROSS JOIN`. Cho một ví dụ nghiệp vụ bắt buộc phải dùng `LEFT JOIN`.**

<details className="qa">
<summary>Xem đáp án</summary>

Vẫn dùng ví dụ hai tờ danh sách của cô giáo — danh sách học sinh và danh sách bài đã nộp, ghép theo mã học sinh:

| Kiểu JOIN | Kết quả |
| --- | --- |
| `INNER JOIN` | Chỉ những học sinh đã nộp bài — có mặt ở cả hai tờ |
| `LEFT JOIN` | Mọi học sinh; ai chưa nộp thì ô "bài nộp" để trống (`NULL`) |
| `RIGHT JOIN` | Mọi bài nộp; bài nào không tra ra học sinh thì ô "tên" để trống |
| `FULL OUTER JOIN` | Gộp cả hai tờ, bên nào thiếu thì để trống |
| `CROSS JOIN` | Ghép mỗi học sinh với mọi bài nộp — tích Descartes, 30 × 30 = 900 dòng vô nghĩa |

**Ví dụ bắt buộc dùng `LEFT JOIN`:** liệt kê học sinh **chưa nộp bài**. `INNER JOIN` không làm được vì nó loại sạch những dòng không khớp — mà đó lại đúng là thứ ta cần tìm.

```sql
SELECT u.name
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
WHERE p.id IS NULL;
```

Các trường hợp tương tự: đếm số bài viết của từng người dùng kể cả người có 0 bài, hiển thị giỏ hàng kèm mã giảm giá có thể không có, báo cáo doanh thu theo ngày kể cả ngày không phát sinh đơn.

</details>

**10. Với `LEFT JOIN`, đặt điều kiện lọc ở mệnh đề `ON` khác đặt ở `WHERE` như thế nào? Vì sao đặt sai chỗ biến LEFT JOIN thành INNER JOIN?**

<details className="qa">
<summary>Xem đáp án</summary>

Khác biệt nằm ở **thứ tự thực thi**: điều kiện trong `ON` được áp dụng **trong lúc ghép bảng**, còn điều kiện trong `WHERE` áp dụng **sau khi đã ghép xong**.

```sql
-- A. Điều kiện trong ON: giữ MỌI user; chỉ ghép bài viết đã publish
SELECT u.name, p.title
FROM users u
LEFT JOIN posts p ON p.user_id = u.id AND p.status = 'published';

-- B. Điều kiện trong WHERE: LEFT JOIN thành INNER JOIN
SELECT u.name, p.title
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
WHERE p.status = 'published';
```

Ở câu B, những người dùng không có bài viết nào sẽ nhận dòng ghép với toàn `NULL`. Sau đó `WHERE p.status = 'published'` được áp lên, mà `NULL = 'published'` cho kết quả không phải `true`, nên các dòng đó **bị loại sạch**. Kết quả đúng bằng `INNER JOIN` — vế trái mất hết những dòng không khớp, tức là mất luôn ý nghĩa của `LEFT JOIN`.

Quy tắc ghi nhớ: điều kiện lọc **bảng bên phải** thì đặt trong `ON`; điều kiện lọc **bảng bên trái** thì đặt ở `WHERE`. Ngoại lệ hữu ích là `WHERE p.id IS NULL` — đây chính là cách cố ý tìm những dòng không khớp.

</details>

**11. `WHERE` và `HAVING` khác nhau ở đâu? Nêu thứ tự thực thi logic của một câu `SELECT` (`FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`).**

<details className="qa">
<summary>Xem đáp án</summary>

Thứ tự thực thi logic:

1. **`FROM`** và các `JOIN` — dựng tập dữ liệu nguồn.
2. **`WHERE`** — lọc **từng dòng**, trước khi gom nhóm.
3. **`GROUP BY`** — gom dòng thành nhóm.
4. **`HAVING`** — lọc **từng nhóm**, dựa trên hàm tổng hợp.
5. **`SELECT`** — tính các biểu thức và bí danh cột.
6. **`ORDER BY`** — sắp xếp.
7. **`LIMIT`/`OFFSET`** — cắt lấy phần cần.

**Khác biệt then chốt:** `WHERE` chạy *trước* khi gom nhóm nên không dùng được hàm tổng hợp; `HAVING` chạy *sau* nên dùng được `COUNT`, `SUM`, `AVG`.

```sql
SELECT u.id, COUNT(p.id) AS post_count
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
WHERE u.created_at > NOW() - INTERVAL '30 days'  -- lọc từng user
GROUP BY u.id
HAVING COUNT(p.id) > 5                            -- lọc từng nhóm
ORDER BY post_count DESC
LIMIT 10;
```

Hai hệ quả thực tế: nên đẩy càng nhiều điều kiện vào `WHERE` càng tốt vì lọc sớm thì phải gom nhóm ít dữ liệu hơn; và vì `SELECT` chạy sau `WHERE`, bí danh đặt trong `SELECT` không dùng được ở `WHERE` (nhưng `ORDER BY` thì được, vì nó chạy sau).

</details>

**12. `Foreign key` mang lại lợi ích gì? Nêu các trường hợp chấp nhận bỏ FK và giải thích `ON DELETE CASCADE`/`SET NULL`/`RESTRICT` khác nhau ra sao.**

<details className="qa">
<summary>Xem đáp án</summary>

**Lợi ích:** foreign key là "nội quy" do chính database thực thi — mã tham chiếu ghi trên bảng con bắt buộc phải tồn tại ở bảng cha. Nhờ vậy không bao giờ có dòng mồ côi, lỗi ở tầng ứng dụng bị chặn ngay tại nguồn thay vì âm thầm làm hỏng dữ liệu, và schema tự nó mô tả rõ quan hệ giữa các bảng cho người đọc và cho công cụ.

**Các `ON DELETE` action:**

| Action | Khi xoá user |
| --- | --- |
| `CASCADE` | Xoá luôn post của user đó |
| `SET NULL` | Giữ post lại, đặt `post.user_id = NULL` (cột phải cho phép `NULL`) |
| `RESTRICT` | Báo lỗi, không cho xoá chừng nào user còn post |
| `NO ACTION` | Mặc định, giống `RESTRICT` nhưng kiểm tra được hoãn tới cuối transaction |

Chọn thế nào: `CASCADE` cho dữ liệu thật sự thuộc sở hữu của bản ghi cha (ảnh của một bài viết, dòng chi tiết của một đơn hàng); `SET NULL` khi bản ghi con vẫn còn giá trị dù mất người tạo (bình luận để "khuyết danh"); `RESTRICT` cho dữ liệu quan trọng, buộc người dùng xử lý tường minh.

**Trường hợp chấp nhận bỏ FK:** mỗi microservice có database riêng nên không thể tham chiếu chéo; hệ thống ghi với thông lượng cực cao mà ràng buộc gây tranh chấp; mô hình event sourcing với dữ liệu bất biến; hoặc bảng phân mảnh theo shard. Với phần lớn ứng dụng monolith thì **giữ FK** — lợi ích lớn hơn nhiều so với chi phí hiệu năng.

</details>

**13. Thiết kế quan hệ `many-to-many` thế nào? Vì sao bảng trung gian thường dùng composite primary key thay vì cột `id` riêng?**

<details className="qa">
<summary>Xem đáp án</summary>

Quan hệ nhiều-nhiều không biểu diễn trực tiếp được bằng một khoá ngoại, nên phải tách ra **bảng trung gian** chứa hai khoá ngoại trỏ về hai phía:

```sql
CREATE TABLE user_roles (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Index bổ sung cho chiều tra ngược
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
```

**Vì sao dùng composite primary key `(user_id, role_id)`:**

- Nó **tự động chống trùng** — một người không thể được gán cùng một vai trò hai lần. Nếu thêm cột `id` tự tăng làm khoá chính thì vẫn phải tạo thêm ràng buộc `UNIQUE (user_id, role_id)`, tức là cùng một việc nhưng tốn thêm một cột và một index.
- **Gọn hơn** — bớt một cột và bớt một cấu trúc index trên bảng vốn thường rất nhiều dòng.
- Khoá chính đã sẵn là index tổng hợp, phục vụ luôn truy vấn tra vai trò của một người.

**Khi nào vẫn nên có cột `id` riêng:** khi bảng trung gian mang thêm thuộc tính và trở thành một thực thể nghiệp vụ thật sự — ví dụ `order_items` có số lượng, đơn giá, hoặc `enrollments` có ngày ghi danh và điểm số — nhất là khi có bảng khác cần tham chiếu tới chính dòng đó, hoặc ORM yêu cầu khoá chính đơn.

</details>

**14. `N+1 problem` là gì, nó phát sinh thế nào trong ORM và trong GraphQL resolver? Nêu ít nhất ba cách fix.**

<details className="qa">
<summary>Xem đáp án</summary>

**N+1** là việc chạy **1 truy vấn lấy danh sách, rồi thêm N truy vấn** để lấy dữ liệu liên quan cho từng phần tử. 100 người dùng thành 101 truy vấn. Giống chuyện đi chợ: mua 100 món mà chạy đi chạy về 100 lượt, phần tốn thời gian là quãng đường chứ không phải việc nhặt món.

**Trong ORM:** vòng lặp cộng với lazy load. Truy cập `user.posts` bên trong vòng lặp khiến ORM âm thầm bắn một truy vấn mỗi lần lặp. Rất khó thấy vì code trông hoàn toàn bình thường.

**Trong GraphQL:** resolver chạy theo từng trường của từng phần tử. Truy vấn lấy 50 bài viết rồi mỗi bài hỏi tác giả sẽ sinh 50 truy vấn; lồng thêm một tầng nữa thì bùng nổ theo cấp số nhân.

**Ba cách fix:**

Eager load bằng ORM:

```js
const users = await db.user.findMany({ include: { posts: true } });
```

JOIN thủ công:

```sql
SELECT u.*, p.* FROM users u LEFT JOIN posts p ON p.user_id = u.id;
```

Batch query rồi gom nhóm ở tầng ứng dụng:

```js
const userIds = users.map(u => u.id);
const posts = await db.post.findMany({ where: { userId: { in: userIds } } });
const postsByUser = groupBy(posts, "userId");
// tổng cộng 2 truy vấn
```

Với GraphQL, giải pháp chuẩn là **DataLoader** — gom các lời gọi trong cùng một vòng sự kiện thành một truy vấn duy nhất và cache trong phạm vi một request.

</details>

**15. Eager load bằng một câu `JOIN` có nhược điểm gì (dữ liệu bị nhân bản) so với cách chạy hai query rồi gom nhóm ở tầng ứng dụng?**

<details className="qa">
<summary>Xem đáp án</summary>

Với `JOIN`, mỗi dòng bên bảng con kéo theo **một bản sao đầy đủ của dòng bên bảng cha**. Một người dùng có 100 bài viết thì thông tin người dùng đó bị lặp lại 100 lần trong kết quả trả về.

Hệ quả:

- **Lượng dữ liệu truyền qua mạng phình to** — nhất là khi bảng cha có cột `TEXT` hoặc `JSONB` lớn.
- **Nhân bản theo cấp số nhân** khi join nhiều quan hệ một-nhiều cùng lúc: một người có 10 bài viết và 10 bình luận sẽ cho 100 dòng thay vì 20. Đây là cái bẫy kinh điển.
- **Tầng ứng dụng vẫn phải gom nhóm lại** để dựng cấu trúc lồng nhau, nên công sức không tiết kiệm được bao nhiêu.
- Kết hợp với `LIMIT` thì dễ sai, vì `LIMIT` đếm dòng đã nhân bản chứ không đếm số người dùng.

**Chạy hai truy vấn rồi gom nhóm** tránh hết những chuyện trên: mỗi dòng chỉ truyền một lần, dùng `LIMIT` đúng nghĩa, và nhiều quan hệ thì chỉ thêm một truy vấn cho mỗi quan hệ chứ không nhân lên. Cái giá là thêm một vòng đi lại tới database và phải gom nhóm trong code — không đáng kể so với lợi ích. Đây cũng là lý do Prisma mặc định tách truy vấn, còn SQLAlchemy có `selectinload` bên cạnh `joinedload`.

**Khi nào `JOIN` vẫn tốt hơn:** quan hệ một-một hoặc nhiều-một (không có nhân bản), hoặc khi chỉ cần vài cột nhỏ từ bảng cha.

</details>

**16. Làm sao phát hiện `N+1` khi nó không lộ ra ở môi trường local? Bạn dùng công cụ hoặc chỉ số nào?**

<details className="qa">
<summary>Xem đáp án</summary>

N+1 khó thấy ở local vì dữ liệu ít và database nằm ngay trên máy: 101 truy vấn với độ trễ gần bằng 0 vẫn cho cảm giác nhanh. Lên production, dữ liệu lớn và mỗi truy vấn phải đi qua mạng, con số đó thành vài trăm mili giây.

Cách phát hiện:

- **Bật log truy vấn của ORM và đếm số query mỗi request.** Đây là cách hiệu quả nhất. Có thể thêm middleware tự đếm và cảnh báo khi một request vượt ngưỡng, ví dụ 20 truy vấn.
- **Viết test tự động** khẳng định số truy vấn cho một endpoint không vượt quá mức cho phép — chống hồi quy rất tốt.
- **Công cụ APM** như Datadog, New Relic, Sentry Performance: xem biểu đồ trace của một request, N+1 hiện lên thành một dãy dài các truy vấn giống hệt nhau nối tiếp.
- **`pg_stat_statements`** trên PostgreSQL — sắp xếp theo số lần gọi, truy vấn nào có `calls` cao bất thường mà mỗi lần rất nhẹ thì gần như chắc chắn là N+1. **pgBadger** phân tích log theo cách tương tự.
- **Seed dữ liệu sát thực tế ở môi trường staging** để vấn đề lộ ra trước khi lên production.

Chỉ số đáng theo dõi: **số truy vấn trên mỗi request**, và tỷ lệ thời gian nằm ở database trong tổng thời gian xử lý. Dấu hiệu nghi ngờ rõ nhất là thời gian phản hồi tăng tuyến tính theo số phần tử trong danh sách trả về.

</details>

**17. Giải thích `ACID` qua ví dụ chuyển khoản. Chữ nào do database lo, chữ nào lập trình viên vẫn phải tự đảm bảo?**

<details className="qa">
<summary>Xem đáp án</summary>

Chuyển 100k từ tài khoản A sang B gồm hai việc: trừ tiền A, cộng tiền B.

- **Atomicity (nguyên tử)** — cả hai cùng xong hoặc coi như chưa có gì. Mất điện giữa chừng thì `ROLLBACK`, tiền không bốc hơi. **Database lo.**
- **Consistency (nhất quán)** — database chuyển từ trạng thái hợp lệ sang trạng thái hợp lệ, mọi ràng buộc vẫn đúng. **Chia đôi:** database thực thi những ràng buộc bạn đã khai báo (`CHECK (balance >= 0)`, khoá ngoại, `UNIQUE`); còn quy tắc nghiệp vụ — như "không cho chuyển quá số dư" — thì **lập trình viên phải tự viết**, hoặc khai báo thành ràng buộc để database gác hộ.
- **Isolation (cô lập)** — trong lúc chuyển tiền dở dang, người khác tra số dư không được nhìn thấy trạng thái nửa vời. **Database lo, nhưng ở mức độ do bạn chọn** qua isolation level. Chọn mức quá lỏng thì vẫn gặp lost update; đó là phần lập trình viên phải quyết định, kèm việc dùng khoá hoặc cột `version` khi cần.
- **Durability (bền vững)** — `COMMIT` xong là dữ liệu còn đó kể cả khi máy chủ sập. **Database lo**, thông qua write-ahead log; phần còn lại thuộc về vận hành: cấu hình `fsync`, replication, backup.

Tóm lại: database bảo đảm phần cơ chế; lập trình viên phải **đặt đúng ranh giới transaction**, **chọn đúng isolation level** và **khai báo đủ ràng buộc nghiệp vụ**.

</details>

**18. Ba hiện tượng `dirty read`, `non-repeatable read`, `phantom read` là gì? Isolation level nào ngăn được cái nào, và default của PostgreSQL với MySQL là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Dirty read** — đọc phải dữ liệu mà transaction khác đã sửa nhưng **chưa commit**; nếu bên kia rollback thì thứ bạn đọc chưa từng tồn tại.
- **Non-repeatable read** — đọc cùng **một dòng** hai lần trong cùng transaction lại ra hai giá trị khác nhau, vì giữa hai lần đó có transaction khác sửa rồi commit.
- **Phantom read** — chạy cùng **một truy vấn theo điều kiện** hai lần lại ra số lượng dòng khác nhau, vì có dòng mới được thêm vào khớp điều kiện đó.

| Level | Dirty read | Non-repeatable read | Phantom read |
| --- | --- | --- | --- |
| Read Uncommitted | Có | Có | Có |
| Read Committed | Không | Có | Có |
| Repeatable Read | Không | Không | Có |
| Serializable | Không | Không | Không |

**Mặc định:** PostgreSQL dùng **Read Committed**, MySQL InnoDB dùng **Repeatable Read**.

Vài chi tiết đáng nhớ: PostgreSQL không thực sự có Read Uncommitted — chọn mức đó vẫn chạy như Read Committed. Mức Repeatable Read của InnoDB nhờ cơ chế next-key lock nên trong thực tế chặn được phần lớn phantom. Còn Serializable của PostgreSQL dùng kiểm soát đồng thời theo kiểu lạc quan, nên transaction có thể bị huỷ với lỗi serialization và ứng dụng phải sẵn sàng thử lại.

</details>

**19. `MVCC` hoạt động ra sao và vì sao trong PostgreSQL việc đọc không chặn việc ghi? `VACUUM` sinh ra để giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**MVCC (Multi-Version Concurrency Control)** nghĩa là database giữ **nhiều phiên bản** của cùng một dòng. Trong PostgreSQL, `UPDATE` không ghi đè tại chỗ mà **tạo một phiên bản dòng mới**, đánh dấu phiên bản cũ là hết hiệu lực từ một mốc transaction nhất định. Mỗi transaction nhìn thấy ảnh chụp dữ liệu phù hợp với thời điểm nó bắt đầu.

**Vì sao đọc không chặn ghi và ngược lại:** người đọc không cần khoá gì cả — nó chỉ chọn phiên bản dòng phù hợp với ảnh chụp của mình. Người ghi tạo phiên bản mới, không đụng tới phiên bản mà người đọc đang xem. Nhờ vậy báo cáo chạy hàng phút không làm nghẽn luồng ghi của ứng dụng. Chỉ hai người **cùng ghi một dòng** mới phải chờ nhau.

**Cái giá và vai trò của `VACUUM`:** các phiên bản cũ không còn ai nhìn thấy vẫn nằm lại trong bảng, gọi là dead tuple. Không dọn thì bảng và index phình lên (table bloat), quét chậm dần, và bộ đếm transaction id có nguy cơ quay vòng.

`VACUUM` làm ba việc: đánh dấu không gian của dead tuple để tái sử dụng, cập nhật visibility map (điều kiện để có index-only scan), và làm đông cứng transaction id để tránh wraparound. `autovacuum` chạy tự động, nhưng với bảng ghi nhiều thường phải chỉnh tham số cho chạy thường xuyên hơn. `VACUUM FULL` thu hồi được dung lượng thật trả về hệ điều hành nhưng khoá toàn bảng, nên tránh dùng lúc đang phục vụ.

</details>

**20. `Deadlock` xảy ra khi nào? Vì sao thống nhất thứ tự lock giữa các transaction lại giảm được deadlock?**

<details className="qa">
<summary>Xem đáp án</summary>

**Deadlock** xảy ra khi hai transaction giữ khoá mà bên kia đang cần, tạo thành vòng chờ khép kín, không bên nào đi tiếp được.

```sql
-- Transaction 1
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;  -- giữ khoá dòng 1
UPDATE accounts SET balance = balance + 100 WHERE id = 2;  -- chờ khoá dòng 2

-- Transaction 2 (chạy đồng thời)
BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 2;   -- giữ khoá dòng 2
UPDATE accounts SET balance = balance + 50 WHERE id = 1;   -- chờ khoá dòng 1
```

Database phát hiện vòng chờ và **huỷ một trong hai** transaction (nạn nhân), trả về lỗi deadlock; bên còn lại đi tiếp.

**Vì sao thống nhất thứ tự khoá lại hiệu quả:** deadlock cần một **chu trình** trong đồ thị chờ. Nếu mọi transaction đều khoá tài nguyên theo cùng một thứ tự — chẳng hạn luôn theo `id` tăng dần — thì không thể có chuyện A giữ 1 chờ 2 trong khi B giữ 2 chờ 1, vì B cũng sẽ xin khoá dòng 1 trước. Không có chu trình thì không có deadlock.

Trong ví dụ trên, chỉ cần sắp xếp hai `id` rồi cập nhật theo thứ tự tăng dần là hết. Các biện pháp bổ sung: giữ transaction ngắn nhất có thể, giảm số dòng bị khoá, đặt `lock_timeout`, và luôn có cơ chế **thử lại** vì deadlock không bao giờ triệt tiêu được hoàn toàn.

</details>

**21. So sánh `pessimistic locking` (`SELECT ... FOR UPDATE`) với `optimistic locking` (cột `version`). Trường hợp nào bạn chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Pessimistic locking | Optimistic locking |
| --- | --- | --- |
| Cách làm | Khoá dòng ngay khi đọc, người khác phải chờ | Không khoá; lúc ghi mới kiểm tra dữ liệu có bị đổi không |
| Cài đặt | `SELECT ... FOR UPDATE` trong transaction | Cột `version` hoặc `updated_at`, `UPDATE ... WHERE version = ?` |
| Khi tranh chấp | Chờ, có thể timeout hoặc deadlock | Ghi thất bại, ứng dụng phải thử lại |
| Chi phí | Giữ khoá suốt transaction, giảm đồng thời | Gần như không tốn gì khi ít tranh chấp |

```sql
-- Pessimistic
BEGIN;
SELECT * FROM inventory WHERE id = 1 FOR UPDATE;
UPDATE inventory SET qty = qty - 1 WHERE id = 1;
COMMIT;

-- Optimistic
UPDATE products SET price = 120, version = version + 1
WHERE id = 1 AND version = 7;
-- Trả về 0 dòng bị ảnh hưởng nghĩa là có người đã sửa trước, cần thử lại
```

**Chọn pessimistic khi:** tranh chấp cao và việc thử lại tốn kém hoặc gây khó chịu — trừ tồn kho lúc flash sale, chia số dư, cấp phát số thứ tự. Điều kiện là transaction phải thật ngắn.

**Chọn optimistic khi:** tranh chấp thấp, thao tác kéo dài qua nhiều bước hoặc qua nhiều request HTTP (giữ khoá suốt thời gian người dùng điền form là không chấp nhận được), hoặc hệ thống cần thông lượng cao. Đây cũng là cách phát hiện xung đột chỉnh sửa để báo cho người dùng biết "bản ghi vừa bị người khác thay đổi".

</details>

**22. Một transaction mở quá lâu gây ra những vấn đề gì cho hệ thống?**

<details className="qa">
<summary>Xem đáp án</summary>

Transaction dài là một trong những nguyên nhân sự cố âm thầm và khó chẩn đoán nhất:

- **Giữ khoá lâu** — mọi transaction khác cần cùng dòng đó phải xếp hàng, độ trễ tăng dây chuyền, dễ dẫn tới timeout và deadlock.
- **Chặn `VACUUM`** — PostgreSQL không thể dọn dead tuple mới hơn transaction cũ nhất đang mở. Một transaction quên đóng có thể khiến bảng phình to liên tục dù autovacuum vẫn chạy.
- **Giữ connection** — connection pool cạn, request mới không xin được kết nối dù database chưa hề quá tải.
- **Chặn thao tác DDL** — migration cần khoá bảng sẽ nằm chờ, và trong lúc chờ nó lại chặn tiếp mọi truy vấn đến sau.
- **Rollback tốn kém** — transaction càng làm nhiều việc, huỷ bỏ càng lâu.
- **Nguy cơ mất nhiều công** — lỗi ở bước cuối làm mất toàn bộ công việc từ đầu.

Nguyên nhân phổ biến nhất: **gọi API bên ngoài, gửi mail, xử lý file ngay bên trong transaction**. Nguyên tắc là transaction chỉ bao đúng những lệnh ghi cần tính nguyên tử; mọi việc chậm và không thuộc database phải nằm ngoài, hoặc đẩy sang hàng đợi chạy nền. Nên đặt `statement_timeout` cùng `idle_in_transaction_session_timeout` và giám sát transaction chạy lâu nhất.

</details>

**23. Chạy `ALTER TABLE ADD COLUMN` trên bảng hàng chục triệu row có lock không? Nêu pattern zero-downtime để thêm một cột `NOT NULL` và để đổi tên cột.**

<details className="qa">
<summary>Xem đáp án</summary>

Tuỳ phiên bản, nên phải đọc tài liệu đúng bản đang chạy trước khi thao tác trên production:

- **PostgreSQL từ bản 11**: thêm cột cho phép `NULL`, hoặc có `DEFAULT` là hằng số, được thực hiện **tức thì** — chỉ sửa metadata, không viết lại bảng. Nhưng lệnh vẫn cần khoá `ACCESS EXCLUSIVE` trong khoảnh khắc, nên nếu có truy vấn dài đang chạy thì nó phải xếp hàng và chặn mọi thứ phía sau. Cách an toàn là đặt `lock_timeout` ngắn rồi thử lại.
- **MySQL**: nhiều thao tác `ALTER` phải viết lại cả bảng và khoá lâu; cần dùng công cụ như `pt-online-schema-change` hoặc `gh-ost`.

**Thêm cột `NOT NULL` không gián đoạn** — chia thành nhiều bước qua nhiều lần triển khai:

1. Thêm cột cho phép `NULL`, không đặt giá trị mặc định nặng.
2. Sửa code để **ghi cả cột mới** (nhưng chưa đọc bắt buộc).
3. **Nạp dữ liệu theo từng lô nhỏ** cho các dòng cũ, tránh một `UPDATE` khổng lồ khoá bảng.
4. Thêm ràng buộc `NOT NULL` — trên Postgres nên thêm `CHECK ... NOT VALID` trước, `VALIDATE CONSTRAINT` sau để không phải quét bảng trong lúc giữ khoá nặng.

**Đổi tên cột không gián đoạn:** không đổi trực tiếp, vì code cũ và code mới cùng chạy trong lúc triển khai.

1. Thêm cột mới.
2. Ghi vào **cả hai cột** (qua code hoặc trigger).
3. Chép dữ liệu cũ sang theo từng lô.
4. Chuyển phần đọc sang cột mới, triển khai và theo dõi.
5. Ngừng ghi cột cũ, để yên một thời gian, rồi mới xoá.

Nguyên tắc chung: **ngừng dùng trong code trước, đổi schema sau**, và luôn backup trước các migration mang tính phá huỷ.

</details>

**24. Vì sao migration nên `forward-only` và idempotent? Nếu một migration đã xoá nhầm cột trên production, bạn khôi phục thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Forward-only** — chỉ tiến tới, muốn sửa thì viết migration mới chứ không rollback. Lý do: nhật ký sửa nhà không tẩy xoá trang cũ. Trên production, nhiều thay đổi **không thể đảo ngược thật sự** — `DROP COLUMN` rollback xong thì cột có lại nhưng **dữ liệu trong đó đã mất**. Ngoài ra, các môi trường đã chạy migration ở những thời điểm khác nhau, nên một lịch sử tuyến tính chỉ tiến về phía trước là thứ duy nhất tái lập được giống hệt ở mọi nơi.

**Idempotent** — chạy lại lần hai không gây lỗi (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`). Cần thiết vì migration có thể bị ngắt giữa chừng, bị chạy lại do deploy lỗi, hoặc chạy song song trên nhiều instance. Kèm theo đó là mỗi migration nên là **một thay đổi logic** và nằm gọn trong transaction khi engine cho phép.

**Khi đã xoá nhầm cột trên production:**

1. **Dừng ngay**, chặn thêm ghi vào bảng liên quan nếu có thể, không hoảng loạn sửa tiếp.
2. **Đánh giá mức thiệt hại** — cột đó còn nơi nào khác giữ dữ liệu không: replica chưa đồng bộ, bản sao phục vụ báo cáo, log ứng dụng, kho dữ liệu phân tích.
3. **Khôi phục từ backup bằng PITR** vào một database **riêng**, chọn mốc ngay trước khi migration chạy. Tuyệt đối không khôi phục đè lên production.
4. **Trích cột đó ra** từ bản khôi phục và **nạp ngược lại** theo khoá chính bằng migration mới.
5. **Rút kinh nghiệm**: migration phá huỷ phải backup trước, phải chạy thử trên bản sao của production, và nên theo quy trình hai nhịp — ngừng dùng trước, xoá sau vài tuần.

</details>

**25. Giải thích `normalization` (`1NF`, `2NF`, `3NF`). Khi nào bạn cố ý `denormalize` và đánh đổi những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Chuẩn hoá** là quá trình tổ chức lại schema để loại bỏ dữ liệu lặp và các bất thường khi thêm, sửa, xoá:

- **1NF** — mỗi ô chứa **một giá trị nguyên tử**, không nhét danh sách vào một cột. Cột `phones` chứa `"090..., 091..."` là vi phạm; phải tách thành bảng riêng.
- **2NF** — đạt 1NF, và mọi cột không thuộc khoá phải phụ thuộc vào **toàn bộ** khoá chính, không chỉ một phần. Trong bảng `order_items` có khoá `(order_id, product_id)`, cột `product_name` chỉ phụ thuộc `product_id` nên phải đưa về bảng `products`.
- **3NF** — đạt 2NF, và không có cột nào phụ thuộc bắc cầu qua một cột không phải khoá. Bảng `users` chứa cả `city_id` lẫn `city_name` là vi phạm: `city_name` phụ thuộc `city_id` chứ không phụ thuộc người dùng.

Lợi ích: mỗi sự thật chỉ lưu một chỗ, sửa một nơi là xong, dữ liệu không thể tự mâu thuẫn với chính nó.

**Khi nào cố ý denormalize:** khi việc đọc trở thành điểm nghẽn thật sự và đã đo được — bảng tin cần join qua năm bảng, trang danh mục phải đếm số đánh giá cho mỗi sản phẩm, báo cáo tổng hợp trên hàng chục triệu dòng. Cách làm thường gặp: cột đếm sẵn (`comment_count`), sao chép giá trị ít đổi, bảng tổng hợp hoặc materialized view.

**Đánh đổi:** dữ liệu tồn tại ở nhiều nơi nên **có thể lệch nhau**; mỗi lần ghi phải cập nhật thêm chỗ, code phức tạp hơn và chậm hơn; cần cơ chế đồng bộ (trigger, job nền, tính lại định kỳ) cùng cách kiểm tra và sửa sai lệch. Nguyên tắc thực dụng: **chuẩn hoá trước, denormalize sau — và chỉ khi có số liệu chứng minh là cần.**

</details>
