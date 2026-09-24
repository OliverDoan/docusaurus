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
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

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

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt tích hợp `build-time` và `runtime`. Vì sao chỉ tích hợp runtime mới cho phép độc lập deploy thật sự?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Build-time** (lúc đóng gói): mảnh được nhúng vào app chính *khi build*, kết quả là **một gói duy nhất**.
- **Runtime** (lúc chạy): mảnh được tải về *khi trình duyệt chạy*, host độc lập với app chính.

Chỉ runtime mới cho độc lập deploy thật sự, vì với build-time, code của mảnh đã nằm sẵn trong gói của app chính. Mảnh đổi một dòng thì phải publish version mới, app chính phải nâng version, **build lại và deploy lại** — nghĩa là mọi thay đổi vẫn phải đi qua nhịp release của app chính.

Với runtime, shell chỉ giữ **địa chỉ** của mảnh chứ không giữ code. Nhóm sở hữu mảnh đẩy bản mới lên host của mình là người dùng nhận được ngay ở lần tải sau, không ai phải build lại gì cả.

</details>

**2. Kể các cách tích hợp micro-frontend bạn biết và nêu tiêu chí bạn dùng để chọn giữa chúng.**

<details className="qa">
<summary>Xem đáp án</summary>

| Cách | Thời điểm | Độc lập deploy | Cô lập | Độ phức tạp |
| --- | --- | --- | --- | --- |
| Build-time (npm) | Build | Không | Thấp | Thấp |
| Iframe | Runtime | Có | Rất cao | Thấp |
| Server-side | Server | Có | Trung bình | Cao |
| **Runtime JS** | **Runtime** | **Có** | Trung bình | Trung bình–cao |
| Web Components | Runtime | Có | Cao (Shadow DOM) | Trung bình |

Tiêu chí chọn:

- **Có thật sự cần deploy riêng không?** Nếu không, build-time là đủ và đơn giản nhất.
- **Mức cô lập cần thiết** — nhúng code bên thứ ba hoặc hệ thống cũ thì iframe hợp lý.
- **Yêu cầu SEO và tốc độ tải đầu** — nghiêng về server-side composition.
- **Mức độ liền mạch của trải nghiệm** và nhu cầu chia sẻ state/routing — nghiêng về runtime JS.
- **Năng lực vận hành của đội** — hạ tầng càng phức tạp càng cần đội trưởng thành.

</details>

**3. Tích hợp qua npm package khác gì so với chia module trong một monolith? Khi nào cách này vẫn chấp nhận được?**

<details className="qa">
<summary>Xem đáp án</summary>

Về bản chất thực thi thì **gần như không khác**: cả hai đều cho ra một gói duy nhất sau khi build. Khác biệt chỉ nằm ở khâu tổ chức — package có ranh giới rõ, có version, có thể test và phát hành riêng, và nhóm sở hữu package không cần quyền ghi vào repo chính.

Nhưng cái giá vẫn còn nguyên: mỗi lần mảnh đổi, app chính phải cập nhật version, build lại, deploy lại. Vì vậy tài liệu gọi đây thực chất là **monolith chia module**.

Cách này vẫn chấp nhận được khi:

- Bạn chỉ muốn **chia sẻ component dùng chung** (design system, thư viện tiện ích).
- Nhịp release của app chính vốn đã đủ nhanh, không ai bị chặn.
- Bạn ưu tiên đơn giản và **type-safe** hơn là tự chủ deploy.

</details>

**4. `Iframe` cô lập CSS và JavaScript bằng cơ chế nào? Những hạn chế nào khiến nó hiếm khi được chọn cho sản phẩm chính?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi `iframe` là một **tài liệu (document) riêng** với ngữ cảnh duyệt riêng: DOM riêng, CSSOM riêng, đối tượng toàn cục riêng. CSS trong iframe không rò ra ngoài và ngược lại; biến toàn cục cũng không đụng nhau. Nếu khác origin thì trình duyệt còn chặn truy cập chéo theo chính sách same-origin, nên mức cô lập là **tuyệt đối**.

Chính sự cô lập đó tạo ra hạn chế:

- **Khó chia sẻ state** — hai bên không đọc được biến của nhau, phải nhắn tin qua lại.
- **Khó đồng bộ routing** — URL của trang cha không phản ánh trạng thái bên trong iframe, deep link và nút back hoạt động sai.
- **Khó responsive** — iframe không tự co giãn theo nội dung, phải tự tính chiều cao.
- **Trải nghiệm rời rạc** — modal, dropdown, tooltip bị cắt ở biên iframe; focus và phím tắt không liền mạch.
- **SEO kém** — nội dung trong iframe thường không được tính cho trang cha.

Vì vậy iframe hợp cho widget bên thứ ba hoặc dashboard ghép công cụ cũ hơn là sản phẩm chính.

</details>

**5. Với `iframe`, làm sao chia sẻ dữ liệu và đồng bộ điều hướng giữa trang cha và mảnh con? Nêu rủi ro của cơ chế đó.**

<details className="qa">
<summary>Xem đáp án</summary>

Cách chuẩn là dùng `postMessage` — cha và con nhắn tin cho nhau qua sự kiện `message`:

```js
// Trang cha gửi xuống
iframe.contentWindow.postMessage({ type: 'user', id: 7 }, 'https://cart.company.com')

// Mảnh con nhận
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://shop.company.com') return
  handle(e.data)
})
```

Điều hướng thì đồng bộ hai chiều: con báo cha khi route bên trong đổi để cha cập nhật URL, và cha báo con khi người dùng bấm back.

Rủi ro:

- **Bảo mật** — nếu không kiểm tra `e.origin` và không chỉ định origin đích (dùng `*`), bất kỳ trang nào cũng có thể gửi hoặc nghe lén thông điệp.
- **Hợp đồng ngầm** — định dạng thông điệp trở thành API không kiểu, dễ lệch khi một bên đổi.
- **Bất đồng bộ** — mọi thứ thành gửi/nhận, khó đảm bảo thứ tự và khó debug.
- **URL dễ lệch** với trạng thái thật bên trong, làm hỏng deep link.

</details>

**6. So sánh `server-side composition` với `client-side composition` về SEO, thời gian tải đầu và khả năng tương tác động.**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | Server-side composition | Client-side composition |
| --- | --- | --- |
| SEO | Tốt — trình duyệt và bot nhận HTML đã đầy đủ | Kém hơn — nội dung chỉ có sau khi JS chạy |
| Thời gian tải đầu | Nhanh, thấy nội dung ngay | Chậm hơn — phải tải shell rồi mới tải từng mảnh |
| Tương tác động | Cần thêm giải pháp phía client | Sẵn có, mảnh tự quản lý state và sự kiện |
| Hạ tầng | Phức tạp — cần tầng ghép ở server/edge | Đơn giản hơn, chỉ cần host tĩnh |
| Cập nhật không reload | Khó, thường phải tải lại trang | Dễ, chuyển mảnh ngay trong trình duyệt |

Nói ngắn gọn: server-side thắng ở **lần hiển thị đầu tiên**, client-side thắng ở **mọi tương tác sau đó**. Nhiều hệ thống lớn dùng cả hai — ghép ở server cho phần trên màn hình đầu, rồi để client tiếp quản phần tương tác.

</details>

**7. `SSI` và `ESI` (edge-side includes) chạy ở vị trí nào trong đường đi của request, và giải quyết được điều gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều là cơ chế **chèn mảnh HTML vào một trang HTML khác** dựa trên các chỉ thị include nhúng trong nội dung, khác nhau ở chỗ ai xử lý chỉ thị đó:

- **SSI (Server Side Includes)** — được xử lý ở **web server gốc** (Apache, Nginx) khi trả trang về. Server đọc trang khung, gặp chỉ thị include thì lấy nội dung mảnh tương ứng ghép vào rồi mới gửi đi.
- **ESI (Edge Side Includes)** — được xử lý ở **tầng edge / CDN / reverse proxy**, tức là gần người dùng hơn, trước khi request chạm tới server gốc.

Điều chúng giải quyết: cho phép **mỗi mảnh được cache riêng với thời hạn riêng**. Khung trang và phần tin tức có thể cache lâu, còn ô "giỏ hàng của bạn" thì cache ngắn hoặc không cache. Nhờ đó trang vẫn ghép từ nhiều nguồn độc lập mà trình duyệt vẫn nhận HTML đã đầy đủ — tốt cho SEO và tốc độ tải đầu.

</details>

**8. Mô tả cơ chế của cách tích hợp `runtime JS`: shell tải và mount một mảnh ra sao? Những rủi ro chính là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Shell không chứa code của mảnh, nó chỉ biết **địa chỉ** của mảnh. Lúc chạy, shell tải file entry của mảnh từ host riêng của mảnh đó, lấy ra hàm mount mà mảnh phơi ra, rồi gọi hàm đó với một phần tử DOM làm chỗ gắn:

```ts
const { mount } = await import('https://cart.company.com/remoteEntry.js')
mount(document.getElementById('cart-slot'))
```

Từ lúc này mảnh tự render và tự quản lý bên trong ô của nó. Khi rời khỏi màn hình, shell gọi hàm unmount tương ứng để dọn dẹp.

Rủi ro chính:

- **Phiên bản và hợp đồng** — shell gọi một hàm mà nó không build cùng, nên mảnh đổi chữ ký là vỡ lúc chạy chứ không vỡ lúc build.
- **Dependency trùng** — mỗi mảnh tự mang React thì bundle phình và hook có thể hỏng.
- **Lỗi khi tải** — mạng lỗi hoặc mảnh deploy hỏng thì ô đó trống, cần fallback.
- **Rò rỉ** — mảnh không dọn listener/timer lúc unmount sẽ tích tụ theo thời gian.

</details>

**9. `Web Components` kết hợp `Shadow DOM` cô lập được tới mức nào? Truyền dữ liệu phức tạp và bắn sự kiện ra ngoài xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Shadow DOM cô lập **CSS và cấu trúc DOM**: style bên trong không rò ra ngoài, selector bên ngoài không với vào trong, và `querySelector` của trang cha không thấy nội dung bên trong. Nhưng nó **không cô lập JavaScript** — vẫn chung một global, chung bộ nhớ, nên lỗi runtime hay biến toàn cục vẫn ảnh hưởng lẫn nhau. Mức cô lập vì thế nằm giữa iframe và cách runtime JS thuần.

**Truyền dữ liệu phức tạp:** thuộc tính HTML chỉ nhận chuỗi, nên object/array phải gán qua **property** của phần tử thay vì attribute:

```js
const el = document.querySelector('product-list')
el.items = [{ id: 1, name: 'Sách' }]
```

**Bắn sự kiện ra ngoài:** dùng `CustomEvent` với `bubbles: true` và `composed: true` để sự kiện vượt được ranh giới shadow, kèm dữ liệu trong `detail`. Trang cha chỉ cần `addEventListener` như với sự kiện DOM thường.

</details>

**10. Vì sao người ta hay kết hợp `Web Components` với `Module Federation` thay vì chọn một trong hai?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì hai thứ giải quyết hai bài toán khác nhau, không cạnh tranh nhau:

- **Web Components** trả lời câu hỏi *"mảnh trông như thế nào từ bên ngoài"* — nó là **bao bì**: một thẻ HTML chuẩn, không phụ thuộc framework, có Shadow DOM để cô lập CSS.
- **Module Federation** trả lời câu hỏi *"code của mảnh đến từ đâu"* — nó lo việc **tải code lúc runtime** và chia sẻ dependency giữa các mảnh.

Nếu chỉ dùng Web Components, bạn vẫn phải tự nghĩ cách nạp file JS của mảnh và tránh tải trùng React. Nếu chỉ dùng Module Federation, bạn tải được code nhưng ranh giới giữa các mảnh vẫn mỏng — CSS vẫn rò, và shell phải biết mảnh viết bằng framework gì.

Ghép lại: Module Federation lo vận chuyển, Web Component lo ranh giới và giao diện tiếp xúc — shell chỉ việc đặt một thẻ tuỳ chỉnh vào DOM.

</details>

**11. So sánh `single-spa` và `Module Federation` — mỗi thứ giải quyết tầng nào của bài toán tích hợp?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `single-spa` | `Module Federation` |
| --- | --- | --- |
| Tầng giải quyết | **Điều phối** — quyết định mảnh nào chạy khi nào | **Vận chuyển code** — nạp module từ app khác lúc runtime |
| Lo việc gì | Vòng đời mount/unmount theo route | Tải entry, chia sẻ dependency |
| Phụ thuộc | Không phụ thuộc bundler | Gắn với bundler (webpack/Rspack, plugin cho Vite) |
| Chia sẻ React | Phải tự xử lý | Có cơ chế shared sẵn |

Cả hai đều thuộc nhóm **runtime JS** trong bài. single-spa mạnh ở việc ghép nhiều app có vòng đời riêng, kể cả khác framework; Module Federation mạnh ở việc cho nhiều app dùng chung một bản React và mượn module của nhau.

Vì vậy chúng thường được dùng **cùng nhau**: single-spa điều phối vòng đời, Module Federation lo phần nạp code và chia sẻ dependency.

</details>

**12. Một trang ghép nhiều mảnh viết bằng nhiều framework khác nhau: bạn xử lý trùng `dependency` và kích thước bundle thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Trường hợp xấu nhất: mỗi mảnh mang theo framework của mình, người dùng tải cả React lẫn Vue lẫn Angular cho một trang. Cách xử lý:

- **Giảm số framework trước đã** — đây là cách hiệu quả nhất. Đa framework nên là trạng thái tạm thời trong lộ trình di trú, không phải mục tiêu.
- **Chia sẻ dependency** cho những mảnh dùng chung framework, để chỉ tải một bản React duy nhất.
- **Lazy load** mảnh dưới màn hình đầu — framework thứ hai chỉ tải khi người dùng thật sự cuộn tới hoặc mở màn hình đó.
- **Đặt ngân sách bundle** cho từng mảnh và đưa vào pipeline để chặn khi vượt ngưỡng.
- **Tránh trùng thư viện phụ** (date, icon, UI kit) bằng cách thống nhất một lựa chọn cho cả tổ chức.
- Đo bằng số liệu thực tế chứ không chỉ nhìn kích thước lúc build.

</details>

**13. Tình huống: app cũ chạy jQuery, cần nhúng dần các màn hình React mới mà không viết lại toàn bộ. Bạn chọn cách tích hợp nào và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Hướng hợp lý nhất là **tích hợp runtime**: app jQuery cũ đóng vai trò shell, chừa ra các "ô" trống trong DOM, còn màn hình React mới được tải lúc chạy và mount vào ô đó.

Vì sao:

- Không phải viết lại app cũ, cũng không phải build chung — hai bên giữ pipeline riêng.
- Nhóm làm React **deploy độc lập**, thay từng màn hình theo lộ trình, rủi ro được chia nhỏ.
- Nếu màn hình mới có vấn đề, chỉ cần trỏ ngược về màn hình cũ — rollback rất rẻ.

Nếu muốn ranh giới chặt hơn, có thể bọc màn hình React thành **Web Component** để Shadow DOM chặn CSS cũ của app jQuery rò vào — đây là điểm đáng lo nhất khi ghép với hệ thống cũ.

`Iframe` cũng dùng được và cô lập mạnh nhất, nhưng đổi lại trải nghiệm rời rạc và khó đồng bộ điều hướng, nên chỉ chọn khi CSS cũ quá hỗn loạn.

</details>

**14. Với tích hợp runtime, một mảnh tải thất bại thì trang phản ứng ra sao? Bạn thiết kế fallback và cô lập lỗi thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định, một lời gọi tải mảnh thất bại chỉ là một promise bị reject — nhưng nếu không ai bắt, nó có thể làm hỏng luồng render của shell và kéo theo cả trang. Vì vậy phải chủ động cô lập.

Thiết kế nên có:

- **Bắt lỗi ngay ở chỗ tải** — bọc lời gọi động trong try/catch, có timeout để không treo vô hạn.
- **Error boundary quanh mỗi ô mảnh**, hiển thị nội dung thay thế thay vì trang trắng.
- **Phân loại mảnh**: mảnh không thiết yếu (gợi ý sản phẩm) thì ẩn luôn ô đó; mảnh thiết yếu (giỏ hàng) thì báo rõ và cho người dùng thử lại.
- **Giữ khung kích thước** của ô dù mảnh hỏng, để layout không nhảy.
- **Thử lại có giới hạn** và ghi log kèm nhãn mảnh, để biết nhóm nào cần xử lý.

Nguyên tắc chung: một mảnh hỏng chỉ được làm mất chức năng của chính nó, phần còn lại của trang vẫn phải dùng được.

</details>
