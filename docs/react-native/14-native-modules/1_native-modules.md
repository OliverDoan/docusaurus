---
sidebar_position: 1
title: "1. Native Modules"
---

# Native Modules -- Tích hợp code native

Khi RN không có sẵn API bạn cần (Bluetooth đặc biệt, SDK third-party native), bạn viết **Native Module** -- code Swift/Kotlin expose ra JS.

**Tương tự đơn giản:** Native Module giống **adapter điện** -- cắm chân cũ vào ổ chuẩn mới. JS không gọi trực tiếp Swift được -- adapter (native module) giúp bridge.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Check lib trước khi tự viết** — 99% nhu cầu đã có lib npm (`react-native-xxx`) hoặc Expo SDK; chỉ viết native module khi thật cần.
- **Expo Modules API** — cách hiện đại được khuyến nghị để viết native module (Swift/Kotlin), ít boilerplate hơn Bridge classic.
- ⭐ **Bridge vs TurboModule** — Bridge cũ (async, JSON, có overhead); TurboModule (JSI, sync, type-safe, lazy load, ~5x nhanh hơn).
- **Config Plugin** — chỉ modify config native (Info.plist / AndroidManifest) không cần code native, đủ cho ~80% nhu cầu "tích hợp SDK".
- **Native View Component** — render view native (MapView, VideoPlayer custom) trong cây React.

:::

---

## Mục lục

- [Vì sao cần native modules?](#vì-sao-cần-native-modules)
- [1. Khi nào cần Native Module?](#1-khi-nào-cần-native-module)
- [2. Expo Config Plugin](#2-expo-config-plugin)
- [3. Expo Modules API (khuyến nghị)](#3-expo-modules-api-khuyến-nghị)
- [4. Native Module classic (Bridge)](#4-native-module-classic-bridge)
- [5. TurboModule (New Architecture)](#5-turbomodule-new-architecture)
- [6. Native View Component](#6-native-view-component)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao cần native modules?

**Vấn đề:** JavaScript của RN không truy cập được mọi khả năng của thiết bị. Một số API/SDK nền tảng (Bluetooth chuyên sâu, cảm biến đặc thù, thanh toán, SDK bên thứ ba viết bằng native) chỉ tồn tại ở phía native. Ngoài ra, xử lý nặng cần chạy bằng native code (Swift/Kotlin/C++) để đủ nhanh -- JS thuần không kham nổi.

**Giải pháp:** **Native Modules** là cầu nối cho JS gọi sang code native. Cơ chế cũ dùng **bridge** (giao tiếp async qua JSON), còn cơ chế mới **TurboModules + JSI** cho phép JS gọi thẳng native nhanh hơn nhiều. Cũng có thể tạo **native UI component** để render view native trong cây React. Nhờ vậy RN mở rộng tới mọi khả năng của thiết bị.

:::tip[Dùng thực tế]

- Tích hợp SDK native sẵn có: cổng thanh toán (Stripe, ZaloPay), bản đồ, analytics.
- Truy cập Bluetooth/cảm biến đặc thù chưa có lib JS.
- Đưa xử lý nặng (mã hóa, xử lý ảnh/dữ liệu lớn) xuống native cho nhanh.
- Bọc (wrap) thư viện native có sẵn để dùng được từ JS.

:::

---

## 1. Khi nào cần Native Module?

- Truy cập API native chưa có lib (NFC nâng cao, Bluetooth Low Energy đặc biệt)
- Integrate SDK native (Stripe SDK iOS/Android, ZaloPay SDK)
- Performance critical -- xử lý dữ liệu lớn ở native
- Custom UI component dùng native view

**Trước khi tự viết:**

1. Check **npm** xem có lib chưa (`react-native-xxx`)
2. Check **Expo SDK** xem có module chưa
3. Check **community plugins**

99% nhu cầu có lib sẵn -- không cần tự viết.

---

## 2. Expo Config Plugin

Nếu chỉ cần **modify config native** (Info.plist, AndroidManifest.xml), không cần code Swift/Kotlin.

```js
// app.config.js
module.exports = {
  expo: {
    plugins: [
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
          },
        },
      ],
      ['./plugins/with-firebase'],
    ],
  },
};
```

```js
// plugins/with-firebase.js
const { withInfoPlist } = require('@expo/config-plugins');

module.exports = function withFirebase(config) {
  return withInfoPlist(config, (cfg) => {
    cfg.modResults.FirebaseAppDelegateProxyEnabled = false;
    return cfg;
  });
};
```

Chạy `expo prebuild` -> config được apply vào native folder.

---

## 3. Expo Modules API (khuyến nghị)

Cách hiện đại để viết native module trong project Expo.

```bash
npx create-expo-module my-module
```

### iOS (Swift)

```swift
// ios/MyModule.swift
import ExpoModulesCore

public class MyModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyModule")

    Function("hello") { (name: String) -> String in
      return "Hello \(name)"
    }

    AsyncFunction("fetchData") { (url: String) -> [String: Any] in
      // async call
      return ["status": "ok"]
    }

    Events("onChange")
  }
}
```

### Android (Kotlin)

```kotlin
// android/src/main/java/.../MyModule.kt
package expo.modules.mymodule

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MyModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("MyModule")

        Function("hello") { name: String ->
            "Hello $name"
        }

        AsyncFunction("fetchData") { url: String ->
            mapOf("status" to "ok")
        }

        Events("onChange")
    }
}
```

### JavaScript wrapper

```ts
// src/index.ts
import { NativeModulesProxy } from 'expo-modules-core';

const MyModule = NativeModulesProxy.MyModule;

export function hello(name: string): string {
  return MyModule.hello(name);
}

export async function fetchData(url: string) {
  return await MyModule.fetchData(url);
}
```

### Sử dụng

```jsx
import { hello, fetchData } from 'my-module';

console.log(hello('Alice'));
const data = await fetchData('https://api.example.com');
```

---

## 4. Native Module classic (Bridge)

Kiến trúc cũ, vẫn dùng trong RN CLI project.

### iOS (Objective-C)

```objc
// MyNativeModule.m
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(MyNativeModule, NSObject)

RCT_EXTERN_METHOD(hello:(NSString *)name
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
```

```swift
// MyNativeModule.swift
@objc(MyNativeModule)
class MyNativeModule: NSObject {
  @objc func hello(_ name: String,
                   resolver resolve: RCTPromiseResolveBlock,
                   rejecter reject: RCTPromiseRejectBlock) {
    resolve("Hello \(name)")
  }
}
```

### Android (Kotlin)

```kotlin
// MyNativeModule.kt
class MyNativeModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
    override fun getName() = "MyNativeModule"

    @ReactMethod
    fun hello(name: String, promise: Promise) {
        promise.resolve("Hello $name")
    }
}

// Package
class MyPackage : ReactPackage {
    override fun createNativeModules(context: ReactApplicationContext) =
        listOf(MyNativeModule(context))
    override fun createViewManagers(context: ReactApplicationContext) = emptyList()
}
```

### JS

```jsx
import { NativeModules } from 'react-native';

const { MyNativeModule } = NativeModules;
const result = await MyNativeModule.hello('Alice');
```

---

## 5. TurboModule (New Architecture)

Native module thế hệ mới qua **JSI**. Yêu cầu **codegen** từ TypeScript spec.

### Spec TS

```ts
// MyTurboSpec.ts
import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  hello(name: string): string;
  fetchData(url: string): Promise<Object>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('MyTurboModule');
```

Codegen sinh interface native -> implement Swift/Kotlin.

**Lợi ích:**

- **Sync call** -- không qua bridge async
- **Type-safe** -- TS spec đảm bảo
- **Lazy load** -- chỉ load khi cần
- Performance tốt hơn ~5x

---

## 6. Native View Component

Khi cần component UI native không có sẵn (MapView, VideoPlayer custom).

### Expo Modules API

```swift
// MyView.swift
import ExpoModulesCore

public class MyViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyViewModule")

    View(MyView.self) {
      Prop("color") { (view, color: UIColor) in
        view.backgroundColor = color
      }

      Events("onTap")
    }
  }
}

class MyView: ExpoView {
  let onTap = EventDispatcher()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    // setup UI
  }
}
```

### JS

```jsx
import { requireNativeViewManager } from 'expo-modules-core';

const NativeView = requireNativeViewManager('MyViewModule');

<NativeView color="red" onTap={() => console.log('tap')} style={{ width: 100, height: 100 }} />
```

---

## Khi nào dùng?

- **Config Plugin**: chỉ cần modify Info.plist/AndroidManifest
- **Expo Modules API**: project Expo, cần native code
- **Bridge Native Module**: project RN CLI, legacy
- **TurboModule**: New Architecture, performance critical
- **Native View**: UI native custom
- **Best practice:**
  - **Ưu tiên Expo Modules API** -- modern, cross-platform
  - Type-safe TypeScript spec
  - Test trên cả iOS + Android
  - Document kỹ cách sử dụng

---

## Lỗi thường gặp

### Lỗi 1: Quên expose method

```objc
// Phai co RCT_EXPORT_METHOD hoac RCT_EXTERN_METHOD
RCT_EXPORT_METHOD(hello:(NSString *)name) { ... }
```

```kotlin
// Phai co @ReactMethod
@ReactMethod
fun hello(name: String, promise: Promise) { ... }
```

### Lỗi 2: Thread issue

```swift
// Native module mac dinh chay tren queue rieng
// Update UI phai tren main thread
DispatchQueue.main.async {
  // update UI
}
```

### Lỗi 3: Quên Package register (Android)

```kotlin
// MainApplication.kt
override fun getPackages(): List<ReactPackage> = listOf(
    MainReactPackage(),
    MyPackage(),  // them o day
)
```

### Lỗi 4: Linking trên iOS

```bash
cd ios && pod install
```

Mỗi lần thêm native dep iOS, phải `pod install`.

### Lỗi 5: TypeScript spec sai

Codegen strict -- types không match -> build fail. Check spec đúng với native implementation.

---

## Câu hỏi phỏng vấn

### Câu 1: Khi nào cần Native Module?

**Trả lời:**

- Truy cập API native không có lib
- Tích hợp SDK third-party native
- Performance critical xử lý dữ liệu native
- Custom UI dùng native view

99% case có lib npm sẵn -- check trước khi tự viết.

### Câu 2: Bridge vs TurboModule?

**Trả lời:**

- **Bridge** (cũ): JS ↔ Native qua message JSON, **async**, có overhead
- **TurboModule** (New Architecture): JSI, **sync**, type-safe, lazy load, ~5x nhanh hơn

Project mới ưu tiên TurboModule.

### Câu 3: Expo Modules API là gì?

**Trả lời:** Framework hiện đại để viết native module trong project Expo. API thống nhất iOS + Android, swift/kotlin, hỗ trợ TurboModule, ít boilerplate hơn Bridge classic. Khuyến nghị cho mọi project Expo.

### Câu 4: Config Plugin khác Native Module?

**Trả lời:**

- **Config Plugin**: chỉ modify file config (Info.plist, AndroidManifest, Gradle) -- không có code native
- **Native Module**: code Swift/Kotlin actual logic

Config Plugin đủ cho 80% nhu cầu "tích hợp SDK" -- chỉ cần config setup.

### Câu 5: Khi nào nên publish native module?

**Trả lời:**

- Code dùng nhiều project trong company
- Open-source cho cộng đồng
- Tách concern (1 repo, 1 trách nhiệm)

Trước khi publish: viết doc, test cả iOS + Android, semver, CI.
