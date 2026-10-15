---
sidebar_position: 9
title: "Caching"
---

# Caching

## 19. Caching & các tầng cache

Bài học: [19. Caching & các tầng cache](../../system-design/09-caching/1_cache-types.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Kể các tầng cache trong một hệ thống web và vai trò của từng tầng.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Client** (browser HTTP cache, React Query, app mobile): không gọi mạng.
- **CDN**: phục vụ nội dung tĩnh/công khai ở edge gần user, giảm latency và tải origin.
- **Web server / reverse proxy** (Nginx, Varnish): cache response HTTP, chống sập với stale.
- **Application** (Redis, Memcached, in-process): cache object nghiệp vụ, session, kết quả tính toán.
- **Database** (buffer pool, page cache, materialized view): giữ dữ liệu nóng trong RAM.

</details>

**2. Vì sao nên cache ở mức object thay vì mức query?**

<details className="qa">
<summary>Xem đáp án</summary>

Query cache khó invalidate: khi một hàng đổi, không biết những kết quả query nào chứa nó, nên phải xoá hàng loạt hoặc chờ TTL. Object cache gắn với ID nghiệp vụ (`product:42`) -- dữ liệu đổi thì xoá đúng key, tái sử dụng được nhiều nơi, và cho phép worker build sẵn object bất đồng bộ. MySQL thậm chí đã loại bỏ query cache ở 8.0.

</details>

**3. LRU và LFU khác nhau thế nào? Khi nào chọn LFU?**

<details className="qa">
<summary>Xem đáp án</summary>

LRU loại entry lâu nhất chưa truy cập -- nhạy với truy cập gần đây, nhưng một lần quét lớn có thể đẩy hết dữ liệu nóng. LFU loại entry ít truy cập nhất -- giữ "hàng hot" bền vững hơn, nhưng cần cơ chế decay để entry từng hot rồi nguội không chiếm chỗ mãi. Chọn LFU khi tập dữ liệu nóng ổn định theo thời gian (sản phẩm bán chạy, trang phổ biến); LRU cho workload có tính thời điểm.

</details>

**4. Cài đặt LRU cache O(1) thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Hash map (key -> node) + doubly linked list (thứ tự sử dụng). `get`: tra map O(1), chuyển node về đầu list O(1). `put`: nếu có thì cập nhật và chuyển về đầu; nếu không thì thêm vào đầu, vượt capacity thì xoá node cuối list và xoá khỏi map. Trong JS/TS có thể tận dụng `Map` giữ thứ tự chèn: xoá rồi set lại để "đưa về cuối", phần tử đầu tiên là ứng viên bị loại.

</details>

**5. Hit ratio là gì? Làm sao tăng nó?**

<details className="qa">
<summary>Xem đáp án</summary>

Tỉ lệ request được phục vụ từ cache. Tăng bằng: cache đúng dữ liệu nóng; tăng dung lượng cho vừa working set; chọn eviction phù hợp (LFU cho hot set ổn định); TTL đủ dài + invalidate chủ động thay vì TTL ngắn; chuẩn hoá cache key (bỏ query string thừa, sắp xếp tham số); warm-up cache sau deploy; dùng object-level để nhiều trang dùng chung key.

</details>

**6. `Cache-Control: no-cache` và `no-store` khác gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`no-cache` vẫn **được lưu** nhưng phải revalidate với server (qua ETag/Last-Modified) trước mỗi lần dùng -- nếu không đổi thì server trả 304, tiết kiệm băng thông. `no-store` **không được lưu** ở bất kỳ đâu -- dùng cho dữ liệu nhạy cảm (thông tin ngân hàng).

</details>

---

## 20. Chiến lược cập nhật cache

Bài học: [20. Chiến lược cập nhật cache](../../system-design/09-caching/2_cache-strategies.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. So sánh cache-aside và write-through.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Cache-aside:** app tự đọc cache, miss thì đọc DB rồi nạp cache; ghi thì ghi DB và xoá key. Chỉ cache dữ liệu được đọc, chịu lỗi cache tốt, nhưng miss tốn 3 bước và dữ liệu có thể cũ tới TTL.
- **Write-through:** mọi ghi đi qua cache và đồng bộ xuống DB. Cache luôn mới, đọc ít miss, nhưng ghi chậm hơn và phí RAM cho dữ liệu ít đọc.

Thường kết hợp: write-through cho dữ liệu vừa ghi hay đọc ngay, cache-aside để xử lý miss.

</details>

**2. Write-behind có rủi ro gì? Giảm thiểu ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Rủi ro: mất dữ liệu nếu cache chết trước khi flush; DB tạm thời không có dữ liệu mới; thứ tự ghi và retry phức tạp. Giảm thiểu: bật persistence (Redis AOF) và replica; dùng hàng đợi bền vững (Kafka) thay vì chỉ RAM; ghi idempotent (cộng delta theo batch ID); chỉ áp dụng cho dữ liệu chấp nhận mất một phần (counter, analytics).

</details>

**3. Cache stampede là gì? Nêu ít nhất 3 cách phòng.**

<details className="qa">
<summary>Xem đáp án</summary>

Key nóng hết hạn, hàng nghìn request cùng miss và cùng query DB, gây quá tải dây chuyền. Phòng: (1) distributed lock -- chỉ một request nạp DB; (2) request coalescing/single flight trong process; (3) TTL jitter tránh hết hạn đồng loạt; (4) stale-while-revalidate -- trả bản cũ trong lúc làm mới; (5) refresh-ahead hoặc probabilistic early expiration cho key nóng.

</details>

**4. Khi ghi dữ liệu, nên xoá cache hay cập nhật cache? Thứ tự thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Với cache-aside nên **xoá**: cập nhật dễ gặp race khi 2 request ghi song song, để lại giá trị cũ trong cache. Thứ tự: **ghi DB trước, xoá cache sau** -- xoá trước thì một request đọc xen giữa có thể nạp lại giá trị cũ. Vẫn còn race hiếm, nên kết hợp TTL, delayed double delete, hoặc lease như Facebook.

</details>

**5. Refresh-ahead hiệu quả khi nào và có nhược điểm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Hiệu quả khi tập key nóng ổn định và dự đoán được (trang chủ, top sản phẩm, config): user gần như không gặp miss, latency ổn định, tránh stampede. Nhược điểm: nếu dự đoán sai thì tốn tài nguyên refresh key không ai đọc, có thể làm hiệu năng tệ hơn; dữ liệu vẫn cũ tới mức TTL; thêm độ phức tạp.

</details>

**6. Nhiều service cùng ghi vào một DB, làm sao invalidate cache cho đúng?**

<details className="qa">
<summary>Xem đáp án</summary>

Không thể dựa vào từng service tự xoá cache (dễ quên một đường ghi). Dùng **CDC**: Debezium đọc binlog/WAL, phát event thay đổi lên Kafka, một consumer xoá (hoặc cập nhật) key cache tương ứng. Kết hợp TTL làm lưới an toàn và versioned key khi đổi cấu trúc object.

</details>
