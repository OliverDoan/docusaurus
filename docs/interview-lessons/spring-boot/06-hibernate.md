---
sidebar_position: 6
title: "6. Hibernate"
---

# 6. Hibernate

## 1. Vòng đời Entity

Bài học: [1. Vòng đời Entity](../../spring-boot/06-hibernate/1_entity-lifecycle.md)

**1. JPA và Hibernate khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

JPA (Jakarta Persistence) là đặc tả gồm interface và annotation (`EntityManager`, `@Entity`, JPQL). Hibernate là một hiện thực của đặc tả đó, đồng thời có thêm tính năng riêng (`Session`, `@DynamicUpdate`, `@BatchSize`, filter...). Spring Boot dùng Hibernate làm hiện thực JPA mặc định.

</details>

**2. Mô tả các trạng thái của entity.**

<details className="qa">
<summary>Xem đáp án</summary>

Transient: object mới tạo, chưa gắn với persistence context, DB không biết. Managed: nằm trong persistence context, mọi thay đổi được theo dõi và đồng bộ khi flush. Detached: từng managed nhưng context đã đóng hoặc bị `detach`/`clear`, thay đổi không được theo dõi. Removed: managed nhưng đã đánh dấu xoá, DELETE chạy khi flush.

</details>

**3. persist và merge khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`persist` biến chính object truyền vào thành managed, dùng cho entity mới; không trả về gì. `merge` copy trạng thái của object (thường detached) vào một bản managed — tải từ DB hoặc lấy trong context — và trả về bản managed đó; object truyền vào vẫn detached. `merge` với entity chưa có trong DB sẽ INSERT.

</details>

**4. Dirty checking là gì? Vì sao sửa entity không gọi save vẫn được lưu?**

<details className="qa">
<summary>Xem đáp án</summary>

Hibernate lưu snapshot trạng thái khi entity được nạp vào persistence context. Lúc flush (trước commit), nó so trạng thái hiện tại với snapshot và tự sinh UPDATE cho field thay đổi. Vì vậy entity managed trong transaction được lưu mà không cần gọi `save()`.

</details>

**5. Flush khác commit thế nào? Khi nào Hibernate tự flush?**

<details className="qa">
<summary>Xem đáp án</summary>

Flush gửi câu SQL xuống DB trong transaction hiện tại; commit kết thúc transaction và làm thay đổi vĩnh viễn. Sau flush vẫn rollback được. Ở chế độ AUTO, Hibernate flush trước commit, trước khi chạy query có thể bị ảnh hưởng bởi thay đổi chưa flush, và khi gọi `flush()` thủ công.

</details>

**6. Persistence context đóng vai trò cache như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Đó là cache cấp 1, gắn với một `EntityManager` (thường là một transaction). `find` cùng id lần hai trả về object đã có mà không query lại, và đảm bảo cùng id là cùng một instance. Cache này mất khi context đóng. Cache cấp 2 (dùng chung giữa các session) là tính năng riêng, phải bật thêm.

</details>

**7. Vì sao GenerationType.IDENTITY làm mất batch insert?**

<details className="qa">
<summary>Xem đáp án</summary>

Với IDENTITY, id chỉ có sau khi DB thực hiện INSERT. Hibernate cần id ngay khi `persist` để đưa entity vào persistence context, nên buộc phải INSERT ngay từng câu, không gom lại thành batch được. `SEQUENCE` với `allocationSize` cho phép lấy trước khối id, giữ được batch insert.

</details>

---

## 2. Quan hệ giữa Entity

Bài học: [2. Quan hệ giữa Entity](../../spring-boot/06-hibernate/2_relationships.md)

**1. Owning side là gì? mappedBy dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong quan hệ hai chiều chỉ có một khoá ngoại, nên JPA chọn một phía làm owning side — phía giữ `@JoinColumn` (với 1-N là phía `@ManyToOne`). Hibernate chỉ dựa vào owning side để ghi khoá ngoại. `mappedBy` đánh dấu phía inverse, chỉ ra field nào ở owning side quản lý quan hệ; thay đổi chỉ ở phía inverse sẽ không được lưu.

</details>

**2. N+1 query là gì và cách xử lý?**

<details className="qa">
<summary>Xem đáp án</summary>

Là khi 1 câu query lấy N bản ghi, rồi truy cập quan hệ của từng bản ghi sinh thêm N câu query. Xử lý: `JOIN FETCH` trong JPQL, `@EntityGraph`, batch fetching (`default_batch_fetch_size` hoặc `@BatchSize`) để gom thành câu `IN`, hoặc DTO projection chỉ lấy cột cần thiết. Phát hiện bằng log SQL hoặc thống kê Hibernate.

</details>

**3. Vì sao nên để @ManyToOne là LAZY?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định của `@ManyToOne` là EAGER, nên mọi truy vấn entity đều kéo theo quan hệ, kể cả khi không dùng. Với JPQL, EAGER thường được tải bằng câu query phụ cho từng bản ghi, gây N+1. EAGER không thể tắt theo từng query, còn LAZY có thể bật tải theo use case bằng fetch join hoặc entity graph.

</details>

**4. CascadeType.REMOVE khác orphanRemoval thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`CascadeType.REMOVE` xoá con khi entity cha bị xoá. `orphanRemoval = true` còn xoá con khi nó bị gỡ khỏi collection của cha (trở thành mồ côi), kể cả khi cha vẫn tồn tại. `orphanRemoval` phù hợp khi con không có ý nghĩa nếu tách khỏi cha, như dòng hàng của đơn hàng.

</details>

**5. LazyInitializationException xảy ra khi nào và xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi truy cập quan hệ LAZY chưa được tải sau khi persistence context đã đóng (entity detached). Xử lý: tải sẵn dữ liệu cần dùng trong transaction bằng fetch join/entity graph, và chuyển sang DTO ngay trong tầng service. Tránh dùng EAGER, `enable_lazy_load_no_trans` hay dựa vào Open Session in View để che lỗi.

</details>

**6. Vì sao không nên dùng List cho @ManyToMany?**

<details className="qa">
<summary>Xem đáp án</summary>

Hibernate coi `List` không có cột thứ tự là "bag"; khi xoá một phần tử, nó không xác định được dòng cụ thể trong bảng nối nên xoá hết rồi chèn lại phần còn lại. Với `Set`, nó xoá đúng một dòng. Ngoài ra fetch join nhiều bag cùng lúc gây `MultipleBagFetchException`.

</details>

**7. Phân trang khi fetch join collection có vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Join với collection nhân số dòng kết quả, nên `LIMIT/OFFSET` ở SQL không còn đúng theo số entity cha. Hibernate vì vậy bỏ phân trang ở SQL, tải toàn bộ rồi phân trang trong bộ nhớ và cảnh báo HHH90003004. Cách đúng: query phân trang lấy danh sách id trước, sau đó fetch join theo các id đó, hoặc dùng batch fetching.

</details>

---

## 3. Transaction

Bài học: [3. Transaction](../../spring-boot/06-hibernate/3_transactions.md)

**1. @Transactional hoạt động như thế nào bên dưới?**

<details className="qa">
<summary>Xem đáp án</summary>

Spring tạo proxy (JDK dynamic proxy hoặc CGLIB) bao quanh bean. Lời gọi qua proxy đi vào `TransactionInterceptor`, nó dùng `PlatformTransactionManager` (với JPA là `JpaTransactionManager`) để mở hoặc tham gia transaction theo propagation, gắn connection/EntityManager vào thread, gọi method thật, rồi commit hoặc rollback theo rollback rules.

</details>

**2. Vì sao @Transactional không có tác dụng khi gọi method trong cùng lớp?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì lời gọi `this.method()` đi thẳng vào object gốc, không qua proxy nên interceptor không chạy. Khắc phục: tách method sang bean khác, dùng `TransactionTemplate`, hoặc (ít khuyến khích) tự inject chính mình qua proxy, hoặc dùng AspectJ weaving thay cho proxy.

</details>

**3. Exception nào làm transaction rollback mặc định?**

<details className="qa">
<summary>Xem đáp án</summary>

`RuntimeException` và `Error`. Checked exception mặc định vẫn commit. Muốn rollback với checked exception phải khai báo `rollbackFor`. Exception bị bắt và không ném lại thì proxy không thấy, transaction vẫn commit.

</details>

**4. REQUIRED và REQUIRES_NEW khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`REQUIRED` tham gia transaction đang có (cùng commit/rollback), chưa có thì mở mới. `REQUIRES_NEW` luôn mở transaction mới độc lập, tạm dừng transaction bên ngoài; commit/rollback của nó không phụ thuộc bên ngoài. `REQUIRES_NEW` dùng thêm một kết nối DB, dùng nhiều dễ cạn connection pool.

</details>

**5. UnexpectedRollbackException xảy ra khi nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi method bên trong (cùng transaction, propagation REQUIRED) ném RuntimeException làm transaction bị đánh dấu rollback-only, nhưng method bên ngoài bắt exception đó và cố commit. Spring phát hiện transaction đã rollback-only nên rollback và ném `UnexpectedRollbackException` để báo cho caller biết.

</details>

**6. Isolation level là gì? Mặc định trong Spring là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Là mức cô lập giữa các transaction đồng thời, quyết định có xảy ra dirty read, non-repeatable read, phantom read hay không. Spring mặc định `Isolation.DEFAULT`, tức dùng mức mặc định của database: READ COMMITTED với PostgreSQL, Oracle, SQL Server; REPEATABLE READ với MySQL InnoDB.

</details>

**7. Optimistic locking và pessimistic locking khác nhau ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Optimistic dùng cột `@Version`, không khoá khi đọc; lúc UPDATE thêm điều kiện `version = ?`, nếu không dòng nào bị ảnh hưởng thì ném `OptimisticLockException`. Phù hợp khi xung đột hiếm. Pessimistic khoá dòng ngay khi đọc (`SELECT ... FOR UPDATE`), transaction khác phải chờ; phù hợp khi xung đột thường xuyên và thao tác ngắn, nhưng có rủi ro chờ khoá và deadlock.

</details>

**8. readOnly = true có tác dụng gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Với Hibernate, flush mode chuyển sang MANUAL và không giữ snapshot cho dirty checking, giảm bộ nhớ và CPU. Cờ read-only cũng được truyền cho JDBC connection, có thể dùng để định tuyến sang replica. Nó là tối ưu hoá và thể hiện ý định, không phải cơ chế bảo đảm chặn ghi.

</details>
