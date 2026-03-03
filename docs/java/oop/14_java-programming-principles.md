# Một số nguyên tắc, định luật trong lập trình


## MỤC LỤC
1. Law of Demeter (LoD)
2. Định luật Brook
3. Định luật Conway
4. Nguyên tắc bất ngờ nhỏ nhất
5. Nguyên tắc Boy Scout
6. Nguyên tắc YAGNI
7. Nguyên tắc DRY
8. Nguyên tắc KISS
9. Nguyên tắc SOLID

## 1. Law of Demeter (LoD)
Nguyên tắc “một dấu chấm”: object chỉ nên biết tối thiểu về object khác.

Ví dụ vi phạm:
```java
store.getOrder().getCustomer().getBillingAddress().getCity();
```

## 2. Định luật Brook
Thêm người vào dự án đang trễ chỉ làm nó trễ hơn.

## 3. Định luật Conway
Kiến trúc hệ thống phản ánh cấu trúc giao tiếp của tổ chức.

## 4. Least Astonishment
Hành vi gây bất ngờ ít nhất cho người dùng.

## 5. Boy Scout Rule
Mỗi lần commit, code tốt hơn trước đó.

## 6. YAGNI
Đừng xây chức năng khi chưa cần.

## 7. DRY
Đừng lặp lại chính mình.

## 8. KISS
Giữ mọi thứ đơn giản.

## 9. SOLID
S, O, L, I, D — các nguyên lý thiết kế OOP.
