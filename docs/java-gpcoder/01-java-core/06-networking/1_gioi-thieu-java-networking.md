---
sidebar_position: 1
title: "Lập trình mạng với Java - Java Networking"
---

# Lập trình mạng với Java - Java Networking

## 1. Giới thiệu

**Java Networking** (lập trình mạng trong Java) là tập hợp các API giúp ứng dụng Java giao tiếp qua mạng máy tính — bao gồm mạng nội bộ (LAN) và Internet. Java cung cấp gói `java.net` với nhiều lớp tiện ích để xử lý địa chỉ IP, URL, kết nối TCP và UDP.

Hai giao thức truyền tải phổ biến nhất:

- **TCP** (Transmission Control Protocol — Giao thức điều khiển truyền tải): kết nối đáng tin cậy, đảm bảo dữ liệu đến đúng thứ tự.
- **UDP** (User Datagram Protocol — Giao thức gói tin người dùng): không kết nối, nhanh hơn nhưng không đảm bảo thứ tự hoặc toàn vẹn dữ liệu.

---

## 2. Lớp InetAddress — Địa chỉ IP

**InetAddress** (địa chỉ Internet) đại diện cho một địa chỉ IP (IPv4 hoặc IPv6). Lớp này không có constructor công khai; bạn lấy đối tượng qua các phương thức tĩnh.

### Các phương thức quan trọng

| Phương thức | Mô tả |
|---|---|
| `InetAddress.getByName(host)` | Tra cứu địa chỉ IP theo tên miền hoặc chuỗi IP |
| `InetAddress.getLocalHost()` | Lấy địa chỉ máy hiện tại |
| `getHostAddress()` | Trả về chuỗi địa chỉ IP |
| `getHostName()` | Trả về tên miền (hostname) |

### Ví dụ

```java
import java.net.InetAddress;
import java.net.UnknownHostException;

public class InetAddressDemo {
    public static void main(String[] args) {
        try {
            // Tra cứu địa chỉ IP của google.com
            InetAddress address = InetAddress.getByName("google.com");
            System.out.println("Tên miền  : " + address.getHostName());
            System.out.println("Địa chỉ IP: " + address.getHostAddress());

            // Lấy thông tin máy cục bộ (localhost)
            InetAddress local = InetAddress.getLocalHost();
            System.out.println("Máy hiện tại: " + local.getHostName()
                    + " / " + local.getHostAddress());

        } catch (UnknownHostException e) {
            // UnknownHostException — ngoại lệ tên miền không xác định
            System.err.println("Không tìm thấy host: " + e.getMessage());
        }
    }
}
```

**Giải thích thuật ngữ:**
- **Host** (máy chủ / máy đầu cuối): bất kỳ thiết bị nào có địa chỉ IP trên mạng.
- **UnknownHostException**: ngoại lệ ném ra khi tên miền không phân giải được thành địa chỉ IP.

---

## 3. Lớp URL và URLConnection — Kết nối HTTP đơn giản

**URL** (Uniform Resource Locator — Định vị tài nguyên đồng nhất) biểu diễn một địa chỉ tài nguyên trên mạng, ví dụ `https://example.com/data`.

**URLConnection** (kết nối URL) là lớp trừu tượng cho phép đọc/ghi dữ liệu từ một URL.

### Ví dụ đọc nội dung trang web

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;

public class URLDemo {
    public static void main(String[] args) {
        try {
            URL url = new URL("https://example.com");

            // Mở kết nối tới URL
            URLConnection connection = url.openConnection();

            // InputStreamReader — bộ đọc luồng đầu vào, chuyển byte thành ký tự
            // BufferedReader — bộ đọc có vùng đệm, đọc từng dòng hiệu quả hơn
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(connection.getInputStream()));

            String line;
            int lineCount = 0;
            // Chỉ in 10 dòng đầu tiên để minh hoạ
            while ((line = reader.readLine()) != null && lineCount < 10) {
                System.out.println(line);
                lineCount++;
            }
            reader.close();

        } catch (Exception e) {
            System.err.println("Lỗi kết nối: " + e.getMessage());
        }
    }
}
```

**Giải thích thuật ngữ:**
- **InputStream** (luồng đầu vào): luồng đọc dữ liệu dạng byte từ nguồn (mạng, file...).
- **BufferedReader**: bọc ngoài Reader để đọc từng dòng, giảm số lần truy cập I/O.

---

## 4. Giao thức UDP — DatagramSocket và DatagramPacket

Với UDP, không cần thiết lập kết nối trước. Dữ liệu được đóng gói trong **DatagramPacket** (gói tin dạng datagram) và gửi qua **DatagramSocket** (socket kiểu datagram).

### Phía gửi (Sender)

```java
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;

public class UDPSender {
    public static void main(String[] args) throws Exception {
        String message = "Xin chào từ UDP Sender!";
        byte[] data = message.getBytes("UTF-8");

        InetAddress serverAddress = InetAddress.getByName("localhost");
        int serverPort = 9090;

        // DatagramPacket — gói dữ liệu UDP chứa nội dung, địa chỉ đích và cổng đích
        DatagramPacket packet = new DatagramPacket(data, data.length, serverAddress, serverPort);

        // DatagramSocket — socket UDP để gửi/nhận gói tin
        try (DatagramSocket socket = new DatagramSocket()) {
            socket.send(packet);
            System.out.println("Đã gửi: " + message);
        }
    }
}
```

### Phía nhận (Receiver)

```java
import java.net.DatagramPacket;
import java.net.DatagramSocket;

public class UDPReceiver {
    public static void main(String[] args) throws Exception {
        int port = 9090;
        byte[] buffer = new byte[1024]; // Vùng đệm nhận dữ liệu

        // Lắng nghe trên cổng 9090
        try (DatagramSocket socket = new DatagramSocket(port)) {
            System.out.println("UDP Receiver đang lắng nghe trên cổng " + port);
            DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
            socket.receive(packet); // Chặn cho đến khi nhận được gói tin

            String received = new String(packet.getData(), 0, packet.getLength(), "UTF-8");
            System.out.println("Nhận được: " + received);
            System.out.println("Từ địa chỉ: " + packet.getAddress().getHostAddress());
        }
    }
}
```

**Giải thích thuật ngữ:**
- **Port** (cổng): số nguyên 0–65535, định danh một tiến trình/dịch vụ trên máy.
- **Buffer** (vùng đệm): mảng byte tạm thời dùng để chứa dữ liệu trong quá trình truyền.
- **Datagram** (gói tin): đơn vị truyền dữ liệu độc lập trong UDP, không có đảm bảo thứ tự.

---

## 5. So sánh TCP và UDP

| Tiêu chí | TCP | UDP |
|---|---|---|
| Kết nối | Có (three-way handshake) | Không |
| Độ tin cậy | Cao (đảm bảo thứ tự, tái gửi khi mất) | Thấp (best-effort) |
| Tốc độ | Chậm hơn | Nhanh hơn |
| Ứng dụng | HTTP, FTP, email | Video streaming, DNS, game online |

---

## 6. Tóm tắt

- `InetAddress` — tra cứu và biểu diễn địa chỉ IP.
- `URL` / `URLConnection` — đọc dữ liệu từ tài nguyên web theo giao thức HTTP/HTTPS.
- `DatagramSocket` / `DatagramPacket` — truyền dữ liệu UDP không kết nối.
- `Socket` / `ServerSocket` — kết nối TCP (sẽ trình bày chi tiết trong bài tiếp theo).
