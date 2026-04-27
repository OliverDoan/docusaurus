---
sidebar_position: 3
title: "3. Git Bisect và Debug — Tìm commit gây bug"
---

# Git Bisect và Debug — Tìm commit gây bug

Bạn phát hiện bug nhưng không biết nó xuất hiện từ commit nào? Với hàng trăm commits, việc kiểm tra từng cái sẽ mất cả ngày. Git cung cấp những công cụ debug mạnh mẽ: **bisect** dùng binary search tìm commit gây bug trong O(log n), **blame** cho biết ai sửa dòng nào, và **log -S** tìm kiếm thay đổi trong lịch sử.

---


---

## Mục lục

- [1. Git Bisect — Binary Search tìm commit gây bug](#1-git-bisect-binary-search-tìm-commit-gây-bug)
- [2. Git Blame — Ai sửa dòng nào?](#2-git-blame-ai-sửa-dòng-nào)
- [3. Git Log Debugging](#3-git-log-debugging)
- [4. So sánh: Khi nào dùng bisect vs blame vs log -S](#4-so-sánh-khi-nào-dùng-bisect-vs-blame-vs-log-s)
- [5. Kỹ thuật debug nâng cao](#5-kỹ-thuật-debug-nâng-cao)
- [6. Lỗi thường gặp](#6-lỗi-thường-gặp)
- [7. Câu hỏi phỏng vấn](#7-câu-hỏi-phỏng-vấn)
- [Tóm tắt](#tóm-tắt)

---

## 1. Git Bisect — Binary Search tìm commit gây bug

### Bisect là gì?

`git bisect` dùng thuật toán **binary search** để tìm commit đầu tiên gây ra bug. Thay vì kiểm tra lần lượt 100 commits (O(n)), bisect chỉ cần kiểm tra ~7 commits (O(log n)).

```
Tại sao hiệu quả?

100 commits → log2(100) ≈ 7 bước
1000 commits → log2(1000) ≈ 10 bước
10000 commits → log2(10000) ≈ 14 bước

Thay vì kiểm tra hàng nghìn commits, bạn chỉ cần ~14 bước!
```

### Cách hoạt động (ASCII diagram)

```
Commits:  A --- B --- C --- D --- E --- F --- G --- H --- I --- J
          |                                                     |
          GOOD (không bug)                                     BAD (có bug)

Bước 1: Bisect chọn giữa → E
         A --- B --- C --- D --- [E] --- F --- G --- H --- I --- J
                                  ↑
                             Test E → BAD

Bước 2: Bug ở A..E, chọn giữa → C
         A --- B --- [C] --- D --- E
                      ↑
                 Test C → GOOD

Bước 3: Bug ở C..E, chọn giữa → D
         C --- [D] --- E
                ↑
           Test D → BAD

Bước 4: Bug ở C..D → D là commit đầu tiên gây bug!
         KẾT QUẢ: D introduced the bug
```

### Quy trình sử dụng

```bash
# Bước 1: Bắt đầu bisect
git bisect start

# Bước 2: Đánh dấu commit hiện tại là BAD (có bug)
git bisect bad

# Bước 3: Đánh dấu commit GOOD (biết chắc không có bug)
# Ví dụ: bản release tuần trước hoạt động tốt
git bisect good v1.2.0
# Hoặc dùng SHA:
git bisect good abc1234

# Git sẽ checkout commit ở giữa và báo:
# Bisecting: 50 revisions left to test after this (roughly 6 steps)
# [def5678...] commit message here
```

```bash
# Bước 4: Test commit hiện tại
# (chạy ứng dụng, chạy test, kiểm tra bug...)

# Nếu commit này CÓ bug:
git bisect bad

# Nếu commit này KHÔNG có bug:
git bisect good

# Nếu commit này KHÔNG test được (ví dụ: build lỗi):
git bisect skip

# Git tự động checkout commit tiếp theo để test
# Lặp lại cho đến khi tìm ra commit gây bug
```

```bash
# Kết quả cuối cùng:
# abc1234 is the first bad commit
# commit abc1234
# Author: developer <dev@example.com>
# Date:   Mon Jan 15 10:30:00 2024
#
#     feat: thay đổi logic tính giá
#
#  src/pricing.js | 15 +++++++++------
#  1 file changed, 9 insertions(+), 6 deletions(-)

# Bước 5: Kết thúc bisect, quay về branch ban đầu
git bisect reset
```

### Ví dụ thực tế: Tìm commit làm hỏng test

```bash
# Test "npm test" đang fail, muốn tìm commit gây ra
git bisect start

# Commit hiện tại fail
git bisect bad HEAD

# 2 tuần trước test vẫn pass
git bisect good HEAD~50

# Bisecting: 25 revisions left to test (roughly 5 steps)

# Chạy test
npm test
# => PASS
git bisect good

# Bisecting: 12 revisions left to test (roughly 4 steps)
npm test
# => FAIL
git bisect bad

# ... tiếp tục 3-4 bước nữa ...

# Kết quả:
# a1b2c3d is the first bad commit
# feat: refactor pricing module

git bisect reset
# Giờ bạn biết chính xác commit nào gây bug!
```

### Tự động hóa với git bisect run

Thay vì test thủ công, bạn có thể viết script để bisect tự động:

```bash
# Tự động bisect với npm test
git bisect start
git bisect bad HEAD
git bisect good v1.0.0
git bisect run npm test
# Git tự động chạy "npm test" cho mỗi commit
# test pass → good, test fail → bad
# Kết quả: tìm ra commit gây bug tự động!
```

```bash
# Tự động bisect với script tùy chỉnh
git bisect start HEAD v1.0.0
git bisect run ./test-bug.sh
```

Script `test-bug.sh` cần:
- Exit code 0 = GOOD (không bug)
- Exit code 1-124, 126, 127 = BAD (có bug)
- Exit code 125 = SKIP (không test được)

```bash
#!/bin/bash
# test-bug.sh — Kiểm tra xem bug cụ thể có xuất hiện không

# Build project (nếu build lỗi → skip)
npm run build 2>/dev/null || exit 125

# Chạy test cụ thể
npm test -- --testPathPattern="pricing" 2>/dev/null
# Exit code tự động: 0 = pass (good), 1 = fail (bad)
```

```bash
# Cho phép thực thi script
chmod +x test-bug.sh

# Chạy bisect tự động
git bisect start HEAD v1.0.0
git bisect run ./test-bug.sh

# Ngồi chờ kết quả, không cần làm gì!
```

---

## 2. Git Blame — Ai sửa dòng nào?

### Cú pháp cơ bản

```bash
git blame src/pricing.js
```

Output:

```
a1b2c3d4 (Nguyen Van A 2024-01-10 10:30:15 +0700  1) function calculatePrice(item) {
f5e6d7c8 (Tran Thi B   2024-01-12 14:22:33 +0700  2)   const basePrice = item.price;
a1b2c3d4 (Nguyen Van A 2024-01-10 10:30:15 +0700  3)   const tax = basePrice * 0.1;
9876abcd (Le Van C     2024-01-15 09:15:00 +0700  4)   const discount = getDiscount(item);  // commit gây bug?
a1b2c3d4 (Nguyen Van A 2024-01-10 10:30:15 +0700  5)   return basePrice + tax - discount;
f5e6d7c8 (Tran Thi B   2024-01-12 14:22:33 +0700  6) }
```

Mỗi dòng hiển thị:
- **SHA** commit sửa dòng đó lần cuối
- **Tác giả** sửa dòng đó
- **Ngày giờ** sửa
- **Số dòng** và nội dung

### Blame range cụ thể

```bash
# Chỉ blame dòng 10-20
git blame -L 10,20 src/pricing.js

# Blame từ dòng 10 đến hết file
git blame -L 10, src/pricing.js

# Blame dòng chứa function calculatePrice
git blame -L '/function calculatePrice/,/^}/' src/pricing.js
```

### Bỏ qua formatting commits

Khi team chạy prettier/eslint format toàn bộ codebase, `git blame` sẽ hiện commit formatting thay vì commit thực sự sửa logic. Giải pháp:

```bash
# Bỏ qua commit cụ thể khi blame
git blame --ignore-rev abc1234 src/pricing.js

# Bỏ qua nhiều commits
git blame --ignore-revs-file .git-blame-ignore-revs src/pricing.js
```

Tạo file `.git-blame-ignore-revs`:

```bash
# File: .git-blame-ignore-revs
# Formatting commits để bỏ qua khi blame

# 2024-01-20: Chạy prettier toàn bộ codebase
abc1234def5678901234567890abcdef12345678

# 2024-02-15: Đổi indent từ tab sang space
fedcba9876543210fedcba9876543210fedcba98
```

```bash
# Cấu hình Git tự động dùng file này
git config blame.ignoreRevsFile .git-blame-ignore-revs
# Giờ git blame tự động bỏ qua formatting commits!
```

### VS Code GitLens

Nếu dùng VS Code, extension **GitLens** hiển thị blame ngay trên editor:

```
Tính năng GitLens:
- Blame inline: hiện tác giả + ngày bên cạnh mỗi dòng
- Hover: xem chi tiết commit khi rê chuột
- File history: xem toàn bộ lịch sử thay đổi file
- Line history: xem lịch sử thay đổi của dòng cụ thể
- Compare: so sánh file giữa các commits
```

---

## 3. Git Log Debugging

### Pickaxe search: Tìm commit thay đổi string cụ thể

```bash
# Tìm commits thêm hoặc xóa chuỗi "calculateDiscount"
git log -S "calculateDiscount"

# Kết quả: danh sách commits mà chuỗi đó xuất hiện/biến mất
# commit abc1234
# Author: Developer
# Date: ...
#     feat: thêm tính năng giảm giá
#
# commit def5678
# Author: Developer
# Date: ...
#     refactor: đổi tên function tính giảm giá
```

```bash
# Kết hợp với --oneline để gọn hơn
git log -S "calculateDiscount" --oneline
# abc1234 feat: thêm tính năng giảm giá
# def5678 refactor: đổi tên function tính giảm giá

# Xem diff luôn
git log -S "calculateDiscount" -p
# Hiển thị diff chi tiết cho mỗi commit
```

### Regex search: Tìm theo pattern

```bash
# Tìm commits thay đổi dòng match regex
git log -G "price\s*\*\s*[0-9]" --oneline
# Tìm dòng code dạng "price * <số>"

# Khác biệt -S vs -G:
# -S: Tìm commits mà SỐ LẦN xuất hiện chuỗi thay đổi (thêm/xóa)
# -G: Tìm commits mà DIFF chứa dòng match regex (sửa đổi)
```

### Tìm lịch sử file đã xóa

```bash
# File đã bị xóa khỏi repo, muốn xem lịch sử
git log --all --full-history -- src/old-module.js

# Tìm commit xóa file
git log --diff-filter=D -- src/old-module.js
# --diff-filter=D: chỉ hiện commits xóa file

# Khôi phục file đã xóa
git log --diff-filter=D --name-only -- src/old-module.js
# Tìm SHA commit xóa file (ví dụ: abc1234)

# Checkout file từ commit TRƯỚC khi xóa
git checkout abc1234~1 -- src/old-module.js
# abc1234~1 = parent của commit xóa = lần cuối file tồn tại
```

### Xem diff trong log

```bash
# Log kèm diff chi tiết
git log -p

# Log kèm diff, giới hạn 5 commits gần nhất
git log -p -5

# Log kèm thống kê thay đổi (số dòng thêm/xóa)
git log --stat

# Log kèm tên file thay đổi
git log --name-only

# Log kèm trạng thái file (Added, Modified, Deleted)
git log --name-status
```

### Kết hợp nhiều filter

```bash
# Tìm commits của tác giả cụ thể, trong khoảng thời gian, sửa file cụ thể
git log \
  --author="Nguyen" \
  --after="2024-01-01" \
  --before="2024-02-01" \
  -- src/pricing.js

# Tìm commits có chứa "bug" hoặc "fix" trong message
git log --grep="bug\|fix" --oneline

# Tìm merge commits gây ra vấn đề
git log --merges --oneline
```

---

## 4. So sánh: Khi nào dùng bisect vs blame vs log -S

| Tình huống | Công cụ | Lý do |
|-----------|---------|-------|
| "Bug xuất hiện lúc nào?" | `git bisect` | Binary search nhanh, tìm chính xác commit |
| "Ai sửa dòng này?" | `git blame` | Hiển thị tác giả và commit cho từng dòng |
| "Function này được thêm/xóa ở commit nào?" | `git log -S` | Tìm commit thay đổi sự tồn tại của chuỗi |
| "Dòng code dạng X bị sửa ở đâu?" | `git log -G` | Tìm commit match regex trong diff |
| "File này đã bị xóa khi nào?" | `git log --diff-filter=D` | Filter commits theo loại thay đổi |
| "Commit nào sửa file pricing.js?" | `git log -- pricing.js` | Lịch sử commits ảnh hưởng file cụ thể |

### Workflow debug tổng hợp

```
Phát hiện bug
    │
    ├── Biết bug ở dòng/file nào?
    │   ├── Có → git blame <file>
    │   │        → Tìm commit sửa dòng đó
    │   │        → git show <sha> để xem toàn bộ thay đổi
    │   │
    │   └── Không → git bisect
    │              → Binary search tìm commit gây bug
    │
    ├── Muốn tìm khi nào function bị xóa/thêm?
    │   └── git log -S "function_name"
    │
    └── Muốn tìm khi nào logic thay đổi?
        └── git log -G "regex_pattern" -p
```

---

## 5. Kỹ thuật debug nâng cao

### Bisect với test tự động phức tạp

```bash
#!/bin/bash
# bisect-test.sh — Script bisect phức tạp hơn

# Bước 1: Cài dependencies (một số commit có thể thiếu package)
npm install 2>/dev/null || exit 125

# Bước 2: Build (skip nếu build fail)
npm run build 2>/dev/null || exit 125

# Bước 3: Chạy test cụ thể
npm test -- --testPathPattern="pricing" --silent 2>/dev/null
TEST_EXIT=$?

# Bước 4: Dọn dẹp
npm run clean 2>/dev/null

exit $TEST_EXIT
```

### Blame qua rename

```bash
# Theo dõi blame ngay cả khi file bị rename
git blame -C src/new-name.js
# -C: theo dõi code được copy/move từ file khác

# Theo dõi mạnh hơn (tìm cả code copy từ file khác)
git blame -C -C src/new-name.js

# Theo dõi tối đa (tìm trong toàn bộ codebase)
git blame -C -C -C src/new-name.js
```

### Log theo dõi function cụ thể

```bash
# Xem lịch sử thay đổi của function calculatePrice
git log -L ':calculatePrice:src/pricing.js'
# Git tự động tìm phạm vi function và hiển thị diff qua các commit

# Output: mỗi commit sửa function calculatePrice, kèm diff
```

---

## 6. Lỗi thường gặp

### Lỗi 1: Quên git bisect reset

```bash
# Sau khi bisect xong, bạn ở trạng thái "detached HEAD"
git bisect start
git bisect bad
git bisect good v1.0.0
# ... tìm xong ...

# QUÊN reset → đang ở detached HEAD, mọi commit sẽ "mồ côi"
git commit -m "fix something"  # Commit này sẽ bị mất!

# LUÔN NHỚ:
git bisect reset
# Quay về branch ban đầu
```

### Lỗi 2: Bisect khi có uncommitted changes

```bash
git bisect start
# error: Your local changes would be overwritten by checkout.
# Please commit your changes or stash them before you switch branches.

# FIX: Stash trước khi bisect
git stash
git bisect start
# ... bisect xong ...
git bisect reset
git stash pop
```

### Lỗi 3: Blame hiển thị formatting commit

```bash
git blame src/app.js
# Mọi dòng đều hiện: abc1234 (Bot 2024-01-20) — commit prettier

# FIX: Tạo .git-blame-ignore-revs
echo "abc1234..." >> .git-blame-ignore-revs
git config blame.ignoreRevsFile .git-blame-ignore-revs

# Bây giờ blame hiển thị commit logic thực sự
```

### Lỗi 4: log -S không tìm thấy vì case sensitive

```bash
# Mặc định -S phân biệt hoa/thường
git log -S "calculateprice"   # Không tìm thấy!
git log -S "calculatePrice"   # Tìm thấy!

# Dùng -i để case insensitive (chỉ hoạt động với -G, không phải -S)
git log -G "(?i)calculateprice"
# Hoặc dùng regex cụ thể:
git log -G "[cC]alculate[pP]rice"
```

### Lỗi 5: Bisect run script không executable

```bash
git bisect run ./test.sh
# error: cannot run ./test.sh: Permission denied

# FIX:
chmod +x ./test.sh
git bisect run ./test.sh
```

---

## 7. Câu hỏi phỏng vấn

### Câu 1: Git bisect là gì? Tại sao nó hiệu quả?

**Trả lời:**
`git bisect` dùng thuật toán binary search để tìm commit đầu tiên gây ra bug. Bạn đánh dấu một commit "good" (không bug) và một commit "bad" (có bug), Git sẽ tự chọn commit ở giữa để bạn test. Mỗi bước loại bỏ một nửa số commits cần kiểm tra.

Hiệu quả vì độ phức tạp O(log n): với 1000 commits chỉ cần ~10 bước thay vì 1000 bước kiểm tra tuần tự. Có thể tự động hóa hoàn toàn bằng `git bisect run <script>`.

### Câu 2: Sự khác nhau giữa `git log -S` và `git log -G`?

**Trả lời:**
- `-S "string"` (pickaxe): Tìm commits mà **số lần xuất hiện** của chuỗi thay đổi. Nghĩa là chuỗi được thêm mới hoặc xóa đi. Nếu chuỗi chỉ bị di chuyển (refactor) mà số lần xuất hiện không đổi, `-S` sẽ bỏ qua.
- `-G "regex"`: Tìm commits mà **diff** chứa dòng match regex. Bất kỳ thay đổi nào có dòng match đều được hiển thị, kể cả khi chỉ sửa nhỏ trong dòng đó.

Tóm lại: `-S` tìm khi chuỗi xuất hiện/biến mất, `-G` tìm khi dòng chứa pattern bị sửa.

### Câu 3: Làm sao dùng git blame hiệu quả khi team hay format code?

**Trả lời:**
Tạo file `.git-blame-ignore-revs` chứa SHA của các formatting commits, rồi cấu hình:
```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```
Git blame sẽ bỏ qua các commits đó và hiển thị commit logic thực sự. Commit file `.git-blame-ignore-revs` vào repo để cả team dùng được. GitHub cũng hỗ trợ file này trên web UI.

### Câu 4: Giải thích quy trình git bisect từ đầu đến cuối.

**Trả lời:**
1. `git bisect start` — bắt đầu session
2. `git bisect bad` — đánh dấu commit hiện tại (hoặc chỉ định SHA) là có bug
3. `git bisect good <ref>` — đánh dấu commit không có bug
4. Git checkout commit giữa → bạn test → đánh dấu `good` hoặc `bad`
5. Lặp lại bước 4 cho đến khi Git tìm ra commit đầu tiên gây bug
6. `git bisect reset` — kết thúc, quay về branch ban đầu
7. Có thể tự động hóa bước 4 bằng `git bisect run <script>`

### Câu 5: Làm sao tìm lịch sử của file đã bị xóa?

**Trả lời:**
```bash
# Xem toàn bộ lịch sử file (kể cả sau khi bị xóa)
git log --all --full-history -- path/to/deleted-file

# Tìm commit xóa file
git log --diff-filter=D -- path/to/deleted-file

# Khôi phục file từ commit trước khi xóa
git checkout <sha-commit-xoa>~1 -- path/to/deleted-file
```
Dùng `--all` để tìm trên tất cả branches, `--full-history` để không bỏ qua history simplification.

---

## Tóm tắt

```
Tìm commit gây bug (không biết ở đâu):     git bisect start → bad/good → test
Tự động hóa bisect:                          git bisect run ./test.sh
Xem ai sửa dòng nào:                         git blame <file>
Blame bỏ qua formatting:                     .git-blame-ignore-revs
Tìm commit thêm/xóa chuỗi:                  git log -S "string"
Tìm commit sửa dòng match regex:             git log -G "regex"
Xem lịch sử file đã xóa:                     git log --all --full-history -- <file>
Xem lịch sử function cụ thể:                 git log -L ':funcName:file'
```
