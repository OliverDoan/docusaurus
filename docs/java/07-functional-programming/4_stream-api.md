---
sidebar_position: 4
title: "4. Stream API"
---

# 4. Stream API

Stream API là công cụ xử lý một chuỗi phần tử theo kiểu dây chuyền: lọc, biến đổi, sắp xếp rồi gom kết quả. Đây là vũ khí chủ lực của lập trình hàm trong Java, giúp viết code xử lý dữ liệu ngắn gọn và rõ ràng mà không làm thay đổi dữ liệu gốc. Bài này giới thiệu các thao tác trung gian, thao tác kết thúc và những điểm cần lưu ý khi dùng Stream; chi tiết nằm bên dưới.

---

## Mục lục

- [Stream là gì?](#stream-là-gì)
- [Ví dụ đời thường: dây chuyền xử lý](#ví-dụ-đời-thường-dây-chuyền-xử-lý)
- [Ba phần của một pipeline Stream](#ba-phần-của-một-pipeline-stream)
- [Cách tạo Stream](#cách-tạo-stream)
- [Thao tác trung gian (Intermediate Operations)](#thao-tác-trung-gian-intermediate-operations)
  - [filter — lọc phần tử](#filter--lọc-phần-tử)
  - [map — biến đổi phần tử](#map--biến-đổi-phần-tử)
  - [sorted — sắp xếp](#sorted--sắp-xếp)
  - [distinct — loại bỏ trùng lặp](#distinct--loại-bỏ-trùng-lặp)
  - [limit và skip](#limit-và-skip)
- [Thao tác kết thúc (Terminal Operations)](#thao-tác-kết-thúc-terminal-operations)
  - [forEach — duyệt từng phần tử](#foreach--duyệt-từng-phần-tử)
  - [collect — gom thành danh sách](#collect--gom-thành-danh-sách)
  - [reduce — gộp về một giá trị](#reduce--gộp-về-một-giá-trị)
  - [count, anyMatch, findFirst](#count-anymatch-findfirst)
- [Collectors — công cụ gom kết quả mạnh mẽ](#collectors--công-cụ-gom-kết-quả-mạnh-mẽ)
- [Lazy Evaluation — chạy lười](#lazy-evaluation--chạy-lười)
- [Parallel Stream — xử lý song song](#parallel-stream--xử-lý-song-song)
- [Ví dụ tổng hợp thực tế](#ví-dụ-tổng-hợp-thực-tế)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Stream là gì?

**Stream (luồng dữ liệu)** là một **chuỗi các phần tử** mà ta có thể xử lý theo kiểu **dây chuyền**: lọc, biến đổi, sắp xếp, gom kết quả... Stream được giới thiệu từ Java 8 và là công cụ chủ lực của lập trình hàm trong Java.

Điểm quan trọng cần hiểu ngay:

- Stream **không phải là cấu trúc lưu trữ** dữ liệu. Nó không "chứa" phần tử như `List`, mà chỉ **chảy qua** dữ liệu để xử lý.
- Stream **không làm thay đổi dữ liệu gốc**. Nó tạo ra kết quả mới (phù hợp với tư duy immutability - bất biến).
- Một stream **chỉ dùng được một lần**. Sau khi chạy xong thao tác kết thúc, không dùng lại được.

---

## Ví dụ đời thường: dây chuyền xử lý

Hãy hình dung một **dây chuyền lọc và đóng gói trái cây**:

1. Đổ cả rổ táo lên băng chuyền (nguồn dữ liệu).
2. Loại bỏ quả hỏng (lọc - `filter`).
3. Dán nhãn cho từng quả (biến đổi - `map`).
4. Xếp vào hộp (gom kết quả - `collect`).

Mỗi quả táo đi qua từng trạm, và cuối cùng ta có một hộp táo đã xử lý. Stream API hoạt động đúng như vậy.

---

## Ba phần của một pipeline Stream

Một **pipeline (chuỗi xử lý) Stream** luôn gồm ba phần:

```java
import java.util.List;
import java.util.stream.Collectors;

public class PipelineStructure {
    public static void main(String[] args) {
        List<String> names = List.of("An", "Bình", "Cường", "An");

        List<String> result = names.stream()        // 1. NGUỒN: tạo stream
            .filter(n -> n.length() > 2)             // 2. TRUNG GIAN: lọc
            .distinct()                              // 2. TRUNG GIAN: bỏ trùng
            .collect(Collectors.toList());           // 3. KẾT THÚC: gom kết quả

        System.out.println(result); // In ra: [Bình, Cường]
    }
}
```

1. **Nguồn (Source)**: nơi tạo ra stream (từ list, mảng, số...).
2. **Thao tác trung gian (Intermediate)**: biến đổi stream, trả về stream khác → có thể nối nhiều cái.
3. **Thao tác kết thúc (Terminal)**: tạo ra kết quả cuối (list, số, in ra...) → kết thúc pipeline.

---

## Cách tạo Stream

```java
import java.util.Arrays;
import java.util.List;
import java.util.stream.IntStream;
import java.util.stream.Stream;

public class CreateStreamDemo {
    public static void main(String[] args) {
        // 1. Từ một Collection (List, Set...)
        List<String> list = List.of("a", "b", "c");
        Stream<String> s1 = list.stream();

        // 2. Từ các giá trị rời rạc
        Stream<Integer> s2 = Stream.of(1, 2, 3, 4);

        // 3. Từ một mảng
        int[] numbers = {10, 20, 30};
        IntStream s3 = Arrays.stream(numbers);

        // 4. Stream số nguyên trong khoảng (rất hay dùng để lặp)
        // range: từ 1 đến 5 (KHÔNG bao gồm 6)
        IntStream s4 = IntStream.range(1, 6);
        s4.forEach(System.out::println); // In 1 2 3 4 5

        // rangeClosed: từ 1 đến 5 (BAO GỒM 5)
        IntStream.rangeClosed(1, 5).forEach(System.out::print); // In 12345
    }
}
```

---

## Thao tác trung gian (Intermediate Operations)

Thao tác trung gian **trả về một stream mới**, nên ta nối tiếp được nhiều thao tác. Chúng **chưa thực sự chạy** cho tới khi gặp thao tác kết thúc (xem mục Lazy Evaluation).

### filter — lọc phần tử

`filter` nhận một **`Predicate`** (điều kiện true/false), **giữ lại** những phần tử thỏa điều kiện.

```java
import java.util.List;
import java.util.stream.Collectors;

public class FilterDemo {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6);

        // Giữ lại số chẵn
        List<Integer> evens = numbers.stream()
            .filter(n -> n % 2 == 0) // điều kiện: chia hết cho 2
            .collect(Collectors.toList());

        System.out.println(evens); // In ra: [2, 4, 6]
    }
}
```

### map — biến đổi phần tử

`map` nhận một **`Function`**, biến đổi **mỗi phần tử** thành một giá trị mới (có thể khác kiểu).

```java
import java.util.List;
import java.util.stream.Collectors;

public class MapDemo {
    public static void main(String[] args) {
        List<String> names = List.of("an", "bình", "cường");

        // Biến đổi mỗi tên thành chữ hoa
        List<String> upper = names.stream()
            .map(String::toUpperCase)
            .collect(Collectors.toList());
        System.out.println(upper); // In ra: [AN, BÌNH, CƯỜNG]

        // Biến đổi mỗi tên thành độ dài của nó (đổi kiểu String -> Integer)
        List<Integer> lengths = names.stream()
            .map(String::length)
            .collect(Collectors.toList());
        System.out.println(lengths); // In ra: [2, 4, 5]
    }
}
```

Phân biệt nhanh: **`filter`** quyết định "giữ hay bỏ", **`map`** quyết định "biến nó thành gì".

### sorted — sắp xếp

`sorted` sắp xếp các phần tử. Không tham số thì sắp theo thứ tự tự nhiên; có `Comparator` thì sắp theo quy tắc tùy ý.

```java
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class SortedDemo {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(5, 2, 8, 1, 9);

        // Sắp tăng dần (thứ tự tự nhiên)
        System.out.println(numbers.stream().sorted().collect(Collectors.toList())); // [1, 2, 5, 8, 9]

        // Sắp giảm dần
        List<Integer> desc = numbers.stream()
            .sorted(Comparator.reverseOrder())
            .collect(Collectors.toList());
        System.out.println(desc); // [9, 8, 5, 2, 1]

        // Sắp chuỗi theo độ dài
        List<String> words = List.of("banana", "kiwi", "apple");
        List<String> byLength = words.stream()
            .sorted(Comparator.comparingInt(String::length))
            .collect(Collectors.toList());
        System.out.println(byLength); // [kiwi, apple, banana]
    }
}
```

### distinct — loại bỏ trùng lặp

`distinct` giữ lại mỗi phần tử **chỉ một lần** (dựa trên `equals`).

```java
import java.util.List;
import java.util.stream.Collectors;

public class DistinctDemo {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(1, 2, 2, 3, 3, 3, 4);
        List<Integer> unique = numbers.stream()
            .distinct()
            .collect(Collectors.toList());
        System.out.println(unique); // In ra: [1, 2, 3, 4]
    }
}
```

### limit và skip

`limit(n)` lấy **n phần tử đầu**, `skip(n)` **bỏ qua n phần tử đầu**.

```java
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class LimitSkipDemo {
    public static void main(String[] args) {
        // Lấy 3 số đầu từ 1..10
        System.out.println(
            IntStream.rangeClosed(1, 10).limit(3).boxed().collect(Collectors.toList())
        ); // [1, 2, 3]

        // Bỏ 7 số đầu, lấy phần còn lại
        System.out.println(
            IntStream.rangeClosed(1, 10).skip(7).boxed().collect(Collectors.toList())
        ); // [8, 9, 10]
    }
}
```

---

## Thao tác kết thúc (Terminal Operations)

Thao tác kết thúc **tạo ra kết quả cuối cùng** và **đóng** stream. Sau bước này stream không dùng lại được.

### forEach — duyệt từng phần tử

Dùng để **làm việc gì đó** với từng phần tử (thường là in ra). Không trả về giá trị.

```java
import java.util.List;

public class ForEachDemo {
    public static void main(String[] args) {
        List.of("A", "B", "C").stream()
            .forEach(item -> System.out.println("Phần tử: " + item));
        // In ra: Phần tử: A / Phần tử: B / Phần tử: C
    }
}
```

### collect — gom thành danh sách

`collect` là thao tác kết thúc hay dùng nhất, dùng kèm `Collectors` để gom kết quả thành `List`, `Set`, `Map`...

```java
import java.util.List;
import java.util.stream.Collectors;

public class CollectDemo {
    public static void main(String[] args) {
        List<Integer> result = List.of(1, 2, 3, 4).stream()
            .map(n -> n * 10)
            .collect(Collectors.toList()); // gom thành List
        System.out.println(result); // [10, 20, 30, 40]
    }
}
```

### reduce — gộp về một giá trị

`reduce` **gộp toàn bộ stream về một giá trị duy nhất** (tính tổng, tích, nối chuỗi...).

```java
import java.util.List;

public class ReduceDemo {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(1, 2, 3, 4, 5);

        // Tính tổng: bắt đầu từ 0, lần lượt cộng từng phần tử
        // (tổng tạm, phần tử kế tiếp) -> tổng tạm + phần tử
        int sum = numbers.stream().reduce(0, (acc, n) -> acc + n);
        System.out.println("Tổng = " + sum); // Tổng = 15

        // Tìm số lớn nhất (không có giá trị khởi đầu nên trả về Optional)
        numbers.stream()
            .reduce((a, b) -> a > b ? a : b)
            .ifPresent(max -> System.out.println("Lớn nhất = " + max)); // Lớn nhất = 5
    }
}
```

Hình dung `reduce` như cầm từng đồng tiền cho vào heo đất: `acc` là số tiền đang có trong heo, mỗi phần tử là một đồng mới bỏ vào.

### count, anyMatch, findFirst

```java
import java.util.List;

public class OtherTerminalDemo {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6);

        // count: đếm số phần tử (sau khi lọc)
        long countEven = numbers.stream().filter(n -> n % 2 == 0).count();
        System.out.println("Số phần tử chẵn: " + countEven); // 3

        // anyMatch: có phần tử nào thỏa điều kiện không? trả về boolean
        boolean hasBig = numbers.stream().anyMatch(n -> n > 5);
        System.out.println("Có số > 5? " + hasBig); // true

        // allMatch: TẤT CẢ có thỏa không?
        boolean allPositive = numbers.stream().allMatch(n -> n > 0);
        System.out.println("Tất cả dương? " + allPositive); // true

        // findFirst: lấy phần tử đầu tiên (trả về Optional vì có thể rỗng)
        numbers.stream()
            .filter(n -> n > 3)
            .findFirst()
            .ifPresent(first -> System.out.println("Số đầu tiên > 3: " + first)); // 4
    }
}
```

---

## Collectors — công cụ gom kết quả mạnh mẽ

**`Collectors`** là lớp tiện ích cung cấp nhiều cách gom kết quả linh hoạt.

```java
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class CollectorsDemo {
    public static void main(String[] args) {
        List<String> names = List.of("An", "Bình", "Cường", "Dũng");

        // 1. Gom thành Set (loại trùng tự động)
        var nameSet = names.stream().collect(Collectors.toSet());
        System.out.println(nameSet);

        // 2. Nối các chuỗi lại, ngăn cách bằng dấu phẩy
        String joined = names.stream().collect(Collectors.joining(", "));
        System.out.println(joined); // An, Bình, Cường, Dũng

        // 3. Nhóm theo độ dài tên (groupingBy)
        Map<Integer, List<String>> byLength = names.stream()
            .collect(Collectors.groupingBy(String::length));
        System.out.println(byLength); // {2=[An], 4=[Bình, Dũng], 5=[Cường]}

        // 4. Đếm số phần tử trong mỗi nhóm
        Map<Integer, Long> countByLength = names.stream()
            .collect(Collectors.groupingBy(String::length, Collectors.counting()));
        System.out.println(countByLength); // {2=1, 4=2, 5=1}

        // 5. Tính tổng độ dài tất cả tên
        int total = names.stream().collect(Collectors.summingInt(String::length));
        System.out.println("Tổng độ dài: " + total); // 15
    }
}
```

---

## Lazy Evaluation — chạy lười

**Lazy Evaluation (đánh giá lười)** nghĩa là các thao tác trung gian **chưa chạy ngay**. Chúng chỉ là "kế hoạch". Toàn bộ pipeline **chỉ thực sự chạy khi gặp thao tác kết thúc**.

```java
import java.util.List;
import java.util.stream.Collectors;

public class LazyDemo {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(1, 2, 3, 4, 5);

        // Đoạn này KHÔNG in gì, vì chưa có thao tác kết thúc
        var planned = numbers.stream()
            .filter(n -> {
                System.out.println("Đang lọc: " + n); // sẽ KHÔNG chạy ở đây
                return n % 2 == 0;
            });
        System.out.println("Đã định nghĩa pipeline nhưng chưa chạy...");

        // Chỉ khi gọi collect (thao tác kết thúc) thì filter mới thật sự chạy
        var result = planned.collect(Collectors.toList());
        System.out.println("Kết quả: " + result);
    }
}
```

Lợi ích của lazy: Java có thể **tối ưu**. Ví dụ với `findFirst`, stream dừng ngay khi tìm thấy phần tử đầu tiên thỏa điều kiện, không cần duyệt hết.

```java
import java.util.stream.IntStream;

public class ShortCircuitDemo {
    public static void main(String[] args) {
        // Dù khoảng rất lớn, stream dừng ngay khi tìm thấy số đầu tiên > 100
        IntStream.rangeClosed(1, 1_000_000)
            .filter(n -> n > 100)
            .findFirst()
            .ifPresent(System.out::println); // In ra 101, không duyệt tới 1 triệu
    }
}
```

---

## Parallel Stream — xử lý song song

**Parallel Stream (luồng song song)** chia dữ liệu ra nhiều phần và xử lý **đồng thời trên nhiều nhân CPU**, có thể nhanh hơn với dữ liệu lớn.

```java
import java.util.stream.IntStream;

public class ParallelDemo {
    public static void main(String[] args) {
        // Tính tổng từ 1 đến 1 triệu, xử lý song song
        long sum = IntStream.rangeClosed(1, 1_000_000)
            .parallel() // bật chế độ song song
            .sum();
        System.out.println("Tổng = " + sum);
    }
}
```

Lưu ý quan trọng dành cho người mới:

- Chỉ nên dùng parallel khi **dữ liệu thật sự lớn** và phép tính độc lập. Với dữ liệu nhỏ, song song có thể **chậm hơn** vì chi phí chia/gộp.
- Tuyệt đối **không thay đổi biến dùng chung** trong parallel stream (gây lỗi khó lường do nhiều luồng cùng ghi). Hãy giữ tư duy bất biến.
- Thứ tự xử lý không còn đảm bảo như stream thường (trừ khi dùng các thao tác giữ thứ tự).

---

## Ví dụ tổng hợp thực tế

Cho danh sách sản phẩm, lọc sản phẩm còn hàng, lấy tên viết hoa, sắp xếp và gom lại:

```java
import java.util.List;
import java.util.stream.Collectors;

record Product(String name, double price, boolean inStock) {}

public class RealWorldDemo {
    public static void main(String[] args) {
        List<Product> products = List.of(
            new Product("Bàn phím", 350_000, true),
            new Product("Chuột", 150_000, false),
            new Product("Màn hình", 2_500_000, true),
            new Product("Tai nghe", 500_000, true)
        );

        // Lấy tên các sản phẩm còn hàng, giá < 1 triệu, viết hoa, sắp xếp A-Z
        List<String> result = products.stream()
            .filter(Product::inStock)              // chỉ lấy còn hàng
            .filter(p -> p.price() < 1_000_000)    // giá dưới 1 triệu
            .map(p -> p.name().toUpperCase())      // tên viết hoa
            .sorted()                              // sắp xếp
            .collect(Collectors.toList());         // gom thành list

        System.out.println(result); // [BÀN PHÍM, TAI NGHE]

        // Tính tổng giá trị các sản phẩm còn hàng
        double totalInStock = products.stream()
            .filter(Product::inStock)
            .mapToDouble(Product::price)
            .sum();
        System.out.println("Tổng giá còn hàng: " + totalInStock); // 3350000.0
    }
}
```

---

## Lỗi thường gặp

1. **Dùng lại stream sau khi đã kết thúc.** Một stream chỉ chạy được một lần. Gọi thao tác lần hai sẽ ném `IllegalStateException`. Hãy tạo stream mới từ nguồn nếu cần dùng lại.

```java
// SAI:
// var s = list.stream();
// s.forEach(System.out::println);
// long c = s.count(); // LỖI: stream đã đóng
```

2. **Quên thao tác kết thúc.** Nếu chỉ có thao tác trung gian (filter, map...) mà không có thao tác kết thúc, **không có gì chạy cả** (do lazy evaluation).

3. **Nhầm `map` với `forEach`.** `map` biến đổi và trả về stream mới (trung gian); `forEach` chỉ làm việc với từng phần tử và kết thúc stream. Đừng dùng `forEach` để "biến đổi rồi gom" — hãy dùng `map` + `collect`.

4. **Thay đổi dữ liệu gốc bên trong stream.** Stream nên xử lý theo kiểu bất biến. Việc thêm/xóa phần tử trên collection nguồn khi stream đang chạy gây `ConcurrentModificationException`.

5. **Lạm dụng `parallel()`.** Với dữ liệu nhỏ hoặc thao tác có trạng thái dùng chung, parallel thường gây chậm hoặc sai. Mặc định hãy dùng stream thường.

---

## Tóm tắt

- **Stream** là chuỗi phần tử xử lý theo dây chuyền; **không lưu trữ dữ liệu**, **không đổi dữ liệu gốc**, **chỉ dùng một lần**.
- Một pipeline gồm 3 phần: **nguồn** → **thao tác trung gian** → **thao tác kết thúc**.
- Thao tác trung gian (trả về stream): **`filter`** (lọc), **`map`** (biến đổi), **`sorted`** (sắp xếp), **`distinct`** (bỏ trùng), **`limit`/`skip`**.
- Thao tác kết thúc (tạo kết quả): **`forEach`**, **`collect`**, **`reduce`** (gộp về 1 giá trị), **`count`**, **`anyMatch`/`allMatch`**, **`findFirst`**.
- **`Collectors`** cung cấp công cụ gom mạnh mẽ: `toList`, `toSet`, `joining`, `groupingBy`, `counting`, `summingInt`...
- **Lazy evaluation**: thao tác trung gian chỉ chạy khi có thao tác kết thúc, cho phép tối ưu (dừng sớm).
- **Parallel stream** xử lý song song nhiều nhân CPU — chỉ dùng cho dữ liệu lớn, thao tác độc lập và bất biến.
