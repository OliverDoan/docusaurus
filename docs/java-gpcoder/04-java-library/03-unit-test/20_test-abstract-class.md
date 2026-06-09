---
sidebar_position: 20
title: "Test một Abstract Class trong Java"
---

# Test một Abstract Class trong Java

Abstract class không thể khởi tạo trực tiếp bằng `new`, nên việc kiểm thử các phương thức cụ thể bên trong nó đòi hỏi vài kỹ thuật riêng. Bài này trình bày 4 cách phổ biến để test abstract class: tạo subclass ẩn danh, tạo lớp con test riêng, dùng Mockito và dùng PowerMock. Hiểu các cách này giúp bạn viết test cho cả những lớp cha trừu tượng một cách gọn gàng.

## Vấn đề khi test Abstract Class

**Abstract class** (lớp trừu tượng) là lớp không thể khởi tạo trực tiếp bằng `new`. Điều này đặt ra câu hỏi: làm thế nào để kiểm thử các phương thức cụ thể (concrete method) trong abstract class mà không cần tạo subclass thật?

Có **4 cách** phổ biến để giải quyết vấn đề này.

## Cách 1: Tạo subclass ẩn danh trong test

Tạo **anonymous subclass** (lớp con ẩn danh) ngay trong phương thức test, cung cấp implementation tối thiểu cho các abstract method:

```java
// Lớp abstract cần test
public abstract class Shape {
    private String color;

    public Shape(String color) {
        this.color = color;
    }

    // Phương thức concrete — cần test
    public String getColor() {
        return color;
    }

    public String describe() {
        return "Hình " + getShapeName() + " màu " + color + ", diện tích: " + calculateArea();
    }

    // Abstract method — subclass phải implement
    public abstract double calculateArea();
    public abstract String getShapeName();
}
```

```java
public class ShapeTest {

    @Test
    public void testGetColor_mauHopLe_traVeMau() {
        // Tạo anonymous subclass ngay trong test
        Shape shape = new Shape("đỏ") {
            @Override
            public double calculateArea() {
                return 0; // Không quan trọng với test này
            }

            @Override
            public String getShapeName() {
                return "test";
            }
        };

        assertEquals("đỏ", shape.getColor());
    }

    @Test
    public void testDescribe_thongTinDayDu_chuoiDung() {
        Shape shape = new Shape("xanh") {
            @Override
            public double calculateArea() {
                return 25.0;
            }

            @Override
            public String getShapeName() {
                return "vuông";
            }
        };

        String description = shape.describe();
        assertTrue(description.contains("vuông"));
        assertTrue(description.contains("xanh"));
        assertTrue(description.contains("25.0"));
    }
}
```

## Cách 2: Tạo lớp con test riêng

Tạo một **concrete subclass** (lớp con cụ thể) chỉ dùng trong test:

```java
// Trong file test hoặc package test
class TestableShape extends Shape {

    public TestableShape(String color) {
        super(color);
    }

    @Override
    public double calculateArea() {
        return 100.0; // Giá trị cố định cho test
    }

    @Override
    public String getShapeName() {
        return "HinhTest";
    }
}

// Test dùng TestableShape
public class ShapeConcreteTest {

    private Shape shape;

    @Before
    public void setUp() {
        shape = new TestableShape("vàng");
    }

    @Test
    public void testGetColor() {
        assertEquals("vàng", shape.getColor());
    }

    @Test
    public void testDescribe_chuaTenHinhVaMau() {
        String desc = shape.describe();
        assertThat(desc, containsString("HinhTest"));
        assertThat(desc, containsString("vàng"));
    }
}
```

## Cách 3: Dùng Mockito để mock Abstract Class

Mockito 2+ hỗ trợ mock abstract class trực tiếp:

```java
import org.mockito.Mockito;

public class ShapeMockitoTest {

    @Test
    public void testDescribe_mockAbstractMethod_giaTriMongMuon() {
        // Mockito tạo subclass thay bạn, mock các abstract method
        Shape mockShape = Mockito.mock(Shape.class, Mockito.CALLS_REAL_METHODS);
        // CALLS_REAL_METHODS — gọi phương thức thật cho các concrete method

        // Stub các abstract method
        when(mockShape.calculateArea()).thenReturn(50.0);
        when(mockShape.getShapeName()).thenReturn("tròn");

        // Cần thiết lập màu — inject qua Whitebox hoặc constructor
        // (nếu không có setter)

        // Test phương thức concrete describe()
        String result = mockShape.describe();
        assertThat(result, containsString("tròn"));
        assertThat(result, containsString("50.0"));
    }
}
```

**Lưu ý với `CALLS_REAL_METHODS`**: Các phương thức concrete được gọi thật, còn abstract method được mock. Thích hợp khi muốn test logic của concrete method mà không ảnh hưởng bởi abstract method.

## Cách 4: Dùng PowerMock để mock Abstract Class với constructor

Khi abstract class có constructor phức tạp:

```java
// Abstract class với constructor phức tạp
public abstract class BaseRepository<T> {
    protected final DataSource dataSource;
    protected final String tableName;

    public BaseRepository(String tableName) {
        // Constructor lấy DataSource từ JNDI — phức tạp trong test
        this.dataSource = JndiLookup.getDataSource("java:/comp/env/jdbc/AppDS");
        this.tableName = tableName;
    }

    // Concrete method dùng dataSource
    public int count() {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(
                 "SELECT COUNT(*) FROM " + tableName)) {
            ResultSet rs = stmt.executeQuery();
            return rs.next() ? rs.getInt(1) : 0;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    // Abstract method
    public abstract T findById(Long id);
    public abstract List<T> findAll();
}
```

```java
import org.powermock.api.mockito.PowerMockito;

@RunWith(PowerMockRunner.class)
@PrepareForTest(BaseRepository.class)
public class BaseRepositoryTest {

    @Test
    public void testCount_dung_mockedDataSource() throws Exception {
        // Mock DataSource
        DataSource mockDataSource = mock(DataSource.class);
        Connection mockConn = mock(Connection.class);
        PreparedStatement mockStmt = mock(PreparedStatement.class);
        ResultSet mockRs = mock(ResultSet.class);

        // Thiết lập chuỗi mock
        when(mockDataSource.getConnection()).thenReturn(mockConn);
        when(mockConn.prepareStatement(anyString())).thenReturn(mockStmt);
        when(mockStmt.executeQuery()).thenReturn(mockRs);
        when(mockRs.next()).thenReturn(true);
        when(mockRs.getInt(1)).thenReturn(42);

        // Suppress constructor để tránh JNDI lookup
        suppress(constructor(BaseRepository.class, String.class));

        // Tạo anonymous subclass
        BaseRepository<User> repo = new BaseRepository<User>("users") {
            @Override
            public User findById(Long id) { return null; }

            @Override
            public List<User> findAll() { return Collections.emptyList(); }
        };

        // Inject mock dataSource vào field private
        Whitebox.setInternalState(repo, "dataSource", mockDataSource);
        Whitebox.setInternalState(repo, "tableName", "users");

        int count = repo.count();
        assertEquals(42, count);
    }
}
```

## So sánh các cách tiếp cận

| Cách | Ưu điểm | Nhược điểm | Phù hợp khi |
|---|---|---|---|
| Anonymous subclass | Đơn giản, không cần thêm thư viện | Dài dòng nếu nhiều abstract method | Ít abstract method |
| Concrete subclass | Rõ ràng, tái sử dụng được | Cần tạo thêm class | Nhiều test dùng chung |
| Mockito mock | Ngắn gọn, linh hoạt | Cần hiểu `CALLS_REAL_METHODS` | Constructor đơn giản |
| PowerMock + Whitebox | Xử lý được constructor phức tạp | Phức tạp, chậm hơn | Legacy code |

## Thuật ngữ quan trọng

| Thuật ngữ | Giải thích |
|---|---|
| **Abstract class** | Lớp trừu tượng — không thể khởi tạo trực tiếp, có thể có abstract method |
| **Abstract method** | Phương thức trừu tượng — chỉ có khai báo, không có body, subclass phải implement |
| **Concrete method** | Phương thức cụ thể — có body, có thể được gọi trực tiếp |
| **Anonymous subclass** | Lớp con ẩn danh — tạo và khởi tạo inline, không có tên |
| **CALLS_REAL_METHODS** | Hằng số Mockito — mock gọi phương thức thật cho những phương thức không được stub |
| **JNDI** | Java Naming and Directory Interface — API tra cứu tài nguyên như DataSource trong Java EE |
