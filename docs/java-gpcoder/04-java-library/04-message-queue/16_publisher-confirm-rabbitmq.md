---
sidebar_position: 16
title: "Sử dụng Publisher Confirm trong RabbitMQ"
---

# Sử dụng Publisher Confirm trong RabbitMQ

## Publisher Confirm là gì?

**Publisher Confirm** (xác nhận từ nhà xuất bản — cơ chế RabbitMQ gửi lại xác nhận cho Producer sau khi tin nhắn đã được broker tiếp nhận và xử lý an toàn) là giải pháp đảm bảo độ tin cậy phía Producer. Mặc định, khi Producer gọi `basicPublish()`, nó không biết liệu tin nhắn có thực sự đến được broker hay không.

Không có Publisher Confirm: **Fire and Forget** (bắn và quên — gửi xong không quan tâm kết quả).

Với Publisher Confirm: **At-Least-Once Delivery** (đảm bảo giao ít nhất một lần — tin nhắn chắc chắn được broker nhận).

## Khi nào cần Publisher Confirm?

- Giao dịch tài chính, thanh toán.
- Đặt hàng, đặt vé.
- Bất kỳ tình huống nào mà mất tin nhắn gây ra hậu quả nghiêm trọng.

## Ba cách sử dụng Publisher Confirm

### Cách 1: Confirm đồng bộ từng tin nhắn (Đơn giản nhất)

```java
import com.rabbitmq.client.*;

public class SynchronousPublisherConfirm {

    public static void main(String[] args) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {

            channel.queueDeclare("confirm-demo", true, false, false, null);

            // Bật chế độ Publisher Confirm trên channel này
            // Sau khi gọi, channel.getNextPublishSeqNo() bắt đầu đánh số từ 1
            channel.confirmSelect();

            for (int i = 1; i <= 5; i++) {
                String message = "Tin nhắn #" + i;
                channel.basicPublish("", "confirm-demo",
                        MessageProperties.PERSISTENT_TEXT_PLAIN,
                        message.getBytes("UTF-8"));

                System.out.println("[Producer] Đã gửi: " + message);

                // waitForConfirms(): Chờ broker xác nhận (blocking — chặn luồng)
                // Trả về true nếu được ACK, ném exception nếu NACK
                boolean confirmed = channel.waitForConfirms(5_000); // timeout 5 giây

                if (confirmed) {
                    System.out.println("[Producer] Broker xác nhận: " + message);
                } else {
                    System.err.println("[Producer] CẢNH BÁO: Không nhận được xác nhận cho: " + message);
                }
            }

            System.out.println("Hoàn tất. Tất cả tin nhắn đã được xác nhận.");
        }
    }
}
```

**Nhược điểm**: Gửi xong phải chờ xác nhận mới gửi tiếp → **Chậm** (chỉ ~100-200 msg/giây).

### Cách 2: Confirm theo lô (Batch Confirm)

```java
import com.rabbitmq.client.*;

public class BatchPublisherConfirm {

    private static final int BATCH_SIZE = 100; // Xác nhận sau mỗi 100 tin nhắn

    public static void main(String[] args) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {

            channel.queueDeclare("batch-confirm-demo", true, false, false, null);
            channel.confirmSelect();

            int outstandingConfirms = 0;
            long startTime = System.currentTimeMillis();

            for (int i = 1; i <= 1000; i++) {
                String message = "Tin nhắn batch #" + i;
                channel.basicPublish("", "batch-confirm-demo",
                        MessageProperties.PERSISTENT_TEXT_PLAIN,
                        message.getBytes("UTF-8"));
                outstandingConfirms++;

                // Khi đã gửi đủ BATCH_SIZE tin nhắn, chờ xác nhận tất cả
                if (outstandingConfirms == BATCH_SIZE) {
                    channel.waitForConfirmsOrDie(10_000); // Ném exception nếu có NACK
                    outstandingConfirms = 0;
                    System.out.println("Đã xác nhận lô " + (i / BATCH_SIZE));
                }
            }

            // Xác nhận lô cuối (nếu còn)
            if (outstandingConfirms > 0) {
                channel.waitForConfirmsOrDie(10_000);
            }

            long elapsed = System.currentTimeMillis() - startTime;
            System.out.println("Gửi 1000 tin nhắn mất: " + elapsed + "ms");
        }
    }
}
```

**Cải thiện**: Nhanh hơn Cách 1 (~10-20x), nhưng khi có lỗi không biết tin nào trong lô bị fail.

### Cách 3: Confirm bất đồng bộ (Async Confirm — Khuyến nghị cho production)

```java
import com.rabbitmq.client.*;
import java.util.concurrent.ConcurrentNavigableMap;
import java.util.concurrent.ConcurrentSkipListMap;

public class AsyncPublisherConfirm {

    public static void main(String[] args) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {

            channel.queueDeclare("async-confirm-demo", true, false, false, null);
            channel.confirmSelect();

            // Map theo dõi các tin nhắn đang chờ xác nhận
            // Key: seqNo (số thứ tự), Value: nội dung tin nhắn
            // ConcurrentSkipListMap: thread-safe và hỗ trợ headMap() để xử lý bulk confirm
            ConcurrentNavigableMap<Long, String> outstandingConfirms = new ConcurrentSkipListMap<>();

            // Đăng ký callback nhận xác nhận bất đồng bộ từ broker
            ConfirmListener listener = new ConfirmListener() {

                // Được gọi khi broker xác nhận thành công (ACK)
                @Override
                public void handleAck(long deliveryTag, boolean multiple) {
                    if (multiple) {
                        // multiple=true: tất cả tin nhắn có seqNo <= deliveryTag đều được ACK
                        ConcurrentNavigableMap<Long, String> confirmed =
                                outstandingConfirms.headMap(deliveryTag, true);
                        System.out.println("[ACK] Xác nhận " + confirmed.size() + " tin nhắn (bulk)");
                        confirmed.clear();
                    } else {
                        // Chỉ xác nhận tin nhắn có seqNo = deliveryTag
                        String msg = outstandingConfirms.remove(deliveryTag);
                        System.out.println("[ACK] Xác nhận: " + msg);
                    }
                }

                // Được gọi khi broker từ chối (NACK — lỗi nội bộ broker)
                @Override
                public void handleNack(long deliveryTag, boolean multiple) {
                    if (multiple) {
                        ConcurrentNavigableMap<Long, String> failed =
                                outstandingConfirms.headMap(deliveryTag, true);
                        System.err.println("[NACK] " + failed.size() + " tin nhắn bị từ chối!");
                        // Xử lý: retry, ghi log, gửi cảnh báo...
                        failed.clear();
                    } else {
                        String msg = outstandingConfirms.remove(deliveryTag);
                        System.err.println("[NACK] Tin nhắn bị từ chối: " + msg);
                        // Retry logic...
                    }
                }
            };

            channel.addConfirmListener(listener);

            // Gửi 1000 tin nhắn mà không cần chờ xác nhận
            long startTime = System.currentTimeMillis();
            for (int i = 1; i <= 1000; i++) {
                String message = "Tin nhắn async #" + i;

                // getNextPublishSeqNo(): lấy số thứ tự của tin nhắn SẮP gửi
                long seqNo = channel.getNextPublishSeqNo();
                outstandingConfirms.put(seqNo, message);

                channel.basicPublish("", "async-confirm-demo",
                        MessageProperties.PERSISTENT_TEXT_PLAIN,
                        message.getBytes("UTF-8"));
            }

            long elapsed = System.currentTimeMillis() - startTime;
            System.out.println("Gửi 1000 tin nhắn mất: " + elapsed + "ms (không chờ confirm)");

            // Chờ tất cả confirm về (trong ứng dụng thực tế, logic này được quản lý trong vòng đời app)
            Thread.sleep(3_000);
            System.out.println("Còn lại chưa confirm: " + outstandingConfirms.size());
        }
    }
}
```

## So sánh ba phương pháp

| Phương pháp | Throughput | Độ phức tạp | Phát hiện lỗi cụ thể |
|-------------|-----------|-------------|---------------------|
| Đồng bộ từng tin | Thấp (~200/s) | Đơn giản | Chính xác từng tin |
| Batch theo lô | Trung bình (~2000/s) | Trung bình | Theo lô (không biết tin nào fail) |
| Async callback | Cao (~10000+/s) | Phức tạp | Chính xác từng tin |

## Return Listener — Bắt tin nhắn không thể giao

**Return Listener** (bộ lắng nghe trả về — callback nhận lại tin nhắn không thể định tuyến khi dùng flag `mandatory`):

```java
// Thêm ReturnListener để nhận lại tin nhắn không thể định tuyến
channel.addReturnListener((replyCode, replyText, exchange, routingKey, properties, body) -> {
    System.err.printf("[RETURN] Tin nhắn không thể giao!%n");
    System.err.printf("  Lý do: %d - %s%n", replyCode, replyText);
    System.err.printf("  Exchange: %s, RoutingKey: %s%n", exchange, routingKey);
    System.err.printf("  Nội dung: %s%n", new String(body));
});

// Gửi với mandatory=true: broker trả về tin nhắn nếu không định tuyến được
channel.basicPublish("my-exchange", "no-binding-key",
        true,   // mandatory flag
        MessageProperties.PERSISTENT_TEXT_PLAIN,
        "Tin nhắn có thể không đến được".getBytes());
```

## Tổng kết

Publisher Confirm là cơ chế không thể thiếu trong hệ thống production cần đảm bảo độ tin cậy phía gửi. Kết hợp với **Persistent Messages** (tin nhắn bền vững) và **Durable Queues** (queue bền vững), Publisher Confirm giúp đạt được **At-Least-Once Delivery** — đảm bảo tin nhắn không bao giờ bị mất.
