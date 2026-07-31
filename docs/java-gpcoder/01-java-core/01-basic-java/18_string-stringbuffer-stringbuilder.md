---
sidebar_position: 18
title: "Java String, StringBuffer và StringBuilder"
---

# Java String, StringBuffer và StringBuilder

> 📝 Nội dung sẽ được bổ sung sau (xem lộ trình Java chính).

Sơ đồ dưới đây minh họa quan hệ giữa ba lớp xử lý chuỗi và interface chung `CharSequence`:

```mermaid
classDiagram
    class CharSequence {
        <<interface>>
    }
    class String
    class StringBuilder
    class StringBuffer
    CharSequence <|.. String : bất biến (immutable)
    CharSequence <|.. StringBuilder : khả biến, không đồng bộ
    CharSequence <|.. StringBuffer : khả biến, đồng bộ (thread-safe)
```

Đọc sơ đồ: cả ba lớp đều hiện thực `CharSequence`. `String` bất biến nên an toàn nhưng tốn bộ nhớ khi nối chuỗi nhiều lần; `StringBuilder` khả biến, nhanh nhất trong môi trường đơn luồng; `StringBuffer` cũng khả biến nhưng đồng bộ (thread-safe) nên an toàn khi nhiều luồng cùng dùng.

:::note[Ghi nhớ nhanh]

- ⭐ **`String` bất biến (immutable)** — mỗi lần thay đổi tạo ra đối tượng mới, an toàn nhưng tốn bộ nhớ khi nối chuỗi nhiều lần.
- ⭐ **`StringBuilder` khả biến, nhanh nhất khi đơn luồng** — nên dùng khi cần nối/sửa chuỗi nhiều lần trong một luồng.
- **`StringBuffer` khả biến và đồng bộ (thread-safe)** — an toàn khi nhiều luồng cùng thao tác, nhưng chậm hơn `StringBuilder`.
- **Cả ba đều hiện thực `CharSequence`** — nên có thể dùng chung ở nơi nhận kiểu `CharSequence`.

:::
