---
sidebar_position: 2
title: "2. Các cách tích hợp"
---

# Các cách tích hợp Micro-frontend

> *Nhóm câu hỏi xoay quanh: ghép các micro-frontend lại bằng cách nào, mỗi cách đánh đổi gì. Interviewer muốn nghe bạn phân loại theo thời điểm tích hợp và nói được trade-off — không chỉ liệt kê tên công nghệ.*

:::note[Ghi nhớ nhanh]

- ⭐ **Phân loại theo thời điểm tích hợp (integration time)** — build-time / server-side / client-side (runtime) là khung trả lời sạch nhất.
- **Build-time** (mỗi MFE là npm package, host `import` rồi bundle chung) — đơn giản, type-safe nhưng **mất tính độc lập deploy**, gần với monorepo hơn là MFE thật.
- **Server-side** — ghép các mảnh ở phía server (SSI/edge include) trước khi trả HTML, tốt cho SEO và first paint.
- **Client-side / runtime** — host load MFE lúc chạy (Module Federation, iframe, web component); giữ được **độc lập deploy** đúng tinh thần micro-frontend.
- **Không có cách "đúng tuyệt đối"** — chọn theo nhu cầu độc lập deploy, SEO và độ phức tạp tooling.

:::

---

## Câu 6: Có những cách nào để tích hợp các micro-frontend lại với nhau? `[Intermediate]`

### Câu hỏi

> Khi chia frontend thành nhiều micro-frontend, có những cách nào để ghép chúng lại thành một sản phẩm hoàn chỉnh cho người dùng? Phân loại và so sánh giúp anh?

### Giải thích lý thuyết

Cách phân loại sạch nhất là theo **thời điểm tích hợp** (integration time) — tức là các mảnh được ghép lại ở giai đoạn nào:

**1. Build-time integration (tích hợp lúc build)**

Mỗi MFE được publish thành một **npm package**; app container `import` chúng như thư viện và bundle tất cả vào một build duy nhất.

- Ưu: đơn giản, type-safe, tooling quen thuộc.
- Nhược: **mất tính độc lập deploy** — một team đổi code thì cả app phải build & release lại. Đây thực ra là monorepo/component-sharing chứ chưa đúng tinh thần micro-frontend.

**2. Server-side integration (tích hợp phía server)**

Server ghép HTML của các MFE lại trước khi trả về cho trình duyệt:

- **SSI (Server-Side Includes)**: server (Nginx) chèn fragment HTML qua directive `<!--#include -->`.
- **ESI (Edge-Side Includes)**: tương tự nhưng chạy ở tầng CDN/edge (Varnish, Akamai).
- **Server composition**: một service Node/BFF gọi từng MFE render ra HTML rồi nối lại (Tailor của Zalando, Podium, Ara Framework).
- Ưu: tốt cho **first paint & SEO** (HTML có sẵn), nhẹ cho client yếu.
- Nhược: hạ tầng phức tạp hơn, tương tác động vẫn cần JS phía client.

**3. Run-time / client-side integration (tích hợp lúc chạy, trong trình duyệt)**

App shell tải và ghép các MFE ngay trong browser tại thời điểm runtime:

- **iframe**: nhúng mỗi MFE như một trang độc lập.
- **Web Components**: mỗi MFE là một custom element.
- **JavaScript entry / Module Federation**: container nạp bundle JS của MFE lúc chạy và mount vào DOM.
- **single-spa / qiankun**: orchestrator điều phối nhiều "app con" theo route.
- Ưu: **deploy độc lập thật sự** — mỗi team release riêng, container nạp phiên bản mới mà không build lại.
- Nhược: phức tạp về isolation (CSS/JS toàn cục), versioning, và overhead khi nhiều framework cùng tồn tại.

| Nhóm | Deploy độc lập | First paint / SEO | Độ phức tạp hạ tầng | Cô lập CSS/JS |
| ---- | -------------- | ----------------- | ------------------- | ------------- |
| **Build-time** | ❌ (build lại cả app) | Tốt (bundle sẵn) | Thấp | Yếu (chung scope) |
| **Server-side** | ⚠️ phần nào | **Rất tốt** | Cao | Trung bình |
| **Run-time / client** | ✅ **thật sự** | Yếu hơn (cần JS) | Trung bình–cao | Tuỳ kỹ thuật (iframe mạnh, JS entry yếu) |

> **Insight phỏng vấn:** nếu chỉ kịp nói một câu, hãy nhấn rằng **client-side runtime (đặc biệt Module Federation và single-spa) là cách phổ biến nhất hiện nay** vì nó là cách duy nhất cho phép *deploy độc lập thật sự* — đúng lý do người ta chọn micro-frontend. Build-time chỉ là chia sẻ component, server-side mạnh về SEO nhưng đắt hạ tầng.

### Code minh hoạ

```html
<!-- Server-side: SSI chèn fragment trong Nginx -->
<body>
  <!--#include virtual="/header-mfe/fragment.html" -->
  <main>
    <!--#include virtual="/product-mfe/fragment.html" -->
  </main>
</body>
```

```html
<!-- Run-time / client-side: app shell nạp MFE lúc chạy -->
<div id="header"></div>
<div id="cart"></div>

<script type="module">
  // Mỗi MFE expose một hàm mount; container gọi lúc runtime
  const { mount: mountHeader } = await import('https://header.example.com/entry.js');
  const { mount: mountCart } = await import('https://cart.example.com/entry.js');

  mountHeader(document.getElementById('header'));
  mountCart(document.getElementById('cart'));
</script>
```

### Đáp án mẫu

> "Em phân loại theo thời điểm tích hợp. **Build-time**: mỗi MFE là một npm package, container import và bundle chung — đơn giản nhưng mất tính deploy độc lập nên thực ra giống chia sẻ component hơn. **Server-side**: server hoặc edge ghép HTML lại qua SSI/ESI hay server composition — mạnh về first paint và SEO, đổi lại hạ tầng phức tạp. **Run-time client-side**: ghép ngay trong browser bằng iframe, Web Components, JS entry với Module Federation, hoặc orchestrator như single-spa — đây là cách duy nhất cho deploy độc lập thật sự nên phổ biến nhất hiện nay, đánh đổi là phải xử lý isolation CSS/JS và versioning. Em thường mặc định chọn client-side runtime, và chỉ kéo thêm server-side khi SEO hoặc first paint là yêu cầu cứng."

---

## Câu 7: Dùng iframe để dựng micro-frontend có ưu và nhược điểm gì? `[Intermediate]`

### Câu hỏi

> iframe là cách cũ nhất để nhúng một ứng dụng vào ứng dụng khác. Nếu dùng iframe làm cơ chế tích hợp micro-frontend thì được gì và mất gì?

### Giải thích lý thuyết

iframe tạo một **browsing context riêng biệt** — gần như một tab độc lập nhúng trong trang. Đây vừa là sức mạnh vừa là điểm yếu lớn nhất của nó.

**Ưu điểm:**

- **Cô lập tuyệt đối**: CSS, JavaScript global, `window`, biến toàn cục của MFE con hoàn toàn không rò rỉ ra trang cha và ngược lại. Không có chuyện class CSS đụng nhau hay biến global ghi đè.
- **Fault isolation tốt**: MFE con crash, throw lỗi JS hay treo cũng không kéo sập trang cha.
- **Dễ nhúng app legacy hoặc khác origin**: một ứng dụng cũ, hoặc app của bên thứ ba ở domain khác, có thể nhúng gần như không cần sửa.

**Nhược điểm:**

- **Giao tiếp khó**: cha–con khác context, chỉ nói chuyện được qua `postMessage` (bất đồng bộ, phải tự định nghĩa protocol và kiểm tra `origin`). Không share trực tiếp object/function.
- **Routing & deep-link khó**: URL trên thanh địa chỉ là của trang cha; route bên trong iframe không tự phản ánh ra ngoài, làm bookmark và back/forward rối.
- **Sizing & responsive khó**: iframe không tự co theo nội dung; phải tính chiều cao thủ công và đẩy qua postMessage mỗi khi nội dung đổi.
- **SEO & accessibility kém**: nội dung trong iframe khó được crawl và screen reader xử lý không liền mạch; focus và phím tắt bị giới hạn trong context con.
- **Performance / trùng lặp**: mỗi iframe tải lại runtime, framework, font riêng → tốn bộ nhớ và băng thông khi có nhiều iframe.

> **Insight phỏng vấn:** đừng nói "iframe đã lỗi thời". Nói rằng iframe vẫn là lựa chọn **đúng** khi yêu cầu hàng đầu là *cô lập mạnh và fault isolation* — ví dụ nhúng plugin của bên thứ ba, dashboard hợp nhất nhiều app legacy, hay sandbox nội dung không tin cậy. Nó dở khi cần UX liền mạch, routing chung và SEO.

### Code minh hoạ

```html
<!-- Trang cha: nhúng MFE con và lắng nghe message -->
<iframe id="cart" src="https://cart.example.com" title="Giỏ hàng"></iframe>

<script>
  const ORIGIN_CON = 'https://cart.example.com';
  const iframe = document.getElementById('cart');

  // Gửi message xuống con (chỉ định targetOrigin, KHÔNG dùng '*')
  iframe.addEventListener('load', () => {
    iframe.contentWindow.postMessage(
      { type: 'SET_USER', userId: 42 },
      ORIGIN_CON,
    );
  });

  // Nhận message từ con — BẮT BUỘC kiểm tra origin để chống giả mạo
  window.addEventListener('message', (event) => {
    if (event.origin !== ORIGIN_CON) return; // chặn message từ origin lạ
    if (event.data?.type === 'CART_COUNT') {
      console.log('Số món trong giỏ:', event.data.count);
    }
  });
</script>
```

```js
// Bên trong MFE con (cart.example.com): trả lời cha
const ORIGIN_CHA = 'https://shell.example.com';

window.addEventListener('message', (event) => {
  if (event.origin !== ORIGIN_CHA) return; // chỉ tin cha hợp lệ
  if (event.data?.type === 'SET_USER') {
    loadCartForUser(event.data.userId);
  }
});

// Báo số lượng giỏ hàng ngược lên cha
function notifyCartCount(count) {
  window.parent.postMessage({ type: 'CART_COUNT', count }, ORIGIN_CHA);
}
```

### Đáp án mẫu

> "iframe cho em sự cô lập gần như tuyệt đối — CSS, JS global, window đều tách bạch, và con crash cũng không kéo sập cha, nên rất hợp để nhúng app legacy hoặc nội dung khác origin không tin cậy. Cái giá phải trả là UX: cha–con chỉ nói chuyện qua postMessage bất đồng bộ và bắt buộc kiểm tra origin; routing và deep-link rối vì URL là của trang cha; sizing phải tính chiều cao thủ công; SEO và accessibility kém; và mỗi iframe tải lại framework riêng gây trùng lặp. Nên em chọn iframe khi isolation và fault tolerance là ưu tiên số một, còn khi cần UX liền mạch và SEO thì em chuyển sang Web Components hoặc Module Federation."

---

## Câu 8: Dùng Web Components cho micro-frontend như thế nào? `[Intermediate]`

### Câu hỏi

> Web Components hay được nhắc đến như một cách tích hợp micro-frontend. Em mô tả cách áp dụng, và ưu nhược điểm so với iframe?

### Giải thích lý thuyết

Ý tưởng: mỗi MFE đóng gói thành một **Custom Element** — ví dụ `<team-cart>` — và app shell chỉ cần đặt thẻ đó vào DOM như một thẻ HTML bình thường. Bên trong, MFE có thể chạy bất kỳ framework nào (React, Vue, vanilla).

Ba mảnh chính của Web Components được dùng:

- **Custom Elements**: định nghĩa thẻ mới qua `customElements.define('team-cart', CartElement)`, với lifecycle `connectedCallback` (mount) và `disconnectedCallback` (unmount).
- **Shadow DOM**: tạo cây DOM con được **cô lập style** — CSS bên trong không rò ra ngoài, CSS ngoài không lọt vào. Đây là cơ chế isolation chính (nhẹ hơn iframe nhiều).
- **Giao tiếp dữ liệu**:
  - Vào: truyền qua **attributes** (chuỗi, qua `observedAttributes` + `attributeChangedCallback`) hoặc **properties** (object/function, gán trực tiếp lên element).
  - Ra: phát **CustomEvent** để cha lắng nghe — đúng tinh thần "data in, events out".

| Tiêu chí | iframe | Web Components |
| -------- | ------ | -------------- |
| Cô lập CSS | Tuyệt đối | Mạnh (Shadow DOM), không tuyệt đối |
| Cô lập JS global | Tuyệt đối | **Không** — chung `window` |
| Chia sẻ DOM / sự kiện | Khó (postMessage) | Tự nhiên (attribute/prop + CustomEvent) |
| Overhead runtime | Cao (tải lại framework) | Thấp hơn (chung context) |
| Chuẩn web, framework-agnostic | — | ✅ Có |

**Nhược điểm của Web Components:**

- **SSR khó**: Custom Elements & Shadow DOM vốn là client-side; SSR cần Declarative Shadow DOM và tooling còn non.
- **SEO / accessibility**: nội dung trong Shadow DOM crawl được nhưng cần cẩn thận; phải tự lo ARIA, focus xuyên shadow boundary.
- **Truyền object phức tạp**: attribute chỉ là chuỗi → object phải truyền qua property (gán JS), không qua HTML thuần; dễ sai khi dùng khai báo.
- Không cô lập JS global — vẫn có thể đụng `window`, polyfill, biến toàn cục.

> **Insight phỏng vấn:** điểm bán hàng của Web Components là **chuẩn web + framework-agnostic** — team A viết React, team B viết Vue, cùng expose custom element và shell ghép lại mà không khoá vào framework nào. Nhấn rằng nó cho isolation style "vừa đủ" qua Shadow DOM mà không gánh chi phí nặng của iframe.

### Code minh hoạ

```tsx
// cart-element.tsx — bọc một React app thành Custom Element
import { createRoot, Root } from 'react-dom/client';
import CartApp from './CartApp';

class TeamCart extends HTMLElement {
  private root: Root | null = null;

  // Khai báo những attribute cần theo dõi
  static get observedAttributes() {
    return ['user-id'];
  }

  // Lifecycle: mount khi element được gắn vào DOM
  connectedCallback() {
    // Shadow DOM để cô lập style của MFE
    const shadow = this.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    shadow.appendChild(container);

    this.root = createRoot(container);
    this.render();
  }

  // Re-render khi attribute thay đổi (data in)
  attributeChangedCallback() {
    if (this.root) this.render();
  }

  // Unmount để tránh leak
  disconnectedCallback() {
    this.root?.unmount();
    this.root = null;
  }

  private render() {
    const userId = Number(this.getAttribute('user-id')) || 0;

    // Events out: phát CustomEvent cho shell lắng nghe
    const onCheckout = (total: number) =>
      this.dispatchEvent(
        new CustomEvent('checkout', { detail: { total }, bubbles: true }),
      );

    this.root?.render(<CartApp userId={userId} onCheckout={onCheckout} />);
  }
}

customElements.define('team-cart', TeamCart);
```

```html
<!-- App shell dùng MFE như một thẻ HTML bình thường -->
<team-cart user-id="42"></team-cart>

<script type="module">
  import 'https://cart.example.com/cart-element.js';

  // Lắng nghe sự kiện do MFE phát ra (events out)
  document.querySelector('team-cart')
    .addEventListener('checkout', (e) => {
      console.log('Thanh toán, tổng tiền:', e.detail.total);
    });
</script>
```

### Đáp án mẫu

> "Em đóng gói mỗi MFE thành một Custom Element, ví dụ `<team-cart>`, và app shell chỉ việc đặt thẻ đó vào DOM. Bên trong em dùng Shadow DOM để cô lập style — nhẹ hơn iframe nhiều mà CSS không rò ra ngoài. Dữ liệu vào qua attribute hoặc property, sự kiện ra qua CustomEvent, đúng kiểu data in - events out. Ưu lớn nhất là nó là chuẩn web và framework-agnostic, nên team React và team Vue vẫn ghép chung được. Nhược là SSR còn khó vì Custom Elements vốn client-side, SEO và accessibility phải tự lo, và truyền object phức tạp phải qua property chứ không qua attribute chuỗi. Khác iframe ở chỗ Web Components chung window nên không cô lập JS global, đổi lại giao tiếp tự nhiên và overhead thấp hơn nhiều."

---

## Câu 9: Có những công nghệ và framework nào để xây micro-frontend? `[Basic]`

### Câu hỏi

> Trên thị trường có những công nghệ, thư viện, framework nào để hiện thực micro-frontend? Em điểm qua và nói nhóm nào hợp với trường hợp nào?

### Giải thích lý thuyết

Có thể nhóm các công cụ theo **cách tiếp cận tích hợp**:

| Nhóm | Công cụ tiêu biểu | Đặc điểm |
| ---- | ----------------- | -------- |
| **Module Federation** | Webpack 5 Module Federation; `@module-federation/vite` hoặc `@originjs/vite-plugin-federation` (Vite); **Native Federation** (chuẩn import maps, không khoá bundler) | Container nạp module remote lúc runtime, chia sẻ dependency (React, v.v.) — deploy độc lập thật sự |
| **Orchestrator (app-level)** | **single-spa** (+ SystemJS / import maps), **qiankun** (dựa trên single-spa, có sandbox JS/CSS), **Luigi** (SAP, hướng iframe) | Điều phối nhiều "app con" theo route, hỗ trợ trộn nhiều framework |
| **Nền tảng / framework chuyên dụng** | **Piral** (mô hình "pilet"), **Bit** (chia sẻ & version component độc lập) | Cung cấp sẵn shell, registry, lifecycle |
| **Web standard thuần** | **iframe**, **Web Components** (Custom Elements + Shadow DOM) | Không thêm runtime lớn; isolation dựa trên chuẩn trình duyệt |
| **Monorepo / build tooling** | **Nx**, **Turborepo** | Không phải cơ chế tích hợp runtime — quản lý nhiều package/app trong một repo, hỗ trợ build-time integration và chia sẻ code |

Vài lưu ý kỹ thuật để không nói sai trong phỏng vấn:

- **Module Federation** ra đời cùng Webpack 5 và là lựa chọn runtime phổ biến nhất; hệ sinh thái Module Federation (project độc lập) nay hỗ trợ cả Vite và Rspack.
- **Native Federation** dùng **import maps** chuẩn web nên không phụ thuộc một bundler cụ thể.
- **qiankun** xây trên single-spa, bổ sung sandbox để cô lập JS/CSS giữa các app con.
- **Nx/Turborepo là monorepo tooling**, không phải bản thân cơ chế micro-frontend — đừng xếp ngang hàng với Module Federation.

> **Insight phỏng vấn:** chốt lại bằng câu "không có cái tốt nhất tuyệt đối". Lựa chọn phụ thuộc **team và tech stack**: stack Webpack/Vite đồng nhất → Module Federation; nhiều framework khác nhau cần điều phối theo route → single-spa/qiankun; ưu tiên chuẩn web không khoá bundler → Web Components hoặc Native Federation; chỉ cần chia sẻ code trong một repo → Nx/Turborepo.

### Code minh hoạ

```js
// webpack.config.js — cấu hình Module Federation cho app "remote" (cart)
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'cart',                       // tên remote
      filename: 'remoteEntry.js',         // file manifest cho host nạp
      exposes: {
        './CartApp': './src/CartApp',     // module được chia sẻ ra ngoài
      },
      shared: {                            // dùng chung dependency, tránh tải 2 lần
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
      },
    }),
  ],
};
```

```js
// Host nạp remote lúc runtime
const CartApp = await import('cart/CartApp'); // 'cart' khai báo trong remotes của host
```

### Đáp án mẫu

> "Em nhóm theo cách tiếp cận. Phổ biến nhất là **Module Federation** của Webpack 5, nay có cả bản cho Vite và Rspack, và **Native Federation** dùng import maps nên không khoá vào bundler. Nhóm orchestrator có **single-spa** điều phối nhiều app con theo route, và **qiankun** xây trên single-spa với sandbox cô lập JS/CSS. Nhóm nền tảng chuyên dụng có **Piral** với mô hình pilet và **Bit** để version component độc lập. Nhóm chuẩn web thuần là **iframe** và **Web Components**. Còn **Nx và Turborepo** là monorepo tooling, hỗ trợ build-time chứ không phải cơ chế tích hợp runtime nên em không xếp ngang hàng. Quan điểm của em là không có cái tốt nhất — chọn theo team và tech stack: stack đồng nhất thì Module Federation, nhiều framework thì single-spa/qiankun, ưu tiên chuẩn web thì Web Components hoặc Native Federation."

---

## Bẫy thường gặp khi trả lời

| Sai lầm | Đúng là |
| ------- | ------- |
| Liệt kê tên công nghệ (Module Federation, single-spa...) mà không phân loại | Phân loại theo **thời điểm tích hợp**: build-time, server-side, run-time/client-side, rồi nói trade-off từng nhóm |
| Coi build-time (npm package) là micro-frontend "thật" | Build-time mất tính deploy độc lập — gần với chia sẻ component hơn; deploy độc lập thật sự cần tích hợp runtime |
| Nói "iframe đã lỗi thời, đừng dùng" | iframe vẫn đúng khi cần **cô lập mạnh và fault isolation** (app legacy, nội dung không tin cậy); chỉ dở về UX, routing, SEO |
| Quên kiểm tra `event.origin` khi nhận `postMessage` | Luôn kiểm tra `origin` và chỉ định `targetOrigin` cụ thể — bỏ qua là lỗ hổng bảo mật |
| Cho rằng Web Components cô lập mọi thứ như iframe | Shadow DOM chỉ cô lập **style**; JS global vẫn chung `window` — không cô lập runtime |
| Xếp Nx/Turborepo ngang hàng Module Federation | Nx/Turborepo là **monorepo tooling** (build-time, chia sẻ code), không phải cơ chế tích hợp runtime |
| Khẳng định có một framework "tốt nhất" | Không có best tuyệt đối — chọn theo **team và tech stack**, nêu được tiêu chí lựa chọn |
