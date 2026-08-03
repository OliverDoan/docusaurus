---
sidebar_position: 2
title: "2. Responsive Design & Accessibility"
---

# Responsive Design & Accessibility

> *Accessibility ngày càng quan trọng — nhiều công ty lớn (Microsoft, Apple) coi đây là bắt buộc. Nếu trả lời "em chưa quan tâm a11y", interviewer thường loại.*

:::note[Ghi nhớ nhanh]

- ⭐ **Semantic HTML giải quyết 80% a11y miễn phí** — dùng `<button>` thay `<div onClick>` (focusable, Enter/Space, screen reader role); heading đúng cấp, landmark, `<label>` cho input.
- ⭐ **No ARIA tốt hơn bad ARIA** — chỉ dùng ARIA cho custom widget, labelling (`aria-label`), live region (`aria-live`), state (`aria-expanded`); không `aria-hidden` element focusable.
- **Mobile-first** — viết CSS mobile trước rồi `min-width` override; wrap hover style trong `@media (hover: hover)`.
- **Focus management cho modal** — move focus vào, focus trap, Escape đóng, restore focus, ẩn background (`inert`); ưu tiên `<dialog>` native.
- **Color contrast WCAG** — AA text thường `4.5:1`, text lớn `3:1`; không dùng màu đơn lẻ để truyền thông tin (thêm icon + text).
- **i18n không chỉ dịch** — còn direction (RTL), format date/number qua `Intl`, pluralization (ICU), font glyph, text length.

:::

---

## Câu 1: Mobile-first vs Desktop-first `[Intermediate]`

### Câu hỏi

> Em viết CSS responsive, em làm mobile-first hay desktop-first? Tại sao?

### Giải thích lý thuyết

**Mobile-first**: viết CSS cho mobile trước, dùng `min-width` để override cho viewport lớn hơn.

**Desktop-first**: ngược lại — CSS desktop làm base, `max-width` cho mobile.

Mobile-first thắng vì:
- Mobile chiếm >60% traffic. Tối ưu trước cho majority.
- Mobile CSS thường đơn giản hơn (1 column, ít animation) — base nhỏ.
- `min-width` cumulative dễ tracking.
- Network slow mobile — không tải CSS desktop thừa.

### Code minh hoạ

```css
/* ✅ Mobile-first */
.card {
  display: flex;
  flex-direction: column;
  padding: 16px;
}

@media (min-width: 768px) {
  .card {
    flex-direction: row; /* tablet ngang */
    padding: 24px;
  }
}

@media (min-width: 1024px) {
  .card {
    padding: 32px;
  }
}

/* ❌ Desktop-first — cumulative override khó tracking */
.card {
  display: flex;
  flex-direction: row;
  padding: 32px;
}

@media (max-width: 1023px) {
  .card { padding: 24px; }
}

@media (max-width: 767px) {
  .card {
    flex-direction: column;
    padding: 16px;
  }
}

/* Tailwind mobile-first */
<div className="flex flex-col p-4 md:flex-row md:p-6 lg:p-8">
  {/* mobile: column + p-4 */}
  {/* md (≥768px): row + p-6 */}
  {/* lg (≥1024px): p-8 */}
</div>
```

```css
/* Container query thay media query trong nhiều case */
.product-container {
  container-type: inline-size;
}

.product-card {
  display: flex;
  flex-direction: column;
}

@container (min-width: 400px) {
  .product-card {
    flex-direction: row;
  }
}

/* Modern: range syntax */
@media (400px <= width <= 800px) {
  /* chỉ trong khoảng */
}

/* Hover được hỗ trợ — tránh hover style trên touch device */
@media (hover: hover) {
  .button:hover {
    background: #e5e7eb;
  }
}
```

### Đáp án mẫu

> "Em mobile-first 100%. Lý do thực dụng: mobile traffic majority (60-70% với hầu hết app), CSS mobile thường đơn giản nên dùng làm base nhỏ. `min-width` query cộng dồn dễ tracking hơn `max-width` (mỗi rule đè rule trước). Mobile-first cũng buộc design tư duy 'essential first' — bỏ phần dễ skip. Em dùng Tailwind nên đi theo convention của Tailwind là mobile-first sẵn — `<div className='p-4 md:p-6 lg:p-8'>` rất natural. Modern CSS có **container queries** thay media queries cho component-level — card adapt theo parent size, không phụ thuộc viewport — đây mới là direction tương lai. Một trick em luôn dùng: `@media (hover: hover)` để wrap hover style — tránh hover stuck trên touch device khi tap (mobile hover bị 'stuck' đến khi tap chỗ khác)."

---

## Câu 2: Semantic HTML — tại sao quan trọng `[Intermediate]`

### Câu hỏi

> ```html
> <div onClick={handleClick}>Submit</div>
> ```
>
> Em chỉ ra lỗi và sửa.

### Giải thích lý thuyết

`<div>` với onClick có vài vấn đề nghiêm trọng:

1. **Không focusable** — keyboard user không Tab tới được.
2. **Không activate bằng Enter/Space** — chỉ có click mouse.
3. **Screen reader không announce là button**.
4. **Không có default style** indicating clickable.

Đúng là `<button>` — tự handle keyboard, focus, screen reader role.

Quy tắc lớn: **HTML semantic** giải quyết 80% accessibility miễn phí.

### Code minh hoạ

```html
<!-- ❌ Div với click -->
<div class="button" onclick="submit()">Submit</div>

<!-- Vấn đề:
- Tab key không reach
- Enter/Space không trigger
- SR announce: "Submit" (không phải button)
- Cần thêm role, tabindex, keyboard handler
-->

<!-- ✅ Native button -->
<button type="submit" onclick="submit()">Submit</button>
<!-- Tất cả accessibility miễn phí -->

<!-- Khi BẮT BUỘC dùng div (ví dụ legacy css) -->
<div
  role="button"
  tabindex="0"
  onclick="submit()"
  onkeydown="handleKey(event)"
  aria-label="Submit form"
>
  Submit
</div>

<script>
function handleKey(e) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    submit();
  }
}
</script>

<!-- Khác: link vs button -->
<!-- Link navigate đến URL khác -->
<a href="/profile">Profile</a>

<!-- Button thực hiện action -->
<button onclick="logout()">Logout</button>

<!-- ❌ Sai: link cho action -->
<a href="#" onclick="logout(); return false;">Logout</a>

<!-- Heading hierarchy đúng -->
<h1>Trang Chính</h1>
  <h2>Section 1</h2>
    <h3>Subsection</h3>
  <h2>Section 2</h2>
<!-- Không skip level: h1 → h3 -->

<!-- Landmark roles -->
<header>
  <nav>...</nav>
</header>
<main>
  <article>
    <h1>...</h1>
    <section>...</section>
  </article>
  <aside>...</aside>
</main>
<footer>...</footer>

<!-- Form với label -->
<label for="email">Email</label>
<input id="email" type="email" required />
<!-- hoặc -->
<label>
  Email
  <input type="email" required />
</label>
```

### Đáp án mẫu

> "Vấn đề: `<div>` không phải interactive element — keyboard user không Tab tới được, Enter/Space không trigger, screen reader announce như text bình thường. Phải làm thêm `role='button'`, `tabindex='0'`, keyboard handler, aria-label — verbose và dễ quên. Fix đúng: dùng `<button>`. Native button có tất cả miễn phí: focusable, Enter/Space activate, screen reader role 'button', default focus outline. Nếu styling button khác hẳn (ví dụ button trông giống link), em vẫn dùng `<button>` và override CSS, không downgrade về div. Quy tắc của em: **HTML semantic là accessibility free 80%**. Heading đúng hierarchy (không skip h1 → h3), landmark đúng (`<main>`, `<nav>`, `<aside>`), form input có `<label>` associate. Nếu phải dùng div cho lý do nào đó, phải fully implement — và đó là dấu hiệu refactor về element đúng."

---

## Câu 3: ARIA — khi nào dùng, khi nào không `[Senior]`

### Câu hỏi

> Em thấy nhiều code đầy `aria-label`, `role`, `aria-hidden`. Em hiểu nguyên tắc dùng ARIA không?

### Giải thích lý thuyết

5 nguyên tắc ARIA (W3C):

1. **No ARIA is better than bad ARIA** — sai ARIA tệ hơn không có.
2. **Don't change native semantics** — đừng `<button role="link">`.
3. **All interactive ARIA must be keyboard accessible**.
4. **Don't `aria-hidden` focusable element** — tab tới element ẩn bị confuse.
5. **All interactive elements must have an accessible name**.

Khi nào cần ARIA:
- Custom widget (modal, tab, menu, combobox) — bổ sung semantic.
- Live region cho dynamic content (notification, validation error).
- Hide decorative content khỏi screen reader (`aria-hidden`).

Khi KHÔNG cần ARIA:
- Có semantic HTML element rồi (đừng `<button role="button">`).

### Code minh hoạ

```html
<!-- ❌ Redundant ARIA -->
<button role="button">Click</button>             <!-- button đã có role -->
<a href="/x" role="link">Link</a>                <!-- a đã có role -->
<nav role="navigation">...</nav>                 <!-- nav đã có role -->

<!-- ✅ ARIA cho custom widget -->
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel-1">Tab 1</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">Tab 2</button>
</div>
<div id="panel-1" role="tabpanel">Content 1</div>
<div id="panel-2" role="tabpanel" hidden>Content 2</div>

<!-- aria-label khi không có visible label -->
<button aria-label="Close">×</button>            <!-- icon-only -->
<input type="search" aria-label="Search" />      <!-- không có visible label -->

<!-- aria-labelledby — reference visible text -->
<h2 id="dialog-title">Confirm action</h2>
<div role="dialog" aria-labelledby="dialog-title">...</div>

<!-- aria-describedby — extra context -->
<input type="password" aria-describedby="pw-help" />
<small id="pw-help">Tối thiểu 8 ký tự, có số</small>

<!-- aria-live cho dynamic content -->
<div aria-live="polite" aria-atomic="true">
  {validationError && <span>{validationError}</span>}
</div>
<!-- Screen reader announce khi content thay đổi, polite = chờ user idle -->

<!-- aria-hidden cho decorative -->
<span aria-hidden="true">✨</span> Welcome
<!-- Screen reader skip emoji decorative -->

<!-- KHÔNG aria-hidden element focusable -->
<button aria-hidden="true">Click</button>        <!-- ❌ user Tab tới nhưng SR skip → confusing -->

<!-- aria-expanded cho disclosure -->
<button aria-expanded="false" aria-controls="menu">
  Menu
</button>
<ul id="menu" hidden>...</ul>
```

```jsx
// React custom dropdown với ARIA
function Dropdown() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const items = ["Profile", "Settings", "Logout"];

  return (
    <>
      <button
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="dropdown-list"
        onClick={() => setOpen(!open)}
      >
        Menu
      </button>
      {open && (
        <ul
          id="dropdown-list"
          role="listbox"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") setActive((i) => Math.min(i + 1, items.length - 1));
            if (e.key === "ArrowUp") setActive((i) => Math.max(i - 1, 0));
            if (e.key === "Escape") setOpen(false);
          }}
        >
          {items.map((item, i) => (
            <li
              key={item}
              role="option"
              aria-selected={i === active}
              tabIndex={i === active ? 0 : -1}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// Hoặc dùng Radix UI / Headless UI — ARIA built-in
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
```

### Đáp án mẫu

> "Nguyên tắc số 1: **No ARIA tốt hơn bad ARIA**. Đừng add ARIA reflexively. Nếu có semantic HTML element rồi (`<button>`, `<nav>`, `<dialog>`), đừng thêm role redundant. ARIA chỉ cần cho: **custom widget** không có HTML element (tablist, combobox, listbox); **labelling** khi không có visible label (`aria-label` cho icon button); **live region** cho dynamic update (`aria-live` cho notification, validation error); **state** (`aria-expanded`, `aria-selected`, `aria-pressed`). Trap em thấy nhiều nhất: `aria-hidden` lên element focusable — user Tab tới nhưng screen reader skip, gây confused. Một solution thực tế: dùng **Radix UI / Headless UI** cho complex widget — ARIA built-in đúng theo APG (ARIA Authoring Practices Guide), test với screen reader thực, save công sức nhiều. Em ưu tiên `<dialog>` element native (HTML5) over custom modal — built-in focus trap, Escape close, backdrop, ARIA tự đúng."

---

## Câu 4: Keyboard navigation — focus management `[Senior]`

### Câu hỏi

> Modal hiện ra. Em phải làm gì với keyboard focus? Liệt kê các pattern.

### Giải thích lý thuyết

Khi modal/dialog open:

1. **Move focus into modal** — set focus vào element trong modal (thường button đầu tiên hoặc close button).
2. **Focus trap** — Tab/Shift+Tab cycle trong modal, không escape ra background.
3. **Escape to close** — keyboard convention.
4. **Restore focus** — khi modal close, return focus về element trigger.
5. **Hide background from SR** — `aria-hidden` hoặc inert attribute.

### Code minh hoạ

```jsx
// Custom modal với focus management
import { useEffect, useRef } from "react";

function Modal({ open, onClose, children }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    // 1. Lưu element đang focus
    previousFocusRef.current = document.activeElement;

    // 2. Focus vào modal
    const firstFocusable = modalRef.current.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    // 3. Focus trap
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();

      if (e.key === "Tab") {
        const focusables = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // 4. Restore focus
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <h2 id="modal-title">Confirm</h2>
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
}

// Cách tốt hơn: native <dialog>
function NativeModal({ open, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (open) ref.current?.showModal(); // built-in focus trap, Escape, backdrop
    else ref.current?.close();
  }, [open]);

  return (
    <dialog ref={ref} onClose={onClose}>
      {children}
    </dialog>
  );
}

// Modern: inert attribute để ẩn background
function App() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <main {...(modalOpen ? { inert: "" } : {})}>
        {/* Background nội dung */}
      </main>
      {modalOpen && <Modal onClose={() => setModalOpen(false)} />}
    </>
  );
}
// `inert` block focus + click + screen reader cho subtree
```

### Đáp án mẫu

> "5 thứ phải xử lý khi modal open: **move focus** vào modal (thường button đầu); **focus trap** — Tab/Shift+Tab cycle trong modal; **Escape to close**; **restore focus** về trigger element khi đóng; **hide background** với `inert` attribute hoặc `aria-hidden`. Native `<dialog>` element HTML5 đã handle 4/5 cái — em prefer dùng nó với `.showModal()` thay vì custom div modal. Inert attribute là feature ngon — apply lên main background, mọi child không focusable + không nhận click + screen reader skip — modal pattern an toàn. Cho custom widget khác (dropdown, autocomplete), em dùng **Radix UI / Headless UI** — họ đã solve focus management theo APG spec. Tự code rất dễ miss case: shift+tab từ first element không quay lại last, focus vào input đầu vs button đầu tuỳ context, focus visible với keyboard nhưng không hiện với mouse... Việc của em là maintain logic business, không reinvent focus trap."

---

## Câu 5: Color contrast và readability `[Senior]`

### Câu hỏi

> Designer đưa em palette với màu xám nhạt cho text. Em có concern gì về accessibility?

### Giải thích lý thuyết

**WCAG contrast ratio**:
- **AA**: text thường 4.5:1, text lớn (24px+ hoặc 19px+ bold) 3:1.
- **AAA**: 7:1 và 4.5:1.

Lý do quan trọng:
- 1 trong 12 nam giới color-blind (đỏ-xanh phổ biến nhất).
- Người già giảm visual acuity.
- Outdoor / sunlight reading.
- Low-quality monitor.

Cách check:
- Chrome DevTools > Inspect > Color picker → hiện contrast ratio + WCAG pass/fail.
- Lighthouse audit.
- Lib: axe-core, react-axe (dev only).

### Code minh hoạ

```css
/* ❌ Contrast quá thấp */
body {
  color: #999;        /* gray-500 */
  background: #fff;
}
/* Contrast: 2.85:1 — FAIL WCAG AA */

/* ✅ Contrast đạt AA */
body {
  color: #4b5563;     /* gray-600 */
  background: #fff;
}
/* Contrast: 7.5:1 — PASS AA + AAA */

/* Text trên image — cần overlay */
.hero-text {
  /* Trên background image: contrast không xác định */
}

.hero {
  position: relative;
  background-image: url(/hero.jpg);
}

.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.7));
}

.hero-text {
  position: relative; /* trên overlay */
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5); /* extra readability */
}

/* Không rely color alone — convey info */
/* ❌ Form error: chỉ đổi màu border red */
.input.error {
  border-color: red;
}
/* User color-blind không thấy gì khác */

/* ✅ Thêm icon + text */
.input.error {
  border-color: #dc2626;
  background: url(/icon-error.svg) no-repeat right;
  background-size: 16px;
  padding-right: 24px;
}
<input class="error" aria-invalid="true" aria-describedby="email-error" />
<span id="email-error" role="alert">
  <Icon name="error" /> Email không hợp lệ
</span>
```

```jsx
// Test contrast trong dev
// Install: yarn add -D @axe-core/react
import React from "react";
import ReactDOM from "react-dom";

if (process.env.NODE_ENV !== "production") {
  import("@axe-core/react").then(({ default: axe }) => {
    axe(React, ReactDOM, 1000);
  });
}
// Console sẽ log accessibility violation realtime

// Tailwind: dùng color scale 600+ cho text trên bg sáng
// gray-500 (#6b7280) contrast 4.83 — đủ AA
// gray-600 (#4b5563) contrast 7.5 — AAA
// gray-400 — FAIL
```

### Đáp án mẫu

> "Em raise concern ngay. WCAG AA yêu cầu contrast 4.5:1 cho text thường — gray-400 trên trắng (~3:1) FAIL, gray-500 (~4.8:1) vừa đủ, gray-600 (~7.5:1) AAA. Em dùng Chrome DevTools color picker check ratio trước khi accept palette. Không chỉ contrast — em cũng push back khi UI dùng **color alone** để convey info: ví dụ form error chỉ đổi border red, user color-blind không thấy gì khác. Phải thêm icon + text message với `role='alert'` cho screen reader. Trên image background, contrast biến đổi nên dùng overlay gradient + text-shadow để đảm bảo readable. Trong dev, em chạy `@axe-core/react` log violation realtime — catch sớm khi viết component. Lighthouse audit ở CI để không regression. A11y không phải nice-to-have — lawsuit Domino's năm 2019 mở precedent ở Mỹ, công ty lớn bắt buộc compliance."

---

## Câu 6: Internationalization (i18n) — beyond translation `[Senior]`

### Câu hỏi

> App em sắp ra thị trường Nhật và Ả Rập. Em chuẩn bị code thế nào?

### Giải thích lý thuyết

i18n không chỉ dịch text. Cần xử lý:

1. **Direction**: RTL (Ả Rập, Do Thái) cần CSS flip.
2. **Date/Time/Number format**: 27/05/2026 vs 5/27/2026 vs 2026年5月27日.
3. **Pluralization**: tiếng Anh 2 form (1 item, 2 items); tiếng Ả Rập 6 form; tiếng Nhật 1 form.
4. **Text length**: tiếng Đức dài hơn tiếng Anh ~30% → layout có thể vỡ.
5. **Currency, address format, phone format**.
6. **Font**: glyph cần font support (Latin font không có ký tự Nhật).

Tools: `next-intl`, `next-i18next`, `react-intl`, ICU MessageFormat.

### Code minh hoạ

```jsx
// next-intl
// messages/vi.json
{
  "greeting": "Xin chào, {name}!",
  "items": "{count, plural, =0 {Không có item} one {# item} other {# items}}",
  "lastSeen": "Lần cuối: {date, date, long}"
}

// messages/en.json
{
  "greeting": "Hello, {name}!",
  "items": "{count, plural, =0 {No items} one {# item} other {# items}}",
  "lastSeen": "Last seen: {date, date, long}"
}

// messages/ar.json
{
  "greeting": "مرحبا {name}!",
  "items": "{count, plural, zero {} one {} two {} few {} many {} other {}}"
}

// Component
import { useTranslations, useFormatter } from "next-intl";

function Greeting({ user }) {
  const t = useTranslations();
  const format = useFormatter();

  return (
    <div>
      <p>{t("greeting", { name: user.name })}</p>
      <p>{t("items", { count: user.itemCount })}</p>
      <p>{t("lastSeen", { date: user.lastSeen })}</p>
    </div>
  );
}

// Format Date/Time/Number với Intl built-in
new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(new Date());
// "27 tháng 5, 2026"

new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(150000);
// "150.000 ₫"

new Intl.RelativeTimeFormat("vi", { numeric: "auto" }).format(-1, "day");
// "hôm qua"

new Intl.PluralRules("ar").select(2); // "two"

// RTL support
// app/[locale]/layout.tsx
const RTL_LOCALES = ["ar", "he", "fa"];

export default function Layout({ children, params }) {
  const dir = RTL_LOCALES.includes(params.locale) ? "rtl" : "ltr";
  return (
    <html lang={params.locale} dir={dir}>
      <body>{children}</body>
    </html>
  );
}

// CSS — logical properties đã chuẩn bị RTL
.button {
  margin-inline-start: 8px; /* auto flip với dir=rtl */
}

// Font — load font support glyph
const inter = Inter({ subsets: ["latin", "vietnamese"] });
const noto_arabic = Noto_Sans_Arabic({ subsets: ["arabic"] });
const noto_jp = Noto_Sans_JP({ subsets: ["japanese"] });

// Apply theo locale
<html className={params.locale === "ar" ? noto_arabic.className : inter.className}>
```

### Đáp án mẫu

> "i18n không chỉ là dịch — em chuẩn bị 4 thứ. Thứ nhất, **dùng next-intl với ICU MessageFormat** để xử lý pluralization phức tạp — tiếng Ả Rập có 6 form số nhiều, tiếng Nhật chỉ 1. Format date/time/number qua `Intl.DateTimeFormat`, `Intl.NumberFormat`, `Intl.RelativeTimeFormat` built-in browser — không hardcode format. Thứ hai, **CSS với logical properties** (margin-inline-start thay margin-left) — code không phụ thuộc direction, set `dir='rtl'` trên html là auto flip. Thứ ba, **load font phù hợp** — Noto Sans Arabic cho Ả Rập, Noto Sans JP cho Nhật — Latin font không có glyph. Thứ tư, **layout flex** với gap thay margin — wrap text dài (tiếng Đức ~30% dài hơn tiếng Anh) mà không vỡ. Test với pseudo-locale (chuỗi 'L̂ǿŕèḿ' kéo dài 30%) trước khi launch — catch overflow bug sớm. Lastly: avoid string concatenation `'Hello ' + name` — luôn dùng template với placeholder để translator điều chỉnh thứ tự."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "ARIA fix mọi vấn đề a11y"                             | No ARIA > bad ARIA; semantic HTML giải quyết phần lớn                |
| "Mobile-first = phone-only"                            | Là design strategy — base mobile, progressive enhancement            |
| "Color contrast 4.5:1 là quá nghiêm"                   | Đây là minimum AA; nhiều user (color-blind, low vision) cần ratio cao hơn |
| "i18n chỉ là gắn string vào file translation"          | Còn pluralization, date format, direction, font, layout              |
| "Native `<button>` không style được"                   | Reset `appearance: none` rồi style như div — vẫn giữ a11y            |
