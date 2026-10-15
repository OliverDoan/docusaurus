---
sidebar_position: 2
title: "Pre-requisites"
---

# Pre-requisites

## 1. Kiến thức tiên quyết

Bài học: [1. Kiến thức tiên quyết](../../react-native/02-prerequisites/1_prerequisites.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Props vs State khác gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Props**: dữ liệu **truyền từ ngoài vào**, immutable trong component
- **State**: dữ liệu **nội bộ**, có thể thay đổi bằng setter

Props giống "tham số function". State giống "biến local".

</details>

**2. useEffect chạy khi nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`useEffect(fn)`**: chạy sau **mỗi render**
- **`useEffect(fn, [])`**: chỉ 1 lần khi **mount**
- **`useEffect(fn, [a, b])`**: chạy khi **a hoặc b thay đổi**
- **Return function**: chạy lúc **cleanup** (unmount hoặc trước rerun)

</details>

**3. Flexbox trong RN khác CSS web thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`flexDirection` mặc định là `column`** (web là `row`)
- **`display` không tồn tại** -- mọi view là flex
- **Không có `block`, `inline`** -- chỉ flex
- **Không có `%` cho margin/padding parent** -- dùng `flex`, `width`/`height` cụ thể

</details>

**4. Class vs Function component?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Function component + hooks**: hiện đại, ngắn, dễ test -- chuẩn từ React 16.8
- **Class component**: cũ, dài, vẫn hoạt động nhưng không khuyến khích cho code mới

Mọi project mới dùng function component.

</details>

**5. JSX có bắt buộc không?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không** -- có thể dùng `React.createElement(...)` thủ công. Nhưng JSX **dễ đọc hơn nhiều** -- mọi project React/RN đều dùng JSX. JSX được compile thành `createElement` qua Babel.

</details>
