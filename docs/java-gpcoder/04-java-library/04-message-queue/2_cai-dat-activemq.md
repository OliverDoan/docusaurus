---
sidebar_position: 2
title: "Cài đặt ActiveMQ"
---

# Cài đặt ActiveMQ

## ActiveMQ là gì?

**Apache ActiveMQ** (máy chủ tin nhắn mã nguồn mở phổ biến nhất của Java — hỗ trợ giao thức JMS và nhiều giao thức khác) là một **Message Broker** (máy chủ trung gian quản lý hàng đợi tin nhắn) được phát triển bởi Apache Software Foundation. ActiveMQ hỗ trợ nhiều giao thức như **JMS**, **AMQP** (Advanced Message Queuing Protocol — giao thức hàng đợi tin nhắn nâng cao), **STOMP** (Simple Text Oriented Messaging Protocol — giao thức nhắn tin dựa trên văn bản đơn giản), **MQTT** và **WebSocket**.

## Yêu cầu hệ thống

- **Java Development Kit (JDK)** phiên bản 11 trở lên.
- Hệ điều hành: Windows, macOS, hoặc Linux.
- RAM tối thiểu: 512 MB.

## Cách 1: Cài đặt thủ công từ file tải về

### Bước 1: Tải ActiveMQ

Truy cập trang chính thức và tải bản **Classic** (phiên bản ổn định):

```
https://activemq.apache.org/components/classic/download/
```

Tải file `.tar.gz` (Linux/macOS) hoặc `.zip` (Windows).

### Bước 2: Giải nén

```bash
# Linux / macOS
tar -xzf apache-activemq-5.18.3-bin.tar.gz
cd apache-activemq-5.18.3
```

```cmd
# Windows - giải nén file .zip rồi vào thư mục
cd apache-activemq-5.18.3\bin
```

### Bước 3: Khởi động ActiveMQ

```bash
# Linux / macOS
./bin/activemq start

# Windows
bin\activemq.bat start
```

### Bước 4: Kiểm tra ActiveMQ đang chạy

Mở trình duyệt và truy cập **Web Console** (giao diện quản lý web):

```
http://localhost:8161/admin
```

Tài khoản mặc định:
- **Username**: `admin`
- **Password**: `admin`

### Bước 5: Dừng ActiveMQ

```bash
# Linux / macOS
./bin/activemq stop

# Windows
bin\activemq.bat stop
```

## Cách 2: Cài đặt bằng Docker

**Docker** (công cụ đóng gói ứng dụng vào container để chạy nhất quán trên mọi môi trường) là cách nhanh nhất để chạy ActiveMQ mà không cần cài đặt thủ công.

```bash
# Kéo image ActiveMQ từ Docker Hub
docker pull apache/activemq-classic:latest

# Chạy ActiveMQ với các cổng được mở
docker run -d \
  --name activemq \
  -p 61616:61616 \
  -p 8161:8161 \
  apache/activemq-classic:latest
```

Giải thích các cổng:
- **61616**: Cổng **TCP** cho kết nối JMS client.
- **8161**: Cổng HTTP cho **Web Console** quản lý.

## Cách 3: Cài đặt bằng Homebrew (macOS)

```bash
brew install activemq
brew services start activemq
```

## Cấu trúc thư mục ActiveMQ

Sau khi giải nén, cấu trúc thư mục như sau:

```
apache-activemq-5.18.3/
├── bin/          # Script khởi động/dừng
├── conf/         # File cấu hình (activemq.xml, jetty.xml, users.properties)
├── data/         # Dữ liệu lưu trữ tin nhắn (KahaDB)
├── lib/          # Các file JAR thư viện
├── logs/         # File log hệ thống
└── webapps/      # Ứng dụng web (Admin Console)
```

## Cấu hình cơ bản trong activemq.xml

File `conf/activemq.xml` là file cấu hình chính. Một số cấu hình quan trọng:

```xml
<!-- Cấu hình transportConnector - điểm kết nối cho client -->
<transportConnectors>
    <!-- TCP connector cho JMS client -->
    <transportConnector name="openwire" uri="tcp://0.0.0.0:61616?..."/>
    <!-- AMQP connector -->
    <transportConnector name="amqp" uri="amqp://0.0.0.0:5672?..."/>
    <!-- WebSocket connector -->
    <transportConnector name="ws" uri="ws://0.0.0.0:61614?..."/>
</transportConnectors>

<!-- Cấu hình persistenceAdapter - nơi lưu trữ tin nhắn -->
<persistenceAdapter>
    <!-- KahaDB là cơ chế lưu trữ mặc định -->
    <kahaDB directory="${activemq.data}/kahadb"/>
</persistenceAdapter>
```

## Kiểm tra kết nối bằng Java

Sau khi ActiveMQ đang chạy, bạn có thể kiểm tra kết nối nhanh:

```java
import org.apache.activemq.ActiveMQConnectionFactory;

import javax.jms.Connection;
import javax.jms.ConnectionFactory;

public class ActiveMQConnectionTest {

    public static void main(String[] args) {
        // URL kết nối tới ActiveMQ broker
        String brokerUrl = "tcp://localhost:61616";

        try {
            ConnectionFactory factory = new ActiveMQConnectionFactory(brokerUrl);
            Connection connection = factory.createConnection("admin", "admin");
            connection.start();
            System.out.println("Kết nối ActiveMQ thành công!");
            connection.close();
        } catch (Exception e) {
            System.err.println("Lỗi kết nối: " + e.getMessage());
        }
    }
}
```

## Các cổng mặc định của ActiveMQ

| Cổng | Giao thức | Mô tả |
|------|-----------|-------|
| 61616 | OpenWire/TCP | Kết nối JMS client chính |
| 8161 | HTTP | Web Admin Console |
| 5672 | AMQP | Kết nối AMQP client |
| 61613 | STOMP | Kết nối STOMP client |
| 1883 | MQTT | Kết nối IoT/MQTT client |
| 61614 | WebSocket | Kết nối qua WebSocket |

## Tổng kết

Sau khi cài đặt xong, bạn đã có một **Message Broker** hoạt động cục bộ. Bước tiếp theo là kết nối ứng dụng Java với ActiveMQ thông qua JMS API để gửi và nhận tin nhắn.
