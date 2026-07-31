---
sidebar_position: 3
title: "3. NPM & Package Management"
---

# NPM & Package Management

NPM là trình quản lý package mặc định của Node.js, giúp bạn cài đặt và quản lý các thư viện cho dự án. Bài này hướng dẫn khởi tạo project, cài package, phân biệt `dependencies` với `devDependencies`, hiểu cách đánh version (SemVer) và dùng NPM scripts. Đây là kiến thức nền tảng cho mọi dự án Node.js.

---

:::note[Ghi nhớ nhanh]

- ⭐ **`npm` quản lý thư viện qua `package.json`** — cài bằng một lệnh, không phải tự viết lại tiện ích.
- **`dependencies` vs `devDependencies`** — cái cần khi chạy app, cái chỉ dùng khi phát triển (cài với `-D`).
- **SemVer `MAJOR.MINOR.PATCH`** — `^` cho phép minor + patch, `~` chỉ patch, số trần là exact version.
- **NPM scripts** — gom lệnh `build` / `test` / `dev`; script custom phải chạy bằng `npm run`.
- **Luôn commit `package-lock.json`** — dùng `npm ci` để cài lại chính xác cho CI/CD.

:::

---

## Mục lục

- [Vì sao có npm?](#vì-sao-có-npm)
- [NPM là gì?](#npm-là-gì)
- [Khởi tạo project](#khởi-tạo-project)
- [Cài đặt packages](#cài-đặt-packages)
- [dependencies vs devDependencies](#dependencies-vs-devdependencies)
- [Versioning (SemVer)](#versioning-semver)
- [NPM Scripts](#npm-scripts)
- [package-lock.json](#package-lockjson)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao có npm?

**Vấn đề:** Trước npm, mỗi dự án phải tự viết lại mọi tiện ích (parse JSON, validate input, HTTP client...) rất tốn công. Việc chia sẻ và quản lý **phiên bản** thư viện làm thủ công bằng cách copy file vào dự án dễ bị lệch phiên bản, dẫn đến lỗi "works on my machine", và rất khó cập nhật khi thư viện ra bản mới.

```bash
# Cách cũ: tải file thủ công rồi copy vào dự án
# Mỗi máy một phiên bản → khó biết ai đang dùng bản nào
cp ~/Downloads/some-lib-v1.2.js ./libs/some-lib.js
```

**Giải pháp:** npm cung cấp một hệ sinh thái hoàn chỉnh để tái sử dụng code đã được kiểm chứng:

```json
{
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

```bash
# registry: kho package khổng lồ, cài bằng một lệnh
npm install express

# semver (^, ~) cho phép cập nhật an toàn
# lockfile khoá phiên bản chính xác → cài lại giống hệt nhau
npm ci

# scripts: chuẩn hoá lệnh build/test/dev cho cả team
npm run build
```

- **Registry** — kho package khổng lồ, không cần tự viết lại.
- **`package.json`** — khai báo dependency rõ ràng.
- **SemVer (`^`, `~`)** — kiểm soát mức cập nhật cho phép.
- **Lockfile** — khoá phiên bản chính xác, cài lại giống hệt nhau.

:::tip[Dùng thực tế]

- **Cài thư viện:** `npm i express` để dùng ngay, không phải tự viết HTTP server.
- **Khoá version:** commit `package-lock.json` để mọi máy và CI cài đúng cùng một phiên bản.
- **npm scripts:** gom lệnh `build`/`test`/`dev` vào `package.json` cho cả team chạy giống nhau.
- **Publish nội bộ:** đóng gói module dùng chung của công ty thành package và `npm publish` lên registry nội bộ để tái sử dụng giữa các dự án.

:::

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
