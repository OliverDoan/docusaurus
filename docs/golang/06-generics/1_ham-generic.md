---
sidebar_position: 1
title: "1. Generics và hàm generic"
---

# Generics và hàm generic

Generics (lập trình tổng quát) cho phép viết một hàm hay kiểu dùng được với **nhiều kiểu dữ liệu** mà vẫn giữ kiểm tra kiểu lúc biên dịch. Go chờ tới phiên bản 1.18 (2022) mới có generics, sau hơn 10 năm tranh luận — nên cách Go làm khá tối giản so với Java, C# hay TypeScript. Bài này giải thích vì sao cần generics, cú pháp type parameter, cách viết các hàm generic kinh điển (`Map`, `Filter`, `Reduce`, `Max`), cơ chế suy luận kiểu và — quan trọng không kém — khi nào **không nên** dùng generics.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Cú pháp**: `func Map[T, U any](s []T, f func(T) U) []U` — tham số kiểu nằm trong ngoặc vuông, mỗi tham số kiểu có một **constraint**.
- ⭐ **Đừng lạm dụng** — nếu chỉ cần gọi method thì dùng interface thường; generics hợp với **container** và **hàm thuật toán** thao tác trên slice/map/channel.
- **Type inference** — thường không cần ghi kiểu khi gọi: `Map(nums, strconv.Itoa)`; chỉ phải ghi khi kiểu không suy ra được từ đối số.
- **Trước 1.18** người ta dùng `interface{}` (mất an toàn kiểu, phải assertion) hoặc sinh code (`go generate`).
- **Ưu tiên thư viện chuẩn** — `slices`, `maps`, `cmp` (Go 1.21) đã có sẵn `slices.Sort`, `slices.Contains`, `slices.Index`, `maps.Keys`, `min`/`max` built-in.

:::

---

## Mục lục

- [Vì sao cần generics?](#vì-sao-cần-generics)
- [Type parameter](#type-parameter)
- [Viết hàm generic](#viết-hàm-generic)
- [Type inference](#type-inference)
- [Generics trong thư viện chuẩn](#generics-trong-thư-viện-chuẩn)
- [Khi nào không nên dùng generics](#khi-nào-không-nên-dùng-generics)

---

## Vì sao cần generics?

**Vấn đề:** Trước Go 1.18, muốn viết hàm "tìm phần tử lớn nhất" cho nhiều kiểu có ba lựa chọn, cái nào cũng dở.

Cách 1 — **copy-paste** cho từng kiểu:

```go
func MaxInt(s []int) int {
	m := s[0]
	for _, v := range s[1:] {
		if v > m {
			m = v
		}
	}
	return m
}

func MaxFloat64(s []float64) float64 { /* y hệt, chỉ khác kiểu */ return 0 }
func MaxString(s []string) string    { /* y hệt */ return "" }
```

Cách 2 — **`interface{}`**, mất an toàn kiểu:

```go
func Max(s []interface{}, less func(a, b interface{}) bool) interface{} {
	m := s[0]
	for _, v := range s[1:] {
		if less(m, v) {
			m = v
		}
	}
	return m
}

// Người gọi: phải chuyển []int sang []interface{} từng phần tử,
// viết hàm so sánh có type assertion, rồi assertion kết quả
nums := []interface{}{3, 7, 2}
m := Max(nums, func(a, b interface{}) bool { return a.(int) < b.(int) }).(int)
```

Ai đó truyền nhầm `"7"` (string) vào `nums` → panic lúc runtime, compiler không báo gì.

Cách 3 — **sinh code** bằng công cụ (`go generate` + template, như `genny`): an toàn kiểu nhưng thêm bước build, code sinh ra cồng kềnh.

**Giải pháp:** Generics — viết một lần, compiler kiểm tra kiểu cho từng lần dùng:

```go
import "cmp"

func Max[T cmp.Ordered](s []T) T {
	m := s[0]
	for _, v := range s[1:] {
		if v > m {
			m = v
		}
	}
	return m
}

func main() {
	fmt.Println(Max([]int{3, 7, 2}))             // 7
	fmt.Println(Max([]float64{1.5, 0.2}))        // 1.5
	fmt.Println(Max([]string{"an", "binh", "c"})) // c
	// Max([]any{1, "a"}) // lỗi biên dịch: any does not satisfy cmp.Ordered
}
```

:::tip[Dùng thực tế]

- **Hàm tiện ích trên slice/map** — `Map`, `Filter`, `GroupBy`, `Chunk`, `Uniq` dùng chung cho mọi kiểu.
- **Cấu trúc dữ liệu** — `Stack[T]`, `Set[T]`, `LRUCache[K, V]`, `Queue[T]` an toàn kiểu, không cần assertion.
- **Wrapper hạ tầng** — `Result[T]`, `Page[T]` cho API phân trang, `Retry[T](fn func() (T, error))`.
- **Concurrency helper** — `Merge[T](chans ...<-chan T) <-chan T`, worker pool trả `[]T`.

:::

:::tip[Ví dụ đời thường]

Hàm không generic giống **khuôn bánh trung thu chỉ in được nhân đậu xanh** — muốn nhân thập cẩm phải đúc khuôn mới. Generics là **một khuôn dùng cho mọi loại nhân**: hình dáng bánh (thuật toán) giữ nguyên, nhân (kiểu dữ liệu) đổ vào lúc làm, và thợ kiểm tra (compiler) vẫn chặn nếu ai định đổ… xi măng vào.

:::

---

## Type parameter

Hàm generic khai báo **danh sách tham số kiểu** (type parameter list) trong ngoặc vuông, ngay sau tên hàm:

```go
func TenHam[T Constraint1, U Constraint2](thamSo T) U { ... }
```

- `T`, `U` — tên tham số kiểu (thường 1 chữ in hoa: `T`, `K`, `V`, `E`, `S`).
- `Constraint` — **ràng buộc** mô tả `T` được phép là kiểu nào và làm được gì. Constraint luôn là một interface.

Các constraint hay gặp nhất:

| Constraint | Ý nghĩa | Cho phép |
| --- | --- | --- |
| `any` | Kiểu bất kỳ | Gán, truyền, trả về — không có toán tử nào |
| `comparable` | Kiểu so sánh được bằng `==` | `==`, `!=`, làm key của map |
| `cmp.Ordered` | Số nguyên, số thực, string | `<`, `>`, `<=`, `>=`, `==`, `+` |
| Interface có method | Ví dụ `fmt.Stringer` | Gọi method đó |

Chi tiết về constraint (union `~int | ~float64`, `cmp`, `constraints`) có trong bài Kiểu generic và Type constraint.

```go
// Nhiều tham số kiểu cùng constraint có thể gộp
func Pair[K, V any](k K, v V) string {
	return fmt.Sprintf("%v=%v", k, v)
}

// Tham số kiểu dùng trong kiểu phức hợp
func Keys[K comparable, V any](m map[K]V) []K {
	keys := make([]K, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}
```

### Instantiation — "đổ" kiểu vào

Khi gọi `Max[int](...)`, compiler **instantiate** (khởi tạo) hàm với `T = int` và kiểm tra `int` có thoả `cmp.Ordered` không. Có thể tạo hàm cụ thể mà không gọi ngay:

```go
maxInt := Max[int]       // kiểu func([]int) int
fmt.Println(maxInt([]int{1, 9, 4})) // 9
```

:::note[Go cài đặt generics thế nào]

Go dùng chiến lược lai **GC shape stenciling + dictionary**: các kiểu có cùng "hình dạng bộ nhớ" (ví dụ mọi kiểu con trỏ) dùng chung một bản mã máy, kèm một "từ điển" mô tả kiểu thật. Hệ quả: binary không phình to như C++ template, nhưng gọi method qua tham số kiểu có thể chậm hơn một chút so với code viết tay cho kiểu cụ thể. Trong đa số ứng dụng, khác biệt này không đáng kể.

:::

---

## Viết hàm generic

### Map — biến đổi từng phần tử

```go
// Map áp dụng f lên từng phần tử, trả slice mới
func Map[T, U any](s []T, f func(T) U) []U {
	out := make([]U, 0, len(s))
	for _, v := range s {
		out = append(out, f(v))
	}
	return out
}

func main() {
	nums := []int{1, 2, 3}
	strs := Map(nums, strconv.Itoa)                      // []string{"1", "2", "3"}
	squares := Map(nums, func(n int) int { return n * n }) // []int{1, 4, 9}
	fmt.Println(strs, squares)
}
```

### Filter — giữ phần tử thoả điều kiện

```go
func Filter[T any](s []T, keep func(T) bool) []T {
	var out []T
	for _, v := range s {
		if keep(v) {
			out = append(out, v)
		}
	}
	return out
}

type User struct {
	Name   string
	Active bool
}

users := []User{{"An", true}, {"Bình", false}, {"Chi", true}}
active := Filter(users, func(u User) bool { return u.Active })
// [{An true} {Chi true}]
```

### Reduce — gộp về một giá trị

```go
func Reduce[T, A any](s []T, init A, f func(A, T) A) A {
	acc := init
	for _, v := range s {
		acc = f(acc, v)
	}
	return acc
}

type OrderLine struct {
	Price int64
	Qty   int
}

lines := []OrderLine{{50_000, 2}, {120_000, 1}}
total := Reduce(lines, int64(0), func(sum int64, l OrderLine) int64 {
	return sum + l.Price*int64(l.Qty)
})
fmt.Println(total) // 220000
```

### Sum với constraint số

```go
// Number: union các kiểu số — chi tiết ở bài sau
type Number interface {
	~int | ~int32 | ~int64 | ~float32 | ~float64
}

func Sum[T Number](s []T) T {
	var total T // zero value của T
	for _, v := range s {
		total += v // được phép vì mọi kiểu trong Number đều hỗ trợ +
	}
	return total
}

fmt.Println(Sum([]int{1, 2, 3}))       // 6
fmt.Println(Sum([]float64{0.5, 0.25})) // 0.75
```

### Ghép lại: xử lý dữ liệu kiểu "pipeline"

```go
type Product struct {
	Name  string
	Price int64
	Stock int
}

products := []Product{
	{"Áo", 200_000, 5},
	{"Quần", 350_000, 0},
	{"Mũ", 90_000, 12},
}

inStock := Filter(products, func(p Product) bool { return p.Stock > 0 })
names := Map(inStock, func(p Product) string { return p.Name })
value := Reduce(inStock, int64(0), func(acc int64, p Product) int64 {
	return acc + p.Price*int64(p.Stock)
})
fmt.Println(names, value) // [Áo Mũ] 2080000
```

:::warning[Go không phải ngôn ngữ hàm]

Chuỗi `Filter → Map → Reduce` đọc quen với người từ JavaScript/Java Stream, nhưng trong Go, một **vòng `for` đơn giản** thường rõ ràng và nhanh hơn (không tạo slice trung gian, không gọi closure). Cộng đồng Go chấp nhận `Map`/`Filter` cho trường hợp ngắn gọn, nhưng đừng biến mọi vòng lặp thành chuỗi hàm.

:::

### Zero value của tham số kiểu

Không viết được `return nil` hay `return 0` khi kiểu là `T` chưa biết. Dùng biến khai báo rỗng:

```go
func FirstOrZero[T any](s []T) T {
	if len(s) == 0 {
		var zero T // 0, "", nil, struct rỗng... tuỳ T
		return zero
	}
	return s[0]
}

// Dạng hay gặp: trả kèm ok
func Find[T any](s []T, pred func(T) bool) (T, bool) {
	for _, v := range s {
		if pred(v) {
			return v, true
		}
	}
	var zero T
	return zero, false
}
```

---

## Type inference

Phần lớn thời gian bạn **không cần ghi** tham số kiểu khi gọi — compiler suy ra từ đối số (function argument type inference):

```go
Max([]int{1, 2})          // T = int
Map(nums, strconv.Itoa)   // T = int, U = string (suy từ kiểu của strconv.Itoa)
Keys(map[string]bool{})   // K = string, V = bool
```

Phải ghi tường minh khi tham số kiểu **chỉ xuất hiện ở kiểu trả về** hoặc không thể suy ra:

```go
func Zero[T any]() T {
	var z T
	return z
}

z := Zero[int]()  // bắt buộc ghi [int]
// z := Zero()    // lỗi: cannot infer T

func Convert[To, From Number](v From) To { return To(v) }

f := Convert[float64](42) // ghi To, From được suy ra là int
```

Có thể ghi **một phần** danh sách từ trái sang phải; phần còn lại compiler tự suy. Vì vậy hãy đặt tham số kiểu "khó suy ra" ở đầu danh sách như ví dụ `Convert`.

:::note[Suy luận kiểu được cải thiện ở Go 1.21]

Go 1.21 mở rộng type inference: suy luận được khi truyền **hàm generic chưa instantiate** làm đối số (ví dụ `Map(nums, Double)` với `Double` là hàm generic), suy luận từ phép gán vào biến có kiểu hàm, và xử lý hằng số không kiểu tốt hơn. Nếu bạn gặp bài viết cũ phải ghi kiểu ở những chỗ này, đó là lý do.

:::

```go
func Larger[T cmp.Ordered](a, b T) T {
	if a > b {
		return a
	}
	return b
}

// Hai hằng số không kiểu khác loại (1 là int, 2.5 là float):
// từ Go 1.21, T được suy ra là float64; trước 1.21 là lỗi biên dịch
fmt.Println(Larger(1, 2.5)) // 2.5
```

---

## Generics trong thư viện chuẩn

Trước khi tự viết `Contains`, `Sort`, `Keys`… hãy kiểm tra thư viện chuẩn (Go 1.21+):

```go
import (
	"maps"
	"slices"
)

nums := []int{5, 2, 8, 2}

slices.Sort(nums)                         // [2 2 5 8]
fmt.Println(slices.Contains(nums, 8))     // true
fmt.Println(slices.Index(nums, 5))        // 2
idx, found := slices.BinarySearch(nums, 5) // 2 true
nums = slices.Compact(nums)               // [2 5 8] — bỏ trùng liên tiếp
fmt.Println(slices.Max(nums), idx, found) // 8 2 true

// Built-in từ Go 1.21
fmt.Println(min(3, 1, 2), max(1.5, 2.5)) // 1 2.5

// Sắp xếp theo trường của struct
users := []User{{"Chi", true}, {"An", false}}
slices.SortFunc(users, func(a, b User) int {
	return strings.Compare(a.Name, b.Name)
})

// maps.Keys trả iterator (Go 1.23) → gom thành slice đã sắp xếp
ages := map[string]int{"An": 30, "Bình": 25}
keys := slices.Sorted(maps.Keys(ages)) // [An Bình]
```

:::note[maps.Keys trả iterator]

Từ Go 1.23, `maps.Keys`/`maps.Values` trả về `iter.Seq[K]` (iterator dùng với `for range`), không phải slice. Dùng `slices.Collect(maps.Keys(m))` hoặc `slices.Sorted(maps.Keys(m))` để lấy slice. Gói `golang.org/x/exp/maps` cũ trả slice — đừng nhầm.

:::

---

## Khi nào không nên dùng generics

Hướng dẫn chính thức của nhóm Go ("When To Use Generics", Ian Lance Taylor) tóm gọn: **viết code bình thường trước; chỉ thêm tham số kiểu khi thấy mình viết lặp lại cùng một đoạn code cho nhiều kiểu.**

### 1. Chỉ cần gọi method → dùng interface

```go
// Không cần thiết
func WriteAll[W io.Writer](w W, data []byte) error {
	_, err := w.Write(data)
	return err
}

// Đơn giản hơn, tương đương
func WriteAll(w io.Writer, data []byte) error {
	_, err := w.Write(data)
	return err
}
```

### 2. Hiện thực khác nhau cho từng kiểu → dùng interface

Nếu logic bên trong **phụ thuộc vào kiểu** (mỗi kiểu xử lý một khác), generics không giúp gì — bạn sẽ phải type switch bên trong. Đó là việc của interface + method.

### 3. Chỉ có một kiểu dùng

Viết `func ProcessOrders[T Order](...)` khi trong cả codebase chỉ có `Order` là trừu tượng thừa.

### 4. Làm code khó đọc hơn

```go
// Khó đọc: constraint lồng nhau, ai đọc cũng phải dừng lại
func Do[S ~[]E, E interface{ ~int | ~string; fmt.Stringer }, R any](s S, f func(E) R) []R

// Đơn giản là đủ cho nhu cầu thực tế
func Do(s []Status, f func(Status) string) []string
```

| Nên dùng generics | Không nên dùng generics |
| --- | --- |
| Hàm trên slice, map, channel cho mọi kiểu phần tử | Hàm chỉ gọi method của tham số |
| Cấu trúc dữ liệu tổng quát (Set, Stack, Tree, Cache) | Mỗi kiểu cần hiện thực riêng |
| Đang copy-paste cùng thuật toán cho nhiều kiểu | Chỉ có một kiểu thực sự dùng |
| Muốn tránh `any` + type assertion | Làm chữ ký hàm khó hiểu hơn lợi ích mang lại |
