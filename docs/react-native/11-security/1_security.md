---
sidebar_position: 1
title: "1. Security -- Auth, Storage, Permissions"
---

# Security -- Bảo mật trong React Native

Bảo mật mobile **khác web** -- attacker có thể decompile APK/IPA, reverse engineer. Bài này tổng hợp: Authentication, Secure Storage, Network Security, Permissions.

**Tương tự đơn giản:** App mobile giống **nhà ở** -- attacker có thể "phá cửa" (decompile), "lục ngăn kéo" (đọc storage), "nghe trộm" (intercept network). Security là **khóa, két sắt, mành cửa** -- nhiều lớp phòng vệ.

---

## Mục lục

- [Vì sao bảo mật mobile khác web?](#vì-sao-bảo-mật-mobile-khác-web)
- [1. Authentication](#1-authentication)
- [2. Secure Storage](#2-secure-storage)
- [3. Network Security](#3-network-security)
- [4. Permissions](#4-permissions)
- [5. Code Obfuscation](#5-code-obfuscation)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao bảo mật mobile khác web?

**Vấn đề:** App mobile được **cài trực tiếp trên thiết bị người dùng** -- attacker có thể nắm máy trong tay, decompile APK/IPA, đọc mã, dò ra chuỗi bí mật bị hardcode. Token lưu trong `AsyncStorage` (không mã hoá, plain text) dễ bị đọc trên máy đã root/jailbreak. Thiết bị còn có thể bị mất hoặc trộm. Khác hẳn web -- nơi mã nhạy cảm chạy trên server tương đối an toàn, người dùng chỉ thấy phần client.

**Giải pháp:** Lưu dữ liệu nhạy cảm vào **secure storage của OS** -- Keychain (iOS) / Keystore (Android) qua `expo-secure-store` hoặc `react-native-keychain`, KHÔNG dùng `AsyncStorage`. Tuyệt đối **không hardcode secret/API key** trong app -- giữ secret ở server, app chỉ cầm user token. Dùng **HTTPS** và cân nhắc **SSL/certificate pinning** chống MITM. Thêm **xác thực sinh trắc** (Face ID / vân tay) và **hạn chế quyền** xin đúng cái cần.

:::tip[Dùng thực tế]

- **Lưu token bằng SecureStore** thay vì AsyncStorage -- token vào Keychain/Keystore, encrypted, an toàn cả trên máy root.
- **Không nhúng API key bí mật vào app** -- ví dụ Stripe secret để ở server, app chỉ dùng publishable key.
- **Certificate pinning** cho app banking/finance -- chặn MITM ngay cả khi attacker có CA giả.
- **Khoá app bằng vân tay/Face ID** -- yêu cầu xác thực sinh trắc trước khi xem thông tin nhạy cảm hoặc xác nhận thanh toán.

:::

---

## 1. Authentication

### JWT (JSON Web Token)

Phổ biến nhất cho REST API.

```jsx
// Login
const { token, refreshToken } = await api.post('/auth/login', { email, password });

// Luu secure
await SecureStore.setItemAsync('token', token);
await SecureStore.setItemAsync('refreshToken', refreshToken);

// Dung cho request sau
const t = await SecureStore.getItemAsync('token');
api.defaults.headers.Authorization = `Bearer ${t}`;
```

### OAuth2 / Social login

```bash
npx expo install expo-auth-session
```

```jsx
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';

const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: 'YOUR_GOOGLE_CLIENT_ID',
});

// Mo flow login Google
promptAsync();

// Lay token sau khi user authorize
if (response?.type === 'success') {
  const { authentication } = response;
  // Goi API google de lay user info
}
```

### Biometric (Face ID, Touch ID, Fingerprint)

```bash
npx expo install expo-local-authentication
```

```jsx
import * as LocalAuthentication from 'expo-local-authentication';

// Check thiet bi co support
const hasHardware = await LocalAuthentication.hasHardwareAsync();
const enrolled = await LocalAuthentication.isEnrolledAsync();

// Authenticate
const result = await LocalAuthentication.authenticateAsync({
  promptMessage: 'Xac thuc de tiep tuc',
  fallbackLabel: 'Dung PIN',
});

if (result.success) {
  // OK
}
```

Use case: unlock app, confirm payment, view sensitive info.

---

## 2. Secure Storage

### KHÔNG dùng AsyncStorage cho data nhạy cảm

AsyncStorage lưu **plain text** -- root device đọc được.

### `expo-secure-store` (khuyến nghị)

Lưu vào **Keychain** (iOS) / **EncryptedSharedPreferences** (Android).

```bash
npx expo install expo-secure-store
```

```jsx
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('token', 'jwt-token-xxx');
const token = await SecureStore.getItemAsync('token');
await SecureStore.deleteItemAsync('token');

// Voi biometric protection (iOS)
await SecureStore.setItemAsync('secret', 'value', {
  requireAuthentication: true,
});
```

### `react-native-keychain` (RN CLI)

```bash
npm install react-native-keychain
```

```jsx
import * as Keychain from 'react-native-keychain';

await Keychain.setGenericPassword('username', 'password');
const credentials = await Keychain.getGenericPassword();
```

---

## 3. Network Security

### HTTPS only

```js
// app.json (Expo)
{
  "ios": { "infoPlist": { "NSAppTransportSecurity": { "NSAllowsArbitraryLoads": false } } },
  "android": { "usesCleartextTraffic": false }
}
```

Reject HTTP -- ép server dùng HTTPS.

### Certificate Pinning

Verify server cert là **chính xác** -- chống MITM (Man-In-The-Middle).

```jsx
// react-native-ssl-pinning
import { fetch } from 'react-native-ssl-pinning';

fetch('https://api.example.com/data', {
  method: 'GET',
  sslPinning: {
    certs: ['cert1', 'cert2'], // .cer files in assets
  },
});
```

### Bảo vệ secret trong code

```jsx
// SAI -- attacker decompile app, lay duoc
const API_KEY = 'sk-secret-key-123';

// DUNG -- key luu server, app chi co token user
const userToken = await SecureStore.getItemAsync('token');
api.headers.Authorization = `Bearer ${userToken}`;
```

**KHÔNG có cách hoàn hảo** giấu secret trong app -- attacker đủ kiên nhẫn sẽ extract được. Luôn keep secret ở server.

---

## 4. Permissions

iOS và Android yêu cầu xin permission trước khi access:

- Camera
- Microphone
- Location
- Contacts
- Photo Library
- Notifications

### Expo Permissions

```jsx
import * as Camera from 'expo-camera';
import * as Location from 'expo-location';

// Camera
const { status } = await Camera.requestCameraPermissionsAsync();
if (status === 'granted') {
  // open camera
}

// Location
const { status } = await Location.requestForegroundPermissionsAsync();
if (status === 'granted') {
  const location = await Location.getCurrentPositionAsync();
}
```

### Best Practice

```jsx
// Check truoc khi xin
const { status: existing } = await Camera.getCameraPermissionsAsync();

if (existing === 'granted') {
  // dung luon
} else if (existing === 'denied') {
  // huong dan user vao Settings
  Linking.openSettings();
} else {
  // chua hoi -> xin
  const { status } = await Camera.requestCameraPermissionsAsync();
}
```

### `app.json` -- khai báo lý do (iOS)

```json
{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "App can camera de chup anh dai dien",
      "NSLocationWhenInUseUsageDescription": "App can vi tri de hien thi cua hang gan ban"
    }
  }
}
```

App Store **reject** nếu thiếu description.

---

## 5. Code Obfuscation

### iOS / Android

- **iOS**: Xcode build configuration tự strip symbol, có thể dùng `ProGuard`-like tool
- **Android**: bật **ProGuard/R8** trong `build.gradle`

```groovy
// android/app/build.gradle
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### Hermes bytecode

Hermes engine pre-compile JS thành **bytecode** -- attacker không đọc được JS gốc dễ. Có sourcemap thì decompile được.

### Tránh leak source

- KHÔNG commit `.env` lên git
- Sourcemap **không upload public** -- chỉ Sentry/Bugsnag

---

## Khi nào dùng?

- **SecureStore**: token, secret, biometric data
- **AsyncStorage**: user preferences (theme, lang)
- **Biometric**: app banking, ví, sensitive data
- **OAuth/JWT**: API auth
- **SSL Pinning**: app banking, finance
- **Permission flow**: tất cả app dùng camera/location/contacts...
- **Best practice:**
  - **HTTPS only**
  - Token lưu **SecureStore**, không AsyncStorage
  - **Logout** clear hết storage
  - **Refresh token** flow đúng
  - Show **purpose** khi xin permission
  - Validate input client + server

---

## Lỗi thường gặp

### Lỗi 1: Lưu password plain text

```jsx
// SAI
await AsyncStorage.setItem('password', password);

// DUNG -- khong luu password, chi luu token
await SecureStore.setItemAsync('token', token);
```

### Lỗi 2: Hardcode API key

```jsx
// SAI -- attacker decompile thay
const STRIPE_SECRET = 'sk_live_xxx';

// DUNG -- secret o server, app dung Stripe publishable key
const STRIPE_PUBLISHABLE = 'pk_live_xxx';
```

### Lỗi 3: Bỏ qua permission denied

```jsx
// SAI -- user deny -> crash
const { status } = await Camera.request();
const photo = await camera.takePicture(); // crash neu denied

// DUNG
if (status !== 'granted') {
  alert('Vui long cap quyen camera');
  return;
}
```

### Lỗi 4: Quên invalidate token khi logout

```jsx
const logout = async () => {
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('refreshToken');
  await AsyncStorage.clear();         // user data
  // Goi API /logout de invalidate o server
};
```

### Lỗi 5: HTTP traffic clear text

iOS reject mặc định. Android 9+ reject. Nếu vẫn cần HTTP (dev), config:

```json
"usesCleartextTraffic": true   // chi dev
```

Production: BUỘC HTTPS.

---

## Câu hỏi phỏng vấn

### Câu 1: AsyncStorage có an toàn không?

**Trả lời:** **Không** cho data nhạy cảm. AsyncStorage lưu **plain text** -- root/jailbreak device đọc được. Dùng `SecureStore` (Expo) hoặc `react-native-keychain` -- lưu vào Keychain/Keystore native, encrypted.

### Câu 2: JWT lưu ở đâu trong RN?

**Trả lời:**

- **Access token** (short-lived 15min-1h): `SecureStore`
- **Refresh token** (long-lived): `SecureStore` (an toàn hơn)
- KHÔNG lưu `AsyncStorage`
- KHÔNG lưu trong code

Logout: delete cả 2 + gọi API invalidate.

### Câu 3: Certificate Pinning là gì?

**Trả lời:** Verify SSL certificate server **khớp với cert** đã ship trong app -- chống MITM attack (ngay cả khi attacker có CA chứng nhận giả). Quan trọng cho app banking, finance.

Trade-off: cert hết hạn -> phải update app.

### Câu 4: Tại sao iOS yêu cầu UsageDescription?

**Trả lời:** Apple bắt buộc app **giải thích lý do** xin permission. Ví dụ `NSCameraUsageDescription` = "Tại sao cần camera?". Nếu thiếu:

- App **crash** khi xin permission
- App Store **reject**

Mục đích bảo vệ user.

### Câu 5: Có cách giấu API secret hoàn toàn không?

**Trả lời:** **Không**. Attacker có thể:

- Decompile APK/IPA
- Intercept network với proxy
- Reverse engineer Hermes bytecode

**Giải pháp**: KEEP secret ở server. App chỉ có **user token** (chỉ có quyền của user đó). Endpoint nhạy cảm dùng server-to-server với secret.
