---
sidebar_position: 8
title: "8. Tổ chức code"
---

# 8. Tổ chức code

## 1. Module và dependency

Bài học: [1. Module và dependency](../../golang/08-to-chuc-code/1_modules.md)

**1. GOPATH và Go module khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

GOPATH là workspace toàn cục: mọi code (của bạn lẫn thư viện) nằm trong `$GOPATH/src`, mỗi thư viện chỉ có một bản, không có khái niệm phiên bản nên build không lặp lại được. Module (Go 1.11, mặc định từ 1.16) để mỗi dự án tự khai báo phụ thuộc kèm phiên bản trong `go.mod`, xác minh bằng `go.sum`, đặt ở đâu trên ổ đĩa cũng được; thư viện được cache theo từng phiên bản trong `$GOPATH/pkg/mod`, nhiều dự án dùng nhiều phiên bản song song.

</details>

**2. `go.sum` có phải lock file không? Có nên commit không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không hẳn. Phiên bản thực sự được dùng do `go.mod` và thuật toán MVS quyết định — vì `go.mod` đã ghi phiên bản cụ thể nên build đã lặp lại được. `go.sum` chứa hash của nội dung và `go.mod` từng phiên bản module, dùng để **xác minh** thứ tải về đúng là thứ mong đợi. Phải commit `go.sum` để CI và đồng nghiệp được bảo vệ khỏi việc module bị thay đổi nội dung (tấn công chuỗi cung ứng).

</details>

**3. Minimal Version Selection hoạt động thế nào? Khác npm/Maven ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi module khai báo phiên bản **tối thiểu** nó cần. Go duyệt toàn bộ đồ thị và với mỗi module chọn **bản lớn nhất trong các bản tối thiểu được yêu cầu** — không chọn bản mới nhất đang có. Vì thế kết quả chỉ phụ thuộc vào các file `go.mod`, không phụ thuộc thời điểm build, không cần lock file và không cần SAT solver. npm với range `^1.2.0` có thể lấy bản mới nhất lúc cài (nên cần lock file); Maven chọn "nearest wins" theo độ sâu cây, có thể hạ phiên bản ngoài ý muốn.

</details>

**4. Vì sao thư viện lên v2 phải đổi import path thành `/v2`?**

<details className="qa">
<summary>Xem đáp án</summary>

Do import compatibility rule: cùng import path thì phải tương thích ngược. Major version mới phá vỡ tương thích nên phải là một path khác (`github.com/x/lib/v2`). Lợi ích: một chương trình có thể dùng cùng lúc v1 và v2 (ví dụ hai thư viện phụ thuộc hai major khác nhau), di chuyển dần được; MVS không bao giờ tự đẩy bạn từ v1 sang v2. v0 và v1 không cần hậu tố.

</details>

**5. Khi nào dùng `replace`, khi nào dùng `go.work`?**

<details className="qa">
<summary>Xem đáp án</summary>

`replace` ghi vào `go.mod`, chỉ có tác dụng ở module chính, phù hợp khi cố ý dùng fork hoặc bản vá trong thời gian dài và muốn commit điều đó. `go.work` (Go 1.18+) là file riêng, thường không commit, dùng khi phát triển song song nhiều module trên máy local — tránh lỡ commit `replace => ../thu-muc` làm CI vỡ. Tắt tạm workspace bằng `GOWORK=off`.

</details>

**6. Làm sao dùng module trong repo private của công ty?**

<details className="qa">
<summary>Xem đáp án</summary>

Đặt `GOPRIVATE` (vd `gitlab.cong-ty.vn/*`) để Go bỏ qua proxy công khai và checksum database cho các module đó, tải trực tiếp qua git. Cấu hình git xác thực (SSH key hoặc token, thường kèm `url.insteadOf` hoặc `.netrc`). Trong CI, truyền token qua biến môi trường. Tổ chức lớn có thể dựng proxy nội bộ (Athens, Artifactory) và trỏ `GOPROXY` vào đó.

</details>

---

## 2. Package

Bài học: [2. Package](../../golang/08-to-chuc-code/2_packages.md)

**1. Go kiểm soát truy cập (public/private) như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Bằng chữ cái đầu của định danh: chữ hoa là exported (package khác dùng được), chữ thường là unexported (chỉ trong package). Áp dụng đồng nhất cho hàm, kiểu, biến, hằng, method và field struct. Ranh giới là **package**, không phải type — các file và type trong cùng package thấy hết nhau. Ngoài ra có `internal/` để giới hạn ở cấp cây thư mục.

</details>

**2. Tại sao Go cấm import vòng? Gặp thì xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Cấm để đồ thị phụ thuộc là DAG: compile nhanh và song song được, thứ tự khởi tạo package xác định rõ, và buộc thiết kế có tầng lớp rõ ràng. Xử lý: tách kiểu/logic dùng chung ra package thứ ba; đảo phụ thuộc bằng interface đặt ở phía dùng (consumer); hoặc gộp hai package nếu chúng thực sự không tách rời.

</details>

**3. Thư mục `internal` hoạt động thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Package có path chứa phần tử `internal` chỉ được import bởi code nằm trong cây thư mục có gốc là cha của `internal`. Ví dụ `a/b/internal/c` chỉ import được từ `a/b/...`. Quy tắc do compiler (go command) bắt buộc, không chỉ là quy ước. Dùng để giữ quyền thay đổi API nội bộ mà không lo phá vỡ người dùng bên ngoài.

</details>

**4. Blank import `_` dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Để import một package chỉ vì tác dụng phụ của việc khởi tạo nó — các biến cấp package và hàm `init()` — mà không dùng định danh nào. Ví dụ phổ biến: đăng ký driver database (`_ "github.com/jackc/pgx/v5/stdlib"`), decoder ảnh (`_ "image/png"`), hoặc `_ "net/http/pprof"` để gắn endpoint profiling. Nếu không có `_`, import không dùng sẽ là lỗi biên dịch.

</details>

**5. Thứ tự chạy của `init()` và vì sao nên hạn chế dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

Package phụ thuộc được khởi tạo trước; trong mỗi package, biến cấp package khởi tạo trước, sau đó các `init()` chạy theo thứ tự file và thứ tự trong file; cuối cùng là `main()`. Nên hạn chế vì `init()` không trả lỗi được, chạy ngầm cả khi test, tạo trạng thái toàn cục khó kiểm soát và phụ thuộc vào tên file. Chỉ nên dùng cho việc đăng ký đơn giản; còn lại khởi tạo tường minh.

</details>

**6. `cmd/`, `internal/`, `pkg/` có phải chuẩn bắt buộc không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. Chỉ `internal/` có ý nghĩa với compiler; `cmd/` và `pkg/` là quy ước cộng đồng. Repo `golang-standards/project-layout` không phải của Go team. Hướng dẫn chính thức (go.dev/doc/modules/layout) khuyên bắt đầu đơn giản, dùng `cmd/` khi có nhiều binary và `internal/` cho code không muốn lộ ra. Dự án nhỏ để phẳng là hoàn toàn ổn.

</details>
