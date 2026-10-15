---
sidebar_position: 18
title: "New Architecture"
---

# New Architecture

## 1. New Architecture: JSI, TurboModules, Fabric

Bài học: [1. New Architecture: JSI, TurboModules, Fabric](../../react-native/18-new-architecture/1_new-architecture.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Bridge cũ hoạt động thế nào và vì sao chậm?**

<details className="qa">
<summary>Xem đáp án</summary>

Mọi lời gọi JS ↔ Native phải serialize thành JSON, xếp vào hàng đợi, gửi bất đồng bộ, rồi deserialize ở đầu nhận. Chậm vì: luôn phải serialize/deserialize (tốn CPU khi dữ liệu lớn hoặc gọi liên tục), không gọi đồng bộ được, và JS/UI Manager giữ 2 cây layout riêng phải đồng bộ qua bridge.

</details>

**2. JSI là gì, khác Bridge ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

JSI (JavaScript Interface) là lớp C++ cho JS engine giữ tham chiếu trực tiếp tới đối tượng native (Host Object) và gọi hàm gần như đồng bộ, không cần serialize JSON hay đi qua hàng đợi bất đồng bộ như Bridge. JSI là nền tảng chung cho cả TurboModules lẫn Fabric.

</details>

**3. TurboModule khác Native Module (Bridge classic) thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- Chạy qua JSI, có thể gọi đồng bộ khi cần (Bridge classic luôn bất đồng bộ)
- Lazy load -- chỉ khởi tạo khi JS gọi lần đầu, thay vì load hết lúc app khởi động
- Type-safe nhờ Codegen sinh interface từ spec TypeScript, không viết tay 2 lần như trước

</details>

**4. Fabric giải quyết vấn đề gì của UI Manager cũ?**

<details className="qa">
<summary>Xem đáp án</summary>

UI Manager cũ giữ 2 cây layout riêng (JS và native) phải đồng bộ qua bridge mỗi lần cập nhật, dễ lệch frame gây giật. Fabric dùng một Shadow Tree C++ dùng chung, JS và UI thread cùng đọc/ghi qua JSI, cho phép đọc layout đồng bộ và khớp với concurrent rendering của React (useTransition, Suspense).

</details>

**5. Codegen dùng để làm gì trong New Architecture?**

<details className="qa">
<summary>Xem đáp án</summary>

Codegen đọc spec TypeScript (native module hoặc native view component) lúc build, sinh ra interface C++/Java/Objective-C++ tương ứng. Nhờ đó phía native chỉ cần implement đúng interface đã sinh, đảm bảo type khớp giữa JS và native mà không phải viết tay bridging thủ công.

</details>

**6. Bridgeless mode nghĩa là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Là chế độ không khởi tạo bridge nữa -- toàn bộ giao tiếp JS ↔ Native (module và UI) đều đi qua JSI. Đây là bước cuối cùng của quá trình loại bỏ bridge khỏi React Native.

</details>

**7. Hermes là gì, liên quan gì tới New Architecture?**

<details className="qa">
<summary>Xem đáp án</summary>

Hermes là JS engine mặc định của RN, biên dịch JavaScript sang bytecode ngay lúc build (giảm thời gian start-up), có GC riêng tối ưu cho mobile, và có thể debug qua React Native DevTools. Hermes không bắt buộc phải đi cùng New Architecture về khái niệm, nhưng thực tế các cải tiến engine mới nhất đều tập trung cho Hermes.

</details>

**8. Từ version nào New Architecture bắt buộc, không tắt được nữa?**

<details className="qa">
<summary>Xem đáp án</summary>

RN 0.76 bật New Architecture mặc định cho project mới; từ RN 0.82, cờ tắt New Architecture bị bỏ qua hoàn toàn -- app luôn chạy New Architecture. Các bản sau tiếp tục gỡ dần code kiến trúc cũ, nhưng tới 0.85 interop layer vẫn còn để thư viện cũ chạy tạm.

</details>

**9. Interop layer là gì, tồn tại tới khi nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Là lớp tương thích cho phép Native Module viết theo Bridge classic vẫn chạy tạm được trên New Architecture (có thể kèm cảnh báo hiệu năng), giúp app chưa migrate hết thư viện vẫn nâng cấp RN được. Tới RN 0.85 lớp này vẫn còn, nhưng đây là giải pháp chuyển tiếp: team React Native sẽ gỡ nó ở các bản sau, nên thư viện cần migrate sang TurboModule/Fabric.

</details>

**10. Nitro Modules khác TurboModules ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều xây trên JSI. TurboModule là singleton, method giống hàm static, Codegen chạy lúc build app. Nitro dùng khái niệm HybridObject (giống instance object thật), sinh code trước bởi tác giả thư viện (không cần build lại ở app dùng), hướng tới ít boilerplate và tương tác Swift/Kotlin trực tiếp hơn. Nitro là lựa chọn cộng đồng, không thay thế TurboModules ở tầng kiến trúc chính thức của RN.

</details>

**11. Vì sao một số SDK dùng cơ chế "dispatch + event" thay vì gọi TurboModule trả Promise trực tiếp?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì SDK chạy nhúng trong nhiều bản host app khác nhau, không kiểm soát lịch build/Codegen của host. Một kênh `dispatch(type, payload)` + lắng nghe kết quả qua một event chung (lọc theo correlation id) cho phép host thêm lệnh mới ở bản sau mà không phải đổi interface TurboModule, còn SDK vẫn chạy được trên cả bản host cũ lẫn mới.

</details>

**12. Khi chọn thư viện native cho project mới, cần kiểm tra gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- Badge/ghi chú "hỗ trợ New Architecture" trên trang thư viện
- `package.json` có `codegenConfig` hay không
- CHANGELOG/issues gần đây có nhắc Fabric/TurboModule không
- Không dựa lâu dài vào interop layer: khi nó bị gỡ ở bản RN tương lai, thư viện chưa migrate sẽ ngừng hoạt động

</details>
