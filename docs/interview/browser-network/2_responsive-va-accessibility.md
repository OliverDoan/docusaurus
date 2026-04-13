---
sidebar_position: 2
title: "2. Responsive Design, Media Queries, a11y, ARIA"
---

# Responsive Design, Media Queries, a11y, ARIA

Responsive design và accessibility (a11y) là hai chủ đề mà interviewer dùng để đánh giá bạn có phải là frontend developer "có tâm" hay không. Responsive thì ai cũng biết sơ sơ, nhưng hiểu sâu về mobile-first, các đơn vị responsive, và đặc biệt là accessibility -- đó mới là thứ tạo sự khác biệt.

---

## Câu 1: Mobile-first vs Desktop-first approach -- khác nhau thế nào và tại sao mobile-first được ưu tiên? `[Intermediate]`

### Giải thích lý thuyết

| | Mobile-first | Desktop-first |
|---|---|---|
| **Bắt đầu từ** | Thiết kế cho mobile trước | Thiết kế cho desktop trước |
| **Media queries** | Dùng `min-width` (thêm tính năng khi rộng hơn) | Dùng `max-width` (bớt tính năng khi hẹp hơn) |
| **CSS mặc định** | Styles cho mobile | Styles cho desktop |
| **Progressive enhancement** | Thêm dần từ đơn giản -> phức tạp | Bỏ bớt từ phức tạp -> đơn giản |
| **Performance** | Mobile tải ít CSS hơn | Mobile tải tất cả CSS rồi override |

**Tại sao mobile-first được ưu tiên:**
1. **Lượng truy cập mobile chiếm hơn 60%** thị trường toàn cầu
2. **Progressive enhancement** (thêm dần) dễ quản lý hơn graceful degradation (bỏ bớt)
3. **Performance tốt hơn**: mobile không phải load CSS dư thừa
4. **Force bạn suy nghĩ content-first**: mobile nhỏ buộc bạn ưu tiên nội dung quan trọng

### Code ví dụ

```css
/* Mobile-first: mặc định là mobile, thêm dần */
.container {
  padding: 16px;
  display: flex;
  flex-direction: column; /* Mobile: stack dọc */
}

/* Tablet trở lên */
@media (min-width: 768px) {
  .container {
    padding: 24px;
    flex-direction: row; /* Tablet: hàng ngang */
    flex-wrap: wrap;
  }
}

/* Desktop trở lên */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
}

/* Desktop-first (KHÔNG khuyến khích): mặc định là desktop, bỏ bớt */
.container-desktop-first {
  padding: 32px;
  max-width: 1200px;
  display: flex;
  flex-direction: row;
}

@media (max-width: 1023px) {
  .container-desktop-first {
    padding: 24px;
    flex-wrap: wrap;
  }
}

@media (max-width: 767px) {
  .container-desktop-first {
    padding: 16px;
    flex-direction: column;
  }
}
```

### Đáp án mẫu

> "Mobile-first nghĩa là CSS mặc định viết cho mobile, sau đó dùng `min-width` media queries để thêm styles cho màn hình lớn hơn. Desktop-first thì ngược lại -- viết cho desktop rồi dùng `max-width` để override cho mobile. Mobile-first được ưu tiên vì: phần lớn user dùng mobile, mobile load ít CSS hơn (performance tốt hơn), và nó buộc developer suy nghĩ content-first."

---

## Câu 2: Giải thích sự khác nhau giữa các responsive units: rem, em, vw, vh, và hàm clamp() `[Intermediate]`

### Giải thích lý thuyết

| Unit | Reference | Ví dụ | Use case |
|---|---|---|---|
| `px` | Cố định (absolute) | `font-size: 16px` | Khi cần chính xác pixel |
| `em` | Font-size của **parent element** | `padding: 1.5em` | Component-scoped sizing |
| `rem` | Font-size của **root** (`<html>`) | `font-size: 1.25rem` | Typography, spacing |
| `vw` | 1% **chiều rộng viewport** | `width: 50vw` | Full-width sections |
| `vh` | 1% **chiều cao viewport** | `height: 100vh` | Full-height hero |
| `%` | Kích thước **parent element** | `width: 50%` | Fluid layout |
| `clamp()` | Min, preferred, max | `font-size: clamp(1rem, 2.5vw, 2rem)` | Fluid typography |

**`clamp(min, preferred, max)`** là hàm CSS cực kỳ mạnh:
- Giá trị preferred được dùng khi nằm trong khoảng min-max
- Không bao giờ nhỏ hơn min hoặc lớn hơn max
- Thay thế hoàn toàn media queries cho typography responsive

### Code ví dụ

```css
/* rem vs em */
html {
  font-size: 16px; /* 1rem = 16px */
}

.parent {
  font-size: 20px;
}

.child-rem {
  font-size: 1.5rem;  /* = 24px (16 * 1.5) -- tham chiếu root */
  padding: 1rem;      /* = 16px */
}

.child-em {
  font-size: 1.5em;   /* = 30px (20 * 1.5) -- tham chiếu parent */
  padding: 1em;       /* = 30px (tham chiếu chính font-size của element!) */
}

/* Viewport units */
.hero {
  height: 100vh;        /* Full chiều cao viewport */
  width: 100vw;         /* Full chiều rộng viewport */
}

/* Cẩn thận: 100vh trên mobile bao gồm thanh address bar */
.hero-safe {
  height: 100dvh;       /* Dynamic viewport height -- trừ address bar */
}

/* clamp() -- fluid typography không cần media query */
h1 {
  /* Min: 24px, Preferred: 5vw, Max: 48px */
  font-size: clamp(1.5rem, 5vw, 3rem);
}

p {
  font-size: clamp(1rem, 1.2vw, 1.25rem);
}

/* clamp() cho spacing */
.section {
  padding: clamp(16px, 4vw, 64px);
}

/* clamp() cho container width */
.container {
  width: clamp(320px, 90vw, 1200px);
  margin: 0 auto;
}
```

### Đáp án mẫu

> "`rem` tham chiếu font-size của root element, `em` tham chiếu font-size của parent -- nên `rem` dễ dự đoán hơn, tôi dùng `rem` cho typography và spacing. `vw/vh` là phần trăm viewport, hữu ích cho hero section nhưng cẩn thận 100vh trên mobile. `clamp()` là hàm cho phép set min, preferred, max trong 1 dòng -- cực kỳ mạnh cho fluid typography và spacing mà không cần media query. Ví dụ: `font-size: clamp(1rem, 2.5vw, 2rem)` tự động scale theo viewport nhưng không bao giờ nhỏ hơn 1rem hoặc lớn hơn 2rem."

---

## Câu 3: Media queries -- breakpoints phổ biến, min-width vs max-width, và container queries `[Intermediate]`

### Giải thích lý thuyết

**Breakpoints phổ biến** (Tailwind CSS convention):

| Breakpoint | Pixel | Target |
|---|---|---|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

**Container Queries** (tính năng mới): Media queries dựa vào kích thước **viewport**, nhưng container queries dựa vào kích thước **parent container**. Điều này giải quyết vấn đề component cần responsive theo context mà nó nằm trong, không phải theo viewport.

### Code ví dụ

```css
/* Breakpoints với CSS custom properties */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}

/* Mobile-first breakpoints */
.card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .card {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .card {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Kết hợp nhiều điều kiện */
@media (min-width: 768px) and (max-width: 1023px) {
  /* Chỉ tablet */
  .sidebar {
    display: none;
  }
}

/* Orientation */
@media (orientation: landscape) and (max-height: 500px) {
  .hero {
    height: auto;
    min-height: 300px;
  }
}

/* Prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Prefers-color-scheme */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
  }
}

/* Container Queries (modern CSS) */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card-content {
    display: flex;
    flex-direction: row;
  }
}

@container card (max-width: 399px) {
  .card-content {
    display: flex;
    flex-direction: column;
  }
}
```

### Đáp án mẫu

> "Media queries kiểm tra điều kiện viewport để áp dụng CSS. Mobile-first dùng `min-width`, desktop-first dùng `max-width`. Breakpoints phổ biến: 768px (tablet), 1024px (laptop), 1280px (desktop). Tính năng mới hơn là container queries -- cho phép component responsive theo kích thước parent container thay vì viewport, rất hữu ích cho design system vì component có thể tự adapt theo context."

---

## Câu 4: Accessibility cơ bản -- semantic HTML, focus management, và tại sao nó quan trọng `[Intermediate]`

### Giải thích lý thuyết

**Accessibility (a11y)** là việc làm website sử dụng được bởi **tất cả mọi người**, bao gồm người khiếm thị, khiếm thính, hoặc gặp khó khăn về vận động.

**3 trụ cột a11y:**

1. **Semantic HTML**: Dùng đúng tag cho đúng mục đích
2. **Keyboard navigation**: Tất cả chức năng phải dùng được bằng bàn phím
3. **Screen reader support**: Nội dung phải được "đọc" được bởi screen reader

**Semantic HTML quan trọng vì:**
- Screen reader dựa vào tag để hiểu cấu trúc trang
- SEO engine cũng dựa vào semantic tags
- Browser cung cấp behavior mặc định (ví dụ: `<button>` tự focus được, `<div>` thì không)

| Anti-pattern | Semantic |
|---|---|
| `<div onclick="...">Click me</div>` | `<button>Click me</button>` |
| `<div class="header">` | `<header>` |
| `<span class="link">` | `<a href="...">` |
| `<div class="list"><div>Item</div></div>` | `<ul><li>Item</li></ul>` |
| `<b>Important</b>` | `<strong>Important</strong>` |

### Code ví dụ

```html
<!-- Anti-pattern: div soup -->
<div class="header">
  <div class="nav">
    <div class="nav-item" onclick="navigate('/')">Home</div>
    <div class="nav-item" onclick="navigate('/about')">About</div>
  </div>
</div>
<div class="main">
  <div class="article">
    <div class="title">My Article</div>
    <div class="content">Content here...</div>
  </div>
</div>
<div class="footer">Footer</div>

<!-- Semantic HTML -->
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>
<main>
  <article>
    <h1>My Article</h1>
    <p>Content here...</p>
  </article>
</main>
<footer>Footer</footer>
```

```css
/* Focus styles -- KHÔNG BAO GIỜ xóa focus outline mà không thay thế */

/* WRONG: Xóa focus outline */
*:focus {
  outline: none; /* Người dùng bàn phím không biết đang focus ở đâu! */
}

/* CORRECT: Custom focus style */
*:focus-visible {
  outline: 2px solid #4A90D9;
  outline-offset: 2px;
  border-radius: 2px;
}

/* focus-visible: chỉ hiện khi navigate bằng keyboard, không hiện khi click mouse */
button:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
}

/* Skip to content link */
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  padding: 8px 16px;
  background: #000;
  color: #fff;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

```javascript
// Focus management trong modal
function openModal(modalElement) {
  const previouslyFocused = document.activeElement;
  modalElement.setAttribute('aria-hidden', 'false');
  modalElement.style.display = 'block';

  // Focus vào element đầu tiên có thể focus trong modal
  const firstFocusable = modalElement.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (firstFocusable) {
    firstFocusable.focus();
  }

  // Khi đóng modal, trả focus về element trước đó
  modalElement.addEventListener('close', () => {
    modalElement.setAttribute('aria-hidden', 'true');
    if (previouslyFocused) {
      previouslyFocused.focus();
    }
  }, { once: true });
}

// Focus trap: giữ focus trong modal
function trapFocus(modalElement) {
  const focusableElements = modalElement.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstEl = focusableElements[0];
  const lastEl = focusableElements[focusableElements.length - 1];

  modalElement.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        lastEl.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastEl) {
        firstEl.focus();
        e.preventDefault();
      }
    }
  });
}
```

### Đáp án mẫu

> "Accessibility bao gồm 3 trụ cột: semantic HTML để screen reader hiểu cấu trúc trang, keyboard navigation để mọi chức năng dùng được bằng bàn phím, và ARIA attributes cho những trường hợp HTML không đủ diễn đạt. Quan trọng nhất là dùng đúng semantic tags -- `<button>` thay vì `<div onclick>`, `<nav>` thay vì `<div class='nav'>`. Không bao giờ xóa focus outline mà không thay thế, và dùng `focus-visible` thay vì `focus` để chỉ hiện outline khi navigate bằng keyboard."

---

## Câu 5: ARIA roles, states, và properties -- khi nào cần dùng, khi nào không? `[Senior]`

### Giải thích lý thuyết

**ARIA (Accessible Rich Internet Applications)** là bộ attributes bổ sung ngữ nghĩa cho HTML elements khi semantic HTML không đủ.

**Nguyên tắc vàng: "No ARIA is better than bad ARIA"** -- chỉ dùng ARIA khi semantic HTML không thể diễn đạt được.

**3 loại ARIA:**

| Loại | Ví dụ | Mục đích |
|---|---|---|
| **Roles** | `role="dialog"`, `role="alert"` | Định nghĩa element là gì |
| **States** | `aria-expanded`, `aria-checked` | Trạng thái hiện tại (thay đổi) |
| **Properties** | `aria-label`, `aria-describedby` | Thuộc tính bổ sung (thường cố định) |

**ARIA quan trọng nhất cần biết:**

| Attribute | Dùng khi |
|---|---|
| `aria-label` | Element không có visible text (icon button) |
| `aria-labelledby` | Element được label bởi element khác |
| `aria-describedby` | Mô tả bổ sung (error message, help text) |
| `aria-hidden="true"` | Ẩn khỏi screen reader (decorative content) |
| `aria-expanded` | Accordion, dropdown menu |
| `aria-live` | Nội dung thay đổi động (toast, notification) |
| `role="alert"` | Thông báo quan trọng, screen reader đọc ngay |

### Code ví dụ

```html
<!-- WRONG: ARIA khi đã có semantic HTML -->
<button role="button">Submit</button>
<!-- button đã có role="button" sẵn, thêm ARIA là thừa -->

<!-- CORRECT: ARIA cho icon button không có text -->
<button aria-label="Close dialog">
  <!-- Icon SVG ở đây -->
  <svg aria-hidden="true">...</svg>
</button>

<!-- CORRECT: aria-expanded cho accordion -->
<button
  aria-expanded="false"
  aria-controls="panel-1"
  id="accordion-1"
>
  Section 1
</button>
<div
  id="panel-1"
  role="region"
  aria-labelledby="accordion-1"
  hidden
>
  Panel content...
</div>

<!-- CORRECT: aria-live cho dynamic content -->
<div aria-live="polite" id="search-results-count">
  <!-- Screen reader sẽ thông báo khi nội dung thay đổi -->
</div>

<!-- CORRECT: Form với error handling accessible -->
<form>
  <label for="email">Email</label>
  <input
    id="email"
    type="email"
    aria-describedby="email-error email-hint"
    aria-invalid="true"
  />
  <span id="email-hint">We will never share your email.</span>
  <span id="email-error" role="alert">
    Please enter a valid email address.
  </span>
</form>

<!-- CORRECT: aria-hidden cho decorative content -->
<a href="/profile">
  <span aria-hidden="true">👤</span>
  My Profile
</a>

<!-- CORRECT: Custom dropdown accessible -->
<div role="combobox" aria-expanded="false" aria-haspopup="listbox">
  <input
    type="text"
    aria-autocomplete="list"
    aria-controls="options-list"
    aria-activedescendant="option-2"
  />
  <ul id="options-list" role="listbox">
    <li id="option-1" role="option">Option 1</li>
    <li id="option-2" role="option" aria-selected="true">Option 2</li>
    <li id="option-3" role="option">Option 3</li>
  </ul>
</div>
```

```javascript
// Cập nhật aria-live region khi search
function updateSearchResults(count) {
  const liveRegion = document.getElementById('search-results-count');
  liveRegion.textContent = `Found ${count} results`;
  // Screen reader sẽ tự động đọc nội dung mới vì aria-live="polite"
}

// Toggle accordion accessible
function toggleAccordion(button) {
  const isExpanded = button.getAttribute('aria-expanded') === 'true';
  const panelId = button.getAttribute('aria-controls');
  const panel = document.getElementById(panelId);

  button.setAttribute('aria-expanded', String(!isExpanded));

  if (isExpanded) {
    panel.setAttribute('hidden', '');
  } else {
    panel.removeAttribute('hidden');
  }
}
```

### Đáp án mẫu

> "ARIA bổ sung ngữ nghĩa khi semantic HTML không đủ. Có 3 loại: roles (element là gì), states (trạng thái hiện tại như expanded/checked), properties (thuộc tính bổ sung như label/describedby). Nguyên tắc quan trọng nhất: 'No ARIA is better than bad ARIA' -- ưu tiên semantic HTML trước, chỉ dùng ARIA cho custom components như accordion, dropdown, modal. Ví dụ: icon button cần `aria-label`, accordion cần `aria-expanded` + `aria-controls`, dynamic content cần `aria-live`."

---

## Câu 6: Làm sao test accessibility? Kể tên các tool và phương pháp `[Senior]`

### Giải thích lý thuyết

**Testing a11y gồm 3 tầng:**

| Tầng | Tool / Phương pháp | Phát hiện được |
|---|---|---|
| **Automated** | axe, Lighthouse, eslint-plugin-jsx-a11y | ~30% lỗi a11y (thiếu alt, contrast, ARIA sai) |
| **Semi-automated** | Screen reader (VoiceOver, NVDA), tab navigation | ~60% lỗi a11y (flow, context, keyboard) |
| **Manual** | User testing với người khuyết tật | 100% lỗi a11y (real experience) |

**Automated tools:**
- **axe DevTools** (browser extension): Scan page và report lỗi a11y
- **Lighthouse** (Chrome DevTools): Audit accessibility score
- **eslint-plugin-jsx-a11y**: Catch lỗi trong code (React)
- **Pa11y**: CI/CD integration

**Keyboard testing checklist:**
- Tab qua tất cả interactive elements
- Enter/Space activate buttons
- Escape đóng modal/dropdown
- Arrow keys navigate menu/list
- Focus visible ở mọi element

### Code ví dụ

```javascript
// Automated testing với axe-core trong Jest
// npm install @axe-core/react jest-axe

import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('component has no accessibility violations', async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  // Render component vào container
  container.innerHTML = `
    <nav aria-label="Main">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  `;

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// Playwright a11y testing
// playwright.config.ts
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('homepage should not have accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

// Keyboard navigation test
test('modal can be closed with Escape key', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="open-modal"]');
  await expect(page.locator('[role="dialog"]')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();

  // Verify focus returns to trigger element
  await expect(page.locator('[data-testid="open-modal"]')).toBeFocused();
});
```

### Đáp án mẫu

> "Test a11y gồm 3 tầng: automated tools như axe, Lighthouse phát hiện khoảng 30% lỗi (thiếu alt, contrast kém, ARIA sai). Semi-automated là dùng keyboard navigation và screen reader thử nghiệm. Manual testing với người dùng thực tế phát hiện phần còn lại. Trong dự án, tôi tích hợp axe-core vào CI/CD để catch lỗi sớm, dùng eslint-plugin-jsx-a11y trong development, và định kỳ test bằng VoiceOver/NVDA."

---

## Bảng so sánh responsive units

| Unit | Relative to | Cascading | Good for | Watch out |
|---|---|---|---|---|
| `px` | Absolute | No | Borders, shadows | Not responsive |
| `em` | Parent font-size | Yes (compounds!) | Component-scoped padding | Compounding: nested em multiply |
| `rem` | Root font-size | No | Typography, spacing | Only relative to root |
| `%` | Parent dimension | Yes | Widths | Height % needs parent height |
| `vw` | Viewport width | No | Full-width layouts | Includes scrollbar width |
| `vh` | Viewport height | No | Full-height sections | Mobile address bar issue |
| `dvh` | Dynamic viewport | No | Mobile full-height | Newer browsers only |
| `ch` | Width of "0" character | No | Prose max-width | Varies by font |
| `clamp()` | Mixed | No | Fluid typography | Needs min/max values |

---

## Lỗi thường gặp khi trả lời

1. **Nói "mobile-first chỉ là viết min-width"**: Mobile-first là cả một tư duy thiết kế, không chỉ là syntax. Nó bao gồm content priority, performance optimization, và progressive enhancement.

2. **Nhầm `em` compounding**: Khi dùng `em` lồng nhau, kích thước nhân lên. `1.2em` trong parent `1.2em` = `1.44em` so với gốc. Đây là lý do `rem` an toàn hơn.

3. **Nói "accessibility chỉ dành cho người khuyết tật"**: A11y giúp tất cả mọi người -- người dùng bàn phím, người dùng trong điều kiện ánh sáng yếu, người có tay bận (ôm em bé, đang lái xe). Nó cũng cải thiện SEO.

4. **Thêm ARIA vào tất cả mọi thứ**: "No ARIA is better than bad ARIA". `<button>` không cần `role="button"`. Chỉ dùng ARIA khi semantic HTML không đủ.

5. **Quên `100vh` trên mobile**: Trên mobile, `100vh` bao gồm cả thanh address bar nên content bị che. Dùng `100dvh` (dynamic viewport height) hoặc JavaScript để fix.

6. **Không biết container queries**: Đây là tính năng mới quan trọng. Nhiều bạn chỉ biết media queries dựa vào viewport, nhưng container queries cho phép component responsive theo parent container -- rất hữu ích cho design system.
