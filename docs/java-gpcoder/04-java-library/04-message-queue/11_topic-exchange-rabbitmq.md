---
sidebar_position: 11
title: "Sử dụng Topic Exchange (Publish/Subscribe) trong RabbitMQ"
---

# Sử dụng Topic Exchange (Publish/Subscribe) trong RabbitMQ

Topic Exchange là loại exchange linh hoạt nhất trong RabbitMQ, định tuyến tin nhắn dựa trên mẫu (pattern) của routing key bằng các ký tự đại diện `*` và `#`. Nhờ đó bạn có thể lọc tin nhắn theo cấu trúc phân cấp như vùng địa lý hay loại sự kiện mà không cần sửa code khi thêm route mới. Bài này giải thích cú pháp routing key, các wildcard và ví dụ định tuyến thực tế.

## Topic Exchange là gì?

**Topic Exchange** (bộ định tuyến theo chủ đề — loại exchange định tuyến tin nhắn dựa trên mẫu (pattern) của routing key thay vì so khớp chính xác) là loại Exchange linh hoạt nhất trong RabbitMQ. Nó cho phép định tuyến tin nhắn theo cấu trúc phân cấp bằng cách sử dụng **wildcard** (ký tự đại diện).

## Cú pháp Routing Key trong Topic Exchange

Routing Key trong Topic Exchange là chuỗi các **từ** (words) ngăn cách bởi dấu chấm `.`:

```
"order.created"
"order.vietnam.hanoi.created"
"payment.failed.timeout"
"user.vip.logged-in"
```

Hai wildcard đặc biệt trong Binding Key:

| Wildcard | Ý nghĩa | Ví dụ |
|----------|---------|-------|
| `*` (dấu sao) | Khớp đúng **một từ** | `order.*` khớp `order.created`, KHÔNG khớp `order.vn.created` |
| `#` (dấu thăng) | Khớp **không hoặc nhiều từ** | `order.#` khớp `order`, `order.created`, `order.vn.created` |

## Ví dụ so khớp pattern

```
Binding Key: "order.*"
Khớp:    "order.created", "order.deleted", "order.updated"
Không:   "order.vn.created", "order"

Binding Key: "order.#"
Khớp:    "order", "order.created", "order.vn.hanoi.created"
Không:   "payment.created"

Binding Key: "*.error"
Khớp:    "payment.error", "order.error", "user.error"
Không:   "order.db.error", "error"

Binding Key: "#.error"
Khớp:    "error", "payment.error", "order.db.connection.error"
```

## Ví dụ thực tế: Hệ thống theo dõi sự kiện đa vùng

### Cấu trúc routing key

```
<loại-sự-kiện>.<quốc-gia>.<thành-phố>
Ví dụ: "order.vietnam.hanoi"
        "payment.usa.newyork"
        "user.japan.tokyo"
```

### Thiết lập Topic Exchange

```java
import com.rabbitmq.client.*;
import java.util.Map;

public class TopicExchangeSetup {

    public static final String EXCHANGE_NAME = "event-topic";

    public static void setup(Channel channel) throws Exception {
        channel.exchangeDeclare(EXCHANGE_NAME, BuiltinExchangeType.TOPIC, true, false, null);

        // Queue nhận TẤT CẢ sự kiện đơn hàng (bất kể quốc gia, thành phố)
        channel.queueDeclare("all-orders", true, false, false, null);
        channel.queueBind("all-orders", EXCHANGE_NAME, "order.#");

        // Queue nhận TẤT CẢ sự kiện tại Việt Nam
        channel.queueDeclare("vietnam-events", true, false, false, null);
        channel.queueBind("vietnam-events", EXCHANGE_NAME, "#.vietnam.#");

        // Queue nhận sự kiện lỗi từ mọi dịch vụ
        channel.queueDeclare("all-errors", true, false, false, null);
        channel.queueBind("all-errors", EXCHANGE_NAME, "*.error");
        channel.queueBind("all-errors", EXCHANGE_NAME, "*.*.error");

        // Queue chỉ nhận đơn hàng Hà Nội
        channel.queueDeclare("hanoi-orders", true, false, false, null);
        channel.queueBind("hanoi-orders", EXCHANGE_NAME, "order.vietnam.hanoi");

        System.out.println("Topic Exchange đã được thiết lập.");
    }
}
```

### Producer: Gửi sự kiện với routing key cấu trúc

```java
import com.rabbitmq.client.*;

public class EventProducer {

    public static void main(String[] args) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {

            TopicExchangeSetup.setup(channel);

            // Gửi các sự kiện với routing key khác nhau
            publishEvent(channel, "order.vietnam.hanoi",     "Đơn hàng #001 từ Hà Nội");
            publishEvent(channel, "order.vietnam.hochiminh", "Đơn hàng #002 từ TP.HCM");
            publishEvent(channel, "order.usa.newyork",       "Order #003 from New York");
            publishEvent(channel, "payment.error",           "Lỗi thanh toán: timeout");
            publishEvent(channel, "user.vietnam.hanoi",      "User mới đăng ký tại Hà Nội");
            publishEvent(channel, "order.error",             "Lỗi tạo đơn hàng: invalid data");
        }
    }

    private static void publishEvent(Channel channel, String routingKey, String message)
            throws Exception {
        AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
                .contentType("text/plain")
                .deliveryMode(2)
                .build();

        channel.basicPublish(TopicExchangeSetup.EXCHANGE_NAME, routingKey, props,
                message.getBytes("UTF-8"));

        System.out.printf("[Producer] RoutingKey='%s' | Message='%s'%n", routingKey, message);
    }
}
```

### Consumer: Theo dõi sự kiện theo tiêu chí

```java
import com.rabbitmq.client.*;

public class TopicConsumer {

    public static void main(String[] args) throws Exception {
        if (args.length == 0) {
            System.err.println("Dùng: TopicConsumer <all-orders|vietnam-events|all-errors|hanoi-orders>");
            return;
        }

        String queueName = args[0];
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        TopicExchangeSetup.setup(channel);

        System.out.println("[Consumer:" + queueName + "] Đang lắng nghe...");

        channel.basicConsume(queueName, true, (tag, delivery) -> {
            String routingKey = delivery.getEnvelope().getRoutingKey();
            String message = new String(delivery.getBody(), "UTF-8");
            System.out.printf("[Consumer:%s] key='%s' | msg='%s'%n",
                    queueName, routingKey, message);
        }, tag -> {});
    }
}
```

## Phân tích kết quả định tuyến

Với các tin nhắn được gửi ở trên:

| Routing Key | all-orders | vietnam-events | all-errors | hanoi-orders |
|-------------|-----------|----------------|------------|-------------|
| `order.vietnam.hanoi` | ✓ | ✓ | | ✓ |
| `order.vietnam.hochiminh` | ✓ | ✓ | | |
| `order.usa.newyork` | ✓ | | | |
| `payment.error` | | | ✓ | |
| `user.vietnam.hanoi` | | ✓ | | |
| `order.error` | | | ✓ | |

## Dùng Topic Exchange như Direct và Fanout

Topic Exchange có thể mô phỏng hành vi của hai loại Exchange kia:

```java
// Mô phỏng Direct Exchange: dùng routing key không có wildcard
channel.queueBind(queueName, topicExchange, "order.created");  // Khớp chính xác

// Mô phỏng Fanout Exchange: dùng "#" trong binding key
channel.queueBind(queueName, topicExchange, "#");  // Nhận mọi tin nhắn
```

## Thứ tự ưu tiên binding

Khi một tin nhắn khớp nhiều binding, tin nhắn được gửi tới **tất cả Queue khớp**:

```java
// Đơn hàng lỗi "order.error" sẽ được gửi tới CẢ HAI queue:
channel.queueBind("all-orders", EXCHANGE_NAME, "order.#"); // khớp "order.error"
channel.queueBind("all-errors", EXCHANGE_NAME, "*.error"); // cũng khớp "order.error"
// → all-orders VÀ all-errors đều nhận được tin nhắn
```

## Tổng kết

Topic Exchange là lựa chọn tốt nhất khi hệ thống cần định tuyến dựa trên cấu trúc phân cấp (vùng địa lý, cấp độ nghiêm trọng, loại sự kiện). Kết hợp `*` và `#` cho phép xây dựng các bộ lọc rất linh hoạt mà không cần thay đổi code khi thêm/bớt routing key.
