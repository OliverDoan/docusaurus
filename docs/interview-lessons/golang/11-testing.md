---
sidebar_position: 11
title: "11. Testing"
---

# 11. Testing

## 1. Package testing và table-driven test

Bài học: [1. Package testing và table-driven test](../../golang/11-testing/1_testing-co-ban.md)

**1. `t.Error` và `t.Fatal` khác nhau thế nào? Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đánh dấu test fail và ghi message. `t.Error` cho test chạy tiếp — hữu ích khi kiểm tra nhiều điều kiện độc lập để thấy hết lỗi trong một lần. `t.Fatal` gọi `runtime.Goexit` dừng test ngay — dùng khi các bước sau vô nghĩa hoặc sẽ panic (setup lỗi, `err != nil` mà cần dùng kết quả). `t.Fatal` chỉ dừng goroutine hiện tại, nên không gọi nó từ goroutine tự tạo trong test.

</details>

**2. Table-driven test là gì và có lợi ích gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Là cách khai báo các trường hợp test thành một slice (hoặc map) struct gồm đầu vào và kết quả mong đợi, rồi lặp qua và chạy mỗi case trong `t.Run`. Lợi ích: thêm case chỉ cần thêm một dòng; logic kiểm tra viết một lần; tên case hiện trong output; chạy riêng được từng case bằng `-run`; dễ thấy case nào còn thiếu (biên, lỗi, rỗng). Kết hợp `t.Parallel()` để chạy song song.

</details>

**3. Vì sao code test cũ có dòng `tt := tt` trước `t.Run`? Go 1.22 thay đổi gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Trước Go 1.22, biến vòng lặp `for _, tt := range` là một biến duy nhất được gán lại mỗi lần lặp. Subtest gọi `t.Parallel()` bị tạm dừng tới khi vòng lặp kết thúc, nên closure của mọi subtest đều thấy giá trị cuối cùng của `tt` — chỉ case cuối được kiểm tra. `tt := tt` tạo bản sao riêng cho mỗi lần lặp. Từ Go 1.22 (module khai báo `go 1.22` trở lên), mỗi lần lặp tạo biến mới nên không cần dòng này.

</details>

**4. `t.Cleanup` khác `defer` thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`defer` chạy khi hàm chứa nó return; `t.Cleanup` chạy khi **test** (cùng mọi subtest của nó) kết thúc. Nhờ vậy (1) hàm helper có thể tự đăng ký dọn dẹp tài nguyên nó tạo mà người gọi không cần nhớ; (2) với subtest song song, `defer` trong test cha chạy quá sớm (trước khi subtest chạy) còn `Cleanup` thì chờ đúng lúc. Các `Cleanup` chạy theo thứ tự LIFO. `t.TempDir` và `t.Context` cũng dựa trên cơ chế này.

</details>

**5. Package `foo` và `foo_test` trong cùng thư mục khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

File test khai báo `package foo` là white-box: truy cập được mọi thứ unexported, dùng để test chi tiết nội bộ. File khai báo `package foo_test` là package riêng (black-box): phải import `foo` và chỉ thấy API public — test đúng như người dùng sử dụng, giúp phát hiện API khó dùng, và tránh import cycle (ví dụ khi test cần import một package khác vốn đã import `foo`). Go cho phép cả hai cùng nằm trong một thư mục.

</details>

**6. `TestMain` dùng để làm gì? Có nhược điểm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`func TestMain(m *testing.M)` thay thế điểm vào mặc định của binary test trong package: chạy setup một lần (khởi động DB/container, nạp cấu hình), gọi `m.Run()` để chạy mọi test, rồi teardown. Nhược điểm: tạo trạng thái dùng chung cho cả package nên test dễ phụ thuộc nhau; chạy kể cả khi chỉ cần một test nhỏ (`-run`); khó đọc vì setup ẩn khỏi từng test. Khi chỉ một vài test cần tài nguyên, dùng helper + `t.Cleanup` (có thể kết hợp `sync.Once`) thay thế.

</details>

---

## 2. Mock và Stub

Bài học: [2. Mock và Stub](../../golang/11-testing/2_mock-stub.md)

**1. Phân biệt stub, fake, spy và mock.**

<details className="qa">
<summary>Xem đáp án</summary>

Stub trả về dữ liệu định sẵn, không có logic. Fake là hiện thực chạy được nhưng đơn giản hoá (store bằng map thay DB, SMTP in ra log). Spy là stub có ghi lại các lời gọi để test kiểm tra sau. Mock được lập trình sẵn kỳ vọng về lời gọi (method nào, tham số gì, bao nhiêu lần, thứ tự) và tự làm test fail nếu không đúng. Stub/fake phục vụ kiểm tra trạng thái/kết quả; mock phục vụ kiểm tra hành vi tương tác.

</details>

**2. Làm sao thiết kế code Go để dễ mock?**

<details className="qa">
<summary>Xem đáp án</summary>

Phụ thuộc vào interface thay vì kiểu cụ thể; khai báo interface **ở package dùng** và chỉ gồm các method thực sự cần (interface nhỏ); nhận phụ thuộc qua constructor (dependency injection thủ công) thay vì tạo bên trong hoặc dùng biến global; với phụ thuộc đơn lẻ như thời gian hay sinh ID, truyền kiểu hàm (`now func() time.Time`). Nguyên tắc "accept interfaces, return structs". Nhờ interface ngầm định, kiểu của thư viện bên thứ ba tự động thoả interface mà không cần sửa.

</details>

**3. Vì sao cộng đồng Go hay khuyên dùng fake viết tay thay cho mock framework?**

<details className="qa">
<summary>Xem đáp án</summary>

Interface Go thường nhỏ nên viết fake chỉ vài dòng, không cần sinh code hay thư viện. Test với fake kiểm tra kết quả cuối cùng nên ít phụ thuộc vào chi tiết hiện thực — refactor không làm vỡ test. Fake dùng lại được cho nhiều test và dễ đọc hơn chuỗi `EXPECT()`. Mock framework vẫn hữu ích khi lời gọi chính là điều cần kiểm tra (gửi email, gọi API thanh toán) hoặc interface lớn không tách được.

</details>

**4. gomock hiện nay nên dùng package nào? `ctrl.Finish()` còn cần không?**

<details className="qa">
<summary>Xem đáp án</summary>

`github.com/golang/mock` đã ngừng bảo trì (archived); dùng bản fork được Uber duy trì `go.uber.org/mock` với công cụ `mockgen` tương ứng. Với Go 1.14+ và gomock đủ mới, `gomock.NewController(t)` tự đăng ký kiểm tra kỳ vọng qua `t.Cleanup`, nên không cần `defer ctrl.Finish()`.

</details>

**5. Mock repository khi test service có đủ không? Test tầng repository thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không đủ: mock chỉ chứng minh service gọi repository đúng, không chứng minh câu SQL, mapping cột, ràng buộc, transaction hoạt động đúng. Tầng repository nên có integration test với database thật — dùng `testcontainers-go` khởi động PostgreSQL/MySQL trong Docker ngay trong test, chạy migration, rồi test các method. Để tiết kiệm thời gian, chia sẻ container cho cả package và cô lập dữ liệu giữa các test; bỏ qua bằng `testing.Short()` khi chạy nhanh ở máy dev.

</details>

**6. Test một hàm phụ thuộc `time.Now()` thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không gọi `time.Now()` trực tiếp trong logic mà inject nó: field `now func() time.Time` (production gán `time.Now`), hoặc interface `Clock`. Test truyền hàm trả về thời điểm cố định để kết quả xác định. Với code dùng goroutine, timer và `time.Sleep`, Go 1.25 có `testing/synctest` cung cấp đồng hồ ảo trong một "bong bóng" test, giúp test các timeout dài mà chạy tức thì.

</details>

---

## 3. Test HTTP với httptest

Bài học: [3. Test HTTP với httptest](../../golang/11-testing/3_httptest.md)

**1. `httptest.NewRecorder` và `httptest.NewServer` khác nhau thế nào? Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`NewRecorder` tạo một `ResponseWriter` ghi lại kết quả trong bộ nhớ; ta gọi `handler.ServeHTTP(rec, req)` trực tiếp — không có mạng, rất nhanh, dùng để unit test handler, router, middleware. `NewServer` khởi động một HTTP server thật trên loopback với cổng ngẫu nhiên; dùng khi cần một endpoint mạng thật — chủ yếu để test **HTTP client** (giả lập API bên ngoài), hoặc test tích hợp toàn bộ ứng dụng qua mạng.

</details>

**2. Làm sao test code gọi API bên thứ ba mà không gọi API thật?**

<details className="qa">
<summary>Xem đáp án</summary>

Thiết kế client nhận base URL và `*http.Client` qua constructor (không hard-code URL hay dùng `http.DefaultClient`). Trong test dựng `httptest.NewServer` với handler trả về dữ liệu giả cho từng kịch bản (200, 4xx, 5xx, JSON hỏng, chậm để test timeout), rồi truyền `srv.URL` và `srv.Client()` cho client. Handler giả cũng kiểm tra request client gửi (path, query, header, body). Cách khác là thay `http.Client.Transport` bằng một `RoundTripper` giả — không cần mở socket.

</details>

**3. Test một handler dùng `r.PathValue("id")` mà không qua router thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Từ Go 1.22, `*http.Request` có `SetPathValue(name, value)`. Trong test tạo request bằng `httptest.NewRequest`, gọi `req.SetPathValue("id", "1")`, rồi gọi hàm handler trực tiếp. Nếu không gán, `PathValue` trả chuỗi rỗng. Tuy vậy, test qua `mux.ServeHTTP` với pattern thật thường tốt hơn vì kiểm tra luôn việc đăng ký route và method.

</details>

**4. Vì sao không nên so sánh JSON response bằng chuỗi?**

<details className="qa">
<summary>Xem đáp án</summary>

Chuỗi JSON phụ thuộc thứ tự key, khoảng trắng, ký tự `\n` cuối do `json.Encoder` thêm, cách escape — những thứ không ảnh hưởng ngữ nghĩa. Thêm một trường mới vào response cũng làm vỡ test so chuỗi. Nên decode response vào struct (hoặc `map[string]any`) và so sánh giá trị bằng `==`, `cmp.Diff`, hoặc dùng `assert.JSONEq` của testify. Decode cũng đồng thời kiểm tra response là JSON hợp lệ.

</details>

**5. Test một middleware xác thực thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Tạo `next` là một `http.HandlerFunc` giả ghi lại việc được gọi (và có thể đọc context để kiểm tra dữ liệu middleware gắn vào). Bọc `next` bằng middleware, rồi chạy table-driven test qua các trường hợp: thiếu header, header sai, header đúng. Với mỗi case kiểm tra status code từ `NewRecorder` và việc `next` có được gọi hay không — middleware chặn đúng thì `next` không bao giờ được gọi.

</details>

**6. Trong handler của `httptest.NewServer`, gọi `t.Fatal` có được không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không nên. Handler chạy trong goroutine do server tạo, không phải goroutine của test; `t.Fatal` gọi `runtime.Goexit` chỉ dừng goroutine đó (handler), test chính vẫn chạy và có thể treo chờ response. Dùng `t.Errorf` để ghi lỗi rồi trả response bình thường, hoặc gửi thông tin về goroutine test qua channel.

</details>

---

## 4. Benchmark, Fuzzing và Coverage

Bài học: [4. Benchmark, Fuzzing và Coverage](../../golang/11-testing/4_benchmark-coverage.md)

**1. Viết và đọc kết quả benchmark trong Go thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Viết `func BenchmarkXxx(b *testing.B)` trong file `_test.go`, thân là `for b.Loop() { ... }` (Go 1.24) hoặc `for i := 0; i < b.N; i++` (cũ). Chạy `go test -run='^$' -bench=. -benchmem`. Kết quả gồm số vòng lặp, `ns/op` (thời gian mỗi lần gọi), `B/op` (byte cấp phát trên heap) và `allocs/op` (số lần cấp phát). Giảm `allocs/op` thường là cách hiệu quả nhất để tăng tốc vì giảm áp lực GC. So sánh hai phiên bản bằng `-count=10` + `benchstat`.

</details>

**2. `b.Loop()` khác vòng `b.N` thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Với `b.N`, framework gọi hàm benchmark nhiều lần với `b.N` tăng dần, nên setup trước vòng lặp chạy lại nhiều lần và phải `b.ResetTimer()` để loại khỏi phép đo; compiler còn có thể loại bỏ lời gọi nếu kết quả không được dùng, phải gán vào biến `sink`. `b.Loop()` (Go 1.24) chỉ gọi hàm benchmark một lần cho mỗi lần đếm, tự quản lý timer nên setup và cleanup ngoài vòng lặp không bị tính, và giữ cho các lời gọi trong vòng lặp không bị tối ưu mất.

</details>

**3. Fuzzing là gì? Viết fuzz test trong Go như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Fuzzing là kỹ thuật tự động sinh và đột biến đầu vào, dựa trên coverage để khám phá nhánh code mới, nhằm tìm input gây panic hoặc vi phạm tính chất. Trong Go (1.18+): viết `func FuzzXxx(f *testing.F)`, thêm seed bằng `f.Add(...)`, gọi `f.Fuzz(func(t *testing.T, args...) {...})` và kiểm tra các tính chất (round-trip, không panic, kết quả hợp lệ). `go test` thường chỉ chạy seed; `go test -fuzz=FuzzXxx -fuzztime=30s` mới thực sự fuzz. Input gây lỗi được lưu vào `testdata/fuzz/FuzzXxx/` — commit lại để thành test hồi quy.

</details>

**4. Coverage 100% có nghĩa là code không còn bug không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. Coverage chỉ cho biết dòng nào **đã được thực thi** khi chạy test, không cho biết kết quả có được kiểm tra hay không, cũng không bao phủ mọi tổ hợp giá trị (một dòng `a / b` chạy với `b = 2` vẫn được tính là đã cover dù `b = 0` gây panic). Coverage hữu ích để tìm vùng code chưa được test; chất lượng test phụ thuộc vào assertion, case biên, và các kỹ thuật bổ sung như fuzzing, race detector.

</details>

**5. Làm sao đo coverage khi chạy integration test với binary thật?**

<details className="qa">
<summary>Xem đáp án</summary>

Từ Go 1.20: build binary bằng `go build -cover`, chạy với biến môi trường `GOCOVERDIR=<thư mục>`, thực hiện integration/e2e test, rồi tắt chương trình bình thường để dữ liệu được ghi ra. Dùng `go tool covdata percent -i=<dir>` để xem phần trăm, `go tool covdata textfmt` để chuyển sang định dạng profile và mở bằng `go tool cover -html`. Có thể gộp nhiều lần chạy bằng `go tool covdata merge`.

</details>

**6. Example test có tác dụng gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Hàm `ExampleXxx` vừa là tài liệu hiển thị trên pkg.go.dev/godoc cạnh hàm/kiểu tương ứng, vừa là test: `go test` chạy nó và so khớp stdout với comment `// Output:` (hoặc `// Unordered output:`). Nhờ đó ví dụ trong tài liệu luôn biên dịch được và cho đúng kết quả — không bị lỗi thời khi API thay đổi. Example không có comment Output chỉ được biên dịch chứ không chạy.

</details>
