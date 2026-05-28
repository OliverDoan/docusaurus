---
sidebar_position: 4
title: "4. Queue (Hàng đợi FIFO)"
---

# Queue -- Hàng đợi FIFO

`Queue` lưu phần tử theo nguyên tắc **FIFO** (First-In-First-Out) -- ai vào trước ra trước. Đây là cấu trúc dữ liệu **rất phổ biến** trong các bài toán xử lý task, BFS, message broker.

**Tương tự đơn giản:** Queue giống **hàng người xếp hàng mua vé** -- người đến trước được mua trước. Không ai "chen ngang". Phần tử thêm vào **cuối** (enqueue), lấy ra từ **đầu** (dequeue).

---

## Mục lục

- [1. Queue Interface](#1-queue-interface)
- [2. LinkedList implement Queue](#2-linkedlist-implement-queue)
- [3. ArrayDeque](#3-arraydeque)
- [4. PriorityQueue](#4-priorityqueue)
- [5. BlockingQueue](#5-blockingqueue)
- [6. ConcurrentLinkedQueue](#6-concurrentlinkedqueue)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Queue Interface

```java
import java.util.*;

Queue<String> queue = new LinkedList<>();
queue.offer("A"); // them vao cuoi
queue.offer("B");
queue.offer("C");

System.out.println(queue);       // [A, B, C]
System.out.println(queue.peek()); // A -- xem dau, khong xoa
System.out.println(queue.poll()); // A -- lay va xoa
System.out.println(queue);        // [B, C]
```

### Phương thức chính

| Hành động      | Throw exception | Trả về đặc biệt |
| -------------- | --------------- | ---------------- |
| Thêm cuối      | `add(e)`        | `offer(e)`       |
| Xóa đầu        | `remove()`      | `poll()`         |
| Xem đầu        | `element()`     | `peek()`         |

**Khác biệt:**

- `add/remove/element` -- ném exception khi không thể (đầy/rỗng)
- `offer/poll/peek` -- trả `false`/`null`

Khuyến khích dùng `offer/poll/peek` (an toàn hơn).

---

## 2. LinkedList implement Queue

`LinkedList` cũng implement `Queue` -- truyền thống.

```java
Queue<Integer> q = new LinkedList<>();
q.offer(1); q.offer(2); q.offer(3);
while (!q.isEmpty()) {
    System.out.println(q.poll());
}
// Output: 1, 2, 3
```

**Nhược điểm:** LinkedList memory overhead lớn (mỗi node ~24 byte).

---

## 3. ArrayDeque

`ArrayDeque` -- **deque** (double-ended queue), nhanh và tiết kiệm memory hơn LinkedList. Có thể dùng làm Queue **hoặc** Stack.

```java
Deque<Integer> deque = new ArrayDeque<>();

// Dung nhu Queue (FIFO)
deque.offer(1);
deque.offer(2);
System.out.println(deque.poll()); // 1

// Dung nhu Stack (LIFO)
deque.push(1);
deque.push(2);
System.out.println(deque.pop());  // 2
```

### Phương thức Deque

| Hành động              | Phương thức            |
| ---------------------- | ---------------------- |
| Thêm đầu               | `offerFirst` / `push`  |
| Thêm cuối              | `offerLast`            |
| Xóa đầu                | `pollFirst` / `pop`    |
| Xóa cuối               | `pollLast`             |
| Xem đầu                | `peekFirst`            |
| Xem cuối               | `peekLast`             |

**Khuyến nghị:** Dùng `ArrayDeque` thay `Stack` (legacy, synchronized) và `LinkedList` (cho queue).

---

## 4. PriorityQueue

`PriorityQueue` -- heap nội bộ. Phần tử lấy ra theo **độ ưu tiên** (không FIFO).

```java
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.offer(5); pq.offer(1); pq.offer(3); pq.offer(2);

while (!pq.isEmpty()) {
    System.out.print(pq.poll() + " "); // 1 2 3 5
}
```

### Với Comparator

```java
// Max heap (mac dinh la min heap)
PriorityQueue<Integer> max = new PriorityQueue<>(Comparator.reverseOrder());
max.offer(5); max.offer(1); max.offer(3);
System.out.println(max.poll()); // 5

// Custom
PriorityQueue<String> byLength = new PriorityQueue<>(
    Comparator.comparingInt(String::length)
);
```

### Hiệu năng

- `offer`, `poll`: O(log n)
- `peek`: O(1)
- `contains`, `remove(obj)`: O(n) -- chậm

**Ứng dụng:** Dijkstra, A*, scheduler theo độ ưu tiên.

---

## 5. BlockingQueue

`BlockingQueue` -- queue thread-safe, **block khi đầy** (lúc put) hoặc **rỗng** (lúc take). Pattern Producer-Consumer.

```java
import java.util.concurrent.*;

BlockingQueue<String> queue = new LinkedBlockingQueue<>(10);

// Producer
new Thread(() -> {
    try {
        queue.put("item"); // block neu day
    } catch (InterruptedException e) {}
}).start();

// Consumer
new Thread(() -> {
    try {
        String item = queue.take(); // block neu rong
    } catch (InterruptedException e) {}
}).start();
```

### Các implementation

| Class                       | Đặc điểm                              |
| --------------------------- | ------------------------------------- |
| `ArrayBlockingQueue`        | Bounded, array-based                  |
| `LinkedBlockingQueue`       | Optional bounded, linked list         |
| `PriorityBlockingQueue`     | Có priority, unbounded                |
| `DelayQueue`                | Lấy ra khi đã đủ delay                |
| `SynchronousQueue`          | Capacity 0 -- direct handoff          |

---

## 6. ConcurrentLinkedQueue

Queue **non-blocking, lock-free** thread-safe -- dùng CAS.

```java
import java.util.concurrent.ConcurrentLinkedQueue;

ConcurrentLinkedQueue<String> queue = new ConcurrentLinkedQueue<>();
queue.offer("a");
String item = queue.poll();
```

Không block, không có capacity giới hạn -- phù hợp khi không cần block.

---

## Khi nào dùng?

- **`LinkedList`/`ArrayDeque`**: Queue đơn giản, single-thread -- ưu tiên `ArrayDeque`
- **`PriorityQueue`**: Thuật toán -- Dijkstra, scheduling, top-K
- **`BlockingQueue`**: Producer-Consumer giữa thread
- **`ConcurrentLinkedQueue`**: Queue thread-safe không cần block
- **`ArrayDeque` thay `Stack`**: Stack legacy chậm
- **Best practice:**
  - Khai báo `Queue<T>` thay implementation cụ thể
  - Dùng `offer/poll/peek` thay vì `add/remove/element`
  - Dùng `ArrayDeque` cho queue đơn thread (nhanh hơn LinkedList)

---

## Lỗi thường gặp

### Lỗi 1: Dùng `Stack` legacy

```java
// SAI -- Stack ke thua Vector, synchronized cham
Stack<Integer> stack = new Stack<>();

// DUNG
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);
stack.pop();
```

### Lỗi 2: `add` thay vì `offer`

```java
Queue<Integer> q = new ArrayBlockingQueue<>(3);
q.add(1); q.add(2); q.add(3);
q.add(4); // IllegalStateException

// DUNG
if (!q.offer(4)) {
    System.out.println("Queue day");
}
```

### Lỗi 3: PriorityQueue dùng iterator để in theo thứ tự

```java
PriorityQueue<Integer> pq = new PriorityQueue<>(List.of(5, 1, 3));

// SAI -- iterator KHONG dam bao thu tu
for (int x : pq) System.out.println(x);

// DUNG -- poll de lay theo thu tu
while (!pq.isEmpty()) System.out.println(pq.poll());
```

### Lỗi 4: `LinkedBlockingQueue` không giới hạn

```java
// SAI -- capacity = Integer.MAX, co the OOM
BlockingQueue<Item> q = new LinkedBlockingQueue<>();

// DUNG -- gioi han
BlockingQueue<Item> q = new LinkedBlockingQueue<>(1000);
```

---

## Câu hỏi phỏng vấn

### Câu 1: FIFO và LIFO khác nhau thế nào?

**Trả lời:**

- **FIFO** (Queue): First In, First Out -- vào trước ra trước (hàng vé)
- **LIFO** (Stack): Last In, First Out -- vào sau ra trước (chồng đĩa)

Queue dùng cho task processing, BFS. Stack dùng cho undo, DFS, expression parsing.

### Câu 2: `LinkedList` và `ArrayDeque` -- chọn cái nào cho Queue?

**Trả lời:** **`ArrayDeque`**. Nhanh hơn (cache locality), tiết kiệm memory (~3x), API đầy đủ. `LinkedList` chỉ nên dùng khi cần `List` semantics. **Không bao giờ** dùng `Stack` (legacy).

### Câu 3: PriorityQueue lấy phần tử ra theo thứ tự nào?

**Trả lời:** Theo **độ ưu tiên** -- nhỏ nhất trước với min-heap (mặc định), lớn nhất với max-heap (Comparator.reverseOrder). Không phải FIFO -- 2 phần tử cùng priority **không đảm bảo** thứ tự thêm vào.

### Câu 4: BlockingQueue dùng để làm gì?

**Trả lời:** Pattern **Producer-Consumer**. Producer `put` -- block nếu queue đầy. Consumer `take` -- block nếu queue rỗng. Tự động đồng bộ giữa thread, không cần lock thủ công. Ví dụ: thread pool task queue, message queue trong app.

### Câu 5: `offer` và `add` khác gì?

**Trả lời:**

- `add`: Ném `IllegalStateException` khi queue đầy
- `offer`: Trả `false` -- xử lý nhẹ nhàng hơn

Tương tự `remove()` vs `poll()`, `element()` vs `peek()`. Khuyến khích dùng `offer/poll/peek`.
