---
sidebar_position: 3
title: "3. Cài đặt và chạy TypeScript"
---

# Cài đặt và chạy TypeScript

Vì trình duyệt và Node.js không hiểu file `.ts` trực tiếp, bạn cần một **compiler** (trình biên dịch) để chuyển TypeScript thành JavaScript trước khi chạy. Bài này hướng dẫn cài TypeScript qua npm, dùng `tsc` (compiler chính thức) để biên dịch, và các cách chạy nhanh như `ts-node` hay `tsx` cho người mới bắt đầu.

---

## Mục lục

- [Cài đặt TypeScript](#cài-đặt-typescript)
- [Chạy bằng tsc (compiler chính thức)](#chạy-bằng-tsc-compiler-chính-thức)
- [Chạy trực tiếp bằng ts-node](#chạy-trực-tiếp-bằng-ts-node)
- [TypeScript Playground](#typescript-playground)
- [Các runtime hỗ trợ TS trực tiếp](#các-runtime-hỗ-trợ-ts-trực-tiếp)

---

## Cài đặt TypeScript

Yêu cầu: Node.js ≥ 18.

**Cài global** (dùng cho mọi project):

```bash
npm install -g typescript
tsc --version
```

**Cài local trong project** (khuyên dùng):

```bash
npm install --save-dev typescript
npx tsc --version
```

:::info[Phân tích]

**Luôn ưu tiên cài local** thay vì global. Lý do:

- Mỗi project có thể dùng phiên bản TS khác nhau — global gây xung đột.
- CI/CD và dev khác máy phải có version giống hệt → reproducible build.
- `package.json` ghi rõ version dùng → dễ track lịch sử.

Phiên bản TS lock trong `package-lock.json` mới là phiên bản thật sự
build production.

:::

---

## Chạy bằng tsc (compiler chính thức)

`tsc` (TypeScript Compiler) là tool chuẩn để biên dịch `.ts` → `.js`.

Tạo file `hello.ts`:

```ts
const message: string = "Hello TypeScript";
console.log(message);
```

Compile:

```bash
npx tsc hello.ts
# Sinh ra hello.js cùng thư mục
```

Chạy file JS đã sinh ra:

```bash
node hello.js
```

**Khởi tạo `tsconfig.json`** cho cả project:

```bash
npx tsc --init
```

Sau đó chỉ cần gõ `npx tsc` để compile **toàn bộ project** theo cấu hình.

**Chế độ watch** — tự compile lại khi file thay đổi:

```bash
npx tsc --watch
```

---

## Chạy trực tiếp bằng ts-node

`ts-node` là REPL/runner cho phép chạy file `.ts` **không cần compile
trước**, tiện cho dev và script:

```bash
npm install --save-dev ts-node
npx ts-node hello.ts
```

Hoặc REPL tương tác:

```bash
npx ts-node
> const x: number = 10
> x + 5
15
```

:::warning[Cần lưu ý]

`ts-node` **không** thay thế cho `tsc` khi build production. Nó:

- Compile trong memory mỗi lần chạy → chậm hơn JS thuần.
- Có thể bỏ qua một số lỗi mà `tsc --noEmit` bắt được.
- Khi deploy, luôn build trước bằng `tsc` rồi chạy bằng `node` thuần.

`ts-node` chỉ phù hợp cho: dev scripts, tests, REPL, tooling.

:::

---

## TypeScript Playground

Không muốn cài gì? Vào **https://www.typescriptlang.org/play** — môi
trường TS chạy trên trình duyệt với:

- Compiler đầy đủ (đổi version được).
- Xem output JS được sinh ra theo thời gian thực.
- Chia sẻ snippet qua URL.
- Đổi `tsconfig` options ngay trong giao diện.

:::tip[Mẹo]

Playground là công cụ **debug type tốt nhất**. Khi bạn không hiểu vì sao
TS báo lỗi, copy đoạn code lên Playground, hover vào biến để xem TS
infer ra type gì. Cực kỳ hữu ích cho generic và conditional type phức tạp.

:::

---

## Các runtime hỗ trợ TS trực tiếp

Năm 2024–2026 nhiều runtime đã chạy TS **không cần build**:

| Runtime | Hỗ trợ TS |
|---------|-----------|
| **Deno** | Native, không cần config |
| **Bun** | Native, rất nhanh |
| **Node.js ≥ 22.6** | Có flag `--experimental-strip-types` |
| **tsx** | Drop-in thay thế `ts-node`, dùng esbuild → nhanh hơn nhiều |

```bash
# Chạy TS nhanh hơn ts-node
npm install --save-dev tsx
npx tsx hello.ts
```

:::info[Phân tích]

Các runtime "chạy TS trực tiếp" thực ra chỉ **strip type annotation**
(xóa `: string`, `: number`) chứ **không type-check**. Lỗi type sẽ
**không bị bắt** khi chạy bằng Bun / Node `--strip-types` / tsx.

→ Workflow chuẩn: dùng `tsc --noEmit` trong CI/pre-commit để type-check,
dùng runtime nhanh (tsx/Bun) để chạy thực thi.

:::
