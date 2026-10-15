---
sidebar_position: 17
title: "Navigation"
---

# Navigation

## 1. Navigation với React Navigation 7

Bài học: [1. Navigation với React Navigation 7](../../react-native/17-navigation/1_navigation.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `NavigationContainer` là gì và vì sao chỉ nên có một cái ở gốc app?**

<details className="qa">
<summary>Xem đáp án</summary>

`NavigationContainer` quản lý toàn bộ cây điều hướng: state route hiện tại, lịch sử back, cấu hình `linking`. Toàn bộ navigator phải nằm trong đúng một `NavigationContainer` ở gốc; lồng thêm một cái nữa trực tiếp bên trong sẽ bị cảnh báo "nested NavigationContainer". Cần một cây điều hướng độc lập (VD mini-app nhúng) thì bọc bằng `NavigationIndependentTree` thay vì thêm container thứ hai.

</details>

**2. Native Stack khác `@react-navigation/stack` (JS Stack) ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Native Stack dùng navigation controller/fragment thật của nền tảng (qua `react-native-screens`), animation và gesture back là native thật, hiệu năng tốt hơn. JS Stack triển khai lại bằng JavaScript + `Animated` + gesture-handler, chậm hơn nhưng linh hoạt hơn khi cần transition tuỳ biến sâu. Mặc định nên chọn Native Stack.

</details>

**3. Static API và Dynamic API trong React Navigation 7 khác nhau thế nào, khi nào chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Dynamic API là cách JSX quen thuộc (`<Stack.Navigator><Stack.Screen /></Stack.Navigator>`), linh hoạt, render được có điều kiện theo state runtime. Static API (mới ở v7) khai báo navigator dưới dạng object cấu hình qua `createNativeStackNavigator({ screens: {...} })`, tự sinh `linking` từ thuộc tính `linking` trên từng screen, ít boilerplate hơn cho cây màn hình cố định. Auth flow hay bất kỳ cấu trúc phụ thuộc state runtime nào vẫn cần dynamic API.

</details>

**4. `navigate`, `push`, `popTo`, `goBack` khác nhau ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

- `navigate(name, params)`: đi tới màn theo tên, ưu tiên cập nhật instance gần nhất nếu đã có, chưa có thì push mới.
- `push(name, params)`: luôn tạo instance mới, kể cả trùng tên màn hình.
- `popTo(name, params)` (mới ở v7): pop ngược stack tới màn có tên chỉ định, giữ instance cũ.
- `goBack()`: lùi đúng một bước.

</details>

**5. Làm sao để `navigation.navigate` có gợi ý kiểu (type-safe) ở mọi nơi trong app?**

<details className="qa">
<summary>Xem đáp án</summary>

Khai báo `RootStackParamList` mô tả tên route và kiểu params, rồi mở rộng vào namespace toàn cục:

```ts
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

Sau đó mọi `useNavigation()` / `navigation.navigate(...)` trong app đều được typed mà không cần truyền generic thủ công.

</details>

**6. Màn hình trước có bị unmount khi push một màn mới lên trên không? Vì sao điều này quan trọng?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. Màn hình bên dưới vẫn được giữ nguyên trong cây component, chỉ nhận sự kiện blur (mất focus) chứ không unmount -- giúp giữ nguyên state/scroll khi quay lại. Hệ quả: side-effect khởi động bằng `useEffect` thông thường (phát nhạc, timer) sẽ tiếp tục chạy ngầm sau khi push màn khác, phải dùng `useFocusEffect` để dừng đúng lúc.

</details>

**7. `useFocusEffect` khác `useEffect` thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`useEffect` chạy theo vòng đời mount/unmount của component. `useFocusEffect` chạy mỗi khi màn hình được **focus**, và cleanup chạy khi màn **blur** -- kể cả khi component chưa hề unmount (vì bị đẩy xuống dưới trong stack). Phù hợp cho side-effect chỉ nên hoạt động lúc màn đang hiển thị.

</details>

**8. `useIsFocused` dùng để làm gì, khác `useFocusEffect` ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`useIsFocused()` trả về giá trị `boolean` cho biết màn có đang focus hay không, và re-render component khi giá trị đó đổi -- dùng khi cần **đọc** trạng thái focus ngay trong phần render (VD đổi UI). `useFocusEffect` dùng khi cần **chạy side-effect** (subscribe, timer) theo focus/blur, không phải chỉ đọc giá trị.

</details>

**9. Làm sao điều hướng từ bên ngoài component React, ví dụ từ một push notification handler?**

<details className="qa">
<summary>Xem đáp án</summary>

Tạo `navigationRef` bằng `createNavigationContainerRef()`, truyền vào prop `ref` của `NavigationContainer`, rồi gọi `navigationRef.navigate(...)` từ bất kỳ đâu sau khi kiểm tra `navigationRef.isReady()`. Nếu gọi trước khi container sẵn sàng (VD app vừa khởi động nguội), cần lưu tạm ý định điều hướng rồi xả lại trong callback `onReady`.

</details>

**10. Auth flow (đổi giữa màn đăng nhập và app chính) thường được cài đặt thế nào trong React Navigation?**

<details className="qa">
<summary>Xem đáp án</summary>

Không có navigator riêng cho auth -- chỉ là render có điều kiện hai `Stack.Group` khác nhau (nhóm màn đăng nhập / nhóm màn app chính) dựa trên state đăng nhập. Khi state đổi, React Navigation tự unmount nhóm cũ và mount nhóm mới kèm animation, không cần gọi `reset()` thủ công. Đây là lý do navigator gốc thường phải dùng dynamic API dù phần còn lại của app dùng static API.

</details>

**11. Deep linking trong React Navigation hoạt động ra sao, `linking` config gồm những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`linking` là prop của `NavigationContainer` gồm `prefixes` (danh sách scheme/domain app nhận) và `config.screens` (map path URL tới tên route, cấu trúc mirror đúng cây navigator lồng nhau). Phải xử lý cả hai tình huống: app đang mở (lắng nghe sự kiện `url`) và app đóng hẳn (đọc URL khởi động ban đầu). Universal link/app link còn cần cấu hình native bổ sung ngoài phạm vi JS.

</details>

**12. `freezeOnBlur` và `lazy` trong bottom tabs giúp ích gì cho hiệu năng?**

<details className="qa">
<summary>Xem đáp án</summary>

`freezeOnBlur` (native-stack) đóng băng render của màn hình đang bị che khuất, giảm tải CPU/memory cho stack sâu. `lazy` (bottom-tabs, mặc định `true`) chỉ render nội dung một tab khi tab đó được focus lần đầu, tránh render sẵn toàn bộ tab ngay lúc app khởi động. Kết hợp `detachInactiveScreens` còn gỡ bớt view native của tab không active khỏi cây hiển thị.

</details>
