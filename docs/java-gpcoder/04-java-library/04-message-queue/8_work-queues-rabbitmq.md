---
sidebar_position: 8
title: "Work Queues trong RabbitMQ"
---

# Work Queues trong RabbitMQ

Work Queue là mô hình chia một đống công việc tốn thời gian cho nhiều worker xử lý song song, mỗi tin nhắn chỉ do một worker đảm nhận. Đây là cách phổ biến để tăng tốc các tác vụ nặng như gửi email hàng loạt hay xử lý ảnh. Bài này trình bày cơ chế phân phối, xác nhận tin nhắn và cách đảm bảo không mất việc khi worker gặp sự cố.

## Work Queue là gì?

**Work Queue** (hàng đợi công việc — còn gọi là Task Queue, mô hình phân phối công việc nặng cho nhiều worker xử lý song song) là mô hình trong đó nhiều **Worker** (người lao động — consumer xử lý công việc) cùng lắng nghe một Queue và mỗi tin nhắn chỉ được một Worker xử lý. Mục tiêu là phân tải công việc tốn thời gian cho nhiều worker chạy song song.

## Khi nào dùng Work Queue?

- Gửi email hàng loạt.
- Xử lý ảnh, video.
- Tính toán nặng (báo cáo, thống kê).
- Crawl dữ liệu web.
- Bất kỳ tác vụ nào tốn thời gian và cần chạy song song.

## Cơ chế Round-Robin Dispatching

**Round-Robin** (phân phối vòng tròn — phương thức chia đều tin nhắn cho các worker theo thứ tự luân phiên) là hành vi mặc định: RabbitMQ gửi mỗi tin nhắn tới worker tiếp theo theo vòng tròn.

```
Tin nhắn 1 --> Worker A
Tin nhắn 2 --> Worker B
Tin nhắn 3 --> Worker A
Tin nhắn 4 --> Worker B
...
```

## Ví dụ thực tế: Hệ thống xử lý ảnh

### Producer: Thêm công việc vào Queue

```java
import com.rabbitmq.client.*;

public class ImageTaskProducer {

    private static final String QUEUE_NAME = "xu-ly-anh";

    public static void main(String[] args) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {

            // Khai báo queue bền vững (durable=true)
            // Nếu broker restart, queue và tin nhắn vẫn còn
            channel.queueDeclare(QUEUE_NAME, true, false, false, null);

            // Mô phỏng 10 ảnh cần xử lý
            String[] images = {
                "anh_1.jpg", "anh_2.png", "anh_3.gif",
                "anh_4.jpg", "anh_5.png", "anh_6.jpg",
                "anh_7.gif", "anh_8.png", "anh_9.jpg", "anh_10.jpg"
            };

            for (String imageName : images) {
                // Sử dụng MessageProperties.PERSISTENT_TEXT_PLAIN để đảm bảo tin nhắn được lưu vào đĩa
                AMQP.BasicProperties props = MessageProperties.PERSISTENT_TEXT_PLAIN;
                channel.basicPublish("", QUEUE_NAME, props, imageName.getBytes("UTF-8"));
                System.out.println("[Producer] Đã thêm công việc: " + imageName);
            }
        }
    }
}
```

### Worker: Xử lý công việc

```java
import com.rabbitmq.client.*;

public class ImageWorker {

    private static final String QUEUE_NAME = "xu-ly-anh";
    private final String workerName;

    public ImageWorker(String workerName) {
        this.workerName = workerName;
    }

    public void start() throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        channel.queueDeclare(QUEUE_NAME, true, false, false, null);

        // QoS (Quality of Service — chất lượng dịch vụ): prefetchCount=1
        // Worker chỉ nhận 1 tin nhắn mới SAU KHI đã xác nhận xong tin nhắn cũ
        // Điều này đảm bảo worker bận không nhận thêm công việc
        channel.basicQos(1);

        System.out.println("[" + workerName + "] Đang chờ công việc...");

        DeliverCallback deliverCallback = (consumerTag, delivery) -> {
            String imageName = new String(delivery.getBody(), "UTF-8");
            System.out.println("[" + workerName + "] Bắt đầu xử lý: " + imageName);

            try {
                // Giả lập thời gian xử lý (số dấu chấm trong tên = số giây)
                int processingTime = imageName.chars().filter(c -> c == '.').count() * 1000;
                if (processingTime == 0) processingTime = 1000;
                Thread.sleep(processingTime);
                System.out.println("[" + workerName + "] Hoàn thành: " + imageName);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                // Xác nhận đã xử lý xong — RabbitMQ sẽ xóa tin nhắn khỏi queue
                channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
            }
        };

        // autoAck=false: phải xác nhận thủ công (manual acknowledgment)
        channel.basicConsume(QUEUE_NAME, false, deliverCallback, tag -> {});
    }

    public static void main(String[] args) throws Exception {
        String name = args.length > 0 ? args[0] : "Worker-1";
        new ImageWorker(name).start();
    }
}
```

## Message Acknowledgment — Xác nhận tin nhắn

**Acknowledgment** (xác nhận — cơ chế consumer báo với RabbitMQ rằng tin nhắn đã được xử lý thành công) là cực kỳ quan trọng:

```java
// XÁC NHẬN THÀNH CÔNG: Tin nhắn bị xóa khỏi queue
channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);

// TỪ CHỐI — requeue=true: Tin nhắn được đưa lại vào queue (để worker khác xử lý)
channel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, true);

// TỪ CHỐI — requeue=false: Tin nhắn bị bỏ (hoặc gửi vào Dead Letter Exchange)
channel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, false);
```

### Điều gì xảy ra khi Worker bị crash?

Nếu `autoAck=false` và worker bị crash trước khi gọi `basicAck`, RabbitMQ sẽ tự động **requeue** (đưa lại vào hàng đợi) tin nhắn đó để worker khác xử lý. Đây là cách RabbitMQ đảm bảo không mất tin nhắn.

## Fair Dispatch — Phân phối công bằng

Vấn đề của Round-Robin thuần túy: nếu Worker A luôn nhận công việc nặng và Worker B nhận việc nhẹ, Worker B sẽ rảnh trong khi Worker A quá tải.

Giải pháp: `basicQos(1)` + `autoAck=false`:

```java
// Chỉ giao tin nhắn mới khi worker đã xác nhận xong tin nhắn hiện tại
// Nếu worker đang bận, RabbitMQ sẽ giao cho worker rảnh hơn
channel.basicQos(1);
```

```
Không dùng QoS (Round-Robin thuần):
Worker A: [task1, task3, task5, task7] -- có thể quá tải
Worker B: [task2, task4, task6, task8] -- có thể nhàn rỗi

Dùng basicQos(1) (Fair Dispatch):
Worker A: [task1, task4] -- đang bận xử lý lâu
Worker B: [task2, task3, task5, task6, task7, task8] -- đang rảnh, nhận nhiều hơn
```

## Chạy nhiều Worker song song

```java
public class WorkerMain {
    public static void main(String[] args) throws Exception {
        // Khởi động 3 worker song song trong các thread riêng
        for (int i = 1; i <= 3; i++) {
            final String workerName = "Worker-" + i;
            Thread workerThread = new Thread(() -> {
                try {
                    new ImageWorker(workerName).start();
                } catch (Exception e) {
                    System.err.println(workerName + " gặp lỗi: " + e.getMessage());
                }
            });
            workerThread.setDaemon(true);
            workerThread.start();
            System.out.println("Đã khởi động " + workerName);
        }

        // Giữ chương trình chạy
        Thread.currentThread().join();
    }
}
```

## Tổng kết so sánh autoAck

| | `autoAck=true` | `autoAck=false` |
|---|---|---|
| Khi nào xóa tin nhắn | Ngay khi giao cho consumer | Sau khi consumer gọi `basicAck` |
| An toàn | Thấp (mất tin nhắn nếu crash) | Cao (tin nhắn được requeue) |
| Hiệu suất | Cao hơn | Thấp hơn một chút |
| Khuyến nghị | Test/Dev | Production |

## Tổng kết

Work Queue là mô hình cơ bản và phổ biến nhất trong RabbitMQ. Kết hợp `durable queue` + `persistent message` + `manual acknowledgment` + `basicQos(1)` là công thức chuẩn để xây dựng hệ thống xử lý công việc đáng tin cậy và hiệu quả.
