---
sidebar_position: 5
title: "Core Components"
---

# Core Components

## 1. Core Components

Bài học: [1. Core Components](../../react-native/05-core-components/1_core-components.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. View khác div thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **div** (web): render thành HTML element, dùng CSS
- **View** (RN): render thành `UIView` (iOS) / `android.view.View` (Android) -- native UI thực sự, dùng StyleSheet object

View **mặc định flexbox column**, khác div mặc định block.

</details>

**2. Text component bắt buộc?**

<details className="qa">
<summary>Xem đáp án</summary>

**Có**. RN crash nếu render text raw trong View. Lý do: text trên native phải có font, color, alignment -- View không có thông tin đó. Text component handle render text native.

</details>

**3. Pressable vs TouchableOpacity?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Pressable** (mới, RN 0.63+): API thống nhất, hỗ trợ nhiều state (pressed, hovered), customize feedback
- **TouchableOpacity** (cũ): chỉ có opacity feedback, không hỗ trợ state phức tạp

Code mới dùng Pressable. TouchableOpacity vẫn OK, không deprecated.

</details>

**4. Modal vs Bottom Sheet?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Modal**: cover full screen, dialog truyền thống
- **Bottom Sheet**: drag từ dưới lên, modern UX (`@gorhom/bottom-sheet`)

Modal built-in OK cho simple case. Bottom sheet cho UX hiện đại (Spotify, Instagram).

</details>

**5. Image cache làm sao?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`Image` built-in**: cache đơn giản, không control
- **`expo-image`**: full control cache (memory + disk), placeholder, transition
- **`react-native-fast-image`**: alternative, hiệu năng tốt

Cho app production với nhiều ảnh, **bắt buộc** dùng lib có cache mạnh.

</details>
