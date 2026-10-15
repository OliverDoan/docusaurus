---
sidebar_position: 9
title: "Interactions"
---

# Interactions

## 1. Interactions -- Touch, Gesture, Animation

Bài học: [1. Interactions -- Touch, Gesture, Animation](../../react-native/09-interactions/1_interactions.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Animated API vs Reanimated?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Animated** (built-in): cũ, animation chạy được trên native với `useNativeDriver`, hạn chế (chỉ transform/opacity)
- **Reanimated** (v2/v3): mới, **worklet** chạy hoàn toàn trên UI thread, gesture-driven, performance đỉnh

Project mới ưu tiên Reanimated cho animation phức tạp.

</details>

**2. `useNativeDriver` lợi ích gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Animation chạy trên **UI thread** (native), không qua JS thread + bridge. **60fps đảm bảo** ngay cả khi JS busy. Chỉ hỗ trợ: opacity, transform. Layout (width, height) không hỗ trợ -- dùng transform scale thay.

</details>

**3. Gesture handler vs PanResponder?**

<details className="qa">
<summary>Xem đáp án</summary>

- **PanResponder** (built-in cũ): chạy trên JS thread, lag với gesture phức tạp
- **react-native-gesture-handler**: native gesture, mượt mà, kết hợp tốt với Reanimated

Project mới luôn dùng gesture-handler.

</details>

**4. Worklet trong Reanimated là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Function chạy trên **UI thread** (không phải JS thread). Khai báo bằng directive `'worklet';`. Cho phép sync access shared value, animation 60fps không phụ thuộc JS busy.

```js
function update() {
  'worklet';
  offset.value = 100;
}
```

</details>

**5. Push notification flow?**

<details className="qa">
<summary>Xem đáp án</summary>

1. User cấp permission (`requestPermissionsAsync`)
2. App lấy **device token** từ Apple/Google
3. Send token lên server lưu
4. Khi cần push: server gọi APNs (iOS) hoặc FCM (Android) với token + payload
5. Apple/Google deliver notification đến device
6. App nhận, hiển thị, hoặc handle khi user tap

Expo Push API trừu tượng hóa APNs + FCM thành 1 endpoint.

</details>
