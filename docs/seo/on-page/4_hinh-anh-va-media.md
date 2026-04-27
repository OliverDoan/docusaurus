---
sidebar_position: 4
title: "4. Hình ảnh và media SEO"
---

# Hình ảnh và media SEO

## Mục lục

- [Tại sao hình ảnh SEO quan trọng?](#tại-sao-hình-ảnh-seo-quan-trọng)
- [Alt Text (Thuộc tính alt)](#alt-text-thuộc-tính-alt)
- [Tên file hình ảnh](#tên-file-hình-ảnh)
- [Định dạng hình ảnh hiện đại](#định-dạng-hình-ảnh-hiện-đại)
- [Thẻ `<picture>` và Art Direction](#thẻ-picture-và-art-direction)
- [Responsive Images voi srcset va sizes](#responsive-images-voi-srcset-va-sizes)
- [Lazy Loading](#lazy-loading)
- [next/image Component](#nextimage-component)
- [Video SEO](#video-seo)
- [Cumulative Layout Shift (CLS) và hình ảnh](#cumulative-layout-shift-cls-và-hình-ảnh)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Tại sao hình ảnh SEO quan trọng?

Hình ảnh chiếm khoảng 50% dung lượng trang web trung bình. Tối ưu hình ảnh không chỉ giúp trang tải nhanh hơn (Core Web Vitals) mà còn giúp trang xuất hiện trên Google Images — nguồn traffic mà nhiều người bỏ qua.

Theo dữ liệu của Google, Google Images chiếm khoảng 20-25% tổng số lượt tìm kiếm. Nếu bạn bỏ qua image SEO, bạn đang mất một nguồn traffic lớn.

## Alt Text (Thuộc tính alt)

### Alt text là gì?

Alt text (alternative text) là thuộc tính HTML mô tả nội dung hình ảnh. Nó phục vụ 3 mục đích:

1. **Accessibility**: Trình đọc màn hình đọc alt text cho người khuyết tật thị giác
2. **SEO**: Google dùng alt text để hiểu nội dung hình ảnh
3. **Fallback**: Hiển thị khi hình không load được

### Cách viết alt text tốt

```html
<!-- SAI: Khong co alt -->
<img src="keyboard.jpg" />

<!-- SAI: Alt text rong (chi hop le cho hinh trang tri) -->
<img src="keyboard.jpg" alt="" />

<!-- SAI: Nhoi keyword -->
<img src="keyboard.jpg" alt="ban phim co ban phim gaming ban phim gia re ban phim tot nhat" />

<!-- SAI: Bat dau bang "hinh anh cua" hoac "anh cua" -->
<img src="keyboard.jpg" alt="Hinh anh cua ban phim co" />

<!-- DUNG: Mo ta cu the, tu nhien -->
<img src="keyboard.jpg" alt="Ban phim co TKL voi keycap PBT mau trang tren ban lam viec go" />

<!-- DUNG: Bao gom ngu canh lien quan -->
<img src="chart.png" alt="Bieu do so sanh toc do tai trang giua WebP va JPEG: WebP nhanh hon 30%" />
```

### Quy tắc viết alt text

| Nguyên tắc | Ví dụ |
|-----------|-------|
| Mô tả nội dung, không phải file | `alt="Chậu cây xanh trên bàn làm việc"` thay vì `alt="plant-desk.jpg"` |
| Ngắn gọn (125 ký tự) | Không viết cả đoạn văn |
| Bao gồm keyword tự nhiên | Không nhồi keyword |
| Cụ thể, không chung chung | `alt="MacBook Pro M3 trên bàn gỗ"` thay vì `alt="laptop"` |
| Bỏ qua cho hình trang trí | Dùng `alt=""` cho icon, đường kẻ, hình nền |

## Tên file hình ảnh

Google đọc tên file để hiểu nội dung hình ảnh. Tên file là tín hiệu SEO quan trọng.

```
# SAI
IMG_20260405_001234.jpg
screenshot-2026-04-05.png
DSC_0001.jpg
image1.jpg

# DUNG
mechanical-keyboard-tkl-white.jpg
nextjs-seo-meta-tags-diagram.png
core-web-vitals-comparison-chart.webp
```

### Quy tắc đặt tên file

- Dùng gạch nối `-` phân cách các từ (không dùng gạch dưới `_`)
- Viết thường toàn bộ
- Mô tả nội dung hình ảnh
- Bao gồm keyword mục tiêu
- Không dùng ký tự đặc biệt hoặc dấu tiếng Việt

## Định dạng hình ảnh hiện đại

### So sánh các định dạng

| Định dạng | Nén | Chất lượng | Hỗ trợ trình duyệt | Khi nào dùng |
|-----------|-----|-----------|-------------------|-------------|
| JPEG | Lossy | Tốt | Tất cả | Ảnh chụp, hình phức tạp |
| PNG | Lossless | Rất tốt | Tất cả | Logo, hình có nền trong suốt |
| WebP | Cả hai | Rất tốt | 97%+ | **Mặc định cho hầu hết trường hợp** |
| AVIF | Cả hai | Xuất sắc | 92%+ | Khi cần nén tốt nhất |
| SVG | Vector | Hoàn hảo | Tất cả | Icon, logo, hình đơn giản |
| GIF | Lossless | Trung bình | Tất cả | Animation ngắn (nên dùng video thay) |

### So sánh kích thước file

| Hình gốc (JPEG) | WebP | AVIF | Giảm |
|-----------------|------|------|------|
| 500 KB | 200 KB | 150 KB | 60-70% |
| 1 MB | 400 KB | 280 KB | 60-72% |
| 2 MB | 750 KB | 520 KB | 62-74% |

:::tip Khuyến nghị
Sử dụng WebP làm định dạng mặc định. AVIF cho kết quả tốt hơn nhưng chậm hơn khi encode và chưa được hỗ trợ toàn bộ. Luôn cung cấp JPEG/PNG làm fallback.
:::

### Chuyển đổi sang WebP

```bash
# Su dung cwebp (cai tu libwebp)
cwebp -q 80 input.jpg -o output.webp

# Batch convert tat ca JPEG trong thu muc
for file in *.jpg; do
  cwebp -q 80 "$file" -o "${file%.jpg}.webp"
done

# Su dung sharp (Node.js)
npm install sharp
```

```javascript
// convert-images.js
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

async function convertToWebP(inputPath, quality = 80) {
  const outputPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp')

  await sharp(inputPath)
    .webp({ quality })
    .toFile(outputPath)

  const originalSize = fs.statSync(inputPath).size
  const newSize = fs.statSync(outputPath).size
  const savings = ((1 - newSize / originalSize) * 100).toFixed(1)

  console.log(`${path.basename(inputPath)}: ${savings}% smaller`)
}

// Dung
convertToWebP('./images/hero-banner.jpg')
```

## Thẻ `<picture>` và Art Direction

Thẻ `<picture>` cho phép cung cấp nhiều định dạng và kích thước hình ảnh, để trình duyệt chọn phiên bản tốt nhất.

```html
<!-- Cung cap nhieu dinh dang voi fallback -->
<picture>
  <!-- AVIF (tot nhat, trinh duyet moi) -->
  <source srcset="hero-banner.avif" type="image/avif" />
  <!-- WebP (tot, ho tro rong) -->
  <source srcset="hero-banner.webp" type="image/webp" />
  <!-- JPEG (fallback cho trinh duyet cu) -->
  <img src="hero-banner.jpg" alt="Banner trang chu voi hinh laptop va code editor" />
</picture>

<!-- Art direction: hinh khac nhau tren mobile va desktop -->
<picture>
  <source
    media="(max-width: 768px)"
    srcset="hero-mobile.webp"
    type="image/webp"
  />
  <source
    media="(min-width: 769px)"
    srcset="hero-desktop.webp"
    type="image/webp"
  />
  <img src="hero-desktop.jpg" alt="Banner trang chu" />
</picture>
```

## Responsive Images voi srcset va sizes

### Tại sao cần responsive images?

Một hình 2000px trên màn hình mobile 375px là lãng phí băng thông. `srcset` và `sizes` giúp trình duyệt chọn kích thước phù hợp.

```html
<!-- srcset voi width descriptor -->
<img
  src="article-image-800.jpg"
  srcset="
    article-image-400.jpg   400w,
    article-image-800.jpg   800w,
    article-image-1200.jpg 1200w,
    article-image-1600.jpg 1600w
  "
  sizes="
    (max-width: 640px) 100vw,
    (max-width: 1024px) 75vw,
    50vw
  "
  alt="Minh hoa responsive images voi cac breakpoint khac nhau"
  loading="lazy"
  decoding="async"
  width="800"
  height="450"
/>
```

### Giải thích

- `srcset`: Danh sách các phiên bản hình và kích thước thực của chúng (400w = 400px width)
- `sizes`: Cho trình duyệt biết hình sẽ chiếm bao nhiêu viewport
  - Trên mobile (dưới 640px): hình chiếm 100% viewport
  - Trên tablet (dưới 1024px): hình chiếm 75% viewport
  - Trên desktop: hình chiếm 50% viewport
- Trình duyệt tính toán và chọn hình phù hợp nhất từ `srcset`

## Lazy Loading

### Native Lazy Loading

Cách đơn giản nhất, hỗ trợ bởi toàn bộ các trình duyệt hiện đại.

```html
<!-- Chi can them loading="lazy" -->
<img
  src="product-image.webp"
  alt="San pham ban phim co"
  loading="lazy"
  width="400"
  height="300"
/>

<!-- KHONG lazy load hinh above-the-fold (hero image, banner) -->
<!-- Hinh dau tien nen load ngay -->
<img
  src="hero-banner.webp"
  alt="Hero banner trang chu"
  loading="eager"
  fetchpriority="high"
  width="1200"
  height="630"
/>
```

### Intersection Observer (tùy chỉnh)

Khi cần kiểm soát nhiều hơn (animation, placeholder, v.v.):

```javascript
// lazy-load.js
function createLazyLoader() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          // Chuyen data-src sang src
          img.src = img.dataset.src
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset
          }
          img.classList.add('loaded')
          observer.unobserve(img)
        }
      })
    },
    {
      rootMargin: '200px', // Bat dau load truoc 200px
      threshold: 0.01,
    }
  )

  // Observe tat ca hinh co class lazy
  document.querySelectorAll('img.lazy').forEach((img) => {
    observer.observe(img)
  })
}

// Chay khi DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createLazyLoader)
} else {
  createLazyLoader()
}
```

```html
<!-- HTML voi lazy loading placeholder -->
<img
  class="lazy"
  data-src="product-large.webp"
  data-srcset="product-400.webp 400w, product-800.webp 800w"
  src="placeholder-blur.jpg"
  alt="San pham ban phim co custom"
  width="400"
  height="300"
/>
```

## next/image Component

`next/image` của Next.js tự động xử lý hầu hết các vấn đề tối ưu hình ảnh.

### Tính năng tự động

| Tính năng | Mô tả |
|-----------|-------|
| Lazy loading | Mặc định, tự động |
| Responsive | Tự động generate srcset |
| WebP/AVIF | Tự động chuyển đổi định dạng |
| Resize | Resize trên server theo kích thước cần |
| Blur placeholder | Tạo blur hash cho loading state |
| Prevent CLS | Tự động đặt width/height |

### Code mẫu

```tsx
import Image from 'next/image'

// Hinh local (static import)
import heroImage from '@/public/images/hero-banner.jpg'

function HeroBanner() {
  return (
    <Image
      src={heroImage}
      alt="Hero banner trang chu voi code editor va terminal"
      priority  // Khong lazy load, load ngay (cho above-the-fold)
      placeholder="blur"  // Hien blur khi dang load
      quality={85}
      sizes="100vw"
    />
  )
}

// Hinh tu URL
function ProductImage({ product }: { product: Product }) {
  return (
    <Image
      src={product.imageUrl}
      alt={product.name}
      width={400}
      height={300}
      loading="lazy"  // Mac dinh
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}
```

### Cấu hình next.config.js cho remote images

```javascript
// next.config.js
module.exports = {
  images: {
    // Cho phep load hinh tu cac domain nay
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
      },
    ],
    // Dinh dang uu tien (AVIF > WebP)
    formats: ['image/avif', 'image/webp'],
    // Cac kich thuoc device
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Cac kich thuoc icon/thumbnail
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
}
```

## Video SEO

### Video Schema Markup

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Huong dan SEO On-Page cho Developer",
  "description": "Video huong dan chi tiet cach toi uu meta tags, structured data va URL cho developer.",
  "thumbnailUrl": "https://example.com/thumbnails/seo-guide.jpg",
  "uploadDate": "2026-04-01T10:00:00+07:00",
  "duration": "PT15M30S",
  "contentUrl": "https://example.com/videos/seo-guide.mp4",
  "embedUrl": "https://www.youtube.com/embed/abc123",
  "publisher": {
    "@type": "Organization",
    "name": "DevSEO Vietnam",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "interactionStatistic": {
    "@type": "InteractionCounter",
    "interactionType": { "@type": "WatchAction" },
    "userInteractionCount": 12500
  }
}
</script>
```

### Video embedding best practices

```html
<!-- SAI: Auto-load video nang trang -->
<video autoplay src="demo.mp4"></video>

<!-- DUNG: Lazy load video voi poster -->
<video
  controls
  preload="none"
  poster="video-poster.webp"
  width="800"
  height="450"
>
  <source src="demo.webm" type="video/webm" />
  <source src="demo.mp4" type="video/mp4" />
  Trinh duyet khong ho tro video.
</video>

<!-- DUNG: YouTube embed voi lazy loading -->
<iframe
  src="https://www.youtube-nocookie.com/embed/abc123"
  title="Huong dan SEO On-Page"
  loading="lazy"
  width="800"
  height="450"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>
```

### Lite YouTube Embed (tối ưu performance)

```html
<!-- Thay vi load toan bo YouTube iframe (> 500KB) -->
<!-- Dung lite-youtube-embed (chi 5KB) -->
<script type="module" src="https://cdn.jsdelivr.net/npm/lite-youtube-embed/src/lite-yt-embed.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lite-youtube-embed/src/lite-yt-embed.css" />

<lite-youtube videoid="abc123" playlabel="Xem: Huong dan SEO On-Page">
  <a href="https://youtube.com/watch?v=abc123" class="lty-playbtn" title="Phat video">
    <span class="lyt-visually-hidden">Xem: Huong dan SEO On-Page</span>
  </a>
</lite-youtube>
```

## Cumulative Layout Shift (CLS) và hình ảnh

### Vấn đề

Khi hình ảnh load xong và "đẩy" nội dung xuống dưới, gây ra CLS — một chỉ số Core Web Vitals.

### Giải pháp

```html
<!-- LUON khai bao width va height -->
<img
  src="product.webp"
  alt="San pham"
  width="400"
  height="300"
  loading="lazy"
/>

<!-- Hoac dung CSS aspect-ratio -->
<style>
.image-container {
  aspect-ratio: 16 / 9;
  width: 100%;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>

<div class="image-container">
  <img src="banner.webp" alt="Banner" loading="lazy" />
</div>
```

## Lỗi thường gặp

### 1. Thiếu alt text

Theo khảo sát, khoảng 50% hình ảnh trên web thiếu alt text. Đây là cơ hội SEO bị bỏ qua lớn nhất.

### 2. Hình quá nặng không nén

```bash
# Kiem tra kich thuoc hinh
ls -lh images/

# Nen hinh voi sharp
npx sharp-cli --input images/hero.jpg --output images/hero.webp --format webp --quality 80
```

### 3. Không có width và height

Thiếu `width` và `height` gây CLS. Luôn khai báo kích thước hoặc dùng `aspect-ratio` trong CSS.

### 4. Lazy load hình above-the-fold

Hình đầu tiên (hero banner, logo) cần load ngay. Dùng `loading="eager"` và `fetchpriority="high"` cho hình above-the-fold.

### 5. Dùng hình decorative mà có alt text

```html
<!-- SAI: Hinh trang tri co alt text -->
<img src="divider-line.png" alt="Duong ke ngang trang tri" />

<!-- DUNG: Hinh trang tri dung alt rong -->
<img src="divider-line.png" alt="" role="presentation" />
```

### 6. Tên file không mô tả

File `IMG_20260405_001234.jpg` không cung cấp tín hiệu SEO nào. Luôn đổi tên file trước khi upload.

## Câu hỏi phỏng vấn

### Câu 1: Alt text ảnh hưởng đến SEO như thế nào?

**Trả lời:** Alt text là cách chính để Google hiểu nội dung hình ảnh vì Google không "nhìn" được hình như con người. Alt text ảnh hưởng đến: (1) **Google Images ranking** — hình có alt text tốt xuất hiện trên Google Images, (2) **Ngữ cảnh trang** — alt text cung cấp thêm tín hiệu về nội dung trang, giúp ranking cho toàn trang, (3) **Accessibility** — trình đọc màn hình đọc alt text, đây cũng là yếu tố Google đánh giá, (4) **Fallback** — khi hình không load được, alt text vẫn cung cấp thông tin.

### Câu 2: WebP và AVIF khác nhau như thế nào? Khi nào dùng cái nào?

**Trả lời:** WebP do Google phát triển, nén khoảng 25-30% so với JPEG ở cùng chất lượng, hỗ trợ 97%+ trình duyệt. AVIF do Alliance for Open Media phát triển, nén tốt hơn WebP 20-30% nhưng chậm hơn khi encode và hỗ trợ 92% trình duyệt. Khuyến nghị: dùng WebP làm mặc định vì cân bằng tốt giữa kích thước, chất lượng và hỗ trợ. Dùng AVIF khi cần nén tối đa và không quan tâm đến thời gian encode (ví dụ: ảnh static trên CDN). Luôn có JPEG/PNG làm fallback.

### Câu 3: Lazy loading ảnh hưởng đến SEO không? Googlebot có đọc được hình lazy load?

**Trả lời:** Googlebot có thể render JavaScript và đọc hình lazy load, nhưng với điều kiện: (1) Dùng native `loading="lazy"` — Googlebot hỗ trợ tốt nhất, (2) Nếu dùng custom JS lazy loading (Intersection Observer), cần đảm bảo hình có trong DOM (không dùng `noscript` fallback), (3) **Không** lazy load hình above-the-fold và LCP image — điều này làm chậm tốc độ hiển thị và ảnh hưởng Core Web Vitals. Best practice: dùng native lazy loading và đặt `loading="eager"` cho hình quan trọng.

### Câu 4: Làm sao giảm Cumulative Layout Shift (CLS) do hình ảnh?

**Trả lời:** CLS xảy ra khi hình ảnh load xong và đẩy nội dung. Cách khắc phục: (1) **Luôn khai báo `width` và `height`** trên thẻ `img` để trình duyệt dành chỗ sẵn vị trí, (2) Dùng CSS `aspect-ratio` cho container, (3) Dùng placeholder (blur hash, skeleton) giữ chỗ vị trí, (4) Dùng `next/image` — tự động xử lý CLS. Google đánh giá CLS là một trong 3 chỉ số Core Web Vitals, nên ảnh hưởng trực tiếp đến ranking.

### Câu 5: Làm sao tối ưu hình cho một e-commerce site có hàng ngàn sản phẩm?

**Trả lời:** Chiến lược tối ưu quy mô lớn: (1) **CDN với image processing** — dùng Cloudinary, imgix hoặc Cloudflare Images để tự động resize, convert format, nén, (2) **Responsive images** — dùng `srcset` và `sizes` để serve kích thước phù hợp, (3) **WebP/AVIF với fallback** — dùng thẻ `picture` hoặc CDN tự động, (4) **Lazy loading** cho tất cả hình dưới fold, (5) **Đặt tên file có hệ thống** — `ten-san-pham-mau-kich-thuoc.webp`, (6) **Alt text từ product data** — generate từ tên sản phẩm + thuộc tính, không để trống, (7) **Image sitemap** — khai báo hình quan trọng trong sitemap để Google index.
