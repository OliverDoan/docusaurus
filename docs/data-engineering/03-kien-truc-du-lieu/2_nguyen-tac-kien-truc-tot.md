---
sidebar_position: 2
title: "2. Chín nguyên tắc kiến trúc tốt"
---

# Chín nguyên tắc của kiến trúc dữ liệu tốt

Bài này trình bày "cái nhìn 10.000 foot" (từ trên cao) về kiến trúc tốt thông qua **9 nguyên tắc**. Đây là những ý tưởng chính giúp bạn đánh giá các quyết định và thực tiễn kiến trúc quan trọng. Chúng nối tiếp định nghĩa ở bài 1 và là "thước đo" dùng lại ở các bài sau.

**Tương tự đơn giản:** chín nguyên tắc giống bộ quy tắc xây nhà trong khu dân cư lớn: dùng chung hạ tầng điện nước (thành phần chung), có lối thoát hiểm (lập kế hoạch cho thất bại), nhà xây theo kiểu có thể mở rộng thêm tầng, người quy hoạch phải dẫn dắt cư dân, khoá cửa cẩn thận (bảo mật) và theo dõi hoá đơn điện nước (FinOps).

---

:::note[Ghi nhớ nhanh]

- ⭐ **Mọi thứ đều có thể hỏng** (Werner Vogels): thiết kế với availability, reliability, **RTO** và **RPO** làm kim chỉ nam.
- ⭐ **Liên kết lỏng lẻo + quyết định đảo ngược được** là cặp bài trùng giữ kiến trúc linh hoạt.
- **Thành phần chung** (object storage, version control, observability, orchestration...) giúp các nhóm cộng tác, nhưng đừng ép "một cỡ cho tất cả".
- **Mở rộng được** nghĩa là cả scale up lẫn scale down (có thể về 0), không phải cứ phức tạp là tốt.
- **Bảo mật:** zero-trust thay cho "vành đai cứng"; mô hình chia sẻ trách nhiệm; kỹ sư dữ liệu là kỹ sư bảo mật.
- **FinOps:** chi phí đám mây là biến động, cần giám sát liên tục như giám sát hệ thống.

:::

---

## Mục lục

- Hai khung tham chiếu: AWS và Google Cloud
- Nguyên tắc 1: Chọn thành phần chung một cách khôn ngoan
- Nguyên tắc 2: Lập kế hoạch cho thất bại
- Nguyên tắc 3: Kiến trúc cho khả năng mở rộng
- Nguyên tắc 4: Kiến trúc là sự lãnh đạo
- Nguyên tắc 5: Luôn là kiến trúc sư
- Nguyên tắc 6: Xây dựng hệ thống liên kết lỏng lẻo
- Nguyên tắc 7: Đưa ra quyết định có thể đảo ngược
- Nguyên tắc 8: Ưu tiên bảo mật
- Nguyên tắc 9: Áp dụng FinOps
- Tóm tắt

## Hai khung tham chiếu: AWS và Google Cloud

Các tác giả lấy cảm hứng từ hai nguồn:

| **AWS Well-Architected Framework** (6 trụ cột) | **Google Cloud: 5 nguyên tắc kiến trúc Cloud-Native** |
|---|---|
| Operational excellence (hoạt động xuất sắc) | Thiết kế cho tự động hoá |
| Security (bảo mật) | Cẩn trọng với trạng thái (state) |
| Reliability (độ tin cậy) | Ưu tiên dịch vụ được quản lý (managed services) |
| Performance efficiency (hiệu quả hiệu năng) | Thực hành phòng thủ theo chiều sâu |
| Cost optimization (tối ưu chi phí) | Luôn là kiến trúc sư |
| Sustainability (tính bền vững) | |

Sách khuyên đọc kỹ cả hai, chọn ý hay và xác định chỗ bạn không đồng ý, rồi mở rộng thành **9 nguyên tắc cho kiến trúc kỹ thuật dữ liệu**:

1. Chọn thành phần chung một cách khôn ngoan.
2. Lập kế hoạch cho thất bại.
3. Thiết kế kiến trúc có khả năng mở rộng.
4. Kiến trúc là sự lãnh đạo.
5. Luôn tiếp tục thiết kế và cải tiến kiến trúc.
6. Xây dựng hệ thống liên kết lỏng lẻo.
7. Đưa ra quyết định có thể đảo ngược.
8. Ưu tiên bảo mật.
9. Áp dụng FinOps.

## Nguyên tắc 1: Chọn thành phần chung một cách khôn ngoan

Một trong những việc chính của kỹ sư dữ liệu là chọn **thành phần và phương pháp chung (common components)** dùng rộng rãi trong toàn tổ chức. Khi chọn tốt và dẫn dắt hiệu quả, chúng trở thành "kết cấu" tạo điều kiện cho các nhóm cộng tác và phá bỏ rào cản.

- **Ví dụ thành phần chung:** object storage (lưu trữ đối tượng), hệ thống kiểm soát phiên bản (version control), observability (khả năng quan sát), hệ thống giám sát, orchestration và công cụ xử lý.
- Mọi người nên truy cập được các thành phần này với use case phù hợp, và được khuyến khích dùng lại thay vì "phát minh lại bánh xe".
- Chúng phải hỗ trợ **quyền hạn và bảo mật mạnh** để chia sẻ tài sản giữa các nhóm mà vẫn chặn truy cập trái phép.
- Nền tảng đám mây là nơi lý tưởng cho thành phần chung. Ví dụ: **tách tính toán khỏi lưu trữ** (separation of compute and storage) cho phép nhiều công cụ chuyên dụng cùng truy cập một lớp lưu trữ chung (thường là object storage).

Đây là một **hành động cân bằng**: một mặt chọn thành phần có ích cho mọi dự án và thúc đẩy tương tác; mặt khác tránh ép mọi nhóm vào giải pháp "một cỡ cho tất cả" làm giảm năng suất của kỹ sư giải quyết bài toán chuyên biệt. (Chương 4 bàn thêm.)

## Nguyên tắc 2: Lập kế hoạch cho thất bại

> "Mọi thứ đều thất bại, mọi lúc." (Werner Vogels, CTO của AWS)

Phần cứng hiện đại bền bỉ, nhưng bất kỳ thành phần nào cũng sẽ hỏng nếu đủ thời gian. Để xây hệ thống bền, phải đưa lỗi vào thiết kế. Bốn thuật ngữ then chốt:

| Thuật ngữ | Nghĩa | Ghi chú |
|---|---|---|
| **Availability** (tính sẵn sàng) | Phần trăm thời gian một dịch vụ hoặc thành phần IT ở trạng thái hoạt động được | Ví dụ "99,9% uptime" |
| **Reliability** (độ tin cậy) | Xác suất hệ thống đáp ứng tiêu chuẩn đã định khi thực hiện chức năng trong một khoảng thời gian xác định | |
| **RTO** (Recovery Time Objective, mục tiêu thời gian phục hồi) | Thời gian ngừng hoạt động tối đa chấp nhận được | Hệ thống báo cáo nội bộ có thể chịu RTO 1 ngày; website bán lẻ trực tuyến sập 5 phút đã gây thiệt hại đáng kể |
| **RPO** (Recovery Point Objective, mục tiêu điểm phục hồi) | Mức mất dữ liệu tối đa chấp nhận được sau khi phục hồi | Khi sự cố xảy ra, dữ liệu thường bị mất ở mức nào đó |

RTO thường được đặt bằng cách xác định **tác động kinh doanh** của việc ngừng hoạt động. Bốn đại lượng này dẫn dắt các quyết định kiến trúc khi đánh giá các kịch bản thất bại.

*Ví dụ minh hoạ (do người ghi chép thêm):* pipeline nạp dữ liệu bán hàng chạy mỗi giờ. Nếu RPO là 1 giờ, mất tối đa 1 giờ dữ liệu là chấp nhận được, nên sao lưu mỗi giờ là đủ. Nếu RPO là 0 (không được mất giao dịch nào), bạn cần cơ chế sao chép liên tục.

## Nguyên tắc 3: Kiến trúc cho khả năng mở rộng

Khả năng mở rộng (scalability) trong hệ thống dữ liệu gồm **hai chiều**:

1. **Scale up (mở rộng):** xử lý lượng dữ liệu lớn, ví dụ tạo cụm lớn huấn luyện mô hình trên hàng petabyte dữ liệu khách hàng, hoặc mở rộng hệ thống streaming để chịu tải tăng đột biến.
2. **Scale down (thu nhỏ):** sau khi tải giảm, tự động bỏ bớt công suất để cắt giảm chi phí (liên quan nguyên tắc 9).

Hệ thống có thể mở rộng **linh hoạt theo tải**, lý tưởng là tự động, gọi là **elastic** (đàn hồi). Một số hệ thống còn **scale to zero**: tắt hoàn toàn khi không dùng. Ví dụ: cụm huấn luyện xoá sau khi xong việc; nhiều hệ thống serverless (serverless functions, serverless OLAP database) tự scale về 0.

**Cảnh báo:** áp dụng chiến lược mở rộng không phù hợp sẽ dẫn đến hệ thống quá phức tạp và đắt đỏ. Một cơ sở dữ liệu quan hệ đơn giản với một nút failover (chuyển đổi dự phòng) có thể là đủ cho một ứng dụng, thay vì cụm phức tạp. Hãy **đo tải hiện tại, các đỉnh tải, ước tính tải vài năm tới** để quyết định. Nếu startup tăng trưởng nhanh hơn dự kiến, thì cũng sẽ có thêm nguồn lực để tái cấu trúc.

## Nguyên tắc 4: Kiến trúc là sự lãnh đạo

Kiến trúc sư dữ liệu chịu trách nhiệm về các quyết định công nghệ và mô tả kiến trúc, đồng thời **truyền bá** các lựa chọn đó thông qua lãnh đạo và đào tạo. Họ phải rất giỏi kỹ thuật nhưng giao hầu hết công việc đóng góp cá nhân cho người khác. Năng lực lãnh đạo mạnh kết hợp chuyên môn kỹ thuật cao là rất hiếm và vô cùng quý giá.

Lãnh đạo **không có nghĩa** là chỉ huy và kiểm soát. Ngày xưa kiến trúc sư thường chọn một công nghệ cơ sở dữ liệu độc quyền rồi bắt mọi nhóm lưu dữ liệu ở đó; sách phản đối cách này vì nó cản trở các dự án dữ liệu hiện có. Môi trường đám mây cho phép cân bằng giữa thành phần chung và tính linh hoạt để đổi mới.

Martin Fowler mô tả nguyên mẫu **Architectus Oryzus** (kiến trúc sư lý tưởng): hoạt động quan trọng nhất là **cố vấn cho nhóm phát triển, nâng trình độ họ** để họ xử lý được vấn đề phức tạp hơn. Điều đó tạo "đòn bẩy" lớn hơn nhiều so với việc làm người ra quyết định duy nhất, vốn dễ biến kiến trúc sư thành **nút cổ chai**.

Kiến trúc sư dữ liệu lý tưởng: có kỹ năng kỹ thuật của kỹ sư dữ liệu nhưng không còn làm kỹ thuật hằng ngày; cố vấn cho kỹ sư; chọn công nghệ cẩn thận sau khi tham vấn tổ chức; đào tạo thực hành tốt nhất; tập hợp nguồn lực kỹ thuật hướng tới mục tiêu chung. Là kỹ sư dữ liệu, bạn nên thực hành lãnh đạo kiến trúc và tìm mentor; cuối cùng bạn có thể tự làm kiến trúc sư.

## Nguyên tắc 5: Luôn là kiến trúc sư

Mượn trực tiếp từ Google Cloud. Kiến trúc sư không chỉ giữ nguyên hiện trạng mà **liên tục thiết kế cái mới** để đáp ứng thay đổi của kinh doanh và công nghệ. Theo EABOK, công việc là:

1. Hiểu sâu **kiến trúc cơ sở** (baseline, trạng thái hiện tại).
2. Phát triển **kiến trúc mục tiêu** (target).
3. Lập **kế hoạch trình tự (sequencing plan)** để xác định ưu tiên và thứ tự thay đổi.

Sách bổ sung: kiến trúc hiện đại không nên theo kiểu mệnh lệnh-kiểm soát hay thác nước, mà phải **cộng tác và linh hoạt**. Kiến trúc mục tiêu là "mục tiêu di động", được điều chỉnh theo thay đổi trong và ngoài tổ chức; kế hoạch trình tự xác định các ưu tiên giao hàng trước mắt.

## Nguyên tắc 6: Xây dựng hệ thống liên kết lỏng lẻo

> Khi kiến trúc được thiết kế để các nhóm có thể kiểm thử, triển khai và thay đổi hệ thống mà không phụ thuộc nhóm khác, họ cần ít giao tiếp hơn để hoàn thành việc. Nói cách khác, cả kiến trúc lẫn các nhóm đều liên kết lỏng lẻo. (Google DevOps tech architecture guide)

### Bezos API Mandate (2002)

Năm 2002, Bezos gửi email cho nhân viên Amazon, sau này gọi là **Bezos API Mandate**, đại ý:

1. Mọi nhóm phải công bố dữ liệu và chức năng qua **giao diện dịch vụ** (service interface).
2. Các nhóm chỉ giao tiếp với nhau qua các giao diện đó.
3. **Không** cho phép hình thức giao tiếp nào khác: không liên kết trực tiếp, không đọc thẳng kho dữ liệu của nhóm khác, không bộ nhớ dùng chung, không cửa hậu. Chỉ gọi giao diện dịch vụ qua mạng.
4. Dùng công nghệ gì cũng được (HTTP, Corba, Pubsub, giao thức tuỳ chỉnh).
5. Mọi giao diện dịch vụ, không ngoại lệ, phải được thiết kế từ đầu **để có thể mở ra cho nhà phát triển bên ngoài**.

Quy định này được coi là bước ngoặt: đặt dữ liệu và dịch vụ sau các API tạo ra liên kết lỏng lẻo và cuối cùng sinh ra AWS. Google cũng nhờ theo đuổi liên kết lỏng mà mở rộng hệ thống lên quy mô phi thường.

### Đặc tính hệ thống liên kết lỏng (về kỹ thuật)

1. Hệ thống chia thành nhiều **thành phần nhỏ**.
2. Giao tiếp qua **lớp trừu tượng** như message bus hoặc API; lớp này che giấu chi tiết nội bộ (backend cơ sở dữ liệu, lời gọi phương thức nội bộ).
3. Do (2), thay đổi bên trong một thành phần **không đòi hỏi** thay đổi ở nơi khác; mỗi phần tiến hoá riêng biệt.
4. Do (3), **không có chu kỳ phát hành toàn hệ thống kiểu thác nước**; mỗi thành phần cập nhật khi sẵn sàng.

### Đặc tính tổ chức tương ứng

1. Nhiều nhóm nhỏ thiết kế một hệ thống lớn; mỗi nhóm lo thiết kế, bảo trì, cải tiến một số thành phần.
2. Nhóm công bố chi tiết trừu tượng (định nghĩa API, schema thông báo) cho nhóm khác, không cần quan tâm nội bộ của nhau.
3. Mỗi nhóm cải tiến thành phần của mình độc lập, nhanh chóng.
4. Có thể phát hành cập nhật với thời gian ngừng hoạt động tối thiểu, phát hành liên tục trong giờ làm việc.

Liên kết lỏng cả ở hệ thống kỹ thuật lẫn hệ thống con người giúp nhóm kỹ thuật dữ liệu cộng tác hiệu quả hơn, và trực tiếp tạo điều kiện cho nguyên tắc 7.

## Nguyên tắc 7: Đưa ra quyết định có thể đảo ngược

Bối cảnh dữ liệu thay đổi nhanh: công nghệ "hot" hôm nay là thứ bị nghĩ lại vào ngày mai. Hãy nhắm tới quyết định đảo ngược được vì chúng **đơn giản hoá kiến trúc và giữ nó linh hoạt**.

Martin Fowler (2003): *"Một trong những nhiệm vụ quan trọng nhất của kiến trúc sư là loại bỏ kiến trúc bằng cách tìm cách loại bỏ tính không thể đảo ngược trong thiết kế phần mềm."* Điều này hôm nay vẫn đúng.

Bezos gọi quyết định Loại 1 là cửa một chiều ("bước qua mà không thích thì không quay lại được"), còn phần lớn quyết định là cửa hai chiều. **Hãy nhắm tới cửa hai chiều bất cứ khi nào có thể.**

Với tốc độ thay đổi và việc tách/mô-đun hoá công nghệ, hãy chọn giải pháp tốt nhất cho **ngày hôm nay**, đồng thời sẵn sàng nâng cấp hoặc áp dụng thực hành tốt hơn khi bối cảnh đổi thay.

## Nguyên tắc 8: Ưu tiên bảo mật

Mọi kỹ sư dữ liệu phải chịu trách nhiệm về bảo mật của hệ thống họ xây và duy trì. Sách tập trung vào hai ý: **zero-trust security** và **mô hình chia sẻ trách nhiệm**; cả hai khớp với kiến trúc cloud-native.

### Vành đai cứng và zero-trust

**Mô hình vành đai cứng (hardened-perimeter):** coi mạng nội bộ là "đáng tin" và bên ngoài là "không đáng tin". Cách này luôn dễ bị tấn công từ bên trong (insider) lẫn từ bên ngoài như phishing.

Ví dụ trong sách: phim *Mission Impossible* (1996). CIA cất dữ liệu cực nhạy cảm trong phòng an ninh vật lý nghiêm ngặt, nhưng Ethan Hunt lợi dụng yếu tố **con người** để vào được phòng, rồi lấy dữ liệu khá dễ dàng. Nhân viên làm việc trong mạng bảo mật cao vẫn kết nối ra thế giới qua email và thiết bị di động nên mối đe dọa bên ngoài thành mối đe dọa nội bộ.

Trên đám mây, vành đai cứng ngày càng mòn: mọi tài sản đều kết nối với thế giới bên ngoài ở mức độ nào đó. Dù có thể định nghĩa mạng riêng ảo (VPC) không kết nối ngoài, **control-plane API** mà kỹ sư dùng để định nghĩa mạng đó vẫn hướng ra internet. Vì vậy cần **zero-trust**: không mặc định tin bất kỳ ai/thứ gì chỉ vì "đang ở trong mạng".

### Mô hình chia sẻ trách nhiệm (shared responsibility)

Amazon chia bảo mật thành:

- **Bảo mật *của* đám mây** (security *of* the cloud): trách nhiệm của AWS, bảo vệ hạ tầng chạy các dịch vụ.
- **Bảo mật *trên* đám mây** (security *in* the cloud): trách nhiệm của người dùng, tuỳ dịch vụ họ dùng, cùng với độ nhạy cảm của dữ liệu, yêu cầu của tổ chức, luật và quy định.

Các nhà cung cấp đám mây nhìn chung đều theo dạng này: họ đảm bảo dịch vụ theo thông số công bố, nhưng **thiết kế mô hình bảo mật cho ứng dụng và dữ liệu là trách nhiệm cuối cùng của người dùng**.

### Kỹ sư dữ liệu là kỹ sư bảo mật

Trong doanh nghiệp truyền thống, nhóm bảo mật và mạng quản lý vành đai theo kiểu chỉ huy. Đám mây đẩy trách nhiệm này sang những kỹ sư không giữ vai trò bảo mật chính thức, cộng với sự mòn đi của vành đai cứng, nên **mọi kỹ sư dữ liệu nên coi mình là kỹ sư bảo mật**. Không nhận trách nhiệm này có thể dẫn đến hậu quả nghiêm trọng: nhiều vụ rò rỉ dữ liệu bắt nguồn từ lỗi đơn giản là cấu hình bucket Amazon S3 ở chế độ truy cập công khai.

## Nguyên tắc 9: Áp dụng FinOps

**FinOps** (Cloud Financial Operations) là một nguyên tắc quản lý tài chính đám mây và thực hành văn hoá đang phát triển, cho phép các nhóm kỹ thuật, tài chính, công nghệ và kinh doanh cộng tác để **ra quyết định chi tiêu dựa trên dữ liệu**, đạt giá trị kinh doanh tối đa (theo FinOps Foundation). Sách *Cloud FinOps* mô tả đó là mối quan hệ hợp tác giữa DevOps và Finance, quản lý chi tiêu hạ tầng một cách lặp lại, dựa trên dữ liệu.

### Cấu trúc chi phí đã thay đổi

| | Tại chỗ (on-premises) | Đám mây |
|---|---|---|
| Cách mua | Chi phí vốn (CapEx), mua hệ thống mới vài năm một lần | Trả tiền theo mức dùng (pay as you go) |
| Rủi ro | Mua quá nhiều thì lãng phí; mua quá ít thì cản trở dự án và tốn thời gian theo dõi tải | Chi tiêu biến động, dễ vượt ngân sách nếu không kiểm soát |
| Mô hình tính phí | Cố định | Chi phí cho mỗi truy vấn, cho mỗi công suất xử lý, hoặc biến thể khác |
| Thách thức mới | Dự báo dung lượng | Quản lý ngân sách, ưu tiên và hiệu quả |

Có thể scale lên để đạt hiệu năng cao rồi scale xuống để tiết kiệm. Nhưng chi tiêu trở nên **năng động hơn nhiều**.

### Tư duy mới cho kỹ sư

Trước đây kỹ sư nghĩ về *performance engineering*: tối đa hoá hiệu năng trên một nhóm tài nguyên cố định. Với FinOps, họ phải nghĩ về **cấu trúc chi phí của hệ thống đám mây**. Các câu hỏi trong sách:

- Tỷ lệ phù hợp của các instance AWS Spot khi chạy cụm phân tán là bao nhiêu?
- Cách tiếp cận nào hiệu quả nhất về chi phí và hiệu năng cho một job lớn chạy hằng ngày?
- Khi nào nên chuyển từ mô hình trả tiền theo truy vấn sang **công suất dự trữ** (reserved capacity)?

### Giám sát và rủi ro "tấn công chi phí"

- FinOps mở rộng mô hình giám sát vận hành sang **giám sát chi tiêu liên tục**: ví dụ chi phí liên tục của các function serverless xử lý lưu lượng, kèm **cảnh báo** khi chi tiêu tăng đột biến.
- Giống hệ thống được thiết kế để "hỏng một cách êm" khi quá tải, công ty có thể đặt **giới hạn cứng** cho chi tiêu.
- Ngoài ra còn có **tấn công chi phí**, tương tự DDoS: nhiều công ty phát hiện việc tải xuống quá mức từ một S3 bucket có thể làm chi phí tăng vọt, đe doạ cả startup nhỏ. Khi chia sẻ dữ liệu công khai, có thể đặt chính sách **người yêu cầu trả tiền** (requester pays) hoặc giám sát mức chi tiêu truy cập và nhanh chóng thu hồi quyền nếu vượt ngưỡng.

FinOps là phương pháp mới được chính thức hoá (FinOps Foundation bắt đầu năm 2019). Sách khuyên nghĩ về FinOps sớm, trước khi gặp hoá đơn đám mây quá lớn, và khuyến khích kỹ sư dữ liệu tham gia xây dựng thực hành FinOps cho kỹ thuật dữ liệu, một lĩnh vực còn nhiều "lãnh thổ chưa vạch bản đồ".

## Tóm tắt

| # | Nguyên tắc | Ý chốt |
|---|---|---|
| 1 | Chọn thành phần chung | Dùng chung object storage, orchestration, observability...; đừng ép một cỡ cho tất cả |
| 2 | Lập kế hoạch cho thất bại | Availability, reliability, RTO, RPO |
| 3 | Mở rộng được | Scale up và scale down, elastic, có thể về 0; tránh phức tạp thừa |
| 4 | Kiến trúc là lãnh đạo | Cố vấn, nâng trình độ nhóm, tránh làm nút cổ chai |
| 5 | Luôn là kiến trúc sư | Baseline, kiến trúc mục tiêu "di động", kế hoạch trình tự |
| 6 | Liên kết lỏng | Giao tiếp qua API/message; nhóm độc lập (Bezos API Mandate) |
| 7 | Quyết định đảo ngược được | Ưu tiên cửa hai chiều |
| 8 | Ưu tiên bảo mật | Zero-trust, chia sẻ trách nhiệm, kỹ sư dữ liệu là kỹ sư bảo mật |
| 9 | FinOps | Chi tiêu đám mây biến động; giám sát và kiểm soát liên tục |
