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

---

## REST

**REST (Representational State Transfer)** — phổ biến nhất, dùng HTTP method.

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
