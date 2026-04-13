---
sidebar_position: 2
title: "2. Cài đặt môi trường"
---

# Cài đặt môi trường

## Node.js & NPM

React cần Node.js để chạy build tools và package manager.

```bash
# Kiểm tra version
node -v   # Khuyến khích v20+
npm -v    # Đi kèm Node.js

# Cài Node.js: https://nodejs.org (LTS version)
# Hoặc dùng nvm (Node Version Manager):
nvm install 20
nvm use 20
```

### Package managers

| Tool | Ưu điểm |
|------|---------|
| **npm** | Mặc định, đi kèm Node.js |
| **pnpm** | Nhanh, tiết kiệm disk |
| **yarn** | Phổ biến, deterministic |

```bash
# npm (mặc định)
npm install react

# pnpm
npm install -g pnpm
pnpm install react

# yarn
npm install -g yarn
yarn add react
```

## VS Code Extensions khuyến khích

| Extension | Chức năng |
|-----------|-----------|
| **ES7+ React/Redux/React-Native snippets** | Snippet nhanh (rafce, useState...) |
| **Prettier** | Auto format code |
| **ESLint** | Phát hiện lỗi JavaScript |
| **Auto Rename Tag** | Tự đổi tên closing tag |
| **Tailwind CSS IntelliSense** | Autocomplete Tailwind classes |
| **Error Lens** | Hiển thị lỗi inline |

### Settings VS Code nên bật

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  }
}
```

## Tạo dự án React

### Vite (khuyến khích)

Vite nhanh hơn CRA rất nhiều nhờ native ES modules và esbuild.

```bash
# JavaScript
npm create vite@latest my-app -- --template react

# TypeScript (khuyến khích)
npm create vite@latest my-app -- --template react-ts

# Cài dependencies và chạy
cd my-app
npm install
npm run dev
```

### Create React App (CRA) — không còn khuyến khích

```bash
# CRA đã ngừng maintain từ 2023
# Chỉ dùng khi project cũ yêu cầu
npx create-react-app my-app
```

### Framework-based (cho production)

```bash
# Next.js — full-stack React framework
npx create-next-app@latest my-app

# Remix
npx create-remix@latest
```

## Cấu trúc dự án Vite + React

```
my-app/
├── node_modules/       # Dependencies (tự động, KHÔNG commit)
├── public/             # Static files (favicon, images)
│   └── vite.svg
├── src/
│   ├── assets/         # Images, fonts dùng trong code
│   ├── App.tsx         # Root component
│   ├── App.css         # Styles cho App
│   ├── main.tsx        # Entry point — render App vào DOM
│   ├── index.css       # Global styles
│   └── vite-env.d.ts   # TypeScript types cho Vite
├── index.html          # HTML template — Vite inject JS vào đây
├── package.json        # Dependencies & scripts
├── tsconfig.json       # TypeScript config
├── vite.config.ts      # Vite config
└── .gitignore
```

### File quan trọng

**main.tsx** — Entry point:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

**App.tsx** — Root component:
```tsx
function App() {
  return (
    <div>
      <h1>Hello React</h1>
    </div>
  );
}
export default App;
```

## Scripts thường dùng

```bash
npm run dev      # Chạy dev server (hot reload)
npm run build    # Build production
npm run preview  # Preview bản build
npm run lint     # Chạy ESLint
```

## Git cơ bản cho dự án React

```bash
# Khởi tạo repo
git init

# .gitignore (Vite tạo sẵn)
# node_modules, dist, .env phải nằm trong .gitignore

# Workflow cơ bản
git add .
git commit -m "feat: initial project setup"
git push origin main
```

### Branching

```bash
git checkout -b feature/login-page   # Tạo branch mới
# ... code ...
git add .
git commit -m "feat: add login page"
git push -u origin feature/login-page
# Tạo Pull Request trên GitHub
```

## Cấu trúc thư mục nên dùng (khi project lớn hơn)

```
src/
├── components/         # Shared/reusable components
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── Spinner.tsx
├── features/           # Feature modules
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── useAuth.ts
│   │   └── auth.service.ts
│   └── products/
│       ├── ProductList.tsx
│       └── useProducts.ts
├── hooks/              # Shared custom hooks
├── services/           # API calls
├── utils/              # Helper functions
├── types/              # TypeScript types
├── styles/             # Global styles
├── App.tsx
└── main.tsx
```

---

## Câu hỏi phỏng vấn

### Câu 1: Tại sao nên dùng Vite thay vì Create React App (CRA)? Phân tích ưu nhược điểm.

**Đáp án:**

CRA (Create React App) đã **ngừng maintain từ năm 2023** và không còn được React team khuyến khích. Vite là lựa chọn thay thế hàng đầu nhờ kiến trúc hoàn toàn khác biệt.

**Lý do Vite nhanh hơn CRA:**

| Tiêu chí | CRA (Webpack) | Vite |
|-----------|---------------|------|
| Dev server startup | Chậm (bundle toàn bộ trước) | Gần như tức thì (native ES modules) |
| Hot Module Replacement | Chậm khi project lớn | Cực nhanh, không phụ thuộc kích thước project |
| Build tool | Webpack (JavaScript) | esbuild (Go) cho pre-bundling, Rollup cho production |
| Cấu hình | Ẩn sau react-scripts, khó customize | Minh bạch, dễ customize qua `vite.config.ts` |
| Tree-shaking | Có nhưng chậm | Tốt hơn nhờ Rollup |

**Cách Vite hoạt động:**

```
CRA (Webpack):
[Source files] → [Bundle ALL files] → [Dev server] → [Browser]
                     ↑ Chậm vì phải xử lý toàn bộ

Vite:
[Source files] → [Dev server] → [Browser requests file] → [Transform on-demand]
                                      ↑ Chỉ xử lý file browser thực sự cần
```

Vite tận dụng native ES modules của trình duyệt hiện đại. Thay vì bundle toàn bộ code trước khi serve, Vite chỉ transform và serve từng file khi trình duyệt request. Điều này khiến dev server khởi động gần như tức thì bất kể project có bao nhiêu file.

**Nhược điểm của Vite:**
- Dev và production dùng bundler khác nhau (esbuild vs Rollup), đôi khi có sự khác biệt nhỏ.
- Cần trình duyệt hỗ trợ ES modules (các trình duyệt hiện đại đều hỗ trợ).
- Hệ sinh thái plugin nhỏ hơn Webpack (nhưng đang phát triển nhanh).

**Kết luận:** Với dự án mới, **luôn chọn Vite**. Chỉ giữ CRA khi maintain dự án cũ và không có thời gian migrate.

### Câu 2: `StrictMode` trong React là gì? Nó giúp phát hiện những vấn đề gì?

**Đáp án:**

`StrictMode` là một component đặc biệt của React, **chỉ chạy trong development** (không ảnh hưởng production build). Nó giúp phát hiện các vấn đề tiềm ẩn trong code bằng cách thực hiện các kiểm tra nghiêm ngặt hơn.

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

**StrictMode thực hiện 3 việc chính:**

**1. Render component 2 lần (double rendering):**

React gọi render function và một số lifecycle method hai lần để phát hiện side effects không mong muốn.

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  // StrictMode gọi hàm này 2 lần trong development
  // Nếu có side effect (ví dụ: gọi API ở đây), bạn sẽ thấy nó chạy 2 lần
  console.log('Render:', count); // Log 2 lần trong dev

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**2. Chạy `useEffect` cleanup rồi re-run (mount → unmount → mount):**

```jsx
function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    console.log('Connected to', roomId);

    return () => {
      connection.disconnect();
      console.log('Disconnected from', roomId);
    };
  }, [roomId]);

  return <p>Chat room: {roomId}</p>;
}

// Trong StrictMode (dev), log sẽ là:
// "Connected to general"
// "Disconnected from general"    ← cleanup
// "Connected to general"          ← re-mount

// Điều này giúp phát hiện:
// - Effect thiếu cleanup function
// - Cleanup không đúng cách (resource leak)
// - Logic phụ thuộc vào thứ tự mount
```

**3. Cảnh báo sử dụng API deprecated:**

StrictMode phát hiện và cảnh báo khi bạn dùng các API cũ đã hoặc sẽ bị loại bỏ, ví dụ: `findDOMNode`, `UNSAFE_componentWillMount`, string ref.

**Lưu ý quan trọng:**
- StrictMode **không** render UI thêm — nó là một fragment ẩn.
- StrictMode **không** ảnh hưởng production build — mọi kiểm tra bị loại bỏ khi build.
- Nếu `useEffect` chạy 2 lần trong dev mà gây lỗi, đó là dấu hiệu code bạn **có bug** (thiếu cleanup hoặc có side effect không kiểm soát).
- **Luôn giữ StrictMode** — không nên tắt để "fix" double render, mà hãy fix root cause.

### Câu 3: Khi dự án React lớn lên, nên tổ chức cấu trúc thư mục như thế nào? So sánh các cách tiếp cận.

**Đáp án:**

Có 3 cách tiếp cận phổ biến, mỗi cách phù hợp với quy mô dự án khác nhau:

**1. Flat structure — cho dự án nhỏ (< 20 components):**

```
src/
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Button.tsx
│   └── UserCard.tsx
├── hooks/
│   └── useAuth.ts
├── services/
│   └── api.ts
├── App.tsx
└── main.tsx
```

Ưu điểm: Đơn giản, dễ tìm file. Nhược điểm: Khi project lớn, thư mục `components/` sẽ chứa hàng chục file không liên quan.

**2. Feature-based structure — cho dự án vừa đến lớn (khuyến khích):**

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── index.ts          # Public API — chỉ export những gì cần thiết
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   └── ProductFilter.tsx
│   │   ├── hooks/
│   │   │   └── useProducts.ts
│   │   ├── services/
│   │   │   └── product.service.ts
│   │   └── index.ts
│   └── cart/
│       ├── components/
│       ├── hooks/
│       └── index.ts
├── shared/                    # Code dùng chung giữa nhiều features
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   └── ErrorBoundary.tsx
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   ├── utils/
│   │   ├── formatDate.ts
│   │   └── validators.ts
│   └── types/
│       └── common.types.ts
├── config/                    # App configuration
│   ├── routes.tsx
│   └── constants.ts
├── styles/
│   └── globals.css
├── App.tsx
└── main.tsx
```

**File `index.ts` đóng vai trò Public API:**

```ts
// features/auth/index.ts
// Chỉ export những gì feature khác cần dùng
export { LoginForm } from './components/LoginForm';
export { AuthGuard } from './components/AuthGuard';
export { useAuth } from './hooks/useAuth';
export type { User, AuthState } from './types/auth.types';

// Không export: RegisterForm (chỉ dùng nội bộ), auth.service (implementation detail)
```

```ts
// Sử dụng từ feature khác — import gọn gàng
import { useAuth, AuthGuard } from '@/features/auth';
// Thay vì: import { useAuth } from '@/features/auth/hooks/useAuth';
```

**3. Domain-Driven Design (DDD) — cho dự án enterprise:**

Tương tự feature-based nhưng thêm lớp domain layer tách biệt business logic khỏi UI.

**Quy tắc vàng cho cấu trúc thư mục:**
- **Colocation**: Đặt các file liên quan gần nhau (component, hook, test, style cùng folder).
- **Barrel exports**: Dùng `index.ts` để kiểm soát public API của mỗi feature.
- **Dependency rule**: Feature A không import trực tiếp file nội bộ của Feature B, chỉ import qua `index.ts`.
- **Shared = dùng chung**: Chỉ đưa vào `shared/` khi code thực sự dùng ở 2+ features.
- **Bắt đầu đơn giản**: Dùng flat structure khi mới, chuyển sang feature-based khi project lớn lên. Không over-engineer từ đầu.
