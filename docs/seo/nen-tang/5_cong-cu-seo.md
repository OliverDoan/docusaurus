---
sidebar_position: 5
title: "Công cụ SEO thiết yếu"
---

# Công cụ SEO thiết yếu

Bạn không thể cải thiện thứ hạng SEO nếu không **đo lường** được. Giống như developer cần debugger để tìm bug, SEO cần tools để phát hiện vấn đề, theo dõi performance, và đo lường kết quả. Bài này hướng dẫn bạn sử dụng các công cụ SEO thiết yếu -- tập trung vào những tool mà **developer** hay dùng nhất.

---

## 1. Google Search Console -- Bảng điều khiển SEO #1

### 1.1. Google Search Console (GSC) là gì?

GSC là tool **miễn phí** của Google cho phép bạn:
- Xem website đang rank cho keyword nào
- Biết Google đã index bao nhiêu trang
- Phát hiện lỗi crawl, mobile usability, Core Web Vitals
- Submit sitemap, request indexing
- Xem backlinks

Đây là nguồn data **chính xác nhất** vì đến trực tiếp từ Google, không phải dữ liệu ước tính.

### 1.2. Setup Google Search Console

**Bước 1: Thêm property**

```
Truy cập: https://search.google.com/search-console
→ Click "Add property"
→ Chọn "URL prefix" hoặc "Domain"
```

| Loại | Khi nào dùng | Ví dụ |
|------|-------------|-------|
| **Domain** | Muốn verify toàn bộ domain (bao gồm subdomain) | `example.com` (bao gồm `www.`, `blog.`, `app.`) |
| **URL prefix** | Chỉ verify 1 URL prefix cụ thể | `https://www.example.com` |

**Bước 2: Verify quyền sở hữu**

Có 5 cách verify, xếp theo **độ khuyến nghị cho developer**:

```html
<!-- Cách 1: HTML tag (đơn giản nhất) -->
<!-- Thêm vào <head> của trang chủ -->
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE">
```

```bash
# Cách 2: DNS record (cho Domain property)
# Thêm TXT record vào DNS:
# Type: TXT
# Name: @ (hoặc để trống)
# Value: google-site-verification=YOUR_CODE
# TTL: 3600
```

```bash
# Cách 3: HTML file upload
# Download file google[code].html từ GSC
# Upload lên root domain: https://example.com/google[code].html

# Cách 4: Google Analytics (nếu đã cài GA)
# GSC tự detect GA code trên trang

# Cách 5: Google Tag Manager
# GSC tự detect GTM container
```

**Bước 3: Submit Sitemap**

```
GSC → Sitemaps (menu trái)
→ Nhập URL sitemap: sitemap.xml
→ Click "Submit"
```

Với Docusaurus, sitemap ở `https://your-domain.com/sitemap.xml` (auto-generated).

### 1.3. Các tính năng quan trọng trong GSC

**Performance Report -- Xem traffic từ Google:**

```
Metrics quan trọng:
- Total clicks: Số click từ Google Search
- Total impressions: Số lần hiển thị trên SERP
- Average CTR: Tỷ lệ click = clicks / impressions
- Average position: Vị trí trung bình trên SERP

Filter theo:
- Queries: Keyword nào mang traffic
- Pages: Trang nào nhận traffic nhiều nhất
- Countries: Traffic từ quốc gia nào
- Devices: Mobile vs Desktop vs Tablet
- Date range: So sánh các khoảng thời gian
```

**URL Inspection -- Debug từng URL:**

```
Nhập URL bất kỳ → GSC cho biết:
- URL đã được index chưa?
- Google crawl lần cuối khi nào?
- Có lỗi gì khi crawl không?
- Rendered page trông thế nào?
- Mobile usability có vấn đề gì?
- Structured data có hợp lệ không?
```

**Coverage Report -- Tình trạng index:**

```
4 trạng thái:
- Error: Trang có lỗi, không thể index (5xx, redirect loop)
- Valid with warnings: Đã index nhưng có vấn đề
- Valid: Đã index thành công
- Excluded: Google chủ ý không index (noindex, duplicate, etc.)
```

### 1.4. GSC API cho developer

```bash
# Cài đặt Google API client
pip install google-api-python-client google-auth-oauthlib

# Hoặc dùng Node.js
npm install googleapis
```

```javascript
// Node.js: Query GSC API để lấy keyword data
const { google } = require('googleapis');

async function getSearchAnalytics() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const response = await searchconsole.searchanalytics.query({
    siteUrl: 'https://example.com',
    requestBody: {
      startDate: '2026-03-01',
      endDate: '2026-04-01',
      dimensions: ['query', 'page'],
      rowLimit: 25,
      // Lọc keyword ở trang 2 (vị trí 11-20) - cơ hội tối ưu
      dimensionFilterGroups: [{
        filters: [{
          dimension: 'query',
          operator: 'contains',
          expression: 'docker',
        }],
      }],
    },
  });

  // In kết quả
  response.data.rows.forEach(row => {
    console.log({
      keyword: row.keys[0],
      page: row.keys[1],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: (row.ctr * 100).toFixed(2) + '%',
      position: row.position.toFixed(1),
    });
  });
}

getSearchAnalytics();
```

---

## 2. Google Lighthouse -- SEO Audit tự động

### 2.1. Lighthouse là gì?

Lighthouse là tool **open-source** của Google audit website theo 5 danh mục:
- **Performance**: Tốc độ tải trang, Core Web Vitals
- **Accessibility**: Khả năng tiếp cận cho người khuyết tật
- **Best Practices**: Bảo mật, modern web standards
- **SEO**: Technical SEO checklist
- **PWA**: Progressive Web App (tùy chọn)

### 2.2. Chạy Lighthouse từ Chrome DevTools

```
1. Mở Chrome → F12 (DevTools)
2. Tab "Lighthouse"
3. Chọn categories: Performance, Accessibility, SEO
4. Device: Mobile (quan trọng hơn cho SEO)
5. Click "Analyze page load"
6. Đợi ~30 giây → Xem report
```

### 2.3. Chạy Lighthouse từ CLI (khuyến nghị cho CI/CD)

```bash
# Cài đặt Lighthouse CLI
npm install -g lighthouse

# Chạy audit cơ bản
lighthouse https://example.com --output html --output-path report.html

# Chạy chỉ SEO audit
lighthouse https://example.com --only-categories=seo --output json

# Chạy với mobile emulation (mặc định)
lighthouse https://example.com --preset=desktop  # Hoặc desktop

# Chạy headless (cho CI/CD)
lighthouse https://example.com \
  --chrome-flags="--headless --no-sandbox" \
  --output json \
  --output-path ./lighthouse-report.json

# Chạy nhiều lần để lấy median (chính xác hơn)
lighthouse https://example.com -n 3 --output json
```

### 2.4. Lighthouse SEO Audit kiểm tra gì?

| Kiểm tra | Pass condition | Impact |
|----------|---------------|--------|
| Document has a title | Có `<title>` tag | Cao |
| Document has a meta description | Có `<meta name="description">` | Cao |
| Page has successful HTTP status code | Status 200 | Cao |
| Links have descriptive text | Anchor text không phải "click here" | Trung bình |
| Document has a valid hreflang | Hreflang tags hợp lệ | Trung bình |
| Document has a valid robots.txt | robots.txt parse được | Cao |
| Image elements have alt text | Tất cả `<img>` có `alt` | Trung bình |
| Document uses legible font sizes | Font size tối thiểu 12px | Trung bình |
| Tap targets are sized appropriately | Button/link tối thiểu 48x48px | Trung bình |
| Page is mobile friendly | Viewport, responsive | Rất cao |
| Structured data is valid | JSON-LD không có lỗi | Trung bình |
| Page is not blocked from indexing | Không có noindex | Cao |

### 2.5. Tích hợp Lighthouse vào CI/CD

```json
{
  "scripts": {
    "lighthouse": "lighthouse https://your-site.com --budget-path=budget.json --output=json --output-path=./lighthouse.json",
    "lighthouse:ci": "lhci autorun"
  }
}
```

```bash
# Cài Lighthouse CI
npm install -g @lhci/cli

# Tạo file config lighthouserc.js
```

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/', 'http://localhost:3000/blog'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

```bash
# Chạy Lighthouse CI
lhci autorun

# Output:
# SEO: 95 (pass)
# Performance: 82 (pass)
# Accessibility: 91 (pass)
```

---

## 3. Chrome DevTools cho SEO

### 3.1. Elements Panel -- Inspect HTML structure

```
F12 → Elements tab

Kiểm tra nhanh:
1. Có bao nhiêu <h1>? (nên chỉ có 1)
   Ctrl+F → search "h1" trong Elements panel

2. Title tag content?
   Expand <head> → tìm <title>

3. Meta tags?
   Expand <head> → tìm <meta name="description">
   Expand <head> → tìm <meta name="robots">
   Expand <head> → tìm <link rel="canonical">

4. Structured data?
   Expand <head> → tìm <script type="application/ld+json">
```

### 3.2. Network Tab -- Kiểm tra response

```
F12 → Network tab → Reload page

Kiểm tra:
1. HTTP status code: Click vào request đầu tiên → Headers
   - 200: OK
   - 301/302: Redirect (kiểm tra destination)
   - 404: Not Found (lỗi!)
   - 500: Server Error (lỗi!)

2. Response headers quan trọng cho SEO:
   - X-Robots-Tag: noindex (nếu có → trang không được index)
   - Cache-Control: max-age=... (caching strategy)
   - Content-Type: text/html (phải là HTML)

3. Tốc độ tải:
   - Xem waterfall chart
   - Tìm request chậm (red = slow)
   - Check total page size và number of requests
```

### 3.3. Coverage Tab -- Tìm CSS/JS unused

```
F12 → Ctrl+Shift+P → "Coverage" → Enter
→ Click reload icon
→ Xem % unused code cho mỗi file

Kết quả:
- main.css: 45% unused → Cần purge CSS
- bundle.js: 60% unused → Cần code splitting

Unused CSS/JS = file size lớn hơn → tải chậm → ranking giảm
```

### 3.4. Rendering Tab -- Test mobile rendering

```
F12 → Ctrl+Shift+P → "Rendering" → Enter

Useful options:
- Paint flashing: Highlight repaint areas (debug CLS)
- Layout shift regions: Highlight layout shifts
- Emulate CSS prefers-color-scheme: Test dark mode
```

### 3.5. Console -- Quick SEO checks

```javascript
// Chạy trong Console (F12 → Console)

// 1. Kiểm tra tất cả heading tags
document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
  console.log(`${h.tagName}: ${h.textContent.trim().substring(0, 60)}`);
});

// 2. Kiểm tra images thiếu alt
document.querySelectorAll('img:not([alt])').forEach(img => {
  console.log('Missing alt:', img.src);
});

// 3. Kiểm tra images thiếu width/height
document.querySelectorAll('img:not([width]):not([height])').forEach(img => {
  console.log('Missing dimensions:', img.src);
});

// 4. Kiểm tra links thiếu descriptive text
document.querySelectorAll('a').forEach(a => {
  const text = a.textContent.trim();
  if (['click here', 'here', 'read more', 'link'].includes(text.toLowerCase())) {
    console.warn('Non-descriptive link text:', text, '→', a.href);
  }
});

// 5. Kiểm tra meta tags
console.log('Title:', document.title);
console.log('Description:', document.querySelector('meta[name="description"]')?.content);
console.log('Canonical:', document.querySelector('link[rel="canonical"]')?.href);
console.log('Robots:', document.querySelector('meta[name="robots"]')?.content);

// 6. Kiểm tra structured data
document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
  console.log('Schema:', JSON.parse(s.textContent));
});
```

---

## 4. Google PageSpeed Insights

### 4.1. PSI là gì?

PageSpeed Insights (PSI) kết hợp data từ **Lighthouse** (lab data) và **Chrome UX Report** (field data từ real users):

```
URL: https://pagespeed.web.dev/

Lab Data (Lighthouse):
- Chạy test ngay lập tức
- Controlled environment
- Useful cho development/debugging

Field Data (CrUX):
- Data từ Chrome users thực
- 28-day rolling average
- Đây là data Google dùng để ranking
```

### 4.2. Metrics quan trọng

| Metric | Mô tả | Good | Needs Improvement | Poor |
|--------|-------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | Thời gian render element lớn nhất | Dưới 2.5s | 2.5s - 4s | Trên 4s |
| **INP** (Interaction to Next Paint) | Thời gian phản hồi tương tác | Dưới 200ms | 200ms - 500ms | Trên 500ms |
| **CLS** (Cumulative Layout Shift) | Mức độ layout bị xê dịch | Dưới 0.1 | 0.1 - 0.25 | Trên 0.25 |
| **FCP** (First Contentful Paint) | Thời gian render nội dung đầu tiên | Dưới 1.8s | 1.8s - 3s | Trên 3s |
| **TTFB** (Time to First Byte) | Thời gian server response | Dưới 800ms | 800ms - 1800ms | Trên 1800ms |

### 4.3. Chạy PSI từ API

```bash
# PageSpeed Insights API (miễn phí, cần API key)
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://example.com&key=YOUR_API_KEY&strategy=mobile&category=seo&category=performance"
```

```javascript
// Node.js script kiểm tra PSI score
async function checkPageSpeed(url) {
  const apiKey = process.env.PSI_API_KEY;
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=mobile`;

  const response = await fetch(apiUrl);
  const data = await response.json();

  const categories = data.lighthouseResult.categories;
  console.log(`URL: ${url}`);
  console.log(`Performance: ${Math.round(categories.performance.score * 100)}`);
  console.log(`SEO: ${Math.round(categories.seo.score * 100)}`);
  console.log(`Accessibility: ${Math.round(categories.accessibility.score * 100)}`);

  // Core Web Vitals
  const audits = data.lighthouseResult.audits;
  console.log(`LCP: ${audits['largest-contentful-paint'].displayValue}`);
  console.log(`CLS: ${audits['cumulative-layout-shift'].displayValue}`);
}

checkPageSpeed('https://example.com');
```

---

## 5. Các công cụ SEO khác

### 5.1. Screaming Frog SEO Spider

```
URL: https://www.screamingfrog.co.uk/seo-spider/
Loại: Desktop app (miễn phí cho 500 URLs)
Công dụng:
  - Crawl toàn bộ website như Googlebot
  - Tìm broken links (404)
  - Tìm duplicate titles, descriptions
  - Tìm missing alt text
  - Phân tích redirect chains
  - Export data ra CSV/Excel

Khi nào dùng:
  - Audit SEO cho website hiện tại
  - Migration website (kiểm tra redirects)
  - Website lớn cần crawl hàng nghìn URL
```

### 5.2. Ahrefs

```
URL: https://ahrefs.com
Chi phí: Từ $99/tháng
Tính năng chính:
  - Site Explorer: Phân tích backlinks, organic keywords
  - Keywords Explorer: Research keyword volume, difficulty
  - Site Audit: Crawl website tìm lỗi SEO
  - Content Explorer: Tìm content đang viral
  - Rank Tracker: Theo dõi keyword rankings

Developer thường dùng:
  - Site Audit: Tìm lỗi technical SEO
  - Backlink checker: Xem ai link đến mình
  - Broken backlink finder: Tìm cơ hội redirect
```

### 5.3. SEMrush

```
URL: https://www.semrush.com
Chi phí: Từ $139/tháng
Tính năng tương tự Ahrefs, plus:
  - On Page SEO Checker: Gợi ý tối ưu từng trang
  - Log File Analyzer: Phân tích server logs
  - Position Tracking: Theo dõi keyword rankings

SEMrush vs Ahrefs:
  - Ahrefs: Mạnh hơn về backlink data
  - SEMrush: Mạnh hơn về keyword research + all-in-one
  - Developer: Ahrefs thường đủ dùng
```

### 5.4. Rich Results Test

```
URL: https://search.google.com/test/rich-results
Công dụng: Kiểm tra structured data (JSON-LD) có hợp lệ không
Miễn phí, của Google

Dùng khi: Sau khi implement JSON-LD, trước khi deploy
```

### 5.5. Schema Markup Validator

```
URL: https://validator.schema.org/
Công dụng: Validate schema.org structured data
Miễn phí
```

### 5.6. Mobile-Friendly Test

```
URL: https://search.google.com/test/mobile-friendly
Công dụng: Kiểm tra website có mobile-friendly không
Miễn phí, của Google

Lưu ý: Google sử dụng mobile-first indexing
→ Nếu trang không mobile-friendly = mất ranking
```

---

## 6. Workflow SEO Audit cho developer

Dưới đây là quy trình audit SEO mà developer nên thực hiện:

### Bước 1: Quick scan với Lighthouse

```bash
# Chạy Lighthouse CLI
lighthouse https://your-site.com \
  --only-categories=seo,performance,accessibility \
  --output html \
  --output-path ./seo-audit.html

# Mở report
open ./seo-audit.html  # macOS
# xdg-open ./seo-audit.html  # Linux
```

### Bước 2: Kiểm tra indexing với GSC

```
Google Search Console → Coverage
→ Xem có bao nhiêu "Error" và "Excluded"
→ Fix errors trước (5xx, redirect loops)
→ Review excluded pages (có nên index không?)
```

### Bước 3: Crawl website với Screaming Frog

```
Screaming Frog → Enter URL → Start crawl
→ Tab "Response Codes": Tìm 404, 301, 302
→ Tab "Page Titles": Tìm missing/duplicate titles
→ Tab "Meta Description": Tìm missing/duplicate
→ Tab "H1": Tìm missing/duplicate H1
→ Tab "Images": Tìm missing alt text
```

### Bước 4: Check Core Web Vitals

```bash
# PageSpeed Insights cho mobile
# https://pagespeed.web.dev/?url=https://your-site.com&form_factor=mobile

# Hoặc CrUX API cho field data
curl "https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-site.com"}'
```

### Bước 5: Validate Structured Data

```
https://search.google.com/test/rich-results
→ Nhập URL
→ Kiểm tra errors/warnings
→ Fix schema markup nếu cần
```

### Tổng hợp tools theo mục đích

| Mục đích | Tool miễn phí | Tool trả phí |
|----------|-------------|-------------|
| Theo dõi traffic/keywords | Google Search Console | Ahrefs, SEMrush |
| Audit SEO tự động | Lighthouse CLI | Screaming Frog (500 URLs free) |
| Core Web Vitals | PageSpeed Insights, Chrome DevTools | CrUX API |
| Structured Data | Rich Results Test, Schema Validator | -- |
| Mobile-friendly | Mobile-Friendly Test, Lighthouse | -- |
| Backlink analysis | GSC (hạn chế) | Ahrefs, SEMrush |
| Keyword research | Google Keyword Planner, Trends | Ahrefs, SEMrush |
| Crawl website | -- | Screaming Frog, Sitebulb |

---

## 7. Lỗi thường gặp

### Lỗi 1: Chỉ chạy Lighthouse 1 lần và tin kết quả

```bash
# Lighthouse score dao động giữa các lần chạy
# Luôn chạy ít nhất 3 lần và lấy median

lighthouse https://example.com -n 5 --output json

# Hoặc dùng Lighthouse CI cho kết quả ổn định hơn
```

### Lỗi 2: Chỉ test trên Desktop

Google dùng **mobile-first indexing**. Luôn test mobile trước:

```bash
# Lighthouse mặc định là mobile (đúng rồi)
lighthouse https://example.com

# Nếu muốn test desktop
lighthouse https://example.com --preset=desktop
```

### Lỗi 3: Không verify Google Search Console

```
Nếu không verify GSC:
- Không biết Google thấy gì trên website
- Không biết keyword nào mang traffic
- Không phát hiện lỗi crawl
- Không submit được sitemap
- Không request indexing cho trang mới

→ GSC là tool #1, PHẢI setup ngay khi launch website
```

### Lỗi 4: Bỏ qua field data (chỉ xem lab data)

```
Lab data (Lighthouse): Chạy trong controlled environment
→ Không phản ánh thực tế

Field data (CrUX): Data từ Chrome users thực
→ Đây là data Google dùng để ranking

Kiểm tra field data:
1. PageSpeed Insights → phần "Discover what your real users are experiencing"
2. GSC → Core Web Vitals report
3. CrUX Dashboard: https://developer.chrome.com/docs/crux/dashboard/
```

### Lỗi 5: Không tự động hóa SEO checks

```javascript
// lighthouserc.js - Tích hợp vào CI/CD
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/blog',
        'http://localhost:3000/docs',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:performance': ['error', { minScore: 0.7 }],
      },
    },
  },
};

// Nếu SEO score < 90, CI/CD pipeline fail → buộc phải fix
```

---

## 8. Tổng kết

| Tool | Miễn phí? | Khi nào dùng | Ai nên dùng? |
|------|-----------|-------------|-------------|
| **Google Search Console** | Miễn phí | Luôn luôn (setup ngay) | Mọi developer |
| **Lighthouse** | Miễn phí | Mỗi lần deploy, CI/CD | Frontend developer |
| **Chrome DevTools** | Miễn phí | Debug hàng ngày | Mọi developer |
| **PageSpeed Insights** | Miễn phí | Kiểm tra Core Web Vitals | Frontend developer |
| **Rich Results Test** | Miễn phí | Sau khi implement schema | Mọi developer |
| **Screaming Frog** | Miễn phí (500 URLs) | Audit website, migration | SEO-focused developer |
| **Ahrefs** | $99+/tháng | Keyword research, backlinks | Team có budget SEO |
| **SEMrush** | $139+/tháng | All-in-one SEO platform | Team có budget SEO |

**Ưu tiên cho developer**: GSC + Lighthouse + Chrome DevTools. Ba tool miễn phí này cover 80% nhu cầu SEO audit.

---

## 9. Câu hỏi phỏng vấn

### Câu 1: Bạn sẽ dùng tool nào để kiểm tra SEO cho website? Mô tả workflow.

**Trả lời:**

Workflow SEO audit 5 bước:
1. **Lighthouse CLI**: Chạy audit nhanh (`lighthouse URL --only-categories=seo,performance`). Xem score SEO, performance, accessibility. Đọc danh sách issues cần fix.
2. **Google Search Console**: Kiểm tra Coverage report (trang nào bị error, excluded). Xem Performance report (keyword nào mang traffic, CTR thấp ở đâu).
3. **Chrome DevTools**: Inspect HTML structure (heading hierarchy, meta tags, structured data). Network tab kiểm tra HTTP status codes.
4. **PageSpeed Insights**: Kiểm tra Core Web Vitals với cả lab data và field data.
5. **Rich Results Test**: Validate structured data (JSON-LD).

Tất cả đều miễn phí. Chỉ cần Ahrefs/SEMrush khi cần backlink analysis hoặc keyword research chuyên sâu.

### Câu 2: Core Web Vitals gồm những metrics nào? Cách đo lường?

**Trả lời:**

3 metrics chính:
- **LCP** (Largest Contentful Paint): Thời gian render element lớn nhất. Target dưới 2.5s. Đo bằng Lighthouse, PSI, CrUX.
- **INP** (Interaction to Next Paint): Thời gian phản hồi sau tương tác user. Target dưới 200ms. Đo bằng CrUX, web-vitals library.
- **CLS** (Cumulative Layout Shift): Mức độ layout shift. Target dưới 0.1. Đo bằng Lighthouse, PSI.

**Cách đo**: Lab data qua Lighthouse/PSI (controlled, reproducible). Field data qua CrUX/GSC (real users, đây là data Google dùng để ranking). Nên xem cả hai: lab data để debug, field data để biết thực tế.

### Câu 3: Google Search Console cho developer biết thông tin gì?

**Trả lời:**

GSC cung cấp:
- **Performance**: Keyword nào website rank, clicks, impressions, CTR, average position. Filter theo page, country, device.
- **Coverage/Indexing**: Bao nhiêu trang được index, trang nào bị error (5xx, redirect), trang nào bị excluded (noindex, duplicate).
- **URL Inspection**: Debug từng URL -- đã index chưa, crawl lần cuối khi nào, rendered page trông thế nào.
- **Core Web Vitals**: Report LCP, INP, CLS từ real users.
- **Sitemaps**: Submit và monitor sitemap status.
- **Links**: Internal links và external links (backlinks) mà Google phát hiện.

GSC là nguồn data **trực tiếp từ Google**, chính xác hơn bất kỳ tool bên thứ ba nào.

### Câu 4: Làm sao tích hợp SEO checks vào CI/CD pipeline?

**Trả lời:**

Dùng Lighthouse CI (`@lhci/cli`):

1. Cài Lighthouse CI: `npm install -g @lhci/cli`
2. Tạo `lighthouserc.js` config: Define URLs cần test, thresholds cho mỗi category
3. Thêm step vào CI pipeline:
   - Build project
   - Start local server
   - Run `lhci autorun`
   - Pipeline fail nếu SEO score dưới threshold (ví dụ 90)

Cách này đảm bảo mỗi PR đều pass SEO minimum requirements. Team không thể accidentally merge code phá hỏng SEO (missing title, noindex, performance regression).

### Câu 5: Lab data vs Field data trong PageSpeed Insights khác nhau thế nào? Cái nào quan trọng hơn?

**Trả lời:**

**Lab data** (Lighthouse): Chạy trong controlled environment (cố định network, CPU). Reproducible, useful cho debugging. Nhưng không phản ánh thực tế vì user có devices và network khác nhau.

**Field data** (CrUX): Dữ liệu từ Chrome users thực, 28-day rolling average. Phản ánh trải nghiệm thực tế. **Đây là data Google dùng để ranking**.

**Cái nào quan trọng hơn**: Field data quan trọng hơn cho ranking. Tuy nhiên, field data chỉ có khi website có đủ traffic (đủ mẫu Chrome users). Website mới chưa có field data → phải dựa vào lab data.

**Best practice**: Dùng lab data để identify issues và debug. Dùng field data để xác nhận improvements đã tác động đến real users. Khi lab data tốt mà field data kém → có thể do users dùng device yếu hoặc network chậm (thường gặp ở thị trường mobile ở Việt Nam).
