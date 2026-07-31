---
sidebar_position: 1
title: "1. Styling -- StyleSheet, Flexbox, Accessibility"
---

# Styling -- Định kiểu trong React Native

RN dùng **StyleSheet** (JS object) thay CSS. **Flexbox** là hệ layout chính. Cũng cần biết **Accessibility** -- không phải nice-to-have, mà yêu cầu cơ bản.

**Tương tự đơn giản:** Style RN giống **viết CSS bằng JavaScript** -- camelCase thay vì kebab-case, value là number (px) hoặc string. Không có cascade, không có pseudo-class -- ít magic hơn web.

---

:::note[Ghi nhớ nhanh]

- ⭐ **RN dùng `StyleSheet.create` (JS object camelCase) thay CSS; Flexbox là hệ layout chính** — validate key lúc dev, object được freeze/tối ưu.
- **Số không có đơn vị (density-independent), không `'px'`** — không có cascade, không pseudo-class (`:hover`/`:focus`).
- **`flexDirection` mặc định `'column'`** (web là `row`); `justifyContent` căn main axis, `alignItems` căn cross axis.
- **Style dạng mảng để combine + điều kiện** — `style={[styles.base, isActive && styles.active]}`; tránh inline (tạo object mới mỗi render).
- **Shadow: iOS (`shadowColor`...) vs Android (`elevation`)** — dùng `Platform.select`; responsive qua `Dimensions`/`useWindowDimensions`.
- ⭐ **Accessibility (`accessibilityLabel`, `accessibilityRole`...) là bắt buộc cho production** — App Store/Play Store kiểm tra.

:::

---

## Mục lục

- [Vì sao RN dùng StyleSheet & Flexbox thay CSS?](#vì-sao-rn-dùng-stylesheet--flexbox-thay-css)
- [1. StyleSheet](#1-stylesheet)
- [2. Inline style và array](#2-inline-style-và-array)
- [3. Flexbox Layout](#3-flexbox-layout)
- [4. Common properties](#4-common-properties)
- [5. Responsive design](#5-responsive-design)
- [6. Accessibility](#6-accessibility)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao RN dùng StyleSheet & Flexbox thay CSS?

**Vấn đề:**

```jsx
// RN khong chay tren trinh duyet -> KHONG co file CSS
// KHONG co cascade/selector, KHONG co don vi px/%/media query nhu web
.title { color: red; }          // SAI -- khong co stylesheet CSS
<div class="title">Hello</div>  // SAI -- khong co class selector

// Nhung van can dinh kieu giao dien (mau, layout, spacing)
```

**Giải pháp:**

```jsx
import { StyleSheet, View, Text, Dimensions } from 'react-native';

// 1. Dinh kieu bang JAVASCRIPT object -- StyleSheet.create toi uu, freeze object
const styles = StyleSheet.create({
  // 2. So KHONG don vi (density-independent), khong dung 'px'
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, color: '#333' },
});

// 3. Layout bang FLEXBOX -- flexDirection mac dinh la 'column' (khac web la 'row')
<View style={[styles.container, { flexDirection: 'row' }]}>
  <Text style={styles.title}>Hello</Text>
</View>

// 4. KHONG cascade -- style gan thang vao component, khong ke thua lung tung
const { width } = Dimensions.get('window'); // kich thuoc man hinh khi can
```

:::tip[Dùng thực tế]

- **Tạo style:** `StyleSheet.create({...})` cho mọi màn hình -- validate key lúc dev, object được tối ưu, tách style khỏi JSX.
- **Layout responsive:** dùng flexbox (`flex`, `justifyContent`, `alignItems`) để chia khung -- co giãn theo mọi kích thước màn hình.
- **Gộp nhiều style:** truyền mảng `style={[styles.base, isActive && styles.active]}` để combine và đặt điều kiện.
- **Kích thước màn hình:** `Dimensions.get('window')` hoặc `useWindowDimensions()` khi cần width/height thật để tính layout.

:::

---

## 1. StyleSheet

```jsx
import { StyleSheet, View, Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
});

function MyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello</Text>
    </View>
  );
}
```

### Tại sao `StyleSheet.create`?

- **Validate** style key lúc dev
- **Optimize**: object được freeze, có thể tái sử dụng
- **Convention**: dễ đọc, tách style khỏi component

---

## 2. Inline style và array

### Inline

```jsx
<View style={{ padding: 16, backgroundColor: '#fff' }} />
```

Tránh inline -- mỗi render tạo object mới (re-render con).

### Array (combine style)

```jsx
<View style={[styles.base, styles.large, { backgroundColor: 'red' }]} />

// Conditional
<Text style={[styles.text, isActive && styles.activeText]} />
```

### Pseudo with Pressable

```jsx
<Pressable
  style={({ pressed }) => [
    styles.button,
    pressed && styles.buttonPressed,
  ]}
>
  ...
</Pressable>
```

---

## 3. Flexbox Layout

RN dùng Flexbox **mặc định cho mọi View** với:

- `display: flex` (default, không cần khai báo)
- `flexDirection: 'column'` (web là row)

### Layout chính

```jsx
<View style={{ flex: 1, flexDirection: 'row' }}>
  <View style={{ flex: 1, backgroundColor: 'red' }} />
  <View style={{ flex: 2, backgroundColor: 'blue' }} />
  <View style={{ flex: 1, backgroundColor: 'green' }} />
</View>
```

`flex: 1` = chiếm 1 phần. `flex: 2` = chiếm 2 phần. Tổng 4 phần.

### Trục chính (main) và phụ (cross)

```
flexDirection: 'column' (default)
  ↓ main axis
  → cross axis

flexDirection: 'row'
  → main axis
  ↓ cross axis
```

### `justifyContent` -- căn theo MAIN axis

```jsx
justifyContent: 'flex-start'     // dau
justifyContent: 'center'          // giua
justifyContent: 'flex-end'        // cuoi
justifyContent: 'space-between'   // 2 ben, khoang giua
justifyContent: 'space-around'    // deu, co padding 2 ben
justifyContent: 'space-evenly'    // deu hoan toan
```

### `alignItems` -- căn theo CROSS axis

```jsx
alignItems: 'stretch'    // (default) full chieu cross
alignItems: 'flex-start'
alignItems: 'center'
alignItems: 'flex-end'
alignItems: 'baseline'
```

### Center theo cả 2 chiều

```jsx
<View style={{
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}}>
  <Text>Giua man hinh</Text>
</View>
```

### `flexWrap`

```jsx
<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
  {items.map(i => <Item key={i.id} />)}
</View>
```

---

## 4. Common properties

### Box

```jsx
{
  width: 200,           // pixel
  height: '100%',        // %
  padding: 16,           // all sides
  paddingHorizontal: 8,  // left + right
  paddingVertical: 4,    // top + bottom
  paddingTop: 10,
  margin: 8,
  marginLeft: 12,
}
```

### Border

```jsx
{
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  borderTopLeftRadius: 16,
  borderStyle: 'dashed',
}
```

### Color & Background

```jsx
{
  backgroundColor: '#fff',     // hex
  backgroundColor: 'red',       // named
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'blue',                // chu (chi Text)
}
```

### Text

```jsx
{
  fontSize: 16,
  fontWeight: 'bold',          // 'normal' | 'bold' | '100'-'900'
  fontStyle: 'italic',
  fontFamily: 'System',
  lineHeight: 24,
  textAlign: 'center',
  textDecorationLine: 'underline',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}
```

### Shadow / Elevation

```jsx
// iOS
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
}

// Android
{
  elevation: 4,
}
```

### Transform

```jsx
{
  transform: [
    { rotate: '45deg' },
    { scale: 1.2 },
    { translateX: 10 },
  ],
}
```

---

## 5. Responsive design

```jsx
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  card: {
    width: width * 0.9,   // 90% screen width
  },
});
```

### Listen orientation change

```jsx
import { useWindowDimensions } from 'react-native';

function MyComponent() {
  const { width, height } = useWindowDimensions(); // auto update

  return <View style={{ width: width / 2 }} />;
}
```

### `PixelRatio`

```jsx
import { PixelRatio } from 'react-native';

const ratio = PixelRatio.get(); // 1, 2, 3
const fontSize = PixelRatio.getFontScale() * 16; // theo accessibility
```

---

## 6. Accessibility

RN cung cấp props cho accessibility (screen reader, label).

```jsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Submit form dang ky"
  accessibilityHint="Bam de gui thong tin"
  accessibilityState={{ disabled: isLoading }}
>
  <Text>Submit</Text>
</Pressable>
```

### Props chính

| Prop                       | Vai trò                          |
| -------------------------- | -------------------------------- |
| `accessible`               | element accessibility focus duy nhất |
| `accessibilityLabel`       | Text screen reader đọc           |
| `accessibilityHint`        | Gợi ý hành động                  |
| `accessibilityRole`        | `button`, `link`, `image`...     |
| `accessibilityState`       | `disabled`, `selected`, `checked`|
| `accessibilityValue`       | Slider value, progress           |

### Test với screen reader

- **iOS**: VoiceOver (Settings -> Accessibility)
- **Android**: TalkBack

---

## Khi nào dùng?

- **StyleSheet.create**: mọi style -- tốt hơn inline
- **Array style**: combine, conditional
- **Flexbox**: layout chính
- **Dimensions / useWindowDimensions**: responsive
- **Accessibility**: bắt buộc cho production app (App Store/Play Store check)
- **Best practice:**
  - Thiết kế **mobile-first** -- không assume desktop layout
  - **Theme/design tokens** -- không hardcode color/size
  - Library UI: **NativeWind** (Tailwind CSS), **Tamagui**, **GluestackUI**, **React Native Paper**
  - Test với screen reader

---

## Lỗi thường gặp

### Lỗi 1: `flex: 1` không hoạt động

```jsx
// SAI -- parent khong co flex
<View>
  <View style={{ flex: 1 }} /> {/* khong an gi */}
</View>

// DUNG
<View style={{ flex: 1 }}>
  <View style={{ flex: 1 }} />
</View>
```

`flex: 1` chỉ work nếu parent có chiều cao (`flex: 1` hoặc `height` cố định).

### Lỗi 2: Unit `px`

```jsx
// SAI -- RN khong dung 'px'
{ width: '200px' }

// DUNG -- number
{ width: 200 }
```

### Lỗi 3: Background image với View

```jsx
// SAI -- View khong co backgroundImage
<View style={{ backgroundImage: 'url(...)' }} />

// DUNG
<ImageBackground source={...} />
```

### Lỗi 4: `position: absolute` mà không có anchor

```jsx
// Dung
<View style={{
  position: 'absolute',
  top: 10,
  right: 10,
}} />
```

Parent phải có `position: 'relative'` (default) hoặc `flex`.

### Lỗi 5: Quên Accessibility

App Store có thể reject nếu thiếu accessibility cho element quan trọng. Luôn add label cho button/input.

---

## Câu hỏi phỏng vấn

### Câu 1: Style RN khác CSS web thế nào?

**Trả lời:**

- **JS object** thay CSS (camelCase, không có kebab-case)
- **Không có cascade** -- style không tự inherit (trừ Text)
- **Không có pseudo-class** (`:hover`, `:focus`)
- **Flexbox mặc định**, `flexDirection: 'column'` default
- **Unit number** (pixel) -- không có `rem`, `em`, `%` ít dùng

### Câu 2: Tại sao dùng `StyleSheet.create`?

**Trả lời:**

- Validate key style lúc dev
- Performance: object frozen, reuse, ID-based pass qua bridge
- Convention -- tách style khỏi component

Vs inline style: inline tạo object mới mỗi render -> child re-render.

### Câu 3: Flexbox `column` mặc định khác web?

**Trả lời:** Web `flexDirection` default là `row`. RN default là `column` -- phù hợp mobile UI thường vertical. Phải chuyển `row` khi cần horizontal layout.

### Câu 4: Shadow iOS vs Android?

**Trả lời:**

- **iOS**: `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`
- **Android**: `elevation` (số)

Phải set cả 2 hoặc dùng `Platform.select`. Không có cross-platform tốt -- library `react-native-shadow` hoặc tự handle.

### Câu 5: Accessibility quan trọng thế nào?

**Trả lời:** **Bắt buộc** cho production:

- App Store / Play Store kiểm tra
- Người khuyết tật dùng được app
- Có thể bị **kiện** theo luật một số nước
- Cải thiện UX cho mọi người (label rõ ràng)

Phải có `accessibilityLabel` cho mọi button/input quan trọng.
