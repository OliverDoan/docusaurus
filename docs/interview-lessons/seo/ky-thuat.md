---
sidebar_position: 3
title: "SEO Kỹ thuật"
---

# SEO Kỹ thuật

## 1. Core Web Vitals

Bài học: [1. Core Web Vitals](../../seo/ky-thuat/1_core-web-vitals.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. LCP, INP, CLS đo lường cái gì? Giá trị mục tiêu của mỗi chỉ số?**

<details className="qa">
<summary>Xem đáp án</summary>

- **LCP (Largest Contentful Paint)**: Đo thời gian render phần tử nội dung lớn nhất trong viewport. Mục tiêu: dưới 2.5 giây.
- **INP (Interaction to Next Paint)**: Đo thời gian phản hồi tương tác (click, tap, keypress) tính từ lúc user tương tác đến khi frame mới được paint. Mục tiêu: dưới 200ms.
- **CLS (Cumulative Layout Shift)**: Đo tổng mức độ dịch chuyển bất ngờ của bố cục trang. Mục tiêu: dưới 0.1.

</details>

**2. Tại sao Google thay FID bằng INP?**

<details className="qa">
<summary>Xem đáp án</summary>

FID chỉ đo input delay của tương tác đầu tiên, bỏ qua processing time và presentation delay. INP đo toàn bộ lifecycle của mọi tương tác trong session, chọn giá trị xấu nhất (gần percentile thứ 98) làm đại diện. INP phản ánh chính xác hơn trải nghiệm thực tế vì user không chỉ tương tác một lần.

</details>

**3. Làm sao tối ưu CLS khi trang có quảng cáo load muộn?**

<details className="qa">
<summary>Xem đáp án</summary>

- Dành sẵn không gian (placeholder) cho vùng quảng cáo bằng CSS `min-height`
- Dùng CSS `aspect-ratio` hoặc `padding-bottom` trick để giữ tỷ lệ
- Đặt quảng cáo bên dưới viewport (below the fold) để shift không ảnh hưởng score
- Tránh inject quảng cáo vào giữa nội dung đang hiển thị
- Nếu ad slot trống (không có ad), giữ nguyên placeholder thay vì collapse

</details>

**4. Sự khác nhau giữa Lab data và Field data? Google dùng loại nào để xếp hạng?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Lab data**: Đo trên môi trường giả lập (Lighthouse, WebPageTest), kết quả nhất quán nhưng không phản ánh thiết bị thực
- **Field data**: Thu thập từ người dùng thật (CrUX, web-vitals library), phản ánh trải nghiệm thực nhưng biến động theo thiết bị và mạng
- Google dùng **field data từ CrUX** (Chrome User Experience Report) để xếp hạng, không dùng Lighthouse score

</details>

**5. Giải thích cách hoạt động của INP. Tại sao một event handler chạy 300ms sẽ cho INP kém?**

<details className="qa">
<summary>Xem đáp án</summary>

INP bao gồm 3 giai đoạn: Input Delay (chờ main thread rảnh) + Processing Time (chạy handler) + Presentation Delay (browser render frame mới). Nếu handler chạy 300ms, chỉ riêng processing time đã vượt ngưỡng 200ms, chưa kể input delay và presentation delay. Giải pháp: chia handler thành nhiều phần nhỏ, dùng `scheduler.yield()` hoặc `requestAnimationFrame` để nhường main thread cho browser paint frame trung gian.

</details>

---

## 2. Tốc độ trang

Bài học: [2. Tốc độ trang](../../seo/ky-thuat/2_toc-do-trang.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Giải thích Critical Rendering Path. Tại sao CSS được gọi là render-blocking?**

<details className="qa">
<summary>Xem đáp án</summary>

Critical Rendering Path là chuỗi bước browser thực hiện để chuyển HTML, CSS, JS thành pixel trên màn hình: Parse HTML thành DOM, parse CSS thành CSSOM, kết hợp thành Render Tree, rồi Layout và Paint. CSS là render-blocking vì browser phải xây dựng CSSOM hoàn chỉnh trước khi tạo Render Tree — nếu thiếu CSSOM, browser không biết element nào visible, kích thước bao nhiêu, nên nó chờ. Giải pháp: inline critical CSS, preload CSS file, dùng media query để tải CSS có điều kiện (ví dụ `media="print"` cho print stylesheet).

</details>

**2. So sánh `defer` vs `async` khi load JavaScript. Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều tải JS song song với HTML parsing (không chặn parser). Khác biệt: `defer` chạy JS sau khi HTML parse xong và giữ nguyên thứ tự các script; `async` chạy ngay khi JS tải xong (có thể giữa lúc parse HTML) và không đảm bảo thứ tự. Dùng `defer` cho application code (React bundle, utility libraries) cần thứ tự chính xác. Dùng `async` cho script độc lập (analytics, A/B testing, ads) không phụ thuộc nhau và không phụ thuộc DOM.

</details>

**3. Tree Shaking là gì? Điều kiện nào để tree shaking hoạt động?**

<details className="qa">
<summary>Xem đáp án</summary>

Tree shaking là kỹ thuật loại bỏ code không được import (dead code) khỏi production bundle. Điều kiện: (1) dùng ES Module syntax (`import`/`export`) thay vì CommonJS (`require`/`module.exports`), vì ES Module cho phép static analysis; (2) package phải khai báo `"sideEffects": false` trong `package.json` hoặc liệt kê cụ thể file có side effects; (3) bundler phải ở production mode; (4) import cụ thể (`import { map } from 'lodash-es'`) thay vì import toàn bộ (`import _ from 'lodash'`).

</details>

**4. Service Worker cache strategy nào phù hợp cho static assets? Cho API calls?**

<details className="qa">
<summary>Xem đáp án</summary>

Static assets (JS, CSS, images, fonts): dùng **Cache First** — kiểm tra cache trước, chỉ fetch network nếu cache miss. Vì static assets có content hash trong filename, khi code thay đổi thì filename thay đổi, tự động bypass cache. API calls: dùng **Network First** — luôn fetch từ server, nếu offline thì fallback về cache. Một số API ít thay đổi (danh sách tỉnh/thành, cấu hình) có thể dùng **Stale While Revalidate** — trả về cache ngay, đồng thời fetch network để update cache cho lần sau.

</details>

**5. Trang web tải 2MB JavaScript. Bạn sẽ tối ưu như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Quy trình: (1) Phân tích bundle bằng webpack-bundle-analyzer để tìm module nặng nhất; (2) Code split theo route — mỗi trang chỉ tải JS cần thiết; (3) Lazy load component nặng (charts, editors, maps) bằng `React.lazy` hoặc `dynamic import`; (4) Thay thế library nặng (moment.js 300KB thành date-fns 20KB, lodash thành lodash-es với tree shaking); (5) Bật compression (gzip/brotli) giảm transfer size 60-80%; (6) Kiểm tra và loại bỏ polyfill không cần thiết nếu chỉ hỗ trợ browser hiện đại.

</details>

---

## 3. Mobile SEO

Bài học: [3. Mobile SEO](../../seo/ky-thuat/3_mobile-seo.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Mobile-First Indexing là gì? Developer cần làm gì để đảm bảo website tương thích?**

<details className="qa">
<summary>Xem đáp án</summary>

Mobile-First Indexing nghĩa là Google dùng phiên bản mobile của website để crawl, index và xếp hạng. Developer cần: (1) Dùng responsive design để mobile và desktop dùng cùng URL và HTML; (2) Đảm bảo mobile version có đầy đủ nội dung, structured data, meta tags như desktop; (3) Không ẩn nội dung quan trọng trên mobile bằng CSS; (4) Đảm bảo hình ảnh trên mobile có alt text đầy đủ; (5) Kiểm tra robots.txt không chặn mobile crawler.

</details>

**2. So sánh Responsive Design, Adaptive Design, và Separate URLs. Google khuyên dùng phương pháp nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Responsive Design: cùng URL, cùng HTML, dùng CSS media queries để thay đổi layout. Adaptive (Dynamic Serving): cùng URL, server trả HTML khác nhau dựa trên User-Agent. Separate URLs: mobile dùng m.example.com, desktop dùng example.com. Google khuyến nghị Responsive Design vì: (1) một URL duy nhất, không bị duplicate content; (2) Googlebot crawl dễ hơn; (3) backlink tập trung vào 1 URL; (4) chia sẻ trên social media đơn giản hơn.

</details>

**3. Tại sao font-size dưới 16px gây vấn đề trên iOS Safari?**

<details className="qa">
<summary>Xem đáp án</summary>

iOS Safari tự động zoom vào `<input>` khi `font-size` dưới 16px để giúp người dùng đọc dễ hơn. Hành vi zoom này gây CLS (layout shift) và trải nghiệm kém vì sau khi nhập xong, user phải zoom out thủ công. Giải pháp: đặt `font-size: 16px` (hoặc `1rem` với base 16px) cho tất cả input, textarea, select trên mobile.

</details>

**4. Tại sao không nên chặn user zoom trên mobile?**

<details className="qa">
<summary>Xem đáp án</summary>

Chặn zoom (bằng `maximum-scale=1` hoặc `user-scalable=no`) vi phạm WCAG 2.1 Success Criterion 1.4.4 (Resize Text). Người dùng khiếm thị hoặc có vấn đề về thị lực cần zoom để đọc nội dung. Google Search Console sẽ báo lỗi accessibility, và Google có thể đánh giá tiêu cực trong page experience signals. Thay vì chặn zoom, hãy thiết kế responsive đúng cách để nội dung hiển thị tốt ở mọi zoom level.

</details>

**5. AMP còn cần thiết cho SEO năm 2025 không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không bắt buộc. Từ 2021, Google bỏ yêu cầu AMP để xuất hiện trong Top Stories carousel. AMP không có ranking boost riêng. Với sự ra đời của Core Web Vitals, Google đánh giá tốc độ dựa trên LCP, INP, CLS — bất kể trang dùng AMP hay không. Một trang non-AMP tối ưu tốt có thể nhanh tương đương AMP. AMP chỉ còn phù hợp cho publisher lớn đã đầu tư infrastructure, chưa có lý do convert sang non-AMP. Dự án mới nên tập trung vào Core Web Vitals thay vì AMP.

</details>

---

## 4. JavaScript SEO

Bài học: [4. JavaScript SEO](../../seo/ky-thuat/4_javascript-seo.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. So sánh CSR, SSR, SSG, ISR về SEO. Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **CSR**: Render phía client, SEO kém vì Googlebot phải chạy JS. Dùng cho: admin panel, dashboard, app behind auth
- **SSR**: Server render HTML mỗi request, SEO tốt, nội dung luôn mới. Dùng cho: e-commerce (giá thay đổi), news feed, trang cần personalization
- **SSG**: Render tại build time, SEO rất tốt, tốc độ cực nhanh (CDN). Dùng cho: blog, docs, landing page, marketing site
- **ISR**: SSG + tự động regenerate, SEO rất tốt, nội dung cập nhật mà không cần rebuild. Dùng cho: catalog sản phẩm lớn, blog có update thường xuyên

</details>

**2. Giải thích Two-Wave Indexing của Google. Tại sao nó gây vấn đề cho SPA?**

<details className="qa">
<summary>Xem đáp án</summary>

Google indexing có 2 giai đoạn: Wave 1 — parse HTML thô, index nội dung có sẵn ngay. Wave 2 — chạy JavaScript, render trang, index nội dung JS-generated. Khoảng cách giữa 2 wave có thể từ vài giây đến vài ngày tùy crawl budget. SPA trả về HTML trống, nên Wave 1 không thấy nội dung gì. Phải đợi Wave 2 mới có nội dung để index. Trong thời gian chờ, trang không xuất hiện trong kết quả tìm kiếm hoặc xuất hiện với snippet rỗng.

</details>

**3. Trang React SPA hiện tại không được Google index. Bạn sẽ debug và fix như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Debug: (1) Dùng Google Search Console URL Inspection để xem Google render trang thế nào; (2) Kiểm tra View Source (Ctrl+U) — nếu HTML trống thì đúng là vấn đề CSR; (3) Kiểm tra Console errors trong Inspect tool; (4) Kiểm tra robots.txt có chặn JS/CSS files không. Fix: (1) Ngắn hạn: dùng dynamic rendering (prerender cho bot); (2) Dài hạn: chuyển sang Next.js SSR/SSG; (3) Đảm bảo meta tags được render đúng cho mỗi route; (4) Chuyển từ HashRouter sang BrowserRouter; (5) Submit URL lại qua Search Console sau khi fix.

</details>

**4. Dynamic rendering có vi phạm Google guidelines không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không, Google chính thức chấp nhận dynamic rendering như một giải pháp hợp lệ. Điều kiện: nội dung trả về cho bot phải giống nội dung user thấy (chỉ khác về cách render, không khác về nội dung). Nếu cố tình trả nội dung khác cho bot (ví dụ nhồi keyword chỉ cho Googlebot thấy) — đó là cloaking và bị phạt. Google khuyến nghị dùng dynamic rendering như workaround tạm thời, và chuyển sang SSR/SSG lâu dài.

</details>

**5. Next.js App Router vs Pages Router — cái nào tốt hơn cho SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều hỗ trợ SSR/SSG tốt cho SEO. App Router (từ Next.js 13+) có lợi thế: (1) Server Components mặc định — render trên server không cần cấu hình thêm; (2) `generateMetadata` function cho dynamic SEO metadata; (3) Streaming SSR — gửi HTML từng phần, cải thiện TTFB; (4) Built-in `sitemap.js` và `robots.js`; (5) Parallel Routes và Intercepting Routes giúp UX tốt hơn mà vẫn SEO-friendly. Pages Router vẫn hoạt động tốt nhưng App Router là hướng đi tương lai và có nhiều tính năng SEO built-in hơn.

</details>

---

## 5. Crawl và Index

Bài học: [5. Crawl và Index](../../seo/ky-thuat/5_crawl-va-index.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. robots.txt Disallow có ngăn Google index URL không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. `Disallow` trong robots.txt chỉ ngăn Googlebot **crawl** (tải nội dung) URL đó, nhưng Google vẫn có thể **index** URL nếu có backlink từ trang khác trỏ đến. URL sẽ xuất hiện trong search results với tiêu đề và snippet rỗng (vì Google không đọc được nội dung). Muốn ngăn index hoàn toàn, phải dùng `<meta name="robots" content="noindex">` hoặc `X-Robots-Tag: noindex` HTTP header. Nhưng để meta robots hoạt động, không được chặn crawl URL đó trong robots.txt (vì Googlebot phải crawl được mới thấy meta tag).

</details>

**2. Website có 500,000 trang sản phẩm nhưng chỉ 10,000 được index. Nguyên nhân và giải pháp?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên nhân có thể: (1) Crawl budget không đủ — Googlebot không kịp crawl hết; (2) Nội dung mỏng/trùng lặp — Google chọn không index; (3) Internal linking yếu — nhiều trang không có link nào trỏ đến (orphan pages); (4) Server chậm — Googlebot giảm crawl rate. Giải pháp: (1) Tối ưu robots.txt, chặn URL không cần thiết; (2) Chia sitemap theo danh mục, submit riêng; (3) Cải thiện internal linking với breadcrumb và related products; (4) Fix redirect chains; (5) Cải thiện server response time; (6) Thêm unique content cho mỗi sản phẩm (mô tả, review).

</details>

**3. Giải thích canonical tag. Khi nào cần dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

Canonical tag (`<link rel="canonical" href="...">`) chỉ định URL "chính" khi cùng nội dung có nhiều URL. Google sẽ tập trung link equity vào canonical URL và hiện nó trong search results. Cần dùng khi: (1) URL có query parameters (`?color=red`, `?utm_source=google`); (2) HTTP và HTTPS cùng tồn tại; (3) www và non-www; (4) URL có trailing slash và không có; (5) Content syndication (bài đăng lại trên trang khác). Best practice: luôn đặt self-referencing canonical trên mọi trang để phòng ngừa duplicate.

</details>

**4. Sự khác biệt giữa `noindex` và `Disallow` trong robots.txt? Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`Disallow` (robots.txt): ngăn bot crawl URL, nhưng URL vẫn có thể được index nếu có external links. Bot không tải được nội dung nên không thấy meta tags. Dùng cho: trang server-heavy mà bạn muốn tiết kiệm crawl budget (API endpoints, asset directories). `noindex` (meta robots): cho phép bot crawl và đọc nội dung, nhưng yêu cầu không index. Dùng cho: trang bạn muốn Google biết nhưng không hiện trong search (thank you pages, internal search, staging). Lưu ý: KHÔNG kết hợp Disallow + noindex — nếu Disallow thì bot không crawl được, không thấy noindex tag.

</details>

**5. lastmod trong sitemap có ảnh hưởng đến crawl frequency không?**

<details className="qa">
<summary>Xem đáp án</summary>

Co, nhưng chỉ khi `lastmod` chính xác. Google dùng `lastmod` để ưu tiên crawl trang thay đổi gần đây. Nếu `lastmod` luôn cập nhật (dù nội dung không thay đổi), Google sẽ mất tin tưởng và bỏ qua hoàn toàn `lastmod` cho toàn bộ sitemap. Best practice: chỉ cập nhật `lastmod` khi nội dung thực sự thay đổi đáng kể (không đếm thay đổi CSS/layout), dùng timestamp chính xác từ database (`updated_at`), không dùng ngày hiện tại cho tất cả URLs.

</details>
