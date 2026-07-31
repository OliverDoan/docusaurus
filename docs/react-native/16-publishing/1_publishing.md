---
sidebar_position: 1
title: "1. Publishing -- App Store và Play Store"
---

# Publishing -- Phát hành app lên store

Sau khi dev xong, **đưa app lên store** là bước cuối. Quy trình **iOS App Store** và **Google Play Store** khác nhau -- review iOS chặt hơn nhiều.

**Tương tự đơn giản:** Publish app giống **bán hàng vào siêu thị**. Phải đóng gói đẹp (build), có giấy phép (cert, signing), qua kiểm định (review) -- mới được lên kệ.

---

:::note[Ghi nhớ nhanh]

- ⭐ **EAS Build** — build iOS + Android trên cloud KHÔNG cần Mac, tự quản lý cert/keystore; `eas submit` nộp store tự động.
- **Code signing** — iOS cần Distribution Certificate + Provisioning Profile; Android cần Keystore — mất keystore là không update được app, phải backup kỹ.
- **Review store** — Apple 1-3 ngày rất nghiêm (UI native, IAP, privacy); Google nhanh hơn; Play Store bắt buộc `.aab`.
- ⭐ **OTA Updates (EAS Update / CodePush)** — vá lỗi JS nóng không qua review, nhưng chỉ đổi JS (no native) và không được "bait and switch".
- **Phased release** — release tăng dần 1% → 100% để bắt bug sớm (crash rate) và rollback được khi có sự cố.

:::

---

## Mục lục

- [Vì sao phát hành app phức tạp?](#vì-sao-phát-hành-app-phức-tạp)
- [1. Chuẩn bị chung](#1-chuẩn-bị-chung)
- [2. EAS Build (Expo) -- khuyến nghị](#2-eas-build-expo-khuyến-nghị)
- [3. Apple App Store](#3-apple-app-store)
- [4. Google Play Store](#4-google-play-store)
- [5. Code signing](#5-code-signing)
- [6. OTA Updates (EAS Update)](#6-ota-updates-eas-update)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao phát hành app phức tạp?

**Vấn đề:** Web deploy xong là người dùng truy cập được ngay. App mobile thì không -- mỗi lần ra mắt phải vượt qua 4 rào cản:

- **Build nhị phân native** cho cả iOS lẫn Android. Build iOS bắt buộc cần **macOS + Xcode** -- dev dùng Windows/Linux gần như bó tay.
- **Ký số (code signing)** rắc rối: iOS cần Distribution Certificate + Provisioning Profile; Android cần Keystore. Sai cert/profile là build hỏng, mất keystore là không update được app.
- **Kiểm duyệt store**: Apple review 1-3 ngày (rất nghiêm), Google vài giờ - vài ngày. Có thể bị **từ chối** vì privacy, UI web-like, IAP...
- **Mỗi bản vá nhỏ** cũng phải build lại + nộp store + chờ duyệt lại từ đầu.

**Giải pháp:** Công cụ hoá toàn bộ quy trình -- build trên cloud, để dịch vụ quản lý signing, và đẩy bản vá JS thẳng tới máy người dùng (OTA) không qua store.

```bash
# Build iOS + Android trên cloud, KHÔNG cần Mac (EAS Build)
eas build --platform all --profile production

# Nộp store tự động (App Store Connect / Play Console)
eas submit --platform ios --latest
eas submit --platform android --latest

# Vá lỗi JS nóng, KHÔNG qua review (EAS Update / CodePush)
eas update --branch production --message "Fix login bug"
```

:::tip[Dùng thực tế]

- **Dev xài Windows** vẫn build được app iOS: dùng EAS Build chạy trên máy Mac ảo của Expo, nhận về file `.ipa`.
- **CI/CD tự động**: mỗi lần tag release, pipeline chạy `eas build` rồi `eas submit` -- không thao tác tay.
- **Vá lỗi nóng**: phát hiện bug login lúc 11h đêm, đẩy `eas update` là user nhận bản vá ở lần mở app kế tiếp, khỏi chờ Apple/Google duyệt vài ngày.
- **Quản lý credential**: để EAS tự tạo + giữ certificate/keystore, tránh rủi ro mất keystore khiến app không update được nữa.

:::

---

## 1. Chuẩn bị chung

### Checklist trước publish

- [ ] **Icon** (multiple sizes), **Splash screen**
- [ ] **App name**, **bundle identifier** (com.company.app)
- [ ] **Version** (1.0.0), **build number**
- [ ] **Privacy Policy URL** (cần cho cả 2 store)
- [ ] **Terms of Service** (recommend)
- [ ] **App description** (multilingual)
- [ ] **Screenshots** (đủ size yêu cầu)
- [ ] **Test trên real device** -- không chỉ simulator
- [ ] **Remove `console.log`**, debug code
- [ ] **Crash reporting** (Sentry, Bugsnag)
- [ ] **Analytics** (Amplitude, Mixpanel)

### `app.json` (Expo)

```json
{
  "expo": {
    "name": "My App",
    "slug": "my-app",
    "version": "1.0.0",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.mycompany.myapp",
      "buildNumber": "1",
      "supportsTablet": true
    },
    "android": {
      "package": "com.mycompany.myapp",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    }
  }
}
```

---

## 2. EAS Build (Expo) -- khuyến nghị

**EAS Build** = Expo cloud build service. Build cả iOS + Android **không cần Mac**.

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### `eas.json`

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

### Build

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production

# Ca 2
eas build --platform all
```

EAS chạy build trên cloud (~10-20 phút), trả về URL download `.ipa` (iOS) / `.aab` (Android).

### Submit lên store

```bash
eas submit --platform ios --latest
eas submit --platform android --latest
```

Tự động upload lên App Store Connect / Play Console.

---

## 3. Apple App Store

### Yêu cầu

- **Apple Developer Account** ($99/năm)
- **Mac** với Xcode (hoặc dùng EAS Build)
- **App Store Connect** account
- **Privacy info** -- declare data collection

### Quy trình

1. **Tạo App ID** -- developer.apple.com -> Identifiers
2. **Tạo App** trên App Store Connect
3. **Build** với EAS hoặc Xcode
4. **Upload** qua EAS Submit hoặc Transporter app
5. **TestFlight** -- internal/external testing
6. **Submit for Review** -- Apple review 1-3 ngày
7. **Release** -- manual hoặc auto

### Review guidelines

Apple review **rất nghiêm**:

- App phải có **giá trị thực sự** (không clone, không spam)
- **UI native-like** -- không web wrapper
- **Login -- Apple Sign-In** bắt buộc nếu có social login khác
- **In-App Purchase** cho digital goods -- không dùng Stripe/Paypal
- **Privacy** -- explain data collection, ATT (App Tracking Transparency)

### TestFlight

Cho phép 10000 external tester. Beta test 90 ngày.

```bash
eas submit --platform ios --latest
# App build len TestFlight
```

---

## 4. Google Play Store

### Yêu cầu

- **Google Play Developer Account** ($25 one-time)
- **Privacy Policy URL**
- **App Bundle (.aab)** thay vì APK (since 2021)

### Quy trình

1. **Tạo app** trên Play Console
2. **Build .aab** với EAS hoặc Gradle
3. **Upload** lên Play Console
4. **Set up Store listing** (description, screenshots, content rating)
5. **Internal Testing** -> **Closed Testing** -> **Open Testing** -> **Production**
6. **Review** -- Google nhanh hơn Apple (vài giờ - vài ngày)

### Build .aab manual

```bash
cd android
./gradlew bundleRelease
# File: android/app/build/outputs/bundle/release/app-release.aab
```

### Signing

Google Play yêu cầu signing key. Có 2 cách:

- **Play App Signing** (khuyến nghị): Google quản lý key
- **Upload key** + **App signing key** riêng

---

## 5. Code signing

### iOS

- **Distribution Certificate** -- ký app
- **Provisioning Profile** -- match cert + app ID + device

EAS Build tự quản lý cert, KHÔNG cần Mac.

### Android

- **Keystore** (`.jks` file)
- **Key alias** + password

```bash
keytool -genkeypair -v -keystore my-key.jks -alias my-alias -keyalg RSA -keysize 2048 -validity 10000
```

**QUAN TRỌNG**: backup keystore. Mất = không update được app, phải release app mới.

EAS Build tạo + quản lý keystore tự động.

---

## 6. OTA Updates (EAS Update)

Push update **không qua store review** -- chỉ JS bundle (không native).

```bash
eas update --branch production --message "Fix login bug"
```

### Workflow

```
App user        Server EAS
   |                |
   | check update   |
   |--------------->|
   |  new bundle    |
   |<---------------|
   |  apply         |
```

App tự check update khi launch -> apply lúc next launch.

### Hạn chế

- **Chỉ JS code** thay đổi (no native)
- Vẫn cần follow App Store policy (không phép thêm feature mới ngầm)
- iOS 4.5: changes must be **minor** -- không "lừa" reviewer

### Alternative -- CodePush (Microsoft)

```bash
npm install react-native-code-push
```

Tương tự EAS Update, nhưng cho RN CLI project.

---

## Khi nào dùng?

- **EAS Build**: Expo project -- gần như mọi case
- **Xcode/Gradle**: RN CLI project, custom build
- **TestFlight/Internal Testing**: beta test trước release
- **EAS Update**: fix bug nhỏ nhanh, không chờ review
- **Best practice:**
  - **Beta test** kỹ trước production
  - **Crash reporting** từ ngày 1
  - **Versioning** tự động (`autoIncrement`)
  - **CI/CD** -- auto build + submit mỗi tag
  - **Phased release** -- release 1% -> 100% theo thời gian

---

## Lỗi thường gặp

### Lỗi 1: Apple reject -- thiếu Privacy

```
App có thu thập data nhưng không declare trong App Privacy section.
```

Vào App Store Connect -> App Privacy -> declare đầy đủ.

### Lỗi 2: Bundle ID đã tồn tại

`com.example.app` đã có ai dùng. Đổi sang `com.yourcompany.app`.

### Lỗi 3: Mất keystore Android

Mất = không update app được. **Luôn backup** keystore + password vào nơi an toàn (1Password, hardware drive).

### Lỗi 4: Build fail vì native dependency

Module native cần linking config. Check:

```bash
cd ios && pod install
cd .. && npx expo prebuild --clean
```

### Lỗi 5: Apple reject vì non-native UI

App quá "web-like" -> reject. Đảm bảo:

- Dùng native navigation (React Navigation native)
- Native gesture (gesture-handler)
- Không WebView toàn app

---

## Câu hỏi phỏng vấn

### Câu 1: EAS Build là gì?

**Trả lời:** Expo cloud build service. Build .ipa/.aab trên cloud -- **không cần Mac** cho iOS. Tự quản lý cert/keystore. Trade-off: phụ thuộc Expo (free tier có limit), nhưng tiết kiệm setup CI/CD.

### Câu 2: TestFlight và Play Console Internal Testing?

**Trả lời:**

- **TestFlight** (iOS): tester join qua email/code, 10k tester external, 90 ngày
- **Play Console Internal Testing**: tester join qua link/email, 100 tester internal

Beta test trước production -- bắt bug, gather feedback.

### Câu 3: OTA Update có an toàn không?

**Trả lời:** Có nếu dùng đúng. **App Store policy**:

- Update **chỉ JS code** (bug fix, content)
- KHÔNG thay đổi function chính ("bait and switch")

Lạm dụng -> Apple có thể ban developer account. Sử dụng có trách nhiệm.

### Câu 4: APK vs AAB?

**Trả lời:**

- **APK**: file install Android cũ, 1 file cho mọi device
- **AAB** (App Bundle, từ 2021): chỉ upload, Google tự sinh APK cho từng device -- app size nhỏ hơn 15-30%

Play Store **bắt buộc AAB** cho app mới.

### Câu 5: Phased release là gì?

**Trả lời:** Release tăng dần: 1% user ngày 1, 5% ngày 2, 10% ngày 3... -> 100% ngày 7. Lợi:

- Detect bug sớm (crash rate)
- Có thể **rollback** nếu vấn đề lớn
- Server scale dần

Play Console + App Store Connect đều hỗ trợ.
