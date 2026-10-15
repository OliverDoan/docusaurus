---
sidebar_position: 27
title: "Build native iOS & Android"
---

# Build native iOS & Android

## 1. Build native: CocoaPods, Gradle, signing & patch thư viện

Bài học: [1. Build native: CocoaPods, Gradle, signing & patch thư viện](../../react-native/27-native-build/1_native-build.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Autolinking là gì và giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Cơ chế CLI tự quét `node_modules` để tìm thư viện có native code, rồi tự nối vào Podfile (iOS) và `PackageList` (Android). Trước RN 0.60, việc này phải làm tay (sửa `AppDelegate`/`MainApplication`) -- dễ quên bước, dễ sai khi gỡ thư viện.

</details>

**2. Vì sao phải chạy lại `pod install` sau khi thêm thư viện native, dù `npm install`/`pnpm install` đã chạy xong?**

<details className="qa">
<summary>Xem đáp án</summary>

`npm install`/`pnpm install` chỉ tải code JS và native source vào `node_modules`. CocoaPods quản lý dependency native iOS riêng qua `Podfile.lock` -- phải chạy `pod install` để CocoaPods đọc lại autolinking, tải đúng version pod, và cập nhật `Podfile.lock`/project Xcode. Bỏ qua bước này, Xcode build với cấu hình pod cũ, thiếu module mới.

</details>

**3. `Podfile.lock` dùng để làm gì, có nên commit không?**

<details className="qa">
<summary>Xem đáp án</summary>

Giống `package-lock.json`/`pnpm-lock.yaml` -- pin chính xác version từng pod đã cài và test. **Phải commit** để cả team và CI cài cùng 1 bộ version pod, tránh tình trạng "chạy máy tôi thì được".

</details>

**4. Cờ `newArchEnabled` và `RCT_NEW_ARCH_ENABLED` còn tác dụng gì với build?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai cờ này từng dùng để bật/tắt New Architecture (TurboModule và Fabric renderer). Từ RN 0.76 New Architecture bật mặc định, và từ RN 0.82 cờ tắt **bị bỏ qua** -- app luôn chạy New Architecture. Với dự án cũ đang nâng cấp qua mốc này, codegen sinh code khác hoàn toàn so với kiến trúc cũ, nên phải `pod install` lại toàn bộ (không chỉ pod vừa đổi) và build sạch lại Android, nếu không dễ gặp lỗi linker hoặc thiếu symbol.

</details>

**5. `./gradlew signingReport` dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

In ra SHA-1/SHA-256 của từng `signingConfig` (debug lẫn release) trong project. Các giá trị này cần đăng ký với dịch vụ xác thực theo chữ ký app (Google Sign-In, Firebase...) -- thiếu hoặc sai SHA gây lỗi đăng nhập kiểu `DEVELOPER_ERROR`.

</details>

**6. Debug keystore và release keystore khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Debug keystore tự sinh, khác nhau trên mỗi máy dev, chỉ dùng khi build debug. Release keystore tự tạo, dùng chung cho toàn bộ bản release và CI, phải backup kỹ vì **mất keystore release đồng nghĩa không thể update app đã phát hành**.

</details>

**7. `patch-package` và `pnpm patch` khác nhau ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- `patch-package`: sửa trực tiếp trong `node_modules`, sinh file patch, cần khai `postinstall` gọi `patch-package` để tự áp lại.
- `pnpm patch`: cơ chế built-in của pnpm -- mở bản sao tạm để sửa, `pnpm patch-commit` để chốt, patch được khai trong `patchedDependencies` và tự áp khi install, không cần script `postinstall` riêng.

Với project dùng pnpm, `pnpm patch` phù hợp hơn vì tương thích đúng cách pnpm quản lý store (không sửa trực tiếp file trong store dùng chung).

</details>

**8. Vì sao phải tạo lại patch khi nâng version thư viện?**

<details className="qa">
<summary>Xem đáp án</summary>

Patch là diff theo đúng nội dung file tại version cụ thể lúc tạo. Nâng version khác, nội dung file gốc thay đổi (số dòng, code xung quanh) khiến patch cũ áp không khớp hoặc áp sai chỗ -- phải patch lại trên version mới.

</details>

**9. Vì sao `nodeLinker: hoisted` là bắt buộc khi dùng pnpm cho React Native?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì Gradle, CocoaPods và CLI autolinking được viết với giả định `node_modules` phẳng (một số file hard-code đường dẫn tương đối tới package trong `node_modules`, autolinking quét trực tiếp các thư mục con). Layout mặc định "isolated" của pnpm (symlink lồng nhau, mỗi package chỉ thấy đúng dependency của nó) khiến các tool này không tìm thấy package cần thiết.

</details>

**10. Exit code 126 khi build Android với pnpm nghĩa là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

"Tìm thấy file nhưng không thực thi được" (khác `127` là "không tìm thấy"). Nguyên nhân thường gặp: `nodeLinker: hoisted` khiến `node_modules/.bin/*` là symlink trỏ vào file gốc, một số package publish binary không có sẵn quyền thực thi, và pnpm hoisted không tự cấp lại quyền như npm/yarn. Cách sửa: thêm bước tự cấp lại quyền thực thi vào `postinstall`.

</details>

**11. Vì sao cần khác applicationId/bundle identifier giữa các môi trường dev/staging/prod?**

<details className="qa">
<summary>Xem đáp án</summary>

Để cài đồng thời nhiều bản trên cùng 1 máy test mà không đè lên nhau (hệ điều hành coi mỗi applicationId/bundle id là 1 app riêng biệt). Thường dùng `applicationIdSuffix` theo flavor (Android) hoặc Bundle Identifier riêng theo scheme (iOS).

</details>

**12. Vì sao build Gradle có thể báo thành công nhưng app vẫn crash vì thiếu native module?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì autolinking dùng cache riêng (file cấu hình autolink kèm hash lockfile). Nếu một lần build trước đó fail giữa chừng sau khi hash đã được đánh dấu "đã xử lý" (ví dụ do lỗi exec bit không liên quan), lần build sau có thể đọc cache cũ (thiếu module mới) mà vẫn coi là hợp lệ -- build pass nhưng danh sách package thực tế thiếu package mới, gây lỗi runtime native module null. Cách xử lý: xoá thư mục cache autolinking rồi build lại khi nghi ngờ.

</details>
