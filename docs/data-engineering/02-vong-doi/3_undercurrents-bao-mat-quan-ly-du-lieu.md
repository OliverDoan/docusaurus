---
sidebar_position: 3
title: "3. Undercurrents: Bảo mật và Quản lý dữ liệu"
---

# Undercurrents: Bảo mật và Quản lý dữ liệu

Kỹ thuật dữ liệu đang trưởng thành nhanh. Trước đây trọng tâm nằm ở lớp công nghệ; nay khi công cụ ngày càng trừu tượng và đơn giản, lĩnh vực này **tiến lên chuỗi giá trị**, bao gồm cả các phương pháp truyền thống của doanh nghiệp (quản lý dữ liệu, tối ưu chi phí) lẫn phương pháp mới (DataOps). Sách gọi các thực hành này là **undercurrents** (yếu tố xuyên suốt): **Security, Data Management, DataOps, Data Architecture, Orchestration, Software Engineering**. Bài này nói về hai yếu tố đầu; bốn yếu tố còn lại ở bài sau.

**Tương tự đơn giản:** nếu 5 giai đoạn là các công đoạn trong nhà máy, thì undercurrents là hệ thống điện, an ninh, quy trình kiểm định chất lượng và sổ sách chạy xuyên suốt mọi công đoạn.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Security đặt lên hàng đầu**: áp dụng **nguyên tắc đặc quyền tối thiểu (least privilege)**. Cấp quyền admin cho mọi người là "thảm hoạ đang chờ xảy ra".
- ⭐ **Data management** = tập thực hành giúp tổ chức coi dữ liệu là tài sản: governance, metadata, chất lượng, MDM, lineage, mô hình hoá, vòng đời, đạo đức và quyền riêng tư.
- Governance có ba trụ: **discoverability (khám phá), security (bảo mật), accountability (trách nhiệm giải trình)**.
- Metadata có 4 loại (DMBOK): **business, technical, operational, reference**.
- Chất lượng dữ liệu: **accuracy (chính xác), completeness (đầy đủ), timeliness (kịp thời)**.
- Con người là lỗ hổng bảo mật lớn nhất; cần **văn hoá bảo mật**.

:::

---

## Mục lục

- 1. Security (bảo mật)
- 2. Data management (quản lý dữ liệu)
  - 2.1. Data governance
  - 2.2. Metadata
  - 2.3. Data accountability
  - 2.4. Data quality
  - 2.5. Master data management
  - 2.6. Mô hình hoá và thiết kế dữ liệu
  - 2.7. Data lineage
  - 2.8. Tích hợp và interoperability
  - 2.9. Quản lý vòng đời dữ liệu
  - 2.10. Đạo đức và quyền riêng tư
- Tóm tắt

## 1. Security (bảo mật)

Bảo mật phải được ưu tiên hàng đầu với kỹ sư dữ liệu; ai bỏ qua nó sẽ gặp nguy hiểm. Đó là lý do nó đứng đầu danh sách. Kỹ sư dữ liệu phải hiểu cả **bảo mật dữ liệu** lẫn **kiểm soát truy cập**, và thực thi **principle of least privilege** (nguyên tắc đặc quyền tối thiểu): chỉ cấp cho người dùng hoặc hệ thống quyền truy cập vào dữ liệu và tài nguyên **cần thiết để thực hiện chức năng dự định**, không hơn.

Một **anti-pattern** thường gặp ở kỹ sư ít kinh nghiệm bảo mật là cấp quyền admin cho tất cả người dùng. Đó là thảm hoạ đang chờ xảy ra. Lời khuyên cụ thể:

- Chỉ cấp quyền truy cập đủ cho công việc **hôm nay**.
- Đừng chạy bằng **root shell** khi chỉ cần xem file bằng quyền người dùng thường.
- Khi truy vấn bảng bằng vai trò thấp hơn, đừng dùng vai trò **superuser** trong database.
- Tự áp đặt least privilege lên bản thân giúp ngừa thiệt hại vô tình và giữ tư duy "bảo mật trước".

**Con người và cơ cấu tổ chức luôn là lỗ hổng lớn nhất.** Các vụ vi phạm lớn thường do ai đó bỏ qua biện pháp cơ bản, bị **phishing** (tấn công lừa đảo) hoặc hành động vô trách nhiệm. Tuyến phòng thủ đầu tiên là tạo **văn hoá bảo mật** thấm vào tổ chức: mọi người có quyền truy cập dữ liệu phải hiểu trách nhiệm bảo vệ dữ liệu nhạy cảm của công ty và khách hàng.

Bảo mật cũng liên quan đến **thời gian**: cấp quyền cho đúng người và hệ thống cần, và **chỉ trong khoảng thời gian cần thiết**. Dữ liệu phải được bảo vệ khỏi bị nhìn thấy ngoài ý muốn, cả khi **đang truyền** lẫn khi **lưu trữ**, bằng: **mã hoá (encryption)**, **tokenization**, **data masking (che giấu dữ liệu)** và các kiểm soát truy cập đơn giản mà mạnh.

Kỹ sư dữ liệu phải là **quản trị viên bảo mật có năng lực**, hiểu thực hành tốt nhất cho cả cloud và on-premises. Những điểm khởi đầu tốt: **IAM** (Identity and Access Management, quản lý danh tính và truy cập) gồm vai trò, chính sách, nhóm; bảo mật mạng; chính sách mật khẩu; mã hoá. Chương 10 đi sâu hơn.

## 2. Data management (quản lý dữ liệu)

Quản lý dữ liệu nghe có vẻ rất "doanh nghiệp", đúng vậy: đây là các thực hành "trường cũ" nay áp vào data engineering và ML. "Cái gì cũ lại mới." Nó tồn tại hàng thập kỷ nhưng gần đây mới được chú ý trong data engineering. Khi công cụ dữ liệu đơn giản hơn và việc quản lý hạ tầng bớt phức tạp, kỹ sư dữ liệu tiến lên chuỗi giá trị theo hướng thực hành tốt nhất tiếp theo. Những thực hành từng dành cho công ty lớn (governance, master data, chất lượng, metadata) nay lan xuống công ty mọi quy mô. Như tác giả nói, data engineering đang trở nên "enterprise".

**DAMA** (Data Management Association International) với **DMBOK** (Data Management Body of Knowledge) định nghĩa: quản lý dữ liệu là việc **phát triển, thực thi và giám sát các kế hoạch, chính sách, chương trình và thực hành** nhằm **cung cấp, kiểm soát, bảo vệ và nâng cao giá trị** của tài sản dữ liệu và thông tin trong suốt vòng đời của chúng.

Liên hệ với data engineering: kỹ sư dữ liệu quản lý vòng đời dữ liệu, còn quản lý dữ liệu là bộ thực hành tốt nhất họ dùng để làm việc đó, cả về kỹ thuật lẫn chiến lược. Không có khung quản lý dữ liệu, kỹ sư dữ liệu chỉ là kỹ thuật viên làm việc trong chân không; họ cần cái nhìn rộng về tiện ích của dữ liệu trong toàn tổ chức, từ hệ thống nguồn đến C-suite.

Vì sao quan trọng? Nó khẳng định dữ liệu quan trọng cho hoạt động hằng ngày, giống như doanh nghiệp xem tài chính, thành phẩm hay bất động sản là **tài sản**. Các thực hành quản lý dữ liệu tạo khung gắn kết để mọi người đảm bảo tổ chức nhận được giá trị từ dữ liệu và xử lý nó đúng cách.

Các khía cạnh của quản lý dữ liệu:

- Data governance (gồm discoverability và accountability)
- Mô hình hoá và thiết kế dữ liệu
- Data lineage
- Lưu trữ và vận hành
- Tích hợp dữ liệu và interoperability
- Quản lý vòng đời dữ liệu
- Hệ thống dữ liệu cho analytics nâng cao và ML
- Đạo đức và quyền riêng tư

### 2.1. Data governance

Theo sách *Data Governance: The Definitive Guide*, data governance trước hết là chức năng quản lý dữ liệu nhằm đảm bảo **chất lượng, tính toàn vẹn, bảo mật và khả năng sử dụng** của dữ liệu mà tổ chức thu thập. Mở rộng ra: governance huy động **con người, quy trình và công nghệ** để tối đa hoá giá trị dữ liệu trong tổ chức, đồng thời **bảo vệ** dữ liệu bằng kiểm soát bảo mật phù hợp.

Governance hiệu quả phải được phát triển **có chủ đích** và được tổ chức ủng hộ. Khi nó diễn ra tuỳ tiện, lộn xộn, hậu quả đi từ dữ liệu không đáng tin đến vi phạm bảo mật. Governance có chủ đích tối đa hoá năng lực dữ liệu và giá trị tạo ra, và (hy vọng) giúp công ty tránh các tiêu đề về cách xử lý dữ liệu cẩu thả.

**Ví dụ về governance kém (theo sách):** một business analyst nhận yêu cầu báo cáo nhưng không biết dùng dữ liệu nào. Họ mất hàng giờ lần mò hàng chục bảng trong database giao dịch, đoán trường nào hữu ích. Báo cáo cuối "đúng theo hướng" nhưng chính họ không chắc dữ liệu nền chính xác hay hợp lý. Người nhận báo cáo cũng nghi ngờ. Tính toàn vẹn của analyst, và của toàn bộ dữ liệu trong công ty, bị đặt dấu hỏi. Công ty mù mờ về hiệu quả hoạt động, khiến việc lập kế hoạch bất khả thi.

Governance tốt giúp con người, quy trình, công nghệ cùng coi dữ liệu là động lực kinh doanh chính, và sự cố dữ liệu được xử lý kịp thời. Ba danh mục cốt lõi: **discoverability, security, accountability**. Bên trong có các danh mục phụ như chất lượng dữ liệu, metadata, quyền riêng tư.

#### Discoverability (khả năng khám phá)

Trong công ty hướng dữ liệu, dữ liệu phải **có sẵn và khám phá được**. Người dùng cuối cần truy cập nhanh, đáng tin dữ liệu để làm việc; họ nên biết dữ liệu đến từ đâu, liên hệ với dữ liệu khác thế nào và ý nghĩa của nó. Hai lĩnh vực chính: **quản lý metadata** và **master data management**.

### 2.2. Metadata

**Metadata** là "dữ liệu về dữ liệu" và nâng đỡ mọi phần của vòng đời. Metadata chính là dữ liệu cần để dữ liệu **khám phá và quản lý được**.

Hai loại theo nguồn gốc: **tự động sinh** và **do con người tạo**. Data engineering hiện đại xoay quanh tự động hoá, nhưng việc thu thập metadata thường làm thủ công và dễ lỗi. Công nghệ có thể bớt phần việc này: đang có sự gia tăng nhanh của **data catalog**, **hệ thống theo dõi lineage** và **công cụ quản lý metadata**. Công cụ có thể **crawl** database để tìm quan hệ và giám sát pipeline để theo dõi dữ liệu đến từ đâu, đi đâu. Cách thủ công, độ chính xác thấp hơn, dựa vào nỗ lực nội bộ: các bên liên quan góp metadata từ cộng đồng trong tổ chức.

Metadata dần trở thành sản phẩm phụ của dữ liệu và quy trình dữ liệu, nhưng thách thức vẫn còn, đặc biệt là thiếu **interoperability** (khả năng tương tác) và tiêu chuẩn. Công cụ metadata chỉ tốt khi kết nối được với hệ thống dữ liệu và chia sẻ được metadata. Công cụ tự động cũng **không loại hẳn con người** khỏi vòng lặp.

Dữ liệu có **yếu tố xã hội**: mỗi tổ chức tích luỹ vốn xã hội và kiến thức quanh quy trình và dataset. Các hệ thống metadata hướng con người tập trung vào khía cạnh này, như **Data Portal** của Airbnb (nơi cho thấy chủ sở hữu dữ liệu, người dùng và chuyên gia lĩnh vực). Tài liệu và wiki nội bộ là nền tảng quan trọng, nhưng nên tích hợp với catalog tự động; ví dụ công cụ scan dữ liệu có thể sinh trang wiki liên kết tới đối tượng dữ liệu liên quan.

Khi đã có hệ thống metadata, kỹ sư dữ liệu dùng nó làm nền cho thiết kế quy trình và quản lý dữ liệu xuyên suốt vòng đời.

DMBOK nêu **bốn loại metadata** hữu ích cho kỹ sư dữ liệu:

| Loại | Mô tả | Ví dụ / cách dùng |
|---|---|---|
| **Business metadata** (kinh doanh) | Cách dữ liệu được dùng trong doanh nghiệp: định nghĩa dữ liệu và kinh doanh, quy tắc, logic, nơi dữ liệu được dùng, chủ sở hữu | Trả lời câu hỏi phi kỹ thuật "ai, cái gì, ở đâu, thế nào". Ví dụ: "khách hàng" là gì? Người mua trong 90 ngày qua, hay bất kỳ ai từng mua? Tra từ điển dữ liệu / catalog |
| **Technical metadata** (kỹ thuật) | Dữ liệu do hệ thống tạo và dùng: mô hình dữ liệu, schema, lineage, ánh xạ trường, workflow pipeline | Dùng để tạo, kết nối, giám sát hệ thống. Gồm pipeline metadata, lineage, schema |
| **Operational metadata** (vận hành) | Kết quả vận hành của hệ thống: thống kê quy trình, job ID, log runtime, dữ liệu dùng trong quy trình, log lỗi | Xác định quy trình thành công hay thất bại |
| **Reference metadata** (tham chiếu) | Dữ liệu dùng để phân loại dữ liệu khác, còn gọi là dữ liệu tra cứu (lookup) | Mã nội bộ, mã địa lý, đơn vị đo, chuẩn lịch nội bộ |

Chi tiết thêm về technical metadata:

- **Pipeline metadata**: thường sinh trong hệ thống **orchestration** (hệ thống điều phối workflow nhiều hệ thống), cho thấy lịch job, phụ thuộc hệ thống và dữ liệu, cấu hình, chi tiết kết nối.
- **Data lineage metadata**: theo dõi nguồn gốc, thay đổi và phụ thuộc của dữ liệu theo thời gian; cung cấp **dấu vết kiểm toán (audit trail)** khi dữ liệu qua các hệ thống.
- **Schema metadata**: mô tả cấu trúc dữ liệu lưu trong database, warehouse, data lake hay file system; là một điểm khác biệt chính giữa các hệ thống lưu trữ. Ví dụ: **object store không quản lý schema metadata**, phải quản lý ở nơi khác (như metastore); ngược lại **cloud data warehouse quản lý nội bộ**.

Về operational metadata: hệ thống orchestration chỉ cho thấy phần hạn chế; metadata này vẫn rải rác nhiều hệ thống. Nhu cầu operational metadata tốt hơn là động lực chính cho thế hệ hệ thống quản lý metadata và orchestration tiếp theo.

Về reference metadata: phần lớn được quản lý nội bộ, nhưng mã địa lý có thể đến từ chuẩn bên ngoài. Nó là chuẩn để diễn giải dữ liệu khác nên thay đổi **chậm** theo thời gian.

### 2.3. Data accountability (trách nhiệm giải trình)

**Data accountability** là giao cho **một cá nhân** phụ trách một phần dữ liệu. Người này điều phối các hoạt động governance của các bên liên quan khác. Quản lý chất lượng dữ liệu rất khó nếu không ai chịu trách nhiệm.

Điểm lưu ý:

- Người chịu trách nhiệm **không nhất thiết là kỹ sư dữ liệu**. Có thể là software engineer, product manager hay vai trò khác.
- Họ thường **không có đủ nguồn lực** để tự duy trì chất lượng; họ **phối hợp** với mọi người chạm vào dữ liệu, kể cả data engineer.
- Có thể ở nhiều mức: cấp bảng, cấp log stream, hoặc chi tiết như một **thực thể trường** xuất hiện trên nhiều bảng. Một người có thể chịu trách nhiệm quản lý ID khách hàng trên nhiều hệ thống. Với quản lý dữ liệu doanh nghiệp, **data domain** là tập hợp mọi giá trị có thể có của một loại trường, như ID trong ví dụ trên. Nghe quan liêu và tỉ mỉ, nhưng ảnh hưởng đáng kể đến chất lượng.

### 2.4. Data quality (chất lượng dữ liệu)

> "Tôi có thể tin dữ liệu này không?" — câu hỏi của mọi người trong doanh nghiệp.

Chất lượng dữ liệu là việc tối ưu dữ liệu về trạng thái mong muốn, xoay quanh câu hỏi: **bạn nhận được gì so với bạn mong đợi?** Dữ liệu phải khớp kỳ vọng trong business metadata, tức khớp với định nghĩa mà doanh nghiệp đã thống nhất.

Kỹ sư dữ liệu đảm bảo chất lượng xuyên suốt vòng đời: chạy **data quality check**, đảm bảo dữ liệu tuân kỳ vọng về schema, tính đầy đủ và độ chính xác. Theo *Data Governance: The Definitive Guide*, có ba đặc điểm chính:

| Đặc điểm | Câu hỏi |
|---|---|
| **Accuracy** (độ chính xác) | Dữ liệu có đúng về mặt thực tế không? Có giá trị trùng lặp không? Giá trị số có chính xác không? |
| **Completeness** (tính đầy đủ) | Bản ghi có đầy đủ không? Các trường bắt buộc có giá trị hợp lệ không? |
| **Timeliness** (tính kịp thời) | Bản ghi có sẵn kịp thời không? |

Mỗi đặc điểm đều có sắc thái:

- **Bot và web crawler** trong dữ liệu sự kiện web: nếu muốn phân tích hành trình khách hàng, phải có quy trình tách lưu lượng người khỏi máy. Sự kiện do bot sinh ra bị xếp sai thành vấn đề độ chính xác của dữ liệu người, và ngược lại.
- **Đầy đủ và kịp thời**: bài báo mô hình **Dataflow** của Google nêu ví dụ nền tảng video **offline** hiển thị quảng cáo. Nền tảng tải video và quảng cáo khi có mạng, người dùng xem khi offline, rồi tải dữ liệu lượt xem quảng cáo lên sau khi có mạng lại, nên dữ liệu có thể đến **rất muộn** sau lượt xem. Vậy nền tảng tính tiền quảng cáo ra sao? Vấn đề này về cơ bản **không giải được bằng kỹ thuật thuần tuý**; kỹ sư phải xác định tiêu chuẩn cho dữ liệu đến muộn và thực thi nhất quán, có thể nhờ nhiều công cụ.

Chất lượng dữ liệu nằm ở **ranh giới giữa con người và công nghệ**. Cần quy trình mạnh để thu phản hồi của con người về chất lượng, và công cụ công nghệ để phát hiện vấn đề **trước khi** người dùng downstream thấy.

### 2.5. Master data management (MDM)

**Master data** là dữ liệu về các **thực thể kinh doanh** như nhân viên, khách hàng, sản phẩm, địa điểm. Khi tổ chức lớn lên và phức tạp hơn (qua tăng trưởng tự nhiên, mua lại, hợp tác), việc giữ bức tranh nhất quán về thực thể ngày càng khó.

**MDM** là thực hành xây dựng các định nghĩa thực thể nhất quán gọi là **golden record** (bản ghi vàng). Golden record hài hoà dữ liệu thực thể trong toàn tổ chức và với đối tác. MDM là quy trình nghiệp vụ được hỗ trợ bởi công cụ công nghệ. Ví dụ: nhóm MDM định nghĩa **định dạng chuẩn cho địa chỉ**, rồi cùng kỹ sư dữ liệu xây API trả về địa chỉ nhất quán và hệ thống dùng địa chỉ để khớp hồ sơ khách hàng giữa các bộ phận.

MDM bao quát toàn bộ chu trình dữ liệu tới database vận hành. Nó có thể thuộc phạm vi trực tiếp của data engineering nhưng thường là trách nhiệm của một **nhóm chuyên trách** toàn tổ chức. Dù không sở hữu MDM, kỹ sư dữ liệu vẫn nên biết vì có thể cộng tác trong các sáng kiến MDM.

### 2.6. Mô hình hoá và thiết kế dữ liệu

Để rút insight từ dữ liệu (qua business analytics và data science), dữ liệu phải ở dạng dùng được. Quá trình chuyển dữ liệu về dạng dùng được gọi là **data modeling và design**. Truyền thống đây là việc của DBA và dev ETL, nhưng nó có thể xảy ra ở hầu như mọi nơi trong tổ chức: software engineer thiết kế định dạng bản ghi cho thiết bị IoT, dev web thiết kế JSON response cho API hay schema bảng MySQL, đều là mô hình hoá.

Việc này khó hơn vì có nhiều nguồn và use case mới. Ví dụ **chuẩn hoá nghiêm ngặt** (strict normalization) không hợp với dữ liệu sự kiện. May mắn thay, thế hệ công cụ mới tăng độ linh hoạt mà vẫn giữ sự phân tách hợp lý giữa **measures, dimensions, attributes, hierarchies**. Cloud data warehouse hỗ trợ nạp lượng lớn dữ liệu **denormalized** và bán cấu trúc, đồng thời vẫn hỗ trợ các mẫu mô hình phổ biến như **Kimball, Inmon, Data Vault**. Framework như Spark xử lý được toàn phổ dữ liệu, từ bản ghi quan hệ phẳng có cấu trúc đến văn bản thô phi cấu trúc. Chương 8 bàn kỹ hơn.

Với lượng dữ liệu đa dạng, ta dễ muốn **bỏ hẳn mô hình hoá**. Tác giả gọi đó là "ý tưởng khủng khiếp" với hậu quả đau lòng, thể hiện qua cụm **WORN** (write once, read never: ghi một lần, không bao giờ đọc) hoặc **data swamp** (đầm lầy dữ liệu). Kỹ sư dữ liệu cần hiểu thực hành tốt nhất về mô hình hoá và đủ linh hoạt để áp mức và kiểu mô hình phù hợp cho từng nguồn và use case.

### 2.7. Data lineage

Khi dữ liệu di chuyển qua vòng đời, làm sao biết hệ thống nào đã tác động lên nó, hay nó gồm những gì sau khi bị chuyển đổi? **Data lineage** là việc ghi lại **dấu vết kiểm toán** của dữ liệu xuyên suốt vòng đời, theo dõi cả hệ thống xử lý dữ liệu và dữ liệu **upstream** mà nó phụ thuộc.

Lợi ích: theo dõi lỗi, trách nhiệm giải trình, **debug** dữ liệu và hệ thống xử lý nó; cung cấp audit trail và giúp **tuân thủ**. Ví dụ: người dùng muốn xoá dữ liệu của họ khỏi hệ thống, lineage cho biết dữ liệu đó được lưu ở đâu và các phụ thuộc của nó.

Lineage từ lâu đã có ở công ty lớn với chuẩn tuân thủ nghiêm; nay lan sang công ty nhỏ hơn khi quản lý dữ liệu thành xu hướng chính. Sách cũng nhắc **DODD** (Data-Observability Driven Development, của Andy Petrella) liên quan chặt chẽ: quan sát dữ liệu dọc theo lineage của nó, áp dụng trong phát triển, kiểm thử và cả production để đảm bảo chất lượng và khớp kỳ vọng.

### 2.8. Tích hợp dữ liệu và interoperability

Đây là việc tích hợp dữ liệu giữa các công cụ và quy trình. Khi chuyển từ cách tiếp cận analytics đơn lẻ sang môi trường cloud **không đồng nhất** (nhiều công cụ xử lý dữ liệu theo nhu cầu), tích hợp và interoperability chiếm phần việc ngày càng lớn.

Việc tích hợp ngày càng đi qua **API đa dụng** thay vì kết nối database tuỳ biến. Ví dụ trong sách: một pipeline kéo dữ liệu từ API Salesforce, lưu vào Amazon S3, gọi API Snowflake để nạp vào bảng, gọi lại API để chạy truy vấn, rồi xuất kết quả sang S3 để Spark dùng. Tất cả có thể điều khiển bằng mã Python tương đối đơn giản giao tiếp với hệ thống dữ liệu thay vì tự xử lý dữ liệu. Độ phức tạp của từng tương tác giảm, nhưng **số hệ thống và độ phức tạp pipeline tăng mạnh**. Kỹ sư mới bắt đầu nhanh chóng vượt khả năng viết script riêng và gặp nhu cầu **orchestration** (bàn ở bài sau).

### 2.9. Quản lý vòng đời dữ liệu

Sự ra đời của **data lake** từng khiến tổ chức bỏ qua việc lưu trữ và huỷ dữ liệu: sao phải bỏ dữ liệu khi cứ thêm dung lượng được? Hai thay đổi khiến kỹ sư chú ý hơn tới **cuối vòng đời**:

1. **Dữ liệu ngày càng lên cloud** nên trả phí theo mức dùng thay vì chi phí vốn lớn ban đầu cho data lake on-premises. Khi mỗi byte xuất hiện trong hoá đơn AWS hàng tháng, CFO thấy cơ hội tiết kiệm. Cloud làm việc lưu trữ lâu dài (**archival**) tương đối đơn giản: nhà cung cấp lớn có tầng object storage chuyên archival với chi phí cực thấp nếu hiếm khi truy cập (lưu ý phí truy xuất không rẻ). Các tầng này còn hỗ trợ chính sách ngăn việc xoá nhầm hoặc cố ý các kho lưu trữ quan trọng.
2. **Luật quyền riêng tư và lưu giữ dữ liệu** như **GDPR** và **CCPA** buộc kỹ sư dữ liệu chủ động quản lý việc huỷ dữ liệu để tôn trọng "**quyền được lãng quên**" của người dùng. Họ phải biết mình giữ dữ liệu consumer nào và có quy trình huỷ để đáp ứng yêu cầu.

So sánh khả năng xoá:

| Môi trường | Việc huỷ dữ liệu |
|---|---|
| Cloud data warehouse | Đơn giản: SQL cho phép xoá hàng theo mệnh đề WHERE |
| Data lake (mặc định ghi một lần, đọc nhiều lần) | Khó hơn; các công cụ như **Hive ACID** và **Delta Lake** giúp quản lý giao dịch xoá ở quy mô lớn |

Thế hệ công cụ metadata, lineage và catalog mới cũng sẽ giúp đơn giản hoá phần cuối vòng đời.

### 2.10. Đạo đức và quyền riêng tư

Các vụ rò rỉ dữ liệu, thông tin sai lệch, xử lý sai dữ liệu những năm gần đây cho thấy: **dữ liệu tác động đến con người**. Dữ liệu từng ở "miền Tây hoang dã", thu thập và trao đổi tự do như thẻ bóng chày. Thời đó đã qua. Đạo đức và quyền riêng tư giờ là **trung tâm** của vòng đời dữ liệu. Kỹ sư dữ liệu cần "làm điều đúng khi không ai nhìn, vì một ngày nào đó mọi người sẽ nhìn". Tác giả hy vọng nhiều tổ chức khuyến khích văn hoá đạo đức và quyền riêng tư tốt.

Tác động lên vòng đời: kỹ sư dữ liệu phải đảm bảo dataset **che giấu PII** (thông tin nhận dạng cá nhân) và thông tin nhạy cảm khác; **thiên lệch (bias)** có thể được nhận diện và theo dõi khi dataset được biến đổi. Yêu cầu pháp lý và mức phạt tuân thủ chỉ tăng; cần đảm bảo tài sản dữ liệu tuân thủ ngày càng nhiều quy định như GDPR, CCPA. Hãy làm việc này nghiêm túc.

## Tóm tắt

| Chủ đề | Ý chính |
|---|---|
| Security | Least privilege; văn hoá bảo mật; mã hoá, tokenization, masking; thành thạo IAM |
| Governance | Ba trụ: discoverability, security, accountability |
| Metadata | Business, technical, operational, reference; công cụ tự động không thay hết con người |
| Accountability | Giao một người phụ trách dữ liệu, có thể ở nhiều cấp độ |
| Data quality | Accuracy, completeness, timeliness; ranh giới con người và công nghệ |
| MDM | Golden record cho thực thể kinh doanh; thường do nhóm chuyên trách |
| Mô hình hoá | Đừng bỏ; chọn mức mô hình phù hợp; tránh WORN và data swamp |
| Lineage | Audit trail, hỗ trợ debug và tuân thủ (ví dụ xoá dữ liệu người dùng) |
| Tích hợp | API đa dụng, pipeline phức tạp dần dẫn tới orchestration |
| Vòng đời | Cloud và GDPR/CCPA buộc phải quản lý archival và huỷ dữ liệu |
| Đạo đức, quyền riêng tư | Che PII, theo dõi bias, tuân thủ quy định |
