---
sidebar_position: 22
title: "22. Mitigation Strategies"
---

# 22. Mitigation Strategies

## 1. Mitigation Strategies

Bài học: [1. Mitigation Strategies](../../backend/22-mitigation/1_mitigation-strategies.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `graceful degradation` là gì? Cho ví dụ những tính năng nên fallback thay vì trả lỗi, và những tính năng không được phép degrade.**

<details className="qa">
<summary>Xem đáp án</summary>

`graceful degradation` = khi một phần hệ thống hỏng, **giảm bớt tính năng thay vì sập toàn bộ**. Người dùng mất một chút trải nghiệm chứ không mất cả sản phẩm.

Nên fallback:

- **Recommendation engine** down → hiển thị danh sách bán chạy lấy thẳng từ DB.
- **Image CDN** chậm → dùng placeholder hoặc ảnh chất lượng thấp.
- **Search** down → ẩn ô tìm kiếm, vẫn cho duyệt danh mục.
- **Email/notification** tắc → đẩy vào queue gửi sau.
- Số liệu thống kê, badge, feed phụ → ẩn đi.

Không được phép degrade — những thứ liên quan tới **đúng/sai và tiền bạc**: kiểm tra xác thực và phân quyền (không bao giờ "lỗi thì cho qua"), trừ tồn kho, ghi nhận thanh toán, ghi audit log. Với các luồng này, thà từ chối rõ ràng còn hơn xử lý mập mờ.

Nguyên tắc chọn: nếu kết quả suy giảm chỉ khiến user hơi khó chịu thì fallback; nếu nó có thể tạo ra dữ liệu sai hoặc lỗ hổng bảo mật thì phải fail rõ ràng.

</details>

**2. Phân biệt `fail fast` và `fail silent`. Vì sao nuốt exception bằng `try/catch` rỗng lại nguy hiểm hơn là để lỗi nổ ra?**

<details className="qa">
<summary>Xem đáp án</summary>

- `fail fast` — phát hiện lỗi là **báo ngay và rõ**: circuit breaker ở trạng thái `OPEN` trả lỗi tức thì thay vì bắt user chờ 30 giây, validation sai thì từ chối luôn.
- `fail silent` — nuốt lỗi, giả vờ mọi thứ vẫn ổn.

Nuốt exception nguy hiểm hơn vì:

- **Hỏng ngầm** — app báo "OK" nhưng dữ liệu đã sai; đơn hàng trông như tạo thành công mà thanh toán chưa hề chạy.
- **Không có tín hiệu** — không log, không metric, không alert; sự cố chỉ lộ ra khi khách hàng phàn nàn, thường là nhiều ngày sau.
- **Mất dấu vết** — stack trace gốc bốc hơi, tới lúc điều tra không còn gì để lần.
- **Lỗi lan xa khỏi nơi phát sinh** — chỗ nổ cuối cùng chẳng liên quan gì tới nguyên nhân.

```ts
// SAI — nuốt lỗi
try { await chargeCard(); } catch (e) {}

// ĐÚNG — fallback có ý thức, vẫn để lại dấu vết
try {
  return await mlService.recommend(userId);
} catch (err) {
  logger.warn({ err }, "ML service down, fallback to popular");
  return await getPopularProducts();
}
```

Fallback là hợp lệ, nhưng phải **log + đo đếm + alert**; im lặng thì không.

</details>

**3. Mô tả 3 trạng thái của `circuit breaker` (`CLOSED` → `OPEN` → `HALF-OPEN`) và điều kiện chuyển đổi giữa chúng. Vì sao cần trạng thái `HALF-OPEN`?**

<details className="qa">
<summary>Xem đáp án</summary>

Giống cái cầu dao điện trong ví dụ của bài:

- **`CLOSED`** — bình thường, request đi qua. Breaker đếm tỷ lệ lỗi trong một cửa sổ quan sát. Vượt ngưỡng (ví dụ hơn 50% lỗi) → chuyển `OPEN`.
- **`OPEN`** — chặn hết, **trả lỗi hoặc fallback ngay lập tức** mà không gọi downstream. Vừa fail fast cho caller, vừa rút tải để downstream có cơ hội hồi phục. Sau `resetTimeout` (ví dụ 30s) → chuyển `HALF-OPEN`.
- **`HALF-OPEN`** — cho **một (hoặc vài) request thử** đi qua. Thành công → về `CLOSED`; thất bại → quay lại `OPEN` và đếm lại thời gian chờ.

Cần `HALF-OPEN` vì nếu không có nó, breaker chỉ có hai lựa chọn tồi: hoặc mở mãi mãi (không bao giờ tự phục hồi, phải can thiệp tay), hoặc hết timeout là thả **toàn bộ lưu lượng** trở lại cùng lúc — downstream vừa mới ngóc đầu dậy lập tức bị đè chết lần nữa. `HALF-OPEN` là bước **thăm dò có kiểm soát**: bỏ ra một request để trả lời câu hỏi "đã khoẻ chưa?" với rủi ro tối thiểu.

</details>

**4. Bạn chọn ngưỡng `errorThresholdPercentage` và `resetTimeout` dựa trên cơ sở nào? Đặt quá nhạy và đặt quá lỳ thì mỗi bên hỏng như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Cơ sở lựa chọn:

- **Tỷ lệ lỗi nền lúc bình thường** — ngưỡng phải nằm khá cao trên mức nhiễu thường ngày (mặc định 50% là điểm khởi đầu hợp lý).
- **Số mẫu tối thiểu** (`volumeThreshold`) — quan trọng không kém tỷ lệ: 1 lỗi trên 2 request là 50% nhưng chẳng nói lên gì.
- **Thời gian phục hồi điển hình** của downstream — `resetTimeout` nên xấp xỉ thời gian nó thường cần để đứng dậy (thường 10–60s).
- **Tính chất luồng** — luồng quan trọng có fallback tốt thì nhạy hơn được; luồng không có fallback thì nên lỳ hơn.

| | Quá nhạy | Quá lỳ |
|---|---|---|
| Hành vi | Mở mạch vì nhiễu thoáng qua | Mãi không mở dù downstream đã chết |
| Hậu quả | Tự tạo downtime, user nhận lỗi trong khi service vẫn ổn; mạch đóng-mở liên tục gây trải nghiệm thất thường | Request dồn lại chờ timeout, connection pool cạn, **cascade failure** lan sang service khác |

`resetTimeout` cũng vậy: quá ngắn thì cứ liên tục ném request thử vào một hệ đang hấp hối; quá dài thì downstream đã khoẻ từ lâu mà người dùng vẫn nhận lỗi. Cách làm đúng là chọn số ban đầu theo dữ liệu quan sát, rồi **đo và chỉnh** — đồng thời gắn alert vào sự kiện `open` để biết mỗi lần mạch nhảy.

</details>

**5. Một downstream không trả lỗi mà chỉ *chậm* — `circuit breaker` có bắt được không? Cần kết hợp thêm cơ chế gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Chỉ bắt được **nếu breaker có timeout**, vì breaker vốn đếm *lỗi*; request treo mãi không trả về thì không được tính là lỗi, cũng không tính là thành công — breaker đứng im trong khi hệ thống chết dần. Đây chính là lý do `opossum` có sẵn tuỳ chọn `timeout: 3000`: hết hạn thì request được coi là lỗi và mới được tính vào ngưỡng.

Thực ra "chậm" là kịch bản **nguy hiểm hơn lỗi hẳn**: lỗi nhanh chỉ tốn một lượt gọi, còn chậm thì mỗi request giữ một connection và một luồng chờ, tài nguyên cạn dần tới lúc cả service chết dù chưa thấy lỗi nào.

Cần kết hợp:

- **Timeout ở mọi tầng**, và cascading (con nhỏ hơn cha).
- **Bulkhead** — pool riêng cho từng downstream để cái chậm không ngốn hết chỗ của luồng quan trọng.
- **Giới hạn concurrency** cho mỗi dependency.
- **Đo p99 latency và alert**, chứ không chỉ alert theo error rate.
- **Breaker theo latency** — một số thư viện cho phép mở mạch khi latency vượt ngưỡng, không cần đợi có lỗi.

</details>

**6. Vì sao mọi external call bắt buộc phải có `timeout`? Nếu không đặt timeout thì tài nguyên nào cạn trước tiên và hậu quả lan ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì không có timeout nghĩa là bạn **giao quyền quyết định thời gian sống của request cho bên thứ ba**. Mặc định của nhiều client HTTP là chờ vô hạn; downstream treo thì request của bạn treo theo mãi mãi.

Thứ tự cạn kiệt:

1. **Connection/thread pool** — mỗi request đang chờ chiếm một chỗ. Pool 100 chỗ mà downstream chậm 30s với 50 request/giây thì chỉ vài giây là hết chỗ.
2. **Connection tới DB** — các request khác không xin được connection nên **cũng chết, dù chẳng liên quan gì tới downstream kia**.
3. **Bộ nhớ** — mỗi request treo vẫn giữ buffer, context, socket; hàng chục nghìn request treo là OOM.
4. **File descriptor / socket** — chạm giới hạn hệ điều hành, không nhận nổi kết nối mới.

Hậu quả là **cascade failure** kinh điển: một dependency phụ, không quan trọng, bị chậm — và cả service của bạn sập, rồi kéo theo service gọi tới bạn. Thêm vào đó, người dùng đằng nào cũng đã bỏ đi từ lâu, còn bạn vẫn giữ tài nguyên để hoàn thành một việc chẳng còn ai cần.

</details>

**7. `cascading timeout` là gì? Vì sao timeout của tầng con phải nhỏ hơn tầng cha, và điều gì xảy ra khi cấu hình ngược lại?**

<details className="qa">
<summary>Xem đáp án</summary>

`cascading timeout` = ngân sách thời gian giảm dần theo độ sâu của chuỗi gọi:

```
User request:  30s
  API gateway: 25s
    Service A: 20s
      DB query: 15s
```

Tầng con phải nhỏ hơn để tầng cha **còn thời gian phản ứng**: DB treo thì ở giây thứ 15 service A đã biết, kịp thử fallback, kịp ghi log có ý nghĩa, và trả về lỗi tử tế trong khi user vẫn đang chờ.

Cấu hình ngược lại (con lâu hơn cha) sinh ra đúng cảnh nhà hàng trong bài — khách đứng dậy ra về ở phút 30 trong khi bếp vẫn hì hục nấu:

- Tầng cha timeout và trả lỗi cho user, **nhưng tầng con vẫn tiếp tục chạy**, vẫn giữ connection, vẫn tiêu CPU cho một kết quả không ai nhận.
- Timeout của tầng con trở nên vô nghĩa vì không bao giờ có cơ hội kích hoạt.
- Tệ nhất là **công việc vẫn hoàn tất** sau khi user đã nhận lỗi: user bấm lại, và bạn có hai đơn hàng.

Bổ sung nên có: truyền deadline xuống tầng dưới (deadline propagation) và **huỷ thật sự** khi hết hạn bằng `AbortSignal` hoặc cơ chế cancel tương đương.

</details>

**8. Vì sao retry nên dùng `exponential backoff` thay vì khoảng cách cố định? `jitter` được thêm vào để giải quyết chuyện gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Khoảng cách cố định (retry mỗi giây) **đổ thêm tải vào đúng hệ thống đang hấp hối**: nó nhân lưu lượng lên nhiều lần đúng lúc downstream cần được nghỉ nhất. `exponential backoff` giãn dần — 1s, 2s, 4s, 8s, 16s — vừa cho downstream thời gian hồi sức, vừa vẫn thử lại nhanh với sự cố thoáng qua. Đúng như ví dụ gọi điện gặp máy bận trong bài.

`jitter` giải quyết vấn đề **đồng bộ hoá**: nếu một nghìn client cùng fail tại một thời điểm (downstream vừa restart) và ai cũng chờ đúng 4 giây, thì tới giây thứ 4 cả nghìn request lại ập vào cùng lúc và giết nó lần nữa — `retry storm`. Cộng một lượng ngẫu nhiên vào mỗi lần chờ sẽ **dàn đều dòng người quay lại**.

```ts
const delay = baseDelay * Math.pow(2, attempt - 1);
const jitter = Math.random() * 500;
await new Promise(r => setTimeout(r, delay + jitter));
```

Kèm theo đó luôn cần: **giới hạn số lần** (thường tối đa 3) và **trần tổng thời gian** (dưới 30s), nếu không bạn biến một lỗi nhanh thành 10 phút latency — đúng lỗi "over-retry" bài đã cảnh báo.

</details>

**9. Lỗi nào nên retry, lỗi nào không? Giải thích vì sao `400`/`401`/`422` không nên retry còn `429`/`503` thì nên, và bạn tôn trọng header `Retry-After` thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: **chỉ retry lỗi transient** — lỗi mà lần gọi sau có cơ hội thành công vì trạng thái bên kia thay đổi.

| Lỗi | Retry? | Lý do |
|---|---|---|
| Network timeout, `503` | Có | Sự cố tạm thời, lát nữa có thể hết |
| `429` | Có | Chỉ là đang bị giới hạn nhịp độ |
| `500` | Có (thận trọng) | Có thể là hiccup, nhưng cũng có thể là bug |
| `400`, `422` | Không | Input sai — gửi lại y hệt thì vẫn sai |
| `401`, `403` | Không | Sai xác thực/phân quyền; chỉ retry sau khi đã refresh token |
| `404` | Không | Dữ liệu không tồn tại |

Nói gọn: `4xx` là **lỗi của bạn**, retry chỉ lãng phí và làm nhiễu số liệu; `5xx` và lỗi mạng là **lỗi của họ hoặc của đường truyền**, có thể tự khỏi.

Với `Retry-After`, server đang nói thẳng khi nào nên quay lại — luôn ưu tiên giá trị đó thay vì công thức backoff của mình:

```ts
const ra = res.headers.get("Retry-After");
const waitMs = ra
  ? (Number(ra) ? Number(ra) * 1000 : Date.parse(ra) - Date.now())
  : baseDelay * 2 ** (attempt - 1);
await sleep(Math.min(Math.max(waitMs, 0), MAX_WAIT) + Math.random() * 500);
```

Giá trị có thể là số giây hoặc một mốc thời gian HTTP-date, nên phải xử lý cả hai và vẫn chặn bằng một trần tối đa.

</details>

**10. Retry một request `POST` có thể tạo đơn trùng hoặc thanh toán hai lần. `Idempotency-Key` hoạt động ra sao ở phía server — lưu gì, khoá cách nào, giữ trong bao lâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề gốc: **timeout không có nghĩa là thất bại**. Request có thể đã xử lý xong nhưng response mất trên đường về, nên retry sẽ tạo đơn thứ hai.

Client sinh một key duy nhất cho mỗi **ý định** (một UUID, giữ nguyên qua mọi lần retry) và gửi trong header `Idempotency-Key`. Phía server:

- **Lưu gì** — key, định danh người dùng/merchant (để key của người này không đụng người kia), **hash của request body** (cùng key nhưng nội dung khác → `422`), trạng thái (`in_progress` / `completed`), response đã trả và status code, thời điểm tạo.
- **Khoá cách nào** — insert key với ràng buộc `UNIQUE` **trong cùng transaction với nghiệp vụ**. Vi phạm unique nghĩa là đã xử lý rồi. Khoá phải do DB đảm bảo, không phải kiểm tra "có tồn tại chưa" rồi mới ghi (race condition kinh điển giữa nhiều instance).
- **Trả lại gì** — key ở trạng thái `completed` → **phát lại đúng response đã lưu**, không chạy lại nghiệp vụ. Đang `in_progress` → trả `409` để client thử lại sau.
- **Giữ bao lâu** — 24 giờ là mức thường dùng, đủ phủ mọi vòng retry; sau đó dọn bằng job nền hoặc TTL.

</details>

**11. `retry storm` hình thành như thế nào? Nếu cả 4 tầng trong chuỗi service đều retry 3 lần, downstream cuối cùng nhận bao nhiêu request cho một lượt user?**

<details className="qa">
<summary>Xem đáp án</summary>

`retry storm` hình thành khi **nhiều client cùng fail một lúc rồi cùng retry**, biến một sự cố nhỏ thành cuộc tấn công DDoS mà bạn tự thực hiện vào chính mình. Vòng xoáy rất dễ khép kín: downstream chậm → caller timeout → caller retry → tải tăng gấp N → downstream càng chậm → càng nhiều timeout. Nó thường bùng đúng lúc downstream vừa restart và yếu nhất.

Nguy hiểm hơn là **retry nhân tầng**. Với chuỗi 4 tầng, mỗi tầng thực hiện tối đa 3 lần gọi:

```
Tầng 1: 3
Tầng 2: 3 × 3 = 9
Tầng 3: 9 × 3 = 27
Tầng 4: 27 × 3 = 81 request xuống downstream cuối
```

Một lượt bấm nút của user có thể biến thành **81 request** — tức hệ số khuếch đại 81 lần đúng vào thời điểm tệ nhất.

Cách chặn:

- **Chỉ retry ở một tầng**, thường là tầng ngoài cùng hoặc tầng sát dependency; các tầng còn lại fail fast.
- **Jitter** cho mọi khoảng chờ.
- **Circuit breaker** để dừng hẳn việc thử khi mạch đã mở.
- **Retry budget** — giới hạn retry ở mức vài phần trăm tổng lưu lượng, vượt là ngừng retry.
- Truyền deadline xuống dưới: hết ngân sách thời gian thì không tầng nào được thử tiếp.

</details>

**12. Nên đặt retry bên trong hay bên ngoài `circuit breaker`? Giải thích thứ tự lồng nhau giữa `rate limiter`, retry, `circuit breaker` và `timeout`.**

<details className="qa">
<summary>Xem đáp án</summary>

Đặt **retry ở ngoài, circuit breaker ở trong** — đúng như ví dụ tổng hợp trong bài, `CircuitBreaker` bọc lấy `retryWithBackoff`, và bên trong cùng là lời gọi có timeout.

Thứ tự lồng nhau từ ngoài vào trong:

```
rate limiter → retry → circuit breaker → timeout → lời gọi thật
```

Lý do từng lớp:

- **`rate limiter` ngoài cùng** — chặn ngay từ đầu để chính các lần retry cũng nằm trong ngân sách nhịp độ, không vượt hạn mức của đối tác.
- **retry kế tiếp** — phụ trách logic thử lại và backoff, nhưng mỗi lần thử vẫn phải đi qua breaker.
- **`circuit breaker` bên trong retry** — khi mạch đã `OPEN`, mọi lần thử bị từ chối **tức thì** thay vì tiếp tục đập vào một service đang chết. Nếu đảo ngược (breaker bọc ngoài retry), breaker chỉ nhìn thấy kết quả sau cả chùm retry: nó đếm sai số lần lỗi, phản ứng chậm hơn nhiều, và trong lúc đó bạn vẫn bắn đủ 3 phát vào downstream mỗi lượt.
- **`timeout` sát lời gọi nhất** — giới hạn từng lần thử, và nhờ đó breaker mới "nhìn thấy" được downstream chậm (xem câu 5).

</details>

**13. `bulkhead pattern` là gì? Cho ví dụ cụ thể việc dùng chung một `connection pool` khiến endpoint báo cáo chậm làm chết luôn luồng checkout, và cách chia pool để tránh.**

<details className="qa">
<summary>Xem đáp án</summary>

`bulkhead` lấy ý tưởng từ **khoang kín của tàu thuỷ**: chia tài nguyên thành các ngăn riêng, thủng một ngăn thì nước chỉ ngập ngăn đó, tàu vẫn nổi.

Kịch bản hỏng khi dùng chung pool: pool có 100 connection dùng cho mọi thứ. Ai đó mở trang báo cáo chạy query gộp mất 20 giây. 5 người cùng mở, mỗi request giữ một connection suốt 20 giây — chỉ cần lưu lượng vừa phải là **100 chỗ bị chiếm hết**. Lúc này request checkout tới, xin connection, không còn chỗ, phải xếp hàng chờ rồi timeout. Kết quả: **luồng thanh toán chết vì một trang thống kê**, dù hai thứ chẳng liên quan gì tới nhau.

Cách chia:

```ts
// Tệ — share pool, một chỗ chậm ăn hết connection
const pool = new Pool({ max: 100 });

// Tốt — khoang riêng cho từng nhóm
const checkoutPool = new Pool({ max: 40 });
const browsePool   = new Pool({ max: 30 });
const reportPool   = new Pool({ max: 10 });
```

Ngoài connection pool, bulkhead còn triển khai được bằng thread pool riêng (`@Bulkhead` của Resilience4j), giới hạn concurrency riêng cho từng downstream, tách worker của background job khỏi tiến trình phục vụ user, hoặc tách hẳn thành process/service riêng. Quy tắc thực dụng: **luôn cô lập critical path khỏi non-critical**.

</details>

**14. Khi nào dùng `bulkhead` thay vì `circuit breaker`, và khi nào cần cả hai? Cái giá của việc chia sẵn tài nguyên theo khoang là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai pattern giải quyết hai vấn đề khác nhau:

| | `bulkhead` | `circuit breaker` |
|---|---|---|
| Giải quyết | **Cạn kiệt tài nguyên** lan sang phần khác | Gọi hoài vào một dependency đã chết |
| Cách hoạt động | Chia sẵn hạn mức riêng cho từng nhóm | Theo dõi tỷ lệ lỗi, ngắt mạch khi vượt ngưỡng |
| Bảo vệ ai | Chính bạn và các luồng còn lại | Cả bạn lẫn downstream |

Dùng `bulkhead` khi mối lo là **tài nguyên dùng chung** (pool, thread, bộ nhớ) và có những luồng quan trọng hơn hẳn luồng khác. Dùng `circuit breaker` khi gọi ra **dependency bên ngoài có thể hỏng hẳn** và bạn muốn fail fast. Thực tế nên có **cả hai**: breaker bắt lỗi rõ ràng, bulkhead chặn kiểu hỏng âm thầm mà breaker dễ bỏ sót — downstream chỉ *chậm* chứ không lỗi.

Cái giá của bulkhead: **giảm hiệu suất sử dụng tài nguyên**. Chia sẵn nghĩa là lúc hệ thống rảnh, phần báo cáo vẫn chỉ có 10 chỗ dù 90 chỗ kia đang nằm không — không dồn toàn bộ công suất cho một việc được. Kèm theo đó là thêm việc điều chỉnh: phải chọn kích thước cho từng khoang và chỉnh lại khi lưu lượng đổi, chia sai thì tự tạo nút thắt ở đúng chỗ mình muốn bảo vệ.

</details>

**15. `backpressure` là gì? Trong Node stream nó hoạt động thế nào, còn với HTTP API hoặc job queue thì bạn tự triển khai bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`backpressure` = khi bên tiêu thụ xử lý không kịp, nó **ra hiệu cho bên sản xuất chậm lại**, thay vì để hàng chất đống rồi đổ xuống sàn — chính là dây chuyền đóng gói trong ví dụ của bài. Không có nó, hàng đợi phình lên tới lúc hết RAM.

**Node stream** có sẵn cơ chế này: `writable.write()` trả về `false` khi buffer nội bộ vượt `highWaterMark`; `readable.pipe(writable)` sẽ tự `pause()` nguồn đọc và chỉ `resume()` khi sự kiện `drain` bắn ra. Vì vậy `pipe` (hoặc `pipeline`) luôn an toàn hơn là tự đọc rồi ghi bằng tay — vòng lặp `for` gọi `write()` mà bỏ qua giá trị trả về chính là cách làm nổ bộ nhớ.

**Job queue** — đặt trần cho hàng đợi và từ chối khi đầy, đồng thời giới hạn số job chạy song song:

```ts
const waiting = await queue.getWaitingCount();
if (waiting > 10000) throw new Error("Queue full, retry later");
```

**HTTP API** — đếm số request đang xử lý và trả `503` khi vượt ngưỡng:

```ts
if (activeRequests >= MAX_CONCURRENT) {
  return res.status(503).json({ error: "Service overloaded" });
}
```

Tinh thần chung: **thà nói "chờ chút" ngay còn hơn nhận vào rồi làm rơi**, vì từ chối sớm thì rẻ, còn nhận rồi hỏng giữa chừng thì đã tiêu tài nguyên mà chẳng được gì.

</details>

**16. `load shedding` khác `rate limiting` ở điểm nào? Bạn phân loại request theo mức ưu tiên (P1/P2/P3) ra sao và quyết định bỏ cái gì trước?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `rate limiting` | `load shedding` |
|---|---|---|
| Căn cứ | Hạn mức đặt sẵn cho từng client | **Sức khoẻ thực tế** của hệ thống lúc này |
| Mục đích | Công bằng, chống lạm dụng, kiểm soát chi phí | Sống sót qua cơn quá tải |
| Khi nào chạy | Luôn luôn | Chỉ khi chạm ngưỡng tải |
| Bỏ ai | Client vượt hạn mức | Request ưu tiên thấp, bất kể của ai |

Phân tầng ưu tiên như bài đưa ra:

```
P1 (sống còn): checkout, payment, login        → không bao giờ bỏ
P2 (quan trọng): browse, search                → bỏ sau cùng
P3 (có thì tốt): recommendation, analytics     → bỏ trước tiên
```

Cách quyết định: gắn nhãn ưu tiên ngay ở tầng route hoặc middleware, rồi dựa vào tín hiệu tải (CPU, độ sâu queue, latency, số request đang chạy) để quyết định ngưỡng nào bắt đầu bỏ tầng nào — CPU trên 90% thì shed P3, trên 95% shed thêm P2, P1 giữ tới cùng.

Điểm mấu chốt như ví dụ cắt điện luân phiên: **bạn chủ động chọn cái để bỏ**, thay vì để hệ thống chết ngẫu nhiên và kéo luôn checkout theo. Vài lưu ý: shed phải **rẻ** (từ chối ngay ở cửa, chưa chạm DB), trả `503` kèm `Retry-After`, và luôn đo đếm để biết mình đang bỏ bao nhiêu. Mức tinh vi hơn là **adaptive concurrency** — tự điều chỉnh giới hạn theo latency quan sát được.

</details>

**17. Mô tả một `cascade failure`: service A chậm → B timeout → pool của C cạn → cả hệ thống sập. Ở mỗi mắt xích cần pattern nào để chặn dây chuyền?**

<details className="qa">
<summary>Xem đáp án</summary>

Diễn biến điển hình:

1. Service A chậm đi (query thiếu index, GC, dependency ngoài lag).
2. B gọi A, không có timeout hoặc timeout quá dài → mỗi request giữ một connection rất lâu.
3. Connection pool của B cạn → **mọi** endpoint của B chết, kể cả những cái không hề gọi A.
4. C gọi B, gặp đúng kịch bản trên, pool của C cạn theo.
5. Health check fail → instance bị restart hàng loạt → lượng tải dồn vào số instance còn lại → sập nốt.

Pattern chặn ở từng mắt xích:

- **Tại A** — load shedding và backpressure để tự bảo vệ; autoscale; sửa nguyên nhân gốc.
- **Giữa B và A** — `timeout` ngắn và cascading, `circuit breaker` để fail fast khi A đã hỏng, fallback/degradation cho phần không sống còn.
- **Bên trong B** — `bulkhead`: pool riêng cho A, để luồng không liên quan vẫn sống.
- **Về retry** — chỉ retry ở một tầng, có jitter, có retry budget.
- **Toàn cục** — health check không kiểm tra mọi dependency, tránh restart dây chuyền.

Nguyên tắc chung: mỗi mắt xích phải **tự bảo vệ mình** thay vì tin rằng bên kia luôn khoẻ.

</details>

**18. `chaos engineering` là gì? Nêu vài thí nghiệm bạn sẽ chạy trước và giải thích vì sao startup nhỏ có thể tạm bỏ qua.**

<details className="qa">
<summary>Xem đáp án</summary>

`chaos engineering` = **chủ động tiêm lỗi vào hệ thống** để kiểm chứng các giả định về khả năng chịu lỗi, trước khi production tự làm điều đó vào 3 giờ sáng. Cách làm chuẩn là đặt giả thuyết ("giết một instance thì user không nhận lỗi"), chạy thí nghiệm trong phạm vi nhỏ có kiểm soát, đo bằng metrics sẵn có, và luôn có nút dừng.

Vài thí nghiệm nên chạy trước:

- **Giết ngẫu nhiên một instance** — kiểm tra load balancer rút nó ra kịp và graceful shutdown hoạt động.
- **Tiêm độ trễ** vào một dependency — kiểm tra timeout và circuit breaker có thật sự kích hoạt không.
- **Bắt một dependency trả lỗi 100%** — kiểm tra fallback và degradation.

Startup nhỏ tạm bỏ qua được vì: kiến trúc còn đơn giản (một app, một DB) nên rất ít điểm hỏng bất ngờ; công cụ và quy trình tốn công dựng; và quan trọng nhất là **họ đã có đủ "chaos" miễn phí** từ chính sự cố thật hằng tuần. Chaos engineering đáng đầu tư khi hệ đã phân tán và mission-critical.

</details>

**19. Nếu chỉ được thêm ba cơ chế bảo vệ cho mọi external call trên production, bạn chọn gì, theo thứ tự nào, và giải thích lý do?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba cơ chế, theo đúng thứ tự triển khai:

1. **`timeout`** — làm trước tiên và quan trọng nhất. Không có nó thì mọi thứ khác vô nghĩa: một dependency treo là connection pool cạn, rồi cascade failure kéo cả hệ thống đi. Timeout cũng là thứ biến "chậm" thành "lỗi" để các lớp sau nhìn thấy được.
2. **`retry` với exponential backoff + jitter** — xử lý gọn phần lớn sự cố thật ngoài đời vốn chỉ thoáng qua (mạng chập, `503` lúc deploy, `429`). Nhưng phải kèm kỷ luật: chỉ retry lỗi transient, tối đa 3 lần, có jitter, và `POST` thì phải có `Idempotency-Key`.
3. **`circuit breaker`** — khi downstream hỏng hẳn chứ không thoáng qua, breaker ngăn bạn tiếp tục lãng phí tài nguyên và cho downstream khoảng lặng để hồi phục, đồng thời fail fast cho người dùng.

Thứ tự này cũng là thứ tự "giá trị trên mỗi đơn vị công sức": timeout rẻ và cứu nhiều nhất, retry thêm độ bền với ít việc, breaker phức tạp hơn nên làm sau. Đúng tinh thần của bài — **start simple, thêm advanced khi đo thấy cần**.

</details>
