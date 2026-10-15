---
sidebar_position: 8
title: "8. CSS nâng cao"
---

# CSS nâng cao

> *Stacking context, BFC, cascade layers, `:has()` — vòng Senior hay hỏi những câu "vì sao nó không chạy" hơn là "nó là gì". Trả lời được cơ chế bên dưới là chỗ phân biệt người debug CSS bằng hiểu biết với người debug bằng thử `z-index: 99999`.*

:::note[Ghi nhớ nhanh]

- ⭐ **`z-index` chỉ so sánh trong cùng stacking context** — con có `z-index: 9999` không thể vượt lên trên "chú" của cha nếu cha đã tạo stacking context thấp hơn. Tác nhân hay quên: `opacity` nhỏ hơn 1, `transform`, `filter`, `isolation: isolate`, flex/grid item có `z-index`.
- ⭐ **`@layer`** — thứ tự layer quyết định trước specificity; style ngoài layer thắng mọi layer; khai báo thứ tự một lần ở đầu: `@layer reset, base, components, utilities;`.
- ⭐ **`:has()`** — "parent selector" và hơn thế (chọn anh em đứng trước, chọn theo trạng thái form); Baseline từ cuối 2023; tránh neo vào `body`/`:root` với điều kiện con cháu rộng.
- **BFC** — chứa float, chặn margin collapse cha/con, không đè lên float; tạo bằng `display: flow-root` (không tác dụng phụ) thay cho clearfix hay `overflow: hidden`.
- **Native nesting** — Baseline cuối 2023; `&` hoạt động như `:is()` (ảnh hưởng specificity) và **không** nối chuỗi kiểu `&__elem` như Sass.
- **Transition vs animation** — transition cần trigger đổi trạng thái, 2 điểm A→B; animation tự chạy, nhiều keyframe, lặp được; luôn tôn trọng `prefers-reduced-motion`.
- **Toolchain** — PostCSS + Autoprefixer theo `browserslist`; `@supports` cho progressive enhancement; BEM giữ specificity phẳng.
- **Hiệu năng CSS** — CSS là render-blocking; inline critical CSS, tránh `@import` lồng; selector cost hiếm khi là nút thắt, layout/paint mới là.

:::

---

## Câu 1: Stacking context — vì sao `z-index: 9999` không lên trên? `[Senior]`

### Câu hỏi

> Dropdown trong header của em có `z-index: 9999` nhưng vẫn bị một banner `z-index: 10` ở phần dưới trang che mất. Em giải thích và sửa thế nào?

### Giải thích lý thuyết

`z-index` **không phải** một trục toàn cục. Mỗi **stacking context** là một "lớp nhóm" — các phần tử con chỉ được sắp xếp `z-index` **bên trong** nhóm đó, rồi cả nhóm được sắp xếp như một khối với các anh em của nó.

Ví dụ: header có `z-index: 1` (tạo stacking context), banner có `z-index: 10`. Dropdown `z-index: 9999` nằm trong header → nó chỉ "cao nhất trong header". Cả header (1) vẫn thấp hơn banner (10). Con số 9999 vô nghĩa ngoài phạm vi header.

**Những gì tạo stacking context** (MDN liệt kê đầy đủ, đây là các tác nhân hay gặp):

- Phần tử gốc `html`.
- `position: relative/absolute` **kèm** `z-index` khác `auto`.
- `position: fixed` hoặc `sticky` (luôn luôn, không cần `z-index`).
- Flex item hoặc grid item có `z-index` khác `auto` (không cần `position`).
- `opacity` nhỏ hơn 1.
- `transform`, `scale`, `rotate`, `translate`, `filter`, `backdrop-filter`, `perspective`, `clip-path`, `mask` khác `none`.
- `mix-blend-mode` khác `normal`.
- `isolation: isolate` — tạo stacking context **có chủ đích** mà không có tác dụng phụ.
- `contain: layout`, `paint`, `strict`, `content`.
- `will-change` với một thuộc tính ở trên.

**Thứ tự vẽ trong một stacking context** (từ dưới lên):

1. Background và border của chính phần tử tạo context.
2. Con có `z-index` âm.
3. Block trong normal flow (không positioned).
4. Float.
5. Inline content.
6. Con positioned với `z-index: auto` hoặc `0`.
7. Con có `z-index` dương.

**Top layer** nằm ngoài mọi stacking context: `<dialog>` mở bằng `showModal()`, phần tử `popover`, phần tử fullscreen. Đây là lời giải dứt điểm cho modal/tooltip/dropdown thay vì đua `z-index`.

### Code minh hoạ

```css
/* Bug */
.header {
  position: relative;
  z-index: 1;          /* ← tạo stacking context, "trần nhà" là 1 */
}
.dropdown {
  position: absolute;
  z-index: 9999;       /* chỉ có nghĩa trong .header */
}
.banner {
  position: relative;
  z-index: 10;         /* 10 > 1 → banner đè cả header lẫn dropdown */
}

/* Fix 1: nâng stacking context của header, không phải của dropdown */
.header {
  position: relative;
  z-index: 20;
}
```

```css
/* Bug "vô hình": opacity/transform tạo stacking context */
.card {
  opacity: 0.99;            /* hoặc transform: translateZ(0) để "tăng tốc GPU" */
}
.card .tooltip {
  position: absolute;
  z-index: 1000;            /* bị nhốt trong .card */
}

/* isolation: isolate — gom z-index của component lại, không rò rỉ ra ngoài */
.component {
  isolation: isolate;
}
.component .bg   { position: absolute; z-index: -1; } /* -1 vẫn nằm trong component, không chui xuống dưới body */
.component .text { position: relative; }
```

```html
<!-- Lời giải dứt điểm: popover vào top layer, không cần z-index -->
<button popovertarget="user-menu">Tài khoản</button>
<div id="user-menu" popover>
  <a href="/profile">Hồ sơ</a>
  <a href="/logout">Đăng xuất</a>
</div>
```

### Đáp án mẫu

> "`z-index` chỉ có nghĩa trong cùng một stacking context. Header có `position: relative; z-index: 1` nên tạo một stacking context, dropdown 9999 chỉ cao nhất *bên trong* header, còn cả header được xếp như một khối với giá trị 1 — thấp hơn banner 10. Sửa đúng là nâng `z-index` của header, hoặc bỏ stacking context thừa, chứ tăng dropdown lên bao nhiêu cũng vô ích. Các tác nhân hay quên là `opacity` nhỏ hơn 1, `transform`, `filter`, `position: fixed/sticky`, và flex item có `z-index`. Trong dự án em quản lý z-index bằng token theo tầng, dùng `isolation: isolate` để mỗi component tự gói z-index của nó, và với dropdown, tooltip, modal thì ưu tiên `popover` hoặc `<dialog>` vì chúng vào top layer, thoát khỏi mọi stacking context."

---

## Câu 2: Block Formatting Context (BFC), `display: flow-root` và float/clearfix `[Intermediate]`

### Câu hỏi

> BFC là gì và giải quyết vấn đề gì? Ngày xưa người ta dùng clearfix với `::after` — giờ em làm thế nào?

### Giải thích lý thuyết

**Block Formatting Context** là một vùng layout độc lập, trong đó các block xếp dọc theo normal flow và **không tương tác** với bên ngoài. Một phần tử tạo BFC có 3 tính chất thực dụng:

1. **Chứa float** — chiều cao tính cả con float (không bị "sập" về 0).
2. **Chặn margin collapse** giữa nó và con của nó.
3. **Không đè lên float bên cạnh** — vùng BFC tự co lại nằm cạnh float (layout 2 cột kiểu cũ).

**Những gì tạo BFC:**

- `html` (root).
- `float` khác `none`.
- `position: absolute` hoặc `fixed`.
- `display: inline-block`, `table-cell`, `flow-root`.
- `overflow` khác `visible` và `clip` (`hidden`, `auto`, `scroll`).
- Flex item, grid item (bản thân container flex/grid tạo *flex/grid formatting context*, có hành vi tương tự về chứa con).
- `contain: layout`, `content`, `paint`.
- Multi-column container (`column-count`).

**Lịch sử float/clearfix:** trước flexbox (phổ biến khoảng 2015), layout nhiều cột dựa vào `float`. Float rút phần tử khỏi normal flow nên cha chỉ chứa float sẽ có chiều cao 0 — nền và border cha "sập". Các mẹo:

- `overflow: hidden` trên cha → tạo BFC, nhưng **cắt** mọi thứ tràn ra (tooltip, shadow, dropdown).
- **Clearfix** với `::after` + `clear: both` → thêm một "phần tử" ảo ở cuối để đẩy chiều cao.
- **`display: flow-root`** (Baseline từ 2020) — tạo BFC **không có tác dụng phụ**, chính là "clearfix chính thức".

Ngày nay `float` chỉ còn dùng đúng mục đích ban đầu: **cho chữ chảy quanh ảnh** trong bài viết (kết hợp `shape-outside` nếu muốn chữ ôm theo hình).

### Code minh hoạ

```css
/* Bug: cha chỉ chứa float → height 0, nền biến mất */
.media {
  background: #f5f5f5;
  border: 1px solid #ddd;
}
.media-img {
  float: left;
  width: 120px;
}

/* Cách 1 (cũ): overflow hidden — nhưng cắt shadow, dropdown tràn ra */
.media {
  overflow: hidden;
}

/* Cách 2 (cũ): clearfix */
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}

/* Cách 3 (chuẩn hiện nay): flow-root — BFC không tác dụng phụ */
.media {
  display: flow-root;
}
```

```css
/* Tính chất 3: BFC không đè lên float → media object 2 cột */
.media-img {
  float: left;
  margin-inline-end: 16px;
}
.media-body {
  display: flow-root; /* body nằm gọn bên phải ảnh, không chảy xuống dưới ảnh */
}
```

### Đáp án mẫu

> "BFC là một vùng layout độc lập: bên trong nó các block xếp theo normal flow và không ảnh hưởng ra ngoài. Ba tính chất em hay tận dụng: nó chứa được con float nên cha không bị sập chiều cao, nó chặn margin collapse giữa cha và con, và nó không đè lên float bên cạnh. Thời float layout, người ta tạo BFC bằng `overflow: hidden` — nhưng bị cắt shadow hay dropdown — hoặc dùng clearfix với `::after` và `clear: both`. Bây giờ có `display: flow-root`, tạo BFC mà không có tác dụng phụ nào, nên em dùng nó khi cần chứa float hoặc chặn margin collapse. Còn layout thì em dùng flex và grid, float chỉ giữ cho đúng việc ban đầu là cho chữ chảy quanh ảnh trong bài viết."

---

## Câu 3: Cascade layers — `@layer` `[Senior]`

### Câu hỏi

> Team em hay phải viết selector dài hoặc `!important` để đè style của thư viện UI. `@layer` giải quyết chuyện này thế nào? Có bẫy gì khi đưa vào codebase đang có?

### Giải thích lý thuyết

`@layer` (Baseline 2022 — Chrome 99, Firefox 97, Safari 15.4) thêm một bước vào cascade **nằm trước specificity**: khi hai declaration xung đột ở cùng origin, trình duyệt so **layer** trước. Layer thắng → xong, không cần so specificity nữa.

Quy tắc:

1. **Thứ tự layer** được xác định bởi lần **xuất hiện đầu tiên** của tên layer. Layer khai báo sau thắng layer khai báo trước.
2. **Style không nằm trong layer nào** (unlayered) được coi như một layer **cuối cùng** → thắng mọi layer (với declaration normal).
3. **Với `!important` thì đảo ngược**: `!important` ở layer **đầu tiên** mạnh nhất, và `!important` trong layer thắng `!important` ngoài layer. Thiết kế này để reset/base có thể "khoá" một giá trị.
4. Layer lồng nhau: `@layer framework.base`.
5. Đưa cả file vào layer: `@import url("lib.css") layer(vendor);`.
6. `revert-layer` — quay về giá trị của layer trước.

**Lợi ích thực tế:**

- Đặt CSS thư viện vào layer thấp → selector `.btn` một class của mình cũng thắng selector `.lib .btn.btn-primary:not(.disabled)` của thư viện.
- Kiến trúc rõ ràng: `reset → base → components → utilities`, utility class luôn thắng component mà không cần `!important`.
- **Tailwind CSS v4** dùng native cascade layers (`theme`, `base`, `components`, `utilities`) — hiểu `@layer` giúp debug khi style custom "không ăn".

**Bẫy khi migrate:**

- CSS cũ chưa bọc layer = unlayered = **thắng tất cả** layer. Nếu bọc CSS mới của mình vào layer còn CSS legacy/thư viện để ngoài, thư viện sẽ đè mình. Hướng đúng là đưa **thư viện** vào layer, hoặc bọc toàn bộ.
- Đừng quên thứ tự xác định ở lần xuất hiện đầu tiên — nếu file nạp trước dùng `@layer utilities` sớm, thứ tự bị lệch. Luôn khai báo thứ tự ở đầu entry CSS.
- Style inline và `!important` vẫn hoạt động theo luật origin như cũ.

### Code minh hoạ

```css
/* Khai báo thứ tự một lần, ở đầu file entry */
@layer reset, vendor, base, components, utilities;

/* Đưa thư viện vào layer thấp */
@import url("https://cdn.example.com/some-ui-lib.css") layer(vendor);

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
}

@layer components {
  .btn {
    padding: 0.5rem 1rem;
    background: var(--primary);
  }
}

@layer utilities {
  .hidden { display: none; }
  .mt-0   { margin-top: 0; }
}
```

```css
/* Layer thắng specificity */
@layer vendor {
  #app .toolbar .btn.btn-primary:not(.disabled) {
    background: blue;   /* (1,4,0) — nhưng ở layer vendor */
  }
}
@layer components {
  .btn {
    background: green;  /* (0,1,0) — layer sau → THẮNG */
  }
}

/* Unlayered thắng mọi layer */
.btn { background: red; } /* thắng cả hai bên trên */
```

```css
/* !important đảo chiều: layer đầu tiên mạnh nhất */
@layer reset {
  [hidden] { display: none !important; } /* không layer sau nào đè được, kể cả !important */
}
@layer components {
  .card { display: flex !important; }    /* thua [hidden] ở reset */
}
```

### Đáp án mẫu

> "`@layer` thêm một bước vào cascade nằm *trước* specificity: hai rule xung đột thì so layer trước, layer khai báo sau thắng, không cần quan tâm selector dài hay ngắn. Nên em đưa CSS thư viện vào một layer thấp như `vendor` bằng `@import ... layer(vendor)`, khi đó `.btn` một class của em trong layer `components` đã thắng selector bốn năm class của thư viện, không cần `!important`. Em khai báo thứ tự ngay đầu entry: `reset, vendor, base, components, utilities`. Hai bẫy: style không nằm trong layer nào thắng mọi layer, nên khi migrate dần mà bọc CSS mới vào layer còn CSS cũ để ngoài thì CSS cũ đè lên — phải bọc thư viện chứ không phải bọc code mình. Và `!important` đảo chiều: `!important` ở layer đầu mạnh nhất, dùng được để khoá kiểu `[hidden]` ở reset. Tailwind v4 dựa trên native layers nên hiểu cái này giúp debug rất nhanh."

---

## Câu 4: CSS nesting gốc vs Sass `[Intermediate]`

### Câu hỏi

> CSS giờ đã có nesting giống Sass. Vậy còn cần Sass không? Nesting gốc khác Sass ở những điểm nào dễ gây bug?

### Giải thích lý thuyết

**Native CSS nesting** Baseline từ cuối 2023 (Chrome 120, Safari 17.2, Firefox 117). Phiên bản đầu (Chrome 112, Safari 16.5) yêu cầu selector lồng phải bắt đầu bằng ký hiệu; từ Chrome 120 và Safari 17.2 đã "relaxed" — viết thẳng tên thẻ như `p` được.

**Khác biệt quan trọng với Sass:**

| | Sass | CSS gốc |
|---|---|---|
| Xử lý | Build time, ra CSS phẳng | Runtime trong trình duyệt |
| `&` ghép chuỗi (`&__title`, `&--active`) | ✅ | ❌ **Không hỗ trợ** — `&` là selector, không phải chuỗi |
| Ngữ nghĩa `&` | Thay thế văn bản | Tương đương `:is(parent)` |
| Specificity khi parent là danh sách | Tính theo từng selector sau khi trải phẳng | Lấy specificity **nặng nhất** của danh sách (do `:is()`) |
| Biến, mixin, function, `@each` | ✅ | ❌ (có custom properties, nhưng khác bản chất) |
| Lồng `@media`, `@supports`, `@container`, `@layer` | ✅ | ✅ |

**Bẫy specificity:** `#main, .card { .title & {} }` trong CSS gốc trở thành `.title :is(#main, .card)` → **mọi** phần tử khớp đều mang specificity của ID. Sass trải thành 2 selector riêng, mỗi cái specificity riêng.

**Bẫy BEM:** codebase Sass hay viết `.card { &__title {} &--active {} }`. Chuyển sang CSS gốc thì cú pháp này **không** cho ra `.card__title` — phải viết đầy đủ tên class.

**Còn cần Sass không?** Với dự án mới, nesting + custom properties + `color-mix()` + `@layer` đã bao phần lớn lý do dùng Sass. Sass vẫn có giá trị khi cần mixin, vòng lặp sinh class, function tính toán ở build time, hoặc codebase lớn đã dùng. Nhiều team chuyển sang PostCSS (hoặc Lightning CSS) để có nesting + autoprefixer, bớt một ngôn ngữ phải học.

**Khuyến nghị chung:** dù Sass hay gốc, giữ nesting **tối đa 2–3 cấp** — lồng sâu tạo selector dài, specificity cao, khó override.

### Code minh hoạ

```css
/* Native CSS nesting */
.card {
  padding: 1rem;
  border-radius: 8px;

  .title {              /* = .card .title */
    font-size: 1.25rem;
  }

  &:hover {             /* = .card:hover (bắt buộc & khi không có khoảng trắng) */
    box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
  }

  &.is-active {         /* = .card.is-active */
    border-color: var(--primary);
  }

  .dark-theme & {       /* = .dark-theme .card */
    background: #1e1e1e;
  }

  @media (width >= 768px) {
    padding: 2rem;
  }
}
```

```scss
// Sass — BEM ghép chuỗi
.card {
  &__title { font-weight: 600; }   // → .card__title
  &--featured { border: 2px solid gold; } // → .card--featured
}
```

```css
/* Native CSS: viết lại BEM — không ghép chuỗi được */
.card {
  &__title { }   /* ❌ KHÔNG ra .card__title */
}

.card__title { font-weight: 600; }      /* ✅ viết đầy đủ */
.card--featured { border: 2px solid gold; }

/* Bẫy specificity của & (ngữ nghĩa :is) */
#sidebar, .panel {
  .title & {
    color: red;   /* = .title :is(#sidebar, .panel) → specificity (1,1,0) cho cả .panel */
  }
}
```

### Đáp án mẫu

> "CSS gốc đã có nesting, Baseline từ cuối 2023, lồng được cả selector lẫn `@media`, `@container`. Nhưng nó khác Sass ở bản chất: Sass thay thế văn bản lúc build, còn `&` trong CSS gốc là một selector, tương đương `:is(parent)`. Hệ quả thứ nhất là không ghép chuỗi được — `&__title` kiểu BEM trong Sass không cho ra `.card__title` trong CSS gốc. Hệ quả thứ hai là specificity: nếu parent là danh sách có cả ID và class, mọi phần tử khớp đều mang specificity của ID. Với dự án mới em thường bỏ Sass, dùng nesting gốc hoặc PostCSS, cộng custom properties và `@layer` là đủ. Sass vẫn đáng giữ nếu cần mixin, vòng lặp sinh class hay đã có codebase lớn. Dù dùng gì em cũng giới hạn nesting 2–3 cấp để specificity không phình."

---

## Câu 5: `:has()` — parent selector và hiệu năng `[Senior]`

### Câu hỏi

> `:has()` cho phép làm những gì mà trước đây phải dùng JavaScript? Nó có ảnh hưởng hiệu năng không, em dùng có giới hạn gì?

### Giải thích lý thuyết

`:has(<relative selector>)` khớp phần tử nếu **có ít nhất một** phần tử thoả selector tương đối tính từ nó. Baseline từ tháng 12/2023 (Chrome 105, Safari 15.4, Firefox 121).

Không chỉ là "parent selector":

- **Chọn cha**: `.card:has(img)` — card có ảnh.
- **Chọn anh em đứng trước**: `h2:has(+ p)` — h2 nằm ngay trước một p (trước đây CSS chỉ chọn được anh em đứng *sau*).
- **Trạng thái form**: `form:has(:invalid)`, `label:has(input:checked)`.
- **Trạng thái toàn trang**: `body:has(dialog[open])` khoá cuộn; `:root:has(#dark-toggle:checked)` đổi theme.
- **Đếm số lượng con**: `.grid:has(> :nth-child(5))` — có từ 5 con trở lên.
- **Phủ định**: `.card:not(:has(img))`.

Specificity của `:has()` = đối số nặng nhất (giống `:is()`).

**Giới hạn theo spec:**

- Không lồng `:has()` trong `:has()`.
- Không dùng pseudo-element trong đối số (`:has(::before)` không hợp lệ).
- `:has()` **không** forgiving — một selector sai trong danh sách làm hỏng cả rule (từng forgiving ở bản nháp, đã đổi).

**Hiệu năng:** selector thông thường được so khớp từ phải sang trái và invalidation chỉ cần nhìn lên ancestor. `:has()` ngược lại: thay đổi ở **con cháu** có thể làm **ancestor** phải tính lại style. Các engine đã tối ưu mạnh (bloom filter, invalidation sets) nên dùng bình thường không vấn đề, nhưng cần tránh:

- Neo ở phần tử rất cao + đối số con cháu rộng: `body:has(.item:hover)` → mỗi lần hover bất kỳ đâu phải kiểm tra lại từ `body`.
- Đối số dùng descendant combinator mở (`:has(.x)`) khi chỉ cần con trực tiếp — ưu tiên `:has(> .x)` để giới hạn phạm vi.
- Trang có DOM rất lớn và thay đổi liên tục (list ảo hoá, bảng realtime).

Cách kiểm chứng: DevTools → Performance, xem thời gian *Recalculate Style*; Chrome có *Selector Stats* để thấy selector nào tốn.

### Code minh hoạ

```css
/* Card có ảnh → layout ngang, không ảnh → padding lớn hơn */
.card:has(> img) {
  display: grid;
  grid-template-columns: 120px 1fr;
}
.card:not(:has(> img)) {
  padding: 2rem;
}

/* Form validation thuần CSS */
.field:has(input:user-invalid) {
  --border: crimson;
}
.field:has(input:user-invalid) .error-msg {
  display: block;
}
form:has(:user-invalid) button[type="submit"] {
  opacity: 0.5;
}

/* Chọn anh em đứng TRƯỚC */
h2:has(+ .subtitle) {
  margin-bottom: 0.25rem;
}

/* Khoá cuộn khi dialog mở */
html:has(dialog[open]) {
  overflow: hidden;
}
```

```css
/* ⚠️ Tốn kém: neo ở body, đối số rộng, đổi liên tục khi hover */
body:has(.product-card:hover) .overlay {
  opacity: 1;
}

/* ✅ Thu hẹp phạm vi */
.product-list:has(> .product-card:hover) .overlay {
  opacity: 1;
}
```

### Đáp án mẫu

> "`:has()` khớp phần tử nếu bên trong nó — hoặc theo selector tương đối như `+` — có phần tử thoả điều kiện, Baseline từ cuối 2023. Ngoài chọn cha như `.card:has(img)`, nó còn chọn được anh em đứng trước, style theo trạng thái form như `form:has(:user-invalid)`, khoá cuộn khi `dialog` mở, hay đổi layout theo số lượng con — những việc trước đây phải viết JS thêm class. Về hiệu năng, selector thường chỉ cần nhìn lên ancestor, còn `:has()` làm thay đổi ở con cháu kéo theo tính lại style cho ancestor. Engine đã tối ưu nên dùng bình thường không sao, nhưng em tránh neo ở `body` hay `:root` với đối số rộng và thay đổi liên tục như `:hover`, ưu tiên `:has(> .x)` để giới hạn phạm vi, và đo bằng Recalculate Style trong DevTools nếu nghi ngờ. Cần nhớ không lồng `:has()` và nó không forgiving như `:is()`."

---

## Câu 6: Transition vs animation, `prefers-reduced-motion`, View Transitions `[Intermediate]`

### Câu hỏi

> Khi nào em dùng `transition`, khi nào dùng `@keyframes` animation? Làm sao để animation tôn trọng người dùng nhạy cảm với chuyển động? View Transitions API là gì?

### Giải thích lý thuyết

| | `transition` | `animation` + `@keyframes` |
|---|---|---|
| Kích hoạt | Cần **thay đổi giá trị** (hover, đổi class, đổi style) | Tự chạy khi áp dụng (hoặc khi đổi `animation-name`) |
| Số trạng thái | 2 (từ → đến) | Nhiều keyframe (`0%`, `40%`, `100%`) |
| Lặp | ❌ | ✅ `animation-iteration-count: infinite` |
| Điều khiển | Ít | `animation-play-state`, `direction`, `fill-mode`, `delay` |
| Use case | Hover, mở/đóng, đổi trạng thái UI | Loading spinner, skeleton shimmer, attention, intro |

Chung một nguyên tắc hiệu năng: animate `transform` và `opacity` (chỉ ảnh hưởng composite) thay vì `width`, `top`, `margin` (gây layout) — chi tiết ở phần rendering pipeline.

**`prefers-reduced-motion`**: người dùng bật "Reduce motion" trong hệ điều hành (người bị rối loạn tiền đình, chóng mặt khi thấy chuyển động lớn). WCAG 2.3.3 khuyến nghị cho phép tắt animation không thiết yếu. Hai chiến lược:

- **Tắt khi `reduce`** — dễ thêm vào codebase có sẵn.
- **Chỉ bật khi `no-preference`** — an toàn hơn mặc định (mobile-first cho motion).

"Reduce" **không** có nghĩa là bỏ hết: fade nhẹ (`opacity`) thường vẫn ổn, cần bỏ là parallax, zoom lớn, trượt toàn màn hình, auto-play.

**Bẫy `animation-fill-mode: forwards`**: giữ giá trị keyframe cuối, nếu là `transform` thì phần tử giữ stacking context và containing block vĩnh viễn — có thể làm hỏng `position: fixed` của con.

**View Transitions API**: tạo animation chuyển cảnh giữa hai trạng thái DOM. Trình duyệt chụp ảnh trạng thái cũ, chạy callback cập nhật DOM, rồi animate từ ảnh cũ sang trạng thái mới bằng pseudo-element `::view-transition-old()`/`::view-transition-new()` — style được bằng CSS.

- **Same-document** (SPA) với `document.startViewTransition()`: Chrome 111+, Safari 18+, Firefox 144+ (cuối 2025).
- **Cross-document** (MPA) với `@view-transition { navigation: auto; }`: Chrome 126+, Safari 18.2+; Firefox **chưa hỗ trợ** tại thời điểm viết — kiểm tra lại trên caniuse.
- Luôn feature-detect; trình duyệt không hỗ trợ vẫn cập nhật DOM bình thường, chỉ không có hiệu ứng.

### Code minh hoạ

```css
/* Transition: đổi trạng thái */
.btn {
  transition:
    background-color 150ms ease,
    transform 150ms ease;
}
.btn:hover {
  background-color: var(--primary-hover);
}
.btn:active {
  transform: scale(0.97);
}
```

```css
/* Animation: tự chạy, nhiều keyframe, lặp */
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s linear infinite;
}
```

```css
/* Chiến lược 1: tắt khi user yêu cầu */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Chiến lược 2: chỉ bật motion lớn khi user không phản đối */
@media (prefers-reduced-motion: no-preference) {
  .hero-image {
    animation: parallax-zoom 8s ease-in-out infinite alternate;
  }
}
```

```js
// View Transitions — same-document, có feature detection
function updateView(renderNewState) {
  if (!document.startViewTransition) {
    renderNewState();               // fallback: không hiệu ứng
    return;
  }
  document.startViewTransition(() => renderNewState());
}
```

```css
/* Đặt tên phần tử để morph giữa 2 trạng thái (thumbnail → ảnh lớn) */
.thumbnail.selected,
.detail-image {
  view-transition-name: product-image;
}

::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 250ms;
}

/* MPA (cross-document) — chưa có trên mọi trình duyệt */
@view-transition {
  navigation: auto;
}
```

### Đáp án mẫu

> "`transition` cần một thay đổi giá trị để kích hoạt và chỉ đi từ A đến B — em dùng cho hover, mở đóng menu, đổi trạng thái. `animation` với `@keyframes` tự chạy, có nhiều điểm dừng, lặp được và điều khiển được play-state — em dùng cho spinner, skeleton, hiệu ứng xuất hiện. Cả hai em đều chỉ animate `transform` và `opacity`, tránh `transition: all`. Về accessibility, em luôn có media query `prefers-reduced-motion`: hoặc tắt animation khi `reduce`, hoặc chỉ bật hiệu ứng lớn như parallax khi `no-preference`; fade nhẹ vẫn giữ được. View Transitions API thì trình duyệt chụp trạng thái cũ, cập nhật DOM rồi tự animate sang trạng thái mới, style được bằng các pseudo-element `::view-transition-*` và morph phần tử nhờ `view-transition-name`. Bản SPA với `startViewTransition` đã có trên cả ba engine lớn, bản cross-document thì Firefox chưa có, nên em luôn feature-detect và coi nó là progressive enhancement."

---

## Câu 7: Toolchain và tương thích — PostCSS, Autoprefixer, `@supports`, BEM `[Intermediate]`

### Câu hỏi

> Làm sao em đảm bảo CSS chạy được trên các trình duyệt team cần hỗ trợ? PostCSS, Autoprefixer, Sass khác nhau thế nào? Và ở team lớn em tổ chức tên class ra sao để không đè nhau?

### Giải thích lý thuyết

**Preprocessor vs postprocessor:**

| | Preprocessor (Sass, Less) | PostCSS |
|---|---|---|
| Input | Ngôn ngữ riêng (`.scss`) | CSS chuẩn (có thể có cú pháp tương lai) |
| Cơ chế | Compiler riêng | Parse CSS thành AST, chạy chuỗi **plugin** |
| Ví dụ | Biến, mixin, loop | Autoprefixer, `postcss-preset-env`, cssnano, Tailwind (v3 là plugin PostCSS) |

**Autoprefixer** đọc dữ liệu Can I Use + danh sách trình duyệt mục tiêu trong **`browserslist`** (trong `package.json` hoặc `.browserslistrc`) và chỉ thêm prefix cần thiết (`-webkit-`, …). Prefix ngày nay ít hơn nhiều so với 2015 vì trình duyệt đã chuyển sang feature flag thay vì prefix, nhưng vẫn còn một số chỗ như `-webkit-backdrop-filter` cho Safari cũ, `-webkit-line-clamp`, `-webkit-text-size-adjust`.

**`postcss-preset-env`** — "Babel cho CSS": hạ cấp cú pháp mới (nesting, `oklch()`, media query range syntax) về dạng trình duyệt cũ hiểu, theo `browserslist`. **Lightning CSS** (viết bằng Rust, Vite hỗ trợ) làm cả transpile + prefix + minify, nhanh hơn nhiều.

Lưu ý: polyfill CSS **không** làm được mọi thứ — `:has()`, container queries, `@layer` không thể biên dịch xuống tương đương đầy đủ. Đó là chỗ cần **progressive enhancement** với `@supports`.

**`@supports`** — feature query, áp style chỉ khi trình duyệt hỗ trợ:

- `@supports (display: grid)` — property + value.
- `@supports not (...)`, kết hợp `and` / `or`.
- `@supports selector(:has(a))` — kiểm tra selector.
- Trong JS: `CSS.supports("display", "grid")`.

Chiến lược: viết **baseline** chạy mọi nơi trước, rồi nâng cấp trong `@supports`. Ngoài ra, CSS tự bỏ qua declaration không hiểu → khai báo fallback **trước**, giá trị mới **sau**.

**BEM (Block\_\_Element--Modifier)** — quy ước đặt tên giúp:

- Specificity phẳng (luôn 1 class) → không cuộc chiến specificity.
- Đọc class là biết cấu trúc: `.card__title--large`.
- Không phụ thuộc cấu trúc DOM (không `.card div h2`).

Nhược: tên dài, vẫn phụ thuộc kỷ luật team. Ngày nay CSS Modules, Tailwind, hoặc `@scope` (Chrome 118, Safari 17.4; Firefox mới hỗ trợ gần đây — kiểm tra caniuse trước khi dùng) giải quyết bài toán phạm vi theo cách khác; BEM vẫn hay gặp ở codebase không dùng build tool hoặc design system viết CSS thuần.

### Code minh hoạ

```js
// postcss.config.js
export default {
  plugins: {
    "postcss-preset-env": { stage: 2 },
    autoprefixer: {},
    cssnano: process.env.NODE_ENV === "production" ? {} : false,
  },
};
```

```css
/* Fallback tự nhiên: trình duyệt bỏ qua dòng không hiểu */
.title {
  color: #3b82f6;                       /* fallback */
  color: oklch(62% 0.19 255);           /* trình duyệt mới dùng dòng này */
}

/* Progressive enhancement: baseline trước, nâng cấp sau */
.sidebar { width: 100%; }
@supports (container-type: inline-size) {
  .sidebar { container-type: inline-size; }
}

/* BEM: specificity luôn (0,1,0), không phụ thuộc cấu trúc DOM */
.card__title { font-size: 1.125rem; }
.card__button--primary { background: var(--primary); }
```

### Đáp án mẫu

> "Em bắt đầu từ `browserslist` — danh sách trình duyệt mục tiêu dùng chung cho cả CSS và JS. PostCSS là công cụ xử lý CSS chuẩn qua chuỗi plugin: Autoprefixer đọc browserslist và dữ liệu Can I Use để thêm prefix đúng chỗ cần, `postcss-preset-env` hạ cấp cú pháp mới như nesting hay `oklch()`. Sass là preprocessor — ngôn ngữ riêng có biến, mixin, loop, compile ra CSS. Nhưng có những thứ không biên dịch xuống được như `:has()` hay container queries, nên em viết baseline chạy mọi nơi rồi nâng cấp trong `@supports`, kể cả `@supports selector(...)`, và tận dụng việc trình duyệt bỏ qua declaration không hiểu để đặt fallback trước. Về đặt tên ở team lớn, nếu viết CSS thuần em dùng BEM để specificity luôn phẳng một class và tên class tự mô tả cấu trúc; còn dự án React thì CSS Modules hoặc Tailwind đã giải bài toán phạm vi nên không cần BEM."

---

## Câu 8: Hiệu năng CSS — render-blocking, critical CSS, selector cost `[Senior]`

### Câu hỏi

> CSS ảnh hưởng tới tốc độ tải trang như thế nào? Selector dài có làm trang chậm không? Em tối ưu CSS cho một landing page cần LCP tốt ra sao?

### Giải thích lý thuyết

**CSS là render-blocking:** trình duyệt không vẽ gì cho đến khi tải và parse xong mọi stylesheet chặn render trong `head` (để tránh FOUC). Ngoài ra CSS còn **chặn thực thi script đồng bộ** đứng sau nó (script có thể đọc style). Hệ quả: file CSS to hoặc chậm làm trễ First Paint và LCP.

Các kỹ thuật chính:

1. **Critical CSS** — inline phần CSS cần cho màn hình đầu (above-the-fold) vào `style` trong `head`, tải phần còn lại không chặn render. Công cụ: Critters/Beasties (dùng trong Angular, có plugin cho Vite/webpack), Next.js tự inline CSS của route. Đánh đổi: HTML nặng hơn, CSS inline không được cache riêng.
2. **Chia nhỏ theo route/media** — `link rel="stylesheet" media="print"` không chặn render; CSS theo route (code splitting) thay vì một file khổng lồ.
3. **Tránh `@import` trong CSS** — tạo chuỗi request tuần tự (tải file A mới biết cần file B). Dùng bundler gộp hoặc nhiều thẻ `link` song song.
4. **Loại CSS thừa** — Coverage tab của Chrome DevTools cho thấy % CSS không dùng; Tailwind JIT/v4 chỉ sinh class được dùng; PurgeCSS cho codebase cũ.
5. **Font** — `font-display: swap` hoặc `optional`, preload font chính, `size-adjust` trên `@font-face` fallback để giảm CLS khi font đổi.
6. **Minify + nén** — cssnano/Lightning CSS, Brotli trên server.

**Selector cost:** trình duyệt match selector **từ phải sang trái** — với `.nav ul li a`, nó lấy mọi `a` rồi đi ngược lên kiểm tra ancestor. Về lý thuyết selector descendant dài và key selector chung chung (`*`, `div`, `[class*="x"]`) đắt hơn. Thực tế với engine hiện đại, selector cost **hiếm khi** là nút thắt — trừ trang DOM rất lớn (hàng chục nghìn node) với style recalc liên tục. Nên đo trước khi tối ưu: DevTools Performance → *Recalculate Style*, và *Selector Stats* trong Chrome.

Thứ đắt thực sự thường là **layout và paint**: animate thuộc tính gây layout, `box-shadow`/`filter` lớn khi cuộn, DOM khổng lồ. Hai công cụ CSS giới hạn phạm vi tính toán (đã nói kỹ ở phần rendering, nhắc lại ngắn):

- **`contain: layout paint`** — báo trình duyệt thay đổi bên trong không ảnh hưởng bên ngoài.
- **`content-visibility: auto`** (Baseline 2024) — bỏ qua render phần ngoài màn hình; cần `contain-intrinsic-size` để giữ chiều cao, tránh nhảy scrollbar.

### Code minh hoạ

```html
<head>
  <!-- 1. Critical CSS inline — đủ cho hero + header -->
  <style>
    :root { --primary: #2563eb; }
    body { margin: 0; font-family: system-ui, sans-serif; }
    .header { height: 64px; display: flex; align-items: center; }
    .hero { min-height: 70svh; display: grid; place-items: center; }
  </style>

  <!-- 2. Preload font chính để tránh text nhảy -->
  <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />

  <!-- 3. CSS đầy đủ: không chặn render (pattern preload + onload) -->
  <link rel="preload" href="/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
  <noscript><link rel="stylesheet" href="/css/main.css" /></noscript>
</head>
```

```css
/* Selector: key selector (bên phải) quyết định phạm vi match */
.sidebar * { box-sizing: border-box; }    /* key = * → match mọi phần tử rồi kiểm tra ancestor */
.nav ul li a { color: inherit; }          /* lấy mọi a, đi ngược lên 3 cấp */
.nav__link { color: inherit; }            /* ✅ 1 class, nhanh và dễ override */

/* Giới hạn phạm vi layout/paint cho section dài */
.comment-list > .comment {
  content-visibility: auto;
  contain-intrinsic-size: auto 120px;
}
.widget {
  contain: layout paint;
}
```

### Đáp án mẫu

> "CSS mặc định chặn render: trình duyệt không vẽ gì cho tới khi có đủ CSSOM, và nó còn chặn script đồng bộ đứng sau. Nên với landing page cần LCP tốt, em inline critical CSS cho phần màn hình đầu ngay trong `head`, phần CSS còn lại tải không chặn render, chia CSS theo route, bỏ `@import` vì nó tạo chuỗi request tuần tự, preload font chính với `font-display: swap` và dùng `size-adjust` cho font fallback để giảm CLS. Em dùng Coverage tab để tìm CSS thừa. Về selector dài: trình duyệt match từ phải sang trái, nên key selector chung chung như `*` hay thẻ trần về lý thuyết đắt hơn, nhưng với engine hiện đại nó hiếm khi là nút thắt — em đo Recalculate Style trước rồi mới tối ưu. Cái đắt thật thường là layout và paint, ở đó em dùng `contain` và `content-visibility: auto` cho danh sách dài, kèm `contain-intrinsic-size` để thanh cuộn không nhảy."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                         | Đúng là                                                                       |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| "Tăng `z-index` lên 9999 là lên trên"                           | `z-index` chỉ so trong cùng stacking context — phải sửa ở ancestor           |
| "`z-index` chỉ tạo stacking context khi có `position`"          | Flex/grid item có `z-index`, `opacity` nhỏ hơn 1, `transform`, `filter` cũng tạo |
| "Clearfix bằng `overflow: hidden` là chuẩn"                     | Dùng `display: flow-root` — không cắt nội dung tràn                           |
| "`@layer` sau luôn thắng, kể cả `!important`"                   | Với `!important` thứ tự layer đảo ngược; style ngoài layer thắng mọi layer (normal) |
| "Native nesting y hệt Sass"                                     | `&` là `:is()`, không ghép chuỗi `&__elem`, specificity khác                  |
| "`:has()` chậm, không nên dùng"                                 | Đã tối ưu; chỉ tránh neo quá rộng với đối số thay đổi liên tục                |
| "`prefers-reduced-motion` = tắt hết animation"                  | Giữ fade nhẹ, bỏ chuyển động lớn (parallax, zoom, trượt)                       |
| "View Transitions đã chạy mọi nơi"                              | Same-document có trên cả 3 engine; cross-document Firefox chưa có — feature-detect |
| "Autoprefixer/PostCSS polyfill được mọi tính năng mới"          | `:has()`, container queries, `@layer` không hạ cấp được — dùng `@supports`   |
| "Selector dài là nguyên nhân chính khiến trang chậm"            | Hiếm khi; đo Recalculate Style trước — layout/paint và CSS render-blocking quan trọng hơn |

Tài liệu tham khảo: [MDN — Stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context), [MDN — Block formatting context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_display/Block_formatting_context), [MDN — @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer), [MDN — :has()](https://developer.mozilla.org/en-US/docs/Web/CSS/:has), [MDN — View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API), [web.dev — Extract critical CSS](https://web.dev/articles/extract-critical-css).
