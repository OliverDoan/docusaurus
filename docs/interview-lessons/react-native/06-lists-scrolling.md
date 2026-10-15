---
sidebar_position: 6
title: "Lists & Scrolling"
---

# Lists & Scrolling

## 1. Lists & Scrolling

Bài học: [1. Lists & Scrolling](../../react-native/06-lists-scrolling/1_lists-and-scrolling.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. ScrollView vs FlatList?**

<details className="qa">
<summary>Xem đáp án</summary>

- **ScrollView**: render **toàn bộ children** ngay -- ok cho ít item (< 20)
- **FlatList**: **virtualized** -- chỉ render item trong viewport + buffer -- ok cho danh sách dài

10000 item: ScrollView OOM, FlatList smooth.

</details>

**2. Virtualization là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Chỉ render **item đang visible** (+ buffer). Item ngoài viewport bị **unmount** để tiết kiệm memory. Khi scroll, item mới được mount, item cũ unmount. Cho phép list **nghìn-triệu item** mượt mà.

</details>

**3. `getItemLayout` lợi ích gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Nếu mỗi item **chiều cao cố định**, `getItemLayout` cho FlatList biết trước layout -- **không cần measure**. Hệ quả:

- Scroll mượt hơn (đặc biệt initial scroll)
- `scrollToIndex` chính xác
- Tăng perf đáng kể

```jsx
getItemLayout={(data, index) => ({
  length: 80, offset: 80 * index, index
})}
```

</details>

**4. FlashList vs FlatList?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả 2 virtualized. **FlashList** (Shopify):

- **Recycle** item view thay vì destroy/create -- nhanh hơn
- Memory thấp hơn
- API tương tự -- migrate dễ
- Cần `estimatedItemSize`

Khuyến nghị FlashList cho production app có list lớn.

</details>

**5. Cách implement infinite scroll?**

<details className="qa">
<summary>Xem đáp án</summary>

1. `onEndReached={loadMore}`
2. `onEndReachedThreshold={0.5}` (load khi còn 50%)
3. Trong `loadMore`, fetch page tiếp theo
4. Append vào state
5. Guard `if (loading) return` -- tránh gọi nhiều lần
6. `ListFooterComponent={loading ? <ActivityIndicator /> : null}`

</details>
