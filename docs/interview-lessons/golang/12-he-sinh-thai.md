---
sidebar_position: 12
title: "12. Hệ sinh thái"
---

# 12. Hệ sinh thái

## 1. net/http

Bài học: [1. net/http](../../golang/12-he-sinh-thai/1_net-http.md)

**1. `http.Handler` và `http.HandlerFunc` khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`http.Handler` là **interface** với một method `ServeHTTP(ResponseWriter, *Request)`. `http.HandlerFunc` là **kiểu hàm** `func(ResponseWriter, *Request)` có gắn sẵn method `ServeHTTP` gọi lại chính nó — tức là một adapter biến hàm thường thành `Handler`. Nhờ vậy có thể viết handler bằng hàm/closure thay vì phải khai báo struct; middleware cũng thường trả về `http.HandlerFunc(func(w, r) {...})`.

</details>

**2. Vì sao không nên dùng `http.ListenAndServe` và `http.Get` trong production?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai dùng cấu hình mặc định **không có timeout**. Ở server, client chậm hoặc tấn công Slowloris giữ kết nối vô hạn, làm cạn file descriptor/goroutine — cần tự tạo `http.Server` với `ReadHeaderTimeout`, `ReadTimeout`, `WriteTimeout`, `IdleTimeout`. Ở client, `http.DefaultClient` không timeout nên API phía bên kia treo thì goroutine gọi cũng treo theo — cần `http.Client{Timeout: ...}` và/hoặc context có deadline. Ngoài ra `DefaultClient` là biến toàn cục, thư viện khác có thể sửa `Transport` của nó.

</details>

**3. ServeMux của Go 1.22 có gì mới? Khi hai pattern cùng khớp thì chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Thêm method trong pattern (`"POST /users"`), wildcard `{id}` đọc bằng `r.PathValue`, wildcard bắt phần còn lại `{path...}`, `{$}` để khớp chính xác đường dẫn kết thúc bằng `/`, tự trả 405 khi sai method. Khi nhiều pattern khớp, pattern **cụ thể hơn** thắng (khớp tập request nhỏ hơn), ví dụ `/users/me` thắng `/users/{id}`, `GET /x` thắng `/x`. Nếu hai pattern chồng lấn mà không cái nào cụ thể hơn, `Handle` **panic ngay lúc đăng ký**, nên lỗi lộ ra từ khi khởi động. Yêu cầu `go.mod` khai báo `go 1.22+`.

</details>

**4. Graceful shutdown trong Go hoạt động thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng `signal.NotifyContext` để nhận một context bị huỷ khi có SIGINT/SIGTERM. Server chạy `ListenAndServe` trong goroutine; `main` chặn ở `<-ctx.Done()`. Khi có tín hiệu, gọi `srv.Shutdown(ctx)` với một context **mới** có timeout: server đóng listener (không nhận kết nối mới), đóng kết nối idle, chờ các request đang xử lý xong. Lúc đó `ListenAndServe` trả `http.ErrServerClosed` (không phải lỗi thật). Quá timeout thì `Shutdown` trả `context.DeadlineExceeded`, có thể gọi `srv.Close()` để buộc đóng. Sau đó đóng DB, flush log.

</details>

**5. Quên `resp.Body.Close()` ở client thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Kết nối TCP không được trả về pool của `Transport` để tái sử dụng, kèm theo goroutine đọc/ghi của kết nối đó bị giữ lại → rò rỉ kết nối, file descriptor và goroutine, lâu dần hết port hoặc bộ nhớ. Muốn kết nối được tái sử dụng, body cũng nên được **đọc hết** trước khi đóng (`io.Copy(io.Discard, resp.Body)`) trong trường hợp bạn không đọc nó. Lưu ý: `err != nil` thì `resp` là nil, không cần đóng.

</details>

**6. Làm sao truyền thông tin từ middleware xuống handler?**

<details className="qa">
<summary>Xem đáp án</summary>

Qua `context` của request: middleware tạo context mới bằng `context.WithValue(r.Context(), key, value)` rồi gọi `next.ServeHTTP(w, r.WithContext(ctx))`; handler đọc bằng `r.Context().Value(key)`. Key nên là kiểu chưa export (vd `type ctxKey string`) để tránh đụng key của package khác. Chỉ đưa dữ liệu thuộc phạm vi request (user ID, request ID, trace) vào context, không dùng context để truyền phụ thuộc như DB.

</details>

---

## 2. Web framework: Gin, Echo, Fiber, Beego

Bài học: [2. Web framework: Gin, Echo, Fiber, Beego](../../golang/12-he-sinh-thai/2_web-framework.md)

**1. Khi nào nên dùng `net/http` thuần thay vì framework?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi service nhỏ, ít endpoint; khi viết thư viện/SDK không muốn ép người dùng theo framework; khi muốn ít phụ thuộc, dễ nâng cấp Go. Từ Go 1.22, ServeMux đã có method và path param nên lý do lớn nhất để dùng router ngoài không còn. Framework đáng dùng khi có nhiều endpoint cần bind/validate, nhóm route với middleware khác nhau, và team muốn quy ước chung sẵn có.

</details>

**2. Fiber khác Gin/Echo ở điểm cốt lõi nào? Hệ quả là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Fiber xây trên **fasthttp**, không phải `net/http`. Hệ quả: không tương thích `http.Handler` nên không dùng lại được middleware/thư viện của hệ sinh thái chuẩn (OpenTelemetry, Prometheus, auth...) nếu không qua adaptor; không hỗ trợ HTTP/2; `httptest` không dùng thẳng được; và do fasthttp tái sử dụng buffer, chuỗi lấy từ context chỉ hợp lệ trong handler — giữ lại sau đó phải copy hoặc bật `Immutable`. Đổi lại là ít cấp phát bộ nhớ, throughput cao trong benchmark.

</details>

**3. Trong Gin, `c.Abort()` có dừng hàm handler hiện tại không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. `Abort` chỉ đánh dấu để các handler **tiếp theo** trong chuỗi (middleware/handler sau) không được gọi. Code còn lại trong hàm hiện tại vẫn chạy bình thường, nên phải `return` ngay sau `Abort`/`AbortWithStatusJSON`. Ngược lại, `c.Next()` gọi các handler phía sau ngay tại chỗ, code sau `c.Next()` chạy khi chúng trả về (dùng để đo thời gian, log status).

</details>

**4. Echo xử lý lỗi theo cách nào và vì sao tiện?**

<details className="qa">
<summary>Xem đáp án</summary>

Handler Echo có kiểu `func(echo.Context) error`. Lỗi trả về được chuyển tới `e.HTTPErrorHandler` — một nơi duy nhất quyết định status code và format JSON. `*echo.HTTPError` (tạo bằng `echo.NewHTTPError`) mang sẵn status; lỗi khác mặc định thành 500. Nhờ vậy handler chỉ cần `return err`, có thể ghi đè error handler để map lỗi nghiệp vụ (vd `ErrNotFound` → 404) tập trung, thay vì mỗi handler tự ghi response.

</details>

**5. Làm sao để code không bị "khoá" vào một framework?**

<details className="qa">
<summary>Xem đáp án</summary>

Giữ lớp handler mỏng: chỉ đọc input từ context của framework, gọi service với struct/kiểu thường, rồi ghi output. Service, repository không import framework, không nhận `*gin.Context`/`echo.Context`; truyền `context.Context` chuẩn (`c.Request.Context()` với Gin, `c.Request().Context()` với Echo). Ưu tiên framework tương thích `net/http` để dùng chung middleware chuẩn. Khi đổi framework chỉ phải viết lại lớp handler và router.

</details>

---

## 3. gRPC và Protocol Buffers

Bài học: [3. gRPC và Protocol Buffers](../../golang/12-he-sinh-thai/3_grpc-protobuf.md)

**1. Protocol Buffers mã hoá theo tên hay số field? Hệ quả với việc thay đổi schema?**

<details className="qa">
<summary>Xem đáp án</summary>

Theo **field number** (kèm wire type), tên field không xuất hiện trong dữ liệu nhị phân. Vì vậy: được thêm field mới (bên cũ bỏ qua field lạ); được đổi tên field (nhị phân không đổi, nhưng ảnh hưởng JSON và code); **không được** đổi số hoặc đổi kiểu không tương thích của field đã dùng; khi xoá field phải `reserved` số và tên để tránh bị tái sử dụng, nếu không client cũ sẽ hiểu sai dữ liệu mới.

</details>

**2. Kể tên 4 kiểu RPC trong gRPC và ví dụ dùng.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Unary**: 1 request – 1 response (lấy thông tin user).
- **Server streaming**: 1 request – nhiều response (đẩy giá cổ phiếu, xuất danh sách lớn).
- **Client streaming**: nhiều request – 1 response (upload file theo chunk, gửi lô số liệu cảm biến rồi nhận tổng kết).
- **Bidirectional streaming**: hai chiều độc lập trên cùng một stream (chat, game, đồng bộ realtime).

Tất cả chạy trên một kết nối HTTP/2 nhờ multiplexing.

</details>

**3. Deadline trong gRPC hoạt động thế nào? Vì sao quan trọng?**

<details className="qa">
<summary>Xem đáp án</summary>

Client đặt deadline qua `context.WithTimeout`/`WithDeadline`; grpc-go gửi nó trong header `grpc-timeout`. Server nhận `ctx` có cùng deadline, khi hết hạn `ctx.Done()` đóng và client nhận `codes.DeadlineExceeded`. Nếu server truyền tiếp `ctx` khi gọi service khác, deadline lan truyền qua cả chuỗi, tránh việc service phía sau vẫn làm việc vô ích cho một request đã bị bỏ. Không đặt deadline thì một service chậm có thể làm cạn goroutine/kết nối của mọi service gọi nó (lỗi dây chuyền).

</details>

**4. Vì sao server phải nhúng `UnimplementedXxxServer`?**

<details className="qa">
<summary>Xem đáp án</summary>

Để **tương thích tiến**: khi file `.proto` thêm RPC mới và sinh lại code, interface server có thêm method. Nhờ nhúng struct `Unimplemented...`, kiểu của bạn vẫn thoả interface (method mới được kế thừa, trả `codes.Unimplemented`) nên code vẫn biên dịch được. protoc-gen-go-grpc mặc định bắt buộc nhúng (method `mustEmbedUnimplemented...`). Nên nhúng **theo giá trị** — nhúng con trỏ nil sẽ panic khi RPC chưa hiện thực được gọi.

</details>

**5. Interceptor là gì? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

Là hàm bọc quanh lời gọi RPC, tương tự middleware HTTP, có cho unary/stream ở cả server và client. Server unary có chữ ký `func(ctx, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error)`. Dùng cho logging, metrics, tracing, xác thực (đọc token từ `metadata`), recover panic, validate request, retry phía client. Gắn bằng `grpc.ChainUnaryInterceptor(...)` ở server, `grpc.WithChainUnaryInterceptor(...)` ở client.

</details>

**6. Khi nào chọn REST thay vì gRPC?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi API công khai cho bên thứ ba hoặc trình duyệt gọi trực tiếp, cần dễ debug bằng `curl`, cần tận dụng cache HTTP/CDN, hoặc team/đối tác chưa sẵn sàng với toolchain protobuf. gRPC phù hợp cho giao tiếp nội bộ giữa service: hiệu năng cao, hợp đồng chặt, streaming, đa ngôn ngữ. Có thể dùng gRPC-Gateway hoặc ConnectRPC để phục vụ cả hai từ một định nghĩa `.proto`.

</details>

---

## 4. Làm việc với database

Bài học: [4. Làm việc với database](../../golang/12-he-sinh-thai/4_database.md)

**1. `sql.Open` có mở kết nối không? `*sql.DB` là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. `sql.Open` chỉ kiểm tra tên driver và tạo đối tượng `*sql.DB` — một **connection pool** quản lý nhiều kết nối, kết nối thật được mở lười khi cần. Muốn biết DB có truy cập được không thì gọi `PingContext`. `*sql.DB` an toàn khi dùng đồng thời, nên tạo **một lần** và dùng chung toàn ứng dụng; tạo/đóng `sql.DB` mỗi request là sai lầm phổ biến, làm mất tác dụng của pool.

</details>

**2. Cấu hình connection pool thế nào? Hậu quả khi sai?**

<details className="qa">
<summary>Xem đáp án</summary>

`SetMaxOpenConns` giới hạn tổng kết nối (mặc định không giới hạn → tải cao có thể vượt `max_connections` của DB); `SetMaxIdleConns` giữ kết nối rảnh (mặc định 2 → tải cao liên tục mở/đóng kết nối); `SetConnMaxLifetime`/`SetConnMaxIdleTime` thay kết nối cũ định kỳ. Cần tính `MaxOpenConns × số instance` nhỏ hơn giới hạn của DB. Quan sát `db.Stats()`: `WaitCount`/`WaitDuration` tăng tức là pool thiếu hoặc có chỗ giữ kết nối quá lâu (quên `rows.Close`, transaction dài).

</details>

**3. Làm sao phân biệt "không tìm thấy" với lỗi thật khi truy vấn một dòng?**

<details className="qa">
<summary>Xem đáp án</summary>

`QueryRowContext(...).Scan(...)` trả `sql.ErrNoRows` khi không có dòng nào. Kiểm tra bằng `errors.Is(err, sql.ErrNoRows)` rồi chuyển thành lỗi nghiệp vụ (vd `ErrNotFound` → HTTP 404); các lỗi khác là lỗi hệ thống (500). pgx dùng `pgx.ErrNoRows`, GORM dùng `gorm.ErrRecordNotFound` (với `First`/`Take`/`Last`; `Find` không trả lỗi này). Lưu ý `QueryContext` cho nhiều dòng không bao giờ trả `ErrNoRows` — chỉ là slice rỗng.

</details>

**4. Vì sao tham số hoá chống được SQL injection? Nếu cần ORDER BY động thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Với `$1`/`?`, câu SQL và giá trị được gửi tách biệt (hoặc driver escape đúng chuẩn), DB phân tích cú pháp câu lệnh trước rồi mới gắn giá trị như dữ liệu thuần — giá trị không bao giờ trở thành code SQL. Tham số chỉ dùng cho giá trị, không dùng cho tên bảng/cột/từ khoá; phần động như cột sắp xếp phải kiểm tra qua whitelist (map tên hợp lệ → tên cột) trước khi ghép chuỗi.

</details>

**5. Viết transaction đúng cách trong Go thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`tx, err := db.BeginTx(ctx, opts)`; ngay sau đó `defer tx.Rollback()` để mọi nhánh lỗi (kể cả panic) đều rollback; mọi câu lệnh dùng `tx.ExecContext`/`tx.QueryContext` (không phải `db.`); cuối cùng `return tx.Commit()`. Rollback sau Commit chỉ trả `sql.ErrTxDone`, vô hại. Giữ transaction ngắn, không gọi dịch vụ ngoài bên trong, chọn isolation level phù hợp và cân nhắc `SELECT ... FOR UPDATE` cho tình huống tranh chấp.

</details>

**6. So sánh GORM và sqlc. Khi nào chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

GORM là ORM: model struct, CRUD không viết SQL, association, hook, soft delete, truy vấn động dễ; đổi lại dùng reflection (chậm hơn), SQL sinh ra khó đoán, có bẫy như `Updates(struct)` bỏ qua giá trị zero và lỗi nằm trong `.Error`. sqlc ngược lại: viết SQL thuần, sinh code Go type-safe, phát hiện sai cột/kiểu lúc sinh code, hiệu năng như viết tay; nhưng truy vấn động khó hơn. Chọn GORM khi app nhiều CRUD đơn giản, cần làm nhanh; chọn sqlc khi truy vấn phức tạp, cần hiệu năng và kiểm soát SQL.

</details>

---

## 5. Xây dựng CLI

Bài học: [5. Xây dựng CLI](../../golang/12-he-sinh-thai/5_cli.md)

**1. Vì sao Go phù hợp để viết CLI?**

<details className="qa">
<summary>Xem đáp án</summary>

Biên dịch ra một binary tĩnh duy nhất, không cần runtime hay thư viện đi kèm; khởi động gần như tức thì (khác JVM/Node); cross-compile chỉ bằng `GOOS`/`GOARCH`; thư viện chuẩn mạnh (HTTP, JSON, file, crypto); concurrency dễ dùng cho tác vụ song song. Hệ sinh thái có Cobra, Viper, Bubble Tea, GoReleaser. Các tool lớn như Docker, kubectl, Terraform, gh đều viết bằng Go.

</details>

**2. Persistent flag và local flag trong Cobra khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Persistent flag (khai báo bằng `cmd.PersistentFlags()`) có hiệu lực ở lệnh khai báo và **mọi lệnh con** — dùng cho tuỳ chọn toàn cục như `--config`, `--verbose`, `--output`. Local flag (`cmd.Flags()`) chỉ có ở đúng lệnh đó, ví dụ `--priority` của `todo add`. Khai báo persistent flag ở root là cách phổ biến để mọi lệnh đều đọc được cấu hình chung.

</details>

**3. `Run` và `RunE` trong Cobra khác gì? Nên dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`Run` không trả giá trị, nên lỗi phải tự in và gọi `os.Exit` bên trong — khó test, bỏ qua `defer`. `RunE` trả `error`, Cobra đưa lỗi về `Execute()`, nơi bạn xử lý tập trung (in ra stderr, chọn exit code). Nên dùng `RunE` (và `PersistentPreRunE`...). Kết hợp `SilenceUsage: true` để lỗi khi chạy không in kèm usage dài, và `SilenceErrors` nếu muốn tự định dạng thông báo lỗi.

</details>

**4. Viper lấy giá trị cấu hình theo thứ tự ưu tiên nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Từ cao xuống thấp: giá trị đặt bằng `viper.Set` → flag (đã `BindPFlag`, và flag được người dùng truyền) → biến môi trường (`AutomaticEnv`/`BindEnv`) → file config → key/value store từ xa → giá trị mặc định (`SetDefault`). Nhờ đó một CLI có thể có default hợp lý, cho phép ghi đè bằng file, bằng env trong CI, và bằng flag khi chạy tay.

</details>

**5. Kiến trúc Elm trong Bubble Tea gồm những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba phần: **Model** (struct trạng thái), **Update** (nhận `tea.Msg` như phím bấm, kết quả việc nền; trả model mới và `tea.Cmd` tiếp theo), **View** (hàm thuần biến model thành chuỗi). Luồng dữ liệu một chiều: sự kiện → Update → Model mới → View. Việc bất đồng bộ được mô tả bằng `Cmd` (hàm trả về `Msg`), runtime chạy nó trong goroutine và gửi kết quả về Update, nên state chỉ thay đổi ở một chỗ, dễ suy luận và dễ test.

</details>

**6. Làm sao nhúng phiên bản vào binary lúc build?**

<details className="qa">
<summary>Xem đáp án</summary>

Khai báo biến package-level kiểu string (vd `var version = "dev"` trong `main`) rồi build với `go build -ldflags "-X main.version=1.2.0"` (đường dẫn đầy đủ của package nếu biến không ở `main`, vd `-X example.com/todo/internal/build.Version=1.2.0`). GoReleaser tự truyền `-X` với tag git. Ngoài ra từ Go 1.18, `runtime/debug.ReadBuildInfo()` cho biết module version (khi cài bằng `go install ...@v1.2.0`) và thông tin VCS (commit, thời gian) được nhúng tự động.

</details>

---

## 6. Logging: slog, zap, zerolog

Bài học: [6. Logging: slog, zap, zerolog](../../golang/12-he-sinh-thai/6_logging.md)

**1. Structured logging là gì và lợi ích so với log chuỗi?**

<details className="qa">
<summary>Xem đáp án</summary>

Là ghi log dưới dạng thông điệp cố định + các cặp key-value có kiểu (thường xuất JSON), thay vì chuỗi ghép tự do. Lợi ích: hệ thống thu thập log hiểu từng field nên lọc/tìm kiếm/thống kê chính xác (`level=ERROR AND user_id=42`), không phụ thuộc vào câu chữ; dễ gắn cảnh báo và dashboard; thêm field mới không phá các truy vấn cũ; kết hợp được với request-id, trace-id để lần theo request xuyên service.

</details>

**2. Zap `Logger` và `SugaredLogger` khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`*zap.Logger` dùng field có kiểu (`zap.String`, `zap.Int`...), kiểm tra lúc biên dịch và gần như không cấp phát bộ nhớ — dùng cho đường xử lý nóng hoặc thư viện. `*zap.SugaredLogger` (lấy bằng `logger.Sugar()`) nhận key-value lỏng (`Infow`) hoặc định dạng printf (`Infof`), tiện hơn nhưng chậm hơn và chỉ phát hiện sai cặp key-value lúc chạy. Chuyển qua lại bằng `Sugar()` và `Desugar()`.

</details>

**3. Vì sao zerolog nhanh? Bẫy lớn nhất khi dùng là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Zerolog ghi JSON trực tiếp vào byte buffer lấy từ `sync.Pool`, không qua `map` hay `interface{}`, không reflection với field có kiểu; event dưới level bị tắt trả về nil nên các lời gọi `.Str()...` gần như không tốn gì. Kết quả là gần như zero-allocation. Bẫy lớn nhất: phải kết thúc bằng `.Msg()`, `.Msgf()` hoặc `.Send()` — quên thì event không bao giờ được ghi và không có lỗi nào báo. Ngoài ra không được giữ lại hay dùng lại `*zerolog.Event` sau khi đã gửi.

</details>

**4. Làm sao để mọi dòng log của một request có cùng request-id?**

<details className="qa">
<summary>Xem đáp án</summary>

Middleware đầu chuỗi lấy `X-Request-ID` từ header (do gateway/load balancer gắn) hoặc tự sinh, đưa vào `context` của request và trả lại trong response header. Sau đó: với slog, viết `Handler` bọc đọc ID từ context và thêm vào record, mọi nơi log bằng `InfoContext(ctx, ...)`; với zap/zerolog, tạo logger con có field `request_id` rồi đặt logger đó vào context, các tầng dưới lấy logger từ ctx. Điều kiện tiên quyết là truyền `ctx` xuyên suốt từ handler xuống service, repository. Khi có tracing, log thêm `trace_id`.

</details>

**5. Chọn log level cho production thế nào và làm sao bật debug khi cần?**

<details className="qa">
<summary>Xem đáp án</summary>

Production thường ở `INFO` (hoặc `WARN` cho service rất nhiều traffic) để giảm chi phí lưu trữ và nhiễu; `DEBUG` chỉ bật ở dev. Level nên đọc từ biến môi trường (`LOG_LEVEL`) chứ không hardcode. Để bật debug khi điều tra mà không deploy lại, dùng level động: `slog.LevelVar`, `zap.AtomicLevel` (có sẵn `http.Handler` để đổi qua endpoint nội bộ), hoặc `zerolog.SetGlobalLevel`, rồi trả về level cũ sau khi điều tra xong.

</details>

**6. Làm sao ngăn dữ liệu nhạy cảm lọt vào log?**

<details className="qa">
<summary>Xem đáp án</summary>

Kết hợp nhiều lớp: (1) quy ước không log request body, header `Authorization`, struct chứa secret; (2) cho kiểu dữ liệu nhạy cảm tự che khi log — `slog.LogValuer`, `zapcore.ObjectMarshaler`, `zerolog.LogObjectMarshaler`, hoặc implement `String()` trả `***`; (3) chốt chặn ở handler như `ReplaceAttr` của slog che theo tên key (`password`, `token`...); (4) review code và quét log định kỳ; (5) giới hạn quyền truy cập và thời gian lưu log.

</details>
