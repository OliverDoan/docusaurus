---
sidebar_position: 4
title: "SEO cho Landing Page"
---

# SEO cho Landing Page

## 1. Landing Page chuẩn SEO

Bài học: [1. Landing Page chuẩn SEO](../../seo/landing-page/1_landing-page-seo-overview.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Sự khác biệt giữa landing page chạy ads và landing page SEO là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Landing page chạy ads tập trung 100% vào conversion, traffic đến từ quảng cáo nên không cần Google index (thường set `noindex`). Landing page SEO cần Google crawl và index được, yêu cầu semantic HTML, content có giá trị, tốc độ tải nhanh, structured data, và internal linking. Landing page SEO phải cân bằng giữa conversion optimization và search engine optimization.

</details>

**2. Tại sao chỉ nên có 1 H1 trên mỗi trang?**

<details className="qa">
<summary>Xem đáp án</summary>

H1 cho search engine biết chủ đề chính của trang. Nhiều H1 gây nhầm lẫn cho Google về nội dung chính. Mặc dù HTML5 spec cho phép nhiều H1, nhưng từ góc nhìn SEO, best practice vẫn là 1 H1 duy nhất chứa primary keyword. Các section khác dùng H2, H3 theo hierarchy.

</details>

**3. Above-the-fold content ảnh hưởng SEO như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Above-the-fold ảnh hưởng qua nhiều tín hiệu: LCP (Largest Contentful Paint) thường đo element lớn nhất above-the-fold, FCP (First Contentful Paint) đo thời gian render nội dung đầu tiên. Nếu above-the-fold content không hấp dẫn hoặc load chậm, bounce rate tăng, dwell time giảm, gián tiếp ảnh hưởng ranking.

</details>

**4. Semantic HTML có thực sự ảnh hưởng SEO ranking không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không trực tiếp là ranking factor, nhưng ảnh hưởng mạnh gián tiếp. Semantic HTML giúp Google hiểu cấu trúc trang tốt hơn, tăng khả năng hiển thị rich results (FAQ, breadcrumb), cải thiện accessibility (ảnh hưởng user experience signals). Google đã confirm rằng họ sử dụng HTML5 semantic elements để hiểu content structure.

</details>

**5. Làm sao tối ưu CTA cho cả SEO và conversion?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng `<a href>` thay vì `<button onclick>` để Google crawl được. Anchor text phải mô tả hành động cụ thể thay vì generic text. Đặt CTA ở nhiều vị trí: hero section, sau features, sau testimonials, và trước footer. Đảm bảo CTA render server-side, không phụ thuộc JavaScript. Thêm `aria-label` cho accessibility nếu text ngắn gọn.

</details>

---

## 2. Landing Page với Next.js

Bài học: [2. Landing Page với Next.js](../../seo/landing-page/2_nextjs-landing-page.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Next.js App Router xử lý metadata cho SEO như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

App Router cung cấp 2 cách: (1) Export `metadata` object từ `layout.tsx` hoặc `page.tsx` cho static metadata, (2) Export `generateMetadata` async function cho dynamic metadata dựa trên params hoặc data fetch. Metadata tự động merge từ root layout đến page, với page-level metadata override layout-level. Template pattern (ví dụ `title.template: '%s | Brand'`) cho phép tự động format title ở mọi trang con.

</details>

**2. Tại sao Server Components tốt cho SEO hơn Client Components?**

<details className="qa">
<summary>Xem đáp án</summary>

Server Components render HTML trên server và gửi HTML hoàn chỉnh cho client. Search engine crawlers nhận được nội dung đầy đủ mà không cần chạy JavaScript. Client Components cần hydration trên browser, crawler có thể không thấy nội dung nếu không chạy JS. Ngoài ra, Server Components giảm JavaScript bundle size vì code không gửi xuống client, cải thiện tốc độ tải.

</details>

**3. Khi nào nên dùng SSG vs ISR vs SSR cho landing page?**

<details className="qa">
<summary>Xem đáp án</summary>

SSG (Static Site Generation) cho landing page nội dung cố định, hiếm khi thay đổi - tốc độ nhanh nhất, SEO tốt nhất. ISR (Incremental Static Regeneration) cho landing page nội dung từ CMS, cần cập nhật định kỳ nhưng không real-time - set `revalidate` để cân bằng freshness và performance. SSR (Server-Side Rendering) cho landing page cá nhân hóa theo user/location - chậm hơn nhưng cần thiết khi nội dung thay đổi theo context.

</details>

**4. `next/image` cải thiện Core Web Vitals như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`next/image` tự động optimize ảnh: convert sang WebP/AVIF (giảm size), generate responsive srcset (đúng size cho mỗi viewport), lazy loading mặc định (giảm initial load), width/height bắt buộc (tránh CLS), blur placeholder (cải thiện perceived performance). Prop `priority` preload hero image, giảm LCP. Props `sizes` giúp browser chọn đúng image size từ srcset.

</details>

**5. Giải thích cách `next/font` loại bỏ layout shift do font loading?**

<details className="qa">
<summary>Xem đáp án</summary>

`next/font` self-host font files tại build time, loại bỏ network request đến Google Fonts. Sử dụng `font-display: swap` để text hiển thị ngay với fallback font. Quan trọng nhất là tự động tính `size-adjust` cho fallback font, giúp fallback font có cùng kích thước với custom font, nên khi swap font không gây layout shift (CLS = 0). Font files được inline trong HTML, không cần thêm request.

</details>

---

## 3. SEO cho React SPA

Bài học: [3. SEO cho React SPA](../../seo/landing-page/3_react-seo.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Tại sao React SPA gặp khó khăn với SEO? Có những giải pháp nào?**

<details className="qa">
<summary>Xem đáp án</summary>

React SPA render nội dung bằng JavaScript trên browser. Khi crawler truy cập, nó nhận được HTML gần trống với chỉ 1 `<div id="root">`. Googlebot có thể render JS nhưng với delay (two-wave indexing), và các bot khác (Facebook, Twitter) không chạy JS. Giải pháp: (1) SSR với Next.js/Remix - render trên server mỗi request, (2) SSG - pre-render tại build time, (3) Prerendering - dùng headless browser tạo HTML snapshots, (4) react-helmet-async - quản lý meta tags (chỉ giải quyết một phần).

</details>

**2. So sánh react-snap và prerender.io. Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

react-snap chạy Puppeteer tại build time, tạo HTML cho mỗi route, output là static files. Phù hợp cho site nhỏ (dưới vài trăm pages), miễn phí, nhưng tăng build time. prerender.io là SaaS middleware, detect bot user-agent và serve pre-rendered HTML on-the-fly. Phù hợp cho site lớn, dynamic content, không tăng build time nhưng tốn phí. Dùng react-snap cho side projects và sites nhỏ. Dùng prerender.io cho production sites cần scale.

</details>

**3. Google có thể render JavaScript không? Vậy tại sao SPA vẫn có vấn đề SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

Google sử dụng Web Rendering Service (WRS) dựa trên Chromium để render JavaScript. Tuy nhiên có vấn đề: (1) Two-wave indexing: Google crawl HTML trước, schedule render JS sau, có thể delay vài ngày đến vài tuần; (2) Render budget: Google có giới hạn tài nguyên cho mỗi site, trang nặng JS có thể bị skip; (3) Timeout: nếu JS execution quá lâu hoặc API calls chậm, nội dung bị miss; (4) Other bots: Facebook, Twitter, Slack preview không chạy JS. Vì vậy best practice vẫn là server-render HTML.

</details>

**4. Làm sao tạo sitemap cho React SPA khi routes chỉ tồn tại trong JavaScript?**

<details className="qa">
<summary>Xem đáp án</summary>

Cần tạo sitemap tại build time bằng script riêng. Định nghĩa danh sách routes trong file config hoặc tự động extract từ React Router config. Dùng script Node.js generate file `sitemap.xml` vào thư mục `public/`. Thêm script vào build pipeline (chạy trước hoặc sau build). Đối với dynamic routes (ví dụ blog posts), fetch data từ CMS/API rồi generate URL cho mỗi item. Submit sitemap lên Google Search Console.

</details>

**5. Nếu đang có React SPA cần cải thiện SEO, nên migrate sang Next.js hay dùng prerendering?**

<details className="qa">
<summary>Xem đáp án</summary>

Phụ thuộc vào nhiều yếu tố: (1) Nếu project nhỏ, ít routes -> prerendering với react-snap là đủ, chi phí migration thấp; (2) Nếu project lớn, cần dynamic SEO, có team resources -> migrate sang Next.js, được lợi lâu dài; (3) Nếu cần SEO ngay, không có thời gian migrate -> prerender.io middleware, deploy nhanh; (4) Nếu chỉ cần SEO cho một số trang (landing, blog) -> hybrid approach: Next.js cho public pages, SPA cho authenticated app. Migration sang Next.js là investment lớn nhưng giải quyết triệt để, prerendering là band-aid nhưng nhanh.

</details>

---

## 4. Hiệu suất Landing Page

Bài học: [4. Hiệu suất Landing Page](../../seo/landing-page/4_landing-page-performance.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. LCP trên landing page là 4.5 giây. Bạn sẽ debug và fix như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Bước 1: Xác định LCP element bằng Lighthouse hoặc DevTools Performance tab (thường là hero image hoặc large text block). Bước 2: Nếu LCP là image: (a) preload image trong `<head>`, (b) dùng `fetchpriority="high"`, (c) convert sang WebP/AVIF, (d) dùng responsive srcset, (e) set `loading="eager"`. Bước 3: Nếu LCP là text: (a) inline critical CSS, (b) preload font, (c) dùng `font-display: swap`. Bước 4: Kiểm tra TTFB - nếu server chậm, cần CDN hoặc static generation. Bước 5: Remove render-blocking resources (JS, CSS không cần thiết above-the-fold).

</details>

**2. Giải thích sự khác biệt giữa preload, prefetch, và preconnect.**

<details className="qa">
<summary>Xem đáp án</summary>

`preload` download resource ngay vì current page CẦN nó sớm (high priority) - dùng cho hero image, critical font. `prefetch` download resource TRƯỚC vì trang TIẾP THEO có thể cần (low priority, idle time) - dùng cho resources của trang signup khi user đang ở landing page. `preconnect` chỉ thực hiện DNS lookup + TCP connection + TLS handshake, chưa download gì - dùng cho domains sẽ fetch API sớm. Sai lầm phổ biến: dùng preload cho mọi thứ, gây bandwidth contention; hoặc nhầm prefetch với preload dẫn đến resource tải muộn.

</details>

**3. Critical CSS là gì? Tại sao quan trọng cho landing page?**

<details className="qa">
<summary>Xem đáp án</summary>

Critical CSS là tập CSS tối thiểu cần để render above-the-fold content. Inline nó vào `<style>` tag trong `<head>` giúp browser render ngay mà không cần đợi external CSS file download. Non-critical CSS được load async bằng `<link rel="preload" as="style">`. Đặc biệt quan trọng cho landing page vì: (1) giảm FCP đáng kể (user thấy content ngay), (2) cải thiện LCP nếu LCP element là text, (3) giảm render-blocking resources. Tools: critical (by Addy Osmani), critters (webpack plugin).

</details>

**4. CLS score trên landing page là 0.35. Nguyên nhân và cách fix?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên nhân thường gặp: (1) Image không có width/height -> browser không reserve space; (2) Web fonts gây layout shift khi swap -> dùng `size-adjust` hoặc `font-display: optional`; (3) Dynamic content inject (ads, banners) -> reserve space trước; (4) Late-loading CSS thay đổi layout -> inline critical CSS. Fix: set width/height cho mọi image/video, match fallback font metrics, dùng `aspect-ratio` CSS, `contain-intrinsic-size` cho lazy-loaded elements, tránh insert content above existing content.

</details>

**5. Landing page dùng 5 Google Fonts. Tối ưu như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

(1) Giảm xuống 2 fonts maximum (1 heading, 1 body). (2) Self-host thay vì load từ Google Fonts CDN để giảm DNS lookup và connection. (3) Chỉ load weights cần thiết (thường 400, 600, 700 là đủ). (4) Subset fonts - chỉ include characters cần dùng (latin + vietnamese). (5) Preload 1 font file quan trọng nhất. (6) Dùng `font-display: swap` để text hiển thị ngay. (7) Dùng variable fonts nếu cần nhiều weights (1 file thay vì nhiều files). (8) Nếu dùng Next.js, `next/font` xử lý tất cả tự động.

</details>

---

## 5. A/B Testing và đo lường SEO

Bài học: [5. A/B Testing và đo lường SEO](../../seo/landing-page/5_ab-testing-va-do-luong.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Làm sao A/B test landing page mà không ảnh hưởng SEO ranking?**

<details className="qa">
<summary>Xem đáp án</summary>

(1) Ưu tiên server-side testing: dùng middleware/edge function để serve different variants, Google luôn thấy canonical version. (2) Set `rel="canonical"` trên tất cả variant pages trỏ về URL gốc. (3) Variant pages set `noindex` để Google không index chúng. (4) Không dùng client-side JS để thay đổi H1, title, meta tags vì Google có thể thấy các version khác nhau. (5) Giới hạn thời gian test (2-4 tuần). (6) Chỉ test visual elements (CTA color, layout, images) ở client-side, content changes phải server-side.

</details>

**2. GA4 khác Universal Analytics như thế nào trong việc đo lường SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

GA4 dùng event-based model thay vì session-based. Mỗi interaction là một event, không còn khái niệm "pageview" cũ. Bounce rate được thay bằng "Engagement rate" (% sessions có engaged session). GA4 có "Engagement time" thay vì "Time on page" (chính xác hơn). GA4 tích hợp GSC data trực tiếp trong reports. Attribution model linh hoạt hơn (data-driven thay vì last-click mặc định). Explorations cho phép tạo custom reports mạnh hơn. Tuy nhiên GA4 mất một số reports quen thuộc và learning curve cao hơn.

</details>

**3. Làm sao đo lường ROI của SEO cho landing page?**

<details className="qa">
<summary>Xem đáp án</summary>

Bước 1: Xác định conversion value (ví dụ: mỗi signup trị giá $10 dựa trên LTV). Bước 2: Track organic conversions trong GA4 (filter source = google, medium = organic). Bước 3: Tính organic conversion value = số conversions x conversion value. Bước 4: So sánh với chi phí SEO (content creation, tools, developer time). Bước 5: ROI = (Revenue from organic - SEO cost) / SEO cost x 100%. Ngoài ra theo dõi: organic traffic growth, keyword rankings improvement, branded vs non-branded search ratio.

</details>

**4. Google Search Console API có thể giúp gì cho SEO landing page?**

<details className="qa">
<summary>Xem đáp án</summary>

GSC API cung cấp data không có trong GA4: (1) Search queries - biết user tìm keyword gì để đến trang, dùng để optimize content. (2) Impressions - biết trang hiển thị bao nhiêu lần trên SERP, kể cả khi không có clicks. (3) Average position - theo dõi ranking trend. (4) CTR per query - xác định keyword nào cần cải thiện title/description. Tự động hóa: build script lấy data định kỳ, tìm keyword opportunities (high impressions, low CTR), monitor ranking drops, generate weekly SEO reports.

</details>

**5. So sánh PostHog và Google Analytics 4 cho SEO tracking. Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

GA4 là standard cho SEO tracking vì tích hợp với Google Search Console, Google Ads, có CrUX data. Miễn phí nhưng data thuộc về Google, sampling ở high volume. PostHog là open-source, có thể self-host (full data ownership, GDPR friendly), có feature flags, session recordings, và A/B testing tích hợp. Không có GSC integration. Recommendation: dùng GA4 cho SEO metrics core (organic traffic, GSC data, attribution). Dùng PostHog bổ sung cho product analytics (feature flags, A/B testing, session recordings). Nhiều teams dùng cả hai: GA4 cho marketing/SEO team, PostHog cho product/engineering team.

</details>
