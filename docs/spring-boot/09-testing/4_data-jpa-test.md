---
sidebar_position: 4
title: "4. @DataJpaTest"
---

# @DataJpaTest

`@DataJpaTest` là một **test slice** chỉ nạp tầng JPA: entity, repository, `EntityManager`, DataSource — bỏ qua controller, service và mọi thứ khác. Nó giúp kiểm tra câu truy vấn, mapping entity, ràng buộc database một cách nhanh và cô lập. Bài này giải thích khái niệm test slice, lựa chọn giữa H2 và Testcontainers, vai trò của `@AutoConfigureTestDatabase`, cách dùng `TestEntityManager`, cơ chế rollback mặc định, và điểm qua các slice khác như `@JsonTest`, `@RestClientTest`.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Mỗi test chạy trong transaction và rollback khi kết thúc** — dữ liệu không rò sang test khác; nhưng cũng có nghĩa lỗi chỉ lộ ra khi flush có thể bị bỏ sót nếu không `flush()`.
- ⭐ **Mặc định thay DataSource bằng database nhúng** (H2/HSQLDB/Derby) — muốn dùng PostgreSQL thật qua Testcontainers phải đặt `@AutoConfigureTestDatabase(replace = Replace.NONE)`.
- **`TestEntityManager`** để chuẩn bị dữ liệu, `flush()` và `clear()` để buộc Hibernate chạy SQL thật thay vì đọc từ cache cấp 1.
- **Test slice** chỉ nạp phần cần thiết — nhanh hơn `@SpringBootTest`, lỗi cô lập rõ ràng.
- **Các slice khác**: `@WebMvcTest`, `@JsonTest`, `@RestClientTest`, `@DataJdbcTest`, `@DataMongoTest`, `@JdbcTest`, `@WebFluxTest`...

:::

---

## Mục lục

- [Vì sao cần @DataJpaTest?](#vì-sao-cần-datajpatest)
- [Test slice là gì?](#test-slice-là-gì)
- [Test repository đầu tiên](#test-repository-đầu-tiên)
- [TestEntityManager, flush và clear](#testentitymanager-flush-và-clear)
- [Rollback mặc định](#rollback-mặc-định)
- [H2 hay Testcontainers](#h2-hay-testcontainers)
- [Các test slice khác](#các-test-slice-khác)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao cần @DataJpaTest?

**Vấn đề:** Tầng dữ liệu có nhiều thứ chỉ kiểm tra được khi chạy với database:

```java
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Tên field sai? JPQL sai cú pháp? join fetch có gây trùng dòng?
    @Query("select distinct o from Order o join fetch o.items where o.status = :status")
    List<Order> findWithItems(@Param("status") OrderStatus status);

    // Điều kiện Between có bao gồm hai đầu không? Múi giờ?
    List<Order> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
}
```

Unit test mock `OrderRepository` thì không kiểm tra được gì ở trên. Còn `@SpringBootTest` thì nạp cả ứng dụng (controller, security, Kafka...) chỉ để test vài câu truy vấn — chậm, và lỗi ở tầng khác cũng làm test fail.

**Giải pháp:** `@DataJpaTest` dựng một context nhỏ chỉ gồm JPA:

```java
@DataJpaTest
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @Test
    void findWithItems_returnsOrdersWithItemsLoaded() {
        // chuẩn bị dữ liệu, gọi query, assert
    }
}
```

:::tip[Dùng thực tế]

- Kiểm tra derived query, `@Query` JPQL/native trả đúng kết quả.
- Kiểm tra mapping: quan hệ, cascade, `orphanRemoval`, enum, cột JSON, converter.
- Kiểm tra ràng buộc: unique, not null, khoá ngoại ném lỗi đúng lúc.
- Kiểm tra migration Flyway/Liquibase chạy được trên schema thật.

:::

---

## Test slice là gì?

Spring Boot chia ứng dụng thành các **lát cắt** (slice) theo tầng. Mỗi annotation slice chỉ bật các auto-configuration và quét các bean liên quan tới tầng đó.

`@DataJpaTest` bật:

- Auto-configuration DataSource, JPA/Hibernate, Spring Data JPA, transaction.
- Flyway/Liquibase (nếu có trên classpath).
- Quét `@Entity` và repository.
- Bean `TestEntityManager`.
- Log SQL (`spring.jpa.show-sql=true` theo mặc định của slice).

Không nạp: `@Service`, `@Controller`, `@Component` thông thường, cấu hình web, security.

:::tip[Ví dụ đời thường]

Test slice giống **khám chuyên khoa**: đau mắt thì vào khoa mắt, bác sĩ chỉ dùng thiết bị khám mắt — nhanh và đúng chỗ. `@SpringBootTest` giống **khám tổng quát**: kỹ, toàn diện, nhưng mất cả buổi sáng.

:::

---

## Test repository đầu tiên

```java
@Entity
@Table(name = "products", uniqueConstraints = @UniqueConstraint(columnNames = "sku"))
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sku;

    @Column(nullable = false)
    private String name;

    private BigDecimal price;

    private boolean active = true;

    protected Product() {}

    public Product(String sku, String name, BigDecimal price) {
        this.sku = sku;
        this.name = name;
        this.price = price;
    }
    // getter
}

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySku(String sku);

    List<Product> findByActiveTrueAndPriceLessThanOrderByPriceAsc(BigDecimal max);
}
```

```java
@DataJpaTest
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private TestEntityManager em;

    @Test
    void findBySku_returnsProduct() {
        em.persistAndFlush(new Product("IP15", "iPhone 15", new BigDecimal("22000000")));

        Optional<Product> found = productRepository.findBySku("IP15");

        assertThat(found).isPresent()
                .get().extracting(Product::getName).isEqualTo("iPhone 15");
    }

    @Test
    void findCheapActive_sortedByPrice() {
        em.persist(new Product("A", "Ốp lưng", new BigDecimal("150000")));
        em.persist(new Product("B", "Cáp sạc", new BigDecimal("90000")));
        em.persist(new Product("C", "Tai nghe", new BigDecimal("2500000")));
        em.flush();

        List<Product> result = productRepository
                .findByActiveTrueAndPriceLessThanOrderByPriceAsc(new BigDecimal("1000000"));

        assertThat(result).extracting(Product::getSku).containsExactly("B", "A");
    }

    @Test
    void duplicateSku_violatesUniqueConstraint() {
        em.persistAndFlush(new Product("IP15", "iPhone 15", BigDecimal.TEN));

        assertThatThrownBy(() ->
                productRepository.saveAndFlush(new Product("IP15", "Bản trùng", BigDecimal.ONE)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
```

Loại exception tuỳ vào việc lỗi đi qua lớp nào: qua repository proxy (`saveAndFlush`), Spring dịch lỗi sang `DataIntegrityViolationException` của Spring; còn gọi `em.flush()` trực tiếp trên `TestEntityManager` thì nhận exception gốc của JPA/Hibernate (thường là `PersistenceException` bọc `org.hibernate.exception.ConstraintViolationException`).

---

## TestEntityManager, flush và clear

`TestEntityManager` là lớp bọc `EntityManager` có thêm vài method tiện cho test:

| Method | Tác dụng |
|--------|----------|
| `persist(entity)` | Đưa entity vào persistence context (chưa chắc đã INSERT) |
| `persistAndFlush(entity)` | Persist và flush ngay — SQL INSERT chạy thật |
| `persistAndGetId(entity)` | Persist và trả id |
| `find(Class, id)` | Tìm theo id |
| `flush()` | Đẩy mọi thay đổi xuống DB |
| `clear()` | Xoá persistence context (cache cấp 1) |

Vì sao cần `flush()` và `clear()`? Hibernate có **cache cấp 1**: entity vừa lưu vẫn nằm trong bộ nhớ. Nếu không clear, `findById` trả lại đúng object trong bộ nhớ mà **không chạy SQL**, nên test không phát hiện được lỗi mapping.

```java
@Test
void orderWithItems_isMappedCorrectly() {
    Order order = new Order("an@example.com");
    order.addItem(new OrderItem("IP15", 1, new BigDecimal("22000000")));
    order.addItem(new OrderItem("CASE", 2, new BigDecimal("150000")));
    Long id = em.persistAndGetId(order, Long.class);

    em.flush();
    em.clear();      // bắt buộc đọc lại từ DB

    Order loaded = orderRepository.findById(id).orElseThrow();
    assertThat(loaded.getItems()).hasSize(2);
    assertThat(loaded.getTotal()).isEqualByComparingTo("22300000");
}
```

:::warning[Lỗi hay gặp]

- Không `flush()` → INSERT/UPDATE chưa chạy, ràng buộc unique/not null chưa được kiểm tra, test pass sai. Sau đó transaction rollback nên lỗi không bao giờ lộ ra.
- Không `clear()` → đọc lại từ cache cấp 1, cột bị map sai tên vẫn pass.
- Test `@Modifying @Query` (bulk update) rồi đọc entity cũ trong cùng persistence context → thấy giá trị cũ. Gọi `em.clear()` trước khi đọc lại.

:::

---

## Rollback mặc định

`@DataJpaTest` được đánh dấu `@Transactional`: mỗi method test chạy trong một transaction và **rollback** khi kết thúc. Ưu điểm: mỗi test bắt đầu với database sạch, không cần dọn dẹp.

Muốn commit thật (ví dụ để kiểm tra dữ liệu bằng công cụ bên ngoài, hoặc test hành vi sau commit):

```java
@Test
@Commit                // hoặc @Rollback(false)
void seedData() { ... }
```

Tắt transaction cho cả class (khi test code tự quản lý transaction, hoặc test `@TransactionalEventListener` sau commit):

```java
@DataJpaTest
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class OutboxRepositoryTest {

    @AfterEach
    void cleanUp(@Autowired OutboxRepository repo) {
        repo.deleteAll();     // không rollback nên phải tự dọn
    }
}
```

Chuẩn bị dữ liệu bằng script SQL:

```java
@Test
@Sql("/sql/products-seed.sql")
void searchByKeyword() { ... }
```

Script chạy trong cùng transaction của test và cũng được rollback.

:::warning[Lỗi hay gặp]

Rollback che giấu lỗi chỉ xảy ra khi commit: lỗi lazy loading ngoài transaction, trigger/deferred constraint của DB, listener `AFTER_COMMIT`. Với những luồng này, cần test không transaction hoặc integration test bằng `@SpringBootTest`.

:::

---

## H2 hay Testcontainers

Mặc định `@DataJpaTest` có `@AutoConfigureTestDatabase(replace = Replace.ANY)`: nếu có database nhúng (H2, HSQLDB, Derby) trên classpath, nó **thay** DataSource bạn cấu hình bằng database nhúng.

**Dùng H2:**

```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>
```

Không cần cấu hình gì thêm, test chạy ngay, không cần Docker.

**Dùng Testcontainers (database giống production):**

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class OrderRepositoryPostgresTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private OrderRepository orderRepository;

    @Test
    void jsonbQuery_works() { ... }
}
```

`Replace.NONE` báo Boot **không thay** DataSource — dùng kết nối do `@ServiceConnection` cung cấp. Gom container vào `@TestConfiguration` dùng chung (như bài `@SpringBootTest`) rồi `@Import` để nhiều test class dùng lại.

| Tiêu chí | H2 | Testcontainers |
|----------|----|----------------|
| Tốc độ khởi động | Rất nhanh | Chậm hơn (khởi động container, vài giây lần đầu) |
| Cần Docker | Không | Có |
| Giống production | Một phần (chế độ tương thích `MODE=PostgreSQL` vẫn khác) | Đúng engine, đúng phiên bản |
| Tính năng riêng (JSONB, window function, sequence, `ON CONFLICT`) | Thường không hỗ trợ | Đầy đủ |
| Migration Flyway viết cho PostgreSQL | Có thể lỗi cú pháp | Chạy đúng |

Khuyến nghị: dự án thật nên dùng **Testcontainers** cho test tầng dữ liệu; H2 chỉ hợp khi truy vấn thuần JPQL đơn giản và môi trường CI không có Docker.

:::warning[Lỗi hay gặp]

- Thêm Testcontainers nhưng quên `Replace.NONE` trong khi H2 vẫn nằm trên classpath → test chạy trên H2 mà tưởng là PostgreSQL. Đặt `Replace.NONE` tường minh để chắc chắn ở mọi phiên bản.
- Để `spring.jpa.hibernate.ddl-auto=create-drop` trong test trong khi production dùng Flyway → schema test khác schema thật. Cho test chạy cùng migration Flyway và `ddl-auto=validate`.

:::

---

## Các test slice khác

| Annotation | Nạp gì | Dùng để test |
|------------|--------|--------------|
| `@WebMvcTest` | Controller, advice, filter, Jackson, MockMvc | Tầng web Spring MVC |
| `@WebFluxTest` | Controller WebFlux, `WebTestClient` | Tầng web reactive |
| `@DataJpaTest` | JPA, repository, `TestEntityManager` | Tầng dữ liệu JPA |
| `@DataJdbcTest` | Spring Data JDBC | Repository Spring Data JDBC |
| `@JdbcTest` | DataSource, `JdbcTemplate`, `JdbcClient` | DAO dùng SQL thuần |
| `@DataMongoTest` | MongoDB, `MongoTemplate`, repository | Tầng dữ liệu MongoDB |
| `@DataRedisTest` | Redis repository | Tầng dữ liệu Redis |
| `@JsonTest` | Jackson/Gson/JSON-B, `JacksonTester` | Serialize/deserialize JSON |
| `@RestClientTest` | `RestTemplateBuilder`, `RestClient.Builder`, `MockRestServiceServer` | Client gọi API bên ngoài |

**`@JsonTest`** — kiểm tra định dạng JSON của DTO:

```java
@JsonTest
class OrderDtoJsonTest {

    @Autowired
    private JacksonTester<OrderDto> json;

    @Test
    void serialize() throws Exception {
        OrderDto dto = new OrderDto(1L, new BigDecimal("150000"), LocalDate.of(2026, 10, 14));

        JsonContent<OrderDto> result = json.write(dto);

        assertThat(result).extractingJsonPathStringValue("$.orderDate").isEqualTo("2026-10-14");
        assertThat(result).doesNotHaveJsonPath("$.internalNote");
    }

    @Test
    void deserialize() throws Exception {
        String content = """
                { "id": 1, "total": 150000, "orderDate": "2026-10-14" }
                """;
        assertThat(json.parseObject(content).total()).isEqualByComparingTo("150000");
    }
}
```

**`@RestClientTest`** — kiểm tra client gọi API ngoài mà không gọi mạng thật:

```java
@Component
public class ExchangeRateClient {

    private final RestClient restClient;

    public ExchangeRateClient(RestClient.Builder builder) {
        this.restClient = builder.baseUrl("https://rates.example.com").build();
    }

    public BigDecimal usdToVnd() {
        RateResponse res = restClient.get().uri("/v1/rates/USD-VND").retrieve().body(RateResponse.class);
        return res.rate();
    }
}
```

```java
@RestClientTest(ExchangeRateClient.class)
class ExchangeRateClientTest {

    @Autowired
    private ExchangeRateClient client;

    @Autowired
    private MockRestServiceServer server;

    @Test
    void usdToVnd() {
        server.expect(requestTo("https://rates.example.com/v1/rates/USD-VND"))
              .andRespond(withSuccess("""
                      { "pair": "USD-VND", "rate": 25400 }
                      """, MediaType.APPLICATION_JSON));

        assertThat(client.usdToVnd()).isEqualByComparingTo("25400");
        server.verify();
    }

    @Test
    void serverError_throws() {
        server.expect(requestTo("https://rates.example.com/v1/rates/USD-VND"))
              .andRespond(withServerError());

        assertThatThrownBy(() -> client.usdToVnd())
                .isInstanceOf(HttpServerErrorException.class);
    }
}
```

`MockRestServiceServer` chỉ hoạt động khi client được tạo từ builder do Boot cấu hình (inject `RestClient.Builder`/`RestTemplateBuilder`), không phải `RestClient.create()`.

:::tip[Ví dụ đời thường]

Mỗi slice là một **bài kiểm tra từng môn**: Toán (`@DataJpaTest`), Văn (`@WebMvcTest`), Ngoại ngữ (`@JsonTest`). Thi từng môn giúp biết chính xác yếu ở đâu; còn `@SpringBootTest` giống **thi tổng hợp cuối kỳ** — cần thiết, nhưng điểm thấp thì chưa biết yếu môn nào.

:::

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `@DataJpaTest` nạp những gì và khác `@SpringBootTest` thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`@DataJpaTest` chỉ bật auto-configuration liên quan JPA: DataSource, Hibernate, Spring Data JPA repository, transaction, Flyway/Liquibase, `TestEntityManager`; mặc định thay DataSource bằng DB nhúng và bọc mỗi test trong transaction rollback. Nó không nạp service, controller, security. `@SpringBootTest` nạp toàn bộ ứng dụng. `@DataJpaTest` nhanh hơn và cô lập lỗi tầng dữ liệu tốt hơn.

</details>

**2. Vì sao cần gọi `flush()` và `clear()` trong test repository?**

<details className="qa">
<summary>Xem đáp án</summary>

Hibernate trì hoãn việc ghi xuống DB đến khi flush, và giữ entity trong cache cấp 1. Không `flush()` thì câu INSERT/UPDATE chưa chạy nên ràng buộc DB chưa được kiểm tra; vì test rollback cuối cùng, lỗi có thể không bao giờ lộ. Không `clear()` thì lần đọc lại trả object trong bộ nhớ thay vì truy vấn DB, nên lỗi mapping cột không bị phát hiện.

</details>

**3. `@AutoConfigureTestDatabase` dùng để làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó điều khiển việc thay DataSource trong test. Mặc định của `@DataJpaTest` là `replace = Replace.ANY`: thay DataSource bằng database nhúng nếu có trên classpath. Đặt `Replace.NONE` để giữ DataSource đã cấu hình — cần khi dùng Testcontainers hoặc một database thật cho test.

</details>

**4. Ưu nhược điểm của H2 so với Testcontainers trong test tầng dữ liệu?**

<details className="qa">
<summary>Xem đáp án</summary>

H2 khởi động cực nhanh, không cần Docker, nhưng chỉ giả lập một phần SQL của PostgreSQL/MySQL; tính năng riêng (JSONB, window function, `ON CONFLICT`, kiểu dữ liệu) và migration viết cho DB thật có thể lỗi hoặc pass sai. Testcontainers chạy đúng engine production nên đáng tin hơn, đổi lại cần Docker và chậm hơn lúc khởi động — giảm bằng cách dùng chung container qua context caching.

</details>

**5. Rollback mặc định của `@DataJpaTest` có nhược điểm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó che giấu các hành vi chỉ xảy ra khi commit: deferred constraint, trigger, `@TransactionalEventListener(phase = AFTER_COMMIT)`, lỗi lazy loading ngoài transaction (vì cả test nằm trong transaction nên lazy loading luôn chạy được). Với các trường hợp này, tắt transaction cho test (`Propagation.NOT_SUPPORTED`) và tự dọn dữ liệu, hoặc viết integration test.

</details>

**6. Kể tên một số test slice khác và công dụng.**

<details className="qa">
<summary>Xem đáp án</summary>

`@WebMvcTest` cho controller Spring MVC với MockMvc; `@WebFluxTest` cho controller reactive; `@JsonTest` kiểm tra serialize/deserialize JSON bằng `JacksonTester`; `@RestClientTest` kiểm tra client HTTP với `MockRestServiceServer`; `@DataJdbcTest`, `@JdbcTest`, `@DataMongoTest`, `@DataRedisTest` cho các tầng dữ liệu tương ứng. Mỗi slice chỉ nạp phần cần thiết nên test nhanh và tập trung.

</details>
