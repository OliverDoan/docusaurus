---
sidebar_position: 5
title: "5. Method và Interface"
---

# 5. Method và Interface

## 1. Method

Bài học: [1. Method](../../golang/05-method-interface/1_method.md)

**1. Method khác function như thế nào trong Go?**

<details className="qa">
<summary>Xem đáp án</summary>

Method là function có thêm **receiver** — gắn với một kiểu được định nghĩa trong cùng package. Về mặt thực thi, receiver chỉ là tham số đầu tiên (method expression `T.M` cho thấy rõ điều này). Khác biệt thực tế: method nằm trong namespace của kiểu (hai kiểu có thể cùng tên method), gọi bằng cú pháp `v.M()`, và quan trọng nhất là **method giúp kiểu thoả mãn interface** — function rời thì không.

</details>

**2. Khi nào dùng pointer receiver, khi nào dùng value receiver?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng pointer receiver khi: method cần sửa receiver; struct lớn (tránh copy); struct chứa thứ không được copy như `sync.Mutex`; hoặc kiểu đã có method pointer receiver khác (nhất quán). Dùng value receiver khi kiểu nhỏ, bất biến, hoặc là map/func/chan — ví dụ `time.Time`, `Point`, kiểu enum số. Phân vân thì chọn pointer. Không nên trộn hai loại trên một kiểu.

</details>

**3. Vì sao `var i Incrementer = Counter{}` báo lỗi trong khi `c.Inc()` vẫn gọi được?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `Inc` có pointer receiver nên chỉ thuộc **method set của `*Counter`**, không thuộc method set của `Counter`. Gọi trực tiếp `c.Inc()` được là do compiler tự viết lại thành `(&c).Inc()` khi `c` addressable. Còn khi gán vào interface, Go chỉ xét method set — và giá trị nằm trong interface không addressable (nếu cho phép thì method sẽ sửa bản sao ẩn bên trong interface). Sửa: gán `&Counter{}`.

</details>

**4. Có thể khai báo method cho `int` hay `time.Time` không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. Kiểu receiver phải được định nghĩa trong cùng package. Cách làm: định nghĩa kiểu mới `type Age int` rồi gắn method; hoặc embed `type MyTime struct{ time.Time }` để vừa giữ method của `time.Time` vừa thêm method mới. Lưu ý `type MyTime time.Time` (type definition) **không** thừa hưởng method của `time.Time`, còn alias `type X = time.Time` thì không khai báo thêm method được.

</details>

**5. Method value và method expression khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Method value `v.M` gắn sẵn receiver `v` (được đánh giá và copy ngay lúc tạo nếu là value receiver), cho ra hàm không cần receiver — hay dùng làm callback (`mux.HandleFunc("/x", s.handleX)`). Method expression `T.M` hoặc `(*T).M` cho ra function mà receiver là tham số đầu tiên — dùng khi muốn chọn method động mà chưa có receiver.

</details>

**6. Đoạn code này in ra gì và vì sao?**

```go
for _, it := range items {
	it.Discount(10) // Discount có pointer receiver
}
```

<details className="qa">
<summary>Xem đáp án</summary>

Slice `items` không thay đổi. Biến `it` trong `for range` là **bản sao** của từng phần tử; `it.Discount(10)` thành `(&it).Discount(10)` — sửa bản sao. Từ Go 1.22, `it` còn là biến mới mỗi vòng lặp, nhưng vẫn là bản sao. Sửa: `for i := range items { items[i].Discount(10) }` hoặc dùng slice con trỏ `[]*Item`.

</details>

---

## 2. Interface

Bài học: [2. Interface](../../golang/05-method-interface/2_interface.md)

**1. Go không có từ khoá `implements`, vậy làm sao biết một kiểu thoả mãn interface? Lợi ích là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Kiểu thoả mãn interface khi method set của nó chứa đủ method của interface — compiler kiểm tra tại chỗ gán/truyền. Lợi ích: interface có thể khai báo ở phía dùng, chỉ gồm method cần thiết; kiểu của thư viện bên thứ ba cũng thoả mãn interface của mình mà không cần adapter; package hiện thực không cần import package khai báo interface, giảm phụ thuộc. Muốn đảm bảo lúc biên dịch, dùng `var _ I = (*T)(nil)`.

</details>

**2. Đoạn code sau in gì? Vì sao?**

```go
func find() error {
	var e *MyErr
	return e
}
fmt.Println(find() == nil)
```

<details className="qa">
<summary>Xem đáp án</summary>

In `false`. Interface value là cặp (type, value). Khi trả `e` qua kiểu `error`, interface mang `type = *MyErr`, `value = nil` — vì phần type khác nil nên interface khác nil. Interface chỉ nil khi cả type và value đều nil. Cách sửa: khi không có lỗi thì `return nil` tường minh, và luôn khai báo kiểu trả về là `error`.

</details>

**3. "Accept interfaces, return structs" nghĩa là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Tham số nên là interface (nhỏ, chỉ gồm hành vi cần dùng) để hàm linh hoạt và dễ test; giá trị trả về nên là kiểu cụ thể để người gọi có đủ thông tin, tự thu hẹp về interface nếu muốn, và thêm method vào kiểu không gây breaking change. Ngoại lệ: `error`, các constructor cố ý che hiện thực như `sha256.New() hash.Hash`, `context.WithCancel`.

</details>

**4. Vì sao interface trong Go nên nhỏ?**

<details className="qa">
<summary>Xem đáp án</summary>

Interface càng ít method thì càng nhiều kiểu thoả mãn, càng dễ mock và tái sử dụng — `io.Reader` 1 method mà được hiện thực bởi file, socket, buffer, gzip, HTTP body… Interface lớn ràng buộc người hiện thực, khó thay thế và thường là dấu hiệu trừu tượng sai. Cần interface lớn thì ghép từ interface nhỏ bằng embedding (`io.ReadWriteCloser`).

</details>

**5. `interface{}`/`any` dùng khi nào? Nhược điểm?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng khi thực sự phải nhận giá trị bất kỳ: hàm format/log (`fmt`, `slog`), JSON chưa biết cấu trúc, `context.WithValue`. Nhược điểm: mất kiểm tra kiểu lúc biên dịch, phải type assertion/type switch (có thể panic), giá trị thường bị cấp phát trên heap. Từ Go 1.18 nên ưu tiên generics cho container và hàm thuật toán.

</details>

**6. So sánh hai interface bằng `==` có thể panic không?**

<details className="qa">
<summary>Xem đáp án</summary>

Có. `==` trên interface so sánh kiểu động rồi giá trị động. Nếu cùng kiểu động mà kiểu đó không so sánh được (slice, map, func), runtime panic `comparing uncomparable type`. Tương tự khi dùng interface chứa slice làm key của `map[any]T`.

</details>

---

## 3. Type assertion và Type switch

Bài học: [3. Type assertion và Type switch](../../golang/05-method-interface/3_type-assertion-switch.md)

**1. Type assertion là gì? Khác type conversion thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Type assertion `x.(T)` chỉ áp dụng cho biến interface, kiểm tra lúc runtime xem kiểu động bên trong có phải `T` (hoặc thoả mãn interface `T`) không, rồi lấy giá trị ra — không biến đổi dữ liệu. Type conversion `T(x)` biến đổi giá trị giữa các kiểu tương thích (`float64(n)`, `[]byte(s)`), được kiểm tra lúc biên dịch.

</details>

**2. Điều gì xảy ra khi type assertion sai kiểu? Làm sao tránh?**

<details className="qa">
<summary>Xem đáp án</summary>

Dạng một giá trị `t := v.(T)` sẽ panic với thông báo `interface conversion: interface {} is string, not int`. Tránh bằng dạng comma-ok `t, ok := v.(T)` — sai kiểu thì `ok = false`, `t` là zero value, không panic. Hoặc dùng type switch, nhánh `default` xử lý kiểu không mong đợi.

</details>

**3. Trong type switch, biến `x` có kiểu gì khi `case int, string:`?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi `case` liệt kê nhiều kiểu, `x` giữ kiểu của biểu thức interface gốc (ví dụ `any`) vì compiler không biết chính xác kiểu nào. Chỉ khi `case` có đúng một kiểu thì `x` mới mang kiểu đó. Ở `default` và `case nil`, `x` cũng mang kiểu interface gốc.

</details>

**4. Làm sao kiểm tra một `io.Writer` có hỗ trợ `Flush` hay không?**

<details className="qa">
<summary>Xem đáp án</summary>

Assertion sang interface khác: `if f, ok := w.(interface{ Flush() error }); ok { f.Flush() }` hoặc với HTTP là `w.(http.Flusher)`. Đây là pattern "interface upgrade" mà `io.Copy` dùng với `io.WriterTo`/`io.ReaderFrom`. Với `http.ResponseWriter` bị middleware bọc, dùng `http.NewResponseController(w).Flush()` (Go 1.20+) để dò qua `Unwrap`.

</details>

**5. Vì sao không nên dùng `err.(*MyError)` để kiểm tra lỗi?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì lỗi thường được wrap nhiều lớp (`fmt.Errorf("lưu đơn: %w", err)`); type assertion chỉ xét lớp ngoài cùng nên thất bại dù bên trong có `*MyError`. Dùng `var me *MyError; if errors.As(err, &me) { ... }` — `errors.As` duyệt cả chuỗi `Unwrap`.

</details>

**6. Khi nào type switch là dấu hiệu thiết kế chưa tốt?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi cùng một tập kiểu bị switch ở nhiều nơi để chọn hành vi — mỗi lần thêm kiểu phải sửa mọi switch (vi phạm Open/Closed). Nên đưa hành vi thành method của interface để đa hình xử lý. Type switch hợp lý khi dữ liệu thật sự là "hộp đen" từ bên ngoài (JSON động, giá trị cấu hình, serialize) hoặc khi kiểm tra khả năng tuỳ chọn.

</details>
