---
sidebar_position: 3
title: "3. ORM — Prisma, Sequelize, Drizzle, Mongoose"
---

# ORM — Prisma, Sequelize, Drizzle, Mongoose

> *Câu hỏi ORM kiểm tra hai thứ: bạn có hiểu cái gì xảy ra **bên dưới** abstraction không, và bạn có biết khi nào abstraction phản chủ (N+1, query kém) không.*

---

## Câu 1: ORM là gì? Lợi ích và nhược điểm? `[Intermediate]`

### Câu hỏi

> ORM là gì? Lợi ích và nhược điểm so với viết SQL thuần? Khi nào em "thoát" khỏi ORM?

### Giải thích lý thuyết

**ORM (Object-Relational Mapper)** là lớp trung gian map **bảng quan hệ ↔ object** trong code: row thành instance, cột thành property, quan hệ FK thành reference/array — cho phép thao tác DB bằng ngôn ngữ lập trình thay vì viết SQL tay.

**Lợi ích:**

- **Năng suất**: CRUD vài dòng code, không boilerplate map row → object.
- **Type safety** (ORM hiện đại như Prisma/Drizzle): schema sinh type, sai field là lỗi compile.
- **An toàn hơn mặc định**: tự parameterize query → chống SQL injection cơ bản.
- **Migration tooling** đi kèm, schema versioned theo code.
- Trừu tượng hoá dialect — đổi DB ít đau hơn (trên lý thuyết).

**Nhược điểm:**

- **Che giấu SQL thật**: dễ sinh query kém (N+1, SELECT * thừa, JOIN không tối ưu) mà dev không nhìn thấy.
- **Leaky abstraction**: query phức tạp (window function, CTE đệ quy, aggregate nhiều tầng) ORM viết khó hơn chính SQL — cuối cùng vẫn phải raw SQL.
- Chi phí học chính ORM, và **object-relational impedance mismatch** — mô hình object và quan hệ không khớp hoàn toàn.

Quan điểm cân bằng (ăn điểm): ORM cho 80% CRUD thường nhật, **raw SQL cho 20%** report/analytics phức tạp — mọi ORM tốt đều có cửa thoát (`$queryRaw`, `sequelize.query`).

### Code minh hoạ

```ts
// ORM (Prisma): CRUD ngắn gọn, type-safe
const user = await prisma.user.create({
  data: { email: "a@example.com", name: "Alice" },
});
const users = await prisma.user.findMany({
  where: { posts: { some: { published: true } } },
  include: { posts: true },
});

// Cửa thoát: raw SQL cho query phức tạp ORM viết khổ
const stats = await prisma.$queryRaw`
  SELECT date_trunc('month', created_at) AS month,
         SUM(total) AS revenue,
         SUM(SUM(total)) OVER (ORDER BY date_trunc('month', created_at)) AS running_total
  FROM orders
  GROUP BY 1
`;
```

### Đáp án mẫu

> "ORM là lớp map giữa bảng quan hệ và object — thao tác DB bằng code thay vì SQL tay. Lợi ích chính: năng suất với CRUD, type safety ở ORM hiện đại — sai field là lỗi compile, chống SQL injection mặc định nhờ parameterized query, và migration tooling đi kèm. Nhược điểm là mặt trái của chính abstraction: nó che SQL thật nên dễ sinh N+1 hay query kém mà không thấy, và query phân tích phức tạp thì viết bằng ORM còn khổ hơn SQL. Cách em dùng: ORM cho 80% CRUD hằng ngày, raw SQL qua cửa thoát như `$queryRaw` cho 20% report phức tạp, và bật query logging ở môi trường dev để luôn thấy SQL mà ORM sinh ra — ORM là công cụ năng suất, không phải lý do để không biết SQL."

---

## Câu 2: Prisma ORM là gì? Tại sao phổ biến trong Node.js/TypeScript? `[Intermediate]`

### Câu hỏi

> Prisma là gì? Điều gì làm nó phổ biến trong hệ sinh thái TypeScript so với các ORM truyền thống?

### Giải thích lý thuyết

**Prisma** là ORM thế hệ mới cho Node.js/TypeScript, gồm 3 phần:

1. **Prisma Schema** (`schema.prisma`) — file khai báo schema, **single source of truth**.
2. **Prisma Client** — client **được generate từ schema**, type-safe tuyệt đối.
3. **Prisma Migrate** — sinh và quản lý SQL migration từ schema diff.

Lý do phổ biến:

- **Type safety end-to-end**: vì client được *generate* từ schema nên type khớp 100% — `findMany({ select: { name: true } })` trả về type chỉ có `name`; autocomplete toàn bộ; field gõ sai là lỗi compile. Các ORM truyền thống (TypeORM, Sequelize) dùng decorator/class nên type dễ lệch khỏi DB thật.
- **DX tốt**: schema file dễ đọc hơn class decorator; `prisma studio` (GUI xem data); error message rõ.
- Query API **khai báo theo object** — quan hệ lồng nhau (`include`, nested write) tự nhiên.
- Hỗ trợ PostgreSQL, MySQL, SQLite, SQL Server, MongoDB.

Nhược điểm cần biết để không one-sided: client phải **re-generate** mỗi khi schema đổi; (lịch sử) Rust query engine làm cold start nặng trên serverless — các bản mới đã chuyển dần sang client TypeScript thuần; query rất phức tạp vẫn cần `$queryRaw`; trừu tượng cao hơn nên kiểm soát SQL kém hơn Drizzle/Kysely.

### Code minh hoạ

```ts
// Type-safety là điểm bán hàng chính
const user = await prisma.user.findUnique({
  where: { email: "a@example.com" },
  select: { id: true, name: true },        // ← type trả về CHỈ có { id, name }
});
// user.email  → lỗi compile: Property 'email' does not exist

// Nested write: tạo user + posts trong 1 lệnh (1 transaction ngầm)
await prisma.user.create({
  data: {
    email: "b@example.com",
    posts: {
      create: [{ title: "Bài 1" }, { title: "Bài 2" }],
    },
  },
});

// Filter theo quan hệ — không cần viết JOIN tay
const authors = await prisma.user.findMany({
  where: { posts: { some: { published: true, likes: { gt: 100 } } } },
  include: { _count: { select: { posts: true } } },
});
```

### Đáp án mẫu

> "Prisma là ORM thế hệ mới gồm ba phần: schema file làm single source of truth, client được generate từ schema, và Prisma Migrate sinh SQL migration từ schema diff. Nó phổ biến vì giải đúng pain point của TypeScript ecosystem: **type safety thật sự** — client là code generate nên type khớp DB 100%, select field nào type trả về đúng field đó, gõ sai field là lỗi compile ngay; các ORM decorator-based như TypeORM thì type dễ lệch khỏi schema thật. Cộng thêm DX: schema file dễ đọc, Prisma Studio xem data, nested write và filter theo quan hệ rất tự nhiên. Trade-off em nắm: phải regenerate client khi schema đổi, query phức tạp vẫn phải `$queryRaw`, và nếu cần kiểm soát SQL sát hơn thì Drizzle là lựa chọn thay thế — nhưng cho team product cần ship nhanh với schema rõ ràng, Prisma là default tốt."

---

## Câu 3: Prisma schema file hoạt động như thế nào? `[Intermediate]`

### Câu hỏi

> File `schema.prisma` gồm những block gì? Quy trình từ sửa schema đến code chạy được diễn ra thế nào?

### Giải thích lý thuyết

`schema.prisma` gồm 3 loại block:

1. **`datasource`** — kết nối DB: provider (postgresql/mysql/...) và URL (từ env var).
2. **`generator`** — sinh ra cái gì (thường `prisma-client-js`).
3. **`model`** — mỗi model ↔ 1 bảng: field, type, attribute (`@id`, `@unique`, `@default`, `@relation`), index (`@@index`), map tên (`@@map`).

**Quan hệ** khai báo 2 chiều: phía "nhiều" giữ FK qua `@relation(fields, references)`, phía "một" có field array — field quan hệ chỉ tồn tại **ở tầng Prisma** (không phải cột thật).

Workflow chuẩn:

```
Sửa schema.prisma
  → npx prisma migrate dev --name <tên>   # sinh SQL migration + apply + generate client
  → code dùng client mới (type đã cập nhật)
  → production: npx prisma migrate deploy  # chỉ apply migration đã commit
```

Lệnh liên quan hay bị hỏi: `prisma generate` (chỉ sinh lại client), `prisma db push` (đồng bộ schema **không tạo migration** — chỉ dành cho prototype), `prisma migrate diff` / `db pull` (introspect DB có sẵn).

### Code minh hoạ

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  posts     Post[]                      // phía "một" — field ảo tầng Prisma
  createdAt DateTime @default(now()) @map("created_at")

  @@map("users")                        // tên bảng thật trong DB
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId  Int     @map("author_id")   // cột FK thật

  @@index([authorId, published])        // composite index
  @@map("posts")
}

enum Role {
  USER
  ADMIN
}
```

```bash
# Dev: sinh migration + apply + regenerate client
npx prisma migrate dev --name add_post_index

# Production (CI/CD): chỉ apply migration đã có, không sinh mới
npx prisma migrate deploy
```

### Đáp án mẫu

> "Schema file gồm ba block: `datasource` khai báo DB và connection URL từ env, `generator` khai báo sinh client gì, và các `model` — mỗi model một bảng với field, attribute như `@id`, `@unique`, `@relation`, cùng `@@index` và `@@map` để khớp naming convention của DB. Quan hệ khai hai chiều: phía nhiều giữ FK thật qua `@relation(fields, references)`, phía một có field array nhưng đó là field ảo chỉ tồn tại ở tầng Prisma. Workflow của em: sửa schema → `prisma migrate dev` sinh SQL migration, apply và regenerate client trong một lệnh → production thì CI chạy `prisma migrate deploy` chỉ apply migration đã commit. Phân biệt quan trọng: `db push` đồng bộ schema không tạo migration — chỉ dùng prototype, lên môi trường có team là phải migrate để có lịch sử reviewable."

---

## Câu 4: N+1 query problem là gì? Cách giải quyết trong Prisma? `[Intermediate]`

### Câu hỏi

> N+1 query problem trong ORM là gì? Em phát hiện và giải quyết nó trong Prisma như thế nào?

### Giải thích lý thuyết

**N+1** = lấy danh sách N record (1 query), rồi với **mỗi** record lại query tiếp dữ liệu liên quan (N query) → tổng N+1 round-trip. 100 post = 101 query; mỗi query tốn round-trip latency → chậm tuyến tính theo N, đè DB connection.

Nguyên nhân: vòng lặp + lazy access quan hệ — ORM làm điều này **vô hình** nên dev không nhận ra.

Giải pháp trong Prisma:

1. **`include` / nested `select`** — Prisma fetch quan hệ bằng số query cố định (1 query cho bảng chính + 1 cho bảng quan hệ, hoặc JOIN với `relationLoadStrategy: "join"` từ các bản mới) bất kể N.
2. **Batch tay**: lấy list id → `findMany({ where: { id: { in: ids } } })` → map lại trong code.
3. **DataLoader pattern** (GraphQL): gom các lần load lẻ trong cùng tick thành 1 query `IN` — Prisma's `findUnique` được tự động batch khi dùng cùng fluent API.

Cách phát hiện: bật query log (`log: ["query"]`), thấy hàng loạt query giống nhau chỉ khác tham số là dấu hiệu chắc chắn; ngoài ra dùng APM/slow query log.

> Bản chất SQL của vấn đề này đã có tại [09-sql — N+1 query problem](../09-sql/2_indexing-performance.md); bài này tập trung góc nhìn ORM/Prisma.

### Code minh hoạ

```ts
// WRONG: N+1 — 1 query lấy posts + N query lấy author
const posts = await prisma.post.findMany();           // 1 query
for (const post of posts) {
  const author = await prisma.user.findUnique({       // N queries!
    where: { id: post.authorId },
  });
  console.log(post.title, author?.name);
}

// CORRECT 1: include — số query cố định bất kể N
const posts = await prisma.post.findMany({
  include: { author: { select: { name: true } } },
});

// CORRECT 2: batch tay với IN — khi logic phức tạp hơn include
const posts = await prisma.post.findMany();
const authorIds = [...new Set(posts.map((p) => p.authorId))];
const authors = await prisma.user.findMany({ where: { id: { in: authorIds } } });
const authorById = new Map(authors.map((a) => [a.id, a]));
const result = posts.map((p) => ({ ...p, author: authorById.get(p.authorId) }));
```

```ts
// Phát hiện: bật query log ở dev — N+1 hiện nguyên hình
const prisma = new PrismaClient({ log: ["query"] });
```

### Đáp án mẫu

> "N+1 là lấy N record bằng một query rồi mỗi record lại query thêm dữ liệu quan hệ — 100 post thành 101 query, chậm tuyến tính theo N vì mỗi query một round-trip. ORM làm nó vô hình: chỉ là vòng lặp gọi `findUnique` trông rất vô hại. Trong Prisma em giải bằng `include` hoặc nested select — Prisma fetch quan hệ với số query cố định, các bản mới còn chọn được `relationLoadStrategy: join` để dùng JOIN thật; trường hợp phức tạp hơn thì batch tay bằng `findMany` với `id IN` rồi map trong code; còn GraphQL resolver thì dùng DataLoader pattern. Quan trọng nhất là **phát hiện**: em bật query log ở dev — thấy chuỗi query giống hệt nhau chỉ khác tham số là N+1 chắc chắn — và để ý latency API tăng tuyến tính theo kích thước list là red flag."

---

## Câu 5: Database transactions trong Prisma — cách sử dụng? `[Intermediate]`

### Câu hỏi

> Prisma hỗ trợ transaction những kiểu nào? Khác nhau giữa sequential và interactive transaction? Lưu ý gì khi dùng?

### Giải thích lý thuyết

Prisma có 3 cơ chế transaction:

1. **Nested writes** — tạo/sửa record cha con lồng nhau trong 1 lệnh: tự động atomic, không cần khai báo gì.
2. **Sequential (batch) transaction** — `$transaction([op1, op2, ...])`: mảng các operation chạy **tuần tự trong 1 transaction**, all-or-nothing. Giới hạn: các op **độc lập nhau** — op sau không dùng được kết quả op trước.
3. **Interactive transaction** — `$transaction(async (tx) => {...})`: callback nhận `tx` (transaction client), **logic giữa các query được** (đọc → kiểm tra → ghi). Đây là dạng dùng cho business logic thật như chuyển tiền.

Lưu ý quan trọng (điểm Senior):

- Trong callback phải dùng **`tx`**, không phải `prisma` — dùng nhầm `prisma` là query chạy **ngoài** transaction (bug kinh điển, silent).
- Interactive transaction giữ connection + lock suốt thời gian chạy → **không gọi API ngoài / việc chậm trong transaction**; có option `timeout` và `maxWait`.
- Set được isolation level: `$transaction(fn, { isolationLevel: "Serializable" })` — kết hợp retry khi gặp serialization error.

### Code minh hoạ

```ts
// 1. Nested write: atomic sẵn
await prisma.order.create({
  data: {
    userId,
    items: { create: cartItems },     // order + items cùng thành công/thất bại
  },
});

// 2. Sequential: các op độc lập, all-or-nothing
const [deleted, archived] = await prisma.$transaction([
  prisma.notification.deleteMany({ where: { userId } }),
  prisma.auditLog.create({ data: { action: "clear_notifications", userId } }),
]);

// 3. Interactive: business logic — chuyển tiền
await prisma.$transaction(
  async (tx) => {                      // LUÔN dùng tx bên trong, không dùng prisma!
    const from = await tx.account.update({
      where: { id: fromId },
      data: { balance: { decrement: amount } },
    });

    if (from.balance < 0) {
      throw new Error("Số dư không đủ");  // throw → toàn bộ rollback
    }

    await tx.account.update({
      where: { id: toId },
      data: { balance: { increment: amount } },
    });
  },
  { isolationLevel: "Serializable", timeout: 5000 }
);
```

### Đáp án mẫu

> "Prisma có ba mức: **nested write** — tạo cha con lồng nhau tự atomic; **sequential transaction** — mảng operation độc lập chạy all-or-nothing; và **interactive transaction** — callback nhận `tx` client, cho phép đọc-kiểm tra-ghi có logic ở giữa, là dạng dùng cho nghiệp vụ thật như chuyển tiền: decrement, check balance âm thì throw để rollback toàn bộ, rồi increment. Ba lưu ý em luôn nhấn khi review: trong callback phải dùng `tx` chứ không phải `prisma` — dùng nhầm là query chạy ngoài transaction một cách im lặng, bug rất khó tìm; không làm việc chậm như gọi API ngoài trong transaction vì nó giữ connection và lock; và với nghiệp vụ tiền em set isolation level Serializable kèm retry khi gặp serialization error."

---

## Câu 6: Sequelize là gì? So sánh với Prisma? `[Intermediate]`

### Câu hỏi

> Sequelize là gì? Em so sánh Sequelize với Prisma — khi nào chọn cái nào?

### Giải thích lý thuyết

**Sequelize** là ORM "truyền thống" lâu đời nhất của Node.js (từ 2011), theo **Active Record pattern**: model là class, instance có method `save()`, `destroy()` — dữ liệu và hành vi gắn trên cùng object.

So sánh trực diện:

| Trục | Sequelize | Prisma |
| ---- | --------- | ------ |
| Pattern | Active Record (class + instance method) | Data Mapper (client tách biệt, trả plain object) |
| Schema | Define bằng JS/TS code (decorator với sequelize-typescript) | File `schema.prisma` riêng, generate client |
| Type safety | Hạn chế — type khai tay, dễ lệch DB thật | Mạnh — generate từ schema, khớp 100% |
| Migration | `sequelize-cli`, viết tay up/down | Auto-generate từ schema diff |
| Query phức tạp | `include` lồng nhau cú pháp rườm rà | API gọn hơn; raw SQL khi cần |
| Trưởng thành | Rất lâu đời, nhiều tài liệu legacy | Hiện đại, cộng đồng tăng nhanh |

Thực tế lựa chọn: dự án **mới** TypeScript → Prisma (hoặc Drizzle) gần như mặc định; Sequelize chủ yếu gặp ở **codebase legacy JavaScript** — kỹ năng đọc hiểu Sequelize vẫn cần khi maintain.

### Code minh hoạ

```js
// Sequelize: Active Record — define model bằng code
const User = sequelize.define("User", {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  name: DataTypes.STRING,
});

const user = await User.findOne({ where: { email: "a@example.com" } });
user.name = "Alice mới";
await user.save();                       // instance tự biết cách lưu chính nó

// Include lồng nhau — cú pháp rườm rà dần theo độ sâu
const posts = await Post.findAll({
  where: { published: true },
  include: [{ model: User, as: "author", attributes: ["name"] }],
});
```

```ts
// Prisma: Data Mapper — client tách biệt, trả plain object
const user = await prisma.user.findUnique({ where: { email: "a@example.com" } });
await prisma.user.update({ where: { id: user.id }, data: { name: "Alice mới" } });
```

### Đáp án mẫu

> "Sequelize là ORM lâu đời nhất của Node, theo Active Record — model là class, instance có `save()`, `destroy()`, dữ liệu và hành vi trên cùng object. Prisma theo Data Mapper — client tách biệt, trả plain object. Khác biệt quyết định là **type safety**: Sequelize khai type bằng tay nên dễ lệch khỏi DB thật, Prisma generate client từ schema nên khớp 100% — với codebase TypeScript đây gần như là yếu tố ăn thua. Migration cũng vậy: Sequelize viết up/down tay, Prisma sinh từ schema diff. Lựa chọn của em: dự án mới TypeScript thì Prisma hoặc Drizzle; Sequelize em chỉ gặp khi maintain codebase legacy JavaScript — lúc đó migrate ORM giữa chừng thường không đáng, hiểu nó để làm việc tiếp là kỹ năng thực tế hơn."

---

## Câu 7: Drizzle ORM là gì? So sánh với Prisma? `[Intermediate]`

### Câu hỏi

> Drizzle ORM là gì? Triết lý của nó khác Prisma thế nào, và khi nào em chọn Drizzle?

### Giải thích lý thuyết

**Drizzle** là TypeScript ORM thế hệ mới với triết lý **"If you know SQL, you know Drizzle"** — API bám sát SQL 1:1 thay vì trừu tượng hoá nó đi.

Khác biệt cốt lõi với Prisma:

| Trục | Drizzle | Prisma |
| ---- | ------- | ------ |
| Triết lý | SQL-first: code trông như SQL | Schema-first: trừu tượng hoá SQL |
| Schema | Khai báo **bằng TypeScript** trong code | File `.prisma` riêng (DSL) |
| Type | Suy ra trực tiếp từ TS — **không cần codegen** | Phải generate client sau mỗi lần đổi schema |
| Kiểm soát SQL | Cao — biết chính xác SQL sinh ra, kiểu `db.select().from().leftJoin()` | Thấp hơn — engine quyết định |
| Bundle/runtime | Rất nhẹ, không engine phụ — hợp **serverless/edge** | Nặng hơn (đang cải thiện) |
| Quan hệ lồng nhau | Relational queries API (gọn nhưng mới hơn) | `include`/nested write rất chín |
| Learning curve | Phải biết SQL | Dễ vào hơn cho người chưa vững SQL |

Khi chọn Drizzle: team **vững SQL** muốn kiểm soát query; deploy **serverless/edge** (Cloudflare Workers, Vercel Edge) cần bundle nhẹ, cold start nhanh; không muốn bước codegen. Khi chọn Prisma: team trình độ lẫn lộn, ưu tiên DX và tốc độ ship, schema làm việc chung với non-backend dev.

### Code minh hoạ

```ts
// Drizzle: schema là TypeScript thuần — type suy ra ngay, không codegen
import { pgTable, serial, text, integer, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  published: boolean("published").default(false),
  authorId: integer("author_id").references(() => users.id),
});

// Query trông như SQL — biết chính xác câu lệnh sinh ra
import { eq, desc } from "drizzle-orm";

const result = await db
  .select({ title: posts.title, authorName: users.name })
  .from(posts)
  .leftJoin(users, eq(posts.authorId, users.id))
  .where(eq(posts.published, true))
  .orderBy(desc(posts.id))
  .limit(10);
```

### Đáp án mẫu

> "Drizzle là TypeScript ORM theo triết lý SQL-first — 'biết SQL là biết Drizzle': query viết kiểu `select().from().leftJoin()` nên nhìn code biết chính xác SQL sinh ra. Ba khác biệt lớn với Prisma: schema khai báo bằng TypeScript thuần nên type suy ra ngay **không cần codegen** — Prisma phải regenerate client mỗi lần đổi schema; runtime rất nhẹ không có engine phụ nên hợp serverless và edge; và mức kiểm soát SQL cao hơn — Prisma trừu tượng hoá nhiều hơn. Đổi lại Prisma có DX chín hơn cho quan hệ lồng nhau, nested write, và dễ vào hơn cho người chưa vững SQL. Em chọn Drizzle khi team vững SQL và deploy edge/serverless cần cold start nhanh; chọn Prisma khi team trình độ lẫn lộn và ưu tiên tốc độ ship — cả hai đều type-safe tốt, khác nhau ở độ cao của abstraction."

---

## Câu 8: Mongoose là gì? Schema trong Mongoose hoạt động thế nào? `[Intermediate]`

### Câu hỏi

> Mongoose là gì? MongoDB vốn schemaless, vậy schema của Mongoose có ý nghĩa gì và hoạt động ra sao?

### Giải thích lý thuyết

**Mongoose** là **ODM (Object-Document Mapper)** phổ biến nhất cho MongoDB trong Node.js. Vai trò cốt lõi: MongoDB schemaless ở **tầng DB**, Mongoose áp **schema ở tầng application** — đưa kỷ luật dữ liệu trở lại mà vẫn giữ tính linh hoạt của document model.

Schema Mongoose cung cấp:

- **Định nghĩa field + type + ràng buộc**: `required`, `unique`*, `min/max`, `enum`, `default`.
- **Validation chạy trước khi save** — chặn data sai từ app.
- **Casting**: tự ép kiểu input về đúng type khai báo.
- **Middleware (hooks)**: `pre("save")`, `post("save")` — hash password, audit log.
- **Virtuals**: field tính toán không lưu DB (`fullName` = first + last).
- **Methods & statics**: gắn business logic lên document/model.
- **Populate**: "join" application-level theo `ref` — thay cho `$lookup`.

*Lưu ý kinh điển: `unique: true` trong Mongoose **không phải validator** — nó chỉ khai báo unique index ở MongoDB; race condition vẫn cần xử lý lỗi duplicate key E11000.

Schema chỉ enforce ở app: ai ghi thẳng vào DB (script, service khác) thì không bị ràng buộc — khác fundamental với constraint của SQL.

### Code minh hoạ

```ts
import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    profile: {
      firstName: String,
      lastName: String,
    },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],  // reference
  },
  { timestamps: true }   // tự thêm createdAt, updatedAt
);

// Middleware: hash password trước khi save
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// Virtual: field tính toán, không lưu DB
userSchema.virtual("fullName").get(function () {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

const User = mongoose.model("User", userSchema);

// Populate: "join" tầng application theo ref
const user = await User.findById(id).populate({
  path: "posts",
  match: { published: true },
  select: "title createdAt",
});
```

### Đáp án mẫu

> "Mongoose là ODM cho MongoDB — vì Mongo schemaless ở tầng DB nên Mongoose áp schema ở tầng application để đưa kỷ luật dữ liệu trở lại. Schema cho mình: type và ràng buộc với validation chạy trước save, casting tự ép kiểu, middleware như `pre('save')` để hash password, virtuals cho field tính toán, và populate để join application-level theo ref. Hai cái bẫy em luôn nhắc: `unique: true` **không phải validator** — nó chỉ tạo unique index, vẫn phải catch lỗi duplicate E11000 vì có race condition; và schema chỉ enforce ở app — script ghi thẳng vào DB thì không bị ràng buộc gì, khác bản chất với constraint của SQL. So với Prisma thì Mongoose gắn chặt MongoDB và theo kiểu Active Record với hooks — mạnh về tính năng quanh document model nhưng type safety của TypeScript yếu hơn Prisma."
