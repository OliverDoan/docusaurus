---
sidebar_position: 14
title: "14. Asynchronous JavaScript"
---

# 14. Asynchronous JavaScript

## 1. Event Loop, setTimeout, setInterval

Bài học: [1. Event Loop, setTimeout, setInterval](../../javascript/14-async/1_event-loop.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao nói JavaScript là ngôn ngữ đơn luồng (`single-threaded`) mà trang web vẫn xử lý được nhiều việc "cùng lúc"?**

<details className="qa">
<summary>Xem đáp án</summary>

JS chỉ có **một call stack** — tại một thời điểm chỉ thực thi đúng một đoạn code. Điểm mấu chốt: **những việc phải chờ không do luồng JS làm**. Timer, network, đọc file... được giao cho **runtime** bên ngoài (Web APIs của browser, libuv của Node), vốn có thread riêng của hệ điều hành.

JS chỉ **đăng ký callback** rồi chạy tiếp ngay:

```js
console.log("Bắt đầu");
setTimeout(() => console.log("Xong sau 5 giây"), 5000);
console.log("Vẫn chạy tiếp ngay lập tức");
// Trong 5 giây chờ: trang vẫn click, cuộn, gõ bình thường
```

Khi việc bên ngoài xong, callback được xếp vào hàng đợi, và **event loop** đẩy nó vào call stack lúc stack rỗng. Vậy nên chính xác hơn: JS **thực thi** đơn luồng, nhưng mô hình xử lý là **non-blocking, event-driven** — luồng duy nhất không bao giờ đứng chờ I/O. Đó là lý do một trang web (hay server Node) vẫn phản hồi mượt dù chỉ có một luồng JS.

</details>

**2. Mô tả các thành phần của JS runtime: `call stack`, `heap`, Web APIs, macrotask queue, microtask queue. Chúng phối hợp với nhau ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Call Stack** — ngăn xếp các function đang chạy. Gọi hàm thì push frame, hàm return thì pop. Chỉ có một, nên chỉ chạy một việc một lúc.
- **Heap** — vùng bộ nhớ chứa object, được garbage collector dọn.
- **Web APIs / libuv** — phần do runtime cung cấp, không thuộc engine: `setTimeout`, `fetch`, DOM event, file I/O. Đây là nơi việc "chờ" thực sự diễn ra, ngoài luồng JS.
- **Macrotask queue** — hàng đợi callback của `setTimeout`, `setInterval`, I/O, UI event.
- **Microtask queue** — hàng đợi callback của `Promise.then`, `queueMicrotask`, `MutationObserver`.

Luồng phối hợp: code chạy trên call stack, gặp API async thì **giao việc cho Web APIs** và trả quyền điều khiển ngay. Khi việc xong, Web APIs **đẩy callback vào queue tương ứng** (macro hay micro tùy loại). **Event loop** đứng giữa, liên tục kiểm tra: call stack rỗng chưa? Rỗng rồi thì rút callback từ queue đẩy vào stack — microtask trước, macrotask sau.

</details>

**3. Event loop làm gì trong một vòng (tick)? Kể tuần tự các bước từ lúc call stack rỗng.**

<details className="qa">
<summary>Xem đáp án</summary>

Một tick trong browser diễn ra theo thứ tự:

```
1. Chạy sync code đến khi Call Stack rỗng.
2. Chạy HẾT Microtask Queue (Promise.then, queueMicrotask)
   — kể cả microtask mới sinh ra trong lúc chạy.
3. Nếu sắp render: chạy callback requestAnimationFrame.
4. Render UI (style, layout, paint, composite) — nếu cần.
5. Lấy ĐÚNG 1 task từ Macrotask Queue, push vào stack.
6. Quay lại bước 1.
```

Ba điểm dễ hỏi thêm:

- Microtask queue được **vét cạn**, macrotask thì mỗi vòng chỉ lấy **một**.
- Render không diễn ra mỗi tick — browser chỉ render khi tới nhịp làm tươi màn hình (thường ~60 lần/giây).
- Vì render nằm **sau** bước vét microtask, nếu microtask sinh ra vô tận thì browser không bao giờ tới được bước render → trang treo.

</details>

**4. Phân biệt `macrotask` và `microtask`. Kể ít nhất ba nguồn của mỗi loại.**

<details className="qa">
<summary>Xem đáp án</summary>

| | Macrotask | Microtask |
|---|---|---|
| Nguồn | `setTimeout`, `setInterval`, `setImmediate` (Node), I/O, UI event (click, scroll) | `Promise.then/catch/finally`, `queueMicrotask`, `MutationObserver`, `await`, `process.nextTick` (Node) |
| Mỗi tick chạy | Đúng **1** task | **Toàn bộ** queue, kể cả task mới sinh ra |
| Ưu tiên | Thấp hơn | Cao hơn — luôn chạy trước |
| Có nhường render? | Có, browser render giữa các macrotask | Không, render bị hoãn tới khi queue cạn |

```js
setTimeout(() => console.log("macro 1"), 0);
queueMicrotask(() => console.log("micro 1"));
Promise.resolve().then(() => console.log("micro 2"));
setTimeout(() => console.log("macro 2"), 0);

// In: micro 1, micro 2, macro 1, macro 2
```

Nhớ một câu: **microtask là "việc phải làm nốt trước khi nghỉ", macrotask là "việc của lượt sau"**.

</details>

**5. Đoạn sau in ra thứ tự nào và vì sao: `console.log(1); setTimeout(() => console.log(2), 0); Promise.resolve().then(() => console.log(3)); console.log(4);`**

<details className="qa">
<summary>Xem đáp án</summary>

Output: **`1` → `4` → `3` → `2`**

```js
console.log(1);                                  // sync
setTimeout(() => console.log(2), 0);             // → macrotask queue
Promise.resolve().then(() => console.log(3));    // → microtask queue
console.log(4);                                  // sync
```

Diễn giải từng bước:

- `1` in ngay vì là sync code.
- `setTimeout` không chạy callback, chỉ giao cho Web API; hết 0ms (thực tế tối thiểu ~4ms) callback vào **macrotask queue**.
- `Promise.resolve()` đã settled sẵn nên callback `.then` vào **microtask queue** ngay.
- `4` in ngay — vẫn là sync code.
- Call stack rỗng → event loop **vét microtask queue trước** → in `3`.
- Cuối cùng mới lấy một macrotask → in `2`.

Bài học cốt lõi: mọi code đồng bộ chạy hết trước, rồi microtask, rồi mới tới macrotask.

</details>

**6. Vì sao `setTimeout(fn, 0)` không chạy ngay lập tức? Delay tối thiểu thực tế là bao nhiêu và vì sao spec lại có clamping?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai lý do:

- `setTimeout` chỉ **xếp lịch**, không chạy ngay. Callback phải đợi call stack rỗng **và** microtask queue được vét cạn, rồi mới tới lượt macrotask.
- Spec HTML quy định **clamping**: khi timer lồng nhau quá 5 tầng, delay bị ép lên tối thiểu **~4ms**, dù bạn truyền `0`.

Ngoài ra browser còn throttle mạnh hơn (thường xuống 1 lần/giây) cho tab chạy nền, để tiết kiệm CPU và pin. Đó chính là mục đích của clamping: chặn vòng lặp `setTimeout(fn, 0)` vô tận đốt CPU và làm nóng máy.

Nếu bạn thực sự muốn "chạy sớm nhất có thể ngay sau code hiện tại":

```js
queueMicrotask(fn);          // sớm hơn setTimeout(0)
Promise.resolve().then(fn);  // tương đương
```

Đừng bao giờ coi đối số delay là lời hứa chính xác — nó chỉ là **thời gian tối thiểu** trước khi callback được xếp hàng.

</details>

**7. Giữa `Promise.then(fn)` và `setTimeout(fn, 0)`, cái nào chạy trước? Giải thích bằng cơ chế hàng đợi chứ không chỉ nói kết quả.**

<details className="qa">
<summary>Xem đáp án</summary>

`Promise.then(fn)` **luôn chạy trước**, kể cả khi `setTimeout` được viết ở dòng trên.

Cơ chế: hai callback rơi vào **hai hàng đợi khác nhau**. `.then` vào **microtask queue**, `setTimeout` vào **macrotask queue**. Trong một tick, event loop làm theo thứ tự cứng: chạy hết sync code → **vét cạn microtask queue** → mới lấy **một** macrotask.

```js
setTimeout(() => console.log("macro"), 0);
Promise.resolve().then(() => console.log("micro"));
// In: micro, macro
```

Thậm chí nếu `.then` sinh thêm `.then` mới, chúng vẫn được nối vào microtask queue và chạy hết **trong cùng tick đó**, trước khi `setTimeout` có cơ hội. Cộng thêm việc `setTimeout(fn, 0)` còn bị clamping tối thiểu ~4ms, khoảng cách càng rõ.

Hệ quả thực tế: dùng microtask cho việc "phải xong ngay sau code hiện tại", dùng macrotask khi muốn **nhường nhịp** cho browser render.

</details>

**8. Trong một tick, event loop lấy bao nhiêu `microtask` và bao nhiêu `macrotask`? Vì sao lại bất đối xứng như vậy?**

<details className="qa">
<summary>Xem đáp án</summary>

**Toàn bộ** microtask queue (vét cạn, kể cả microtask mới sinh ra trong lúc đang chạy) nhưng chỉ **đúng một** macrotask mỗi vòng.

Lý do của sự bất đối xứng nằm ở ý nghĩa của hai loại:

- **Microtask** đại diện cho phần việc còn dang dở của tác vụ vừa chạy — ví dụ chuỗi `.then` xử lý kết quả một Promise. Nếu để chúng chạy rải rác qua nhiều tick, ứng dụng có thể quan sát thấy trạng thái "nửa vời", không nhất quán. Nên spec bắt phải làm nốt trước khi nghỉ.
- **Macrotask** là các tác vụ độc lập với nhau — timer này không liên quan gì timer kia. Lấy từng cái một cho phép browser **chen vào giữa** để render UI, xử lý input, giữ trang phản hồi.

Chính sự bất đối xứng này tạo ra hệ quả: vòng lặp macrotask vô tận thì trang vẫn mượt, còn vòng lặp microtask vô tận thì trang treo cứng vì không bao giờ tới được bước render.

</details>

**9. Điều gì xảy ra nếu một microtask liên tục tự schedule microtask mới (`Promise.resolve().then(spam)`)? So sánh với vòng `setTimeout(spam, 0)` vô tận — vì sao một cái treo browser còn cái kia thì không?**

<details className="qa">
<summary>Xem đáp án</summary>

```js
function spam() {
  Promise.resolve().then(spam);
}
spam(); // browser bị treo

function spamMacro() {
  setTimeout(spamMacro, 0);
}
spamMacro(); // browser vẫn responsive
```

Với microtask: event loop phải **vét cạn** microtask queue trước khi làm bất cứ việc gì khác. Mỗi lần chạy `spam` lại nhét thêm một microtask mới, nên queue không bao giờ cạn. Event loop kẹt vĩnh viễn ở bước 2, không tới được bước render hay macrotask → trang đơ hoàn toàn, không click, không cuộn được.

Với macrotask: mỗi tick chỉ lấy **một** task. Chạy xong `spamMacro`, event loop thoát ra, browser có cơ hội vét microtask, render UI, xử lý click — rồi mới lấy `spamMacro` tiếp theo. Trang tốn CPU nhưng vẫn phản hồi bình thường.

Đây là minh hoạ rõ nhất cho sự khác biệt "vét cạn" và "lấy từng cái".

</details>

**10. `microtask starvation` là gì và nó ảnh hưởng thế nào tới việc render UI?**

<details className="qa">
<summary>Xem đáp án</summary>

**Microtask starvation** là tình trạng microtask queue liên tục được nạp thêm nhanh hơn tốc độ vét, khiến các bước phía sau của event loop — render UI, macrotask, xử lý input — bị "bỏ đói", không bao giờ tới lượt.

Ảnh hưởng tới render: bước paint nằm **sau** bước vét microtask trong một tick. Queue không cạn nghĩa là browser không bao giờ tới được bước render, UI đóng băng ở khung hình cuối cùng: animation đứng hình, click không phản hồi, scroll không nhúc nhích, và sau vài giây browser có thể báo "trang không phản hồi".

Nguyên nhân thường gặp trong code thật không phải vòng lặp cố ý, mà là **đệ quy Promise trên dữ liệu lớn** — ví dụ xử lý từng phần tử của một mảng vài trăm nghìn item bằng chuỗi `.then` nối tiếp. Đó là lý do có loại bug "chỉ xảy ra khi data lớn".

Cách xử lý: chia nhỏ công việc và **nhường nhịp** bằng macrotask (`setTimeout(..., 0)`), hoặc đẩy hẳn phần tính toán nặng sang Web Worker.

</details>

**11. `await` biến phần code phía sau nó thành gì trong event loop? Đoạn `async function f() { console.log(1); await null; console.log(2); } f(); console.log(3);` in ra thứ tự nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Output: **`1` → `3` → `2`**

`await` **cắt đôi** hàm async. Phần code phía sau `await` được biến thành một **microtask** — tương đương callback trong `.then()` — và hàm tạm dừng, trả quyền điều khiển về cho caller.

```js
async function f() {
  console.log(1);   // chạy SYNC, ngay khi gọi f()
  await null;       // tạm dừng, phần sau → microtask queue
  console.log(2);   // microtask
}
f();
console.log(3);     // sync, chạy trước khi microtask có lượt
```

Diễn giải: gọi `f()` thì phần thân **trước `await` chạy đồng bộ ngay** → in `1`. Gặp `await`, phần còn lại được xếp vào microtask queue, `f()` return một Promise. Luồng chính chạy tiếp → in `3`. Call stack rỗng → vét microtask → in `2`.

Lưu ý: `await null` vẫn tạo microtask dù giá trị không phải Promise — chỉ cần có `await` là có điểm cắt.

</details>

**12. `requestAnimationFrame` chạy ở thời điểm nào trong một tick? Vì sao nó hợp cho animation hơn `setTimeout(fn, 16)`?**

<details className="qa">
<summary>Xem đáp án</summary>

`requestAnimationFrame` (rAF) chạy **ngay trước bước render**, tức sau khi microtask queue đã cạn và trước khi browser paint. Thứ tự trong một tick: sync code → microtask → **rAF** → render → macrotask.

Vì sao hơn `setTimeout(fn, 16)`:

- **Đồng bộ với nhịp màn hình.** rAF được gọi đúng một lần mỗi khung hình, khớp tần số làm tươi thật của thiết bị (60Hz, 120Hz...). `setTimeout(16)` là con số áng chừng cho 60fps, lệch nhịp → giật, drop frame.
- **Cập nhật chắc chắn được vẽ.** Code trong rAF chạy ngay trước paint nên thay đổi DOM/canvas được lên hình cùng khung hình đó. `setTimeout` có thể rơi vào giữa hai lần render, thay đổi bị "trễ" một frame.
- **Timer không đáng tin.** `setTimeout` chịu clamping và bị đẩy lùi nếu luồng bận, nên khoảng cách giữa các lần gọi trôi dạt.
- **Tự dừng khi tab ẩn**, tiết kiệm CPU và pin; `setTimeout` vẫn chạy (dù bị throttle).

</details>

**13. `setInterval` bị `drift` nghĩa là gì? Cách xử lý khi cần đếm thời gian chính xác?**

<details className="qa">
<summary>Xem đáp án</summary>

**Drift** là hiện tượng thời điểm thực tế của các tick **lệch dần** so với lý thuyết. `setInterval(fn, 1000)` không đảm bảo callback chạy đúng mỗi 1000ms: nếu luồng chính đang bận, callback bị dời lại; nếu tab chạy nền, browser throttle mạnh hơn. Sai số nhỏ mỗi lần nhưng **cộng dồn**, nên đồng hồ đếm bằng cách cộng `+1` mỗi tick sẽ chạy chậm dần, sau vài phút lệch thấy rõ.

Cách xử lý: **đừng đếm số tick, hãy đo mốc thời gian thật**:

```js
const start = Date.now();
setInterval(() => {
  const elapsed = Date.now() - start;
  // dùng elapsed thay vì giả định mỗi tick = 1000ms
  render(Math.floor(elapsed / 1000));
}, 1000);
```

Cách này tự sửa sai: tick có trễ thì `elapsed` vẫn đúng, giao diện chỉ nhảy số hơi lệch nhịp chứ không sai tổng thời gian. Với đồng hồ hiển thị mượt theo frame, kết hợp `requestAnimationFrame` + `performance.now()`.

</details>

**14. So sánh `setInterval(fn, 1000)` với `setTimeout` đệ quy — cái nào an toàn hơn khi callback chạy lâu hơn khoảng interval? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**`setTimeout` đệ quy an toàn hơn.**

`setInterval` đếm giờ từ lúc tick trước **được xếp lịch**, không quan tâm callback đã chạy xong chưa. Nếu callback mất 1500ms mà interval là 1000ms, các callback bị dồn ứ, chạy nối đuôi nhau **không có khoảng nghỉ**, luồng chính nghẹt dần. Với polling API còn tệ hơn: request chồng request.

`setTimeout` đệ quy chỉ hẹn lần kế tiếp **sau khi lần này đã xong**, nên luôn có đúng khoảng nghỉ mong muốn giữa hai lần chạy:

```js
function poll() {
  setTimeout(async () => {
    await fetchData();  // xong xuôi rồi mới hẹn tiếp
    poll();
  }, 1000);
}
poll();
```

| | `setInterval` | `setTimeout` đệ quy |
|---|---|---|
| Khoảng cách | Tính từ lần xếp lịch trước | Đảm bảo nghỉ đủ giữa hai lần chạy |
| Callback chạy lâu | Có thể dồn ứ, chồng lấn | Không bao giờ chồng lấn |
| Đổi delay giữa chừng | Không được | Được (dễ làm backoff) |
| Hủy | `clearInterval(id)` | `clearTimeout(id)` của lần đang chờ |

</details>

**15. `clearTimeout`/`clearInterval` hoạt động ra sao? Quên clear khi component unmount thì hậu quả là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`setTimeout`/`setInterval` trả về một **id** định danh timer đang chờ trong runtime. Truyền id đó cho `clearTimeout`/`clearInterval` để runtime gỡ timer khỏi danh sách, callback sẽ không bao giờ được xếp vào macrotask queue nữa.

```js
const id = setInterval(() => console.log("Mỗi giây"), 1000);
clearInterval(id); // hủy
```

Lưu ý: hủy timer **không** hủy được công việc đã chạy — nếu callback đang thực thi thì nó chạy nốt.

Hậu quả khi quên clear lúc component unmount:

- **Memory leak**: timer giữ tham chiếu tới closure, kéo theo cả state, DOM node, response API — GC không dọn được.
- **Set state trên component đã chết**: callback chạy sau unmount, gọi `setState` vào chỗ không còn tồn tại → cảnh báo hoặc lỗi.
- **`setInterval` chạy mãi mãi**: mỗi lần mount lại tạo thêm một interval, vào ra vài chục lần là hàng chục interval cùng bắn, ứng dụng chậm dần rồi đơ.

Vì vậy trong React luôn clear ở hàm cleanup của `useEffect`.

</details>

**16. `queueMicrotask` khác `Promise.resolve().then` ở điểm nào? Khi nào bạn chọn `queueMicrotask`?**

<details className="qa">
<summary>Xem đáp án</summary>

Về **thời điểm chạy thì giống hệt** — cả hai đẩy callback vào cùng một microtask queue, theo đúng thứ tự đăng ký. Khác nhau ở chi tiết:

| | `queueMicrotask(fn)` | `Promise.resolve().then(fn)` |
|---|---|---|
| Ý định | Nói thẳng "xếp một microtask" | Thông qua cơ chế Promise |
| Chi phí | Không tạo Promise nào | Tạo ít nhất một Promise object |
| Lỗi ném ra | Thành lỗi toàn cục, báo lên console | Thành **rejected promise**, im lặng nếu không `.catch` |
| Giá trị trả về | Không có | Trả về Promise, xâu chuỗi tiếp được |

Chọn `queueMicrotask` khi bạn **chỉ muốn hoãn một đoạn code tới cuối tick hiện tại** mà không có giá trị bất đồng bộ nào để chờ — ví dụ gom nhiều thay đổi rồi phát một sự kiện duy nhất, hoặc đảm bảo callback luôn chạy async cho nhất quán. Ưu điểm lớn là **lỗi không bị nuốt mất**. Ngược lại, khi cần chaining hoặc có giá trị để truyền tiếp thì dùng Promise.

</details>

**17. Một vòng `for` chạy nặng 5 giây ảnh hưởng gì tới event loop, tới UI và tới các timer đã hẹn giờ? Có cách nào chia nhỏ công việc để không block?**

<details className="qa">
<summary>Xem đáp án</summary>

Vòng lặp nặng chiếm call stack suốt 5 giây, event loop **đứng im** ở bước 1 — không vét được microtask, không render, không lấy macrotask.

- **UI**: đóng băng hoàn toàn. Click, scroll, gõ phím vẫn được ghi nhận nhưng callback nằm chờ trong queue, animation đứng hình; browser có thể báo "trang không phản hồi".
- **Timer**: **không bị mất**, nhưng bị **trễ**. `setTimeout(fn, 100)` hẹn trong lúc đó sẽ chạy sau ~5 giây, ngay khi luồng rảnh. Các tick `setInterval` bị dồn lại.

Cách chia nhỏ:

```js
function xuLyTheoLo(items, i = 0) {
  const end = Math.min(i + 500, items.length);
  for (; i < end; i++) xuLy(items[i]);
  if (i < items.length) setTimeout(() => xuLyTheoLo(items, i), 0);
}
```

Mỗi lô nhường lại một nhịp cho browser render. Lưu ý phải dùng **macrotask** (`setTimeout`) chứ không phải microtask, vì microtask không nhường render. Với tính toán thật sự nặng, giải pháp đúng là đẩy sang **Web Worker**.

</details>

**18. Event loop của Node.js khác browser thế nào? `process.nextTick` xếp ở đâu so với microtask, và các phase của `libuv` (timers, poll, check, close) làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc lớn giống nhau (sync → microtask → macrotask), nhưng Node không có render UI, và phần macrotask được libuv chia thành nhiều **phase** chạy vòng tròn:

- **timers** — chạy callback của `setTimeout`/`setInterval` đã đến hạn.
- **pending callbacks** — một số callback I/O bị hoãn từ vòng trước.
- **poll** — chờ và xử lý I/O mới (đọc file, socket). Đây là nơi Node "nghỉ" nếu không có việc.
- **check** — chạy callback của `setImmediate`.
- **close callbacks** — xử lý sự kiện đóng (`socket.on("close")`).

Giữa **mỗi** phase, Node vét hai hàng đợi ưu tiên theo thứ tự: **`process.nextTick` trước, rồi tới microtask của Promise**. Nghĩa là `process.nextTick` có ưu tiên **cao hơn cả `Promise.then`**:

```js
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("nextTick"));
// nextTick → promise → (timeout/immediate, thứ tự tuỳ ngữ cảnh)
```

Lạm dụng `process.nextTick` đệ quy cũng gây starvation y như microtask trên browser.

</details>

**19. `AbortController` giải quyết vấn đề gì trong code bất đồng bộ? Nó có "dừng" được một `setTimeout` đang chờ không?**

<details className="qa">
<summary>Xem đáp án</summary>

`AbortController` cung cấp một **cơ chế hủy chuẩn hoá, dùng chung** cho các tác vụ bất đồng bộ. Trước đó mỗi API có cách hủy riêng (`clearTimeout` với id, `xhr.abort()`, cờ `isCancelled` tự chế), rất rối khi cần hủy đồng loạt nhiều việc.

```js
const ctrl = new AbortController();

fetch(url, { signal: ctrl.signal });
element.addEventListener("click", fn, { signal: ctrl.signal });

setTimeout(() => ctrl.abort(), 5000); // hết hạn thì hủy tất cả
button.onclick = () => ctrl.abort();  // hoặc hủy thủ công
```

Một `signal` có thể truyền cho nhiều API cùng lúc — một lệnh `abort()` hủy hết, kể cả gỡ event listener. Rất hợp với cleanup khi component unmount hoặc khi request cũ bị thay bởi request mới.

**Có dừng được `setTimeout` không?** Không. `setTimeout` không nhận tham số `signal`, muốn hủy vẫn phải `clearTimeout(id)`. Bạn chỉ có thể tự nghe `signal` và gọi `clearTimeout` bên trong:

```js
const id = setTimeout(fn, 1000);
ctrl.signal.addEventListener("abort", () => clearTimeout(id));
```

</details>

**20. Web Worker giải quyết vấn đề nào mà event loop không giải quyết được? Nêu giới hạn của nó.**

<details className="qa">
<summary>Xem đáp án</summary>

Event loop chỉ giải quyết **việc chờ** (I/O, timer) — những thứ không tốn CPU của luồng JS. Nó **bất lực với tính toán nặng**: một vòng lặp 5 giây vẫn treo cứng UI, vì code đó phải chạy trên luồng chính.

**Web Worker** cho phép chạy JS trên **một thread thật sự khác**, song song với luồng chính. Thích hợp cho xử lý ảnh, parse file lớn, mã hoá, tính toán khoa học — luồng chính vẫn render và phản hồi bình thường. Mỗi worker có call stack và event loop riêng.

```js
const worker = new Worker("heavy.js");
worker.postMessage(data);
worker.onmessage = (e) => console.log("Kết quả:", e.data);
```

Giới hạn:

- **Không truy cập DOM**, không có `window`, `document` — muốn đổi giao diện phải gửi kết quả về luồng chính.
- **Không chia sẻ biến**: giao tiếp qua `postMessage`, dữ liệu được sao chép (structured clone). Dữ liệu lớn thì chi phí copy đáng kể — khi đó dùng transferable object hoặc `SharedArrayBuffer`.
- **Tốn tài nguyên**: mỗi worker là một thread thật, không nên tạo bừa bãi.
- Code phải nằm ở file riêng, debug khó hơn.

</details>

---

## 2. Callbacks, Promises, async/await

Bài học: [2. Callbacks, Promises, async/await](../../javascript/14-async/2_promises-async.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `callback hell` là gì? Ngoài chuyện khó đọc, nó còn gây khó khăn cụ thể nào về xử lý lỗi?**

<details className="qa">
<summary>Xem đáp án</summary>

**Callback hell** (hay "pyramid of doom") là tình trạng nhiều tác vụ bất đồng bộ phụ thuộc nhau bị lồng callback vào callback, tạo thành kim tự tháp lệch dần sang phải. Logic chính bị đẩy sâu vào tầng trong cùng, rất khó đọc và khó sửa.

Về xử lý lỗi, vấn đề nặng hơn nhiều:

- **Mỗi tầng phải tự kiểm tra lỗi**: dòng `if (err) return handle(err);` lặp đi lặp lại ở mọi cấp, chỉ cần quên một chỗ là lỗi bị nuốt im lặng.
- **Không có cơ chế lan truyền lỗi**: callback không "ném" lỗi lên trên được, mỗi tầng là một hòn đảo riêng.
- **`try/catch` vô dụng**: callback chạy ở tick sau, lúc đó khối `try` bao ngoài đã thoát khỏi call stack, nên không bắt được gì.
- **Dễ gọi callback hai lần** hoặc quên gọi, dẫn tới bug rất khó truy vết.

Promise giải đúng những điểm này: chuỗi `.then()` phẳng và **một `.catch()` duy nhất** bắt lỗi cho cả chuỗi.

</details>

**2. Quy ước `error-first callback` trong Node.js là gì và vì sao nó ra đời?**

<details className="qa">
<summary>Xem đáp án</summary>

Quy ước: callback luôn nhận **tham số đầu tiên là lỗi**, kết quả nằm ở các tham số sau. Không lỗi thì truyền `null`.

```js
fs.readFile("file.txt", "utf-8", (err, data) => {
  if (err) return console.error(err);
  console.log(data);
});
```

Vì sao ra đời: thời chưa có Promise, callback không có cách nào "ném" lỗi lên cho hàm gọi — `throw` bên trong callback async sẽ vượt ra ngoài mọi `try/catch` và làm sập process. Node cần một **giao ước chung** để mọi hàm async báo lỗi theo cùng một kiểu, thay vì mỗi thư viện tự nghĩ ra cách riêng (`onError` riêng, trả về `false`, object `{ok, data}`...).

Đặt lỗi ở vị trí **đầu tiên** là cố ý: nó buộc lập trình viên phải nhìn thấy và xử lý trước khi chạm tới dữ liệu. Nhờ quy ước thống nhất này mà sau này `util.promisify` có thể tự động chuyển mọi hàm callback-style của Node sang Promise.

</details>

**3. Một `Promise` có những trạng thái nào? Một promise đã settle rồi có đổi trạng thái được nữa không?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba trạng thái:

- **Pending** — đang chạy, chưa có kết quả.
- **Fulfilled** — thành công, kèm một **giá trị**.
- **Rejected** — thất bại, kèm một **lý do** (thường là `Error`).

"**Settled**" là từ gọi chung cho fulfilled và rejected — tức đã có kết quả cuối cùng.

**Không đổi được nữa.** Promise chỉ chuyển trạng thái **đúng một lần**: từ pending sang fulfilled hoặc rejected, rồi khoá vĩnh viễn. Gọi `resolve` hay `reject` thêm lần nữa bị **bỏ qua im lặng**, không lỗi:

```js
const p = new Promise((resolve, reject) => {
  resolve("lần 1");
  resolve("lần 2");   // bị bỏ qua
  reject(new Error()); // cũng bị bỏ qua
});
p.then(console.log); // "lần 1"
```

Tính bất biến này rất quan trọng: nó đảm bảo mọi `.then` gắn vào — kể cả gắn rất lâu sau khi promise đã settle — đều nhận cùng một kết quả, khác hẳn callback vốn có thể bị gọi nhầm nhiều lần.

</details>

**4. Executor truyền vào `new Promise(...)` chạy đồng bộ hay bất đồng bộ? Điều đó có hệ quả gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Executor chạy **đồng bộ**, ngay lập tức, trong lúc `new Promise(...)` còn chưa trả về. Chỉ có các callback `.then`/`.catch` mới là bất đồng bộ (microtask).

```js
console.log("A");
const p = new Promise((resolve) => {
  console.log("B");        // chạy NGAY — sync
  resolve("giá trị");
});
p.then((v) => console.log("C", v)); // microtask
console.log("D");

// In: A → B → D → C giá trị
```

Hệ quả cần nhớ:

- **Code nặng trong executor vẫn block luồng chính** — Promise không tự biến code đồng bộ thành bất đồng bộ.
- **Promise "khởi động ngay" (eager)**, không lười như một số ngôn ngữ khác: `new Promise(...)` là đã bắt đầu làm việc, dù bạn chưa `.then` hay `await`. Muốn trì hoãn thì phải bọc trong một hàm.
- Lỗi `throw` đồng bộ bên trong executor được tự động chuyển thành **reject**, nên vẫn bắt được bằng `.catch`.

</details>

**5. Giải thích chuỗi `.then().then().catch()`: mỗi `.then` trả về cái gì, và vì sao chuỗi lại "phẳng" chứ không lồng nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi `.then()` **trả về một Promise hoàn toàn mới**, chứ không phải promise gốc. Promise mới này settle dựa trên điều xảy ra trong callback: callback return giá trị thường → promise mới fulfilled với giá trị đó; callback return một Promise → promise mới "bám theo" promise đó; callback `throw` → promise mới rejected.

Chính vì mỗi mắt xích trả về một Promise mới nên ta gọi tiếp `.then` lên nó được, tạo thành **chuỗi phẳng** thay vì lồng nhau:

```js
fetch("/api/user/1")
  .then(res => res.json())
  .then(user => fetch(`/api/orders/${user.id}`))
  .then(res => res.json())
  .then(orders => console.log(orders))
  .catch(err => console.error(err));
```

So với callback, bước sau không phải nằm *bên trong* bước trước mà chỉ nối *tiếp sau*, nên độ thụt lề không tăng dù có bao nhiêu bước.

`.catch(fn)` thực chất chỉ là viết tắt của `.then(undefined, fn)` — nó cũng là một mắt xích, đứng cuối để hứng lỗi văng ra từ bất kỳ mắt xích nào phía trên.

</details>

**6. Trong `.then`, `return` một giá trị thường khác `return` một Promise ở chỗ nào đối với mắt xích phía sau?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Return giá trị thường**: mắt xích sau nhận **chính giá trị đó** ngay ở microtask kế tiếp.
- **Return một Promise**: chuỗi **dừng lại chờ** promise đó settle, rồi mắt xích sau nhận **giá trị đã bóc vỏ** bên trong — không phải object Promise. Nếu promise đó reject thì chuỗi nhảy thẳng xuống `.catch`.

```js
Promise.resolve(1)
  .then(v => v + 1)                    // return số → 2
  .then(v => Promise.resolve(v * 10))  // return Promise → CHỜ, bóc ra 20
  .then(v => console.log(v));          // 20, không phải Promise
```

Cơ chế này gọi là **adoption** (hay "unwrap"): Promise không bao giờ lồng Promise trong Promise. Đây chính là thứ khiến chuỗi `.then` xâu được các bước async phụ thuộc nhau:

```js
loadUser(1)
  .then(user => loadOrders(user.id)) // trả Promise → bước sau nhận orders thật
  .then(orders => console.log(orders));
```

Lỗi kinh điển là **quên `return`**: nếu viết `.then(user => { loadOrders(user.id); })` thì mắt xích sau nhận `undefined` ngay, không chờ gì cả.

</details>

**7. `.catch()` đặt giữa chuỗi và đặt cuối chuỗi khác nhau thế nào? Sau khi `.catch()` bắt được lỗi thì chuỗi phía sau còn chạy không?**

<details className="qa">
<summary>Xem đáp án</summary>

`.catch` chỉ bắt lỗi từ **các mắt xích phía trên nó**. Đặt ở cuối thì bắt được lỗi của cả chuỗi — đây là cách dùng phổ biến. Đặt ở giữa thì lỗi của các mắt xích **sau** nó sẽ không được bắt, dẫn tới unhandled rejection.

Sau khi `.catch` xử lý xong, chuỗi **vẫn chạy tiếp** và quay về trạng thái **fulfilled** (giống như đã "chữa lành"):

```js
Promise.reject(new Error("hỏng"))
  .catch(err => {
    console.log("đã xử lý:", err.message);
    return "giá trị thay thế";  // chuỗi trở lại fulfilled
  })
  .then(v => console.log(v));   // "giá trị thay thế" — VẪN CHẠY
```

Đây vừa là tính năng vừa là cái bẫy: `.catch` giữa chuỗi cho phép **fallback** (thử nguồn dữ liệu khác rồi đi tiếp), nhưng nếu bạn tưởng chuỗi sẽ dừng lại thì sẽ ngạc nhiên khi các bước sau vẫn chạy với dữ liệu rỗng.

Muốn dừng hẳn, hãy **ném lại lỗi** trong `.catch`: `catch(err => { log(err); throw err; })`.

</details>

**8. `.finally()` chạy vào lúc nào? Nó có nhận giá trị resolve không, và có làm đổi giá trị truyền xuống dưới không?**

<details className="qa">
<summary>Xem đáp án</summary>

`.finally(fn)` chạy khi promise **settle**, bất kể fulfilled hay rejected — giống khối `finally` của `try/catch`. Dùng cho dọn dẹp: tắt spinner, đóng kết nối, bật lại nút submit.

```js
setLoading(true);
fetchData()
  .then(render)
  .catch(showError)
  .finally(() => setLoading(false)); // chạy ở CẢ hai nhánh
```

**Không nhận đối số**: callback của `.finally` được gọi với tham số rỗng, vì nó không cần biết kết quả là thành công hay thất bại.

**Không làm đổi giá trị truyền xuống**: giá trị (hoặc lý do reject) đi xuyên qua `.finally` nguyên vẹn, `return` bên trong bị **bỏ qua**:

```js
Promise.resolve("A")
  .finally(() => "B")
  .then(v => console.log(v)); // "A", không phải "B"
```

Hai ngoại lệ: nếu callback trong `.finally` **`throw`** hoặc trả về một promise bị **reject**, thì lỗi đó sẽ ghi đè kết quả cũ. Ngoài ra, nếu nó trả về một promise, chuỗi vẫn chờ promise đó settle trước khi đi tiếp.

</details>

**9. `async function` trả về gì khi bên trong bạn `return 42`? Còn khi bên trong `throw` thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`async function` **luôn trả về một Promise**, không bao giờ trả về giá trị trực tiếp.

```js
async function getValue() {
  return 42;
}

getValue();                 // Promise<42> — KHÔNG phải 42
getValue().then(v => v);    // 42
const x = await getValue(); // 42
```

`return 42` nghĩa là promise đó **fulfilled với giá trị 42**. Nếu bạn `return` một Promise, nó được bóc vỏ tự động — không có chuyện `Promise<Promise<...>>`.

`throw` bên trong biến promise thành **rejected**, với lý do chính là thứ bạn ném:

```js
async function fail() {
  throw new Error("hỏng");
}

fail();                       // Promise rejected
fail().catch(e => console.log(e.message)); // "hỏng"

try {
  await fail();               // await ném lại lỗi
} catch (e) { /* bắt được ở đây */ }
```

Nói cách khác, `return` ↔ `resolve`, `throw` ↔ `reject`. Lỗi kinh điển của người mới là quên `await` rồi tưởng mình đang cầm giá trị, trong khi thực ra đang cầm một object Promise.

</details>

**10. `await` thực chất làm gì với phần code phía sau nó? Nó có "block" luồng chính không? Giải thích qua event loop.**

<details className="qa">
<summary>Xem đáp án</summary>

`await` **cắt đôi** hàm async: phần code phía sau nó được biến thành một **microtask** — tương đương callback trong `.then()`. Hàm tạm dừng tại đó và **trả quyền điều khiển về cho caller** ngay lập tức.

**Không block luồng chính.** Call stack được giải phóng, event loop tiếp tục chạy code khác, render UI, xử lý click bình thường. Khi promise được chờ đã settle, phần còn lại của hàm mới được xếp vào microtask queue và chạy khi call stack rỗng.

```js
async function f() {
  console.log(1);  // sync, chạy ngay khi gọi f()
  await null;      // cắt: phần sau → microtask
  console.log(2);  // microtask
}
f();
console.log(3);    // sync

// In: 1 → 3 → 2
```

Cảm giác "dừng chờ" chỉ đúng **bên trong hàm async đó**, không phải với cả chương trình. Đây là điểm khác biệt sống còn so với vòng `while` chờ thời gian — cái đó mới thực sự treo trang.

Lưu ý: `await null` vẫn tạo microtask dù không phải Promise — cứ có `await` là có điểm cắt.

</details>

**11. So sánh `Promise.all`, `Promise.allSettled`, `Promise.race`, `Promise.any`: mỗi cái resolve khi nào và reject khi nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Resolve khi | Reject khi | Giá trị trả về | Use case |
|---|---|---|---|---|
| `all` | Tất cả fulfilled | **Bất kỳ** cái nào reject (fail-fast) | Mảng kết quả đúng thứ tự đầu vào | Cần tất cả thành công |
| `allSettled` | Tất cả đã settle | **Không bao giờ** | Mảng `{status, value}` hoặc `{status, reason}` | Cần biết kết quả từng cái |
| `race` | Cái **đầu tiên** settle, nếu là fulfilled | Cái **đầu tiên** settle, nếu là rejected | Giá trị/lý do của cái đầu tiên | Timeout pattern |
| `any` | Cái **fulfilled đầu tiên** | **Tất cả** đều reject | Giá trị của cái nhanh nhất thành công | Fallback, fastest wins |

Hai cặp dễ nhầm:

- `all` vs `allSettled`: khác ở chỗ có "gãy" khi một cái lỗi hay không.
- `race` vs `any`: `race` quan tâm cái **settle** đầu tiên (kể cả lỗi), `any` bỏ qua lỗi và chỉ chờ cái **thành công** đầu tiên.

Mẹo nhớ: `race` là cuộc đua ai về đích trước, kể cả về đích bằng cách ngã; `any` là chỉ cần một người về đích tử tế.

</details>

**12. Khi `Promise.all` gặp một promise reject, các promise còn lại có bị hủy không? Chuyện gì xảy ra với kết quả của chúng?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không bị hủy.** JavaScript không có cơ chế hủy Promise. Các promise còn lại **vẫn chạy tới cùng** — request vẫn bay đi, server vẫn xử lý, file vẫn được ghi. Chỉ có điều `Promise.all` đã reject rồi nên **kết quả của chúng bị vứt bỏ**, không ai nhận.

```js
const p = Promise.all([
  fetch("/a"),                         // vẫn chạy tới cùng
  Promise.reject(new Error("hỏng")),   // reject ngay
  fetch("/c"),                         // vẫn chạy tới cùng
]);
// p reject ngay lập tức, nhưng /a và /c vẫn đang bay
```

Hai hệ quả thực tế:

- **Side effect vẫn xảy ra**: nếu các tác vụ kia ghi database hay trừ tiền, chúng vẫn thực hiện dù bạn tưởng thao tác đã "thất bại". Đây là nguồn bug dữ liệu không nhất quán.
- **Lỗi muộn không gây unhandled rejection**: `Promise.all` đã gắn handler lên tất cả đầu vào, nên cái nào reject sau đó cũng được coi là đã xử lý, chỉ bị bỏ qua lặng lẽ.

Muốn thật sự dừng, phải dùng `AbortController` và truyền `signal` cho từng request.

</details>

**13. Một dashboard gọi ba API độc lập — chọn `Promise.all` hay `Promise.allSettled`? Phân tích đánh đổi về trải nghiệm người dùng.**

<details className="qa">
<summary>Xem đáp án</summary>

Với ba widget **độc lập**, chọn **`Promise.allSettled`**.

`Promise.all` là fail-fast: chỉ cần một API lỗi (ví dụ dịch vụ thông báo đang bảo trì) là cả khối `await` ném lỗi, người dùng nhận một trang trắng hoặc màn hình lỗi toàn cục — dù hai widget kia đã có dữ liệu ngon lành. Trải nghiệm rất tệ vì mức độ hỏng không tương xứng với mức độ lỗi.

```js
// Tệ — 1 widget lỗi → cả dashboard lỗi
const data = await Promise.all([fetchUser(), fetchStats(), fetchNotifs()]);

// Tốt — render được phần thành công
const results = await Promise.allSettled([fetchUser(), fetchStats(), fetchNotifs()]);
results.forEach((r, i) => {
  if (r.status === "fulfilled") render(i, r.value);
  else renderError(i, r.reason); // chỉ widget đó báo lỗi, kèm nút thử lại
});
```

Nguyên tắc chọn: dùng `all` khi các phần **phụ thuộc nhau**, thiếu một cái là dữ liệu vô nghĩa (ví dụ cần cả user và quyền hạn mới render được trang). Dùng `allSettled` khi các phần **độc lập**, hỏng từng phần vẫn dùng được — đây chính là tinh thần graceful degradation.

</details>

**14. `Promise.any` reject với loại lỗi nào khi tất cả đầu vào đều thất bại?**

<details className="qa">
<summary>Xem đáp án</summary>

Reject với một **`AggregateError`** — loại lỗi chuẩn (ES2021) dùng để gói **nhiều lỗi** vào một. Nó có thuộc tính `.errors` là mảng chứa lý do reject của từng promise, **theo đúng thứ tự đầu vào**, cùng `.message` mặc định kiểu "All promises were rejected".

```js
try {
  const fastest = await Promise.any([
    fetch(server1),
    fetch(server2),
    fetch(server3),
  ]);
} catch (err) {
  console.log(err instanceof AggregateError); // true
  console.log(err.errors);   // [lỗi1, lỗi2, lỗi3]
  console.log(err.message);  // "All promises were rejected"
}
```

Thiết kế này hợp lý vì `Promise.any` chỉ thất bại khi **mọi** phương án đều hỏng — lúc đó bạn cần biết *tất cả* lý do để chẩn đoán, chứ chỉ một lỗi thì không đủ.

Lưu ý phân biệt: `Promise.all` reject với **một lỗi duy nhất** — lý do của promise reject đầu tiên, vì nó gãy ngay tại đó.

</details>

**15. Cài timeout cho request bằng `Promise.race` như thế nào? Cách này có thực sự hủy request không, và nên dùng gì thay thế?**

<details className="qa">
<summary>Xem đáp án</summary>

Cho request đua với một promise chỉ biết reject sau N mili giây — ai settle trước thì thắng:

```js
const result = await Promise.race([
  fetch(url),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), 5000)
  ),
]);
```

**Không hủy được request.** `Promise.race` chỉ quyết định bạn *nghe theo* kết quả nào; request vẫn bay tới server, server vẫn xử lý, kết nối vẫn mở, response về vẫn tốn băng thông — chỉ là không ai dùng tới. Với polling hay danh sách dài, cách này rò rỉ tài nguyên dần.

Cách đúng là dùng **`AbortController`** để hủy thật:

```js
const ctrl = new AbortController();
const timer = setTimeout(() => ctrl.abort(), 5000);
try {
  const res = await fetch(url, { signal: ctrl.signal });
  return await res.json();
} finally {
  clearTimeout(timer);
}
```

Trình duyệt hiện đại còn có sẵn `AbortSignal.timeout(5000)` viết gọn hơn. `Promise.race` vẫn hữu ích cho các tác vụ không hỗ trợ `signal`, nhưng hãy hiểu rõ giới hạn của nó.

</details>

**16. `await` trong vòng `for` khác `Promise.all(ids.map(...))` thế nào về hiệu năng? Nếu mỗi lời gọi mất 1 giây và có 5 id thì mỗi cách mất bao lâu?**

<details className="qa">
<summary>Xem đáp án</summary>

- `await` trong `for`: **tuần tự** — mỗi lượt chờ xong mới bắt đầu lượt sau → **~5 giây**.
- `Promise.all(ids.map(...))`: **song song** — cả 5 request được phát đi gần như cùng lúc, chỉ chờ cái chậm nhất → **~1 giây**.

```js
// Tuần tự — ~5 giây
for (const id of ids) {
  const user = await fetchUser(id);
  console.log(user);
}

// Song song — ~1 giây
const users = await Promise.all(ids.map(id => fetchUser(id)));
```

Mấu chốt nằm ở **thời điểm phát request**. Trong vòng `for`, `fetchUser(id)` chỉ được gọi khi tới lượt. Còn `ids.map(...)` chạy hết ngay lập tức, tạo ra cả 5 promise đang chạy song song, rồi `Promise.all` mới ngồi chờ.

`Promise.all` cũng giữ **đúng thứ tự** kết quả theo mảng đầu vào, nên không phải lo kết quả về lộn xộn. Đây là một trong những tối ưu dễ nhất và cho hiệu quả rõ rệt nhất khi review code async.

</details>

**17. Khi nào bắt buộc phải `await` tuần tự thay vì chạy song song?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba nhóm trường hợp:

- **Bước sau cần kết quả của bước trước.** Đây là ràng buộc logic, không cách nào song song hoá: phải có `user` mới biết `user.id` để gọi `loadOrders`.
- **Cần thứ tự tuyệt đối.** Khi các thao tác có side effect phụ thuộc thứ tự — ghi log theo trình tự, chạy migration, gửi tin nhắn phải đúng thứ tự, cập nhật cùng một bản ghi.
- **Bị rate limit hoặc tài nguyên hạn chế.** Bắn 1000 request cùng lúc sẽ ăn lỗi 429, làm sập server của chính mình, hoặc cạn connection pool của database. Ở đây không nhất thiết phải tuần tự hoàn toàn — giải pháp tốt hơn là **giới hạn số việc chạy đồng thời**:

```js
import pLimit from "p-limit";

const limit = pLimit(5); // tối đa 5 song song
const users = await Promise.all(ids.map(id => limit(() => fetchUser(id))));
```

Ngoài ba nhóm này, mặc định nên chạy song song. Một cái bẫy hay gặp là dùng `await` tuần tự chỉ vì viết vòng `for` cho tiện, dù các lời gọi hoàn toàn độc lập.

</details>

**18. Làm sao giới hạn số request chạy song song (ví dụ tối đa 5) khi có 1000 việc? Mô tả ý tưởng cài đặt.**

<details className="qa">
<summary>Xem đáp án</summary>

Ý tưởng là **concurrency pool**: luôn giữ đúng N việc đang chạy, mỗi khi một việc xong thì lấy việc kế tiếp trong hàng đợi thế chỗ — chứ không chia thành từng lô rồi chờ cả lô (cách chia lô lãng phí vì phải đợi việc chậm nhất của lô).

Cách gọn nhất là dùng thư viện `p-limit`:

```js
import pLimit from "p-limit";

const limit = pLimit(5);
const results = await Promise.all(ids.map(id => limit(() => fetchUser(id))));
```

Tự viết thì dựng N "worker" cùng rút việc từ một con trỏ chung:

```js
async function chayVoiGioiHan(items, n, worker) {
  const results = [];
  let i = 0;
  async function chay() {
    while (i < items.length) {
      const idx = i++;                 // rút việc kế tiếp
      results[idx] = await worker(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: n }, chay));
  return results;
}
```

Lưu ý ghi kết quả theo `idx` để giữ đúng thứ tự, và cân nhắc `allSettled` nếu không muốn một lỗi làm gãy toàn bộ.

</details>

**19. `unhandled promise rejection` là gì? Browser và Node xử lý nó khác nhau ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Là tình trạng một Promise bị reject nhưng **không có `.catch` hay `try/catch`** nào hứng lỗi đó. Lỗi không biến mất — nó chỉ không được xử lý, và runtime phải tự báo.

```js
loadData();                  // Tệ — nếu reject thì không ai bắt
loadData().catch(handleError); // Tốt
```

Khác biệt giữa hai môi trường:

| | Browser | Node.js |
|---|---|---|
| Hành vi | In lỗi đỏ ra console, ứng dụng **vẫn chạy tiếp** | Từ Node 15 trở đi, mặc định **ném lỗi và kết thúc process** |
| Sự kiện để bắt | `window.addEventListener("unhandledrejection", ...)` | `process.on("unhandledRejection", ...)` |

Node xử lý nghiêm khắc hơn vì trên server, một trạng thái lỗi bị bỏ qua có thể âm thầm làm hỏng dữ liệu — thà "fail fast" rồi để process manager khởi động lại còn hơn chạy tiếp trong trạng thái không xác định.

Một chi tiết tinh tế: gắn `.catch` **quá muộn** (ở tick sau) cũng có thể bị báo unhandled, vì runtime kiểm tra ngay cuối lượt microtask hiện tại.

</details>

**20. Vì sao `try { await op(); } catch {}` rỗng là anti-pattern? Nên viết thế nào cho đúng?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì nó **nuốt lỗi hoàn toàn**: chương trình chạy tiếp như thể mọi thứ ổn, trong khi thao tác đã thất bại. Hậu quả là bug biểu hiện ở một chỗ hoàn toàn khác (dữ liệu rỗng, state sai), không có log, không có stack trace — mất hàng giờ để truy vết. Đây là một trong những anti-pattern tốn kém nhất trong code async.

```js
// Tệ
try { await op(); } catch {}

// Tốt — log lại
try {
  await op();
} catch (err) {
  logger.error(err);
}
```

Các cách xử lý đúng, tuỳ tình huống:

- **Log rồi ném lại** (`throw err`) khi tầng trên cần biết để hiển thị lỗi cho người dùng.
- **Trả giá trị fallback** khi lỗi thực sự chấp nhận được — nhưng vẫn phải log.
- **Hiển thị lỗi cho người dùng** kèm hành động tiếp theo (nút thử lại).

Nếu bạn cố tình bỏ qua lỗi, hãy để lại **comment giải thích vì sao** và log ở mức `debug`. Nguyên tắc: lỗi có thể được bỏ qua, nhưng không bao giờ được **vô hình**.

</details>

**21. Đoạn sau in ra thứ tự nào: `console.log("A"); (async () => { console.log("B"); await null; console.log("C"); })(); Promise.resolve().then(() => console.log("D")); console.log("E");`**

<details className="qa">
<summary>Xem đáp án</summary>

Output: **`A` → `B` → `E` → `C` → `D`**

```js
console.log("A");                    // 1. sync
(async () => {
  console.log("B");                  // 2. sync — thân async chạy ngay tới await
  await null;                        //    cắt: phần sau → microtask #1
  console.log("C");                  // 4. microtask #1
})();
Promise.resolve().then(() => console.log("D")); // microtask #2
console.log("E");                    // 3. sync
```

Diễn giải:

- `A` in ngay.
- Gọi IIFE async: phần thân **trước `await` chạy đồng bộ** → in `B`. Gặp `await null`, phần còn lại được xếp vào microtask queue (vị trí 1) và hàm trả quyền điều khiển về.
- `.then(D)` được đăng ký sau nên vào microtask queue ở vị trí 2.
- `E` in ngay — vẫn là sync code.
- Call stack rỗng → vét microtask theo thứ tự đăng ký: `C` rồi `D`.

Bẫy của câu này là nhiều người tưởng `B` chạy async. Nhớ: **code trước `await` đầu tiên trong hàm async là code đồng bộ**.

</details>

**22. Hãy tự viết `promisify` biến một hàm callback-style thành hàm trả về Promise — cần xử lý những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Ý tưởng: trả về một hàm mới, bên trong tạo Promise, gọi hàm gốc với các đối số ban đầu cộng thêm một callback do ta tự dựng theo quy ước error-first.

```js
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };
}

const readFile = promisify(fs.readFile);
const data = await readFile("file.txt", "utf-8");
```

Những điểm cần xử lý:

- **Callback luôn nằm ở vị trí cuối cùng** — dùng rest `...args` rồi nối callback vào sau.
- **Quy ước error-first**: `err` khác `null` thì `reject`, ngược lại `resolve` kết quả.
- **Giữ `this`** bằng `fn.call(this, ...)` để promisify được method của object.
- **Hàm không theo quy ước error-first** thì không dùng được — phải bọc thủ công.
- Trường hợp callback trả **nhiều giá trị** thì cần gom thành mảng hoặc object.

Node đã có sẵn `util.promisify` làm đúng việc này, kèm hỗ trợ `util.promisify.custom`.

</details>

**23. `top-level await` trong ES Module là gì? Nó ảnh hưởng thế nào tới thứ tự load của các module khác?**

<details className="qa">
<summary>Xem đáp án</summary>

**Top-level await** (ES2022) cho phép dùng `await` **ngay ở cấp cao nhất** của một ES Module, không cần bọc trong `async function`:

```js
// module.mjs hoặc package.json có "type": "module"
const config = await fetch("/config.json").then(r => r.json());
export { config };
```

Chỉ hoạt động trong ES Module (`.mjs`, `type: "module"`, hoặc `<script type="module">`), không dùng được trong CommonJS hay script thường.

Ảnh hưởng tới thứ tự load: module đó trở thành **module bất đồng bộ**. Mọi module `import` nó sẽ **chờ** nó hoàn tất trước khi thân mình được thực thi — tính "lây" ngược lên toàn bộ cây phụ thuộc. Các module anh em không liên quan vẫn được đánh giá bình thường, nên không phải mọi thứ đều bị chặn.

Đánh đổi: rất tiện để khởi tạo config, kết nối database, chọn module động — thay cho pattern IIFE async xấu xí. Nhưng nếu `await` ở top-level chậm, nó **trì hoãn khởi động cả ứng dụng**, và trong đồ thị import có chu trình thì có nguy cơ deadlock. Nên chỉ dùng cho những thứ thực sự bắt buộc phải có trước khi chạy.

</details>
