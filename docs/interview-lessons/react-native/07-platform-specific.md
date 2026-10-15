---
sidebar_position: 7
title: "Platform Specific Code"
---

# Platform Specific Code

## 1. Platform Specific Code

Bài học: [1. Platform Specific Code](../../react-native/07-platform-specific/1_platform-specific.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Platform module dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Detect platform runtime (`Platform.OS`) và **conditional logic**. Hữu ích khi behavior nhỏ khác nhau (shadow, padding, font). Với khác biệt lớn, dùng file extension thay vì if-else.

</details>

**2. File extension `.ios.tsx`/`.android.tsx` lợi ích?**

<details className="qa">
<summary>Xem đáp án</summary>

- Code **clean** -- không nested if Platform.OS
- Tree-shake -- web bundle không có code iOS/Android
- Dễ maintain -- mỗi platform một file

Phù hợp khi component khác **hoàn toàn** giữa platform.

</details>

**3. react-native-web là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Library map RN components -> HTML/CSS -- cho phép RN code chạy trên web browser. Chia sẻ 70-90% code mobile + web. Maintain bởi Facebook/Meta (cùng React Native). Expo built-in.

</details>

**4. Khi nào nên dùng react-native-web?**

<details className="qa">
<summary>Xem đáp án</summary>

- Cần app vừa mobile + web nhưng team chỉ làm RN
- Marketing site share với app
- Internal tool dùng cả browser + mobile
- KHÔNG cho app web phức tạp (Next.js tốt hơn)

</details>

**5. Detect tablet/phone?**

<details className="qa">
<summary>Xem đáp án</summary>

- `Platform.isPad` -- iPad
- Android: dùng dimension `Dimensions.get('window')` -- check width
- Library: `react-native-device-info`

Responsive design dùng `width` thay vì check device cụ thể.

</details>
