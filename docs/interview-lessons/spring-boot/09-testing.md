---
sidebar_position: 9
title: "9. Testing"
---

# 9. Testing

## 1. @SpringBootTest

Bài học: [1. @SpringBootTest](../../spring-boot/09-testing/1_spring-boot-test.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `@SpringBootTest` khác test slice như `@WebMvcTest` thế nào? Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`@SpringBootTest` nạp toàn bộ context (mọi bean, mọi auto-configuration) — dùng cho integration test nhiều tầng. Test slice chỉ nạp các bean liên quan một tầng (`@WebMvcTest`: controller, advice, filter, converter; `@DataJpaTest`: JPA và repository) nên nhanh hơn và cô lập lỗi tốt hơn. Dùng slice để test kỹ từng tầng, dùng `@SpringBootTest` cho các luồng quan trọng xuyên tầng.

</details>

**2. Giải thích các giá trị của `webEnvironment`.**

<details className="qa">
<summary>Xem đáp án</summary>

`MOCK` (mặc định): tạo môi trường web giả lập, không mở cổng, test qua `MockMvc`. `RANDOM_PORT`: khởi động server nhúng thật trên cổng ngẫu nhiên, test qua `TestRestTemplate`/`WebTestClient`. `DEFINED_PORT`: như trên nhưng dùng cổng cấu hình. `NONE`: không tạo môi trường web, dùng cho test tầng service/batch.

</details>

**3. Context caching là gì? Điều gì làm nó mất tác dụng?**

<details className="qa">
<summary>Xem đáp án</summary>

Spring TestContext cache ApplicationContext theo khoá cấu hình và tái sử dụng cho các test class có cùng khoá, tránh dựng lại context tốn nhiều giây. Cache bị vỡ khi cấu hình khác nhau: tập `@MockitoBean`/`@MockBean` khác, property/profile khác, `@Import` khác, hoặc `@DirtiesContext` đánh dấu context bẩn. Cách giảm: dùng lớp cha test chung, thống nhất profile, hạn chế mock trong integration test.

</details>

**4. Vì sao `@Transactional` trên test với `RANDOM_PORT` không rollback dữ liệu?**

<details className="qa">
<summary>Xem đáp án</summary>

Rollback tự động chỉ áp dụng cho transaction gắn với luồng chạy test. Với `RANDOM_PORT`, test gửi HTTP request thật tới server; request được xử lý trên luồng của Tomcat, với transaction riêng đã commit. Transaction của test không bao được transaction đó. Với `MOCK` + MockMvc thì request chạy cùng luồng nên rollback được (trừ khi code mở transaction mới hoặc chạy async).

</details>

**5. `@ServiceConnection` giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Trước Boot 3.1, phải dùng `@DynamicPropertySource` để chép URL, user, password của container vào `spring.datasource.*`. `@ServiceConnection` cho Boot tự sinh bean `ConnectionDetails` (ví dụ `JdbcConnectionDetails`, `KafkaConnectionDetails`) từ container, ưu tiên hơn property, giảm code lặp và hỗ trợ sẵn nhiều dịch vụ: PostgreSQL, MySQL, MongoDB, Redis, Kafka, RabbitMQ, Elasticsearch...

</details>

**6. Vì sao nên dùng Testcontainers thay vì H2 cho integration test?**

<details className="qa">
<summary>Xem đáp án</summary>

H2 chỉ giả lập một phần cú pháp và hành vi của database thật; các tính năng riêng (JSONB, window function, kiểu dữ liệu, hành vi khoá, migration Flyway viết cho PostgreSQL) có thể pass trên H2 nhưng fail trên production hoặc ngược lại. Testcontainers chạy đúng engine và phiên bản production, giúp test đáng tin hơn; đổi lại cần Docker và chậm hơn chút khi khởi động.

</details>

---

## 2. Mock Bean (@MockitoBean / @MockBean)

Bài học: [2. Mock Bean (@MockitoBean / @MockBean)](../../spring-boot/09-testing/2_mock-bean.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `@Mock` và `@MockitoBean` (hoặc `@MockBean`) khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`@Mock` là annotation của Mockito, tạo mock trong unit test không có Spring; tiêm vào đối tượng cần test qua `@InjectMocks` hoặc constructor. `@MockitoBean` là của Spring Test, tạo mock và **đăng ký vào ApplicationContext**, thay thế bean cùng kiểu, để mọi bean phụ thuộc nhận mock. `@Mock` nhanh hơn nhiều; `@MockitoBean` dùng khi cần context (slice test, integration test).

</details>

**2. Vì sao `@MockBean` bị deprecated? Thay bằng gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Spring Framework 6.2 đưa vào **Bean Override API** chung cho TestContext, kèm `@MockitoBean`, `@MockitoSpyBean` và `@TestBean`. Vì Spring Framework đã có giải pháp chuẩn, Spring Boot 3.4 deprecated `@MockBean`/`@SpyBean` của riêng Boot và xoá chúng ở Boot 4. Chuyển đổi chủ yếu là đổi import sang `org.springframework.test.context.bean.override.mockito`; lưu ý `@MockitoBean` không đặt được trên field của class `@Configuration`.

</details>

**3. Mock bean ảnh hưởng tới tốc độ bộ test như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Tập bean bị mock là một phần của khoá cache context. Mỗi tổ hợp mock khác nhau buộc Spring dựng một context mới thay vì dùng lại, mỗi lần tốn vài giây. Bộ test có nhiều class với các tổ hợp `@MockitoBean` khác nhau sẽ chậm đáng kể. Giảm bằng cách ưu tiên unit test, gom mock vào lớp cha dùng chung, hoặc giả lập dịch vụ ngoài ở tầng mạng (WireMock).

</details>

**4. Mock và spy khác nhau thế nào? Khi nào dùng spy?**

<details className="qa">
<summary>Xem đáp án</summary>

Mock là đối tượng giả hoàn toàn: method chưa stub trả giá trị mặc định (`null`, 0, rỗng). Spy bọc đối tượng thật: method chưa stub chạy code thật. Dùng spy khi muốn giữ hành vi thật nhưng cần verify một lời gọi hoặc ghi đè một method nhỏ. Lạm dụng spy thường là dấu hiệu class cần tách nhỏ. Khi stub spy, dùng `doReturn().when()` để tránh gọi code thật.

</details>

**5. Strict stubs trong Mockito là gì? Gặp `UnnecessaryStubbingException` nên xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`MockitoExtension` mặc định dùng strict stubs: báo lỗi khi có stub không được sử dụng trong test, hoặc stub với tham số không khớp lời gọi thực tế. Điều này giúp phát hiện test thừa hoặc test đang kiểm tra sai nhánh. Cách xử lý đúng là xoá stub thừa hoặc sửa tham số; chỉ dùng `lenient()` khi có lý do chính đáng (ví dụ stub chung trong `@BeforeEach` mà không phải test nào cũng dùng).

</details>

**6. Có nên mock repository khi test service không?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong unit test của service: có, để test logic nghiệp vụ nhanh và cô lập. Nhưng mock repository không kiểm tra được câu truy vấn, mapping entity, ràng buộc DB — những thứ đó cần `@DataJpaTest` hoặc integration test với Testcontainers. Kết hợp cả hai: unit test cho logic, slice/integration test cho tầng dữ liệu. Tránh mock những thứ bạn không sở hữu theo cách quá chi tiết (ví dụ mock `EntityManager`).

</details>

---

## 3. MockMvc

Bài học: [3. MockMvc](../../spring-boot/09-testing/3_mock-mvc.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. MockMvc khác gì so với gọi API bằng `TestRestTemplate`?**

<details className="qa">
<summary>Xem đáp án</summary>

MockMvc không mở cổng mạng: request được dựng trong bộ nhớ và đưa thẳng vào `DispatcherServlet`, chạy cùng luồng với test (nên `@Transactional` trên test có thể rollback). `TestRestTemplate` gửi HTTP thật tới server nhúng đang chạy, đi qua cả tầng servlet container (Tomcat), gần thực tế hơn nhưng chậm hơn và không rollback được. MockMvc phù hợp test tầng web chi tiết; `TestRestTemplate` cho integration test đầu-cuối.

</details>

**2. `@WebMvcTest` nạp những bean nào? Vì sao phải mock service?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó chỉ nạp các thành phần tầng web: controller (được chỉ định), `@ControllerAdvice`, filter, `WebMvcConfigurer`, converter, Jackson, auto-config Spring Security và MockMvc. Các `@Service`, `@Repository` và cấu hình dữ liệu không được nạp, nên phụ thuộc của controller phải được cung cấp bằng `@MockitoBean`. Nhờ vậy test nhanh và chỉ tập trung vào hành vi tầng web.

</details>

**3. Làm sao test validation của request body?**

<details className="qa">
<summary>Xem đáp án</summary>

Gửi request với body vi phạm ràng buộc (`@NotBlank`, `@Positive`...) qua MockMvc, kỳ vọng status 400 và dùng `jsonPath` kiểm tra cấu trúc lỗi do `@ControllerAdvice` trả về (tên field lỗi, thông điệp). Đồng thời `verifyNoInteractions(service)` để chắc dữ liệu sai không đi xuống tầng nghiệp vụ. Test thêm JSON sai cú pháp để chắc trả 400 chứ không phải 500.

</details>

**4. Vì sao test POST với `@WithMockUser` vẫn bị 403?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì Spring Security bật bảo vệ CSRF mặc định cho các method thay đổi dữ liệu. Request trong test không có CSRF token nên bị từ chối với 403. Thêm `.with(csrf())` từ `SecurityMockMvcRequestPostProcessors`, hoặc nếu API là stateless dùng JWT thì cấu hình tắt CSRF trong `SecurityFilterChain` và import cấu hình đó vào test.

</details>

**5. `@WithMockUser` hoạt động thế nào? Có cách nào khác giả lập người dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

`@WithMockUser` (từ `spring-security-test`) tạo một `SecurityContext` chứa `UsernamePasswordAuthenticationToken` với username, roles/authorities chỉ định, trước khi test chạy. Các cách khác: `@WithUserDetails` (nạp user thật từ `UserDetailsService`), `@WithSecurityContext` cho annotation tự định nghĩa, và request post-processor như `.with(user(...))`, `.with(jwt())`, `.with(oauth2Login())` cho từng request.

</details>

**6. `MockMvcTester` là gì? Có nên chuyển sang dùng không?**

<details className="qa">
<summary>Xem đáp án</summary>

`MockMvcTester` là API mới từ Spring Framework 6.2 bọc MockMvc bằng AssertJ: viết `assertThat(mvc.get().uri(...)).hasStatusOk().bodyJson()...` thay cho chuỗi `perform().andExpect()` với Hamcrest; không cần khai báo `throws Exception` và thông báo lỗi dễ đọc hơn. Với test mới trên Boot 3.4+ nên cân nhắc dùng; test cũ vẫn chạy bình thường, không bắt buộc chuyển.

</details>

---

## 4. @DataJpaTest

Bài học: [4. @DataJpaTest](../../spring-boot/09-testing/4_data-jpa-test.md)

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
