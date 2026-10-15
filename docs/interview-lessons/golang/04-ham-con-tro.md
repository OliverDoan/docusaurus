---
sidebar_position: 4
title: "4. Hàm và con trỏ"
---

# 4. Hàm và con trỏ

## 1. Hàm

Bài học: [1. Hàm](../../golang/04-ham-con-tro/1_ham.md)

**1. Vì sao Go dùng nhiều giá trị trả về thay vì exception để báo lỗi?**

<details className="qa">
<summary>Xem đáp án</summary>

Lỗi là giá trị bình thường, xuất hiện ngay trong chữ ký hàm, nên người gọi thấy rõ hàm nào có thể thất bại và phải xử lý tại chỗ. Luồng điều khiển tường minh, không có "nhảy" ngầm qua nhiều tầng như exception. Đổi lại code dài hơn vì nhiều `if err != nil`. `panic` vẫn tồn tại nhưng chỉ dành cho lỗi lập trình hoặc tình huống không thể phục hồi.

</details>

**2. Đoạn code sau in ra gì?**

```go
func main() {
	for i := range 3 {
		defer fmt.Println(i)
	}
}
```

<details className="qa">
<summary>Xem đáp án</summary>

In `2`, `1`, `0` (mỗi số một dòng). Các defer được đẩy vào ngăn xếp và chạy theo LIFO khi `main` kết thúc. Giá trị `i` được đánh giá ngay lúc gặp `defer` nên mỗi lời gọi giữ đúng giá trị của lần lặp đó.

</details>

**3. Tham số của hàm bị defer được đánh giá khi nào? Làm sao để defer dùng giá trị mới nhất của biến?**

<details className="qa">
<summary>Xem đáp án</summary>

Được đánh giá ngay tại câu lệnh `defer`. `defer fmt.Println(x)` sẽ in giá trị `x` tại thời điểm đó dù sau này `x` đổi. Muốn dùng giá trị lúc hàm kết thúc thì defer một closure: `defer func() { fmt.Println(x) }()` — closure đọc biến `x` khi chạy. Lưu ý receiver của method cũng được đánh giá ngay: `defer obj.Method()` chốt `obj` lúc gặp defer.

</details>

**4. Named return value có tác dụng gì? Vì sao nên tránh naked return?**

<details className="qa">
<summary>Xem đáp án</summary>

Named return tài liệu hoá ý nghĩa giá trị trả về (`(lat, lng float64, err error)`) và cho phép `defer` đọc/sửa kết quả — ví dụ bọc thêm ngữ cảnh cho lỗi hoặc chuyển `panic` thành `error` qua `recover`. Naked return (`return` trống) làm hàm dài khó đọc vì không thấy đang trả về gì, và dễ bị bẫy shadowing khi `:=` trong block con tạo biến mới cùng tên. Chỉ nên dùng naked return trong hàm rất ngắn.

</details>

**5. Variadic function hoạt động thế nào? Truyền slice vào variadic có copy không?**

<details className="qa">
<summary>Xem đáp án</summary>

Tham số cuối `...T` nhận 0..n đối số; bên trong hàm là `[]T` (nil nếu không truyền gì). Truyền slice có sẵn bằng `f(s...)` — khi đó Go **không** copy, hàm nhận chính slice `s`, sửa phần tử sẽ ảnh hưởng caller. Gọi `f(a, b, c)` thì Go tạo slice mới.

</details>

**6. Vì sao không nên `defer f.Close()` trong vòng lặp?**

<details className="qa">
<summary>Xem đáp án</summary>

`defer` chạy khi hàm bao ngoài kết thúc, không phải cuối mỗi vòng lặp. Mở nhiều file trong vòng lặp sẽ giữ tất cả mở tới cuối hàm → có thể cạn file descriptor hoặc giữ khoá/kết nối quá lâu. Cách sửa: tách thân vòng lặp ra một hàm riêng có `defer`, hoặc dùng hàm ẩn danh gọi ngay trong vòng lặp, hoặc đóng tường minh.

</details>

---

## 2. Hàm ẩn danh và Closure

Bài học: [2. Hàm ẩn danh và Closure](../../golang/04-ham-con-tro/2_anonymous-closure.md)

**1. Closure là gì? Closure trong Go bắt biến theo giá trị hay tham chiếu?**

<details className="qa">
<summary>Xem đáp án</summary>

Closure là hàm (thường là hàm ẩn danh) tham chiếu tới biến ở phạm vi bên ngoài nơi nó được định nghĩa, và giữ các biến đó sống kể cả khi hàm bao ngoài đã return. Go bắt **theo tham chiếu**: closure dùng chung biến với phạm vi ngoài, nên thấy mọi thay đổi và có thể sửa biến đó. Muốn chụp giá trị tại thời điểm tạo thì copy sang biến mới hoặc truyền qua tham số.

</details>

**2. Đoạn code sau in ra gì với Go 1.21 và Go 1.22?**

```go
for i := 0; i < 3; i++ {
	defer func() { fmt.Print(i) }()
}
```

<details className="qa">
<summary>Xem đáp án</summary>

- Go 1.21 (hoặc `go.mod` khai báo `go 1.21` trở về trước): in `333` — chỉ có một biến `i`, khi các defer chạy thì `i` đã bằng 3.
- Go 1.22+: in `210` — mỗi lần lặp có biến `i` riêng, các defer chạy theo LIFO.

Hành vi được quyết định bởi dòng `go` trong `go.mod` của module chứa code, không phải phiên bản toolchain.

</details>

**3. Vì sao biến cục bộ được closure bắt vẫn tồn tại sau khi hàm return?**

<details className="qa">
<summary>Xem đáp án</summary>

Trình biên dịch dùng escape analysis: thấy biến được tham chiếu bởi closure có thể sống lâu hơn hàm, nó cấp phát biến trên **heap** thay vì stack. GC sẽ thu hồi biến khi không còn closure nào tham chiếu tới. Có thể xem quyết định này qua `go build -gcflags=-m` (thông báo "moved to heap").

</details>

**4. Cho ví dụ ứng dụng closure trong một backend Go.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Middleware HTTP**: `func logging(next http.Handler) http.Handler` trả về handler bọc `next`.
- **Functional options**: `WithTimeout(d)` trả về `func(*Server)` bắt `d`.
- **Goroutine**: `go func() { ... }()` dùng biến của hàm bao ngoài.
- **Retry/backoff**: hàm `retry(n int, fn func() error)` nhận closure chứa lời gọi cần thử lại.
- **Iterator Go 1.23**: hàm trả về `iter.Seq[T]` là closure giữ trạng thái duyệt.

</details>

**5. Closure có an toàn khi gọi từ nhiều goroutine không?**

<details className="qa">
<summary>Xem đáp án</summary>

Bản thân closure không có cơ chế đồng bộ. Nếu nhiều goroutine cùng gọi một closure đọc/ghi biến được bắt (như counter), đó là **data race**. Phải bảo vệ biến bằng `sync.Mutex`, dùng `sync/atomic`, hoặc để mỗi goroutine có closure/biến riêng. Phát hiện bằng `go test -race` hoặc `go run -race`.

</details>

---

## 3. Con trỏ

Bài học: [3. Con trỏ](../../golang/04-ham-con-tro/3_con-tro.md)

**1. Go truyền tham số theo giá trị hay tham chiếu?**

<details className="qa">
<summary>Xem đáp án</summary>

Luôn theo giá trị — mọi đối số được copy vào tham số. Với con trỏ, thứ được copy là địa chỉ, nên hàm sửa được giá trị qua `*p`. Slice, map, channel "trông như" tham chiếu vì giá trị của chúng chứa con trỏ tới dữ liệu bên dưới: hàm sửa phần tử thì caller thấy, nhưng gán lại cả biến (hay `append` làm đổi header slice) thì caller không thấy.

</details>

**2. Khi nào nên truyền con trỏ `*T` thay vì giá trị `T`?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi hàm/method cần sửa giá trị; khi struct lớn và copy tốn kém; khi struct chứa thứ không được copy (`sync.Mutex`, `strings.Builder`); khi cần biểu diễn "không có giá trị" bằng `nil`. Dùng `T` khi kiểu nhỏ, bất biến hoặc muốn đảm bảo hàm không sửa bản gốc. Con trỏ có thể khiến biến escape lên heap, nên không mặc định "con trỏ = nhanh hơn".

</details>

**3. Hàm nhận slice và gọi `append` — vì sao caller không thấy phần tử mới?**

<details className="qa">
<summary>Xem đáp án</summary>

Hàm nhận bản copy của slice header. `append` trả về header mới (len tăng, có thể trỏ tới mảng nền mới) và chỉ gán vào biến cục bộ. Header của caller vẫn giữ len cũ (và có thể trỏ mảng cũ). Cách sửa: trả về slice mới và để caller gán lại (`s = f(s)`), hoặc nhận `*[]T` và gán `*s = append(*s, x)`.

</details>

**4. Trả về con trỏ tới biến cục bộ trong Go có an toàn không?**

<details className="qa">
<summary>Xem đáp án</summary>

An toàn. Trình biên dịch dùng escape analysis, thấy địa chỉ biến thoát ra ngoài hàm thì cấp phát biến trên heap thay vì stack; GC thu hồi khi không còn ai tham chiếu. Khác với C, nơi trả con trỏ tới biến stack tạo dangling pointer. Xem quyết định bằng `go build -gcflags=-m`.

</details>

**5. `new(T)` và `&T{}` khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Với struct, cả hai đều cấp phát giá trị zero và trả về `*T`; `&T{...}` còn cho phép khởi tạo trường ngay nên phổ biến hơn. `new` dùng được với mọi kiểu kể cả kiểu không có composite literal (`new(int)`). Từ Go 1.26, `new` còn nhận biểu thức: `new(30)` trả về `*int` trỏ tới 30 — thay cho helper `ptr` tự viết.

</details>

**6. Vì sao Go không cho phép pointer arithmetic?**

<details className="qa">
<summary>Xem đáp án</summary>

Để đảm bảo an toàn bộ nhớ: không đọc/ghi ra ngoài vùng được cấp phát (buffer overflow), không tạo con trỏ trỏ vào giữa object làm GC khó theo dõi. Duyệt dữ liệu dùng slice/index có bounds check. Trường hợp thật sự cần (tối ưu cấp thấp, cgo) có package `unsafe`, chấp nhận mất đảm bảo an toàn.

</details>

---

## 4. Quản lý bộ nhớ và Garbage Collection

Bài học: [4. Quản lý bộ nhớ và Garbage Collection](../../golang/04-ham-con-tro/4_quan-ly-bo-nho.md)

**1. Làm sao biết một biến trong Go nằm trên stack hay heap?**

<details className="qa">
<summary>Xem đáp án</summary>

Lập trình viên không chọn — trình biên dịch quyết định bằng escape analysis. Biến mà địa chỉ có thể thoát khỏi hàm (trả về con trỏ, gán vào nơi sống lâu hơn, bị closure sống lâu bắt, truyền qua interface mà compiler không phân tích được, quá lớn hoặc kích thước không xác định) sẽ lên heap; còn lại có thể nằm trên stack. Xem bằng `go build -gcflags=-m` (thông báo "moved to heap", "escapes to heap"). `new` hay `&T{}` không đồng nghĩa với heap.

</details>

**2. Trình bày cách GC của Go hoạt động.**

<details className="qa">
<summary>Xem đáp án</summary>

GC của Go là concurrent tri-color mark-and-sweep, không phân thế hệ, không dời object. Pha mark bắt đầu từ các root (biến toàn cục, stack goroutine), dùng ba màu trắng/xám/đen để duyệt đồ thị tham chiếu, chạy song song với chương trình; write barrier đảm bảo không bỏ sót tham chiếu mới tạo trong lúc mark. Chỉ có hai pha stop-the-world rất ngắn (bật write barrier, kết thúc mark). Object còn trắng bị thu hồi trong pha sweep, thực hiện dần khi cấp phát. Goroutine cấp phát nhanh bị bắt phụ mark (mark assist). Từ Go 1.26, hiện thực mặc định là Green Tea GC quét theo span để tăng cache locality.

</details>

**3. `GOGC` và `GOMEMLIMIT` khác nhau thế nào? Khi chạy trong Kubernetes nên cấu hình ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`GOGC` (mặc định 100) quy định heap được tăng bao nhiêu phần trăm so với live heap trước khi GC chạy — tỉ lệ tương đối, không biết giới hạn RAM. `GOMEMLIMIT` (Go 1.19) là giới hạn mềm tuyệt đối cho bộ nhớ runtime quản lý; gần chạm thì GC chạy dày hơn. Trong Kubernetes nên đặt `GOMEMLIMIT` khoảng 80–90% memory limit của container (chừa chỗ cho bộ nhớ ngoài heap); giữ `GOGC` mặc định, hoặc `GOGC=off` nếu muốn tận dụng tối đa RAM và service là tiến trình duy nhất.

</details>

**4. Go có GC thì có bị memory leak không? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

Có — leak trong Go là giữ tham chiếu ngoài ý muốn. Phổ biến nhất: goroutine leak (goroutine bị chặn mãi ở gửi/nhận channel hoặc chờ I/O không timeout, thường do thiếu `ctx.Done()` hoặc channel unbuffered không ai đọc); sub-slice/substring nhỏ giữ mảng nền lớn; map dùng làm cache không bao giờ xoá; `time.Ticker` không `Stop`; quên đóng `resp.Body`. Điều tra bằng `pprof` (heap, goroutine), `runtime.NumGoroutine()`, `goleak` trong test.

</details>

**5. `sync.Pool` dùng để làm gì và có những lưu ý gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`sync.Pool` là cache các object tạm thời để tái sử dụng giữa nhiều goroutine, giảm số lần cấp phát và áp lực GC (ví dụ `bytes.Buffer` trong `fmt`, encoder JSON). Lưu ý: object trong pool có thể bị GC xoá bất kỳ lúc nào nên không dùng để lưu trạng thái; phải reset object trước khi `Put`; nên lưu con trỏ để tránh cấp phát khi chuyển sang `any`; tránh giữ object quá lớn; chỉ dùng khi profile chứng minh có lợi.

</details>

**6. Vì sao service Go cấp phát nhiều lại có độ trễ p99 cao dù GC là concurrent?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì (1) GC chiếm khoảng 25% CPU trong pha mark, cạnh tranh với code xử lý request; (2) goroutine cấp phát trong lúc mark bị bắt làm mark assist tỉ lệ với lượng cấp phát, nên chính request đang cấp phát nhiều bị chậm; (3) tốc độ cấp phát cao khiến chu kỳ GC lặp lại dày. Cách giảm: bớt cấp phát ở hot path (cấp sẵn cap, tái dùng buffer, `sync.Pool`), giảm con trỏ trong dữ liệu sống lâu, tăng `GOGC` hoặc dùng `GOMEMLIMIT` nếu còn dư RAM.

</details>
