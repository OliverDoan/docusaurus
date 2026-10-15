---
sidebar_position: 11
title: "Security"
---

# Security

## 1. Security -- Auth, Storage, Permissions

Bài học: [1. Security -- Auth, Storage, Permissions](../../react-native/11-security/1_security.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. AsyncStorage có an toàn không?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không** cho data nhạy cảm. AsyncStorage lưu **plain text** -- root/jailbreak device đọc được. Dùng `SecureStore` (Expo) hoặc `react-native-keychain` -- lưu vào Keychain/Keystore native, encrypted.

</details>

**2. JWT lưu ở đâu trong RN?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Access token** (short-lived 15min-1h): `SecureStore`
- **Refresh token** (long-lived): `SecureStore` (an toàn hơn)
- KHÔNG lưu `AsyncStorage`
- KHÔNG lưu trong code

Logout: delete cả 2 + gọi API invalidate.

</details>

**3. Certificate Pinning là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Verify SSL certificate server **khớp với cert** đã ship trong app -- chống MITM attack (ngay cả khi attacker có CA chứng nhận giả). Quan trọng cho app banking, finance.

Trade-off: cert hết hạn -> phải update app.

</details>

**4. Tại sao iOS yêu cầu UsageDescription?**

<details className="qa">
<summary>Xem đáp án</summary>

Apple bắt buộc app **giải thích lý do** xin permission. Ví dụ `NSCameraUsageDescription` = "Tại sao cần camera?". Nếu thiếu:

- App **crash** khi xin permission
- App Store **reject**

Mục đích bảo vệ user.

</details>

**5. Có cách giấu API secret hoàn toàn không?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không**. Attacker có thể:

- Decompile APK/IPA
- Intercept network với proxy
- Reverse engineer Hermes bytecode

**Giải pháp**: KEEP secret ở server. App chỉ có **user token** (chỉ có quyền của user đó). Endpoint nhạy cảm dùng server-to-server với secret.

</details>
