---
sidebar_position: 1
title: "1. Mobile Applications (React Native)"
---

# Mobile Applications (React Native)

**React Native** là framework cho phép bạn dùng kiến thức React để xây dựng ứng dụng di động chạy thật trên cả iOS và Android, thay vì chỉ chạy trên trình duyệt. Nó dùng cùng cách viết component và hook như React web, nhưng kết xuất ra giao diện gốc (native) của điện thoại. Bài này giới thiệu cách bắt đầu với React Native, công cụ **Expo** (bộ công cụ giúp dựng app nhanh) và cách điều hướng màn hình.

---

## Mục lục

- [Vì sao có React Native?](#vì-sao-có-react-native)
- [React Native là gì?](#react-native-là-gì)
- [Expo (khuyến nghị)](#expo-khuyến-nghị)
- [Bare React Native](#bare-react-native)
- [Navigation](#navigation)
- [Animation: Reanimated](#animation-reanimated)
- [Styling](#styling)

---

## Vì sao có React Native?

**Vấn đề:** Làm app mobile native phải viết **riêng** cho từng nền tảng — iOS
bằng Swift, Android bằng Kotlin. Hai codebase, hai đội, tốn gấp đôi công sức và
chi phí maintain. Nhúng web view vào app thì trải nghiệm kém, cuộn giật, không
có "native feel".

```jsx
// iOS — Swift (codebase 1)
struct ContentView: View {
  var body: some View { Text("Hello") }
}

// Android — Kotlin (codebase 2)
@Composable
fun Content() { Text("Hello") }
```

**Giải pháp:** **React Native** — viết **một lần** bằng React/JS, render ra
**component native thật** (không phải webview) cho cả iOS lẫn Android. Chia sẻ
phần lớn code, dùng lại kiến thức React sẵn có. **Expo** giúp khởi tạo và build
dễ dàng. Đánh đổi: vài tính năng sâu (hardware-heavy) vẫn cần native module.

```jsx
// Một codebase — chạy cả iOS lẫn Android
import { View, Text } from "react-native";

function Content() {
  return (
    <View>
      <Text>Hello</Text>
    </View>
  );
}
```

:::tip[Dùng thực tế]

- **App cross-platform** — một đội build cho cả iOS + Android, tiết kiệm chi phí.
- **Đội web React chuyển sang mobile** — tái dùng kiến thức, không học lại từ đầu.
- **MVP mobile cần ra nhanh** — Expo dựng app và build trong ngày.
- **Chia sẻ logic giữa web và app** — hook, util, schema dùng chung một package.

:::

---

## React Native là gì?

**React Native (RN)** — framework dùng React để build mobile app **native**
cho iOS và Android. Code JS dùng React, render thành native UI thật
(không phải webview).

```jsx
import { View, Text, Button } from "react-native";

function App() {
  return (
    <View>
      <Text>Hello Mobile</Text>
      <Button title="Click" onPress={() => alert("Hi")} />
    </View>
  );
}
```

Khác React web:

| | React Web | React Native |
|--|-----------|--------------|
| Element | `<div>`, `<p>`, `<span>` | `<View>`, `<Text>` |
| Styling | CSS | StyleSheet API (camelCase) |
| Event | `onClick` | `onPress` |
| Layout | Flexbox + Grid | **Flexbox only** |
| Navigation | React Router | React Navigation |
| Animation | CSS / Framer | Reanimated |

---

## Expo (khuyến nghị)

[Expo](https://expo.dev) — framework + platform cho React Native, **default
2026**.

```bash
npx create-expo-app my-app
cd my-app
npx expo start
```

Expo cung cấp:

- **Expo Go app** — chạy trên điện thoại không cần build.
- **EAS Build** — build cloud iOS/Android không cần Mac.
- **OTA Updates** — push JS update không qua app store.
- **Module ecosystem**: camera, location, notifications, sensors...
- **File-based routing** (Expo Router v3+).
- **Web support** — chạy cùng code trên web qua React Native Web.

```
my-app/
├── app/                      # file-based router (Expo Router)
│   ├── _layout.tsx
│   ├── index.tsx             # /
│   └── profile/
│       └── [id].tsx          # /profile/:id
├── assets/
└── package.json
```

:::info[Phân tích]

**Expo vs Bare React Native:**

| | Expo | Bare RN |
|--|------|---------|
| Setup | Cực nhanh | Phức tạp (Xcode, Android Studio) |
| Native code custom | Hạn chế (config plugin) | Tự do |
| Build | Cloud (EAS) | Local |
| OTA Update | Built-in | Tự setup |
| Module ecosystem | **Rộng** | Manual install |
| Bundle size | Lớn hơn | Nhỏ hơn |

**Năm 2026, 90% RN project dùng Expo.** Expo đã giải quyết hầu hết
limitation cũ — có **prebuild** để eject thành bare khi cần, có
**config plugin** để inject native code.

Lý do còn dùng Bare:

- App có native module rất custom (Bluetooth low-level, hardware integration).
- Quan tâm bundle size cực kỳ.
- Team có native expertise.

Còn lại → Expo nhanh hơn nhiều, ít maintain.

:::

---

## Bare React Native

```bash
npx react-native@latest init MyApp
cd MyApp
npx react-native run-ios
npx react-native run-android
```

Yêu cầu:

- **macOS** + Xcode cho iOS.
- **Android Studio** + JDK cho Android.
- Setup CocoaPods, gradle phức tạp.

Phù hợp khi cần native code đặc biệt.

---

## Navigation

[React Navigation](https://reactnavigation.org) — chuẩn de-facto.

```bash
npx expo install @react-navigation/native @react-navigation/native-stack
```

```jsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Detail" component={Detail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function Home({ navigation }) {
  return (
    <Button
      title="Go to Detail"
      onPress={() => navigation.navigate("Detail", { id: 1 })}
    />
  );
}

function Detail({ route }) {
  return <Text>ID: {route.params.id}</Text>;
}
```

Navigator types:

- **Stack** — navigation kiểu push (default mobile).
- **Tab** — bottom tab bar.
- **Drawer** — side menu.

**Expo Router** — alternative file-based:

```
app/
├── index.tsx        # /
├── detail/[id].tsx  # /detail/:id
└── (tabs)/
    ├── _layout.tsx
    ├── home.tsx
    └── profile.tsx
```

```jsx
import { Link, useLocalSearchParams } from "expo-router";

function Home() {
  return <Link href="/detail/1">Go</Link>;
}

function Detail() {
  const { id } = useLocalSearchParams();
  return <Text>ID: {id}</Text>;
}
```

---

## Animation: Reanimated

[React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
— animation chạy trên **UI thread**, không block JS thread.

```bash
npx expo install react-native-reanimated
```

```jsx
import Animated, { useSharedValue, withSpring } from "react-native-reanimated";

function Card() {
  const offset = useSharedValue(0);

  return (
    <>
      <Animated.View style={{ transform: [{ translateX: offset }] }}>
        <Text>Hello</Text>
      </Animated.View>
      <Button
        title="Move"
        onPress={() => { offset.value = withSpring(100); }}
      />
    </>
  );
}
```

**Worklet** — function chạy trên UI thread:

```jsx
import { useSharedValue, useAnimatedStyle } from "react-native-reanimated";

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
```

Reanimated 3 hỗ trợ **shared element transition**, **gesture handler**,
**layout animation** — gần ngang Framer Motion về capability.

---

## Styling

**StyleSheet** — built-in:

```jsx
import { StyleSheet, View, Text } from "react-native";

function Card() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Hello</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    shadowOpacity: 0.1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
```

**Tailwind cho RN** — [NativeWind](https://www.nativewind.dev):

```bash
npm install nativewind
```

```jsx
function Card() {
  return (
    <View className="p-4 bg-white rounded-lg shadow">
      <Text className="text-lg font-bold">Hello</Text>
    </View>
  );
}
```

NativeWind compile Tailwind class → StyleSheet runtime → cùng API như web.

:::tip[Mẹo]

**Stack chuẩn cho RN project 2026:**

- **Expo** (managed workflow).
- **Expo Router** cho navigation.
- **NativeWind** cho styling (Tailwind compat).
- **Zustand** cho state.
- **TanStack Query** cho data fetching.
- **React Native Reanimated** cho animation.
- **React Hook Form + Zod** cho form.
- **react-native-mmkv** cho local storage (nhanh hơn AsyncStorage).
- **Sentry** cho error tracking.

Phần lớn library web (Zustand, TanStack, RHF, Zod) đã compat với RN — code
share giữa web/mobile dễ hơn nhiều so với 5 năm trước.

:::

:::info[Phân tích]

**React Native năm 2026 — landscape:**

- **New Architecture** (Fabric + TurboModules) — đã default trong Expo SDK 51+.
  Performance tốt hơn, integration native dễ hơn.
- **React Native for Web** — chia sẻ code với web qua Expo Web.
- **Skia** (Shopify) — Canvas/2D rendering performant.
- **Tamagui** — UI library tối ưu cho RN + Web.
- **Solito** — share code Next.js + Expo monorepo.

**Khi nào chọn React Native vs Flutter vs Native?**

- **React Native**: team đã React web, cần share code, ecosystem npm.
- **Flutter**: muốn pixel-perfect UI giống nhau 100%, không quan tâm
  bundle nặng hơn.
- **Native (Swift/Kotlin)**: app cần performance cực cao, hardware-heavy
  (AR, game), không quan tâm chi phí maintain 2 codebase.

RN sweet spot: **app business** (banking, e-commerce, social, productivity).

:::

:::warning[Cần lưu ý]

**Không phải mọi web library work trong RN:**

- **`<a>`, `<div>`, `<button>`** → không tồn tại.
- **`window`, `document`, `localStorage`** → không có.
- **DOM-dependent library** → cần version RN riêng.
- **CSS animation** → cần Reanimated/Animated.
- **Fetch** → có, nhưng `Image` lazy loading khác.

Khi share code, isolate **platform-agnostic logic** (hook, util, schema)
vào package riêng. Component có platform-specific extension:

```
Button.tsx          # share
Button.web.tsx      # web override
Button.native.tsx   # mobile override
```

Bundler tự pick file đúng platform.

:::
