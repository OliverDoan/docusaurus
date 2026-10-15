---
sidebar_position: 2
title: "2. Module Federation"
---

# 2. Module Federation

## 1. Module Federation là gì?

Bài học: [1. Module Federation là gì?](../../micro-frontend/02-module-federation/1_module-federation-la-gi.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Module Federation` giải quyết hai bài toán nào của cách tích hợp runtime? Vì sao phải giải ở tầng bundler?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai bài toán:

1. Làm sao một app **tải được code** của app khác lúc chạy, một cách gọn gàng.
2. Làm sao **không tải trùng** React và các thư viện lớn ở mỗi mảnh.

Phải giải ở tầng **bundler** vì chính bundler mới là nơi biết mọi thứ cần thiết: nó quyết định code được chia thành những chunk nào, module nào phụ thuộc module nào, và tên module được ánh xạ ra sao sau khi đóng gói. Tự viết tay bằng `import()` động thì bạn chỉ tải được file, còn việc "hai app đang dùng chung một bản React" thì không cách nào biết — vì sau khi build, mỗi bên đã nhúng React vào bundle của mình rồi.

Module Federation can thiệp đúng vào lúc build để chừa lại chỗ trống cho các module dùng chung, rồi lúc chạy mới khớp chúng lại với nhau qua một "kho chia sẻ" (shared scope).

</details>

**2. Phân biệt `host` và `remote`. Khi nào một app vừa đóng vai host vừa đóng vai remote?**

<details className="qa">
<summary>Xem đáp án</summary>

| Vai trò | Vai trò là gì | Ví dụ |
| --- | --- | --- |
| **Remote** | App **cung cấp** (expose) module ra ngoài | App "giỏ hàng" xuất ra component `Cart` |
| **Host** | App **tiêu thụ** (consume) module từ remote | App "vỏ" tải `Cart` về và render |

Đây là **vai trò**, không phải loại app — một app khai `exposes` là remote, khai `remotes` là host, và khai cả hai thì đóng cả hai vai.

Trường hợp thường gặp: trong micro-frontend, shell là host chính và mỗi mảnh là một remote. Nhưng mảnh "giỏ hàng" có thể vừa expose component `Cart` cho shell, vừa tiêu thụ component `ProductCard` từ mảnh "sản phẩm" — lúc đó nó vừa là remote vừa là host. Ngoài ra, khi chạy độc lập lúc phát triển, một remote thường cũng là host của chính nó để render app đầy đủ.

</details>

**3. Ba trường `exposes`, `remotes`, `shared` được khai ở đâu và mỗi trường làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`exposes`** — khai ở **remote**: module nào được "mở ra" cho bên ngoài dùng.
- **`remotes`** — khai ở **host**: những remote nào app này sẽ tải về.
- **`shared`** — khai ở **cả hai**: thư viện dùng chung để chia sẻ thay vì tải trùng.

```js
// Ở REMOTE: mở component Button ra ngoài
exposes: {
  './Button': './src/Button',
}

// Ở HOST: khai báo sẽ dùng remote tên "ui"
remotes: {
  ui: 'ui@http://localhost:3001/remoteEntry.js',
}

// Ở CẢ HAI: chia sẻ React
shared: { react: { singleton: true }, 'react-dom': { singleton: true } }
```

Lưu ý `shared` phải khai ở cả hai phía mới có tác dụng: nếu chỉ host khai, remote vẫn tự đóng gói React của riêng nó. Ngoài ra `name` của mỗi app cũng bắt buộc, vì nó là định danh để host gọi tới remote.

</details>

**4. `remoteEntry.js` chứa những gì, host dùng nó ra sao, và vì sao nhờ nó mà remote deploy độc lập được?**

<details className="qa">
<summary>Xem đáp án</summary>

`remoteEntry.js` là file được sinh ra khi remote build, đóng vai trò **bản kê khai (manifest)** kiêm cửa ngõ: nó liệt kê remote này expose những module nào, các module đó nằm ở chunk nào, và khai báo những thư viện mà remote sẵn sàng đưa vào kho chia sẻ.

Host chỉ cần biết **URL của file này**. Lúc chạy, host tải `remoteEntry.js` về, khởi tạo shared scope, rồi yêu cầu đúng module mình cần — remote trả về code của module đó.

Vì host chỉ giữ **URL** chứ không giữ code, remote có thể build và deploy lại bất cứ lúc nào: chỉ cần URL giữ nguyên, host tự động nhận bản mới ở lần tải sau mà không phải build lại gì cả. Đây chính là cơ chế tạo ra **độc lập deploy** — đặc tính cốt lõi của micro-frontend.

</details>

**5. Trong chuỗi `ui@http://localhost:3001/remoteEntry.js`, phần trước dấu `@` là gì và phải khớp với khai báo nào bên remote?**

<details className="qa">
<summary>Xem đáp án</summary>

Phần trước dấu `@` là **tên (name) của remote**, phần sau là **URL tới file manifest** của nó:

```text
ui@http://localhost:3001/remoteEntry.js
└┬┘ └──────────────┬──────────────────┘
 │                 └─ URL tới file manifest của remote
 └─ tên (name) của remote
```

Tên này phải **khớp chính xác với trường `name`** khai trong plugin Module Federation ở phía remote. Lý do: khi `remoteEntry.js` được tải về, nó tự đăng ký một biến toàn cục theo đúng cái tên đó; host tìm remote qua chính biến ấy. Nếu hai bên đặt tên lệch nhau, host tải file về thành công nhưng không tìm thấy remote và báo lỗi kiểu "không định nghĩa" — một lỗi rất hay gặp và dễ nhầm với lỗi mạng.

Còn khoá bên trái trong `remotes` (ở ví dụ cũng là `ui`) là bí danh dùng khi `import`, không bắt buộc trùng tên remote.

</details>

**6. Cơ chế `shared` hoạt động thế nào — khi cả host và remote cùng cung cấp một thư viện thì bản nào được dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

Bundler không nhúng cứng thư viện đã khai `shared` vào chỗ dùng, mà thay bằng một lời gọi tra cứu tới **shared scope** — một kho chung nằm trong bộ nhớ trang.

Lúc chạy, mỗi app (host và từng remote) **đăng ký bản thư viện của mình kèm số phiên bản** vào kho đó. Khi một module cần `react`, nó hỏi kho thay vì dùng bản riêng, và kho trả về bản **phiên bản cao nhất thoả mãn yêu cầu** của bên đang hỏi. Các bản còn lại nằm im, không được tải chunk về.

Với `singleton: true`, kho chỉ giữ **một thực thể duy nhất** cho toàn trang, nên mọi app bắt buộc dùng chung bản đó; nếu có bên yêu cầu phiên bản không tương thích, bundler ghi cảnh báo nhưng vẫn chạy tiếp.

Nếu bên nào **không khai** thư viện đó là shared, bên đó sẽ dùng bản riêng đã đóng gói sẵn — và bạn lại có nhiều bản React trên cùng một trang.

</details>

**7. `singleton: true` nghĩa là gì? Vì sao `react` và `react-dom` gần như luôn cần, và chuyện gì xảy ra nếu thiếu?**

<details className="qa">
<summary>Xem đáp án</summary>

`singleton: true` nghĩa là **toàn trang chỉ dùng một thực thể duy nhất** của thư viện, kể cả khi các app khai những phiên bản khác nhau.

React cần điều này vì hook không phải hàm thuần: khi bạn gọi `useState`, React ghi vào **state nội bộ của chính bản React đang render**. Nếu component đến từ remote dùng bản React khác với bản đang render cây component, lời gọi hook rơi vào một bản không đang render — React không tìm thấy ngữ cảnh và báo lỗi. `react-dom` cũng phải đi cùng bản với `react` vì hai gói này chia sẻ nội bộ với nhau.

Nếu thiếu `singleton`, triệu chứng điển hình là lỗi *"Invalid hook call"*, ngoài ra còn Context bị "thủng" (Provider của bản này không tới được consumer của bản kia), `React.lazy`/`Suspense` hoạt động sai, và tất nhiên là tải trùng React nhiều lần.

</details>

**8. `requiredVersion` và `strictVersion` khác nhau ra sao? Xử lý thế nào khi hai mảnh cần hai bản major khác nhau của cùng một thư viện?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tuỳ chọn | Ý nghĩa |
| --- | --- |
| `requiredVersion` | Khoảng phiên bản mà app này yêu cầu; nếu bản trong kho chung không thoả, bundler **cảnh báo** nhưng vẫn chạy tiếp |
| `strictVersion` | Biến cảnh báo đó thành **lỗi** — thà hỏng ngay còn hơn chạy sai âm thầm |

Khi hai mảnh cần hai bản major khác nhau, có mấy hướng:

- **Ưu tiên số một: đồng bộ phiên bản.** Với React thì gần như bắt buộc, vì nó phải là singleton — cả tổ chức phải có lịch nâng cấp chung.
- Với thư viện **không cần singleton** (thư viện tiện ích, định dạng ngày tháng), bỏ `singleton` và cho phép mỗi mảnh dùng bản riêng — trả giá bằng dung lượng nhưng an toàn.
- Dùng **lớp adapter** trong mảnh cũ để nó chạy được với bản mới, rồi mới thống nhất.
- Bật `strictVersion` ở môi trường phát triển để phát hiện lệch sớm, thay vì để lỗi lộ ra trên production.

</details>

**9. `eager: true` làm gì? Vì sao thường bật ở host nhưng không bật ở remote?**

<details className="qa">
<summary>Xem đáp án</summary>

`eager: true` đưa thư viện **vào thẳng bundle ban đầu** thay vì tải bất đồng bộ. Nhờ đó thư viện có mặt ngay từ khi trang khởi động và được đăng ký sẵn vào shared scope — đổi lại bundle đầu tiên nặng hơn, nên tài liệu ghi rõ là **dùng thận trọng**.

Host thường là bên **khởi động trang**: nó phải render được ngay, và nó là nơi tự nhiên nhất để cung cấp bản React dùng chung cho cả trang. Đặt `eager: true` ở host cũng là cách nhanh nhất để thoát lỗi *"Shared module is not available for eager consumption"* khi entry của host import React một cách đồng bộ.

Remote thì ngược lại: nó **luôn được host tải về bất đồng bộ**, nên tới lúc code của nó chạy thì shared scope đã sẵn sàng — không cần eager. Nếu bật eager ở remote, remote sẽ nhét thêm một bản React vào bundle của chính nó, đúng thứ mà `shared` sinh ra để tránh.

</details>

**10. Vì sao cần `async boundary`? Lỗi *"Shared module is not available for eager consumption"* xảy ra trong tình huống nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì việc khởi tạo shared scope là **bất đồng bộ**: trang phải tải xong và thương lượng xong các thư viện dùng chung thì mới biết dùng bản React nào. Nếu file entry `import` React một cách **đồng bộ** ngay dòng đầu, nó đòi thư viện trước khi kho chia sẻ kịp sẵn sàng — đó chính là lúc xuất hiện lỗi *"Shared module is not available for eager consumption"*.

Cách xử lý kinh điển là tách một **async boundary**: entry không làm gì ngoài việc import động file khởi động thật.

```js
// index.js — chỉ có một dòng, tạo async boundary
import('./bootstrap')

// bootstrap.js — nơi thật sự import React và render
import React from 'react'
import { createRoot } from 'react-dom/client'
```

Lúc này mọi thứ bên trong `bootstrap` đều chạy sau khi shared scope đã khởi tạo xong. Cách thay thế là bật `eager: true`, nhưng nó làm nặng bundle ban đầu nên async boundary vẫn là lựa chọn được ưa chuộng hơn.

</details>

**11. Khai remote tĩnh trong config khác gì `dynamic remote` (URL quyết định lúc chạy)? Khi nào bắt buộc phải dùng dynamic?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Remote tĩnh | Dynamic remote |
| --- | --- | --- |
| URL nằm ở đâu | Trong config, cố định lúc build | Quyết định lúc chạy |
| Đổi URL | Phải build lại host | Không cần build lại |
| Danh sách remote | Biết trước, cố định | Có thể thay đổi theo người dùng/môi trường |
| Độ phức tạp | Thấp, `import` thẳng như module thường | Cao hơn, phải tự khởi tạo và nạp |

Bắt buộc dùng dynamic khi:

- **Nhiều môi trường** dev/staging/prod dùng chung một artifact host — URL lấy từ cấu hình runtime.
- **Danh sách mảnh thay đổi được**, ví dụ hệ thống plugin hoặc mỗi khách hàng bật một bộ tính năng khác nhau.
- Cần **A/B test hoặc canary**: cùng một tên remote nhưng trỏ tới hai phiên bản khác nhau tuỳ người dùng.
- Cần **rollback nhanh** bằng cách đổi URL mà không đụng tới host.

Module Federation 2.0 hỗ trợ việc này thuận tiện hơn nhờ manifest và Federation Runtime, thay vì phải tự viết đoạn nạp thủ công.

</details>

**12. Làm sao quản lý URL của các remote qua nhiều môi trường dev/staging/prod mà không phải build lại host?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: **không nhúng URL vào bundle lúc build**, vì như vậy mỗi môi trường lại cần một bản build riêng và bạn không còn triển khai được cùng một artifact.

Các cách thường dùng:

- **File cấu hình runtime** — host tải một file JSON nhỏ (không cache hoặc cache rất ngắn) chứa ánh xạ tên remote sang URL, rồi mới nạp remote theo đó.
- **Biến toàn cục do server chèn vào HTML** khi trả trang, khác nhau theo môi trường.
- **Đường dẫn tương đối hoặc cùng domain** — mỗi mảnh nằm dưới một đường dẫn cố định và để tầng reverse proxy trỏ về đúng nơi theo môi trường.
- **Tên miền theo môi trường** kèm quy ước đặt tên nhất quán, host chỉ ghép chuỗi.

Kèm theo nên có: kiểm tra hợp lệ danh sách URL lúc khởi động, fallback khi một remote không tải được, và cơ chế đổi URL nóng để rollback nhanh. Cách này cũng chính là nền cho canary — chỉ cần đổi giá trị trong file cấu hình.

</details>

**13. Host nạp code từ domain khác lúc runtime có rủi ro bảo mật gì? Bạn giảm thiểu bằng `CORS`, `CSP`, `SRI` hay cách nào khác?**

<details className="qa">
<summary>Xem đáp án</summary>

Rủi ro cốt lõi: code của remote chạy **trong chính origin của host**, với đầy đủ quyền — đọc được DOM, cookie, `localStorage` và token của người dùng. Không có sandbox như iframe. Vì vậy một remote bị chiếm quyền, hoặc một domain remote bị chiếm, đồng nghĩa với việc toàn bộ trang bị chiếm.

Các lớp phòng thủ:

- **HTTPS bắt buộc** cho mọi remote, tránh bị chèn code trên đường truyền.
- **`CORS`** — cấu hình đúng ở phía remote để trình duyệt cho phép host tải; đây là điều kiện hoạt động, không phải lớp bảo vệ.
- **`CSP`** với `script-src` chỉ liệt kê đúng những domain remote được phép — đây là lớp có giá trị nhất, chặn việc nạp code từ nguồn lạ.
- **`SRI`** về lý thuyết là mạnh nhất, nhưng khó áp cho `remoteEntry.js` vì file này đổi theo mỗi lần deploy trong khi hash phải biết trước; thực tế chỉ dùng được khi bạn ghim phiên bản cố định.
- **Kiểm soát nguồn gốc**: chỉ nạp remote do tổ chức mình sở hữu, kiểm soát quyền ghi lên bucket/CDN, bật audit log và review thay đổi.
- Coi việc thêm một remote mới là **quyết định bảo mật**, không phải thao tác cấu hình thông thường.

</details>

**14. Nên đặt chính sách cache và versioning cho `remoteEntry.js` thế nào để vừa nhận bản mới nhanh, vừa không vỡ phiên người dùng đang mở?**

<details className="qa">
<summary>Xem đáp án</summary>

Ý tưởng chung là tách hai loại file:

- **`remoteEntry.js`** — tên cố định nên **không được cache lâu** (no-cache hoặc TTL rất ngắn, kèm revalidate). Nếu cache lâu, người dùng sẽ mãi dùng bản cũ và bạn mất luôn lợi ích deploy độc lập.
- **Các chunk mà nó trỏ tới** — tên có hash nên **cache dài, bất biến**. Tên đổi mỗi lần nội dung đổi nên không bao giờ lấy nhầm.

Vấn đề với phiên đang mở: người dùng đã tải `remoteEntry.js` cũ, đang giữ tab mở, rồi bạn deploy bản mới. Khi họ điều hướng tới một mảnh chưa tải, host đi tìm chunk cũ — nếu chunk đó đã bị xoá thì lỗi tải chunk.

Cách giảm thiểu:

- **Giữ lại artifact của vài bản build trước** thay vì xoá ngay khi deploy.
- **Deploy theo thư mục phiên bản** và chỉ đổi con trỏ, để bản cũ vẫn truy cập được.
- **Bắt lỗi tải chunk** rồi gợi ý người dùng tải lại trang, hoặc tự reload một lần.
- Thông báo khi có bản mới với những phiên mở lâu.

</details>

**15. `Module Federation 2.0` (`@module-federation/enhanced`) bổ sung gì so với bản gốc của Webpack 5?**

<details className="qa">
<summary>Xem đáp án</summary>

Bản gốc đi cùng Webpack 5 và gắn chặt với Webpack. Module Federation 2.0, qua package `@module-federation/enhanced`, bổ sung:

- **Manifest chuẩn hoá** kèm **Federation Runtime** — tải module linh hoạt hơn, thuận tiện cho dynamic remote thay vì phải tự viết đoạn nạp thủ công.
- **Gợi ý kiểu (type hinting) tự động cho TypeScript** giữa các app — giải quyết điểm yếu lớn nhất của bản gốc.
- **Hệ thống plugin runtime** để mở rộng hành vi nạp module.
- **Hỗ trợ nhiều bundler**: Webpack, Rspack, Vite qua plugin tương ứng — không còn bị khoá vào Webpack.

Lời khuyên thực dụng: học cấu hình Webpack 5 kinh điển trước cho dễ hiểu bản chất, nhưng khi làm dự án thật thì cân nhắc `@module-federation/enhanced` để có thêm manifest và type safety.

</details>

**16. Làm sao có type safety TypeScript giữa host và remote khi module chỉ tồn tại lúc runtime?**

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề gốc: `import('ui/Button')` không trỏ tới file nào trong dự án host, nên TypeScript không biết kiểu và mặc định coi là `any` — bạn mất hoàn toàn kiểm tra kiểu ở đúng chỗ dễ vỡ nhất.

Các cách xử lý, từ thủ công tới tự động:

- **Khai báo kiểu thủ công** trong một file `.d.ts` ở host, tự mô tả module mà remote phơi ra. Đơn giản nhưng phải tự giữ cho khớp, và không ai cảnh báo khi lệch.
- **Package hợp đồng dùng chung** — một npm package chỉ chứa type, cả host và remote cùng phụ thuộc. Có phiên bản rõ ràng, nhưng phải nâng ở cả hai bên.
- **Type hinting tự động của Module Federation 2.0** — remote sinh ra khai báo kiểu khi build, host tải về và dùng như type thật. Đây là cách sát nhất với thực tế, vì type luôn đi kèm bản build tương ứng.

Dù chọn cách nào, type chỉ kiểm tra lúc build; vẫn nên có **contract test** để bắt lệch hợp đồng lúc chạy.

</details>

---

## 2. Demo: React Host + Remote

Bài học: [2. Demo: React Host + Remote](../../micro-frontend/02-module-federation/2_demo-react.md)

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

---

## 3. Chia sẻ State & Routing

Bài học: [3. Chia sẻ State & Routing](../../micro-frontend/02-module-federation/3_chia-se-state-routing.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao `coupling` lỏng là mục tiêu số một khi cho các mảnh giao tiếp với nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

Coupling là mức độ các mảnh phụ thuộc vào **ruột** của nhau. Càng chia sẻ nhiều state trực tiếp, các mảnh càng dính nhau — và khi đã dính thì một thay đổi ở mảnh này buộc mảnh kia phải sửa và deploy theo, tức là **mất luôn lợi ích độc lập deploy**, thứ duy nhất biện minh cho toàn bộ chi phí của kiến trúc này.

Coupling lỏng nghĩa là các mảnh chỉ giao tiếp qua **hợp đồng rõ ràng** — hình dạng props, tên và payload của sự kiện — chứ không thò tay vào nội bộ nhau. Khi đó mỗi nhóm được tự do đổi cách cài đặt bên trong miễn là giữ đúng hợp đồng.

Nguyên tắc thực dụng đi kèm: chọn **cơ chế lỏng nhất mà vẫn đủ giải quyết bài toán**, đừng chọn cơ chế mạnh hơn mức cần thiết chỉ vì nó tiện.

</details>

**2. Xếp các cơ chế giao tiếp từ lỏng đến chặt và nêu tiêu chí bạn dùng để chọn cơ chế cho một tình huống cụ thể.**

<details className="qa">
<summary>Xem đáp án</summary>

Thứ tự từ lỏng tới chặt:

1. **Props & callback** — host truyền dữ liệu và hàm xuống remote. Ưu tiên nhất.
2. **Custom events** — các mảnh phát/nghe sự kiện, không biết nhau trực tiếp.
3. **Shared store** — kho state dùng chung. Dùng dè dặt vì tạo coupling chặt.

| Nhu cầu | Cơ chế nên dùng | Mức ràng buộc |
| --- | --- | --- |
| Host đưa dữ liệu xuống mảnh | Props & callback | Lỏng |
| Hai mảnh ngang hàng báo tin | Custom events | Lỏng |
| Dữ liệu toàn cục tối thiểu (user, theme) | Shared store nhỏ, singleton | Trung bình |
| Mọi mảnh đọc/ghi state lớn chung | *(tránh)* | Chặt |
| Điều hướng giữa các mảnh | Router ở shell + singleton | Trung bình |

Tiêu chí chọn: quan hệ là **cha–con hay ngang hàng**, dữ liệu là **một chiều hay hai chiều**, phạm vi là **cục bộ hay thật sự toàn cục**, và các mảnh có **cùng framework** hay không.

</details>

**3. Vì sao `props` và `callback` được ưu tiên nhất? "Hợp đồng" giữa host và remote ở đây gồm những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì đây là cách vừa đơn giản vừa an toàn nhất: host coi remote như một component bình thường, truyền dữ liệu xuống và nhận kết quả qua callback. Luồng dữ liệu một chiều, rõ ràng, dễ debug và kiểm tra được bằng kiểu.

```jsx
<RemoteCart
  userId={currentUser.id}
  onCheckout={(items) => handleCheckout(items)}
/>
```

Remote chỉ phụ thuộc vào **hình dạng props**, không phụ thuộc vào host cụ thể — đổi sang host khác vẫn chạy, và test remote độc lập rất dễ vì chỉ cần truyền props giả.

Hợp đồng ở đây gồm:

- **Tên và kiểu của từng prop**, cái nào bắt buộc, cái nào tuỳ chọn.
- **Chữ ký các callback** — nhận tham số gì, được gọi khi nào.
- **Hành vi mong đợi** khi thiếu dữ liệu hoặc khi đang tải.
- Ngầm định về **quyền sở hữu**: remote không tự ý đọc thêm gì ngoài props.

</details>

**4. Khi host và remote dùng framework khác nhau, props/callback còn dùng được không? Bạn thay bằng cơ chế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không dùng trực tiếp được, vì props là khái niệm nội bộ của từng framework — host React không thể render component Vue bằng cách truyền props như thường.

Cách thay thế:

- **Hàm mount/unmount tường minh** — remote phơi ra một hàm nhận phần tử DOM và một object cấu hình, bên trong nó tự khởi tạo framework của mình. Đây là cách phổ biến nhất và chính là mẫu mà single-spa dùng.
- **Web Component làm bao bì** — remote đóng gói thành custom element; host đặt thẻ vào DOM, truyền dữ liệu phức tạp qua property và nhận phản hồi qua `CustomEvent`.
- **Custom events** cho giao tiếp ngang hàng, vì chúng thuộc về trình duyệt nên framework nào cũng dùng được.

Về bản chất, cả ba đều giữ nguyên tinh thần của props/callback — dữ liệu đi xuống, sự kiện đi lên — chỉ đổi phương tiện từ cơ chế của framework sang cơ chế của trình duyệt. Và như bài trước đã nói, trộn framework nên là lựa chọn có lý do, không phải mặc định.

</details>

**5. `CustomEvent` của trình duyệt hoạt động thế nào? So sánh với một event bus tập trung kiểu `RxJS Subject`.**

<details className="qa">
<summary>Xem đáp án</summary>

`CustomEvent` là cơ chế sẵn có của trình duyệt: một mảnh phát sự kiện lên `window`, các mảnh khác lắng nghe tên sự kiện đó và đọc dữ liệu trong `detail`.

```js
window.dispatchEvent(
  new CustomEvent('cart:add', { detail: { productId: 'sku-123', qty: 1 } })
)
```

| | `CustomEvent` | Event bus (`RxJS Subject`) |
| --- | --- | --- |
| Phụ thuộc | Không, có sẵn trong trình duyệt | Thêm thư viện, phải `shared`/singleton |
| Framework | Dùng được với mọi framework | Cũng được, nhưng phải cùng bản thư viện |
| Khả năng | Phát/nghe cơ bản | Toán tử mạnh: lọc, gộp, debounce, replay |
| Trạng thái trước đó | Ai nghe muộn thì mất tin | Có thể phát lại giá trị gần nhất |
| Coupling | Rất lỏng | Chặt hơn — mọi mảnh chung một thư viện |
| Truy vết | Xem được ở devtools | Cần công cụ riêng |

Với micro-frontend, `CustomEvent` thường là lựa chọn đúng vì nó lỏng nhất và không bắt các mảnh phải đồng ý về một thư viện chung.

</details>

**6. Nên quy ước tên sự kiện và cấu trúc `detail` ra sao? Khi payload sự kiện cần đổi thì versioning thế nào để không vỡ mảnh khác?**

<details className="qa">
<summary>Xem đáp án</summary>

Quy ước đặt tên theo dạng `mien:hanh-dong` — ví dụ `cart:add`, `auth:logout` — giúp tránh trùng tên toàn cục và đọc là hiểu ngay ai phát. Miền nên trùng với mảnh sở hữu sự kiện đó.

Về `detail`, nên:

- Luôn là một **object**, không phải giá trị trần, để sau này thêm field mà không vỡ.
- Chỉ chứa **định danh và dữ liệu tối thiểu**, để bên nghe tự đi lấy chi tiết — payload càng to càng dễ lệch.
- Được ghi vào **tài liệu chung**, vì đây là API công khai giữa các nhóm chứ không phải chi tiết nội bộ.

Về versioning, nguyên tắc là **chỉ thay đổi theo hướng cộng thêm**:

- Thêm field mới, giữ field cũ cho tới khi mọi bên đã chuyển.
- Khi buộc phải đổi phá vỡ, **phát thêm một sự kiện tên mới** (ví dụ thêm hậu tố phiên bản) và phát song song cả hai trong giai đoạn chuyển tiếp, rồi mới gỡ sự kiện cũ.
- Bên nghe nên bỏ qua an toàn những payload không hiểu thay vì ném lỗi.

</details>

**7. Rò rỉ bộ nhớ do `addEventListener` giữa các mảnh xảy ra thế nào và phòng tránh ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Listener được đăng ký trên `window` — một đối tượng sống suốt vòng đời trang — trong khi component của mảnh thì mount rồi unmount liên tục. Nếu không gỡ listener lúc unmount, hàm xử lý vẫn nằm lại và giữ tham chiếu tới toàn bộ closure của component: state, dữ liệu đã tải, thậm chí cả cây DOM cũ.

Hậu quả không chỉ là tốn bộ nhớ: mỗi lần mount lại, mảnh đăng ký thêm một listener, nên một sự kiện sẽ kích hoạt hàm xử lý nhiều lần, gây cập nhật trùng lặp và những lỗi rất khó tái hiện.

Phòng tránh:

```js
useEffect(() => {
  const onAdd = (e) => updateCart(e.detail)
  window.addEventListener('cart:add', onAdd)
  return () => window.removeEventListener('cart:add', onAdd)
}, [])
```

Vài lưu ý: phải gỡ đúng **cùng một tham chiếu hàm** đã đăng ký, nên không dùng hàm ẩn danh viết trực tiếp ở hai chỗ. Với mảnh có nhiều listener, dùng `AbortController` để gỡ tất cả một lần. Và nếu remote có hàm unmount riêng, hàm đó phải dọn cả listener, timer lẫn subscription.

</details>

**8. Khi nào chấp nhận dùng `shared store`? Vì sao lạm dụng nó bị gọi là "monolith trá hình"?**

<details className="qa">
<summary>Xem đáp án</summary>

Chấp nhận được khi dữ liệu **thực sự toàn cục và ổn định**: người dùng đang đăng nhập, theme, ngôn ngữ, quyền hạn. Đặc điểm chung là ít thay đổi hình dạng, nhiều mảnh cần, và không mảnh nào "sở hữu" riêng. Cách an toàn là giữ một store **nhỏ, chủ yếu chỉ đọc**, còn state riêng thì mỗi mảnh tự quản.

Gọi là "monolith trá hình" khi mọi mảnh cùng đọc/ghi một store khổng lồ. Lúc đó:

- Đổi hình dạng state buộc **mọi mảnh phải sửa và deploy cùng lúc** — hết độc lập deploy.
- Không ai biết mảnh nào đã ghi giá trị sai, debug khó hơn hẳn monolith thật.
- Các mảnh phải dùng chung một thư viện state và một phiên bản.
- Thứ tự khởi tạo giữa các mảnh trở thành yếu tố quyết định, sinh ra lỗi chỉ xuất hiện lúc chạy.

Nói cách khác, bạn trả đủ chi phí của kiến trúc phân tán nhưng vẫn giữ nguyên ràng buộc của monolith.

</details>

**9. Chia sẻ Redux hay Zustand qua `shared: singleton` gặp vấn đề gì nếu hai mảnh build với hai phiên bản khác nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

Với `singleton`, toàn trang chỉ dùng **một thực thể duy nhất** — nên bản được nạp trước hoặc bản cao hơn sẽ phục vụ tất cả, còn mảnh yêu cầu bản khác chỉ nhận được một cảnh báo lệch phiên bản rồi vẫn chạy tiếp.

Vấn đề nảy sinh:

- Mảnh build với bản mới có thể gọi **API chưa tồn tại** trong bản đang chạy, lỗi chỉ lộ ra lúc runtime ở đúng nhánh code đó.
- Nếu đổi giữa hai bản major, hành vi có thể khác âm thầm — không ném lỗi nhưng kết quả sai.
- Bỏ `singleton` để mỗi mảnh dùng bản riêng thì lại có **hai store độc lập**: mảnh này ghi, mảnh kia không thấy — còn khó phát hiện hơn.

Cách xử lý: khai `requiredVersion` rõ ràng, bật `strictVersion` ở môi trường phát triển để lỗi lộ sớm, và quan trọng nhất là **thống nhất lịch nâng cấp** thư viện state cho cả tổ chức. Đây cũng chính là lý do nên giữ shared store ở mức tối thiểu — càng ít phụ thuộc chung thì càng ít ràng buộc phiên bản.

</details>

**10. Đặt state dùng chung vào URL hoặc query param có ưu điểm gì? Khi nào cách này phù hợp hơn shared store?**

<details className="qa">
<summary>Xem đáp án</summary>

Ưu điểm:

- **Không tạo coupling giữa các mảnh** — URL là thứ trình duyệt đã có sẵn, không mảnh nào phải phụ thuộc thư viện hay hình dạng store của mảnh khác.
- **Chia sẻ và lưu lại được** — người dùng copy link gửi cho nhau, đánh dấu trang, mở lại đúng trạng thái.
- **Nút back/forward hoạt động đúng** một cách tự nhiên.
- **Sống sót qua reload** mà không cần lưu trữ gì thêm.
- Dễ debug: nhìn thanh địa chỉ là biết trạng thái.

Phù hợp hơn shared store khi state **mô tả "người dùng đang xem gì"**: bộ lọc, từ khoá tìm kiếm, trang hiện tại, tab đang mở, khoảng thời gian của báo cáo.

Không phù hợp khi dữ liệu **nhạy cảm** (token, thông tin cá nhân), **quá lớn** để nhét vào URL, hoặc thay đổi liên tục từng mili giây. Dữ liệu kiểu người dùng đăng nhập và theme vẫn nên nằm ở shared store nhỏ.

</details>

**11. Thông tin xác thực và `token` nên chia sẻ giữa các mảnh theo cách nào cho an toàn? Ai chịu trách nhiệm làm mới token?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: **một nơi duy nhất sở hữu phiên đăng nhập**, thường là shell. Các mảnh không tự đăng nhập, không tự lưu token, không tự làm mới.

Cách chia sẻ an toàn hơn cả là **không chia sẻ token dạng chuỗi**:

- Shell truyền xuống **thông tin người dùng đã lọc** (id, tên, quyền) cùng một **hàm gọi API đã kèm sẵn xác thực**, để mảnh dùng mà không bao giờ chạm vào token.
- An toàn nhất là dùng **cookie `HttpOnly`** do server đặt — token không tồn tại trong JavaScript, nên một mảnh bị lỗi cũng không đọc được.
- Tránh nhét token vào `localStorage` hay biến toàn cục, vì mọi mảnh đều đọc được và mọi script chèn vào trang cũng vậy.

**Làm mới token là việc của shell** — nếu mỗi mảnh tự làm, nhiều mảnh sẽ cùng gọi làm mới một lúc và có thể vô hiệu hoá token của nhau. Shell nên gom các lời gọi trùng, và khi phiên hết hạn thì phát một sự kiện kiểu `auth:logout` để mọi mảnh dọn dẹp cùng lúc.

Cần nhớ: mọi mảnh chạy chung một origin, nên ranh giới ở đây là **kỷ luật thiết kế**, không phải rào chắn kỹ thuật.

</details>

**12. Phân biệt routing cấp shell và routing nội bộ của một mảnh. Ai nên sở hữu đối tượng `history`?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Routing cấp shell** — host quyết định *mảnh nào* hiển thị ở URL nào, ví dụ `/cart` thuộc mảnh giỏ hàng.
- **Routing nội bộ mảnh** — mỗi mảnh tự định tuyến bên trong nhánh của mình, ví dụ `/cart/coupon`.

```jsx
<Routes>
  <Route path="/cart/*" element={<RemoteCart />} />
  <Route path="/profile/*" element={<RemoteProfile />} />
</Routes>
```

Dấu `*` ở cuối là chỗ shell "nhường quyền" phần còn lại của đường dẫn cho mảnh.

**Shell nên sở hữu đối tượng `history`** — nó là bên khởi động trang, tồn tại suốt phiên và biết toàn cảnh bản đồ URL. Các mảnh thì mount/unmount liên tục nên không thể giữ một trạng thái điều hướng bền vững. Mảnh chỉ *dùng* history do shell cung cấp thông qua router dùng chung, chứ không tự tạo history riêng — nếu hai bên cùng ghi vào thanh địa chỉ, back/forward sẽ hoạt động sai.

</details>

**13. Vì sao `react-router-dom` phải để `singleton`? Hai bản router cùng chạy trên một thanh địa chỉ sẽ hỏng thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Router giữ trạng thái điều hướng trong bộ nhớ và đồng bộ nó với một tài nguyên **toàn cục duy nhất**: thanh địa chỉ và ngăn xếp history của trình duyệt. Chỉ có một thanh địa chỉ, nên chỉ được có một bên cầm trịch.

```js
shared: {
  'react-router-dom': { singleton: true },
}
```

Nếu có hai bản cùng chạy:

- Mỗi bản giữ một bản sao vị trí hiện tại, nên chúng **lệch nhau** — một bên đã chuyển trang, bên kia vẫn nghĩ đang ở trang cũ.
- Cả hai cùng đẩy mục vào history, nên **một lần điều hướng sinh hai mục**: người dùng phải bấm back hai lần mới thoát.
- Context của router bị "thủng": component của remote gọi hook điều hướng nhưng không tìm thấy Provider thuộc cùng bản, gây lỗi kiểu "phải dùng bên trong Router".
- `Link` của mảnh có thể khiến trình duyệt tải lại cả trang thay vì chuyển mềm.

Đây cũng là lý do `singleton` cần cho mọi thư viện giữ trạng thái toàn cục, không riêng React.

</details>

**14. `basename` và quy ước tiền tố URL dùng để làm gì? Xử lý deep-link thẳng vào một route sâu bên trong remote ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`basename` là tiền tố URL mà mảnh được cấp. Nhờ nó, mảnh định tuyến nội bộ bằng đường dẫn tương đối và **không cần biết mình đang được gắn ở đâu** — cùng một mảnh có thể nằm ở `/cart` trong trang này và `/gio-hang` trong trang khác mà không sửa code.

Quy ước tiền tố cũng chính là cách phân chia quyền sở hữu: mỗi mảnh "sở hữu" một nhánh đường dẫn, nên routing nội bộ của nó không bao giờ chồng lấn mảnh khác.

Với deep-link thẳng vào route sâu, ví dụ người dùng mở trực tiếp `/cart/coupon/abc`:

- Shell đọc URL, khớp tiền tố `/cart/*`, và **tải remote tương ứng** — cần hiển thị trạng thái chờ vì bước này đi qua mạng.
- Truyền `basename` cùng phần đường dẫn còn lại xuống mảnh để nó tự khớp route nội bộ.
- Nếu remote tải thất bại, phải có fallback thay vì trang trắng.
- Nếu URL không khớp tiền tố nào, shell hiển thị trang không tìm thấy — đây là trách nhiệm của shell, không phải của mảnh.

</details>

**15. Một remote cần điều hướng sang mảnh khác (vd giỏ hàng sang thanh toán). Thiết kế cơ chế nào để nó không phụ thuộc cứng vào mảnh kia?**

<details className="qa">
<summary>Xem đáp án</summary>

Điểm mấu chốt: mảnh giỏ hàng **không được biết mảnh thanh toán tồn tại**. Nó chỉ biết ý định "người dùng muốn thanh toán", còn việc ý định đó dẫn tới đâu là chuyện của shell.

Các cách thiết kế, từ ưu tiên cao xuống:

- **Callback từ shell** — shell truyền xuống một hàm kiểu `onCheckout`, mảnh gọi khi cần. Rõ ràng nhất, hợp với quan hệ cha–con, và shell toàn quyền quyết định đích đến.
- **Custom event** — mảnh phát `cart:checkout`, shell lắng nghe và điều hướng. Hợp khi mảnh nằm sâu hoặc không có quan hệ cha–con trực tiếp.
- **Điều hướng bằng URL** qua router dùng chung — chấp nhận được, nhưng đường dẫn bị viết cứng trong mảnh, nên nếu đổi cấu trúc URL là phải sửa nhiều nơi.

Thứ nên tránh tuyệt đối: `import` trực tiếp module của mảnh kia, hoặc gọi hàm mà mảnh kia gắn lên biến toàn cục. Cả hai biến hai mảnh thành một khối phải deploy cùng nhau, và nếu mảnh kia chưa tải thì hỏng ngay.

</details>

**16. Làm sao giữ lại trạng thái người dùng khi họ chuyển qua lại giữa các mảnh khiến remote bị unmount rồi mount lại?**

<details className="qa">
<summary>Xem đáp án</summary>

Trước hết cần phân loại trạng thái, vì mỗi loại có chỗ ở khác nhau:

- **Trạng thái mô tả "đang xem gì"** (bộ lọc, từ khoá, trang, tab) — đặt vào **URL**. Đây là cách sạch nhất: sống sót qua unmount, qua reload, qua cả việc chia sẻ link.
- **Dữ liệu lấy từ server** — dùng **cache theo khoá** ở tầng lấy dữ liệu, để mount lại thì hiện ngay dữ liệu cũ rồi mới làm mới ngầm. Không cần giữ component sống.
- **Dữ liệu toàn cục** (người dùng, theme, giỏ hàng) — để ở **shared store nhỏ, singleton** nằm ngoài vòng đời của mảnh.
- **Bản nháp người dùng đang gõ dở** — lưu tạm vào `sessionStorage` theo khoá riêng của mảnh, và dọn khi đã gửi.

Cách cuối cùng là **giữ mảnh mount nhưng ẩn đi** thay vì unmount. Nó giữ được mọi thứ nhưng tốn bộ nhớ và dễ sinh listener chạy ngầm, nên chỉ dùng cho một hai mảnh người dùng chuyển qua lại liên tục.

Điều quan trọng: đừng dựa vào việc mảnh không bao giờ bị unmount — hãy thiết kế để mount lại luôn là chuyện bình thường.

</details>
