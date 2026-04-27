---
sidebar_position: 14
title: "14. Styling"
---

# Styling (CSS Modules & Tailwind CSS)


---

## Mục lục

- [Các cách styling trong React](#các-cách-styling-trong-react)
- [CSS Modules](#css-modules)
- [Tailwind CSS](#tailwind-css)
- [Khi nào dùng gì?](#khi-nào-dùng-gì)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Các cách styling trong React

| Cách | Ưu điểm | Nhược điểm |
|------|---------|------------|
| **CSS thường** | Đơn giản, quen thuộc | Global scope, dễ conflict |
| **CSS Modules** | Scoped, không conflict | Cú pháp `styles.xxx` |
| **Tailwind CSS** | Nhanh, utility-first | Class dài, learning curve |
| **Styled Components** | CSS-in-JS, dynamic | Bundle size, runtime cost |
| **Inline styles** | Nhanh, dynamic | Không hỗ trợ pseudo, media |

## CSS Modules

CSS Modules tự động tạo class names **unique** → không lo conflict giữa các components.

### Setup

Vite hỗ trợ sẵn — chỉ cần đặt tên file `*.module.css`.

### Sử dụng

```css
/* Button.module.css */
.button {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.primary {
  background-color: #3b82f6;
  color: white;
}

.secondary {
  background-color: #6b7280;
  color: white;
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

```tsx
// Button.tsx
import styles from './Button.module.css';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

function Button({ variant = 'primary', disabled, children, onClick }: ButtonProps) {
  const className = [
    styles.button,
    styles[variant],
    disabled && styles.disabled,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={className} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
```

### Kết hợp với clsx

```bash
npm install clsx
```

```tsx
import clsx from 'clsx';
import styles from './Button.module.css';

function Button({ variant = 'primary', disabled }: ButtonProps) {
  return (
    <button
      className={clsx(styles.button, styles[variant], {
        [styles.disabled]: disabled,
      })}
    >
      Click
    </button>
  );
}
```

### Composition (compose classes)

```css
/* base.module.css */
.text {
  font-family: sans-serif;
  line-height: 1.5;
}

/* Heading.module.css */
.heading {
  composes: text from './base.module.css';
  font-size: 2rem;
  font-weight: bold;
}
```

## Tailwind CSS

### Cài đặt với Vite

```bash
npm install tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* src/index.css */
@import 'tailwindcss';
```

### Sử dụng cơ bản

```tsx
function UserCard({ name, email, isOnline }: UserCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-blue-500" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">{email}</p>
        </div>
      </div>
      <span
        className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
          isOnline
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}
```

### Responsive

Tailwind dùng **mobile-first** breakpoints:

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 cột mobile, 2 cột tablet, 3 cột desktop */}
</div>

<p className="text-sm md:text-base lg:text-lg">
  Responsive text size
</p>
```

| Prefix | Min-width | Thiết bị |
|--------|-----------|----------|
| (none) | 0px | Mobile |
| `sm:` | 640px | Small tablet |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Large desktop |

### Hover, Focus, Active

```tsx
<button className="bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
  Click me
</button>
```

### Dark mode

```tsx
// Bật dark mode trong tailwind.config.js: darkMode: 'class'
<div className="bg-white text-black dark:bg-gray-900 dark:text-white">
  <p className="text-gray-600 dark:text-gray-300">Content</p>
</div>
```

### Tái sử dụng styles với @apply

```css
/* globals.css */
@layer components {
  .btn-primary {
    @apply rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600;
  }
}
```

```tsx
<button className="btn-primary">Submit</button>
```

## Khi nào dùng gì?

- **Dự án nhỏ, học React** → CSS Modules (đơn giản, scoped)
- **Dự án thực tế, tốc độ phát triển** → Tailwind CSS (nhanh, consistent)
- **Design system, theming phức tạp** → Styled Components hoặc CSS-in-JS
- **Prototype nhanh** → Tailwind CSS

---

## Câu hỏi phỏng vấn

### Câu 1: CSS Modules và Tailwind CSS khác nhau thế nào? Khi nào chọn cái nào?
**Đáp án:**

| Tiêu chí | CSS Modules | Tailwind CSS |
|----------|-------------|--------------|
| Cách viết | File `.module.css` riêng, dùng `styles.className` | Utility classes trực tiếp trong JSX |
| Scoping | Tự động scoped (class name unique) | Global utilities, không conflict |
| Tốc độ phát triển | Trung bình (viết CSS riêng) | Nhanh (dùng classes có sẵn) |
| Bundle size | CSS riêng cho mỗi component | Chỉ generate classes đã dùng (purge) |
| Customization | Tự do viết CSS bất kỳ | Theo design system, config trong `tailwind.config.js` |

```tsx
// CSS Modules
import styles from './Button.module.css';
<button className={styles.primary}>Click</button>

// Tailwind CSS
<button className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
  Click
</button>
```

**Chọn CSS Modules khi:** dự án nhỏ, team quen CSS truyền thống, cần custom design không theo system.
**Chọn Tailwind khi:** cần tốc độ phát triển nhanh, dự án thực tế, team đông (consistent styling), prototype.

### Câu 2: Scoped CSS nghĩa là gì và CSS Modules giải quyết vấn đề này như thế nào?
**Đáp án:**
**Scoped CSS** nghĩa là styles chỉ áp dụng cho component hiện tại, không ảnh hưởng đến components khác. CSS thường là global scope nên dễ bị conflict class names giữa các components.

CSS Modules giải quyết bằng cách **tự động hash class names** tại build time:

```css
/* Button.module.css */
.button { background: blue; }
.title { font-size: 16px; }
```

```tsx
import styles from './Button.module.css';
// styles.button = "Button_button_x7yz3" (hash unique)
// styles.title  = "Button_title_a2bc1"
<button className={styles.button}>Click</button>
```

```css
/* Card.module.css — cùng tên .title nhưng KHÔNG conflict */
.title { font-size: 24px; }
```

```tsx
import styles from './Card.module.css';
// styles.title = "Card_title_k9mn2" (hash khác)
<h2 className={styles.title}>Card Title</h2>
```

Kết quả: hai `.title` class không bao giờ conflict vì tên thực tế sau build hoàn toàn khác nhau.

### Câu 3: Làm thế nào để thiết kế responsive với Tailwind CSS?
**Đáp án:**
Tailwind dùng **mobile-first breakpoints** — viết style cho mobile trước, thêm prefix cho màn hình lớn hơn:

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  {/* Mobile: 1 cột → sm: 2 cột → md: 3 cột → lg: 4 cột */}
</div>

<p className="text-sm md:text-base lg:text-lg xl:text-xl">
  {/* Font size tăng dần theo kích thước màn hình */}
</p>

<div className="flex flex-col md:flex-row">
  {/* Mobile: xếp dọc, Tablet+: xếp ngang */}
  <aside className="w-full md:w-64">Sidebar</aside>
  <main className="flex-1">Content</main>
</div>
```

Breakpoints mặc định: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px).

Nguyên tắc: **không có prefix = mobile**. Thêm prefix = áp dụng từ breakpoint đó trở lên. Ví dụ `md:grid-cols-3` nghĩa là "từ 768px trở lên thì dùng 3 cột".
