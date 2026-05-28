---
sidebar_position: 3
title: "3. Networking (Lập trình mạng)"
---

# Networking -- Lập trình mạng trong Java

Java cung cấp nhiều API để giao tiếp qua mạng: socket cấp thấp (`java.net.Socket`), HTTP cấp cao (`java.net.http.HttpClient`), URL/URI, và DatagramSocket cho UDP.

**Tương tự đơn giản:** Mạng máy tính giống hệ thống bưu điện. Mỗi máy tính có **địa chỉ IP** (số nhà). Trên cùng một máy có nhiều **port** (số phòng). Hai loại giao tiếp:

- **TCP** (Socket): Như gọi điện thoại -- kết nối liên tục, đảm bảo nghe rõ
- **UDP** (DatagramSocket): Như gửi bưu thiếp -- nhanh, không xác nhận đến nơi

---

## Mục lục

- [1. Các khái niệm cơ bản](#1-các-khái-niệm-cơ-bản)
- [2. URL và URI](#2-url-và-uri)
- [3. HttpClient (Java 11+)](#3-httpclient-java-11)
- [4. Socket TCP](#4-socket-tcp)
- [5. DatagramSocket UDP](#5-datagramsocket-udp)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Các khái niệm cơ bản

| Thuật ngữ           | Giải thích                                              |
| ------------------- | ------------------------------------------------------- |
| **IP Address**      | Địa chỉ máy: `192.168.1.10` hoặc IPv6                   |
| **Port**            | "Cổng" trên máy: 0-65535, port < 1024 cần quyền admin   |
| **TCP**             | Giao thức tin cậy -- HTTP, SMTP, SSH                    |
| **UDP**             | Giao thức nhanh, không tin cậy -- DNS, video streaming  |
| **Socket**          | Kết nối 2 chiều giữa 2 máy                              |
| **DNS**             | Phân giải tên miền -> IP (`google.com` -> 142.250.x.x)  |

---

## 2. URL và URI

```java
import java.net.URI;
import java.net.URL;

public class URLDemo {
    public static void main(String[] args) throws Exception {
        // URI -- danh dinh (string)
        URI uri = URI.create("https://api.example.com/users?id=1");
        System.out.println(uri.getScheme());    // https
        System.out.println(uri.getHost());      // api.example.com
        System.out.println(uri.getPath());      // /users
        System.out.println(uri.getQuery());     // id=1

        // URL -- co the mo ket noi (deprecated cach moi -- dung HttpClient)
        URL url = URI.create("https://example.com").toURL();
    }
}
```

**Lưu ý:** Từ Java 20, `new URL(...)` bị deprecated. Dùng `URI.create(...).toURL()`.

---

## 3. HttpClient (Java 11+)

Java 11 giới thiệu **HttpClient** hiện đại, thay thế `HttpURLConnection` cũ. Hỗ trợ HTTP/2, WebSocket, async.

### GET request

```java
import java.net.URI;
import java.net.http.*;

public class HttpGetDemo {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://jsonplaceholder.typicode.com/users/1"))
            .GET()
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("Status: " + response.statusCode());
        System.out.println("Body: " + response.body());
    }
}
```

### POST request với JSON

```java
import java.net.URI;
import java.net.http.*;
import java.time.Duration;

public class HttpPostDemo {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

        String body = "{\"name\":\"Alice\",\"email\":\"alice@example.com\"}";

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.example.com/users"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer my-token")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .timeout(Duration.ofSeconds(30))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.statusCode() + ": " + response.body());
    }
}
```

### Async với CompletableFuture

```java
client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
    .thenApply(HttpResponse::body)
    .thenAccept(System.out::println)
    .join();
```

### HTTP/2

```java
HttpClient client = HttpClient.newBuilder()
    .version(HttpClient.Version.HTTP_2)
    .build();
```

---

## 4. Socket TCP

### Server

```java
import java.io.*;
import java.net.*;

public class TcpServer {
    public static void main(String[] args) throws IOException {
        try (ServerSocket server = new ServerSocket(8080)) {
            System.out.println("Server dang lang nghe port 8080");
            while (true) {
                Socket client = server.accept();
                handle(client);
            }
        }
    }

    private static void handle(Socket client) throws IOException {
        try (
            BufferedReader in = new BufferedReader(new InputStreamReader(client.getInputStream()));
            PrintWriter out = new PrintWriter(client.getOutputStream(), true)
        ) {
            String line = in.readLine();
            System.out.println("Nhan: " + line);
            out.println("Echo: " + line);
        }
    }
}
```

### Client

```java
import java.io.*;
import java.net.*;

public class TcpClient {
    public static void main(String[] args) throws IOException {
        try (
            Socket socket = new Socket("localhost", 8080);
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))
        ) {
            out.println("Xin chao server");
            System.out.println(in.readLine()); // Echo: Xin chao server
        }
    }
}
```

---

## 5. DatagramSocket UDP

### Server

```java
import java.net.*;

public class UdpServer {
    public static void main(String[] args) throws Exception {
        try (DatagramSocket socket = new DatagramSocket(9090)) {
            byte[] buf = new byte[1024];
            DatagramPacket packet = new DatagramPacket(buf, buf.length);
            socket.receive(packet);
            String msg = new String(packet.getData(), 0, packet.getLength());
            System.out.println("Nhan: " + msg);
        }
    }
}
```

### Client

```java
try (DatagramSocket socket = new DatagramSocket()) {
    String msg = "Hello UDP";
    byte[] buf = msg.getBytes();
    DatagramPacket packet = new DatagramPacket(
        buf, buf.length,
        InetAddress.getByName("localhost"), 9090
    );
    socket.send(packet);
}
```

---

## Khi nào dùng?

- **HttpClient**: REST API, web scraping, gọi service ngoài (gần như luôn ưu tiên)
- **TCP Socket**: Khi cần protocol custom hoặc kết nối bền (chat, game online turn-based)
- **UDP**: Khi tốc độ quan trọng hơn độ tin cậy (game realtime, voice/video)
- **WebSocket** (`java.net.http`): Realtime 2 chiều qua HTTP
- **Best practice:**
  - Luôn set **timeout** -- tránh treo vô hạn
  - Đóng connection bằng **try-with-resources**
  - Dùng **connection pool** cho HttpClient (mặc định có)
  - Xử lý exception: `IOException`, `ConnectException`, `SocketTimeoutException`

---

## Lỗi thường gặp

### Lỗi 1: Quên timeout

```java
// SAI -- co the cho mai
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("..."))
    .build();

// DUNG
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("..."))
    .timeout(Duration.ofSeconds(30))
    .build();
```

### Lỗi 2: Tạo HttpClient mới mỗi request

```java
// SAI -- ton tai nguyen
for (int i = 0; i < 1000; i++) {
    HttpClient client = HttpClient.newHttpClient();
    client.send(...);
}

// DUNG -- tao 1 lan, tai su dung
HttpClient client = HttpClient.newHttpClient();
for (int i = 0; i < 1000; i++) {
    client.send(...);
}
```

### Lỗi 3: Quên đóng Socket

```java
// SAI -- resource leak
Socket s = new Socket("host", 80);
// quen close

// DUNG
try (Socket s = new Socket("host", 80)) { ... }
```

### Lỗi 4: Đọc/ghi sai thứ tự

Server đọc trước khi client ghi -> deadlock. Phải có **protocol rõ ràng** giữa 2 bên.

---

## Câu hỏi phỏng vấn

### Câu 1: TCP và UDP khác nhau thế nào?

**Trả lời:**

- **TCP**: Connection-oriented, đảm bảo thứ tự, có ACK, có thử lại -- chậm hơn nhưng tin cậy (HTTP, SSH, FTP)
- **UDP**: Connectionless, không đảm bảo, không thứ tự -- nhanh, dùng cho game realtime, DNS, video streaming

### Câu 2: Tại sao Java 11 thêm `HttpClient` mới?

**Trả lời:** `HttpURLConnection` cũ:

- API khó dùng, không hỗ trợ HTTP/2
- Không async, không WebSocket
- Không có connection pool tốt

`HttpClient` mới: HTTP/1.1 + HTTP/2 + WebSocket, async qua `CompletableFuture`, fluent builder API, mạnh và dễ dùng.

### Câu 3: HTTPS hoạt động thế nào?

**Trả lời:**

1. Client kết nối TCP đến port 443
2. **TLS handshake**: server gửi certificate, client xác minh (CA chain)
3. Trao đổi khóa AES qua RSA (asymmetric)
4. Mã hóa toàn bộ traffic bằng AES (symmetric)

`HttpClient` của Java tự xử lý TLS, không cần code thêm.

### Câu 4: Connection Pool là gì?

**Trả lời:** Tập hợp các connection được **tái sử dụng** thay vì tạo mới mỗi request. Mở connection tốn (TCP handshake, TLS). Pool giảm latency. Java `HttpClient` có pool built-in.

### Câu 5: Xử lý retry như thế nào?

**Trả lời:**

- **Exponential backoff**: chờ 1s, 2s, 4s, 8s... tránh DDoS service
- **Retry chỉ với idempotent request** (GET, PUT, DELETE) -- không retry POST tùy ý
- Giới hạn số lần retry (3-5 lần)
- Dùng thư viện: Resilience4j, Spring Retry
