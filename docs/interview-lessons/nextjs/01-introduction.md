---
sidebar_position: 1
title: "1. Introduction"
---

# 1. Introduction

## 1. Tại sao chọn Next.js?

Bài học: [1. Tại sao chọn Next.js?](../../nextjs/01-introduction/1_why-nextjs.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Next.js là gì, và nó bổ sung những gì lên React thuần?**

<details className="qa">
<summary>Xem đáp án</summary>

Next.js là **framework full-stack React** do **Vercel** phát triển. React core chỉ là một UI library — nó lo việc render component, còn mọi thứ quanh đó bạn phải tự lắp. Next.js đóng gói sẵn phần "quanh đó":

- **Routing** file-based — thư mục và file trong `app/` chính là URL.
- **Rendering strategy**: SSR, SSG, ISR — chọn theo từng route.
- **Server Components** và **Server Actions** (React 19).
- **Tối ưu asset** built-in: Image, Font, Script.
- **Bundler** (Turbopack/Webpack) và workflow build/deploy.

Điểm mấu chốt khi trả lời phỏng vấn: Next.js không thay thế React, nó **bọc quanh React** và biến một tập best practice rời rạc thành convention thống nhất — cài xong là code được, không phải tự cấu hình lại từ đầu cho mỗi project.

</details>

**2. Vì sao React core một mình không đủ cho ứng dụng production? Trước Next.js dev phải tự ghép những mảnh nào?**

<details className="qa">
<summary>Xem đáp án</summary>

React core cố tình giữ phạm vi hẹp — chỉ là **UI library**. Nó không trả lời được các câu hỏi bắt buộc của một app production:

- Routing — điều hướng giữa các trang.
- Data fetching — lấy dữ liệu ở đâu, lúc nào.
- Rendering strategy — CSR, SSR hay SSG.
- SEO — crawler đọc được gì.
- Performance — code splitting, tối ưu asset.
- Deployment — build ra gì, chạy ở đâu.

Trước Next.js, dev phải **tự ghép** Webpack + React Router + Redux + Express và một loạt tool khác. Hệ quả là mỗi project có setup khác nhau, người mới vào phải học lại từ đầu, và chất lượng phụ thuộc kinh nghiệm người dựng. Next.js chuẩn hoá bộ ghép đó thành framework có convention rõ ràng.

</details>

**3. So sánh `SPA` và `SSR` về first paint, `TTI`, kích thước bundle, SEO và yêu cầu hạ tầng.**

<details className="qa">
<summary>Xem đáp án</summary>

| | SPA (Single Page App) | SSR (Server-Side Rendering) |
|--|----------------------|-----------------------------|
| Render lần đầu | Browser tải JS rồi mới render | Server render HTML, gửi về sẵn |
| Bundle | Lớn (toàn app) | Nhỏ hơn (chia theo route) |
| TTI | Chậm | Nhanh hơn |
| SEO | Khó — crawler phải chạy JS | Tốt — HTML có sẵn nội dung |
| Hạ tầng | CDN tĩnh là đủ | Cần Node server hoặc edge |

Luồng khác nhau rất rõ:

```
SPA:  Browser → index.html (rỗng) → tải JS → fetch data → render
SSR:  Browser → request → Server render HTML → trả về → hydrate JS
```

SSR đổi lấy first paint nhanh và SEO tốt bằng cái giá là phải có server chạy thật, cộng thêm bước hydration ở client.

</details>

**4. Giải thích `hydration`: các bước từ lúc server trả HTML tới lúc app trở nên interactive.**

<details className="qa">
<summary>Xem đáp án</summary>

**Hydration** là bước React "gắn sự sống" vào HTML tĩnh mà server đã render. Trình tự:

1. Server render HTML tĩnh và gửi về browser.
2. Browser hiển thị HTML ngay — người dùng thấy nội dung, **FCP nhanh**.
3. JavaScript bundle được tải về trong background.
4. React hydrate — dựng lại cây component trên client và **gắn event listener** vào đúng các node HTML đã có sẵn.
5. App trở nên interactive — đây là mốc **TTI**.

Điểm dễ bị hỏi thêm: giữa bước 2 và bước 5 có một khoảng trang nhìn thì đầy đủ nhưng bấm chưa ăn. Server Components (React 19) giảm chi phí này vì chỉ Client Component mới cần hydrate, phần còn lại không gửi JS về client.

</details>

**5. `Hydration mismatch` xảy ra khi nào? Kể vài nguyên nhân thực tế và cách phòng tránh.**

<details className="qa">
<summary>Xem đáp án</summary>

**Hydration mismatch** xảy ra khi HTML server render **khác** với cây mà React render ở client trong lần đầu — React phát hiện lệch và cảnh báo, UI có thể nhảy hoặc hỏng. Đây là loại bug khó debug vì chỉ xuất hiện ở lần render đầu.

Nguyên nhân thường gặp:

- Giá trị không tất định: `Date.now()`, `Math.random()` khác nhau giữa hai phía.
- Check `typeof window === "undefined"` rồi render nhánh khác nhau.
- Browser extension chèn thêm DOM vào trang.
- Formatter theo locale/timezone — server chạy UTC, client chạy giờ local.

Cách phòng tránh: giữ render lần đầu **tất định**, đẩy phần phụ thuộc browser xuống `useEffect` (render sau khi mount), truyền timestamp/locale xuống như props thay vì tự tính hai lần, và chỉ dùng `suppressHydrationWarning` cho những node thật sự không tránh được.

</details>

**6. `CSR`, `SSR`, `SSG`, `ISR` khác nhau thế nào? Cho ví dụ loại trang phù hợp với từng chiến lược.**

<details className="qa">
<summary>Xem đáp án</summary>

| Chiến lược | HTML sinh ra lúc nào | Phù hợp với |
|---|---|---|
| CSR | Ở browser, sau khi tải JS | Dashboard sau đăng nhập, internal tool |
| SSR | Ở server, mỗi request | Trang cá nhân hoá, dữ liệu đổi liên tục |
| SSG | Lúc build | Landing page, docs, blog ít đổi |
| ISR | Lúc build, rồi tái sinh nền theo chu kỳ | Trang sản phẩm, tin tức, catalog lớn |

Cách nhớ: trục chính là **thời điểm render** và **độ tươi của dữ liệu**. CSR rẻ hạ tầng nhất nhưng kém SEO; SSG nhanh nhất và rẻ nhất khi phục vụ nhưng dữ liệu đóng băng tại thời điểm build; SSR luôn tươi nhưng mỗi request đều tốn server; ISR là điểm giữa của SSG và SSR. Trong Next.js App Router, các chiến lược này chọn theo từng route chứ không phải cho cả app.

</details>

**7. `ISR` hoạt động ra sao và nó gỡ được hạn chế nào của `SSG`?**

<details className="qa">
<summary>Xem đáp án</summary>

Hạn chế của **SSG** thuần: HTML chỉ sinh ra lúc build. Dữ liệu đổi thì phải build lại toàn site, và với site vài chục nghìn trang thì thời gian build trở nên không chấp nhận được.

**ISR** (Incremental Static Regeneration) gỡ đúng hai điểm đó: trang vẫn được phục vụ dưới dạng tĩnh, nhưng sau một khoảng thời gian cấu hình sẵn, request tiếp theo sẽ kích hoạt việc **render lại ở nền**. Người dùng đang truy cập vẫn nhận bản cũ ngay lập tức, bản mới thay thế cho các request sau. Ngoài ra trang có thể được sinh lần đầu theo nhu cầu thay vì phải dựng hết lúc build.

Kết quả: giữ được tốc độ và chi phí của tĩnh, nhưng dữ liệu vẫn tự làm mới mà không cần deploy lại — đúng nhu cầu của e-commerce hay trang tin.

</details>

**8. Server Components giảm chi phí `hydration` bằng cách nào? Nó khác `SSR` truyền thống ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

SSR truyền thống render HTML ở server, nhưng **toàn bộ component vẫn được gửi kèm JS xuống client** để hydrate. Nghĩa là bạn trả tiền hai lần: một lần render ở server, một lần dựng lại cây ở client.

**Server Components** thay đổi điều đó: component chạy ở server và **không gửi JS của nó về client**. Chỉ những component được đánh dấu là Client Component mới vào bundle và mới cần hydrate. Hệ quả:

- Bundle nhỏ hơn, hydration ít việc hơn → TTI tốt hơn.
- Component server truy cập trực tiếp dữ liệu (DB, secret) mà không lộ ra client.

Ranh giới server/client vì thế trở thành khái niệm phải nắm — và cũng là phần khiến learning curve của App Router cao hơn hẳn Pages Router.

</details>

**9. Server Actions thay thế API route trong tình huống nào, và khi nào bạn vẫn cần API route riêng?**

<details className="qa">
<summary>Xem đáp án</summary>

**Server Actions** hợp nhất form/mutation với server: bạn viết một hàm chạy ở server và gọi thẳng từ component, không phải dựng endpoint rồi tự `fetch` sang. Nó thay được API route trong các tình huống nội bộ app:

- Submit form, tạo/sửa/xoá bản ghi.
- Mutation gắn liền với UI và cần revalidate lại trang ngay sau đó.

Vẫn cần **API route riêng** khi endpoint phải phục vụ bên ngoài vòng đời render của Next.js:

- Client khác gọi vào: mobile app, third-party, server khác.
- Webhook từ dịch vụ ngoài (payment, CI...).
- Cần kiểm soát HTTP ở mức thấp: method, header, status code, streaming, CORS.
- Public API có versioning, hoặc cần tài liệu hoá cho bên thứ ba.

Quy tắc ngắn: mutation nội bộ thì dùng Server Action; hợp đồng HTTP với bên ngoài thì dùng API route.

</details>

**10. Ngoài việc render sẵn HTML, Next.js còn hỗ trợ SEO bằng những cơ chế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

HTML render sẵn chỉ là nền móng. Next.js còn cung cấp:

- **Metadata API** — khai báo `title`, `description`, Open Graph, Twitter card ngay trong `layout.tsx` / `page.tsx`; với trang động thì sinh metadata theo dữ liệu của từng route.
- **Sitemap và robots** sinh bằng file quy ước trong `app/`, không cần script build riêng.
- **Canonical URL** và alternates ngôn ngữ khai báo cùng chỗ với metadata.
- **Tối ưu Core Web Vitals** — thành phần Image lo kích thước/format/lazy load, tối ưu font tránh layout shift, code splitting tự động theo route. Các chỉ số này ảnh hưởng trực tiếp tới xếp hạng.
- **Cấu trúc route rõ ràng** — URL sạch, phân tầng theo thư mục, dễ nhúng dữ liệu có cấu trúc (JSON-LD) cho từng trang.

Nói cách khác: SSR/SSG giúp crawler **đọc được**, phần còn lại giúp nó **hiểu và xếp hạng tốt**.

</details>

**11. Khi nào bạn khuyên KHÔNG dùng Next.js mà chọn `Vite` + React + React Router?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi những thứ Next.js đắt giá nhất — SEO, SSR, Server Components — lại không phải nhu cầu của project:

- **Internal tool, dashboard** nằm sau đăng nhập, không có trang public nào cần crawler.
- App **đăng nhập ngay từ đầu**, không có landing page.
- Đã có **backend riêng** (Java, Go, .NET) và frontend chỉ là SPA gọi API.
- Cần **kiểm soát bundle và build cực kỳ chi tiết**.
- App offline-first / PWA-heavy, prototype nhanh với ít route.

Trong các trường hợp đó, Vite + React + React Router đơn giản hơn, deploy chỉ cần CDN tĩnh, không phải học model server/client boundary và cache nhiều tầng. Lập luận cần đưa ra khi phỏng vấn: chọn framework theo **ràng buộc của sản phẩm**, không theo độ phổ biến.

</details>

**12. Kể các tầng cache của Next.js (`Data Cache`, `Router Cache`, `Full Route Cache`) và tình huống chúng gây bug *dữ liệu cũ*.**

<details className="qa">
<summary>Xem đáp án</summary>

App Router có nhiều tầng cache chồng lên nhau:

- **Data Cache** — cache kết quả fetch ở phía server, dùng lại giữa các request và giữa các lần deploy.
- **Full Route Cache** — cache luôn HTML/payload đã render của một route tĩnh trên server.
- **Router Cache** — cache ở phía client, giữ payload của các route đã ghé để điều hướng qua lại tức thì.

Bug dữ liệu cũ hay gặp:

- Vừa mutation xong nhưng quên revalidate → trang vẫn đọc từ Data Cache.
- Route bị suy ra là tĩnh, dữ liệu đổi mà HTML vẫn là bản build cũ.
- Điều hướng back/forward thấy dữ liệu cũ vì Router Cache phục vụ bản trong bộ nhớ, dù server đã mới.

Cách xử lý: sau mỗi mutation phải revalidate đúng path hoặc tag, và với dữ liệu thật sự động thì khai báo route là dynamic thay vì hy vọng cache tự hết hạn.

</details>

**13. Những đánh đổi của Next.js — learning curve `App Router`, cache nhiều tầng, vendor lock-in — bạn giảm thiểu ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba đánh đổi và cách giảm thiểu:

- **Learning curve App Router** — boundary server/client, special file (`loading.tsx`, `error.tsx`, `not-found.tsx`), convention thư mục. Giảm thiểu bằng cách đầu tư 2-3 tuần học model cho tử tế ngay từ đầu, thống nhất quy ước trong team, và đẩy ranh giới Client Component xuống càng thấp trong cây càng tốt.
- **Cache nhiều tầng** — viết rõ trong code chiến lược cache của từng route, revalidate theo tag thay vì đoán, và kiểm tra hành vi cache trên bản production build chứ không chỉ ở dev.
- **Vendor lock-in** — một số feature gắn với Vercel (Edge Functions, cache provider cho ISR). Giảm thiểu bằng cách cô lập chúng sau một lớp abstraction mỏng và kiểm thử self-host định kỳ.

Đổi lại là ecosystem lớn nhất, tài liệu tốt và dễ tuyển người — lý do phần lớn project production vẫn chọn Next.js vì **ít rủi ro**.

</details>

**14. Self-host Next.js ngoài Vercel (Node server, Docker, edge runtime) cần lưu ý những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Self-host hoàn toàn khả thi, nhưng phải tự lo những thứ Vercel làm sẵn:

- **Runtime**: chạy Next.js bằng Node server. Với Docker thì build image gọn (multi-stage, output standalone) và đảm bảo đúng phiên bản Node.
- **Biến môi trường**: phân biệt biến chỉ có ở server với biến được nhúng vào bundle client; biến nhúng được cố định **lúc build**, nên đổi giá trị phải build lại.
- **Cache và ISR**: nhiều instance thì cache trên đĩa của từng instance sẽ lệch nhau — cần cache dùng chung hoặc chấp nhận dữ liệu không đồng nhất.
- **Tối ưu ảnh**: thành phần Image cần nơi xử lý ảnh; tự host thì phải cấp CPU/bộ nhớ hoặc trỏ sang CDN ngoài.
- **Edge runtime** không có đủ API Node — route viết cho edge cần kiểm tra lại khi chạy trên hạ tầng của mình.

Ngoài ra còn log, health check, graceful shutdown và CDN đứng trước để phục vụ asset tĩnh.

</details>

---

## 2. JavaScript và React Frameworks

Bài học: [2. JavaScript và React Frameworks](../../nextjs/01-introduction/2_javascript-react-frameworks.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt *thư viện* và *framework*. React thuộc loại nào, và vì sao điều đó dẫn tới sự ra đời của Next.js hay Remix?**

<details className="qa">
<summary>Xem đáp án</summary>

**Thư viện** là code bạn gọi — bạn giữ quyền điều khiển luồng chương trình. **Framework** là code gọi bạn — nó định sẵn cấu trúc, convention và vòng đời, bạn điền phần của mình vào chỗ trống.

React là **thư viện UI**: nó chỉ lo render component theo state. Nó cố tình không quyết định giúp bạn routing, data fetching, rendering strategy hay build/deploy.

Chính khoảng trống đó dẫn tới framework như Next.js, Remix, Astro: chúng bọc quanh React và đưa ra câu trả lời có sẵn cho những phần React bỏ ngỏ — thư mục nào thành URL, dữ liệu lấy ở server hay client, HTML sinh lúc build hay lúc request. Đổi lại sự tiện lợi, bạn phải theo convention của framework, và chi phí chuyển đổi về sau không hề nhỏ.

</details>

**2. Những kiến thức JavaScript nào là bắt buộc trước khi học Next.js? Vì sao Web Standards API (`Request`, `Response`, `FormData`) ngày càng quan trọng?**

<details className="qa">
<summary>Xem đáp án</summary>

Cần chắc JS hiện đại trước khi động vào Next.js:

- ES6+: arrow function, destructuring, spread/rest, template literal, modules.
- `Promise` và `async/await`.
- Array methods: `map`, `filter`, `reduce`, `find`.
- Object: spread, optional chaining `?.`, nullish `??`.
- Module: `import`/`export`, dynamic `import()`.

Web Standards API ngày càng quan trọng vì Next.js hiện đại **xây trên chuẩn web thay vì API riêng của framework**. Route handler nhận vào `Request` và trả về `Response`; form gửi lên dưới dạng `FormData`; header thao tác qua `Headers`. Lợi ích là kiến thức mang đi được: cùng một API đó chạy ở trình duyệt, ở Node hiện đại và ở edge runtime của Cloudflare hay Deno. Học chuẩn web một lần, dùng được ở mọi framework — thay vì học lại abstraction của từng bên.

</details>

**3. Vì sao `Promise` và `async/await` là nền tảng cho việc lấy dữ liệu trong Server Components?**

<details className="qa">
<summary>Xem đáp án</summary>

Server Component là **hàm async chạy ở server**: nó có thể `await` thẳng trong thân component để lấy dữ liệu, không cần `useEffect` rồi setState như mô hình client cũ.

```tsx
async function UsersPage() {
  const users = await db.user.findMany();
  return <UserList users={users} />;
}
```

Muốn đọc được đoạn này phải nắm `Promise`: `await` chờ một Promise resolve, lỗi bắt bằng `try/catch`, nhiều request độc lập thì chạy song song bằng `Promise.all` thay vì `await` tuần tự gây waterfall. Ngoài ra `fetch()` trả về Promise, và React 19 còn có hook `use` để đọc Promise trực tiếp. Không hiểu Promise thì không lý giải được vì sao dữ liệu đã có sẵn ngay trong HTML gửi về, và cũng không tối ưu được thứ tự lấy dữ liệu.

</details>

**4. Kể các hook React cơ bản, và cho biết hook nào KHÔNG dùng được trong Server Component. Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Các hook cơ bản: `useState`, `useEffect`, `useContext`, `useRef`, `useMemo`, `useCallback`, cộng thêm custom hook do bạn tự viết.

Trong **Server Component**, gần như toàn bộ nhóm trên đều **không dùng được**: `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo` và cả event handler.

Lý do: Server Component chỉ chạy **một lần ở server** rồi sinh ra kết quả gửi về client. Nó không có vòng đời trên trình duyệt, không re-render theo state, không có DOM để gắn effect hay ref. Những hook đó vốn sinh ra cho mô hình state + re-render ở client — đặt vào server thì vô nghĩa.

Cần tương tác thì tách phần đó ra **Client Component** (đánh dấu `"use client"`) và giữ ranh giới càng thấp trong cây càng tốt.

</details>

**5. React 19 mang tới những gì cho framework — Server Components, `use`, Actions, `useActionState`, `useOptimistic`?**

<details className="qa">
<summary>Xem đáp án</summary>

React 19 là nền cho App Router hiện đại:

- **Server Components** — component chạy ở server, **không vào bundle** client, truy cập dữ liệu trực tiếp.
- **`use`** — hook đọc Promise hoặc Context, cho phép "unwrap" dữ liệu bất đồng bộ ngay trong render.
- **Actions** — hàm server gắn thẳng vào form, xử lý submit mà không cần dựng API endpoint.
- **`useActionState`** — giữ state trả về từ action (kết quả, lỗi validate).
- **`useFormStatus`** — biết form đang submit hay không, để disable nút hoặc hiện spinner.
- **`useOptimistic`** — cập nhật UI lạc quan trước khi server trả lời, rollback nếu thất bại.

Gộp lại, chúng dịch chuyển công việc từ client sang server: bundle nhỏ hơn, ít hydration hơn, và mutation viết gọn hơn hẳn so với pattern `useEffect` + `fetch` + state cũ.

</details>

**6. So sánh mô hình lấy dữ liệu của Next.js (Server Components + `fetch()`) với Remix (`loader` / `action`).**

<details className="qa">
<summary>Xem đáp án</summary>

| | Next.js | Remix (React Router v7) |
|--|---------|------------------------|
| Đọc dữ liệu | Server Components, `await fetch()`/query ngay trong component | Hàm `loader` export riêng theo route |
| Ghi dữ liệu | Server Actions | Hàm `action` |
| Nơi khai báo | Rải theo cây component | Tập trung ở file route |
| Form | `form action` của React 19 | Component `Form` của Remix |
| Streaming | Suspense + RSC | `defer()` |

Next.js đặt việc lấy dữ liệu **ngay chỗ cần dùng** — component nào cần thì tự `await`, tránh phải kéo dữ liệu qua nhiều tầng props. Remix tách bạch rõ: một route có đúng một `loader` để đọc và một `action` để ghi, dữ liệu lấy ra bằng `useLoaderData`.

Đổi lại: Next.js linh hoạt hơn nhưng dễ tạo waterfall nếu bất cẩn; Remix rõ ràng và dễ suy luận hơn nhưng dữ liệu phải chảy từ route xuống.

</details>

**7. `Progressive enhancement` là gì? Vì sao Remix mạnh ở điểm này, và Next.js đáp ứng tới đâu với `form action` của React 19?**

<details className="qa">
<summary>Xem đáp án</summary>

**Progressive enhancement** là xây trang sao cho chức năng cốt lõi vẫn chạy khi JavaScript chưa tải xong hoặc bị tắt, rồi JS chỉ **nâng cấp** trải nghiệm lên (validate tức thì, optimistic UI, không reload trang).

Remix mạnh ở đây vì nó bám sát nền tảng web: một route có `action`, và component `Form` render ra thẻ form HTML thật. Không có JS thì trình duyệt vẫn submit form theo cách truyền thống và `action` vẫn chạy — luồng không gãy.

Next.js đáp ứng được nhờ `form action` của React 19: form trỏ thẳng vào một Server Action, nên submit cơ bản vẫn hoạt động mà không cần JS. Nhưng các tiện ích như `useOptimistic`, `useFormStatus` hay phần UI trong Client Component thì cần JS. Nói cách khác Next.js hỗ trợ được, còn Remix coi đó là triết lý mặc định.

</details>

**8. Astro khác Next.js ở triết lý nào? Giải thích `Islands architecture` và chỉ thị kiểu `client:visible`.**

<details className="qa">
<summary>Xem đáp án</summary>

Astro **không phải React framework** mà là framework **content-focused, đa framework**. Triết lý ngược với Next.js: mặc định gửi **HTML tĩnh, JS là opt-in**; trong khi Next.js mặc định là app React có hydrate.

**Islands architecture**: trang chủ yếu là HTML tĩnh, chỉ một vài "hòn đảo" nhỏ là component tương tác thật sự (ô tìm kiếm, carousel, nút like). Mỗi island hydrate độc lập, phần còn lại của trang không tốn một byte JS nào.

Chỉ thị `client:` quyết định **khi nào** island được hydrate — `client:visible` nghĩa là chỉ tải và hydrate khi component lọt vào viewport:

```astro
<SearchBox client:visible />
```

Kết quả: bundle rất nhỏ, Lighthouse gần như tuyệt đối — rất hợp blog, docs, marketing; nhưng hạn chế khi app cần nhiều state và điều hướng phức tạp.

</details>

**9. Khi nào một sản phẩm nên dùng cả Astro lẫn Next.js? Bạn đặt ranh giới ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng cả hai khi sản phẩm có **hai loại trang với nhu cầu trái ngược nhau**: phần nội dung công khai cần SEO tối đa và bundle nhỏ, phần ứng dụng cần state, điều hướng và tương tác dày đặc.

Ranh giới tự nhiên là **trước và sau đăng nhập**:

- **Astro** cho marketing site, blog, docs, landing page — nội dung chủ yếu tĩnh, viết bằng Markdown/MDX, vài island tương tác.
- **Next.js** cho dashboard, SaaS, e-commerce — nhiều state, Server Components, Server Actions.

Cái giá phải trả là hai codebase, hai pipeline deploy và phải chia sẻ design system, phân tích, session giữa hai bên. Chỉ nên tách khi phần nội dung đủ lớn để bù lại chi phí đó; sản phẩm nhỏ thì một Next.js duy nhất gọn hơn nhiều.

</details>

**10. TanStack Start hướng tới điều gì? *Type-safe end-to-end* nghĩa là gì với route params và search params?**

<details className="qa">
<summary>Xem đáp án</summary>

TanStack Start là framework mới (2024+) dựng trên TanStack Router, đặt cược vào **type safety xuyên suốt** thay vì convention.

*Type-safe end-to-end* nghĩa là kiểu dữ liệu được suy ra và kiểm tra từ URL cho tới dữ liệu render, không phải ép kiểu thủ công:

```tsx
export const Route = createFileRoute("/users/$userId")({
  loader: async ({ params }) => fetchUser(params.userId),
  component: UserPage,
});

const { userId } = Route.useParams();   // suy ra là string
const user = Route.useLoaderData();     // suy ra là User
```

Với **route params**, khai báo route sinh ra kiểu cho `useParams` — gõ sai tên param là lỗi biên dịch chứ không phải `undefined` lúc runtime. Với **search params**, chúng được khai báo qua schema (thường là Zod), nên vừa được validate vừa được gõ kiểu, và cả link điều hướng cũng bị kiểm tra.

Vẫn còn early stage — đáng theo dõi hơn là đưa vào production ngay.

</details>

**11. Nếu ràng buộc hosting là Cloudflare Workers hoặc AWS Lambda, lựa chọn framework của bạn thay đổi thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Ràng buộc hosting đẩy tiêu chí lên đầu, vì không phải framework nào cũng chạy thoải mái ngoài Vercel.

- **Cloudflare Workers** dùng runtime kiểu edge, không có đủ API Node. Remix/React Router v7 và Astro sinh ra đã bám web standards nên hợp tự nhiên. Next.js chạy được nhưng phải chú ý route nào ở edge runtime, và một số feature gắn với hạ tầng Vercel (cache provider cho ISR, Edge Functions) sẽ phải thay thế.
- **AWS Lambda** thì Remix/Astro deploy thẳng dễ hơn; Next.js self-host được nhưng cần cân nhắc cold start, tối ưu ảnh và cache dùng chung giữa nhiều instance.

Nguyên tắc: nếu bắt buộc rời Vercel, hãy ưu tiên framework **bám web standards và deploy được ở bất kỳ Node/Edge nào**, đồng thời kiểm thử self-host ngay từ đầu dự án chứ không để đến lúc sắp lên production.

</details>

**12. Cho một sản phẩm gồm trang marketing, blog và dashboard nội bộ — bạn chọn framework nào cho từng phần và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Chia theo đặc tính từng phần:

- **Trang marketing** — nội dung tĩnh, cần SEO và Lighthouse cao, thay đổi chủ yếu là nội dung: **Astro**, vài island cho form liên hệ hoặc search.
- **Blog** — Markdown/MDX là first-class ở Astro, bundle JS gần như bằng không: cũng **Astro**, chung codebase với marketing.
- **Dashboard nội bộ** — sau đăng nhập, không cần SEO, nhiều state và tương tác: **Vite + React + React Router** là đủ và đơn giản nhất.

Nếu team nhỏ và không muốn nuôi hai codebase, gộp tất cả vào **một Next.js** cũng là lựa chọn hợp lý: route công khai để tĩnh/ISR, route dashboard để dynamic. Chi phí là bundle to hơn và phải học App Router; đổi lại chỉ có một pipeline, một design system, một nơi deploy.

</details>

**13. Việc Remix hợp nhất vào React Router v7 ảnh hưởng thế nào tới quyết định chọn framework hôm nay?**

<details className="qa">
<summary>Xem đáp án</summary>

Remix hợp nhất vào **React Router v7** (2024) nên ranh giới giữa "dùng React Router" và "dùng Remix" gần như biến mất — cùng một dự án, có thể bắt đầu ở chế độ SPA rồi bật dần các tính năng framework như `loader`/`action` và SSR.

Ảnh hưởng tới quyết định hôm nay:

- **Tích cực**: hạ rủi ro chọn nhầm — React Router vốn đã có mặt trong vô số codebase, nâng cấp dần dễ hơn là viết lại. Nó vẫn được maintain và vẫn là lựa chọn tốt cho app form-heavy, progressive enhancement, hoặc hosting ngoài Vercel.
- **Cần cân nhắc**: tên gọi và tài liệu có giai đoạn chuyển đổi gây nhầm lẫn, và về Server Components thì Next.js đi trước khá xa cùng với thị phần lớn hơn.

Kết luận thực dụng: có sẵn React Router thì lộ trình nâng cấp rất mượt; còn dự án mới cần RSC và ecosystem rộng thì Next.js vẫn là mặc định ít rủi ro.

</details>

**14. Những yếu tố phi kỹ thuật nào (tuyển dụng, ecosystem, kinh nghiệm team) nên ảnh hưởng tới quyết định chọn framework? Chi phí chuyển đổi về sau ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Framework là quyết định sống nhiều năm, nên yếu tố phi kỹ thuật cân nặng không kém phần kỹ thuật:

- **Kinh nghiệm team** — dùng thứ team đã biết thường thắng thứ "tốt hơn trên giấy". Chi phí học lại là chi phí thật.
- **Tuyển dụng** — framework phổ biến thì tuyển nhanh, người mới vào productive sớm.
- **Ecosystem và tài liệu** — thư viện auth, i18n, UI, ví dụ sẵn có quyết định bạn tự viết bao nhiêu.
- **Độ chín và cam kết duy trì** — ai đứng sau, breaking change có dày không.

**Chi phí chuyển đổi về sau rất cao**: routing, data fetching, ranh giới server/client và cách deploy đều thấm vào toàn bộ codebase, nên đổi framework gần như là viết lại chứ không phải refactor. Vì thế đa số dự án mới 2026 chọn Next.js — không hẳn vì nó tốt nhất ở mọi mặt, mà vì đó là lựa chọn **ít rủi ro** nhất.

</details>
