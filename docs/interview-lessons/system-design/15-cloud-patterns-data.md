---
sidebar_position: 15
title: "Cloud Patterns: Data Management"
---

# Cloud Patterns: Data Management

## 33. Data Patterns: Sharding, Index Table, Materialized View

Bài học: [33. Data Patterns: Sharding, Index Table, Materialized View](../../system-design/15-cloud-patterns-data/1_sharding-index-materialized-view.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. So sánh lookup, range và hash sharding. Khi nào chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Lookup:** có shard map ánh xạ khoá → shard. Linh hoạt, dễ dời tenant lớn; hợp SaaS multi-tenant. Cần cache shard map.
- **Range:** khoá liên tiếp nằm cùng shard. Tốt cho range query, time-series, archive; dễ hotspot.
- **Hash:** băm khoá để phân bố đều. Tránh hotspot; range query phải scatter-gather; rebalance khó nếu dùng `% N` → dùng consistent hashing / virtual shard.

</details>

**2. Tiêu chí chọn shard key tốt?**

<details className="qa">
<summary>Xem đáp án</summary>

Cardinality cao, phân bố đều (không có giá trị chiếm phần lớn dữ liệu/traffic), xuất hiện trong hầu hết truy vấn nóng để truy vấn chỉ chạm một shard, ổn định (ít khi đổi giá trị), và gom được dữ liệu hay đọc cùng nhau (vd `user_id` cho dữ liệu của một user).

</details>

**3. Index Table khác secondary index của database thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Secondary index do DB quản lý, cập nhật cùng transaction, nhất quán mạnh nhưng thường chỉ trong một node/partition. Index table là **bảng do ứng dụng (hoặc hệ thống như DynamoDB GSI) tự duy trì**, có thể shard riêng, có thể denormalize thêm field, nhưng thường **eventual consistency** và tăng chi phí ghi.

</details>

**4. Materialized view khác cache thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai là dữ liệu phái sinh để đọc nhanh. Cache thường lưu **bản sao nguyên dạng** theo key, có TTL, có thể mất bất cứ lúc nào (cache miss thì đọc nguồn). Materialized view lưu **kết quả đã biến đổi/tổng hợp** theo hình dạng của truy vấn, thường bền vững (nằm trong DB), được cập nhật chủ động qua refresh/event, và là nơi đọc chính chứ không phải lớp tăng tốc tuỳ chọn.

</details>

**5. Làm sao xử lý truy vấn cần dữ liệu trên nhiều shard?**

<details className="qa">
<summary>Xem đáp án</summary>

Ưu tiên tránh: thiết kế shard key để truy vấn nóng chạm 1 shard, replicate bảng tham chiếu nhỏ. Nếu buộc phải: fan-out song song tới các shard rồi gộp kết quả ở ứng dụng (có timeout, chấp nhận kết quả một phần), hoặc dựng **materialized view / index table** tổng hợp sẵn dữ liệu cross-shard, hoặc đẩy dữ liệu sang data warehouse/search engine cho truy vấn phân tích.

</details>

---

## 34. Event Sourcing & CQRS

Bài học: [34. Event Sourcing & CQRS](../../system-design/15-cloud-patterns-data/2_event-sourcing-cqrs.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Event Sourcing là gì? Khác gì so với lưu bảng audit log?**

<details className="qa">
<summary>Xem đáp án</summary>

Event Sourcing lấy **chuỗi event là nguồn sự thật**; trạng thái hiện tại được dựng ra từ event. Audit log thì là bản ghi **phụ**, trạng thái vẫn nằm ở bảng chính — audit có thể quên ghi hoặc lệch với dữ liệu thật. Với ES, không thể có thay đổi nào mà không có event.

</details>

**2. CQRS có bắt buộc phải dùng Event Sourcing không? Ngược lại?**

<details className="qa">
<summary>Xem đáp án</summary>

CQRS **không** cần ES — write side có thể là RDBMS, đồng bộ sang read side qua CDC/outbox. Ngược lại, ES **gần như cần** CQRS vì event store chỉ đọc hiệu quả theo stream ID; mọi truy vấn khác phải đi qua read model dựng bằng projection.

</details>

**3. Snapshot giải quyết vấn đề gì? Có rủi ro gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Giảm thời gian load aggregate có nhiều event: đọc snapshot tại version N rồi chỉ replay event sau N. Rủi ro: schema state thay đổi làm snapshot cũ không tương thích (cần version snapshot và cho phép bỏ/dựng lại), và tốn thêm lưu trữ. Snapshot luôn là cache, không phải nguồn sự thật.

</details>

**4. Làm sao xử lý việc user tạo dữ liệu xong nhưng read model chưa cập nhật?**

<details className="qa">
<summary>Xem đáp án</summary>

Trả ID/version từ command để UI hiển thị optimistic; read-your-writes bằng cách query kèm version tối thiểu và chờ projection bắt kịp có timeout; đọc trực tiếp write side cho entity vừa sửa; push thông báo qua WebSocket khi projection xong; thiết kế UX thể hiện trạng thái "đang xử lý".

</details>

**5. Làm sao thay đổi cấu trúc event khi hệ thống đã chạy lâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Không sửa event cũ. Dùng versioning (thêm loại event mới), **upcaster** chuyển event cũ sang dạng mới lúc đọc, thiết kế event chịu được field thêm (tolerant reader). Trường hợp cực đoan: copy-transform sang stream mới (migration) rồi chuyển hướng.

</details>

**6. Làm sao "xoá" dữ liệu cá nhân trong event store để tuân thủ GDPR?**

<details className="qa">
<summary>Xem đáp án</summary>

Crypto shredding: mã hoá trường dữ liệu cá nhân bằng key riêng của user, lưu key ở kho riêng; khi cần xoá thì xoá key — event vẫn còn nhưng dữ liệu không giải mã được. Hoặc chỉ lưu tham chiếu trong event, dữ liệu cá nhân nằm ở store có thể xoá.

</details>

---

## 35. Valet Key, Static Content Hosting & Cache-Aside

Bài học: [35. Valet Key, Static Content Hosting & Cache-Aside](../../system-design/15-cloud-patterns-data/3_valet-key-static-hosting-cache-aside.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Thiết kế tính năng upload video 1 GB cho app có hàng triệu user?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng Valet Key: client xin URL, server auth + kiểm tra quota rồi trả **multipart presigned URL** (mỗi part một URL). Client upload song song trực tiếp lên S3, có thể resume part lỗi. S3 event kích hoạt worker transcode, quét malware, ghi metadata. App server không chạm byte dữ liệu nào.

</details>

**2. Presigned URL bị lộ thì sao? Làm sao giảm rủi ro?**

<details className="qa">
<summary>Xem đáp án</summary>

Ai có URL đều dùng được tới khi hết hạn. Giảm rủi ro: TTL ngắn, phạm vi một object một thao tác, không log URL, dùng HTTPS, ràng buộc content-type, với download có thể dùng CloudFront signed cookie/URL kèm điều kiện. Cần thu hồi khẩn cấp thì vô hiệu credential dùng để ký (hoặc Azure stored access policy).

</details>

**3. Vì sao khi ghi nên xoá cache thay vì cập nhật cache?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai request ghi đồng thời có thể cập nhật DB theo thứ tự A→B nhưng set cache theo thứ tự B→A → cache giữ giá trị cũ vô thời hạn. Xoá key thì lần đọc tiếp theo luôn nạp giá trị mới nhất từ DB. Ngoài ra tính toán giá trị cache có thể đắt mà chưa chắc có ai đọc.

</details>

**4. Cache stampede là gì và xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Key nóng hết hạn, rất nhiều request cùng miss và cùng truy vấn DB, có thể làm DB sập. Xử lý: single-flight/lock để chỉ một request nạp lại, các request khác chờ hoặc trả giá trị cũ (stale-while-revalidate); TTL có jitter; làm mới chủ động trước hạn (probabilistic early expiration).

</details>

**5. Static Content Hosting xử lý cache khi deploy phiên bản mới thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Asset dùng tên có hash nội dung và cache dài hạn `immutable`; `index.html` cache ngắn hoặc `no-cache`. Deploy: upload asset mới trước, `index.html` sau; giữ asset cũ một thời gian. Nếu buộc phải, invalidate CDN cho `index.html`.

</details>
