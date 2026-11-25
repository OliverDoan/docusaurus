---
sidebar_position: 3
title: "3. Các khái niệm cốt lõi trong Git"
---

# Các khái niệm cốt lõi trong Git

Trước khi gõ bất kỳ lệnh Git nào, bạn cần hiểu **cách Git suy nghĩ**. Bài này giải thích các khái niệm nền tảng mà mọi thứ trong Git đều xây dựng trên đó.

[![Sơ đồ tóm tắt bài: Khái niệm Git cơ bản](/img/git/khai-niem-co-ban.webp)](pathname:///img/git/khai-niem-co-ban.webp)

---

:::note[Ghi nhớ nhanh]

- ⭐ **Ba vùng làm việc** — Working Directory (thư mục làm việc) → Staging Area (vùng chờ, đưa vào bằng `git add`) → Repository (kho, lưu lại bằng `git commit`).
- ⭐ **Commit là một snapshot** — mỗi commit chụp lại trạng thái dự án và được định danh bằng **SHA-1 hash** duy nhất.
- **HEAD là con trỏ hiện tại** — trỏ tới commit/nhánh bạn đang đứng; `HEAD` tách rời (detached) là khi trỏ thẳng vào một commit thay vì một nhánh.
- **Branch chỉ là con trỏ tới commit** — nên tạo nhánh rất nhẹ và nhanh.
- **Mọi thứ nằm trong thư mục `.git`** — đây là nơi Git lưu toàn bộ lịch sử và metadata của repo.

:::

---

## Mục lục

- [Vì sao Git có vùng staging & snapshot?](#vì-sao-git-có-vùng-staging--snapshot)
- [1. Ba vùng làm việc của Git](#1-ba-vùng-làm-việc-của-git)
- [2. Commit là gì?](#2-commit-là-gì)
- [3. SHA-1 Hash — Định danh duy nhất](#3-sha-1-hash-định-danh-duy-nhất)
- [4. HEAD là gì?](#4-head-là-gì)
- [5. Branch (Nhánh)](#5-branch-nhánh)
- [6. Detached HEAD](#6-detached-head)
- [7. Sơ đồ Commit History](#7-sơ-đồ-commit-history)
- [8. Thư mục .git](#8-thư-mục-git)
- [9. File States trong Git](#9-file-states-trong-git)
- [10. Lỗi thường gặp](#10-lỗi-thường-gặp)
- [Tổng kết](#tổng-kết)

---

## Vì sao Git có vùng staging & snapshot?

**Vấn đề:**

Khi bạn sửa nhiều file cho nhiều mục đích khác nhau, nếu commit "tất cả một lần" thì lịch sử lộn xộn, khó review và khó revert từng phần. Bạn cũng cần biết rõ file nào đang ở trạng thái nào.

```bash
# Bạn sửa 3 file cho 3 việc khác nhau:
# - login.js     (tính năng đăng nhập)
# - register.js  (tính năng đăng ký)
# - style.css    (sửa giao diện)

git commit -am "sua nhieu thu"
# -> Gộp hết vào 1 commit: lịch sử rối, không tách/revert được từng việc
```

**Giải pháp:**

Git tách quy trình thành 3 vùng và mỗi commit là một snapshot toàn bộ dự án.

```bash
# 3 vùng: Working Directory (đang sửa)
#         -> STAGING AREA (chọn lọc thay đổi sẽ vào commit)
#         -> Repository (commit đã lưu)

git add login.js
git commit -m "feat: them tinh nang dang nhap"   # 1 snapshot, có hash định danh

git add register.js
git commit -m "feat: them tinh nang dang ky"      # snapshot riêng, gọn gàng

# Mỗi commit lưu ảnh chụp TOÀN BỘ dự án (không chỉ diff),
# cho phép commit có chủ đích, dễ review và revert từng phần.
```

:::tip[Dùng thực tế]

- **Chọn lọc file vào commit:** `git add` chỉ những file liên quan, để commit gọn và đúng chủ đề.
- **Tách thành nhiều commit ý nghĩa:** mỗi việc một commit, dễ review và revert riêng lẻ.
- **Kiểm tra trạng thái:** dùng `git status` để biết file nào đang Modified, Staged hay Untracked.
- **Hiểu commit là snapshot:** mỗi commit là ảnh chụp toàn bộ dự án, có hash để truy xuất bất cứ lúc nào.

:::

---

## 1. Ba vùng làm việc của Git

Đây là khái niệm **quan trọng nhất** để hiểu Git. Mỗi file trong dự án của bạn tồn tại ở một trong 3 vùng:

```
+-------------------+     git add     +-------------------+    git commit    +-------------------+
|                   | -------------> |                   | --------------> |                   |
|  WORKING          |                |  STAGING AREA     |                 |  REPOSITORY       |
|  DIRECTORY        |                |  (Index)          |                 |  (.git)           |
|                   |                |                   |                 |                   |
|  Nơi bạn VIẾT    |                |  Nơi bạn CHUẨN   |                 |  Nơi Git LƯU      |
|  và CHỈNH SỬA    |                |  BỊ cho commit    |                 |  VĨNH VIỄN        |
|  code             |                |  tiếp theo        |                 |                   |
|                   | <------------- |                   | <-------------- |                   |
+-------------------+  git restore   +-------------------+  git restore    +-------------------+
                                                            --staged
```

Sơ đồ tổng quan dòng chảy giữa 3 vùng:

```mermaid
flowchart LR
    WD["Working Directory<br/>(nơi bạn viết & sửa code)"] -->|"git add"| SA["Staging Area<br/>(Index — chuẩn bị commit)"]
    SA -->|"git commit"| REPO["Repository<br/>(.git — lưu vĩnh viễn)"]
    SA -.->|"git restore<br/>(bỏ sửa đổi, lấy lại bản đã add)"| WD
    REPO -.->|"git restore --staged<br/>(gỡ khỏi staging)"| SA
```

### Hình dung 3 vùng bằng việc chụp ảnh tập thể

:::info[Ẩn dụ: phòng tiệc, bục chụp ảnh và cuốn album]

Tưởng tượng bạn là thợ chụp ảnh ở một buổi tiệc:

- **Working Directory** (thư mục làm việc) = **cả phòng tiệc**. Mọi người đi lại, thay áo, chỉnh tóc thoải mái. Đây chính là thư mục bạn mở ra bằng Finder/Explorer, nơi bạn gõ và sửa file.
- **Staging Area** (vùng chờ, còn gọi là *index*) = **cái bục chụp ảnh**. Bạn **mời** từng người bước lên bục (`git add`). Ai chưa được mời thì vẫn ở dưới phòng, không lọt vào ảnh.
- **Repository** (kho, thư mục ẩn `.git`) = **cuốn album**. Bấm máy (`git commit`) là chụp đúng những người **đang đứng trên bục**, in ảnh và dán vĩnh viễn vào album, kèm dòng chú thích (commit message).

Điều quan trọng: ảnh chụp **những gì đang trên bục lúc bấm máy**, không phải những gì đang ở trong phòng. Nếu ai đó đã lên bục rồi lại chạy xuống thay áo, ảnh vẫn chụp **bộ áo lúc họ lên bục** — trừ khi bạn mời họ lên bục lại (`git add` lần nữa).

:::

Sơ đồ dưới đây là "ảnh chụp nhanh" của ví dụ 3 file ở trên, **ngay sau khi** bạn chạy `git add login.js` nhưng chưa commit. Mỗi vùng giữ một bản riêng của file:

```mermaid
flowchart LR
    subgraph WD["Working Directory - phòng tiệc"]
        W1["login.js (đã sửa)"]
        W2["register.js (đã sửa)"]
        W3["style.css (đã sửa)"]
    end
    subgraph SA["Staging Area - bục chụp"]
        S1["login.js (bản vừa add)"]
    end
    subgraph RP["Repository - album"]
        R1["Commit cũ<br/>login.js, register.js, style.css<br/>bản chưa sửa"]
    end
    W1 -->|"git add login.js"| S1
    S1 -.->|"git commit sẽ chụp<br/>CHỈ những gì trên bục"| RP
```

`register.js` và `style.css` vẫn nằm dưới "phòng tiệc", nên commit tiếp theo **chỉ** chứa thay đổi của `login.js`.

### Theo chân một file qua 3 vùng

Để thấy rõ "mỗi vùng giữ một bản riêng", hãy theo dõi nội dung file `hello.txt` sau từng lệnh. Mỗi ô là **nội dung file trong vùng đó** tại thời điểm ấy:

| Bước | Bạn làm gì                              | Working Directory | Staging Area | Repository (commit mới nhất) | `git status` nói gì                      |
| ---- | --------------------------------------- | ----------------- | ------------ | ---------------------------- | ---------------------------------------- |
| 1    | Tạo file, gõ `Xin chào`                 | `Xin chào`        | (chưa có)    | (chưa có)                    | Untracked (file mới, Git chưa theo dõi)  |
| 2    | `git add hello.txt`                     | `Xin chào`        | `Xin chào`   | (chưa có)                    | Changes to be committed                  |
| 3    | `git commit -m "them loi chao"`         | `Xin chào`        | `Xin chào`   | `Xin chào`                   | nothing to commit (3 vùng giống nhau)    |
| 4    | Sửa thành `Xin chào bạn`                | `Xin chào bạn`    | `Xin chào`   | `Xin chào`                   | Changes not staged (đỏ)                  |
| 5    | `git add hello.txt`                     | `Xin chào bạn`    | `Xin chào bạn` | `Xin chào`                 | Changes to be committed (xanh)           |
| 6    | Sửa tiếp thành `Xin chào bạn nhé`       | `Xin chào bạn nhé` | `Xin chào bạn` | `Xin chào`               | **Cả hai**: to be committed + not staged |
| 7    | `git commit -m "sua loi chao"`          | `Xin chào bạn nhé` | `Xin chào bạn` | `Xin chào bạn`           | Changes not staged (chữ "nhé" chưa add)  |

Bước 6–7 là chỗ người mới hay bất ngờ: commit lưu `Xin chào bạn` chứ **không** phải `Xin chào bạn nhé`, vì chữ "nhé" được gõ **sau** lần `git add` cuối — đúng như người chạy xuống thay áo sau khi đã lên bục.

Dòng chảy của 7 bước trên, vẽ theo thời gian:

```mermaid
sequenceDiagram
    participant W as Working Directory
    participant S as Staging Area
    participant R as Repository
    Note over W: Bước 1 - gõ "Xin chào"
    W->>S: Bước 2 - git add (chép bản "Xin chào")
    S->>R: Bước 3 - git commit (chụp bản trên bục)
    Note over W: Bước 4 - sửa thành "Xin chào bạn"
    W->>S: Bước 5 - git add (bục giờ là "Xin chào bạn")
    Note over W: Bước 6 - sửa tiếp "Xin chào bạn nhé"
    S->>R: Bước 7 - git commit (lưu "Xin chào bạn")
    Note over W,S: "nhé" vẫn chỉ nằm ở Working Directory
```

### 1.1 Working Directory (Thư mục làm việc)

Đây là **thư mục thực** trên máy tính của bạn — nơi bạn mở file, viết code, sửa lỗi.

```bash
# Bạn sửa file index.html
# -> File index.html ở trạng thái "modified" trong Working Directory

# Bạn tạo file mới style.css
# -> File style.css ở trạng thái "untracked" trong Working Directory
```

**Trạng thái file trong Working Directory:**

| Trạng thái     | Ý nghĩa                                 |
| -------------- | --------------------------------------- |
| **Untracked**  | File mới, Git chưa biết đến             |
| **Modified**   | File đã thay đổi so với lần commit cuối |
| **Deleted**    | File đã bị xoá                          |
| **Unmodified** | File không thay đổi gì                  |

### 1.2 Staging Area (Vùng chuẩn bị)

Đây là vùng **trung gian** — nơi bạn chọn những thay đổi nào sẽ được đưa vào commit tiếp theo.

```bash
# Thêm file vào Staging Area
git add index.html
# -> index.html chuyển từ Working Directory sang Staging Area

# Thêm tất cả file đã thay đổi
git add .
```

**Tại sao cần Staging Area? Tại sao không commit thẳng?**

Ví dụ thực tế: Bạn đang làm 2 việc cùng lúc:

```bash
# Bạn sửa 3 file:
# - login.js      (tính năng đăng nhập)
# - register.js   (tính năng đăng ký)
# - style.css     (sửa giao diện)

# KHÔNG CÓ Staging Area (kiểu SVN):
svn commit -m "them login va sua giao dien"
# -> Commit hết, không tách được

# CÓ Staging Area (Git):
git add login.js
git commit -m "feat: them tinh nang dang nhap"

git add register.js
git commit -m "feat: them tinh nang dang ky"

git add style.css
git commit -m "fix: sua loi giao dien trang chu"
# -> Tách thành 3 commit rõ ràng!
```

Staging Area cho phép bạn **chọn lọc** (selective commit) — chỉ commit những gì liên quan với nhau.

### 1.3 Repository (Kho lưu trữ)

Đây là **cơ sở dữ liệu** của Git, nằm trong thư mục `.git/`. Khi bạn `git commit`, Git lấy snapshot từ Staging Area và lưu vĩnh viễn vào đây.

```bash
git commit -m "feat: them tinh nang dang nhap"
# -> Tạo 1 commit mới trong Repository
# -> Commit này sẽ tồn tại MÃI MÃI (trừ khi bạn cố ý xoá)
```

### Toàn cảnh dòng chảy

```
Bạn sửa file  --->  git add  --->  git commit
    |                  |               |
    v                  v               v
 Working           Staging         Repository
 Directory          Area           (.git/)
    |                  |               |
    |   "Tôi đã sửa   |  "Tôi muốn   |  "Đã lưu thành
    |    xong"         |   commit      |   công vào
    |                  |   những       |   lịch sử"
    |                  |   thay đổi    |
    |                  |   này"        |
```

---

## 2. Commit là gì?

### Commit = Snapshot, không phải Diff

Nhiều người nghĩ commit là "lưu sự thay đổi". **Sai.**

Commit là **ảnh chụp toàn bộ trạng thái** của dự án tại một thời điểm.

```
Commit A:  [index.html v1] [style.css v1] [app.js v1]
    |
    v
Commit B:  [index.html v2] [style.css v1] [app.js v1]
    |       (đã sửa)        (không đổi,    (không đổi,
    v                        link đến v1)    link đến v1)
Commit C:  [index.html v2] [style.css v2] [app.js v2]
            (link đến v2)   (đã sửa)       (đã sửa)
```

**Tương tự như save game:**

| Game                              | Git                               |
| --------------------------------- | --------------------------------- |
| Save game                         | git commit                        |
| Load game                         | git checkout                      |
| Save slot 1, 2, 3...              | Commit A, B, C...                 |
| Mỗi save slot = trạng thái đầy đủ | Mỗi commit = snapshot đầy đủ      |
| Có thể load bất kỳ save nào       | Có thể checkout bất kỳ commit nào |

Trong các sơ đồ của loạt bài này, lịch sử commit được vẽ như một **sợi dây hạt cườm**: mỗi hạt là một commit, đọc từ trái sang phải theo thời gian. Mỗi commit "nhớ" commit đứng ngay trước nó (gọi là **parent** — commit cha), nhờ vậy Git lần ngược được cả chuỗi:

```mermaid
gitGraph
    commit id: "A - init"
    commit id: "B - them CSS"
    commit id: "C - sua trang chu" tag: "main"
```

### Cấu trúc của một commit

```bash
git log --format=fuller -1
```

```
commit a1b2c3d4e5f60718293a4b5c6d7e8f9012345678  <-- SHA-1 hash (định danh duy nhất)
Author:     Nguyen Van A <nguyenvana@example.com>    <-- Người viết code
AuthorDate: Mon Mar 25 10:30:00 2025 +0700           <-- Ngày viết
Commit:     Nguyen Van A <nguyenvana@example.com>    <-- Người commit
CommitDate: Mon Mar 25 10:30:00 2025 +0700           <-- Ngày commit

    feat: them tinh nang dang nhap                   <-- Commit message
```

`git log` không in ra commit cha (parent) và tree. Muốn thấy đủ "ruột" của commit, dùng `git cat-file -p` (xem thêm mục 8):

```
$ git cat-file -p HEAD
tree b4c5d6e7...                                     <-- Snapshot toàn bộ file
parent f0e1d2c3b4a5...                               <-- Commit cha
author Nguyen Van A <nguyenvana@example.com> 1711337400 +0700
committer Nguyen Van A <nguyenvana@example.com> 1711337400 +0700

feat: them tinh nang dang nhap
```

Mỗi commit chứa:

- **SHA-1 hash** — định danh duy nhất (40 ký tự hex)
- **Author** — người viết code
- **Committer** — người tạo commit (thường là cùng 1 người)
- **Date** — thời gian
- **Parent** — commit trước đó (commit đầu tiên không có parent)
- **Tree** — snapshot của tất cả file
- **Message** — mô tả thay đổi

---

## 3. SHA-1 Hash — Định danh duy nhất

Mỗi đối tượng trong Git (commit, file, tree...) đều có một **SHA-1 hash** — chuỗi 40 ký tự hex:

```
a1b2c3d4e5f60718293a4b5c6d7e8f9012345678
```

### Tại sao dùng hash?

1. **Duy nhất:** Xác suất 2 commit có cùng hash là gần như 0
2. **Toàn vẹn:** Nếu nội dung thay đổi, hash sẽ khác — phát hiện được giả mạo
3. **Nhanh:** So sánh 2 hash để biết 2 đối tượng có giống nhau không

### Sử dụng hash trong thực tế

```bash
# Xem chi tiết 1 commit bằng full hash
git show a1b2c3d4e5f60718293a4b5c6d7e8f9012345678

# Chỉ cần 7 ký tự đầu (Git tự tìm)
git show a1b2c3d

# Xem diff giữa 2 commit
git diff a1b2c3d f4e5d6c
```

Bạn **không cần nhớ** full hash. Git chỉ cần đủ ký tự đầu để phân biệt (thường là 7 ký tự).

---

## 4. HEAD là gì?

**HEAD** là một **con trỏ** (pointer) cho Git biết: "Bạn đang ở đâu trong lịch sử?"

### Trường hợp bình thường: HEAD trỏ đến branch

```
                       HEAD
                        |
                        v
                       main
                        |
                        v
commit A <--- commit B <--- commit C
```

HEAD -> main -> commit C. Nghĩa là bạn đang ở nhánh `main`, tại commit mới nhất `C`.

### Khi bạn commit mới

```bash
git commit -m "commit D"
```

```
                                    HEAD
                                     |
                                     v
                                    main
                                     |
                                     v
commit A <--- commit B <--- commit C <--- commit D
```

HEAD vẫn trỏ đến `main`, nhưng `main` tiến lên commit D.

:::info[Ẩn dụ: HEAD là chấm đỏ "Bạn đang ở đây" trên bản đồ]

Ở trung tâm thương mại luôn có tấm bản đồ với chấm đỏ **"Bạn đang ở đây"**. HEAD chính là chấm đỏ đó: nó cho Git biết commit tiếp theo sẽ được gắn **nối sau** commit nào, và nhãn nhánh nào sẽ được dời theo. Thường thì chấm đỏ không dán thẳng lên commit mà dán lên **nhãn nhánh** (`main`), nhãn nhánh mới dán lên commit.

:::

Cùng một lệnh `git commit`, trước và sau (nhãn `main` — và HEAD đi theo — trượt từ C sang D):

```mermaid
gitGraph
    commit id: "A"
    commit id: "B"
    commit id: "C" tag: "TRƯỚC: HEAD → main"
    commit id: "D" type: HIGHLIGHT tag: "SAU: HEAD → main"
```

### Xem HEAD đang ở đâu

```bash
# Xem HEAD
cat .git/HEAD
# ref: refs/heads/main   <-- HEAD trỏ đến branch main

# Xem commit mà HEAD đang trỏ đến
git rev-parse HEAD
# a1b2c3d4e5f6...
```

### Các cách tham chiếu tương đối từ HEAD

```bash
HEAD          # Commit hiện tại
HEAD~1        # Commit trước đó 1 bước (parent)
HEAD~2        # Commit trước đó 2 bước (grandparent)
HEAD~3        # Commit trước đó 3 bước

# Ví dụ:
git show HEAD       # Xem commit hiện tại
git show HEAD~1     # Xem commit trước
git diff HEAD~2     # So sánh với 2 commit trước
```

```
HEAD~3 <--- HEAD~2 <--- HEAD~1 <--- HEAD
commit A     commit B     commit C    commit D
```

---

## 5. Branch (Nhánh)

### Branch chỉ là một pointer

Đây là điều nhiều người bất ngờ: **branch trong Git chỉ là một file nhỏ chứa hash của commit**. Không có "copy code", không có "thư mục riêng".

```bash
# Xem nội dung của branch
cat .git/refs/heads/main
# a1b2c3d4e5f6...   <-- Chỉ là 1 dòng hash!
```

### Tại sao branch rẻ và nhanh?

Vì tạo branch = tạo 1 file 41 bytes (40 ký tự hash + newline). So sánh:

| Hệ thống | Tạo branch           | Kích thước |
| -------- | -------------------- | ---------- |
| SVN      | Copy toàn bộ thư mục | Hàng MB-GB |
| Git      | Tạo 1 file 41 bytes  | 41 bytes   |

### Branch hoạt động như thế nào

```
                       HEAD
                        |
                        v
                       main
                        |
                        v
commit A <--- commit B <--- commit C
```

Tạo branch mới:

```bash
git branch feature
```

```
                       HEAD
                        |
                        v
                       main
                        |
                        v
commit A <--- commit B <--- commit C
                              ^
                              |
                           feature
```

Giờ cả `main` và `feature` đều trỏ đến commit C. Chuyển sang `feature`:

```bash
git checkout feature
```

```
                       main
                        |
                        v
commit A <--- commit B <--- commit C
                              ^
                              |
                           feature
                              ^
                              |
                             HEAD
```

HEAD chuyển sang `feature`. Commit mới sẽ tiến `feature` lên:

```bash
git commit -m "them tinh nang moi"
```

```
                       main
                        |
                        v
commit A <--- commit B <--- commit C
                              \
                               \
                                commit D
                                  ^
                                  |
                               feature
                                  ^
                                  |
                                 HEAD
```

`main` vẫn ở commit C. `feature` tiến lên commit D. Đây là cách Git hỗ trợ **làm việc song song** trên nhiều nhánh.

:::info[Ẩn dụ: branch là tờ giấy nhớ dán lên một hạt cườm]

Branch không phải một "bản sao thư mục" mà chỉ là **tờ giấy nhớ có ghi tên** (`main`, `feature`) dán lên một commit. Tạo branch = viết thêm một tờ giấy nhớ, dán vào hạt đang đứng. Commit trên branch nào thì tờ giấy nhớ của branch đó **tự bóc ra dán sang hạt mới**; các tờ khác đứng yên.

:::

Ba bước trên (`git branch feature` → `git checkout feature` → `git commit`) vẽ lại bằng gitGraph. **Trước** khi commit, hai nhãn chồng lên nhau ở C:

```mermaid
gitGraph
    commit id: "A"
    commit id: "B"
    commit id: "C" tag: "main = feature (HEAD)"
```

**Sau** khi commit trên `feature`: nhãn `feature` tiến sang D, nhãn `main` vẫn ở C. Không có file nào bị sao chép, chỉ có thêm một commit và một nhãn được dời:

```mermaid
gitGraph
    commit id: "A"
    commit id: "B"
    commit id: "C" tag: "main"
    branch feature
    checkout feature
    commit id: "D" tag: "feature (HEAD)"
```

---

## 6. Detached HEAD

### Khi nào xảy ra?

Khi bạn checkout trực tiếp một commit (thay vì một branch):

```bash
git checkout a1b2c3d
# Warning: You are in 'detached HEAD' state...
```

```
                       main
                        |
                        v
commit A <--- commit B <--- commit C
   ^
   |
  HEAD        <-- HEAD KHÔNG trỏ đến branch nào!
(detached)
```

### Tại sao nguy hiểm?

Nếu bạn tạo commit trong trạng thái detached HEAD:

```bash
git commit -m "thu nghiem"
```

```
                       main
                        |
                        v
commit A <--- commit B <--- commit C
   \
    \
     commit X   <-- Commit này không thuộc branch nào!
       ^
       |
      HEAD
```

Khi bạn chuyển về `main`, commit X sẽ **không có branch nào trỏ đến** và có thể bị Git dọn dẹp (garbage collect) sau một thời gian.

### Cách xử lý

```bash
# Cách 1: Tạo branch mới tại vị trí hiện tại
git checkout -b save-my-work

# Cách 2: Quay về branch cũ (bỏ mất commit trong detached HEAD)
git checkout main

# Cách 3: Nếu đã quay về main nhưng muốn cứu commit cũ
git reflog                    # Tìm hash của commit đã mất
git branch save-my-work abc123   # Tạo branch tại commit đó
```

**Quy tắc:** Luôn làm việc trên branch, tránh trạng thái detached HEAD trừ khi chỉ muốn **xem** code cũ.

### Minh hoạ: cứu commit X bằng một nhãn mới

Commit X tạo ra khi đang detached giống một **tấm ảnh không được dán vào trang album nào** — vẫn còn trong hộp, nhưng không có nhãn để tìm lại, lâu ngày sẽ bị dọn. Chạy `git checkout -b save-my-work` (hoặc `git branch save-my-work <hash>` sau khi tìm bằng `reflog`) chính là **dán nhãn** cho nó:

```mermaid
gitGraph
    commit id: "A"
    branch save-my-work
    checkout save-my-work
    commit id: "X thu nghiem" type: HIGHLIGHT tag: "save-my-work"
    checkout main
    commit id: "B"
    commit id: "C" tag: "main"
```

| Sau khi rời khỏi X…             | Không tạo branch                     | Có tạo branch `save-my-work`       |
| ------------------------------- | ------------------------------------ | ---------------------------------- |
| `git log --all` có thấy X không | Không                                | Có                                 |
| Tìm lại X bằng cách nào         | Chỉ qua `git reflog` (nếu còn kịp)   | `git checkout save-my-work`        |
| Git có tự dọn X không           | Có thể, sau một thời gian (gc)       | Không bao giờ, vì có nhãn trỏ tới  |

---

## 7. Sơ đồ Commit History

Commit history trong Git là một **Directed Acyclic Graph (DAG)** — đồ thị có hướng, không có vòng lặp.

### Lịch sử tuyến tính (đơn giản)

```
commit A <--- commit B <--- commit C <--- commit D
(init)                                    (HEAD -> main)
```

Mỗi commit trỏ về parent của nó (commit trước đó).

### Lịch sử có branching và merging

```
commit A <--- commit B <--- commit C <--- commit F (merge) <--- commit G
                \                          /                     (HEAD -> main)
                 \                        /
                  commit D <--- commit E
                  (feature branch)
```

Commit F là **merge commit** — có 2 parent (C và E).

Cùng lịch sử đó vẽ bằng gitGraph — dễ nhìn hơn, và là kiểu sơ đồ dùng xuyên suốt các bài sau:

```mermaid
gitGraph
    commit id: "A"
    commit id: "B"
    branch feature
    checkout feature
    commit id: "D"
    commit id: "E" tag: "feature"
    checkout main
    commit id: "C"
    merge feature id: "F (merge)"
    commit id: "G" tag: "HEAD → main"
```

### Đọc lịch sử bằng `git log --graph`

```bash
git log --oneline --graph --all
```

```
*   f1a2b3c (HEAD -> main) Merge branch 'feature'
|\
| * e4d5c6b (feature) them validation
| * d7e8f9a them form login
|/
* c1b2a3d sua trang chu
* b4c5d6e them CSS
* a7b8c9d init project
```

Cách đọc:

- `*` = 1 commit
- `|` = dòng lịch sử của 1 branch
- `\` và `/` = branch tách ra hoặc merge vào
- `(HEAD -> main)` = HEAD đang ở branch main tại commit này

---

## 8. Thư mục .git

Khi bạn `git init`, Git tạo thư mục `.git/` — **toàn bộ "bộ não" của Git** nằm ở đây.

```bash
ls -la .git/
```

```
.git/
├── HEAD            # Con trỏ đến branch hiện tại
├── config          # Cấu hình local của repo này
├── description     # Mô tả repo (dùng cho GitWeb, ít khi cần)
├── hooks/          # Scripts chạy tự động (pre-commit, post-commit...)
├── index           # Staging Area (binary file)
├── info/           # Thông tin bổ sung
│   └── exclude     # Gitignore local (không commit)
├── objects/        # TẤT CẢ dữ liệu: commits, trees, blobs
│   ├── pack/       # Dữ liệu đã nén
│   └── info/
└── refs/           # BRANCH và TAG pointers
    ├── heads/      # Local branches
    │   └── main    # File nhỏ chứa hash của commit mới nhất trên main
    ├── tags/       # Tags
    └── remotes/    # Remote tracking branches
        └── origin/
            └── main
```

### Các thành phần quan trọng

| Thư mục/File    | Chức năng               | Ghi chú                                 |
| --------------- | ----------------------- | --------------------------------------- |
| `HEAD`          | Trỏ đến branch hiện tại | `ref: refs/heads/main`                  |
| `objects/`      | Lưu tất cả dữ liệu      | commits, files (blobs), trees           |
| `refs/heads/`   | Các branch local        | Mỗi branch = 1 file chứa hash           |
| `refs/remotes/` | Các branch remote       | Tracking branches                       |
| `refs/tags/`    | Các tag                 | Đánh dấu phiên bản                      |
| `index`         | Staging Area            | File binary, dùng `git ls-files` để đọc |
| `config`        | Config local            | Ghi đè global config                    |
| `hooks/`        | Hook scripts            | Tự động chạy khi commit, push...        |

### Xem nội dung objects

Git lưu 3 loại object:

```
+-----------+     +-----------+     +-----------+
|   BLOB    |     |   TREE    |     |  COMMIT   |
| (nội dung |     | (thư mục) |     | (snapshot)|
|  file)    |     |           |     |           |
| "hello"   |     | blob a1.. |     | tree b2.. |
|           |     | blob c3.. |     | parent d4 |
|           |     | tree e5.. |     | author... |
+-----------+     +-----------+     +-----------+
```

- **Blob:** Nội dung của 1 file (không có tên file!)
- **Tree:** Giống như thư mục — chứa danh sách blobs và trees con
- **Commit:** Metadata + pointer đến tree (snapshot)

```bash
# Xem loại object
git cat-file -t a1b2c3d
# commit

# Xem nội dung object
git cat-file -p a1b2c3d
# tree b4c5d6e7...
# parent f8a9b0c1...
# author Nguyen Van A <email> 1711234567 +0700
# committer Nguyen Van A <email> 1711234567 +0700
#
# feat: them tinh nang dang nhap
```

**Bạn không cần nhớ chi tiết này cho công việc hàng ngày.** Nhưng hiểu cách Git lưu dữ liệu sẽ giúp bạn debug khi gặp vấn đề.

---

## 9. File States trong Git

Tổng hợp trạng thái của file trong Git:

```
                    Untracked        Unmodified       Modified         Staged
                        |                |                |               |
                        |   git add      |                |               |
                        |--------------->|                |               |
                        |                |   Sửa file     |               |
                        |                |--------------->|               |
                        |                |                |   git add     |
                        |                |                |-------------->|
                        |                |                |               |
                        |                |   git commit   |               |
                        |                |<-------------------------------|
                        | git rm --cached|                |               |
                        |<---------------|                |               |
                        |                |                |               |
```

Vòng đời của một file trong Git dưới dạng sơ đồ trạng thái:

```mermaid
stateDiagram-v2
    [*] --> Untracked: tạo file mới
    Untracked --> Staged: git add
    Staged --> Unmodified: git commit
    Unmodified --> Modified: sửa file
    Modified --> Staged: git add
    Unmodified --> Untracked: git rm --cached
```

| Trạng thái     | Mô tả                             | Hiển thị trong `git status`       |
| -------------- | --------------------------------- | --------------------------------- |
| **Untracked**  | File mới, Git chưa quản lý        | `Untracked files:` (đỏ)           |
| **Unmodified** | File không thay đổi               | Không hiển thị                    |
| **Modified**   | File đã sửa nhưng chưa stage      | `Changes not staged:` (đỏ)        |
| **Staged**     | File đã được add, sẵn sàng commit | `Changes to be committed:` (xanh) |

### Đầy đủ hơn: các đường "quay lui"

Sơ đồ ở trên chỉ vẽ chiều "đi tới". Thực tế bạn còn hay cần **lùi lại**: lỡ `add` nhầm, hoặc muốn bỏ hết sửa đổi. Sơ đồ dưới bổ sung các đường đó (lệnh `git restore` được giải thích kỹ ở bài sau):

```mermaid
stateDiagram-v2
    [*] --> Untracked: tạo file mới
    Untracked --> Staged: git add
    Staged --> Untracked: git rm --cached (file chưa từng commit)
    Staged --> Unmodified: git commit
    Unmodified --> Modified: sửa file
    Modified --> Unmodified: git restore (bỏ sửa đổi)
    Modified --> Staged: git add
    Staged --> Modified: git restore --staged (gỡ khỏi staging)
    Unmodified --> Untracked: git rm --cached
    Unmodified --> [*]: git rm (xoá hẳn)
```

Mẹo đọc: mũi tên nào đi **về phía Unmodified** là "dọn sạch", mũi tên nào đi **về phía Staged** là "chuẩn bị chụp".

---

## 10. Lỗi thường gặp

### Lỗi 1: Không hiểu tại sao cần `git add` trước `git commit`

```bash
# Người mới thường hỏi: "Tại sao không commit thẳng?"
# Trả lời: Staging Area cho phép bạn CHỌN LỌC thay đổi

# Ví dụ: bạn sửa 5 file nhưng chỉ muốn commit 2 file
git add file1.js file2.js
git commit -m "feat: them tinh nang A"
# -> Chỉ 2 file được commit

# 3 file còn lại commit riêng
git add file3.js file4.js file5.js
git commit -m "fix: sua loi B"
```

### Lỗi 2: Nhầm HEAD với branch

```
HEAD  = "Bạn đang ở đâu?"     (con trỏ di động)
Branch = "Nhóm commit này"    (tên nhãn cho commit)

HEAD thường trỏ đến 1 branch.
Khi commit, branch tiến lên, HEAD đi theo.
```

### Lỗi 3: Nghĩ branch là "copy" của code

```
SAI:  "Tạo branch = copy toàn bộ code"
ĐÚNG: "Tạo branch = tạo 1 pointer 41 bytes"

Git KHÔNG copy bất kỳ file nào khi tạo branch.
Tất cả branches chia sẻ cùng dữ liệu objects.
```

### Lỗi 4: Hoảng sợ khi thấy "detached HEAD"

```bash
# Không phải lỗi! Chỉ là cảnh báo.
# Git nói: "Bạn đang không ở trên branch nào"

# Cách xử lý an toàn:
git checkout -b ten-branch-moi    # Tạo branch tại đây
# hoặc
git checkout main                  # Quay về branch cũ
```

### Lỗi 5: Xoá thư mục .git

```bash
# TUYỆT ĐỐI KHÔNG XOÁ .git/
rm -rf .git   # MẤT HẾT LỊCH SỬ!

# .git chứa TOÀN BỘ lịch sử, branches, configs
# Xoá nó = mất hết mọi thứ, chỉ còn file hiện tại
```

---

## Tổng kết

| Khái niệm         | Mô tả               | Ví von                        |
| ----------------- | ------------------- | ----------------------------- |
| Working Directory | Nơi bạn làm việc    | Bàn làm việc                  |
| Staging Area      | Nơi chuẩn bị commit | Giỏ hàng trước khi thanh toán |
| Repository        | Nơi lưu vĩnh viễn   | Kho hàng sau khi thanh toán   |
| Commit            | Snapshot của dự án  | Save game                     |
| SHA-1 Hash        | Định danh duy nhất  | Số CMND của commit            |
| HEAD              | Vị trí hiện tại     | "Bạn đang ở đây"              |
| Branch            | Pointer đến commit  | Nhãn dán trang sách           |
| .git/             | Cơ sở dữ liệu Git   | "Bộ não" của Git              |

**Bước tiếp theo:** Thực hành các lệnh Git cơ bản — init, add, commit, log, diff.
