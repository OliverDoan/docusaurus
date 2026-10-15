---
sidebar_position: 1
title: "Nền tảng SEO"
---

# Nền tảng SEO

## 1. SEO là gì?

Bài học: [1. SEO là gì?](../../seo/nen-tang/1_seo-la-gi.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. SEO là gì? Tại sao developer cần quan tâm đến SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

SEO (Search Engine Optimization) là quá trình tối ưu website để cải thiện thứ hạng trên kết quả tìm kiếm tự nhiên. Developer cần quan tâm vì phần lớn SEO là technical:

- **Tốc độ tải trang**: Developer implement lazy loading, code splitting, image optimization
- **HTML semantic**: Developer quyết định cấu trúc heading, semantic tags
- **SSR/SSG**: Developer chọn rendering strategy ảnh hưởng trực tiếp đến crawlability
- **Structured data**: Chỉ developer mới implement được JSON-LD
- **Performance**: Core Web Vitals là ranking factor, và chỉ developer có thể tối ưu

</details>

**2. Phân biệt SEO, SEM và PPC?**

<details className="qa">
<summary>Xem đáp án</summary>

- **SEO**: Tối ưu kết quả organic (miễn phí), mất 3-6 tháng nhưng traffic bền vững
- **SEM**: Chiến lược marketing tổng thể trên search engine, bao gồm cả SEO và PPC
- **PPC**: Quảng cáo trả tiền mỗi click (Google Ads), hiệu quả ngay nhưng traffic mất khi dừng trả tiền

**Key insight**: SEO là khoản đầu tư dài hạn, PPC là chi phí ngắn hạn. SEM là chiến lược kết hợp cả hai.

</details>

**3. Giải thích ba trụ cột của SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

1. **On-page SEO**: Tối ưu nội dung và HTML trên website -- title tag, meta description, heading hierarchy, keyword usage, internal linking
2. **Off-page SEO**: Yếu tố bên ngoài website -- backlinks, brand mentions, social signals. Tăng uy tín và độ tin cậy của website
3. **Technical SEO**: Đảm bảo Google crawl và index website hiệu quả -- site speed, mobile-friendly, structured data, robots.txt, sitemap, HTTPS

Developer chủ yếu chịu trách nhiệm **On-page** (HTML structure) và **Technical SEO**.

</details>

**4. Tại sao SPA (React, Vue) lại có vấn đề với SEO? Giải pháp là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

SPA render nội dung bằng JavaScript phía client. Khi Googlebot crawl, nó nhận được một file HTML gần như trống (chỉ có `<div id="root"></div>`). Dù Googlebot có khả năng render JavaScript, nhưng:

- Tốn crawl budget (phải đợi JS execute)
- Không phải lúc nào cũng render đúng 100%
- Thời gian index chậm hơn so với HTML tĩnh

**Giải pháp**:
- **SSR** (Server-Side Rendering): Next.js, Nuxt.js -- render HTML phía server
- **SSG** (Static Site Generation): Gatsby, Docusaurus -- generate HTML lúc build
- **ISR** (Incremental Static Regeneration): Next.js -- kết hợp SSG + SSR
- **Pre-rendering**: Dùng service như Prerender.io để tạo HTML snapshot cho bot

</details>

**5. Canonical URL là gì? Khi nào cần dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

Canonical URL là tag HTML chỉ cho Google biết **phiên bản chính thức** của một trang khi có nhiều URL cùng nội dung:

```html
<link rel="canonical" href="https://example.com/bai-viet">
```

**Khi nào cần dùng:**
- Cùng một trang có nhiều URL (có/không `www`, có/không trailing slash)
- Trang có query parameters (`?ref=facebook`, `?page=1`)
- Nội dung được syndicate (đăng lại) trên nhiều website
- Trang có phiên bản HTTP và HTTPS
- Trang sản phẩm xuất hiện trong nhiều category

Nếu không dùng canonical, Google sẽ tự chọn một phiên bản -- và có thể chọn sai.

</details>

---

## 2. Google hoạt động thế nào

Bài học: [2. Google hoạt động thế nào](../../seo/nen-tang/2_cach-google-hoat-dong.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Mô tả cách Google hoạt động từ khi user gõ từ khóa đến khi thấy kết quả?**

<details className="qa">
<summary>Xem đáp án</summary>

Google hoạt động theo pipeline 3 bước (đã thực hiện trước khi user tìm kiếm):
1. **Crawl**: Googlebot tự động duyệt web, thu thập HTML qua HTTP request. Tìm links trong HTML để crawl tiếp các trang liên kết.
2. **Index**: Phân tích HTML đã crawl -- tách title, heading, content, links. Render JavaScript nếu cần. Lưu vào Google Index database.
3. **Rank**: Khi user tìm kiếm, Google query Index database, áp dụng thuật toán xếp hạng (200+ yếu tố) và trả về kết quả trong mili-giây.

Bước Crawl và Index xảy ra **liên tục, không phụ thuộc** vào search query. Bước Rank mới xảy ra real-time khi user tìm kiếm.

</details>

**2. Crawl budget là gì? Khi nào cần quan tâm?**

<details className="qa">
<summary>Xem đáp án</summary>

Crawl budget là giới hạn số trang mà Googlebot sẽ crawl trên website trong một khoảng thời gian, được quyết định bởi crawl rate limit (server capacity) và crawl demand (độ phổ biến/freshness).

**Cần quan tâm khi:**
- Website có hơn 10,000 trang
- Website e-commerce với nhiều biến thể sản phẩm
- Website có nhiều URL parameters tạo duplicate
- Website có nhiều trang chất lượng thấp

**Tối ưu bằng cách**: Dùng robots.txt block trang không cần index, submit sitemap, cải thiện server response time, xử lý duplicate content.

</details>

**3. Giải thích PageRank bằng ngôn ngữ đơn giản?**

<details className="qa">
<summary>Xem đáp án</summary>

PageRank xem mỗi link từ trang A đến trang B như một "lá phiếu bầu" cho trang B. Phiếu bầu từ trang có PageRank cao (ví dụ Wikipedia) giá trị hơn phiếu từ trang PageRank thấp (blog cá nhân). Trang nhận nhiều phiếu bầu chất lượng → PageRank cao → xếp hạng tốt hơn.

Damping factor (~0.85) mô phỏng xác suất user tiếp tục click link thay vì bắt đầu tìm kiếm mới. PageRank vẫn là một phần trong hệ thống ranking của Google, dù không còn được công khai score.

</details>

**4. Sự khác biệt giữa robots.txt và meta robots tag?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | `robots.txt` | `<meta name="robots">` |
|----------|-------------|----------------------|
| **Vị trí** | File ở root domain (`/robots.txt`) | Trong `<head>` của HTML |
| **Tác dụng** | Chặn **crawl** (Googlebot không truy cập trang) | Chặn **index** (Googlebot crawl nhưng không lưu vào index) |
| **Scope** | Áp dụng theo đường dẫn (path) | Áp dụng cho từng trang |
| **Lưu ý quan trọng** | Nếu block bằng robots.txt, Google **không thấy** meta robots tag | Nếu muốn trang không xuất hiện trên Google, dùng `noindex` |

**Sai lầm phổ biến**: Block trang bằng robots.txt **nhưng** vẫn có link từ trang khác trỏ đến → Google vẫn có thể index URL (dù không crawl nội dung), hiển thị snippet rỗng trên SERP.

</details>

**5. Website SPA (React) không được Google index. Bạn sẽ debug như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Bước 1**: Kiểm tra view source (`curl https://example.com`) -- nếu chỉ thấy `<div id="root"></div>` → vấn đề CSR, Google không render được JS.

**Bước 2**: Kiểm tra Google Search Console → URL Inspection → xem "Rendered page" có nội dung không.

**Bước 3**: Kiểm tra robots.txt không block CSS/JS files (Google cần chúng để render).

**Bước 4**: Kiểm tra console errors khi render -- API calls có timeout, CORS issues, hoặc JS errors có thể prevent rendering.

**Giải pháp lâu dài**: Migrate sang SSR (Next.js) hoặc SSG (Docusaurus, Gatsby), hoặc implement pre-rendering service (Prerender.io).

</details>

---

## 3. Nghiên cứu từ khóa cho developer

Bài học: [3. Nghiên cứu từ khóa cho developer](../../seo/nen-tang/3_keyword-research.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Search Intent là gì? Tại sao quan trọng cho SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

Search Intent là mục đích đằng sau mỗi tìm kiếm của user. Có 4 loại: Informational (tìm thông tin), Navigational (tìm website cụ thể), Transactional (muốn mua/đăng ký), Commercial Investigation (so sánh trước khi mua).

Search Intent quan trọng vì Google xếp hạng cao cho trang **match đúng intent**. Nếu user tìm "react hooks tutorial" (informational) mà trang bạn là landing page bán khóa học (transactional) → Google sẽ không rank trang bạn, dù content hay đến mấy. Cách xác định intent: gõ keyword lên Google và xem loại content ở top 10.

</details>

**2. Phân biệt long-tail và short-tail keywords? Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Short-tail**: 1-2 từ, search volume cao, cạnh tranh cao, intent mơ hồ. Ví dụ: "javascript", "docker".

**Long-tail**: 3+ từ, search volume thấp, cạnh tranh thấp, intent rõ ràng, conversion cao hơn. Ví dụ: "cách sửa lỗi CORS trong fetch API".

**Chiến lược**: Website mới nên bắt đầu với long-tail keywords (dễ rank, traffic chất lượng). Khi domain authority tăng dần, mở rộng sang medium-tail và short-tail. Long-tail tuy volume nhỏ nhưng tổng cộng hàng nghìn long-tail keywords có thể mang lại traffic lớn hơn vài short-tail keywords.

</details>

**3. Keyword cannibalization là gì? Cách khắc phục?**

<details className="qa">
<summary>Xem đáp án</summary>

Keyword cannibalization xảy ra khi nhiều trang trên cùng website target cùng một keyword. Google không biết rank trang nào → cả hai trang đều rank thấp, thay vì một trang rank cao.

**Cách phát hiện**: Google Search Console → xem nhiều URL rank cho cùng keyword. Hoặc tìm `site:example.com "target keyword"` trên Google.

**Cách khắc phục**:
1. Merge hai bài thành một bài toàn diện hơn (redirect bài cũ)
2. Phân biệt keyword target cho mỗi bài (ví dụ: "docker basics" vs "docker compose guide")
3. Dùng canonical tag nếu cần giữ cả hai URL

</details>

**4. Với vai trò developer, bạn sẽ implement keyword vào HTML ở những vị trí nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Theo thứ tự quan trọng:
1. **Title tag** (`<title>`): Keyword chính ở đầu, 50-60 ký tự
2. **H1 tag**: Chỉ 1 H1/trang, chứa keyword chính
3. **URL slug**: `/keyword-chinh-o-day` (dùng dấu gạch ngang, không dấu tiếng Việt nếu target international)
4. **Meta description**: 150-160 ký tự, chứa keyword, có call-to-action
5. **H2/H3**: Keyword biến thể trong subheadings
6. **Đoạn đầu**: 100 từ đầu tiên chứa keyword
7. **Image alt text**: Mô tả ảnh có chứa keyword liên quan
8. **Schema markup**: Keyword trong `headline` và `description` của JSON-LD
9. **Internal link anchor text**: Link đến trang liên quan với anchor text chứa keyword

Lưu ý: Không nhồi keyword. Google đủ thông minh để hiểu ngữ nghĩa (semantic search). Viết tự nhiên, cho con người đọc, không phải cho bot.

</details>

**5. Làm sao tìm keyword opportunities từ Google Search Console?**

<details className="qa">
<summary>Xem đáp án</summary>

Vào GSC, mục Performance, filter theo Queries. Tìm keywords có:

1. **Impressions cao nhưng clicks thấp** (CTR thấp): Trang đang hiển thị trên SERP nhưng user không click → Cần tối ưu title tag và meta description cho hấp dẫn hơn.

2. **Average position 11-20** (trang 2): Keyword đang "gần" trang 1 → Cần cải thiện content, thêm internal links, hoặc build backlinks để đẩy lên trang 1.

3. **Impressions tăng đột biến**: Keyword đang trending → Cần nhanh chóng tối ưu hoặc viết content mới để tận dụng xu hướng.

Đây là nguồn data **thực tế nhất** vì đến trực tiếp từ Google, khác với data ước tính của Ahrefs hay SEMrush.

</details>

---

## 4. HTML SEO cơ bản

Bài học: [4. HTML SEO cơ bản](../../seo/nen-tang/4_html-seo-co-ban.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Tại sao semantic HTML quan trọng cho SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

Semantic HTML giúp Google hiểu **vai trò và cấu trúc** của từng phần nội dung trên trang. Khi dùng `<article>`, Google biết đó là nội dung chính. Khi dùng `<nav>`, Google biết đó là navigation và không xem là content chính. Khi dùng `<aside>`, Google hiểu đó là nội dung phụ.

Ngoài SEO, semantic HTML còn giúp: screen readers hoạt động tốt hơn (accessibility), code dễ maintain hơn, và browsers có thể optimize rendering. Google cũng coi nội dung trong `<main>` quan trọng hơn nội dung trong `<footer>` khi phân tích relevance.

</details>

**2. Sự khác biệt giữa title tag và H1? Có nên giống nhau không?**

<details className="qa">
<summary>Xem đáp án</summary>

**Title tag** (`<title>`) hiển thị trên tab browser và SERP (kết quả Google). **H1** hiển thị trên chính trang web. Cả hai đều là ranking signals quan trọng.

Chúng **có thể** giống nhau (không bị phạt), nhưng **nên khác nhau** để:
- Title tag tối ưu cho SERP: ngắn gọn, có brand name, hấp dẫn click
- H1 tối ưu cho reader: có thể dài hơn, mô tả chi tiết hơn
- Cover nhiều keyword variations hơn

Ví dụ: Title "Docker Tutorial cho người mới | DevBlog" + H1 "Hướng dẫn Docker từ cơ bản đến deploy production" → cover cả "docker tutorial" và "hướng dẫn docker deploy".

</details>

**3. Alt text cho image nên viết như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Alt text nên:
- **Mô tả chính xác** nội dung ảnh (như đang giải thích cho người không nhìn thấy)
- **Ngắn gọn**: 50-125 ký tự
- **Tự nhiên**: Chứa keyword nếu phù hợp, nhưng không nhồi keyword
- **Cụ thể**: "Biểu đồ so sánh performance React vs Vue" thay vì "biểu đồ"

Ngoại lệ: Ảnh decorative (đường kẻ, icon trang trí) dùng `alt=""` (alt rỗng) để screen reader bỏ qua.

</details>

**4. Core Web Vitals nào liên quan đến HTML structure? Cách khắc phục?**

<details className="qa">
<summary>Xem đáp án</summary>

**CLS (Cumulative Layout Shift)** liên quan trực tiếp nhất. Nguyên nhân phổ biến:
- Image không có `width` và `height` → browser không biết reserved space → layout shift khi ảnh load
- Font chưa load xong → text reflow khi web font apply
- Ads/embeds không có fixed dimensions

**Khắc phục trong HTML**:
- Luôn khai báo `width` và `height` cho `<img>` và `<video>`
- Dùng `<link rel="preload">` cho font
- Reserve space cho dynamic content (ads, lazy-loaded elements)
- Dùng CSS `aspect-ratio` cho responsive containers

</details>

**5. Bạn nhận được task tối ưu SEO cho một trang web hiện tại. Bạn sẽ kiểm tra những HTML elements nào đầu tiên?**

<details className="qa">
<summary>Xem đáp án</summary>

Checklist SEO audit cho HTML, theo thứ tự ưu tiên:

1. **Title tag**: Có tồn tại? Đúng độ dài? Chứa keyword? Unique?
2. **Meta description**: Có tồn tại? 150-160 ký tự? Hấp dẫn?
3. **H1**: Chỉ có 1? Chứa keyword? Match search intent?
4. **Heading hierarchy**: H1 → H2 → H3 đúng thứ tự? Không skip level?
5. **Canonical tag**: Có khai báo? URL đúng?
6. **Meta viewport**: Có cho mobile-friendly?
7. **Images**: Có alt text? Có width/height? Có lazy loading?
8. **Semantic HTML**: Dùng `<main>`, `<article>`, `<nav>` hay toàn `<div>`?
9. **Structured data**: Có JSON-LD? Schema type đúng?
10. **Open Graph/Twitter**: Có đầy đủ cho social sharing?

Dùng Lighthouse audit (tab SEO) để kiểm tra tự động phần lớn checklist này.

</details>

---

## 5. Công cụ SEO thiết yếu

Bài học: [5. Công cụ SEO thiết yếu](../../seo/nen-tang/5_cong-cu-seo.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Bạn sẽ dùng tool nào để kiểm tra SEO cho website? Mô tả workflow.**

<details className="qa">
<summary>Xem đáp án</summary>

Workflow SEO audit 5 bước:
1. **Lighthouse CLI**: Chạy audit nhanh (`lighthouse URL --only-categories=seo,performance`). Xem score SEO, performance, accessibility. Đọc danh sách issues cần fix.
2. **Google Search Console**: Kiểm tra Coverage report (trang nào bị error, excluded). Xem Performance report (keyword nào mang traffic, CTR thấp ở đâu).
3. **Chrome DevTools**: Inspect HTML structure (heading hierarchy, meta tags, structured data). Network tab kiểm tra HTTP status codes.
4. **PageSpeed Insights**: Kiểm tra Core Web Vitals với cả lab data và field data.
5. **Rich Results Test**: Validate structured data (JSON-LD).

Tất cả đều miễn phí. Chỉ cần Ahrefs/SEMrush khi cần backlink analysis hoặc keyword research chuyên sâu.

</details>

**2. Core Web Vitals gồm những metrics nào? Cách đo lường?**

<details className="qa">
<summary>Xem đáp án</summary>

3 metrics chính:
- **LCP** (Largest Contentful Paint): Thời gian render element lớn nhất. Target dưới 2.5s. Đo bằng Lighthouse, PSI, CrUX.
- **INP** (Interaction to Next Paint): Thời gian phản hồi sau tương tác user. Target dưới 200ms. Đo bằng CrUX, web-vitals library.
- **CLS** (Cumulative Layout Shift): Mức độ layout shift. Target dưới 0.1. Đo bằng Lighthouse, PSI.

**Cách đo**: Lab data qua Lighthouse/PSI (controlled, reproducible). Field data qua CrUX/GSC (real users, đây là data Google dùng để ranking). Nên xem cả hai: lab data để debug, field data để biết thực tế.

</details>

**3. Google Search Console cho developer biết thông tin gì?**

<details className="qa">
<summary>Xem đáp án</summary>

GSC cung cấp:
- **Performance**: Keyword nào website rank, clicks, impressions, CTR, average position. Filter theo page, country, device.
- **Coverage/Indexing**: Bao nhiêu trang được index, trang nào bị error (5xx, redirect), trang nào bị excluded (noindex, duplicate).
- **URL Inspection**: Debug từng URL -- đã index chưa, crawl lần cuối khi nào, rendered page trông thế nào.
- **Core Web Vitals**: Report LCP, INP, CLS từ real users.
- **Sitemaps**: Submit và monitor sitemap status.
- **Links**: Internal links và external links (backlinks) mà Google phát hiện.

GSC là nguồn data **trực tiếp từ Google**, chính xác hơn bất kỳ tool bên thứ ba nào.

</details>

**4. Làm sao tích hợp SEO checks vào CI/CD pipeline?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng Lighthouse CI (`@lhci/cli`):

1. Cài Lighthouse CI: `npm install -g @lhci/cli`
2. Tạo `lighthouserc.js` config: Define URLs cần test, thresholds cho mỗi category
3. Thêm step vào CI pipeline:
   - Build project
   - Start local server
   - Run `lhci autorun`
   - Pipeline fail nếu SEO score dưới threshold (ví dụ 90)

Cách này đảm bảo mỗi PR đều pass SEO minimum requirements. Team không thể accidentally merge code phá hỏng SEO (missing title, noindex, performance regression).

</details>

**5. Lab data vs Field data trong PageSpeed Insights khác nhau thế nào? Cái nào quan trọng hơn?**

<details className="qa">
<summary>Xem đáp án</summary>

**Lab data** (Lighthouse): Chạy trong controlled environment (cố định network, CPU). Reproducible, useful cho debugging. Nhưng không phản ánh thực tế vì user có devices và network khác nhau.

**Field data** (CrUX): Dữ liệu từ Chrome users thực, 28-day rolling average. Phản ánh trải nghiệm thực tế. **Đây là data Google dùng để ranking**.

**Cái nào quan trọng hơn**: Field data quan trọng hơn cho ranking. Tuy nhiên, field data chỉ có khi website có đủ traffic (đủ mẫu Chrome users). Website mới chưa có field data → phải dựa vào lab data.

**Best practice**: Dùng lab data để identify issues và debug. Dùng field data để xác nhận improvements đã tác động đến real users. Khi lab data tốt mà field data kém → có thể do users dùng device yếu hoặc network chậm (thường gặp ở thị trường mobile ở Việt Nam).

</details>
