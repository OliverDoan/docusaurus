---
sidebar_position: 1
title: "1. Performance Optimization"
---

# Performance -- Tối ưu hiệu năng React Native

App mobile bị đánh giá nghiêm khắc về **mượt mà**. 60fps = tốt, 30fps = lag, < 30 = "app dỏm". Bài này tổng hợp **bottleneck phổ biến** và cách fix.

**Tương tự đơn giản:** Performance giống **xe ô tô** -- engine (JS thread) + bánh xe (UI thread) phải đồng bộ. Lag = bánh xe quay nhanh nhưng engine chậm -- "kéo lê" UX.

---

## Mục lục

- [1. Hiểu Frame Rate](#1-hiểu-frame-rate)
- [2. Common bottleneck](#2-common-bottleneck)
- [3. Speeding up Builds](#3-speeding-up-builds)
- [4. Tối ưu FlatList](#4-tối-ưu-flatlist)
- [5. RAM Bundles + Inline Requires](#5-ram-bundles-inline-requires)
- [6. Image optimization](#6-image-optimization)
- [7. Profiling](#7-profiling)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Hiểu Frame Rate

60fps = 16.67ms/frame. Mỗi frame, app phải làm xong:

- **JS thread**: tính logic, render React
- **UI thread**: layout, draw

Nếu 1 trong 2 **vượt 16ms** -> drop frame -> lag.

### 120Hz iPhone Pro

iPhone 13 Pro trở lên có 120Hz -> 8.33ms/frame. Cần app tối ưu hơn.

### Đo FPS

Dev menu -> **Show Perf Monitor** -- hiển thị JS FPS + UI FPS realtime.

---

## 2. Common bottleneck

### Bottleneck phổ biến

1. **Re-render không cần thiết** -- component update khi props/state không đổi
2. **List dài không virtualize**
3. **Inline function/object** trong JSX -- tạo mới mỗi render
4. **Image lớn** -- không cache, không resize
5. **Animation trên JS thread** -- không dùng `useNativeDriver`
6. **Heavy computation trong render**

### Tránh re-render

```jsx
// Memoize component
const UserCard = React.memo(function UserCard({ user, onPress }) {
  return <Pressable onPress={onPress}>...</Pressable>;
});

// Memoize callback
const handlePress = useCallback((id) => {
  setSelected(id);
}, []);

// Memoize value
const sorted = useMemo(() => users.sort(), [users]);
```

### Tránh inline object/function trong JSX

```jsx
// SAI -- moi render tao moi -> child re-render
<UserCard
  user={user}
  style={{ padding: 10 }}                      // BAD
  onPress={() => navigate('Detail', user.id)}  // BAD
/>

// DUNG
const cardStyle = useMemo(() => ({ padding: 10 }), []);
const onPress = useCallback(() => navigate('Detail', user.id), [user.id]);

<UserCard user={user} style={cardStyle} onPress={onPress} />
```

---

## 3. Speeding up Builds

### Hermes engine

Bật Hermes -- mặc định Spring Boot 0.70+. Nếu chưa:

```json
// android/app/build.gradle
project.ext.react = [
    enableHermes: true,
]
```

iOS Podfile:

```ruby
use_react_native!(
  :path => config[:reactNativePath],
  :hermes_enabled => true
)
```

### New Architecture

```bash
# Expo
EXPO_USE_NEW_ARCHITECTURE=1 npx expo prebuild
```

Bật Fabric + TurboModule -- performance lớn cải thiện.

### Bundle splitting

Split code -> lazy load màn ít dùng:

```jsx
const Settings = React.lazy(() => import('./screens/Settings'));

<Suspense fallback={<ActivityIndicator />}>
  <Settings />
</Suspense>
```

---

## 4. Tối ưu FlatList

```jsx
<FlatList
  data={users}
  keyExtractor={item => item.id}
  renderItem={renderItem}

  // Toi uu
  removeClippedSubviews={true}        // unmount item ngoai viewport
  maxToRenderPerBatch={10}              // 10 item/batch
  windowSize={10}                       // buffer 10 screens
  initialNumToRender={20}                // initial
  updateCellsBatchingPeriod={50}        // batch update 50ms

  // Quan trong nhat -- height co dinh
  getItemLayout={(data, index) => ({
    length: 80,
    offset: 80 * index,
    index,
  })}
/>
```

### renderItem memoize

```jsx
const renderItem = useCallback(({ item }) => (
  <UserRow user={item} />
), []);

const UserRow = React.memo(({ user }) => (
  <View>...</View>
));
```

### FlashList thay thế

```jsx
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={users}
  renderItem={({ item }) => <UserRow user={item} />}
  estimatedItemSize={80}
/>
```

5x nhanh hơn FlatList với recycle view.

---

## 5. RAM Bundles + Inline Requires

### Inline Requires

Lazy load module -- chỉ require khi cần:

```js
// metro.config.js
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: { inlineRequires: true },
    }),
  },
};
```

```jsx
// Thay vi
import { heavy } from './heavy';

// Inline (compiler tu lam khi bat)
function MyScreen() {
  const heavy = require('./heavy');  // lazy
}
```

### RAM Bundle (Android cũ)

Bundle chia nhỏ -- chỉ load module cần. New Architecture dùng cách khác.

---

## 6. Image optimization

### Resize trước khi gửi

Server resize ảnh phù hợp:

```
mobile: 800x600
thumbnail: 200x150
retina: 1600x1200
```

KHÔNG gửi 4K cho display 400x300.

### `expo-image`

```jsx
import { Image } from 'expo-image';

<Image
  source="https://example.com/photo.jpg"
  contentFit="cover"
  transition={300}
  cachePolicy="memory-disk"   // cache cả memory + disk
  placeholder={blurhash}        // smooth load
/>
```

### Format

- **JPEG**: ảnh photo
- **PNG**: icon, transparent
- **WebP**: nhỏ hơn JPEG ~30%, modern
- **AVIF**: nhỏ hơn WebP, mới

Nếu CDN hỗ trợ, dùng WebP/AVIF.

---

## 7. Profiling

### Perf Monitor (in-app)

Dev menu -> **Show Perf Monitor** -- JS FPS, UI FPS, RAM, Views.

### React DevTools Profiler

```bash
npx react-devtools
```

Mở Profiler tab -> record render -> xem component nào chậm.

### Flipper (deprecated)

Trước phổ biến, Meta đã deprecate. Dùng React DevTools + Hermes Inspector thay.

### Hermes Profiler

```jsx
// In dev menu -> Start Sampling Profiler

// Khi xong -> Stop -> file .cpuprofile
// Mo trong Chrome DevTools -> Performance tab
```

### Native profiling

- **iOS**: Instruments (Xcode) -> Time Profiler, Allocations
- **Android**: Android Studio Profiler

---

## Khi nào dùng?

- **Memoize**: component re-render nhiều, props/state phức tạp
- **FlashList**: list > 50 item
- **expo-image**: production, nhiều ảnh
- **useNativeDriver**: mọi animation
- **Hermes**: mặc định
- **New Architecture**: project mới
- **Profile**: khi đã đo có vấn đề
- **Best practice:**
  - **Đo trước, tối ưu sau** -- "Premature optimization is the root of all evil"
  - Test trên **low-end device** (Android giá rẻ)
  - **Bundle size** quan trọng -- analyze với `react-native-bundle-visualizer`

---

## Lỗi thường gặp

### Lỗi 1: Memoize bừa bãi

```jsx
// SAI -- moi component memoize khong loi ich
const Trivial = React.memo(({ text }) => <Text>{text}</Text>);

// Memoize chi co loi khi component nang VA props on dinh
```

### Lỗi 2: Optimize sai chỗ

```jsx
// Bo cong toi uu component khong render nhieu lan
// Bo qua hot path -- list render moi scroll
```

Profile trước, tối ưu hot path.

### Lỗi 3: Console.log production

```jsx
// SAI -- console.log cham, ton memory
console.log('User:', user);

// DUNG -- chi dev
if (__DEV__) console.log('User:', user);

// Hoac dung babel plugin remove
```

### Lỗi 4: Quên cleanup

```jsx
useEffect(() => {
  const sub = api.subscribe(handler);
  return () => sub.unsubscribe();  // PHAI cleanup
}, []);
```

### Lỗi 5: Animation trên JS thread

```jsx
// SAI
Animated.timing(value, { toValue: 1, duration: 300 }).start();

// DUNG -- useNativeDriver
Animated.timing(value, { toValue: 1, duration: 300, useNativeDriver: true }).start();
```

---

## Câu hỏi phỏng vấn

### Câu 1: Tại sao animation `useNativeDriver` quan trọng?

**Trả lời:** Mặc định Animated chạy **JS thread**. Nếu JS busy (React render, network), animation jank. **`useNativeDriver: true`** chuyển animation sang **UI thread** -- chạy độc lập JS, 60fps đảm bảo. Hạn chế: chỉ opacity + transform.

### Câu 2: Re-render nhiều ảnh hưởng performance?

**Trả lời:** Mỗi re-render: React diff virtual DOM, gọi reconciler, layout. Render 100 lần thay vì 1 lần -> CPU/battery tốn. Optimize:

- `React.memo` cho component
- `useMemo`/`useCallback` cho object/function
- Avoid inline object/function trong JSX

### Câu 3: FlatList vs FlashList?

**Trả lời:**

- **FlatList**: virtualize, mount/unmount item -> tốn
- **FlashList** (Shopify): **recycle** item view -- không destroy/create -- 5x nhanh

Production app có list lớn -> FlashList.

### Câu 4: New Architecture lợi ích gì?

**Trả lời:**

- **JSI**: JS gọi native trực tiếp, sync, không qua bridge
- **Fabric**: renderer mới, đồng bộ UI ↔ JS
- **TurboModules**: lazy load, type-safe
- **Codegen**: type-safe interop

Performance lớn, bridge bottleneck biến mất.

### Câu 5: Cách profile RN?

**Trả lời:**

1. **Perf Monitor**: in-app, xem FPS/RAM realtime
2. **React DevTools Profiler**: tìm component render chậm
3. **Hermes Sampling Profiler**: JS thread profiling, mở trong Chrome
4. **Native tools**: Instruments (iOS), Android Studio Profiler

Test trên **low-end device** để thấy bottleneck thực.
