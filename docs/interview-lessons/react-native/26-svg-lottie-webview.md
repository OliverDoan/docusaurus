---
sidebar_position: 26
title: "SVG, Lottie & WebView"
---

# SVG, Lottie & WebView

## 1. Đồ hoạ & nội dung web: SVG, Lottie, WebView

Bài học: [1. Đồ hoạ & nội dung web: SVG, Lottie, WebView](../../react-native/26-svg-lottie-webview/1_svg-lottie-webview.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao nên dùng SVG thay vì ảnh PNG cho icon?**

<details className="qa">
<summary>Xem đáp án</summary>

SVG là đồ hoạ vector (mô tả bằng toạ độ toán học) nên co giãn ở bất kỳ kích thước nào vẫn sắc nét, trong khi PNG là bitmap cố định điểm ảnh nên phóng to sẽ vỡ nét — phải export nhiều size (`@1x`, `@2x`, `@3x`) mới đủ dùng. SVG cũng thường nhẹ hơn nhiều so với việc gộp nhiều file PNG cho cùng một icon, và dễ đổi màu động (chỉ đổi prop `fill`/`stroke`) mà không cần asset riêng cho mỗi màu.

</details>

**2. `viewBox` trong `Svg` dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`viewBox` định nghĩa hệ toạ độ nội bộ (`minX minY width height`) mà các lệnh vẽ bên trong dùng, tách biệt với `width`/`height` hiển thị thực tế ra bên ngoài. Nhờ vậy một hình vẽ trên hệ toạ độ `0 0 24 24` có thể hiển thị ở 16px hay 96px mà không cần vẽ lại — chỉ cần đổi `width`/`height` của `Svg`, mọi toạ độ bên trong tự co giãn theo tỉ lệ.

</details>

**3. Làm sao để đổi màu/kích thước một icon SVG dùng ở nhiều nơi mà không lặp code?**

<details className="qa">
<summary>Xem đáp án</summary>

Bọc `Svg`/`Path` thành một component nhận `color` và `size` làm prop, rồi render `Path` với `stroke`/`fill` bằng giá trị `color` truyền vào và `width`/`height` của `Svg` bằng `size`. Mọi nơi cần icon chỉ gọi component đó với prop khác nhau, thay vì lặp lại khối `Svg` ở từng chỗ.

</details>

**4. Khi nào cần transformer để import file `.svg` như component?**

<details className="qa">
<summary>Xem đáp án</summary>

Bundler mặc định (ví dụ Metro) coi file `.svg` là asset tĩnh, không phải mã nguồn, nên `import Logo from './logo.svg'` sẽ không tự biến thành component React nếu không có transformer chuyển đổi lúc build (với Metro là gói `react-native-svg-transformer`). Nếu không muốn cấu hình transformer, có thể dùng `SvgXml` với chuỗi XML của file SVG thay thế.

</details>

**5. Lottie khác gì so với video/GIF cho animation loading?**

<details className="qa">
<summary>Xem đáp án</summary>

Lottie là animation vector dạng JSON (xuất từ After Effects), nên co giãn không vỡ nét và file thường nhẹ hơn nhiều so với video/GIF ở cùng chất lượng hình ảnh. Animation cũng chạy trên engine native chuyên dụng thay vì giải mã video, nên mượt và ít tốn tài nguyên hơn cho các hiệu ứng phức tạp nhiều lớp.

</details>

**6. `LottieView` có những prop điều khiển chính nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`source` (file JSON hoặc `.lottie`), `autoPlay` (tự chạy khi mount), `loop` (lặp vô hạn hay chạy một lần), `progress` (điều khiển animation thủ công theo giá trị 0..1). Ngoài ra có thể điều khiển chủ động qua `ref` với các hàm `play()`, `pause()`, `reset()`.

</details>

**7. Khi nào nên dùng Lottie, khi nào nên dùng Reanimated?**

<details className="qa">
<summary>Xem đáp án</summary>

Lottie phù hợp cho animation nhiều lớp, phức tạp mà designer đã dựng sẵn (loading, minh hoạ, hiệu ứng ăn mừng) — không hợp lý để code lại từng khung hình. Reanimated phù hợp cho animation gắn liền với tương tác của người dùng (gesture, kéo, vuốt) hoặc cần điều khiển chính xác theo giá trị runtime, việc mà một animation "đóng gói sẵn" như Lottie không đáp ứng được.

</details>

**8. Sự khác biệt giữa `source={{ uri }}` và `source={{ html }}` trong `WebView`?**

<details className="qa">
<summary>Xem đáp án</summary>

`source={{ uri }}` nạp một trang web thật từ URL (WebView tự tải và render). `source={{ html }}` nạp một chuỗi HTML dựng sẵn trong bộ nhớ, dùng khi nội dung đã được tạo ra ở tầng JS (ví dụ markdown đã parse thành HTML) chứ không tồn tại sẵn ở một địa chỉ web nào.

</details>

**9. Làm sao để trang HTML bên trong WebView gửi dữ liệu ra cho phần native?**

<details className="qa">
<summary>Xem đáp án</summary>

Trang gọi `window.ReactNativeWebView.postMessage(string)` — đây là cầu nối do thư viện tiêm sẵn vào trang, không phải `window.postMessage` thông thường. Phía RN nhận dữ liệu qua prop `onMessage` của `WebView`, đọc chuỗi gửi lên từ `event.nativeEvent.data`.

</details>

**10. Vì sao WebView không tự co giãn chiều cao theo nội dung, và cách khắc phục?**

<details className="qa">
<summary>Xem đáp án</summary>

WebView mặc định là một khung có kích thước cố định theo `style` được truyền vào, không tự đo và co theo nội dung HTML bên trong như một `View` bình thường. Cách khắc phục phổ biến: tiêm một đoạn JavaScript (qua `injectedJavaScript`) để đo `document.documentElement.scrollHeight` sau khi trang load xong, gửi giá trị đó ra ngoài qua `postMessage`, rồi phía RN nhận qua `onMessage` và cập nhật lại `height` cho khung chứa.

</details>

**11. Vì sao phải sanitize HTML trước khi đưa vào WebView, kể cả khi nội dung do model AI sinh ra?**

<details className="qa">
<summary>Xem đáp án</summary>

WebView thực thi HTML/JS như một trình duyệt thật — nếu nội dung chứa thẻ `script` hay thuộc tính `on*` (`onclick`, `onerror`...) không bị lọc bỏ, đó tương đương với cho phép chạy mã tuỳ ý ngay trong app. Nội dung do model AI sinh ra vẫn không đáng tin cậy tuyệt đối (có thể bị dẫn dắt để sinh ra mã độc), nên luôn phải lọc qua whitelist thẻ/thuộc tính cho phép bằng một thư viện sanitize trước khi render, kết hợp thêm việc tắt `javaScriptEnabled` khi không cần và chặn điều hướng URL lạ như các lớp phòng thủ bổ sung.

</details>

**12. Vì sao không nên tạo một WebView cho mỗi tin nhắn trong danh sách chat dài?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi WebView là một tiến trình/engine render riêng biệt, tốn bộ nhớ đáng kể so với một component native thông thường. Tạo hàng chục WebView cùng lúc khi cuộn qua một danh sách chat dài sẽ nhanh chóng làm app chậm hoặc hết bộ nhớ. Nên lazy render (chỉ mount WebView khi tin nhắn nằm trong hoặc gần vùng nhìn thấy) và chỉ dùng WebView cho phần nội dung thật sự cần engine HTML (bảng phức tạp, công thức toán, sơ đồ), còn văn bản thường vẫn render bằng component native.

</details>
