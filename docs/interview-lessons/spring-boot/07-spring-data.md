---
sidebar_position: 7
title: "7. Spring Data"
---

# 7. Spring Data

## 1. Spring Data JPA

Bài học: [1. Spring Data JPA](../../spring-boot/07-spring-data/1_spring-data-jpa.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Spring Data JPA tạo cài đặt cho interface repository bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi khởi động, Spring Data quét các interface kế thừa `Repository` và tạo **JDK dynamic proxy** cho mỗi interface. Lời gọi method CRUD chung được chuyển cho `SimpleJpaRepository` (dùng `EntityManager` bên dưới). Method tìm kiếm riêng được phân tích: nếu có `@Query` thì dùng câu đó, nếu không thì parse tên method thành JPQL (`PartTree`). Việc phân tích diễn ra **lúc khởi động**, nên tên method sai sẽ làm ứng dụng fail ngay.

</details>

**2. Khác nhau giữa `CrudRepository`, `ListCrudRepository`, `PagingAndSortingRepository` và `JpaRepository`?**

<details className="qa">
<summary>Xem đáp án</summary>

- `CrudRepository`: CRUD cơ bản, trả về `Iterable`.
- `ListCrudRepository` (Spring Data 3): như trên nhưng trả về `List`.
- `PagingAndSortingRepository`: thêm `findAll(Sort)` và `findAll(Pageable)`; từ Spring Data 3 không còn kế thừa `CrudRepository`.
- `JpaRepository`: dành riêng cho JPA, gộp tất cả và thêm `flush`, `saveAndFlush`, `deleteAllInBatch`, `getReferenceById`.

Thực tế dùng `JpaRepository` cho tiện; dùng `Repository` khi muốn giới hạn method được phép gọi.

</details>

**3. Khi nào dùng derived query, khi nào dùng `@Query`, khi nào dùng `Specification`?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Derived query**: điều kiện cố định, đơn giản (1–3 điều kiện), tên method vẫn đọc được.
- **`@Query`**: điều kiện cố định nhưng phức tạp (join fetch, group by, subquery) hoặc cần native SQL.
- **`Specification`** (hoặc Querydsl): điều kiện **động** — người dùng chọn lọc theo tiêu chí nào thì mới thêm tiêu chí đó.

</details>

**4. `Page` và `Slice` khác nhau thế nào? Khi nào chọn `Slice`?**

<details className="qa">
<summary>Xem đáp án</summary>

`Page` chạy thêm một câu `select count(...)` để biết tổng số phần tử và tổng số trang. `Slice` chỉ lấy `size + 1` dòng để biết còn trang sau hay không, không đếm tổng. Chọn `Slice` cho infinite scroll hoặc bảng rất lớn mà câu count tốn kém.

</details>

**5. Vì sao câu UPDATE trong `@Query` cần `@Modifying`, và rủi ro gì với persistence context?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định `@Query` được thực thi như câu SELECT (`getResultList`). `@Modifying` báo Spring dùng `executeUpdate()`. Câu bulk update đi thẳng xuống DB, **bỏ qua persistence context**: entity đã load trước đó trong cùng transaction vẫn giữ giá trị cũ. Dùng `clearAutomatically = true` (và `flushAutomatically = true` nếu có thay đổi chưa flush) để tránh đọc dữ liệu cũ. Ngoài ra bulk update không kích hoạt entity listener, version (optimistic lock) và auditing.

</details>

**6. Projection giúp tối ưu gì? Interface projection khác DTO projection ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Projection chỉ SELECT các cột cần thiết, giảm dữ liệu truyền và không tạo entity được quản lý (không dirty checking). Interface projection: Spring tạo proxy implement interface, tiện và hỗ trợ lồng nhau. DTO/record projection: object thuần, dễ test, dùng constructor expression trong JPQL. Tránh open projection (`@Value` với SpEL) vì nó load cả entity.

</details>

**7. Auditing trong Spring Data JPA hoạt động thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Bật `@EnableJpaAuditing`, gắn `@EntityListeners(AuditingEntityListener.class)` lên entity (thường qua lớp cha `@MappedSuperclass`). Listener bắt sự kiện `@PrePersist`/`@PreUpdate` để điền `@CreatedDate`, `@LastModifiedDate`. Với `@CreatedBy`/`@LastModifiedBy` cần một bean `AuditorAware` trả về người dùng hiện tại (thường lấy từ `SecurityContextHolder`).

</details>

---

## 2. Spring Data JDBC

Bài học: [2. Spring Data JDBC](../../spring-boot/07-spring-data/2_spring-data-jdbc.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Spring Data JDBC khác Spring Data JPA ở những điểm nào quan trọng nhất?**

<details className="qa">
<summary>Xem đáp án</summary>

Spring Data JDBC không có persistence context, không dirty checking, không lazy loading, không cache cấp 1. Muốn ghi phải gọi `save()`; load entity là load toàn bộ aggregate. Quan hệ chỉ tồn tại bên trong aggregate, giữa aggregate dùng id. Không tự sinh schema. Kết quả là hành vi dễ đoán hơn, ít "magic" hơn, đổi lại phải tự quản lý nhiều hơn.

</details>

**2. Aggregate root là gì và Spring Data JDBC áp dụng nó thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Aggregate là cụm object được đối xử như một đơn vị nhất quán; aggregate root là điểm truy cập duy nhất vào cụm đó. Trong Spring Data JDBC, mỗi repository tương ứng một aggregate root; các entity con (ví dụ `OrderLine`) được lưu/xoá cùng root và không có repository riêng. Tham chiếu sang aggregate khác dùng `AggregateReference` hoặc chỉ giữ id.

</details>

**3. Khi cập nhật một aggregate có collection con, Spring Data JDBC sinh SQL thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó UPDATE bảng gốc, sau đó **xoá toàn bộ** các dòng con của gốc đó rồi INSERT lại theo trạng thái hiện tại của collection. Cách này đơn giản và đúng, nhưng tốn kém nếu collection lớn — đó là lý do aggregate phải được thiết kế nhỏ.

</details>

**4. `JdbcClient` là gì, khác gì `JdbcTemplate`?**

<details className="qa">
<summary>Xem đáp án</summary>

`JdbcClient` (Spring Framework 6.1, Spring Boot 3.2) là API fluent bọc `JdbcTemplate` và `NamedParameterJdbcTemplate`. Nó hỗ trợ cả tham số vị trí lẫn tham số đặt tên, tự map kết quả sang record/bean theo tên cột, và có các method kết thúc rõ ràng như `.list()`, `.single()`, `.optional()`, `.update()`. `JdbcTemplate` vẫn hữu ích cho batch update và các trường hợp cần callback cấp thấp.

</details>

**5. Làm sao Spring Data JDBC biết nên INSERT hay UPDATE khi gọi `save()`?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định dựa vào id: id `null` (hoặc 0 với kiểu nguyên thuỷ) là entity mới → INSERT; ngược lại → UPDATE. Nếu có `@Version` thì dựa vào version. Với id do ứng dụng tự sinh (UUID), cần implement `Persistable.isNew()`, dùng `@Version`, hoặc gọi trực tiếp `JdbcAggregateTemplate.insert()` — nếu không sẽ UPDATE một dòng không tồn tại.

</details>

**6. Khi nào bạn chọn Spring Data JDBC cho một dự án mới?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi domain có ranh giới aggregate rõ ràng, quan hệ không chằng chịt, đội muốn kiểm soát SQL và muốn entity bất biến; hoặc microservice nhỏ không cần các tính năng nâng cao của Hibernate (lazy loading, cache cấp 2, kế thừa entity). Nếu domain có nhiều quan hệ hai chiều phức tạp và đội đã thạo Hibernate, JPA vẫn là lựa chọn hợp lý.

</details>

---

## 3. Spring Data MongoDB

Bài học: [3. Spring Data MongoDB](../../spring-boot/07-spring-data/3_spring-data-mongodb.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Khi nào nên nhúng (embedded) và khi nào nên tham chiếu (reference) trong MongoDB?**

<details className="qa">
<summary>Xem đáp án</summary>

Nhúng khi dữ liệu con thuộc về cha, luôn được đọc cùng cha và số lượng có giới hạn (địa chỉ, dòng đơn hàng). Tham chiếu khi dữ liệu dùng chung ở nhiều nơi, thay đổi độc lập, hoặc tăng không giới hạn (khách hàng, bình luận của bài viết hot). Có thể kết hợp: nhúng một bản snapshot nhỏ và giữ id để tra chi tiết.

</details>

**2. `MongoRepository` và `MongoTemplate` khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`MongoRepository` là interface khai báo, có sẵn CRUD và query method suy từ tên, phù hợp truy vấn cố định. `MongoTemplate` là API lập trình, dùng cho truy vấn động, cập nhật từng phần (`$set`, `$inc`, `$push`), aggregation pipeline, thao tác nguyên tử. Thường dùng repository làm mặc định và thêm custom fragment dùng `MongoTemplate` cho phần phức tạp.

</details>

**3. Vì sao khai báo `@Indexed` mà index không được tạo?**

<details className="qa">
<summary>Xem đáp án</summary>

Từ Spring Data MongoDB 3.0, tự động tạo index bị tắt mặc định (`spring.data.mongodb.auto-index-creation=false`) để tránh việc ứng dụng khởi động lại build index trên collection lớn gây ảnh hưởng production. Cần bật thuộc tính này, hoặc tạo index bằng `IndexOperations`/công cụ migration.

</details>

**4. `save()` trong Spring Data MongoDB có rủi ro gì khi nhiều request cùng cập nhật?**

<details className="qa">
<summary>Xem đáp án</summary>

`save()` thay thế toàn bộ document. Hai request đọc cùng phiên bản, mỗi bên sửa một field rồi save → bên lưu sau đè mất thay đổi của bên trước (lost update). Cách khắc phục: thêm `@Version` để optimistic locking ném lỗi khi xung đột, hoặc dùng `updateFirst` với toán tử `$set` chỉ cập nhật field cần đổi.

</details>

**5. MongoDB có hỗ trợ transaction không? Dùng trong Spring thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Thao tác trên **một document** luôn nguyên tử. Transaction nhiều document được hỗ trợ từ MongoDB 4.0 trên replica set (4.2 với sharded cluster). Trong Spring cần khai báo bean `MongoTransactionManager` rồi dùng `@Transactional` như bình thường. Tuy vậy, thiết kế tốt (nhúng dữ liệu cần nhất quán vào một document) thường giảm nhu cầu transaction.

</details>

**6. Field `_class` trong document là gì? Có nên bỏ không?**

<details className="qa">
<summary>Xem đáp án</summary>

Spring Data MongoDB lưu thêm `_class` chứa tên lớp Java để khi đọc lại biết khởi tạo kiểu nào — cần thiết khi một collection chứa nhiều kiểu con (kế thừa đa hình). Nếu collection chỉ có một kiểu, có thể bỏ bằng cách cấu hình `MappingMongoConverter` với `DefaultMongoTypeMapper(null)` hoặc dùng `@TypeAlias` để lưu tên ngắn, tránh phụ thuộc vào tên package khi refactor.

</details>
