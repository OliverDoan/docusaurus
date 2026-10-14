---
sidebar_position: 0
title: "Giới thiệu"
---

# Lộ trình Spring Boot

Lộ trình này bám theo [roadmap.sh/spring-boot](https://roadmap.sh/spring-boot): đi từ nền tảng Spring Core (IoC, DI, AOP), qua Spring Boot, Spring MVC, Spring Security, tầng dữ liệu (Hibernate, Spring Data), rồi lên microservices với Spring Cloud và kết thúc ở testing. Mục tiêu là người đã biết Java cơ bản có thể tự viết được một REST API hoàn chỉnh, có bảo mật, có database và có test.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Spring Boot = Spring Framework + cấu hình sẵn** — starter gom dependency, auto-configuration tự dựng bean, server nhúng giúp chạy bằng `java -jar`.
- ⭐ **Nắm chắc IoC/DI trước** — mọi tính năng khác (MVC, Security, Data, Test) đều xây trên container quản lý bean.
- **Lộ trình gồm 9 nhóm** — giới thiệu → core → Boot → MVC → Security → Hibernate → Spring Data → Spring Cloud → Testing.
- **Phiên bản tham chiếu**: Spring Boot 3.x (Java 17+, `jakarta.*`); các điểm khác biệt ở Boot 4 được ghi chú riêng khi có.

:::

---

## Spring Boot là gì?

**Spring Framework** là bộ khung lập trình Java lớn nhất cho backend: nó cung cấp một **container** (thùng chứa) tạo và nối các đối tượng với nhau, cùng hàng loạt module cho web, dữ liệu, bảo mật, messaging...

Vấn đề là Spring "thuần" phải cấu hình rất nhiều: khai báo bean bằng XML, tự cài Tomcat, tự chọn phiên bản thư viện sao cho không xung đột. **Spring Boot** ra đời (2014) để xoá phần việc đó:

- **Starter** — thêm một dependency `spring-boot-starter-web` là có đủ Spring MVC, Jackson, Tomcat với phiên bản đã khớp nhau.
- **Auto-configuration** — thấy thư viện nào trên classpath thì tự dựng bean tương ứng, bạn chỉ ghi đè khi cần.
- **Embedded server** — ứng dụng đóng gói thành một file `.jar` chạy được ngay.
- **Actuator** — có sẵn endpoint health, metrics để vận hành production.

:::tip[Ví dụ đời thường]

Spring Framework giống một **kho linh kiện** lắp máy tính: đủ mọi thứ nhưng bạn phải tự chọn mainboard, RAM, nguồn sao cho tương thích. Spring Boot là **máy bộ lắp sẵn**: cắm điện là chạy, muốn nâng RAM thì vẫn thay được.

:::

## Lộ trình học

| # | Nhóm | Nội dung chính |
|---|------|----------------|
| 1 | Giới thiệu | Thuật ngữ, kiến trúc Spring, vì sao dùng Spring |
| 2 | Spring Core | IoC container, Dependency Injection, cấu hình, annotation, bean scope, AOP |
| 3 | Spring Boot cơ bản | Starter, auto-configuration, embedded server, Actuator |
| 4 | Spring MVC | Servlet, kiến trúc MVC, các thành phần, view với JSP/Thymeleaf |
| 5 | Spring Security | Authentication, Authorization, OAuth2, JWT |
| 6 | Hibernate | Vòng đời entity, quan hệ, transaction |
| 7 | Spring Data | Spring Data JPA, JDBC, MongoDB |
| 8 | Microservices | Spring Cloud: Eureka, Gateway, Config, OpenFeign, Circuit Breaker, tracing |
| 9 | Testing | `@SpringBootTest`, mock bean, MockMvc, `@DataJpaTest` |

## Thứ tự học gợi ý

1. **Nhóm 1–3** là bắt buộc: không hiểu IoC/DI và auto-configuration thì các phần sau chỉ là học thuộc annotation.
2. **Nhóm 4, 6, 7** để viết được REST API có database — làm ngay một dự án nhỏ (quản lý công việc, blog).
3. **Nhóm 5 và 9** để đưa dự án lên mức dùng được thật: có đăng nhập, có test.
4. **Nhóm 8** chỉ học khi đã vững monolith — microservices giải quyết vấn đề tổ chức và mở rộng, không phải điểm khởi đầu.

:::info[Kiến thức cần có trước]

Java cơ bản (OOP, interface, generics, collection, lambda), build tool Maven hoặc Gradle, HTTP và REST, SQL cơ bản. Các phần này có trong topic **Java** và **Backend** của site.

:::
