---
sidebar_position: 11
---
# Autoboxing & Unboxing

## Nội dung

1. [Bối cảnh: Primitive vs Wrapper](#1-bối-cảnh-primitive-vs-wrapper)  
2. [Autoboxing (boxing tự động) là gì?](#2-autoboxing-boxing-tự-động-là-gì)  
3. [Unboxing là gì?](#3-unboxing-là-gì)  
4. [Autoboxing vs Unboxing: điều gì dễ "dính bẫy"?](#4-autoboxing-vs-unboxing-điều-gì-dễ-dính-bẫy)  
5. [Lợi thế của autoboxing/unboxing](#5-lợi-thế-của-autoboxingunboxing)  
6. [Autoboxing/unboxing và nạp chồng phương thức (method overloading)](#6-autoboxingunboxing-và-nạp-chồng-phương-thức-method-overloading)  
7. [Checklist thực hành](#7-checklist-thực-hành)  
8. [Mini quiz tự kiểm tra (khá khó)](#8-mini-quiz-tự-kiểm-tra-khá-khó)  

---

## 1) Bối cảnh: Primitive vs Wrapper

Trong Java tồn tại hai "họ" kiểu dữ liệu:

- **Kiểu nguyên thủy (primitive)**: `int`, `double`, `boolean`, …
- **Kiểu tham chiếu (reference)** tương ứng, gọi là **wrapper class**: `Integer`, `Double`, `Boolean`, …

Wrapper là **đối tượng** nên có thể mang giá trị `null`, tham gia vào **generic** (ví dụ `List<Integer>`), và có thể gọi method.

Một khác biệt quan trọng:  
- Biến primitive (là field) mặc định thường là `0`, `0.0`, `false`, …  
- Biến wrapper (là field) mặc định là **`null`**. 

---

## 2) Autoboxing (boxing tự động) là gì?

**Autoboxing** là quá trình **trình biên dịch Java tự động** chuyển đổi từ **primitive → wrapper** tương ứng. Ví dụ: `int` → `Integer`, `double` → `Double`. Tính năng này xuất hiện từ **Java 5**. 

### Trực giác (analogy)

Hãy tưởng tượng primitive như **tiền mặt** (nhanh, gọn, không có “thông tin kèm theo”), còn wrapper như **ví điện tử** (là một “đối tượng” có thể chứa tiền và thêm nhiều metadata/khả năng như phương thức, có thể “trống” = `null`, dễ đưa vào các “hệ thống” như generics/collections).

Autoboxing giống như lúc bạn **quét tiền mặt vào ví điện tử**: Java tạo ra một “cái ví” (đối tượng wrapper) và nạp số tiền (giá trị) vào đó.

### Về mặt thực thi (mô tả khái niệm)

Bài GP Coder mô tả boxing như việc tạo một đối tượng trên heap và copy giá trị primitive vào đối tượng đó; autoboxing xảy ra thông qua **chuyển đổi ngầm định (implicit conversion)** bởi compiler. 

### Ví dụ

```java
int num = 1;

// Boxing tường minh (cũ)
Integer obj1 = new Integer(num); // (lưu ý: new Integer(int) đã bị deprecate trong Java mới)

// Autoboxing (khuyến nghị)
Integer obj2 = num;              // compiler tự chèn boxing
Integer obj3 = 2;                // literal -> Integer
```


---

## 3) Unboxing là gì?

**Unboxing** là quá trình ngược lại: **wrapper → primitive**. 

### Trực giác (analogy)

Unboxing giống như **rút tiền** từ ví điện tử ra tiền mặt: bạn lấy “giá trị số” từ đối tượng wrapper ra một biến primitive để tính toán nhanh.

### Về mặt khái niệm

Bài GP Coder mô tả unboxing gồm 2 bước: (1) kiểm tra đối tượng có đúng kiểu/đã boxing phù hợp, (2) copy giá trị sang biến primitive. 

### Ví dụ

```java
Integer obj = new Integer(1);
int num = obj;     // unboxing
```


---

## 4) Autoboxing vs Unboxing: điều gì dễ “dính bẫy”?

### 4.1) NullPointerException khi unboxing `null`

Đây là lỗi hay gặp nhất:

```java
Integer x = null;
int y = x; // NPE tại runtime (do unboxing null)
```

Vì unboxing thực chất gọi `x.intValue()` (ý niệm), mà `x` đang `null`.

**Kinh nghiệm**: nếu biến có thể `null`, tránh unboxing trực tiếp; kiểm tra null hoặc dùng `OptionalInt`/giá trị mặc định.

---

### 4.2) So sánh `==` với wrapper

`==` trên object so sánh **tham chiếu**, không phải giá trị (trừ khi bị unboxing). Ví dụ:

```java
Integer a = 100;
Integer b = 100;
System.out.println(a == b); // thường true do Integer cache (-128..127)

Integer c = 200;
Integer d = 200;
System.out.println(c == d); // thường false (2 object khác nhau)

System.out.println(c.equals(d)); // true (so sánh giá trị)
```

**Kinh nghiệm**:  
- Dùng `equals()` khi muốn so sánh giá trị giữa wrapper với wrapper.  
- Hoặc ép về primitive để so sánh giá trị, nhưng nhớ nguy cơ `null`.

---

### 4.3) Hiệu năng & rác (GC)

Boxing/unboxing có thể tạo object (hoặc tận dụng cache tùy loại wrapper). Nếu bạn boxing hàng triệu lần trong vòng lặp, bạn có thể tạo ra nhiều object, tăng áp lực GC.

**Kinh nghiệm**:
- Với code “nóng” (hot path), ưu tiên primitive (`int`, `long`, …).
- Tránh autoboxing vô tình khi làm toán với wrapper hoặc khi dùng collection không cần thiết.

---

## 5) Lợi thế của autoboxing/unboxing

Bài GP Coder nhấn mạnh lợi ích lớn nhất: **tiết kiệm code**, giảm chuyển đổi thủ công giữa primitive và wrapper. 

Ngoài ra trong thực tế:
- Là cầu nối để primitive “tham gia” **Generics/Collections** (vì generics không nhận primitive).
- Làm API “mềm” hơn khi có thể dùng `null` biểu thị “không có giá trị” (nhưng đi kèm rủi ro NPE).

---

## 6) Autoboxing/unboxing và nạp chồng phương thức (method overloading)

Khi có nhiều overload, Java sẽ chọn overload “phù hợp nhất” theo thứ tự ưu tiên (đơn giản hóa):
1) khớp chính xác (exact match)  
2) widening primitive (ví dụ `int` -> `long`)  
3) boxing/unboxing  
4) varargs  

Autoboxing đôi khi làm overload trở nên khó đoán nếu bạn có cả phiên bản nhận primitive và wrapper.

Ví dụ minh họa:

```java
void f(int x)      { System.out.println("int"); }
void f(Integer x)  { System.out.println("Integer"); }

f(1);        // chọn f(int) (khớp chính xác)
Integer i=1;
f(i);        // chọn f(Integer) (khớp chính xác)
```

Nếu kết hợp thêm `long`, `Object`, `varargs`, hoặc truyền `null`, độ phức tạp tăng nhanh.

**Kinh nghiệm**: tránh thiết kế overload “mập mờ” giữa primitive và wrapper nếu API public.

---

## 7) Checklist thực hành

- ✅ Dùng primitive cho tính toán/hiệu năng (khi không cần `null` và không cần generics).  
- ✅ Dùng wrapper khi cần: `List<Integer>`, `Map<K,V>`, hoặc `null` mang ý nghĩa “missing”.  
- ✅ Dùng `equals()` cho wrapper; tránh `==` trừ khi bạn hiểu rõ cache/identity.  
- ✅ Luôn cẩn thận khi unboxing từ biến có thể `null`.  
- ✅ Quan sát boxing vô tình trong vòng lặp và tối ưu khi cần.

---

## 8) Mini quiz tự kiểm tra (khá khó)

1) Với đoạn code sau, dòng nào gây NPE và tại sao compiler vẫn cho qua?
```java
Integer a = null;
int b = a;
```

2) Dự đoán output và giải thích (cache & identity):
```java
Integer x = 127, y = 127;
Integer m = 128, n = 128;
System.out.println(x == y);
System.out.println(m == n);
```

3) Overload nào được gọi?
```java
static void g(long v) { System.out.println("long"); }
static void g(Integer v) { System.out.println("Integer"); }

g(1);
```

4) Vì sao `List<int>` không hợp lệ nhưng `List<Integer>` thì hợp lệ? (liên quan generics & type erasure)

