---
sidebar_position: 7
title: "7. Xử lý lỗi"
---

# 7. Xử lý lỗi

## 1. Error interface

Bài học: [1. Error interface](../../golang/07-xu-ly-loi/1_error-interface.md)

**1. Vì sao Go không dùng exception? Ưu nhược điểm của cách "lỗi là giá trị"?**

<details className="qa">
<summary>Xem đáp án</summary>

Go muốn luồng lỗi hiện rõ trong code: lỗi nằm trong chữ ký hàm, người gọi buộc phải nhìn thấy và quyết định tại chỗ, không có bước nhảy vô hình. Ưu: dễ đọc luồng điều khiển, chi phí thấp (không tạo stack trace), lỗi được xử lý như dữ liệu (lưu, so sánh, gộp, wrap). Nhược: code dài vì `if err != nil` lặp lại; có thể vô tình bỏ qua lỗi (cần linter `errcheck`); không có stack trace sẵn — phải thêm ngữ cảnh khi wrap.

</details>

**2. `error` trong Go là gì? Làm sao tạo một kiểu lỗi riêng?**

<details className="qa">
<summary>Xem đáp án</summary>

`error` là interface dựng sẵn với một method `Error() string`. Tạo lỗi riêng bằng cách định nghĩa struct và hiện thực `Error()` — thường với pointer receiver — rồi trả `&MyError{...}`. Người gọi lấy lại dữ liệu bằng `errors.As(err, &target)`. Hàm luôn khai báo kiểu trả về là `error` (không phải `*MyError`) và `return nil` tường minh khi không có lỗi để tránh bẫy nil interface.

</details>

**3. Sentinel error là gì? Cho ví dụ trong thư viện chuẩn.**

<details className="qa">
<summary>Xem đáp án</summary>

Là biến lỗi khai báo sẵn ở cấp package để so sánh danh tính: `io.EOF`, `sql.ErrNoRows`, `fs.ErrNotExist`, `http.ErrServerClosed`, `context.Canceled`. Kiểm tra bằng `errors.Is(err, io.EOF)` (không dùng `==` vì lỗi có thể đã bị wrap). Nhược điểm: sentinel là một phần API public, tạo phụ thuộc giữa package; không mang thêm dữ liệu.

</details>

**4. `errors.New("x") == errors.New("x")` trả về gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`false`. `errors.New` trả con trỏ tới một struct mới mỗi lần gọi, nên hai lỗi cùng thông điệp vẫn là hai giá trị khác nhau. Đây cũng là lý do sentinel error phải được khai báo một lần thành biến package và mọi nơi trả về **cùng biến đó**.

</details>

**5. Vì sao thông điệp lỗi trong Go nên viết thường và không có dấu chấm cuối?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì lỗi thường được nối thêm ngữ cảnh khi truyền lên: `lưu đơn: thanh toán: timeout`. Chữ hoa hoặc dấu chấm ở giữa chuỗi trông sai. Đây là quy ước trong Go Code Review Comments, được `staticcheck` ST1005 kiểm tra. Ngoại lệ: danh từ riêng, từ viết tắt (`HTTP`, `JSON`).

</details>

**6. Khi nào dùng sentinel error, khi nào dùng custom error type?**

<details className="qa">
<summary>Xem đáp án</summary>

Sentinel khi trạng thái lỗi đơn giản, người gọi chỉ cần biết "có phải lỗi X không": không tìm thấy, hết dữ liệu, đã đóng. Custom error type khi người gọi cần dữ liệu đi kèm: trường không hợp lệ, mã lỗi nghiệp vụ, HTTP status, có retry được không. Nếu chỉ cần thông điệp cho người đọc log, dùng `fmt.Errorf` là đủ — không phải lỗi nào cũng cần kiểu riêng.

</details>

---

## 2. Wrap và Unwrap lỗi

Bài học: [2. Wrap và Unwrap lỗi](../../golang/07-xu-ly-loi/2_wrap-unwrap.md)

**1. `%w` khác `%v` trong `fmt.Errorf` thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai cho cùng thông điệp. `%w` tạo lỗi có method `Unwrap()` trỏ về lỗi gốc, nên `errors.Is`/`errors.As` tìm được lỗi gốc trong chuỗi. `%v` chỉ chèn chuỗi, lỗi gốc bị mất — dùng khi cố ý không muốn người gọi phụ thuộc vào lỗi bên dưới. Từ Go 1.20, một `fmt.Errorf` có thể chứa nhiều `%w`.

</details>

**2. `errors.Is` và `errors.As` khác nhau thế nào? Vì sao không dùng `==` và type assertion?**

<details className="qa">
<summary>Xem đáp án</summary>

`errors.Is(err, target)` kiểm tra trong chuỗi có lỗi **bằng** target (so sánh giá trị hoặc qua method `Is`) — dùng cho sentinel. `errors.As(err, &target)` tìm lỗi đầu tiên **có kiểu** gán được vào target và gán nó — dùng cho custom error type để lấy dữ liệu. `==` và `err.(*T)` chỉ xét lớp ngoài cùng, nên thất bại ngay khi lỗi đã bị wrap.

</details>

**3. `errors.Join` dùng khi nào? `errors.Unwrap` trên lỗi Join trả gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng để gộp nhiều lỗi thành một: validate nhiều trường, đóng nhiều tài nguyên, chạy nhiều tác vụ song song. `errors.Join` bỏ qua `nil` và trả `nil` nếu mọi lỗi đều nil; thông điệp nối bằng xuống dòng. Lỗi Join hiện thực `Unwrap() []error`, nên `errors.Unwrap` (chỉ gọi `Unwrap() error`) trả `nil`; nhưng `errors.Is`/`As` vẫn duyệt cả cây.

</details>

**4. Khi nào không nên wrap lỗi bằng `%w`?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi lỗi gốc là chi tiết hiện thực mà bạn không muốn cam kết với người gọi — ví dụ lỗi driver DB đi ra khỏi package public. Wrap biến lỗi gốc thành một phần API: người gọi có thể `errors.Is(err, sql.ErrNoRows)`, và khi bạn đổi hiện thực thì code họ hỏng âm thầm. Khi đó hãy dịch sang lỗi domain (`ErrUserNotFound`) hoặc dùng `%v`. Ngoài ra không trả `err.Error()` nội bộ về client HTTP.

</details>

**5. "Handle errors once" nghĩa là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi lỗi chỉ được xử lý một lần — hoặc log, hoặc trả lên, hoặc retry/fallback — không vừa log vừa trả về. Nếu tầng nào cũng log, một sự cố in ra nhiều dòng, log nhiễu và khó đếm. Tầng dưới chỉ thêm ngữ cảnh bằng `%w` và return; tầng biên (HTTP handler, worker loop, `main`) log một lần với đầy đủ chuỗi ngữ cảnh.

</details>

**6. Làm sao để custom error type của bạn hoạt động với `errors.Is`?**

<details className="qa">
<summary>Xem đáp án</summary>

Nếu nó bọc lỗi khác, hiện thực `Unwrap() error` (hoặc `Unwrap() []error` nếu bọc nhiều) để `Is` duyệt xuống được. Nếu muốn so sánh theo nội dung thay vì danh tính con trỏ (ví dụ mọi `*StatusError` có cùng `Code` là bằng nhau), hiện thực method `Is(target error) bool`. Tương tự có thể hiện thực `As(any) bool` để tuỳ biến `errors.As`, nhưng hiếm khi cần.

</details>

---

## 3. Panic và Recover

Bài học: [3. Panic và Recover](../../golang/07-xu-ly-loi/3_panic-recover.md)

**1. Khi nào nên dùng panic thay vì trả error?**

<details className="qa">
<summary>Xem đáp án</summary>

Chỉ khi gặp lỗi lập trình hoặc tình huống không thể phục hồi: bất biến bị vi phạm, trạng thái "không thể xảy ra", khởi tạo giá trị cố định sai (`regexp.MustCompile`), thiếu cấu hình bắt buộc lúc khởi động. Mọi lỗi có thể dự đoán (input sai, I/O, mạng, không tìm thấy bản ghi) phải trả `error`. Thư viện không nên để panic thoát ra API public.

</details>

**2. Vì sao `recover()` chỉ hoạt động trong defer? Đoạn `defer recover()` có tác dụng không?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi panic, hàm bình thường không còn chạy tiếp — chỉ các hàm defer được thực thi trong lúc unwinding, nên đó là nơi duy nhất có thể chặn panic. Quy tắc cụ thể: `recover` phải được gọi **trực tiếp bởi hàm được defer**. `defer recover()` không hoạt động vì `recover` khi đó chính là hàm được defer (được runtime gọi), không phải được gọi bởi một hàm defer. Gọi `recover` trong hàm helper mà helper lại được gọi từ closure defer cũng không hoạt động; phải `defer helper()` trực tiếp.

</details>

**3. Một goroutine con panic, `main` có `defer recover()` đúng cách. Chương trình có sập không?**

<details className="qa">
<summary>Xem đáp án</summary>

Có. Panic chỉ unwind stack của **goroutine đang panic**; nếu goroutine đó không tự recover thì runtime kết thúc toàn bộ process — recover ở goroutine khác không có tác dụng. Vì thế mọi goroutine (đặc biệt goroutine sinh ra từ HTTP handler, worker) phải tự có `defer func() { if r := recover(); r != nil { ... } }()`, thường gói vào helper như `SafeGo`.

</details>

**4. `net/http` có tự recover panic trong handler không? Vậy sao vẫn cần middleware recover?**

<details className="qa">
<summary>Xem đáp án</summary>

Có, server recover panic của từng handler, in stack trace bằng logger của server và đóng kết nối — client nhận lỗi kết nối chứ không phải response 500. Middleware recover cho phép trả 500 đúng chuẩn, log có cấu trúc (slog, request ID, stack), gửi cảnh báo. Middleware cũng không cứu được panic ở goroutine do handler tự tạo. Lưu ý chừa `http.ErrAbortHandler` cho `net/http` xử lý.

</details>

**5. Làm sao lấy stack trace khi recover? `GOTRACEBACK` dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong hàm defer sau khi recover, gọi `debug.Stack()` (trả `[]byte`) hoặc `debug.PrintStack()` — stack lúc này vẫn còn khung của nơi panic. `runtime.Stack(buf, true)` lấy stack mọi goroutine. `GOTRACEBACK` điều khiển lượng stack in ra khi chương trình sập: `none`, `single` (mặc định), `all`, `system`, `crash` (tạo core dump để phân tích bằng `dlv core`).

</details>

**6. Những lỗi nào không thể recover?**

<details className="qa">
<summary>Xem đáp án</summary>

Các **fatal error** của runtime không đi qua cơ chế panic nên `recover` không bắt được: ghi/đọc map đồng thời (`concurrent map writes`), deadlock toàn bộ (`all goroutines are asleep`), stack overflow, hết bộ nhớ. Ngoài ra `os.Exit` và `log.Fatal` thoát ngay, không chạy defer. Cách duy nhất là sửa bug — dùng `go test -race` để phát hiện truy cập map đồng thời sớm.

</details>
