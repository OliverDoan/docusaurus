---
sidebar_position: 7
title: "7. Utility Types & Decorators"
---

# 7. Utility Types & Decorators

## 1. Utility Types

Bài học: [1. Utility Types](../../typescript/07-utility-decorators/1_utility-types.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Partial`, `Required`, `Readonly` được cài đặt thế nào bằng mapped type? Hãy viết lại `Partial` bằng tay.**

<details className="qa">
<summary>Xem đáp án</summary>

Cả ba đều là **mapped type**: duyệt qua từng key của `T` rồi bật/tắt modifier.

```ts
type MyPartial<T>  = { [P in keyof T]?: T[P] };
type MyRequired<T> = { [P in keyof T]-?: T[P] };
type MyReadonly<T> = { readonly [P in keyof T]: T[P] };
```

Các mảnh ghép:

- `keyof T` — union các key của `T`.
- `[P in keyof T]` — lặp qua từng key, `P` là key hiện tại.
- `T[P]` — indexed access, lấy kiểu của property đó.
- `?` / `readonly` — **thêm** modifier; `-?` / `-readonly` — **gỡ** modifier (cú pháp `+`/`-` có từ TS 2.8).

Mặc định modifier của key gốc được **giữ nguyên** vì đây là *homomorphic mapped type* (map trực tiếp trên `keyof T`). Đó là lý do `Partial<Readonly<User>>` vẫn còn `readonly`.

```ts
interface User { readonly id: number; name?: string }
type A = MyRequired<User>;  // { readonly id: number; name: string }
```

</details>

**2. Vì sao `Partial` và `Readonly` chỉ shallow? Khi nào cần `DeepPartial` và rủi ro kèm theo là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì mapped type chỉ chạy **một vòng trên key ở tầng ngoài cùng**, còn giá trị `T[P]` được giữ nguyên xi, không bị biến đổi tiếp:

```ts
type Config = Readonly<{ db: { host: string } }>;
const c: Config = { db: { host: "localhost" } };
c.db = {} as any;     // Error — db readonly
c.db.host = "x";      // OK! — bên trong không đụng tới
```

Cần bản đệ quy khi làm việc với **object lồng nhiều tầng**: merge config từng phần, patch state lồng nhau, hoặc fixture cho test.

```ts
type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };
```

Rủi ro:

- **Đụng nhầm kiểu dựng sẵn**: `Date`, `Map`, `Set`, `RegExp`, function đều bị "mổ xẻ" thành object có mọi method optional — sai hoàn toàn. Phải thêm nhánh loại trừ.
- **Mảng**: `DeepPartial<T[]>` biến phần tử thành optional, dễ sinh `undefined` ngoài ý muốn.
- **Hiệu năng**: đệ quy sâu làm chậm type-check, có thể chạm lỗi TS2589.
- **Mất an toàn**: mọi field optional nghĩa là compiler không còn bắt được việc quên truyền dữ liệu.

Thực tế nên dùng bản đã kiểm nghiệm của `type-fest` thay vì tự viết.

</details>

**3. `Pick` và `Omit` khác nhau ra sao? `Omit` được dựng lại từ `Pick` và `Exclude` như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`Pick<T, K>` là **allowlist** — giữ đúng những key bạn liệt kê. `Omit<T, K>` là **denylist** — giữ tất cả trừ những key bạn liệt kê.

```ts
interface User { id: number; name: string; email: string; password: string }

type A = Pick<User, "id" | "name">;   // { id; name }
type B = Omit<User, "password">;      // { id; name; email }
```

`Omit` không phải nguyên thuỷ — nó được ghép từ hai utility khác trong `lib.es5.d.ts`:

```ts
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

Đọc từ trong ra: lấy `keyof T` (tất cả key), dùng `Exclude` bỏ đi những key thuộc `K`, rồi `Pick` phần còn lại. Vì vậy `Omit` thừa hưởng mọi đặc tính của `Pick` — giữ modifier `readonly`/`?`, nhưng cũng thừa hưởng các hạn chế (xem câu về call signature và union).

Mẹo chọn: danh sách cần giữ ngắn thì dùng `Pick`; danh sách cần bỏ ngắn thì dùng `Omit`. Với dữ liệu nhạy cảm, `Pick` an toàn hơn.

</details>

**4. Vì sao `Omit` không báo lỗi khi truyền một key không tồn tại, còn `Pick` thì có? Viết một `StrictOmit` an toàn hơn.**

<details className="qa">
<summary>Xem đáp án</summary>

Khác biệt nằm ở **constraint của tham số `K`** trong định nghĩa gốc:

```ts
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

`Pick` buộc `K extends keyof T` nên gõ sai key là lỗi ngay. `Omit` chỉ buộc `K extends keyof any` (tức `string | number | symbol`) — nghĩa là mọi chuỗi đều hợp lệ, gõ nhầm `"passwrod"` vẫn qua và bạn lặng lẽ nhận về kiểu còn nguyên field `password`.

```ts
type Bug = Omit<User, "passwrod">; // không lỗi — password vẫn còn!
```

Đây là lựa chọn có chủ đích của TS team để `Omit` dùng được trong ngữ cảnh generic (khi `keyof T` chưa xác định) và khi bỏ key của một union. Bản chặt hơn:

```ts
type StrictOmit<T, K extends keyof T> = Omit<T, K>;

type Ok  = StrictOmit<User, "password">;  // OK
type Bad = StrictOmit<User, "passwrod">;  // Error — đúng như mong muốn
```

</details>

**5. `Record<K, V>` dùng khi nào? Khác gì với index signature dạng `[key: string]: V`?**

<details className="qa">
<summary>Xem đáp án</summary>

`Record<K, V> = { [P in K]: V }` — tạo object có key kiểu `K`, value kiểu `V`. Sức mạnh thật của nó lộ ra khi `K` là **union literal**:

```ts
type Role = "admin" | "user" | "guest";
const perms: Record<Role, string[]> = {
  admin: ["read", "write"],
  user: ["read"],
};  // Error — thiếu "guest"
```

| | `Record<Role, V>` (union literal) | `{ [key: string]: V }` |
|---|---|---|
| Tập key | Đóng, biết trước | Mở, key nào cũng được |
| Thiếu key | Báo lỗi (exhaustive) | Không kiểm tra được |
| Key lạ | Báo lỗi | Chấp nhận |
| Kiểu khi truy cập | `V` | `V`, hoặc `V \| undefined` nếu bật `noUncheckedIndexedAccess` |
| Hợp cho | Bảng cấu hình theo enum/union, đảm bảo phủ hết nhánh | Cache, lookup table, dữ liệu động từ API |

Lưu ý: `Record<string, V>` thì gần như tương đương index signature — khác biệt chỉ có ý nghĩa khi `K` là tập key hữu hạn.

</details>

**6. Phân biệt `Exclude` với `Omit`, và `Extract` với `Pick` — cặp nào làm việc trên union, cặp nào trên object?**

<details className="qa">
<summary>Xem đáp án</summary>

`Exclude` / `Extract` lọc **union các kiểu**; `Omit` / `Pick` lọc **key của object**.

| Utility | Đối tượng | Định nghĩa |
|---|---|---|
| `Exclude<T, U>` | Union | `T extends U ? never : T` |
| `Extract<T, U>` | Union | `T extends U ? T : never` |
| `Pick<T, K>` | Object | `{ [P in K]: T[P] }` |
| `Omit<T, K>` | Object | `Pick<T, Exclude<keyof T, K>>` |

```ts
type Status = "draft" | "active" | "archived";
type Live = Exclude<Status, "archived">;   // "draft" | "active"
type Gone = Extract<Status, "archived">;   // "archived"

interface User { id: number; name: string; password: string }
type Safe = Omit<User, "password">;        // { id; name }
```

`Exclude`/`Extract` là **distributive conditional type**: khi `T` là union, TS chạy điều kiện trên từng nhánh rồi gộp kết quả — đó là lý do chúng lọc được union. Còn `Omit` chính là `Exclude` áp lên `keyof T` rồi `Pick` lại, nên hai nhóm này liên quan chặt với nhau: nhóm union là *nguyên liệu*, nhóm object là *ứng dụng*.

</details>

**7. `NonNullable<T>` khác gì so với việc bật `strictNullChecks`? Hai thứ này thay thế nhau được không?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai thứ ở hai tầng hoàn toàn khác nhau.

`strictNullChecks` là **cờ compiler**, bật toàn dự án. Khi bật, `null` và `undefined` trở thành kiểu riêng, không còn tự động thuộc mọi kiểu — `let s: string = null` thành lỗi, và bạn buộc phải narrow trước khi dùng giá trị có thể null.

`NonNullable<T>` là một **phép biến đổi kiểu cục bộ**, gỡ `null | undefined` khỏi một kiểu cụ thể:

```ts
type T = NonNullable<string | null | undefined>; // string
```

Không thay thế nhau được, thậm chí phụ thuộc nhau: nếu **tắt** `strictNullChecks` thì `null`/`undefined` đã bị hấp thụ vào mọi kiểu, `NonNullable` gần như vô nghĩa. Ngược lại, bật `strictNullChecks` không tự loại null ở đâu cả — bạn vẫn cần `NonNullable` (hoặc narrow bằng `if`) tại từng chỗ.

Thứ tự đúng: bật `strictNullChecks` làm nền, rồi dùng `NonNullable` như công cụ dọn kiểu ở nơi đã biết chắc giá trị tồn tại.

</details>

**8. `ReturnType`, `Parameters`, `InstanceType`, `ConstructorParameters` lấy thông tin bằng cơ chế nào bên dưới?**

<details className="qa">
<summary>Xem đáp án</summary>

Tất cả đều dựa trên **conditional type + từ khoá `infer`** — khớp mẫu (pattern matching) trên kiểu, rồi bắt lấy phần cần.

```ts
type ReturnType<T extends (...a: any) => any> =
  T extends (...a: any) => infer R ? R : any;

type Parameters<T extends (...a: any) => any> =
  T extends (...a: infer P) => any ? P : never;

type InstanceType<T extends abstract new (...a: any) => any> =
  T extends abstract new (...a: any) => infer R ? R : any;

type ConstructorParameters<T extends abstract new (...a: any) => any> =
  T extends abstract new (...a: infer P) => any ? P : never;
```

`infer R` nghĩa là "chỗ này là một kiểu nào đó, đặt tên nó là `R` cho tôi dùng ở nhánh true". `Parameters` trả về một **tuple** (`[number, string]`), nên kết hợp rất hợp với rest parameter và spread.

Một cạm bẫy đáng nhớ: với hàm **overload**, conditional type chỉ khớp được **chữ ký cuối cùng**, nên `ReturnType` của hàm overload thường không như bạn mong đợi.

</details>

**9. `Awaited<T>` xử lý Promise lồng nhau ra sao? Vì sao nó thay thế được cách viết cũ với `infer`?**

<details className="qa">
<summary>Xem đáp án</summary>

`Awaited<T>` (TS 4.5+) bóc Promise **đệ quy** cho tới khi không còn lớp nào:

```ts
type A = Awaited<Promise<string>>;            // string
type B = Awaited<Promise<Promise<number>>>;   // number
type C = Awaited<number>;                     // number — không phải Promise thì giữ nguyên
type D = Awaited<Promise<string> | number>;   // string | number — phân tán trên union
```

Cách viết cũ chỉ bóc **một lớp** và dễ sai:

```ts
type Unwrap<T> = T extends Promise<infer U> ? U : T;
type E = Unwrap<Promise<Promise<number>>>;    // Promise<number> — còn sót một lớp
```

Ngoài đệ quy, `Awaited` còn xử lý đúng các trường hợp mà bản tự viết hay bỏ sót: **thenable** (bất cứ object nào có `.then`, chứ không chỉ `Promise`), phân tán trên union, và giữ nguyên `null`/`undefined`. Nó mô phỏng đúng ngữ nghĩa của `await` trong runtime — đó là lý do nên dùng bản dựng sẵn.

Pattern hay gặp nhất: `Awaited<ReturnType<typeof fetchUser>>` để lấy kiểu dữ liệu thật mà một hàm async trả về.

</details>

**10. Trong `ReturnType<typeof fn>`, `typeof` đóng vai trò gì? Vì sao không viết trực tiếp `ReturnType<fn>` được?**

<details className="qa">
<summary>Xem đáp án</summary>

TypeScript có **hai không gian tên tách biệt**: *value space* (biến, hàm, const) và *type space* (interface, type alias, class). `ReturnType<...>` cần một **kiểu** làm type argument, nhưng `fn` là một **giá trị** — nó chỉ tồn tại ở value space.

`typeof` ở vị trí kiểu là **type query operator** — cây cầu bắc từ value space sang type space, cho ra kiểu của giá trị đó:

```ts
function createUser(id: number, name: string): User { /* ... */ }

type Args = Parameters<typeof createUser>;  // [number, string]
type Ret  = ReturnType<typeof createUser>;  // User
type Bad  = ReturnType<createUser>;         // Error — "refers to a value, not a type"
```

Lưu ý `typeof` ở đây **khác hoàn toàn** toán tử `typeof` lúc runtime (trả về chuỗi `"function"`); trùng từ khoá nhưng khác ngữ cảnh.

Trường hợp `class` thì đặc biệt: tên class tồn tại ở **cả hai** space — `Logger` là kiểu instance, còn `typeof Logger` là kiểu của chính constructor. Đó là lý do phải viết `InstanceType<typeof Logger>` chứ không phải `InstanceType<Logger>`.

</details>

**11. Khi áp `Partial` lên một union type, kết quả có phân tán (distribute) trên từng nhánh không? Còn `Omit` thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`Partial` **có** phân tán, `Omit` **không** — đây là một trong những cạm bẫy hay gặp nhất.

`Partial` là *homomorphic mapped type* (map trực tiếp trên `keyof T`), và loại mapped type này tự động phân tán trên union:

```ts
type A = { kind: "a"; x: number };
type B = { kind: "b"; y: string };

type P = Partial<A | B>;
// = Partial<A> | Partial<B> — vẫn còn hai nhánh
```

`Omit` thì không, vì nó tính `keyof (A | B)` — mà `keyof` của một union chỉ cho ra **các key chung**:

```ts
type O = Omit<A | B, "kind">;
// keyof (A|B) = "kind" → Exclude bỏ hết → kết quả là {} — mất sạch x và y!
```

Cách sửa là tự phân tán bằng conditional type trên naked type parameter:

```ts
type DistributiveOmit<T, K extends PropertyKey> =
  T extends any ? Omit<T, K> : never;

type O2 = DistributiveOmit<A | B, "kind">; // { x: number } | { y: string }
```

Quy tắc nhớ: gặp discriminated union mà muốn dùng `Omit`/`Pick`, hãy bọc qua bản distributive trước.

</details>

**12. `Pick` / `Omit` làm mất đi những gì khi áp lên type có index signature, có method overload, hoặc có call signature?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều xây trên `keyof` + mapped type, mà `keyof` chỉ thấy **property**, nên mọi thứ không phải property đều rơi rụng.

Call signature và construct signature bị **xoá sạch** — kết quả trở thành object type thuần, không gọi được nữa:

```ts
type Fn = { (x: number): string; meta: string };
type R = Omit<Fn, "nothing">;   // { meta: string } — mất khả năng gọi
```

Index signature làm `Omit` mất tác dụng, vì `keyof` cho ra `string`/`number` và `Exclude` không cắt được một literal ra khỏi `string`:

```ts
type Dict = { [k: string]: number; a: number };
type D = Omit<Dict, "a">;  // index signature vẫn còn → "a" vẫn truy cập được
```

Về **method overload**: nếu overload nằm ở một property (`obj.fn`) thì `T[P]` lấy nguyên kiểu nên vẫn giữ; nhưng nếu chính `T` là hàm overload thì phần call signature bị bỏ như trên.

Ngoài ra, áp lên **class** sẽ mất member `private`/`protected` và mất quan hệ nominal với class gốc — kết quả chỉ còn là một object type bình thường.

</details>

**13. Utility type nào phù hợp nhất để tạo DTO ẩn field nhạy cảm như `password`? Vì sao nên ưu tiên nó hơn khai báo một interface mới?**

<details className="qa">
<summary>Xem đáp án</summary>

Câu trả lời quen thuộc là `Omit`:

```ts
type UserEntity = { id: number; name: string; email: string; password: string };
type UserResponse = Omit<UserEntity, "password">;
type UserCreateRequest = Omit<UserEntity, "id">;
```

Ưu điểm so với viết một interface mới bằng tay: **một nguồn sự thật**. Thêm field `phone` vào `UserEntity` là mọi biến thể tự cập nhật, không phải sửa nhiều chỗ và không sợ sót. Interface viết tay sẽ trôi dần khỏi entity theo thời gian mà compiler không hề cảnh báo.

Nhưng với dữ liệu **nhạy cảm**, `Pick` thường là lựa chọn an toàn hơn:

```ts
type UserResponse = Pick<UserEntity, "id" | "name" | "email">;
```

Lý do: `Omit` là denylist — mai này ai đó thêm `passwordResetToken` vào entity thì field đó **tự động lọt ra** response. `Pick` là allowlist, mọi field mới mặc định bị giữ lại bên trong. Nguyên tắc bảo mật "mặc định từ chối" nghiêng hẳn về `Pick`. Nhớ rằng đây chỉ là an toàn ở tầng kiểu — vẫn phải thực sự lọc dữ liệu lúc chạy.

</details>

**14. `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize` thuộc nhóm nào và được cài đặt ở đâu? Vì sao không viết lại chúng bằng TS thuần được?**

<details className="qa">
<summary>Xem đáp án</summary>

Chúng thuộc nhóm **intrinsic string manipulation types**, thường dùng kèm template literal type:

```ts
type Ev = `on${Capitalize<"click">}`;  // "onClick"
type U  = Uppercase<"get" | "post">;   // "GET" | "POST"
```

Trong `lib.es5.d.ts` chúng được khai báo bằng từ khoá đặc biệt `intrinsic`:

```ts
type Uppercase<S extends string> = intrinsic;
```

Nghĩa là **không có phần thân viết bằng TS** — phần cài đặt nằm trong chính mã nguồn của compiler (checker gọi thẳng vào hàm xử lý chuỗi của JS).

Không viết lại bằng TS thuần được vì hệ kiểu của TS không có phép **biến đổi ký tự**. Template literal type cho phép tách và ghép chuỗi ở tầng kiểu, nhưng không có cách nào đổi `"a"` thành `"A"` — trừ khi bạn tự khai một bảng ánh xạ 26+ ký tự rồi duyệt đệ quy, vừa cực kỳ tốn hiệu năng type-check vừa không xử lý nổi Unicode. Vì vậy TS chọn cài đặt chúng ở tầng compiler.

</details>

**15. `ThisType`, `Omit` với generic chưa gán, và `Extract` với `never` — chuyện gì xảy ra khi kết quả rút gọn về `never`?**

<details className="qa">
<summary>Xem đáp án</summary>

`ThisType<T>` là một **marker type**, không thêm property nào; nó chỉ có tác dụng trong object literal có contextual type và khi bật `noImplicitThis`, để khai báo kiểu của `this` bên trong các method — kiểu mà Vue Options API dùng.

`Omit<T, K>` khi `T` còn là type parameter chưa gán sẽ bị **hoãn đánh giá** (deferred): TS chưa biết `keyof T` nên chưa rút gọn được, dẫn tới autocomplete kém và thường không gán ngược về `T` được.

`Extract<T, never>` luôn cho `never`, vì không nhánh nào của `T` extends `never`.

Khi kết quả rút về `never`:

- `never` là **union rỗng** — không giá trị nào gán được vào nó, nên chỗ dùng sẽ báo lỗi khó hiểu kiểu "Type 'string' is not assignable to type 'never'".
- `never` bị **nuốt trong union**: `string | never` là `string`, nên lỗi hay ẩn đi và chỉ lộ ở nơi rất xa.
- `Record<never, V>` cho `{}`, và mapped type trên `never` cho object rỗng.

Thấy `never` xuất hiện ngoài ý muốn thường nghĩa là bạn đã lọc quá tay, hoặc hai kiểu đem so không hề giao nhau — hãy hover từng bước trung gian để tìm chỗ union bị rỗng.

</details>

**16. Vì sao lạm dụng chuỗi utility lồng nhau kiểu `Partial<Omit<Pick<T, K>, K2>>` là code smell? Bạn refactor thế nào cho dễ đọc?**

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề không nằm ở utility type mà ở việc **dồn quá nhiều phép biến đổi vào một biểu thức vô danh**:

- Người đọc phải giải mã từ trong ra ngoài mới biết kiểu cuối cùng là gì, và cái tên không nói lên **ý định nghiệp vụ**.
- Thông báo lỗi bị "duỗi" ra thành một khối kiểu dài, rất khó soi.
- Mỗi tầng là một lần instantiate — chồng nhiều tầng trên union lớn làm chậm type-check.
- Thường là triệu chứng: kiểu gốc `T` ôm quá nhiều vai trò, nên chỗ nào dùng cũng phải gọt lại.

Cách refactor — đặt tên cho từng bước trung gian theo ngữ nghĩa:

```ts
// Khó đọc
type Form = Partial<Omit<Pick<User, "id" | "name" | "email">, "id">>;

// Dễ đọc
type UserProfile = Pick<User, "id" | "name" | "email">;
type UserProfileDraft = Partial<Omit<UserProfile, "id">>;
```

Xa hơn: tách kiểu gốc thành các mảnh nhỏ rồi ghép lại (`UserIdentity & UserContact`), khai báo DTO tường minh ở biên hệ thống, hoặc đi theo hướng schema-first (Zod) rồi suy kiểu từ schema — vừa có validate lúc chạy vừa có kiểu sạch.

</details>

---

## 2. Decorators

Bài học: [2. Decorators](../../typescript/07-utility-decorators/2_decorators.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Decorator thực chất là gì ở mức JavaScript? Nó chạy vào thời điểm nào — lúc khai báo class hay lúc tạo instance?**

<details className="qa">
<summary>Xem đáp án</summary>

Decorator chỉ là một **hàm bình thường**. Cú pháp `@log` là đường cú pháp — compiler biến nó thành lời gọi hàm, truyền vào thông tin về thứ được gắn.

Nó chạy **một lần, lúc class được định nghĩa** (khi module chứa class được evaluate), **không phải** lúc `new`:

```ts
function log(target: any, key: string, descriptor: PropertyDescriptor) {
  console.log("decorator chạy!");   // in ngay khi file được load
}

class Calc {
  @log
  add(a: number, b: number) { return a + b; }
}
// "decorator chạy!" đã in ra ở đây, trước cả new Calc()
```

Ở bản legacy, TS sinh ra lời gọi đại loại `__decorate([log], Calc.prototype, "add", null)` ngay sau khai báo class.

Hệ quả quan trọng: decorator **không nhìn thấy instance** và không thấy đối số của từng lần gọi. Muốn can thiệp lúc chạy thì phải **wrap** — thay method bằng một hàm mới, và chính hàm mới đó mới chạy ở mỗi lần gọi.

</details>

**2. Kể 4 loại decorator (class, method, property, parameter) và các tham số mà mỗi loại nhận được.**

<details className="qa">
<summary>Xem đáp án</summary>

Với decorator legacy (bản mà NestJS, TypeORM đang dùng):

| Loại | Tham số nhận được | Giá trị trả về |
|---|---|---|
| Class | `(constructor)` | Constructor mới để thay thế, hoặc `undefined` |
| Method | `(target, propertyKey, descriptor)` | `PropertyDescriptor` mới, hoặc `undefined` |
| Accessor | `(target, propertyKey, descriptor)` — descriptor có `get`/`set` | Như method |
| Property | `(target, propertyKey)` | Bị bỏ qua |
| Parameter | `(target, propertyKey, parameterIndex)` | Bị bỏ qua |

Trong đó `target` là **prototype** của class với thành viên instance, và là **chính constructor** với thành viên `static`.

```ts
function cls(ctor: Function) {}
function method(t: any, k: string, d: PropertyDescriptor) {}
function prop(t: any, k: string) {}
function param(t: any, k: string, i: number) {}
```

Điểm cần nhớ: chỉ class và method/accessor **thay đổi được hành vi**; property và parameter chủ yếu để **ghi metadata**.

</details>

**3. Với nhiều decorator xếp chồng, thứ tự **đánh giá biểu thức** và thứ tự **áp dụng** khác nhau ra sao? Cho ví dụ minh hoạ.**

<details className="qa">
<summary>Xem đáp án</summary>

Biểu thức decorator được **đánh giá từ trên xuống**, nhưng hàm decorator được **áp dụng từ dưới lên** — giống toán học: `first(second(x))`.

```ts
function first() {
  console.log("first: đánh giá");
  return (t: any, k: string, d: PropertyDescriptor) => { console.log("first: áp dụng"); };
}
function second() {
  console.log("second: đánh giá");
  return (t: any, k: string, d: PropertyDescriptor) => { console.log("second: áp dụng"); };
}

class C {
  @first()
  @second()
  m() {}
}
```

Output:

```
first: đánh giá
second: đánh giá
second: áp dụng
first: áp dụng
```

Áp vào ví dụ `@log` + `@timed` trong bài: `@timed` bọc method gốc trước, rồi `@log` bọc tiếp kết quả — nên lúc chạy, log chạy ở vòng ngoài cùng, bao quanh phần đo thời gian.

Thứ tự này quan trọng khi các decorator có tương tác, ví dụ `@Authorize` phải nằm ngoài `@Log` để không ghi log những lời gọi bị chặn.

</details>

**4. Decorator factory là gì? Vì sao `@log` và `@log()` không thay thế nhau được?**

<details className="qa">
<summary>Xem đáp án</summary>

**Decorator factory** là hàm trả về decorator, cho phép truyền tham số cấu hình:

```ts
// Decorator thường — dùng @log
function log(target: any, key: string, d: PropertyDescriptor) { /* ... */ }

// Decorator factory — dùng @logWith("API")
function logWith(prefix: string) {
  return function (target: any, key: string, d: PropertyDescriptor) { /* ... */ };
}

class S {
  @log            // truyền chính hàm log làm decorator
  a() {}

  @logWith("API") // gọi logWith trước, kết quả mới là decorator
  b() {}
}
```

Hai cách không thay thế nhau vì `@expr` luôn lấy **giá trị của `expr`** làm decorator:

- Viết `@log()` khi `log` là decorator thường → TS gọi `log()` với 0 đối số, `target`/`key`/`descriptor` đều `undefined`, và giá trị trả về (`undefined`) được dùng làm decorator → lỗi.
- Viết `@logWith` khi `logWith` là factory → TS truyền `(target, key, descriptor)` vào `logWith`, tức `prefix` nhận nhầm prototype, và kết quả trả về là một hàm decorator chưa được gọi → sai chữ ký.

Vì vậy hầu hết framework chọn luôn dùng dạng factory (`@Injectable()`, `@Column()`) cho nhất quán.

</details>

**5. Method decorator nhận `PropertyDescriptor` — bạn bọc (wrap) method bằng cách sửa `descriptor.value` thế nào, và cần cẩn thận gì với `this` và arrow function?**

<details className="qa">
<summary>Xem đáp án</summary>

Giữ lại hàm gốc, gán một hàm mới vào `descriptor.value`, rồi gọi lại hàm gốc bên trong:

```ts
function log(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {   // function, KHÔNG phải arrow
    console.log(`Call ${key} với`, args);
    return original.apply(this, args);             // giữ đúng this + trả về kết quả
  };
  return descriptor;
}
```

Những chỗ dễ sai:

- Dùng **arrow function** làm wrapper: arrow không có `this` riêng, nó lấy `this` của scope bao ngoài (ở đây là module) nên instance bị mất — mọi truy cập `this.x` bên trong method gốc sẽ hỏng.
- Quên `return` giá trị của `original.apply(...)` → method bỗng trả về `undefined`.
- Method **async**: `original.apply` trả về Promise, muốn đo thời gian hay bắt lỗi phải `await` hoặc dùng `.then`/`.finally`, không thể đo đồng bộ.
- Method viết dưới dạng **arrow property** (`add = (a, b) => ...`) thực chất là property của instance, không có trên prototype — method decorator không áp được.

</details>

**6. Vì sao property decorator không đọc được giá trị runtime của property? Nó thường được dùng để làm gì thay thế?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì nó chạy **lúc class được định nghĩa**, thời điểm đó chưa có instance nào tồn tại. Property của instance chỉ được tạo khi constructor chạy, mà constructor thì chạy sau đó rất lâu. Ngoài ra `target` mà decorator nhận là **prototype**, không phải instance, và bản legacy cũng không truyền `descriptor` cho property decorator — nó chỉ biết mỗi **tên** property.

```ts
function required(target: any, key: string) {
  console.log(`${key} là bắt buộc`);  // chỉ có tên, không có giá trị
}
class User {
  @required
  name: string = "";
}
```

Nên thay vào đó nó được dùng để:

- **Ghi metadata** qua `reflect-metadata` — nền tảng của `@Column` (TypeORM), `@IsEmail` (class-validator), `@Input` (Angular).
- **Đăng ký vào registry** để thành phần khác đọc lúc runtime (bộ validate, bộ serialize).
- **Thay property bằng getter/setter** trên prototype bằng `Object.defineProperty`, nếu thực sự cần chặn đọc/ghi.

Decorator Stage 3 khá hơn ở điểm này: nó có `context.addInitializer` và hàm initializer cho phép can thiệp vào giá trị khởi tạo của từng instance.

</details>

**7. `experimentalDecorators` và `emitDecoratorMetadata` bật lên để làm gì? `emitDecoratorMetadata` phụ thuộc thư viện runtime nào?**

<details className="qa">
<summary>Xem đáp án</summary>

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

`experimentalDecorators` bật cú pháp và ngữ nghĩa **decorator legacy** — chữ ký `(target, key, descriptor)`, có parameter decorator. Trên TS 5.0+, nếu không bật cờ này thì decorator được hiểu theo chuẩn Stage 3.

`emitDecoratorMetadata` khiến TS **phát thêm metadata về kiểu** cho những thành viên có decorator, dưới dạng các lời gọi `Reflect.metadata`:

- `design:type` — kiểu của property.
- `design:paramtypes` — mảng kiểu các tham số.
- `design:returntype` — kiểu trả về.

Nó phụ thuộc polyfill **`reflect-metadata`**, phải `import "reflect-metadata"` một lần ở entry file, nếu không `Reflect.getMetadata` sẽ không tồn tại.

Hai giới hạn cần nhớ: metadata chỉ được sinh ra khi thành viên đó **có ít nhất một decorator**; và chỉ kiểu dạng class mới giữ được thông tin hữu ích — interface, union, generic đều bị quy về `Object`. Đó chính là lý do NestJS bắt dùng `@Inject(TOKEN)` cho các dependency không phải class.

</details>

**8. Khác biệt cốt lõi giữa legacy decorator và decorator **Stage 3** (chuẩn ECMAScript, TS 5.0+) về chữ ký và đối tượng `context`? Có trộn lẫn hai loại trong một dự án được không?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Legacy | Stage 3 |
|---|---|---|
| Chữ ký method decorator | `(target, key, descriptor)` | `(value, context)` |
| Cách thay đổi hành vi | Sửa `descriptor.value` tại chỗ | **Trả về** hàm thay thế |
| Thông tin ngữ cảnh | Suy từ `target`/`key` | Đối tượng `context` đầy đủ |
| Parameter decorator | Có | **Không có** trong đề xuất |
| Metadata | `reflect-metadata` | `context.metadata` |
| Cờ compiler | `experimentalDecorators` | Mặc định từ TS 5.0 |

Đối tượng `context` mang `kind` (`"method"`, `"field"`, `"getter"`...), `name`, `static`, `private`, `access` (hàm get/set giá trị), `addInitializer` (đăng ký việc chạy lúc khởi tạo) và `metadata`.

```ts
function logged<This, Args extends any[], R>(
  target: (this: This, ...args: Args) => R,
  context: ClassMethodDecoratorContext,
) {
  return function (this: This, ...args: Args): R {
    console.log(`Call ${String(context.name)}`);
    return target.call(this, ...args);
  };
}
```

**Không trộn lẫn được**: `experimentalDecorators` là cờ cấp dự án, bật lên thì mọi decorator trong dự án đều theo ngữ nghĩa legacy. Phải chọn một, theo framework đang dùng.

</details>

**9. Vì sao NestJS, TypeORM, Angular vẫn phải dùng legacy decorator? Điều đó ảnh hưởng thế nào tới quyết định nâng cấp TS?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai lý do kỹ thuật cốt lõi:

- Chuẩn Stage 3 **không có parameter decorator**, trong khi DI của NestJS/Angular dựa vào `@Inject`, `@Body`, `@Param` gắn lên tham số constructor và tham số handler.
- Chúng phụ thuộc `emitDecoratorMetadata` để suy kiểu dependency từ `design:paramtypes`; `context.metadata` của Stage 3 không cung cấp thông tin kiểu tương đương, vì thông tin kiểu vốn bị xoá khi biên dịch.

Ảnh hưởng tới việc nâng cấp TS:

- Nâng lên TS 5.x vẫn **an toàn**, vì `experimentalDecorators` vẫn được hỗ trợ; chỉ cần giữ nguyên cờ này trong `tsconfig.json`.
- Nhưng phải chấp nhận **không dùng được decorator kiểu mới** trong cùng dự án, và không hưởng các cải tiến của chuẩn.
- Cẩn thận với công cụ build: một số transpiler nhanh (như esbuild) không sinh được `emitDecoratorMetadata`, nên hệ sinh thái NestJS thường dùng `tsc` hoặc SWC với tuỳ chọn tương ứng. Đổi bundler mà quên điều này là gãy DI ngay lúc chạy.

</details>

**10. Decorator đóng vai trò gì trong dependency injection? `@Injectable` và `@Inject` dựa vào cơ chế nào để biết kiểu cần tiêm?**

<details className="qa">
<summary>Xem đáp án</summary>

Decorator là **cầu nối giữa kiểu lúc biên dịch và container lúc chạy**. Luồng như sau:

1. `@Injectable()` đánh dấu class có thể tham gia DI. Quan trọng hơn, chính việc **có decorator** kích hoạt TS sinh metadata cho class đó.
2. Với `emitDecoratorMetadata`, TS phát ra `design:paramtypes` — mảng các constructor tham chiếu tới kiểu tham số của constructor.
3. Container đọc `Reflect.getMetadata("design:paramtypes", SomeClass)` để biết cần khởi tạo những dependency nào, rồi resolve đệ quy và gọi `new SomeClass(...deps)`.
4. `@Inject(TOKEN)` là **parameter decorator**, ghi metadata "tham số ở index `i` dùng token này".

```ts
@Injectable()
class UserService {
  constructor(
    private repo: UserRepository,          // suy từ design:paramtypes
    @Inject("CONFIG") private cfg: Config, // phải chỉ token tường minh
  ) {}
}
```

Vì sao cần `@Inject`? Vì metadata kiểu chỉ chính xác với **class**. Interface, union, string, kiểu generic đều bị xoá lúc biên dịch và quy về `Object` — container không suy ra được gì, nên phải có token tường minh.

</details>

**11. Parameter decorator dùng để làm gì nếu nó không sửa được giá trị tham số?**

<details className="qa">
<summary>Xem đáp án</summary>

Parameter decorator chỉ nhận `(target, propertyKey, parameterIndex)` và giá trị trả về của nó bị bỏ qua — nó **không** chạm được vào đối số thật. Vai trò duy nhất của nó là **ghi lại metadata gắn với vị trí tham số**, để một thành phần khác đọc sau đó.

Ví dụ điển hình trong NestJS:

```ts
@Controller("users")
class UserController {
  @Get(":id")
  findOne(@Param("id") id: string, @Query("full") full?: string) {}
}
```

`@Param("id")` chỉ ghi lại "tham số index 0 lấy từ `req.params.id`". Việc **đọc request và truyền giá trị vào** là do lớp wrapper của framework làm — wrapper này được tạo bởi method decorator `@Get`, nó đọc bảng metadata rồi dựng danh sách đối số trước khi gọi handler.

Cùng mô hình đó với `@Inject(TOKEN)` trong DI: parameter decorator ghi token, còn container mới là chỗ thực sự tạo và truyền dependency.

Tóm lại: parameter decorator **khai báo ý định**, một cơ chế khác **thực thi ý định** đó.

</details>

**12. Decorator ảnh hưởng thế nào tới tree-shaking và kích thước bundle? Vì sao code có decorator khó bị loại bỏ khi không dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

Tree-shaking hoạt động dựa trên giả định: code không được dùng và **không có side effect** thì xoá được. Decorator phá vỡ đúng giả định đó.

Sau khi biên dịch, mỗi decorator trở thành một **lời gọi hàm ở top-level module**:

```js
class UserService { }
UserService = __decorate([
  Injectable(),
  __metadata("design:paramtypes", [UserRepository])
], UserService);
```

Bundler nhìn thấy `__decorate(...)` chạy ngay khi module được load, không thể chứng minh nó vô hại (decorator có thể ghi vào registry toàn cục — và thực tế đúng là như vậy), nên **giữ lại toàn bộ class** dù không ai import nó.

Nặng hơn: `emitDecoratorMetadata` biến kiểu tham số thành **tham chiếu giá trị** (`UserRepository` xuất hiện trong mã phát ra). Một class trước đây chỉ dùng làm kiểu — lẽ ra bị xoá sạch — nay bị kéo vào bundle cùng cả cây phụ thuộc của nó.

Giảm thiệt hại: dùng `import type` cho những kiểu không cần metadata, dùng string/symbol token thay class token, và đánh dấu `sideEffects` chính xác trong `package.json`. Với app frontend, cân nhắc bỏ decorator hẳn.

</details>

**13. Khi nào nên dùng **higher-order function** hoặc hook thay vì decorator? Nêu tiêu chí quyết định.**

<details className="qa">
<summary>Xem đáp án</summary>

Nghiêng về **higher-order function / hook** khi:

- Code của bạn là **hàm hoặc component**, không phải class — decorator chỉ gắn được lên thành viên của class.
- Bạn cần **kiểu chính xác**: HOF giữ và biến đổi được kiểu, còn decorator legacy không thay đổi được kiểu mà TS nhìn thấy.
- Bạn không muốn phụ thuộc cờ compiler, `reflect-metadata` và cấu hình bundler.
- Bạn quan tâm tree-shaking và bundle size (app React/Next).
- Bạn muốn test dễ: HOF là hàm thuần, gọi trực tiếp là xong.

```ts
const logged = <F extends (...a: any[]) => any>(fn: F): F =>
  ((...args) => {
    console.log("Call", args);
    return fn(...args);
  }) as F;
```

Nghiêng về **decorator** khi:

- Framework yêu cầu (NestJS, TypeORM, Angular) — không có lựa chọn khác.
- Bạn cần **metadata khai báo** để một container/ORM đọc lúc runtime.
- Có rất nhiều chỗ áp dụng và cú pháp `@` làm ý định dễ đọc hơn hẳn.

Tiêu chí gọn: cần *metadata cho framework* thì dùng decorator; chỉ cần *bọc thêm hành vi* thì dùng HOF.

</details>

**14. Decorator có thay đổi được **kiểu** của class/method mà nó gắn vào không? Giới hạn này ở bản legacy ra sao và Stage 3 cải thiện thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Câu trả lời ngắn: **không**. Ở cả legacy lẫn Stage 3, TS vẫn dùng kiểu khai báo gốc của class/method, bất kể decorator làm gì lúc chạy.

```ts
function addId<T extends { new (...a: any[]): {} }>(ctor: T) {
  return class extends ctor { id = 1; };
}

@addId
class User { name = "An"; }

new User().id;  // Error — TS không biết id tồn tại
```

Ở bản legacy, hạn chế còn nặng hơn: chữ ký decorator gần như không được kiểm tra chặt (`target: any`), nên gắn nhầm loại decorator cũng khó bị bắt. Cách đi vòng thường thấy là dùng **mixin bằng hàm thường** (`class User extends addId(Base) {}`) — hàm thì TS suy kiểu trả về đầy đủ — hoặc khai báo bổ sung bằng interface merging.

Stage 3 cải thiện ở **an toàn kiểu của chính decorator**: có các kiểu `ClassMethodDecoratorContext`, `ClassFieldDecoratorContext`..., giá trị trả về bị kiểm tra phải tương thích với thứ được gắn, và `this` được đánh kiểu đúng. Nhưng khả năng "decorator làm giàu kiểu của class" thì **vẫn chưa có** — đó là giới hạn cố ý, vì để đúng thì type checker phải thực thi decorator lúc biên dịch.

</details>

**15. Decorator trên accessor (`get` / `set`) khác gì decorator trên method thường?**

<details className="qa">
<summary>Xem đáp án</summary>

Ở bản legacy, chữ ký **giống hệt** method decorator — `(target, key, descriptor)` — nhưng nội dung `descriptor` khác:

- Method: có `descriptor.value` (chính hàm đó).
- Accessor: có `descriptor.get` và/hoặc `descriptor.set`, **không** có `value`.

Nên muốn bọc thì phải thay đúng `get`/`set`:

```ts
function logGet(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalGet = descriptor.get;
  descriptor.get = function () {
    console.log(`đọc ${key}`);
    return originalGet?.call(this);
  };
  return descriptor;
}
```

Khác biệt quan trọng nhất: getter và setter cùng tên **dùng chung một descriptor**, nên TypeScript **không cho gắn decorator lên cả hai** — báo lỗi "Decorators cannot be applied to multiple get/set accessors of the same name". Quy ước là gắn lên cái xuất hiện **trước** trong khai báo, và decorator đó chi phối cả cặp.

Stage 3 tách bạch hơn: có `ClassGetterDecoratorContext` và `ClassSetterDecoratorContext` riêng biệt, cộng thêm từ khoá `accessor` với `ClassAccessorDecoratorContext` cho field có getter/setter tự sinh.

</details>

**16. Bạn test một decorator như thế nào? Nêu khó khăn khi decorator giữ trạng thái toàn cục hoặc ghi vào metadata registry.**

<details className="qa">
<summary>Xem đáp án</summary>

Có hai hướng, thường dùng cả hai:

Test như một hàm thuần — gọi trực tiếp với descriptor giả:

```ts
const descriptor = { value: (a: number) => a * 2 };
log({}, "double", descriptor as PropertyDescriptor);
expect(descriptor.value(3)).toBe(6);   // vẫn đúng kết quả
expect(consoleSpy).toHaveBeenCalled(); // và có ghi log
```

Test qua hành vi — định nghĩa một class thử nghiệm ngay trong file test, gắn decorator, gọi method rồi assert side effect (spy `console.log`, mock timer, kiểm tra metadata).

Khó khăn hay gặp:

- Decorator chạy **một lần lúc module được load**, không phải mỗi lần test. Trạng thái trong registry tích luỹ dần, test phụ thuộc thứ tự chạy và không reset được bằng `beforeEach` thông thường — phải `jest.resetModules()` rồi import lại, hoặc thiết kế registry có hàm `clear()`.
- `reflect-metadata` là **singleton toàn cục**, metadata từ test này rò sang test khác.
- Phải bật đúng `experimentalDecorators`/`emitDecoratorMetadata` trong cấu hình của test runner, nếu không hành vi khác hẳn lúc build thật.
- Class decorator trả về class mới làm **mất identity**, khiến `instanceof` và so sánh tên class trở nên khó đoán.

</details>
