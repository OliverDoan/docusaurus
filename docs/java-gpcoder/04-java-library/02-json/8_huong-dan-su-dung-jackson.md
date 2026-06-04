---
sidebar_position: 8
title: "Hướng dẫn sử dụng thư viện Jackson"
---

# Hướng dẫn sử dụng thư viện Jackson

**Jackson** là thư viện xử lý JSON phổ biến nhất trong hệ sinh thái Java, được phát triển bởi FasterXML. Jackson nổi bật với hiệu năng cao, tính linh hoạt vượt trội và được tích hợp mặc định trong Spring Boot. **`ObjectMapper`** (bộ ánh xạ đối tượng) là lớp trung tâm của Jackson, chịu trách nhiệm chuyển đổi giữa Java và JSON.

---

## 1. Maven Dependency

```xml
<!-- Jackson Databind: bao gồm jackson-core và jackson-annotations -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.17.0</version>
</dependency>

<!-- Module hỗ trợ Java 8+ Date/Time (LocalDate, LocalDateTime...) -->
<dependency>
    <groupId>com.fasterxml.jackson.datatype</groupId>
    <artifactId>jackson-datatype-jsr310</artifactId>
    <version>2.17.0</version>
</dependency>
```

---

## 2. Chuẩn bị lớp Java

Jackson yêu cầu lớp có **constructor không tham số** (hoặc dùng `@JsonCreator`) và thường cần **getter/setter** để ánh xạ trường.

```java
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

public class SanPham {
    private int id;
    private String ten;
    private double gia;
    private int soLuong;
    private LocalDate ngayNhap;

    // Constructor không tham số — bắt buộc cho Jackson
    public SanPham() {}

    public SanPham(int id, String ten, double gia, int soLuong, LocalDate ngayNhap) {
        this.id = id;
        this.ten = ten;
        this.gia = gia;
        this.soLuong = soLuong;
        this.ngayNhap = ngayNhap;
    }

    // Getters và Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTen() { return ten; }
    public void setTen(String ten) { this.ten = ten; }

    public double getGia() { return gia; }
    public void setGia(double gia) { this.gia = gia; }

    public int getSoLuong() { return soLuong; }
    public void setSoLuong(int soLuong) { this.soLuong = soLuong; }

    public LocalDate getNgayNhap() { return ngayNhap; }
    public void setNgayNhap(LocalDate ngayNhap) { this.ngayNhap = ngayNhap; }
}
```

---

## 3. Serialization và Deserialization cơ bản

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.time.LocalDate;

public class VíDuJacksonCoBan {
    public static void main(String[] args) throws Exception {
        // Khởi tạo và cấu hình ObjectMapper
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());             // Hỗ trợ LocalDate/LocalDateTime
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS); // Ghi ngày dạng ISO-8601
        mapper.enable(SerializationFeature.INDENT_OUTPUT);       // Pretty print

        SanPham sp = new SanPham(1, "Bàn phím cơ", 850_000, 50, LocalDate.of(2024, 3, 10));

        // Serialize: đối tượng Java → chuỗi JSON
        String json = mapper.writeValueAsString(sp);
        System.out.println("JSON:\n" + json);

        // Deserialize: chuỗi JSON → đối tượng Java
        SanPham spPhucHoi = mapper.readValue(json, SanPham.class);
        System.out.println("Tên sản phẩm: " + spPhucHoi.getTen());
        System.out.println("Ngày nhập: " + spPhucHoi.getNgayNhap());
    }
}
```

Kết quả:

```
JSON:
{
  "id" : 1,
  "ten" : "Bàn phím cơ",
  "gia" : 850000.0,
  "soLuong" : 50,
  "ngayNhap" : "2024-03-10"
}
Tên sản phẩm: Bàn phím cơ
Ngày nhập: 2024-03-10
```

---

## 4. Làm việc với List và Map

```java
import com.fasterxml.jackson.core.type.TypeReference;
import java.util.List;
import java.util.Map;

public class VíDuDanhSach {
    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        // List → JSON
        List`<SanPham>` danhSach = List.of(
            new SanPham(1, "Chuột không dây", 320_000, 100, null),
            new SanPham(2, "Tai nghe", 550_000, 75, null)
        );
        String json = mapper.writeValueAsString(danhSach);

        // JSON → List (dùng TypeReference để giữ thông tin generic)
        List`<SanPham>` phucHoi = mapper.readValue(json, new TypeReference`<List<SanPham>>`() {});
        phucHoi.forEach(s -> System.out.println(s.getTen() + ": " + s.getGia()));

        // JSON → Map (khi không có lớp Java tương ứng)
        String jsonDon = "{\"ma\":\"SP001\",\"ten\":\"Màn hình\",\"gia\":3500000}";
        Map`<String, Object>` map = mapper.readValue(jsonDon, new TypeReference`<Map<String, Object>>`() {});
        System.out.println("Giá: " + map.get("gia"));
    }
}
```

---

## 5. Annotations quan trọng của Jackson

```java
import com.fasterxml.jackson.annotation.*;

public class NguoiDung {

    @JsonProperty("user_id")        // Đổi tên key JSON (giống @SerializedName của Gson)
    private int id;

    @JsonProperty("full_name")
    private String hoTen;

    @JsonIgnore                     // Bỏ qua trường này hoàn toàn (cả đọc và ghi)
    private String matKhau;

    @JsonIgnoreProperties({"truongA", "truongB"}) // Bỏ qua nhiều trường — đặt trên lớp
    // (đặt trên class)

    @JsonInclude(JsonInclude.Include.NON_NULL) // Chỉ serialize khi giá trị không null
    private String diaChi;

    @JsonFormat(pattern = "dd/MM/yyyy")  // Định dạng ngày tháng khi ghi ra JSON
    private LocalDate ngaySinh;

    // Constructor không tham số
    public NguoiDung() {}

    public NguoiDung(int id, String hoTen, String matKhau, String diaChi, LocalDate ngaySinh) {
        this.id = id;
        this.hoTen = hoTen;
        this.matKhau = matKhau;
        this.diaChi = diaChi;
        this.ngaySinh = ngaySinh;
    }

    // Getters/setters bỏ qua cho gọn
}
```

---

## 6. Đọc và ghi File JSON

```java
import java.io.File;

public class VíDuDocGhiFile {
    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        // Ghi đối tượng ra file JSON
        SanPham sp = new SanPham(3, "Webcam HD", 750_000, 30, null);
        mapper.writerWithDefaultPrettyPrinter()
              .writeValue(new File("san-pham.json"), sp);
        System.out.println("Đã ghi file san-pham.json");

        // Đọc đối tượng từ file JSON
        SanPham spDocLai = mapper.readValue(new File("san-pham.json"), SanPham.class);
        System.out.println("Đọc lại: " + spDocLai.getTen());
    }
}
```

---

## 7. So sánh Jackson và Gson

| Tiêu chí | Jackson | Gson |
|----------|---------|------|
| Hiệu năng | Rất cao | Tốt |
| Tích hợp Spring Boot | Mặc định có sẵn | Phải cấu hình thêm |
| Hỗ trợ Java 8+ Date/Time | Qua module JSR310 | Qua custom adapter |
| Cấu hình | Phong phú, nhiều tùy chọn | Đơn giản hơn |
| Kích thước thư viện | Lớn hơn | Nhỏ gọn hơn |
| Độ khó học | Trung bình | Dễ hơn |
| Phù hợp | Dự án enterprise, Spring Boot | Dự án nhỏ, Android |

---

## 8. Tổng kết các phương thức ObjectMapper hay dùng

| Phương thức | Mô tả |
|-------------|-------|
| `writeValueAsString(obj)` | Đối tượng → chuỗi JSON |
| `writeValue(File, obj)` | Đối tượng → file JSON |
| `readValue(String, Class)` | Chuỗi JSON → đối tượng |
| `readValue(File, Class)` | File JSON → đối tượng |
| `readValue(String, TypeReference)` | Chuỗi JSON → kiểu generic |
| `readTree(String)` | Chuỗi JSON → `JsonNode` (cây đối tượng linh hoạt) |
| `convertValue(obj, Class)` | Chuyển đổi giữa các kiểu Java qua JSON |

Jackson là lựa chọn hàng đầu cho dự án Spring Boot và các ứng dụng doanh nghiệp Java nhờ hiệu năng vượt trội và hệ sinh thái phong phú (hỗ trợ XML, YAML, CSV thông qua các module riêng).
