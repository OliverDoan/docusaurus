---
sidebar_position: 12
title: "Performance Antipatterns"
---

# Performance Antipatterns

## 26. Performance Antipatterns (phần 1)

Bài học: [26. Performance Antipatterns (phần 1)](../../system-design/12-performance-antipatterns/1_antipatterns-part-1.md)

**1. N+1 query là gì? Phát hiện và sửa thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Lấy N bản ghi bằng 1 query rồi lặp, mỗi bản ghi chạy thêm 1 query lấy dữ liệu liên quan -- đây là dạng phổ biến nhất của Chatty I/O. Phát hiện: trace có nhiều span DB giống nhau, log SQL lặp, `pg_stat_statements` có số lần gọi lớn, latency tăng theo kích thước danh sách. Sửa: JOIN, `WHERE id IN (...)`, eager loading của ORM, DataLoader cho GraphQL.

</details>

**2. Vì sao không nên đặt nhiều logic xử lý trong stored procedure?**

<details className="qa">
<summary>Xem đáp án</summary>

DB là tài nguyên dùng chung, khó scale ngang và đắt; xử lý nặng (định dạng, nối chuỗi, tính toán) trong DB tranh CPU với mọi truy vấn khác và biến DB thành nút cổ chai (Busy Database). App server scale ngang dễ và rẻ hơn. Ngoài ra logic trong DB khó test, khó version, khó deploy. Ngoại lệ: lọc, join, aggregate có index thì DB làm tốt nhất.

</details>

**3. Trong Node.js, endpoint xuất PDF làm chậm toàn bộ API. Vì sao và xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Node có một event loop; tác vụ CPU-bound đồng bộ chặn event loop, mọi request khác phải chờ (Busy Front End). Xử lý: đẩy sinh PDF vào queue và worker riêng, trả 202 + URL theo dõi; hoặc dùng worker_threads pool cho tác vụ CPU ngắn; dùng API async; theo dõi event loop lag; tách deployment cho tác vụ nặng.

</details>

**4. Tạo HTTP client hoặc DB pool mới cho mỗi request gây ra vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Improper Instantiation: lặp chi phí bắt tay TCP/TLS và xác thực, tạo nhiều socket TIME_WAIT dẫn tới cạn port, vượt `max_connections` của DB, tốn CPU/GC. Sửa: khởi tạo một lần (singleton) với pool có giới hạn, inject dùng chung; trong serverless khởi tạo ngoài handler.

</details>

**5. Làm sao phát hiện Extraneous Fetching?**

<details className="qa">
<summary>Xem đáp án</summary>

Theo dõi kích thước response, số dòng trả về mỗi query so với số dòng hiển thị, bộ nhớ và GC của app, latency tăng dần khi dữ liệu lớn lên. Review code tìm `SELECT *`, endpoint không phân trang, lọc/đếm/sắp xếp trong code. Sửa: chọn cột, đẩy lọc và phân trang xuống DB, giới hạn `limit`, cho client chọn field.

</details>

**6. Busy Database và Extraneous Fetching dường như mâu thuẫn. Cân bằng thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không mâu thuẫn nếu phân vai đúng: DB làm những gì gần dữ liệu và có index hỗ trợ -- lọc, join, aggregate, sắp xếp, phân trang -- để giảm dữ liệu truyền đi. App làm định dạng, tính toán nghiệp vụ phức tạp, render, gọi dịch vụ ngoài. Đo cả CPU DB lẫn lượng dữ liệu truyền để quyết định.

</details>

---

## 27. Performance Antipatterns (phần 2)

Bài học: [27. Performance Antipatterns (phần 2)](../../system-design/12-performance-antipatterns/2_antipatterns-part-2.md)

**1. Retry storm là gì? Thiết kế retry thế nào cho an toàn?**

<details className="qa">
<summary>Xem đáp án</summary>

Retry không kiểm soát khi service phía sau đang yếu làm nhân tải lên (đặc biệt retry ở nhiều tầng: 3 tầng x 3 lần = 27 lần), khiến service không thể hồi phục. An toàn: giới hạn số lần và tổng deadline; exponential backoff + jitter; tôn trọng Retry-After; chỉ retry lỗi tạm thời và thao tác idempotent; retry ở một tầng; circuit breaker; retry budget (retry không vượt một tỉ lệ request); server load shedding trả 503 sớm.

</details>

**2. Circuit breaker hoạt động thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba trạng thái: Closed (gọi bình thường, đếm lỗi); Open (khi tỉ lệ lỗi vượt ngưỡng trong cửa sổ đủ lớn -- trả lỗi/fallback ngay, không gọi xuống, cho service phía sau thời gian hồi phục); Half-open (sau thời gian chờ, cho vài request thử -- thành công thì về Closed, thất bại thì về Open). Kết hợp fallback (giá trị mặc định, dữ liệu cache cũ).

</details>

**3. Noisy neighbor trong SaaS multi-tenant xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Đo tài nguyên theo tenant; rate limit và quota theo tenant/gói (token bucket theo tenantId); fair queuing thay vì FIFO chung; bulkhead (pool riêng theo nhóm); tách tenant lớn sang cell/shard/stamp riêng hoặc DB riêng; giới hạn kích thước job/import; với hạ tầng đặt resource limits cho container. Đánh đổi giữa chi phí chia sẻ và mức cô lập.

</details>

**4. Synchronous I/O ảnh hưởng thế nào tới khả năng chịu tải?**

<details className="qa">
<summary>Xem đáp án</summary>

Thread bị chặn khi chờ I/O nhưng vẫn chiếm bộ nhớ và slot trong pool; số request đồng thời bị giới hạn bởi số thread, khi I/O chậm thì pool cạn dù CPU rảnh. Với Node.js, hàm Sync chặn cả event loop. Giải pháp: non-blocking I/O (event loop, async/await), virtual threads/goroutine, song song hoá I/O độc lập, đẩy việc dài vào queue.

</details>

**5. Khi nào nên tách một database thành nhiều kho (polyglot persistence)?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi có số liệu cho thấy các workload khác đặc tính tranh chấp nhau: log/event ghi liên tục làm chậm giao dịch, báo cáo quét bảng làm tụt hiệu năng giờ cao điểm, session đọc ghi dày đặc, file/blob làm DB phình. Tách sang kho phù hợp (Redis, object storage, log store, warehouse, search engine). Đánh đổi: thêm chi phí vận hành, mất transaction xuyên kho, cần đồng bộ (CDC, outbox).

</details>

**6. Hệ thống không có cache, traffic tăng gấp 10 lần. Bạn làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Xác định dữ liệu đọc nhiều ít đổi qua thống kê query; thêm cache-aside (Redis) với TTL + jitter, single-flight chống stampede, negative caching; nội dung công khai thì CDN/HTTP cache; invalidation khi ghi. Song song: read replica, rate limit/load shedding bảo vệ DB, đảm bảo client retry có backoff để không tạo retry storm khi DB chậm.

</details>
