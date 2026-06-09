---
sidebar_position: 8
title: "8. Record"
---

# Record

Record (có từ Java 16) là cách viết ngắn gọn cho những lớp chỉ dùng để chứa dữ liệu bất biến. Chỉ cần một dòng khai báo, Java tự sinh ra constructor, accessor, `equals`, `hashCode` và `toString`, giúp bạn khỏi viết hàng chục dòng lặp đi lặp lại. Bài này giới thiệu cú pháp record, tính bất biến, compact constructor và khi nào nên dùng; phần chi tiết nằm bên dưới.

---

## Mục lục

- [Record là gì?](#record-là-gì)
- [Cú pháp khai báo record](#cú-pháp-khai-báo-record)
- [Record tự sinh những gì?](#record-tự-sinh-những-gì)
- [Tính bất biến của record](#tính-bất-biến-của-record)
- [So sánh record với class thường](#so-sánh-record-với-class-thường)
- [Thêm validation và phương thức cho record](#thêm-validation-và-phương-thức-cho-record)
- [Khi nào nên dùng record?](#khi-nào-nên-dùng-record)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Record là gì?

**Record** (kiểu lớp chứa dữ liệu bất biến, có từ Java 16) là cách viết ngắn gọn cho những lớp chỉ dùng để **chứa dữ liệu** (data carrier). Thay vì viết hàng chục dòng cho một lớp đơn giản, record gói gọn trong một dòng.

Ví dụ đời thường: một tấm danh thiếp ghi tên và số điện thoại. Nó chỉ chứa thông tin, không có hành vi phức tạp. Record sinh ra cho đúng những trường hợp như vậy.

---

## Cú pháp khai báo record

Dùng từ khóa `record`, liệt kê các trường dữ liệu trong dấu ngoặc (gọi là **components** — thành phần).

```java
// Một dòng duy nhất! Tự động có constructor, getter, equals, toString...
public record DiemSo(String monHoc, double diem) {
}
```

So với class thường tương đương:

```java
// Class thường: phải viết RẤT NHIỀU code
public class DiemSoCu {
    private final String monHoc;
    private final double diem;

    public DiemSoCu(String monHoc, double diem) {
        this.monHoc = monHoc;
        this.diem = diem;
    }

    public String monHoc() { return monHoc; }
    public double diem() { return diem; }

    // ... còn phải tự viết equals(), hashCode(), toString() nữa
}
```

Record làm tất cả những việc đó tự động.

---

## Record tự sinh những gì?

Khi khai báo một record, Java **tự động sinh** ra:

1. **Constructor** nhận đủ các thành phần (gọi là canonical constructor).
2. **Phương thức truy cập** (accessor) cho mỗi thành phần — tên trùng tên thành phần (ví dụ `monHoc()`, không phải `getMonHoc()`).
3. **equals()** — so sánh hai record dựa trên giá trị các thành phần.
4. **hashCode()** — mã băm phù hợp với equals.
5. **toString()** — chuỗi mô tả dễ đọc.

```java
public record DiemSo(String monHoc, double diem) {}

public class Main {
    public static void main(String[] args) {
        DiemSo d1 = new DiemSo("Toan", 9.5);

        // Accessor: dùng tên thành phần (KHÔNG có "get")
        System.out.println(d1.monHoc()); // Toan
        System.out.println(d1.diem());   // 9.5

        // toString() tự sinh, rất gọn
        System.out.println(d1); // DiemSo[monHoc=Toan, diem=9.5]

        // equals() so sánh theo GIÁ TRỊ
        DiemSo d2 = new DiemSo("Toan", 9.5);
        System.out.println(d1.equals(d2)); // true (cùng giá trị)
    }
}
```

---

## Tính bất biến của record

Record là **bất biến** (immutable — không thể thay đổi sau khi tạo). Các thành phần ngầm là `final`, không có setter.

```java
public record DiemSo(String monHoc, double diem) {}

public class Main {
    public static void main(String[] args) {
        DiemSo d = new DiemSo("Toan", 9.5);

        // LỖI: không thể thay đổi thành phần của record
        // d.diem = 10; // SAI! record bất biến

        // Muốn "thay đổi" -> tạo record MỚI
        DiemSo dMoi = new DiemSo(d.monHoc(), 10.0);
        System.out.println(dMoi); // DiemSo[monHoc=Toan, diem=10.0]
    }
}
```

Tính bất biến giúp code an toàn hơn: một khi tạo ra, dữ liệu không bị sửa lén ở nơi khác.

---

## So sánh record với class thường

| Đặc điểm | Record | Class thường |
|----------|--------|--------------|
| Số dòng code | Rất ít | Nhiều |
| Tính bất biến | Mặc định bất biến | Phải tự làm |
| equals/hashCode/toString | Tự sinh | Phải tự viết |
| Setter | Không có | Có thể có |
| Kế thừa lớp khác | Không (record không extends) | Có thể |
| Mục đích chính | Chứa dữ liệu | Đa năng (dữ liệu + hành vi) |

Record không thay thế class thường — nó chỉ tối ưu cho trường hợp "lớp chứa dữ liệu bất biến".

---

## Thêm validation và phương thức cho record

Record không chỉ trống rỗng — bạn có thể thêm kiểm tra hợp lệ và phương thức.

```java
public record DiemSo(String monHoc, double diem) {

    // Compact constructor: kiểm tra hợp lệ khi tạo
    public DiemSo {
        if (diem < 0 || diem > 10) {
            throw new IllegalArgumentException("Diem phai tu 0 den 10");
        }
        // Không cần gán this.diem = diem; record tự làm
    }

    // Thêm phương thức tùy ý
    public boolean dau() {
        return diem >= 5.0;
    }
}

public class Main {
    public static void main(String[] args) {
        DiemSo d = new DiemSo("Toan", 9.5);
        System.out.println("Dau? " + d.dau()); // Dau? true

        // DiemSo sai = new DiemSo("Toan", 15); // Ném lỗi: Diem phai tu 0 den 10
    }
}
```

**Compact constructor** (constructor rút gọn) chỉ ghi phần kiểm tra, không cần liệt kê tham số hay gán giá trị.

---

## Khi nào nên dùng record?

Dùng record khi:

- Lớp chỉ để **chứa dữ liệu** (như đối tượng truyền dữ liệu giữa các tầng — DTO).
- Bạn muốn dữ liệu **bất biến**.
- Bạn cần `equals`/`hashCode` so sánh theo giá trị.

Không nên dùng record khi:

- Lớp cần thay đổi trạng thái sau khi tạo.
- Lớp cần kế thừa từ lớp khác.
- Lớp chủ yếu chứa hành vi phức tạp thay vì dữ liệu.

---

## Lỗi thường gặp

- **Gọi accessor với "get"**: record dùng `diem()` chứ không phải `getDiem()`.
- **Cố thay đổi giá trị record**: record bất biến, không có setter.
- **Tưởng record extends được lớp khác**: record không thể kế thừa lớp (nhưng có thể implements interface).
- **Quên record cần Java 16+**: trên Java cũ hơn sẽ không biên dịch được.
- **Gán lại `this.diem` trong compact constructor**: không cần và dễ gây nhầm.

---

## Tóm tắt

- **Record** (Java 16+) là cách ngắn gọn để tạo lớp chứa dữ liệu **bất biến**.
- Tự sinh constructor, accessor, `equals`, `hashCode`, `toString`.
- Accessor dùng tên thành phần (`diem()`), không có tiền tố `get`.
- Bất biến: muốn đổi giá trị phải tạo record mới.
- Có thể thêm **compact constructor** để validate và thêm phương thức tùy ý.
- Dùng cho DTO và dữ liệu bất biến; không dùng khi cần thay đổi trạng thái hay kế thừa lớp.
