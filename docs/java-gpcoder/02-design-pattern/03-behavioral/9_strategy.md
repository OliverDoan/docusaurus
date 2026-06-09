---
sidebar_position: 9
title: "Strategy Pattern"
---

# Java Design Pattern - Strategy

Strategy là một mẫu thiết kế hành vi cho phép gom một nhóm thuật toán lại, đóng gói mỗi thuật toán vào một lớp riêng và cho phép hoán đổi chúng cho nhau ngay lúc chạy chương trình. Nhờ vậy ta thay đổi cách làm mà không phải sửa code phía dùng nó, ví dụ chọn nhiều phương thức thanh toán hay nhiều cách sắp xếp. Bài này giới thiệu ý tưởng kèm ví dụ Java; chi tiết nằm bên dưới.

## Mục đích

**Strategy** (Chiến lược) là một mẫu thiết kế hành vi định nghĩa một nhóm thuật toán, đóng gói từng thuật toán vào một lớp riêng biệt, và làm cho chúng có thể hoán đổi cho nhau tại runtime. Pattern này cho phép thuật toán thay đổi độc lập với client sử dụng nó.

## Vấn đề giải quyết

Khi có nhiều biến thể của một thuật toán và bạn muốn chuyển đổi giữa chúng linh hoạt mà không thay đổi code client. Ví dụ: ứng dụng thanh toán hỗ trợ nhiều phương thức (tiền mặt, thẻ, ví điện tử) — mỗi cách thanh toán là một chiến lược.

## Cấu trúc

- **Strategy** (interface): khai báo phương thức thực thi thuật toán.
- **ConcreteStrategy**: triển khai thuật toán cụ thể.
- **Context**: lưu tham chiếu tới Strategy, ủy quyền việc thực thi cho Strategy, cho phép thay đổi Strategy tại runtime.

## Ví dụ Java: Hệ thống sắp xếp linh hoạt

```java
import java.util.Arrays;

// Strategy interface
interface SortStrategy {
    void sort(int[] data);
    String getName();
}

// ConcreteStrategy: Bubble Sort (Sắp xếp nổi bọt)
class BubbleSort implements SortStrategy {
    @Override
    public void sort(int[] data) {
        int n = data.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (data[j] > data[j + 1]) {
                    int temp = data[j];
                    data[j] = data[j + 1];
                    data[j + 1] = temp;
                }
            }
        }
    }

    @Override
    public String getName() { return "Bubble Sort"; }
}

// ConcreteStrategy: Selection Sort (Sắp xếp chọn)
class SelectionSort implements SortStrategy {
    @Override
    public void sort(int[] data) {
        int n = data.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (data[j] < data[minIdx]) {
                    minIdx = j;
                }
            }
            int temp = data[minIdx];
            data[minIdx] = data[i];
            data[i] = temp;
        }
    }

    @Override
    public String getName() { return "Selection Sort"; }
}

// ConcreteStrategy: Java built-in Arrays.sort (Quick Sort / Tim Sort)
class BuiltInSort implements SortStrategy {
    @Override
    public void sort(int[] data) {
        Arrays.sort(data);
    }

    @Override
    public String getName() { return "Built-in Sort"; }
}

// Context
class Sorter {
    private SortStrategy strategy;

    public Sorter(SortStrategy strategy) {
        this.strategy = strategy;
    }

    // Thay đổi chiến lược tại runtime
    public void setStrategy(SortStrategy strategy) {
        this.strategy = strategy;
    }

    public int[] sort(int[] data) {
        int[] copy = Arrays.copyOf(data, data.length);
        System.out.print("Dùng " + strategy.getName() + ": ");
        strategy.sort(copy);
        return copy;
    }
}

// Client
public class StrategyDemo {
    public static void main(String[] args) {
        int[] data = {64, 25, 12, 22, 11};
        System.out.println("Dữ liệu gốc: " + Arrays.toString(data));

        Sorter sorter = new Sorter(new BubbleSort());
        System.out.println(Arrays.toString(sorter.sort(data)));

        sorter.setStrategy(new SelectionSort());
        System.out.println(Arrays.toString(sorter.sort(data)));

        sorter.setStrategy(new BuiltInSort());
        System.out.println(Arrays.toString(sorter.sort(data)));
    }
}
```

**Kết quả:**
```
Dữ liệu gốc: [64, 25, 12, 22, 11]
Dùng Bubble Sort: [11, 12, 22, 25, 64]
Dùng Selection Sort: [11, 12, 22, 25, 64]
Dùng Built-in Sort: [11, 12, 22, 25, 64]
```

## Ưu điểm

- Thay thế thuật toán tại runtime mà không thay đổi Context.
- Loại bỏ các câu điều kiện `if-else` liên quan đến chọn thuật toán.
- Tuân thủ Open/Closed Principle — thêm chiến lược mới không cần sửa code cũ.
- Dễ kiểm thử riêng từng chiến lược.

## Nhược điểm

- Client cần biết sự khác biệt giữa các chiến lược để chọn đúng.
- Tăng số lượng lớp và đối tượng.

## Khi nào dùng

- Khi muốn thay đổi thuật toán được dùng bên trong đối tượng tại runtime.
- Khi có nhiều lớp chỉ khác nhau ở cách thực hiện một hành vi nào đó.
- Ví dụ thực tế: phương thức thanh toán (tiền mặt/thẻ/ví), thuật toán nén file, chiến lược định tuyến, bộ lọc dữ liệu, validator.
