---
sidebar_position: 7
title: "7. CSS nền tảng"
---

# CSS nền tảng

> *Box model, cascade, specificity, đơn vị, containing block — những thứ "ai cũng biết" nhưng hỏi sâu một tầng là nhiều người trả lời sai. Interviewer dùng nhóm câu này để lọc người thật sự hiểu CSS với người chỉ quen copy class.*

:::note[Ghi nhớ nhanh]

- ⭐ **`box-sizing: border-box`** — `width` bao gồm padding + border; reset toàn cục bằng `*, *::before, *::after` `{ box-sizing: border-box }`. Margin không bao giờ nằm trong `width`.
- ⭐ **Thứ tự cascade** — origin + importance → context (shadow DOM) → inline style → `@layer` → specificity → thứ tự xuất hiện. Specificity chỉ là một bước giữa chừng, không phải tất cả.
- ⭐ **Specificity `(ID, class/attr/pseudo-class, type/pseudo-element)`** — so từ trái sang; `:is()`/`:not()`/`:has()` lấy specificity của đối số nặng nhất, `:where()` luôn bằng 0.
- **`inherit` / `initial` / `unset` / `revert`** — `unset` = `inherit` nếu thuộc tính kế thừa, ngược lại = `initial`; `revert` quay về style trình duyệt (UA), không phải giá trị khởi tạo của spec.
- **Đơn vị** — `rem` cho font/spacing (tôn trọng cài đặt cỡ chữ của user), `em` cho thứ scale theo chữ của chính component, `dvh`/`svh` thay `100vh` trên mobile, `clamp()` cho fluid typography.
- **Ẩn phần tử** — `display: none` (mất layout + a11y tree), `visibility: hidden` (giữ chỗ, không focus được), `opacity: 0` (giữ chỗ, vẫn click và focus được — bẫy a11y).
- **Containing block** — `absolute` theo ancestor positioned gần nhất; `fixed` theo viewport **trừ khi** ancestor có `transform`/`filter`/`perspective`/`contain: paint`…
- **Margin collapse** — chỉ margin dọc của block trong normal flow; không xảy ra trong flex/grid item, float, absolute, hoặc khi parent tạo BFC/có padding/border.

:::

---

## Câu 1: Box model và `box-sizing` `[Intermediate]`

### Câu hỏi

> Em set một card `width: 300px; padding: 20px; border: 2px solid`. Thực tế trên màn hình card rộng bao nhiêu? Vì sao gần như project nào cũng có dòng reset `box-sizing: border-box`?

### Giải thích lý thuyết

Mỗi phần tử là một hộp gồm 4 lớp từ trong ra ngoài: **content → padding → border → margin**.

`box-sizing` quyết định `width`/`height` áp vào lớp nào:

| `box-sizing`            | `width` đo cái gì                 | Card ở ví dụ rộng          |
| ----------------------- | --------------------------------- | -------------------------- |
| `content-box` (mặc định) | Chỉ content                       | 300 + 20×2 + 2×2 = **344px** |
| `border-box`            | Content + padding + border        | **300px** (content còn 256px) |

Margin **không bao giờ** nằm trong `width`, kể cả với `border-box`.

Vì sao `border-box` là chuẩn de-facto:

- Tư duy tự nhiên hơn: designer đưa "card rộng 300px" là tính cả padding/border.
- Kết hợp `%` dễ: `width: 50%` + padding không làm tràn layout 2 cột.
- Hầu hết CSS framework (Bootstrap, Tailwind Preflight, modern-normalize) đều reset sẵn.

Các điểm hay bị hỏi thêm:

- **Padding/margin theo `%` (kể cả chiều dọc) tính theo *chiều rộng* của containing block** — đây là nền tảng của "padding-top hack" cho tỉ lệ khung hình trước khi có `aspect-ratio`.
- **Inline element** (`span`, `a`): `width`/`height` không có tác dụng; padding/margin dọc không đẩy dòng xung quanh (padding vẫn vẽ nền chồng lên dòng khác). Muốn set kích thước → `inline-block` hoặc đổi `display`.
- **`outline` không chiếm chỗ** trong box model (khác `border`) — vì vậy focus ring bằng `outline` không làm layout nhảy.
- DevTools → tab *Computed* có sơ đồ box model, xem nhanh content/padding/border/margin thực tế.

### Code minh hoạ

```css
/* Reset chuẩn — kế thừa để component bên thứ 3 có thể override cục bộ */
html {
  box-sizing: border-box;
}
*,
*::before,
*::after {
  box-sizing: inherit;
}
```

```css
/* Padding % tính theo chiều rộng → khung 16:9 kiểu cũ */
.video-wrapper {
  position: relative;
  padding-top: 56.25%; /* 9 / 16 */
}
.video-wrapper iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* Cách hiện đại */
.video {
  aspect-ratio: 16 / 9;
  width: 100%;
}
```

### Đáp án mẫu

> "Mặc định `box-sizing` là `content-box` nên `width: 300px` chỉ là phần content — cộng padding 40 và border 4, card rộng **344px**, margin còn nằm ngoài nữa. Với `border-box`, `width` bao gồm cả padding và border nên card đúng 300px, content co lại còn 256px. Em luôn reset `border-box` toàn cục vì nó khớp cách designer đo, và khi kết hợp `width: 50%` với padding thì không bị tràn. Thêm hai chi tiết hay bị quên: margin không bao giờ tính vào `width`, và padding/margin theo phần trăm — kể cả chiều dọc — đều tính theo **chiều rộng** của containing block, đó là lý do trick `padding-top: 56.25%` từng được dùng cho video 16:9 trước khi có `aspect-ratio`."

---

## Câu 2: Specificity và cascade — CSS chọn rule nào khi xung đột? `[Intermediate]`

### Câu hỏi

> Hai rule cùng set `color` cho một nút: một rule `#header .btn`, một rule `.nav .menu .btn.primary`. Rule nào thắng? Nếu một rule nằm trong `@layer`, hoặc có `!important`, hoặc là inline style thì sao?

### Giải thích lý thuyết

Nhiều người trả lời "specificity cao hơn thắng" — chỉ đúng một phần. **Cascade** (theo CSS Cascading Level 5) so sánh theo thứ tự, dừng ở bước đầu tiên phân định được:

1. **Origin & importance** — từ yếu đến mạnh:
   - normal UA (trình duyệt) → normal user → normal author (CSS của mình)
   - → CSS animations (`@keyframes`)
   - → `!important` author → `!important` user → `!important` UA
   - → CSS transitions (mạnh nhất)
   - Chú ý: với `!important`, thứ tự origin **bị đảo ngược** — để user (ví dụ người cần chữ to) có quyền cuối.
2. **Context** — style trong shadow DOM vs light DOM.
3. **Element-attached styles** — thuộc tính `style="..."` thắng mọi selector (cùng origin & importance).
4. **Cascade layers (`@layer`)** — style không nằm trong layer thắng style trong layer; giữa các layer thì layer khai báo sau thắng (với `!important` thì đảo lại).
5. **Specificity**.
6. **Thứ tự xuất hiện** — rule đến sau thắng.

**Specificity** là bộ 3 số `(A, B, C)`, so từ trái sang, không "cộng dồn tràn cột":

| Thành phần                                              | Cột |
| ------------------------------------------------------- | --- |
| ID (`#header`)                                          | A   |
| Class, attribute (`[type="text"]`), pseudo-class (`:hover`) | B   |
| Type (`button`), pseudo-element (`::before`)            | C   |
| `*`, combinator (`>`, `+`, `~`, khoảng trắng), `:where()` | 0   |
| `:is()`, `:not()`, `:has()`                             | specificity của đối số nặng nhất |

Ví dụ câu hỏi:

- `#header .btn` → `(1, 1, 0)`
- `.nav .menu .btn.primary` → `(0, 4, 0)`
- 1 ID thắng **bao nhiêu class cũng được** → `#header .btn` thắng (nếu cùng origin, cùng layer, không có `!important`).

`!important` là "leo origin" chứ không phải cộng specificity — nó đưa declaration lên tầng importance cao hơn. Hai declaration đều `!important` thì lại so layer → specificity → thứ tự như bình thường.

### Code minh hoạ

```css
#header .btn            { color: red; }    /* (1,1,0) */
.nav .menu .btn.primary { color: blue; }   /* (0,4,0) → thua */

/* Thắng cả hai nhờ !important — nhưng mở ra cuộc chiến !important */
.btn { color: green !important; }

/* Hạ specificity có chủ đích */
:where(#header) .btn    { color: purple; } /* (0,1,0) — dễ override */
:is(#header, .x) .btn   { color: orange; } /* (1,1,0) — lấy đối số nặng nhất */
```

```css
/* Layer: style ngoài layer thắng mọi style trong layer, bất kể specificity */
@layer base, components;

@layer components {
  #app .card .title { color: navy; }  /* (1,2,0) nhưng nằm trong layer */
}

.title { color: crimson; }            /* (0,1,0) ngoài layer → THẮNG */
```

### Đáp án mẫu

> "Cascade không chỉ là specificity. Trình duyệt so lần lượt: origin và `!important` trước, rồi đến inline style, rồi cascade layers, rồi mới tới specificity, cuối cùng là thứ tự xuất hiện. Trong ví dụ, `#header .btn` là `(1,1,0)`, còn bốn class là `(0,4,0)` — ID luôn thắng vì so từ cột trái, không cộng dồn. Inline style thắng mọi selector normal, nhưng thua `!important`. Nếu một rule nằm trong `@layer` còn rule kia không, thì rule ngoài layer thắng bất kể specificity — đây là cách Tailwind v4 và các design system hiện đại kiểm soát thứ tự. Trong thực tế em tránh ID trong CSS, giữ specificity phẳng ở mức một class, dùng `:where()` khi viết reset hoặc style thư viện để người dùng override dễ, và chỉ dùng `!important` cho utility class kiểu `.hidden` hoặc khi phải đè style inline của bên thứ ba."

---

## Câu 3: Kế thừa — `inherit`, `initial`, `unset`, `revert` `[Intermediate]`

### Câu hỏi

> Vì sao set `color` cho `body` thì cả trang đổi màu, còn set `border` thì không? Phân biệt giúp anh `inherit`, `initial`, `unset`, `revert`. Khi nào em dùng `all: unset`?

### Giải thích lý thuyết

Mỗi property trong spec được định nghĩa là **inherited** hoặc **không inherited**:

- **Kế thừa mặc định**: phần lớn thuộc tính về chữ — `color`, `font-*`, `line-height`, `letter-spacing`, `text-align`, `visibility`, `cursor`, `list-style`, custom properties (`--x`).
- **Không kế thừa**: thuộc tính về hộp — `margin`, `padding`, `border`, `width`, `background`, `display`, `position`…

Khi không có declaration nào thắng cascade, property kế thừa sẽ lấy **computed value** của cha; property không kế thừa lấy **initial value** của spec.

Các keyword toàn cục (dùng được với mọi property):

| Keyword        | Ý nghĩa                                                                      |
| -------------- | ---------------------------------------------------------------------------- |
| `inherit`      | Ép lấy computed value của cha, kể cả property không kế thừa                   |
| `initial`      | Giá trị khởi tạo **của spec** (ví dụ `display: initial` là `inline`, không phải `block`) |
| `unset`        | Như `inherit` nếu property kế thừa, như `initial` nếu không                   |
| `revert`       | Quay về giá trị của origin trước đó — với CSS author thường là **style mặc định của trình duyệt** |
| `revert-layer` | Quay về giá trị của layer trước đó trong cùng origin                          |

Bẫy kinh điển: `div { display: initial }` → div thành `inline` vì initial value của `display` là `inline`. Muốn "trả về như trình duyệt mặc định" thì dùng `revert`.

Lưu ý thêm:

- Form control (`button`, `input`, `select`) **không kế thừa font** theo mặc định vì UA stylesheet đặt font riêng — nên reset hay có `font: inherit`.
- `line-height` nên dùng số không đơn vị (`1.5`) để con kế thừa **hệ số**, thay vì kế thừa giá trị px đã tính sẵn từ cha (gây chữ to bị dính dòng).
- `all` là shorthand reset mọi property (trừ `direction`, `unicode-bidi` và custom properties).

### Code minh hoạ

```css
body {
  color: #222;           /* kế thừa → mọi chữ trong trang */
  border: 1px solid red; /* KHÔNG kế thừa → chỉ body có viền */
}

/* Form control không kế thừa font → reset */
button,
input,
select,
textarea {
  font: inherit;
  color: inherit;
}

/* line-height: số không đơn vị */
.article  { font-size: 16px; line-height: 1.5; }   /* con h2 32px → line-height 48px ✅ */
.article2 { font-size: 16px; line-height: 24px; }  /* con h2 32px → vẫn 24px ❌ chữ dính */
```

```css
/* initial vs revert */
.reset-initial div { display: initial; } /* → inline ❌ bất ngờ */
.reset-revert  div { display: revert; }  /* → block (UA style) ✅ */

/* Nút "trần" để tự style từ đầu */
.btn-reset {
  all: unset;          /* xoá sạch style UA: border, background, padding... */
  cursor: pointer;
}
.btn-reset:focus-visible {
  outline: 2px solid currentColor; /* all: unset xoá luôn outline → phải trả lại! */
  outline-offset: 2px;
}
```

### Đáp án mẫu

> "Mỗi property được spec định nghĩa có kế thừa hay không. Nhóm liên quan đến chữ như `color`, `font`, `line-height` kế thừa, còn nhóm liên quan đến hộp như `border`, `margin`, `background` thì không — nên set `color` cho `body` thì cả trang đổi, còn `border` thì chỉ body có. Về keyword: `inherit` ép lấy giá trị của cha, `initial` lấy giá trị khởi tạo của spec — cẩn thận vì `display: initial` là `inline` chứ không phải `block`. `unset` là thông minh: kế thừa nếu property vốn kế thừa, ngược lại về initial. `revert` quay về style mặc định của trình duyệt, đó mới là cái người ta thường muốn khi nói 'reset'. Em dùng `all: unset` khi cần một nút trần để tự style, nhưng phải nhớ trả lại focus ring vì nó xoá luôn outline. Ngoài ra em luôn thêm `font: inherit` cho form control vì chúng không tự kế thừa font."

---

## Câu 4: Selector — combinator, attribute, pseudo-class vs pseudo-element, `:is()` vs `:where()` `[Intermediate]`

### Câu hỏi

> Phân biệt `.a .b`, `.a > .b`, `.a + .b`, `.a ~ .b`. Pseudo-class khác pseudo-element thế nào? `:is()` và `:where()` cùng cú pháp — khác nhau ở đâu và khi nào chọn cái nào?

### Giải thích lý thuyết

**Combinator:**

| Selector    | Chọn                                                       |
| ----------- | ---------------------------------------------------------- |
| `.a .b`     | `.b` là **con cháu bất kỳ cấp** của `.a`                   |
| `.a > .b`   | `.b` là **con trực tiếp** của `.a`                         |
| `.a + .b`   | `.b` là anh em **liền sau** `.a`                           |
| `.a ~ .b`   | `.b` là anh em **đứng sau bất kỳ** của `.a` (cùng cha)     |

CSS không có "anh em đứng trước" hay "chọn cha" bằng combinator — muốn vậy phải dùng `:has()`.

**Attribute selector:** `[href]`, `[type="email"]`, `[class~="x"]` (một từ trong danh sách), `[lang|="vi"]` (`vi` hoặc `vi-…`), `[href^="https"]` (bắt đầu), `[href$=".pdf"]` (kết thúc), `[href*="google"]` (chứa), thêm cờ `i` để không phân biệt hoa thường: `[type="email" i]`.

**Pseudo-class vs pseudo-element:**

| | Pseudo-class (`:`) | Pseudo-element (`::`) |
|---|---|---|
| Ý nghĩa | Chọn phần tử **có sẵn** ở một **trạng thái** | Tạo/chọn một **phần ảo** không có trong DOM |
| Ví dụ | `:hover`, `:focus-visible`, `:nth-child()`, `:checked`, `:disabled` | `::before`, `::after`, `::placeholder`, `::selection`, `::marker`, `::first-line` |
| Specificity | Cột B (như class) | Cột C (như type) |

`::before`/`::after` cần `content` (kể cả `content: ""`) mới render, và không hoạt động trên replaced element như `img`, `input`. Cú pháp một dấu `:before` vẫn chạy vì tương thích CSS2, nhưng chuẩn là `::`.

**`:is()` vs `:where()`** — cùng nhận một danh sách selector, cùng là **forgiving selector list** (một selector sai trong danh sách không làm hỏng cả rule), khác nhau duy nhất ở specificity:

- `:is(...)` = specificity của đối số **nặng nhất**.
- `:where(...)` = **luôn 0**.

→ `:where()` cho reset, base style, thư viện (người dùng override bằng một class đơn giản). `:is()` cho rút gọn selector trong code của mình khi vẫn muốn specificity bình thường.

**`:nth-child` vs `:nth-of-type`:** `:nth-child(2)` là "phần tử thứ 2 trong cha, *và* phải khớp selector phía trước"; `:nth-of-type(2)` là "phần tử thứ 2 *cùng loại thẻ*". Bản mới hỗ trợ `:nth-child(2 of .item)` (Baseline 2023).

### Code minh hoạ

```css
/* Combinator */
.menu a       { color: inherit; }        /* mọi link trong menu, mọi cấp */
.menu > li    { display: inline-block; } /* chỉ li cấp 1 */
h2 + p        { margin-top: 0; }         /* đoạn ngay sau h2 */
.error ~ .hint { display: none; }        /* mọi .hint sau .error */

/* "Lobotomized owl" — khoảng cách giữa các con liền nhau */
.stack > * + * {
  margin-block-start: 1rem;
}

/* Attribute */
a[href^="http"]:not([href*="mysite.com"])::after {
  content: " ↗";
}
a[href$=".pdf" i]::after {
  content: " (PDF)";
}
input[type="checkbox"]:checked + label {
  text-decoration: line-through;
}
```

```css
/* :is() rút gọn */
:is(article, section, aside) :is(h1, h2, h3) {
  line-height: 1.2;
}

/* :where() cho reset — specificity 0, override dễ bằng .title */
:where(ul, ol)[role="list"] {
  list-style: none;
  padding: 0;
}

/* So sánh specificity */
:is(#main, .content) p    { color: red; }  /* (1,0,1) */
:where(#main, .content) p { color: blue; } /* (0,0,1) */
.lead                     { color: green; }/* (0,1,0) thắng :where nhưng thua :is */

/* nth-child of S */
li:nth-child(2 of .visible) { font-weight: bold; } /* phần tử .visible thứ 2 */
```

### Đáp án mẫu

> "Bốn combinator: khoảng trắng là con cháu mọi cấp, `>` là con trực tiếp, `+` là anh em liền sau, `~` là mọi anh em đứng sau cùng cha. Pseudo-class chọn phần tử có thật đang ở một trạng thái như `:hover`, `:checked`, `:nth-child`; pseudo-element tạo ra phần ảo không có trong DOM như `::before`, `::placeholder`, `::marker` — khác cả về specificity: pseudo-class tính như class, pseudo-element tính như thẻ. `:is()` và `:where()` cùng gom danh sách selector và đều 'tha lỗi' nếu một selector trong đó không hợp lệ; khác biệt duy nhất là `:is()` lấy specificity của đối số nặng nhất, còn `:where()` luôn bằng 0. Em dùng `:where()` cho reset và style của thư viện để người dùng override bằng một class, còn `:is()` để rút gọn selector trong code của chính mình. Lưu ý `:is(#id, .x)` mang specificity của ID dù phần tử chỉ khớp `.x`."

---

## Câu 5: Đơn vị CSS — `px`, `em`, `rem`, `%`, `vw`/`vh`, `dvh`/`svh`/`lvh`, `clamp()` `[Intermediate]`

### Câu hỏi

> Em chọn đơn vị gì cho font-size, padding, chiều cao hero section? Vì sao `height: 100vh` trên iPhone hay bị tràn? `clamp()` dùng để làm gì?

### Giải thích lý thuyết

| Đơn vị       | Tham chiếu                                                                 | Dùng cho                                         |
| ------------ | -------------------------------------------------------------------------- | ------------------------------------------------ |
| `px`         | Pixel CSS (không phải pixel vật lý; 1px CSS có thể = 2–3 pixel thiết bị)   | Border, shadow, chi tiết không nên scale         |
| `rem`        | `font-size` của phần tử gốc `html`                                         | Font-size, spacing toàn hệ thống                 |
| `em`         | `font-size` của **chính phần tử** (riêng với `font-size` thì là của cha)   | Padding/icon scale theo chữ của component        |
| `%`          | Tuỳ property: `width` theo containing block, `font-size` theo cha, `transform: translate` theo **chính phần tử** | Layout linh hoạt |
| `vw` / `vh`  | 1% kích thước viewport (layout viewport)                                   | Hero, fluid size                                 |
| `svh` / `lvh` / `dvh` | Small / Large / Dynamic viewport height                           | Chiều cao full màn hình trên mobile              |
| `ch`         | Chiều rộng ký tự "0" của font hiện tại                                     | `max-width: 65ch` cho đoạn văn dễ đọc            |
| `cqi`        | 1% inline-size của container query gần nhất                               | Component responsive (xem phần container queries)|

**Vì sao `rem` cho font-size:** user có thể đổi cỡ chữ mặc định trong cài đặt trình duyệt (ví dụ 20px thay vì 16px). `rem` tôn trọng cài đặt này, `px` thì không (zoom vẫn hoạt động với px, nhưng *cài đặt cỡ chữ* thì không). Đây là yêu cầu a11y thực tế.

**Bẫy `em` lồng nhau:** `li { font-size: 1.2em }` trong list lồng 3 cấp → 1.2 × 1.2 × 1.2 = 1.728 lần. `rem` tránh được vì luôn tham chiếu root.

**Vấn đề `100vh` trên mobile:** thanh địa chỉ của Safari/Chrome mobile co giãn khi cuộn. `vh` truyền thống bằng chiều cao **lớn nhất** (thanh địa chỉ đã thu) → lúc mới vào trang, phần đáy hero bị che dưới thanh công cụ.

Ba đơn vị mới (Baseline 2023 — Chrome 108, Safari 15.4, Firefox 101):

- `svh` — viewport **nhỏ nhất** (thanh địa chỉ hiện đầy đủ) → luôn thấy hết nội dung.
- `lvh` — viewport **lớn nhất** (≈ hành vi `vh` cũ).
- `dvh` — **thay đổi động** theo trạng thái thanh địa chỉ → chính xác nhưng có thể gây layout shift/relayout khi cuộn; tránh dùng cho phần tử lớn hay animate.

Ngoài ra `100vw` **bao gồm thanh cuộn dọc** trên desktop (Windows) → `width: 100vw` gây thanh cuộn ngang. Dùng `width: 100%` khi có thể.

**`clamp(MIN, PREFERRED, MAX)`** = `max(MIN, min(PREFERRED, MAX))`. Phổ biến nhất cho **fluid typography**: chữ co giãn theo viewport nhưng không nhỏ/lớn quá ngưỡng. Nên trộn `rem` vào giá trị giữa (ví dụ `1rem + 2vw`) để zoom vẫn có tác dụng — chỉ dùng `vw` thuần thì zoom không phóng to chữ, vi phạm WCAG 1.4.4.

### Code minh hoạ

```css
body {
  font-size: 1rem;      /* = cài đặt của user, mặc định 16px */
  line-height: 1.5;
}

/* Button scale theo font-size của chính nó */
.btn {
  font-size: 1rem;
  padding: 0.5em 1em;   /* .btn-lg chỉ cần đổi font-size, padding tự scale */
  border: 1px solid;    /* border: px, không cần scale */
}
.btn-lg {
  font-size: 1.25rem;
}

/* Fluid typography */
h1 {
  font-size: clamp(1.75rem, 1rem + 3vw, 3.5rem);
}
```

```css
/* Hero full màn hình trên mobile */
.hero {
  min-height: 100vh;  /* fallback cho trình duyệt cũ */
  min-height: 100svh; /* không bị thanh địa chỉ che */
}

/* Modal/drawer muốn bám sát kích thước thật */
.drawer {
  height: 100dvh;
}

/* Tránh 100vw gây scroll ngang trên desktop */
.full-bleed {
  width: 100%;
}
```

### Đáp án mẫu

> "Em dùng `rem` cho font-size và spacing hệ thống vì nó tôn trọng cài đặt cỡ chữ của user — đó là yêu cầu accessibility, `px` thì bỏ qua cài đặt đó. `em` em dùng có chủ đích cho thứ cần scale theo chữ của chính component, ví dụ padding của button, và tránh `em` cho font-size lồng nhau vì nó nhân dồn. `px` để cho border, shadow. Về `100vh` trên mobile: `vh` tính theo viewport lớn nhất khi thanh địa chỉ đã thu lại, nên lúc mới vào trang đáy hero bị che. Giờ có `svh` — viewport nhỏ nhất, luôn thấy hết; `lvh` lớn nhất; và `dvh` đổi động theo thanh địa chỉ nhưng có thể gây relayout khi cuộn. Em thường dùng `min-height: 100svh` kèm fallback `100vh`. `clamp(min, preferred, max)` em dùng cho fluid typography, ví dụ `clamp(1.75rem, 1rem + 3vw, 3.5rem)` — phải trộn `rem` vào giữa, nếu chỉ dùng `vw` thì zoom không phóng to được chữ."

---

## Câu 6: Ẩn phần tử — `display: none` vs `visibility: hidden` vs `opacity: 0` `[Intermediate]`

### Câu hỏi

> Ba cách ẩn này khác nhau thế nào về layout, tương tác, screen reader và animation? Nếu muốn ẩn khỏi mắt nhưng screen reader vẫn đọc được thì làm sao?

### Giải thích lý thuyết

| | `display: none` | `visibility: hidden` | `opacity: 0` |
|---|---|---|---|
| Chiếm chỗ trong layout | ❌ Không (như không tồn tại) | ✅ Có | ✅ Có |
| Click / hover được | ❌ | ❌ | ✅ **Có** — bẫy click vào vùng "trống" |
| Tab focus được | ❌ | ❌ | ✅ **Có** — bẫy a11y |
| Screen reader đọc | ❌ | ❌ | ✅ Có |
| Con override được | ❌ (con không thể hiện ra) | ✅ con set `visibility: visible` sẽ hiện | ❌ (opacity nhân dồn) |
| Transition được | Truyền thống ❌, nay ✅ với `transition-behavior: allow-discrete` + `@starting-style` | ✅ (discrete, đổi ở đầu/cuối) | ✅ mượt |
| Chi phí khi bật/tắt | Gây layout lại | Chỉ paint | Thường chỉ composite |

Các cách khác cần biết:

- **`hidden` attribute** trong HTML ≈ `display: none` từ UA stylesheet — nhưng bị **bất kỳ** rule `display` nào của author đè lên (ví dụ `.card { display: flex }` làm `hidden` vô hiệu). Hay thêm reset `[hidden] { display: none !important; }`.
- **`aria-hidden="true"`** — ẩn khỏi screen reader nhưng vẫn hiển thị và vẫn focus được nếu là phần tử tương tác → không đặt lên phần tử focusable.
- **`inert` attribute** (Baseline 2023) — vô hiệu hoá tương tác, focus và a11y cho cả subtree; dùng cho phần nền phía sau modal tự làm.
- **`.sr-only` / `.visually-hidden`** — ẩn khỏi mắt nhưng screen reader vẫn đọc: label cho icon button, text "Mở menu", skip link.
- **`content-visibility: hidden`** — bỏ qua render nhưng giữ state render, bật lại nhanh (tab ẩn, list ảo).

**Animate từ/đến `display: none`** (Chrome 117+, Safari 17.4+, Firefox 129+ — Baseline 2024): `transition-behavior: allow-discrete` cho phép `display` đổi ở cuối transition, `@starting-style` định nghĩa trạng thái bắt đầu khi phần tử vừa hiện ra. Trình duyệt cũ chỉ đơn giản là không animate — progressive enhancement an toàn.

### Code minh hoạ

```css
/* Chuẩn visually-hidden — vẫn được screen reader đọc */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

/* Bảo vệ thuộc tính hidden khỏi bị display của author đè */
[hidden] {
  display: none !important;
}
```

```css
/* Bẫy opacity: 0 — menu "ẩn" vẫn chặn click và vẫn tab vào được */
.menu {
  opacity: 0;
  transition: opacity 0.2s;
}
.menu.open {
  opacity: 1;
}

/* Fix: kết hợp visibility — visibility cũng transition (discrete) */
.menu {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
}
.menu.open {
  opacity: 1;
  visibility: visible;
}
```

```css
/* Hiện đại: animate cả display: none (Baseline 2024) */
.toast {
  display: none;
  opacity: 0;
  transition:
    opacity 0.3s,
    display 0.3s allow-discrete;
}
.toast.show {
  display: block;
  opacity: 1;

  @starting-style {
    opacity: 0; /* trạng thái bắt đầu khi vừa từ none → block */
  }
}
```

### Đáp án mẫu

> "`display: none` gỡ phần tử khỏi layout và khỏi accessibility tree — không chiếm chỗ, không click, không focus, screen reader bỏ qua. `visibility: hidden` vẫn giữ chỗ nhưng không tương tác, không focus, không được đọc; đặc biệt con có thể set `visibility: visible` để hiện lại. `opacity: 0` chỉ trong suốt: vẫn chiếm chỗ, vẫn click được, vẫn tab vào được, screen reader vẫn đọc — đây là bẫy hay gặp với dropdown ẩn bằng opacity, user bàn phím tab vào link vô hình. Em hay kết hợp `opacity` với `visibility` để vừa có fade vừa không bị focus nhầm. Muốn ẩn khỏi mắt mà vẫn được đọc thì dùng class `.sr-only` với `clip-path` và kích thước 1px, chứ không phải `display: none`. Hiện tại đã animate được cả `display: none` nhờ `transition-behavior: allow-discrete` và `@starting-style`, trình duyệt cũ thì chỉ không có animation."

---

## Câu 7: `position` và containing block `[Senior]`

### Câu hỏi

> Giải thích 5 giá trị `position`. Phần tử `absolute` căn theo cái gì? Vì sao một modal `position: fixed` lại bị "kẹt" trong một card thay vì phủ cả màn hình?

### Giải thích lý thuyết

| `position`  | Trong normal flow? | Offset (`top`/`left`…) tính theo                    |
| ----------- | ------------------ | --------------------------------------------------- |
| `static`    | ✅ (mặc định)      | Không có tác dụng; `z-index` cũng không áp dụng (trừ flex/grid item) |
| `relative`  | ✅ giữ chỗ cũ      | Vị trí gốc của chính nó (dịch chuyển trực quan)     |
| `absolute`  | ❌ rút khỏi flow   | **Containing block** = padding box của ancestor positioned gần nhất (`position` khác `static`); không có thì là initial containing block |
| `fixed`     | ❌                 | Viewport — **trừ khi** có ancestor tạo containing block (xem dưới) |
| `sticky`    | ✅                 | Như `relative` cho đến ngưỡng, rồi dính trong scroll container gần nhất (chi tiết ở câu riêng về sticky) |

**Containing block** là hình chữ nhật mà kích thước `%` và offset của phần tử tham chiếu theo:

- `static`/`relative`/`sticky` → content box của block cha gần nhất.
- `absolute` → padding box của ancestor có `position` khác `static`.
- `fixed` → viewport.

**Ngoại lệ quan trọng (đây là ý Senior):** với cả `absolute` và `fixed`, ancestor có một trong các thuộc tính sau sẽ **trở thành containing block**:

- `transform` hoặc `perspective` khác `none` (kể cả `translate`, `scale`, `rotate` riêng lẻ)
- `filter` khác `none`, `backdrop-filter` khác `none`
- `contain: layout`, `contain: paint`, `strict`, `content`
- `will-change` chứa một trong các thuộc tính trên

Đó là lý do modal `fixed` nằm trong một card có `transform: translateY(...)` (do animation) hoặc `filter: blur()` sẽ bị định vị theo card và bị clip theo card nếu card có `overflow: hidden`.

Cách xử lý:

1. Render modal ra ngoài bằng **portal** (`createPortal` sang `document.body`).
2. Dùng `<dialog>` với `showModal()` hoặc `popover` — được đưa vào **top layer**, thoát hoàn toàn khỏi containing block, stacking context và overflow của tổ tiên.
3. Tránh để lại `transform` sau khi animation xong (`animation-fill-mode: forwards` để lại transform vĩnh viễn).

**`inset`** là shorthand cho `top`/`right`/`bottom`/`left`: `inset: 0` = phủ kín containing block. Với `absolute`, set cả `left` và `right` mà không set `width` → phần tử tự giãn theo.

### Code minh hoạ

```css
/* absolute theo ancestor positioned gần nhất */
.card {
  position: relative; /* tạo containing block cho badge */
}
.card .badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* Không có ancestor positioned → badge bay lên góc trang (initial containing block) */
```

```css
/* Bug: modal fixed bị kẹt trong card */
.card.animated {
  transform: translateY(0);     /* ← tạo containing block cho con fixed */
  overflow: hidden;
}
.card.animated .modal {
  position: fixed;
  inset: 0;                     /* phủ .card, KHÔNG phủ viewport ❌ */
}
```

```html
<!-- Fix hiện đại: dialog + showModal() → top layer -->
<dialog id="confirm">
  <p>Xoá mục này?</p>
  <form method="dialog">
    <button value="cancel">Huỷ</button>
    <button value="ok">Xoá</button>
  </form>
</dialog>

<script>
  document.querySelector("#confirm").showModal();
</script>
```

### Đáp án mẫu

> "`static` là mặc định, offset không có tác dụng. `relative` vẫn giữ chỗ trong flow, chỉ dịch về mặt hiển thị, và hay được dùng để làm mốc cho con `absolute`. `absolute` rút khỏi flow và căn theo padding box của ancestor gần nhất có `position` khác `static`. `fixed` căn theo viewport, `sticky` lai giữa relative và fixed trong scroll container. Ý quan trọng là khái niệm containing block: nếu một ancestor có `transform`, `filter`, `perspective`, `backdrop-filter`, `contain: paint` hoặc `will-change: transform`, nó trở thành containing block cho cả con `fixed` — nên modal `fixed` trong một card đang có transform do animation sẽ bị kẹt và bị clip theo card. Em xử lý bằng portal ra `body`, hoặc tốt hơn dùng `<dialog>` với `showModal()` hay popover để vào top layer, thoát khỏi mọi containing block và stacking context."

---

## Câu 8: Căn giữa phần tử — và margin collapse `[Intermediate]`

### Câu hỏi

> Kể các cách căn giữa một phần tử theo cả chiều ngang lẫn dọc, ưu nhược từng cách. Thêm nữa: vì sao em đặt `margin-top: 20px` cho thẻ `h1` đầu tiên trong một `section` mà cả `section` bị đẩy xuống?

### Giải thích lý thuyết

**Các cách căn giữa:**

| Cách | Ngang | Dọc | Ghi chú |
|---|---|---|---|
| `margin-inline: auto` | ✅ | ❌ | Block có `width` xác định (hoặc `fit-content`) |
| `text-align: center` | ✅ inline content | ❌ | Chỉ cho inline/inline-block bên trong |
| Flex: `justify-content` + `align-items: center` | ✅ | ✅ | Phổ biến nhất |
| Flex item `margin: auto` | ✅ | ✅ | Margin auto hấp thụ không gian thừa theo cả 2 trục |
| Grid: `place-items: center` | ✅ | ✅ | Ngắn nhất, 2 dòng |
| Grid: `place-content: center` | ✅ | ✅ | Căn cả khối track, khác `place-items` (căn từng item trong ô) |
| `absolute` + `inset: 0` + `margin: auto` | ✅ | ✅ | Cần kích thước xác định |
| `absolute` + `top: 50%; left: 50%` + `translate: -50% -50%` | ✅ | ✅ | Không cần biết kích thước; có thể làm chữ hơi mờ khi rơi vào nửa pixel |
| Block layout `align-content: center` | ❌ | ✅ | Mới (Baseline 2024): không cần flex/grid |

Lưu ý **"căn giữa không an toàn"**: khi nội dung lớn hơn container, `align-items: center` làm phần tràn lệch cả lên trên — phần đầu bị cắt và không cuộn tới được. Dùng `align-items: safe center` hoặc `margin: auto` trên item (margin auto tự an toàn).

**Margin collapse:** margin **dọc** của các block trong **normal flow** gộp lại thành một, lấy giá trị lớn nhất (nếu có số âm: max dương + min âm). Ba trường hợp:

1. **Anh em liền kề**: `margin-bottom: 30px` + `margin-top: 20px` → khoảng cách 30px, không phải 50px.
2. **Cha và con đầu/cuối**: nếu cha không có border, padding, nội dung inline, hoặc `height` ngăn cách → margin của con "xuyên" ra ngoài cha. Đây chính là bug ở câu hỏi: margin của `h1` gộp với margin của `section` và đẩy cả section.
3. **Block rỗng**: margin trên và dưới của chính nó gộp lại.

**Không** xảy ra collapse khi:

- Margin ngang (trái/phải).
- Flex item, grid item (lý do phụ khiến dev ít gặp bug này khi dùng flex/grid với `gap`).
- Phần tử `float`, `position: absolute/fixed`, `inline-block`.
- Cha tạo **Block Formatting Context** (`display: flow-root`, `overflow` khác `visible`) — với trường hợp cha/con.
- Có border hoặc padding ngăn giữa.

### Code minh hoạ

```css
/* 1. Grid — ngắn nhất */
.center-grid {
  display: grid;
  place-items: center;
  min-height: 100svh;
}

/* 2. Flex */
.center-flex {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 3. Flex + margin auto — an toàn khi nội dung tràn */
.center-safe {
  display: flex;
  min-height: 100svh;
}
.center-safe > .box {
  margin: auto;
}

/* 4. Absolute + translate — không cần biết kích thước */
.center-abs {
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
}

/* 5. Ngang thuần cho block */
.container {
  max-width: 1200px;
  margin-inline: auto;
}

/* 6. Block layout căn dọc, không cần flex (Baseline 2024) */
.center-block {
  align-content: center;
  min-height: 200px;
}
```

```html
<section class="hero">
  <h1 class="hero-title">Xin chào</h1>
</section>
```

```css
/* Bug: margin của h1 xuyên ra ngoài, đẩy cả section xuống, nền section không phủ khoảng đó */
.hero {
  background: #f5f5f5;
}
.hero-title {
  margin-top: 20px;
}

/* Fix 1: tạo BFC cho cha (không có tác dụng phụ) */
.hero {
  display: flow-root;
}

/* Fix 2: dùng padding cho cha thay vì margin cho con */
.hero {
  padding-top: 20px;
}
.hero-title {
  margin-top: 0;
}
```

### Đáp án mẫu

> "Căn giữa 2 chiều em hay dùng nhất là `display: grid; place-items: center`, hoặc flex với `justify-content` và `align-items: center`. Khi nội dung có thể dài hơn container, em dùng `margin: auto` trên flex item vì nó không đẩy nội dung tràn lên trên như `align-items: center`. Với overlay hay modal không biết kích thước thì `absolute`, `top/left: 50%` rồi `translate: -50% -50%`. Ngang cho block thì `margin-inline: auto`. Còn bug section bị đẩy xuống là **margin collapse**: margin dọc của block trong normal flow gộp lại, và margin-top của con đầu tiên xuyên qua cha khi cha không có padding, border hay tạo BFC. Em fix bằng `display: flow-root` trên cha, hoặc chuyển sang padding. Margin collapse không xảy ra với flex/grid item, float hay absolute — nên với layout hiện đại em ưu tiên `gap` thay cho margin giữa các phần tử."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                        | Đúng là                                                                    |
| -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| "`border-box` thì `width` gồm cả margin"                       | Margin không bao giờ nằm trong `width`, chỉ padding + border               |
| "Specificity cao hơn luôn thắng"                               | Origin, `!important`, inline style, `@layer` được xét **trước** specificity |
| "11 class thắng 1 ID"                                          | Specificity so theo cột, không cộng tràn — 1 ID thắng mọi số class         |
| "`!important` tăng specificity"                                | `!important` đổi tầng importance của origin, không đụng specificity        |
| "`initial` = style mặc định trình duyệt"                       | `initial` = giá trị khởi tạo của spec; muốn style UA thì dùng `revert`     |
| "`:where()` và `:is()` giống hệt nhau"                         | `:where()` specificity 0, `:is()` lấy đối số nặng nhất                     |
| "`100vh` là full màn hình trên mobile"                         | Trên mobile bị thanh địa chỉ che — dùng `svh`/`dvh`                        |
| "Dùng `px` cho font cũng được vì có zoom"                      | `px` bỏ qua cài đặt cỡ chữ của user; `rem` tôn trọng nó                    |
| "`opacity: 0` là ẩn"                                           | Vẫn click, vẫn focus, screen reader vẫn đọc                                |
| "`fixed` luôn theo viewport"                                   | Ancestor có `transform`/`filter`/`contain: paint` biến thành containing block |
| "Margin cha/con bị lỗi là bug trình duyệt"                     | Đó là margin collapse theo spec; fix bằng `flow-root`, padding, hoặc `gap` |

Tài liệu tham khảo: [MDN — Cascade](https://developer.mozilla.org/en-US/docs/Web/CSS/Cascade), [MDN — Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity), [MDN — Containing block](https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block), [web.dev — Large, small, and dynamic viewport units](https://web.dev/blog/viewport-units).
