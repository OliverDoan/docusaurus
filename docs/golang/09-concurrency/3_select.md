---
sidebar_position: 3
title: "3. Select"
---

# Select

Một goroutine thường phải chờ **nhiều thứ cùng lúc**: dữ liệu từ channel A, tin nhắn từ channel B, tín hiệu huỷ, hay đơn giản là hết giờ. `select` giống `switch` nhưng dành cho channel — nó chờ cho tới khi **một trong các thao tác** gửi/nhận có thể thực hiện rồi chạy nhánh đó. Bài này đi qua cú pháp `select`, `default` để gửi/nhận không chặn, timeout với `time.After`, vòng lặp for-select, kỹ thuật tắt case bằng nil channel và chạy việc định kỳ với `time.Ticker`.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Nhiều case cùng sẵn sàng → chọn ngẫu nhiên** (đều nhau), không theo thứ tự viết; đừng dựa vào thứ tự case để ưu tiên.
- ⭐ **For-select + `ctx.Done()`** là khung xương của mọi goroutine chạy lâu: luôn có một case để thoát.
- **`default`** chạy ngay khi không case nào sẵn sàng → gửi/nhận không chặn; đặt `default` trong vòng lặp không có gì khác là **busy loop** đốt CPU.
- **`time.After(d)`** cho timeout đơn lẻ; trong vòng lặp nóng dùng `time.NewTimer` hoặc context để tránh tạo timer mới mỗi vòng.
- **Case với nil channel không bao giờ được chọn** — gán channel thành `nil` để tắt case động.
- **`break` trong `select` chỉ thoát `select`**, không thoát vòng `for` — dùng `return` hoặc label.

:::

---

## Mục lục

- [Vì sao cần select?](#vì-sao-cần-select)
- [Cú pháp và cách select chọn case](#cú-pháp-và-cách-select-chọn-case)
- [Default: gửi nhận không chặn](#default-gửi-nhận-không-chặn)
- [Timeout với time.After](#timeout-với-timeafter)
- [Vòng lặp for-select](#vòng-lặp-for-select)
- [Tắt case bằng nil channel](#tắt-case-bằng-nil-channel)
- [Việc định kỳ với Ticker](#việc-định-kỳ-với-ticker)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao cần select?

**Vấn đề:** Nhận tuần tự từ hai channel thì bị **kẹt ở channel đầu**, dù channel thứ hai đã có dữ liệu:

```go
func main() {
	email := make(chan string)
	sms := make(chan string)

	go func() { time.Sleep(2 * time.Second); email <- "email đến" }()
	go func() { time.Sleep(100 * time.Millisecond); sms <- "sms đến" }()

	fmt.Println(<-email) // chờ 2 giây...
	fmt.Println(<-sms)   // sms đã tới từ lâu nhưng phải chờ email trước
}
```

Và không có cách nào nói "chờ email, nhưng **tối đa 1 giây** thôi".

**Giải pháp:** `select` chờ **đồng thời** trên mọi case, cái nào tới trước xử lý trước:

```go
for range 2 {
	select {
	case msg := <-email:
		fmt.Println(msg)
	case msg := <-sms:
		fmt.Println(msg) // in trước, sau ~100ms
	case <-time.After(time.Second):
		fmt.Println("hết giờ chờ")
	}
}
```

:::tip[Dùng thực tế]

- **Timeout** cho thao tác chờ kết quả từ goroutine khác.
- **Huỷ** — mọi worker lắng nghe `ctx.Done()` song song với việc nhận job.
- **Event loop** — một goroutine xử lý tuần tự sự kiện từ nhiều nguồn (lệnh, tick định kỳ, tín hiệu tắt máy).
- **Gửi không chặn** — đẩy metric/log vào buffer, đầy thì bỏ qua thay vì làm chậm request.

:::

:::tip[Ví dụ đời thường]

`select` giống **nhân viên tổng đài** có 3 đường dây: thay vì nhấc từng máy chờ lần lượt, chị ngồi chờ **máy nào reo trước thì nghe máy đó**. `default` là khi chị liếc qua thấy không máy nào reo thì đi làm việc khác ngay. `time.After` là **giờ tan ca**: không ai gọi tới 17h thì về.

:::

---

## Cú pháp và cách select chọn case

```go
select {
case v := <-ch1:        // nhận, gán giá trị
	use(v)
case v, ok := <-ch2:    // nhận với comma-ok
	if !ok { /* ch2 đã đóng */ }
case ch3 <- x:          // gửi
	fmt.Println("đã gửi")
case <-done:            // nhận và bỏ giá trị
	return
default:                // tuỳ chọn: chạy khi không case nào sẵn sàng
}
```

Quy tắc thực thi:

1. **Tính mọi biểu thức** channel và giá trị gửi của các case (một lần, theo thứ tự viết) — kể cả các case không được chọn.
2. Nếu **có case sẵn sàng**: chọn **ngẫu nhiên đều** một case trong số đó, thực hiện thao tác và chạy thân case.
3. Nếu **không case nào sẵn sàng**: có `default` thì chạy `default`; không có thì **chặn** tới khi một case sẵn sàng.
4. `select {}` (rỗng) chặn **vĩnh viễn**.

Vì sao chọn ngẫu nhiên? Để tránh **starvation** (bỏ đói): nếu luôn ưu tiên case đầu, channel bận rộn ở case đầu sẽ khiến các case sau không bao giờ được phục vụ.

```go
a := make(chan int, 100)
b := make(chan int, 100)
for i := range 100 {
	a <- i
	b <- i
}
countA, countB := 0, 0
for range 100 {
	select {
	case <-a:
		countA++
	case <-b:
		countB++
	}
}
fmt.Println(countA, countB) // khoảng 50 50, mỗi lần chạy khác nhau
```

:::warning

Điều kiện 1 dễ gây bất ngờ: trong `case ch <- compute():`, hàm `compute()` **luôn được gọi** mỗi lần vào `select`, kể cả khi case đó không được chọn. Tính trước giá trị nếu `compute` đắt hoặc có side effect.

:::

### Ưu tiên một case

Nếu thật sự cần ưu tiên (ví dụ kiểm tra huỷ trước khi nhận job), dùng hai `select` lồng:

```go
for {
	// Ưu tiên 1: đã bị huỷ thì dừng ngay
	select {
	case <-ctx.Done():
		return
	default:
	}
	// Sau đó mới chờ cả hai
	select {
	case <-ctx.Done():
		return
	case job := <-jobs:
		handle(job)
	}
}
```

---

## Default: gửi nhận không chặn

### Nhận không chặn

```go
select {
case msg := <-inbox:
	fmt.Println("có tin:", msg)
default:
	fmt.Println("không có tin, làm việc khác")
}
```

### Gửi không chặn — bỏ qua khi đầy

```go
type Metrics struct {
	events chan Event
}

// Không bao giờ làm chậm request chỉ vì hệ thống metrics bị nghẽn
func (m *Metrics) Record(e Event) {
	select {
	case m.events <- e:
	default:
		droppedEvents.Add(1) // buffer đầy → bỏ, đếm số lượng bị bỏ
	}
}
```

### Thử lấy khoá kiểu "try"

Channel buffered 1 làm khoá có thể "thử":

```go
sem := make(chan struct{}, 1)

func tryRun() bool {
	select {
	case sem <- struct{}{}:
		defer func() { <-sem }()
		doExclusiveWork()
		return true
	default:
		return false // đang có người chạy, bỏ qua lần này
	}
}
```

:::warning

**Busy loop** — `default` trong vòng `for` mà không có gì chặn:

```go
for {
	select {
	case v := <-ch:
		handle(v)
	default:
		// không làm gì → vòng lặp quay liên tục, ăn 100% một core
	}
}
```

Gần như luôn sai. Bỏ `default` để `select` chặn chờ, hoặc thêm case `ctx.Done()`/ticker.

:::

---

## Timeout với time.After

`time.After(d)` trả về `<-chan time.Time` nhận được một giá trị sau khoảng `d`:

```go
func fetchWithTimeout(url string) (string, error) {
	result := make(chan string, 1) // buffer 1 để goroutine không leak khi timeout
	go func() {
		result <- fetch(url)
	}()

	select {
	case r := <-result:
		return r, nil
	case <-time.After(2 * time.Second):
		return "", errors.New("hết thời gian chờ")
	}
}
```

### Timeout cho cả vòng lặp và timeout mỗi lần

```go
// Timeout cho TOÀN BỘ quá trình: tạo timer một lần, bên ngoài vòng lặp
deadline := time.After(5 * time.Second)
for {
	select {
	case msg := <-messages:
		process(msg)
	case <-deadline:
		fmt.Println("hết 5 giây tổng cộng")
		return
	}
}
```

```go
// Timeout cho MỖI LẦN chờ: "im lặng quá 1 giây thì dừng"
for {
	select {
	case msg := <-messages:
		process(msg)
	case <-time.After(time.Second): // mỗi vòng tạo timer mới
		fmt.Println("1 giây không có tin")
		return
	}
}
```

:::warning

Với vòng lặp chạy rất nhiều lần, `time.After` trong case tạo **một timer mới mỗi vòng**. Trước **Go 1.23**, timer chưa hết hạn không được GC thu hồi cho tới khi nó kích hoạt → tốn bộ nhớ đáng kể (timer 1 phút × triệu vòng). Từ Go 1.23, timer không còn được tham chiếu được GC thu hồi ngay cả khi chưa `Stop`. Dù vậy, trong vòng lặp nóng nên dùng **một** timer và `Reset`:

```go
timer := time.NewTimer(time.Second)
defer timer.Stop()
for {
	select {
	case msg := <-messages:
		process(msg)
		timer.Reset(time.Second) // Go 1.23+: Reset an toàn, không cần rút channel trước
	case <-timer.C:
		return
	}
}
```

:::

Trong code thật, timeout thường đi qua **context**: `ctx, cancel := context.WithTimeout(ctx, 2*time.Second)` rồi `case <-ctx.Done():` — timeout tự lan xuống mọi hàm con (xem bài Context).

---

## Vòng lặp for-select

Khung chuẩn cho goroutine chạy lâu (worker, consumer, event loop):

```go
func worker(ctx context.Context, jobs <-chan Job, results chan<- Result) {
	for {
		select {
		case <-ctx.Done():
			return // luôn có đường thoát
		case job, ok := <-jobs:
			if !ok {
				return // không còn job
			}
			r := process(job)
			select { // gửi kết quả nhưng vẫn tôn trọng huỷ
			case results <- r:
			case <-ctx.Done():
				return
			}
		}
	}
}
```

Chú ý `select` lồng khi **gửi** kết quả: nếu chỉ viết `results <- r` mà bên nhận đã bỏ đi, worker sẽ kẹt mãi (leak) dù ctx đã huỷ.

### break không thoát for

```go
for {
	select {
	case v, ok := <-ch:
		if !ok {
			break // ⚠ chỉ thoát select, vòng for vẫn chạy tiếp!
		}
		use(v)
	}
}
```

Cách sửa: dùng `return` (tách thành hàm), hoặc **label**:

```go
loop:
	for {
		select {
		case v, ok := <-ch:
			if !ok {
				break loop // thoát hẳn vòng for
			}
			use(v)
		case <-ctx.Done():
			break loop
		}
	}
	fmt.Println("đã thoát vòng lặp")
```

---

## Tắt case bằng nil channel

Nhận/gửi trên nil channel chặn vĩnh viễn, nên trong `select` case đó **coi như không tồn tại**. Gán `nil` để bật/tắt case khi chạy.

### Tắt nguồn đã đóng

```go
func mergeTwo(a, b <-chan int) []int {
	var out []int
	for a != nil || b != nil {
		select {
		case v, ok := <-a:
			if !ok {
				a = nil // a đóng → không chọn case này nữa
				continue
			}
			out = append(out, v)
		case v, ok := <-b:
			if !ok {
				b = nil
				continue
			}
			out = append(out, v)
		}
	}
	return out
}
```

### Chỉ bật case gửi khi có dữ liệu

Một goroutine nhận sự kiện liên tục, gom lại, và chỉ bật case gửi khi đang có hàng chờ:

```go
func buffer(in <-chan Event, out chan<- Event) {
	var queue []Event
	for {
		var sendCh chan<- Event // nil → case gửi bị tắt
		var next Event
		if len(queue) > 0 {
			sendCh = out // có hàng chờ → bật case gửi
			next = queue[0]
		}

		select {
		case e, ok := <-in:
			if !ok {
				return
			}
			queue = append(queue, e)
		case sendCh <- next:
			queue = queue[1:]
		}
	}
}
```

Không có kỹ thuật nil channel, bạn phải tách thành hai `select` với nhiều nhánh `if` phức tạp.

---

## Việc định kỳ với Ticker

`time.Ticker` gửi thời gian hiện tại vào channel `C` sau mỗi chu kỳ:

```go
func reportStats(ctx context.Context) {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop() // giải phóng ticker khi goroutine thoát

	for {
		select {
		case <-ctx.Done():
			return
		case t := <-ticker.C:
			slog.Info("thống kê", "time", t, "goroutines", runtime.NumGoroutine())
		}
	}
}
```

Đặc điểm:

- Nếu bên nhận **chậm** hơn chu kỳ, ticker **bỏ bớt tick** (channel chỉ giữ tối đa 1 giá trị) thay vì dồn đống.
- `ticker.Reset(d)` đổi chu kỳ; `ticker.Stop()` dừng (không đóng channel `C`).
- `time.Tick(d)` là cách viết gọn trả về channel; trước Go 1.23 nó **leak** vì không Stop được, nên chỉ dùng ở `main` hoặc goroutine sống suốt chương trình. Từ Go 1.23 ticker không còn tham chiếu được GC thu hồi, `time.Tick` an toàn hơn — nhưng `NewTicker` + `defer Stop()` vẫn là thói quen tốt.

### Ticker và Timer

| | `time.Timer` | `time.Ticker` |
|---|---|---|
| Kích hoạt | **Một lần** sau `d` | **Lặp lại** mỗi `d` |
| Tạo | `time.NewTimer(d)`, `time.After(d)` | `time.NewTicker(d)`, `time.Tick(d)` |
| Dùng cho | Timeout, trì hoãn | Heartbeat, polling, flush định kỳ |
| Hàm gọi lại | `time.AfterFunc(d, f)` chạy `f` trong goroutine riêng | — |

### Ví dụ: gom batch theo kích thước hoặc thời gian

Mẫu rất hay dùng khi ghi log/metric vào DB: flush khi đủ 100 bản ghi **hoặc** mỗi giây, cái nào tới trước:

```go
func batcher(ctx context.Context, in <-chan Record, flush func([]Record)) {
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	batch := make([]Record, 0, 100)
	doFlush := func() {
		if len(batch) > 0 {
			flush(batch)
			batch = make([]Record, 0, 100) // slice mới, không tái dùng mảng đã giao cho flush
		}
	}

	for {
		select {
		case <-ctx.Done():
			doFlush() // flush nốt trước khi thoát
			return
		case r, ok := <-in:
			if !ok {
				doFlush()
				return
			}
			batch = append(batch, r)
			if len(batch) >= 100 {
				doFlush()
			}
		case <-ticker.C:
			doFlush()
		}
	}
}
```

---

## Câu hỏi phỏng vấn

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
