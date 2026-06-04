---
sidebar_position: 4
title: "SOAP Web service - Authentication trong JAX-WS"
---

# SOAP Web service - Authentication trong JAX-WS

## Tổng quan về Authentication trong SOAP

**Authentication** (xác thực) trong SOAP Web Service là quá trình xác minh danh tính của client trước khi cho phép truy cập tài nguyên. Trong JAX-WS, có hai cách phổ biến:

1. **SOAP Header Authentication** — Đặt thông tin xác thực (username/password) trong phần `<Header>` của SOAP message.
2. **JAX-WS Handler** — Dùng **Handler** (bộ xử lý trung gian) để chặn và kiểm tra thông tin xác thực trước khi request đến service.

---

## Cách 1 — Xác thực qua SOAP Header

### Định nghĩa SOAP Header chứa thông tin xác thực

**SOAP Header** (tiêu đề SOAP) là phần tùy chọn trong SOAP Envelope, dùng để truyền metadata như thông tin xác thực, session token, v.v.

Ví dụ SOAP message có header xác thực:

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ns="http://soap.example.com/">
  <soapenv:Header>
    <!-- Thông tin xác thực đặt trong Header -->
    <ns:AuthHeader>
      <ns:username>admin</ns:username>
      <ns:password>secret123</ns:password>
    </ns:AuthHeader>
  </soapenv:Header>
  <soapenv:Body>
    <ns:getSecretData>
      <ns:resourceId>42</ns:resourceId>
    </ns:getSecretData>
  </soapenv:Body>
</soapenv:Envelope>
```

### Tạo class AuthHeader

```java
package com.example.soap.auth;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

// @XmlRootElement: cho JAXB (Java Architecture for XML Binding —
//   kiến trúc Java để ánh xạ XML) biết class này là root element XML
@XmlRootElement(name = "AuthHeader", namespace = "http://soap.example.com/")
@XmlAccessorType(XmlAccessType.FIELD)
public class AuthHeader {

    @XmlElement(required = true)
    private String username;

    @XmlElement(required = true)
    private String password;

    // Constructor mặc định bắt buộc cho JAXB
    public AuthHeader() {}

    public AuthHeader(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public String getUsername() { return username; }
    public String getPassword() { return password; }
}
```

### Service kiểm tra Header

```java
package com.example.soap.auth;

import jakarta.jws.WebMethod;
import jakarta.jws.WebParam;
import jakarta.jws.WebService;
import jakarta.xml.ws.WebServiceException;

// @WebContext — trong JAX-WS có thể inject WebServiceContext để đọc header
import jakarta.xml.ws.WebServiceContext;
import jakarta.annotation.Resource;

@WebService(serviceName = "SecureService")
public class SecureServiceImpl {

    // @Resource: inject WebServiceContext để truy cập thông tin request
    @Resource
    private WebServiceContext wsContext;

    @WebMethod
    public String getSecretData(@WebParam(name = "resourceId") int resourceId) {
        // Lấy MessageContext từ WebServiceContext
        jakarta.xml.ws.handler.MessageContext msgCtx =
            wsContext.getMessageContext();

        // Lấy HTTP headers từ MessageContext
        @SuppressWarnings("unchecked")
        java.util.Map<String, java.util.List<String>> headers =
            (java.util.Map<String, java.util.List<String>>)
            msgCtx.get(jakarta.xml.ws.handler.MessageContext.HTTP_REQUEST_HEADERS);

        // Kiểm tra header Authorization (Basic Auth)
        if (headers != null && headers.containsKey("Authorization")) {
            String authHeader = headers.get("Authorization").get(0);
            if (isValidCredentials(authHeader)) {
                return "Dữ liệu bí mật cho resourceId = " + resourceId;
            }
        }

        throw new WebServiceException("Xác thực thất bại: Không có quyền truy cập.");
    }

    private boolean isValidCredentials(String authHeader) {
        // Giải mã Basic Auth: "Basic base64(username:password)"
        if (authHeader.startsWith("Basic ")) {
            String encoded = authHeader.substring(6);
            byte[] decoded = java.util.Base64.getDecoder().decode(encoded);
            String credentials = new String(decoded);
            return "admin:secret123".equals(credentials);
        }
        return false;
    }
}
```

---

## Cách 2 — Xác thực qua JAX-WS Handler

**Handler** trong JAX-WS là một lớp trung gian (middleware) có thể chặn SOAP message trước và sau khi xử lý — tương tự Filter trong Servlet. Có hai loại:

- **SOAPHandler** — Xử lý toàn bộ SOAP message (cả Header và Body).
- **LogicalHandler** — Chỉ xử lý payload (nội dung Body).

### Tạo AuthenticationHandler

```java
package com.example.soap.handler;

import jakarta.xml.ws.handler.MessageContext;
import jakarta.xml.ws.handler.soap.SOAPHandler;
import jakarta.xml.ws.handler.soap.SOAPMessageContext;
import jakarta.xml.soap.SOAPHeader;
import jakarta.xml.soap.SOAPMessage;
import java.util.Iterator;
import java.util.Set;
import javax.xml.namespace.QName;

public class AuthenticationHandler implements SOAPHandler<SOAPMessageContext> {

    private static final String NAMESPACE = "http://soap.example.com/";

    // getHeaders(): khai báo các header mà handler quan tâm
    @Override
    public Set<QName> getHeaders() {
        return Set.of(new QName(NAMESPACE, "AuthHeader"));
    }

    // handleMessage(): được gọi với MỌI SOAP message (cả request lẫn response)
    @Override
    public boolean handleMessage(SOAPMessageContext context) {
        // Chỉ kiểm tra request (inbound), không kiểm tra response
        boolean isRequest = !(Boolean) context.get(MessageContext.MESSAGE_OUTBOUND_PROPERTY);
        if (!isRequest) {
            return true; // Cho qua response
        }

        try {
            SOAPMessage soapMessage = context.getMessage();
            SOAPHeader soapHeader = soapMessage.getSOAPHeader();

            if (soapHeader == null) {
                throw new jakarta.xml.ws.soap.SOAPFaultException(
                    soapMessage.getSOAPPart().getEnvelope().getBody()
                        .addFault(new QName("urn:fault"), "Thiếu SOAP Header xác thực")
                );
            }

            // Lấy phần tử AuthHeader từ SOAP Header
            Iterator<?> headerElements = soapHeader.examineAllHeaderElements();
            while (headerElements.hasNext()) {
                jakarta.xml.soap.SOAPHeaderElement element =
                    (jakarta.xml.soap.SOAPHeaderElement) headerElements.next();

                if ("AuthHeader".equals(element.getLocalName())) {
                    String username = element.getElementsByTagName("username")
                        .item(0).getTextContent();
                    String password = element.getElementsByTagName("password")
                        .item(0).getTextContent();

                    if (validateCredentials(username, password)) {
                        return true; // Xác thực thành công — cho request đi tiếp
                    } else {
                        throw new jakarta.xml.ws.WebServiceException(
                            "Xác thực thất bại: Sai username hoặc password."
                        );
                    }
                }
            }

            throw new jakarta.xml.ws.WebServiceException(
                "Xác thực thất bại: Không tìm thấy AuthHeader."
            );

        } catch (jakarta.xml.ws.WebServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new jakarta.xml.ws.WebServiceException("Lỗi xử lý xác thực: " + e.getMessage());
        }
    }

    // handleFault(): được gọi khi có SOAP Fault (lỗi)
    @Override
    public boolean handleFault(SOAPMessageContext context) {
        System.out.println("AuthenticationHandler: Xử lý lỗi SOAP.");
        return true;
    }

    // close(): dọn dẹp tài nguyên sau khi xử lý xong
    @Override
    public void close(MessageContext context) {}

    private boolean validateCredentials(String username, String password) {
        // Trong thực tế: truy vấn database để kiểm tra
        return "admin".equals(username) && "secret123".equals(password);
    }
}
```

### Tạo Handler Chain Configuration

**Handler Chain** (chuỗi handler) là danh sách các handler sẽ được áp dụng theo thứ tự. File cấu hình XML:

```xml
<!-- handler-chain.xml — đặt tại src/main/resources/ -->
<?xml version="1.0" encoding="UTF-8"?>
<handler-chains xmlns="http://java.sun.com/xml/ns/javaee">
  <handler-chain>
    <handler>
      <handler-name>AuthenticationHandler</handler-name>
      <handler-class>com.example.soap.handler.AuthenticationHandler</handler-class>
    </handler>
  </handler-chain>
</handler-chains>
```

### Gắn Handler Chain vào Service

```java
package com.example.soap.auth;

import jakarta.jws.HandlerChain;
import jakarta.jws.WebMethod;
import jakarta.jws.WebParam;
import jakarta.jws.WebService;

@WebService(serviceName = "ProtectedService")
// @HandlerChain: trỏ đến file XML cấu hình handler chain
@HandlerChain(file = "handler-chain.xml")
public class ProtectedServiceImpl {

    @WebMethod
    public String getProtectedData(@WebParam(name = "id") int id) {
        // Nếu đến được đây, xác thực đã thành công ở Handler
        return "Dữ liệu được bảo vệ cho id = " + id;
    }
}
```

---

## Client gửi SOAP Header xác thực

```java
package com.example.client;

import com.example.soap.auth.AuthHeader;
import jakarta.xml.ws.BindingProvider;
import jakarta.xml.ws.handler.soap.SOAPHandler;
import jakarta.xml.ws.handler.soap.SOAPMessageContext;
import jakarta.xml.soap.SOAPHeader;
import java.util.List;

public class SecureServiceClient {

    public static void main(String[] args) throws Exception {
        // Tạo stub từ WSDL (giả sử đã chạy wsimport)
        // ProtectedServiceImplService service = new ProtectedServiceImplService();
        // ProtectedServiceImpl port = service.getProtectedServiceImplPort();

        // Thêm handler vào client để tự động gắn AuthHeader vào mọi request
        // BindingProvider: interface cho phép cấu hình request/response
        // BindingProvider bp = (BindingProvider) port;
        // bp.getBinding().getHandlerChain().add(new ClientAuthHandler("admin", "secret123"));
        
        System.out.println("Client SOAP với xác thực Header đã được cấu hình.");
        System.out.println("Gửi AuthHeader: username=admin, password=secret123");
    }
}
```

---

## Tóm tắt

| Phương pháp | Ưu điểm | Nhược điểm |
|---|---|---|
| SOAP Header trực tiếp | Đơn giản, dễ hiểu | Phải xử lý thủ công trong từng method |
| JAX-WS Handler | Tái sử dụng, tách biệt logic xác thực | Phức tạp hơn khi cấu hình |
| WS-Security (nâng cao) | Chuẩn công nghiệp, mã hóa mạnh | Cần thư viện như Apache WSS4J |

Với ứng dụng thực tế, nên kết hợp **Handler** để tập trung logic xác thực và **HTTPS** để mã hóa dữ liệu truyền đi.
