---
sidebar_position: 2
title: "2. Cài đặt & Cấu hình TypeScript"
---

# Cài đặt & Cấu hình TypeScript


---

## Mục lục

- [Cài đặt TypeScript](#cài-đặt-typescript)
- [tsconfig.json — File cấu hình](#tsconfigjson--file-cấu-hình)
- [Compiler options phổ biến](#compiler-options-phổ-biến)
- [Chạy TypeScript](#chạy-typescript)
- [Setup với dự án React](#setup-với-dự-án-react)
- [Setup với Node.js](#setup-với-nodejs)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Cài đặt TypeScript

### Global installation (không khuyến khích)

```bash
# Cài toàn cầu
npm install -g typescript

# Kiểm tra version
tsc --version
```

### Local installation (khuyến khích)

```bash
# Khởi tạo dự án Node.js
npm init -y

# Cài TypeScript cục bộ
npm install --save-dev typescript

# Kiểm tra
npx tsc --version
```

### Setup nhanh với Node.js

```bash
# Khởi tạo tsconfig.json
npx tsc --init

# Tạo thư mục
mkdir -p src dist

# Viết file TypeScript
echo 'console.log("Hello, TypeScript!")' > src/index.ts

# Compile
npx tsc

# Chạy JavaScript output
node dist/index.js
```

---

## tsconfig.json — File cấu hình

**tsconfig.json** là file cấu hình compiler TypeScript. Nó chỉ định:
- Những files nào để compile
- Compiler options (target, module, strict...)
- Output directory

### Tạo tsconfig.json mặc định

```bash
npx tsc --init
```

Output:

```json
{
  "compilerOptions": {
    "target": "ES2020",              // Compile thành JavaScript version nào?
    "module": "commonjs",             // Module system (commonjs, es2015, esnext, ...)
    "lib": ["ES2020"],                // Library definitions (DOM, ES APIs, ...)
    "outDir": "./dist",               // Nơi output .js files
    "rootDir": "./src",               // Nơi chứa .ts files
    "strict": true,                   // Enable all strict type-checking options
    "esModuleInterop": true,          // Cho phép import CommonJS như ES modules
    "skipLibCheck": true,             // Skip type checking library files
    "forceConsistentCasingInFileNames": true // Force consistent casing
  },
  "include": ["src"],                 // Include files
  "exclude": ["node_modules", "dist"] // Exclude files
}
```

---

## Compiler options phổ biến

### Strict Mode Options

```json
{
  "compilerOptions": {
    // ===== STRICT MODE =====
    "strict": true,  // Enable ALL strict options

    // Equivalent to:
    "noImplicitAny": true,           // Error khi type là any
    "strictNullChecks": true,        // null/undefined không thể gán cho variable khác
    "strictFunctionTypes": true,     // Kiểm tra strict function signatures
    "strictBindCallApply": true,     // Kiểm tra strict bind, call, apply
    "strictPropertyInitialization": true // Check property initialization
  }
}
```

### Module & Target Options

```json
{
  "compilerOptions": {
    "target": "ES2020",              // Compile target: ES5, ES2015, ES2020, ...
    "module": "commonjs",            // Module system: commonjs, es2015, esnext, umd
    "lib": ["ES2020", "DOM"],        // Included library definitions

    // Output
    "outDir": "./dist",              // Output directory
    "rootDir": "./src",              // Root input directory
    "declaration": true,             // Generate .d.ts files
    "declarationMap": true,          // Generate .d.ts.map files
    "sourceMap": true,               // Generate .js.map files (debug)
    "noEmit": true                   // Không output files (chỉ check)
  }
}
```

### Strict Checking Options

```json
{
  "compilerOptions": {
    "noImplicitAny": true,           // any type phải explicit
    "noImplicitThis": true,          // this phải typed
    "alwaysStrict": true,            // "use strict" ở mỗi file
    "noUnusedLocals": true,          // Error khi có biến không dùng
    "noUnusedParameters": true,      // Error khi có parameter không dùng
    "noImplicitReturns": true,       // Error khi không return ở function
    "noFallthroughCasesInSwitch": true // Error khi switch case không break
  }
}
```

---

## Chạy TypeScript

### Cách 1: Compile thành JavaScript

```bash
# Compile tất cả files trong src
npx tsc

# Compile 1 file cụ thể
npx tsc src/index.ts

# Compile với tsconfig khác
npx tsc -p tsconfig.prod.json

# Watch mode — tự động compile khi file thay đổi
npx tsc --watch
```

### Cách 2: Chạy trực tiếp (ts-node)

```bash
# Cài ts-node
npm install --save-dev ts-node

# Chạy TypeScript file trực tiếp
npx ts-node src/index.ts

# Interactive REPL
npx ts-node
```

### Cách 3: Setup npm scripts

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsc --watch",
    "dev:run": "ts-node src/index.ts"
  }
}
```

```bash
npm run build   # Compile
npm start       # Chạy compiled JavaScript
npm run dev     # Watch mode
npm run dev:run # Chạy TypeScript trực tiếp
```

---

## Setup với dự án React

### Cách 1: Create React App (CRA)

```bash
# Tạo dự án React với TypeScript
npx create-react-app my-app --template typescript

# Hoặc với Vite (nhanh hơn)
npm create vite@latest my-app -- --template react-ts
```

### Cách 2: Manual setup

```bash
npm install react react-dom
npm install --save-dev typescript @types/react @types/react-dom
npm install --save-dev webpack webpack-cli ts-loader
```

**tsconfig.json cho React:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",              // JSX support
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

---

## Setup với Node.js

### Cách 1: ts-node (development)

```bash
npm install --save-dev typescript ts-node @types/node

npx ts-node src/index.ts
```

### Cách 2: Compile & run (production)

```bash
npm install --save-dev typescript @types/node

# package.json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  }
}
```

**tsconfig.json cho Node.js:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

---

## Lỗi thường gặp

### 1. "Cannot find module" error

```typescript
// ❌ Sai — quên cài @types
import express from 'express';
// Error: Cannot find module 'express'

// ✅ Cài type definitions
npm install --save-dev @types/express
```

### 2. "noEmit" output không tạo .js files

```json
// ❌ Sai — noEmit = true ngăn output files
{
  "compilerOptions": {
    "noEmit": true
  }
}

// ✅ Đúng — kỳ vọng output thì set false
{
  "compilerOptions": {
    "noEmit": false
  }
}
```

### 3. JSX không compile

```json
// ❌ Sai
{
  "compilerOptions": {
    // jsx option thiếu
  }
}

// ✅ Đúng
{
  "compilerOptions": {
    "jsx": "react-jsx"  // hoặc "react", "preserve"
  }
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: tsconfig.json là gì? Có options nào quan trọng nhất?

**Đáp án:** tsconfig.json là file cấu hình TypeScript compiler, chỉ định compiler options, include/exclude files. Options quan trọng: (1) **strict: true** — enable all type checking, (2) **target** — JavaScript version output, (3) **module** — module system (CommonJS, ESM), (4) **outDir/rootDir** — input/output directories, (5) **lib** — library definitions (ES APIs, DOM).

### Câu 2: "strict": true làm gì? Có tác dụng gì?

**Đáp án:** "strict": true enable **tất cả strict type-checking options** — noImplicitAny, strictNullChecks, strictFunctionTypes, etc. Nó tăng type safety đáng kể — bắt implicit any, null/undefined errors, function signature mismatches sớm hơn. Trade-off: code phải type-annotated đầy đủ hơn, nhưng quality cao hơn, bugs ít hơn.

### Câu 3: Chạy TypeScript file có bao nhiêu cách?

**Đáp án:** 3 cách chính: (1) **Compile + run** — `tsc file.ts` rồi `node file.js`, (2) **ts-node** — `npx ts-node file.ts` chạy trực tiếp (JIT), (3) **Watch mode** — `tsc --watch` tự động compile khi file thay đổi, rồi chạy JS output. Phát triển dùng ts-node (nhanh), production dùng compile + run (performance tốt).

### Câu 4: @types/xxx packages là gì?

**Đáp án:** **DefinitelyTyped packages** — type definitions cho JavaScript libraries không viết bằng TypeScript. VD: Express, Lodash, jQuery là thư viện JS cũ, không có type info. @types/express cung cấp `.d.ts` files mô tả Express API, cho phép TypeScript hiểu Express. Cài: `npm install --save-dev @types/[package-name]`.
