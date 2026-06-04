---
sidebar_position: 4
title: "Iterator Pattern"
---

# Java Design Pattern - Iterator

## Mục đích

**Iterator** (Bộ duyệt) là một mẫu thiết kế hành vi cung cấp cách duyệt qua các phần tử của một tập hợp (collection) mà không cần biết cấu trúc bên trong của tập hợp đó. Nó tách biệt logic duyệt khỏi bản thân tập hợp.

## Vấn đề giải quyết

Khi bạn có một cấu trúc dữ liệu phức tạp (danh sách, cây, đồ thị, stack...) và muốn duyệt qua các phần tử theo nhiều cách khác nhau mà không làm lộ chi tiết triển khai nội bộ, tránh làm phình lớp collection với nhiều phương thức duyệt.

## Cấu trúc

- **Iterator** (interface): khai báo `hasNext()` và `next()`.
- **ConcreteIterator**: triển khai logic duyệt cụ thể, theo dõi vị trí hiện tại.
- **Iterable** (interface): khai báo `createIterator()`.
- **ConcreteCollection**: tập hợp thực tế, trả về iterator phù hợp.

## Ví dụ Java: Duyệt danh sách sinh viên

```java
import java.util.ArrayList;
import java.util.List;

// Iterator interface
interface StudentIterator {
    boolean hasNext();
    String next();
}

// Iterable interface
interface StudentCollection {
    StudentIterator createIterator();
}

// ConcreteIterator: duyệt từ đầu đến cuối
class ForwardIterator implements StudentIterator {
    private List<String> students;
    private int index = 0;

    public ForwardIterator(List<String> students) {
        this.students = students;
    }

    @Override
    public boolean hasNext() {
        return index < students.size();
    }

    @Override
    public String next() {
        return students.get(index++);
    }
}

// ConcreteIterator: duyệt từ cuối về đầu
class ReverseIterator implements StudentIterator {
    private List<String> students;
    private int index;

    public ReverseIterator(List<String> students) {
        this.students = students;
        this.index = students.size() - 1;
    }

    @Override
    public boolean hasNext() {
        return index >= 0;
    }

    @Override
    public String next() {
        return students.get(index--);
    }
}

// ConcreteCollection
class Classroom implements StudentCollection {
    private List<String> students = new ArrayList<>();

    public void addStudent(String name) {
        students.add(name);
    }

    @Override
    public StudentIterator createIterator() {
        return new ForwardIterator(students);
    }

    public StudentIterator createReverseIterator() {
        return new ReverseIterator(students);
    }
}

// Client
public class IteratorDemo {
    public static void main(String[] args) {
        Classroom classroom = new Classroom();
        classroom.addStudent("An");
        classroom.addStudent("Bình");
        classroom.addStudent("Cường");
        classroom.addStudent("Dung");

        System.out.println("Duyệt xuôi:");
        StudentIterator forward = classroom.createIterator();
        while (forward.hasNext()) {
            System.out.println("  " + forward.next());
        }

        System.out.println("Duyệt ngược:");
        StudentIterator reverse = classroom.createReverseIterator();
        while (reverse.hasNext()) {
            System.out.println("  " + reverse.next());
        }
    }
}
```

**Kết quả:**
```
Duyệt xuôi:
  An
  Bình
  Cường
  Dung
Duyệt ngược:
  Dung
  Cường
  Bình
  An
```

:::tip Trong Java thực tế
Java đã tích hợp sẵn interface `java.util.Iterator` và `java.lang.Iterable`. Các collection như `ArrayList`, `LinkedList`, `HashSet`... đều triển khai sẵn Iterator. Vòng lặp `for-each` trong Java chính là ứng dụng của Iterator Pattern.
:::

## Ưu điểm

- Client không cần biết cấu trúc nội bộ của tập hợp.
- Hỗ trợ nhiều cách duyệt khác nhau trên cùng một tập hợp.
- Tuân thủ Single Responsibility: tách logic duyệt ra khỏi tập hợp.

## Nhược điểm

- Với các tập hợp đơn giản, Iterator tạo thêm lớp không cần thiết.
- Kém hiệu quả hơn so với duyệt trực tiếp bằng chỉ số trong một số trường hợp.

## Khi nào dùng

- Khi cần duyệt tập hợp mà không phụ thuộc vào kiểu cụ thể của nó.
- Khi cần nhiều chiến lược duyệt khác nhau (xuôi, ngược, theo điều kiện).
- Khi muốn cung cấp API thống nhất cho các loại tập hợp khác nhau.
