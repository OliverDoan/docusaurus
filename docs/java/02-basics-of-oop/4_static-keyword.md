---
sidebar_position: 4
title: "4. Từ khóa static"
---

# Từ khóa static

Từ khóa `static` đánh dấu một thành viên thuộc về chính lớp chứ không thuộc về từng đối tượng riêng lẻ, nghĩa là nó được chia sẻ chung cho mọi đối tượng. Đây là khái niệm quan trọng nhưng hay gây nhầm lẫn cho người mới, ví dụ điển hình là dùng biến static làm bộ đếm số đối tượng đã tạo. Bài này giới thiệu biến static, phương thức static và khối static.

---

## Mục lục

- [static là gì?](#static-là-gì)
- [Thành viên instance vs static](#thành-viên-instance-vs-static)
- [Biến static](#biến-static)
- [Phương thức static](#phương-thức-static)
- [Khối static (static block)](#khối-static-static-block)
- [Ví dụ thực tế: bộ đếm object](#ví-dụ-thực-tế-bộ-đếm-object)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## static là gì?

**`static`** (tĩnh — thành viên thuộc về CHÍNH class, không thuộc về từng object riêng lẻ)
là một từ khóa quan trọng nhưng hay gây nhầm lẫn cho người mới.

Hãy hình dung một **trường học**:

- Mỗi **học sinh** có tên riêng, điểm riêng → đây là dữ liệu **instance** (của từng object).
- **Tên trường** thì chung cho TẤT CẢ học sinh → đây là dữ liệu **static** (của cả class).

Thành viên `static` được **chia sẻ chung** cho mọi object và tồn tại ngay cả khi chưa tạo
object nào.

---

## Thành viên instance vs static

- **Instance member** (thành viên thể hiện — thuộc về từng object): mỗi object có một bản
  sao riêng. Truy cập qua tên biến object: `myCar.color`.
- **Static member** (thành viên tĩnh — thuộc về class): chỉ có MỘT bản dùng chung. Truy cập
  qua tên class: `Car.totalCars`.

| | Instance (không static) | Static |
|---|---|---|
| Thuộc về | Từng object | Cả class |
| Số bản sao | Mỗi object một bản | Chỉ một bản chung |
| Truy cập qua | `object.thanhVien` | `Class.thanhVien` |
| Cần tạo object trước? | Có | Không |

---

## Biến static

Biến static được khai báo với từ khóa `static`. Tất cả object cùng class chia sẻ chung
một giá trị.

```java
public class Counter {
    static int count = 0; // biến static, dùng chung cho mọi object
    int id;               // biến instance, riêng từng object
}
```

```java
Counter a = new Counter();
Counter b = new Counter();

Counter.count = 5;            // truy cập qua tên class
System.out.println(a.count);  // 5 (vì dùng chung)
System.out.println(b.count);  // 5 (cùng một biến với a)
```

Đổi `count` ở bất kỳ object nào cũng ảnh hưởng tới tất cả, vì chỉ có MỘT biến `count`.

---

## Phương thức static

**Phương thức static** thuộc về class, gọi được mà KHÔNG cần tạo object. Thường dùng cho
các hàm tiện ích (utility) không phụ thuộc dữ liệu của một object cụ thể.

```java
public class MathUtil {
    // Phương thức static: tính bình phương của một số
    static int square(int n) {
        return n * n;
    }
}
```

```java
// Gọi qua tên class, không cần new MathUtil()
int result = MathUtil.square(5); // 25
```

:::warning Quy tắc quan trọng
Phương thức static **KHÔNG truy cập được** trực tiếp các thuộc tính/phương thức instance,
vì lúc đó có thể chưa có object nào tồn tại. Nó chỉ dùng được các thành viên static khác.
Đây cũng là lý do `main` là `static`: JVM gọi nó mà chưa cần tạo object.
:::

---

## Khối static (static block)

**Static block** (khối tĩnh — đoạn code chạy MỘT LẦN khi class được nạp vào bộ nhớ) dùng
để khởi tạo các giá trị static phức tạp.

```java
public class Config {
    static String appName;

    // Khối static: chạy một lần khi class được nạp, trước mọi việc khác
    static {
        appName = "MyApp";
        System.out.println("Đang nạp cấu hình...");
    }
}
```

Khối static chạy trước cả `main`, và chỉ chạy đúng một lần dù bạn tạo bao nhiêu object.

---

## Ví dụ thực tế: bộ đếm object

Đây là ví dụ kinh điển cho biến static — đếm xem đã tạo bao nhiêu object.

```java
public class Student {
    static int totalStudents = 0; // dùng chung: tổng số học sinh đã tạo
    String name;                  // riêng từng object

    public Student(String name) {
        this.name = name;
        totalStudents++; // mỗi lần tạo object mới thì tăng bộ đếm chung
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        new Student("An");
        new Student("Bình");
        new Student("Chi");

        // Truy cập biến static qua tên class
        System.out.println("Tổng số học sinh: " + Student.totalStudents); // 3
    }
}
```

Mỗi object có `name` riêng, nhưng `totalStudents` được tăng chung, nên đếm chính xác số
object đã tạo.

---

## Lỗi thường gặp

1. **Truy cập thành viên instance trong phương thức static**: ví dụ trong `main` (static)
   dùng thẳng `name` (instance) sẽ báo lỗi "non-static variable cannot be referenced from
   a static context". Phải tạo object rồi truy cập `object.name`.
2. **Tưởng mỗi object có biến static riêng**: thực ra chỉ có một bản chung; sửa ở object
   này thì object khác cũng thấy.
3. **Lạm dụng static**: biến static giống "biến toàn cục", dùng nhiều sẽ khó kiểm soát và
   khó kiểm thử. Chỉ dùng khi dữ liệu thực sự cần chia sẻ chung.
4. **Truy cập static qua object**: `a.count` vẫn chạy nhưng gây hiểu lầm; nên viết
   `Counter.count` cho rõ ràng.

---

## Tóm tắt

- **`static`** = thuộc về class, dùng chung cho mọi object; **instance** = riêng từng object.
- **Biến static**: chỉ một bản chung, truy cập qua `Class.bien`.
- **Phương thức static**: gọi không cần object, KHÔNG dùng được thành viên instance trực tiếp.
- **Khối static**: chạy một lần khi class được nạp, để khởi tạo dữ liệu static.
- Ví dụ điển hình: dùng biến static làm **bộ đếm** số object đã tạo.
- Hạn chế lạm dụng static để tránh code khó bảo trì.
