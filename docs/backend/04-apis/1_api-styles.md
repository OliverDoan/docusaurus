---
sidebar_position: 1
title: "1. API Styles: REST, GraphQL, gRPC"
---

# API Styles: REST, GraphQL, gRPC

API Style là phong cách thiết kế API, tức là cách client và server "nói chuyện" với nhau qua mạng. Bài này giới thiệu các phong cách phổ biến như REST, GraphQL, gRPC, tRPC và SOAP, cùng cách chọn cái phù hợp cho từng tình huống. Hiểu chúng giúp bạn xây dựng giao tiếp giữa frontend và backend đúng đắn, dễ dùng và hiệu quả.

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

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. `REST` là gì? Kể các ràng buộc chính (`stateless`, client–server, cacheable, uniform interface). Một API 'RESTful' khác một 'HTTP API' thông thường ở đâu?
2. `PUT` và `PATCH` khác nhau thế nào? Khi nào dùng `POST /users` và khi nào dùng `PUT /users/1`?
3. `Idempotent` nghĩa là gì? Method nào idempotent, method nào `safe`? Làm sao khiến một `POST` thanh toán trở nên idempotent bằng `Idempotency-Key`?
4. Thiết kế endpoint cho hành động không phải CRUD (gửi lại email xác thực, huỷ đơn hàng, restart job) theo phong cách REST như thế nào?
5. Phân biệt các status code hay nhầm: `400` với `422`, `401` với `403`, `200`/`201`/`204`. Khi nào trả `409`, khi nào trả `429`?
6. So sánh `offset pagination` và `cursor pagination`. Vì sao offset chậm dần khi đi sâu và có thể trả về row trùng hoặc bỏ sót row?
7. Các cách versioning API (URL path, header, query) khác nhau ra sao? Thay đổi nào là `breaking change`, và quy trình `deprecate` một version nên gồm những bước gì?
8. Caching HTTP hoạt động thế nào với `ETag`, `Cache-Control`, `If-None-Match` và `304`? Vì sao GraphQL khó tận dụng cache HTTP hơn REST?
9. Thiết kế một format lỗi thống nhất cho API (ví dụ theo `RFC 7807`) — nên trả về những trường gì và tuyệt đối không để lộ thông tin gì?
10. `Stateless` với REST nghĩa là gì? Session lưu server và `JWT` ảnh hưởng thế nào tới khả năng scale ngang?
11. GraphQL giải quyết `over-fetching` và `under-fetching` bằng cách nào? Cái giá phải trả là gì?
12. Vì sao GraphQL rất dễ dính `N+1`? `DataLoader` hoạt động ra sao để khắc phục?
13. Bảo vệ một GraphQL endpoint công khai khỏi query độc hại bằng những biện pháp nào (`depth limit`, `query cost`, `persisted query`, rate limit theo cost)?
14. gRPC nhanh hơn REST + JSON nhờ những yếu tố nào (`Protobuf` binary, `HTTP/2` multiplexing, nén header)? Điểm đánh đổi khi debug là gì?
15. Trong `Protobuf`, vì sao mỗi field phải có số thứ tự? Thêm field mới và xoá field cũ như thế nào để giữ tương thích ngược và xuôi?
16. gRPC có 4 kiểu gọi: `unary`, `server streaming`, `client streaming`, `bidirectional streaming`. Mỗi kiểu hợp với bài toán nào?
17. Vì sao browser không gọi trực tiếp được gRPC? `grpc-web` hoặc proxy giải quyết chuyện đó ra sao?
18. `tRPC` đạt được type-safe end-to-end mà không cần codegen bằng cơ chế nào? Giới hạn lớn nhất của nó là gì?
19. Tình huống: app mobile chạy mạng yếu, nhiều màn hình cần các tập field khác nhau, team chỉ 3 người. Bạn chọn REST hay GraphQL và lập luận thế nào?
20. Tình huống: hệ thống có 20 microservice nội bộ cộng một public API. Bạn phối hợp gRPC và REST ra sao, vai trò của `API gateway` hay `BFF` là gì?
21. `OpenAPI`/`Swagger` mang lại lợi ích gì? So sánh cách làm `design-first` và `code-first`.
22. Triển khai `rate limiting` bằng thuật toán nào (`token bucket`, `sliding window`)? Nên trả về header gì để client tự điều tiết?
23. So sánh `WebSocket`, `SSE`, GraphQL `subscription` và gRPC streaming cho tính năng real-time. Bạn chọn cái nào trong trường hợp nào?
24. Bạn cần đổi kiểu dữ liệu của một field trong response trong khi vẫn còn nhiều app mobile phiên bản cũ đang chạy. Bạn xử lý thế nào để không làm hỏng client?
