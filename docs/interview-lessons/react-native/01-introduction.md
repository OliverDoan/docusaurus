---
sidebar_position: 1
title: "Introduction"
---

# Introduction

## 1. Giới thiệu React Native

Bài học: [1. Giới thiệu React Native](../../react-native/01-introduction/1_what-is-react-native.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. React Native khác React thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **React**: render DOM trong browser (`<div>`, `<span>`)
- **React Native**: render native UI mobile (`<View>`, `<Text>`)

Cả 2 cùng concept (component, state, props, hooks). Khác về platform target và component primitive.

</details>

**2. RN vs Flutter -- chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **RN**: nếu team biết React, ecosystem JS rộng, native UI thật
- **Flutter**: nếu team thoải mái Dart, cần UI custom phức tạp, performance đỉnh

Không có "tốt hơn" tuyệt đối -- phụ thuộc skill team và requirement app.

</details>

**3. Bridge và JSI khác gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Bridge** (cũ): JS ↔ Native qua message JSON, **async**, có overhead
- **JSI** (mới): JS gọi C++ trực tiếp, **sync**, gần như zero overhead

New Architecture (Fabric + TurboModules + JSI) là tương lai của RN.

</details>

**4. Expo là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Framework + platform built trên RN. Cung cấp:

- **Pre-configured tooling** -- không cần Xcode/Android Studio cho dev
- **Library** -- camera, location, push notification...
- **EAS** -- build, submit, OTA update

Phù hợp dev mới hoặc team không muốn quản lý native.

</details>

**5. Hermes là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

JavaScript engine của Meta, tối ưu cho mobile. Mặc định trên RN từ 0.70+:

- **Start nhanh hơn** JSC (giảm time-to-interactive)
- **App size nhỏ hơn**
- **Memory thấp hơn**
- **Bytecode** pre-compile -- không parse JS lúc runtime

</details>
