---
sidebar_position: 14
title: "Styling"
---

# Styling (CSS Modules & Tailwind CSS)

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
