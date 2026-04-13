---
sidebar_position: 6
title: "6. Ky tu dac biet trong Java"
---

# Ky tu dac biet trong Java

Trong Java, mot so ky tu khong the go truc tiep vao chuoi (String) hoac ky tu (char) -- vi du nhu dau xuong dong, tab, hoac dau nhay kep. De bieu dien chung, Java su dung **escape sequences** (chuoi thoat) -- bat dau bang dau gach cheo nguoc `\`.

**Vi du don gian:** Hay tuong tuong ban dang viet thu va muon **xuong dong** hoac **tab** -- ban khong the chi "nhan Enter" trong code vi Java se hieu sai. Thay vao do, ban dung **ky hieu dac biet** nhu `\n` (xuong dong) hoac `\t` (tab) de "ra lenh" cho may tinh.

---

## 1. Bang ky tu dac biet (Escape Sequences)

| Ky tu thoat | Ten goi | Mo ta | Ma Unicode |
|-------------|---------|-------|-----------|
| `\n` | Newline | Xuong dong moi | U+000A |
| `\t` | Tab | Chen khoang trang tab (thuong 4-8 ky tu) | U+0009 |
| `\r` | Carriage Return | Dua con tro ve dau dong | U+000D |
| `\\` | Backslash | In dau gach cheo nguoc `\` | U+005C |
| `\"` | Double Quote | In dau nhay kep `"` | U+0022 |
| `\'` | Single Quote | In dau nhay don `'` | U+0027 |
| `\b` | Backspace | Xoa lui mot ky tu | U+0008 |
| `\f` | Form Feed | Day sang trang moi (dung trong in an) | U+000C |
| `\0` | Null Character | Ky tu null | U+0000 |
| `\uXXXX` | Unicode | Ky tu Unicode (XXXX la ma hex 4 chu so) | Tuy theo ma |

---

## 2. Vi du chi tiet tung escape sequence

### 2.1. `\n` -- Xuong dong (Newline)

```java
public class NewlineDemo {
    public static void main(String[] args) {
        // Xuong dong trong chuoi
        System.out.println("Dong thu nhat\nDong thu hai\nDong thu ba");

        // Ket qua:
        // Dong thu nhat
        // Dong thu hai
        // Dong thu ba

        // Tuong duong voi:
        System.out.println("Dong thu nhat");
        System.out.println("Dong thu hai");
        System.out.println("Dong thu ba");
    }
}
```

### 2.2. `\t` -- Tab

```java
public class TabDemo {
    public static void main(String[] args) {
        // Tao bang don gian voi tab
        System.out.println("STT\tTen\tDiem");
        System.out.println("1\tAn\t8.5");
        System.out.println("2\tBinh\t9.0");
        System.out.println("3\tCuong\t7.5");

        // Ket qua:
        // STT    Ten     Diem
        // 1      An      8.5
        // 2      Binh    9.0
        // 3      Cuong   7.5
    }
}
```

### 2.3. `\r` -- Carriage Return

```java
public class CarriageReturnDemo {
    public static void main(String[] args) {
        // \r dua con tro ve dau dong va ghi de
        System.out.println("ABCDEF\rXY");
        // Ket qua: XYCDEF
        // Giai thich: In "ABCDEF", quay ve dau dong, ghi de "XY" len "AB"

        // Thuong gap trong file text cua Windows: \r\n (CRLF)
        String windowsLine = "Dong 1\r\nDong 2";
        System.out.println(windowsLine);
        // Dong 1
        // Dong 2
    }
}
```

### 2.4. `\\` -- Backslash

```java
public class BackslashDemo {
    public static void main(String[] args) {
        // In dau gach cheo nguoc
        System.out.println("Dau gach cheo nguoc: \\");
        // Ket qua: Dau gach cheo nguoc: \

        // Duong dan file tren Windows
        String duongDan = "C:\\Users\\Thuan\\Documents\\file.txt";
        System.out.println("Duong dan: " + duongDan);
        // Ket qua: Duong dan: C:\Users\Thuan\Documents\file.txt

        // Regex pattern (can escape hai lan: Java string + regex)
        String regex = "\\d+"; // Regex: \d+ (match mot hoac nhieu chu so)
        System.out.println("123abc".matches("\\d+"));     // false (ca chuoi khong match)
        System.out.println("123".matches("\\d+"));         // true
    }
}
```

### 2.5. `\"` -- Dau nhay kep

```java
public class DoubleQuoteDemo {
    public static void main(String[] args) {
        // In dau nhay kep ben trong chuoi
        System.out.println("Anh ay noi: \"Xin chao!\"");
        // Ket qua: Anh ay noi: "Xin chao!"

        // JSON string
        String json = "{\"ten\": \"Thuan\", \"tuoi\": 25}";
        System.out.println("JSON: " + json);
        // Ket qua: JSON: {"ten": "Thuan", "tuoi": 25}

        // HTML attribute
        String html = "<a href=\"https://google.com\">Google</a>";
        System.out.println(html);
        // Ket qua: <a href="https://google.com">Google</a>
    }
}
```

### 2.6. `\'` -- Dau nhay don

```java
public class SingleQuoteDemo {
    public static void main(String[] args) {
        // In dau nhay don trong char
        char danhNhayDon = '\'';
        System.out.println("Ky tu: " + danhNhayDon);
        // Ket qua: Ky tu: '

        // Trong String, khong bat buoc phai escape nhay don
        System.out.println("It's a beautiful day");  // OK, khong can \'
        System.out.println("It\'s a beautiful day"); // Cung OK, dung \' van duoc
    }
}
```

### 2.7. `\b` -- Backspace

```java
public class BackspaceDemo {
    public static void main(String[] args) {
        // Xoa lui mot ky tu
        System.out.println("ABC\bD");
        // Ket qua: ABD (xoa C, thay bang D)

        System.out.println("Hello\b\b\b\b\bWorld");
        // Ket qua phu thuoc vao console, thuong la: World
    }
}
```

### 2.8. `\0` -- Null Character

```java
public class NullCharDemo {
    public static void main(String[] args) {
        // Ky tu null (gia tri mac dinh cua char)
        char kyTuNull = '\0';
        System.out.println("Gia tri: [" + kyTuNull + "]");

        // Kiem tra ky tu null
        char c = '\0';
        if (c == '\0') {
            System.out.println("Day la ky tu null");
        }
    }
}
```

---

## 3. Unicode trong Java

Java su dung **Unicode (UTF-16)** lam bo ky tu mac dinh. Moi ky tu `char` co the bieu dien bang ma Unicode `\uXXXX` (XXXX la 4 chu so hex).

```java
public class UnicodeDemo {
    public static void main(String[] args) {
        // Ky tu Latin
        char a = '\u0041'; // A
        char z = '\u005A'; // Z
        System.out.println("A = " + a + ", Z = " + z);

        // Chu so
        char so0 = '\u0030'; // 0
        char so9 = '\u0039'; // 9
        System.out.println("0 = " + so0 + ", 9 = " + so9);

        // Ky tu dac biet
        char copyright = '\u00A9'; // (c)
        char trademark = '\u2122'; // TM
        char heart = '\u2764';     // tim den
        char smile = '\u263A';     // mat cuoi
        System.out.println(copyright + " " + trademark + " " + heart + " " + smile);

        // Tieng Viet (Unicode)
        char kyTuA = '\u00C0'; // A nang
        System.out.println("Ky tu Unicode Viet: " + kyTuA);

        // In bang ma ASCII/Unicode
        System.out.println("\n--- Bang ASCII co ban ---");
        for (int i = 65; i <= 90; i++) {
            System.out.print((char) i + " "); // A B C ... Z
        }
        System.out.println();
        for (int i = 97; i <= 122; i++) {
            System.out.print((char) i + " "); // a b c ... z
        }
        System.out.println();
    }
}
```

**Ket qua:**

```
A = A, Z = Z
0 = 0, 9 = 9
(c) TM tim_den mat_cuoi
Ky tu Unicode Viet: A (co dau)

--- Bang ASCII co ban ---
A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
a b c d e f g h i j k l m n o p q r s t u v w x y z
```

---

## 4. Ung dung thuc te

### 4.1. Format output bang tab va newline

```java
public class FormatOutputDemo {
    public static void main(String[] args) {
        // Tao bao cao don gian
        System.out.println("========================================");
        System.out.println("\tBAO CAO DIEM THI HOC KY 1");
        System.out.println("========================================");
        System.out.println("STT\tHo ten\t\tToan\tLy\tHoa");
        System.out.println("---\t------\t\t----\t--\t---");
        System.out.println("1\tNguyen Van A\t8.5\t7.0\t9.0");
        System.out.println("2\tTran Thi B\t9.0\t8.5\t7.5");
        System.out.println("3\tLe Van C\t7.0\t9.5\t8.0");
        System.out.println("========================================");
    }
}
```

### 4.2. Duong dan file tren Windows

```java
public class FilePathDemo {
    public static void main(String[] args) {
        // Duong dan Windows can escape backslash
        String duongDanWindows = "C:\\Users\\Thuan\\Desktop\\project\\Main.java";
        System.out.println("Windows: " + duongDanWindows);

        // Duong dan macOS/Linux khong can escape
        String duongDanUnix = "/home/thuan/Desktop/project/Main.java";
        System.out.println("Unix: " + duongDanUnix);

        // Dung File.separator de code chay tren moi OS
        String duongDanChuan = "home" + java.io.File.separator + "thuan" + java.io.File.separator + "file.txt";
        System.out.println("Chuan: " + duongDanChuan);
    }
}
```

### 4.3. Tao JSON string

```java
public class JsonStringDemo {
    public static void main(String[] args) {
        // JSON can nhieu dau nhay kep
        String json = "{\n"
                + "\t\"ten\": \"Nguyen Van Thuan\",\n"
                + "\t\"tuoi\": 25,\n"
                + "\t\"diaChi\": \"123 Nguyen Hue, TP.HCM\",\n"
                + "\t\"email\": \"thuan@example.com\"\n"
                + "}";
        System.out.println(json);

        // Ket qua:
        // {
        //     "ten": "Nguyen Van Thuan",
        //     "tuoi": 25,
        //     "diaChi": "123 Nguyen Hue, TP.HCM",
        //     "email": "thuan@example.com"
        // }
    }
}
```

### 4.4. Text Block (Java 13+) -- Giai phap thay the

Tu Java 13, ban co the dung **Text Block** (`"""`) de viet chuoi nhieu dong ma khong can escape:

```java
public class TextBlockDemo {
    public static void main(String[] args) {
        // Truoc Java 13: phai escape nhieu
        String jsonCu = "{\n\t\"ten\": \"Thuan\",\n\t\"tuoi\": 25\n}";

        // Tu Java 13: dung Text Block (don gian hon nhieu)
        String jsonMoi = """
                {
                    "ten": "Thuan",
                    "tuoi": 25
                }
                """;

        System.out.println("Cu:");
        System.out.println(jsonCu);
        System.out.println("\nMoi:");
        System.out.println(jsonMoi);

        // SQL query
        String sql = """
                SELECT u.name, u.email
                FROM users u
                WHERE u.age > 18
                ORDER BY u.name
                """;
        System.out.println("SQL: " + sql);

        // HTML
        String html = """
                <html>
                    <body>
                        <h1>Xin chao</h1>
                        <p>Day la trang web</p>
                    </body>
                </html>
                """;
        System.out.println(html);
    }
}
```

---

## Khi nao dung?

| Escape sequence | Khi nao dung |
|-----------------|-------------|
| `\n` | Format output nhieu dong, ghi file text, log message |
| `\t` | Tao bang, can chinh cot, format output gon gang |
| `\\` | Duong dan file Windows, regex pattern, JSON |
| `\"` | In chuoi chua dau nhay kep, tao JSON/HTML/XML |
| `\'` | Khai bao char la dau nhay don |
| `\r\n` | Xu ly file text tren Windows (CRLF) |
| `\uXXXX` | Ky tu dac biet, bieu tuong, ho tro da ngon ngu |
| Text Block (`"""`) | Chuoi nhieu dong phuc tap (Java 13+): JSON, SQL, HTML |

**Best practice:**
- Uu tien **Text Block** (Java 13+) cho chuoi nhieu dong thay vi noi nhieu `\n`
- Dung `System.lineSeparator()` thay vi `\n` khi can tuong thich da nen tang
- Dung `java.io.File.separator` thay vi `\\` cho duong dan file

---

## Loi thuong gap

### Loi 1: Quen escape backslash trong duong dan Windows

```java
❌ Sai:
String path = "C:\Users\Thuan\file.txt";
// LOI: \U, \T, \f khong phai escape sequence hop le (hoac la \f = form feed)

✅ Dung:
String path = "C:\\Users\\Thuan\\file.txt";
// Hoac dung forward slash (Java chap nhan ca hai):
String path2 = "C:/Users/Thuan/file.txt";
```

### Loi 2: Quen escape dau nhay kep

```java
❌ Sai:
String json = "{"name": "Thuan"}";
// LOI BIEN DICH: chuoi ket thuc tai dau " thu hai

✅ Dung:
String json = "{\"name\": \"Thuan\"}";
// Hoac dung Text Block (Java 13+):
String json2 = """
        {"name": "Thuan"}
        """;
```

### Loi 3: Nham lan \n va \r

```java
❌ Sai: Dung \r de xuong dong tren moi OS
System.out.print("Dong 1\rDong 2"); // \r ghi de dong 1

✅ Dung: Dung \n hoac System.lineSeparator()
System.out.print("Dong 1\nDong 2");
// Hoac:
System.out.print("Dong 1" + System.lineSeparator() + "Dong 2");
```

### Loi 4: Escape sai trong regex

```java
❌ Sai:
boolean match = "123".matches("\d+");
// LOI: \d khong phai escape sequence cua Java

✅ Dung:
boolean match = "123".matches("\\d+");
// Giai thich: \\ trong Java string = \ trong regex
// Nen regex thuc te nhan duoc la: \d+
```

---

## Cau hoi phong van

### Cau 1: Ky tu nao dai dien cho tab trong Java?

**Tra loi:** Ky tu `\t` dai dien cho **tab (horizontal tab)** trong Java. Khi in ra, no tao mot khoang trang (thuong 4-8 ky tu tuy console/editor). Ma Unicode cua no la `U+0009`. Vi du: `System.out.println("A\tB")` se in ra `A` va `B` cach nhau mot tab.

### Cau 2: Lam sao in dau nhay kep ben trong String?

**Tra loi:** Co 3 cach:
1. **Escape bang `\"`:** `System.out.println("Noi \"Xin chao\"");`
2. **Text Block (Java 13+):** Dung `"""` khong can escape dau nhay kep don le
3. **Unicode:** `System.out.println("Noi \u0022Xin chao\u0022");` (it dung vi kho doc)

Cach 1 la pho bien nhat. Cach 2 duoc khuyen nghi khi lam viec voi chuoi nhieu dong.

### Cau 3: Unicode trong Java hoat dong nhu the nao?

**Tra loi:** Java su dung **UTF-16** de bieu dien ky tu. Moi `char` co 16 bit, bieu dien duoc 65,536 ky tu (Basic Multilingual Plane). Ky tu Unicode duoc viet dang `\uXXXX` (4 chu so hex). Voi ky tu ngoai BMP (emoji, han tu co...), Java dung **surrogate pair** -- 2 char de bieu dien 1 ky tu. Dac biet, Java xu ly Unicode escape **tai giai doan bien dich** (truoc khi phan tich cu phap), nen `\u0041` duoc thay the bang `A` truoc khi code chay.

### Cau 4: Su khac biet giua `\n` va `System.lineSeparator()`?

**Tra loi:**
- `\n` luon la ky tu **Line Feed (LF)**, bat ke he dieu hanh
- `System.lineSeparator()` tra ve ky tu xuong dong **dung cua OS hien tai**: `\n` tren Linux/macOS, `\r\n` tren Windows
- Khi ghi file hoac xu ly text can tuong thich da nen tang, nen dung `System.lineSeparator()`. Khi chi in ra console, `\n` la du.

### Cau 5: Text Block trong Java la gi va khi nao nen dung?

**Tra loi:** Text Block (tu Java 13, chinh thuc tu Java 15) la cu phap dung ba dau nhay kep `"""` de viet chuoi nhieu dong. No tu dong xu ly xuong dong va khong can escape dau nhay kep don le. Nen dung khi lam viec voi: JSON, SQL, HTML, XML, hoac bat ky chuoi nhieu dong nao. Text Block giup code **de doc hon** va giam loi escape.

```java
// Thay vi:
String sql = "SELECT *\nFROM users\nWHERE age > 18";
// Dung:
String sql = """
        SELECT *
        FROM users
        WHERE age > 18
        """;
```
