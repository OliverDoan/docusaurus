---
sidebar_position: 2
title: "2. Hệ thống lưu trữ: phân tán, nhất quán, file và block"
---

# Hệ thống lưu trữ: phân tán, nhất quán, file và block

Hệ thống lưu trữ nằm ở tầng trừu tượng cao hơn nguyên liệu thô: ví dụ đĩa từ là nguyên liệu, còn HDFS hay object storage của các cloud là hệ thống dùng đĩa từ đó. Bài này đi qua nền tảng chung (lưu trữ một máy so với phân tán, nhất quán eventual so với strong) rồi hai loại lưu trữ quen thuộc: **file storage** và **block storage**.

**Tương tự đơn giản:** file storage như tủ hồ sơ có thư mục lồng nhau; block storage như một dãy ô đánh số mà bạn tự quyết định cất gì vào ô nào.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Lưu trữ phân tán** cho quy mô lớn và dư thừa (redundancy) nhưng buộc phải đối mặt với bài toán **nhất quán**: eventual consistency (nhanh, có thể đọc dữ liệu cũ) so với strong consistency (đúng, nhưng chậm hơn).
- ⭐ **BASE** (basically available, soft-state, eventual consistency) là "đối cực" của ACID.
- **File** = luồng byte hữu hạn, cho append và truy cập ngẫu nhiên; lưu trong cây thư mục.
- **Block** = đơn vị địa chỉ nhỏ nhất của đĩa (thường 4.096 byte); là nền của database giao dịch và ổ khởi động VM.
- **EBS** bền và nhân bản; **instance store** nhanh, rẻ nhưng mất dữ liệu khi VM tắt.

:::

---

## Mục lục

- 1. Một máy so với lưu trữ phân tán
- 2. Eventual so với strong consistency
- 3. File storage
- 4. Block storage
- Tóm tắt

## 1. Một máy so với lưu trữ phân tán

Khi cách lưu trữ và truy cập dữ liệu phức tạp tới mức một server không còn đủ, ta phân phối dữ liệu lên nhiều server — **distributed storage** (lưu trữ phân tán). Đây là một hệ phân tán có mục đích lưu dữ liệu theo kiểu phân tán.

Nó điều phối nhiều server để lưu, truy xuất và xử lý dữ liệu nhanh hơn và ở quy mô lớn hơn, đồng thời có **redundancy** (dư thừa) phòng khi một server không khả dụng. Object storage, Apache Spark và các cloud data warehouse đều dựa trên kiến trúc lưu trữ phân tán.

Hệ quả là kỹ sư dữ liệu phải hiểu mô hình nhất quán của hệ phân tán đang dùng.

## 2. Eventual so với strong consistency

Khi dữ liệu rải trên nhiều server, làm sao giữ cho nó nhất quán? Việc nhân bản thay đổi tới mọi node cần thời gian, nên luôn có sự cân bằng giữa việc đọc được dữ liệu **mới nhất** và đọc được dữ liệu "gần như mới nhất".

Sách đã nhắc **ACID** từ Chương 5. Đối lập là **BASE**:

| Thành phần BASE | Ý nghĩa |
|---|---|
| **B**asically available | Không đảm bảo nhất quán, nhưng đọc/ghi được thực hiện theo nỗ lực tối đa: phần lớn thời gian vẫn có dữ liệu nhất quán |
| **S**oft-state | Trạng thái giao dịch "mờ": không chắc đã commit hay chưa |
| **E**ventual consistency | Đến một lúc nào đó, đọc dữ liệu sẽ trả về giá trị nhất quán |

**Vì sao chấp nhận eventual consistency?** Đó là cái giá thường gặp khi muốn mở rộng ngang (nhiều node) để xử lý khối lượng lớn: bạn lấy dữ liệu nhanh mà không cần kiểm tra bản mới nhất trên mọi node.

**Strong consistency** thì ngược lại: mọi lần ghi vào bất kỳ node nào đều được phân phối theo cơ chế đồng thuận (consensus) trước, và mọi lần đọc đều trả về giá trị nhất quán. Dùng khi chấp nhận độ trễ truy vấn cao hơn và cần dữ liệu đúng mọi lần đọc.

**Quyết định nhất quán được đưa ra ở ba nơi:**

1. Bản thân công nghệ database đặt mức nhất quán nền.
2. Tham số cấu hình của database.
3. Nhiều database cho cấu hình nhất quán ở cấp từng truy vấn. Ví dụ DynamoDB hỗ trợ đọc eventually consistent và đọc strongly consistent; loại sau chậm hơn và tốn tài nguyên hơn nên chỉ dùng khi cần.

Kỹ sư dữ liệu cần hiểu sâu database của mình xử lý nhất quán ra sao, và có thể phải thương lượng yêu cầu nhất quán với các bên liên quan — vừa là vấn đề công nghệ vừa là vấn đề tổ chức.

*Ví dụ minh hoạ (do người viết ghi chép thêm, không phải của sách):* một bảng số dư tài khoản cần strong consistency; còn bộ đếm lượt xem video thì eventual consistency là đủ.

## 3. File storage

**File** là thực thể dữ liệu có đặc tính đọc, ghi, tham chiếu riêng, được phần mềm và hệ điều hành sử dụng. Sách định nghĩa file có ba đặc điểm:

- **Finite length:** luồng byte có độ dài hữu hạn.
- **Append operations:** có thể nối thêm byte vào file, tới giới hạn của hệ lưu trữ.
- **Random access:** đọc từ vị trí bất kỳ hoặc ghi cập nhật tại vị trí bất kỳ.

Object storage cũng giống file storage nhưng khác biệt then chốt (chỉ giữ đặc điểm đầu tiên). Sách nhấn mạnh với kỹ thuật dữ liệu hiện nay object storage quan trọng hơn nhiều.

**Cây thư mục:** hệ file tổ chức file thành cây thư mục, ví dụ `/Users/matthewhousley/output.txt`. Hệ điều hành bắt đầu từ thư mục gốc `/`, tìm `Users`, rồi `matthewhousley`, cuối cùng là `output.txt`. Mỗi thư mục được lưu như **metadata** gồm tên từng thực thể con, thông tin quyền và con trỏ tới thực thể thật. Để tìm file, hệ điều hành đọc metadata từng cấp và lần theo con trỏ.

**Lời khuyên cho pipeline:** nếu buộc phải dùng mô hình file, hãy cẩn thận với trạng thái (state) và cố dùng môi trường ephemeral (tạm thời). Ngay cả khi phải xử lý file trên server gắn đĩa, hãy dùng object storage cho lưu trữ trung gian giữa các bước. Dành xử lý file thủ công, mức thấp cho các bước nhập một lần hoặc giai đoạn khám phá khi phát triển pipeline.

### 3.1. Ổ đĩa cục bộ (local disk storage)

Dạng quen nhất: hệ file do hệ điều hành quản lý trên phân vùng SSD hay HDD cục bộ; NTFS (Windows) và ext4 (Linux) là ví dụ. Hệ điều hành lo lưu thư mục, file, metadata. Hệ file được thiết kế để dễ phục hồi nếu mất điện giữa lúc ghi, dù phần chưa ghi vẫn mất.

Thường hỗ trợ **read-after-write consistency** đầy đủ (đọc ngay sau khi ghi trả về dữ liệu vừa ghi) và có chiến lược khoá để quản lý nhiều tiến trình cùng ghi một file. Có thể có thêm journaling, snapshot, dư thừa, trải hệ file qua nhiều đĩa, mã hoá toàn đĩa, nén.

### 3.2. Network-attached storage (NAS)

NAS cung cấp hệ file cho client qua mạng. Rất phổ biến cho server, thường đi kèm phần cứng giao diện NAS riêng. Truy cập qua mạng chịu phạt hiệu năng, nhưng ảo hoá lưu trữ đem lại: dư thừa và độ tin cậy, kiểm soát tài nguyên chi tiết, gộp nhiều đĩa thành volume ảo lớn, chia sẻ file giữa nhiều máy. Cần biết mô hình nhất quán của NAS, nhất là khi nhiều client cùng truy cập một dữ liệu.

Phương án thay thế phổ biến là **storage area network (SAN)**, cho truy cập mức block, không có lớp hệ file (xem mục 4).

### 3.3. Cloud filesystem services

Dịch vụ hệ file cloud được quản lý hoàn toàn, dùng cho nhiều VM và ứng dụng, có thể cả client ngoài môi trường cloud. Đừng nhầm với lưu trữ chuẩn gắn vào VM (thường là block storage với hệ file do hệ điều hành VM quản lý). Hoạt động giống NAS, nhưng chuyện mạng, quản cụm đĩa, lỗi, cấu hình do nhà cung cấp cloud lo.

Ví dụ **Amazon Elastic File System (EFS)**: phơi bày qua giao thức NFS 4 (giống NAS), tự động mở rộng, tính tiền theo dung lượng dùng, không cần đặt trước. Có read-after-write consistency cục bộ (đọc từ máy vừa ghi) và **open-after-close consistency** trên toàn hệ file: khi ứng dụng đóng file, người đọc sau đó sẽ thấy các thay đổi đã lưu.

## 4. Block storage

**Block storage** về cơ bản là loại lưu trữ thô do SSD và đĩa từ cung cấp. Trên cloud, block storage ảo hoá là chuẩn cho VM, cho phép kiểm soát chi tiết kích thước, khả năng mở rộng và độ bền hơn so với đĩa thô.

**Block** là đơn vị dữ liệu nhỏ nhất mà đĩa có thể địa chỉ hoá. Đĩa cũ thường 512 byte dữ liệu hữu ích; nay đa số 4.096 byte — ghi kém chi tiết hơn nhưng giảm mạnh chi phí quản lý block. Block thường chứa thêm bit phát hiện/sửa lỗi và metadata.

Trên đĩa từ, block xếp theo hình học trên mặt đĩa: hai block cùng track đọc không cần di chuyển đầu đọc, khác track thì cần seek. Với SSD vẫn có "seek" giữa các block nhưng không đáng kể so với đĩa từ.

### 4.1. Ứng dụng của block storage

- **Database giao dịch** thường truy cập đĩa ở mức block để bố trí dữ liệu tối ưu. Với database hướng hàng, ban đầu hàng được ghi thành dòng liên tục; SSD khiến chuyện phức tạp hơn, nhưng vẫn dựa vào hiệu năng truy cập ngẫu nhiên cao của block device.
- **Ổ khởi động (boot disk)** của VM cloud mặc định là block storage (thường được ảo hoá).

### 4.2. RAID

**RAID** điều khiển đồng thời nhiều đĩa để tăng độ bền dữ liệu, tăng hiệu năng và gộp dung lượng. Mảng hiện ra với hệ điều hành như một block device duy nhất. Có nhiều sơ đồ mã hoá và parity, tuỳ cân bằng mong muốn giữa băng thông hiệu dụng và khả năng chịu lỗi (chịu được nhiều đĩa hỏng).

### 4.3. Storage area network (SAN)

SAN cung cấp block device ảo qua mạng, thường từ một pool lưu trữ. Cho phép mở rộng chi tiết, tăng hiệu năng, sẵn sàng và độ bền. Có thể gặp khi làm việc với lưu trữ on-premises; cũng có phiên bản cloud (mục dưới).

### 4.4. Cloud virtualized block storage

Giống SAN nhưng không phải lo cụm SAN và chi tiết mạng. Ví dụ chuẩn là **Amazon Elastic Block Store (EBS)**, lưu trữ mặc định cho VM Amazon EC2.

- Có nhiều bậc dịch vụ; chỉ số hiệu năng tính bằng IOPS và throughput. Bậc cao dùng SSD; bậc dùng đĩa từ có IOPS thấp hơn nhưng rẻ hơn mỗi GB.
- Volume EBS lưu dữ liệu **tách biệt với server chủ** nhưng cùng zone (để nhanh, độ trễ thấp). Vì vậy volume còn nguyên khi EC2 tắt, server chủ hỏng, thậm chí instance bị xoá. Phù hợp cho database cần độ bền.
- EBS nhân bản dữ liệu tới ít nhất hai máy chủ riêng, bảo vệ khi đĩa hỏng — nhưng **không chống được sự cố cả availability zone**.
- **Snapshot tức thời** (point-in-time) khi đang dùng đĩa: EBS "đóng băng" trạng thái các block lúc chụp, client vẫn tiếp tục dùng. Snapshot sau bản đầy đủ đầu tiên là **differential** (chỉ ghi block thay đổi lên S3), tiết kiệm chi phí và thời gian sao lưu.
- Mở rộng cao: một số lớp volume lên tới 64 TiB, 256.000 IOPS, 4.000 MiB/s (tại thời điểm viết sách).

### 4.5. Local instance volumes (instance store)

Đĩa block gắn vật lý vào host chạy VM. Rất rẻ (đã nằm trong giá VM với EC2 instance store), độ trễ thấp, IOPS cao; hoạt động như đĩa gắn trực tiếp vào server trong data center.

**Khác biệt then chốt:** khi VM tắt hoặc bị xoá (cố ý hay không), nội dung đĩa **mất sạch** — để VM mới không đọc được dữ liệu của khách hàng khác. Ngoài ra:

- Không nhân bản, nên đĩa vật lý hỏng có thể làm mất/hỏng dữ liệu dù VM vẫn chạy.
- Không hỗ trợ snapshot hay tính năng sao lưu.

Dù vậy rất hữu ích khi dùng như **cache cục bộ**. Ví dụ sách nêu: chạy AWS EMR trên EC2, một job tạm thời đọc dữ liệu từ S3, lưu tạm trong hệ file phân tán chạy trên các instance, xử lý rồi ghi kết quả về S3. Hệ file của EMR đã có nhân bản và dư thừa, đóng vai trò cache chứ không phải kho lâu dài, nên instance store hoàn toàn phù hợp và còn nhanh hơn vì dữ liệu xử lý cục bộ không đi qua mạng.

**Cách suy nghĩ khuyến nghị:** hãy nghĩ tới kịch bản xấu nhất. Đĩa cục bộ hỏng thì sao? VM/cluster tắt nhầm thì sao? Sự cố cả zone hoặc region thì sao? Nếu mất dữ liệu trên đĩa cục bộ không gây hậu quả nghiêm trọng thì lưu cục bộ là lựa chọn rẻ và nhanh; thêm biện pháp đơn giản như checkpoint định kỳ lên S3 để tránh mất dữ liệu.

## Tóm tắt

| Chủ đề | Ý chính |
|---|---|
| Lưu trữ phân tán | Nhiều server phối hợp: quy mô lớn, dư thừa, nhưng phát sinh bài toán nhất quán |
| Eventual (BASE) | Nhanh, mở rộng ngang dễ, có thể đọc bản cũ tạm thời |
| Strong consistency | Đọc luôn đúng, đổi lại độ trễ cao hơn; chọn ở mức công nghệ, cấu hình hoặc từng truy vấn |
| File storage | Luồng byte hữu hạn, append, truy cập ngẫu nhiên; cây thư mục; local, NAS, cloud filesystem (EFS) |
| Block storage | Đơn vị 4.096 byte; nền cho database giao dịch và boot disk; RAID, SAN, EBS |
| EBS so với instance store | EBS bền, nhân bản, có snapshot; instance store rẻ, nhanh, mất khi VM tắt (hợp làm cache) |
