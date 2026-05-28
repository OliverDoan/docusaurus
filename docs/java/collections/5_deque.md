---
sidebar_position: 5
title: "5. Deque (Hàng đợi 2 đầu)"
---

# Deque -- Double-Ended Queue

`Deque` (đọc là "deck") là **hàng đợi 2 đầu** -- có thể thêm/xóa ở **cả đầu và cuối**. Là sự kết hợp linh hoạt giữa **Queue** (FIFO) và **Stack** (LIFO).

**Tương tự đơn giản:** Hãy tưởng tượng **hành lang 2 cửa**: người vào/ra có thể qua cửa trước hoặc cửa sau. Deque giống vậy -- thêm/xóa được cả 2 đầu.

---

## Mục lục

- [1. Deque Interface](#1-deque-interface)
- [2. ArrayDeque](#2-arraydeque)
- [3. LinkedList](#3-linkedlist)
- [4. Dùng Deque làm Stack](#4-dùng-deque-làm-stack)
- [5. ConcurrentLinkedDeque](#5-concurrentlinkeddeque)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Deque Interface

```java
import java.util.*;

Deque<String> deque = new ArrayDeque<>();

// Them 2 dau
deque.offerFirst("A");
deque.offerLast("B");
deque.offerLast("C");
deque.offerFirst("Z");
System.out.println(deque); // [Z, A, B, C]

// Xoa 2 dau
System.out.println(deque.pollFirst()); // Z
System.out.println(deque.pollLast());  // C
System.out.println(deque);             // [A, B]
```

### Bảng phương thức Deque

| Hành động  | Đầu (First)               | Cuối (Last)             |
| ---------- | ------------------------- | ----------------------- |
| Thêm       | `addFirst` / `offerFirst` | `addLast` / `offerLast` |
| Xóa        | `removeFirst` / `pollFirst` | `removeLast` / `pollLast` |
| Xem        | `getFirst` / `peekFirst`  | `getLast` / `peekLast`  |

- `add/remove/get`: ném exception nếu rỗng/đầy
- `offer/poll/peek`: trả false/null

---

## 2. ArrayDeque

**Implementation tốt nhất** -- nội bộ là circular array, nhanh, ít memory.

```java
ArrayDeque<Integer> deque = new ArrayDeque<>();
deque.offerLast(1);
deque.offerLast(2);
deque.offerFirst(0);
System.out.println(deque); // [0, 1, 2]

// Capacity tu dong tang
for (int i = 0; i < 1000; i++) deque.offerLast(i);
```

**Đặc điểm:**

- **KHÔNG** cho null (sẽ NPE)
- **Không thread-safe**
- Resize tự động (gấp đôi)
- Nhanh hơn `LinkedList` đáng kể

---

## 3. LinkedList

`LinkedList` cũng implement `Deque`, nhưng:

- Cho phép null
- Memory overhead lớn (mỗi node ~24 byte vs ~4 byte mỗi slot của ArrayDeque)
- Truy cập tuần tự chậm hơn (cache miss)

**Khuyến nghị:** Dùng `ArrayDeque` mặc định, chỉ dùng `LinkedList` khi cần `List` semantics.

---

## 4. Dùng Deque làm Stack

Java có class `Stack` cũ nhưng:

- Kế thừa `Vector` -- mọi method synchronized chậm
- API không thuần stack -- có method từ Vector

**Khuyến nghị JDK:** Dùng `Deque` làm stack.

```java
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);          // them dau
stack.push(2);
stack.push(3);
System.out.println(stack.peek()); // 3
System.out.println(stack.pop());  // 3
System.out.println(stack);        // [2, 1]
```

### Ví dụ -- Đảo ngược string

```java
public static String reverse(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    for (char c : s.toCharArray()) stack.push(c);

    StringBuilder sb = new StringBuilder();
    while (!stack.isEmpty()) sb.append(stack.pop());
    return sb.toString();
}
```

### Ví dụ -- Kiểm tra dấu ngoặc cân bằng

```java
public static boolean isBalanced(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    Map<Character, Character> pair = Map.of(')', '(', ']', '[', '}', '{');

    for (char c : s.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') {
            stack.push(c);
        } else if (pair.containsKey(c)) {
            if (stack.isEmpty() || stack.pop() != pair.get(c)) {
                return false;
            }
        }
    }
    return stack.isEmpty();
}
// isBalanced("({[]})") -> true
// isBalanced("({[)]}") -> false
```

---

## 5. ConcurrentLinkedDeque

Thread-safe deque, lock-free.

```java
import java.util.concurrent.ConcurrentLinkedDeque;

ConcurrentLinkedDeque<String> deque = new ConcurrentLinkedDeque<>();
deque.offerFirst("a");
deque.offerLast("b");
```

Dùng khi cần deque chia sẻ giữa nhiều thread mà không muốn block.

---

## Khi nào dùng?

- **Queue (FIFO)**: `ArrayDeque` -- mặc định
- **Stack (LIFO)**: `ArrayDeque` (KHÔNG dùng `Stack` legacy)
- **Sliding window**: trong thuật toán -- thêm/xóa 2 đầu
- **Undo/Redo**: 2 stack (1 cho undo, 1 cho redo) -- dùng deque
- **Browser history**: forward/backward
- **Best practice:**
  - Khai báo `Deque<T>` interface
  - `ArrayDeque` nếu single-thread
  - `ConcurrentLinkedDeque`/`LinkedBlockingDeque` nếu multi-thread
  - Tránh null nếu dùng ArrayDeque

---

## Lỗi thường gặp

### Lỗi 1: Vẫn dùng `Stack`

```java
// SAI
Stack<Integer> stack = new Stack<>();

// DUNG
Deque<Integer> stack = new ArrayDeque<>();
```

### Lỗi 2: Add null vào ArrayDeque

```java
ArrayDeque<String> d = new ArrayDeque<>();
d.offer(null); // NullPointerException

// DUNG -- dung LinkedList neu can null
LinkedList<String> d2 = new LinkedList<>();
d2.offer(null); // OK
```

### Lỗi 3: Quên `peek`/`poll` khi rỗng

```java
Deque<Integer> d = new ArrayDeque<>();
d.peek(); // null -- OK
d.element(); // NoSuchElementException
```

### Lỗi 4: Nhầm `push` với `offer`

```java
Deque<Integer> d = new ArrayDeque<>();
d.push(1);    // them dau (stack)
d.offer(2);   // them cuoi (queue)
d.peek();     // 1 -- tu dau
```

---

## Câu hỏi phỏng vấn

### Câu 1: Deque là gì? Khác Queue ra sao?

**Trả lời:** Deque (Double-Ended Queue) -- queue có thể thêm/xóa **cả 2 đầu**. Queue thường chỉ thêm cuối, lấy đầu (FIFO). Deque linh hoạt hơn -- dùng được làm Queue (FIFO) hoặc Stack (LIFO).

### Câu 2: Tại sao không dùng `Stack` mà dùng `Deque`?

**Trả lời:**

- `Stack` kế thừa `Vector` -- mọi method synchronized **chậm**, không cần thread-safe
- API có nhiều method "thừa" từ Vector (get(i), set(i))
- Document JDK khuyến nghị dùng `Deque` làm stack

`ArrayDeque` nhanh hơn `Stack` 2-3x.

### Câu 3: ArrayDeque vs LinkedList -- chọn cái nào?

**Trả lời:** **`ArrayDeque`** trong hầu hết case:

- Nhanh hơn (cache friendly)
- Tiết kiệm memory (~3x)
- API tốt hơn

`LinkedList` chỉ tốt khi cần `List` interface (truy cập theo index, dù vẫn chậm).

### Câu 4: Khi nào Deque hữu dụng trong thuật toán?

**Trả lời:**

- **Sliding window maximum**: lưu index theo thứ tự, thêm cuối, xóa đầu
- **Monotonic stack/queue**: bài toán dãy con
- **BFS với 0-1 weight**: thêm đầu nếu trọng số 0, cuối nếu 1
- **Palindrome check**: so sánh đầu và cuối

### Câu 5: `push`/`pop` của Deque khác `offer`/`poll` thế nào?

**Trả lời:**

- `push` = `addFirst` (stack semantic)
- `pop` = `removeFirst` (stack semantic)
- `offer` = `offerLast` (queue semantic)
- `poll` = `pollFirst` (queue semantic)

Nên dùng tên rõ nghĩa (`offerFirst`, `pollLast`) thay vì tên ngắn dễ nhầm.
