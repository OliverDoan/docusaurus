---
sidebar_position: 9
title: "9. Concurrency"
---

# 9. Concurrency

## 1. Goroutine

Bài học: [1. Goroutine](../../golang/09-concurrency/1_goroutine.md)

**1. Goroutine khác OS thread thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Goroutine do Go runtime quản lý trong user space, stack khởi đầu khoảng 2KB và tự co giãn; tạo và chuyển ngữ cảnh rẻ vì không cần system call. OS thread do kernel quản lý, stack lớn cố định (~1MB+), tạo và chuyển ngữ cảnh đắt. Runtime ánh xạ nhiều goroutine lên ít thread (M:N) qua scheduler G-M-P. Goroutine không có ID công khai, không có độ ưu tiên, không thể bị kill từ bên ngoài.

</details>

**2. Giải thích mô hình G-M-P.**

<details className="qa">
<summary>Xem đáp án</summary>

G là goroutine, M là OS thread, P là processor logic chứa local run queue; M phải giữ P mới chạy được code Go, số P bằng `GOMAXPROCS`. G mới vào local queue của P hiện tại; P rảnh lấy từ global queue hoặc work-stealing từ P khác. Khi G gọi syscall chặn, P được tách khỏi M để M khác tiếp tục chạy các G còn lại. I/O mạng đi qua network poller nên không chặn M. Từ Go 1.14 có asynchronous preemption để G chạy lâu không độc chiếm P.

</details>

**3. Concurrency và parallelism khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Concurrency là cách cấu trúc chương trình thành nhiều tác vụ độc lập có thể tiến triển đan xen — chạy được cả trên 1 core. Parallelism là thực thi nhiều tác vụ cùng một thời điểm trên nhiều core. Concurrency là điều kiện để có parallelism nhưng không đảm bảo nó; Go cho bạn viết code concurrent và runtime tận dụng parallelism theo `GOMAXPROCS`.

</details>

**4. Goroutine leak là gì? Lấy ví dụ và cách phòng tránh.**

<details className="qa">
<summary>Xem đáp án</summary>

Là goroutine bị chặn vĩnh viễn (chờ gửi/nhận channel, chờ lock, vòng lặp không điều kiện dừng) nên không bao giờ kết thúc; GC không thu hồi được nó. Ví dụ: goroutine gửi kết quả vào channel unbuffered nhưng hàm gọi đã return vì timeout. Phòng tránh: dùng buffer phù hợp, luôn có đường thoát qua `ctx.Done()`, đóng channel từ phía gửi, `defer cancel()`. Phát hiện bằng `runtime.NumGoroutine`, pprof goroutine profile, `goleak` trong test.

</details>

**5. Panic trong một goroutine có bị `recover` ở `main` bắt không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. `recover` chỉ có tác dụng trong hàm `defer` của **chính goroutine** đang panic. Panic không được recover trong bất kỳ goroutine nào sẽ làm sập toàn bộ process. Goroutine chạy code có thể panic (handler do người dùng cung cấp, plugin) cần tự `defer func() { recover() ... }()` ở đầu.

</details>

**6. `GOMAXPROCS` là gì? Có vấn đề gì khi chạy trong container?**

<details className="qa">
<summary>Xem đáp án</summary>

Là số P — số goroutine tối đa thực thi code Go cùng lúc; mặc định bằng số CPU logic. Trước Go 1.25, Go không đọc CPU limit của cgroup, nên container giới hạn 2 CPU trên node 64 core vẫn có `GOMAXPROCS=64`, dẫn tới bị CFS throttling và latency cao; giải pháp là `go.uber.org/automaxprocs` hoặc đặt biến môi trường. Từ Go 1.25, runtime tự tôn trọng CPU limit của cgroup trên Linux.

</details>

---

## 2. Channel

Bài học: [2. Channel](../../golang/09-concurrency/2_channel.md)

**1. Channel unbuffered và buffered khác nhau thế nào? Khi nào dùng loại nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Unbuffered: gửi chặn tới khi có người nhận và ngược lại — đồng bộ hoá hai goroutine tại điểm trao đổi; bên gửi biết chắc bên nhận đã nhận. Buffered với sức chứa n: gửi chỉ chặn khi đầy, nhận chỉ chặn khi rỗng — tách rời tốc độ hai bên. Unbuffered cho tín hiệu và handoff cần đảm bảo; buffered cho job queue, semaphore, hoặc buffer 1 để goroutine gửi kết quả không bị kẹt khi bên nhận đã bỏ đi.

</details>

**2. Điều gì xảy ra khi gửi, nhận, đóng trên nil channel và channel đã đóng?**

<details className="qa">
<summary>Xem đáp án</summary>

Nil channel: gửi và nhận chặn vĩnh viễn, đóng thì panic. Channel đã đóng: gửi panic, đóng lại panic, nhận trả hết dữ liệu còn trong buffer rồi trả zero value ngay lập tức với `ok == false`. Channel mở: gửi/nhận chặn theo buffer, đóng thành công và đánh thức mọi goroutine đang nhận.

</details>

**3. Ai nên đóng channel? Làm sao đóng an toàn khi có nhiều goroutine gửi?**

<details className="qa">
<summary>Xem đáp án</summary>

Bên gửi (người sở hữu channel) đóng, bên nhận không đóng. Với nhiều bên gửi: dùng `sync.WaitGroup` đếm các bên gửi và một goroutine riêng `wg.Wait()` rồi `close(ch)`. Hoặc không đóng channel dữ liệu mà dùng một channel/context riêng để báo dừng. Không bắt buộc đóng mọi channel — chỉ đóng khi bên nhận cần biết đã hết dữ liệu.

</details>

**4. Lỗi "all goroutines are asleep - deadlock!" xuất hiện khi nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi runtime thấy **mọi** goroutine đều đang chặn (chờ channel, lock...) và không goroutine nào có thể đánh thức chúng — ví dụ gửi vào channel unbuffered trong `main` mà không có goroutine nhận, hoặc `range` một channel không bao giờ đóng. Nếu vẫn còn goroutine khác chạy hoặc đang chờ I/O mạng/timer (như HTTP server), runtime không báo lỗi mà chương trình chỉ treo một phần — vì vậy deadlock trong service thật thường khó phát hiện hơn.

</details>

**5. Channel có hướng (`chan<- T`, `<-chan T`) dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Giới hạn thao tác tại compile time: `chan<- T` chỉ gửi (và đóng), `<-chan T` chỉ nhận. Channel hai chiều tự chuyển thành một chiều khi truyền vào tham số. Giúp chữ ký hàm thể hiện rõ vai trò producer/consumer, ngăn bên nhận lỡ đóng hoặc gửi ngược, và làm rõ ai sở hữu channel.

</details>

**6. Nil channel có ích gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong `select`, case với nil channel không bao giờ được chọn. Gán một channel thành nil sau khi nó đóng (hoặc khi tạm thời không muốn gửi/nhận) giúp tắt động nhánh đó — ví dụ gộp nhiều channel đóng vào các thời điểm khác nhau, hoặc chỉ bật case gửi khi có dữ liệu chờ gửi. Nếu không, case của channel đã đóng được chọn liên tục làm vòng lặp quay vô ích.

</details>

---

## 3. Select

Bài học: [3. Select](../../golang/09-concurrency/3_select.md)

**1. Nếu nhiều case trong `select` cùng sẵn sàng thì case nào chạy?**

<details className="qa">
<summary>Xem đáp án</summary>

Go chọn **ngẫu nhiên đều** một case trong số các case sẵn sàng, không theo thứ tự viết. Mục đích là tránh starvation. Muốn ưu tiên một channel (ví dụ `ctx.Done()`), phải tự kiểm tra trước bằng một `select` có `default`, rồi mới vào `select` chính.

</details>

**2. `select` không có case nào sẵn sàng và không có `default` thì sao? `select {}` làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Goroutine chặn cho tới khi một case sẵn sàng. `select {}` không có case nào nên chặn vĩnh viễn — đôi khi dùng ở cuối `main` để giữ chương trình sống trong khi các goroutine khác làm việc (nhưng nếu mọi goroutine khác cũng chặn, runtime báo deadlock). Có `default` thì không bao giờ chặn.

</details>

**3. Làm timeout cho thao tác chờ channel thế nào? Có vấn đề gì với `time.After` trong vòng lặp?**

<details className="qa">
<summary>Xem đáp án</summary>

Thêm case `<-time.After(d)` hoặc `<-ctx.Done()` với context có timeout. `time.After` trong vòng lặp tạo timer mới mỗi vòng; trước Go 1.23 timer chưa kích hoạt không được GC thu hồi nên vòng lặp nóng với timeout dài có thể tốn nhiều bộ nhớ. Từ Go 1.23 vấn đề GC được sửa, nhưng vẫn nên dùng một `time.NewTimer` và `Reset`, hoặc context. Ngoài ra cần phân biệt timeout tổng (tạo timer ngoài vòng lặp) và timeout mỗi lần chờ (tạo trong vòng lặp).

</details>

**4. `break` bên trong `select` nằm trong `for` thoát khỏi đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Chỉ thoát khỏi `select`, vòng `for` tiếp tục chạy. Để thoát vòng lặp: dùng `break` với label đặt trước `for`, dùng `return` (tách vòng lặp thành hàm riêng), hoặc biến cờ. Đây là lỗi phổ biến khiến goroutine không dừng khi channel đóng.

</details>

**5. Kỹ thuật gán channel thành `nil` trong `select` dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Case gửi/nhận trên nil channel không bao giờ sẵn sàng nên bị bỏ qua. Gán nil cho channel đã đóng để không bị chọn liên tục (nhận từ channel đóng trả về ngay), hoặc chỉ bật case gửi khi đang có dữ liệu cần gửi (biến `sendCh` nil khi hàng đợi rỗng). Giúp một `select` duy nhất xử lý trạng thái thay đổi mà không cần nhiều nhánh `if`.

</details>

**6. Viết goroutine định kỳ mỗi 5 giây làm việc X và dừng được khi tắt server.**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng `time.NewTicker(5 * time.Second)` với `defer ticker.Stop()`, vòng for-select có hai case: `<-ctx.Done()` để return và `<-ticker.C` để làm X. Context được huỷ khi server nhận SIGTERM (ví dụ qua `signal.NotifyContext`). Nếu X có thể chạy lâu hơn chu kỳ, ticker sẽ bỏ bớt tick chứ không dồn đống; truyền `ctx` vào X để X cũng dừng được.

</details>

---

## 4. Package sync

Bài học: [4. Package sync](../../golang/09-concurrency/4_sync.md)

**1. `Mutex` và `RWMutex` khác nhau thế nào? Khi nào `RWMutex` lại chậm hơn?**

<details className="qa">
<summary>Xem đáp án</summary>

`Mutex` chỉ cho một goroutine vào vùng khoá. `RWMutex` cho nhiều reader (`RLock`) cùng lúc hoặc một writer (`Lock`) độc quyền. `RWMutex` có chi phí quản lý cao hơn (đếm reader, đồng bộ trên nhiều core), nên khi vùng khoá rất ngắn hoặc tỉ lệ ghi cao, nó có thể chậm hơn `Mutex`. Chỉ nên dùng khi đọc áp đảo ghi và có benchmark chứng minh.

</details>

**2. Vì sao không được copy một struct chứa `sync.Mutex`?**

<details className="qa">
<summary>Xem đáp án</summary>

Mutex chứa trạng thái (đã khoá chưa, ai đang chờ). Copy tạo một mutex độc lập với trạng thái tại thời điểm copy — khoá bản sao không bảo vệ bản gốc, hoặc copy một mutex đang khoá thì bản sao khoá vĩnh viễn. Thường xảy ra khi method dùng value receiver hoặc truyền struct theo giá trị. Dùng pointer receiver; `go vet` (analyzer copylocks) phát hiện lỗi này. Tương tự cho `WaitGroup`, `Once`, `Cond`.

</details>

**3. Lỗi gì khi gọi `wg.Add(1)` bên trong goroutine?**

<details className="qa">
<summary>Xem đáp án</summary>

Race giữa `Add` và `Wait`: goroutine cha có thể gọi `Wait` khi bộ đếm vẫn là 0 (goroutine con chưa kịp chạy `Add`) nên `Wait` trả về ngay, trước khi công việc xong. Phải gọi `Add` trước câu lệnh `go`. Từ Go 1.25 dùng `wg.Go(f)` để tránh hẳn lỗi này.

</details>

**4. Khi nào dùng `sync/atomic` thay vì `Mutex`?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi trạng thái là **một biến đơn lẻ** — bộ đếm, cờ bool, con trỏ tới cấu hình bất biến — và thao tác là load/store/add/CAS. Atomic nhanh hơn và không chặn. Khi cần giữ bất biến giữa nhiều biến hoặc thao tác phức tạp (đọc-sửa-ghi map), phải dùng mutex. Từ Go 1.19 dùng kiểu `atomic.Int64`, `atomic.Bool`, `atomic.Pointer[T]` thay vì hàm `atomic.AddInt64` để tránh truy cập không nguyên tử vô tình.

</details>

**5. `sync.Map` có nên thay thế `map` + `Mutex` không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không nói chung. `sync.Map` tối ưu cho hai trường hợp: key ghi một lần đọc nhiều lần, và các goroutine thao tác trên tập key rời nhau. Ngoài ra, `map` + `Mutex`/`RWMutex` thường nhanh tương đương hoặc hơn, và có kiểu tĩnh an toàn (sync.Map dùng `any`, phải type assertion). `sync.Map` cũng không có `Len`.

</details>

**6. `errgroup` khác `WaitGroup` thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`errgroup.Group.Go` nhận hàm trả `error`; `Wait` trả lỗi khác nil đầu tiên. `errgroup.WithContext` trả về context bị huỷ ngay khi một goroutine lỗi (hoặc khi `Wait` trả về), để các goroutine khác dừng sớm. `SetLimit(n)` giới hạn số goroutine chạy đồng thời, `TryGo` thử chạy không chặn. `WaitGroup` chỉ đếm và chờ, không có lỗi hay huỷ.

</details>

---

## 5. Context

Bài học: [5. Context](../../golang/09-concurrency/5_context.md)

**1. Context dùng để làm gì? Vì sao nó là tham số đầu tiên?**

<details className="qa">
<summary>Xem đáp án</summary>

Context mang tín hiệu huỷ, deadline và giá trị phạm vi request qua ranh giới hàm và goroutine, để khi request bị huỷ/hết hạn, mọi công việc liên quan (DB, HTTP, goroutine con) cùng dừng. Đặt làm tham số đầu tiên là quy ước của package `context` — nhìn chữ ký là biết hàm có thể bị huỷ, nhất quán trong toàn hệ sinh thái, và tránh lưu ctx trong struct (gây mơ hồ về vòng đời).

</details>

**2. Vì sao phải `defer cancel()`? Nếu quên thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`cancel` giải phóng tài nguyên gắn với context con: gỡ liên kết khỏi cha, dừng timer (với `WithTimeout`/`WithDeadline`), đóng `Done` để goroutine đang chờ thoát. Quên gọi thì các tài nguyên này chỉ được giải phóng khi cha bị huỷ hoặc timer hết hạn — với cha là `Background` có thể là không bao giờ, gây rò rỉ. `go vet` có analyzer `lostcancel` cảnh báo.

</details>

**3. Huỷ context con có ảnh hưởng tới context cha không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. Huỷ chỉ lan từ cha xuống con. Huỷ cha sẽ huỷ mọi con cháu; huỷ con chỉ ảnh hưởng con và cháu của nó. Tương tự, con không kéo dài được deadline của cha — deadline hiệu lực là cái sớm hơn. Muốn tách khỏi việc huỷ của cha (chạy nền sau request) thì dùng `context.WithoutCancel` (Go 1.21).

</details>

**4. Dùng `context.WithValue` thế nào cho đúng?**

<details className="qa">
<summary>Xem đáp án</summary>

Chỉ cho dữ liệu phạm vi request đi xuyên API: request ID, trace span, user đã xác thực. Key phải là kiểu riêng chưa export (`type ctxKey int`) để không đụng với package khác; đóng gói bằng hàm `WithX(ctx, v)` và `X(ctx)`. Không dùng để truyền phụ thuộc (DB, logger) hay tham số nghiệp vụ, vì đó là phụ thuộc ẩn, mất kiểm tra kiểu và khó test.

</details>

**5. `ctx.Err()` và `context.Cause(ctx)` khác gì nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

`ctx.Err()` chỉ trả `nil`, `context.Canceled` hoặc `context.DeadlineExceeded`. `context.Cause(ctx)` (Go 1.20) trả lỗi cụ thể được truyền vào khi huỷ qua `WithCancelCause`, `WithTimeoutCause`, `WithDeadlineCause`; nếu huỷ theo cách thường thì trả giống `Err()`. Giúp log và phân biệt nguyên nhân (người dùng huỷ, timeout gọi service nào...).

</details>

**6. Gửi email nền sau khi handler trả response, dùng context nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không dùng thẳng `r.Context()` vì nó bị huỷ khi handler trả về. Cũng không nên dùng `context.Background()` vì mất request ID/trace. Dùng `context.WithoutCancel(r.Context())` để giữ giá trị nhưng bỏ việc huỷ, rồi bọc thêm `WithTimeout` để goroutine nền có giới hạn thời gian riêng. Trong hệ thống cần đảm bảo gửi, nên đưa vào hàng đợi bền vững (outbox, message queue) thay vì goroutine.

</details>

---

## 6. Các pattern concurrency

Bài học: [6. Các pattern concurrency](../../golang/09-concurrency/6_concurrency-patterns.md)

**1. Vì sao cần worker pool khi goroutine đã rất rẻ?**

<details className="qa">
<summary>Xem đáp án</summary>

Goroutine rẻ nhưng tài nguyên mà chúng dùng thì không: kết nối DB, file descriptor, băng thông, quota API, CPU. Một goroutine mỗi việc với hàng trăm nghìn việc có thể làm sập hệ thống phía sau hoặc hết bộ nhớ. Worker pool (hoặc semaphore, `errgroup.SetLimit`) giới hạn mức đồng thời, tạo backpressure tự nhiên (producer chặn khi worker bận) và cho phép tái sử dụng tài nguyên theo worker.

</details>

**2. Trong worker pool, ai đóng channel jobs và results? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Producer đóng `jobs` sau khi gửi hết — để worker thoát vòng `range`. `results` có nhiều bên gửi (các worker) nên không worker nào được tự đóng; dùng một goroutine riêng `wg.Wait()` rồi `close(results)`, để collector `range results` biết khi nào hết. Đóng sai bên dẫn tới panic "send on closed channel" hoặc collector chờ mãi.

</details>

**3. Pipeline cần làm gì để không leak goroutine khi bên tiêu thụ dừng sớm?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi stage gửi bằng `select` có thêm case `<-ctx.Done()` (hoặc channel `done`) để thoát khi bị huỷ; mỗi stage `defer close(out)`. Bên tiêu thụ dừng sớm thì gọi `cancel()` — mọi stage đang chặn ở bước gửi sẽ chọn nhánh huỷ và return, đóng output, kéo theo stage sau thoát vòng range.

</details>

**4. Semaphore và rate limiter khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Semaphore giới hạn **số việc đang chạy đồng thời** (concurrency) — ví dụ tối đa 10 kết nối cùng lúc, việc nhanh thì throughput cao. Rate limiter giới hạn **tốc độ** — số việc mỗi đơn vị thời gian (ví dụ 100 req/s), bất kể mỗi việc mất bao lâu. Semaphore dùng buffered channel hoặc `x/sync/semaphore`; rate limiter dùng ticker hoặc token bucket `x/time/rate` (cho phép burst).

</details>

**5. Mô tả graceful shutdown một HTTP server Go.**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng `signal.NotifyContext` bắt SIGINT/SIGTERM; chạy `ListenAndServe` trong goroutine; khi ctx huỷ, tạo context mới có timeout (nhỏ hơn grace period của orchestrator) và gọi `srv.Shutdown(ctx)` — nó đóng listener, đóng kết nối rảnh và chờ request đang xử lý xong. Bỏ qua `http.ErrServerClosed`. Đồng thời huỷ context của worker nền và chờ bằng `WaitGroup`, sau đó đóng DB và flush log. Nếu `Shutdown` quá hạn thì `srv.Close()` để buộc đóng.

</details>

**6. Fan-out/fan-in có giữ thứ tự kết quả không? Làm sao giữ?**

<details className="qa">
<summary>Xem đáp án</summary>

Không — các worker hoàn thành theo thứ tự bất kỳ và channel gộp nhận theo thứ tự hoàn thành. Để giữ thứ tự: gắn chỉ số vào mỗi job và ghi kết quả vào `results[i]` (mỗi goroutine ghi ô riêng, không race), hoặc gom rồi sắp xếp theo chỉ số, hoặc dùng cấu trúc reorder buffer phát ra theo thứ tự khi phần tử kế tiếp đã sẵn sàng.

</details>

---

## 7. Race condition và Race detector

Bài học: [7. Race condition và Race detector](../../golang/09-concurrency/7_race-detection.md)

**1. Data race là gì? Khác race condition thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Data race: hai goroutine truy cập cùng vùng nhớ đồng thời, ít nhất một truy cập là ghi, và không có thao tác đồng bộ nào tạo quan hệ happens-before giữa chúng. Race condition: tính đúng đắn phụ thuộc vào thứ tự/thời điểm thực thi — có thể xảy ra ngay cả khi mọi truy cập đều có khoá (ví dụ check-then-act: kiểm tra tồn kho rồi trừ ở hai lần khoá riêng). Race detector chỉ bắt data race; race condition logic phải thiết kế đúng (gộp thao tác trong một vùng khoá, dùng transaction/ràng buộc DB).

</details>

**2. Race detector hoạt động thế nào? Có hạn chế gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Dựa trên ThreadSanitizer: compiler chèn mã theo dõi vào mọi lần truy cập bộ nhớ và các thao tác đồng bộ, runtime dùng vector clock để phát hiện hai truy cập xung đột không có happens-before. Không có false positive. Hạn chế: chỉ bắt race trên đường code thực sự chạy trong lần đó (không chứng minh được "không có race"), chậm 2–20 lần, tốn 5–10 lần bộ nhớ, cần cgo trên Linux — nên thường dùng trong test/CI/staging.

</details>

**3. Vì sao `count++` từ nhiều goroutine cho kết quả sai? Có những cách sửa nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`count++` gồm đọc - cộng - ghi, không nguyên tử; hai goroutine đọc cùng giá trị cũ rồi cùng ghi giá trị mới nên mất một lần tăng. Sửa bằng: `sync.Mutex` bao quanh; `atomic.Int64.Add(1)`; một goroutine sở hữu biến, các goroutine khác gửi yêu cầu qua channel; hoặc mỗi goroutine đếm cục bộ rồi cộng tổng sau `Wait`.

</details>

**4. Happens-before là gì? Kể vài thao tác tạo quan hệ này trong Go.**

<details className="qa">
<summary>Xem đáp án</summary>

Là quan hệ thứ tự đảm bảo hiệu ứng của thao tác A nhìn thấy được bởi thao tác B. Không có happens-before thì compiler/CPU có thể sắp xếp lại và goroutine khác có thể thấy giá trị cũ hoặc thứ tự khác. Các thao tác tạo quan hệ: lệnh `go` (trước khi goroutine bắt đầu), gửi channel trước khi nhận tương ứng hoàn tất, `close` trước lần nhận do đóng, `Unlock` trước `Lock` kế tiếp, `once.Do` hoàn tất trước các `Do` khác trả về, `wg.Done` trước `Wait` trả về, và các thao tác atomic (nhất quán tuần tự).

</details>

**5. Ghi vào các phần tử khác nhau của cùng một slice từ nhiều goroutine có race không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không, nếu mỗi goroutine ghi vào chỉ số riêng và slice không bị `append`/gán lại trong lúc đó — mỗi phần tử là vùng nhớ riêng. Đọc kết quả sau `wg.Wait()` là an toàn nhờ happens-before của WaitGroup. Ngược lại, `append` vào cùng một slice từ nhiều goroutine là race (cùng đọc/ghi header slice và có thể cấp phát lại mảng). Ghi vào các field khác nhau của cùng struct cũng không race; nhưng ghi vào cùng một map (kể cả key khác nhau) là race.

</details>

**6. Đưa race detector vào CI thế nào cho hiệu quả?**

<details className="qa">
<summary>Xem đáp án</summary>

Chạy `go test -race -count=1 ./...` trên mọi PR (bật cgo, image có gcc), tăng timeout. Viết test có tính đồng thời thật (nhiều goroutine gọi cùng API, `t.Parallel()`), vì race detector chỉ thấy race trên đường code chạy. Thêm job nightly với `-count` lớn để bắt race hiếm. Bổ sung `go vet` (copylocks, lostcancel) và `goleak`. Với integration/load test, build binary `-race` chạy trên staging.

</details>
