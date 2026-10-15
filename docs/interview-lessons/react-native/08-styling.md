---
sidebar_position: 8
title: "Styling"
---

# Styling

## 1. Styling -- StyleSheet, Flexbox, Accessibility

Bài học: [1. Styling -- StyleSheet, Flexbox, Accessibility](../../react-native/08-styling/1_styling.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Style RN khác CSS web thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **JS object** thay CSS (camelCase, không có kebab-case)
- **Không có cascade** -- style không tự inherit (trừ Text)
- **Không có pseudo-class** (`:hover`, `:focus`)
- **Flexbox mặc định**, `flexDirection: 'column'` default
- **Unit number** (pixel) -- không có `rem`, `em`, `%` ít dùng

</details>

**2. Tại sao dùng `StyleSheet.create`?**

<details className="qa">
<summary>Xem đáp án</summary>

- Validate key style lúc dev
- Performance: object frozen, reuse, ID-based pass qua bridge
- Convention -- tách style khỏi component

Vs inline style: inline tạo object mới mỗi render -> child re-render.

</details>

**3. Flexbox `column` mặc định khác web?**

<details className="qa">
<summary>Xem đáp án</summary>

Web `flexDirection` default là `row`. RN default là `column` -- phù hợp mobile UI thường vertical. Phải chuyển `row` khi cần horizontal layout.

</details>

**4. Shadow iOS vs Android?**

<details className="qa">
<summary>Xem đáp án</summary>

- **iOS**: `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`
- **Android**: `elevation` (số)

Phải set cả 2 hoặc dùng `Platform.select`. Không có cross-platform tốt -- library `react-native-shadow` hoặc tự handle.

</details>

**5. Accessibility quan trọng thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Bắt buộc** cho production:

- App Store / Play Store kiểm tra
- Người khuyết tật dùng được app
- Có thể bị **kiện** theo luật một số nước
- Cải thiện UX cho mọi người (label rõ ràng)

Phải có `accessibilityLabel` cho mọi button/input quan trọng.

</details>
