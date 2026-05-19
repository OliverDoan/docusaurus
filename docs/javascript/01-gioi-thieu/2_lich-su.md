---
sidebar_position: 2
title: "2. Lịch sử JavaScript"
---

# Lịch sử JavaScript

---

## Mục lục

- [Khởi nguồn](#khởi-nguồn)
- [Cuộc chiến trình duyệt](#cuộc-chiến-trình-duyệt)
- [ECMAScript ra đời](#ecmascript-ra-đời)
- [Bước ngoặt Node.js](#bước-ngoặt-nodejs)
- [JavaScript ngày nay](#javascript-ngày-nay)

---

## Khởi nguồn

Năm **1995**, **Brendan Eich** tại Netscape được giao nhiệm vụ tạo
ngôn ngữ kịch bản cho trình duyệt **Netscape Navigator**. Ông hoàn thành
prototype đầu tiên trong **10 ngày**.

Tên ngôn ngữ qua các giai đoạn:

- **Mocha** (tên nội bộ ban đầu).
- **LiveScript** (tháng 5/1995).
- **JavaScript** (tháng 12/1995, marketing ăn theo Java).

---

## Cuộc chiến trình duyệt

Microsoft nhanh chóng tạo **JScript** cho Internet Explorer (1996) —
phiên bản "clone" JavaScript. Hai bản không tương thích, gây đau đầu
cho dev web.

→ Cần một **chuẩn chung** để các trình duyệt cùng tuân thủ.

---

## ECMAScript ra đời

Năm **1997**, Netscape gửi JS lên **ECMA International** để chuẩn hoá.
Chuẩn được đặt tên là **ECMAScript (ES)** — vì "JavaScript" là trademark
của Sun/Oracle.

Các phiên bản quan trọng:

| Phiên bản | Năm | Điểm nhấn |
|-----------|-----|-----------|
| ES1 | 1997 | Phiên bản đầu tiên |
| ES3 | 1999 | RegExp, try/catch — chuẩn ổn định lâu dài |
| ES5 | 2009 | `strict mode`, `JSON`, array method (map, filter, reduce) |
| **ES6 / ES2015** | 2015 | `let`/`const`, arrow function, class, Promise, module — **cuộc cách mạng** |
| ES2017 | 2017 | `async`/`await` |
| ES2020 | 2020 | `?.` optional chaining, `??` nullish coalescing, `BigInt` |
| ES2022 | 2022 | Top-level `await`, class private field |
| ES2024+ | 2024+ | Iterator helpers, decorators, Temporal (sắp) |

:::info[Phân tích]

Từ **ES2015 trở đi**, ECMAScript phát hành **theo năm** thay vì đánh số
phiên bản lớn. Lý do: cộng đồng quá lớn, không thể chờ "big release"
mỗi 6 năm như ES6 — phải có release đều đặn để theo kịp nhu cầu.

Mỗi feature phải qua **5 stage** của TC39 (committee chuẩn):

- **Stage 0**: Strawperson (ý tưởng).
- **Stage 1**: Proposal (đã có champion).
- **Stage 2**: Draft (cú pháp ổn định).
- **Stage 3**: Candidate (chuẩn bị merge).
- **Stage 4**: Finished (vào spec năm sau).

Stage 3 là điểm các trình duyệt và Babel/SWC bắt đầu implement. Khi
đọc proposal trên https://github.com/tc39/proposals biết stage là biết
được khi nào dùng được trong production.

:::

---

## Bước ngoặt Node.js

Năm **2009**, **Ryan Dahl** tạo **Node.js** — JS chạy **ngoài trình
duyệt**, dùng engine V8. Đây là bước ngoặt biến JS từ ngôn ngữ "đồ
chơi cho web" thành ngôn ngữ **fullstack**.

```bash
# Chạy JS không cần trình duyệt
node script.js
```

Hệ quả:

- **npm** (2010) trở thành package manager lớn nhất thế giới.
- Developer có thể viết cả frontend + backend bằng cùng một ngôn ngữ.
- Hệ sinh thái build tool (Webpack, Babel, esbuild...) nở rộ.

---

## JavaScript ngày nay

JavaScript là ngôn ngữ **phổ biến nhất** trên StackOverflow Survey hơn
10 năm liền. Phạm vi hiện tại:

- **Web frontend**: React, Vue, Svelte, Solid.
- **Web backend**: Node.js, Bun, Deno, NestJS.
- **Mobile**: React Native, Ionic.
- **Desktop**: Electron (VS Code, Discord, Slack, Figma...).
- **Edge computing**: Cloudflare Workers, Vercel Edge.
- **AI/ML**: TensorFlow.js, transformers.js.

:::tip[Mẹo]

Khi đọc tài liệu cũ, nếu thấy "ES5 code", "Pre-ES6 syntax" — hiểu rằng
đó là code **trước 2015**: dùng `var`, không có arrow function,
template string... Code hiện đại nên ở **ES2020+** trở lên, vì các
trình duyệt phổ biến đều đã hỗ trợ native.

:::
