---
sidebar_position: 1
title: "1. International SEO"
---

# International SEO — Tối ưu SEO cho website đa ngôn ngữ

## Giới thiệu

Bạn có một sản phẩm tốt, website chạy mượt, SEO trong nước đã ổn — giờ muốn mở rộng ra thị trường quốc tế. Vấn đề là Google không tự biết trang nào dành cho user Việt Nam, trang nào cho user Nhật Bản. Nếu không cấu hình đúng, Google có thể index nhầm phiên bản ngôn ngữ, gây ra duplicate content, hoặc hiển thị trang tiếng Anh cho user đang search bằng tiếng Việt.

International SEO giải quyết đúng bài toán này: giúp search engine hiểu **ai nên thấy trang nào**, ở **ngôn ngữ nào**, và tại **khu vực địa lý nào**.

---

## 1. Kiến trúc URL cho website đa ngôn ngữ

Có 3 cách phổ biến để tổ chức URL đa ngôn ngữ, mỗi cách có trade-off riêng:

### So sánh 3 phương pháp

| Phương pháp | Ví dụ | Ưu điểm | Nhược điểm |
|---|---|---|---|
| **Subdirectory** | `example.com/vi/` | Dễ setup, dùng chung domain authority | Không target geo cụ thể |
| **Subdomain** | `vi.example.com` | Tách riêng hosting, dễ quản lý | Domain authority bị phân tán |
| **ccTLD** | `example.vn` | Signal geo mạnh nhất | Tốn chi phí, xây authority từ đầu |

### Khuyến nghị cho developer

Trong phần lớn trường hợp, **subdirectory** là lựa chọn tốt nhất:

```
https://example.com/          → Tiếng Anh (mặc định)
https://example.com/vi/       → Tiếng Việt
https://example.com/ja/       → Tiếng Nhật
https://example.com/ko/       → Tiếng Hàn
```

Lý do:
- Tất cả backlink đổ về cùng domain → domain authority tập trung
- Chỉ cần 1 hosting, 1 SSL cert, 1 codebase
- Các framework hiện đại (Next.js, Nuxt) hỗ trợ sẵn pattern này

Chỉ nên dùng **ccTLD** khi bạn có đội ngũ marketing riêng cho từng quốc gia và ngân sách để xây dựng authority cho mỗi domain.

---

## 2. Hreflang — Cách Google hiểu ngôn ngữ của trang

### Hreflang là gì?

`hreflang` là attribute cho Google biết: "Trang này có phiên bản ở ngôn ngữ/khu vực khác". Google dùng thông tin này để hiển thị đúng phiên bản cho đúng user.

### Cách 1: HTML `<link>` tag trong `<head>`

```html
<head>
  <!-- Trang hiện tại là tiếng Việt -->
  <link rel="alternate" hreflang="vi" href="https://example.com/vi/san-pham" />

  <!-- Phiên bản tiếng Anh -->
  <link rel="alternate" hreflang="en" href="https://example.com/san-pham" />

  <!-- Phiên bản tiếng Nhật -->
  <link rel="alternate" hreflang="ja" href="https://example.com/ja/san-pham" />

  <!-- Phiên bản mặc định (fallback) -->
  <link rel="alternate" hreflang="x-default" href="https://example.com/san-pham" />
</head>
```

### Cách 2: HTTP Header (cho PDF, file không phải HTML)

```bash
# Response header cho file PDF
Link: <https://example.com/vi/catalog.pdf>; rel="alternate"; hreflang="vi",
      <https://example.com/en/catalog.pdf>; rel="alternate"; hreflang="en",
      <https://example.com/catalog.pdf>; rel="alternate"; hreflang="x-default"
```

### Cách 3: Trong XML Sitemap (khuyến nghị cho site lớn)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <url>
    <loc>https://example.com/san-pham</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://example.com/san-pham" />
    <xhtml:link rel="alternate" hreflang="vi" href="https://example.com/vi/san-pham" />
    <xhtml:link rel="alternate" hreflang="ja" href="https://example.com/ja/san-pham" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/san-pham" />
  </url>

  <url>
    <loc>https://example.com/vi/san-pham</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://example.com/san-pham" />
    <xhtml:link rel="alternate" hreflang="vi" href="https://example.com/vi/san-pham" />
    <xhtml:link rel="alternate" hreflang="ja" href="https://example.com/ja/san-pham" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/san-pham" />
  </url>

</urlset>
```

### Quy tắc hreflang quan trọng

| Quy tắc | Giải thích |
|---|---|
| Phải có return link | Nếu trang A trỏ đến B, thì B cũng phải trỏ lại A |
| Phải self-reference | Mỗi trang phải có hreflang trỏ đến chính nó |
| `x-default` bắt buộc | Dành cho user không khớp bất kỳ ngôn ngữ nào |
| Dùng ISO 639-1 | `vi`, `en`, `ja` — không dùng `vie`, `eng` |
| Region optional | `en-US`, `en-GB` — khi cần phân biệt vùng |

---

## 3. Content Localization vs Translation

### Translation (dịch thuật) chưa đủ

Dịch 1:1 từ tiếng Anh sang tiếng Việt thường tạo ra nội dung không tự nhiên. Localization đi xa hơn:

| Yếu tố | Translation | Localization |
|---|---|---|
| Ngôn ngữ | Dịch từ sang từ | Viết lại cho tự nhiên |
| Keyword | Dùng keyword dịch | Research keyword local |
| Hình ảnh | Giữ nguyên | Thay bằng ảnh phù hợp văn hóa |
| Tiền tệ | Giữ USD | Đổi sang VND |
| Ngày tháng | MM/DD/YYYY | DD/MM/YYYY |
| Ví dụ | Ví dụ US-centric | Ví dụ local |

### Ví dụ thực tế

```javascript
// config/locales.js
const localeConfig = {
  vi: {
    currency: 'VND',
    dateFormat: 'DD/MM/YYYY',
    // Keyword research riêng cho thị trường VN
    keywords: {
      'web hosting': 'thuê hosting',
      'domain name': 'tên miền',
      'SSL certificate': 'chứng chỉ SSL',
    },
    // Meta description viết riêng, không dịch
    metaDescriptions: {
      home: 'Dịch vụ hosting tốc độ cao tại Việt Nam. Uptime 99.9%, hỗ trợ 24/7.',
    },
  },
  en: {
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    keywords: {
      'web hosting': 'web hosting',
      'domain name': 'domain name',
      'SSL certificate': 'SSL certificate',
    },
    metaDescriptions: {
      home: 'High-speed web hosting. 99.9% uptime, 24/7 support.',
    },
  },
};

module.exports = localeConfig;
```

---

## 4. Geo-targeting trong Google Search Console

### Khi nào cần Geo-targeting?

- Khi bạn dùng **gTLD** (`.com`, `.net`, `.org`) và muốn target quốc gia cụ thể
- **ccTLD** (`.vn`, `.jp`) tự động được Google hiểu là target quốc gia đó
- Subdirectory và subdomain cần cấu hình thủ công

### Các bước thiết lập

1. Vào Google Search Console
2. Chọn property (subdirectory hoặc subdomain)
3. Vào **Settings** > **International Targeting**
4. Chọn quốc gia target

### Lưu ý quan trọng

Google đã **deprecated** tính năng International Targeting trong GSC cho nhiều property. Thay vào đó, hãy dựa vào:

- Hreflang tags (chính xác hơn)
- Server location (nếu dùng CDN thì không quan trọng)
- Content language signals (ngôn ngữ thực tế của nội dung)

---

## 5. Next.js i18n Routing cho SEO

Next.js có built-in i18n routing, rất tiện cho International SEO.

### Cấu hình cơ bản

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'vi', 'ja', 'ko'],
    defaultLocale: 'en',
    // Domain-based routing (optional)
    // domains: [
    //   { domain: 'example.com', defaultLocale: 'en' },
    //   { domain: 'example.vn', defaultLocale: 'vi' },
    // ],
  },
};

module.exports = nextConfig;
```

### Component tạo hreflang tự động

```tsx
// components/HreflangTags.tsx
import Head from 'next/head';
import { useRouter } from 'next/router';

const SITE_URL = 'https://example.com';

export default function HreflangTags() {
  const { locales, asPath, locale: currentLocale } = useRouter();

  return (
    <Head>
      {locales?.map((locale) => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={`${SITE_URL}${locale === 'en' ? '' : `/${locale}`}${asPath}`}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${SITE_URL}${asPath}`}
      />
    </Head>
  );
}
```

### Sitemap đa ngôn ngữ với next-sitemap

```javascript
// next-sitemap.config.js
/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://example.com',
  generateRobotsTxt: true,
  alternateRefs: [
    { href: 'https://example.com', hreflang: 'en' },
    { href: 'https://example.com/vi', hreflang: 'vi' },
    { href: 'https://example.com/ja', hreflang: 'ja' },
  ],
  // Tạo sitemap riêng cho mỗi locale
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: 'daily',
      priority: path === '/' ? 1.0 : 0.7,
      lastmod: new Date().toISOString(),
      alternateRefs: config.alternateRefs ?? [],
    };
  },
};

module.exports = config;
```

### Middleware xử lý redirect theo Accept-Language

```javascript
// middleware.js
import { NextResponse } from 'next/server';

const SUPPORTED_LOCALES = ['en', 'vi', 'ja', 'ko'];
const DEFAULT_LOCALE = 'en';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Bỏ qua static files và API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Kiểm tra xem URL đã có locale chưa
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // Detect locale từ Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') || '';
  const preferredLocale = acceptLanguage
    .split(',')
    .map((lang) => lang.split(';')[0].trim().substring(0, 2))
    .find((lang) => SUPPORTED_LOCALES.includes(lang));

  const locale = preferredLocale || DEFAULT_LOCALE;

  // Redirect nếu không phải default locale
  if (locale !== DEFAULT_LOCALE) {
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}
```

---

## 6. Lỗi thường gặp

### Lỗi 1: Thiếu return link trong hreflang

```html
<!-- SAI: Trang /vi/ trỏ đến /en/ nhưng /en/ không trỏ lại /vi/ -->
<!-- Trên trang /vi/ -->
<link rel="alternate" hreflang="en" href="https://example.com/en/page" />

<!-- Trên trang /en/ — THIẾU link trỏ về /vi/ -->
<!-- Google sẽ bỏ qua hreflang hoàn toàn -->
```

### Lỗi 2: Quên self-referencing hreflang

```html
<!-- SAI: Trang /vi/ không có hreflang trỏ đến chính nó -->
<link rel="alternate" hreflang="en" href="https://example.com/page" />
<!-- Thiếu: hreflang="vi" trỏ đến chính trang hiện tại -->

<!-- ĐÚNG -->
<link rel="alternate" hreflang="vi" href="https://example.com/vi/page" />
<link rel="alternate" hreflang="en" href="https://example.com/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/page" />
```

### Lỗi 3: Dùng auto-translate mà không review

Google Translate tạo ra nội dung chất lượng thấp, có thể bị coi là spam. Luôn review và chỉnh sửa bản dịch tự động trước khi publish.

### Lỗi 4: Canonical tag conflict với hreflang

```html
<!-- SAI: Trang /vi/ có canonical trỏ về /en/ -->
<link rel="canonical" href="https://example.com/en/page" />
<link rel="alternate" hreflang="vi" href="https://example.com/vi/page" />
<!-- Google: "Trang này nói mình là bản copy của /en/, nhưng cũng nói mình là phiên bản vi?" -->

<!-- ĐÚNG: Mỗi phiên bản ngôn ngữ có canonical trỏ đến chính nó -->
<link rel="canonical" href="https://example.com/vi/page" />
<link rel="alternate" hreflang="vi" href="https://example.com/vi/page" />
<link rel="alternate" hreflang="en" href="https://example.com/en/page" />
```

### Lỗi 5: Redirect dựa trên IP mà không cho option chọn

Tự động redirect user dựa trên IP location mà không cho phép chọn ngôn ngữ khác là UX kém. Googlebot crawl từ US, sẽ luôn thấy phiên bản tiếng Anh.

**Giải pháp**: Dùng banner gợi ý thay vì redirect cứng.

---

## 7. Debug hreflang

### Dùng Google Search Console

1. Vào **Search Console** > **International Targeting** > **Language**
2. Kiểm tra tab **hreflang tags** — liệt kê lỗi nếu có
3. Các lỗi phổ biến: missing return tag, unknown language code

### Script kiểm tra hreflang

```javascript
// scripts/check-hreflang.js
const cheerio = require('cheerio');

async function checkHreflang(url) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const hreflangLinks = [];
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    hreflangLinks.push({
      hreflang: $(el).attr('hreflang'),
      href: $(el).attr('href'),
    });
  });

  console.log(`\nHreflang tags found on ${url}:`);
  console.table(hreflangLinks);

  // Kiểm tra self-reference
  const hasSelfRef = hreflangLinks.some((link) => link.href === url);
  if (!hasSelfRef) {
    console.warn(`WARNING: Missing self-referencing hreflang for ${url}`);
  }

  // Kiểm tra x-default
  const hasXDefault = hreflangLinks.some(
    (link) => link.hreflang === 'x-default'
  );
  if (!hasXDefault) {
    console.warn(`WARNING: Missing x-default hreflang`);
  }

  // Kiểm tra return links
  for (const link of hreflangLinks) {
    if (link.href === url) continue;
    try {
      const targetResponse = await fetch(link.href);
      const targetHtml = await targetResponse.text();
      const $target = cheerio.load(targetHtml);

      const hasReturnLink = $target(
        `link[rel="alternate"][hreflang][href="${url}"]`
      ).length > 0;

      if (!hasReturnLink) {
        console.error(
          `ERROR: ${link.href} does not have return hreflang link to ${url}`
        );
      }
    } catch (err) {
      console.error(`ERROR: Cannot fetch ${link.href}: ${err.message}`);
    }
  }
}

// Chạy kiểm tra
checkHreflang('https://example.com/vi/san-pham');
```

---

## Câu hỏi phỏng vấn

### Câu 1: Sự khác biệt giữa subdirectory, subdomain và ccTLD cho International SEO?

**Trả lời**: Subdirectory (`example.com/vi/`) giữ domain authority tập trung, dễ quản lý, phù hợp hầu hết trường hợp. Subdomain (`vi.example.com`) được Google coi là site riêng biệt, domain authority bị phân tán. ccTLD (`example.vn`) cho geo-targeting signal mạnh nhất nhưng phải xây authority từ đầu cho mỗi domain. Khuyến nghị dùng subdirectory trừ khi có lý do business cụ thể để dùng cách khác.

### Câu 2: Nếu hreflang tag trên trang A trỏ đến trang B, nhưng trang B không trỏ lại A thì sao?

**Trả lời**: Google sẽ **bỏ qua** hreflang đó. Hreflang yêu cầu confirmation hai chiều (bidirectional). Nếu thiếu return link, Google coi như hreflang không tồn tại. Ngoài ra, mỗi trang cũng phải có self-referencing hreflang (trỏ đến chính nó).

### Câu 3: `x-default` trong hreflang dùng để làm gì?

**Trả lời**: `x-default` chỉ định phiên bản fallback khi user không khớp bất kỳ ngôn ngữ/region nào trong danh sách hreflang. Thường trỏ đến phiên bản tiếng Anh hoặc trang chọn ngôn ngữ. Đây là best practice bắt buộc để đảm bảo mọi user đều được phục vụ.

### Câu 4: Content localization khác gì translation trong SEO?

**Trả lời**: Translation chỉ dịch từ ngữ, localization đi sâu hơn: research keyword riêng cho thị trường local, điều chỉnh ví dụ cho phù hợp văn hóa, đổi tiền tệ, format ngày tháng, thậm chí thay đổi hình ảnh. Từ góc độ SEO, localization hiệu quả hơn vì target đúng search intent của user local thay vì chỉ dịch keyword.

### Câu 5: Tại sao không nên redirect user dựa trên IP detection cho SEO?

**Trả lời**: Googlebot crawl từ IP ở US, nên nếu redirect dựa trên IP, Google chỉ thấy phiên bản tiếng Anh và không index được các phiên bản ngôn ngữ khác. Ngoài ra, user VPN hoặc expat cũng bị redirect sai. Best practice là dùng banner gợi ý chuyển ngôn ngữ thay vì redirect cứng, kết hợp hreflang để Google tự chọn phiên bản phù hợp.
