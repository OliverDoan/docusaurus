# Heap Space vs Stack

## 1. Giới thiệu
Java nổi tiếng với khả năng **quản lý bộ nhớ tự động**, giúp lập trình viên không phải cấp phát/giải phóng bộ nhớ thủ công như C/C++.

Tuy nhiên, để viết code **hiệu quả – tối ưu – ít lỗi**, bạn **bắt buộc phải hiểu**:
- Heap là gì?
- Stack là gì?
- Đối tượng và biến được lưu ở đâu?
- Vì sao xảy ra `OutOfMemoryError` hay `StackOverflowError`?

---

## 2. Tổng quan bộ nhớ trong Java

Bộ nhớ Java Runtime (JVM) được chia thành nhiều vùng, trong đó **quan trọng nhất** là:

- **Stack Memory**
- **Heap Memory**

```
JVM Memory
 ├── Stack (per thread)
 └── Heap (shared)
```

---

## 3. Stack Memory

### 3.1 Stack là gì?
**Stack** là vùng bộ nhớ:
- Lưu **biến cục bộ**
- Lưu **tham số phương thức**
- Lưu **call stack (lời gọi hàm)**

👉 Mỗi **thread có stack riêng**.

---

### 3.2 Đặc điểm của Stack
- Truy cập **rất nhanh**
- Quản lý theo cơ chế **LIFO** (Last In – First Out)
- Tự động cấp phát và thu hồi khi phương thức kết thúc
- Kích thước **giới hạn**

---

### 3.3 Ví dụ Stack

```java
void foo() {
    int x = 10;
    bar();
}

void bar() {
    int y = 20;
}
```

👉 Khi `foo()` gọi `bar()`:

```
Stack
┌─────────────┐
│ bar(): y    │
├─────────────┤
│ foo(): x    │
└─────────────┘
```

---

## 4. StackOverflowError

```java
void recursive() {
    recursive();
}
```

👉 Gọi đệ quy vô hạn → Stack đầy → `StackOverflowError`.

---

## 5. Heap Memory

### 5.1 Heap là gì?
**Heap** là vùng bộ nhớ:
- Lưu **object**
- Lưu **instance variable**
- Được **chia sẻ giữa các thread**

```java
Person p = new Person();
```

👉 `p` nằm trên **Stack**, object `Person` nằm trên **Heap**.

---

### 5.2 Đặc điểm của Heap
- Dung lượng lớn
- Truy cập chậm hơn Stack
- Được quản lý bởi **Garbage Collector (GC)**

---

## 6. Heap structure (đơn giản)

```
Heap
 ├── Young Generation
 │    ├── Eden
 │    ├── Survivor S0
 │    └── Survivor S1
 └── Old Generation
```

👉 Object mới → Eden → sống lâu → Old Generation.

---

## 7. OutOfMemoryError

```java
List<int[]> list = new ArrayList<>();

while (true) {
    list.add(new int[1000000]);
}
```

👉 Heap không đủ chỗ → `OutOfMemoryError`.

---

## 8. So sánh Heap vs Stack

| Tiêu chí | Stack | Heap |
|-------|-------|------|
| Lưu trữ | Biến cục bộ | Object |
| Thread-safe | ✔ (riêng) | ❌ (chia sẻ) |
| Tốc độ | Rất nhanh | Chậm hơn |
| Quản lý | Tự động | GC |
| Lỗi thường gặp | StackOverflowError | OutOfMemoryError |

---

## 9. Ví dụ tổng hợp

```java
class Person {
    String name;
}

public static void main(String[] args) {
    Person p1 = new Person();
    Person p2 = p1;
}
```

👉
- `p1`, `p2`: Stack
- `Person`: Heap
- `p1` và `p2` **trỏ cùng object**

---

## 10. Tại sao hiểu Heap vs Stack quan trọng?

- Tránh rò rỉ bộ nhớ
- Hiểu GC hoạt động
- Viết code hiệu năng cao
- Debug lỗi runtime dễ hơn

---

## 11. Best practices

- Tránh object không cần thiết
- Cẩn thận với static reference
- Đóng tài nguyên (IO, DB)
- Giới hạn đệ quy

---

## 12. Tổng kết

- Stack: nhanh, nhỏ, per-thread
- Heap: lớn, chia sẻ, GC quản lý
- Lỗi bộ nhớ là lỗi **runtime rất nguy hiểm**
- Hiểu bộ nhớ = code Java ở level cao hơn
