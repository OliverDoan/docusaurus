---
sidebar_position: 3
title: "3. time và flag"
---

# time và flag

Thời gian là nguồn bug kinh điển: lệch múi giờ, parse sai định dạng, đo thời gian chạy bị sai khi đồng hồ hệ thống bị chỉnh. Package `time` của Go giải quyết những điều này khá gọn, nhưng có một điểm "lạ" phải học thuộc: định dạng ngày giờ dùng **một thời điểm mẫu** `2006-01-02 15:04:05` thay vì `yyyy-MM-dd`. Nửa sau bài nói về package `flag` — cách chuẩn để đọc tham số dòng lệnh, đủ dùng cho phần lớn công cụ CLI nhỏ và cả các lệnh con (subcommand).

---

:::note[Ghi nhớ nhanh]

- ⭐ **Layout tham chiếu là `Mon Jan 2 15:04:05 MST 2006`** (dễ nhớ: 1 2 3 4 5 6 7 — tháng 1, ngày 2, 3 giờ chiều, 4 phút, 5 giây, năm 06, múi giờ -7). Viết `"2006-01-02"` chứ không phải `"yyyy-MM-dd"`.
- ⭐ **`time.Parse` không có múi giờ trong chuỗi thì mặc định UTC** — giờ địa phương phải dùng `time.ParseInLocation` với `time.LoadLocation("Asia/Ho_Chi_Minh")`.
- **So sánh thời điểm bằng `t1.Equal(t2)`**, không dùng `==` (khác múi giờ hoặc có monotonic clock sẽ sai).
- **Đo thời gian chạy bằng `time.Since(start)`** — dùng monotonic clock nên không bị ảnh hưởng khi đồng hồ hệ thống bị chỉnh.
- **Ticker phải `Stop()`**; Go 1.23+ timer/ticker không còn tham chiếu sẽ được GC thu hồi kể cả khi quên `Stop`.
- **`flag` dừng parse ở tham số không phải cờ đầu tiên** — `app file -v` thì `-v` bị coi là tham số thường.

:::

---

## Mục lục

- [Vì sao cần package time?](#vì-sao-cần-package-time)
- [time.Time và time.Duration](#timetime-và-timeduration)
- [Format và Parse với layout tham chiếu](#format-và-parse-với-layout-tham-chiếu)
- [Múi giờ](#múi-giờ)
- [Monotonic clock và đo thời gian](#monotonic-clock-và-đo-thời-gian)
- [Timer và Ticker](#timer-và-ticker)
- [Package flag](#package-flag)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao cần package time?

**Vấn đề:** Biểu diễn thời gian bằng số nguyên hoặc chuỗi tự chế dẫn tới đủ loại lỗi:

```go
// Timeout là "5" — 5 giây? 5 mili giây? 5 phút? Không ai biết
func Connect(addr string, timeout int) error { /* ... */ }

Connect("db:5432", 5000) // người gọi tưởng là ms, hàm hiểu là giây → chờ 83 phút

// Lưu "15/10/2026 09:00" — giờ Việt Nam hay giờ UTC? Server đặt ở Singapore đọc ra sao?
createdAt := "15/10/2026 09:00"
```

**Giải pháp:** Dùng kiểu có ngữ nghĩa — `time.Duration` cho khoảng thời gian, `time.Time` cho thời điểm (luôn gắn múi giờ):

```go
func Connect(addr string, timeout time.Duration) error { /* ... */ }

Connect("db:5432", 5*time.Second) // không thể hiểu nhầm

loc, _ := time.LoadLocation("Asia/Ho_Chi_Minh")
createdAt := time.Date(2026, time.October, 15, 9, 0, 0, 0, loc)
fmt.Println(createdAt.UTC()) // 2026-10-15 02:00:00 +0000 UTC — rõ ràng tuyệt đối
```

:::tip[Dùng thực tế]

- **Timeout và retry**: `context.WithTimeout(ctx, 3*time.Second)`, backoff `time.Sleep(backoff)`.
- **Lưu DB và trao đổi API**: lưu UTC, trả JSON dạng RFC 3339 (`time.Time` marshal sẵn như vậy), chỉ đổi sang giờ địa phương khi hiển thị.
- **Đo hiệu năng**: `start := time.Now()` ... `slog.Info("xong", "took", time.Since(start))`.
- **Tác vụ định kỳ**: `time.Ticker` dọn cache mỗi phút, gửi heartbeat mỗi 10 giây.

:::

:::tip[Ví dụ đời thường]

`time.Time` giống **vé máy bay ghi giờ kèm múi giờ**: "khởi hành 09:00 giờ Hà Nội" thì ai ở đâu cũng quy đổi được. Một chuỗi "09:00" trần giống tờ giấy nhắn "gặp lúc 9 giờ" — người ở Sài Gòn và người ở Tokyo sẽ đến lệch nhau 2 tiếng. Còn monotonic clock giống **đồng hồ bấm giờ của trọng tài**: dù ai đó chỉnh lại đồng hồ treo tường giữa trận, thời gian thi đấu vẫn đo đúng.

:::

---

## time.Time và time.Duration

### Tạo thời điểm

```go
now := time.Now()                                                   // giờ hiện tại, múi giờ máy
t := time.Date(2026, time.October, 15, 9, 30, 0, 0, time.UTC)       // năm, tháng, ngày, giờ, phút, giây, nano, múi giờ
u := time.Unix(1760520600, 0)                                       // từ Unix timestamp (giây)
var zero time.Time                                                  // zero value: 0001-01-01 00:00:00 UTC
zero.IsZero()                                                       // true — dùng để kiểm tra "chưa gán"
```

### Duration

`time.Duration` thực chất là `int64` đếm **nano giây**, kèm các hằng số đơn vị:

```go
d := 90 * time.Minute
fmt.Println(d)           // 1h30m0s
fmt.Println(d.Hours())   // 1.5

dd, err := time.ParseDuration("1h15m30s") // đơn vị hợp lệ: ns, us, ms, s, m, h

n := 5
timeout := time.Duration(n) * time.Second // biến int phải ép kiểu trước khi nhân
```

:::warning[Lỗi hay gặp với Duration]

- `time.Sleep(5)` là ngủ **5 nano giây**, không phải 5 giây.
- `n * time.Second` với `n int` không biên dịch được (khác kiểu) — phải viết `time.Duration(n) * time.Second`.
- Không có đơn vị "ngày" (`d`) trong `ParseDuration`, vì một ngày không phải lúc nào cũng 24 giờ (chuyển giờ mùa hè). Dùng `AddDate` cho ngày/tháng/năm.

:::

### Tính toán

| Thao tác | Code | Kết quả trả về |
|----------|------|----------------|
| Cộng khoảng thời gian | `t.Add(48 * time.Hour)` | `time.Time` |
| Cộng ngày/tháng/năm | `t.AddDate(0, 1, 0)` | `time.Time` |
| Hiệu hai thời điểm | `t2.Sub(t1)` | `time.Duration` |
| So sánh | `t1.Before(t2)`, `After`, `Equal`, `t1.Compare(t2)` (Go 1.20) | `bool` / `int` |
| Làm tròn | `t.Truncate(time.Hour)`, `t.Round(time.Minute)` | `time.Time` |
| Thành phần | `t.Year()`, `t.Month()`, `t.Day()`, `t.Weekday()`, `t.YearDay()` | số / enum |
| Unix | `t.Unix()`, `t.UnixMilli()` | `int64` |

```go
jan31 := time.Date(2026, 1, 31, 0, 0, 0, 0, time.UTC)
fmt.Println(jan31.AddDate(0, 1, 0)) // 2026-03-03 — "31/02" bị chuẩn hoá thành 03/03!
```

`AddDate` chuẩn hoá ngày tràn chứ không "kẹp" về cuối tháng. Logic thanh toán theo tháng cần tự xử lý trường hợp này.

---

## Format và Parse với layout tham chiếu

Go không dùng ký hiệu `yyyy-MM-dd`. Thay vào đó, bạn viết **chính thời điểm mẫu** `Mon Jan 2 15:04:05 MST 2006` theo định dạng mong muốn:

| Thành phần | Ký hiệu | Ví dụ |
|------------|---------|-------|
| Năm | `2006` / `06` | 2026 / 26 |
| Tháng | `01` / `1` / `Jan` / `January` | 10 / 10 / Oct / October |
| Ngày | `02` / `2` / `_2` | 05 / 5 / ␣5 |
| Giờ | `15` (24h) / `03` / `3` (12h) | 09 / 09 / 9 |
| Phút / giây | `04` / `05` | 30 / 00 |
| Phần giây | `.000` / `.999999` | .123 |
| Sáng/chiều | `PM` | AM |
| Thứ | `Mon` / `Monday` | Thu / Thursday |
| Múi giờ | `MST` / `-0700` / `Z07:00` | +07 / +0700 / +07:00 |

```go
t := time.Date(2026, time.October, 15, 9, 30, 0, 0, time.UTC)

t.Format("2006-01-02 15:04:05")      // 2026-10-15 09:30:00
t.Format("02/01/2006")               // 15/10/2026 (kiểu Việt Nam)
t.Format("Mon, 02 Jan 2006 3:04 PM") // Thu, 15 Oct 2026 9:30 AM
t.Format(time.RFC3339)               // 2026-10-15T09:30:00Z
t.Format(time.DateOnly)              // 2026-10-15 (hằng số từ Go 1.20)
```

Các hằng số có sẵn nên dùng thay vì tự viết: `time.RFC3339`, `time.RFC3339Nano`, `time.DateTime` (`"2006-01-02 15:04:05"`), `time.DateOnly`, `time.TimeOnly`, `time.Kitchen`.

### Parse

```go
t, err := time.Parse("02/01/2006", "15/10/2026")
// 2026-10-15 00:00:00 +0000 UTC

_, err = time.Parse("2006-01-02", "2026-13-01")
// parsing time "2026-13-01": month out of range
```

:::warning[Nhầm 01 và 02]

Layout `"2006-02-01"` nghĩa là năm-**ngày**-tháng. Viết nhầm `"2006-01-02"` thành `"2006-02-01"` vẫn biên dịch được và không lỗi với ngày nhỏ hơn 13, nhưng ra ngày sai. Một lỗi khác là viết `"2006-01-02 15:04:05"` thành `"2006-01-02 15:04:00"` — `00` không phải ký hiệu nào, nên giây luôn bị in thành `00`. Hãy dùng hằng số `time.DateTime` khi có thể.

:::

---

## Múi giờ

Mỗi `time.Time` mang theo một `*time.Location`:

```go
loc, err := time.LoadLocation("Asia/Ho_Chi_Minh") // tên theo IANA tz database
if err != nil {
	return err
}

// Chuỗi KHÔNG có múi giờ → Parse coi là UTC, ParseInLocation coi là loc
t, _ := time.ParseInLocation("2006-01-02 15:04", "2026-10-15 09:00", loc)
fmt.Println(t)       // 2026-10-15 09:00:00 +0700 +07
fmt.Println(t.UTC()) // 2026-10-15 02:00:00 +0000 UTC

// Đổi cách HIỂN THỊ sang múi giờ khác — thời điểm không đổi
fmt.Println(time.Now().In(loc))
```

`LoadLocation` đọc tz database của hệ điều hành. Image Docker tối giản (`scratch`, `distroless/static`) không có sẵn dữ liệu này → lỗi `unknown time zone`. Cách khắc phục: `import _ "time/tzdata"` để nhúng dữ liệu múi giờ vào binary (thêm khoảng 450KB), hoặc build với `-tags timetzdata`.

### So sánh: dùng Equal, không dùng ==

```go
a := time.Date(2026, 10, 15, 9, 0, 0, 0, loc)
b := a.UTC()
fmt.Println(a == b)      // false — cùng thời điểm nhưng khác Location
fmt.Println(a.Equal(b))  // true
```

`==` so sánh cả trường location và monotonic clock bên trong struct. Vì cùng lý do, **đừng dùng `time.Time` làm key của map** khi giá trị có thể ở các múi giờ khác nhau — chuẩn hoá về `UTC()` hoặc dùng `Unix()` làm key.

**Nguyên tắc thực tế:** lưu và truyền UTC (hoặc RFC 3339 có offset), chỉ `In(loc)` ở tầng hiển thị cho người dùng.

---

## Monotonic clock và đo thời gian

Máy tính có hai loại đồng hồ:

- **Wall clock** (đồng hồ treo tường): giờ thực, có thể nhảy lùi/tiến khi NTP đồng bộ hay quản trị viên chỉnh giờ.
- **Monotonic clock** (đồng hồ đơn điệu): chỉ tăng, dùng để đo khoảng thời gian.

`time.Now()` (Go 1.9+) chứa **cả hai**. Khi trừ hai giá trị cùng có monotonic (`Sub`, `Since`, `Until`), Go dùng monotonic → kết quả luôn đúng dù đồng hồ hệ thống bị chỉnh giữa chừng:

```go
start := time.Now()
doWork()
elapsed := time.Since(start) // == time.Now().Sub(start), dùng monotonic
slog.Info("xử lý xong", "took", elapsed)
```

Khi in `time.Now()` sẽ thấy đuôi `m=+0.000012345` — đó là phần monotonic. Các thao tác như `t.UTC()`, `t.In(loc)`, `t.Round(0)`, hoặc parse/unmarshal đều **bỏ** phần monotonic, vì nó chỉ có ý nghĩa trong tiến trình hiện tại.

---

## Timer và Ticker

### Timer — chạy một lần sau khoảng thời gian

```go
timer := time.NewTimer(2 * time.Second)
select {
case <-timer.C:
	fmt.Println("hết giờ")
case res := <-resultCh:
	timer.Stop() // có kết quả trước → huỷ timer
	fmt.Println(res)
}

// Gọn hơn khi không cần huỷ
select {
case res := <-resultCh:
	fmt.Println(res)
case <-time.After(2 * time.Second):
	fmt.Println("timeout")
}

// Chạy hàm sau một khoảng thời gian, trong goroutine riêng
t := time.AfterFunc(5*time.Minute, func() { cache.Clear() })
```

### Ticker — lặp đều đặn

```go
func runCleanup(ctx context.Context) {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop() // luôn dừng ticker khi không dùng nữa

	for {
		select {
		case <-ticker.C:
			cleanupExpiredSessions()
		case <-ctx.Done():
			return // dừng khi service shutdown
		}
	}
}
```

Nếu xử lý chậm hơn chu kỳ, ticker **bỏ bớt** tick (channel chỉ chứa tối đa một tick chờ) chứ không dồn lại.

:::warning[Thay đổi ở Go 1.23]

Trước Go 1.23: timer/ticker chưa `Stop()` sẽ không được GC thu hồi; `time.After` trong vòng lặp `select` chạy liên tục gây rò rỉ bộ nhớ đến khi hết hạn; và `Reset` sau `Stop` có thể nhận nhầm giá trị cũ còn trong channel (phải "xả" channel bằng mẹo `if !t.Stop() { <-t.C }`).

Từ Go 1.23 (với module khai báo `go 1.23` trở lên trong `go.mod`): timer không còn tham chiếu được GC ngay cả khi chưa `Stop`; channel của timer không còn buffer, nên sau `Stop`/`Reset` sẽ không nhận giá trị cũ. Dù vậy, `defer ticker.Stop()` vẫn là thói quen tốt để giải phóng sớm và thể hiện ý đồ.

:::

`time.Tick(d)` trả thẳng channel, tiện cho vòng lặp chạy suốt đời chương trình; không dừng được nên đừng dùng trong hàm được gọi nhiều lần.

---

## Package flag

Package `flag` đọc các cờ dòng lệnh dạng `-name=value`, `-name value`, hoặc `--name` (một hay hai gạch đều được).

### Cơ bản

```go
func main() {
	port := flag.Int("port", 8080, "cổng lắng nghe")            // trả về *int
	verbose := flag.Bool("v", false, "log chi tiết")
	timeout := flag.Duration("timeout", 5*time.Second, "timeout") // nhận "2s", "1m30s"

	var host string
	flag.StringVar(&host, "host", "localhost", "địa chỉ bind") // gán vào biến có sẵn

	flag.Parse() // BẮT BUỘC gọi trước khi đọc giá trị

	fmt.Println(*port, host, *verbose, *timeout)
	fmt.Println(flag.Args()) // tham số còn lại không phải cờ
}
```

```bash
go run . -port=9090 -v --host 0.0.0.0 -timeout 2s file1 file2
# 9090 0.0.0.0 true 2s
# [file1 file2]

go run . -h   # tự in hướng dẫn từ các mô tả đã khai báo
```

Lưu ý quy tắc dừng: `flag` ngừng parse tại tham số **không phải cờ** đầu tiên (hoặc tại `--`). `app file1 -v` thì `-v` nằm trong `flag.Args()` chứ không được hiểu là cờ. Cờ bool phải viết `-v=false` để tắt, `-v false` sẽ hiểu `false` là tham số thường.

### Kiểu tuỳ biến với flag.Var

Hiện thực interface `flag.Value` (`String() string` và `Set(string) error`) để có cờ kiểu riêng — ví dụ cờ lặp lại nhiều lần:

```go
type listFlag []string

func (l *listFlag) String() string     { return strings.Join(*l, ",") }
func (l *listFlag) Set(v string) error { *l = append(*l, v); return nil }

var tags listFlag
flag.Var(&tags, "tag", "gắn tag (lặp lại được)")
// app -tag api -tag v2  →  tags = [api v2]
```

Nhiều kiểu chuẩn đã hiện thực `encoding.TextUnmarshaler` — dùng `flag.TextVar` (Go 1.19) để đọc thẳng, ví dụ `net.IP` hay `slog.Level`.

### Usage tuỳ biến

```go
flag.Usage = func() {
	fmt.Fprintf(flag.CommandLine.Output(), "Cách dùng: %s [tuỳ chọn] <file>...\n", os.Args[0])
	flag.PrintDefaults() // in danh sách cờ và giá trị mặc định
}
```

### FlagSet cho subcommand

Công cụ kiểu `git commit -m`, `docker run -d` có **lệnh con**, mỗi lệnh một bộ cờ riêng. Mỗi bộ là một `flag.FlagSet`:

```go
func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "cách dùng: todo <add|list> [tuỳ chọn]")
		os.Exit(2)
	}

	switch os.Args[1] {
	case "add":
		addCmd := flag.NewFlagSet("add", flag.ExitOnError)
		priority := addCmd.Int("p", 1, "độ ưu tiên (1-3)")
		addCmd.Parse(os.Args[2:]) // parse phần sau tên lệnh con
		if addCmd.NArg() == 0 {
			fmt.Fprintln(os.Stderr, "thiếu nội dung công việc")
			os.Exit(2)
		}
		fmt.Printf("thêm %q, ưu tiên %d\n", addCmd.Arg(0), *priority)
	case "list":
		listCmd := flag.NewFlagSet("list", flag.ExitOnError)
		all := listCmd.Bool("all", false, "hiện cả việc đã xong")
		listCmd.Parse(os.Args[2:])
		fmt.Println("liệt kê, all =", *all)
	default:
		fmt.Fprintf(os.Stderr, "lệnh không hỗ trợ: %s\n", os.Args[1])
		os.Exit(2)
	}
}
```

```bash
go run . add -p 3 "Mua cà phê"   # thêm "Mua cà phê", ưu tiên 3
go run . list -all               # liệt kê, all = true
```

| Chế độ lỗi | Khi parse sai |
|------------|---------------|
| `flag.ExitOnError` | In lỗi + usage, `os.Exit(2)` (riêng `-h` thì thoát mã 0) |
| `flag.ContinueOnError` | Trả `error` cho bạn tự xử lý — **dùng khi viết test** |
| `flag.PanicOnError` | `panic` |

`FlagSet` với `ContinueOnError` còn giúp test logic parse cờ mà không đụng `os.Args` toàn cục: `fs.Parse([]string{"-port=9090"})`.

### Khi nào cần thư viện ngoài?

`flag` không hỗ trợ cờ ngắn/dài kiểu POSIX (`-v`/`--verbose` gộp `-abc`), tự động đọc biến môi trường, hay cây lệnh con nhiều tầng có help đẹp. CLI lớn thường dùng `github.com/spf13/cobra` (kubectl, gh, hugo dùng) kết hợp `spf13/pflag`, hoặc `github.com/urfave/cli`.

---

## Câu hỏi phỏng vấn

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
