---
sidebar_position: 1
title: "1. Giới thiệu"
---

# 1. Giới thiệu

## 1. TypeScript là gì?

Bài học: [1. TypeScript là gì?](../../typescript/01-gioi-thieu/1_typescript-la-gi.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. TypeScript là gì, và vì sao nói nó là superset của JavaScript? Điều đó có đồng nghĩa với việc đổi mọi file `.js` thành `.ts` là chạy được ngay không?**

<details className="qa">
<summary>Xem đáp án</summary>

**TypeScript** là ngôn ngữ do Microsoft phát triển từ năm 2012, bổ sung **hệ thống type tĩnh** lên trên JavaScript rồi compile (transpile) ngược về JS thuần để chạy trên Node/trình duyệt.

Gọi là **superset** vì TS **chỉ thêm vào, không bỏ đi**: mọi cú pháp JavaScript hợp lệ đều là cú pháp TypeScript hợp lệ — vòng tròn JS nằm trọn trong vòng tròn TS.

Nhưng "đổi đuôi là chạy được ngay" cần hiểu đúng ở hai mức:

- **Chạy được**: có. Sau khi compile, type bị xoá sạch nên output gần như chính là file JS ban đầu.
- **Compile sạch lỗi**: chưa chắc. File `.js` đổi thành `.ts` sẽ bị compiler soi kiểu — tham số không khai báo trở thành **implicit any**, và nếu bật `noImplicitAny` thì lỗi nổi lên hàng loạt.

Nói cách khác, "superset" đảm bảo *tính hợp lệ về cú pháp*, không đảm bảo *code qua được type-check*.

</details>

**2. TypeScript bổ sung thêm những gì so với JavaScript, và nó không bổ sung thứ gì (về mặt runtime)?**

<details className="qa">
<summary>Xem đáp án</summary>

**TS bổ sung (chỉ tồn tại ở compile-time):**

- Type annotation cho biến, tham số, giá trị trả về: `name: string`, `: void`.
- Các cách khai báo kiểu: `interface`, `type`, generic, union/intersection, enum.
- Type inference, type narrowing, type guard (`x is User`).
- Lợi ích tooling như bài đã nêu: phát hiện lỗi sớm, IntelliSense chính xác, refactor an toàn, type vừa là ràng buộc vừa là tài liệu.

**TS KHÔNG bổ sung gì ở runtime:**

- Không có runtime riêng, không có VM riêng, không có thư viện chuẩn riêng.
- Không thêm hàm hay API nào cho chương trình lúc chạy.
- Không tự kiểm tra kiểu khi chạy — trong file `.js` output không có "type checker" nào cả.

Đúng như sơ đồ trong bài: `tsc` làm hai việc — **check type** rồi **sinh file `.js` đã xoá sạch type**. Thứ thực sự chạy luôn là JavaScript thuần.

</details>

**3. Type erasure là gì? Sau khi `tsc` biên dịch, những thành phần nào trong code TypeScript biến mất hoàn toàn khỏi file `.js` output?**

<details className="qa">
<summary>Xem đáp án</summary>

**Type erasure** là việc compiler **xoá sạch mọi thông tin về type** khi sinh ra JavaScript. Code JS output không biết gì về hệ thống type đã dùng để viết ra nó.

Những thứ biến mất hoàn toàn:

- Type annotation: `: string`, `: number`, `: User`, kiểu trả về `: void`.
- Khai báo `interface` và `type` alias.
- Generic type parameter (`<T>`) cùng các ràng buộc `extends`.
- Type assertion: `as User`.
- Khai báo thuần type: `declare`, toàn bộ nội dung file `.d.ts`.

```ts
interface User { id: number }
function f(u: User): string { return String(u.id); }
```

```js
function f(u) { return String(u.id); }
```

Ngược lại, những thứ **sinh ra giá trị thật** thì vẫn còn: `class`, `enum` (trừ `const enum`), biến, hàm. Chỉ phần thuần type mới bị xoá.

</details>

**4. Vì sao không thể viết `typeof MyInterface` hay `x instanceof MyInterface` để kiểm tra kiểu tại runtime? Giải thích theo cơ chế biên dịch.**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `interface` **không tồn tại sau khi compile**. Nó nằm trong "không gian type" của TypeScript, còn `typeof` và `instanceof` là toán tử JavaScript, chỉ làm việc với **giá trị** lúc runtime.

Chuỗi lý luận:

1. Bạn viết `interface User { id: number }`.
2. `tsc` dùng nó để check code, rồi **xoá nó đi** (type erasure).
3. File `.js` output không còn định danh `User` nào.
4. Nếu code đó chạy được tới runtime, JS sẽ báo `User is not defined` — nhưng thực tế bạn không tới được đó, vì chính compiler đã chặn trước với lỗi kiểu *"'User' only refers to a type, but is being used as a value here"*.

`instanceof` chỉ dùng được với **class**, vì class sinh ra một function thật ở runtime nên vẫn còn tồn tại. Muốn kiểm tra shape của một interface, phải tự viết **type guard** soi từng property như ví dụ `isUser` trong bài.

</details>

**5. Nếu type bị xoá lúc compile, làm sao đảm bảo dữ liệu trả về từ API đúng shape? Kể vài hướng xử lý (thư viện hoặc tự viết).**

<details className="qa">
<summary>Xem đáp án</summary>

Viết `const data: User = await res.json()` **không kiểm tra gì cả** — đó chỉ là lời hứa với compiler. Nếu API trả về thiếu field, TS vẫn tin và bug sẽ nổ ở chỗ khác. Dữ liệu từ bên ngoài (API, `localStorage`, user input, file config) bắt buộc phải được **validate ở runtime**.

Các hướng xử lý:

- **Thư viện schema validation**: **Zod**, **io-ts**, Yup, Valibot. Điểm mạnh của Zod là khai báo schema một lần rồi suy ra type TS từ chính schema đó, nên type và validation không bao giờ lệch nhau.
- **Tự viết type guard** — cách bài đã minh hoạ, không cần thêm dependency:

```ts
function isUser(x: unknown): x is User {
  return typeof x === "object" && x !== null
    && "id" in x && "name" in x;
}
```

- **Nhận dữ liệu ngoài dưới dạng `unknown`** thay vì `any`, để compiler buộc bạn narrow trước khi dùng.

Nguyên tắc: type lo compile-time, validation lo runtime — hai lớp bảo vệ khác nhau, không thay thế cho nhau.

</details>

**6. Hàm có return type `x is User` khác gì hàm trả về `boolean` thông thường? Compiler dùng thông tin đó để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`x is User` là **type predicate**: hàm vừa trả về `boolean` ở runtime, vừa nói với compiler rằng "nếu trả `true` thì trong nhánh đó `x` có kiểu `User`". Hàm khai báo trả `boolean` thường không mang theo thông tin ấy, nên compiler không **narrow** kiểu giúp bạn.

```ts
declare function isUserBool(x: unknown): boolean;
declare function isUser(x: unknown): x is User;

if (isUserBool(data)) {
  data.name; // lỗi: 'data' vẫn là unknown
}

if (isUser(data)) {
  data.name; // OK: đã được narrow thành User
}
```

Compiler dùng type predicate cho **control flow analysis**: trong nhánh `true`, biến được thu hẹp thành `User`; trong nhánh `else`, `User` bị loại khỏi union. Lưu ý quan trọng: TS **tin** bạn — nếu phần kiểm tra bên trong viết sai, compiler vẫn narrow như thường, nên type guard phải được viết cẩn thận.

</details>

**7. TypeScript có runtime riêng không? Mô tả luồng từ file `.ts` cho tới lúc code thực sự chạy trên Node hoặc trình duyệt.**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** TypeScript là ngôn ngữ **compile-time**, không có runtime, VM hay engine riêng. Thứ chạy thật luôn là JavaScript trên V8, SpiderMonkey hoặc JavaScriptCore.

Luồng 3 bước như bài đã nêu:

```
[file .ts]  →  tsc (compiler)  →  [file .js]  →  Node / Browser chạy
```

Ở bước `tsc`, compiler làm song song hai việc:

- **Type check**: phân tích và báo lỗi kiểu ngay lúc compile — đây chính là toàn bộ giá trị TS mang lại.
- **Emit**: sinh file `.js` đã xoá sạch type (type erasure), kèm hạ cấp cú pháp về phiên bản JS mong muốn.

Một điểm hay bị hiểu nhầm: hai việc này **độc lập nhau**. Mặc định, dù có lỗi type, `tsc` vẫn xuất ra file `.js` chạy được (muốn chặn thì bật `noEmitOnError`). Các công cụ tốc độ cao như `esbuild` hay `swc` chỉ *strip* type mà **không** check type, nên dự án vẫn cần chạy `tsc --noEmit` riêng để bắt lỗi.

</details>

**8. File `.d.ts` là gì và khi nào bạn cần đến nó? Kho DefinitelyTyped với namespace `@types/*` giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**`.d.ts`** (type declaration file) là file **chỉ chứa khai báo type, không chứa code chạy được**. Nó mô tả cho compiler biết "module này export những gì, kiểu ra sao" mà không cần có source TypeScript.

Khi nào cần:

- Dùng một **thư viện viết bằng JS thuần** — bản thân file `.js` không mang type nào, TS cần `.d.ts` mới biết `lodash.chunk` nhận gì và trả gì.
- Khi bạn **publish một package viết bằng TS**: `tsc` sinh ra `.js` + `.d.ts` để người dùng khác vẫn có type.
- Khai báo biến global, module không có type, hoặc kiểu cho asset (`*.svg`, `*.css`).

**DefinitelyTyped** là kho cộng đồng chứa `.d.ts` cho hàng chục nghìn thư viện JS không tự kèm type, phát hành trên npm dưới namespace **`@types/*`**:

```bash
npm install lodash
npm install --save-dev @types/lodash
```

Nó giải quyết đúng bài toán: dùng được cả hệ sinh thái JS khổng lồ mà vẫn giữ được type safety, không phải chờ từng tác giả thư viện viết lại bằng TS.

</details>

**9. Cài `lodash` mà quên cài `@types/lodash` thì compiler báo lỗi gì, và có mấy cách xử lý tình huống này?**

<details className="qa">
<summary>Xem đáp án</summary>

Compiler báo lỗi đại ý: *"Could not find a declaration file for module 'lodash'. Try `npm i --save-dev @types/lodash`"* — tức TS tìm thấy file `.js` nhưng không tìm thấy khai báo type nào cho module đó.

Các cách xử lý, theo thứ tự nên ưu tiên:

- **Cài package type có sẵn**: `npm i -D @types/lodash`. Đây là cách đúng nhất nếu thư viện có mặt trên DefinitelyTyped.
- **Kiểm tra xem thư viện đã tự kèm type chưa** — nhiều package hiện đại viết bằng TS đã có sẵn `.d.ts`, khi đó không cần `@types/*`.
- **Tự viết file declaration** trong dự án, ví dụ `src/types/ten-thu-vien.d.ts`, khai báo những phần bạn thực sự dùng.
- **Khai báo tối thiểu để tạm bỏ qua**: `declare module "ten-thu-vien";` — nhanh nhưng module đó sẽ mang kiểu `any`, mất hết type safety.

Tránh cách "cùng đường" là ép `any` khắp nơi, vì như bài cảnh báo, `any` vô hiệu hoá toàn bộ type-check ở chỗ đó.

</details>

**10. `allowJs` và `checkJs` khác nhau ra sao? Dùng hai flag đó để migrate dần một codebase JavaScript lớn sang TypeScript như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Flag | Tác dụng |
|---|---|
| `allowJs: true` | Cho phép `tsc` **nhận và compile** cả file `.js` nằm trong project — nhưng không kiểm tra kiểu bên trong chúng |
| `checkJs: true` | Bật thêm **type-check cho chính các file `.js`** đó, suy luận kiểu từ code và từ chú thích **JSDoc** |

Nói ngắn: `allowJs` là "cho phép vào nhà", `checkJs` là "soi kỹ luôn".

Chiến lược migrate dần cho codebase lớn:

1. Thêm `tsconfig.json`, bật `allowJs: true` — dự án vẫn chạy y nguyên, chưa có lỗi nào.
2. Bật `checkJs: true` (hoặc chỉ thêm `// @ts-check` ở đầu từng file để làm từ từ) và bổ sung JSDoc cho những module quan trọng.
3. Đổi dần từng file `.js` sang `.ts`, ưu tiên các module lõi và phần dùng lại nhiều.
4. Siết dần độ nghiêm: bật `noImplicitAny`, rồi tiến tới `strict`.

Ưu điểm lớn nhất là **không phải dừng phát triển để viết lại toàn bộ codebase một lượt**.

</details>

**11. Implicit any là gì và vì sao nó nguy hiểm hơn `any` được khai báo tường minh? Flag nào chặn được nó?**

<details className="qa">
<summary>Xem đáp án</summary>

**Implicit any** là khi TS **không suy luận được kiểu** nên tự gán `any` cho biến/tham số, dù bạn không hề viết chữ `any` nào:

```ts
function greet(name) {   // name: implicit any
  return name.toUpperCase();
}

greet(42); // compiler không hề cản — runtime mới nổ lỗi
```

Vì sao nguy hiểm hơn `any` tường minh:

- **Vô hình**: đọc code không thấy dấu hiệu nào cho biết chỗ đó đã mất type safety. Còn `: any` viết rõ ràng thì ít nhất là một quyết định có ý thức, reviewer nhìn thấy được và có thể grep ra.
- **Lan rộng âm thầm**: kiểu `any` lây sang giá trị trả về, rồi sang mọi chỗ dùng kết quả đó.
- Thường xuất hiện hàng loạt khi mới đổi file `.js` sang `.ts`, tạo cảm giác "code đã có type" trong khi thực chất chưa được bảo vệ.

Chặn bằng **`noImplicitAny: true`** trong `tsconfig.json` (đã nằm sẵn trong `strict: true`). Khi đó compiler bắt bạn khai báo kiểu tường minh ở mọi chỗ nó không tự suy ra được.

</details>

**12. Vì sao nói `any` "vô hiệu hoá toàn bộ type-check" cho biến đó? Cho một ví dụ lỗi lọt qua compiler chỉ vì `any`.**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `any` nghĩa là "đừng kiểm tra gì cả". Với một giá trị `any`, compiler cho phép **mọi thao tác**: truy cập property không tồn tại, gọi như hàm, gán sang bất kỳ kiểu nào khác. Nó là cửa thoát hiểm tắt hẳn type system, chứ không phải "kiểu chung chung".

```ts
const data: any = { name: "Thuan" };

data.foo.bar;        // compiler im lặng → runtime: TypeError
data();              // compiler im lặng → runtime: not a function
const n: number = data.name; // gán string vào number, vẫn lọt

const list: any = "khong phai mang";
list.forEach((x: string) => console.log(x)); // runtime: not a function
```

Tệ hơn, `any` **lây lan**: giá trị `any` gán vào đâu thì chỗ đó cũng mất type safety theo.

Giải pháp an toàn khi thật sự chưa biết kiểu là dùng **`unknown`**: nó cũng nhận mọi giá trị, nhưng compiler **bắt buộc bạn narrow** (qua `typeof`, `in`, type guard) trước khi được phép dùng.

</details>

**13. Đoán kết quả biên dịch của `const s: string = JSON.parse(raw);` — compiler có chặn không, và vì sao đây vẫn là bug tiềm ẩn?**

<details className="qa">
<summary>Xem đáp án</summary>

**Compiler không chặn** — dòng này biên dịch sạch sẽ, không một cảnh báo nào.

Lý do: chữ ký của `JSON.parse` trong thư viện chuẩn trả về **`any`**. Mà `any` gán được sang bất kỳ kiểu nào, nên gán vào `string` là hợp lệ dưới mắt compiler.

Vì sao vẫn là bug tiềm ẩn:

```ts
const raw = '{"id": 1}';
const s: string = JSON.parse(raw); // compile OK
s.toUpperCase();                   // runtime: s.toUpperCase is not a function
```

`s` thực tế là một object, nhưng compiler tưởng là `string` nên vui vẻ cho gọi `.toUpperCase()`. Đây chính là minh hoạ kinh điển cho ý "type không tồn tại ở runtime": annotation chỉ là lời khai báo ý định, không phải kiểm tra.

Cách xử lý đúng: coi kết quả parse là **`unknown`** rồi validate trước khi dùng — bằng type guard tự viết hoặc schema của **Zod**/**io-ts**, đúng như phần type erasure trong bài đã khuyến nghị.

</details>

**14. Dùng TypeScript có làm chương trình chạy chậm hơn JavaScript thuần không? Trả lời dựa trên cơ chế type erasure.**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Nhờ **type erasure**, toàn bộ type annotation, `interface`, generic đều bị xoá lúc compile. File `.js` sinh ra về cơ bản giống hệt code JS bạn sẽ tự viết tay, và engine chạy nó với đúng tốc độ đó. TypeScript không thêm bất kỳ phép kiểm tra nào vào runtime.

Chi phí của TS nằm ở chỗ khác — **thời gian build**, không phải thời gian chạy:

- `tsc` phải phân tích và check kiểu toàn dự án, nên build lâu hơn; dự án lớn có thể mất vài chục giây.
- Đổi lại có thể dùng `esbuild`/`swc` để strip type cực nhanh cho bước build, và chạy `tsc --noEmit` riêng để check kiểu.

Vài lưu ý nhỏ: nếu đặt `target` quá thấp, compiler phải hạ cấp cú pháp hiện đại thành code dài hơn (ví dụ `async/await` thành state machine), khiến bundle to hơn — nhưng đó là chi phí của downlevel, không phải của type. Ngược lại, TS còn gián tiếp giúp hiệu năng vì khuyến khích kiểu ổn định, hợp với cách engine tối ưu.

</details>

---

## 2. TypeScript vs JavaScript

Bài học: [2. TypeScript vs JavaScript](../../typescript/01-gioi-thieu/2_ts-vs-js.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Static typing và dynamic typing khác nhau ở điểm nào? JavaScript và TypeScript thuộc nhóm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | Dynamic typing | Static typing |
|---|---|---|
| Kiểu gắn với | Giá trị, xác định lúc chạy | Biến, khai báo/suy luận trước |
| Thời điểm kiểm tra | Runtime | Compile-time |
| Đại diện | JavaScript, Python, Ruby | TypeScript, Java, C#, Rust |

**JavaScript là dynamic** — một biến đổi kiểu thoải mái mà không ai cản:

```js
let x = 10;
x = "hello"; // OK
x = true;    // OK
```

**TypeScript là static** — kiểu được khai báo trước và kiểm tra lúc compile:

```ts
let x: number = 10;
x = "hello"; // Error: Type 'string' is not assignable to type 'number'
```

Đánh đổi: dynamic viết nhanh, linh hoạt, không cần build; static bắt lỗi sớm, tooling mạnh, an toàn khi codebase lớn. Lưu ý TS chỉ static ở tầng compile — khi chạy thì vẫn là JavaScript dynamic như cũ.

</details>

**2. Compile-time và runtime khác nhau thế nào? Cho một ví dụ lỗi mà TypeScript bắt được lúc biên dịch còn JavaScript chỉ lộ ra lúc chạy.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Compile-time**: lúc `tsc` đọc và phân tích code, trước khi chương trình chạy. Lỗi hiện ngay trong IDE, sửa xong mới chạy.
- **Runtime**: lúc code thực sự thực thi trên Node/trình duyệt. Lỗi ở đây nghĩa là người dùng đã gặp — crash production.

Ví dụ trong bài:

```js
// JavaScript — im lặng cho tới lúc chạy
const user = { name: "An" };
console.log(user.age.toFixed(2)); // TypeError tại runtime
```

```ts
// TypeScript — báo đỏ ngay khi viết
const user = { name: "An" };
console.log(user.age.toFixed(2));
// Error: Property 'age' does not exist on type '{ name: string; }'
```

Giá trị cốt lõi của TypeScript nằm đúng ở chỗ này: **dời thời điểm phát hiện lỗi từ runtime lên compile-time**. Lỗi phát hiện càng sớm thì càng rẻ — sửa lúc gõ code rẻ hơn rất nhiều so với sửa khi đã lên production.

</details>

**3. Structural typing là gì? Vì sao hai `interface` khác tên nhưng cùng shape lại gán được cho nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

**Structural typing** (kiểu cấu trúc) nghĩa là TypeScript xác định hai type có tương thích hay không dựa trên **hình dạng (shape)** của chúng — có những property nào, kiểu gì — chứ không dựa vào tên type hay quan hệ kế thừa được khai báo.

```ts
interface Point { x: number; y: number; }
interface Coord { x: number; y: number; }

const p: Point = { x: 1, y: 2 };
const c: Coord = p; // OK — cùng shape
```

Compiler chỉ hỏi: "`Point` có đủ mọi thứ mà `Coord` yêu cầu không?" Có, nên gán được. Tên `Point` hay `Coord` hoàn toàn không liên quan.

Quy tắc kèm theo là **có thừa vẫn được, thiếu thì không**: object nhiều property hơn yêu cầu vẫn gán được (trừ trường hợp excess property check với object literal), nhưng thiếu một property bắt buộc là lỗi ngay.

Cách tiếp cận này giúp TS ăn khớp tự nhiên với văn hoá JavaScript — nơi người ta truyền object literal khắp nơi mà không khai báo class trước.

</details>

**4. Nominal typing của Java hay C# khác structural typing ra sao? Hệ quả thực tế khi thiết kế type trong TypeScript là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Structural (TypeScript) | Nominal (Java, C#) |
|---|---|---|
| Căn cứ tương thích | Shape — có đủ property đúng kiểu | Tên type và quan hệ `implements`/`extends` khai báo tường minh |
| Tạo tương thích | Tự động, chỉ cần cùng shape | Phải khai báo rõ ràng |
| Ưu | Linh hoạt, hợp với object literal, dễ mock trong test | Chặt chẽ, không nhầm hai khái niệm khác nhau |
| Nhược | Hai khái niệm khác nhau có thể vô tình hoán đổi | Nhiều boilerplate, cứng nhắc |

**Hệ quả thực tế khi thiết kế type trong TS:**

- Không cần `implements` để một object "khớp" một interface — viết đúng shape là đủ. Test dễ hơn nhiều vì chỉ cần object giả có đúng field.
- Nhưng phải cảnh giác với bug **"trùng shape không mong muốn"**: `interface Meters { value: number }` và `interface Feet { value: number }` hoán đổi được cho nhau, dù về mặt nghiệp vụ là hai thứ hoàn toàn khác.
- Khi cần phân biệt thật sự, phải chủ động tạo khác biệt về shape — dùng **branded type** hoặc thêm một field phân biệt (discriminant).

</details>

**5. "Duck typing" liên quan gì tới cơ chế structural typing của TypeScript?**

<details className="qa">
<summary>Xem đáp án</summary>

**Duck typing** xuất phát từ câu: *"Nếu nó đi như vịt và kêu như vịt thì nó là vịt"* — không quan tâm object thuộc class nào, chỉ cần nó có đủ method/property cần dùng. Đây là cách các ngôn ngữ dynamic như JavaScript, Python vận hành: gọi `obj.quack()` và hy vọng object đó có `quack`.

**Structural typing** là phiên bản **kiểm tra được lúc compile** của chính ý tưởng đó. Cả hai đều xét theo shape; khác biệt nằm ở thời điểm:

- **Duck typing** (JS): kiểm tra lúc chạy — thiếu method thì crash.
- **Structural typing** (TS): kiểm tra lúc biên dịch — thiếu property là báo lỗi ngay, chưa kịp chạy.

```ts
interface Duck { quack(): void }

function makeSound(d: Duck) { d.quack(); }

makeSound({ quack: () => console.log("quack!") }); // OK, không cần class Duck
makeSound({ bark: () => {} });                     // Error ngay lúc compile
```

Có thể nói structural typing chính là cách TypeScript giữ lại tinh thần duck typing rất "JavaScript", nhưng bổ sung lưới an toàn ở compile-time.

</details>

**6. Nếu muốn hai kiểu cùng shape nhưng không được gán lẫn nhau (ví dụ `UserId` và `OrderId` cùng là `string`), bạn làm cách nào? Gợi ý: branded type.**

<details className="qa">
<summary>Xem đáp án</summary>

Vì TS là structural, `type UserId = string` và `type OrderId = string` là **cùng một kiểu** — hoán đổi thoải mái, rất dễ truyền nhầm id. Giải pháp là **branded type** (còn gọi nominal typing giả lập): gắn thêm một property "ảo" chỉ tồn tại ở tầng type để hai kiểu khác shape nhau.

```ts
type Brand<T, B> = T & { readonly __brand: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

const asUserId = (s: string) => s as UserId;

function getUser(id: UserId) { /* ... */ }

const uid = asUserId("u_1");
getUser(uid);            // OK
getUser("u_1");          // Error: string không phải UserId
getUser("o_9" as OrderId); // Error: OrderId không phải UserId
```

Ở runtime `uid` vẫn chỉ là một string bình thường — `__brand` bị xoá sạch khi compile, không tốn gì cả. Cách dùng chuẩn là đưa việc "đóng dấu" vào một hàm factory có validate, để mọi giá trị mang brand đều đã được kiểm tra thật sự.

</details>

**7. Excess property check là gì? Vì sao gán trực tiếp một object literal dư property thì lỗi, nhưng gán qua biến trung gian lại không?**

<details className="qa">
<summary>Xem đáp án</summary>

**Excess property check** là một kiểm tra thêm mà TS chỉ áp dụng cho **object literal gán trực tiếp** vào một vị trí có kiểu xác định: nếu literal có property không nằm trong type đích thì báo lỗi.

```ts
interface Point { x: number; y: number; }

const p1: Point = { x: 1, y: 2, z: 3 };
// Error: Object literal may only specify known properties, 'z' does not exist

const tmp = { x: 1, y: 2, z: 3 };
const p2: Point = tmp; // OK — không còn là object literal trực tiếp
```

Vì sao có sự khác nhau? Theo luật structural thuần tuý thì "thừa property vẫn tương thích", nên trường hợp thứ hai hợp lệ. Nhưng với object literal viết tại chỗ, property thừa gần như luôn là **lỗi gõ nhầm tên** (`colour` thay vì `color`) hoặc hiểu sai API — không ai cố ý tạo ra một property rồi vứt đi ngay. Vì vậy TS cố tình nghiêm khắc hơn ở đúng tình huống đó.

Muốn cho phép property thừa một cách có chủ đích: gán qua biến trung gian, dùng `as`, hoặc khai báo index signature trong type.

</details>

**8. `as` (type assertion) làm gì tại runtime? Vì sao nói `as` chỉ "nói dối" compiler chứ không hề chuyển đổi giá trị?**

<details className="qa">
<summary>Xem đáp án</summary>

Tại runtime, `as` **không làm gì cả** — nó bị xoá hoàn toàn khi compile, giống mọi thông tin type khác. Nó không ép kiểu, không parse, không validate, không tạo object mới.

`as` chỉ là một lời khẳng định gửi tới compiler: *"tin tôi đi, giá trị này có kiểu X"*. Compiler chấp nhận và ngừng kiểm tra, còn giá trị thật thì vẫn nguyên như cũ.

```ts
const n = "123" as unknown as number;
console.log(typeof n); // "string" — vẫn là chuỗi!
console.log(n.toFixed(2)); // runtime: n.toFixed is not a function
```

So sánh cho rõ:

- **`as`** — thao tác compile-time, zero code sinh ra, không an toàn.
- **`Number("123")`, `String(x)`, `JSON.parse`** — hàm JavaScript thật, thực sự chuyển đổi giá trị lúc chạy.

Đúng như cảnh báo trong bài: dùng `as` để "cho qua" lỗi đỏ là tự tay tháo lưới an toàn. Khi chưa chắc về dữ liệu, hãy dùng `unknown` rồi narrow bằng type guard, thay vì `as` bừa.

</details>

**9. Đoạn `const u = JSON.parse(res) as User; u.name.toUpperCase();` pass compile — vì sao vẫn có thể crash ở production?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `as User` **không kiểm tra gì cả**. `JSON.parse` trả về `any`, còn `as User` chỉ nói với compiler rằng "coi giá trị này là `User`". Sau khi compile, dòng đó chỉ còn `const u = JSON.parse(res);` — không có một phép kiểm tra nào lọt vào file `.js`.

Nên chỉ cần thực tế khác kỳ vọng là crash:

```ts
// res = '{"id": 1}'         → u.name là undefined
// res = '{"name": 123}'     → u.name là number
u.name.toUpperCase();
// TypeError: Cannot read properties of undefined (reading 'toUpperCase')
```

Compiler tin bạn, còn server thì không. Backend đổi field, API trả lỗi dạng khác, dữ liệu cũ trong `localStorage`... đều làm giả định vỡ.

Cách viết đúng: coi kết quả parse là `unknown` rồi validate trước khi dùng — bằng type guard tự viết, hoặc schema của Zod/io-ts. Khi đó nhánh dữ liệu sai được xử lý tử tế thay vì nổ giữa production.

</details>

**10. Những vị trí nào trong hệ thống bắt buộc phải validate runtime dù đã dùng TypeScript?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc chung: **mọi biên của hệ thống** — tức mọi nơi dữ liệu đi từ ngoài vào mà compiler không nhìn thấy được.

Danh sách các vị trí thường gặp:

- **API response** — `fetch`, `axios`, GraphQL: backend có thể đổi schema bất cứ lúc nào.
- **Request body ở server** — dữ liệu client gửi lên; đây vừa là vấn đề đúng đắn vừa là vấn đề bảo mật.
- **Query param, route param, form input** — bản chất luôn là string, có thể thiếu hoặc bị sửa tay.
- **`localStorage` / `sessionStorage` / cookie** — dữ liệu cũ từ phiên bản trước của app vẫn còn nằm đó.
- **Biến môi trường và file config** — `process.env.X` thực chất là `string | undefined`.
- **Kết quả đọc file, message từ queue/WebSocket, webhook bên thứ ba.**
- **Dữ liệu qua ranh giới thư viện JS thuần** — nơi type chỉ đến từ `.d.ts`, không có gì đảm bảo.

Bên trong biên đó, khi dữ liệu đã được validate, có thể yên tâm dựa vào type. Khẩu hiệu dễ nhớ: *parse, don't validate* — chuyển dữ liệu `unknown` thành type đã được xác thực ngay tại cửa vào.

</details>

**11. TypeScript cần build step, JavaScript thì không — điều đó ảnh hưởng thế nào tới workflow phát triển và deploy?**

<details className="qa">
<summary>Xem đáp án</summary>

**Chi phí thêm vào:**

- Cần cấu hình `tsconfig.json` và một công cụ build (`tsc`, `esbuild`, `swc`, hoặc bundler).
- Vòng lặp sửa–chạy dài hơn; dự án lớn có thể mất vài chục giây để check kiểu toàn bộ.
- Debug trên production cần **source map** để ánh xạ ngược từ `.js` về `.ts`.
- CI phải có thêm bước type-check, và artifact deploy là file `.js` đã build chứ không phải source.

**Cách giảm đau trong thực tế:**

- Dùng watch mode (`tsc --watch`) hoặc dev server hot-reload để không phải build tay.
- Tách hai việc: `esbuild`/`swc` strip type cực nhanh cho bước chạy, còn `tsc --noEmit` chạy song song/trong CI để check kiểu.
- Node phiên bản mới và các runtime như Deno/Bun chạy thẳng file `.ts` (strip type), giúp khâu dev gần như không khác JS.

Đổi lại, bước build này chính là chỗ bắt lỗi trước khi lên production — với dự án dài hạn thì đó là khoản đầu tư có lãi.

</details>

**12. So sánh khả năng refactor và IntelliSense giữa hai ngôn ngữ. Vì sao type giúp IDE gợi ý chính xác hơn?**

<details className="qa">
<summary>Xem đáp án</summary>

Với **JavaScript**, IDE phải **đoán**: nó suy luận hạn chế từ code, gợi ý dựa trên các tên đã từng xuất hiện trong dự án, nên danh sách autocomplete thường dài và nhiễu. Đổi tên một method chỉ là tìm–thay chuỗi, dễ sót chỗ hoặc sửa nhầm thứ trùng tên.

Với **TypeScript**, IDE dùng chính **language service của compiler** — nó biết chắc biến này là `User`, nên chỉ gợi ý đúng property của `User`, kèm kiểu và JSDoc.

| | JavaScript | TypeScript |
|---|---|---|
| Autocomplete | Đoán theo heuristic, nhiều nhiễu | Chính xác theo type |
| Rename symbol | Tìm–thay theo chuỗi, dễ sai | Đổi đúng mọi tham chiếu thật |
| Go to definition | Thường không chắc chắn | Chính xác |
| Đổi chữ ký hàm | Phải tự tìm mọi nơi gọi | Compiler liệt kê hết chỗ vỡ |

Lợi ích lớn nhất là **refactor không sợ**: xoá một field trong interface, chạy `tsc`, mọi chỗ bị ảnh hưởng hiện ra thành danh sách lỗi cần sửa. Trong JS, những chỗ đó âm thầm trở thành `undefined` và chỉ lộ ra khi người dùng gặp lỗi.

</details>

**13. Trường hợp nào bạn sẽ chọn JavaScript thuần thay vì TypeScript? Nêu tiêu chí cụ thể chứ không nói chung chung.**

<details className="qa">
<summary>Xem đáp án</summary>

Tiêu chí thiên về JavaScript thuần:

- **Quy mô nhỏ**: script một file, vài chục tới vài trăm dòng, dùng một lần rồi bỏ (script build, tool tự động hoá cá nhân).
- **Vòng đời ngắn**: prototype demo concept, code thử nghiệm sẽ vứt sau buổi họp — chi phí khai báo type không kịp hoàn vốn.
- **Một người làm, không bàn giao**: không có nhu cầu dùng type như tài liệu giao tiếp giữa các thành viên.
- **Cần chạy ngay không build**: snippet dán vào console trình duyệt, code inline trong HTML, tool CLI muốn chạy thẳng.
- **Người học JS lần đầu**: nên nắm vững JS trước, tránh phải học hai thứ cùng lúc.
- **Team chưa có ai biết TS và deadline rất gấp**: chi phí học và cấu hình có thể lớn hơn lợi ích trong ngắn hạn.

Ngược lại, khi dự án cỡ vài nghìn dòng trở lên, nhiều người cùng làm, hoặc phải maintain lâu dài, thì TypeScript gần như luôn đáng giá. Một lựa chọn trung dung: viết JS nhưng thêm JSDoc và bật `checkJs` để có type-check mà chưa cần build step.

</details>

**14. TypeScript có làm code chạy nhanh hơn JavaScript không? Giải thích vì sao.**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Sau khi compile, type bị xoá sạch và thứ chạy là JavaScript — engine không hề biết code đó từng được viết bằng TS. Cùng một thuật toán thì tốc độ như nhau.

Cần tách bạch hai thứ:

- **Tốc độ thực thi**: không đổi. TS không thêm tối ưu runtime nào.
- **Tốc độ build**: chậm hơn, vì có thêm bước check kiểu.

Tuy nhiên có vài ảnh hưởng **gián tiếp** đáng nói:

- Type khuyến khích viết code với shape object ổn định, kiểu nhất quán — đúng thứ mà JIT của V8 thích, nên đôi khi code TS vô tình "engine-friendly" hơn.
- Một số cấu hình build có thể làm **chậm hoặc nặng hơn**: đặt `target` quá thấp khiến compiler hạ cấp cú pháp hiện đại thành code dài dòng hơn; `enum` thường sinh thêm object ở runtime.

Lợi ích thật của TypeScript nằm ở **tốc độ và sự an toàn của quá trình phát triển** — ít bug, refactor nhanh, onboard dễ — chứ không phải ở hiệu năng lúc chạy.

</details>

---

## 3. Cài đặt và chạy TypeScript

Bài học: [3. Cài đặt và chạy TypeScript](../../typescript/01-gioi-thieu/3_cai-dat-cau-hinh.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao nên cài TypeScript local bằng `--save-dev` thay vì cài global? Nêu ít nhất hai lý do liên quan tới CI/CD.**

<details className="qa">
<summary>Xem đáp án</summary>

Cài local (`npm install --save-dev typescript`) đưa TypeScript thành một dependency của chính project, thay vì một công cụ nằm ngoài tầm kiểm soát trên máy từng người.

Các lý do chính:

- **Reproducible build**: version TS được ghi trong `package.json` và khoá trong `package-lock.json`, nên máy dev, máy đồng nghiệp và runner CI đều dùng đúng một phiên bản. Bản global mỗi máy một version dễ gây cảnh "trên máy tôi build được".
- **CI không phụ thuộc máy chủ**: runner chỉ cần `npm ci` là có sẵn compiler đúng version, không phải cài global thêm bước nào.
- **Mỗi project một version**: dự án cũ giữ TS 4.x, dự án mới dùng 5.x mà không xung đột.
- **Nâng cấp có kiểm soát**: TS mỗi bản minor đều có thể siết thêm luật type; nâng version qua PR thì thấy rõ diff và test được, còn global nâng lặng lẽ thì build vỡ bất ngờ.

Đúng như bài nhấn mạnh: phiên bản trong `package-lock.json` mới là phiên bản thật sự build production.

</details>

**2. `npx tsc` và `tsc` khác nhau thế nào khi project đã cài TypeScript local?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`npx tsc`** ưu tiên tìm binary trong `node_modules/.bin` của project trước. Nếu đã cài local thì nó chạy **đúng phiên bản của project**. Không có mới tải tạm bản mới nhất từ registry về chạy.
- **`tsc`** gõ trực tiếp trong terminal sẽ được resolve theo `PATH` của hệ thống, tức là **bản cài global** — có thể là một version hoàn toàn khác, hoặc báo `command not found` nếu chưa cài global.

Hệ quả thực tế: cùng một codebase, `tsc` global có thể báo lỗi khác hẳn `npx tsc` chỉ vì lệch version.

Cách làm chuẩn trong dự án là khai báo script trong `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  }
}
```

Khi chạy qua `npm run build`, npm tự thêm `node_modules/.bin` vào `PATH`, nên `tsc` ở đây chính là bản local — không cần gõ `npx`, và cả team dùng chung một lệnh.

</details>

**3. Chạy `tsc hello.ts` và chạy `tsc` không tham số khác nhau ra sao? Khi truyền thẳng tên file, `tsconfig.json` có được đọc không?**

<details className="qa">
<summary>Xem đáp án</summary>

| Lệnh | Hành vi |
|---|---|
| `tsc` (không tham số) | Tìm `tsconfig.json` từ thư mục hiện tại đi lên, biên dịch **toàn bộ project** theo đúng cấu hình trong đó |
| `tsc hello.ts` | Chỉ biên dịch file được chỉ định (cùng các file nó import), và **bỏ qua hoàn toàn `tsconfig.json`** |

Đây là điểm rất hay gây bối rối: khi truyền tên file, `tsc` dùng **option mặc định** chứ không phải cấu hình dự án — nên `strict` không bật, `target`/`module`/`outDir` đều là mặc định. Kết quả là output đặt sai chỗ, hoặc code đang lỗi `strict` bỗng "compile sạch".

Muốn vừa dùng config vừa chỉ định file, dùng `--project`:

```bash
npx tsc                       # cả project theo tsconfig.json
npx tsc --project tsconfig.build.json
npx tsc hello.ts              # một file, KHÔNG đọc tsconfig.json
```

Quy tắc dễ nhớ: truyền file vào là tự tách khỏi cấu hình dự án — chỉ nên dùng khi thử nghiệm nhanh một file rời.

</details>

**4. `tsc --init` sinh ra cái gì? `tsc --watch` giải quyết vấn đề gì trong vòng lặp phát triển hằng ngày?**

<details className="qa">
<summary>Xem đáp án</summary>

**`tsc --init`** tạo ra file **`tsconfig.json`** ở thư mục hiện tại — file cấu hình trung tâm cho cả project. File sinh ra có sẵn một số option được bật (như `strict`, `target`, `module`, `esModuleInterop`) cùng rất nhiều option khác được liệt kê dạng comment kèm mô tả, để bạn bật dần khi cần. Sự tồn tại của file này cũng chính là dấu hiệu để `tsc`, IDE và các công cụ khác biết đâu là gốc của project.

**`tsc --watch`** (viết tắt `-w`) giữ compiler chạy nền, theo dõi file và **tự biên dịch lại phần thay đổi** ngay khi bạn lưu. Nó giải quyết hai phiền toái:

- Không phải gõ lại lệnh build sau mỗi lần sửa.
- Nhanh hơn nhiều so với build lại từ đầu, vì chỉ xử lý những gì đổi, nên lỗi kiểu hiện ra gần như tức thì.

Trong thực tế, watch mode thường được dùng cho vòng lặp dev (song song với dev server), còn build một lần thì dành cho CI và bước deploy.

</details>

**5. `tsc --noEmit` dùng để làm gì, và thường được đặt ở bước nào trong pipeline CI hoặc pre-commit?**

<details className="qa">
<summary>Xem đáp án</summary>

`tsc --noEmit` yêu cầu compiler **chỉ type-check mà không sinh ra file `.js` nào**. Nó tách riêng hai việc mà `tsc` vốn làm cùng lúc: kiểm tra kiểu và emit output.

Dùng khi nào:

- Dự án **build bằng công cụ khác** (esbuild, swc, Vite, Next.js, Babel) — những công cụ này chỉ strip type, không check kiểu, nên cần `tsc --noEmit` đảm nhiệm phần kiểm tra.
- Muốn một lệnh "kiểm tra sức khoẻ" nhanh mà không làm bẩn thư mục bằng file build.

Vị trí trong pipeline:

```json
{ "scripts": { "typecheck": "tsc --noEmit" } }
```

- **Pre-commit / pre-push hook** (qua husky, lint-staged): chặn sớm, nhưng lưu ý type-check đúng nghĩa phải chạy cả project nên có thể hơi chậm cho hook.
- **CI**: chạy `npm run typecheck` như một job bắt buộc, song song với lint và test, và **phải pass mới được merge**. Đây là chốt chặn quan trọng nhất.

</details>

**6. `ts-node` hoạt động ra sao? Vì sao nó không thay thế được `tsc` khi build production?**

<details className="qa">
<summary>Xem đáp án</summary>

`ts-node` móc vào cơ chế nạp module của Node: khi Node gặp file `.ts`, `ts-node` **biên dịch nó trong bộ nhớ** bằng chính TypeScript compiler rồi đưa JS kết quả cho Node chạy. Nhờ vậy bạn gõ `npx ts-node hello.ts` là chạy ngay, không cần bước build, và có cả REPL tương tác.

Vì sao không dùng cho production:

- **Chậm và tốn RAM**: mỗi lần khởi động phải compile lại toàn bộ, làm cold start của server dài ra một cách vô ích.
- **Compiler thành dependency runtime**: production phải cài kèm TypeScript, image nặng hơn và bề mặt rủi ro lớn hơn.
- **Lỗi lộ muộn**: nếu bật `transpileOnly` (hoặc dùng swc mode cho nhanh) thì nó bỏ qua type-check; lỗi kiểu chỉ phát hiện khi module đó thực sự được nạp, thay vì phát hiện toàn bộ ngay lúc build.

Cách đúng khi deploy: build trước bằng `tsc` (hoặc bundler), rồi chạy `node dist/index.js` thuần. `ts-node` chỉ nên dùng cho dev script, test và REPL.

</details>

**7. `tsx` khác `ts-node` ở điểm nào và vì sao nhanh hơn đáng kể? Gợi ý: esbuild.**

<details className="qa">
<summary>Xem đáp án</summary>

`tsx` là bản thay thế drop-in cho `ts-node`: cách dùng gần như y hệt (`npx tsx hello.ts`), nhưng bên dưới dùng **esbuild** thay vì TypeScript compiler.

Vì sao nhanh hơn nhiều:

- **esbuild viết bằng Go**, biên dịch sẵn ra mã máy và chạy song song đa luồng, trong khi `tsc` là JavaScript chạy trên một luồng.
- Quan trọng hơn: esbuild **chỉ strip type annotation**, hoàn toàn **không type-check**. Bỏ qua bước phân tích kiểu — phần tốn thời gian nhất — nên nhanh hơn nhiều bậc.

| | ts-node | tsx |
|---|---|---|
| Nhân xử lý | TypeScript compiler | esbuild (Go) |
| Type-check | Có (trừ khi bật `transpileOnly`) | Không bao giờ |
| Tốc độ khởi động | Chậm | Rất nhanh |
| ESM/CJS | Cần cấu hình thêm | Xử lý sẵn khá mượt |

Đánh đổi rất rõ: `tsx` đổi type-check lấy tốc độ. Vì vậy dùng `tsx` để chạy lúc dev, và giữ `tsc --noEmit` ở CI làm chốt kiểm tra kiểu.

</details>

**8. Deno, Bun và Node với `--experimental-strip-types` đều "chạy TS trực tiếp" — chúng có type-check không? Hệ quả thực tế là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi **chạy**, cả ba đều **không type-check**. Chúng chỉ **strip type** — xoá `: string`, `interface`, generic... rồi thực thi phần JavaScript còn lại. (Deno có lệnh `deno check` riêng để type-check, nhưng đó là bước tách biệt, không nằm trong lúc chạy.)

Hệ quả thực tế:

- File đầy lỗi kiểu vẫn **chạy bình thường** cho tới khi gặp lỗi thật ở runtime. Việc "chạy được" không còn là bằng chứng code type-safe nữa.
- Lỗi kiểu chỉ bị bắt ở chỗ khác — IDE hoặc bước `tsc --noEmit` trong CI. Nếu dự án bỏ bước đó, TypeScript gần như chỉ còn là chú thích cho vui.
- Vài cú pháp TS cần sinh thêm code ở runtime (như `enum`, decorator kiểu cũ, `namespace`) có thể không được hỗ trợ ở chế độ strip thuần, nên nên tránh dùng.

Kết luận đúng như bài: tách hai việc — dùng runtime nhanh (tsx/Bun/Deno) để chạy khi dev, và `tsc --noEmit` trong CI/pre-commit để đảm bảo type-safe.

</details>

**9. "Strip type" khác "compile kèm type-check" ở chỗ nào? Vì sao một file có lỗi kiểu vẫn chạy được bằng `tsx` hoặc Bun?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Strip type**: chỉ làm biến đổi cú pháp — xoá annotation, `interface`, generic, rồi xuất JS. Công cụ xử lý **từng file độc lập**, không cần biết các file khác, nên cực nhanh. Nó không hề "hiểu" hệ thống kiểu.
- **Compile kèm type-check** (`tsc`): dựng đồ thị toàn bộ chương trình, phân giải mọi import, suy luận và đối chiếu kiểu giữa các file, báo lỗi rồi mới emit. Chậm hơn nhiều vì phải nhìn bức tranh toàn cục.

Vì sao file lỗi kiểu vẫn chạy được:

```ts
const n: number = "hello"; // tsc: error TS2322
console.log(n.toUpperCase());
```

Sau khi `tsx`/Bun strip type, thứ còn lại là `const n = "hello"; console.log(n.toUpperCase());` — JavaScript hoàn toàn hợp lệ, in ra `HELLO`. Type annotation vốn không bao giờ tồn tại ở runtime, nên "sai kiểu" không phải lỗi cú pháp JS. Chỉ có `tsc` mới phát hiện được điều đó — và đó chính là lý do bước `tsc --noEmit` không thể bỏ.

</details>

**10. Mô tả workflow chuẩn khi vừa muốn chạy nhanh lúc dev, vừa đảm bảo type-safe trước khi merge.**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: **tách bạch việc chạy và việc kiểm tra kiểu**, đúng như sơ đồ workflow trong bài.

Lúc phát triển:

- Chạy code bằng runtime nhanh: `tsx watch src/index.ts`, Bun hoặc dev server của framework — khởi động gần như tức thì.
- Type-check diễn ra liên tục trong **IDE** (VS Code dùng chính TS language service), nên lỗi kiểu vẫn báo đỏ ngay khi gõ.
- Muốn chắc hơn nữa thì mở thêm một terminal chạy `tsc --noEmit --watch`.

Trước khi commit và merge:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "typecheck": "tsc --noEmit",
    "build": "tsc -p tsconfig.build.json"
  }
}
```

- **Pre-commit hook**: lint + format cho file đã stage (nhanh).
- **CI bắt buộc pass**: `npm run typecheck`, lint, test — chạy song song, fail là chặn merge.
- **Bước build/deploy**: dùng `tsc` hoặc bundler sinh ra `dist/`, rồi production chạy `node dist/index.js` thuần.

Cách này giữ được tốc độ khi dev mà không hy sinh độ an toàn khi lên nhánh chính.

</details>

**11. Vì sao phiên bản TypeScript ghi trong `package-lock.json` mới là phiên bản "thật sự" build production?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `package.json` thường chỉ ghi một **dải version** như `"typescript": "^5.4.0"` — dải đó khớp với 5.4.2, 5.5.0, 5.6.0... Còn `package-lock.json` ghi **đúng một version cụ thể** kèm hash, và đó mới là thứ được cài thật.

Trên CI, `npm ci` cài **chính xác theo lock file** (chứ không giải lại dải version như `npm install`). Nghĩa là compiler chạy trong pipeline build production chính là bản trong lock, không phải bản mới nhất khớp dải, và càng không phải bản `tsc` global trên máy ai đó.

Điều này quan trọng vì TypeScript **không theo semver theo nghĩa thông thường**: mỗi bản minor có thể bổ sung luật kiểm tra chặt hơn hoặc sửa lỗi suy luận kiểu, khiến code đang compile sạch bỗng báo lỗi. Nếu không khoá version, một bản TS mới phát hành có thể làm đỏ CI dù không ai đụng vào code.

Vì vậy: commit lock file, nâng TypeScript qua PR riêng để review và test được, đừng cài global rồi tưởng đó là version dự án đang dùng.

</details>

**12. Team dùng Babel hoặc esbuild để build còn `tsc` chỉ chạy `--noEmit` — rủi ro nào cần lưu ý với cấu hình này?**

<details className="qa">
<summary>Xem đáp án</summary>

Cấu hình này rất phổ biến và hợp lý (build nhanh, check kiểu riêng), nhưng có vài rủi ro:

- **Hai công cụ, hai bộ quy tắc**: Babel/esbuild transpile **từng file độc lập**, không nhìn thấy các file khác. Vì vậy một số tính năng TS không hoạt động đúng — `const enum`, `namespace` kiểu cũ, `export =`. Nên bật `isolatedModules: true` để `tsc` cảnh báo trước những chỗ transpiler đơn file không xử lý nổi.
- **Import chỉ chứa type**: khi transpile theo từng file, công cụ không biết một import là type hay value. Dùng `import type { X }` (và bật `verbatimModuleSyntax`) để tránh import thừa hoặc bị xoá nhầm.
- **Cấu hình dễ lệch nhau**: `target`, `paths` alias, `jsx`, decorator phải khai báo ở cả hai nơi; lệch là output khác với thứ `tsc` giả định khi check.
- **Decorator và `emitDecoratorMetadata`**: esbuild không hỗ trợ đầy đủ, ảnh hưởng trực tiếp tới NestJS, TypeORM.
- **Nếu quên chạy `tsc --noEmit` trong CI** thì thực tế không còn ai check kiểu — build vẫn xanh trong khi code đầy lỗi type.

</details>

**13. Bạn dùng TypeScript Playground để debug type như thế nào? Kể một tình huống cụ thể nó giúp bạn hiểu lỗi.**

<details className="qa">
<summary>Xem đáp án</summary>

Playground (typescriptlang.org/play) là môi trường TS đầy đủ chạy trong trình duyệt. Cách dùng để debug:

- Dán đoạn code gây lỗi vào, **hover** vào từng biến để xem TS thực sự infer ra kiểu gì — thường lỗi đến từ chỗ inference khác với tưởng tượng.
- Xem tab **JS** để biết output biên dịch, và tab **Errors** để đọc lỗi đầy đủ.
- Đổi **compiler options** ngay trong giao diện (bật/tắt `strict`, `strictNullChecks`) để xác định lỗi đến từ flag nào.
- **Đổi version TS** để kiểm chứng xem lỗi có phải do nâng cấp compiler.
- Chia sẻ link cho đồng nghiệp — cả đoạn code và config đều nằm trong URL.

Tình huống cụ thể hay gặp: một mảng khai báo `const arr = []` rồi `push` vào, TS lại báo lỗi lạ. Hover trên Playground sẽ thấy `arr` được infer là `never[]` — từ đó hiểu ngay phải viết `const arr: string[] = []`. Tương tự, hover vào một generic hay conditional type phức tạp sẽ cho thấy kiểu đã được "giải" thành gì, nhanh hơn nhiều so với đoán mò.

</details>

**14. Cùng một đoạn code, chạy `tsx file.ts` thì OK nhưng `tsc --noEmit` lại báo lỗi — hãy giải thích vì sao và nên tin bên nào.**

<details className="qa">
<summary>Xem đáp án</summary>

Vì hai công cụ làm hai việc khác hẳn nhau:

- **`tsx`** dùng esbuild để **strip type** rồi chạy. Nó không hề kiểm tra kiểu, nên lỗi type không tồn tại dưới góc nhìn của nó. Chỉ khi code sai **cú pháp** hoặc sai logic lúc chạy thì mới nổ.
- **`tsc --noEmit`** phân tích toàn bộ chương trình, đối chiếu kiểu giữa các file, và báo mọi vi phạm.

```ts
const n: number = "hello"; // tsx: chạy ngon lành
console.log(n);            // tsc --noEmit: error TS2322
```

**Nên tin `tsc`.** Nó là nguồn chân lý duy nhất về tính đúng đắn kiểu; "chạy được" chỉ chứng minh đoạn code đó chưa đi vào nhánh gây lỗi, không chứng minh code an toàn. Một sai kiểu lọt qua hôm nay có thể thành `TypeError` trên production ngày mai khi dữ liệu khác đi.

Cần lưu ý thêm một khả năng: nếu `tsx` và `tsc` đọc cấu hình khác nhau (khác `tsconfig`, khác `paths`, khác `lib`/`types`) thì kết quả cũng lệch — nên kiểm tra xem cả hai có cùng dùng một `tsconfig.json` không.

</details>

---

## 4. tsconfig.json và Compiler Options

Bài học: [4. tsconfig.json và Compiler Options](../../typescript/01-gioi-thieu/4_compiler-options.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `tsconfig.json` dùng để làm gì? Kể các nhóm thông tin chính mà nó khai báo cho compiler.**

<details className="qa">
<summary>Xem đáp án</summary>

`tsconfig.json` là file cấu hình đặt ở **gốc project**, cho `tsc` biết phải biên dịch những file nào và theo quy tắc gì. Sự tồn tại của nó cũng đánh dấu đâu là gốc project — nhờ vậy chỉ cần gõ `tsc` không tham số là compile cả dự án, và IDE cũng đọc chính file này để báo lỗi giống hệt compiler.

Các nhóm thông tin chính:

- **Phạm vi file**: `include`, `exclude`, `files` — compile những file nào.
- **Độ nghiêm ngặt kiểm tra kiểu**: `strict` cùng các flag con, và các flag "siêu strict" bật thêm.
- **Định dạng output**: `target` (phiên bản JS), `module` (hệ module), `moduleResolution` (cách tìm file khi `import`).
- **Vị trí file**: `rootDir` (nguồn), `outDir` (đích), cùng `paths`/`baseUrl` cho alias import.
- **Sản phẩm phụ**: `declaration` (`.d.ts`), `sourceMap`, hoặc `noEmit` khi chỉ muốn type-check.

Ngoài ra còn `extends` để kế thừa preset và `references` cho monorepo.

</details>

**2. `include`, `exclude` và `files` khác nhau thế nào? Nếu khai báo cả ba thì cái nào có ưu tiên cao hơn?**

<details className="qa">
<summary>Xem đáp án</summary>

| Option | Ý nghĩa |
|---|---|
| `files` | Danh sách **đường dẫn cụ thể**, liệt kê tay từng file. Không dùng glob |
| `include` | Danh sách **glob pattern**, ví dụ `["src/**/*"]` |
| `exclude` | Glob để **loại bớt** khỏi kết quả của `include` |

Quy tắc ưu tiên cần nhớ:

- `exclude` **chỉ lọc những gì `include` gom vào**, nó không loại được file đã liệt kê trong `files`.
- Nếu không khai báo `files` lẫn `include`, mặc định compiler lấy **mọi file `.ts`/`.tsx`** dưới thư mục chứa config.
- `exclude` mặc định là `node_modules`, `bower_components`, `jspm_packages` và thư mục `outDir`.

Một điểm rất hay nhầm: **`exclude` không đảm bảo file bị bỏ qua hoàn toàn**. Nếu một file nằm ngoài `include` nhưng lại được `import` từ file trong `include`, nó vẫn được kéo vào chương trình và vẫn bị type-check. Muốn thật sự loại trừ thì phải cắt luôn đường import tới nó.

</details>

**3. `target` ảnh hưởng gì tới file JavaScript sinh ra? Đặt `target: ES5` so với `target: ES2022` khác nhau ra sao khi code có `async/await`?**

<details className="qa">
<summary>Xem đáp án</summary>

`target` quyết định **phiên bản cú pháp JavaScript của file output**. Cú pháp nào môi trường đích chưa hỗ trợ sẽ bị compiler hạ cấp (downlevel) thành code tương đương. Nó cũng kéo theo `lib` mặc định — tức những API mà TS coi là có sẵn.

Với `async/await`:

- **`target: ES2017` trở lên (gồm ES2022)**: `async/await` được giữ **nguyên xi**, vì môi trường đích đã hỗ trợ natively. Output gọn, dễ đọc, dễ debug.
- **`target: ES5`**: không có `async/await` lẫn generator, nên compiler phải biến mỗi hàm `async` thành một **state machine** dùng helper `__awaiter`/`__generator` do TS sinh ra. Code output dài hơn nhiều, khó đọc, bundle nặng hơn. Ngoài ra ES5 không có `Promise`, nên phải tự thêm polyfill và khai báo `lib` phù hợp, nếu không sẽ lỗi.

Lời khuyên thực dụng: chọn `target` theo môi trường thật sự deploy. Năm 2026, `ES2022` là mặc định hợp lý cho cả Node hiện đại lẫn trình duyệt evergreen; `ES5` chỉ còn cần khi buộc phải hỗ trợ trình duyệt rất cũ.

</details>

**4. `module` và `moduleResolution` khác nhau ở điểm nào? Vì sao cặp `module: ESNext` đi với `moduleResolution: Node10` là cấu hình sai phổ biến?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`module`** — định dạng module của **output**: `import/export` sẽ được giữ nguyên (`ESNext`) hay dịch thành `require`/`exports` (`CommonJS`).
- **`moduleResolution`** — thuật toán compiler dùng để **tìm file** khi gặp `import "abc"`: tra ở đâu, thử những đuôi nào, đọc trường nào trong `package.json`.

Nói ngắn: `module` là "xuất ra kiểu gì", `moduleResolution` là "tìm vào bằng cách nào". Hai việc độc lập nhưng phải khớp nhau.

Vì sao `ESNext` + `Node10` thường sai: `Node10` (trước đây gọi là `Node`) mô phỏng cách resolve **CommonJS đời cũ** — nó chỉ biết `main`, `types`, và không hiểu trường **`exports`** trong `package.json`. Trong khi đó, phần lớn package hiện đại công bố entry point và type **chỉ qua `exports`**. Kết quả là compiler báo không tìm thấy module hoặc không tìm thấy khai báo type, dù package cài hoàn toàn bình thường và bundler chạy ngon lành.

Cấu hình đúng: `ESNext` đi với `Bundler` (khi có bundler) hoặc dùng cặp `NodeNext` + `NodeNext` cho Node thuần.

</details>

**5. Khi nào chọn `moduleResolution: Bundler`, khi nào chọn `NodeNext`? Với `NodeNext` thì đường dẫn `import` phải viết thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Chọn `Bundler`** khi có một bundler lo khâu resolve: Vite, webpack, Next.js, Remix, esbuild, Rollup. Chế độ này hiểu trường `exports` và cho phép viết import **không cần đuôi file** — đúng như thói quen quen thuộc ở frontend. Nó đi kèm `module: ESNext` (hoặc `Preserve`), và thường kèm `noEmit: true` vì bundler mới là nơi sinh output.

**Chọn `NodeNext`** khi code chạy thẳng trên Node, không qua bundler — điển hình là backend hoặc CLI tool. Nó mô phỏng chính xác cách Node phân giải module ngày nay, gồm cả việc phân biệt ESM và CommonJS theo trường `"type"` trong `package.json` và theo đuôi `.mts`/`.cts`.

Với `NodeNext` ở chế độ ESM, import tương đối **bắt buộc có đuôi file**, và phải viết là `.js` dù file nguồn là `.ts`:

```ts
import { helper } from "./utils.js";  // đúng, dù file thật là utils.ts
import { helper } from "./utils";     // lỗi: relative import needs extension
```

Lý do: đường dẫn này tồn tại nguyên vẹn trong output, và thứ Node thực sự nạp lúc chạy chính là `utils.js`.

</details>

**6. `esModuleInterop` giải quyết vấn đề gì giữa CommonJS và ES Modules? Tắt nó đi thì `import express from 'express'` gặp chuyện gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề gốc: CommonJS dùng `module.exports = fn` — export **một giá trị duy nhất**, không có khái niệm "default export". ES Modules thì phân biệt rạch ròi default và named export. Khi import một package CJS từ code ESM, hai mô hình này lệch nhau.

`esModuleInterop: true` bảo compiler sinh thêm helper (`__importDefault`, `__importStar`) để tạo ra một default export "tổng hợp" cho module CJS, khiến `import x from "cjs-module"` chạy đúng như kỳ vọng. Nó cũng tự bật `allowSyntheticDefaultImports` để type-check không kêu ca.

Tắt nó đi thì:

```ts
import express from "express";
// Error: Module '"express"' can only be default-imported using the 'esModuleInterop' flag
```

Phải viết thay bằng `import * as express from "express"` — cách này vừa xấu, vừa sai về mặt ngữ nghĩa ESM (namespace object lẽ ra không được gọi như hàm), và dễ vỡ khi đổi bundler.

Thực tế: hầu như luôn nên bật `esModuleInterop: true`; các preset `@tsconfig/*` và `tsc --init` đều bật sẵn.

</details>

**7. `skipLibCheck: true` bỏ qua việc kiểm tra gì? Đánh đổi giữa tốc độ build và độ an toàn ở đây là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`skipLibCheck: true` bảo compiler **bỏ qua việc type-check nội dung của mọi file `.d.ts`** — cả `@types/*` trong `node_modules` lẫn file declaration bạn tự viết.

Cần nhấn mạnh: nó **không** làm mất type. Compiler vẫn đọc các `.d.ts` đó để suy luận và vẫn kiểm tra code của bạn dùng thư viện có đúng hay không. Thứ bị bỏ qua chỉ là việc soi tính nhất quán **bên trong** các file declaration.

Đánh đổi:

- **Được**: build nhanh hơn rõ rệt ở dự án nhiều dependency, và tránh được cảnh CI đỏ vì hai package khai báo type xung đột nhau (ví dụ hai version `@types/react`) — lỗi nằm trong thư viện mà bạn không sửa được.
- **Mất**: những lỗi thật trong `.d.ts` của chính bạn sẽ không bị phát hiện, và xung đột type giữa các thư viện bị giấu đi thay vì lộ ra.

Thực tế đa số dự án app đều bật `true` (cả `tsc --init` cũng mặc định bật). Riêng khi bạn **viết thư viện và publish `.d.ts`** thì nên tắt, để chắc chắn file declaration mình phát hành là đúng.

</details>

**8. `strict: true` bật những flag con nào? Kể ít nhất năm flag và tác dụng của từng cái.**

<details className="qa">
<summary>Xem đáp án</summary>

`"strict": true` là một công tắc tổng, bật cùng lúc nhóm flag sau:

| Flag con | Tác dụng |
|---|---|
| `strictNullChecks` | `null` và `undefined` là kiểu riêng, không gán bừa vào kiểu khác |
| `noImplicitAny` | Báo lỗi khi compiler không suy ra được kiểu, thay vì ngầm gán `any` |
| `strictFunctionTypes` | Kiểm tra tham số hàm theo contravariance đúng chuẩn |
| `strictBindCallApply` | Check kiểu tham số khi dùng `.bind()`, `.call()`, `.apply()` |
| `strictPropertyInitialization` | Property của class phải được khởi tạo (cần `strictNullChecks`) |
| `alwaysStrict` | Parse ở strict mode và thêm `"use strict"` vào output |
| `useUnknownInCatchVariables` | Biến trong `catch (e)` mang kiểu `unknown` thay vì `any` |

Hai điểm đáng nhớ khi phỏng vấn:

- Có thể bật `strict: true` rồi **tắt riêng** một flag (ví dụ `"strictPropertyInitialization": false`) — hữu ích khi migrate dần.
- `strict` **chưa phải mức cao nhất**: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch` nằm ngoài nhóm này và phải bật thủ công.

</details>

**9. `strictNullChecks` thay đổi hành vi type system ra sao? Tắt nó thì `let s: string = null;` có báo lỗi không, và vì sao điều đó nguy hiểm?**

<details className="qa">
<summary>Xem đáp án</summary>

**Tắt `strictNullChecks`**: `null` và `undefined` được coi là thành viên của **mọi kiểu**. Nên `let s: string = null;` **không báo lỗi gì cả** — compiler xem đó là hợp lệ.

**Bật `strictNullChecks`**: `null` và `undefined` trở thành hai kiểu riêng biệt, chỉ gán được vào chỗ đã khai báo chấp nhận chúng.

```ts
let s: string = null;        // Error khi bật strictNullChecks
let t: string | null = null; // OK — khai báo rõ ràng

function f(x: string | null) {
  x.toUpperCase();           // Error: 'x' is possibly 'null'
  if (x) x.toUpperCase();    // OK — đã narrow
}
```

Vì sao tắt nó rất nguy hiểm: `null`/`undefined` chính là nguồn gốc của lỗi runtime phổ biến nhất trong JavaScript — *"Cannot read properties of undefined"*. Khi flag tắt, compiler mất hoàn toàn khả năng cảnh báo về lớp lỗi đó, và type annotation trở nên "lạc quan giả": khai báo `string` nhưng thực tế có thể là `null`. Đây cũng là flag **tốn công nhất khi migrate**, nhưng đổi lại giá trị lớn nhất, nên đáng làm.

</details>

**10. `noImplicitAny` khác `strictNullChecks` ở chỗ nào? Khi migrate một codebase JavaScript lớn, nên bật flag nào trước và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai flag trị hai bệnh khác nhau:

- **`noImplicitAny`** — chống việc **thiếu thông tin kiểu**. Khi compiler không suy ra được kiểu (tham số hàm chưa khai báo, biến từ code JS cũ), nó báo lỗi thay vì lặng lẽ gán `any`.
- **`strictNullChecks`** — chống việc **dùng giá trị có thể rỗng**. Nó buộc bạn xử lý `null`/`undefined` một cách tường minh.

**Nên bật `noImplicitAny` trước**, đúng như thứ tự bài đề xuất:

- Lỗi mà nó tạo ra mang tính **cục bộ**: mỗi lỗi sửa bằng cách thêm một annotation tại chỗ, không lan sang file khác.
- Số lượng lỗi thường ít hơn `strictNullChecks` rất nhiều, nên đội ngũ sớm thấy thành quả.
- Sau khi code đã có kiểu tường minh, việc bật `strictNullChecks` mới chính xác — nếu bật ngược lại, phân tích `null` diễn ra trên một rừng `any` nên gần như vô nghĩa.

`strictNullChecks` bật sau, làm theo từng module, vì nó thường kéo theo việc sửa cả cấu trúc dữ liệu và luồng xử lý. Các flag còn lại để sau cùng.

</details>

**11. `strictFunctionTypes` kiểm tra điều gì? Khái niệm contravariance của tham số hàm nghĩa là gì trong ngữ cảnh này?**

<details className="qa">
<summary>Xem đáp án</summary>

Không bật flag này, TypeScript so sánh tham số hàm theo kiểu **bivariant** — gán xuôi hay ngược đều cho qua, tiện nhưng không an toàn. `strictFunctionTypes` bắt compiler kiểm tra tham số theo **contravariance**, tức đúng chuẩn về mặt lý thuyết kiểu.

**Contravariance** ở đây nghĩa là: hàm `A` thay thế được cho hàm `B` khi tham số của `A` **rộng hơn hoặc bằng** tham số của `B`. Trực giác: ai xử lý được *mọi loài động vật* thì chắc chắn xử lý được *chó*; ngược lại thì không.

```ts
interface Animal { name: string }
interface Dog extends Animal { bark(): void }

type Handler<T> = (x: T) => void;

let animalH: Handler<Animal> = (a) => console.log(a.name);
let dogH: Handler<Dog> = (d) => d.bark();

dogH = animalH;  // OK — nhận Animal thì nhận được Dog
animalH = dogH;  // Error với strictFunctionTypes
// vì nếu cho phép, ai đó truyền Mèo vào animalH sẽ gọi trúng d.bark()
```

Lưu ý quan trọng hay bị hỏi thêm: flag này **chỉ áp dụng cho function type**, còn **method khai báo trong interface/class vẫn được so sánh bivariant** — TS cố ý giữ vậy để không phá vỡ các API sẵn có như mảng và DOM.

</details>

**12. `useUnknownInCatchVariables` đổi kiểu của biến trong `catch` thành gì, và vì sao đó là mặc định an toàn hơn?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó đổi kiểu của biến trong `catch (e)` từ `any` thành **`unknown`**.

Vì sao an toàn hơn: trong JavaScript, `throw` ném được **bất kỳ giá trị nào** — không chỉ `Error`, mà cả string, number, object bất kỳ, hay thậm chí `undefined`. Thư viện bên thứ ba và code cũ ném lung tung là chuyện thường. Giả định `e` luôn là `Error` là một giả định sai.

Với `any`, compiler cho bạn viết `e.message` thoải mái — và nếu lỗi ném ra là một string thì đó lại thành lỗi mới ngay trong khối `catch`, che mất lỗi gốc. Với `unknown`, compiler buộc bạn kiểm tra trước:

```ts
try {
  risky();
} catch (e) {
  if (e instanceof Error) {
    console.error(e.message);
  } else {
    console.error("Lỗi không rõ:", e);
  }
}
```

Mẫu xử lý này vừa an toàn vừa rõ ràng hơn hẳn. Flag nằm trong `strict`, và khi cần vẫn có thể khai báo tường minh `catch (e: any)` cho một chỗ cụ thể.

</details>

**13. Những flag "siêu strict" nào không nằm trong `strict` và phải bật thủ công? Mỗi flag bắt loại lỗi gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Bốn flag bài đã nêu, đều phải khai báo riêng trong `compilerOptions`:

- **`noUncheckedIndexedAccess`** — truy cập bằng index (`arr[i]`, `obj[key]`) trả về `T | undefined` thay vì `T`. Bắt lớp lỗi truy cập phần tử không tồn tại.
- **`exactOptionalPropertyTypes`** — phân biệt "property vắng mặt" với "property có giá trị `undefined`". Bắt lỗi gán `undefined` tường minh vào property optional.
- **`noImplicitOverride`** — buộc dùng từ khoá `override` khi ghi đè method của lớp cha. Bắt lỗi ghi đè nhầm, hoặc method cha bị đổi tên khiến bản "override" thành method mới vô dụng.
- **`noFallthroughCasesInSwitch`** — báo lỗi khi một `case` có code nhưng thiếu `break`/`return` rồi rơi xuống case sau. Bắt lỗi quên `break`.

Ngoài ra còn vài flag cùng nhóm hay được bật kèm: `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `verbatimModuleSyntax`.

Lời khuyên thực tế: project mới nên bật hết ngay từ đầu; project đang chạy thì bật từng cái một, vì mỗi flag có thể làm xuất hiện hàng trăm lỗi cần dọn.

</details>

**14. `noUncheckedIndexedAccess` biến biểu thức `arr[0]` thành kiểu gì? Vì sao nó rất hữu ích nhưng nhiều team vẫn tắt?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó biến `arr[0]` từ `T` thành **`T | undefined`**, phản ánh đúng sự thật là JavaScript không kiểm tra biên mảng.

```ts
const arr: string[] = [];
const first = arr[0];      // string | undefined
first.toUpperCase();       // Error: possibly 'undefined'

const rec: Record<string, number> = {};
rec["khong-ton-tai"].toFixed(); // Error — thay vì crash lúc chạy
```

Đây chính là lớp lỗi rất hay gặp: mảng rỗng, key không tồn tại, kết quả `find` không thấy gì.

Vì sao nhiều team tắt:

- **Ồn ào**: ngay cả khi bạn đã kiểm tra `if (arr.length > 0)`, compiler vẫn không narrow được `arr[0]` — vì nó không phân tích quan hệ giữa `length` và index.
- Vòng lặp `for (let i = 0; i < arr.length; i++)` cũng bị than phiền dù index hiển nhiên hợp lệ.
- Dễ dẫn tới việc lạm dụng non-null assertion `arr[0]!` khắp nơi, cuối cùng lại quay về mất an toàn nhưng code thì xấu hơn.

Cách dùng dễ chịu hơn: ưu tiên `for...of`, `at()`, destructuring, hoặc các method như `find`/`filter` vốn đã trả về kiểu có `undefined`.

</details>

**15. `exactOptionalPropertyTypes` phân biệt hai kiểu nào với nhau? Cho một ví dụ lỗi mà nó bắt được còn `strict` thường thì không.**

<details className="qa">
<summary>Xem đáp án</summary>

Nó phân biệt **`{ x?: number }`** — property *có thể vắng mặt* — với **`{ x: number | undefined }`** — property *bắt buộc có, nhưng giá trị có thể là `undefined`*. Ở chế độ `strict` thường, TS gộp hai thứ này lại, coi `x?: number` như `x?: number | undefined`.

```ts
interface Opts { debug?: boolean }

const a: Opts = {};                  // OK ở cả hai chế độ
const b: Opts = { debug: undefined }; // OK ở strict thường
                                      // Error với exactOptionalPropertyTypes
```

Vì sao khác biệt này quan trọng: ở runtime, hai trường hợp **không hề giống nhau**. `"debug" in b` trả về `true` còn `"debug" in a` trả về `false`; `Object.keys` cũng cho kết quả khác. Điều đó ảnh hưởng trực tiếp tới các mẫu code rất phổ biến:

```ts
const merged = { ...defaults, ...userOpts };
// nếu userOpts.debug là undefined, nó GHI ĐÈ giá trị mặc định thành undefined
```

Đúng loại bug "cấu hình mặc định tự nhiên biến mất" mà rất khó truy. Bật flag này buộc phải nói rõ ý định: hoặc bỏ hẳn property, hoặc khai báo tường minh `debug?: boolean | undefined`.

</details>

**16. `noEmit`, `declaration`, `outDir`, `rootDir` — mỗi option dùng khi nào? Publish một thư viện lên npm thì cần bật những cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Option | Dùng khi nào |
|---|---|
| `noEmit` | Chỉ type-check, không sinh file. Dùng khi build bằng bundler/esbuild, hoặc cho lệnh `tsc --noEmit` trong CI |
| `declaration` | Sinh file `.d.ts` kèm theo `.js`. Cần khi phát hành package cho người khác dùng |
| `outDir` | Thư mục chứa output, ví dụ `./dist` — tách hẳn code build khỏi source |
| `rootDir` | Thư mục source đầu vào, ví dụ `./src` — quyết định cấu trúc thư mục bên trong `outDir` |

**Khi publish thư viện lên npm**, cấu hình tối thiểu:

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "noEmit": false
  }
}
```

- `declaration: true` là bắt buộc — không có `.d.ts` thì người dùng TS mất hết type.
- `declarationMap` + `sourceMap` cho phép người dùng "go to definition" và debug về tận source gốc.
- `rootDir` giữ cho output là `dist/index.js` thay vì `dist/src/index.js`.
- Nhớ trỏ `main`/`types`/`exports` trong `package.json` vào đúng file trong `dist`.

Lưu ý `noEmit: true` và `declaration: true` xung đột nhau — không thể vừa không xuất file vừa đòi sinh `.d.ts`.

</details>

**17. `extends` và `references` (project references) khác nhau thế nào? `references` mang lại lợi ích gì cho monorepo nhiều package?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai thứ giải quyết hai bài toán hoàn toàn khác nhau:

- **`extends`** là **kế thừa cấu hình**: file config này lấy option của file kia làm nền rồi ghi đè phần cần sửa. Nó chỉ tác động tới nội dung `tsconfig.json`, không thay đổi cách build.

```json
{
  "extends": "@tsconfig/node20/tsconfig.json",
  "compilerOptions": { "outDir": "./dist" }
}
```

- **`references`** khai báo **quan hệ phụ thuộc giữa các project con**. Mỗi package là một project TS độc lập, và `tsc --build` sẽ dựng chúng theo đúng thứ tự phụ thuộc.

```json
{
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/ui" }
  ]
}
```

Lợi ích cho monorepo:

- **Build incremental**: nhờ file `.tsbuildinfo`, chỉ package nào thay đổi mới được dựng lại — tiết kiệm hàng phút mỗi lần build.
- **Ranh giới rõ ràng**: package chỉ dùng được những gì nó khai báo phụ thuộc, tránh import chéo lộn xộn.
- **IDE nhanh hơn** vì làm việc với `.d.ts` đã build của package khác thay vì phân tích lại toàn bộ source.

Hai option này thường dùng chung: một `tsconfig.base.json` cho cả repo `extends`, cộng với `references` để nối các package.

</details>
