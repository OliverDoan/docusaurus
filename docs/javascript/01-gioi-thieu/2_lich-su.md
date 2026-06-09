---
sidebar_position: 2
title: "2. Lịch sử JavaScript"
---

# Lịch sử JavaScript

Bài này kể lại hành trình của JavaScript: từ lúc ra đời chỉ trong 10 ngày năm 1995, qua "cuộc chiến trình duyệt" (browser war), đến khi được chuẩn hoá thành **ECMAScript** (bản tiêu chuẩn chính thức của ngôn ngữ) và bùng nổ nhờ **Node.js**. Hiểu lịch sử giúp người mới biết vì sao JavaScript có nhiều cách viết khác nhau và tại sao nó lại quan trọng đến vậy ngày nay.

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

> **Prototype** (bản mẫu) là một **phiên bản thử nghiệm sơ khai** của sản phẩm, làm nhanh để chạy thử và chứng minh ý tưởng khả thi — chưa hoàn chỉnh, còn thiếu tính năng. Ở đây nghĩa là Brendan Eich dựng được bản JavaScript chạy được đầu tiên chỉ trong 10 ngày, rồi mới hoàn thiện dần sau đó. (Lưu ý: từ này khác với khái niệm *prototype* trong cơ chế kế thừa của JavaScript.)

Tên ngôn ngữ qua các giai đoạn:

- **Mocha** (tên nội bộ ban đầu).
- **LiveScript** (tháng 5/1995).
- **JavaScript** (tháng 12/1995, marketing ăn theo Java).

---

## Cuộc chiến trình duyệt

"Cuộc chiến trình duyệt" (browser war) là giai đoạn cuối thập niên 1990,
khi **Netscape** và **Microsoft** đua nhau giành thị phần trình duyệt
bằng cách tự thêm tính năng riêng — thay vì cùng theo một chuẩn.

Diễn biến chính:

- **1995**: Netscape Navigator thống trị, đi kèm **JavaScript**.
- **1996**: Microsoft tung **Internet Explorer** kèm **JScript** — một
  bản "clone" JavaScript (vì JS là của Netscape, Microsoft không được
  dùng đúng tên).
- Hai hãng liên tục thêm tính năng độc quyền chỉ chạy trên trình duyệt
  của mình, không thèm tương thích với nhau.

Hệ quả với dev web:

- Cùng một đoạn code chạy **khác nhau** (hoặc lỗi) trên IE và Netscape.
- Phải viết code **rẽ nhánh** kiểu "nếu là IE thì làm thế này, nếu là
  Netscape thì làm thế kia" → tốn công, dễ lỗi.
- Xuất hiện huy hiệu **"Best viewed in Internet Explorer"** trên nhiều
  website — dấu hiệu của sự phân mảnh.

→ Cần một **chuẩn chung** để các trình duyệt cùng tuân thủ, dẫn tới sự
ra đời của **ECMAScript** (mục bên dưới).

:::info[Phân tích]

Microsoft cuối cùng **thắng cuộc chiến thứ nhất**: IE đạt ~95% thị phần
đầu những năm 2000 sau khi được nhúng sẵn vào Windows. Nhưng việc IE
"đứng yên không cải tiến" suốt nhiều năm sau đó lại mở đường cho
**Firefox** (2004) và **Chrome** (2008) — châm ngòi cho **cuộc chiến
trình duyệt lần hai**. Bài học còn nguyên giá trị: **đứng ngoài chuẩn
chung** giúp thắng ngắn hạn nhưng gây hại lâu dài cho cả hệ sinh thái.

:::

---

## ECMAScript ra đời

Năm **1997**, Netscape gửi JS lên **ECMA International** để chuẩn hoá.
Chuẩn được đặt tên là **ECMAScript (ES)** — vì "JavaScript" là trademark
của Sun/Oracle.

> **ECMA International** là một **tổ chức tiêu chuẩn quốc tế** (lập năm 1961, trụ sở tại Geneva, Thụy Sĩ), chuyên xây dựng các chuẩn cho công nghệ thông tin và truyền thông. "Chuẩn hoá" nghĩa là tổ chức này đặt ra **bộ quy tắc chung** để mọi trình duyệt cùng tuân theo, nhờ vậy cùng một đoạn code JavaScript chạy giống nhau ở Chrome, Firefox, Safari... Ngoài JavaScript (ECMAScript), ECMA còn chuẩn hoá nhiều công nghệ khác như JSON, C#, Dart.

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
