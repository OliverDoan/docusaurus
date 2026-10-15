---
sidebar_position: 2
title: "2. Cú pháp cơ bản"
---

# 2. Cú pháp cơ bản

## 1. Biến và hằng số

Bài học: [1. Biến và hằng số](../../golang/02-co-ban/1_bien-hang-so.md)

**1. `var x = 1` và `x := 1` khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong hàm, cả hai đều khai báo biến `x` kiểu `int`. Khác biệt: `:=` **chỉ dùng trong hàm**, không ghi được kiểu tường minh, và có thể "gán lại" biến đã tồn tại cùng scope khi vế trái có ít nhất một biến mới. `var` dùng được ở cấp package, cho phép ghi kiểu (`var x int64 = 1`) hoặc chỉ khai báo để nhận zero value (`var x int`).

</details>

**2. Zero value là gì? Kể zero value của các kiểu chính.**

<details className="qa">
<summary>Xem đáp án</summary>

Giá trị mặc định mà Go gán cho mọi biến khai báo không khởi tạo — Go không có biến "chưa khởi tạo". Số: `0`; `bool`: `false`; `string`: `""`; con trỏ, slice, map, channel, func, interface: `nil`; array/struct: từng phần tử/field là zero value. Thư viện chuẩn thiết kế để zero value dùng được ngay (`sync.Mutex`, `bytes.Buffer`). Lưu ý map nil đọc được nhưng ghi sẽ panic.

</details>

**3. Untyped constant là gì? Vì sao `const n = 5; time.Sleep(n * time.Second)` chạy được còn với `const n int = 5` thì lỗi?**

<details className="qa">
<summary>Xem đáp án</summary>

Untyped constant là hằng chưa gắn kiểu cụ thể, chỉ có kiểu mặc định; nó được chuyển ngầm sang kiểu phù hợp với ngữ cảnh (miễn giá trị biểu diễn được). `n * time.Second` với `n` untyped → `n` được hiểu là `time.Duration`. Khi `n` là `int` có kiểu, phép nhân `int * time.Duration` lỗi vì Go không tự chuyển giữa hai kiểu khác nhau — phải viết `time.Duration(n) * time.Second`. Hằng untyped còn được tính với độ chính xác rất cao lúc biên dịch.

</details>

**4. `iota` hoạt động thế nào? Cho ví dụ tạo KB, MB, GB.**

<details className="qa">
<summary>Xem đáp án</summary>

`iota` là bộ đếm trong khối `const`, bắt đầu bằng 0 ở dòng đầu khối và tăng 1 mỗi dòng; dòng không ghi biểu thức lặp lại biểu thức dòng trước với `iota` mới. Reset về 0 ở mỗi khối `const` mới.

```go
const (
	_  = iota
	KB = 1 << (10 * iota) // 1024
	MB                    // 1048576
	GB                    // 1073741824
)
```

</details>

**5. Đoạn code sau có bug gì?**

```go
var err error
if cond {
	data, err := load()
	use(data)
}
return err
```

<details className="qa">
<summary>Xem đáp án</summary>

`data, err := load()` trong khối `if` tạo biến `err` **mới** che biến `err` bên ngoài (shadowing). Lỗi trả về từ `load()` chỉ nằm trong biến bên trong, nên hàm luôn trả `nil`. Sửa: khai báo `var data T` rồi dùng `data, err = load()`, hoặc tốt hơn là kiểm tra `if err != nil { return err }` ngay sau `load()`. Có thể bật analyzer `shadow` trong linter để phát hiện.

</details>

**6. Có thể khai báo hằng kiểu slice hay map không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. Hằng trong Go chỉ có thể là bool, số (integer, float, complex, rune) và string — giá trị phải xác định lúc biên dịch. Muốn dữ liệu "cố định" kiểu slice/map thì dùng `var` cấp package (quy ước không sửa, unexported để tránh package khác sửa), hoặc hàm trả về bản sao mới mỗi lần gọi để đảm bảo không ai thay đổi được dữ liệu gốc.

</details>

---

## 2. Kiểu dữ liệu cơ bản

Bài học: [2. Kiểu dữ liệu cơ bản](../../golang/02-co-ban/2_kieu-du-lieu.md)

**1. `len("Việt Nam")` bằng bao nhiêu? Làm sao đếm số ký tự?**

<details className="qa">
<summary>Xem đáp án</summary>

Bằng 10: `len` trả số **byte** của chuỗi UTF-8; "ệ" chiếm 3 byte nên "Việt" là 6 byte, cộng dấu cách và "Nam" là 10. Đếm số ký tự (code point) dùng `utf8.RuneCountInString(s)` hoặc `len([]rune(s))` (cách sau cấp phát thêm bộ nhớ). Nếu cần đếm "ký tự nhìn thấy" chính xác với dữ liệu tổ hợp, phải chuẩn hoá Unicode (NFC) trước.

</details>

**2. `byte` và `rune` khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`byte` là bí danh của `uint8`, biểu diễn một byte thô; `rune` là bí danh của `int32`, biểu diễn một Unicode code point. `s[i]` trả `byte` tại vị trí byte `i`; `for i, r := range s` giải mã UTF-8 và trả `rune` cùng vị trí byte bắt đầu. Dùng `[]byte` khi xử lý dữ liệu nhị phân, I/O; dùng `[]rune` khi cần thao tác theo ký tự.

</details>

**3. Vì sao string trong Go bất biến? Hệ quả là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Bất biến giúp string an toàn khi chia sẻ giữa nhiều goroutine mà không cần khoá, dùng làm key map an toàn, và truyền/gán rẻ (chỉ copy header gồm con trỏ + độ dài). Cắt chuỗi dùng chung bộ nhớ gốc. Hệ quả: mọi "sửa đổi" đều tạo string mới; nối chuỗi nhiều lần trong vòng lặp bằng `+` có độ phức tạp O(n²) — nên dùng `strings.Builder` hoặc `bytes.Buffer`. Lưu ý cắt một phần nhỏ từ chuỗi rất lớn có thể giữ cả chuỗi lớn trong bộ nhớ; dùng `strings.Clone` để tách ra.

</details>

**4. Chuyện gì xảy ra khi số nguyên bị tràn trong Go?**

<details className="qa">
<summary>Xem đáp án</summary>

Lúc chạy, Go **không panic** — giá trị quay vòng theo modulo 2^n (vd `int8(127) + 1` thành `-128`, `uint(0) - 1` thành giá trị lớn nhất). Tràn khi gán **hằng** thì bị bắt lúc biên dịch. Chia nguyên cho 0 thì panic. Muốn phát hiện tràn phải tự kiểm tra trước phép toán hoặc dùng `math/bits` (`bits.Add64`, `bits.Mul64` trả về carry/hi).

</details>

**5. `int` có bao nhiêu bit? Có nên dùng `int` thay `int64` không?**

<details className="qa">
<summary>Xem đáp án</summary>

`int` có kích thước bằng word của kiến trúc: 32 bit trên hệ 32 bit, 64 bit trên hệ 64 bit. Dùng `int` cho đếm, chỉ số, độ dài (thư viện chuẩn trả `int` cho `len`, `cap`). Dùng `int64` khi giá trị có ý nghĩa vượt phạm vi 32 bit bất kể nền tảng (ID, timestamp, tiền) hoặc khi cần định dạng cố định (serialization, database). `int` và `int64` là hai kiểu khác nhau, phải chuyển đổi tường minh.

</details>

**6. Vì sao không nên dùng `float64` để lưu tiền?**

<details className="qa">
<summary>Xem đáp án</summary>

`float64` là số thực nhị phân IEEE 754, không biểu diễn chính xác được nhiều số thập phân như 0.1 — cộng hai biến `float64` 0.1 và 0.2 ra `0.30000000000000004`. Cộng dồn nhiều giao dịch sẽ sai lệch, so sánh `==` không tin cậy. Giải pháp: lưu số nguyên ở đơn vị nhỏ nhất (`int64` đồng/cent), hoặc dùng thư viện decimal (`shopspring/decimal`), và ở database dùng kiểu `NUMERIC`/`DECIMAL`.

</details>

---

## 3. Chuyển đổi kiểu

Bài học: [3. Chuyển đổi kiểu](../../golang/02-co-ban/3_chuyen-doi-kieu.md)

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

---

## 4. Câu lệnh điều kiện

Bài học: [4. Câu lệnh điều kiện](../../golang/02-co-ban/4_dieu-kien.md)

**1. Câu lệnh khởi tạo trong `if` có tác dụng gì? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

`if init; cond { }` cho phép khai báo biến chỉ sống trong khối `if` và các nhánh `else if`/`else`. Lợi ích: giới hạn scope, tránh biến tạm rò rỉ và xung đột tên (nhất là `err`). Ví dụ: `if err := db.Ping(); err != nil { return err }` hoặc `if v, ok := m[k]; ok { use(v) }`. Không nên dùng khi giá trị cần dùng tiếp sau `if` — khi đó khai báo bên ngoài để tránh dồn logic vào `else`.

</details>

**2. `switch` trong Go khác C/Java thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Go tự `break` sau mỗi case (muốn rơi xuống phải dùng `fallthrough`); case có thể là biểu thức bất kỳ, không cần hằng; một case nhận nhiều giá trị phân tách bằng dấu phẩy; có câu lệnh khởi tạo; có dạng không biểu thức (`switch { case cond: }`) thay cho `if-else` dài; có type switch để rẽ nhánh theo kiểu. So sánh được với mọi kiểu comparable (string, struct...).

</details>

**3. `fallthrough` hoạt động thế nào? Có kiểm tra điều kiện của case kế tiếp không?**

<details className="qa">
<summary>Xem đáp án</summary>

`fallthrough` chuyển điều khiển sang **thân** của case kế tiếp **mà không đánh giá điều kiện** của case đó. Nó phải là câu lệnh cuối trong case, không dùng ở case cuối cùng và không dùng trong type switch. Vì dễ gây hiểu nhầm nên ít được dùng; thường thay bằng nhiều giá trị trong một case hoặc tách hàm.

</details>

**4. Trong vòng `for` có `switch`, `break` thoát khỏi đâu? Làm sao thoát cả vòng lặp?**

<details className="qa">
<summary>Xem đáp án</summary>

`break` thoát khỏi câu lệnh `for`, `switch` hoặc `select` **trong cùng nhất** — tức chỉ thoát `switch`, vòng lặp vẫn chạy tiếp. Muốn thoát vòng lặp: gắn nhãn cho `for` và dùng `break label`, hoặc tách thân vòng lặp vào hàm và `return`, hoặc dùng biến cờ. Lỗi này rất hay gặp với `select` trong vòng lặp đọc channel.

</details>

**5. Go không có toán tử 3 ngôi — vì sao? Viết thay thế thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

FAQ của Go giải thích: toán tử 3 ngôi hay bị lạm dụng tạo ra biểu thức lồng nhau khó đọc; `if-else` dài hơn một chút nhưng rõ ràng hơn, và ngôn ngữ chỉ cần **một** cấu trúc rẽ nhánh. Thay thế: gán giá trị mặc định rồi `if` ghi đè (`s := "b"; if cond { s = "a" }`), hoặc viết hàm nhỏ. Từ Go 1.18 có thể viết hàm generic `func If[T any](c bool, a, b T) T`, nhưng lưu ý cả `a` và `b` đều được tính trước khi gọi (không short-circuit).

</details>

**6. Phong cách "return sớm" là gì và vì sao code Go ưa chuộng?**

<details className="qa">
<summary>Xem đáp án</summary>

Xử lý lỗi và trường hợp đặc biệt ở đầu hàm bằng `if ... { return }`, để luồng chính (happy path) chạy thẳng ở mức thụt lề ngoài cùng, không bị bọc trong `else`. Vì Go xử lý lỗi bằng giá trị trả về, nếu không return sớm thì code sẽ lồng sâu theo số bước có thể lỗi. Return sớm giúp đọc từ trên xuống thấy ngay mọi điều kiện thoát, và linter (indent-error-flow) khuyến khích phong cách này.

</details>

---

## 5. Vòng lặp

Bài học: [5. Vòng lặp](../../golang/02-co-ban/5_vong-lap.md)

**1. Go có `while` không? Viết vòng lặp `while` và `do-while` thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không có từ khoá `while`; Go chỉ có `for`. `while (cond)` viết thành `for cond { }`; vòng vô hạn `for { }`. `do-while` (chạy ít nhất một lần) viết bằng `for { ...; if !cond { break } }`. Lý do: một cấu trúc lặp duy nhất giúp ngôn ngữ nhỏ và code đồng nhất.

</details>

**2. Thay đổi về biến vòng lặp trong Go 1.22 là gì? Đoạn code sau in gì với Go 1.21 và 1.22?**

```go
var fs []func()
for i := 0; i < 3; i++ {
	fs = append(fs, func() { fmt.Print(i) })
}
for _, f := range fs { f() }
```

<details className="qa">
<summary>Xem đáp án</summary>

Go 1.21 (hoặc module khai báo `go 1.21` trở xuống): in `333` — `i` là một biến dùng chung, các closure đều thấy giá trị cuối là 3. Go 1.22+: in `012` — mỗi lần lặp có biến `i` riêng. Thay đổi áp dụng cho cả `for` 3 phần và `for range`, kích hoạt theo dòng `go` trong `go.mod`. Trước đây phải viết `i := i` hoặc truyền tham số vào closure.

</details>

**3. Vì sao thứ tự duyệt map trong Go là ngẫu nhiên? Muốn duyệt có thứ tự thì làm sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Đặc tả không đảm bảo thứ tự; runtime cố ý chọn điểm bắt đầu ngẫu nhiên mỗi lần duyệt để lập trình viên không phụ thuộc vào thứ tự cài đặt (vốn có thể đổi khi map giãn hoặc khi Go đổi cài đặt — như chuyển sang Swiss table ở 1.24). Muốn có thứ tự: lấy danh sách key, sắp xếp rồi duyệt — `for _, k := range slices.Sorted(maps.Keys(m))` (Go 1.23+), hoặc append key vào slice và `sort.Strings`/`slices.Sort`.

</details>

**4. Trong `for _, v := range items { v.Price = 0 }`, slice `items` có bị thay đổi không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không (với `items` là slice struct). `v` là **bản sao** của phần tử, sửa `v` không ảnh hưởng slice. Muốn sửa phải dùng chỉ số: `for i := range items { items[i].Price = 0 }`, hoặc lấy con trỏ `p := &items[i]`. Nếu `items` là slice con trỏ (`[]*Item`) thì `v` là bản sao con trỏ, `v.Price = 0` sửa được object gốc.

</details>

**5. `break` trong `select` nằm trong vòng `for` thoát khỏi đâu? Xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`break` chỉ thoát câu lệnh `select` (cũng như `switch`) trong cùng nhất, vòng `for` tiếp tục chạy — bug hay gặp khi muốn dừng worker. Cách xử lý: gắn label cho vòng `for` và dùng `break label`; hoặc dùng `return` nếu vòng lặp nằm trong hàm riêng (cách được ưa chuộng vì dễ đọc).

</details>

**6. `for range ch` kết thúc khi nào? Rủi ro gì nếu quên `close`?**

<details className="qa">
<summary>Xem đáp án</summary>

Vòng lặp kết thúc khi channel **đã đóng và hết dữ liệu trong buffer**. Nếu bên gửi quên `close`, bên nhận chặn mãi: nếu không còn goroutine nào chạy được, runtime báo `all goroutines are asleep - deadlock!`; nếu chương trình còn goroutine khác (server), goroutine nhận bị rò rỉ âm thầm, tốn bộ nhớ. Quy tắc: bên gửi (owner) đóng channel, thường bằng `defer close(ch)`.

</details>
