---
sidebar_position: 3
title: "3. Ưu/nhược & khi nào nên dùng"
---

# Ưu, nhược điểm & khi nào nên dùng

Micro-frontend rất hấp dẫn trên slide, nhưng đi kèm **cái giá thật sự**. Bài này
liệt kê thẳng thắn ưu/nhược điểm và đưa ra tiêu chí quyết định *có nên dùng hay
không* — phần quan trọng nhất để tránh "đu trend" rồi trả giá đắt.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Ưu điểm lớn nhất: nhóm tự chủ + `deploy` độc lập** — kèm nâng cấp dần, cô lập lỗi, scale theo tổ chức.
- ⭐ **Micro-frontend trị vấn đề *tổ chức*, không phải kỹ thuật** — code rối thì nên `refactor`, đừng chẻ nhỏ thành nhiều app.
- **Cái giá phải trả** — phức tạp vận hành, trùng `dependency`, khó nhất quán UI, chia sẻ state/routing và debug đều khó hơn.
- **Nên dùng khi** nhiều nhóm (≥ 3–4), app thực sự lớn, cần deploy độc lập và chấp nhận đầu tư hạ tầng.
- **Không nên khi** nhóm nhỏ, app vừa/nhỏ, hoặc chỉ muốn "chia code cho gọn" — hãy cân nhắc `modular monolith` trước.

:::

---

## Mục lục

- [Ưu điểm](#ưu-điểm)
- [Cái giá phải trả](#cái-giá-phải-trả)
- [Khi nào NÊN dùng](#khi-nào-nên-dùng)
- [Khi nào KHÔNG nên dùng](#khi-nào-không-nên-dùng)
- [Giải pháp thay thế: modular monolith](#giải-pháp-thay-thế-modular-monolith)
- [Tóm tắt](#tóm-tắt)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Ưu điểm

- **Nhóm tự chủ & deploy độc lập** — mỗi nhóm release theo nhịp riêng, không chờ
  nhau. Đây là lợi ích lớn nhất.
- **Nâng cấp dần dần** — đổi framework hay phiên bản *từng mảnh một*, không cần
  viết lại toàn bộ ("big bang rewrite").
- **Cô lập lỗi** — một mảnh hỏng (lý tưởng là) không làm sập cả trang.
- **Scale theo tổ chức** — dễ chia việc cho nhiều nhóm song song khi công ty lớn.
- **Build/test nhanh hơn theo mảnh** — mỗi mảnh nhỏ build nhanh hơn cả khối.

## Cái giá phải trả

:::warning Những chi phí thường bị xem nhẹ
- **Phức tạp vận hành** — nhiều pipeline build/deploy, nhiều nơi để theo dõi và
  gỡ lỗi. DevOps nặng hơn hẳn.
- **Trùng lặp dependency** — nếu không chia sẻ tốt, mỗi mảnh tự tải React của
  riêng nó → trang **nặng và chậm**. (Module Federation sinh ra để giảm việc này,
  xem mục 2.)
- **Khó nhất quán UI/UX** — mỗi nhóm làm một kiểu; cần **design system chung** +
  kỷ luật.
- **Chia sẻ state & routing phức tạp** — truyền dữ liệu và điều hướng xuyên các
  mảnh không hề tầm thường.
- **Khó debug xuyên mảnh** — một luồng đi qua nhiều ứng dụng khó truy vết.
- **Phiên bản & hợp đồng** — phải quản lý "mảnh A bản nào hợp với shell bản nào".
:::

## Khi nào NÊN dùng

Cân nhắc micro-frontend khi **đa số** các điều sau đúng:

- ✅ **Nhiều nhóm** (thường ≥ 3–4) cùng làm trên một sản phẩm và đang giẫm chân
  nhau.
- ✅ Ứng dụng **thực sự lớn**, nhiều mảng tính năng tách bạch rõ ràng.
- ✅ Cần **deploy độc lập** vì các mảng có nhịp phát hành rất khác nhau.
- ✅ Cần **tích hợp app cũ** (legacy) với phần mới mà không viết lại tất cả.
- ✅ Tổ chức **chấp nhận đầu tư** hạ tầng/DevOps tương xứng.

## Khi nào KHÔNG nên dùng

- ❌ **Nhóm nhỏ** (1–2 nhóm) — chi phí phức tạp lớn hơn lợi ích rất nhiều.
- ❌ App **vừa và nhỏ**, hoặc còn đang tìm hướng đi (chưa ổn định).
- ❌ Chỉ muốn "chia code cho gọn" — việc đó dùng **module/thư mục** là đủ.
- ❌ Đội chưa vững về build tooling, CI/CD — micro-frontend sẽ nhân đôi nỗi đau.

:::danger Sai lầm phổ biến nhất
Dùng micro-frontend để giải quyết **vấn đề kỹ thuật** (vd "code rối quá"). Nó là
giải pháp cho **vấn đề tổ chức/quy mô**. Code rối thì nên *refactor*, không phải
*chẻ nhỏ thành nhiều app* — làm vậy chỉ biến mớ rối trong một app thành mớ rối
trải khắp nhiều app.
:::

## Giải pháp thay thế: modular monolith

Trước khi nhảy sang micro-frontend, hãy cân nhắc **modular monolith** (khối nguyên
có module hoá tốt): vẫn một codebase / một deploy, nhưng chia **ranh giới module
rõ ràng** bên trong.

| | Modular monolith | Micro-frontend |
| --- | --- | --- |
| Codebase | Một | Nhiều |
| Deploy | Một lần | Độc lập từng mảnh |
| Độ phức tạp | Thấp | Cao |
| Phù hợp | Đa số dự án | Tổ chức lớn, nhiều nhóm |

> Quy tắc thực dụng: **bắt đầu bằng modular monolith**, chỉ tách sang
> micro-frontend khi *nỗi đau tổ chức* thực sự xuất hiện — đừng làm sớm.

## Tóm tắt

- **Ưu điểm chính**: nhóm tự chủ, deploy độc lập, nâng cấp dần, cô lập lỗi, scale
  tổ chức.
- **Cái giá**: phức tạp vận hành, trùng dependency, khó nhất quán UI, chia sẻ
  state/routing và debug đều khó hơn.
- **Nên dùng** khi: nhiều nhóm, app lớn, cần deploy độc lập, có đầu tư hạ tầng.
- **Không nên** khi: nhóm nhỏ, app vừa, hoặc chỉ muốn "chia code cho gọn".
- Micro-frontend trị **vấn đề tổ chức**, không phải vấn đề kỹ thuật. Cân nhắc
  **modular monolith** trước.

Hết mục Cơ bản. Mục tiếp theo: **Module Federation** — kỹ thuật runtime phổ biến
nhất, kèm demo React thực hành.

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Lợi ích lớn nhất của micro-frontend là gì, và vì sao nói nó giải quyết vấn đề *tổ chức* chứ không phải vấn đề kỹ thuật?**

<details className="qa">
<summary>Xem đáp án</summary>

Lợi ích lớn nhất là **nhóm tự chủ và deploy độc lập** — mỗi nhóm release theo nhịp riêng, không phải chờ nhau. Các lợi ích còn lại (nâng cấp dần, cô lập lỗi, scale theo tổ chức, build nhanh hơn theo mảnh) đều bắt nguồn từ đó.

Nói đây là vấn đề tổ chức vì thứ mà kiến trúc này tháo gỡ là **chi phí phối hợp giữa người với người**: merge conflict, xếp hàng chờ release, một nhóm lỡ hẹn kéo cả lịch phát hành. Về mặt thuần kỹ thuật, một monolith được viết tốt chạy nhanh hơn, nhẹ hơn và dễ debug hơn micro-frontend.

Hệ quả thực dụng: nếu đội bạn chỉ có một hai nhóm thì chia mảnh không giải quyết được gì, chỉ thêm chi phí vận hành. Micro-frontend chỉ có lãi khi nỗi đau phối hợp đã lớn hơn nỗi đau vận hành nhiều ứng dụng.

</details>

**2. "Độc lập deploy" cụ thể nghĩa là gì? Cần những điều kiện kỹ thuật nào để thực sự đạt được nó?**

<details className="qa">
<summary>Xem đáp án</summary>

Nghĩa là: đẩy một mảnh lên production mà **không build lại và không deploy lại** bất kỳ mảnh nào khác, kể cả shell.

Điều kiện kỹ thuật:

- **Tích hợp lúc runtime**, không phải build-time — shell chỉ giữ địa chỉ của mảnh, không giữ code của mảnh.
- **Mỗi mảnh có pipeline và artifact riêng**, host riêng.
- **Hợp đồng ổn định** giữa shell và mảnh (tên module phơi ra, props, sự kiện), để đổi bên trong không làm vỡ bên ngoài.
- **Chiến lược cache đúng** — file entry không được cache lâu, nếu không bản mới sẽ không tới người dùng.
- **Rollback theo từng mảnh** — trỏ lại artifact phiên bản trước mà không đụng phần còn lại.
- **Cô lập lỗi** để một mảnh deploy hỏng không kéo sập trang.

Nếu thiếu tích hợp runtime thì mọi thứ còn lại vô nghĩa — đó là điều kiện cần.

</details>

**3. Micro-frontend hỗ trợ nâng cấp framework dần dần ra sao? Hãy phác một lộ trình kiểu `strangler` cho một app cũ.**

<details className="qa">
<summary>Xem đáp án</summary>

Vì mỗi mảnh deploy độc lập, bạn có thể đổi framework **từng mảnh một** thay vì viết lại toàn bộ ("big bang rewrite") — rủi ro được chia nhỏ và luôn có đường lùi.

Lộ trình kiểu strangler (bóp nghẹt dần):

1. Giữ app cũ làm **shell** và chừa sẵn các ô trống trong DOM cho mảnh mới.
2. Chọn **một màn hình ít rủi ro nhất** làm thí điểm, viết lại bằng framework mới, host riêng.
3. Shell tải mảnh mới lúc runtime vào đúng ô đó; giữ nguyên màn hình cũ làm đường lùi.
4. Bật dần cho một phần người dùng, đo lỗi và hiệu năng trước khi mở rộng.
5. Lặp lại cho các màn hình tiếp theo, mỗi lần là một lần release nhỏ.
6. Khi phần lớn màn hình đã chuyển, **đảo vai trò shell** sang app mới rồi gỡ bỏ app cũ.

Điểm mấu chốt: mỗi bước đều chạy được trên production, không có giai đoạn "viết xong mới biết đúng sai".

</details>

**4. "Cô lập lỗi" đạt được nhờ cơ chế nào? Nó có tuyệt đối không, và trường hợp nào một mảnh vẫn kéo sập cả trang?**

<details className="qa">
<summary>Xem đáp án</summary>

Cơ chế thường dùng: bọc mỗi mảnh trong một **error boundary** ở shell, bắt lỗi khi tải mảnh (kèm timeout và fallback), và chia mảnh thành thiết yếu / không thiết yếu để quyết định ẩn đi hay báo lỗi.

Nhưng **không tuyệt đối** — bài học ghi rõ "lý tưởng là không làm sập cả trang". Lý do: mọi mảnh vẫn chung một tab, chung DOM, chung global, chung luồng JS. Những trường hợp vẫn kéo sập cả trang:

- Lỗi **ngoài phạm vi render** — trong event handler, `setTimeout`, promise không bắt — error boundary không thấy.
- Mảnh ghi đè hoặc phá hỏng **global** (sửa prototype, ghi đè `fetch`, khai báo biến toàn cục trùng tên).
- **CSS rò ra** làm hỏng layout toàn trang, dù JS vẫn chạy bình thường.
- Vòng lặp vô hạn hoặc rò bộ nhớ làm **đơ cả tab**.
- Mảnh làm hỏng **state dùng chung** mà các mảnh khác đang dựa vào.

Vì vậy cô lập lỗi cần cả kỷ luật code lẫn cơ chế kỹ thuật.

</details>

**5. Chi phí hiệu năng lớn nhất của micro-frontend là gì? Bạn đo và giảm trùng lặp `dependency` bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Chi phí lớn nhất là **trùng lặp dependency**: nếu không chia sẻ tốt, mỗi mảnh tự tải React của riêng nó, trang nặng và chậm hẳn. Kèm theo là chuỗi tải nối tiếp — phải tải shell trước rồi mới biết tải mảnh nào.

**Đo:**

- Phân tích bundle từng mảnh để xem thư viện nào bị đóng gói nhiều lần.
- Xem danh sách request thực tế trên production, tìm các file trùng nội dung khác tên.
- Theo dõi số liệu người dùng thật (thời gian tải, Core Web Vitals) chứ không chỉ kích thước lúc build.

**Giảm:**

- Khai báo **shared dependency** cho các thư viện lõi để chỉ tải một bản — đây chính là lý do Module Federation ra đời.
- Thống nhất một phiên bản React chung cho toàn tổ chức và có lịch nâng cấp đồng bộ.
- Lazy load mảnh dưới màn hình đầu; prefetch mảnh quan trọng.
- Đặt **ngân sách bundle** cho mỗi mảnh và kiểm tra trong pipeline.

</details>

**6. Làm sao giữ nhất quán UI/UX khi mỗi nhóm tự làm một mảnh? Vai trò và cách quản lý phiên bản của `design system` chung?**

<details className="qa">
<summary>Xem đáp án</summary>

Nhất quán UI là một trong những cái giá lớn nhất — mỗi nhóm làm một kiểu. Cần cả công cụ lẫn kỷ luật:

- **Design system chung** làm nguồn sự thật cho màu, khoảng cách, typography và các component nền.
- **Design token dưới dạng biến CSS** — cách chia sẻ theme an toàn nhất vì nó xuyên qua ranh giới giữa các mảnh mà không kéo theo logic.
- **Quy ước chung** về trạng thái loading, thông báo lỗi, form, để trải nghiệm đồng đều.
- **Review chéo** hoặc một nhóm nền tảng giữ vai trò gác cổng cho những thay đổi ảnh hưởng nhiều mảnh.

Về phiên bản: design system nên phát hành qua **npm package có version rõ ràng**, tuân thủ ngữ nghĩa version và tuyệt đối tránh đổi phá vỡ. Điểm cần cân nhắc là nếu chia sẻ nó lúc runtime như một singleton thì mọi mảnh buộc phải dùng chung một bản — nhất quán tuyệt đối nhưng mất tự chủ. Cách dung hoà phổ biến: chia sẻ token lúc runtime, còn component thì mỗi mảnh tự nâng version theo lịch của mình.

</details>

**7. Vì sao chia sẻ state và routing xuyên mảnh lại khó? Nêu vài rủi ro cụ thể bạn từng gặp hoặc lường trước.**

<details className="qa">
<summary>Xem đáp án</summary>

Khó vì state và routing vốn là thứ **toàn cục**, trong khi kiến trúc này cố tình dựng ranh giới giữa các mảnh. Hễ hai mảnh cùng đọc/ghi một dữ liệu là chúng lại phụ thuộc nhau, và phụ thuộc thì đối nghịch với độc lập deploy.

Rủi ro cụ thể:

- **Đổi hình dạng state dùng chung** buộc nhiều mảnh phải deploy đồng bộ — mất luôn lợi ích chính.
- **Hai router cùng ghi vào history** khiến nút back nhảy sai hoặc phải bấm hai lần.
- **Deep link hỏng** vì trạng thái thật nằm trong bộ nhớ của một mảnh, không nằm trên URL.
- **Race condition** khi một mảnh đọc state trước lúc mảnh sở hữu kịp khởi tạo.
- **Rò bộ nhớ** do mảnh không huỷ đăng ký khỏi store lúc unmount.
- **Khó truy nguồn** — khi giá trị sai, không biết mảnh nào đã ghi.

Cách an toàn: giữ state dùng chung ở mức tối thiểu (người dùng, theme, ngôn ngữ), coi URL là nguồn sự thật cho điều hướng, và giao tiếp qua sự kiện thay vì đọc chéo state của nhau.

</details>

**8. Debug và `observability` một luồng nghiệp vụ đi qua nhiều mảnh khó ở chỗ nào? Bạn dựng gì để truy vết đầu–cuối?**

<details className="qa">
<summary>Xem đáp án</summary>

Khó vì một luồng (ví dụ: tìm sản phẩm → xem chi tiết → thêm vào giỏ → thanh toán) đi qua nhiều ứng dụng do nhiều nhóm sở hữu, mỗi mảnh có build riêng, log riêng, thậm chí phiên bản khác nhau trên cùng một phiên người dùng. Stack trace lại thường bị rút gọn nên không rõ lỗi thuộc mảnh nào.

Những thứ nên dựng:

- **Gắn nhãn mảnh và phiên bản** vào mọi log, lỗi và số liệu — để biết ngay ai chịu trách nhiệm.
- **Correlation id** tạo ở shell, truyền xuống mọi mảnh và đính kèm vào request tới backend, để nối được toàn tuyến.
- **Upload source map** của từng mảnh lên hệ thống theo dõi lỗi.
- **Ghi lại sự kiện giao tiếp giữa các mảnh** (mảnh nào phát, mảnh nào nhận) làm dấu vết.
- **Giám sát riêng cho từng mảnh** cộng một dashboard chung ở cấp trang.
- **Session replay** cho các luồng quan trọng, vì tái hiện lỗi xuyên mảnh rất tốn công.

</details>

**9. Bạn quản lý hợp đồng và tương thích phiên bản giữa shell và các mảnh ra sao? Có nên có contract test không?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì ghép lúc runtime, shell gọi những thứ nó không build cùng — nên hợp đồng phải được định nghĩa tường minh: mảnh phơi ra module nào, nhận props gì, phát sự kiện gì, và những thứ đó được coi là API công khai.

Nguyên tắc quản lý:

- **Chỉ thay đổi theo hướng cộng thêm** — thêm props tuỳ chọn, thêm sự kiện mới.
- Khi buộc phải đổi phá vỡ, **phơi ra tên module mới**, để shell chuyển sang khi sẵn sàng, rồi mới gỡ bản cũ.
- Ghi rõ **khoảng phiên bản dependency dùng chung** mà mảnh chấp nhận.
- Có quy trình rollback theo từng mảnh khi phát hiện lệch.

**Nên có contract test** — thậm chí là bắt buộc. Trong monolith, trình biên dịch và một lần build chung đã bắt lỗi giao diện; ở đây không còn ai bắt hộ, lỗi sẽ chỉ lộ ra lúc chạy trên production. Contract test chạy trong pipeline của mảnh, kiểm tra nó vẫn phơi ra đúng những gì đã cam kết, và chặn deploy nếu vi phạm.

</details>

**10. Nêu các tiêu chí bạn dùng để quyết định *có* áp dụng micro-frontend. Quy mô bao nhiêu nhóm thì bắt đầu hợp lý?**

<details className="qa">
<summary>Xem đáp án</summary>

Nên cân nhắc khi **đa số** các điều sau đúng:

- **Nhiều nhóm** cùng làm trên một sản phẩm và đang giẫm chân nhau.
- Ứng dụng **thực sự lớn**, nhiều mảng tính năng tách bạch rõ ràng.
- Cần **deploy độc lập** vì các mảng có nhịp phát hành rất khác nhau.
- Cần **tích hợp app cũ** với phần mới mà không viết lại tất cả.
- Tổ chức **chấp nhận đầu tư** hạ tầng và DevOps tương xứng.

Về quy mô, ngưỡng thường được nhắc là từ **khoảng 3–4 nhóm trở lên**. Nhưng con số chỉ là chỉ dấu; điều quan trọng hơn là triệu chứng thật: merge conflict thường xuyên, lịch release phải xếp hàng, thời gian build đủ lâu để làm chậm vòng phản hồi, và ranh giới nghiệp vụ giữa các nhóm đã rõ ràng. Nếu chưa thấy những triệu chứng đó thì dù đông người vẫn chưa cần tách.

</details>

**11. Khi nào KHÔNG nên dùng micro-frontend? Dấu hiệu nào cho thấy một đội đang chọn nó vì trào lưu?**

<details className="qa">
<summary>Xem đáp án</summary>

Không nên dùng khi:

- **Nhóm nhỏ** (một đến hai nhóm) — chi phí phức tạp lớn hơn lợi ích rất nhiều.
- App **vừa và nhỏ**, hoặc còn đang tìm hướng đi, yêu cầu chưa ổn định.
- Chỉ muốn **"chia code cho gọn"** — việc đó dùng module hoặc thư mục là đủ.
- Đội **chưa vững build tooling và CI/CD** — micro-frontend sẽ nhân đôi nỗi đau.

Dấu hiệu chọn theo trào lưu:

- Lý do đưa ra là "code rối quá" hoặc "cho hiện đại", chứ không phải các nhóm đang chặn nhau.
- Không ai nêu được **ai sở hữu mảnh nào** — chia theo tầng kỹ thuật thay vì theo nghiệp vụ.
- Chưa có kế hoạch cho design system, giám sát, rollback và contract test.
- Kết quả cuối vẫn **deploy tất cả cùng lúc** — tức là chỉ đổi cách xếp thư mục.
- Không ai trả lời được câu hỏi "vấn đề này modular monolith giải quyết được không?".

</details>

**12. `Modular monolith` khác micro-frontend ở những điểm nào? Vì sao thường nên bắt đầu từ đó?**

<details className="qa">
<summary>Xem đáp án</summary>

Modular monolith vẫn là **một codebase, một lần deploy**, nhưng có ranh giới module rõ ràng bên trong.

| | Modular monolith | Micro-frontend |
| --- | --- | --- |
| Codebase | Một | Nhiều |
| Deploy | Một lần | Độc lập từng mảnh |
| Độ phức tạp | Thấp | Cao |
| Phù hợp | Đa số dự án | Tổ chức lớn, nhiều nhóm |

Nên bắt đầu từ đó vì nó mang lại **phần lớn lợi ích về tổ chức code** (ranh giới rõ, quyền sở hữu rõ, dễ refactor) mà gần như **không phải trả cái giá vận hành**: không trùng dependency, không cần contract test, không phải lo ghép lúc runtime hay debug xuyên mảnh.

Quan trọng hơn, ranh giới module tốt chính là bước chuẩn bị cho việc tách sau này: khi nỗi đau tổ chức thực sự xuất hiện, bạn chỉ việc nhấc từng module ra thành mảnh riêng. Ngược lại, tách sớm khi ranh giới còn mơ hồ sẽ tạo ra những mảnh phụ thuộc chằng chịt, rất khó sửa.

</details>

**13. Quản lý yêu cầu chẻ app thành micro-frontend vì "code rối quá" — bạn phản biện và đề xuất phương án thay thế thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Đây đúng là **sai lầm phổ biến nhất**: dùng micro-frontend để trị vấn đề kỹ thuật, trong khi nó là giải pháp cho vấn đề tổ chức. Chẻ nhỏ một mớ rối chỉ biến mớ rối trong một app thành **mớ rối trải khắp nhiều app** — cộng thêm chi phí vận hành.

Cách phản biện: chỉ ra rằng ranh giới giữa các mảnh sẽ được vẽ đúng trên chính những chỗ đang rối, nên coupling không biến mất mà chỉ chuyển từ lời gọi hàm (compiler bắt được) thành lời gọi qua mạng lúc runtime (chỉ vỡ trên production).

Đề xuất thay thế, theo thứ tự:

1. **Refactor và module hoá** — làm rõ ranh giới ngay trong codebase hiện tại, đó là việc phải làm dù sau này có tách hay không.
2. **Modular monolith** — cố định ranh giới bằng quy tắc phụ thuộc và quyền sở hữu module.
3. Nếu sau đó **nỗi đau tổ chức thật sự xuất hiện** (nhiều nhóm chặn nhau), lúc đó tách mảnh sẽ vừa dễ vừa đúng chỗ.

</details>

**14. Nên chia mảnh theo miền nghiệp vụ hay theo tầng kỹ thuật? Vì sao cách chia sai lại phá hỏng lợi ích của kiến trúc?**

<details className="qa">
<summary>Xem đáp án</summary>

Chia theo **miền nghiệp vụ** — tìm kiếm, giỏ hàng, thanh toán, hồ sơ người dùng — chứ không theo tầng kỹ thuật kiểu "mảnh component", "mảnh gọi API", "mảnh state".

Vì sao chia theo tầng phá hỏng mọi thứ: một yêu cầu nghiệp vụ bình thường ("thêm mã giảm giá vào giỏ hàng") sẽ chạm vào **tất cả** các mảnh cùng lúc. Hậu quả:

- Phải **deploy đồng bộ** nhiều mảnh cho một tính năng — mất độc lập deploy.
- Không nhóm nào **sở hữu trọn vẹn** một tính năng — mất tự chủ.
- Lỗi lan ngang qua mọi mảnh — cô lập lỗi vô nghĩa.
- Chi phí vận hành vẫn còn nguyên, còn lợi ích thì bằng không.

Chia theo nghiệp vụ thì phần lớn thay đổi nằm gọn trong một mảnh, một nhóm tự làm tự release. Đây cũng chính là tinh thần mà microservices theo đuổi ở backend: ranh giới kiến trúc nên trùng với ranh giới đội ngũ và nghiệp vụ.

</details>

**15. Nếu một thay đổi ở model dùng chung buộc mọi mảnh phải deploy lại cùng lúc thì kiến trúc đang sai ở đâu, và sửa theo hướng nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Sai ở chỗ các mảnh đang **coupling chặt qua một model dùng chung**. Khi mọi mảnh phải deploy đồng bộ, bạn đã mất đặc tính quan trọng nhất — độc lập deploy — và về bản chất đang vận hành một monolith phân tán: chịu đủ chi phí của micro-frontend mà không có lợi ích nào.

Hướng sửa:

- **Thu nhỏ bề mặt dùng chung** — chỉ giữ lại những gì thật sự chung (người dùng đăng nhập, theme, ngôn ngữ), còn lại để mỗi mảnh tự định nghĩa model của riêng nó, kể cả khi phải lặp một ít.
- **Thay đọc chéo state bằng sự kiện** — mảnh này thông báo "đã thêm vào giỏ", mảnh kia tự quyết định phản ứng, không ai phụ thuộc hình dạng dữ liệu của ai.
- **Đổi theo hướng cộng thêm** — thêm field mới, giữ field cũ cho tới khi mọi mảnh đã chuyển, rồi mới gỡ.
- **Xem lại ranh giới chia mảnh** — nếu một model chạm vào mọi mảnh, rất có thể bạn đang chia theo tầng kỹ thuật thay vì theo miền nghiệp vụ.

</details>
