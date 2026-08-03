---
sidebar_position: 3
title: "3. Caching & Network"
---

# Caching & Network

> *Cách nhanh nhất để load một resource là không load nó. Caching là chủ đề mà nhiều FE dev né — và đó chính là lý do interviewer thích hỏi.*

:::note[Ghi nhớ nhanh]

- ⭐ **`Cache-Control` directives** — `max-age` (fresh, không hỏi server), `no-cache` (được cache nhưng phải revalidate trước mỗi lần dùng), `no-store` (không lưu gì).
- **Revalidation** — `ETag` ↔ `If-None-Match`, `Last-Modified` ↔ `If-Modified-Since`; server trả `304` nếu chưa đổi.
- ⭐ **Chiến lược SPA** — JS/CSS có content hash trong tên → `immutable` cache 1 năm; HTML entry → `no-cache` để nhận deploy mới ngay.
- **`stale-while-revalidate`** — dùng tạm bản cũ, đồng thời fetch bản mới ở background.

:::

---

## Câu 1: HTTP caching hoạt động như thế nào? Cache-Control headers? `[Intermediate]`

### Câu hỏi

> HTTP caching hoạt động thế nào? Em giải thích các directive của `Cache-Control` và chiến lược cache cho một SPA điển hình (HTML, JS/CSS, ảnh, API)?

### Giải thích lý thuyết

Flow của HTTP cache: browser request resource → kiểm tra cache → nếu có và còn **fresh** (chưa quá `max-age`) thì dùng luôn không hỏi server; nếu **stale** thì gửi **conditional request** (revalidation) — server trả `304 Not Modified` (dùng lại cache) hoặc `200` kèm body mới.

Các directive `Cache-Control` quan trọng:

| Directive | Ý nghĩa |
| --------- | ------- |
| `max-age=N` | Fresh trong N giây — trong thời gian này không hỏi server |
| `no-cache` | **Được cache**, nhưng phải revalidate trước mỗi lần dùng (hay bị hiểu nhầm!) |
| `no-store` | Không lưu gì cả — dữ liệu nhạy cảm |
| `public` / `private` | Cho phép shared cache (CDN, proxy) / chỉ browser cache |
| `immutable` | Nội dung không bao giờ đổi — bỏ qua revalidation kể cả khi user reload |
| `stale-while-revalidate=N` | Hết hạn vẫn dùng tạm, đồng thời fetch bản mới ở background |
| `s-maxage=N` | max-age riêng cho shared cache (CDN) — override `max-age` |

Revalidation dùng cặp header:

- `ETag` (hash nội dung) ↔ request gửi `If-None-Match`.
- `Last-Modified` ↔ `If-Modified-Since`.

**Chiến lược chuẩn cho SPA** — dựa trên **cache busting bằng content hash**:

- **JS/CSS có hash trong tên file** (`app.3f2a1b.js`): `max-age=31536000, immutable` — cache 1 năm; deploy mới đổi hash → URL mới → tự "bust".
- **HTML** (entry point): `no-cache` — luôn revalidate để user nhận được reference tới bundle mới ngay sau deploy.
- **Ảnh/static**: `max-age` dài + CDN.
- **API**: tuỳ dữ liệu — `private, no-cache` + ETag, hoặc `stale-while-revalidate` cho dữ liệu đọc nhiều ít đổi.

### Code minh hoạ

```nginx
# nginx — chiến lược cache cho SPA
# Assets có content hash: cache 1 năm, không bao giờ revalidate
location /assets/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}

# HTML entry: luôn revalidate (ETag tự động) — user nhận deploy mới ngay
location / {
  add_header Cache-Control "no-cache";
  try_files $uri /index.html;
}
```

```http
# Lần 1: server trả resource kèm ETag
HTTP/1.1 200 OK
Cache-Control: no-cache
ETag: "abc123"

# Lần 2: browser revalidate
GET /index.html
If-None-Match: "abc123"

# Nội dung chưa đổi → 304, không gửi lại body (tiết kiệm bandwidth)
HTTP/1.1 304 Not Modified
```

```js
// API response với stale-while-revalidate: user thấy data ngay, bản mới về sau
res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
```

### Đáp án mẫu

> "HTTP cache hoạt động theo 2 pha: khi resource còn fresh trong `max-age`, browser dùng thẳng không hỏi server; khi stale, browser gửi conditional request với `If-None-Match`/ETag — server trả 304 nếu chưa đổi, tiết kiệm toàn bộ body. Điểm hay bị nhầm: `no-cache` vẫn cache nhưng bắt revalidate mỗi lần, còn `no-store` mới là không lưu. Chiến lược chuẩn cho SPA của em dựa trên content hash: JS/CSS có hash trong filename thì `max-age=31536000, immutable` — cache 1 năm, deploy mới đổi hash tự bust; HTML entry thì `no-cache` để user nhận bundle mới ngay sau deploy; API thì tuỳ — dữ liệu đọc nhiều ít đổi em dùng `stale-while-revalidate` để user thấy ngay bản cũ trong khi bản mới về background. Sai lầm em từng gặp phải debug: HTML bị cache `max-age` dài → sau deploy user vẫn load index cũ trỏ tới chunk đã xoá → trang trắng."

---

## Câu 2: Image optimization — các kỹ thuật phổ biến? `[Intermediate]`

### Câu hỏi

> Ảnh thường chiếm phần lớn page weight. Em hãy nêu các kỹ thuật tối ưu ảnh trên web và cách áp dụng?

### Giải thích lý thuyết

Ảnh thường chiếm ~50% tổng byte của một trang — tối ưu ảnh là việc có ROI cao nhất. Các kỹ thuật theo nhóm:

**1. Format hiện đại:**

- **AVIF** — nén tốt nhất (~50% nhỏ hơn JPEG), support rộng từ 2024.
- **WebP** — fallback tốt, support gần như mọi browser.
- Dùng `<picture>` để fallback dần: AVIF → WebP → JPEG.
- SVG cho icon/logo; video MP4 thay GIF (GIF cực kỳ nặng).

**2. Đúng kích thước (responsive images):**

- `srcset` + `sizes`: browser tự chọn ảnh khớp viewport và DPR — không ship ảnh 2000px cho màn hình 400px.

**3. Load đúng lúc, đúng độ ưu tiên:**

- `loading="lazy"` cho ảnh dưới fold; **không** cho LCP image.
- `fetchpriority="high"` + preload cho hero image.
- `decoding="async"` để decode không block main thread.

**4. Tránh CLS:** luôn có `width`/`height` hoặc `aspect-ratio`.

**5. Hạ tầng:**

- Image CDN (Cloudinary, imgix, Next.js Image Optimization) — resize/convert/nén on-the-fly theo query param, cache tại edge.
- Placeholder: LQIP/blur-up (Next.js `placeholder="blur"`) hoặc dominant color — cải thiện perceived performance.

### Code minh hoạ

```html
<!-- Format fallback + responsive + đúng priority -->
<picture>
  <source type="image/avif" srcset="/hero-800.avif 800w, /hero-1600.avif 1600w" sizes="100vw" />
  <source type="image/webp" srcset="/hero-800.webp 800w, /hero-1600.webp 1600w" sizes="100vw" />
  <img
    src="/hero-1600.jpg"
    srcset="/hero-800.jpg 800w, /hero-1600.jpg 1600w"
    sizes="100vw"
    width="1600"
    height="900"
    fetchpriority="high"
    decoding="async"
    alt="Hero"
  />
</picture>

<!-- Ảnh trong list dưới fold -->
<img src="/product.webp" width="300" height="300" loading="lazy" decoding="async" alt="..." />
```

```jsx
// Next.js <Image> gói hầu hết best practices: tự convert AVIF/WebP,
// tự srcset, lazy mặc định, chống CLS bằng width/height bắt buộc
import Image from "next/image";

<Image
  src="/products/shoe.jpg"
  width={600}
  height={600}
  alt="Giày chạy bộ"
  placeholder="blur"
  blurDataURL={shoe.blurDataURL} // LQIP — perceived performance
  sizes="(max-width: 768px) 100vw, 33vw"
/>;
```

### Đáp án mẫu

> "Ảnh chiếm khoảng nửa page weight nên đây là chỗ ROI cao nhất. Em tối ưu theo 5 nhóm: **format** — AVIF/WebP qua thẻ `<picture>` fallback dần, SVG cho icon, video MP4 thay GIF; **kích thước** — `srcset` và `sizes` để mobile không phải tải ảnh desktop; **timing và priority** — lazy load dưới fold nhưng tuyệt đối không lazy ảnh LCP, hero thì `fetchpriority="high"` cộng preload; **chống CLS** — luôn khai báo width/height; và **hạ tầng** — image CDN resize/convert on-the-fly tại edge, kèm blur placeholder cho perceived performance. Trong dự án Next.js, component `<Image>` gói gần hết các practice này nên em enforce dùng nó qua lint rule. Một lần audit, riêng việc chuyển JPEG sang AVIF và fix srcset đã giảm 60% byte ảnh và kéo LCP mobile từ 4s xuống 2.3s."

---

## Câu 3: Service Worker và caching strategy trong PWA? `[Senior]`

### Câu hỏi

> Service Worker là gì và khác gì HTTP cache? Em hãy trình bày các caching strategy phổ biến trong PWA và khi nào dùng từng loại?

### Giải thích lý thuyết

**Service Worker (SW)** là một script chạy trên **thread riêng**, đóng vai trò **programmable network proxy** giữa app và network: intercept mọi `fetch`, tự quyết định trả từ cache, từ network, hay tự tạo response. Đặc điểm: không truy cập DOM, lifecycle riêng (install → waiting → activate), yêu cầu HTTPS, dùng **Cache Storage API** (khác HTTP cache).

Khác HTTP cache: HTTP cache là **declarative** (server set header, browser tự quyết), SW cache là **imperative** (dev viết logic bằng JS, kiểm soát hoàn toàn) — nhờ đó làm được **offline**, precache, background sync, push notification.

Các caching strategy chuẩn:

| Strategy | Cách hoạt động | Dùng cho |
| -------- | -------------- | -------- |
| **Cache First** | Có trong cache → trả luôn; không có → fetch rồi cache | Static assets có hash, font, ảnh |
| **Network First** | Thử network trước; fail → fallback cache | API data cần mới, HTML; offline vẫn xem được bản cũ |
| **Stale While Revalidate** | Trả cache ngay + fetch update background | Data đọc nhiều, chấp nhận cũ một nhịp (avatar, config) |
| **Network Only** | Luôn network | Request không được cache (POST, payment) |
| **Cache Only** | Luôn cache | App shell đã precache |

Lifecycle gotchas (điểm phân biệt Senior): SW mới install xong vào trạng thái **waiting** đến khi mọi tab cũ đóng — cần `skipWaiting()` + `clients.claim()` (kèm UX "có bản mới, bấm reload"); quên version cache cũ → storage phình; HTML bị precache sai có thể khiến user mắc kẹt ở bản cũ. Thực tế nên dùng **Workbox** thay vì viết tay.

### Code minh hoạ

```js
// sw.js — precache app shell + runtime strategies
const STATIC_CACHE = "static-v3"; // đổi version khi deploy

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.addAll(["/", "/offline.html", "/app.css"]))
  );
});

// Xoá cache version cũ — quên bước này là storage phình mãi
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;

  // Network First cho API — offline thì fallback bản cache
  if (request.url.includes("/api/")) {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open("api-v1").then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache First cho static — kèm offline fallback cho navigation
  e.respondWith(
    caches.match(request).then(
      (cached) => cached ?? fetch(request).catch(() => caches.match("/offline.html"))
    )
  );
});
```

```js
// Thực tế: dùng Workbox cho gọn và an toàn
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 3600 })],
  })
);
registerRoute(({ url }) => url.pathname.startsWith("/api/"), new NetworkFirst());
registerRoute(({ request }) => request.destination === "script", new StaleWhileRevalidate());
```

### Đáp án mẫu

> "Service Worker là script chạy thread riêng làm programmable proxy — intercept mọi fetch và tự quyết trả cache hay network. Khác HTTP cache ở chỗ: HTTP cache là declarative qua header, SW là imperative bằng JS nên làm được offline, precache, background sync. Em chọn strategy theo loại resource: **Cache First** cho asset có content hash vì không bao giờ đổi; **Network First** cho API và HTML — cần mới nhất nhưng offline vẫn xem được bản cũ; **Stale While Revalidate** cho data đọc nhiều chấp nhận cũ một nhịp. Phần dễ trượt là lifecycle: SW mới nằm ở waiting đến khi đóng hết tab cũ — em xử lý bằng `skipWaiting` kèm banner 'có bản mới' cho user chủ động reload; và phải dọn cache version cũ trong `activate` không thì storage phình. Thực tế em dùng Workbox thay vì viết tay — đã có sẵn expiration, routing, và ít bug lifecycle hơn."
