---
sidebar_position: 1
title: "1. Module Federation với Next.js"
---

# Module Federation với Next.js

Tích hợp Module Federation vào **Next.js** khó hơn React thuần, vì Next.js có
kiến trúc riêng (SSR, không có async boundary mặc định). Bài này giải thích **vì
sao cần plugin chuyên dụng `@module-federation/nextjs-mf`**, cách cấu hình host &
remote, và — quan trọng — **những hạn chế** bạn phải biết trước khi chọn hướng
này.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Next.js tự quản entry nên thiếu `async boundary`** → bắt buộc dùng `@module-federation/nextjs-mf` (`NextFederationPlugin`), không dùng `ModuleFederationPlugin` trần.
- ⭐ **Hạn chế lớn cần biết trước** — `App Router` hỗ trợ chưa hoàn thiện, `SSR` phức tạp, API đổi nhiều theo phiên bản, CSS-in-JS dễ lỗi.
- **Remote khai `exposes`; host khai `remotes`** trỏ tới `.../_next/static/chunks/remoteEntry.js`.
- **Dùng remote qua `next/dynamic`** — thường để `ssr: false` cho an toàn lúc đầu.
- **Luôn đối chiếu tài liệu đúng phiên bản** (module-federation.io + README của plugin) trước khi triển khai thật.

:::

---

## Mục lục

- [Vì sao Next.js cần plugin riêng?](#vì-sao-nextjs-cần-plugin-riêng)
- [Cài đặt](#cài-đặt)
- [Cấu hình Remote (provider)](#cấu-hình-remote-provider)
- [Cấu hình Host (consumer)](#cấu-hình-host-consumer)
- [Dùng remote trong trang](#dùng-remote-trong-trang)
- [Hạn chế quan trọng](#hạn-chế-quan-trọng)
- [Tóm tắt](#tóm-tắt)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao Next.js cần plugin riêng?

Ở demo React thuần, ta tạo **async boundary** (ranh giới bất đồng bộ) bằng mẫu
`index.js → import('./bootstrap')`. Nhưng Next.js **tự quản entry point** — bạn
không kiểm soát file khởi động, nên **không thể tự chèn** async boundary đó.

Vì vậy có package chuyên dụng **`@module-federation/nextjs-mf`**: nó vá
(patch) cơ chế chia sẻ của Next.js để Module Federation hoạt động được, bù lại
phần async boundary mà Next.js thiếu.

:::info Đây là kiến thức "vì sao", không cần thuộc lòng
Bạn chỉ cần nhớ: **Next.js + Module Federation = phải dùng `@module-federation/nextjs-mf`**,
không dùng `ModuleFederationPlugin` trần như React thuần.
:::

## Cài đặt

```bash
npm install @module-federation/nextjs-mf
```

Dùng Node.js 20 LTS trở lên (khuyến nghị của Module Federation).

## Cấu hình Remote (provider)

Remote khai báo `exposes` trong `next.config.js`:

```js
// remote/next.config.js
const { NextFederationPlugin } = require('@module-federation/nextjs-mf')

const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'remote',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './ProductCard': './components/ProductCard.js',
        },
        shared: {
          // để trống cũng được; plugin tự lo react/next dạng singleton
        },
      })
    )
    return config
  },
}

module.exports = nextConfig
```

Giả sử remote chạy ở cổng **3001**.

## Cấu hình Host (consumer)

Host khai báo `remotes` trỏ tới remote:

```js
// host/next.config.js
const { NextFederationPlugin } = require('@module-federation/nextjs-mf')

const nextConfig = {
  reactStrictMode: true,
  webpack(config, { isServer }) {
    config.plugins.push(
      new NextFederationPlugin({
        name: 'host',
        filename: 'static/chunks/remoteEntry.js',
        remotes: {
          // Lưu ý đường dẫn _next/static/chunks/ đặc thù của Next.js
          remote: `remote@http://localhost:3001/_next/static/chunks/remoteEntry.js`,
        },
        shared: {},
      })
    )
    return config
  },
}

module.exports = nextConfig
```

Host chạy ở cổng **3000**.

## Dùng remote trong trang

Tải remote bằng `next/dynamic` (cơ chế lazy của Next.js) với `ssr: false` cho an
toàn ban đầu:

```jsx
// host/pages/index.js
import dynamic from 'next/dynamic'

const ProductCard = dynamic(() => import('remote/ProductCard'), {
  ssr: false,                                   // tải ở client, tránh rắc rối SSR lúc đầu
  loading: () => <p>Đang tải sản phẩm…</p>,
})

export default function Home() {
  return (
    <main>
      <h1>Host (Next.js) 🏠</h1>
      <ProductCard />
    </main>
  )
}
```

> Để chống Next.js "tree-shake" (cắt bỏ code tưởng như không dùng) mất các phần
> nội bộ cần thiết, một số thiết lập yêu cầu thêm import cao trong app (vd trong
> `_app.js`): `import '@module-federation/nextjs-mf/lib/include-defaults'`. Hãy
> kiểm tra tài liệu phiên bản bạn dùng.

## Hạn chế quan trọng

:::warning Đọc kỹ trước khi chọn Next.js + Module Federation
- **App Router còn hạn chế.** `@module-federation/nextjs-mf` chủ yếu ổn với
  **Pages Router**. Với **App Router** (thư mục `app/`, React Server Components),
  hỗ trợ chưa hoàn thiện và hay thay đổi — kiểm tra kỹ tài liệu/issue mới nhất.
- **SSR phức tạp.** Server-side rendering xuyên remote là phần khó nhất; nhiều
  team bắt đầu với `ssr: false` rồi mới tính tiếp.
- **API đổi nhiều theo phiên bản.** Ví dụ cũ dùng `withModuleFederation` /
  `patchSharing`, bản mới dùng `NextFederationPlugin`. Luôn đối chiếu version.
- **CSS-in-JS có thể lỗi.** Việc chia sẻ CSS-in-JS giữa các mảnh đôi khi trục
  trặc do một module nội bộ không được chia sẻ dạng singleton.
:::

> **Lời khuyên thực dụng:** nếu mục tiêu chính là micro-frontend "đúng bài" với
> SSR, hãy cân nhắc các nền tảng/framework chuyên cho micro-frontend, hoặc giữ
> remote ở dạng **client-side** (`ssr: false`). Đừng kỳ vọng "cắm là chạy" như
> React thuần.

:::note Luôn tra cứu tài liệu phiên bản
Khu vực Next.js + Module Federation thay đổi nhanh. Trước khi triển khai thật, đối
chiếu với **module-federation.io** và README của `@module-federation/nextjs-mf`
đúng phiên bản bạn cài.
:::

## Tóm tắt

- Next.js tự quản entry nên **thiếu async boundary** → phải dùng
  **`@module-federation/nextjs-mf`** (`NextFederationPlugin`), không dùng plugin
  Webpack trần.
- **Remote** khai `exposes`; **host** khai `remotes` trỏ tới
  `.../_next/static/chunks/remoteEntry.js`.
- Dùng remote qua **`next/dynamic`** (thường `ssr: false` lúc đầu).
- **Hạn chế lớn**: App Router hỗ trợ chưa hoàn thiện, SSR phức tạp, API đổi theo
  phiên bản, CSS-in-JS dễ lỗi.
- Luôn **đối chiếu tài liệu đúng phiên bản** trước khi triển khai thật.

Mục tiếp theo: **thực tiễn** — design system, best practices và lỗi thường gặp.

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. Module Federation là gì, và nó khác cách chia sẻ code truyền thống (thư viện `npm`) ở điểm nào?
2. Vì sao Next.js không dùng được `ModuleFederationPlugin` trần như React thuần mà phải dùng `@module-federation/nextjs-mf`?
3. `async boundary` là gì, vì sao Module Federation cần nó, và ở React thuần người ta tạo nó bằng cách nào?
4. Giải thích vai trò của `name`, `filename`, `exposes`, `remotes` trong cấu hình `NextFederationPlugin`.
5. Vì sao URL remote trong Next.js phải trỏ tới `.../_next/static/chunks/remoteEntry.js` thay vì một đường dẫn tuỳ ý?
6. Vì sao thường đặt `ssr: false` khi nạp remote bằng `next/dynamic`? Bạn đánh đổi gì về SEO và `FCP`?
7. Điều gì xảy ra nếu `react` và `react-dom` không được chia sẻ dạng `singleton` giữa host và remote? Mô tả triệu chứng lỗi.
8. Hỗ trợ `App Router` (React Server Components) của plugin khác gì so với `Pages Router`, và vì sao lại khó hơn?
9. Trang host nên xử lý thế nào khi remote không tải được lúc chạy (mạng lỗi, remote down, sai version)?
10. Host và remote deploy độc lập thì làm sao không phá nhau? Bạn versioning `remoteEntry.js` ra sao và cache CDN ảnh hưởng thế nào?
11. `CORS` và `publicPath` gây ra những lỗi phổ biến nào khi lên production, và bạn chẩn đoán bằng cách nào?
12. Vì sao API của plugin đổi nhiều theo phiên bản (`withModuleFederation` / `patchSharing` rồi tới `NextFederationPlugin`)? Bạn kiểm soát rủi ro nâng cấp thế nào?
13. Chia sẻ CSS-in-JS giữa host và remote hay trục trặc vì lý do gì?
14. Khi nào bạn khuyên KHÔNG dùng Next.js kết hợp Module Federation, và phương án thay thế là gì?
