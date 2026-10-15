---
sidebar_position: 6
title: "6. Generics"
---

# 6. Generics

## 1. Generics và hàm generic

Bài học: [1. Generics và hàm generic](../../golang/06-generics/1_ham-generic.md)

**1. Trước Go 1.18, người ta xử lý bài toán "viết một lần cho nhiều kiểu" thế nào? Nhược điểm?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba cách: (1) copy-paste cho từng kiểu — trùng lặp, khó bảo trì; (2) `interface{}` + type assertion — mất kiểm tra kiểu lúc biên dịch, có thể panic lúc runtime, phải chuyển `[]int` sang `[]interface{}` từng phần tử, giá trị bị boxing lên heap; (3) sinh code bằng `go generate` (genny, template) — an toàn kiểu nhưng thêm bước build và code sinh ra cồng kềnh. Generics giải quyết bằng cách để compiler kiểm tra kiểu cho từng lần instantiate.

</details>

**2. Constraint là gì? `any` và `comparable` khác nhau ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Constraint là interface giới hạn tập kiểu mà tham số kiểu có thể nhận và quy định thao tác được phép. `any` cho phép mọi kiểu nhưng không hỗ trợ toán tử nào (chỉ gán, truyền). `comparable` chỉ cho phép kiểu so sánh được bằng `==`/`!=` — cần khi dùng làm key của map hoặc so sánh bằng (`Contains`, `Index`). Slice, map, func không thoả `comparable`.

</details>

**3. Khi nào phải ghi tham số kiểu tường minh khi gọi hàm generic?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi compiler không suy ra được từ đối số: tham số kiểu chỉ xuất hiện ở kiểu trả về (`Zero[int]()`, `Convert[float64](x)`), hoặc không có đối số mang kiểu đó. Có thể ghi một phần từ trái sang phải, phần còn lại được suy luận — nên đặt tham số kiểu khó suy ra lên đầu. Cũng phải ghi khi muốn lấy hàm cụ thể làm giá trị: `f := Max[int]`.

</details>

**4. Khi nào không nên dùng generics?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi chỉ cần gọi method của tham số (dùng interface là đủ); khi mỗi kiểu có hiện thực khác nhau (dùng interface + method); khi thực tế chỉ có một kiểu được dùng; khi generics làm chữ ký khó đọc hơn lợi ích. Nguyên tắc: viết code cụ thể trước, chỉ generic hoá khi thấy lặp lại cùng thuật toán cho nhiều kiểu.

</details>

**5. Làm sao trả về "giá trị rỗng" trong hàm generic?**

<details className="qa">
<summary>Xem đáp án</summary>

Khai báo `var zero T` rồi `return zero` — đó là zero value của `T` (0, "", nil, struct rỗng…). Không viết được `return nil` vì `T` có thể là kiểu không nil được như `int`. Pattern thường gặp là trả cặp `(T, bool)` hoặc `(T, error)` như `Find`.

</details>

**6. Generics trong Go có làm chậm chương trình không?**

<details className="qa">
<summary>Xem đáp án</summary>

Go dùng GC shape stenciling + dictionary: các kiểu cùng "hình dạng" (ví dụ mọi con trỏ) dùng chung mã máy và tra thông tin kiểu qua dictionary. Nhờ vậy binary nhỏ hơn so với C++ template, thời gian biên dịch ổn, nhưng gọi method qua tham số kiểu kiểu con trỏ/interface có thể chậm hơn code viết tay (khó inline, gọi gián tiếp). Với kiểu số cơ bản (mỗi kiểu một shape riêng) thì hiệu năng gần như viết tay. Nên đo bằng benchmark khi hiệu năng quan trọng.

</details>

---

## 2. Kiểu generic và Type constraint

Bài học: [2. Kiểu generic và Type constraint](../../golang/06-generics/2_kieu-generic-constraint.md)

**1. Vì sao method của kiểu generic không được có tham số kiểu riêng? Cách khắc phục?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì Go thoả mãn interface ngầm định và cho phép type assertion sang interface lúc runtime. Nếu method có tham số kiểu riêng, compiler không biết trước phải sinh bản instantiate nào cho mọi kiểu có thể được gọi qua interface — không cài đặt hiệu quả được. Khắc phục: viết hàm top-level nhận kiểu generic làm tham số, ví dụ `func MapStack[T, U any](s *Stack[T], f func(T) U) *Stack[U]`. Đó cũng là lý do `slices`/`maps` toàn là hàm.

</details>

**2. `~int` khác `int` trong constraint thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`int` chỉ khớp đúng kiểu `int`. `~int` khớp mọi kiểu có underlying type là `int`, như `type UserID int`, `type Status int`. Vì code Go hay định nghĩa kiểu domain, constraint tập kiểu gần như luôn nên dùng `~` — nếu thiếu, compiler còn gợi ý "possibly missing ~".

</details>

**3. `comparable` gồm những kiểu nào? Vì sao `Set[[]int]` không hợp lệ?**

<details className="qa">
<summary>Xem đáp án</summary>

`comparable` gồm các kiểu so sánh được bằng `==`: số, string, bool, con trỏ, channel, interface, mảng và struct có mọi phần tử/field comparable. Slice, map, func không so sánh được nên không thoả — `Set[T comparable]` dùng `map[T]struct{}` mà key của map phải comparable, do đó `Set[[]int]` lỗi biên dịch. Lưu ý: từ Go 1.20 interface thoả `comparable` nhưng `==` có thể panic nếu giá trị động không so sánh được.

</details>

**4. Interface `interface{ ~int | ~float64 }` có dùng làm kiểu biến được không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. Interface chứa tập kiểu (union hoặc `~T`) chỉ dùng được làm constraint cho tham số kiểu; khai báo `var x Number` sẽ lỗi "interface contains type constraints". Chỉ interface thuần method (và `any`) mới làm kiểu biến được; `comparable` cũng chỉ dùng làm constraint.

</details>

**5. Vì sao `slices.Clone` có chữ ký `[S ~[]E, E any](s S) S` thay vì `[E any](s []E) []E`?**

<details className="qa">
<summary>Xem đáp án</summary>

Để giữ nguyên kiểu slice của người gọi. Nếu người gọi có `type Tags []string`, với chữ ký thứ hai kết quả là `[]string`, mất kiểu `Tags` và các method của nó. Với `S ~[]E`, `S` được suy ra là `Tags` và kết quả cũng là `Tags`.

</details>

**6. `cmp.Ordered` và `constraints.Ordered` khác nhau gì? Nên dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Cùng nội dung (mọi kiểu số nguyên, số thực và string có hỗ trợ `<`). `constraints.Ordered` nằm trong module thử nghiệm `golang.org/x/exp` (có trước, không cam kết tương thích); `cmp.Ordered` nằm trong thư viện chuẩn từ Go 1.21, kèm `cmp.Compare`, `cmp.Less`, `cmp.Or`. Dự án mới nên dùng `cmp.Ordered`.

</details>
