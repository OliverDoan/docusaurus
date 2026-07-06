---
sidebar_position: 7
title: "Kết nối AMQP Client với RabbitMQ Server"
---

# Kết nối AMQP Client với RabbitMQ Server

AMQP là giao thức chuẩn để các ứng dụng trao đổi tin nhắn qua RabbitMQ, và Java có thư viện chính thức amqp-client để làm việc này. Bài này hướng dẫn cách cấu hình kết nối, quản lý Connection và Channel, gửi tin nhắn cũng như nhận tin theo cả cách đồng bộ lẫn bất đồng bộ. Hiểu rõ vòng đời Connection/Channel là nền tảng để viết ứng dụng RabbitMQ chạy ổn định.

## AMQP là gì?

**AMQP - Advanced Message Queuing Protocol** (Giao thức hàng đợi tin nhắn nâng cao — giao thức mạng tầng ứng dụng chuẩn cho nhắn tin, cho phép các hệ thống khác nhau giao tiếp bất kể ngôn ngữ lập trình) là giao thức tầng ứng dụng để trao đổi tin nhắn. RabbitMQ triển khai **AMQP 0-9-1** và thư viện Java chính thức là **amqp-client**.

## Dependency Maven

```xml
<dependencies>
    <dependency>
        <groupId>com.rabbitmq</groupId>
        <artifactId>amqp-client</artifactId>
        <version>5.20.0</version>
    </dependency>
    <!-- Logging -->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-simple</artifactId>
        <version>2.0.9</version>
    </dependency>
</dependencies>
```

## Thiết lập ConnectionFactory

**ConnectionFactory** (nhà máy kết nối — đối tượng cấu hình và tạo kết nối tới RabbitMQ):

```java
import com.rabbitmq.client.ConnectionFactory;

public class RabbitMQConnectionFactory {

    public static ConnectionFactory buildFactory() {
        ConnectionFactory factory = new ConnectionFactory();

        // Cấu hình cơ bản
        factory.setHost("localhost");
        factory.setPort(5672);              // Cổng AMQP 0-9-1
        factory.setUsername("guest");
        factory.setPassword("guest");
        factory.setVirtualHost("/");        // Vhost mặc định

        // Cấu hình timeout
        factory.setConnectionTimeout(10_000);    // Chờ kết nối tối đa 10s
        factory.setHandshakeTimeout(10_000);     // Chờ bắt tay TLS tối đa 10s
        factory.setShutdownTimeout(5_000);       // Chờ đóng kết nối tối đa 5s

        // Cấu hình Heartbeat (nhịp tim — gói tin định kỳ kiểm tra kết nối còn sống)
        factory.setRequestedHeartbeat(60); // Gửi heartbeat mỗi 60 giây

        // Tự động phục hồi kết nối khi bị ngắt
        factory.setAutomaticRecoveryEnabled(true);
        factory.setNetworkRecoveryInterval(5_000); // Thử lại sau 5 giây

        return factory;
    }
}
```

## Kết nối bằng URI

Thay vì cấu hình từng thuộc tính, bạn có thể dùng **connection URI** (định danh tài nguyên kết nối):

```java
ConnectionFactory factory = new ConnectionFactory();
// Cú pháp: amqp://username:password@host:port/vhost
factory.setUri("amqp://guest:guest@localhost:5672/%2F");

// Hoặc dùng AMQPS (AMQP qua TLS) cho môi trường production
// factory.setUri("amqps://user:pass@rabbitmq.example.com:5671/%2Fmy-vhost");
```

## Vòng đời kết nối: Connection và Channel

```
ConnectionFactory (cấu hình)
    └── Connection (kết nối TCP vật lý, chi phí cao)
            ├── Channel 1 (kênh ảo nhẹ, dùng cho producer)
            ├── Channel 2 (kênh ảo nhẹ, dùng cho consumer 1)
            └── Channel 3 (kênh ảo nhẹ, dùng cho consumer 2)
```

Quan hệ phân cấp giữa ConnectionFactory, Connection và Channel được thể hiện trong sơ đồ sau:

```mermaid
flowchart TD
    F["ConnectionFactory<br/>(cấu hình)"] --> C["Connection<br/>(TCP vật lý, chi phí cao)"]
    C --> Ch1["Channel 1<br/>(producer)"]
    C --> Ch2["Channel 2<br/>(consumer 1)"]
    C --> Ch3["Channel 3<br/>(consumer 2)"]
```

**Nguyên tắc**: Tạo ít Connection, nhưng có thể tạo nhiều Channel. Mỗi **thread** (luồng) nên có Channel riêng.

```java
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;

public class ConnectionChannelDemo {

    public static void main(String[] args) throws Exception {
        ConnectionFactory factory = RabbitMQConnectionFactory.buildFactory();

        // Tạo một Connection duy nhất — dùng chung cho toàn ứng dụng
        try (Connection connection = factory.newConnection("ten-ung-dung")) {
            System.out.println("Connection mở: " + connection.isOpen());

            // Tạo Channel cho producer
            Channel producerChannel = connection.createChannel();
            System.out.println("Producer channel: " + producerChannel.getChannelNumber());

            // Tạo Channel cho consumer (mỗi consumer nên có channel riêng)
            Channel consumerChannel = connection.createChannel();
            System.out.println("Consumer channel: " + consumerChannel.getChannelNumber());

            // Thực hiện thao tác...

            // Đóng channel (không đóng connection)
            producerChannel.close();
            consumerChannel.close();

            System.out.println("Đã đóng các channel");
        }
        // Connection tự đóng nhờ try-with-resources
    }
}
```

## Gửi tin nhắn (Producer)

```java
import com.rabbitmq.client.*;

public class SimpleProducer {

    private static final String QUEUE_NAME = "hello";

    public static void main(String[] args) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {

            // queueDeclare: khai báo queue (tạo nếu chưa tồn tại, idempotent)
            // tham số: (tên, durable, exclusive, autoDelete, arguments)
            // durable=true: queue tồn tại sau khi restart
            // exclusive=false: nhiều connection có thể dùng queue này
            // autoDelete=false: không tự xóa khi consumer ngắt kết nối
            channel.queueDeclare(QUEUE_NAME, true, false, false, null);

            String message = "Xin chào RabbitMQ!";

            // basicPublish: gửi tin nhắn
            // tham số: (exchange, routingKey, properties, body)
            // exchange="" nghĩa là dùng default exchange
            // routingKey = tên queue khi dùng default exchange
            AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
                    .contentType("text/plain")
                    .deliveryMode(2)    // 2 = persistent (lưu vào đĩa)
                    .build();

            channel.basicPublish("", QUEUE_NAME, props, message.getBytes("UTF-8"));
            System.out.println("Đã gửi: '" + message + "'");
        }
    }
}
```

## Nhận tin nhắn (Consumer) — Đồng bộ

```java
import com.rabbitmq.client.*;

public class SynchronousConsumer {

    private static final String QUEUE_NAME = "hello";

    public static void main(String[] args) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        channel.queueDeclare(QUEUE_NAME, true, false, false, null);

        // basicGet: lấy một tin nhắn đồng bộ (polling)
        // autoAck=true: tự động xác nhận sau khi nhận
        GetResponse response = channel.basicGet(QUEUE_NAME, true);

        if (response != null) {
            String message = new String(response.getBody(), "UTF-8");
            System.out.println("Nhận được: '" + message + "'");
            System.out.println("Message count còn lại: " + response.getMessageCount());
        } else {
            System.out.println("Queue rỗng");
        }

        channel.close();
        connection.close();
    }
}
```

## Nhận tin nhắn (Consumer) — Bất đồng bộ (Khuyến nghị)

```java
import com.rabbitmq.client.*;

public class AsyncConsumer {

    private static final String QUEUE_NAME = "hello";

    public static void main(String[] args) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        channel.queueDeclare(QUEUE_NAME, true, false, false, null);

        // Cấu hình QoS: mỗi lần chỉ nhận tối đa 1 tin nhắn chưa được xác nhận
        // (prefetchCount=1 — Prefetch Count là số lượng tin nhắn consumer nhận trước khi ack)
        channel.basicQos(1);

        System.out.println("Đang chờ tin nhắn. Nhấn CTRL+C để thoát.");

        // DeliverCallback: callback gọi khi có tin nhắn mới
        DeliverCallback deliverCallback = (consumerTag, delivery) -> {
            String message = new String(delivery.getBody(), "UTF-8");
            System.out.println("Nhận: '" + message + "'");

            try {
                // Xử lý tin nhắn
                Thread.sleep(1000); // Giả lập công việc mất 1 giây
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                // basicAck: xác nhận đã xử lý xong (deliveryTag, multiple)
                channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
            }
        };

        // CancelCallback: callback gọi khi consumer bị hủy
        CancelCallback cancelCallback = consumerTag ->
                System.out.println("Consumer bị hủy: " + consumerTag);

        // basicConsume: đăng ký consumer
        // autoAck=false: phải gọi basicAck thủ công
        channel.basicConsume(QUEUE_NAME, false, deliverCallback, cancelCallback);
    }
}
```

## Tổng kết các tham số quan trọng của queueDeclare

| Tham số | Kiểu | Ý nghĩa |
|---------|------|---------|
| `name` | String | Tên queue |
| `durable` | boolean | `true` = tồn tại sau restart broker |
| `exclusive` | boolean | `true` = chỉ connection hiện tại dùng được, tự xóa khi connection đóng |
| `autoDelete` | boolean | `true` = tự xóa khi consumer cuối cùng ngắt kết nối |
| `arguments` | Map | Cấu hình mở rộng (TTL, max-length, dead-letter-exchange...) |

## Tổng kết

Bài này đã trình bày cách kết nối AMQP client Java với RabbitMQ, bao gồm cấu hình ConnectionFactory, quản lý Connection/Channel, gửi tin nhắn với properties, và nhận tin nhắn theo cả hai cách đồng bộ và bất đồng bộ. Hiểu rõ vòng đời Connection/Channel là nền tảng để xây dựng ứng dụng RabbitMQ hiệu năng cao.
