---
sidebar_position: 5
title: "5. Structuring Routes"
---

# 5. Structuring Routes

## 1. Structuring Routes và API Endpoints

Bài học: [1. Structuring Routes và API Endpoints](../../nextjs/05-structuring-routes/1_route-structure.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `co-location` là gì? Đặt component và util cạnh route dùng nó mang lại lợi ích cụ thể nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Co-location** là đặt mọi thứ chỉ phục vụ một route — component, util, type, test — **ngay trong thư mục của route đó**, thay vì gom hết vào các thư mục chung theo loại file:

```
app/dashboard/
├── page.tsx
├── components/
│   ├── Chart.tsx       # chỉ dashboard dùng
│   └── StatCard.tsx
├── utils/format.ts
└── types.ts
```

Lợi ích cụ thể:

- **Dễ tìm** — sửa dashboard thì mở đúng một thư mục, không phải nhảy qua lại giữa `components/`, `utils/`, `types/` ở gốc.
- **Dễ xoá** — bỏ một feature là xoá nguyên thư mục, không để lại component mồ côi mà không ai dám xoá vì sợ chỗ khác còn dùng.
- **Cô lập phạm vi** — nhìn vị trí file là biết ngay phạm vi ảnh hưởng: file trong `app/dashboard/` thì sửa nó chỉ ảnh hưởng dashboard.

Điều này làm được nhờ trong App Router, thư mục **chỉ tạo URL khi có `page.tsx`** — đặt file thường ở đó hoàn toàn an toàn.

</details>

**2. Khi nào một component nên được nâng từ thư mục feature lên `components/` ở gốc? Tiêu chí quyết định là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Tiêu chí đơn giản và dứt khoát: **khi nó bắt đầu được dùng ở nơi thứ hai**. Đừng đoán trước "sau này chắc dùng lại" rồi đặt sẵn lên gốc — đó là cách nhanh nhất để `components/` biến thành bãi rác.

Ba tầng đặt code thường dùng:

| Vị trí | Dành cho |
|---|---|
| `app/feature/components/X.tsx` | component **chỉ feature đó** dùng |
| `components/shared/X.tsx` | component dùng ở **nhiều feature** |
| `components/ui/Button.tsx` | primitive của design system (kiểu shadcn/ui) |

Quy trình refactor: feature thứ hai cần dùng → chuyển file lên `components/`, sửa import ở cả hai nơi, và nhân dịp đó rà lại API của component cho đủ tổng quát (bỏ những prop chỉ đúng với feature ban đầu). Đừng cố giữ nó nằm trong thư mục feature rồi import chéo giữa các feature — đó là dấu hiệu rõ ràng của coupling sai hướng và sẽ rất khó gỡ về sau.

</details>

**3. Một thư mục thường trong `app/` có tự tạo route không? `_folder` khác gì so với thư mục thường?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Thư mục trong `app/` chỉ trở thành URL truy cập được khi bên trong có `page.tsx` (hoặc `route.ts`). Vì vậy `app/dashboard/components/Chart.tsx` không hề tạo ra `/dashboard/components` — đây chính là điều làm co-location an toàn.

`_folder` (tên bắt đầu bằng gạch dưới) là **private folder**: Next.js loại nó và toàn bộ cây con ra khỏi hệ thống routing:

```
app/
├── _components/     # private, chắc chắn không bao giờ là route
├── _utils/
└── dashboard/page.tsx
```

Khác biệt thực tế giữa hai cách:

- Thư mục thường: không tạo route **chừng nào chưa có `page.tsx`** — lỡ tay thêm `page.tsx` vào là sinh URL ngoài ý muốn.
- `_folder`: không bao giờ tạo route, kể cả có `page.tsx` bên trong. Nó cũng **tuyên bố rõ ý đồ** cho người đọc code: đây là code nội bộ, không phải route.

Nếu tên thư mục cần bắt đầu bằng ký tự `%5F` thật trong URL thì dùng mã hoá, nhưng trường hợp này rất hiếm.

</details>

**4. Vì sao chỉ `page.tsx` (hoặc `route.ts`) mới làm cho một segment trở nên truy cập được qua URL?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì Next.js tách bạch hai việc: **cấu trúc thư mục mô tả đường dẫn**, còn **file quy ước quyết định cái gì được công khai**. Một thư mục chỉ nói "nếu có route ở đây thì URL sẽ là thế này", nó không tự động mở cửa.

Đây là lựa chọn thiết kế quan trọng vì:

- Cho phép **co-location** — đặt component, util, test, ảnh ngay cạnh route mà không vô tình tạo ra URL rác hay rò rỉ file nội bộ ra ngoài. Ở Pages Router, mỗi file trong `pages/` là một route nên không làm được điều này.
- Cho phép các **file quy ước khác** (`layout.tsx`, `loading.tsx`, `error.tsx`, `template.tsx`, `not-found.tsx`) tồn tại trong cùng thư mục với vai trò riêng, thay vì cũng bị hiểu thành route.
- Phân biệt rõ **route UI** (`page.tsx`) với **route API** (`route.ts`). Hai file này không được nằm cùng một thư mục vì cùng ánh xạ ra một URL — sẽ conflict.

</details>

**5. Cách tạo API endpoint bằng `route.ts` — bạn export những gì để xử lý `GET` và `POST`?**

<details className="qa">
<summary>Xem đáp án</summary>

Tạo file `route.ts` trong thư mục tương ứng với đường dẫn, rồi **export một hàm cho mỗi HTTP method**, tên hàm viết hoa đúng tên method:

```ts
// app/api/users/route.ts
export async function GET() {
  const users = await db.user.findMany();
  return Response.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return Response.json(user, { status: 201 });
}
```

Kết quả: `GET /api/users` trả về danh sách, `POST /api/users` tạo mới.

Những điểm cần nhớ:

- Handler **phải `return` một `Response`**, không có object `res` để ghi vào.
- Các method được hỗ trợ: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.
- Thư mục chứa `route.ts` **không được có `page.tsx`** — cùng một URL không thể vừa là trang vừa là API.
- Không bắt buộc phải đặt trong `app/api/`; đó chỉ là quy ước cho dễ đọc.

</details>

**6. Nếu client gọi một HTTP method chưa có handler tương ứng thì Next.js phản hồi thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Next.js tự trả về **`405 Method Not Allowed`** — bạn không phải viết dòng nào để xử lý.

Ví dụ `app/api/users/route.ts` chỉ export `GET` và `POST`; khi client gửi `DELETE /api/users`, Next.js đáp `405` thay vì `404` hay gọi nhầm handler khác.

Đây là khác biệt đáng chú ý so với Pages Router: ở đó chỉ có một `handler` duy nhất, bạn phải tự viết `switch` theo `req.method` và tự trả `405` cho nhánh mặc định — rất hay bị quên, dẫn tới việc một `POST` nhầm lại chạy đúng logic của `GET`.

Vài điểm liên quan:

- `HEAD` được suy ra từ `GET` nếu bạn không định nghĩa riêng.
- `OPTIONS` được xử lý tự động ở mức cơ bản; nếu cần CORS tuỳ biến thì tự export `OPTIONS` và trả về các header thích hợp.
- Việc tách handler theo method còn giúp code sạch hơn và dễ đọc hơn hẳn so với một khối `switch` dài.

</details>

**7. Route handler đọc body, query string và header ra sao? So sánh với `req.body` và `req.query` của `Pages Router`.**

<details className="qa">
<summary>Xem đáp án</summary>

Route handler dùng đối tượng `Request` chuẩn của web, nên mọi thứ đều là method của nó:

```ts
export async function POST(request: Request) {
  const json = await request.json();        // body JSON
  const form = await request.formData();    // body dạng form
  const auth = request.headers.get("Authorization");
  const id = new URL(request.url).searchParams.get("id");
  return Response.json({ ok: true });
}
```

So với Pages Router:

| Việc cần làm | Pages Router | Route Handler |
|---|---|---|
| Đọc body | `req.body` (đã parse sẵn) | `await request.json()` / `.text()` / `.formData()` |
| Query string | `req.query` | `new URL(request.url).searchParams` |
| Header | `req.headers.x` | `request.headers.get("x")` |
| Trả kết quả | `res.status(200).json(data)` | `return Response.json(data, { status: 200 })` |

Khác biệt tư duy: bên cũ body được parse sẵn và đồng bộ; bên mới body là **stream**, phải `await` và **chỉ đọc được một lần** — gọi `request.json()` hai lần sẽ lỗi. Nếu cần cả body thô lẫn JSON (ví dụ để verify chữ ký webhook) thì đọc `text()` một lần rồi tự `JSON.parse`.

</details>

**8. Vì sao chuyển sang Web Standards `Request`/`Response` lại quan trọng cho Edge Runtime, tính portable và khả năng test?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `Request`/`Response` là API của **nền tảng web**, không phụ thuộc vào Node.js:

- **Edge Runtime** — môi trường edge không có đầy đủ Node API (`http.IncomingMessage`, stream của Node...). Code viết theo Web Standards chạy được ở cả Node runtime lẫn Edge mà không phải phân nhánh.
- **Portable** — cùng một handler về mặt khái niệm chạy được trên Bun, Deno, Cloudflare Workers, Vercel Edge. Cả hệ sinh thái đang đi hướng này: Hono, Bun, Deno đều lấy `Request`/`Response` làm interface chuẩn.
- **Test dễ** — muốn test chỉ cần tạo một `Request` thật rồi kiểm tra `Response` trả về:

```ts
const res = await POST(new Request("http://x/api/users", {
  method: "POST",
  body: JSON.stringify({ name: "A" }),
}));
expect(res.status).toBe(201);
```

Không phải mock cặp `req`/`res` với hàng loạt method nối chuỗi như `res.status().json()`.

- **Streaming sẵn có** — `ReadableStream` là chuẩn, nên SSE hay stream file không cần API riêng của framework.

</details>

**9. Route handler động `app/api/users/[id]/route.ts` nhận `params` như thế nào và cần lưu ý gì ở Next.js 15?**

<details className="qa">
<summary>Xem đáp án</summary>

`params` đến qua **tham số thứ hai** của handler, sau `request`:

```ts
// app/api/users/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await db.user.findUnique({ where: { id } });
  if (!user) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json(user);
}
```

Lưu ý quan trọng ở Next.js 15: **`params` là một `Promise`**, phải `await` mới lấy được giá trị — trước đây nó là object thường. Đây là thay đổi breaking rất hay gặp khi nâng cấp; quên `await` thì `id` sẽ là `undefined` và query trả về rỗng một cách khó hiểu. Điều tương tự cũng áp dụng cho `searchParams` của page, `cookies()` và `headers()`.

Ngoài ra, `id` luôn là `string` lấy thẳng từ URL nên phải **validate trước khi đưa vào truy vấn**, và trả `404` gọn gàng thay vì để lỗi tràn ra ngoài.

</details>

**10. `Route Handler` và `Server Action` khác nhau ở những điểm nào? Trường hợp nào bắt buộc phải dùng Route Handler?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Route Handler | Server Action |
|---|---|---|
| Bản chất | HTTP endpoint có URL công khai | lời gọi hàm server từ component (RPC nội bộ) |
| Ai gọi được | mọi client biết URL | chỉ chính app đó |
| Method | GET, POST, PUT, DELETE... | chỉ POST |
| Kiểu dữ liệu | phải tự khai báo lại ở client | suy ra tự động từ chữ ký hàm |
| Dùng cho | API, webhook, stream | mutation từ form trong app |

Bắt buộc dùng **Route Handler** khi:

- **API công khai** cho client khác — app mobile, đối tác bên thứ ba.
- **Nhận webhook** từ Stripe, GitHub... vì bên ngoài chỉ gọi được URL HTTP.
- **OAuth callback** — nhà cung cấp redirect về một URL cụ thể.
- **Stream / SSE / tải file** với header và định dạng phản hồi tuỳ biến.

Còn lại, trong App Router đa số mutation qua form nên dùng **Server Action** vì gọn hơn, type-safe và không phải tự dựng endpoint chỉ để app tự gọi chính mình.

</details>

**11. Server Action có an toàn hơn Route Handler không? Bạn validate input và kiểm soát quyền truy cập ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Server Action tuy không có URL để gõ vào trình duyệt, nhưng nó vẫn là một endpoint HTTP được sinh ra và có thể bị gọi trực tiếp. Chữ ký hàm có kiểu rõ ràng chỉ giúp ích **lúc viết code**, không phải rào chắn lúc chạy — TypeScript biến mất sau khi build.

Vì vậy Server Action phải được đối xử **y hệt một API công khai**:

- **Validate input ở server** bằng schema (Zod...) cho mọi trường, kể cả trường "chắc chắn đúng" vì đã validate ở form phía client.
- **Kiểm tra xác thực ngay trong từng action**, không dựa vào việc "nút này chỉ hiện với admin" — UI ẩn không phải là bảo mật.
- **Kiểm tra phân quyền theo từng bản ghi**: người dùng đăng nhập rồi vẫn phải xác minh họ sở hữu bản ghi đang sửa.
- **Không trả lỗi kỹ thuật ra ngoài** — log chi tiết ở server, trả thông điệp chung cho client.

Cùng bộ nguyên tắc đó áp dụng nguyên vẹn cho Route Handler; khác biệt duy nhất là Route Handler còn cần nghĩ thêm về CORS và rate limit vì nó công khai.

</details>

**12. Làm sao tập trung xử lý authentication và error cho nhiều route handler mà không lặp code ở từng file?**

<details className="qa">
<summary>Xem đáp án</summary>

Viết một **hàm wrapper dùng chung** rồi để mỗi handler chỉ còn phần nghiệp vụ:

```ts
// lib/api.ts
export async function withAuth<T>(
  request: Request,
  handler: (user: User) => Promise<T>
): Promise<Response> {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const user = await verifyToken(token);
    return Response.json(await handler(user));
  } catch (err) {
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
```

```ts
// app/api/profile/route.ts
export async function GET(request: Request) {
  return withAuth(request, async (user) =>
    db.user.findUnique({ where: { id: user.id } })
  );
}
```

Lợi ích: auth và xử lý lỗi nằm một chỗ, mọi route ngắn và nhất quán về định dạng phản hồi. Có thể xếp chồng thêm các wrapper khác (validate schema, rate limit, logging).

Bổ sung: những việc chạy trước mọi request theo pattern URL — chặn khu vực cần đăng nhập, redirect, thêm header — nên đặt ở `middleware.ts` thay vì lặp trong từng handler.

</details>

**13. Route handler có được cache không? Điều gì khiến một handler `GET` chuyển thành dynamic?**

<details className="qa">
<summary>Xem đáp án</summary>

Ở Next.js 15, route handler **mặc định không được cache** — mỗi request đều chạy lại handler. (Ở các bản trước, handler `GET` "thuần" từng được cache mặc định, và sự thay đổi này gây khá nhiều bất ngờ khi nâng cấp, nên câu hỏi thường xoay quanh đúng chỗ đó.)

Muốn cache thì phải **chủ động khai báo** trong file route:

```ts
export const dynamic = "force-static";   // ép render tĩnh lúc build
export const revalidate = 3600;          // làm mới sau mỗi giờ
```

Những thứ khiến một handler **không thể tĩnh** (luôn dynamic):

- Dùng tham số `request` — đọc `request.url`, header, body.
- Dùng `cookies()` hoặc `headers()`.
- Là method khác `GET` (`POST`, `PUT`, `DELETE`... luôn chạy động).
- Khai báo `export const dynamic = "force-dynamic"`.

Nguyên tắc chung: phản hồi phụ thuộc vào **đặc điểm của từng request** thì không thể cache chung cho mọi người. Endpoint trả dữ liệu riêng của người dùng mà lại bị cache là một lỗi bảo mật nghiêm trọng, nên hãy kiểm tra kỹ trước khi bật cache.

</details>

**14. Nhận webhook từ bên thứ ba (Stripe, GitHub) trong route handler cần lưu ý gì về body thô, chữ ký và idempotency?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba điểm phải làm đúng:

- **Body thô** — chữ ký được tính trên **chuỗi byte gốc**, nên phải đọc `await request.text()` rồi mới `JSON.parse` từ chính chuỗi đó. Nếu parse ra object rồi `stringify` lại để verify, chỉ cần khác một dấu cách hay thứ tự khoá là chữ ký sai. Nhớ rằng body chỉ đọc được một lần.
- **Verify chữ ký** — lấy header chữ ký (ví dụ `Stripe-Signature`, `X-Hub-Signature-256`), tính HMAC bằng secret lưu trong biến môi trường và so sánh bằng hàm **so sánh thời gian hằng định** để tránh timing attack. Chưa verify xong thì **chưa xử lý gì cả** — endpoint webhook là công khai, ai cũng gọi được. Nhiều nhà cung cấp còn kèm timestamp để chặn replay, nên hãy từ chối sự kiện quá cũ.
- **Idempotency** — webhook có thể được gửi lại nhiều lần cho cùng một sự kiện. Lưu `event.id` đã xử lý vào DB và bỏ qua nếu đã thấy, để không trừ tiền hay gửi mail hai lần.

Cuối cùng: trả `2xx` thật nhanh rồi đẩy việc nặng sang hàng đợi — nhà cung cấp sẽ retry nếu bạn phản hồi chậm hoặc lỗi.

</details>

**15. Với một app lớn, bạn tổ chức thư mục theo feature hay theo loại file? Hãy lập luận và mô tả cấu trúc bạn đề xuất.**

<details className="qa">
<summary>Xem đáp án</summary>

**Theo feature** cho phần lớn code, chỉ để lại ở gốc những thứ thực sự dùng chung. Lý do: người ta sửa code theo **tính năng**, không theo loại file — gom theo loại khiến một thay đổi nhỏ phải mở năm thư mục khác nhau, và không ai dám xoá file vì không biết còn ai dùng.

Cấu trúc đề xuất:

```
app/
├── (marketing)/          # nhóm public, layout riêng
│   ├── layout.tsx
│   └── pricing/page.tsx
├── (app)/                # nhóm sau đăng nhập
│   ├── layout.tsx
│   └── dashboard/
│       ├── page.tsx
│       ├── _components/  # chỉ dashboard dùng
│       └── _utils/
├── api/users/route.ts
└── layout.tsx
components/
├── ui/                   # primitive design system
└── shared/               # component dùng nhiều feature
lib/                      # logic dùng chung: db, auth, api wrapper
```

Ba nguyên tắc đi kèm: route group `(name)` để tách layout mà URL vẫn sạch; `_folder` cho code nội bộ của feature; và chỉ nâng một file lên gốc **khi nó có người dùng thứ hai**, không nâng sẵn theo dự đoán.

</details>

---

## 2. Static vs Dynamic, Streaming, Redirects

Bài học: [2. Static vs Dynamic, Streaming, Redirects](../../nextjs/05-structuring-routes/2_static-vs-dynamic.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt `static rendering` và `dynamic rendering` trong Next.js: mỗi kiểu render lúc nào, HTML được tạo ra ở đâu và cache ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Static rendering | Dynamic rendering |
|---|---|---|
| Render lúc nào | lúc **build** (hoặc lúc revalidate) | lúc **mỗi request** |
| HTML tạo ở đâu | máy build, một lần cho mọi người | server, riêng cho từng request |
| Cache ở đâu | CDN / edge, phục vụ ngay | không cache chung được |
| Tốc độ | nhanh nhất, gần như tức thì | chậm hơn, phụ thuộc thời gian fetch |
| Dùng cho | landing page, blog, tài liệu | giỏ hàng, dashboard, trang cá nhân hoá |

Điểm mấu chốt: static nghĩa là **một bản HTML dùng chung cho tất cả mọi người**, nên mới cache được trên CDN. Khi nội dung phụ thuộc vào người đang xem (cookie, header, query string) thì không thể dùng chung, buộc phải render lại theo từng request.

Trong build report bạn thấy ký hiệu phân biệt: `○` cho static, `ƒ` cho dynamic, `●` cho ISR. Đây là chỗ đầu tiên nên kiểm tra khi nghi ngờ một trang bị rơi sang dynamic ngoài ý muốn.

</details>

**2. Next.js dựa vào đâu để tự động quyết định một route là static hay dynamic? Kể các API/tình huống làm route bị chuyển sang dynamic.**

<details className="qa">
<summary>Xem đáp án</summary>

Next.js **không bắt bạn khai báo** — nó nhìn vào code xem route có dùng thứ gì phụ thuộc request hay không. Không dùng gì thì mặc định là static.

Những thứ đẩy route sang **dynamic**:

- `cookies()` và `headers()` từ `next/headers`.
- Đọc prop `searchParams` của page.
- `fetch(url, { cache: "no-store" })`.
- `export const revalidate = 0`.
- `export const dynamic = "force-dynamic"`.
- Route handler dùng đối tượng `request`, hoặc method khác `GET`.

Còn lại vẫn static:

| Page dùng | Kết quả |
|---|---|
| `fetch()` không option | Static |
| `params` đơn thuần | Static (kèm `generateStaticParams`) |
| `fetch` với `next: { revalidate: n }` | Static có làm mới định kỳ (ISR) |

Cơ chế này rất tiện nhưng cũng dễ "rò rỉ": chỉ cần một component con sâu bên trong gọi `cookies()` là cả route mất tính tĩnh, nên khi tối ưu phải rà cả cây component.

</details>

**3. Vì sao chỉ cần gọi `cookies()` hay `headers()` trong một component là cả route bị đẩy sang dynamic? Điều đó ảnh hưởng gì tới CDN cache?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì đơn vị được render và cache là **cả route**, không phải từng component. Khi một component bất kỳ trong cây đọc cookie hay header, kết quả HTML của route đó **khác nhau giữa các người dùng**, nên Next.js không còn cách nào dựng sẵn một bản dùng chung lúc build — buộc phải render lại theo từng request.

Ảnh hưởng tới CDN:

- Trang mất khả năng cache chung trên edge, mỗi request phải đi về tận server gốc — TTFB tăng, tải lên server tăng.
- Nếu vẫn cố cache một trang phụ thuộc cookie thì hậu quả là **rò rỉ dữ liệu**: người dùng A nhìn thấy giỏ hàng hay thông tin cá nhân của người dùng B. Đây chính là lý do Next.js chủ động chặn, chứ không để bạn tự xoay xở.

Cách giảm thiệt hại: đừng để phần cá nhân hoá lan ra cả trang. Giữ khung trang tĩnh, đẩy phần đọc cookie xuống một component nhỏ và bọc trong `Suspense` để nó stream riêng, hoặc lấy dữ liệu đó từ phía client sau khi trang đã hiển thị.

</details>

**4. `fetch(url)` mặc định, `fetch(url, { cache: "no-store" })` và `export const revalidate = 60` khác nhau thế nào về kết quả render?**

<details className="qa">
<summary>Xem đáp án</summary>

| Cách viết | Hành vi |
|---|---|
| `fetch(url)` mặc định | không ép route thành dynamic — route vẫn có thể được render tĩnh và phục vụ từ cache |
| `fetch(url, { cache: "no-store" })` | luôn gọi lại nguồn dữ liệu, đẩy route sang **dynamic**, render mỗi request |
| `export const revalidate = 60` | route vẫn **static**, nhưng bản dựng sẵn được làm mới sau mỗi 60 giây — đây chính là ISR |

Cách chọn:

- Dữ liệu gần như không đổi (nội dung marketing, tài liệu) → để mặc định.
- Dữ liệu phải chính xác tuyệt đối tại thời điểm xem (số dư, tồn kho lúc thanh toán) → `no-store`.
- Dữ liệu đổi vừa phải và chịu được trễ vài chục giây (giá sản phẩm, danh sách bài viết) → `revalidate`, vì nó cho tốc độ của static mà vẫn tươi.

Lưu ý: `revalidate` còn khai báo được ở mức từng lời gọi `fetch` qua `next: { revalidate: n }`, cho phép các phần dữ liệu khác nhau trong cùng trang có nhịp làm mới khác nhau.

</details>

**5. `ISR` (Incremental Static Regeneration) hoạt động ra sao? Người dùng đầu tiên sau khi hết hạn `revalidate` nhìn thấy dữ liệu cũ hay mới?**

<details className="qa">
<summary>Xem đáp án</summary>

ISR là **static có hạn sử dụng**: trang được dựng sẵn và phục vụ từ cache, nhưng sau khoảng thời gian `revalidate` thì bản cache bị đánh dấu là cũ và sẽ được dựng lại.

Người dùng đầu tiên đến sau khi hết hạn **vẫn nhận bản cũ**. Đây là mô hình *stale-while-revalidate*: phục vụ ngay bản cache có sẵn để không ai phải chờ, đồng thời kích hoạt việc dựng lại **ở nền**. Khi bản mới xong, nó thay thế bản cũ trong cache và những người đến sau mới thấy dữ liệu mới.

```tsx
export const revalidate = 60; // bản dựng sẵn "sống" 60 giây
```

Hệ quả cần nói rõ với team:

- Không bao giờ có ai phải chờ build — đổi lại, dữ liệu có thể trễ tới khoảng `revalidate` cộng thêm thời gian dựng lại.
- Không phù hợp cho dữ liệu buộc phải chính xác tức thời.
- Khi cần cập nhật ngay sau một thao tác (ví dụ vừa sửa bài viết trong CMS), dùng revalidate theo yêu cầu bằng `revalidatePath` hoặc `revalidateTag` thay vì chờ hết hạn.

</details>

**6. Giải thích 4 giá trị của `export const dynamic`: `auto`, `force-static`, `force-dynamic`, `error`. Khi nào bạn thực sự cần ép thay vì để tự detect?**

<details className="qa">
<summary>Xem đáp án</summary>

| Giá trị | Ý nghĩa |
|---|---|
| `auto` | mặc định — Next.js tự suy ra từ code, ưu tiên static khi có thể |
| `force-static` | ép render tĩnh; các API động sẽ không cho giá trị thật |
| `force-dynamic` | ép render mỗi request, bỏ qua mọi cơ hội cache |
| `error` | giữ tĩnh và **báo lỗi lúc build** nếu code dùng API động |

Đa số trường hợp nên để `auto`. Chỉ ép khi có lý do cụ thể:

- **`force-dynamic`** — trang lấy dữ liệu đổi liên tục nhưng không tình cờ dùng API động nào, nên bị Next.js hiểu nhầm là tĩnh.
- **`force-static`** — trang chỉ gọi API bên ngoài và bạn muốn chốt nội dung tại thời điểm build.
- **`error`** — hữu ích nhất trong thực tế: dùng như một **rào chắn**. Bạn tuyên bố "trang này phải tĩnh", và nếu ai đó lỡ thêm `cookies()` vào một component con thì build gãy ngay, thay vì âm thầm mất hiệu năng mà vài tuần sau mới phát hiện.

</details>

**7. Điều gì xảy ra nếu code dùng `cookies()` nhưng route lại khai báo `dynamic = "force-static"`? Bạn xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai khai báo mâu thuẫn nhau: bạn bảo "hãy dựng sẵn một bản dùng chung" trong khi code lại đòi dữ liệu riêng của từng người. Next.js không thể chiều cả hai — kết quả là **build báo lỗi**, hoặc các API động không trả về giá trị thật (cookie rỗng), dẫn tới trang render sai một cách khó hiểu.

Cách xử lý, tuỳ vào ý định thật sự:

- **Trang đúng là cần cá nhân hoá** → bỏ `force-static`, để `auto` và chấp nhận route là dynamic.
- **Trang đúng là nên tĩnh, chỉ một phần nhỏ cần cookie** → giữ khung trang tĩnh, tách phần đọc cookie ra component riêng bọc trong `Suspense` để nó stream động, hoặc chuyển phần đó sang Client Component lấy dữ liệu sau khi trang đã hiện.
- **Không rõ vì sao route bị dynamic** → dùng `dynamic = "error"` để build chỉ đúng chỗ đang gọi API động.

Nguyên tắc chung: khai báo phải **khớp với code thực tế**, đừng dùng `force-*` để che giấu một vấn đề kiến trúc.

</details>

**8. `streaming` với `<Suspense>` hoạt động ra sao ở tầng HTTP? Vì sao nó cải thiện `TTFB` và cảm nhận tốc độ của người dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

Ở tầng HTTP, server **không đóng response ngay** mà giữ kết nối mở và gửi HTML thành nhiều mảnh (chunked transfer). Mảnh đầu tiên là "shell" — phần đã render xong cùng các fallback của `Suspense`. Mỗi khi một component bất đồng bộ hoàn tất, server đẩy tiếp một mảnh HTML kèm đoạn script nhỏ để thay thế đúng vị trí fallback.

Vì sao tốt hơn:

- **TTFB giảm** — byte đầu tiên rời server ngay khi shell sẵn sàng, không phải chờ lời gọi dữ liệu chậm nhất. Trước đây toàn bộ trang bị chặn bởi phần chậm nhất.
- **Cảm nhận tốc độ tăng** — người dùng thấy header, khung trang và skeleton gần như tức thì, biết rằng trang đang hoạt động thay vì nhìn màn hình trắng.
- **Nội dung quan trọng lên trước** — bạn chủ động quyết định phần nào nằm trong shell, phần nào chờ được.

Lưu ý: streaming **không làm dữ liệu về nhanh hơn**; nó chỉ sắp xếp lại thứ tự hiển thị để người dùng không phải chờ tất cả cùng một lúc.

</details>

**9. Có 2 khối dữ liệu chậm 2s và 3s trong cùng một page: đặt chúng trong 2 `<Suspense>` riêng so với không dùng `<Suspense>` thì tổng thời gian khác nhau thế nào và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

```tsx
<Suspense fallback={<StatsSkeleton />}>
  <Stats />   {/* fetch 2s */}
</Suspense>

<Suspense fallback={<ChartSkeleton />}>
  <Chart />   {/* fetch 3s */}
</Suspense>
```

- **Không dùng `Suspense`, await tuần tự trong cùng một component:** hai lời gọi nối đuôi nhau, tổng là **2s + 3s = 5s**, và trong suốt 5s đó người dùng không thấy gì cả.
- **Hai `Suspense` riêng:** hai component bắt đầu fetch cùng lúc và render độc lập, tổng là **max(2s, 3s) = 3s**. Hơn nữa shell xuất hiện gần như tức thì, `Stats` hiện ở giây thứ 2, `Chart` ở giây thứ 3.

Lý do: mỗi ranh giới `Suspense` là một đơn vị chờ riêng, nên phần chậm không chặn phần nhanh, và Next.js khởi động các nhánh song song thay vì nối tiếp.

Lưu ý: nếu vẫn viết `await fetchStats()` rồi `await fetchChart()` trong **cùng một** component thì dù có bọc `Suspense` cũng vẫn là 5s — muốn song song phải tách thành hai component, hoặc dùng `Promise.all`.

</details>

**10. `loading.tsx` khác gì với việc bọc `<Suspense>` thủ công quanh từng section? Khi nào nên dùng cả hai cùng lúc?**

<details className="qa">
<summary>Xem đáp án</summary>

`loading.tsx` tương đương việc Next.js tự bọc một `Suspense` quanh **toàn bộ page** ở mức điều hướng:

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <PageSkeleton />;
}
// ≈ <Suspense fallback={<PageSkeleton />}><DashboardPage /></Suspense>
```

Khác biệt:

| | `loading.tsx` | `Suspense` thủ công |
|---|---|---|
| Phạm vi | cả page | từng section bạn chọn |
| Kích hoạt | khi điều hướng tới route | khi component bên trong đang chờ dữ liệu |
| Mức kiểm soát | thô, chỉ một fallback | chi tiết, mỗi vùng một skeleton |

Nên dùng **cả hai** cho trải nghiệm tốt nhất: `loading.tsx` lo khoảnh khắc chuyển trang để người dùng thấy phản hồi ngay sau khi bấm; bên trong page, bọc `Suspense` quanh từng khối dữ liệu chậm để header và phần nhẹ hiện trước, các widget nặng stream sau. Phần render được ngay (tiêu đề, nav) thì để ngoài mọi ranh giới `Suspense`.

</details>

**11. Đặt `<Suspense>` sai chỗ có thể gây hại gì (ví dụ layout shift, fallback nhấp nháy, hoặc không stream được)? Bạn chọn ranh giới `Suspense` theo tiêu chí nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Các kiểu sai thường gặp:

- **Bọc quá rộng** — quấn `Suspense` quanh gần hết trang thì chỉ còn một khối chờ khổng lồ, mất hẳn lợi ích stream: người dùng nhìn một skeleton to tướng đúng như khi chưa có streaming.
- **Bọc quá hẹp và quá nhiều** — hàng chục skeleton nhỏ hiện rồi biến mất lệch nhịp, tạo cảm giác giật và nhấp nháy.
- **Fallback không cùng kích thước với nội dung thật** — khi nội dung thay chỗ skeleton, layout nhảy (CLS xấu).
- **Fallback quá "nhẹ"** cho nội dung về rất nhanh — nó chỉ loé lên vài chục mili giây rồi mất, gây nhiễu hơn là hữu ích.

Tiêu chí chọn ranh giới:

- Đặt quanh **một khối dữ liệu độc lập** có nghĩa với người dùng: bảng thống kê, biểu đồ, danh sách bình luận.
- Phần nào render được ngay thì để **ngoài** mọi ranh giới, để nó vào shell.
- Skeleton nên **chiếm đúng kích thước** của nội dung thật.
- Dữ liệu nhanh và ổn định thì đừng bọc; chỉ bọc cái thực sự chậm.

</details>

**12. So sánh `redirect()` và `permanentRedirect()` của `next/navigation`, và mã trạng thái HTTP tương ứng.**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều chuyển hướng phía server, khác nhau ở **tính vĩnh viễn** và do đó ở mã trạng thái:

| | `redirect()` | `permanentRedirect()` |
|---|---|---|
| Ý nghĩa | tạm thời | vĩnh viễn |
| Mã HTTP | **307** | **308** |
| Trình duyệt / SEO | không ghi nhớ, không chuyển "sức mạnh" SEO | được cache, công cụ tìm kiếm chuyển sang URL mới |

Vì sao dùng 307/308 thay cho 302/301 cũ: hai mã mới **giữ nguyên HTTP method và body** của request gốc, nên một `POST` vẫn là `POST` sau khi chuyển hướng — tránh lỗi âm thầm khi redirect trong Server Action.

Khi nào dùng cái nào:

- **`redirect()`** cho điều kiện thay đổi theo ngữ cảnh: chưa đăng nhập thì về `/login`, xử lý xong form thì sang trang kết quả.
- **`permanentRedirect()`** khi URL đã đổi hẳn: đổi cấu trúc đường dẫn, gộp trang, di chuyển tên miền.

Cẩn thận với 308: trình duyệt cache rất lâu, đặt nhầm thì người dùng bị kẹt ở URL sai cho tới khi xoá cache.

</details>

**13. Vì sao `redirect()` không cần `return` và code sau nó không chạy? Đặt `redirect()` trong khối `try/catch` gây lỗi gì và cách khắc phục?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `redirect()` **ném ra một lỗi đặc biệt** (`NEXT_REDIRECT`) chứ không return. Lỗi này bay lên trên và được Next.js bắt để phát ra phản hồi chuyển hướng, nên mọi dòng sau nó là code không bao giờ chạy:

```ts
await save();
redirect("/success");
console.log("không bao giờ chạy");
```

Vấn đề với `try/catch`: khối `catch` của bạn sẽ **nuốt mất** lỗi đó, Next.js không nhận được tín hiệu, và kết quả là chuyển hướng không xảy ra — thường kèm theo một thông báo lỗi lạ do code chạy tiếp trong trạng thái không mong đợi.

Hai cách khắc phục:

```ts
// Cách 1 — đặt redirect NGOÀI try/catch (khuyến nghị)
try {
  await dangerous();
} catch (err) {
  // xử lý lỗi thật
}
redirect("/done");

// Cách 2 — nhận ra và ném lại
try {
  await dangerous();
  redirect("/done");
} catch (err) {
  if (isRedirectError(err)) throw err;
  // xử lý lỗi thật
}
```

Cách 1 gọn và ít rủi ro hơn, nên ưu tiên.

</details>

**14. So sánh `redirect` và `rewrite`: URL trên thanh địa chỉ, số lần round-trip, và use case điển hình của từng loại.**

<details className="qa">
<summary>Xem đáp án</summary>

| | Redirect | Rewrite |
|---|---|---|
| URL trên thanh địa chỉ | **đổi** sang đích | **giữ nguyên** URL người dùng gõ |
| Round-trip | 2 lượt — server trả 3xx, trình duyệt gọi lại URL mới | 1 lượt — server tự lấy nội dung từ đích và trả về |
| Trình duyệt có biết không | có, thấy rõ trong network | không, hoàn toàn trong suốt |
| Ảnh hưởng SEO | báo cho công cụ tìm kiếm là URL đã đổi | URL công khai không đổi |

Use case điển hình:

- **Redirect** — URL cũ đã bỏ, gộp trang trùng nội dung, chặn người chưa đăng nhập và đưa về `/login`, chuẩn hoá đường dẫn.
- **Rewrite** — proxy API (frontend gọi `/api/x`, Next.js chuyển tiếp sang backend khác để tránh CORS và giấu domain nội bộ), A/B test hai phiên bản trên cùng một URL, giữ URL cũ đẹp trong khi nội dung đã chuyển sang đường dẫn mới.

Nói ngắn gọn: redirect **thay đổi thứ người dùng thấy**, rewrite **thay đổi thứ server lấy về**.

</details>

**15. Khi nào bạn cấu hình `redirects`/`rewrites` trong `next.config.ts` thay vì gọi `redirect()` trong component, và ngược lại?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng **`next.config.ts`** khi quy tắc mang tính **hạ tầng**, áp theo mẫu URL và không cần biết gì về dữ liệu:

```ts
redirects: async () => [
  { source: "/old-blog/:slug", destination: "/blog/:slug", permanent: true },
];
```

Phù hợp cho: đổi cấu trúc URL sau khi tái cấu trúc site, gom tên miền, proxy API. Ưu điểm là quy tắc chạy rất sớm, nằm một chỗ dễ rà soát, và không cần render trang nào cả.

Dùng **`redirect()` trong component hoặc Server Action** khi quyết định **phụ thuộc vào dữ liệu hoặc nghiệp vụ**:

```ts
const user = await getCurrentUser();
if (!user) redirect("/login");
if (!user.hasPaid) redirect("/billing");
```

Phù hợp cho: kiểm tra đăng nhập/phân quyền, chuyển hướng sau khi lưu form, điều hướng theo trạng thái tài khoản.

Còn `middleware.ts` nằm ở giữa: chạy trước mọi request, xem được cookie và header nên làm được các quy tắc đơn giản dựa trên phiên đăng nhập, nhưng không nên nhét truy vấn cơ sở dữ liệu nặng vào đó.

</details>

**16. Set security header (`X-Frame-Options`, `Content-Security-Policy`...) qua `headers` trong `next.config.ts` có lợi gì so với dùng thẻ `meta` trong HTML?**

<details className="qa">
<summary>Xem đáp án</summary>

Header HTTP mạnh hơn hẳn thẻ `meta` vì nó là **hợp đồng ở tầng giao thức**, do server phát ra trước cả khi trình duyệt bắt đầu dựng trang:

- **Áp dụng cho mọi phản hồi**, kể cả ảnh, file JSON, API — thẻ `meta` chỉ tồn tại trong tài liệu HTML.
- **Nhiều chính sách chỉ hoạt động ở dạng header** — `X-Frame-Options`, `Strict-Transport-Security`, `X-Content-Type-Options` bị bỏ qua nếu đặt bằng `meta`.
- **Có hiệu lực sớm hơn** — trình duyệt biết luật trước khi parse HTML, nên không có khe hở cho nội dung độc hại chạy trước.
- **Không sửa được từ phía client** — script trên trang không thể gỡ một header, nhưng có thể xoá thẻ `meta` khỏi DOM.
- **Cấu hình tập trung** — khai báo một lần cho `source: "/(.*)"` là cả site được bảo vệ, không phụ thuộc lập trình viên có nhớ thêm thẻ vào từng layout hay không.

</details>

**17. `export const runtime = "edge"` ảnh hưởng gì tới khả năng render static/dynamic và tới những API bạn được dùng trong route?**

<details className="qa">
<summary>Xem đáp án</summary>

Khai báo này chuyển route sang chạy trên **Edge Runtime** — môi trường nhẹ, gọn, đặt gần người dùng về mặt địa lý, thay cho Node.js mặc định.

Ảnh hưởng tới API được dùng — đây mới là phần quan trọng:

- Chỉ có **Web Standards**: `fetch`, `Request`, `Response`, `URL`, `TextEncoder`, Web Crypto.
- **Không có API Node**: `fs`, `net`, `child_process`, và các thư viện dùng native module. Nhiều driver cơ sở dữ liệu kết nối TCP trực tiếp cũng không chạy — phải dùng bản giao tiếp qua HTTP.
- Giới hạn **kích thước bundle** chặt hơn và thời gian thực thi ngắn hơn.

Ảnh hưởng tới kiểu render: edge nghiêng hẳn về **dynamic** — lợi ích của nó là xử lý request ngay tại điểm gần người dùng với cold start rất thấp, chứ không phải dựng sẵn lúc build.

Vì vậy chỉ nên chọn `edge` cho những route nhẹ, nhạy độ trễ (kiểm tra phiên, cá nhân hoá đơn giản, chuyển hướng theo vùng). Route cần thư viện nặng hoặc truy cập hệ thống thì cứ để `nodejs`.

</details>

**18. Một trang sản phẩm e-commerce cần vừa nhanh vừa có giá cập nhật gần thời gian thực: bạn chọn chiến lược render nào và giải thích trade-off?**

<details className="qa">
<summary>Xem đáp án</summary>

Không chọn một kiểu cho cả trang, mà **chia trang theo độ tươi của từng phần**:

- **Khung sản phẩm tĩnh hoặc ISR** — tên, mô tả, ảnh, thông số hầu như không đổi. Dùng `generateStaticParams` cho các sản phẩm bán chạy, kèm `revalidate` khoảng vài phút. Phần này được cache CDN nên hiện gần như tức thì.
- **Giá và tồn kho stream riêng** — tách thành component bọc trong `Suspense`, lấy dữ liệu với `cache: "no-store"`. Người dùng thấy toàn bộ trang ngay, ô giá hiện skeleton trong vài trăm mili giây rồi điền vào.
- **Làm mới chủ động** — khi giá đổi trong hệ thống quản trị, gọi `revalidateTag` để đẩy bản mới thay vì chờ hết hạn.

Trade-off phải nói rõ:

- Kiến trúc phức tạp hơn một trang `force-dynamic` thuần.
- Trong khoảnh khắc đầu, giá chưa có — nếu skeleton không đúng kích thước sẽ gây layout shift.
- Vẫn có cửa sổ dữ liệu cũ rất ngắn; ở bước thanh toán phải **xác thực lại giá ở server**, tuyệt đối không tin con số đang hiển thị trên trang.

</details>
