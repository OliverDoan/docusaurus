---
sidebar_position: 7
title: "Hướng dẫn sử dụng Gson TypeAdapter"
---

# Hướng dẫn sử dụng Gson TypeAdapter

**`TypeAdapter<T>`** là lớp trừu tượng trong Gson cung cấp cơ chế tùy chỉnh serialize/deserialize dựa trên **Streaming API** (đọc/ghi từng token). So với `JsonSerializer`/`JsonDeserializer` hoạt động trên **DOM** (cây đối tượng JSON), `TypeAdapter` hiệu quả hơn vì không cần tạo đối tượng trung gian `JsonElement`.

---

## 1. Maven Dependency

```xml
<dependency>
    <groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
    <version>2.10.1</version>
</dependency>
```

---

## 2. Cấu trúc TypeAdapter

```java
import com.google.gson.TypeAdapter;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;
import java.io.IOException;

public class MyTypeAdapter extends TypeAdapter`<MyClass>` {

    @Override
    public void write(JsonWriter out, MyClass value) throws IOException {
        // Ghi đối tượng MyClass ra JSON token theo token
        // Sử dụng JsonWriter (Streaming API)
    }

    @Override
    public MyClass read(JsonReader in) throws IOException {
        // Đọc JSON token theo token và tạo đối tượng MyClass
        // Sử dụng JsonReader (Streaming API)
        return null;
    }
}
```

---

## 3. Ví dụ: TypeAdapter cho lớp DiaChi

```java
public class DiaChi {
    private String soNha;
    private String duong;
    private String thanhPho;
    private String quocGia;

    public DiaChi(String soNha, String duong, String thanhPho, String quocGia) {
        this.soNha = soNha;
        this.duong = duong;
        this.thanhPho = thanhPho;
        this.quocGia = quocGia;
    }

    // Getters
    public String getSoNha() { return soNha; }
    public String getDuong() { return duong; }
    public String getThanhPho() { return thanhPho; }
    public String getQuocGia() { return quocGia; }
}
```

```java
import com.google.gson.TypeAdapter;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonToken;
import com.google.gson.stream.JsonWriter;
import java.io.IOException;

public class DiaChiTypeAdapter extends TypeAdapter`<DiaChi>` {

    @Override
    public void write(JsonWriter out, DiaChi diaChi) throws IOException {
        if (diaChi == null) {
            out.nullValue(); // Ghi null nếu đối tượng null
            return;
        }
        out.beginObject();                              // {
        out.name("so_nha").value(diaChi.getSoNha());   // "so_nha": "..."
        out.name("duong").value(diaChi.getDuong());
        out.name("thanh_pho").value(diaChi.getThanhPho());
        out.name("quoc_gia").value(diaChi.getQuocGia());
        out.endObject();                               // }
    }

    @Override
    public DiaChi read(JsonReader in) throws IOException {
        // Kiểm tra null
        if (in.peek() == JsonToken.NULL) {
            in.nextNull();
            return null;
        }

        String soNha = null, duong = null, thanhPho = null, quocGia = null;

        in.beginObject();
        while (in.hasNext()) {
            String tenTruong = in.nextName();
            switch (tenTruong) {
                case "so_nha"    -> soNha = in.nextString();
                case "duong"     -> duong = in.nextString();
                case "thanh_pho" -> thanhPho = in.nextString();
                case "quoc_gia"  -> quocGia = in.nextString();
                default          -> in.skipValue(); // Bỏ qua trường lạ
            }
        }
        in.endObject();

        return new DiaChi(soNha, duong, thanhPho, quocGia);
    }
}
```

```java
import com.google.gson.*;

public class VíDuTypeAdapter {
    public static void main(String[] args) {
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(DiaChi.class, new DiaChiTypeAdapter())
                .setPrettyPrinting()
                .create();

        // Serialize
        DiaChi dc = new DiaChi("12B", "Nguyễn Huệ", "TP. Hồ Chí Minh", "Việt Nam");
        String json = gson.toJson(dc);
        System.out.println("JSON:\n" + json);

        // Deserialize
        DiaChi dcPhucHoi = gson.fromJson(json, DiaChi.class);
        System.out.println("Thành phố: " + dcPhucHoi.getThanhPho());
    }
}
```

Kết quả:

```json
JSON:
{
  "so_nha": "12B",
  "duong": "Nguyễn Huệ",
  "thanh_pho": "TP. Hồ Chí Minh",
  "quoc_gia": "Việt Nam"
}
Thành phố: TP. Hồ Chí Minh
```

---

## 4. TypeAdapterFactory — Tạo TypeAdapter theo điều kiện

**`TypeAdapterFactory`** (nhà máy tạo TypeAdapter) cho phép tạo TypeAdapter dựa trên kiểu dữ liệu tại runtime, hữu ích cho xử lý đa hình hoặc tạo adapter cho một nhóm kiểu.

```java
import com.google.gson.*;
import com.google.gson.reflect.TypeToken;
import com.google.gson.stream.*;
import java.io.IOException;

// Ví dụ: Factory tự động chuyển mọi String thành chữ thường khi đọc vào
public class ChuoiThuongFactory implements TypeAdapterFactory {

    @Override
    public `<T>` TypeAdapter`<T>` create(Gson gson, TypeToken`<T>` type) {
        // Chỉ xử lý kiểu String
        if (type.getRawType() != String.class) {
            return null; // Trả về null để Gson dùng adapter mặc định
        }

        // Lấy adapter mặc định của String
        TypeAdapter`<T>` adapterGoc = gson.getDelegateAdapter(this, type);

        return new TypeAdapter`<T>`() {
            @Override
            public void write(JsonWriter out, T value) throws IOException {
                adapterGoc.write(out, value); // Ghi như bình thường
            }

            @SuppressWarnings("unchecked")
            @Override
            public T read(JsonReader in) throws IOException {
                T value = adapterGoc.read(in);
                if (value instanceof String) {
                    return (T) ((String) value).toLowerCase(); // Chuyển thành chữ thường
                }
                return value;
            }
        };
    }
}

public class VíDuFactory {
    public static void main(String[] args) {
        Gson gson = new GsonBuilder()
                .registerTypeAdapterFactory(new ChuoiThuongFactory())
                .create();

        String json = "{\"id\":1,\"hoTen\":\"NGUYỄN VĂN AN\",\"email\":\"AN@EXAMPLE.COM\"}";
        // Tất cả chuỗi sẽ được đọc về chữ thường
        // (ví dụ minh họa cơ chế, thực tế ít dùng cho tên người)
        System.out.println(gson.fromJson(json, NguoiDung.class));
    }
}
```

---

## 5. So sánh TypeAdapter với JsonSerializer/JsonDeserializer

| Tiêu chí | `TypeAdapter` | `JsonSerializer`/`JsonDeserializer` |
|----------|---------------|--------------------------------------|
| Cơ chế | Streaming (token từng cái) | DOM (tạo cây `JsonElement`) |
| Hiệu năng | Cao hơn (không tạo đối tượng trung gian) | Thấp hơn với dữ liệu lớn |
| Độ phức tạp | Cao hơn | Đơn giản hơn |
| Xử lý null | Phải tự xử lý | Gson tự xử lý |
| Phù hợp | Kiểu dữ liệu dùng nhiều, dữ liệu lớn | Kiểu đơn giản, ít dùng |

---

## 6. Tổng kết

`TypeAdapter` là lựa chọn tối ưu khi:
- Cần hiệu năng cao cho kiểu được serialize/deserialize thường xuyên.
- Kiểu có cấu trúc phức tạp cần kiểm soát từng token.
- Xây dựng thư viện tái sử dụng cần đóng gói logic JSON hoàn chỉnh.

Với các trường hợp đơn giản hơn, dùng `JsonSerializer`/`JsonDeserializer` hoặc `@SerializedName` sẽ tiết kiệm thời gian phát triển hơn.
