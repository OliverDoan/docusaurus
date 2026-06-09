---
sidebar_position: 1
title: "Giới thiệu JMS - Java Message Service"
---

# Giới thiệu JMS - Java Message Service

JMS là bộ API chuẩn của Java cho phép các ứng dụng trao đổi tin nhắn với nhau qua một máy chủ trung gian thay vì gọi trực tiếp. Nhờ đó các thành phần trong hệ thống giao tiếp theo kiểu bất đồng bộ, ít phụ thuộc nhau và đáng tin cậy hơn. Bài này giới thiệu khái niệm tổng quan về JMS cùng ví dụ gửi/nhận tin nhắn cơ bản.

## JMS là gì?

**JMS - Java Message Service** (Dịch vụ tin nhắn Java — một API chuẩn của Java EE cho phép các ứng dụng trao đổi tin nhắn theo cơ chế bất đồng bộ) là một bộ API được định nghĩa bởi Oracle, cho phép các ứng dụng Java tạo, gửi, nhận và đọc tin nhắn thông qua một **Message Broker** (máy chủ trung gian quản lý và định tuyến tin nhắn).

JMS giúp các ứng dụng giao tiếp theo kiểu **loosely coupled** (liên kết lỏng lẻo — nghĩa là các thành phần không phụ thuộc trực tiếp vào nhau), **asynchronous** (bất đồng bộ — bên gửi không cần chờ bên nhận xử lý xong) và **reliable** (đáng tin cậy — đảm bảo tin nhắn được giao tới đích).

## Tại sao cần JMS?

Trong các hệ thống phân tán, nếu hai ứng dụng gọi trực tiếp nhau qua HTTP/REST thì:
- Bên gửi phải chờ bên nhận phản hồi (đồng bộ).
- Nếu bên nhận bị lỗi, tin nhắn có thể bị mất.
- Khó mở rộng khi lưu lượng tăng cao.

JMS giải quyết những vấn đề này bằng cách đưa tin nhắn vào **Queue** (hàng đợi) hoặc **Topic** (chủ đề), và bên nhận sẽ lấy tin nhắn ra xử lý khi sẵn sàng.

## Các khái niệm cốt lõi trong JMS

| Thuật ngữ | Nghĩa |
|---|---|
| **Producer** | Bên sản xuất — ứng dụng gửi tin nhắn |
| **Consumer** | Bên tiêu thụ — ứng dụng nhận tin nhắn |
| **Message Broker** | Máy chủ trung gian quản lý và lưu trữ tin nhắn |
| **Queue** | Hàng đợi điểm-đến-điểm, mỗi tin nhắn chỉ được một Consumer nhận |
| **Topic** | Chủ đề, tin nhắn được phát cho tất cả Consumer đang đăng ký |
| **ConnectionFactory** | Đối tượng tạo kết nối tới Message Broker |
| **Destination** | Đích đến của tin nhắn (Queue hoặc Topic) |
| **Session** | Phiên làm việc để gửi/nhận tin nhắn |

## Hai mô hình nhắn tin trong JMS

### Point-to-Point (P2P) — Điểm-đến-điểm

- Sử dụng **Queue**.
- Mỗi tin nhắn chỉ được **một Consumer** xử lý duy nhất.
- Phù hợp cho các tác vụ như: xử lý đơn hàng, gửi email, thanh toán.

```
Producer --> [Queue] --> Consumer A (chỉ một người nhận)
```

### Publish/Subscribe (Pub/Sub) — Xuất bản/Đăng ký

- Sử dụng **Topic**.
- Một tin nhắn được gửi đến **tất cả Consumer** đang đăng ký Topic đó.
- Phù hợp cho: thông báo hệ thống, cập nhật giá cổ phiếu, live feed.

```
Producer --> [Topic] --> Consumer A
                    --> Consumer B
                    --> Consumer C
```

## Ví dụ JMS cơ bản với ActiveMQ

```java
import org.apache.activemq.ActiveMQConnectionFactory;

import javax.jms.*;

public class JmsProducerExample {

    public static void main(String[] args) throws JMSException {
        // Tạo ConnectionFactory kết nối tới ActiveMQ broker
        ConnectionFactory factory = new ActiveMQConnectionFactory("tcp://localhost:61616");

        // Tạo Connection (kết nối vật lý tới broker)
        Connection connection = factory.createConnection();
        connection.start();

        // Tạo Session (phiên làm việc, false = không dùng transaction, AUTO_ACKNOWLEDGE = tự xác nhận)
        Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);

        // Tạo Queue với tên "HelloQueue"
        Destination destination = session.createQueue("HelloQueue");

        // Tạo MessageProducer để gửi tin nhắn
        MessageProducer producer = session.createProducer(destination);

        // Tạo và gửi tin nhắn dạng text
        TextMessage message = session.createTextMessage("Xin chào từ JMS Producer!");
        producer.send(message);

        System.out.println("Đã gửi tin nhắn: " + message.getText());

        // Đóng kết nối
        connection.close();
    }
}
```

```java
import org.apache.activemq.ActiveMQConnectionFactory;

import javax.jms.*;

public class JmsConsumerExample {

    public static void main(String[] args) throws JMSException {
        ConnectionFactory factory = new ActiveMQConnectionFactory("tcp://localhost:61616");
        Connection connection = factory.createConnection();
        connection.start();

        Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
        Destination destination = session.createQueue("HelloQueue");

        // Tạo MessageConsumer để nhận tin nhắn từ Queue
        MessageConsumer consumer = session.createConsumer(destination);

        // Nhận tin nhắn (chờ tối đa 5 giây)
        Message message = consumer.receive(5000);

        if (message instanceof TextMessage textMessage) {
            System.out.println("Nhận được tin nhắn: " + textMessage.getText());
        }

        connection.close();
    }
}
```

## Dependency Maven

Để sử dụng JMS với ActiveMQ, thêm dependency sau vào `pom.xml`:

```xml
<dependency>
    <groupId>org.apache.activemq</groupId>
    <artifactId>activemq-all</artifactId>
    <version>5.18.3</version>
</dependency>
```

## Tổng kết

JMS là nền tảng quan trọng trong lập trình Java doanh nghiệp. Hiểu rõ JMS giúp bạn xây dựng các hệ thống phân tán có khả năng mở rộng, chịu lỗi tốt và giao tiếp hiệu quả giữa các dịch vụ.
