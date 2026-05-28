---
sidebar_position: 6
title: "6. Stack (Ngăn xếp LIFO)"
---

# Stack -- Cấu trúc ngăn xếp LIFO

`Stack` lưu phần tử theo nguyên tắc **LIFO** (Last-In-First-Out) -- ai vào sau ra trước. Đây là cấu trúc dữ liệu **kinh điển** trong CS -- xuất hiện ở mọi nơi từ JVM (call stack), compiler (parse), đến app (undo/redo).

**Tương tự đơn giản:** Stack giống **chồng đĩa**: bạn chỉ có thể **đặt đĩa lên trên cùng** (push) và **lấy đĩa từ trên cùng** (pop). Đĩa cuối cùng đặt vào sẽ là đĩa đầu tiên lấy ra.

---

## Mục lục

- [1. Stack là gì?](#1-stack-là-gì)
- [2. `java.util.Stack` (legacy)](#2-javautilstack-legacy)
- [3. Deque làm Stack (khuyến nghị)](#3-deque-làm-stack-khuyến-nghị)
- [4. Ứng dụng của Stack](#4-ứng-dụng-của-stack)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Stack là gì?

Stack có 3 thao tác chính:

| Operation | Mô tả                            |
| --------- | -------------------------------- |
| `push(x)` | Thêm phần tử lên đỉnh stack      |
| `pop()`   | Lấy và xóa phần tử trên đỉnh     |
| `peek()`  | Xem phần tử trên đỉnh (không xóa)|

Tất cả đều **O(1)**.

```
push(1)    ->  [1]
push(2)    ->  [1, 2]
push(3)    ->  [1, 2, 3]   <- top
pop()      ->  3, stack: [1, 2]
peek()     ->  2
```

---

## 2. `java.util.Stack` (legacy)

Class `Stack` có từ Java 1.0:

```java
import java.util.Stack;

Stack<Integer> stack = new Stack<>();
stack.push(1);
stack.push(2);
stack.push(3);

System.out.println(stack.peek()); // 3
System.out.println(stack.pop());  // 3
System.out.println(stack);        // [1, 2]
System.out.println(stack.empty()); // false
```

### Vấn đề

- Kế thừa `Vector` -- mọi method **synchronized** (không cần thiết)
- Có method từ Vector: `add(index, elem)`, `get(index)` -- vi phạm tính chất stack
- Hiệu năng kém

**Khuyến nghị JDK:**

> The `Deque` interface and its implementations should be used in preference to the `Stack` class.

---

## 3. Deque làm Stack (khuyến nghị)

```java
import java.util.*;

Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);   // them dau (= stack top)
stack.push(2);
stack.push(3);

System.out.println(stack.peek()); // 3
System.out.println(stack.pop());  // 3
System.out.println(stack);        // [2, 1]
System.out.println(stack.isEmpty()); // false
```

**Ưu điểm:**

- Không synchronized -- nhanh hơn 2-3x
- API thuần stack: chỉ `push/pop/peek`
- Cùng class `ArrayDeque` có thể dùng làm Queue

---

## 4. Ứng dụng của Stack

### 4.1. Đảo ngược chuỗi

```java
public static String reverse(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    for (char c : s.toCharArray()) stack.push(c);

    StringBuilder sb = new StringBuilder();
    while (!stack.isEmpty()) sb.append(stack.pop());
    return sb.toString();
}

reverse("hello"); // "olleh"
```

### 4.2. Kiểm tra dấu ngoặc cân bằng

```java
public static boolean isBalanced(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    Map<Character, Character> pair = Map.of(')', '(', ']', '[', '}', '{');

    for (char c : s.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') {
            stack.push(c);
        } else if (pair.containsKey(c)) {
            if (stack.isEmpty() || stack.pop() != pair.get(c)) return false;
        }
    }
    return stack.isEmpty();
}

isBalanced("({[]})"); // true
isBalanced("({[)]}"); // false
```

### 4.3. Postfix expression evaluation

```java
public static int evalPostfix(String[] tokens) {
    Deque<Integer> stack = new ArrayDeque<>();
    for (String t : tokens) {
        switch (t) {
            case "+", "-", "*", "/" -> {
                int b = stack.pop();
                int a = stack.pop();
                stack.push(switch (t) {
                    case "+" -> a + b;
                    case "-" -> a - b;
                    case "*" -> a * b;
                    case "/" -> a / b;
                    default -> throw new IllegalStateException();
                });
            }
            default -> stack.push(Integer.parseInt(t));
        }
    }
    return stack.pop();
}

// "3 4 + 2 *" = (3+4)*2 = 14
evalPostfix(new String[]{"3", "4", "+", "2", "*"}); // 14
```

### 4.4. Undo/Redo

```java
class Editor {
    Deque<String> undoStack = new ArrayDeque<>();
    Deque<String> redoStack = new ArrayDeque<>();
    String state = "";

    void type(String c) {
        undoStack.push(state);
        redoStack.clear();
        state += c;
    }

    void undo() {
        if (!undoStack.isEmpty()) {
            redoStack.push(state);
            state = undoStack.pop();
        }
    }

    void redo() {
        if (!redoStack.isEmpty()) {
            undoStack.push(state);
            state = redoStack.pop();
        }
    }
}
```

### 4.5. DFS (Depth-First Search)

```java
public static void dfs(int start, Map<Integer, List<Integer>> graph) {
    Deque<Integer> stack = new ArrayDeque<>();
    Set<Integer> visited = new HashSet<>();
    stack.push(start);

    while (!stack.isEmpty()) {
        int node = stack.pop();
        if (visited.add(node)) {
            System.out.println(node);
            for (int next : graph.getOrDefault(node, List.of())) {
                if (!visited.contains(next)) stack.push(next);
            }
        }
    }
}
```

### 4.6. JVM Call Stack

Mỗi method call push lên call stack. Khi method return, frame được pop. Đệ quy quá sâu -> `StackOverflowError`.

---

## Khi nào dùng?

- **Dùng Stack khi:**
  - Xử lý theo thứ tự ngược (parsing, DFS)
  - Undo/Redo
  - Đánh giá biểu thức
  - Backtracking (recursive thay bằng iterative)
- **Best practice:**
  - **KHÔNG** dùng `java.util.Stack` (legacy)
  - Khai báo `Deque<T> stack = new ArrayDeque<>()`
  - Chỉ dùng `push/pop/peek` -- không dùng method từ Deque/Collection khác
  - Nếu thread-safe cần thiết, dùng `ConcurrentLinkedDeque`

---

## Lỗi thường gặp

### Lỗi 1: Dùng `java.util.Stack`

```java
// SAI
Stack<Integer> stack = new Stack<>();

// DUNG
Deque<Integer> stack = new ArrayDeque<>();
```

### Lỗi 2: `pop` khi rỗng

```java
Deque<Integer> stack = new ArrayDeque<>();
stack.pop(); // NoSuchElementException

// DUNG -- check truoc
if (!stack.isEmpty()) stack.pop();

// Hoac dung peekFirst()
Integer top = stack.peekFirst(); // null neu rong
```

### Lỗi 3: Stack overflow do đệ quy sâu

```java
// SAI -- de quy 100k lan -> StackOverflowError
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

// DUNG -- iterative voi explicit stack
int factorial(int n) {
    int result = 1;
    for (int i = 2; i <= n; i++) result *= i;
    return result;
}
```

### Lỗi 4: Order khi push iterable

```java
// Khi push tat ca phan tu cua list vao stack
Deque<Integer> stack = new ArrayDeque<>();
for (int x : List.of(1, 2, 3)) stack.push(x);
// stack = [3, 2, 1] (top -> bottom)

// Khi pop: 3, 2, 1 (nguoc thu tu push)
```

---

## Câu hỏi phỏng vấn

### Câu 1: Stack và Queue khác nhau thế nào?

**Trả lời:**

- **Stack (LIFO)**: thêm + lấy **cùng một đầu** -- vào sau ra trước
- **Queue (FIFO)**: thêm một đầu, lấy đầu kia -- vào trước ra trước

Stack dùng cho parsing, undo, DFS. Queue dùng cho task processing, BFS.

### Câu 2: Tại sao không dùng `java.util.Stack`?

**Trả lời:**

- Kế thừa `Vector` -- mọi method `synchronized`, chậm
- API "bẩn" -- có method từ Vector vi phạm tính chất stack (`get(i)`, `set(i)`)
- JDK chính thức khuyến nghị `Deque`

`ArrayDeque` nhanh hơn 2-3x và API thuần stack.

### Câu 3: StackOverflowError xảy ra khi nào?

**Trả lời:** Khi **call stack** đầy -- thường do đệ quy quá sâu (10k+ level), hoặc đệ quy vô tận. Cách khắc phục:

- Đổi sang iterative với explicit stack
- Tăng kích thước stack thread (`-Xss2m`)
- Dùng **tail recursion** (Java không tối ưu, nhưng Kotlin/Scala có)

### Câu 4: Stack thread-safe có không?

**Trả lời:** Có:

- `java.util.Stack` -- synchronized (nhưng cũ)
- `ConcurrentLinkedDeque` -- lock-free
- `LinkedBlockingDeque` -- blocking
- `Collections.synchronizedDeque(new ArrayDeque<>())` -- wrap

Khuyến nghị `ConcurrentLinkedDeque` cho lock-free thread-safe stack.

### Câu 5: Bài toán nào không thể giải bằng stack?

**Trả lời:** Bài toán cần truy cập **giữa** stack -- ví dụ "tìm phần tử thứ k từ đỉnh". Stack chỉ cho truy cập đỉnh. Nếu cần linh hoạt hơn, dùng `Deque` hoặc `List`.
