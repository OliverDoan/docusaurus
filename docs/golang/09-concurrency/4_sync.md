---
sidebar_position: 4
title: "4. Package sync"
---

# Package sync

Channel không phải công cụ duy nhất — và không phải lúc nào cũng là công cụ tốt nhất. Khi nhiều goroutine cần đọc/ghi **cùng một biến**, cách đơn giản và nhanh nhất thường là khoá nó lại. Package `sync` cung cấp các primitive đồng bộ kinh điển: `Mutex`, `RWMutex`, `WaitGroup`, `Once`, `Cond`, `Pool`, `Map`; `sync/atomic` cho thao tác nguyên tử trên số và con trỏ; còn `golang.org/x/sync/errgroup` gom goroutine kèm xử lý lỗi. Bài này đi qua từng thứ, kèm câu hỏi muôn thuở: **khi nào dùng mutex, khi nào dùng channel?**

---

:::note[Ghi nhớ nhanh]

- ⭐ **`mu.Lock()` + `defer mu.Unlock()`** — bảo vệ mọi lần đọc **và** ghi dữ liệu chung; chỉ khoá ghi mà đọc không khoá vẫn là data race.
- ⭐ **Không copy struct chứa `sync.Mutex`/`WaitGroup` sau khi dùng** — method nhận con trỏ (`*T`); `go vet` (copylocks) bắt lỗi này.
- **`wg.Add` trước khi `go`**, `Done` bằng `defer`; Go 1.25+ có `wg.Go(f)` gộp cả hai.
- **`sync.OnceValue`/`OnceFunc`** (Go 1.21) — khởi tạo lười an toàn, gọn hơn `sync.Once` + biến.
- **`atomic.Int64`, `atomic.Bool`, `atomic.Pointer[T]`** (Go 1.19) cho bộ đếm, cờ đơn giản — nhanh hơn mutex.
- **`errgroup`** — chạy nhóm goroutine, trả lỗi đầu tiên, huỷ phần còn lại qua context, giới hạn số goroutine với `SetLimit`.

:::

---

## Mục lục

- [Vì sao cần package sync?](#vì-sao-cần-package-sync)
- [Mutex](#mutex)
- [RWMutex](#rwmutex)
- [WaitGroup](#waitgroup)
- [Once, OnceFunc, OnceValue](#once-oncefunc-oncevalue)
- [sync/atomic](#syncatomic)
- [Cond](#cond)
- [Pool](#pool)
- [sync.Map](#syncmap)
- [errgroup](#errgroup)
- [Mutex hay channel?](#mutex-hay-channel)

---

## Vì sao cần package sync?

**Vấn đề:** 1000 goroutine cùng tăng một bộ đếm:

```go
func main() {
	count := 0
	var wg sync.WaitGroup
	for range 1000 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			count++ // đọc - cộng - ghi: ba bước, không nguyên tử
		}()
	}
	wg.Wait()
	fmt.Println(count) // 941, 987, 1000... mỗi lần một khác
}
```

`count++` thực chất là *đọc giá trị → cộng 1 → ghi lại*. Hai goroutine cùng đọc được 5, cùng ghi 6 → mất một lần tăng. Đây là **data race** (xem bài Race condition).

Làm bằng channel được (một goroutine sở hữu `count`), nhưng phải viết cả một goroutine chỉ để cộng số.

**Giải pháp:** Khoá bằng `Mutex` — đơn giản, rõ ràng:

```go
var (
	mu    sync.Mutex
	count int
)
// trong goroutine:
mu.Lock()
count++
mu.Unlock()
```

Hoặc với bộ đếm đơn thuần, dùng atomic:

```go
var count atomic.Int64
count.Add(1)
fmt.Println(count.Load()) // luôn 1000
```

:::tip[Dùng thực tế]

- **Cache trong bộ nhớ** — `map` + `RWMutex`, đọc nhiều ghi ít.
- **Đếm request, metric** — `atomic.Int64`.
- **Kết nối DB/khởi tạo client một lần** — `sync.OnceValue`.
- **Gọi song song nhiều service, lỗi một cái thì huỷ hết** — `errgroup.WithContext`.

:::

:::tip[Ví dụ đời thường]

`Mutex` là **chìa khoá nhà vệ sinh ở quán cà phê**: ai cầm chìa thì vào, người khác đứng chờ. `RWMutex` là **phòng đọc thư viện**: bao nhiêu người vào đọc cũng được, nhưng khi thủ thư cần sắp xếp lại kệ (ghi) thì mọi người phải ra ngoài. `WaitGroup` là **trưởng đoàn đếm đủ người** trước khi xe chạy. `Once` là **lễ cắt băng khánh thành** — chỉ làm đúng một lần dù bao nhiêu khách tới.

:::

---

## Mutex

```go
type Counter struct {
	mu sync.Mutex      // zero value dùng được ngay, không cần khởi tạo
	m  map[string]int
}

func NewCounter() *Counter {
	return &Counter{m: make(map[string]int)}
}

func (c *Counter) Inc(key string) {
	c.mu.Lock()
	defer c.mu.Unlock() // đảm bảo unlock kể cả khi panic hoặc return sớm
	c.m[key]++
}

func (c *Counter) Get(key string) int {
	c.mu.Lock()
	defer c.mu.Unlock() // ĐỌC cũng phải khoá
	return c.m[key]
}
```

Quy ước: đặt `mu` **ngay trên** các field mà nó bảo vệ, và không export mutex.

`mu.TryLock()` (Go 1.18) thử khoá không chặn, trả `bool` — hiếm khi cần, tài liệu Go cảnh báo việc phải dùng nó thường là dấu hiệu thiết kế có vấn đề.

:::warning

Các lỗi hay gặp với Mutex:

1. **Copy mutex** — method value receiver `func (c Counter) Inc()` copy cả mutex → mỗi lần gọi khoá một bản sao, không bảo vệ gì. Luôn dùng pointer receiver. `go vet` báo `passes lock by value`.
2. **Khoá lại trong cùng goroutine** — Go mutex **không re-entrant** (không đệ quy): `Lock` hai lần liên tiếp trong cùng goroutine = deadlock.
3. **Giữ khoá khi làm I/O** — gọi HTTP/DB trong lúc giữ khoá làm mọi goroutine khác chờ theo. Lấy dữ liệu cần thiết, unlock, rồi mới làm I/O.
4. **Quên Unlock ở nhánh return sớm** — dùng `defer`.

:::

### Thu hẹp vùng khoá

```go
func (c *Cache) Refresh(ctx context.Context, key string) error {
	// KHÔNG giữ khoá khi gọi mạng
	v, err := fetchFromDB(ctx, key)
	if err != nil {
		return err
	}

	c.mu.Lock()
	c.data[key] = v // chỉ khoá đúng đoạn ghi map
	c.mu.Unlock()
	return nil
}
```

---

## RWMutex

`sync.RWMutex` cho phép **nhiều người đọc cùng lúc** hoặc **một người ghi duy nhất**:

```go
type Config struct {
	mu   sync.RWMutex
	vals map[string]string
}

func (c *Config) Get(key string) (string, bool) {
	c.mu.RLock() // nhiều goroutine RLock cùng lúc được
	defer c.mu.RUnlock()
	v, ok := c.vals[key]
	return v, ok
}

func (c *Config) Set(key, val string) {
	c.mu.Lock() // chờ mọi reader trả khoá, chặn reader mới
	defer c.mu.Unlock()
	c.vals[key] = val
}
```

| | `Mutex` | `RWMutex` |
|---|---|---|
| Đọc song song | Không | Có (`RLock`) |
| Chi phí mỗi thao tác | Thấp hơn | Cao hơn (theo dõi số reader) |
| Hợp với | Đọc/ghi cân bằng, vùng khoá ngắn | **Đọc nhiều hơn ghi rất nhiều**, vùng đọc tương đối dài |

:::warning

`RWMutex` không tự động nhanh hơn. Vùng khoá ngắn (đọc một phần tử map) thì `Mutex` thường ngang hoặc nhanh hơn. Đo bằng benchmark trước khi đổi. Và **không nâng cấp** từ `RLock` lên `Lock` trong cùng goroutine — deadlock.

:::

---

## WaitGroup

`WaitGroup` là bộ đếm: `Add(n)` cộng, `Done()` trừ 1, `Wait()` chặn tới khi về 0.

```go
func fetchAll(urls []string) []string {
	results := make([]string, len(urls))
	var wg sync.WaitGroup
	for i, u := range urls {
		wg.Add(1) // trước khi go
		go func() {
			defer wg.Done()
			results[i] = fetch(u) // mỗi goroutine ghi vào ô riêng → không race
		}()
	}
	wg.Wait()
	return results
}
```

Từ **Go 1.25**, `WaitGroup.Go` gói gọn `Add(1)` + `go` + `defer Done()`, loại bỏ hẳn lỗi đặt `Add` sai chỗ:

```go
var wg sync.WaitGroup
for i, u := range urls {
	wg.Go(func() {
		results[i] = fetch(u)
	})
}
wg.Wait()
```

:::warning

- **`Add` bên trong goroutine là sai**: `Wait` có thể chạy trước khi goroutine kịp `Add` → trả về sớm.
- **Truyền `WaitGroup` theo giá trị** (`func work(wg sync.WaitGroup)`) → `Done` trên bản sao, `Wait` treo mãi. Truyền `*sync.WaitGroup` hoặc tốt hơn là để closure gọi `Done`.
- `WaitGroup` **không trả lỗi** — cần lỗi thì dùng `errgroup`.

:::

---

## Once, OnceFunc, OnceValue

`sync.Once` đảm bảo một hàm chạy **đúng một lần** dù bao nhiêu goroutine gọi đồng thời; các goroutine khác chờ tới khi lần chạy đó xong.

```go
type Client struct{ /* ... */ }

var (
	clientOnce sync.Once
	client     *Client
)

func GetClient() *Client {
	clientOnce.Do(func() {
		client = newExpensiveClient() // chỉ chạy lần đầu
	})
	return client
}
```

Go 1.21 thêm ba hàm tiện hơn, trả về hàm đã "bọc Once":

```go
// OnceFunc: chạy f đúng một lần
var initLogger = sync.OnceFunc(func() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
})

// OnceValue: tính giá trị một lần, các lần sau trả lại kết quả cũ
var getConfig = sync.OnceValue(func() Config {
	return loadConfigFromEnv()
})

// OnceValues: như trên nhưng trả về (giá trị, error)
var getDB = sync.OnceValues(func() (*sql.DB, error) {
	return sql.Open("pgx", os.Getenv("DATABASE_URL"))
})

func handler(w http.ResponseWriter, r *http.Request) {
	db, err := getDB()
	if err != nil {
		http.Error(w, "db lỗi", http.StatusInternalServerError)
		return
	}
	_ = db
}
```

| | Hành vi khi hàm bên trong panic |
|---|---|
| `Once.Do` | Coi như đã chạy xong; lần sau **không** chạy lại, cũng không panic lại |
| `OnceFunc`, `OnceValue`, `OnceValues` | Mọi lần gọi sau đều **panic lại** với cùng giá trị |

:::warning

`OnceValues` ghi nhớ **cả lỗi**: lần đầu lỗi thì mãi mãi trả lỗi đó, không thử lại. Nếu cần "thử lại khi lỗi", tự viết với mutex.

:::

---

## sync/atomic

Thao tác nguyên tử do CPU đảm bảo, không cần khoá. Từ Go 1.19 nên dùng các **kiểu atomic** thay vì hàm kiểu cũ (`atomic.AddInt64(&x, 1)`), vì kiểu mới không thể vô tình bị truy cập không nguyên tử:

```go
type Stats struct {
	requests atomic.Int64
	errors   atomic.Int64
	ready    atomic.Bool
}

func (s *Stats) Record(err error) {
	s.requests.Add(1)
	if err != nil {
		s.errors.Add(1)
	}
}

func main() {
	var s Stats
	s.ready.Store(true)
	s.Record(nil)
	s.Record(errors.New("x"))
	fmt.Println(s.requests.Load(), s.errors.Load(), s.ready.Load()) // 2 1 true
}
```

| Kiểu | Method chính |
|---|---|
| `atomic.Int32`, `Int64`, `Uint32`, `Uint64`, `Uintptr` | `Load`, `Store`, `Add`, `Swap`, `CompareAndSwap`; Go 1.23 thêm `And`, `Or` |
| `atomic.Bool` | `Load`, `Store`, `Swap`, `CompareAndSwap` |
| `atomic.Pointer[T]` | `Load`, `Store`, `Swap`, `CompareAndSwap` — thay nóng cấu hình |
| `atomic.Value` | Lưu giá trị bất kỳ (kiểu phải nhất quán) |

### Thay nóng cấu hình bằng atomic.Pointer

```go
type Settings struct {
	RateLimit int
	Features  map[string]bool
}

var current atomic.Pointer[Settings]

func Reload(s *Settings) {
	current.Store(s) // ghi: thay cả object, KHÔNG sửa object cũ
}

func Handle() {
	s := current.Load() // đọc: không khoá, luôn thấy một bản đầy đủ
	_ = s.RateLimit
}
```

Mẫu này chỉ đúng khi object được coi là **bất biến** sau khi `Store` — muốn đổi thì tạo object mới.

:::warning

Atomic chỉ an toàn cho **một biến đơn lẻ**. Hai biến atomic cập nhật "cùng lúc" không tạo thành một thao tác nguyên tử: `if a.Load() > 0 { b.Add(1) }` vẫn có race logic. Cần bất biến giữa nhiều biến → dùng mutex.

:::

---

## Cond

`sync.Cond` cho goroutine **chờ một điều kiện** và được đánh thức khi điều kiện có thể đã thay đổi:

```go
type Queue struct {
	mu    sync.Mutex
	cond  *sync.Cond
	items []int
}

func NewQueue() *Queue {
	q := &Queue{}
	q.cond = sync.NewCond(&q.mu)
	return q
}

func (q *Queue) Put(v int) {
	q.mu.Lock()
	q.items = append(q.items, v)
	q.mu.Unlock()
	q.cond.Signal() // đánh thức một goroutine đang Wait (Broadcast: đánh thức tất cả)
}

func (q *Queue) Get() int {
	q.mu.Lock()
	defer q.mu.Unlock()
	for len(q.items) == 0 { // luôn kiểm tra trong vòng for, không dùng if
		q.cond.Wait() // tự Unlock, ngủ, khi thức dậy tự Lock lại
	}
	v := q.items[0]
	q.items = q.items[1:]
	return v
}
```

Trong thực tế, `Cond` hiếm dùng — channel thường làm được điều tương tự rõ ràng hơn, và `Cond.Wait` không kết hợp được với `select`/context để huỷ. Biết để đọc hiểu code thư viện là đủ.

---

## Pool

`sync.Pool` là kho object tạm để **tái sử dụng**, giảm cấp phát và áp lực GC cho object tạo/huỷ liên tục:

```go
var bufPool = sync.Pool{
	New: func() any { return new(bytes.Buffer) },
}

func renderJSON(v any) ([]byte, error) {
	buf := bufPool.Get().(*bytes.Buffer)
	defer func() {
		buf.Reset()      // xoá dữ liệu cũ trước khi trả lại
		bufPool.Put(buf)
	}()

	if err := json.NewEncoder(buf).Encode(v); err != nil {
		return nil, err
	}
	return bytes.Clone(buf.Bytes()), nil // copy ra: buf sẽ bị người khác dùng lại
}
```

Đặc điểm cần nhớ:

- Object trong pool có thể **bị GC dọn bất cứ lúc nào** — không dùng Pool làm cache hay connection pool.
- **Phải reset** object trước khi `Put`, nếu không lần `Get` sau nhận dữ liệu rác.
- Không trả ra ngoài tham chiếu tới object đã `Put` lại.
- Chỉ đáng dùng khi profiling cho thấy cấp phát là nút thắt (ví dụ `fmt`, `encoding/json` dùng Pool nội bộ).

---

## sync.Map

`sync.Map` là map an toàn đồng thời, không cần khoá ngoài:

```go
var sessions sync.Map // zero value dùng được

sessions.Store("abc", User{Name: "Lan"})

if v, ok := sessions.Load("abc"); ok {
	u := v.(User) // giá trị kiểu any → phải type assertion
	fmt.Println(u.Name)
}

actual, loaded := sessions.LoadOrStore("xyz", User{Name: "Minh"})
_ = actual
_ = loaded // true nếu key đã tồn tại

sessions.Range(func(k, v any) bool {
	fmt.Println(k, v)
	return true // false để dừng duyệt
})

sessions.Delete("abc")
```

Tài liệu Go nói rõ `sync.Map` **chỉ tối ưu** cho hai trường hợp:

1. Key được ghi **một lần** và đọc **rất nhiều lần** (cache chỉ tăng).
2. Nhiều goroutine đọc/ghi các **tập key không giao nhau**.

Ngoài hai trường hợp này, `map` + `Mutex`/`RWMutex` thường tốt hơn và **có kiểu an toàn** (không phải `any`). Từ Go 1.24, `sync.Map` được viết lại trên cấu trúc hash-trie đồng thời, hiệu năng cải thiện, nhưng khuyến nghị trên vẫn giữ nguyên.

---

## errgroup

`golang.org/x/sync/errgroup` (module mở rộng chính thức) = `WaitGroup` + **trả lỗi** + **huỷ qua context** + **giới hạn đồng thời**:

```bash
go get golang.org/x/sync
```

```go
import "golang.org/x/sync/errgroup"

func loadDashboard(ctx context.Context, userID int) (*Dashboard, error) {
	g, ctx := errgroup.WithContext(ctx) // ctx bị huỷ khi có goroutine trả lỗi đầu tiên

	var (
		profile *Profile
		orders  []Order
		points  int
	)
	g.Go(func() error {
		var err error
		profile, err = fetchProfile(ctx, userID)
		return err
	})
	g.Go(func() error {
		var err error
		orders, err = fetchOrders(ctx, userID)
		return err
	})
	g.Go(func() error {
		var err error
		points, err = fetchPoints(ctx, userID)
		return err
	})

	if err := g.Wait(); err != nil { // chờ tất cả, trả lỗi đầu tiên (khác nil)
		return nil, err
	}
	return &Dashboard{Profile: profile, Orders: orders, Points: points}, nil
}
```

Mỗi goroutine ghi vào **biến riêng** nên không cần khoá; `Wait` tạo quan hệ happens-before nên đọc sau `Wait` an toàn.

### Giới hạn số goroutine đồng thời

```go
g, ctx := errgroup.WithContext(ctx)
g.SetLimit(10) // tối đa 10 goroutine chạy cùng lúc; g.Go chặn khi đủ 10

for _, id := range imageIDs { // 10.000 ảnh
	g.Go(func() error {
		return resize(ctx, id)
	})
}
return g.Wait()
```

`g.TryGo(f)` thử khởi chạy, trả `false` thay vì chặn khi đã đủ giới hạn.

---

## Mutex hay channel?

| Tình huống | Nên dùng | Lý do |
|---|---|---|
| Bảo vệ trạng thái chung (cache, bộ đếm, map) | `Mutex` / `atomic` | Đơn giản, nhanh, ý đồ rõ |
| Chuyển **quyền sở hữu** dữ liệu sang goroutine khác | Channel | Gửi xong là bên gửi không đụng nữa |
| Phân phối công việc cho worker | Channel | Hàng đợi tự nhiên |
| Truyền kết quả bất đồng bộ | Channel / `errgroup` | |
| Tín hiệu huỷ, tắt máy | `context` (bên trong là channel) | Lan truyền xuống mọi tầng |
| Chờ nhóm goroutine xong | `WaitGroup` / `errgroup` | |
| Khởi tạo một lần | `sync.Once*` | |

Quy tắc ngón tay cái từ Go wiki: **dùng thứ nào làm code dễ hiểu nhất**. Đừng ép mọi thứ thành channel cho "đúng chất Go" — một struct với mutex được đóng gói tốt rất idiomatic.
