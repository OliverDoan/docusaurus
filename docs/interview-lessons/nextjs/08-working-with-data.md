---
sidebar_position: 8
title: "8. Working with Data"
---

# 8. Working with Data

## 1. Fetching Data

Bài học: [1. Fetching Data](../../nextjs/08-working-with-data/1_fetching-data.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao trong App Router một Server Component có thể là `async` và `await fetch` trực tiếp? Điều gì làm được điều đó?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì Server Component **chỉ chạy trên server** và chỉ chạy một lần cho mỗi request — nó không tham gia vòng đời render lại ở client, không có state, không có effect. Nhờ vậy React có thể chờ một Promise hoàn tất rồi mới sinh ra output, thay vì phải trả về ngay lập tức như component client.

```tsx
export default async function UsersPage() {
  const users = await fetch("https://api.example.com/users", {
    next: { revalidate: 60 },
  }).then(r => r.json());

  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

Kết quả render được serialize thành RSC payload gửi xuống trình duyệt, còn code fetch và secret ở lại server. Ngược lại, Client Component không thể `async` vì nó render đồng bộ nhiều lần và cần trả JSX ngay — ở đó vẫn phải dùng `useEffect` hoặc thư viện như TanStack Query.

</details>

**2. So sánh fetch ở Server Component và ở Client Component theo: bảo mật API key, SEO, thời điểm chạy, và kích thước bundle.**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | Server Component | Client Component |
|---|---|---|
| Thời điểm chạy | Lúc render trên server, trước khi gửi HTML | Sau khi trình duyệt tải và chạy xong JS |
| API key / secret | An toàn, `process.env.API_KEY` không rời server | Bị lộ trong bundle — phải proxy qua route handler |
| Database | Query trực tiếp | Bắt buộc đi qua HTTP API |
| SEO | Nội dung có sẵn trong HTML | HTML ban đầu rỗng, bot có thể không thấy |
| Bundle client | Bằng 0 — code fetch không gửi xuống | Cộng thêm code fetch và thư viện |
| Loading state | `<Suspense>` và streaming | `useState` / `isLoading` thủ công |
| Tương tác | Muốn dữ liệu mới phải điều hướng hoặc revalidate | Refetch dễ theo thao tác người dùng |

Nói ngắn: server thắng ở bảo mật, SEO và hiệu năng tải lần đầu; client thắng ở khả năng cập nhật theo tương tác và thời gian thực.

</details>

**3. Khi nào bắt buộc phải fetch ở Client Component thay vì Server Component? Cho ví dụ thực tế.**

<details className="qa">
<summary>Xem đáp án</summary>

Khi dữ liệu phụ thuộc vào thứ chỉ tồn tại trong trình duyệt hoặc phải đổi liên tục mà không muốn đi qua một vòng render server:

- **Fetch theo tương tác** — ô tìm kiếm gợi ý khi gõ, bộ lọc và phân trang phản hồi tức thì, infinite scroll.
- **Real-time** — polling giá, WebSocket cho chat hoặc thông báo, dashboard cập nhật liên tục.
- **Optimistic UI** — bấm "thích" là đổi giao diện ngay rồi mới đồng bộ với server.
- **Dữ liệu phụ thuộc trạng thái client** — vị trí địa lý, kích thước màn hình, dữ liệu trong `localStorage`, hoặc phiên xác thực xử lý phía client.

Ví dụ điển hình: trang danh sách sản phẩm render sẵn ở server cho SEO, nhưng thao tác lọc theo giá và sắp xếp thì gọi API từ client để không phải tải lại cả trang. Với những trường hợp này nên dùng TanStack Query thay vì `useState` + `useEffect` tự viết.

</details>

**4. Server Component có thể query database trực tiếp — lợi ích và những rủi ro cần kiểm soát là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

```tsx
import { db } from "@/lib/db";

export default async function UsersPage() {
  const users = await db.user.findMany();
  return /* ... */;
}
```

Lợi ích: bỏ được một chặng HTML trung gian (không cần dựng route handler chỉ để đọc dữ liệu), giảm độ trễ, giữ kiểu dữ liệu end-to-end từ ORM tới JSX, và chuỗi kết nối không bao giờ rời server.

Rủi ro phải kiểm soát:

- **Phân quyền** — không còn tầng API để kiểm tra, nên mỗi truy vấn phải tự lọc theo người dùng hiện tại, tránh trả nhầm dữ liệu người khác.
- **Rò rỉ dữ liệu qua props** — trả nguyên bản ghi user kèm `passwordHash` rồi truyền xuống Client Component là lộ thật; phải chọn trường cần thiết.
- **Vô tình import vào client** — dùng `import "server-only"` trong module truy cập DB để build báo lỗi ngay nếu bị kéo sang client.
- **Connection pool** — môi trường serverless dễ bùng số kết nối, cần pooler.
- **N+1 query** — render từng item mà mỗi item query riêng sẽ chậm.

</details>

**5. Next.js dedupe/memoize `fetch` như thế nào? Hai component gọi cùng một URL trong một lần render thì có mấy request thật sự đi ra ngoài?**

<details className="qa">
<summary>Xem đáp án</summary>

Chỉ **một** request thật sự đi ra ngoài.

```tsx
async function Header() {
  const user = await fetch("/api/user").then(r => r.json());
  return <p>Hi {user.name}</p>;
}

async function Profile() {
  const user = await fetch("/api/user").then(r => r.json()); // dedupe
  return <p>Email: {user.email}</p>;
}
```

Next.js override `fetch` toàn cục và bọc thêm cơ chế memoization của React: trong phạm vi **một lần render của một request**, các lời gọi trùng nhau (cùng URL và cùng option) chia sẻ chung một Promise, component nào gọi sau chỉ nhận lại kết quả đã có.

Nhờ vậy không cần "kéo dữ liệu lên component cha rồi prop-drill xuống" — mỗi component cứ tự khai báo dữ liệu nó cần, đặt fetch ngay cạnh nơi dùng. Lưu ý phân biệt với **Data Cache**: memoization sống trong một request, còn Data Cache tồn tại xuyên request và điều khiển bằng `revalidate` hay `tags`.

</details>

**6. Nếu dùng ORM hoặc client database (không phải `fetch`), làm sao tránh gọi trùng dữ liệu trong cùng một lần render?**

<details className="qa">
<summary>Xem đáp án</summary>

Cơ chế dedupe tự động chỉ áp dụng cho `fetch`. Với ORM hay driver database, bọc hàm truy vấn bằng `cache()` của React để có memoization tương đương trong phạm vi một request:

```tsx
import { cache } from "react";
import { db } from "@/lib/db";

export const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } });
});
```

Nhiều component cùng gọi `getUser("u1")` trong một lần render chỉ tạo đúng một truy vấn, các lần sau nhận lại kết quả đã memo. Điều kiện: tham số phải so sánh được theo tham chiếu/giá trị đơn giản, nên truyền id thay vì cả object.

Ngoài ra nên gom các hàm truy vấn vào một lớp "data access" dùng chung, vừa để đặt `cache()` một chỗ, vừa để kiểm tra quyền tập trung. Nếu muốn kết quả tồn tại xuyên nhiều request thì dùng thêm cơ chế cache dữ liệu có `revalidate`/`tags` chứ `cache()` không làm việc đó.

</details>

**7. Giải thích `request waterfall`: nó phát sinh thế nào trong Server Component và làm sao nhận ra trong thực tế?**

<details className="qa">
<summary>Xem đáp án</summary>

Waterfall là chuỗi request nối đuôi nhau: request sau chỉ bắt đầu khi request trước xong, nên tổng thời gian bằng tổng các độ trễ thay vì độ trễ lớn nhất.

```tsx
const user = await fetchUser();     // 300ms
const orders = await fetchOrders(); // 300ms — chờ dòng trên xong vô ích
// tổng ~600ms, dù hai lời gọi không phụ thuộc nhau
```

Trong Server Component nó phát sinh theo hai kiểu: `await` tuần tự trong cùng một component dù các lời gọi độc lập; và **waterfall theo cây component** — component cha `await` xong mới render con, con lại `await` tiếp.

Nhận ra bằng cách: xem thời gian phản hồi của trang lớn bất thường so với từng API riêng lẻ, bật log thời gian quanh mỗi lời gọi, dùng tab Network hoặc trace trên nền tảng triển khai để thấy các thanh thời gian xếp so le thay vì chồng lên nhau. Cách chữa: `Promise.all` cho các lời gọi độc lập, kỹ thuật preload, và tách nhánh chậm vào `<Suspense>` riêng.

</details>

**8. Cách nào để fetch song song trong Server Component? So sánh `Promise.all` và `Promise.allSettled` — khi nào chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Khởi tạo tất cả lời gọi trước rồi mới chờ chung một lần:

```tsx
const [user, orders, stats] = await Promise.all([
  fetchUser(),
  fetchOrders(),
  fetchStats(),
]);
```

| | `Promise.all` | `Promise.allSettled` |
|---|---|---|
| Khi một cái lỗi | Reject ngay toàn bộ | Luôn resolve, mỗi phần tử có `status` là `fulfilled` hoặc `rejected` |
| Kết quả trả về | Mảng giá trị | Mảng object mô tả kết quả từng cái |
| Hợp với | Dữ liệu **bắt buộc** phải có đủ mới render được trang | Dữ liệu **phụ**, thiếu một phần vẫn hiển thị được |

Chọn `Promise.all` cho phần cốt lõi của trang — thiếu thì nên rơi vào `error.tsx` luôn. Chọn `allSettled` cho các khối bổ trợ như widget thời tiết, gợi ý sản phẩm, số liệu thống kê: một dịch vụ chết thì chỉ ẩn khối đó chứ không làm sập cả trang. Cả hai đều giảm tổng thời gian về xấp xỉ lời gọi chậm nhất.

</details>

**9. Kỹ thuật `preload` (gọi hàm fetch mà không `await` trước phần việc chặn) hoạt động ra sao và giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Ý tưởng: gọi hàm lấy dữ liệu để **khởi động** request sớm nhất có thể, chưa `await` ngay, rồi làm việc khác; khi thật sự cần dữ liệu mới `await` thì phần lớn thời gian chờ đã trôi qua song song.

```tsx
export const preloadUser = (id: string) => {
  void getUser(id); // không await — chỉ châm ngòi
};

export default async function Page({ params }) {
  preloadUser(params.id);          // bắt đầu ngay
  const settings = await getSettings(); // chạy song song với getUser
  const user = await getUser(params.id); // thường đã xong, lấy từ memo
}
```

Nó giải quyết **waterfall theo cây component**: component cha có thể kích hoạt sẵn dữ liệu mà component con sẽ cần, thay vì để con chờ tới lượt render mới bắt đầu gọi. Kỹ thuật này dựa vào memoization (dedupe của `fetch` hoặc `cache()`) để lần `await` sau dùng lại đúng Promise đã tạo. Cần bắt lỗi cẩn thận cho lời gọi chưa `await` để tránh unhandled rejection.

</details>

**10. Các option `cache` và `next.revalidate` của `fetch` chỉ có tác dụng ở đâu? Điều gì xảy ra khi bạn dùng chúng trong Client Component?**

<details className="qa">
<summary>Xem đáp án</summary>

Chúng là **phần mở rộng của Next.js** trên `fetch` toàn cục phía server, nên chỉ có tác dụng trong Server Component, route handler, Server Action và các đoạn chạy trên server:

```ts
fetch(url, {
  cache: "no-store",              // hoặc "force-cache"
  next: { revalidate: 60, tags: ["users"] },
});
```

Trong Client Component, `fetch` là API native của trình duyệt. Trình duyệt bỏ qua thuộc tính `next` vì nó không nằm trong chuẩn — không lỗi, không cảnh báo, chỉ đơn giản là **không có tác dụng gì**. Riêng `cache` vẫn là option chuẩn của Fetch API nhưng ý nghĩa thuộc về HTTP cache của trình duyệt, không liên quan Data Cache của Next.

Đây là bẫy hay gặp: viết `next: { revalidate: 60 }` trong component có `"use client"` rồi thắc mắc vì sao dữ liệu không được cache. Ở phía client, việc cache và làm mới phải do thư viện như TanStack Query (`staleTime`, `refetchInterval`) hoặc header HTTP đảm nhiệm.

</details>

**11. Vì sao nên dùng thư viện như TanStack Query cho client fetching thay vì `useState` + `useEffect` thủ công? Nó lo giúp những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Viết tay bằng `useState` + `useEffect` chỉ xử lý đúng trường hợp lý tưởng, còn bỏ sót rất nhiều tình huống: race condition khi request cũ về sau request mới, không huỷ request khi component unmount, mỗi component tự fetch lại cùng một dữ liệu, không có retry khi mạng chập chờn, không chia sẻ cache giữa các trang.

TanStack Query lo sẵn những phần đó:

```tsx
const { data: users, isLoading } = useQuery({
  queryKey: ["users"],
  queryFn: () => fetch("/api/users").then(r => r.json()),
});
```

- **Cache theo `queryKey`** và chia sẻ giữa mọi component dùng chung key.
- **Dedupe** các lời gọi trùng đang chạy.
- **Refetch** khi cửa sổ được focus, khi mạng trở lại, hoặc theo chu kỳ.
- **Retry** với backoff, quản lý trạng thái `isLoading`/`isError`/`isFetching`.
- **Invalidate** sau mutation và **optimistic update**.
- **Phân trang, infinite query** dựng sẵn.

Kết quả là ít code hơn, ít bug khó tái hiện hơn, và hành vi nhất quán trên toàn app.

</details>

**12. Mô tả pattern hybrid: Server fetch `initialData` rồi truyền xuống Client Component. Pattern này được lợi gì và có nhược điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Server Component lấy dữ liệu lần đầu và truyền xuống làm dữ liệu khởi tạo cho Client Component:

```tsx
// Server Component
export default async function UsersPage() {
  const initialUsers = await db.user.findMany();
  return <UserListClient initialUsers={initialUsers} />;
}

// Client Component
const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: () => fetch("/api/users").then(r => r.json()),
  initialData: initialUsers,
});
```

Lợi ích: HTML đầu tiên đã có nội dung nên tốt cho SEO và không có màn loading trống; sau đó client tự do refetch, lọc, polling như một app tương tác bình thường. Rất hợp với danh sách sản phẩm hoặc news feed — vừa cần SEO vừa cần cập nhật.

Nhược điểm: dữ liệu bị **serialize hai lần** (trong HTML và trong RSC payload) làm payload phình ra; cần một route handler song song để client gọi lại, tức là duy trì hai đường lấy cùng một dữ liệu; và phải xử lý khéo `staleTime` để tránh vừa tải xong đã refetch ngay, gây nháy giao diện.

</details>

**13. Dữ liệu truyền từ Server Component sang Client Component qua props phải thoả điều kiện gì? Điều gì không truyền được?**

<details className="qa">
<summary>Xem đáp án</summary>

Props phải **serialize được** qua ranh giới server-client, vì chúng được mã hoá vào RSC payload rồi dựng lại trên trình duyệt. Truyền được: chuỗi, số, boolean, `null`, `undefined`, mảng, object thuần, `Date`, `Map`, `Set`, `BigInt`, Promise, và JSX đã render (truyền qua `children`).

Không truyền được:

- **Hàm** — trừ Server Action được đánh dấu `"use server"`.
- **Class instance** với method (object trả từ một số ORM, đối tượng có prototype tuỳ biến) — chỉ phần dữ liệu thuần sống sót.
- **Symbol**, biến tham chiếu tới tài nguyên server như kết nối DB, `fs`, stream.

Hai lưu ý quan trọng: mọi thứ truyền xuống đều **nhìn thấy được** trong payload gửi về trình duyệt, nên tuyệt đối không đưa `passwordHash`, token nội bộ hay trường nhạy cảm vào props — hãy chọn đúng trường cần dùng. Và props càng to thì payload càng nặng, nên lọc bớt dữ liệu trước khi truyền thay vì ném cả bản ghi.

</details>

**14. Xử lý trạng thái loading và lỗi ở Server Component ra sao (`<Suspense>`, `error.tsx`) so với ở Client Component?**

<details className="qa">
<summary>Xem đáp án</summary>

Ở Server Component, loading và lỗi là việc của **framework** chứ không phải state:

```tsx
<Suspense fallback={<Skeleton />}>
  <SlowReport />
</Suspense>
```

Phần bọc trong `<Suspense>` được stream về sau, trong lúc chờ thì hiện fallback. File `loading.tsx` trong một segment chính là `<Suspense>` bọc quanh cả segment đó. Khi render ném lỗi, `error.tsx` gần nhất đóng vai trò error boundary và cung cấp hàm `reset()` để thử lại; còn dữ liệu không tồn tại thì gọi `notFound()` để rơi vào `not-found.tsx`.

Ở Client Component, hai trạng thái này nằm trong chính component: `isLoading`/`isError` từ TanStack Query hoặc cờ tự quản bằng `useState`, cộng thêm error boundary để bắt lỗi khi render.

Khác biệt cốt lõi: server render một lần và **stream** kết quả dần — người dùng thấy khung trang ngay; client phải chờ tải JS rồi mới bắt đầu gọi API nên luôn có một quãng trống trước đó.

</details>

**15. Một page cần dữ liệu nhanh (thông tin user) và dữ liệu chậm (báo cáo phân tích): bạn tổ chức fetch và render thế nào để người dùng thấy nội dung sớm nhất?**

<details className="qa">
<summary>Xem đáp án</summary>

Không `await` dữ liệu chậm ở cấp page — nếu làm vậy cả trang bị chặn theo phần chậm nhất. Thay vào đó `await` phần nhanh để có khung trang, rồi tách phần chậm vào component riêng bọc `<Suspense>` để stream về sau:

```tsx
export default async function Page() {
  const user = await getUser();            // nhanh, cần ngay
  return (
    <>
      <Header user={user} />
      <Suspense fallback={<ReportSkeleton />}>
        <Analytics />                      {/* tự await bên trong */}
      </Suspense>
    </>
  );
}
```

Bổ sung vài kỹ thuật: gọi `preload` cho dữ liệu chậm ngay đầu page để nó chạy song song; dùng `Promise.all` cho các lời gọi độc lập trong cùng một nhánh; đặt `revalidate` dài hơn cho báo cáo vì nó ít đổi. Nếu báo cáo còn cần tương tác (đổi khoảng thời gian) thì chuyển hẳn sang Client Component với TanStack Query và dữ liệu khởi tạo từ server.

</details>

**16. Khi nào nên tạo route handler (`/api/...`) làm lớp trung gian thay vì fetch trực tiếp trong Server Component?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định thì **không** cần: Server Component đã chạy trên server, thêm một chặng HTTP nội bộ chỉ tốn độ trễ vô ích. Route handler xứng đáng khi có một trong các nhu cầu sau:

- **Client cần gọi** — component tương tác, TanStack Query, polling đều cần một endpoint thật.
- **Che giấu secret cho client** — proxy tới API bên thứ ba để khoá không xuống trình duyệt.
- **Bên ngoài gọi vào** — webhook từ Stripe, GitHub; ứng dụng di động hoặc đối tác dùng chung API.
- **Trả về thứ không phải HTML** — file, ảnh động, PDF, stream, `sitemap.xml`.
- **Hạ tầng dùng chung** — nơi đặt rate limit, CORS, xác thực token cho các client bên ngoài.

Với thao tác ghi dữ liệu từ form trong chính app, **Server Action** thường là lựa chọn gọn hơn route handler: không phải tự định nghĩa endpoint, tự lo tuần tự hoá, và tích hợp sẵn với revalidate.

</details>

**17. Bạn đo và tối ưu hiệu năng data fetching trong Next.js bằng cách nào (đo ở đâu, chỉ số gì, cải thiện ra sao)?**

<details className="qa">
<summary>Xem đáp án</summary>

Đo trước, sửa sau. Nơi đo và chỉ số cần nhìn:

- **Phía server** — thời gian mỗi lời gọi API/truy vấn DB (log hoặc trace), TTFB, tỷ lệ trúng cache. Trên nền tảng triển khai thường có sẵn trace theo request.
- **Phía trình duyệt** — tab Network để thấy request xếp so le (dấu hiệu waterfall), và các chỉ số Core Web Vitals như LCP, INP.
- **Build** — kích thước bundle client và số route được prerender.

Hướng tối ưu theo triệu chứng:

- Waterfall → `Promise.all`, preload, tách `<Suspense>`.
- Gọi trùng → dựa vào dedupe của `fetch`, bọc truy vấn ORM bằng `cache()`.
- API chậm và dữ liệu ít đổi → `next: { revalidate }` cộng `tags` để làm mới có chủ đích.
- Trang chờ phần chậm nhất → stream phần chậm qua `<Suspense>`.
- Truy vấn DB nặng → thêm index, chỉ chọn trường cần, gộp N+1 thành một truy vấn.
- Payload to → lọc dữ liệu trước khi truyền xuống Client Component.

</details>

---

## 2. Data Sources: REST, GraphQL, Database, ORM

Bài học: [2. Data Sources: REST, GraphQL, Database, ORM](../../nextjs/08-working-with-data/2_data-sources.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Trong App Router, vì sao `Server Component` truy cập thẳng database được còn `Client Component` thì không? Giải thích cơ chế đằng sau, không chỉ nêu kết luận.**

<details className="qa">
<summary>Xem đáp án</summary>

Khác biệt nằm ở **nơi code được thực thi và nơi code được đóng gói**.

Server Component chỉ chạy trong tiến trình Node/Edge trên server. Code của nó không bao giờ nằm trong bundle gửi xuống trình duyệt — Next chỉ serialize **kết quả render** thành RSC payload. Nhờ vậy nó đọc được `process.env.DATABASE_URL`, mở được kết nối, dùng được các module Node như `fs` hay `net`.

Client Component có `"use client"` thì ngược lại: toàn bộ module cùng mọi thứ nó import đều bị đóng gói và tải về trình duyệt. Ở đó không tồn tại biến môi trường server, không có TCP socket, và nếu credential có mặt trong bundle thì bất kỳ ai mở DevTools cũng đọc được.

```tsx
"use client";
import { db } from "@/lib/db"; // SAI: kéo cả driver DB vào bundle client
```

Vì thế Client Component muốn có dữ liệu phải đi qua route handler hoặc Server Action — tức là vẫn có một đoạn chạy trên server đứng ra làm trung gian.

</details>

**2. Biến môi trường nào lộ xuống trình duyệt và biến nào không? Điều gì thực sự xảy ra ở bước build với tiền tố `NEXT_PUBLIC_`?**

<details className="qa">
<summary>Xem đáp án</summary>

Quy tắc đơn giản: biến có tiền tố `NEXT_PUBLIC_` là **công khai**, mọi biến khác chỉ tồn tại phía server.

Ở bước build, Next quét mã nguồn và **thay thế tĩnh** mọi tham chiếu `process.env.NEXT_PUBLIC_XXX` bằng chính giá trị chuỗi, rồi nhúng thẳng vào bundle JavaScript. Hai hệ quả quan trọng:

- Giá trị đó nằm trong file JS người dùng tải về — không có gì bí mật, ai cũng đọc được.
- Vì là thay thế lúc build, đổi giá trị sau khi build sẽ không có tác dụng: phải build lại. Cũng vì vậy không truy cập được theo kiểu động như `process.env["NEXT_PUBLIC_" + key]`.

Biến không có tiền tố (`DATABASE_URL`, `API_KEY`, `CMS_TOKEN`) chỉ đọc được trong Server Component, Server Action, route handler và middleware; ở client chúng trả về `undefined`.

Nguyên tắc thực hành: chỉ đặt `NEXT_PUBLIC_` cho thứ vô hại như URL công khai hay khoá publishable, và dùng `import "server-only"` cho module chứa secret để build báo lỗi nếu bị import nhầm sang client.

</details>

**3. So sánh `REST` và `GraphQL` cho một trang chi tiết sản phẩm: over-fetching và under-fetching thể hiện ra sao, và GraphQL đánh đổi lại điều gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Trang chi tiết sản phẩm cần: thông tin sản phẩm, vài đánh giá mới nhất, thông tin người bán.

- **REST** — gọi `/products/:id` thường trả về **thừa** trường (mô tả dài, metadata, lịch sử giá) dù giao diện chỉ dùng vài trường: đó là over-fetching. Đồng thời vẫn **thiếu** đánh giá và người bán nên phải gọi thêm `/products/:id/reviews` và `/sellers/:id`: đó là under-fetching, kéo theo nhiều round-trip và dễ sinh waterfall.
- **GraphQL** — một truy vấn khai báo đúng các trường cần, server trả về đúng chừng đó trong một lần gọi.

| | REST | GraphQL |
|---|---|---|
| Số lời gọi cho trang này | Nhiều endpoint | Một truy vấn |
| Lượng dữ liệu | Thừa hoặc thiếu | Đúng nhu cầu |
| Caching HTTP | Đơn giản, theo URL | Khó, thường POST một endpoint |

Đánh đổi của GraphQL: hạ tầng phức tạp hơn (schema, resolver, client như Apollo hay graphql-request), cache HTTP/CDN khó tận dụng, dễ dính N+1 ở tầng resolver, và cần giới hạn độ sâu truy vấn để tránh bị lạm dụng.

</details>

**4. Khi nào bạn vẫn dựng một tầng API riêng thay vì query database trực tiếp trong `Server Component`? Cho ít nhất ba tình huống cụ thể.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Client cần gọi dữ liệu** — bộ lọc tương tác, infinite scroll, polling: phải có endpoint thật cho trình duyệt gọi.
- **Có nhiều consumer** — ứng dụng di động, đối tác, hoặc một dịch vụ khác cùng dùng chung dữ liệu. Nhúng truy vấn vào từng Server Component sẽ khiến logic bị nhân bản.
- **Webhook và callback từ bên ngoài** — Stripe, GitHub gọi vào thì bắt buộc là endpoint HTTP.
- **Backend đã tồn tại** — công ty có sẵn service Java/Go/Python và database do team khác sở hữu; Next chỉ nên gọi qua API, không được nối thẳng vào DB người khác.
- **Cần lớp hạ tầng chung** — rate limit, xác thực token bên thứ ba, audit log, kiểm soát schema trả về.
- **Trả về thứ không phải HTML** — file, PDF, ảnh động, stream.

Ngược lại, với dữ liệu chỉ phục vụ chính trang đang render và chỉ app này dùng, gọi thẳng DB trong Server Component là gọn và nhanh hơn — thêm một chặng HTTP nội bộ chỉ cộng thêm độ trễ. Còn thao tác ghi từ form thì Server Action thường thay thế được route handler.

</details>

**5. Vì sao nên bọc `fetch` trong một helper chung kiểu `api<T>()` thay vì gọi `fetch` rải rác? Helper đó nên gánh những trách nhiệm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Gọi `fetch` rải rác khiến base URL, header xác thực và cách xử lý lỗi bị lặp lại ở hàng chục chỗ — sửa một quy ước là phải sửa khắp nơi, và chỉ cần quên kiểm tra `res.ok` một lần là có bug khó tìm.

```ts
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${process.env.API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.API_KEY}`,
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}
```

Trách nhiệm nên gom vào helper: ghép base URL, gắn header và xác thực, kiểm tra `res.ok` và ném lỗi có thông tin, parse JSON, gắn kiểu trả về qua generic, đặt mặc định cho `cache`/`next.revalidate`, thêm timeout qua `AbortSignal`, retry cho lỗi tạm thời, và log/trace tập trung.

Lợi ích kèm theo: nơi gọi chỉ còn `api<User[]>("/users")` — ngắn, có kiểu, và dễ thay đổi hành vi toàn hệ thống ở một chỗ.

</details>

**6. `fetch` không throw khi server trả về `404` hay `500`. Điều đó ảnh hưởng thế nào tới cách bạn xử lý lỗi, và bạn kiểm tra bằng gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`fetch` chỉ reject khi request **không thực hiện được** (mất mạng, DNS hỏng, CORS chặn, bị abort). Một phản hồi `404` hay `500` vẫn là "thành công" về mặt mạng, nên Promise resolve bình thường.

```ts
const res = await fetch(url);
// res.ok là false khi status ngoài khoảng 200–299
if (!res.ok) throw new Error(`HTTP ${res.status}`);
return res.json();
```

Nếu quên kiểm tra `res.ok`, `res.json()` sẽ cố parse body lỗi — hoặc ném `SyntaxError` khó hiểu, hoặc tệ hơn là trả về object lỗi rồi được dùng như dữ liệu thật, khiến giao diện hiển thị sai mà không ai biết.

Cách làm đúng: luôn kiểm `res.ok` (hoặc `res.status`) ngay sau khi fetch, tốt nhất là gom vào helper `api()` chung. Trong Next, phân biệt tiếp hai loại: `404` nghĩa là dữ liệu không tồn tại nên gọi `notFound()` để rơi vào `not-found.tsx`; `5xx` thì ném lỗi cho `error.tsx` xử lý. Nhớ bọc `try/catch` để bắt cả lỗi mạng thật sự.

</details>

**7. So sánh `Prisma` và `Drizzle` trên các trục: bundle size, cold start, migration, type safety. Bạn chọn cái nào cho một project mới deploy serverless và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Prisma | Drizzle |
|---|---|---|
| Schema | DSL riêng trong file `.prisma` | TypeScript thuần |
| Bundle size | Lớn (cỡ vài MB, kèm engine) | Nhỏ (cỡ vài chục KB) |
| Cold start | Chậm hơn do phải nạp engine | Nhanh, thuần JS |
| Migration | Sinh tự động, công cụ đầy đủ (`migrate`, Studio) | Generate bằng drizzle-kit, kiểm soát thủ công nhiều hơn |
| Type safety | Generated — phải chạy `prisma generate` | Inferred trực tiếp từ schema TS, không cần codegen |
| Edge | Cần Prisma Accelerate hoặc driver adapter | Native với driver HTTP |
| Độ chín | Cao, hệ sinh thái lớn | Mới hơn nhưng đã production-ready |

Cho project mới deploy serverless/Edge, **Drizzle** thường là lựa chọn hợp hơn: bundle gọn và cold start nhanh là hai thứ ảnh hưởng trực tiếp tới trải nghiệm ở môi trường đó, cú pháp SQL-like giúp ai biết SQL viết được ngay, và không có bước codegen trong quy trình build. Prisma vẫn rất đáng chọn khi team ưu tiên DX, muốn migration tự động và công cụ trực quan, hoặc dự án đã dùng sẵn thì không nên chuyển đổi chỉ vì trào lưu.

</details>

**8. Vì sao `PrismaClient` phải khởi tạo theo pattern singleton gắn vào `globalThis` ở môi trường dev? Không làm vậy thì hỏng ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Ở chế độ dev, Next hot-reload bằng cách nạp lại module mỗi khi file đổi. Nếu `new PrismaClient()` nằm ở cấp module, mỗi lần reload lại tạo thêm một client mới, mà client cũ vẫn giữ connection pool của nó. Sau vài chục lần sửa code, số kết nối tới database vượt giới hạn và xuất hiện lỗi kiểu "too many connections", kèm cảnh báo của Prisma về việc có quá nhiều instance.

```ts
const globalForPrisma = globalThis as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

`globalThis` không bị xoá khi module được nạp lại, nên client được tái sử dụng qua các lần hot-reload.

Chỉ gán vào global ở môi trường không phải production vì trên production module chỉ nạp một lần, không cần và cũng không nên giữ trạng thái toàn cục. Lưu ý singleton này giải quyết bài toán **hot-reload**, còn bài toán bùng kết nối do nhiều instance serverless thì phải xử lý bằng pooler ở tầng hạ tầng.

</details>

**9. Connection pooling vỡ như thế nào khi chạy Postgres với serverless functions? Nêu các cách xử lý (pooler, HTTP driver, `Prisma Accelerate`).**

<details className="qa">
<summary>Xem đáp án</summary>

Pool kết nối được thiết kế cho một server chạy lâu dài, nắm giữ một số kết nối cố định và tái sử dụng. Serverless thì ngược lại: mỗi function instance là một tiến trình riêng, tự mở pool của mình, sống ngắn và có thể được nhân bản lên hàng trăm bản khi lưu lượng tăng. Kết quả là số kết nối bằng số instance nhân với kích thước pool — Postgres có giới hạn kết nối hữu hạn nên nhanh chóng bị từ chối, trong khi mỗi kết nối TCP mới còn tốn thời gian bắt tay ở mỗi cold start.

Các cách xử lý:

- **Connection pooler ngoài** — PgBouncer, Supabase pooler, Neon pooler đứng giữa, gom hàng nghìn kết nối ứng dụng thành vài kết nối thật tới DB. Nhớ dùng chế độ phù hợp và tắt prepared statement nếu pooler ở transaction mode.
- **Driver dựa trên HTTP/fetch** — `@neondatabase/serverless`, `@planetscale/database`, `@libsql/client`: không giữ kết nối TCP nên hợp serverless và chạy được cả trên Edge.
- **Prisma Accelerate** — lớp proxy có pooling và cache toàn cầu, đồng thời giúp Prisma chạy được ở Edge.

Kèm theo: giảm kích thước pool mỗi instance và cho truy vấn có timeout.

</details>

**10. Driver nào chạy được trên Edge Runtime và vì sao? Trade-off của driver dựa trên HTTP so với driver TCP là gì, đặc biệt với transaction?**

<details className="qa">
<summary>Xem đáp án</summary>

Edge Runtime không phải Node: không có module `net`, nên mọi driver mở TCP socket đều không chạy được. Chỉ driver giao tiếp qua **HTTP/fetch** mới hoạt động.

| Database | Driver Edge-compat | Driver Node only |
|---|---|---|
| Postgres | `@vercel/postgres`, `@neondatabase/serverless` | `pg` |
| MySQL | `@planetscale/database` | `mysql2` |
| SQLite | `@libsql/client` (Turso) | `better-sqlite3` |

Trade-off của HTTP driver: cold start nhanh, không giữ kết nối, chạy được trong middleware và Edge route; đổi lại mỗi truy vấn cộng thêm overhead của một request HTTP, và **transaction bị hạn chế** — vì không có phiên kết nối liên tục nên khó giữ `BEGIN ... COMMIT` qua nhiều lời gọi; các nhà cung cấp thường chỉ hỗ trợ transaction dạng gửi cả lô câu lệnh trong một request. Driver TCP ngược lại: transaction đầy đủ, prepared statement, độ trễ thấp khi kết nối đã ấm, nhưng cần môi trường Node và pooler.

Pattern thực dụng: page và route handler chạy Node runtime thì dùng ORM với driver TCP; riêng middleware hoặc Edge route thì dùng driver HTTP.

</details>

**11. Vấn đề `N+1 query` xuất hiện thế nào khi mỗi component con tự query dữ liệu của mình? Bạn phát hiện và xử lý ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Trang lấy danh sách 50 bài viết bằng một truy vấn, rồi render 50 component con, mỗi con tự query tác giả của mình — tổng cộng 1 + 50 = 51 truy vấn. Mô hình "mỗi component tự lấy dữ liệu nó cần" của RSC rất dễ dẫn tới tình huống này vì mỗi component nhìn riêng lẻ đều hợp lý.

Phát hiện: bật log truy vấn của ORM và đếm số câu lệnh cho một lần render, xem trace/APM thấy một chuỗi dài các truy vấn gần giống nhau, hoặc đơn giản là thời gian trang tăng tuyến tính theo số phần tử trong danh sách.

Xử lý:

- **Lấy kèm quan hệ trong một truy vấn** — `include: { posts: true }` của Prisma, `with: { posts: true }` của Drizzle, hoặc `JOIN` trực tiếp.
- **Gom theo lô** — truy vấn một lần với `where id IN (...)` rồi phân phát xuống các component.
- **Memoize trong một request** — bọc hàm truy vấn bằng `cache()` của React để các lời gọi trùng tham số chỉ chạy một lần.
- **Tập trung truy vấn vào repository** để dễ kiểm soát và tối ưu một chỗ.

</details>

**12. Pattern repository (tách truy vấn ra `lib/repositories/*`) mang lại lợi ích gì? Đánh đổi nào khiến bạn có thể bỏ qua nó ở project nhỏ?**

<details className="qa">
<summary>Xem đáp án</summary>

```ts
// lib/repositories/user.ts
export async function findUser(id: number) {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}

// app/users/page.tsx
const user = await findUser(id);
```

Lợi ích: component không biết gì về ORM nên dễ đổi Prisma sang Drizzle mà không đụng UI; test dễ vì chỉ cần mock vài hàm repository; caching, phân quyền và validation gom về một chỗ thay vì rải khắp các trang; và tên hàm mô tả **ý định nghiệp vụ** (`findActiveSubscribers`) thay vì chi tiết truy vấn.

Đánh đổi: thêm một tầng gián tiếp, nhiều file nhỏ, đôi khi phải viết một hàm chỉ để bọc đúng một dòng truy vấn; và nếu lạm dụng sẽ đẻ ra hàng loạt hàm dùng một lần. Ở project nhỏ hoặc giai đoạn prototype, gọi thẳng ORM trong Server Component nhanh hơn và vẫn đọc được.

Ranh giới hợp lý: bắt đầu gọi trực tiếp, và tách sang repository khi một truy vấn bị lặp ở nhiều nơi, khi cần gắn kiểm tra quyền, hoặc khi muốn viết test cho logic dữ liệu.

</details>

**13. Khi nào bạn chọn `tRPC` thay vì `REST`, `GraphQL` hay `Server Action`? Điều kiện tiên quyết để `tRPC` phát huy giá trị là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Điều kiện tiên quyết: **client và server cùng là TypeScript và nằm chung một monorepo** (hoặc chia sẻ được type qua package). Giá trị của tRPC đến từ việc client suy ra kiểu trực tiếp từ định nghĩa router phía server — không schema, không codegen, đổi tên một trường là chỗ gọi báo lỗi ngay. Nếu backend viết bằng ngôn ngữ khác thì tRPC vô nghĩa.

Khi nào chọn cái gì:

- **tRPC** — app full-stack TypeScript, nhiều thao tác gọi từ Client Component, muốn an toàn kiểu end-to-end mà không muốn dựng GraphQL.
- **REST** — cần phục vụ nhiều loại consumer, đối tác bên ngoài, ứng dụng di động, hoặc muốn tận dụng cache HTTP theo URL.
- **GraphQL** — nhiều client với nhu cầu dữ liệu rất khác nhau, đồ thị quan hệ phức tạp, hoặc tổ chức đã có sẵn hạ tầng GraphQL.
- **Server Action** — thao tác ghi xuất phát từ form trong chính app; gọn nhất, không cần định nghĩa endpoint, tích hợp sẵn revalidate.

Thực tế trong App Router, phần đọc thường do Server Component đảm nhiệm, nên tRPC hữu ích nhất ở các phần tương tác phía client.

</details>

**14. Một trang cần gộp dữ liệu từ database, một REST API bên thứ ba và một headless CMS. Bạn tổ chức việc lấy dữ liệu, xử lý lỗi từng phần và caching như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Tổ chức theo ba nguyên tắc: gọi song song, tách theo mức độ quan trọng, và đặt chính sách cache riêng cho từng nguồn.

```tsx
const [user, banners] = await Promise.all([
  findUser(id),                 // DB — bắt buộc
  getBanners(),                 // CMS — revalidate dài
]);
const [rate] = await Promise.allSettled([getExchangeRate()]); // bên thứ ba, có thể thiếu
```

- **Song song** — dùng `Promise.all` cho dữ liệu cốt lõi (thiếu thì trang vô nghĩa, để lỗi rơi vào `error.tsx`), `Promise.allSettled` cho dữ liệu phụ như tỷ giá hay banner để một dịch vụ chết không làm sập cả trang. Luôn đặt timeout cho API bên thứ ba.
- **Streaming** — nguồn chậm tách vào component riêng bọc `<Suspense>` với skeleton, để phần nhanh hiển thị trước.
- **Caching theo nguồn** — CMS ít đổi thì `next: { revalidate: 3600 }` kèm `tags` để webhook của CMS gọi `revalidateTag` khi có bài mới; tỷ giá đặt `revalidate` ngắn; dữ liệu DB theo người dùng thì không cache, và bọc truy vấn bằng `cache()` để dedupe trong một request.
- **Đóng gói** — mỗi nguồn một module riêng (repository cho DB, helper `api()` cho REST, client riêng cho CMS) để lỗi và cache xử lý tập trung.

</details>
