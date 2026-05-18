---
sidebar_position: 2
title: "2. Lịch sử JavaScript"
---

# Lịch sử JavaScript

---

## Mục lục

- [Bối cảnh ra đời (1995)](#bối-cảnh-ra-đời-1995)
- [10 ngày tạo ra một ngôn ngữ](#10-ngày-tạo-ra-một-ngôn-ngữ)
- [Tên gọi: Mocha → LiveScript → JavaScript](#tên-gọi-mocha--livescript--javascript)
- [Cuộc chiến trình duyệt và ECMAScript](#cuộc-chiến-trình-duyệt-và-ecmascript)
- [Các cột mốc lớn](#các-cột-mốc-lớn)
- [JavaScript hiện đại](#javascript-hiện-đại)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Bối cảnh ra đời (1995)

Giữa thập niên 90, **web** mới ra đời và còn rất sơ khai:

- Trang web chỉ là **văn bản tĩnh** — không nút bấm, không animation, không tương tác
- Netscape Navigator là trình duyệt phổ biến nhất (chiếm hơn 80% thị phần)
- Microsoft chuẩn bị tung ra Internet Explorer (cuộc chiến trình duyệt sắp nổ ra)

Netscape cần một ngôn ngữ kịch bản (scripting language) để chạy trên trình duyệt — nhằm:
- Kiểm tra form ngay tại client (không phải gửi lên server)
- Tạo hiệu ứng tương tác đơn giản
- Cạnh tranh với Java Applet đang rất hot lúc bấy giờ

## 10 ngày tạo ra một ngôn ngữ

**Brendan Eich** được Netscape thuê vào tháng 4/1995 với nhiệm vụ ban đầu là tích hợp ngôn ngữ Scheme (một dialect của Lisp) vào trình duyệt.

Tuy nhiên ban giám đốc thay đổi hướng đi:
> "Chúng ta cần một ngôn ngữ trông giống Java để marketing dễ hơn."

Brendan Eich đã viết **prototype JavaScript trong vỏn vẹn 10 ngày** (tháng 5/1995). Đây là lý do JS có nhiều **quirk** (lỗi thiết kế) không thể sửa được vì lý do tương thích:

```js
// Quirk: cộng số và chuỗi
1 + "2"     // "12"  ← chuyển 1 thành chuỗi
1 - "2"     // -1    ← chuyển "2" thành số
[] + []     // ""    
[] + {}     // "[object Object]"

// Quirk: typeof null
typeof null // "object"  ← bug lịch sử không sửa được

// Quirk: so sánh
"0" == false  // true
[] == false   // true
NaN === NaN   // false
```

## Tên gọi: Mocha → LiveScript → JavaScript

Ngôn ngữ này đã đổi tên **ba lần** trước khi ổn định:

| Tên | Thời điểm | Lý do |
|-----|-----------|-------|
| **Mocha** | Tháng 5/1995 | Tên gốc của Brendan Eich |
| **LiveScript** | Tháng 9/1995 | Đổi tên khi ra mắt Netscape 2.0 beta |
| **JavaScript** | Tháng 12/1995 | Netscape kí thỏa thuận với Sun Microsystems (chủ của Java) để mượn cái tên Java |

> Tên "JavaScript" thuần túy là **chiêu marketing**. JavaScript **KHÔNG có quan hệ kĩ thuật** với Java — cả hai khác nhau như con báo (java) và cái xe (javascript).

## Cuộc chiến trình duyệt và ECMAScript

### Vấn đề chia rẽ (1996)

Khi JavaScript thành công, Microsoft phát hành **JScript** trên Internet Explorer 3 (1996) — một bản sao gần giống nhưng không hoàn toàn tương thích với JavaScript của Netscape.

Hệ quả: lập trình viên phải viết code khác nhau cho từng trình duyệt — ác mộng.

### Chuẩn hoá: ECMAScript ra đời (1997)

Netscape gửi JavaScript đến **ECMA International** (một tổ chức chuẩn hoá) để tạo ra một chuẩn chung. Tên "ECMAScript" sinh ra vì:
- "JavaScript" là **trademark của Sun/Oracle**, ECMA không được dùng
- Brendan Eich đùa rằng "ECMAScript" nghe như "một bệnh ngoài da không ai muốn nhắc đến"

**ECMA-262** là tài liệu chuẩn của ECMAScript, lần đầu công bố tháng 6/1997.

## Các cột mốc lớn

| Phiên bản | Năm | Tính năng nổi bật |
|-----------|-----|-------------------|
| **ES1** | 1997 | Phiên bản đầu tiên |
| **ES2** | 1998 | Đồng bộ với chuẩn ISO |
| **ES3** | 1999 | `try/catch`, regex, `do/while`, `switch` |
| ES4 | — | **Bị huỷ** — quá tham vọng, gây tranh cãi |
| **ES5** | 2009 | `"use strict"`, `JSON`, `Array.prototype.forEach/map/filter`, getter/setter |
| **ES6 / ES2015** | 2015 | `let/const`, arrow function, class, Promise, module, template literal, destructuring, default params, spread/rest, `Map/Set` |
| **ES2016** | 2016 | `**` (exponent), `Array.includes` |
| **ES2017** | 2017 | `async/await`, `Object.values/entries` |
| **ES2018** | 2018 | Spread cho object, `for await...of`, regex `named groups` |
| **ES2019** | 2019 | `Array.flat`, `Object.fromEntries`, optional `catch (e)` |
| **ES2020** | 2020 | `?.` (optional chaining), `??` (nullish coalescing), `BigInt`, `Promise.allSettled` |
| **ES2021** | 2021 | `String.replaceAll`, `Promise.any`, `WeakRef`, logical assignment `??=` |
| **ES2022** | 2022 | Top-level `await`, `class` private fields, `at()` |
| **ES2023** | 2023 | `Array.findLast`, immutable array methods |
| **ES2024** | 2024 | `Object.groupBy`, `Promise.withResolvers` |

## JavaScript hiện đại

### 2009 — Node.js ra đời

**Ryan Dahl** tạo ra Node.js — đưa JavaScript ra khỏi trình duyệt và chạy trên server. Đây là bước ngoặt lớn nhất kể từ khi JS ra đời.

### 2015 — ES6 thay đổi cuộc chơi

ES6 (ES2015) là phiên bản lớn nhất, đưa JavaScript trở thành ngôn ngữ "hiện đại":
- `class` cho OOP
- `Promise` cho async
- Module system
- Arrow function

### 2017 — async/await

`async/await` biến code bất đồng bộ trở nên dễ đọc như code đồng bộ — chấm dứt thời kì callback hell.

### Ngày nay

JavaScript có mặt **ở khắp mọi nơi**:
- **Frontend:** React, Vue, Angular, Svelte
- **Backend:** Node.js, Deno, Bun
- **Mobile:** React Native, Ionic
- **Desktop:** Electron (VS Code, Discord, Slack)
- **AI/ML:** TensorFlow.js, transformer.js
- **Game:** Three.js, Phaser

Theo khảo sát Stack Overflow, **JavaScript là ngôn ngữ được dùng nhiều nhất** trong hơn **10 năm liên tiếp**.

---

## Câu hỏi phỏng vấn

### Câu 1: Tại sao JavaScript có tên giống Java nhưng không phải Java?

**Đáp án:**

JavaScript được Brendan Eich tạo ra năm 1995 với tên ban đầu là **Mocha**, sau đổi thành **LiveScript**. Cuối năm 1995, Netscape **kí thoả thuận với Sun Microsystems** (chủ sở hữu Java) để mượn cái tên "Java" — lý do thuần tuý là **marketing**, vì Java đang rất hot. Hai ngôn ngữ này về kĩ thuật **hoàn toàn khác nhau**.

### Câu 2: ECMAScript và JavaScript khác nhau thế nào?

**Đáp án:**

- **ECMAScript** là **chuẩn ngôn ngữ** (specification) do ECMA International ban hành — giống như "bản vẽ kĩ thuật".
- **JavaScript** là **bản triển khai** (implementation) chuẩn đó của Netscape (sau này là các engine V8, SpiderMonkey, JavaScriptCore...).
- Các "trình thông dịch JS" khác như JScript (IE), ActionScript (Flash) cũng đều dựa trên ECMAScript.

### Câu 3: Vì sao ES4 bị huỷ?

**Đáp án:**

ES4 dự kiến ra mắt giai đoạn 2007-2008 với nhiều tính năng "đột phá": class, generics, type annotations (giống TypeScript ngày nay), namespaces...

Tuy nhiên các thành viên TC39 không thống nhất được (đặc biệt là Microsoft và Yahoo phản đối mạnh). Cuối cùng nhóm chia làm hai:
- **ES3.1 → ES5** (2009): cải tiến nhỏ, ổn định
- Các ý tưởng ES4 → đưa vào **ES6** (2015) sau khi đã thiết kế lại
