---
sidebar_position: 1
title: "1. Platform Specific Code"
---

# Platform Specific Code -- Code riêng cho từng nền tảng

iOS và Android có behavior khác nhau (haptic, navigation, header...). RN cung cấp **Platform module**, **file extension**, và **react-native-web** để code chạy đúng cho từng platform.

**Tương tự đơn giản:** Giống ổ cắm điện -- Việt Nam dùng 220V, Mỹ dùng 110V. Adapter chuyển đổi cho phù hợp. RN cho phép detect platform và "chuyển đổi" code phù hợp.

---

## Mục lục

- [Vì sao cần code theo platform?](#vì-sao-cần-code-theo-platform)
- [1. Platform Module](#1-platform-module)
- [2. File extensions](#2-file-extensions)
- [3. react-native-web](#3-react-native-web)
- [4. Style theo platform](#4-style-theo-platform)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao cần code theo platform?

**Vấn đề:** Dù RN cho "viết một lần, chạy nhiều nơi", iOS và Android vẫn **khác nhau** về giao diện lẫn hành vi -- shadow vs elevation, nút back vật lý của Android, thanh status, quy ước thiết kế (Human Interface vs Material), và một số API chỉ có ở một bên. Ép giao diện giống hệt nhau khiến app "lạc lõng" với người dùng từng nền tảng.

```jsx
// Ep dung chung -> ca 2 deu khong tu nhien
const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',   // iOS hieu, Android lo
    shadowOpacity: 0.1,    // Android khong render
    elevation: 4,          // iOS lo
  },
});

// Android: nhan nut back vat ly -> thoat app dot ngot (khong xu ly)
```

**Giải pháp:** RN cho phép tách code theo nền tảng đúng chỗ cần: `Platform.OS`/`Platform.select`, file riêng `.ios.tsx`/`.android.tsx` (Metro tự chọn), và kiểm tra version. Phần lớn dùng chung, chỉ tách phần khác biệt.

```jsx
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1 },
      android: { elevation: 4 },
    }),
  },
});

// Version check khi API chi co tu phien ban nhat dinh
if (Platform.OS === 'android' && Platform.Version >= 31) {
  // dung API moi cua Android 12+
}
```

:::tip[Dùng thực tế]

- **Shadow iOS vs elevation Android**: dùng `Platform.select` để bóng đổ hiển thị đúng trên cả hai.
- **Nút back vật lý Android**: lắng nghe `BackHandler` để xử lý quay lại thay vì thoát app đột ngột.
- **Padding theo status bar**: chừa khoảng trên đầu khác nhau (notch iOS vs status bar Android) tránh che nội dung.
- **API chỉ có một nền tảng**: ví dụ haptic, dynamic island... bọc trong `Platform.OS` check để tránh crash bên kia.

:::

---

## 1. Platform Module

```jsx
import { Platform } from 'react-native';

console.log(Platform.OS);              // 'ios' | 'android' | 'web' | 'windows' | 'macos'
console.log(Platform.Version);          // version OS (number iOS, string Android)
console.log(Platform.isPad);            // iPad
console.log(Platform.isTV);             // tvOS, Android TV
```

### Conditional logic

```jsx
const padding = Platform.OS === 'ios' ? 20 : 10;

if (Platform.OS === 'android') {
  // Android specific
}
```

### `Platform.select`

```jsx
const styles = StyleSheet.create({
  header: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 4,
      },
      default: {
        // web, others
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
});
```

---

## 2. File extensions

RN tự **chọn file** theo platform dựa vào extension:

```
Button.tsx              <- chung
Button.ios.tsx          <- iOS only
Button.android.tsx      <- Android only
Button.web.tsx          <- Web only
Button.native.tsx       <- iOS + Android (khong phai web)
```

```jsx
// Khi import
import Button from './Button';

// Tren iOS -> Button.ios.tsx
// Tren Android -> Button.android.tsx
// Tren web -> Button.web.tsx, fallback Button.tsx
```

**Use case**: component khác hoàn toàn giữa platform (Date picker iOS vs Android).

### Ví dụ DatePicker

```jsx
// DatePicker.ios.tsx
import { DatePickerIOS } from 'react-native';
export default function DatePicker(props) { ... }

// DatePicker.android.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
export default function DatePicker(props) { ... }
```

---

## 3. react-native-web

`react-native-web` map RN components -> HTML/CSS:

- `<View>` -> `<div>`
- `<Text>` -> `<span>`
- `<Image>` -> `<img>`

Cho phép **chia sẻ code 70-90%** giữa mobile và web.

### Setup (Expo dễ nhất)

```bash
npx expo start --web
```

Expo có sẵn react-native-web.

### Manual setup (Webpack/Vite)

```bash
npm install react-native-web react-dom
```

```js
// webpack.config.js
module.exports = {
  resolve: {
    alias: { 'react-native$': 'react-native-web' },
    extensions: ['.web.js', '.web.tsx', '.js', '.tsx'],
  },
};
```

### Limitations

- Một số native module không có web equivalent (Camera, Bluetooth)
- Performance không bằng React thuần
- Một số gesture không tự nhiên

---

## 4. Style theo platform

### Shadow

```jsx
const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
```

### Header height

```jsx
const HEADER_HEIGHT = Platform.OS === 'ios' ? 88 : 64;
```

### Font

```jsx
const styles = StyleSheet.create({
  text: {
    fontFamily: Platform.select({
      ios: 'San Francisco',
      android: 'Roboto',
    }),
  },
});
```

---

## Khi nào dùng?

- **Platform module**: Logic đơn giản 1-2 dòng khác nhau
- **File extension**: Component khác **hoàn toàn** (DatePicker, Slider)
- **Platform.select**: Style/value khác nhau gọn
- **react-native-web**: Chia sẻ code với web
- **Best practice:**
  - **Mặc định cross-platform** -- chỉ tách khi thực sự cần
  - Test trên **cả iOS + Android** -- không assume
  - Tránh deep conditional -- abstract thành component riêng
  - Style với `Platform.select` thay if-else

---

## Lỗi thường gặp

### Lỗi 1: Style chỉ test iOS

```jsx
// Mac dinh padding khac iOS/Android -> can check Android
<View style={{ paddingTop: 50 }} /> // iOS ok, Android co the dau
```

Test cả 2 platform.

### Lỗi 2: Quên `Platform.OS` so sánh string

```jsx
// SAI
if (Platform.OS === ios) // ios undefined

// DUNG
if (Platform.OS === 'ios')
```

### Lỗi 3: File `.ios.tsx` không resolve

Metro cache hoặc bundler config sai. Restart:

```bash
npx expo start -c
```

### Lỗi 4: Web không hỗ trợ native module

```jsx
// Crash tren web
import { Camera } from 'expo-camera';

// DUNG -- check Platform
if (Platform.OS !== 'web') {
  // su dung Camera
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Platform module dùng để làm gì?

**Trả lời:** Detect platform runtime (`Platform.OS`) và **conditional logic**. Hữu ích khi behavior nhỏ khác nhau (shadow, padding, font). Với khác biệt lớn, dùng file extension thay vì if-else.

### Câu 2: File extension `.ios.tsx`/`.android.tsx` lợi ích?

**Trả lời:**

- Code **clean** -- không nested if Platform.OS
- Tree-shake -- web bundle không có code iOS/Android
- Dễ maintain -- mỗi platform một file

Phù hợp khi component khác **hoàn toàn** giữa platform.

### Câu 3: react-native-web là gì?

**Trả lời:** Library map RN components -> HTML/CSS -- cho phép RN code chạy trên web browser. Chia sẻ 70-90% code mobile + web. Maintain bởi Facebook/Meta (cùng React Native). Expo built-in.

### Câu 4: Khi nào nên dùng react-native-web?

**Trả lời:**

- Cần app vừa mobile + web nhưng team chỉ làm RN
- Marketing site share với app
- Internal tool dùng cả browser + mobile
- KHÔNG cho app web phức tạp (Next.js tốt hơn)

### Câu 5: Detect tablet/phone?

**Trả lời:**

- `Platform.isPad` -- iPad
- Android: dùng dimension `Dimensions.get('window')` -- check width
- Library: `react-native-device-info`

Responsive design dùng `width` thay vì check device cụ thể.
