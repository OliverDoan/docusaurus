---
sidebar_position: 9
title: "9. Testing"
---

# 9. Testing

## 1. Testing Backend

Bài học: [1. Testing Backend](../../backend/09-testing/1_testing.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao cần test tự động thay vì test tay? Test mang lại giá trị gì khi bạn refactor?**

<details className="qa">
<summary>Xem đáp án</summary>

Test tay chỉ chạy được vài luồng, tốn thời gian và phụ thuộc trí nhớ của người bấm. Test tự động chạy hàng trăm kịch bản trong vài giây, chạy lại y hệt mọi lúc và chạy được trên CI trước mỗi lần merge.

Giá trị cụ thể:

- **Regression** — sửa chỗ A mà hỏng chỗ B thì biết ngay, thay vì để khách phát hiện hộ.
- **Tài liệu sống** — đọc test là biết hàm dùng thế nào, edge case ra sao.
- **Phản hồi nhanh** — unit test tính bằng mili giây nên sửa sai trong lúc còn nhớ code.

Khi refactor, test là **lưới an toàn**: bạn thay đổi cấu trúc bên trong mà hành vi bên ngoài phải giữ nguyên, và test chính là thứ định nghĩa "hành vi bên ngoài". Không có test thì mọi refactor đều là đánh cược — đó là lý do phần lớn code xấu không ai dám động vào. Có test, bạn sửa xong chạy lại, xanh là yên tâm.

</details>

**2. Giải thích `Testing Pyramid`. Điều gì xảy ra khi tháp bị lộn ngược (`ice cream cone`)?**

<details className="qa">
<summary>Xem đáp án</summary>

Tháp gợi ý tỉ lệ giữa ba tầng test:

| Layer | Mục tiêu | Tốc độ | Số lượng |
|---|---|---|---|
| Unit | Pure function, util | ms | Hàng trăm |
| Integration | API + DB + service | giây | Hàng chục |
| E2E | Full user flow | hàng chục giây | Dưới 10 flow critical |

Đáy rộng vì unit test nhanh, rẻ và chỉ đúng chỗ hỏng; đỉnh hẹp vì E2E chậm, đắt và khó truy nguyên nhân. Giống kiểm tra xe: vặn thử từng con ốc thì làm hàng trăm lần, còn lái cả vòng quanh phố chỉ làm vài kịch bản quan trọng nhất.

Khi tháp lộn ngược (`ice cream cone`) — nhiều E2E, ít unit — hậu quả:

- Suite chạy hàng chục phút, dev bỏ chạy local, feedback loop vỡ.
- Test hỏng nhưng không biết hỏng ở đâu, mất nhiều giờ điều tra.
- Tỉ lệ flaky cao (mạng, timing, UI đổi) khiến team quen với "đỏ cũng kệ" — lúc đó test mất hết giá trị.

</details>

**3. Phân biệt unit test, integration test và `E2E` test. Mỗi loại bắt được bug nào mà loại kia bỏ sót?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Unit test** — kiểm một hàm/đơn vị logic, không đụng DB hay network, dependency bên ngoài được mock. Bắt bug **logic**: sai công thức, sai điều kiện biên, quên xử lý mảng rỗng. Bỏ sót mọi thứ liên quan tới ráp nối.
- **Integration test** — nhiều thành phần chạy cùng nhau với DB thật (Docker Compose, `Testcontainers`), gọi endpoint qua Supertest. Bắt bug **ráp nối**: query sai cột, migration thiếu, transaction không rollback, serialize sai giữa tầng, config sai.
- **E2E test** — chạy trọn luồng người dùng qua cả stack (`Playwright` cho web, hoặc API-only: signup → cart → checkout → verify DB). Bắt bug **luồng**: thiếu bước, redirect sai, token không truyền qua được giữa các bước, tích hợp third-party gãy.

Ví von: unit là vặn từng con ốc, integration là ráp cụm phanh vào bánh rồi đạp thử, E2E là lái nguyên chiếc xe một vòng. Mỗi tầng thấy được thứ tầng kia mù — nên cần cả ba, chỉ khác nhau về số lượng.

</details>

**4. Một unit test tốt cần thoả những tính chất nào (nhanh, độc lập, lặp lại được, tự kiểm chứng)?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Nhanh** — tính bằng mili giây, không chạm DB, file, network. Chậm là dev ngừng chạy nó.
- **Độc lập** — không phụ thuộc thứ tự chạy, không dùng chung state với test khác. Chạy riêng một test bất kỳ vẫn phải pass.
- **Lặp lại được** — cùng input cho cùng kết quả ở mọi máy, mọi thời điểm. Không phụ thuộc ngày giờ thật, random, múi giờ, biến môi trường của máy dev.
- **Tự kiểm chứng** — khẳng định pass/fail bằng assert, không bắt người đọc nhìn log để tự đoán.
- **Có tên nói rõ hành vi** — "10% discount", "empty items" chứ không phải "test 1", để khi đỏ là biết ngay cái gì hỏng.
- **Test hành vi, không test implementation** — assert vào output/hợp đồng công khai, để refactor bên trong không làm đỏ hàng loạt.

Thêm một điểm hay bị bỏ: mỗi test nên tập trung một tình huống, để thông báo lỗi đủ cụ thể mà không cần debug.

</details>

**5. Cấu trúc `Arrange - Act - Assert` là gì? Vì sao nên tránh nhồi nhiều assert không liên quan vào một test?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba khối rõ ràng trong mỗi test: **Arrange** dựng dữ liệu và trạng thái đầu vào, **Act** gọi đúng một hành động cần kiểm, **Assert** kiểm kết quả.

```ts
it("10% discount", () => {
  const items = [{ price: 100 }];          // Arrange
  const total = calculateTotal(items, 10); // Act
  expect(total).toBe(90);                  // Assert
});
```

Lợi ích: người đọc thấy ngay "cho gì vào, làm gì, mong gì ra", và dễ phát hiện test đang kiểm nhiều thứ cùng lúc.

Nhồi nhiều assert không liên quan gây rắc rối vì:

- Assert đầu tiên fail là test dừng, các assert sau không chạy — bạn chỉ thấy một phần sự thật, sửa xong lại fail tiếp.
- Tên test không còn mô tả đúng thứ nó kiểm, đỏ lên phải đọc code mới hiểu.
- Test trở nên dễ vỡ: đổi một hành vi nhỏ làm đỏ một test đang gánh năm mục đích.

Nhiều assert cùng mô tả **một hành vi** (kiểm status, body và bản ghi trong DB của cùng một request) thì hoàn toàn ổn — vấn đề nằm ở "không liên quan", không nằm ở số lượng.

</details>

**6. Phân biệt `mock`, `stub`, `spy` và `fake`. Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Loại | Bản chất | Dùng khi |
|---|---|---|
| `stub` | Trả về giá trị định sẵn, không quan tâm ai gọi | Cần đầu vào cố định: DB trả về user có sẵn, API trả 200 |
| `mock` | Bản giả có **kỳ vọng** về cách được gọi, assert vào lời gọi | Cần kiểm "có gửi email không, gửi mấy lần, với tham số nào" |
| `spy` | Bọc hàm thật, ghi lại lời gọi mà vẫn chạy code gốc | Muốn quan sát mà không thay đổi hành vi |
| `fake` | Bản cài đặt thật nhưng đơn giản hoá (in-memory repository) | Cần hành vi gần thật cho nhiều test, không muốn stub từng lời gọi |

Thực tế với Vitest, `vi.fn()` và `vi.mock()` gộp nhiều vai trò này lại nên ranh giới hơi mờ; điều quan trọng là phân biệt **kiểm trạng thái** (state) hay **kiểm tương tác** (interaction).

Nguyên tắc chọn: ưu tiên stub/fake cho dữ liệu đầu vào; chỉ dùng mock có assert khi chính lời gọi đó là hành vi cần bảo đảm (ví dụ "đã trừ tiền đúng một lần"). Assert vào lời gọi càng nhiều thì test càng bám implementation và càng dễ vỡ khi refactor.

</details>

**7. Mock quá nhiều dẫn tới vấn đề gì? Làm sao tránh tình trạng test xanh nhưng production vẫn hỏng?**

<details className="qa">
<summary>Xem đáp án</summary>

Mock giống ma-nơ-canh trong tiệm may: đồ mặc vừa như in trên ma-nơ-canh không có nghĩa là vừa với khách thật. Mock quá nhiều thì test chỉ còn kiểm tra chính những giả định bạn tự viết ra:

- Đối tác đổi shape response, mock của bạn vẫn giữ shape cũ → test xanh, production gãy.
- Query SQL sai, constraint DB chặn, migration thiếu — mock DB không bao giờ thấy.
- Assert dày đặc vào lời gọi làm mọi refactor đều đỏ, dù hành vi không đổi.

Cách phòng:

- Giữ đủ **integration test với DB thật** (Docker Compose, `Testcontainers`) cho tầng chạm dữ liệu — đây là tầng mock hại nhất.
- Mock ở **ranh giới hệ thống** (payment, email, API bên thứ ba), không mock các module nội bộ của chính mình.
- Dùng **contract test** với dịch vụ bên ngoài để phát hiện khi hợp đồng đổi.
- Giữ vài **E2E** cho luồng critical như checkout.
- Định kỳ chạy test đối chiếu với sandbox thật của đối tác.

</details>

**8. Integration test nên dùng database thật, in-memory DB hay mock? Ưu nhược của `Testcontainers`, Docker Compose và SQLite?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định nên dùng **DB thật cùng loại với production**. Mock DB làm mất đúng thứ integration test sinh ra để bắt: SQL sai, index thiếu, constraint, transaction, kiểu dữ liệu.

| Cách | Ưu | Nhược |
|---|---|---|
| `Testcontainers` | Dựng Postgres mới cho từng suite rồi đập bỏ; máy dev và CI giống hệt nhau; không đụng dữ liệu của ai | Khởi động mất vài chục giây, cần Docker trong CI |
| Docker Compose | Đơn giản, một container dùng chung cho cả team, chạy nhanh vì luôn sẵn | State tích luỹ giữa các lần chạy, dễ đụng nhau khi chạy song song |
| In-memory SQLite | Nhanh nhất, không cần Docker | Hành vi khác Postgres (kiểu dữ liệu, JSON, index, upsert) → xanh ở test mà đỏ ở production |

Ngoài ra có cách clone schema production rồi truncate trước mỗi lần chạy.

Khuyến nghị: `Testcontainers` cho CI và cho suite cần sạch tuyệt đối; Docker Compose cho vòng lặp phát triển hằng ngày. Tránh SQLite khi production dùng Postgres, trừ khi truy vấn rất đơn giản.

</details>

**9. Làm sao đảm bảo test isolation khi nhiều test cùng đụng vào một database? So sánh cách transaction rollback với truncate/reseed.**

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề: test A tạo user, test B đếm user rồi fail — hoặc pass/fail tuỳ thứ tự chạy. Mỗi test phải bắt đầu từ trạng thái xác định.

| Cách | Cơ chế | Ưu | Nhược |
|---|---|---|---|
| Transaction rollback | Mở transaction đầu test, rollback ở cuối | Rất nhanh, sạch tuyệt đối | Không dùng được khi code đang test tự quản transaction hoặc chạy trên connection khác |
| Truncate / reseed | `TRUNCATE` các bảng rồi nạp lại seed | Đơn giản, hợp mọi tình huống, kể cả code có commit | Chậm hơn, phải để ý thứ tự khoá ngoại và reset sequence |

Nguyên tắc chung:

- Dọn ở `beforeEach` (bắt đầu sạch) đáng tin hơn dọn ở `afterEach`, vì test fail giữa chừng có thể bỏ qua bước dọn.
- Dữ liệu dùng chung nên tạo bằng factory với giá trị ngẫu nhiên (email duy nhất) thay vì hằng số cứng.
- Chạy song song thì mỗi worker cần database hoặc schema riêng — `Testcontainers` giải quyết gọn việc này.

</details>

**10. Test một API endpoint có auth và có gọi service bên ngoài (payment, email) thì bạn xử lý phần bên ngoài thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Phần auth** — không mock luôn middleware xác thực (như vậy là bỏ qua đúng thứ cần kiểm). Cách gọn: tạo user thật trong DB test rồi lấy token qua chính endpoint đăng nhập, sau đó gắn vào từng request.

```ts
const { body } = await request(app).post("/auth/signup").send({ email, password });
await request(app)
  .post("/cart/items")
  .set("Authorization", `Bearer ${body.token}`)
  .send({ productId, qty: 2 })
  .expect(201);
```

Nhớ test cả nhánh không có token (401) và token của user khác (403).

**Phần service bên ngoài** — đây mới là chỗ nên thay thế, vì nó chậm, tốn tiền và không ổn định:

- Dùng **sandbox** chính chủ nếu provider có (nhiều cổng thanh toán cung cấp thẻ test).
- Hoặc dựng **fake server** / chặn HTTP ở tầng client, trả về response mẫu lấy từ tài liệu.
- Test cả nhánh thất bại: thanh toán bị từ chối, timeout, gửi mail lỗi — thường đây mới là chỗ có bug.

Với email/queue, assert rằng hệ thống **đã yêu cầu gửi** với đúng tham số, thay vì gửi thật.

</details>

**11. Với code bất định (thời gian hiện tại, random, UUID, network), bạn làm cho test deterministic bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: đẩy phần bất định ra khỏi logic, biến nó thành thứ có thể thay thế từ bên ngoài.

- **Thời gian** — không gọi thẳng `Date.now()` trong business logic; nhận thời điểm qua tham số hoặc qua một `clock` inject được. Trong test dùng fake timer của Vitest để cố định thời gian và tua nhanh.
- **Random / UUID** — inject hàm sinh, test truyền hàm trả giá trị cố định. Nếu bắt buộc dùng trực tiếp thì mock module sinh ID.
- **Network** — chặn ở ranh giới HTTP client, trả response cố định; hoặc dùng server giả chạy local.
- **Thứ tự bất định** — khi assert danh sách, sắp xếp trước rồi mới so, đừng phụ thuộc thứ tự DB trả về (không có `ORDER BY` thì không có bảo đảm gì).
- **Múi giờ và locale** — cố định `TZ` và locale trong cấu hình test, nếu không cùng một test sẽ đỏ trên CI mà xanh trên máy bạn.

Lợi ích kèm theo: code dễ test hơn cũng thường là code có thiết kế tốt hơn, vì phụ thuộc đã tường minh.

</details>

**12. `flaky test` là gì, thường do nguyên nhân nào, và bạn xử lý một test flaky trong CI ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`Flaky test` là test lúc xanh lúc đỏ dù code không đổi. Nguy hiểm ở chỗ nó dạy cả team phản xạ "chạy lại xem sao", và rồi bug thật cũng bị bỏ qua.

Nguyên nhân thường gặp:

- Không isolation — test dùng chung dữ liệu, phụ thuộc thứ tự chạy.
- Timing — `sleep` cứng thay vì chờ điều kiện; race giữa async chưa await.
- Phụ thuộc bên ngoài — mạng, API thật, thời gian, múi giờ.
- Thứ tự kết quả DB không xác định vì thiếu `ORDER BY`.
- Tài nguyên trên CI yếu hơn máy dev nên timeout chạm ngưỡng.

Cách xử lý:

1. **Đánh dấu và tách riêng** (quarantine) để không chặn pipeline, nhưng kèm issue có hạn sửa — không để quên.
2. **Tái hiện**: chạy lặp nhiều lần, chạy đổi thứ tự, chạy song song để lộ nguyên nhân.
3. **Sửa gốc**: chờ theo điều kiện thay vì `sleep`, dọn DB mỗi test, cố định thời gian/random.
4. Chỉ dùng `retry` như biện pháp tạm và phải log lại, vì retry che triệu chứng chứ không chữa bệnh.

</details>

**13. E2E test đắt và dễ vỡ. Bạn chọn flow nào để làm E2E và cho chúng chạy ở thời điểm nào trong pipeline?**

<details className="qa">
<summary>Xem đáp án</summary>

Chọn theo **giá trị kinh doanh khi hỏng**, giữ ở mức dưới 10 flow critical:

- Đăng ký / đăng nhập.
- Luồng tiền: thêm giỏ → checkout → thanh toán → đơn hàng vào DB đúng trạng thái.
- Các thao tác không thể hoàn tác hoặc liên quan quyền hạn.
- Vài luồng đọc quan trọng nhất (trang chủ, tìm kiếm).

Không làm E2E cho validate form, phân trang, sắp xếp — những thứ đó để unit/integration lo.

Thời điểm chạy:

- **Mỗi pull request**: unit + integration (nhanh, phải xanh mới merge), kèm một tập E2E rút gọn cho luồng sống còn.
- **Sau khi deploy lên staging**: toàn bộ E2E.
- **Định kỳ hằng đêm**: bộ đầy đủ cộng load test.
- **Smoke test trên production** sau mỗi lần release, với dữ liệu test riêng.

Để bớt vỡ: chọn selector theo vai trò/nhãn thay vì CSS, chờ theo điều kiện, và chuẩn bị dữ liệu qua API thay vì bấm qua UI.

</details>

**14. `code coverage` nói lên điều gì và KHÔNG nói lên điều gì? Vì sao 100% coverage không đáng theo đuổi?**

<details className="qa">
<summary>Xem đáp án</summary>

Coverage đo **dòng/nhánh code đã được chạy qua** khi chạy test. Nó nói được một điều hữu ích: phần nào của code chưa hề được test đụng tới — vùng đó chắc chắn không có bảo đảm gì.

Nó **không** nói rằng code đúng. Một test chạy qua hàm mà không assert gì vẫn cho 100% coverage. Nó cũng không đo chất lượng assert, không đo edge case bị bỏ sót, và không đo đúng sai của chính yêu cầu nghiệp vụ.

Vì sao dừng ở 70-80% tổng thể:

- Sau mốc 80%, mỗi phần trăm thêm tốn gấp 2-3 lần công sức.
- Code sinh tự động, boilerplate, getter/setter, mapping đơn giản không đáng test.
- Type checking đã chặn sẵn phần lớn lỗi kiểu.

Mục tiêu tham khảo theo tầng: utility 90%+, service/business logic 80%+, API endpoint 70%+, tầng database 60%+ (đã có integration test phủ). Tập trung vào critical path, business logic và edge case, đừng chạy theo con số.

</details>

**15. Load testing khác stress, spike và soak test ra sao? Vì sao nhìn `p95`/`p99` thay vì giá trị trung bình?**

<details className="qa">
<summary>Xem đáp án</summary>

Các pattern khác nhau ở **hình dạng tải** và câu hỏi muốn trả lời:

- **Smoke** — vài user, chỉ xác nhận kịch bản chạy được.
- **Load** — lượng user điển hình, giữ đều trong thời gian dài: hệ thống có đáp ứng nổi ngày thường không.
- **Stress** — đẩy vượt năng lực để tìm **điểm gãy** và xem gãy thế nào (từ chối lịch sự hay sập hẳn).
- **Spike** — tăng vọt đột ngột: autoscale và connection pool phản ứng ra sao.
- **Soak** — tải vừa nhưng kéo dài nhiều giờ: lộ memory leak, connection leak, đầy disk.

Về chỉ số: trung bình bị kéo lệch bởi số đông request nhanh và che mất phần đuôi. Trung bình 200ms nghe rất đẹp, nhưng nếu `p99` là 8 giây thì cứ 100 lượt lại có 1 lượt khách ngồi nhìn màn hình xoay rồi bỏ đi. `p95`/`p99` mô tả **những người xui nhất** — và với một trang gọi nhiều API, gần như mọi người dùng đều chạm phải phần đuôi đó ít nhất một lần.

</details>

**16. Bạn đọc kết quả một lần chạy `k6` như thế nào — chỉ số nào cho biết hệ thống đã tới hạn?**

<details className="qa">
<summary>Xem đáp án</summary>

Nhìn bốn nhóm chỉ số cùng lúc, không nhìn riêng cái nào:

- **Throughput** — số request/giây thực sự phục vụ được.
- **Latency** — `p50`, `p95`, `p99` của thời gian phản hồi.
- **Error rate** — tỉ lệ request fail.
- **Saturation** — CPU, memory, connection pool của DB ở phía server.

Dấu hiệu tới hạn: tăng số user ảo nhưng **throughput không tăng nữa** trong khi `p95`/`p99` leo dốc — nghĩa là request chỉ đang xếp hàng. Kèm theo đó thường là error rate bắt đầu nhích lên (timeout, hết connection pool).

`k6` cho phép khai báo ngưỡng để pipeline tự fail:

```js
thresholds: {
  http_req_duration: ["p(95)<500"],
  http_req_failed: ["rate<0.01"],
}
```

Lưu ý khi đọc: phải kiểm tra máy chạy k6 không phải là nút thắt, và luôn đối chiếu với metric phía server — thấy CPU đã 100% hay connection pool cạn thì mới biết nên scale cái gì.

</details>

**17. Mô tả vòng `TDD` Red-Green-Refactor. Việc viết test trước làm thay đổi thiết kế code như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vòng lặp ba bước:

1. **RED** — viết test cho hành vi chưa có, chạy và thấy nó fail (fail đúng lý do mong đợi).
2. **GREEN** — viết lượng code tối thiểu để test pass.
3. **REFACTOR** — dọn dẹp code, chạy lại test vẫn xanh.

```ts
it("formats currency VND", () => {
  expect(formatVND(1000)).toBe("1.000 ₫");
});
// RED → viết formatVND → GREEN → refactor
```

Giống chốt tiêu chí nghiệm thu trước khi thợ bắt đầu xây.

Tác động lên thiết kế: viết test trước buộc bạn đứng ở **vị trí người dùng API** trước khi cài đặt, nên tên hàm, tham số và giá trị trả về thường gọn hơn. Muốn test chạy nhanh thì phải giảm phụ thuộc, nên dependency có xu hướng được inject thay vì gọi thẳng — code tự nhiên dễ thay thế và dễ test.

Đừng dogmatic: TDD hợp với pure function, bug fix và refactor; không hợp với code thăm dò khi chưa biết shape cuối. Mục tiêu là **code có test**, không phải tranh cãi test trước hay sau.

</details>

**18. Khi sửa một bug production, quy trình test hợp lý là gì? Vì sao nên viết regression test trước khi fix?**

<details className="qa">
<summary>Xem đáp án</summary>

Trình tự nên theo:

1. **Tái hiện** bug ở môi trường phát triển, thu hẹp về đầu vào nhỏ nhất gây lỗi.
2. **Viết test tái hiện** đúng bug đó và chạy để thấy nó **đỏ**.
3. **Fix** code cho tới khi test xanh.
4. Chạy toàn bộ suite để chắc không làm hỏng chỗ khác.
5. Giữ test đó lại vĩnh viễn như regression test.

Viết test trước khi fix quan trọng vì:

- Nó **chứng minh** bạn đã hiểu đúng bug. Test không đỏ nghĩa là bạn chưa tái hiện được thứ khách gặp, và bản fix rất có thể sai chỗ.
- Nó chứng minh bản fix thực sự có tác dụng: đỏ → xanh là bằng chứng nhân quả.
- Nó chặn bug quay lại sau này — bug đã xuất hiện một lần thường là vùng dễ tái phát khi refactor.

Đây cũng là tình huống `TDD` phát huy tốt nhất, vì hành vi mong muốn đã rõ ràng ngay từ đầu, không phải đoán.

</details>

**19. Test code có cần refactor không? Bạn xử lý sao khi mỗi lần đổi implementation là hàng chục test đỏ (test bám implementation thay vì hành vi)?**

<details className="qa">
<summary>Xem đáp án</summary>

Có. Test là code sản xuất theo nghĩa nó được đọc, sửa và bảo trì suốt vòng đời dự án. Test lặp lại, đặt tên mơ hồ, setup dài ba chục dòng đều làm giảm tốc độ team.

Triệu chứng "đổi implementation là hàng chục test đỏ" cho thấy test đang assert vào **cách làm** thay vì **kết quả**: mock nội bộ quá sâu, assert số lần gọi hàm private, so khớp cấu trúc nội bộ.

Cách chữa:

- Đổi mục tiêu assert sang **hành vi quan sát được từ ngoài**: giá trị trả về, response HTTP, bản ghi trong DB.
- Chỉ mock ở **ranh giới hệ thống**, không mock module nội bộ của chính mình.
- Rút setup lặp lại vào **factory / test helper** để đổi shape dữ liệu chỉ phải sửa một chỗ.
- Bỏ bớt test trùng lặp; nhiều test kiểm cùng một điều chỉ nhân đôi công sửa.
- Khi refactor lớn, sửa test theo từng nhóm nhỏ và giữ suite xanh liên tục, thay vì để đỏ hàng loạt rồi sửa một lượt.

</details>

**20. `contract testing` giải quyết vấn đề gì giữa các service mà unit test và E2E test đều không giải quyết tốt?**

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề: service A gọi service B. Unit test của A mock B nên luôn xanh dù B đã đổi response — đúng bẫy ma-nơ-canh. E2E dựng cả hai lên thì bắt được, nhưng chậm, đắt, khó dựng đủ môi trường và khó chỉ ra ai làm hỏng.

`Contract testing` chốt một **hợp đồng** mô tả: consumer gửi request dạng nào, provider trả response dạng nào. Rồi:

- Phía **consumer** chạy test với bản giả tuân theo hợp đồng, đồng thời sinh ra chính hợp đồng đó.
- Phía **provider** chạy verification: chạy hợp đồng ấy với code thật của mình, xem có còn đáp ứng không.

Nhờ vậy, khi provider đổi field, pipeline của provider đỏ ngay và nêu rõ consumer nào bị ảnh hưởng — không cần dựng toàn hệ thống, không phải chờ tới E2E hay tới production mới phát hiện.

Phù hợp nhất với kiến trúc nhiều service hoặc khi có team bên ngoài dùng API của bạn. Lưu ý: nó chỉ kiểm hợp đồng giao tiếp, không thay được test nghiệp vụ bên trong mỗi service.

</details>
