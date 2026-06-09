---
sidebar_position: 6
title: "Flyweight Pattern"
---

# Java Design Pattern - Flyweight

Flyweight là mẫu thiết kế cấu trúc giúp tiết kiệm bộ nhớ khi chương trình cần tạo rất nhiều đối tượng giống nhau. Ý tưởng là tách phần dữ liệu chung (dùng đi dùng lại) ra để chia sẻ, còn phần dữ liệu riêng thì truyền vào từ bên ngoài. Cách này rất hữu ích trong game, bản đồ, hay xử lý font chữ. Bài này giới thiệu tổng quan; phần chi tiết và ví dụ Java nằm bên dưới.

## Mục đích

Flyweight (trọng lượng nhẹ) là một **Structural Design Pattern** giúp tiết kiệm bộ nhớ bằng cách chia sẻ các phần trạng thái chung giữa nhiều đối tượng thay vì lưu trữ tất cả dữ liệu trong từng đối tượng riêng lẻ. Pattern này đặc biệt hữu ích khi cần tạo số lượng lớn đối tượng tương tự nhau.

## Vấn đề giải quyết

Trong game bắn súng, bạn cần render (vẽ) hàng nghìn viên đạn trên màn hình cùng lúc. Mỗi viên đạn có màu sắc, hình dạng, sprite (ảnh) giống nhau, chỉ khác nhau vị trí và hướng bay. Nếu lưu toàn bộ dữ liệu trong mỗi đối tượng, bộ nhớ sẽ bị cạn kiệt nhanh chóng.

Flyweight tách trạng thái thành:
- **Intrinsic state** (trạng thái nội tại): dữ liệu bất biến, được chia sẻ giữa nhiều đối tượng.
- **Extrinsic state** (trạng thái ngoại vi): dữ liệu thay đổi theo từng ngữ cảnh, truyền vào từ bên ngoài.

## Cấu trúc

- **Flyweight**: Interface hoặc abstract class định nghĩa phương thức nhận extrinsic state.
- **ConcreteFlyweight**: Lưu trữ intrinsic state, được chia sẻ và tái sử dụng.
- **FlyweightFactory**: Quản lý pool (kho) các flyweight, trả về đối tượng đã có hoặc tạo mới nếu chưa tồn tại.
- **Client**: Tính toán và lưu extrinsic state, gọi flyweight với context cụ thể.

## Ví dụ Java

Hệ thống hiển thị cây trong game/ứng dụng bản đồ:

```java
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;

// Flyweight - chứa intrinsic state (chia sẻ được)
class TreeType {
    private String name;      // loại cây: Oak, Pine, Birch...
    private String color;     // màu sắc
    private String texture;   // texture (ảnh kết cấu) - dữ liệu lớn nhất

    public TreeType(String name, String color, String texture) {
        this.name = name;
        this.color = color;
        this.texture = texture;
        System.out.println("Tạo mới TreeType: " + name);
    }

    // Nhận extrinsic state (x, y) từ bên ngoài khi vẽ
    public void draw(int x, int y) {
        System.out.printf("Vẽ cây [%s|%s] tại (%d, %d)%n", name, color, x, y);
    }

    public String getName() { return name; }
}

// FlyweightFactory - quản lý pool các TreeType
class TreeFactory {
    private static Map<String, TreeType> treeTypes = new HashMap<>();

    public static TreeType getTreeType(String name, String color, String texture) {
        // Key là tổ hợp các thuộc tính intrinsic
        String key = name + "_" + color;
        if (!treeTypes.containsKey(key)) {
            treeTypes.put(key, new TreeType(name, color, texture));
        } else {
            System.out.println("Tái sử dụng TreeType: " + name);
        }
        return treeTypes.get(key);
    }

    public static int getCount() { return treeTypes.size(); }
}

// Context - lưu extrinsic state (x, y) và tham chiếu đến flyweight
class Tree {
    private int x;         // extrinsic: vị trí thay đổi theo từng cây
    private int y;         // extrinsic
    private TreeType type; // intrinsic: chia sẻ nhiều cây cùng loại

    public Tree(int x, int y, TreeType type) {
        this.x = x;
        this.y = y;
        this.type = type;
    }

    public void draw() {
        type.draw(x, y);
    }
}

// Client - tạo rừng với hàng nghìn cây
class Forest {
    private List<Tree> trees = new ArrayList<>();

    public void plantTree(int x, int y, String name, String color, String texture) {
        TreeType type = TreeFactory.getTreeType(name, color, texture);
        Tree tree = new Tree(x, y, type);
        trees.add(tree);
    }

    public void draw() {
        for (Tree tree : trees) {
            tree.draw();
        }
    }

    public int getTreeCount() { return trees.size(); }
}

// Demo
public class FlyweightDemo {
    public static void main(String[] args) {
        Forest forest = new Forest();

        // Trồng 6 cây thuộc 3 loại - chỉ tạo 3 TreeType object thay vì 6
        forest.plantTree(10, 20, "Oak", "green", "oak_texture.png");
        forest.plantTree(30, 40, "Pine", "dark-green", "pine_texture.png");
        forest.plantTree(50, 10, "Oak", "green", "oak_texture.png");   // tái dùng Oak
        forest.plantTree(70, 60, "Birch", "white", "birch_texture.png");
        forest.plantTree(90, 30, "Pine", "dark-green", "pine_texture.png"); // tái dùng Pine
        forest.plantTree(15, 80, "Oak", "green", "oak_texture.png");   // tái dùng Oak

        System.out.println("\n=== Vẽ rừng ===");
        forest.draw();

        System.out.println("\nTổng số cây: " + forest.getTreeCount());
        System.out.println("TreeType object thực sự tạo ra: " + TreeFactory.getCount());
        System.out.println("=> Tiết kiệm " + (forest.getTreeCount() - TreeFactory.getCount()) + " object lớn!");
    }
}
```

## Ưu điểm

- Tiết kiệm đáng kể bộ nhớ khi có số lượng lớn đối tượng tương tự.
- Tăng hiệu suất bằng cách giảm overhead của garbage collector.
- Nếu extrinsic state có thể tính toán lại, có thể tiết kiệm thêm CPU.

## Nhược điểm

- Code phức tạp hơn nhiều: phải tách biệt rõ intrinsic và extrinsic state.
- Có thể làm tăng chi phí CPU nếu extrinsic state phải tính toán liên tục.
- Flyweight object phải là immutable (bất biến) — điều này đôi khi khó đảm bảo.

## Khi nào nên dùng

- Khi ứng dụng cần tạo số lượng rất lớn đối tượng (hàng nghìn đến hàng triệu).
- Khi phần lớn trạng thái của đối tượng có thể trở thành extrinsic (truyền vào từ ngoài).
- Khi việc tiết kiệm bộ nhớ là ưu tiên hơn tốc độ thực thi.
- Ví dụ trong Java: `Integer.valueOf()` cache số từ -128 đến 127, `String.intern()`, các ký tự trong font chữ.
