---
sidebar_position: 4
title: "4. Các trừu tượng lưu trữ: warehouse, lake, lakehouse"
---

# Các trừu tượng lưu trữ: warehouse, lake, lakehouse

Nếu bài 2 và 3 nói về hệ thống lưu trữ (block, file, object, HDFS...), bài này đi lên tầng cao nhất: các **storage abstraction** (trừu tượng lưu trữ) — các mẫu tổ chức và truy vấn dữ liệu xây trên những hệ thống đó. Đây là những thứ kỹ sư dữ liệu chọn khi thiết kế pipeline cho khoa học dữ liệu, phân tích và báo cáo: data warehouse, data lake, data lakehouse, data platform, và kiến trúc stream-to-batch.

**Tương tự đơn giản:** data warehouse như một thư viện đã phân loại, đóng gáy ngăn nắp; data lake như một kho chứa mọi thứ thô; lakehouse là kho chứa thô nhưng có thủ thư và hệ thống mục lục như thư viện.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Chọn trừu tượng dựa trên 4 câu hỏi:** mục đích/ca sử dụng, kiểu cập nhật (bulk, streaming insert, upsert), chi phí, và tách hay gộp compute với storage.
- ⭐ **Lakehouse = data lake + tính năng của warehouse** (schema, bảng, update/delete, lịch sử, rollback) trên object storage, với lợi thế **tương tác** nhờ định dạng file mở.
- Ranh giới giữa **cloud data warehouse** và **data lake** ngày càng mờ; tương lai có thể chỉ khác nhau về tên.
- **Data platform** là hệ sinh thái công cụ tích hợp chặt vào lớp lưu trữ lõi: tiện nhưng nguy cơ **vendor lock-in**.
- **Stream-to-batch**: dữ liệu streaming được ghi đồng thời cho consumer thời gian thực và consumer batch để lưu lâu dài.

:::

---

## Mục lục

- 1. Bốn câu hỏi khi chọn trừu tượng lưu trữ
- 2. Data warehouse
- 3. Data lake
- 4. Data lakehouse
- 5. Data platform
- 6. Kiến trúc stream-to-batch
- Tóm tắt

## 1. Bốn câu hỏi khi chọn trừu tượng lưu trữ

| Yếu tố | Câu hỏi cần trả lời |
|---|---|
| Mục đích và ca sử dụng | Lưu dữ liệu này để làm gì? |
| Kiểu cập nhật | Trừu tượng này tối ưu cho bulk update, streaming insert hay upsert? |
| Chi phí | Chi phí tài chính trực tiếp và gián tiếp? Thời gian ra giá trị (time to value)? Chi phí cơ hội? |
| Tách storage và compute | Xu hướng là tách, nhưng hầu hết hệ thống là lai giữa tách và gộp (mục "Hybrid separation and colocation" ở bài 5) |

Cần biết rằng việc tách storage khỏi compute ngày càng phổ biến làm ranh giới giữa **database OLAP** và **data lake** càng mờ. Các cloud data warehouse lớn và data lake đang "đâm vào nhau"; sau này khác biệt có thể chỉ còn trên danh nghĩa vì bên dưới chúng giống nhau cả về chức năng lẫn kỹ thuật.

## 2. Data warehouse

Data warehouse là kiến trúc dữ liệu **OLAP** tiêu chuẩn. Như ở Chương 3, thuật ngữ này chỉ: nền tảng công nghệ (như Google BigQuery, Teradata), kiến trúc tập trung hoá dữ liệu, và mẫu tổ chức trong công ty.

**Tiến hoá về lưu trữ:**

```mermaid
flowchart LR
  A["Trên database giao dịch thông thường"] --> B["MPP hướng hàng: Teradata, IBM Netezza"]
  B --> C["MPP hướng cột: Vertica, Teradata Columnar"]
  C --> D["Cloud data warehouse và data platform"]
```

Trong thực tế, cloud data warehouse thường dùng để tổ chức dữ liệu thành **data lake** — vùng lưu lượng lớn dữ liệu thô chưa xử lý, theo ý tưởng gốc của James Dixon. Chúng xử lý được lượng lớn văn bản thô và tài liệu JSON phức tạp. **Giới hạn:** không xử lý được dữ liệu thực sự phi cấu trúc như ảnh, video, âm thanh (khác data lake thực thụ). Có thể kết hợp cloud data warehouse với object storage để có giải pháp data lake hoàn chỉnh.

## 3. Data lake

Data lake ban đầu được hình dung là kho lớn giữ dữ liệu ở dạng **thô, chưa xử lý**. Ban đầu xây chủ yếu trên Hadoop, nơi lưu trữ rẻ cho phép giữ khối lượng khổng lồ mà không tốn chi phí cho hệ MPP độc quyền.

Năm năm gần đây (tính tại thời điểm viết sách) có hai chuyển biến lớn:

1. **Chuyển sang tách compute khỏi storage:** rời Hadoop, hướng tới cloud object storage để giữ dữ liệu dài hạn.
2. **Nhận ra giá trị của tính năng MPP:** các kỹ sư thấy nhiều chức năng của hệ MPP (quản lý schema; update, merge, delete) — vốn bị bỏ qua trong cơn sốt data lake — thực ra rất hữu ích. Điều này dẫn tới ý tưởng **lakehouse**.

## 4. Data lakehouse

**Data lakehouse** là kiến trúc kết hợp các khía cạnh của data warehouse và data lake. Thường hiểu là: lưu dữ liệu trên object storage như lake, nhưng bổ sung các tính năng giúp quản lý dữ liệu dễ hơn và trải nghiệm kỹ thuật giống warehouse:

- Hỗ trợ bảng và schema vững chắc.
- Quản lý cập nhật tăng dần (incremental update) và xoá.
- Thường có **lịch sử bảng và rollback**, thực hiện bằng cách giữ các phiên bản cũ của file và metadata.

Một hệ lakehouse là một **lớp quản lý metadata và file** triển khai cùng công cụ quản lý và biến đổi dữ liệu. **Databricks** quảng bá mạnh khái niệm này với **Delta Lake** (hệ quản lý lưu trữ mã nguồn mở). Đối thủ mới nổi: **Apache Hudi** và **Apache Iceberg** (chi tiết ở Phụ lục A).

**Lưu ý của tác giả:** kiến trúc lakehouse tương tự kiến trúc của nhiều nền tảng dữ liệu thương mại như **BigQuery** và **Snowflake**: lưu dữ liệu trên object storage, có quản lý metadata tự động, lịch sử bảng, update/delete, và ẩn hoàn toàn độ phức tạp quản lý file bên dưới khỏi người dùng.

**Ưu điểm then chốt so với công cụ độc quyền: khả năng tương tác (interoperability).** Trao đổi dữ liệu giữa các công cụ dễ hơn nhiều khi dữ liệu ở **định dạng file mở**. Phải reserialize từ định dạng database độc quyền tốn chi phí xử lý, thời gian và tiền. Trong lakehouse, nhiều công cụ cùng kết nối lớp metadata và đọc trực tiếp từ object storage.

**Cũng cần nhấn mạnh:** nhiều dữ liệu trong lakehouse có thể không bị áp cấu trúc bảng. Ta chỉ áp tính năng kiểu warehouse ở nơi cần, phần còn lại để thô hoặc phi cấu trúc.

Công nghệ lakehouse đang phát triển rất nhanh.

## 5. Data platform

Ngày càng nhiều nhà cung cấp gọi sản phẩm của mình là **data platform**: họ dựng hệ sinh thái công cụ có thể tương tác, tích hợp chặt vào lớp lưu trữ dữ liệu lõi.

- Khi đánh giá nền tảng, kỹ sư phải bảo đảm các công cụ cung cấp đáp ứng nhu cầu. Công cụ không có sẵn trong nền tảng vẫn kết nối được nhưng có thêm chi phí trao đổi dữ liệu.
- Nền tảng cũng nhấn mạnh tích hợp chặt với object storage cho ca dữ liệu phi cấu trúc (như đã nói với cloud data warehouse).
- Thành thật mà nói, khái niệm data platform **chưa thật sự hoàn chỉnh**. Nhưng cuộc đua đã bắt đầu để tạo ra "khu vườn có tường bao" (walled garden) gồm các công cụ dữ liệu: vừa đơn giản hoá công việc kỹ thuật dữ liệu vừa tạo **vendor lock-in** đáng kể.

## 6. Kiến trúc stream-to-batch

Kiến trúc lưu trữ **stream-to-batch** có nhiều điểm tương đồng với **kiến trúc Lambda** (có thể tranh cãi chi tiết kỹ thuật). Về cơ bản: dữ liệu chảy qua một topic trong hệ lưu trữ streaming được ghi ra cho **nhiều consumer**.

- Một số consumer là hệ xử lý thời gian thực, tạo thống kê trên luồng.
- Một consumer **batch storage** ghi dữ liệu cho lưu trữ lâu dài và truy vấn batch. Ví dụ AWS Kinesis Firehose có thể tạo object S3 theo trigger cấu hình được (thời gian, kích thước batch).
- Các hệ như BigQuery nhập dữ liệu streaming vào một **streaming buffer**, sau đó tự động reserialize thành object storage dạng cột. Query engine truy vấn liền mạch cả streaming buffer lẫn dữ liệu object, cho người dùng góc nhìn hiện hành, gần thời gian thực của bảng.

```mermaid
flowchart LR
  S["Topic streaming"] --> R["Consumer thời gian thực: thống kê trên luồng"]
  S --> B["Consumer batch: Firehose ghi object S3"]
  B --> L["Lưu trữ dài hạn và truy vấn batch"]
```

## Tóm tắt

| Trừu tượng | Đặc trưng | Lưu ý |
|---|---|---|
| Data warehouse | OLAP chuẩn; từ RDBMS, MPP hàng, MPP cột đến cloud | Không xử lý được dữ liệu phi cấu trúc thực sự (ảnh, video, âm thanh) |
| Data lake | Kho dữ liệu thô; từ Hadoop sang object storage | Thiếu schema, update/delete nếu không có lớp quản lý |
| Data lakehouse | Lake trên object storage + bảng, schema, update/delete, lịch sử, rollback | Mạnh về interoperability; Delta Lake, Hudi, Iceberg |
| Data platform | Hệ sinh thái tích hợp quanh lớp lưu trữ | Tiện nhưng có nguy cơ vendor lock-in |
| Stream-to-batch | Một topic ghi cho cả consumer thời gian thực và batch | Tương tự Lambda; BigQuery có streaming buffer |
