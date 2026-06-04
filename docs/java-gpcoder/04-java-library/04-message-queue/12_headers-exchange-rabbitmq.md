---
sidebar_position: 12
title: "Sử dụng Headers Exchange trong RabbitMQ"
---

# Sử dụng Headers Exchange trong RabbitMQ

## Headers Exchange là gì?

**Headers Exchange** (bộ định tuyến theo tiêu đề — loại exchange định tuyến tin nhắn dựa trên các thuộc tính trong AMQP header của tin nhắn thay vì dựa vào routing key) là loại Exchange đặc biệt trong RabbitMQ. Thay vì so sánh routing key, nó so sánh **các cặp key-value** trong header của tin nhắn với các điều kiện binding.

## Đặc điểm nổi bật

- **Routing Key bị bỏ qua** hoàn toàn.
- Định tuyến dựa trên **header attributes** (thuộc tính tiêu đề) của tin nhắn.
- Hỗ trợ hai chế độ so khớp qua thuộc tính đặc biệt `x-match`:
  - `x-match = all` (tất cả): Tất cả các điều kiện header phải khớp (**AND logic**).
  - `x-match = any` (bất kỳ): Chỉ cần một điều kiện header khớp (**OR logic**).

## Khi nào dùng Headers Exchange?

- Khi điều kiện định tuyến phức tạp và không thể biểu diễn bằng chuỗi routing key đơn giản.
- Khi cần lọc tin nhắn theo nhiều thuộc tính kết hợp (loại nội dung, ngôn ngữ, vùng, phiên bản...).
- Khi routing key không đủ linh hoạt cho bài toán.

## Ví dụ thực tế: Hệ thống xử lý tài liệu đa định dạng

Hệ thống nhận tài liệu từ nhiều nguồn, cần định tuyến dựa trên:
- `format`: định dạng file (`pdf`, `excel`, `word`, `csv`).
- `language`: ngôn ngữ (`vi`, `en`, `ja`).
- `priority`: mức ưu tiên (`high`, `normal`, `low`).

### Thiết lập Headers Exchange

```java
import com.rabbitmq.client.*;
import java.util.HashMap;
import java.util.Map;

public class HeadersExchangeSetup {

    public static final String EXCHANGE_NAME = "document-headers";

    public static void setup(Channel channel) throws Exception {
        // Khai báo Headers Exchange
        channel.exchangeDeclare(EXCHANGE_NAME, BuiltinExchangeType.HEADERS, true, false, null);

        // --- Queue 1: Xử lý tài liệu PDF tiếng Việt ---
        // x-match=all: CẢ HAI điều kiện phải khớp (AND)
        channel.queueDeclare("pdf-vietnamese-queue", true, false, false, null);
        Map<String, Object> bindingArgs1 = new HashMap<>();
        bindingArgs1.put("x-match", "all");      // AND logic
        bindingArgs1.put("format", "pdf");
        bindingArgs1.put("language", "vi");
        channel.queueBind("pdf-vietnamese-queue", EXCHANGE_NAME, "", bindingArgs1);

        // --- Queue 2: Xử lý tài liệu ưu tiên cao (bất kỳ định dạng) ---
        // x-match=any: CHỈ CẦN MỘT điều kiện khớp (OR)
        channel.queueDeclare("high-priority-queue", true, false, false, null);
        Map<String, Object> bindingArgs2 = new HashMap<>();
        bindingArgs2.put("x-match", "any");      // OR logic
        bindingArgs2.put("priority", "high");
        bindingArgs2.put("urgent", "true");
        channel.queueBind("high-priority-queue", EXCHANGE_NAME, "", bindingArgs2);

        // --- Queue 3: Xử lý file Excel hoặc CSV ---
        // x-match=any: Excel HOẶC CSV
        channel.queueDeclare("spreadsheet-queue", true, false, false, null);
        Map<String, Object> bindingArgs3 = new HashMap<>();
        bindingArgs3.put("x-match", "any");
        bindingArgs3.put("format", "excel");
        bindingArgs3.put("format", "csv"); // Lưu ý: Map không chứa key trùng, dùng List thay thế
        channel.queueBind("spreadsheet-queue", EXCHANGE_NAME, "", bindingArgs3);

        // Cách đúng cho nhiều giá trị cùng key: tạo hai binding riêng
        channel.queueBind("spreadsheet-queue", EXCHANGE_NAME, "", Map.of("x-match", "any", "format", "excel"));
        channel.queueBind("spreadsheet-queue", EXCHANGE_NAME, "", Map.of("x-match", "any", "format", "csv"));

        System.out.println("Headers Exchange đã được thiết lập.");
    }
}
```

### Producer: Gửi tài liệu với header metadata

```java
import com.rabbitmq.client.*;
import java.util.Map;

public class DocumentProducer {

    public static void main(String[] args) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {

            HeadersExchangeSetup.setup(channel);

            // Tài liệu 1: PDF tiếng Việt — sẽ khớp "pdf-vietnamese-queue"
            sendDocument(channel,
                    Map.of("format", "pdf", "language", "vi", "priority", "normal"),
                    "Báo cáo tài chính tháng 6/2024");

            // Tài liệu 2: PDF tiếng Anh — KHÔNG khớp "pdf-vietnamese-queue" (sai language)
            sendDocument(channel,
                    Map.of("format", "pdf", "language", "en", "priority", "normal"),
                    "Annual Financial Report 2024");

            // Tài liệu 3: Word ưu tiên cao — khớp "high-priority-queue"
            sendDocument(channel,
                    Map.of("format", "word", "language", "vi", "priority", "high"),
                    "Hợp đồng cần ký gấp");

            // Tài liệu 4: PDF tiếng Việt + ưu tiên cao — khớp CẢ HAI queue
            sendDocument(channel,
                    Map.of("format", "pdf", "language", "vi", "priority", "high"),
                    "Báo cáo khẩn cần xử lý ngay");

            // Tài liệu 5: File Excel — khớp "spreadsheet-queue"
            sendDocument(channel,
                    Map.of("format", "excel", "language", "en", "priority", "normal"),
                    "Data export Q2 2024.xlsx");
        }
    }

    private static void sendDocument(Channel channel, Map<String, Object> headers, String content)
            throws Exception {
        AMQP.BasicProperties props = new AMQP.BasicProperties.Builder()
                .contentType("text/plain")
                .deliveryMode(2)
                .headers(headers)   // Đính kèm header — đây là cơ sở để Headers Exchange định tuyến
                .build();

        // Routing key "" vì Headers Exchange bỏ qua routing key
        channel.basicPublish(HeadersExchangeSetup.EXCHANGE_NAME, "", props, content.getBytes("UTF-8"));

        System.out.printf("[Producer] Headers=%s | Nội dung='%s'%n", headers, content);
    }
}
```

### Consumer: Xử lý tài liệu

```java
import com.rabbitmq.client.*;
import java.util.Map;

public class DocumentConsumer {

    public static void main(String[] args) throws Exception {
        if (args.length == 0) {
            System.err.println("Dùng: DocumentConsumer <pdf-vietnamese-queue|high-priority-queue|spreadsheet-queue>");
            return;
        }

        String queueName = args[0];
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");

        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();
        HeadersExchangeSetup.setup(channel);

        System.out.println("[Consumer:" + queueName + "] Đang chờ tài liệu...");

        channel.basicConsume(queueName, true, (tag, delivery) -> {
            // Lấy header từ tin nhắn
            Map<String, Object> headers = delivery.getProperties().getHeaders();
            String content = new String(delivery.getBody(), "UTF-8");

            System.out.printf("[Consumer:%s] Headers=%s%n", queueName, headers);
            System.out.printf("[Consumer:%s] Nội dung='%s'%n", queueName, content);
            System.out.println("---");
        }, tag -> {});
    }
}
```

## Bảng phân tích kết quả định tuyến

| Tài liệu | format | language | priority | pdf-vietnamese | high-priority | spreadsheet |
|----------|--------|----------|----------|---------------|---------------|-------------|
| Báo cáo tài chính | pdf | vi | normal | ✓ (all khớp) | | |
| Annual Report | pdf | en | normal | (language sai) | | |
| Hợp đồng khẩn | word | vi | high | (format sai) | ✓ (any: priority) | |
| Báo cáo khẩn | pdf | vi | high | ✓ (all khớp) | ✓ (any: priority) | |
| Excel export | excel | en | normal | | | ✓ (any: format) |

## So sánh Headers Exchange với các loại khác

| Tiêu chí | Direct | Topic | Headers |
|----------|--------|-------|---------|
| Cơ chế định tuyến | Routing Key chính xác | Pattern với wildcard | Header key-value |
| Routing Key | Bắt buộc | Bắt buộc | Bị bỏ qua |
| Logic lọc | Đơn giản | Pattern | AND / OR |
| Độ linh hoạt | Thấp | Trung bình | Cao |
| Hiệu suất | Cao | Cao | Thấp hơn một chút |

## Tổng kết

Headers Exchange là lựa chọn khi routing key không đủ để biểu diễn điều kiện phức tạp. Tuy nhiên, do hiệu suất thấp hơn và khó đọc hơn so với Direct/Topic Exchange, hãy chỉ dùng khi thực sự cần thiết. Trong hầu hết trường hợp, Topic Exchange đã đủ linh hoạt.
