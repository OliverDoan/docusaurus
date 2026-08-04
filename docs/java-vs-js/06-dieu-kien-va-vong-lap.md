---
sidebar_position: 6
title: "6. Điều kiện & vòng lặp"
---

# 6. Điều kiện & vòng lặp (Control Flow & Loops)

:::note[Ghi nhớ nhanh]

- `if / else if / else`, `for`, `while`, `do...while` **cú pháp gần như y hệt JS**.
- Điều kiện **bắt buộc là `boolean`** — không có truthy/falsy (xem [bài 3](./03-ep-kieu.md)).
- `for...of` (JS) ≈ **enhanced for** `for (int x : arr)` (Java).
- `switch` của Java mạnh hơn với **switch expression** (Java 14+) trả về giá trị, không cần `break`.
- JS có `for...in` duyệt key; Java không có tương đương trực tiếp cho object.

:::

---

## if / else

Giống hệt nhau, chỉ khác: điều kiện phải là `boolean`.

<table>
<tr><th>JavaScript</th><th>Java</th></tr>
<tr>
<td>

```javascript
if (age >= 18) {
  console.log("Người lớn");
} else if (age >= 13) {
  console.log("Thiếu niên");
} else {
  console.log("Trẻ em");
}
```

</td>
<td>

```java
if (age >= 18) {
    System.out.println("Người lớn");
} else if (age >= 13) {
    System.out.println("Thiếu niên");
} else {
    System.out.println("Trẻ em");
}
```

</td>
</tr>
</table>

Khác biệt duy nhất về "in ra màn hình": `console.log(...)` → `System.out.println(...)`.

---

## Vòng lặp `for` cổ điển

```java
// Giống hệt JS, chỉ cần khai báo kiểu cho i
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}
```

---

## Duyệt mảng: `for...of` vs enhanced for

<table>
<tr><th>JavaScript</th><th>Java</th></tr>
<tr>
<td>

```javascript
const nums = [1, 2, 3];
for (const n of nums) {
  console.log(n);
}
nums.forEach(n => console.log(n));
```

</td>
<td>

```java
int[] nums = {1, 2, 3};
for (int n : nums) {   // "for each"
    System.out.println(n);
}
```

</td>
</tr>
</table>

Cú pháp `for (int n : nums)` đọc là "với mỗi `n` trong `nums`" — tương đương `for...of`.

---

## while & do...while

Giống hệt JS:

```java
int i = 0;
while (i < 5) {
    i++;
}

do {
    i--;
} while (i > 0);
```

---

## switch — Java mạnh hơn

`switch` truyền thống giống JS (cần `break` tránh "rơi" xuống case dưới):

```java
switch (day) {
    case 1:
        name = "Thứ Hai";
        break;
    default:
        name = "Không rõ";
}
```

Nhưng Java 14+ có **switch expression** — gọn hơn, trả về giá trị, không cần `break`:

```java
String name = switch (day) {
    case 1, 2, 3, 4, 5 -> "Ngày làm việc";
    case 6, 7 -> "Cuối tuần";
    default -> "Không rõ";
};
```

> JS hiện chưa có switch expression trả giá trị như vậy — đây là điểm Java tiện hơn.

---

## `for...in` không có tương đương

JS dùng `for...in` để duyệt key của object. Java **không** có cú pháp này cho object thông thường (vì object Java là class có field cố định). Khi duyệt `Map` (tương đương object dạng key-value), ta làm:

```java
for (String key : map.keySet()) {
    System.out.println(key + " = " + map.get(key));
}
```
