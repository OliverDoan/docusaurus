---
sidebar_position: 1
title: "1. CSS Layout & Modern Techniques"
---

# CSS Layout & Modern Techniques

> *CSS là phần dev React/Vue hay coi nhẹ — và là chỗ mất điểm nhiều nhất ở vòng phỏng vấn. Interviewer biết rõ.*

---

## Câu 1: Flexbox vs Grid — chọn cái nào? `[Intermediate]`

### Câu hỏi

> Em đang layout một dashboard có header, sidebar, main content, footer. Em chọn Flexbox hay Grid? Tại sao?

### Giải thích lý thuyết

| Khía cạnh           | Flexbox                       | Grid                              |
| ------------------- | ----------------------------- | --------------------------------- |
| Chiều               | 1D (row HOẶC column)          | 2D (row VÀ column)                |
| Use case            | Component (nav, card list)    | Page layout, complex region       |
| Sizing              | Linh hoạt theo content        | Grid track explicit               |
| Wrap                | `flex-wrap` đơn giản          | Auto-flow, không có wrap mode đặc biệt |
| Alignment           | Cross axis vs main axis       | Justify/align trên track           |

Quy tắc thực dụng:
- Linear layout (toolbar, button group, list) → **Flexbox**.
- 2D layout (page với header/sidebar/main) → **Grid**.
- Mix được — Grid container, item là Flex.

### Code minh hoạ

```css
/* Dashboard layout với Grid */
.dashboard {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 240px 1fr;
  grid-template-rows: 64px 1fr 48px;
  min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }

/* Responsive: stack trên mobile */
@media (max-width: 768px) {
  .dashboard {
    grid-template-areas:
      "header"
      "main"
      "footer";
    grid-template-columns: 1fr;
  }
  .sidebar { display: none; }
}
```

```css
/* Flexbox cho component */
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-spacer {
  flex: 1; /* đẩy phần sau sang phải */
}

/* Card với content stretch + footer dính bottom */
.card {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.card-body { flex: 1; } /* lấp đầy không gian */
.card-footer { /* dính bottom */ }
```

```css
/* Subgrid (modern, 2024+) — inherit grid của parent */
.parent {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.child {
  display: grid;
  grid-template-columns: subgrid; /* dùng cùng track của parent */
  grid-column: span 3;
}
```

### Đáp án mẫu

> "Dashboard 2D (header trên cùng, sidebar bên, main + footer) — em chọn **Grid** ngay. `grid-template-areas` cho phép vẽ layout như ASCII art, đọc rất dễ hiểu, responsive chỉ cần đổi template trong media query. Flexbox lý thuyết làm được nhưng phải nest container, code dài và khó maintain. Quy tắc của em: **Grid cho page-level layout, Flex cho component-level**. Trong từng cell của grid (ví dụ header), em dùng flex để align nav items + spacer + user menu. Modern CSS có **subgrid** giải case mà flex/grid không làm được — child grid inherit track của parent, align card content qua nhiều card. Em dùng nhiều khi có list card mà title/image/price phải align hàng ngang."

---

## Câu 2: `position: sticky` — cách hoạt động và bẫy `[Intermediate]`

### Câu hỏi

> Em viết `position: sticky; top: 0` cho header nhưng nó không sticky. Em debug thế nào?

### Giải thích lý thuyết

`sticky` hoạt động như `relative` cho đến khi scroll position đạt `top`/`bottom`/`left`/`right` offset, rồi chuyển sang `fixed` (relative to nearest scrolling ancestor).

3 lý do phổ biến không hoạt động:

1. **Parent có `overflow: hidden/auto/scroll`** — sticky bị clip trong parent đó, không sticky toàn page.
2. **Parent có `height` quá ngắn** — sticky chỉ stuck trong vùng parent, parent scroll xong là sticky kết thúc.
3. **Thiếu `top`/`bottom` offset** — phải có ít nhất một offset.

### Code minh hoạ

```css
/* Bug: parent overflow hidden */
.container {
  overflow: hidden; /* ❌ kill sticky */
}
.header {
  position: sticky;
  top: 0;
}

/* Fix: bỏ overflow hoặc dùng sticky inside scrollable parent */
.scrollable {
  overflow-y: auto;
  height: 100vh;
}
.scrollable .header {
  position: sticky;
  top: 0;
  background: white;
}

/* Sticky pattern: section header (giống iOS contact list) */
.list section {
  /* Mỗi section sticky bên trong nó */
}
.list h2 {
  position: sticky;
  top: 0;
  background: #eee;
  /* Stuck khi section đang được scroll */
}

/* Sticky table header */
.table thead {
  position: sticky;
  top: 0;
  z-index: 1; /* tránh content scroll che */
  background: white;
}

/* Sticky sidebar — đến giới hạn footer thì stop */
.sidebar {
  position: sticky;
  top: 64px; /* offset header */
  align-self: start; /* trong grid/flex parent */
  max-height: calc(100vh - 64px);
  overflow-y: auto;
}

/* Bẫy: parent flex/grid mà align-items default = stretch */
.layout {
  display: flex;
}
.layout .sidebar {
  position: sticky;
  top: 0;
  /* align-self: stretch (default) → sidebar height = parent height,
     không có chỗ để stuck → cần align-self: start */
  align-self: flex-start;
}
```

### Đáp án mẫu

> "Em check 3 thứ. Thứ nhất: **parent có `overflow: hidden/auto/scroll`** không — đây là 80% case. Sticky bị clip trong parent overflow, không sticky toàn page. Mở DevTools, walk up parent tree, tìm thấy overflow là phần lớn rồi. Thứ hai: **parent có đủ chiều cao** không — nếu parent height bằng sticky element thì sticky không có khoảng trống để stuck. Đặc biệt với flex/grid parent + sidebar sticky — phải `align-self: flex-start` thay vì stretch default. Thứ ba: phải có **`top`/`bottom`/`left`/`right` offset** ít nhất 1 giá trị. Một bẫy ít người biết: sticky **không** stuck globally — nó stuck **trong nearest scrolling ancestor**. Use case kinh điển: list section header sticky kiểu iOS contact — mỗi section header stuck trong section của nó, scroll qua section là header swap."

---

## Câu 3: Container Queries — game changer cho responsive `[Senior]`

### Câu hỏi

> Em đã dùng Container Queries chưa? Khác Media Queries thế nào? Use case thực tế?

### Giải thích lý thuyết

**Media Queries**: respond theo **viewport** (browser window).

**Container Queries**: respond theo **container element**. Component layout based on parent size, không phải viewport.

Use case: component có thể nằm ở sidebar (narrow) hoặc main (wide) — cùng viewport nhưng phải render khác. Media query không giải được.

Browser support: Chrome 105+, Safari 16+, Firefox 110+ — gần như universal 2024+.

### Code minh hoạ

```css
/* Khai báo container */
.card-container {
  container-type: inline-size; /* hoặc 'size' cho cả 2 chiều */
  container-name: card; /* optional, để target cụ thể */
}

/* Query container size */
.card {
  display: flex;
  flex-direction: column;
}

@container card (min-width: 400px) {
  .card {
    flex-direction: row; /* khi container đủ rộng, layout ngang */
  }
}

@container card (min-width: 600px) {
  .card {
    gap: 24px;
  }
  .card-title { font-size: 24px; }
}

/* So sánh với media query */
/* Media: theo viewport — không quan tâm card nằm đâu */
@media (min-width: 600px) {
  .card { flex-direction: row; }
}
/* Vấn đề: card trong sidebar (300px wide) vẫn áp dụng layout row vì viewport > 600px */

/* Container query units */
.card-title {
  font-size: clamp(16px, 5cqi, 32px); /* cqi = 1% container inline */
}

/* Use case thực tế: card component dùng ở nhiều chỗ */
.sidebar .card-container { /* container 300px */ }
.main .card-container    { /* container 800px */ }
/* Card tự adapt theo container, không cần biết viewport */
```

```jsx
// React component dùng container query
function ProductCard({ product }) {
  return (
    <div className="card-container">
      <div className="card">
        <img src={product.image} />
        <div className="card-body">
          <h3>{product.title}</h3>
          <p>{product.description}</p>
        </div>
      </div>
    </div>
  );
}

// Cùng component dùng ở 2 nơi → layout khác nhau theo container size
<Sidebar>
  <ProductCard product={p} />  {/* vertical layout */}
</Sidebar>
<Main>
  <ProductCard product={p} />  {/* horizontal layout */}
</Main>
```

### Đáp án mẫu

> "Container Queries là game changer thật sự. Media Query respond theo viewport — vấn đề khi cùng một component được dùng ở sidebar (narrow) và main (wide) với cùng viewport, layout sẽ giống nhau dù không phù hợp. Container Query respond theo container element trực tiếp chứa component. Em set `container-type: inline-size` trên parent, sau đó `@container (min-width: 400px) { ... }` query đó. Cùng card component: nằm trong sidebar 300px thì vertical layout; nằm trong main 800px thì horizontal — tự động. Em cũng dùng container query units: `cqi` (container inline 1%) cho font-size, padding scale theo container size — typography auto-responsive. Browser support đã universal từ 2024, không còn lý do không dùng. Đặc biệt phù hợp với design system: component thực sự self-contained, không phụ thuộc context."

---

## Câu 4: CSS Variables (Custom Properties) cho theming `[Senior]`

### Câu hỏi

> Em build dark mode và theme switcher. Em làm bằng CSS variables hay JS solution?

### Giải thích lý thuyết

CSS Variables (Custom Properties) là cách modern nhất để theming:

- **Live cascade** — đổi variable, mọi element dùng nó update.
- **Inheritable** — child element inherit variable từ parent.
- **Performant** — không cần re-render React.
- **JS interop** — đọc/ghi qua `getComputedStyle` và `style.setProperty`.

So với JS solution (theme provider truyền prop): variable đơn giản hơn, performance tốt hơn (không re-render), cascade rõ ràng.

### Code minh hoạ

```css
/* Define tokens */
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-primary: #3b82f6;
  --color-border: #e5e7eb;
  --space-1: 4px;
  --space-2: 8px;
  --space-4: 16px;
  --radius: 8px;
}

[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-text: #f1f5f9;
  --color-primary: #60a5fa;
  --color-border: #334155;
}

/* Hoặc dùng media query */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0f172a;
    /* ... */
  }
}

/* Sử dụng */
body {
  background: var(--color-bg);
  color: var(--color-text);
}

.button {
  background: var(--color-primary);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius);
}

/* Component-scoped variables */
.card {
  --card-padding: var(--space-4);
  padding: var(--card-padding);
}

.card.compact {
  --card-padding: var(--space-2); /* override */
}

/* Fallback value */
.element {
  color: var(--accent-color, #3b82f6); /* default nếu chưa khai báo */
}

/* Animation với variable */
.box {
  --tilt: 0deg;
  transform: rotate(var(--tilt));
  transition: transform 0.3s;
}
.box:hover {
  --tilt: 5deg; /* trigger transition */
}
```

```typescript
// Theme switcher với React
function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("theme") as any
        ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return [theme, setTheme] as const;
}

// Đọc/ghi từ JS
const accent = getComputedStyle(document.documentElement).getPropertyValue("--color-primary");
document.documentElement.style.setProperty("--color-primary", "#ff0066");

// Tránh FOUC (Flash of Unstyled Content) khi SSR
// app/layout.tsx — inject script trong <head>
<script
  dangerouslySetInnerHTML={{
    __html: `
      const theme = localStorage.getItem("theme") ?? "light";
      document.documentElement.setAttribute("data-theme", theme);
    `,
  }}
/>
```

### Đáp án mẫu

> "Em dùng CSS Variables 100%, không JS solution. Define tokens ở `:root` cho light theme, override trong `[data-theme='dark']`. Toggle theme = set attribute trên `<html>` — toàn bộ subtree update qua cascade, không React re-render, instant. Lưu choice vào `localStorage` để persist. Pattern em luôn dùng: inject inline script vào `<head>` để set theme **trước khi React hydrate** — tránh FOUC (flash light theme rồi đổi dark). Bonus: variable có thể scope component — `.card { --padding: 16px }`, override `.card.compact { --padding: 8px }`. Token system: spacing scale (`--space-1`, `--space-2`...), color (`--color-bg`, `--color-text`), radius, font-size — Tailwind v4 dựa heavily trên CSS variable này. Trade-off duy nhất: lookup variable nhanh nhưng có cost, deep nested + nhiều variable theoretically chậm hơn hardcode — thực tế không đáng lo."

---

## Câu 5: Logical Properties — viết CSS không phụ thuộc hướng `[Senior]`

### Câu hỏi

> App em sắp i18n sang tiếng Ả Rập (RTL). Em đã chuẩn bị CSS chưa? Logical properties là gì?

### Giải thích lý thuyết

CSS truyền thống dùng physical direction: `left`, `right`, `top`, `bottom`, `margin-left`, `padding-right`...

**Logical properties** dùng **flow direction**:
- `inline-start` / `inline-end` thay `left` / `right` (LTR).
- `block-start` / `block-end` thay `top` / `bottom`.
- `margin-inline-start` thay `margin-left`.

Khi `direction: rtl`, logical property tự đổi nghĩa — `inline-start` thành phải. Không cần viết CSS riêng cho RTL.

### Code minh hoạ

```css
/* ❌ Physical — phải duplicate cho RTL */
.card {
  margin-left: 16px;
  padding-right: 8px;
  border-left: 2px solid blue;
  text-align: left;
}

[dir="rtl"] .card {
  margin-left: 0;
  margin-right: 16px;
  padding-right: 0;
  padding-left: 8px;
  border-left: none;
  border-right: 2px solid blue;
  text-align: right;
}

/* ✅ Logical — tự đổi với direction */
.card {
  margin-inline-start: 16px;     /* margin-left ở LTR, margin-right ở RTL */
  padding-inline-end: 8px;       /* padding-right ở LTR */
  border-inline-start: 2px solid blue;
  text-align: start;             /* left ở LTR, right ở RTL */
}

/* Set direction theo lang */
html[lang="ar"], html[lang="he"] {
  direction: rtl;
}

/* Shorthand */
.box {
  margin-inline: 16px 8px;  /* start, end */
  padding-block: 12px 8px;  /* block-start (top), block-end (bottom) */
  inset-inline-start: 0;    /* left ở LTR */
}

/* Hơn nữa: writing mode (vertical text như tiếng Nhật/Trung dọc) */
.vertical-text {
  writing-mode: vertical-rl; /* viết dọc, từ phải sang trái */
}

/* Sizing logical */
.element {
  inline-size: 200px;  /* width ở horizontal writing mode */
  block-size: 100px;   /* height */
  min-inline-size: 100px;
  max-block-size: 50vh;
}
```

### Đáp án mẫu

> "Em đã chuyển sang logical properties cho mọi codebase từ 2023 — Browser support universal. Thay vì `margin-left/right`, em viết `margin-inline-start/end`. Thay vì `text-align: left`, viết `text-align: start`. Khi config `dir='rtl'` cho user Ả Rập, mọi spacing/border/alignment tự đổi mà không phải viết CSS RTL riêng. Tiết kiệm 30-40% rule CSS khi support i18n. Logical properties còn cover writing mode — tiếng Nhật viết dọc thì `block` = chiều ngang, `inline` = chiều dọc, code đúng dimension theo concept thay vì hard-code. Cho element fixed dimension dùng `inline-size` / `block-size` thay `width` / `height` — tương tự auto-adapt. Trade-off duy nhất: tên hơi dài và cần học, nhưng đáng đầu tư. Tailwind 3.3+ có util `ms-4` (margin-inline-start), `pe-2` (padding-inline-end) — chuyển dễ."

---

## Câu 6: CSS-in-JS vs Tailwind vs CSS Modules — chiến lược cho team `[Senior]`

### Câu hỏi

> Em chọn solution styling nào cho dự án mới? Lý do?

### Giải thích lý thuyết

| Solution                | Pros                                          | Cons                                              |
| ----------------------- | --------------------------------------------- | ------------------------------------------------- |
| CSS-in-JS (styled-components, Emotion) | Type-safe theming, scoped style, dynamic props | Runtime cost, SSR phức tạp, bundle to        |
| **Tailwind CSS**        | Utility-first, no naming, JIT compile, design system tích hợp | Class noise trong JSX, learning curve     |
| CSS Modules             | Native CSS, scoped, simple                    | Verbose, không có theming built-in                |
| Vanilla Extract / Linaria | Type-safe + zero-runtime                    | Setup phức tạp, less ecosystem                    |
| Plain CSS + BEM         | Universal, no tooling                         | Naming convention manual, không scope tự động     |

Trend 2024-2025: **Tailwind** dominate cho production app, đặc biệt với Next.js/Remix.

### Code minh hoạ

```jsx
// Tailwind
function Button({ variant = "primary", size = "md", children }) {
  const classes = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
  };
  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };
  return (
    <button className={`${classes[variant]} ${sizes[size]} rounded-md font-medium`}>
      {children}
    </button>
  );
}

// Với clsx + tailwind-variants để clean hơn
import { tv } from "tailwind-variants";

const button = tv({
  base: "rounded-md font-medium",
  variants: {
    variant: {
      primary: "bg-blue-600 hover:bg-blue-700 text-white",
      secondary: "bg-gray-200 hover:bg-gray-300",
    },
    size: { sm: "px-2 py-1 text-sm", md: "px-4 py-2", lg: "px-6 py-3 text-lg" },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

function Button({ variant, size, children }) {
  return <button className={button({ variant, size })}>{children}</button>;
}

// CSS-in-JS (styled-components)
import styled, { css } from "styled-components";

const Button = styled.button<{ variant: "primary" | "secondary" }>`
  border-radius: 8px;
  padding: 8px 16px;
  ${(p) => p.variant === "primary" && css`
    background: #3b82f6;
    color: white;
  `}
`;

// CSS Modules
// Button.module.css
.button { padding: 8px 16px; border-radius: 8px; }
.primary { background: #3b82f6; color: white; }

// Button.tsx
import styles from "./Button.module.css";
<button className={`${styles.button} ${styles.primary}`}>...</button>

// Vanilla Extract (zero-runtime CSS-in-TS)
// Button.css.ts
import { recipe } from "@vanilla-extract/recipes";

export const button = recipe({
  base: { padding: "8px 16px", borderRadius: 8 },
  variants: {
    variant: {
      primary: { background: "#3b82f6", color: "white" },
      secondary: { background: "#e5e7eb" },
    },
  },
});

// Compile-time: generate CSS file thật
```

### Đáp án mẫu

> "Em chọn **Tailwind CSS** cho mọi dự án mới. Lý do: thứ nhất, **utility-first** loại bỏ vấn đề naming (`.user-card-title-mobile` vs `.user-card-title-desktop` → just utilities). Thứ hai, **JIT** compile chỉ class dùng — bundle CSS rất nhỏ (~10kb thực tế). Thứ ba, **design system tích hợp** — spacing scale, color palette, breakpoints thống nhất trong `tailwind.config.ts`. Thứ tư, **performance** — không runtime cost như CSS-in-JS, không bị SSR mismatch. Em không recommend CSS-in-JS cho Next.js App Router — Server Component không tương thích nhiều lib (styled-components phải special config). CSS-in-JS có chỗ với React Native (StyleSheet) hoặc app legacy. Pattern em pair với Tailwind: `tailwind-variants` cho variants typed, `clsx` cho conditional class. Khi class quá nhiều trong JSX, em refactor thành component nhỏ hoặc dùng `@apply` cho repeated pattern (sparingly). Cho component library, **Vanilla Extract** đáng cân nhắc — type-safe + zero-runtime."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "Flexbox + nhiều nested div thay Grid được"            | Code phức tạp + khó maintain cho 2D layout                           |
| "`position: sticky` chỉ cần `top: 0` là đủ"            | Còn cần parent không overflow + đủ height                            |
| "Media query đủ cho responsive"                        | Component dùng nhiều container size cần container query              |
| "`!important` để override quickly"                     | Nên fix specificity, `!important` lan ra khó maintain                |
| "Tailwind chỉ tốt cho prototype"                       | Production scale với Vercel, Netflix, Notion all use Tailwind        |
