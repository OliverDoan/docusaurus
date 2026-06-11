---
sidebar_position: 2
title: "2. Rendering & JavaScript SEO"
---

# Rendering & JavaScript SEO

> *Đây là phần "frontend nhất" của SEO — nơi quyết định kiến trúc (CSR/SSR/SSG) ảnh hưởng trực tiếp đến việc Google có thấy content hay không. Interviewer senior rất hay đào sâu phần này.*

---

## Câu 7: CSR, SSR, SSG ảnh hưởng SEO như thế nào? Cách Google crawl SPA? `[Intermediate]`

### Câu hỏi

> So sánh ảnh hưởng của CSR, SSR, SSG đến SEO? Google crawl một SPA (React thuần) như thế nào?

### Giải thích lý thuyết

**Cách Googlebot xử lý JavaScript — quy trình 2 đợt (two waves of indexing):**

1. **Đợt 1 — Crawl HTML**: Googlebot tải HTML thô, index ngay nội dung có sẵn, thu thập link.
2. **Đợt 2 — Render**: trang được đưa vào **render queue**, chờ Web Rendering Service (Chromium headless) chạy JavaScript rồi index nội dung sau render. Đợt này có thể trễ **từ vài giây đến vài ngày** tuỳ crawl budget.

So sánh từng rendering strategy:

| | CSR (React SPA thuần) | SSR | SSG |
| --- | --- | --- | --- |
| HTML ban đầu | Gần rỗng (`<div id="root">`) | Đầy đủ content | Đầy đủ content |
| Index đợt 1 | ❌ Không có gì để index | ✅ | ✅ |
| Phụ thuộc render queue | **Hoàn toàn** | Không | Không |
| TTFB | Nhanh (HTML rỗng) | Chậm hơn (render mỗi request) | Nhanh nhất (file tĩnh + CDN) |
| Rủi ro SEO | Cao: JS lỗi/timeout → không index; index chậm | Thấp | Thấp nhất |
| Phù hợp | Dashboard, app sau login | Content cá nhân hoá, data thay đổi liên tục | Blog, docs, landing, product page ít đổi |

**Rủi ro thực tế của CSR với SEO:**

- Content chỉ xuất hiện sau khi JS chạy → index **chậm** (chờ render queue) và **dễ lỗi** (JS error, timeout, API chậm → Google thấy trang trống).
- Googlebot **không tương tác** (không click, không scroll vô hạn) → content load khi scroll/click sẽ không được index.
- Các search engine và social crawler khác (Facebook, Twitter/X, Zalo) phần lớn **không chạy JS** → CSR mất luôn link preview.

Kết luận thực dụng: trang **public cần SEO** → SSG/SSR (hoặc framework như Next.js); trang **sau login** → CSR thoải mái vì Google không crawl được dù sao.

### Code minh hoạ

```html
<!-- CSR: những gì Googlebot thấy ở đợt crawl 1 -->
<html>
  <head><title>My Shop</title></head>
  <body>
    <div id="root"></div>          <!-- trống! -->
    <script src="/bundle.js"></script>
  </body>
</html>
```

```bash
# Tự kiểm tra "Google thấy gì" — xem HTML thô không chạy JS
curl -s https://myshop.vn/products/ao-thun | grep -i "ao thun"
# CSR: không có kết quả → content phụ thuộc render queue
# SSR/SSG: thấy content ngay trong HTML
```

```tsx
// Next.js: cùng một component React, đổi chiến lược render bằng config
// SSG + ISR cho trang sản phẩm
export const revalidate = 3600; // re-build mỗi giờ

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug); // chạy lúc build/revalidate
  return <h1>{product.name}</h1>; // có sẵn trong HTML
}
```

### Đáp án mẫu

> "Google index theo hai đợt: đợt một crawl HTML thô và index ngay, đợt hai đưa trang vào render queue để chạy JavaScript — có thể trễ vài ngày. CSR thuần gửi về HTML gần rỗng nên phụ thuộc hoàn toàn vào đợt hai: index chậm, JS lỗi hay API timeout là Google thấy trang trống, và social crawler như Facebook không chạy JS nên mất luôn link preview. SSR và SSG trả về HTML đầy đủ nên được index ngay từ đợt một — SSG còn tốt nhất về TTFB vì serve file tĩnh qua CDN. Nguyên tắc của em: trang public cần SEO thì dùng SSG cho content ít đổi, SSR hoặc ISR cho content động; CSR chỉ dành cho dashboard sau login. Em hay verify bằng `curl` xem HTML thô có content không, và dùng URL Inspection trong Search Console để xem chính xác Google render trang ra sao."

---

## Câu 18: JavaScript SEO: những lỗi phổ biến khiến Google không index được content? `[Advanced]`

### Câu hỏi

> Em kể những lỗi JavaScript SEO phổ biến khiến content không được Google index? Cách phát hiện và debug?

### Giải thích lý thuyết

Các lỗi phổ biến nhất:

**1. Content phụ thuộc tương tác user** — Googlebot **không click, không scroll**:

- Infinite scroll không có pagination fallback → chỉ index batch đầu.
- Content trong tab/accordion chỉ render khi click (conditional render) → không index. (Nếu content có trong DOM nhưng ẩn bằng CSS thì vẫn được index.)

**2. Link không phải thẻ `<a href>`** — Googlebot chỉ theo link `<a>` có `href` hợp lệ:

```jsx
// ❌ Google không theo được
<div onClick={() => router.push("/products")}>Sản phẩm</div>
<a onClick={goTo}>Sản phẩm</a>          // không có href
<a href="javascript:void(0)">Sản phẩm</a>

// ✅
<Link href="/products">Sản phẩm</Link>  // render ra <a href="/products">
```

**3. Chặn resource trong robots.txt** — chặn JS/CSS/API mà trang cần để render → Google render ra trang hỏng.

**4. Lỗi runtime chỉ xảy ra với Googlebot** — code dựa vào API mà crawler không có (localStorage bị deny, geolocation, permission) mà không có error handling → JS crash → trang trống.

**5. Render quá chậm / timeout** — API chậm, bundle khổng lồ; Googlebot không chờ vô hạn (thực tế nên nhắm content xuất hiện trong vài giây).

**6. Soft 404 và lỗi routing SPA** — trang "Not Found" nhưng trả HTTP 200; hoặc dùng hash routing (`/#/products`) — phần sau `#` không được coi là URL riêng.

**7. Xoá hoặc ghi đè meta tags bằng JS** — canonical/noindex inject bằng JS client có thể được xử lý khác giữa 2 đợt index → kết quả khó đoán. Meta tags quan trọng nên có trong HTML thô.

**Công cụ debug:**

- **Google Search Console → URL Inspection → Test Live URL**: xem screenshot + rendered HTML đúng như Google thấy.
- **Rich Results Test** / Mobile-Friendly Test: cũng cho xem rendered HTML + console errors.
- `curl` hoặc View Source (không phải DevTools Elements — Elements là DOM sau JS): kiểm tra content có trong HTML thô không.
- Crawler tool (Screaming Frog với JS rendering) cho audit toàn site.

### Code minh hoạ

```jsx
// ❌ Infinite scroll thuần — Google chỉ thấy trang 1
function ProductList() {
  const { items, loadMore } = useInfiniteScroll();
  return <div onScroll={loadMore}>{items.map(...)}</div>;
}

// ✅ Infinite scroll + pagination fallback bằng link thật
function ProductList({ page }) {
  return (
    <>
      {items.map(...)}
      {/* Googlebot theo được link này để crawl trang sau */}
      <a href={`/products?page=${page + 1}`}>Trang tiếp</a>
    </>
  );
}
```

```js
// ❌ Crash với crawler không có localStorage
const theme = localStorage.getItem("theme").toUpperCase();

// ✅ Defensive — crawler deny storage thì vẫn render được
let theme = "light";
try {
  theme = localStorage.getItem("theme") ?? "light";
} catch {}
```

### Đáp án mẫu

> "Nhóm lỗi lớn nhất là content phụ thuộc tương tác — Googlebot không click, không scroll, nên infinite scroll không có pagination fallback hay content chỉ render khi click tab sẽ không được index. Thứ hai là link không phải thẻ `a` có `href` — div với onClick thì Google không theo được. Thứ ba là chặn nhầm JS/CSS/API trong robots.txt khiến Google render trang hỏng. Ngoài ra còn JS crash do thiếu error handling với môi trường crawler — ví dụ localStorage bị deny, soft 404 trả HTTP 200, hash routing, và meta tags bị inject hay ghi đè bằng JS client. Để debug, em dùng URL Inspection trong Search Console để xem rendered HTML và screenshot đúng như Google thấy, kết hợp curl để kiểm tra HTML thô. Giải pháp gốc rễ thường là chuyển content quan trọng sang SSR/SSG để không phụ thuộc JS execution."
