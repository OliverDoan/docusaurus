---
sidebar_position: 3
title: "3. NPM & Package Management"
---

# NPM & Package Management

NPM là trình quản lý package mặc định của Node.js, giúp bạn cài đặt và quản lý các thư viện cho dự án. Bài này hướng dẫn khởi tạo project, cài package, phân biệt `dependencies` với `devDependencies`, hiểu cách đánh version (SemVer) và dùng NPM scripts. Đây là kiến thức nền tảng cho mọi dự án Node.js.

---

## Mục lục

- [NPM là gì?](#npm-là-gì)
- [Khởi tạo project](#khởi-tạo-project)
- [Cài đặt packages](#cài-đặt-packages)
- [dependencies vs devDependencies](#dependencies-vs-devdependencies)
- [Versioning (SemVer)](#versioning-semver)
- [NPM Scripts](#npm-scripts)
- [package-lock.json](#package-lockjson)
- [Tóm tắt](#tóm-tắt)

---

## NPM là gì?

**NPM** (Node Package Manager) là trình quản lý package mặc định của Node.js, cung cấp:

- **Registry** — Kho chứa hơn 2 triệu packages
- **CLI** — Command-line tool để cài đặt và quản lý packages
- **`package.json`** — File cấu hình project

## Khởi tạo project

```bash
# Tạo package.json với wizard
npm init

# Tạo nhanh với default
npm init -y
```

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "My Node.js app",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

## Cài đặt packages

```bash
# Cài production dependency
npm install express
npm i express          # shorthand

# Cài dev dependency
npm install --save-dev nodemon
npm i -D nodemon       # shorthand

# Cài global
npm install -g typescript

# Cài từ package.json
npm install
npm ci                  # clean install (cho CI/CD)
```

## dependencies vs devDependencies

```json
{
  "dependencies": {
    "express": "^4.18.2"    // Cần khi chạy app
  },
  "devDependencies": {
    "nodemon": "^3.0.0",    // Chỉ cần khi phát triển
    "jest": "^29.0.0"
  }
}
```

## Versioning (SemVer)

Format: `MAJOR.MINOR.PATCH`

```
^4.18.2  →  >=4.18.2 < 5.0.0   (caret — cho phép minor + patch updates)
~4.18.2  →  >=4.18.2 < 4.19.0  (tilde — chỉ patch updates)
4.18.2   →  exactly 4.18.2      (exact version)
```

## NPM Scripts

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "dev": "nodemon src/index.js",
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src/",
    "prestart": "npm run build"
  }
}
```

```bash
npm start        # chạy script "start"
npm run dev      # chạy script "dev" (custom scripts cần "run")
npm test         # shorthand cho "test"
```

## package-lock.json

- Khoá chính xác version của mọi dependency
- **Luôn commit** file này vào git
- Đảm bảo mọi người cài cùng phiên bản

## Tóm tắt

- NPM là package manager mặc định của Node.js
- `package.json` quản lý metadata và dependencies
- Phân biệt `dependencies` vs `devDependencies`
- Hiểu SemVer để quản lý version an toàn
- Luôn commit `package-lock.json`
