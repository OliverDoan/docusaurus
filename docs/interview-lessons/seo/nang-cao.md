---
sidebar_position: 5
title: "SEO Nâng cao"
---

# SEO Nâng cao

## 1. International SEO

Bài học: [1. International SEO](../../seo/nang-cao/1_international-seo.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Sự khác biệt giữa subdirectory, subdomain và ccTLD cho International SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

: Subdirectory (`example.com/vi/`) giữ domain authority tập trung, dễ quản lý, phù hợp hầu hết trường hợp. Subdomain (`vi.example.com`) được Google coi là site riêng biệt, domain authority bị phân tán. ccTLD (`example.vn`) cho geo-targeting signal mạnh nhất nhưng phải xây authority từ đầu cho mỗi domain. Khuyến nghị dùng subdirectory trừ khi có lý do business cụ thể để dùng cách khác.

</details>

**2. Nếu hreflang tag trên trang A trỏ đến trang B, nhưng trang B không trỏ lại A thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

: Google sẽ **bỏ qua** hreflang đó. Hreflang yêu cầu confirmation hai chiều (bidirectional). Nếu thiếu return link, Google coi như hreflang không tồn tại. Ngoài ra, mỗi trang cũng phải có self-referencing hreflang (trỏ đến chính nó).

</details>

**3. `x-default` trong hreflang dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

: `x-default` chỉ định phiên bản fallback khi user không khớp bất kỳ ngôn ngữ/region nào trong danh sách hreflang. Thường trỏ đến phiên bản tiếng Anh hoặc trang chọn ngôn ngữ. Đây là best practice bắt buộc để đảm bảo mọi user đều được phục vụ.

</details>

**4. Content localization khác gì translation trong SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

: Translation chỉ dịch từ ngữ, localization đi sâu hơn: research keyword riêng cho thị trường local, điều chỉnh ví dụ cho phù hợp văn hóa, đổi tiền tệ, format ngày tháng, thậm chí thay đổi hình ảnh. Từ góc độ SEO, localization hiệu quả hơn vì target đúng search intent của user local thay vì chỉ dịch keyword.

</details>

**5. Tại sao không nên redirect user dựa trên IP detection cho SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

: Googlebot crawl từ IP ở US, nên nếu redirect dựa trên IP, Google chỉ thấy phiên bản tiếng Anh và không index được các phiên bản ngôn ngữ khác. Ngoài ra, user VPN hoặc expat cũng bị redirect sai. Best practice là dùng banner gợi ý chuyển ngôn ngữ thay vì redirect cứng, kết hợp hreflang để Google tự chọn phiên bản phù hợp.

</details>

---

## 2. E-commerce SEO

Bài học: [2. E-commerce SEO](../../seo/nang-cao/2_ecommerce-seo.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Faceted navigation gây ra vấn đề gì cho SEO và cách xử lý?**

<details className="qa">
<summary>Xem đáp án</summary>

: Faceted navigation (filter theo color, size, brand, price) tạo ra hàng triệu URL combinations, gây ra duplicate content và lãng phí crawl budget. Xử lý bằng cách: (1) Canonical tất cả filter URLs về category page chính, (2) Noindex filter pages không có search volume, (3) Block crawl params không cần thiết trong robots.txt, (4) Chỉ cho index filter combinations có search volume thực sự (ví dụ `?color=red` nếu "áo thun đỏ" có người search).

</details>

**2. Khi sản phẩm hết hàng vĩnh viễn, nên xử lý thế nào cho SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

: Nếu có sản phẩm thay thế tương tự, 301 redirect sang sản phẩm đó để chuyển link equity. Nếu không có thay thế, 301 về category page. Không nên dùng 404 vì sẽ mất backlinks và ranking đã xây dựng. Chỉ dùng 410 (Gone) khi muốn Google remove hoàn toàn khỏi index nhanh chóng.

</details>

**3. Tại sao Product schema quan trọng cho e-commerce SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

: Product schema (JSON-LD) giúp Google hiểu đây là trang sản phẩm và hiển thị rich snippets trên SERP: giá, tình trạng kho, rating. Các rich snippets này tăng CTR đáng kể (trung bình 20-30%) so với kết quả không có rich snippets. Schema cũng giúp sản phẩm xuất hiện trong Google Shopping và các tính năng tìm kiếm đặc biệt.

</details>

**4. Infinite scroll ảnh hưởng thế nào đến SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

: Googlebot không scroll như user, nên content load qua infinite scroll bằng JavaScript có thể không được index. Giải pháp là hybrid approach: infinite scroll cho UX nhưng vẫn có URL-based pagination (`?page=2`, `?page=3`) render phía server. Thêm `rel="prev/next"` links (vẫn hữu ích cho Bing) và đảm bảo mỗi paginated URL có canonical trỏ đến chính nó.

</details>

**5. Canonical tag nên xử lý thế nào cho product variants?**

<details className="qa">
<summary>Xem đáp án</summary>

: Phụ thuộc vào mức độ khác biệt giữa variants. Nếu variants chỉ khác color/size mà description giống nhau, dùng canonical trỏ về trang product chính. Nếu variants có nội dung thực sự khác (ví dụ iPhone 15 Pro vs iPhone 15 Pro Max), tạo trang riêng với canonical self-referencing. Query params như `?color=red&size=L` luôn canonical về trang chính.

</details>

---

## 3. Local SEO

Bài học: [3. Local SEO](../../seo/nang-cao/3_local-seo.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. NAP consistency là gì và tại sao quan trọng cho Local SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

: NAP là Name, Address, Phone — ba thông tin cốt lõi của doanh nghiệp. Google cross-reference NAP từ nhiều nguồn (website, GBP, directories, social media) để xác minh doanh nghiệp. Nếu NAP không nhất quán (ví dụ website ghi "Q.1" nhưng GBP ghi "Quận 1"), Google mất confidence vào accuracy của listing và giảm ranking trong Local Pack. Phải chuẩn hóa NAP về một format duy nhất trên tất cả platforms.

</details>

**2. Local Pack ranking factors khác gì so với organic ranking?**

<details className="qa">
<summary>Xem đáp án</summary>

: Local Pack dựa vào 3 yếu tố chính: (1) **Relevance** — doanh nghiệp có liên quan đến search query không, (2) **Distance** — doanh nghiệp gần user bao nhiêu, (3) **Prominence** — doanh nghiệp nổi tiếng ra sao (reviews, citations, backlinks). Organic ranking chủ yếu dựa vào content quality, backlinks, technical SEO. Local Pack thiên về GBP optimization, reviews, và NAP consistency hơn là on-page content.

</details>

**3. Làm sao phân biệt doorway pages và legitimate location pages?**

<details className="qa">
<summary>Xem đáp án</summary>

: Doorway pages là nhiều trang gần giống nhau, chỉ thay tên location, không có unique value. Legitimate location pages có nội dung thật sự khác nhau: reviews riêng cho location đó, hình ảnh thật của cửa hàng, staff list, dịch vụ đặc thù cho khu vực, địa chỉ và giờ mở cửa riêng. Rule of thumb: nếu bạn xóa tên location khỏi 2 trang mà nội dung giống nhau, đó là doorway pages.

</details>

**4. Schema.org type nào phù hợp cho từng loại doanh nghiệp local?**

<details className="qa">
<summary>Xem đáp án</summary>

: Schema.org có nhiều subtypes của `LocalBusiness`: `Restaurant` cho nhà hàng, `Dentist` cho phòng nha, `AutoRepair` cho gara, `LegalService` cho luật sư, `RealEstateAgent` cho bất động sản. Nên dùng type cụ thể nhất có thể thay vì `LocalBusiness` chung. Ví dụ quán phở dùng `Restaurant` với `servesCuisine: "Vietnamese"`, tiệm cắt tóc dùng `HairSalon`. Type cụ thể giúp Google hiểu rõ hơn và hiển thị rich results phù hợp.

</details>

**5. Embedded Google Maps ảnh hưởng thế nào đến SEO và performance?**

<details className="qa">
<summary>Xem đáp án</summary>

: Google Maps embed bản thân không tạo ranking signal trực tiếp, nhưng giúp user experience (dễ tìm đường) và gián tiếp hỗ trợ local signals. Tuy nhiên, iframe Maps nặng khoảng 800KB-1MB, ảnh hưởng xấu đến Core Web Vitals (LCP, FCP). Giải pháp: dùng `loading="lazy"`, hoặc tốt hơn là lazy-load bằng Intersection Observer — chỉ load map khi user scroll đến section đó. Đặt map ở trang Contact/About thay vì homepage.

</details>

---

## 4. Tự động hóa SEO

Bài học: [4. Tự động hóa SEO](../../seo/nang-cao/4_seo-automation.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Làm sao tích hợp SEO checks vào CI/CD pipeline?**

<details className="qa">
<summary>Xem đáp án</summary>

: Sử dụng Lighthouse CI trong GitHub Actions: (1) Build project, (2) Chạy Lighthouse CI với assertions cho SEO score tối thiểu (ví dụ >= 90), (3) Check meta tags bằng custom script, (4) Validate sitemap.xml và robots.txt tồn tại, (5) Check broken links. Nếu bất kỳ check nào fail, PR bị block. Config trong `lighthouserc.js` cho assertions cụ thể như `meta-description: 'error'`, `canonical: 'error'`.

</details>

**2. Google Search Console API có thể lấy những data gì?**

<details className="qa">
<summary>Xem đáp án</summary>

: GSC API (Search Analytics) cung cấp: clicks, impressions, CTR, average position cho từng query và page. Có thể filter theo date range, country, device, search type. Dùng để monitor traffic trends, phát hiện pages mất ranking, tìm keyword opportunities (impressions cao nhưng CTR thấp). API cũng có URL Inspection endpoint để kiểm tra index status của URL cụ thể.

</details>

**3. Tại sao sitemap cần được generate tự động?**

<details className="qa">
<summary>Xem đáp án</summary>

: Website thay đổi liên tục — thêm trang, xóa trang, cập nhật nội dung. Sitemap static (viết tay) nhanh chóng outdated, dẫn đến: (1) Google không biết trang mới, (2) Google cố crawl trang đã xóa (wasted crawl budget), (3) `lastmod` dates không chính xác khiến Google không re-crawl trang đã cập nhật. Giải pháp: generate sitemap trong build step, dựa trên files/pages thực tế trong build output.

</details>

**4. Broken links ảnh hưởng thế nào đến SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

: Broken internal links (404) lãng phí crawl budget và cắt đứt link equity flow. User gặp 404 tăng bounce rate. Google coi broken links là tín hiệu website được maintain kém. Broken external links (outbound) ảnh hưởng ít hơn nhưng vẫn gây UX xấu. Nên chạy broken link check tự động weekly, và trong CI/CD cho internal links.

</details>

**5. Lighthouse CI assertions nên set thế nào cho SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

: Chia thành 2 levels: `error` (block PR) và `warn` (cảnh báo nhưng không block). **Error-level**: `meta-description`, `document-title`, `canonical`, `is-crawlable`, `crawlable-anchors`, `image-alt`, `categories:seo >= 0.9`. **Warn-level**: `hreflang`, `link-text`, `robots-txt`, `categories:performance >= 0.8`. Tùy project mà điều chỉnh — site mới có thể bắt đầu với threshold thấp hơn rồi nâng dần.

</details>

---

## 5. Chiến lược SEO tổng thể

Bài học: [5. Chiến lược SEO tổng thể](../../seo/nang-cao/5_seo-strategy-va-case-study.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Khi migrate website từ SPA sang SSR, những bước SEO nào là bắt buộc?**

<details className="qa">
<summary>Xem đáp án</summary>

: (1) Map tất cả old URLs sang new URLs và setup 301 redirects, (2) Giữ nguyên URL structure nếu có thể, (3) Verify tất cả meta tags, canonical tags render đúng phía server, (4) Submit new sitemap.xml lên Google Search Console, (5) Monitor index coverage trong GSC hàng ngày trong 2-4 tuần đầu, (6) Check Core Web Vitals không bị regression, (7) Validate structured data vẫn hoạt động. Quan trọng nhất là redirect mapping — mất 1 URL có backlinks = mất link equity vĩnh viễn.

</details>

**2. SEO roadmap cho website mới nên ưu tiên gì trong 3 tháng đầu?**

<details className="qa">
<summary>Xem đáp án</summary>

: Tháng 1: Technical foundation — HTTPS, mobile-friendly, Core Web Vitals, robots.txt, sitemap.xml, GSC setup. Tháng 2: On-page basics — keyword research, title/meta optimization cho core pages, heading structure, internal linking strategy. Tháng 3: Content — publish 10-15 quality articles targeting long-tail keywords ít competition. Không nên tập trung vào link building trong 3 tháng đầu vì chưa có content đáng link đến.

</details>

**3. Làm sao đo lường ROI của SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

: Track metrics theo thứ tự: (1) **Technical**: Index coverage, crawl errors (GSC), Lighthouse scores, (2) **Visibility**: Impressions, average position cho target keywords (GSC), (3) **Traffic**: Organic sessions, new users from organic (GA4), (4) **Engagement**: Bounce rate, pages/session, avg. session duration cho organic traffic, (5) **Conversion**: Goal completions, revenue from organic channel. So sánh tháng-over-tháng và year-over-year. ROI = (Revenue from organic - SEO investment) / SEO investment.

</details>

**4. CSR, SSR, SSG khác nhau thế nào về SEO?**

<details className="qa">
<summary>Xem đáp án</summary>

: **CSR** (Client-Side Rendering): HTML trống, JS render content phía client. Google có thể render nhưng không reliable, delay index, không thấy meta tags dynamic. Worst cho SEO. **SSR** (Server-Side Rendering): Server render full HTML mỗi request. Google thấy content ngay. Tốt cho SEO, nhưng TTFB cao hơn. **SSG** (Static Site Generation): HTML được generate lúc build. Tốt nhất cho SEO: fast TTFB, full content sẵn, cacheable. Best cho content không thay đổi thường xuyên. **ISR** (Incremental Static Regeneration): Hybrid SSG + SSR, revalidate theo thời gian. Best of both worlds cho dynamic content.

</details>

**5. Nếu organic traffic tụt đột ngột 50%, bạn sẽ debug thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

: (1) Check GSC Manual Actions — có bị Google penalty không, (2) Check GSC Index Coverage — số trang indexed có giảm không, (3) Check deployment history — có code change nào gần đây ảnh hưởng SEO không (thêm noindex, robots block, broken redirects), (4) Check Google Algorithm Update calendar — có core update gần đây không, (5) So sánh GSC data: pages và queries nào mất traffic cụ thể, (6) Check competitors — họ cũng tụt hay chỉ mình bạn, (7) Check technical: site vẫn accessible, SSL valid, server response time bình thường. Thường thì nguyên nhân nằm ở code deployment hoặc algorithm update.

</details>
