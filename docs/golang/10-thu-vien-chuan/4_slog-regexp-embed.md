---
sidebar_position: 4
title: "4. slog, regexp và embed"
---

# slog, regexp và embed

Bài này gom ba công cụ nhỏ nhưng có mặt trong hầu hết service Go: `log/slog` (Go 1.21) cho **structured logging** — log dạng key-value mà hệ thống như Loki, Elasticsearch, CloudWatch truy vấn được; `regexp` cho biểu thức chính quy với đảm bảo thời gian chạy tuyến tính nhờ engine RE2; và chỉ thị `//go:embed` (Go 1.16) để nhúng file tĩnh (HTML, SQL migration, template) thẳng vào binary — deploy chỉ còn đúng một file.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Dùng `log/slog` thay `log` cho service** — log dạng key-value (`slog.Info("tạo đơn", "order_id", 7)`), đổi sang JSON chỉ bằng cách đổi handler.
- ⭐ **`regexp.MustCompile` ở biến package-level** — compile một lần; compile trong hàm được gọi mỗi request là lãng phí CPU.
- **`logger.With(...)` gắn trường chung** (request_id, user_id) cho mọi log phía sau; `slog.Group` gom trường thành object lồng.
- **Regexp Go dùng RE2: không backtracking** → thời gian tuyến tính, an toàn trước ReDoS, nhưng không hỗ trợ backreference (`\1`) và lookahead.
- **`//go:embed` chỉ dùng cho biến package-level** kiểu `string`, `[]byte` hoặc `embed.FS`; phục vụ web tĩnh bằng `http.FileServerFS` (Go 1.22) hoặc `http.FileServer(http.FS(...))`.

:::

---

## Mục lục

- [Vì sao cần structured logging?](#vì-sao-cần-structured-logging)
- [log/slog cơ bản](#logslog-cơ-bản)
- [With, Group và context](#with-group-và-context)
- [Handler tuỳ biến](#handler-tuỳ-biến)
- [regexp: biểu thức chính quy kiểu RE2](#regexp-biểu-thức-chính-quy-kiểu-re2)
- [Nhúng file với go:embed](#nhúng-file-với-goembed)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao cần structured logging?

**Vấn đề:** Package `log` cũ chỉ in chuỗi tự do:

```go
log.Printf("user %d tạo đơn %d số tiền %d thất bại: %v", userID, orderID, amount, err)
// 2026/10/15 09:00:00 user 42 tạo đơn 7 số tiền 50000 thất bại: timeout
```

Khi có hàng triệu dòng log trên hệ thống tập trung, muốn tìm "mọi lỗi của user 42" phải viết regex dò chuỗi — mỗi dev viết một kiểu (`user 42`, `userID=42`, `uid:42`), đổi câu chữ là hỏng truy vấn. `log` cũng không có level (debug/info/error).

**Giải pháp:** `log/slog` — mỗi log là **message + các cặp key-value + level**, xuất ra text hoặc JSON:

```go
logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
logger.Error("tạo đơn thất bại", "user_id", 42, "order_id", 7, "amount", 50000, "err", err)
// {"time":"2026-10-15T09:00:00+07:00","level":"ERROR","msg":"tạo đơn thất bại","user_id":42,"order_id":7,"amount":50000,"err":"timeout"}
```

Giờ truy vấn chính xác được: `level = "ERROR" AND user_id = 42`.

:::tip[Dùng thực tế]

- **Log JSON trên production**, text dễ đọc khi chạy local — chỉ đổi handler theo biến môi trường.
- **Gắn `request_id`** cho mọi log trong một request để truy vết (tracing) xuyên suốt nhiều service.
- **Đổi level lúc runtime** (bật debug tạm thời khi điều tra sự cố) bằng `slog.LevelVar`.
- **Ẩn dữ liệu nhạy cảm** (mật khẩu, số thẻ) bằng `LogValuer`.

:::

:::tip[Ví dụ đời thường]

`log.Printf` giống **sổ ghi chép viết tay** của bảo vệ toà nhà: "Anh Nam phòng 502 về lúc 10 giờ tối, có mang theo hàng" — đọc hiểu được, nhưng muốn thống kê "phòng 502 về muộn bao nhiêu lần trong tháng" thì phải ngồi lật từng trang. `slog` giống **phiếu kẻ sẵn cột**: Phòng | Giờ | Sự kiện | Ghi chú — nhập vào Excel là lọc được ngay.

:::

---

## log/slog cơ bản

### Hàm cấp package và level

```go
slog.Debug("chi tiết", "sql", query)  // mặc định KHÔNG in (level tối thiểu là Info)
slog.Info("server started", "port", 8080)
slog.Warn("retry", "attempt", 3)
slog.Error("db lỗi", "err", err)
// 2026/10/15 09:00:00 INFO server started port=8080
```

Bốn level có sẵn là số nguyên: `LevelDebug = -4`, `LevelInfo = 0`, `LevelWarn = 4`, `LevelError = 8` — khoảng cách cho phép tự định nghĩa level ở giữa (ví dụ `LevelTrace = -8`).

### Hai handler có sẵn

```go
opts := &slog.HandlerOptions{
	Level:     slog.LevelDebug, // in từ Debug trở lên
	AddSource: true,            // thêm file:dòng gọi log
}

text := slog.New(slog.NewTextHandler(os.Stdout, opts))
// time=2026-10-15T09:00:00.000+07:00 level=INFO msg="server started" port=8080

json := slog.New(slog.NewJSONHandler(os.Stdout, opts))
// {"time":"2026-10-15T09:00:00+07:00","level":"INFO","msg":"server started","port":8080}

slog.SetDefault(json) // từ đây slog.Info(...) và cả log.Printf(...) đều đi qua handler JSON
```

Chọn handler theo môi trường:

```go
func newLogger(env string) *slog.Logger {
	opts := &slog.HandlerOptions{Level: slog.LevelInfo}
	if env == "production" {
		return slog.New(slog.NewJSONHandler(os.Stdout, opts))
	}
	opts.Level = slog.LevelDebug
	return slog.New(slog.NewTextHandler(os.Stderr, opts))
}
```

### Attr có kiểu — nhanh hơn và an toàn hơn

Cách viết `"key", value` xen kẽ rất tiện nhưng dễ sai (thiếu value). Viết bằng `slog.Attr` thì trình biên dịch kiểm tra giúp, và tránh cấp phát bộ nhớ:

```go
logger.Info("thanh toán",
	slog.Int64("order_id", 7),
	slog.String("method", "momo"),
	slog.Duration("took", time.Since(start)),
	slog.Any("err", err),
)

// LogAttrs: chỉ nhận Attr, nhanh nhất cho đường code nóng
logger.LogAttrs(ctx, slog.LevelInfo, "thanh toán", slog.Int64("order_id", 7))
```

:::warning[Thiếu value]

```go
logger.Info("login", "user", "an", "bad") // số đối số lẻ
// ... msg=login user=an !BADKEY=bad
```

Không panic, chỉ in `!BADKEY`. `go vet` (analyzer `slog`) bắt được lỗi này: `call to slog.Logger.Info missing a final value` — hãy để `go vet` chạy trong CI.

:::

### Đổi level lúc runtime

```go
var level slog.LevelVar // zero value là Info
level.Set(slog.LevelWarn)

logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: &level}))
logger.Info("ẩn")        // không in
level.Set(slog.LevelDebug) // ví dụ: gọi từ endpoint admin /debug/loglevel
logger.Info("hiện")      // in
```

### Ẩn dữ liệu nhạy cảm với LogValuer

```go
type Password string

func (Password) LogValue() slog.Value { return slog.StringValue("***") }

logger.Info("login", "pw", Password("secret")) // ... pw=***
```

---

## With, Group và context

### With — logger con mang sẵn trường

```go
func (h *Handler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	log := h.logger.With("request_id", r.Header.Get("X-Request-ID"), "user_id", userID(r))

	log.Info("bắt đầu tạo đơn")
	// ... mọi log sau đều tự có request_id và user_id
	log.Info("tạo đơn xong", "order_id", 7)
}
```

`With` tạo logger **mới** (logger gốc không đổi), và các trường được format sẵn một lần nên rẻ hơn truyền lại mỗi lần log.

### Group — gom trường thành nhóm

```go
logger.Info("tạo đơn", slog.Group("order", "id", 7, "amount", 50000))
// JSON: {"msg":"tạo đơn","order":{"id":7,"amount":50000}}
// Text: msg="tạo đơn" order.id=7 order.amount=50000

httpLog := logger.WithGroup("http") // mọi trường sau nằm trong nhóm "http"
httpLog.Info("req", "method", "GET") // text: http.method=GET
```

### Context

Mọi method log đều có biến thể nhận `context.Context`: `InfoContext`, `ErrorContext`... Handler có thể lấy thông tin từ context (trace ID của OpenTelemetry, request ID) — handler có sẵn không tự đọc gì từ context, bạn phải viết handler bọc (phần sau).

### So sánh log và slog

| Tiêu chí | `log` | `log/slog` |
|----------|-------|------------|
| Có từ | Go 1.0 | Go 1.21 |
| Định dạng | Chuỗi tự do | Key-value, text hoặc JSON |
| Level | Không (chỉ `Fatal`, `Panic`) | Debug/Info/Warn/Error + tuỳ biến |
| Trường chung | Chỉ prefix | `With`, `WithGroup` |
| Context | Không | `InfoContext`... |
| Mở rộng | Đổi `io.Writer` | Interface `slog.Handler` |
| Dùng khi | Script, tool nhỏ | Service, mọi thứ chạy production |

`log.Fatal` gọi `os.Exit(1)` — không chạy `defer`. `slog` cố ý không có `Fatal`; hãy log `Error` rồi tự thoát có kiểm soát.

Trước slog, cộng đồng dùng `go.uber.org/zap` và `github.com/rs/zerolog` (vẫn nhanh hơn slog một chút, và đều có adapter sang slog). Dự án mới nên bắt đầu với slog vì là chuẩn chung — thư viện bên thứ ba có thể nhận `*slog.Logger` mà không ép bạn dùng logger riêng.

---

## Handler tuỳ biến

`slog.Handler` là interface 4 method: `Enabled`, `Handle`, `WithAttrs`, `WithGroup`. Cách phổ biến nhất là **bọc** một handler có sẵn và chỉ ghi đè `Handle` — ví dụ tự thêm `request_id` lấy từ context:

```go
type ctxKey struct{}

// Embed slog.Handler: Enabled được "kế thừa" từ handler bên trong
type ContextHandler struct {
	slog.Handler
}

func (h ContextHandler) Handle(ctx context.Context, r slog.Record) error {
	if id, ok := ctx.Value(ctxKey{}).(string); ok {
		r.AddAttrs(slog.String("request_id", id))
	}
	return h.Handler.Handle(ctx, r)
}

// Phải bọc lại kết quả, nếu không logger.With(...) sẽ trả về handler gốc và mất ContextHandler
func (h ContextHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	return ContextHandler{h.Handler.WithAttrs(attrs)}
}

func (h ContextHandler) WithGroup(name string) slog.Handler {
	return ContextHandler{h.Handler.WithGroup(name)}
}

func main() {
	logger := slog.New(ContextHandler{slog.NewJSONHandler(os.Stdout, nil)})
	ctx := context.WithValue(context.Background(), ctxKey{}, "req-123")
	logger.InfoContext(ctx, "xử lý", "step", 1)
	// {"time":"...","level":"INFO","msg":"xử lý","step":1,"request_id":"req-123"}
}
```

Middleware HTTP sinh request ID, nhét vào context, và mọi `InfoContext(r.Context(), ...)` trong handler tự có ID — không cần truyền logger khắp nơi.

`HandlerOptions.ReplaceAttr` là cách nhẹ hơn để sửa từng trường (đổi tên `msg` thành `message`, bỏ `time` khi test, che trường `password`) mà không phải viết handler.

---

## regexp: biểu thức chính quy kiểu RE2

### Compile một lần, dùng nhiều lần

```go
// Package-level: compile khi chương trình khởi động; regex sai → panic ngay lúc start (dễ phát hiện)
var (
	emailRe = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	phoneRe = regexp.MustCompile(`(0|\+84)(\d{9})`)
)

func IsValidEmail(s string) bool {
	return emailRe.MatchString(s)
}
```

Dùng **raw string** (dấu backtick) để khỏi phải escape `\` hai lần. Khi pattern đến từ người dùng/cấu hình, dùng `regexp.Compile` và xử lý `error` thay vì `MustCompile`. `*regexp.Regexp` an toàn khi dùng đồng thời từ nhiều goroutine.

### Các method hay dùng

Tên method theo quy tắc: `Find` + `All`? + `String`? + `Submatch`? + `Index`?

```go
s := "Liên hệ 0901234567 hoặc +84987654321"

phoneRe.MatchString(s)                // true
phoneRe.FindString(s)                 // "0901234567" — khớp đầu tiên
phoneRe.FindAllString(s, -1)          // [0901234567 +84987654321] — -1: lấy tất cả
phoneRe.FindStringSubmatch(s)         // [0901234567 0 901234567] — [toàn bộ, nhóm 1, nhóm 2]
phoneRe.FindAllStringIndex(s, -1)     // vị trí [start end] của từng khớp

phoneRe.ReplaceAllString(s, "$1*********")
// Liên hệ 0********* hoặc +84*********

// Thay bằng hàm: che 4 số cuối
phoneRe.ReplaceAllStringFunc(s, func(m string) string {
	return m[:len(m)-4] + "****"
})
// Liên hệ 090123**** hoặc +8498765****

regexp.MustCompile(`\s*,\s*`).Split("a , b,c", -1) // [a b c]
regexp.QuoteMeta("1.5+2")                         // 1\.5\+2 — escape chuỗi để khớp nguyên văn
```

Các method không có `String` làm việc với `[]byte` (`Match`, `FindAll`, `ReplaceAll`) — tránh chuyển đổi khi dữ liệu đã là byte.

### Named group

```go
var dateRe = regexp.MustCompile(`(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})`)

m := dateRe.FindStringSubmatch("Ngày 2026-10-15")
year := m[dateRe.SubexpIndex("year")]   // "2026"
month := m[dateRe.SubexpIndex("month")] // "10"

dateRe.ReplaceAllString("2026-10-15", "${day}/${month}/${year}") // 15/10/2026
```

Go 1.22+ còn chấp nhận cú pháp `(?<name>...)` giống các ngôn ngữ khác.

:::warning[$name trong chuỗi thay thế]

`$day_x` được hiểu là nhóm tên `day_x` (không tồn tại → chuỗi rỗng), không phải `$day` + `_x`. Luôn dùng dạng có ngoặc `${day}_x` cho chắc. Muốn ghi ký tự `$` thật thì viết `$$`, hoặc dùng `ReplaceAllLiteralString`.

:::

Cờ viết trong pattern: `(?i)` không phân biệt hoa thường, `(?m)` cho `^`/`$` khớp đầu/cuối mỗi dòng, `(?s)` cho `.` khớp cả `\n`.

### RE2: không backtracking

Engine regex của Perl, Python, Java, JavaScript dùng **backtracking** — với pattern xấu như `(a+)+$` và chuỗi `"aaaa...aaab"`, thời gian chạy tăng theo **hàm mũ**. Kẻ tấn công gửi một chuỗi vài chục ký tự là treo được server (ReDoS — Regular expression Denial of Service).

Go dùng cú pháp và thuật toán **RE2** (dựa trên automaton): thời gian luôn **tuyến tính** theo độ dài chuỗi. Đổi lại:

| Tính năng | Go (RE2) | PCRE / Java / JS |
|-----------|----------|------------------|
| Thời gian chạy | Tuyến tính, đảm bảo | Có thể hàm mũ |
| Backreference `\1` | ❌ (lỗi `invalid escape sequence`) | ✅ |
| Lookahead/lookbehind `(?=...)` `(?<=...)` | ❌ | ✅ |
| Named group, lớp ký tự, Unicode `\p{L}` | ✅ | ✅ |

Không có lookahead thì thường tách thành nhiều bước: dùng regex đơn giản rồi kiểm tra thêm bằng code Go. Và nhớ: với việc đơn giản như kiểm tra tiền tố, tách chuỗi, `strings.HasPrefix`/`strings.Cut`/`strings.Fields` nhanh hơn regex nhiều lần.

---

## Nhúng file với go:embed

### Vấn đề trước Go 1.16

Service cần file tĩnh (HTML, CSS, template email, file SQL migration) thì phải deploy kèm thư mục, cấu hình đường dẫn đúng trên từng máy, Dockerfile phải `COPY` thêm — quên một file là lỗi lúc chạy. Hoặc dùng tool bên ngoài sinh code Go chứa byte của file.

### Ba cách nhúng

```go
package main

import "embed"

//go:embed version.txt
var version string // nội dung file dạng chuỗi

//go:embed logo.png
var logo []byte // nội dung file dạng byte

//go:embed static templates/*.html
var assets embed.FS // cả thư mục/nhiều file, dạng filesystem chỉ đọc
```

Quy tắc:

- Chỉ thị `//go:embed` đặt **ngay trên** khai báo `var` ở **cấp package** (không dùng trong hàm), không có dấu cách sau `//`.
- Với `string`/`[]byte` phải import `embed` (thường là `import _ "embed"`); chỉ được một file.
- Đường dẫn tương đối với thư mục chứa file `.go`, **không** được dùng `..` (không nhúng file ngoài module/package cha).
- File bắt đầu bằng `.` hoặc `_` bị bỏ qua khi nhúng thư mục; dùng tiền tố `all:` (`//go:embed all:static`) để lấy cả chúng.
- File nhúng là **chỉ đọc** và cố định lúc build — sửa file phải build lại.

### Đọc từ embed.FS

`embed.FS` hiện thực `fs.FS` nên dùng được với mọi API của `io/fs`:

```go
data, err := assets.ReadFile("templates/welcome.html") // đường dẫn dùng "/", tính từ thư mục package
entries, err := assets.ReadDir("static")

tmpl := template.Must(template.ParseFS(assets, "templates/*.html"))
```

### Phục vụ file tĩnh qua HTTP

```go
//go:embed static
var staticFS embed.FS

func main() {
	// Bỏ tiền tố "static/" để URL /index.html ánh xạ tới static/index.html
	sub, err := fs.Sub(staticFS, "static")
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()
	mux.Handle("GET /", http.FileServerFS(sub)) // Go 1.22+
	// Trước Go 1.22: http.FileServer(http.FS(sub))

	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})
	log.Fatal(http.ListenAndServe(":8080", mux))
}
```

Đây là cách phổ biến để đóng gói một SPA (React/Vue đã build ra `dist/`) cùng API Go thành **một binary duy nhất**. Các ví dụ khác: nhúng file `migrations/*.sql` để chạy migration lúc khởi động (thư viện `goose`, `golang-migrate` đều nhận `fs.FS`), nhúng template email, nhúng file cấu hình mặc định.

:::warning[Kích thước binary và thời gian build]

Mọi thứ nhúng vào đều làm binary to ra tương ứng và nằm trong bộ nhớ khi chạy. Đừng nhúng video, dataset vài trăm MB — để chúng ở object storage. Khi phát triển giao diện, có thể dùng `os.DirFS("static")` ở chế độ dev (sửa file thấy ngay) và `embed.FS` ở bản build production — cả hai đều là `fs.FS` nên code phục vụ không đổi.

:::

---

## Câu hỏi phỏng vấn

**1. Structured logging là gì? Vì sao nên dùng `log/slog` thay vì `log`?**

<details className="qa">
<summary>Xem đáp án</summary>

Structured logging ghi log thành các trường key-value (thường là JSON) thay vì chuỗi tự do, nên hệ thống log tập trung lọc/thống kê được chính xác (`user_id = 42 AND level = ERROR`). `log/slog` (Go 1.21) cung cấp level, handler text/JSON, `With`/`WithGroup` cho trường chung, biến thể nhận `context`, interface `Handler` để mở rộng, và là chuẩn chung nên thư viện có thể nhận `*slog.Logger`. `log` chỉ in chuỗi, không level, không cấu trúc.

</details>

**2. Làm sao để mọi log trong một HTTP request đều có `request_id`?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai cách: (1) trong middleware tạo `logger.With("request_id", id)` rồi truyền logger con (qua context hoặc struct) cho handler; (2) đưa `request_id` vào `context`, viết `slog.Handler` bọc handler gốc, trong `Handle` đọc ID từ `ctx` và `r.AddAttrs(...)`; mọi chỗ log dùng `InfoContext(ctx, ...)`. Khi bọc handler phải hiện thực lại `WithAttrs`/`WithGroup` để trả về handler đã bọc, nếu không `With` sẽ làm mất lớp bọc.

</details>

**3. Regexp của Go khác của Java/Python/JavaScript ở điểm nào? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Go dùng RE2: không backtracking, đảm bảo thời gian chạy tuyến tính theo độ dài đầu vào, nên miễn nhiễm ReDoS — an toàn khi chạy regex trên dữ liệu người dùng gửi lên. Đổi lại, không hỗ trợ backreference (`\1`) và lookahead/lookbehind, vì các tính năng đó không thể hiện thực trong thời gian tuyến tính. Cần những tính năng đó thì tách logic ra code Go hoặc dùng thư viện bên thứ ba (chấp nhận rủi ro).

</details>

**4. Vì sao nên khai báo regex bằng `MustCompile` ở cấp package?**

<details className="qa">
<summary>Xem đáp án</summary>

Compile regex tốn chi phí (parse, dựng automaton). Đặt ở biến package-level thì chỉ compile một lần khi chương trình khởi động, mọi lời gọi sau dùng lại; `*regexp.Regexp` an toàn cho nhiều goroutine. `MustCompile` panic nếu pattern sai, và vì chạy lúc khởi tạo nên lỗi lộ ra ngay khi start (hoặc khi chạy test) thay vì giữa lúc phục vụ request. Pattern động từ người dùng thì dùng `Compile` và xử lý lỗi.

</details>

**5. `//go:embed` có những giới hạn gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Chỉ dùng cho biến cấp package kiểu `string`, `[]byte` hoặc `embed.FS`; `string`/`[]byte` chỉ nhúng được một file. Đường dẫn tương đối với thư mục package, không được chứa `..`, không trỏ ra ngoài module, không nhúng symlink bất thường. File/thư mục bắt đầu bằng `.` hoặc `_` bị bỏ qua trừ khi dùng tiền tố `all:`. Nội dung cố định tại thời điểm build và chỉ đọc. Binary to ra theo kích thước file nhúng.

</details>

**6. Phục vụ một SPA đã build từ binary Go thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`//go:embed dist` vào biến `embed.FS`, dùng `fs.Sub(distFS, "dist")` để bỏ tiền tố thư mục, rồi `mux.Handle("GET /", http.FileServerFS(sub))` (Go 1.22) hoặc `http.FileServer(http.FS(sub))`. API đăng ký ở route cụ thể hơn như `/api/`. Với SPA dùng client-side routing, cần thêm handler trả `index.html` cho các đường dẫn không khớp file thật để F5 trên `/orders/7` không bị 404.

</details>
