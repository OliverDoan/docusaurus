---
sidebar_position: 4
title: "Development Workflow"
---

# Development Workflow

## 1. Development Workflow

Bài học: [1. Development Workflow](../../react-native/04-development-workflow/1_development-workflow.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Fast Refresh hoạt động thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Metro detect file thay đổi -> push update qua HMR (Hot Module Replacement). React Refresh:

- **Component thay đổi**: re-mount component đó, **giữ state**
- **Hook/logic thay đổi**: reload module
- **Error**: hiển thị redbox, sau khi sửa tự recover

</details>

**2. Hermes Inspector vs Chrome Debugger?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Chrome Debugger** (cũ): code chạy trong **V8** của Chrome, không phải Hermes/JSC -- behavior khác production
- **Hermes Inspector** (mới): debug trực tiếp Hermes engine -- đúng môi trường production

Khuyến nghị Hermes Inspector cho project Hermes.

</details>

**3. Sourcemap dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Map bundle code (đã minify) ngược về source gốc. Quan trọng cho crash report -- stack trace từ user app chỉ có line bundle, sourcemap convert thành line trong file `.tsx` gốc. Upload sourcemap lên Sentry, Bugsnag để auto-symbolicate.

</details>

**4. LogBox là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

UI hiển thị warning/error in-app:

- **Yellow box** -- warning (deprecated, perf hint)
- **Red box** -- error nghiêm trọng

Có thể `ignoreLogs(pattern)` để ẩn warning đã biết. **Chỉ dev**, production tắt.

</details>

**5. Test trên simulator có đủ không?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không**. Simulator/Emulator có giới hạn:

- CPU mạnh hơn device thật -> hide bug perf
- Network khác (đặc biệt cellular)
- Không có camera/sensor thật
- Behavior touch khác

Phải test trên **real device** ít nhất 1 lần trước release.

</details>
