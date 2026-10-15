---
sidebar_position: 0
title: "Giới thiệu"
---

# Lộ trình Go

Lộ trình này bám theo [roadmap.sh/golang](https://roadmap.sh/golang): đi từ cú pháp cơ bản, kiểu tổng hợp (slice, map, struct), hàm và con trỏ, method/interface, generics, xử lý lỗi, tổ chức code bằng module — rồi tới phần làm nên tên tuổi của Go là **concurrency** (goroutine, channel, context), thư viện chuẩn, testing, hệ sinh thái (web, gRPC, database, CLI), toolchain và các chủ đề nâng cao. Mục tiêu là người đã biết một ngôn ngữ khác có thể viết được service Go đúng idiom, có test và chạy được trên production.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Go = đơn giản + biên dịch nhanh + concurrency sẵn trong ngôn ngữ** — ít từ khoá, không kế thừa class, build ra một file binary tĩnh.
- ⭐ **Lỗi là giá trị** — hàm trả về `error` cùng kết quả, kiểm tra bằng `if err != nil`; `panic` chỉ dành cho lỗi không thể phục hồi.
- **Composition thay vì inheritance** — struct embedding và interface ngầm định (không cần `implements`).
- **Lộ trình gồm 14 nhóm** — giới thiệu → cú pháp → kiểu tổng hợp → hàm/con trỏ → method/interface → generics → lỗi → module → concurrency → thư viện chuẩn → testing → hệ sinh thái → toolchain → nâng cao.
- **Phiên bản tham chiếu**: Go 1.22+ (biến vòng lặp mới mỗi lần lặp, `for range` trên số nguyên, router `net/http` có method và wildcard).

:::

---

## Go là gì?

**Go** (hay Golang) là ngôn ngữ lập trình do Robert Griesemer, Rob Pike và Ken Thompson thiết kế tại Google từ năm 2007, công bố mã nguồn mở năm 2009 và ra bản 1.0 năm 2012. Go sinh ra để giải quyết nỗi đau của Google lúc đó: codebase C++ khổng lồ biên dịch mất hàng chục phút, quản lý dependency rối, và viết code chạy song song trên máy nhiều nhân quá khó.

Những đặc điểm chính:

- **Kiểu tĩnh, biên dịch ra mã máy** — chạy nhanh gần C, nhưng biên dịch chỉ vài giây.
- **Garbage collector** — không phải tự giải phóng bộ nhớ như C/C++.
- **Goroutine và channel** — chạy hàng trăm nghìn tác vụ đồng thời với chi phí rất nhỏ.
- **Thư viện chuẩn mạnh** — có sẵn HTTP server, JSON, crypto, testing, không cần framework vẫn viết được service.
- **Một cách viết duy nhất** — `gofmt` định dạng code thống nhất, ít "phong cách riêng" giữa các đội.

:::tip[Ví dụ đời thường]

Java hay C++ giống một **bộ dao đa năng** có hàng chục lưỡi: làm được mọi thứ nhưng mỗi người dùng một kiểu, người mới nhìn vào dễ rối. Go giống **con dao bếp tốt**: ít chức năng hơn, nhưng ai cầm cũng dùng giống nhau, và với 90% việc trong bếp backend thì nó là thứ nhanh và gọn nhất.

:::

## Go được dùng ở đâu?

- **Hạ tầng cloud** — Docker, Kubernetes, Terraform, Prometheus, etcd đều viết bằng Go.
- **Microservice và API backend** — Uber, Grab, Shopee, Tiki, Twitch dùng Go cho các service cần throughput cao.
- **Công cụ dòng lệnh (CLI)** — `gh` (GitHub CLI), Hugo, k9s: một file binary, chạy mọi hệ điều hành.
- **Networking và proxy** — Caddy, Traefik, các gateway xử lý nhiều kết nối đồng thời.

## Lộ trình học

| # | Nhóm | Nội dung chính |
|---|------|----------------|
| 1 | Giới thiệu | Vì sao dùng Go, lịch sử, cài đặt môi trường, Hello World, lệnh `go` |
| 2 | Cú pháp cơ bản | Biến, hằng, `iota`, kiểu dữ liệu, chuyển đổi kiểu, điều kiện, vòng lặp |
| 3 | Kiểu tổng hợp | Array, slice, map, struct, string và rune |
| 4 | Hàm và con trỏ | Hàm, closure, con trỏ, quản lý bộ nhớ và GC |
| 5 | Method và Interface | Value/pointer receiver, interface, type assertion, type switch |
| 6 | Generics | Hàm generic, kiểu generic, type constraint |
| 7 | Xử lý lỗi | `error`, sentinel error, wrap/unwrap, `panic`/`recover` |
| 8 | Tổ chức code | Module, `go.mod`, package, import, publish module |
| 9 | Concurrency | Goroutine, channel, `select`, `sync`, `context`, pattern, race |
| 10 | Thư viện chuẩn | I/O, file, JSON, `time`, `flag`, `slog`, `regexp`, `embed` |
| 11 | Testing | `testing`, table-driven test, mock, `httptest`, benchmark, coverage |
| 12 | Hệ sinh thái | `net/http`, Gin/Echo/Fiber, gRPC, database, CLI, logging |
| 13 | Toolchain | Lệnh `go`, linter, `govulncheck`, pprof, cross-compile |
| 14 | Chủ đề nâng cao | Escape analysis, reflection, `unsafe`, cgo, plugin |

## Thứ tự học gợi ý

1. **Nhóm 1–5** là bắt buộc: slice, map, con trỏ và interface là nền của mọi code Go.
2. **Nhóm 7–8** ngay sau đó — xử lý lỗi và module xuất hiện trong mọi dự án thật.
3. **Nhóm 9** là phần đáng đầu tư nhất: hiểu goroutine, channel và `context` mới viết được service đúng.
4. **Nhóm 10–12** để làm một REST API hoàn chỉnh có database và test — làm song song với một dự án nhỏ.
5. **Nhóm 6, 13, 14** đọc khi đã quen: generics dùng có chọn lọc, toolchain và chủ đề nâng cao phục vụ tối ưu và vận hành.

:::info[Kiến thức cần có trước]

Biết ít nhất một ngôn ngữ lập trình khác (JavaScript, Java, Python...), dùng được terminal, hiểu HTTP và REST cơ bản. Phần concurrency sẽ dễ hơn nếu đã biết khái niệm thread và process (topic **Computer Science** của site).

:::
