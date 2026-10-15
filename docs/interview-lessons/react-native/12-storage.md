---
sidebar_position: 12
title: "Storage"
---

# Storage

## 1. Storage -- AsyncStorage, SQLite, FileSystem

Bài học: [1. Storage -- AsyncStorage, SQLite, FileSystem](../../react-native/12-storage/1_storage.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. AsyncStorage vs MMKV?**

<details className="qa">
<summary>Xem đáp án</summary>

- **AsyncStorage**: built-in, async, ~30x chậm hơn MMKV
- **MMKV**: sync, nhanh (C++ native), encryption optional, multi-instance

Project mới ưu tiên MMKV cho perf. AsyncStorage OK cho data nhỏ, ít access.

</details>

**2. Khi nào dùng SQLite?**

<details className="qa">
<summary>Xem đáp án</summary>

- Data có **cấu trúc** (table, relation)
- Cần **query phức tạp** (JOIN, aggregate)
- **Offline-first** app (Notion-like)
- Data **lớn** (>1000 record) -- AsyncStorage chậm

Cho key-value đơn giản, dùng MMKV/AsyncStorage thay vì SQLite.

</details>

**3. Backup user data trên iOS?**

<details className="qa">
<summary>Xem đáp án</summary>

- File trong `documentDirectory` -> backup iCloud (mặc định)
- File trong `cacheDirectory` -> không backup
- SQLite, AsyncStorage, MMKV -> trong document dir -> backup

User reset device -> data restore từ iCloud. Nếu muốn **không backup**, set `isExcludedFromBackup` flag.

</details>

**4. Migration schema SQLite?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi update app, schema có thể thay đổi. Cần migration:

```sql
PRAGMA user_version; -- get current
-- Neu version cu, run ALTER TABLE
PRAGMA user_version = 2; -- set new
```

Hoặc dùng ORM (Drizzle, WatermelonDB) có migration system.

</details>

**5. Limit AsyncStorage?**

<details className="qa">
<summary>Xem đáp án</summary>

Default 6MB Android. Có thể tăng config. iOS không limit nhưng nên < vài MB. Vượt limit -> slow, crash. Data lớn -> SQLite, FileSystem.

</details>
