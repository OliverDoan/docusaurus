---
sidebar_position: 3
title: "3. Routing"
---

# 3. Routing

## 1. Routing Basics

Bài học: [1. Routing Basics](../../nextjs/03-routing/1_routing-basics.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `file-based routing` trong `App Router` hoạt động thế nào? File nào mới thực sự tạo ra một URL truy cập được?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong App Router, **cấu trúc thư mục `app/` chính là cấu trúc URL**. Mỗi thư mục con là một **segment** của đường dẫn, không cần khai báo route ở bất kỳ file cấu hình nào.

Nhưng thư mục thôi chưa đủ: chỉ khi trong thư mục có **`page.tsx`** thì route đó mới truy cập được. Thư mục chỉ chứa `layout.tsx` hay component phụ sẽ tạo ra segment nhưng URL đó trả về 404.

```
app/page.tsx              → /
app/about/page.tsx        → /about
app/blog/page.tsx         → /blog
app/blog/[slug]/page.tsx  → /blog/:slug
```

Thư mục đặt trong ngoặc vuông là **dynamic segment**, khớp với mọi giá trị và truyền vào qua `params`.

Ngoại lệ duy nhất: **`route.ts`** cũng tạo ra một endpoint truy cập được, nhưng nó trả về `Response` chứ không render UI.

</details>

**2. So với khai báo route thủ công kiểu React Router, file-based routing được gì và mất gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Được:**

- Không có bước khai báo thủ công — tạo file là có route, không thể quên đăng ký hay để URL lệch với vị trí file.
- Nhìn cây thư mục là biết sơ đồ URL của cả app, rất lợi khi người mới vào dự án.
- Các quy ước `layout`, `loading`, `error`, `not-found` cắt bỏ phần lớn boilerplate — không phải tự bọc `Suspense` hay Error Boundary.
- Code splitting theo route diễn ra tự động.

**Mất:**

- Route không còn là dữ liệu trong code, nên khó sinh route động theo cấu hình hoặc theo điều kiện lúc chạy.
- Phải thuộc convention: tên file đặc biệt, ngoặc vuông, quy tắc nhóm thư mục — sai tên là route im lặng không xuất hiện.
- Đổi URL đồng nghĩa với di chuyển thư mục, kéo theo sửa import.
- Ít tự do hơn khi cần logic khớp route phức tạp.

</details>

**3. Liệt kê các file đặc biệt trong thư mục `app/` và vai trò của từng file.**

<details className="qa">
<summary>Xem đáp án</summary>

| File | Vai trò |
|------|---------|
| `page.tsx` | UI của route; bắt buộc để route truy cập được |
| `layout.tsx` | UI dùng chung cho cả nhánh route bên dưới |
| `template.tsx` | Như layout nhưng re-mount mỗi lần điều hướng |
| `loading.tsx` | Loading UI, tự bọc trong `Suspense` |
| `error.tsx` | Error Boundary cho nhánh route đó |
| `not-found.tsx` | UI khi gọi `notFound()` hoặc URL không tồn tại |
| `route.ts` | Handler cho API route |
| `global-error.tsx` | Error Boundary cấp root, bắt lỗi của root layout |

Điểm cần nhớ: các file này **áp dụng theo nhánh** — đặt ở thư mục nào thì có hiệu lực cho thư mục đó và mọi route con. Nhờ vậy mỗi khu vực của app có thể có loading và error riêng. Thư mục không chứa file đặc biệt nào thì đơn thuần là một segment trong URL.

</details>

**4. `layout.tsx` và `template.tsx` khác nhau ở điểm cốt lõi nào? Cho một tình huống bắt buộc phải dùng `template.tsx`.**

<details className="qa">
<summary>Xem đáp án</summary>

Điểm cốt lõi: **`layout.tsx` giữ nguyên instance khi điều hướng, `template.tsx` tạo mới lại mỗi lần**.

| | `layout.tsx` | `template.tsx` |
|---|---|---|
| Khi navigate | Không re-render, giữ state | Re-mount, state reset |
| Effect | Chạy một lần | Chạy lại mỗi lần điều hướng |
| Dùng cho | Navbar, sidebar, khung chung | Animation, reset state, effect lặp lại |

Tình huống bắt buộc dùng `template.tsx`: **animation chuyển trang**. Hiệu ứng vào trang chỉ chạy khi component được mount; nếu dùng layout thì nó tồn tại xuyên suốt và animation chỉ chạy đúng một lần rồi thôi.

Tương tự với những việc phải lặp lại mỗi lần điều hướng: ghi nhận lượt xem cho analytics, cuộn về đầu trang, hoặc reset một ô tìm kiếm dùng chung để không mang giá trị cũ sang trang mới.

`template.tsx` hiếm khi cần — mặc định nên chọn `layout.tsx`.

</details>

**5. Vì sao layout không re-render khi điều hướng giữa các route con? Điều đó mang lại lợi ích gì cho trải nghiệm người dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì App Router coi layout là **phần chung không đổi** của nhánh route: khi bạn đi từ `/dashboard/users` sang `/dashboard/settings`, chỉ segment cuối thay đổi, còn root layout và dashboard layout vẫn là cùng một instance React nên không bị unmount.

Lợi ích cho người dùng:

- **Giữ state** của UI dùng chung — sidebar đang mở vẫn mở, tab đã chọn vẫn giữ, dữ liệu đã tải không phải tải lại.
- **Giữ vị trí cuộn và focus** — danh sách điều hướng dài không nhảy về đầu sau mỗi lần bấm.
- **Điều hướng nhanh hơn** — chỉ phần nội dung được render lại, không dựng lại cả cây.
- **Không nhấp nháy** — khung trang đứng yên, cảm giác như ứng dụng desktop.

Hệ quả cần lưu ý ở chiều ngược lại: effect trong layout **không chạy lại** sau mỗi lần điều hướng, nên việc nào cần lặp lại thì phải đặt ở `template.tsx` hoặc trong chính page.

</details>

**6. `root layout` có những ràng buộc bắt buộc nào và vì sao Next.js đặt ra các ràng buộc đó?**

<details className="qa">
<summary>Xem đáp án</summary>

Root layout (`app/layout.tsx`) có ba ràng buộc:

1. Phải tự render thẻ `html` và `body`.
2. Phải nằm ngay tại `app/layout.tsx`.
3. Chỉ được có **một** root layout.

Lý do: root layout là thứ **bao trọn mọi response HTML** của ứng dụng. Next.js không tự sinh khung tài liệu, nên nếu bạn không render `html` và `body` thì không có trang HTML hợp lệ để gửi đi. Đặt nó ở vị trí cố định giúp framework biết chắc điểm bắt đầu của cây render, còn quy tắc chỉ một bản thì tránh tình huống mơ hồ hai khung tài liệu chồng nhau.

Đây cũng là nơi tự nhiên để khai báo `lang`, nạp CSS toàn cục, đặt metadata gốc và các provider dùng chung cho cả app. Vì nó không bao giờ re-render, tránh đặt dữ liệu cá nhân hoá ở đây — sẽ kéo cả app sang dynamic.

</details>

**7. Từ Next.js 15, `params` và `searchParams` trở thành `Promise` — lý do kỹ thuật là gì và code cũ phải sửa thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Lý do kỹ thuật: đọc `params` hoặc `searchParams` gắn liền với một request cụ thể. Biến chúng thành `Promise` cho phép Next.js **bắt đầu render phần không phụ thuộc vào chúng trước**, thay vì chặn toàn bộ trang cho tới khi có giá trị — ăn khớp với mô hình streaming và render theo từng phần.

Code cũ phải chuyển từ truy cập đồng bộ sang `await`, kéo theo component phải là `async`:

```tsx
// Next.js 14
export default function Page({ params }: { params: { slug: string } }) {
  return <p>{params.slug}</p>;
}

// Next.js 15+
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <p>{slug}</p>;
}
```

Kiểu TypeScript cũng phải đổi theo. Đây là breaking change khi nâng cấp, nhưng có codemod chính thức để chuyển hàng loạt.

</details>

**8. Trong Client Component không `await` được `params`, vậy bạn lấy tham số route bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Client Component không phải là hàm `async` nên không `await` được. Thay vào đó dùng các hook điều hướng của Next.js:

```tsx
"use client";
import { useParams, useSearchParams } from "next/navigation";

export default function Filter() {
  const { slug } = useParams();            // tham số route
  const searchParams = useSearchParams();  // query string
  const page = searchParams.get("page") ?? "1";
  return <p>{slug} — trang {page}</p>;
}
```

`useParams()` trả về các dynamic segment của route hiện tại, `useSearchParams()` cho phép đọc query string.

Cách thứ hai, thường tốt hơn: để **Server Component cha `await` params rồi truyền xuống dưới dạng props**. Như vậy Client Component chỉ nhận dữ liệu thuần, dễ test hơn và không phụ thuộc vào ngữ cảnh router — đúng tinh thần đẩy ranh giới `"use client"` xuống càng thấp càng tốt.

</details>

**9. `loading.tsx` thực chất tương đương với cấu trúc React nào? Muốn nhiều vùng loading riêng biệt trong cùng một trang thì làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`loading.tsx` thực chất là cách khai báo bằng file cho một **`Suspense` boundary** bọc quanh nội dung route:

```tsx
<Suspense fallback={<Loading />}>
  <Page />
</Suspense>
```

Next.js tự tạo cấu trúc này, nên bạn chỉ cần tạo file là có ngay skeleton hiển thị trong lúc Server Component còn đang lấy dữ liệu, và phần shell được stream về trước.

Muốn **nhiều vùng loading riêng biệt** trong cùng một trang thì tự viết `Suspense` quanh từng mảnh, mỗi mảnh một fallback riêng:

```tsx
<Suspense fallback={<StatsSkeleton />}>
  <Stats />
</Suspense>
<Suspense fallback={<ChartSkeleton />}>
  <Chart />
</Suspense>
```

Mỗi vùng hiện ra độc lập ngay khi dữ liệu của nó sẵn sàng, thay vì cả trang phải chờ mảnh chậm nhất. `loading.tsx` chỉ cho một fallback duy nhất ở cấp route.

</details>

**10. Vì sao `error.tsx` bắt buộc phải là Client Component? Prop `reset` hoạt động ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`error.tsx` bắt buộc khai báo `"use client"` vì nó là một **Error Boundary của React**, mà Error Boundary chỉ tồn tại ở phía client — nó phải giữ state "đang lỗi hay không" và bắt được cả lỗi xảy ra trong lúc render ở trình duyệt. Ngoài ra nó cần gắn `onClick` cho nút thử lại, tức là cần event handler.

Prop `reset` là hàm do React cung cấp: gọi nó sẽ **xoá trạng thái lỗi và render lại nhánh route đó**, không reload cả trang nên state của layout bên ngoài vẫn nguyên.

```tsx
"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <button onClick={reset}>Thử lại</button>;
}
```

Hữu ích khi lỗi chỉ là tạm thời — mạng chập chờn, API timeout. Nếu nguyên nhân chưa biến mất thì lần render lại vẫn lỗi và boundary hiện lại.

</details>

**11. `error.tsx` không bắt được loại lỗi nào? Bạn xử lý lỗi xảy ra ở root layout bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`error.tsx` bắt lỗi của **page cùng cấp và các route con bên dưới**, nhưng **không bắt được lỗi của `layout.tsx` cùng cấp** — vì theo thứ tự lồng nhau, layout nằm **ngoài** Error Boundary đó, nên lỗi của nó rơi ra ngoài phạm vi.

Cách xử lý: đặt `error.tsx` ở **cấp cha** để bọc được layout bị lỗi.

Riêng lỗi ở **root layout** thì không còn cấp cha nào nữa — phải dùng **`global-error.tsx`**. File này thay thế toàn bộ trang khi bị kích hoạt, nên nó phải tự render thẻ `html` và `body` giống root layout, và cũng phải là Client Component:

```tsx
"use client";
export default function GlobalError({ error, reset }) {
  return <html><body><button onClick={reset}>Thử lại</button></body></html>;
}
```

Trường hợp này hiếm xảy ra, nhưng nếu không có file đó thì lỗi root layout sẽ cho người dùng một màn hình lỗi trần trụi.

</details>

**12. Trình bày thứ tự lồng nhau của `layout`, `template`, `error`, `loading`, `page` — hiểu thứ tự này giúp bạn debug điều gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Thứ tự lồng nhau khi Next.js dựng một route:

```jsx
<Layout>
  <Template>
    <ErrorBoundary fallback={<Error />}>
      <Suspense fallback={<Loading />}>
        <NotFoundBoundary fallback={<NotFound />}>
          <Page />
        </NotFoundBoundary>
      </Suspense>
    </ErrorBoundary>
  </Template>
</Layout>
```

Hiểu thứ tự này giúp debug ba nhóm vấn đề hay gặp:

- `loading.tsx` nằm **trong** Error Boundary nên nó không bắt lỗi — muốn xử lý lỗi phải có `error.tsx`.
- `error.tsx` nằm **trong** layout cùng cấp nên lỗi của layout lọt ra ngoài — phải đặt `error.tsx` ở cấp trên.
- `notFound()` cần `not-found.tsx` trong chính route đó hoặc ở cấp cha, vì nó tìm boundary gần nhất đi lên.

Nói ngắn: thứ tự quyết định **cái gì bọc cái gì**, và một boundary chỉ bắt được những gì nằm bên trong nó.

</details>

**13. `notFound()` hoạt động thế nào? Next.js tìm `not-found.tsx` ở đâu khi hàm này được gọi?**

<details className="qa">
<summary>Xem đáp án</summary>

`notFound()` là hàm import từ `next/navigation`. Gọi nó sẽ **ném ra một lỗi đặc biệt** mà Next.js nhận diện được — vì vậy code phía sau không chạy tiếp, không cần `return`:

```tsx
import { notFound } from "next/navigation";

export default async function BlogPost({ params }) {
  const post = await fetchPost((await params).slug);
  if (!post) notFound();
  return <article>{post.content}</article>;
}
```

Khi lỗi đó được ném, Next.js đi **ngược lên cây route từ vị trí hiện tại** để tìm `not-found.tsx` gần nhất và render nó — trước hết trong chính segment đó, không có thì lên segment cha, cuối cùng là `app/not-found.tsx`. Nếu không có file nào, Next.js dùng trang 404 mặc định.

Nhờ cơ chế theo nhánh này, mỗi khu vực có thể có trang không tìm thấy riêng, ví dụ blog hiển thị "Bài viết không tồn tại" còn khu sản phẩm hiển thị thông điệp khác.

</details>

**14. Một segment có thể vừa có `page.tsx` vừa có `route.ts` không? Điều gì xảy ra nếu cố tình đặt cả hai?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Một segment chỉ được có **một trong hai**: `page.tsx` hoặc `route.ts`, chúng không cùng tồn tại.

Lý do là cả hai cùng tranh nhau xử lý **một URL duy nhất** nhưng theo hai cách loại trừ nhau: `page.tsx` render UI và trả về HTML, còn `route.ts` xử lý HTTP thô và trả về `Response`. Khi có request `GET` tới URL đó, Next.js không có căn cứ nào để chọn — nên xung đột này bị coi là lỗi cấu hình.

Nếu cố tình đặt cả hai, build sẽ báo lỗi chỉ rõ segment bị xung đột.

Cách xử lý đúng khi cần cả trang lẫn API cho cùng một tài nguyên: tách chúng ra hai đường dẫn riêng — ví dụ `app/products/page.tsx` cho giao diện và `app/api/products/route.ts` cho endpoint. Cách này cũng làm URL rõ nghĩa hơn cho người đọc code.

</details>

**15. Khi nhiều layout lồng nhau cùng fetch dữ liệu, chúng chạy tuần tự hay song song? Điều đó ảnh hưởng thế nào tới thời gian tải trang?**

<details className="qa">
<summary>Xem đáp án</summary>

Chúng fetch **song song**. Mỗi layout lồng nhau có phần lấy dữ liệu **độc lập**, không chờ nhau:

```tsx
async function RootLayout({ children }) {
  const user = await fetchUser();
  return <html><body>{children}</body></html>;
}

async function DashboardLayout({ children }) {
  const stats = await fetchStats(); // chạy song song với root
  return <div>{stats.count} | {children}</div>;
}
```

Ảnh hưởng tới thời gian tải: tổng thời gian chờ bằng **lời gọi chậm nhất**, không phải tổng các lời gọi — tránh được waterfall và làm trang hiện ra nhanh hơn hẳn.

Lưu ý điều này chỉ đúng **giữa các layout khác cấp**. Trong cùng một component, nếu bạn `await` tuần tự thì vẫn tạo waterfall — phải gom lại bằng `Promise.all`. Ngoài ra, mảnh dữ liệu chậm nên bọc `Suspense` để nó không giữ chân cả trang.

</details>

---

## 2. Pages Router vs App Router

Bài học: [2. Pages Router vs App Router](../../nextjs/03-routing/2_types-of-routers.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Pages Router` và `App Router` khác nhau thế nào về cấu trúc thư mục và quy ước đặt tên file?**

<details className="qa">
<summary>Xem đáp án</summary>

Pages Router lấy **tên file** làm route, App Router lấy **tên thư mục** làm route còn file chỉ đóng vai trò quy ước.

| | Pages Router | App Router |
|---|---|---|
| Thư mục gốc | `pages/` | `app/` |
| Route `/about` | `pages/about.tsx` | `app/about/page.tsx` |
| Dynamic route | `pages/blog/[slug].tsx` | `app/blog/[slug]/page.tsx` |
| Layout | `_app.tsx` (một cái duy nhất) | `layout.tsx` (lồng nhau theo từng cấp) |
| Document | `_document.tsx` | gộp vào root layout |
| API | `pages/api/users.ts` | `app/api/users/route.ts` |

Điểm mấu chốt: trong `app/`, một thư mục **chỉ trở thành URL khi có `page.tsx`** (hoặc `route.ts`). Nhờ vậy bạn có thể đặt component, test, style ngay cạnh route mà không vô tình tạo ra URL — điều không làm được ở `pages/`. App Router còn có thêm các file quy ước như `loading.tsx`, `error.tsx`, `template.tsx` đặt ngay trong thư mục route.

</details>

**2. Vì sao Next.js giới thiệu `App Router` trong khi `Pages Router` vẫn chạy tốt? Vấn đề gốc mà nó giải quyết là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Pages Router có ba hạn chế gốc rễ:

- **Bundle JS phình to** — mọi page component đều ship xuống client, kể cả phần chỉ hiển thị dữ liệu tĩnh.
- **Data fetching tách rời UI** — `getServerSideProps` nằm ngoài component, dữ liệu phải chảy qua props, càng lồng sâu càng khó truyền.
- **Layout lồng nhau bất tiện và không streaming được** — chỉ có một `_app.tsx`, trang phải chờ toàn bộ dữ liệu xong mới render.

App Router (Next 13+) dựa trên **React Server Components** để giải đúng ba thứ đó: component mặc định chạy ở server nên không ship JS, `fetch` nằm ngay trong `async` component đúng chỗ cần dữ liệu, layout lồng theo cấu trúc thư mục, và Suspense cho phép **streaming** từng mảnh UI. Nói ngắn gọn: App Router không phải "cú pháp mới cho vui" mà là hệ quả của việc React đổi mô hình render.

</details>

**3. Hai router có chạy song song trong cùng một project được không? Những ràng buộc nào cần biết?**

<details className="qa">
<summary>Xem đáp án</summary>

Được — Next.js merge route từ cả `app/` và `pages/`, nên `app/dashboard/page.tsx` cho `/dashboard` còn `pages/profile.tsx` cho `/profile` cùng hoạt động. Đây chính là cơ chế cho phép migrate dần từng route.

Các ràng buộc cần nhớ:

- **Không được trùng URL** giữa hai router — Next.js sẽ báo lỗi.
- `_app.tsx` và `_document.tsx` **chỉ áp dụng cho route trong `pages/`**; root `layout.tsx` chỉ áp dụng cho route trong `app/`.
- **CSS global bị chia đôi**: import trong `_app.tsx` cho phía pages, trong `app/layout.tsx` cho phía app — dễ trùng lặp style trong giai đoạn chuyển.
- **`middleware.ts` áp dụng cho cả hai** router, nên đây là chỗ duy nhất logic dùng chung được.

Cấu trúc lai chấp nhận được trong giai đoạn migration, nhưng mục tiêu cuối vẫn là chỉ còn `app/`.

</details>

**4. Cách fetch dữ liệu ở hai router khác nhau ra sao? Hãy so sánh bằng một ví dụ cụ thể.**

<details className="qa">
<summary>Xem đáp án</summary>

Pages Router dùng **special function** export ra ngoài component, Next.js gọi nó rồi bơm kết quả vào props:

```tsx
// pages/blog/[slug].tsx
export const getServerSideProps = async ({ params }) => {
  const post = await fetchPost(params.slug);
  return { props: { post } };
};

export default function BlogPost({ post }) {
  return <article>{post.content}</article>;
}
```

App Router bỏ hẳn các function đó — component là `async` và fetch ngay bên trong:

```tsx
// app/blog/[slug]/page.tsx
export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = await fetchPost(slug); // chạy ở server
  return <article>{post.content}</article>;
}
```

Khác biệt cốt lõi: ở Pages Router chỉ **page cấp cao nhất** mới fetch được, dữ liệu phải truyền xuống qua props. Ở App Router **bất kỳ Server Component nào** cũng fetch được ngay chỗ cần dùng, và hành vi cache/revalidate được điều khiển qua options của `fetch` thay vì qua tên function.

</details>

**5. Ở `Pages Router`, `_app.tsx` và `_document.tsx` đảm nhiệm việc gì? Trong `App Router` chúng được thay bằng gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`_app.tsx`** là component bọc quanh **mọi page**: nơi import CSS global, đặt provider (theme, store, react-query), giữ state xuyên suốt các lần chuyển trang. Nhược điểm: chỉ có một cái duy nhất cho toàn app.
- **`_document.tsx`** tuỳ biến phần khung HTML do server render ra — thẻ `html`, `body`, `lang`, font link, script chèn sớm. Nó chỉ chạy ở server, không chạy lại khi điều hướng phía client.

Trong App Router, cả hai được gộp vào **`app/layout.tsx`** (root layout). Root layout bắt buộc phải tự render thẻ `html` và `body` — phần việc trước kia của `_document.tsx` — đồng thời là chỗ import `globals.css` và đặt provider, thay cho `_app.tsx`. Ưu điểm: layout có thể **lồng nhau**, mỗi thư mục route tự có `layout.tsx` riêng, thay vì dồn hết vào một file.

</details>

**6. Mặc định component ở mỗi router là Server hay Client? Điều này ảnh hưởng thế nào tới kích thước bundle JS?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Pages Router: mọi component đều là Client Component.** Kể cả khi dữ liệu lấy ở server qua `getServerSideProps`, bản thân component vẫn được ship xuống client để hydrate.
- **App Router: mặc định là Server Component.** Muốn chuyển sang client phải khai báo `"use client"` ở đầu file.

Ảnh hưởng tới bundle:

- Server Component **không ship JS** xuống client — chỉ gửi kết quả render. Thư viện chỉ dùng trong Server Component (ví dụ thư viện format markdown, SDK truy vấn DB) cũng không nằm trong bundle.
- Chỉ phần thực sự cần tương tác (`useState`, `useEffect`, event handler) mới đánh dấu `"use client"` và mới tính vào bundle.

Nguyên tắc thực hành: đẩy `"use client"` xuống **càng gần lá càng tốt** — tách nút bấm ra component riêng thay vì đánh dấu cả trang là client, nếu không lợi thế về bundle mất sạch.

</details>

**7. `useRouter` từ `next/router` và từ `next/navigation` khác nhau ra sao? `router.query` được thay bằng những hook nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai hook trùng tên nhưng thuộc hai router khác nhau và **không thay thế lẫn nhau** — import nhầm sẽ lỗi runtime.

| | `next/router` (Pages) | `next/navigation` (App) |
|---|---|---|
| Object trả về | có `pathname`, `query`, `asPath`, `events`... | chỉ còn các method điều hướng |
| Đọc URL | `router.query`, `router.pathname` | tách thành các hook riêng |
| Dùng ở đâu | component bất kỳ | chỉ trong Client Component |

Ở App Router, `router.query` bị tách làm hai phần:

- **`useParams()`** — lấy dynamic segment, ví dụ `[slug]` trong `/blog/abc`.
- **`useSearchParams()`** — lấy query string (`?page=2`), trả về đối tượng dạng `URLSearchParams` (read-only).
- **`usePathname()`** — lấy đường dẫn hiện tại, thay cho `router.pathname`.

Ngoài ra `useRouter` của `next/navigation` chỉ giữ `push`, `replace`, `back`, `forward`, `refresh` — không còn `router.events`, muốn theo dõi chuyển trang phải dùng `usePathname` kết hợp `useEffect`.

</details>

**8. Chuyển `pages/api/users.ts` sang `app/api/users/route.ts` cần đổi những gì về `Request` và `Response`?**

<details className="qa">
<summary>Xem đáp án</summary>

Thay đổi lớn nhất: bỏ `NextApiRequest`/`NextApiResponse` kiểu Node để dùng **Web Standards** `Request`/`Response`, và thay một handler duy nhất bằng **một hàm export cho mỗi HTTP method**.

```ts
// Cũ — pages/api/users.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const users = await db.user.findMany();
  res.json(users);
}

// Mới — app/api/users/route.ts
export async function GET() {
  const users = await db.user.findMany();
  return Response.json(users);
}
```

Những điểm phải sửa theo:

- Không còn `res.status().json()` — phải **return** một `Response`, dùng `Response.json(data, { status: 201 })`.
- Phân biệt method bằng tên hàm export (`GET`, `POST`, `PUT`, `DELETE`...) thay vì `if (req.method === "POST")`.
- Đọc body bằng `await request.json()` thay vì `req.body` đã được parse sẵn.
- Query string lấy từ `new URL(request.url).searchParams` thay vì `req.query`.

</details>

**9. Vì sao Route Handler dùng Web Standards lại là hướng đi tốt hơn so với `NextApiRequest`/`NextApiResponse`?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `Request`/`Response` là **API chuẩn của nền tảng web**, không phải API riêng của Next.js hay của Node:

- **Chạy được ở nhiều runtime** — Node.js, Edge runtime, Cloudflare Workers, Deno... đều hiểu cùng một interface, nên cùng đoạn code deploy được ở nhiều nơi mà không phải viết lại.
- **Kiến thức chuyển được** — ai đã quen `fetch` phía client là đã quen `Request`/`Response`; không cần học thêm một bộ API riêng chỉ để viết backend Next.js.
- **Dễ test hơn** — chỉ cần tạo một `Request` thuần và kiểm tra `Response` trả về, không phải mock cả cặp `req`/`res` với hàng loạt method như `res.status().json()`.
- **Mô hình trả về rõ ràng hơn** — handler là hàm nhận vào và trả ra, thay vì "ghi vào object `res`" theo kiểu Express, vốn dễ quên gọi hoặc gọi hai lần.

Đổi lại, bạn mất vài tiện ích tự động của Node API (body parse sẵn, `req.query`), phải tự làm bằng API chuẩn.

</details>

**10. Bạn lập kế hoạch migrate một app lớn từ `Pages Router` sang `App Router` như thế nào để giảm thiểu rủi ro?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: **migrate dần từng route, không rewrite toàn bộ**, tận dụng việc hai router chạy song song.

1. **Chuẩn bị** — nâng Next.js lên bản hỗ trợ App Router, đọc migration guide chính thức, rà soát dependency xem cái nào chưa tương thích Server Components.
2. **Tạo `app/` cạnh `pages/`** — dựng `app/layout.tsx` làm root layout, chuyển phần CSS global và provider từ `_app.tsx` sang.
3. **Chọn route dễ và ít rủi ro nhất trước** — trang tĩnh, trang marketing — để team làm quen mô hình trước khi đụng vào luồng nghiệp vụ.
4. **Migrate từng route:** `pages/blog/[slug].tsx` → `app/blog/[slug]/page.tsx`, đổi `getServerSideProps` thành `async` component, đổi import router sang `next/navigation`.
5. **Test kỹ sau mỗi route** và deploy từng phần, thay vì gộp một PR khổng lồ.
6. **Không ép migrate hết** — route phức tạp chưa sẵn sàng cứ để lại ở `pages/`, vì Pages Router vẫn được maintain lâu dài.

</details>

**11. Những khó khăn thường gặp nhất khi migrate là gì và bạn xử lý từng cái ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Các vướng mắc điển hình:

- **Server vs Client Component** — page trong `app/` mặc định là Server, nên mọi code dùng `useState`, `useEffect`, event handler đều lỗi. *Xử lý:* tách phần tương tác ra component riêng và đánh dấu `"use client"` ở mức lá, không bọc cả trang.
- **Đổi pattern data fetching** — không còn `getServerSideProps`/`getStaticProps`. *Xử lý:* gọi `fetch` hoặc gọi thẳng hàm truy vấn ngay trong `async` component, điều khiển cache qua options của `fetch`.
- **API routing đổi** — `useRouter` phải đổi import sang `next/navigation`, `router.query` tách thành `useParams`/`useSearchParams`, `usePathname` thay `router.pathname`.
- **CSS global** — import từ `_app.tsx` phải chuyển sang root layout; trong giai đoạn lai phải giữ cả hai chỗ.
- **Dependency cũ** — thư viện phụ thuộc vào context phía client có thể phải bọc `"use client"` hoặc thay thế.

Ngược lại, `next/image`, `next/link`, `next/script` gần như giữ nguyên API, không phải sửa.

</details>

**12. Trong tình huống nào bạn sẽ khuyên team KHÔNG migrate sang `App Router`?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi chi phí migrate lớn hơn giá trị thu về:

- **App đang chạy ổn, không có vấn đề thực sự** về bundle size, hiệu năng hay khả năng phát triển feature — migrate chỉ vì "mới hơn" là chạy theo hype.
- **Team chưa quen React Server Components** — mô hình server/client là thay đổi tư duy, không phải đổi cú pháp; migrate lúc chưa nắm vững dễ đẻ ra bug khó lần.
- **Có dependency chưa tương thích** với App Router, chưa có phương án thay thế.
- **Nguồn lực hạn chế** — với một app cỡ trung, migrate có thể ngốn vài tháng; nếu quý này phải ship tính năng cho khách thì đó là đánh đổi tồi.

Lập luận nền tảng: **Pages Router không bị bỏ rơi**, vẫn được maintain. App Router là tương lai, nhưng quyết định nên dựa trên giá trị cụ thể mang lại (Server Components, Server Actions, streaming, nested layout), không dựa trên phiên bản mới nhất.

</details>

**13. Trong giai đoạn trộn hai router, `middleware`, CSS global và layout được áp dụng như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`middleware.ts`** — dùng chung, nằm ở gốc project và áp dụng cho **cả hai router**. Đây là thuận lợi: logic auth, redirect, i18n viết một lần vẫn bảo vệ được route ở cả `pages/` lẫn `app/` trong suốt quá trình chuyển.
- **CSS global** — bị chia đôi. File import trong `_app.tsx` chỉ ảnh hưởng route của `pages/`; file import trong `app/layout.tsx` chỉ ảnh hưởng route của `app/`. Thực tế thường phải import cùng một `globals.css` ở cả hai chỗ để giao diện đồng nhất, và chấp nhận bị nạp trùng trong giai đoạn lai.
- **Layout** — `_app.tsx` và `_document.tsx` **không** áp dụng cho route trong `app/`; ngược lại root `layout.tsx` **không** áp dụng cho route trong `pages/`. Hệ quả là header/footer dùng chung phải được duy trì ở hai nơi cho tới khi migrate xong.

Vì vậy nên rút ngắn giai đoạn lai, đừng để kéo dài nhiều quý.

</details>

**14. Nếu cùng một URL tồn tại ở cả `pages/` và `app/` thì điều gì xảy ra?**

<details className="qa">
<summary>Xem đáp án</summary>

Next.js **báo lỗi conflict** chứ không âm thầm chọn một trong hai. Ví dụ tồn tại đồng thời `pages/about.tsx` và `app/about/page.tsx` — cả hai cùng ánh xạ ra `/about` — thì build (hoặc dev server) sẽ dừng lại và chỉ rõ route bị trùng.

Đây là thiết kế có chủ ý và hợp lý: nếu Next.js tự chọn theo một thứ tự ưu tiên ngầm, developer rất dễ sửa nhầm file mà không hiểu vì sao thay đổi không có tác dụng, hoặc tệ hơn là deploy nhầm phiên bản cũ của trang.

Hệ quả khi migrate: quy trình đúng là **tạo file ở `app/` rồi xoá file tương ứng ở `pages/` trong cùng một bước**, không giữ cả hai để "phòng hờ". Nếu muốn giữ bản cũ để rollback, hãy dùng git thay vì để hai file cùng tồn tại trên cùng URL.

</details>

**15. Những tính năng nào chỉ `App Router` có mà `Pages Router` không thể làm được?**

<details className="qa">
<summary>Xem đáp án</summary>

Những thứ gắn liền với React Server Components, Pages Router không có:

- **Server Components** — render ở server và không ship JS xuống client, giúp cắt giảm bundle.
- **Server Actions** — gọi hàm chạy trên server thẳng từ form/handler, không cần tự tạo API endpoint.
- **Nested layout** — mỗi cấp thư mục có `layout.tsx` riêng, giữ được state khi điều hướng giữa các route con; Pages Router chỉ có một `_app.tsx`.
- **Streaming + Suspense** — gửi UI xuống theo từng mảnh khi dữ liệu sẵn sàng, thay vì chờ toàn bộ trang.
- **File quy ước theo route** — `loading.tsx` và `error.tsx` đặt ngay trong thư mục route, thay cho việc tự viết loading state và một `_error.tsx` dùng chung.
- **Route Handler theo Web Standards** — `route.ts` dùng `Request`/`Response` chuẩn, chạy được ở nhiều runtime.

Ngược lại, `middleware.ts` là thứ **cả hai router dùng chung** — không phải lợi thế riêng của App Router.

</details>
