---
sidebar_position: 1
title: "1. Những cân nhắc chung khi cung cấp dữ liệu"
---

# Những cân nhắc chung khi cung cấp dữ liệu

Chương 9 nói về **giai đoạn cuối cùng của vòng đời kỹ thuật dữ liệu: serving data** (cung cấp/phân phát dữ liệu cho các trường hợp sử dụng ở phía sau). Có ba mảng chính: phân tích và BI, học máy (ML), và Reverse ETL. Bài này đi qua phần mở đầu chung: chuyện niềm tin, người dùng, sản phẩm dữ liệu, tự phục vụ, định nghĩa/logic dữ liệu và data mesh.

**Tương tự đơn giản:** Data pipeline giống một nhà bếp, còn serving là khâu bê món ra bàn. Món nấu ngon đến mấy mà khách không tin vệ sinh, hoặc ra trễ, hoặc không đúng món họ cần thì nhà hàng vẫn thất bại.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Niềm tin là tất cả** — mất niềm tin vào dữ liệu là "hồi chuông báo tử thầm lặng" của một dự án dữ liệu; kiếm thì lâu, mất thì dễ.
- ⭐ **Bắt đầu từ use case và người dùng, không phải từ công cụ** — luôn hỏi "dữ liệu này kích hoạt hành động gì, ai thực hiện, có tự động hoá được không?".
- **SLA / SLO** là cam kết giữa kỹ sư dữ liệu và người dùng; giao tiếp liên tục quan trọng ngang việc đạt chỉ tiêu.
- **Sản phẩm dữ liệu** tốt có vòng phản hồi tích cực và được nghĩ theo "công việc cần hoàn thành" (jobs to be done).
- **Tự phục vụ** (self-service) phần lớn vẫn là khát vọng; chỉ hợp với đúng nhóm đối tượng.
- **Định nghĩa dữ liệu và logic dữ liệu** phải được ghi chính thức (data catalog, semantic layer), không để thành "kiến thức truyền miệng".

:::

---

## Mục lục

- 1. Giai đoạn cuối và ba hướng phục vụ
- 2. Niềm tin
- 3. Use case là gì, người dùng là ai
- 4. Sản phẩm dữ liệu
- 5. Tự phục vụ hay không
- 6. Định nghĩa dữ liệu và logic dữ liệu
- 7. Data mesh
- Tóm tắt

## 1. Giai đoạn cuối và ba hướng phục vụ

Vòng đời kỹ thuật dữ liệu đi từ tạo ra, thu nạp, lưu trữ, biến đổi, và kết thúc ở **serving**. Có ba hướng chính:

| Hướng | Mục tiêu | Ghi chú |
|---|---|---|
| **Phân tích và BI** | Chuẩn bị dữ liệu cho phân tích thống kê, báo cáo, dashboard | Mảng truyền thống nhất, có từ trước cả CNTT và cơ sở dữ liệu |
| **Học máy (ML)** | Thu thập, biến đổi, cung cấp dữ liệu để huấn luyện mô hình | Làm việc cùng data scientist và ML engineer; không có dữ liệu chất lượng thì không có ML |
| **Reverse ETL** | Đẩy dữ liệu đã xử lý ngược về hệ thống nguồn | Ví dụ: thu dữ liệu từ nền tảng quảng cáo, chạy thống kê để tính giá thầu cho mỗi lượt click, rồi nạp ngược giá thầu vào nền tảng quảng cáo. Gắn chặt với BI và ML |

## 2. Niềm tin

Trước khi bàn kỹ thuật, điều đầu tiên và quan trọng nhất là **niềm tin** (trust). Mô hình dữ liệu đẹp nhất cũng vô nghĩa nếu người dùng cuối không tin dữ liệu phản ánh đúng hoạt động kinh doanh của họ. Mất niềm tin thường là cái chết thầm lặng của dự án dữ liệu, có khi dự án chỉ bị huỷ chính thức sau nhiều tháng hoặc nhiều năm. Một khi đã mất thì rất khó lấy lại, dẫn đến doanh nghiệp không khai thác hết tiềm năng, nhóm dữ liệu mất uy tín (thậm chí bị giải thể).

Hai phía của niềm tin:

1. **Tin vào chất lượng dữ liệu.** Dùng:
   - **Data validation** (xác thực dữ liệu): phân tích để chắc chắn dữ liệu thể hiện đúng thông tin tài chính, tương tác khách hàng, doanh số.
   - **Data observability** (khả năng quan sát dữ liệu): cái nhìn liên tục về dữ liệu và các pipeline.
   - Kiểm tra trực quan và xác nhận với các bên liên quan.
   - Các việc này phải áp dụng xuyên suốt vòng đời, không đợi tới cuối mới làm.
2. **Tin vào cam kết dịch vụ (SLA, SLO).** Khi người dùng đã dựa vào dữ liệu để chạy quy trình kinh doanh, họ đòi dữ liệu phải sẵn sàng và cập nhật đúng hạn. Dữ liệu chất lượng cao nhưng không có mặt đúng lúc ra quyết định thì giá trị rất thấp.

### SLA và SLO

- **SLA** (service-level agreement, thỏa thuận mức dịch vụ): hợp đồng giữa bạn và các bên liên quan, nói rõ họ được mong đợi gì từ sản phẩm dữ liệu. Ví dụ phát biểu SLA: "Dữ liệu sẽ sẵn sàng một cách đáng tin cậy và có chất lượng cao".
- **SLO** (service-level objective, mục tiêu mức dịch vụ): phần đo lường được của SLA. Ví dụ SLO: "Data pipeline đến dashboard hoặc quy trình ML của bạn có 99% thời gian hoạt động, và 95% dữ liệu không có lỗi".
- SLA và SLO có thể dưới dạng **data contract** (hợp đồng dữ liệu, xem Chương 5), chính thức hoặc không chính thức.
- Chỉ thống nhất SLA là chưa đủ. **Giao tiếp liên tục** là cốt lõi: bạn đã báo trước các vấn đề có thể ảnh hưởng SLA/SLO chưa? Quy trình khắc phục và cải thiện của bạn là gì?

Sách tóm gọn: *"Niềm tin là tất cả. Kiếm được thì lâu, mất thì dễ."*

## 3. Use case là gì, người dùng là ai

Serving là về dữ liệu "đang hoạt động". Để biết dùng dữ liệu thế nào là hiệu quả, cần trả lời hai câu: **use case là gì** và **người dùng là ai**.

- Use case vượt xa việc xem báo cáo, dashboard. Dữ liệu tốt nhất khi **dẫn tới hành động**: một giám đốc ra quyết định chiến lược từ báo cáo; người dùng app giao đồ ăn nhận phiếu giảm giá trong hai phút tới.
- Một dữ liệu thường phục vụ nhiều use case. Ví dụ: huấn luyện mô hình ML chấm điểm khách hàng tiềm năng (lead scoring) rồi đẩy kết quả vào CRM bằng reverse ETL.
- Khi tìm use case, luôn hỏi: **"Dữ liệu này sẽ kích hoạt hành động gì và ai sẽ thực hiện?"**, rồi hỏi tiếp **"Hành động này có thể tự động hoá không?"**.
- Ưu tiên use case có **ROI cao nhất** có thể. Kỹ sư dữ liệu hay say mê chi tiết kỹ thuật và bỏ quên câu hỏi mục đích; khi tập trung vào giá trị, vai trò của họ có giá trị hơn nhiều.

Câu hỏi nên tự hỏi khi bắt đầu dự án:

- Ai sẽ dùng dữ liệu và dùng như thế nào?
- Các bên liên quan mong đợi gì?
- Làm sao cộng tác với họ (data scientist, analyst, người dùng nghiệp vụ) để hiểu dữ liệu sẽ được dùng ra sao?

Hãy tiếp cận từ góc nhìn người dùng và use case, rồi **làm ngược lại** để tạo ra sản phẩm dữ liệu tốt.

## 4. Sản phẩm dữ liệu

Định nghĩa của D. J. Patil: sản phẩm dữ liệu là *"sản phẩm hỗ trợ mục tiêu cuối cùng thông qua việc sử dụng dữ liệu"*.

- Sản phẩm dữ liệu không được tạo ra trong chân không. Nó là "môn thể thao đối kháng" kết hợp sản phẩm, kinh doanh và công nghệ, nên cần các bên liên quan chủ chốt tham gia.
- Ở hầu hết công ty, kỹ sư dữ liệu chỉ cách người dùng cuối vài bước. Kỹ sư giỏi sẽ cố hiểu kết quả của người dùng trực tiếp (analyst, data scientist) hoặc khách hàng bên ngoài.
- Nên nghĩ theo **"jobs to be done"** (công việc cần hoàn thành): người dùng "thuê" sản phẩm để làm một việc. Phải biết động cơ họ thuê sản phẩm của bạn. Lỗi kinh điển là xây mà không hiểu yêu cầu và nhu cầu thật, tức là xây sản phẩm không ai muốn dùng.
- Sản phẩm dữ liệu tốt có **vòng phản hồi tích cực**: dùng càng nhiều thì sinh càng nhiều dữ liệu hữu ích, dùng để cải thiện sản phẩm. Rửa sạch và lặp lại.

Ba câu hỏi cần nhớ khi xây sản phẩm dữ liệu:

1. Người dùng hy vọng đạt được gì khi dùng nó? (Thường sản phẩm được tạo ra mà không hiểu rõ kết quả mong đợi.)
2. Phục vụ **người dùng nội bộ hay bên ngoài**? (Nhớ lại kỹ thuật dữ liệu hướng nội/hướng ngoại ở Chương 2; điều này ảnh hưởng cách cung cấp dữ liệu.)
3. Kết quả và **ROI** của sản phẩm là gì?

Không gì phá hỏng việc áp dụng một sản phẩm dữ liệu hơn là tiện ích không ai cần và mất niềm tin vào đầu ra. Hãy theo dõi mức độ tiếp nhận và sẵn sàng điều chỉnh.

## 5. Tự phục vụ hay không

**Self-service** (tự phục vụ): người dùng tự dựng báo cáo, phân tích, mô hình ML thay vì nhờ nhóm dữ liệu. Đây là mong muốn lâu năm, nhưng hiện nay **BI tự phục vụ và data science tự phục vụ phần lớn vẫn mang tính khát vọng**. Có công ty làm được, nhưng hiếm. Đa số bắt đầu hoành tráng rồi thất bại; kết quả là analyst/data scientist vẫn phải làm việc nặng: báo cáo ad hoc và bảo trì dashboard.

**Vì sao khó?** Liên quan đến việc hiểu người dùng cuối:

- **Giám đốc điều hành** thường chỉ cần dashboard định sẵn với số liệu rõ ràng, khả thi. Họ sẽ bỏ qua công cụ tự phục vụ; có thêm câu hỏi thì nhờ analyst điều tra sâu hơn.
- **Analyst** thường đã tự phục vụ bằng công cụ mạnh hơn như SQL; lớp BI tự phục vụ không giúp được nhiều.
- Tương tự với data science: ML tự phục vụ cho "citizen data scientist" (nhà khoa học dữ liệu công dân) là mục tiêu của các nhà cung cấp AutoML, nhưng việc áp dụng còn non trẻ vì cùng lý do.
- Ở hai thái cực đó, sản phẩm tự phục vụ là **công cụ sai cho công việc**.

**Cách làm cho thành công:**

- Xác định đúng đối tượng và "công việc" họ muốn làm. Đối tượng lý tưởng: nhóm lãnh đạo có nền tảng dữ liệu, muốn tự cắt/xẻ dữ liệu mà không phải rèn lại kỹ năng SQL; hoặc các lãnh đạo chịu đầu tư thời gian học kỹ năng dữ liệu.
- Xác định yêu cầu độ tươi của dữ liệu mới của họ.
- Dự đoán nhu cầu tăng: nhiều dữ liệu thường kéo theo nhiều câu hỏi, rồi cần thêm dữ liệu.
- Cân bằng giữa **tính linh hoạt** và **các rào bảo vệ** (guardrails) để người dùng tìm được giá trị mà không gây nhầm lẫn hay ra kết quả sai.

## 6. Định nghĩa dữ liệu và logic dữ liệu

Độ chính xác dữ liệu không chỉ là sao chép đúng giá trị từ hệ thống nguồn. Nó còn gồm **định nghĩa** và **logic** đúng, được đưa vào dữ liệu qua mọi giai đoạn: từ hệ thống nguồn, pipeline đến công cụ BI.

- **Data definition** (định nghĩa dữ liệu): ý nghĩa của dữ liệu theo cách cả tổ chức hiểu. Ví dụ "khách hàng" nghĩa chính xác là gì, giữa các phòng ban có thống nhất không. Khi định nghĩa đổi, phải ghi lại và phát cho mọi người dùng.
- **Data logic** (logic dữ liệu): công thức tính số liệu từ dữ liệu, ví dụ tổng doanh thu, customer lifetime value. Logic đúng phải mã hoá cả định nghĩa lẫn chi tiết tính toán.
  - Tính **tỷ lệ rời bỏ** (churn) cần định nghĩa: khách hàng là ai?
  - Tính **lợi nhuận ròng** cần bộ quy tắc: chi phí nào được trừ khỏi doanh thu?

**Vấn đề:** định nghĩa và logic thường được xem là hiển nhiên, truyền miệng như "kiến thức thể chế". Kiến thức kiểu này có đời sống riêng, và giai thoại thế chỗ cho hiểu biết dựa trên dữ liệu. Giải pháp: **khai báo chính thức** định nghĩa và logic, cả trong **data catalog** lẫn trong các hệ thống của vòng đời, để đảm bảo chính xác, nhất quán và tin cậy.

Định nghĩa dữ liệu được cung cấp theo hai kiểu: đôi khi **tường minh**, nhưng chủ yếu **ngầm định**. Ngầm định nghĩa là: khi bạn phát dữ liệu cho một truy vấn, dashboard hay mô hình ML, dữ liệu và số liệu dẫn xuất phải được trình bày nhất quán, chính xác. Khi viết một truy vấn SQL, bạn đang ngầm giả định đầu vào đúng, gồm cả định nghĩa và logic của các quy trình ngược dòng. Vì vậy **mô hình hoá dữ liệu** (Chương 8) rất hữu ích để nắm bắt định nghĩa và logic theo cách người dùng dễ hiểu.

Với **semantic layer** (lớp ngữ nghĩa) bạn hợp nhất định nghĩa và logic kinh doanh theo cách tái sử dụng: **viết một lần, dùng mọi nơi**. Đây là cách tiếp cận hướng đối tượng cho số liệu, tính toán và logic. Phần sau sẽ nói kỹ hơn (xem bài 2).

## 7. Data mesh

**Data mesh** (lưới dữ liệu, giới thiệu ở Chương 3) làm thay đổi căn bản cách serving. Thay vì một nhóm dữ liệu tập trung phục vụ khách hàng nội bộ, mỗi **nhóm domain** (miền) đảm nhận hai vai trò theo kiểu ngang hàng, phi tập trung:

1. **Cung cấp dữ liệu cho nhóm khác**: chuẩn bị dữ liệu sao cho dùng được trong ứng dụng dữ liệu, dashboard, phân tích, công cụ BI khắp tổ chức.
2. **Tự phục vụ**: mỗi nhóm tự chạy dashboard và phân tích của mình, dùng dữ liệu từ khắp tổ chức theo nhu cầu của domain. Dữ liệu từ nhóm khác cũng có thể đưa vào phần mềm do nhóm domain xây (embedded analytics hay tính năng ML).

Điều này thay đổi đáng kể chi tiết và cấu trúc của việc serving.

## Tóm tắt

| Chủ đề | Ý chính |
|---|---|
| Niềm tin | Yếu tố quan trọng nhất; xây bằng validation, observability, SLA/SLO và giao tiếp |
| Use case và người dùng | Bắt đầu từ đây; hỏi hành động nào được kích hoạt, ai làm, tự động hoá được không; ưu tiên ROI |
| Sản phẩm dữ liệu | Nghĩ theo jobs to be done, có vòng phản hồi, biết nội bộ hay bên ngoài, đo ROI |
| Self-service | Phần lớn là khát vọng; chọn đúng đối tượng, cân bằng linh hoạt và guardrails |
| Định nghĩa và logic | Ghi chính thức (catalog, semantic layer), viết một lần dùng mọi nơi |
| Data mesh | Mỗi domain vừa cung cấp vừa tự dùng dữ liệu |
