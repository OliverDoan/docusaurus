---
sidebar_position: 20
title: "Super-app & Re.Pack"
---

# Super-app & Re.Pack

## 1. Super-app với Re.Pack & Module Federation

Bài học: [1. Super-app với Re.Pack & Module Federation](../../react-native/20-super-app/1_super-app.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Super-app là gì, host và mini-app khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Super-app là một app chứa nhiều module tính năng độc lập. **Host** là app vỏ, chứa navigation gốc và mọi native module đã build sẵn, đóng vai trò **provider** (cấp) trong Module Federation. **Mini-app** (remote) là bundle JS build riêng, expose một entry component, đóng vai trò **consumer** (tiêu thụ) -- nó tải và mount vào host lúc runtime, không có `remotes` riêng.

</details>

**2. Vì sao Metro không dùng được cho kiến trúc super-app kiểu này?**

<details className="qa">
<summary>Xem đáp án</summary>

Metro gộp toàn bộ code thành một bundle duy nhất lúc build, không hỗ trợ tải module từ một bundle khác lúc runtime (không có Module Federation). Muốn tách mini-app thành artifact publish độc lập, cần một bundler tương thích webpack -- đó là lý do Re.Pack (dựa trên Rspack) được dùng thay Metro.

</details>

**3. `ModuleFederationPluginV2` cần khai báo gì ở phía mini-app (remote)?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba phần chính: `name` (định danh MF, phải là JS identifier hợp lệ), `exposes` (module cho bên ngoài mượn, ví dụ `'./App'`), và `shared` (danh sách dependency dùng chung với host). `filename` đặt tên file bundle xuất ra, quy ước dạng `<name>.container.bundle`.

</details>

**4. `loadRemote()` hoạt động thế nào, cần chuẩn bị gì trước khi gọi?**

<details className="qa">
<summary>Xem đáp án</summary>

Trước khi gọi `loadRemote('slug/App')`, host phải `registerRemotes()` khai báo entry URL (trỏ tới file `*.container.bundle`) cho slug đó. `loadRemote` sau đó tải bundle qua HTTP, thực thi nó, và trả về module đã expose (thường có dạng `{ default: Component }`) để host render như component React bình thường.

</details>

**5. `singleton`, `eager`, `import: false` trong khai báo `shared` nghĩa là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- `singleton: true`: ép chỉ một instance của module tồn tại trong toàn runtime, dùng chung giữa host và mọi mini-app.
- `eager`: `true` bundle module ngay vào container để cấp sẵn (host thường đặt `true`); `false` không bundle sẵn, chỉ tải khi cần (mini-app thường đặt `false`).
- `import: false`: mini-app không bundle bản dự phòng (fallback) của module đó -- luôn đòi bản từ host, thiếu thì lỗi ngay thay vì âm thầm dùng bản riêng.

</details>

**6. Vì sao version của một shared dependency phải khớp tuyệt đối giữa host và mini-app?**

<details className="qa">
<summary>Xem đáp án</summary>

Với dependency có native view/module, hai bản khác version chạy song song sẽ cố đăng ký cùng một native component hai lần, gây crash `"Tried to register two views with the same name"`. Ngoài ra cơ chế negotiate version của MF runtime có thể từ chối thẳng nếu `requiredVersion` không thoả mãn `version` được cấp, trả lỗi dạng `RUNTIME-006`.

</details>

**7. Vì sao một shared dependency dù đã khai `eager: true` ở host vẫn có thể bị thiếu lúc runtime?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì bundler tree-shake mọi module mà code UI của host không trực tiếp `import`. Nếu module đó chỉ được khai trong cấu hình `shared` mà không có dòng import nào dùng tới trong code thật, nó bị loại khỏi bundle. Cách khắc phục là thêm side-effect import (`import 'package'` không lấy giá trị) trong một file preload, import trước khi `loadRemote` chạy lần đầu.

</details>

**8. Mini-app gọi năng lực gốc (camera, đăng nhập...) bằng cách nào nếu không có native code riêng?**

<details className="qa">
<summary>Xem đáp án</summary>

Qua một SDK riêng được host và mọi mini-app dùng chung như một shared singleton (eager ở host). SDK là tầng JS mỏng, phía dưới gọi một native bridge module (chỉ host mới có) bằng cách dispatch một loại hành động kèm dữ liệu, rồi lắng nghe một sự kiện kết quả (một dạng RPC đơn giản qua sự kiện native).

</details>

**9. Vì sao dev flow cần chạy hai dev server, và Android emulator cần thêm bước gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Host và mini-app là hai project build riêng nên mỗi bên có dev server riêng, chạy trên cổng khác nhau. Android emulator không resolve được `localhost` của máy host thật -- phải trỏ về địa chỉ đặc biệt của emulator (`10.0.2.2`) hoặc forward cổng bằng `adb reverse tcp:<port> tcp:<port>` cho cả hai dev server.

</details>

**10. OTA theo channel nghĩa là gì, và vì sao cần giữ khả năng rollback?**

<details className="qa">
<summary>Xem đáp án</summary>

Bundle mini-app sau khi build được publish lên server theo một "channel" (kênh phát hành, ví dụ dev/staging/production) -- host tải bundle tương ứng lúc khởi động, không cần qua store. Vì cập nhật này bỏ qua bước review của store, cần giữ lịch sử các bản đã publish theo version để có thể **rollback nhanh** về bản cũ nếu bản mới gây lỗi diện rộng, tránh phải chờ một chu kỳ build+publish mới để sửa.

</details>

**11. Vì sao "chạy tốt trên dev server" không đảm bảo mini-app chạy đúng khi đã publish?**

<details className="qa">
<summary>Xem đáp án</summary>

Dev server phục vụ bundle chưa qua bước build production thật sự (tối ưu hoá, ký số...), hành vi có thể khác so với bundle đã publish. Thêm shared dependency mới mà chưa publish bản host tương ứng, hoặc phiên bản shared trên dev server khác với bản đã lên production, có thể khiến tính năng "biến mất im lặng" trên bản thật dù dev vẫn chạy bình thường.

</details>

**12. Vì sao mini-app không thể tự thêm một native module hoàn toàn mới?**

<details className="qa">
<summary>Xem đáp án</summary>

Mini-app chỉ là bundle JavaScript, không mang theo được code native (Swift/Kotlin...). Mọi native module nó dùng phải đã được biên dịch sẵn vào binary của host từ trước. Muốn dùng một thư viện native mới, phải thêm vào project host, build và phát hành bản host mới qua store -- rồi mini-app mới publish bản khai `shared` dùng được module đó.

</details>
