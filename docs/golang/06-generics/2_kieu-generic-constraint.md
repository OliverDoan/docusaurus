---
sidebar_position: 2
title: "2. Kiểu generic và Type constraint"
---

# Kiểu generic và Type constraint

Bài trước tập trung vào hàm generic; bài này đi tiếp sang **kiểu generic** — struct, slice, map có tham số kiểu như `Stack[T]`, `Set[T]`, `Cache[K, V]` — và cơ chế **type constraint** (ràng buộc kiểu) quyết định tham số kiểu được phép là gì, làm được gì. Hiểu constraint là chìa khoá để đọc được chữ ký hàm trong `slices`, `maps`, `cmp` và tự thiết kế API generic gọn gàng.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Constraint là interface** — có thể chứa method, **type set** (union `~int | ~float64`) hoặc cả hai; interface có union chỉ dùng làm constraint, không dùng làm kiểu biến.
- ⭐ **`~T` nghĩa là "mọi kiểu có kiểu nền là T"** — `~int` khớp cả `type UserID int`; thiếu `~` thì chỉ khớp đúng `int`.
- **Method của kiểu generic không được có tham số kiểu riêng** — `func (s *Stack[T]) Map[U any]()` là lỗi; viết thành hàm `Map[T, U any](s *Stack[T], ...)`.
- **`comparable`** cho key của map và `==`; **`cmp.Ordered`** (Go 1.21) cho `<`, `>` — dùng thay `golang.org/x/exp/constraints.Ordered`.
- **Khi khai báo method phải lặp lại tham số kiểu**: `func (s *Stack[T]) Push(v T)`.

:::

---

## Mục lục

- [Vì sao cần kiểu generic?](#vì-sao-cần-kiểu-generic)
- [Khai báo kiểu generic](#khai-báo-kiểu-generic)
- [Method trên kiểu generic](#method-trên-kiểu-generic)
- [Ví dụ Set và Cache](#ví-dụ-set-và-cache)
- [Type constraint là interface](#type-constraint-là-interface)
- [any và comparable](#any-và-comparable)
- [Union và toán tử ~](#union-và-toán-tử-)
- [Package cmp và x/exp/constraints](#package-cmp-và-xexpconstraints)

---

## Vì sao cần kiểu generic?

**Vấn đề:** Một cấu trúc dữ liệu dùng `any` phải assertion mỗi lần lấy ra, và không ngăn được việc bỏ nhầm kiểu vào:

```go
type Stack struct {
	items []any
}

func (s *Stack) Push(v any) { s.items = append(s.items, v) }

func (s *Stack) Pop() any {
	v := s.items[len(s.items)-1]
	s.items = s.items[:len(s.items)-1]
	return v
}

func main() {
	s := &Stack{}
	s.Push(1)
	s.Push("hai") // không ai cản
	n := s.Pop().(int) // panic: interface conversion: interface {} is string, not int
	_ = n
}
```

**Giải pháp:** Tham số kiểu cho chính struct:

```go
type Stack[T any] struct {
	items []T
}

func (s *Stack[T]) Push(v T) { s.items = append(s.items, v) }

func (s *Stack[T]) Pop() (T, bool) {
	var zero T
	if len(s.items) == 0 {
		return zero, false
	}
	v := s.items[len(s.items)-1]
	s.items = s.items[:len(s.items)-1]
	return v, true
}

func main() {
	s := &Stack[int]{}
	s.Push(1)
	// s.Push("hai") // lỗi biên dịch: cannot use "hai" as int value
	n, _ := s.Pop() // n có kiểu int, không cần assertion
	fmt.Println(n)
}
```

:::tip[Dùng thực tế]

- **Collection** — `Set[T]`, `Queue[T]`, `PriorityQueue[T]`, `LinkedList[T]`, `Tree[K, V]`.
- **Cache an toàn kiểu** — `Cache[string, *User]` thay vì `map[string]any` + assertion.
- **Kiểu bao API** — `Page[T]{Items []T; Total int}`, `Response[T]{Data T; Error string}` dùng cho JSON.
- **Đồng bộ hoá** — `SyncMap[K, V]` bọc `sync.Map` cho đúng kiểu, `atomic.Pointer[T]` trong thư viện chuẩn (Go 1.19).

:::

:::tip[Ví dụ đời thường]

Kiểu generic giống **hộp đựng cơm có ngăn dán nhãn**: hộp `Hop[Com]` chỉ cho bỏ cơm, `Hop[Canh]` chỉ cho bỏ canh — cùng một mẫu hộp, nhưng mỗi hộp sau khi dán nhãn thì không ai lén bỏ nhầm món. Constraint là **quy định của căng tin**: "hộp này chỉ đựng món nóng" — món nào không đạt bị chặn ngay ở quầy.

:::

---

## Khai báo kiểu generic

Tham số kiểu đặt ngay sau tên kiểu:

```go
// Struct generic
type Pair[K comparable, V any] struct {
	Key   K
	Value V
}

// Slice generic
type List[T any] []T

// Map generic
type Index[K comparable, V any] map[K][]V

// Kiểu hàm generic
type Predicate[T any] func(T) bool

// Struct lồng chính nó (cây nhị phân)
type Tree[T cmp.Ordered] struct {
	Left, Right *Tree[T]
	Val         T
}
```

Khi dùng **phải instantiate** với kiểu cụ thể — kiểu generic chưa có tham số không phải là kiểu dùng được:

```go
p := Pair[string, int]{Key: "tuoi", Value: 30}
var l List[string] = []string{"a", "b"}
isEven := Predicate[int](func(n int) bool { return n%2 == 0 })

// Composite literal có thể suy kiểu? KHÔNG — phải ghi rõ
// p2 := Pair{Key: "a", Value: 1} // lỗi: cannot use generic type Pair without instantiation
```

Kiểu bao cho API — rất hay dùng trong backend:

```go
type Page[T any] struct {
	Items    []T `json:"items"`
	Total    int `json:"total"`
	Page     int `json:"page"`
	PageSize int `json:"page_size"`
}

type Product struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

func listProducts() Page[Product] {
	return Page[Product]{
		Items: []Product{{1, "Bàn phím"}, {2, "Chuột"}},
		Total: 2, Page: 1, PageSize: 20,
	}
}
```

:::note[Type alias generic (Go 1.24)]

Từ Go 1.24, alias cũng có thể có tham số kiểu: `type Set[T comparable] = map[T]struct{}`. Ở các phiên bản trước, chỉ khai báo được alias tới kiểu đã instantiate đầy đủ (`type IntSet = Set[int]`).

:::

---

## Method trên kiểu generic

Receiver phải **liệt kê lại tham số kiểu** (có thể đổi tên, thường giữ nguyên), không ghi lại constraint:

```go
type Queue[T any] struct {
	items []T
}

func (q *Queue[T]) Enqueue(v T) {
	q.items = append(q.items, v)
}

func (q *Queue[T]) Dequeue() (T, bool) {
	var zero T
	if len(q.items) == 0 {
		return zero, false
	}
	v := q.items[0]
	q.items = q.items[1:]
	return v, true
}

func (q *Queue[T]) Len() int { return len(q.items) }

// Không dùng T trong thân thì viết _ cho gọn
func (q *Queue[_]) IsEmpty() bool { return len(q.items) == 0 }
```

### Method không có tham số kiểu riêng

Đây là giới hạn lớn nhất của generics trong Go: **method không được khai báo thêm tham số kiểu**.

```go
// LỖI: methods cannot have type parameters
func (s *Stack[T]) Map[U any](f func(T) U) *Stack[U] { ... }
```

Lý do: Go cho phép kiểu thoả mãn interface ngầm định và hỗ trợ type assertion sang interface lúc runtime. Nếu method có tham số kiểu riêng, compiler không thể biết trước cần sinh những bản instantiate nào để phục vụ một interface có method generic — nên Go cấm.

Cách làm: viết **hàm** nhận kiểu generic làm tham số:

```go
func MapStack[T, U any](s *Stack[T], f func(T) U) *Stack[U] {
	out := &Stack[U]{items: make([]U, 0, len(s.items))}
	for _, v := range s.items {
		out.items = append(out.items, f(v))
	}
	return out
}
```

Đây cũng là lý do các gói `slices`, `maps` cung cấp toàn **hàm** (`slices.Sort(s)`, `slices.Index(s, v)`) chứ không phải method trên một kiểu collection.

---

## Ví dụ Set và Cache

### Set dựa trên map

```go
// Set dùng map với value rỗng struct{} — không tốn bộ nhớ cho value
type Set[T comparable] struct {
	m map[T]struct{}
}

func NewSet[T comparable](items ...T) *Set[T] {
	s := &Set[T]{m: make(map[T]struct{}, len(items))}
	for _, it := range items {
		s.Add(it)
	}
	return s
}

func (s *Set[T]) Add(v T)           { s.m[v] = struct{}{} }
func (s *Set[T]) Remove(v T)        { delete(s.m, v) }
func (s *Set[T]) Has(v T) bool      { _, ok := s.m[v]; return ok }
func (s *Set[T]) Len() int          { return len(s.m) }

// All trả iterator (Go 1.23) để dùng với for range
func (s *Set[T]) All() iter.Seq[T] {
	return maps.Keys(s.m)
}

// Union dùng lại đúng T của receiver, không cần tham số kiểu mới → viết method được
func (s *Set[T]) Union(other *Set[T]) *Set[T] {
	out := NewSet[T]()
	for v := range s.m {
		out.Add(v)
	}
	for v := range other.m {
		out.Add(v)
	}
	return out
}

func main() {
	tags := NewSet("go", "docker")
	tags.Add("go") // trùng, bỏ qua
	fmt.Println(tags.Len(), tags.Has("docker")) // 2 true

	for t := range tags.All() {
		fmt.Println(t) // thứ tự không xác định
	}
}
```

### Cache có TTL và an toàn đồng thời

```go
type entry[V any] struct {
	val       V
	expiresAt time.Time
}

type Cache[K comparable, V any] struct {
	mu   sync.RWMutex
	data map[K]entry[V]
	ttl  time.Duration
}

func NewCache[K comparable, V any](ttl time.Duration) *Cache[K, V] {
	return &Cache[K, V]{data: make(map[K]entry[V]), ttl: ttl}
}

func (c *Cache[K, V]) Set(k K, v V) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.data[k] = entry[V]{val: v, expiresAt: time.Now().Add(c.ttl)}
}

func (c *Cache[K, V]) Get(k K) (V, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	e, ok := c.data[k]
	if !ok || time.Now().After(e.expiresAt) {
		var zero V
		return zero, false
	}
	return e.val, true
}

func main() {
	users := NewCache[int, string](time.Minute)
	users.Set(1, "An")
	if name, ok := users.Get(1); ok {
		fmt.Println(name) // An — kiểu string, không cần assertion
	}
}
```

:::warning[Kiểu tham số vẫn là "chưa biết" bên trong kiểu generic]

Bên trong `Cache[K, V]`, bạn chỉ làm được những gì constraint cho phép: với `V any` thì không so sánh `e.val == other`, không gọi method nào của `V`. Muốn gọi method, constraint phải khai báo method đó.

:::

---

## Type constraint là interface

Trong Go, constraint **luôn là interface**. Nhưng từ 1.18, interface được mở rộng: ngoài method, nó có thể mô tả một **tập kiểu** (type set).

```go
// 1. Interface chỉ có method — dùng làm kiểu biến lẫn constraint
type Stringer interface {
	String() string
}

// 2. Interface có tập kiểu — CHỈ dùng làm constraint
type Integer interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64
}

// 3. Kết hợp cả hai: kiểu nền là số nguyên VÀ có method String
type StringableInt interface {
	~int | ~int64
	String() string
}

// Constraint viết thẳng trong chữ ký (inline)
func Double[T interface{ ~int | ~float64 }](v T) T { return v * 2 }

// Dạng rút gọn: bỏ interface{} khi constraint chỉ là tập kiểu
func Triple[T ~int | ~float64](v T) T { return v * 3 }
```

```go
var x Integer // lỗi: cannot use type Integer outside a type constraint: interface contains type constraints
```

Một kiểu `T` **thoả constraint** khi `T` thuộc type set của interface **và** có đủ method.

Constraint quyết định **thao tác được phép** bên trong hàm: một toán tử chỉ dùng được nếu **mọi** kiểu trong type set đều hỗ trợ nó.

```go
func Add[T ~int | ~string](a, b T) T {
	return a + b // OK: cả int và string đều hỗ trợ +
}

func Sub[T ~int | ~string](a, b T) T {
	return a - b // lỗi: string không hỗ trợ -
}
```

---

## any và comparable

### any

`any` là constraint rộng nhất: mọi kiểu. Bên trong hàm chỉ được gán, truyền, trả về, lấy địa chỉ, đặt vào slice/map value… — không có `==`, `<`, `+`.

```go
func Reverse[T any](s []T) {
	for i, j := 0, len(s)-1; i < j; i, j = i+1, j-1 {
		s[i], s[j] = s[j], s[i]
	}
}
```

### comparable

`comparable` là constraint **dựng sẵn** (predeclared) gồm các kiểu so sánh được bằng `==`, `!=`: số, string, bool, con trỏ, channel, mảng và struct mà mọi phần tử/field đều comparable, interface.

```go
func Contains[T comparable](s []T, v T) bool {
	for _, x := range s {
		if x == v {
			return true
		}
	}
	return false
}

// Key của map phải comparable
func CountBy[T any, K comparable](s []T, key func(T) K) map[K]int {
	counts := make(map[K]int)
	for _, v := range s {
		counts[key(v)]++
	}
	return counts
}
```

| Kiểu | Thoả `comparable`? |
| --- | --- |
| `int`, `string`, `bool`, `float64` | Có |
| `*User`, `chan int` | Có |
| `struct{ ID int; Name string }` | Có |
| `[3]int` | Có |
| `[]int`, `map[string]int`, `func()` | **Không** |
| `struct{ Tags []string }` | **Không** (field là slice) |
| `any`, `error` (interface) | Có — từ Go 1.20 |

:::warning[Interface thoả comparable nhưng có thể panic]

Từ Go 1.20, kiểu interface như `any` được coi là thoả `comparable`. Nhưng nếu giá trị động bên trong là slice/map, phép `==` **panic lúc runtime**. Ví dụ `Contains[any]([]any{[]int{1}}, []int{1})` biên dịch được nhưng panic.

:::

---

## Union và toán tử ~

### Union `|`

Union liệt kê các kiểu được phép:

```go
type Float interface {
	float32 | float64
}
```

### Toán tử `~` (tilde)

`~T` nghĩa là "**mọi kiểu có kiểu nền (underlying type) là T**". Điều này quan trọng vì Go khuyến khích định nghĩa kiểu domain:

```go
type UserID int64
type Money int64

type ExactInt64 interface{ int64 }   // chỉ đúng int64
type AnyInt64 interface{ ~int64 }    // int64, UserID, Money, ...

func SumExact[T ExactInt64](s []T) T { var t T; for _, v := range s { t += v }; return t }
func SumAny[T AnyInt64](s []T) T     { var t T; for _, v := range s { t += v }; return t }

func main() {
	prices := []Money{10_000, 25_000}
	// SumExact(prices) // lỗi: Money does not satisfy ExactInt64 (possibly missing ~ for int64 in ExactInt64)
	fmt.Println(SumAny(prices)) // 35000 — kiểu kết quả là Money
}
```

Quy tắc: khi viết constraint dạng tập kiểu, **gần như luôn dùng `~`** để người dùng truyền được kiểu domain của họ.

### Constraint cho slice: `S ~[]E`

Thư viện `slices` dùng mẫu này để **giữ nguyên kiểu slice** của người gọi:

```go
// Chữ ký thật trong package slices
func Clone[S ~[]E, E any](s S) S

type Tags []string

t := Tags{"go", "k8s"}
c := slices.Clone(t) // c có kiểu Tags, không phải []string
```

Nếu viết `func Clone[E any](s []E) []E` thì kết quả mất kiểu `Tags`, người gọi phải chuyển đổi lại.

---

## Package cmp và x/exp/constraints

### Package `cmp` (Go 1.21)

```go
package cmp

// Ordered: mọi kiểu hỗ trợ < <= >= >
type Ordered interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64 |
		~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64 | ~uintptr |
		~float32 | ~float64 |
		~string
}

func Compare[T Ordered](x, y T) int // -1, 0, +1
func Less[T Ordered](x, y T) bool
func Or[T comparable](vals ...T) T  // Go 1.22: trả giá trị khác zero đầu tiên
```

Ứng dụng:

```go
// Sắp xếp nhiều tiêu chí: theo phòng ban, rồi theo lương giảm dần
type Employee struct {
	Dept   string
	Salary int
}

slices.SortFunc(staff, func(a, b Employee) int {
	return cmp.Or(
		cmp.Compare(a.Dept, b.Dept),
		cmp.Compare(b.Salary, a.Salary), // đảo a, b để giảm dần
	)
})

// Giá trị mặc định
port := cmp.Or(os.Getenv("PORT"), "8080")
```

### `golang.org/x/exp/constraints`

Trước Go 1.21, `Ordered` nằm ở module thử nghiệm `golang.org/x/exp/constraints`, cùng các constraint khác:

| Constraint | Gồm |
| --- | --- |
| `constraints.Signed` | `~int`, `~int8` … `~int64` |
| `constraints.Unsigned` | `~uint`, `~uint8` … `~uintptr` |
| `constraints.Integer` | `Signed \| Unsigned` |
| `constraints.Float` | `~float32 \| ~float64` |
| `constraints.Complex` | `~complex64 \| ~complex128` |
| `constraints.Ordered` | `Integer \| Float \| ~string` — nay dùng `cmp.Ordered` |

```go
import "golang.org/x/exp/constraints"

func Abs[T constraints.Signed | constraints.Float](v T) T {
	if v < 0 {
		return -v
	}
	return v
}
```

:::tip[Nên dùng gói nào?]

- Cần so sánh thứ tự → **`cmp.Ordered`** (thư viện chuẩn, không thêm dependency).
- Cần `Integer`, `Float`, `Signed`… → hoặc import `x/exp/constraints`, hoặc **tự khai báo** vài dòng trong project — nhiều đội chọn tự khai báo để tránh phụ thuộc module `exp` (không có cam kết tương thích).

:::
