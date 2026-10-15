---
sidebar_position: 3
title: "3. Tích hợp Next.js"
---

# 3. Tích hợp Next.js

## 1. Module Federation với Next.js

Bài học: [1. Module Federation với Next.js](../../micro-frontend/03-nextjs/1_module-federation-nextjs.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Module Federation là gì, và nó khác cách chia sẻ code truyền thống (thư viện `npm`) ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Module Federation cho phép một ứng dụng **tải code từ ứng dụng khác lúc runtime** và **chia sẻ thư viện chung** để tránh tải trùng, ngay tại tầng bundler.

| | Thư viện npm | Module Federation |
| --- | --- | --- |
| Thời điểm ghép | Lúc build | Lúc chạy |
| Code nằm ở đâu | Trong bundle của app tiêu thụ | Ở host riêng của bên cung cấp |
| Khi bên cung cấp đổi | Nâng version, build lại, deploy lại app | Deploy lại một mình, bên kia tự nhận bản mới |
| Độc lập deploy | Không | Có |
| Type safety | Có sẵn | Phải thêm khai báo hoặc dùng type hinting |

Nói ngắn gọn: npm chia sẻ **mã nguồn lúc build**, Module Federation chia sẻ **module đang chạy lúc runtime**. Đây chính là khác biệt tạo ra độc lập deploy — thứ mà cách npm không thể có.

</details>

**2. Vì sao Next.js không dùng được `ModuleFederationPlugin` trần như React thuần mà phải dùng `@module-federation/nextjs-mf`?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì Next.js **tự quản entry point**. Ở React thuần, bạn tự viết `index.js` và tạo async boundary bằng mẫu `index.js → import('./bootstrap')`. Với Next.js, bạn không kiểm soát file khởi động nên **không thể tự chèn** ranh giới đó — mà không có nó thì cơ chế chia sẻ thư viện không hoạt động.

`@module-federation/nextjs-mf` sinh ra để giải quyết đúng chuyện này: nó **vá cơ chế chia sẻ của Next.js**, bù lại phần async boundary còn thiếu, đồng thời xử lý các đặc thù khác của framework như đường dẫn chunk và việc chia sẻ React/Next dạng singleton.

Điều cần nhớ ngắn gọn: **Next.js + Module Federation = phải dùng `@module-federation/nextjs-mf`** với `NextFederationPlugin`, không dùng `ModuleFederationPlugin` trần.

</details>

**3. `async boundary` là gì, vì sao Module Federation cần nó, và ở React thuần người ta tạo nó bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`async boundary` (ranh giới bất đồng bộ) là điểm trong luồng khởi động mà sau đó mọi thứ chạy bất đồng bộ. Module Federation cần nó vì việc dàn xếp thư viện dùng chung — quyết định ai chia sẻ React bản nào — **không thể làm ngay lập tức**. Bundler cần một "khoảng thở" để thương lượng xong trước khi code ứng dụng chạm tới thư viện chia sẻ.

Ở React thuần, người ta tạo ranh giới đó bằng cách để entry chỉ import động file khởi động thật:

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

Nếu render thẳng trong `index.js`, bạn sẽ gặp lỗi *"Shared module is not available for eager consumption"*. Và chính vì Next.js không cho bạn viết file entry này nên mới cần plugin riêng.

</details>

**4. Giải thích vai trò của `name`, `filename`, `exposes`, `remotes` trong cấu hình `NextFederationPlugin`.**

<details className="qa">
<summary>Xem đáp án</summary>

- **`name`** — tên định danh của app, bên kia dùng đúng tên này để gọi tới.
- **`filename`** — vị trí file manifest được sinh ra; với Next.js thường là `static/chunks/remoteEntry.js` cho khớp cấu trúc thư mục của framework.
- **`exposes`** — ở remote, ánh xạ tên công khai sang file thật cần mở ra.
- **`remotes`** — ở host, khai báo những remote sẽ tải kèm URL manifest của chúng.

```js
new NextFederationPlugin({
  name: 'remote',
  filename: 'static/chunks/remoteEntry.js',
  exposes: {
    './ProductCard': './components/ProductCard.js',
  },
  shared: {},
})
```

Ý nghĩa vẫn giống hệt Webpack thuần, chỉ khác ở hai điểm thực dụng: `filename` phải theo cấu trúc của Next.js, và `shared` có thể để trống vì plugin tự lo `react` cùng các module nội bộ của Next dạng singleton.

</details>

**5. Vì sao URL remote trong Next.js phải trỏ tới `.../_next/static/chunks/remoteEntry.js` thay vì một đường dẫn tuỳ ý?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì Next.js phục vụ toàn bộ tài nguyên tĩnh đã build dưới tiền tố cố định `/_next/static/`. Bạn không tự chọn được nơi file nằm như khi cấu hình `devServer` của Webpack thuần — framework quyết định cấu trúc đó.

Vì vậy cấu hình phải khớp hai đầu: phía remote khai `filename: 'static/chunks/remoteEntry.js'` để file được sinh vào đúng thư mục build, còn phía host trỏ tới URL đầy đủ tương ứng:

```js
remotes: {
  remote: `remote@http://localhost:3001/_next/static/chunks/remoteEntry.js`,
}
```

Nếu trỏ sai, host nhận 404 hoặc nhận về trang HTML 404 thay vì JavaScript — triệu chứng thường là lỗi cú pháp kiểu "unexpected token" ở Console, rất dễ gây hiểu nhầm thành lỗi code. Cách kiểm tra nhanh nhất là mở thẳng URL đó trên trình duyệt xem có ra nội dung JavaScript không.

</details>

**6. Vì sao thường đặt `ssr: false` khi nạp remote bằng `next/dynamic`? Bạn đánh đổi gì về SEO và `FCP`?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì render remote **trên server** là phần khó nhất của Next.js kết hợp Module Federation: server cũng phải tải được code remote, phải khớp phiên bản React giữa hai môi trường, và kết quả render trên server phải trùng với render ở client nếu không sẽ lỗi hydration. Đặt `ssr: false` cắt bỏ toàn bộ rắc rối đó, nên nhiều đội bắt đầu như vậy rồi mới tính tiếp.

```jsx
const ProductCard = dynamic(() => import('remote/ProductCard'), {
  ssr: false,
  loading: () => <p>Đang tải sản phẩm…</p>,
})
```

Đánh đổi:

- **SEO** — nội dung của remote không có trong HTML trả về, nên bot có thể không thấy. Nếu đó là nội dung chính cần xếp hạng thì đây là vấn đề nghiêm trọng.
- **Hiển thị lần đầu** — phần remote xuất hiện muộn hơn, sau khi JS chạy và tải xong module, nên vùng đó có một khoảng trống ban đầu; nếu không giữ chỗ bằng khung có kích thước cố định thì layout còn bị nhảy.

Cách dung hoà: dành `ssr: false` cho phần phụ và giữ nội dung cần SEO ở chính app host.

</details>

**7. Điều gì xảy ra nếu `react` và `react-dom` không được chia sẻ dạng `singleton` giữa host và remote? Mô tả triệu chứng lỗi.**

<details className="qa">
<summary>Xem đáp án</summary>

Trang sẽ có **hai bản React cùng chạy**. Hook không phải hàm thuần — khi gọi `useState`, React ghi vào state nội bộ của chính bản đang render. Component từ remote dùng bản React khác với bản đang render cây component nên lời gọi hook rơi vào một bản không đang render.

Triệu chứng điển hình:

- Lỗi *"Invalid hook call"* — thường kèm gợi ý về việc có nhiều bản React.
- **Context bị "thủng"**: Provider ở host không tới được consumer trong remote, nên theme, i18n, router, store dùng chung đều im lặng không hoạt động.
- Component remote render ra nhưng state không cập nhật, hoặc `Suspense` và `lazy` hành xử lạ.
- Tab Network cho thấy React được tải nhiều lần, bundle nặng bất thường.

Với Next.js, `NextFederationPlugin` đã tự lo phần này nên bạn thường không phải khai tay — nhưng nếu tự ghi đè `shared` sai, triệu chứng vẫn y hệt. Khi thấy "Invalid hook call" trong micro-frontend, việc đầu tiên nên nghi là chia sẻ React.

</details>

**8. Hỗ trợ `App Router` (React Server Components) của plugin khác gì so với `Pages Router`, và vì sao lại khó hơn?**

<details className="qa">
<summary>Xem đáp án</summary>

`@module-federation/nextjs-mf` chủ yếu **ổn với Pages Router**. Với App Router (thư mục `app/`, React Server Components), hỗ trợ **chưa hoàn thiện và hay thay đổi** — cần kiểm tra kỹ tài liệu và issue mới nhất của đúng phiên bản bạn dùng.

Lý do khó hơn: mô hình thực thi khác hẳn. Với Pages Router, mọi thứ cuối cùng vẫn là component chạy ở client và Module Federation chỉ cần nạp một module JavaScript về trình duyệt. Với App Router, component mặc định chạy **trên server** và kết quả được truyền xuống client dưới dạng dữ liệu đã render, chứ không phải code — nên khái niệm "tải module của app khác lúc chạy" phải được định nghĩa lại cho phía server, kèm ranh giới server/client, streaming và cơ chế caching riêng của framework.

Lời khuyên thực dụng: nếu bắt buộc dùng App Router, hãy giữ remote ở dạng **client-side** và coi mọi thứ ngoài phạm vi đó là rủi ro cần thử nghiệm kỹ.

</details>

**9. Trang host nên xử lý thế nào khi remote không tải được lúc chạy (mạng lỗi, remote down, sai version)?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc vẫn như React thuần: một mảnh hỏng chỉ được làm mất chức năng của chính nó.

Nên có:

- **Error boundary bọc riêng từng remote**, hiển thị nội dung thay thế thay vì để cả trang trắng.
- Tận dụng **`loading`** của `next/dynamic` cho trạng thái chờ, và giữ khung kích thước cố định để layout không nhảy.
- **Timeout** cho lần tải, tránh kẹt mãi ở trạng thái loading khi remote treo.
- **Phân loại mảnh**: phần phụ thì ẩn hẳn, phần thiết yếu thì báo rõ kèm nút thử lại.
- **Retry có giới hạn** và giãn cách, để không dồn tải khi remote đang sự cố.
- **Ghi log kèm nhãn mảnh và phiên bản** để biết nhóm nào cần xử lý.

Với lỗi lệch version thì triệu chứng khác: remote tải được nhưng render sai hoặc ném lỗi hook. Trường hợp này cần cảnh báo từ giám sát chứ không chỉ dựa vào fallback, vì trang trông vẫn "chạy".

</details>

**10. Host và remote deploy độc lập thì làm sao không phá nhau? Bạn versioning `remoteEntry.js` ra sao và cache CDN ảnh hưởng thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba nguyên tắc chính:

- **Hợp đồng chỉ mở rộng, không phá vỡ** — thêm props tuỳ chọn, thêm module mới; khi buộc phải đổi, phơi ra tên mới và chạy song song một thời gian rồi mới gỡ bản cũ.
- **Thứ tự deploy đúng** — thêm remote thì deploy remote trước; gỡ remote thì deploy host bỏ tham chiếu trước.
- **Luôn có người dùng đang giữ bản cũ trong tab**, nên bản mới phải tương thích ngược trong giai đoạn chuyển tiếp.

Về cache và versioning:

- `remoteEntry.js` có tên cố định nên phải để **cache rất ngắn hoặc revalidate mỗi lần**. Nếu CDN cache nó lâu, người dùng mãi nhận bản cũ và bạn mất luôn lợi ích deploy độc lập.
- Các chunk có hash trong tên thì **cache dài, bất biến** — an toàn vì tên đổi khi nội dung đổi.
- Sau khi deploy phải **xoá cache CDN cho file entry**, nếu không thay đổi sẽ không tới người dùng.
- **Giữ lại artifact của vài bản build trước**, vì tab đang mở có thể còn tham chiếu chunk cũ; xoá ngay sẽ gây lỗi tải chunk.

</details>

**11. `CORS` và `publicPath` gây ra những lỗi phổ biến nào khi lên production, và bạn chẩn đoán bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Trên máy local mọi thứ thường cùng `localhost` nên hai vấn đề này ẩn đi, rồi bung ra khi lên production với nhiều domain khác nhau.

**`CORS`** — remote không đặt header cho phép origin của host, trình duyệt chặn ngay ở bước tải. Triệu chứng: Console báo lỗi CORS rõ ràng, tab Network hiện request bị chặn. Sửa ở phía server của remote, và nhớ áp cho **cả chunk** chứ không chỉ file entry.

**`publicPath`** — code remote chạy trong trang host, nếu tiền tố là đường dẫn tương đối thì remote đi tìm chunk của mình trên domain của host và nhận 404. Triệu chứng đặc trưng: `remoteEntry.js` tải **thành công** nhưng render vẫn hỏng. Giá trị `auto` giúp Webpack suy ra tiền tố lúc chạy từ URL script; với Next.js thì đường dẫn `_next/static/` phải khớp giữa cấu hình remote và URL host khai.

Cách chẩn đoán chung: mở tab Network, xem **request nào đi sau `remoteEntry.js`** — bị chặn thì nghi CORS, 404 hoặc sai domain thì nghi `publicPath`.

</details>

**12. Vì sao API của plugin đổi nhiều theo phiên bản (`withModuleFederation` / `patchSharing` rồi tới `NextFederationPlugin`)? Bạn kiểm soát rủi ro nâng cấp thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì đây là vùng công nghệ **thay đổi nhanh và phụ thuộc vào nội bộ của Next.js**. Plugin không chỉ cấu hình thêm cho Webpack — nó phải vá cơ chế chia sẻ và bù phần async boundary mà framework không cho can thiệp. Mỗi khi Next.js đổi cách tổ chức entry, chunk hay mô hình render, plugin buộc phải đổi theo, và cách đổi gọn nhất thường là thay hẳn API thay vì chắp vá bản cũ.

Kiểm soát rủi ro nâng cấp:

- **Ghim phiên bản chính xác** cho cả Next.js lẫn plugin, và chỉ nâng theo chủ đích, không để tự trôi.
- Coi cặp Next.js + plugin là **một đơn vị nâng cấp**, đối chiếu ma trận tương thích trước khi đụng vào.
- **Đọc README và changelog đúng phiên bản đang cài**, không chép cấu hình từ bài viết cũ trên mạng — ví dụ cũ dùng `withModuleFederation`/`patchSharing`, bản mới dùng `NextFederationPlugin`.
- **Cô lập cấu hình federation** vào một chỗ duy nhất để khi API đổi thì chỉ sửa một nơi.
- Nâng cấp ở **nhánh riêng, kiểm thử E2E** trên môi trường đã ghép đầy đủ, vì lỗi loại này chỉ lộ ra lúc chạy.
- Luôn đối chiếu **module-federation.io** trước khi triển khai thật.

</details>

**13. Chia sẻ CSS-in-JS giữa host và remote hay trục trặc vì lý do gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Lý do cốt lõi: thư viện CSS-in-JS giữ **trạng thái toàn cục** — bộ đệm style, bộ sinh tên class, và thẻ style được chèn vào `head`. Trạng thái đó chỉ đúng khi toàn trang dùng **một thực thể duy nhất**. Nếu một module nội bộ của thư viện không được chia sẻ dạng singleton, host và remote mỗi bên có bộ đệm riêng.

Hậu quả thường gặp:

- **Style không xuất hiện** hoặc chỉ xuất hiện một phần, vì component lấy class từ bộ đệm này nhưng thẻ style lại do bộ đệm kia chèn.
- **Trùng tên class** do hai bộ sinh chạy độc lập, dẫn tới style đè nhau sai.
- **Thứ tự chèn style không xác định**, nên cùng một trang nhưng mỗi lần tải lại trông một kiểu.
- Với SSR còn thêm **lỗi hydration** vì style trên server và client không khớp.

Cách giảm rủi ro: đảm bảo thư viện CSS-in-JS và các module nội bộ của nó đều là singleton, hoặc tránh vấn đề từ gốc bằng cách dùng CSS Modules và biến CSS — chúng không giữ trạng thái runtime nên không có lớp lỗi này.

</details>

**14. Khi nào bạn khuyên KHÔNG dùng Next.js kết hợp Module Federation, và phương án thay thế là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Khuyên không dùng khi:

- Mục tiêu chính là micro-frontend **"đúng bài" kèm SSR** — đây là phần khó nhất và chưa mượt.
- Dự án đã hoặc sẽ dùng **App Router** với React Server Components, nơi hỗ trợ còn chưa hoàn thiện.
- Đội **chưa sẵn sàng chạy theo phiên bản**: API đổi nhiều, cần đọc tài liệu và issue liên tục.
- Quy mô chưa đủ lớn để cần độc lập deploy — chi phí rõ ràng lớn hơn lợi ích.

Phương án thay thế:

- Giữ remote ở dạng **client-side** với `ssr: false`, chấp nhận đánh đổi SEO cho phần đó — cách nhẹ nhàng nhất.
- Dùng **React thuần với Webpack/Rspack** cho các app micro-frontend, để Next.js cho những phần cần SSR/SEO mà không phải liên bang hoá.
- Cân nhắc **nền tảng chuyên cho micro-frontend** nếu SSR xuyên mảnh là yêu cầu bắt buộc.
- Hoặc quay lại **modular monolith** nếu vấn đề thật ra không phải chuyện nhiều nhóm chặn nhau.

Điểm cần nhớ: đừng kỳ vọng "cắm là chạy" như React thuần.

</details>
