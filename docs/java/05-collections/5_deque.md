---
sidebar_position: 5
title: "5. Deque (Hàng đợi hai đầu)"
---

# Deque (Hàng đợi hai đầu)

Deque (hàng đợi hai đầu) cho phép bạn thêm và lấy phần tử ở cả hai đầu, nên có thể dùng vừa như Queue (FIFO) vừa như Stack (LIFO). Lớp ArrayDeque là lựa chọn được khuyến nghị vì nhanh và linh hoạt. Bài này giới thiệu Deque cùng các phương thức thao tác hai đầu; chi tiết nằm bên dưới.

---

## Mục lục

- [Deque là gì?](#deque-là-gì)
- [Tạo Deque với ArrayDeque](#tạo-deque-với-arraydeque)
- [Thêm và lấy ở cả hai đầu](#thêm-và-lấy-ở-cả-hai-đầu)
- [Bảng tổng hợp các phương thức](#bảng-tổng-hợp-các-phương-thức)
- [Dùng Deque làm Queue (FIFO)](#dùng-deque-làm-queue-fifo)
- [Dùng Deque làm Stack (LIFO)](#dùng-deque-làm-stack-lifo)
- [Vì sao ArrayDeque tốt?](#vì-sao-arraydeque-tốt)
- [Ví dụ thực tế](#ví-dụ-thực-tế)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Deque là gì?

**Deque** (đọc là "đẹc", viết tắt của *Double Ended Queue* — hàng đợi hai đầu) là một cấu trúc cho phép bạn **thêm và lấy phần tử ở CẢ hai đầu**: đầu trước và đầu sau.

Hãy tưởng tượng một chồng đĩa mà bạn có thể đặt thêm hoặc lấy đĩa từ **cả phía trên lẫn phía dưới**. Hoặc một đoàn tàu có thể nối thêm toa ở đầu hoặc cuối.

Deque rất linh hoạt: nó có thể đóng vai trò vừa là **Queue** (hàng đợi — FIFO), vừa là **Stack** (ngăn xếp — LIFO). Vì vậy nó là cấu trúc được khuyên dùng cho cả hai mục đích.

---

## Tạo Deque với ArrayDeque

`Deque` là interface; lớp triển khai tốt nhất là **ArrayDeque** (deque dựa trên mảng):

```java
import java.util.ArrayDeque;
import java.util.Deque;

// Tạo deque chứa chuỗi
Deque<String> deque = new ArrayDeque<>();

deque.addFirst("B"); // thêm vào đầu
deque.addLast("C");  // thêm vào cuối
deque.addFirst("A"); // thêm vào đầu

System.out.println(deque); // [A, B, C]
```

---

## Thêm và lấy ở cả hai đầu

Deque có các phương thức rõ ràng cho từng đầu:

```java
import java.util.ArrayDeque;
import java.util.Deque;

Deque<Integer> dq = new ArrayDeque<>();

// THÊM
dq.offerFirst(2); // thêm vào đầu -> [2]
dq.offerFirst(1); // thêm vào đầu -> [1, 2]
dq.offerLast(3);  // thêm vào cuối -> [1, 2, 3]

// XEM (không xóa)
System.out.println(dq.peekFirst()); // 1 (phần tử đầu)
System.out.println(dq.peekLast());  // 3 (phần tử cuối)

// LẤY RA (xóa)
System.out.println(dq.pollFirst()); // 1, deque còn [2, 3]
System.out.println(dq.pollLast());  // 3, deque còn [2]
```

---

## Bảng tổng hợp các phương thức

| Hành động | Ở đầu (First) | Ở cuối (Last) |
|-----------|---------------|---------------|
| Thêm (an toàn) | `offerFirst(x)` | `offerLast(x)` |
| Lấy & xóa (an toàn) | `pollFirst()` | `pollLast()` |
| Xem (an toàn) | `peekFirst()` | `peekLast()` |

Các phương thức `offer/poll/peek` là an toàn (trả về `false`/`null` khi rỗng). Ngoài ra còn có `addFirst/addLast`, `removeFirst/removeLast`, `getFirst/getLast` nhưng chúng **ném lỗi** khi rỗng — người mới nên ưu tiên bộ `offer/poll/peek`.

---

## Dùng Deque làm Queue (FIFO)

Để dùng Deque như một hàng đợi vào-trước-ra-trước: **thêm ở cuối, lấy ở đầu**.

```java
import java.util.ArrayDeque;
import java.util.Deque;

Deque<String> hangDoi = new ArrayDeque<>();

// Thêm vào cuối
hangDoi.offerLast("An");
hangDoi.offerLast("Bình");

// Lấy từ đầu -> An ra trước (FIFO)
System.out.println(hangDoi.pollFirst()); // An
System.out.println(hangDoi.pollFirst()); // Bình
```

---

## Dùng Deque làm Stack (LIFO)

Để dùng Deque như một **ngăn xếp** vào-sau-ra-trước (LIFO — Last In First Out): **thêm và lấy ở CÙNG một đầu**. Deque có sẵn `push` và `pop` cho mục đích này:

```java
import java.util.ArrayDeque;
import java.util.Deque;

Deque<String> stack = new ArrayDeque<>();

// push: đẩy vào đỉnh (thực chất là addFirst)
stack.push("Trang 1");
stack.push("Trang 2");
stack.push("Trang 3");

// pop: lấy ra từ đỉnh (thực chất là pollFirst)
System.out.println(stack.pop()); // Trang 3 (vào sau ra trước)
System.out.println(stack.pop()); // Trang 2

// peek: xem đỉnh
System.out.println(stack.peek()); // Trang 1
```

---

## Vì sao ArrayDeque tốt?

ArrayDeque được Java khuyến nghị dùng cho **cả Queue lẫn Stack**, thay cho các lớp cũ:

- **Nhanh hơn** lớp `Stack` cũ (lớp `Stack` bị đồng bộ hóa không cần thiết nên chậm).
- **Nhanh hơn** dùng `LinkedList` cho phần lớn trường hợp.
- API rõ ràng, đầy đủ cho thao tác hai đầu.

> Quy tắc ghi nhớ: cần Stack hoặc Queue hiệu năng cao? Dùng **ArrayDeque**.

Lưu ý: ArrayDeque **không cho phép phần tử `null`**. Nếu cố thêm `null` sẽ bị lỗi.

---

## Ví dụ thực tế

Tính năng "Undo/Redo" (hoàn tác/làm lại) trong trình soạn thảo có thể dùng hai Deque:

```java
import java.util.ArrayDeque;
import java.util.Deque;

Deque<String> undo = new ArrayDeque<>(); // các hành động đã làm

// Người dùng thực hiện các thao tác
undo.push("Gõ chữ 'A'");
undo.push("Gõ chữ 'B'");
undo.push("Xóa chữ 'B'");

// Bấm Undo: lấy hành động gần nhất (LIFO)
String hanhDongCuoi = undo.pop();
System.out.println("Hoàn tác: " + hanhDongCuoi); // Hoàn tác: Xóa chữ 'B'
```

---

## Lỗi thường gặp

1. **Thêm `null` vào ArrayDeque**: không được phép, sẽ ném `NullPointerException`. Hãy đảm bảo giá trị khác null.

2. **Nhầm đầu nào là "đỉnh" khi dùng làm Stack**: `push`/`pop` đều thao tác ở **đầu (First)**. Nếu trộn lẫn `pollLast` vào, logic LIFO sẽ sai.

3. **Dùng add/remove rồi gặp lỗi khi rỗng**: `removeFirst()` trên deque rỗng ném lỗi. Dùng `pollFirst()` để an toàn.

4. **Quên import**: cần `import java.util.ArrayDeque;` và `import java.util.Deque;`.

---

## Tóm tắt

- **Deque** là hàng đợi **hai đầu** — thêm/lấy được ở cả đầu và cuối.
- Lớp triển khai tốt nhất là **ArrayDeque**.
- Bộ phương thức an toàn: `offerFirst/offerLast`, `pollFirst/pollLast`, `peekFirst/peekLast`.
- Dùng làm **Queue (FIFO)**: thêm cuối, lấy đầu.
- Dùng làm **Stack (LIFO)**: dùng `push`/`pop` (cùng một đầu).
- ArrayDeque **nhanh hơn** lớp `Stack` cũ và `LinkedList` — là lựa chọn được khuyến nghị.
- ArrayDeque **không nhận giá trị `null`**.
