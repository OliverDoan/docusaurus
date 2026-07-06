---
sidebar_position: 18
title: "Giới thiệu CloudAMQP - RabbitMQ server trên Cloud"
---

# Giới thiệu CloudAMQP - RabbitMQ server trên Cloud

CloudAMQP là dịch vụ cung cấp RabbitMQ chạy sẵn trên đám mây (RabbitMQ-as-a-Service), giúp bạn dùng ngay mà không phải tự cài đặt, cấu hình hay bảo trì server. Dịch vụ có gói miễn phí phù hợp để học và thử nghiệm, kèm dashboard giám sát và backup tự động. Bài này hướng dẫn cách đăng ký, tạo instance và kết nối ứng dụng Java/Spring Boot với CloudAMQP.

## CloudAMQP là gì?

**CloudAMQP** (dịch vụ RabbitMQ quản lý trên đám mây — cung cấp RabbitMQ dưới dạng SaaS, người dùng không cần tự cài đặt, cấu hình hay bảo trì server) là dịch vụ **RabbitMQ-as-a-Service** (RabbitMQ như một dịch vụ — mô hình thuê dịch vụ, nhà cung cấp lo toàn bộ hạ tầng) phổ biến nhất hiện nay, được vận hành bởi **84codes**. CloudAMQP hỗ trợ triển khai trên các cloud lớn: AWS, Google Cloud, Azure.

Sơ đồ sau minh họa mô hình kết nối: ứng dụng của bạn chỉ cần một AMQPS URL để kết nối tới RabbitMQ do CloudAMQP quản lý và chạy trên hạ tầng cloud:

```mermaid
flowchart LR
    App["Ứng dụng Java / Spring Boot"] -->|"amqps URL (TLS)"| CA["CloudAMQP<br/>(RabbitMQ được quản lý)"]
    CA --> Infra["Hạ tầng cloud<br/>(AWS / GCP / Azure)"]
    CA --> Dash["Dashboard<br/>(metrics, backup, alarm)"]
```

Toàn bộ việc cài đặt, bảo mật, backup và monitoring do CloudAMQP lo; phía ứng dụng chỉ thay đổi connection URL là chuyển được giữa môi trường cục bộ và cloud.

## Tại sao dùng CloudAMQP?

| Tự cài RabbitMQ | Dùng CloudAMQP |
|----------------|----------------|
| Phải tự cài đặt và cấu hình | Sẵn sàng trong vài phút |
| Phải tự quản lý bảo mật | Bảo mật được đảm bảo |
| Phải tự xử lý backup | Backup tự động |
| Phải tự monitor | Dashboard monitoring tích hợp |
| Phải tự scale | Scale dễ dàng qua UI |
| Chi phí server | Có gói miễn phí (Free tier) |

## Đăng ký và tạo instance miễn phí

### Bước 1: Đăng ký tài khoản

Truy cập và đăng ký miễn phí:
```
https://www.cloudamqp.com/
```

### Bước 2: Tạo instance RabbitMQ

1. Sau khi đăng nhập, click **Create New Instance**.
2. Điền thông tin:
   - **Name**: Tên instance (ví dụ: `my-app-rabbitmq`).
   - **Plan**: Chọn **Little Lemur** (gói miễn phí — giới hạn 1M tin nhắn/tháng, 20 kết nối đồng thời).
   - **Region**: Chọn vùng gần nhất (Singapore cho Việt Nam).
3. Click **Create Instance**.

### Bước 3: Lấy thông tin kết nối

Sau khi tạo, vào trang chi tiết instance để lấy:

```
AMQP URL: amqps://username:password@hostname/vhost
```

Ví dụ:
```
amqps://xqbwmpef:AbCdEfGh@rhino.rmq.cloudamqp.com/xqbwmpef
```

## Kết nối Java với CloudAMQP

### Cách 1: Dùng AMQP URL trực tiếp

```java
import com.rabbitmq.client.*;

public class CloudAMQPConnection {

    // AMQP URL từ trang CloudAMQP (lấy từ dashboard)
    private static final String CLOUDAMQP_URL =
            "amqps://xqbwmpef:AbCdEfGh@rhino.rmq.cloudamqp.com/xqbwmpef";

    public static ConnectionFactory createFactory() throws Exception {
        ConnectionFactory factory = new ConnectionFactory();

        // Phân tích URL và cấu hình factory
        factory.setUri(CLOUDAMQP_URL);

        // Cấu hình thêm cho kết nối cloud
        factory.setAutomaticRecoveryEnabled(true);        // Tự phục hồi khi mất mạng
        factory.setNetworkRecoveryInterval(10_000);       // Thử lại sau 10 giây
        factory.setConnectionTimeout(30_000);             // Timeout kết nối 30 giây
        factory.setRequestedHeartbeat(60);                // Heartbeat để giữ kết nối

        return factory;
    }

    public static void main(String[] args) throws Exception {
        ConnectionFactory factory = createFactory();

        try (Connection connection = factory.newConnection("cloudamqp-demo")) {
            System.out.println("Kết nối CloudAMQP thành công!");
            System.out.println("Server: " + connection.getAddress());

            Channel channel = connection.createChannel();

            // Gửi tin nhắn thử
            channel.queueDeclare("cloud-test-queue", true, false, false, null);
            channel.basicPublish("", "cloud-test-queue",
                    MessageProperties.PERSISTENT_TEXT_PLAIN,
                    "Xin chào từ CloudAMQP!".getBytes("UTF-8"));

            System.out.println("Đã gửi tin nhắn lên CloudAMQP!");
        }
    }
}
```

### Cách 2: Đọc URL từ biến môi trường (Khuyến nghị cho production)

```java
import com.rabbitmq.client.*;

public class CloudAMQPWithEnvVar {

    public static ConnectionFactory createFactory() throws Exception {
        // Đọc URL từ biến môi trường — KHÔNG hardcode trong code
        String cloudAmqpUrl = System.getenv("CLOUDAMQP_URL");

        if (cloudAmqpUrl == null || cloudAmqpUrl.isBlank()) {
            throw new IllegalStateException(
                "Biến môi trường CLOUDAMQP_URL chưa được thiết lập! " +
                "Hãy đặt: export CLOUDAMQP_URL=amqps://user:pass@host/vhost"
            );
        }

        ConnectionFactory factory = new ConnectionFactory();
        factory.setUri(cloudAmqpUrl);
        factory.setAutomaticRecoveryEnabled(true);
        factory.setNetworkRecoveryInterval(10_000);

        return factory;
    }
}
```

### Cách 3: Dùng với Spring Boot

```yaml
# application.yml
spring:
  rabbitmq:
    addresses: amqps://xqbwmpef:AbCdEfGh@rhino.rmq.cloudamqp.com/xqbwmpef
    # Hoặc dùng biến môi trường:
    # addresses: ${CLOUDAMQP_URL}
    connection-timeout: 30000
    requested-heartbeat: 60
```

```java
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CloudMessageService {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendToCloud(String queueName, String message) {
        rabbitTemplate.convertAndSend(queueName, message);
        System.out.println("Đã gửi tới CloudAMQP: " + message);
    }
}
```

## Tối ưu kết nối cho CloudAMQP

### Connection Pooling — Tái sử dụng kết nối

```java
import com.rabbitmq.client.*;

/**
 * Singleton ConnectionFactory — một Connection cho toàn ứng dụng
 * Tránh tạo Connection mới mỗi lần gửi tin nhắn (tốn kém)
 */
public class CloudAMQPConnectionPool {

    private static Connection sharedConnection;
    private static ConnectionFactory factory;

    static {
        try {
            factory = new ConnectionFactory();
            factory.setUri(System.getenv("CLOUDAMQP_URL"));
            factory.setAutomaticRecoveryEnabled(true);
            factory.setRequestedHeartbeat(60);
            sharedConnection = factory.newConnection("pool-connection");
        } catch (Exception e) {
            throw new RuntimeException("Không thể khởi tạo CloudAMQP connection", e);
        }
    }

    /**
     * Lấy channel từ connection dùng chung.
     * Mỗi thread nên có Channel riêng.
     */
    public static Channel getChannel() throws Exception {
        if (!sharedConnection.isOpen()) {
            sharedConnection = factory.newConnection("pool-connection-recovery");
        }
        return sharedConnection.createChannel();
    }
}
```

## Giám sát trên CloudAMQP Dashboard

CloudAMQP cung cấp dashboard giám sát tích hợp sẵn:

1. **Metrics** (số liệu): Biểu đồ message rate, connection count, memory usage theo thời gian thực.
2. **Log viewer**: Xem log của RabbitMQ node.
3. **RabbitMQ Management**: Truy cập Management UI đầy đủ của RabbitMQ.
4. **Alarm**: Thiết lập cảnh báo khi queue đầy hoặc kết nối vượt ngưỡng.

Truy cập Management UI từ dashboard:
```
https://rhino.rmq.cloudamqp.com/#/
```

## Các gói dịch vụ CloudAMQP

| Gói | Giá | Kết nối | Hàng đợi | Tin nhắn/tháng |
|-----|-----|---------|---------|---------------|
| **Little Lemur** (Free) | $0 | 20 | Unlimited | 1M |
| **Tough Tiger** | $19/tháng | 25 | Unlimited | 5M |
| **Big Bunny** | $99/tháng | 100 | Unlimited | Unlimited |
| **Roaring Rabbit** | $299/tháng | 500 | Unlimited | Unlimited + Clustering |

## Bảo mật kết nối với TLS/SSL

Luôn dùng **AMQPS** (AMQP qua TLS — giao thức AMQP được mã hóa bằng Transport Layer Security) trong production:

```java
ConnectionFactory factory = new ConnectionFactory();
// amqps:// thay vì amqp:// — tự động bật TLS
factory.setUri("amqps://user:pass@hostname/vhost");

// Hoặc bật TLS thủ công
factory.useSslProtocol();
```

CloudAMQP tự động cung cấp chứng chỉ TLS hợp lệ, không cần cấu hình thêm.

## Tổng kết

CloudAMQP là lựa chọn lý tưởng cho:
- **Startup và dự án nhỏ**: Gói miễn phí đủ dùng để phát triển và test.
- **Production nhanh**: Không mất thời gian cài đặt, cấu hình, bảo trì.
- **Đội ngũ nhỏ**: Không cần DevOps chuyên biệt để quản lý RabbitMQ.

Khi quy mô tăng và cần kiểm soát hoàn toàn, bạn có thể chuyển sang tự triển khai RabbitMQ trên Kubernetes hoặc VM mà không cần thay đổi code ứng dụng — chỉ đổi connection URL.
