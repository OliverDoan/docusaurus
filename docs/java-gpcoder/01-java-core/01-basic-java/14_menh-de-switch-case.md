---
sidebar_position: 14
title: "Mệnh đề switch-case trong Java"
---

# Mệnh đề switch-case trong Java

> 📝 Nội dung sẽ được bổ sung sau (xem lộ trình Java chính).

Sơ đồ dưới đây minh họa cách `switch` chọn nhánh dựa trên giá trị của biểu thức:

```mermaid
flowchart TD
    A["Tính giá trị biểu thức"] --> B{"So khớp giá trị"}
    B -->|"case 1"| C["Khối lệnh 1"]
    B -->|"case 2"| D["Khối lệnh 2"]
    B -->|"case 3"| E["Khối lệnh 3"]
    B -->|"không khớp"| F["Khối default"]
    C --> G["Kết thúc switch"]
    D --> G
    E --> G
    F --> G
```

Đọc sơ đồ: giá trị biểu thức được so khớp với từng `case`; nhánh trùng khớp sẽ chạy. Nếu không `case` nào khớp thì khối `default` chạy (nếu có).
