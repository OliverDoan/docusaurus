---
sidebar_position: 13
title: "Tạo ứng dụng Java RESTful Client với thư viện Retrofit"
---

# Tạo ứng dụng Java RESTful Client với thư viện Retrofit

## Retrofit là gì?

**Retrofit** (trang bị lại) là thư viện HTTP client do Square phát triển, hoạt động trên nền OkHttp. Điểm đặc biệt của Retrofit: thay vì viết code gọi HTTP thủ công, bạn chỉ cần định nghĩa **interface** Java với các annotation mô tả API, Retrofit tự sinh ra implementation.

Retrofit được dùng rất phổ biến trong Android và các ứng dụng Java cần gọi REST API.

## Cấu hình Maven

```xml
<dependencies>
    <!-- Retrofit core -->
    <dependency>
        <groupId>com.squareup.retrofit2</groupId>
        <artifactId>retrofit</artifactId>
        <version>2.11.0</version>
    </dependency>

    <!-- Converter Jackson để parse JSON tự động -->
    <dependency>
        <groupId>com.squareup.retrofit2</groupId>
        <artifactId>converter-jackson</artifactId>
        <version>2.11.0</version>
    </dependency>

    <!-- OkHttp Logging Interceptor để debug -->
    <dependency>
        <groupId>com.squareup.okhttp3</groupId>
        <artifactId>logging-interceptor</artifactId>
        <version>4.12.0</version>
    </dependency>
</dependencies>
```

## Model

```java
package com.example.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Product {
    private int id;
    private String name;
    private double price;
    private String category;

    public Product() {}

    public Product(String name, double price, String category) {
        this.name = name;
        this.price = price;
        this.category = category;
    }

    // Getters và Setters
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

## Định nghĩa API Interface

Đây là điểm mạnh nhất của Retrofit: khai báo API bằng interface và annotation.

```java
package com.example.api;

import com.example.model.Product;
import retrofit2.Call;
import retrofit2.http.*;
import java.util.List;

/**
 * ProductApi — interface mô tả toàn bộ REST API của Product
 * Retrofit tự sinh implementation khi runtime
 *
 * @GET, @POST, @PUT, @DELETE — HTTP method tương ứng
 * @Path — tham số đường dẫn (giống @PathParam trong JAX-RS)
 * @Query — tham số query string
 * @Body — request body (tự động serialize sang JSON)
 * @Header — thêm HTTP header cụ thể
 */
public interface ProductApi {

    // GET /products — lấy tất cả
    @GET("products")
    Call<List<Product>> getAll();

    // GET /products?page=1&size=10&category=Laptop
    @GET("products")
    Call<List<Product>> search(
        @Query("page") int page,
        @Query("size") int size,
        @Query("category") String category,
        @Query("keyword") String keyword
    );

    // GET /products/{id}
    @GET("products/{id}")
    Call<Product> getById(@Path("id") int id);

    // POST /products — tạo mới (body tự động serialize sang JSON)
    @POST("products")
    Call<Product> create(@Body Product product);

    // PUT /products/{id} — cập nhật toàn bộ
    @PUT("products/{id}")
    Call<Product> update(@Path("id") int id, @Body Product product);

    // PATCH /products/{id} — cập nhật một phần
    // @FieldMap — dùng với @FormUrlEncoded để gửi form data
    @PATCH("products/{id}")
    Call<Product> partialUpdate(@Path("id") int id, @Body java.util.Map<String, Object> fields);

    // DELETE /products/{id}
    @DELETE("products/{id}")
    Call<Void> delete(@Path("id") int id);

    // Thêm Authorization header vào request cụ thể
    @GET("products/secure")
    Call<List<Product>> getSecureProducts(@Header("Authorization") String authToken);
}
```

## Tạo Retrofit Instance

```java
package com.example.client;

import com.example.api.ProductApi;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.jackson.JacksonConverterFactory;

public class RetrofitConfig {

    private static final String BASE_URL = "http://localhost:8080/api/";
    // Base URL PHẢI kết thúc bằng "/" — đây là yêu cầu bắt buộc của Retrofit

    public static ProductApi createProductApi() {
        // HttpLoggingInterceptor — ghi log toàn bộ request/response để debug
        HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
        loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);
        // Level.NONE, Level.BASIC, Level.HEADERS, Level.BODY

        // Tạo OkHttpClient tùy chỉnh
        OkHttpClient okHttpClient = new OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            // Interceptor tự động thêm header vào mọi request
            .addInterceptor(chain -> {
                Request request = chain.request().newBuilder()
                    .addHeader("X-App-Version", "1.0.0")
                    .build();
                return chain.proceed(request);
            })
            .build();

        // Retrofit builder — cấu hình Retrofit instance
        Retrofit retrofit = new Retrofit.Builder()
            .baseUrl(BASE_URL)
            // JacksonConverterFactory — tự động serialize/deserialize JSON với Jackson
            .addConverterFactory(JacksonConverterFactory.create(new ObjectMapper()))
            .client(okHttpClient)
            .build();

        // Tạo implementation của interface ProductApi
        return retrofit.create(ProductApi.class);
    }
}
```

## Sử dụng Retrofit — Gọi đồng bộ

**`Call.execute()`** là phương thức gọi đồng bộ (blocking) — chờ response trước khi tiếp tục.

```java
package com.example.client;

import com.example.api.ProductApi;
import com.example.model.Product;
import retrofit2.Call;
import retrofit2.Response;
import java.io.IOException;
import java.util.List;

public class RetrofitSyncExample {

    private final ProductApi api;

    public RetrofitSyncExample() {
        this.api = RetrofitConfig.createProductApi();
    }

    /**
     * Lấy tất cả sản phẩm — gọi đồng bộ
     * Response<T> — bọc cả status code, headers, và body
     */
    public void demoGetAll() throws IOException {
        Call<List<Product>> call = api.getAll();
        Response<List<Product>> response = call.execute(); // Blocking

        if (response.isSuccessful() && response.body() != null) {
            System.out.println("Danh sách sản phẩm:");
            response.body().forEach(p ->
                System.out.printf("  - [%d] %s: %.0f đ%n", p.getId(), p.getName(), p.getPrice())
            );
        } else {
            // errorBody() — body khi response là lỗi (4xx, 5xx)
            System.out.println("Lỗi: " + response.code() + " - " + response.errorBody().string());
        }
    }

    /**
     * Tạo sản phẩm mới
     */
    public Product demoCreate() throws IOException {
        Product newProduct = new Product("Monitor Dell 27inch", 8_500_000, "Monitor");

        Response<Product> response = api.create(newProduct).execute();

        if (response.code() == 201 && response.body() != null) {
            System.out.println("Tạo thành công: " + response.body().getName());
            return response.body();
        }
        throw new IOException("Tạo thất bại: " + response.code());
    }

    /**
     * Tìm kiếm với query parameters
     */
    public void demoSearch() throws IOException {
        Response<List<Product>> response = api.search(1, 10, "Laptop", "Dell").execute();
        if (response.isSuccessful()) {
            System.out.println("Tìm thấy: " + response.body().size() + " sản phẩm");
        }
    }
}
```

## Sử dụng Retrofit — Gọi bất đồng bộ

**`Call.enqueue(Callback)`** là phương thức gọi bất đồng bộ (non-blocking).

```java
public class RetrofitAsyncExample {

    private final ProductApi api;

    public RetrofitAsyncExample() {
        this.api = RetrofitConfig.createProductApi();
    }

    /**
     * Lấy tất cả sản phẩm — gọi bất đồng bộ với Callback
     */
    public void demoGetAllAsync() {
        api.getAll().enqueue(new retrofit2.Callback<List<Product>>() {

            @Override
            public void onResponse(Call<List<Product>> call,
                                   Response<List<Product>> response) {
                // Gọi trong thread OkHttp khi nhận được response
                if (response.isSuccessful()) {
                    System.out.println("Nhận được " + response.body().size() + " sản phẩm");
                    response.body().forEach(System.out::println);
                }
            }

            @Override
            public void onFailure(Call<List<Product>> call, Throwable t) {
                // Gọi khi có lỗi mạng hoặc deserialize thất bại
                System.err.println("Lỗi: " + t.getMessage());
            }
        });

        System.out.println("Request đã gửi, đang chờ response...");
    }

    /**
     * Xóa sản phẩm — Call<Void> khi server không trả về body
     */
    public void demoDelete(int id) {
        api.delete(id).enqueue(new retrofit2.Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.code() == 204) {
                    System.out.println("Đã xóa sản phẩm ID: " + id);
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                System.err.println("Xóa thất bại: " + t.getMessage());
            }
        });
    }
}
```

## Tóm tắt

Retrofit nổi bật với cách tiếp cận khai báo: định nghĩa API bằng interface + annotation, không viết code HTTP thủ công. Điều này giúp code gọn, dễ đọc, dễ test. Converter giúp tự động serialize/deserialize JSON. Retrofit phù hợp cho dự án có nhiều endpoint cần gọi và cần maintainability cao.
