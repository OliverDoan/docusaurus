---
sidebar_position: 10
title: "10. Caching Data"
---

# 10. Caching Data

## 1. Caching Layers

Bài học: [1. Caching Layers](../../nextjs/10-caching/1_caching.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Kể tên bốn tầng cache của App Router. Với mỗi tầng, nêu nó nằm ở đâu (server hay client), sống bao lâu và giải quyết vấn đề gì.**

<details className="qa">
<summary>Xem đáp án</summary>

| Layer | Vị trí | Lifetime | Mục đích |
|---|---|---|---|
| Request Memoization | Server, per request | 1 lần render | Dedupe fetch trùng trong cùng một request |
| Data Cache | Server, persistent | Đến khi revalidate | Chia sẻ kết quả fetch giữa các request |
| Full Route Cache | Server, persistent | Đến khi rebuild / revalidate | Phục vụ HTML + payload RSC đã render sẵn |
| Router Cache | Browser | Theo phiên, có thời gian stale ngắn | Điều hướng client gần như tức thì |

Thứ tự request đi qua: từ trình duyệt vào Router Cache → Full Route Cache → Data Cache → Request Memoization → cuối cùng mới tới database/API. Mỗi tầng chỉ đi xuống tầng dưới khi **miss**. Hiểu thứ tự này rất quan trọng khi debug: dữ liệu cũ có thể kẹt ở bất kỳ tầng nào, và `revalidateTag` chỉ chạm tới Data Cache chứ không tự động dọn cache nằm trong trình duyệt người dùng.

</details>

**2. `Request Memoization` và `Data Cache` khác nhau thế nào? Cùng một `fetch` lặp lại thì tầng nào bắt trước?**

<details className="qa">
<summary>Xem đáp án</summary>

Khác nhau ở **phạm vi và tuổi thọ**:

- `Request Memoization` sống trong **một lần render duy nhất**. Header và Sidebar cùng gọi `/api/user` thì chỉ có 1 HTTP call; render xong là quên sạch. Đây là cơ chế của React, không phụ thuộc option cache.
- `Data Cache` **persist giữa các request** và giữa các người dùng, nằm trên server, chỉ mất khi revalidate hoặc hết hạn.

Khi một `fetch` lặp lại trong cùng render, **Request Memoization bắt trước** — nó là tầng trong cùng, sát database nhất trong sơ đồ, nên lời gọi thứ hai không đi đâu cả. Chỉ khi là request mới (render mới) thì mới hỏi tới Data Cache. Hệ quả: `fetch` đặt `cache: "no-store"` vẫn được dedupe trong một render — no-store tắt Data Cache chứ không tắt memoization.

</details>

**3. `Request Memoization` dedupe dựa trên khoá nào? Hai lời gọi cùng URL nhưng khác header có được coi là trùng không?**

<details className="qa">
<summary>Xem đáp án</summary>

Khoá memoization gồm **URL + method + các option của request** (trong đó có headers và body). Hai lời gọi chỉ được coi là trùng khi khớp toàn bộ, nên cùng URL nhưng khác header thì **không trùng** — sẽ có hai HTTP call thật.

```ts
await fetch("/api/user");                                  // call 1
await fetch("/api/user");                                  // dedupe với call 1
await fetch("/api/user", { headers: { "x-role": "admin" } }); // call 2, khác khoá
```

Đây là điểm hay bị bỏ sót: thêm header `Authorization` hay một header trace ngẫu nhiên vào mỗi lời gọi là đủ làm dedupe mất tác dụng, và bạn tự hỏi vì sao API bị gọi nhiều lần. Nếu cần chuẩn hoá, gom lời gọi vào một hàm dùng chung để mọi nơi truyền y hệt option. Với hàm không phải `fetch`, dùng `cache()` của React và khoá chính là tham số truyền vào.

</details>

**4. Với hàm không phải `fetch` — ví dụ một query Prisma — làm sao để dedupe trong cùng một render? `cache()` của React hoạt động ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Bọc hàm bằng `cache()` của React:

```ts
import { cache } from "react";

export const getUser = cache(async (id: string) => {
  return await db.user.findUnique({ where: { id } });
});

const a = await getUser("123"); // hit DB
const b = await getUser("123"); // lấy lại kết quả, không hit DB
```

`cache()` trả về một phiên bản có ghi nhớ của hàm: trong **cùng một lần render**, lời gọi có cùng tham số sẽ dùng lại promise đã tạo. Nhờ vậy nhiều component lồng nhau có thể tự lấy dữ liệu chúng cần mà không phải khoan props từ trên xuống.

Vài lưu ý: khoá so sánh tham số theo tham chiếu, nên truyền object mới mỗi lần là mất tác dụng — ưu tiên tham số nguyên thuỷ. Bộ nhớ này reset sau mỗi request, nghĩa là nó **không** thay được Data Cache; muốn dùng lại giữa các request thì cần cơ chế cache dữ liệu riêng.

</details>

**5. Next.js 15 đổi mặc định của `fetch` sang không cache. Vì sao họ đổi, và bạn rà soát một codebase nâng cấp từ Next.js 14 như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Lý do đổi: ở Next.js 14, `fetch` cache mặc định (`force-cache`) khiến rất nhiều người bối rối vì dữ liệu không chịu làm mới, và tệ hơn là vô tình cache dữ liệu riêng của từng user. Mặc định "không cache" trực giác hơn — muốn cache thì phải **opt-in** rõ ràng.

```ts
await fetch(url);                               // Next 15: KHÔNG cache
await fetch(url, { cache: "force-cache" });     // cache
await fetch(url, { next: { revalidate: 60 } }); // ISR
```

Quy trình rà soát khi nâng cấp:

- Liệt kê mọi `fetch` trong Server Component và phân loại: dữ liệu công khai ít đổi hay dữ liệu riêng từng user.
- Với nhóm ít đổi, thêm lại `force-cache` hoặc `next: { revalidate }` — nếu không, trang trước đây tĩnh giờ thành dynamic, tải nặng lên API và hoá đơn hạ tầng tăng.
- So sánh build output trước và sau: route nào từ static chuyển sang dynamic là dấu hiệu cần xem lại.
- Đo lại số lần gọi API thực tế ở môi trường staging.

</details>

**6. So sánh `cache: "force-cache"`, `next: { revalidate: 60 }` và `cache: "no-store"`. Mỗi lựa chọn tác động tới tầng cache nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Lựa chọn | Data Cache | Ảnh hưởng tới route |
|---|---|---|
| `cache: "force-cache"` | Lưu và dùng lại cho tới khi revalidate chủ động | Route có thể ở dạng static |
| `next: { revalidate: 60 }` | Lưu, sau 60 giây coi là cũ và làm mới ở nền | Route theo kiểu ISR |
| `cache: "no-store"` | Không lưu, mỗi request gọi lại nguồn | Kéo route sang dynamic |

Cả ba đều **không tắt** `Request Memoization` — trong một render, lời gọi trùng vẫn chỉ đi một lần.

Cách chọn: `force-cache` cho dữ liệu gần như bất biến và bạn chủ động làm mới bằng `revalidateTag`; `revalidate` cho dữ liệu chấp nhận cũ trong một khoảng thời gian như tỷ giá, thời tiết, bài blog; `no-store` bắt buộc cho mọi thứ gắn với danh tính người dùng — giỏ hàng, dashboard, hồ sơ cá nhân.

</details>

**7. Điều gì khiến một route chuyển từ static sang dynamic? Kể các API làm route bị opt out khỏi `Full Route Cache`.**

<details className="qa">
<summary>Xem đáp án</summary>

Một route thành dynamic khi Next.js nhận ra kết quả render phụ thuộc vào từng request, nên không thể dựng sẵn một bản HTML dùng chung.

Các nguyên nhân thường gặp:

- Dùng **dynamic API** đọc thông tin của request: `cookies()`, `headers()`, `draftMode()`, và đọc `searchParams` trong page.
- Có `fetch` với `cache: "no-store"` hoặc tương đương trong cây render.
- Khai báo `export const dynamic = "force-dynamic"`.
- Dùng `connection()` hoặc các API báo hiệu phải chờ request thật.

Hệ quả: `Full Route Cache` bị bỏ qua, mỗi request render lại từ đầu. Lưu ý phạm vi — một component con lỡ gọi `cookies()` là kéo cả route xuống dynamic, kể cả phần còn lại hoàn toàn tĩnh. Cách kiểm chứng nhanh là xem build output: route hiện ký hiệu static, ISR hay dynamic.

</details>

**8. Đọc build output thấy ký hiệu static, dynamic và ISR — giải thích ý nghĩa từng loại và cách một trang cụ thể rơi vào loại nào.**

<details className="qa">
<summary>Xem đáp án</summary>

```
○ /                Static
○ /about           Static
ƒ /dashboard       Dynamic
● /blog/[slug]     ISR
```

- **Static**: HTML được dựng lúc build và cache mãi trong `Full Route Cache`; muốn đổi nội dung phải rebuild. Route rơi vào loại này khi không dùng dynamic API và mọi `fetch` đều cache được.
- **ISR**: dựng sẵn nhưng có hạn dùng — có `revalidate` ở cấp route hoặc ở lời gọi `fetch`, hoặc đã khai báo `generateStaticParams` cho dynamic route. Hết hạn thì bản cũ vẫn được phục vụ trong lúc Next.js làm mới ở nền.
- **Dynamic**: render lại mỗi request, không dùng Full Route Cache, do dùng `cookies()`, `headers()`, `no-store` hay `force-dynamic`.

Thói quen tốt: đọc build output mỗi lần deploy: một route âm thầm chuyển từ static sang dynamic thường là dấu hiệu ai đó vừa thêm một dynamic API vào component con.

</details>

**9. `export const dynamic = "force-static"` và `"force-dynamic"` thay đổi hành vi gì? Chuyện gì xảy ra nếu bạn ép static một trang có gọi `cookies()`?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai cờ này ép chế độ render cho **cả route**, bỏ qua suy luận tự động của Next.js:

```ts
export const dynamic = "force-static";  // luôn dựng sẵn
export const dynamic = "force-dynamic"; // luôn render mỗi request
export const revalidate = 3600;         // thời gian làm mới cho cả route
```

`force-dynamic` tắt `Full Route Cache`, thường dùng cho dashboard hay trang phụ thuộc phiên đăng nhập. `force-static` đi ngược lại: buộc route dựng sẵn và coi mọi `fetch` như có cache.

Nếu ép static một trang có gọi `cookies()` hay `headers()`, các API đó không còn dữ liệu thật của request để trả — chúng trả về giá trị rỗng thay vì cookie của người dùng. Kết quả là trang render như thể khách vãng lai: mất trạng thái đăng nhập, hoặc tệ hơn là dựng sẵn một bản HTML rồi phục vụ chung cho mọi người. Cần dữ liệu theo người dùng thì đừng ép static — hãy để route dynamic hoặc đẩy phần đó xuống Client Component.

</details>

**10. `Router Cache` nằm ở đâu và tồn tại bao lâu? Vì sao người dùng vẫn thấy dữ liệu cũ dù server đã revalidate xong?**

<details className="qa">
<summary>Xem đáp án</summary>

`Router Cache` nằm **trong bộ nhớ của trình duyệt**, giữ payload RSC của các route đã ghé qua hoặc đã prefetch. Nó sống theo phiên làm việc: reload trang là mất, và mỗi entry có một khoảng thời gian được coi là còn "tươi". Ở Next.js 15, mặc định segment của page động gần như không được dùng lại, trong khi route đã prefetch tĩnh giữ được vài phút; layout và `loading.js` thì vẫn được tái sử dụng.

Đây chính là lý do gây bối rối: `revalidatePath` và `revalidateTag` chỉ dọn cache **trên server**. Trình duyệt của người dùng vẫn giữ bản RSC cũ trong bộ nhớ, nên điều hướng qua lại bằng `Link` hay nút back vẫn hiện dữ liệu cũ cho tới khi entry hết hạn hoặc reload cứng. Muốn cập nhật ngay trong phiên hiện tại, phía client phải gọi `router.refresh()`, hoặc dùng Server Action — action tự làm mới router sau khi chạy xong.

</details>

**11. `router.refresh()` làm gì và không làm gì? Nó khác `revalidatePath` ra sao về phạm vi tác động?**

<details className="qa">
<summary>Xem đáp án</summary>

`router.refresh()` chạy **ở client**: nó xoá `Router Cache` của phiên hiện tại và yêu cầu server gửi lại payload RSC cho route đang xem. Server Component chạy lại, phần UI được cập nhật nhưng **giữ nguyên state của Client Component** và không reload cả trang — khác hẳn `window.location.reload()`.

Nó **không** dọn `Data Cache`. Nếu dữ liệu vẫn nằm trong Data Cache còn hạn, server render lại sẽ trả đúng giá trị cũ đó.

| | `router.refresh()` | `revalidatePath` / `revalidateTag` |
|---|---|---|
| Chạy ở đâu | Client | Server |
| Tác động tới | Router Cache của một người dùng | Data Cache và Full Route Cache, cho mọi người dùng |
| Dùng khi | Muốn màn hình hiện tại lấy lại dữ liệu | Dữ liệu nguồn đã đổi sau mutation |

Thực tế thường dùng cả hai: revalidate trên server để đánh dấu dữ liệu cũ, rồi làm mới router để người vừa thao tác thấy kết quả ngay.

</details>

**12. Prefetch của `Link` lấy trước những gì? Khi nào bạn tắt prefetch và cái giá phải trả là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi một `Link` lọt vào viewport hoặc người dùng hover, Next.js tải trước payload RSC của route đích và nhét vào `Router Cache`, kèm các chunk JS cần thiết. Click sau đó gần như tức thì vì không phải chờ round-trip.

```tsx
<Link href="/dashboard" prefetch>Dashboard</Link>
<Link href="/heavy-page" prefetch={false}>...</Link>
```

Mức độ lấy trước khác nhau theo loại route: route tĩnh có thể lấy đủ, route động thường chỉ lấy tới ranh giới `loading.js` để còn hiện khung chờ ngay.

Khi nào tắt: danh sách có hàng trăm link (bảng dữ liệu, kết quả tìm kiếm) — prefetch hàng loạt tạo cả đống request thừa, tốn băng thông người dùng và tải vô ích lên server; hoặc route rất nặng mà người dùng hiếm khi vào.

Cái giá: lần điều hướng đầu tiên chậm hơn thấy rõ. Bù lại nên có `loading.js` để người dùng thấy phản hồi ngay.

</details>

**13. `Data Cache` dùng chung giữa mọi người dùng. Mô tả cách một trang hồ sơ cá nhân có thể phục vụ nhầm dữ liệu người khác và cách phòng.**

<details className="qa">
<summary>Xem đáp án</summary>

Kịch bản kinh điển: trang hồ sơ fetch dữ liệu user mà quên tắt cache.

```ts
// SAI — kết quả của user đầu tiên bị lưu và dùng chung
const user = await fetch(`/api/users/${params.id}`).then(r => r.json());

// Fix
const user = await fetch(`/api/users/${params.id}`, {
  cache: "no-store",
}).then(r => r.json());
```

Nguy hiểm hơn là khi định danh không nằm trong URL mà lấy từ cookie hoặc header `Authorization`: khoá cache khi đó giống nhau giữa mọi người, nên người đăng nhập sau có thể nhận đúng dữ liệu của người trước.

Cách phòng:

- Mọi dữ liệu gắn với danh tính đều `cache: "no-store"`.
- Đọc danh tính từ session ngay trong Server Component; việc dùng `cookies()` cũng tự kéo route sang dynamic.
- Đừng đưa token vào URL rồi tưởng là đã tách khoá cache.
- Kiểm thử bằng hai tài khoản khác nhau trên bản production build, không chỉ ở dev.

</details>

**14. Gọi `cookies()` hoặc `headers()` trong một component ảnh hưởng thế nào tới khả năng cache của cả route? Bạn khoanh vùng tác động đó ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai API đó đọc dữ liệu của request cụ thể, nên Next.js không thể dựng sẵn một bản HTML dùng chung: **cả route** bị opt out khỏi `Full Route Cache` và chuyển sang dynamic. Chỉ cần một component sâu trong cây gọi `cookies()` là đủ, dù 90% trang còn lại hoàn toàn tĩnh.

Các cách khoanh vùng:

- Bọc phần phụ thuộc request trong `<Suspense>` để phần tĩnh vẫn được gửi trước và phần động stream sau.
- Tách phần đó thành Client Component tự gọi API sau khi mount, giữ phần khung của trang ở dạng tĩnh.
- Đẩy logic đọc cookie lên middleware hoặc chỉ đọc trong Server Action, thay vì rải khắp cây render.
- Chia nhỏ route: phần marketing tĩnh tách khỏi phần dashboard cá nhân hoá.

Cách kiểm tra: xem build output, route đáng lẽ static mà hiện dynamic thì đi tìm dynamic API bị lọt vào.

</details>

**15. Phân biệt SSG, ISR và SSR trong App Router theo cách các tầng cache tham gia, chứ không chỉ theo tên gọi.**

<details className="qa">
<summary>Xem đáp án</summary>

| | SSG | ISR | SSR |
|---|---|---|---|
| Khi nào render | Lúc build | Lúc build, rồi làm mới theo hạn | Mỗi request |
| Full Route Cache | Dùng, không hết hạn | Dùng, có hạn theo `revalidate` | Bỏ qua |
| Data Cache | Kết quả fetch được lưu | Lưu và làm mới theo hạn hoặc theo tag | Thường bỏ qua vì `no-store` |
| Cách kích hoạt | Không dùng dynamic API, fetch cache được | `revalidate` ở route hoặc ở fetch | `cookies()`, `headers()`, `no-store`, `force-dynamic` |

Điểm cần nhấn: trong App Router đây không phải ba chế độ bạn chọn bằng một hàm riêng như `getStaticProps` ngày xưa, mà là **kết quả suy ra** từ những API bạn dùng trong cây render. Cùng một route có thể vừa có phần tĩnh vừa có phần động nhờ `<Suspense>`. Vì vậy trả lời phỏng vấn nên nói theo hành vi cache chứ không dừng ở nhãn SSG/ISR/SSR.

</details>

**16. Vì sao `revalidatePath("/products")` không làm mới `/products/abc`? Cần viết thế nào cho đúng với dynamic route?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `revalidatePath` khớp theo **đường dẫn chính xác** chứ không lan xuống các route con. `/products` và `/products/abc` là hai entry cache riêng biệt.

```ts
revalidatePath("/products");                // chỉ đúng trang danh sách
revalidatePath("/products", "page");        // chỉ page đó
revalidatePath("/products", "layout");      // layout + toàn bộ route con
revalidatePath("/products/[slug]", "page"); // mọi trang chi tiết theo pattern
```

Với dynamic route, phải truyền đúng **chuỗi pattern** `"/products/[slug]"` như khai báo trong thư mục, không phải giá trị cụ thể — trừ khi bạn chỉ muốn làm mới đúng một sản phẩm thì truyền `"/products/abc"`.

Trong thực tế, gắn tag khi fetch thường gọn hơn: fetch trang chi tiết với `next: { tags: [...] }` rồi gọi `revalidateTag` sau khi admin sửa. Tag làm mới đúng nhóm dữ liệu liên quan mà không cần nhớ chính xác cây đường dẫn, và tên tag phân biệt chữ hoa chữ thường.

</details>

**17. Bạn debug một nghi vấn cache như thế nào? Nêu các dấu hiệu và công cụ dùng để xác định cache hit hay miss.**

<details className="qa">
<summary>Xem đáp án</summary>

Bắt đầu bằng việc xác định **tầng nào** đang giữ dữ liệu cũ, vì cách chữa mỗi tầng một khác.

Dấu hiệu và công cụ:

- Console của dev server in kết quả từng request, kèm thời gian và trạng thái cache:

```
GET /products/abc 200 in 50ms (cache: HIT)
GET /products/xyz 200 in 500ms (cache: MISS)
```

- Đặt `console.log` ngay trước lời gọi fetch: log không in ra nghĩa là đã ăn cache.
- Trên Vercel, xem header `x-vercel-cache` với các giá trị hit/miss/stale.
- Next.js DevTools (thử nghiệm) cho phép nhìn trạng thái cache trực quan.

Cách phân tầng: dữ liệu cũ nhưng hard reload thì đúng → nghi `Router Cache`. Hard reload vẫn cũ → nghi `Data Cache` hoặc `Full Route Cache`. Luôn kiểm chứng trên bản production build, vì hành vi cache ở dev khác với production.

</details>

**18. Khi self-host thay vì deploy trên Vercel, `Data Cache` và `Full Route Cache` được lưu ở đâu? Chạy nhiều instance thì phát sinh vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định khi self-host, Next.js lưu cả hai tầng này trên **hệ thống file của chính instance đó**, trong thư mục cache nằm cùng output build. Chạy một process duy nhất thì ổn.

Vấn đề khi scale ra nhiều instance:

- Mỗi instance có một bản cache riêng, làm nóng cache độc lập, nên hai người dùng vào hai instance khác nhau có thể thấy dữ liệu khác nhau.
- `revalidateTag` hay `revalidatePath` chỉ dọn cache của **instance nhận request đó**; các instance khác vẫn phục vụ bản cũ cho tới khi hết hạn.
- Container vốn không có trạng thái bền: mỗi lần deploy hoặc restart là cache trống, dồn tải đột biến vào database.

Giải pháp: cấu hình cache handler tuỳ biến trong `next.config` để đẩy cache ra một store dùng chung như Redis. Khi đó mọi instance đọc ghi cùng một nơi và lệnh revalidate có hiệu lực toàn hệ thống. Nhớ kiểm tra cả khả năng dọn cache khi deploy phiên bản mới.

</details>

**19. Thiết kế chiến lược cache cho một site thương mại điện tử có trang marketing, danh sách sản phẩm, trang chi tiết và giỏ hàng. Giải thích lựa chọn cho từng loại trang.**

<details className="qa">
<summary>Xem đáp án</summary>

| Loại trang | Chiến lược | Lý do |
|---|---|---|
| Marketing, landing | Static (`force-cache`) | Nội dung gần như không đổi, cần nhanh và tốt cho SEO |
| Danh sách sản phẩm | ISR, `revalidate` vài phút | Chấp nhận cũ một chút, đổi lại chịu được lượng truy cập lớn |
| Chi tiết sản phẩm | ISR + tag, revalidate theo yêu cầu | Phải cập nhật ngay khi admin sửa giá hoặc tồn kho |
| Giỏ hàng, tài khoản | Dynamic (`no-store`) | Gắn với từng người dùng, tuyệt đối không dùng chung |

Cốt lõi nằm ở trang chi tiết: fetch kèm tag riêng cho từng sản phẩm, rồi khi admin cập nhật thì gọi `revalidateTag` cho đúng tag đó.

```tsx
const product = await fetch(`/api/products/${slug}`, {
  next: { tags: [`product-${slug}`] },
}).then(r => r.json());
```

Được cả hai: trang tải tức thì từ HTML dựng sẵn, mà nội dung vẫn cập nhật ngay sau khi sửa, không phải rebuild toàn site. Riêng phần biến động mạnh như số lượng tồn kho, nên tách ra component client tự gọi API.

</details>

---

## 2. Cache Management và Revalidation

Bài học: [2. Cache Management và Revalidation](../../nextjs/10-caching/2_cache-management.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Giải thích cơ chế `Stale-While-Revalidate` của `revalidate: N`. Người dùng nào là người nhận bản cũ và người nào nhận bản mới?**

<details className="qa">
<summary>Xem đáp án</summary>

Ý tưởng: **không ai phải đợi**. Trong N giây đầu, bản cache được coi là còn tươi và phục vụ thẳng. Qua mốc N giây, bản cache thành **stale** nhưng vẫn được trả về ngay lập tức; song song đó Next.js chạy render lại ở nền và ghi đè cache bằng bản mới.

Vì vậy người "xui" nhất chỉ là **người đầu tiên đến sau khi cache hết hạn** — họ vẫn nhận phản hồi nhanh, chỉ là nội dung cũ, đồng thời chính request của họ kích hoạt việc rebuild. Những người đến sau khi rebuild xong mới thấy bản mới.

Đánh đổi cần nói rõ khi phỏng vấn: hệ thống không bao giờ chặn người dùng để chờ dữ liệu, nhưng luôn có một khoảng thời gian nội dung cũ được phục vụ. Với dữ liệu phải chính xác tuyệt đối như số dư hay tồn kho, SWR không phù hợp — phải dùng `no-store` hoặc kết hợp revalidate theo yêu cầu.

</details>

**2. Với `revalidate: 60`, mô tả từng bước điều gì xảy ra ở các mốc thời gian 0 giây, 30 giây, 70 giây và 80 giây.**

<details className="qa">
<summary>Xem đáp án</summary>

- **t = 0**: request đầu tiên, chưa có cache → render thật, trả về cho người dùng và lưu bản kết quả vào cache. Đây là request chậm nhất.
- **t = 30**: còn trong 60 giây → phục vụ thẳng từ cache, không chạm database.
- **t = 70**: đã quá hạn → vẫn trả **bản cũ** ngay lập tức cho người dùng, đồng thời kích hoạt render lại ở nền.
- **t = 80**: bản nền đã xong và ghi đè cache → người dùng nhận **dữ liệu mới**.

Điểm hay bị trả lời sai: ở mốc 70 giây, nhiều người tưởng request đó phải chờ dữ liệu mới. Không — nó vẫn được phục vụ bản cũ, chỉ đóng vai trò người bấm nút khởi động việc làm mới. Cũng lưu ý bộ đếm thời gian tính từ lúc cache được ghi, và nếu không có request nào trong thời gian dài thì chẳng có gì được làm mới cả — hạn chỉ được kiểm tra khi có người ghé thăm.

</details>

**3. Vì sao `revalidateTag` và `revalidatePath` không làm trang cập nhật ngay lập tức? Chúng thực sự làm gì tại thời điểm được gọi?**

<details className="qa">
<summary>Xem đáp án</summary>

Tại thời điểm gọi, chúng chỉ **đánh dấu các entry cache liên quan là stale** — không render lại, không gọi database, không dựng HTML mới. Đó là lý do chi phí của chúng rất rẻ và gọi thoải mái trong Server Action cũng không sao.

Việc rebuild diễn ra ở **request kế tiếp** chạm vào dữ liệu đó: lúc đó cache mới bị coi là miss, Next.js render lại và lưu bản mới.

```ts
"use server";
export async function updateProduct(id: string, data: ProductData) {
  await db.product.update({ where: { id }, data });
  revalidateTag(`product-${id}`); // chỉ đánh dấu stale
}
```

Thiết kế như vậy vì rebuild ngay là lãng phí: nếu sửa 500 sản phẩm mà không ai xem, ta vừa tốn công dựng 500 trang vô ích. Hệ quả thực tế: sau mutation, người vừa thao tác có thể vẫn thấy bản cũ nếu trình duyệt còn giữ `Router Cache`; Server Action tự làm mới router nên thường ổn, còn lại thì gọi `router.refresh()`.

</details>

**4. So sánh `revalidatePath` và `revalidateTag` về độ mịn, phạm vi và khả năng áp dụng chéo route. Khi nào bạn dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | `revalidatePath` | `revalidateTag` |
|---|---|---|
| Đơn vị | Đường dẫn route | Nhãn gắn vào từng lời gọi lấy dữ liệu |
| Độ mịn | Thô — dọn cả trang | Mịn — đúng phần dữ liệu mang tag |
| Chéo route | Không, phải liệt kê từng path | Có, một tag trải khắp mọi trang dùng nó |
| Khi nào dùng | Biết chính xác trang nào đổi (form submit, một trang cố định) | Một thực thể dữ liệu xuất hiện ở nhiều trang |

Tag mạnh hơn trong hệ thống thật: một sản phẩm hiện ở trang danh sách, trang chi tiết và trang danh mục — gắn cùng tag thì một lệnh revalidate lo hết, không phải đi nhớ đủ đường dẫn. Nhược điểm là phải kỷ luật đặt tên tag, và tag quá rộng dễ dọn nhầm nhiều thứ.

`revalidatePath` vẫn tiện cho những trang tổng hợp không gắn với thực thể cụ thể, như trang chủ hay sitemap.

</details>

**5. `revalidatePath` yêu cầu đường dẫn tuyệt đối và có tham số kiểu `"page"` hoặc `"layout"`. Hai kiểu đó khác nhau ra sao về phạm vi invalidate?**

<details className="qa">
<summary>Xem đáp án</summary>

Đường dẫn phải bắt đầu bằng dấu gạch chéo — truyền `"products"` là không có tác dụng gì, và hàm cũng không báo lỗi.

```ts
revalidatePath("/products", "page");   // chỉ page.tsx của đúng route đó
revalidatePath("/products", "layout"); // layout đó và toàn bộ route con
revalidatePath("/products/[slug]");    // mọi trang khớp pattern động
revalidatePath("/products/abc");       // đúng một trang cụ thể
```

Khác biệt cốt lõi: `"page"` chỉ dọn đúng một mắt lưới, còn `"layout"` dọn từ layout đó **lan xuống toàn bộ cây con** — mạnh hơn nhưng dễ over-invalidate, kéo theo rebuild cả loạt trang không cần thiết.

Với dynamic route, nhớ truyền **chuỗi pattern** `"/products/[slug]"` đúng như tên thư mục, chứ không phải giá trị thật. Muốn làm mới đúng một sản phẩm thì truyền đường dẫn cụ thể. Sai chỗ này là kiểu bug im lặng khó lần nhất: hàm chạy trót lọt nhưng chẳng dọn gì.

</details>

**6. Thiết kế chiến lược đặt tag cho một site thương mại điện tử có trang danh sách, trang chi tiết và trang danh mục. Khi admin sửa một sản phẩm thì cần revalidate những tag nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: mỗi lời gọi lấy dữ liệu gắn **một tag rộng theo loại** và **một tag hẹp theo định danh**.

```ts
// danh sách
fetch("/api/products", { next: { tags: ["products"] } });
// chi tiết
fetch(`/api/products/${id}`, { next: { tags: ["products", `product-${id}`] } });
// danh mục
fetch(`/api/categories/${slug}/products`, {
  next: { tags: ["products", `category-${slug}`] },
});
```

Khi admin sửa một sản phẩm, cần dọn cả ba nơi nó xuất hiện:

```ts
revalidateTag(`product-${id}`);                  // trang chi tiết
revalidateTag(`category-${product.category.slug}`); // danh mục chứa nó
revalidateTag("products");                        // trang danh sách
```

Lưu ý nghiệp vụ: nếu thao tác sửa có đổi danh mục, phải revalidate **cả danh mục cũ lẫn danh mục mới**, nếu không sản phẩm vẫn còn nằm lại ở danh mục cũ. Tên tag nên sinh từ một hàm dùng chung để tránh gõ sai — tag phân biệt chữ hoa chữ thường và gọi sai tên thì không có lỗi nào báo cho bạn biết.

</details>

**7. Gọi `revalidateTag` với một tag không tồn tại thì chuyện gì xảy ra? Vì sao điều đó nguy hiểm và bạn phòng ngừa thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không có gì xảy ra cả — hàm chạy im lặng, không throw, không cảnh báo:

```ts
revalidateTag("non-existent"); // không lỗi, không làm gì
```

Nguy hiểm vì đây là **lỗi im lặng**: gõ sai một chữ, sai chữ hoa chữ thường, hoặc đổi tên tag ở chỗ fetch mà quên đổi ở chỗ revalidate — code vẫn xanh, test vẫn qua, chỉ có người dùng thấy giá cũ mãi không đổi. Lỗi loại này thường mất rất lâu mới bị phát hiện.

Cách phòng ngừa:

- Tập trung tên tag vào một nơi duy nhất, sinh bằng hàm có kiểu chặt, ví dụ một helper trả về `product-${id}`, không viết chuỗi rải rác.
- Với TypeScript, ràng buộc tham số bằng union type hoặc template literal type thay vì `string` trần.
- Viết kiểm thử tích hợp thật: sửa dữ liệu, tải lại trang, khẳng định nội dung đã đổi — chỉ cách này mới bắt được tag sai.

</details>

**8. Nhiều `fetch` khác URL nhưng cùng một tag. Một lần `revalidateTag` ảnh hưởng tới tất cả — đây là tính năng hay lỗi, và khi nào nó thành vấn đề?**

<details className="qa">
<summary>Xem đáp án</summary>

Đây là **tính năng**, và là lý do chính khiến tag hữu ích. Nó bảo đảm tính nhất quán: mọi nơi hiển thị cùng một khối dữ liệu đều được làm mới cùng lúc, không còn cảnh trang danh sách hiện giá mới trong khi trang danh mục vẫn giá cũ.

```ts
fetch("/api/products/list", { next: { tags: ["products"] } });
fetch("/api/categories/electronics/products", { next: { tags: ["products"] } });

revalidateTag("products"); // cả hai đều bị đánh dấu stale
```

Nó thành vấn đề khi tag quá rộng so với thay đổi thực tế. Sửa mô tả của một sản phẩm mà dọn luôn tag `products` thì mọi trang danh sách, mọi trang danh mục đều phải render lại — với catalog lớn, đó là một đợt dội tải vào database mà chẳng ai cần.

Cách cân bằng: gắn nhiều tag cho một lời gọi (một hẹp, một rộng), rồi ở chỗ mutation **chọn đúng mức tag cần dọn** theo loại thay đổi: sửa mô tả thì chỉ dọn tag hẹp, đổi giá hay trạng thái bán thì mới dọn tag rộng.

</details>

**9. `unstable_cache` giải quyết được gì mà cache của `fetch` không giải quyết được? Cho một ví dụ thực tế bạn bắt buộc phải dùng nó.**

<details className="qa">
<summary>Xem đáp án</summary>

Cache của `fetch` chỉ hoạt động với request HTTP. Rất nhiều dữ liệu trong ứng dụng không đi qua HTTP: query trực tiếp vào database bằng Prisma hay Drizzle, đọc file, gọi SDK của bên thứ ba, hay một phép tính nặng. `unstable_cache` bọc **cả một hàm** để kết quả của nó cũng vào `Data Cache`, cũng có tag và cũng có `revalidate`.

```ts
export const getProducts = unstable_cache(
  async () => db.product.findMany(),
  ["products"],                       // cache key
  { tags: ["products"], revalidate: 3600 }
);
```

Ví dụ bắt buộc dùng: ứng dụng nối thẳng vào database, không có tầng API ở giữa. Không có `fetch` nào để gắn `next: { tags }`, nên nếu không bọc hàm thì mỗi lần render đều phải truy vấn lại, và cũng không có cách nào để `revalidateTag` chạm tới được. Bọc lại thì query nặng chỉ chạy một lần cho tới khi dữ liệu thật sự đổi, và mutation có thể chủ động dọn cache qua tag.

</details>

**10. Trong `unstable_cache`, tham số cache key và mảng `tags` đóng vai trò khác nhau như thế nào? Quên truyền biến vào key thì hỏng ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai thứ phục vụ hai mục đích trái chiều:

- **Cache key** (mảng thứ hai) xác định **định danh của bản cache** — dữ liệu nào là dữ liệu nào.
- **`tags`** xác định **cách dọn** — sau này gọi `revalidateTag` với tag nào thì bản cache đó bị đánh dấu stale.

Quên đưa biến vào key là lỗi nghiêm trọng, vì mọi tham số khác nhau sẽ dùng chung **một ô cache duy nhất**:

```ts
// SAI — mọi id chia sẻ cùng một key
unstable_cache(async () => db.product.findUnique({ where: { id } }), ["product"])();

// ĐÚNG — key mang theo id
unstable_cache(
  async () => db.product.findUnique({ where: { id } }),
  [`product-${id}`],
  { tags: [`product-${id}`, "products"] }
)();
```

Hậu quả của bản sai: người xem sản phẩm B nhận được dữ liệu của sản phẩm A. Nếu hàm đó lấy dữ liệu theo người dùng thì đây thành lỗ hổng rò rỉ dữ liệu — lý do nữa để không bao giờ cache dữ liệu gắn danh tính.

</details>

**11. Bạn gọi `revalidateTag` trong `Server Action` nhưng người dùng vẫn thấy dữ liệu cũ sau khi submit. Nêu các nguyên nhân có thể và cách chẩn đoán.**

<details className="qa">
<summary>Xem đáp án</summary>

Các nguyên nhân thường gặp, theo thứ tự nên kiểm tra:

- **Sai tên tag** — chuỗi ở chỗ fetch và chỗ revalidate không khớp, gõ sai hoặc lệch chữ hoa chữ thường. Gọi tag không tồn tại thì im lặng, không có lỗi.
- **Fetch không hề gắn tag** — thiếu `next: { tags: [...] }` nên chẳng có gì để dọn.
- **`Router Cache` phía trình duyệt** còn giữ bản cũ; server đã mới nhưng màn hình hiện tại chưa cập nhật. Thử hard reload để loại trừ; nếu reload là đúng thì đây chính là thủ phạm — dùng `router.refresh()`.
- **Gọi revalidate trước khi mutation hoàn tất**, hoặc trong một nhánh code không chạy tới vì lỗi bị nuốt.
- **Self-host nhiều instance**: lệnh revalidate chỉ chạm instance nhận request, các instance khác vẫn phục vụ bản cũ.

Chẩn đoán: log ngay trước và sau lệnh revalidate, đặt log trong hàm lấy dữ liệu để biết nó có chạy lại không, và luôn kiểm chứng trên production build chứ không phải dev.

</details>

**12. Thiết kế endpoint webhook để CMS trigger revalidation. Bạn xác thực request thế nào và ánh xạ payload sang tag ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Endpoint là một Route Handler nhận POST. Xác thực trước, xử lý sau:

```ts
export async function POST(request: NextRequest) {
  const secret = request.headers.get("X-Secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }
  const { type, slug } = await request.json();
  switch (type) {
    case "blog-post":
      revalidateTag(`post-${slug}`);
      revalidateTag("posts");
      break;
    case "product":
      revalidateTag(`product-${slug}`);
      break;
  }
  return NextResponse.json({ revalidated: true });
}
```

Điểm cần nói thêm: secret để trong biến môi trường không có tiền tố công khai; nếu CMS ký payload thì nên xác minh chữ ký trên raw body thay vì so sánh chuỗi. Ánh xạ payload sang tag qua một bảng tra được khai báo tập trung, và với loại nội dung lạ thì trả về mã lỗi rõ ràng thay vì im lặng, để còn phát hiện khi CMS đổi schema.

</details>

**13. So sánh `revalidate = 0`, `cache: "no-store"` và `dynamic = "force-dynamic"`. Ba cách này có tương đương nhau không?**

<details className="qa">
<summary>Xem đáp án</summary>

Kết quả cuối cùng giống nhau — dữ liệu luôn tươi — nhưng **phạm vi tác động khác nhau**, nên không thể coi là tương đương.

| Cách viết | Phạm vi | Tác động |
|---|---|---|
| `cache: "no-store"` | Một lời gọi fetch | Chỉ fetch đó không vào Data Cache; kéo route sang dynamic |
| `export const revalidate = 0` | Cả route | Coi như không có hạn cache, route render lại mỗi request |
| `export const dynamic = "force-dynamic"` | Cả route | Ép dynamic một cách tường minh, mọi fetch bị xử như không cache |

Khi chọn, hãy ưu tiên phạm vi **hẹp nhất đủ dùng**: chỉ một phần dữ liệu cần tươi thì đặt `no-store` đúng chỗ đó, giữ phần còn lại vẫn cache được. Dùng `force-dynamic` là vứt bỏ `Full Route Cache` của cả trang, kể cả những mảng hoàn toàn tĩnh. Về tính rõ ràng khi đọc code, `force-dynamic` nói thẳng ý định hơn `revalidate = 0`, nên nếu thật sự muốn cả route dynamic thì nên dùng nó.

</details>

**14. Over-invalidation là gì? Cho một ví dụ tag quá rộng làm hỏng hiệu năng và cách bạn chia lại tag cho mịn hơn.**

<details className="qa">
<summary>Xem đáp án</summary>

Over-invalidation là dọn cache rộng hơn nhiều so với thay đổi thực tế, khiến hàng loạt trang phải render lại vô ích.

Ví dụ: mọi lời gọi dữ liệu trong site đều gắn đúng một tag `data`. Chỉ cần admin sửa một dòng mô tả là toàn bộ cache của site bị đánh dấu stale; lượt truy cập kế tiếp dội thẳng vào database, thời gian phản hồi tăng vọt, và lợi ích của cache gần như biến mất.

Cách chia lại cho mịn:

- Đặt tag theo **thực thể và định danh**: `product-123` thay vì `products` cho trang chi tiết.
- Cho mỗi lời gọi mang **nhiều tầng tag**: một hẹp, một rộng theo loại, để chỗ mutation chọn đúng mức cần dọn.
- Ở chỗ mutation, xét loại thay đổi: sửa mô tả thì chỉ dọn tag hẹp; đổi giá hay tồn kho — thứ hiện trên trang danh sách — mới dọn tag rộng.

Hướng đi ngược lại cũng sai: tag quá mịn thì dễ sót chỗ và hiển thị dữ liệu không nhất quán giữa các trang.

</details>

**15. Chi phí thực sự của on-demand revalidation là gì? Chuyện gì xảy ra khi hàng nghìn request cùng đến ngay sau khi cache bị đánh dấu stale?**

<details className="qa">
<summary>Xem đáp án</summary>

Bản thân lệnh revalidate **rất rẻ**: nó chỉ đánh dấu stale, không render, không truy vấn. Gọi vài lệnh trong một Server Action gần như không đáng kể.

Chi phí thật nằm ở **sau đó**: những request kế tiếp phải render lại. Nếu đang có lưu lượng lớn và bạn vừa dọn một tag rộng, rất nhiều request cùng gặp cache miss cùng lúc và cùng đi xuống database — hiện tượng dồn tải quen gọi là cache stampede. Trang đang nhanh bỗng chậm hẳn ngay sau một thao tác của admin.

Cách giảm rủi ro:

- Dọn tag hẹp nhất có thể để số trang phải dựng lại ít đi.
- Kết hợp `revalidate` theo thời gian để cơ chế phục vụ bản cũ trong lúc làm mới đỡ đòn thay vì chặn người dùng.
- Không gọi revalidate trong vòng lặp cho từng bản ghi khi cập nhật hàng loạt; gộp lại một lần ở mức phù hợp.
- Có lớp cache dùng chung phía trước database để nhiều request đồng thời không thành nhiều truy vấn.

</details>

**16. Một trang giá sản phẩm phải luôn đúng giá nhưng vẫn cần tải nhanh. Bạn kết hợp time-based và on-demand revalidation như thế nào, và fallback khi webhook thất bại là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng cả hai, mỗi cái một vai:

- **On-demand là đường chính**: mỗi khi giá đổi trong hệ quản trị hoặc CMS, gọi `revalidateTag` cho đúng sản phẩm. Người dùng thấy giá mới gần như ngay lập tức mà không cần rebuild site.
- **Time-based là lưới an toàn**: đặt thêm `revalidate` (ví dụ một giờ) cho chính lời gọi đó. Nếu webhook chết, lỗi mạng hay deploy làm mất tín hiệu, cache vẫn tự làm mới sau tối đa một giờ thay vì kẹt cũ vĩnh viễn.

```ts
export const getProduct = (id: string) =>
  unstable_cache(async () => db.product.findUnique({ where: { id } }),
    [`product-${id}`],
    { tags: [`product-${id}`, "products"], revalidate: 3600 })();
```

Bổ sung cho chắc: webhook nên có cơ chế thử lại và ghi log để biết lần nào trượt; phần dễ sai lệch nhất như tồn kho thời gian thực thì tách ra một component client tự gọi API. Cách này giữ được tốc độ của trang dựng sẵn mà sai số dữ liệu có trần rõ ràng.

</details>
