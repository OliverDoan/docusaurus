---
sidebar_position: 15
title: "Vòng lặp for, while, do-while trong Java"
---

# Vòng lặp for, while, do-while trong Java

> 📝 Nội dung sẽ được bổ sung sau (xem lộ trình Java chính).

Sơ đồ dưới đây so sánh hai kiểu vòng lặp: kiểm tra điều kiện **trước** (`for`, `while`) và kiểm tra điều kiện **sau** (`do-while`):

```mermaid
flowchart TD
    subgraph pre["for / while: kiểm tra trước"]
        W1{"Điều kiện đúng?"} -->|"Đúng"| W2["Thực thi thân vòng lặp"]
        W2 --> W1
        W1 -->|"Sai"| W3["Thoát vòng lặp"]
    end
    subgraph post["do-while: kiểm tra sau"]
        D1["Thực thi thân vòng lặp"] --> D2{"Điều kiện đúng?"}
        D2 -->|"Đúng"| D1
        D2 -->|"Sai"| D3["Thoát vòng lặp"]
    end
```

Đọc sơ đồ: `for` và `while` có thể chạy 0 lần nếu điều kiện sai ngay từ đầu; còn `do-while` luôn chạy thân vòng lặp **ít nhất một lần** vì kiểm tra điều kiện đặt ở cuối.
