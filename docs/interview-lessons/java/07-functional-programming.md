---
sidebar_position: 7
title: "7. Lập trình hàm"
---

# 7. Lập trình hàm

## 1. Hàm bậc cao (High Order Functions)

Bài học: [1. Hàm bậc cao (High Order Functions)](../../java/07-functional-programming/1_high-order-functions.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Hàm bậc cao (higher-order function) là gì? Cho ví dụ trong Java Standard Library.**

<details className="qa">
<summary>Xem đáp án</summary>

Hàm bậc cao là hàm thỏa mãn ít nhất một trong hai điều kiện:

1. **Nhận một hàm khác làm tham số**.
2. **Trả về một hàm** làm kết quả.

Ví dụ tiêu biểu trong Java: `list.stream().filter(predicate)`, `stream.map(function)`, `list.forEach(consumer)` — tất cả đều nhận một hàm (dưới dạng lambda hoặc method reference) làm tham số. Đây chính là nền tảng của toàn bộ Stream API.

</details>

**2. Vì sao Java không có khái niệm "hàm tự do" (hàm độc lập không thuộc class nào) như JavaScript hay Python?**

<details className="qa">
<summary>Xem đáp án</summary>

Java là ngôn ngữ **hướng đối tượng thuần túy (pure OOP)** ở cấp độ tổ chức code — mọi đoạn code thực thi phải nằm trong một phương thức của một class. Không có khái niệm hàm đứng độc lập ngoài class.

Để mô phỏng "truyền hàm như dữ liệu" (first-class function), Java dùng cơ chế:

- **Functional interface**: một interface chỉ có đúng một phương thức trừu tượng (abstract method), đóng vai trò làm "khuôn" (khai báo chữ ký) cho hàm.
- **Lambda expression** hoặc **method reference**: là cách viết ngắn gọn để tạo ra một **object ẩn danh implement functional interface đó** ngay tại chỗ.

Vậy về bản chất, một "hàm" truyền đi trong Java vẫn luôn là một **object**, chỉ là được viết bằng cú pháp gọn hơn so với việc viết hẳn một anonymous class.

</details>

**3. `Predicate`, `Function`, `Consumer`, `Supplier` khác nhau thế nào về số lượng tham số và giá trị trả về?**

<details className="qa">
<summary>Xem đáp án</summary>

| Interface | Phương thức trừu tượng | Nhận vào | Trả về |
|-----------|--------------------------|----------|--------|
| `Predicate<T>` | `boolean test(T t)` | 1 giá trị | `boolean` |
| `Function<T, R>` | `R apply(T t)` | 1 giá trị | 1 giá trị (kiểu khác) |
| `Consumer<T>` | `void accept(T t)` | 1 giá trị | không trả gì (`void`) |
| `Supplier<T>` | `T get()` | không nhận gì | 1 giá trị |

- Mẹo nhớ theo tên tiếng Anh: `Predicate` (mệnh đề đúng/sai), `Function` (hàm biến đổi), `Consumer` (tiêu thụ — chỉ nhận vào để xử lý, không trả ra), `Supplier` (nhà cung cấp — chỉ tạo ra giá trị, không cần đầu vào).

</details>

**4. Method reference (`::`) là gì? Vì sao `System.out::println` khác với `System.out.println()`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Method reference** là cách viết tắt của một lambda khi lambda đó **chỉ đơn thuần gọi lại đúng một phương thức có sẵn**, không có logic gì thêm.

```java
names.forEach(System.out::println); // ĐÚNG: truyền hành vi, gọi sau
// names.forEach(System.out.println()); // SAI: gọi ngay, biên dịch lỗi vì println() trả về void
```

- `System.out::println` không gọi phương thức ngay — nó tạo ra một **object implement `Consumer<String>`** mà bên trong, khi `accept(x)` được gọi, sẽ thực thi `System.out.println(x)`.
- `System.out.println()` là **gọi hàm ngay lập tức**, trả về `void` — không có ý nghĩa "hành vi để truyền đi", nên không thể dùng làm tham số cho `forEach`.

</details>

**5. Liệt kê 4 loại method reference và cho ví dụ mỗi loại.**

<details className="qa">
<summary>Xem đáp án</summary>

```java
// 1. Static method reference: Lớp::phươngThứcTĩnh
Function<Integer, Integer> square = Test::squareIt;

// 2. Bound instance method reference: đốiTượngCụThể::phươngThức
String s = "Xin chào";
Supplier<Integer> lengthGetter = s::length;

// 3. Unbound instance method reference: Lớp::phươngThức (đối tượng bất kỳ)
Function<String, String> upper = String::toUpperCase;
// tương đương lambda: (str) -> str.toUpperCase()

// 4. Constructor reference: Lớp::new
Supplier<StringBuilder> factory = StringBuilder::new;
```

- Điểm khác biệt then chốt giữa loại 2 và loại 3: loại 2 lambda tương đương `() -> s.length()` (đối tượng đã cố định), còn loại 3 lambda tương đương `(str) -> str.toUpperCase()` (đối tượng là tham số truyền vào lúc gọi).

</details>

**6. Vì sao lambda chỉ dùng được với functional interface (interface có đúng một phương thức trừu tượng)?**

<details className="qa">
<summary>Xem đáp án</summary>

Một biểu thức lambda về bản chất chỉ cung cấp **một khối code duy nhất** (thân hàm), không có tên phương thức đi kèm. Để trình biên dịch biết lambda đó đang cài đặt (implement) **phương thức trừu tượng nào**, interface đích phải có **chính xác một phương thức trừu tượng** — không thừa, không thiếu — để không bị mơ hồ (ambiguous) về việc lambda đang định nghĩa hành vi cho phương thức nào.

- Interface có 2+ phương thức trừu tượng: không thể dùng lambda (phải viết hẳn class hoặc anonymous class implement đầy đủ).
- Interface chỉ có 1 phương thức trừu tượng nhưng có thêm `default`/`static` method: **vẫn dùng được lambda bình thường**, vì các phương thức `default`/`static` đã có sẵn cài đặt, không cần lambda cung cấp.
- Annotation `@FunctionalInterface` (tùy chọn) giúp trình biên dịch **kiểm tra và báo lỗi sớm** nếu ai đó vô tình thêm phương thức trừu tượng thứ hai vào interface, phá vỡ tính "functional".

</details>

**7. Đoạn code sau có biên dịch được không? Giải thích.**

```java
interface KhongPhaiFunctional {
    void a();
    void b();
}

// ...
KhongPhaiFunctional x = () -> System.out.println("test");
```

<details className="qa">
<summary>Xem đáp án</summary>

**Không biên dịch được.** Lỗi: "target type of a lambda conversion must be an interface".

- `KhongPhaiFunctional` có **hai** phương thức trừu tượng (`a()` và `b()`), không phải là functional interface.
- Lambda `() -> System.out.println("test")` chỉ cung cấp **một** khối thân hàm, nhưng trình biên dịch không biết nó nên gán cho `a()` hay `b()` — mơ hồ, nên bị từ chối ngay lúc biên dịch.
- Cách sửa: nếu thật sự cần cài đặt cả hai phương thức, phải dùng anonymous class (`new KhongPhaiFunctional() { ... }`) thay vì lambda.

</details>

**8. Vì sao "trả về một hàm" (như ví dụ `multiplier(int factor)`) lại hữu ích? Nêu khái niệm closure liên quan.**

<details className="qa">
<summary>Xem đáp án</summary>

```java
static Function<Integer, Integer> multiplier(int factor) {
    return number -> number * factor; // lambda "nhớ" factor
}

Function<Integer, Integer> doubleIt = multiplier(2);
System.out.println(doubleIt.apply(10)); // 20
```

- Đây là ví dụ của **closure** (bao đóng): lambda trả về "ghi nhớ" giá trị của biến `factor` tại thời điểm nó được tạo ra, dù `multiplier()` đã kết thúc thực thi từ lâu.
- Hữu ích để tạo ra các **hàm đã cấu hình sẵn (pre-configured/curried function)** — thay vì phải truyền `factor` mỗi lần gọi, bạn tạo sẵn một hàm `doubleIt` đã "khóa cứng" `factor = 2`, dùng lại nhiều lần mà không cần lặp lại tham số.
- Lưu ý ràng buộc trong Java: biến ngoài (`factor`) mà lambda tham chiếu tới phải là **effectively final** (không bị gán lại giá trị sau khi khai báo) — nếu không sẽ bị lỗi biên dịch.

</details>

**9. `IntBinaryOperator` khác `BiFunction<Integer, Integer, Integer>` ở điểm nào? Vì sao Java cung cấp thêm các interface chuyên biệt cho kiểu nguyên thủy?**

<details className="qa">
<summary>Xem đáp án</summary>

- Cả hai đều nhận 2 tham số `int`/`Integer` và trả về `int`/`Integer`, về mặt logic tương đương nhau.
- `BiFunction<Integer, Integer, Integer>` dùng **generic**, nên tham số/kết quả thực chất là `Integer` (kiểu tham chiếu) — mỗi lần gọi phải **autobox** `int` thành `Integer` và **unbox** ngược lại, tốn chi phí tạo object thừa.
- `IntBinaryOperator` (và các interface chuyên biệt khác như `IntPredicate`, `ToIntFunction`, `IntConsumer`...) làm việc **trực tiếp với kiểu nguyên thủy `int`**, tránh hoàn toàn chi phí autoboxing/unboxing — hiệu năng tốt hơn đáng kể khi xử lý số lượng lớn phần tử (ví dụ trong `IntStream`).
- Đây là lý do `java.util.function` cung cấp cả phiên bản generic lẫn phiên bản chuyên biệt hóa cho từng kiểu nguyên thủy phổ biến (`int`, `long`, `double`).

</details>

**10. Nêu một ví dụ thực tế trong thiết kế phần mềm mà "truyền hành vi" (Strategy Pattern) qua hàm bậc cao thay thế cho việc viết nhiều class con.**

<details className="qa">
<summary>Xem đáp án</summary>

Trước Java 8, để có nhiều "chiến lược" (strategy) khác nhau, người ta thường phải định nghĩa một interface rồi viết **nhiều class implement** nó (ví dụ `SapXepTangDan`, `SapXepGiamDan`), rồi truyền instance của class tương ứng vào.

```java
// Trước Java 8: phải viết hẳn class hoặc anonymous class
list.sort(new Comparator<Integer>() {
    @Override
    public int compare(Integer a, Integer b) {
        return b - a; // giảm dần
    }
});

// Từ Java 8: chỉ cần một lambda, không cần viết class riêng
list.sort((a, b) -> b - a);
```

- Hàm bậc cao cho phép thay thế **nhiều class chỉ khác nhau một hành vi nhỏ** bằng **một lambda truyền trực tiếp tại chỗ gọi**, giảm đáng kể số lượng class boilerplate (thừa thãi, lặp khuôn mẫu) trong codebase, đồng thời code đọc gần với ý định nghiệp vụ hơn (đọc `(a, b) -> b - a` hiểu ngay là "so sánh giảm dần").
- Đây chính là bản chất của **Strategy Design Pattern** được đơn giản hóa nhờ lambda: thay vì đóng gói hành vi trong một class riêng, ta truyền thẳng hành vi dưới dạng hàm.

</details>

---

## 2. Functional Interfaces

Bài học: [2. Functional Interfaces](../../java/07-functional-programming/2_functional-interfaces.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Functional interface là gì? Vì sao interface phải có đúng một phương thức trừu tượng?**

<details className="qa">
<summary>Xem đáp án</summary>

Functional interface là một interface có **đúng một phương thức trừu tượng (abstract method)**.

- Lambda expression chỉ cung cấp một khối thân hàm duy nhất, không kèm tên phương thức. Để trình biên dịch biết lambda đó "lấp" vào phương thức nào của interface, interface đích phải có **chính xác một** phương thức chưa cài đặt — nếu có hai trở lên, sẽ mơ hồ (ambiguous), không biết lambda ứng với phương thức nào.
- Interface vẫn có thể có thêm các phương thức `default` và `static` (đã có sẵn thân hàm) mà không ảnh hưởng — chỉ tính phương thức **trừu tượng** khi xét điều kiện functional interface.

</details>

**2. `@FunctionalInterface` có bắt buộc không? Nó có tác dụng gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không bắt buộc**, nhưng được khuyến khích dùng.

- Đây là một annotation dùng để **kiểm tra ràng buộc lúc biên dịch**: nếu interface được đánh dấu `@FunctionalInterface` mà có từ hai phương thức trừu tượng trở lên (hoặc không có phương thức trừu tượng nào), trình biên dịch sẽ **báo lỗi ngay**.
- Nếu không đánh dấu annotation này, interface vẫn hoạt động như functional interface bình thường (miễn là chỉ có 1 phương thức trừu tượng) — nhưng nếu sau này ai đó vô tình thêm phương thức trừu tượng thứ hai, lỗi chỉ lộ ra ở chỗ dùng lambda (khó hiểu hơn), thay vì báo lỗi ngay tại nơi khai báo interface.
- Vì vậy, `@FunctionalInterface` đóng vai trò như một "tài liệu sống" (self-documenting) kết hợp kiểm tra an toàn — nên dùng cho mọi interface tự viết mà dự định dùng với lambda.

</details>

**3. So sánh `Function<T, R>`, `Consumer<T>`, `Supplier<T>`, `Predicate<T>` về số tham số nhận vào và giá trị trả về.**

<details className="qa">
<summary>Xem đáp án</summary>

| Interface | Phương thức | Nhận vào | Trả về |
|-----------|-------------|----------|--------|
| `Function<T, R>` | `apply(T t)` | 1 | `R` |
| `Consumer<T>` | `accept(T t)` | 1 | không (`void`) |
| `Supplier<T>` | `get()` | không | `T` |
| `Predicate<T>` | `test(T t)` | 1 | `boolean` |

- Cách nhớ nhanh: `Function` = biến đổi (1 vào, 1 ra khác kiểu); `Consumer` = tiêu thụ (1 vào, không ra); `Supplier` = cung cấp (không vào, 1 ra); `Predicate` = kiểm tra điều kiện (1 vào, `boolean` ra).

</details>

**4. Đoạn code sau có biên dịch được không? Vì sao?**

```java
@FunctionalInterface
interface Validator {
    boolean isValid(String s);
    default boolean isInvalid(String s) {
        return !isValid(s);
    }
    static Validator alwaysTrue() {
        return s -> true;
    }
}
```

<details className="qa">
<summary>Xem đáp án</summary>

**Biên dịch được bình thường**, và `Validator` vẫn là một functional interface hợp lệ.

- `isValid(String s)` là phương thức trừu tượng **duy nhất** — điều kiện functional interface được thỏa mãn.
- `isInvalid()` là phương thức `default` (đã có thân hàm sẵn), `alwaysTrue()` là phương thức `static` — cả hai đều **không tính vào** số lượng phương thức trừu tượng khi Java kiểm tra `@FunctionalInterface`.
- Vì vậy interface này vẫn dùng lambda được bình thường: `Validator v = s -> s.length() > 0;`.

</details>

**5. `Runnable` và `Callable<V>` (trong `java.util.concurrent`) có phải là functional interface không? So sánh sự khác biệt giữa hai interface này.**

<details className="qa">
<summary>Xem đáp án</summary>

**Cả hai đều là functional interface** (mỗi cái chỉ có đúng một phương thức trừu tượng).

| Interface | Phương thức | Trả về | Có thể ném checked exception? |
|-----------|-------------|--------|-------------------------------|
| `Runnable` | `void run()` | không (`void`) | Không |
| `Callable<V>` | `V call() throws Exception` | `V` | Có |

- `Runnable` thường dùng cho tác vụ không cần kết quả (ví dụ truyền vào `Thread` hoặc `ExecutorService.execute()`).
- `Callable<V>` dùng khi tác vụ **cần trả về kết quả** và/hoặc có thể ném ra checked exception, thường dùng với `ExecutorService.submit()` để lấy về `Future<V>`.

</details>

**6. Nếu viết `Function f = s -> s.length();` (không ghi generic), điều gì xảy ra? Rủi ro là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- Đây là dùng **raw type** cho functional interface — vẫn biên dịch được (có cảnh báo unchecked), nhưng mất hoàn toàn **type safety**.
- Với raw type, tham số của `apply()` và giá trị trả về đều bị coi như `Object`, nên trình biên dịch **không kiểm tra được kiểu** lúc gọi:

```java
Function f = s -> ((String) s).length(); // phải tự ép kiểu bên trong lambda
Object result = f.apply(123); // biên dịch OK nhưng ném ClassCastException lúc CHẠY
```

- Rủi ro: lỗi sai kiểu chỉ lộ ra lúc **runtime** thay vì được bắt sớm lúc biên dịch — y hệt vấn đề dùng raw type với Collections đã học ở bài Generic Collections. Luôn ghi rõ generic: `Function<String, Integer>`.

</details>

**7. `IntPredicate`, `ToIntFunction<T>`, `IntUnaryOperator` khác nhau thế nào? Vì sao Java cần nhiều biến thể cho kiểu nguyên thủy như vậy?**

<details className="qa">
<summary>Xem đáp án</summary>

| Interface | Phương thức | Ý nghĩa |
|-----------|-------------|---------|
| `IntPredicate` | `boolean test(int value)` | Kiểm tra điều kiện trên `int`, không cần boxing |
| `ToIntFunction<T>` | `int applyAsInt(T value)` | Nhận một object kiểu `T`, trả về `int` nguyên thủy |
| `IntUnaryOperator` | `int applyAsInt(int operand)` | Nhận `int`, trả về `int` (cùng kiểu) |

- Nếu dùng `Predicate<Integer>`, `Function<T, Integer>`, `Function<Integer, Integer>` thay thế, mỗi lần gọi Java phải **autobox** giá trị `int` thành `Integer` (tạo object) rồi **unbox** ngược lại khi cần dùng như nguyên thủy — tốn chi phí tạo object và garbage collection không cần thiết.
- Các biến thể chuyên biệt hóa cho `int`/`long`/`double` giúp **tránh hoàn toàn autoboxing/unboxing**, quan trọng nhất khi xử lý số lượng lớn phần tử, ví dụ trong `IntStream` của Stream API.

</details>

**8. Vì sao `Comparator<T>` được coi là functional interface dù có nhiều phương thức được khai báo trong source code của nó (`reversed()`, `thenComparing()`, `naturalOrder()`...)?**

<details className="qa">
<summary>Xem đáp án</summary>

- `Comparator<T>` chỉ có **một** phương thức trừu tượng thực sự: `int compare(T o1, T o2)`.
- Các phương thức còn lại như `reversed()`, `thenComparing()` là **`default` method**, còn `naturalOrder()`, `comparing()` là **`static` method** — tất cả đều đã có sẵn cài đặt (thân hàm cụ thể) ngay trong interface, không phải phương thức trừu tượng.
- Vì chỉ tính phương thức trừu tượng khi xét điều kiện functional interface, `Comparator<T>` vẫn hợp lệ để dùng với lambda: `Comparator<Integer> c = (a, b) -> a - b;`, đồng thời vẫn tận dụng được các `default`/`static` method tiện lợi có sẵn như một API phong phú.

</details>

**9. Có thể tự viết một functional interface generic có nhiều tham số kiểu không? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

**Có.** Functional interface hoàn toàn có thể khai báo nhiều tham số kiểu generic, miễn là vẫn chỉ có một phương thức trừu tượng.

```java
@FunctionalInterface
interface TriFunction<A, B, C, R> {
    R apply(A a, B b, C c);
}

TriFunction<String, Integer, Boolean, String> moTa =
    (ten, tuoi, laSinhVien) -> ten + ", " + tuoi + " tuổi, "
        + (laSinhVien ? "là sinh viên" : "không phải sinh viên");

System.out.println(moTa.apply("An", 20, true));
```

- Đây là một ví dụ thực tế cho thấy tự viết functional interface vẫn cần thiết khi bộ chuẩn `java.util.function` không có sẵn interface phù hợp (ví dụ Java không có sẵn interface nhận 3 tham số kiểu `TriFunction`).

</details>

**10. Vì sao nên ưu tiên dùng lại các functional interface trong `java.util.function` thay vì tự định nghĩa interface riêng cho mỗi trường hợp?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Tính nhất quán và khả năng tương thích (interoperability)**: các API chuẩn của Java (Stream, Optional, CompletableFuture...) đều được thiết kế để nhận `Function`, `Predicate`, `Consumer`, `Supplier` — nếu bạn tự định nghĩa interface riêng có cùng chữ ký, nó **không thể** truyền trực tiếp vào các API này (dù về logic giống hệt, Java không coi hai functional interface khác tên là tương thích).
- **Giảm số lượng type thừa thãi**: mỗi interface tự định nghĩa thêm là một khái niệm mới người đọc code phải học, trong khi bộ chuẩn đã được cộng đồng Java quen thuộc.
- Chỉ nên tự viết functional interface riêng khi: (1) cần chữ ký đặc biệt mà bộ chuẩn không có (ví dụ nhận 3+ tham số), hoặc (2) muốn đặt tên có ý nghĩa nghiệp vụ rõ ràng hơn (ví dụ `PriceCalculator` thay vì `Function<Order, BigDecimal>`) để code dễ đọc hơn.

</details>

**11. Interface `Comparator<T>` và `Comparable<T>` khác nhau thế nào? Cái nào là functional interface?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `Comparable<T>` | `Comparator<T>` |
|---|------------------|-------------------|
| Phương thức | `int compareTo(T o)` | `int compare(T o1, T o2)` |
| Cài đặt ở đâu | Bên trong chính class cần so sánh (so sánh với "chính nó") | Một class/lambda **riêng biệt**, so sánh hai đối tượng bất kỳ |
| Số cách so sánh | Chỉ một cách "tự nhiên" (natural ordering) cho mỗi class | Có thể tạo nhiều `Comparator` khác nhau cho cùng một class |
| Là functional interface? | Có (1 phương thức trừu tượng) nhưng thường được implement trực tiếp bởi class, ít dùng lambda | Có, và rất hay dùng với lambda: `(a, b) -> a.getTuoi() - b.getTuoi()` |

- Trong thực tế, `Comparator` được dùng với lambda phổ biến hơn nhiều vì nó cho phép định nghĩa **nhiều tiêu chí sắp xếp khác nhau** cho cùng một class mà không cần sửa class đó (ví dụ sắp theo tên, theo tuổi, theo điểm — mỗi tiêu chí một `Comparator` riêng), trong khi `Comparable` chỉ gắn được **một** thứ tự "mặc định" duy nhất vào class.

</details>

---

## 3. Kết hợp hàm (Functional Composition)

Bài học: [3. Kết hợp hàm (Functional Composition)](../../java/07-functional-programming/3_functional-composition.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `andThen` và `compose` của `Function` khác nhau ở điểm nào? Cho ví dụ minh họa bằng số cụ thể.**

<details className="qa">
<summary>Xem đáp án</summary>

- `a.andThen(b)`: chạy `a` **trước**, lấy kết quả làm đầu vào cho `b` — đọc xuôi trái sang phải.
- `a.compose(b)`: chạy `b` **trước**, lấy kết quả làm đầu vào cho `a` — giống cách toán học viết `f(g(x))`, hàm trong ngoặc chạy trước.

```java
Function<Integer, Integer> doubleIt = x -> x * 2;
Function<Integer, Integer> addThree = x -> x + 3;

doubleIt.andThen(addThree).apply(5); // (5*2)+3 = 13
doubleIt.compose(addThree).apply(5); // (5+3)*2 = 16
```

</details>

**2. Đoạn code sau in ra gì? Giải thích từng bước.**

```java
Function<String, String> trim = String::trim;
Function<String, Integer> length = String::length;
Function<String, Integer> pipeline = trim.andThen(length);
System.out.println(pipeline.apply("  hello  "));
```

<details className="qa">
<summary>Xem đáp án</summary>

In ra `5`.

- `trim.andThen(length)` tạo ra một `Function<String, Integer>` mới: đầu vào chạy qua `trim` trước, kết quả của `trim` lại chạy tiếp qua `length`.
- `"  hello  "` → `trim()` → `"hello"` → `length()` → `5`.
- Đây là ví dụ cho thấy `andThen` có thể ghép hai hàm có **kiểu trả về khác nhau** (`Function<String, String>` nối với `Function<String, Integer>`), miễn là kiểu đầu ra của hàm trước khớp với kiểu đầu vào của hàm sau.

</details>

**3. Vì sao `a.andThen(b)` không làm thay đổi `a` hay `b`? Đoạn code sau có lỗi logic gì?**

```java
Function<Integer, Integer> doubleIt = x -> x * 2;
Function<Integer, Integer> addThree = x -> x + 3;
doubleIt.andThen(addThree);
System.out.println(doubleIt.apply(5));
```

<details className="qa">
<summary>Xem đáp án</summary>

In ra `10`, không phải `13` như người viết code có thể kỳ vọng nhầm.

- `andThen()` (và `compose()`) là các phương thức **thuần túy (pure)** theo tinh thần lập trình hàm — chúng không sửa đổi (mutate) đối tượng `doubleIt` hay `addThree` gốc, mà **luôn tạo ra và trả về một `Function` hoàn toàn mới**.
- Dòng `doubleIt.andThen(addThree);` tạo ra một hàm mới nhưng **không gán vào đâu cả** — kết quả bị bỏ đi ngay lập tức, không có tác dụng gì.
- `doubleIt` vẫn là hàm gốc `x -> x * 2`, nên `doubleIt.apply(5)` vẫn trả về `10`.
- Cách sửa đúng: `Function<Integer, Integer> combined = doubleIt.andThen(addThree);` rồi gọi `combined.apply(5)`.

</details>

**4. `Predicate.and()`, `or()`, `negate()` hoạt động thế nào? Đoạn code sau in ra gì?**

```java
Predicate<Integer> isPositive = n -> n > 0;
Predicate<Integer> isEven = n -> n % 2 == 0;
Predicate<Integer> ketQua = isPositive.and(isEven).negate();
System.out.println(ketQua.test(4));
System.out.println(ketQua.test(-3));
```

<details className="qa">
<summary>Xem đáp án</summary>

In ra `false` rồi `true`.

- `isPositive.and(isEven)` tạo ra một `Predicate` mới: chỉ `true` khi **cả hai** điều kiện đều đúng (dương VÀ chẵn).
- `.negate()` đảo ngược kết quả của toàn bộ biểu thức `and` đó: `true` thành `false` và ngược lại.
- Với `4`: `isPositive.and(isEven)` là `true` (dương và chẵn) → `negate()` → `false`.
- Với `-3`: `isPositive.and(isEven)` là `false` (không dương, không chẵn) → `negate()` → `true`.
- Lưu ý thứ tự áp dụng: `and()` được tính trước, `negate()` áp dụng lên **kết quả cuối cùng** của toàn biểu thức `and`, không phải chỉ lên `isEven`.

</details>

**5. `Consumer.andThen()` khác `Function.andThen()` ở điểm nào về cách xử lý dữ liệu?**

<details className="qa">
<summary>Xem đáp án</summary>

- `Function.andThen()`: đầu ra của hàm trước **trở thành đầu vào** của hàm sau — dữ liệu được biến đổi qua từng bước (khác kiểu hoặc khác giá trị ở mỗi bước).
- `Consumer.andThen()`: cả hai `Consumer` đều nhận **cùng một giá trị đầu vào gốc**, chạy tuần tự lần lượt (không có khái niệm "kết quả" để truyền tiếp, vì `Consumer` không trả về gì).

```java
Consumer<String> inHoa = s -> System.out.println(s.toUpperCase());
Consumer<String> inDoDai = s -> System.out.println(s.length());

Consumer<String> ca_hai = inHoa.andThen(inDoDai);
ca_hai.accept("hello"); // cả inHoa và inDoDai đều nhận "hello" làm đầu vào, không phải kết quả của nhau
```

</details>

**6. Vì sao nói `Function.compose()` và `Function.andThen()` đều dựa trên nguyên lý toán học của "hàm hợp" (function composition)? Viết `f.compose(g)` tương đương biểu thức toán học nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong toán học, "hàm hợp" của `f` và `g`, ký hiệu `(f ∘ g)(x)`, được định nghĩa là `f(g(x))` — tức là áp dụng `g` trước, rồi lấy kết quả đưa vào `f`.

- `f.compose(g)` trong Java tương ứng chính xác với `(f ∘ g)(x) = f(g(x))`: `g` chạy trước, `f` chạy sau.
- `f.andThen(g)` tương đương `(g ∘ f)(x) = g(f(x))`: `f` chạy trước, `g` chạy sau — tức là hàm hợp theo chiều **ngược lại** so với `compose`.
- Việc Java cung cấp cả hai (`andThen` đọc xuôi tự nhiên theo code, `compose` đúng quy ước toán học) là để lập trình viên chọn cách viết dễ đọc nhất theo ngữ cảnh, mà không mất đi ý nghĩa toán học chuẩn.

</details>

**7. Vì sao nên chia một phép biến đổi phức tạp thành nhiều hàm nhỏ rồi ghép lại bằng composition, thay vì viết trực tiếp một hàm lớn làm hết mọi việc?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Dễ test từng phần (unit test độc lập)**: mỗi hàm nhỏ chỉ làm một việc, có thể viết test riêng cho từng bước, dễ xác định lỗi nằm ở bước nào khi có sai sót.
- **Dễ tái sử dụng**: một hàm nhỏ như `trim` hay `toLowerCase` có thể dùng lại trong nhiều pipeline khác nhau, không phải copy-paste logic.
- **Dễ đọc, đúng nguyên tắc Single Responsibility**: đọc `trim.andThen(lower).andThen(noSpace)` gần như đọc một câu tiếng Anh mô tả các bước xử lý, thay vì phải đọc và hiểu toàn bộ logic lồng nhau trong một hàm khổng lồ.
- Đánh đổi: ghép quá nhiều hàm nhỏ trên cùng một dòng dài cũng có thể khó đọc — nên đặt tên rõ ràng cho các bước trung gian khi pipeline dài.

</details>

**8. `UnaryOperator<T>` khác `Function<T, T>` ở điểm nào? Vì sao nó tồn tại như một interface riêng?**

<details className="qa">
<summary>Xem đáp án</summary>

- Về mặt chữ ký, `UnaryOperator<T>` (kế thừa `Function<T, T>`) có cùng ý nghĩa với `Function<T, T>`: nhận vào và trả về **cùng một kiểu** `T`.
- Sự khác biệt chủ yếu là **ngữ nghĩa (semantic) và tính rõ ràng khi đọc code**: `UnaryOperator<T>` nói rõ ngay từ khai báo rằng "đây là một phép biến đổi giữ nguyên kiểu" (ví dụ `String -> String`, dùng cho các thao tác như chuẩn hóa chuỗi), thay vì phải nhìn cả hai tham số generic của `Function<T, T>` để nhận ra điều đó.
- Trong thực tế, `List.replaceAll(UnaryOperator<E> operator)` là một ví dụ dùng `UnaryOperator` thay vì `Function` chung chung, vì ngữ nghĩa "thay thế phần tử bằng giá trị cùng kiểu" khớp chính xác với `UnaryOperator`.

</details>

**9. Trong Stream API, phương thức nào thể hiện rõ nhất tinh thần function composition? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

```java
List<String> ketQua = danhSach.stream()
    .map(String::trim)
    .map(String::toLowerCase)
    .filter(s -> !s.isEmpty())
    .toList();
```

- Mỗi lời gọi `.map()`/`.filter()` liên tiếp trong Stream pipeline chính là một dạng **function composition tường minh**: đầu ra của bước trước (sau `map(String::trim)`) trở thành đầu vào của bước sau (`map(String::toLowerCase)`), tương tự cách `andThen()` nối các `Function` lại với nhau.
- Về bản chất, Stream API được xây dựng hoàn toàn trên nền tảng functional composition — đây là lý do bài học về `andThen`/`compose`/`and`/`or`/`negate` là kiến thức nền tảng bắt buộc trước khi học sâu Stream API.

</details>

**10. Nêu một rủi ro khi ghép quá nhiều hàm liên tiếp trong một pipeline dài (ví dụ 8-10 bước andThen). Cách khắc phục?**

<details className="qa">
<summary>Xem đáp án</summary>

Rủi ro chính:

- **Khó đọc và khó debug**: khi pipeline dài, nếu kết quả sai, khó xác định ngay bước nào trong chuỗi gây ra lỗi, vì tất cả nằm trên một biểu thức liên tiếp không có điểm dừng trung gian để kiểm tra (inspect).
- **Stack trace khó theo dõi**: nếu một bước ném exception, stack trace chỉ ra lỗi nằm "đâu đó trong lambda", không rõ ràng bằng việc có tên hàm cụ thể.

Cách khắc phục:

- **Đặt tên có ý nghĩa cho các bước trung gian**: thay vì ghép hết trên một dòng, gán từng cụm nhỏ vào biến có tên rõ ràng (`Function<String, String> chuanHoaVanBan = trim.andThen(lower);`), rồi ghép các biến đã đặt tên đó lại.
- **Giới hạn độ dài pipeline hợp lý** (ví dụ 3-5 bước), tách thành nhiều pipeline con có tên nghiệp vụ rõ ràng nếu logic quá phức tạp.

</details>

---

## 4. Stream API

Bài học: [4. Stream API](../../java/07-functional-programming/4_stream-api.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Stream khác Collection (như `List`, `Set`) cốt lõi ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | Collection | Stream |
|----------|-----------|--------|
| Lưu trữ dữ liệu | Có (chứa phần tử thật sự trong bộ nhớ) | Không — chỉ "chảy qua" dữ liệu từ nguồn |
| Số lần dùng | Duyệt được nhiều lần | Chỉ dùng được **một lần** |
| Thời điểm tính toán | Ngay khi gọi phương thức | **Lazy** — chỉ chạy khi gặp thao tác kết thúc |
| Thay đổi dữ liệu gốc | Có thể `add`/`remove` trực tiếp | Không sửa đổi nguồn, luôn tạo kết quả mới |
| Phong cách lập trình | Mệnh lệnh (imperative — mô tả "làm thế nào") | Khai báo (declarative — mô tả "làm gì") |

</details>

**2. Vì sao chỉ có thao tác trung gian mà không có thao tác kết thúc thì "không có gì chạy cả"? Giải thích cơ chế lazy evaluation.**

<details className="qa">
<summary>Xem đáp án</summary>

```java
List<Integer> numbers = List.of(1, 2, 3);
numbers.stream()
    .filter(n -> {
        System.out.println("Đang lọc: " + n); // KHÔNG in ra dòng nào
        return n % 2 == 0;
    });
// Không có collect/forEach/count... nên không có gì thực thi
```

- Mỗi thao tác trung gian (`filter`, `map`, `sorted`...) khi được gọi **chỉ tạo ra một "kế hoạch xử lý"** (một stream mới bọc quanh stream cũ), chưa thực sự duyệt qua phần tử nào.
- Toàn bộ pipeline chỉ **thực sự chạy** khi gặp một **thao tác kết thúc** (`collect`, `forEach`, `count`, `reduce`...) — lúc đó Java mới bắt đầu kéo từng phần tử từ nguồn, đẩy qua toàn bộ chuỗi thao tác trung gian, rồi đưa vào thao tác kết thúc.
- Thiết kế lazy này cho phép Java **tối ưu hóa**: gộp nhiều thao tác trung gian thành một lượt duyệt duy nhất, và **dừng sớm (short-circuit)** khi không cần xử lý hết toàn bộ dữ liệu.

</details>

**3. Đoạn code sau ném lỗi gì? Vì sao?**

```java
Stream<Integer> s = List.of(1, 2, 3).stream();
s.forEach(System.out::println);
long count = s.count();
```

<details className="qa">
<summary>Xem đáp án</summary>

Ném `IllegalStateException` với thông báo dạng "stream has already been operated upon or closed".

- Một `Stream` **chỉ dùng được đúng một lần** — sau khi gọi bất kỳ thao tác kết thúc nào (`forEach` ở đây), stream đó coi như đã "đóng" và không thể gọi thêm bất kỳ thao tác nào khác lên nó nữa, kể cả một thao tác kết thúc khác như `count()`.
- Đây là khác biệt lớn so với `Collection` — bạn có thể duyệt một `List` bao nhiêu lần tùy thích, nhưng phải tạo **stream mới** từ nguồn (`list.stream()`) mỗi lần cần một pipeline xử lý khác.

</details>

**4. `findFirst()` có thể dừng sớm (short-circuit) mà không cần duyệt hết toàn bộ dữ liệu. Giải thích cơ chế này bằng ví dụ với `IntStream.rangeClosed(1, 1_000_000)`.**

<details className="qa">
<summary>Xem đáp án</summary>

```java
IntStream.rangeClosed(1, 1_000_000)
    .filter(n -> n > 100)
    .findFirst()
    .ifPresent(System.out::println); // in ra 101, gần như tức thì
```

- Nhờ **lazy evaluation**, Java không xử lý toàn bộ 1 triệu phần tử qua `filter` trước rồi mới tìm phần tử đầu tiên. Thay vào đó, nó xử lý **từng phần tử một, theo chiều dọc qua toàn bộ pipeline**: lấy `1` → qua `filter` (fail) → lấy `2` → qua `filter` (fail) → ... → lấy `101` → qua `filter` (pass) → `findFirst` tìm thấy kết quả và **dừng ngay lập tức**, không cần sinh ra hay kiểm tra các số từ 102 đến 1 triệu.
- Đây gọi là thao tác **short-circuiting** — bên cạnh `findFirst`, các thao tác `anyMatch`, `limit`, `findAny` cũng có khả năng dừng sớm tương tự khi điều kiện đã được thỏa mãn.

</details>

**5. `map` và `flatMap` khác nhau ở điểm nào? Cho ví dụ tình huống bắt buộc phải dùng `flatMap`.**

<details className="qa">
<summary>Xem đáp án</summary>

- `map(Function<T, R>)`: biến đổi **mỗi phần tử thành đúng một phần tử khác**, kết quả vẫn là `Stream<R>` với số lượng phần tử **giữ nguyên**.
- `flatMap(Function<T, Stream<R>>)`: biến đổi mỗi phần tử thành **một stream con**, rồi "làm phẳng" (flatten) tất cả các stream con đó thành **một stream duy nhất** — số lượng phần tử kết quả có thể khác với số lượng ban đầu.

```java
List<List<Integer>> nested = List.of(
    List.of(1, 2, 3),
    List.of(4, 5),
    List.of(6)
);

// Sai: dùng map sẽ ra Stream<List<Integer>>, vẫn còn lồng nhau
List<List<Integer>> viMap = nested.stream()
    .map(list -> list)
    .toList();

// Đúng: flatMap làm phẳng thành Stream<Integer>
List<Integer> phang = nested.stream()
    .flatMap(List::stream)
    .toList();
System.out.println(phang); // [1, 2, 3, 4, 5, 6]
```

- Ứng dụng thực tế phổ biến: xử lý dữ liệu lồng nhau (`List<List<T>>`), hoặc tách một chuỗi thành các từ rồi gộp tất cả từ của nhiều câu vào một stream chung (`sentences.stream().flatMap(s -> Arrays.stream(s.split(" ")))`).

</details>

**6. `reduce()` có mấy overload phổ biến? Giải thích ý nghĩa từng tham số của phiên bản 3 tham số `reduce(identity, accumulator, combiner)`.**

<details className="qa">
<summary>Xem đáp án</summary>

Ba overload phổ biến của `reduce`:

```java
Optional<T> reduce(BinaryOperator<T> accumulator);           // không giá trị khởi đầu
T reduce(T identity, BinaryOperator<T> accumulator);          // có giá trị khởi đầu
<U> U reduce(U identity, BiFunction<U,T,U> accumulator, BinaryOperator<U> combiner); // dùng cho parallel stream
```

- **`identity`**: giá trị khởi đầu, đồng thời cũng là "giá trị trung tính" khi gộp với chính nó không đổi kết quả (ví dụ `0` cho phép cộng, `1` cho phép nhân).
- **`accumulator`**: hàm gộp giá trị hiện tại (`U`) với một phần tử mới (`T`) thành giá trị `U` mới — dùng khi xử lý **tuần tự (sequential)**.
- **`combiner`**: hàm gộp **hai kết quả riêng phần** (`U` với `U`) lại thành một — chỉ được dùng khi chạy **parallel stream**, vì lúc đó dữ liệu bị chia nhỏ ra xử lý ở nhiều luồng khác nhau, mỗi luồng cho ra một kết quả riêng phần cần `combiner` để gộp lại thành kết quả cuối cùng.
- Với stream tuần tự (không `parallel()`), `combiner` gần như không bao giờ được gọi tới.

</details>

**7. `Collectors.groupingBy()` hoạt động thế nào? Viết code nhóm danh sách sinh viên theo điểm đạt/không đạt và đếm số lượng mỗi nhóm.**

<details className="qa">
<summary>Xem đáp án</summary>

```java
record SinhVien(String ten, int diem) {}

List<SinhVien> ds = List.of(
    new SinhVien("An", 8),
    new SinhVien("Bình", 3),
    new SinhVien("Cường", 6)
);

Map<Boolean, Long> thongKe = ds.stream()
    .collect(Collectors.groupingBy(
        sv -> sv.diem() >= 5,      // hàm phân loại (classifier)
        Collectors.counting()      // collector áp dụng cho từng nhóm
    ));

System.out.println(thongKe); // {false=1, true=2}
```

- `groupingBy(classifier)` mặc định gom mỗi nhóm thành `List<T>`.
- `groupingBy(classifier, downstreamCollector)` cho phép áp dụng thêm một collector khác **lên từng nhóm**, ví dụ `Collectors.counting()` (đếm), `Collectors.summingInt(...)` (tính tổng), hay thậm chí một `groupingBy` khác để nhóm nhiều cấp (multi-level grouping).

</details>

**8. `Collectors.toMap()` có thể ném lỗi gì nếu dữ liệu nguồn có key trùng nhau? Cách khắc phục?**

<details className="qa">
<summary>Xem đáp án</summary>

```java
List<String> ten = List.of("An", "Anh", "Bình"); // "An" và "Anh" cùng bắt đầu bằng chữ 'A'

// Có thể ném IllegalStateException: Duplicate key
Map<Character, String> loi = ten.stream()
    .collect(Collectors.toMap(s -> s.charAt(0), s -> s));
```

- Mặc định, `Collectors.toMap(keyMapper, valueMapper)` ném `IllegalStateException` ("Duplicate key") nếu có hai phần tử cho ra **cùng một key**, vì nó không biết nên giữ giá trị nào.
- Cách khắc phục: truyền thêm tham số thứ ba là **hàm giải quyết xung đột (merge function)**:

```java
Map<Character, String> ok = ten.stream()
    .collect(Collectors.toMap(
        s -> s.charAt(0),
        s -> s,
        (giaTriCu, giaTriMoi) -> giaTriCu + ", " + giaTriMoi // gộp lại khi trùng key
    ));
System.out.println(ok); // {A=An, Anh, B=Bình}
```

</details>

**9. Vì sao dùng `IntStream`/`LongStream`/`DoubleStream` thay vì `Stream<Integer>`/`Stream<Long>`/`Stream<Double>` khi xử lý số lượng lớn phần tử số?**

<details className="qa">
<summary>Xem đáp án</summary>

- `Stream<Integer>` lưu trữ mỗi phần tử dưới dạng **object `Integer`** — mỗi lần tạo ra một số phải **autobox** từ `int` (kiểu nguyên thủy), tốn chi phí tạo object và tăng áp lực lên garbage collector.
- `IntStream` (và tương tự `LongStream`, `DoubleStream`) làm việc **trực tiếp với kiểu nguyên thủy**, tránh hoàn toàn chi phí autoboxing/unboxing, đồng thời cung cấp sẵn các phương thức tiện lợi chuyên biệt như `sum()`, `average()`, `max()`, `min()` mà `Stream<Integer>` không có sẵn (phải tự viết bằng `reduce`).
- Chuyển đổi qua lại: `stream.mapToInt(...)` (từ `Stream<T>` sang `IntStream`) và `intStream.boxed()` (từ `IntStream` ngược lại thành `Stream<Integer>`).

</details>

**10. `Optional` liên quan gì tới Stream API? Vì sao `findFirst()`, `max()`, `reduce()` (bản không identity) trả về `Optional` thay vì giá trị trực tiếp?**

<details className="qa">
<summary>Xem đáp án</summary>

- Các thao tác này có thể **không tìm thấy kết quả** — ví dụ `findFirst()` trên một stream rỗng (do bị `filter` lọc hết), hoặc `reduce()` không có `identity` trên stream rỗng thì không có giá trị nào để trả về.
- Thay vì trả về `null` (dễ gây `NullPointerException` nếu người gọi quên kiểm tra), Java 8 giới thiệu `Optional<T>` — một **wrapper tường minh** buộc người gọi phải chủ động xử lý trường hợp "không có giá trị" bằng các phương thức như `isPresent()`, `ifPresent()`, `orElse()`, `orElseGet()`, `orElseThrow()`.
- Đây là cách Java khuyến khích thiết kế API an toàn hơn: kiểu trả về (`Optional<T>`) tự nó đã "nói" cho người gọi biết rằng kết quả có thể vắng mặt, thay vì để lộ ra thành lỗi runtime khi quên kiểm tra `null`.

</details>

**11. Vì sao không nên thay đổi biến bên ngoài (biến ngoài phạm vi lambda) bên trong lambda của Stream, đặc biệt với `parallelStream()`?**

<details className="qa">
<summary>Xem đáp án</summary>

```java
// SAI: mutate một biến dùng chung từ nhiều luồng
int[] total = {0};
List.of(1, 2, 3, 4, 5).parallelStream()
    .forEach(n -> total[0] += n); // race condition — kết quả có thể sai lệch, không ổn định
System.out.println(total[0]); // kết quả không đáng tin cậy
```

- Với `parallelStream()`, nhiều luồng có thể cùng lúc đọc-sửa-ghi vào cùng một biến chia sẻ (`total[0] += n` không phải thao tác atomic — nó gồm đọc, cộng, rồi ghi lại), gây ra **race condition** (tranh chấp dữ liệu) và kết quả sai lệch không thể đoán trước, thậm chí khác nhau giữa các lần chạy.
- Ngay cả với stream tuần tự (không parallel), việc mutate biến ngoài cũng đi ngược lại tinh thần **lập trình hàm** (functional programming) mà Stream API hướng tới — các thao tác nên là **thuần túy (pure)**, không có side effect.
- Cách làm đúng: dùng `reduce()`, `collect()`, hoặc `Collectors.summingInt()` để Java tự quản lý việc gộp kết quả an toàn, thay vì tự tay mutate biến chia sẻ.

</details>

**12. Khi nào nên dùng `parallelStream()` và khi nào không nên? Vì sao dữ liệu nhỏ dùng `parallel()` có thể chậm hơn stream thường?**

<details className="qa">
<summary>Xem đáp án</summary>

Nên dùng `parallelStream()` khi:

- **Dữ liệu đủ lớn** (thường từ hàng chục nghìn phần tử trở lên) để lợi ích chia nhỏ xử lý song song vượt qua chi phí quản lý luồng.
- **Thao tác trên mỗi phần tử độc lập, không có trạng thái chia sẻ (stateless)** và không mutate biến ngoài.
- Máy chạy có **nhiều nhân CPU** thực sự để tận dụng.

Không nên dùng khi:

- Dữ liệu nhỏ: chi phí **tạo, phân chia (split), và gộp (merge) kết quả** giữa các luồng (thường dùng chung `ForkJoinPool.commonPool()`) có thể **lớn hơn** thời gian tiết kiệm được từ việc chạy song song — khiến `parallelStream()` chậm hơn stream tuần tự thông thường.
- Thao tác có I/O (đọc file, gọi mạng) hoặc cần giữ đúng thứ tự xử lý.
- Có thao tác mutate trạng thái chia sẻ, dễ gây race condition như đã nêu ở câu trên.

</details>
