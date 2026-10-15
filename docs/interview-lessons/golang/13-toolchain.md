---
sidebar_position: 13
title: "13. Toolchain"
---

# 13. Toolchain

## 1. Các lệnh go cốt lõi

Bài học: [1. Các lệnh go cốt lõi](../../golang/13-toolchain/1_lenh-go.md)

**1. Khác nhau giữa `go run`, `go build` và `go install`?**

<details className="qa">
<summary>Xem đáp án</summary>

- `go run`: biên dịch vào thư mục tạm và chạy ngay, không để lại binary — dùng khi phát triển.
- `go build`: biên dịch và ghi binary ở thư mục hiện tại (hoặc theo `-o`); với package không phải `main` chỉ kiểm tra biên dịch.
- `go install`: biên dịch và đặt binary vào `$GOBIN`/`$GOPATH/bin`. Dạng `go install pkg@version` cài tool theo phiên bản mà không đụng tới `go.mod` của dự án hiện tại.

Cả ba đều dùng chung build cache nên lần sau nhanh hơn.

</details>

**2. Làm sao để một file chỉ được biên dịch trên Linux? Có mấy cách?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai cách:
1. Đặt tên file theo mẫu `*_linux.go` — ràng buộc ngầm theo GOOS.
2. Thêm dòng `//go:build linux` ở đầu file, trước `package`, kèm dòng trống phía sau.

Cách 2 linh hoạt hơn vì kết hợp được biểu thức (`linux && amd64`, `!windows`, `unix`) và tag tuỳ biến. Hai cách có thể dùng cùng nhau — khi đó cả hai điều kiện phải đúng.

</details>

**3. `go generate` có chạy khi `go build` không? Nên dùng thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. `go generate` là bước riêng, chỉ chạy khi gọi tường minh. Quy trình thông thường: thêm `//go:generate ...` cạnh code nguồn, chạy `go generate ./...`, **commit** file sinh ra (có dòng `// Code generated ... DO NOT EDIT.`). Nhờ vậy người dùng package chỉ cần `go build`, không cần cài tool sinh code. Trong CI có thể chạy lại `go generate` rồi `git diff --exit-code` để phát hiện ai quên sinh lại code.

</details>

**4. Directive `tool` trong `go.mod` (Go 1.24) giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó khoá phiên bản các công cụ phát triển (stringer, mockgen, sqlc...) ngay trong `go.mod`, thay cho mẹo file `tools.go` với blank import và tag `tools`. Thêm bằng `go get -tool pkg`, chạy bằng `go tool <tên>`, nâng cấp bằng `go get tool`. Mọi người và CI dùng cùng phiên bản tool, không cần cài trước, kết quả sinh code nhất quán.

</details>

**5. Muốn chạy test tích hợp tách khỏi unit test, bạn làm thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Đặt `//go:build integration` ở đầu file test tích hợp. `go test ./...` mặc định bỏ qua các file đó; chạy chúng bằng `go test -tags=integration ./...`. Cách khác là dùng `testing.Short()` với `go test -short` để bỏ qua test chậm, hoặc kiểm tra biến môi trường rồi gọi `t.Skip`. Build tag có ưu điểm là code test tích hợp (và dependency của nó) hoàn toàn không được biên dịch khi không cần.

</details>

**6. Làm sao biết binary đang chạy trên server được build bằng Go phiên bản nào, từ commit nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Chạy `go version -m ./binary`: in phiên bản Go, module chính, toàn bộ dependency kèm phiên bản và các build setting như `vcs.revision`, `vcs.time`, `vcs.modified`, `GOOS`, `GOARCH`, `CGO_ENABLED`. Bên trong chương trình có thể đọc cùng thông tin bằng `runtime/debug.ReadBuildInfo()` để in ra ở endpoint `/version`.

</details>

---

## 2. Chất lượng code và bảo mật

Bài học: [2. Chất lượng code và bảo mật](../../golang/13-toolchain/2_chat-luong-code.md)

**1. `go vet` khác compiler và khác `staticcheck` thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Compiler chỉ từ chối code sai ngôn ngữ (sai kiểu, import thừa, biến không dùng). `go vet` tìm code **hợp lệ nhưng đáng ngờ** bằng các analyzer có độ chính xác cao (printf, copylocks, lostcancel...), đi kèm toolchain. `staticcheck` là công cụ bên thứ ba với nhiều check hơn hẳn: bug (SA), đơn giản hoá (S), style (ST), code không dùng (U1000), dùng API deprecated. Thường chạy cả hai, hoặc qua `golangci-lint` (mặc định đã gồm `govet` và `staticcheck`).

</details>

**2. `govulncheck` khác gì so với các công cụ quét dependency thông thường?**

<details className="qa">
<summary>Xem đáp án</summary>

Công cụ thông thường so phiên bản module với danh sách CVE: có module là báo. `govulncheck` dùng dữ liệu về **hàm/symbol cụ thể** bị ảnh hưởng trong Go vulnerability database rồi phân tích call graph của chương trình — chỉ báo lỗi khi có đường gọi tới hàm đó, kèm stack minh hoạ. Kết quả ít báo động giả, team tập trung sửa đúng lỗ hổng có thể bị khai thác. Nó còn quét được binary (`-mode=binary`) và bao gồm cả lỗ hổng thư viện chuẩn theo phiên bản Go.

</details>

**3. Bạn đưa linter vào một dự án cũ có hàng nghìn cảnh báo như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không sửa tất cả một lần. Bắt đầu với bộ linter nhỏ có giá trị cao (`govet`, `staticcheck`, `errcheck`), dùng `--new-from-rev=origin/main` để CI chỉ chặn lỗi **mới** trong PR. Sửa dần lỗi cũ theo module, bật thêm linter từng bước. Tắt các rule gây nhiễu với lý do rõ ràng trong cấu hình; dùng `//nolint:tên // lý do` cho ngoại lệ cục bộ.

</details>

**4. Vì sao Go chỉ có một style format và không cho tuỳ chỉnh?**

<details className="qa">
<summary>Xem đáp án</summary>

Triết lý "gofmt's style is no one's favorite, yet gofmt is everyone's favorite": loại bỏ hoàn toàn tranh luận về style, mọi code Go trông giống nhau nên đọc code người khác dễ, diff trong review chỉ chứa thay đổi thật, công cụ có thể sửa code tự động (rewrite, refactor) mà không phá format.

</details>

**5. Analyzer `copylocks` bắt lỗi gì, vì sao quan trọng?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó báo khi giá trị chứa `sync.Mutex`, `sync.RWMutex`, `sync.WaitGroup`, `sync.Once`... bị **copy** — thường do method receiver giá trị, truyền struct theo giá trị, hoặc `range` lấy bản copy. Mutex bị copy là một khoá khác hoàn toàn, nên đoạn "được bảo vệ" thực ra không được bảo vệ, dẫn tới data race. Cách sửa: dùng receiver con trỏ, truyền con trỏ.

</details>

---

## 3. Hiệu năng và debug

Bài học: [3. Hiệu năng và debug](../../golang/13-toolchain/3_hieu-nang-debug.md)

**1. Service Go của bạn bị tăng bộ nhớ liên tục rồi OOM. Bạn điều tra thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

1. Xem số goroutine (`/debug/pprof/goroutine`) — goroutine leak là nguyên nhân rất phổ biến (mỗi goroutine giữ stack và mọi thứ nó tham chiếu).
2. Lấy hai heap profile cách nhau một khoảng thời gian, so sánh `inuse_space` bằng `-diff_base` để thấy chỗ cấp phát mà không giải phóng.
3. Nghi phạm thường gặp: cache/map không giới hạn, slice con giữ mảng gốc lớn, timer/ticker không `Stop`, goroutine chờ channel không bao giờ đóng, `resp.Body` không đóng.
4. Kiểm tra cấu hình `GOMEMLIMIT` để runtime GC kịp thời trong container.

</details>

**2. `flat` và `cum` trong pprof khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`flat` là thời gian (hoặc bộ nhớ) tiêu tốn **trong thân chính hàm đó**. `cum` là tổng của hàm **cộng mọi hàm nó gọi**. `main.main` luôn có `cum` gần 100% nhưng `flat` gần 0. Tối ưu nên nhắm hàm có `flat` lớn, và dùng `cum` để lần theo đường gọi dẫn tới đó.

</details>

**3. Khi nào dùng pprof, khi nào dùng execution trace?**

<details className="qa">
<summary>Xem đáp án</summary>

pprof là **thống kê lấy mẫu** — trả lời "CPU/bộ nhớ tốn ở hàm nào", chi phí thấp, chạy được trên production. Trace ghi **mọi sự kiện theo thời gian** — trả lời "goroutine này đã chờ gì, khi nào, bao lâu", hữu ích cho latency, độ song song kém, tác động của GC và scheduler; dữ liệu lớn nên chỉ thu trong vài giây (hoặc dùng flight recorder).

</details>

**4. PGO hoạt động thế nào và triển khai ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Compiler đọc CPU profile để biết hàm và lời gọi nào nóng, từ đó inline mạnh hơn ở các call site nóng và devirtualize lời gọi interface sang kiểu cụ thể hay gặp nhất. Quy trình: thu CPU profile đại diện từ production, gộp nếu nhiều instance, lưu thành `default.pgo` trong thư mục package `main`, commit; `go build` (mặc định `-pgo=auto`) tự áp dụng. Cập nhật profile định kỳ. Cải thiện thường 2–14%.

</details>

**5. Vì sao không nên mở `net/http/pprof` trên cổng public?**

<details className="qa">
<summary>Xem đáp án</summary>

Endpoint lộ thông tin nội bộ (stack, tên hàm, đường dẫn mã nguồn, dữ liệu trong cmdline) và cho phép bất kỳ ai kích hoạt CPU profile/trace dài, gây tốn tài nguyên — một dạng DoS. Ngoài ra import `net/http/pprof` tự đăng ký vào `http.DefaultServeMux`, nên nếu server API dùng `nil` handler thì pprof lộ ra ngay. Cách đúng: server pprof riêng nghe `localhost`/mạng nội bộ, API dùng mux riêng, có xác thực nếu cần truy cập từ xa.

</details>

**6. Debug một bug concurrency bằng breakpoint có vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Breakpoint dừng goroutine, làm thay đổi thứ tự xen kẽ giữa các goroutine — bug phụ thuộc timing có thể không tái hiện (heisenbug). Nên dùng race detector (`-race`), goroutine dump (`debug=2`), execution trace và log có cấu trúc; Delve vẫn hữu ích để xem trạng thái goroutine khi chương trình đã treo (`dlv attach` rồi `goroutines -t`).

</details>

---

## 4. Build và triển khai

Bài học: [4. Build và triển khai](../../golang/13-toolchain/4_build-deploy.md)

**1. Làm thế nào build binary Go cho Linux ARM64 từ máy Windows?**

<details className="qa">
<summary>Xem đáp án</summary>

Đặt biến môi trường rồi build: `set GOOS=linux`, `set GOARCH=arm64`, `set CGO_ENABLED=0`, `go build -o api ./cmd/api` (PowerShell: `$env:GOOS="linux"`...). Không cần cài thêm gì vì compiler Go hỗ trợ sẵn mọi nền tảng đích. Nếu code dùng cgo thì cần thêm C cross-compiler cho nền tảng đích (hoặc dùng Zig làm `CC`), phức tạp hơn nhiều.

</details>

**2. `CGO_ENABLED=0` ảnh hưởng gì? Khi nào phải bật cgo?**

<details className="qa">
<summary>Xem đáp án</summary>

Tắt cgo khiến binary liên kết tĩnh hoàn toàn: chạy trên `scratch`/distroless/alpine, cross-compile dễ. Các package như `net` và `os/user` dùng hiện thực Go thuần thay vì gọi libc. Phải bật cgo khi dùng thư viện C (SQLite bản cgo, librdkafka, OpenCV...), hoặc cần hành vi resolver/NSS của hệ thống (vd tích hợp LDAP qua NSS). Khi đó image runtime phải có libc tương thích.

</details>

**3. Nhúng version vào binary Go thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Khai báo biến `var version = "dev"` ở package-level, build với `-ldflags "-X main.version=v1.2.3"` (package khác thì dùng import path đầy đủ). Biến phải là `string`, không phải `const`, không khởi tạo bằng lời gọi hàm. Ngoài ra Go tự nhúng build info (phiên bản Go, module, dependency, `vcs.revision`...), đọc bằng `debug.ReadBuildInfo()` hoặc `go version -m`. Trong Docker build thường không có `.git` nên `vcs.*` vắng mặt — vẫn cần `-X`.

</details>

**4. Vì sao nên dùng Dockerfile multi-stage và distroless cho Go?**

<details className="qa">
<summary>Xem đáp án</summary>

Stage build cần toolchain Go (~800 MB) nhưng image chạy chỉ cần binary. Multi-stage giữ image cuối nhỏ (vài MB đến vài chục MB), pull/deploy nhanh, ít package hệ điều hành nên ít CVE và bề mặt tấn công nhỏ; distroless không có shell nên kẻ tấn công khó khai thác hơn. Distroless static còn có sẵn CA cert, tzdata, user `nonroot` — thứ mà `scratch` phải tự thêm.

</details>

**5. `-ldflags "-s -w"` có làm mất stack trace khi panic không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. Runtime Go dùng bảng `pclntab` riêng để ánh xạ địa chỉ sang tên hàm/file/dòng, bảng này không bị `-s -w` xoá. Thứ mất đi là bảng symbol (cho `nm`, công cụ ngoài) và DWARF (cho debugger như Delve, gdb). Vì vậy binary production thường dùng `-s -w`, còn khi cần debug thì build bản riêng.

</details>

**6. `-trimpath` dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Xoá đường dẫn tuyệt đối của máy build khỏi binary, thay bằng module path hoặc import path. Giúp build tái lập (cùng input → cùng binary ở mọi máy), không lộ tên user và cấu trúc thư mục trong stack trace, và giảm nhẹ kích thước. Nên luôn bật cho bản phát hành.

</details>
