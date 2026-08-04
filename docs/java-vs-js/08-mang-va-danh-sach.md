---
sidebar_position: 8
title: "8. Mảng & danh sách"
---

# 8. Mảng & danh sách (Arrays & Lists)

:::note[Ghi nhớ nhanh]

- **Mảng Java (`int[]`) có kích thước cố định** — không `push`/`pop` được. Đây là khác biệt lớn nhất so với array JS.
- Muốn "co giãn" như array JS, dùng **`ArrayList`** (danh sách động).
- Mảng Java chỉ chứa **một kiểu** đã khai báo (`int[]` chỉ chứa `int`), không trộn kiểu như JS.
- Các method quen thuộc (`map`, `filter`, `reduce`) nằm trong **Stream API**, không gắn trực tiếp vào list.
- Độ dài: `arr.length` (mảng, thuộc tính) vs `list.size()` (ArrayList, method).

:::

---

## Mảng cố định vs mảng động

Array trong JS làm được mọi thứ: thêm, xóa, trộn kiểu. Java tách thành hai công cụ:

<table>
<tr><th>JavaScript</th><th>Java — mảng cố định</th></tr>
<tr>
<td>

```javascript
const nums = [1, 2, 3];
nums.push(4);      // được
nums.length;       // 4
nums[0];           // 1
```

</td>
<td>

```java
int[] nums = {1, 2, 3};
// nums.push(4);   ❌ không có
nums.length;       // 3 (thuộc tính, cố định)
nums[0];           // 1
```

</td>
</tr>
</table>

Mảng Java được cấp phát cố định lúc tạo:

```java
int[] arr = new int[5];   // 5 phần tử, mặc định toàn số 0
arr[0] = 10;
```

---

## ArrayList — "array" thực thụ cho dân JS

Khi bạn cần thêm/xóa phần tử linh hoạt như JS, dùng `ArrayList`:

<table>
<tr><th>JavaScript array</th><th>Java ArrayList</th></tr>
<tr>
<td>

```javascript
const list = [];
list.push("a");
list.push("b");
list.length;      // 2
list[0];          // "a"
list.splice(0, 1); // xóa phần tử 0
```

</td>
<td>

```java
List<String> list = new ArrayList<>();
list.add("a");
list.add("b");
list.size();      // 2
list.get(0);      // "a"
list.remove(0);   // xóa phần tử 0
```

</td>
</tr>
</table>

> `List<String>` nghĩa là "danh sách chứa các `String`". Phần `<String>` gọi là **generic** (kiểu tổng quát — quy định danh sách chỉ chứa kiểu nào). Nhờ vậy Java bắt lỗi ngay nếu bạn thêm nhầm kiểu.

---

## Bảng ánh xạ method

| Việc cần làm | JavaScript | Java (`List`) |
|---|---|---|
| Thêm cuối | `push(x)` | `add(x)` |
| Xóa theo index | `splice(i, 1)` | `remove(i)` |
| Lấy phần tử | `arr[i]` | `get(i)` |
| Số phần tử | `arr.length` | `list.size()` |
| Có chứa? | `includes(x)` | `contains(x)` |
| Tìm vị trí | `indexOf(x)` | `indexOf(x)` |
| Duyệt | `forEach(...)` | `forEach(...)` |

---

## map / filter / reduce → Stream API

Bên JS các hàm này gắn thẳng vào mảng. Bên Java, bạn "mở luồng" bằng `.stream()` trước:

<table>
<tr><th>JavaScript</th><th>Java Stream</th></tr>
<tr>
<td>

```javascript
const result = nums
  .filter(n => n > 1)
  .map(n => n * 2)
  .reduce((a, b) => a + b, 0);
```

</td>
<td>

```java
int result = nums.stream()
    .filter(n -> n > 1)
    .map(n -> n * 2)
    .reduce(0, Integer::sum);
```

</td>
</tr>
</table>

Ý tưởng y hệt JS — chỉ khác: phải gọi `.stream()` để bắt đầu và thường kết thúc bằng `.toList()` / `.reduce()` để "gom" kết quả lại.

---

## Các loại "list" khác

Ngoài `ArrayList`, Java còn nhiều cấu trúc mà JS gộp chung vào object/array:

| Java | Tương đương JS | Dùng khi |
|---|---|---|
| `ArrayList` | `Array` | Danh sách có thứ tự |
| `HashMap` | `Object` / `Map` | Cặp key-value |
| `HashSet` | `Set` | Tập hợp không trùng |
