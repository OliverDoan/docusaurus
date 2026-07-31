---
sidebar_position: 2
title: "2. Demo: React Host + Remote"
---

# Demo: dựng Host + Remote với React

Bài này dựng một demo Module Federation **hoàn chỉnh** với Webpack 5: một **remote**
(app `remote_app`) expose một component, và một **host** (app `shell`) tải
component đó về lúc runtime rồi render. Sau bài này bạn nắm được toàn bộ vòng đời:
cấu hình plugin, **async boundary** (ranh giới bất đồng bộ), chạy, và xử lý lỗi.

> Ta dùng cấu hình **Webpack 5 kinh điển** vì dễ hiểu nhất. Có thể nâng lên
> `@module-federation/enhanced` sau (xem bài trước).

---

:::note[Ghi nhớ nhanh]

- ⭐ **Remote dùng `exposes` mở component + sinh `remoteEntry.js`; host dùng `remotes` trỏ tới URL đó** — rồi `React.lazy(() => import('remote_app/Button'))` để tải lúc runtime.
- ⭐ **Mẫu `index.js → import('./bootstrap')` tạo `async boundary` bắt buộc** — quên nó sẽ gặp lỗi *"Shared module is not available for eager consumption"*.
- **`shared` + `singleton`** cho `react`/`react-dom` ở cả hai app để không tải trùng React.
- **Chạy remote trước, host sau** — host tải remote qua mạng lúc runtime.
- **Luôn bọc remote bằng `Suspense` (chờ tải) + `Error Boundary` (cô lập lỗi)** — để một mảnh hỏng không kéo sập cả trang.

:::

---

## Mục lục

- [Kết quả demo](#kết-quả-demo)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Phần 1 — Remote: expose component](#phần-1--remote-expose-component)
- [Phần 2 — Host: tiêu thụ component](#phần-2--host-tiêu-thụ-component)
- [Async boundary — vì sao cần file bootstrap](#async-boundary--vì-sao-cần-file-bootstrap)
- [Chạy demo](#chạy-demo)
- [Xử lý lỗi khi tải remote](#xử-lý-lỗi-khi-tải-remote)
- [Tóm tắt](#tóm-tắt)

---

## Kết quả demo

- **`remote_app`** chạy ở `http://localhost:3001`, expose component `Button`.
- **`shell`** (host) chạy ở `http://localhost:3000`, tải `Button` từ remote lúc
  runtime và hiển thị.
- Khi bạn sửa & deploy lại `remote_app`, host **tự nhận bản mới** mà không build
  lại — đó là điểm cốt lõi.

## Cấu trúc thư mục

```text
mf-demo/
├── remote_app/
│   ├── package.json
│   ├── webpack.config.js
│   └── src/
│       ├── index.js          # entry (chỉ import bootstrap)
│       ├── bootstrap.jsx     # code khởi động thật
│       ├── App.jsx
│       └── Button.jsx        # ← component được expose
└── shell/
    ├── package.json
    ├── webpack.config.js
    └── src/
        ├── index.js          # entry (chỉ import bootstrap)
        ├── bootstrap.jsx
        └── App.jsx           # ← tiêu thụ Button từ remote
```

## Phần 1 — Remote: expose component

### Component cần chia sẻ

```jsx
// remote_app/src/Button.jsx
export default function Button({ label }) {
  return (
    <button style={{ padding: '8px 16px', borderRadius: 6 }}>
      {label} — từ remote_app 🎁
    </button>
  )
}
```

### Cấu hình Webpack của remote

```js
// remote_app/webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container
const HtmlWebpackPlugin = require('html-webpack-plugin')
const deps = require('./package.json').dependencies

module.exports = {
  mode: 'development',
  devServer: { port: 3001 },
  plugins: [
    new ModuleFederationPlugin({
      name: 'remote_app',                       // tên remote (host dùng tên này)
      filename: 'remoteEntry.js',               // cửa ngõ manifest
      exposes: {
        './Button': './src/Button',             // mở Button ra ngoài
      },
      shared: {
        react: { singleton: true, requiredVersion: deps.react },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
}
```

Sau khi chạy, remote phục vụ file tại
`http://localhost:3001/remoteEntry.js` — đây là thứ host sẽ trỏ tới.

## Phần 2 — Host: tiêu thụ component

### Cấu hình Webpack của host

```js
// shell/webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container
const HtmlWebpackPlugin = require('html-webpack-plugin')
const deps = require('./package.json').dependencies

module.exports = {
  mode: 'development',
  devServer: { port: 3000 },
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        // cú pháp: <tên_remote>@<URL remoteEntry.js>
        remote_app: 'remote_app@http://localhost:3001/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: deps.react },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
      },
    }),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
}
```

### Dùng component từ remote

Import module remote như một module bình thường — Webpack hiểu `remote_app/Button`
là "lấy từ remote". Dùng `React.lazy` + `Suspense` để tải bất đồng bộ:

```jsx
// shell/src/App.jsx
import React, { Suspense } from 'react'

// "remote_app/Button" = <remotes key>/<exposes key>
const RemoteButton = React.lazy(() => import('remote_app/Button'))

export default function App() {
  return (
    <div>
      <h1>Shell (host) 🏠</h1>
      <Suspense fallback={<span>Đang tải nút từ remote…</span>}>
        <RemoteButton label="Bấm tôi" />
      </Suspense>
    </div>
  )
}
```

:::tip TypeScript than phiền về `import('remote_app/Button')`?
Module remote không có sẵn kiểu lúc biên dịch. Khai báo module để TypeScript thôi
báo lỗi:

```ts
// shell/src/remotes.d.ts
declare module 'remote_app/Button' {
  const Button: React.ComponentType<{ label: string }>
  export default Button
}
```
Hoặc dùng `@module-federation/enhanced` để có **type hinting** tự động.
:::

## Async boundary — vì sao cần file bootstrap

Bạn sẽ thấy mẫu lặp lại: `index.js` **chỉ** `import('./bootstrap')`, còn code
thật nằm trong `bootstrap.jsx`:

```js
// src/index.js  (entry)
import('./bootstrap')
```

```jsx
// src/bootstrap.jsx  (code khởi động thật)
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')).render(<App />)
```

**Vì sao tách ra?** Để chia sẻ dependency (React) lúc runtime, Webpack cần một
**async boundary** (ranh giới bất đồng bộ) trước khi code dùng tới thư viện chia
sẻ. Việc `import()` động `./bootstrap` tạo ra ranh giới đó: Webpack có "khoảng
thở" để dàn xếp xem ai chia sẻ React bản nào trước khi app khởi động.

:::danger Quên bootstrap = lỗi "Shared module is not available for eager consumption"
Nếu bạn render thẳng trong `index.js` (không qua `import()` động), Webpack sẽ báo
lỗi *eager consumption*. Mẫu `index.js → import('./bootstrap')` chính là cách xử
lý chuẩn.
:::

## Chạy demo

`package.json` của **cả hai** app cần React và bộ Webpack:

```jsonc
// package.json (rút gọn, áp dụng cho cả remote_app và shell)
{
  "scripts": { "start": "webpack serve" },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "webpack": "^5.95.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^5.1.0",
    "html-webpack-plugin": "^5.6.0",
    "@babel/preset-react": "^7.24.0",
    "babel-loader": "^9.2.0"
  }
}
```

Chạy **remote trước, host sau** (host cần remote đã sẵn sàng):

```bash
# Terminal 1 — remote
cd remote_app && npm install && npm start   # http://localhost:3001

# Terminal 2 — host
cd shell && npm install && npm start         # http://localhost:3000
```

Mở `http://localhost:3000` → bạn thấy nút "Bấm tôi — từ remote_app 🎁" được render,
**dù code nút nằm ở app khác**. Mở tab Network sẽ thấy host tải
`remoteEntry.js` từ cổng 3001.

## Xử lý lỗi khi tải remote

Tải remote lúc runtime có thể **thất bại** (remote sập, sai URL, lệch mạng). Đừng
để cả trang trắng — hãy bọc bằng **Error Boundary** (ranh giới bắt lỗi):

```jsx
// shell/src/RemoteErrorBoundary.jsx
import React from 'react'

export default class RemoteErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // Ghi log chi tiết phía client để truy vết
    console.error('Tải remote thất bại:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return <div>⚠️ Không tải được phần này. Vui lòng thử lại sau.</div>
    }
    return this.props.children
  }
}
```

```jsx
// Bọc quanh remote component
<RemoteErrorBoundary>
  <Suspense fallback={<span>Đang tải…</span>}>
    <RemoteButton label="Bấm tôi" />
  </Suspense>
</RemoteErrorBoundary>
```

> Quy tắc: **mỗi remote** nên có Error Boundary riêng, để một mảnh hỏng không kéo
> sập cả trang — đúng tinh thần **cô lập lỗi** của micro-frontend.

## Tóm tắt

- **Remote** dùng `exposes` để mở component; sinh ra `remoteEntry.js`.
- **Host** dùng `remotes` trỏ tới URL `remoteEntry.js`, rồi
  `React.lazy(() => import('remote_app/Button'))` để tải lúc runtime.
- **`shared` + `singleton`** cho `react`/`react-dom` ở cả hai app để không tải
  trùng React.
- Mẫu **`index.js → import('./bootstrap')`** tạo **async boundary** bắt buộc; quên
  nó sẽ gặp lỗi *eager consumption*.
- Chạy **remote trước, host sau**; host tải remote qua mạng lúc runtime.
- Luôn bọc remote bằng **Suspense** (chờ tải) và **Error Boundary** (cô lập lỗi).

Bài tiếp theo: **chia sẻ state và routing** giữa host và các remote.
