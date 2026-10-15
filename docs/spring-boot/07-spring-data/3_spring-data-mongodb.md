---
sidebar_position: 3
title: "3. Spring Data MongoDB"
---

# Spring Data MongoDB

Spring Data MongoDB mang mô hình repository quen thuộc sang MongoDB — cơ sở dữ liệu dạng document (tài liệu JSON/BSON) không cần schema cố định. Bài này hướng dẫn map class Java thành document bằng `@Document`, dùng `MongoRepository` và query method, truy vấn linh hoạt bằng `MongoTemplate`, quyết định giữa **nhúng (embedded)** và **tham chiếu (reference)**, cùng cách khai báo index. Đây là kỹ năng cần khi dữ liệu của bạn có cấu trúc thay đổi linh hoạt hoặc cần đọc nhanh theo từng "khối" thông tin.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Thiết kế theo cách đọc** — dữ liệu luôn đọc cùng nhau thì **nhúng** vào một document; dữ liệu lớn, dùng chung, thay đổi độc lập thì **tham chiếu** bằng id.
- ⭐ **`spring.data.mongodb.auto-index-creation` mặc định `false`** — `@Indexed` sẽ không tự tạo index nếu không bật; production nên tạo index bằng migration/script.
- **`MongoRepository`** cho CRUD và query method; **`MongoTemplate`** cho truy vấn động, update từng phần, aggregation.
- **`@Id` kiểu `String`** được map với `ObjectId` của MongoDB; field `_class` được lưu thêm để biết kiểu Java khi đọc lại.
- **Transaction nhiều document** chỉ chạy trên replica set, và cần khai báo `MongoTransactionManager`.

:::

---

## Mục lục

- [Vì sao Spring Data MongoDB ra đời?](#vì-sao-spring-data-mongodb-ra-đời)
- [Cấu hình và map document](#cấu-hình-và-map-document)
- [MongoRepository và query method](#mongorepository-và-query-method)
- [MongoTemplate](#mongotemplate)
- [Embedded hay Reference](#embedded-hay-reference)
- [Index](#index)

---

## Vì sao Spring Data MongoDB ra đời?

**Vấn đề:** Dùng MongoDB Java Driver trực tiếp, bạn phải tự chuyển qua lại giữa `Document` (giống `Map`) và object Java, tự viết từng câu lọc:

```java
MongoCollection<Document> col = mongoClient.getDatabase("shop").getCollection("products");

Document doc = new Document("name", product.getName())
        .append("price", product.getPrice())
        .append("tags", product.getTags());
col.insertOne(doc);

List<Product> result = new ArrayList<>();
for (Document d : col.find(Filters.and(
        Filters.eq("category", "phone"),
        Filters.lt("price", 10_000_000)))) {
    Product p = new Product();
    p.setId(d.getObjectId("_id").toHexString());
    p.setName(d.getString("name"));
    // ... map tay từng field
    result.add(p);
}
```

Mỗi collection lại một đống code map tay, dễ lệch tên field, khó test.

**Giải pháp:** Spring Data MongoDB tự map object, cho dùng repository như JPA:

```java
@Document("products")
public record Product(@Id String id, String name, String category,
                      long price, List<String> tags) {}

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByCategoryAndPriceLessThan(String category, long price);
}
```

:::tip[Dùng thực tế]

- Danh mục sản phẩm mà mỗi loại có thuộc tính khác nhau (điện thoại có RAM, áo có size).
- Lưu log, sự kiện, lịch sử thao tác với khối lượng ghi lớn.
- Nội dung CMS, bài viết có bình luận nhúng.
- Hồ sơ người dùng với cấu hình tuỳ biến (preferences) dạng lồng nhau.

:::

---

## Cấu hình và map document

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>
```

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://shop:${MONGO_PASSWORD}@localhost:27017/shop?authSource=admin
      auto-index-creation: false
```

Map class sang document:

```java
@Document(collection = "orders")
public class Order {

    @Id
    private String id;                 // map với _id (ObjectId)

    @Field("customer_email")
    private String customerEmail;      // đổi tên field trong document

    @Indexed
    private String status;

    private List<OrderItem> items;     // nhúng: lưu như mảng con

    private Address shippingAddress;   // nhúng: lưu như document con

    @CreatedDate
    private Instant createdAt;

    @Version
    private Long version;              // optimistic locking

    @Transient
    private BigDecimal cachedTotal;    // không lưu xuống DB
}

public record OrderItem(String sku, String name, int quantity, long price) {}
public record Address(String street, String district, String city) {}
```

Document được lưu sẽ trông như sau:

```json
{
  "_id": "665f1c...",
  "customer_email": "an@example.com",
  "status": "PAID",
  "items": [
    { "sku": "IP15", "name": "iPhone 15", "quantity": 1, "price": 22000000 }
  ],
  "shippingAddress": { "street": "12 Lê Lợi", "district": "Quận 1", "city": "HCM" },
  "createdAt": "2026-10-01T03:00:00Z",
  "version": 0,
  "_class": "com.example.shop.order.Order"
}
```

:::tip[Ví dụ đời thường]

Database quan hệ giống **tủ hồ sơ chia ngăn**: thông tin khách một ngăn, đơn hàng một ngăn, địa chỉ một ngăn — muốn xem đầy đủ phải lục nhiều ngăn rồi ghép lại (JOIN). MongoDB giống **bìa hồ sơ của từng khách**: kẹp sẵn đơn hàng, địa chỉ trong cùng một bìa — rút ra là đọc được ngay.

:::

---

## MongoRepository và query method

```java
public interface OrderRepository extends MongoRepository<Order, String> {

    List<Order> findByStatus(String status);

    List<Order> findByCustomerEmailOrderByCreatedAtDesc(String email);

    // truy vấn vào field lồng nhau
    List<Order> findByShippingAddressCity(String city);

    // truy vấn phần tử trong mảng nhúng
    List<Order> findByItemsSku(String sku);

    Page<Order> findByStatusIn(Collection<String> statuses, Pageable pageable);

    // viết query MongoDB dạng JSON
    @Query("{ 'status': ?0, 'items.price': { $gte: ?1 } }")
    List<Order> findExpensive(String status, long minItemPrice);

    // chỉ lấy một số field
    @Query(value = "{ 'status': ?0 }", fields = "{ 'customer_email': 1, 'createdAt': 1 }")
    List<Order> findLight(String status);

    long countByStatus(String status);
}
```

Chuỗi trong `@Query` là cú pháp lọc của MongoDB (theo **tên field trong document**), không phải JPQL. Tham số đánh số `?0`, `?1` theo thứ tự.

:::warning[Lỗi hay gặp]

- `@Field("customer_email")` nhưng trong `@Query` lại viết `'customerEmail'` → không khớp gì. Query JSON dùng tên **trong DB**; derived query dùng tên **thuộc tính Java**.
- Query method trên field chưa có index → MongoDB quét toàn bộ collection (COLLSCAN), chậm khi dữ liệu lớn.
- `findAll()` trên collection hàng triệu document → hết bộ nhớ. Luôn phân trang hoặc dùng `Stream` kèm try-with-resources.

:::

---

## MongoTemplate

`MongoTemplate` là API cấp thấp hơn, linh hoạt hơn, dùng khi:

- Điều kiện lọc **động** (người dùng chọn tiêu chí).
- Cập nhật **từng phần** (chỉ đổi 1 field) mà không đọc cả document.
- Thao tác nguyên tử như tăng bộ đếm, đẩy phần tử vào mảng.
- Aggregation pipeline (group, lookup, thống kê).

```java
@Service
@RequiredArgsConstructor
public class OrderSearchService {

    private final MongoTemplate mongoTemplate;

    public List<Order> search(String status, String city, Long minTotal) {
        Query query = new Query();
        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }
        if (city != null) {
            query.addCriteria(Criteria.where("shippingAddress.city").is(city));
        }
        if (minTotal != null) {
            query.addCriteria(Criteria.where("items.price").gte(minTotal));
        }
        query.with(Sort.by(Sort.Direction.DESC, "createdAt")).limit(50);
        return mongoTemplate.find(query, Order.class);
    }

    public void markShipped(String orderId) {
        Query q = Query.query(Criteria.where("_id").is(orderId).and("status").is("PAID"));
        Update u = new Update().set("status", "SHIPPED").currentDate("shippedAt");
        UpdateResult r = mongoTemplate.updateFirst(q, u, Order.class);
        if (r.getModifiedCount() == 0) {
            throw new IllegalStateException("Đơn không ở trạng thái PAID");
        }
    }

    public void addItem(String orderId, OrderItem item) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(orderId)),
                new Update().push("items", item),
                Order.class);
    }
}
```

Aggregation — doanh thu theo thành phố:

```java
public record CityRevenue(String city, long revenue) {}

public List<CityRevenue> revenueByCity() {
    Aggregation agg = Aggregation.newAggregation(
            Aggregation.match(Criteria.where("status").is("PAID")),
            Aggregation.unwind("items"),
            Aggregation.group("shippingAddress.city")
                    .sum(ArithmeticOperators.Multiply.valueOf("items.price")
                            .multiplyBy("items.quantity")).as("revenue"),
            Aggregation.project("revenue").and("city").previousOperation(),
            Aggregation.sort(Sort.Direction.DESC, "revenue"));
    return mongoTemplate.aggregate(agg, "orders", CityRevenue.class).getMappedResults();
}
```

| | `MongoRepository` | `MongoTemplate` |
|---|---|---|
| Phong cách | Khai báo interface | Viết code truy vấn |
| Truy vấn động | Hạn chế (có Query by Example, Querydsl) | Tốt |
| Update từng phần | Không — `save` ghi đè cả document | Có (`$set`, `$inc`, `$push`) |
| Aggregation | `@Aggregation` đơn giản | Đầy đủ |

Hai cách dùng song song được: tạo **custom repository fragment** — interface `OrderRepositoryCustom` + class `OrderRepositoryCustomImpl` dùng `MongoTemplate`, rồi `OrderRepository extends MongoRepository<...>, OrderRepositoryCustom`.

:::warning[Lỗi hay gặp]

`repository.save(order)` ghi **đè toàn bộ document**. Hai request cùng đọc rồi cùng save sẽ làm mất thay đổi của nhau. Dùng `@Version` (optimistic locking) hoặc `updateFirst` với `$set` cho từng field.

:::

---

## Embedded hay Reference

Đây là quyết định thiết kế quan trọng nhất khi dùng MongoDB.

**Embedded (nhúng)** — document con nằm trong document cha:

```java
@Document("posts")
public class Post {
    @Id private String id;
    private String title;
    private List<Comment> comments;   // nhúng
}
```

**Reference (tham chiếu)** — chỉ lưu id, có hai cách:

```java
@Document("orders")
public class Order {
    @Id private String id;

    // Cách 1: tự lưu id, tự truy vấn khi cần (đơn giản, rõ ràng nhất)
    private String customerId;

    // Cách 2: @DocumentReference — Spring tự tra document khi đọc
    @DocumentReference(lazy = true)
    private Customer customer;
}
```

Còn `@DBRef` là cách cũ (lưu dạng `{ $ref, $id }`), hiện nên ưu tiên `@DocumentReference` hoặc tự lưu id.

| Tiêu chí | Embedded | Reference |
|----------|----------|-----------|
| Đọc cùng nhau | Một lần đọc | Nhiều lần đọc hoặc `$lookup` |
| Kích thước | Giới hạn 16MB mỗi document | Không ảnh hưởng document cha |
| Dữ liệu dùng chung nhiều nơi | Bị lặp, sửa phải sửa nhiều chỗ | Một bản duy nhất |
| Mảng con tăng không giới hạn | Không nên | Nên |
| Nguyên tử khi ghi | Có (một document) | Cần transaction |

Quy tắc ngón tay cái:

- Quan hệ **"chứa"** và số phần tử có giới hạn (địa chỉ giao hàng, dòng đơn hàng) → nhúng.
- Quan hệ **"dùng chung"** hoặc số phần tử tăng mãi (khách hàng, sản phẩm, hàng nghìn bình luận) → tham chiếu.
- Có thể **nhúng một bản tóm tắt** (snapshot): đơn hàng lưu tên và giá sản phẩm tại thời điểm mua, kèm `productId` để tra chi tiết.

:::tip[Ví dụ đời thường]

Hoá đơn siêu thị in **tên và giá món hàng tại lúc mua** (nhúng snapshot) — dù tuần sau giá đổi, hoá đơn cũ vẫn đúng. Nhưng hoá đơn chỉ ghi **mã thẻ thành viên** của bạn (tham chiếu), không chép cả hồ sơ khách hàng vào.

:::

:::warning[Lỗi hay gặp]

- Nhúng mảng tăng không giới hạn (mọi bình luận của bài viết hot) → document phình tới giới hạn 16MB và mỗi lần ghi đều chậm.
- Lạm dụng `@DBRef`/`@DocumentReference` không lazy trong danh sách → mỗi phần tử một câu truy vấn, chính là N+1 query.

:::

---

## Index

```java
@Document("users")
@CompoundIndex(name = "city_age_idx", def = "{ 'city': 1, 'age': -1 }")
public class User {

    @Id private String id;

    @Indexed(unique = true)
    private String email;

    private String city;
    private int age;

    @Indexed(expireAfter = "30d")      // TTL index: tự xoá sau 30 ngày
    private Instant lastSeenAt;

    @TextIndexed
    private String bio;
}
```

Từ Spring Data MongoDB 3.0, **tự tạo index bị tắt mặc định**. Muốn bật cho môi trường dev:

```yaml
spring:
  data:
    mongodb:
      auto-index-creation: true
```

Hoặc tạo bằng code khi khởi động:

```java
@Component
@RequiredArgsConstructor
public class IndexInitializer implements ApplicationRunner {

    private final MongoTemplate mongoTemplate;

    @Override
    public void run(ApplicationArguments args) {
        mongoTemplate.indexOps(User.class)
                .ensureIndex(new Index().on("email", Sort.Direction.ASC).unique());
    }
}
```

Với production, nên quản lý index bằng công cụ migration (Mongock, script mongosh trong pipeline) để kiểm soát thời điểm build index trên collection lớn.

:::warning[Lỗi hay gặp]

- Khai báo `@Indexed(unique = true)` nhưng không bật auto-index → không có ràng buộc duy nhất, dữ liệu trùng lọt vào.
- Thứ tự field trong compound index quan trọng: index `{city, age}` hỗ trợ lọc theo `city` hoặc `city + age`, **không** hỗ trợ lọc riêng `age`.

:::
