---
sidebar_position: 14
title: "Native Modules"
---

# Native Modules

## 1. Native Modules

Bài học: [1. Native Modules](../../react-native/14-native-modules/1_native-modules.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Khi nào cần Native Module?**

<details className="qa">
<summary>Xem đáp án</summary>

- Truy cập API native không có lib
- Tích hợp SDK third-party native
- Performance critical xử lý dữ liệu native
- Custom UI dùng native view

99% case có lib npm sẵn -- check trước khi tự viết.

</details>

**2. Bridge vs TurboModule?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Bridge** (cũ): JS ↔ Native qua message JSON, **async**, có overhead
- **TurboModule** (New Architecture): JSI, **sync**, type-safe, lazy load, ~5x nhanh hơn

Project mới ưu tiên TurboModule.

</details>

**3. Expo Modules API là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Framework hiện đại để viết native module trong project Expo. API thống nhất iOS + Android, swift/kotlin, hỗ trợ TurboModule, ít boilerplate hơn Bridge classic. Khuyến nghị cho mọi project Expo.

</details>

**4. Config Plugin khác Native Module?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Config Plugin**: chỉ modify file config (Info.plist, AndroidManifest, Gradle) -- không có code native
- **Native Module**: code Swift/Kotlin actual logic

Config Plugin đủ cho 80% nhu cầu "tích hợp SDK" -- chỉ cần config setup.

</details>

**5. Khi nào nên publish native module?**

<details className="qa">
<summary>Xem đáp án</summary>

- Code dùng nhiều project trong company
- Open-source cho cộng đồng
- Tách concern (1 repo, 1 trách nhiệm)

Trước khi publish: viết doc, test cả iOS + Android, semver, CI.

</details>
