---
sidebar_position: 6
title: "6. Bộ nhớ & Từ khóa quan trọng"
---

# Bộ nhớ & Từ khóa quan trọng

> Hiểu cách Java quản lý bộ nhớ (memory) và phân biệt các từ khóa dễ nhầm là cách nhanh nhất để chứng minh bạn **hiểu bản chất** chứ không học vẹt. Đây là nhóm câu interviewer rất hay dùng để "đào sâu".

---

## Câu 1: Heap và Stack khác nhau thế nào? Vùng nhớ nào lưu gì? `[Intermediate]`

### Câu hỏi

Trong JVM (Java Virtual Machine — máy ảo Java), bộ nhớ được chia thành những vùng nào? Heap và Stack lưu trữ những gì và khác nhau ra sao?

### Giải thích lý thuyết

JVM chia bộ nhớ thành nhiều vùng, hai vùng quan trọng nhất với người mới là **Stack** (ngăn xếp) và **Heap** (vùng nhớ động):

- **Stack**: lưu thông tin của từng lời gọi phương thức (method call), gồm các **biến cục bộ** (local variable) kiểu nguyên thủy (primitive: `int`, `boolean`...) và **tham chiếu** (reference) tới object. Mỗi luồng (thread) có Stack riêng. Cấp phát/thu hồi theo cơ chế LIFO (vào sau ra trước), rất nhanh.
- **Heap**: lưu **object** (đối tượng) và mảng (array) thực sự — phần được tạo bằng `new`. Heap dùng chung cho mọi thread và do **Garbage Collector** (bộ thu gom rác) dọn dẹp.

| Tiêu chí | Stack | Heap |
|---|---|---|
| Lưu gì | Biến cục bộ, tham chiếu, primitive | Object, mảng (tạo bằng `new`) |
| Phạm vi | Riêng từng thread | Dùng chung mọi thread |
| Tốc độ | Rất nhanh (LIFO) | Chậm hơn |
| Giải phóng | Tự động khi method kết thúc | Do Garbage Collector dọn |
| Lỗi khi đầy | `StackOverflowError` | `OutOfMemoryError` |

### Code minh hoạ

```java
public class MemoryDemo {
    public static void main(String[] args) {
        int age = 20;                 // 'age' (primitive) nằm trên Stack
        String name = new String("An"); // tham chiếu 'name' ở Stack,
                                         // object String thực sự ở Heap
        Dog d = new Dog();            // tham chiếu 'd' ở Stack,
                                      // object Dog ở Heap
        d.bark();                     // tạo frame mới trên Stack cho bark()
    }
}

class Dog {
    void bark() {                     // khi gọi, frame của bark() đẩy vào Stack
        System.out.println("Gâu gâu"); // kết thúc method -> frame bị pop ra
    }
}
```

### Đáp án mẫu

> "Stack lưu biến cục bộ và tham chiếu, cấp phát theo từng lời gọi method và tự giải phóng khi method kết thúc, mỗi thread một Stack riêng. Heap lưu các object tạo bằng `new`, dùng chung cho mọi thread và do Garbage Collector dọn. Ví dụ `Dog d = new Dog()` thì biến `d` nằm ở Stack còn object `Dog` nằm ở Heap. Stack đầy thì `StackOverflowError`, Heap đầy thì `OutOfMemoryError`."

---

## Câu 2: Garbage Collection là gì? Lập trình viên có cần tự giải phóng bộ nhớ không? `[Basic]`

### Câu hỏi

Garbage Collection (GC — bộ thu gom rác) trong Java hoạt động ra sao? Lập trình viên có phải tự tay giải phóng bộ nhớ như trong C/C++ không?

### Giải thích lý thuyết

**Garbage Collection** là cơ chế **tự động** của JVM dùng để dọn dẹp các object trong Heap **không còn được tham chiếu** tới nữa, giải phóng bộ nhớ cho chương trình.

- Trong C/C++, lập trình viên phải tự gọi `free()`/`delete`. Quên là **memory leak** (rò rỉ bộ nhớ).
- Trong Java, **không cần** tự giải phóng — GC tự làm. Một object đủ điều kiện bị thu gom khi **không còn biến nào trỏ tới nó**.
- Có thể *gợi ý* GC chạy bằng `System.gc()` nhưng đây chỉ là **đề nghị**, JVM không bắt buộc chạy ngay.

### Code minh hoạ

```java
public class GcDemo {
    public static void main(String[] args) {
        String s = new String("xin chào"); // object 1 được tạo
        s = new String("tạm biệt");          // s trỏ sang object 2;
                                             // object 1 không còn ai trỏ tới
                                             // -> đủ điều kiện cho GC dọn

        Object o = new Object();
        o = null;                            // cắt tham chiếu thủ công
                                             // -> object đủ điều kiện bị thu gom

        // System.gc(); // chỉ GỢI Ý GC chạy, không bắt buộc
    }
}
```

### Đáp án mẫu

> "Garbage Collection là cơ chế tự động của JVM, chuyên dọn các object trong Heap không còn ai tham chiếu tới để giải phóng bộ nhớ. Khác với C/C++ phải tự gọi `free`, Java không cần tự giải phóng — đó là một ưu điểm lớn giúp tránh nhiều lỗi bộ nhớ. Mình có thể gán `null` để cắt tham chiếu sớm hoặc gọi `System.gc()` để gợi ý, nhưng việc chạy lúc nào là do JVM quyết định."

---

## Câu 3: Java truyền tham số theo "pass by value" hay "pass by reference"? `[Intermediate]`

### Câu hỏi

Khi truyền tham số vào method, Java dùng cơ chế **pass by value** (truyền theo giá trị) hay **pass by reference** (truyền theo tham chiếu)? Đây là câu rất hay gây tranh cãi.

### Giải thích lý thuyết

Java **luôn luôn là pass by value** — kể cả với object. Điểm gây nhầm lẫn là *giá trị được truyền là gì*:

- Với **primitive**: truyền một **bản sao của giá trị**. Sửa trong method không ảnh hưởng biến gốc.
- Với **object**: truyền một **bản sao của tham chiếu** (địa chỉ trỏ tới object). Vì cả hai tham chiếu cùng trỏ tới **một object**, nên *thay đổi nội dung object* (gọi setter) sẽ thấy ở ngoài. Nhưng nếu gán tham chiếu sang object mới bên trong method thì **không** ảnh hưởng biến gốc — chứng minh nó là pass by value.

### Code minh hoạ

```java
class Box { int value; }

public class PassByValueDemo {
    static void changePrimitive(int x) {
        x = 100;                 // chỉ sửa bản sao -> ngoài không đổi
    }

    static void changeContent(Box b) {
        b.value = 100;           // sửa nội dung object -> NGOÀI THẤY
    }

    static void reassign(Box b) {
        b = new Box();           // gán tham chiếu sang object mới
        b.value = 999;           // chỉ ảnh hưởng bản sao tham chiếu
    }

    public static void main(String[] args) {
        int n = 5;
        changePrimitive(n);
        System.out.println(n);   // 5 (không đổi)

        Box box = new Box();
        changeContent(box);
        System.out.println(box.value); // 100 (đã đổi nội dung)

        reassign(box);
        System.out.println(box.value); // vẫn 100 (reassign không ảnh hưởng)
    }
}
```

### Đáp án mẫu

> "Java luôn là pass by value. Với primitive thì truyền bản sao giá trị nên sửa không ảnh hưởng biến gốc. Với object thì truyền bản sao của *tham chiếu* — cả hai cùng trỏ tới một object, nên nếu mình sửa nội dung object thì bên ngoài thấy được, nhưng nếu gán tham chiếu sang object mới trong method thì biến gốc không đổi. Chính điểm cuối này chứng minh Java là pass by value chứ không phải pass by reference."

---

## Câu 4: Biến `static` nằm ở vùng nhớ nào? Khác biến instance ra sao? `[Intermediate]`

### Câu hỏi

Từ khóa `static` lưu biến ở vùng nhớ nào? Về mặt bộ nhớ, biến `static` khác biến instance (biến thực thể) thế nào?

### Giải thích lý thuyết

- **Biến instance**: thuộc về **từng object**, lưu trong **Heap** cùng object đó. Mỗi `new` tạo một bản riêng.
- **Biến static**: thuộc về **class** (lớp), **chỉ tồn tại một bản duy nhất** dùng chung cho mọi object. Được nạp khi class được load. Trong các JVM hiện đại (từ Java 8), biến static nằm ở **Heap** (gắn với object `Class`), còn metadata của class nằm ở vùng **Metaspace** — không còn dùng PermGen như trước.

Điểm cốt lõi cần nói: **static = một bản dùng chung cho cả class**, **instance = mỗi object một bản**.

### Code minh hoạ

```java
class Counter {
    static int total = 0;   // 1 bản duy nhất, dùng chung mọi object
    int id;                 // mỗi object có 'id' riêng (nằm trong Heap)

    Counter() {
        total++;            // tăng biến chung mỗi lần tạo object
        id = total;         // gán id riêng cho object này
    }
}

public class StaticDemo {
    public static void main(String[] args) {
        Counter a = new Counter();
        Counter b = new Counter();
        System.out.println(a.id);       // 1 (riêng)
        System.out.println(b.id);       // 2 (riêng)
        System.out.println(Counter.total); // 2 (chung) — truy cập qua tên class
    }
}
```

### Đáp án mẫu

> "Biến instance thuộc về từng object và nằm trong Heap cùng object đó, mỗi `new` tạo một bản. Biến static thuộc về class, chỉ có một bản duy nhất dùng chung cho mọi object và được tạo khi class được nạp. Từ Java 8, biến static nằm trên Heap còn metadata của class ở Metaspace. Ví dụ một biến đếm số object được tạo thì để static là hợp lý vì cần dùng chung."

---

## Câu 5: Phân biệt `final`, `finally` và `finalize`? `[Basic]`

### Câu hỏi

Ba từ khóa/khái niệm `final`, `finally`, `finalize` rất dễ nhầm vì tên giống nhau. Em hãy phân biệt từng cái.

### Giải thích lý thuyết

Chúng hoàn toàn khác nhau dù tên gần giống:

- **`final`** — *từ khóa* (modifier). Đánh dấu "không thể thay đổi":
  - Biến `final`: gán một lần, không gán lại (hằng số).
  - Method `final`: không thể bị ghi đè (override).
  - Class `final`: không thể bị kế thừa (như `String`).
- **`finally`** — *khối lệnh* trong xử lý ngoại lệ (exception). Code trong `finally` **luôn chạy** dù có lỗi hay không — thường dùng để dọn tài nguyên (đóng file, connection).
- **`finalize()`** — *phương thức* của lớp `Object`, từng được GC gọi trước khi thu gom object. **Đã lỗi thời (deprecated)** từ Java 9 và **không nên dùng** vì không đảm bảo chạy; thay bằng `try-with-resources`.

### Code minh hoạ

```java
public class FinalDemo {
    static final double PI = 3.14159; // final: hằng số, không gán lại

    public static void main(String[] args) {
        try {
            int x = 10 / 0;           // ném ArithmeticException
        } catch (ArithmeticException e) {
            System.out.println("Có lỗi: chia cho 0");
        } finally {
            System.out.println("finally LUÔN chạy"); // dọn dẹp
        }
        // PI = 3.14; // LỖI biên dịch: không gán lại biến final
    }
}
// finalize(): phương thức cũ của Object, đã deprecated — KHÔNG nên dùng
```

### Đáp án mẫu

> "Ba cái này khác hẳn nhau. `final` là từ khóa khóa giá trị/method/class: biến final không gán lại, method final không override được, class final không kế thừa được. `finally` là khối lệnh trong try-catch, luôn chạy dù có lỗi hay không, dùng để dọn tài nguyên. Còn `finalize()` là method của Object từng được GC gọi trước khi dọn object, nhưng đã deprecated từ Java 9 và không nên dùng, thay bằng try-with-resources."

---

## Câu 6: Memory leak trong Java có xảy ra không? Cho ví dụ? `[Intermediate]`

### Câu hỏi

Java đã có Garbage Collection tự động, vậy memory leak (rò rỉ bộ nhớ) còn xảy ra được không? Nếu có thì khi nào?

### Giải thích lý thuyết

**Có**, memory leak vẫn xảy ra trong Java. GC chỉ dọn object **không còn ai tham chiếu**. Nếu chương trình **vô tình giữ tham chiếu** tới object không còn dùng, GC sẽ không dọn được → bộ nhớ cứ tăng dần → cuối cùng `OutOfMemoryError`.

Các nguyên nhân thường gặp:

- **Collection tăng mãi không xóa**: thêm vào `List`/`Map` (đặc biệt static) mà không bao giờ remove.
- **Static field giữ object**: biến static sống suốt vòng đời ứng dụng nên giữ luôn object nó trỏ tới.
- **Listener/callback không gỡ đăng ký** sau khi dùng xong.
- **Không đóng tài nguyên**: stream, connection không close.

### Code minh hoạ

```java
import java.util.ArrayList;
import java.util.List;

public class LeakDemo {
    // static List sống suốt đời chương trình -> object thêm vào KHÔNG được dọn
    static final List<byte[]> cache = new ArrayList<>();

    public static void main(String[] args) {
        while (true) {
            cache.add(new byte[1024 * 1024]); // liên tục thêm, không bao giờ xóa
            // GC không dọn được vì 'cache' vẫn giữ tham chiếu
            // -> sớm muộn sẽ OutOfMemoryError
        }
    }
}
// CÁCH SỬA: xóa phần tử không dùng (cache.remove/clear),
// hoặc dùng WeakHashMap, hoặc giới hạn kích thước cache.
```

### Đáp án mẫu

> "Có, Java vẫn bị memory leak. GC chỉ dọn object không còn ai tham chiếu, nên nếu mình vô tình giữ tham chiếu tới object không dùng nữa thì GC không dọn được. Hay gặp nhất là thêm object vào một collection static mà không bao giờ xóa, listener không gỡ đăng ký, hay không đóng stream/connection. Cách phòng tránh là chủ động remove khỏi collection, dùng try-with-resources để đóng tài nguyên, và cân nhắc WeakHashMap khi làm cache."

---

## Câu 7: Wrapper class là gì? Autoboxing và unboxing hoạt động ra sao? `[Basic]`

### Câu hỏi

Wrapper class (lớp bao) như `Integer`, `Double`, `Boolean` dùng để làm gì? Autoboxing và unboxing là gì?

### Giải thích lý thuyết

Mỗi kiểu **primitive** có một **wrapper class** tương ứng — biến primitive thành object:

| Primitive | Wrapper |
|---|---|
| `int` | `Integer` |
| `double` | `Double` |
| `boolean` | `Boolean` |
| `char` | `Character` |
| `long` | `Long` |

Lý do cần wrapper: **Collections** (`List`, `Map`...) và Generics **chỉ chứa được object**, không chứa primitive trực tiếp. Wrapper cũng cung cấp tiện ích như `Integer.parseInt()`.

- **Autoboxing**: tự động chuyển primitive → wrapper (ví dụ `int` → `Integer`).
- **Unboxing**: tự động chuyển ngược wrapper → primitive.

Lưu ý cho intern: wrapper có thể `null`, nên unboxing một wrapper `null` sẽ ném `NullPointerException`.

### Code minh hoạ

```java
import java.util.ArrayList;
import java.util.List;

public class WrapperDemo {
    public static void main(String[] args) {
        int a = 10;
        Integer obj = a;        // AUTOBOXING: int -> Integer (tự động)
        int b = obj;            // UNBOXING:   Integer -> int (tự động)

        List<Integer> list = new ArrayList<>();
        list.add(5);            // autoboxing: 5 (int) -> Integer để bỏ vào List
        int x = list.get(0);    // unboxing: Integer -> int

        int n = Integer.parseInt("123"); // tiện ích chuyển String -> int

        Integer maybeNull = null;
        // int y = maybeNull;   // CẨN THẬN: unboxing null -> NullPointerException
    }
}
```

### Đáp án mẫu

> "Wrapper class là lớp bao bọc kiểu primitive thành object, ví dụ `int` có `Integer`, `double` có `Double`. Cần chúng vì Collections và Generics chỉ chứa được object chứ không chứa primitive trực tiếp. Autoboxing là Java tự chuyển primitive sang wrapper, còn unboxing là chuyển ngược lại — cả hai đều tự động. Một lưu ý là wrapper có thể null, nên unboxing một giá trị null sẽ gây NullPointerException."
