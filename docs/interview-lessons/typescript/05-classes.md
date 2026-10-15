---
sidebar_position: 5
title: "5. Classes"
---

# 5. Classes

## 1. Class cơ bản và Access Modifiers

Bài học: [1. Class cơ bản và Access Modifiers](../../typescript/05-classes/1_class-co-ban.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. TypeScript bổ sung những gì cho `class` so với class của JavaScript thuần? Kể ít nhất bốn thứ.**

<details className="qa">
<summary>Xem đáp án</summary>

Class là tính năng của chính JavaScript; TypeScript phủ thêm một lớp kiểu và đóng gói lên trên:

- **Access modifier** `public` / `protected` / `private` — JS thuần trước ES2022 không có cách khai báo mức truy cập, mọi thứ đều public.
- **`readonly`** — khóa property chỉ được gán trong constructor.
- **Parameter properties** — khai báo và gán field ngay trên tham số constructor, bớt code lặp.
- **Kiểu cho field, tham số, giá trị trả về** của method; `strictPropertyInitialization` bắt buộc field phải được khởi tạo.
- **`implements` interface** — ép class tuân theo hợp đồng, dễ thay thế và mock khi test.
- **`abstract` class/method**, generic class, overload chữ ký method.

Điểm cần nhớ: hầu hết những thứ trên **chỉ tồn tại lúc compile**, biến mất khi ra JS. Riêng parameter properties có sinh code thật (dòng gán trong constructor).

</details>

**2. `Parameter properties` (khai báo `public`/`private` ngay trong constructor) hoạt động ra sao? Nó biên dịch ra JS thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi một tham số constructor có access modifier (hoặc `readonly`), TS hiểu đó vừa là tham số vừa là **property của class**, và tự sinh lệnh gán:

```ts
class User {
  constructor(
    public id: number,
    public name: string,
    private password: string,
  ) {}
}
```

Tương đương với cách viết dài:

```ts
class User {
  public id: number;
  private password: string;
  constructor(id: number, name: string, password: string) {
    this.id = id;
    this.password = password;
  }
}
```

JS đầu ra chỉ còn các dòng `this.id = id;` — modifier bị xóa sạch. Vài lưu ý:

- Phải có **modifier** mới thành property; viết `constructor(id: number)` trơn thì `id` chỉ là tham số thường.
- Trong class con, các dòng gán này được chèn **sau `super()`**.
- Rất hợp với DTO/entity nhiều field và với dependency injection (NestJS, Angular).

</details>

**3. Kể ba `access modifier` và phạm vi truy cập của từng cái. Mặc định là gì khi không viết modifier?**

<details className="qa">
<summary>Xem đáp án</summary>

| Modifier | Truy cập được từ |
|---|---|
| `public` | Bất kỳ đâu — bên ngoài, class con, chính class |
| `protected` | Chính class và **class con** (không truy cập từ bên ngoài) |
| `private` | **Chỉ trong class khai báo nó** |

```ts
class Account {
  public username: string = "";
  protected balance: number = 0;
  private password: string = "";
}

class Saver extends Account {
  showBalance() {
    console.log(this.balance);  // OK — protected
    console.log(this.password); // Error — private
  }
}
```

Không viết gì thì mặc định là **`public`**. Nhiều team vẫn khuyến khích viết `public` tường minh cho method public để đọc code nhất quán, nhưng đó chỉ là quy ước. Lưu ý cả ba chỉ được kiểm tra **lúc compile**; ở JS đầu ra chúng biến mất hoàn toàn.

</details>

**4. `private` của TypeScript được kiểm tra ở thời điểm nào? Từ JavaScript thuần có truy cập được không?**

<details className="qa">
<summary>Xem đáp án</summary>

`private` của TS được kiểm tra **hoàn toàn lúc compile-time**. Nó là một quy ước do compiler ép buộc, không phải một rào chắn thật sự. Khi transpile ra JS, từ khóa `private` bị xóa và property trở thành property thường:

```ts
class A {
  private a = 1;
}

const x = new A() as any;
x.a;      // 1 — vẫn đọc được, TS private bị "lách"
x["a"];   // 1 — truy cập qua index signature cũng được
```

Từ JavaScript thuần (hoặc từ TS sau khi `as any`, hoặc từ JSON serialize như `JSON.stringify`) thì **truy cập bình thường** — vì trong bộ nhớ nó chỉ là một field công khai. Vì thế đừng dựa vào `private` của TS để bảo vệ dữ liệu nhạy cảm khỏi code chạy cùng tiến trình; nó chỉ giúp đóng gói và chống lỡ tay trong lúc phát triển.

</details>

**5. So sánh `private` (TS) với `#field` (ECMAScript): khác nhau về thời điểm kiểm tra, khả năng lách, và khả năng debug.**

<details className="qa">
<summary>Xem đáp án</summary>

| | `private` (TS) | `#field` (JS, ES2022) |
|---|---|---|
| Có từ | TypeScript 1.0 | ECMAScript 2022 |
| Kiểm tra ở | Compile-time | **Runtime** |
| Truy cập từ JS thuần | **Vẫn được** | Không — `SyntaxError`/`TypeError` |
| Truy cập qua `obj["x"]` | Được | Không (`x["#b"]` cho `undefined`) |
| Có trong `JSON.stringify` / `Object.keys` | Có | Không |
| Debug, inspect | Dễ — hiện như field thường | Khó hơn, devtools hiển thị riêng |

```ts
class A {
  private a = 1;
  #b = 2;
}
const x = new A() as any;
x.a;     // 1
x["#b"]; // undefined — true private
```

Ngoài ra `#field` còn ảnh hưởng tới **so sánh kiểu**: hai class có `#field` không bao giờ tương thích chéo. Đổi lại, `#field` sinh ra code kiểm tra lúc runtime nên tốn chút hiệu năng và khó proxy/mock hơn.

</details>

**6. Khi nào bạn chọn `#field` thay vì `private`? Nêu tình huống bảo mật cụ thể.**

<details className="qa">
<summary>Xem đáp án</summary>

Chọn `#field` khi bạn cần **bảo đảm thật sự lúc runtime**, chứ không chỉ là quy ước cho đội phát triển:

- **Viết thư viện / SDK công khai**: người dùng là JS thuần, không có compiler chặn giúp. `private` của TS khi đó vô nghĩa — họ vẫn `obj.internalState = ...` được và bạn mất quyền refactor nội bộ.
- **Giữ secret nhạy cảm**: `#apiSecret`, `#refreshToken`, khóa ký. Với `private` thường, secret lộ ngay khi ai đó `JSON.stringify(client)` hoặc log object ra console/Sentry; với `#field` thì nó không xuất hiện trong `Object.keys`, spread hay JSON.
- **Chạy chung với code bên thứ ba** (plugin, widget nhúng, extension): code lạ có thể đọc/ghi property thường.

Với code ứng dụng nội bộ, toàn bộ codebase đều là TS và được compile, thì `private` của TS đủ tốt — dễ debug, dễ test, không tốn chi phí runtime.

</details>

**7. `protected` khác `private` ở đâu? Đoán lỗi: class con truy cập property `private` của cha — compiler nói gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Khác biệt duy nhất nằm ở **class con**: `protected` cho phép class kế thừa dùng, `private` thì không — chỉ đúng class khai báo mới dùng được. Cả hai đều chặn truy cập từ bên ngoài.

```ts
class Account {
  protected balance = 0;
  private password = "";
}

class Saver extends Account {
  showBalance() {
    console.log(this.balance);  // OK
    console.log(this.password); // Error
  }
}
```

Compiler báo đại ý: `Property 'password' is private and only accessible within class 'Account'.`

Mẹo chọn: `private` là mặc định an toàn — hãy bắt đầu bằng `private`, chỉ nới lên `protected` khi thực sự có class con cần dùng. Nới sẵn `protected` khắp nơi khiến bạn khó sửa nội bộ về sau, vì mọi class con đã phụ thuộc vào chi tiết cài đặt đó.

</details>

**8. Constructor có thể là `private` hoặc `protected` không? Pattern nào tận dụng điều đó?**

<details className="qa">
<summary>Xem đáp án</summary>

Có. `private constructor` chặn `new` từ bên ngoài **và** chặn cả việc kế thừa; `protected constructor` chỉ cho class con gọi qua `super()`.

**Singleton** (mỗi chương trình chỉ có một instance):

```ts
class Logger {
  private static instance: Logger;
  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) Logger.instance = new Logger();
    return Logger.instance;
  }
}

new Logger();            // Error: constructor is private
Logger.getInstance();    // cách duy nhất
```

**Static factory** — buộc tạo object qua hàm có kiểm tra/đặt tên rõ nghĩa:

```ts
class Email {
  private constructor(public readonly value: string) {}
  static create(raw: string): Email | null {
    return raw.includes("@") ? new Email(raw) : null;
  }
}
```

`protected constructor` thì dùng cho **base class chỉ để kế thừa** — gần giống `abstract class` nhưng vẫn có thân cài đặt đầy đủ.

</details>

**9. `readonly` là access modifier hay modifier khác loại? Nó cho phép gán ở những chỗ nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`readonly` **không phải** access modifier — nó kiểm soát **quyền ghi**, còn `public`/`protected`/`private` kiểm soát **phạm vi nhìn thấy**. Hai nhóm độc lập nên kết hợp được: `private readonly`, `public readonly`...

`readonly` chỉ cho phép gán ở hai chỗ, và phải nằm **trong chính class khai báo nó**:

1. Tại chỗ khai báo field (initializer).
2. Bên trong `constructor`.

```ts
class Config {
  readonly createdAt = new Date();       // 1. initializer
  constructor(public readonly apiUrl: string) {} // 2. parameter property

  reset() {
    this.apiUrl = "/other"; // Error: cannot assign to a read-only property
  }
}

const c = new Config("/api");
c.apiUrl = "/other"; // Error
```

Lưu ý: gán trong method khác (kể cả method của chính class) là lỗi, và class con cũng không gán lại được `readonly` của cha. Giống mọi thứ khác của TS, `readonly` chỉ tồn tại lúc compile.

</details>

**10. `readonly` có tạo ra `deep immutability` không? Nếu property là mảng thì còn push được không, vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Không — `readonly` chỉ **nông (shallow)**. Nó cấm gán lại *chính property đó*, chứ không cấm thay đổi nội dung bên trong giá trị mà property trỏ tới:

```ts
class Cart {
  constructor(public readonly items: string[]) {}
}

const c = new Cart(["a"]);
c.items = [];         // Error — gán lại property
c.items.push("b");    // OK! — mảng vẫn mutate được
c.items.length = 0;   // OK
```

Lý do: với kiểu tham chiếu, property chỉ giữ **địa chỉ** của mảng. `readonly` khóa cái địa chỉ đó, còn `push` không đổi địa chỉ mà đổi nội dung.

Muốn chặt hơn, dùng thêm:

- `readonly string[]` (hoặc `ReadonlyArray<string>`) — bỏ luôn `push`, `pop`, `splice` khỏi kiểu.
- `ReadonlyMap`, `ReadonlySet`, hoặc một kiểu `DeepReadonly<T>` tự viết.
- `Object.freeze` nếu cần chặn thật sự lúc runtime — vì mọi `readonly` đều biến mất khi ra JS.

</details>

**11. Kết hợp `private readonly _id` với `getter` mang lại lợi ích gì so với để `public readonly`?**

<details className="qa">
<summary>Xem đáp án</summary>

```ts
class User {
  constructor(
    private readonly _id: number,
    public name: string,
  ) {}

  get id(): number { return this._id; }
}
```

So với `public readonly id`, cách này cho bạn:

- **Toàn quyền kiểm soát cách đọc**: về sau muốn format, tính toán lazy, ghi log truy cập hay trả về bản sao phòng thủ (defensive copy cho object/mảng) đều làm được mà **không đổi API** — nơi gọi vẫn viết `u.id`.
- **Bảo vệ chắc hơn**: `public readonly` chỉ chặn lúc compile; ai đó `(u as any).id = 9` là sửa được. Với `_id` private và chỉ có getter, ít nhất API công khai không có đường ghi. Đổi `_id` thành `#id` thì thành bất khả xâm phạm ở runtime.
- **Che tên nội bộ**: đổi tên/đổi cách lưu `_id` không ảnh hưởng người dùng class.

Đánh đổi: nhiều code hơn, thêm một lớp gián tiếp. Với DTO/value object đơn giản, `public readonly` vẫn là lựa chọn gọn và đủ dùng.

</details>

**12. `static member` thuộc về ai? Trong method `static`, `this` trỏ tới cái gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`static` member thuộc về **chính class** (đối tượng constructor), không phải instance. Vì vậy gọi qua tên class, không qua object:

```ts
class MathUtils {
  static PI = 3.14159;
  static double(n: number): number { return n * 2; }
}

MathUtils.PI;        // 3.14159
MathUtils.double(5); // 10
new MathUtils().double(5); // Error — không có trên instance
```

Trong method `static`, `this` trỏ tới **chính class đó** (constructor function), nên `this.PI` chính là `MathUtils.PI`. Điều thú vị là với kế thừa, `this` tuân theo cách gọi:

```ts
class Base {
  static create() { return new this(); } // this = class được gọi
}
class Child extends Base {}

Child.create(); // trả về instance của Child, không phải Base
```

Đây gọi là **polymorphic `this`** ở tầng static — nền tảng cho static factory kế thừa được. Lưu ý static member cũng nhận access modifier (`private static instance`) và `readonly`.

</details>

**13. `static block` dùng để làm gì và chạy vào lúc nào trong vòng đời của class?**

<details className="qa">
<summary>Xem đáp án</summary>

`static {}` (TS 4.4+, ES2022) là khối khởi tạo cho **state ở cấp class**, dùng khi việc khởi tạo cần nhiều dòng, cần `try/catch`, cần vòng lặp — những thứ không nhét vừa một initializer đơn giản:

```ts
class App {
  static config: Record<string, string>;

  static {
    App.config = loadConfig();
  }
}
```

Thời điểm chạy: **một lần duy nhất, ngay khi class được định nghĩa (lúc module chứa nó được load)** — trước bất kỳ instance nào được tạo và trước mọi lần dùng class. Các `static` field initializer và static block chạy **theo thứ tự xuất hiện** trong thân class.

Trong static block, `this` trỏ tới chính class, và nó truy cập được cả `private`/`#field` static của class — nên còn dùng để cho phép code ngoài class đọc private member một cách có kiểm soát. Lưu ý: nếu block ném lỗi, class coi như khởi tạo thất bại.

</details>

**14. Khi nào nên dùng `static` và khi nào nên tách thành module hàm thường? Rủi ro "god class" là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Dùng `static` khi:**

- Method **gắn chặt về ngữ nghĩa** với class: factory (`User.fromJSON`), hằng số của domain (`Circle.MAX_RADIUS`), so sánh/validate của chính kiểu đó.
- Cần đụng tới `private`/`#field` static của class.
- Muốn gom thành namespace có ý nghĩa như `Math.*`, `Array.from`.

**Dùng module hàm thường khi:** đó là util chung chung, không thuộc về thực thể nào — `utils/math.ts` export `sum`, `clamp`. Cách này còn có ưu thế lớn: **tree-shaking** loại bỏ hàm không dùng, còn static method trong một class thì thường bị giữ lại cả cụm.

**Rủi ro "god class"**: gom mọi util vào một class static khiến file phình ra hàng trăm dòng, trách nhiệm lẫn lộn, khó test (không mock được từng phần), khó tách nhỏ và mọi nơi import đều kéo theo toàn bộ. Class khi đó chỉ đóng vai một cái "túi đựng hàm" — không có state, không có instance, tức là dùng sai công cụ.

</details>

**15. `getter` và `setter` trong class TS được định kiểu ra sao? Kiểu của getter và setter có bắt buộc giống nhau không?**

<details className="qa">
<summary>Xem đáp án</summary>

Getter khai báo **kiểu trả về**, setter khai báo **kiểu tham số**; setter không được có kiểu trả về (phải là `void`):

```ts
class Temp {
  private _c = 0;

  get celsius(): number { return this._c; }
  set celsius(v: number) { this._c = v; }
}
```

Từ TS 4.3 trở đi, **kiểu đọc và kiểu ghi được phép khác nhau**, miễn kiểu của getter **gán được** cho kiểu tham số của setter:

```ts
class Box {
  private _size = 0;
  get size(): number { return this._size; }
  set size(v: number | string) {        // nhận rộng, trả về hẹp
    this._size = typeof v === "string" ? Number(v) : v;
  }
}
```

Vài lưu ý: chỉ có getter mà không có setter thì property được coi là `readonly`; getter/setter được sinh ra bằng `Object.defineProperty` trên prototype nên không hiện trong `Object.keys` của instance; và nên tránh đặt logic nặng hay side effect trong getter vì người đọc code mong nó rẻ như đọc field.

</details>

**16. Class trong TypeScript vừa là giá trị vừa là kiểu — điều đó nghĩa là gì? Cho ví dụ dùng tên class ở vị trí kiểu.**

<details className="qa">
<summary>Xem đáp án</summary>

Khai báo một class tạo ra **hai thứ cùng tên** ở hai không gian khác nhau:

- Trong **value space**: một giá trị (constructor function) — thứ bạn `new`, truyền đi, gán biến.
- Trong **type space**: một kiểu mô tả **instance** của class đó.

```ts
class User {
  constructor(public id: number) {}
}

const u: User = new User(1);  // "User" bên trái là KIỂU (instance),
                              // "User" bên phải là GIÁ TRỊ (constructor)

function greet(user: User) {} // kiểu instance
```

Muốn nói tới kiểu của **chính constructor** thì dùng `typeof User`:

```ts
function createAny(Ctor: typeof User): User {
  return new Ctor(1);
}

// Hoặc mô tả tổng quát bằng construct signature:
type Ctor<T> = new (...args: any[]) => T;
```

Hai tiện ích liên quan: `InstanceType<typeof User>` lấy kiểu instance, `ConstructorParameters<typeof User>` lấy tuple tham số constructor. Ngược lại, `interface` và `type` chỉ tồn tại ở type space — không dùng được ở vị trí giá trị.

</details>

**17. `strictPropertyInitialization` là gì? Ba cách hợp lệ để xử lý property chưa được gán trong constructor.**

<details className="qa">
<summary>Xem đáp án</summary>

`strictPropertyInitialization` (bật kèm `strict`, yêu cầu `strictNullChecks`) buộc mọi property khai báo phải **chắc chắn có giá trị** khi constructor chạy xong — nếu không, TS báo `Property 'x' has no initializer and is not definitely assigned in the constructor`.

Ba cách xử lý hợp lệ:

```ts
class A {
  // 1. Gán tại chỗ khai báo hoặc trong constructor
  name: string = "";
  id: number;
  constructor(id: number) { this.id = id; }

  // 2. Đánh dấu optional — kiểu thành string | undefined
  nickname?: string;

  // 3. Definite assignment assertion — "tôi cam đoan sẽ có"
  ref!: HTMLElement;
}
```

Cách 3 (`!`) dùng khi giá trị được gán bởi cơ chế bên ngoài constructor: DI framework, `ngOnInit`, ORM khi hydrate từ DB, hoặc một hàm `init()` riêng. Nhưng nó **tắt kiểm tra**, nên nếu quên gán thật thì lỗi chỉ lộ lúc runtime — ưu tiên cách 1 và 2 bất cứ khi nào có thể.

</details>

**18. Hai class có cùng shape nhưng khác tên có gán cho nhau được không? Giải thích theo `structural typing` và ngoại lệ khi có thành viên `private`.**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định là **được**, vì TS dùng **structural typing** — chỉ so sánh hình dạng, không so tên:

```ts
class Point { constructor(public x: number, public y: number) {} }
class Coord { constructor(public x: number, public y: number) {} }

const p: Point = new Coord(1, 2); // OK — cùng shape
```

**Ngoại lệ**: khi class có member `private` hoặc `protected`, TS chuyển sang kiểu so sánh **nominal** — hai kiểu chỉ tương thích nếu member đó **bắt nguồn từ cùng một khai báo**:

```ts
class A { private secret = 1 }
class B { private secret = 1 }

const a: A = new B();
// Error: Types have separate declarations of a private property 'secret'.
```

Nghĩa là dù trông giống hệt, `A` và `B` vẫn không thay thế được cho nhau; chỉ `A` và class kế thừa `A` mới tương thích (vì `secret` cùng một nguồn khai báo). `#field` cũng gây hiệu ứng tương tự. Đây là mẹo phổ biến để tạo **branded type** — ép TS phân biệt hai kiểu có cùng cấu trúc.

</details>

---

## 2. Abstract Classes và Inheritance

Bài học: [2. Abstract Classes và Inheritance](../../typescript/05-classes/2_abstract-inheritance.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Inheritance` giải quyết vấn đề gì? Nêu một tình huống mà kế thừa gọn hơn hẳn việc lặp code.**

<details className="qa">
<summary>Xem đáp án</summary>

Kế thừa cho phép class con **tái sử dụng và mở rộng** field/method của class cha, đồng thời thiết lập quan hệ "là một" (is-a) để dùng chung một kiểu.

```ts
class Animal {
  constructor(public name: string) {}
  move() { console.log(`${this.name} đang di chuyển`); }
}

class Dog extends Animal {
  bark() { console.log(`${this.name} sủa`); }
}

const d = new Dog("Lulu");
d.move(); // dùng lại code của Animal
```

Tình huống kế thừa gọn hơn hẳn: một base `BaseRepo<T>` đã lo sẵn kết nối DB, logging, xử lý lỗi, phân trang — mỗi repository cụ thể (`UserRepo`, `OrderRepo`) chỉ cần viết phần truy vấn riêng. Không có kế thừa thì cùng một đoạn log/try-catch bị chép lại hàng chục lần, sửa một chỗ là phải rà toàn bộ.

Lợi ích thứ hai quan trọng không kém: mọi class con **dùng chung kiểu cha**, nên viết được hàm `printArea(shapes: Shape[])` xử lý mọi loại hình.

</details>

**2. `extends` cho phép kế thừa bao nhiêu class cha? Nếu cần hành vi từ nhiều nguồn thì làm cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Đúng **một** class cha — TypeScript (và JavaScript) chỉ hỗ trợ single inheritance. Ngược lại, `implements` thì nhận **nhiều interface** cùng lúc.

Khi cần hành vi từ nhiều nguồn, các lựa chọn theo thứ tự ưu tiên:

- **Composition** — giữ các đối tượng cộng tác làm field và ủy quyền (delegate) cho chúng. Linh hoạt nhất, dễ test vì thay được bằng mock.
- **Nhiều interface + tự cài đặt**: `class Duck implements Swimmer, Flyer`. Có contract nhưng phải tự viết code, không tái sử dụng được.
- **Mixin** — hàm nhận một class base và trả về class mới đã thêm hành vi:

```ts
type Ctor<T = {}> = new (...args: any[]) => T;

function Timestamped<TBase extends Ctor>(Base: TBase) {
  return class extends Base {
    createdAt = new Date();
  };
}

class User {}
class TimedUser extends Timestamped(User) {}
```

Mixin mạnh nhưng làm kiểu và stack trace khó đọc — chỉ dùng khi composition thật sự không gọn.

</details>

**3. Vì sao class con bắt buộc gọi `super()` trong constructor? Chuyện gì xảy ra nếu dùng `this` trước khi gọi `super()`?**

<details className="qa">
<summary>Xem đáp án</summary>

Theo ngữ nghĩa class của ES2015, constructor của class con **không tự tạo ra `this`** — chính `super()` mới chạy constructor cha và khởi tạo đối tượng. Trước khi `super()` chạy xong, `this` ở trạng thái chưa khởi tạo (TDZ), nên không được đụng vào.

```ts
class Puppy extends Dog {
  constructor(name: string) {
    // this.x = 1; // Error: 'super' must be called before accessing 'this'
    super(name);   // bắt buộc nếu cha có constructor
    this.age = 0;  // OK sau super()
  }
}
```

- Lúc compile: TS báo `'super' must be called before accessing 'this' in the constructor of a derived class`.
- Lúc runtime (nếu lách được TS): `ReferenceError: Must call super constructor ... before accessing 'this'`.

Hai lưu ý thêm: nếu class con **không viết constructor**, JS tự sinh một constructor mặc định gọi `super(...args)` giúp; và các **parameter property** của class con được gán ngay sau lời gọi `super()`.

</details>

**4. `super.method()` khác `this.method()` ra sao khi class con đã override method đó?**

<details className="qa">
<summary>Xem đáp án</summary>

- `this.method()` — **dynamic dispatch**: chạy phiên bản của class thực tế của object, tức là bản đã override ở con.
- `super.method()` — **tĩnh**: chỉ định rõ chạy bản của class cha, bỏ qua override.

```ts
class Dog {
  bark() { console.log("gâu!"); }
}

class Puppy extends Dog {
  bark() {
    super.bark();            // gọi bản của Dog
    console.log("(yếu)");
    // this.bark();          // ĐỆ QUY VÔ TẬN — gọi lại chính nó
  }
}

new Puppy().bark(); // "gâu!" rồi "(yếu)"
```

Đây là mẫu **mở rộng chứ không thay thế**: con làm thêm việc của mình rồi vẫn tận dụng logic cha. Hai lưu ý: gọi `this.method()` bên trong chính method đó gây đệ quy vô tận; và `super` chỉ dùng được trong method/constructor của class (không dùng trong hàm thường), vì nó dựa vào liên kết prototype của class.

</details>

**5. `abstract class` là gì và vì sao không `new` trực tiếp được? Compiler chặn ở thời điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`abstract class` là class dùng làm **khuôn mẫu chung**: nó có thể chưa hoàn chỉnh (chứa `abstract` member chưa có thân), nên tạo instance của nó là vô nghĩa — gọi một method chưa có cài đặt sẽ nổ.

```ts
abstract class Shape {
  abstract area(): number;
  describe() { return `Diện tích: ${this.area()}`; }
}

new Shape(); // Error: Cannot create an instance of an abstract class
```

Compiler chặn ở **compile-time**. Đây là điểm quan trọng: `abstract` là tính năng **chỉ có ở TypeScript**, khi transpile ra JS thì từ khóa biến mất và class trở thành class thường — tức là `new` được bình thường nếu ai đó lách bằng `as any` hoặc gọi từ JS thuần.

So sánh với cách JS thuần hay dùng (`throw new Error("Phải override")` trong method base): cách đó chỉ nổ **lúc runtime** và chỉ khi method được gọi tới, còn `abstract` báo sai ngay lúc bạn gõ code.

</details>

**6. `abstract method` khác method thường ở đâu? Class con không cài đặt thì chuyện gì xảy ra?**

<details className="qa">
<summary>Xem đáp án</summary>

`abstract method` chỉ có **chữ ký, không có thân** — nó là lời tuyên bố "class con bắt buộc phải cài đặt method này". Method thường thì có thân và class con được quyền dùng lại hoặc override.

```ts
abstract class Shape {
  abstract area(): number;   // không có body, kết thúc bằng dấu ;
  describe() { return `Diện tích: ${this.area()}`; } // method thường
}

class Circle extends Shape {} // Error: Non-abstract class 'Circle' does not
                              // implement inherited abstract member 'area'

class Square extends Shape {
  constructor(private s: number) { super(); }
  area(): number { return this.s ** 2; } // bắt buộc
}
```

Nếu class con không cài đặt, compiler báo lỗi ngay. Có một lối thoát hợp lệ: khai báo class con **cũng là `abstract`**, khi đó nghĩa vụ cài đặt được đẩy xuống tầng tiếp theo.

Ràng buộc kèm theo: `abstract` member chỉ tồn tại trong `abstract class`, và không kết hợp được với `private` (vì class con phải thấy để cài đặt) hay `static`.

</details>

**7. `abstract class` có được chứa constructor, field, và method đã cài đặt sẵn không? Điều đó dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Được hết — đây chính là điểm mạnh phân biệt nó với interface. Một abstract class có thể chứa:

- **Constructor** (class con gọi qua `super()`) — khởi tạo state chung.
- **Field** thường, `readonly`, `private`/`protected`, cả `static`.
- **Method đã cài đặt sẵn**, getter/setter, và cả `abstract` member.

```ts
abstract class BaseRepo<T> {
  constructor(protected readonly table: string) {}

  abstract findById(id: number): T | null;   // con cài đặt

  log(action: string) {                       // code dùng chung
    console.log(`[${this.table}] ${action}`);
  }
}
```

Dùng để làm gì: **chia sẻ code và ép contract cùng lúc**. Class con vừa được thừa hưởng phần hạ tầng (logging, kết nối, xử lý lỗi, hook lifecycle), vừa bị buộc phải điền phần riêng của mình. Nếu chỉ cần contract mà không chia sẻ code thì interface gọn hơn — vì nó bị xóa hoàn toàn khi ra JS, không sinh class runtime.

</details>

**8. Có thể khai báo `abstract` cho property và cho `getter`/`setter` không? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

Có cả hai. `abstract` áp dụng được cho property, method và accessor:

```ts
abstract class Shape {
  abstract readonly kind: string;    // abstract property
  abstract area(): number;           // abstract method

  abstract get label(): string;      // abstract getter
  abstract set label(v: string);     // abstract setter

  describe() { return `${this.kind}: ${this.area()}`; }
}

class Square extends Shape {
  readonly kind = "square";
  private _label = "";

  constructor(private s: number) { super(); }
  area(): number { return this.s ** 2; }

  get label(): string { return this._label; }
  set label(v: string) { this._label = v; }
}
```

Vài lưu ý: class con **được phép** cài đặt một abstract property bằng property thường, hoặc bằng cặp getter/setter — và ngược lại, vì ở tầng kiểu chúng tương đương. Abstract member không đi kèm `private` (con phải thấy để cài đặt) và không có `static`. Với `strictPropertyInitialization`, abstract property không bị bắt khởi tạo ở lớp cha vì nó vốn chưa có giá trị.

</details>

**9. So sánh `abstract class` với `interface` theo bốn tiêu chí: chứa code, tồn tại runtime, số lượng kế thừa, có constructor.**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | Abstract Class | Interface |
|---|---|---|
| Chứa code | **Có** — method có thân, field có giá trị, logic dùng chung | Không — chỉ mô tả shape |
| Tồn tại runtime | **Có** — sinh ra class JS thật, dùng được `instanceof` | Không — bị xóa hoàn toàn khi compile |
| Số lượng kế thừa | `extends` đúng **một** | `implements` **nhiều** cùng lúc |
| Có constructor | **Có** — khởi tạo state chung, class con gọi `super()` | Không |

Vài hệ quả thực tế: chỉ abstract class mới giữ được state chung và cho phép `x instanceof BaseRepo`; đổi lại nó chiếm mất "suất" kế thừa duy nhất của class con và có mặt trong bundle. Interface miễn phí về runtime, kết hợp thoải mái, nhưng mỗi class phải tự viết lại phần cài đặt.

Nguyên tắc chọn: cần **chia sẻ code + ép contract** → abstract class; chỉ cần **contract** → interface.

</details>

**10. `Polymorphism` là gì? Giải thích `dynamic dispatch` — runtime quyết định gọi method nào dựa trên cái gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Polymorphism** (đa hình) là khả năng gọi **cùng một method** trên các object khác nhau và mỗi object phản hồi theo cách riêng của nó:

```ts
function printArea(shapes: Shape[]) {
  for (const s of shapes) {
    console.log(s.area()); // tự gọi đúng version
  }
}

printArea([new Circle(5), new Square(4)]);
```

Hàm `printArea` chỉ biết kiểu tĩnh là `Shape`, nhưng vẫn ra đúng kết quả cho từng hình.

**Dynamic dispatch**: quyết định gọi method nào diễn ra **lúc runtime, dựa trên class thực tế của object**, chứ không dựa trên kiểu khai báo lúc compile. Cơ chế cụ thể trong JS là **prototype chain** — `s.area()` tìm `area` trên chính object, rồi lần lên prototype của `Circle`, rồi `Shape`; bản tìm thấy đầu tiên được chạy. Vì `Circle.prototype.area` nằm gần hơn nên nó "che" bản của cha.

Lợi ích: thêm một hình mới chỉ cần viết class mới, không phải sửa `printArea` — đúng tinh thần Open/Closed.

</details>

**11. Khi override method của cha, chữ ký của method con phải thoả điều kiện gì để compiler chấp nhận?**

<details className="qa">
<summary>Xem đáp án</summary>

Điều kiện tổng quát: kiểu của class con phải **gán được** cho kiểu của class cha — nghĩa là mọi nơi đang dùng cha đều thay bằng con được (nguyên tắc Liskov). Cụ thể:

- **Kiểu trả về** phải gán được cho kiểu trả về của cha (được phép **hẹp hơn**, không được rộng hơn).
- **Tham số**: TS kiểm tra theo kiểu **bivariant** cho method, khá dễ dãi — nhưng số tham số của con không được **nhiều hơn** bắt buộc so với cha.
- **Mức truy cập** không được thu hẹp: `public` ở cha không thể thành `protected`/`private` ở con (nới ngược lại thì được).
- Không đổi `static` thành instance member và ngược lại.

```ts
class Animal {
  speak(): Animal { return this; }
}

class Dog extends Animal {
  speak(): Dog { return this; }      // OK — trả về hẹp hơn
  // speak(): object { ... }         // Error — rộng hơn
  // protected speak() { ... }       // Error — thu hẹp truy cập
}
```

Sai điều kiện, compiler báo `Class 'Dog' incorrectly extends base class 'Animal'`.

</details>

**12. `override` keyword (TS 4.3+) và cờ `noImplicitOverride` giúp phòng bug nào? Cho ví dụ cụ thể.**

<details className="qa">
<summary>Xem đáp án</summary>

Chúng phòng bug **"tưởng là đang override nhưng thật ra không"** — thường xảy ra khi class cha đổi tên hoặc bỏ method, hoặc bạn gõ nhầm tên.

```ts
class Base {
  handleClick() {}
}

class Child extends Base {
  override handleClick() {}  // OK
  override handleClik() {}   // Error: This member cannot have an 'override'
                             // modifier because it is not declared in the base class
}
```

Không có `override`, đoạn `handleClik` trên chỉ lặng lẽ tạo ra một method mới — code compile thành công nhưng hành vi của cha vẫn chạy, bug rất khó truy.

`noImplicitOverride: true` bổ sung chiều ngược lại: **mọi** method ghi đè member của cha **bắt buộc** phải có từ khóa `override`, nếu không là lỗi. Nhờ vậy khi đọc class con, bạn phân biệt ngay đâu là method mới, đâu là method ghi đè. Rất đáng bật với codebase có nhiều tầng kế thừa hoặc kế thừa class của framework/thư viện bên ngoài.

</details>

**13. Method của cha là `private` thì class con có override được không? Còn `protected` thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**`private`: không.** Class con thậm chí không nhìn thấy member đó, và khai báo lại cùng tên là lỗi:

```ts
class Base {
  private helper() {}
}

class Child extends Base {
  private helper() {}
  // Error: Class 'Child' incorrectly extends base class 'Base'.
  // Types have separate declarations of a private property 'helper'.
}
```

**`protected`: có.** Class con thấy được, gọi được qua `this`/`super`, và override bình thường. Con còn được phép **nới rộng** mức truy cập lên `public`:

```ts
class Base {
  protected run() {}
}

class Child extends Base {
  override run() { super.run(); }  // nới protected → public, hợp lệ
  // protected → private thì LỖI (thu hẹp)
}
```

Hệ quả thiết kế: những gì bạn muốn class con tùy biến phải để `protected` (hoặc `abstract`); những gì là chi tiết nội bộ, bạn muốn tự do sửa về sau, hãy để `private`. Đây cũng là cách tránh **fragile base class**.

</details>

**14. `Template method pattern` là gì và vì sao `abstract class` là công cụ tự nhiên để cài đặt nó?**

<details className="qa">
<summary>Xem đáp án</summary>

**Template method** là mẫu thiết kế trong đó class cha định nghĩa **khung của một quy trình** (thứ tự các bước), còn để lại một số bước dưới dạng "lỗ hổng" cho class con điền vào. Cha nắm *flow*, con nắm *chi tiết*.

```ts
abstract class Importer {
  // template method — cố định flow
  run(path: string) {
    const raw = this.read(path);
    const rows = this.parse(raw);
    this.save(rows);
    console.log("Xong");
  }

  protected abstract parse(raw: string): unknown[]; // con điền
  protected read(path: string): string { return ""; }
  protected save(rows: unknown[]) {}
}

class CsvImporter extends Importer {
  protected parse(raw: string) { return raw.split("\n"); }
}
```

`abstract class` là công cụ tự nhiên vì nó làm được cùng lúc hai việc mà interface không làm được: **chứa code thật** cho phần khung dùng chung, và **ép buộc** class con cài đặt đúng những bước còn thiếu (compiler báo lỗi nếu quên). Nó cũng cho phép để các bước dạng `protected`, tức là hiện với con nhưng ẩn với bên ngoài.

</details>

**15. Khi nào chọn `abstract class`, khi nào chọn `interface`? Nêu bốn tiêu chí quyết định.**

<details className="qa">
<summary>Xem đáp án</summary>

Bốn tiêu chí quyết định:

1. **Có code dùng chung không?** Cần chia sẻ logic, state, hook lifecycle (template method) → **abstract class**. Chỉ mô tả shape → **interface**.
2. **Cần nhiều "hợp đồng" cùng lúc không?** Một class chỉ `extends` được một class nhưng `implements` được nhiều interface → cần đa contract thì **interface**.
3. **Có cần tồn tại lúc runtime không?** Cần `instanceof`, cần giá trị class để truyền/đăng ký (DI container) → **abstract class**. Muốn type-only, không tăng bundle → **interface**.
4. **Quan hệ là "is-a" hay "can-do"?** `Circle` *là một* `Shape` → abstract class hợp lý. `Duck` *có thể* bơi, *có thể* bay → interface `Swimmer`, `Flyer`.

Quy tắc thực dụng: mặc định chọn **interface + composition**; chỉ nâng lên abstract class khi phát hiện có phần code khung thật sự lặp lại giữa các cài đặt. Abstract class đặc biệt hợp khi xây framework, ORM, hay base class có lifecycle phức tạp.

</details>

**16. Vì sao trong app React/Node hiện đại nhiều team ưu tiên `interface` + `composition` hơn cây kế thừa sâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Vài lý do cộng dồn:

- **Hệ sinh thái đã dịch sang hướng hàm**: React bỏ class component để dùng hook; Express/Nest middleware là hàm; các util là module export hàm. Kế thừa không còn là đơn vị tổ chức chính.
- **Composition linh hoạt hơn**: ghép hành vi lúc chạy, đổi được từng mảnh, không bị giới hạn "một cha duy nhất". Kế thừa quyết định quan hệ ngay lúc viết code và rất khó gỡ về sau.
- **Dễ test**: các phụ thuộc được tiêm vào qua constructor/tham số nên thay bằng mock dễ dàng; còn logic nằm trong base class thì phải kế thừa mới test được.
- **Tree-shaking và bundle size**: interface bị xóa hoàn toàn khi compile, còn abstract class là code thật đi vào bundle.
- **Dễ đọc**: với composition, mở một file là thấy đủ; với kế thừa 4-5 tầng, muốn biết `this.save()` chạy gì phải lần ngược cả cây.

Abstract class vẫn hợp lý ở tầng hạ tầng (framework, ORM, base service có lifecycle), nhưng làm mặc định cho code nghiệp vụ thì thường quá nặng.

</details>

**17. Kể các vấn đề của kế thừa sâu (fragile base class, coupling chặt, khó test) và cách `composition` giảm nhẹ chúng.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Fragile base class**: sửa một dòng trong class cha có thể làm vỡ các class con ở xa mà bạn không hề biết — đặc biệt khi cha gọi `this.someMethod()` đã bị con override.
- **Coupling chặt**: con phụ thuộc vào cả chi tiết nội bộ (`protected` field, thứ tự gọi method) của cha, không chỉ vào API công khai.
- **Khó test**: muốn test logic trong base phải tạo một class con; muốn thay một phụ thuộc nằm trong base thì gần như phải sửa base.
- **Bùng nổ tổ hợp**: cần "vừa A vừa B" mà chỉ có một suất `extends` → sinh ra hàng loạt class lai kỳ quặc.
- **Khó đọc**: hành vi rải khắp nhiều tầng, phải lần ngược cả cây mới hiểu một lời gọi.

**Composition giảm nhẹ** bằng cách giữ cộng tác viên làm field và ủy quyền cho họ: ranh giới là interface công khai chứ không phải nội bộ; thay cài đặt chỉ cần tiêm object khác (rất dễ mock); ghép bao nhiêu hành vi cũng được vì không giới hạn số field; và mỗi mảnh nhỏ tự test độc lập được. Câu châm ngôn quen thuộc: *"favor composition over inheritance"*.

</details>

**18. Một class có thể vừa `extends` một abstract class vừa `implements` nhiều interface không? Compiler kiểm tra những gì trong trường hợp đó?**

<details className="qa">
<summary>Xem đáp án</summary>

Có — `extends` đúng **một** class, nhưng `implements` bao nhiêu interface cũng được, và hai mệnh đề đi cùng nhau (thứ tự bắt buộc: `extends` trước, `implements` sau):

```ts
abstract class BaseRepo<T> {
  abstract findById(id: number): T | null;
  log(action: string) { console.log(action); }
}

interface Cacheable { invalidate(): void }
interface Auditable { audit(): string }

class UserRepo extends BaseRepo<User> implements Cacheable, Auditable {
  findById(id: number) { return null; }
  invalidate() {}
  audit() { return "ok"; }
}
```

Compiler kiểm tra ba việc:

- Class **kế thừa được code** từ `BaseRepo` (method `log` dùng ngay) và phải cài đặt hết `abstract` member của nó.
- Class có **đủ member** mà mọi interface yêu cầu, kiểu tương thích. `implements` **không mang lại code nào** — nhưng member kế thừa từ class cha vẫn được tính là thỏa mãn interface.
- Không có xung đột chữ ký giữa các nguồn (ví dụ cùng tên method nhưng kiểu không tương thích).

</details>

---

## 3. Method Overriding và Constructor Overloading

Bài học: [3. Method Overriding và Constructor Overloading](../../typescript/05-classes/3_overriding-overloading.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt method overriding và method overloading trong TypeScript — cái nào là chuyện của runtime, cái nào chỉ tồn tại lúc biên dịch?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Overriding | Overloading |
|---|---|---|
| Quan hệ | Giữa **lớp cha và lớp con** | Nhiều **chữ ký cho cùng một tên** trong một phạm vi |
| Số cài đặt | Mỗi lớp có một cài đặt riêng | Nhiều signature, **một** cài đặt chung |
| Thời điểm quyết định | **Runtime** — dynamic dispatch theo class thực của object | **Compile-time** — TS chọn kiểu trả về theo đối số |
| Có trong JS đầu ra | **Có** (method thật trên prototype) | **Không** — signature bị xóa sạch |

```ts
// Overriding
class Dog extends Animal {
  override speak(): string { return "Woof!"; }
}

// Overloading
add(a: number, b: number): number;
add(a: string, b: string): string;
add(a: any, b: any): any { return a + b; }
```

Tóm lại: overriding là chuyện **runtime** và tồn tại thật trong JS; overloading thuần túy là chuyện **kiểu**, chỉ giúp compiler suy ra đúng kiểu trả về.

</details>

**2. Vì sao JavaScript thuần không có overloading kiểu Java/C#, và TypeScript "mô phỏng" nó bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

JS không có overloading vì hai lý do gốc:

- **Không có kiểu lúc runtime** để phân giải theo chữ ký — Java/C# chọn phương thức dựa trên kiểu tham số đã biết lúc compile.
- **Tên hàm là một binding duy nhất**: khai báo hai hàm cùng tên thì cái sau **đè** cái trước, không tồn tại song song.

```js
function f(a) {}
function f(a, b) {} // đè hoàn toàn bản trên
```

Thay vào đó, JS xử lý bằng cách kiểm tra `arguments.length` hoặc `typeof` ngay trong thân hàm.

TypeScript mô phỏng ở **tầng kiểu**: bạn khai báo nhiều **overload signature** (chỉ chữ ký, không thân), rồi một **implementation signature** đủ rộng để bao hết:

```ts
function parse(input: string): string;
function parse(input: number): number;
function parse(input: string | number): string | number { return input; }
```

Compiler khớp lời gọi với signature phù hợp để suy ra kiểu trả về; còn khi ra JS chỉ còn đúng một hàm cài đặt, và bạn vẫn phải tự phân nhánh bằng `typeof` bên trong.

</details>

**3. Từ khoá `override` giải quyết vấn đề gì? Nếu gõ sai tên method của lớp cha mà không có nó thì chuyện gì xảy ra?**

<details className="qa">
<summary>Xem đáp án</summary>

`override` (TS 4.3+) khẳng định rằng method này **đang ghi đè** một member có thật của lớp cha. Nếu lớp cha không có, compiler báo lỗi ngay.

```ts
class Animal {
  speak(): string { return "..."; }
}

class Dog extends Animal {
  override speack(): string { return "Woof!"; }
  //       ^ Error: This member cannot have an 'override' modifier
  //         because it is not declared in the base class 'Animal'.
}
```

Không có `override`, đoạn typo trên **compile thành công**: JS lặng lẽ coi `speack` là một method hoàn toàn mới, còn `speak` vẫn dùng bản của `Animal`. Kết quả là gọi `dog.speak()` ra `"..."` thay vì `"Woof!"` — code chạy, không lỗi, nhưng hành vi sai và rất khó truy vì không có dấu hiệu nào.

Ngoài chống typo, `override` còn giúp người đọc phân biệt ngay đâu là method mới, đâu là method ghi đè trong một lớp con dài.

</details>

**4. Cờ `noImplicitOverride` trong `tsconfig.json` bắt buộc điều gì? Nó giúp gì khi ai đó rename method ở lớp cha?**

<details className="qa">
<summary>Xem đáp án</summary>

`noImplicitOverride: true` bắt buộc **mọi** method ghi đè member của lớp cha phải viết rõ từ khóa `override`, nếu thiếu là lỗi:

```ts
// noImplicitOverride: true
class Dog extends Animal {
  speak(): string { return "Woof"; }
  //   ^ Error: This member must have an 'override' modifier
  //     because it overrides a member in the base class 'Animal'.
}
```

Nó khóa cả hai chiều. Chiều `override` bắt lỗi khi cha **không có** method đó; chiều `noImplicitOverride` bắt lỗi khi bạn đang ghi đè mà **quên khai báo**.

Khi ai đó rename method ở lớp cha (`speak` → `makeSound`), lớp con vẫn giữ `override speak()` — và vì `Animal` không còn `speak` nữa, TS báo lỗi ngay tại lớp con. Không có cờ này, lớp con lặng lẽ trở thành một method thừa không bao giờ được gọi, còn `makeSound` của cha chạy với hành vi mặc định.

Đây là một trong các flag "siêu strict" rất đáng bật với codebase có nhiều tầng kế thừa.

</details>

**5. Trong một nhóm overload, vì sao implementation signature không gọi được từ bên ngoài? Sai lầm phổ biến nào sinh ra từ hiểu nhầm này?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì đó là thiết kế có chủ đích của TypeScript: implementation signature chỉ phục vụ **việc kiểm tra thân hàm**, không phải là một lựa chọn công khai. Khi có ít nhất một overload signature, chỉ các overload đó lọt vào API nhìn thấy được.

```ts
function parse(input: string): string;
function parse(input: number): number;
function parse(input: string | number): string | number { return input; }

parse("x");        // OK
parse(true);       // Error
parse(Math.random() > 0.5 ? "a" : 1);
// Error: No overload matches this call — dù implementation nhận union!
```

Sai lầm phổ biến nhất: viết implementation với kiểu rất rộng (`any`, hoặc union) rồi **tưởng rằng caller cũng truyền được kiểu đó**. Thực tế union không khớp overload nào cả, vì mỗi overload chỉ nhận đúng một nhánh. Muốn cho phép, phải khai báo thêm một overload nhận union tường minh.

Sai lầm thứ hai: đặt `any` ở implementation rồi quên rằng TS **không kiểm tra** xem thân hàm có thực sự thỏa mãn từng overload hay không — kiểu trả về sai vẫn lọt.

</details>

**6. TypeScript chọn overload theo thứ tự nào khi nhiều signature cùng khớp? Vì sao nên đặt signature hẹp trước signature rộng?**

<details className="qa">
<summary>Xem đáp án</summary>

TS duyệt các overload **theo đúng thứ tự khai báo, từ trên xuống**, và dùng **cái đầu tiên khớp** — không có khái niệm "chọn cái khớp tốt nhất" như Java/C#.

Hệ quả: nếu đặt signature rộng lên trước, nó "nuốt" hết mọi lời gọi và các signature hẹp phía dưới trở nên vô dụng:

```ts
// SAI thứ tự
function get(id: any): unknown;
function get(id: number): User;
function get(id: any): any { return null; }

get(1); // kiểu trả về: unknown — signature số 2 không bao giờ được chọn

// ĐÚNG: hẹp trước, rộng sau
function get2(id: number): User;
function get2(id: any): unknown;
function get2(id: any): any { return null; }

get2(1); // kiểu trả về: User
```

Vì vậy quy tắc là **hẹp/cụ thể trước, rộng/tổng quát sau**. Điều này cũng áp dụng cho các signature trong `.d.ts` của thư viện. Một mẹo kèm theo: khi thấy `No overload matches this call`, hãy đọc lỗi từ overload cuối cùng trở lên, vì TS thường báo chi tiết theo overload gần khớp nhất.

</details>

**7. Khi override, khi nào bắt buộc gọi `super.method()` và khi nào cố ý bỏ qua? Hệ quả của mỗi lựa chọn?**

<details className="qa">
<summary>Xem đáp án</summary>

TypeScript **không bắt buộc** gọi `super.method()` — đó là quyết định thiết kế của bạn (khác với `super()` trong constructor, vốn bắt buộc).

**Gọi `super.method()` khi muốn *mở rộng*** — giữ nguyên hành vi cha rồi thêm phần của mình:

```ts
class Puppy extends Dog {
  override speak(): string {
    return super.speak() + " (yếu)"; // "Woof! (yếu)"
  }
}
```

Bắt buộc về mặt thực tế khi cha làm việc gì đó không thể bỏ qua: dọn tài nguyên, đăng ký event, cập nhật state nội bộ, hook lifecycle của framework (`componentWillUnmount`, `ngOnDestroy`). Quên gọi là rò rỉ bộ nhớ hoặc state hỏng.

**Bỏ qua khi muốn *thay thế hoàn toàn*** — cài đặt của cha không còn đúng với lớp con (ví dụ cha có bản mặc định vô nghĩa, hoặc bạn đổi thuật toán).

Hệ quả cần cân nhắc: gọi `super` tạo **coupling** với chi tiết của cha (đổi cha là con bị ảnh hưởng); bỏ qua thì con phải tự chịu trách nhiệm toàn bộ, dễ bỏ sót phần hạ tầng mà cha vốn lo giúp.

</details>

**8. Method ở lớp con phải tương thích kiểu với lớp cha ra sao? Giải thích covariance của kiểu trả về và vì sao TS xử lý tham số của method theo kiểu bivariant.**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc chung: kiểu của lớp con phải **gán được** cho kiểu của lớp cha, để mọi nơi dùng cha đều thay bằng con được.

**Kiểu trả về là covariant** — con được phép trả về kiểu **hẹp hơn** (subtype), không được rộng hơn:

```ts
class Animal {
  reproduce(): Animal { return new Animal(); }
}
class Dog extends Animal {
  override reproduce(): Dog { return new Dog(); }   // OK — Dog là Animal
  // override reproduce(): object { ... }            // Error — rộng hơn
}
```

Hợp lý vì caller mong nhận `Animal`; nhận về `Dog` vẫn thỏa mãn.

**Tham số thì TS xử lý bivariant** (chấp nhận cả hẹp hơn lẫn rộng hơn). Về lý thuyết, an toàn tuyệt đối đòi hỏi tham số phải **contravariant** (chỉ được rộng hơn). Nhưng TS chọn nới lỏng vì lý do thực dụng: rất nhiều pattern quen thuộc trong JS/DOM sẽ không compile nếu áp dụng chặt — điển hình là mảng và các handler event, nơi lớp con thường muốn thu hẹp tham số. Đây là một **lỗ hổng an toàn kiểu có chủ ý** (unsoundness) mà TS chấp nhận để đổi lấy tính khả dụng.

</details>

**9. Cờ `strictFunctionTypes` ảnh hưởng thế nào đến kiểm tra tham số khi override — vì sao method viết dạng shorthand và dạng property arrow function lại bị check khác nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

`strictFunctionTypes` bật kiểm tra tham số theo kiểu **contravariant** (chặt chẽ, đúng lý thuyết) thay vì bivariant. Nhưng nó **cố ý loại trừ method viết dạng shorthand** — chỉ áp dụng cho kiểu hàm khai báo dạng property:

```ts
class Base {
  handle(e: Event): void {}                 // method shorthand
  onEvent: (e: Event) => void = () => {};   // property kiểu hàm
}

class Child extends Base {
  override handle(e: MouseEvent): void {}   // OK — method vẫn bivariant
  override onEvent = (e: MouseEvent) => {}; // Error khi strictFunctionTypes bật
}
```

Lý do của sự bất đối xứng này: nếu áp dụng chặt cho method, hàng loạt API sẵn có sẽ vỡ — `Array<T>` với `push`/`concat`, các interface DOM, và vô số pattern kế thừa quen thuộc trong hệ sinh thái. TS đánh đổi: giữ method ở chế độ dễ dãi để tương thích ngược, còn với kiểu hàm tường minh (property, type alias, callback parameter) thì kiểm tra đúng lý thuyết.

Rút ra: muốn an toàn kiểu tối đa cho callback, hãy khai báo nó dưới dạng **property kiểu hàm** thay vì method.

</details>

**10. Constructor overloading được viết thế nào trong TS? Vì sao nhiều người khuyên thay bằng static factory method?**

<details className="qa">
<summary>Xem đáp án</summary>

Viết y như function overload: các chữ ký constructor không thân, rồi một cài đặt đủ rộng:

```ts
class Point {
  x: number;
  y: number;

  constructor(x: number, y: number);
  constructor(coord: [number, number]);
  constructor(a: number | [number, number], b?: number) {
    if (typeof a === "number") { this.x = a; this.y = b!; }
    else { this.x = a[0]; this.y = a[1]; }
  }
}
```

Vì sao nên thay bằng static factory:

```ts
class Point2 {
  private constructor(public x: number, public y: number) {}
  static fromXY(x: number, y: number) { return new Point2(x, y); }
  static fromTuple(t: [number, number]) { return new Point2(t[0], t[1]); }
}
```

- **Mỗi cách tạo có tên rõ nghĩa** — đọc `Point.fromTuple([3,4])` hiểu ngay, không phải đoán overload nào đang chạy.
- Không cần chuỗi `typeof`/`Array.isArray` rối rắm, mỗi factory làm đúng một việc nên **dễ test**.
- Factory được phép **trả về `null`/cached instance/subclass**, còn constructor thì luôn phải trả về instance mới.
- Thêm cách khởi tạo mới không đụng vào code cũ.

Đây là pattern được khuyến khích trong codebase domain-driven.

</details>

**11. So sánh ba cách xử lý "một hàm nhận nhiều dạng tham số": overload signature, generic, và union + type guard. Khi nào chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Cách | Phù hợp khi | Điểm yếu |
|---|---|---|
| **Overload signature** | Các dạng input **rời rạc** và kiểu trả về **khác hẳn nhau**, không liên hệ được bằng biến kiểu | Nhiều code, implementation không được kiểm tra chặt, thứ tự signature dễ sai |
| **Generic** | Kiểu trả về **phụ thuộc** kiểu đầu vào theo một quan hệ chung (`(a: T) => T`) | Không diễn tả được khi quan hệ giữa các case hoàn toàn không đồng dạng |
| **Union + type guard** | Cùng một kiểu trả về, chỉ khác cách xử lý đầu vào | Kiểu trả về bị "gộp" thành union, caller phải tự thu hẹp |

```ts
// Generic — gọn hơn overload khi quan hệ đồng dạng
add<T extends number | string>(a: T, b: T): T;

// Union + guard — khi trả về cùng kiểu
function len(x: string | unknown[]): number {
  return typeof x === "string" ? x.length : x.length;
}
```

Thứ tự ưu tiên thực dụng: thử **generic** trước, rồi **union + type guard**, cuối cùng mới đến **overload**. Overload chỉ thực sự cần khi kiểu trả về không thể biểu diễn bằng một biến kiểu chung — ví dụ `parse(s: string): string` và `parse(n: number): Date`.

</details>

**12. Có overload được một property kiểu arrow function không? Khác gì so với overload method thường?**

<details className="qa">
<summary>Xem đáp án</summary>

Không dùng được cú pháp overload (khai báo nhiều chữ ký rồi một cài đặt) cho property — cú pháp đó chỉ áp dụng cho khai báo `function` và cho **method** trong class/interface. Với property kiểu hàm, bạn phải mô tả nhiều **call signature** trong kiểu của nó:

```ts
// Cách 1 — interface có nhiều call signature
interface Add {
  (a: number, b: number): number;
  (a: string, b: string): string;
}

class Calculator {
  add: Add = (a: any, b: any): any => a + b;
}

// Cách 2 — intersection các kiểu hàm
type Add2 = ((a: number, b: number) => number) & ((a: string, b: string) => string);
```

Khác biệt so với overload method thường:

- Method overload **nằm trên prototype**, dùng chung cho mọi instance; property arrow function được tạo **riêng cho từng instance** (tốn bộ nhớ hơn nhưng `this` gắn cố định).
- Với property, bạn thường phải ép kiểu (`as any`) ở phần cài đặt vì TS không tự kiểm tra thân hàm với từng call signature.
- Property kiểu hàm chịu kiểm tra `strictFunctionTypes`, còn method thì không.

</details>

**13. Overload sinh ra code JavaScript gì sau khi biên dịch? Có chi phí runtime nào không?**

<details className="qa">
<summary>Xem đáp án</summary>

Các overload signature **hoàn toàn biến mất** — chúng chỉ là khai báo kiểu. JS đầu ra chỉ còn đúng phần cài đặt:

```ts
// TypeScript
function parse(input: string): string;
function parse(input: number): number;
function parse(input: string | number): string | number { return input; }
```

```js
// JavaScript sau khi biên dịch
function parse(input) { return input; }
```

Vậy bản thân overload **không tốn gì lúc runtime** — không sinh bảng phân giải, không kiểm tra kiểu, không thêm byte nào ngoài hàm cài đặt.

Nhưng có hai chi phí gián tiếp cần nhớ:

- **Chi phí bạn tự viết**: logic phân nhánh `typeof`/`Array.isArray` trong thân hàm là code thật, chạy thật. Nhiều case thì vừa tốn vừa khó đọc.
- **Chi phí compile**: nhiều nhóm overload lớn làm việc phân giải lời gọi của TS chậm hơn, và thông báo lỗi `No overload matches this call` dài, khó đọc.

Đây cũng là một lý do nữa để ưu tiên generic khi có thể.

</details>

**14. Nếu lớp con override một method nhưng khai báo ít tham số hơn lớp cha, TS có báo lỗi không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không báo lỗi** — đây là trường hợp hợp lệ:

```ts
class Base {
  log(msg: string, level: number): void {}
}

class Child extends Base {
  override log(msg: string): void {}  // OK — bỏ bớt tham số
  // override log(m: string, l: number, extra: boolean): void {} // Error — thừa
}
```

Lý do bắt nguồn từ ngữ nghĩa của JavaScript: hàm **bỏ qua đối số thừa** một cách an toàn. Một hàm nhận ít tham số hơn vẫn thay thế được hàm nhận nhiều tham số, vì caller cứ truyền đủ còn hàm chỉ dùng phần nó quan tâm. Quy tắc này của TS chính là thứ khiến `[1,2,3].map(x => x * 2)` compile được dù `map` truyền tới ba đối số (`value`, `index`, `array`).

Chiều ngược lại thì **lỗi**: con khai báo nhiều tham số bắt buộc hơn cha, vì caller theo kiểu cha sẽ không truyền đủ và các tham số thừa sẽ là `undefined`. Muốn thêm thì phải để chúng optional.

</details>

**15. `abstract` method liên quan thế nào tới overriding? Điều gì xảy ra nếu lớp con không cài đặt method `abstract`?**

<details className="qa">
<summary>Xem đáp án</summary>

`abstract` method là **overriding ở dạng bắt buộc**: lớp cha chỉ khai báo chữ ký, không có thân, và mọi lớp con cụ thể **phải** cài đặt. Khác với override thông thường — nơi lớp cha đã có sẵn một bản mặc định và con được quyền dùng lại.

```ts
abstract class Shape {
  abstract area(): number;   // con bắt buộc cài đặt
  describe() { return `Diện tích: ${this.area()}`; }
}

class Circle extends Shape {} // Error: Non-abstract class 'Circle' does not
                              // implement inherited abstract member 'area'
```

Nếu lớp con không cài đặt, compiler báo lỗi **ngay lúc compile**. Chỉ có một lối thoát hợp lệ: khai báo lớp con **cũng là `abstract`**, đẩy nghĩa vụ xuống tầng tiếp theo.

Hai lưu ý liên quan tới overriding: khi cài đặt một abstract method, `noImplicitOverride` vẫn yêu cầu viết `override`; và không gọi được `super.area()` vì bản của cha không có thân. Đây chính là nền tảng của **template method pattern** — cha giữ flow (`describe`), con điền chỗ trống (`area`).

</details>

**16. Với `private` và `protected`, lớp con có override được không? Quy tắc về khả năng truy cập khi override là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`private`: không override được.** Lớp con không nhìn thấy member đó; khai báo lại cùng tên là lỗi `Types have separate declarations of a private property`.
- **`protected`: override được** bình thường, và gọi được `super.method()`.
- **`public`: override được**, đây là trường hợp thông dụng nhất.

Quy tắc chung về khả năng truy cập: lớp con **được nới rộng, không được thu hẹp**.

```ts
class Base {
  protected run() {}
  public start() {}
}

class Child extends Base {
  override run() {}             // protected → public: OK (nới rộng)
  // protected override start() {} // public → protected: Error (thu hẹp)
}
```

Lý do: mọi nơi đang dùng `Base` phải thay bằng `Child` được; nếu con thu hẹp truy cập thì code gọi `base.start()` sẽ hỏng khi nhận về một `Child`.

Rút ra khi thiết kế base class: cái gì muốn lớp con tùy biến thì để `protected` (hoặc `abstract`); cái gì là chi tiết nội bộ mà bạn muốn tự do sửa về sau thì để `private` — đó cũng là cách tránh **fragile base class**.

</details>
