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
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

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

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Mô tả các bước tối thiểu để dựng một remote expose component và một host tiêu thụ nó với Webpack 5.**

<details className="qa">
<summary>Xem đáp án</summary>

Ở **remote**:

1. Cài Webpack 5 và React, thêm `ModuleFederationPlugin`.
2. Khai `name` (ví dụ `remote_app`), `filename: 'remoteEntry.js'`, và `exposes` trỏ component cần mở ra.
3. Khai `shared` cho `react` và `react-dom` với `singleton: true`.
4. Tách entry thành `index.js` chỉ `import('./bootstrap')`.

Ở **host**:

1. Thêm `ModuleFederationPlugin` với `name` riêng và `remotes` trỏ tới URL `remoteEntry.js` của remote.
2. Khai `shared` giống hệt phía remote.
3. Cũng tách async boundary như trên.
4. Dùng `React.lazy(() => import('remote_app/Button'))` rồi bọc trong `Suspense` và Error Boundary.

Cuối cùng chạy **remote trước, host sau**, mở host và kiểm tra tab Network thấy nó tải `remoteEntry.js` từ cổng của remote.

</details>

**2. Trong `ModuleFederationPlugin` của remote, các trường `name`, `filename`, `exposes` lần lượt dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`name`** — tên định danh của remote. Host phải dùng đúng tên này trong chuỗi `remotes`, vì file entry khi tải về sẽ tự đăng ký theo tên đó.
- **`filename`** — tên file manifest được sinh ra khi build, theo quy ước là `remoteEntry.js`. Đây là cửa ngõ mà host trỏ tới.
- **`exposes`** — ánh xạ từ đường dẫn công khai sang file thật trong dự án, quyết định remote mở ra những gì.

```js
new ModuleFederationPlugin({
  name: 'remote_app',           // host gọi bằng tên này
  filename: 'remoteEntry.js',   // cửa ngõ manifest
  exposes: {
    './Button': './src/Button', // trái: tên công khai, phải: file thật
  },
})
```

Chỉ những gì liệt kê trong `exposes` mới ra được bên ngoài — phần còn lại của remote vẫn là chi tiết nội bộ. Vì vậy `exposes` chính là **bề mặt hợp đồng** của mảnh, nên giữ càng nhỏ càng tốt.

</details>

**3. Ở host khai `remotes` như thế nào, và chuỗi `remote_app@http://localhost:3001/remoteEntry.js` được phân giải ra sao lúc chạy?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
remotes: {
  // <khoá dùng khi import>: <tên_remote>@<URL remoteEntry.js>
  remote_app: 'remote_app@http://localhost:3001/remoteEntry.js',
}
```

Khoá bên trái là bí danh dùng khi `import`, còn chuỗi bên phải gồm hai phần: tên remote (phải khớp `name` phía remote) và URL tới file manifest.

Lúc chạy, trình tự là: host chèn thẻ script tải `remoteEntry.js` từ URL đó, file này tự đăng ký một biến toàn cục mang đúng tên `remote_app`, host khởi tạo shared scope rồi hỏi biến đó lấy module `./Button`, remote trả về hàm nạp chunk chứa component, và cuối cùng component được render.

Vì vậy khi bạn viết `import('remote_app/Button')`, Webpack hiểu phần trước dấu `/` là khoá trong `remotes`, phần sau là khoá trong `exposes` của remote.

</details>

**4. Vì sao entry `index.js` chỉ chứa `import('./bootstrap')`? Bỏ mẫu này thì điều gì hỏng?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì việc dàn xếp thư viện dùng chung diễn ra **bất đồng bộ**: Webpack cần biết những app nào có mặt và mỗi bên mang bản React nào trước khi quyết định dùng bản chung nào. Lời gọi `import()` động tạo ra một **async boundary** — một "khoảng thở" để việc dàn xếp đó hoàn tất trước khi code ứng dụng chạm tới React.

```js
// src/index.js — entry, chỉ một dòng
import('./bootstrap')
```

Bỏ mẫu này, tức là import React và render thẳng trong `index.js`, thì code đòi React ngay khi shared scope chưa sẵn sàng. Webpack báo lỗi *"Shared module is not available for eager consumption"* và app không khởi động được.

Cần nhớ mẫu này áp dụng cho **cả host lẫn remote**, vì remote khi chạy độc lập cũng là một app tự khởi động.

</details>

**5. Giải thích lỗi *"Shared module is not available for eager consumption"*: nguyên nhân và ít nhất hai cách khắc phục, kèm đánh đổi của mỗi cách.**

<details className="qa">
<summary>Xem đáp án</summary>

**Nguyên nhân:** một module được khai `shared` bị import **đồng bộ** ngay ở entry, trước khi shared scope kịp khởi tạo. Webpack biết chắc bản thư viện sẽ được dùng chưa được quyết định, nên dừng lại thay vì chạy sai.

**Cách 1 — tách async boundary** (chuẩn mực): entry chỉ `import('./bootstrap')`, mọi thứ khác nằm trong `bootstrap`. Đánh đổi: thêm một file và một lớp gián tiếp, đổi lại bundle ban đầu vẫn gọn và việc chia sẻ hoạt động đúng như thiết kế.

**Cách 2 — bật `eager: true`** cho thư viện đó trong `shared`. Đánh đổi: thư viện bị đưa thẳng vào bundle ban đầu, làm nặng lần tải đầu; nếu bật ở remote thì remote còn mang theo bản React thừa, phá luôn mục đích chia sẻ. Tài liệu ghi rõ là dùng thận trọng.

Một biến thể của cách 2 là chỉ bật eager ở host — chấp nhận bundle host nặng hơn để đổi lấy cấu hình đơn giản. Trong đa số trường hợp, async boundary vẫn là lựa chọn nên dùng.

</details>

**6. `React.lazy` và `Suspense` đóng vai trò gì khi tải remote component? Có bắt buộc phải dùng không?**

<details className="qa">
<summary>Xem đáp án</summary>

`React.lazy` nhận một hàm trả về promise của module và biến nó thành component render được; `Suspense` cung cấp nội dung tạm trong lúc promise chưa xong.

```jsx
const RemoteButton = React.lazy(() => import('remote_app/Button'))

<Suspense fallback={<span>Đang tải nút từ remote…</span>}>
  <RemoteButton label="Bấm tôi" />
</Suspense>
```

Vai trò ở đây rất hợp: code của remote **luôn** phải tải qua mạng, nên luôn có một khoảng chờ cần hiển thị gì đó.

Không bắt buộc — bạn có thể tự `await import('remote_app/Button')` rồi lưu vào state và tự quản lý trạng thái loading. Nhưng làm vậy là viết lại đúng thứ `React.lazy` đã làm sẵn, lại dễ quên xử lý huỷ khi component unmount. Lưu ý `React.lazy` chỉ dùng được với module có `export default`, và nếu dùng `Suspense` thì vẫn phải có Error Boundary riêng vì `Suspense` không bắt lỗi.

</details>

**7. `Error Boundary` bắt được loại lỗi nào và bỏ sót loại nào? Vì sao mỗi remote nên có boundary riêng thay vì một cái chung?**

<details className="qa">
<summary>Xem đáp án</summary>

**Bắt được:** lỗi ném ra trong lúc render, trong constructor và trong các phương thức vòng đời của cây component nằm bên dưới nó — bao gồm cả lỗi khi `React.lazy` tải module remote thất bại.

**Bỏ sót:**

- Lỗi trong **event handler** (bấm nút, submit form).
- Lỗi trong code **bất đồng bộ** như `setTimeout` hoặc promise không bắt.
- Lỗi xảy ra trong **chính error boundary** đó.
- Lỗi ở phía server khi render trên server.

Những trường hợp này phải tự try/catch hoặc bắt ở tầng global.

**Vì sao mỗi remote một boundary riêng:** boundary chỉ thay thế đúng phần cây nằm dưới nó. Nếu dùng một boundary chung bọc cả trang, một mảnh hỏng sẽ làm biến mất toàn bộ giao diện — đúng thứ mà cô lập lỗi muốn tránh. Bọc riêng từng remote thì chỉ ô đó hiện thông báo thay thế, phần còn lại vẫn dùng được, và log cũng chỉ đúng mảnh có lỗi.

</details>

**8. Nếu remote sập hoặc URL sai thì người dùng nhìn thấy gì? Bạn thiết kế fallback và cơ chế retry ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Nếu không xử lý gì, `React.lazy` sẽ ném lỗi khi không tải được module, lỗi lan lên trên và nếu không có boundary nào chặn thì cả cây component bị gỡ bỏ — người dùng thấy **trang trắng**.

Có Error Boundary bọc riêng mảnh đó thì họ chỉ thấy nội dung thay thế kiểu "Không tải được phần này. Vui lòng thử lại sau", phần còn lại của trang vẫn hoạt động.

Thiết kế nên có:

- **Fallback theo mức quan trọng** — mảnh phụ thì ẩn hẳn ô đó; mảnh thiết yếu thì báo rõ và cho nút thử lại.
- **Giữ nguyên kích thước ô** để layout không nhảy khi mảnh hỏng.
- **Timeout** cho lần tải, tránh treo mãi ở trạng thái loading.
- **Retry có giới hạn**, đặt lại key của boundary để render lại nhánh đó thay vì reload cả trang; nên giãn cách giữa các lần thử để không dồn tải khi remote đang sự cố.
- **Ghi log kèm nhãn mảnh và phiên bản** để biết nhóm nào cần xử lý.

</details>

**9. Vì sao trong demo phải chạy remote trước rồi mới chạy host? Ở môi trường production thì thứ tự deploy ảnh hưởng thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì host tải `remoteEntry.js` qua mạng **lúc chạy**. Nếu server của remote chưa lên, request đó thất bại và host không lấy được component — mảnh đó hỏng ngay khi mở trang.

Ở production, logic tương tự nhưng hệ quả rõ hơn:

- **Thêm một remote mới**: phải deploy remote trước, rồi mới deploy host trỏ tới nó. Ngược lại host sẽ trỏ vào một URL chưa tồn tại.
- **Gỡ một remote**: phải deploy host bỏ tham chiếu trước, rồi mới gỡ remote.
- **Đổi hợp đồng** (đổi tên module phơi ra, đổi props): remote phải hỗ trợ cả bản cũ lẫn bản mới trong giai đoạn chuyển tiếp, vì luôn có người dùng đang giữ bản host cũ trong tab.

Nói cách khác, deploy độc lập không có nghĩa là thứ tự không quan trọng — nó chỉ có nghĩa là các bên không phải deploy *cùng lúc*. Quy tắc an toàn: **mở rộng trước, thu hẹp sau**.

</details>

**10. `shared` cho `react`/`react-dom` phải khai ở cả hai app — nếu chỉ khai ở một bên thì hậu quả là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`shared` là một thoả thuận hai chiều: mỗi bên vừa **đóng góp** bản thư viện của mình vào kho chung, vừa **tra cứu** kho đó thay vì dùng bản riêng. Bên nào không khai thì không tham gia thoả thuận.

Hậu quả khi chỉ một bên khai:

- Bên không khai vẫn **đóng gói React của riêng nó** vào bundle, nên React bị tải hai lần — trang nặng hơn hẳn.
- Nghiêm trọng hơn, trang có **hai bản React cùng chạy**. Component của remote gọi hook trên bản React không đang render, gây lỗi *"Invalid hook call"*.
- Context bị "thủng": Provider ở host không tới được consumer trong remote, nên theme, i18n, store dùng chung đều không hoạt động.

Đây là lỗi rất hay gặp và triệu chứng trông như lỗi React chứ không giống lỗi cấu hình, nên khi thấy "Invalid hook call" trong micro-frontend thì việc đầu tiên nên làm là kiểm tra `shared` và `singleton` ở **cả hai** app.

</details>

**11. TypeScript báo không tìm thấy module `remote_app/Button` — bạn xử lý thế nào để vừa hết lỗi vừa giữ được kiểu?**

<details className="qa">
<summary>Xem đáp án</summary>

Module remote không tồn tại lúc biên dịch nên TypeScript không phân giải được. Cách xử lý trực tiếp là khai báo module trong một file `.d.ts` ở host, tự mô tả kiểu:

```ts
// shell/src/remotes.d.ts
declare module 'remote_app/Button' {
  const Button: React.ComponentType<{ label: string }>
  export default Button
}
```

Cách này hết lỗi **và** giữ được kiểu, khác hẳn với việc ép `any` cho xong. Nhược điểm là phải tự giữ cho khai báo khớp với remote — nếu remote đổi props mà không ai sửa file này thì TypeScript vẫn báo xanh trong khi thực tế đã vỡ.

Hai cách bền hơn:

- **Package hợp đồng dùng chung** chỉ chứa type, cả hai bên cùng phụ thuộc và có phiên bản rõ ràng.
- **Type hinting tự động của `@module-federation/enhanced`** — remote sinh type khi build, host tải về dùng, nên type luôn đi kèm đúng bản build.

</details>

**12. Chạy nhiều remote cùng lúc trên máy local rất nặng. Có cách nào trỏ về remote đã deploy sẵn cho những mảnh không sửa?**

<details className="qa">
<summary>Xem đáp án</summary>

Có, và đây là cách làm phổ biến: chỉ chạy local đúng mảnh đang sửa, còn lại **trỏ thẳng tới URL remote đã deploy** trên môi trường dev hoặc staging.

Cách thực hiện:

- Đưa URL các remote vào **biến môi trường** hoặc file cấu hình runtime thay vì viết cứng `localhost` trong webpack config.
- Mặc định trỏ tới môi trường chung; khi cần sửa mảnh nào thì ghi đè URL của riêng mảnh đó về `localhost`.
- Với dynamic remote, có thể đổi URL ngay lúc chạy mà không cần khởi động lại dev server.

Lưu ý:

- Remote trên môi trường chung phải bật **CORS** cho origin localhost, nếu không trình duyệt chặn.
- Phiên bản React trên môi trường chung phải tương thích với bản local, nếu không sẽ có cảnh báo lệch version hoặc lỗi hook.
- Khi gặp lỗi lạ, nhớ rằng bạn đang chạy hỗn hợp nhiều phiên bản — đó có thể chính là nguyên nhân.

</details>

**13. `publicPath` cấu hình sai gây lỗi gì khi remote tải chunk của chính nó? Giá trị `auto` giải quyết vấn đề đó ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`publicPath` là tiền tố mà Webpack dùng để dựng URL khi tải các chunk lúc chạy. Vấn đề: code của remote được thực thi **trong trang của host**, nên nếu `publicPath` là một đường dẫn tương đối như `/`, remote sẽ đi tìm chunk của mình trên **domain của host** — nơi không hề có file đó. Kết quả là 404 hoặc lỗi tải chunk, dù `remoteEntry.js` đã tải thành công. Đây là lỗi rất dễ nhầm vì bước đầu tiên trông vẫn ổn.

Đặt `publicPath: 'auto'` khiến Webpack **suy ra tiền tố lúc chạy** từ chính URL của script đang thực thi. Nhờ vậy chunk của remote luôn được lấy từ đúng domain của remote, bất kể nó đang được nhúng vào host nào — và bạn cũng không phải build lại khi đổi domain.

Cách thay thế là đặt `publicPath` thành URL tuyệt đối của remote, nhưng như vậy mỗi môi trường lại cần một bản build riêng.

</details>

**14. Bạn viết những loại test nào cho tích hợp host–remote: mock remote, contract test hay E2E? Mỗi loại bắt được lỗi gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả ba, mỗi loại phủ một khoảng khác nhau:

| Loại test | Chạy ở đâu | Bắt được gì |
| --- | --- | --- |
| Mock remote | Pipeline của host | Logic của host: trạng thái loading, fallback khi lỗi, truyền props đúng |
| Contract test | Pipeline của remote | Remote vẫn phơi ra đúng module và đúng hình dạng props/sự kiện đã cam kết |
| E2E | Môi trường đã ghép đầy đủ | Cấu hình thật: URL sai, CORS, `publicPath`, lệch version React, luồng xuyên mảnh |

Mock remote nhanh và ổn định nhưng không bao giờ phát hiện được lệch hợp đồng, vì bạn đang tự viết ra cái mà mình mong đợi. Contract test bù đúng chỗ đó và là lớp quan trọng nhất trong kiến trúc này, vì không còn một lần build chung nào bắt lỗi giao diện hộ bạn. E2E đắt và chậm nên chỉ dành cho vài luồng quan trọng, nhưng là nơi duy nhất phát hiện các lỗi chỉ xuất hiện khi ghép thật.

</details>

**15. Khi host và remote nằm ở hai domain khác nhau, cần cấu hình `CORS` và header gì cho `remoteEntry.js` cùng các chunk?**

<details className="qa">
<summary>Xem đáp án</summary>

Phía **remote** phục vụ file cần:

- **`Access-Control-Allow-Origin`** liệt kê đúng origin của host (tránh dùng `*` cho tài nguyên nội bộ). Áp cho cả `remoteEntry.js` lẫn mọi chunk mà nó tải kèm.
- **`Content-Type: application/javascript`** đúng chuẩn.
- **Cache-Control** hợp lý: `remoteEntry.js` không cache lâu, chunk có hash thì cache dài và bất biến.

Phía **host** cần:

- **`CSP`** với `script-src` cho phép domain của remote — nếu quên, trình duyệt chặn dù CORS đã đúng.
- `publicPath: 'auto'` để chunk được lấy từ đúng domain remote.

Ngoài ra, nên bật tải script ở chế độ ẩn danh kèm CORS đúng để lỗi từ remote hiện stack trace đầy đủ thay vì chỉ "Script error" — điều này rất quan trọng cho việc truy vết. Và tất nhiên mọi thứ phải chạy trên HTTPS.

</details>

**16. Làm sao debug khi host tải được `remoteEntry.js` nhưng render remote lại lỗi? Bạn xem gì trên tab Network và Console?**

<details className="qa">
<summary>Xem đáp án</summary>

`remoteEntry.js` tải được chỉ chứng minh URL đúng và CORS ổn — mọi thứ sau đó vẫn có thể hỏng. Cách soi theo thứ tự:

Trên **Network**:

- Sau `remoteEntry.js`, có request nào tải **chunk của module** không? Nếu chunk bị 404 hoặc gửi sai domain thì thủ phạm thường là `publicPath`.
- Kiểm tra status, `Content-Type` và header CORS của các chunk đó, không chỉ của file entry.
- Có bao nhiêu file React được tải? Nhiều hơn một là `shared` chưa ăn.

Trên **Console**:

- *"Invalid hook call"* hoặc Context không hoạt động → React chưa phải singleton, hoặc một bên quên khai `shared`.
- Lỗi kiểu không tìm thấy biến của remote → `name` phía remote lệch với tên trong chuỗi `remotes` của host.
- Cảnh báo lệch phiên bản thư viện dùng chung.
- Lỗi *eager consumption* → thiếu async boundary.

Cuối cùng, thử mở remote chạy độc lập để biết lỗi nằm ở bản thân mảnh hay ở khâu ghép.

</details>
