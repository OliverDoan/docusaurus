---
sidebar_position: 19
title: "Animation & Gesture"
---

# Animation & Gesture

## 1. Animation & Gesture nâng cao: Reanimated 4, Gesture Handler, Keyboard

Bài học: [1. Animation & Gesture nâng cao: Reanimated 4, Gesture Handler, Keyboard](../../react-native/19-animation-gesture/1_animation-gesture.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Shared value khác gì `useState`?**

<details className="qa">
<summary>Xem đáp án</summary>

`useSharedValue` tạo object có `.value`, đọc/ghi được từ cả JS thread và UI thread, đổi giá trị **không** gây React re-render — cập nhật animation trực tiếp trên UI thread. `useState` đổi giá trị luôn kích hoạt re-render trên JS thread, không phù hợp cho animation chạy mỗi frame.

</details>

**2. Worklet là gì và vì sao cần babel plugin?**

<details className="qa">
<summary>Xem đáp án</summary>

Worklet là hàm JavaScript được đánh dấu (`'worklet';` hoặc tự động bởi các API của Reanimated/Gesture Handler) để biên dịch thành dạng chạy được trên **UI runtime** — một runtime JavaScript thứ hai sống trên UI thread. Babel plugin `react-native-worklets/plugin` thực hiện việc "workletize" này lúc build; thiếu plugin, hàm vẫn chỉ chạy được trên JS thread như bình thường.

</details>

**3. `runOnJS` và `scheduleOnRN` khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều dùng để gọi một hàm JS bình thường từ bên trong worklet (UI thread → JS thread). `runOnJS` (từ `react-native-reanimated`) là API cũ, nay đã **deprecated**, cách dùng là bọc hàm rồi gọi: `runOnJS(fn)(args)`. `scheduleOnRN` (từ `react-native-worklets`) là API khuyến nghị thay thế, gọi thẳng: `scheduleOnRN(fn, args)`. Cả hai đều vẫn hoạt động.

</details>

**4. Vì sao Reanimated 4 yêu cầu New Architecture?**

<details className="qa">
<summary>Xem đáp án</summary>

Reanimated 4 dựa vào JSI và cơ chế UI runtime chạy song song với JS runtime — hạ tầng này gắn với New Architecture (Fabric + TurboModules). Với Old Architecture, chỉ dùng được Reanimated bản 3 trở về trước.

</details>

**5. `withTiming` và `withSpring` khác nhau ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`withTiming` chạy theo thời lượng cố định (`duration`) và easing xác định trước — phù hợp khi cần animation kết thúc đúng lúc. `withSpring` mô phỏng vật lý lò xo (damping, stiffness), thời lượng không cố định, cảm giác tự nhiên hơn cho tương tác kéo-thả, bật lại.

</details>

**6. `Gesture.Simultaneous`, `Gesture.Exclusive`, `Gesture.Race` khác nhau ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

- `Simultaneous`: nhiều gesture cùng chạy đồng thời (ví dụ pan + pinch khi zoom ảnh).
- `Exclusive`: ưu tiên theo thứ tự khai báo — gesture đầu tiên activate sẽ chặn các gesture sau.
- `Race`: nhiều gesture cùng "chờ", gesture nào activate trước thắng, các gesture còn lại bị huỷ.

</details>

**7. `entering`/`exiting` và `layout` (LinearTransition) khác nhau chỗ nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`entering`/`exiting` animate khi component **mount**/**unmount** (ví dụ tin nhắn mới xuất hiện, bị xoá). `layout` (thường dùng `LinearTransition`) animate khi component **đổi vị trí hoặc kích thước** giữa hai lần render mà vẫn tồn tại — ví dụ các item bên dưới tự trượt lên khi một item phía trên bị xoá.

</details>

**8. Vì sao cần `GestureHandlerRootView`?**

<details className="qa">
<summary>Xem đáp án</summary>

Gesture Handler cần một root view native để quản lý toàn bộ cây gesture của app. Thiếu nó, gesture trên Android thường không hoạt động (đôi khi không báo lỗi rõ ràng), còn iOS có thể vẫn chạy được ở một số trường hợp nhưng không đảm bảo đúng hành vi.

</details>

**9. Vì sao Android cần `KeyboardProvider` còn iOS có thể không cần?**

<details className="qa">
<summary>Xem đáp án</summary>

`react-native-keyboard-controller` dùng `WindowInsetsAnimationCallback` (API riêng của Android) để theo dõi bàn phím chính xác trong chế độ edge-to-edge — cơ chế này cần được khởi tạo qua `KeyboardProvider`. Trên iOS, `KeyboardAvoidingView` gốc của React Native vẫn hoạt động tốt trong nhiều trường hợp nên một số app chọn không kéo thêm native dependency ở nền tảng này.

</details>

**10. Vì sao không nên cộng `insets.bottom` với chiều cao bàn phím?**

<details className="qa">
<summary>Xem đáp án</summary>

`insets.bottom` là khoảng an toàn khi **không** có bàn phím (ví dụ vùng thanh điều hướng cử chỉ). Khi bàn phím mở, đáy bàn phím đã trở thành ranh giới an toàn mới — cộng dồn cả hai sẽ đẩy nội dung lên cao hơn cần thiết. Công thức đúng là lấy giá trị lớn hơn (bàn phím đang mở thì dùng chiều cao bàn phím, đóng thì dùng `insets.bottom`).

</details>

**11. `useAnimatedScrollHandler` khác gì so với `onScroll` thường?**

<details className="qa">
<summary>Xem đáp án</summary>

`onScroll` thường của `ScrollView`/`FlatList` chạy callback trên JS thread. `useAnimatedScrollHandler` tạo một handler worklet, đọc vị trí cuộn và cập nhật shared value ngay trên UI thread — cho phép animation theo scroll (header co giãn, parallax) mượt mà không phụ thuộc JS thread.

</details>

**12. Khi nào nên dùng CSS animation mới của Reanimated 4 thay vì `useSharedValue`?**

<details className="qa">
<summary>Xem đáp án</summary>

CSS animation (`animationName`, `transitionProperty`...) phù hợp cho hiệu ứng trang trí đơn giản, không cần đọc giá trị theo gesture mỗi frame (fade khi mount, đổi màu khi đổi trạng thái). Khi animation phải phản ứng theo cử chỉ liên tục (kéo, pinch, scroll), `useSharedValue` + `useAnimatedStyle` vẫn là cách chính vì kiểm soát được từng khung hình.

</details>
