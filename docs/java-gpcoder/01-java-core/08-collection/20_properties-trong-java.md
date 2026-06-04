---
sidebar_position: 20
title: "Lớp Properties trong Java"
---

# Lớp Properties trong Java

`Properties` là một lớp con của `Hashtable` được thiết kế đặc biệt để lưu trữ và đọc các cấu hình (configuration) dạng cặp key-value kiểu `String`. Đây là cách truyền thống để quản lý file `.properties` trong Java.

## Đặc điểm của Properties

- Kế thừa từ `Hashtable<Object, Object>`, nhưng trên thực tế chỉ nên dùng với key và value kiểu `String`.
- Hỗ trợ đọc/ghi file `.properties` (dạng văn bản thuần) và file `.xml`.
- Hỗ trợ **default properties** (giá trị mặc định) khi key không tồn tại.
- Thread-safe (vì kế thừa từ `Hashtable`).

## Ví dụ cơ bản

```java
import java.util.Properties;

public class PropertiesBasic {
    public static void main(String[] args) {
        Properties props = new Properties();

        // Thêm giá trị
        props.setProperty("app.name", "MyApp");
        props.setProperty("app.version", "1.0.0");
        props.setProperty("app.author", "Nguyễn Văn A");

        // Lấy giá trị
        String appName = props.getProperty("app.name");
        System.out.println("Tên ứng dụng: " + appName); // MyApp

        // Lấy với giá trị mặc định nếu key không tồn tại
        String dbHost = props.getProperty("db.host", "localhost");
        System.out.println("DB Host: " + dbHost); // localhost

        // Duyệt tất cả thuộc tính
        props.forEach((key, value) ->
            System.out.println(key + " = " + value)
        );
    }
}
```

## Đọc từ file .properties

Tạo file `config.properties`:

```properties
# Cấu hình ứng dụng
app.name=MyApp
app.version=2.0.0
db.host=localhost
db.port=5432
db.name=mydb
```

```java
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

public class ReadPropertiesFile {
    public static void main(String[] args) {
        Properties props = new Properties();

        try (FileInputStream fis = new FileInputStream("config.properties")) {
            props.load(fis); // Đọc file .properties
        } catch (IOException e) {
            System.err.println("Không thể đọc file config: " + e.getMessage());
            return;
        }

        System.out.println("Tên ứng dụng: " + props.getProperty("app.name"));
        System.out.println("DB Host: " + props.getProperty("db.host"));
        System.out.println("DB Port: " + props.getProperty("db.port"));
    }
}
```

## Ghi ra file .properties

```java
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Properties;

public class WritePropertiesFile {
    public static void main(String[] args) {
        Properties props = new Properties();
        props.setProperty("server.host", "192.168.1.1");
        props.setProperty("server.port", "8080");
        props.setProperty("server.timeout", "30");

        try (FileOutputStream fos = new FileOutputStream("server.properties")) {
            // store(outputStream, comment) - comment là dòng ghi chú đầu file
            props.store(fos, "Cấu hình máy chủ - tạo tự động");
            System.out.println("Đã ghi file server.properties thành công");
        } catch (IOException e) {
            System.err.println("Lỗi ghi file: " + e.getMessage());
        }
    }
}
```

File `server.properties` được tạo ra có dạng:

```properties
#Cấu hình máy chủ - tạo tự động
#Wed Jan 01 10:00:00 ICT 2025
server.timeout=30
server.port=8080
server.host=192.168.1.1
```

## Đọc từ classpath (trong ứng dụng thực tế)

Trong ứng dụng thực tế, file `.properties` thường nằm trong `src/main/resources`:

```java
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class ClasspathProperties {
    public static void main(String[] args) {
        Properties props = new Properties();

        // Đọc từ classpath thay vì đường dẫn tuyệt đối
        try (InputStream is = ClasspathProperties.class
                .getClassLoader()
                .getResourceAsStream("config.properties")) {

            if (is == null) {
                System.err.println("Không tìm thấy file config.properties trong classpath");
                return;
            }
            props.load(is);
        } catch (IOException e) {
            System.err.println("Lỗi đọc config: " + e.getMessage());
            return;
        }

        System.out.println("App: " + props.getProperty("app.name"));
    }
}
```

## Properties với giá trị mặc định

```java
import java.util.Properties;

public class DefaultProperties {
    public static void main(String[] args) {
        // Tạo properties mặc định
        Properties defaults = new Properties();
        defaults.setProperty("timeout", "30");
        defaults.setProperty("retry", "3");
        defaults.setProperty("log.level", "INFO");

        // Properties thực tế kế thừa từ defaults
        Properties actual = new Properties(defaults);
        actual.setProperty("timeout", "60"); // ghi đè giá trị mặc định

        System.out.println("timeout: " + actual.getProperty("timeout"));   // 60 (ghi đè)
        System.out.println("retry: " + actual.getProperty("retry"));       // 3 (từ defaults)
        System.out.println("log.level: " + actual.getProperty("log.level")); // INFO (từ defaults)
    }
}
```

## Lưu ý

- `Properties` chỉ nên dùng với `String` key và `String` value. Đừng dùng `put(Object, Object)` được kế thừa từ `Hashtable`.
- Trong các framework hiện đại như Spring Boot, file `.properties` và `.yaml` được tự động nạp — không cần dùng lớp `Properties` trực tiếp.
- Với cấu hình phức tạp, nên dùng thư viện như Apache Commons Configuration hoặc cơ chế của framework.
