---
sidebar_position: 3
title: "Consistency & Availability Patterns"
---

# Consistency & Availability Patterns

## 6. Consistency Patterns

Bài học: [6. Consistency Patterns](../../system-design/03-consistency-availability/1_consistency-patterns.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. So sánh weak, eventual và strong consistency, cho ví dụ mỗi loại.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Weak:** sau ghi, đọc có thể thấy hoặc không, best effort — VoIP, game realtime, memcached.
- **Eventual:** sau ghi, đọc cuối cùng sẽ thấy, replication async — DNS, email, Cassandra, DynamoDB mặc định.
- **Strong:** sau ghi, mọi đọc thấy ngay, replication sync/consensus — RDBMS, etcd, Spanner.

Càng mạnh thì latency càng cao, availability khi sự cố càng thấp.

</details>

**2. Giải thích công thức R + W > N.**

<details className="qa">
<summary>Xem đáp án</summary>

Với N replica, ghi cần W xác nhận, đọc cần R phản hồi. Nếu R + W > N thì theo nguyên lý chuồng bồ câu, tập đọc và tập ghi giao nhau ít nhất một node → đọc chạm được bản ghi mới nhất (chọn theo version). Ví dụ N=3, W=2, R=2. Giảm W thì ghi nhanh hơn nhưng đọc phải tăng R; R=W=1 thì nhanh nhất nhưng chỉ eventual. Lưu ý quorum chưa đảm bảo linearizable khi có sloppy quorum hay ghi đồng thời.

</details>

**3. Read-your-writes là gì và triển khai thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Đảm bảo user luôn thấy những gì chính mình vừa ghi. Triển khai: đọc từ primary dữ liệu do chính user sở hữu; hoặc đọc primary trong vài giây sau lần ghi gần nhất (lưu timestamp trong session); hoặc nhớ vị trí replication (LSN) của lần ghi và chỉ đọc replica đã bắt kịp; hoặc trả luôn dữ liệu vừa ghi trong response.

</details>

**4. Eventual consistency hội tụ bằng những cơ chế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Async replication, read repair (sửa replica cũ khi đọc), hinted handoff (giữ ghi hộ node đang chết), anti-entropy dùng Merkle tree, gossip. Xung đột được giải bằng last-write-wins, version vector, CRDT hoặc merge theo nghiệp vụ.

</details>

**5. Monotonic reads khác read-your-writes thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Read-your-writes:** liên quan tới dữ liệu **chính mình ghi** — phải thấy ngay.
- **Monotonic reads:** liên quan tới **mọi dữ liệu đã đọc** — đã thấy giá trị mới thì không được "quay ngược" về giá trị cũ (vd comment hiện rồi biến mất). Triển khai bằng cách gắn user với một replica cố định.

</details>

**6. Thiết kế đăng ký username duy nhất trên hệ eventual consistent thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không thể dựa vào "đọc rồi ghi" trên hệ eventual vì hai node có thể cùng chấp nhận. Cần một thao tác strong cho riêng ràng buộc này: unique constraint trên RDBMS, conditional write (`attribute_not_exists`) của DynamoDB, lightweight transaction (`IF NOT EXISTS`, dùng Paxos) của Cassandra, hoặc một service đặt chỗ username dựa trên consensus. Phần dữ liệu hồ sơ còn lại có thể vẫn eventual.

</details>

---

## 7. Availability Patterns

Bài học: [7. Availability Patterns](../../system-design/03-consistency-availability/2_availability-patterns.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. 99.99% availability tương ứng bao nhiêu downtime mỗi năm và mỗi tháng?**

<details className="qa">
<summary>Xem đáp án</summary>

Khoảng **52.6 phút/năm** và **~4.4 phút/tháng** (8.6 giây/ngày). Để đạt mức này gần như bắt buộc fail-over tự động, deploy không downtime và phân tán qua nhiều AZ, vì con người không kịp phản ứng trong 4 phút.

</details>

**2. Ba thành phần nối tiếp có availability 99.9%, 99.9%, 99.99%. Availability tổng? Làm sao cải thiện?**

<details className="qa">
<summary>Xem đáp án</summary>

0.999 × 0.999 × 0.9999 ≈ **99.79%**. Cải thiện bằng cách thêm dự phòng song song cho thành phần yếu: hai bản 99.9% song song đạt 1 − 0.001² = 99.9999%. Ngoài ra giảm số thành phần nối tiếp (bớt lời gọi đồng bộ), giảm MTTR bằng fail-over tự động.

</details>

**3. So sánh active-passive và active-active fail-over.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Active-passive:** một node phục vụ, node kia chờ với heartbeat; lỗi thì passive chiếm IP/vai trò. Đơn giản, không xung đột ghi; nhưng lãng phí tài nguyên, có downtime chuyển đổi, nguy cơ split-brain và mất dữ liệu chưa replicate.
- **Active-active:** mọi node cùng phục vụ, LB phân tải; node chết thì node còn lại gánh. Tận dụng tài nguyên, fail-over gần tức thời; nhưng phải xử lý đồng bộ/xung đột ghi và đảm bảo mỗi node đủ sức gánh tải khi node khác chết.

</details>

**4. Master-slave và master-master khác nhau thế nào về availability?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Master-slave:** master chết → hệ thống read-only cho tới khi promote một slave; replication async có thể mất ghi gần nhất. Đơn giản, không xung đột.
- **Master-master:** một master chết → master kia tiếp tục nhận ghi ngay, không cần promote. Đổi lại phải giải quyết xung đột ghi, thường chỉ eventual consistent hoặc tăng latency ghi.

</details>

**5. Split-brain là gì và tránh thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi mạng giữa các node đứt nhưng các node vẫn sống, nhiều node cùng tin mình là active/master và cùng nhận ghi → dữ liệu phân kỳ. Tránh bằng: quorum (chỉ phía có đa số được làm master, dùng số node lẻ hoặc witness), fencing/STONITH (cô lập hoặc tắt node cũ trước khi node mới nhận vai), lease có thời hạn, fencing token tăng dần khi ghi vào storage.

</details>

**6. Vì sao công thức availability song song có thể quá lạc quan?**

<details className="qa">
<summary>Xem đáp án</summary>

Công thức giả định các bản dự phòng hỏng **độc lập**. Thực tế có correlated failure: cùng AZ mất điện, cùng bug trong phiên bản deploy, cùng phụ thuộc DNS/config chung, cùng quá tải dây chuyền khi một node chết. Do đó cần phân tán qua AZ/region, deploy canary, đa dạng hoá phụ thuộc, và dự phòng đủ capacity.

</details>
