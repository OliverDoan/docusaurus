---
sidebar_position: 2
title: "Kỹ năng quan trọng"
---

# Kỹ năng quan trọng

## 1. Thiết kế và đơn giản hoá

Bài học: [1. Thiết kế và đơn giản hoá](../../software-architect/02-important-skills/1_thiet-ke-va-don-gian-hoa.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Coupling và cohesion là gì? Vì sao muốn "cohesion cao, coupling thấp"?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Cohesion:** mức độ các phần tử trong một module cùng phục vụ một mục đích.
- **Coupling:** mức độ một module phải biết về module khác.

Cohesion cao giúp một thay đổi nghiệp vụ chỉ chạm một module; coupling thấp giúp thay đổi trong module đó không lan sang module khác. Kết quả: thay đổi nhanh hơn, ít rủi ro hơn, các đội làm việc song song ít dẫm chân nhau.

</details>

**2. Essential complexity và accidental complexity khác nhau thế nào? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

Theo Fred Brooks: **essential** đến từ bài toán (quy tắc tính thuế, quy trình hoàn tiền), không thể bỏ, chỉ tổ chức cho gọn. **Accidental** đến từ lời giải (quá nhiều service, framework chồng chéo, lớp mapper thừa), có thể và nên giảm.

Kiến trúc sư giảm accidental complexity, và đôi khi giảm cả essential complexity bằng cách đàm phán lại yêu cầu với business.

</details>

**3. YAGNI có mâu thuẫn với việc thiết kế cho tương lai không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không, nếu phân biệt **xây trước** và **giữ cửa mở**. YAGNI cấm trả trước chi phí cho nhu cầu chưa chắc có (dựng Kafka, sharding khi chưa cần). Nhưng ta vẫn nên giữ cho thay đổi tương lai rẻ: ranh giới module rõ, giao diện che giấu chi tiết cài đặt, test tốt. Khi nhu cầu thật xuất hiện, ta thay cài đặt thay vì viết lại.

</details>

**4. Khi nào bạn tách một module trong monolith thành service riêng?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi có lý do cụ thể mà tách mới giải quyết được, ví dụ:

- Một đội riêng cần deploy độc lập với nhịp riêng.
- Module có nhu cầu tải hoặc tài nguyên rất khác phần còn lại (xử lý ảnh, tìm kiếm).
- Yêu cầu cô lập về bảo mật hoặc tuân thủ (dữ liệu thanh toán).
- Cần công nghệ khác hẳn.

Và chỉ tách khi ranh giới module đã ổn định; tách ranh giới còn đang thay đổi sẽ tạo distributed monolith.

</details>

**5. Bạn nhận ra một đề xuất kiến trúc là over-engineering bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- Lý do dựa trên "sau này", "phòng khi", "công ty lớn làm thế" thay vì yêu cầu hiện tại.
- Số thành phần hạ tầng lớn so với quy mô đội và tải.
- Nhiều lớp trừu tượng chỉ có một cài đặt.
- Không mô tả được phiên bản đơn giản hơn đã được cân nhắc và vì sao bị loại.

Cách xử lý: yêu cầu so sánh với một phương án đơn giản hơn, nêu rõ ràng buộc nào khiến phương án đơn giản không đủ.

</details>

---

## 2. Ra quyết định

Bài học: [2. Ra quyết định](../../software-architect/02-important-skills/2_ra-quyet-dinh.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. ADR là gì? Một ADR gồm những phần nào?**

<details className="qa">
<summary>Xem đáp án</summary>

ADR (Architecture Decision Record) là file ngắn ghi lại một quyết định kiến trúc quan trọng, lưu trong repo. Các phần theo mẫu của Michael Nygard: **Tiêu đề**, **Trạng thái** (proposed, accepted, deprecated, superseded), **Bối cảnh** (vấn đề, ràng buộc), **Quyết định**, **Hệ quả** (cả tích cực và tiêu cực). Nhiều đội thêm phần phương án đã cân nhắc và điều kiện xem xét lại.

ADR không sửa sau khi chấp nhận; đổi ý thì viết ADR mới thay thế.

</details>

**2. Phân biệt quyết định "one-way door" và "two-way door". Vì sao quan trọng?**

<details className="qa">
<summary>Xem đáp án</summary>

- **One-way door:** khó hoặc không thể đảo ngược (API công khai, schema dữ liệu lõi, nhà cung cấp cloud). Cần phân tích kỹ.
- **Two-way door:** đảo ngược được với chi phí thấp (thư viện nội bộ, cấu trúc thư mục). Nên quyết nhanh, ở cấp đội.

Quan trọng vì nó quyết định **mức đầu tư phân tích**. Xử lý mọi quyết định như one-way door làm tổ chức chậm; xử lý one-way door như two-way door dẫn tới sai lầm đắt. Kỹ năng nâng cao là biến one-way thành two-way (lớp trừu tượng, feature flag, rollout từng phần).

</details>

**3. Bạn và một senior trong đội bất đồng về việc chọn database. Bạn xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- Đưa tranh luận về **tiêu chí**: cùng thống nhất yêu cầu và trọng số trước, thay vì tranh luận công nghệ.
- Tìm điểm bất đồng thật: thường là khác nhau về giả định (tải, kiểu truy vấn). Kiểm chứng giả định bằng dữ liệu hoặc spike.
- Ghi lại cả hai quan điểm trong design doc hoặc ADR.
- Nếu vẫn không thống nhất, người chịu trách nhiệm quyết, và mọi người "disagree and commit". Đặt điều kiện xem lại để quan điểm thiểu số có cơ hội được kiểm chứng.

</details>

**4. "Last responsible moment" là gì? Hoãn quyết định có phải lúc nào cũng tốt?**

<details className="qa">
<summary>Xem đáp án</summary>

Là thời điểm muộn nhất có thể quyết định mà không làm mất phương án quan trọng hay gây chậm trễ. Hoãn đến lúc đó giúp quyết với nhiều thông tin hơn.

Không phải lúc nào cũng tốt: hoãn quá lâu thì đội tự ngầm quyết qua code, hoặc dự án bị chặn. Một số quyết định (định dạng ID, ranh giới dữ liệu) lại nên chốt sớm vì đổi sau rất đắt.

</details>

**5. Khi nào dùng design doc, khi nào dùng ADR?**

<details className="qa">
<summary>Xem đáp án</summary>

**Design doc / RFC** dùng **trước** khi quyết: trình bày chi tiết, phương án, mời góp ý, có thể dài. **ADR** dùng **sau** khi quyết: ghi ngắn gọn bối cảnh, quyết định và hệ quả, bất biến.

Hai thứ bổ sung nhau: design doc giúp ra quyết định tốt, ADR giúp nhớ quyết định đó. ADR có thể dẫn link tới design doc để ai cần chi tiết thì đọc thêm.

</details>

---

## 3. Vẫn phải viết code

Bài học: [3. Vẫn phải viết code](../../software-architect/02-important-skills/3_van-phai-viet-code.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Kiến trúc sư có cần viết code không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Có, nhưng với mục đích khác developer. Viết code giúp quyết định kiến trúc bám thực tế, ước lượng sát, đánh giá công nghệ bằng thử nghiệm thay vì đọc quảng cáo, và giữ uy tín với đội. Loại code phù hợp: spike, PoC, walking skeleton, module mẫu, công cụ kiểm tra kiến trúc, review các PR quan trọng. Tránh nhận việc nằm trên đường găng.

</details>

**2. Spike, proof of concept và prototype khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Spike:** thí nghiệm có timebox để trả lời một câu hỏi kỹ thuật hẹp (hiệu năng, cách dùng API). Kết quả là kiến thức.
- **Proof of concept:** chứng minh một ý tưởng hoặc rủi ro lớn nhất là khả thi.
- **Prototype:** bản thử để lấy phản hồi về trải nghiệm hoặc thiết kế, thường cho người dùng hoặc các bên liên quan xem.

Cả ba thường được vứt đi sau khi có kết luận. Khác với **walking skeleton**, là bộ khung được giữ lại và phát triển tiếp.

</details>

**3. Walking skeleton là gì và vì sao nên làm sớm?**

<details className="qa">
<summary>Xem đáp án</summary>

Là cài đặt nhỏ nhất của hệ thống nhưng chạy được từ đầu đến cuối qua mọi thành phần kiến trúc chính (UI, API, DB, auth) và được deploy bằng pipeline thật. Làm sớm để kiểm chứng kiến trúc trên giấy, phát hiện vấn đề tích hợp và hạ tầng ngay từ đầu, chốt các quy ước nền (cấu trúc thư mục, logging, migration), và cho đội một mẫu để phát triển tiếp.

</details>

**4. Làm sao để quy tắc kiến trúc không chỉ nằm trên giấy?**

<details className="qa">
<summary>Xem đáp án</summary>

Biến chúng thành kiểm tra tự động chạy trong CI: ArchUnit cho Java, dependency-cruiser hoặc ESLint cho TypeScript để chặn import sai ranh giới; kiểm tra schema API bằng contract test; ngưỡng hiệu năng trong test tải. Kết hợp với `CODEOWNERS` để người hiểu kiến trúc được mời review các vùng nhạy cảm. Đây là ý tưởng fitness function trong kiến trúc tiến hoá.

</details>

**5. Khi review code, kiến trúc sư nên chú ý điều gì khác so với developer?**

<details className="qa">
<summary>Xem đáp án</summary>

Ranh giới module và chiều phụ thuộc, dependency mới được thêm vào, sự nhất quán của chiến lược xử lý lỗi, retry, timeout, các lời gọi mạng trong vòng lặp, thay đổi shape API hoặc schema dữ liệu. Quan trọng hơn là nhìn **xu hướng** qua nhiều PR: một vi phạm lặp lại cho thấy quy tắc chưa rõ hoặc thiết kế đang gây khó cho đội.

</details>

---

## 4. Tài liệu kiến trúc

Bài học: [4. Tài liệu kiến trúc](../../software-architect/02-important-skills/4_tai-lieu-kien-truc.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Mô hình C4 gồm những mức nào? Mỗi mức dành cho ai?**

<details className="qa">
<summary>Xem đáp án</summary>

1. **System Context:** hệ thống là một hộp, xung quanh là người dùng và hệ thống ngoài. Cho mọi người, kể cả không kỹ thuật.
2. **Container:** các ứng dụng chạy được và kho dữ liệu (web app, API, DB, queue) cùng cách chúng giao tiếp. Cho developer và vận hành.
3. **Component:** các khối lớn bên trong một container. Cho developer làm trên container đó.
4. **Code:** class, interface. Hiếm khi vẽ tay, thường để IDE sinh.

Ngoài ra có sơ đồ bổ trợ: deployment, dynamic, system landscape.

</details>

**2. "Container" trong C4 có phải là Docker container không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không hẳn. Trong C4, container là **một đơn vị chạy được độc lập hoặc một nơi lưu dữ liệu**: một app Spring Boot, một SPA React chạy trên trình duyệt, một database, một bucket lưu file. Nó có thể chạy trong Docker container hoặc không. Sơ đồ deployment mới là nơi thể hiện container C4 được đặt lên Docker, Kubernetes hay máy ảo nào.

</details>

**3. Docs as code là gì? Lợi ích so với wiki?**

<details className="qa">
<summary>Xem đáp án</summary>

Là quản lý tài liệu bằng quy trình như code: định dạng text (Markdown, Mermaid, PlantUML), lưu trong Git cạnh code, review qua pull request, build và publish bằng CI.

Lợi ích: tài liệu được cập nhật cùng PR với thay đổi code nên ít lỗi thời; có lịch sử và diff; có review; kiểm tra tự động được (link gãy, sơ đồ lỗi); developer không phải chuyển sang công cụ khác. Wiki dễ bắt đầu hơn nhưng thường tách rời code và lỗi thời nhanh.

</details>

**4. Bạn làm gì để tài liệu kiến trúc không bị lỗi thời?**

<details className="qa">
<summary>Xem đáp án</summary>

- Chỉ viết những thứ ổn định và khó suy ra từ code.
- Đặt tài liệu trong repo, thêm mục kiểm tra trong template PR.
- Sinh tự động những gì sinh được (OpenAPI, sơ đồ từ mô hình Structurizr).
- Gán chủ sở hữu cho từng tài liệu, ghi ngày cập nhật.
- Xoá tài liệu không còn dùng.
- Kiểm tra link và render sơ đồ trong CI.

</details>

**5. Design doc nên có những phần nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Bối cảnh và vấn đề, mục tiêu và **ngoài phạm vi**, đề xuất (kèm sơ đồ), **các phương án đã cân nhắc** và vì sao không chọn, ảnh hưởng (API, dữ liệu, bảo mật, vận hành, chi phí), kế hoạch triển khai và rollback, câu hỏi còn mở. Hai phần ngoài phạm vi và phương án đã cân nhắc giúp tránh tranh luận lặp lại và giữ phạm vi rõ ràng. Sau khi duyệt, kết quả được tóm tắt thành ADR.

</details>

---

## 5. Giao tiếp

Bài học: [5. Giao tiếp](../../software-architect/02-important-skills/5_giao-tiep.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Bạn giải thích một quyết định kỹ thuật cho người không có nền tảng kỹ thuật như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- Bắt đầu bằng **tác động kinh doanh**: quyết định này giúp gì cho người dùng, doanh thu, chi phí, rủi ro.
- Dùng **so sánh đời thường** thay vì thuật ngữ (ví dụ cache giống như để đồ hay dùng ở bàn thay vì cất trong kho).
- Trình bày **lựa chọn và đánh đổi** bằng con số họ quan tâm: thời gian, tiền, số người dùng bị ảnh hưởng.
- Kết thúc bằng **điều cần họ quyết định** và hạn chót.
- Kiểm tra lại bằng cách hỏi họ tóm tắt lại để chắc đã hiểu.

</details>

**2. Khi bạn và một senior developer bất đồng về thiết kế, bạn xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

1. Lắng nghe và nhắc lại lập luận của họ cho đến khi họ đồng ý là mình đã hiểu đúng.
2. Thống nhất **tiêu chí đánh giá** (hiệu năng, độ phức tạp, thời gian, khả năng bảo trì).
3. Đưa về **dữ kiện**: benchmark, PoC nhỏ, kinh nghiệm từ dự án tương tự.
4. Nếu quyết định dễ đảo ngược, chọn nhanh và đo lại. Nếu khó đảo ngược, người chịu trách nhiệm quyết sau khi nghe đủ.
5. Ghi ADR kèm phương án bị loại, sau đó cả hai **disagree and commit**.

Điểm nhà tuyển dụng muốn nghe: bạn không dùng chức danh để áp đặt và không để bất đồng thành chuyện cá nhân.

</details>

**3. BLUF là gì? Vì sao nên dùng khi viết đề xuất kỹ thuật?**

<details className="qa">
<summary>Xem đáp án</summary>

BLUF (Bottom Line Up Front) là đặt **kết luận hoặc lời đề nghị** ngay ở câu đầu tiên, chi tiết và lý lẽ nằm sau. Lý do nên dùng: người ra quyết định thường bận và chỉ đọc phần đầu; BLUF giúp họ biết ngay cần làm gì, còn ai cần chi tiết vẫn đọc tiếp được. Nó cũng buộc người viết phải rõ ràng về điều mình thực sự muốn đề xuất.

</details>

**4. Design doc, RFC và ADR khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Design doc:** mô tả cách thiết kế một tính năng hoặc hệ thống, gồm bối cảnh, phương án, chi tiết kỹ thuật. Thường dài vài trang.
- **RFC:** một đề xuất mở để lấy ý kiến rộng, thường cho thay đổi ảnh hưởng nhiều đội, có quy trình góp ý và chốt.
- **ADR:** bản ghi ngắn về **một quyết định** đã đưa ra: bối cảnh, quyết định, hệ quả. Thường nằm trong repo cùng code.

Một RFC hoặc design doc sau khi chốt có thể sinh ra một hoặc vài ADR.

</details>

**5. Làm sao để cuộc họp review kiến trúc không kéo dài vô ích?**

<details className="qa">
<summary>Xem đáp án</summary>

- Có **mục tiêu cụ thể** (chốt phương án, xác định rủi ro), không phải "bàn chung chung".
- Gửi tài liệu đọc trước, hoặc dành vài phút đầu để đọc trong im lặng.
- Chỉ mời người cần quyết định hoặc có thông tin.
- Đưa chủ đề ngoài lề vào parking lot.
- Kết thúc bằng danh sách quyết định, người phụ trách, hạn chót, và cập nhật ADR ngay sau đó.

</details>

**6. Stakeholder map dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Để xác định **ai cần được giao tiếp và ở mức nào**. Phổ biến nhất là ma trận quyền lực / mức quan tâm: nhóm quyền lực cao, quan tâm cao cần quản lý sát; quyền lực cao, quan tâm thấp cần giữ hài lòng bằng báo cáo ngắn; quyền lực thấp, quan tâm cao cần được cung cấp thông tin đầy đủ; nhóm còn lại chỉ cần theo dõi. Bản đồ này cần được xem lại khi dự án thay đổi, vì một bên ít quan tâm có thể đột ngột trở nên quan trọng (ví dụ bộ phận pháp lý khi có dữ liệu cá nhân).

</details>

---

## 6. Ước lượng và đánh giá

Bài học: [6. Ước lượng và đánh giá](../../software-architect/02-important-skills/6_uoc-luong-va-danh-gia.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Bạn ước lượng một tính năng lớn mà yêu cầu còn chưa rõ như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- Nêu rõ đang ở đầu cone of uncertainty, nên đưa **khoảng rộng** kèm giả định.
- Chia tính năng thành các phần, ước lượng tương đối với việc đã làm, dùng three-point cho phần rủi ro.
- Xác định phần nào có khoảng rộng nhất, đó là chỗ cần **spike** hoặc làm rõ yêu cầu trước.
- Hẹn mốc ước lượng lại sau khi spike xong hoặc yêu cầu được chốt.
- Nếu có hạn chót cứng, đề xuất cắt phạm vi (MVP) thay vì nén ước lượng.

</details>

**2. Ước lượng nhanh: một dịch vụ rút gọn link có 100 triệu link mới mỗi tháng, cần bao nhiêu dung lượng cho 5 năm?**

<details className="qa">
<summary>Xem đáp án</summary>

- Số link: 100 triệu x 12 x 5 = 6 tỷ link.
- Mỗi bản ghi giả sử khoảng 500 byte (link gốc, mã ngắn, thời gian tạo, người tạo).
- Dung lượng: 6 tỷ x 500 byte = 3.000 GB, tức khoảng 3 TB, chưa tính index và bản sao.
- Ghi: 100 triệu / (30 x 100.000 giây) khoảng 33 QPS trung bình.
- Nếu tỷ lệ đọc/ghi khoảng 100:1 thì đọc khoảng 3.300 QPS trung bình, cao điểm cao hơn vài lần, nên cần cache.

Điều quan trọng là nói rõ giả định và làm tròn hợp lý, không phải con số tuyệt đối.

</details>

**3. Fitness function là gì? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

Là một phép kiểm tra khách quan, thường tự động, cho biết hệ thống còn giữ một đặc tính kiến trúc mong muốn không. Ví dụ:

- **ArchUnit** test trong Java: tầng controller không được truy cập trực tiếp repository, không có phụ thuộc vòng giữa các package.
- **dependency-cruiser** trong Node.js: thư mục `routes` không được import `db`.
- Test hiệu năng trong pipeline: p95 của API dưới ngưỡng.
- Kiểm tra dependency không có lỗ hổng nghiêm trọng.

Fitness function giúp kiến trúc không bị mục dần, giống test giữ cho nghiệp vụ không bị hỏng.

</details>

**4. ATAM là gì? Kết quả chính của nó gồm những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

ATAM (Architecture Tradeoff Analysis Method) là phương pháp đánh giá kiến trúc của SEI, đánh giá kiến trúc theo các **kịch bản thuộc tính chất lượng** quan trọng nhất với mục tiêu kinh doanh. Kết quả gồm: **rủi ro**, **không rủi ro**, **điểm nhạy cảm** (tham số ảnh hưởng mạnh đến một thuộc tính) và **điểm đánh đổi** (quyết định ảnh hưởng nhiều thuộc tính theo hướng ngược nhau). Với dự án nhỏ, có thể dùng phiên bản rút gọn: design doc có kịch bản và một buổi review tập trung vào rủi ro.

</details>

**5. Bạn thuyết phục lãnh đạo dành thời gian trả nợ kỹ thuật như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- Nói bằng **tác động kinh doanh**, không bằng "code xấu": tính năng ở module này mất gấp đôi thời gian, bug lặp lại gây mất đơn hàng.
- Đưa **dữ liệu**: cycle time tăng qua các quý, số sự cố liên quan, hotspot từ lịch sử git.
- Đề xuất cụ thể, có phạm vi: trả phần nợ ở hotspot, đo kết quả sau đó.
- Ưu tiên cách **trả dần** (một phần năng lực mỗi sprint) thay vì một dự án refactor lớn khó duyệt.
- Phân biệt nợ cẩn trọng có chủ đích (chấp nhận được) với nợ cần trả ngay.

</details>

**6. Khi nào nên làm PoC trước khi chọn công nghệ?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi quyết định **khó đảo ngược** (database chính, message broker, framework nền), khi đội **chưa có kinh nghiệm** với công nghệ đó, hoặc khi có **yêu cầu đặc thù** mà tài liệu không trả lời được (thứ tự event ở tải cao, độ trễ ở dữ liệu thật). PoC cần câu hỏi cụ thể, thời hạn cứng, tiêu chí thành công viết trước, và không mặc nhiên đưa lên production.

</details>

---

## 7. Cân bằng

Bài học: [7. Cân bằng](../../software-architect/02-important-skills/7_can-bang.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Kể một lần bạn phải đánh đổi giữa hai thuộc tính chất lượng. Bạn quyết định thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Nhà tuyển dụng muốn nghe một câu chuyện có cấu trúc (ví dụ theo STAR: tình huống, nhiệm vụ, hành động, kết quả):

- **Bối cảnh:** hai thuộc tính nào xung đột, vì sao (ví dụ dashboard cần nhanh nhưng dữ liệu phải chính xác).
- **Cách quyết:** đã làm rõ ưu tiên với ai, có những phương án nào, dựa vào dữ liệu gì.
- **Đánh đổi chấp nhận:** mất gì (dữ liệu trễ 5 phút), và vì sao chấp nhận được.
- **Kết quả và bài học:** đo được gì, có xem lại quyết định không.

Điểm cộng: nói rõ quyết định được ghi lại và có điều kiện để xem lại.

</details>

**2. Khi nào nên tự xây (build) và khi nào nên dùng giải pháp có sẵn (buy)?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Tự xây** khi thành phần đó là **lợi thế cạnh tranh cốt lõi**, không có sản phẩm đáp ứng, và đội có năng lực xây lẫn vận hành lâu dài.
- **Dùng có sẵn** cho các năng lực phổ biến không tạo khác biệt: xác thực, email, thanh toán, giám sát.
- So **tổng chi phí sở hữu**: chi phí xây, vận hành, bảo trì, so với phí dịch vụ tăng theo quy mô.
- Cân nhắc rủi ro phụ thuộc nhà cung cấp, và giảm nó bằng cách bọc dịch vụ sau một interface của mình.

</details>

**3. Deadline bị rút ngắn một nửa. Bạn xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- Không im lặng cắt chất lượng.
- Làm rõ phần nào của phạm vi là **bắt buộc** cho mục tiêu kinh doanh, đề xuất ra MVP với phần đó.
- Trình bày các lựa chọn rõ ràng: cắt phạm vi, lùi thời gian, hay chấp nhận nợ kỹ thuật có kiểm soát; mỗi lựa chọn có hệ quả gì.
- Lưu ý thêm người vào dự án đang gấp thường không giúp (định luật Brooks).
- Nếu chấp nhận nợ, ghi vào backlog kèm kế hoạch trả.

</details>

**4. Làm sao cân bằng giữa chuẩn hoá công nghệ và quyền tự chủ của các đội?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Chuẩn hoá ở ranh giới:** API, xác thực, log, metric, bảo mật, định dạng sự kiện, vì đây là nơi các đội và hệ thống gặp nhau.
- **Tự do ở bên trong:** cách tổ chức code, thư viện nội bộ của service.
- Cung cấp **paved road**: template và công cụ được hỗ trợ sẵn, đi đường này thì dễ; đi đường khác thì được nhưng tự vận hành.
- Dùng **tech radar** nội bộ để định hướng mà không cấm đoán cứng nhắc.

</details>

**5. Bạn quản lý rủi ro kỹ thuật trong một dự án như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- Liệt kê rủi ro sớm (cùng đội, qua review kiến trúc), ghi vào risk register.
- Đánh giá theo **khả năng x tác động**, ưu tiên rủi ro cao ở cả hai trục.
- Chọn chiến lược: né tránh, giảm thiểu, chuyển giao, chấp nhận; có người phụ trách cho mỗi rủi ro.
- Giảm bất định sớm bằng spike, PoC, load test.
- Xem lại định kỳ, vì rủi ro thay đổi theo tiến độ.

</details>

**6. Vì sao nói "không có kiến trúc tốt nhất"?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì mỗi kiến trúc là một tập hợp đánh đổi giữa các thuộc tính chất lượng, chi phí, thời gian và năng lực đội. Kiến trúc tốt cho một ngân hàng lớn (nhất quán chặt, nhiều lớp kiểm soát) có thể là thảm hoạ cho một startup cần ra mắt nhanh, và ngược lại. Kiến trúc "tốt" là kiến trúc **phù hợp nhất với ưu tiên và ràng buộc hiện tại**, và đủ linh hoạt để thay đổi khi ưu tiên thay đổi.

</details>

---

## 8. Tư vấn, coaching và marketing

Bài học: [8. Tư vấn, coaching và marketing](../../software-architect/02-important-skills/8_tu-van-coaching-marketing.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Mentoring và coaching khác nhau thế nào? Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Mentoring:** chia sẻ kinh nghiệm, kiến thức, lời khuyên. Phù hợp khi người kia thiếu kiến thức, ví dụ junior mới vào chưa biết hệ thống.
- **Coaching:** đặt câu hỏi để người kia tự tìm ra hướng giải quyết (ví dụ theo mô hình GROW). Phù hợp khi người kia có năng lực nhưng cần làm rõ suy nghĩ hoặc phát triển khả năng tự quyết.

Thực tế thường kết hợp cả hai, và khi có sự cố gấp thì nói thẳng cách làm.

</details>

**2. Làm sao bạn thuyết phục ban lãnh đạo đầu tư vào một thay đổi kiến trúc lớn?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Bán vấn đề trước:** mô tả tác động kinh doanh bằng số liệu thật (thời gian ra tính năng, sự cố, chi phí, khách hàng bị ảnh hưởng).
- Viết **business case** ngắn: vấn đề, đề xuất, chi phí, lợi ích, phương án "không làm gì", rủi ro.
- Dùng **ROI** hoặc **cost of delay** để so sánh với các việc khác.
- **Gặp riêng** những người có ảnh hưởng trước, điều chỉnh theo lo ngại của họ.
- Đề xuất **bắt đầu nhỏ** bằng một giai đoạn thử nghiệm có tiêu chí đo, rồi mở rộng khi có kết quả.

</details>

**3. Bạn làm gì khi đội không làm theo kiến trúc đã thống nhất?**

<details className="qa">
<summary>Xem đáp án</summary>

- Trước tiên **tìm hiểu lý do**: đội không hiểu, không đồng ý, hay kiến trúc không phù hợp với thực tế họ gặp? Có thể kiến trúc cần điều chỉnh.
- Nếu do không hiểu: giải thích lý do, tài liệu, pair programming, tech talk.
- Nếu do không đồng ý: mở lại thảo luận dựa trên dữ kiện, cập nhật ADR nếu cần.
- Nếu là quy tắc quan trọng và đã thống nhất: tự động hoá kiểm tra bằng fitness function trong CI thay vì nhắc nhở thủ công.
- Tránh dùng chức danh để ép buộc.

</details>

**4. Bus factor là gì? Bạn cải thiện nó thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Bus factor là số người tối thiểu mà nếu họ đột ngột rời đi, dự án sẽ gặp khó khăn nghiêm trọng. Bus factor thấp (đặc biệt bằng 1) là rủi ro lớn.

Cải thiện bằng: pair và mob programming cho phần khó, luân chuyển người làm các phần khác nhau, code review bắt buộc, tài liệu và ADR, tech talk, và kiến trúc sư chủ động truyền lại kiến thức thay vì giữ cho riêng mình.

</details>

**5. Cost of delay là gì? Dùng nó để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Cost of delay là chi phí (doanh thu mất, rủi ro tăng, chi phí phát sinh) mà tổ chức phải chịu cho mỗi đơn vị thời gian một việc chưa được làm. Nó giúp so sánh việc kỹ thuật (trả nợ, nâng cấp bảo mật) với tính năng kinh doanh trên cùng một thước đo. Kết hợp với thời gian thực hiện (CD3: chi phí trì hoãn chia cho thời gian làm) để xếp ưu tiên: việc có chi phí trì hoãn cao và làm nhanh nên đi trước.

</details>

**6. Làm sao để có ảnh hưởng khi bạn không phải là quản lý của đội?**

<details className="qa">
<summary>Xem đáp án</summary>

- Xây **uy tín kỹ thuật**: vẫn viết code, hiểu hệ thống sâu, đưa ra lời khuyên đúng.
- Xây **sự tin tưởng**: làm đúng điều đã hứa, trung thực, thừa nhận khi sai, ghi công cho đội.
- **Lắng nghe và cho người khác tham gia** từ sớm vào quá trình thiết kế.
- Thuyết phục bằng **câu hỏi, dữ liệu và thử nghiệm** thay vì mệnh lệnh.
- Chọn trận để đấu: nhượng bộ ở quyết định nhỏ, giữ lập trường ở quyết định khó đảo ngược.

</details>
