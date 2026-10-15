---
sidebar_position: 3
title: "Environment Setup"
---

# Environment Setup

## 1. Cài đặt môi trường

Bài học: [1. Cài đặt môi trường](../../react-native/03-environment-setup/1_environment-setup.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Expo vs RN CLI -- khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Expo**: 90% project mới -- setup nhanh, tooling tốt, đủ cho hầu hết use case
- **RN CLI**: khi cần native customization sâu, integrate SDK third-party không có Expo plugin

Có thể start Expo, sau eject sang prebuild khi cần.

</details>

**2. Metro Bundler là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Bundler RN -- tương đương Webpack/Vite cho web. Transpile JSX/TS, bundle code, serve qua HTTP cho app. Hot reload, fast refresh, symbolicate error đều qua Metro.

</details>

**3. Expo Go là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

App có sẵn trên App Store/Play Store -- chạy được mọi project Expo **không cần build**. Quét QR code -> app chạy. Dev iterate cực nhanh. **Hạn chế**: chỉ chạy package có trong Expo SDK -- custom native module không hoạt động.

</details>

**4. Expo Prebuild là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Generate `ios/` và `android/` folder từ config `app.json` -- bạn vẫn dùng Expo tools (CLI, EAS) nhưng có thể edit native code. Trung gian giữa managed workflow và bare workflow.

</details>

**5. Khi nào nên eject?**

<details className="qa">
<summary>Xem đáp án</summary>

- Cần native module không có Expo plugin
- Cần modify code Android/iOS thủ công
- Tích hợp SDK third-party đặc biệt (Bluetooth, USB...)

Trước eject, kiểm tra **Expo Modules** hoặc **Config Plugin** -- thường không cần eject hoàn toàn.

</details>
