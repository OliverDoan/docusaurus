---
sidebar_position: 9
title: "9. Data Fetching Patterns"
---

# 9. Data Fetching Patterns

## 1. Data Fetching Patterns

Bài học: [1. Data Fetching Patterns](../../nextjs/09-data-fetching-patterns/1_patterns.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Request waterfall` là gì? Vì sao nó bị coi là thủ phạm số một làm chậm trang trong ứng dụng hiện đại?**

<details className="qa">
<summary>Xem đáp án</summary>

Waterfall là tình huống các request xếp nối tiếp nhau: request sau chỉ khởi động khi request trước đã xong, nên tổng thời gian là **tổng** các độ trễ thay vì độ trễ lớn nhất.

```tsx
const header = await fetchHeader();     // 1s
const list = await fetchList();         // 1s — chỉ start khi header xong
const sidebar = await fetchSidebar();   // 1s — chỉ start khi list xong
// Total: 3s, và không gì hiện ra cho tới khi cả 3 xong
```

Nó là thủ phạm số một vì phần lớn thời gian một trang chờ đợi là **độ trễ mạng, không phải CPU**. Chạy song song thì ba lần chờ chồng lên nhau, còn tuần tự thì cộng dồn — chênh lệch gấp mấy lần mà không cần tối ưu gì thêm ở backend. Tệ hơn, waterfall thường không lộ ra khi test với dữ liệu nhỏ và mạng nhanh, chỉ bộc lộ trên production với người dùng ở xa. Nó cũng tích tụ theo chiều sâu cây component: mỗi tầng thêm một chặng chờ nữa.

</details>

**2. Cho ba request độc lập, mỗi cái 1 giây. Giải thích tổng thời gian khi chạy tuần tự so với song song, và cách bạn viết lại code để đạt phương án nhanh hơn.**

<details className="qa">
<summary>Xem đáp án</summary>

Tuần tự mất khoảng **3 giây** (1 + 1 + 1), song song mất khoảng **1 giây** — bằng request chậm nhất, vì cả ba cùng chờ trong một khoảng thời gian.

```tsx
// Sequential — 3s
const user = await fetchUser();
const orders = await fetchOrders();
const products = await fetchProducts();

// Parallel — 1s
const [user, orders, products] = await Promise.all([
  fetchUser(),
  fetchOrders(),
  fetchProducts(),
]);
```

Điểm mấu chốt không nằm ở `Promise.all` mà ở chỗ **cả ba Promise được tạo ra trước khi `await` bất kỳ cái nào**. Viết `const p1 = fetchUser(); const p2 = fetchOrders();` rồi mới `await p1; await p2;` cũng cho kết quả song song tương đương, vì hàm async bắt đầu chạy ngay khi được gọi chứ không phải khi được `await`.

Quy tắc rút ra: luôn chạy song song khi các request không phụ thuộc nhau; chỉ tuần tự khi kết quả trước là đầu vào của bước sau.

</details>

**3. Khi nào fetch tuần tự là bắt buộc chứ không phải lỗi thiết kế? Trong tình huống đó còn cách nào rút ngắn thời gian không?**

<details className="qa">
<summary>Xem đáp án</summary>

Bắt buộc tuần tự khi **kết quả bước trước là đầu vào bước sau**:

```tsx
const user = await fetchUser();            // 1s
const orders = await fetchOrders(user.id); // 1s — cần user.id
// Total: 2s, không tránh được bằng Promise.all
```

Vẫn có cách rút ngắn:

- **Gộp ở backend** — thêm một endpoint trả cả user và orders trong một lần gọi, hoặc dùng GraphQL/ORM với `include` để một truy vấn lấy luôn quan hệ.
- **Lấy khoá từ nguồn rẻ hơn** — nếu chỉ cần `user.id` thì thường đã có sẵn trong session, cookie hay chính URL; lúc đó không cần chờ `fetchUser` nữa và hai request thành độc lập.
- **Chạy song song phần không phụ thuộc** — những dữ liệu khác của trang vẫn `Promise.all` cùng lúc với chuỗi phụ thuộc này.
- **Streaming** — tách nhánh phụ thuộc vào `<Suspense>` riêng để phần còn lại của trang hiện ngay, không phải chờ đủ 2 giây.

</details>

**4. So sánh `Promise.all` và `Promise.allSettled` khi lấy dữ liệu cho một dashboard. Một nguồn lỗi thì mỗi cách hành xử ra sao và bạn chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `Promise.all` | `Promise.allSettled` |
|---|---|---|
| Một nguồn lỗi | Reject ngay, toàn bộ lời gọi thất bại | Vẫn resolve, phần lỗi được đánh dấu `rejected` |
| Kết quả | Mảng giá trị | Mảng object có `status` và `value`/`reason` |
| Hệ quả trên UI | Rơi vào `error.tsx`, cả trang báo lỗi | Render được các khối còn lại, khối lỗi hiện thông báo riêng |

Với dashboard, cách thực dụng là **dùng cả hai theo mức độ quan trọng**: `Promise.all` cho dữ liệu cốt lõi mà thiếu nó trang vô nghĩa (thông tin người dùng, quyền truy cập); `Promise.allSettled` cho các widget bổ trợ như thời tiết, gợi ý, số liệu bên thứ ba — một dịch vụ chết thì chỉ khối đó hiện trạng thái lỗi chứ không kéo sập cả trang.

```tsx
const results = await Promise.allSettled([getWeather(), getTips()]);
const weather = results[0].status === "fulfilled" ? results[0].value : null;
```

Cả hai đều chạy song song nên tổng thời gian như nhau; khác biệt chỉ ở chính sách xử lý lỗi.

</details>

**5. Vì sao đặt nhiều `Server Component` con, mỗi cái tự `await` dữ liệu riêng, vẫn tạo waterfall dù các dữ liệu đó độc lập nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì Server Component được render theo cây và theo thứ tự: khi React gặp một component async đang `await`, nó phải chờ component đó xong mới render tiếp phần sau. Lời gọi fetch của component kế tiếp vì thế chưa hề bắt đầu.

```tsx
async function Page() {
  return (
    <>
      <User />     {/* await fetchUser */}
      <Orders />   {/* fetchOrders chỉ start khi User xong */}
      <Products /> {/* chỉ start khi Orders xong */}
    </>
  );
}
```

Đây là **waterfall theo cây component** — khó thấy hơn waterfall do `await` tuần tự trong một hàm, vì nhìn từng component thì đều hợp lý.

Hai cách chữa: khởi tạo tất cả Promise ở component cha rồi truyền xuống dưới dạng props để các con `await` promise đã chạy sẵn; hoặc bọc mỗi component con trong `<Suspense>` riêng — mỗi boundary là một nhánh render độc lập nên các fetch khởi động song song và stream về khi sẵn sàng. Kỹ thuật preload ở layout cũng phục vụ cùng mục đích.

</details>

**6. Giải thích pattern preload: gọi fire-and-forget ở layout rồi child `await` lại. Cơ chế nào đảm bảo chỉ có đúng một request mạng được gửi đi?**

<details className="qa">
<summary>Xem đáp án</summary>

Layout gọi hàm lấy dữ liệu nhưng **không `await`** — chỉ để châm ngòi cho request chạy sớm, rồi render tiếp ngay:

```tsx
// app/dashboard/layout.tsx
export default async function Layout({ children }) {
  preloadUser();          // fire-and-forget
  return <>{children}</>;
}

// app/dashboard/page.tsx
async function Page() {
  const user = await fetchUser(); // thường đã xong, lấy lại kết quả cũ
}
```

Cơ chế đảm bảo chỉ một request là **request memoization**: trong phạm vi một lần render của một request, Next/React ghi nhớ lời gọi `fetch` theo URL và option, nên lời gọi thứ hai nhận lại đúng Promise của lời gọi đầu chứ không mở kết nối mới. Với hàm không phải `fetch`, bọc bằng `cache()` của React để có hành vi tương đương.

Nhờ vậy thời gian chờ mạng trôi qua song song với việc render layout và các phần khác. Lưu ý xử lý lỗi cho lời gọi chưa `await` (dùng `void` và bắt lỗi) để tránh unhandled rejection.

</details>

**7. `Request Memoization` dedupe dựa trên tiêu chí gì? Với hàm không phải `fetch` (ví dụ query database) thì làm sao để dedupe?**

<details className="qa">
<summary>Xem đáp án</summary>

Với `fetch`, Next dedupe dựa trên **URL cộng với các option của request** (method, headers, body...) trong phạm vi **một lần render của một request**. Hai lời gọi giống hệt nhau chia sẻ chung một Promise; khác một chi tiết nhỏ trong option là coi như hai lời gọi khác nhau.

Với truy vấn database hay bất kỳ hàm async nào khác, dùng `cache()` của React:

```tsx
import { cache } from "react";

export const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } });
});
```

Khoá memo ở đây là **danh sách tham số**, so sánh theo tham chiếu/giá trị đơn giản — nên truyền id (chuỗi, số) thay vì object mới tạo mỗi lần gọi, nếu không sẽ không bao giờ trúng memo.

Phân biệt rõ hai tầng: memoization sống trong đúng một request và tự biến mất sau đó; còn muốn dữ liệu dùng lại xuyên nhiều request thì đó là việc của Data Cache với `next: { revalidate, tags }`.

</details>

**8. Khi bọc một component chậm trong `Suspense`, chuyện gì thực sự xảy ra ở tầng HTTP response? HTML tới trình duyệt theo trình tự nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Server không chờ render xong mới trả lời. Nó mở một response dạng **chunked** và gửi dần:

1. Ngay lập tức: phần HTML đã sẵn sàng — layout, tiêu đề, và **fallback** của mỗi `<Suspense>` (skeleton) ở đúng vị trí.
2. Kết nối vẫn mở. Khi một boundary resolve, server gửi tiếp một chunk chứa HTML thật của phần đó kèm một đoạn script nhỏ.
3. Đoạn script đó thay fallback bằng nội dung thật ngay trong DOM, không cần chờ các boundary còn lại.
4. Khi mọi boundary xong, response đóng lại, rồi React hydrate.

Với dashboard có ba khối, người dùng thấy tiêu đề và ba skeleton gần như tức thì; khối thống kê hiện sau 0.5s, biểu đồ sau 1s, hoạt động gần đây sau 2s — thay vì màn trắng 2 giây rồi mới thấy tất cả. Các boundary resolve **độc lập và song song**, và thứ tự tới nơi phụ thuộc thứ tự resolve chứ không phải thứ tự trong JSX.

</details>

**9. Một `Suspense` boundary bao cả trang khác gì nhiều boundary nhỏ theo từng khối? Ảnh hưởng tới trải nghiệm người dùng ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Một boundary bao cả trang nghĩa là toàn bộ nội dung chỉ xuất hiện khi **phần chậm nhất** xong — người dùng nhìn skeleton suốt thời gian đó, đúng bằng trải nghiệm của việc không streaming, chỉ khác là có khung chờ đẹp hơn.

Nhiều boundary nhỏ thì mỗi khối tự hiện khi dữ liệu của nó sẵn sàng: phần nhanh xuất hiện sớm, phần chậm đến sau, cảm nhận về tốc độ tốt hơn hẳn dù tổng thời gian không đổi.

| | Một boundary cả trang | Nhiều boundary theo khối |
|---|---|---|
| Thời điểm thấy nội dung | Khi phần chậm nhất xong | Ngay khi từng phần xong |
| Cảm nhận tốc độ | Kém | Tốt |
| Rủi ro layout shift | Thấp | Cao hơn nếu skeleton sai kích thước |
| Độ phức tạp | Đơn giản | Phải thiết kế skeleton cho từng khối |

Kinh nghiệm chia boundary: theo **khối nội dung có ý nghĩa** và theo **tốc độ nguồn dữ liệu**, không chia quá vụn kẻo trang nhấp nháy liên tục. Skeleton nên có kích thước gần đúng nội dung thật để tránh giật layout.

</details>

**10. `loading.tsx` và `Suspense` thủ công khác nhau ở phạm vi và thời điểm kích hoạt như thế nào? Khi nào bạn dùng cả hai?**

<details className="qa">
<summary>Xem đáp án</summary>

`loading.tsx` là một `<Suspense>` do Next tự đặt quanh **toàn bộ segment**: nó xuất hiện khi người dùng điều hướng tới route đó và biến mất khi cả page render xong. Ưu điểm là phản hồi tức thì khi chuyển trang; nhược điểm là nếu các phần dữ liệu có tốc độ khác nhau thì người dùng nhìn skeleton của cả trang cho tới khi phần chậm nhất xong.

`<Suspense>` đặt tay trong page có phạm vi hẹp hơn, bao đúng khối chậm, cho phép phần còn lại render ngay:

```tsx
async function Dashboard() {
  return (
    <>
      <PageHeader />
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
    </>
  );
}
```

Kết hợp cả hai cho trải nghiệm tốt nhất: `loading.tsx` lo khoảnh khắc chuyển trang (phản hồi ngay khi bấm link), còn các boundary con lo việc từng khối dữ liệu hiện dần sau khi khung trang đã có. Lưu ý `loading.tsx` áp dụng cho cả các route con nằm trong segment đó.

</details>

**11. React 19 `use(promise)` cho phép làm gì mà `await` trong `Server Component` không làm được? Truyền promise từ Server xuống Client Component có ràng buộc gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`use()` cho phép **đọc giá trị của một Promise ngay trong thân component**, kể cả Client Component — nơi không dùng được `await`. Nhờ vậy component cha có thể khởi tạo tất cả Promise ngay từ đầu (chạy song song) rồi truyền xuống, mỗi con `use()` promise của mình và treo ở đúng boundary của nó:

```tsx
function Page() {
  const userPromise = fetchUser();      // start ngay
  const ordersPromise = fetchOrders();  // start ngay
  return (
    <>
      <Suspense fallback={<Skeleton />}>
        <UserDetail promise={userPromise} />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <OrderList promise={ordersPromise} />
      </Suspense>
    </>
  );
}

function UserDetail({ promise }) {
  const user = use(promise);
  return <div>{user.name}</div>;
}
```

`await` trong Server Component thì chặn nhánh render tại chỗ, còn `use()` để component treo trong Suspense mà không chặn phần khác. Ràng buộc khi truyền qua ranh giới server-client: **giá trị Promise trả về phải serialize được**, không được là hàm hay class instance; và phải có `<Suspense>` bọc bên ngoài cùng error boundary để xử lý khi Promise reject.

</details>

**12. Nêu các trade-off của streaming: `TTFB` đo được, layout shift, và khả năng crawl của công cụ tìm kiếm. Bạn xử lý từng cái ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

- **TTFB** — streaming thường cải thiện thời điểm người dùng thấy nội dung đầu tiên, nhưng cách đo có thể gây hiểu nhầm: response mở sớm rồi kéo dài, nên các công cụ đo "thời gian tải xong" cho con số xấu hơn. Cách xử lý là nhìn đúng chỉ số trải nghiệm — LCP và thời điểm hiển thị nội dung — thay vì tổng thời gian response.
- **Layout shift** — fallback thay bằng nội dung thật có thể làm nhảy bố cục. Xử lý bằng skeleton có kích thước sát nội dung thật, đặt chiều cao tối thiểu hoặc tỷ lệ khung cho vùng ảnh và biểu đồ, và không chia quá nhiều boundary nhỏ.
- **SEO** — bot hiện đại xử lý được HTML stream, nhưng phần nội dung quan trọng cho tìm kiếm (tiêu đề, mô tả, nội dung chính, thẻ meta) thì nên render trong lượt đầu chứ đừng bỏ sau `<Suspense>`; chỉ stream các khối phụ như gợi ý, bình luận, số liệu.

Một lưu ý nữa: đã streaming thì không đặt được HTTP status hay header sau khi response đã mở, nên các quyết định như chuyển hướng hay 404 phải làm trước.

</details>

**13. Khi nào streaming và `Suspense` không đáng dùng, thậm chí làm trang tệ hơn? Ngưỡng nào bạn dùng để quyết định?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi dữ liệu về rất nhanh, streaming chỉ thêm phiền: người dùng thấy một nhịp skeleton loé lên rồi biến mất, kèm nguy cơ giật layout, trong khi render một lần thì mượt hơn. Ngưỡng tham khảo từ bài: dữ liệu dưới khoảng **100ms** thì không cần Suspense; Suspense thật sự phát huy khi dữ liệu mất **trên 500ms**, có nhiều nguồn chạy song song, hoặc người dùng cần thấy phản hồi ngay.

Các trường hợp khác nên tránh:

- **Nội dung cốt lõi cho SEO** — nên nằm trong lượt render đầu.
- **Khối quá nhỏ hoặc quá nhiều boundary** — trang nhấp nháy liên tục, khó chịu hơn là chờ một nhịp.
- **Không có skeleton tử tế** — fallback rỗng gây layout shift lớn.
- **Cần quyết định status code** (redirect, 404) dựa trên dữ liệu đó — phải xử lý trước khi mở stream.

Nguyên tắc chung: streaming là công cụ cho **độ trễ không tránh được**, không phải thứ mặc định rắc lên mọi component.

</details>

**14. Client Component fetch trong `useEffect` tạo ra loại waterfall nào khác với waterfall phía server? Cách nào loại bỏ nó?**

<details className="qa">
<summary>Xem đáp án</summary>

Đó là waterfall **theo tầng tải trang** chứ không chỉ giữa các request: trình duyệt phải tải HTML → tải bundle JS → hydrate → chạy `useEffect` → lúc đó mới gửi request đầu tiên. Nghĩa là request còn chưa bắt đầu tại thời điểm mà Server Component đã trả về dữ liệu xong từ lâu. Nếu component con lại fetch trong `useEffect` dựa vào dữ liệu của cha thì chồng thêm một tầng nữa.

Cách loại bỏ:

- **Chuyển việc lấy dữ liệu lên Server Component** — dữ liệu có sẵn ngay trong HTML đầu tiên, bỏ hẳn hai tầng chờ JS và hydrate.
- **Pattern hybrid** — server lấy dữ liệu khởi tạo rồi truyền xuống làm `initialData` cho TanStack Query, client chỉ refetch khi cần.
- **Prefetch sớm** — bắt đầu request ở component cha và truyền promise xuống, dùng `use()` thay vì `useEffect`.
- **Dùng thư viện client tử tế** — TanStack Query dedupe, cache và chia sẻ dữ liệu giữa các component, tránh mỗi component tự gọi lại.

</details>

**15. Bạn nghi một trang bị waterfall nhưng không chắc ở đâu. Quy trình đo đạc và các công cụ bạn dùng để xác định là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Quy trình từ ngoài vào trong:

1. **Nhìn tổng thể** — mở tab Network của DevTools, bật throttling để phóng đại độ trễ. Dấu hiệu waterfall rất dễ nhận: các thanh thời gian **xếp so le nối đuôi** thay vì chồng lên nhau. So sánh thời gian trang với thời gian từng API riêng lẻ: nếu trang chậm xấp xỉ tổng các API thì gần như chắc chắn là tuần tự.
2. **Khoanh vùng phía server** — log thời điểm bắt đầu và kết thúc quanh mỗi lời gọi dữ liệu, hoặc dùng trace/APM của nền tảng triển khai để xem sơ đồ thời gian theo request. Server Timing header cũng hữu ích.
3. **Đọc lại code theo cây component** — tìm các `await` liên tiếp trên dữ liệu độc lập, và các component con tự `await` mà không có boundary riêng.
4. **Kiểm tra số truy vấn** — bật log của ORM để phát hiện N+1 ẩn sau giao diện chậm.
5. **Sửa và đo lại** — áp `Promise.all`, preload hoặc `<Suspense>` rồi đo lại đúng chỉ số ban đầu để xác nhận cải thiện thật.

</details>

---

## 2. Sensitive Data và Server Actions

Bài học: [2. Sensitive Data và Server Actions](../../nextjs/09-data-fetching-patterns/2_sensitive-data.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Trong App Router, chính xác thì những gì đi qua ranh giới Server sang Client và bị nhúng vào bundle gửi xuống trình duyệt?**

<details className="qa">
<summary>Xem đáp án</summary>

Có hai luồng khác nhau, đều để lộ dữ liệu:

- **Code của Client Component** (`"use client"`) được đóng gói thành JS bundle tải về trình duyệt. Mọi hằng số, biến `process.env.NEXT_PUBLIC_*` viết trong đó đều nằm nguyên trong file JS, ai mở DevTools cũng đọc được.
- **Props truyền từ Server Component xuống Client Component** được serialize thành payload RSC gửi kèm HTML. Đây là điểm dễ sập nhất: truyền nguyên object user thì `passwordHash`, `token`, `role` đều nằm trong payload dù UI không render chúng.

Ngược lại, code chỉ chạy trong Server Component, biến môi trường không có tiền tố `NEXT_PUBLIC_`, và thân hàm của Server Action thì **không** vào bundle. Quy tắc thực hành: mặc định giữ mọi thứ ở server, chỉ đẩy xuống client DTO đã lọc field bằng Prisma `select`.

</details>

**2. Cơ chế của tiền tố `NEXT_PUBLIC_` là gì? Vì sao đổi giá trị biến đó bắt buộc phải build lại chứ không chỉ restart?**

<details className="qa">
<summary>Xem đáp án</summary>

Next.js phân loại env theo tiền tố:

| Prefix | Đọc được ở đâu | Dùng cho |
|---|---|---|
| `DATABASE_URL`, `API_KEY` | Server only | Secret |
| `NEXT_PUBLIC_*` | Server + Client | Public config |

Với biến `NEXT_PUBLIC_*`, lúc build bundler làm **inline thay thế tĩnh**: mọi chỗ viết `process.env.NEXT_PUBLIC_API_URL` bị thay thẳng bằng chuỗi giá trị trong code đã compile. Trên client không hề tồn tại object `process.env` để tra lúc chạy — giá trị đã "đóng băng" vào file JS.

Vì vậy đổi giá trị trong `.env` rồi chỉ restart là vô ích: bundle cũ vẫn giữ chuỗi cũ. Phải **build lại** để bundler inline giá trị mới. Hệ quả bảo mật: bất kỳ secret nào lỡ đặt dưới `NEXT_PUBLIC_*` đều nằm vĩnh viễn trong bundle đã deploy, xoá env sau đó không cứu được — phải rotate key.

</details>

**3. Bạn truyền nguyên object user lấy từ database xuống `Client Component`. Rủi ro cụ thể là gì và bạn sửa như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Rủi ro: object trả về từ ORM chứa đủ cột của bảng — `passwordHash`, `secret_token`, `internalNotes`, `role`, `balance`. Toàn bộ bị serialize vào payload RSC gửi xuống trình duyệt, kể cả khi component chỉ render mỗi `user.name`. Người dùng bình thường không thấy, nhưng xem network/DevTools là đọc được hết.

Cách sửa — whitelist field ngay tại tầng query:

```tsx
const user = await db.user.findUnique({
  where: { id },
  select: { id: true, name: true, email: true },
});
return <UserCard user={user} />;
```

Nên tạo hẳn một hàm DTO dùng chung (ví dụ `toPublicUser`) để mọi chỗ trả user đều đi qua một cửa, thay vì nhớ viết `select` ở từng query. Kết hợp `taint` cho object gốc để React chặn nếu ai đó lỡ truyền full object qua ranh giới.

</details>

**4. Package `server-only` chặn lỗi ở thời điểm nào và bằng cách nào? Nó khác gì với việc chỉ đặt file trong thư mục `lib/server`?**

<details className="qa">
<summary>Xem đáp án</summary>

`server-only` chặn ở **build time**. Thêm một dòng vào đầu file:

```ts
// lib/db.ts
import "server-only";
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();
```

Package này có hai bản export khác nhau cho điều kiện môi trường: khi module graph của client kéo nó vào, bản dành cho client cố tình throw, nên bundler báo lỗi build ngay thay vì âm thầm gói code server vào bundle.

Khác biệt với quy ước thư mục: `lib/server` chỉ là **quy ước đặt tên**, không có gì ép buộc. Một ngày nào đó ai đó viết `import { prisma } from "@/lib/server/db"` trong file `"use client"` thì vẫn compile trót lọt, và code kết nối DB cùng chuỗi credentials có thể rò vào bundle. `server-only` biến quy ước mềm thành lỗi cứng, phát hiện ngay ở CI thay vì lúc production.

</details>

**5. So sánh `Server Action` và `Route Handler` trên các trục: khả năng truy cập bằng URL, HTTP method, type safety, progressive enhancement.**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | Route Handler (API Route) | Server Action |
|---|---|---|
| Truy cập bằng URL | Có, đường dẫn công khai ổn định | Không có URL do mình đặt (endpoint nội bộ do Next.js sinh) |
| HTTP method | GET, POST, PUT, PATCH, DELETE | POST |
| Type safety | Tự khai báo kiểu request/response thủ công | Tự động từ TypeScript — import hàm là có kiểu |
| Progressive enhancement | Không (phải có JS để fetch) | Có — gắn trực tiếp vào `action` của form, chạy được khi JS chưa load |
| Vị trí code | File route riêng | Cùng nơi với feature, import như hàm thường |

Chọn Server Action cho mutation nội bộ (form submit, CRUD) vì gọn và type-safe. Chọn Route Handler khi cần một URL công khai ổn định: webhook, OAuth callback, API cho app mobile hay bên thứ ba.

</details>

**6. `Server Action` không có URL hiển thị, vậy vì sao vẫn phải kiểm tra xác thực và phân quyền ngay đầu function? Kẻ tấn công gọi nó bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì mỗi Server Action sau khi build vẫn là một **endpoint HTTP public**, chỉ là được định danh bằng một action id thay vì đường dẫn đẹp. Id đó nằm ngay trong bundle/payload gửi xuống trình duyệt, nên kẻ tấn công chỉ cần xem source hoặc bắt một request hợp lệ rồi tự gửi lại POST với id đó và payload tuỳ ý — không cần đi qua UI, không cần nút bấm nào tồn tại.

Nghĩa là "chỉ admin mới thấy nút xoá" không phải cơ chế bảo mật. Mỗi action phải tự bảo vệ:

```ts
"use server";
export async function deleteUser(userId: string) {
  const session = await getSession();
  if (session?.role !== "admin") throw new Error("Forbidden");
  await db.user.delete({ where: { id: userId } });
}
```

Coi mỗi Server Action như một API endpoint riêng: validate input, xác thực, kiểm tra quyền sở hữu tài nguyên — never trust the client.

</details>

**7. Biến closure mà `Server Action` bắt được từ scope bên ngoài sẽ đi đâu? Next.js xử lý chúng ra sao và vì sao không nên coi đó là biện pháp bảo mật đủ?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi một Server Action được định nghĩa bên trong Server Component và bắt biến từ scope ngoài, giá trị của biến đó phải **đi xuống client rồi quay lại server** trong request gọi action — vì server không giữ state giữa hai request. Next.js mã hoá các giá trị closure này trước khi gửi, bằng khoá gắn với bản build, nên client không đọc trực tiếp được.

Tuy vậy đừng coi đó là lớp bảo mật đủ:

- Dữ liệu vẫn rời khỏi server và nằm trong tay client dưới dạng blob mã hoá — nó vẫn là bề mặt tấn công, và client có thể gửi lại chính blob đó.
- Khoá phụ thuộc build; nhiều instance phải dùng chung khoá, cấu hình sai là hỏng.

Thực hành an toàn: không đưa API key, token, hay full record nhạy cảm vào closure. Chỉ đóng gói định danh tối thiểu (ví dụ `postId`), rồi load lại dữ liệu và kiểm tra quyền ngay trong thân action.

</details>

**8. Vì sao phải validate `FormData` bằng schema (ví dụ `Zod`) ngay trong `Server Action` dù form phía client đã validate rồi?**

<details className="qa">
<summary>Xem đáp án</summary>

Validation ở client chỉ để **trải nghiệm người dùng** — báo lỗi sớm, đỡ round-trip. Nó không ràng buộc gì với kẻ tấn công: action là endpoint public, ai cũng POST thẳng payload bất kỳ được, bỏ qua toàn bộ form.

Ngoài bảo mật còn lý do kiểu dữ liệu: `formData.get("name")` trả về `FormDataEntryValue | null`, ép kiểu bằng `as string` chỉ là lời hứa suông với compiler. Parse bằng schema mới cho dữ liệu vừa đúng kiểu vừa đúng ràng buộc:

```ts
const result = schema.safeParse({
  name: formData.get("name"),
  email: formData.get("email"),
});
if (!result.success) return { error: result.error.flatten() };
await db.user.create({ data: result.data });
```

Dùng `safeParse` để trả lỗi có cấu trúc cho `useActionState` hiển thị, đồng thời chặn mass assignment: chỉ ghi vào DB đúng các field schema cho phép, không đổ thẳng dữ liệu thô từ client.

</details>

**9. Với `useActionState`, bạn trả lỗi về cho người dùng thế nào mà không rò rỉ chi tiết nội bộ như stack trace hay câu SQL?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: action trả về một **object lỗi do mình tự định hình**, không bao giờ ném nguyên exception gốc ra ngoài.

- Lỗi validation: trả cấu trúc đã chuẩn hoá từ Zod, ví dụ `result.error.flatten()` — chỉ chứa tên field và message thân thiện.
- Lỗi hệ thống (DB down, lỗi bên thứ ba): bắt lại, `console.error` phía server để còn debug, rồi trả về một message chung chung như `"Không lưu được, thử lại sau"`.
- Lỗi phân quyền: trả thông điệp trung tính, tránh tiết lộ tài nguyên có tồn tại hay không.

Phía client, `useActionState` chỉ đọc đúng phần đã lọc:

```tsx
const [state, formAction, isPending] = useActionState(createUser, null);
// state?.error?.fieldErrors.name?.[0]
```

Lưu ý giá trị trả về của action cũng đi qua ranh giới server → client, nên đừng nhét record gốc hay object error của ORM vào đó.

</details>

**10. `taint` API (ví dụ `experimental_taintObjectReference`) giải quyết lớp lỗi nào? Nó bắt lỗi ở thời điểm nào và hạn chế của nó là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Lớp lỗi nó nhắm tới: **vô tình truyền dữ liệu nhạy cảm qua ranh giới Server → Client**, kiểu đưa nguyên object user (có `passwordHash`, `token`) làm props cho Client Component. Thay vì trông chờ code review, bạn đánh dấu ngay tại nguồn:

```ts
import { experimental_taintObjectReference as taint } from "react";

async function getUser(id: string) {
  const user = await db.user.findUnique({ where: { id } });
  taint("Don't pass full user to client", user);
  return user;
}
```

Khi có chỗ nào cố serialize object đã bị taint qua ranh giới, React sẽ throw kèm đúng thông điệp bạn ghi.

Hạn chế:

- Đang là API experimental, cần bật cờ và có thể đổi.
- Chặn theo **tham chiếu object**, nên copy sang object mới hoặc spread field ra là thoát; muốn chặn giá trị riêng lẻ phải dùng biến thể taint giá trị.
- Là lưới an toàn bổ sung, không thay được việc lọc DTO bằng `select`.

</details>

**11. Điều gì bảo vệ `Server Action` khỏi bị gọi chéo trang từ domain khác? Kiểm tra origin và `allowedOrigins` hoạt động ra sao khi có reverse proxy?**

<details className="qa">
<summary>Xem đáp án</summary>

Nhiều lớp cộng lại:

- Server Action chỉ nhận **POST**, nên không bị kích hoạt bởi link hay thẻ `img` đơn thuần.
- Next.js so sánh header `Origin` của request với `Host` của server; lệch nhau thì request bị từ chối — đây là lớp chống CSRF mặc định.
- Cookie phiên nên đặt `SameSite=Lax` (mặc định của trình duyệt) để không bị gửi kèm trong request cross-site.

Vấn đề với reverse proxy: proxy thường ghi đè `Host` thành hostname nội bộ, trong khi `Origin` vẫn là domain người dùng thật, nên so sánh bị lệch và request hợp lệ lại bị chặn. Cách xử lý là khai báo các domain hợp lệ trong `next.config` qua `serverActions.allowedOrigins`, hoặc cấu hình proxy chuyển tiếp đúng header host gốc. Chỉ liệt kê domain mình thực sự sở hữu — đây là allowlist, mở rộng bừa là tự bỏ lớp chống CSRF.

</details>

**12. Một `Server Action` trả về object kết quả cho client. Bạn kiểm soát nội dung trả về thế nào để không vô tình đẩy secret hoặc field nội bộ ra ngoài?**

<details className="qa">
<summary>Xem đáp án</summary>

Giá trị trả về của action cũng bị serialize và gửi xuống trình duyệt y như props, nên phải đối xử với nó như một API response công khai:

- Khai báo **kiểu trả về tường minh** cho action, ví dụ `Promise<{ success: true; id: string } | { error: ... }>`, để TypeScript chặn việc lỡ trả object thừa field.
- Đừng `return` thẳng kết quả của ORM. Map qua DTO hoặc dùng `select` giống như khi truyền props.
- Với mutation, thường chỉ cần trả cờ thành công và id; dữ liệu mới để `revalidatePath` / `revalidateTag` kéo lại từ server.
- Không trả object error gốc (chứa message của driver DB, đôi khi cả câu query hay connection string).

Kết hợp thêm `taint` trên record gốc và review kiểu trả về trong code review; hai thứ này bắt được hầu hết trường hợp lỡ tay.

</details>

**13. Rate limiting cho `Server Action` nên đặt ở đâu và dựa trên khoá nào? Có gì khác so với rate limit một API route thông thường?**

<details className="qa">
<summary>Xem đáp án</summary>

Đặt ở hai chỗ, bổ sung cho nhau:

- **Ngay đầu thân action** — nơi duy nhất biết chắc đang gọi action nào và người dùng nào, nên giới hạn được theo nghiệp vụ (ví dụ 5 lần đổi mật khẩu mỗi giờ).
- **Middleware hoặc lớp edge/WAF phía trước** — chặn lưu lượng thô trước khi chạm vào server và database.

Khoá nên ghép nhiều tầng: id người dùng trong session (chính xác nhất), IP cho khách chưa đăng nhập, cộng thêm định danh của chính action để mỗi thao tác có ngân sách riêng. Bộ đếm phải nằm ở store dùng chung (Redis chẳng hạn) vì serverless có nhiều instance.

Khác với API route: action **không có đường dẫn riêng** để viết rule theo path — mọi action đi qua cùng route và phân biệt bằng action id trong header, nên rule kiểu "giới hạn theo URL" ở tầng proxy gần như vô dụng. Đó là lý do việc chặn trong thân action quan trọng hơn hẳn.

</details>

**14. Liệt kê các tình huống bạn vẫn phải dùng API Route thay vì `Server Action`: webhook, OAuth callback, client mobile. Lý do kỹ thuật của từng cái là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Điểm chung: khi **bên ngoài cần một URL ổn định** hoặc method khác POST thì Server Action không đáp ứng được.

- **Webhook** (Stripe, GitHub): nhà cung cấp cần một URL cố định để đăng ký, và cần đọc raw body cùng header chữ ký để verify. Action không có URL do mình đặt và không phù hợp cho luồng này.
- **OAuth callback**: provider redirect người dùng bằng **GET** kèm `code` và `state` trên query string. Action chỉ nhận POST nên không xử lý được redirect.
- **Client mobile / bên thứ ba**: cần hợp đồng API công khai, ổn định qua các bản build, nhiều method, phiên bản hoá. Action là RPC nội bộ, định danh sinh ra lúc build, không phải API để công bố.
- Ngoài ra: endpoint trả file/stream, health check, cron endpoint — đều cần GET hoặc URL cố định.

Còn lại — form submit, CRUD nội bộ — dùng Server Action gọn và an toàn hơn.

</details>

**15. Mô tả quy trình bạn dùng để audit một codebase Next.js xem có secret nào đang bị đẩy xuống client bundle hay không.**

<details className="qa">
<summary>Xem đáp án</summary>

Quy trình thực dụng, từ rẻ đến tốn công:

1. **Soát biến môi trường**: liệt kê mọi `NEXT_PUBLIC_*` và xác nhận từng cái đúng là công khai (URL API, GA id, publishable key của Stripe). Bất cứ thứ gì trông như `sk_`, `secret`, `token` là báo động đỏ.
2. **Grep trong bundle đã build**: build production rồi tìm chuỗi nhạy cảm trong thư mục output — tên biến secret, tiền tố key, domain nội bộ. Đây là bằng chứng chắc chắn nhất vì nó soi đúng thứ người dùng tải về.
3. **Rà ranh giới server/client**: tìm các file `"use client"` và xem props chúng nhận — có chỗ nào nhận nguyên object từ ORM thay vì DTO không.
4. **Ép bằng công cụ**: thêm `import "server-only"` vào mọi module DB/secret, bật `taint` cho record nhạy cảm, validate env bằng Zod ở startup.
5. **Chốt chặn CI**: chạy secret scanner và bước grep bundle trong pipeline. Secret nào từng lọt ra bundle đã deploy thì phải rotate, xoá code là chưa đủ.

</details>
