---
sidebar_position: 1
title: "1. Core Components"
---

# Core Components -- Các component cơ bản

React Native cung cấp **bộ component built-in** -- mỗi component map sang **native UI** tương ứng. Bài này tổng hợp các component thường dùng nhất.

**Tương tự đơn giản:** Web có `<div>`, `<span>`, `<input>`, `<button>`... React Native có **bộ tương đương cho mobile**: `<View>`, `<Text>`, `<TextInput>`, `<Pressable>`...

---

## Mục lục

- [1. View-related](#1-view-related)
- [2. Text](#2-text)
- [3. TextInput](#3-textinput)
- [4. Button và Pressable](#4-button-và-pressable)
- [5. Image và ImageBackground](#5-image-và-imagebackground)
- [6. Switch và ActivityIndicator](#6-switch-và-activityindicator)
- [7. StatusBar và Modal](#7-statusbar-và-modal)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. View-related

### `View` -- container chính

Tương đương `<div>` web.

```jsx
<View style={{ padding: 20, backgroundColor: '#fff' }}>
  <Text>Noi dung</Text>
</View>
```

### `SafeAreaView` -- tránh notch/status bar

iPhone có notch, Android có status bar. SafeAreaView tự padding để không bị che.

```jsx
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={{ flex: 1 }}>
  <Text>Khong bi notch che</Text>
</SafeAreaView>
```

Khuyến nghị dùng `react-native-safe-area-context` thay vì `SafeAreaView` built-in (chỉ iOS).

### `KeyboardAvoidingView` -- tránh keyboard che input

```jsx
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  <TextInput />
</KeyboardAvoidingView>
```

iOS: `padding`. Android: `height`.

---

## 2. Text

**Mọi text BUỘC trong `<Text>`** -- không như web `<div>Hello</div>`.

```jsx
<Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
  Hello {name}
</Text>

// Nested
<Text>
  Cau dau.
  <Text style={{ fontWeight: 'bold' }}> Phan bold.</Text>
  Cau sau.
</Text>
```

### Props quan trọng

```jsx
<Text
  numberOfLines={2}              // truncate 2 dong
  ellipsizeMode="tail"            // "..." cuoi
  selectable                       // user co the select copy
  onPress={() => alert('clicked')} // click handler
>
  Long text...
</Text>
```

---

## 3. TextInput

```jsx
import { TextInput } from 'react-native';

const [name, setName] = useState('');

<TextInput
  value={name}
  onChangeText={setName}
  placeholder="Nhap ten"
  style={{ borderWidth: 1, padding: 10 }}
/>
```

### Props phổ biến

| Prop                 | Vai trò                                  |
| -------------------- | ---------------------------------------- |
| `value` / `onChangeText` | Controlled input                     |
| `placeholder`        | Text gợi ý                               |
| `keyboardType`       | `default`, `numeric`, `email-address`    |
| `secureTextEntry`    | Mật khẩu (ẩn ký tự)                      |
| `autoCapitalize`     | `none`, `sentences`, `words`             |
| `autoCorrect`        | true/false                               |
| `maxLength`          | Giới hạn ký tự                           |
| `multiline`          | Textarea                                 |
| `editable`           | Cho phép edit                            |
| `onFocus`/`onBlur`   | Event focus                              |
| `onSubmitEditing`    | Khi nhấn Enter                           |

```jsx
<TextInput
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
  autoCorrect={false}
  placeholder="Email"
/>

<TextInput
  value={password}
  onChangeText={setPassword}
  secureTextEntry
  placeholder="Mat khau"
/>
```

---

## 4. Button và Pressable

### `Button` -- đơn giản

```jsx
<Button
  title="Submit"
  onPress={() => console.log('clicked')}
  color="#007AFF"
/>
```

**Hạn chế:** UI khác nhau iOS/Android, ít customize. Chỉ dùng cho prototype.

### `Pressable` (khuyến nghị)

Linh hoạt hơn -- tự design UI.

```jsx
<Pressable
  onPress={() => console.log('pressed')}
  onLongPress={() => console.log('long pressed')}
  style={({ pressed }) => [
    styles.button,
    { opacity: pressed ? 0.5 : 1 }
  ]}
>
  <Text style={styles.buttonText}>Bam toi</Text>
</Pressable>
```

### `TouchableOpacity` -- pre-Pressable

Cũ hơn, nhưng vẫn dùng phổ biến. Pressable thay thế dần.

```jsx
<TouchableOpacity onPress={...} activeOpacity={0.7}>
  <Text>Bam</Text>
</TouchableOpacity>
```

---

## 5. Image và ImageBackground

### `Image`

```jsx
// Tu URL
<Image
  source={{ uri: 'https://example.com/logo.png' }}
  style={{ width: 100, height: 100 }}
/>

// Tu local file
<Image source={require('./assets/logo.png')} style={{ width: 100, height: 100 }} />

// resizeMode
<Image
  source={...}
  resizeMode="cover"   // cover, contain, stretch, center, repeat
  style={{ width: 200, height: 100 }}
/>
```

**Lưu ý:** Image phải có `width` + `height` cố định (hoặc `flex`).

### `ImageBackground`

```jsx
<ImageBackground
  source={require('./assets/bg.png')}
  style={{ flex: 1, justifyContent: 'center' }}
>
  <Text style={{ color: 'white' }}>Tren background</Text>
</ImageBackground>
```

### Thư viện khuyến nghị

`expo-image` -- cache, transition, performance tốt hơn `Image` built-in.

```jsx
import { Image } from 'expo-image';

<Image
  source="https://example.com/img.jpg"
  contentFit="cover"
  transition={300}
  cachePolicy="memory-disk"
/>
```

---

## 6. Switch và ActivityIndicator

### `Switch` -- toggle

```jsx
const [isOn, setIsOn] = useState(false);

<Switch
  value={isOn}
  onValueChange={setIsOn}
  trackColor={{ false: '#ccc', true: '#4cd964' }}
  thumbColor="#fff"
/>
```

### `ActivityIndicator` -- loading spinner

```jsx
<ActivityIndicator size="large" color="#007AFF" />

// Loading state pattern
{isLoading ? (
  <ActivityIndicator size="large" />
) : (
  <FlatList data={items} ... />
)}
```

---

## 7. StatusBar và Modal

### `StatusBar`

```jsx
import { StatusBar } from 'expo-status-bar'; // tot hon built-in

<StatusBar style="dark" backgroundColor="#fff" />
```

Style: `'auto'`, `'inverted'`, `'light'`, `'dark'`.

### `Modal`

```jsx
const [visible, setVisible] = useState(false);

<Modal
  visible={visible}
  transparent
  animationType="slide"     // slide, fade, none
  onRequestClose={() => setVisible(false)}
>
  <View style={styles.overlay}>
    <View style={styles.content}>
      <Text>Modal content</Text>
      <Pressable onPress={() => setVisible(false)}>
        <Text>Dong</Text>
      </Pressable>
    </View>
  </View>
</Modal>
```

**Khuyến nghị thay thế:** `react-native-modal` (mạnh hơn) hoặc `@gorhom/bottom-sheet` (bottom sheet).

---

## Khi nào dùng?

- **`View`**: container, layout
- **`Text`**: mọi text -- bắt buộc
- **`TextInput`**: form
- **`Pressable`**: button custom (ưu tiên hơn TouchableOpacity)
- **`Image`** / `expo-image`: ảnh
- **`Modal`**: dialog, popup
- **`SafeAreaView`**: layout chính
- **Best practice:**
  - Dùng `react-native-safe-area-context` thay built-in
  - `expo-image` cho production
  - Pressable thay Touchable* cho code mới
  - Style trong `StyleSheet.create()` để cache

---

## Lỗi thường gặp

### Lỗi 1: Text ngoài Text component

```jsx
// SAI -- text raw trong View
<View>Hello</View>
// RN crash

// DUNG
<View><Text>Hello</Text></View>
```

### Lỗi 2: Image không có size

```jsx
// SAI -- Image vo hinh (width = 0)
<Image source={{ uri: '...' }} />

// DUNG -- co size
<Image source={{ uri: '...' }} style={{ width: 100, height: 100 }} />
```

### Lỗi 3: TextInput không controlled

```jsx
// SAI -- khong update value
<TextInput placeholder="Email" />

// DUNG
<TextInput value={email} onChangeText={setEmail} />
```

### Lỗi 4: Quên KeyboardAvoidingView trên iOS

Keyboard che input -> dùng KeyboardAvoidingView.

### Lỗi 5: SafeArea sai trên Android

Built-in `SafeAreaView` chỉ chạy iOS. Dùng `react-native-safe-area-context` -- cross-platform.

---

## Câu hỏi phỏng vấn

### Câu 1: View khác div thế nào?

**Trả lời:**

- **div** (web): render thành HTML element, dùng CSS
- **View** (RN): render thành `UIView` (iOS) / `android.view.View` (Android) -- native UI thực sự, dùng StyleSheet object

View **mặc định flexbox column**, khác div mặc định block.

### Câu 2: Text component bắt buộc?

**Trả lời:** **Có**. RN crash nếu render text raw trong View. Lý do: text trên native phải có font, color, alignment -- View không có thông tin đó. Text component handle render text native.

### Câu 3: Pressable vs TouchableOpacity?

**Trả lời:**

- **Pressable** (mới, RN 0.63+): API thống nhất, hỗ trợ nhiều state (pressed, hovered), customize feedback
- **TouchableOpacity** (cũ): chỉ có opacity feedback, không hỗ trợ state phức tạp

Code mới dùng Pressable. TouchableOpacity vẫn OK, không deprecated.

### Câu 4: Modal vs Bottom Sheet?

**Trả lời:**

- **Modal**: cover full screen, dialog truyền thống
- **Bottom Sheet**: drag từ dưới lên, modern UX (`@gorhom/bottom-sheet`)

Modal built-in OK cho simple case. Bottom sheet cho UX hiện đại (Spotify, Instagram).

### Câu 5: Image cache làm sao?

**Trả lời:**

- **`Image` built-in**: cache đơn giản, không control
- **`expo-image`**: full control cache (memory + disk), placeholder, transition
- **`react-native-fast-image`**: alternative, hiệu năng tốt

Cho app production với nhiều ảnh, **bắt buộc** dùng lib có cache mạnh.
