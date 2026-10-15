---
sidebar_position: 10
title: "10. Thư viện chuẩn"
---

# 10. Thư viện chuẩn

## 1. I/O và xử lý file

Bài học: [1. I/O và xử lý file](../../golang/10-thu-vien-chuan/1_io-file.md)

**1. `io.Reader` và `io.Writer` là gì? Vì sao chúng quan trọng trong Go?**

<details className="qa">
<summary>Xem đáp án</summary>

Là hai interface một method: `Read(p []byte) (n int, err error)` và `Write(p []byte) (n int, err error)`. Vì interface trong Go là ngầm định và rất nhỏ, hàng trăm kiểu trong thư viện chuẩn hiện thực chúng (file, socket, HTTP body, buffer, gzip, hash, cipher...). Hàm viết theo `io.Reader`/`io.Writer` dùng lại được cho mọi nguồn/đích, ghép nối được (`io.Copy`, `TeeReader`, `MultiWriter`) và dễ test bằng `strings.NewReader`/`bytes.Buffer`. Đây là ví dụ kinh điển cho triết lý "interface nhỏ, kết hợp mạnh".

</details>

**2. Khi đọc bằng `Read`, xử lý `n` và `err` theo thứ tự nào? `io.EOF` có phải lỗi không?**

<details className="qa">
<summary>Xem đáp án</summary>

`Read` có thể trả về đồng thời `n > 0` và `err != nil` (kể cả `io.EOF`), nên phải xử lý `p[:n]` **trước**, rồi mới xét `err`. `io.EOF` là tín hiệu "hết dữ liệu", không phải lỗi thật — các hàm như `io.ReadAll`, `io.Copy` coi nó là kết thúc bình thường và trả `nil`. `Read` cũng có thể trả `n < len(p)` mà chưa hết dữ liệu, nên muốn đọc đủ số byte thì dùng `io.ReadFull`.

</details>

**3. Vì sao `defer f.Close()` có thể gây mất lỗi khi ghi file? Sửa thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Dữ liệu ghi có thể còn trong buffer của hệ điều hành; lỗi như đĩa đầy hay mất kết nối ổ mạng chỉ lộ ra ở `Close`. `defer f.Close()` bỏ qua giá trị trả về nên hàm báo thành công dù file hỏng. Cách sửa: dùng named return `err` và trong `defer` gán `err = cerr` nếu `Close` lỗi và trước đó chưa có lỗi. Với `bufio.Writer` còn phải kiểm tra lỗi `Flush()`. Dữ liệu quan trọng thì `Sync()` rồi ghi file tạm + `os.Rename` để đảm bảo nguyên tử.

</details>

**4. Đọc một file log 20GB để lọc dòng lỗi, bạn làm thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không dùng `os.ReadFile` (nạp 20GB vào RAM). Mở bằng `os.Open`, dùng `bufio.Scanner` đọc từng dòng — bộ nhớ chỉ tốn vài KB. Lưu ý tăng giới hạn bằng `sc.Buffer(...)` nếu có dòng dài hơn 64KB và **luôn kiểm tra `sc.Err()`** sau vòng lặp. Nếu cần nhanh hơn có thể chia file theo offset và đọc song song bằng `ReadAt`/`io.NewSectionReader`, cẩn thận cắt đúng ranh giới dòng.

</details>

**5. `filepath` khác `path` thế nào? `io/fs` dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`path/filepath` xử lý đường dẫn theo hệ điều hành (dấu `\` trên Windows) — dùng cho file trên đĩa. `path` luôn dùng `/` — dùng cho URL và đường dẫn bên trong `fs.FS`. `io/fs` định nghĩa interface `fs.FS` là filesystem chỉ đọc trừu tượng; nhờ đó cùng một code có thể đọc thư mục thật (`os.DirFS`), file nhúng (`embed.FS`), file zip, hoặc `fstest.MapFS` trong test.

</details>

**6. `bufio.Writer` có rủi ro gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Dữ liệu nằm trong bộ đệm cho tới khi đầy hoặc gọi `Flush()`. Quên `Flush()` (hoặc `os.Exit` trước khi flush) sẽ mất phần dữ liệu cuối mà không có lỗi nào. Ngoài ra lỗi ghi có thể chỉ xuất hiện khi flush, nên phải kiểm tra lỗi trả về của `Flush()`. `bufio.Writer` cũng không an toàn khi dùng đồng thời từ nhiều goroutine nếu không có khoá.

</details>

---

## 2. encoding/json

Bài học: [2. encoding/json](../../golang/10-thu-vien-chuan/2_json.md)

**1. Vì sao một field trong struct không xuất hiện trong JSON sau khi marshal?**

<details className="qa">
<summary>Xem đáp án</summary>

Các nguyên nhân thường gặp: (1) field **unexported** (chữ thường đầu) — `encoding/json` ở package khác nên không truy cập được qua reflection, và không báo lỗi; (2) tag `json:"-"`; (3) có `omitempty`/`omitzero` và giá trị đang rỗng/zero; (4) kiểu có `MarshalJSON` tự viết không xuất trường đó; (5) field embedded bị trùng tên với field khác cùng cấp nên bị loại.

</details>

**2. Unmarshal JSON vào `map[string]any` thì số có kiểu gì? Có vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Mọi number thành `float64`. Vấn đề: (1) phải type assertion `m["id"].(float64)` rồi ép kiểu, dễ panic; (2) số nguyên lớn hơn 2^53 bị làm tròn — ID 64-bit bị sai. Cách xử lý: decode vào struct với kiểu cụ thể (`int64`), hoặc dùng `json.NewDecoder` + `UseNumber()` để nhận `json.Number` rồi gọi `.Int64()`. Khi gửi ID lớn cho JavaScript, dùng tag `,string`.

</details>

**3. `omitempty` khác `omitzero` thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`omitempty` bỏ trường khi giá trị là `false`, `0`, `""`, `nil`, hoặc slice/map/array độ dài 0 — nhưng **không bao giờ** bỏ struct (kể cả `time.Time` zero). `omitzero` (Go 1.24) bỏ trường khi giá trị là zero value của kiểu, và nếu kiểu có method `IsZero() bool` thì dùng method đó — nên `time.Time{}` bị bỏ đúng ý. `omitzero` cũng phân biệt slice `nil` (bỏ) với slice rỗng không nil (giữ `[]`). Hai tag có thể dùng cùng nhau: trường bị bỏ nếu thoả một trong hai.

</details>

**4. Khi nào dùng `json.Unmarshal`, khi nào dùng `json.NewDecoder`?**

<details className="qa">
<summary>Xem đáp án</summary>

`Unmarshal` khi đã có sẵn `[]byte` (đọc từ cache, file nhỏ) — nó kiểm tra cả dữ liệu thừa phía sau. `NewDecoder` khi dữ liệu đến từ `io.Reader` (HTTP body, file lớn, socket), cần đọc nhiều giá trị liên tiếp (NDJSON), cần stream mảng lớn bằng `Token`/`More`, hoặc cần các tuỳ chọn `DisallowUnknownFields`/`UseNumber`. Lưu ý decoder không báo lỗi với dữ liệu rác sau giá trị đầu tiên và có thể đọc trước nhiều hơn mức cần.

</details>

**5. Làm sao xử lý message có cấu trúc `payload` thay đổi theo trường `type`?**

<details className="qa">
<summary>Xem đáp án</summary>

Khai báo `Payload json.RawMessage` để giữ nguyên byte, unmarshal lần một để đọc `Type`, sau đó `switch` theo `Type` và unmarshal `Payload` vào struct tương ứng. Cách khác là tự viết `UnmarshalJSON` cho kiểu event để đóng gói logic này. Tránh decode vào `map[string]any` rồi chuyển đổi thủ công vì mất kiểu và dễ lỗi.

</details>

**6. Viết `MarshalJSON` cho một struct mà vẫn muốn giữ cách mã hoá mặc định cho các trường khác thì làm thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không gọi `json.Marshal(u)` trực tiếp trong method vì sẽ đệ quy vô hạn. Khai báo kiểu cục bộ `type alias User` — kiểu mới có cùng field nhưng không có method — rồi marshal một struct ẩn danh embed `alias` cộng thêm các trường mới hoặc trường ghi đè. Tương tự cho `UnmarshalJSON`: decode vào `*alias` để dùng logic mặc định rồi xử lý thêm.

</details>

---

## 3. time và flag

Bài học: [3. time và flag](../../golang/10-thu-vien-chuan/3_time-flag.md)

**1. Vì sao Go dùng `2006-01-02 15:04:05` để định dạng thời gian?**

<details className="qa">
<summary>Xem đáp án</summary>

Go chọn một thời điểm tham chiếu cố định `Mon Jan 2 15:04:05 MST 2006` — các thành phần tương ứng với dãy 1 (tháng), 2 (ngày), 3 (giờ, dạng 15), 4 (phút), 5 (giây), 6 (năm), -7 (múi giờ). Layout là "thời điểm đó được viết theo định dạng bạn muốn", nên đọc layout là thấy ngay kết quả. Nhược điểm là phải nhớ con số, và viết nhầm (vd `2006-02-01`) vẫn biên dịch được. Nên dùng các hằng `time.RFC3339`, `time.DateTime`, `time.DateOnly`.

</details>

**2. `time.Parse("2006-01-02 15:04", "2026-10-15 09:00")` cho ra thời điểm múi giờ nào? Muốn hiểu là giờ Việt Nam thì làm sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Chuỗi không chứa thông tin múi giờ nên `time.Parse` coi là **UTC** — tức 16:00 giờ Việt Nam, lệch 7 tiếng. Muốn hiểu là giờ địa phương thì dùng `loc, _ := time.LoadLocation("Asia/Ho_Chi_Minh")` rồi `time.ParseInLocation(layout, s, loc)`. Trong container tối giản cần `import _ "time/tzdata"` để `LoadLocation` không lỗi.

</details>

**3. Vì sao không nên so sánh `time.Time` bằng `==`?**

<details className="qa">
<summary>Xem đáp án</summary>

`time.Time` là struct chứa wall time, monotonic reading và con trỏ `*Location`. `==` so sánh tất cả các trường, nên cùng một thời điểm nhưng khác múi giờ (`t` và `t.UTC()`), hoặc một bên có monotonic một bên không, sẽ cho `false`. Dùng `t1.Equal(t2)` (hoặc `Before`/`After`/`Compare`) để so sánh theo thời điểm thực. Cũng vì vậy, tránh dùng `time.Time` làm key map nếu chưa chuẩn hoá.

</details>

**4. Monotonic clock là gì, vì sao `time.Since` dùng nó?**

<details className="qa">
<summary>Xem đáp án</summary>

Wall clock có thể nhảy khi NTP đồng bộ hoặc người dùng chỉnh giờ; đo thời gian bằng nó có thể ra số âm hoặc sai lớn. Monotonic clock chỉ tăng đều, không bị chỉnh. Từ Go 1.9, `time.Now()` lưu cả hai và `Sub`/`Since`/`Until` dùng phần monotonic khi cả hai giá trị đều có. Phần monotonic bị bỏ khi gọi `UTC()`, `In()`, `Round(0)` hoặc khi serialize, vì nó chỉ có nghĩa trong tiến trình hiện tại.

</details>

**5. Dùng `time.After` trong vòng lặp `select` có vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi lần lặp tạo một timer mới. Trước Go 1.23, timer chỉ được thu hồi sau khi hết hạn, nên vòng lặp chạy nhanh với timeout dài sẽ tích tụ rất nhiều timer, gây tốn bộ nhớ. Từ Go 1.23 (module khai báo `go 1.23`+), timer không còn tham chiếu được GC ngay nên vấn đề bộ nhớ không còn. Tuy vậy, về logic, timeout bị "đặt lại" sau mỗi lần lặp — nếu muốn timeout cho toàn bộ vòng lặp, tạo một timer/`context.WithTimeout` bên ngoài vòng lặp.

</details>

**6. Viết CLI có lệnh con bằng thư viện chuẩn thế nào? Khi nào nên dùng cobra?**

<details className="qa">
<summary>Xem đáp án</summary>

Đọc `os.Args[1]` làm tên lệnh con, mỗi lệnh tạo một `flag.NewFlagSet(name, flag.ExitOnError)` riêng với các cờ của nó, rồi `fs.Parse(os.Args[2:])`; tham số còn lại lấy qua `fs.Args()`. Cách này đủ cho tool nhỏ, không phụ thuộc thư viện ngoài. Khi CLI có nhiều tầng lệnh, cần cờ POSIX (`-v`/`--verbose`), tự sinh help/completion cho shell, đọc config/biến môi trường, thì dùng `cobra` (+`viper`).

</details>

---

## 4. slog, regexp và embed

Bài học: [4. slog, regexp và embed](../../golang/10-thu-vien-chuan/4_slog-regexp-embed.md)

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
