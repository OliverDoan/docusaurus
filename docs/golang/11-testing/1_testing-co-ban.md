---
sidebar_position: 1
title: "1. Package testing và table-driven test"
---

# Package testing và table-driven test

Go có sẵn công cụ test ngay trong ngôn ngữ: package `testing` cùng lệnh `go test`, không cần cài framework như JUnit hay Jest. Quy ước rất đơn giản — file `_test.go`, hàm `TestXxx(t *testing.T)` — nhưng đi kèm một phong cách viết test rất riêng của cộng đồng Go: **table-driven test** (test dạng bảng) kết hợp subtest. Bài này đi qua cách viết, chạy, tổ chức test, các tiện ích của `*testing.T` (`Helper`, `Cleanup`, `TempDir`, `Context`), `TestMain`, và khi nào cần tới thư viện `testify`.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Table-driven test + `t.Run`** là cách viết test chuẩn của Go — mỗi trường hợp là một dòng trong slice struct, thêm case chỉ cần thêm một dòng.
- ⭐ **`t.Error` ghi lỗi rồi chạy tiếp, `t.Fatal` ghi lỗi rồi dừng test ngay** — dùng `Fatal` khi bước sau không thể chạy (lỗi setup, `err != nil` mà cần dùng kết quả).
- **`go test ./...`** chạy mọi package; `-v` in chi tiết, `-run` lọc theo regex tên test, `-count=1` bỏ cache, `-race` bật race detector.
- **`t.Helper()`** trong hàm assert tự viết để dòng báo lỗi trỏ về chỗ gọi; **`t.Cleanup`** dọn dẹp theo thứ tự ngược; **`t.TempDir()`** thư mục tạm tự xoá.
- **`t.Context()` (Go 1.24)** — context tự huỷ ngay trước khi các hàm `Cleanup` chạy.
- **Package `xxx_test`** (black-box) chỉ thấy API public — test giống cách người dùng thật gọi package.

:::

---

## Mục lục

- [Vì sao cần package testing?](#vì-sao-cần-package-testing)
- [Viết và chạy test đầu tiên](#viết-và-chạy-test-đầu-tiên)
- [Table-driven test và subtest](#table-driven-test-và-subtest)
- [Chạy song song với t.Parallel](#chạy-song-song-với-tparallel)
- [Helper, Cleanup, TempDir, Context](#helper-cleanup-tempdir-context)
- [Tổ chức test: TestMain, black-box, testdata](#tổ-chức-test-testmain-black-box-testdata)
- [So sánh với testify](#so-sánh-với-testify)

---

## Vì sao cần package testing?

**Vấn đề:** Không có test tự động, mỗi lần sửa code phải tự chạy chương trình và kiểm tra bằng mắt:

```go
func main() {
	// "Test" thủ công: in ra rồi tự nhìn xem đúng không
	fmt.Println(Divide(10, 2)) // 5 <nil>
	fmt.Println(Divide(1, 0))  // 0 chia cho 0
	// Sửa Divide xong lại phải nhớ chạy lại, nhìn lại... và 3 tháng sau không ai nhớ nữa
}
```

**Giải pháp:** Viết test thành code, `go test` chạy tự động và báo pass/fail — chạy được trong CI mỗi lần push:

```go
// calc.go
package calc

var ErrDivideByZero = errors.New("chia cho 0")

func Divide(a, b int) (int, error) {
	if b == 0 {
		return 0, ErrDivideByZero
	}
	return a / b, nil
}
```

```go
// calc_test.go — cùng thư mục
package calc

import "testing"

func TestDivide(t *testing.T) {
	got, err := Divide(10, 2)
	if err != nil {
		t.Fatalf("Divide(10, 2) lỗi không mong đợi: %v", err)
	}
	if got != 5 {
		t.Errorf("Divide(10, 2) = %d; muốn 5", got)
	}
}
```

```bash
$ go test
PASS
ok  	example.com/calc	0.152s
```

:::tip[Dùng thực tế]

- **CI chặn merge** khi `go test ./...` fail — lỗi bị bắt trước khi lên production.
- **Refactor tự tin** — đổi cấu trúc bên trong, test vẫn xanh nghĩa là hành vi không đổi.
- **Tái hiện bug**: viết test fail cho bug trước, sửa code cho test xanh → bug không bao giờ quay lại.
- **Tài liệu sống** — đọc bảng test case là biết hàm xử lý những trường hợp nào.

:::

:::tip[Ví dụ đời thường]

Test tự động giống **danh sách kiểm tra trước khi cất cánh của phi công**: mỗi chuyến bay đều đi qua cùng một checklist, không phụ thuộc trí nhớ hay tâm trạng hôm đó. Table-driven test chính là **tờ checklist kẻ bảng**: cột "hạng mục", cột "giá trị mong đợi" — thêm hạng mục mới chỉ cần thêm một dòng, không phải viết lại cả quy trình.

:::

---

## Viết và chạy test đầu tiên

### Quy ước

- File test kết thúc bằng **`_test.go`** — chỉ được biên dịch khi chạy `go test`, không có trong binary production.
- Hàm test có dạng **`func TestXxx(t *testing.T)`** — `Xxx` bắt đầu bằng chữ hoa (hoặc số, `_`): `TestDivide`, `TestDivide_ByZero`.
- Không có hàm assert sẵn — dùng `if` thông thường và báo lỗi qua `t`.

### Báo lỗi: Error hay Fatal?

| Method | Ghi lỗi | Dừng test? | Dùng khi |
|--------|---------|------------|----------|
| `t.Log` / `t.Logf` | Không (chỉ in khi `-v` hoặc test fail) | Không | Ghi thông tin debug |
| `t.Error` / `t.Errorf` | Có | **Không**, chạy tiếp | Kiểm tra nhiều thứ độc lập, muốn thấy hết lỗi một lần |
| `t.Fatal` / `t.Fatalf` | Có | **Có** (gọi `runtime.Goexit`) | Bước sau không thể chạy: setup lỗi, `err != nil` mà cần dùng kết quả |
| `t.Skip` / `t.Skipf` | Không | Có, đánh dấu SKIP | Thiếu điều kiện (không có DB, chạy `-short`) |
| `t.FailNow` / `t.Fail` | Có (không message) | Có / Không | Hiếm dùng trực tiếp |

:::warning[t.Fatal trong goroutine]

`t.Fatal` chỉ dừng **goroutine đang gọi**. Gọi nó trong goroutine bạn tự tạo sẽ không dừng test chính, và test có thể đã kết thúc → panic. Trong goroutine phụ chỉ dùng `t.Error`, hoặc gửi lỗi qua channel về goroutine test.

:::

Thông điệp lỗi nên theo mẫu **`Hàm(tham số) = giá trị thật; muốn giá trị mong đợi`** — đọc log CI là hiểu ngay mà không cần mở code.

### Lệnh go test và các cờ hay dùng

```bash
go test                           # package ở thư mục hiện tại
go test ./...                     # mọi package trong module
go test -v ./...                  # in tên từng test và t.Log
go test -run TestDivide ./calc    # chỉ chạy test khớp regex
go test -run 'TestDivide/chia_cho_0'   # chạy một subtest (dấu cách trong tên thành "_")
go test -count=1 ./...            # bỏ qua cache kết quả
go test -race ./...               # bật race detector — nên luôn bật trong CI
go test -short ./...              # testing.Short() trả true → bỏ qua test chậm
go test -timeout 30s ./...        # mặc định 10 phút; quá thì panic kèm stack trace
go test -failfast ./...           # dừng ở test fail đầu tiên
go test -shuffle=on ./...         # xáo thứ tự test để phát hiện test phụ thuộc nhau
```

`go test` **cache** kết quả: chạy lại khi code và file test không đổi sẽ in `(cached)`. `-count=1` là cách quen thuộc để buộc chạy lại (ví dụ test gọi DB thật). `go test` cũng tự chạy một phần `go vet` trước khi test — lỗi vet nghiêm trọng làm test fail.

---

## Table-driven test và subtest

Thay vì viết một hàm test cho mỗi trường hợp, gom các case vào một slice struct và lặp:

```go
func TestDivide(t *testing.T) {
	tests := []struct {
		name    string
		a, b    int
		want    int
		wantErr error
	}{
		{name: "chia hết", a: 10, b: 2, want: 5},
		{name: "chia dư", a: 7, b: 2, want: 3},
		{name: "số âm", a: -9, b: 3, want: -3},
		{name: "chia cho 0", a: 1, b: 0, wantErr: ErrDivideByZero},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) { // mỗi case là một subtest
			got, err := Divide(tt.a, tt.b)
			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("err = %v; muốn %v", err, tt.wantErr)
			}
			if got != tt.want {
				t.Errorf("Divide(%d, %d) = %d; muốn %d", tt.a, tt.b, got, tt.want)
			}
		})
	}
}
```

```text
=== RUN   TestDivide
=== RUN   TestDivide/chia_hết
=== RUN   TestDivide/chia_dư
=== RUN   TestDivide/số_âm
=== RUN   TestDivide/chia_cho_0
--- PASS: TestDivide (0.00s)
    --- PASS: TestDivide/chia_hết (0.00s)
    ...
```

Lợi ích của `t.Run`:

- Mỗi case có **tên riêng** trong output — biết ngay case nào fail.
- `t.Fatal` trong một subtest chỉ dừng subtest đó, các case khác vẫn chạy.
- Chạy riêng một case: `go test -run 'TestDivide/số_âm'`.
- Subtest có thể chạy song song và có `Cleanup` riêng.

Mẹo: dùng **map** `map[string]struct{...}` thay slice thì key chính là tên, và thứ tự lặp ngẫu nhiên giúp phát hiện case vô tình phụ thuộc thứ tự. Slice thì giữ thứ tự cố định, dễ đọc output hơn — cả hai đều phổ biến.

---

## Chạy song song với t.Parallel

```go
for _, tt := range tests {
	t.Run(tt.name, func(t *testing.T) {
		t.Parallel() // subtest này chạy song song với các subtest Parallel khác
		got, err := Divide(tt.a, tt.b)
		// ...
	})
}
```

Cách hoạt động: subtest gọi `t.Parallel()` sẽ **tạm dừng** (PAUSE), đợi test cha chạy xong phần tuần tự, rồi tất cả được chạy tiếp đồng thời (CONT). Số test song song tối đa mặc định bằng `GOMAXPROCS`, đổi bằng cờ `-parallel n`.

:::warning[Biến vòng lặp trước Go 1.22]

Trước Go 1.22, mọi lần lặp dùng **chung** một biến `tt`. Subtest song song chạy sau khi vòng lặp kết thúc, nên tất cả cùng thấy case **cuối cùng** — test "xanh" nhưng thực ra chỉ kiểm tra một case. Code cũ vì vậy có dòng `tt := tt` trước `t.Run`. Từ Go 1.22 (module khai báo `go 1.22`+), mỗi lần lặp có biến riêng nên không cần nữa.

:::

Chỉ đánh `t.Parallel()` cho test **không chia sẻ trạng thái** có thay đổi (biến global, cùng một file, cùng bảng DB, biến môi trường). `t.Setenv` và `t.Chdir` (Go 1.24) sẽ panic nếu test đang chạy song song — vì chúng thay đổi trạng thái toàn tiến trình.

---

## Helper, Cleanup, TempDir, Context

### t.Helper — báo đúng dòng lỗi

```go
func assertEqual[T comparable](t *testing.T, got, want T) {
	t.Helper() // đánh dấu đây là hàm phụ trợ
	if got != want {
		t.Errorf("got %v; want %v", got, want)
	}
}

func TestSlugify(t *testing.T) {
	assertEqual(t, Slugify("  Xin Chao Go "), "xin-chao-go") // lỗi sẽ báo dòng NÀY
}
```

Không có `t.Helper()`, mọi lỗi đều báo dòng `t.Errorf` bên trong `assertEqual` — vô ích khi hàm assert được gọi ở 50 chỗ.

### t.Cleanup — dọn dẹp

```go
func newTestDB(t *testing.T) *sql.DB {
	t.Helper()
	db, err := sql.Open("pgx", testDSN)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() }) // chạy khi test (và mọi subtest) kết thúc
	return db
}

func TestUserRepo(t *testing.T) {
	db := newTestDB(t) // người gọi không cần nhớ defer db.Close()
	// ...
}
```

Ưu điểm so với `defer`: hàm helper tự đăng ký việc dọn dẹp của chính nó; các `Cleanup` chạy theo thứ tự **ngược** (LIFO); chạy sau khi các subtest song song đã xong (còn `defer` trong hàm test cha chạy **trước** khi subtest song song bắt đầu).

### t.TempDir — thư mục tạm tự xoá

```go
func TestWriteReport(t *testing.T) {
	dir := t.TempDir() // mỗi lần gọi một thư mục mới, tự xoá khi test xong
	path := filepath.Join(dir, "report.csv")
	if err := WriteReport(path, rows); err != nil {
		t.Fatal(err)
	}
	// đọc lại file và kiểm tra...
}
```

### t.Context — context gắn với vòng đời test (Go 1.24)

```go
func TestWorker(t *testing.T) {
	ctx := t.Context() // bị huỷ ngay TRƯỚC khi các hàm Cleanup chạy
	go worker(ctx)     // goroutine nền tự dừng khi test kết thúc
	// ...
}
```

Trước Go 1.24 phải tự viết `ctx, cancel := context.WithCancel(context.Background())` + `t.Cleanup(cancel)`.

### Các tiện ích khác

| Method | Công dụng |
|--------|-----------|
| `t.Setenv(k, v)` | Đặt biến môi trường, tự khôi phục sau test (không dùng với `Parallel`) |
| `t.Chdir(dir)` | (Go 1.24) Đổi thư mục làm việc, tự khôi phục |
| `t.Name()` | Tên test hiện tại (vd `TestDivide/số_âm`) — hữu ích để đặt tên tài nguyên riêng |
| `t.Deadline()` | Thời điểm hết hạn theo `-timeout` |
| `testing.Short()` | `true` khi chạy `-short` |

---

## Tổ chức test: TestMain, black-box, testdata

### TestMain — setup/teardown cho cả package

```go
func TestMain(m *testing.M) {
	// Setup một lần cho mọi test trong package: khởi động DB, nạp fixture...
	pool := mustStartTestDB()

	code := m.Run() // chạy tất cả test

	// Teardown
	pool.Close()
	os.Exit(code) // Go 1.15+: có thể bỏ, return từ TestMain cũng tự exit với mã đúng
}
```

Mỗi package chỉ có tối đa một `TestMain`. Đừng dùng nó cho việc chỉ vài test cần — helper + `t.Cleanup` rõ ràng hơn.

### White-box và black-box

| | `package calc` (cùng package) | `package calc_test` (black-box) |
|---|---|---|
| Thấy hàm/field unexported | ✅ | ❌ phải `import "example.com/calc"` |
| Mục đích | Test chi tiết nội bộ | Test API public như người dùng thật |
| Phát hiện API khó dùng | Ít | Có — vì phải gọi như bên ngoài |
| Tránh import cycle khi test | ❌ | ✅ |

```go
// calc_public_test.go — cùng thư mục, khác tên package
package calc_test

import (
	"testing"

	"example.com/calc"
)

func TestSlugifyPublic(t *testing.T) {
	if got := calc.Slugify("A B"); got != "a-b" {
		t.Errorf("Slugify(%q) = %q; muốn %q", "A B", got, "a-b")
	}
}
```

Hai kiểu có thể cùng tồn tại trong một thư mục. Thư viện chuẩn dùng cả hai; example test (bài sau) thường đặt ở package `_test`.

### Thư mục testdata

Thư mục tên `testdata` được công cụ Go **bỏ qua** khi build (không bị coi là package) — nơi đặt file đầu vào, file kết quả mẫu (golden file). `go test` chạy với thư mục làm việc là thư mục của package, nên đường dẫn tương đối dùng được ngay:

```go
data, err := os.ReadFile(filepath.Join("testdata", "input.csv"))
```

**Golden file**: so kết quả với file mẫu, và thêm cờ `-update` để ghi đè file mẫu khi thay đổi có chủ ý:

```go
var update = flag.Bool("update", false, "ghi đè golden file")

func TestRender(t *testing.T) {
	got := Render(input)
	golden := filepath.Join("testdata", "render.golden")
	if *update {
		os.WriteFile(golden, got, 0o644)
	}
	want, err := os.ReadFile(golden)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(got, want) {
		t.Errorf("kết quả khác golden file")
	}
}
// go test -run TestRender -update
```

---

## So sánh với testify

Thư viện `github.com/stretchr/testify` rất phổ biến, cung cấp hàm assert gọn hơn:

```go
import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestDivide(t *testing.T) {
	got, err := Divide(10, 2)
	require.NoError(t, err)  // require = dừng ngay khi fail (giống t.Fatal)
	assert.Equal(t, 5, got)  // assert = ghi lỗi rồi chạy tiếp (giống t.Error); chú ý thứ tự (expected, actual)

	_, err = Divide(1, 0)
	assert.ErrorIs(t, err, ErrDivideByZero)
	assert.Len(t, []int{1, 2}, 2)
	assert.Contains(t, "xin chào", "chào")
}
```

| Tiêu chí | `testing` thuần | testify |
|----------|-----------------|---------|
| Phụ thuộc ngoài | Không | Có |
| Độ dài code | Dài hơn (`if` + `Errorf`) | Ngắn |
| Thông báo lỗi | Tự viết, rõ ngữ cảnh | Tự sinh, có diff cho struct/slice |
| So sánh struct/slice lồng | `reflect.DeepEqual` hoặc `github.com/google/go-cmp` | `assert.Equal` có diff |
| Phong cách | Thư viện chuẩn, Go team khuyến khích | Rất phổ biến trong dự án doanh nghiệp |
| Thêm | — | `suite`, `mock` |

Cả hai đều chấp nhận được; quan trọng là **thống nhất trong một dự án**. Nếu dùng `testing` thuần, `go-cmp` (`cmp.Diff(want, got)`) là bạn đồng hành tốt để so sánh struct phức tạp với diff dễ đọc.
