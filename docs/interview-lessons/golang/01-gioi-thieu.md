---
sidebar_position: 1
title: "1. Giới thiệu"
---

# 1. Giới thiệu

## 1. Vì sao dùng Go

Bài học: [1. Vì sao dùng Go](../../golang/01-gioi-thieu/1_vi-sao-dung-go.md)

**1. Vì sao Go không có exception mà lại dùng `error` trả về?**

<details className="qa">
<summary>Xem đáp án</summary>

Các tác giả Go cho rằng exception làm **luồng điều khiển bị ẩn**: một dòng code bất kỳ có thể nhảy ra khỏi hàm mà người đọc không thấy. Với `error` là giá trị trả về, mọi chỗ có thể lỗi đều lộ rõ và người viết **buộc phải quyết định** xử lý thế nào (trả lên, bọc thêm ngữ cảnh, bỏ qua có chủ đích). Đánh đổi là code dài hơn. Go vẫn có `panic`/`recover` nhưng chỉ dành cho lỗi lập trình hoặc tình huống không thể phục hồi, không dùng cho luồng nghiệp vụ.

</details>

**2. Goroutine khác thread của hệ điều hành thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Kích thước**: goroutine khởi đầu với stack vài KB (tự giãn khi cần), OS thread thường ~1–8 MB.
- **Lập lịch**: goroutine do **runtime Go** lập lịch (mô hình M:N — nhiều goroutine trên ít thread), chuyển ngữ cảnh rẻ, không cần vào kernel; OS thread do kernel lập lịch.
- **Số lượng**: dễ dàng chạy hàng trăm nghìn goroutine; vài chục nghìn thread đã gây áp lực lớn cho hệ điều hành.
- **Giao tiếp**: goroutine được khuyến khích dùng channel thay vì chia sẻ bộ nhớ có khoá.

</details>

**3. Go có phải ngôn ngữ hướng đối tượng không?**

<details className="qa">
<summary>Xem đáp án</summary>

"Có và không" — đây cũng là câu trả lời trong FAQ chính thức của Go. Go có kiểu dữ liệu với method, đóng gói qua quy ước chữ hoa/chữ thường (exported/unexported), đa hình qua interface. Nhưng Go **không có class và kế thừa**; thay vào đó dùng **composition** (embedding struct) và **interface ngầm định** — một kiểu thoả mãn interface chỉ cần có đủ method, không cần khai báo `implements`. Cách này giảm coupling và tránh cây kế thừa sâu.

</details>

**4. Khi nào bạn không chọn Go cho một dự án?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi bài toán nằm ngoài vùng mạnh của Go: data science/ML (Python có hệ sinh thái vượt trội), ứng dụng UI desktop/mobile, hệ thống không chấp nhận GC pause hoặc cần kiểm soát bộ nhớ chi tiết (Rust/C++), hoặc khi đội đã rất mạnh một stack khác (ví dụ Spring) và dự án là nghiệp vụ enterprise phức tạp — chi phí chuyển đổi lớn hơn lợi ích. Một câu trả lời tốt nên nhấn mạnh việc chọn theo bài toán và năng lực đội.

</details>

**5. Điều gì làm Go biên dịch nhanh?**

<details className="qa">
<summary>Xem đáp án</summary>

- Không có header file và `#include`: mỗi package biên dịch một lần, thông tin export được lưu lại cho package khác dùng.
- **Cấm import vòng** (import cycle) → đồ thị dependency là DAG, biên dịch song song được.
- Import không dùng là lỗi → không kéo thừa dependency.
- Cú pháp đơn giản, parse không cần bảng ký hiệu (symbol table), không có template phức tạp như C++.
- Build cache: package không đổi thì không biên dịch lại.

</details>

**6. Go so với Node.js cho một API server — ưu thế chính là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Node.js chạy JavaScript trên một luồng chính với event loop — rất tốt cho I/O, nhưng tác vụ CPU nặng sẽ chặn toàn bộ request; muốn dùng nhiều nhân phải chạy nhiều process (cluster). Go tự dùng tất cả nhân CPU qua scheduler, mỗi request chạy trong một goroutine với code dạng tuần tự dễ đọc (không cần `async/await`). Thêm vào đó Go có kiểu tĩnh, binary đơn, dùng ít RAM. Node.js có lợi thế dùng chung ngôn ngữ với frontend và hệ sinh thái npm rất lớn.

</details>

---

## 2. Lịch sử Go

Bài học: [2. Lịch sử Go](../../golang/01-gioi-thieu/2_lich-su-go.md)

**1. Cam kết tương thích Go 1 là gì? Có ngoại lệ nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Từ Go 1.0 (2012), đội Go cam kết chương trình viết đúng đặc tả Go 1 sẽ tiếp tục biên dịch và chạy đúng với mọi bản Go 1.x sau đó. Ngoại lệ: vá lỗ hổng bảo mật, hành vi không được đặc tả (thứ tự duyệt map...), bug của đặc tả/compiler, code dùng `unsafe`. Từ Go 1.21, thay đổi ngữ nghĩa (như biến vòng lặp ở 1.22) gắn với dòng `go` trong `go.mod`, và có GODEBUG để bật lại hành vi cũ — nên nâng toolchain không làm hỏng code cũ.

</details>

**2. Go modules giải quyết vấn đề gì của GOPATH?**

<details className="qa">
<summary>Xem đáp án</summary>

GOPATH buộc mọi code nằm trong một cây thư mục và **không có khái niệm phiên bản** — `go get` luôn lấy commit mới nhất, hai dự án không thể dùng hai phiên bản khác nhau của cùng thư viện, build không tái lập được. Modules (1.11, mặc định từ 1.16) cho phép đặt dự án ở bất kỳ đâu, khai báo phiên bản trong `go.mod`, kiểm tra toàn vẹn bằng `go.sum`, tải qua proxy có checksum database, và chọn phiên bản bằng Minimal Version Selection để build tái lập.

</details>

**3. Thay đổi về biến vòng lặp trong Go 1.22 là gì và vì sao quan trọng?**

<details className="qa">
<summary>Xem đáp án</summary>

Trước 1.22, biến khai báo trong `for` (như `i`, `v` trong `for i, v := range s`) là **một biến dùng chung** cho mọi lần lặp. Closure hoặc goroutine bắt giữ biến này (hoặc lấy địa chỉ `&v`) thường thấy giá trị cuối cùng — bug kinh điển, phải viết `v := v` để chữa. Từ 1.22, **mỗi lần lặp tạo biến mới**, bug biến mất. Thay đổi chỉ áp dụng cho module khai báo `go 1.22` trở lên trong `go.mod`.

</details>

**4. Vì sao generics đến tận Go 1.18 mới có?**

<details className="qa">
<summary>Xem đáp án</summary>

Các tác giả Go muốn generics nhưng chưa tìm được thiết kế giữ được sự đơn giản, tốc độ biên dịch và hiệu năng runtime. Nhiều bản đề xuất (bao gồm "contracts") bị loại sau hơn 10 năm thảo luận. Thiết kế cuối dùng type parameter với constraint là interface (có thể chứa type set như `~int | ~float64`), cài đặt bằng kết hợp GC shape stenciling và dictionary để cân bằng giữa kích thước binary và hiệu năng.

</details>

**5. Chu kỳ phát hành và chính sách hỗ trợ của Go thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi 6 tháng một bản lớn (khoảng tháng 2 và tháng 8). Bản vá ra thường xuyên để sửa bug và bảo mật. Mỗi bản lớn được hỗ trợ đến khi có hai bản lớn mới hơn, nên tại một thời điểm luôn có hai bản được hỗ trợ. Production nên chạy một trong hai bản này.

</details>

---

## 3. Cài đặt và Hello World

Bài học: [3. Cài đặt và Hello World](../../golang/01-gioi-thieu/3_cai-dat-moi-truong.md)

**1. GOPATH và GOROOT khác nhau thế nào? Hiện nay GOPATH còn dùng làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**GOROOT** là nơi cài toolchain Go (compiler, thư viện chuẩn) — gần như không cần đặt tay. **GOPATH** trước đây là workspace bắt buộc chứa toàn bộ code; từ khi có module (mặc định từ 1.16), code dự án đặt ở đâu cũng được, GOPATH (mặc định `~/go`) chỉ còn dùng để chứa **module cache** (`pkg/mod`) và **binary** cài bằng `go install` (`bin`).

</details>

**2. Điều kiện để một chương trình Go chạy được là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Phải có package tên `main` chứa hàm `func main()` không tham số, không giá trị trả về. Tham số dòng lệnh lấy qua `os.Args` (hoặc package `flag`), mã thoát đặt bằng `os.Exit`. Trước `main`, Go chạy khởi tạo biến cấp package và các hàm `init()` của mọi package được import (theo thứ tự phụ thuộc).

</details>

**3. `go run` và `go build` khác nhau thế nào? `go install` thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`go run` biên dịch vào thư mục tạm, chạy ngay rồi bỏ binary — dùng khi phát triển. `go build` tạo binary trong thư mục hiện tại (hoặc theo `-o`) — dùng để đóng gói. `go install` build và đặt binary vào `GOBIN` (mặc định `~/go/bin`), dùng để cài công cụ; dạng `go install pkg@version` cài từ module bên ngoài mà không đụng tới `go.mod` của dự án hiện tại.

</details>

**4. `go mod tidy` làm gì? Khi nào cần chạy?**

<details className="qa">
<summary>Xem đáp án</summary>

Quét toàn bộ import trong code (kể cả test), thêm vào `go.mod` các module còn thiếu, xoá module không còn dùng, và cập nhật `go.sum`. Nên chạy sau khi thêm/xoá import, trước khi commit; nhiều đội cho CI kiểm tra `go mod tidy` không làm thay đổi file (`git diff --exit-code go.mod go.sum`).

</details>

**5. Làm sao build binary Go cho Linux từ máy macOS? Có lưu ý gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Đặt biến `GOOS` và `GOARCH`: `GOOS=linux GOARCH=amd64 go build -o app .`. Go hỗ trợ cross-compile sẵn, không cần toolchain phụ. Lưu ý: nếu code dùng **cgo** (gọi C) thì cross-compile cần C compiler cho nền tảng đích; thường đặt `CGO_ENABLED=0` để có binary tĩnh thuần Go, chạy được trên image `scratch`/`distroless`.

</details>
