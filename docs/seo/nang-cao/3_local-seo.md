---
sidebar_position: 3
title: "3. Local SEO"
---

# Local SEO — Tối ưu SEO cho doanh nghiệp địa phương

## Giới thiệu

Local SEO khác hoàn toàn so với SEO thông thường. Khi ai đó search "quán phở ngon gần đây" hoặc "sửa laptop quận 1", Google không trả về kết quả organic thông thường mà hiển thị **Local Pack** (cụm 3 kết quả Google Maps) phía trên cùng SERP. Nếu doanh nghiệp bạn không xuất hiện trong Local Pack, bạn gần như vô hình với khách hàng local.

Là developer, bạn có thể không trực tiếp quản lý Google Business Profile, nhưng phần technical SEO cho local search — structured data, NAP consistency, embed maps — hoàn toàn nằm trong tay bạn.

---

## 1. Google Business Profile Optimization

### Vai trò của Google Business Profile (GBP)

GBP (trước đây gọi là Google My Business) là yếu tố quan trọng nhất cho Local SEO. Google dùng thông tin từ GBP để hiển thị doanh nghiệp trong:

- **Local Pack** (3 kết quả Maps trên SERP)
- **Google Maps** search results
- **Knowledge Panel** (bảng thông tin bên phải SERP)

### Checklist tối ưu GBP

| Yếu tố | Quan trọng | Chi tiết |
|---|---|---|
| Tên doanh nghiệp | Rất cao | Phải khớp chính xác với tên thật, không nhồi keyword |
| Danh mục chính | Rất cao | Chọn danh mục cụ thể nhất (vd: "Quán phở" thay vì "Nhà hàng") |
| Địa chỉ | Rất cao | Phải nhất quán với website và tất cả listings |
| Số điện thoại | Cao | Dùng số local, nhất quán mọi nơi |
| Giờ mở cửa | Cao | Cập nhật khi có thay đổi, kể cả ngày lễ |
| Mô tả | Trung bình | 750 ký tự, chứa keyword tự nhiên |
| Ảnh | Cao | Cập nhật ảnh thật thường xuyên |
| Google Posts | Trung bình | Đăng cập nhật hàng tuần |
| Q&A | Trung bình | Trả lời câu hỏi nhanh chóng |

### Lưu ý cho developer

Khi xây dựng website cho doanh nghiệp local, đảm bảo:

```html
<!-- Footer: NAP info matching GBP exactly -->
<footer>
  <div itemscope itemtype="https://schema.org/LocalBusiness">
    <span itemprop="name">Phở Hà Nội - Chi nhánh Quận 1</span>
    <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
      <span itemprop="streetAddress">123 Nguyễn Huệ</span>,
      <span itemprop="addressLocality">Quận 1</span>,
      <span itemprop="addressRegion">TP. Hồ Chí Minh</span>
    </div>
    <span itemprop="telephone">028-1234-5678</span>
  </div>
</footer>
```

---

## 2. Local Schema Markup (JSON-LD)

### LocalBusiness schema cơ bản

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Phở Hà Nội - Chi nhánh Quận 1",
  "image": "https://example.com/images/pho-hanoi-storefront.jpg",
  "url": "https://example.com",
  "telephone": "+84-28-1234-5678",
  "email": "info@phohanoi.vn",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Nguyễn Huệ",
    "addressLocality": "Quận 1",
    "addressRegion": "TP. Hồ Chí Minh",
    "postalCode": "700000",
    "addressCountry": "VN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 10.7731,
    "longitude": 106.7030
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "06:00",
      "closes": "22:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday", "Sunday"],
      "opens": "07:00",
      "closes": "23:00"
    }
  ],
  "sameAs": [
    "https://www.facebook.com/phohanoi",
    "https://www.instagram.com/phohanoi"
  ]
}
</script>
```

### Restaurant schema (mở rộng LocalBusiness)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Phở Hà Nội - Chi nhánh Quận 1",
  "image": "https://example.com/images/pho-hanoi.jpg",
  "servesCuisine": "Vietnamese",
  "menu": "https://example.com/thuc-don",
  "acceptsReservations": "True",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Nguyễn Huệ",
    "addressLocality": "Quận 1",
    "addressRegion": "TP. Hồ Chí Minh",
    "postalCode": "700000",
    "addressCountry": "VN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 10.7731,
    "longitude": 106.7030
  },
  "telephone": "+84-28-1234-5678",
  "priceRange": "50.000đ - 150.000đ",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "06:00",
      "closes": "22:00"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "256"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "author": {
        "@type": "Person",
        "name": "Trần Văn B"
      },
      "datePublished": "2024-10-20",
      "reviewBody": "Phở ngon, nước dùng đậm đà, phục vụ nhanh."
    }
  ]
}
</script>
```

### Schema cho dịch vụ sửa chữa

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Sửa Laptop 24h - Quận 3",
  "image": "https://sualaptop24h.vn/images/store.jpg",
  "url": "https://sualaptop24h.vn",
  "telephone": "+84-28-9876-5432",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "456 Võ Văn Tần",
    "addressLocality": "Quận 3",
    "addressRegion": "TP. Hồ Chí Minh",
    "postalCode": "700000",
    "addressCountry": "VN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 10.7768,
    "longitude": 106.6891
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Dịch vụ sửa chữa laptop",
    "itemListElement": [
      {
        "@type": "OfferCatalog",
        "name": "Thay màn hình laptop",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Thay màn hình MacBook Pro"
            }
          }
        ]
      },
      {
        "@type": "OfferCatalog",
        "name": "Sửa mainboard",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Sửa mainboard laptop Dell"
            }
          }
        ]
      }
    ]
  },
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": 10.7768,
      "longitude": 106.6891
    },
    "geoRadius": "15000"
  }
}
</script>
```

---

## 3. NAP Consistency (Name, Address, Phone)

### Tại sao NAP quan trọng?

Google cross-reference thông tin NAP từ nhiều nguồn để xác minh doanh nghiệp. Nếu tên, địa chỉ, hoặc SĐT không nhất quán, Google mất niềm tin vào doanh nghiệp và giảm ranking.

### Ví dụ NAP không nhất quán (SAI)

| Nguồn | Tên | Địa chỉ | SĐT |
|---|---|---|---|
| Website | Phở Hà Nội | 123 Nguyễn Huệ, Q.1, HCM | 028-1234-5678 |
| Google Business | Phở Hà Nội Q1 | 123 Nguyễn Huệ, Quận 1 | 0281234567 |
| Facebook | Pho Ha Noi | 123 Nguyen Hue, District 1 | +84 28 1234 5678 |
| Yellow Pages | PHỞ HÀ NỘI | 123 Nguyễn Huệ, P. Bến Nghé, Q1, TP.HCM | 028.1234.5678 |

### NAP nhất quán (ĐÚNG)

```
Tên chính xác:    Phở Hà Nội - Chi nhánh Quận 1
Địa chỉ:         123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
Số điện thoại:    028-1234-5678
```

Dùng **chính xác** format này ở mọi nơi: website, GBP, social media, directories.

### Script kiểm tra NAP consistency

```javascript
// scripts/check-nap.js
const cheerio = require('cheerio');

const CANONICAL_NAP = {
  name: 'Phở Hà Nội - Chi nhánh Quận 1',
  address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  phone: '028-1234-5678',
};

async function checkNAPOnPage(url) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const issues = [];

  // Kiểm tra trong Schema.org JSON-LD
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const schema = JSON.parse($(el).html());
      if (schema.name && schema.name !== CANONICAL_NAP.name) {
        issues.push({
          type: 'name_mismatch',
          found: schema.name,
          expected: CANONICAL_NAP.name,
          source: 'JSON-LD',
        });
      }
      if (schema.telephone && schema.telephone.replace(/\D/g, '') !== CANONICAL_NAP.phone.replace(/\D/g, '')) {
        issues.push({
          type: 'phone_mismatch',
          found: schema.telephone,
          expected: CANONICAL_NAP.phone,
          source: 'JSON-LD',
        });
      }
    } catch (e) {
      // Ignore parse errors
    }
  });

  // Kiểm tra trong footer text
  const footerText = $('footer').text();
  if (!footerText.includes(CANONICAL_NAP.phone.replace(/-/g, ''))) {
    issues.push({
      type: 'phone_missing_footer',
      expected: CANONICAL_NAP.phone,
      source: 'footer',
    });
  }

  return issues;
}

async function main() {
  const pages = [
    'https://example.com',
    'https://example.com/lien-he',
    'https://example.com/gioi-thieu',
  ];

  for (const url of pages) {
    const issues = await checkNAPOnPage(url);
    if (issues.length > 0) {
      console.log(`\nIssues found on ${url}:`);
      console.table(issues);
    } else {
      console.log(`${url}: NAP consistent`);
    }
  }
}

main();
```

---

## 4. Google Maps Embed và SEO

### Embed cơ bản

```html
<!-- Google Maps Embed API (miễn phí cho embed đơn giản) -->
<iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.123456789!2d106.703!3d10.7731!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzIzLjIiTiAxMDbCsDQyJzEwLjgiRQ!5e0!3m2!1svi!2svn!4v1234567890"
  width="600"
  height="450"
  style="border:0;"
  allowfullscreen=""
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
  title="Vị trí Phở Hà Nội - 123 Nguyễn Huệ, Quận 1">
</iframe>
```

### Lazy-load Maps cho performance

```javascript
// components/LazyMap.jsx
import { useState, useRef, useEffect } from 'react';

function LazyMap({ embedUrl, title }) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ minHeight: '450px' }}>
      {isVisible ? (
        <iframe
          src={embedUrl}
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title={title}
        />
      ) : (
        <div
          style={{
            height: '450px',
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Đang tải bản đồ...
        </div>
      )}
    </div>
  );
}

export default LazyMap;
```

### SEO tips cho Maps embed

- Luôn thêm `title` attribute cho `<iframe>` (accessibility + SEO)
- Dùng `loading="lazy"` để không ảnh hưởng LCP
- Đặt map ở trang Liên hệ / Về chúng tôi, không phải homepage
- Kết hợp map embed với structured data `GeoCoordinates`

---

## 5. Local Keyword Targeting

### Cấu trúc local keywords

```
[Dịch vụ/Sản phẩm] + [Địa điểm]

Ví dụ:
- "sửa laptop quận 1"
- "quán phở ngon quận 3"
- "dịch vụ kế toán TP HCM"
- "thợ sửa điện nước Hà Nội"
```

### Tạo landing pages cho từng khu vực

```javascript
// Cấu trúc URL cho location pages
const locationPages = [
  { slug: 'sua-laptop-quan-1', district: 'Quận 1', city: 'TP. Hồ Chí Minh' },
  { slug: 'sua-laptop-quan-3', district: 'Quận 3', city: 'TP. Hồ Chí Minh' },
  { slug: 'sua-laptop-quan-7', district: 'Quận 7', city: 'TP. Hồ Chí Minh' },
  { slug: 'sua-laptop-thu-duc', district: 'Thủ Đức', city: 'TP. Hồ Chí Minh' },
];

// pages/dich-vu/[slug].js
export async function getStaticPaths() {
  return {
    paths: locationPages.map((loc) => ({
      params: { slug: loc.slug },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const location = locationPages.find((loc) => loc.slug === params.slug);

  return {
    props: {
      location,
      // Nội dung unique cho mỗi location, KHÔNG copy paste
      testimonials: await getTestimonialsByDistrict(location.district),
      nearbyLandmarks: await getNearbyLandmarks(location.district),
    },
  };
}
```

### Lưu ý quan trọng: Tránh doorway pages

Google phạt nặng doorway pages — hàng chục trang location gần giống nhau, chỉ thay tên quận. Mỗi location page phải có **unique content thật sự**: reviews riêng, staff riêng, hình ảnh riêng, dịch vụ đặc thù cho khu vực đó.

---

## 6. Reviews và Reputation Management

### Tại sao reviews quan trọng cho Local SEO

Google xác nhận rằng reviews là yếu tố ranking trong Local Pack. Cụ thể:

| Yếu tố review | Ảnh hưởng |
|---|---|
| Số lượng reviews | Nhiều hơn = ranking cao hơn |
| Rating trung bình | 4.0+ để cạnh tranh |
| Tần suất nhận review | Reviews gần đây quan trọng hơn |
| Response rate | Trả lời reviews tăng trust |
| Keywords trong reviews | Google phân tích nội dung review |

### Hiển thị reviews trên website với Schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Phở Hà Nội - Chi nhánh Quận 1",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Nguyễn Huệ",
    "addressLocality": "Quận 1",
    "addressRegion": "TP. Hồ Chí Minh",
    "addressCountry": "VN"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "256"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Nguyễn Minh"
      },
      "datePublished": "2024-11-01",
      "reviewBody": "Phở rất ngon, nước dùng đậm đà. Phục vụ nhanh, sạch sẽ.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Lê Thanh"
      },
      "datePublished": "2024-10-28",
      "reviewBody": "Vị phở truyền thống Hà Nội đúng chuẩn. Giá hơi cao nhưng xứng đáng.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "4",
        "bestRating": "5"
      }
    }
  ]
}
</script>
```

### Component hiển thị reviews

```tsx
// components/ReviewSection.tsx
interface Review {
  author: string;
  rating: number;
  date: string;
  body: string;
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="review-card">
      <div className="review-header">
        <span className="review-author">{review.author}</span>
        <span className="review-rating">
          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
        </span>
      </div>
      <time className="review-date" dateTime={review.date}>
        {new Date(review.date).toLocaleDateString('vi-VN')}
      </time>
      <p className="review-body">{review.body}</p>
    </div>
  );
}

export function ReviewSection({ reviews }: { reviews: Review[] }) {
  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <section>
      <h2>Đánh giá từ khách hàng</h2>
      <div className="aggregate-rating">
        <span className="big-rating">{avgRating.toFixed(1)}</span>
        <span className="review-count">({reviews.length} đánh giá)</span>
      </div>
      <div className="reviews-list">
        {reviews.map((review, index) => (
          <ReviewCard key={index} review={review} />
        ))}
      </div>
    </section>
  );
}
```

---

## 7. Lỗi thường gặp

### Lỗi 1: NAP không nhất quán

Tên, địa chỉ, SĐT khác nhau giữa website, GBP, Facebook, và các directory. Google không biết đâu là thông tin chính xác nên giảm trust.

**Fix**: Audit tất cả listings, chuẩn hóa NAP về một format duy nhất.

### Lỗi 2: Thiếu LocalBusiness schema

Không có structured data khiến Google phải "đoán" thông tin doanh nghiệp. Thêm JSON-LD LocalBusiness schema là cách dễ nhất để cung cấp thông tin chính xác.

### Lỗi 3: Doorway pages cho nhiều locations

Tạo 50 trang location chỉ thay tên quận, nội dung copy paste. Google coi đây là spam. Mỗi trang phải có unique value thật sự.

### Lỗi 4: Không trả lời Google Reviews

Ignore reviews (cả positive và negative) là tín hiệu xấu. Google khuyến khích doanh nghiệp respond reviews, và response rate ảnh hưởng đến Local Pack ranking.

### Lỗi 5: Embed Google Maps làm chậm trang

Iframe Google Maps block render. Luôn dùng `loading="lazy"` và cân nhắc lazy-load bằng Intersection Observer để không ảnh hưởng Core Web Vitals.

---

## Câu hỏi phỏng vấn

### Câu 1: NAP consistency là gì và tại sao quan trọng cho Local SEO?

**Trả lời**: NAP là Name, Address, Phone — ba thông tin cốt lõi của doanh nghiệp. Google cross-reference NAP từ nhiều nguồn (website, GBP, directories, social media) để xác minh doanh nghiệp. Nếu NAP không nhất quán (ví dụ website ghi "Q.1" nhưng GBP ghi "Quận 1"), Google mất confidence vào accuracy của listing và giảm ranking trong Local Pack. Phải chuẩn hóa NAP về một format duy nhất trên tất cả platforms.

### Câu 2: Local Pack ranking factors khác gì so với organic ranking?

**Trả lời**: Local Pack dựa vào 3 yếu tố chính: (1) **Relevance** — doanh nghiệp có liên quan đến search query không, (2) **Distance** — doanh nghiệp gần user bao nhiêu, (3) **Prominence** — doanh nghiệp nổi tiếng ra sao (reviews, citations, backlinks). Organic ranking chủ yếu dựa vào content quality, backlinks, technical SEO. Local Pack thiên về GBP optimization, reviews, và NAP consistency hơn là on-page content.

### Câu 3: Làm sao phân biệt doorway pages và legitimate location pages?

**Trả lời**: Doorway pages là nhiều trang gần giống nhau, chỉ thay tên location, không có unique value. Legitimate location pages có nội dung thật sự khác nhau: reviews riêng cho location đó, hình ảnh thật của cửa hàng, staff list, dịch vụ đặc thù cho khu vực, địa chỉ và giờ mở cửa riêng. Rule of thumb: nếu bạn xóa tên location khỏi 2 trang mà nội dung giống nhau, đó là doorway pages.

### Câu 4: Schema.org type nào phù hợp cho từng loại doanh nghiệp local?

**Trả lời**: Schema.org có nhiều subtypes của `LocalBusiness`: `Restaurant` cho nhà hàng, `Dentist` cho phòng nha, `AutoRepair` cho gara, `LegalService` cho luật sư, `RealEstateAgent` cho bất động sản. Nên dùng type cụ thể nhất có thể thay vì `LocalBusiness` chung. Ví dụ quán phở dùng `Restaurant` với `servesCuisine: "Vietnamese"`, tiệm cắt tóc dùng `HairSalon`. Type cụ thể giúp Google hiểu rõ hơn và hiển thị rich results phù hợp.

### Câu 5: Embedded Google Maps ảnh hưởng thế nào đến SEO và performance?

**Trả lời**: Google Maps embed bản thân không tạo ranking signal trực tiếp, nhưng giúp user experience (dễ tìm đường) và gián tiếp hỗ trợ local signals. Tuy nhiên, iframe Maps nặng khoảng 800KB-1MB, ảnh hưởng xấu đến Core Web Vitals (LCP, FCP). Giải pháp: dùng `loading="lazy"`, hoặc tốt hơn là lazy-load bằng Intersection Observer — chỉ load map khi user scroll đến section đó. Đặt map ở trang Contact/About thay vì homepage.
