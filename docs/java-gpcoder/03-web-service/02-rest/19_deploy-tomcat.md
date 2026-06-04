---
sidebar_position: 19
title: "Triển khai ứng dụng Jersey REST Web service lên Tomcat Server"
---

# Triển khai ứng dụng Jersey REST Web service lên Tomcat Server

## Tổng quan

**Apache Tomcat** (máy chủ ứng dụng Tomcat) là Servlet Container phổ biến nhất để triển khai ứng dụng Java web. Jersey REST API đóng gói thành file `.war` (Web Application Archive — gói ứng dụng web) và deploy lên Tomcat.

Có hai cách cấu hình Jersey với Tomcat:
1. Dùng `web.xml` (cách truyền thống)
2. Dùng `@ApplicationPath` (không cần `web.xml`)

## Cấu hình Maven cho WAR packaging

```xml
<project>
    <groupId>com.example</groupId>
    <artifactId>rest-api</artifactId>
    <version>1.0.0</version>

    <!-- packaging war — tạo file .war thay vì .jar -->
    <packaging>war</packaging>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <jersey.version>2.40</jersey.version>
    </properties>

    <dependencies>
        <!-- Jersey JAX-RS -->
        <dependency>
            <groupId>org.glassfish.jersey.containers</groupId>
            <artifactId>jersey-container-servlet</artifactId>
            <version>${jersey.version}</version>
        </dependency>

        <!-- HK2 Dependency Injection -->
        <dependency>
            <groupId>org.glassfish.jersey.inject</groupId>
            <artifactId>jersey-hk2</artifactId>
            <version>${jersey.version}</version>
        </dependency>

        <!-- Jackson JSON -->
        <dependency>
            <groupId>org.glassfish.jersey.media</groupId>
            <artifactId>jersey-media-json-jackson</artifactId>
            <version>${jersey.version}</version>
        </dependency>

        <!-- Jakarta Servlet API — provided vì Tomcat đã có sẵn -->
        <dependency>
            <groupId>jakarta.servlet</groupId>
            <artifactId>jakarta.servlet-api</artifactId>
            <version>6.0.0</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <finalName>rest-api</finalName>
        <plugins>
            <!-- Maven WAR Plugin -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-war-plugin</artifactId>
                <version>3.4.0</version>
                <configuration>
                    <!-- Cho phép không có web.xml (dùng @ApplicationPath) -->
                    <failOnMissingWebXml>false</failOnMissingWebXml>
                </configuration>
            </plugin>

            <!-- Tomcat Maven Plugin — deploy từ Maven -->
            <plugin>
                <groupId>org.apache.tomcat.maven</groupId>
                <artifactId>tomcat7-maven-plugin</artifactId>
                <version>2.2</version>
                <configuration>
                    <url>http://localhost:8080/manager/text</url>
                    <server>TomcatServer</server>
                    <path>/rest-api</path>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

## Cách 1: Cấu hình với @ApplicationPath (không cần web.xml)

```java
package com.example.rest;

import jakarta.ws.rs.ApplicationPath;
import org.glassfish.jersey.jackson.JacksonFeature;
import org.glassfish.jersey.server.ResourceConfig;

/**
 * @ApplicationPath("/api") — base path cho toàn bộ REST API
 * Tất cả endpoint sẽ có dạng: http://localhost:8080/rest-api/api/...
 * Trong đó: "rest-api" là context path (tên ứng dụng)
 */
@ApplicationPath("/api")
public class JerseyApp extends ResourceConfig {

    public JerseyApp() {
        // Quét tự động tất cả resource trong package
        packages("com.example.rest.resource");

        // Đăng ký Jackson cho JSON
        register(JacksonFeature.class);

        // Đăng ký exception mappers
        packages("com.example.rest.exception");

        // Đăng ký filters
        packages("com.example.rest.filter");
    }
}
```

## Cách 2: Cấu hình với web.xml (tường minh hơn)

```xml
<!-- src/main/webapp/WEB-INF/web.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="https://jakarta.ee/xml/ns/jakartaee
                             https://jakarta.ee/xml/ns/jakartaee/web-app_6_0.xsd"
         version="6.0">

    <display-name>REST API Application</display-name>

    <servlet>
        <servlet-name>Jersey REST Service</servlet-name>
        <!-- ServletContainer — Servlet tích hợp Jersey vào container -->
        <servlet-class>org.glassfish.jersey.servlet.ServletContainer</servlet-class>
        <init-param>
            <!-- Chỉ định Application class của Jersey -->
            <param-name>jakarta.ws.rs.Application</param-name>
            <param-value>com.example.rest.JerseyApp</param-value>
        </init-param>
        <!-- Hoặc dùng package scan thay vì Application class -->
        <!--
        <init-param>
            <param-name>jersey.config.server.provider.packages</param-name>
            <param-value>com.example.rest</param-value>
        </init-param>
        -->
        <load-on-startup>1</load-on-startup>
    </servlet>

    <servlet-mapping>
        <servlet-name>Jersey REST Service</servlet-name>
        <!-- Tất cả request đến /api/* sẽ được xử lý bởi Jersey -->
        <url-pattern>/api/*</url-pattern>
    </servlet-mapping>

    <!-- Cấu hình session timeout (phút) -->
    <session-config>
        <session-timeout>30</session-timeout>
    </session-config>

</web-app>
```

## Cấu trúc project

```
rest-api/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/rest/
│   │   │       ├── JerseyApp.java         (Application config)
│   │   │       ├── resource/
│   │   │       │   ├── ProductResource.java
│   │   │       │   └── UserResource.java
│   │   │       ├── model/
│   │   │       │   └── Product.java
│   │   │       ├── service/
│   │   │       │   └── ProductService.java
│   │   │       ├── filter/
│   │   │       │   └── JwtAuthFilter.java
│   │   │       └── exception/
│   │   │           └── ExceptionMapper.java
│   │   ├── resources/
│   │   │   └── logback.xml
│   │   └── webapp/
│   │       └── WEB-INF/
│   │           └── web.xml    (tùy chọn)
│   └── test/
│       └── java/...
└── pom.xml
```

## Build và Deploy

### Build WAR file

```bash
# Build file WAR
mvn clean package

# File WAR được tạo tại:
# target/rest-api.war
```

### Deploy thủ công lên Tomcat

```bash
# Cách 1: Copy vào thư mục webapps của Tomcat
cp target/rest-api.war /opt/tomcat/webapps/

# Tomcat tự động deploy (hot deployment)
# Sau vài giây, API có tại: http://localhost:8080/rest-api/api/...
```

### Deploy qua Tomcat Manager

```bash
# Cách 2: Dùng Tomcat Manager Web UI
# Truy cập: http://localhost:8080/manager/html
# Section "Deploy" → chọn WAR file → Deploy

# Cách 3: Dùng Maven plugin (cần cấu hình trong pom.xml)
mvn tomcat7:deploy    # Deploy lần đầu
mvn tomcat7:redeploy  # Deploy lại khi có thay đổi
mvn tomcat7:undeploy  # Gỡ bỏ
```

## Kiểm tra sau khi Deploy

```bash
# Kiểm tra API hoạt động
curl http://localhost:8080/rest-api/api/products

# Với Authorization header
curl -H "Authorization: Bearer <token>" \
     http://localhost:8080/rest-api/api/products
```

## Cấu hình JNDI DataSource (kết nối database)

```xml
<!-- context.xml trong META-INF/ — cấu hình DataSource cho Tomcat -->
<?xml version="1.0" encoding="UTF-8"?>
<Context>
    <Resource name="jdbc/mydb"
              auth="Container"
              type="javax.sql.DataSource"
              driverClassName="com.mysql.cj.jdbc.Driver"
              url="jdbc:mysql://localhost:3306/mydb"
              username="root"
              password="secret"
              maxTotal="20"
              maxIdle="10"
              maxWaitMillis="-1"/>
</Context>
```

```java
// Lấy DataSource từ JNDI trong ứng dụng
import javax.naming.*;
import javax.sql.DataSource;

public class DatabaseConfig {
    public static DataSource getDataSource() throws NamingException {
        // InitialContext — điểm bắt đầu để tra cứu tài nguyên JNDI
        Context ctx = new InitialContext();
        return (DataSource) ctx.lookup("java:comp/env/jdbc/mydb");
    }
}
```

## Xử lý lỗi khi Deploy

| Lỗi thường gặp | Nguyên nhân | Giải pháp |
|---|---|---|
| `ClassNotFoundException` | Thiếu dependency trong WAR | Kiểm tra scope trong pom.xml |
| `404 Not Found` | Sai context path hoặc URL pattern | Kiểm tra `@ApplicationPath` và `web.xml` |
| `500 on startup` | Lỗi khởi tạo Spring/Jersey | Xem log trong `catalina.out` |
| Port conflict | Tomcat cổng 8080 đã dùng | Đổi port trong `server.xml` |

```bash
# Xem log Tomcat để debug
tail -f /opt/tomcat/logs/catalina.out
```

## Tóm tắt

Deploy Jersey lên Tomcat: (1) set `<packaging>war</packaging>` trong Maven, (2) dùng `@ApplicationPath` hoặc `web.xml` để cấu hình, (3) đánh dấu `servlet-api` là `provided`, (4) build WAR với `mvn package`, (5) copy vào `webapps/`. Context path mặc định là tên file WAR (không kể `.war`).
