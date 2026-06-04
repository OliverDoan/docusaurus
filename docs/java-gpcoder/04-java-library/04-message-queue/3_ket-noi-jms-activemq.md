---
sidebar_position: 3
title: "Kết nối JMS Client với ActiveMQ"
---

# Kết nối JMS Client với ActiveMQ

## Tổng quan

Bài này hướng dẫn cách kết nối một ứng dụng Java với **ActiveMQ** thông qua **JMS API** (Java Message Service API — giao diện lập trình chuẩn cho nhắn tin Java). Chúng ta sẽ xây dựng ứng dụng hoàn chỉnh gửi và nhận tin nhắn cả theo mô hình **Queue** (hàng đợi) và **Topic** (chủ đề).

## Thêm dependency

Thêm vào `pom.xml`:

```xml
<dependencies>
    <!-- ActiveMQ client library -->
    <dependency>
        <groupId>org.apache.activemq</groupId>
        <artifactId>activemq-all</artifactId>
        <version>5.18.3</version>
    </dependency>
</dependencies>
```

## Các bước kết nối JMS chuẩn

Mỗi ứng dụng JMS đều thực hiện các bước sau theo thứ tự:

```
1. Tạo ConnectionFactory
2. Tạo Connection
3. Tạo Session
4. Tạo Destination (Queue hoặc Topic)
5. Tạo Producer / Consumer
6. Gửi / Nhận tin nhắn
7. Đóng tài nguyên
```

## Gửi tin nhắn tới Queue (Point-to-Point)

```java
import org.apache.activemq.ActiveMQConnectionFactory;

import javax.jms.*;

public class QueueProducer {

    // URL kết nối tới ActiveMQ broker
    private static final String BROKER_URL = "tcp://localhost:61616";
    private static final String QUEUE_NAME = "DonHangQueue";

    public static void main(String[] args) throws JMSException {
        // Bước 1: Tạo ConnectionFactory với URL của broker
        ConnectionFactory factory = new ActiveMQConnectionFactory(BROKER_URL);

        // Bước 2: Tạo Connection (kết nối vật lý TCP tới broker)
        Connection connection = factory.createConnection();
        connection.start(); // Phải gọi start() trước khi gửi/nhận

        // Bước 3: Tạo Session
        // Tham số 1: false = không dùng transaction (giao dịch)
        // Tham số 2: AUTO_ACKNOWLEDGE = broker tự xác nhận sau khi consumer nhận
        Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);

        // Bước 4: Tạo Queue (hàng đợi điểm-đến-điểm)
        Destination queue = session.createQueue(QUEUE_NAME);

        // Bước 5: Tạo MessageProducer
        MessageProducer producer = session.createProducer(queue);

        // Cấu hình DeliveryMode: PERSISTENT = tin nhắn được lưu vào đĩa, không mất khi broker restart
        producer.setDeliveryMode(DeliveryMode.PERSISTENT);

        // Bước 6: Gửi 5 tin nhắn
        for (int i = 1; i <= 5; i++) {
            TextMessage message = session.createTextMessage("Đơn hàng #" + i);
            // Thêm thuộc tính tùy chỉnh vào tin nhắn (header)
            message.setIntProperty("orderId", i);
            producer.send(message);
            System.out.println("Đã gửi: " + message.getText());
        }

        // Bước 7: Đóng tài nguyên (theo thứ tự ngược lại)
        producer.close();
        session.close();
        connection.close();
    }
}
```

## Nhận tin nhắn từ Queue

```java
import org.apache.activemq.ActiveMQConnectionFactory;

import javax.jms.*;

public class QueueConsumer {

    private static final String BROKER_URL = "tcp://localhost:61616";
    private static final String QUEUE_NAME = "DonHangQueue";

    public static void main(String[] args) throws JMSException {
        ConnectionFactory factory = new ActiveMQConnectionFactory(BROKER_URL);
        Connection connection = factory.createConnection();
        connection.start();

        Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
        Destination queue = session.createQueue(QUEUE_NAME);

        // Tạo MessageConsumer để nhận tin nhắn từ queue
        MessageConsumer consumer = session.createConsumer(queue);

        System.out.println("Đang chờ tin nhắn...");

        // Nhận tin nhắn bất đồng bộ bằng MessageListener
        consumer.setMessageListener(message -> {
            if (message instanceof TextMessage textMessage) {
                try {
                    int orderId = textMessage.getIntProperty("orderId");
                    System.out.println("Nhận đơn hàng #" + orderId + ": " + textMessage.getText());
                } catch (JMSException e) {
                    System.err.println("Lỗi xử lý tin nhắn: " + e.getMessage());
                }
            }
        });

        // Giữ chương trình chạy 10 giây để nhận tin nhắn
        try {
            Thread.sleep(10_000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        consumer.close();
        session.close();
        connection.close();
    }
}
```

## Gửi và nhận theo mô hình Topic (Publish/Subscribe)

```java
import org.apache.activemq.ActiveMQConnectionFactory;

import javax.jms.*;

public class TopicPublisher {

    private static final String BROKER_URL = "tcp://localhost:61616";
    private static final String TOPIC_NAME = "ThongBaoHeThong";

    public static void main(String[] args) throws JMSException {
        ConnectionFactory factory = new ActiveMQConnectionFactory(BROKER_URL);
        Connection connection = factory.createConnection();
        connection.start();

        Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);

        // Tạo Topic thay vì Queue — tin nhắn sẽ được gửi đến TẤT CẢ subscriber
        Topic topic = session.createTopic(TOPIC_NAME);

        MessageProducer producer = session.createProducer(topic);

        TextMessage message = session.createTextMessage("Hệ thống sẽ bảo trì lúc 22:00");
        producer.send(message);
        System.out.println("Đã phát thông báo: " + message.getText());

        connection.close();
    }
}
```

```java
import org.apache.activemq.ActiveMQConnectionFactory;

import javax.jms.*;

public class TopicSubscriber {

    private static final String BROKER_URL = "tcp://localhost:61616";
    private static final String TOPIC_NAME = "ThongBaoHeThong";

    public static void main(String[] args) throws JMSException {
        ConnectionFactory factory = new ActiveMQConnectionFactory(BROKER_URL);
        Connection connection = factory.createConnection();
        connection.start();

        Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
        Topic topic = session.createTopic(TOPIC_NAME);

        // Tạo subscriber đăng ký nhận tin từ topic
        MessageConsumer subscriber = session.createConsumer(topic);

        System.out.println("Subscriber đang lắng nghe topic: " + TOPIC_NAME);

        subscriber.setMessageListener(message -> {
            if (message instanceof TextMessage textMessage) {
                try {
                    System.out.println("[Subscriber nhận] " + textMessage.getText());
                } catch (JMSException e) {
                    System.err.println("Lỗi: " + e.getMessage());
                }
            }
        });

        try {
            Thread.sleep(10_000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        connection.close();
    }
}
```

## Các chế độ Acknowledge trong JMS

**Acknowledge** (xác nhận — cơ chế để consumer thông báo đã nhận và xử lý xong tin nhắn):

| Chế độ | Hằng số | Mô tả |
|--------|---------|-------|
| Tự động | `Session.AUTO_ACKNOWLEDGE` | Broker tự xóa sau khi consumer nhận |
| Thủ công | `Session.CLIENT_ACKNOWLEDGE` | Consumer phải gọi `message.acknowledge()` thủ công |
| Trùng lặp | `Session.DUPS_OK_ACKNOWLEDGE` | Có thể xác nhận trùng, hiệu suất cao hơn |

## Các loại Message trong JMS

| Loại | Class | Dữ liệu |
|------|-------|---------|
| **TextMessage** | `javax.jms.TextMessage` | Chuỗi ký tự (String, JSON, XML) |
| **BytesMessage** | `javax.jms.BytesMessage` | Mảng byte |
| **ObjectMessage** | `javax.jms.ObjectMessage` | Đối tượng Java Serializable |
| **MapMessage** | `javax.jms.MapMessage` | Cặp key-value |
| **StreamMessage** | `javax.jms.StreamMessage` | Luồng dữ liệu nguyên thủy |

## Tổng kết

Sau bài này, bạn đã biết cách kết nối JMS client với ActiveMQ, gửi và nhận tin nhắn theo cả hai mô hình Queue và Topic. Đây là nền tảng để xây dựng các hệ thống nhắn tin phức tạp hơn.
