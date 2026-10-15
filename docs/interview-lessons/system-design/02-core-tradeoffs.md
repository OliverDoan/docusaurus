---
sidebar_position: 2
title: "Các đánh đổi cốt lõi"
---

# Các đánh đổi cốt lõi

## 3. Performance vs Scalability

Bài học: [3. Performance vs Scalability](../../system-design/02-core-tradeoffs/1_performance-vs-scalability.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt performance và scalability.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Performance:** hệ thống xử lý một lượng việc nhanh/hiệu quả thế nào. Chậm với 1 user → vấn đề performance.
- **Scalability:** khả năng giữ performance khi tải tăng bằng cách thêm tài nguyên. Nhanh với 1 user nhưng chậm khi tải lớn → vấn đề scalability.

Hệ thống scalable khi thêm tài nguyên thì năng lực tăng gần tương ứng.

</details>

**2. Vertical scaling và horizontal scaling: ưu nhược điểm?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Vertical:** nâng cấp một máy. Đơn giản, không đổi code; nhưng có trần phần cứng, giá tăng phi tuyến, là SPOF, thường cần downtime.
- **Horizontal:** thêm máy. Gần như không trần, chịu lỗi tốt, dùng máy phổ thông; nhưng cần LB, stateless, xử lý dữ liệu phân tán, phức tạp hơn.

</details>

**3. Định luật Amdahl nói gì và áp dụng thế nào vào hệ thống web?**

<details className="qa">
<summary>Xem đáp án</summary>

Tăng tốc tối đa bị giới hạn bởi phần tuần tự: `Speedup = 1 / ((1 - p) + p/N)`. Với 5% tuần tự, tối đa chỉ 20× dù có vô số máy. Trong web, phần tuần tự là các điểm tranh chấp chung: DB primary duy nhất, lock toàn cục, counter chung, một service phụ thuộc. Muốn scale phải loại bỏ/giảm những điểm đó (sharding, cache, bất đồng bộ).

</details>

**4. Thêm app server nhưng throughput không tăng. Bạn điều tra thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Tìm tài nguyên chung bị bão hoà: CPU/IO/lock wait của DB, số kết nối DB, hit rate cache, hot key, service bên ngoài chậm, bandwidth mạng, LB. Dùng metrics + tracing để thấy thời gian bị tiêu ở đâu. Giải pháp tuỳ điểm nghẽn: cache, read replica, connection pooler, sharding, chuyển sang bất đồng bộ.

</details>

**5. Vì sao nên tối ưu performance trước khi scale?**

<details className="qa">
<summary>Xem đáp án</summary>

Scale một hệ thống kém hiệu quả là nhân bản sự lãng phí: chi phí tăng tuyến tính theo số máy mà latency của từng request không cải thiện. Một index đúng có thể giảm 100× thời gian query — rẻ hơn rất nhiều so với thêm 100 máy. Ngoài ra, tải thừa do code kém có thể làm điểm nghẽn chung (DB) quá tải sớm hơn.

</details>

---

## 4. Latency vs Throughput

Bài học: [4. Latency vs Throughput](../../system-design/02-core-tradeoffs/2_latency-vs-throughput.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Latency và throughput khác nhau thế nào? Cho ví dụ cải thiện cái này mà không cải thiện cái kia.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Latency:** thời gian hoàn thành một thao tác.
- **Throughput:** số thao tác hoàn thành mỗi đơn vị thời gian.

Ví dụ: **batching** tăng throughput nhưng tăng latency (mỗi item chờ đủ batch). **Scale ngang** tăng throughput nhưng không làm một request đơn lẻ nhanh hơn. Gửi dữ liệu bằng xe tải chở ổ cứng: throughput cực cao, latency vài ngày.

</details>

**2. Vì sao dùng p99 thay vì latency trung bình?**

<details className="qa">
<summary>Xem đáp án</summary>

Phân phối latency lệch phải; trung bình bị outlier kéo lệch và không phản ánh trải nghiệm của ai cả. p50 cho biết trải nghiệm điển hình, p99 cho biết trải nghiệm của nhóm tệ nhất — thường là user có nhiều dữ liệu nhất (quan trọng nhất). Với fan-out, tail latency bị khuếch đại: gọi 100 service thì ~63% request người dùng sẽ gặp ít nhất một lời gọi chậm hơn p99.

</details>

**3. Phát biểu Little's Law và áp dụng một ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

`L = λ × W`: số request đồng thời trong hệ thống = throughput × latency trung bình. Ví dụ: 1.000 QPS, latency 200ms → 200 request đồng thời → cần pool ít nhất ~200 worker/connection. Nếu latency tăng lên 2s, cần 2.000 → nếu pool không đủ, request xếp hàng và latency tiếp tục tăng (cascading failure).

</details>

**4. Vì sao latency tăng vọt khi utilization tiến gần 100%?**

<details className="qa">
<summary>Xem đáp án</summary>

Request đến ngẫu nhiên, không đều. Khi utilization cao, xác suất request mới phải chờ trong hàng đợi tăng nhanh; theo mô hình M/M/1 thời gian trong hệ thống tỉ lệ `1/(1-ρ)`: 50% → 2×, 90% → 10×, 99% → 100×. Do đó nên giữ dư phòng và autoscale ở ngưỡng 60–70%.

</details>

**5. Làm thế nào giảm tail latency trong hệ thống fan-out?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Hedged request:** sau một ngưỡng (vd p95), gửi request dự phòng tới replica khác, dùng kết quả về trước.
- Giảm số lời gọi fan-out, cache kết quả.
- Timeout và trả kết quả một phần (graceful degradation).
- Giảm nguyên nhân gốc: GC pause, noisy neighbor, hàng đợi cục bộ.

</details>

---

## 5. Availability vs Consistency & CAP Theorem

Bài học: [5. Availability vs Consistency & CAP Theorem](../../system-design/02-core-tradeoffs/3_availability-vs-consistency.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phát biểu CAP Theorem. Vì sao không thể chọn CA?**

<details className="qa">
<summary>Xem đáp án</summary>

Hệ thống phân tán không thể đồng thời đảm bảo Consistency (mọi đọc thấy ghi mới nhất), Availability (mọi node sống đều trả lời không lỗi) và Partition tolerance (chịu được mạng chia cắt). Vì partition là điều chắc chắn xảy ra trong mạng thật, P là bắt buộc; khi partition xảy ra phải chọn C hoặc A. CA chỉ có nghĩa với hệ thống một node — không phân tán.

</details>

**2. Cho ví dụ một hệ thống nên chọn CP và một hệ thống nên chọn AP.**

<details className="qa">
<summary>Xem đáp án</summary>

- **CP:** chuyển tiền ngân hàng, bán vé có ghế số, distributed lock (etcd/ZooKeeper) — dữ liệu sai gây hậu quả nghiêm trọng, thà báo lỗi tạm thời.
- **AP:** giỏ hàng Amazon, feed mạng xã hội, lượt like, DNS — luôn phục vụ quan trọng hơn chính xác tuyệt đối từng giây; dữ liệu hội tụ sau.

</details>

**3. PACELC bổ sung gì cho CAP?**

<details className="qa">
<summary>Xem đáp án</summary>

CAP chỉ mô tả lúc có partition. PACELC thêm: **Else** (khi bình thường) vẫn phải đánh đổi giữa **Latency** và **Consistency** — muốn nhất quán mạnh phải chờ nhiều replica xác nhận (tốn latency, đặc biệt multi-region). Ví dụ: Cassandra/DynamoDB là PA/EL, Spanner/HBase là PC/EC.

</details>

**4. "C" trong CAP và "C" trong ACID khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **CAP-C (linearizability):** mọi replica hành xử như một bản dữ liệu duy nhất — đọc luôn thấy ghi mới nhất.
- **ACID-C:** transaction đưa database từ trạng thái hợp lệ sang trạng thái hợp lệ khác, thoả mãn ràng buộc (foreign key, unique, check, invariant nghiệp vụ).

Hai khái niệm khác nhau, chỉ trùng tên.

</details>

**5. Trong cụm 5 node dùng Raft, mạng chia thành 3 và 2 node. Điều gì xảy ra?**

<details className="qa">
<summary>Xem đáp án</summary>

Phía 3 node có đa số (quorum = 3) → bầu/giữ leader, tiếp tục nhận ghi và đọc nhất quán. Phía 2 node không đủ quorum → không bầu được leader, từ chối ghi (và đọc linearizable). Client kết nối phía 2 node thấy lỗi → hệ thống chọn C, hy sinh A cho phía thiểu số — đây là hành vi CP. Khi mạng phục hồi, 2 node kia đồng bộ log từ leader.

</details>

**6. Hệ AP xử lý xung đột ghi thế nào khi mạng phục hồi?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Last-write-wins (LWW):** giữ bản có timestamp lớn nhất — đơn giản nhưng có thể mất ghi do lệch đồng hồ.
- **Vector clock / version vector:** phát hiện ghi đồng thời, giữ cả hai "sibling" để ứng dụng merge (Dynamo, Riak).
- **CRDT:** cấu trúc dữ liệu tự merge không xung đột (counter, set, map).
- **Merge theo nghiệp vụ:** ví dụ hợp nhất giỏ hàng.

Kèm theo các cơ chế sửa lệch: read repair, hinted handoff, anti-entropy với Merkle tree.

</details>
