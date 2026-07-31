---
sidebar_position: 2
title: "2. Các cách tích hợp"
---

# Các cách tích hợp micro-frontend

Chia giao diện thành nhiều mảnh là một chuyện; **ghép chúng lại** thành một trang
là chuyện khác. Bài này điểm qua các kỹ thuật tích hợp (integration) phổ biến —
từ đơn giản tới linh hoạt — cùng ưu/nhược của mỗi cách, để bạn biết vì sao
**Module Federation** (bài học chính ở mục sau) lại được ưa chuộng.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Câu hỏi cốt lõi: ghép mảnh lúc `build-time` hay `runtime`** — chỉ tích hợp runtime mới cho `độc lập deploy` thật sự.
- ⭐ **`Runtime JS` (Module Federation, single-spa) linh hoạt và phổ biến nhất** — trọng tâm của cả tài liệu.
- **`Build-time` (npm package)** đơn giản, type-safe nhưng mất độc lập deploy — hợp cho chia sẻ component chung.
- **`Iframe`** cô lập tuyệt đối nhưng khó chia sẻ state/routing, trải nghiệm rời rạc, SEO kém.
- **`Server-side composition`** tốt cho SEO và tốc độ tải đầu, đổi lại hạ tầng phức tạp.
- **`Web Components`** theo chuẩn web, cô lập bằng `Shadow DOM`, hay dùng kèm cách runtime.

:::

---

## Mục lục

- [Hai thời điểm tích hợp: build-time vs runtime](#hai-thời-điểm-tích-hợp-build-time-vs-runtime)
- [1. Build-time (qua npm package)](#1-build-time-qua-npm-package)
- [2. Iframe](#2-iframe)
- [3. Ghép phía server (server-side composition)](#3-ghép-phía-server-server-side-composition)
- [4. Runtime qua JavaScript](#4-runtime-qua-javascript)
- [5. Web Components](#5-web-components)
- [Bảng so sánh](#bảng-so-sánh)
- [Tóm tắt](#tóm-tắt)

---

## Hai thời điểm tích hợp: build-time vs runtime

Câu hỏi cốt lõi: **các mảnh được ghép vào lúc nào?**

- **Build-time** (lúc đóng gói): mảnh được nhúng vào app chính *khi build*. Kết
  quả là một gói duy nhất.
- **Runtime** (lúc chạy): mảnh được tải về *khi trình duyệt chạy*, độc lập với
  app chính.

> Đây là điểm phân loại quan trọng nhất: chỉ tích hợp **runtime** mới cho phép
> **độc lập deploy** thật sự (đặc tính cốt lõi của micro-frontend ở bài trước).

## 1. Build-time (qua npm package)

Mỗi mảnh được publish thành một **package** (vd lên npm registry nội bộ), app
chính `import` như thư viện bình thường.

```ts
// App chính import mảnh như một package
import { ProductList } from '@company/product-list'
```

- ✅ **Đơn giản**, quen thuộc, type-safe.
- ❌ **Mất tính độc lập deploy**: mỗi lần mảnh đổi, app chính phải **cập nhật
  version, build lại, deploy lại**. Đây thực chất gần với monolith chia module.

> Phù hợp khi bạn chỉ muốn **chia sẻ component dùng chung** (design system), chứ
> không thực sự cần các mảnh deploy riêng.

## 2. Iframe

Mỗi mảnh là một trang web riêng, nhúng vào qua thẻ `<iframe>`.

```html
<iframe src="https://cart.company.com" title="Giỏ hàng"></iframe>
```

- ✅ **Cô lập tuyệt đối**: CSS và JavaScript của mảnh này không đụng mảnh kia.
- ❌ Khó **chia sẻ state** và **điều hướng (routing)** giữa các mảnh; khó làm
  responsive; trải nghiệm rời rạc; SEO kém.

> Hợp cho widget nhúng từ bên thứ ba, hoặc dashboard ghép các công cụ cũ — nơi sự
> cô lập quan trọng hơn trải nghiệm liền mạch.

## 3. Ghép phía server (server-side composition)

Server lắp ghép HTML từ nhiều nguồn **trước khi** gửi về trình duyệt. Có thể dùng
SSI (Server Side Includes), tầng Edge, hoặc framework chuyên dụng.

- ✅ Tốt cho **tốc độ tải trang đầu** và **SEO** (trình duyệt nhận HTML đã đầy đủ).
- ❌ Hạ tầng phức tạp; tương tác động phía client vẫn cần thêm giải pháp.

> Hợp cho site nặng nội dung, cần SEO và tải nhanh (thương mại điện tử quy mô lớn).

## 4. Runtime qua JavaScript

App **"vỏ" (shell)** tải code của từng mảnh **lúc chạy** rồi gắn (mount) vào DOM.
Mỗi mảnh được host độc lập (vd `cart.company.com/remoteEntry.js`).

```ts
// Shell tải mảnh lúc runtime rồi render
const { mount } = await import('https://cart.company.com/remoteEntry.js')
mount(document.getElementById('cart-slot'))
```

- ✅ **Linh hoạt nhất** — đúng tinh thần micro-frontend: mỗi mảnh deploy riêng,
  shell tải về khi cần.
- ✅ Chia sẻ được dependency (React...) nếu cấu hình đúng.
- ❌ Cần điều phối cẩn thận: phiên bản, dependency trùng, xử lý lỗi khi tải.

> **Module Federation** (mục 2 của tài liệu) và **single-spa** là hai đại diện
> tiêu biểu của cách này. Đây là hướng phổ biến nhất hiện nay.

## 5. Web Components

Mỗi mảnh được đóng gói thành một **custom element** (phần tử HTML tùy chỉnh) theo
chuẩn web, dùng như thẻ HTML bình thường:

```html
<product-list category="sach"></product-list>
```

- ✅ Theo **chuẩn web**, không phụ thuộc framework (framework-agnostic); **Shadow
  DOM** giúp cô lập CSS.
- ❌ Truyền dữ liệu phức tạp hơi vướng; tích hợp sâu với React/Vue cần lớp bọc.

> Thường **kết hợp** với cách runtime ở trên: dùng Web Component làm "bao bì" cho
> mảnh, còn Module Federation lo việc tải code.

## Bảng so sánh

| Cách | Thời điểm | Độc lập deploy | Cô lập | Độ phức tạp |
| --- | --- | --- | --- | --- |
| Build-time (npm) | Build | ❌ Không | Thấp | Thấp |
| Iframe | Runtime | ✅ Có | ✅ Rất cao | Thấp |
| Server-side | Server | ✅ Có | Trung bình | Cao |
| **Runtime JS** | **Runtime** | ✅ **Có** | Trung bình | Trung bình–cao |
| Web Components | Runtime | ✅ Có | ✅ Cao (Shadow DOM) | Trung bình |

## Tóm tắt

- Câu hỏi cốt lõi: ghép các mảnh **lúc build** hay **lúc runtime**? Chỉ runtime
  mới cho **độc lập deploy** thật sự.
- **Build-time (npm)**: đơn giản nhưng mất tính độc lập deploy — hợp cho chia sẻ
  component dùng chung.
- **Iframe**: cô lập tuyệt đối nhưng trải nghiệm rời rạc, khó chia sẻ state.
- **Server-side composition**: tốt cho SEO/tốc độ, đổi lại hạ tầng phức tạp.
- **Runtime JS** (Module Federation, single-spa): linh hoạt nhất, phổ biến nhất —
  trọng tâm của tài liệu này.
- **Web Components**: theo chuẩn web, cô lập tốt, hay dùng kèm cách runtime.

Bài tiếp theo: **ưu/nhược điểm và khi nào nên (không nên) dùng** micro-frontend.
