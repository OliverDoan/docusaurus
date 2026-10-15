---
sidebar_position: 8
title: "Databases"
---

# Databases

## 15. SQL vs NoSQL

Bài học: [15. SQL vs NoSQL](../../system-design/08-databases/1_sql-vs-nosql.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. ACID là gì? Giải thích từng chữ cái bằng ví dụ chuyển tiền.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Atomicity:** trừ A và cộng B cùng thành công hoặc cùng huỷ.
- **Consistency:** sau transaction mọi ràng buộc vẫn đúng (vd số dư không âm, tổng tiền hệ thống không đổi).
- **Isolation:** transaction song song không thấy trạng thái dở dang (A đã trừ, B chưa cộng).
- **Durability:** commit rồi thì crash cũng không mất -- nhờ WAL ghi xuống đĩa trước.

</details>

**2. BASE khác ACID thế nào? Khi nào chấp nhận BASE?**

<details className="qa">
<summary>Xem đáp án</summary>

BASE ưu tiên availability: luôn trả lời, chấp nhận đọc dữ liệu cũ, các replica hội tụ dần (eventual consistency). Chấp nhận BASE khi dữ liệu cũ vài trăm ms đến vài giây không gây hại: số like, view, feed, gợi ý, log, giỏ hàng. Không chấp nhận cho số dư, tồn kho cần chống bán vượt, quyền truy cập.

</details>

**3. Bạn thiết kế hệ thống chat như Messenger -- chọn DB gì để lưu tin nhắn? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Tin nhắn có lượng ghi rất lớn, tăng mãi, truy cập gần như luôn theo `(conversation_id, thời gian)`. Wide column store như **Cassandra/HBase** hợp: partition key = `conversation_id`, clustering key = `message_id` (time-based) sắp xếp sẵn, ghi append nhanh, scale ngang. Metadata user, quan hệ bạn bè có thể để SQL. Facebook Messenger từng dùng HBase, Discord dùng Cassandra rồi ScyllaDB.

</details>

**4. "NoSQL scale tốt hơn SQL" -- đúng hay sai?**

<details className="qa">
<summary>Xem đáp án</summary>

Nửa đúng. NoSQL được **thiết kế sẵn** để scale ngang (partition từ đầu, không JOIN xuyên node), nên scale dễ hơn. Nhưng nó đánh đổi: không JOIN, transaction hạn chế, consistency yếu hơn, phải biết trước access pattern. SQL scale được bằng replication + sharding + cache, chỉ là phức tạp hơn và app phải tự gánh. Với phần lớn sản phẩm, một SQL tốt + replica là đủ rất lâu.

</details>

**5. Polyglot persistence là gì? Rủi ro?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng nhiều loại DB trong một hệ thống, mỗi loại cho đúng workload (PostgreSQL cho đơn hàng, Redis cho cache/session, Elasticsearch cho search...). Rủi ro: chi phí vận hành tăng, dữ liệu trùng lặp giữa các kho phải đồng bộ (thường qua CDC hoặc event), khó đảm bảo consistency xuyên kho, đội cần kiến thức nhiều công nghệ.

</details>

**6. Khi nào cân nhắc NewSQL như Spanner hay CockroachDB?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi cần **đồng thời** strong consistency + ACID + SQL **và** dữ liệu/tải vượt một máy hoặc cần multi-region (vd hệ thống thanh toán toàn cầu). Đánh đổi: latency ghi cao hơn vì phải đạt đồng thuận giữa các replica (thường hàng chục ms khi xuyên region), chi phí và độ phức tạp vận hành cao hơn PostgreSQL thường.

</details>

---

## 16. Replication & Federation

Bài học: [16. Replication & Federation](../../system-design/08-databases/2_replication-federation.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Master-slave khác master-master thế nào? Khi nào chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Master-slave:** 1 node nhận ghi, nhiều node đọc. Đơn giản, không conflict, scale đọc. Ghi không scale, failover cần promote.
- **Master-master:** nhiều node cùng nhận ghi. Availability ghi cao, ghi gần user đa region, nhưng phải xử lý conflict và thường chỉ eventual consistency.

Mặc định chọn master-slave; chỉ chọn master-master khi bắt buộc ghi đa region hoặc yêu cầu availability ghi rất cao.

</details>

**2. Replication lag là gì? Nó gây vấn đề gì và xử lý ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Là độ trễ giữa lúc master commit và lúc slave áp dụng. Gây vi phạm read-your-writes (sửa xong không thấy), monotonic reads (dữ liệu "nhảy lùi"). Xử lý: đọc từ master một khoảng thời gian sau khi user ghi; dùng `RETURNING` hoặc trả kết quả từ lệnh ghi; gắn user vào một replica cố định; theo dõi lag và loại replica tụt hậu khỏi pool.

</details>

**3. Sync và async replication -- trade-off?**

<details className="qa">
<summary>Xem đáp án</summary>

Sync: không mất dữ liệu khi master chết, nhưng latency ghi cao và nếu slave chết thì ghi bị treo. Async: nhanh, master độc lập, nhưng có thể mất các ghi chưa replicate khi failover. Phổ biến là semi-sync: chờ ít nhất 1 replica ACK, còn lại async.

</details>

**4. Split brain là gì? Phòng tránh thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Tình huống hai node cùng tin mình là master (thường do mất mạng giữa chúng), cùng nhận ghi, dữ liệu phân kỳ. Phòng: dùng quorum (chỉ bầu master khi đa số node đồng ý -- cần số lẻ node, vd 3 node etcd), fencing (cắt quyền ghi hoặc tắt hẳn master cũ), fencing token tăng dần để storage từ chối ghi từ leader cũ.

</details>

**5. Federation là gì? Nhược điểm lớn nhất?**

<details className="qa">
<summary>Xem đáp án</summary>

Chia DB theo chức năng (users, products, orders) ra nhiều DB riêng. Lợi: giảm tải mỗi DB, cache tốt hơn, ghi song song. Nhược điểm lớn nhất: mất JOIN và transaction xuyên DB -- phải JOIN ở app và dùng saga/outbox cho thao tác đa DB. Ngoài ra không giải quyết được một bảng đơn lẻ quá lớn -- khi đó cần sharding.

</details>

**6. Federation khác sharding thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Federation chia **theo chức năng** (bảng nào ở DB nào -- chia dọc). Sharding chia **theo dữ liệu** của cùng một bảng (user 1-1M ở shard A, 1M-2M ở shard B -- chia ngang). Hai kỹ thuật bổ sung nhau: federation trước khi các nhóm bảng tranh tài nguyên, sharding khi một bảng vượt sức một máy.

</details>

---

## 17. Sharding, Denormalization & SQL Tuning

Bài học: [17. Sharding, Denormalization & SQL Tuning](../../system-design/08-databases/3_sharding-denormalization-tuning.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Bạn chọn shard key thế nào cho bảng tweets của Twitter?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai access pattern chính: (a) xem tweet theo `tweet_id`, (b) timeline của một user. Shard theo `user_id` giúp "tweets của user X" chạm 1 shard, nhưng user cực nổi tiếng tạo hot spot. Shard theo `tweet_id` (Snowflake, có thời gian) phân đều, tra theo ID nhanh; timeline lấy từ bảng/cache timeline riêng (fan-out). Thực tế thường shard theo `tweet_id` + index hoặc bảng phụ `user_id -> tweet_ids`, kèm cache cho tài khoản nổi tiếng.

</details>

**2. Consistent hashing giải quyết vấn đề gì? Virtual node để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Với `hash mod N`, thay đổi N làm gần như mọi key đổi node. Consistent hashing đặt node và key lên vòng hash; thêm/bớt node chỉ di chuyển khoảng 1/N key. Virtual node: mỗi node vật lý có nhiều điểm trên vòng để phân bố đều hơn, và khi node chết thì tải của nó rải ra nhiều node khác chứ không dồn vào một node kế bên; cũng cho phép gán nhiều vnode hơn cho máy mạnh hơn.

</details>

**3. Hot spot là gì và xử lý ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Một shard nhận tải lớn bất thường do shard key lệch hoặc key nóng (celebrity). Xử lý: chọn shard key cardinality cao, phân bố đều; key salting (chia key nóng thành nhiều sub-key); cache key nóng ở Redis/CDN; dời tenant lớn ra shard riêng (directory); bucket theo thời gian.

</details>

**4. Một query chạy 2 giây. Bạn debug thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

1) Chạy `EXPLAIN (ANALYZE, BUFFERS)` xem Seq Scan, Sort ra đĩa, Nested Loop nhiều vòng, estimate lệch. 2) Thêm hoặc sửa index (composite theo leftmost prefix, covering, partial); tránh hàm trên cột. 3) Chạy `ANALYZE` nếu thống kê cũ. 4) Viết lại query: bỏ `SELECT *`, keyset pagination, tránh OR phức tạp. 5) Kiểm tra app: N+1, chờ connection pool, lock. 6) Nếu vẫn chậm: cache, denormalize, materialized view.

</details>

**5. N+1 query là gì? Phát hiện và sửa thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

1 query lấy danh sách rồi N query lấy dữ liệu liên quan từng phần tử -- N round-trip mạng. Phát hiện qua log query của ORM, APM (Datadog, New Relic) thấy cùng một câu lặp hàng trăm lần trong 1 request. Sửa bằng JOIN, eager loading (`include`), batch `WHERE id = ANY(...)`, hoặc DataLoader trong GraphQL.

</details>

**6. Denormalization có những rủi ro gì? Giữ đồng bộ thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Rủi ro: dữ liệu trùng lệch nhau, ghi phức tạp và chậm hơn, tốn dung lượng. Đồng bộ: cập nhật trong cùng transaction nếu cùng DB; trigger; CDC (Debezium) hoặc event để cập nhật read model bất đồng bộ; materialized view refresh định kỳ; job đối soát chạy định kỳ phát hiện và sửa lệch.

</details>

---

## 18. Các loại NoSQL

Bài học: [18. Các loại NoSQL](../../system-design/08-databases/4_nosql-types.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Key-value store và document store khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai tra theo key. Key-value coi value là hộp đen -- chỉ GET/SET theo key. Document store **hiểu** cấu trúc document (JSON/BSON) nên index và query được theo field bên trong, có aggregation. Đổi lại key-value thường nhanh hơn và đơn giản hơn. DynamoDB nằm giữa: key-value với partition + sort key, item có thuộc tính dạng document.

</details>

**2. Vì sao Cassandra ghi nhanh?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng LSM-tree: mỗi ghi chỉ append vào commit log (ghi tuần tự) và chèn vào memtable trong RAM, không phải tìm và sửa trang trên đĩa như B-tree. Memtable đầy thì flush ra SSTable bất biến; compaction gộp nền. Thêm vào đó kiến trúc leaderless -- node nào cũng nhận ghi, không có master nút thắt -- và consistency điều chỉnh được (ghi `ONE` rất nhanh).

</details>

**3. Thiết kế lưu trữ cho tính năng "người bạn có thể biết" -- dùng gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Bản chất là duyệt 2 bước trên đồ thị follow + đếm bạn chung -- graph DB (Neo4j) diễn đạt bằng một câu Cypher và duyệt nhanh nhờ index-free adjacency. Ở quy mô Facebook, thường tính **offline** (batch Spark/graph processing) rồi lưu kết quả gợi ý vào key-value store (`user_id -> danh sách gợi ý`) để đọc nhanh; graph DB dùng cho quy mô vừa hoặc truy vấn online.

</details>

**4. Khi nào embed, khi nào reference trong MongoDB?**

<details className="qa">
<summary>Xem đáp án</summary>

Embed khi dữ liệu con luôn đọc cùng cha, số lượng giới hạn, ít khi cập nhật độc lập (địa chỉ trong đơn hàng, variant của sản phẩm). Reference khi dữ liệu con tăng không giới hạn (comment), dùng chung nhiều nơi (user), hoặc cập nhật độc lập thường xuyên. Nhớ giới hạn 16MB/document.

</details>

**5. Wide column store khác columnar database (như ClickHouse) thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Wide column (Cassandra, HBase) tổ chức theo **partition/hàng**, tối ưu OLTP ghi nhiều và đọc theo key + khoảng. Columnar (ClickHouse, Redshift, BigQuery) lưu **từng cột liền nhau** trên đĩa, nén tốt, tối ưu OLAP -- quét và aggregate vài cột trên hàng tỉ dòng. Tên giống nhau nhưng mục đích ngược nhau.

</details>

**6. Hệ thống chat cần những loại DB nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Tin nhắn:** wide column (Cassandra), partition `(conversation_id, bucket)`, clustering theo `message_id` thời gian.
- **Trạng thái online, typing, session WebSocket:** Redis (key-value có TTL, pub/sub).
- **User, nhóm, quyền:** SQL (PostgreSQL) -- quan hệ, cần nhất quán.
- **Tìm kiếm tin nhắn:** Elasticsearch.

</details>
