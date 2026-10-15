---
sidebar_position: 1
title: "1. Giới thiệu"
---

# 1. Giới thiệu

## 1. JavaScript là gì?

Bài học: [1. JavaScript là gì?](../../javascript/01-gioi-thieu/1_javascript-la-gi.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. JavaScript là gì? Nó khác gì so với Java — vì sao hai ngôn ngữ lại trùng tên?**

<details className="qa">
<summary>Xem đáp án</summary>

**JavaScript** là ngôn ngữ lập trình thông dịch, kiểu động (dynamic typing), đa mô hình (hỗ trợ lập trình hàm, hướng đối tượng theo prototype, hướng sự kiện), ban đầu được tạo ra để chạy trong trình duyệt nhằm làm trang web có tính tương tác. Ngày nay JS chạy được cả ngoài trình duyệt (Node.js, Deno, Bun) — từ server, CLI tool đến ứng dụng desktop/mobile.

**Khác biệt với Java:**

| Tiêu chí | Java | JavaScript |
|---|---|---|
| Kiểu dữ liệu | Static typing, kiểm tra lúc compile | Dynamic typing, kiểm tra lúc runtime |
| Thực thi | Biên dịch ra bytecode, chạy trên JVM | Thông dịch + JIT compile trong engine |
| OOP | Class-based thuần | Prototype-based (class ES6 chỉ là syntax sugar) |
| Threading | Multi-threaded | Single-threaded (kèm event loop) |
| Môi trường gốc | Ứng dụng doanh nghiệp, Android | Trình duyệt web |

**Vì sao trùng tên?** Thuần túy là **chiêu marketing**. Năm 1995, Brendan Eich tạo ra ngôn ngữ này tại Netscape trong ~10 ngày, ban đầu tên là *Mocha*, rồi *LiveScript*. Thời điểm đó Java của Sun Microsystems đang là hiện tượng, Netscape và Sun có thỏa thuận hợp tác, nên LiveScript được đổi tên thành **JavaScript** để "ăn theo" độ hot của Java. Về kỹ thuật, hai ngôn ngữ gần như không liên quan — câu nói kinh điển: *"Java và JavaScript giống nhau như Car và Carpet"*.

</details>

**2. Ba trụ cột `HTML`, `CSS`, `JavaScript` đảm nhiệm vai trò gì trong một trang web? Nếu tắt JS thì trang còn hoạt động được không?**

<details className="qa">
<summary>Xem đáp án</summary>

Ẩn dụ phổ biến — một trang web như một ngôi nhà (hoặc cơ thể người):

- **HTML** — *cấu trúc / bộ xương*: định nghĩa nội dung và ngữ nghĩa (đây là tiêu đề, đây là đoạn văn, đây là nút bấm, form, ảnh...).
- **CSS** — *trình bày / da và quần áo*: quyết định mọi thứ trông như thế nào — màu sắc, font, layout, animation, responsive.
- **JavaScript** — *hành vi / cơ bắp và não*: xử lý tương tác — click, nhập liệu, gọi API lấy dữ liệu, cập nhật nội dung không cần reload trang.

**Tắt JS thì trang còn chạy không?** Tùy trang:

- **Trang tĩnh / server-rendered truyền thống** (blog, báo, trang tài liệu): vẫn hoạt động gần như bình thường — đọc nội dung, click link, submit form HTML thuần đều được. HTML và CSS không phụ thuộc JS.
- **SPA (Single Page Application)** viết bằng React/Vue/Angular render hoàn toàn ở client: tắt JS là **trang trắng tinh**, vì toàn bộ DOM do JS tạo ra. Đây là lý do các framework hiện đại (Next.js, Nuxt, Remix...) quay lại SSR/SSG — vừa tốt cho SEO, vừa có nội dung hiển thị ngay cả khi JS chưa load xong hoặc bị lỗi.
- Nguyên tắc thiết kế liên quan: **progressive enhancement** — trang phải dùng được ở mức cơ bản với HTML/CSS, JS chỉ *nâng cấp* trải nghiệm chứ không phải điều kiện sống còn.

</details>

**3. Phân biệt ngôn ngữ thông dịch (interpret) và biên dịch (compile). JavaScript thuộc loại nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Biên dịch (compiled):** toàn bộ source code được dịch **một lần, trước khi chạy** thành mã máy (hoặc bytecode) bởi compiler. Lỗi cú pháp/kiểu được bắt ngay lúc compile. Chạy nhanh vì CPU thực thi trực tiếp mã đã dịch. Ví dụ: C, C++, Rust, Go.

**Thông dịch (interpreted):** code được đọc và thực thi **từng dòng lúc runtime** bởi interpreter, không có bước dịch trước. Linh hoạt, chạy ngay không cần build, nhưng chậm hơn vì phải "vừa đọc vừa chạy". Ví dụ: Python (cổ điển), Ruby, PHP (đời đầu), Bash.

**JavaScript thuộc loại nào?** Câu trả lời hiện đại: **cả hai — JIT (Just-In-Time) compiled**.

- Về *phân loại lịch sử*, JS là ngôn ngữ thông dịch: không có bước compile riêng, đưa file .js cho trình duyệt là chạy.
- Nhưng engine hiện đại (V8, SpiderMonkey, JavaScriptCore) **không thông dịch thuần túy**: chúng parse code, chạy qua interpreter để khởi động nhanh, đồng thời theo dõi đoạn code nào chạy nhiều ("hot code") rồi **biên dịch đoạn đó thành mã máy tối ưu ngay trong lúc chương trình đang chạy**.

Nói ngắn gọn: JS là ngôn ngữ thông dịch về mặt trải nghiệm lập trình, nhưng được JIT-compile về mặt thực thi.

</details>

**4. `Engine` JavaScript là gì? Kể tên engine của Chrome, Firefox, Safari và Node.js.**

<details className="qa">
<summary>Xem đáp án</summary>

**JavaScript engine** là chương trình nhận vào source code JS và thực thi nó — đảm nhiệm parse, biên dịch, tối ưu, quản lý bộ nhớ (heap, garbage collection) và call stack. Engine chỉ hiểu JS thuần theo chuẩn ECMAScript, không biết gì về DOM hay HTTP.

| Môi trường | Engine | Ghi chú |
|---|---|---|
| Chrome (và Edge, Opera, Brave) | **V8** | Viết bằng C++, do Google phát triển |
| Firefox | **SpiderMonkey** | Engine JS đầu tiên trong lịch sử, do chính Brendan Eich viết |
| Safari | **JavaScriptCore** (còn gọi Nitro) | Do Apple phát triển, thuộc WebKit |
| Node.js | **V8** | Node = V8 + libuv + các API hệ thống; Deno cũng dùng V8, còn Bun dùng JavaScriptCore |

</details>

**5. Mô tả đường đi của một đoạn code JS từ lúc bạn viết cho tới khi CPU thực thi.**

<details className="qa">
<summary>Xem đáp án</summary>

Lấy V8 làm ví dụ, pipeline như sau:

```
Source code (.js)
   │
   ▼
1. Parser ──► tách token (lexical analysis), phân tích cú pháp
   │
   ▼
2. AST (Abstract Syntax Tree) — cây cú pháp trừu tượng
   │
   ▼
3. Interpreter (Ignition) ──► sinh bytecode và thực thi ngay
   │            │
   │            └── vừa chạy vừa thu thập profiling data
   │                (hàm nào gọi nhiều? tham số kiểu gì?)
   ▼
4. Hot code ──► Optimizing compiler (TurboFan)
   │            biên dịch bytecode → mã máy tối ưu
   ▼
5. Machine code ──► CPU thực thi trực tiếp
   
   (nếu giả định tối ưu sai ──► Deoptimization: quay về bytecode)
```

Diễn giải từng bước:

1. **Parsing**: engine đọc chuỗi ký tự, tách thành token (`const`, `x`, `=`, `5`...), rồi dựng **AST** — cấu trúc cây biểu diễn ngữ pháp của chương trình. Sai cú pháp thì dừng tại đây (SyntaxError).
2. **Sinh bytecode**: interpreter (Ignition trong V8) duyệt AST và sinh **bytecode** — dạng mã trung gian gọn nhẹ, rồi thực thi ngay. Nhờ vậy code khởi chạy nhanh, không phải chờ biên dịch toàn bộ.
3. **Profiling**: trong lúc chạy, engine ghi nhận thống kê — hàm nào được gọi lặp lại nhiều lần, biến nào luôn mang kiểu gì.
4. **Tối ưu hóa (JIT)**: đoạn code "nóng" được TurboFan biên dịch thành **mã máy** tối ưu dựa trên các giả định từ profiling (ví dụ: "tham số `x` luôn là số nguyên").
5. **CPU thực thi** mã máy đó. Nếu giả định bị phá vỡ, engine **deoptimize** — vứt mã máy, quay về chạy bytecode.

</details>

**6. `JIT compilation` là gì? Mô tả vai trò của `Parser`, `AST`, `Interpreter` (Ignition) và `Optimizer` (TurboFan) trong V8.**

<details className="qa">
<summary>Xem đáp án</summary>

**JIT (Just-In-Time) compilation** là kỹ thuật biên dịch code thành mã máy **ngay trong lúc chương trình đang chạy**, thay vì biên dịch trước (AOT — Ahead-Of-Time) hoặc thông dịch thuần. Nó kết hợp ưu điểm của cả hai: khởi động nhanh như interpreter, tốc độ thực thi tiệm cận compiled code cho những đoạn chạy nhiều.

Vai trò từng thành phần trong V8:

- **Parser**: đọc source code, kiểm tra cú pháp, sinh ra AST. V8 còn dùng *lazy parsing* — chỉ parse đầy đủ hàm khi hàm đó thực sự được gọi, để tăng tốc khởi động.
- **AST (Abstract Syntax Tree)**: cấu trúc dữ liệu dạng cây biểu diễn chương trình. Ví dụ `const x = 1 + 2` thành cây có node `VariableDeclaration` chứa node `BinaryExpression(+)` với hai node con `1` và `2`. AST là đầu vào cho bước sinh bytecode.
- **Ignition (Interpreter)**: chuyển AST thành **bytecode** và thực thi. Bytecode chiếm ít bộ nhớ hơn mã máy rất nhiều — quan trọng với thiết bị di động. Ignition đồng thời thu thập **type feedback** (thông tin kiểu thực tế lúc runtime) làm nguyên liệu cho bước tối ưu.
- **TurboFan (Optimizing compiler)**: nhận bytecode + type feedback của các hàm "nóng", áp dụng các kỹ thuật tối ưu (inlining, loại bỏ dead code, speculative optimization — tối ưu dựa trên giả định về kiểu) để sinh **mã máy** hiệu năng cao.

Hai thành phần này tạo thành vòng lặp: Ignition chạy mọi thứ trước, TurboFan tối ưu phần nóng, và nếu giả định sai thì code rơi ngược về Ignition (deopt). *(Các bản V8 gần đây còn chèn thêm tầng trung gian như Sparkplug, Maglev giữa Ignition và TurboFan để cân bằng tốc độ biên dịch và chất lượng mã, nhưng mô hình Ignition–TurboFan vẫn là khung chính để hiểu.)*

</details>

**7. `Deoptimization` xảy ra khi nào? Cho ví dụ code khiến engine phải deopt.**

<details className="qa">
<summary>Xem đáp án</summary>

**Deoptimization (deopt)** xảy ra khi mã máy đã tối ưu được TurboFan sinh ra dựa trên một **giả định**, và giả định đó **bị phá vỡ** lúc runtime. Engine buộc phải vứt bỏ mã tối ưu và quay về thực thi bytecode qua interpreter — gây tụt hiệu năng đột ngột.

**Ví dụ 1 — thay đổi kiểu tham số:**

```js
function add(a, b) {
  return a + b;
}

// Gọi hàng nghìn lần với số → engine tối ưu add()
// với giả định "a và b luôn là small integer"
for (let i = 0; i < 100000; i++) {
  add(i, i + 1);
}

add("hello", "world"); // 💥 giả định vỡ → DEOPT
// phép + giữa string khác hoàn toàn phép + giữa số
```

**Ví dụ 2 — thay đổi "hình dạng" object (hidden class):**

```js
function getX(point) {
  return point.x;
}

const p1 = { x: 1, y: 2 };
for (let i = 0; i < 100000; i++) getX(p1); // tối ưu theo shape {x, y}

const p2 = { y: 2, x: 1 };      // thứ tự property khác → shape khác
const p3 = { x: 1, y: 2, z: 3 }; // thêm property → shape khác
getX(p2); // inline cache miss
getX(p3); // nhiều shape quá → hàm thành "megamorphic", có thể deopt
```

**Ví dụ 3 — mảng "có lỗ" hoặc trộn kiểu phần tử:**

```js
const arr = [1, 2, 3, 4];   // engine lưu dạng packed small integers — rất nhanh
arr[10] = 5;                 // tạo "lỗ" (holes) → chuyển sang dạng chậm hơn
arr.push(3.14);              // trộn int với double → đổi kiểu lưu trữ
arr.push("x");               // trộn thêm string → rơi về dạng generic chậm nhất
```

</details>

**8. Vì sao nói "JavaScript chậm" là quan điểm lỗi thời? Những yếu tố nào trong cách viết code ảnh hưởng tới việc engine tối ưu được hay không?**

<details className="qa">
<summary>Xem đáp án</summary>

**Vì sao lỗi thời:** định kiến "JS chậm" hình thành từ thời 2000s, khi JS chạy bằng interpreter thuần túy. Bước ngoặt là năm 2008 khi Google ra mắt **V8** cùng Chrome, mở màn "cuộc chạy đua vũ trang" giữa các engine. Với JIT compilation, hidden classes, inline caching..., JS ngày nay ở các benchmark tính toán thuần có thể đạt hiệu năng trong tầm vài lần so với C — đủ nhanh để chạy server quy mô lớn (Node.js tại Netflix, PayPal), game engine, thậm chí là compiler (TypeScript compiler viết bằng chính TS/JS suốt nhiều năm). Điều làm web app "cảm giác chậm" ngày nay thường là DOM, network, bundle size — chứ hiếm khi là tốc độ thực thi JS thuần.

**Nhưng** hiệu năng đó có điều kiện: engine chỉ tối ưu tốt khi code **dễ đoán**. Những yếu tố ảnh hưởng:

1. **Tính ổn định của kiểu (monomorphism)**: hàm luôn nhận cùng kiểu tham số thì được tối ưu sâu; hàm nhận lung tung kiểu (polymorphic/megamorphic) thì không.
2. **Hình dạng object nhất quán**: khởi tạo object với đầy đủ property, cùng thứ tự (tốt nhất là qua constructor/class). Tránh thêm/xóa property động (`delete obj.x`) sau khi tạo.
3. **Mảng đồng nhất, không lỗ**: giữ mảng chứa một kiểu phần tử, index liên tục, dùng `push` thay vì gán vượt độ dài.
4. **Tránh các "optimization killer" cổ điển**: `eval`, `with`, `arguments` dùng sai cách, `try/catch` bọc hot loop (với engine đời cũ), thay đổi prototype của object đang sống.
5. **Hàm nhỏ, làm một việc**: dễ được inline hơn hàm dài trăm dòng.

Tóm lại: JS không chậm — **JS viết kiểu "khó đoán" mới chậm**, vì nó tước đi khả năng speculative optimization của engine.

</details>

**9. `Dynamic typing` nghĩa là gì? Ưu và nhược điểm so với `static typing`? Điều này liên quan gì đến việc TypeScript ra đời?**

<details className="qa">
<summary>Xem đáp án</summary>

**Dynamic typing**: kiểu dữ liệu gắn với **giá trị lúc runtime**, không gắn với biến lúc khai báo. Một biến có thể lần lượt chứa số, chuỗi, object mà không báo lỗi:

```js
let x = 42;       // number
x = "hello";      // string — hoàn toàn hợp lệ
x = { a: 1 };     // object — vẫn ok
```

**Static typing** (Java, C#, Rust...): kiểu được khai báo (hoặc suy luận) và **kiểm tra lúc compile** — gán sai kiểu là không build được.

| | Dynamic typing | Static typing |
|---|---|---|
| **Ưu** | Viết nhanh, ít boilerplate, prototype linh hoạt, dễ học ban đầu | Bắt lỗi sớm (trước khi chạy), IDE autocomplete/refactor chính xác, code tự tài liệu hóa, an toàn khi codebase lớn |
| **Nhược** | Lỗi kiểu chỉ lộ lúc runtime (`undefined is not a function` trên production), refactor rủi ro, khó nắm hợp đồng dữ liệu giữa các module, engine khó tối ưu | Viết dài hơn, cứng nhắc hơn, cần bước compile |

**Liên hệ với TypeScript:** khi JS vượt khỏi vai trò "script vài chục dòng" để thành ngôn ngữ xây ứng dụng hàng trăm nghìn dòng với hàng chục dev, nhược điểm của dynamic typing trở nên đắt đỏ — lỗi kiểu lọt ra production, refactor như đi trên băng mỏng. **TypeScript (Microsoft, 2012)** ra đời để giải đúng bài toán này: thêm **lớp static typing tùy chọn** lên trên JS. TS kiểm tra kiểu lúc compile rồi biên dịch (đúng hơn là *transpile*, gần đây chủ yếu là *strip types*) về JS thuần — runtime vẫn là JS dynamic typing, nhưng developer được hưởng an toàn kiểu và tooling của static typing trong lúc viết code. Đó là lý do TS thống trị các codebase lớn hiện nay.

</details>

**10. JavaScript là `single-threaded` — vậy làm sao nó xử lý được nhiều tác vụ bất đồng bộ cùng lúc (gọi API, `setTimeout`...)?**

<details className="qa">
<summary>Xem đáp án</summary>

JS chỉ có **một call stack** — tại một thời điểm chỉ thực thi một đoạn code. Bí quyết nằm ở chỗ: **những việc chờ đợi (I/O) không do thread JS làm**, mà được giao cho **runtime** (trình duyệt hoặc Node.js), phối hợp qua **event loop**.

Các thành phần:

- **Call stack**: nơi code JS thực thi tuần tự.
- **Web APIs / libuv**: trình duyệt (hoặc Node) nhận các tác vụ như `setTimeout`, `fetch`, đọc file... và xử lý **ở bên ngoài thread JS** (bằng cơ chế riêng của hệ điều hành, thread pool...).
- **Callback queue (macrotask)** và **microtask queue** (Promise callbacks): khi tác vụ bên ngoài xong, callback được xếp vào hàng đợi.
- **Event loop**: vòng lặp liên tục kiểm tra — *"call stack rỗng chưa? rỗng rồi thì lấy task tiếp theo trong queue đẩy vào stack"*. Microtask queue luôn được xử lý cạn trước khi lấy macrotask tiếp theo.

```js
console.log("1");

setTimeout(() => console.log("2"), 0);   // giao cho Web API, callback vào macrotask queue

Promise.resolve().then(() => console.log("3")); // vào microtask queue

console.log("4");

// Output: 1 → 4 → 3 → 2
// Code đồng bộ chạy hết trước, rồi microtask (3), rồi macrotask (2)
```

Vậy nên chính xác hơn là: JS **thực thi** single-threaded, nhưng **mô hình xử lý là non-blocking, event-driven** — thread duy nhất không bao giờ đứng chờ I/O, nó chỉ đăng ký "khi nào xong thì gọi tôi" rồi làm việc khác. Đó là lý do một server Node.js đơn luồng vẫn phục vụ được hàng nghìn kết nối đồng thời. (Khi thực sự cần tính toán nặng song song, đã có `Web Workers` / `worker_threads` — mỗi worker là một thread với event loop riêng.)

</details>

**11. `First-class functions` nghĩa là gì? Cho ví dụ hàm được gán vào biến, truyền làm tham số và trả về từ hàm khác.**

<details className="qa">
<summary>Xem đáp án</summary>

**First-class functions** (hàm là "công dân hạng nhất") nghĩa là trong JS, **hàm được đối xử như mọi giá trị khác** — number, string, object. Cụ thể, hàm có thể:

**1. Gán vào biến:**

```js
const greet = function (name) {
  return `Xin chào, ${name}!`;
};
const sayHi = greet;      // gán hàm sang biến khác như gán một giá trị
console.log(sayHi("Thuan")); // "Xin chào, Thuan!"
```

**2. Truyền làm tham số (callback):**

```js
function processUser(name, callback) {
  const formatted = name.trim().toLowerCase();
  return callback(formatted);
}

processUser("  THUAN  ", (n) => `user_${n}`); // "user_thuan"

// Đây chính là nền tảng của array methods:
[1, 2, 3].map((x) => x * 2); // [2, 4, 6] — map nhận một hàm làm tham số
```

**3. Trả về từ hàm khác (higher-order function, closure):**

```js
function multiplyBy(factor) {
  return function (x) {
    return x * factor;   // closure: hàm con "nhớ" factor
  };
}

const double = multiplyBy(2);
const triple = multiplyBy(3);
console.log(double(5)); // 10
console.log(triple(5)); // 15
```

Đặc tính này là nền móng cho gần như mọi pattern quan trọng của JS: callback, Promise (`.then(fn)`), event handler (`addEventListener("click", fn)`), middleware trong Express, hooks trong React, currying, function composition...

</details>

**12. JavaScript kế thừa theo `prototype` chứ không phải class truyền thống. `class` trong ES6 thực chất là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Prototype-based inheritance:** trong JS, mỗi object có một liên kết ẩn (`[[Prototype]]`, truy cập qua `Object.getPrototypeOf` hoặc `__proto__`) trỏ tới một object khác. Khi truy cập property không có trên object, engine lần theo **prototype chain** để tìm:

```js
const animal = {
  eat() { console.log("ăn..."); }
};

const dog = Object.create(animal); // dog có prototype là animal
dog.bark = function () { console.log("gâu!"); };

dog.bark(); // "gâu!"  — có sẵn trên dog
dog.eat();  // "ăn..." — không có trên dog → tìm lên prototype chain → thấy ở animal
```

Không có "bản thiết kế" (class) tách rời "thực thể" (instance) như Java — chỉ có **object liên kết với object**.

**`class` trong ES6 thực chất là syntax sugar** — cú pháp đẹp hơn phủ lên đúng cơ chế constructor function + prototype đã tồn tại từ trước:

```js
// Viết bằng class (ES6)
class Dog {
  constructor(name) { this.name = name; }
  bark() { console.log(`${this.name}: gâu!`); }
}

// Gần tương đương với cách viết cũ:
function DogOld(name) { this.name = name; }
DogOld.prototype.bark = function () { console.log(`${this.name}: gâu!`); };

// Bằng chứng:
typeof Dog;                                    // "function" — class vẫn là function!
Dog.prototype.bark;                            // method nằm trên prototype
const d = new Dog("Milu");
Object.getPrototypeOf(d) === Dog.prototype;    // true
```

Nói "chỉ là" sugar cũng không hoàn toàn công bằng — `class` có thêm vài khác biệt thật: bắt buộc gọi bằng `new`, thân class luôn ở strict mode, method không enumerable, hỗ trợ `super`, private fields (`#field`)... Nhưng **mô hình kế thừa bên dưới vẫn 100% là prototype chain**. Hiểu prototype là hiểu được `class` thực sự làm gì — và giải thích được những hành vi "kỳ lạ" như method có thể bị patch lúc runtime (`Dog.prototype.bark = ...` ảnh hưởng mọi instance đang sống).

</details>

**13. Phân biệt `JavaScript engine` và `JavaScript runtime`. Những thứ như `setTimeout`, `document`, `fetch` do engine hay do runtime cung cấp?**

<details className="qa">
<summary>Xem đáp án</summary>

**Engine** = trình thực thi ngôn ngữ JS thuần theo chuẩn **ECMAScript**: parser, JIT compiler, call stack, heap, garbage collector. Engine biết `Object`, `Array`, `Promise`, `Math`, closure, prototype... nhưng **không biết gì** về trang web hay hệ thống file.

**Runtime** = engine **+ môi trường bao quanh nó**: các API bổ sung, event loop, task queues — tức toàn bộ "hệ sinh thái" để JS làm được việc hữu ích trong một ngữ cảnh cụ thể.

```
┌─────────────── Runtime (trình duyệt) ───────────────┐
│  ┌───── Engine (V8) ─────┐   Web APIs:              │
│  │  Call stack           │   - DOM (document)       │
│  │  Heap + GC            │   - setTimeout/Interval  │
│  │  Parser + JIT         │   - fetch / XHR          │
│  │  (ECMAScript thuần)   │   - localStorage, ...    │
│  └───────────────────────┘                          │
│  Event loop + Callback/Microtask queues             │
└─────────────────────────────────────────────────────┘
```

Cùng một engine, khác runtime → khả năng khác nhau: **V8 trong Chrome** có `document`, `window`, `localStorage`; **V8 trong Node.js** không có DOM nhưng có `fs`, `http`, `process`, `require`.

**Trả lời câu hỏi cụ thể:** cả ba đều do **runtime** cung cấp, không phải engine:

| API | Nguồn gốc |
|---|---|
| `setTimeout` | Runtime — Web API của trình duyệt / timer của Node (libuv). Không hề có trong chuẩn ECMAScript |
| `document` | Runtime — DOM API, chỉ trình duyệt có. Node.js không có `document` |
| `fetch` | Runtime — Web API (chuẩn WHATWG, không phải ECMAScript). Node chỉ tích hợp sẵn từ v18 |

Mẹo phân biệt nhanh: mở spec ECMAScript ra — thứ gì có trong đó (`Promise`, `JSON`, `Math`...) là của engine; thứ gì không có (`setTimeout`, `console`*, `document`, `fetch`, `fs`...) là runtime cung cấp. (*`console` phổ biến tới mức tưởng là của JS, nhưng cũng là API của runtime.)

</details>

---

## 2. Lịch sử & các phiên bản JavaScript

Bài học: [2. Lịch sử & các phiên bản JavaScript](../../javascript/01-gioi-thieu/2_lich-su.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Ai tạo ra JavaScript, năm nào, và trong bao lâu? Ngôn ngữ này đã đổi tên qua những giai đoạn nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Brendan Eich** tạo ra JavaScript năm **1995** khi làm việc tại **Netscape**. Ông được giao viết một ngôn ngữ kịch bản cho trình duyệt **Netscape Navigator**, và hoàn thành **prototype đầu tiên chỉ trong 10 ngày**. Lưu ý: 10 ngày là thời gian dựng bản chạy được đầu tiên, ngôn ngữ vẫn được hoàn thiện dần sau đó.

Ngôn ngữ đổi tên qua ba giai đoạn:

- **Mocha** — tên nội bộ ban đầu.
- **LiveScript** — tháng 5/1995.
- **JavaScript** — tháng 12/1995, đổi vì lý do **marketing** để ăn theo độ hot của Java thời điểm đó (Netscape và Sun có thỏa thuận hợp tác).

Chi tiết "10 ngày" thường được hỏi để dẫn sang ý: nhiều điểm kỳ quặc của JS (ép kiểu lỏng lẻo, `typeof null === "object"`...) là di sản của việc thiết kế quá gấp và sau đó không thể sửa vì phải giữ tương thích ngược.

</details>

**2. Phân biệt `ECMAScript` và `JavaScript`. Vì sao chuẩn lại không được đặt tên thẳng là "JavaScript"?**

<details className="qa">
<summary>Xem đáp án</summary>

|          | ECMAScript                                            | JavaScript                                                         |
| -------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| Bản chất | **Chuẩn** (specification) — mô tả ngôn ngữ trên giấy  | **Implementation** — bản triển khai chuẩn đó                       |
| Ai làm   | ECMA International, ủy ban TC39                       | Trình duyệt (V8, SpiderMonkey, JavaScriptCore), Node.js            |
| Nội dung | Cú pháp, kiểu dữ liệu, `Object`, `Promise`, `Math`... | ECMAScript + các API của môi trường (`document`, `fetch`, `fs`...) |

Nói ngắn gọn: ECMAScript là _bản thiết kế_, JavaScript là _sản phẩm chạy được_ dựng theo bản thiết kế đó.

**Vì sao chuẩn không tên là "JavaScript"?** Vì **"JavaScript" là trademark** thuộc về Sun Microsystems (sau này là Oracle), Netscape chỉ được cấp phép sử dụng. Khi năm 1997 Netscape gửi ngôn ngữ lên **ECMA International** để chuẩn hoá, tổ chức này không thể dùng một cái tên đang bị đăng ký bản quyền cho chuẩn mở, nên đặt tên là **ECMAScript**.

</details>

**3. "ES6" và "ES2015" khác nhau ở điểm nào? Vì sao tồn tại hai cách gọi?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không khác gì cả — đó là cùng một phiên bản tiêu chuẩn.** ES6 = ES2015.

Lý do có hai tên: trước năm 2015, ECMAScript được đánh số phiên bản lớn theo thứ tự — ES1 (1997), ES3 (1999), ES5 (2009). Phiên bản thứ 6 được cộng đồng gọi là **ES6** suốt nhiều năm trong lúc nó còn đang soạn thảo (quá trình kéo dài ~6 năm sau ES5).

Đến khi phát hành, TC39 quyết định chuyển sang **đặt tên theo năm phát hành** để nhấn mạnh nhịp release hằng năm mới, nên bản chính thức mang tên **ECMAScript 2015**. Cái tên "ES6" đã quá phổ biến nên vẫn tồn tại song song đến nay.

Từ đó về sau chỉ còn một cách gọi theo năm: ES2016, ES2017, ES2020... (dù thỉnh thoảng vẫn có người gọi ES2016 là "ES7", cách gọi này không được khuyến khích vì dễ gây nhầm).

</details>

**4. "Cuộc chiến trình duyệt" (browser war) là gì? Nó gây ra vấn đề gì cho developer thời đó và dẫn tới hệ quả nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Browser war** là giai đoạn cuối thập niên 1990 khi **Netscape** và **Microsoft** đua giành thị phần trình duyệt bằng cách **tự thêm tính năng riêng** thay vì cùng theo một chuẩn.

Diễn biến: 1995 Netscape Navigator thống trị kèm **JavaScript**; 1996 Microsoft tung **Internet Explorer** kèm **JScript**. Hai hãng liên tục thêm API độc quyền, không quan tâm tương thích.

**Vấn đề với developer:**

- Cùng một đoạn code chạy **khác nhau** hoặc lỗi trên IE và Netscape.
- Phải viết code **rẽ nhánh** theo trình duyệt ("nếu là IE thì..., nếu là Netscape thì...") — tốn công, dễ lỗi.
- Xuất hiện huy hiệu **"Best viewed in Internet Explorer"** — dấu hiệu web bị phân mảnh.

**Hệ quả:** nhu cầu có một **chuẩn chung** trở nên cấp thiết → năm 1997 JS được gửi lên ECMA và chuẩn hoá thành **ECMAScript**. Microsoft thắng cuộc chiến thứ nhất (~95% thị phần đầu 2000s) nhưng IE đứng yên không cải tiến, mở đường cho Firefox (2004) và Chrome (2008) — cuộc chiến trình duyệt lần hai.

</details>

**5. `JScript` là gì và vì sao Microsoft phải đặt tên khác cho bản triển khai của mình?**

<details className="qa">
<summary>Xem đáp án</summary>

**JScript** là bản triển khai ngôn ngữ kịch bản của **Microsoft**, ra mắt năm **1996** cùng **Internet Explorer 3**. Về cơ bản nó là một bản "clone" của JavaScript — cú pháp và ngữ nghĩa tương tự, đủ để chạy phần lớn script viết cho Netscape, nhưng kèm theo các tính năng độc quyền của riêng Microsoft (ví dụ hệ ActiveX, conditional compilation).

**Vì sao phải đặt tên khác?** Vì cái tên **"JavaScript" là trademark** do Sun Microsystems nắm giữ và Netscape được cấp phép sử dụng — Microsoft không có quyền dùng đúng tên đó cho sản phẩm của mình. Giải pháp là reverse-engineer ngôn ngữ rồi gọi nó là **JScript**.

Chính sự tồn tại song song của hai bản triển khai không tương thích hoàn toàn (JavaScript và JScript) là nguyên nhân trực tiếp dẫn tới nhu cầu chuẩn hoá — và ra đời **ECMAScript** năm 1997, cái tên trung lập mà cả hai bên đều tuân theo được.

</details>

**6. Vì sao từ ES2015 trở đi ECMAScript chuyển sang phát hành theo năm thay vì đánh số phiên bản lớn?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì mô hình "big release" quá chậm so với nhu cầu của cộng đồng. Khoảng cách từ **ES5 (2009)** đến **ES6 (2015)** là **6 năm** — trong suốt thời gian đó, mọi tính năng mới đều phải nằm chờ để gom vào một bản phát hành khổng lồ. Hệ quả:

- Một feature đã hoàn thiện sớm vẫn phải chờ nhiều năm mới vào chuẩn.
- Bản phát hành quá lớn → khó review, khó implement, dễ trì hoãn (ES4 thậm chí bị hủy bỏ hoàn toàn vì tham vọng quá lớn).
- Hệ sinh thái JS bùng nổ sau Node.js, nhu cầu tính năng mới tăng nhanh.

Giải pháp của TC39 là **release theo năm**: mỗi năm chốt một bản, tính năng nào đã đạt **Stage 4** trước thời điểm cut-off thì vào bản năm đó, chưa xong thì sang năm sau. Nhờ vậy mỗi bản nhỏ gọn, ổn định, dễ đoán — ES2016 thậm chí chỉ có 2 tính năng (`**` và `Array.prototype.includes`), và điều đó hoàn toàn bình thường.

</details>

**7. `TC39` là tổ chức nào? Mô tả 5 stage của quy trình đề xuất tính năng. Ở stage nào thì một feature bắt đầu được trình duyệt implement?**

<details className="qa">
<summary>Xem đáp án</summary>

**TC39** (Technical Committee 39) là **ủy ban kỹ thuật thuộc ECMA International** chịu trách nhiệm phát triển chuẩn ECMAScript. Thành viên gồm đại diện các hãng trình duyệt (Google, Mozilla, Apple, Microsoft), các công ty lớn và chuyên gia trong cộng đồng.

Một tính năng mới đi qua **5 stage**:

- **Stage 0 — Strawperson**: mới chỉ là ý tưởng.
- **Stage 1 — Proposal**: đã có champion (người trong TC39 đứng ra bảo trợ), mô tả vấn đề và hướng giải quyết.
- **Stage 2 — Draft**: cú pháp và ngữ nghĩa đã ổn định, viết thành đặc tả chính thức.
- **Stage 3 — Candidate**: đặc tả hoàn chỉnh, chuẩn bị merge, chờ phản hồi từ thực tế triển khai.
- **Stage 4 — Finished**: đã có implementation và test, vào spec của bản năm sau.

**Trình duyệt bắt đầu implement từ Stage 3** — đây cũng là lúc Babel/SWC bổ sung hỗ trợ. Vì vậy khi đọc proposal trên `https://github.com/tc39/proposals`, biết stage là biết được tính năng đó đã dùng được trong production hay chưa.

</details>

**8. Kể ra ít nhất 5 tính năng lớn mà ES6 mang lại. Vì sao ES6 được coi là bước ngoặt lớn nhất của ngôn ngữ?**

<details className="qa">
<summary>Xem đáp án</summary>

Các tính năng lớn của **ES6 (2015)**:

- `let`, `const` — khai báo có block scope, thay thế `var`.
- **Arrow function** — cú pháp ngắn và `this` lexical.
- **Template literals** — `` `hello ${name}` ``.
- **Destructuring** — `const { x, y } = obj`.
- **Default / rest / spread parameters**.
- **`class`** — syntax sugar cho constructor function + prototype.
- **`Promise`** — thay thế callback hell.
- **ES Modules** — `import` / `export`.
- **`Map`, `Set`, `Symbol`, `Iterator`**.

**Vì sao là bước ngoặt?** Vì ES6 không chỉ thêm API mà **thay đổi hẳn cách viết JavaScript**. Trước ES6, JS thiếu những thứ cơ bản mà ngôn ngữ nghiêm túc nào cũng có: hệ thống module chuẩn, cơ chế khai báo biến có scope hợp lý, cú pháp lớp, và cách xử lý bất đồng bộ tử tế. ES6 bổ sung đủ cả bốn cùng lúc, biến JS từ "ngôn ngữ script" thành ngôn ngữ đủ sức xây ứng dụng lớn. Đó là lý do ranh giới "pre-ES6 / ES6+" vẫn được nhắc đến đến tận ngày nay.

</details>

**9. Viết lại đoạn code ES5 dùng `var`, `function` và `prototype` sang phong cách ES6 (`const`, arrow function, `class`, template literal).**

<details className="qa">
<summary>Xem đáp án</summary>

**Bản ES5:**

```js
var add = function (a, b) {
  return a + b;
};

var users = [{ name: "An" }, { name: "Bình" }];
var names = users.map(function (u) {
  return u.name;
});

function Person(name) {
  this.name = name;
}
Person.prototype.greet = function () {
  return "Hi " + this.name;
};
```

**Viết lại theo ES6:**

```js
const add = (a, b) => a + b;

const users = [{ name: "An" }, { name: "Bình" }];
const names = users.map((u) => u.name);

class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return `Hi ${this.name}`;
  }
}
```

Bốn thay đổi tương ứng: `var` → `const` (block scope, không bị hoisting kiểu `var`), function expression → **arrow function**, `+` nối chuỗi → **template literal**, và constructor function + `prototype` → **`class`**. Lưu ý `class` chỉ là syntax sugar — cơ chế kế thừa bên dưới vẫn là prototype chain.

</details>

**10. Những tính năng nào xuất hiện ở ES2017, ES2020, ES2021, ES2022? Nêu ít nhất một ví dụ mỗi phiên bản.**

<details className="qa">
<summary>Xem đáp án</summary>

| Phiên bản  | Tính năng nổi bật                                                             |
| ---------- | ----------------------------------------------------------------------------- |
| **ES2017** | `async`/`await`, `Object.entries`, `Object.values`                            |
| **ES2020** | `?.` optional chaining, `??` nullish coalescing, `BigInt`, dynamic `import()` |
| **ES2021** | `String.replaceAll`, logical assignment `??=` `\|\|=` `&&=`                   |
| **ES2022** | Top-level `await`, private field `#field`, `at()`                             |

```js
// ES2017 — async/await
async function loadUser(id) {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}

// ES2020 — optional chaining + nullish coalescing
const city = user?.address?.city;
const port = config.port ?? 3000;

// ES2021 — logical assignment
a ??= b; // a = a ?? b

// ES2022 — top-level await (chỉ trong ES Module)
const data = await fetch("/api").then((r) => r.json());
```

Trong đó `async`/`await` (ES2017) và optional chaining (ES2020) là hai tính năng được dùng nhiều nhất trong code hiện đại.

</details>

**11. Phân biệt `??` (nullish coalescing) và `||`. Với `config.port` bằng `0` thì hai toán tử cho kết quả khác nhau ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Khác biệt nằm ở **điều kiện kích hoạt giá trị fallback**:

- `||` lấy vế phải khi vế trái là **falsy** — tức `false`, `0`, `""`, `null`, `undefined`, `NaN`.
- `??` chỉ lấy vế phải khi vế trái là **`null` hoặc `undefined`** (gọi chung là _nullish_).

```js
const config = { port: 0, name: "" };

config.port || 3000; // 3000  ← 0 là falsy nên bị thay, SAI Ý ĐỊNH
config.port ?? 3000; // 0     ← 0 không phải nullish nên giữ nguyên

config.name || "default"; // "default"
config.name ?? "default"; // ""
```

Với `config.port === 0`, `||` trả về `3000` — một bug kinh điển khi người dùng cố tình đặt cổng `0`, hoặc khi cấu hình có các giá trị hợp lệ là `0`, `""`, `false`. `??` trả về đúng `0`.

Quy tắc thực dụng: dùng `??` cho **giá trị mặc định của cấu hình/tham số**, chỉ dùng `||` khi bạn thực sự muốn thay cả các giá trị falsy khác. Lưu ý `??` không được trộn trực tiếp với `||`/`&&` mà không có ngoặc — sẽ báo `SyntaxError`.

</details>

**12. `Top-level await` là gì? Nó chỉ dùng được trong môi trường nào và vì sao có giới hạn đó?**

<details className="qa">
<summary>Xem đáp án</summary>

**Top-level await** (ES2022) cho phép dùng `await` **ở cấp cao nhất của file**, không cần bọc trong một hàm `async`:

```js
// module.js
const data = await fetch("/api").then((r) => r.json());
export { data };
```

Trước đó phải dùng thủ thuật IIFE async: `(async () => { ... })()`.

**Giới hạn:** chỉ dùng được trong **ES Module** (file `.mjs`, file có `"type": "module"` trong `package.json`, hoặc `<script type="module">`). Trong CommonJS (`require`) và script thường thì không.

**Vì sao?** Vì ES Module có cơ chế nạp **bất đồng bộ và có đồ thị phụ thuộc rõ ràng**: runtime biết module nào phụ thuộc module nào, nên khi một module `await`, nó có thể tạm hoãn việc hoàn tất module đó và các module import nó, rồi tiếp tục khi promise resolve. CommonJS thì `require()` là **đồng bộ** — nó phải trả về `module.exports` ngay lập tức, không có chỗ để chờ. Cho phép top-level await ở đó sẽ phá vỡ ngữ nghĩa của `require`.

</details>

**13. Node.js ra đời năm nào, do ai, dùng engine gì? Vì sao Node.js được coi là bước ngoặt biến JS thành ngôn ngữ fullstack?**

<details className="qa">
<summary>Xem đáp án</summary>

**Node.js** ra đời năm **2009**, do **Ryan Dahl** tạo ra, dùng engine **V8** của Google (chính engine trong Chrome), kết hợp với thư viện **libuv** để xử lý I/O bất đồng bộ và các API hệ thống (`fs`, `http`, `process`).

**Vì sao là bước ngoặt?** Trước Node, JavaScript bị "nhốt" trong trình duyệt — muốn viết backend phải dùng PHP, Java, Ruby, Python. Node đưa JS ra **ngoài trình duyệt**, chạy như một chương trình bình thường:

```bash
node script.js
```

Hệ quả kéo theo:

- **npm** (2010) trở thành package manager lớn nhất thế giới, tạo ra hệ sinh thái thư viện khổng lồ.
- Developer viết được **cả frontend lẫn backend bằng một ngôn ngữ** — chia sẻ code, kiểu dữ liệu, kinh nghiệm; đây chính là nghĩa của "fullstack JavaScript".
- Toàn bộ hệ **build tool** hiện đại (Webpack, Babel, Vite, esbuild...) đều chạy trên Node — nghĩa là cả frontend cũng phụ thuộc vào Node để phát triển.

Ngày nay JS còn vươn sang mobile (React Native), desktop (Electron) và edge computing, nhưng Node là mắt xích đầu tiên mở ra tất cả.

</details>

**14. Trước khi dùng một cú pháp mới trong production, bạn kiểm tra tương thích trình duyệt bằng cách nào? `Babel`/`SWC` giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Cách kiểm tra tương thích:**

- **caniuse.com** — tra cứu nhanh một feature được hỗ trợ từ phiên bản nào của từng trình duyệt, kèm số liệu thị phần.
- **compat-table.github.io** — bảng chi tiết theo từng bản ECMAScript.
- **MDN** — mục "Browser compatibility" cuối mỗi trang tài liệu.
- Với tính năng còn là proposal: tra **stage** trên repo `tc39/proposals` (từ Stage 3 mới nên cân nhắc).

**Babel / SWC giải quyết gì?** Chúng **transpile** code viết bằng cú pháp ES mới về cú pháp cũ hơn (thường là ES5) để chạy được trên trình duyệt cũ — nhờ vậy developer viết code hiện đại mà không phải hy sinh người dùng. SWC làm cùng việc đó nhưng viết bằng Rust nên nhanh hơn nhiều.

```bash
npm install --save-dev @babel/core @babel/preset-env
```

Trong thực tế thường không cấu hình tay: chỉ cần đặt `target` trong `tsconfig.json` hoặc config của Vite/bundler, công cụ sẽ tự lo. Năm 2026, **ES2020 là baseline an toàn** cho mọi trình duyệt hiện đại (IE đã bị khai tử từ 2022).

</details>

**15. `Transpile` khác `compile` và `polyfill` ở chỗ nào? Cho ví dụ thứ mà Babel transpile được nhưng cần polyfill riêng.**

<details className="qa">
<summary>Xem đáp án</summary>

| Khái niệm     | Bản chất                                                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Compile**   | Dịch từ ngôn ngữ **cấp cao xuống cấp thấp hơn** — ví dụ C → mã máy, Java → JVM bytecode                                                |
| **Transpile** | Dịch giữa hai ngôn ngữ/phiên bản **cùng cấp độ trừu tượng** — ES2022 → ES5, TypeScript → JavaScript. Đầu ra vẫn là code người đọc được |
| **Polyfill**  | **Đoạn code bổ sung lúc runtime** để cung cấp một API còn thiếu trong môi trường cũ                                                    |

Điểm mấu chốt: Babel/SWC chỉ xử lý được **cú pháp**, không tạo ra được **API mới**.

- **Transpile được** (cú pháp): arrow function → `function`, `class` → constructor function + prototype, template literal → nối chuỗi, optional chaining `?.` → chuỗi kiểm tra `&&`, destructuring, `let`/`const` → `var`.
- **Cần polyfill** (API mới): `Promise`, `Array.prototype.includes`, `Object.entries`, `String.replaceAll`, `Array.prototype.flat`, `Map`, `Set`, `fetch`.

```js
// Babel tự lo được — chỉ là cú pháp
const nums = [1, 2, 3].map((n) => n * 2);

// Babel KHÔNG tạo ra được — cần polyfill (core-js)
[1, 2, 3].includes(2);
"a-b".replaceAll("-", "+");
```

Trong thực tế, `@babel/preset-env` kết hợp với **core-js** sẽ tự chèn polyfill cần thiết theo danh sách trình duyệt mục tiêu (`useBuiltIns: "usage"`).

</details>

---

## 3. Cách chạy JavaScript

Bài học: [3. Cách chạy JavaScript](../../javascript/01-gioi-thieu/3_cach-chay.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Có những cách nào để chạy một đoạn JavaScript? Với một dự án thật, bạn chọn cách nào và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Các cách phổ biến:

- **Console trình duyệt** (F12 → tab Console) — gõ trực tiếp, thấy kết quả ngay.
- **Inline `<script>`** trong file HTML.
- **File JS riêng** nhúng qua `<script src="app.js">`.
- **Node.js** — `node app.js`, chạy ngoài trình duyệt.
- **Runtime hiện đại** — `bun app.js`, `deno run app.ts`, hoặc deploy lên edge (Cloudflare Workers, Vercel Edge).
- **REPL** — `node`, `bun repl`, console trình duyệt.

**Với dự án thật: dùng file JS riêng** (thường là `<script src="app.js" defer>` hoặc `type="module"`), vì:

- **Tách biệt** HTML và JS — dễ đọc, dễ bảo trì.
- **Cache được** — trình duyệt tải một lần, dùng lại cho nhiều trang.
- **Tái sử dụng** cùng một file cho nhiều trang.
- Dùng được **module**, bundler, minify, source map, linter.

Console và inline script chỉ hợp cho thử nghiệm nhanh hoặc vài dòng khởi tạo đặc biệt.

</details>

**2. Đặt thẻ `script` không có thuộc tính gì ở giữa `body` thì trình duyệt xử lý ra sao? Vì sao ngày xưa người ta khuyên đặt script ở cuối `body`?**

<details className="qa">
<summary>Xem đáp án</summary>

Script mặc định (không `async`/`defer`) là **blocking**: khi parser gặp thẻ đó, nó **dừng việc parse HTML**, tải script về (nếu là file ngoài), **chạy xong** rồi mới parse tiếp phần HTML còn lại.

Hệ quả:

- Phần HTML **phía dưới** script chưa tồn tại trong DOM tại thời điểm script chạy → truy cập vào nó sẽ nhận `null`.
- Trang bị **trắng / chậm hiển thị** trong lúc chờ tải và chạy script, nhất là với mạng chậm.

**Vì sao khuyên đặt cuối `body`?** Vì hồi đó chưa có `defer` được hỗ trợ rộng rãi. Đặt script ngay trước `</body>` đảm bảo hai điều: toàn bộ HTML đã parse xong nên DOM có sẵn, và nội dung trang hiển thị trước, không bị script chặn.

Ngày nay khuyến nghị hiện đại là đặt script trong `<head>` kèm **`defer`** — vừa được tải song song sớm hơn (nhanh hơn), vừa chỉ chạy sau khi HTML parse xong.

</details>

**3. So sánh `script` mặc định, `async` và `defer` về: thời điểm tải, thời điểm thực thi và thứ tự thực thi.**

<details className="qa">
<summary>Xem đáp án</summary>

| Thuộc tính | Tải | Thực thi | Thứ tự |
|---|---|---|---|
| (mặc định) | Chặn HTML parse | Ngay khi tải xong | Theo thứ tự khai báo |
| `async` | Song song với parse | Ngay khi tải xong (dừng parse để chạy) | **Không** đảm bảo — file nào xong trước chạy trước |
| `defer` | Song song với parse | Sau khi HTML parse xong | Theo thứ tự khai báo |
| `type="module"` | Song song với parse | Sau khi HTML parse xong (defer mặc định) | Theo thứ tự |

Tóm lại: cả `async` và `defer` đều **không chặn việc tải**, khác biệt nằm ở **thời điểm chạy** và **có giữ thứ tự hay không**.

Quy tắc chọn:

- **`defer`** — mặc định cho hầu hết trường hợp, nhất là script thao tác DOM hoặc có phụ thuộc lẫn nhau.
- **`async`** — script hoàn toàn độc lập, không cần DOM, không ai phụ thuộc vào nó (analytics, ads).
- **`type="module"`** — code dùng `import`/`export`; đã tự có hành vi như `defer`.

</details>

**4. Ba file `jquery.js`, `plugin.js`, `app.js` phụ thuộc lẫn nhau theo thứ tự. Dùng `async` cho cả ba thì chuyện gì có thể xảy ra? Nên dùng gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Với `async`, **file nào tải xong trước thì chạy trước** — thứ tự hoàn toàn phụ thuộc vào kích thước file, tốc độ mạng và cache. `app.js` thường nhỏ nhất nên rất dễ tải xong đầu tiên và chạy trước `jquery.js`, dẫn tới lỗi kiểu `$ is not defined` hoặc `jQuery.fn.myPlugin is not a function`.

Tệ hơn: lỗi này **không ổn định** — máy dev có cache nên chạy đúng, còn người dùng thật mạng chậm lại lỗi. Rất khó debug.

```html
<!-- ❌ SAI — vỡ phụ thuộc -->
<script src="jquery.js" async></script>
<script src="plugin.js" async></script>
<script src="app.js" async></script>

<!-- ✅ ĐÚNG — defer giữ đúng thứ tự khai báo -->
<script src="jquery.js" defer></script>
<script src="plugin.js" defer></script>
<script src="app.js" defer></script>
```

**Nên dùng `defer`**: vẫn tải song song (nhanh như `async`) nhưng thực thi **theo đúng thứ tự khai báo** và chỉ sau khi HTML parse xong. Nguyên tắc: có quan hệ phụ thuộc → không bao giờ dùng `async`.

</details>

**5. Trường hợp nào thì `async` là lựa chọn đúng? Cho ví dụ thực tế.**

<details className="qa">
<summary>Xem đáp án</summary>

`async` đúng khi script thỏa **cả ba** điều kiện:

- **Độc lập hoàn toàn** — không cần thư viện nào chạy trước.
- **Không ai phụ thuộc vào nó** — không script nào cần nó chạy xong.
- **Không phụ thuộc trạng thái DOM** — chạy lúc nào cũng được, càng sớm càng tốt.

Ví dụ thực tế:

```html
<!-- Analytics: tự khởi tạo, không ai phụ thuộc -->
<script src="https://analytics.example.com/track.js" async></script>

<!-- Quảng cáo, chat widget, error tracking -->
<script src="https://cdn.example.com/ads.js" async></script>
```

Lý do dùng `async` ở đây thay vì `defer`: các script này nên chạy **càng sớm càng tốt** (analytics muốn ghi nhận lượt xem ngay, error tracker muốn bắt lỗi từ sớm), không cần chờ HTML parse xong. Đổi lại nó có thể chặn parse một nhịp ngắn khi tải xong.

Với mọi script khác — code ứng dụng, thư viện UI, script thao tác DOM — `defer` vẫn là lựa chọn an toàn.

</details>

**6. Đoạn script inline chạy `document.querySelector("h1")` nhưng thẻ `h1` nằm phía dưới nó — kết quả là gì và vì sao? Có mấy cách sửa?**

<details className="qa">
<summary>Xem đáp án</summary>

**Kết quả: lỗi** `TypeError: Cannot read properties of null (reading 'textContent')`.

**Vì sao:** script mặc định chạy **ngay tại vị trí nó xuất hiện**, lúc đó parser chưa đọc tới thẻ `h1` nên phần tử này **chưa có trong DOM**. `querySelector` không tìm thấy → trả về `null`, và truy cập property trên `null` gây lỗi.

```html
<script>
  document.querySelector("h1").textContent = "Đã đổi!"; // ❌ LỖI
</script>
<h1>Tiêu đề gốc</h1>
```

**Các cách sửa:**

- **Dùng `defer`** với file ngoài — script chạy sau khi HTML parse xong (cách khuyến nghị).
- **Dùng `type="module"`** — cũng defer mặc định.
- **Chuyển script xuống cuối `body`**, sau thẻ `h1`.
- **Bọc trong `DOMContentLoaded`**:

```js
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("h1").textContent = "Đã đổi!"; // ✅
});
```

Lưu ý: `defer` **không áp dụng cho script inline** — chỉ có tác dụng với `<script src="...">`.

</details>

**7. `script type="module"` khác gì so với script thường? Nó có được `defer` mặc định không? Trong module thì `this` ở top-level là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Khác biệt chính của `type="module"`:

- Hỗ trợ **`import` / `export`** — có hệ thống module thật.
- **Defer mặc định**: có, module luôn tải song song và chạy sau khi HTML parse xong, theo đúng thứ tự (muốn hành vi async thì thêm `async` thủ công).
- **Luôn ở strict mode**, không cần `"use strict"`.
- **Scope riêng**: biến khai báo trong module không rò ra global — khác hẳn script thường (khai báo `var` ở top-level tạo property trên `window`).
- **Chỉ thực thi một lần** dù được import nhiều nơi.
- Tải qua HTTP phải tuân **CORS**, và không chạy được bằng `file://` — cần dev server.
- Hỗ trợ **top-level `await`**.

**`this` ở top-level trong module là `undefined`** (do module luôn strict và có scope riêng). Trong script thường, `this` ở top-level là `window`.

```js
// <script>            → this === window
// <script type=module> → this === undefined
```

</details>

**8. `defer` chạy trước hay sau sự kiện `DOMContentLoaded`? Còn `load` thì khác gì `DOMContentLoaded`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Script `defer` chạy TRƯỚC `DOMContentLoaded`.** Trình tự chuẩn của trình duyệt:

1. Parse xong toàn bộ HTML.
2. Thực thi các script `defer` theo đúng thứ tự khai báo.
3. Bắn sự kiện **`DOMContentLoaded`**.

Nghĩa là trong script `defer`, DOM đã sẵn sàng, và nếu bạn đăng ký listener `DOMContentLoaded` bên trong đó thì listener vẫn chạy được (vì sự kiện chưa bắn).

**`DOMContentLoaded` vs `load`:**

| | `DOMContentLoaded` | `load` |
|---|---|---|
| Bắn khi | HTML đã parse xong, DOM sẵn sàng | Toàn bộ tài nguyên đã tải xong |
| Chờ ảnh, CSS, iframe, font? | Không | Có |
| Thời điểm | Sớm | Muộn hơn, có thể chậm đáng kể |
| Dùng khi | Thao tác DOM, gắn event handler (đa số trường hợp) | Cần kích thước ảnh thật, đo layout cuối cùng |

Thực tế nên dùng `defer` hoặc `DOMContentLoaded`; chỉ dùng `load` khi thật sự cần chờ tài nguyên.

</details>

**9. Chạy một file JS bằng Node.js như thế nào? `node --watch` giúp gì trong quá trình phát triển?**

<details className="qa">
<summary>Xem đáp án</summary>

Cài Node.js (bản **LTS**) từ `https://nodejs.org`, sau đó chạy file bằng lệnh:

```bash
node app.js
```

Node sẽ nạp file, thực thi bằng engine V8 và in kết quả ra terminal. Nếu muốn dùng `import`/`export` thì cần đặt `"type": "module"` trong `package.json` hoặc đổi đuôi file thành `.mjs`.

**`node --watch` (Node 18+):**

```bash
node --watch app.js
```

Nó theo dõi file (và các file được require/import) — mỗi khi bạn lưu thay đổi, Node **tự khởi động lại tiến trình**. Lợi ích: khỏi phải bấm `Ctrl+C` rồi gõ lại `node app.js` sau mỗi lần sửa, vòng lặp sửa–thử nhanh hơn nhiều.

Trước khi có tính năng này, cộng đồng dùng gói ngoài như `nodemon` để đạt cùng mục đích; nay Node đã hỗ trợ sẵn. Có thêm `--watch-path` để chỉ định thư mục cần theo dõi.

</details>

**10. Trong Node.js, phân biệt `CommonJS` và `ES Module`. Cần cấu hình gì để dùng `import`/`export` trong Node?**

<details className="qa">
<summary>Xem đáp án</summary>

| | CommonJS (CJS) | ES Module (ESM) |
|---|---|---|
| Cú pháp | `require()` / `module.exports` | `import` / `export` |
| Nạp module | **Đồng bộ**, lúc runtime | **Bất đồng bộ**, phân tích tĩnh lúc parse |
| Đuôi file mặc định | `.js`, `.cjs` | `.mjs`, hoặc `.js` khi `"type": "module"` |
| Top-level `await` | Không | Có |
| Biến đặc biệt | `__dirname`, `__filename`, `require` | `import.meta.url` (không có `__dirname`) |
| Tree-shaking | Khó | Tốt (nhờ phân tích tĩnh) |
| Nguồn gốc | Chuẩn riêng của Node | Chuẩn ECMAScript, dùng chung với trình duyệt |

**Cách bật ESM trong Node** — chọn một trong hai:

- Thêm `"type": "module"` vào `package.json` (khi đó mọi file `.js` được coi là ESM).
- Đặt tên file đuôi **`.mjs`**.

```js
// app.mjs
import fs from "node:fs";
console.log(fs.readdirSync("."));
```

ESM có thể `import` module CommonJS, nhưng chiều ngược lại thì không dùng `require()` được — phải dùng `await import()`.

</details>

**11. Những API nào chỉ có trong trình duyệt, những API nào chỉ có trong Node.js? Điều gì xảy ra nếu gọi `document` trong Node hoặc `fs` trong browser?**

<details className="qa">
<summary>Xem đáp án</summary>

| Chỉ có ở trình duyệt | Chỉ có ở Node.js |
|---|---|
| `window`, `document`, `localStorage`, `alert`, `navigator`, DOM API | `fs`, `path`, `process`, `Buffer`, `require`, `os`, `child_process` |

(`fetch` xuất phát từ trình duyệt nhưng Node đã tích hợp sẵn từ v18.)

**Gọi `document` trong Node:**

```js
console.log(document.title);
// ReferenceError: document is not defined
```

Vì Node không có DOM — nó không render trang web nào cả. Muốn thao tác DOM trong Node phải dùng thư viện giả lập như `jsdom`.

**Gọi `fs` trong browser:**

```js
const fs = require("fs");
// ReferenceError: require is not defined
```

Trình duyệt không có `require` và **không được phép** truy cập hệ thống file của người dùng — đây là rào chắn bảo mật cố ý (sandbox). Nếu dùng bundler, lỗi sẽ xuất hiện ngay lúc build ("Module not found: fs").

Đây chính là lý do phải phân biệt rõ code chạy ở đâu khi làm fullstack JS.

</details>

**12. So sánh `Node.js`, `Deno` và `Bun`. Deno khác Node ở điểm bảo mật nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Node.js | Deno | Bun |
|---|---|---|---|
| Ra đời | 2009, Ryan Dahl | Cùng tác giả Ryan Dahl | Mới hơn, tác giả Jarred Sumner |
| Engine | V8 | V8 | JavaScriptCore |
| Viết bằng | C++ | Rust | Zig |
| TypeScript | Cần transpile | **Native** | **Native** |
| Bảo mật | Toàn quyền mặc định | **Sandbox mặc định** | Toàn quyền mặc định |
| Điểm mạnh | Hệ sinh thái npm khổng lồ, ổn định nhất | An toàn, chuẩn web, tooling tích hợp | Tốc độ (nhanh hơn Node nhiều lần), tích hợp sẵn test/bundler/package manager |

**Điểm bảo mật của Deno:** Node chạy script với **toàn quyền** — một package npm bất kỳ trong `node_modules` có thể đọc file, mở kết nối mạng, đọc biến môi trường mà bạn không hề hay biết (nguy cơ supply-chain attack rất thực).

Deno đảo ngược: script chạy trong **sandbox**, muốn làm gì phải được cấp quyền tường minh qua flag:

```bash
deno run app.ts                 # không có quyền gì
deno run --allow-net server.ts  # chỉ cấp quyền mạng
```

</details>

**13. Cloudflare Workers / Vercel Edge chạy JS trong môi trường nào? Vì sao ở đó không có `fs`?**

<details className="qa">
<summary>Xem đáp án</summary>

Chúng chạy JS trên **edge** — các máy chủ đặt rải rác gần người dùng về mặt địa lý, để giảm độ trễ. Môi trường thực thi là **V8 isolates**: mỗi request chạy trong một "isolate" — một ngữ cảnh V8 nhẹ, khởi động gần như tức thì (mili giây), thay vì khởi tạo cả một tiến trình Node hay container.

**Vì sao không có `fs`?** Nhiều lý do cộng lại:

- **Không có filesystem để mà truy cập**: code chạy trong sandbox dùng chung hạ tầng với hàng nghìn khách hàng khác — mở quyền đọc/ghi đĩa là thảm họa bảo mật.
- **Vô trạng thái (stateless)**: isolate có vòng đời rất ngắn và chạy ở hàng trăm vị trí khác nhau; file ghi ở một node cũng không có ý nghĩa với node khác.
- **Isolate không phải Node**: nó chỉ cung cấp **Web API** (`fetch`, `Request`, `Response`, `URL`, `crypto`), không có Node API.

Muốn lưu trữ dữ liệu ở edge thì dùng các dịch vụ chuyên biệt (KV store, R2, D1, database qua HTTP) chứ không ghi file.

</details>

**14. Bạn viết một thư viện muốn chạy được cả trên trình duyệt lẫn Node lẫn edge runtime — chọn API theo nguyên tắc nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: **chỉ dùng phần giao nhau của mọi môi trường** — tức là các **Web API chuẩn theo WinterCG**, tránh API chuyên biệt của Node.

Nhóm API an toàn để dùng chung: `fetch`, `Request`, `Response`, `Headers`, `URL`, `URLSearchParams`, `crypto` (Web Crypto), `TextEncoder`/`TextDecoder`, `ReadableStream`, `AbortController`, `structuredClone`.

Nên tránh trong code lõi: `fs`, `path`, `process`, `Buffer`, `require`, `child_process` — cũng như `document`, `window`, `localStorage` (chỉ có ở trình duyệt).

Các nguyên tắc bổ sung:

- **Xuất ESM** (kèm bản CJS nếu cần) và khai báo `exports` trong `package.json`.
- Nếu bắt buộc phải dùng API riêng của từng môi trường, **tách ra adapter** và cho người dùng inject, hoặc dùng conditional exports (`node`, `browser`, `worker`) để bundler chọn đúng bản.
- **Không truy cập global khi import** — chỉ dùng chúng lúc gọi hàm, để việc import không gây lỗi ở môi trường thiếu API đó.
- Test thực tế trên cả ba môi trường, đừng chỉ tin lý thuyết.

</details>

**15. `REPL` là viết tắt của gì? Kể vài trường hợp REPL hữu ích hơn việc tạo file rồi chạy.**

<details className="qa">
<summary>Xem đáp án</summary>

**REPL = Read–Eval–Print–Loop**: môi trường tương tác đọc lệnh bạn gõ, thực thi, in kết quả, rồi lặp lại. Ví dụ: gõ `node` trong terminal, `bun repl`, hoặc chính console của DevTools.

```bash
node
> const x = 10
> x + 5
15
> .exit
```

Những lúc REPL tiện hơn tạo file:

- **Thử nhanh cú pháp hoặc một API mới** — muốn biết `Object.groupBy` hoặc `Array.prototype.at` hoạt động ra sao, gõ hai dòng là xong.
- **Kiểm chứng một biểu thức khó đoán** — ép kiểu, regex, thao tác ngày tháng.
- **Khám phá object** — gõ tên biến, dùng **Tab** để autocomplete xem nó có những property gì.
- **Debug trên trang thật** — trong console trình duyệt, bạn truy cập được DOM và state hiện tại của trang đang chạy, điều mà file rời không làm được.

Vài shortcut nên nhớ: **Tab** (autocomplete), **↑/↓** (lịch sử lệnh), **`.help`** và **`.editor`** (chế độ nhiều dòng) trong Node REPL.

</details>
