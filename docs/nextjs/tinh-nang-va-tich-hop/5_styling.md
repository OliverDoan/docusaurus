---
sidebar_position: 5
title: "5. Styling"
---

# Styling

## Tổng quan các phương pháp styling trong Next.js

Next.js hỗ trợ nhiều phương pháp styling. Mỗi cách có ưu/nhược điểm riêng:

| Phương pháp | Server Components | Client Components | Zero Runtime | Scoped |
|-------------|:-:|:-:|:-:|:-:|
| **CSS Modules** | Co | Co | Co | Co |
| **Tailwind CSS** | Co | Co | Co | Co |
| **Global CSS** | Co | Co | Co | Khong |
| **Sass/SCSS** | Co | Co | Co | Co |
| **CSS-in-JS** | Khong | Co | Khong | Co |

:::tip
**Khuyến nghị**: Dùng **CSS Modules** hoặc **Tailwind CSS** cho Next.js App Router. Cả hai đều hoạt động tốt với Server Components và không thêm JavaScript runtime.
:::

## CSS Modules — Built-in, Scoped

CSS Modules là cách styling mặc định trong Next.js. Mỗi class name được tự động thêm hash duy nhất, tránh xung đột tên class giữa các components.

### Cách hoạt động

```
// File: components/Button.module.css
.primary {
  background: blue;
  color: white;
}

// Sau khi build, class name trở thành:
// .Button_primary__x7h2k
// → Không bao giờ xung đột với .primary ở file khác
```

### Sử dụng CSS Modules

```css
/* components/Card.module.css */

.card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1a202c;
}

.description {
  color: #718096;
  line-height: 1.6;
}

/* Modifier classes */
.featured {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
}
```

```tsx
// components/Card.tsx

import styles from "./Card.module.css";

interface CardProps {
  title: string;
  description: string;
  featured?: boolean;
}

export function Card({ title, description, featured = false }: CardProps) {
  return (
    // Kết hợp nhiều class names
    <div className={`${styles.card} ${featured ? styles.featured : ""}`}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
```

### Compose classes — kế thừa styles

```css
/* components/Button.module.css */

.base {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.primary {
  /* Kế thừa styles từ .base */
  composes: base;
  background: #3b82f6;
  color: white;
}

.primary:hover {
  background: #2563eb;
}

.secondary {
  composes: base;
  background: #e2e8f0;
  color: #1a202c;
}

.secondary:hover {
  background: #cbd5e1;
}

.danger {
  composes: base;
  background: #ef4444;
  color: white;
}

/* Size variants */
.small {
  padding: 4px 8px;
  font-size: 0.875rem;
}

.large {
  padding: 12px 24px;
  font-size: 1.125rem;
}
```

```tsx
// components/Button.tsx

import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "danger";
type Size = "small" | "medium" | "large";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "medium",
  className,
  children,
  ...props
}: ButtonProps) {
  const sizeClass = size !== "medium" ? styles[size] : "";

  return (
    <button
      className={`${styles[variant]} ${sizeClass} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

## Tailwind CSS — Utility-first

Tailwind CSS là framework CSS utility-first phổ biến nhất. Next.js 15 hỗ trợ Tailwind v4 với tính năng tự động detect content files.

### Setup Tailwind CSS

```bash
# Next.js 15+ với Tailwind v4
npm install tailwindcss @tailwindcss/postcss postcss
```

```tsx
// postcss.config.mjs

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

```css
/* app/globals.css */

/* Import Tailwind — v4 chỉ cần 1 dòng */
@import "tailwindcss";
```

Với Tailwind v3 (nếu bạn dùng phiên bản cũ hơn):

```bash
# Tailwind v3
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```tsx
// tailwind.config.ts (Tailwind v3)

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

```css
/* app/globals.css (Tailwind v3) */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Sử dụng Tailwind trong Components

```tsx
// components/ProductCard.tsx

interface ProductCardProps {
  name: string;
  price: number;
  image: string;
  isNew?: boolean;
}

export function ProductCard({ name, price, image, isNew }: ProductCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
      {/* Hình ảnh */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Badge "Mới" */}
        {isNew && (
          <span className="absolute left-3 top-3 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
            Mới
          </span>
        )}
      </div>

      {/* Thông tin */}
      <div className="p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          {name}
        </h3>
        <p className="text-xl font-bold text-blue-600">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(price)}
        </p>
        <button className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800">
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
```

### Tailwind với `clsx` hoặc `cn` — conditional classes

```bash
# Cài đặt clsx và tailwind-merge
npm install clsx tailwind-merge
```

```tsx
// lib/utils.ts — Helper function kết hợp classes

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// cn = className helper
// Kết hợp nhiều classes, resolve Tailwind conflicts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
// components/Button.tsx

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",

        // Variant styles
        {
          "bg-blue-600 text-white hover:bg-blue-700": variant === "primary",
          "bg-gray-100 text-gray-900 hover:bg-gray-200": variant === "secondary",
          "bg-red-600 text-white hover:bg-red-700": variant === "danger",
          "hover:bg-gray-100 text-gray-700": variant === "ghost",
        },

        // Size styles
        {
          "h-8 px-3 text-sm": size === "sm",
          "h-10 px-4 text-base": size === "md",
          "h-12 px-6 text-lg": size === "lg",
        },

        // Custom classes override (nhờ twMerge)
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Sử dụng:
// <Button variant="primary" size="lg">Đăng ký</Button>
// <Button variant="ghost" className="text-red-500">Xóa</Button>  ← override color
```

## Global CSS

Global CSS áp dụng cho toàn bộ ứng dụng. Import trong `layout.tsx` gốc.

```css
/* app/globals.css */

/* CSS Reset và base styles */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-inter), system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  color: #1a202c;
  background-color: #ffffff;
  -webkit-font-smoothing: antialiased;
}

/* Dùng cho prose content (bài viết, documentation) */
.prose h1 { font-size: 2.25rem; font-weight: 800; margin-bottom: 1rem; }
.prose h2 { font-size: 1.875rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; }
.prose h3 { font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; }
.prose p { margin-bottom: 1rem; }
.prose a { color: #3b82f6; text-decoration: underline; }
.prose code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.875em;
}

/* Utility classes */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```tsx
// app/layout.tsx

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
```

## CSS-in-JS — Hạn chế với Server Components

CSS-in-JS (styled-components, Emotion...) **không hoạt động** trong Server Components vì chúng cần JavaScript runtime để inject styles. Chỉ dùng được trong Client Components.

```tsx
// SAI — styled-components trong Server Component
// app/page.tsx (Server Component mặc định)
import styled from "styled-components";

const Title = styled.h1`
  color: blue;
`; // Lỗi! Cần client-side JavaScript

// ĐÚNG — chỉ dùng trong Client Component
// components/StyledTitle.tsx
"use client";

import styled from "styled-components";

const Title = styled.h1`
  color: blue;
  font-size: 2rem;
`;

export function StyledTitle({ children }: { children: React.ReactNode }) {
  return <Title>{children}</Title>;
}
```

Nếu vẫn muốn dùng styled-components, cần setup `StyledComponentsRegistry`:

```tsx
// lib/registry.tsx
"use client";

import { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

export function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== "undefined") return <>{children}</>;

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
}
```

:::warning
**Khuyến nghị**: Trong Next.js App Router, ưu tiên CSS Modules hoặc Tailwind CSS thay vì CSS-in-JS. CSS-in-JS thêm JavaScript bundle size và phức tạp hơn khi dùng với Server Components.
:::

## Sass/SCSS Support

Next.js hỗ trợ Sass/SCSS built-in. Chỉ cần cài `sass`:

```bash
npm install sass
```

```scss
// components/Navigation.module.scss

// Biến SCSS
$nav-height: 64px;
$nav-bg: #ffffff;
$nav-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

// Mixins
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin responsive($breakpoint) {
  @if $breakpoint == mobile {
    @media (max-width: 768px) { @content; }
  }
  @if $breakpoint == tablet {
    @media (max-width: 1024px) { @content; }
  }
}

// Component styles
.nav {
  position: sticky;
  top: 0;
  height: $nav-height;
  background: $nav-bg;
  box-shadow: $nav-shadow;
  z-index: 50;
  @include flex-center;

  &__container {
    max-width: 1200px;
    width: 100%;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__logo {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a202c;
    text-decoration: none;
  }

  &__links {
    display: flex;
    gap: 2rem;
    list-style: none;

    @include responsive(mobile) {
      display: none; // Ẩn trên mobile
    }
  }

  &__link {
    color: #4a5568;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;

    &:hover {
      color: #3b82f6;
    }

    &--active {
      color: #3b82f6;
    }
  }
}
```

```tsx
// components/Navigation.tsx

import styles from "./Navigation.module.scss";

export function Navigation() {
  return (
    <nav className={styles.nav}>
      <div className={styles.nav__container}>
        <a href="/" className={styles.nav__logo}>MyApp</a>
        <ul className={styles.nav__links}>
          <li>
            <a href="/" className={`${styles.nav__link} ${styles["nav__link--active"]}`}>
              Trang chủ
            </a>
          </li>
          <li>
            <a href="/products" className={styles.nav__link}>Sản phẩm</a>
          </li>
          <li>
            <a href="/about" className={styles.nav__link}>Giới thiệu</a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
```

## Conditional Styling Patterns

### Pattern 1: Boolean props

```tsx
// Dùng template literals
<div className={`${styles.card} ${isActive ? styles.active : ""}`} />

// Dùng clsx (gọn hơn)
import { clsx } from "clsx";
<div className={clsx(styles.card, isActive && styles.active)} />

// Dùng cn (Tailwind)
<div className={cn("rounded-lg p-4", isActive && "bg-blue-100 ring-2 ring-blue-500")} />
```

### Pattern 2: Variant mapping

```tsx
const variantStyles = {
  info: "bg-blue-50 text-blue-800 border-blue-200",
  success: "bg-green-50 text-green-800 border-green-200",
  warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
  error: "bg-red-50 text-red-800 border-red-200",
} as const;

type Variant = keyof typeof variantStyles;

function Alert({ variant, message }: { variant: Variant; message: string }) {
  return (
    <div className={cn("rounded-lg border p-4", variantStyles[variant])}>
      {message}
    </div>
  );
}
```

### Pattern 3: Data attributes cho state styling

```css
/* CSS Modules cách */
.tab[data-state="active"] {
  color: #3b82f6;
  border-bottom: 2px solid #3b82f6;
}

.tab[data-state="inactive"] {
  color: #6b7280;
}
```

```tsx
<button className={styles.tab} data-state={isActive ? "active" : "inactive"}>
  {label}
</button>
```

## Responsive Design Patterns

### Container queries (CSS native)

```css
/* components/Sidebar.module.css */

.wrapper {
  container-type: inline-size;
  container-name: sidebar;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Khi container >= 400px, chuyển sang row layout */
@container sidebar (min-width: 400px) {
  .content {
    flex-direction: row;
  }
}
```

### Tailwind responsive

```tsx
// Responsive layout với Tailwind
// Mobile first: base → sm → md → lg → xl → 2xl

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className={[
      "grid gap-4",
      "grid-cols-1",       // Mobile: 1 cột
      "sm:grid-cols-2",    // >= 640px: 2 cột
      "lg:grid-cols-3",    // >= 1024px: 3 cột
      "xl:grid-cols-4",    // >= 1280px: 4 cột
    ].join(" ")}>
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}

// Responsive typography
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
  Tiêu đề responsive
</h1>

// Ẩn/hiện theo breakpoint
<nav className="hidden md:flex">Desktop nav</nav>
<button className="md:hidden">Mobile menu</button>
```

## Dark Mode Implementation

### Tailwind CSS Dark Mode

```tsx
// tailwind.config.ts (v3)
const config: Config = {
  darkMode: "class",  // Dùng class strategy (thêm class "dark" vào html)
  // ...
};
```

```tsx
// components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Đọc theme từ localStorage hoặc system preference
    const saved = localStorage.getItem("theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initial = saved ? (saved as "light" | "dark") : systemDark ? "dark" : "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Chuyển đổi theme"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
```

```tsx
// Sử dụng dark: prefix trong components
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
  <h1 className="text-2xl font-bold text-black dark:text-white">
    Tiêu đề
  </h1>
  <p className="text-gray-600 dark:text-gray-400">
    Nội dung hỗ trợ dark mode
  </p>
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
    Card component
  </div>
</div>
```

### CSS Variables Dark Mode (CSS Modules)

```css
/* app/globals.css */

:root {
  /* Light theme */
  --color-bg: #ffffff;
  --color-text: #1a202c;
  --color-text-secondary: #718096;
  --color-border: #e2e8f0;
  --color-primary: #3b82f6;
  --color-card-bg: #ffffff;
}

.dark {
  /* Dark theme */
  --color-bg: #0f172a;
  --color-text: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-border: #334155;
  --color-primary: #60a5fa;
  --color-card-bg: #1e293b;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  transition: background-color 0.3s, color 0.3s;
}
```

```css
/* components/Card.module.css */

.card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
}

.title {
  color: var(--color-text);
}

.description {
  color: var(--color-text-secondary);
}
```

## CSS Organization Best Practices

### Cấu trúc thư mục

```
app/
├── globals.css              ← Reset, CSS variables, base styles
├── layout.tsx               ← Import globals.css
src/
├── styles/
│   ├── variables.css        ← CSS custom properties
│   └── animations.css       ← Keyframe animations dùng chung
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.module.css
│   ├── Card/
│   │   ├── Card.tsx
│   │   └── Card.module.css
│   └── Navigation/
│       ├── Navigation.tsx
│       └── Navigation.module.scss
```

### Quy tắc tổ chức

1. **Co-locate styles với component** — `Button.module.css` nằm cùng thư mục với `Button.tsx`.
2. **Global styles ít nhất có thể** — chỉ reset, CSS variables, và typography base.
3. **Tránh deep nesting** — tối đa 3 levels trong SCSS.
4. **Dùng CSS variables cho theming** — dễ chuyển đổi theme, consistent.
5. **Mobile-first** — viết styles cho mobile trước, thêm media queries cho larger screens.

## Lỗi thường gặp

### 1. Import CSS Module sai cách

```tsx
// SAI — import như global CSS
import "./Button.module.css";
<button className="primary">Click</button> // Class "primary" không tồn tại!

// ĐÚNG — import object và dùng property
import styles from "./Button.module.css";
<button className={styles.primary}>Click</button>
```

### 2. Tailwind classes không hoạt động

```tsx
// SAI — dynamic class names không được Tailwind detect
const color = "blue";
<div className={`bg-${color}-500`} /> // Tailwind không tìm thấy class này!

// ĐÚNG — dùng complete class names
const bgColors = {
  blue: "bg-blue-500",
  red: "bg-red-500",
  green: "bg-green-500",
};
<div className={bgColors[color]} />
```

### 3. CSS-in-JS trong Server Component

```tsx
// SAI — styled-components không chạy trong Server Component
// app/page.tsx (Server Component mặc định)
import styled from "styled-components";
const Title = styled.h1`color: blue;`; // Lỗi runtime!

// ĐÚNG — thêm "use client" hoặc dùng CSS Modules
```

### 4. Global CSS import sai vị trí

```tsx
// SAI — import global CSS trong component thường
// components/Card.tsx
import "../app/globals.css"; // Có thể gây duplicate styles!

// ĐÚNG — chỉ import global CSS trong root layout
// app/layout.tsx
import "./globals.css";
```

### 5. Quên `position: relative` khi dùng absolute positioning

```tsx
// SAI — badge bay ra ngoài vì parent thiếu position: relative
<div>
  <span className="absolute top-0 right-0">Badge</span>
</div>

// ĐÚNG — parent có position: relative
<div className="relative">
  <span className="absolute top-0 right-0">Badge</span>
</div>
```

## Câu hỏi phỏng vấn

### Câu 1: CSS Modules hoạt động thế nào? Tại sao dùng cho Next.js?

**Trả lời:**

CSS Modules biến mỗi class name thành unique hash tại build time (ví dụ `.card` trở thành `.Card_card__x7h2k`). Điều này đảm bảo:
- **Scoped styles** — styles chỉ ảnh hưởng component đang dùng, không leak ra ngoài.
- **Không xung đột** — 2 components có class `.title` sẽ có hash khác nhau.
- **Zero runtime** — CSS được extract thành file riêng, không cần JavaScript.
- **Server Components compatible** — hoạt động tốt vì không cần client JS.

Tại sao phù hợp cho Next.js App Router: Server Components chiếm phần lớn ứng dụng, và CSS Modules không cần JavaScript runtime nên hoạt động ở cả server và client.

### Câu 2: Tại sao CSS-in-JS (styled-components, Emotion) gặp vấn đề với Server Components?

**Trả lời:**

CSS-in-JS hoạt động bằng cách: JavaScript chạy ở runtime, tạo CSS, rồi inject vào DOM. Server Components render trên server và gửi HTML thuần (không kèm JavaScript), nên không có runtime để inject CSS.

Giải pháp nếu vẫn muốn dùng:
- Tạo `StyledComponentsRegistry` dùng `useServerInsertedHTML` để collect styles trên server.
- Đánh dấu styled components là `"use client"`.
- Tuy nhiên, khuyến nghị chuyển sang CSS Modules hoặc Tailwind để tận dụng Server Components tối đa.

### Câu 3: Tailwind CSS và CSS Modules, nên chọn cái nào?

**Trả lời:**

**Tailwind CSS:**
- Ưu: Nhanh để prototype, consistent design system, utility classes mạnh mẽ, responsive/dark mode dễ dàng.
- Nhược: Class names dài trong JSX, learning curve cho người mới, cần tooling (Prettier plugin, VS Code extension).
- Phù hợp: Team muốn design system nhất quán, prototype nhanh, dự án mới.

**CSS Modules:**
- Ưu: Viết CSS thuần (quen thuộc), tách biệt styles khỏi markup, không dependency ngoài.
- Nhược: Nhiều file hơn, switching context giữa TSX và CSS, responsive phải viết media queries.
- Phù hợp: Team quen CSS truyền thống, dự án cần custom design phức tạp.

Cả hai đều hoạt động tốt với Server Components và không thêm runtime JS. Chọn theo team preference.

### Câu 4: Dark mode nên implement thế nào trong Next.js?

**Trả lời:**

Hai cách phổ biến:

1. **CSS class strategy** (Tailwind `darkMode: "class"`): Thêm/xóa class `dark` trên `<html>`. Ưu điểm: kiểm soát hoàn toàn, lưu preference vào localStorage.
2. **CSS variables**: Khai báo 2 bộ biến cho light/dark theme. Chuyển đổi bằng class hoặc `prefers-color-scheme` media query.

Best practice: Đọc system preference ban đầu (`prefers-color-scheme`), cho user override và lưu vào localStorage. Dùng inline script trong `<head>` để set theme trước khi React hydrate (tránh flash of wrong theme).

### Câu 5: Hàm `cn()` (clsx + tailwind-merge) giải quyết vấn đề gì?

**Trả lời:**

`cn()` kết hợp 2 thư viện:
- **clsx**: Conditional class joining — gộp nhiều class names, bỏ qua `false`/`null`/`undefined`.
- **tailwind-merge**: Resolve Tailwind conflicts — khi 2 classes xung đột (ví dụ `bg-red-500` và `bg-blue-500`), class sau thắng.

Ví dụ: `cn("bg-red-500 p-4", isActive && "bg-blue-500")` khi `isActive = true` sẽ trả về `"p-4 bg-blue-500"` (loại bỏ `bg-red-500`). Nếu không dùng tailwind-merge, cả 2 classes đều tồn tại và kết quả phụ thuộc vào thứ tự CSS generation (không đoán trước được).

Pattern này đặc biệt quan trọng khi xây dựng reusable components cho phép override styles qua `className` prop.
