---
sidebar_position: 2
title: "2. Ingestion, Transformation và Serving"
---

# Thu nạp, chuyển đổi và cung cấp dữ liệu

Bài này đi qua ba giai đoạn còn lại của vòng đời: **Ingestion** (thu nạp dữ liệu từ nguồn), **Transformation** (biến đổi dữ liệu thành dạng hữu ích) và **Serving** (cung cấp dữ liệu để tạo giá trị). Đây là phần "dòng chảy" chính của dữ liệu, nơi dữ liệu thô dần trở thành sản phẩm có giá trị.

**Tương tự đơn giản:** ingestion là xe tải chở nguyên liệu về kho, transformation là xưởng sơ chế và nấu nướng, serving là quầy phục vụ đưa món ăn đến đúng người đang đói.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Nguồn và ingestion là nút thắt cổ chai quan trọng nhất** của vòng đời: nguồn ngoài tầm kiểm soát, ingestion có thể hỏng bí ẩn.
- ⭐ **Batch chỉ là cách xử lý stream theo khối lớn**. Đừng chọn streaming-first chỉ vì "hay"; chỉ dùng true real-time khi lợi ích kinh doanh đủ lớn so với chi phí.
- **Push vs pull** chỉ là ranh giới mờ: một pipeline thường vừa đẩy vừa kéo qua các chặng.
- **Transformation** là nơi dữ liệu bắt đầu tạo giá trị: ép kiểu, chuẩn hoá, mô hình hoá logic nghiệp vụ, featurization cho ML.
- **Serving** có ba hướng chính: analytics, ML, reverse ETL. Dữ liệu không được dùng thì chỉ là "dữ liệu chết".
- Nên xây nền tảng dữ liệu và analytics vững trước khi lao vào ML.

:::

---

## Mục lục

- 1. Ingestion
- 2. Transformation
- 3. Serving
- Tóm tắt

## 1. Ingestion (thu nạp dữ liệu)

Sau khi hiểu nguồn dữ liệu, đặc điểm hệ thống nguồn và cách lưu trữ, bạn cần **thu thập** dữ liệu. Theo kinh nghiệm của tác giả, **hệ thống nguồn và ingestion là những nút thắt cổ chai quan trọng nhất** của vòng đời:

- Hệ thống nguồn thường nằm ngoài tầm kiểm soát trực tiếp, có thể **ngẫu nhiên không phản hồi** hoặc cung cấp dữ liệu **chất lượng kém**.
- Dịch vụ ingestion của bạn có thể **ngừng hoạt động bí ẩn** vì nhiều lý do.
- Kết quả: luồng dữ liệu bị dừng hoặc không đủ dữ liệu để lưu trữ, xử lý, phân phối.

Nguồn và ingestion kém tin cậy sẽ có **tác động lan toả** khắp vòng đời.

### 1.1. Câu hỏi cần đặt ra khi thu nạp

- Trường hợp sử dụng của dữ liệu này là gì? Có thể **tái sử dụng** thay vì tạo nhiều bản của cùng một dataset không?
- Hệ thống sinh và thu nạp dữ liệu có **đáng tin cậy** không, và dữ liệu có sẵn khi cần không?
- **Đích đến** của dữ liệu sau ingestion là đâu?
- Cần truy cập dữ liệu với **tần suất** nào? Dữ liệu đến với **khối lượng** bao nhiêu?
- Dữ liệu ở **định dạng** gì? Lưu trữ và transformation phía sau có xử lý được không?
- Dữ liệu nguồn có ở trạng thái tốt để dùng ngay không? Nếu có thì kéo dài bao lâu và điều gì có thể làm nó mất khả năng sử dụng?
- Nếu dữ liệu đến từ nguồn **streaming**, có cần biến đổi trước khi tới đích không? Biến đổi **in-flight** (ngay trong luồng) có phù hợp không?

Đây chỉ là một phần; Chương 7 bàn kỹ hơn. Hai khái niệm lớn của ingestion là **batch vs streaming** và **push vs pull**.

### 1.2. Batch và streaming

Quan điểm của tác giả: **hầu như mọi dữ liệu về bản chất là streaming**. Dữ liệu gần như luôn được tạo và cập nhật liên tục ở nguồn. **Batch ingestion** chỉ là một cách chuyên biệt, tiện lợi để xử lý luồng đó theo **khối lớn**, ví dụ xử lý dữ liệu cả ngày trong một đợt.

| | Batch | Streaming |
|---|---|---|
| Cách thu nạp | Theo khoảng thời gian định trước hoặc khi đạt ngưỡng kích thước | Liên tục, gần thời gian thực |
| Độ trễ | Bị ràng buộc bởi cách chia batch (quyết định "cửa một chiều") | Dữ liệu tới downstream ngay sau khi tạo, ví dụ chưa tới 1 giây |
| Phổ biến | Rất phổ biến, nhất là cho analytics và ML | Ngày càng tăng nhờ tách rời lưu trữ và tính toán, và nền tảng event streaming |

"Real-time" (hoặc near real-time) nghĩa là dữ liệu có sẵn cho downstream **ngay sau** khi được tạo. Ngưỡng để được coi là real-time thay đổi theo lĩnh vực và yêu cầu.

Batch từng là mặc định lâu năm vì giới hạn của hệ thống cũ. Việc chọn cách nào phần lớn phụ thuộc vào **trường hợp sử dụng** và **kỳ vọng về tính kịp thời** của dữ liệu.

### 1.3. Có nên "streaming-first" không?

Streaming-first nghe hấp dẫn nhưng có nhiều đánh đổi. Các câu hỏi nên tự hỏi:

- Nếu thu nạp real-time, hệ thống lưu trữ downstream có **chịu nổi tốc độ** dữ liệu không?
- Có thật cần real-time **tính bằng mili giây**? Hay **micro-batch** (tích luỹ và nạp mỗi phút) là đủ?
- Lợi ích cụ thể của streaming là gì? Nhận dữ liệu real-time thì mình có hành động gì để cải thiện so với batch?
- Streaming-first có **tốn thời gian, tiền, bảo trì, downtime và chi phí cơ hội** hơn batch không?
- Hệ thống streaming có **đáng tin cậy và dự phòng** khi hạ tầng hỏng không?
- Công cụ nào phù hợp? **Managed service** (Amazon Kinesis, Google Cloud Pub/Sub, Google Cloud Dataflow) hay tự dựng Kafka, Flink, Spark, Pulsar? Nếu tự dựng thì ai vận hành, chi phí và đánh đổi ra sao?
- Với mô hình ML, có lợi gì từ **dự đoán online** và có thể **huấn luyện liên tục** không?
- Có đang lấy dữ liệu từ một **instance production** đang chạy không? Ingestion tác động gì lên hệ thống nguồn đó?

Kết luận của tác giả: streaming-first không phải lúc nào cũng đơn giản, vốn đi kèm **chi phí và độ phức tạp** thêm. Nhiều framework ingestion tốt hỗ trợ cả batch lẫn micro-batch. **Batch rất phù hợp** cho nhiều trường hợp phổ biến như huấn luyện mô hình và báo cáo hàng tuần. Chỉ nên dùng **true real-time streaming** sau khi đã xác định được trường hợp kinh doanh có lợi ích đủ để chấp nhận các đánh đổi.

### 1.4. Push và pull

- Mô hình **push** (đẩy): hệ thống nguồn **ghi dữ liệu ra đích** (database, object store, file system).
- Mô hình **pull** (kéo): dữ liệu được **lấy** từ hệ thống nguồn.

Ranh giới giữa hai mô hình khá **mờ**: dữ liệu thường vừa bị đẩy vừa bị kéo khi chạy qua các chặng khác nhau của pipeline.

Các ví dụ trong sách:

**ETL (kéo).** Trong quy trình **ETL** (Extract, Transform, Load) thường dùng cho ingestion kiểu batch, bước Extract cho thấy đây là mô hình kéo: hệ thống ingestion truy vấn snapshot bảng nguồn theo lịch cố định. (**ELT** là biến thể thứ tự khác; sách sẽ nói nhiều hơn.)

**CDC (đẩy hoặc kéo).** **CDC** (Change Data Capture) có nhiều cách:

1. **Trigger/thông báo**: mỗi khi một hàng đổi trong database nguồn thì phát thông báo, đẩy vào hàng đợi cho hệ thống ingestion nhận. Đây là kiểu **đẩy**.
2. **Binary log**: ghi lại mọi commit vào database; database đẩy ra log của nó, hệ thống ingestion **đọc log** mà không tương tác trực tiếp với database. Cách này thêm **rất ít hoặc không thêm tải** cho nguồn.
3. **CDC batch dựa trên timestamp** (kiểu kéo): hệ thống ingestion truy vấn database nguồn lấy các hàng đã đổi kể từ lần cập nhật trước.

Ví dụ SQL minh hoạ cho kiểu 3 (do người viết thêm):

```sql
-- Lấy các dòng thay đổi kể từ lần chạy trước (CDC dựa trên timestamp)
SELECT *
FROM customers
WHERE updated_at > :last_run_time;
```

**Streaming ingestion.** Dữ liệu **bỏ qua database backend** và được đẩy thẳng đến một endpoint, thường được đệm bởi nền tảng event streaming. Mẫu này hữu ích với các đàn cảm biến IoT: thay vì dựa vào database duy trì trạng thái hiện tại, mỗi lần đo được coi là một **sự kiện**. Mô hình này cũng ngày càng phổ biến trong ứng dụng phần mềm vì đơn giản hoá xử lý real-time, cho phép dev điều chỉnh message phục vụ phân tích downstream, và giúp đời kỹ sư dữ liệu dễ hơn nhiều.

## 2. Transformation (chuyển đổi)

Sau khi nhập và lưu, bạn cần làm gì đó với dữ liệu. **Transformation** là thay đổi dữ liệu từ dạng ban đầu thành dạng hữu ích cho các trường hợp sử dụng phía sau. Không có transformation phù hợp, dữ liệu sẽ "trì trệ", không dùng được cho báo cáo, phân tích hay ML. Đây thường là nơi dữ liệu **bắt đầu tạo giá trị** cho người dùng cuối.

Một số mức transformation:

- **Ngay sau ingestion** (cơ bản): ánh xạ dữ liệu về đúng kiểu (ví dụ chuỗi thành số và ngày), đưa bản ghi về định dạng chuẩn, loại bỏ bản ghi xấu.
- **Các bước sau**: chuyển đổi schema, áp dụng chuẩn hoá (normalization).
- **Cuối chuỗi**: tổng hợp (aggregation) quy mô lớn cho báo cáo, hoặc làm nổi bật đặc trưng (feature) cho quy trình ML.

### 2.1. Điều cần cân nhắc

- **Chi phí và ROI** của việc chuyển đổi là bao nhiêu? Giá trị kinh doanh liên quan là gì?
- Transformation có **đơn giản và tự cô lập** nhất có thể không?
- Nó hỗ trợ những **quy tắc kinh doanh** nào?

Bạn có thể chuyển đổi dữ liệu theo **batch** hoặc **streaming in-flight**. Batch transformation cực kỳ phổ biến, nhưng nhờ xử lý luồng ngày càng phổ biến và lượng dữ liệu streaming tăng, tác giả kỳ vọng streaming transformation sẽ tiếp tục tăng và có thể sớm thay hẳn batch trong một số lĩnh vực.

### 2.2. Transformation đan xen với giai đoạn khác

Về logic, transformation là một lĩnh vực riêng; về thực tế nó thường vướng với các giai đoạn khác. Dữ liệu thường được biến đổi **ngay ở hệ thống nguồn** hoặc **in-flight khi ingestion**. Ví dụ:

- Hệ thống nguồn thêm **event time** vào bản ghi trước khi chuyển đi ingestion.
- Một bản ghi trong luồng streaming được **làm giàu (enrich)** bằng thêm trường và phép tính trước khi vào data warehouse.

Chuẩn bị, sắp xếp và làm sạch dữ liệu đều là các nhiệm vụ mang tính biến đổi, tăng giá trị cho consumer dữ liệu cuối.

### 2.3. Logic nghiệp vụ và mô hình hoá dữ liệu

**Business logic** (logic nghiệp vụ) là động lực chính của transformation, thường thông qua **data modeling** (mô hình hoá dữ liệu). Dữ liệu biến logic kinh doanh thành các thành phần **tái sử dụng**. Ví dụ trong sách: một "lần bán" nghĩa là "ai đó mua 12 khung ảnh với giá 30 đô mỗi khung, tổng 360 đô".

Mô hình hoá giúp có bức tranh rõ ràng, cập nhật về các quy trình kinh doanh. Một cái nhìn thô về giao dịch bán lẻ có thể vô dụng nếu chưa áp **quy tắc kế toán** để CFO thấy tình hình tài chính. Hãy đảm bảo có **cách tiếp cận chuẩn** để triển khai logic nghiệp vụ trong transformation.

### 2.4. Featurization cho ML

**Featurization** (đặc trưng hoá) là trích xuất và nâng cao các đặc trưng hữu ích để huấn luyện mô hình ML. Nó có thể là "nghệ thuật đen tối", kết hợp **chuyên môn lĩnh vực** (đặc trưng nào có thể quan trọng để dự đoán) với **kinh nghiệm data science** sâu rộng. Điểm chính với sách: khi data scientist đã xác định cách featurize, **kỹ sư dữ liệu có thể tự động hoá** quy trình đó trong giai đoạn transformation của pipeline.

Transformation là chủ đề sâu; Chương 8 đi vào truy vấn, mô hình hoá và các phương pháp biến đổi.

## 3. Serving (cung cấp dữ liệu)

Đây là giai đoạn cuối. Dữ liệu đã được nhập, lưu trữ và chuyển thành cấu trúc mạch lạc; giờ là lúc **nhận giá trị từ dữ liệu**. "Giá trị" mang nghĩa khác nhau với từng người dùng.

Nguyên tắc then chốt: **dữ liệu chỉ có giá trị khi được dùng cho mục đích thực tế**. Dữ liệu không được dùng hay truy vấn thì chỉ là "trơ". **Data vanity project** (dự án dữ liệu phô trương, làm cho có) là rủi ro lớn với công ty:

- Thời **big data**, nhiều công ty gom những bộ dữ liệu khổng lồ vào data lake mà chưa bao giờ dùng.
- Thời **cloud** đang tạo ra làn sóng dự án phô trương mới trên data warehouse, object storage và công nghệ streaming mới nhất.

Dự án dữ liệu phải có **chủ đích** xuyên suốt vòng đời: mục đích kinh doanh cuối cùng của dữ liệu được thu thập, làm sạch và lưu giữ cẩn thận là gì?

Serving có lẽ là phần thú vị nhất, nơi "phép màu" xảy ra và ML engineer áp dụng kỹ thuật tiên tiến. Ba cách dùng phổ biến: **analytics**, **ML** và **reverse ETL**.

### 3.1. Analytics (phân tích)

Analytics là cốt lõi của hầu hết nỗ lực về dữ liệu: tạo báo cáo, dashboard, phân tích ad hoc. Ngày xưa analytics chủ yếu là **BI**, nay gồm cả **operational analytics** và **embedded analytics**.

**Business intelligence (BI).** Dùng dữ liệu đã thu thập để mô tả **trạng thái hiện tại và quá khứ** của doanh nghiệp. BI cần áp **logic nghiệp vụ** lên dữ liệu thô. Logic nghiệp vụ thường áp trong giai đoạn transformation, nhưng cách tiếp cận **logic khi đọc (logic-on-read)** đang ngày càng phổ biến: dữ liệu lưu ở dạng sạch nhưng khá thô, ít xử lý hậu kỳ; hệ thống BI giữ một **kho định nghĩa và logic nghiệp vụ**, dùng nó khi truy vấn warehouse để báo cáo khớp định nghĩa kinh doanh.

Khi công ty trưởng thành hơn về dữ liệu, họ chuyển từ analytics ad hoc sang **self-service analytics** (phân tích tự phục vụ), cho người dùng nghiệp vụ tự truy cập dữ liệu mà không cần IT can thiệp. Nó giả định dữ liệu đủ tốt để mọi người tự cắt, xem và rút insight ngay. Lý thuyết thì đơn giản, thực tế khó: **chất lượng dữ liệu kém, các silo tổ chức, và thiếu kỹ năng dữ liệu** thường cản trở việc dùng rộng rãi.

**Operational analytics.** Tập trung vào **chi tiết của hoạt động** hiện tại, thúc đẩy các hành động mà người xem báo cáo có thể làm ngay. Ví dụ: xem trực tiếp tồn kho, hoặc dashboard real-time về tình trạng website/ứng dụng. Dữ liệu được dùng real-time, trực tiếp từ nguồn hoặc từ stream. Insight khác BI truyền thống vì tập trung vào **hiện tại**, không nhất thiết liên quan xu hướng lịch sử.

**Embedded analytics.** Phân tích **hướng tới khách hàng**, cung cấp cho khách trên nền tảng SaaS. Nó có yêu cầu và độ phức tạp riêng:

| | BI nội bộ | Embedded analytics |
|---|---|---|
| Đối tượng | Hạn chế, trong công ty | Có thể hàng nghìn khách hàng trở lên |
| Kiểu xem | Một số view thống nhất | Mỗi khách chỉ được thấy **dữ liệu của mình** |
| Kiểm soát truy cập | Quan trọng nhưng không phức tạp, vài vai trò và cấp truy cập | Phức tạp và quan trọng hơn nhiều |
| Hậu quả sai sót | Có thể bị xem xét lại quy trình | Rò rỉ chéo khách hàng là vi phạm niềm tin nghiêm trọng, thu hút truyền thông, mất khách đáng kể |

Với embedded analytics, tỷ lệ yêu cầu báo cáo và gánh nặng lên hệ thống phân tích cũng tăng đáng kể. Cần giảm thiểu **blast radius** (bán kính ảnh hưởng) của rò rỉ dữ liệu và lỗ hổng, áp dụng bảo mật cấp dữ liệu hoặc **tenant-level** trong lưu trữ và bất cứ nơi nào có thể rò rỉ.

**Multitenancy** (đa khách thuê). Nhiều hệ thống lưu trữ và phân tích hỗ trợ multitenant theo nhiều cách. Kỹ sư dữ liệu có thể lưu dữ liệu nhiều khách trong các **bảng dùng chung** để có view thống nhất cho analytics nội bộ và ML, rồi trình bày ra ngoài cho từng khách qua **view logic** với bộ lọc và kiểm soát phù hợp. Việc của kỹ sư dữ liệu là hiểu rõ chi tiết multitenancy trong hệ thống mình triển khai để đảm bảo **bảo mật và cô lập dữ liệu tuyệt đối**.

Ví dụ minh hoạ (do người viết thêm) cho ý tưởng view logic theo tenant:

```sql
-- Bảng dùng chung chứa dữ liệu của nhiều khách hàng
CREATE VIEW orders_for_tenant_42 AS
SELECT order_id, amount, created_at
FROM orders
WHERE tenant_id = 42;
```

### 3.2. Machine learning

Sự xuất hiện của ML là một trong những cuộc cách mạng công nghệ thú vị nhất. Khi tổ chức đạt mức trưởng thành dữ liệu cao, họ có thể bắt đầu xác định các bài toán phù hợp với ML và tổ chức thực hành quanh nó.

Trách nhiệm của kỹ sư dữ liệu **chồng lấn đáng kể** giữa analytics và ML; ranh giới giữa data engineering, ML engineering và analytics engineering có thể mờ. Ví dụ, kỹ sư dữ liệu có thể cần hỗ trợ cụm **Spark** cho cả analytics lẫn huấn luyện ML, cung cấp hệ thống **orchestration** giữa các nhóm, và hỗ trợ hệ thống metadata, catalog theo dõi lịch sử và lineage. Việc vạch ra phạm vi trách nhiệm và cấu trúc báo cáo là một quyết định tổ chức quan trọng.

**Feature store** (kho đặc trưng) là công cụ mới kết hợp data engineering và ML engineering. Nó giảm gánh nặng vận hành cho ML engineer bằng cách: giữ **lịch sử và phiên bản** của feature, hỗ trợ **chia sẻ feature** giữa các nhóm, và cung cấp khả năng orchestration/vận hành cơ bản như backfill. Thực tế, kỹ sư dữ liệu là thành viên cốt lõi hỗ trợ feature store.

Kỹ sư dữ liệu có nên biết ML? Chắc chắn có ích. Dù ranh giới thế nào, họ nên có **kiến thức vận hành** về nhóm mình phục vụ: kỹ thuật ML cơ bản và yêu cầu xử lý dữ liệu liên quan, các trường hợp dùng mô hình trong công ty, và trách nhiệm của các nhóm phân tích. Điều này giúp giao tiếp hiệu quả và hợp tác tốt. Lý tưởng là cùng xây công cụ mà không nhóm nào tự làm được.

Câu hỏi cho serving hướng ML:

- Dữ liệu có đủ chất lượng để làm **feature engineering** đáng tin cậy không? Yêu cầu và đánh giá chất lượng nên phát triển cùng các nhóm dùng dữ liệu.
- Dữ liệu có **khám phá được** không? Data scientist và ML engineer có dễ tìm dữ liệu giá trị không?
- Ranh giới **kỹ thuật và tổ chức** giữa data engineering và ML engineering ở đâu? Câu hỏi tổ chức này có ý nghĩa kiến trúc quan trọng.
- Dataset có thể hiện đúng **sự thật nền (ground truth)** không? Có bị **thiên lệch (bias)** không công bằng không?

Lời khuyên của tác giả: các công ty thường **lao vào ML quá sớm**. Trước khi đầu tư nhiều vào ML, hãy xây nền tảng dữ liệu vững chắc, tức các hệ thống và kiến trúc tốt nhất xuyên suốt vòng đời data engineering và ML. Thường tốt hơn là **phát triển năng lực analytics trước khi sang ML**. Nhiều công ty đã tiêu tan giấc mơ ML vì làm mà thiếu nền tảng phù hợp.

### 3.3. Reverse ETL

**Reverse ETL** lấy dữ liệu **đã xử lý** ở đầu ra của vòng đời và **đưa ngược lại hệ thống nguồn**. Nó cho phép chạy phân tích, chấm điểm mô hình... rồi nạp kết quả vào hệ thống production hoặc nền tảng SaaS.

Từng có thời reverse ETL bị coi là anti-pattern, ít ai muốn nhắc tên. Thực tế dòng chảy này **có lợi và thường cần thiết**. Ví dụ trong sách: nhà phân tích marketing tính giá thầu trong Excel từ dữ liệu warehouse rồi tải lên Google Ads, thường hoàn toàn thủ công và thô sơ.

Hiện đã có vài nhà cung cấp xây sản phẩm quanh khái niệm này, như **Hightouch** và **Census**. Reverse ETL còn non trẻ nhưng tác giả nghi rằng nó sẽ tồn tại. Nó đặc biệt quan trọng khi doanh nghiệp phụ thuộc nhiều hơn vào SaaS và nền tảng bên ngoài, ví dụ đẩy số liệu từ warehouse sang **customer data platform** hoặc **CRM**; nền tảng quảng cáo là trường hợp thường nhật khác.

Một số kỹ sư cho rằng có thể loại bỏ reverse ETL bằng cách xử lý transformation ngay trong **event stream** rồi gửi sự kiện ngược về nguồn khi cần. Việc mô hình này được áp dụng rộng rãi trong doanh nghiệp lại là chuyện khác. Ý chính: dữ liệu đã chuyển đổi cần được **trả về hệ thống nguồn** theo cách nào đó, lý tưởng là với lineage chính xác và quy trình kinh doanh gắn với hệ thống nguồn.

## Tóm tắt

| Giai đoạn | Ý chính | Cạm bẫy / lời khuyên |
|---|---|---|
| Ingestion | Lấy dữ liệu từ nguồn vào hệ thống | Nút thắt cổ chai; cân nhắc batch vs streaming, push vs pull |
| Batch vs streaming | Mọi dữ liệu vốn là stream, batch là cách gom khối | Streaming-first tốn chi phí và độ phức tạp; chỉ dùng khi có lợi ích rõ |
| Push vs pull | ETL là kéo, CDC có thể đẩy hoặc kéo | Ranh giới mờ trong pipeline |
| Transformation | Từ thô sang hữu ích: ép kiểu, chuẩn hoá, logic nghiệp vụ, featurization | Giữ đơn giản, tự cô lập; đo ROI; đan xen với giai đoạn khác |
| Serving: analytics | BI, operational, embedded | Embedded cần bảo mật tenant rất chặt |
| Serving: ML | Feature store, hợp tác DE và ML | Đừng vội ML khi nền tảng và analytics chưa vững |
| Serving: reverse ETL | Đưa dữ liệu đã xử lý về hệ thống nguồn / SaaS | Thực hành còn non trẻ nhưng cần thiết |
