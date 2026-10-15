---
sidebar_position: 2
title: "2. Map"
---

# Map

Map là bảng băm (hash table) có sẵn trong ngôn ngữ, ánh xạ key sang value với thời gian tra cứu trung bình O(1). Trong Go, map dùng ở khắp nơi: cache, đếm tần suất, gom nhóm dữ liệu, tra cứu cấu hình. Bài này đi qua cách tạo và thao tác map, idiom "comma-ok", những hành vi dễ gây panic (ghi vào nil map, ghi đồng thời) và các hàm tiện ích trong package `maps`.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Đọc key không tồn tại trả zero value, không lỗi** — dùng `v, ok := m[k]` (comma-ok) để phân biệt "không có" với "có nhưng bằng 0".
- ⭐ **Map không an toàn khi ghi đồng thời** — nhiều goroutine cùng ghi gây `fatal error: concurrent map writes`; bảo vệ bằng `sync.Mutex`/`sync.RWMutex` hoặc dùng `sync.Map`.
- **Ghi vào nil map gây panic** — luôn khởi tạo bằng `make` hoặc literal trước khi ghi; đọc nil map thì an toàn.
- **Thứ tự duyệt `range` là ngẫu nhiên** — cần thứ tự thì lấy key ra, sort rồi duyệt.
- **Key phải comparable** — được dùng int, string, struct/array gồm các trường comparable; không dùng slice, map, func làm key.

:::

---

## Mục lục

- [Vì sao cần map?](#vì-sao-cần-map)
- [Khai báo và khởi tạo](#khai-báo-và-khởi-tạo)
- [Đọc, ghi, xoá và comma-ok](#đọc-ghi-xoá-và-comma-ok)
- [nil map](#nil-map)
- [Map là tham chiếu](#map-là-tham-chiếu)
- [Duyệt map và thứ tự ngẫu nhiên](#duyệt-map-và-thứ-tự-ngẫu-nhiên)
- [Kiểu key hợp lệ](#kiểu-key-hợp-lệ)
- [Map và concurrency](#map-và-concurrency)
- [Package maps](#package-maps)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao cần map?

**Vấn đề:** Tra cứu trong slice phải duyệt tuần tự — O(n) mỗi lần. Với 100.000 sản phẩm và hàng nghìn request mỗi giây, cách này quá chậm:

```go
type Product struct {
	SKU   string
	Price int
}

func findPrice(products []Product, sku string) (int, bool) {
	for _, p := range products { // duyệt từng phần tử
		if p.SKU == sku {
			return p.Price, true
		}
	}
	return 0, false
}
```

**Giải pháp:** Dựng map một lần, tra cứu O(1):

```go
priceBySKU := make(map[string]int, len(products))
for _, p := range products {
	priceBySKU[p.SKU] = p.Price
}

if price, ok := priceBySKU["SP-001"]; ok {
	fmt.Println("Giá:", price)
}
```

:::tip[Dùng thực tế]

- **Cache trong bộ nhớ** — `map[string]*User` lưu user đã tải, kèm mutex nếu nhiều goroutine truy cập.
- **Đếm tần suất** — đếm số lần xuất hiện của từ, IP, mã lỗi: `count[word]++`.
- **Gom nhóm** — `map[string][]Order` gom đơn hàng theo mã khách hàng.
- **Tập hợp (set)** — `map[string]struct{}` kiểm tra trùng lặp, Go không có kiểu set riêng.

:::

:::tip[Ví dụ đời thường]

Slice giống **danh sách lớp in giấy** — tìm "Nguyễn Văn An" phải dò từ đầu xuống. Map giống **danh bạ điện thoại theo tên**: nhìn tên là nhảy thẳng tới số. Tìm một tên không có trong danh bạ thì bạn nhận "trống" chứ danh bạ không nổ tung — giống map trả zero value.

:::

---

## Khai báo và khởi tạo

```go
// 1. Literal
capital := map[string]string{
	"VN": "Hà Nội",
	"JP": "Tokyo",
	"FR": "Paris", // dấu phẩy cuối là bắt buộc khi xuống dòng
}

// 2. make — map rỗng, sẵn sàng ghi
scores := make(map[string]int)

// 3. make với size hint — cấp sẵn chỗ cho khoảng 1000 phần tử
cache := make(map[int]string, 1000)

// 4. Khai báo không khởi tạo → nil map (chỉ đọc được)
var m map[string]int

fmt.Println(len(capital), len(scores), len(m)) // 3 0 0
```

Map có value phức tạp:

```go
// Value là slice
groups := map[string][]string{
	"backend":  {"Go", "Java"},
	"frontend": {"React", "Vue"},
}
groups["backend"] = append(groups["backend"], "Rust")

// Value là struct
type Config struct {
	Host string
	Port int
}
envs := map[string]Config{
	"dev":  {Host: "localhost", Port: 8080},
	"prod": {Host: "api.example.com", Port: 443},
}
```

:::note

Size hint trong `make(map[K]V, n)` chỉ là gợi ý để giảm số lần map phải mở rộng; `len` vẫn bằng 0. Khác với slice, map **không có `cap`**.

:::

---

## Đọc, ghi, xoá và comma-ok

```go
stock := map[string]int{"áo": 10, "quần": 0}

stock["giày"] = 5         // thêm mới
stock["áo"] = 12          // ghi đè
stock["áo"]++             // tăng trực tiếp

fmt.Println(stock["mũ"])  // 0 — key không tồn tại, trả zero value

delete(stock, "giày")     // xoá; xoá key không tồn tại không lỗi
```

### Comma-ok idiom

`stock["quần"]` và `stock["mũ"]` đều trả `0` — làm sao biết "hết hàng" hay "không kinh doanh"?

```go
qty, ok := stock["quần"]
fmt.Println(qty, ok) // 0 true  — có mặt hàng, đang hết

qty, ok = stock["mũ"]
fmt.Println(qty, ok) // 0 false — không có trong map

// Viết gọn trong if
if qty, ok := stock["áo"]; ok {
	fmt.Println("Còn", qty, "cái áo")
}
```

Cùng mẫu "comma-ok" còn xuất hiện ở type assertion (`v, ok := x.(T)`) và nhận từ channel (`v, ok := <-ch`).

### `clear` (Go 1.21)

```go
sessions := map[string]int{"a": 1, "b": 2}
clear(sessions)            // xoá toàn bộ key, map vẫn dùng tiếp được
fmt.Println(len(sessions)) // 0
```

Trước 1.21 phải lặp `for k := range m { delete(m, k) }` — cách này vẫn hợp lệ (xoá trong lúc duyệt là an toàn trong Go).

:::warning[Không lấy địa chỉ hay sửa trường của value trong map]

```go
type Item struct{ Qty int }
items := map[string]Item{"a": {Qty: 1}}

// items["a"].Qty = 2   // lỗi biên dịch: cannot assign to struct field items["a"].Qty in map
// p := &items["a"]     // lỗi biên dịch: cannot take address of items["a"]

it := items["a"]  // cách 1: lấy ra, sửa, ghi lại
it.Qty = 2
items["a"] = it

ptrs := map[string]*Item{"a": {Qty: 1}} // cách 2: lưu con trỏ
ptrs["a"].Qty = 2
```

Lý do: map có thể dời phần tử sang vùng nhớ khác khi mở rộng, nên địa chỉ của value không ổn định.

:::

---

## nil map

```go
var m map[string]int // nil

fmt.Println(m["x"])  // 0 — đọc nil map an toàn
fmt.Println(len(m))  // 0
for k, v := range m { fmt.Println(k, v) } // chạy 0 lần
delete(m, "x")       // không lỗi

m["x"] = 1           // panic: assignment to entry in nil map
```

Lỗi hay gặp nhất là map nằm trong struct chưa khởi tạo:

```go
type Registry struct {
	handlers map[string]func()
}

func (r *Registry) Register(name string, h func()) {
	if r.handlers == nil { // khởi tạo lười
		r.handlers = make(map[string]func())
	}
	r.handlers[name] = h
}
```

Hoặc cung cấp hàm khởi tạo `NewRegistry()` gọi `make` sẵn.

---

## Map là tham chiếu

Biến map thực chất chứa con trỏ tới cấu trúc hash table của runtime. Gán hoặc truyền vào hàm **không copy dữ liệu**:

```go
func addBonus(salary map[string]int) {
	for name := range salary {
		salary[name] += 1_000_000 // sửa trực tiếp map của caller
	}
}

func main() {
	s := map[string]int{"An": 10_000_000}
	addBonus(s)
	fmt.Println(s["An"]) // 11000000

	alias := s
	alias["Bình"] = 9_000_000
	fmt.Println(len(s))  // 2 — alias và s là cùng một map
}
```

Muốn bản copy độc lập dùng `maps.Clone` (Go 1.21):

```go
snapshot := maps.Clone(s) // copy nông (shallow): value là con trỏ/slice vẫn dùng chung
snapshot["Chi"] = 1
fmt.Println(len(s), len(snapshot)) // 2 3
```

---

## Duyệt map và thứ tự ngẫu nhiên

```go
ages := map[string]int{"An": 30, "Bình": 25, "Chi": 28}

for name, age := range ages {
	fmt.Println(name, age) // thứ tự mỗi lần chạy có thể khác nhau
}
for name := range ages { // chỉ lấy key
	fmt.Println(name)
}
```

Go **cố ý** ngẫu nhiên hoá điểm bắt đầu duyệt để lập trình viên không vô tình phụ thuộc vào thứ tự. Cần thứ tự ổn định (in báo cáo, so sánh output trong test) thì sort key:

```go
// Go 1.23+: maps.Keys trả về iterator, slices.Sorted gom và sắp xếp
for _, name := range slices.Sorted(maps.Keys(ages)) {
	fmt.Println(name, ages[name]) // An, Bình, Chi — luôn theo thứ tự
}
```

Trước Go 1.23 viết tay:

```go
keys := make([]string, 0, len(ages))
for k := range ages {
	keys = append(keys, k)
}
sort.Strings(keys)
```

:::note

`fmt.Println(m)` và `json.Marshal(m)` luôn in map theo **key đã sắp xếp** — nên đừng thấy output in ra có thứ tự mà tưởng `range` cũng vậy.

:::

---

## Kiểu key hợp lệ

Key phải thuộc kiểu **comparable** (so sánh được bằng `==`):

| Dùng được làm key | Không dùng được |
|---|---|
| `bool`, số, `string` | slice `[]T` |
| con trỏ, channel | map |
| interface (giá trị động phải comparable) | func |
| array `[N]T` với T comparable | struct chứa slice/map/func |
| struct có mọi trường comparable | |

```go
// Struct làm key ghép — thay cho việc nối chuỗi "lat,lng"
type Point struct{ X, Y int }
visited := map[Point]bool{}
visited[Point{1, 2}] = true
fmt.Println(visited[Point{1, 2}]) // true

// Array làm key
seen := map[[2]string]int{}
seen[[2]string{"HN", "SG"}]++
```

:::warning[Interface key có thể panic lúc chạy]

```go
m := map[any]int{}
m[[]int{1}] = 1 // biên dịch OK, chạy: panic: runtime error: hash of unhashable type []int
```

Với key kiểu `any`, trình biên dịch không kiểm tra được giá trị động, lỗi chỉ lộ ra khi chạy.

:::

### Map làm set

```go
seen := make(map[string]struct{}) // struct{} chiếm 0 byte
for _, email := range emails {
	if _, dup := seen[email]; dup {
		fmt.Println("Trùng:", email)
		continue
	}
	seen[email] = struct{}{}
}
```

`map[string]bool` cũng phổ biến vì đọc tự nhiên hơn (`if seen[x]`); `struct{}` tiết kiệm bộ nhớ hơn một chút.

---

## Map và concurrency

Map **không an toàn** khi có goroutine ghi trong lúc goroutine khác đọc/ghi. Runtime phát hiện và dừng chương trình — đây là `fatal error`, **không recover được**:

```go
m := map[int]int{}
var wg sync.WaitGroup
for i := range 100 {
	wg.Add(1)
	go func() {
		defer wg.Done()
		m[i] = i // fatal error: concurrent map writes
	}()
}
wg.Wait()
```

### Cách 1: Mutex bọc map (phổ biến nhất)

```go
type SafeCounter struct {
	mu sync.RWMutex
	m  map[string]int
}

func NewSafeCounter() *SafeCounter {
	return &SafeCounter{m: make(map[string]int)}
}

func (c *SafeCounter) Inc(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.m[key]++
}

func (c *SafeCounter) Get(key string) int {
	c.mu.RLock() // nhiều goroutine đọc cùng lúc được
	defer c.mu.RUnlock()
	return c.m[key]
}
```

### Cách 2: `sync.Map`

```go
var cache sync.Map // zero value dùng được ngay

cache.Store("user:1", "An")
if v, ok := cache.Load("user:1"); ok {
	fmt.Println(v.(string)) // value kiểu any, phải type assert
}
actual, loaded := cache.LoadOrStore("user:2", "Bình")
cache.Range(func(k, v any) bool {
	fmt.Println(k, v)
	return true // false để dừng duyệt
})
cache.Delete("user:1")
_, _ = actual, loaded
```

| | `map` + `RWMutex` | `sync.Map` |
|---|---|---|
| Kiểu an toàn | Có (generic qua kiểu map) | Không — key/value là `any` |
| Phù hợp | Đa số trường hợp | Key ghi một lần đọc nhiều lần; các goroutine thao tác trên tập key tách biệt |
| Đếm phần tử | `len(m)` | Không có `Len`, phải `Range` |

:::tip

Mặc định chọn **map + mutex** — rõ ràng, có kiểu. Chỉ chuyển sang `sync.Map` khi benchmark cho thấy tranh chấp khoá là nút thắt và pattern truy cập khớp với hai trường hợp trên (theo tài liệu chính thức của [`sync.Map`](https://pkg.go.dev/sync#Map)). Chạy test với `go test -race` để phát hiện truy cập đồng thời sai.

:::

---

## Package maps

Package [`maps`](https://pkg.go.dev/maps) (Go 1.21, mở rộng iterator ở Go 1.23):

```go
import (
	"maps"
	"slices"
)

a := map[string]int{"x": 1, "y": 2}
b := maps.Clone(a)                      // copy nông
fmt.Println(maps.Equal(a, b))           // true

maps.Copy(b, map[string]int{"z": 3})    // ghi đè/thêm các cặp từ src vào dst
maps.DeleteFunc(b, func(k string, v int) bool {
	return v%2 == 0                     // xoá các value chẵn
})

// Go 1.23: iterator
keys := slices.Sorted(maps.Keys(a))     // [x y]
vals := slices.Collect(maps.Values(a))  // thứ tự không xác định
for k, v := range maps.All(a) {
	fmt.Println(k, v)
}
fmt.Println(keys, len(vals))
```

---

## Câu hỏi phỏng vấn

**1. Đọc một key không tồn tại trong map thì sao? Làm sao biết key có tồn tại?**

<details className="qa">
<summary>Xem đáp án</summary>

Trả về zero value của kiểu value (`0`, `""`, `nil`...), không panic, không lỗi. Để phân biệt, dùng comma-ok: `v, ok := m[k]` — `ok` là `true` nếu key tồn tại. Điều này quan trọng khi zero value cũng là giá trị hợp lệ (ví dụ tồn kho = 0).

</details>

**2. Vì sao ghi vào nil map gây panic còn đọc thì không?**

<details className="qa">
<summary>Xem đáp án</summary>

nil map không có hash table bên dưới. Đọc chỉ cần trả zero value nên runtime xử lý được; ghi thì cần chỗ lưu mà không có, nên panic `assignment to entry in nil map`. Map khai báo bằng `var m map[K]V` hoặc là trường struct chưa khởi tạo đều là nil — phải `make` hoặc dùng literal trước khi ghi.

</details>

**3. Vì sao thứ tự duyệt map trong Go ngẫu nhiên? Muốn duyệt theo thứ tự thì làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Hash table không có thứ tự tự nhiên, và Go cố ý ngẫu nhiên hoá điểm bắt đầu duyệt để code không vô tình phụ thuộc vào một thứ tự tình cờ (vốn có thể đổi giữa các phiên bản hoặc khi map mở rộng). Muốn có thứ tự: lấy key ra slice, sort, rồi duyệt — Go 1.23+ viết gọn `for _, k := range slices.Sorted(maps.Keys(m))`.

</details>

**4. Map có an toàn khi dùng từ nhiều goroutine không? Có những cách xử lý nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. Nhiều goroutine chỉ đọc thì an toàn, nhưng nếu có ít nhất một goroutine ghi thì phải đồng bộ; runtime phát hiện sẽ dừng chương trình với `fatal error: concurrent map writes` (không recover được). Cách xử lý: bọc map bằng `sync.Mutex`/`sync.RWMutex` (phổ biến, có kiểu); dùng `sync.Map` cho trường hợp đọc nhiều ghi ít hoặc các goroutine dùng tập key tách biệt; hoặc giao quyền sở hữu map cho một goroutine duy nhất và giao tiếp qua channel. Dùng `go test -race` để phát hiện.

</details>

**5. Những kiểu nào dùng được làm key của map?**

<details className="qa">
<summary>Xem đáp án</summary>

Kiểu comparable: bool, số, string, con trỏ, channel, interface, array và struct có các phần tử/trường comparable. Không dùng được slice, map, func (và struct/array chứa chúng). Riêng key kiểu interface: biên dịch được nhưng nếu giá trị động là slice thì panic lúc chạy. Floating point NaN dùng làm key được nhưng `NaN != NaN` nên không bao giờ đọc lại được.

</details>

**6. Map truyền vào hàm là truyền tham chiếu hay giá trị?**

<details className="qa">
<summary>Xem đáp án</summary>

Go luôn truyền theo giá trị, nhưng giá trị của biến map là một con trỏ tới cấu trúc hash table của runtime. Vì vậy hàm nhận map có thể thêm/sửa/xoá phần tử và caller thấy ngay. Tuy nhiên gán `m = make(...)` bên trong hàm chỉ đổi biến cục bộ, không ảnh hưởng caller.

</details>
