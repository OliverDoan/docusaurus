---
sidebar_position: 2
title: "2. Mô hình hoá dữ liệu và chuẩn hoá"
---

# Mô hình hoá dữ liệu và chuẩn hoá

Sau khi hiểu truy vấn, sách chuyển sang **data modeling (mô hình hoá dữ liệu)**: chọn có chủ đích một cấu trúc mạch lạc cho dữ liệu để phản ánh logic nghiệp vụ của tổ chức. Bài này trình bày mô hình hoá là gì, ba tầng mô hình (khái niệm, logic, vật lý), khái niệm độ chi tiết (grain), và đặc biệt là **chuẩn hoá (normalization)** cùng ví dụ từng bước từ denormalized đến 3NF.

**Tương tự đơn giản:** mô hình dữ liệu giống bản quy hoạch đô thị. Không có nó, nhà cửa vẫn mọc lên nhưng đường xá lộn xộn, địa chỉ trùng lặp, không ai biết "phố X" nghĩa là gì. Có quy hoạch, mọi người dùng chung bản đồ.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Mô hình dữ liệu tốt phản ánh logic nghiệp vụ** và có định nghĩa nhất quán (ví dụ "khách hàng" là ai?); phải có các bên liên quan nghiệp vụ tham gia ngay từ đầu.
- ⭐ **Mô hình hoá ở độ chi tiết thấp nhất có thể (grain nhỏ nhất)**: từ dữ liệu chi tiết có thể tổng hợp lên, nhưng dữ liệu đã tổng hợp thì không thể khôi phục chi tiết.
- Ba tầng: **khái niệm** (ER, quy tắc nghiệp vụ), **logic** (kiểu dữ liệu, khoá chính/ngoại), **vật lý** (DB, schema, bảng, cấu hình cụ thể).
- **Chuẩn hoá** (Codd, đầu thập niên 1970) loại bỏ dư thừa dữ liệu và đảm bảo toàn vẹn tham chiếu; DB thường được coi là "chuẩn hoá" khi đạt **3NF**.
- Mức chuẩn hoá phù hợp tuỳ use case; denormalization rất phổ biến trong OLAP.

:::

---

## Mục lục

- 1. Bối cảnh: mô hình hoá dữ liệu "lên rồi xuống rồi lại lên"
- 2. Mô hình dữ liệu là gì
- 3. Mô hình khái niệm, logic và vật lý
- 4. Độ chi tiết (grain) của dữ liệu
- 5. Chuẩn hoá (normalization)
- 6. Ví dụ từng bước: từ denormalized đến 3NF
- Tóm tắt

---

## 1. Bối cảnh: mô hình hoá dữ liệu "lên rồi xuống rồi lại lên"

Sách nhận xét mô hình hoá dữ liệu thường bị **bỏ qua một cách đáng lo ngại**: nhiều nhóm dữ liệu lao vào xây hệ thống mà không có kế hoạch sắp xếp dữ liệu sao cho hữu ích với doanh nghiệp. Đó là sai lầm, vì kiến trúc dữ liệu tốt phải phản ánh mục tiêu và logic kinh doanh.

Lịch sử "con lắc":

- Mô hình hoá đã có hàng chục năm: các kỹ thuật chuẩn hoá có từ thời đầu của RDBMS; mô hình hoá data warehouse xuất hiện ít nhất từ đầu những năm 1990.
- Giữa những năm 2010, mô hình hoá bị coi là lỗi thời. Sự nổi lên của **data lake 1.0**, NoSQL và các hệ big data cho phép kỹ sư bỏ qua mô hình hoá truyền thống, đôi khi để đạt hiệu năng hợp lý. Nhưng thiếu mô hình hoá chặt chẽ đã tạo ra các "đầm lầy dữ liệu" (data swamp) chứa nhiều dữ liệu dư thừa, không khớp, hoặc đơn giản là sai.
- Ngày nay con lắc quay lại: sự nổi bật của **quản lý dữ liệu** (data governance, data quality) thúc đẩy nhu cầu logic nghiệp vụ mạch lạc; và việc dữ liệu ngày càng quan trọng khiến người ta nhận ra mô hình hoá cần thiết để hiện thực hoá giá trị ở các tầng cao của kim tự tháp nhu cầu khoa học dữ liệu (Data Science Hierarchy of Needs).
- Tuy vậy, tác giả tin rằng cần có **mô hình mới** thực sự đáp ứng nhu cầu streaming và ML (xem bài 3).

---

## 2. Mô hình dữ liệu là gì

**Mô hình dữ liệu** thể hiện cách dữ liệu liên hệ với thế giới thực. Nó phản ánh cách dữ liệu cần được cấu trúc và chuẩn hoá để thể hiện tốt nhất các quy trình, định nghĩa, workflow và logic của tổ chức. Mô hình tốt nắm bắt được cách giao tiếp và làm việc diễn ra tự nhiên trong tổ chức; mô hình kém (hoặc không có) thì lộn xộn, khó hiểu, thiếu mạch lạc.

Một số người coi mô hình hoá là việc tẻ nhạt, "chỉ dành cho doanh nghiệp lớn". Sách so sánh nó với những thói quen vệ sinh tốt như dùng chỉ nha khoa hay ngủ đủ giấc: ai cũng biết nên làm nhưng thường bỏ qua. Lý tưởng nhất, mọi tổ chức đều nên mô hình hoá dữ liệu, ít nhất để đảm bảo logic và quy tắc kinh doanh được chuyển vào tầng dữ liệu.

Khi mô hình hoá, hãy tập trung chuyển mô hình thành **kết quả kinh doanh**: mô hình tốt phải tương quan với các quyết định kinh doanh có tác động.

**Ví dụ của sách:** "khách hàng" có thể nghĩa khác nhau với từng phòng ban. Người mua hàng trong 30 ngày qua có phải khách hàng không? Còn người đã không mua trong 6 tháng hay 1 năm? Định nghĩa và mô hình hoá cẩn thận dữ liệu khách hàng ảnh hưởng lớn đến các báo cáo hành vi khách hàng và mô hình churn (rời bỏ), nơi "thời gian kể từ lần mua cuối" là biến quan trọng. Mô hình tốt chứa **các định nghĩa nhất quán**; thực tế các định nghĩa thường lộn xộn trong toàn công ty. Hãy thử nghĩ ra khái niệm nào trong công ty bạn mà mỗi người hiểu một kiểu.

Phần thảo luận chủ yếu về **batch** vì phần lớn kỹ thuật mô hình hoá sinh ra ở đó; sau đó sách bàn cách tiếp cận cho streaming.

---

## 3. Mô hình khái niệm, logic và vật lý

Mô hình hoá đi từ **trừu tượng đến cụ thể**, qua ba mô hình chính (đây là nền tảng cho các kỹ thuật ở bài sau):

```mermaid
flowchart LR
    A["Khái niệm<br/>(quy tắc nghiệp vụ, sơ đồ ER)"] --> B["Logic<br/>(kiểu dữ liệu, khoá chính/ngoại)"]
    B --> C["Vật lý<br/>(DB, schema, bảng, cấu hình)"]
```

| Mô hình | Nội dung | Ví dụ |
|---|---|---|
| **Khái niệm (conceptual)** | Chứa logic và quy tắc nghiệp vụ, mô tả dữ liệu hệ thống như schema, bảng, trường (tên và loại). Thường trực quan hoá bằng **sơ đồ quan hệ thực thể (ER diagram)** để thể hiện quan hệ giữa các thực thể (đơn hàng, khách hàng, sản phẩm) | Sơ đồ ER nối ID khách hàng, tên, địa chỉ và các đơn hàng của khách |
| **Logic (logical)** | Chi tiết hoá cách hiện thực mô hình khái niệm: thêm kiểu dữ liệu, vạch ra khoá chính và khoá ngoại | Thêm kiểu cho ID khách hàng, tên, địa chỉ; chỉ rõ PK/FK |
| **Vật lý (physical)** | Xác định cách hiện thực mô hình logic trong hệ DB cụ thể: thêm DB, schema, bảng cụ thể, bao gồm chi tiết cấu hình | Bảng nào nằm trong schema nào của DB nào, cấu hình ra sao |

Mô hình hoá thành công cần **các bên liên quan nghiệp vụ tham gia từ đầu**: kỹ sư phải lấy được định nghĩa và mục tiêu kinh doanh cho dữ liệu. Sách gọi đó là "môn thể thao tiếp xúc hoàn toàn", với mục tiêu cung cấp dữ liệu chất lượng để có insight hành động được và tự động hoá thông minh; mọi người phải liên tục tham gia.

---

## 4. Độ chi tiết (grain) của dữ liệu

Một yếu tố quan trọng khác là **độ phân giải (grain)**: mức độ chi tiết mà dữ liệu được lưu và truy vấn. Thông thường grain nằm ở mức khoá chính của bảng (ID khách hàng, ID đơn hàng, ID sản phẩm), thường kèm ngày hoặc timestamp để tăng độ chính xác.

**Ví dụ của sách:** một công ty nhỏ mới bắt đầu làm báo cáo BI, một người vừa là kỹ sư vừa là analyst. Có yêu cầu làm báo cáo tóm tắt đơn hàng hằng ngày của khách: liệt kê khách đã đặt hàng, số đơn trong ngày và tổng tiền đã chi.

- Báo cáo này vốn "thô" (không có chi tiết từng đơn hay từng mặt hàng). Người này có thể chỉ nạp dữ liệu tổng hợp tối thiểu vào bảng báo cáo. Nhưng khi có yêu cầu báo cáo chi tiết hơn, sẽ phải làm lại từ đầu.
- Vì có kinh nghiệm, kỹ sư chọn tạo bảng với dữ liệu **chi tiết từng đơn hàng**: từng đơn, từng mặt hàng, giá, ID mặt hàng... Grain là cấp độ chi tiết đơn hàng của khách. Bảng này có thể phân tích nguyên trạng hoặc tổng hợp lên.

**Quy tắc:** hãy mô hình hoá ở **mức chi tiết thấp nhất có thể**. Từ dữ liệu grain nhỏ, tổng hợp lên rất dễ; chiều ngược lại thì không, thông thường không thể khôi phục chi tiết đã bị tổng hợp.

---

## 5. Chuẩn hoá (normalization)

**Chuẩn hoá** là phương pháp mô hình hoá DB nhằm **kiểm soát chặt chẽ quan hệ giữa các bảng và cột**. Mục tiêu là loại bỏ dư thừa dữ liệu và đảm bảo **toàn vẹn tham chiếu (referential integrity)**. Về bản chất nó là nguyên tắc **DRY (Don't Repeat Yourself)** áp dụng cho dữ liệu trong DB.

Chuẩn hoá thường áp dụng cho DB quan hệ gồm bảng, hàng, cột (sách dùng "cột" và "trường" thay thế nhau). Nó do nhà tiên phong DB quan hệ **Edgar Codd** giới thiệu đầu thập niên 1970. Codd nêu bốn mục tiêu chính:

1. Giải phóng tập các quan hệ khỏi các phụ thuộc chèn, cập nhật, xoá không mong muốn.
2. Giảm nhu cầu tái cấu trúc tập quan hệ khi có loại dữ liệu mới, do đó tăng tuổi thọ chương trình ứng dụng.
3. Làm mô hình quan hệ giàu thông tin hơn đối với người dùng.
4. Làm tập quan hệ **trung lập với thống kê truy vấn**, vì thống kê này có thể thay đổi theo thời gian.

Codd đưa ra khái niệm **dạng chuẩn (normal form)**. Các dạng chuẩn mang tính **tuần tự**: mỗi dạng bao gồm điều kiện của các dạng trước.

| Mức | Điều kiện |
|---|---|
| **Denormalized** | Không áp dụng chuẩn hoá; cho phép dữ liệu lồng nhau và dư thừa |
| **1NF** | Mỗi cột duy nhất và chứa một giá trị duy nhất. Bảng có một khoá chính duy nhất |
| **2NF** | Thoả 1NF, cộng với việc loại bỏ mọi **phụ thuộc từng phần (partial dependency)** |
| **3NF** | Thoả 2NF, cộng với việc mỗi bảng chỉ chứa các trường liên quan đến khoá chính của nó, không có **phụ thuộc bắc cầu (transitive dependency)** |

Giải thích thuật ngữ:

- **Khoá chính duy nhất (unique primary key):** một trường hoặc tập nhiều trường xác định duy nhất một hàng. Mỗi giá trị khoá xuất hiện nhiều nhất một lần; do đó mọi giá trị khác trong hàng đều phụ thuộc vào khoá (xác định được từ khoá).
- **Phụ thuộc từng phần:** xảy ra khi một **tập con** các trường trong khoá **tổng hợp (composite key)** đủ để xác định một cột không phải khoá.
- **Phụ thuộc bắc cầu:** xảy ra khi một trường không phải khoá lại phụ thuộc vào một trường không phải khoá khác.

---

## 6. Ví dụ từng bước: từ denormalized đến 3NF

Ví dụ thương mại điện tử về đơn đặt hàng của khách hàng.

### Bước 0: bảng OrderDetail (denormalized)

Bảng có 5 trường, khoá chính là `OrderID`. Trường `OrderItems` chứa một đối tượng **lồng nhau** gồm hai SKU cùng giá, số lượng, tên.

| OrderID | OrderItems | CustomerID | CustomerName | OrderDate |
|---|---|---|---|---|
| 100 | (xem JSON bên dưới) | 5 | Joe Reis | 2022-03-01 |

```json
[
  {"sku": 1, "price": 50, "quantity": 1, "name": "Thingamajig"},
  {"sku": 2, "price": 25, "quantity": 2, "name": "Whatchamacallit"}
]
```

### Bước 1: đạt 1NF

Tách `OrderItems` thành bốn trường (Sku, Price, Quantity, ProductName) để các trường không còn dữ liệu lặp hay lồng nhau:

| OrderID | Sku | Price | Quantity | ProductName | CustomerID | CustomerName | OrderDate |
|---|---|---|---|---|---|---|---|
| 100 | 1 | 50 | 1 | Thingamajig | 5 | Joe Reis | 2022-03-01 |
| 100 | 2 | 25 | 2 | Whatchamacallit | 5 | Joe Reis | 2022-03-01 |
| 101 | 3 | 75 | 1 | Whozeewhatzit | 7 | Matt Housley | 2022-03-01 |
| 102 | 1 | 50 | 1 | Thingamajig | 7 | Matt Housley | 2022-03-01 |

Vấn đề: giờ không còn khoá chính duy nhất, vì `100` xuất hiện ở hai hàng. Giải pháp: thêm cột **LineItemNumber** để đánh số các dòng. Khoá ghép `(OrderID, LineItemNumber)` trở thành khoá chính duy nhất.

| OrderID | LineItemNumber | Sku | Price | Quantity | ProductName | CustomerID | CustomerName | OrderDate |
|---|---|---|---|---|---|---|---|---|
| 100 | 1 | 1 | 50 | 1 | Thingamajig | 5 | Joe Reis | 2022-03-01 |
| 100 | 2 | 2 | 25 | 2 | Whatchamacallit | 5 | Joe Reis | 2022-03-01 |
| 101 | 1 | 3 | 75 | 1 | Whozeewhatzit | 7 | Matt Housley | 2022-03-01 |
| 102 | 1 | 1 | 50 | 1 | Thingamajig | 7 | Matt Housley | 2022-03-01 |

### Bước 2: đạt 2NF

Cần loại bỏ **phụ thuộc từng phần**: cột không phải khoá bị xác định đầy đủ bởi một *tập con* của khoá chính tổng hợp. Ở đây, các cột `CustomerID`, `CustomerName`, `OrderDate` chỉ phụ thuộc vào `OrderID` (không cần `LineItemNumber`). Tách `OrderDetail` thành hai bảng **Orders** và **OrderLineItem**:

**Orders** (khoá chính: OrderID)

| OrderID | CustomerID | CustomerName | OrderDate |
|---|---|---|---|
| 100 | 5 | Joe Reis | 2022-03-01 |
| 101 | 7 | Matt Housley | 2022-03-01 |
| 102 | 7 | Matt Housley | 2022-03-01 |

**OrderLineItem** (khoá chính: OrderID + LineItemNumber)

| OrderID | LineItemNumber | Sku | Price | Quantity | ProductName |
|---|---|---|---|---|---|
| 100 | 1 | 1 | 50 | 1 | Thingamajig |
| 100 | 2 | 2 | 25 | 2 | Whatchamacallit |
| 101 | 1 | 3 | 75 | 1 | Whozeewhatzit |
| 102 | 1 | 1 | 50 | 1 | Thingamajig |

### Bước 3: đạt 3NF

Trong `OrderLineItem`, `Sku` xác định `ProductName`: tức `ProductName` phụ thuộc vào `Sku`, và `Sku` phụ thuộc vào khoá tổng hợp. Đây là **phụ thuộc bắc cầu**. Tách thành `OrderLineItem` và `Skus`:

**OrderLineItem**

| OrderID | LineItemNumber | Sku | Price | Quantity |
|---|---|---|---|---|
| 100 | 1 | 1 | 50 | 1 |
| 100 | 2 | 2 | 25 | 2 |
| 101 | 1 | 3 | 75 | 1 |
| 102 | 1 | 1 | 50 | 1 |

**Skus**

| Sku | ProductName |
|---|---|
| 1 | Thingamajig |
| 2 | Whatchamacallit |
| 3 | Whozeewhatzit |

Giờ `OrderLineItem` và `Skus` đều ở 3NF. Lưu ý: bảng **Orders chưa đạt 3NF**. Sách đặt câu hỏi cho người đọc: phụ thuộc bắc cầu nào đang có và sửa thế nào?

> Gợi ý (do người ghi chép thêm, suy ra từ ví dụ): trong `Orders`, `CustomerName` được xác định bởi `CustomerID`, mà `CustomerID` phụ thuộc vào `OrderID`. Tách thành bảng `Orders` (OrderID, CustomerID, OrderDate) và bảng `Customers` (CustomerID, CustomerName) là cách khắc phục.

### Lưu ý chung

Có các dạng chuẩn cao hơn (đến 6NF, bao gồm Boyce-Codd) nhưng ít phổ biến hơn nhiều ba dạng đầu. Một DB thường được coi là **chuẩn hoá** nếu ở **3NF**, và đó là quy ước sách dùng.

Mức chuẩn hoá cần áp dụng phụ thuộc use case; **không có giải pháp một cỡ cho tất cả**, nhất là trong các DB mà một số thao tác denormalization mang lại lợi thế hiệu năng. Denormalization nghe như phản mẫu (anti-pattern) nhưng rất phổ biến trong nhiều hệ OLAP lưu dữ liệu bán cấu trúc. Hãy nghiên cứu quy ước chuẩn hoá và best practice của DB để chọn chiến lược phù hợp.

---

## Tóm tắt

| Khái niệm | Ý chính |
|---|---|
| Mô hình hoá | Chọn có chủ đích cấu trúc dữ liệu phản ánh logic nghiệp vụ; con lắc đang quay lại sau thời kỳ data swamp |
| Định nghĩa nhất quán | Ví dụ "khách hàng" phải được thống nhất; cần các bên liên quan nghiệp vụ tham gia |
| Khái niệm, logic, vật lý | Từ ER và quy tắc nghiệp vụ, đến kiểu dữ liệu và khoá, đến DB và bảng cụ thể |
| Grain | Mô hình hoá ở mức chi tiết thấp nhất để tổng hợp lên được |
| Chuẩn hoá | DRY cho dữ liệu: 1NF (không lặp/lồng, có khoá chính), 2NF (không phụ thuộc từng phần), 3NF (không phụ thuộc bắc cầu) |
| Thực tế | Denormalization hợp lệ và phổ biến ở OLAP; chọn mức chuẩn hoá theo use case |
