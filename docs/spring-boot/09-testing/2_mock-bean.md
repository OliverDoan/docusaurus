---
sidebar_position: 2
title: "2. Mock Bean (@MockitoBean / @MockBean)"
---

# Mock Bean (@MockitoBean / @MockBean)

Khi test, ta thường muốn **thay một phụ thuộc thật** (cổng thanh toán, dịch vụ gửi email, client gọi dịch vụ khác) bằng một đối tượng giả có thể điều khiển. Có hai cách: mock thuần bằng Mockito trong unit test (không có Spring), hoặc **thay bean trong ApplicationContext** bằng `@MockitoBean`. Bài này so sánh hai cách, giải thích việc `@MockBean` bị deprecated từ Spring Boot 3.4 và được thay bằng `@MockitoBean` của Spring Framework 6.2, cùng ảnh hưởng của mock bean tới context cache.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Ưu tiên unit test thuần Mockito** (`@ExtendWith(MockitoExtension.class)`, `@Mock`, `@InjectMocks`) — không nạp Spring, chạy tính bằng mili giây.
- ⭐ **`@MockBean`/`@SpyBean` deprecated từ Boot 3.4** → dùng `@MockitoBean`/`@MockitoSpyBean` trong package `org.springframework.test.context.bean.override.mockito`; Boot 4 đã xoá `@MockBean`.
- **`@MockitoBean` thay bean trong context** — dùng trong `@WebMvcTest`, `@SpringBootTest` khi cần giả lập phụ thuộc của bean thật.
- **Mỗi tổ hợp mock khác nhau tạo một context mới** — rải `@MockitoBean` lung tung làm bộ test chậm đi nhiều lần.
- **Mock được reset sau mỗi test** (mặc định) — không cần tự gọi `reset()`.

:::

---

## Mục lục

- [Vì sao cần mock?](#vì-sao-cần-mock)
- [Unit test thuần Mockito](#unit-test-thuần-mockito)
- [Mock bean trong ApplicationContext](#mock-bean-trong-applicationcontext)
- [Từ @MockBean sang @MockitoBean](#từ-mockbean-sang-mockitobean)
- [Spy bean](#spy-bean)
- [Ảnh hưởng tới context cache](#ảnh-hưởng-tới-context-cache)

---

## Vì sao cần mock?

**Vấn đề:** Test `OrderService.place()` mà dùng phụ thuộc thật:

```java
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final PaymentGateway paymentGateway;   // gọi VNPay thật
    private final EmailSender emailSender;         // gửi email thật

    public Order place(PlaceOrderCommand cmd) {
        Order order = orderRepository.save(Order.from(cmd));
        PaymentResult result = paymentGateway.charge(order.getId(), order.getTotal());
        if (!result.success()) {
            throw new PaymentFailedException(result.reason());
        }
        emailSender.send(cmd.email(), "Đặt hàng thành công");
        return order;
    }
}
```

- Mỗi lần chạy test là **trừ tiền thật**, gửi email thật.
- Không thể ép cổng thanh toán trả về "thẻ bị từ chối" để test nhánh lỗi.
- Test phụ thuộc mạng, chậm, lúc pass lúc fail (flaky).

**Giải pháp:** Thay phụ thuộc bằng **mock** — đối tượng giả mà ta lập trình sẵn phản hồi và kiểm tra được nó đã bị gọi thế nào:

```java
when(paymentGateway.charge(anyLong(), any())).thenReturn(PaymentResult.declined("Thẻ hết hạn"));

assertThatThrownBy(() -> orderService.place(cmd))
        .isInstanceOf(PaymentFailedException.class);

verify(emailSender, never()).send(any(), any());
```

:::tip[Dùng thực tế]

- Giả lập dịch vụ bên ngoài (thanh toán, SMS, bản đồ) để test mọi nhánh: thành công, từ chối, timeout.
- Kiểm tra side effect: email có được gửi không, gửi với nội dung gì.
- Cô lập controller khỏi service trong `@WebMvcTest`.
- Cố định giá trị không xác định (thời gian, số ngẫu nhiên, UUID).

:::

:::tip[Ví dụ đời thường]

Mock giống **diễn viên đóng thế** trong phim: cảnh nhảy từ tầng 10 không ai bắt diễn viên chính làm thật. Diễn viên đóng thế làm đúng động tác đạo diễn yêu cầu (stub), và đạo diễn xem lại băng để chắc cảnh quay đúng kịch bản (verify).

:::

---

## Unit test thuần Mockito

Không cần Spring — chỉ JUnit 5 và Mockito (có sẵn trong `spring-boot-starter-test`):

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentGateway paymentGateway;

    @Mock
    private EmailSender emailSender;

    @InjectMocks
    private OrderService orderService;     // Mockito tạo instance, tiêm 3 mock qua constructor

    @Captor
    private ArgumentCaptor<String> bodyCaptor;

    private final PlaceOrderCommand cmd = new PlaceOrderCommand("an@example.com", new BigDecimal("500000"));

    @Test
    void place_success_sendsEmail() {
        when(orderRepository.save(any(Order.class)))
                .thenAnswer(inv -> inv.getArgument(0, Order.class).withId(1L));
        when(paymentGateway.charge(eq(1L), any())).thenReturn(PaymentResult.ok());

        Order order = orderService.place(cmd);

        assertThat(order.getId()).isEqualTo(1L);
        verify(emailSender).send(eq("an@example.com"), bodyCaptor.capture());
        assertThat(bodyCaptor.getValue()).contains("thành công");
    }

    @Test
    void place_paymentDeclined_throwsAndNoEmail() {
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0, Order.class).withId(2L));
        when(paymentGateway.charge(anyLong(), any())).thenReturn(PaymentResult.declined("Thẻ hết hạn"));

        assertThatThrownBy(() -> orderService.place(cmd))
                .isInstanceOf(PaymentFailedException.class)
                .hasMessageContaining("Thẻ hết hạn");

        verifyNoInteractions(emailSender);
    }
}
```

Phong cách BDD (given/when/then) với `BDDMockito`:

```java
given(paymentGateway.charge(anyLong(), any())).willThrow(new GatewayTimeoutException());

assertThatThrownBy(() -> orderService.place(cmd)).isInstanceOf(GatewayTimeoutException.class);

then(emailSender).shouldHaveNoInteractions();
```

Những API Mockito hay dùng:

| API | Tác dụng |
|-----|----------|
| `when(...).thenReturn(...)` / `thenThrow` / `thenAnswer` | Lập trình phản hồi (stub) |
| `doThrow(...).when(mock).method()` | Stub method trả `void` |
| `verify(mock, times(2)).method()` | Kiểm tra số lần gọi |
| `verify(mock, never())`, `verifyNoInteractions` | Kiểm tra không được gọi |
| `ArgumentCaptor` | Bắt tham số đã truyền để assert chi tiết |
| `any()`, `eq()`, `argThat(...)` | Matcher tham số |

:::warning[Lỗi hay gặp]

- Trộn matcher và giá trị thô: `when(repo.find(1L, any()))` → lỗi `InvalidUseOfMatchersException`. Hoặc tất cả là matcher (`eq(1L), any()`) hoặc không cái nào.
- Stub không dùng tới → `MockitoExtension` (strict stubs) báo `UnnecessaryStubbingException`. Đó là tín hiệu test thừa hoặc sai, không phải lỗi cần tắt.
- Mock **chính class đang test** hoặc mock value object, DTO → test trở nên vô nghĩa. Chỉ mock phụ thuộc có side effect hoặc chậm.
- Verify quá chi tiết từng lời gọi nội bộ → test gãy mỗi lần refactor dù hành vi không đổi. Ưu tiên assert kết quả.

:::

---

## Mock bean trong ApplicationContext

Trong test có Spring (`@WebMvcTest`, `@SpringBootTest`), các bean được container tạo và tiêm. Muốn thay một bean bằng mock, dùng `@MockitoBean` — nó **thay thế** bean cùng kiểu trong context (hoặc thêm mới nếu chưa có), và mọi bean phụ thuộc vào nó sẽ nhận mock.

```java
@SpringBootTest
@AutoConfigureMockMvc
class CheckoutFlowIT {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PaymentGateway paymentGateway;     // bean thật bị thay bằng mock

    @MockitoBean
    private EmailSender emailSender;

    @Test
    void checkout_paymentDeclined_returns402() throws Exception {
        when(paymentGateway.charge(anyLong(), any())).thenReturn(PaymentResult.declined("Không đủ số dư"));

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "email": "an@example.com", "total": 500000 }
                                """))
               .andExpect(status().isPaymentRequired());

        verifyNoInteractions(emailSender);
    }
}
```

Ở đây `OrderService`, `OrderRepository`, controller, exception handler đều là bean thật; chỉ hai phụ thuộc ra bên ngoài bị thay.

Tuỳ chọn hữu ích:

```java
@MockitoBean(name = "smsSender")                 // thay bean theo tên khi có nhiều bean cùng kiểu
private NotificationSender smsSender;

@MockitoBean(answers = Answers.RETURNS_DEEP_STUBS)
private ExternalApi externalApi;

@MockitoBean(reset = MockReset.NONE)            // không reset sau mỗi test (mặc định AFTER)
private Clock clock;
```

| | Mock thuần Mockito (`@Mock`) | `@MockitoBean` |
|---|---|---|
| Có Spring context | Không | Có |
| Tốc độ | Rất nhanh | Chậm hơn (dựng context) |
| Tiêm vào đâu | `@InjectMocks` hoặc tự `new` | Container tự tiêm vào mọi bean phụ thuộc |
| Dùng khi | Test logic một class | Test slice/integration cần thay một phụ thuộc |

---

## Từ @MockBean sang @MockitoBean

| | `@MockBean` / `@SpyBean` | `@MockitoBean` / `@MockitoSpyBean` |
|---|---|---|
| Thuộc về | Spring Boot (`org.springframework.boot.test.mock.mockito`) | Spring Framework 6.2+ (`org.springframework.test.context.bean.override.mockito`) |
| Trạng thái | Deprecated từ Boot 3.4, **đã xoá ở Boot 4** | Cách chính thức hiện nay |
| Cơ chế | `BeanFactoryPostProcessor` riêng của Boot | Bean Override API chung của Spring TestContext |
| Đặt trên field của `@Configuration` / `@TestConfiguration` | Được | Không — chỉ trên field của test class (hoặc lớp cha, lớp lồng `@Nested`); từ 6.2.2 có thể đặt ở mức class với thuộc tính `types` |
| Dùng được ngoài Spring Boot | Không | Có (Spring thuần) |

Chuyển đổi gần như đổi tên import:

```java
// Cũ (Boot 3.3 trở về trước)
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;

@MockBean
private PaymentGateway paymentGateway;

// Mới (Boot 3.4+)
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

@MockitoBean
private PaymentGateway paymentGateway;
```

Dùng chung một bộ mock cho nhiều test class — khai báo trong lớp cha (thay cho việc đặt `@MockBean` trong `@TestConfiguration` như trước):

```java
@SpringBootTest
@AutoConfigureMockMvc
public abstract class BaseApiTest {

    @MockitoBean
    protected PaymentGateway paymentGateway;

    @MockitoBean
    protected EmailSender emailSender;
}
```

:::warning[Lỗi hay gặp]

- Đặt `@MockitoBean` lên field trong class `@TestConfiguration` như thói quen với `@MockBean` → không có tác dụng. Chuyển field sang test class hoặc lớp cha của test.
- `@MockitoSpyBean` yêu cầu **bean đã tồn tại** trong context để bọc lại; nếu không có sẽ báo lỗi (khác `@SpyBean` cũ có thể tự tạo).
- Nâng cấp lên Boot 4 mà vẫn còn `@MockBean` → lỗi biên dịch vì annotation đã bị xoá.

:::

---

## Spy bean

**Spy** là bean thật được bọc lại: mặc định gọi code thật, nhưng có thể stub vài method và verify lời gọi.

```java
@SpringBootTest
class AuditIT {

    @MockitoSpyBean
    private AuditLogger auditLogger;       // bean thật, có ghi log thật

    @Autowired
    private OrderService orderService;

    @Test
    void place_writesAuditLog() {
        orderService.place(new PlaceOrderCommand("an@example.com", new BigDecimal("100000")));

        verify(auditLogger).log(eq("ORDER_PLACED"), anyString());
    }
}
```

Stub method trên spy nên dùng dạng `doReturn(...).when(spy).method()` — dạng `when(spy.method())` sẽ **gọi method thật** một lần khi stub.

---

## Ảnh hưởng tới context cache

Danh sách bean bị mock/spy là một phần của **khoá cache context**. Hai test class mock tập bean khác nhau sẽ dùng hai context khác nhau:

```
OrderApiIT       @MockitoBean PaymentGateway                 → context A
ProductApiIT     (không mock)                                → context B
CheckoutIT       @MockitoBean PaymentGateway, EmailSender    → context C
RefundIT         @MockitoBean EmailSender                    → context D
```

Bốn class, bốn lần dựng context — mỗi lần vài giây, nhân với hàng chục class thì bộ test chạy hàng phút.

Cách giữ cache hiệu quả:

1. **Unit test là chính** — logic nghiệp vụ test bằng Mockito thuần, không cần context.
2. **Thống nhất tập mock** cho integration test bằng lớp cha `BaseApiTest` như trên; class nào không cần stub thì cứ để mock "ngủ yên".
3. **Thay dịch vụ ngoài bằng giả lập ở tầng mạng** (WireMock, MockServer) hoặc bean giả cố định trong profile test — không làm đổi khoá cache.
4. Tránh `@DirtiesContext` chỉ để "reset mock" — mock đã được reset tự động sau mỗi test.

:::tip[Ví dụ đời thường]

Mỗi bộ mock khác nhau giống một **bối cảnh quay phim** khác nhau. Đoàn phim dựng một bối cảnh rồi quay hết các cảnh cần bối cảnh đó thì nhanh; còn mỗi cảnh lại đòi đổi đồ đạc một chút thì ngày nào cũng tháo dựng lại phim trường.

:::
