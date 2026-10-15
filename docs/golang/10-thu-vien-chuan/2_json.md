---
sidebar_position: 2
title: "2. encoding/json"
---

# encoding/json

JSON là định dạng trao đổi dữ liệu phổ biến nhất của API web, file cấu hình và message queue. Go xử lý JSON bằng package chuẩn `encoding/json`: chuyển struct thành JSON (marshal) và ngược lại (unmarshal), điều khiển tên trường bằng struct tag, đọc ghi dạng stream, và cho phép tự định nghĩa cách mã hoá cho từng kiểu. Bài này đi từ cơ bản tới các bẫy hay gặp khi làm API thật — số bị biến thành `float64`, field chữ thường bị bỏ qua, client gửi sai tên trường mà không ai báo.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Chỉ field exported (chữ hoa đầu) mới được marshal/unmarshal** — field chữ thường bị bỏ qua âm thầm, không báo lỗi.
- ⭐ **Decode vào `map[string]any` thì mọi số thành `float64`** — ID lớn hơn 2^53 bị mất chính xác; dùng struct có kiểu rõ ràng hoặc `Decoder.UseNumber()`.
- **Struct tag điều khiển tên và hành vi** — `json:"name"`, `omitempty`, `omitzero` (Go 1.24), `"-"` (bỏ qua), `,string` (số dạng chuỗi).
- **HTTP body dùng `json.NewDecoder(r.Body)`**, kèm `DisallowUnknownFields()` khi muốn bắt client gửi sai tên trường.
- **`json.RawMessage` để hoãn decode** — đọc trường `type` trước rồi mới quyết định decode `payload` vào struct nào.

:::

---

## Mục lục

- [Vì sao cần encoding/json?](#vì-sao-cần-encodingjson)
- [Marshal và Unmarshal](#marshal-và-unmarshal)
- [Struct tag](#struct-tag)
- [Decoder và Encoder: làm việc với stream](#decoder-và-encoder-làm-việc-với-stream)
- [Dữ liệu động: map, any và RawMessage](#dữ-liệu-động-map-any-và-rawmessage)
- [Tuỳ biến với MarshalJSON và UnmarshalJSON](#tuỳ-biến-với-marshaljson-và-unmarshaljson)
- [Xử lý lỗi và các bẫy hay gặp](#xử-lý-lỗi-và-các-bẫy-hay-gặp)
- [encoding/json/v2](#encodingjsonv2)

---

## Vì sao cần encoding/json?

**Vấn đề:** Tự ghép chuỗi JSON bằng tay vừa dài vừa dễ sai:

```go
// Nếu name chứa dấu " hoặc \n → JSON hỏng, thậm chí bị chèn dữ liệu (injection)
body := fmt.Sprintf(`{"id":%d,"name":"%s"}`, u.ID, u.Name)
```

Chiều ngược lại còn tệ hơn: tự tách chuỗi để lấy giá trị, xử lý escape, Unicode, mảng lồng nhau...

**Giải pháp:** Khai báo struct, để `encoding/json` lo phần còn lại bằng reflection:

```go
type User struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

b, err := json.Marshal(User{ID: 1, Name: `An "Béo"`})
// {"id":1,"name":"An \"Béo\""} — escape đúng chuẩn

var u User
err = json.Unmarshal([]byte(`{"id":2,"name":"Bình"}`), &u)
// u = {ID:2 Name:Bình}
```

:::tip[Dùng thực tế]

- **REST API**: decode request body vào struct, encode response struct ra JSON.
- **Gọi API bên thứ ba** (thanh toán, gửi SMS): decode response vào struct chỉ chứa các trường cần dùng.
- **Message queue** (Kafka, RabbitMQ): event có trường `type` + `payload` đa hình → dùng `json.RawMessage`.
- **File cấu hình, cache Redis**: lưu struct dạng JSON, đọc lại khi khởi động.

:::

:::tip[Ví dụ đời thường]

Marshal giống **đóng gói hàng gửi chuyển phát**: món đồ (struct trong bộ nhớ) được bỏ vào thùng có nhãn ghi rõ từng ngăn (tên trường JSON). Struct tag chính là **phiếu ghi chú cho nhân viên đóng gói**: "ngăn này đổi tên thành `created_at`", "ngăn này trống thì khỏi gửi" (`omitempty`), "mật khẩu tuyệt đối không bỏ vào thùng" (`"-"`). Người nhận ở đầu kia (unmarshal) mở thùng và xếp đồ vào đúng ngăn tủ của mình theo nhãn.

:::

---

## Marshal và Unmarshal

```go
type Product struct {
	ID    int      `json:"id"`
	Name  string   `json:"name"`
	Price float64  `json:"price"`
	Tags  []string `json:"tags"`
}

// Struct → JSON
p := Product{ID: 1, Name: "Cà phê", Price: 35000, Tags: []string{"đồ uống"}}
b, err := json.Marshal(p)
if err != nil {
	return err
}
fmt.Println(string(b))
// {"id":1,"name":"Cà phê","price":35000,"tags":["đồ uống"]}

// JSON → struct: phải truyền CON TRỎ
var p2 Product
if err := json.Unmarshal(b, &p2); err != nil {
	return err
}
```

`MarshalIndent` cho JSON dễ đọc (dùng khi in log debug, ghi file cấu hình):

```go
b, _ := json.MarshalIndent(p, "", "  ") // prefix rỗng, thụt 2 dấu cách
```

### Bảng ánh xạ kiểu

| Kiểu Go | JSON |
|---------|------|
| `bool` | `true` / `false` |
| `int`, `float64`... | number |
| `string` | string (UTF-8, có escape) |
| `[]T`, array | array (slice `nil` → `null`, slice rỗng → `[]`) |
| `[]byte` | string **base64** |
| `map[string]T` | object (key được sắp theo thứ tự chữ cái) |
| struct | object (chỉ field exported) |
| con trỏ | giá trị được trỏ tới, `nil` → `null` |
| `time.Time` | string RFC 3339, ví dụ `"2026-10-15T09:00:00+07:00"` |
| interface `any` | theo kiểu động bên trong |

Vài quy tắc khi unmarshal cần biết:

- **Tên trường so khớp không phân biệt hoa thường**: `"NAME"` vẫn vào field có tag `json:"name"`.
- **Trường có trong JSON nhưng không có trong struct bị bỏ qua** (trừ khi bật `DisallowUnknownFields`).
- **Trường thiếu trong JSON giữ nguyên giá trị hiện tại** của struct — không bị reset về zero value. Muốn có giá trị mặc định thì gán trước khi `Unmarshal`.
- **`null` vào kiểu không phải con trỏ/slice/map/interface** thì không làm gì.

---

## Struct tag

```go
type User struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email,omitempty"`      // rỗng thì không xuất
	Password  string    `json:"-"`                    // KHÔNG bao giờ xuất ra JSON
	Balance   int64     `json:"balance,string"`       // xuất dạng "9007199254740993"
	CreatedAt time.Time `json:"created_at,omitzero"`  // Go 1.24: zero time thì bỏ
	Nickname  string    `json:",omitempty"`           // giữ tên field "Nickname"
}
```

| Tag | Ý nghĩa |
|-----|---------|
| `json:"name"` | Đổi tên trường trong JSON |
| `json:"name,omitempty"` | Bỏ khi giá trị "rỗng": `false`, `0`, `""`, `nil`, slice/map **độ dài 0** |
| `json:"name,omitzero"` | (Go 1.24) Bỏ khi là **zero value**; nếu kiểu có method `IsZero() bool` thì dùng method đó |
| `json:"-"` | Luôn bỏ qua field |
| `json:"-,"` | Trường tên đúng là `"-"` (hiếm dùng) |
| `json:"name,string"` | Số/bool được mã hoá trong chuỗi JSON — hữu ích cho ID `int64` gửi cho JavaScript |

### omitempty và omitzero

`omitempty` có một điểm yếu kinh điển: **không có tác dụng với struct**, vì struct không bao giờ được coi là "rỗng". `time.Time` là struct, nên:

```go
type Opt struct {
	T time.Time `json:"t,omitempty"`
}
b, _ := json.Marshal(Opt{})
// {"t":"0001-01-01T00:00:00Z"} — omitempty vô dụng!
```

Trước Go 1.24 phải đổi thành `*time.Time`. Từ Go 1.24, dùng `omitzero`: nó gọi `time.Time.IsZero()` và bỏ trường đúng như mong đợi. Ngoài ra `omitzero` phân biệt slice `nil` (bỏ) với slice rỗng `[]int{}` (vẫn xuất `[]`), còn `omitempty` bỏ cả hai.

### Phân biệt "không gửi" với "gửi giá trị zero"

Với API cập nhật một phần (PATCH), cần biết client **không gửi** `age` hay **gửi** `age: 0`. Dùng con trỏ:

```go
type UpdateUserRequest struct {
	Name *string `json:"name"`
	Age  *int    `json:"age"`
}

// {"age":0}  → Name == nil (không đổi), *Age == 0 (đặt về 0)
// {}         → cả hai nil (không đổi gì)
```

---

## Decoder và Encoder: làm việc với stream

`Marshal`/`Unmarshal` làm việc với `[]byte` có sẵn trong bộ nhớ. Khi dữ liệu đến từ `io.Reader` (HTTP body, file, socket), dùng `json.NewDecoder`/`json.NewEncoder`:

```go
func createUser(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // tối đa 1MB

	var req CreateUserRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields() // client gửi "nmae" thay vì "name" → lỗi rõ ràng
	if err := dec.Decode(&req); err != nil {
		http.Error(w, "JSON không hợp lệ: "+err.Error(), http.StatusBadRequest)
		return
	}

	user := User{ID: 1, Name: req.Name}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(user); err != nil { // Encode tự thêm "\n" ở cuối
		log.Printf("ghi response: %v", err)
	}
}
```

### Đọc nhiều object liên tiếp (NDJSON)

Decoder có thể đọc lần lượt nhiều giá trị JSON nối nhau — định dạng JSON Lines / NDJSON hay dùng cho log và export dữ liệu lớn:

```go
dec := json.NewDecoder(f) // file mỗi dòng một object
for {
	var ev Event
	err := dec.Decode(&ev)
	if errors.Is(err, io.EOF) {
		break // hết dữ liệu
	}
	if err != nil {
		return err
	}
	handle(ev)
}
```

Với một **mảng JSON khổng lồ** (`[{...},{...},...]` vài GB), dùng `dec.Token()` để đọc dấu `[`, rồi lặp `dec.More()` + `dec.Decode(&item)` — mỗi lần chỉ giữ một phần tử trong bộ nhớ.

### Tuỳ chọn của Encoder

```go
enc := json.NewEncoder(os.Stdout)
enc.SetIndent("", "  ")   // in đẹp
enc.SetEscapeHTML(false)  // mặc định <, >, & bị escape thành <... để an toàn khi nhúng vào HTML
```

:::warning[Decoder đọc thừa]

`json.NewDecoder` đọc trước dữ liệu vào bộ đệm riêng, và `Decode` dừng sau giá trị JSON **đầu tiên** — phần rác phía sau (`{"a":1}xyz`) không gây lỗi. Nếu cần chặt chẽ, sau `Decode` gọi thêm `dec.Decode(&struct{}{})` và kiểm tra nó trả `io.EOF`. `json.Unmarshal` thì luôn báo lỗi nếu có dữ liệu thừa.

:::

---

## Dữ liệu động: map, any và RawMessage

### Decode vào map[string]any

Khi không biết trước cấu trúc:

```go
var m map[string]any
json.Unmarshal([]byte(`{"id":123,"tags":["a"],"x":{"y":true}}`), &m)

fmt.Printf("%T %T %T\n", m["id"], m["tags"], m["x"])
// float64 []interface {} map[string]interface {}

id := int(m["id"].(float64)) // phải type assertion qua float64
```

| JSON | Kiểu Go khi decode vào `any` |
|------|------------------------------|
| number | **`float64`** |
| string | `string` |
| bool | `bool` |
| array | `[]any` |
| object | `map[string]any` |
| null | `nil` |

:::warning[Số lớn bị mất chính xác]

`float64` chỉ biểu diễn chính xác số nguyên tới 2^53 (khoảng 9 triệu tỷ). ID kiểu Snowflake/Twitter `1234567890123456789` decode vào `any` sẽ thành số **khác**. Hai cách sửa:

- Decode vào struct có field `int64` — luôn là lựa chọn tốt nhất.
- Dùng `dec.UseNumber()`: số được giữ dạng `json.Number` (thực chất là string), rồi gọi `.Int64()` khi cần.

:::

### json.RawMessage — hoãn decode

Event đa hình: trường `type` quyết định `payload` có dạng nào.

```go
type Event struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"` // giữ nguyên byte, chưa decode
}

type OrderCreated struct {
	OrderID int `json:"order_id"`
	Amount  int `json:"amount"`
}

func handle(data []byte) error {
	var ev Event
	if err := json.Unmarshal(data, &ev); err != nil {
		return err
	}
	switch ev.Type {
	case "order_created":
		var p OrderCreated
		if err := json.Unmarshal(ev.Payload, &p); err != nil {
			return err
		}
		fmt.Println("đơn mới", p.OrderID, p.Amount)
	case "order_cancelled":
		// decode vào struct khác
	default:
		return fmt.Errorf("event không hỗ trợ: %s", ev.Type)
	}
	return nil
}
```

`RawMessage` cũng hữu ích khi marshal: nhúng một đoạn JSON đã có sẵn (lấy từ cache) vào response mà không cần decode rồi encode lại.

---

## Tuỳ biến với MarshalJSON và UnmarshalJSON

Kiểu nào hiện thực `json.Marshaler` / `json.Unmarshaler` sẽ được `encoding/json` gọi thay vì dùng reflection. Ví dụ enum lưu dạng số trong code nhưng muốn JSON là chuỗi dễ đọc:

```go
type Status int

const (
	StatusActive Status = iota + 1
	StatusBlocked
)

// Value receiver: dùng được cho cả Status và *Status
func (s Status) MarshalJSON() ([]byte, error) {
	switch s {
	case StatusActive:
		return json.Marshal("active")
	case StatusBlocked:
		return json.Marshal("blocked")
	}
	return nil, fmt.Errorf("status không hợp lệ: %d", int(s))
}

// Pointer receiver: bắt buộc, vì phải sửa giá trị
func (s *Status) UnmarshalJSON(b []byte) error {
	var str string
	if err := json.Unmarshal(b, &str); err != nil {
		return err
	}
	switch str {
	case "active":
		*s = StatusActive
	case "blocked":
		*s = StatusBlocked
	default:
		return fmt.Errorf("status không hợp lệ: %q", str)
	}
	return nil
}

type Account struct {
	ID     int    `json:"id"`
	Status Status `json:"status"`
}
// json.Marshal(Account{1, StatusBlocked}) → {"id":1,"status":"blocked"}
// Unmarshal `{"status":"deleted"}`        → lỗi: status không hợp lệ: "deleted"
```

Với kiểu chỉ cần chuyển sang/từ chuỗi, hiện thực `encoding.TextMarshaler` (`MarshalText`) / `TextUnmarshaler` là đủ — `encoding/json` dùng nó cho cả giá trị lẫn **key của map**.

:::warning[Đệ quy vô hạn trong MarshalJSON]

Gọi `json.Marshal(u)` bên trong `func (u User) MarshalJSON()` sẽ gọi lại chính nó → tràn stack. Mẹo chuẩn là khai báo một **kiểu alias** không có method:

```go
func (u User) MarshalJSON() ([]byte, error) {
	type alias User // alias không kế thừa method MarshalJSON
	return json.Marshal(struct {
		alias
		DisplayName string `json:"display_name"`
	}{alias(u), strings.ToUpper(u.Name)})
}
```

:::

---

## Xử lý lỗi và các bẫy hay gặp

### Phân loại lỗi

```go
var syntaxErr *json.SyntaxError
var typeErr *json.UnmarshalTypeError

err := json.Unmarshal(data, &u)
switch {
case errors.As(err, &syntaxErr):
	// JSON sai cú pháp — syntaxErr.Offset cho biết vị trí byte
case errors.As(err, &typeErr):
	// Sai kiểu: "json: cannot unmarshal string into Go struct field User.id of type int64"
	// typeErr.Field = "id"
case err != nil:
	// lỗi khác (từ UnmarshalJSON tự viết, unknown field...)
}
```

### Bẫy field unexported

```go
type config struct {
	host string // chữ thường → encoding/json không nhìn thấy
	Port int
}
b, _ := json.Marshal(config{host: "localhost", Port: 8080})
// {"Port":8080} — host biến mất, KHÔNG có lỗi nào
```

Package `encoding/json` nằm ở package khác nên không truy cập được field unexported. Tên **kiểu** (`config`) viết thường thì không sao — chỉ tên **field** mới quan trọng. `go vet` có cảnh báo khi field unexported mà lại gắn tag `json`.

### Tổng hợp bẫy

| Bẫy | Hậu quả | Cách tránh |
|-----|---------|------------|
| Field chữ thường | Bị bỏ qua âm thầm | Viết hoa chữ đầu, đặt tên JSON bằng tag |
| Quên `&` khi `Unmarshal` | Lỗi `json: Unmarshal(non-pointer ...)` | Luôn truyền con trỏ |
| Decode số vào `any` | Thành `float64`, mất chính xác | Struct có kiểu, hoặc `UseNumber()` |
| `omitempty` trên `time.Time`/struct | Không có tác dụng | `omitzero` (Go 1.24) hoặc con trỏ |
| Slice `nil` | Xuất `null` thay vì `[]`, frontend lỗi `.map` | Khởi tạo `[]T{}`, hoặc `omitzero` nếu muốn bỏ |
| Client gõ sai tên trường | Trường bị bỏ qua, giá trị zero lọt vào DB | `DisallowUnknownFields()` + validate |
| Decode vào struct đã có dữ liệu | Trường thiếu giữ giá trị cũ | Dùng biến mới cho mỗi lần decode |
| Key map không phải string/số/TextMarshaler | Lỗi `unsupported type` | Đổi kiểu key |

---

## encoding/json/v2

`encoding/json` (v1) có nhiều hành vi khó sửa vì phải giữ tương thích: so khớp tên không phân biệt hoa thường, slice `nil` thành `null`, `omitempty` khó hiểu, hiệu năng hạn chế. Go 1.25 đưa vào **thử nghiệm** hai package mới:

- `encoding/json/jsontext` — xử lý cú pháp JSON ở mức token, stream hiệu năng cao.
- `encoding/json/v2` — API mới (`json.Marshal`, `json.Unmarshal`, `MarshalWrite`, `UnmarshalRead`...) với mặc định chặt chẽ hơn: so khớp tên **phân biệt** hoa thường, báo lỗi khi trùng key, slice/map `nil` mặc định thành `[]`/`{}`, và cho phép cấu hình bằng các option.

Chỉ dùng được khi build với biến môi trường `GOEXPERIMENT=jsonv2`; khi bật, `encoding/json` v1 cũng chạy trên lõi mới (hành vi giữ như cũ, nhưng nhanh hơn). API còn có thể thay đổi, nên code production hiện tại vẫn dùng `encoding/json`. Theo dõi tình trạng tại [pkg.go.dev/encoding/json/v2](https://pkg.go.dev/encoding/json/v2).

```bash
GOEXPERIMENT=jsonv2 go run .
```

Nếu cần hiệu năng cao ngay hôm nay, các thư viện bên thứ ba phổ biến là `github.com/goccy/go-json` và `github.com/bytedance/sonic` (API gần như tương thích `encoding/json`).
