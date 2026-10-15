---
sidebar_position: 23
title: "Authentication"
---

# Authentication

## 1. Authentication: Social Login & quản lý token

Bài học: [1. Authentication: Social Login & quản lý token](../../react-native/23-authentication/1_authentication.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao mobile app không nên tự nhúng client secret của OAuth?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì app cài trên máy người dùng -- attacker decompile APK/IPA là đọc được mọi chuỗi hardcode, kể cả trong bundle JS đã minify. OAuth gọi đây là bài toán **public client**: không có cách nào giữ bí mật an toàn phía client. Giải pháp là PKCE -- thay `client_secret` cố định bằng một cặp `code_verifier`/`code_challenge` sinh ngẫu nhiên ở mỗi lượt đăng nhập.

</details>

**2. PKCE giải quyết vấn đề gì, hoạt động thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

PKCE (Proof Key for Code Exchange, RFC 7636) chống việc kẻ tấn công chặn được `authorization code` giữa đường rồi tự đổi lấy token. App sinh `code_verifier` ngẫu nhiên, gửi bản băm SHA-256 của nó (`code_challenge`) khi mở màn hình đăng nhập; lúc đổi `code` lấy token phải gửi kèm `code_verifier` gốc để server so khớp hash. Ai chặn được `code` mà không có `code_verifier` gốc thì không đổi được token.

</details>

**3. `idToken` khác `access token` của hệ thống backend như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`idToken`/`identityToken` là JWT do Google/Apple ký, chỉ chứng minh **danh tính người dùng với provider đó** -- không phải quyền truy cập API của hệ thống backend. App gửi token này lên backend, backend verify chữ ký rồi mới phát **access token + refresh token riêng** của hệ thống mình. Hai loại token này độc lập vòng đời, không dùng lẫn cho nhau.

</details>

**4. Vì sao Apple chỉ trả về email và họ tên ở lần đăng nhập đầu tiên?**

<details className="qa">
<summary>Xem đáp án</summary>

Đây là chính sách riêng tư của Apple -- những lần đăng nhập sau, `fullName` và `email` trả về `null` dù người dùng vẫn xác thực thành công. Backend phải **lưu lại các trường này từ lần đầu tiên** khi tạo tài khoản; những lần sau chỉ dựa vào `identityToken` (chứa claim định danh ổn định) để nhận diện đúng người dùng cũ, không được coi thiếu email là lỗi.

</details>

**5. `DEVELOPER_ERROR` khi Google Sign-In trên Android thường do đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Gần như luôn do **SHA-1 fingerprint của keystore ký app không khớp** với SHA-1 đã khai cho OAuth client Android trong Google Cloud Console. Debug build và release build dùng keystore khác nhau nên cần khai cả hai SHA-1 nếu test trên cả hai loại build; package name cũng phải khớp `applicationId` thật.

</details>

**6. Vì sao không dùng `AsyncStorage` để lưu access token/refresh token?**

<details className="qa">
<summary>Xem đáp án</summary>

`AsyncStorage` lưu dữ liệu dạng **plain text** trên đĩa -- thiết bị bị root/jailbreak đọc được trực tiếp. Token là chìa khoá mở toàn bộ tài khoản người dùng nên phải đi qua lớp mã hoá phần cứng của hệ điều hành, tức `react-native-keychain` (Keychain iOS / Keystore Android).

</details>

**7. Vì sao cần cả access token lẫn refresh token, không dùng một loại token duy nhất?**

<details className="qa">
<summary>Xem đáp án</summary>

Access token sống ngắn (phút - giờ) để giới hạn thiệt hại nếu bị lộ -- kẻ tấn công chỉ lợi dụng được trong một khoảng thời gian ngắn. Refresh token sống dài hơn nhiều nhưng chỉ dùng để xin access token mới, không gọi trực tiếp API nghiệp vụ, và server có thể **revoke** nó bất cứ lúc nào (đổi mật khẩu, đăng xuất từ xa) mà không cần chờ hết hạn.

</details>

**8. Làm sao tránh nhiều request cùng gọi refresh token song song?**

<details className="qa">
<summary>Xem đáp án</summary>

Gộp mọi lượt refresh đang chạy về **một `Promise` dùng chung** ở phạm vi module: request đầu tiên gặp `401` sẽ khởi tạo `Promise` refresh và lưu vào một biến; các request khác gặp `401` cùng lúc chỉ cần `await` đúng `Promise` đó thay vì tự gọi API refresh riêng. Sau khi refresh xong (thành công hay thất bại), xoá biến để lượt refresh tiếp theo được phép chạy.

</details>

**9. Logout "sạch" cần thực hiện những bước nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Tối thiểu năm bước: (1) gọi API invalidate refresh token phía server, (2) huỷ đăng ký push notification token, (3) đóng kết nối realtime (WebSocket) đang mở, (4) xoá token khỏi Keychain, (5) reset session store (Zustand) về trạng thái chưa đăng nhập. Thứ tự quan trọng -- reset store nên làm **cuối cùng** vì các bước trước vẫn cần đọc access token hiện tại.

</details>

**10. Vì sao session state nên tách `authStatus` thành nhiều giá trị thay vì một `boolean isLoggedIn`?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì app có một khoảng thời gian **đã vẽ xong UI nhưng chưa biết** có phiên đăng nhập hay không -- lúc đang đọc Keychain bất đồng bộ lúc khởi động. Nếu chỉ có `boolean`, giai đoạn này buộc phải gán tạm `false`, khiến người dùng đã đăng nhập từ trước thấy màn hình Login nhấp nháy. Bốn trạng thái `hydrating`/`authed`/`anon`/`expired` cho phép phân biệt rõ "chưa biết" với "biết chắc chưa đăng nhập" và với "từng đăng nhập nhưng phiên đã hết".

</details>

**11. Route trong React Navigation được bảo vệ bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không chặn từng màn hình riêng lẻ -- thay vào đó, render **có điều kiện** toàn bộ cây navigator dựa trên trạng thái đăng nhập: `authStatus === 'authed'` thì render `MainStack`, còn lại render `AuthStack`, và pha `hydrating` cần một màn hình splash/loading riêng để tránh nhấp nháy sai màn hình.

</details>

**12. Biometric (Face ID/vân tay) có thay thế được luồng đăng nhập bằng mật khẩu hoặc token không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. Biometric chỉ là một **lớp khoá nhanh** phía trên một phiên đã đăng nhập sẵn -- dùng để khoá lại app khi mở lại, hoặc xác nhận một hành động nhạy cảm (chuyển tiền, đổi mật khẩu). Nó không tự cấp token mới; token vẫn phải được xin thông qua luồng đăng nhập hoặc refresh token thông thường.

</details>
