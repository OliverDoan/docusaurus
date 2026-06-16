---
sidebar_position: 3
title: "3. Map"
---

# Map

Map (ánh xạ) lưu dữ liệu dưới dạng các cặp khóa - giá trị (key-value), giống như một quyển từ điển hay danh bạ. Bạn tra cứu giá trị bằng khóa do mình tự chọn, mỗi khóa là duy nhất. Bài này giới thiệu Map cùng HashMap, LinkedHashMap, TreeMap và cách dùng phổ biến; chi tiết nằm bên dưới.

---

## Mục lục

- [Map là gì?](#map-là-gì)
- [Vì sao có Map?](#vì-sao-có-map)
- [Tạo Map và thêm cặp key-value](#tạo-map-và-thêm-cặp-key-value)
- [Lấy giá trị với get](#lấy-giá-trị-với-get)
- [Kiểm tra với containsKey và containsValue](#kiểm-tra-với-containskey-và-containsvalue)
- [Xóa và cập nhật](#xóa-và-cập-nhật)
- [Duyệt Map với entrySet](#duyệt-map-với-entryset)
- [HashMap, LinkedHashMap, TreeMap](#hashmap-linkedhashmap-treemap)
- [Ví dụ thực tế: đếm số lần xuất hiện](#ví-dụ-thực-tế-đếm-số-lần-xuất-hiện)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Map là gì?

**Map** (ánh xạ — bảng tra cứu gồm các cặp khóa-giá trị) lưu dữ liệu dưới dạng cặp **key-value** (khóa - giá trị). Mỗi **key** (khóa) là duy nhất và dùng để tra ra **value** (giá trị) tương ứng.

Hãy tưởng tượng một quyển từ điển: bạn tra "apple" (key) để biết nghĩa "quả táo" (value). Hoặc một danh bạ điện thoại: tra tên người (key) để lấy số điện thoại (value).

Khác với List (truy cập bằng chỉ số 0, 1, 2...) và Set (chỉ có giá trị), Map cho phép bạn tra cứu bằng **bất kỳ khóa nào bạn chọn**.

---

## Vì sao có Map?

**Vấn đề:** Ta thường cần tra ra giá trị theo **một khóa** (userId → User, từ → định nghĩa). Nếu lưu trong `List` rồi duyệt tìm thì mỗi lần tra là O(n) — chậm dần khi dữ liệu lớn — và phải tự quản lý cặp khóa-giá trị.

```java
// Tìm User theo id bằng List: phải duyệt toàn bộ, O(n)
List<User> users = layDanhSachUser();
User found = null;
for (User u : users) {
    if (u.getId() == 1001) { // duyệt từng phần tử
        found = u;
        break;
    }
}
// 1 triệu user => 1 triệu lần so sánh trong trường hợp xấu nhất
```

**Giải pháp:** `Map` lưu trực tiếp cặp **KEY → VALUE**, tra cứu theo khóa cực nhanh:

```java
// Tra User theo id bằng Map: O(1)
Map<Integer, User> usersById = new HashMap<>();
usersById.put(1001, new User(1001, "An"));

User found = usersById.get(1001); // tra thẳng theo khóa, không cần duyệt

// HashMap: tra cứu/thêm O(1) (cần hashCode/equals đúng)
// LinkedHashMap: giữ thứ tự chèn
// TreeMap: tự sắp xếp theo khóa
```

`Map` cho tra cứu nhanh và biểu diễn quan hệ ánh xạ một cách tự nhiên.

:::tip[Dùng thực tế]

- **Cache id → object**: lưu `Map<Integer, User>` để lấy lại đối tượng theo id mà không cần truy vấn lại.
- **Đếm tần suất (word → count)**: đếm số lần mỗi từ xuất hiện trong văn bản.
- **Cấu hình key → value**: lưu các tùy chọn dạng `Map<String, String>` (tên thuộc tính → giá trị).
- **TreeMap**: khi cần dữ liệu luôn được **sắp xếp theo khóa** (ví dụ bảng điểm theo tên, lịch theo ngày).

:::

---

## Tạo Map và thêm cặp key-value

`Map` là một interface, ta thường tạo qua lớp `HashMap`:

```java
import java.util.HashMap;
import java.util.Map;

// Map có key là String (tên), value là Integer (số điện thoại đơn giản hóa)
Map<String, Integer> danhBa = new HashMap<>();

// Thêm cặp key-value bằng put()
danhBa.put("An", 12345);
danhBa.put("Bình", 67890);
danhBa.put("Cường", 11111);

System.out.println(danhBa.size()); // 3
```

Phần `<String, Integer>` nghĩa là: khóa kiểu `String`, giá trị kiểu `Integer`.

Nếu `put` với một key **đã tồn tại**, giá trị cũ sẽ bị **ghi đè**:

```java
danhBa.put("An", 99999); // ghi đè số cũ của "An"
System.out.println(danhBa.get("An")); // 99999
```

---

## Lấy giá trị với get

Dùng `get(key)` để lấy giá trị tương ứng với một khóa:

```java
int soCuaAn = danhBa.get("An");
System.out.println(soCuaAn); // 99999

// Nếu key không tồn tại, get trả về null
System.out.println(danhBa.get("Dũng")); // null

// getOrDefault: trả về giá trị mặc định nếu key không có
int so = danhBa.getOrDefault("Dũng", 0);
System.out.println(so); // 0 (vì "Dũng" không tồn tại)
```

> Mẹo: `getOrDefault` rất hữu ích để tránh giá trị `null` gây lỗi.

---

## Kiểm tra với containsKey và containsValue

```java
// Kiểm tra có khóa này không
System.out.println(danhBa.containsKey("An"));   // true
System.out.println(danhBa.containsKey("Dũng")); // false

// Kiểm tra có giá trị này không
System.out.println(danhBa.containsValue(67890)); // true
```

`containsKey` rất nhanh, còn `containsValue` chậm hơn vì phải duyệt toàn bộ giá trị.

---

## Xóa và cập nhật

```java
// Xóa theo khóa
danhBa.remove("Cường");

// Cập nhật: thực chất là put lại với key cũ
danhBa.put("Bình", 88888);

// Kiểm tra Map có rỗng không
System.out.println(danhBa.isEmpty()); // false

// Xóa toàn bộ
// danhBa.clear();
```

---

## Duyệt Map với entrySet

Để duyệt qua tất cả các cặp key-value, dùng `entrySet()` (tập hợp các cặp). Mỗi cặp gọi là một **entry** (mục):

```java
import java.util.Map;

// Cách 1: duyệt qua các entry (lấy cả key và value) — KHUYÊN DÙNG
for (Map.Entry<String, Integer> entry : danhBa.entrySet()) {
    String ten = entry.getKey();    // lấy khóa
    int so = entry.getValue();      // lấy giá trị
    System.out.println(ten + " -> " + so);
}

// Cách 2: duyệt qua chỉ các khóa
for (String key : danhBa.keySet()) {
    System.out.println(key + " -> " + danhBa.get(key));
}

// Cách 3: duyệt qua chỉ các giá trị
for (int value : danhBa.values()) {
    System.out.println(value);
}
```

Cách 1 (entrySet) hiệu quả nhất vì lấy được cả key và value trong một lần duyệt.

---

## HashMap, LinkedHashMap, TreeMap

Giống như Set, Map cũng có ba biến thể tùy theo thứ tự:

```java
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.TreeMap;
import java.util.Map;

// HashMap: nhanh nhất, KHÔNG bảo đảm thứ tự khóa
Map<String, Integer> a = new HashMap<>();

// LinkedHashMap: giữ đúng thứ tự bạn thêm vào
Map<String, Integer> b = new LinkedHashMap<>();

// TreeMap: tự sắp xếp khóa theo thứ tự tăng dần
Map<String, Integer> c = new TreeMap<>();
c.put("Cường", 1);
c.put("An", 2);
c.put("Bình", 3);
// Khi duyệt, khóa luôn theo thứ tự: An, Bình, Cường
System.out.println(c);
```

| Loại | Thứ tự khóa | Tốc độ | Khi nào dùng |
|------|-------------|--------|--------------|
| HashMap | Không xác định | Nhanh nhất | Tra cứu thông thường |
| LinkedHashMap | Theo thứ tự thêm | Hơi chậm hơn | Cần giữ thứ tự thêm |
| TreeMap | Tăng dần | Chậm nhất | Cần khóa được sắp xếp |

---

## Ví dụ thực tế: đếm số lần xuất hiện

Map cực kỳ hữu ích để đếm. Ví dụ đếm số lần mỗi từ xuất hiện trong câu:

```java
import java.util.HashMap;
import java.util.Map;

String cau = "mèo chó mèo cá mèo chó";
String[] tu = cau.split(" "); // tách câu thành mảng các từ

Map<String, Integer> demTu = new HashMap<>();

for (String t : tu) {
    // Nếu chưa có thì mặc định 0, rồi cộng thêm 1
    demTu.put(t, demTu.getOrDefault(t, 0) + 1);
}

System.out.println(demTu); // {mèo=3, chó=2, cá=1}
```

Đây là một trong những ứng dụng phổ biến nhất của Map mà bạn sẽ gặp rất nhiều.

---

## Lỗi thường gặp

1. **Quên kiểm tra null khi get**: `get(key)` trả về `null` nếu khóa không tồn tại. Nếu gán vào kiểu nguyên thủy như `int x = map.get("xyz")` mà khóa không có, sẽ bị lỗi `NullPointerException`. Hãy dùng `getOrDefault` hoặc kiểm tra `containsKey` trước.

2. **Mong đợi thứ tự ở HashMap**: HashMap không có thứ tự cố định. Cần thứ tự thì dùng LinkedHashMap hoặc TreeMap.

3. **Dùng key trùng**: nếu `put` hai lần cùng một khóa, giá trị sau ghi đè giá trị trước — không tạo hai mục.

4. **Nhầm keySet và values**: `keySet()` cho các khóa, `values()` cho các giá trị, `entrySet()` cho cả cặp. Đừng nhầm lẫn.

---

## Tóm tắt

- **Map** lưu dữ liệu dạng cặp **key-value**, mỗi khóa là duy nhất.
- `put(key, value)` thêm hoặc ghi đè; `get(key)` lấy giá trị; `getOrDefault` an toàn hơn.
- `containsKey`, `containsValue` để kiểm tra; `remove(key)` để xóa.
- Duyệt Map tốt nhất bằng `entrySet()` để lấy cả key và value.
- **HashMap** (nhanh, không thứ tự), **LinkedHashMap** (giữ thứ tự thêm), **TreeMap** (sắp xếp khóa).
- Map rất hữu ích cho bài toán **đếm số lần xuất hiện** và **tra cứu nhanh**.
