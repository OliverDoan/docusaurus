---
sidebar_position: 6
title: "6. Middleware"
---

# 6. Middleware

## 1. Middleware Basics

Bài học: [1. Middleware Basics](../../nextjs/06-middleware/1_middleware-basics.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `middleware` trong Next.js là gì và nó chạy ở thời điểm nào trong vòng đời một request?**

<details className="qa">
<summary>Xem đáp án</summary>

Middleware là đoạn code chạy **trước khi request tới được route đích** — trước cả khi Next.js quyết định render page nào hay gọi route handler nào:

```
Request → Middleware → Match route → Render → Response
              ↓
    redirect / rewrite / set header / trả response sớm
```

Vì chạy sớm và áp cho nhiều path cùng lúc, nó là chỗ tự nhiên để đặt các việc mang tính **chắn cổng**: kiểm tra token đăng nhập, chuyển hướng theo ngôn ngữ, chia nhánh A/B, chặn bot, gắn header.

So với việc viết kiểm tra trong từng page:

- Không phải lặp cùng một đoạn `if (!token) redirect("/login")` ở mọi trang.
- Xử lý **sớm hơn** — chặn ngay ở edge, không tốn công bắt đầu render một trang rồi mới bỏ.

Middleware mặc định chạy trên **Edge Runtime**, gần người dùng về mặt địa lý nên độ trễ rất thấp.

</details>

**2. File `middleware.ts` phải đặt ở đâu, export những gì, và Next.js gọi nó ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Đặt `middleware.ts` ở **thư mục gốc của project**, cùng cấp với `app/` (nếu dùng thư mục `src/` thì đặt trong `src/`). Tên file là bắt buộc — Next.js tìm đúng tên này.

Export hai thứ:

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: "/dashboard/:path*",
};
```

- **`middleware(request)`** — hàm xử lý, nhận một `NextRequest` (mở rộng từ `Request` chuẩn, thêm các tiện ích như `request.cookies` và `request.nextUrl`). Hàm có thể là `async`.
- **`config.matcher`** — khai báo những đường dẫn mà middleware được áp dụng. Bỏ qua thì middleware chạy cho **mọi** request, kể cả file tĩnh.

Next.js gọi hàm này cho từng request khớp matcher và dùng giá trị trả về để quyết định tiếp: đi tiếp, chuyển hướng, viết lại đường dẫn, hay trả về ngay.

</details>

**3. Kể các giá trị trả về hợp lệ từ middleware (`NextResponse.next()`, `.redirect()`, `.rewrite()`, response tự tạo) và hệ quả của từng loại.**

<details className="qa">
<summary>Xem đáp án</summary>

| Giá trị trả về | Hệ quả |
|---|---|
| `NextResponse.next()` | cho request đi tiếp tới route bình thường; vẫn gắn thêm được header hoặc cookie lên response |
| `NextResponse.redirect(url)` | trả mã 3xx, trình duyệt gọi lại URL mới, **thanh địa chỉ đổi** |
| `NextResponse.rewrite(url)` | phục vụ nội dung từ đường dẫn khác nhưng **URL giữ nguyên**, người dùng không biết |
| Response tự tạo | kết thúc request ngay tại middleware, ví dụ `403` chặn bot hay `429` khi vượt giới hạn |

Ví dụ gắn thêm thông tin mà vẫn cho đi tiếp:

```ts
const response = NextResponse.next();
response.headers.set("X-Request-Id", crypto.randomUUID());
response.cookies.set("ab-variant", "b");
return response;
```

Ghi nhớ khác biệt cốt lõi: `redirect` **đổi thứ người dùng thấy**, `rewrite` **đổi thứ server lấy về**, `next()` không đổi gì ngoài những header/cookie bạn thêm vào, còn response tự tạo thì cắt đứt luôn hành trình của request.

</details>

**4. `config.matcher` dùng để làm gì? So sánh `/dashboard/:path` với `/dashboard/:path*` — chúng khớp những URL nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`matcher` giới hạn **middleware chạy cho những đường dẫn nào**. Không khai báo thì nó chạy cho mọi request, gây lãng phí và dễ sinh lỗi.

Khác biệt giữa hai pattern nằm ở dấu `*`:

| Pattern | Khớp | Không khớp |
|---|---|---|
| `/dashboard/:path` | `/dashboard/settings` (đúng **một** segment) | `/dashboard`, `/dashboard/a/b` |
| `/dashboard/:path*` | `/dashboard`, `/dashboard/a`, `/dashboard/a/b/c` (**không hoặc nhiều** segment) | các đường dẫn ngoài `/dashboard` |

Vì vậy để bảo vệ cả một khu vực, gần như luôn dùng dạng có `*`:

```ts
export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
```

Nếu chỉ viết `/dashboard/:path`, bạn để lọt chính trang `/dashboard` và mọi trang con sâu hơn một cấp — một lỗ hổng xác thực rất dễ mắc và khó phát hiện vì trang chính vẫn "trông có vẻ" được bảo vệ.

Ngoài chuỗi, `matcher` còn nhận dạng object với `source` kèm điều kiện `has` / `missing` theo header hoặc cookie.

</details>

**5. Vì sao pattern matcher thực tế thường loại trừ `_next/static`, `_next/image`, `favicon.ico`? Không loại trừ thì hậu quả là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì những đường dẫn đó là **tài nguyên tĩnh** — bundle JS, CSS, ảnh đã tối ưu, favicon — và chúng chiếm phần lớn số request của một trang. Cho middleware chạy trên chúng là làm việc vô ích.

Pattern quen thuộc dùng negative lookahead để loại trừ:

```ts
matcher: "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)";
```

Hậu quả nếu không loại trừ:

- **Tốn tài nguyên và tiền** — mỗi lần tải một trang có thể kéo theo hàng chục request asset, mỗi request lại kích hoạt một lượt chạy edge function.
- **Chậm hơn** — mọi asset phải đi qua một lớp xử lý thừa.
- **Lỗi logic** — nếu middleware redirect khi thiếu token, nó sẽ redirect luôn cả file JS và CSS, khiến trang login gãy giao diện hoặc rơi vào vòng lặp chuyển hướng.

Nguyên tắc: middleware chỉ nên chạy với **request điều hướng của người dùng**, không chạy với asset.

</details>

**6. Middleware chạy trên `edge runtime`: điều đó nghĩa là những API nào KHÔNG dùng được, và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Edge Runtime là môi trường nhẹ chỉ cung cấp **Web Standards**, không phải Node.js đầy đủ. Không dùng được:

- **Module hệ thống của Node** — `fs`, `path`, `net`, `child_process`, phần lớn `process`.
- **Native module** (addon viết bằng C++) và các thư viện phụ thuộc chúng.
- **Driver database kết nối TCP trực tiếp** — phải dùng bản giao tiếp qua HTTP (Neon, Upstash, PlanetScale) hoặc một lớp proxy.
- Các API sinh code lúc chạy như `eval` / `new Function`.

Còn dùng được: `fetch`, `Request`/`Response`, `URL`, `TextEncoder`, Web Crypto (`crypto.subtle`, `crypto.randomUUID`).

**Vì sao bị giới hạn:** edge function được nhân bản ra hàng trăm điểm hiện diện trên toàn cầu và phải khởi động trong vài mili giây. Muốn vậy thì môi trường phải cực nhỏ — không thể mang theo cả bộ API hệ thống của Node, và cũng không nên cho phép truy cập file hay mở kết nối TCP dài hạn từ một môi trường phù du như vậy.

</details>

**7. So sánh `edge runtime` và `nodejs runtime` về cold start, độ trễ, API khả dụng, driver database và giới hạn CPU/bộ nhớ.**

<details className="qa">
<summary>Xem đáp án</summary>

| | Edge Runtime | Node Runtime |
|---|---|---|
| Cold start | rất nhỏ, cỡ mili giây | lớn hơn, cỡ giây |
| Độ trễ | thấp — chạy gần người dùng | cao hơn — chạy ở vùng đã chọn |
| API | chỉ Web Standards | đầy đủ API Node |
| Driver database | phải qua HTTP (Neon, Upstash, PlanetScale) | bất kỳ driver nào |
| Hệ thống file | không có | có |
| CPU / bộ nhớ | giới hạn chặt, bundle nhỏ | thoải mái hơn |

Middleware **luôn chạy ở edge**, không đổi được. Route handler và page thì chọn được:

```ts
export const runtime = "edge"; // hoặc "nodejs"
```

Cách chọn: **edge** cho logic nhẹ, nhạy độ trễ, cần chạy gần người dùng — kiểm tra phiên đăng nhập, chuyển hướng, cá nhân hoá đơn giản. **Node** cho truy vấn cơ sở dữ liệu, xử lý file, thư viện chỉ chạy được trên Node, hoặc bất cứ việc gì tốn CPU.

</details>

**8. Vì sao không nên query database trực tiếp trong middleware? Nếu bắt buộc phải lấy dữ liệu, bạn làm cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba lý do:

- **Kỹ thuật** — edge không mở được kết nối TCP nên phần lớn driver database không chạy; connection pool cũng vô nghĩa khi hàm được nhân bản ở hàng trăm vị trí.
- **Hiệu năng** — middleware chạy cho **mọi** request khớp matcher. Thêm một truy vấn là cộng độ trễ vào từng lần tải trang, và rất dễ đụng giới hạn CPU time vốn chỉ vài chục mili giây.
- **Địa lý** — edge ở gần người dùng nhưng database thì ở một vùng cố định, nên truy vấn từ edge có khi còn **chậm hơn** truy vấn từ server thường.

Nếu vẫn cần dữ liệu ở middleware:

- Đặt thông tin tối thiểu vào **cookie đã ký** hoặc **JWT** rồi chỉ verify chữ ký — không cần chạm tới database.
- Dùng **KV store hoặc edge config** (Upstash, Vercel Edge Config) vốn thiết kế cho đúng tình huống này, truy cập qua HTTP và rất nhanh.
- Chuyển việc kiểm tra nặng xuống **Server Component hoặc route handler**, nơi có Node runtime đầy đủ.

</details>

**9. Middleware có giới hạn bundle size và CPU time — điều này ảnh hưởng thế nào tới việc chọn thư viện (ví dụ thư viện JWT) đưa vào middleware?**

<details className="qa">
<summary>Xem đáp án</summary>

Mọi thứ bạn `import` vào `middleware.ts` đều bị gộp vào bundle chạy ở edge, mà bundle này bị giới hạn dung lượng (khoảng 1MB sau khi đóng gói) và thời gian CPU chỉ vài chục mili giây. Vì vậy tiêu chí chọn thư viện đổi hẳn:

- **Phải tương thích Web Standards** — thư viện dựa trên module `crypto` của Node sẽ không chạy. Với JWT, `jsonwebtoken` là ví dụ điển hình không dùng được ở edge; thay bằng `jose`, vốn xây trên Web Crypto.
- **Phải nhẹ và tree-shakeable** — đừng kéo cả một SDK đồ sộ chỉ để dùng một hàm nhỏ.
- **Phải rẻ về CPU** — verify chữ ký JWT thì được, nhưng băm mật khẩu kiểu bcrypt với chi phí cao thì hoàn toàn sai chỗ.

Nguyên tắc chung: middleware chỉ nên **đọc và quyết định** — đọc cookie, verify chữ ký, so khớp đường dẫn — chứ không phải nơi làm việc nặng. Việc nặng để Server Component hay route handler lo.

</details>

**10. Next.js chỉ cho phép một file middleware cho cả project. Khi logic phức tạp (auth + i18n + A/B test + rate limit), bạn tổ chức code thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không có middleware lồng nhau, nên phải tự **ghép các hàm nhỏ** trong một file duy nhất. Mỗi mối quan tâm tách ra một helper trong `lib/middleware/*.ts`, mỗi helper trả về một response nếu nó muốn kết thúc request, hoặc trả về rỗng để nhường cho bước sau:

```ts
import { authMiddleware } from "@/lib/middleware/auth";
import { geoMiddleware } from "@/lib/middleware/geo";

export async function middleware(request: NextRequest) {
  const authResponse = await authMiddleware(request);
  if (authResponse) return authResponse;

  const geoResponse = await geoMiddleware(request);
  if (geoResponse) return geoResponse;

  return NextResponse.next();
}
```

Kèm theo hai kỹ thuật:

- **Dùng `matcher` để thu hẹp phạm vi** — chỉ những path cần mới vào middleware.
- **Rẽ nhánh theo đường dẫn ngay đầu hàm** — `if (pathname.startsWith("/api"))` thì chạy nhóm kiểm tra của API, tránh chạy mọi thứ cho mọi request.

Lợi ích: mỗi helper test được độc lập, file chính đọc như một danh sách các bước, và thứ tự các bước hiện rõ ràng thay vì nằm lẫn trong một hàm dài.

</details>

**11. Thứ tự các bước kiểm tra bên trong middleware quan trọng ra sao? Cho ví dụ sắp xếp sai gây lỗi logic.**

<details className="qa">
<summary>Xem đáp án</summary>

Rất quan trọng, vì middleware chạy tuần tự và **bước nào trả về response trước thì các bước sau không chạy nữa**. Thứ tự hợp lý là từ rẻ và chặn mạnh nhất tới đắt và cụ thể nhất:

```ts
// 1. Chặn bot           → rẻ, loại bỏ sớm
// 2. Rate limit         → bảo vệ trước khi làm gì thêm
// 3. Chuyển hướng ngôn ngữ / khu vực
// 4. Kiểm tra đăng nhập
// 5. Gắn header rồi next()
```

Vài cách sắp xếp sai và hậu quả:

- **Kiểm tra đăng nhập trước khi chuyển hướng ngôn ngữ** — người dùng bị đưa về `/login` rồi mới bị đổi sang `/vi/login`, thành hai lần chuyển hướng, và nếu hai bước cùng tác động lên đường dẫn thì dễ rơi vào vòng lặp.
- **Rate limit đặt sau các bước nặng** — kẻ tấn công vẫn khiến bạn tốn công xử lý trước khi bị chặn, tức là giới hạn gần như vô dụng.
- **Gắn header rồi mới redirect** — response `next()` đã tạo bị vứt bỏ, header không bao giờ tới được client.
- **Chặn bot đặt cuối cùng** — mọi bước tốn kém phía trước đều đã chạy cho request mà cuối cùng bị từ chối.

</details>

**12. Middleware vs Server Component check vs route handler check: đặt logic xác thực ở đâu và vì sao chỉ dựa vào middleware là không đủ an toàn?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba tầng có ba vai trò khác nhau:

- **Middleware** — chắn thô, cải thiện trải nghiệm: chưa có token thì đưa về `/login` ngay, không tốn công render. Nó chỉ nên kiểm tra **có phiên hợp lệ hay không**.
- **Server Component / lớp truy cập dữ liệu** — kiểm tra **quyền thật** trước khi đọc dữ liệu: người này có thuộc tổ chức đó không, có sở hữu bản ghi đang mở không.
- **Route handler / Server Action** — kiểm tra lại y hệt, vì chúng là điểm vào độc lập mà client có thể gọi thẳng.

Vì sao middleware một mình không đủ:

- Nó chỉ chạy với **đường dẫn khớp matcher**; sai một dấu `*` là lọt cả một nhánh route.
- Nó thường chỉ biết cookie có tồn tại hay không, **không biết phân quyền theo từng bản ghi**.
- Server Action và route handler có thể bị gọi trực tiếp, và không phải lúc nào cũng nằm trong phạm vi matcher.

Nguyên tắc: **kiểm tra quyền ở nơi dữ liệu được truy cập**, còn middleware là lớp tiện lợi phía trước, không phải lớp bảo vệ cuối cùng.

</details>

**13. Triển khai A/B testing bằng middleware: bạn dùng `rewrite` hay `redirect`, lưu variant ở đâu, và làm sao giữ trải nghiệm ổn định giữa các lần truy cập?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng **`rewrite`**, không dùng `redirect`. Redirect làm URL đổi thành `/variant-b`, người dùng nhìn thấy mình đang bị thử nghiệm, link chia sẻ ra ngoài bị lệch, và tốn thêm một lượt round-trip. Rewrite giữ URL là `/` trong khi vẫn phục vụ nội dung của biến thể.

Variant lưu trong **cookie** — gán một lần rồi dùng lại cho các lần sau:

```ts
export function middleware(request: NextRequest) {
  const variant = request.cookies.get("ab-variant")?.value;

  if (!variant) {
    const next = Math.random() < 0.5 ? "a" : "b";
    const response = NextResponse.next();
    response.cookies.set("ab-variant", next);
    return response;
  }

  if (variant === "b" && request.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/variant-b", request.url));
  }

  return NextResponse.next();
}
```

Giữ trải nghiệm ổn định (sticky) chính là nhờ cookie: một người luôn thấy cùng một biến thể, nếu không thì dữ liệu thử nghiệm vô nghĩa và giao diện nhảy qua lại mỗi lần tải trang. Nhớ đặt thời hạn cookie đủ dài phủ hết thời gian thử nghiệm, và gửi variant kèm sự kiện analytics để quy kết kết quả.

</details>

**14. Redirect theo vị trí địa lý trong middleware: lấy thông tin geo từ đâu, và làm sao tránh redirect loop?**

<details className="qa">
<summary>Xem đáp án</summary>

Thông tin vị trí không tự có trong request mà do **nền tảng hosting suy ra từ IP rồi gắn vào** — trên Vercel là `request.geo` hoặc các header dạng `x-vercel-ip-country`, các nền tảng edge khác có header tương đương. Vì vậy ở môi trường local nó thường rỗng, phải có giá trị mặc định.

Tránh vòng lặp bằng cách **kiểm tra đường dẫn đã ở đúng đích chưa trước khi chuyển hướng**:

```ts
const country = request.geo?.country || "US";
const { pathname } = request.nextUrl;

if (country === "VN" && !pathname.startsWith("/vi")) {
  return NextResponse.redirect(new URL(`/vi${pathname}`, request.url));
}
return NextResponse.next();
```

Thiếu điều kiện `!pathname.startsWith("/vi")` thì `/vi/home` lại bị đổi thành `/vi/vi/home` và cứ thế mãi.

Các điểm cần lưu ý thêm:

- **Nhớ lựa chọn của người dùng** bằng cookie locale, và ưu tiên nó hơn suy đoán từ IP — người dùng đã chủ động đổi ngôn ngữ mà lần sau vẫn bị ép về ngôn ngữ theo IP là trải nghiệm rất khó chịu.
- Loại trừ asset và `/api` khỏi matcher, nếu không chính chúng cũng bị thêm tiền tố ngôn ngữ và hỏng.
- Cân nhắc `rewrite` thay vì `redirect` nếu muốn URL giữ nguyên.

</details>

**15. Middleware ảnh hưởng thế nào tới khả năng cache static/CDN của một route? Có làm route trở nên dynamic không?**

<details className="qa">
<summary>Xem đáp án</summary>

Middleware **không đổi phân loại static/dynamic của route** — trong build report, một trang tĩnh vẫn hiện là static và HTML của nó vẫn được dựng sẵn.

Cái nó đổi là **đường đi của request**: mọi request khớp matcher đều phải chạy qua edge function trước, nên không còn được phục vụ thuần tuý từ cache CDN nữa. Hệ quả:

- Mỗi request tốn thêm một lượt thực thi middleware — thường chỉ vài mili giây, nhưng là chi phí có thật cả về độ trễ lẫn tiền.
- Nếu middleware làm việc nặng, chính nó trở thành nút cổ chai cho một trang vốn rất nhanh.
- `rewrite` trong middleware khiến URL người dùng thấy và nội dung thực tế khác nhau, cần cẩn thận khi đặt quy tắc cache theo đường dẫn.

Vì vậy hai việc nên làm: **thu hẹp matcher** để asset và những route không cần thiết không đi qua middleware, và **giữ middleware thật mỏng**. Muốn cá nhân hoá sâu thì đừng ép vào middleware — dùng render động cho đúng phần cần, giữ phần còn lại tĩnh.

</details>

**16. Bạn debug middleware ra sao khi nó chạy đúng ở local nhưng sai trên production edge?**

<details className="qa">
<summary>Xem đáp án</summary>

Trước hết liệt kê những khác biệt hay gây ra tình trạng này:

- **Header và geo** — `request.geo`, `x-forwarded-for`, header quốc gia chỉ có giá trị thật trên production; ở local chúng rỗng nên nhánh code tương ứng không bao giờ chạy.
- **Biến môi trường** — biến chưa khai báo trên nền tảng, hoặc secret không được cấp cho edge.
- **Thư viện không tương thích edge** — ở local vẫn chạy nhờ môi trường dễ tính, lên production thì lỗi.
- **Trạng thái trong bộ nhớ** — biến kiểu `Map` dùng để rate limit chỉ đúng khi có một tiến trình; trên edge có hàng trăm phiên bản nên đếm sai.
- **Matcher** — regex khớp khác đi khi có `basePath` hoặc domain phụ.

Cách lần ra:

- **Log qua response header** — gắn `x-debug-country`, `x-debug-matched` vào `NextResponse.next()` rồi xem trong tab Network; hiệu quả hơn `console.log` vì log ở edge thường rời rạc.
- Xem **log runtime của nền tảng**, lọc theo request id mà chính middleware sinh ra.
- Tái hiện bằng bản build production chạy local, giả lập header geo bằng công cụ gửi request thủ công.
- Thu hẹp dần: tạm rút middleware còn mỗi `NextResponse.next()`, rồi thêm lại từng bước cho tới khi lỗi tái hiện.

</details>

---

## 2. Cookies, Headers, Auth trong Middleware

Bài học: [2. Cookies, Headers, Auth trong Middleware](../../nextjs/06-middleware/2_middleware-features.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Đọc và ghi cookie trong middleware khác nhau thế nào giữa `request.cookies` và `response.cookies`?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai đối tượng nằm ở hai chiều khác nhau của vòng đời request:

- `request.cookies` — **đọc** những cookie trình duyệt gửi lên. API gồm `get("token")` (trả về cookie object), `get("token")?.value` (lấy chuỗi), `getAll()`, `has("token")`.
- `response.cookies` — **ghi** lệnh `Set-Cookie` cho trình duyệt: `set(name, value)`, `set({ name, value, httpOnly, secure, sameSite, maxAge, path })`, `delete("old-cookie")`.

```ts
const token = request.cookies.get("token")?.value; // đọc
const response = NextResponse.next();
response.cookies.set({ name: "session", value: "xyz", httpOnly: true });
return response; // phải trả chính response đã set
```

Lưu ý: ghi vào `response.cookies` không làm thay đổi `request.cookies` của chính request đang chạy — cookie mới chỉ có hiệu lực từ request kế tiếp. Trong Server Component / Server Action thì dùng `cookies()` từ `next/headers`; Server Component chỉ đọc được, còn set/delete phải làm trong Server Action hoặc route handler.

</details>

**2. Vì sao cookie chứa token xác thực phải có `httpOnly`, `secure`, `sameSite`? Mỗi thuộc tính chống được nguy cơ gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba flag chặn ba hướng tấn công khác nhau:

| Flag | Chống nguy cơ |
|---|---|
| `httpOnly: true` | **XSS** — JavaScript phía client không đọc được `document.cookie`, kẻ tấn công chèn script cũng không lấy được token |
| `secure: true` | **Nghe lén đường truyền** — cookie chỉ gửi qua HTTPS, không lộ qua HTTP plaintext |
| `sameSite: "lax"` | **CSRF** — trình duyệt không gửi cookie kèm request cross-site dạng ghi (POST từ site lạ) |

```ts
response.cookies.set({
  name: "session",
  value: token,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 30,
});
```

Thêm `maxAge` để token tự hết hạn và `path: "/"` để giới hạn phạm vi. Nguyên tắc chung: không lưu dữ liệu nhạy cảm trong cookie mà client đọc được — cookie client-readable chỉ nên chứa thứ vô hại như theme hay locale.

</details>

**3. So sánh `sameSite=lax` và `sameSite=strict`: chọn cái nào cho cookie phiên đăng nhập và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | `lax` | `strict` |
|---|---|---|
| Request cross-site dạng ghi (POST) | Không gửi cookie | Không gửi cookie |
| Điều hướng top-level từ site khác (click link) | **Có gửi** | **Không gửi** |
| Mức bảo vệ CSRF | Tốt | Chặt hơn |
| Trải nghiệm | Mượt | Dễ "tưởng như đã logout" |

Với cookie phiên đăng nhập thông thường, `lax` là lựa chọn cân bằng và cũng là mặc định của phần lớn trình duyệt hiện nay: user click link từ email hay Google vào `/dashboard` vẫn ở trạng thái đã đăng nhập, trong khi form POST từ site lạ vẫn bị chặn.

`strict` hợp với thao tác cực nhạy cảm (trang quản trị, ngân hàng) hoặc dùng làm cookie phụ bên cạnh cookie phiên. Nhược điểm: mọi lần vào site từ nguồn ngoài đều thấy màn hình chưa đăng nhập, rất khó chịu. Nếu dùng `sameSite: "none"` (cho iframe, cross-domain) thì bắt buộc kèm `secure: true`.

</details>

**4. Middleware muốn truyền dữ liệu (ví dụ `X-User-Id`) xuống Server Component thì làm thế nào? Server Component đọc lại ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Clone header của request, set thêm giá trị, rồi forward bằng `NextResponse.next()` với option `request`:

```ts
const requestHeaders = new Headers(request.headers);
requestHeaders.set("X-User-Id", userId);

return NextResponse.next({
  request: { headers: requestHeaders },
});
```

Phía route, Server Component đọc lại bằng `headers()` của `next/headers`:

```ts
import { headers } from "next/headers";

export default async function Page() {
  const h = await headers();
  const userId = h.get("X-User-Id");
}
```

Đây là pattern chuẩn để middleware verify token một lần rồi chia sẻ kết quả xuống dưới, tránh verify lại ở từng page. Lưu ý chỉ truyền dữ liệu nhỏ, không nhạy cảm (id, role, locale) — header có giới hạn kích thước. Và vì client cũng có thể tự gửi header `X-User-Id` giả, middleware phải luôn **ghi đè** header này chứ không được tin giá trị đến từ request.

</details>

**5. Vì sao phải dùng `NextResponse.next({ request: { headers } })` thay vì chỉ set header lên response khi muốn downstream đọc được?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì hai chỗ set header phục vụ hai đối tượng khác nhau:

- `response.headers.set(...)` sửa **response header** — chỉ trình duyệt/CDN nhận được, route handler và Server Component phía sau hoàn toàn không thấy.
- `NextResponse.next({ request: { headers } })` sửa **request header được forward tiếp** — chính là thứ `headers()` trong Server Component đọc ra.

```ts
const response = NextResponse.next();
response.headers.set("X-User-Id", id);   // Server Component KHÔNG đọc được

const requestHeaders = new Headers(request.headers);
requestHeaders.set("X-User-Id", id);
return NextResponse.next({ request: { headers: requestHeaders } }); // đọc được
```

Cần clone `new Headers(request.headers)` vì đối tượng header gốc của request là read-only. Đây là lỗi rất hay gặp: middleware set header, Server Component gọi `headers().get()` lại nhận `null`, nguyên nhân chỉ vì set nhầm chiều.

</details>

**6. Phân biệt request header và response header trong middleware: cái nào ảnh hưởng tới trình duyệt, cái nào ảnh hưởng tới code phía sau?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Request header | Response header |
|---|---|---|
| Chiều đi | Client → server, rồi middleware → route | Server → client |
| Cách set trong middleware | `NextResponse.next({ request: { headers } })` | `response.headers.set(...)` |
| Ai đọc được | Route handler, Server Component qua `headers()` | Trình duyệt, CDN, proxy |
| Dùng cho | Truyền `X-User-Id`, locale, geo xuống downstream | `Set-Cookie`, `Cache-Control`, `Access-Control-*`, `Content-Security-Policy` |

Nói gọn: muốn **code phía sau** biết điều gì thì sửa request header; muốn **trình duyệt hoặc tầng cache** hành xử theo ý mình thì sửa response header. Một số header như `Set-Cookie` bắt buộc nằm ở response (dùng `response.cookies.set` hoặc `headers.append("Set-Cookie", ...)` để không ghi đè cookie đã có). Có thể làm cả hai trong cùng một lần xử lý: forward request header đã sửa, đồng thời set thêm response header bảo mật.

</details>

**7. Vì sao trong middleware nên `jwtVerify` (kiểm chữ ký JWT) thay vì gọi database để kiểm tra phiên đăng nhập?**

<details className="qa">
<summary>Xem đáp án</summary>

Middleware chạy ở **Edge runtime**, gần user và cho gần như mọi request. Ràng buộc và hệ quả:

- Edge không chạy được driver database Node truyền thống (TCP socket), và mở kết nối DB từ hàng chục vùng biên là bài toán connection pool rất tệ.
- Mỗi request đều query DB sẽ cộng thêm độ trễ vào **toàn bộ** traffic, phá luôn lợi thế "chạy gần user".

`jwtVerify` chỉ cần secret/public key và vài phép tính mật mã trong bộ nhớ — nhanh, không I/O, hợp Edge:

```ts
const { payload } = await jwtVerify(
  token,
  new TextEncoder().encode(process.env.JWT_SECRET)
);
```

Trade-off: verify chữ ký chỉ chứng minh token do server mình ký và chưa hết hạn, **không** biết tài khoản đã bị khoá hay phiên đã bị thu hồi. Vì vậy pattern thực tế là: middleware verify chữ ký và chặn sớm, rồi truyền `X-User-Id` xuống để Server Component fetch dữ liệu user tươi từ DB và kiểm tra trạng thái thật.

</details>

**8. Chỉ decode JWT mà không verify chữ ký thì lỗ hổng là gì? Mô tả một kịch bản tấn công.**

<details className="qa">
<summary>Xem đáp án</summary>

JWT gồm ba phần `header.payload.signature`, trong đó header và payload chỉ là **base64url — không mã hoá**. Ai cũng decode được, và quan trọng hơn: ai cũng **tạo được** một payload tuỳ ý. Chữ ký là thứ duy nhất chứng minh token do server mình phát hành.

Kịch bản: kẻ tấn công đăng ký tài khoản thường, lấy cookie token của mình, decode payload thấy `{ "sub": "u123", "role": "user" }`. Hắn sửa thành `{ "sub": "u1", "role": "admin" }`, base64 lại, ghép với chữ ký cũ (hoặc chữ ký rác) rồi gắn vào cookie. Middleware nếu chỉ decode sẽ đọc ra `role: "admin"` và cho vào `/dashboard` quản trị.

Biến thể kinh điển khác là tấn công `alg: "none"` — đổi thuật toán trong header thành `none` và bỏ trống chữ ký. Phòng thủ: luôn dùng `jwtVerify` với secret, ép danh sách thuật toán cho phép, kiểm `exp`/`iss`/`aud`, và bọc trong `try/catch` để token hỏng bị coi như chưa đăng nhập.

</details>

**9. Sau khi middleware đã chặn route bảo vệ, vì sao Server Component / route handler vẫn cần kiểm tra quyền lần nữa?**

<details className="qa">
<summary>Xem đáp án</summary>

Middleware là lớp lọc sớm để cải thiện UX và tiết kiệm render, **không phải** biên giới bảo mật cuối cùng:

- `matcher` rất dễ bỏ sót đường dẫn — thêm route mới, đổi cấu trúc thư mục là middleware im lặng không chạy cho route đó.
- Middleware chỉ verify chữ ký JWT, không biết user đã bị khoá, đã bị hạ quyền hay phiên đã bị thu hồi.
- Nó chỉ xét theo **path**, trong khi phân quyền thật thường theo **tài nguyên**: user hợp lệ vẫn không được xem đơn hàng của người khác.
- Server Action, route handler, RSC có thể được gọi theo các đường mà middleware không phủ hết.

Nguyên tắc **defense in depth**: middleware chặn sớm và redirect đẹp, còn nơi thực sự đọc/ghi dữ liệu phải tự kiểm tra danh tính và quyền trên từng bản ghi trước khi trả kết quả. Đặt kiểm tra càng gần tầng dữ liệu càng khó bị đi vòng.

</details>

**10. Thiết kế luồng redirect người dùng chưa đăng nhập về `/login`: làm sao ghi nhớ trang họ định vào để quay lại sau khi đăng nhập?**

<details className="qa">
<summary>Xem đáp án</summary>

Đính path gốc vào query string của URL login, rồi sau khi đăng nhập thành công thì đọc lại và điều hướng về:

```ts
if (!user && isProtected) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", path);
  return NextResponse.redirect(loginUrl);
}
```

Trang `/login` đọc `searchParams.from`, sau khi xác thực xong thì `redirect(from ?? "/dashboard")`. Ngược lại, user **đã** đăng nhập mà vào `/login` thì đẩy thẳng về `/dashboard` cho gọn.

Điểm cần cẩn thận là **open redirect**: giá trị `from` đến từ URL nên hoàn toàn do người dùng kiểm soát. Phải whitelist — chỉ chấp nhận path nội bộ bắt đầu bằng `/` và không bắt đầu bằng `//` hay chứa scheme, nếu không thì fallback về trang mặc định. Nếu muốn giữ nguyên cả query của trang đích, dùng `request.nextUrl.pathname + request.nextUrl.search` thay vì chỉ pathname.

</details>

**11. Vì sao không thể `rate limiting` bằng biến trong bộ nhớ ở `edge runtime`? Giải pháp thay thế là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Edge runtime chạy trên nhiều instance ngắn hạn, phân tán khắp các vùng và có thể bị huỷ hay khởi tạo lại bất cứ lúc nào. Một biến `Map` đếm số request vì thế:

- không được chia sẻ giữa các instance — mỗi vùng đếm riêng, hạn mức thực tế nhân lên theo số vùng;
- mất sạch khi instance bị thu hồi, kẻ tấn công chỉ cần đợi hoặc đổi vùng.

Giải pháp là đưa bộ đếm ra **KV store ngoài** truy cập được từ Edge qua HTTP, ví dụ Upstash Redis:

```ts
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

const ip = request.headers.get("x-forwarded-for") || "anonymous";
const { success, remaining } = await ratelimit.limit(ip);
if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
```

Kết hợp với `matcher: "/api/:path*"` để chỉ tính hạn mức cho API, tránh tốn một lượt gọi Redis cho mỗi file tĩnh.

</details>

**12. Chọn khoá cho rate limit theo IP, theo user id, hay theo cả hai — trade-off là gì với người dùng sau NAT/proxy?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Theo IP**: dùng được cho cả request chưa đăng nhập, hợp với endpoint login/register. Nhược điểm lớn là cả một văn phòng, trường học hay mạng di động dùng chung NAT sẽ ra **một IP** — chặn nhầm hàng loạt người vô tội. Ngược lại kẻ tấn công có thể xoay IP qua proxy/IPv6 để né.
- **Theo user id**: công bằng và chính xác, nhưng chỉ áp dụng được sau khi xác thực — không bảo vệ được chính luồng đăng nhập hay các endpoint public.

Thực tế nên dùng **cả hai**: khoá theo user id khi đã đăng nhập, fallback sang IP khi chưa, và đặt thêm hạn mức IP rộng hơn làm lớp chặn lạm dụng thô. Với endpoint nhạy cảm như login, khoá kết hợp `ip + email` để tránh brute-force một tài khoản mà không khoá nhầm cả mạng.

Lưu ý kỹ thuật: `x-forwarded-for` có thể là danh sách và bị client giả mạo — chỉ tin giá trị do proxy/CDN tin cậy của mình ghi vào.

</details>

**13. Trả `429 Too Many Requests` thì nên kèm header nào để client biết khi nào thử lại?**

<details className="qa">
<summary>Xem đáp án</summary>

Header quan trọng nhất là **`Retry-After`** — số giây (hoặc một mốc thời gian HTTP-date) client nên đợi trước khi gửi lại. Đây là header chuẩn HTTP, client và thư viện retry đều hiểu.

Bổ sung nhóm header hạn mức để client tự điều tiết trước khi bị chặn:

```ts
return NextResponse.json(
  { error: "Too many requests" },
  {
    status: 429,
    headers: {
      "Retry-After": "10",
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": String(reset),
    },
  }
);
```

Trong đó `limit` là hạn mức cửa sổ hiện tại, `remaining` là số lượt còn lại, `reset` là mốc thời gian cửa sổ mở lại. Nên trả nhóm `X-RateLimit-*` cho cả response thành công chứ không chỉ khi 429, để client biết mình đang tiến gần ngưỡng. Phía client thì xử lý bằng exponential backoff kèm jitter, đừng retry ngay lập tức.

</details>

**14. `CORS` là gì và vì sao request `OPTIONS` (preflight) cần xử lý riêng trong middleware?**

<details className="qa">
<summary>Xem đáp án</summary>

**CORS** (Cross-Origin Resource Sharing) là cơ chế để server nói với trình duyệt rằng origin nào được phép đọc response của mình. Mặc định same-origin policy chặn JS ở `https://app.a.com` đọc dữ liệu từ `https://api.b.com`; server phải trả `Access-Control-Allow-Origin` thì trình duyệt mới cho qua.

Với request "không đơn giản" (method `PUT`/`DELETE`, có header `Authorization` hay `Content-Type: application/json`), trình duyệt **tự gửi trước** một request `OPTIONS` để hỏi phép. Request này không mang body, không nên đi vào logic auth hay rate limit, và phải được trả lời ngay:

```ts
if (request.method === "OPTIONS") {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
```

`Access-Control-Max-Age` cho phép trình duyệt cache kết quả preflight, giảm số round-trip thừa.

</details>

**15. Vì sao API có `credentials` (cookie) không được đặt `Access-Control-Allow-Origin: *`? Cách whitelist origin đúng.**

<details className="qa">
<summary>Xem đáp án</summary>

Bản thân spec CORS cấm kết hợp này: khi `Access-Control-Allow-Credentials: true`, trình duyệt **từ chối** response có `Access-Control-Allow-Origin: *` và bắt buộc phải là một origin cụ thể. Lý do bảo mật rõ ràng — nếu cho phép, bất kỳ site nào cũng có thể gọi API của bạn kèm cookie phiên của nạn nhân và đọc được dữ liệu trả về, tức là CSRF có khả năng đọc.

Cách làm đúng là phản chiếu origin sau khi đối chiếu whitelist:

```ts
const allowed = ["https://app.example.com", "https://admin.example.com"];
const origin = request.headers.get("Origin") || "";

if (allowed.includes(origin)) {
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
}
```

Đi kèm nên set `Vary: Origin` để cache không phục vụ nhầm header của origin khác. Tuyệt đối không so khớp kiểu `origin.endsWith("example.com")` — `evil-example.com` sẽ lọt.

</details>

**16. Viết một hàm `compose(...fns)` cho middleware: mỗi hàm trả `NextResponse` hoặc `null` nghĩa là gì, và vì sao cần short-circuit?**

<details className="qa">
<summary>Xem đáp án</summary>

Quy ước: mỗi middleware con trả `NextResponse` nghĩa là "tôi đã quyết định xong response này, dừng chuỗi", trả `null` nghĩa là "tôi không có ý kiến, cho đi tiếp".

```ts
type MiddlewareFn = (req: NextRequest) => Promise<NextResponse | null>;

export function compose(...fns: MiddlewareFn[]) {
  return async (req: NextRequest) => {
    for (const fn of fns) {
      const result = await fn(req);
      if (result) return result; // short-circuit
    }
    return NextResponse.next();
  };
}

export const middleware = compose(rateLimit, authMiddleware, geoMiddleware);
```

Short-circuit là bắt buộc vì một request chỉ có **một** response: nếu `rateLimit` đã trả 429 mà vẫn chạy tiếp `authMiddleware` thì vừa lãng phí, vừa có nguy cơ ghi đè quyết định trước đó. Thứ tự các hàm cũng là thứ tự ưu tiên — chặn rẻ và quan trọng trước (rate limit, auth), xử lý phụ trợ sau. Lợi ích: mỗi mối quan tâm nằm trong một file nhỏ, dễ test riêng.

</details>

**17. Middleware set `Content-Security-Policy` với `nonce` cho mỗi request: cơ chế hoạt động và điều gì có thể hỏng nếu route được cache?**

<details className="qa">
<summary>Xem đáp án</summary>

Cơ chế: mỗi request, middleware sinh một chuỗi ngẫu nhiên dùng một lần (`nonce`), đưa vào response header `Content-Security-Policy` dạng `script-src 'nonce-<giá trị>'`, đồng thời forward nonce xuống downstream qua request header để các thẻ `<script>` render ra mang đúng thuộc tính `nonce`. Trình duyệt chỉ thực thi script có nonce khớp — script do kẻ tấn công chèn vào không đoán được giá trị nên bị chặn, đó là cách chống XSS mạnh hơn nhiều so với whitelist domain.

Điều kiện sống còn là **nonce phải mới ở mỗi request**. Nếu HTML được cache (static generation, CDN, Full Route Cache) thì HTML cũ giữ nonce cũ, trong khi middleware vẫn sinh header nonce mới cho mỗi lượt truy cập — hai giá trị lệch nhau và toàn bộ script hợp lệ bị chặn, trang trắng hoặc mất tương tác. Vì vậy route dùng CSP nonce phải render động, và không được để tầng cache lưu lại HTML chứa nonce.

</details>
