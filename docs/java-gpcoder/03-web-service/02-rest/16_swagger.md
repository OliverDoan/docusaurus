---
sidebar_position: 16
title: "Giới thiệu Swagger - Tài liệu cho RESTful API"
---

# Giới thiệu Swagger - Tài liệu cho RESTful API

## Swagger là gì?

**Swagger** (nay gọi là OpenAPI Specification — đặc tả API mở) là bộ công cụ để thiết kế, xây dựng, và tài liệu hóa REST API. Swagger UI cung cấp giao diện web cho phép xem và test API trực tiếp trên trình duyệt mà không cần Postman.

**OpenAPI Specification (OAS)** là đặc tả chuẩn mô tả REST API bằng định dạng JSON hoặc YAML.

## Tại sao cần Swagger?

- **Tự động hóa tài liệu**: Viết code → Swagger tự tạo tài liệu, không cần viết thủ công.
- **Test API trực tiếp**: Swagger UI cho phép gọi API từ trình duyệt.
- **Code generation**: Tạo client code (Java, JavaScript, Python...) từ spec.
- **Tiêu chuẩn hóa**: Toàn team sử dụng cùng định dạng mô tả API.

## Cấu hình Maven

```xml
<dependencies>
    <!-- Swagger/OpenAPI 3.0 cho JAX-RS -->
    <dependency>
        <groupId>io.swagger.core.v3</groupId>
        <artifactId>swagger-jaxrs2</artifactId>
        <version>2.2.21</version>
    </dependency>

    <!-- Swagger UI tích hợp -->
    <dependency>
        <groupId>io.swagger.core.v3</groupId>
        <artifactId>swagger-jaxrs2-servlet-initializer-v2</artifactId>
        <version>2.2.21</version>
    </dependency>

    <!-- Webjars Swagger UI -->
    <dependency>
        <groupId>org.webjars</groupId>
        <artifactId>swagger-ui</artifactId>
        <version>5.17.14</version>
    </dependency>
</dependencies>
```

## Cấu hình Application

```java
package com.example.rest;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.*;
import io.swagger.v3.oas.annotations.servers.Server;
import jakarta.ws.rs.ApplicationPath;
import org.glassfish.jersey.server.ResourceConfig;

/**
 * @OpenAPIDefinition — cấu hình thông tin chung của API
 * Swagger sẽ đọc annotation này để tạo phần "Info" trong spec
 */
@OpenAPIDefinition(
    info = @Info(
        title = "Product Management API",
        version = "1.0.0",
        description = "API quản lý sản phẩm cho hệ thống thương mại điện tử",
        contact = @Contact(
            name = "Backend Team",
            email = "backend@example.com",
            url = "https://example.com"
        ),
        license = @License(
            name = "Apache 2.0",
            url = "https://www.apache.org/licenses/LICENSE-2.0"
        )
    ),
    servers = {
        @Server(url = "http://localhost:8080", description = "Server Development"),
        @Server(url = "https://api.example.com", description = "Server Production")
    }
)
@ApplicationPath("/api")
public class AppConfig extends ResourceConfig {

    public AppConfig() {
        packages("com.example.rest");
        // Đăng ký Swagger/OpenAPI integration
        register(io.swagger.v3.jaxrs2.integration.resources.OpenApiResource.class);
    }
}
```

## Resource với Swagger Annotation

```java
package com.example.rest;

import com.example.rest.model.Product;
import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.media.*;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import java.util.*;

/**
 * @Tag — nhóm các endpoint có liên quan dưới một tên chung
 * Swagger UI sẽ hiển thị các endpoint theo tag
 */
@Tag(name = "Products", description = "Các API quản lý sản phẩm")
@Path("/products")
@Produces(MediaType.APPLICATION_JSON)
public class ProductResource {

    private static Map<Integer, Product> products = new HashMap<>();

    static {
        products.put(1, new Product(1, "Laptop Dell XPS", 35_000_000));
        products.put(2, new Product(2, "Chuột Logitech MX", 1_800_000));
    }

    /**
     * @Operation — mô tả chi tiết một endpoint
     * @ApiResponse — mô tả các kết quả có thể xảy ra
     * @Schema — mô tả cấu trúc dữ liệu
     */
    @Operation(
        summary = "Lấy danh sách sản phẩm",
        description = "Trả về tất cả sản phẩm có trong hệ thống. Hỗ trợ phân trang và lọc."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Lấy thành công",
            content = @Content(
                mediaType = "application/json",
                array = @ArraySchema(schema = @Schema(implementation = Product.class))
            )
        ),
        @ApiResponse(responseCode = "500", description = "Lỗi server nội bộ")
    })
    @GET
    public Response getAllProducts(
            @Parameter(description = "Số trang (bắt đầu từ 1)", example = "1")
            @QueryParam("page") @DefaultValue("1") int page,

            @Parameter(description = "Số bản ghi mỗi trang", example = "10")
            @QueryParam("size") @DefaultValue("10") int size) {

        List<Product> result = new ArrayList<>(products.values());
        return Response.ok(result).build();
    }

    @Operation(summary = "Lấy sản phẩm theo ID")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Tìm thấy",
            content = @Content(schema = @Schema(implementation = Product.class))
        ),
        @ApiResponse(responseCode = "404", description = "Không tìm thấy sản phẩm")
    })
    @GET
    @Path("/{id}")
    public Response getProduct(
            @Parameter(description = "ID sản phẩm", required = true, example = "1")
            @PathParam("id") int id) {

        Product product = products.get(id);
        if (product == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(product).build();
    }

    @Operation(
        summary = "Tạo sản phẩm mới",
        description = "Tạo sản phẩm với thông tin được cung cấp. Trả về sản phẩm vừa tạo kèm ID."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Tạo thành công"),
        @ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ")
    })
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createProduct(
            @RequestBody(
                description = "Thông tin sản phẩm cần tạo",
                required = true,
                content = @Content(schema = @Schema(implementation = Product.class))
            )
            Product product) {

        if (product.getName() == null || product.getName().trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                           .entity("{\"error\": \"Tên sản phẩm không được để trống\"}")
                           .build();
        }

        int newId = products.size() + 1;
        product.setId(newId);
        products.put(newId, product);

        return Response.status(Response.Status.CREATED).entity(product).build();
    }

    @Operation(summary = "Xóa sản phẩm")
    @DELETE
    @Path("/{id}")
    public Response deleteProduct(@PathParam("id") int id) {
        if (!products.containsKey(id)) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        products.remove(id);
        return Response.noContent().build();
    }
}
```

## Mô tả Schema với @Schema

```java
package com.example.rest.model;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * @Schema — mô tả cấu trúc và ràng buộc của model trong Swagger UI
 */
@Schema(description = "Thông tin sản phẩm")
public class Product {

    @Schema(description = "ID sản phẩm (tự động tạo)", example = "1", readOnly = true)
    private int id;

    @Schema(description = "Tên sản phẩm", example = "Laptop Dell XPS 15",
            minLength = 1, maxLength = 255, required = true)
    private String name;

    @Schema(description = "Giá sản phẩm (VND)", example = "35000000",
            minimum = "0", required = true)
    private double price;

    @Schema(description = "Danh mục sản phẩm",
            example = "Laptop",
            allowableValues = {"Laptop", "Mouse", "Keyboard", "Monitor"})
    private String category;

    public Product() {}
    public Product(int id, String name, double price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
```

## Truy cập Swagger UI

Sau khi deploy ứng dụng:

- **OpenAPI JSON spec**: `http://localhost:8080/api/openapi.json`
- **OpenAPI YAML spec**: `http://localhost:8080/api/openapi.yaml`
- **Swagger UI** (nếu cấu hình webjars): `http://localhost:8080/swagger-ui/index.html`

Swagger UI cung cấp giao diện cho phép: xem tất cả endpoint, đọc mô tả, gửi test request trực tiếp từ trình duyệt.

## Tóm tắt

Swagger/OpenAPI là tiêu chuẩn công nghiệp để tài liệu hóa REST API. Với Jersey, thêm các annotation như `@Operation`, `@ApiResponse`, `@Schema` vào resource class, Swagger tự động tạo spec và giao diện UI. Tài liệu luôn đồng bộ với code — không bao giờ lỗi thời.
