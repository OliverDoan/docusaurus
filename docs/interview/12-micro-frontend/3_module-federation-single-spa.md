---
sidebar_position: 3
title: "3. Module Federation & single-spa"
---

# Module Federation, single-spa & Import Maps

> *Hỏi micro-frontend, junior kể tên "iframe, Module Federation"; senior phân biệt được lớp nào giải bài toán gì — Module Federation lo chia sẻ module/dependency, single-spa lo orchestrate lifecycle, Import Maps lo dedupe ở tầng trình duyệt. Ghép đúng 3 mảnh = câu trả lời ăn điểm.*

---

## Câu 10: Module Federation là gì? Hoạt động như thế nào? `[Intermediate]`

### Câu hỏi

> Module Federation trong Webpack 5 là gì? Cơ chế host/remote, `remoteEntry.js`, `exposes`, `remotes`, `shared` hoạt động ra sao khi runtime?

### Giải thích lý thuyết

**Module Federation (MF)** là tính năng của **Webpack 5** cho phép một build (app) **load code từ một build khác tại runtime**, không cần publish npm package, không cần rebuild app kia. Đây là nền tảng kỹ thuật phổ biến nhất cho micro-frontend kiểu "runtime integration".

Hai vai trò chính (một app có thể đóng cả hai):

| Vai trò              | Ý nghĩa                                                      | Khai báo plugin                 |
| -------------------- | ----------------------------------------------------------- | ------------------------------- |
| **Remote** (provider) | App **expose** module ra ngoài cho app khác dùng           | `name`, `filename`, `exposes`   |
| **Host** (consumer)   | App **consume** module từ remote                           | `remotes`                       |

Các option của `ModuleFederationPlugin`:

- **`name`** — tên global container của remote (dùng làm scope, ví dụ `app2`).
- **`filename`** — tên file manifest container, quy ước là **`remoteEntry.js`**. File này là "mục lục" mô tả remote expose những gì và cần shared deps nào.
- **`exposes`** — map từ public path → file nội bộ. Ví dụ `{ './Button': './src/Button' }`.
- **`remotes`** — map tên remote → URL `remoteEntry.js`. Ví dụ `{ app2: 'app2@http://localhost:3002/remoteEntry.js' }`.
- **`shared`** — danh sách dependency chia sẻ giữa host và remote (xem sâu ở Câu 14), thường kèm `singleton: true` cho React/ReactDOM.

**Luồng runtime:**

1. Host load `remoteEntry.js` của remote (qua `<script>` hoặc dynamic). File này đăng ký một **container** vào global theo `name`.
2. Khi host gọi `import('app2/Button')`, Webpack runtime gọi `container.init(sharedScope)` để negotiate shared deps, rồi `container.get('./Button')` để lấy factory module.
3. Module remote được load **động** (code-split), chỉ tải khi thực sự cần.
4. Nếu cả hai khai báo `shared` cùng dep `singleton`, runtime chọn **một bản duy nhất** thỏa version → tránh tải trùng React, tránh vỡ hooks.

:::tip Insight phỏng vấn
Câu chốt ăn điểm: *"MF integrate ở tầng **module/bundler**, không phải tầng app. Nó không quản lý lifecycle hay routing — đó là việc của shell/single-spa."* Nhiều người nhầm MF "tự lo hết micro-frontend" — sai.
:::

### Code minh hoạ

```js
// === REMOTE: app2/webpack.config.js (provider) ===
const { ModuleFederationPlugin } = require("webpack").container;
const deps = require("./package.json").dependencies;

module.exports = {
  output: { publicPath: "auto" }, // quan trọng: để remote tự resolve asset URL
  plugins: [
    new ModuleFederationPlugin({
      name: "app2",                  // tên container global
      filename: "remoteEntry.js",    // manifest expose ra ngoài
      exposes: {
        "./Button": "./src/Button",  // public path → file nội bộ
      },
      shared: {
        react: { singleton: true, requiredVersion: deps.react },
        "react-dom": { singleton: true, requiredVersion: deps["react-dom"] },
      },
    }),
  ],
};
```

```js
// === HOST: app1/webpack.config.js (consumer) ===
const { ModuleFederationPlugin } = require("webpack").container;
const deps = require("./package.json").dependencies;

module.exports = {
  output: { publicPath: "auto" },
  plugins: [
    new ModuleFederationPlugin({
      name: "app1",
      remotes: {
        // <tên>: '<name>@<url remoteEntry.js>'
        app2: "app2@http://localhost:3002/remoteEntry.js",
      },
      shared: {
        react: { singleton: true, requiredVersion: deps.react },
        "react-dom": { singleton: true, requiredVersion: deps["react-dom"] },
      },
    }),
  ],
};
```

```tsx
// === HOST: app1/src/App.tsx — import remote động ===
import React, { Suspense } from "react";

// import() động: Webpack runtime tải remoteEntry.js → container.get('./Button')
const RemoteButton = React.lazy(() => import("app2/Button"));

export default function App() {
  return (
    <div>
      <h1>Host app1</h1>
      {/* Bọc Suspense vì remote được load bất đồng bộ */}
      <Suspense fallback={<span>Đang tải Button từ app2...</span>}>
        <RemoteButton />
      </Suspense>
    </div>
  );
}
```

```ts
// Khai báo type cho remote (TS không biết module 'app2/Button')
// file: remotes.d.ts
declare module "app2/Button" {
  const Button: React.ComponentType;
  export default Button;
}
```

### Đáp án mẫu

> "Module Federation là tính năng Webpack 5 cho phép một app **load code từ app khác tại runtime**, không cần publish npm hay rebuild. Em chia 2 vai: **remote** dùng `exposes` để công khai module và build ra `remoteEntry.js`; **host** dùng `remotes` trỏ tới URL `remoteEntry.js` đó. Khi host gọi `import('app2/Button')`, Webpack runtime tải `remoteEntry.js` để đăng ký container theo `name`, gọi `init` để negotiate `shared`, rồi `get('./Button')` lấy module — load động nên chỉ tải khi cần. Em luôn khai báo `shared` với `react`/`react-dom` là `singleton: true` để cả host lẫn remote dùng chung **một** bản React, tránh tải trùng và tránh vỡ hooks vì nhiều React instance. Điểm em nhấn mạnh: MF integrate ở tầng **module**, nó không lo lifecycle hay routing — phần đó là việc của shell."

---

## Câu 11: single-spa là gì? Nó giải quyết vấn đề gì? `[Intermediate]`

### Câu hỏi

> single-spa làm gì mà Module Federation không làm? Giải thích root-config, `registerApplication`, và vòng đời bootstrap/mount/unmount.

### Giải thích lý thuyết

**single-spa** là một **orchestrator framework** cho micro-frontend: nó không lo bundling, mà lo **đăng ký, gắn (mount) và tháo (unmount) các "application" theo route** trong cùng một SPA shell.

Khái niệm cốt lõi:

- **Root-config** — entry point đóng vai trò **shell**: import single-spa, đăng ký các application, gọi `start()`. Không chứa UI nghiệp vụ, chỉ điều phối.
- **`registerApplication({ name, app, activeWhen, customProps })`** — đăng ký một MFE:
  - `name`: định danh.
  - `app`: hàm trả về Promise của module có **lifecycle**, hoặc URL để load (qua SystemJS / import map).
  - `activeWhen`: hàm/`location` quyết định **khi nào** app active (ví dụ `'/products'` hoặc `(location) => location.pathname.startsWith('/cart')`).
- **`start()`** — bật route listener; từ đó single-spa tự mount app khi route khớp, unmount khi rời.

**Lifecycle bắt buộc** mỗi application phải export (đều trả Promise):

| Lifecycle    | Khi nào gọi                              | Việc làm điển hình                |
| ------------ | ---------------------------------------- | --------------------------------- |
| `bootstrap`  | Lần đầu trước khi mount                   | Khởi tạo một lần (setup global)   |
| `mount`      | Khi route khớp `activeWhen`               | Render UI vào DOM container        |
| `unmount`    | Khi rời route                             | Tháo UI, cleanup listener          |
| `update`     | (Optional, cho parcel) khi props đổi      | Re-render với props mới            |

Vấn đề single-spa **giải quyết**:

1. **Orchestration** — nhiều MFE cùng tồn tại trong **một** SPA shell, gắn/tháo theo route mà không full page reload.
2. **Lifecycle chuẩn hóa** — mọi MFE tuân cùng contract bootstrap/mount/unmount → shell quản lý đồng nhất.
3. **Đa framework** — mỗi application có thể là React, Vue, Angular... cùng chạy; helper như `single-spa-react`, `single-spa-vue`, `single-spa-angular` sinh sẵn lifecycle.

:::tip Insight phỏng vấn
Phân biệt rõ với MF: *"single-spa trả lời câu hỏi **khi nào mount cái gì vào đâu**; Module Federation trả lời câu hỏi **lấy code từ đâu**."* Hai lớp khác nhau, hay đi cùng nhau.
:::

### Code minh hoạ

```js
// === ROOT-CONFIG (shell): src/root-config.js ===
import { registerApplication, start } from "single-spa";

// Đăng ký MFE "navbar" — luôn active (activeWhen trả về true)
registerApplication({
  name: "@org/navbar",
  app: () => System.import("@org/navbar"), // load qua import map / SystemJS
  activeWhen: () => true,
});

// Đăng ký MFE "products" — chỉ active khi vào /products
registerApplication({
  name: "@org/products",
  app: () => System.import("@org/products"),
  activeWhen: ["/products"],
  customProps: { authToken: "..." }, // props truyền xuống lifecycle
});

// Bật router của single-spa
start();
```

```tsx
// === APPLICATION: products/src/main.tsx (dùng single-spa-react) ===
import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import Root from "./Root";

// single-spa-react sinh sẵn bootstrap/mount/unmount đúng contract
const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Root,
  errorBoundary(err) {
    // UI hiển thị khi MFE crash, tránh kéo sập cả shell
    return <div>Products MFE lỗi: {String(err)}</div>;
  },
});

// Export đúng các lifecycle single-spa yêu cầu
export const { bootstrap, mount, unmount } = lifecycles;
```

### Đáp án mẫu

> "single-spa là **orchestrator** cho micro-frontend: nó không lo build mà lo **gắn/tháo các app theo route** trong một SPA shell. Em viết một **root-config** đóng vai shell, gọi `registerApplication({ name, app, activeWhen })` cho từng MFE rồi `start()`. Mỗi MFE phải export lifecycle `bootstrap`, `mount`, `unmount` đều trả Promise — `mount` render UI khi route khớp `activeWhen`, `unmount` cleanup khi rời. Với React em dùng helper `single-spa-react` để sinh sẵn lifecycle thay vì viết tay. Giá trị nó mang lại là 3 thứ: **orchestration** nhiều MFE trong một shell không reload trang, **lifecycle chuẩn hóa** để shell quản lý đồng nhất, và **đa framework** — React, Vue, Angular cùng chạy. Em hay tóm tắt: single-spa lo *khi nào mount cái gì vào đâu*, còn việc *lấy code từ đâu* thì Module Federation hoặc import map lo."

---

## Câu 12: Module Federation và single-spa khác nhau thế nào? Khi nào dùng cái nào? `[Senior]`

### Câu hỏi

> So sánh Module Federation với single-spa. Trade-off của từng cái? Khi nào chọn cái nào, và có nên dùng chung cả hai không?

### Giải thích lý thuyết

Đây không phải "cái A vs cái B thay thế nhau" — chúng giải **hai lớp khác nhau** của bài toán micro-frontend và thường **bổ trợ** nhau.

| Tiêu chí                | **Module Federation**                          | **single-spa**                                   |
| ----------------------- | ---------------------------------------------- | ------------------------------------------------ |
| **Cơ chế**              | Chia sẻ **module** giữa các build              | **Orchestrate** app theo route (mount/unmount)   |
| **Lớp giải quyết**      | Module / bundler                               | Application / lifecycle                          |
| **Phụ thuộc bundler**   | Có — gắn chặt **Webpack 5** (hoặc Rspack/Vite plugin tương đương) | Không — bundler-agnostic, thường đi với SystemJS/import map |
| **Chia sẻ dependency**  | Built-in qua `shared` + `singleton`            | Không tự lo — dựa vào import map / externals      |
| **Lifecycle app**       | Không quản lý                                   | Quản lý (`bootstrap`/`mount`/`unmount`)          |
| **Đa framework**        | Được, nhưng không có contract lifecycle chung   | Mạnh — helper `single-spa-react/vue/angular`     |
| **Learning curve**      | Trung bình (chủ yếu config plugin)              | Cao hơn (root-config + lifecycle + routing)      |

**Khi nào chọn Module Federation:**

- Toàn bộ team **cùng hệ Webpack 5** (hoặc Rspack), muốn chia sẻ code/dependency ở **cấp module**.
- Cần **share React như singleton** giữa các MFE để dùng chung context/state.
- Tích hợp runtime đơn giản, không cần orchestrate nhiều app đa framework theo route phức tạp.

**Khi nào chọn single-spa:**

- **Đa framework** (React + Vue + Angular cùng tồn tại), cần **orchestrate lifecycle** theo route.
- Bundler không đồng nhất giữa các team, muốn lớp shell độc lập bundler.
- Thường **kết hợp import map** để load và dedupe dependency ở tầng trình duyệt.

**Dùng chung cả hai (rất phổ biến):**

- single-spa làm **shell/orchestrator** điều phối app theo route.
- Module Federation làm **cơ chế load + share dependency** cho từng app (thay cho SystemJS/import map).
- Có plugin/pattern chuyên cho việc này (ví dụ template `single-spa` + `@module-federation`), lấy được cả lifecycle chuẩn hóa lẫn `shared` singleton.

:::tip Insight phỏng vấn
Đừng trả lời "MF tốt hơn single-spa" hay ngược lại — đó là dấu hiệu chưa hiểu. Câu ăn điểm: *"Chúng ở hai lớp khác nhau; em thường ghép single-spa (orchestrate) + Module Federation (chia sẻ module/dep)."*
:::

### Code minh hoạ

```js
// Kết hợp: single-spa làm shell, Module Federation làm cách load app
// root-config.js — đăng ký app, nhưng app được resolve qua MF remote
import { registerApplication, start } from "single-spa";

registerApplication({
  name: "@org/products",
  // Thay vì System.import, dùng MF: import('products/lifecycles')
  // module 'products/lifecycles' export { bootstrap, mount, unmount }
  app: () => import("products/lifecycles"),
  activeWhen: ["/products"],
});

start();
```

```js
// webpack của shell: khai báo remote products qua Module Federation
new ModuleFederationPlugin({
  name: "shell",
  remotes: {
    products: "products@http://localhost:3002/remoteEntry.js",
  },
  shared: {
    react: { singleton: true, requiredVersion: deps.react },
    "react-dom": { singleton: true, requiredVersion: deps["react-dom"] },
    "single-spa": { singleton: true }, // single-spa cũng nên singleton
  },
});
```

```text
Phân lớp trách nhiệm:

  [ single-spa ]   → KHI NÀO mount app nào, vào DOM container nào (lifecycle + route)
        |
  [ Module Federation ] → LẤY code app + SHARE dependency (react singleton) ở runtime
        |
  [ Browser ]      → chạy, dùng chung 1 bản React
```

### Đáp án mẫu

> "Em không coi đây là hai lựa chọn thay thế nhau vì chúng giải hai lớp khác nhau. **Module Federation** giải lớp **module/bundler** — chia sẻ code và dependency giữa các build, built-in `shared` singleton, nhưng gắn chặt Webpack 5 và không quản lý lifecycle. **single-spa** giải lớp **application** — orchestrate mount/unmount theo route, chuẩn hóa lifecycle, mạnh khi đa framework, nhưng không tự lo chia sẻ dependency mà dựa vào import map. Khi cả team cùng Webpack và chỉ cần share React singleton ở cấp module thì em chọn **Module Federation** thuần. Khi có nhiều framework hoặc cần orchestrate route phức tạp thì em chọn **single-spa**, thường kèm import map. Và thực tế production em hay **ghép cả hai**: single-spa làm shell điều phối, Module Federation làm cơ chế load app và share dependency — lấy được cả lifecycle chuẩn lẫn singleton React. Trả lời 'cái nào tốt hơn' là sai bản chất."

---

## Câu 13: Import Maps là gì và đóng vai trò gì trong micro-frontend? `[Advanced]`

### Câu hỏi

> Import Maps là gì? Nó giúp gì cho micro-frontend về dedupe dependency và update version độc lập? Quan hệ với single-spa/SystemJS và polyfill ra sao?

### Giải thích lý thuyết

**Import Maps** là một **chuẩn của trình duyệt** cho phép ánh xạ **bare specifier** (ví dụ `"react"`) sang một **URL thật** khi load ES module. Khai báo bằng `<script type="importmap">` đặt **trước** mọi `<script type="module">`.

Trước import map, `import x from "react"` trong ESM gốc của trình duyệt sẽ lỗi vì trình duyệt không biết `"react"` ở đâu. Import map giải đúng vấn đề đó: nó nói cho trình duyệt biết `"react"` → một URL CDN cụ thể.

**Vai trò trong micro-frontend:**

1. **Load ES module từ CDN** — mỗi MFE và mỗi dependency là một URL, load thẳng từ trình duyệt, không cần bundle chung.
2. **Dedupe dependency** — nhiều MFE cùng map `"react"` → **một** URL → trình duyệt cache và dùng **một bản React duy nhất**, không bundle trùng. Đây là cách single-spa dedupe khi không dùng Module Federation.
3. **Update version độc lập** — chỉ cần đổi URL trong import map (ví dụ React `18.2.0` → `18.3.1`) là toàn bộ MFE dùng bản mới, **không phải rebuild** từng MFE.
4. **Nền tảng cho single-spa** — single-spa thường resolve `app` qua `System.import('@org/products')`, và import map (định dạng SystemJS) cung cấp URL cho specifier đó.

**Quan hệ với SystemJS & polyfill:**

- Import map native chưa được hỗ trợ đồng đều ở mọi trình duyệt cũ. Hệ single-spa thường dùng **SystemJS** với `<script type="systemjs-importmap">` — cùng ý tưởng nhưng do SystemJS xử lý, chạy được cả trên trình duyệt cũ.
- Với native import map, có thể dùng polyfill **es-module-shims** để hỗ trợ trình duyệt chưa có sẵn (kèm `<script async src="es-module-shims.js">`).

:::tip Insight phỏng vấn
Câu nâng level: *"Import map cho phép **rollback/update dependency không cần rebuild MFE** — chỉ đổi một URL. Đây là deploy lợi thế lớn so với bundle cứng."* Nhắc được trade-off này = senior.
:::

### Code minh hoạ

```html
<!-- Native import map: phải đặt TRƯỚC <script type="module"> -->
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@18.3.1",
    "react-dom/client": "https://esm.sh/react-dom@18.3.1/client",
    "@org/products": "https://cdn.example.com/products/v2/main.js",
    "@org/navbar": "https://cdn.example.com/navbar/v5/main.js"
  }
}
</script>

<!-- (Optional) polyfill cho trình duyệt chưa hỗ trợ import map native -->
<script async src="https://esm.sh/es-module-shims@1/dist/es-module-shims.js"></script>
```

```tsx
// MFE dùng bare specifier — trình duyệt resolve qua import map ở trên
// Không bundle React vào MFE; mọi MFE map "react" → cùng URL → 1 bản React
import React from "react";          // → https://esm.sh/react@18.3.1
import { createRoot } from "react-dom/client";

export function mount(el: HTMLElement) {
  createRoot(el).render(<h1>Products MFE</h1>);
}
```

```html
<!-- Biến thể SystemJS dùng cho single-spa (chạy được cả trình duyệt cũ) -->
<script type="systemjs-importmap">
{
  "imports": {
    "single-spa": "https://cdn.jsdelivr.net/npm/single-spa@6/lib/system/single-spa.min.js",
    "@org/root-config": "https://cdn.example.com/root-config.js",
    "@org/products": "https://cdn.example.com/products/v2/main.js"
  }
}
</script>
<!-- root-config gọi System.import('@org/products') → resolve theo map trên -->
```

```text
Update React mà KHÔNG rebuild MFE nào:
  Trước:  "react": "https://esm.sh/react@18.2.0"
  Sau:    "react": "https://esm.sh/react@18.3.1"   ← chỉ sửa 1 dòng import map
  → mọi MFE tự dùng 18.3.1 ở lần load tiếp theo. Rollback = đổi lại URL.
```

### Đáp án mẫu

> "Import Maps là chuẩn trình duyệt ánh xạ **bare specifier** như `'react'` sang một **URL thật**, khai báo bằng `<script type=\"importmap\">` đặt trước mọi script module. Trong micro-frontend nó giải 3 việc: thứ nhất, load thẳng ES module từ CDN nên mỗi MFE và dependency là một URL, không cần bundle chung; thứ hai, **dedupe** — nhiều MFE cùng map `'react'` về một URL nên trình duyệt dùng đúng **một** bản React, không tải trùng; thứ ba, **update version độc lập** — em chỉ đổi URL trong import map là mọi MFE dùng bản mới mà **không phải rebuild** cái nào, rollback cũng chỉ đổi lại URL. Trong hệ single-spa, em thường dùng biến thể **SystemJS** với `systemjs-importmap` để chạy được cả trình duyệt cũ, và `System.import` resolve app theo map đó. Với native import map thì em thêm polyfill **es-module-shims** cho trình duyệt chưa hỗ trợ. Lợi thế em nhấn là deploy: đổi dependency không cần rebuild MFE."

---

## Câu 14: Làm sao chia sẻ dependency chung và tránh tải trùng (ví dụ nhiều bản React)? `[Senior]`

### Câu hỏi

> Mỗi MFE bundle React riêng dẫn tới tải trùng và vỡ context/hooks. Em xử lý thế nào với `shared`/`singleton`/`requiredVersion`/`eager`? Trade-off là gì?

### Giải thích lý thuyết

**Vấn đề:** nếu mỗi MFE bundle React riêng:

1. **Tải trùng** — trình duyệt tải N bản React → tốn băng thông, chậm.
2. **Vỡ context & hooks** — React lưu state qua một internal dispatcher dùng module-level state. Nếu có **nhiều React instance**, component của MFE-A dùng React-A nhưng được render trong cây của MFE-B (React-B) → `useContext` không thấy provider, hooks ném lỗi *"Invalid hook call"* / *"Cannot read dispatcher"*. Đây là lý do **React buộc phải là một instance duy nhất**.

**Giải pháp với Module Federation — `shared`:**

```js
shared: {
  react: {
    singleton: true,         // BẮT BUỘC chỉ 1 instance trong toàn app
    requiredVersion: "^18.2.0", // version mong muốn (thường lấy từ package.json)
    eager: false,            // false = load lazy (mặc định khuyến nghị)
  },
}
```

Ý nghĩa từng option:

| Option            | Ý nghĩa                                                                 |
| ----------------- | ----------------------------------------------------------------------- |
| `singleton: true` | Toàn bộ app dùng **một** bản dep. Nếu version lệch → Webpack **warning** version mismatch nhưng vẫn ép 1 bản (bản cao nhất thỏa). Bắt buộc cho React/ReactDOM. |
| `requiredVersion` | Khoảng semver chấp nhận được; dùng để cảnh báo khi remote yêu cầu bản không tương thích. |
| `eager: true`     | Đưa dep vào **initial chunk** (không lazy) — host load đồng bộ. Tiện cho host khởi tạo nhưng **tăng initial bundle**; thường chỉ bật ở **một** nơi (host). |
| `strictVersion`   | Nếu version không thỏa `requiredVersion` thì **báo lỗi** thay vì chỉ warning. |

**Giải pháp khác — Import Maps + externals:**

- Đánh dấu React là **external** trong build của MFE (không bundle vào), rồi để **import map** trỏ `'react'` → một URL CDN duy nhất → mọi MFE chia sẻ một bản.

**Rủi ro & trade-off — singleton version skew:**

- `singleton` ép một bản, nhưng nếu MFE-A cần React 18 còn MFE-B đã viết cho React 19 → một bên chạy trên bản không như kỳ vọng → có thể lỗi runtime tinh vi. Đây là **version skew**.
- **Trade-off coupling vs duplication:** share singleton giảm duplication nhưng **tăng coupling** (mọi MFE bị ràng một bản dep, khó nâng cấp lệch nhịp). Không share thì mỗi MFE độc lập nâng cấp được nhưng tốn dung lượng và **không thể** với React (vỡ hooks). Vì thế: **bắt buộc singleton** cho framework dùng module-level state (React, ReactDOM, single-spa); cân nhắc cho lib stateless (lodash, date-fns) — duplicate vài KB nhiều khi chấp nhận được để giữ độc lập.

:::tip Insight phỏng vấn
Câu chốt: *"React **phải** singleton — không phải để tối ưu size, mà vì nhiều React instance làm vỡ hooks/context. Với lib stateless thì singleton là tối ưu, không bắt buộc."* Hiểu **lý do** này phân biệt senior với người học thuộc.
:::

### Code minh hoạ

```js
// Cấu hình shared đầy đủ — áp cho CẢ host và remote
const deps = require("./package.json").dependencies;

new ModuleFederationPlugin({
  name: "host",
  remotes: { products: "products@http://localhost:3002/remoteEntry.js" },
  shared: {
    // React: BẮT BUỘC singleton (tránh vỡ hooks vì nhiều instance)
    react: {
      singleton: true,
      requiredVersion: deps.react,   // ví dụ "^18.2.0" từ package.json
      eager: true,                   // chỉ host nên eager (vào initial chunk)
    },
    "react-dom": {
      singleton: true,
      requiredVersion: deps["react-dom"],
      eager: true,
    },
    // Router cũng giữ state → nên singleton để 1 lịch sử điều hướng
    "react-router-dom": { singleton: true, requiredVersion: deps["react-router-dom"] },

    // Lib stateless: share để dedupe nhưng KHÔNG ép singleton,
    // cho phép MFE dùng version lệch mà không vỡ runtime
    lodash: { requiredVersion: deps.lodash }, // không singleton
  },
});
```

```js
// Remote: KHÔNG eager (lazy) để không phình initial bundle của remote
new ModuleFederationPlugin({
  name: "products",
  filename: "remoteEntry.js",
  exposes: { "./lifecycles": "./src/main" },
  shared: {
    react: { singleton: true, requiredVersion: deps.react },        // eager mặc định false
    "react-dom": { singleton: true, requiredVersion: deps["react-dom"] },
  },
});
```

```text
Khi version lệch (host React 18.2.0, remote yêu cầu 18.3.0):
  singleton: true  → Webpack chọn 1 bản (cao nhất thỏa) + log WARNING:
    "Unsatisfied version 18.3.0 ... singleton ... used 18.2.0"
  → vẫn chạy nhưng có rủi ro version skew → cần align version giữa các team.

  strictVersion: true → thay vì warning sẽ THROW → fail fast khi lệch.
```

### Đáp án mẫu

> "Vấn đề là mỗi MFE bundle React riêng thì vừa tải trùng nhiều bản, vừa **vỡ hooks/context** — vì React giữ dispatcher ở module-level state nên nhiều React instance sẽ làm `useContext` không thấy provider và ném 'Invalid hook call'. Nên React **buộc** phải là một instance. Với Module Federation em khai báo `shared: { react: { singleton: true, requiredVersion } }` cho cả host và remote — `singleton` ép một bản duy nhất, nếu version lệch Webpack sẽ warning version mismatch và dùng bản cao nhất thỏa, em bật `strictVersion` khi muốn fail fast. `eager` thì em chỉ bật ở host để React vào initial chunk, remote để lazy tránh phình bundle. Cách khác là đánh React thành **external** rồi để **import map** trỏ về một URL CDN chung. Trade-off em luôn nói rõ: singleton giảm duplication nhưng tăng **coupling** — mọi MFE bị ràng một bản, khó nâng cấp lệch nhịp, rủi ro **version skew**. Vì thế em bắt buộc singleton cho thứ có module-level state như React, ReactDOM, router, single-spa; còn lib stateless như lodash thì share để dedupe nhưng không ép singleton, chấp nhận duplicate nhỏ để giữ độc lập."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                       | Đúng là                                                                       |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| "Module Federation tự lo hết micro-frontend"                  | MF chỉ lo tầng **module/dependency**; lifecycle & routing là việc của shell    |
| "single-spa thay thế Module Federation"                       | Hai lớp khác nhau (orchestrate vs share module); thường **dùng chung**         |
| "`remoteEntry.js` chứa code app"                              | Nó là **manifest container** mô tả expose gì + shared deps; code load sau      |
| "Import map cần build lại MFE khi đổi version"                | Chỉ đổi **URL** trong map; không rebuild MFE, rollback cũng chỉ đổi URL         |
| "Import map chạy mọi trình duyệt"                             | Native chưa đồng đều; single-spa dùng **SystemJS**, hoặc polyfill es-module-shims |
| "Share React để giảm bundle size"                             | Lý do chính là **tránh vỡ hooks/context** vì nhiều React instance, không chỉ size |
| "`singleton: true` luôn an toàn"                              | Có rủi ro **version skew** + tăng coupling; cần align version giữa team         |
| "Bật `eager: true` ở mọi MFE cho chắc"                        | `eager` phình initial bundle; thường chỉ bật ở **host**, remote để lazy         |
| "Lib nào cũng nên singleton"                                  | Chỉ bắt buộc cho thứ có module-level state (React/router); lib stateless thì không |
