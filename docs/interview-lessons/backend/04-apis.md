---
sidebar_position: 4
title: "4. APIs"
---

# 4. APIs

## 1. API Styles: REST, GraphQL, gRPC

Bài học: [1. API Styles: REST, GraphQL, gRPC](../../backend/04-apis/1_api-styles.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `REST` là gì? Kể các ràng buộc chính (`stateless`, client–server, cacheable, uniform interface). Một API 'RESTful' khác một 'HTTP API' thông thường ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

**REST (Representational State Transfer)** là phong cách kiến trúc **resource-oriented**: mọi thứ là tài nguyên có địa chỉ (`/users/1`), thao tác bằng các HTTP method chuẩn.

Các ràng buộc chính:

- **Client–server** — tách biệt giao diện và lưu trữ, hai bên tiến hoá độc lập.
- **Stateless** — mỗi request tự chứa đủ thông tin, server không giữ session của request trước.
- **Cacheable** — response phải nói rõ có cache được không (`Cache-Control`, `ETag`).
- **Uniform interface** — URL là danh từ, method mang ý nghĩa hành động, status code chuẩn.
- **Layered system** — client không cần biết có proxy/gateway ở giữa.
- **Code on demand** (tuỳ chọn).

**RESTful vs HTTP API thường:** rất nhiều API chỉ "dùng HTTP + JSON" nhưng đặt URL kiểu `POST /getUsers`, trả 200 kèm `{"error": ...}`, và giữ state trên server — đó là HTTP API, không phải RESTful. RESTful đòi hỏi tuân thủ uniform interface, stateless và dùng đúng semantics của HTTP.

</details>

**2. `PUT` và `PATCH` khác nhau thế nào? Khi nào dùng `POST /users` và khi nào dùng `PUT /users/1`?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | `PUT` | `PATCH` |
|---|---|---|
| Ý nghĩa | Thay **toàn bộ** resource | Sửa **một phần** resource |
| Body | Đầy đủ mọi field | Chỉ field cần đổi |
| Idempotent | Có | Không bắt buộc (tuỳ cách hiện thực) |
| Field thiếu | Bị xoá / về default | Giữ nguyên |

```
PUT   /api/users/1   { "name": "An", "email": "an@x.com", "role": "admin" }
PATCH /api/users/1   { "name": "An" }   ← email, role giữ nguyên
```

**`POST /users`** dùng khi **tạo mới** và **server sinh ID** — client không biết trước resource nằm ở đâu, server trả `201 Created` kèm header `Location`. POST không idempotent: gọi hai lần tạo hai user.

**`PUT /users/1`** dùng khi client **đã biết định danh** và muốn ghi đè trạng thái tại đúng địa chỉ đó. PUT idempotent: gọi bao nhiêu lần kết quả cuối cũng như nhau. Một số API cho phép PUT tạo mới nếu ID chưa tồn tại (upsert).

</details>

**3. `Idempotent` nghĩa là gì? Method nào idempotent, method nào `safe`? Làm sao khiến một `POST` thanh toán trở nên idempotent bằng `Idempotency-Key`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Idempotent** = gọi 1 lần hay N lần thì **trạng thái cuối cùng của server như nhau**. **Safe** = không làm thay đổi trạng thái gì cả (chỉ đọc).

| Method | Safe | Idempotent |
|---|---|---|
| `GET`, `HEAD`, `OPTIONS` | Có | Có |
| `PUT`, `DELETE` | Không | Có |
| `POST` | Không | Không |
| `PATCH` | Không | Không bắt buộc |

**Làm POST thanh toán idempotent:** client tự sinh một khoá duy nhất (UUID) và gửi kèm:

```
POST /api/payments
Idempotency-Key: 8f3c-...-91ab

Lần 1 → charge thật, lưu (key → response, status) vào store.
Lần 2 cùng key → trả lại response cũ, KHÔNG charge lần nữa.
```

Server lưu key kèm kết quả trong Redis/DB với TTL (vài giờ tới 24h), dùng unique constraint hoặc lock để chặn hai request song song cùng key. Nên hash cả request body để phát hiện client tái dùng key với payload khác — trường hợp đó trả `422`. Đây là cách Stripe làm.

</details>

**4. Thiết kế endpoint cho hành động không phải CRUD (gửi lại email xác thực, huỷ đơn hàng, restart job) theo phong cách REST như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Có ba cách phổ biến, chọn theo mức độ "nắn được thành tài nguyên":

- **Biến hành động thành sub-resource** (RESTful nhất) — coi kết quả của hành động là một tài nguyên mới:

```
POST /orders/1/cancellation
POST /users/1/verification-emails
POST /jobs/5/restarts
```

- **Đổi trạng thái bằng PATCH** khi hành động thực chất chỉ là chuyển state:

```
PATCH /orders/1   { "status": "cancelled" }
```

- **Controller endpoint** (dùng động từ có kiểm soát) — thực dụng, được chấp nhận rộng rãi khi hai cách trên gượng ép:

```
POST /orders/1/cancel
POST /jobs/5/restart
```

Nguyên tắc chung: luôn dùng `POST` (hành động có side effect, không safe), đặt hành động **dưới resource liên quan** chứ không đặt ở gốc, và với thao tác nhạy cảm thì thêm `Idempotency-Key`. Nếu xử lý lâu, trả `202 Accepted` kèm link theo dõi tiến độ thay vì bắt client chờ.

</details>

**5. Phân biệt các status code hay nhầm: `400` với `422`, `401` với `403`, `200`/`201`/`204`. Khi nào trả `409`, khi nào trả `429`?**

<details className="qa">
<summary>Xem đáp án</summary>

| Code | Ý nghĩa | Dùng khi |
|---|---|---|
| `400` Bad Request | Request **sai cú pháp/hình thức** | JSON hỏng, thiếu field bắt buộc, sai kiểu |
| `422` Unprocessable | Cú pháp đúng nhưng **sai nghiệp vụ** | Email đúng định dạng nhưng đã tồn tại, ngày kết thúc trước ngày bắt đầu |
| `401` Unauthorized | **Chưa xác thực** (thực chất là "unauthenticated") | Thiếu token, token hết hạn/không hợp lệ |
| `403` Forbidden | **Đã xác thực nhưng không đủ quyền** | User thường gọi endpoint admin |
| `200` OK | Thành công, **có body** | GET, PUT/PATCH trả về resource sau khi sửa |
| `201` Created | **Tạo mới** thành công | POST tạo resource, kèm header `Location` |
| `204` No Content | Thành công, **không có body** | DELETE, hoặc update không cần trả gì |

- **`409` Conflict** — request xung đột với trạng thái hiện tại: trùng khoá duy nhất, optimistic locking thất bại (version không khớp), huỷ đơn đã giao.
- **`429` Too Many Requests** — vượt rate limit; nên kèm header `Retry-After` để client biết chờ bao lâu.

</details>

**6. So sánh `offset pagination` và `cursor pagination`. Vì sao offset chậm dần khi đi sâu và có thể trả về row trùng hoặc bỏ sót row?**

<details className="qa">
<summary>Xem đáp án</summary>

```
GET /api/users?page=2&limit=20      → offset-based
GET /api/users?cursor=abc&limit=20  → cursor-based (recommended)
```

| Tiêu chí | Offset | Cursor |
|---|---|---|
| Truy vấn | `LIMIT 20 OFFSET 10000` | `WHERE id > :cursor LIMIT 20` |
| Hiệu năng trang sâu | Giảm tuyến tính theo offset | Ổn định, dùng được index |
| Nhảy tới trang bất kỳ | Được | Không (chỉ tiến/lùi tuần tự) |
| Đếm tổng số trang | Dễ | Khó/không có |
| Dữ liệu thay đổi liên tục | Dễ lệch | Ổn định |

**Vì sao offset chậm dần:** database vẫn phải **quét và loại bỏ** đủ N row trước khi bắt đầu trả kết quả. `OFFSET 100000` nghĩa là đọc 100.020 row rồi vứt 100.000.

**Vì sao trùng/sót row:** offset tính theo **vị trí**, không theo dữ liệu. Nếu giữa lúc đọc trang 1 và trang 2 có một row mới chèn vào đầu danh sách, mọi thứ dịch xuống một bậc — row cuối trang 1 sẽ xuất hiện lại ở đầu trang 2. Ngược lại, khi có row bị xoá, một row sẽ bị nhảy qua. Cursor trỏ vào **giá trị của row** nên không bị ảnh hưởng.

</details>

**7. Các cách versioning API (URL path, header, query) khác nhau ra sao? Thay đổi nào là `breaking change`, và quy trình `deprecate` một version nên gồm những bước gì?**

<details className="qa">
<summary>Xem đáp án</summary>

| Cách | Ví dụ | Nhận xét |
|---|---|---|
| URL path | `/api/v1/users` | Phổ biến nhất, dễ thấy, dễ route/cache; "không thuần REST" vì URL của cùng một resource đổi |
| Header | `Accept: application/vnd.example.v2+json` | URL sạch, đúng tinh thần content negotiation; khó test bằng browser/curl |
| Query param | `/api/users?version=2` | Đơn giản nhưng dễ lẫn với filter, hay bị bỏ quên |

**Breaking change** (bắt buộc lên version mới): xoá hoặc đổi tên field, đổi kiểu dữ liệu của field, thêm field bắt buộc vào request, đổi ý nghĩa/giá trị enum, đổi status code, siết validation chặt hơn.

**Không breaking:** thêm field optional vào response, thêm endpoint mới, thêm giá trị enum mới nếu client được thiết kế để bỏ qua giá trị lạ.

**Quy trình deprecate:** công bố lịch ngưng hỗ trợ sớm (thường 6–12 tháng) → trả header `Deprecation` / `Sunset` và ghi rõ trong docs → cung cấp migration guide → giám sát xem client nào còn gọi và chủ động liên hệ → tắt dần (brownout từng đợt ngắn cho client phát hiện) → gỡ hẳn.

</details>

**8. Caching HTTP hoạt động thế nào với `ETag`, `Cache-Control`, `If-None-Match` và `304`? Vì sao GraphQL khó tận dụng cache HTTP hơn REST?**

<details className="qa">
<summary>Xem đáp án</summary>

Luồng cơ bản:

```
Lần 1: GET /users/1
       200 OK
       Cache-Control: max-age=60, public
       ETag: "v3-abc"

Lần 2 (sau 60s): GET /users/1
       If-None-Match: "v3-abc"
       → 304 Not Modified (không body) nếu dữ liệu chưa đổi
       → 200 + body mới + ETag mới nếu đã đổi
```

- **`Cache-Control`** quyết định cache bao lâu và ai được cache (`max-age`, `public`/`private`, `no-store`, `stale-while-revalidate`).
- **`ETag`** là "vân tay" của nội dung; **`If-None-Match`** gửi lại vân tay đó để server so sánh.
- **`304`** tiết kiệm băng thông vì không truyền lại body.

**Vì sao GraphQL khó:** REST cache theo **URL** — `/users/1` là một khoá ổn định, CDN và browser cache được ngay. GraphQL chỉ có **một endpoint `/graphql`** và thường dùng `POST`, mà `POST` mặc định không cacheable; hơn nữa mỗi client hỏi một tập field khác nhau nên body query khác nhau liên tục. Cách khắc phục: **persisted query** (gửi hash thay vì query) kèm `GET` để CDN cache được, và dựa nhiều vào **normalized cache phía client** (Apollo, Relay).

</details>

**9. Thiết kế một format lỗi thống nhất cho API (ví dụ theo `RFC 7807`) — nên trả về những trường gì và tuyệt đối không để lộ thông tin gì?**

<details className="qa">
<summary>Xem đáp án</summary>

RFC 7807 (Problem Details) trả `Content-Type: application/problem+json`:

```json
{
  "type": "https://example.com/errors/insufficient-funds",
  "title": "Insufficient funds",
  "status": 400,
  "detail": "Account balance is 50, requested 100",
  "instance": "/accounts/123",
  "traceId": "9c1f2e...",
  "errors": [{ "field": "amount", "message": "vượt số dư" }]
}
```

Nên có:

- **`type`** — URI định danh loại lỗi, ổn định để client xử lý theo máy.
- **`title`** — mô tả ngắn, không đổi theo từng lần.
- **`status`** — trùng HTTP status.
- **`detail`** — mô tả cụ thể lần lỗi này, an toàn để hiển thị cho user.
- **`instance`** + **`traceId`** — để đối chiếu log khi hỗ trợ.
- Danh sách lỗi theo field cho lỗi validation.

**Tuyệt đối không để lộ:** stack trace, câu SQL và tên bảng/cột, connection string hay biến môi trường, đường dẫn file trên server, phiên bản framework, và thông tin phân biệt "email không tồn tại" với "sai mật khẩu" (giúp kẻ tấn công dò tài khoản).

</details>

**10. `Stateless` với REST nghĩa là gì? Session lưu server và `JWT` ảnh hưởng thế nào tới khả năng scale ngang?**

<details className="qa">
<summary>Xem đáp án</summary>

**Stateless** nghĩa là **server không giữ ngữ cảnh của client giữa các request**: mỗi request phải tự mang đủ thông tin (token, tham số) để xử lý độc lập. Server vẫn giữ state của **dữ liệu** trong database — thứ không được giữ là state của **phiên làm việc** trong bộ nhớ tiến trình.

**Session lưu server:** session ID nằm ở cookie, dữ liệu phiên nằm trong RAM của một instance. Khi scale ngang, request có thể rơi vào instance khác và mất phiên → phải dùng **sticky session** (giảm hiệu quả load balancing, instance chết là mất phiên) hoặc **session store dùng chung** (Redis) — cách này phổ biến và tốt, nhưng thêm một round-trip và một điểm phụ thuộc.

**JWT:** toàn bộ thông tin (user id, role, hạn dùng) nằm trong token đã ký, mọi instance chỉ cần verify chữ ký — thật sự stateless, scale ngang dễ. Đánh đổi: **khó thu hồi trước hạn** (phải thêm blacklist — lại có state), token to hơn cookie, và đổi quyền không có hiệu lực tới khi token hết hạn. Thực tế thường dùng access token ngắn hạn kèm refresh token lưu server.

</details>

**11. GraphQL giải quyết `over-fetching` và `under-fetching` bằng cách nào? Cái giá phải trả là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Client **khai báo đúng những field mình cần** trong một query duy nhất, server trả về đúng chừng đó:

```graphql
query {
  user(id: "1") {
    name
    posts(limit: 5) { title }
  }
}
```

- **Hết over-fetching** — không nhận về những field thừa như REST trả nguyên object (lợi cho mobile băng thông yếu).
- **Hết under-fetching** — dữ liệu lồng nhau lấy trong một round-trip, thay vì gọi `/users/1` rồi `/users/1/posts` rồi `/posts/x/comments`.

**Cái giá phải trả:**

- **Caching khó** — một endpoint, thường là POST, mỗi query một khác nên HTTP/CDN cache gần như vô dụng.
- **N+1** rất dễ xảy ra ở tầng resolver.
- **Complexity server** — parser, resolver, depth/cost limit, schema versioning.
- **Rủi ro bảo mật** — query lồng sâu hoặc quá đắt có thể làm sập server.
- **Bundle client lớn hơn**, và quan sát/monitoring khó hơn vì mọi thứ đi qua một endpoint, status luôn là 200.

</details>

**12. Vì sao GraphQL rất dễ dính `N+1`? `DataLoader` hoạt động ra sao để khắc phục?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì GraphQL thực thi **theo từng resolver, từng node của cây kết quả**. Query lấy 100 post rồi lấy `author` của mỗi post sẽ chạy resolver `author` đúng 100 lần — mỗi lần một truy vấn DB, cộng 1 truy vấn lấy danh sách post là **1 + N**. Resolver không tự biết nó đang nằm trong một danh sách nên không gộp được.

**DataLoader** giải quyết bằng **batching + caching trong phạm vi một request**:

```js
const userLoader = new DataLoader(async (ids) => {
  const rows = await db.user.findMany({ where: { id: { in: ids } } });
  return ids.map((id) => rows.find((r) => r.id === id)); // đúng thứ tự ids
});

// resolver
Post: { author: (post) => userLoader.load(post.authorId) }
```

Mỗi lần gọi `load(id)` không đi DB ngay mà **xếp vào hàng đợi**; hết tick hiện tại của event loop, DataLoader gom toàn bộ id thành **một truy vấn `IN (...)`** rồi phân phát kết quả về đúng chỗ. Nó còn cache theo key nên id trùng chỉ hỏi một lần. Lưu ý: tạo loader mới cho **mỗi request** để tránh rò dữ liệu giữa các user.

</details>

**13. Bảo vệ một GraphQL endpoint công khai khỏi query độc hại bằng những biện pháp nào (`depth limit`, `query cost`, `persisted query`, rate limit theo cost)?**

<details className="qa">
<summary>Xem đáp án</summary>

Một query lồng sâu có thể nổ theo cấp số nhân và làm sập server:

```graphql
query {
  user { posts { author { posts { author { posts { ... } } } } } }
}
```

Các lớp phòng thủ:

- **Depth limit** — từ chối query vượt độ sâu cho phép (thường 7–10). Rẻ, chặn được kiểu tấn công lồng vòng ở trên.
- **Query cost / complexity analysis** — gán chi phí cho từng field (field lấy list nhân theo `limit`), tính tổng **trước khi thực thi** và từ chối nếu vượt ngưỡng. Chính xác hơn depth limit vì một query nông vẫn có thể lấy 10.000 bản ghi.
- **Persisted query (allowlist)** — chỉ chấp nhận các query đã đăng ký trước, client gửi hash. Đây là biện pháp mạnh nhất cho app của chính mình, đồng thời giúp cache qua `GET`.
- **Rate limit theo cost** thay vì theo số request — mỗi client có ngân sách điểm/phút, query đắt tiêu nhiều điểm (cách GitHub API làm).
- Bổ sung: **tắt introspection** ở production, giới hạn kích thước payload, timeout truy vấn, phân trang bắt buộc và chặn `limit` quá lớn.

</details>

**14. gRPC nhanh hơn REST + JSON nhờ những yếu tố nào (`Protobuf` binary, `HTTP/2` multiplexing, nén header)? Điểm đánh đổi khi debug là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Các yếu tố cộng dồn:

- **Protobuf binary** — field được mã hoá theo **số thứ tự** thay vì tên chuỗi, số dùng varint; payload nhỏ hơn JSON nhiều lần và parse nhanh hơn vì không phải phân tích text.
- **Schema biết trước** — không cần đoán kiểu lúc runtime, serializer được sinh sẵn từ `.proto`.
- **HTTP/2 multiplexing** — nhiều request chạy song song trên **một kết nối TCP**, không bị head-of-line blocking ở tầng HTTP như HTTP/1.1, và không phải bắt tay TCP/TLS lại cho mỗi call.
- **Nén header (HPACK)** — header lặp đi lặp lại chỉ truyền một lần rồi tham chiếu bảng.
- **Streaming** sẵn có, giữ kết nối lâu dài.

**Đánh đổi khi debug:** payload là binary nên **không đọc bằng mắt được**, `curl` và tab Network của browser gần như vô dụng; phải dùng công cụ riêng (`grpcurl`, `grpcui`, Postman bản hỗ trợ gRPC) và phải có file `.proto` mới giải mã được. Log/capture gói tin cũng khó đọc hơn, và trace lỗi phụ thuộc vào status code riêng của gRPC thay vì status HTTP quen thuộc.

</details>

**15. Trong `Protobuf`, vì sao mỗi field phải có số thứ tự? Thêm field mới và xoá field cũ như thế nào để giữ tương thích ngược và xuôi?**

<details className="qa">
<summary>Xem đáp án</summary>

```protobuf
message User {
  string id = 1;
  string name = 2;
  string email = 3;
}
```

Số thứ tự (**field number/tag**) chính là **định danh duy nhất của field trên đường truyền** — Protobuf không gửi tên field, chỉ gửi cặp `(tag, value)`. Nhờ vậy payload rất nhỏ, và **đổi tên field không phá vỡ tương thích**, còn **đổi số thứ tự thì phá vỡ ngay**. Tag 1–15 chỉ tốn 1 byte nên nên dành cho field hay dùng nhất.

**Thêm field mới:** luôn dùng **tag mới chưa từng dùng**, và để là optional (proto3 mặc định mọi field đều có giá trị mặc định). Bên đọc bằng schema cũ sẽ **bỏ qua field lạ** (tương thích xuôi), bên đọc bằng schema mới với dữ liệu cũ sẽ nhận giá trị mặc định (tương thích ngược).

**Xoá field cũ:** không bao giờ tái sử dụng tag đó cho field khác — dữ liệu cũ sẽ bị hiểu sai kiểu. Đánh dấu bằng `reserved`:

```protobuf
message User {
  reserved 4, 7 to 9;
  reserved "old_phone";
}
```

Ngoài ra không đổi kiểu của field đang tồn tại (trừ vài cặp tương thích wire-format), và không đổi field giữa `repeated` và đơn lẻ.

</details>

**16. gRPC có 4 kiểu gọi: `unary`, `server streaming`, `client streaming`, `bidirectional streaming`. Mỗi kiểu hợp với bài toán nào?**

<details className="qa">
<summary>Xem đáp án</summary>

```protobuf
service UserService {
  rpc GetUser (UserRequest) returns (User);                    // unary
  rpc ListUsers (ListRequest) returns (stream User);           // server streaming
  rpc ImportUsers (stream User) returns (ImportSummary);       // client streaming
  rpc Chat (stream Message) returns (stream Message);          // bidirectional
}
```

| Kiểu | Mô hình | Hợp với |
|---|---|---|
| **Unary** | 1 request → 1 response | Đa số call thường ngày: lấy user, tạo đơn hàng — tương đương REST |
| **Server streaming** | 1 request → N response | Tải danh sách rất lớn theo từng phần, đẩy thông báo/giá real-time, theo dõi log hoặc tiến độ job |
| **Client streaming** | N request → 1 response | Upload file theo chunk, đẩy hàng loạt metric/telemetry rồi nhận một bản tổng kết |
| **Bidirectional** | N ↔ N, độc lập nhau | Chat, game multiplayer, đồng bộ hai chiều liên tục, voice/ảnh xử lý theo luồng |

Ưu điểm chung của streaming: tận dụng **một kết nối HTTP/2** duy nhất, xử lý dữ liệu **tăng dần** thay vì chờ gom hết vào bộ nhớ, và độ trễ thấp hơn so với polling.

</details>

**17. Vì sao browser không gọi trực tiếp được gRPC? `grpc-web` hoặc proxy giải quyết chuyện đó ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì gRPC cần **kiểm soát ở tầng khung HTTP/2** mà JavaScript trong browser không với tới được: nó cần đọc/ghi từng HTTP/2 frame, cần **trailer** (gRPC trả status trong trailing header sau body), và cần giữ luồng hai chiều lâu dài. API `fetch`/`XHR` chỉ cho phép thao tác ở mức request/response, không cho chạm vào frame hay trailer, và browser cũng không cho ứng dụng tự quyết dùng HTTP/2 hay không.

**grpc-web** giải quyết bằng cách định nghĩa một **wire format thân thiện với browser**: payload Protobuf được đóng gói sao cho gửi qua HTTP/1.1 hoặc HTTP/2 thường được, trailer được nhồi vào cuối body thay vì dùng trailer thật.

Kèm theo đó là một **proxy đứng giữa** (Envoy với filter gRPC-Web, hoặc `grpcwebproxy`): nhận request grpc-web từ browser, dịch sang gRPC chuẩn để gọi service backend, rồi dịch response ngược lại — đồng thời lo luôn CORS.

Hạn chế: grpc-web hỗ trợ **unary và server streaming**, **không hỗ trợ client streaming và bidirectional streaming**. Vì vậy public/browser-facing API thường vẫn dùng REST hoặc GraphQL, còn gRPC để lại cho giao tiếp nội bộ giữa các service.

</details>

**18. `tRPC` đạt được type-safe end-to-end mà không cần codegen bằng cơ chế nào? Giới hạn lớn nhất của nó là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

tRPC không sinh code — nó **suy luận kiểu (type inference) ngay trong TypeScript**. Server định nghĩa router, và kiểu của router được export **chỉ như một type**:

```ts
export const appRouter = t.router({
  getUser: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => db.user.findUnique({ where: { id: input.id } })),
});
export type AppRouter = typeof appRouter;
```

```ts
const user = await trpc.getUser.query({ id: "1" }); // user được suy kiểu tự động
```

Client import `AppRouter` như một type và dùng một proxy object; compiler TypeScript truy ngược từ định nghĩa procedure ra kiểu input/output. Vì mọi thứ xảy ra ở tầng type, sau khi build **không còn gì ở runtime** — type bị xoá sạch, chỉ còn lời gọi HTTP thường. Input được validate lúc chạy bằng Zod. Đổi tên field ở server là client **báo lỗi biên dịch ngay**, không cần bước codegen nào.

**Giới hạn lớn nhất:** chỉ chạy được khi **client và server dùng chung codebase TypeScript** (monorepo). Không dùng được cho public API, cho client Java/Swift/Go, hay cho đối tác third-party — những trường hợp đó cần contract độc lập ngôn ngữ như OpenAPI, GraphQL SDL hoặc `.proto`.

</details>

**19. Tình huống: app mobile chạy mạng yếu, nhiều màn hình cần các tập field khác nhau, team chỉ 3 người. Bạn chọn REST hay GraphQL và lập luận thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Bài toán này đúng "vùng thắng" của GraphQL (băng thông thấp, mỗi màn hình cần tập field khác nhau), **nhưng team chỉ 3 người** — và đó mới là ràng buộc quyết định.

Lựa chọn thực dụng: **bắt đầu bằng REST**, tối ưu đúng chỗ đau:

- Cho phép **sparse fieldsets**: `GET /users/1?fields=id,name,avatar` — giải quyết over-fetching mà không kéo theo hạ tầng GraphQL.
- Thêm vài **endpoint gộp theo màn hình (BFF-style)**: `GET /home-feed` trả sẵn đúng dữ liệu một màn hình cần, xử lý under-fetching.
- Bật **gzip/brotli**, `ETag` + `304`, phân trang cursor, nén ảnh — thường tiết kiệm băng thông nhiều hơn cả việc cắt field.

Lý do không chọn GraphQL ngay: chi phí vận hành (resolver, DataLoader chống N+1, depth/cost limit, mất HTTP cache, monitoring khó) là gánh nặng lớn với 3 người, trong khi lợi ích chưa chắc bù lại.

Sẽ đổi ý nếu: số màn hình và biến thể field bùng nổ khiến endpoint gộp nhân lên không kiểm soát, hoặc phải phục vụ nhiều loại client rất khác nhau. Lúc đó GraphQL đáng giá — và có thể đặt nó như một lớp trước các REST service sẵn có.

</details>

**20. Tình huống: hệ thống có 20 microservice nội bộ cộng một public API. Bạn phối hợp gRPC và REST ra sao, vai trò của `API gateway` hay `BFF` là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Chia theo ranh giới **trong nhà / ngoài đường**:

```
Client (web, mobile, third-party)
        │  REST + JSON (hoặc GraphQL)
        ▼
   API Gateway / BFF
        │  gRPC (Protobuf, HTTP/2)
        ▼
 20 microservice nội bộ  ←── gRPC giữa các service
```

- **Nội bộ dùng gRPC**: latency thấp, payload nhỏ, contract `.proto` chặt chẽ và cross-language, có streaming. Các service tin nhau, cùng team vận hành nên chi phí debug binary chấp nhận được.
- **Ra ngoài dùng REST + JSON**: third-party debug bằng `curl` được, tài liệu hoá bằng OpenAPI, ai cũng biết dùng, browser gọi trực tiếp được.

**API gateway** là cửa ngõ duy nhất, lo các mối quan tâm xuyên suốt: TLS termination, xác thực/phân quyền, rate limiting, routing, dịch REST ↔ gRPC, quan sát (log, trace, metric), che giấu cấu trúc nội bộ để refactor service không ảnh hưởng client.

**BFF (Backend For Frontend)** nằm cao hơn một bậc và gắn với **từng loại client** (web BFF, mobile BFF): gộp dữ liệu từ nhiều service thành đúng payload một màn hình cần, cắt bớt field cho mobile. Gateway lo hạ tầng; BFF lo hình dạng dữ liệu. Dự án nhỏ có thể gộp làm một, quy mô lớn nên tách.

</details>

**21. `OpenAPI`/`Swagger` mang lại lợi ích gì? So sánh cách làm `design-first` và `code-first`.**

<details className="qa">
<summary>Xem đáp án</summary>

**OpenAPI** là spec mô tả REST API bằng YAML/JSON (Swagger là tên cũ và là bộ công cụ quanh nó). Lợi ích:

- **Documentation** tự sinh, luôn có thể thử trực tiếp (Swagger UI, Redoc).
- **Client SDK codegen** cho hầu hết ngôn ngữ — frontend/mobile không viết tay tầng gọi API.
- **Mock server** để frontend làm việc song song trước khi backend xong.
- **Contract testing** và validate request/response tự động trong CI.
- Gateway (Kong, AWS API Gateway) đọc được spec để cấu hình routing, validation.

| | Design-first | Code-first |
|---|---|---|
| Thứ tự | Viết spec trước, code sau | Viết code trước, spec sinh ra từ annotation/type |
| Ưu | Thống nhất contract sớm, FE–BE làm song song, spec là nguồn sự thật, review API dễ | Nhanh, không lệch pha vì spec sinh từ chính code, ít công cụ phải học |
| Nhược | Cần kỷ luật, có thêm bước đồng bộ spec ↔ code | Spec bị "quyết định" bởi hiện thực, dễ ra API lộn xộn, FE phải chờ |
| Hợp với | API công khai, nhiều team/nhiều client | Team nhỏ, API nội bộ, cần đi nhanh |

FastAPI và NestJS sinh OpenAPI tự động từ code (code-first) — với đa số dự án đó là mặc định hợp lý; public API thì nên design-first.

</details>

**22. Triển khai `rate limiting` bằng thuật toán nào (`token bucket`, `sliding window`)? Nên trả về header gì để client tự điều tiết?**

<details className="qa">
<summary>Xem đáp án</summary>

| Thuật toán | Cách hoạt động | Ghi chú |
|---|---|---|
| **Fixed window** | Đếm request theo từng khung thời gian cố định | Đơn giản nhất, nhưng cho phép **burst gấp đôi** ở ranh giới hai khung |
| **Sliding window log** | Lưu timestamp từng request, đếm trong cửa sổ trượt | Chính xác tuyệt đối, tốn bộ nhớ |
| **Sliding window counter** | Nội suy giữa khung hiện tại và khung trước | Cân bằng tốt, rất phổ biến trong thực tế |
| **Token bucket** | Bucket có N token, nạp lại đều theo thời gian; mỗi request tiêu 1 token | **Cho phép burst có kiểm soát**, mượt — lựa chọn mặc định tốt |
| **Leaky bucket** | Request xếp hàng, chảy ra với tốc độ cố định | Làm phẳng traffic, phù hợp khi downstream cần tốc độ đều |

Hiện thực phân tán thường dùng **Redis** với script Lua để thao tác đếm/nạp token **nguyên tử**, key theo user ID hoặc API key (an toàn hơn theo IP vì NAT).

Header nên trả:

```
RateLimit-Limit: 100
RateLimit-Remaining: 7
RateLimit-Reset: 42          ← số giây tới khi reset
Retry-After: 42              ← kèm khi trả 429
```

Khi vượt hạn mức trả **`429 Too Many Requests`**. Nên khuyến nghị client retry với **exponential backoff + jitter** để tránh cả đàn cùng thử lại một lúc.

</details>

**23. So sánh `WebSocket`, `SSE`, GraphQL `subscription` và gRPC streaming cho tính năng real-time. Bạn chọn cái nào trong trường hợp nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | WebSocket | SSE | GraphQL subscription | gRPC streaming |
|---|---|---|---|---|
| Chiều truyền | Hai chiều | Một chiều (server → client) | Một chiều (thường qua WS) | Một hoặc hai chiều |
| Giao thức | Nâng cấp từ HTTP, protocol riêng | HTTP thường, `text/event-stream` | Trên WebSocket/SSE | HTTP/2 |
| Định dạng | Tuỳ ý (text/binary) | Text (UTF-8) | JSON theo schema | Protobuf binary |
| Tự reconnect | Tự làm | Có sẵn, kèm `Last-Event-ID` | Tuỳ lib client | Tuỳ lib |
| Browser | Hỗ trợ tốt | Hỗ trợ tốt, đi qua proxy dễ | Qua lib | Cần grpc-web (không có bidi) |
| Hạ tầng | Cần sticky session/pub-sub khi scale | Nhẹ, hạ tầng HTTP sẵn có | Kèm complexity GraphQL | Nội bộ là chính |

Chọn thế nào:

- **SSE** — server chỉ đẩy xuống: thông báo, giá cổ phiếu, tiến độ job, stream token của LLM. Đơn giản nhất, nên là lựa chọn đầu tiên.
- **WebSocket** — cần hai chiều độ trễ thấp: chat, collaborative editing, game, "đang gõ...".
- **GraphQL subscription** — hệ thống đã dùng GraphQL và muốn real-time cùng schema, cùng kiểu dữ liệu với query.
- **gRPC streaming** — giao tiếp **giữa các service nội bộ**, throughput cao, payload nhỏ; không dùng cho browser.

</details>

**24. Bạn cần đổi kiểu dữ liệu của một field trong response trong khi vẫn còn nhiều app mobile phiên bản cũ đang chạy. Bạn xử lý thế nào để không làm hỏng client?**

<details className="qa">
<summary>Xem đáp án</summary>

Đổi kiểu của field đang tồn tại là **breaking change** — app đã cài trên máy người dùng không thể ép update ngay, nên tuyệt đối không sửa tại chỗ.

Chiến lược an toàn (**expand and contract**):

- **Thêm field mới song song**, giữ field cũ nguyên kiểu:

```json
{
  "price": "100000",        // cũ: string — giữ nguyên cho app cũ
  "price_amount": 100000,   // mới: number
  "price_currency": "VND"
}
```

- Client mới đọc field mới; client cũ vẫn chạy bình thường. Thêm field optional là **không breaking**.
- Nếu thay đổi quá lớn để nhét chung, **ra version mới** (`/api/v2/...`) và cho tầng v1 map ngược từ dữ liệu mới.
- **Đo lường trước khi gỡ**: log theo phiên bản app/client để biết chính xác còn bao nhiêu người dùng field cũ.
- Công bố **lịch sunset** rõ ràng, đẩy update app, dùng cơ chế **force update** cho các bản quá cũ, rồi mới gỡ field cũ.

Bài học phòng ngừa: ngay từ đầu nên để client **bỏ qua field lạ** thay vì parse nghiêm ngặt, và tránh dùng kiểu dễ phải đổi (tiền tệ nên tách số nguyên đơn vị nhỏ nhất + mã tiền tệ ngay từ v1).

</details>

---

## 2. Authentication và Authorization

Bài học: [2. Authentication và Authorization](../../backend/04-apis/2_authentication.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt `authentication` và `authorization`. Cho một ví dụ lỗi thực tế khi code kiểm rất kỹ "đã đăng nhập chưa" nhưng quên bước còn lại.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Authentication (AuthN)** — *"bạn là ai?"*: xác minh danh tính, thường qua password, OTP, social login. Thất bại trả `401`.
- **Authorization (AuthZ)** — *"bạn được làm gì?"*: kiểm tra quyền trên tài nguyên cụ thể. Thất bại trả `403`.

Ví dụ toà nhà: lễ tân đối chiếu CMND là authentication; tấm thẻ từ chỉ lên nổi tầng 5 là authorization. Vào được toà nhà không có nghĩa mở được mọi cánh cửa.

**Lỗi thực tế kinh điển — IDOR (Insecure Direct Object Reference):**

```ts
// SAI: chỉ kiểm tra đã đăng nhập
app.get("/api/orders/:id", requireAuth, async (req, res) => {
  const order = await db.order.findUnique({ where: { id: req.params.id } });
  res.json(order); // user A đổi id thành đơn của user B là xem được!
});

// ĐÚNG: kiểm tra quyền sở hữu
const order = await db.order.findFirst({
  where: { id: req.params.id, userId: req.user.id },
});
if (!order) return res.status(404).end();
```

Quy tắc: **mọi truy vấn phải gắn điều kiện chủ sở hữu hoặc quyền**, không chỉ chặn ở tầng middleware đăng nhập.

</details>

**2. HTTP là `stateless`, vậy server "nhớ" được bạn đã đăng nhập bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

HTTP không có khái niệm "phiên" — mỗi request là một cuộc gọi độc lập, server không biết request này với request trước có cùng một người hay không. Để "nhớ", client phải **tự mang theo bằng chứng đã đăng nhập ở mọi request**. Có hai họ giải pháp:

- **Tham chiếu (session ID)** — sau khi login, server sinh một chuỗi random vô nghĩa (`opaque`), lưu ánh xạ `session_id → user_id, expires` vào Redis/DB, rồi trả về browser qua `Set-Cookie`. Browser tự đính kèm cookie mọi request; server lookup trong store để biết bạn là ai. Giống **vé gửi xe**: mảnh giấy tự nó vô nghĩa, thông tin nằm trong sổ của bác giữ xe.
- **Tự chứa (JWT / token)** — server đóng gói thông tin (`sub`, `role`, `exp`) và **ký số**, gửi cho client. Mỗi request client gửi lại qua header `Authorization: Bearer ...`; server chỉ verify chữ ký, không cần tra DB. Giống **bằng lái có dấu nổi**.

Điểm chung: trạng thái đăng nhập nằm ở **thứ client mang theo**, còn giao thức HTTP vẫn stateless như cũ.

</details>

**3. Mô tả flow `session-based auth` từ lúc user submit form login tới lúc request tiếp theo được nhận diện. Server lưu gì, client giữ gì?**

<details className="qa">
<summary>Xem đáp án</summary>

```
1. POST /login với email + password.
2. Server tra DB, so password với hash (bcrypt/argon2id).
3. Hợp lệ → sinh session ID random đủ dài (≥128 bit entropy).
4. Server lưu: session_id → { user_id, created_at, expires, ip, user_agent }
   vào Redis/DB.
5. Trả về: Set-Cookie: session_id=abc; HttpOnly; Secure; SameSite=Lax; Max-Age=...
6. Request sau: browser TỰ đính kèm cookie.
7. Server lookup session ID trong store → biết user → check permission.
8. Logout → xoá record khỏi store (cookie thành vô dụng ngay).
```

**Server giữ:** toàn bộ dữ liệu phiên (user id, thời hạn, metadata) trong session store.

**Client giữ:** chỉ mỗi **session ID** — một chuỗi vô nghĩa, không mang thông tin gì, không tự giải mã ra được.

Lưu ý khi scale: nhiều instance phải **dùng chung một session store** (Redis), nếu không user login ở instance A sẽ không được nhận diện ở instance B. Nên sinh session ID mới sau khi login thành công để chống **session fixation**.

</details>

**4. Các cookie flag `HttpOnly`, `Secure`, `SameSite`, `Max-Age` mỗi cái chặn được rủi ro nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Flag | Tác dụng | Rủi ro chặn được |
|---|---|---|
| `HttpOnly` | JavaScript không đọc được cookie (`document.cookie`) | **XSS** đánh cắp session — script chèn vào trang không lấy được token |
| `Secure` | Chỉ gửi cookie qua HTTPS | **Nghe lén trên mạng** (man-in-the-middle, Wi-Fi công cộng) |
| `SameSite` | Giới hạn gửi cookie khi request đến từ site khác | **CSRF** — `Strict` chặn hoàn toàn, `Lax` cho phép điều hướng GET top-level, `None` phải kèm `Secure` |
| `Max-Age` / `Expires` | Đặt tuổi thọ cookie | Giới hạn **cửa sổ thiệt hại** khi cookie bị lộ; không có thì thành session cookie mất khi đóng browser |

```ts
res.cookie("session_id", sessionId, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
});
```

Bổ sung: `Domain`/`Path` thu hẹp phạm vi gửi cookie; tiền tố `__Host-` bắt buộc cookie phải có `Secure`, `Path=/` và không có `Domain`, chống subdomain ghi đè cookie.

</details>

**5. `JWT` gồm mấy phần? `signature` được tạo ra sao, và nó bảo đảm điều gì — quan trọng hơn là không bảo đảm điều gì?**

<details className="qa">
<summary>Xem đáp án</summary>

JWT gồm **ba phần** ngăn bởi dấu chấm: `header.payload.signature`, mỗi phần là base64url.

```json
// Header
{ "alg": "HS256", "typ": "JWT" }

// Payload
{ "sub": "user-123", "role": "admin", "iat": 1717200000, "exp": 1717286400 }

// Signature
HMAC-SHA256(base64(header) + "." + base64(payload), secret)
```

Với thuật toán đối xứng (`HS256`) chữ ký là HMAC bằng secret chung; với bất đối xứng (`RS256`, `ES256`) là chữ ký bằng private key, ai cũng verify được bằng public key.

**Bảo đảm:** tính **toàn vẹn** và **nguồn gốc** — nội dung không bị sửa, và token do bên giữ khoá phát ra. Sửa một ký tự trong payload là chữ ký sai ngay.

**KHÔNG bảo đảm:** tính **bí mật**. Payload chỉ được **encode base64, không mã hoá** — ai cầm token cũng decode đọc được toàn bộ nội dung. Cũng không bảo đảm token còn hiệu lực về mặt nghiệp vụ: chữ ký đúng không có nghĩa user chưa bị khoá hay chưa logout.

</details>

**6. Vì sao nói payload của `JWT` không phải chỗ để giấu bí mật? Bạn nên và không nên đặt claim gì vào đó?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì payload chỉ **base64url encode**, không hề encrypt. Bất kỳ ai chặn được token — hoặc chính người dùng mở DevTools — đều dán vào jwt.io là đọc sạch nội dung. Chữ ký chỉ **chống sửa**, không **che nội dung**, đúng như ẩn dụ tấm bằng lái: con dấu nổi chống làm giả nhưng chữ in trên thẻ thì ai cũng đọc được.

```js
// SAI
const token = jwt.sign({ password: hashedPw, ssn: "...", salary: 5000 }, secret);
```

**Nên đặt:** `sub` (user id), `role`/`scope` cơ bản, `iat`, `exp`, `iss`, `aud`, `jti` (id token để blacklist), và vài field hiển thị không nhạy cảm.

**Không nên đặt:** password dù đã hash, số CMND/CCCD, số thẻ, thông tin y tế, lương, khoá API, dữ liệu nội bộ tiết lộ kiến trúc hệ thống. Cũng nên tránh nhồi quá nhiều quyền chi tiết vào token — token phình to (đi kèm mọi request) và quyền bị "đóng băng" tới khi hết hạn.

Nếu thật sự cần giấu nội dung, dùng **JWE** (JSON Web Encryption) hoặc đơn giản là quay về opaque token và tra ở server.

</details>

**7. So sánh `session ID` với `JWT` ở bốn khía cạnh: cách verify, khả năng revoke, chi phí scale, và nơi lưu phía browser. Khi nào bạn chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | **Session ID** | **JWT** |
|---|---|---|
| **Verify** | Lookup store (Redis/DB) mỗi request | Verify chữ ký bằng secret/public key, không chạm DB |
| **Revoke** | Tức thì — xoá record khỏi store | Khó — token còn hiệu lực tới `exp`, phải thêm blacklist hoặc token version |
| **Scale** | Cần session store dùng chung; thêm một round-trip mỗi request | Stateless, scale ngang dễ, nhưng token to hơn và đi kèm mọi request |
| **Nơi lưu (browser)** | Cookie `HttpOnly` | Tốt nhất **cũng là** cookie `HttpOnly` (không dùng localStorage) |

**Chọn session** khi: web app truyền thống render phía server, single domain, yêu cầu bảo mật cao cần khoá phiên tức thì (banking, admin panel), số lượng session vừa phải.

**Chọn JWT** khi: API cho mobile/third-party, kiến trúc microservices cần verify độc lập không gọi về auth service, cần cross-domain.

**Thực tế 2026 thường lai cả hai:** JWT access token sống rất ngắn (5–15 phút) + refresh token lưu server-side (revoke được như session). Lấy được ưu điểm stateless mà vẫn kiểm soát được phiên đăng nhập.

</details>

**8. User bấm logout nhưng `JWT` của họ còn hạn 20 phút. Làm sao chặn token đó ngay lập tức? Nêu ít nhất ba cách và đánh đổi của từng cách.**

<details className="qa">
<summary>Xem đáp án</summary>

Bản chất vấn đề: JWT tự chứng minh tính hợp lệ, server không giữ danh sách token đã phát nên mặc định **không thể thu hồi**.

- **Blacklist / denylist** — lưu `jti` của token đã logout vào Redis với TTL bằng thời gian còn lại. Verify xong phải tra thêm Redis. *Đánh đổi:* mất tính stateless, thêm một lookup mỗi request — nhưng TTL ngắn nên store rất nhỏ.

- **Token version / `tokenVersion` trong DB** — mỗi user có một số phiên bản; token mang theo version lúc phát. Logout toàn bộ thiết bị chỉ cần tăng version. *Đánh đổi:* vẫn phải tra DB (hoặc cache) mỗi request; không thu hồi riêng lẻ từng thiết bị nếu chỉ có một biến đếm.

- **Access token sống rất ngắn + refresh token server-side** — cách phổ biến nhất. Access token 5–15 phút, logout chỉ cần xoá refresh token. *Đánh đổi:* còn cửa sổ vài phút token cũ dùng được — chấp nhận được với hầu hết ứng dụng.

- **Quay về opaque token / session** cho các luồng cần revoke tuyệt đối. *Đánh đổi:* mất lợi ích stateless hoàn toàn.

</details>

**9. Vì sao phải tách `access token` và `refresh token`? Đặt thời hạn mỗi loại bao nhiêu và lý do?**

<details className="qa">
<summary>Xem đáp án</summary>

Lý do tách là **giảm bề mặt rủi ro**:

- **Access token** đi kèm **mọi request** tới API, qua nhiều tầng proxy, log, thiết bị — xác suất bị lộ cao. Nên nó phải **sống ngắn**: lộ thì thiệt hại chỉ giới hạn trong vài phút.
- **Refresh token** chỉ xuất hiện khi đổi token mới, gửi tới **một endpoint duy nhất** (`/refresh`) — ít di chuyển nên ít rủi ro hơn, vì vậy được phép sống dài.

Đúng như ẩn dụ toà nhà: thẻ khách 1 giờ bạn cầm đi quẹt khắp nơi nên dễ rơi; tờ giấy hẹn dài hạn nằm im trong ví.

Thời hạn thường dùng:

| Loại | Thời hạn điển hình | Lý do |
|---|---|---|
| Access token | 5–15 phút (tối đa ~1 giờ) | Cửa sổ thiệt hại ngắn khi bị lộ |
| Refresh token | 7–30 ngày (web), có thể lâu hơn cho mobile | Tránh bắt user đăng nhập lại liên tục |

Refresh token nên **lưu server-side** (hash trong DB) để revoke được, đặt trong cookie `HttpOnly` với `Path` giới hạn ở endpoint refresh, và áp dụng **rotation + reuse detection**. Ứng dụng nhạy cảm (ngân hàng) rút ngắn cả hai và thêm idle timeout.

</details>

**10. Lưu token ở `localStorage`, cookie `httpOnly`, hay biến trong memory? Phân tích đánh đổi giữa `XSS` và `CSRF` cho từng lựa chọn.**

<details className="qa">
<summary>Xem đáp án</summary>

| Nơi lưu | Bị XSS? | Bị CSRF? | Ghi chú |
|---|---|---|---|
| **localStorage** | **Có** — JS đọc được, script độc lấy token trong một dòng | Không (phải tự gắn header) | Tiện cho SPA nhưng rủi ro cao nhất |
| **Cookie `httpOnly`** | Không đọc được trực tiếp | **Có** — browser tự gửi kèm | An toàn nhất, nhưng phải chống CSRF |
| **Biến trong memory** | Khó lấy hơn, nhưng XSS vẫn can thiệp được | Không | Mất khi reload tab → phải xin lại token |

**Đánh đổi cốt lõi:** XSS và CSRF là hai mối đe doạ khác nhau, và **XSS nguy hiểm hơn** — nếu đã dính XSS thì kẻ tấn công thực thi code trong ngữ cảnh trang của bạn và gần như mọi biện pháp đều bị vượt qua. Vì vậy ưu tiên chống XSS trước.

Pattern được khuyến nghị: **cookie `httpOnly` + `secure` + `sameSite=lax`**, và với thao tác ghi thì thêm **CSRF token** (hoặc double-submit cookie). `SameSite` đã chặn phần lớn CSRF nhưng không nên là lớp phòng thủ duy nhất.

Biến thể phổ biến cho SPA: **access token giữ trong memory** + **refresh token trong cookie `httpOnly`** — reload trang thì gọi `/refresh` lấy lại access token.

</details>

**11. Giải thích `algorithm confusion attack` (`alg: none`, đổi `RS256` sang `HS256`). Verify token thế nào cho đúng?**

<details className="qa">
<summary>Xem đáp án</summary>

Lỗ hổng nằm ở chỗ **header của token do chính kẻ tấn công kiểm soát**, mà một số thư viện lại tin vào trường `alg` trong đó để chọn cách verify.

- **`alg: none`** — attacker sửa header thành `{"alg":"none"}`, xoá phần chữ ký. Thư viện cũ hiểu là "token không cần ký" và chấp nhận payload tuỳ ý, kể cả `"role":"admin"`.
- **Đổi `RS256` sang `HS256`** — hệ thống dùng cặp khoá bất đối xứng, **public key ai cũng lấy được**. Attacker đổi header sang `HS256` rồi ký token bằng chính public key đó. Server gọi `verify(token, publicKey)`, thấy `alg=HS256` nên dùng public key làm **secret HMAC** — và chữ ký khớp.

**Verify đúng:**

```js
// SAI — để thư viện tự đọc alg từ header
jwt.verify(token, key);

// ĐÚNG — chỉ định tường minh thuật toán chấp nhận
jwt.verify(token, key, {
  algorithms: ["RS256"],
  issuer: "https://auth.example.com",
  audience: "my-api",
});
```

Nguyên tắc: **thuật toán do server quyết định, không do token khai báo**; không bao giờ cho phép `none`; dùng khoá riêng biệt cho từng thuật toán; và dùng thư viện được bảo trì, cập nhật thường xuyên.

</details>

**12. Ngoài `exp`, khi verify `JWT` bạn còn phải kiểm những claim nào (`iss`, `aud`, `sub`, `nbf`) và vì sao bỏ qua chúng lại nguy hiểm?**

<details className="qa">
<summary>Xem đáp án</summary>

| Claim | Ý nghĩa | Bỏ qua thì sao |
|---|---|---|
| `iss` (issuer) | Ai phát hành token | Chấp nhận token từ một IdP khác hoặc tenant khác; kẻ tấn công tự dựng issuer của mình |
| `aud` (audience) | Token dành cho dịch vụ nào | Token cấp cho **service A** lại dùng được ở **service B** — leo quyền ngang giữa các hệ thống |
| `sub` (subject) | Định danh user | Không xác định được chủ thể; phải dùng cặp `iss + sub` mới duy nhất trên toàn hệ thống |
| `nbf` (not before) | Chưa hiệu lực trước thời điểm này | Token phát trước cho tương lai dùng được sớm hơn dự kiến |
| `iat` (issued at) | Thời điểm phát hành | Không phát hiện được token quá cũ; không áp được chính sách "yêu cầu đăng nhập lại sau X" |
| `jti` | Id duy nhất của token | Không blacklist/chống replay theo từng token được |

Ngoài ra khi dùng OIDC còn phải kiểm `nonce` (chống replay `id_token`) và, nếu khoá xoay vòng, phải chọn đúng khoá theo `kid` từ JWKS endpoint.

Kịch bản nguy hiểm điển hình: hệ thống có nhiều microservice cùng dùng chung một auth server. Nếu service thanh toán không kiểm `aud`, token được cấp cho service chat (scope thấp) sẽ mở được cả API thanh toán.

</details>

**13. Mô tả flow `OAuth 2.0 Authorization Code`. Vì sao phải đổi `authorization code` lấy token ở server thay vì trả token thẳng về browser?**

<details className="qa">
<summary>Xem đáp án</summary>

```
1. User click "Login with Google".
2. App redirect → Google /authorize?client_id=...&scope=...&redirect_uri=...&state=...
3. User đăng nhập Google và đồng ý cấp quyền.
4. Google redirect về redirect_uri kèm ?code=...&state=...
5. App (server-side) POST /token với code + client_id + client_secret.
6. Google trả access_token (+ refresh_token, id_token nếu là OIDC).
7. App dùng access_token gọi Google API.
```

Điểm mấu chốt: user gõ mật khẩu **trên trang của Google**, app không bao giờ thấy password — đúng như ẩn dụ "xin giấy uỷ quyền ở ban quản lý thay vì đưa chìa khoá nhà".

**Vì sao đổi code ở server:**

- `code` đi qua **URL và lịch sử trình duyệt**, có thể lọt vào log của proxy/server và header `Referer`. Nếu đó đã là token thì token bị lộ ngay.
- `code` **dùng một lần, sống rất ngắn** (thường 30–60 giây) và vô dụng nếu không kèm `client_secret` — kẻ chặn được code cũng không đổi ra token được.
- `client_secret` phải nằm ở **backend**, không thể giấu trong JS của browser hay trong app mobile đã build.
- Bước đổi ở server còn cho phép app tự kiểm soát việc lưu token, gắn với phiên của mình và thu hồi khi cần.

Với client công khai (SPA, mobile) không giữ được secret thì dùng **PKCE** thay cho `client_secret`.

</details>

**14. `PKCE` sinh ra để vá lỗ hổng nào trên mobile/SPA? `code_verifier` và `code_challenge` hoạt động ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Lỗ hổng:** client công khai (app mobile, SPA) **không giữ được `client_secret`** — ai cũng có thể giải nén APK hoặc đọc bundle JS để lấy. Trên mobile, `redirect_uri` dùng custom scheme (`myapp://callback`) mà **nhiều app có thể cùng đăng ký một scheme**; một app độc hại chặn được callback sẽ cướp `authorization code` và tự đổi ra token.

**Cách PKCE hoạt động:**

```
1. Client sinh code_verifier: chuỗi random 43–128 ký tự.
2. code_challenge = BASE64URL( SHA256(code_verifier) )
3. /authorize?...&code_challenge=<...>&code_challenge_method=S256
   → Authorization server ghi nhớ challenge kèm code.
4. Nhận code → POST /token với code + code_verifier (bản gốc).
5. Server tự tính SHA256(code_verifier) và so với challenge đã lưu.
   Khớp → phát token. Không khớp → từ chối.
```

Kẻ cướp được `code` trên đường callback **không có `code_verifier`** (nó chưa bao giờ rời khỏi bộ nhớ của client hợp lệ), nên không đổi ra token được. Thực chất PKCE là một `client_secret` **sinh động cho từng lần đăng nhập**.

Luôn dùng `code_challenge_method=S256`, không dùng `plain`. **OAuth 2.1 bắt buộc PKCE cho mọi client**, kể cả client bí mật.

</details>

**15. Tham số `state` trong OAuth dùng để làm gì? Bỏ nó đi thì bị tấn công kiểu gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`state` là một giá trị **random, không đoán được**, do client sinh trước khi redirect sang authorization server; server trả lại y nguyên ở callback. Client so sánh giá trị nhận được với giá trị đã lưu trong session — không khớp thì huỷ luồng đăng nhập.

Hai công dụng: **chống CSRF trên luồng OAuth** (*login CSRF* / *session fixation*) — đây là mục đích chính; và **mang theo ngữ cảnh** (nhớ trang user định vào trước khi bị đẩy đi đăng nhập).

**Nếu bỏ `state`:** kẻ tấn công tự khởi tạo luồng OAuth với tài khoản **của hắn**, lấy được `code`, rồi lừa nạn nhân mở link `https://app.com/callback?code=<code_cua_attacker>`. App của nạn nhân đổi code ra token và **liên kết tài khoản của attacker vào phiên của nạn nhân**. Hậu quả: nạn nhân tưởng đang dùng tài khoản mình, mọi thao tác (upload tài liệu, nhập thẻ) thực ra diễn ra trên tài khoản kẻ tấn công — và hắn đăng nhập vào xem được tất cả.

Lưu ý: `state` chống CSRF, **`nonce`** (của OIDC) chống replay `id_token` — hai thứ khác nhau, nên dùng cả hai.

</details>

**16. `OAuth 2.0` khác `OpenID Connect` chỗ nào? `access_token` và `id_token` mỗi cái dùng vào việc gì, và vì sao không nên dùng `access_token` để xác định danh tính?**

<details className="qa">
<summary>Xem đáp án</summary>

**OAuth 2.0 chỉ là authorization** — nó cấp cho app quyền *truy cập tài nguyên* thay mặt user, chứ không nói "user này là ai". **OIDC là một lớp identity mỏng đặt trên OAuth 2.0**, bổ sung `id_token` cùng scope `openid`, endpoint `/userinfo` và discovery document.

| | `access_token` | `id_token` |
|---|---|---|
| Dành cho | **Resource server** (API) | **Chính app client** |
| Trả lời | "Được phép làm gì" | "Người dùng là ai" |
| Định dạng | Có thể opaque hoặc JWT | Luôn là JWT |
| Nội dung | scope, quyền | `sub`, `email`, `name`, `iss`, `aud`, `nonce` |

**Vì sao không dùng `access_token` để xác định danh tính:**

- `access_token` **không được thiết kế để client đọc** — nó có thể là chuỗi opaque, và định dạng có thể đổi bất cứ lúc nào mà không coi là breaking change.
- `aud` của nó trỏ tới **API**, không trỏ tới app của bạn. Nếu bạn nhận `access_token` từ client rồi coi đó là bằng chứng danh tính, kẻ tấn công có thể đưa token nó lấy được từ **một app khác** cùng authorization server — đây chính là *confused deputy* / token substitution.
- Nó không có `nonce` nên không chống được replay.

Đúng cách: xác thực bằng `id_token` (kiểm `iss`, `aud`, `nonce`, chữ ký) hoặc gọi `/userinfo` bằng access token ở **backend**, không tin dữ liệu client tự khai.

</details>

**17. Vì sao `OAuth 2.1` khai tử `Implicit grant` và `Password grant`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Implicit grant** (trả `access_token` thẳng về browser qua fragment của URL) bị loại vì:

- Token nằm trong **URL** → lọt vào lịch sử trình duyệt, log của proxy, header `Referer`.
- **Không có refresh token** an toàn → buộc để access token sống dài, hoặc dùng iframe ẩn (nay hỏng vì trình duyệt chặn third-party cookie). → Thay thế bằng **Authorization Code + PKCE**, hoạt động tốt cho cả SPA.

**Password grant** (Resource Owner Password Credentials — app tự thu password của user rồi gửi đi) bị loại vì:

- **Phá vỡ đúng lý do OAuth tồn tại**: app lại chạm vào password của user.
- Không tương thích với **MFA**, passkey, captcha.
- Tạo thói quen nguy hiểm: người dùng quen gõ mật khẩu vào giao diện bên thứ ba → mồi ngon cho phishing, và không dùng được với federation/SSO. → Thay thế bằng Authorization Code + PKCE (kể cả app "của chính mình"), hoặc Device Code flow cho thiết bị không có trình duyệt.

OAuth 2.1 đồng thời **bắt buộc PKCE** và yêu cầu `redirect_uri` so khớp chính xác.

</details>

**18. Khi nào dùng `Client Credentials grant` thay vì `Authorization Code grant`?**

<details className="qa">
<summary>Xem đáp án</summary>

Ranh giới rất rõ: có **con người** trong luồng hay không.

- **Authorization Code (+ PKCE)** — khi app hành động **thay mặt một người dùng** và cần sự đồng ý của họ. Có bước redirect, màn hình đăng nhập, màn hình cấp quyền. Token gắn với `sub` là user.
- **Client Credentials** — khi **không có user nào cả**: một service tự xác thực bằng `client_id` + `client_secret` (hoặc mTLS, private key JWT) để lấy token đại diện cho **chính nó**.

```
POST /token
grant_type=client_credentials
&client_id=service-a&client_secret=...&scope=orders:read
```

Trường hợp dùng Client Credentials:

- **Service-to-service / machine-to-machine**: backend gọi backend, microservice gọi microservice.
- **Cron job, worker, batch ETL** chạy nền.
- **CLI/daemon nội bộ** truy cập API của chính tổ chức mình.

Lưu ý: grant này chỉ dành cho **confidential client** giữ được secret ở phía server — tuyệt đối không dùng trong SPA hay app mobile, vì secret sẽ lộ. Quyền nên cấp theo scope tối thiểu, token sống ngắn, không phát refresh token (cứ hết hạn thì xin lại), và secret phải rotate định kỳ.

</details>

**19. `API key` khác token của người dùng ở điểm nào? Bạn lưu, verify, phân scope và rotate API key trong DB ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Khác biệt cốt lõi:** API key định danh **ứng dụng/tổ chức**, không phải con người; nó là **secret tĩnh sống rất lâu**, không có thời hạn tự nhiên, không đại diện cho một phiên đăng nhập. Token người dùng (JWT/session) gắn với một danh tính cụ thể, sống ngắn và sinh ra từ một lần xác thực. Giống **thẻ hội viên phòng gym**: dùng để đếm lượt và tính tiền, không chứng minh nhân thân.

**Lưu:** không bao giờ lưu plaintext. Sinh khoá đủ entropy, hiển thị cho user **đúng một lần**, DB chỉ giữ bản băm:

```ts
const key = crypto.randomBytes(32).toString("hex");
const hashed = await bcrypt.hash(key, 10);
await db.apiKey.create({ data: { hash: hashed, userId, scopes } });
return { key }; // user thấy 1 lần, sau đó chỉ còn hash
```

**Verify:** thêm **prefix** để nhận diện (`sk_live_`, `pk_test_`) và lưu kèm một phần định danh công khai để tra đúng bản ghi thay vì quét toàn bảng. So sánh phải dùng hàm **constant-time**.

**Scope:** mỗi key gắn danh sách quyền tối thiểu (`orders:read`), giới hạn theo IP/domain nếu được, và rate limit riêng từng key.

**Rotate:** cho phép một tài khoản có **nhiều key hoạt động song song** để xoay không downtime — tạo key mới, chuyển dần traffic, theo dõi `last_used_at`, rồi thu hồi key cũ. Revoke ngay khi nghi lộ, và ghi audit log mọi lần tạo/xoá.

</details>

**20. `SAML` và `OIDC` khác nhau thế nào? Vì sao khách hàng enterprise B2B vẫn đòi SAML?**

<details className="qa">
<summary>Xem đáp án</summary>

| | **SAML 2.0** | **OIDC** |
|---|---|---|
| Năm | 2005 | 2014 |
| Định dạng | XML assertion ký số | JWT (`id_token`) |
| Nền tảng | Giao thức riêng, dựa trên XML-DSig | Xây trên OAuth 2.0 + REST/JSON |
| Truyền tải | Form POST / redirect với XML | HTTP redirect + JSON endpoint |
| Hợp với | Web app doanh nghiệp, trình duyệt | Web, SPA, mobile, API |
| Cấu hình | Metadata XML, chứng chỉ, thủ công nhiều | Discovery document tự động, JWKS |
| Độ nặng | Verbose, khó debug | Gọn, dễ tích hợp |

**Vì sao B2B vẫn đòi SAML:**

- **Hạ tầng IdP đã có sẵn** — Active Directory Federation Services, Okta, OneLogin, Ping đã chạy SAML cả chục năm; đội IT có sẵn quy trình cấp phát và audit.
- **Đội bảo mật/compliance quen SAML** — có tài liệu, có checklist kiểm toán, đưa vào hợp đồng và yêu cầu mua hàng.
- **Tính năng doanh nghiệp** — attribute mapping phong phú, ánh xạ nhóm/phòng ban, IdP-initiated login (user bấm icon app từ dashboard của Okta), kết hợp SCIM để tự động cấp/thu hồi tài khoản.
- **Chi phí đổi rất cao** — hàng trăm ứng dụng nội bộ đang tích hợp SAML, không ai muốn migrate.

Thực dụng: đừng tự implement SAML. Dùng WorkOS, Auth0, Keycloak để nhận SAML ở ngoài rìa rồi quy về một mô hình phiên thống nhất bên trong.

</details>

**21. Tình huống: bạn nghi `refresh token` của một user bị đánh cắp. Thiết kế `refresh token rotation` + `reuse detection` để phát hiện và giới hạn thiệt hại.**

<details className="qa">
<summary>Xem đáp án</summary>

**Rotation:** mỗi lần gọi `/refresh`, server phát **refresh token mới** và **vô hiệu hoá token vừa dùng**. Một refresh token chỉ dùng được đúng một lần.

**Reuse detection:** nếu một token đã bị đánh dấu "đã dùng" lại xuất hiện lần nữa → chắc chắn có hai bên cùng giữ token → **coi như bị đánh cắp**, huỷ toàn bộ **family** token của phiên đó, bắt user đăng nhập lại và gửi cảnh báo.

Mô hình dữ liệu:

```
refresh_tokens(
  id, user_id,
  family_id,          -- gắn cả chuỗi xoay vòng của một phiên đăng nhập
  token_hash,         -- luôn lưu hash, không lưu plaintext
  used_at, revoked_at, expires_at,
  ip, user_agent
)
```

Luồng xử lý:

1. Nhận refresh token → tra theo hash.
2. Không tồn tại / hết hạn → từ chối.
3. Đã `used_at` hoặc `revoked_at` → **reuse!** → revoke toàn bộ `family_id`, ghi audit log, cảnh báo user, trả `401`.
4. Hợp lệ → đánh dấu đã dùng, phát access token mới + refresh token mới cùng `family_id`.

Bổ sung: đặt refresh token trong cookie `HttpOnly` với `Path` giới hạn ở `/refresh`, xử lý `/refresh` trong transaction hoặc có lock để tránh race khi client gửi nhiều request song song (thường cho một khoảng ân hạn vài giây), giới hạn tổng thời gian sống của family, và ghi nhận bất thường về IP/thiết bị.

</details>

**22. Password phải hash bằng thuật toán nào và vì sao không dùng `SHA-256`? Login endpoint cần thêm phòng thủ gì (rate limit, lockout, thông báo lỗi mơ hồ)?**

<details className="qa">
<summary>Xem đáp án</summary>

**Dùng:** `argon2id` (ưu tiên), `bcrypt` (cost 12+), hoặc `scrypt`/`PBKDF2` khi bị ràng buộc bởi chuẩn tuân thủ.

**Vì sao không dùng `SHA-256`:** nó **được thiết kế để chạy nhanh** — đúng thứ ta không muốn. GPU băm SHA-256 hàng tỉ lần mỗi giây, nên database bị lộ có thể bị dò trong thời gian ngắn. Thuật toán password hashing ngược lại **chậm có chủ đích**, có tham số điều chỉnh số vòng lặp và **bộ nhớ tiêu tốn** (argon2/scrypt buộc tốn RAM khiến GPU mất lợi thế), kèm **salt tự động** nên rainbow table vô dụng.

**Phòng thủ cho login endpoint:**

- **Rate limit** theo IP **và** theo tài khoản (5 lần / 15 phút), exponential backoff.
- **Lockout tạm thời** sau X lần sai — cẩn thận vì lockout cứng có thể bị lợi dụng để khoá tài khoản người khác (DoS).
- **Thông báo lỗi mơ hồ**: luôn trả "Email hoặc mật khẩu không đúng" — tránh cho kẻ tấn công dò danh sách tài khoản. Nên hash một giá trị giả cả khi user không tồn tại để **thời gian phản hồi như nhau**.
- **CAPTCHA** sau vài lần thất bại, **2FA**, cảnh báo email khi đăng nhập từ thiết bị lạ.

</details>

**23. Thiết kế luồng `password reset` qua email và `2FA` bằng `TOTP` — những chỗ nào dễ làm sai?**

<details className="qa">
<summary>Xem đáp án</summary>

**Password reset:**

```
1. POST /forgot-password { email }
   → LUÔN trả cùng một thông báo, dù email có tồn tại hay không.
2. Sinh token random đủ entropy (≥32 byte), lưu HASH vào DB
   kèm user_id, expires_at (15–60 phút), used_at.
3. Gửi link: https://app.com/reset?token=...
4. POST /reset-password { token, newPassword }
   → tra hash, kiểm hạn, kiểm chưa dùng → đổi password
   → đánh dấu token đã dùng, HUỶ TOÀN BỘ session/refresh token hiện có
   → gửi email thông báo "mật khẩu vừa được đổi".
```

Chỗ dễ sai: token đoán được hoặc lưu plaintext; token không hết hạn hoặc dùng lại được nhiều lần; tiết lộ email có tồn tại hay không; quên huỷ các phiên cũ (kẻ tấn công vẫn còn session); đặt token trong URL bị rò qua `Referer`; không rate limit nên endpoint bị dùng để spam mail.

**TOTP 2FA:** server sinh secret, hiển thị QR (`otpauth://`), user quét bằng Google Authenticator; mã 6 số đổi mỗi 30 giây, tính từ secret + thời gian.

Chỗ dễ sai: không cho **cửa sổ lệch giờ** (nên chấp nhận ±1 bước) hoặc cho quá rộng; **không chặn tái sử dụng mã** trong cùng chu kỳ (phải lưu mã/bước đã dùng); **không rate limit** bước nhập mã khiến brute-force 6 số khả thi; lưu secret không mã hoá; **quên bắt xác thực 2FA khi tắt 2FA** hoặc khi đổi số điện thoại; và quan trọng nhất — **không phát mã dự phòng (recovery codes)**, hoặc phát nhưng lưu plaintext. Ngoài ra luồng reset password không được là đường vòng để bỏ qua 2FA.

</details>

**24. `Passkeys`/`WebAuthn` chống `phishing` gần như tuyệt đối nhờ cơ chế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Passkey thay password bằng **cặp khoá bất đối xứng**: khi đăng ký, thiết bị sinh private key và **giữ trong phần cứng bảo mật** (Secure Enclave, TPM), chỉ gửi **public key** cho server. Khi đăng nhập, server gửi một `challenge` ngẫu nhiên, thiết bị ký bằng private key sau khi user xác nhận bằng sinh trắc học hoặc PIN.

Ba cơ chế cộng lại tạo ra khả năng chống phishing:

- **Không có secret nào để gõ ra** — không có mật khẩu hay OTP để user vô tình nhập vào trang giả. Private key không bao giờ rời thiết bị.
- **Gắn chặt với origin (quan trọng nhất)** — mỗi credential đăng ký với đúng một `rpId` (tên miền). Trình duyệt **tự kiểm tra tên miền hiện tại** trước khi ký; trang `g00gle.com` xin chữ ký cho `google.com` bị từ chối ngay ở tầng browser, user không có cơ hội sai. Đây là điểm khiến passkey mạnh hơn TOTP và SMS OTP, vốn vẫn bị chuyển tiếp qua trang giả theo thời gian thực.
- **Challenge ngẫu nhiên mỗi lần** — chữ ký không tái sử dụng được, chống replay.

Kèm theo đó: database bị lộ cũng chỉ mất public key (vô hại).

</details>
