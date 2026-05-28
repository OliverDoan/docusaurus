---
sidebar_position: 1
title: "1. Cài đặt môi trường"
---

# Cài đặt môi trường React Native

Có 2 cách chính để bắt đầu RN: **Expo** (dễ, nhanh) và **React Native CLI** (toàn quyền kiểm soát). Bài này hướng dẫn cả 2 + công cụ liên quan (Metro Bundler, Expo Snack).

**Tương tự đơn giản:** **Expo** giống **bộ Lego có sẵn** -- mở hộp ra lắp được luôn. **RN CLI** giống **xưởng gỗ** -- linh hoạt nhưng cần đồ nghề + thời gian.

---

## Mục lục

- [1. Expo vs React Native CLI](#1-expo-vs-react-native-cli)
- [2. Expo (Recommended)](#2-expo-recommended)
- [3. React Native CLI](#3-react-native-cli)
- [4. Metro Bundler](#4-metro-bundler)
- [5. Expo Snack](#5-expo-snack)
- [6. Expo Tradeoffs](#6-expo-tradeoffs)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Expo vs React Native CLI

| Tiêu chí           | Expo (managed)               | RN CLI (bare)               |
| ------------------ | ---------------------------- | --------------------------- |
| Setup              | 5 phút                       | 30 phút - vài giờ           |
| Cần Xcode/Android Studio? | Không (dùng Expo Go)  | Có                          |
| Native code        | Hạn chế (qua config)         | Tự do                       |
| Build              | EAS cloud build              | Tự build local              |
| OTA update         | Built-in (EAS Update)        | Tự setup (CodePush)         |
| App size           | Lớn hơn (~30MB starter)      | Nhỏ hơn                     |
| Khuyến nghị        | 95% project mới              | Khi cần native customize sâu|

**Lời khuyên:** Bắt đầu với **Expo**. Khi cần native customization, có thể **eject** sang prebuild.

---

## 2. Expo (Recommended)

### Yêu cầu

- Node.js LTS (>= 18)
- npm hoặc yarn/pnpm
- Điện thoại có cài **Expo Go** app (testing dev)

### Tạo project

```bash
# Khuyen nghi -- TypeScript template
npx create-expo-app my-app --template

# Vao project
cd my-app

# Chay
npx expo start
```

Quét QR code bằng **Expo Go** trên điện thoại -> app chạy ngay.

### Cấu trúc Expo project

```
my-app/
├── app/                  (Expo Router -- file-based routing)
│   ├── _layout.tsx
│   ├── index.tsx
│   └── settings.tsx
├── assets/               (images, fonts)
├── components/
├── app.json              (Expo config)
├── package.json
└── tsconfig.json
```

### Lệnh thường dùng

```bash
npx expo start            # dev server (Metro)
npx expo start --ios      # mo iOS simulator
npx expo start --android  # mo Android emulator
npx expo start --web      # mo web

npx expo install <pkg>    # cai package compatible voi Expo SDK

npx expo prebuild         # generate native folders (ios, android)
```

---

## 3. React Native CLI

### Yêu cầu

**Cho iOS** (macOS only):

- Xcode (Mac App Store)
- CocoaPods (`sudo gem install cocoapods`)
- iOS Simulator

**Cho Android**:

- Android Studio
- JDK 17
- Android SDK
- `ANDROID_HOME` env

### Tạo project

```bash
npx react-native@latest init MyApp

cd MyApp

# Chay iOS
npx react-native run-ios

# Chay Android
npx react-native run-android
```

### Cấu trúc

```
MyApp/
├── android/              (project Android native)
├── ios/                  (project iOS native, .xcworkspace)
├── App.tsx
├── index.js              (entry point)
├── package.json
└── metro.config.js
```

---

## 4. Metro Bundler

**Metro** = bundler của RN -- giống Webpack/Vite cho web.

Vai trò:

- **Transpile** JSX, TypeScript -> JS
- **Bundle** tất cả file thành 1 file
- **Hot reload** -- watch file đổi, push update tới app
- **Symbolicate** -- map error stack về source

### Chạy

```bash
npx react-native start
# hoac
npx expo start
```

Mặc định cổng `8081`. App kết nối qua `localhost:8081`.

### Cấu hình `metro.config.js`

```js
const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  config.resolver.assetExts.push('db'); // them extension
  return config;
})();
```

---

## 5. Expo Snack

**Expo Snack** = playground online (https://snack.expo.dev) -- viết code RN trực tiếp trình duyệt, chạy thử trên web/iOS/Android **không cần cài gì**.

Use case:

- Demo code nhanh
- Share snippet với người khác (như JSFiddle)
- Test thư viện trước khi cài
- Tutorial, education

```jsx
// snack.expo.dev -- copy paste va chay
import { View, Text } from 'react-native';

export default function App() {
  return <View><Text>Hello!</Text></View>;
}
```

---

## 6. Expo Tradeoffs

### Lợi ích Expo

- Setup nhanh, không cần Xcode/Android Studio (cho dev)
- Library Expo (Camera, Notification, FileSystem...) ổn định
- EAS Build -- build cloud, không cần Mac
- EAS Update -- OTA push update
- Tự động manage dependency version

### Hạn chế Expo

- **Không phải mọi native module hoạt động** (nếu dùng Expo Go)
- App size lớn hơn (include tất cả modules)
- Một số native customization khó
- Phụ thuộc Expo SDK version

### Giải pháp -- Expo Prebuild

Từ Expo SDK 48+, có thể `prebuild` để generate `ios/` và `android/` folder -- vẫn dùng Expo tooling nhưng access native code.

```bash
npx expo prebuild         # tao native folder
npx expo run:ios          # build native
```

Kết hợp được "Expo tools + native flexibility".

---

## Khi nào dùng?

- **Bắt đầu Expo khi:**
  - Project mới
  - Team không muốn quản lý native build
  - Cần ship nhanh
  - App không yêu cầu native module đặc biệt
- **RN CLI khi:**
  - Cần native module không hỗ trợ qua Expo
  - Tích hợp với SDK native cụ thể
  - Project legacy chưa Expo
- **Best practice:**
  - **TypeScript template** ngay từ đầu
  - **Expo Router** cho navigation file-based
  - Test trên cả iOS và Android (không chỉ một)
  - Setup ESLint, Prettier từ đầu

---

## Lỗi thường gặp

### Lỗi 1: Quên cài CocoaPods (iOS)

```bash
cd ios && pod install
```

Mỗi lần thêm native dep iOS, phải chạy `pod install`.

### Lỗi 2: Metro cache cũ

```bash
npx react-native start --reset-cache
# hoac
npx expo start -c
```

### Lỗi 3: Android emulator không thấy Metro

```bash
adb reverse tcp:8081 tcp:8081
```

Forward port 8081 từ emulator về máy host.

### Lỗi 4: Sai Node version

RN yêu cầu Node >= 18. Dùng **nvm** để switch:

```bash
nvm install 20
nvm use 20
```

### Lỗi 5: Cài npm package thẳng (Expo)

```bash
# SAI -- co the version conflict
npm install react-native-camera

# DUNG -- Expo check compatible version
npx expo install expo-camera
```

---

## Câu hỏi phỏng vấn

### Câu 1: Expo vs RN CLI -- khi nào dùng cái nào?

**Trả lời:**

- **Expo**: 90% project mới -- setup nhanh, tooling tốt, đủ cho hầu hết use case
- **RN CLI**: khi cần native customization sâu, integrate SDK third-party không có Expo plugin

Có thể start Expo, sau eject sang prebuild khi cần.

### Câu 2: Metro Bundler là gì?

**Trả lời:** Bundler RN -- tương đương Webpack/Vite cho web. Transpile JSX/TS, bundle code, serve qua HTTP cho app. Hot reload, fast refresh, symbolicate error đều qua Metro.

### Câu 3: Expo Go là gì?

**Trả lời:** App có sẵn trên App Store/Play Store -- chạy được mọi project Expo **không cần build**. Quét QR code -> app chạy. Dev iterate cực nhanh. **Hạn chế**: chỉ chạy package có trong Expo SDK -- custom native module không hoạt động.

### Câu 4: Expo Prebuild là gì?

**Trả lời:** Generate `ios/` và `android/` folder từ config `app.json` -- bạn vẫn dùng Expo tools (CLI, EAS) nhưng có thể edit native code. Trung gian giữa managed workflow và bare workflow.

### Câu 5: Khi nào nên eject?

**Trả lời:**

- Cần native module không có Expo plugin
- Cần modify code Android/iOS thủ công
- Tích hợp SDK third-party đặc biệt (Bluetooth, USB...)

Trước eject, kiểm tra **Expo Modules** hoặc **Config Plugin** -- thường không cần eject hoàn toàn.
