---
sidebar_position: 13
title: "Mệnh đề if-else trong Java"
---

# Mệnh đề if-else trong Java

> 📝 Nội dung sẽ được bổ sung sau (xem lộ trình Java chính).

Sơ đồ dưới đây minh họa luồng rẽ nhánh của cấu trúc `if - else if - else`:

```mermaid
flowchart TD
    A["Bắt đầu"] --> B{"Điều kiện 1 đúng?"}
    B -->|"Đúng"| C["Thực thi khối if"]
    B -->|"Sai"| D{"Điều kiện 2 đúng?"}
    D -->|"Đúng"| E["Thực thi khối else if"]
    D -->|"Sai"| F["Thực thi khối else"]
    C --> G["Kết thúc"]
    E --> G
    F --> G
```

Đọc sơ đồ: chương trình kiểm tra lần lượt từng điều kiện; khi gặp điều kiện đúng đầu tiên thì chạy khối tương ứng rồi bỏ qua các nhánh còn lại. Nếu không điều kiện nào đúng, khối `else` sẽ chạy.

:::note[Ghi nhớ nhanh]

- ⭐ **Kiểm tra tuần tự, dừng ở điều kiện đúng đầu tiên** — `if - else if - else` xét từng điều kiện từ trên xuống; điều kiện đúng đầu tiên được chạy, các nhánh còn lại bị bỏ qua.
- **`else` là nhánh dự phòng** — chỉ chạy khi không điều kiện nào ở trên đúng.
- **Mỗi lần chạy chỉ đi vào một khối** — sau khi thực thi xong một nhánh, luồng nhảy tới điểm kết thúc chung.

:::
