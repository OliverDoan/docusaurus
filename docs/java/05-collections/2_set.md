---
sidebar_position: 2
title: "2. Set"
---

# Set

---

## Mục lục

- [Set là gì?](#set-là-gì)
- [Tạo và dùng Set](#tạo-và-dùng-set)
- [Set không cho phép trùng lặp](#set-không-cho-phép-trùng-lặp)
- [HashSet — nhanh nhưng không có thứ tự](#hashset--nhanh-nhưng-không-có-thứ-tự)
- [LinkedHashSet — giữ thứ tự thêm vào](#linkedhashset--giữ-thứ-tự-thêm-vào)
- [TreeSet — tự sắp xếp](#treeset--tự-sắp-xếp)
- [So sánh ba loại Set](#so-sánh-ba-loại-set)
- [Các thao tác trên tập hợp](#các-thao-tác-trên-tập-hợp)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Set là gì?

**Set** (tập hợp — nhóm các phần tử không trùng nhau) là một cấu trúc dữ liệu giống như khái niệm "tập hợp" trong toán học. Đặc điểm quan trọng nhất: **mỗi giá trị chỉ xuất hiện một lần**.

Hãy tưởng tượng một danh sách email đăng ký nhận tin. Dù một người bấm đăng ký 10 lần, bạn chỉ muốn lưu email của họ **một lần duy nhất**. Đó chính là lúc dùng Set.

So với **List** (danh sách — cho phép trùng và có thứ tự chỉ số), Set khác ở chỗ:

- Không cho phép phần tử trùng lặp.
- Không truy cập theo chỉ số (`get(0)` không tồn tại).

---

## Tạo và dùng Set

`Set` là một interface (giao diện), nên ta tạo nó qua các lớp cụ thể như `HashSet`:

```java
import java.util.HashSet;
import java.util.Set;

// Tạo một Set chứa chuỗi
Set<String> emails = new HashSet<>();

// Thêm phần tử bằng add()
emails.add("an@gmail.com");
emails.add("binh@gmail.com");

// Kiểm tra số lượng
System.out.println(emails.size()); // 2

// Kiểm tra có chứa giá trị không
System.out.println(emails.contains("an@gmail.com")); // true

// Xóa phần tử
emails.remove("binh@gmail.com");

// Duyệt qua toàn bộ Set
for (String email : emails) {
    System.out.println(email);
}
```

---

## Set không cho phép trùng lặp

Đây là tính chất cốt lõi của Set. Khi bạn thêm một giá trị đã tồn tại, Set sẽ **bỏ qua** mà không báo lỗi:

```java
Set<String> ten = new HashSet<>();

ten.add("An");
ten.add("Bình");
ten.add("An"); // bị bỏ qua vì "An" đã có

System.out.println(ten.size()); // in ra 2, không phải 3

// add() trả về true nếu thêm thành công, false nếu đã tồn tại
boolean ketQua = ten.add("An");
System.out.println(ketQua); // false
```

Ứng dụng thực tế: muốn loại bỏ các giá trị trùng trong một danh sách, chỉ cần đổ vào Set:

```java
import java.util.ArrayList;
import java.util.HashSet;

ArrayList<Integer> coTrung = new ArrayList<>();
coTrung.add(1);
coTrung.add(2);
coTrung.add(2);
coTrung.add(3);

// Đổ vào HashSet để loại trùng
HashSet<Integer> khongTrung = new HashSet<>(coTrung);
System.out.println(khongTrung.size()); // 3 (chỉ còn 1, 2, 3)
```

---

## HashSet — nhanh nhưng không có thứ tự

**HashSet** là loại Set phổ biến nhất. Nó dùng kỹ thuật **hash** (băm — biến giá trị thành một con số để định vị nhanh) nên thêm, xóa, tìm kiếm đều **rất nhanh**. Đổi lại, nó **không bảo đảm thứ tự** của các phần tử.

```java
import java.util.HashSet;

HashSet<String> mau = new HashSet<>();
mau.add("Đỏ");
mau.add("Xanh");
mau.add("Vàng");

// Thứ tự khi in ra có thể là: Vàng, Đỏ, Xanh — không đoán trước được
System.out.println(mau);
```

Dùng HashSet khi bạn chỉ quan tâm "phần tử có hay không" và **không quan tâm thứ tự**.

---

## LinkedHashSet — giữ thứ tự thêm vào

**LinkedHashSet** vẫn không cho trùng lặp như HashSet, nhưng nó **ghi nhớ thứ tự bạn thêm phần tử vào**. Khi duyệt, các phần tử hiện ra đúng theo thứ tự đã thêm.

```java
import java.util.LinkedHashSet;

LinkedHashSet<String> mau = new LinkedHashSet<>();
mau.add("Đỏ");
mau.add("Xanh");
mau.add("Vàng");

// Luôn in ra đúng thứ tự: Đỏ, Xanh, Vàng
System.out.println(mau);
```

Dùng LinkedHashSet khi bạn muốn loại trùng **nhưng vẫn giữ thứ tự ban đầu**.

---

## TreeSet — tự sắp xếp

**TreeSet** không cho trùng lặp, và nó **tự động sắp xếp** các phần tử theo thứ tự tăng dần (số từ nhỏ đến lớn, chữ theo bảng chữ cái).

```java
import java.util.TreeSet;

TreeSet<Integer> so = new TreeSet<>();
so.add(5);
so.add(1);
so.add(3);
so.add(2);

// Luôn in ra theo thứ tự tăng dần: 1, 2, 3, 5
System.out.println(so);

// TreeSet có thêm các phương thức tiện lợi nhờ đã sắp xếp
System.out.println(so.first()); // 1 (nhỏ nhất)
System.out.println(so.last());  // 5 (lớn nhất)
```

Dùng TreeSet khi bạn cần các phần tử **luôn ở trạng thái đã sắp xếp**. Đổi lại, nó chậm hơn HashSet một chút.

---

## So sánh ba loại Set

| Đặc điểm | HashSet | LinkedHashSet | TreeSet |
|----------|---------|---------------|---------|
| Cho trùng lặp | Không | Không | Không |
| Thứ tự phần tử | Không xác định | Theo thứ tự thêm | Tăng dần (đã sắp xếp) |
| Tốc độ | Nhanh nhất | Hơi chậm hơn | Chậm nhất |
| Khi nào dùng | Chỉ cần kiểm tra tồn tại | Cần giữ thứ tự thêm | Cần dữ liệu sắp xếp |

---

## Các thao tác trên tập hợp

Set hỗ trợ các phép toán tập hợp giống trong toán học:

```java
import java.util.HashSet;
import java.util.Set;

Set<Integer> a = new HashSet<>();
a.add(1); a.add(2); a.add(3);

Set<Integer> b = new HashSet<>();
b.add(2); b.add(3); b.add(4);

// Phép hợp (union): gộp tất cả phần tử
Set<Integer> hop = new HashSet<>(a);
hop.addAll(b); // {1, 2, 3, 4}

// Phép giao (intersection): chỉ giữ phần tử chung
Set<Integer> giao = new HashSet<>(a);
giao.retainAll(b); // {2, 3}

// Phép hiệu (difference): bỏ đi phần tử có trong b
Set<Integer> hieu = new HashSet<>(a);
hieu.removeAll(b); // {1}
```

---

## Lỗi thường gặp

1. **Mong đợi thứ tự ở HashSet**: HashSet không có thứ tự. Nếu in ra và thấy thứ tự "lạ", đó là bình thường. Cần thứ tự thì dùng LinkedHashSet hoặc TreeSet.

2. **Cố truy cập theo chỉ số**: Set không có `get(0)`. Muốn duyệt thì dùng vòng lặp for-each.

3. **TreeSet với object tự định nghĩa**: TreeSet cần biết cách so sánh các phần tử. Nếu thêm object do bạn tự tạo mà chưa cài đặt `Comparable`, sẽ bị lỗi `ClassCastException`.

4. **Nghĩ rằng thêm trùng sẽ báo lỗi**: thực ra Set chỉ âm thầm bỏ qua, không ném lỗi. `add()` trả về `false` để báo không thêm được.

---

## Tóm tắt

- **Set** là tập hợp **không chứa phần tử trùng lặp** và không truy cập theo chỉ số.
- **HashSet**: nhanh nhất, **không có thứ tự** — dùng khi chỉ cần kiểm tra tồn tại.
- **LinkedHashSet**: giữ **thứ tự thêm vào** — dùng khi cần thứ tự ban đầu.
- **TreeSet**: **tự sắp xếp tăng dần** — dùng khi cần dữ liệu đã sắp xếp.
- Đổ một List vào Set là cách nhanh để **loại bỏ giá trị trùng**.
- Set hỗ trợ các phép `addAll` (hợp), `retainAll` (giao), `removeAll` (hiệu).
