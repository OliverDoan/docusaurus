---
sidebar_position: 3
title: "REST Web service - Upload và Download file với Jersey 2.x"
---

# REST Web service - Upload và Download file với Jersey 2.x

## Tổng quan

Xử lý file là một yêu cầu phổ biến trong REST API: upload ảnh đại diện, download báo cáo PDF, chia sẻ tài liệu... Jersey 2.x hỗ trợ upload file thông qua **Multipart** (gửi nhiều phần dữ liệu trong một request) và download file thông qua `StreamingOutput` (truyền dữ liệu dạng luồng).

## Cấu hình Maven

```xml
<dependencies>
    <!-- Jersey Multipart để upload file -->
    <dependency>
        <groupId>org.glassfish.jersey.media</groupId>
        <artifactId>jersey-media-multipart</artifactId>
        <version>2.40</version>
    </dependency>
</dependencies>
```

## Đăng ký MultiPartFeature

Cần đăng ký `MultiPartFeature` trong Application class:

```java
package com.example.rest;

import jakarta.ws.rs.ApplicationPath;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.glassfish.jersey.server.ResourceConfig;

// @ApplicationPath — định nghĩa base path cho toàn bộ REST API
@ApplicationPath("/api")
public class AppConfig extends ResourceConfig {

    public AppConfig() {
        // Quét các resource class trong package này
        packages("com.example.rest");
        // Đăng ký MultiPartFeature để xử lý upload file
        register(MultiPartFeature.class);
    }
}
```

## API Upload file

```java
package com.example.rest;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import org.glassfish.jersey.media.multipart.*;
import java.io.*;
import java.nio.file.*;

@Path("/files")
public class FileResource {

    // Thư mục lưu file upload trên server
    private static final String UPLOAD_DIR = "/tmp/uploads/";

    /**
     * POST /api/files/upload
     * Upload một file đơn lẻ
     *
     * @FormDataParam — annotation để nhận từng phần trong multipart form
     * InputStream — luồng dữ liệu nhị phân của file
     * FormDataContentDisposition — thông tin metadata của file (tên, kích thước...)
     */
    @POST
    @Path("/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Response uploadFile(
            @FormDataParam("file") InputStream fileStream,
            @FormDataParam("file") FormDataContentDisposition fileInfo,
            @FormDataParam("description") String description) {

        if (fileStream == null || fileInfo == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                           .entity("{\"error\": \"Không có file được gửi lên\"}")
                           .build();
        }

        String fileName = fileInfo.getFileName();
        long fileSize = fileInfo.getSize();

        // Tạo thư mục nếu chưa tồn tại
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        // Đường dẫn lưu file
        String savedPath = UPLOAD_DIR + fileName;

        try {
            // Ghi InputStream vào file trên đĩa
            Files.copy(fileStream, Paths.get(savedPath),
                       StandardCopyOption.REPLACE_EXISTING);

            String result = String.format(
                "{\"message\": \"Upload thành công\", \"fileName\": \"%s\", \"size\": %d, \"description\": \"%s\"}",
                fileName, fileSize, description != null ? description : ""
            );

            return Response.status(Response.Status.CREATED)
                           .entity(result)
                           .build();

        } catch (IOException e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                           .entity("{\"error\": \"Lỗi khi lưu file: " + e.getMessage() + "\"}")
                           .build();
        }
    }

    /**
     * POST /api/files/upload-multiple
     * Upload nhiều file cùng lúc
     * MultiPart — đại diện cho toàn bộ multipart request
     */
    @POST
    @Path("/upload-multiple")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Response uploadMultipleFiles(MultiPart multiPart) {
        StringBuilder result = new StringBuilder("{\"uploadedFiles\": [");
        boolean first = true;

        for (BodyPart part : multiPart.getBodyParts()) {
            // Chỉ xử lý các part là file (có Content-Disposition header)
            if (part instanceof FormDataBodyPart) {
                FormDataBodyPart filePart = (FormDataBodyPart) part;
                String fileName = filePart.getFormDataContentDisposition().getFileName();

                if (fileName != null && !fileName.isEmpty()) {
                    try {
                        InputStream stream = filePart.getValueAs(InputStream.class);
                        Files.copy(stream, Paths.get(UPLOAD_DIR + fileName),
                                   StandardCopyOption.REPLACE_EXISTING);

                        if (!first) result.append(",");
                        result.append("\"").append(fileName).append("\"");
                        first = false;
                    } catch (IOException e) {
                        System.err.println("Lỗi upload file " + fileName + ": " + e.getMessage());
                    }
                }
            }
        }

        result.append("]}");
        return Response.ok(result.toString()).build();
    }
}
```

## API Download file

```java
    /**
     * GET /api/files/download/{fileName}
     * Download file theo tên
     *
     * StreamingOutput — interface để truyền dữ liệu dạng luồng, phù hợp với file lớn
     * Content-Disposition — header yêu cầu browser tải file thay vì hiển thị
     */
    @GET
    @Path("/download/{fileName}")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response downloadFile(@PathParam("fileName") String fileName) {
        File file = new File(UPLOAD_DIR + fileName);

        if (!file.exists()) {
            return Response.status(Response.Status.NOT_FOUND)
                           .entity("Không tìm thấy file: " + fileName)
                           .build();
        }

        // StreamingOutput giúp truyền file lớn mà không cần load toàn bộ vào RAM
        StreamingOutput stream = outputStream -> {
            try (InputStream fileStream = new FileInputStream(file)) {
                byte[] buffer = new byte[4096]; // Buffer 4KB
                int bytesRead;
                while ((bytesRead = fileStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                }
            }
        };

        return Response.ok(stream)
            // Content-Disposition: attachment — bắt browser tải về thay vì mở trên trình duyệt
            .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
            .header("Content-Length", file.length())
            .build();
    }

    /**
     * GET /api/files/preview/{fileName}
     * Hiển thị file ảnh trực tiếp trong trình duyệt (không tải về)
     */
    @GET
    @Path("/preview/{fileName}")
    public Response previewImage(@PathParam("fileName") String fileName) {
        File file = new File(UPLOAD_DIR + fileName);

        if (!file.exists()) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        // Xác định MIME type dựa trên phần mở rộng file
        String mimeType = getMimeType(fileName);

        StreamingOutput stream = outputStream -> {
            Files.copy(file.toPath(), outputStream);
        };

        return Response.ok(stream, mimeType)
            // inline — yêu cầu browser hiển thị file, không tải về
            .header("Content-Disposition", "inline; filename=\"" + fileName + "\"")
            .build();
    }

    private String getMimeType(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".pdf")) return "application/pdf";
        return "application/octet-stream"; // Mặc định: file nhị phân
    }
```

## Jersey Client để Upload file

```java
package com.example.client;

import jakarta.ws.rs.client.*;
import jakarta.ws.rs.core.*;
import org.glassfish.jersey.client.ClientConfig;
import org.glassfish.jersey.media.multipart.*;

import java.io.File;

public class FileUploadClient {

    public static void main(String[] args) {
        ClientConfig config = new ClientConfig();
        config.register(MultiPartFeature.class); // Bắt buộc đăng ký phía client

        Client client = ClientBuilder.newClient(config);

        File fileToUpload = new File("/path/to/document.pdf");

        // FormDataMultiPart — đối tượng đại diện cho multipart form data
        FormDataMultiPart form = new FormDataMultiPart();
        form.field("description", "Báo cáo tháng 6");
        // Thêm file vào form với field name là "file"
        form.bodyPart(new FileDataBodyPart("file", fileToUpload,
                      MediaType.APPLICATION_OCTET_STREAM_TYPE));

        WebTarget target = client.target("http://localhost:8080/api/files/upload");
        Response response = target
            .request(MediaType.APPLICATION_JSON)
            .post(Entity.entity(form, form.getMediaType()));

        System.out.println("Upload status: " + response.getStatus());
        System.out.println("Kết quả: " + response.readEntity(String.class));

        response.close();
        form.close();
        client.close();
    }
}
```

## Tóm tắt

Upload file dùng `@FormDataParam` với `MultiPartFeature` được đăng ký. Download file dùng `StreamingOutput` để tránh nạp toàn bộ file vào bộ nhớ, đặc biệt quan trọng với file lớn. Header `Content-Disposition` quyết định browser sẽ tải về (`attachment`) hay hiển thị trực tiếp (`inline`).
