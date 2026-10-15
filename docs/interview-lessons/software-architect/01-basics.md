---
sidebar_position: 1
title: "Nền tảng kiến trúc"
---

# Nền tảng kiến trúc

## 1. Kiến trúc phần mềm là gì

Bài học: [1. Kiến trúc phần mềm là gì](../../software-architect/01-basics/1_kien-truc-phan-mem-la-gi.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Kiến trúc phần mềm là gì? Nêu theo cách của bạn.**

<details className="qa">
<summary>Xem đáp án</summary>

Kiến trúc là tập hợp các **quyết định cấu trúc quan trọng** của hệ thống: chia thành những thành phần nào, chúng giao tiếp ra sao, dữ liệu nằm ở đâu, cùng với **lý do** của các quyết định đó. "Quan trọng" ở đây nghĩa là **khó và đắt để thay đổi** (theo Booch, Fowler). Kiến trúc được dẫn dắt bởi thuộc tính chất lượng và ràng buộc, không chỉ bởi chức năng.

</details>

**2. Kiến trúc khác thiết kế ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Đó là một dải liên tục. Kiến trúc ở mức toàn hệ thống: ranh giới thành phần, cách giao tiếp, công nghệ nền tảng, ảnh hưởng nhiều đội và đắt để đổi. Thiết kế ở mức bên trong một thành phần: class, pattern, cấu trúc hàm, thường gói gọn trong một đội và đổi rẻ hơn. Tiêu chí thực dụng: hỏi chi phí sửa nếu quyết định sai.

</details>

**3. Thuộc tính chất lượng là gì? Vì sao không thể tối đa tất cả?**

<details className="qa">
<summary>Xem đáp án</summary>

Là các yêu cầu phi chức năng như hiệu năng, độ tin cậy, bảo mật, khả năng bảo trì, khả năng mở rộng (ISO/IEC 25010 là một bộ phân loại chuẩn). Chúng thường mâu thuẫn: bảo mật cao hơn thường chậm hơn, nhất quán mạnh làm giảm tính sẵn sàng khi có phân vùng mạng, phân tán để mở rộng làm tăng độ phức tạp. Vì vậy phải ưu tiên vài thuộc tính quan trọng nhất cho từng hệ thống và viết chúng thành mục tiêu đo được.

</details>

**4. Định luật Conway nói gì? Ứng dụng thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Hệ thống có xu hướng sao chép cấu trúc giao tiếp của tổ chức tạo ra nó. Ứng dụng: muốn có các service độc lập thì cần các đội tự chủ tương ứng; có thể dùng "inverse Conway maneuver", tổ chức đội theo miền nghiệp vụ để kiến trúc đi theo hướng mong muốn. Bỏ qua định luật này thường dẫn tới distributed monolith.

</details>

**5. Làm sao biết một quyết định cần cân nhắc kỹ hay quyết nhanh?**

<details className="qa">
<summary>Xem đáp án</summary>

Xét khả năng đảo ngược. Cửa một chiều (database chính, hợp đồng API công khai, ranh giới service) cần phân tích phương án, prototype, ghi ADR. Cửa hai chiều (thư viện tiện ích, cấu hình) nên quyết nhanh rồi đo và điều chỉnh. Ngoài ra nên tìm cách biến cửa một chiều thành hai chiều bằng lớp trừu tượng, feature flag, và trì hoãn quyết định tới "last responsible moment".

</details>

---

## 2. Kiến trúc sư phần mềm

Bài học: [2. Kiến trúc sư phần mềm](../../software-architect/01-basics/2_kien-truc-su-phan-mem.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Theo bạn, trách nhiệm chính của một kiến trúc sư phần mềm là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Ra các quyết định kỹ thuật quan trọng dựa trên thuộc tính chất lượng và ràng buộc, ghi lại lý do, truyền đạt cho các bên liên quan, đảm bảo đội thực thi nhất quán và liên tục đánh giá lại kiến trúc khi bối cảnh đổi. Bên cạnh đó là hướng dẫn đội và làm cầu nối giữa kỹ thuật với kinh doanh.

</details>

**2. Kiến trúc sư khác tech lead thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Tech lead thường gắn với một đội, chịu trách nhiệm đội giao việc đúng hạn và chất lượng, thời gian nhìn khoảng vài sprint. Kiến trúc sư có phạm vi nhiều đội hoặc nhiều hệ thống, tập trung vào hình dạng hệ thống và các quyết định xuyên suốt, nhìn xa hơn. Ở công ty nhỏ một người có thể làm cả hai.

</details>

**3. "Ivory tower architect" là gì và làm sao tránh?**

<details className="qa">
<summary>Xem đáp án</summary>

Là kiến trúc sư tách biệt khỏi đội, quyết định từ trên xuống mà không hiểu thực tế triển khai. Cách tránh: vẫn viết code (prototype, spike, phần then chốt), ngồi cùng đội, đưa quyết định ra thảo luận, nhận phản hồi và sẵn sàng điều chỉnh.

</details>

**4. Làm sao đảm bảo các đội tuân thủ quyết định kiến trúc?**

<details className="qa">
<summary>Xem đáp án</summary>

Kết hợp con người và tự động hoá: giải thích lý do (đội hiểu "tại sao" thì tự nguyện làm theo), ghi ADR, review thiết kế ở những điểm then chốt, và viết **fitness function**, tức các kiểm tra tự động như test kiến trúc bằng ArchUnit, rule lint chặn import chéo module, kiểm tra phụ thuộc trong CI.

</details>

**5. Kiến trúc sư cần chiều sâu hay chiều rộng kỹ thuật?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai, nhưng ưu tiên chiều rộng. Kiến trúc sư cần biết nhiều lựa chọn tồn tại và điểm mạnh yếu của chúng để so sánh, đồng thời giữ chiều sâu ở một vài mảng để đánh giá đúng độ khó và đáng tin với đội. Chuyển từ developer lên architect là chấp nhận đánh đổi một phần chiều sâu lấy chiều rộng.

</details>

---

## 3. Các cấp độ kiến trúc

Bài học: [3. Các cấp độ kiến trúc](../../software-architect/01-basics/3_cac-cap-do-kien-truc.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt application, solution và enterprise architecture.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Application:** cấu trúc bên trong một ứng dụng (layer, module, pattern, công nghệ), gần code nhất.
- **Solution:** thiết kế một giải pháp cho một nhu cầu kinh doanh, ghép nhiều hệ thống mới và cũ, tập trung vào tích hợp, yêu cầu phi chức năng, chi phí.
- **Enterprise:** toàn tổ chức, năng lực kinh doanh, danh mục ứng dụng, chuẩn công nghệ và lộ trình nhiều năm.

Cấp trên đặt ràng buộc cho cấp dưới, cấp dưới phản hồi thực tế lên cấp trên.

</details>

**2. Solution architect thường tạo ra những sản phẩm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Solution design document (bối cảnh, yêu cầu, phương án, lựa chọn, rủi ro), sơ đồ tích hợp và luồng dữ liệu, sequence diagram cho luồng chính, danh sách yêu cầu phi chức năng và cách đáp ứng, ước lượng chi phí và công sức, đôi khi là phân tích mua hay tự xây.

</details>

**3. TOGAF là gì? Bốn miền kiến trúc trong TOGAF là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

TOGAF là khung enterprise architecture của The Open Group, có phương pháp ADM là một vòng lặp phát triển kiến trúc. Bốn miền: business, data, application và technology architecture.

</details>

**4. Ở công ty nhỏ không có enterprise architect thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Các câu hỏi của cấp enterprise vẫn tồn tại (chuẩn công nghệ, nguồn gốc dữ liệu, chọn mua hay xây), chỉ là do CTO hoặc kiến trúc sư/tech lead cấp cao đảm nhận. Điều quan trọng là nhận ra mình đang quyết ở cấp nào để chọn mức chi tiết, thời gian cân nhắc và người cần tham gia phù hợp.

</details>

**5. Một đội muốn dùng công nghệ khác chuẩn chung của công ty. Bạn xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không cấm ngay cũng không cho lách. Hỏi lý do và yêu cầu cụ thể mà chuẩn hiện tại không đáp ứng, đánh giá chi phí lâu dài (vận hành, tuyển người, bảo mật, tích hợp), rồi nâng lên đúng cấp quyết định. Nếu lý do chính đáng, có thể chấp nhận như ngoại lệ có ghi ADR, hoặc cập nhật chính chuẩn chung.

</details>
