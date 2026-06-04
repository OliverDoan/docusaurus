---
sidebar_position: 15
title: "Giới thiệu HATEOAS"
---

# Giới thiệu HATEOAS

## HATEOAS là gì?

**HATEOAS** (Hypermedia As The Engine Of Application State — Siêu phương tiện là động lực của trạng thái ứng dụng) là một ràng buộc trong kiến trúc REST cho phép client **tự khám phá** các hành động có thể thực hiện thông qua các liên kết (link) được trả về trong response.

Nói đơn giản: thay vì client phải biết trước tất cả URL của API, server trả về response kèm các **link** chỉ dẫn client biết tiếp theo có thể làm gì.

## REST thông thường vs HATEOAS

### REST thông thường

```json
GET /orders/123

{
    "id": 123,
    "status": "PENDING",
    "total": 500000,
    "customerId": 5
}
```

Client phải tự biết: để xác nhận đơn hàng thì gọi `POST /orders/123/confirm`, để hủy thì gọi `DELETE /orders/123`...

### REST với HATEOAS

```json
GET /orders/123

{
    "id": 123,
    "status": "PENDING",
    "total": 500000,
    "customerId": 5,
    "_links": {
        "self": {
            "href": "/api/orders/123",
            "method": "GET"
        },
        "confirm": {
            "href": "/api/orders/123/confirm",
            "method": "POST"
        },
        "cancel": {
            "href": "/api/orders/123/cancel",
            "method": "DELETE"
        },
        "customer": {
            "href": "/api/customers/5",
            "method": "GET"
        }
    }
}
```

Server tự mô tả những gì client được phép làm — như một menu tùy chọn động.

## Lợi ích của HATEOAS

1. **Loose coupling** (khớp nối lỏng): Client không hardcode URL, chỉ biết entry point.
2. **API tự mô tả**: Client có thể navigate API mà không cần đọc tài liệu.
3. **Linh hoạt**: Server có thể thay đổi URL mà không phá vỡ client.
4. **Kiểm soát trạng thái**: Link phản ánh hành động hợp lệ dựa trên trạng thái hiện tại.

## Triển khai HATEOAS với Jersey 2.x

Jersey không có hỗ trợ HATEOAS built-in như Spring HATEOAS, nhưng ta có thể tự triển khai dễ dàng.

### Model Link

```java
package com.example.rest.hateoas;

/**
 * Link — đại diện cho một liên kết trong HATEOAS response
 */
public class Link {
    private String href;    // URL của liên kết
    private String method;  // HTTP method
    private String rel;     // Mối quan hệ (relationship)

    public Link(String rel, String href, String method) {
        this.rel = rel;
        this.href = href;
        this.method = method;
    }

    public String getHref() { return href; }
    public String getMethod() { return method; }
    public String getRel() { return rel; }
}
```

### HateoasResource — Wrapper cho response

```java
package com.example.rest.hateoas;

import java.util.*;

/**
 * HateoasResource<T> — bọc data kèm links
 * Generic type T cho phép dùng với bất kỳ model nào
 */
public class HateoasResource<T> {
    private T data;
    private Map<String, Link> links = new LinkedHashMap<>();

    public HateoasResource(T data) {
        this.data = data;
    }

    /**
     * Thêm link vào response
     * @param rel Tên mối quan hệ (self, next, previous, confirm...)
     * @param href URL
     * @param method HTTP method
     */
    public HateoasResource<T> addLink(String rel, String href, String method) {
        links.put(rel, new Link(rel, href, method));
        return this; // Hỗ trợ method chaining
    }

    public T getData() { return data; }

    // Jackson serialize thành "_links" trong JSON
    @com.fasterxml.jackson.annotation.JsonProperty("_links")
    public Map<String, Link> getLinks() { return links; }
}
```

### Order Model

```java
package com.example.rest.model;

public class Order {
    private int id;
    private String status;  // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
    private double total;
    private int customerId;
    private String createdAt;

    public Order(int id, String status, double total, int customerId, String createdAt) {
        this.id = id;
        this.status = status;
        this.total = total;
        this.customerId = customerId;
        this.createdAt = createdAt;
    }

    public int getId() { return id; }
    public String getStatus() { return status; }
    public double getTotal() { return total; }
    public int getCustomerId() { return customerId; }
    public String getCreatedAt() { return createdAt; }
}
```

### Resource với HATEOAS

```java
package com.example.rest;

import com.example.rest.hateoas.HateoasResource;
import com.example.rest.model.Order;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;

import java.util.*;

@Path("/orders")
@Produces(MediaType.APPLICATION_JSON)
public class OrderResource {

    private static final Map<Integer, Order> ORDERS = new HashMap<>();
    private static final String API_BASE = "/api";

    static {
        ORDERS.put(1, new Order(1, "PENDING",  500_000, 5, "2024-06-01"));
        ORDERS.put(2, new Order(2, "CONFIRMED", 1_200_000, 3, "2024-06-02"));
        ORDERS.put(3, new Order(3, "SHIPPED",   350_000, 7, "2024-06-03"));
    }

    @GET
    @Path("/{id}")
    public Response getOrder(@PathParam("id") int id) {
        Order order = ORDERS.get(id);
        if (order == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        // Tạo HATEOAS response với links phù hợp theo trạng thái
        HateoasResource<Order> resource = new HateoasResource<>(order)
            .addLink("self", API_BASE + "/orders/" + id, "GET");

        // Link phụ thuộc vào trạng thái hiện tại của đơn hàng
        switch (order.getStatus()) {
            case "PENDING":
                // Đơn đang chờ — có thể xác nhận hoặc hủy
                resource.addLink("confirm", API_BASE + "/orders/" + id + "/confirm", "POST");
                resource.addLink("cancel",  API_BASE + "/orders/" + id + "/cancel",  "DELETE");
                break;
            case "CONFIRMED":
                // Đơn đã xác nhận — có thể giao hoặc hủy
                resource.addLink("ship",   API_BASE + "/orders/" + id + "/ship",   "POST");
                resource.addLink("cancel", API_BASE + "/orders/" + id + "/cancel", "DELETE");
                break;
            case "SHIPPED":
                // Đang giao — không có hành động (chờ delivery confirmation)
                resource.addLink("track", API_BASE + "/orders/" + id + "/tracking", "GET");
                break;
            case "DELIVERED":
                // Đã giao — có thể đánh giá
                resource.addLink("review", API_BASE + "/orders/" + id + "/review", "POST");
                break;
            // CANCELLED — không có hành động tiếp theo
        }

        // Link đến customer liên quan
        resource.addLink("customer", API_BASE + "/customers/" + order.getCustomerId(), "GET");

        return Response.ok(resource).build();
    }

    @GET
    public Response getAllOrders(@QueryParam("page") @DefaultValue("1") int page,
                                  @QueryParam("size") @DefaultValue("10") int size) {
        List<Order> orders = new ArrayList<>(ORDERS.values());
        int total = orders.size();

        // Phân trang
        int from = (page - 1) * size;
        int to = Math.min(from + size, total);
        List<Order> pageData = orders.subList(from, to);

        // HATEOAS collection với navigation links
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("data", pageData);
        response.put("page", page);
        response.put("size", size);
        response.put("total", total);

        Map<String, Object> links = new LinkedHashMap<>();
        links.put("self", Map.of("href", API_BASE + "/orders?page=" + page + "&size=" + size));

        // Link trang trước (nếu không phải trang đầu)
        if (page > 1) {
            links.put("prev", Map.of("href", API_BASE + "/orders?page=" + (page - 1) + "&size=" + size));
        }

        // Link trang sau (nếu còn trang tiếp)
        if (to < total) {
            links.put("next", Map.of("href", API_BASE + "/orders?page=" + (page + 1) + "&size=" + size));
        }

        response.put("_links", links);
        return Response.ok(response).build();
    }
}
```

## Response mẫu

Khi gọi `GET /api/orders/1` (đơn hàng đang `PENDING`):

```json
{
    "data": {
        "id": 1,
        "status": "PENDING",
        "total": 500000,
        "customerId": 5,
        "createdAt": "2024-06-01"
    },
    "_links": {
        "self":     { "href": "/api/orders/1",         "method": "GET"    },
        "confirm":  { "href": "/api/orders/1/confirm", "method": "POST"   },
        "cancel":   { "href": "/api/orders/1/cancel",  "method": "DELETE" },
        "customer": { "href": "/api/customers/5",      "method": "GET"    }
    }
}
```

Khi đơn hàng chuyển sang `SHIPPED`, response sẽ chỉ còn:

```json
"_links": {
    "self":  { "href": "/api/orders/1",          "method": "GET" },
    "track": { "href": "/api/orders/1/tracking", "method": "GET" }
}
```

Đây là sức mạnh của HATEOAS: server kiểm soát luồng nghiệp vụ thông qua links.

## Tóm tắt

HATEOAS đưa REST API lên mức trưởng thành cao nhất (Richardson Maturity Model Level 3). Response chứa links mô tả hành động tiếp theo dựa trên trạng thái hiện tại — client chỉ cần biết entry point và navigation theo links. Phù hợp với API phức tạp có nhiều trạng thái và luồng nghiệp vụ.
