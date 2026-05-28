---
sidebar_position: 1
title: "1. Development Workflow"
---

# Development Workflow -- Quy trình phát triển

Workflow tốt giúp **iterate cực nhanh** -- sửa code, thấy ngay. Bài này tổng hợp các công cụ và mẹo: chạy trên device, debug, fast refresh, LogBox, sourcemaps, DevTools.

**Tương tự đơn giản:** Workflow giống **dây chuyền lắp ráp** -- mỗi công đoạn (edit, save, reload, debug) phải trơn tru. Một mắt xích chậm -> năng suất giảm cả ngày.

---

## Mục lục

- [1. Chạy trên Simulator/Emulator/Device](#1-chạy-trên-simulatoremulatordevice)
- [2. In-App Developer Menu](#2-in-app-developer-menu)
- [3. Fast Refresh](#3-fast-refresh)
- [4. Debugging](#4-debugging)
- [5. LogBox](#5-logbox)
- [6. Sourcemaps](#6-sourcemaps)
- [7. DevTools](#7-devtools)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Chạy trên Simulator/Emulator/Device

### iOS Simulator (chỉ macOS)

```bash
npx expo start --ios
# hoac
npx react-native run-ios

# Chon device cu the
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### Android Emulator

```bash
# Tao AVD trong Android Studio truoc
npx expo start --android
# hoac
npx react-native run-android
```

### Physical Device

**Expo Go**: quét QR code từ `npx expo start`. Nhanh nhất.

**RN CLI iOS**:

```bash
# Cam phai cap USB, mo Xcode -> Device & Simulators
npx react-native run-ios --device
```

**RN CLI Android**:

```bash
# Bat USB debugging tren dien thoai
adb devices                # kiem tra ket noi
npx react-native run-android
```

---

## 2. In-App Developer Menu

Mở menu dev tools trong app:

| Platform     | Cách mở                                |
| ------------ | -------------------------------------- |
| iOS Simulator| `Cmd + D`                              |
| iOS Device   | Lắc điện thoại                         |
| Android      | `Cmd + M` (Mac) hoặc `Ctrl + M` (Win)  |
| Mọi nơi      | `adb shell input keyevent 82`          |

Menu cung cấp:

- **Reload** -- reload bundle JS
- **Debug** -- mở debugger
- **Enable Fast Refresh** -- live update khi save
- **Show/Hide Inspector** -- xem element như DevTools
- **Show Perf Monitor** -- FPS, memory

---

## 3. Fast Refresh

**Fast Refresh** = hot reload thông minh:

- **Sửa component** -> chỉ component đó render lại, **giữ state**
- **Sửa logic** (không UI) -> reload toàn bộ

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <View>
      <Text>{count}</Text>
      <Button onPress={() => setCount(count + 1)} title="+1" />
    </View>
  );
}
```

Nhấn +1 -> count = 5. Sửa `Text` -> count vẫn = 5 (giữ state).

### Disable Fast Refresh

Khi cần test cold start: Dev Menu -> **Disable Fast Refresh**.

### Hard reload

`Cmd + R` (iOS) / `RR` (Android) hoặc Dev Menu -> Reload.

---

## 4. Debugging

### Console log

```jsx
console.log('Debug:', user);
console.warn('Warning');
console.error('Error');
```

Log hiển thị trong:

- Terminal Metro
- **React Native Debugger** (standalone app)
- **Chrome DevTools**
- **Flipper** (Meta deprecate -- không khuyến nghị nữa)

### Chrome DevTools

Dev Menu -> **Open JS Debugger** (RN CLI cũ) -- mở Chrome tab debug. **Lưu ý:** code chạy trong V8 Chrome, **không phải Hermes** -- behavior có thể khác.

### Hermes Inspector (khuyến nghị)

Hermes engine có debugger built-in. Trong dev menu:

- **Open Debugger** -> mở Chrome DevTools nối với Hermes
- Có Breakpoint, Network, Performance như web

### React DevTools

```bash
npx react-devtools
```

Standalone app xem component tree, props, state, hooks.

### Reactotron

App debug nâng cao -- xem Redux state, API call, AsyncStorage...

---

## 5. LogBox

LogBox = UI hiển thị warning/error **in-app**.

```jsx
// Khi warning xay ra -> overlay vang
console.warn('Deprecated API');

// Error -> overlay do, redbox
throw new Error('Something broke');
```

### Disable specific warning

```jsx
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['Warning: Some specific warning']);

// Hoac tat het (KHONG khuyen khich)
LogBox.ignoreAllLogs();
```

### Phân biệt

- **Yellow Box / Warning**: cảnh báo, app vẫn chạy
- **Red Box / Error**: lỗi nghiêm trọng, app có thể crash

---

## 6. Sourcemaps

Sourcemap = file `.map` map **bundled JS** ngược về **source code gốc**. Cần khi:

- Debug production
- Crash report (Sentry, Bugsnag) show stack đúng file/line

### Generate sourcemap

```bash
# Android
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output index.android.bundle \
  --sourcemap-output index.android.bundle.map

# iOS
npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file index.js \
  --bundle-output main.jsbundle \
  --sourcemap-output main.jsbundle.map
```

Sau khi build production, **upload .map** lên Sentry/Bugsnag để symbolicate.

### Symbolicate thủ công

```bash
npx react-native-cli symbolicate index.android.bundle.map < stacktrace.txt
```

---

## 7. DevTools

| Tool                  | Mục đích                              |
| --------------------- | ------------------------------------- |
| **React DevTools**    | Component tree, props, state, hooks   |
| **Hermes Inspector**  | Breakpoint, network, performance      |
| **Flipper**           | Deprecated, không dùng                |
| **Reactotron**        | Redux, API, AsyncStorage              |
| **Perf Monitor**      | FPS, RAM, bridge throughput           |
| **Element Inspector**| Click element để xem style            |

### Perf Monitor

Dev menu -> **Show Perf Monitor**. Hiển thị:

- **JS thread FPS** -- nên 60
- **UI thread FPS** -- nên 60
- **RAM**
- **Views**

---

## Khi nào dùng?

- **Fast Refresh**: luôn bật (default)
- **Hermes debugger**: debug JS trên dev
- **React DevTools**: inspect component tree
- **Perf Monitor**: check performance bottleneck
- **LogBox**: dev only -- tắt ignore log trong production
- **Best practice:**
  - **Test trên cả iOS + Android** mỗi lần
  - **Real device** trước khi release
  - **Sourcemap** upload vào crash service
  - Không leave `console.log` trong production

---

## Lỗi thường gặp

### Lỗi 1: Fast Refresh không hoạt động

- Component có syntax error -> sửa
- Component không export default đúng
- File outside `src/` Metro không watch

Restart Metro: `npx expo start -c`.

### Lỗi 2: Sửa code không thấy update

Check:

- Metro đang chạy?
- Device cùng network với máy dev?
- Cache: restart `--reset-cache`

### Lỗi 3: Crash không có stack rõ

- Build với sourcemap
- Upload lên Sentry
- Hoặc symbolicate thủ công

### Lỗi 4: Console log spam

```js
if (__DEV__) {
  console.log('Debug only');
}
```

`__DEV__` global -- true trong dev, false production.

### Lỗi 5: Logbox không show

LogBox tự disable trong production. Trong dev, bị tắt:

```js
LogBox.ignoreAllLogs(); // CHECK
```

---

## Câu hỏi phỏng vấn

### Câu 1: Fast Refresh hoạt động thế nào?

**Trả lời:** Metro detect file thay đổi -> push update qua HMR (Hot Module Replacement). React Refresh:

- **Component thay đổi**: re-mount component đó, **giữ state**
- **Hook/logic thay đổi**: reload module
- **Error**: hiển thị redbox, sau khi sửa tự recover

### Câu 2: Hermes Inspector vs Chrome Debugger?

**Trả lời:**

- **Chrome Debugger** (cũ): code chạy trong **V8** của Chrome, không phải Hermes/JSC -- behavior khác production
- **Hermes Inspector** (mới): debug trực tiếp Hermes engine -- đúng môi trường production

Khuyến nghị Hermes Inspector cho project Hermes.

### Câu 3: Sourcemap dùng để làm gì?

**Trả lời:** Map bundle code (đã minify) ngược về source gốc. Quan trọng cho crash report -- stack trace từ user app chỉ có line bundle, sourcemap convert thành line trong file `.tsx` gốc. Upload sourcemap lên Sentry, Bugsnag để auto-symbolicate.

### Câu 4: LogBox là gì?

**Trả lời:** UI hiển thị warning/error in-app:

- **Yellow box** -- warning (deprecated, perf hint)
- **Red box** -- error nghiêm trọng

Có thể `ignoreLogs(pattern)` để ẩn warning đã biết. **Chỉ dev**, production tắt.

### Câu 5: Test trên simulator có đủ không?

**Trả lời:** **Không**. Simulator/Emulator có giới hạn:

- CPU mạnh hơn device thật -> hide bug perf
- Network khác (đặc biệt cellular)
- Không có camera/sensor thật
- Behavior touch khác

Phải test trên **real device** ít nhất 1 lần trước release.
