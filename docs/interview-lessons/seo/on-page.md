---
sidebar_position: 2
title: "SEO On-Page"
---

# SEO On-Page

## 1. Meta Tags nâng cao

Bài học: [1. Meta Tags nâng cao](../../seo/on-page/1_meta-tags-nang-cao.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Sự khác nhau giữa `<meta name="description">` và `<meta property="og:description">` là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`<meta name="description">` là description hiển thị trên kết quả tìm kiếm Google (SERP). `<meta property="og:description">` là description hiển thị khi chia sẻ trang trên mạng xã hội (Facebook, LinkedIn, Zalo). Chúng có thể có nội dung giống hoặc khác nhau. Nên tối ưu description cho SERP ngắn gọn hơn (120-160 ký tự), còn OG description có thể dài hơn và hấp dẫn hơn để thu hút click trên social.

</details>

**2. Canonical tag giúp gì cho SEO? Khi nào cần sử dụng?**

<details className="qa">
<summary>Xem đáp án</summary>

Canonical tag (`<link rel="canonical">`) cho Google biết URL nào là phiên bản "chính thức" khi có nhiều URL dẫn đến cùng nội dung. Nên dùng khi: (1) Trang có query parameters (`?utm_source=...`), (2) Trang có www và non-www, (3) Nội dung được syndicate trên nhiều domain, (4) Trang phân trang. Mỗi trang nên có self-referencing canonical để tránh vấn đề duplicate content.

</details>

**3. Tại sao cần khai báo hreflang hai chiều? Nếu chỉ khai báo một chiều thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Google yêu cầu hreflang phải là bidirectional (hai chiều) để xác nhận mối quan hệ giữa các phiên bản ngôn ngữ. Nếu trang tiếng Việt chỉ đến trang tiếng Anh nhưng trang tiếng Anh không chỉ ngược lại, Google có thể bỏ qua hreflang vì không có sự "xác nhận" từ cả hai phía. Kết quả là Google có thể hiển thị sai phiên bản ngôn ngữ cho người dùng.

</details>

**4. Làm sao biết meta tags đã được setup đúng?**

<details className="qa">
<summary>Xem đáp án</summary>

Có nhiều cách kiểm tra: (1) Xem page source (`Ctrl+U`) và kiểm tra trong `<head>`, (2) Dùng Facebook Sharing Debugger để xem OG tags, (3) Dùng Google Search Console để phát hiện vấn đề indexing, (4) Dùng Lighthouse audit để kiểm tra SEO cơ bản, (5) Dùng extension như SEO Meta in 1 Click. Trong CI/CD, có thể viết test kiểm tra sự tồn tại của các meta tags bắt buộc.

</details>

**5. `<meta name="robots" content="noindex">` khác gì với `Disallow` trong robots.txt?**

<details className="qa">
<summary>Xem đáp án</summary>

`robots.txt Disallow` ngăn crawler truy cập trang (không crawl), nhưng nếu có trang khác link đến trang đó, Google vẫn có thể index URL (chỉ không biết nội dung). `noindex` cho phép crawler truy cập trang nhưng yêu cầu không đưa trang vào index. Để đảm bảo trang không xuất hiện trên Google, nên dùng `noindex` thay vì `Disallow`. Lưu ý: nếu đã Disallow trang trong robots.txt thì Google sẽ không đọc được thẻ `noindex` trên trang đó.

</details>

---

## 2. Structured Data và Schema.org

Bài học: [2. Structured Data và Schema.org](../../seo/on-page/2_structured-data.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Structured data có phải là ranking factor trực tiếp không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không, structured data không phải là ranking factor trực tiếp — Google đã xác nhận điều này. Tuy nhiên, structured data giúp trang hiển thị rich snippets (sao đánh giá, giá, FAQ dropdown), làm tăng CTR (click-through rate). CTR cao gián tiếp báo hiệu cho Google rằng trang có giá trị, từ đó có thể cải thiện ranking. Ngoài ra, structured data giúp Google hiểu nội dung chính xác hơn, có thể cải thiện relevance.

</details>

**2. Tại sao Google khuyên dùng JSON-LD thay vì Microdata?**

<details className="qa">
<summary>Xem đáp án</summary>

JSON-LD tách biệt khỏi HTML markup, không làm phức tạp cấu trúc DOM. Điều này giúp: (1) Dễ maintain — có thể thêm/sửa/xóa mà không ảnh hưởng giao diện, (2) Dễ generate tự động từ API hoặc CMS, (3) Dễ test và validate, (4) Không bị ảnh hưởng khi thay đổi giao diện. Microdata phải gắn trực tiếp vào HTML elements nên khi thay đổi layout, structured data có thể bị hỏng.

</details>

**3. Làm sao để biết schema nào phù hợp với trang của mình?**

<details className="qa">
<summary>Xem đáp án</summary>

Dựa trên loại nội dung: (1) Bài blog/tin tức dùng `Article`, (2) Sản phẩm dùng `Product`, (3) Trang FAQ dùng `FAQPage`, (4) Hướng dẫn từng bước dùng `HowTo`, (5) Trang chủ dùng `Organization` + `WebSite`, (6) Trang danh mục dùng `BreadcrumbList`. Có thể kết hợp nhiều schema trên một trang (ví dụ Article + BreadcrumbList + FAQ). Kiểm tra Google's Search Gallery để xem các rich result types được hỗ trợ.

</details>

**4. Nếu JSON-LD có lỗi cú pháp thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Nếu JSON không hợp lệ (trailing comma, single quotes, syntax error), Google sẽ bỏ qua toàn bộ block structured data đó. Trang vẫn được index bình thường nhưng sẽ không có rich snippets. Để phòng ngừa: (1) Luôn dùng `JSON.stringify()` để generate JSON từ code, không viết tay, (2) Validate bằng Google Rich Results Test trước khi deploy, (3) Thêm validation vào CI/CD pipeline.

</details>

**5. Có thể đặt JSON-LD ở đâu trong HTML?**

<details className="qa">
<summary>Xem đáp án</summary>

JSON-LD có thể đặt bất kỳ đâu trong HTML — trong `<head>` hoặc `<body>`. Google sẽ đọc được ở cả hai vị trí. Tuy nhiên, Google khuyên đặt trong `<head>` để search engine đọc được sớm nhất. Trong các framework như Next.js, thường đặt trong component render để JSON-LD gần với nội dung liên quan, và điều này hoàn toàn hợp lệ.

</details>

---

## 3. URL và cấu trúc trang

Bài học: [3. URL và cấu trúc trang](../../seo/on-page/3_url-va-site-structure.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. 301 và 302 redirect khác nhau như thế nào về mặt SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

301 (Permanent) báo Google rằng trang đã chuyển vĩnh viễn — Google sẽ chuyển link equity (khoảng 90-99%) từ URL cũ sang URL mới và cập nhật index. 302 (Temporary) báo Google rằng trang chỉ chuyển tạm thời — Google giữ URL cũ trong index và không chuyển link equity. Dùng sai loại redirect là lỗi phổ biến: dùng 302 cho redirect vĩnh viễn sẽ khiến mất link equity.

</details>

**2. Internal linking ảnh hưởng đến SEO như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Internal linking giúp SEO theo 3 cách: (1) **Khám phá** — Googlebot tìm trang mới bằng cách đi theo internal links, (2) **Link equity** — Trang có nhiều backlinks chuyển "giá trị" sang các trang được link đến, (3) **Ngữ cảnh** — Anchor text của internal link giúp Google hiểu nội dung trang đích. Chiến lược tốt là link từ trang có authority cao đến trang mới/quan trọng, dùng anchor text mô tả cụ thể.

</details>

**3. Sitemap có giúp trang được index nhanh hơn không?**

<details className="qa">
<summary>Xem đáp án</summary>

Sitemap không đảm bảo trang sẽ được index, nhưng giúp Googlebot khám phá trang nhanh hơn, đặc biệt với: (1) Trang mới chưa có internal link nào trỏ đến, (2) Trang web lớn (100,000+ URL), (3) Trang có cấu trúc phức tạp. Google cũng dùng `lastmod` trong sitemap để biết trang nào đã cập nhật để ưu tiên crawl lại.

</details>

**4. Tại sao URL ngắn lại tốt hơn cho SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

URL ngắn tốt hơn vì: (1) Dễ đọc và nhớ cho người dùng, (2) Hiển thị đầy đủ trên SERP (URL dài bị cắt), (3) Dễ chia sẻ trên mạng xã hội, (4) Google có thể ưu tiên URL ngắn gọn hơn khi xếp hạng. Tuy nhiên, "ngắn" không có nghĩa là bỏ hết — URL vẫn cần chứa keyword mô tả nội dung. Lý tưởng là 3-5 từ, dưới 60 ký tự.

</details>

**5. Flat site architecture và deep site architecture: cái nào tốt hơn cho SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

Flat architecture (mỗi trang cách trang chủ 2-3 click) thường tốt hơn vì: (1) Googlebot dễ khám phá tất cả các trang, (2) Link equity được phân phối đều hơn, (3) Người dùng truy cập nhanh hơn. Deep architecture (4-5+ cấp) khiến Googlebot có thể không crawl đến các trang sâu, và link equity bị loãng. Tuy nhiên, trang web lớn (e-commerce với 100,000 sản phẩm) cần sự cân bằng — dùng breadcrumbs và internal linking để rút ngắn "khoảng cách" đến trang sâu.

</details>

---

## 4. Hình ảnh và media SEO

Bài học: [4. Hình ảnh và media SEO](../../seo/on-page/4_hinh-anh-va-media.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Alt text ảnh hưởng đến SEO như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Alt text là cách chính để Google hiểu nội dung hình ảnh vì Google không "nhìn" được hình như con người. Alt text ảnh hưởng đến: (1) **Google Images ranking** — hình có alt text tốt xuất hiện trên Google Images, (2) **Ngữ cảnh trang** — alt text cung cấp thêm tín hiệu về nội dung trang, giúp ranking cho toàn trang, (3) **Accessibility** — trình đọc màn hình đọc alt text, đây cũng là yếu tố Google đánh giá, (4) **Fallback** — khi hình không load được, alt text vẫn cung cấp thông tin.

</details>

**2. WebP và AVIF khác nhau như thế nào? Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

WebP do Google phát triển, nén khoảng 25-30% so với JPEG ở cùng chất lượng, hỗ trợ 97%+ trình duyệt. AVIF do Alliance for Open Media phát triển, nén tốt hơn WebP 20-30% nhưng chậm hơn khi encode và hỗ trợ 92% trình duyệt. Khuyến nghị: dùng WebP làm mặc định vì cân bằng tốt giữa kích thước, chất lượng và hỗ trợ. Dùng AVIF khi cần nén tối đa và không quan tâm đến thời gian encode (ví dụ: ảnh static trên CDN). Luôn có JPEG/PNG làm fallback.

</details>

**3. Lazy loading ảnh hưởng đến SEO không? Googlebot có đọc được hình lazy load?**

<details className="qa">
<summary>Xem đáp án</summary>

Googlebot có thể render JavaScript và đọc hình lazy load, nhưng với điều kiện: (1) Dùng native `loading="lazy"` — Googlebot hỗ trợ tốt nhất, (2) Nếu dùng custom JS lazy loading (Intersection Observer), cần đảm bảo hình có trong DOM (không dùng `noscript` fallback), (3) **Không** lazy load hình above-the-fold và LCP image — điều này làm chậm tốc độ hiển thị và ảnh hưởng Core Web Vitals. Best practice: dùng native lazy loading và đặt `loading="eager"` cho hình quan trọng.

</details>

**4. Làm sao giảm Cumulative Layout Shift (CLS) do hình ảnh?**

<details className="qa">
<summary>Xem đáp án</summary>

CLS xảy ra khi hình ảnh load xong và đẩy nội dung. Cách khắc phục: (1) **Luôn khai báo `width` và `height`** trên thẻ `img` để trình duyệt dành chỗ sẵn vị trí, (2) Dùng CSS `aspect-ratio` cho container, (3) Dùng placeholder (blur hash, skeleton) giữ chỗ vị trí, (4) Dùng `next/image` — tự động xử lý CLS. Google đánh giá CLS là một trong 3 chỉ số Core Web Vitals, nên ảnh hưởng trực tiếp đến ranking.

</details>

**5. Làm sao tối ưu hình cho một e-commerce site có hàng ngàn sản phẩm?**

<details className="qa">
<summary>Xem đáp án</summary>

Chiến lược tối ưu quy mô lớn: (1) **CDN với image processing** — dùng Cloudinary, imgix hoặc Cloudflare Images để tự động resize, convert format, nén, (2) **Responsive images** — dùng `srcset` và `sizes` để serve kích thước phù hợp, (3) **WebP/AVIF với fallback** — dùng thẻ `picture` hoặc CDN tự động, (4) **Lazy loading** cho tất cả hình dưới fold, (5) **Đặt tên file có hệ thống** — `ten-san-pham-mau-kich-thuoc.webp`, (6) **Alt text từ product data** — generate từ tên sản phẩm + thuộc tính, không để trống, (7) **Image sitemap** — khai báo hình quan trọng trong sitemap để Google index.

</details>

---

## 5. Content SEO

Bài học: [5. Content SEO](../../seo/on-page/5_content-seo.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. E-E-A-T là gì và ảnh hưởng đến ranking như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

E-E-A-T là Experience, Expertise, Authoritativeness, Trustworthiness — không phải ranking factor trực tiếp nhưng là bộ tiêu chí Google dùng để đánh giá chất lượng nội dung thông qua Quality Raters. Các trang YMYL (Your Money Your Life — tài chính, sức khỏe) bị đánh giá E-E-A-T nghiêm ngặt hơn. Cách thể hiện: trang tác giả chi tiết, nguồn tham khảo uy tín, nội dung dựa trên kinh nghiệm thực tế, thông tin chính xác và cập nhật. Google dùng nhiều tín hiệu gián tiếp (backlinks từ trang uy tín, author entities, brand mentions) để đánh giá E-E-A-T.

</details>

**2. Làm sao tối ưu content để xuất hiện trên Featured Snippets?**

<details className="qa">
<summary>Xem đáp án</summary>

Để xuất hiện trên Featured Snippets: (1) Dùng heading (H2/H3) là câu hỏi chính xác mà người dùng tìm, (2) Trả lời ngay trong đoạn văn đầu tiên sau heading (40-60 từ), (3) Cho list snippets, dùng thẻ `ol` hoặc `ul` ngay sau heading, (4) Cho table snippets, dùng thẻ `table` với header rõ ràng, (5) Trang cần nằm trong top 10 của keyword đó mới có cơ hội được chọn làm featured snippet. Không có cách đảm bảo 100% — Google tự động chọn.

</details>

**3. Topic Cluster là gì và tại sao hiệu quả cho SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

Topic Cluster là mô hình tổ chức nội dung gồm: 1 Pillar Page (bài tổng quan, nhắm short-tail keyword) và nhiều Cluster Pages (bài chi tiết, nhắm long-tail keywords), liên kết với nhau bằng internal links. Hiệu quả vì: (1) Google hiểu bạn là "expert" về chủ đề đó khi thấy nhiều bài chi tiết liên kết với nhau, (2) Link equity được phân phối hiệu quả trong cluster, (3) Người đọc có trải nghiệm hoàn chỉnh — đọc từ tổng quan đến chi tiết, (4) Giảm keyword cannibalization vì mỗi bài nhắm một long-tail keyword riêng.

</details>

**4. Google có phạt content viết bằng AI không?**

<details className="qa">
<summary>Xem đáp án</summary>

Google không phạt content vì "được viết bằng AI" — họ phạt content chất lượng thấp bất kể nguồn gốc. Theo Google's Helpful Content guidelines, nội dung cần: (1) Được viết cho người đọc, không phải cho search engine, (2) Thể hiện kinh nghiệm và chuyên môn, (3) Cung cấp giá trị mà người đọc không tìm được ở nơi khác. Content AI thuần túy thường thiếu kinh nghiệm thực tế (Experience trong E-E-A-T) và có thể bị đánh giá thấp. Best practice: dùng AI để hỗ trợ (draft, research, outline) nhưng thêm kinh nghiệm, ví dụ thực tế, và insight của mình.

</details>

**5. Keyword cannibalization là gì và cách xử lý?**

<details className="qa">
<summary>Xem đáp án</summary>

Keyword cannibalization xảy ra khi nhiều trang trên cùng site nhắm cùng một keyword, khiến Google không biết nên rank trang nào — kết quả là cả hai trang đều rank thấp hơn. Cách phát hiện: tìm `site:example.com "keyword"` trên Google, nếu thấy nhiều trang — có thể bị cannibalization. Cách xử lý: (1) Gộp các bài tương tự thành 1 bài toàn diện, redirect bài cũ bằng 301, (2) Phân biệt search intent — mỗi bài nhắm một intent khác (informational vs commercial), (3) Dùng canonical tag nếu có phiên bản chính và phụ, (4) Cập nhật internal linking để chỉ rõ trang chính cho keyword đó.

</details>
