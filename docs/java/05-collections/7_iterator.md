---
sidebar_position: 7
title: "7. Iterator"
---

# Iterator

Iterator (bộ lặp) là công cụ giúp bạn duyệt qua từng phần tử của một collection (List, Set, Map...) như một con trỏ di chuyển lần lượt. Nó cũng là cách an toàn duy nhất để xóa phần tử trong khi đang duyệt. Bài này giới thiệu Iterator, hasNext/next và ListIterator; chi tiết nằm bên dưới.

---

## Mục lục

- [Vì sao có Iterator?](#vì-sao-có-iterator)
- [Iterator là gì?](#iterator-là-gì)
- [hasNext và next](#hasnext-và-next)
- [Lấy Iterator từ một collection](#lấy-iterator-từ-một-collection)
- [Xóa phần tử an toàn với remove](#xóa-phần-tử-an-toàn-với-remove)
- [ConcurrentModificationException](#concurrentmodificationexception)
- [So sánh với vòng lặp for-each](#so-sánh-với-vòng-lặp-for-each)
- [ListIterator — duyệt hai chiều](#listiterator--duyệt-hai-chiều)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao có Iterator?

**Vấn đề:** Mỗi cấu trúc dữ liệu lưu trữ một kiểu khác nhau: mảng theo chỉ số, linked list theo node, cây, bảng băm... Nếu mỗi loại duyệt một cách riêng thì code của bạn bị phụ thuộc vào chi tiết bên trong từng loại. Ngoài ra, xóa phần tử trong khi đang duyệt bằng vòng `for` theo chỉ số rất dễ gây lỗi hoặc bỏ sót phần tử.

```java
// Mỗi loại duyệt một kiểu, code phụ thuộc cấu trúc bên trong
for (int i = 0; i < mang.length; i++) { ... }          // mảng theo chỉ số
for (Node n = head; n != null; n = n.next) { ... }     // linked list theo node

// Xóa khi duyệt bằng for index dễ bỏ sót: xóa phần tử thì index trượt!
for (int i = 0; i < list.size(); i++) {
    if (list.get(i) % 2 == 0) {
        list.remove(i); // phần tử kế tiếp dồn lên, bị bỏ qua
    }
}
```

**Giải pháp:** **Iterator** cung cấp một giao diện **duyệt thống nhất** (`hasNext`/`next`/`remove`) cho mọi Collection mà **không lộ** cấu trúc bên trong. Đây là nền tảng của vòng lặp `for-each`. Iterator còn có cơ chế **fail-fast** phát hiện sửa đổi đồng thời, và `iterator.remove()` cho phép xóa **an toàn** ngay khi đang duyệt.

```java
// Cùng một cách duyệt cho MỌI collection, không cần biết cấu trúc bên trong
Iterator<Integer> it = list.iterator();
while (it.hasNext()) {
    int n = it.next();
    if (n % 2 == 0) {
        it.remove(); // xóa an toàn, không bỏ sót phần tử
    }
}
```

:::tip[Dùng thực tế]
- Duyệt mọi loại collection bằng `for-each` (List, Set, Map qua entrySet...).
- Xóa phần tử an toàn khi đang duyệt bằng `iterator.remove()`.
- Viết code duyệt độc lập với loại collection, dễ thay đổi sau này.
- Hiểu nguồn gốc `ConcurrentModificationException` để tránh và xử lý đúng.
:::

---

## Iterator là gì?

**Iterator** (bộ lặp — công cụ để duyệt từng phần tử của một tập hợp) giống như một "con trỏ" di chuyển lần lượt qua các phần tử trong collection (List, Set, Map...). Bạn dùng nó để **đi qua từng phần tử một** mà không cần quan tâm cấu trúc bên trong.

Hãy tưởng tượng bạn đọc một danh sách bằng cách đặt ngón tay lên từng dòng, đọc xong thì trượt ngón tay xuống dòng tiếp theo. Iterator chính là "ngón tay" đó.

Mọi collection trong Java đều cung cấp một Iterator, nên đây là cách duyệt **thống nhất** cho tất cả các loại tập hợp.

---

## hasNext và next

Iterator có hai phương thức cốt lõi:

- **`hasNext()`**: trả về `true` nếu **còn phần tử** phía sau để đọc.
- **`next()`**: trả về **phần tử tiếp theo** và dịch con trỏ tiến lên một bước.

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

List<String> ten = new ArrayList<>();
ten.add("An");
ten.add("Bình");
ten.add("Cường");

// Lấy iterator
Iterator<String> it = ten.iterator();

// Lặp: chừng nào còn phần tử thì lấy ra
while (it.hasNext()) {
    String t = it.next(); // lấy phần tử và tiến lên
    System.out.println(t);
}
// In ra: An, Bình, Cường
```

Quy trình luôn là: kiểm tra `hasNext()` trước, nếu còn thì gọi `next()`.

---

## Lấy Iterator từ một collection

Bất kỳ List hay Set nào cũng có phương thức `iterator()`:

```java
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

Set<Integer> so = new HashSet<>();
so.add(1);
so.add(2);
so.add(3);

Iterator<Integer> it = so.iterator();
while (it.hasNext()) {
    System.out.println(it.next());
}
```

Map không có `iterator()` trực tiếp, nhưng bạn lấy iterator từ `entrySet()`, `keySet()` hoặc `values()`.

---

## Xóa phần tử an toàn với remove

Iterator có phương thức **`remove()`** để xóa phần tử **vừa được trả về bởi `next()`**. Đây là cách **an toàn duy nhất** để xóa phần tử trong khi đang duyệt.

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

List<Integer> so = new ArrayList<>();
so.add(1); so.add(2); so.add(3); so.add(4);

Iterator<Integer> it = so.iterator();
while (it.hasNext()) {
    int n = it.next();
    if (n % 2 == 0) {
        it.remove(); // xóa số chẵn một cách an toàn
    }
}

System.out.println(so); // [1, 3]
```

Lưu ý: phải gọi `next()` **trước** rồi mới gọi `it.remove()`. Gọi `remove()` hai lần liên tiếp hoặc trước `next()` sẽ gây lỗi.

---

## ConcurrentModificationException

Đây là lỗi rất hay gặp. Nếu bạn **sửa đổi collection (thêm/xóa)** trong khi đang duyệt bằng for-each hoặc iterator — mà **không** dùng `it.remove()` — Java sẽ ném **`ConcurrentModificationException`** (ngoại lệ sửa đổi đồng thời).

```java
import java.util.ArrayList;
import java.util.List;

List<Integer> so = new ArrayList<>();
so.add(1); so.add(2); so.add(3);

// SAI: xóa trực tiếp trên list trong khi for-each đang duyệt
for (Integer n : so) {
    if (n == 2) {
        so.remove(n); // ném ConcurrentModificationException!
    }
}
```

Cách sửa đúng là dùng `iterator.remove()`:

```java
// ĐÚNG: dùng iterator.remove()
Iterator<Integer> it = so.iterator();
while (it.hasNext()) {
    if (it.next() == 2) {
        it.remove(); // an toàn
    }
}
```

> Ghi nhớ: **không bao giờ** thêm/xóa trực tiếp vào collection bên trong vòng lặp for-each của chính nó.

---

## So sánh với vòng lặp for-each

Thực ra, vòng lặp **for-each** mà bạn hay dùng chính là Iterator được "che giấu" bên dưới:

```java
// Hai đoạn này tương đương nhau:

// Cách viết for-each (ngắn gọn)
for (String t : ten) {
    System.out.println(t);
}

// Cách Java thực sự chạy bên trong (dùng Iterator)
Iterator<String> it = ten.iterator();
while (it.hasNext()) {
    String t = it.next();
    System.out.println(t);
}
```

Vậy khi nào cần Iterator thủ công? Khi bạn cần **xóa phần tử trong lúc duyệt** — điều mà for-each không làm được an toàn.

---

## ListIterator — duyệt hai chiều

**ListIterator** là phiên bản mạnh hơn, chỉ dùng cho **List**. Nó cho phép:

- Duyệt **cả tiến lẫn lùi** (`hasNext`/`next` và `hasPrevious`/`previous`).
- **Thêm** phần tử (`add`) và **sửa** phần tử (`set`) trong lúc duyệt.

```java
import java.util.ArrayList;
import java.util.List;
import java.util.ListIterator;

List<String> ten = new ArrayList<>();
ten.add("An");
ten.add("Bình");

ListIterator<String> lit = ten.listIterator();

// Duyệt tiến và sửa giá trị
while (lit.hasNext()) {
    String t = lit.next();
    lit.set(t.toUpperCase()); // đổi thành chữ HOA
}
System.out.println(ten); // [AN, BÌNH]

// Duyệt lùi từ cuối về đầu
while (lit.hasPrevious()) {
    System.out.println(lit.previous());
}
// In ra: BÌNH, AN
```

---

## Lỗi thường gặp

1. **ConcurrentModificationException**: thêm/xóa trực tiếp vào collection khi đang for-each. Dùng `iterator.remove()` để xóa an toàn.

2. **Gọi `next()` khi đã hết phần tử**: nếu không kiểm tra `hasNext()` mà gọi `next()` khi hết, sẽ ném `NoSuchElementException`. Luôn kiểm tra `hasNext()` trước.

3. **Gọi `it.remove()` trước `next()`**: `remove()` chỉ hợp lệ sau khi `next()` đã được gọi. Gọi sai thứ tự ném `IllegalStateException`.

4. **Dùng ListIterator cho Set**: ListIterator chỉ dành cho List. Set không có chỉ số nên không hỗ trợ.

---

## Tóm tắt

- **Iterator** là công cụ duyệt từng phần tử của collection, hoạt động như một con trỏ.
- Hai phương thức cốt lõi: `hasNext()` (còn phần tử không?) và `next()` (lấy phần tử kế tiếp).
- `iterator.remove()` là cách **an toàn** để xóa phần tử trong khi duyệt.
- Sửa đổi collection trực tiếp khi for-each gây **`ConcurrentModificationException`**.
- Vòng lặp **for-each** thực chất dùng Iterator bên dưới.
- **ListIterator** (chỉ cho List) mạnh hơn: duyệt **hai chiều**, có thể `add` và `set`.
