---
sidebar_position: 4
title: "4. Cách chạy JavaScript"
---

# Cách chạy JavaScript

---

## Mục lục

- [JavaScript Engine](#javascript-engine)
- [Cách 1: Browser Console](#cách-1-browser-console)
- [Cách 2: Nhúng vào HTML](#cách-2-nhúng-vào-html)
- [Cách 3: Node.js](#cách-3-nodejs)
- [Cách 4: Online Playground](#cách-4-online-playground)
- [Cách 5: VS Code + Live Server](#cách-5-vs-code--live-server)
- [Cách 6: Bun & Deno](#cách-6-bun--deno)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## JavaScript Engine

JS không tự chạy — nó cần một **engine** để biên dịch và thực thi:

| Engine | Trình duyệt | Ngôn ngữ engine |
|--------|-------------|-----------------|
| **V8** | Chrome, Edge, Node.js | C++ |
| **SpiderMonkey** | Firefox | C++ |
| **JavaScriptCore** | Safari | C++ |
| **Chakra** | IE (cũ) | C++ |

V8 là engine **phổ biến nhất** vì:
- Là engine của Chrome (chiếm ~70% thị phần)
- Là nền tảng của Node.js (server-side JS)
- Mã nguồn mở, được Google đầu tư mạnh

## Cách 1: Browser Console

Cách **nhanh nhất** để thử JS — không cần cài gì.

### Mở Console

| Trình duyệt | Phím tắt |
|-------------|----------|
| Chrome, Edge | `F12` hoặc `Ctrl+Shift+J` (Mac: `Cmd+Option+J`) |
| Firefox | `F12` hoặc `Ctrl+Shift+K` |
| Safari | Bật Developer Tools → `Cmd+Option+C` |

### Gõ code trực tiếp

```js
// Phép tính đơn giản
2 + 3;            // 5
"Hello" + "!";    // "Hello!"

// In ra console
console.log("Xin chào!");

// Hiện popup
alert("Cảnh báo!");

// Khai báo biến
let name = "Alice";
console.log(`Hello, ${name}`);

// Loop
for (let i = 0; i < 3; i++) console.log(i);
```

### Ưu / nhược điểm

| Ưu điểm | Nhược điểm |
|---------|------------|
| Không cần cài đặt | Không lưu code |
| Test nhanh ý tưởng | Khó viết code dài |
| Xem ngay kết quả | Không thuận tiện debug |

## Cách 2: Nhúng vào HTML

Đây là cách **truyền thống** để chạy JS trên web.

### Cách A: Inline script

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Demo</title>
</head>
<body>
  <h1 id="title">Chào!</h1>
  
  <script>
    // Code JS viết trực tiếp
    const title = document.getElementById("title");
    title.style.color = "blue";
    title.textContent = "Đã đổi bằng JS";
  </script>
</body>
</html>
```

### Cách B: External script (khuyến nghị)

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Demo</title>
</head>
<body>
  <h1>Trang web</h1>
  <script src="app.js"></script>
</body>
</html>
```

```js
// app.js
console.log("Chạy từ file ngoài!");
```

### Vị trí đặt thẻ `<script>`

```html
<!-- ❌ KHÔNG nên: trong <head> không có defer -->
<head>
  <script src="app.js"></script>  <!-- Chặn render -->
</head>

<!-- ✅ Cách 1: cuối <body> -->
<body>
  <!-- HTML content -->
  <script src="app.js"></script>
</body>

<!-- ✅ Cách 2: defer (tải song song, chạy sau khi HTML xong) -->
<head>
  <script src="app.js" defer></script>
</head>

<!-- ✅ Cách 3: type="module" (tự động defer) -->
<head>
  <script src="app.js" type="module"></script>
</head>
```

## Cách 3: Node.js

**Node.js** cho phép JavaScript chạy **ngoài trình duyệt** — trên server, CLI tool, scripts...

### Cài đặt

1. Tải từ [nodejs.org](https://nodejs.org) (chọn **LTS** version)
2. Hoặc dùng **nvm** (Node Version Manager) — khuyến nghị:

```bash
# Mac/Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install --lts
nvm use --lts
```

### Kiểm tra

```bash
node --version    # v20.x.x
npm --version     # 10.x.x
```

### Chạy file JS

```js
// hello.js
const greeting = "Xin chào từ Node.js!";
console.log(greeting);

const fs = require("fs");
fs.writeFileSync("output.txt", greeting);
console.log("Đã ghi file!");
```

```bash
node hello.js
# Xin chào từ Node.js!
# Đã ghi file!
```

### REPL của Node

```bash
node     # Mở REPL (Read-Eval-Print Loop)
> 2 + 3
5
> const arr = [1, 2, 3];
> arr.map(x => x * 2)
[ 2, 4, 6 ]
> .exit
```

## Cách 4: Online Playground

Khi chỉ muốn **thử nghiệm nhanh** không cài đặt:

| Trang | Đặc điểm |
|-------|----------|
| [codepen.io](https://codepen.io) | HTML + CSS + JS, preview live |
| [codesandbox.io](https://codesandbox.io) | Full IDE, hỗ trợ React/Vue |
| [stackblitz.com](https://stackblitz.com) | Chạy Node.js trên browser (WebContainers) |
| [jsfiddle.net](https://jsfiddle.net) | Cổ điển, đơn giản |
| [replit.com](https://replit.com) | Hỗ trợ nhiều ngôn ngữ |
| [playcode.io](https://playcode.io) | Nhẹ, nhanh |

## Cách 5: VS Code + Live Server

**Stack khuyến nghị** cho người mới học web:

### Bước 1: Cài VS Code

Tải từ [code.visualstudio.com](https://code.visualstudio.com).

### Bước 2: Cài extension Live Server

1. Mở VS Code → Extensions (`Ctrl+Shift+X`)
2. Tìm "Live Server" (tác giả: Ritwick Dey)
3. Click **Install**

### Bước 3: Chạy

1. Tạo file `index.html`
2. Click chuột phải → **"Open with Live Server"**
3. Browser tự mở, tự reload khi sửa code

### Extension JavaScript hữu ích khác

- **Prettier** — format code tự động
- **ESLint** — phát hiện lỗi cú pháp / best practice
- **JavaScript (ES6) code snippets** — gõ tắt nhanh
- **Quokka.js** — chạy JS inline trong VS Code (xem kết quả ngay bên cạnh)

## Cách 6: Bun & Deno

Các runtime JS **thế hệ mới**, thay thế Node.js:

### Bun (2022)

```bash
# Cài
curl -fsSL https://bun.sh/install | bash

# Chạy
bun run app.js

# Test (built-in)
bun test

# Server (cực nhanh)
bun --hot server.js
```

**Ưu điểm:** Nhanh hơn Node ~3x, có sẵn TypeScript, JSX, bundler, test runner.

### Deno (2018)

```bash
# Cài
curl -fsSL https://deno.land/install.sh | sh

# Chạy
deno run app.ts
```

**Ưu điểm:** Bảo mật mặc định (cần `--allow-read` để đọc file), hỗ trợ TypeScript native, dùng URL imports thay vì `node_modules`.

| Tiêu chí | Node.js | Bun | Deno |
|----------|---------|-----|------|
| Tốc độ | Tốt | ⚡ Cực nhanh | Tốt |
| Hệ sinh thái | 🥇 Lớn nhất | Tương thích npm | Riêng + npm |
| TypeScript | Cần Babel | ✅ Built-in | ✅ Built-in |
| Bảo mật | Không default | Không default | ✅ Permission-based |
| Production-ready | ✅ Có | Đang dần ổn định | ✅ Có |

---

## Câu hỏi phỏng vấn

### Câu 1: Sự khác biệt giữa `async`, `defer` và bình thường khi load script?

**Đáp án:**

```html
<!-- 1. Bình thường: chặn HTML parser -->
<script src="a.js"></script>

<!-- 2. async: tải song song, chạy ngay khi xong (không đảm bảo thứ tự) -->
<script src="a.js" async></script>

<!-- 3. defer: tải song song, chạy sau khi HTML xong (đảm bảo thứ tự) -->
<script src="a.js" defer></script>
```

| Thuộc tính | Tải | Chạy | Thứ tự |
|------------|-----|------|--------|
| (bình thường) | Chặn HTML | Ngay khi tải xong | Theo thứ tự |
| `async` | Song song | Ngay khi xong | Không đảm bảo |
| `defer` | Song song | Sau khi HTML xong | Theo thứ tự |

**Khuyến nghị:** dùng `defer` cho hầu hết script trừ khi có lý do đặc biệt.

### Câu 2: V8 hoạt động như thế nào?

**Đáp án:**

V8 (engine của Chrome & Node) sử dụng kĩ thuật **JIT compilation**:

1. **Parser** → biến code thành AST (Abstract Syntax Tree)
2. **Ignition** (interpreter) → biến AST thành bytecode và chạy
3. **TurboFan** (optimizing compiler) → biên dịch các đoạn code "nóng" (chạy nhiều lần) thành **mã máy** để chạy nhanh hơn
4. **Garbage Collector** → tự động giải phóng bộ nhớ không dùng

Kết quả: JS chạy gần với tốc độ C++ ở các đoạn code được tối ưu.

### Câu 3: Node.js có thay thế trình duyệt không?

**Đáp án:**

**Không** — Node.js chạy JS **ngoài trình duyệt** nhưng **không có**:
- `window`, `document`, DOM API
- `localStorage`, `sessionStorage`
- `alert`, `prompt`, `confirm`
- Các Web API như `Fetch` (trước Node 18), `FormData`, ...

Đổi lại, Node có:
- `fs` (file system), `path`, `os` — thao tác hệ thống
- `http` — tạo server
- `process` — biến môi trường, args
- `Buffer` — xử lý binary
