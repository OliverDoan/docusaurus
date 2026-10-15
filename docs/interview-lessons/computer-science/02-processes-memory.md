---
sidebar_position: 2
title: "Tiến trình, luồng và bộ nhớ"
---

# Tiến trình, luồng và bộ nhớ

## 1. Tiến trình và luồng

Bài học: [1. Tiến trình và luồng](../../computer-science/02-processes-memory/1_tien-trinh-va-luong.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Process và thread khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Process** là chương trình đang chạy, có không gian địa chỉ riêng và tài nguyên riêng (file descriptor, PID). Process bị cô lập nên một process crash không ảnh hưởng process khác; giao tiếp phải qua IPC.
- **Thread** là dòng thực thi trong process. Các thread cùng process dùng chung heap, code, biến toàn cục; mỗi thread có stack và thanh ghi riêng. Tạo và chuyển đổi thread rẻ hơn, giao tiếp nhanh hơn nhưng phải đồng bộ để tránh race condition, và một thread lỗi có thể làm sập cả process.

</details>

**2. Context switch là gì? Vì sao nó tốn kém?**

<details className="qa">
<summary>Xem đáp án</summary>

Là việc CPU ngừng chạy luồng này và chuyển sang luồng khác: lưu thanh ghi, program counter của luồng cũ, chọn luồng mới, nạp trạng thái của luồng mới (và đổi page table nếu khác process).

Tốn kém vì ngoài chi phí trực tiếp (vài micro giây chạy code kernel), còn chi phí gián tiếp: cache CPU và TLB bị "nguội", luồng mới chạy chậm một lúc. Quá nhiều luồng sẽ khiến CPU dành nhiều thời gian cho việc đổi ca.

</details>

**3. Node.js là đơn luồng phải không? Nó xử lý hàng nghìn kết nối đồng thời bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Code JavaScript chạy trên **một luồng chính** với event loop, nhưng process Node có thêm các luồng khác: thread pool của libuv (mặc định 4) cho file system, DNS lookup, crypto, zlib, cùng các luồng của V8 (GC, compiler).

Với I/O mạng, libuv dùng epoll/kqueue: đăng ký với kernel rồi nhận thông báo khi socket sẵn sàng, không cần một luồng cho mỗi kết nối. Luồng chính chỉ chạy các callback ngắn, nên một luồng phục vụ được hàng nghìn kết nối, miễn là không có code đồng bộ chặn lâu.

</details>

**4. `fork()` hoạt động thế nào? Copy-on-write là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`fork()` tạo process con là bản sao của process cha; trả về 0 ở con và PID của con ở cha. Thường con gọi tiếp `exec()` để chạy chương trình khác.

Copy-on-write: sau `fork()`, cha và con dùng chung các trang nhớ vật lý, được đánh dấu chỉ đọc. Khi một bên ghi vào trang nào, kernel bắt lỗi trang, sao chép riêng trang đó cho bên ghi. Nhờ vậy `fork()` nhanh và tiết kiệm RAM, đặc biệt khi con gọi `exec()` ngay.

</details>

**5. Virtual threads trong Java 21 khác platform thread thế nào? Khi nào nên dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Platform thread** ánh xạ 1:1 với luồng OS, nặng, số lượng bị giới hạn ở mức nghìn.
- **Virtual thread** do JVM lập lịch, nhiều virtual thread chạy trên vài carrier thread (mặc định số carrier bằng số nhân). Khi gặp I/O chặn, virtual thread được gỡ khỏi carrier, nên có thể tạo hàng triệu virtual thread.

Nên dùng cho server có nhiều tác vụ chờ I/O (gọi DB, HTTP) với phong cách code chặn quen thuộc. Không giúp tác vụ CPU-bound. Cần lưu ý các thư viện giới hạn tài nguyên bằng pool (ví dụ connection pool DB vẫn là giới hạn thật), và không nên đưa virtual thread vào pool.

</details>

**6. Vì sao Chrome dùng nhiều process thay vì nhiều thread?**

<details className="qa">
<summary>Xem đáp án</summary>

Để **cô lập lỗi và bảo mật**: renderer của mỗi site chạy trong process riêng có sandbox. Một trang treo hay crash không kéo sập trình duyệt; mã độc trên một trang khó đọc dữ liệu của trang khác vì không cùng không gian địa chỉ (đặc biệt quan trọng sau Spectre). Đổi lại, Chrome tốn RAM hơn vì mỗi process có bộ nhớ và bản sao engine riêng.

</details>

---

## 2. Lập lịch CPU

Bài học: [2. Lập lịch CPU](../../computer-science/02-processes-memory/2_lap-lich-cpu.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Preemptive và non-preemptive scheduling khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Non-preemptive:** luồng chạy cho tới khi tự nhường (kết thúc, chờ I/O, yield). Đơn giản nhưng một luồng chạy lâu chặn tất cả. Event loop của Node.js/trình duyệt hoạt động kiểu này với từng callback.
- **Preemptive:** kernel dùng ngắt timer để giành lại CPU khi hết time slice hoặc có luồng ưu tiên cao hơn. Phản hồi tốt và an toàn hơn, đổi lại phải đồng bộ cẩn thận vì luồng có thể bị ngắt ở bất kỳ đâu. Mọi OS phổ biến hiện nay đều preemptive.

</details>

**2. Cho P1 = 24, P2 = 3, P3 = 3 (đều đến lúc 0). Tính waiting time trung bình với FCFS và Round Robin quantum 4.**

<details className="qa">
<summary>Xem đáp án</summary>

- **FCFS** (P1, P2, P3): waiting = 0, 24, 27 → trung bình **17**.
- **RR q = 4:** lịch chạy P1 (0–4), P2 (4–7), P3 (7–10), P1 (10–30). Waiting = turnaround − burst = 30 − 24 = 6, 7 − 3 = 4, 10 − 3 = 7 → trung bình 17/3 ≈ **5,67**.

RR tốt hơn vì các tiến trình ngắn không bị kẹt sau tiến trình dài (convoy effect).

</details>

**3. Starvation là gì? Khắc phục thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Starvation là khi một tiến trình **chờ mãi không được chạy** vì luôn có tiến trình khác được ưu tiên hơn, thường gặp với priority scheduling và SJF/SRTF (tiến trình dài bị tiến trình ngắn chen liên tục).

Khắc phục bằng **aging**: tăng dần độ ưu tiên theo thời gian chờ; hoặc định kỳ nâng tất cả lên mức cao nhất như MLFQ; hoặc dùng thuật toán theo phần chia công bằng như CFS.

</details>

**4. Vì sao SJF tối ưu về lý thuyết nhưng khó dùng trong thực tế?**

<details className="qa">
<summary>Xem đáp án</summary>

SJF cho waiting time trung bình nhỏ nhất (với một tập tiến trình cho trước, khi xét các thuật toán không chiếm quyền), nhưng cần **biết trước burst time**, điều mà OS không thể biết. Chỉ có thể ước lượng từ lịch sử (trung bình mũ). Ngoài ra nó có thể làm tiến trình dài bị starvation. MLFQ là cách thực tế để xấp xỉ SJF: quan sát hành vi để đoán tiến trình nào ngắn/tương tác.

</details>

**5. Load average là gì? Load 6 trên máy 4 nhân có đáng lo không?**

<details className="qa">
<summary>Xem đáp án</summary>

Load average là trung bình trượt số tác vụ đang chạy hoặc chờ chạy trong 1, 5, 15 phút; trên Linux tính cả tác vụ chờ I/O không ngắt được (trạng thái D).

Load 6 trên 4 nhân nghĩa là trung bình có khoảng 2 tác vụ phải chờ. Cần xem xu hướng (3 con số tăng hay giảm) và nguyên nhân: nếu `%wa` cao thì nghẽn ở đĩa, nếu `%us` cao thì thật sự thiếu CPU. Thoáng qua thì bình thường, kéo dài thì cần scale hoặc tối ưu.

</details>

**6. Linux CFS chọn luồng chạy tiếp theo như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi luồng có **vruntime** — thời gian CPU đã dùng chia theo trọng số (phụ thuộc giá trị nice). Các luồng ready được lưu trong cây đỏ đen theo vruntime, scheduler luôn chọn luồng có vruntime nhỏ nhất (nút trái nhất). Luồng ưu tiên cao có vruntime tăng chậm hơn nên được chạy nhiều hơn. Từ Linux 6.6, CFS được thay bằng **EEVDF**, vẫn chia CPU theo trọng số nhưng chọn luồng đủ điều kiện có deadline ảo sớm nhất, giúp kiểm soát độ trễ tốt hơn.

</details>

---

## 3. Đồng thời và đồng bộ

Bài học: [3. Đồng thời và đồng bộ](../../computer-science/02-processes-memory/3_dong-thoi-va-dong-bo.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Concurrency và parallelism khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Concurrency:** nhiều tác vụ cùng tiến triển trong một khoảng thời gian, có thể xen kẽ trên một nhân. Là cách **cấu trúc** chương trình.
- **Parallelism:** nhiều tác vụ chạy **cùng một lúc** trên nhiều nhân. Là cách **thực thi** để nhanh hơn.

Node.js một luồng là concurrent nhưng không parallel (với code JS); Java với nhiều luồng trên máy đa nhân là cả hai.

</details>

**2. Vì sao `counter++` không an toàn khi nhiều luồng cùng chạy? Sửa thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì nó gồm 3 bước: đọc giá trị, cộng 1, ghi lại. Hai luồng có thể cùng đọc giá trị cũ rồi cùng ghi giá trị mới giống nhau, làm mất một lần tăng (lost update).

Cách sửa: dùng thao tác nguyên tử (`AtomicInteger.incrementAndGet()`, `LongAdder`, `Atomics.add` trong JS), hoặc bảo vệ bằng `synchronized`/lock. `volatile` **không đủ** vì nó chỉ đảm bảo tính nhìn thấy (visibility), không đảm bảo tính nguyên tử.

</details>

**3. Mutex và semaphore khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Mutex:** khoá loại trừ, chỉ một luồng vào critical section; có chủ sở hữu, luồng nào khoá thì luồng đó mở.
- **Semaphore:** bộ đếm permit, cho tối đa N luồng cùng lúc; không có chủ sở hữu, luồng khác có thể release. Binary semaphore (N = 1) giống mutex về hành vi nhưng hay dùng để báo hiệu giữa các luồng.

Ví dụ: mutex để bảo vệ cập nhật một cấu trúc dữ liệu; semaphore để giới hạn 10 kết nối tới một dịch vụ.

</details>

**4. Nêu 4 điều kiện của deadlock và cách phòng tránh.**

<details className="qa">
<summary>Xem đáp án</summary>

1. **Mutual exclusion** — tài nguyên không chia sẻ được.
2. **Hold and wait** — giữ tài nguyên trong khi chờ tài nguyên khác.
3. **No preemption** — không thể giật tài nguyên.
4. **Circular wait** — có vòng chờ.

Phá một trong bốn là đủ. Thực tế: khoá theo thứ tự cố định (phá circular wait), lấy tất cả khoá cùng lúc (phá hold and wait), `tryLock` có timeout rồi nhả hết và thử lại (phá no preemption). Database thì phát hiện deadlock và huỷ một transaction, app cần retry.

</details>

**5. JavaScript đơn luồng thì có race condition không?**

<details className="qa">
<summary>Xem đáp án</summary>

Có. Code đồng bộ giữa hai `await` không bị xen ngang, nhưng tại mỗi `await` event loop có thể chạy tác vụ khác. Logic "đọc dữ liệu, await thứ gì đó, ghi dữ liệu dựa trên giá trị đã đọc" sẽ bị race khi hai request chạy đồng thời. Ngoài ra còn race giữa nhiều instance Node cùng ghi DB, race giữa các response fetch ở frontend, và race thật sự giữa các worker dùng `SharedArrayBuffer`.

Cách xử lý: thao tác nguyên tử ở DB, transaction/lock ở DB, mutex bất đồng bộ trong một process, `AbortController` để huỷ request cũ ở frontend.

</details>

**6. Optimistic locking và pessimistic locking khác nhau thế nào? Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Pessimistic:** khoá dữ liệu ngay khi đọc (`SELECT ... FOR UPDATE`), transaction khác phải chờ. An toàn, phù hợp khi tranh chấp cao, nhưng giảm thông lượng và có nguy cơ deadlock.
- **Optimistic:** không khoá; khi ghi kiểm tra cột `version` (hoặc timestamp) có còn như lúc đọc không, nếu không thì báo xung đột và thử lại. Phù hợp khi tranh chấp thấp, đọc nhiều ghi ít (JPA `@Version`).

Với phép tính đơn giản như trừ kho, một câu `UPDATE ... SET stock = stock - 1 WHERE stock >= 1` nguyên tử thường là đủ và tốt nhất.

</details>

---

## 4. Quản lý bộ nhớ

Bài học: [4. Quản lý bộ nhớ](../../computer-science/02-processes-memory/4_quan-ly-bo-nho.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Bộ nhớ ảo là gì? Vì sao cần nó?**

<details className="qa">
<summary>Xem đáp án</summary>

Bộ nhớ ảo cho mỗi tiến trình một không gian địa chỉ riêng; MMU dịch địa chỉ ảo sang địa chỉ vật lý theo từng trang dựa trên page table do hệ điều hành quản lý.

Lợi ích: **cô lập** các tiến trình (không đọc/ghi được bộ nhớ của nhau), chương trình thấy **không gian liền mạch** dù RAM thật bị phân mảnh, chỉ trang đang dùng mới chiếm RAM nên **tổng bộ nhớ có thể vượt RAM** (nhờ swap, lazy allocation), **chia sẻ** thư viện và copy-on-write khi `fork()`.

</details>

**2. TLB là gì? Điều gì xảy ra khi TLB miss và khi page fault?**

<details className="qa">
<summary>Xem đáp án</summary>

TLB là cache trong CPU lưu các phép dịch trang ảo sang frame vật lý gần đây.

- **TLB miss:** CPU (hoặc kernel trên một số kiến trúc) tra page table nhiều cấp trong RAM, nạp kết quả vào TLB. Chậm hơn hit nhưng vẫn ở mức chục đến trăm nano giây.
- **Page fault:** mục page table báo trang không có trong RAM; CPU ngắt vào kernel, kernel cấp frame, đọc dữ liệu từ đĩa nếu cần (major fault), cập nhật page table rồi cho chạy lại lệnh. Nếu địa chỉ không hợp lệ, tiến trình nhận `SIGSEGV`.

</details>

**3. Stack và heap khác nhau thế nào? Khi nào gặp stack overflow?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Stack:** mỗi luồng một stack, chứa khung hàm (tham số, biến cục bộ, địa chỉ trả về); cấp phát/giải phóng tự động theo lời gọi hàm, rất nhanh nhưng nhỏ (thường 1–8 MB).
- **Heap:** dùng chung trong tiến trình, chứa object cấp phát động, lớn và linh hoạt, do GC hoặc lập trình viên giải phóng.

Stack overflow xảy ra khi số khung hàm vượt kích thước stack, thường do đệ quy không có điểm dừng hoặc quá sâu (JS: `RangeError: Maximum call stack size exceeded`, Java: `StackOverflowError`). Sửa bằng vòng lặp hoặc giới hạn độ sâu.

</details>

**4. Garbage collector hoạt động thế nào? Generational GC dựa trên giả thuyết gì?**

<details className="qa">
<summary>Xem đáp án</summary>

GC theo kiểu tracing (mark-and-sweep): từ các GC root (biến toàn cục, stack các luồng, thanh ghi) đánh dấu mọi object đến được; object không được đánh dấu bị thu hồi; có thể compact để giảm phân mảnh. Cách này xử lý được tham chiếu vòng, điều mà reference counting không làm được.

Generational GC dựa trên giả thuyết **phần lớn object chết trẻ**. Heap chia thành young gen (nhỏ, GC thường xuyên, rẻ vì chỉ sao chép số ít object còn sống) và old gen (lớn, GC ít hơn). Object sống sót qua vài lần GC được chuyển lên old gen. V8 dùng Scavenger cho young và mark-sweep-compact cho old; JVM dùng Eden/Survivor cho young và G1 (mặc định), ZGC, Shenandoah...

</details>

**5. Kể các nguyên nhân memory leak phổ biến trong Node.js và cách tìm ra chúng.**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên nhân: biến toàn cục/module-level tích luỹ dữ liệu, cache Map không giới hạn, event listener và `setInterval` không gỡ, closure giữ object lớn, giữ tham chiếu tới `req`/`res` sau khi request kết thúc, Buffer giữ lâu (leak ngoài heap).

Cách tìm: theo dõi `process.memoryUsage()` (đáy heapUsed tăng dần, RSS tăng), chụp hai heap snapshot trước và sau khi tạo tải (`node --inspect` hoặc `--heapsnapshot-signal`), so sánh bằng chế độ Comparison trong Chrome DevTools, xem cột **Retainers** để biết chuỗi tham chiếu nào giữ object.

</details>

**6. Vì sao app Node/Java trong Kubernetes bị OOMKilled dù chưa thấy lỗi heap?**

<details className="qa">
<summary>Xem đáp án</summary>

Memory limit của container (thực thi bằng cgroup) tính trên **toàn bộ bộ nhớ của process** — heap cộng stack các luồng, code, Buffer, metaspace (JVM), bộ nhớ native — chứ không chỉ heap. Nếu giới hạn heap đặt bằng hoặc sát limit, tổng bộ nhớ vượt limit trước khi heap đầy, kernel OOM killer giết process bằng `SIGKILL` (exit code 137) nên không có stack trace.

Cách xử lý: đặt heap khoảng 70–80% limit (`--max-old-space-size`, `-XX:MaxRAMPercentage`), theo dõi RSS, tìm leak ngoài heap nếu RSS tăng mãi.

</details>
