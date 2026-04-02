---
sidebar_position: 2
title: "Cài đặt môi trường"
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
