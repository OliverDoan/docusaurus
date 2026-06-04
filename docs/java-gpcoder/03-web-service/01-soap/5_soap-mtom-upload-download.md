---
sidebar_position: 5
title: "SOAP Web service - Upload và Download file với MTOM"
---

# SOAP Web service - Upload và Download file với MTOM

## MTOM là gì?

**MTOM** (Message Transmission Optimization Mechanism — cơ chế tối ưu hóa truyền thông điệp) là một chuẩn W3C cho phép truyền dữ liệu nhị phân (binary data) như hình ảnh, PDF, file zip... qua SOAP một cách hiệu quả.

Khi không dùng MTOM, dữ liệu nhị phân phải được mã hóa sang **Base64** (định dạng văn bản biểu diễn dữ liệu nhị phân) rồi nhúng vào XML — làm tăng kích thước lên khoảng 33%. MTOM đính kèm dữ liệu nhị phân trực tiếp như **attachment** (tệp đính kèm) thay vì mã hóa, giúp:

- Giảm kích thước message đáng kể.
- Tăng hiệu năng truyền file lớn.
- Tận dụng cơ chế **XOP** (XML-binary Optimized Packaging — đóng gói tối ưu XML-nhị phân).

---

## Cấu hình Maven/Gradle

Thêm dependency cần thiết vào `pom.xml`:

```xml
<dependencies>
  <!-- JAX-WS Reference Implementation -->
  <dependency>
    <groupId>com.sun.xml.ws</groupId>
    <artifactId>jaxws-rt</artifactId>
    <version>4.0.1</version>
  </dependency>
</dependencies>
```

---

## Service Upload File với MTOM

### Tạo Service Interface

```java
package com.example.soap.mtom;

import jakarta.activation.DataHandler;
import jakarta.jws.WebMethod;
import jakarta.jws.WebParam;
import jakarta.jws.WebService;
import jakarta.xml.bind.annotation.XmlMimeType;
import jakarta.xml.ws.soap.MTOM;

// @MTOM: kích hoạt MTOM cho service này
// threshold: chỉ dùng MTOM cho attachment lớn hơn N bytes (0 = luôn dùng)
@MTOM(enabled = true, threshold = 0)
@WebService
public interface FileTransferService {

    /**
     * Upload file lên server.
     * @param fileName  Tên file gốc
     * @param fileData  Nội dung file dưới dạng DataHandler (MTOM attachment)
     * @return          Thông báo kết quả
     */
    @WebMethod
    String uploadFile(
        @WebParam(name = "fileName") String fileName,
        // @XmlMimeType: khai báo kiểu MIME để JAX-WS xử lý đúng MTOM
        @WebParam(name = "fileData")
        @XmlMimeType("application/octet-stream")
        DataHandler fileData
    );

    /**
     * Download file từ server.
     * @param fileName  Tên file cần tải về
     * @return          Nội dung file dưới dạng DataHandler
     */
    @WebMethod
    @XmlMimeType("application/octet-stream")
    DataHandler downloadFile(
        @WebParam(name = "fileName") String fileName
    );
}
```

### Triển khai Service

```java
package com.example.soap.mtom;

import jakarta.activation.DataHandler;
import jakarta.activation.FileDataSource;
import jakarta.jws.WebService;
import jakarta.xml.ws.soap.MTOM;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;

@MTOM(enabled = true, threshold = 0)
@WebService(
    endpointInterface = "com.example.soap.mtom.FileTransferService",
    serviceName = "FileTransferService"
)
public class FileTransferServiceImpl implements FileTransferService {

    // Thư mục lưu file trên server
    private static final String UPLOAD_DIR = "/tmp/soap-uploads/";

    @Override
    public String uploadFile(String fileName, DataHandler fileData) {
        // Tạo thư mục nếu chưa tồn tại
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        File destinationFile = new File(UPLOAD_DIR + fileName);

        try (
            InputStream inputStream = fileData.getInputStream();
            OutputStream outputStream = new FileOutputStream(destinationFile)
        ) {
            // Đọc dữ liệu từ DataHandler và ghi ra file
            byte[] buffer = new byte[4096]; // Buffer 4KB
            int bytesRead;
            long totalBytes = 0;

            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
                totalBytes += bytesRead;
            }

            System.out.println("Upload thành công: " + fileName + " (" + totalBytes + " bytes)");
            return "Upload thành công: " + fileName + " (" + totalBytes + " bytes)";

        } catch (IOException e) {
            String errorMsg = "Lỗi khi upload file: " + e.getMessage();
            System.err.println(errorMsg);
            return errorMsg;
        }
    }

    @Override
    public DataHandler downloadFile(String fileName) {
        File file = new File(UPLOAD_DIR + fileName);

        if (!file.exists()) {
            throw new jakarta.xml.ws.WebServiceException(
                "Không tìm thấy file: " + fileName
            );
        }

        // Kiểm tra bảo mật: tránh Path Traversal attack
        // (tấn công duyệt đường dẫn — truy cập file ngoài thư mục cho phép)
        try {
            String canonicalPath = file.getCanonicalPath();
            String uploadDirCanonical = new File(UPLOAD_DIR).getCanonicalPath();
            if (!canonicalPath.startsWith(uploadDirCanonical)) {
                throw new jakarta.xml.ws.WebServiceException(
                    "Truy cập file không hợp lệ."
                );
            }
        } catch (IOException e) {
            throw new jakarta.xml.ws.WebServiceException("Lỗi kiểm tra đường dẫn file.");
        }

        // FileDataSource: nguồn dữ liệu từ file hệ thống
        FileDataSource dataSource = new FileDataSource(file);
        System.out.println("Chuẩn bị download: " + fileName);
        return new DataHandler(dataSource);
    }

    public static void main(String[] args) {
        String address = "http://localhost:8080/ws/file-transfer";
        jakarta.xml.ws.Endpoint.publish(address, new FileTransferServiceImpl());
        System.out.println("FileTransfer MTOM Service tại: " + address);
        System.out.println("WSDL: " + address + "?wsdl");
    }
}
```

---

## Client Upload File

```java
package com.example.client;

import com.example.soap.mtom.FileTransferService;
import jakarta.activation.DataHandler;
import jakarta.activation.FileDataSource;
import jakarta.xml.ws.BindingProvider;
import jakarta.xml.ws.Service;
import jakarta.xml.ws.soap.MTOMFeature;
import java.io.File;
import java.net.URL;
import javax.xml.namespace.QName;

public class FileUploadClient {

    public static void main(String[] args) throws Exception {
        URL wsdlUrl = new URL("http://localhost:8080/ws/file-transfer?wsdl");

        QName serviceName = new QName(
            "http://mtom.soap.example.com/",
            "FileTransferService"
        );

        Service service = Service.create(wsdlUrl, serviceName);

        // MTOMFeature: kích hoạt MTOM phía client
        MTOMFeature mtomFeature = new MTOMFeature(true);
        FileTransferService port = service.getPort(FileTransferService.class, mtomFeature);

        // --- UPLOAD ---
        File fileToUpload = new File("/Users/me/documents/report.pdf");

        if (!fileToUpload.exists()) {
            System.out.println("File không tồn tại: " + fileToUpload.getAbsolutePath());
            return;
        }

        // DataHandler bọc nguồn dữ liệu file
        DataHandler uploadData = new DataHandler(new FileDataSource(fileToUpload));

        System.out.println("Đang upload: " + fileToUpload.getName()
            + " (" + fileToUpload.length() + " bytes)...");

        String result = port.uploadFile(fileToUpload.getName(), uploadData);
        System.out.println("Kết quả upload: " + result);
    }
}
```

---

## Client Download File

```java
package com.example.client;

import com.example.soap.mtom.FileTransferService;
import jakarta.activation.DataHandler;
import jakarta.xml.ws.Service;
import jakarta.xml.ws.soap.MTOMFeature;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import javax.xml.namespace.QName;

public class FileDownloadClient {

    public static void main(String[] args) throws Exception {
        URL wsdlUrl = new URL("http://localhost:8080/ws/file-transfer?wsdl");

        QName serviceName = new QName(
            "http://mtom.soap.example.com/",
            "FileTransferService"
        );

        Service service = Service.create(wsdlUrl, serviceName);
        MTOMFeature mtomFeature = new MTOMFeature(true);
        FileTransferService port = service.getPort(FileTransferService.class, mtomFeature);

        // --- DOWNLOAD ---
        String fileNameToDownload = "report.pdf";
        System.out.println("Đang download: " + fileNameToDownload + "...");

        DataHandler downloadedData = port.downloadFile(fileNameToDownload);

        // Lưu file đã download vào máy local
        File savedFile = new File("/Users/me/downloads/" + fileNameToDownload);
        savedFile.getParentFile().mkdirs();

        try (
            InputStream inputStream = downloadedData.getInputStream();
            OutputStream outputStream = new FileOutputStream(savedFile)
        ) {
            byte[] buffer = new byte[4096];
            int bytesRead;
            long totalBytes = 0;

            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
                totalBytes += bytesRead;
            }

            System.out.println("Download hoàn tất: " + savedFile.getAbsolutePath()
                + " (" + totalBytes + " bytes)");
        }
    }
}
```

---

## Cấu trúc MTOM Message

Dưới đây là ví dụ MTOM message thực tế được gửi qua mạng — dữ liệu nhị phân được tách thành phần riêng, không nhúng vào XML:

```
POST /ws/file-transfer HTTP/1.1
Content-Type: multipart/related;
    type="application/xop+xml";
    start="<rootpart@example>";
    boundary="MIMEBoundary"

--MIMEBoundary
Content-Type: application/xop+xml; charset=UTF-8;
    type="text/xml"
Content-ID: <rootpart@example>

<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <ns:uploadFile>
      <ns:fileName>report.pdf</ns:fileName>
      <ns:fileData>
        <!-- XOP Include: tham chiếu đến phần nhị phân đính kèm -->
        <xop:Include href="cid:attachment@example"
                     xmlns:xop="http://www.w3.org/2004/08/xop/include"/>
      </ns:fileData>
    </ns:uploadFile>
  </soapenv:Body>
</soapenv:Envelope>

--MIMEBoundary
Content-Type: application/octet-stream
Content-ID: <attachment@example>

[Dữ liệu nhị phân của file PDF ở đây — không bị mã hóa Base64]
--MIMEBoundary--
```

---

## So sánh MTOM vs Base64 Encoding

| Tiêu chí | MTOM | Base64 Encoding |
|---|---|---|
| Kích thước message | Nhỏ hơn (dữ liệu gốc) | Lớn hơn ~33% |
| Tốc độ truyền | Nhanh hơn | Chậm hơn |
| Độ phức tạp cài đặt | Cần kích hoạt `@MTOM` | Không cần cấu hình thêm |
| Phù hợp với | File lớn (> 10KB) | File nhỏ |
| Hỗ trợ | JAX-WS tích hợp sẵn | Mặc định trong SOAP |

---

## Tóm tắt

- **MTOM** cho phép truyền file nhị phân qua SOAP hiệu quả hơn Base64 nhờ cơ chế **XOP attachment**.
- Phía server: dùng annotation `@MTOM(enabled = true)` trên class service.
- Phía client: truyền `new MTOMFeature(true)` vào `service.getPort()`.
- Dữ liệu file được bọc trong **DataHandler** — đây là bridge (cầu nối) giữa Java và dữ liệu MIME.
- Luôn kiểm tra **Path Traversal** khi cho phép đặt tên file tùy ý từ client.
