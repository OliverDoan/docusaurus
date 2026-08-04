---
sidebar_position: 7
title: "7. Hàm & method"
---

# 7. Hàm & method (Functions & Methods)

:::note[Ghi nhớ nhanh]

- Java **không có hàm "trôi nổi"** — mọi hàm là **method** (phương thức) nằm trong một class.
- Phải khai báo **kiểu trả về** và **kiểu từng tham số**: `int add(int a, int b)`.
- Hàm không trả gì thì kiểu trả về là **`void`**.
- Java có **nạp chồng** (overloading — nhiều hàm cùng tên khác tham số) — JS không có.
- **Lambda** (`->`) của Java ≈ **arrow function** (`=>`) của JS, nhưng cần một "kiểu hàm" (functional interface).
- Java **không có** tham số mặc định và rest param `...` linh hoạt như JS (nhưng có varargs).

:::

---

## Khai báo hàm

<table>
<tr><th>JavaScript</th><th>Java</th></tr>
<tr>
<td>

```javascript
function add(a, b) {
  return a + b;
}

const multiply = (a, b) => a * b;
```

</td>
<td>

```java
// nằm trong một class
int add(int a, int b) {
    return a + b;
}

int multiply(int a, int b) {
    return a * b;
}
```

</td>
</tr>
</table>

Đọc chữ ký (signature) Java: `int add(int a, int b)` = "hàm tên `add`, nhận hai `int`, **trả về** một `int`".

---

## `void` — hàm không trả về gì

```java
void printHello(String name) {
    System.out.println("Xin chào " + name);
    // không có return giá trị
}
```

Bên JS hàm không `return` sẽ trả `undefined`. Bên Java phải khai báo rõ `void`.

---

## Nạp chồng (Overloading) — Java có, JS không

Java cho phép **nhiều hàm cùng tên** miễn là danh sách tham số khác nhau:

```java
int add(int a, int b) { return a + b; }
double add(double a, double b) { return a + b; }
int add(int a, int b, int c) { return a + b + c; }
```

Trình biên dịch chọn đúng hàm dựa trên kiểu/số lượng đối số. Bên JS bạn phải tự kiểm tra `arguments` hoặc kiểu bên trong một hàm duy nhất.

---

## Tham số mặc định & varargs

JS có tham số mặc định và rest param rất linh hoạt:

```javascript
function greet(name = "bạn") { }
function sum(...nums) { }
```

Java **không có tham số mặc định** (thường giải quyết bằng overloading). Nhưng có **varargs** (số tham số thay đổi) với `...`:

```java
int sum(int... nums) {   // nhận 0 hoặc nhiều int
    int total = 0;
    for (int n : nums) total += n;
    return total;
}
sum(1, 2, 3);  // 6
```

---

## Lambda vs Arrow function

Java 8+ có **lambda** — tương tự arrow function nhưng luôn gắn với một **functional interface** (interface chỉ có 1 method):

<table>
<tr><th>JavaScript</th><th>Java</th></tr>
<tr>
<td>

```javascript
const nums = [1, 2, 3];
const doubled = nums.map(n => n * 2);
nums.forEach(n => console.log(n));
```

</td>
<td>

```java
List<Integer> nums = List.of(1, 2, 3);
List<Integer> doubled = nums.stream()
    .map(n -> n * 2)
    .toList();
nums.forEach(n -> System.out.println(n));
```

</td>
</tr>
</table>

`->` (Java) và `=>` (JS) đóng vai trò giống nhau. Java gọi chuỗi `.stream().map().filter().toList()` tương tự chuỗi method mảng của JS (`.map().filter()`).

---

## `static` — hàm không cần object

Method thường phải gọi qua một object. Method `static` gọi thẳng qua class (giống hàm tiện ích độc lập bên JS):

```java
static int square(int x) { return x * x; }
// gọi: MyClass.square(5);
```

`public static void main(String[] args)` — điểm khởi đầu của mọi chương trình Java — chính là một method `static`.
