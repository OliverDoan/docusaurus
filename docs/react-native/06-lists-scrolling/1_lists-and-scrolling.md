---
sidebar_position: 1
title: "1. Lists & Scrolling"
---

# Lists & Scrolling -- Danh sách và Cuộn

Mobile app hầu hết là danh sách: feed, chat, products. React Native cung cấp **ScrollView**, **FlatList**, **SectionList** -- mỗi cái cho use case khác nhau.

**Tương tự đơn giản:** **ScrollView** giống **tờ giấy dài** -- cuộn được nhưng render toàn bộ luôn. **FlatList** giống **rạp chiếu phim** -- chỉ chiếu cảnh hiện tại, cảnh chưa tới chưa load -- tiết kiệm tài nguyên.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Danh sách dài dùng `FlatList` (virtualized), KHÔNG `.map()` trong `ScrollView`** — ScrollView render hết item → OOM, giật lag.
- **`ScrollView`** — chỉ cho content ít, biết trước (< 20 item), render toàn bộ ngay.
- **`FlatList`** — `data` + `renderItem` + `keyExtractor`; `onEndReached` + `onEndReachedThreshold` cho infinite scroll.
- **`SectionList`** — danh sách có header section (danh bạ A-B-C, lịch theo ngày).
- **`getItemLayout` khi item cao cố định** → scroll mượt hơn; memoize `renderItem` với `useCallback`.
- ⭐ **`FlashList` (`@shopify/flash-list`)** — recycle view, ~5x nhanh, khuyến nghị cho danh sách lớn (cần `estimatedItemSize`).

:::

---

## Mục lục

- [Vì sao cần FlatList (không map như web)?](#vì-sao-cần-flatlist-không-map-như-web)
- [1. ScrollView](#1-scrollview)
- [2. FlatList](#2-flatlist)
- [3. SectionList](#3-sectionlist)
- [4. RefreshControl (Pull to refresh)](#4-refreshcontrol-pull-to-refresh)
- [5. FlashList (thay thế FlatList)](#5-flashlist-thay-thế-flatlist)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao cần FlatList (không map như web)?

**Vấn đề:** Quen tay từ web, bạn render danh sách dài bằng `.map()` trong `ScrollView`. RN sẽ **dựng TẤT CẢ item cùng lúc** -- hàng nghìn dòng đều bị mount, tốn RAM khủng khiếp, app giật/lag/crash trên điện thoại.

```jsx
// SAI -- 10000 item mount cung luc -> OOM, giat lag
<ScrollView>
  {users.map(u => (
    <View key={u.id} style={{ padding: 16 }}>
      <Text>{u.name}</Text>
    </View>
  ))}
</ScrollView>
```

**Giải pháp:** Dùng `FlatList` / `SectionList` (hoặc `FlashList`) -- **virtualization**: chỉ render những item đang **hiển thị** trên màn hình, **tái sử dụng view** khi cuộn. Hỗ trợ sẵn lazy load, pull-to-refresh, phân trang -- mượt với danh sách lớn.

```jsx
// DUNG -- chi render item trong viewport, cuon muot voi nghin item
<FlatList
  data={users}
  keyExtractor={u => u.id}
  renderItem={({ item }) => (
    <View style={{ padding: 16 }}>
      <Text>{item.name}</Text>
    </View>
  )}
/>
```

:::tip[Dùng thực tế]

- **Feed mạng xã hội**: hàng nghìn post -- `FlatList` chỉ render màn hình hiện tại.
- **Danh sách sản phẩm dài**: e-commerce với hàng trăm item ảnh -- không OOM.
- **Infinite scroll**: kết hợp `onEndReached` để load thêm khi cuộn gần cuối.
- **Danh sách có section**: danh bạ A-B-C, lịch theo ngày -- dùng `SectionList`.

:::

---

## 1. ScrollView

ScrollView render **TOÀN BỘ** children **ngay lập tức** -- phù hợp content **ít, biết trước** (như màn detail).

```jsx
import { ScrollView } from 'react-native';

<ScrollView style={{ flex: 1 }}>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
  <Image source={...} />
  <Text>Item N</Text>
</ScrollView>
```

### Props

```jsx
<ScrollView
  horizontal                          // cuon ngang
  showsVerticalScrollIndicator={false}// an thanh scrollbar
  contentContainerStyle={{ padding: 16 }}
  onScroll={(e) => console.log(e.nativeEvent.contentOffset.y)}
  scrollEventThrottle={16}            // 60fps
  refreshControl={<RefreshControl ... />}
>
  ...
</ScrollView>
```

**KHÔNG dùng ScrollView cho danh sách dài** -- nghìn item sẽ lag, OOM.

---

## 2. FlatList

FlatList = **virtualized list** -- chỉ render item đang **trong viewport** + buffer. Phù hợp danh sách dài/vô tận.

```jsx
import { FlatList } from 'react-native';

const data = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
];

<FlatList
  data={data}
  keyExtractor={item => item.id}
  renderItem={({ item, index }) => (
    <View style={{ padding: 16 }}>
      <Text>{item.name}</Text>
    </View>
  )}
/>
```

### Props phổ biến

| Prop                  | Vai trò                                       |
| --------------------- | --------------------------------------------- |
| `data`                | Mảng item                                     |
| `renderItem`          | Render từng item                              |
| `keyExtractor`        | Key cho mỗi item (`item.id`)                  |
| `ListHeaderComponent` | Header (trên đầu list)                        |
| `ListFooterComponent` | Footer (cuối list)                            |
| `ListEmptyComponent`  | Show khi data rỗng                            |
| `ItemSeparatorComponent` | Phân cách giữa item                        |
| `numColumns`          | Số cột (grid)                                 |
| `horizontal`          | Cuộn ngang                                    |
| `inverted`            | Đảo ngược thứ tự (chat)                       |
| `onEndReached`        | Khi cuộn gần cuối -- load more                |
| `onEndReachedThreshold`| Ngưỡng trigger (0.5 = 50% còn lại)           |
| `refreshing` / `onRefresh` | Pull to refresh                          |

### Ví dụ đầy đủ -- danh sách user với pagination

```jsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);
    const newUsers = await fetchUsers(page);
    setUsers(prev => [...prev, ...newUsers]);
    setPage(p => p + 1);
    setLoading(false);
  };

  useEffect(() => { loadMore(); }, []);

  return (
    <FlatList
      data={users}
      keyExtractor={u => u.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text>{item.name}</Text>
        </View>
      )}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading ? <ActivityIndicator /> : null}
      ListEmptyComponent={<Text>Khong co user</Text>}
      ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#eee' }} />}
    />
  );
}
```

### Tối ưu performance

```jsx
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={item => item.id}

  // Toi uu
  removeClippedSubviews={true}   // unmount item ngoai viewport
  maxToRenderPerBatch={10}        // render 10 item moi batch
  windowSize={10}                 // bufer 10 screens
  initialNumToRender={20}          // render 20 ban dau
  getItemLayout={(data, index) => ({
    length: 80,                     // height co dinh
    offset: 80 * index,
    index,
  })}
/>
```

`getItemLayout` -- nếu item **chiều cao cố định** -> FlatList scroll cực mượt (không cần measure).

---

## 3. SectionList

Danh sách có **header section** (như danh bạ: A, B, C...).

```jsx
const sections = [
  { title: 'A', data: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Ann' }] },
  { title: 'B', data: [{ id: 3, name: 'Bob' }] },
];

<SectionList
  sections={sections}
  keyExtractor={(item, index) => item.id.toString()}
  renderItem={({ item }) => <Text>{item.name}</Text>}
  renderSectionHeader={({ section }) => (
    <Text style={{ fontWeight: 'bold' }}>{section.title}</Text>
  )}
  stickySectionHeadersEnabled
/>
```

---

## 4. RefreshControl (Pull to refresh)

```jsx
const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  await refetchData();
  setRefreshing(false);
};

<FlatList
  data={items}
  renderItem={...}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="#007AFF"
      title="Dang tai..."
    />
  }
/>
```

Hoạt động với cả `ScrollView`, `FlatList`, `SectionList`.

---

## 5. FlashList (thay thế FlatList)

**FlashList** (`@shopify/flash-list`) -- thay thế FlatList với performance **siêu cao** cho danh sách lớn.

```bash
npm install @shopify/flash-list
```

```jsx
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={data}
  renderItem={({ item }) => <Item {...item} />}
  estimatedItemSize={80}   // bat buoc -- height uoc tinh
/>
```

**Lợi ích:**

- Recycle item view (không destroy/create) -- ~5x nhanh
- Memory ít hơn
- API gần như FlatList -- drop-in replacement
- Khuyến nghị cho danh sách > 50 item

---

## Khi nào dùng?

- **ScrollView**: Content cố định, ít item (< 20)
- **FlatList**: Danh sách dài, dynamic, infinite scroll
- **SectionList**: Có section header
- **FlashList**: Production app, danh sách lớn, ưu tiên perf
- **Best practice:**
  - `keyExtractor` cho mọi list -- không dùng index nếu data có thể reorder
  - `getItemLayout` nếu height cố định -- tăng perf
  - Memoize `renderItem` với `useCallback`
  - Item component memoize với `React.memo`
  - FlashList cho danh sách lớn

---

## Lỗi thường gặp

### Lỗi 1: ScrollView cho danh sách dài

```jsx
// SAI -- render het 10000 item -> OOM
<ScrollView>
  {users.map(u => <UserItem key={u.id} user={u} />)}
</ScrollView>

// DUNG -- FlatList
<FlatList data={users} renderItem={...} />
```

### Lỗi 2: Quên keyExtractor

```jsx
// SAI -- dung index, item reorder se loi
<FlatList data={data} renderItem={...} />

// DUNG
<FlatList data={data} keyExtractor={item => item.id} renderItem={...} />
```

### Lỗi 3: renderItem không memo

```jsx
// SAI -- moi render tao ham moi -> child re-render
<FlatList renderItem={({ item }) => <Item data={item} />} />

// DUNG
const renderItem = useCallback(
  ({ item }) => <Item data={item} />,
  []
);
<FlatList renderItem={renderItem} />
```

### Lỗi 4: ScrollView + FlatList nested

```jsx
// SAI -- nested VirtualizedList warning
<ScrollView>
  <FlatList ... />
</ScrollView>

// DUNG -- dung ListHeaderComponent/ListFooterComponent cua FlatList
<FlatList
  ListHeaderComponent={<HeaderContent />}
  data={...}
  renderItem={...}
/>
```

### Lỗi 5: `onEndReached` gọi nhiều lần

```jsx
const loadMore = async () => {
  if (loading || !hasMore) return; // GUARD
  // ...
};
```

---

## Câu hỏi phỏng vấn

### Câu 1: ScrollView vs FlatList?

**Trả lời:**

- **ScrollView**: render **toàn bộ children** ngay -- ok cho ít item (< 20)
- **FlatList**: **virtualized** -- chỉ render item trong viewport + buffer -- ok cho danh sách dài

10000 item: ScrollView OOM, FlatList smooth.

### Câu 2: Virtualization là gì?

**Trả lời:** Chỉ render **item đang visible** (+ buffer). Item ngoài viewport bị **unmount** để tiết kiệm memory. Khi scroll, item mới được mount, item cũ unmount. Cho phép list **nghìn-triệu item** mượt mà.

### Câu 3: `getItemLayout` lợi ích gì?

**Trả lời:** Nếu mỗi item **chiều cao cố định**, `getItemLayout` cho FlatList biết trước layout -- **không cần measure**. Hệ quả:

- Scroll mượt hơn (đặc biệt initial scroll)
- `scrollToIndex` chính xác
- Tăng perf đáng kể

```jsx
getItemLayout={(data, index) => ({
  length: 80, offset: 80 * index, index
})}
```

### Câu 4: FlashList vs FlatList?

**Trả lời:** Cả 2 virtualized. **FlashList** (Shopify):

- **Recycle** item view thay vì destroy/create -- nhanh hơn
- Memory thấp hơn
- API tương tự -- migrate dễ
- Cần `estimatedItemSize`

Khuyến nghị FlashList cho production app có list lớn.

### Câu 5: Cách implement infinite scroll?

**Trả lời:**

1. `onEndReached={loadMore}`
2. `onEndReachedThreshold={0.5}` (load khi còn 50%)
3. Trong `loadMore`, fetch page tiếp theo
4. Append vào state
5. Guard `if (loading) return` -- tránh gọi nhiều lần
6. `ListFooterComponent={loading ? <ActivityIndicator /> : null}`
