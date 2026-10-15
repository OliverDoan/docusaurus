---
sidebar_position: 1
title: "1. Error interface"
---

# Error interface

Go không có exception và `try/catch`. Thay vào đó, **lỗi là giá trị** (errors are values): hàm trả lỗi như một giá trị trả về bình thường, người gọi kiểm tra và quyết định xử lý. Cách làm này khiến code Go "dài" hơn vì đầy `if err != nil`, nhưng luồng lỗi luôn hiện rõ trên mặt chữ. Bài này đi qua triết lý đó, interface `error`, cách tạo lỗi bằng `errors.New`/`fmt.Errorf`, custom error type, sentinel error và so sánh với try/catch.

---

:::note[Ghi nhớ nhanh]

- ⭐ **`error` chỉ là interface một method** — `type error interface { Error() string }`; kiểu nào có `Error() string` đều là lỗi.
- ⭐ **Lỗi là giá trị trả về cuối cùng**, luôn kiểm tra ngay: `v, err := f(); if err != nil { return ..., err }` — không bỏ qua lỗi bằng `_` trừ khi có lý do.
- **`errors.New("...")`** cho lỗi tĩnh, **`fmt.Errorf("...%v", x)`** cho lỗi có tham số; thông điệp viết thường, không chấm câu cuối.
- **Sentinel error** (`io.EOF`, `sql.ErrNoRows`) là biến lỗi khai báo sẵn để so sánh; **custom error type** dùng khi cần mang thêm dữ liệu.
- **Khi có lỗi, các giá trị trả về khác thường là zero value** — đừng dùng chúng.

:::

---

## Mục lục

- [Vì sao Go chọn lỗi là giá trị?](#vì-sao-go-chọn-lỗi-là-giá-trị)
- [Interface error](#interface-error)
- [Tạo lỗi với errors.New và fmt.Errorf](#tạo-lỗi-với-errorsnew-và-fmterrorf)
- [Kiểm tra lỗi với if err != nil](#kiểm-tra-lỗi-với-if-err--nil)
- [Custom error type](#custom-error-type)
- [Sentinel error](#sentinel-error)
- [So sánh với try/catch](#so-sánh-với-trycatch)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao Go chọn lỗi là giá trị?

**Vấn đề:** Với exception, nhìn vào chữ ký hàm không biết nó có thể ném lỗi gì, và luồng điều khiển "nhảy" vô hình:

```java
// Java: dòng nào có thể ném lỗi? Lỗi bay tới đâu?
public Order placeOrder(Cart cart) {
    User user = userRepo.find(cart.userId);   // có thể ném?
    Payment p = gateway.charge(user, cart);   // có thể ném?
    inventory.reserve(cart.items);            // nếu ném ở đây thì đã trừ tiền rồi!
    return orderRepo.save(new Order(...));
}
```

Lỗi ở `inventory.reserve` bay thẳng ra ngoài, dễ quên hoàn tiền; người đọc phải nhớ từng hàm ném gì.

**Giải pháp:** Go đưa lỗi vào **chữ ký hàm** và bắt xử lý tại chỗ:

```go
func (s *OrderService) PlaceOrder(ctx context.Context, cart Cart) (*Order, error) {
	user, err := s.users.Find(ctx, cart.UserID)
	if err != nil {
		return nil, fmt.Errorf("tìm user %d: %w", cart.UserID, err)
	}

	payment, err := s.gateway.Charge(ctx, user, cart.Total())
	if err != nil {
		return nil, fmt.Errorf("thanh toán: %w", err)
	}

	if err := s.inventory.Reserve(ctx, cart.Items); err != nil {
		// Lỗi hiện rõ ngay tại đây → nhớ hoàn tiền
		_ = s.gateway.Refund(ctx, payment.ID)
		return nil, fmt.Errorf("giữ hàng: %w", err)
	}

	return s.orders.Save(ctx, NewOrder(user, cart, payment))
}
```

Mỗi điểm có thể lỗi đều lộ ra; người đọc thấy ngay điều gì xảy ra khi bước nào thất bại.

:::tip[Dùng thực tế]

- **Gọi API, database, file** — mọi thao tác I/O trong Go đều trả `error`.
- **Validate input** — trả lỗi mô tả trường sai thay vì ném exception.
- **Phân loại lỗi để trả HTTP status** — `ErrNotFound` → 404, `*ValidationError` → 400, còn lại → 500.
- **Retry có chọn lọc** — chỉ retry lỗi timeout/tạm thời, không retry lỗi nghiệp vụ.

:::

:::tip[Ví dụ đời thường]

Exception giống **chuông báo cháy toà nhà**: một phòng có sự cố là cả toà rung chuông, ai cũng chạy ra, không biết cháy ở đâu. Lỗi là giá trị giống **phiếu kết quả xét nghiệm** ở bệnh viện: mỗi khâu trả kèm phiếu "bình thường" hoặc "bất thường + lý do", bác sĩ khâu sau đọc phiếu rồi quyết định — chuyển khoa, làm lại, hay báo bệnh nhân.

:::

---

## Interface error

`error` là interface dựng sẵn (predeclared) của ngôn ngữ:

```go
type error interface {
	Error() string
}
```

Chỉ vậy thôi. Bất kỳ kiểu nào có method `Error() string` đều là `error`. Giá trị `nil` nghĩa là **không có lỗi**.

Quy ước trong chữ ký hàm:

```go
// error luôn là giá trị trả về CUỐI CÙNG
func ReadConfig(path string) (*Config, error)
func Save(u *User) error
func Parse(s string) (int, bool, error)
```

Khi `err != nil`, các giá trị trả về khác **không đáng tin** (thường là zero value). Ngoại lệ hiếm có ghi rõ trong tài liệu, ví dụ `io.Reader.Read` có thể trả `n > 0` cùng `io.EOF`.

---

## Tạo lỗi với errors.New và fmt.Errorf

### errors.New — lỗi có thông điệp cố định

```go
import "errors"

func Divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("chia cho 0")
	}
	return a / b, nil
}

func main() {
	if _, err := Divide(1, 0); err != nil {
		fmt.Println("lỗi:", err) // lỗi: chia cho 0
	}
}
```

Mỗi lần gọi `errors.New` tạo ra **một giá trị lỗi riêng biệt** — hai lỗi cùng chuỗi vẫn **khác nhau** khi so sánh `==` (vì `errors.New` trả con trỏ):

```go
fmt.Println(errors.New("x") == errors.New("x")) // false
```

### fmt.Errorf — lỗi có tham số

```go
func GetUser(id int) (*User, error) {
	if id <= 0 {
		return nil, fmt.Errorf("id không hợp lệ: %d", id)
	}
	// ...
	return &User{ID: id}, nil
}
```

`fmt.Errorf` với động từ đặc biệt `%w` còn **bọc** (wrap) lỗi gốc để có thể kiểm tra lại sau — chủ đề của bài Wrap và Unwrap lỗi.

### Quy ước viết thông điệp lỗi

| Quy ước | Nên | Không nên |
| --- | --- | --- |
| Chữ đầu | `"không mở được file"` | `"Không mở được file"` |
| Dấu câu cuối | `"hết thời gian chờ"` | `"hết thời gian chờ."` |
| Ngữ cảnh | `"đọc config %s: %w"` | `"lỗi"`, `"có lỗi xảy ra"` |
| Tiền tố | `"tải ảnh: ..."` | `"Error: tải ảnh thất bại!!!"` |

Lý do viết thường, không chấm câu: lỗi thường bị **nối chuỗi** khi truyền lên, ví dụ `lưu đơn hàng: thanh toán: kết nối ngân hàng: timeout`. Chữ hoa hay dấu chấm giữa chuỗi trông rất lạ. `staticcheck` (ST1005) sẽ nhắc quy tắc này.

---

## Kiểm tra lỗi với if err != nil

Mẫu cơ bản nhất của Go:

```go
f, err := os.Open("data.csv")
if err != nil {
	return fmt.Errorf("mở file dữ liệu: %w", err)
}
defer f.Close()
```

Các biến thể thường gặp:

```go
// 1. Gộp khai báo vào if — err chỉ sống trong khối if
if err := db.Ping(); err != nil {
	log.Fatalf("không kết nối được database: %v", err)
}

// 2. Xử lý xong thì tiếp tục, không return (lỗi không nghiêm trọng)
if err := cache.Set(key, val); err != nil {
	slog.Warn("ghi cache thất bại", "key", key, "err", err)
	// vẫn tiếp tục — cache chỉ là tối ưu
}

// 3. Giữ "happy path" sát lề trái — xử lý lỗi rồi return sớm
func process(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	cfg, err := parse(data)
	if err != nil {
		return err
	}
	return apply(cfg)
}
```

:::warning[Đừng bỏ qua lỗi]

```go
json.Unmarshal(body, &req)       // SAI: lỗi bị nuốt, req có thể rỗng
_ = json.Unmarshal(body, &req)   // vẫn sai nếu không có lý do chính đáng
```

Chỉ dùng `_` khi chắc chắn lỗi không quan trọng và ghi chú lý do. Linter `errcheck` (có trong `golangci-lint`) phát hiện lỗi bị bỏ qua.

:::

:::warning[Không dùng else sau return]

```go
// Không nên
if err != nil {
	return err
} else {
	doSomething()
}

// Nên: happy path không thụt lề
if err != nil {
	return err
}
doSomething()
```

:::

### Giảm lặp lại khi gọi nhiều lần

Khi một chuỗi thao tác cùng loại (ví dụ ghi nhiều lần vào writer), có thể "nhớ lỗi đầu tiên" để tránh lặp `if err != nil` — kỹ thuật Rob Pike mô tả trong bài *Errors are values*:

```go
type errWriter struct {
	w   io.Writer
	err error
}

func (ew *errWriter) write(s string) {
	if ew.err != nil {
		return // đã lỗi thì bỏ qua các lần ghi sau
	}
	_, ew.err = io.WriteString(ew.w, s)
}

func writeReport(w io.Writer) error {
	ew := &errWriter{w: w}
	ew.write("BÁO CÁO\n")
	ew.write("Doanh thu: 120tr\n")
	ew.write("Chi phí: 80tr\n")
	return ew.err // kiểm tra một lần ở cuối
}
```

`bufio.Writer` và `bufio.Scanner` trong thư viện chuẩn dùng đúng ý tưởng này (`sc.Err()` sau vòng lặp).

---

## Custom error type

Khi lỗi cần **mang thêm dữ liệu** để người gọi xử lý (tên trường, mã lỗi, HTTP status…), định nghĩa kiểu riêng:

```go
type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("trường %s: %s", e.Field, e.Message)
}

func ValidateUser(u User) error {
	if u.Email == "" {
		return &ValidationError{Field: "email", Message: "không được để trống"}
	}
	if u.Age < 0 {
		return &ValidationError{Field: "age", Message: "phải không âm"}
	}
	return nil // nil tường minh — xem bẫy nil interface ở bài Interface
}

func main() {
	err := ValidateUser(User{Age: 20})
	var ve *ValidationError
	if errors.As(err, &ve) { // lấy ra kiểu cụ thể (an toàn cả khi lỗi bị wrap)
		fmt.Println("sai trường:", ve.Field) // sai trường: email
	}
}
```

Thư viện chuẩn có nhiều custom error type: `*os.PathError` (mang `Op`, `Path`, `Err`), `*json.SyntaxError` (mang `Offset`), `*net.OpError`, `*strconv.NumError`.

```go
_, err := os.Open("/khong/ton/tai.txt")
var pe *fs.PathError
if errors.As(err, &pe) {
	fmt.Println(pe.Op, pe.Path, pe.Err) // open /khong/ton/tai.txt no such file or directory
}
```

:::tip[Value hay pointer receiver cho Error()?]

Thường dùng **pointer receiver** `func (e *MyErr) Error()` và trả `&MyErr{...}`. Khi đó mỗi lỗi là một con trỏ riêng, `errors.As(err, &target)` với `target *MyErr`. Quan trọng là **nhất quán**: nếu `Error()` có pointer receiver thì chỉ `*MyErr` là `error`, trả `MyErr{}` (giá trị) sẽ không biên dịch.

:::

### Lỗi kèm hành vi

Custom error type có thể có thêm method để người gọi kiểm tra hành vi thay vì kiểu:

```go
type HTTPError struct {
	Status int
	Msg    string
}

func (e *HTTPError) Error() string   { return fmt.Sprintf("%d: %s", e.Status, e.Msg) }
func (e *HTTPError) Retryable() bool { return e.Status >= 500 || e.Status == 429 }
```

---

## Sentinel error

**Sentinel error** (lỗi "lính canh") là biến lỗi được khai báo sẵn ở cấp package, đóng vai trò hằng số để người gọi so sánh:

```go
// Thư viện chuẩn
var EOF = errors.New("EOF")                                   // io.EOF
var ErrNoRows = errors.New("sql: no rows in result set")       // sql.ErrNoRows
var ErrNotExist = errors.New("file does not exist")           // fs.ErrNotExist (rút gọn)
var ErrServerClosed = errors.New("http: Server closed")        // http.ErrServerClosed
```

Quy ước đặt tên: tiền tố `Err` (biến lỗi xuất ra ngoài) hoặc `err` (nội bộ). Ngoại lệ lịch sử là `io.EOF`.

Tự khai báo sentinel cho domain của mình:

```go
package user

var (
	ErrNotFound     = errors.New("user: không tìm thấy")
	ErrEmailTaken   = errors.New("user: email đã được dùng")
	ErrInvalidLogin = errors.New("user: sai email hoặc mật khẩu")
)

func (r *Repo) FindByID(ctx context.Context, id int64) (*User, error) {
	var u User
	err := r.db.QueryRowContext(ctx, "SELECT id, name FROM users WHERE id = $1", id).
		Scan(&u.ID, &u.Name)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound // dịch lỗi tầng DB sang lỗi domain
	}
	if err != nil {
		return nil, fmt.Errorf("query user %d: %w", id, err)
	}
	return &u, nil
}
```

Tầng HTTP ánh xạ sentinel sang status code:

```go
func (h *Handler) getUser(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64) // Go 1.22: route "GET /users/{id}"
	if err != nil {
		http.Error(w, "id không hợp lệ", http.StatusBadRequest)
		return
	}
	u, err := h.repo.FindByID(r.Context(), id)
	switch {
	case errors.Is(err, user.ErrNotFound):
		http.Error(w, "không tìm thấy", http.StatusNotFound)
		return
	case err != nil:
		slog.Error("lấy user", "id", id, "err", err)
		http.Error(w, "lỗi hệ thống", http.StatusInternalServerError)
		return
	}
	_ = json.NewEncoder(w).Encode(u)
}
```

### io.EOF — sentinel không phải "lỗi"

`io.EOF` báo hiệu **hết dữ liệu** — trạng thái bình thường chứ không phải sự cố:

```go
r := bufio.NewReader(strings.NewReader("dòng 1\ndòng 2\n"))
for {
	line, err := r.ReadString('\n')
	if errors.Is(err, io.EOF) {
		break // đọc hết — kết thúc vòng lặp bình thường
	}
	if err != nil {
		return err // lỗi thật
	}
	fmt.Print(line)
}
```

| | Sentinel error | Custom error type |
| --- | --- | --- |
| Hình thức | `var ErrX = errors.New(...)` | `type XError struct{...}` |
| Kiểm tra | `errors.Is(err, ErrX)` | `errors.As(err, &target)` |
| Mang dữ liệu | Không (chỉ thông điệp) | Có (field tuỳ ý) |
| Dùng khi | Trạng thái rõ ràng: không tìm thấy, hết dữ liệu, đã đóng | Cần chi tiết: trường sai, mã lỗi, status |
| Nhược điểm | Trở thành API public — đổi là breaking change | Người gọi phụ thuộc vào kiểu |

:::warning[So sánh sentinel bằng ==]

Code cũ hay viết `if err == io.EOF`. Cách này **hỏng** khi lỗi bị wrap (`fmt.Errorf("đọc: %w", io.EOF)`). Từ Go 1.13, luôn dùng `errors.Is(err, io.EOF)`. Một số hàm như `Read` được tài liệu đảm bảo trả `io.EOF` nguyên bản, nhưng dùng `errors.Is` cho thống nhất vẫn an toàn hơn.

:::

---

## So sánh với try/catch

| Tiêu chí | Exception (Java, Python, JS) | Go error |
| --- | --- | --- |
| Lỗi nằm ở đâu | Ngoài chữ ký (trừ checked exception Java) | Trong chữ ký hàm |
| Luồng điều khiển | Nhảy vô hình lên tầng có `catch` | Tuần tự, `return` tường minh |
| Quên xử lý | Lỗi bay lên, có thể sập chương trình | Lỗi bị bỏ qua lặng lẽ (linter bắt được) |
| Độ dài code | Ngắn | Dài hơn vì `if err != nil` |
| Chi phí | Tạo stack trace tốn kém | Chỉ là giá trị trả về, rất rẻ |
| Stack trace | Có sẵn | Không có — thay bằng ngữ cảnh khi wrap |
| Lỗi "không thể phục hồi" | Cũng là exception | `panic` (hiếm khi dùng) |

```python
# Python: một try bọc nhiều dòng — dòng nào lỗi?
try:
    cfg = load_config(path)
    db = connect(cfg.dsn)
    users = db.query("SELECT ...")
except Exception as e:
    log.error(e)
```

```go
// Go: mỗi bước có ngữ cảnh riêng
cfg, err := loadConfig(path)
if err != nil {
	return fmt.Errorf("đọc config %s: %w", path, err)
}
db, err := connect(cfg.DSN)
if err != nil {
	return fmt.Errorf("kết nối db: %w", err)
}
users, err := db.Query(ctx, "SELECT ...")
if err != nil {
	return fmt.Errorf("lấy danh sách user: %w", err)
}
```

Thay vì stack trace, Go dựa vào **chuỗi ngữ cảnh** do mỗi tầng thêm vào: `xử lý request: lấy danh sách user: kết nối db: dial tcp 10.0.0.5:5432: connection refused` — đọc từ trái sang phải là thấy đường đi của lỗi.

---

## Câu hỏi phỏng vấn

**1. Vì sao Go không dùng exception? Ưu nhược điểm của cách "lỗi là giá trị"?**

<details className="qa">
<summary>Xem đáp án</summary>

Go muốn luồng lỗi hiện rõ trong code: lỗi nằm trong chữ ký hàm, người gọi buộc phải nhìn thấy và quyết định tại chỗ, không có bước nhảy vô hình. Ưu: dễ đọc luồng điều khiển, chi phí thấp (không tạo stack trace), lỗi được xử lý như dữ liệu (lưu, so sánh, gộp, wrap). Nhược: code dài vì `if err != nil` lặp lại; có thể vô tình bỏ qua lỗi (cần linter `errcheck`); không có stack trace sẵn — phải thêm ngữ cảnh khi wrap.

</details>

**2. `error` trong Go là gì? Làm sao tạo một kiểu lỗi riêng?**

<details className="qa">
<summary>Xem đáp án</summary>

`error` là interface dựng sẵn với một method `Error() string`. Tạo lỗi riêng bằng cách định nghĩa struct và hiện thực `Error()` — thường với pointer receiver — rồi trả `&MyError{...}`. Người gọi lấy lại dữ liệu bằng `errors.As(err, &target)`. Hàm luôn khai báo kiểu trả về là `error` (không phải `*MyError`) và `return nil` tường minh khi không có lỗi để tránh bẫy nil interface.

</details>

**3. Sentinel error là gì? Cho ví dụ trong thư viện chuẩn.**

<details className="qa">
<summary>Xem đáp án</summary>

Là biến lỗi khai báo sẵn ở cấp package để so sánh danh tính: `io.EOF`, `sql.ErrNoRows`, `fs.ErrNotExist`, `http.ErrServerClosed`, `context.Canceled`. Kiểm tra bằng `errors.Is(err, io.EOF)` (không dùng `==` vì lỗi có thể đã bị wrap). Nhược điểm: sentinel là một phần API public, tạo phụ thuộc giữa package; không mang thêm dữ liệu.

</details>

**4. `errors.New("x") == errors.New("x")` trả về gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`false`. `errors.New` trả con trỏ tới một struct mới mỗi lần gọi, nên hai lỗi cùng thông điệp vẫn là hai giá trị khác nhau. Đây cũng là lý do sentinel error phải được khai báo một lần thành biến package và mọi nơi trả về **cùng biến đó**.

</details>

**5. Vì sao thông điệp lỗi trong Go nên viết thường và không có dấu chấm cuối?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì lỗi thường được nối thêm ngữ cảnh khi truyền lên: `lưu đơn: thanh toán: timeout`. Chữ hoa hoặc dấu chấm ở giữa chuỗi trông sai. Đây là quy ước trong Go Code Review Comments, được `staticcheck` ST1005 kiểm tra. Ngoại lệ: danh từ riêng, từ viết tắt (`HTTP`, `JSON`).

</details>

**6. Khi nào dùng sentinel error, khi nào dùng custom error type?**

<details className="qa">
<summary>Xem đáp án</summary>

Sentinel khi trạng thái lỗi đơn giản, người gọi chỉ cần biết "có phải lỗi X không": không tìm thấy, hết dữ liệu, đã đóng. Custom error type khi người gọi cần dữ liệu đi kèm: trường không hợp lệ, mã lỗi nghiệp vụ, HTTP status, có retry được không. Nếu chỉ cần thông điệp cho người đọc log, dùng `fmt.Errorf` là đủ — không phải lỗi nào cũng cần kiểu riêng.

</details>
