---
sidebar_position: 1
title: "1. API Styles: REST, GraphQL, gRPC"
---

# API Styles: REST, GraphQL, gRPC

API Style là phong cách thiết kế API, tức là cách client và server "nói chuyện" với nhau qua mạng. Bài này giới thiệu các phong cách phổ biến như REST, GraphQL, gRPC, tRPC và SOAP, cùng cách chọn cái phù hợp cho từng tình huống. Hiểu chúng giúp bạn xây dựng giao tiếp giữa frontend và backend đúng đắn, dễ dùng và hiệu quả.

[![Sơ đồ tóm tắt bài: API Styles: REST, GraphQL, gRPC](/img/backend/api-styles.webp)](pathname:///img/backend/api-styles.webp)

---

:::note[Ghi nhớ nhanh]

- ⭐ **`REST` + JSON là default cho ~80% web app** — resource-based URL, HTTP method, status code chuẩn, stateless.
- **Mỗi style trả lời 4 câu hỏi**: transport, format, contract, paradigm (trục resource-vs-RPC và text-vs-binary).
- **`GraphQL`** cho client tự chọn field (tiết kiệm bandwidth mobile) nhưng caching khó + dễ dính N+1.
- **`gRPC`** (Protobuf binary, HTTP/2) cho microservice internal low-latency; **`tRPC`** type-safe cho full-stack TypeScript.
- ⭐ **Đừng over-engineer** — chỉ thêm complexity khi có lý do rõ; dùng `OpenAPI/Swagger` để document REST.

:::

---

## API Styles là gì?

**API Style** = **phong cách/kiến trúc thiết kế API** — quy ước về cách
client và server giao tiếp với nhau qua mạng.

:::tip[Ví dụ đời thường]

Coi server là **nhà bếp**, client là **khách**. API style chính là **cách gọi món**, và 4 câu hỏi bên dưới là 4 thứ quán nào cũng phải chốt:

- **Transport** — đường nào tới quán: đi bộ ra tận nơi, gọi ship, hay có ống chuyển đồ ăn riêng.
- **Format** — gọi món bằng tiếng gì: nói tiếng Việt (JSON, ai nghe cũng hiểu) hay hô **mã số món** in sẵn (Protobuf, cực ngắn nhưng người ngoài chịu).
- **Contract** — có **thực đơn treo tường** không, hay khách phải tự đoán quán bán gì.
- **Paradigm** — bạn chỉ vào **món** trên thực đơn ("cho tôi tô phở kia"), hay ra lệnh cho **đầu bếp** ("chạy giúp tôi hàm nauPho(gàu, ít hành)").

:::

Mỗi style trả lời 4 câu hỏi cốt lõi:

| Câu hỏi | REST | GraphQL | gRPC | tRPC | SOAP |
|---|---|---|---|---|---|
| **Transport?** (giao thức) | HTTP/1.1 | HTTP | HTTP/2 | HTTP | HTTP/SMTP |
| **Format?** (định dạng data) | JSON | JSON | Protobuf (binary) | JSON | XML |
| **Contract?** (hợp đồng) | OpenAPI (optional) | Schema SDL | `.proto` file | TypeScript types | WSDL |
| **Paradigm?** (mô hình) | Resource-oriented | Query-oriented | Function call (RPC) | Function call (RPC) | Document-oriented |

### Tại sao có nhiều API styles?

Vì **không có "one size fits all"** — mỗi context có ràng buộc khác nhau:

- **Bandwidth thấp** (mobile 3G) → cần format nhỏ → gRPC / GraphQL thắng.
- **Public API cho dev khắp thế giới** → cần dễ học, debug bằng `curl` → REST thắng.
- **Microservice internal** → ưu tiên tốc độ, type-safe → gRPC.
- **Full-stack TypeScript** → muốn share type không cần codegen → tRPC.
- **Enterprise legacy** → đã có hệ thống SOAP 20 năm → phải duy trì.

### 2 trục phân loại chính

**Trục 1: Resource vs RPC**

```
RESOURCE-oriented              RPC-oriented
(noun, "what")                 (verb, "do what")
─────────────────────────────────────────────
REST                           gRPC, tRPC, SOAP
GET /users/1                   userService.getUser({id: 1})
```

REST nói "đây là resource, dùng HTTP verb thao tác". RPC nói "gọi hàm này
với tham số kia" — giống gọi function local.

**Trục 2: Text vs Binary**

```
TEXT (human-readable)          BINARY (machine-optimized)
─────────────────────────────────────────────
REST (JSON), GraphQL, SOAP     gRPC (Protobuf)
Debug dễ bằng curl/browser     Nhanh hơn 5-10x, nhỏ hơn
```

### Mental model nhanh khi chọn API style

Hỏi 3 câu:

1. **Ai dùng?** Public → REST. Internal team → tRPC / gRPC. Mobile → GraphQL.
2. **Performance critical?** Có → gRPC. Không → REST.
3. **Cần flexible query?** Có (UI nhiều biến thể) → GraphQL. Không → REST.

---

## Mục lục

- [REST](#rest)
- [JSON API](#json-api)
- [GraphQL](#graphql)
- [gRPC](#grpc)
- [SOAP](#soap)
- [tRPC](#trpc)
- [Khi nào dùng cái nào?](#khi-nào-dùng-cái-nào)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## REST

**REST (Representational State Transfer)** — phổ biến nhất, dùng HTTP method.

:::tip[Ví dụ đời thường]

REST giống **thư viện có mã số sách**. Mọi thứ trong thư viện là **đồ vật có địa chỉ cố định**: `/users/1` nghĩa là "cuốn hồ sơ số 1 ở kệ users". Bạn không hô "làm ơn lấy hồ sơ giúp tôi", bạn chỉ nói **địa chỉ** kèm **một trong vài động tác chuẩn**: xem (`GET`), thêm mới (`POST`), thay nguyên cuốn (`PUT`), sửa vài dòng (`PATCH`), bỏ đi (`DELETE`).

Vì địa chỉ và động tác đều là quy ước chung, ai bước vào cũng dùng được ngay mà không phải học nội quy riêng — đó là lý do REST thắng ở public API.

Cái giá phải trả: có những việc **không nắn thành đồ vật được** (kiểu "gửi lại email xác thực", "khởi động lại máy chủ"), lúc đó URL kiểu REST trông rất gượng gạo.

:::

```
GET    /api/users          → list
GET    /api/users/1        → detail
POST   /api/users          → create
PUT    /api/users/1        → full update
PATCH  /api/users/1        → partial update
DELETE /api/users/1        → delete
```

**REST principles**:

1. **Resource-based URL** — noun, không verb: `/users`, không phải `/getUsers`.
2. **HTTP methods** mang ý nghĩa hành động.
3. **Status codes** chuẩn (200, 201, 404, 500).
4. **Stateless** — mỗi request độc lập.
5. **JSON response** (phổ biến nhất).

**Pagination**:

```
GET /api/users?page=2&limit=20
GET /api/users?cursor=abc&limit=20  ← cursor-based (recommended)
```

**Filter / sort**:

```
GET /api/users?role=admin&sort=-created_at
```

**Nested resource**:

```
GET /api/users/1/posts
GET /api/posts?user_id=1   ← phẳng (preferred)
```

:::info[Phân tích]

**REST API best practices**:

**1. Versioning**:

```
/api/v1/users   ← URL versioning (phổ biến)
/api/users      + Header: Accept: application/vnd.example.v2+json
```

**2. Response envelope** consistent:

```json
{
  "data": [...],
  "meta": { "page": 1, "total": 100 },
  "error": null
}
```

**3. Error format** chuẩn (RFC 7807):

```json
{
  "type": "https://example.com/errors/insufficient-funds",
  "title": "Insufficient funds",
  "status": 400,
  "detail": "Account balance is 50, requested 100",
  "instance": "/accounts/123"
}
```

**4. HTTP status codes** đúng:

- 200 OK — success.
- 201 Created — resource tạo, return Location header.
- 204 No Content — success, no body (DELETE).
- 400 Bad Request — validation fail.
- 401 Unauthorized — chưa auth.
- 403 Forbidden — auth nhưng không quyền.
- 404 Not Found.
- 409 Conflict — duplicate, concurrency.
- 422 Unprocessable — validation chi tiết.
- 429 Too Many Requests — rate limit.
- 500 Internal — server bug.
- 503 Service Unavailable — temporary down.

**5. Idempotency**:

- GET, PUT, DELETE = idempotent.
- POST = non-idempotent (mỗi call tạo resource mới).
- **Idempotency-Key** header cho payment, critical mutation:

```
POST /api/payments
Idempotency-Key: uuid-123

→ Lần 1: charge thật.
→ Lần 2 cùng key: return result cũ, không charge double.
```

Stripe API là gold standard cho RESTful design.

:::

---

## JSON API

[JSON:API](https://jsonapi.org) — spec **structured response format**.

```json
{
  "data": {
    "type": "users",
    "id": "1",
    "attributes": { "name": "An" },
    "relationships": {
      "posts": {
        "links": { "related": "/users/1/posts" },
        "data": [{ "type": "posts", "id": "10" }]
      }
    }
  },
  "included": [
    { "type": "posts", "id": "10", "attributes": { "title": "Hi" } }
  ]
}
```

Phù hợp khi cần **standard interoperable** giữa nhiều client. Hơi verbose
→ ít dự án dùng đầy đủ. Nhiều lib hỗ trợ (`jsonapi-serializer`).

---

## GraphQL

**Query language** cho API — client chỉ định data cần, server return đúng đó.

:::tip[Ví dụ đời thường]

REST là **cơm phần set sẵn**: gọi "phần số 3" thì bê ra nguyên khay — bạn chỉ cần miếng thịt nhưng vẫn phải nhận cả canh, rau, tráng miệng (over-fetch); mà muốn thêm chén nước chấm thì phải gọi thêm một phần nữa (under-fetch).

GraphQL là **quầy tự chọn có phiếu ghi**: bạn viết đúng những thứ mình cần vào một tờ phiếu, đưa một lần, bếp trả về đúng chừng đó.

Cái giá phải trả: quán không nấu sẵn để bán nhanh được nữa vì phiếu ai cũng khác nhau (**caching khó**), và một tờ phiếu lỡ tay ghi 500 món có thể làm sập bếp — nên phải giới hạn độ sâu và chi phí của mỗi query.

:::

```graphql
query {
  user(id: "1") {
    name
    email
    posts(limit: 5) {
      title
      createdAt
    }
  }
}
```

Response:

```json
{
  "data": {
    "user": {
      "name": "An",
      "email": "an@example.com",
      "posts": [
        { "title": "Hello", "createdAt": "2026-01-01" }
      ]
    }
  }
}
```

**Đặc điểm**:

- **1 endpoint** (`/graphql`) cho mọi query.
- Client **chọn field** — không over-fetch / under-fetch.
- **Strongly typed schema** (SDL).
- **Subscription** — real-time WebSocket.
- **Mutation** — write operation.

**Schema**:

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts(limit: Int): [Post!]!
}

type Query {
  user(id: ID!): User
  users: [User!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
}
```

**Server lib**:

- **Apollo Server** (Node).
- **GraphQL Yoga** (Node).
- **Strawberry** (Python).
- **gqlgen** (Go).

:::info[Phân tích]

**GraphQL pros vs cons**:

**Ưu**:

- **No over-fetching** — mobile bandwidth tiết kiệm.
- **No under-fetching** — 1 query lấy nested data.
- **Type-safe** với codegen client.
- **Self-documenting** schema.
- **Federation** — multi-service single graph.

**Nhược**:

- **Caching khó hơn** REST (mỗi query khác nhau).
- **N+1 problem** dễ gặp → DataLoader.
- **Complexity** server — query parser, resolver, depth limit.
- **Security**: query depth/cost limit chống abuse.
- **Bundle size** client lib lớn.

**Khi nào dùng GraphQL?**

✅ Có:
- Mobile app — bandwidth quan trọng.
- Multi-team — tránh API endpoint proliferation.
- Multi-source data — federate.
- Frontend dev khác client cần khác data.

❌ Không:
- Simple CRUD — REST đủ.
- Public API — REST quen hơn.
- Limited resource server — REST cheaper.

Năm 2026, **REST + tRPC** thắng cho 80% case. GraphQL chỉ dùng khi
**thực sự có lợi ích**.

:::

---

## gRPC

**RPC framework** của Google, dùng **Protocol Buffers** binary format.

:::tip[Ví dụ đời thường]

Trong bếp, hai đầu bếp quen việc không nói cả câu "cho tôi một phần phở bò tái nạm". Họ hô **"ba bảy!"** — vì cả hai đã học thuộc cùng một **bảng mã dán trên tường**. Bảng mã đó chính là file `.proto`, và tiếng hô hai chữ chính là Protobuf: ngắn hơn, nhanh hơn JSON rất nhiều.

Cái giá phải trả: khách vãng lai (browser) nghe "ba bảy" thì chịu, phải có người phiên dịch đứng giữa (`grpc-web` proxy); và khi trục trặc bạn không "đọc lại tờ đơn" bằng mắt được như JSON. Vì thế gRPC hợp nói chuyện **nội bộ giữa các service**, không hợp làm public API.

:::

```protobuf
// user.proto
service UserService {
  rpc GetUser (UserRequest) returns (User);
  rpc ListUsers (ListRequest) returns (stream User);
}

message UserRequest {
  string id = 1;
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
}
```

Code generated cho server + client từ `.proto`.

**Đặc điểm**:

- **Binary** — nhỏ, nhanh hơn JSON 5-10x.
- **HTTP/2** native.
- **Streaming** bi-directional.
- **Strongly typed** cross-language.

**Use case**:

- **Microservice internal communication**.
- **Mobile app** (Google bandwidth-conscious).
- **Real-time low-latency** (gaming, IoT).

Không phù hợp:

- **Browser-to-server** — browser không native support (cần grpc-web proxy).
- **Public API** — quá phức tạp cho user.

---

## SOAP

**Legacy enterprise** API — XML-based, mature, verbose.

:::tip[Ví dụ đời thường]

SOAP là kiểu **gửi công văn hành chính**. Muốn hỏi một câu ngắn gọn, bạn vẫn phải: bỏ vào **bì thư** (`Envelope`), có **phần trích yếu** và **phần nội dung** (`Header` / `Body`), viết đúng **mẫu ban hành** (`WSDL`), ký tên đóng dấu rồi mới gửi đi.

Rườm rà, nhưng đổi lại mọi thứ đều chặt chẽ, có chuẩn, có chữ ký — nên ngân hàng và cơ quan nhà nước vẫn giữ. Với dự án mới thì đây là chi phí giấy tờ không đáng bỏ ra.

:::

```xml
<?xml version="1.0"?>
<soap:Envelope>
  <soap:Body>
    <m:GetUser xmlns:m="...">
      <m:UserId>1</m:UserId>
    </m:GetUser>
  </soap:Body>
</soap:Envelope>
```

**Còn dùng trong**:

- Banking, government.
- Integration với hệ thống SAP, Oracle cũ.
- WSDL contract-based.

Không khuyên cho project mới. Nếu maintain SOAP, lib hỗ trợ available.

---

## tRPC

**TypeScript-first** RPC — không cần code gen, **type-safe end-to-end**.

:::tip[Ví dụ đời thường]

Nếu REST là gọi món ở quán lạ (phải xem thực đơn, đọc mô tả, hỏi lại cho chắc), thì tRPC là **nhờ người nhà trong bếp**: bạn ới một câu là người kia hiểu ngay, và nếu bạn gọi nhầm tên món thì **bị nhắc ngay lúc vừa nói**, chứ không phải chờ bê ra mới biết sai — đó là type-safe end-to-end.

Cái giá phải trả: chỉ chạy được khi **cả hai cùng một nhà** (client và server chung codebase TypeScript). Người ngoài — app Java, đối tác third-party — thì chịu.

:::

```ts
// server
export const appRouter = t.router({
  getUser: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => db.user.findUnique({ where: { id: input.id } })),
});

export type AppRouter = typeof appRouter;
```

```ts
// client (cùng repo)
const user = await trpc.getUser.query({ id: "1" });
// user typed tự động!
```

**Phù hợp**:

- Full-stack TypeScript (Next.js + TS backend).
- Monorepo share type.
- Internal API.

**Không**:

- Public API (cần REST/GraphQL standard).
- Cross-language (TS only).

---

## Khi nào dùng cái nào?

```
Public API cho third-party?           → REST
Mobile app, bandwidth sensitive?      → GraphQL
Internal microservice low-latency?    → gRPC
Full-stack TS monorepo?               → tRPC
Banking, enterprise legacy?           → SOAP (nếu phải)
Default 80% web app?                  → REST + JSON
```

:::tip[Mẹo]

**Quy tắc thực dụng 2026**:

- **Default**: REST + JSON. Quen thuộc, ai cũng biết.
- **Type-safe full-stack TS**: tRPC.
- **Bandwidth critical hoặc flexible client**: GraphQL.
- **Microservice internal**: gRPC.

Đừng over-engineer — REST cover 80% nhu cầu. Add complexity chỉ khi
có lý do rõ ràng.

:::

:::info[Phân tích]

**OpenAPI / Swagger** — spec format cho REST API:

```yaml
openapi: 3.0.0
paths:
  /users:
    get:
      summary: List users
      responses:
        '200':
          content:
            application/json:
              schema:
                type: array
                items: { $ref: '#/components/schemas/User' }
components:
  schemas:
    User:
      type: object
      properties:
        id: { type: string }
        name: { type: string }
```

Lợi ích:

- **Documentation** auto-generated (Swagger UI, Redoc).
- **Client SDK** codegen cho mọi ngôn ngữ.
- **Type-safe** server với lib (FastAPI, NestJS đều có).
- **Mock server** cho dev frontend trước.

FastAPI, NestJS auto generate OpenAPI từ code. Document API miễn phí.

:::

---

## Câu hỏi phỏng vấn

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
