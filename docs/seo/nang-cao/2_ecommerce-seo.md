---
sidebar_position: 2
title: "2. E-commerce SEO"
---

# E-commerce SEO — Tối ưu SEO cho website thương mại điện tử

E-commerce SEO xử lý những thách thức riêng của website bán hàng: hàng nghìn trang sản phẩm, faceted navigation sinh ra vô số URL, pagination phức tạp và sản phẩm hết hàng liên tục. Bài này tập trung vào các kỹ thuật developer cần nắm để xây dựng site thương mại điện tử thân thiện với SEO và không lãng phí crawl budget.

:::note[Ghi nhớ nhanh]

- ⭐ **Faceted navigation là kẻ thù của crawl budget** — filter (color/size/brand) tạo hàng triệu URL; `canonical` về category chính, `noindex` filter vô giá trị, chặn params trong `robots.txt`.
- ⭐ **`Product` schema (JSON-LD)** — mang lại rich snippet (giá, `availability`, rating) trên SERP, tăng CTR đáng kể; thêm `AggregateRating` và `BreadcrumbList`.
- **Product hết hàng** — tạm thời giữ trang (200); vĩnh viễn thì `301` sang sản phẩm thay thế hoặc category; `410` khi xóa hẳn; tránh `404` làm mất link equity.
- **URL sản phẩm sạch** — slug chứa keyword, không query param trong canonical; category page rank tốt cho broad keyword.
- **Infinite scroll cần fallback** — Googlebot không scroll; phải có pagination URL-based (`?page=2`) render server-side.

:::

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [1. Product Page SEO Optimization](#1-product-page-seo-optimization)
- [2. Category Page Structure và Faceted Navigation](#2-category-page-structure-và-faceted-navigation)
- [3. Product Schema Markup (JSON-LD)](#3-product-schema-markup-json-ld)
- [4. Pagination và Infinite Scroll SEO](#4-pagination-và-infinite-scroll-seo)
- [5. Xử lý sản phẩm hết hàng](#5-xử-lý-sản-phẩm-hết-hàng)
- [6. Lỗi thường gặp](#6-lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Giới thiệu

E-commerce SEO khác biệt khá nhiều so với blog hay landing page SEO. Bạn phải xử lý hàng nghìn trang sản phẩm, faceted navigation tạo ra hàng triệu URL combination, pagination phức tạp, và sản phẩm hết hàng liên tục. Một lỗi nhỏ trong cấu trúc URL có thể khiến Google crawl budget bị lãng phí, hoặc tệ hơn — duplicate content trên hàng nghìn trang.

Bài này tập trung vào kỹ thuật mà developer cần nắm để xây dựng e-commerce site thân thiện với SEO.

---

## 1. Product Page SEO Optimization

### Cấu trúc URL tối ưu

```
ĐÚNG:
https://shop.com/ao-thun/ao-thun-nam-cotton-trang
https://shop.com/giay-dep/giay-the-thao-nike-air-max

SAI:
https://shop.com/product?id=12345
https://shop.com/p/ao-thun-nam-cotton-trang?color=white&size=L
```

**Nguyên tắc**:
- Slug chứa keyword chính
- Không có query params trong canonical URL
- Hierarchy rõ ràng: category > product

### Meta tags cho Product Page

```html
<head>
  <title>Áo Thun Nam Cotton Trắng - Size S/M/L/XL | ShopABC</title>
  <meta name="description" content="Áo thun nam cotton 100% màu trắng, co giãn 4 chiều. Giá chỉ 199.000đ. Miễn phí đổi trả 30 ngày. Giao hàng toàn quốc." />
  <link rel="canonical" href="https://shop.com/ao-thun/ao-thun-nam-cotton-trang" />

  <!-- Open Graph cho share trên social -->
  <meta property="og:title" content="Áo Thun Nam Cotton Trắng - 199.000đ" />
  <meta property="og:description" content="Cotton 100%, co giãn 4 chiều. Miễn phí đổi trả 30 ngày." />
  <meta property="og:image" content="https://shop.com/images/ao-thun-trang-og.jpg" />
  <meta property="og:type" content="product" />
  <meta property="product:price:amount" content="199000" />
  <meta property="product:price:currency" content="VND" />
</head>
```

### Xử lý product variants (màu sắc, size)

Variants là source phổ biến nhất của duplicate content trong e-commerce:

| Phương pháp | Khi nào dùng | Ví dụ |
|---|---|---|
| Canonical về trang chính | Variants giống nhau về nội dung | Color variants cùng mô tả |
| Trang riêng + unique content | Variants có nội dung khác nhau | Áo thun nam vs áo thun nữ |
| Query params + canonical | Cần track nhưng không index | `?size=L` nhưng canonical về trang gốc |

```html
<!-- Trang variant ?color=red — canonical về trang chính -->
<link rel="canonical" href="https://shop.com/ao-thun/ao-thun-nam-cotton" />
```

---

## 2. Category Page Structure và Faceted Navigation

### Category page là ranking powerhouse

Category pages thường rank tốt hơn product pages cho broad keywords:

```
"áo thun nam"        → Category page rank
"áo thun nam cotton"  → Category page rank
"áo thun nam cotton trắng size L" → Product page rank
```

### Cấu trúc category tối ưu

```html
<!-- Category page: /ao-thun-nam -->
<h1>Áo Thun Nam</h1>

<!-- Unique intro text (không phải boilerplate) -->
<p>Bộ sưu tập áo thun nam mới nhất 2024, chất liệu cotton premium,
   đa dạng từ basic đến streetwear. Cam kết chính hãng, đổi trả 30 ngày.</p>

<!-- Product listing -->
<div class="product-grid">
  <!-- Products with structured data -->
</div>

<!-- SEO content cuối trang -->
<section class="category-seo-content">
  <h2>Hướng dẫn chọn áo thun nam</h2>
  <p>Khi chọn áo thun nam, bạn cần chú ý đến chất liệu...</p>
</section>
```

### Faceted Navigation — Kẻ thù của crawl budget

Faceted navigation (filter theo màu, size, giá, brand) có thể tạo ra hàng triệu URL:

```
/ao-thun?color=red
/ao-thun?color=red&size=L
/ao-thun?color=red&size=L&brand=nike
/ao-thun?color=red&size=L&brand=nike&sort=price
... hàng triệu combinations
```

**Giải pháp**:

```html
<!-- 1. Noindex cho faceted URLs không có search value -->
<meta name="robots" content="noindex, follow" />

<!-- 2. Canonical về category page chính -->
<link rel="canonical" href="https://shop.com/ao-thun-nam" />
```

```
# 3. Trong robots.txt — block crawl params không cần thiết
User-agent: *
Disallow: /*?sort=
Disallow: /*?page=*&sort=
Disallow: /*?color=*&size=*&brand=*
```

**Bảng quyết định faceted navigation**:

| Filter combination | Index? | Canonical | Lý do |
|---|---|---|---|
| `/ao-thun?color=red` | Co | Self | Có search volume |
| `/ao-thun?size=L` | Khong | Category chính | Không ai search "áo thun size L" |
| `/ao-thun?sort=price` | Khong | Category chính | Sort không phải content mới |
| `/ao-thun?page=2` | Co (cần xem xét) | Self | Nhưng dùng `rel="next/prev"` |

---

## 3. Product Schema Markup (JSON-LD)

### Product schema cơ bản

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Áo Thun Nam Cotton Trắng",
  "image": [
    "https://shop.com/images/ao-thun-trang-1.jpg",
    "https://shop.com/images/ao-thun-trang-2.jpg",
    "https://shop.com/images/ao-thun-trang-3.jpg"
  ],
  "description": "Áo thun nam cotton 100%, co giãn 4 chiều, phù hợp mặc hàng ngày.",
  "sku": "ATN-CTT-001",
  "brand": {
    "@type": "Brand",
    "name": "ShopABC"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://shop.com/ao-thun/ao-thun-nam-cotton-trang",
    "priceCurrency": "VND",
    "price": "199000",
    "priceValidUntil": "2025-12-31",
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "ShopABC"
    }
  }
}
</script>
```

### AggregateRating schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Áo Thun Nam Cotton Trắng",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.6",
    "reviewCount": "128",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": "Nguyễn Văn A"
      },
      "datePublished": "2024-11-15",
      "reviewBody": "Chất vải rất mát, form đẹp, đúng size."
    }
  ],
  "offers": {
    "@type": "Offer",
    "priceCurrency": "VND",
    "price": "199000",
    "availability": "https://schema.org/InStock"
  }
}
</script>
```

### BreadcrumbList schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Trang chủ",
      "item": "https://shop.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Áo Thun Nam",
      "item": "https://shop.com/ao-thun-nam"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Áo Thun Nam Cotton Trắng",
      "item": "https://shop.com/ao-thun/ao-thun-nam-cotton-trang"
    }
  ]
}
</script>
```

### Generate Product JSON-LD bằng JavaScript

```javascript
// utils/generateProductSchema.js
function generateProductSchema(product) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: 'VND',
      price: product.price.toString(),
      priceValidUntil: product.priceValidUntil || '2025-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  // Thêm rating nếu có
  if (product.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating.toString(),
      reviewCount: product.reviewCount.toString(),
      bestRating: '5',
      worstRating: '1',
    };
  }

  return schema;
}

// Sử dụng trong React component
function ProductHead({ product }) {
  const schema = generateProductSchema(product);

  return (
    <head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </head>
  );
}
```

---

## 4. Pagination và Infinite Scroll SEO

### Vấn đề với Infinite Scroll

Google có thể crawl infinite scroll nhưng **không reliable**. Googlebot không scroll như user, nên content lazy-loaded khi scroll sẽ không được index.

### Giải pháp: Hybrid approach

```javascript
// Infinite scroll cho UX, nhưng vẫn có paginated URLs cho SEO

// pages/category/[slug].js
export async function getServerSideProps({ params, query }) {
  const page = parseInt(query.page) || 1;
  const perPage = 24;

  const products = await fetchProducts({
    category: params.slug,
    page,
    perPage,
  });

  return {
    props: {
      products: products.items,
      totalPages: products.totalPages,
      currentPage: page,
    },
  };
}
```

### Pagination SEO tags

```html
<head>
  <!-- Canonical cho mỗi trang pagination -->
  <link rel="canonical" href="https://shop.com/ao-thun-nam?page=2" />

  <!-- Prev/Next (Google đã bỏ support nhưng Bing vẫn dùng) -->
  <link rel="prev" href="https://shop.com/ao-thun-nam?page=1" />
  <link rel="next" href="https://shop.com/ao-thun-nam?page=3" />
</head>
```

---

## 5. Xử lý sản phẩm hết hàng

### Bảng quyết định

| Tình huống | Hành động | HTTP Status |
|---|---|---|
| Hết hàng tạm thời | Giữ trang, hiển thị "Hết hàng" | 200 |
| Hết hàng vĩnh viễn, có thay thế | 301 redirect đến sản phẩm thay thế | 301 |
| Hết hàng vĩnh viễn, không thay thế | 301 redirect đến category | 301 |
| Seasonal product (sẽ quay lại) | Giữ trang, thêm "Notify me" | 200 |
| Product bị xóa hoàn toàn | Trả 410 Gone | 410 |

### Triển khai trong Next.js

```javascript
// pages/product/[slug].js
export async function getServerSideProps({ params, res }) {
  const product = await getProduct(params.slug);

  // Sản phẩm không tồn tại
  if (!product) {
    return { notFound: true }; // 404
  }

  // Sản phẩm bị xóa vĩnh viễn
  if (product.status === 'deleted') {
    res.statusCode = 410;
    return {
      props: { gone: true },
    };
  }

  // Sản phẩm hết hàng vĩnh viễn, có redirect
  if (product.status === 'discontinued' && product.redirectTo) {
    return {
      redirect: {
        destination: `/product/${product.redirectTo}`,
        permanent: true, // 301
      },
    };
  }

  return {
    props: { product },
  };
}
```

### Schema cho sản phẩm hết hàng

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Áo Thun Limited Edition 2024",
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/OutOfStock",
    "priceCurrency": "VND",
    "price": "399000"
  }
}
```

---

## 6. Lỗi thường gặp

### Lỗi 1: Để faceted navigation tạo millions of URLs

Không block hoặc canonicalize filter URLs dẫn đến crawl budget bị lãng phí. Google crawl hàng triệu trang filter thay vì product pages quan trọng.

### Lỗi 2: Duplicate product descriptions

Copy paste mô tả từ nhà cung cấp cho hàng trăm sản phẩm. Google coi đây là thin/duplicate content.

**Fix**: Viết unique description ít nhất cho top 20% sản phẩm (theo traffic).

### Lỗi 3: Thiếu Product schema

Không có structured data nghĩa là không có rich snippets (giá, rating, stock status) trên SERP. Mất CTR đáng kể so với competitor có rich snippets.

### Lỗi 4: Infinite scroll mà không có paginated fallback

Content chỉ load khi scroll không được Google index. Phải có URL-based pagination (`?page=2`) dưới dạng SSR để Googlebot crawl được.

### Lỗi 5: 404 cho sản phẩm hết hàng thay vì 301

Sản phẩm hết hàng đã có backlinks và ranking. Trả 404 sẽ mất hết link equity. 301 redirect chuyển link equity sang trang phù hợp.

---

## Câu hỏi phỏng vấn

### Câu 1: Faceted navigation gây ra vấn đề gì cho SEO và cách xử lý?

**Trả lời**: Faceted navigation (filter theo color, size, brand, price) tạo ra hàng triệu URL combinations, gây ra duplicate content và lãng phí crawl budget. Xử lý bằng cách: (1) Canonical tất cả filter URLs về category page chính, (2) Noindex filter pages không có search volume, (3) Block crawl params không cần thiết trong robots.txt, (4) Chỉ cho index filter combinations có search volume thực sự (ví dụ `?color=red` nếu "áo thun đỏ" có người search).

### Câu 2: Khi sản phẩm hết hàng vĩnh viễn, nên xử lý thế nào cho SEO?

**Trả lời**: Nếu có sản phẩm thay thế tương tự, 301 redirect sang sản phẩm đó để chuyển link equity. Nếu không có thay thế, 301 về category page. Không nên dùng 404 vì sẽ mất backlinks và ranking đã xây dựng. Chỉ dùng 410 (Gone) khi muốn Google remove hoàn toàn khỏi index nhanh chóng.

### Câu 3: Tại sao Product schema quan trọng cho e-commerce SEO?

**Trả lời**: Product schema (JSON-LD) giúp Google hiểu đây là trang sản phẩm và hiển thị rich snippets trên SERP: giá, tình trạng kho, rating. Các rich snippets này tăng CTR đáng kể (trung bình 20-30%) so với kết quả không có rich snippets. Schema cũng giúp sản phẩm xuất hiện trong Google Shopping và các tính năng tìm kiếm đặc biệt.

### Câu 4: Infinite scroll ảnh hưởng thế nào đến SEO?

**Trả lời**: Googlebot không scroll như user, nên content load qua infinite scroll bằng JavaScript có thể không được index. Giải pháp là hybrid approach: infinite scroll cho UX nhưng vẫn có URL-based pagination (`?page=2`, `?page=3`) render phía server. Thêm `rel="prev/next"` links (vẫn hữu ích cho Bing) và đảm bảo mỗi paginated URL có canonical trỏ đến chính nó.

### Câu 5: Canonical tag nên xử lý thế nào cho product variants?

**Trả lời**: Phụ thuộc vào mức độ khác biệt giữa variants. Nếu variants chỉ khác color/size mà description giống nhau, dùng canonical trỏ về trang product chính. Nếu variants có nội dung thực sự khác (ví dụ iPhone 15 Pro vs iPhone 15 Pro Max), tạo trang riêng với canonical self-referencing. Query params như `?color=red&size=L` luôn canonical về trang chính.
