---
sidebar_position: 4
title: "4. Lập trình mạng (Networking)"
---

# 4. Lập trình mạng (Networking)

---

## Mục lục

- [Lập trình mạng là gì?](#lập-trình-mạng-là-gì)
- [Socket là gì?](#socket-là-gì)
- [TCP Server với ServerSocket](#tcp-server-với-serversocket)
- [TCP Client với Socket](#tcp-client-với-socket)
- [Gọi HTTP với HttpClient (Java 11+)](#gọi-http-với-httpclient-java-11)
- [Làm việc với URL](#làm-việc-với-url)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Lập trình mạng là gì?

**Lập trình mạng (networking)** là viết chương trình để các máy tính **trao đổi dữ liệu với nhau** qua mạng (Internet hoặc mạng nội bộ).

Ví dụ đời thường:
- Trình duyệt gửi yêu cầu tới máy chủ Google và nhận về trang web.
- Ứng dụng chat gửi tin nhắn từ điện thoại bạn tới điện thoại bạn bè.

Có hai vai trò chính:
- **Client (máy khách)**: bên gửi yêu cầu (như trình duyệt).
- **Server (máy chủ)**: bên nhận yêu cầu và trả lời (như máy chủ web).

Các lớp mạng nằm trong gói `java.net`.

---

## Socket là gì?

**Socket** (ổ cắm) là "điểm kết nối" hai đầu của một đường truyền giữa hai máy. Hãy tưởng tượng như **cuộc gọi điện thoại**: mỗi bên cầm một ống nghe (socket), khi nối máy thì hai bên nói chuyện qua đường dây đó.

Một socket được xác định bởi:
- **Địa chỉ IP** (IP address): "địa chỉ nhà" của máy trên mạng, ví dụ `192.168.1.5`.
- **Cổng (port)**: "số phòng" trên máy đó, ví dụ `8080`. Một máy có nhiều cổng để chạy nhiều dịch vụ cùng lúc.

Java dùng giao thức **TCP** (Transmission Control Protocol) cho socket — đảm bảo dữ liệu tới nơi đầy đủ và đúng thứ tự.
- `ServerSocket`: dùng cho **server**, lắng nghe kết nối tới.
- `Socket`: dùng cho **client** (và cũng đại diện kết nối phía server sau khi chấp nhận).

---

## TCP Server với ServerSocket

Server mở một cổng, **chờ** client kết nối, rồi đọc/ghi dữ liệu.

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.io.IOException;

public class SimpleServer {
    public static void main(String[] args) {
        int port = 5000; // Cổng server lắng nghe

        // try-with-resources để tự đóng ServerSocket
        try (ServerSocket serverSocket = new ServerSocket(port)) {
            System.out.println("Server đang chờ ở cổng " + port + "...");

            // accept() bị "đứng" lại cho đến khi có client kết nối
            try (Socket clientSocket = serverSocket.accept();
                 BufferedReader in = new BufferedReader(
                         new InputStreamReader(clientSocket.getInputStream()));
                 PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true)) {

                System.out.println("Có client kết nối!");

                // Đọc một dòng client gửi tới
                String tinNhan = in.readLine();
                System.out.println("Client nói: " + tinNhan);

                // Gửi câu trả lời về cho client (autoFlush = true nên gửi ngay)
                out.println("Server đã nhận: " + tinNhan);
            }
        } catch (IOException e) {
            System.err.println("Lỗi server: " + e.getMessage());
        }
    }
}
```

---

## TCP Client với Socket

Client tạo `Socket` trỏ tới địa chỉ và cổng của server, rồi gửi/nhận dữ liệu.

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.io.IOException;

public class SimpleClient {
    public static void main(String[] args) {
        String host = "localhost"; // Cùng máy; nếu khác máy thì dùng IP của server
        int port = 5000;

        try (Socket socket = new Socket(host, port);
             PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
             BufferedReader in = new BufferedReader(
                     new InputStreamReader(socket.getInputStream()))) {

            // Gửi một tin nhắn tới server
            out.println("Xin chào server!");

            // Đọc câu trả lời từ server
            String phanHoi = in.readLine();
            System.out.println("Server trả lời: " + phanHoi);

        } catch (IOException e) {
            System.err.println("Lỗi client: " + e.getMessage());
        }
    }
}
```

> **Cách chạy thử**: Chạy `SimpleServer` trước (nó sẽ đứng chờ), sau đó chạy `SimpleClient` ở một cửa sổ khác.

---

## Gọi HTTP với HttpClient (Java 11+)

Phần lớn lập trình mạng ngày nay là gọi **API qua HTTP** (giao thức web). Từ Java 11, lớp **`HttpClient`** giúp việc này rất gọn, không cần dùng socket thủ công.

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.io.IOException;

public class HttpGetDemo {
    public static void main(String[] args) {
        // Tạo một HttpClient dùng chung
        HttpClient client = HttpClient.newHttpClient();

        // Xây dựng yêu cầu GET tới một địa chỉ
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.github.com"))
                .GET() // Phương thức GET (lấy dữ liệu)
                .build();

        try {
            // Gửi yêu cầu và nhận phản hồi dưới dạng chuỗi
            HttpResponse<String> response =
                    client.send(request, HttpResponse.BodyHandlers.ofString());

            // Mã trạng thái: 200 = thành công, 404 = không tìm thấy...
            System.out.println("Mã trạng thái: " + response.statusCode());
            System.out.println("Nội dung: " + response.body());

        } catch (IOException | InterruptedException e) {
            // InterruptedException: luồng bị ngắt khi đang chờ phản hồi
            System.err.println("Lỗi khi gọi HTTP: " + e.getMessage());
            // Khôi phục cờ ngắt theo thông lệ tốt
            Thread.currentThread().interrupt();
        }
    }
}
```

Gửi dữ liệu lên server bằng POST:

```java
HttpRequest postRequest = HttpRequest.newBuilder()
        .uri(URI.create("https://example.com/api/users"))
        .header("Content-Type", "application/json") // Báo kiểu dữ liệu gửi đi
        .POST(HttpRequest.BodyPublishers.ofString("{\"ten\":\"Nam\"}"))
        .build();
```

---

## Làm việc với URL

**`URL`** (Uniform Resource Locator) là một địa chỉ tài nguyên trên mạng, ví dụ `https://example.com/index.html`. Lớp `URL` giúp bạn phân tích các thành phần của địa chỉ.

```java
import java.net.URL;
import java.net.MalformedURLException;

public class UrlDemo {
    public static void main(String[] args) {
        try {
            URL url = new URL("https://example.com:443/path/page.html?id=10");

            System.out.println("Giao thức: " + url.getProtocol()); // https
            System.out.println("Tên miền: " + url.getHost());      // example.com
            System.out.println("Cổng: " + url.getPort());          // 443
            System.out.println("Đường dẫn: " + url.getPath());     // /path/page.html
            System.out.println("Tham số: " + url.getQuery());      // id=10

        } catch (MalformedURLException e) {
            // MalformedURLException: địa chỉ sai định dạng
            System.err.println("URL không hợp lệ: " + e.getMessage());
        }
    }
}
```

---

## Lỗi thường gặp

1. **Cổng đã bị dùng**: Khởi động server trên cổng đang được chiếm sẽ ném `BindException`. Đổi cổng hoặc tắt chương trình đang dùng.
2. **Chạy client trước server**: Client sẽ báo `ConnectionRefused` vì chưa ai lắng nghe. Chạy server trước.
3. **Quên đóng socket/luồng**: Gây rò rỉ kết nối. Dùng try-with-resources.
4. **Treo chương trình ở `accept()` hoặc `readLine()`**: Đây là hành vi bình thường — chúng **chờ (blocking)** cho đến khi có dữ liệu/kết nối.
5. **Dùng socket thủ công cho API web**: Không cần thiết. Hãy dùng `HttpClient` cho HTTP, đơn giản và an toàn hơn.

---

## Tóm tắt

- **Lập trình mạng** giúp các máy trao đổi dữ liệu; có hai vai: **client** (gửi) và **server** (trả lời).
- **Socket** là điểm kết nối, xác định bởi **địa chỉ IP** và **cổng (port)**.
- Dùng **`ServerSocket`** cho server và **`Socket`** cho client với giao thức TCP.
- Từ Java 11, dùng **`HttpClient`** để gọi API web qua HTTP một cách gọn gàng.
- Lớp **`URL`** giúp phân tích địa chỉ tài nguyên trên mạng.
