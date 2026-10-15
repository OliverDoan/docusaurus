---
sidebar_position: 3
title: "3. Kiểu tổng hợp"
---

# 3. Kiểu tổng hợp

## 1. Array và Slice

Bài học: [1. Array và Slice](../../golang/03-kieu-tong-hop/1_array-slice.md)

**1. Array và slice trong Go khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Array** có độ dài cố định, độ dài là một phần của kiểu (`[3]int` khác `[4]int`), là **giá trị** — gán/truyền là copy toàn bộ, so sánh được bằng `==`.
- **Slice** là header 3 trường (con trỏ tới mảng nền, `len`, `cap`), độ dài động, gán/truyền chỉ copy header nên dùng chung dữ liệu; không so sánh bằng `==` được (chỉ so với `nil`).

Thực tế hầu như luôn dùng slice; array dùng cho dữ liệu kích thước cố định như hash, key của map.

</details>

**2. Đoạn code sau in ra gì? Vì sao?**

```go
a := []int{1, 2, 3, 4}
b := a[:2]
b = append(b, 9)
fmt.Println(a)
```

<details className="qa">
<summary>Xem đáp án</summary>

In `[1 2 9 4]`. `b` có len 2 nhưng cap 4 (dùng chung mảng nền với `a`). `append` còn chỗ trong cap nên ghi `9` vào vị trí index 2 của mảng nền — chính là `a[2]`. Muốn tránh: `b := a[:2:2]` (giới hạn cap) hoặc `b := slices.Clone(a[:2])`.

</details>

**3. `append` hoạt động thế nào khi hết capacity? Vì sao phải viết `s = append(s, x)`?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi `len == cap`, runtime cấp một mảng nền mới lớn hơn (gấp đôi khi cap nhỏ hơn 256, sau đó hệ số giảm dần về khoảng 1.25x, rồi làm tròn theo size class), copy các phần tử cũ sang, ghi phần tử mới và trả về header mới trỏ tới mảng mới. Vì `append` có thể trả về header khác (ptr khác, len luôn khác), bắt buộc phải gán lại; nếu không, biến cũ vẫn giữ len cũ và có thể trỏ vào mảng cũ.

</details>

**4. nil slice và empty slice khác nhau ở đâu? Khi nào cần quan tâm?**

<details className="qa">
<summary>Xem đáp án</summary>

nil slice (`var s []int`) có ptr = nil; empty slice (`[]int{}`) có ptr khác nil. Cả hai `len == 0`, đều `append`, `range` bình thường. Khác biệt: `s == nil` cho kết quả khác, `json.Marshal` cho `null` và `[]`, một số thư viện (như `reflect.DeepEqual`) coi chúng khác nhau. Kiểm tra rỗng nên dùng `len(s) == 0`; với response API nên trả `[]` để client không phải xử lý `null`.

</details>

**5. Làm sao để slice con không ảnh hưởng tới slice gốc?**

<details className="qa">
<summary>Xem đáp án</summary>

- Copy dữ liệu: `slices.Clone(s[a:b])`, hoặc `dst := make([]T, b-a); copy(dst, s[a:b])`.
- Nếu chỉ cần chặn `append` ghi đè: full slice expression `s[a:b:b]` khiến cap = len, lần `append` đầu tiên sẽ cấp mảng mới. Lưu ý gán `t[0] = x` vẫn sửa slice gốc vì chưa tách mảng nền.

</details>

**6. Vì sao giữ một sub-slice nhỏ của slice lớn có thể gây tốn bộ nhớ?**

<details className="qa">
<summary>Xem đáp án</summary>

Sub-slice giữ con trỏ tới mảng nền gốc, nên GC không thể thu hồi cả mảng lớn dù bạn chỉ dùng vài phần tử. Ví dụ đọc file 100MB vào `[]byte` rồi giữ lại `data[:10]` làm header → 100MB vẫn sống. Cách xử lý: copy phần cần giữ ra slice mới (`slices.Clone`, `bytes.Clone`) để mảng gốc được giải phóng.

</details>

---

## 2. Map

Bài học: [2. Map](../../golang/03-kieu-tong-hop/2_map.md)

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

---

## 3. Struct

Bài học: [3. Struct](../../golang/03-kieu-tong-hop/3_struct.md)

**1. Go không có class và kế thừa, vậy mô hình hoá đối tượng thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng struct cho dữ liệu, method gắn lên kiểu cho hành vi, interface (thoả mãn ngầm định) cho đa hình, và embedding cho tái sử dụng (composition). Embedding promote trường và method của kiểu nhúng lên kiểu ngoài nhưng không tạo quan hệ "is-a": không thể dùng struct ngoài ở chỗ cần kiểu nhúng, không có override/virtual dispatch.

</details>

**2. Khi nào hai struct so sánh được bằng `==`?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi mọi trường đều thuộc kiểu comparable (không chứa slice, map, func). Hai giá trị bằng nhau khi từng trường tương ứng bằng nhau. Struct comparable dùng được làm key của map. Nếu struct chứa slice/map thì `==` là lỗi biên dịch; phải tự viết hàm so sánh hoặc dùng `reflect.DeepEqual` (thường chỉ trong test).

</details>

**3. Vì sao trường của struct không xuất hiện khi `json.Marshal`?**

<details className="qa">
<summary>Xem đáp án</summary>

Các nguyên nhân thường gặp: trường viết thường (unexported) — `encoding/json` dùng reflection và không truy cập được; tag là `json:"-"`; có `omitempty` và giá trị đang là zero value; tag sai cú pháp (thừa dấu cách sau dấu hai chấm) khiến tên bị hiểu sai. Kiểm tra bằng `go vet` để bắt lỗi tag.

</details>

**4. `omitempty` hoạt động thế nào? Có bỏ được trường kiểu `time.Time` không?**

<details className="qa">
<summary>Xem đáp án</summary>

`omitempty` bỏ trường khi giá trị là `false`, `0`, `""`, con trỏ/interface `nil`, slice/map/array có len 0. Struct (kể cả `time.Time`) không bao giờ được coi là empty nên vẫn xuất ra. Cách xử lý: dùng con trỏ `*time.Time` (nil thì bị bỏ), hoặc từ Go 1.24 dùng tag `omitzero` — bỏ trường khi là zero value, gọi `IsZero()` nếu kiểu có method này.

</details>

**5. Embedding khác kế thừa ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- Embedding là **has-a** được viết tắt: struct ngoài chứa một trường kiểu nhúng, compiler cho phép truy cập trực tiếp trường/method của nó.
- Không có quan hệ kiểu: `Customer` không gán được cho biến `Address`.
- Không có override thực sự: method của kiểu nhúng gọi method khác thì luôn gọi phiên bản của chính nó, không gọi phiên bản "ghi đè" ở struct ngoài.
- Nhờ promote method, struct ngoài có thể thoả mãn interface mà kiểu nhúng thoả mãn — đây là cách "tái sử dụng" chính trong Go.

</details>

**6. `struct{}` dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`struct{}` chiếm 0 byte, dùng khi chỉ cần sự tồn tại chứ không cần dữ liệu: value của map làm set (`map[string]struct{}`), tín hiệu qua channel (`chan struct{}` với `close(done)`), hoặc kiểu không trạng thái chỉ để gắn method thoả mãn interface.

</details>

---

## 4. String và Rune

Bài học: [4. String và Rune](../../golang/03-kieu-tong-hop/4_string-rune.md)

**1. `len("Việt Nam")` bằng bao nhiêu? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Bằng 10. `len` trên string trả về **số byte**. Chuỗi được mã hoá UTF-8: "ệ" chiếm 3 byte, các ký tự ASCII còn lại 1 byte (7 ký tự ASCII + 3 byte = 10). Số ký tự (rune) là 8, lấy bằng `utf8.RuneCountInString` hoặc `len([]rune(s))`.

</details>

**2. byte và rune khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`byte` là alias của `uint8`, biểu diễn một byte dữ liệu. `rune` là alias của `int32`, biểu diễn một Unicode code point. `s[i]` trả về byte; `for _, r := range s` trả về rune (giải mã UTF-8). Rune literal viết bằng nháy đơn `'a'`.

</details>

**3. Duyệt chuỗi bằng `for i := 0; i < len(s); i++` và `for i, r := range s` khác gì nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

Vòng `for` theo index đi qua từng **byte**, `s[i]` là byte — ký tự nhiều byte bị tách rời. `for range` giải mã UTF-8 và đi qua từng **rune**; `i` là vị trí byte bắt đầu của rune nên có thể nhảy cóc (0, 1, 2, 5...). Byte không hợp lệ được trả về là `utf8.RuneError` và tiến 1 byte.

</details>

**4. Vì sao string trong Go là bất biến? Lợi ích là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Bất biến cho phép chia sẻ vùng nhớ an toàn: substring `s[a:b]` và gán string chỉ copy header (con trỏ + độ dài), không copy dữ liệu; string an toàn khi dùng từ nhiều goroutine mà không cần khoá; dùng làm key map ổn định vì hash không đổi. Đổi lại, sửa nội dung phải chuyển sang `[]byte`/`[]rune` (có copy) và nối chuỗi lặp lại tốn kém.

</details>

**5. Vì sao nên dùng `strings.Builder` thay vì `+=` trong vòng lặp?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi `s += x` cấp phát chuỗi mới và copy toàn bộ nội dung cũ → n lần nối tốn O(n²) thời gian và tạo nhiều rác cho GC. `strings.Builder` giữ buffer `[]byte` tăng trưởng kiểu `append` (amortized O(1) mỗi lần ghi), có `Grow` để cấp trước, và `String()` trả về chuỗi mà không copy lại buffer.

</details>

**6. `string(65)` cho ra gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Ra `"A"`, vì chuyển số nguyên sang string được hiểu là chuyển **code point** sang ký tự UTF-8. `go vet` cảnh báo cách viết này. Muốn được `"65"` phải dùng `strconv.Itoa(65)` hoặc `fmt.Sprint(65)`.

</details>
