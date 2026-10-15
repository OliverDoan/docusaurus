---
sidebar_position: 4
title: "4. Benchmark, Fuzzing và Coverage"
---

# Benchmark, Fuzzing và Coverage

Ngoài unit test, package `testing` còn ba công cụ quan trọng mà nhiều ngôn ngữ khác phải cài thêm thư viện: **benchmark** đo tốc độ và số lần cấp phát bộ nhớ, **fuzzing** (Go 1.18) tự sinh hàng triệu đầu vào ngẫu nhiên để tìm bug mà bạn không nghĩ tới, và **coverage** đo phần trăm code được test chạy qua — kể cả với binary chạy thật trong integration test (Go 1.20). Bài này còn giới thiệu **example test** — đoạn code vừa là tài liệu trên pkg.go.dev, vừa được `go test` kiểm tra đúng output.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Benchmark viết `for b.Loop() { ... }` (Go 1.24)** thay cho `for i := 0; i < b.N; i++` — tự loại setup khỏi phép đo và chống compiler tối ưu mất lời gọi.
- ⭐ **Chạy benchmark với `-benchmem` và so sánh bằng `benchstat`** trên nhiều lần chạy (`-count=10`) — một lần chạy đơn lẻ có nhiễu, không đủ kết luận.
- **Fuzz test `FuzzXxx(f *testing.F)`**: thêm seed bằng `f.Add`, kiểm tra **tính chất** (property) trong `f.Fuzz`; chạy với `go test -fuzz=FuzzXxx`; input gây lỗi được lưu vào `testdata/fuzz/` và trở thành test hồi quy.
- **Coverage**: `go test -cover`, `-coverprofile=c.out`, `go tool cover -html=c.out`; coverage cao không có nghĩa là test tốt.
- **Example test `ExampleXxx`** có comment `// Output:` được chạy và so khớp output — tài liệu không bao giờ lỗi thời.

:::

---

## Mục lục

- [Vì sao cần benchmark, fuzzing và coverage?](#vì-sao-cần-benchmark-fuzzing-và-coverage)
- [Benchmark](#benchmark)
- [So sánh kết quả với benchstat](#so-sánh-kết-quả-với-benchstat)
- [Fuzzing](#fuzzing)
- [Coverage](#coverage)
- [Example test](#example-test)

---

## Vì sao cần benchmark, fuzzing và coverage?

**Vấn đề:** Unit test trả lời "code có đúng với các case tôi nghĩ ra không". Còn ba câu hỏi nó không trả lời được:

```go
// 1. Cách nào nhanh hơn? Đoán mò hoặc đo bằng time.Now() thủ công — kết quả nhiễu, không tin được
start := time.Now()
ConcatPlus(parts)
fmt.Println(time.Since(start)) // 2µs? lần sau 5µs? CPU đang bận việc khác?

// 2. Có input nào làm hàm panic không? Tôi chỉ nghĩ ra "hello" và "" để test
func TestReverse(t *testing.T) { /* "hello", "" — còn emoji, byte rác thì sao? */ }

// 3. Test hiện có đã chạy qua nhánh xử lý lỗi chưa? Không ai biết
```

**Giải pháp:** Ba công cụ có sẵn trong `go test`:

```bash
go test -bench=. -benchmem          # đo tốc độ + bộ nhớ, lặp đủ nhiều lần cho ổn định
go test -fuzz=FuzzReverse           # sinh input ngẫu nhiên tới khi tìm ra bug
go test -coverprofile=c.out && go tool cover -html=c.out   # tô màu dòng chưa được test
```

:::tip[Dùng thực tế]

- **Benchmark trước khi tối ưu**: chứng minh bằng số rằng `strings.Builder` nhanh hơn `+=`, `sync.Pool` có giảm cấp phát hay không.
- **Chặn regression hiệu năng** trong CI: so sánh benchmark của PR với nhánh chính bằng `benchstat`.
- **Fuzz parser và decoder**: hàm đọc dữ liệu từ bên ngoài (JSON, CSV, protocol nhị phân, URL) — nơi input bất thường gây panic hoặc lỗ hổng bảo mật.
- **Coverage tìm vùng mù**: nhánh xử lý lỗi chưa từng được chạy trong test.

:::

:::tip[Ví dụ đời thường]

Benchmark giống **bấm giờ chạy 100 mét** — phải chạy nhiều lần, cùng điều kiện sân bãi mới so sánh được hai vận động viên. Fuzzing giống **cho trẻ con nghịch thử đồ chơi** trước khi bán: chúng bấm, vặn, ném theo những cách nhà sản xuất không bao giờ nghĩ tới — hỏng ở đâu là biết ngay. Coverage giống **bản đồ đánh dấu những căn phòng bảo vệ đã đi tuần**: phòng nào chưa có dấu là phòng chưa ai kiểm tra — nhưng đi qua phòng chưa chắc đã kiểm tra kỹ.

:::

---

## Benchmark

### Viết benchmark

Hàm benchmark nằm trong file `_test.go`, tên `BenchmarkXxx`, nhận `*testing.B`:

```go
func ConcatPlus(parts []string) string {
	s := ""
	for _, p := range parts {
		s += p // mỗi lần cộng tạo chuỗi mới, chép lại toàn bộ
	}
	return s
}

func ConcatBuilder(parts []string) string {
	var b strings.Builder
	for _, p := range parts {
		b.WriteString(p)
	}
	return b.String()
}
```

```go
var parts = strings.Split(strings.Repeat("go,", 100), ",")

func BenchmarkConcatPlus(b *testing.B) {
	for b.Loop() { // Go 1.24+
		ConcatPlus(parts)
	}
}

func BenchmarkConcatBuilder(b *testing.B) {
	b.ReportAllocs() // luôn báo số lần cấp phát cho benchmark này, không cần -benchmem
	for b.Loop() {
		ConcatBuilder(parts)
	}
}
```

### Chạy benchmark

```bash
go test -run='^$' -bench=. -benchmem
# -run='^$'   : không chạy unit test nào (chỉ benchmark)
# -bench=.    : regex chọn benchmark; "." là tất cả
# -benchmem   : báo bộ nhớ cấp phát
```

```text
goos: darwin
goarch: arm64
cpu: Apple M4
BenchmarkConcatPlus-10       	  565836	      2154 ns/op	   10736 B/op	      99 allocs/op
BenchmarkConcatBuilder-10    	 3770143	       318.4 ns/op	     504 B/op	       6 allocs/op
```

| Cột | Ý nghĩa |
|-----|---------|
| `-10` | `GOMAXPROCS` khi chạy |
| `565836` | Số vòng lặp đã chạy để có kết quả ổn định |
| `ns/op` | Thời gian trung bình mỗi lần gọi |
| `B/op` | Số byte cấp phát trên heap mỗi lần gọi |
| `allocs/op` | Số lần cấp phát mỗi lần gọi — thường là chỉ số quan trọng nhất để tối ưu |

`strings.Builder` nhanh hơn khoảng 7 lần và cấp phát ít hơn 16 lần ở ví dụ này. (Số liệu cụ thể phụ thuộc máy.)

Cờ hữu ích khác: `-benchtime=5s` (chạy lâu hơn, mặc định 1s) hoặc `-benchtime=1000x` (đúng 1000 lần), `-count=10` (lặp cả benchmark 10 lần), `-cpu=1,2,4` (thử nhiều `GOMAXPROCS`), `-cpuprofile`/`-memprofile` (xuất profile cho `go tool pprof`).

### b.Loop và vòng b.N kiểu cũ

Trước Go 1.24, benchmark viết theo kiểu `b.N`: framework gọi hàm benchmark **nhiều lần** với `b.N` tăng dần (1, 100, 10000...) tới khi đủ thời gian đo.

```go
var sink string // biến package-level để compiler không loại bỏ lời gọi

func BenchmarkConcatBuilderOld(b *testing.B) {
	data := loadBigFixture() // setup — CHẠY LẠI mỗi lần framework gọi hàm này
	b.ResetTimer()           // phải nhớ reset để không tính thời gian setup
	for i := 0; i < b.N; i++ {
		sink = ConcatBuilder(data) // gán vào sink để kết quả "được dùng"
	}
}
```

| Tiêu chí | `for i := 0; i < b.N; i++` | `for b.Loop()` (Go 1.24) |
|----------|---------------------------|--------------------------|
| Hàm benchmark được gọi | Nhiều lần (mỗi lần một `b.N` khác) | **Một lần** cho mỗi `-count` |
| Setup trước vòng lặp | Chạy lại nhiều lần, phải `b.ResetTimer()` | Chạy một lần, tự loại khỏi phép đo |
| Compiler loại bỏ lời gọi không dùng kết quả (dead code elimination) | Có thể → kết quả 0.3 ns/op ảo | Được ngăn chặn tự động |
| Dọn dẹp sau vòng lặp | Phải `b.StopTimer()` | Tự động không tính |

Code mới nên dùng `b.Loop()`. `b.N` vẫn hoạt động, bạn sẽ gặp nó trong rất nhiều code hiện có. Các method `b.ResetTimer()`, `b.StopTimer()`/`b.StartTimer()` vẫn dùng được khi cần loại một phần việc **bên trong** vòng lặp khỏi phép đo.

### Sub-benchmark theo kích thước đầu vào

```go
func BenchmarkConcat(b *testing.B) {
	for _, n := range []int{10, 100, 1000} {
		ps := strings.Split(strings.Repeat("go,", n), ",")
		b.Run(fmt.Sprintf("n=%d", n), func(b *testing.B) {
			for b.Loop() {
				ConcatBuilder(ps)
			}
		})
	}
}
// BenchmarkConcat/n=10-10      61.94 ns/op
// BenchmarkConcat/n=100-10     409.4 ns/op
// BenchmarkConcat/n=1000-10    3486 ns/op
```

Nhìn độ tăng giữa các kích thước để biết thuật toán là O(n), O(n log n) hay O(n²). Benchmark song song (đo code dùng chung khoá, cache) dùng `b.RunParallel(func(pb *testing.PB) { for pb.Next() { ... } })`.

:::warning[Benchmark dễ đo sai]

- **Chạy trên laptop đang mở trình duyệt, đang sạc pin/tiết kiệm điện** → nhiễu lớn. Đóng ứng dụng khác, cắm sạc, chạy nhiều lần.
- **Dữ liệu quá nhỏ** nằm trọn trong CPU cache — không phản ánh thực tế với dữ liệu lớn.
- **So sánh hai lần chạy đơn lẻ**: chênh 3% có thể chỉ là nhiễu. Dùng `-count` + `benchstat`.
- **Tối ưu những gì không phải nút thắt**: profile (`pprof`) trước để biết hàm nào thực sự tốn thời gian.

:::

---

## So sánh kết quả với benchstat

`benchstat` (trong `golang.org/x/perf`) tính trung bình, độ dao động và kiểm định thống kê xem khác biệt có ý nghĩa không:

```bash
go install golang.org/x/perf/cmd/benchstat@latest

# Trước khi sửa
go test -run='^$' -bench=Concat -benchmem -count=10 > old.txt
# ... sửa code ...
go test -run='^$' -bench=Concat -benchmem -count=10 > new.txt

benchstat old.txt new.txt
```

```text
# (số liệu minh hoạ)
                │   old.txt    │               new.txt                │
                │    sec/op    │    sec/op     vs base                │
Concat/n=100-10   2.154µ ± 2%   318.4n ± 1%  -85.22% (p=0.000 n=10)

                │   old.txt    │               new.txt                │
                │     B/op     │     B/op      vs base                │
Concat/n=100-10   10.48Ki ± 0%   0.49Ki ± 0%  -95.31% (p=0.000 n=10)
```

- `± 2%`: độ dao động giữa các lần chạy.
- `p=0.000`: xác suất khác biệt là do ngẫu nhiên — nhỏ hơn 0.05 là có ý nghĩa.
- Nếu hiện `~` thay cho phần trăm: **không có khác biệt thống kê** — tối ưu của bạn có thể chẳng tác dụng gì.

---

## Fuzzing

### Ý tưởng

Unit test kiểm tra các ví dụ **bạn** nghĩ ra. Fuzzing (Go 1.18) để **máy** sinh đầu vào: bắt đầu từ vài seed, đột biến chúng (đổi byte, thêm, cắt...), theo dõi coverage để ưu tiên input đi vào nhánh code mới, chạy hàng trăm nghìn lần mỗi giây tới khi tìm ra input làm test fail hoặc panic.

Vì không biết trước output đúng cho input ngẫu nhiên, fuzz test kiểm tra **tính chất** (property) luôn phải đúng:

- Đảo chuỗi hai lần phải ra chuỗi ban đầu.
- Encode rồi decode phải ra dữ liệu ban đầu (round-trip).
- Kết quả phải là UTF-8 hợp lệ / không được panic / độ dài không đổi.
- Hai hiện thực (bản cũ chậm và bản mới tối ưu) phải cho cùng kết quả.

### Viết fuzz test

```go
// Đảo chuỗi theo byte — trông đúng với "hello", nhưng có bug
func ReverseBytes(s string) string {
	b := []byte(s)
	for i, j := 0, len(b)-1; i < j; i, j = i+1, j-1 {
		b[i], b[j] = b[j], b[i]
	}
	return string(b)
}

func FuzzReverseBytes(f *testing.F) {
	f.Add("hello") // seed corpus: đầu vào khởi điểm
	f.Add("xin chào")

	f.Fuzz(func(t *testing.T, s string) { // tham số sau t là kiểu được fuzz
		rev := ReverseBytes(s)
		if utf8.ValidString(s) && !utf8.ValidString(rev) {
			t.Errorf("ReverseBytes(%q) = %q không phải UTF-8 hợp lệ", s, rev)
		}
	})
}
```

Kiểu tham số được hỗ trợ: `string`, `[]byte`, các kiểu số nguyên/số thực, `bool`, `rune`, `byte`. Có thể nhận nhiều tham số: `f.Fuzz(func(t *testing.T, a int, s string) {...})`, khi đó `f.Add(1, "x")` phải đúng thứ tự và kiểu.

### Chạy

```bash
# Chế độ thường: chỉ chạy seed corpus như unit test — chạy trong mọi lần go test
go test

# Chế độ fuzz: sinh input liên tục (chỉ một fuzz target mỗi lần)
go test -run='^$' -fuzz=FuzzReverseBytes -fuzztime=30s
```

```text
--- FAIL: FuzzReverseBytes (0.05s)
    --- FAIL: FuzzReverseBytes (0.00s)
        str_test.go:66: ReverseBytes("ɇ") = "\x87\xc9" không phải UTF-8 hợp lệ

    Failing input written to testdata/fuzz/FuzzReverseBytes/48ed0c2f7ce92170
    To re-run:
    go test -run=FuzzReverseBytes/48ed0c2f7ce92170
FAIL
```

Chưa tới một giây, fuzzer tìm ra ký tự `ɇ` (2 byte UTF-8) — đảo từng byte làm hỏng mã hoá. Sửa bằng cách đảo theo `rune`:

```go
func Reverse(s string) string {
	r := []rune(s)
	for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
		r[i], r[j] = r[j], r[i]
	}
	return string(r)
}
```

### Corpus và hồi quy

```text
testdata/fuzz/FuzzReverseBytes/48ed0c2f7ce92170
---
go test fuzz v1
string("ɇ")
```

Input gây lỗi được lưu vào `testdata/fuzz/<TênFuzz>/`. **Commit file này vào git**: từ đó mọi lần `go test` (không cần `-fuzz`) đều chạy lại input này — bug không thể quay lại. Corpus do fuzzer tự sinh trong lúc chạy (không gây lỗi) nằm ở cache `$GOCACHE/fuzz`, không cần commit.

:::warning[Lưu ý khi fuzz]

- Hàm trong `f.Fuzz` phải **xác định** (cùng input → cùng kết quả) và nhanh; không phụ thuộc trạng thái global, không gọi mạng.
- `-fuzz` chỉ chấp nhận khớp **một** fuzz target mỗi lần chạy và chỉ trong một package.
- Fuzz chạy tới khi gặp lỗi hoặc bị ngắt — trong CI luôn đặt `-fuzztime`.
- Fuzzing ngốn CPU và RAM (chạy nhiều worker song song); điều chỉnh bằng `-parallel`.

:::

---

## Coverage

### Đo coverage

```bash
go test -cover ./...
# ok  	example.com/app/strutil	0.148s	coverage: 57.1% of statements

go test -coverprofile=c.out ./...   # ghi chi tiết ra file
go tool cover -func=c.out           # phần trăm theo từng hàm
go tool cover -html=c.out           # mở trình duyệt: xanh = đã chạy, đỏ = chưa chạy
```

```text
example.com/app/strutil/str.go:8:	ConcatPlus	0.0%
example.com/app/strutil/str.go:16:	ConcatBuilder	0.0%
example.com/app/strutil/str.go:33:	Reverse		100.0%
example.com/app/strutil/str.go:43:	Grade		80.0%
total:					(statements)	57.1%
```

Báo cáo HTML là cách nhanh nhất để thấy nhánh nào chưa được test — thường là các `if err != nil`.

| Cờ | Ý nghĩa |
|----|---------|
| `-covermode=set` | (mặc định) mỗi câu lệnh có chạy hay không |
| `-covermode=count` | đếm số lần mỗi câu lệnh chạy — xem "điểm nóng" |
| `-covermode=atomic` | như `count` nhưng an toàn khi đa luồng; mặc định khi bật `-race` |
| `-coverpkg=./...` | tính coverage cho cả các package **khác** mà test gọi tới (mặc định chỉ tính package đang test) |

:::warning[Coverage cao không có nghĩa là test tốt]

Coverage đo dòng code **đã chạy**, không đo dòng code **đã được kiểm tra**. Một test gọi hàm mà không assert gì vẫn cho 100%. Dùng coverage để **tìm vùng chưa test**, đừng biến nó thành mục tiêu tuyệt đối — chạy theo con số 100% dễ sinh ra test vô nghĩa. Mức 70–85% cho business logic là mục tiêu thực tế phổ biến.

:::

### Coverage cho binary tích hợp (Go 1.20)

`go test -cover` chỉ đo code chạy trong unit test. Với integration test chạy **binary thật** (khởi động server, gửi request bằng script hay Postman), Go 1.20 cho phép build binary có đo coverage:

```bash
go build -cover -o myapp .        # binary được gắn bộ đếm coverage

mkdir -p covdata
GOCOVERDIR=covdata ./myapp &      # chạy và ghi dữ liệu coverage vào thư mục
# ... chạy bộ integration test / e2e gọi vào myapp ...
kill -INT %1                      # app phải bắt SIGINT và return khỏi main (graceful shutdown)

go tool covdata percent -i=covdata                     # phần trăm theo package
go tool covdata textfmt -i=covdata -o integration.out  # đổi sang định dạng của -coverprofile
go tool cover -html=integration.out
```

Dữ liệu coverage chỉ được ghi khi chương trình kết thúc bằng cách return khỏi `main` hoặc gọi `os.Exit`. Nếu app bị tín hiệu `SIGINT`/`SIGTERM` giết theo mặc định (không xử lý tín hiệu), thư mục `covdata` sẽ trống — hãy dùng `signal.NotifyContext` để shutdown có kiểm soát.

Có thể gộp coverage từ nhiều lần chạy (`go tool covdata merge`) và gộp với unit test để có bức tranh tổng.

---

## Example test

Hàm `ExampleXxx` trong file test vừa là **tài liệu** vừa là **test**:

```go
func ExampleGrade() {
	fmt.Println(Grade(95))
	fmt.Println(Grade(40))
	// Output:
	// A
	// F
}

func ExampleReverse() {
	fmt.Println(Reverse("Go"))
	// Output: oG
}
```

- `go test` chạy example và so sánh stdout với comment `// Output:` — sai thì test fail. Không có comment `Output` thì example chỉ được biên dịch, không chạy.
- `// Unordered output:` khi thứ tự dòng không cố định (ví dụ in từ map).
- `godoc`/pkg.go.dev hiển thị example ngay dưới tài liệu của hàm tương ứng.

| Tên hàm | Gắn với |
|---------|---------|
| `Example()` | Cả package |
| `ExampleGrade()` | Hàm `Grade` |
| `ExampleUser()` | Kiểu `User` |
| `ExampleUser_FullName()` | Method `User.FullName` |
| `ExampleGrade_second()` | Example thứ hai của `Grade` (hậu tố viết thường) |

Example thường đặt trong file `example_test.go` thuộc package `xxx_test` — để chúng gọi API giống hệt người dùng (`strutil.Reverse(...)`). Nhiều package trong thư viện chuẩn dùng example làm tài liệu chính; đây là cách rẻ nhất để tài liệu không bao giờ lỗi thời.
