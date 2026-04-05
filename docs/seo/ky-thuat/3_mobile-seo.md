---
sidebar_position: 3
title: "Mobile SEO"
---

# Mobile SEO

## Mobile-First Indexing là gì?

Từ năm 2023, Google đã hoàn tất chuyển sang **Mobile-First Indexing** cho toàn bộ website. Nghĩa là:

- Google dùng **phiên bản mobile** của trang để crawl, index, và xếp hạng
- Nếu trang desktop có nội dung nhưng trang mobile không có — nội dung đó sẽ **không được index**
- Nếu website không có phiên bản mobile-friendly — thứ hạng sẽ bị ảnh hưởng tiêu cực

**Với developer, điều này có nghĩa**: khi build trang web, phiên bản mobile là phiên bản chính. Desktop là phiên bản mở rộng.

## Ba cách tiếp cận Mobile

| Phương pháp | URL | HTML | CSS | Google khuyên |
|-------------|-----|------|-----|---------------|
| **Responsive Design** | Cùng URL | Cùng HTML | Media queries thay đổi layout | Co (khuyên dùng) |
| **Adaptive (Dynamic Serving)** | Cùng URL | Server trả HTML khác nhau | CSS riêng cho mỗi version | Chấp nhận |
| **Separate URLs** | m.example.com | HTML riêng | CSS riêng | Không khuyến khích |

### Tại sao Responsive Design là lựa chọn tốt nhất?

1. **Một URL duy nhất** — không bị duplicate content, backlink không phân tán
2. **Một codebase** — dễ maintain hơn separate m.site
3. **Google bot crawl dễ hơn** — không cần redirect, không cần `rel="canonical"` và `rel="alternate"` phức tạp
4. **Social sharing** — link chia sẻ hoạt động trên mọi thiết bị

## Viewport Meta Tag

### Cấu hình chuẩn

```html
<head>
  <!-- BẮT BUỘC: Viewport meta tag cho mobile -->
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- KHÔNG NÊN: Chặn zoom (ảnh hưởng accessibility) -->
  <!-- <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" /> -->
</head>
```

### Giải thích từng thuộc tính

| Thuộc tính | Giá trị | Ý nghĩa |
|------------|---------|---------|
| `width` | `device-width` | Chiều rộng bằng chiều rộng thiết bị |
| `initial-scale` | `1` | Zoom mặc định 100% |
| `maximum-scale` | `1` (TRÁNH) | Chặn zoom — vi phạm WCAG accessibility |
| `user-scalable` | `no` (TRÁNH) | Không cho phép zoom — vi phạm accessibility |

**Lưu ý**: Chặn zoom (`maximum-scale=1` hoặc `user-scalable=no`) vi phạm WCAG 2.1 Success Criterion 1.4.4 — Google có thể đánh giá accessibility kém.

## Responsive Design cho SEO

### Mobile-First CSS

```css
/* ĐÚNG: Mobile-first — style mặc định cho mobile */
.container {
  width: 100%;
  padding: 1rem;
}

.article-grid {
  display: grid;
  grid-template-columns: 1fr; /* Mobile: 1 cột */
  gap: 1rem;
}

.sidebar {
  display: none; /* Ẩn sidebar trên mobile */
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    max-width: 720px;
    margin: 0 auto;
  }

  .article-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 cột */
  }

  .sidebar {
    display: block;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }

  .article-grid {
    grid-template-columns: repeat(3, 1fr); /* 3 cột */
  }
}

/* Large desktop */
@media (min-width: 1280px) {
  .container {
    max-width: 1200px;
  }
}
```

```css
/* SAI: Desktop-first — phải override liên tục cho mobile */
.container {
  width: 1200px; /* Desktop default */
}

@media (max-width: 1024px) {
  .container {
    width: 960px; /* Tablet: override */
  }
}

@media (max-width: 768px) {
  .container {
    width: 100%; /* Mobile: override lại */
  }
}
```

### Responsive Images

```html
<!-- Responsive image với srcset và sizes -->
<img
  src="/images/hero-800.jpg"
  srcset="
    /images/hero-400.jpg 400w,
    /images/hero-800.jpg 800w,
    /images/hero-1200.jpg 1200w,
    /images/hero-1600.jpg 1600w
  "
  sizes="
    (max-width: 600px) 100vw,
    (max-width: 1024px) 80vw,
    60vw
  "
  alt="Hero banner cho trang chủ"
  width="1600"
  height="900"
  loading="lazy"
/>

<!-- Art direction: ảnh khác nhau cho mobile và desktop -->
<picture>
  <!-- Mobile: ảnh crop vuông, tập trung vào chủ thể -->
  <source
    media="(max-width: 600px)"
    srcset="/images/product-mobile.webp"
    type="image/webp"
  />
  <!-- Desktop: ảnh landscape đầy đủ -->
  <source
    media="(min-width: 601px)"
    srcset="/images/product-desktop.webp"
    type="image/webp"
  />
  <img
    src="/images/product-desktop.jpg"
    alt="Sản phẩm XYZ"
    width="1200"
    height="600"
  />
</picture>
```

## Touch-Friendly Design

### Kích thước và khoảng cách

Google khuyến nghị các target có thể tap được phải có kích thước tối thiểu **48x48 CSS pixels**, với khoảng cách tối thiểu **8px** giữa các target.

```css
/* Button phải đủ lớn để tap chính xác */
.btn {
  min-height: 48px;
  min-width: 48px;
  padding: 12px 24px;
  font-size: 16px; /* Tránh browser auto-zoom trên iOS */
  touch-action: manipulation; /* Bỏ 300ms delay */
}

/* Link trong navigation */
.nav-link {
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  padding: 8px 16px;
}

/* Input fields */
.form-input {
  min-height: 48px;
  padding: 12px 16px;
  font-size: 16px; /* iOS auto-zoom nếu font-size < 16px */
  border-radius: 8px;
}

/* Khoảng cách giữa các interactive elements */
.action-buttons {
  display: flex;
  gap: 12px; /* Ít nhất 8px giữa các nút */
}
```

### Font-size tối thiểu

```css
/* SAI: Text quá nhỏ trên mobile */
.body-text {
  font-size: 12px; /* Khó đọc trên mobile */
}

/* ĐÚNG: Base font-size 16px trên mobile */
html {
  font-size: 16px; /* 1rem = 16px */
}

body {
  font-size: 1rem;
  line-height: 1.6; /* Khoảng cách dòng thoáng */
}

.small-text {
  font-size: 0.875rem; /* 14px — nhỏ nhất nên dùng */
}

h1 {
  font-size: 1.75rem; /* Mobile */
}

@media (min-width: 768px) {
  h1 {
    font-size: 2.5rem; /* Desktop */
  }
}
```

### Tránh hover-only interactions

```css
/* SAI: Dropdown chỉ hoạt động khi hover (không có trên mobile) */
.dropdown-menu {
  display: none;
}
.dropdown:hover .dropdown-menu {
  display: block;
}

/* ĐÚNG: Kết hợp hover (desktop) và focus/click (mobile) */
.dropdown-menu {
  display: none;
}

/* Desktop: hover hoạt động */
@media (hover: hover) {
  .dropdown:hover .dropdown-menu {
    display: block;
  }
}

/* Mobile: dùng checkbox hack hoặc JS toggle */
.dropdown-toggle:focus + .dropdown-menu,
.dropdown-menu:focus-within {
  display: block;
}
```

## AMP — Còn phù hợp không?

### AMP là gì?

AMP (Accelerated Mobile Pages) là framework của Google để tạo trang mobile tải cực nhanh, bằng cách giới hạn HTML/CSS/JS được phép dùng.

### AMP năm 2024-2025: Đánh giá thực tế

| Tiêu chí | Đánh giá |
|----------|----------|
| Bắt buộc cho Top Stories? | **Không** — từ 2021, Google bỏ yêu cầu AMP cho Top Stories |
| Có lợi thế ranking? | **Không** — không có ranking boost riêng cho AMP |
| Tốc độ có nhanh hơn? | **Có thể** — nhưng trang non-AMP tối ưu tốt cũng nhanh tương đương |
| Có nên dùng cho dự án mới? | **Không khuyến nghị** — tập trung vào Core Web Vitals thay vì AMP |
| Ai vẫn nên dùng? | Publisher lớn đã có AMP infra, nếu convert sang non-AMP tốn kém |

**Khuyến nghị cho developer**: Thay vì đầu tư vào AMP, hãy tập trung tối ưu Core Web Vitals cho trang thường. Đạt LCP dưới 2.5s, INP dưới 200ms, CLS dưới 0.1 là đủ.

## Mobile Usability Testing

### Google Search Console Mobile Usability

Truy cập: Google Search Console -> Experience -> Mobile Usability

Các lỗi phổ biến:
- **Text too small to read** — font-size dưới 12px
- **Clickable elements too close together** — tap target dưới 48px hoặc quá gần nhau
- **Content wider than screen** — có element vượt viewport (thường do fixed width)
- **Viewport not set** — thiếu meta viewport tag

### Kiểm tra với Chrome DevTools

```bash
# Lighthouse CLI cho mobile audit
npx lighthouse https://example.com \
  --emulated-form-factor=mobile \
  --throttling.cpuSlowdownMultiplier=4 \
  --output=html \
  --output-path=./lighthouse-mobile.html
```

### Mobile-Friendly Test API

```javascript
// Dùng Google Mobile-Friendly Test API
async function checkMobileFriendly(url) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const endpoint = 'https://searchconsole.googleapis.com/v1/urlTestingTools/mobileFriendlyTest:run';

  const response = await fetch(endpoint + '?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: url,
      requestScreenshot: true,
    }),
  });

  const result = await response.json();

  console.log('Mobile Friendly:', result.mobileFriendliness);
  // "MOBILE_FRIENDLY" hoặc "NOT_MOBILE_FRIENDLY"

  if (result.mobileFriendlyIssues) {
    result.mobileFriendlyIssues.forEach((issue) => {
      console.log('Issue:', issue.rule);
    });
  }
}
```

## Structured Data cho Mobile

```html
<head>
  <!-- Breadcrumb structured data — hiện đẹp trên mobile SERP -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Trang chủ",
        "item": "https://example.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://example.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Mobile SEO Guide"
      }
    ]
  }
  </script>

  <!-- FAQ structured data — chiếm nhiều diện tích trên mobile SERP -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Mobile-first indexing là gì?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Google dùng phiên bản mobile của website để crawl và xếp hạng, thay vì phiên bản desktop."
        }
      }
    ]
  }
  </script>
</head>
```

## Checklist Mobile SEO

| Mục | Kiểm tra |
|-----|----------|
| Viewport | Meta viewport tag có `width=device-width, initial-scale=1` |
| Font size | Base font tối thiểu 16px, không text nào dưới 12px |
| Tap targets | Tất cả nút/link tối thiểu 48x48px, khoảng cách tối thiểu 8px |
| Nội dung | Mobile có đầy đủ nội dung như desktop (mobile-first indexing) |
| Images | Responsive (srcset/sizes), format hiện đại (WebP/AVIF) |
| Form | Input có type phù hợp (`tel`, `email`, `number`) cho bàn phím mobile |
| Popup | Không có interstitial che toàn bộ nội dung khi mới vào |
| Horizontal scroll | Không có scroll ngang trên mobile |
| Speed | LCP dưới 2.5s trên 4G throttled |
| Zoom | Không chặn user zoom (accessibility) |

## Lỗi thường gặp

1. **Ẩn nội dung trên mobile bằng `display: none`** — Google vẫn dùng mobile version để index, nội dung ẩn sẽ bị coi là ít quan trọng hơn và có thể không được index
2. **Chặn zoom bằng `maximum-scale=1`** — Vi phạm accessibility, Google có thể đánh giá tiêu cực
3. **Font-size dưới 16px cho input trên iOS** — Safari auto-zoom vào input khi font nhỏ hơn 16px, gây CLS
4. **Popup/interstitial che nội dung** — Google phạt trang có intrusive interstitial trên mobile từ 2017
5. **Dùng separate mobile URL (m.example.com)** — Phức tạp hóa maintenance, dễ quên sync nội dung, backlink bị phân tán
6. **Desktop-first CSS** — Viết CSS cho desktop trước rồi override bằng `max-width` media queries, code thừa và khó maintain
7. **Không test trên thiết bị thật** — Chrome DevTools emulation không chính xác 100%, đặc biệt về touch events và performance

## Câu hỏi phỏng vấn

### Câu 1: Mobile-First Indexing là gì? Developer cần làm gì để đảm bảo website tương thích?

**Trả lời:**
Mobile-First Indexing nghĩa là Google dùng phiên bản mobile của website để crawl, index và xếp hạng. Developer cần: (1) Dùng responsive design để mobile và desktop dùng cùng URL và HTML; (2) Đảm bảo mobile version có đầy đủ nội dung, structured data, meta tags như desktop; (3) Không ẩn nội dung quan trọng trên mobile bằng CSS; (4) Đảm bảo hình ảnh trên mobile có alt text đầy đủ; (5) Kiểm tra robots.txt không chặn mobile crawler.

### Câu 2: So sánh Responsive Design, Adaptive Design, và Separate URLs. Google khuyên dùng phương pháp nào?

**Trả lời:**
Responsive Design: cùng URL, cùng HTML, dùng CSS media queries để thay đổi layout. Adaptive (Dynamic Serving): cùng URL, server trả HTML khác nhau dựa trên User-Agent. Separate URLs: mobile dùng m.example.com, desktop dùng example.com. Google khuyến nghị Responsive Design vì: (1) một URL duy nhất, không bị duplicate content; (2) Googlebot crawl dễ hơn; (3) backlink tập trung vào 1 URL; (4) chia sẻ trên social media đơn giản hơn.

### Câu 3: Tại sao font-size dưới 16px gây vấn đề trên iOS Safari?

**Trả lời:**
iOS Safari tự động zoom vào `<input>` khi `font-size` dưới 16px để giúp người dùng đọc dễ hơn. Hành vi zoom này gây CLS (layout shift) và trải nghiệm kém vì sau khi nhập xong, user phải zoom out thủ công. Giải pháp: đặt `font-size: 16px` (hoặc `1rem` với base 16px) cho tất cả input, textarea, select trên mobile.

### Câu 4: Tại sao không nên chặn user zoom trên mobile?

**Trả lời:**
Chặn zoom (bằng `maximum-scale=1` hoặc `user-scalable=no`) vi phạm WCAG 2.1 Success Criterion 1.4.4 (Resize Text). Người dùng khiếm thị hoặc có vấn đề về thị lực cần zoom để đọc nội dung. Google Search Console sẽ báo lỗi accessibility, và Google có thể đánh giá tiêu cực trong page experience signals. Thay vì chặn zoom, hãy thiết kế responsive đúng cách để nội dung hiển thị tốt ở mọi zoom level.

### Câu 5: AMP còn cần thiết cho SEO năm 2025 không?

**Trả lời:**
Không bắt buộc. Từ 2021, Google bỏ yêu cầu AMP để xuất hiện trong Top Stories carousel. AMP không có ranking boost riêng. Với sự ra đời của Core Web Vitals, Google đánh giá tốc độ dựa trên LCP, INP, CLS — bất kể trang dùng AMP hay không. Một trang non-AMP tối ưu tốt có thể nhanh tương đương AMP. AMP chỉ còn phù hợp cho publisher lớn đã đầu tư infrastructure, chưa có lý do convert sang non-AMP. Dự án mới nên tập trung vào Core Web Vitals thay vì AMP.
