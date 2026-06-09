---
sidebar_position: 2
title: "Java Web Services - JAX-WS - SOAP"
---

# Java Web Services - JAX-WS - SOAP

JAX-WS là bộ API chuẩn của Java giúp ta xây dựng và gọi các SOAP Web Service chỉ bằng vài annotation, không phải tự viết XML hay WSDL bằng tay. Đây là cách phổ biến để tạo dịch vụ SOAP trong thế giới Java. Bài này hướng dẫn từng bước tạo cả phía server lẫn client kèm ví dụ chạy thật; chi tiết nằm bên dưới.

## JAX-WS là gì?

**JAX-WS** (Java API for XML-Based Web Services — API Java cho Web Service dựa trên XML) là bộ API chuẩn của Java để xây dựng và tiêu thụ SOAP Web Service. JAX-WS thuộc bộ **Java EE** (nay là Jakarta EE) và được tích hợp sẵn trong **JDK** từ phiên bản 6.

Với JAX-WS, bạn chỉ cần viết Java thuần túy, dùng annotation — framework sẽ tự động sinh WSDL và xử lý XML.

---

## Tạo SOAP Service phía Server

### Bước 1 — Tạo Service Endpoint Interface (SEI)

**SEI** (Service Endpoint Interface — giao diện điểm cuối dịch vụ) là interface Java định nghĩa các phương thức mà service cung cấp.

```java
package com.example.soap;

import jakarta.jws.WebMethod;
import jakarta.jws.WebParam;
import jakarta.jws.WebService;

// @WebService: đánh dấu đây là một SOAP Web Service
@WebService
public interface UserService {

    // @WebMethod: đánh dấu phương thức sẽ được công bố qua SOAP
    // @WebParam: đặt tên tham số trong WSDL (thay vì arg0, arg1...)
    @WebMethod
    String getUserById(@WebParam(name = "userId") int userId);

    @WebMethod
    String createUser(
        @WebParam(name = "name") String name,
        @WebParam(name = "email") String email
    );
}
```

### Bước 2 — Triển khai Service (Service Implementation Bean — SIB)

**SIB** (Service Implementation Bean — bean triển khai dịch vụ) là class Java thực sự xử lý logic nghiệp vụ.

```java
package com.example.soap;

import jakarta.jws.WebService;

// endpointInterface: trỏ đến SEI đã định nghĩa ở trên
// serviceName: tên service xuất hiện trong WSDL
@WebService(
    endpointInterface = "com.example.soap.UserService",
    serviceName = "UserService"
)
public class UserServiceImpl implements UserService {

    @Override
    public String getUserById(int userId) {
        // Giả lập truy vấn database
        if (userId == 1) {
            return "{ \"id\": 1, \"name\": \"Nguyen Van A\", \"email\": \"a@example.com\" }";
        }
        return "Không tìm thấy người dùng với id: " + userId;
    }

    @Override
    public String createUser(String name, String email) {
        // Giả lập lưu vào database
        System.out.println("Tạo người dùng: " + name + " - " + email);
        return "Tạo thành công: " + name;
    }
}
```

### Bước 3 — Publish Endpoint (công bố điểm cuối)

**Endpoint** (điểm cuối) là địa chỉ URL mà client dùng để gọi service.

```java
package com.example.soap;

import jakarta.xml.ws.Endpoint;

public class UserServicePublisher {

    public static void main(String[] args) {
        // Địa chỉ URL để public service
        String address = "http://localhost:8080/ws/user";

        // Publish service tại địa chỉ trên
        Endpoint.publish(address, new UserServiceImpl());

        System.out.println("SOAP Service đang chạy tại: " + address);
        System.out.println("WSDL có tại: " + address + "?wsdl");
    }
}
```

Sau khi chạy, truy cập `http://localhost:8080/ws/user?wsdl` trên trình duyệt để xem WSDL tự động sinh ra.

---

## Tạo SOAP Client phía Client

### Cách 1 — Dùng công cụ `wsimport` sinh code tự động

**`wsimport`** là công cụ có sẵn trong JDK, tự động sinh các class Java (stub) từ WSDL để gọi service.

```bash
# Chạy lệnh wsimport từ terminal
wsimport -keep -verbose http://localhost:8080/ws/user?wsdl -d ./src/main/java
```

Tham số:
- `-keep`: giữ lại file `.java` đã sinh (không chỉ `.class`).
- `-verbose`: hiện thông tin chi tiết khi sinh code.
- `-d`: thư mục đích chứa file được sinh ra.

### Cách 2 — Viết Client thủ công với `Service` và `Port`

```java
package com.example.client;

import com.example.soap.UserService;
import com.example.soap.UserServiceImplService; // class được wsimport sinh ra
import jakarta.xml.ws.Service;
import java.net.URL;
import javax.xml.namespace.QName;

public class UserServiceClient {

    public static void main(String[] args) throws Exception {
        // URL tới file WSDL
        URL wsdlUrl = new URL("http://localhost:8080/ws/user?wsdl");

        // QName: định danh dịch vụ trong WSDL (namespace + tên service)
        QName serviceName = new QName(
            "http://soap.example.com/",  // targetNamespace trong WSDL
            "UserService"               // tên service
        );

        // Tạo đối tượng Service từ WSDL
        Service service = Service.create(wsdlUrl, serviceName);

        // Lấy Port — đối tượng proxy để gọi phương thức từ xa
        UserService userService = service.getPort(UserService.class);

        // Gọi phương thức — giống như gọi method Java bình thường
        String result = userService.getUserById(1);
        System.out.println("Kết quả: " + result);

        String created = userService.createUser("Tran Thi B", "b@example.com");
        System.out.println("Tạo mới: " + created);
    }
}
```

---

## Các Annotation quan trọng trong JAX-WS

| Annotation | Ý nghĩa |
|---|---|
| `@WebService` | Đánh dấu class/interface là SOAP Web Service |
| `@WebMethod` | Đánh dấu method được công bố ra ngoài qua SOAP |
| `@WebParam` | Đặt tên tham số trong WSDL (thay vì argN mặc định) |
| `@WebResult` | Đặt tên giá trị trả về trong WSDL |
| `@SOAPBinding` | Cấu hình kiểu binding: RPC hay Document style |
| `@HandlerChain` | Gắn danh sách Handler để xử lý thêm (bảo mật, logging) |

---

## Kiểm tra nhanh với SOAP Message thủ công

Bạn có thể kiểm tra service bằng cách gửi thủ công một SOAP message qua `curl`:

```bash
curl -X POST http://localhost:8080/ws/user \
  -H "Content-Type: text/xml;charset=UTF-8" \
  -d '
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ns="http://soap.example.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:getUserById>
      <ns:userId>1</ns:userId>
    </ns:getUserById>
  </soapenv:Body>
</soapenv:Envelope>'
```

Kết quả phản hồi sẽ là một SOAP Envelope chứa dữ liệu trả về từ server.

---

## Cấu trúc dự án gợi ý

```
src/
├── main/
│   └── java/
│       └── com/example/
│           ├── soap/
│           │   ├── UserService.java         ← SEI (interface)
│           │   ├── UserServiceImpl.java     ← SIB (implementation)
│           │   └── UserServicePublisher.java ← main() để chạy server
│           └── client/
│               └── UserServiceClient.java   ← Client gọi service
```

---

## Tóm tắt

- **JAX-WS** cho phép tạo SOAP service chỉ với annotation `@WebService` và `@WebMethod`.
- Dùng `Endpoint.publish()` để chạy service không cần server nặng (phù hợp thử nghiệm).
- WSDL được tự động sinh tại `<url>?wsdl`.
- `wsimport` sinh code client tự động từ WSDL.
- **SEI** định nghĩa contract, **SIB** chứa logic nghiệp vụ.
