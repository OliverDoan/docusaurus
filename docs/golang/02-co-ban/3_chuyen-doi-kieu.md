---
sidebar_position: 3
title: "3. Chuyển đổi kiểu"
---

# Chuyển đổi kiểu

Go **không có ép kiểu ngầm định** (implicit conversion): cộng `int` với `int64`, gán `int` cho `float64`, hay nối số vào chuỗi đều là lỗi biên dịch. Mọi chuyển đổi phải viết tường minh. Bài này đi qua chuyển đổi giữa các kiểu số (và chỗ mất chính xác), giữa string với `[]byte`/`[]rune`, package `strconv` để chuyển giữa chuỗi và số, cái bẫy nổi tiếng `string(65)`, và sự khác nhau giữa **type definition** và **type alias**.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Chuyển số sang chuỗi dùng `strconv.Itoa`/`FormatInt`, không dùng `string(n)`** — `string(65)` cho ra `"A"`, không phải `"65"`.
- ⭐ **Cú pháp chuyển đổi là `T(x)`** — `float64(n)`, `int64(id)`, `[]byte(s)`; không có ép kiểu ngầm, kể cả giữa `int` và `int64`.
- **Chuyển số có thể mất dữ liệu âm thầm** — `int8(x)` với `x = 300` cho ra `44`, `int(f)` với `f = 3.9` cho ra `3` (cắt về phía 0), không panic.
- **`strconv.Atoi`/`ParseInt` trả về `error`** — luôn kiểm tra, dữ liệu từ người dùng có thể không phải số.
- **`type A B` tạo kiểu mới; `type A = B` chỉ là tên khác** — kiểu mới không mang theo method của kiểu gốc.

:::

---

## Mục lục

- [Vì sao Go bắt chuyển đổi tường minh?](#vì-sao-go-bắt-chuyển-đổi-tường-minh)
- [Cú pháp chuyển đổi](#cú-pháp-chuyển-đổi)
- [Chuyển đổi giữa các kiểu số](#chuyển-đổi-giữa-các-kiểu-số)
- [String với byte slice và rune slice](#string-với-byte-slice-và-rune-slice)
- [Package strconv](#package-strconv)
- [Bẫy string(65)](#bẫy-string65)
- [Type definition và type alias](#type-definition-và-type-alias)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao Go bắt chuyển đổi tường minh?

**Vấn đề:** Ép kiểu ngầm định ở các ngôn ngữ khác gây ra bug khó thấy:

```javascript
// JavaScript
"5" + 3   // "53"  — số bị chuyển thành chuỗi
"5" - 3   // 2     — chuỗi bị chuyển thành số
```

```c
// C: gán int lớn vào short âm thầm cắt bit, chia int cho int ra số nguyên
int total = 70000;
short s = total;              // s = 4464, không cảnh báo mặc định
double avg = 7 / 2;           // 3.0, không phải 3.5
```

**Giải pháp:** Go buộc viết rõ mọi chuyển đổi, nên người đọc code thấy ngay chỗ có thể mất dữ liệu:

```go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	var count int = 7
	var total int64 = 100

	// sum := count + total        // LỖI: mismatched types int and int64
	sum := int64(count) + total    // tường minh
	avg := float64(count) / 2      // 3.5

	// msg := "Tổng: " + sum       // LỖI: mismatched types string and int64
	msg := "Tổng: " + strconv.FormatInt(sum, 10)

	fmt.Println(sum, avg, msg) // 107 3.5 Tổng: 107
}
```

:::tip[Dùng thực tế]

- **Đọc query param** — `page, err := strconv.Atoi(r.URL.Query().Get("page"))`, trả `400 Bad Request` nếu lỗi.
- **Đọc biến môi trường** — `port, err := strconv.Atoi(os.Getenv("PORT"))`, `debug, _ := strconv.ParseBool(os.Getenv("DEBUG"))`.
- **Tính phần trăm, trung bình** — chuyển sang `float64` trước khi chia.
- **Ghi dữ liệu ra I/O** — `w.Write([]byte(s))` vì `io.Writer` nhận `[]byte`.

:::

:::tip[Ví dụ đời thường]

Chuyển đổi tường minh giống **đổi tiền ở quầy ngân hàng**: muốn trả hoá đơn đô bằng tiền đồng, bạn phải ra quầy đổi và nhận biên lai (`float64(x)`), chứ cửa hàng không tự ý quy đổi theo tỷ giá họ thích. Phiền hơn một chút, nhưng không ai bị "mất tiền" mà không biết.

:::

---

## Cú pháp chuyển đổi

```go
T(x)   // chuyển giá trị x sang kiểu T
```

```go
i := 42
f := float64(i)       // 42.0
u := uint(f)          // 42
b := []byte("abc")    // [97 98 99]
s := string(b)        // "abc"

// Với kiểu có dấu * hoặc func, cần thêm ngoặc để tránh nhập nhằng
p := (*int)(nil)
```

Chuyển đổi chỉ được phép giữa các kiểu **tương thích**:

| Từ → Sang | Được không | Ghi chú |
|-----------|-----------|---------|
| Số nguyên ↔ số nguyên | ✅ | Có thể cắt bit / đổi dấu |
| Số nguyên ↔ số thực | ✅ | Float → int cắt phần thập phân |
| Số → `string` | ⚠️ | Chỉ với số nguyên, và kết quả là **ký tự** (xem bẫy `string(65)`) |
| `string` ↔ `[]byte`, `[]rune` | ✅ | Copy dữ liệu |
| `string` → số | ❌ | Phải dùng `strconv` |
| `bool` ↔ số | ❌ | Viết `if`/hàm riêng |
| Kiểu có cùng **underlying type** | ✅ | `type Celsius float64` ↔ `float64` |
| Slice → array (Go 1.20+) | ✅ | Panic nếu độ dài slice nhỏ hơn array |

```go
s := []int{1, 2, 3, 4}
arr := [3]int(s) // Go 1.20+: copy 3 phần tử đầu thành array
fmt.Println(arr) // [1 2 3]
// _ = [5]int(s) // panic: cannot convert slice with length 4 to array or pointer to array with length 5
```

---

## Chuyển đổi giữa các kiểu số

### Số nguyên sang số nguyên

```go
package main

import "fmt"

func main() {
	big := 300
	fmt.Println(int8(big))   // 44  — giữ 8 bit thấp: 300 - 256
	fmt.Println(uint8(big))  // 44

	neg := -1
	fmt.Println(uint8(neg))  // 255 — bit pattern được giữ, diễn giải lại không dấu
	fmt.Println(uint32(neg)) // 4294967295

	var small int8 = -5
	fmt.Println(int64(small)) // -5 — mở rộng có dấu, giữ đúng giá trị
}
```

Quy tắc: chuyển sang kiểu **nhỏ hơn** thì **cắt bit cao**; chuyển sang kiểu **lớn hơn** thì giữ nguyên giá trị (mở rộng dấu nếu kiểu nguồn có dấu). Không bao giờ panic.

### Số thực sang số nguyên

```go
// fmt.Println(int(3.9)) // LỖI biên dịch: cannot convert 3.9 (untyped float constant) to type int
f := 3.9
fmt.Println(int(f))      // 3  — cắt về phía 0, KHÔNG làm tròn
fmt.Println(int(-f))     // -3
fmt.Println(int(math.Round(f)))  // 4 — làm tròn
fmt.Println(int(math.Floor(-f))) // -4
```

:::warning[Lỗi hay gặp]

- **Hằng và biến khác nhau**: `int8(300)` hay `int(3.9)` với **hằng** là lỗi biên dịch (`constant 300 overflows int8`, `cannot convert 3.9 (untyped float constant) to type int`), nhưng với **biến** thì biên dịch được và cho kết quả bị cắt.
- **Float quá lớn sang int** (vd `int64(1e20)` từ biến, hoặc `NaN`) cho kết quả **phụ thuộc cài đặt** (implementation-defined) — không panic nhưng giá trị vô nghĩa. Kiểm tra phạm vi trước khi chuyển.

:::

### Số nguyên sang số thực

```go
var id int64 = 9007199254740993 // 2^53 + 1
f := float64(id)
fmt.Println(int64(f) == id)     // false — float64 chỉ có 53 bit phần định trị
```

`float64` biểu diễn chính xác số nguyên đến 2^53. ID lớn hơn (vd Snowflake ID, Twitter ID) chuyển sang `float64` sẽ **mất chính xác** — đây cũng là lý do API thường trả ID dạng chuỗi cho JavaScript.

### Chia và tính trung bình

```go
total, n := 10, 4
fmt.Println(total / n)                   // 2 — chia nguyên
fmt.Println(float64(total) / float64(n)) // 2.5
fmt.Println(float64(total / n))          // 2 — chuyển SAU khi chia nguyên thì đã muộn
```

---

## String với byte slice và rune slice

```go
package main

import "fmt"

func main() {
	s := "Gô"

	b := []byte(s)        // copy byte UTF-8: [71 195 180]
	r := []rune(s)        // giải mã thành code point: [71 244]
	fmt.Println(b, r)

	fmt.Println(string(b)) // "Gô"
	fmt.Println(string(r)) // "Gô"

	b[0] = 'g'             // sửa slice không ảnh hưởng s — đã copy
	fmt.Println(s, string(b)) // Gô gô
}
```

| Chuyển đổi | Chi phí | Dùng khi |
|------------|---------|----------|
| `[]byte(s)` | Cấp phát + copy | Cần sửa nội dung, ghi ra `io.Writer`, hash, mã hoá |
| `string(b)` | Cấp phát + copy | Hiển thị, so sánh, làm key map |
| `[]rune(s)` | Cấp phát + giải mã UTF-8 | Thao tác theo ký tự (cắt, đảo ngược) |
| `string(r)` | Cấp phát + mã hoá UTF-8 | Ghép lại chuỗi từ rune |

Vì string bất biến còn `[]byte` thì sửa được, chuyển đổi giữa chúng **phải copy** để bảo toàn tính bất biến. Trình biên dịch tối ưu bỏ copy trong vài trường hợp an toàn, ví dụ `m[string(b)]` khi tra map, hoặc so sánh `string(b) == "abc"`.

```go
// Đảo ngược chuỗi có dấu đúng cách
func reverse(s string) string {
	r := []rune(s)
	for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
		r[i], r[j] = r[j], r[i]
	}
	return string(r)
}

// reverse("Việt") → "têiV"
```

:::tip[Dùng thực tế]

Nhiều hàm có cặp phiên bản cho `string` và `[]byte` để tránh chuyển đổi qua lại: `strings.Contains` / `bytes.Contains`, `strings.Builder` / `bytes.Buffer`, `strconv.AppendInt` (ghi số trực tiếp vào `[]byte`). Khi đang làm việc với `[]byte` (đọc từ file, network), hãy dùng package `bytes` thay vì chuyển sang string.

:::

---

## Package strconv

`strconv` (string conversion) chuyển đổi giữa **chuỗi** và các kiểu cơ bản.

### Chuỗi sang số

```go
package main

import (
	"errors"
	"fmt"
	"strconv"
)

func main() {
	n, err := strconv.Atoi("123")             // ASCII to int → int
	fmt.Println(n, err)                        // 123 <nil>

	_, err = strconv.Atoi("12a")
	fmt.Println(err)                           // strconv.Atoi: parsing "12a": invalid syntax

	big, err := strconv.ParseInt("-9000", 10, 64) // chuỗi, cơ số, số bit
	fmt.Println(big, err)                          // -9000 <nil>

	hex, _ := strconv.ParseInt("ff", 16, 64)   // 255
	bin, _ := strconv.ParseInt("1010", 2, 64)  // 10
	auto, _ := strconv.ParseInt("0x1F", 0, 64) // 31 — cơ số 0: tự nhận theo tiền tố
	fmt.Println(hex, bin, auto)

	_, err = strconv.ParseInt("300", 10, 8)    // vượt phạm vi int8
	fmt.Println(errors.Is(err, strconv.ErrRange)) // true

	u, _ := strconv.ParseUint("42", 10, 32)    // trả uint64, giá trị đảm bảo vừa 32 bit
	fmt.Println(uint32(u))

	f, _ := strconv.ParseFloat("3.14", 64)
	ok, _ := strconv.ParseBool("true")         // chấp nhận 1, t, T, TRUE, true, True, 0, f, F...
	fmt.Println(f, ok)
}
```

:::warning[Lỗi hay gặp]

- **`ParseInt` luôn trả `int64`**, kể cả khi `bitSize` là 32 — tham số `bitSize` chỉ dùng để kiểm tra phạm vi. Vẫn phải `int32(v)` sau đó.
- **Bỏ qua lỗi** bằng `n, _ := strconv.Atoi(input)` → input sai thành `0` âm thầm, ví dụ "số lượng" của đơn hàng thành 0. Luôn xử lý `err` với dữ liệu từ bên ngoài.
- **`Atoi` không chấp nhận khoảng trắng** — `" 42"` lỗi; cần `strings.TrimSpace` trước.

:::

### Số sang chuỗi

```go
strconv.Itoa(42)                          // "42"
strconv.FormatInt(-255, 16)               // "-ff"
strconv.FormatInt(5, 2)                   // "101"
strconv.FormatUint(42, 10)                // "42"
strconv.FormatBool(true)                  // "true"
strconv.FormatFloat(3.14159, 'f', 2, 64)  // "3.14" — định dạng 'f', 2 chữ số thập phân
strconv.FormatFloat(1234.5, 'e', -1, 64)  // "1.2345e+03" — -1: số chữ số tối thiểu cần thiết
strconv.Quote("xin chào\n")               // "\"xin chào\\n\"" — thêm nháy và escape
```

### strconv hay fmt.Sprintf?

```go
s1 := strconv.Itoa(n)        // nhanh, không cấp phát thừa
s2 := fmt.Sprint(n)          // chậm hơn (dùng reflection), nhưng nhận mọi kiểu
s3 := fmt.Sprintf("%05d", n) // khi cần định dạng: "00042"
```

| | `strconv` | `fmt.Sprintf` |
|---|-----------|---------------|
| Tốc độ | Nhanh hơn nhiều lần | Chậm hơn |
| Kiểu đầu vào | Từng kiểu cụ thể | Mọi kiểu |
| Định dạng phức tạp | Hạn chế | Linh hoạt (`%05d`, `%.2f`, `%x`, `%v`) |
| Dùng khi | Đường nóng (hot path), vòng lặp lớn | Log, thông báo, định dạng hiển thị |

---

## Bẫy string(65)

```go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	n := 65
	fmt.Println(string(rune(n)))  // "A" — code point 65 là chữ A
	fmt.Println(strconv.Itoa(n))  // "65" — điều bạn thường muốn
}
```

Chuyển **số nguyên → string** nghĩa là "lấy ký tự có code point này", không phải "viết số này thành chữ số". Vì quá dễ nhầm, `go vet` (chạy tự động trong `go test`) báo lỗi khi gặp `string(n)` với `n` là số nguyên không phải `rune`/`byte`:

```text
conversion from int to string yields a string of one rune, not a string of digits
```

Muốn thật sự lấy ký tự từ code point, viết rõ ý đồ: `string(rune(n))`. Code point không hợp lệ (âm, quá `0x10FFFF`, vùng surrogate) cho ra `"�"` (ký tự thay thế �).

---

## Type definition và type alias

### Type definition: tạo kiểu mới

```go
type Celsius float64    // kiểu MỚI, underlying type là float64
type Fahrenheit float64

func (c Celsius) ToF() Fahrenheit {
	return Fahrenheit(c*9/5 + 32)
}

func main() {
	var c Celsius = 100
	var f Fahrenheit = c.ToF()
	fmt.Println(f) // 212

	// f = c              // LỖI: cannot use c (variable of type Celsius) as Fahrenheit value
	// var x float64 = c  // LỖI: phải chuyển tường minh
	x := float64(c)      // OK — cùng underlying type
	fmt.Println(x)
}
```

Type definition dùng để:

- **Tăng an toàn kiểu** — không thể vô tình truyền `UserID` vào chỗ cần `OrderID` dù cả hai đều là `int64`.
- **Gắn method** cho kiểu — chỉ được định nghĩa method trên kiểu khai báo trong cùng package.
- **Tạo enum** — `type OrderStatus int` + `iota`.

```go
type UserID int64
type OrderID int64

func FindOrder(id OrderID) {}

func main() {
	uid := UserID(10)
	// FindOrder(uid)        // LỖI: cannot use uid (variable of type UserID) as OrderID value
	FindOrder(OrderID(42))  // phải nói rõ ý đồ
	FindOrder(42)           // OK: hằng untyped tự chuyển sang OrderID
	_ = uid
}
```

:::warning[Lỗi hay gặp]

Kiểu mới **không thừa hưởng method** của kiểu gốc:

```go
type MyMutex sync.Mutex

var m MyMutex
// m.Lock() // LỖI: m.Lock undefined (type MyMutex has no field or method Lock)
```

Muốn giữ method, dùng **struct embedding** (`type MyMutex struct{ sync.Mutex }`) hoặc **alias**.

:::

### Type alias: tên khác cho cùng một kiểu

```go
type Temperature = float64 // alias: Temperature CHÍNH LÀ float64

func main() {
	var t Temperature = 36.5
	var f float64 = t        // OK — cùng một kiểu, không cần chuyển
	fmt.Printf("%T\n", t)    // float64 — không có kiểu nào tên Temperature lúc chạy
	_ = f
}
```

Hai alias quen thuộc của thư viện chuẩn: `byte = uint8`, `rune = int32`, và `any = interface{}` (Go 1.18).

Alias sinh ra (Go 1.9) chủ yếu để **di chuyển kiểu giữa các package dần dần** khi refactor codebase lớn mà không phá code cũ:

```go
// package oldpkg — giữ tương thích cho code cũ sau khi chuyển kiểu sang newpkg
package oldpkg

import "example.com/newpkg"

// Deprecated: dùng newpkg.Client.
type Client = newpkg.Client
```

Từ Go 1.24, alias có thể có tham số kiểu (generic type alias): `` type Set[T comparable] = map[T]struct{} ``.

### So sánh

| | Type definition `type A B` | Type alias `type A = B` |
|---|---------------------------|-------------------------|
| Tạo kiểu mới | ✅ | ❌ (chỉ là tên khác) |
| Gán qua lại với B | ❌ cần `A(x)` / `B(x)` | ✅ trực tiếp |
| Kế thừa method của B | ❌ | ✅ (vì là cùng kiểu) |
| Định nghĩa method mới | ✅ | Chỉ khi B khai báo trong cùng package |
| `%T` khi in | Tên A | Tên B |
| Mục đích | An toàn kiểu, enum, gắn method | Refactor, rút gọn tên |

---

## Câu hỏi phỏng vấn

**1. Go có ép kiểu ngầm định không? Ví dụ `var a int = 1; var b int64 = a` có chạy không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. Go không có implicit conversion giữa các kiểu có tên khác nhau, kể cả `int` và `int64` cùng 64 bit — `var b int64 = a` lỗi biên dịch, phải viết `int64(a)`. Ngoại lệ duy nhất "trông như ngầm định" là **hằng untyped**: `var b int64 = 1` hợp lệ vì `1` chưa có kiểu và tự khớp với `int64`. Lý do thiết kế: mọi chỗ có thể mất dữ liệu đều phải lộ rõ trong code.

</details>

**2. `string(65)` trả về gì? Cách đúng để chuyển số thành chuỗi?**

<details className="qa">
<summary>Xem đáp án</summary>

Trả về `"A"` — chuyển số nguyên sang string nghĩa là lấy ký tự có code point đó. `go vet` cảnh báo trường hợp này với kiểu `int`. Cách đúng: `strconv.Itoa(n)` cho `int`, `strconv.FormatInt(n, 10)` cho `int64`, hoặc `fmt.Sprint(n)` nếu không quan trọng hiệu năng. Muốn ký tự thật thì viết rõ `string(rune(n))`.

</details>

**3. `int(f)` với `f := 2.99` cho kết quả gì? `uint8(-1)` thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`int(2.99)` (với `f` là biến) cho `2` — chuyển float sang int **cắt phần thập phân về phía 0**, không làm tròn; muốn làm tròn dùng `math.Round`. `uint8(-1)` với hằng là lỗi biên dịch (overflow); với biến `n := -1` thì `uint8(n)` cho `255` vì giữ 8 bit thấp của biểu diễn bù hai. Chuyển đổi số không bao giờ panic, nên phải tự kiểm tra phạm vi.

</details>

**4. `strconv.Atoi` và `strconv.ParseInt` khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`Atoi(s)` tương đương `ParseInt(s, 10, 0)` rồi chuyển về `int` — chỉ cơ số 10, trả `int`. `ParseInt(s, base, bitSize)` cho chọn cơ số (2–36, hoặc 0 để tự nhận theo tiền tố `0x`, `0o`, `0b`), kiểm tra phạm vi theo `bitSize` và luôn trả `int64`. Cả hai trả `*strconv.NumError` khi lỗi; dùng `errors.Is(err, strconv.ErrSyntax)` hoặc `strconv.ErrRange` để phân biệt sai cú pháp và vượt phạm vi.

</details>

**5. Type definition và type alias khác nhau thế nào? Khi nào dùng alias?**

<details className="qa">
<summary>Xem đáp án</summary>

`type A B` tạo **kiểu mới** có cùng underlying type với B: không gán trực tiếp qua lại được, không mang method của B, có thể gắn method riêng — dùng cho an toàn kiểu (`UserID`, `Celsius`) và enum. `type A = B` chỉ là **tên khác** của cùng một kiểu: gán tự do, có đủ method của B, `%T` in ra tên B. Alias chủ yếu dùng khi refactor — di chuyển kiểu sang package mới mà vẫn giữ tương thích cho code cũ — và cho các tên ngắn gọn như `byte`, `rune`, `any`.

</details>

**6. Chuyển `[]byte` sang `string` có tốn chi phí không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Thường có: cấp phát bộ nhớ mới và copy dữ liệu, vì string bất biến còn `[]byte` có thể bị sửa sau đó — nếu dùng chung bộ nhớ thì string sẽ "bị đổi" ngầm. Trình biên dịch bỏ được copy trong vài trường hợp an toàn (tra map `m[string(b)]`, so sánh, nối chuỗi tạm). Ở đường nóng, nên làm việc trực tiếp với `[]byte` qua package `bytes` và `strconv.Append*` để tránh chuyển đổi qua lại.

</details>
