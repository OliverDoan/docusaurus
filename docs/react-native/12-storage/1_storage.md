---
sidebar_position: 1
title: "1. Storage -- AsyncStorage, SQLite, FileSystem"
---

# Storage -- Lưu trữ dữ liệu local

RN có nhiều cách lưu data offline: **AsyncStorage** (key-value), **SecureStore** (encrypted), **SQLite** (database), **FileSystem** (file). Mỗi cái cho use case khác nhau.

**Tương tự đơn giản:** Storage giống các loại **hộc tủ** trong nhà:

- **AsyncStorage** = hộc nhỏ -- nhanh, đơn giản, không khóa
- **SecureStore** = két sắt -- có khóa
- **SQLite** = thư viện -- nhiều ngăn, query phức tạp
- **FileSystem** = nhà kho -- chứa file lớn

---

## Mục lục

- [Vì sao cần giải pháp lưu trữ riêng?](#vì-sao-cần-giải-pháp-lưu-trữ-riêng)
- [1. AsyncStorage](#1-asyncstorage)
- [2. SecureStore](#2-securestore)
- [3. MMKV (alternative nhanh)](#3-mmkv-alternative-nhanh)
- [4. SQLite](#4-sqlite)
- [5. FileSystem](#5-filesystem)
- [6. State management persistence](#6-state-management-persistence)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao cần giải pháp lưu trữ riêng?

Trên web bạn có `localStorage` của trình duyệt. Nhưng mobile **không có** `localStorage` -- mọi dữ liệu cần lưu **ngay trên máy** để app vẫn dùng được khi tắt mở lại hoặc mất mạng.

**Vấn đề:**

```tsx
// App đăng nhập xong, mở lại là mất hết -> bắt user login lại mỗi lần
function App() {
  const [token, setToken] = useState(null); // chỉ nằm trong RAM
  const [theme, setTheme] = useState('light'); // reset mỗi lần mở app
  // localStorage.setItem('token', token); // ❌ localStorage không tồn tại trên RN
  return <Main />;
}
```

State trong RAM **mất sạch** khi app bị kill. App cần: nhớ đăng nhập, cache để dùng **offline**, và lưu cài đặt người dùng. Mỗi nhu cầu lại có yêu cầu khác nhau (nhanh, có cấu trúc, hay an toàn) nên không có một công cụ nào hợp cho mọi việc.

**Giải pháp:** RN có các giải pháp lưu trữ riêng, chọn theo nhu cầu:

```tsx
// Key-value đơn giản, bất đồng bộ -- settings, preferences
await AsyncStorage.setItem('theme', 'dark');

// Key-value siêu nhanh, đồng bộ -- thay AsyncStorage khi cần perf
storage.set('theme', 'dark');

// Dữ liệu quan hệ lớn / offline-first -- table, query phức tạp
await db.getAllAsync('SELECT * FROM users WHERE name LIKE ?', '%Alice%');

// Dữ liệu nhạy cảm -- mã hóa trong Keychain/Keystore
await SecureStore.setItemAsync('token', jwt);
```

:::tip[Dùng thực tế]

- **Lưu token / cài đặt người dùng:** dùng MMKV hoặc AsyncStorage cho preferences (theme, ngôn ngữ); token nhạy cảm để vào SecureStore.
- **Cache dữ liệu để dùng offline:** danh sách sản phẩm, bài viết đã tải -> SQLite để query nhanh khi mất mạng.
- **App offline-first (Notion, Todoist):** dữ liệu có cấu trúc, đồng bộ sau -> SQLite hoặc WatermelonDB.
- **Dữ liệu nhạy cảm (token, mật khẩu):** luôn dùng SecureStore (mã hóa), không bao giờ để plain text trong AsyncStorage.

:::

---

## 1. AsyncStorage

`@react-native-async-storage/async-storage` -- key-value, **không encrypt**, async API.

```bash
npx expo install @react-native-async-storage/async-storage
```

```jsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set
await AsyncStorage.setItem('theme', 'dark');
await AsyncStorage.setItem('user', JSON.stringify({ name: 'Alice' }));

// Get
const theme = await AsyncStorage.getItem('theme');
const user = JSON.parse(await AsyncStorage.getItem('user') ?? '{}');

// Remove
await AsyncStorage.removeItem('theme');

// Clear all
await AsyncStorage.clear();

// Multi
await AsyncStorage.multiSet([
  ['key1', 'value1'],
  ['key2', 'value2'],
]);
const values = await AsyncStorage.multiGet(['key1', 'key2']);
```

### Wrapper hook

```jsx
function useStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    AsyncStorage.getItem(key).then(v => {
      if (v != null) setValue(JSON.parse(v));
    });
  }, [key]);

  const update = useCallback(async (newValue) => {
    setValue(newValue);
    await AsyncStorage.setItem(key, JSON.stringify(newValue));
  }, [key]);

  return [value, update];
}
```

---

## 2. SecureStore

Xem [Section 11 - Security](../11-security/1_security.md) cho chi tiết.

```jsx
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('token', 'jwt-xxx');
const token = await SecureStore.getItemAsync('token');
```

Lưu vào **Keychain (iOS) / EncryptedSharedPreferences (Android)** -- encrypted, không root được đọc.

**Limit:** ~2KB/value (iOS Keychain).

---

## 3. MMKV (alternative nhanh)

`react-native-mmkv` -- ~30x nhanh hơn AsyncStorage, sync API.

```bash
npm install react-native-mmkv
```

```jsx
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

// Sync API (khong can await)
storage.set('theme', 'dark');
const theme = storage.getString('theme');

storage.set('count', 42);
const count = storage.getNumber('count');

storage.set('isLogged', true);
const isLogged = storage.getBoolean('isLogged');

// Object
storage.set('user', JSON.stringify(user));
const user = JSON.parse(storage.getString('user') ?? '{}');

storage.delete('theme');
storage.clearAll();
```

**Lợi ích:**

- **Sync** -- không cần async/await
- **Nhanh** -- nhanh hơn AsyncStorage 30x
- **Encryption** built-in optional
- **Multi-instance** -- tách scope dữ liệu

Khuyến nghị cho project mới, performance critical.

---

## 4. SQLite

Database SQL embedded.

```bash
npx expo install expo-sqlite
```

```jsx
import * as SQLite from 'expo-sqlite';

const db = await SQLite.openDatabaseAsync('myapp.db');

// Create table
await db.execAsync(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert
const result = await db.runAsync(
  'INSERT INTO users (name, email) VALUES (?, ?);',
  'Alice', 'alice@example.com'
);
console.log(result.lastInsertRowId);

// Query
const users = await db.getAllAsync('SELECT * FROM users WHERE name LIKE ?', '%Alice%');
console.log(users);

// Get one
const user = await db.getFirstAsync('SELECT * FROM users WHERE id = ?', 1);

// Transaction
await db.withTransactionAsync(async () => {
  await db.runAsync('UPDATE users SET name = ? WHERE id = ?', 'Bob', 1);
  await db.runAsync('INSERT INTO log (user_id, action) VALUES (?, ?)', 1, 'rename');
});
```

### Khi nào dùng SQLite?

- Data **có cấu trúc** (table, relation)
- Cần query phức tạp (JOIN, GROUP BY)
- Offline-first app (Notion, Todoist)
- Data lớn (>1000 record)

### ORM cho RN

- **WatermelonDB** -- React-friendly, reactive
- **Realm** -- MongoDB-style, mạnh
- **Drizzle ORM** -- TypeScript-first

---

## 5. FileSystem

`expo-file-system` -- đọc/ghi file.

```bash
npx expo install expo-file-system
```

```jsx
import * as FileSystem from 'expo-file-system';

// Document directory (persistent)
const dir = FileSystem.documentDirectory;
const path = `${dir}data.json`;

// Write
await FileSystem.writeAsStringAsync(path, JSON.stringify(data));

// Read
const content = await FileSystem.readAsStringAsync(path);
const data = JSON.parse(content);

// Info
const info = await FileSystem.getInfoAsync(path);
console.log(info.size, info.modificationTime);

// Delete
await FileSystem.deleteAsync(path);

// List
const files = await FileSystem.readDirectoryAsync(dir);

// Download
const result = await FileSystem.downloadAsync(
  'https://example.com/file.pdf',
  `${dir}file.pdf`
);
```

### Cache directory vs Document directory

| Directory                          | Đặc điểm                              |
| ---------------------------------- | ------------------------------------- |
| `FileSystem.documentDirectory`     | Persistent, backup iCloud (iOS)       |
| `FileSystem.cacheDirectory`        | OS có thể xóa khi thiếu disk          |

---

## 6. State management persistence

Persist Redux/Zustand/Jotai state vào storage.

### Zustand + persist middleware

```jsx
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create(
  persist(
    (set) => ({
      count: 0,
      increment: () => set(s => ({ count: s.count + 1 })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

State tự save/load lúc start.

### Redux Persist

```jsx
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistedReducer = persistReducer(
  { key: 'root', storage: AsyncStorage },
  rootReducer
);

const store = configureStore({ reducer: persistedReducer });
const persistor = persistStore(store);
```

---

## Khi nào dùng?

| Lưu trữ            | Use case                                  |
| ------------------ | ----------------------------------------- |
| **AsyncStorage**   | Settings, preferences (theme, lang)       |
| **MMKV**           | Thay AsyncStorage cho perf                |
| **SecureStore**    | Token, password, biometric                |
| **SQLite**         | Data có cấu trúc, query phức tạp          |
| **FileSystem**     | File lớn (image cache, PDF, video)        |

- **Best practice:**
  - Tách rõ data nhạy cảm vs preferences
  - Migrate khi schema thay đổi
  - Backup data quan trọng (server, iCloud)
  - Test offline behavior

---

## Lỗi thường gặp

### Lỗi 1: AsyncStorage cho token

```jsx
// SAI -- plain text
await AsyncStorage.setItem('token', jwt);

// DUNG
await SecureStore.setItemAsync('token', jwt);
```

### Lỗi 2: Block UI bằng storage call

```jsx
// CHAM -- chan render
function MyComponent() {
  const data = await AsyncStorage.getItem('data'); // SAI cu phap, va block

  // DUNG
  useEffect(() => {
    AsyncStorage.getItem('data').then(setData);
  }, []);
}
```

### Lỗi 3: Quên parse JSON

```jsx
// SAI -- AsyncStorage chi luu string
await AsyncStorage.setItem('user', user); // [object Object]

// DUNG
await AsyncStorage.setItem('user', JSON.stringify(user));
const user = JSON.parse(await AsyncStorage.getItem('user'));
```

### Lỗi 4: SQLite không close DB

Expo SQLite auto-manage. Nếu manual close, không reuse connection.

### Lỗi 5: File path sai platform

```jsx
// SAI -- hardcode
const path = '/storage/sdcard/myapp/file.txt';

// DUNG
const path = `${FileSystem.documentDirectory}file.txt`;
```

---

## Câu hỏi phỏng vấn

### Câu 1: AsyncStorage vs MMKV?

**Trả lời:**

- **AsyncStorage**: built-in, async, ~30x chậm hơn MMKV
- **MMKV**: sync, nhanh (C++ native), encryption optional, multi-instance

Project mới ưu tiên MMKV cho perf. AsyncStorage OK cho data nhỏ, ít access.

### Câu 2: Khi nào dùng SQLite?

**Trả lời:**

- Data có **cấu trúc** (table, relation)
- Cần **query phức tạp** (JOIN, aggregate)
- **Offline-first** app (Notion-like)
- Data **lớn** (>1000 record) -- AsyncStorage chậm

Cho key-value đơn giản, dùng MMKV/AsyncStorage thay vì SQLite.

### Câu 3: Backup user data trên iOS?

**Trả lời:**

- File trong `documentDirectory` -> backup iCloud (mặc định)
- File trong `cacheDirectory` -> không backup
- SQLite, AsyncStorage, MMKV -> trong document dir -> backup

User reset device -> data restore từ iCloud. Nếu muốn **không backup**, set `isExcludedFromBackup` flag.

### Câu 4: Migration schema SQLite?

**Trả lời:** Khi update app, schema có thể thay đổi. Cần migration:

```sql
PRAGMA user_version; -- get current
-- Neu version cu, run ALTER TABLE
PRAGMA user_version = 2; -- set new
```

Hoặc dùng ORM (Drizzle, WatermelonDB) có migration system.

### Câu 5: Limit AsyncStorage?

**Trả lời:** Default 6MB Android. Có thể tăng config. iOS không limit nhưng nên < vài MB. Vượt limit -> slow, crash. Data lớn -> SQLite, FileSystem.
