---
sidebar_position: 1
title: "1. Interactions -- Touch, Gesture, Animation"
---

# Interactions -- Tương tác trong React Native

Mobile app **phụ thuộc nặng** vào tương tác: tap, swipe, pinch, drag, animation. RN có **Touchables**, **PanResponder**, **react-native-gesture-handler**, **Animated**, **react-native-reanimated** -- mỗi cái cho cấp độ khác nhau.

**Tương tự đơn giản:** Tương tác là **ngôn ngữ cơ thể** của app. Tap là gật đầu, swipe là vẫy tay, animation là biểu cảm khuôn mặt. App "biết nói chuyện" tốt = trải nghiệm tốt.

---

## Mục lục

- [Vì sao có hệ thống cảm ứng & cử chỉ riêng?](#vì-sao-có-hệ-thống-cảm-ứng--cử-chỉ-riêng)
- [1. Touchables](#1-touchables)
- [2. Gesture Handler](#2-gesture-handler)
- [3. ScrollView / FlatList gestures](#3-scrollview-flatlist-gestures)
- [4. Animated API](#4-animated-api)
- [5. React Native Reanimated](#5-react-native-reanimated)
- [6. Deep Linking](#6-deep-linking)
- [7. Push Notifications](#7-push-notifications)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao có hệ thống cảm ứng & cử chỉ riêng?

**Vấn đề:** Trên mobile người dùng tương tác bằng **chạm và cử chỉ** (tap, long-press, vuốt, kéo, pinch) chứ không phải click chuột như web. Mỗi chạm cần **phản hồi cảm ứng tự nhiên** (ripple trên Android, mờ opacity trên iOS), và cử chỉ phức tạp phải chạy **mượt 60fps**. Nếu xử lý trên JS thread, mỗi frame phải qua bridge -- JS thread bận một chút là giật ngay.

```jsx
// Dung onClick + xu ly tay tren JS thread - giat lag
<View onClick={handleClick}>          // khong co onClick tren mobile!
  <Text>Bam</Text>
</View>

// PanResponder chay JS thread - keo bi giat khi JS busy
const responder = PanResponder.create({
  onPanResponderMove: (e, gesture) => {
    setX(gesture.dx);                  // setState moi frame -> re-render -> lag
  },
});
```

**Giải pháp:** RN có **API cảm ứng riêng** chia theo cấp độ. `Pressable` / `TouchableOpacity` cho chạm cơ bản kèm phản hồi (opacity, ripple). Cử chỉ phức tạp dùng **react-native-gesture-handler** + **Reanimated** chạy thẳng trên **UI thread** -- không qua JS bridge mỗi frame, nên mượt ngay cả khi JS bận.

```jsx
// Cham co ban + phan hoi tu nhien
<Pressable style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
  <Text>Bam</Text>
</Pressable>

// Cu chi phuc tap chay tren UI thread - keo muot 60fps
const offset = useSharedValue(0);
const pan = Gesture.Pan().onUpdate((e) => {
  'worklet';                           // chay UI thread, khong qua bridge
  offset.value = e.translationX;
});
```

:::tip[Dùng thực tế]

- **Nút bấm có hiệu ứng nhấn**: `Pressable` đổi opacity khi `pressed`, hoặc `TouchableHighlight` đổi màu nền.
- **Swipe-to-delete**: `Swipeable` của gesture-handler -- vuốt hàng để lộ nút Xoá.
- **Kéo-thả & pinch-to-zoom**: `Gesture.Pan()` / `Gesture.Pinch()` + Reanimated cho ảnh, thẻ.
- **Bottom sheet vuốt**: kết hợp `Gesture.Pan()` + `useSharedValue` để kéo sheet lên/xuống mượt 60fps.

:::

---

## 1. Touchables

### `Pressable` (khuyến nghị)

```jsx
<Pressable
  onPress={() => console.log('tap')}
  onLongPress={() => console.log('long press')}
  onPressIn={() => console.log('press in')}
  onPressOut={() => console.log('press out')}
  hitSlop={10}                          // mo rong vung touch
  delayLongPress={500}
  style={({ pressed }) => ({
    opacity: pressed ? 0.6 : 1,
  })}
>
  <Text>Bam toi</Text>
</Pressable>
```

### TouchableOpacity / TouchableHighlight

```jsx
<TouchableOpacity onPress={...} activeOpacity={0.7}>
  <Text>Bam</Text>
</TouchableOpacity>

<TouchableHighlight onPress={...} underlayColor="#ddd">
  <Text>Bam</Text>
</TouchableHighlight>
```

---

## 2. Gesture Handler

**`react-native-gesture-handler`** -- thư viện gesture mạnh, native performance.

```bash
npm install react-native-gesture-handler
```

```jsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const tap = Gesture.Tap().onEnd(() => console.log('tapped'));
const longPress = Gesture.LongPress().onStart(() => console.log('long'));
const pan = Gesture.Pan().onUpdate(e => console.log(e.translationX));
const pinch = Gesture.Pinch().onUpdate(e => console.log(e.scale));

<GestureDetector gesture={tap}>
  <Animated.View style={...} />
</GestureDetector>
```

### Combine gestures

```jsx
const composed = Gesture.Simultaneous(pan, pinch);
const sequential = Gesture.Exclusive(tap, longPress);

<GestureDetector gesture={composed}>
  ...
</GestureDetector>
```

---

## 3. ScrollView / FlatList gestures

```jsx
<ScrollView
  onScroll={(e) => {
    const y = e.nativeEvent.contentOffset.y;
    setScrollY(y);
  }}
  scrollEventThrottle={16}        // 60fps
  onScrollBeginDrag={() => {}}
  onScrollEndDrag={() => {}}
  onMomentumScrollEnd={() => {}}
>
  ...
</ScrollView>
```

### Pull to refresh -- xem section 6 (Lists)

### Swipe to delete

Dùng `react-native-gesture-handler/Swipeable`:

```jsx
import { Swipeable } from 'react-native-gesture-handler';

<Swipeable
  renderRightActions={() => (
    <Pressable onPress={onDelete}>
      <Text>Xoa</Text>
    </Pressable>
  )}
>
  <UserRow user={user} />
</Swipeable>
```

---

## 4. Animated API

API built-in của RN.

```jsx
import { Animated, Easing } from 'react-native';

function FadeIn({ children }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,        // chay tren native thread
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity }}>
      {children}
    </Animated.View>
  );
}
```

### Animation types

```jsx
Animated.timing(value, { toValue: 1, duration: 300 });
Animated.spring(value, { toValue: 1, friction: 5 });
Animated.decay(value, { velocity: 0.5 });

// Sequence
Animated.sequence([anim1, anim2]).start();

// Parallel
Animated.parallel([anim1, anim2]).start();

// Loop
Animated.loop(anim).start();
```

### `useNativeDriver`

```jsx
useNativeDriver: true   // chay tren UI thread - mượt
```

**Chỉ cho**: opacity, transform (translate, scale, rotate). KHÔNG cho layout (width, height, padding).

---

## 5. React Native Reanimated

**Reanimated 3** -- animation framework hiện đại, chạy hoàn toàn trên UI thread.

```bash
npm install react-native-reanimated
```

```jsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

function Demo() {
  const offset = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <>
      <Animated.View style={[styles.box, animatedStyle]} />
      <Button
        title="Move"
        onPress={() => {
          offset.value = withSpring(Math.random() * 200);
        }}
      />
    </>
  );
}
```

### Worklet

Function chạy trên UI thread.

```jsx
const tap = Gesture.Tap().onStart(() => {
  'worklet';
  offset.value = withSpring(100);
});
```

**Lợi thế Reanimated:**

- 60fps đảm bảo
- Không qua bridge -- gesture-driven animation mượt
- Composable với gesture-handler

---

## 6. Deep Linking

Cho phép URL mở app cụ thể: `myapp://product/123`.

### Expo Router (file-based, dễ nhất)

```typescript
// app/product/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function Product() {
  const { id } = useLocalSearchParams();
  return <Text>Product {id}</Text>;
}
```

URL `myapp://product/123` -> auto map.

### React Navigation manual

```jsx
import { Linking } from 'react-native';

const linking = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      Home: '',
      Product: 'product/:id',
    },
  },
};

<NavigationContainer linking={linking}>
  ...
</NavigationContainer>
```

### Mở link

```jsx
import { Linking } from 'react-native';

Linking.openURL('tel:+84901234567');
Linking.openURL('mailto:a@b.com');
Linking.openURL('https://google.com');
```

---

## 7. Push Notifications

Notification từ server gửi đến device khi app không mở.

### Expo Notifications (dễ nhất)

```bash
npx expo install expo-notifications
```

```jsx
import * as Notifications from 'expo-notifications';

// Setup
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Xin permission
const { status } = await Notifications.requestPermissionsAsync();

// Lay token gui server
const token = (await Notifications.getExpoPushTokenAsync()).data;

// Listen
Notifications.addNotificationReceivedListener(notification => {
  console.log('received', notification);
});

Notifications.addNotificationResponseReceivedListener(response => {
  console.log('tap', response);
});
```

Server gửi push qua Expo Push API (https://exp.host/--/api/v2/push/send).

### Native (Firebase Cloud Messaging)

`@react-native-firebase/messaging` -- cho production scale.

---

## Khi nào dùng?

- **Pressable**: button cơ bản
- **react-native-gesture-handler**: gesture phức tạp (swipe, pinch, drag)
- **Animated**: animation đơn giản, transition
- **Reanimated**: animation phức tạp, gesture-driven, performance critical
- **Deep linking**: SEO, share link, marketing
- **Push notifications**: re-engage user
- **Best practice:**
  - **useNativeDriver: true** mọi khi có thể
  - Reanimated cho gesture-driven animation
  - Test deep link trước khi release
  - Xin permission notification đúng lúc (không ngay khi mở app)

---

## Lỗi thường gặp

### Lỗi 1: Quên `useNativeDriver`

```jsx
// CHAM -- chay JS thread
Animated.timing(opacity, { toValue: 1, duration: 300 }).start();

// MUOT
Animated.timing(opacity, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true,
}).start();
```

### Lỗi 2: useNativeDriver với layout property

```jsx
// SAI -- layout property khong support useNativeDriver
Animated.timing(width, {
  toValue: 200,
  useNativeDriver: true, // ERROR
});

// DUNG -- dung scale thay vi width
transform: [{ scale: scaleValue }]
```

### Lỗi 3: Gesture-handler không setup root

```jsx
// SAI -- gesture-handler can wrap root
export default App;

// DUNG
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MyApp />
    </GestureHandlerRootView>
  );
}
```

### Lỗi 4: Push notification iOS không hoạt động

- Phải có APNs certificate setup
- iOS Simulator **không nhận push** -- test trên real device
- Permission flow chính xác

### Lỗi 5: Deep link không bắt được khi app đóng

Phải handle cả 2 case:

- App đang mở: `Linking.addEventListener('url', ...)`
- App đóng: `Linking.getInitialURL()`

---

## Câu hỏi phỏng vấn

### Câu 1: Animated API vs Reanimated?

**Trả lời:**

- **Animated** (built-in): cũ, animation chạy được trên native với `useNativeDriver`, hạn chế (chỉ transform/opacity)
- **Reanimated** (v2/v3): mới, **worklet** chạy hoàn toàn trên UI thread, gesture-driven, performance đỉnh

Project mới ưu tiên Reanimated cho animation phức tạp.

### Câu 2: `useNativeDriver` lợi ích gì?

**Trả lời:** Animation chạy trên **UI thread** (native), không qua JS thread + bridge. **60fps đảm bảo** ngay cả khi JS busy. Chỉ hỗ trợ: opacity, transform. Layout (width, height) không hỗ trợ -- dùng transform scale thay.

### Câu 3: Gesture handler vs PanResponder?

**Trả lời:**

- **PanResponder** (built-in cũ): chạy trên JS thread, lag với gesture phức tạp
- **react-native-gesture-handler**: native gesture, mượt mà, kết hợp tốt với Reanimated

Project mới luôn dùng gesture-handler.

### Câu 4: Worklet trong Reanimated là gì?

**Trả lời:** Function chạy trên **UI thread** (không phải JS thread). Khai báo bằng directive `'worklet';`. Cho phép sync access shared value, animation 60fps không phụ thuộc JS busy.

```js
function update() {
  'worklet';
  offset.value = 100;
}
```

### Câu 5: Push notification flow?

**Trả lời:**

1. User cấp permission (`requestPermissionsAsync`)
2. App lấy **device token** từ Apple/Google
3. Send token lên server lưu
4. Khi cần push: server gọi APNs (iOS) hoặc FCM (Android) với token + payload
5. Apple/Google deliver notification đến device
6. App nhận, hiển thị, hoặc handle khi user tap

Expo Push API trừu tượng hóa APNs + FCM thành 1 endpoint.
