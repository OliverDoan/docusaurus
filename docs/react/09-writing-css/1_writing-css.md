---
sidebar_position: 1
title: "1. Writing CSS trong React"
---

# Writing CSS trong React

---

## Mục lục

- [Tổng quan các cách](#tổng-quan-các-cách)
- [Tailwind CSS (khuyến nghị)](#tailwind-css-khuyến-nghị)
- [CSS Modules](#css-modules)
- [Styled Components / Emotion](#styled-components--emotion)
- [Panda CSS, vanilla-extract](#panda-css-vanilla-extract)
- [SASS/SCSS](#sassscss)

---

## Tổng quan các cách

| Phương pháp | Runtime | Khuyến nghị | Đặc điểm |
|-------------|---------|-------------|----------|
| **Tailwind CSS** | Không | **Có** | Utility-first, phổ biến nhất |
| **CSS Modules** | Không | Có | Scope tự động, đơn giản |
| **Panda CSS** | Không | Có | Type-safe, zero-runtime |
| **vanilla-extract** | Không | Có | TypeScript-first |
| **Styled Components** | **Có** | Cân nhắc | CSS-in-JS, runtime cost |
| **Emotion** | **Có** | Cân nhắc | Tương tự Styled Components |
| **SASS/SCSS** | Không | Tùy | Vẫn dùng được với React |

---

## Tailwind CSS (khuyến nghị)

[Tailwind](https://tailwindcss.com) — utility-first CSS framework.

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```jsx
function Button({ children, primary }) {
  return (
    <button className={`
      px-4 py-2 rounded font-medium
      ${primary ? "bg-blue-600 text-white" : "bg-gray-200"}
      hover:opacity-80
    `}>
      {children}
    </button>
  );
}
```

Pattern với `clsx` / `cn`:

```jsx
import clsx from "clsx";

function Button({ primary, disabled, children }) {
  return (
    <button className={clsx(
      "px-4 py-2 rounded font-medium",
      primary && "bg-blue-600 text-white",
      disabled && "opacity-50 cursor-not-allowed"
    )}>
      {children}
    </button>
  );
}
```

:::info[Phân tích]

**Tại sao Tailwind thắng?**

1. **No naming overhead** — không phải nghĩ tên class.
2. **Co-location** — style ngay tại JSX, không nhảy file.
3. **Tree-shaking** — chỉ build CSS class đã dùng → bundle nhỏ.
4. **Consistent** — design system built-in (spacing, color scale).
5. **Responsive dễ** — `md:`, `lg:` prefix.
6. **Dark mode dễ** — `dark:` prefix.
7. **Editor tooling** — IntelliSense extension cực mạnh.

Phản đối thường gặp:

- "Class name quá dài" → đúng, dùng `clsx` + extract pattern (`btn`,
  `btn-primary`).
- "Khó đọc" → quen sau vài tuần.
- "Mixing concerns" → utility-first là cố ý — đổi tư duy.

Năm 2026, **Tailwind v4** (alpha→stable) đã ra với CSS-first config,
nhanh hơn nhiều, syntax mới hơn.

:::

---

## CSS Modules

Built-in trong Vite/Next/CRA — không cần cài thêm.

```css
/* Button.module.css */
.button {
  padding: 8px 16px;
  border-radius: 4px;
}

.primary {
  background: blue;
  color: white;
}
```

```jsx
import styles from "./Button.module.css";

function Button({ primary, children }) {
  return (
    <button className={`${styles.button} ${primary ? styles.primary : ""}`}>
      {children}
    </button>
  );
}
```

CSS Module **tự generate unique class name** → tránh xung đột global.

Phù hợp:

- Team quen viết CSS truyền thống.
- Component có style phức tạp (animation, pseudo-class).
- Không muốn dependency thêm.

---

## Styled Components / Emotion

CSS-in-JS — viết CSS thẳng trong JS file.

```bash
npm install styled-components
```

```jsx
import styled from "styled-components";

const Button = styled.button`
  padding: 8px 16px;
  background: ${props => props.primary ? "blue" : "gray"};
  color: white;
`;

<Button primary>Save</Button>
```

:::warning[Cần lưu ý]

**CSS-in-JS đang giảm phổ biến từ 2023+**. Lý do:

1. **Runtime cost** — generate CSS string runtime, slow on hydration.
2. **Server Components** không support tốt — phần lớn CSS-in-JS lib không
   compat với React Server Components.
3. **Bundle size** — runtime ~10-30KB.
4. **Maintain mode** — Styled Components đã giảm update.

Lựa chọn thay thế:

- **Tailwind** — utility, không runtime.
- **CSS Modules** — vanilla CSS, không runtime.
- **vanilla-extract** — type-safe, compile-time.
- **Panda CSS** — type-safe, atomic CSS compile-time.

Project mới năm 2026 **không nên chọn Styled Components / Emotion** trừ
khi có lý do rõ.

:::

---

## Panda CSS, vanilla-extract

**Panda CSS** — type-safe utility-CSS, compile-time, không runtime cost:

```tsx
import { css } from "../styled-system/css";

function Button() {
  return (
    <button className={css({ bg: "blue.500", color: "white", p: "4" })}>
      Click
    </button>
  );
}
```

**vanilla-extract** — viết CSS bằng TypeScript:

```tsx
// button.css.ts
import { style } from "@vanilla-extract/css";

export const button = style({
  padding: 16,
  background: "blue",
  ":hover": { opacity: 0.8 },
});
```

```tsx
import { button } from "./button.css";
<button className={button}>Click</button>
```

Cả hai compile thành **static CSS** tại build time → không có runtime
overhead. Type-safe → autocomplete, refactor an toàn.

---

## SASS/SCSS

Vẫn dùng được với React qua loader. Cài:

```bash
npm install -D sass
```

```scss
// styles.scss
.button {
  padding: 8px 16px;

  &.primary { background: blue; }
  &:hover    { opacity: 0.8; }
}
```

```jsx
import "./styles.scss";

<button className="button primary">Save</button>
```

:::info[Phân tích]

**SASS năm 2026 — có còn cần?**

CSS native đã có hầu hết feature SASS từng dẫn đầu:

- **Nesting** — CSS 2022+ hỗ trợ.
- **Variables** — `var(--name)` từ lâu.
- **Calc** — `calc()` native.
- **Color function** — `color-mix()`, `light-dark()` đang ra.
- **Custom property fallback** — `var(--x, default)`.

Lý do vẫn dùng SASS:

- **Mixin** — `@mixin` chưa có native equivalent đầy đủ.
- **Function** — `@function`, math operations.
- **Module system** — `@use`, `@forward`.
- **Codebase lớn legacy** — chi phí migrate cao.

Project mới ưu tiên CSS thuần + PostCSS plugin nếu cần feature đặc biệt.

:::

:::tip[Mẹo]

**Quy tắc chọn CSS solution 2026:**

```
SPA/SSR thông thường?
├─ Cần atomic + utility nhanh? → Tailwind CSS
├─ Cần type-safe CSS-in-JS? → Panda CSS / vanilla-extract
├─ Team quen CSS truyền thống? → CSS Modules
└─ Có codebase legacy SCSS? → SCSS (migrate dần)

Component library / design system?
├─ Token system → vanilla-extract / Panda
└─ Theme runtime đổi → CSS variables + Tailwind

Mobile (React Native)?
└─ NativeWind (Tailwind cho RN) / StyleSheet API
```

Đa số dự án **Tailwind là default** — học cú pháp đáng giá.

:::
