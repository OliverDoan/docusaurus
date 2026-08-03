---
sidebar_position: 3
title: "3. Technical SEO: Links, URLs, Redirects, hreflang"
---

# Technical SEO: Links, URLs, Redirects, hreflang

> *Nhóm câu hỏi về "hạ tầng" SEO: cấu trúc link nội bộ, URL, redirect và đa ngôn ngữ. Thường xuất hiện khi phỏng vấn vị trí làm e-commerce hoặc site đa quốc gia.*

:::note[Ghi nhớ nhanh]

- ⭐ **Internal link có 3 vai trò** — discovery (crawl trang mới), phân phối link equity (PageRank), và ngữ cảnh qua anchor text.
- ⭐ **Orphan page khó được crawl** — trang không có internal link trỏ tới rất khó index, dù đã có trong sitemap.
- **Anchor text nên mô tả trang đích** — "hướng dẫn cấu hình sitemap" thay vì "bấm vào đây"; cấu trúc phẳng ≤ 3 click từ trang chủ.
- **Link nội bộ phải là `<a href>` thật** — không phải `div` + onClick; trỏ thẳng URL đích cuối, tránh chuỗi redirect.
- **`hreflang` cho site đa ngôn ngữ** — khai báo phiên bản ngôn ngữ/vùng để Google phục vụ đúng trang cho đúng user.

:::

---

## Câu 11: Internal linking ảnh hưởng SEO như thế nào? Best practices? `[Intermediate]`

### Câu hỏi

> Internal linking là gì và ảnh hưởng SEO thế nào? Em áp dụng best practices gì khi build website?

### Giải thích lý thuyết

**Internal link** là link giữa các trang trong cùng domain. Nó ảnh hưởng SEO qua 3 cơ chế:

1. **Khám phá (discovery)** — Googlebot tìm trang mới chủ yếu bằng cách **theo link**. Trang không có internal link trỏ tới (**orphan page**) rất khó được crawl, dù có trong sitemap.
2. **Phân phối link equity (PageRank)** — "sức mạnh" từ backlink chảy qua internal link. Trang được nhiều internal link trỏ tới được Google coi là quan trọng hơn.
3. **Ngữ cảnh (anchor text)** — văn bản của link giúp Google hiểu trang đích nói về gì.

Best practices:

- **Anchor text mô tả nội dung đích**: "xem hướng dẫn cấu hình sitemap" thay vì "bấm vào đây" / "đọc thêm".
- **Cấu trúc phẳng**: mọi trang quan trọng nên cách trang chủ **≤ 3 click** — càng sâu, crawl càng ít, equity càng yếu.
- **Breadcrumb** + structured data: vừa là internal link vừa giúp Google hiểu hierarchy.
- **Related posts / related products**: tạo liên kết theo chủ đề (topic cluster — các bài con link về bài trụ cột "pillar page").
- Link phải là **`<a href>` thật** trong HTML (không phải div + onClick — xem câu 18).
- **Sửa link gãy và link redirect chuỗi**: link nội bộ trỏ thẳng URL đích cuối, không qua 2–3 lần redirect.
- `rel="nofollow"` cho internal link là **anti-pattern** — chỉ chặn equity của chính mình.

### Code minh hoạ

```tsx
// ❌ Anchor text vô nghĩa
<Link href="/guides/sitemap">Bấm vào đây</Link>

// ✅ Anchor text mô tả trang đích
<Link href="/guides/sitemap">Hướng dẫn tạo sitemap XML cho Next.js</Link>
```

```tsx
// Breadcrumb: internal link + giúp Google hiểu cấu trúc site
<nav aria-label="Breadcrumb">
  <ol>
    <li><Link href="/">Trang chủ</Link></li>
    <li><Link href="/giay">Giày</Link></li>
    <li aria-current="page">Giày chạy bộ nam</li>
  </ol>
</nav>
```

### Đáp án mẫu

> "Internal link ảnh hưởng SEO qua ba cơ chế: giúp Googlebot khám phá trang mới — trang orphan không có link trỏ tới rất khó được crawl; phân phối link equity — trang được nhiều internal link trỏ tới được coi là quan trọng hơn; và anchor text cho Google ngữ cảnh về trang đích. Best practices của em: anchor text mô tả nội dung thay vì 'bấm vào đây', giữ cấu trúc phẳng để trang quan trọng cách trang chủ tối đa 3 click, dùng breadcrumb kèm structured data, và làm related posts theo mô hình topic cluster. Về kỹ thuật, link phải là thẻ `a` có `href` thật để crawler theo được, và em tránh internal link trỏ qua redirect chuỗi — luôn trỏ thẳng URL cuối."

---

## Câu 15: URL structure ảnh hưởng SEO như thế nào? Best practices? `[Basic]`

### Câu hỏi

> Cấu trúc URL ảnh hưởng SEO thế nào? URL như thế nào là tốt cho SEO?

### Giải thích lý thuyết

URL ảnh hưởng SEO ở mức vừa phải nhưng ảnh hưởng **UX và CTR** rõ rệt — URL sạch, dễ đọc xuất hiện trên SERP đáng tin hơn, dễ share hơn, và keyword trong URL là ranking signal nhẹ.

Best practices:

| Nguyên tắc | ❌ Tệ | ✅ Tốt |
| --- | --- | --- |
| Dễ đọc, mô tả nội dung | `/p?id=8421&cat=3` | `/giay/giay-chay-bo-nam` |
| Dùng hyphen `-`, không underscore | `/giay_chay_bo` | `/giay-chay-bo` |
| Chữ thường, không dấu, không ký tự đặc biệt | `/Giày Chạy Bộ` | `/giay-chay-bo` |
| Ngắn gọn, bỏ stop words thừa | `/cua-hang/danh-muc/san-pham/giay/...` | `/giay/pegasus-41` |
| Cấu trúc phản ánh hierarchy | — | `/blog/seo/canonical-url` |
| Ổn định — URL là "địa chỉ vĩnh viễn" | đổi slug tuỳ tiện | đổi thì phải 301 redirect |

Điểm cần nói thêm trong phỏng vấn:

- **Đổi URL = mất ranking tạm thời** nếu không 301 redirect từ URL cũ. Thiết kế URL ngay từ đầu để không phải đổi (ví dụ không nhúng những thứ dễ đổi như tên category vào URL sản phẩm nếu sản phẩm hay đổi category).
- **Query params** (sort, filter, tracking) tạo duplicate content → xử lý bằng canonical (câu 5).
- **Trailing slash**: `/blog` và `/blog/` là 2 URL khác nhau với Google — chọn một dạng và redirect dạng kia.
- Subfolder (`example.com/blog`) thường được khuyên hơn subdomain (`blog.example.com`) vì gom authority về một domain.

### Code minh hoạ

```ts
// Next.js: dynamic route với slug thân thiện SEO
// app/blog/[slug]/page.tsx → /blog/toi-uu-lcp-trong-nextjs

// Tạo slug từ title (bỏ dấu tiếng Việt, lowercase, hyphen)
function toSlug(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // bỏ dấu
    .replace(/đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

toSlug("Tối ưu LCP trong Next.js"); // "toi-uu-lcp-trong-nextjs"
```

### Đáp án mẫu

> "URL ảnh hưởng SEO trực tiếp ở mức nhẹ — keyword trong URL là signal yếu — nhưng ảnh hưởng CTR và UX rõ rệt vì URL hiển thị trên kết quả tìm kiếm. URL tốt là URL dễ đọc, mô tả nội dung, dùng hyphen thay underscore, chữ thường không dấu, ngắn gọn và phản ánh hierarchy của site. Quan trọng nhất với em là tính **ổn định**: URL là địa chỉ vĩnh viễn, đổi URL mà không 301 redirect là mất hết ranking và backlink của trang đó — nên em thiết kế URL ngay từ đầu để hạn chế phải đổi, ví dụ không nhúng category vào URL sản phẩm nếu sản phẩm hay được chuyển category. Ngoài ra em thống nhất trailing slash một dạng, và xử lý query params bằng canonical để tránh duplicate."

---

## Câu 16: Redirect 301 vs 302: khác nhau gì và ảnh hưởng SEO thế nào? `[Intermediate]`

### Câu hỏi

> Phân biệt redirect 301 và 302? Dùng sai ảnh hưởng SEO thế nào? Redirect chain là gì?

### Giải thích lý thuyết

| | **301 Moved Permanently** | **302 Found (tạm thời)** |
| --- | --- | --- |
| Ý nghĩa | URL đã chuyển **vĩnh viễn** | Chuyển **tạm thời**, URL cũ sẽ quay lại |
| Google index URL nào | URL **mới** (canonical chuyển sang URL mới) | URL **cũ** (giữ nguyên) |
| Link equity | Chuyển sang URL mới (~gần như 100%) | Giữ ở URL cũ |
| Dùng khi | Đổi domain, đổi slug, http→https, gộp trang | A/B test, trang khuyến mãi tạm, bảo trì |

Hậu quả dùng sai:

- Đổi URL vĩnh viễn nhưng dùng **302** → Google giữ index URL cũ, URL mới lâu được nhận equity. (Google nói 302 lâu ngày sẽ được xử lý như 301, nhưng "lâu" là không kiểm soát được — cứ dùng đúng từ đầu.)
- Dùng **301** cho thay đổi tạm → Google bỏ index URL cũ; khi quay lại phải chờ index lại từ đầu.

Các khái niệm liên quan hay bị hỏi kèm:

- **Redirect chain**: A → B → C → D. Mỗi hop tốn thời gian crawl + chậm trải nghiệm; Googlebot bỏ cuộc sau ~10 hops. Fix: trỏ thẳng A → D, cập nhật internal link trỏ thẳng URL cuối.
- **Redirect loop**: A → B → A — trang chết hoàn toàn.
- **Client-side redirect** (`window.location`, `<meta http-equiv="refresh">`): yếu hơn nhiều so với HTTP redirect — chậm, phụ thuộc JS, không truyền signal rõ ràng. Chỉ là phương án cuối.
- 307/308 là phiên bản giữ nguyên HTTP method của 302/301 (quan trọng với API, ít quan trọng với SEO trang HTML).

### Code minh hoạ

```ts
// Next.js: redirect khai báo trong next.config.ts
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/blog-cu/:slug",
        destination: "/blog/:slug",
        permanent: true, // true = 308 (tương đương 301), false = 307 (tương đương 302)
      },
    ];
  },
};
```

```ts
// Redirect trong Server Component / Route Handler
import { redirect, permanentRedirect } from "next/navigation";

export default async function OldProductPage({ params }) {
  const product = await getProduct(params.id);
  if (product.movedTo) {
    permanentRedirect(`/products/${product.movedTo}`); // 308
  }
  // ...
}
```

### Đáp án mẫu

> "301 là chuyển vĩnh viễn — Google chuyển index và gần như toàn bộ link equity sang URL mới; 302 là tạm thời — Google giữ index URL cũ. Dùng sai chiều nào cũng có hậu quả: đổi URL vĩnh viễn mà dùng 302 thì URL mới chậm nhận equity, còn dùng 301 cho thay đổi tạm thì URL cũ bị bỏ index, quay lại phải chờ index lại. Trong Next.js, `permanent: true` trong redirects config trả về 308 — tương đương 301 nhưng giữ HTTP method. Hai vấn đề liên quan em luôn chú ý khi migrate: redirect chain — A qua B qua C vừa chậm vừa tốn crawl budget, phải map thẳng URL cũ sang URL cuối và cập nhật internal link; và tránh client-side redirect bằng JS vì yếu và chậm hơn HTTP redirect nhiều."

---

## Câu 17: International SEO: hreflang là gì? Cách implement? `[Advanced]`

### Câu hỏi

> Website có nhiều phiên bản ngôn ngữ/quốc gia thì gặp vấn đề SEO gì? hreflang giải quyết thế nào và implement ra sao?

### Giải thích lý thuyết

**Vấn đề**: site đa ngôn ngữ/đa quốc gia (ví dụ `/vi/`, `/en/`, `/en-au/`) gặp 2 rủi ro:

1. Google hiển thị **sai phiên bản** cho user (user Việt thấy bản tiếng Anh).
2. Các bản dịch/bản địa hoá gần giống nhau (en-US vs en-AU) bị coi là **duplicate content**.

**hreflang** là annotation khai báo: "trang này có các phiên bản thay thế cho ngôn ngữ/vùng X tại URL Y" — giúp Google serve đúng bản theo ngôn ngữ và vị trí user, đồng thời hiểu các bản là alternates chứ không phải duplicate.

Cú pháp giá trị: `ngôn-ngữ[-VÙNG]` theo ISO 639-1 + ISO 3166-1: `vi`, `en`, `en-US`, `en-AU`. Giá trị đặc biệt `x-default` chỉ định trang fallback khi không khớp ngôn ngữ nào (thường là trang chọn ngôn ngữ hoặc bản tiếng Anh).

3 cách khai báo (chọn **một**):

1. `<link rel="alternate" hreflang="..." href="...">` trong `<head>` — phổ biến nhất.
2. HTTP header — cho file không phải HTML.
3. Trong **sitemap XML** — gọn cho site lớn (không phình `<head>` mỗi trang).

**Quy tắc bắt buộc — sai là vô hiệu:**

- **Bidirectional (return links)**: trang A khai báo B thì B phải khai báo ngược lại A. Thiếu chiều ngược → Google bỏ qua cả cụm.
- Mỗi trang phải **tự khai báo chính nó** (self-referencing).
- URL phải **absolute**, trỏ tới trang trả 200 và được index (không noindex, không redirect).
- hreflang là **hint**, không phải directive — và **không thay thế việc dịch nội dung** (các bản phải thực sự khác ngôn ngữ/bản địa hoá).

### Code minh hoạ

```html
<!-- Trên TẤT CẢ các phiên bản, khai báo đủ cả cụm (kể cả chính nó) -->
<link rel="alternate" hreflang="vi" href="https://example.com/vi/san-pham" />
<link rel="alternate" hreflang="en" href="https://example.com/en/products" />
<link rel="alternate" hreflang="en-AU" href="https://example.com/en-au/products" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en/products" />
```

```tsx
// Next.js App Router: alternates.languages trong Metadata API
export async function generateMetadata({ params }) {
  return {
    alternates: {
      canonical: `https://example.com/${params.lang}/products`,
      languages: {
        vi: "https://example.com/vi/san-pham",
        en: "https://example.com/en/products",
        "en-AU": "https://example.com/en-au/products",
        "x-default": "https://example.com/en/products",
      },
    },
  };
}
```

### Đáp án mẫu

> "Site đa ngôn ngữ gặp hai vấn đề: Google có thể serve sai phiên bản cho user, và các bản gần giống nhau như en-US với en-AU bị coi là duplicate. hreflang giải quyết bằng cách khai báo các URL alternate theo ngôn ngữ và vùng, kèm `x-default` làm fallback. Có ba cách implement: link tag trong head, HTTP header, hoặc trong sitemap — site lớn em chuộng sitemap để không phình head. Quy tắc sống còn là **bidirectional**: trang A khai báo B thì B phải khai báo ngược lại A, thiếu chiều ngược là Google bỏ qua cả cụm; mỗi trang cũng phải self-reference chính nó, và URL phải absolute, trả 200, không noindex. Trong Next.js App Router em set qua `alternates.languages` trong `generateMetadata`. Cuối cùng em luôn nhắc team: hreflang chỉ là routing hint — nội dung vẫn phải được dịch và bản địa hoá thật."
