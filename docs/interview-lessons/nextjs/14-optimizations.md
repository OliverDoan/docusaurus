---
sidebar_position: 14
title: "14. Optimizations"
---

# 14. Optimizations

## 1. Asset Optimization: Image, Font, Script

Bài học: [1. Asset Optimization: Image, Font, Script](../../nextjs/14-optimizations/1_asset-optimization.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `next/image` làm gì khác thẻ `<img>` thuần? Kể ít nhất bốn tối ưu nó thực hiện tự động.**

<details className="qa">
<summary>Xem đáp án</summary>

`<Image>` là một lớp bọc quanh `<img>`, thêm vào đó một dịch vụ tối ưu ảnh phía server:

- **Chuyển định dạng tự động** sang WebP/AVIF dựa trên `Accept` header của trình duyệt — giảm dung lượng đáng kể so với JPEG/PNG gốc.
- **Resize theo viewport**: sinh nhiều kích thước và gắn `srcset`, điện thoại không phải tải ảnh 4000px.
- **Lazy load mặc định**: ảnh ngoài màn hình chỉ tải khi sắp cuộn tới, không cần tự viết `loading="lazy"`.
- **Chống CLS**: nhờ `width`/`height` (hoặc `fill`), trình duyệt biết trước tỉ lệ khung và giữ chỗ sẵn.
- **Ưu tiên tải** qua prop `priority` cho ảnh LCP, thay cho việc tự đặt `fetchpriority` và `preload`.
- **Placeholder blur** để có trải nghiệm chuyển tiếp mượt.

Kết quả tối ưu được cache lại, nên lần sau phục vụ ngay.

</details>

**2. Vì sao `next/image` bắt buộc có `width`/`height` hoặc `fill`? Điều này liên quan thế nào tới `CLS`?**

<details className="qa">
<summary>Xem đáp án</summary>

Trình duyệt chỉ biết kích thước thật của ảnh sau khi tải xong. Nếu HTML không nói trước tỉ lệ, phần tử ảnh ban đầu cao 0px, rồi khi ảnh về thì nó "đẩy" toàn bộ nội dung bên dưới xuống — đó chính là **layout shift**, và tích luỹ lại thành điểm **CLS (Cumulative Layout Shift)** xấu.

Khi bạn khai báo `width` và `height`, Next.js tính ra **tỉ lệ khung hình** và sinh CSS giữ chỗ tương ứng, nên ô ảnh có đúng chiều cao ngay từ lượt vẽ đầu tiên. Lưu ý hai con số này là **tỉ lệ dự kiến**, không bắt buộc bằng kích thước hiển thị thực tế — CSS vẫn quyết định kích thước cuối cùng.

`fill` dành cho trường hợp không biết trước tỉ lệ: ảnh được định vị tuyệt đối lấp đầy phần tử cha, và chính **phần tử cha** phải có kích thước xác định để giữ chỗ.

</details>

**3. Khi nào nên dùng prop `priority`? Nếu đặt `priority` cho mọi ảnh thì hậu quả là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`priority` dành cho ảnh **nằm trong màn hình đầu tiên và có khả năng là phần tử LCP** — điển hình là ảnh hero, ảnh bìa bài viết, logo lớn ở đầu trang. Nó tắt lazy load và thêm preload cùng gợi ý fetch priority cao, giúp ảnh bắt đầu tải sớm hơn thay vì phải chờ trình duyệt phát hiện.

```tsx
<Image src="/hero.jpg" alt="Hero" width={1200} height={630} priority />
```

Nếu đặt cho mọi ảnh thì **ưu tiên mất hết ý nghĩa**: hàng chục ảnh cùng tranh nhau băng thông và số kết nối, ảnh hero thật sự bị đẩy lùi, lazy load bị vô hiệu nên cả những ảnh người dùng không bao giờ cuộn tới cũng được tải. Kết quả thường là **LCP tệ hơn** so với khi không dùng gì. Quy tắc thực dụng: mỗi trang chỉ nên có một, nhiều nhất là hai ảnh `priority`.

</details>

**4. `fill` hoạt động ra sao và yêu cầu gì ở phần tử cha? Thường kết hợp với thuộc tính CSS nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`fill` khiến ảnh được định vị **tuyệt đối và giãn kín phần tử cha**, thay vì lấy kích thước từ `width`/`height`. Dùng khi bạn không biết trước tỉ lệ ảnh (ảnh do người dùng tải lên, ảnh từ CMS) hoặc muốn ảnh luôn lấp đầy một khung cố định.

Yêu cầu ở phần tử cha:

- Phải có `position` khác `static` — thường là `relative` (hoặc `absolute`, `fixed`).
- Phải có **kích thước xác định** (chiều cao cụ thể, hoặc `aspect-ratio`), nếu không ảnh sẽ cao 0.

```tsx
<div className="relative h-64 w-full">
  <Image src="/photo.jpg" alt="..." fill className="object-cover" />
</div>
```

Thuộc tính CSS hay đi kèm là **`object-fit`** (`object-cover` để cắt cho đầy khung, `object-contain` để hiện trọn ảnh) và `object-position` để chọn phần được giữ lại. Ngoài ra nên khai báo `sizes` vì với `fill` Next.js không đoán được bề rộng hiển thị.

</details>

**5. Prop `sizes` dùng để làm gì? Thiếu nó với ảnh responsive thì trình duyệt tải ảnh kiểu nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`sizes` cho trình duyệt biết **ảnh sẽ chiếm bao nhiêu bề rộng ở từng ngưỡng màn hình**, để nó chọn biến thể phù hợp trong `srcset` — quyết định này xảy ra rất sớm, trước cả khi CSS được áp dụng.

```tsx
<Image
  src="/photo.jpg"
  fill
  alt="..."
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

Nếu thiếu, với ảnh dùng `fill` hoặc responsive, Next.js mặc định coi như ảnh rộng bằng **100% viewport** (`100vw`). Hậu quả: một thumbnail chỉ hiển thị 200px vẫn khiến trình duyệt tải biến thể rộng bằng cả màn hình — lãng phí băng thông và làm chậm LCP, nhất là trên màn hình retina nơi hệ số nhân còn gấp đôi.

Ngược lại, khai báo `sizes` quá nhỏ so với thực tế thì ảnh bị vỡ. Nên bám đúng layout CSS thật.

</details>

**6. `placeholder="blur"` với ảnh import tĩnh khác gì với ảnh remote? Vì sao ảnh remote cần `blurDataURL`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Ảnh import tĩnh** (`import hero from "./hero.jpg"`): Next.js có file gốc ngay lúc build, nên nó **tự sinh ảnh mờ thu nhỏ** và nhúng sẵn. Bạn chỉ cần bật placeholder:

```tsx
import hero from "./hero.jpg";
<Image src={hero} alt="..." placeholder="blur" />
```

**Ảnh remote** (`src` là URL chuỗi): lúc build Next.js chưa tải ảnh đó về, thậm chí URL có thể chỉ tồn tại lúc chạy, nên không có gì để sinh bản mờ. Vì vậy bạn phải tự cung cấp:

```tsx
<Image
  src="https://cdn.example.com/photo.jpg"
  width={800}
  height={600}
  alt="..."
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

Cách lấy `blurDataURL` trong thực tế: sinh sẵn lúc upload và lưu vào database cùng bản ghi ảnh, hoặc dùng tính năng biến đổi của image CDN. Giữ chuỗi base64 thật nhỏ (vài chục byte tới ~1KB) vì nó nằm thẳng trong HTML.

</details>

**7. Vì sao ảnh remote phải khai báo trong `remotePatterns`? Đây là biện pháp phòng vấn đề bảo mật nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Endpoint tối ưu ảnh của Next.js nhận URL ảnh qua query string rồi **tự đi tải ảnh đó từ server của bạn**. Nếu không giới hạn nguồn, bất kỳ ai cũng có thể gọi endpoint với URL tuỳ ý:

- **Biến site của bạn thành open proxy**: kẻ xấu dùng tên miền của bạn để phục vụ ảnh của họ, tốn băng thông và chi phí tối ưu — một dạng lạm dụng tài nguyên/DoS về chi phí.
- **SSRF (Server-Side Request Forgery)**: ép server gửi request tới địa chỉ nội bộ hoặc metadata endpoint của cloud.
- **Rủi ro nội dung**: ảnh không mong muốn được phục vụ dưới tên miền đáng tin của bạn.

Vì vậy phải khai báo danh sách cho phép:

```ts
// next.config.ts
export default {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};
```

Nên khai báo **càng hẹp càng tốt** — thêm `pathname` và `port` nếu có thể, tránh dùng hostname dạng ký tự đại diện quá rộng.

</details>

**8. Image Optimization chạy ở đâu, tốn chi phí gì, và khi self-host ngoài Vercel thì cần chuẩn bị những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Ảnh được tối ưu **on-demand ở phía server**: request đầu tiên cho một tổ hợp (nguồn, kích thước, định dạng, chất lượng) sẽ kích hoạt việc resize và chuyển mã, kết quả được **cache** lại để các request sau phục vụ ngay. Với static export thì không có bước này, phải dùng loader ngoài.

Chi phí:

- **CPU và thời gian** cho lần xử lý đầu (ảnh lớn khá tốn).
- **Dung lượng lưu cache**, nhân lên theo số biến thể kích thước và định dạng.
- Trên Vercel còn tính theo số ảnh nguồn được tối ưu.

Khi self-host (Node server, Docker, AWS):

- Cài **`sharp`** — thư viện xử lý ảnh native, và nó chỉ chạy được ở **Node runtime**, không chạy trên Edge.
- Bảo đảm **cache bền vững** giữa các lần deploy và giữa các instance, nếu không mỗi lần khởi động lại phải xử lý lại từ đầu.
- Đặt một CDN phía trước để không đánh thẳng vào server.
- Hoặc đơn giản hơn: cấu hình `images.loader` trỏ sang image CDN bên ngoài (Cloudinary, imgix, Cloudflare Images) và để họ lo.

</details>

**9. `next/font` tối ưu bằng cách nào? Vì sao self-host font vừa nhanh hơn vừa tốt hơn về quyền riêng tư so với gọi Google Fonts CDN?**

<details className="qa">
<summary>Xem đáp án</summary>

`next/font` làm mấy việc **ngay lúc build**:

- **Tải file font về và phục vụ từ chính domain của bạn** (self-host), sinh sẵn `@font-face`.
- **Subset** theo bảng chữ cái khai báo (`subsets: ["latin"]`), cắt bỏ ký tự không dùng.
- **Preload** file font để nó tải song song với HTML thay vì đợi CSS.
- Tính **fallback metrics** (`size-adjust`, `ascent-override`...) để font dự phòng có kích thước gần font thật, gần như triệt tiêu layout shift.

Vì sao tốt hơn gọi Google Fonts CDN:

- **Nhanh hơn**: không phải phân giải DNS, bắt tay TLS với một domain thứ ba; và trước kia CSS của Google còn là tài nguyên chặn render, tạo chuỗi phụ thuộc CSS rồi mới tới file font. Cache của trình duyệt nay đã bị phân vùng theo site nên lợi thế "dùng chung cache" của CDN cũng không còn.
- **Riêng tư hơn**: trình duyệt không gửi IP và User-Agent tới máy chủ bên thứ ba — điểm từng khiến việc nhúng Google Fonts trực tiếp bị coi là vi phạm GDPR ở một số phán quyết tại châu Âu.

</details>

**10. `FOUT` và `FOIT` là gì? `font-display: swap` cùng fallback metrics (`size-adjust`) giải quyết chúng ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

- **FOIT (Flash Of Invisible Text)**: trong lúc font tuỳ chỉnh đang tải, trình duyệt **giấu hẳn chữ** — người dùng nhìn thấy khoảng trống. Đây là hành vi mặc định (`font-display: auto/block`) với thời gian chặn khoảng 3 giây.
- **FOUT (Flash Of Unstyled Text)**: chữ hiện ngay bằng font dự phòng rồi **đổi sang font thật**, gây cảm giác nhấp nháy và có thể xô lệch layout.

Hai cơ chế xử lý:

- **`font-display: swap`** chọn FOUT thay vì FOIT: nội dung đọc được ngay lập tức. Đây là đánh đổi có lợi cho LCP và trải nghiệm, vì chữ hiện sớm quan trọng hơn việc hiện đúng font ngay từ đầu.
- **Fallback metrics** (`size-adjust`, `ascent-override`, `descent-override`, `line-gap-override`) chỉnh font dự phòng sao cho **chiều cao chữ và bề rộng dòng gần khớp** font thật. Khi font thật về và thay thế, chữ gần như không nhảy — tức là loại bỏ phần layout shift của FOUT, chỉ còn thay đổi hình dáng chữ.

`next/font` bật cả hai cho bạn, nên đây là lý do chính nó "no layout shift".

</details>

**11. So sánh bốn `strategy` của `next/script` và cho ví dụ loại script phù hợp với từng cái.**

<details className="qa">
<summary>Xem đáp án</summary>

| Strategy | Thời điểm tải | Dùng cho |
|---|---|---|
| `beforeInteractive` | Trước khi hydration chạy, chèn vào HTML từ server | Script bắt buộc phải có trước khi trang tương tác: consent management, bot detection, công cụ chia nhánh A/B tránh nháy nội dung |
| `afterInteractive` (mặc định) | Ngay sau khi trang hydrate xong | Analytics, tag manager, đo lường — cần chạy sớm nhưng không chặn hiển thị |
| `lazyOnload` | Khi trình duyệt rảnh (idle), sau khi mọi thứ khác xong | Marketing pixel, chat widget, nút chia sẻ mạng xã hội, bình luận |
| `worker` | Trong Web Worker qua Partytown | Script nặng bên thứ ba mà bạn muốn đẩy ra khỏi luồng chính |

```tsx
<Script src="https://analytics.example.com/tracker.js" strategy="afterInteractive" />
<Script src="https://widget.chat.com/embed.js" strategy="lazyOnload" />
```

Nguyên tắc chọn: script càng ít liên quan tới nội dung chính thì càng đẩy về sau. Chỉ đặt `beforeInteractive` khi thực sự không còn cách nào khác, vì nó nằm trên đường tới hiển thị đầu tiên. Lưu ý `beforeInteractive` chỉ dùng được trong root layout.

</details>

**12. Vì sao script analytics không nên đặt `beforeInteractive`? Nó làm xấu chỉ số nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì analytics **không phải điều kiện để trang hiển thị hay tương tác** — mất vài trăm mili-giây dữ liệu đo lường chẳng hại gì, nhưng bắt người dùng chờ thì hại thật.

`beforeInteractive` chèn script vào HTML và chạy trước hydration, nghĩa là nó:

- Chiếm băng thông và kết nối tranh chấp với ảnh hero, CSS, font — làm **LCP** chậm đi.
- Chạy JavaScript trên luồng chính trước khi trang tương tác được, kéo dài thời gian trang "đơ" — làm xấu **INP** (và TBT trong Lighthouse).
- Nếu server của bên thứ ba chậm hoặc lỗi, trang của bạn lãnh hậu quả trực tiếp.

Lựa chọn đúng là `afterInteractive` (mặc định) cho analytics, `lazyOnload` cho pixel quảng cáo và chat widget. Nếu script bên thứ ba quá nặng, cân nhắc `strategy="worker"` để đẩy ra khỏi luồng chính.

</details>

**13. `strategy="worker"` (Partytown) hoạt động thế nào, và hạn chế của nó là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Partytown chuyển script bên thứ ba sang chạy trong **Web Worker**, tức một luồng riêng không tranh chấp với luồng chính. Vì worker không truy cập được DOM, Partytown dựng một **proxy**: mọi lời gọi tới `document`, `window`, `localStorage` từ trong worker được chặn lại và chuyển tiếp về luồng chính thông qua cơ chế đồng bộ (dùng service worker hoặc `SharedArrayBuffer`) rồi trả kết quả ngược lại. Với script analytics — vốn chủ yếu đọc vài thuộc tính rồi gửi request — cách này hoạt động tốt và giải phóng đáng kể luồng chính.

Hạn chế:

- **Vẫn ở trạng thái thử nghiệm** trong Next.js, cần cài `@builder.io/partytown` và cấu hình thêm.
- Mỗi lần proxy đều tốn overhead, nên script tương tác nhiều với DOM sẽ **chậm hơn** chứ không nhanh hơn.
- Script thao tác DOM thật sự (chèn quảng cáo, vẽ widget, ghi lại phiên) thường **không chạy đúng**.
- Cần cấu hình hạ tầng (service worker, header) và phải kiểm thử kỹ từng script một.

</details>

**14. File đặt trong `public/` khác asset import qua bundler ở điểm nào về hashing, cache header và tối ưu build?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `public/` | Import qua bundler |
|---|---|---|
| Đường dẫn | Giữ nguyên tên, phục vụ từ gốc (`/logo.png`) | Được đổi thành tên có hash nội dung |
| Cache | Không có hash nên **không thể cache vĩnh viễn an toàn**; phải tự đặt header và lo chuyện invalidate | Hash đổi khi nội dung đổi, nên đặt được `immutable` cache một năm |
| Tối ưu build | Không được minify, không tree-shake, không xử lý gì | Được bundler xử lý, nén, loại bỏ nếu không dùng |
| Kiểm tra lúc build | Sai tên file chỉ lộ ra khi 404 lúc chạy | Sai đường dẫn là lỗi build ngay |
| Dùng cho | favicon, `robots.txt`, `sitemap.xml`, `manifest.json`, PDF tải về, file xác thực domain | Ảnh trong component, CSS, JS, font tuỳ chỉnh |

Nguyên tắc: `public/` dành cho file **phải có đúng tên đó ở đúng đường dẫn đó**; mọi thứ còn lại nên đi qua import để hưởng hashing và tối ưu. Ảnh trong `public/` vẫn dùng được với `<Image>` nhưng mất lợi ích tự sinh blur placeholder của ảnh import tĩnh.

</details>

**15. Ba chỉ số Core Web Vitals hiện nay là gì, ngưỡng "good" bao nhiêu, và mỗi công cụ trong bài cải thiện chỉ số nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Chỉ số | Đo điều gì | Ngưỡng "good" |
|---|---|---|
| **LCP** (Largest Contentful Paint) | Thời điểm khối nội dung lớn nhất hiện ra | ≤ 2,5s |
| **INP** (Interaction to Next Paint) | Độ trễ phản hồi tương tác của người dùng | ≤ 200ms |
| **CLS** (Cumulative Layout Shift) | Mức độ xô lệch bố cục ngoài ý muốn | ≤ 0,1 |

(INP đã thay thế FID từ năm 2024.)

Công cụ nào giúp chỉ số nào:

- **`next/image`** — chủ yếu **LCP** (ảnh nhẹ hơn, đúng kích thước, có `priority`) và **CLS** (giữ chỗ nhờ `width`/`height`).
- **`next/font`** — **CLS** (fallback metrics) và **LCP** (preload, self-host nên chữ hiện sớm).
- **`next/script`** — **INP** và **LCP** (đẩy script bên thứ ba ra khỏi đường tới hiển thị đầu tiên, giải phóng luồng chính).

Đo bằng Lighthouse cho dữ liệu phòng lab, nhưng số thật phải lấy từ RUM trên người dùng thực.

</details>

**16. Trường hợp nào KHÔNG nên dùng `next/image` mà nên để `<img>` hoặc SVG inline?**

<details className="qa">
<summary>Xem đáp án</summary>

- **SVG**: nên inline hoặc dùng `<img>`. SVG vốn đã là vector, nhẹ và co giãn vô hạn — chuyển sang WebP chỉ làm tệ đi. Inline còn cho phép đổi màu bằng CSS `currentColor` và animate. Ngoài ra pipeline tối ưu mặc định không xử lý SVG vì lý do bảo mật (SVG có thể chứa script).
- **Icon nhỏ**: dùng bộ icon component (ví dụ Lucide React) để tree-shake, hoặc sprite — mỗi icon một request tối ưu là lãng phí.
- **Ảnh cực nhỏ / data URI**: chi phí tối ưu lớn hơn lợi ích.
- **GIF động nhỏ**: pipeline có thể không giữ được animation như mong muốn; GIF lớn thì nên chuyển hẳn sang video MP4/WebM.
- **Ảnh từ nguồn không kiểm soát được**, không thể khai báo `remotePatterns` an toàn.
- **Static export hoặc hạ tầng không chạy được dịch vụ tối ưu** mà không muốn cấu hình loader ngoài.
- Ảnh đã được một image CDN khác tối ưu sẵn — khi đó tối ưu hai lần là thừa, trừ khi cấu hình loader trỏ sang CDN đó.

</details>

**17. Vì sao không nên nhét video lớn vào `public/`? Streaming service giải quyết được gì mà file tĩnh không làm được?**

<details className="qa">
<summary>Xem đáp án</summary>

File trong `public/` được phục vụ **nguyên vẹn, một chất lượng duy nhất**. Với video lớn, hậu quả là:

- Repo và bản deploy phình to, build chậm, nhiều nền tảng còn giới hạn dung lượng.
- Người dùng mạng yếu phải tải cùng bản chất lượng cao như người dùng cáp quang → buffer liên tục, LCP tệ nếu video nằm trong màn hình đầu.
- Không có hash tên file nên cache khó kiểm soát; băng thông đổ hết vào origin.

Streaming service (Mux, Cloudflare Stream, Vercel Blob + HLS) mang lại những thứ file tĩnh không có:

- **Adaptive bitrate (HLS/DASH)**: tự chuyển chất lượng theo băng thông thực tế của từng người xem.
- **Transcode sẵn nhiều độ phân giải và codec**, kèm thumbnail/poster tự sinh.
- **Phân phối qua CDN toàn cầu**, hỗ trợ tua nhanh mà không cần tải cả file.
- Bảo vệ nội dung (signed URL, DRM) và **số liệu người xem**.

Với video nhỏ hơn 5MB thì đặt trong `public/` kèm `poster` và `preload="metadata"` vẫn ổn.

</details>

**18. Một trang có `LCP` chậm do ảnh hero — mô tả quy trình chẩn đoán và các bước sửa của bạn theo thứ tự.**

<details className="qa">
<summary>Xem đáp án</summary>

Chẩn đoán trước:

1. Chạy Lighthouse hoặc tab Performance để **xác định đúng phần tử LCP** — đôi khi nó không phải ảnh bạn nghĩ.
2. Mở Network xem **thời điểm request ảnh bắt đầu** so với lúc HTML về: bắt đầu muộn nghĩa là vấn đề ở khâu phát hiện tài nguyên; bắt đầu sớm mà kết thúc muộn nghĩa là ảnh quá nặng.
3. Kiểm tra kích thước tải về so với kích thước hiển thị, và định dạng thật sự được phục vụ.

Sửa theo thứ tự:

1. Dùng `<Image>` nếu còn là `<img>` thuần, để có WebP/AVIF và `srcset`.
2. Thêm **`priority`** cho ảnh hero — bỏ lazy load, thêm preload.
3. Khai báo **`sizes`** đúng theo layout để không tải biến thể quá lớn.
4. Giảm chất lượng xuống mức mắt thường không phân biệt được và cắt ảnh về đúng tỉ lệ cần hiển thị.
5. Xoá mọi thứ chặn đường: font chặn render, script `beforeInteractive`, CSS thừa.
6. Nếu ảnh nằm trong Client Component chỉ render sau khi JS chạy, chuyển sang render phía server để trình duyệt thấy ảnh ngay trong HTML.
7. Đo lại và so sánh trên RUM, không chỉ Lighthouse.

</details>

**19. Bạn preload hay preconnect những tài nguyên nào, và làm sao tránh lạm dụng khiến băng thông bị tranh chấp?**

<details className="qa">
<summary>Xem đáp án</summary>

Nên preload/preconnect rất chọn lọc:

- **Preload**: ảnh LCP (`priority` của `next/image` đã làm việc này), font tuỳ chỉnh dùng ngay trong màn hình đầu (`next/font` cũng tự lo), và CSS/JS then chốt mà trình duyệt phát hiện muộn.
- **Preconnect**: tối đa hai tới ba domain bên thứ ba thật sự nằm trên đường tới nội dung chính — ví dụ image CDN hoặc API cung cấp dữ liệu hiển thị đầu tiên.
- **`dns-prefetch`** là lựa chọn rẻ hơn cho domain chỉ cần đến muộn.

Vì sao lạm dụng lại hại: preload không tạo thêm băng thông, nó chỉ **đổi thứ tự ưu tiên**. Preload mười thứ nghĩa là mười thứ đó cùng tranh nhau với ảnh hero, và chính ảnh hero bị chậm lại — kết quả ngược với mong muốn. Preconnect thừa thì lãng phí kết nối TCP/TLS và pin trên thiết bị di động.

Cách giữ kỷ luật: chỉ preload thứ **chắc chắn dùng trong màn hình đầu**, mỗi lần thêm đều phải đo lại LCP trước/sau, và dọn sạch những khai báo còn sót khi giao diện thay đổi (trình duyệt sẽ cảnh báo trong console nếu tài nguyên preload không được dùng).

</details>

---

## 2. Code Optimization: Metadata, Lazy Loading, Bundling

Bài học: [2. Code Optimization: Metadata, Lazy Loading, Bundling](../../nextjs/14-optimizations/2_code-optimization.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Code splitting` là gì, và Next.js tự động tách bundle theo những ranh giới nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Code splitting** là kỹ thuật chia JavaScript thành nhiều chunk nhỏ để trình duyệt **chỉ tải phần cần cho màn hình hiện tại**, thay vì một file khổng lồ chứa toàn bộ ứng dụng.

Next.js tách tự động theo ba ranh giới:

- **Theo route**: mỗi page có bundle riêng. Vào `/about` thì không phải tải code của `/dashboard`.
- **Theo ranh giới Client Component**: mọi thứ là Server Component **không gửi JS xuống client** chút nào — đây là cách cắt mạnh nhất, vì code không chỉ được hoãn mà biến mất hẳn khỏi bundle.
- **Theo lazy import**: `dynamic()` hoặc `React.lazy()` tạo chunk riêng, chỉ tải khi component thực sự được render.

Ngoài ra code dùng chung giữa nhiều route được gom vào **shared chunk** để tải một lần rồi cache. Output của `next build` hiển thị `Size` (riêng route) và `First Load JS` (tổng phải tải khi vào route đó lần đầu).

</details>

**2. Giải thích `tree shaking`: vì sao `import _ from "lodash"` làm phình bundle còn `import debounce from "lodash/debounce"` thì không?**

<details className="qa">
<summary>Xem đáp án</summary>

**Tree shaking** là việc bundler phân tích đồ thị import/export **tĩnh** của ES Module và loại bỏ những export không ai dùng.

Vấn đề với `lodash` bản gốc: nó được publish dưới dạng **CommonJS**, nơi `module.exports` là một object được dựng lúc chạy. Bundler không thể chứng minh an toàn rằng phần nào không dùng, nên giữ lại toàn bộ (~70KB).

```ts
// Tệ — kéo cả thư viện
import _ from "lodash";

// Tốt — import trực tiếp file của một hàm
import debounce from "lodash/debounce";

// Tốt — bản ESM có thể tree-shake
import { debounce } from "lodash-es";
```

Điều kiện để tree shaking hoạt động: thư viện phải là ESM, import phải tĩnh (không phải `require` có điều kiện), và không có **side effect** ẩn — package khai báo `sideEffects: false` trong `package.json` để bundler mạnh dạn cắt.

</details>

**3. Khác nhau giữa import tĩnh và `dynamic()` của `next/dynamic`? `dynamic()` ảnh hưởng thế nào tới initial bundle?**

<details className="qa">
<summary>Xem đáp án</summary>

**Import tĩnh** nối module vào đồ thị phụ thuộc của route, nên code đó nằm trong bundle ban đầu và được tải dù người dùng có nhìn thấy component hay không.

**`dynamic()`** bọc một `import()` động, khiến bundler cắt module thành **chunk riêng**; chunk chỉ được tải khi component được render lần đầu.

```tsx
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./HeavyChart"), {
  loading: () => <Skeleton />,
});
```

Ảnh hưởng tới initial bundle: kích thước tải lần đầu giảm đúng bằng phần code đã tách ra (kèm phụ thuộc riêng của nó). Đổi lại có **một lượt request mạng phụ** lúc component xuất hiện, nên cần `loading` để tránh khoảng trống.

Chỉ nên dùng cho component thật sự nặng và **không hiển thị ngay** — biểu đồ, rich text editor, bản đồ, modal. Tách một component 5KB chỉ khiến người dùng chờ thêm một round-trip.

</details>

**4. Khi nào nên đặt `ssr: false` trong `dynamic()`, và bạn đánh đổi điều gì về SEO cũng như `LCP`?**

<details className="qa">
<summary>Xem đáp án</summary>

Đặt `ssr: false` khi component **chỉ chạy được trong trình duyệt** — dùng `window`, `document`, `localStorage`, canvas/WebGL, thư viện bản đồ như Mapbox/Leaflet, hoặc thư viện đọc trực tiếp kích thước DOM. Không có nó, bước render phía server sẽ ném lỗi vì các API đó không tồn tại.

```tsx
const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});
```

Đánh đổi:

- **SEO**: nội dung của component **không nằm trong HTML** trả về từ server, nên bot không thấy (hoặc chỉ thấy nếu nó chịu chạy JS). Tuyệt đối không dùng cho nội dung chính cần index.
- **LCP**: nếu phần tử lớn nhất nằm trong component này, người dùng phải chờ tải JS, hydrate rồi mới thấy — LCP xấu đi rõ.
- **CLS**: cần `loading` giữ đúng chỗ, nếu không bố cục sẽ nhảy khi component xuất hiện.

Nguyên tắc: `ssr: false` cho tiện ích phụ nằm dưới màn hình đầu, không cho nội dung chính.

</details>

**5. Trong App Router, vì sao `next/dynamic` chỉ dùng được trong Client Component, còn Server Component phải dùng `Suspense` kèm `lazy`?**

<details className="qa">
<summary>Xem đáp án</summary>

`next/dynamic` sinh ra ranh giới lazy **ở phía client**: nó cần quản lý trạng thái tải, render `loading`, và tuỳ chọn `ssr: false` vốn chỉ có nghĩa khi có một client runtime để hoãn việc render. Server Component chạy một lần trên server, không có state, không hydrate, nên những cơ chế đó không áp dụng — đặc biệt `ssr: false` là vô nghĩa trong ngữ cảnh server.

Ở Server Component, cách tương đương là để React **stream** phần chậm:

```tsx
import { Suspense } from "react";
import Heavy from "./Heavy";

export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Heavy />
    </Suspense>
  );
}
```

Khác biệt bản chất: ở Server Component, thứ được hoãn là **dữ liệu và HTML** — server gửi fallback trước rồi stream phần thật xuống sau. Ở Client Component, thứ được hoãn là **JavaScript**. Ngoài ra bản thân Server Component đã không đóng góp gì vào client bundle, nên "lazy load để giảm bundle" không còn là mục tiêu ở đó.

</details>

**6. Chỉ số `First Load JS` trong output của `next build` nghĩa là gì, và bạn coi ngưỡng bao nhiêu là chấp nhận được?**

<details className="qa">
<summary>Xem đáp án</summary>

**First Load JS** là **tổng lượng JavaScript trình duyệt phải tải khi vào thẳng route đó lần đầu**: chunk riêng của route, cộng các shared chunk (framework React, runtime Next.js, code dùng chung giữa các route). Nó khác cột `Size` — cột đó chỉ là phần riêng của route.

```
Route (app)                Size      First Load JS
┌ ○ /                    5.2 kB        85 kB
├ ƒ /dashboard          15.3 kB        95 kB
```

Ngưỡng tham khảo trong bài:

- **Dưới 200KB (gzipped)** cho page chính là mục tiêu hợp lý.
- Mỗi route thêm nên dưới ~50KB.
- Dưới 100KB là rất tốt.

Lưu ý khi diễn giải: con số này là dung lượng đã nén, chưa tính CSS, ảnh và script bên thứ ba — nên một trang "85 kB" vẫn có thể chậm nếu nhúng nhiều tag bên ngoài. Và quan trọng hơn con số tuyệt đối là **xu hướng**: theo dõi để bundle không âm thầm phình lên qua từng PR.

</details>

**7. Bạn dùng công cụ nào để tìm chunk nặng, và quy trình tối ưu bundle của bạn gồm những bước nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Công cụ chính là **`@next/bundle-analyzer`**, cho ra bản đồ treemap thấy rõ package nào chiếm chỗ:

```bash
npm install -D @next/bundle-analyzer
ANALYZE=true npm run build
```

Bổ sung: bảng tóm tắt của chính `next build`, Coverage tab của DevTools để xem bao nhiêu JS thực sự được dùng, và các dịch vụ so sánh kích thước package.

Quy trình:

1. **Đo baseline** và ghi lại con số.
2. **Tìm chunk lớn nhất** rồi truy ngược xem ai import nó.
3. **Áp dụng cách xử lý phù hợp** — thường theo thứ tự hiệu quả: chuyển component sang Server Component; thay thư viện nặng bằng bản nhẹ; bật `optimizePackageImports` cho thư viện barrel; `dynamic()` cho component nặng hiển thị muộn; `serverExternalPackages` cho native module.
4. **Đo lại** để xác nhận cải thiện thật.
5. **Lặp** cho chunk lớn kế tiếp, và dừng khi lợi ích không còn đáng công.
6. **Chốt lại bằng ngân sách bundle** kiểm tra trong CI để không trôi ngược.

</details>

**8. So sánh `serverExternalPackages`, `transpilePackages` và `optimizePackageImports` — mỗi option giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

| Option | Vấn đề giải quyết | Ví dụ |
|---|---|---|
| `serverExternalPackages` | Package chạy ở **server** không nên bị bundle — thường là native module hoặc thư viện lớn; bundle chúng gây lỗi hoặc làm output nặng, cold start chậm | `sharp`, `@prisma/client` |
| `transpilePackages` | Package trong `node_modules` được publish ở dạng chưa biên dịch (ESM hiện đại, TS, JSX) mà môi trường đích không hiểu | Thư viện nội bộ trong monorepo |
| `optimizePackageImports` | Package dùng **barrel file** nên import vài thứ lại kéo cả thư viện | `lucide-react`, `@radix-ui/react-icons` |

```ts
// next.config.ts
export default {
  serverExternalPackages: ["sharp", "@prisma/client"],
  transpilePackages: ["some-untranspiled-pkg"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};
```

Tóm gọn: một cái nói "đừng bundle", một cái nói "hãy biên dịch giúp", một cái nói "hãy cắt bớt phần thừa". Chúng tác động ở ba khâu khác nhau nên hoàn toàn dùng chung được.

</details>

**9. Vì sao `optimizePackageImports` đặc biệt hiệu quả với thư viện icon dạng barrel file? Cơ chế bên dưới là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Thư viện icon thường có một **barrel file** — một `index.js` re-export hàng nghìn icon. Khi bạn viết:

```tsx
import { Search, User, Settings } from "lucide-react";
```

bundler phải nạp và phân tích toàn bộ barrel đó. Về lý thuyết tree shaking sẽ cắt phần thừa, nhưng thực tế việc phân tích hàng nghìn module rất chậm và thường không cắt sạch — kết quả có thể là hàng chục KB cho ba icon, cộng thời gian build tăng vọt.

`optimizePackageImports` **viết lại import lúc biên dịch**, biến câu lệnh trên thành các import trỏ thẳng tới file của từng icon:

```tsx
import Search from "lucide-react/dist/esm/icons/search";
```

Nhờ vậy bundler chỉ chạm đúng ba module. Kết quả trong bài: từ ~50KB xuống ~5KB cho ba icon, kèm build nhanh hơn rõ rệt. Lợi ích tương tự với các thư viện UI và utility dùng barrel. Một số package phổ biến đã được Next.js bật sẵn, phần còn lại bạn khai báo thêm.

</details>

**10. Metadata API hoạt động ra sao, và khác nhau giữa `metadata` tĩnh với `generateMetadata` async là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Bạn không tự viết thẻ trong `<head>`; thay vào đó **export metadata từ page hoặc layout**, Next.js gom lại theo cây route (page ghi đè layout) rồi sinh thẻ HTML tương ứng — `title`, `description`, Open Graph, Twitter card, `robots`, canonical, icon.

**`metadata` tĩnh** — dùng khi nội dung biết trước lúc build:

```tsx
export const metadata: Metadata = {
  title: "Home | My App",
  description: "Welcome to my app",
};
```

**`generateMetadata`** — hàm async, dùng khi metadata phụ thuộc dữ liệu động (params, dữ liệu từ API):

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);
  return { title: post.title, description: post.excerpt };
}
```

Khác biệt chính: một bên là object hằng, không tốn chi phí runtime; một bên chạy trên server, nhận `params` và `searchParams`, có thể `await` dữ liệu. Không được export cả hai trong cùng một file. Quan trọng với SEO vì các thẻ này nằm sẵn trong HTML từ server, không cần JS.

</details>

**11. Nếu `generateMetadata` và page cùng `fetch` một API thì có bị gọi hai lần không? Giải thích cơ chế memoize/dedupe.**

<details className="qa">
<summary>Xem đáp án</summary>

**Không** — chỉ gọi mạng một lần, miễn là hai nơi dùng cùng URL và cùng tuỳ chọn.

```tsx
async function generateMetadata({ params }) {
  const post = await fetchPost(slug); // gọi thật
  return { title: post.title };
}

export default async function Page({ params }) {
  const post = await fetchPost(slug); // dedupe — dùng lại kết quả
  return <article>{post.content}</article>;
}
```

Cơ chế: trong App Router, `fetch` được **memoize trong phạm vi một lần render request**. Next.js tạo khoá từ URL và options; lần gọi thứ hai trùng khoá sẽ nhận lại cùng promise thay vì đi ra mạng. Bộ nhớ tạm này sống trong vòng đời của request rồi bị bỏ, khác với Data Cache vốn tồn tại xuyên request.

Với nguồn dữ liệu **không dùng `fetch`** — truy vấn database qua ORM chẳng hạn — cơ chế này không tự áp dụng. Khi đó bọc hàm bằng **`cache()` của React** để có hiệu quả tương đương:

```ts
import { cache } from "react";
export const getPost = cache(async (slug: string) => db.post.find(slug));
```

</details>

**12. `title.template` ở root layout kết hợp với metadata của từng page như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`title` có thể là object với `default` và `template`. `template` chứa ký tự thay thế `%s`, và **mọi page con** chỉ cần khai báo phần riêng của mình:

```ts
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: "My App",
    template: "%s | My App",
  },
};

// app/about/page.tsx
export const metadata: Metadata = {
  title: "About", // render thành "About | My App"
};
```

Các quy tắc cần nhớ:

- **`default`** được dùng khi route con không khai báo `title` nào.
- **`template` chỉ áp dụng cho route con**, không áp cho chính segment khai báo nó — tiêu đề của layout gốc là `default`.
- Layout lồng nhau có thể khai báo template riêng, ghi đè template của cấp trên cho nhánh đó.
- Muốn một page thoát khỏi template, dùng `title: { absolute: "..." }`.

Lợi ích: giữ hậu tố thương hiệu nhất quán toàn site mà không phải lặp lại ở từng page.

</details>

**13. Chuyển một phần UI từ Client Component sang Server Component giúp giảm bundle ra sao, và giới hạn của cách này là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Đây là cách giảm bundle **triệt để nhất**: code của Server Component không chỉ được hoãn tải mà **không bao giờ được gửi xuống trình duyệt**. Cùng với nó, mọi thư viện mà component đó import — thư viện markdown, thư viện định dạng ngày, SDK truy vấn dữ liệu — cũng biến mất khỏi client bundle. Client chỉ nhận kết quả đã render.

Kỹ thuật thường dùng là **đẩy ranh giới `"use client"` xuống càng sâu càng tốt**: thay vì đánh dấu cả trang là client, chỉ đánh dấu đúng nút bấm hay form cần tương tác.

Giới hạn:

- Server Component **không có state, effect, ref, event handler**, không dùng được browser API. Mọi thứ cần tương tác vẫn phải là client.
- **Props truyền từ server sang client phải serialize được** — không truyền hàm, class instance hay `Date` phức tạp một cách tuỳ tiện.
- Không dùng được context của React ở phía server theo cách quen thuộc.
- Server Component **render lại ở server**, nên phần tương tác cần cập nhật tức thì vẫn phải nằm ở client.
- Thư viện UI cũ chưa hỗ trợ RSC có thể buộc phải bọc client.

</details>

**14. Vì sao chia chunk quá nhỏ (over-fragmentation) lại có hại? Bạn cân bằng số lượng chunk và kích thước chunk thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi chunk là một **request riêng** với chi phí cố định: round-trip mạng, header, thời gian xử lý. Chia quá nhỏ dẫn tới:

- **Waterfall**: chunk A tải xong mới biết cần chunk B, chuỗi phụ thuộc kéo dài, đặc biệt đau trên mạng di động độ trễ cao.
- **Mất hiệu quả nén**: gzip/brotli nén kém hơn trên nhiều file nhỏ so với một file gộp.
- **Nhiều khoảnh khắc `loading`** nhấp nháy, trải nghiệm rời rạc và dễ gây layout shift.
- Overhead runtime của module loader tăng theo số chunk.

Ngưỡng tham khảo trong bài:

- Initial bundle: **100–200KB** gzipped.
- Mỗi route thêm: dưới ~50KB.
- Chỉ tách chunk lazy khi phần đó **lớn hơn ~50KB**.

Cách cân bằng thực dụng: tách theo **hành vi người dùng** chứ không theo con số — cái gì không hiện trong màn hình đầu và không phải ai cũng mở (modal, tab phụ, biểu đồ, editor) thì tách; phần còn lại gộp chung. Sau mỗi lần tách thì đo lại, đừng `dynamic()` theo phản xạ.

</details>

**15. Tình huống: trang dashboard có `First Load JS` khoảng `400KB` và `LCP` chậm — bạn điều tra rồi xử lý theo thứ tự nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Điều tra:

1. `ANALYZE=true npm run build` để xem treemap, tìm ra vài package chiếm phần lớn dung lượng.
2. Kiểm tra **ranh giới `"use client"`**: rất thường gặp trường hợp cả trang bị đánh dấu client chỉ vì một nút bấm, kéo theo mọi thứ vào bundle.
3. Xem Performance/Network để biết LCP đang chờ **JS** hay chờ **dữ liệu/ảnh** — hai nguyên nhân này cần cách chữa khác nhau.

Xử lý theo thứ tự lợi ích giảm dần:

1. **Thu hẹp ranh giới client**: chuyển phần tĩnh về Server Component — thường cắt được nhiều nhất mà không đổi kiến trúc.
2. **Thay thư viện nặng**: `moment` sang `date-fns`/`dayjs`, bỏ `axios` dùng `fetch`, bỏ `lodash` toàn phần.
3. **Bật `optimizePackageImports`** cho thư viện icon và UI dạng barrel.
4. **`dynamic()`** cho biểu đồ, editor, bảng lớn — những thứ nằm dưới màn hình đầu, kèm skeleton giữ chỗ.
5. **Streaming với `Suspense`** để phần khung hiện ngay, dữ liệu chậm về sau — cải thiện cảm nhận về LCP.
6. Rà lại **script bên thứ ba** và ảnh hero (`priority`, `sizes`).
7. Đo lại, rồi đặt **ngân sách bundle trong CI** để giữ kết quả.

</details>

---

## 3. Monitoring và Observability

Bài học: [3. Monitoring và Observability](../../nextjs/14-optimizations/3_monitoring.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Monitoring và observability khác nhau ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Monitoring** là theo dõi những thứ bạn **đã biết trước là cần theo dõi**: tỉ lệ lỗi 5xx, thời gian phản hồi, CPU, LCP p75. Nó trả lời câu hỏi *"hệ thống có đang khoẻ không?"* và kích hoạt cảnh báo khi vượt ngưỡng. Về bản chất là tập hợp dashboard và alert dựng sẵn.
- **Observability** là khả năng **suy ra trạng thái bên trong hệ thống từ dữ liệu nó phát ra**, đủ để trả lời cả những câu hỏi bạn chưa nghĩ tới trước khi sự cố xảy ra — *"vì sao riêng người dùng ở Singapore, đăng nhập bằng Google, trên trang checkout lại chậm từ 14h hôm qua?"*.

Quan hệ giữa hai khái niệm: monitoring cho bạn biết **có vấn đề**, observability cho bạn biết **vấn đề ở đâu và vì sao**. Observability được xây trên ba trụ cột metrics, logs, traces cùng dữ liệu giàu chiều (attribute, tag) để có thể cắt lát tuỳ ý. Trong bài, Vercel Analytics và Speed Insights nghiêng về monitoring, còn OpenTelemetry với trace và Sentry với ngữ cảnh lỗi là phần observability.

</details>

**2. Core Web Vitals gồm những metric nào, và ngưỡng "good" của `LCP`, `INP`, `CLS` là bao nhiêu?**

<details className="qa">
<summary>Xem đáp án</summary>

| Metric | Đo điều gì | Good | Cần cải thiện | Kém |
|---|---|---|---|---|
| **LCP** (Largest Contentful Paint) | Thời điểm khối nội dung lớn nhất hiện ra | ≤ 2,5s | 2,5–4s | > 4s |
| **INP** (Interaction to Next Paint) | Độ trễ phản hồi của tương tác | ≤ 200ms | 200–500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | Mức xô lệch bố cục ngoài ý muốn | ≤ 0,1 | 0,1–0,25 | > 0,25 |

Ba chỉ số này tương ứng ba khía cạnh trải nghiệm: **tải nhanh**, **phản hồi nhanh**, **ổn định về thị giác**, và chúng là tín hiệu xếp hạng của Google.

Ngoài ba chỉ số chính, `useReportWebVitals` còn báo các metric hỗ trợ dùng để chẩn đoán:

- **FCP** (First Contentful Paint) — byte nội dung đầu tiên được vẽ.
- **TTFB** (Time to First Byte) — phản ánh tốc độ phía server.

TTFB và FCP không phải Core Web Vitals nhưng rất hữu ích khi truy nguyên nguyên nhân LCP chậm.

</details>

**3. Vì sao Web Vitals được đánh giá ở phân vị 75 (`p75`) thay vì giá trị trung bình?**

<details className="qa">
<summary>Xem đáp án</summary>

Phân bố hiệu năng thực tế **lệch rất mạnh**: đa số lượt tải nhanh, một đuôi dài các lượt rất chậm trên máy yếu, mạng kém. Giá trị trung bình bị đuôi này kéo méo và đồng thời che giấu nó — một con số "trung bình 2,1s" có thể đang gồm 20% người dùng chịu 8 giây.

`p75` nghĩa là **75% lượt truy cập nhanh bằng hoặc hơn con số đó**. Ưu điểm:

- **Đại diện cho đa số người dùng**, không chỉ nhóm thiết bị tốt.
- **Bền với giá trị ngoại lai** hơn trung bình, nhưng vẫn phản ánh nhóm chịu thiệt.
- Không quá khắt khe như p95/p99 — vốn hay bị chi phối bởi các trường hợp cực đoan ngoài tầm kiểm soát.

Đây cũng là mốc Google dùng để đánh giá một site "đạt" Core Web Vitals: p75 của cả ba chỉ số phải nằm trong ngưỡng good. Trong thực tế nên xem cả **p50, p75, p95** cùng lúc — p50 cho biết trải nghiệm điển hình, khoảng cách giữa p50 và p95 cho biết mức độ không đồng đều.

</details>

**4. `Field data` (RUM) khác `lab data` (Lighthouse) thế nào? Khi hai nguồn mâu thuẫn thì bạn tin nguồn nào và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Lab data | Field data (RUM) |
|---|---|---|
| Nguồn | Chạy mô phỏng trên CI hoặc máy dev | Người dùng thật, mọi thiết bị và mạng |
| Tính lặp lại | Cao, cùng điều kiện mỗi lần | Thấp, nhiễu theo traffic |
| Đo được INP thật | Không (chỉ ước lượng qua TBT) | Có |
| Dùng để | Phát hiện hồi quy trước khi deploy, thử nghiệm giả thuyết | Đánh giá trải nghiệm thật, xếp hạng SEO |
| Công cụ | Lighthouse, PageSpeed lab | Vercel Speed Insights, CrUX, Search Console |

Khi mâu thuẫn, **tin field data**, vì đó mới là điều người dùng thật trải qua và cũng là thứ Google dùng để đánh giá. Lab chạy trên máy CI khoẻ, mạng mô phỏng, cache lạnh, không có extension, không có script quảng cáo thật, và không bao giờ có người bấm nên không đo được INP.

Nhưng đừng bỏ lab: nó là công cụ **chẩn đoán và phòng ngừa** — cho bạn waterfall chi tiết và cảnh báo hồi quy trước khi lên production. Cách dùng đúng là lab để gác cổng và tìm nguyên nhân, field để xác nhận kết quả.

</details>

**5. `useReportWebVitals` hoạt động ra sao, và bạn gửi metric thu được về đâu để tổng hợp?**

<details className="qa">
<summary>Xem đáp án</summary>

Đây là hook của `next/web-vitals`, dùng trong Client Component. Nó đăng ký lắng nghe các Performance API của trình duyệt và **gọi callback mỗi khi một metric được chốt giá trị** (LCP chốt khi người dùng tương tác hoặc rời trang, CLS tích luỹ tới khi trang ẩn).

```tsx
"use client";
import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    fetch("/api/metrics", {
      method: "POST",
      body: JSON.stringify(metric),
    });
  });
  return null;
}
```

Object `metric` gồm `name`, `value`, `id`, `rating` và `navigationType`.

Gửi đi đâu:

- Route handler nội bộ rồi đẩy vào kho dữ liệu của bạn (Axiom, ClickHouse, BigQuery).
- Google Analytics qua `gtag("event", metric.name, ...)`.
- Vercel Speed Insights hoặc một nhà cung cấp RUM — cách này khỏi tự dựng gì.

Lưu ý thực hành: dùng `navigator.sendBeacon` (hoặc `fetch` với `keepalive`) để không mất dữ liệu khi người dùng đóng tab, và đừng để việc gửi metric tự nó làm chậm trang.

</details>

**6. `INP` thay `FID` từ 2024 — khác biệt về cách đo là gì, và nguyên nhân `INP` xấu trong app Next thường đến từ đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

- **FID (First Input Delay)** chỉ đo **độ trễ trước khi trình duyệt bắt đầu xử lý tương tác đầu tiên**. Nó bỏ qua thời gian chạy handler và thời gian vẽ lại, lại chỉ tính đúng một lần trong cả phiên — nên rất dễ "đạt" dù app thực tế ì ạch.
- **INP** đo **toàn bộ** một tương tác: độ trễ đầu vào, thời gian chạy event handler, và thời gian tới khi khung hình kế tiếp được vẽ. Nó xét **mọi tương tác** trong suốt phiên rồi lấy giá trị đại diện gần với trường hợp tệ nhất. Vì vậy INP phản ánh đúng cảm giác "bấm mà không thấy gì xảy ra".

Nguyên nhân INP xấu thường gặp trong app Next:

- **Bundle client quá lớn**, hydration dài, luồng chính bị chiếm.
- **Long task** do script bên thứ ba (analytics, chat, quảng cáo).
- Render lại tốn kém khi state đổi: danh sách lớn không ảo hoá, context đặt quá cao khiến cả cây render lại.
- Xử lý nặng đặt ngay trong event handler thay vì hoãn lại.
- Thiếu phản hồi thị giác tức thì khi bấm (không có trạng thái pending).

Cách chữa: đẩy code sang Server Component, tách nhỏ chunk, hoãn script bên thứ ba, memo hoá và ảo hoá danh sách.

</details>

**7. `CLS` phát sinh từ những nguyên nhân nào, và `next/image` cùng `next/font` giảm nó bằng cách gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên nhân phổ biến:

- **Ảnh không khai báo kích thước** — khi tải xong, ảnh đẩy nội dung bên dưới xuống.
- **Font tuỳ chỉnh** có kích thước chữ khác font dự phòng, khi hoán đổi làm dòng chữ co giãn.
- **Nội dung chèn động**: banner, quảng cáo, thông báo cookie, nội dung tải muộn được chèn vào trên phần đang đọc.
- **Iframe hoặc widget** không có chỗ giữ sẵn.
- Animation làm đổi thuộc tính ảnh hưởng layout (`height`, `top`) thay vì `transform`.

Hai công cụ trong bài:

- **`next/image`** dùng `width`/`height` (hoặc `fill` với cha có kích thước) để sinh sẵn tỉ lệ khung, nên ô ảnh giữ đúng chỗ ngay từ lượt vẽ đầu.
- **`next/font`** tính **fallback metrics** (`size-adjust`, `ascent-override`...) để font dự phòng có kích thước gần font thật; khi font thật về, chữ gần như không nhảy. Nó cũng preload và self-host nên thời gian hoán đổi ngắn hơn.

Phần còn lại phụ thuộc bạn: luôn giữ chỗ sẵn (skeleton, `min-height`) cho mọi nội dung tải muộn.

</details>

**8. `TTFB` cao thì bạn nghi ngờ những nguyên nhân nào (cache miss, cold start, query chậm, render động)?**

<details className="qa">
<summary>Xem đáp án</summary>

TTFB gồm thời gian mạng cộng thời gian server sinh ra byte đầu tiên. Thứ tự nghi ngờ:

- **Cache miss**: trang đáng lẽ tĩnh (SSG/ISR) lại bị render động mỗi request. Kiểm tra output của `next build` xem route là `○` (static) hay `ƒ` (dynamic), và xem header cache của CDN là HIT hay MISS.
- **Cold start**: instance serverless vừa khởi động — TTFB rất cao nhưng chỉ ở một phần nhỏ request, thường sau thời gian vắng traffic hoặc ngay sau deploy.
- **Query chậm hoặc waterfall dữ liệu**: nhiều lần `await` tuần tự, thiếu index, N+1. Trace của OpenTelemetry chỉ ra ngay span nào chiếm thời gian.
- **API bên thứ ba chậm** trong luồng render, không có timeout.
- **Khoảng cách địa lý** giữa người dùng, server và database.
- **Render động không cần thiết**: dùng `cookies()`/`headers()` hoặc `no-store` ở chỗ không cần, khiến cả route mất khả năng cache.

Hướng xử lý: tăng độ phủ cache, chạy song song các truy vấn độc lập, dùng `Suspense` để stream phần khung ra trước, đặt DB gần runtime.

</details>

**9. File `instrumentation.ts` dùng để làm gì, chạy vào thời điểm nào, và vì sao phải kiểm tra `NEXT_RUNTIME` bên trong?**

<details className="qa">
<summary>Xem đáp án</summary>

`instrumentation.ts` đặt ở gốc project, export hàm `register()` được Next.js gọi **một lần khi server khởi động**, trước khi phục vụ request đầu tiên. Đây là chỗ đúng để khởi tạo mọi thứ thuộc về observability: OpenTelemetry, Sentry phía server, agent APM, logger, hoặc kiểm tra biến môi trường bắt buộc.

```ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation.node");
  }
}
```

Vì sao phải kiểm tra `NEXT_RUNTIME`: file này được nạp trong **cả Node runtime lẫn Edge runtime**. Phần lớn SDK observability dựa trên API chỉ có ở Node (`async_hooks`, module native, truy cập file). Nạp chúng trong Edge sẽ gây lỗi build hoặc lỗi lúc chạy. Biến này nhận giá trị `"nodejs"` hoặc `"edge"`, cho phép bạn nhánh hoá và `import()` động đúng gói cho từng môi trường.

Ngoài `register()`, file này còn có thể export `onRequestError` để bắt lỗi server tập trung — nhiều SDK, trong đó có Sentry, dùng hook đó.

</details>

**10. `OpenTelemetry` giải quyết bài toán gì? Giải thích `trace`, `span` và quan hệ cha-con giữa các span.**

<details className="qa">
<summary>Xem đáp án</summary>

OpenTelemetry là **chuẩn mở** để sinh, thu thập và xuất dữ liệu quan sát (trace, metric, log). Nó giải quyết hai bài toán: theo dõi một request đi xuyên nhiều dịch vụ, và **tránh khoá vào một nhà cung cấp** — cùng một đoạn code instrument có thể xuất sang Honeycomb, Datadog, New Relic, Sentry hay Jaeger self-host.

Khái niệm:

- **Span** là một đơn vị công việc có tên, thời điểm bắt đầu/kết thúc, trạng thái và các attribute (ví dụ `order.id`). Một truy vấn DB là một span, một lần gọi `fetch` là một span.
- **Trace** là toàn bộ tập span của **một request duy nhất**, chia sẻ chung một `trace id`.
- **Quan hệ cha-con**: mỗi span ghi `parent span id`, tạo thành cây. Span gốc là điểm vào (request HTTP), span con là các bước bên trong. Khi gọi sang dịch vụ khác, ngữ cảnh trace được truyền qua header nên cây vẫn nối liền — đó là ý nghĩa của "distributed tracing".

```ts
const tracer = trace.getTracer("my-app");
return tracer.startActiveSpan("processOrder", async (span) => {
  span.setAttribute("order.id", orderId);
  try { return await db.order.findUnique({ where: { id: orderId } }); }
  finally { span.end(); }
});
```

Nhìn cây span là thấy ngay bước nào chiếm thời gian.

</details>

**11. Ba trụ cột observability (`metrics`, `logs`, `traces`) khác nhau và bổ sung cho nhau như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Trụ cột | Bản chất | Trả lời câu hỏi | Chi phí |
|---|---|---|---|
| **Metrics** | Số liệu tổng hợp theo thời gian (counter, histogram) | *Có vấn đề không?* Tỉ lệ lỗi, p75 LCP, số request/giây | Rẻ, lưu lâu được |
| **Logs** | Sự kiện rời rạc kèm ngữ cảnh chi tiết | *Chính xác chuyện gì đã xảy ra ở bước này?* | Tốn dung lượng |
| **Traces** | Đường đi của một request qua các thành phần | *Chậm ở đâu, gọi qua những gì?* | Tốn, thường phải sampling |

Chúng bổ sung theo một quy trình điều tra điển hình:

1. **Metric** kích hoạt cảnh báo — p75 LCP vượt ngưỡng, 5xx tăng.
2. **Trace** khoanh vùng — span nào đang chiếm phần lớn thời gian, ở dịch vụ nào.
3. **Log** cho chi tiết cuối cùng — thông điệp lỗi, tham số truy vấn, id người dùng.

Chìa khoá để ba nguồn phối hợp được là **dữ liệu tương quan**: log nên chứa `trace id` và `span id`, để từ một trace nhảy thẳng sang đúng nhóm log. Điều này đòi hỏi **structured logging** dạng JSON (ví dụ với Pino) thay vì `console.log` chuỗi thô.

</details>

**12. Trong Next.js, `error.tsx`, `global-error.tsx` và `Sentry.captureException` phối hợp ra sao để không bỏ lọt lỗi production?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba thứ này ở ba tầng khác nhau:

- **`error.tsx`** là error boundary cho một segment route. Nó phải là Client Component, nhận `error` và `reset`, và thay thế phần UI bị lỗi trong khi layout cha vẫn còn. Đây là nơi hiển thị thông báo thân thiện và nút thử lại.
- **`global-error.tsx`** bắt lỗi xảy ra ở **chính root layout** — tầng mà `error.tsx` không với tới. Nó thay thế toàn bộ trang nên phải tự render cả thẻ `html` và `body`, và chỉ hoạt động ở production.
- **`Sentry.captureException`** là phần **báo cáo**. Error boundary chỉ lo giao diện, không tự gửi lỗi đi đâu cả — nếu không gọi, lỗi hiển thị đẹp rồi biến mất không dấu vết.

Cách phối hợp: trong `error.tsx` và `global-error.tsx`, gọi `captureException(error)` trong `useEffect` khi component mount. Bổ sung ở phía server bằng hook `onRequestError` trong `instrumentation.ts` để bắt lỗi của Server Component và route handler. Lưu ý Next.js **che chi tiết lỗi server ở production** và chỉ đưa ra `error.digest` — dùng digest đó để nối sự cố người dùng gặp với bản ghi trong Sentry.

</details>

**13. Vì sao cần upload `source map` cho Sentry, và rủi ro bảo mật khi để lộ source map công khai là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Code lên production đã được minify và bundle, nên stack trace trả về trông như `at t (chunk-4f2a.js:1:28471)` — hoàn toàn vô dụng cho việc gỡ lỗi. **Source map** ánh xạ ngược vị trí đó về file, dòng, tên hàm gốc, giúp Sentry hiển thị đúng đoạn code và biến ban đầu.

Cách làm đúng: **upload source map cho Sentry lúc build rồi xoá khỏi bản deploy công khai** (wizard `@sentry/wizard` cấu hình sẵn việc này). Sentry giữ bản riêng để giải mã, còn trình duyệt không tải được.

Rủi ro nếu để source map công khai:

- Lộ **toàn bộ source code gốc** — logic nghiệp vụ, thuật toán, tên endpoint nội bộ, feature flag chưa ra mắt.
- Lộ **comment và mã chết**, đôi khi kèm khoá hoặc URL nội bộ vô tình lẫn vào bundle.
- Giúp kẻ tấn công **tìm điểm yếu nhanh hơn nhiều** so với đọc code đã minify.

Lưu ý bổ sung: mọi thứ trong client bundle vốn đã có thể đọc được, source map chỉ khiến việc đó dễ hơn rất nhiều — nên nguyên tắc không đặt secret trong client bundle vẫn là bắt buộc.

</details>

**14. `tracesSampleRate` và dynamic sampling khác nhau ra sao? Bạn chọn tỷ lệ thế nào để cân bằng chi phí với khả năng phát hiện sự cố?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`tracesSampleRate`** là tỉ lệ **cố định**: một con số áp cho mọi transaction.

```ts
Sentry.init({
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
});
```

- **Dynamic sampling** dùng `tracesSampler`, quyết định theo **ngữ cảnh từng transaction** — loại route, người dùng, kết quả:

```ts
tracesSampler: (samplingContext) => {
  if (samplingContext.parentSampled) return 1.0;
  if (samplingContext.transactionContext.op === "http.server") return 0.1;
  return 0.01;
}
```

Chọn tỉ lệ theo nguyên tắc:

- **Lấy mẫu cao cho thứ hiếm và quan trọng**: lỗi, route thanh toán, API chậm — gần 100%.
- **Lấy mẫu thấp cho thứ nhiều và bình thường**: trang chủ, healthcheck, asset — 1–10% đã đủ để dựng thống kê.
- Giữ `parentSampled` để **một trace không bị đứt đoạn** giữa các dịch vụ.
- Dev và staging để 100% cho dễ gỡ lỗi.
- Đặt **ngưỡng chi tiêu** và xem lại hàng tháng; traffic tăng gấp đôi thì chi phí cũng vậy.

Lưu ý: sampling chỉ áp cho trace và phần đo hiệu năng — **lỗi thì nên gửi gần như toàn bộ**, vì mỗi lỗi bỏ lọt là một sự cố không nhìn thấy.

</details>

**15. Bạn đặt những alert nào cho một app Next production, và ngưỡng cảnh báo bao nhiêu là hợp lý?**

<details className="qa">
<summary>Xem đáp án</summary>

Bộ cảnh báo tối thiểu theo checklist trong bài:

- **Tỉ lệ lỗi 5xx > 1%** trong khung 5 phút — dấu hiệu sự cố đang diễn ra.
- **LCP p75 > 4s** — đã rơi khỏi ngưỡng chấp nhận được.
- **Thời gian cold start > 3s**.
- **Lỗi kết nối database**, hoặc pool cạn.
- **Lỗi mới xuất hiện** (regression) và lỗi tăng đột biến so với baseline — Sentry phát hiện được kiểu này.
- **TTFB p95** và tỉ lệ timeout của các API phụ thuộc.
- **Ngân sách chi phí** của chính hệ thống monitoring.

Nguyên tắc đặt ngưỡng:

- Dựa trên **baseline thật** của app bạn, không lấy con số của người khác.
- Cảnh báo theo **tỉ lệ và xu hướng**, không theo số tuyệt đối — "5xx chiếm 1% request" hữu ích hơn "có 50 lỗi".
- Dùng **cửa sổ thời gian** đủ dài để lọc nhiễu, tránh cảnh báo vì một request lẻ.
- Chia mức độ: cái nào gọi điện lúc nửa đêm, cái nào chỉ cần một tin nhắn trong kênh chung.
- **Cảnh báo giả là kẻ thù**: alert kêu suốt sẽ bị mọi người phớt lờ, và khi có sự cố thật thì không ai để ý.

</details>

**16. Tình huống: `LCP` `p75` tăng vọt ngay sau khi deploy nhưng Lighthouse trên CI vẫn xanh — bạn điều tra theo hướng nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Mâu thuẫn này gần như luôn nằm ở khoảng cách giữa môi trường lab và thực tế. Hướng điều tra:

1. **Cắt lát field data** theo thiết bị, quốc gia, loại mạng, route và loại điều hướng. LCP p75 toàn site tăng thường do một phân khúc cụ thể — ví dụ chỉ mobile, chỉ một khu vực, hoặc chỉ một trang có traffic lớn.
2. **Kiểm tra cache và render mode**: deploy vừa rồi có vô tình biến một route tĩnh thành động không (thêm `cookies()`, `no-store`, hay một `searchParams` mới)? CI luôn chạy trên bản build ấm, còn người dùng thật gặp cache lạnh và cold start.
3. **Xem TTFB** trong field data — nếu TTFB tăng theo thì vấn đề ở server/cache, không phải ở tài nguyên phía trước.
4. **So sánh phần tử LCP** trước và sau: có thể ảnh hero đổi nguồn, mất `priority`, hoặc bị đẩy vào một component `dynamic({ ssr: false })`.
5. **Rà script bên thứ ba** mới thêm, và các thay đổi ranh giới `"use client"` làm bundle phình lên.
6. **Đối chiếu trace** để xem route handler hay truy vấn nào chậm đi.
7. Nếu không tìm ra nhanh, **rollback trước rồi điều tra sau**, và bổ sung kiểm tra Lighthouse với throttling sát thực tế hơn vào CI để lần sau bắt được sớm.

</details>
