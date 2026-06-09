---
sidebar_position: 7
title: "Observer Pattern"
---

# Java Design Pattern - Observer

Observer là một mẫu thiết kế hành vi theo cơ chế đăng ký - thông báo: khi một đối tượng thay đổi trạng thái thì tất cả các đối tượng đang theo dõi nó sẽ được báo và tự cập nhật. Mẫu này rất hay gặp trong xử lý sự kiện, hệ thống thông báo hay mô hình MVC. Bài này giới thiệu ý tưởng và ví dụ Java cụ thể; phần chi tiết nằm bên dưới.

## Mục đích

**Observer** (Quan sát viên) là một mẫu thiết kế hành vi định nghĩa cơ chế đăng ký/thông báo (subscribe/notify): khi một đối tượng (Subject) thay đổi trạng thái, tất cả các đối tượng phụ thuộc (Observer) sẽ được thông báo và cập nhật tự động. Còn gọi là **Publish-Subscribe Pattern**.

## Vấn đề giải quyết

Khi một sự kiện hoặc thay đổi trạng thái cần được phản ánh ở nhiều nơi khác nhau mà không tạo sự phụ thuộc chặt chẽ. Ví dụ: khi giá cổ phiếu thay đổi, nhiều màn hình hiển thị, ứng dụng mobile và email alert cần cập nhật đồng thời.

## Cấu trúc

- **Subject** (Publisher): lưu danh sách Observer, cung cấp `subscribe()`, `unsubscribe()`, `notifyObservers()`.
- **Observer** (Subscriber): khai báo phương thức `update()` để nhận thông báo.
- **ConcreteSubject**: trạng thái cần theo dõi, gọi `notifyObservers()` khi thay đổi.
- **ConcreteObserver**: phản ứng với sự thay đổi theo cách riêng.

## Ví dụ Java: Hệ thống theo dõi giá cổ phiếu

```java
import java.util.ArrayList;
import java.util.List;

// Observer interface
interface StockObserver {
    void update(String stockName, double price);
}

// Subject interface
interface StockSubject {
    void subscribe(StockObserver observer);
    void unsubscribe(StockObserver observer);
    void notifyObservers();
}

// ConcreteSubject: Cổ phiếu
class Stock implements StockSubject {
    private String name;
    private double price;
    private List<StockObserver> observers = new ArrayList<>();

    public Stock(String name, double price) {
        this.name = name;
        this.price = price;
    }

    public void setPrice(double price) {
        System.out.println("\nGiá " + name + " thay đổi: " + this.price + " -> " + price);
        this.price = price;
        notifyObservers();
    }

    @Override
    public void subscribe(StockObserver observer) {
        observers.add(observer);
    }

    @Override
    public void unsubscribe(StockObserver observer) {
        observers.remove(observer);
    }

    @Override
    public void notifyObservers() {
        for (StockObserver observer : observers) {
            observer.update(name, price);
        }
    }
}

// ConcreteObserver: Màn hình hiển thị
class Dashboard implements StockObserver {
    private String displayName;

    public Dashboard(String displayName) {
        this.displayName = displayName;
    }

    @Override
    public void update(String stockName, double price) {
        System.out.println("  [" + displayName + "] Cập nhật: " + stockName + " = " + price);
    }
}

// ConcreteObserver: Cảnh báo ngưỡng giá
class PriceAlert implements StockObserver {
    private double threshold;

    public PriceAlert(double threshold) {
        this.threshold = threshold;
    }

    @Override
    public void update(String stockName, double price) {
        if (price > threshold) {
            System.out.println("  [CẢNH BÁO] " + stockName + " vượt ngưỡng " + threshold + "!");
        }
    }
}

// Client
public class ObserverDemo {
    public static void main(String[] args) {
        Stock vic = new Stock("VIC", 85.5);

        Dashboard screen1    = new Dashboard("Màn hình chính");
        Dashboard mobileApp  = new Dashboard("Ứng dụng mobile");
        PriceAlert alert     = new PriceAlert(90.0);

        vic.subscribe(screen1);
        vic.subscribe(mobileApp);
        vic.subscribe(alert);

        vic.setPrice(88.0);
        vic.setPrice(92.5);

        System.out.println("\n(Hủy đăng ký mobile app)");
        vic.unsubscribe(mobileApp);
        vic.setPrice(95.0);
    }
}
```

**Kết quả:**
```
Giá VIC thay đổi: 85.5 -> 88.0
  [Màn hình chính] Cập nhật: VIC = 88.0
  [Ứng dụng mobile] Cập nhật: VIC = 88.0

Giá VIC thay đổi: 88.0 -> 92.5
  [Màn hình chính] Cập nhật: VIC = 92.5
  [Ứng dụng mobile] Cập nhật: VIC = 92.5
  [CẢNH BÁO] VIC vượt ngưỡng 90.0!

(Hủy đăng ký mobile app)
Giá VIC thay đổi: 92.5 -> 95.0
  [Màn hình chính] Cập nhật: VIC = 95.0
  [CẢNH BÁO] VIC vượt ngưỡng 90.0!
```

:::tip Trong Java thực tế
Java cung cấp sẵn `java.util.Observable` (deprecated từ Java 9) và `java.util.Observer`. Hiện nay nên dùng `java.beans.PropertyChangeListener` hoặc tự triển khai như ví dụ trên. Trong Spring Framework, đây chính là cơ chế của `ApplicationEvent` và `@EventListener`.
:::

## Ưu điểm

- Tuân thủ Open/Closed Principle — thêm Observer mới không cần sửa Subject.
- Tạo quan hệ một-nhiều (one-to-many) linh hoạt giữa các đối tượng.
- Subject và Observer độc lập nhau, dễ tái sử dụng.

## Nhược điểm

- Thứ tự thông báo đến các Observer không được đảm bảo.
- Nếu không quản lý tốt, Observer không được hủy đăng ký có thể gây rò rỉ bộ nhớ.
- Có thể tạo phản ứng dây chuyền bất ngờ khi Observer lại thay đổi Subject.

## Khi nào dùng

- Khi thay đổi ở một đối tượng cần phản ánh ở nhiều đối tượng khác.
- Khi không biết trước số lượng và loại đối tượng cần được thông báo.
- Ví dụ thực tế: event listener trong GUI, hệ thống thông báo, MVC (Model thông báo View), reactive streams.
