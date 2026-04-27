---
sidebar_position: 2
title: "2. Git Reflog — Khôi phục dữ liệu đã mất"
---

# Git Reflog — Khôi phục dữ liệu đã mất

Bạn đã bao giờ `reset --hard` nhầm và nghĩ rằng code đã mất vĩnh viễn? Tin vui: Git gần như KHÔNG BAO GIỜ xóa dữ liệu thực sự. Bí mật nằm ở **reflog** — cuốn nhật ký ghi lại mọi thay đổi của HEAD. Đây chính là "lưới an toàn" của Git.

---


---

## Mục lục

- [1. Reflog là gì?](#1-reflog-là-gì)
- [2. Đọc output của git reflog](#2-đọc-output-của-git-reflog)
- [3. Reflog vs Log — Khác nhau cơ bản](#3-reflog-vs-log-khác-nhau-cơ-bản)
- [4. Recover lost commits sau reset --hard](#4-recover-lost-commits-sau-reset-hard)
- [5. Recover deleted branch](#5-recover-deleted-branch)
- [6. Reflog cho nhánh cụ thể](#6-reflog-cho-nhánh-cụ-thể)
- [7. Thời gian lưu trữ reflog](#7-thời-gian-lưu-trữ-reflog)
- [8. git fsck — Tìm dangling objects](#8-git-fsck-tìm-dangling-objects)
- [9. Garbage Collection: Khi nào object THỰC SỰ bị xóa?](#9-garbage-collection-khi-nào-object-thực-sự-bị-xóa)
- [10. Workflow khôi phục hoàn chỉnh](#10-workflow-khôi-phục-hoàn-chỉnh)
- [11. Mẹo thực tế](#11-mẹo-thực-tế)
- [12. Lỗi thường gặp](#12-lỗi-thường-gặp)
- [13. Câu hỏi phỏng vấn](#13-câu-hỏi-phỏng-vấn)
- [Tóm tắt](#tóm-tắt)

---

## 1. Reflog là gì?

**Reflog** (reference log) là nhật ký ghi lại MỌI lần HEAD thay đổi trên máy local của bạn. Mỗi khi bạn commit, reset, checkout, merge, rebase... Git đều ghi lại một entry trong reflog.

```
Reflog = Nhật ký di chuyển của HEAD
       = Lịch sử mọi hành động bạn làm trong repo
       = "Ctrl+Z" cho Git
```

Điểm quan trọng:
- Reflog chỉ tồn tại trên **máy local** — không được push lên remote
- Reflog giữ entries trong **90 ngày** (mặc định)
- Reflog ghi lại cả các commits mà `git log` không hiển thị

---

## 2. Đọc output của git reflog

```bash
git reflog
```

Output mẫu:

```
a1b2c3d HEAD@{0}: commit: feat: thêm trang đăng nhập
f4e5d6c HEAD@{1}: commit: fix: sửa lỗi validation
9876543 HEAD@{2}: checkout: moving from feature to main
1234567 HEAD@{3}: commit: feat: API endpoint users
abcdef0 HEAD@{4}: reset: moving to HEAD~2
7777777 HEAD@{5}: commit: chore: thêm cấu hình eslint
8888888 HEAD@{6}: commit: feat: tính năng quan trọng
```

### Giải thích từng phần

```
a1b2c3d HEAD@{0}: commit: feat: thêm trang đăng nhập
   |       |          |           |
   |       |          |           └── Message/chi tiết
   |       |          └── Loại hành động (commit, reset, checkout, merge...)
   |       └── Vị trí trong reflog (0 = gần nhất)
   └── SHA của commit tại thời điểm đó
```

### Các loại hành động phổ biến trong reflog

```
commit:         Bạn tạo commit mới
commit (amend): Bạn amend commit
reset:          Bạn dùng git reset
checkout:       Bạn chuyển branch
merge:          Bạn merge branch
rebase:         Bạn rebase
pull:           Bạn pull từ remote
cherry-pick:    Bạn cherry-pick commit
```

---

## 3. Reflog vs Log — Khác nhau cơ bản

| Tiêu chí | `git log` | `git reflog` |
|-----------|-----------|--------------|
| Hiển thị gì | Lịch sử commits trên branch hiện tại | MỌI thay đổi HEAD (cả commits đã bị "xóa") |
| Phạm vi | Chỉ commits reachable từ HEAD | Tất cả, kể cả unreachable |
| Shared | Có (push lên remote) | Không (chỉ local) |
| Thời gian lưu | Vĩnh viễn (nếu reachable) | 90 ngày (mặc định) |
| Sắp xếp | Theo thời gian commit | Theo thời gian hành động |
| Dùng khi nào | Xem lịch sử bình thường | Khôi phục dữ liệu, debug |

Ví dụ minh họa:

```bash
# Tạo 3 commits
git commit -m "A"   # commit A
git commit -m "B"   # commit B
git commit -m "C"   # commit C

# Reset xóa 2 commits cuối
git reset --hard HEAD~2

# git log chỉ thấy:
git log --oneline
# aaa1111 A

# git reflog thấy MỌI THỨ:
git reflog
# aaa1111 HEAD@{0}: reset: moving to HEAD~2
# ccc3333 HEAD@{1}: commit: C          ← vẫn ở đây!
# bbb2222 HEAD@{2}: commit: B          ← vẫn ở đây!
# aaa1111 HEAD@{3}: commit: A
```

---

## 4. Recover lost commits sau reset --hard

Đây là tình huống phổ biến nhất. Bạn `reset --hard` nhầm và nghĩ code mất rồi.

### Bước 1: Xem reflog để tìm commit

```bash
git reflog
# a1b2c3d HEAD@{0}: reset: moving to HEAD~3
# f4e5d6c HEAD@{1}: commit: feat: hoàn thành module thanh toán  ← CẦN TÌM
# 9876543 HEAD@{2}: commit: feat: thêm giỏ hàng
# 1234567 HEAD@{3}: commit: feat: trang sản phẩm
```

### Bước 2: Khôi phục

```bash
# Cách 1: Reset về commit đó
git reset --hard f4e5d6c
# Hoặc dùng reflog syntax:
git reset --hard HEAD@{1}

# Cách 2: Tạo branch mới từ commit đó (an toàn hơn)
git switch -c recovered-branch f4e5d6c
```

### Quy trình hoàn chỉnh

```
Tình huống: reset --hard nhầm, mất 3 commits

Bước 1: Bình tĩnh! Code chưa mất.

Bước 2: git reflog
         → Tìm SHA của commit cuối trước khi reset

Bước 3: git reset --hard <sha>
         → Khôi phục hoàn toàn

Bước 4: git log --oneline
         → Kiểm tra xác nhận
```

---

## 5. Recover deleted branch

Bạn xóa branch nhầm? Reflog cũng cứu được!

```bash
# Xóa branch nhầm
git branch -D feature-quan-trong
# Deleted branch feature-quan-trong (was abc1234).
# Ối! Branch đó có code chưa merge!

# Bước 1: Xem reflog để tìm commit cuối của branch
git reflog
# ... tìm entry liên quan đến feature-quan-trong ...

# Hoặc xem reflog của branch cụ thể (nếu chưa bị GC)
git reflog show feature-quan-trong

# Bước 2: Tạo lại branch từ SHA
git switch -c feature-quan-trong abc1234
# Branch feature-quan-trong đã hồi sinh!
```

Mẹo: Khi Git báo `Deleted branch X (was abc1234)`, hãy **ghi lại SHA abc1234** ngay. Đó là cách nhanh nhất để recovery.

---

## 6. Reflog cho nhánh cụ thể

```bash
# Reflog của HEAD (mặc định)
git reflog

# Reflog của branch main
git reflog show main

# Reflog của branch feature
git reflog show feature/login

# Output mẫu:
git reflog show main
# a1b2c3d main@{0}: merge feature/login: Fast-forward
# f4e5d6c main@{1}: commit: fix: hotfix production
# 9876543 main@{2}: pull origin main: Fast-forward
```

---

## 7. Thời gian lưu trữ reflog

### Cấu hình mặc định

```bash
# Xem cấu hình hiện tại
git config gc.reflogExpire
# 90.days.ago  (entries reachable — còn trên branch)

git config gc.reflogExpireUnreachable
# 30.days.ago  (entries unreachable — commits "mồ côi")
```

### Thay đổi thời gian lưu

```bash
# Giữ reflog 180 ngày (thay vì 90)
git config gc.reflogExpire 180.days.ago

# Giữ unreachable entries 60 ngày (thay vì 30)
git config gc.reflogExpireUnreachable 60.days.ago

# KHÔNG BAO GIỜ hết hạn (cẩn thận, tốn disk)
git config gc.reflogExpire never
```

### Xóa reflog thủ công

```bash
# Xóa reflog entries đã hết hạn
git reflog expire --expire=now --all

# Xóa reflog của branch cụ thể
git reflog expire --expire=now refs/heads/main
```

---

## 8. git fsck — Tìm dangling objects

Khi commit không còn được branch hay tag nào trỏ tới, nó trở thành "dangling object". `git fsck` giúp tìm chúng.

```bash
# Tìm tất cả dangling objects
git fsck --lost-found

# Output mẫu:
# dangling commit abc1234def5678...
# dangling commit 9876543210abcd...
# dangling blob aaabbbcccdddee...

# Xem nội dung commit dangling
git show abc1234def5678

# Khôi phục commit dangling
git switch -c recovered abc1234def5678
```

### Khi nào dùng fsck thay vì reflog?

```
Reflog: Tìm commits mà BẠN đã từng trỏ tới (HEAD đã đi qua)
fsck:   Tìm MỌI object mồ côi (kể cả từ stash, cherry-pick bị hủy...)

Thường thì reflog đủ rồi. Dùng fsck khi:
- Reflog đã hết hạn (>90 ngày)
- Object đến từ nguồn khác (fetch rồi không merge)
- Cần tìm blob (file) đơn lẻ, không phải commit
```

---

## 9. Garbage Collection: Khi nào object THỰC SỰ bị xóa?

Git objects (commits, blobs, trees) chỉ bị xóa khi **garbage collection** chạy VÀ object đó không còn reference nào:

```
Object lifecycle:

  Tạo commit ──→ Có reference ──→ An toàn
                      │
                  Mất reference ──→ Dangling ──→ GC chạy ──→ XÓA THẬT
                  (reset, delete)    (30-90 ngày)
```

### Các lệnh GC

```bash
# Xem kích thước repo
git count-objects -v

# Chạy GC nhẹ (Git tự chạy định kỳ)
git gc

# Chạy GC mạnh (nén tối đa, xóa dangling objects hết hạn)
git gc --aggressive --prune=now

# CHÚ Ý: --prune=now xóa NGAY các dangling objects
# Sau lệnh này, reflog cũng bị xóa → không recovery được nữa!
```

### Timeline xóa object

```
Ngày 0:   git reset --hard HEAD~3    → 3 commits trở thành dangling
Ngày 1-29: Dangling, nhưng reflog còn → recovery được
Ngày 30:   gc.reflogExpireUnreachable → reflog entry bị xóa
Ngày 30+:  git gc chạy → object bị xóa THẬT SỰ
           (nếu không có reference nào khác)

=> Bạn có ~30 ngày để recovery commits "mồ côi"
=> Commits trên branch vẫn an toàn 90 ngày
```

---

## 10. Workflow khôi phục hoàn chỉnh

### Tình huống: "Tôi vừa reset --hard nhầm!"

```bash
# 1. ĐỪNG PANIC. Đừng chạy thêm lệnh git nào khác.
#    (Mỗi lệnh thêm = thêm entry reflog, nhưng không mất gì)

# 2. Xem reflog
git reflog
# d4e5f6a HEAD@{0}: reset: moving to HEAD~5
# a1b2c3d HEAD@{1}: commit: feat: tính năng xác thực 2FA    ← ĐÍCH
# f9e8d7c HEAD@{2}: commit: feat: giao diện cài đặt
# 1a2b3c4 HEAD@{3}: commit: fix: sửa lỗi token hết hạn
# ...

# 3. Xác nhận đúng commit cần khôi phục
git show a1b2c3d --stat
# Xem danh sách files thay đổi để chắc chắn

# 4a. Khôi phục trực tiếp (nếu chắc chắn)
git reset --hard a1b2c3d
# Hoặc:
git reset --hard HEAD@{1}

# 4b. Tạo branch mới (nếu muốn an toàn hơn)
git switch -c backup-recovery a1b2c3d

# 5. Kiểm tra
git log --oneline -5
# Xác nhận commits đã được khôi phục
```

### Tình huống: "Tôi xóa branch có code chưa merge!"

```bash
# 1. Nhớ lại tên branch
# Git thường hiện SHA khi xóa: "Deleted branch X (was abc1234)"

# 2. Nếu nhớ SHA:
git switch -c ten-branch-cu abc1234

# 3. Nếu KHÔNG nhớ SHA:
git reflog | grep "ten-branch"
# Tìm entry cuối cùng liên quan

# 4. Hoặc dùng fsck:
git fsck --lost-found
# Tìm dangling commit, git show từng cái
```

### Tình huống: "Tôi rebase nhầm, commits bị lộn xộn!"

```bash
# 1. Reflog ghi lại trạng thái trước rebase
git reflog
# abc1234 HEAD@{0}: rebase (finish): ...
# def5678 HEAD@{1}: rebase (pick): ...
# ...
# 999aaaa HEAD@{8}: rebase (start): checkout main
# bbb1111 HEAD@{9}: commit: feat: commit cuối trước rebase  ← ĐÍCH

# 2. Reset về trạng thái trước rebase
git reset --hard bbb1111

# 3. Branch giờ y hệt trước khi rebase
```

---

## 11. Mẹo thực tế

### Tạo alias hữu ích

```bash
# Reflog dạng đẹp, dễ đọc
git config --global alias.rl "reflog --format='%C(yellow)%h%C(reset) %C(blue)%gd%C(reset) %C(green)%ci%C(reset) %gs'"

# Dùng:
git rl
```

### Backup trước khi làm gì nguy hiểm

```bash
# Tạo tag backup trước khi rebase/reset
git tag backup-truoc-rebase

# Nếu hỏng:
git reset --hard backup-truoc-rebase

# Xóa tag khi không cần:
git tag -d backup-truoc-rebase
```

### Kiểm tra reflog trước khi GC

```bash
# Xem còn bao nhiêu reflog entries
git reflog | wc -l

# Xem entries sắp hết hạn
git reflog --date=relative
```

---

## 12. Lỗi thường gặp

### Lỗi 1: Reflog trống trên repo mới clone

```bash
git clone https://github.com/user/repo.git
cd repo
git reflog
# Chỉ thấy 1 entry: clone

# TẠI SAO: Reflog là LOCAL. Khi clone, chỉ có 1 entry (clone).
# Reflog của người khác KHÔNG được clone theo.
```

### Lỗi 2: Chạy git gc --prune=now rồi mới cần recovery

```bash
git reset --hard HEAD~5
git gc --prune=now          # XÓA NGAY mọi dangling objects
git reflog                   # Reflog cũng bị dọn!
# Quá muộn, không recovery được nữa.

# BÀI HỌC: KHÔNG BAO GIỜ chạy gc --prune=now khi đang cần recovery
```

### Lỗi 3: Nhầm lẫn `HEAD@{n}` với `HEAD~n`

```bash
# HEAD~n: n commits TRƯỚC theo parent chain
# HEAD@{n}: n entries TRƯỚC trong reflog (theo thời gian hành động)

# Ví dụ: Bạn commit A, B, C rồi checkout sang branch khác
git reflog
# x1y2z3 HEAD@{0}: checkout: moving from main to feature
# c3c3c3 HEAD@{1}: commit: C
# b2b2b2 HEAD@{2}: commit: B

# HEAD~1 = parent của commit hiện tại (trên branch feature)
# HEAD@{1} = commit C trên main (entry reflog trước đó)
# HAI CÁI NÀY KHÁC NHAU HOÀN TOÀN!
```

### Lỗi 4: Nghĩ reflog là vĩnh viễn

```bash
# Reflog KHÔNG vĩnh viễn! Mặc định:
# - Reachable entries: 90 ngày
# - Unreachable entries: 30 ngày

# Nếu bạn reset --hard 2 tháng trước và bây giờ mới biết
# → Commit có thể đã bị GC xóa rồi!

# GIẢI PHÁP: Nếu code quan trọng, push lên remote
# Remote là backup tốt nhất
```

---

## 13. Câu hỏi phỏng vấn

### Câu 1: Git reflog là gì? Khác gì với git log?

**Trả lời:**
`git reflog` ghi lại mọi lần HEAD thay đổi trên local — bao gồm commit, reset, checkout, merge, rebase. Nó khác `git log` ở chỗ:
- `git log` chỉ hiển thị commits reachable từ HEAD hiện tại. Nếu bạn reset xóa commits, `log` không thấy chúng nữa.
- `git reflog` hiển thị TẤT CẢ thay đổi, kể cả commits đã bị "xóa" bởi reset. Nó hoạt động như undo history.
- Reflog chỉ tồn tại local (không push), trong khi log là shared.

### Câu 2: Làm sao khôi phục commit sau git reset --hard?

**Trả lời:**
1. Chạy `git reflog` để tìm SHA của commit trước khi reset
2. Dùng `git reset --hard <SHA>` để khôi phục
3. Hoặc `git switch -c recovery-branch <SHA>` để tạo branch mới
4. Điều này hoạt động vì `reset --hard` chỉ di chuyển HEAD, không xóa object. Object chỉ bị xóa khi garbage collection chạy (sau 30-90 ngày).

### Câu 3: Reflog entries được lưu bao lâu?

**Trả lời:**
Mặc định:
- **Reachable entries** (commits vẫn trên branch): 90 ngày (`gc.reflogExpire`)
- **Unreachable entries** (commits mồ côi): 30 ngày (`gc.reflogExpireUnreachable`)
- Có thể cấu hình thay đổi hoặc set `never` để không bao giờ hết hạn.
- Entries chỉ bị xóa khi `git gc` chạy, không phải tự động.

### Câu 4: Dangling object là gì? Làm sao tìm?

**Trả lời:**
Dangling object là Git object (commit, blob, tree) không còn reference nào trỏ tới — không thuộc branch, tag, hay reflog entry nào. Tìm bằng `git fsck --lost-found`. Dangling objects vẫn tồn tại trên disk cho đến khi garbage collection xóa chúng. Đây là lý do Git "gần như không bao giờ mất dữ liệu" — ngay cả objects bị "xóa" vẫn còn một thời gian.

### Câu 5: Giải thích sự khác nhau giữa `HEAD~n` và `HEAD@{n}`.

**Trả lời:**
- `HEAD~n`: Đi ngược **n commits** theo parent chain trong commit graph. `HEAD~2` = ông nội của commit hiện tại.
- HEAD@&#123;n&#125;: Đi ngược **n entries** trong reflog — tức n hành động trước đó theo thời gian. HEAD@&#123;2&#125; = HEAD ở thời điểm 2 hành động trước.
- Hai cái này thường cho kết quả khác nhau, đặc biệt khi bạn checkout giữa các branches hoặc dùng reset.

---

## Tóm tắt

```
Khôi phục commit sau reset:    git reflog → git reset --hard <sha>
Khôi phục branch đã xóa:       git reflog → git switch -c <name> <sha>
Khôi phục sau rebase nhầm:     git reflog → git reset --hard <sha-truoc-rebase>
Tìm object mồ côi:             git fsck --lost-found
An toàn trước thao tác nguy:   git tag backup-<ten>
```

Nhớ: **Git gần như không bao giờ xóa dữ liệu ngay lập tức**. Nếu bạn còn trong vòng 30 ngày, khả năng cao là recovery được. Reflog là người bạn tốt nhất của bạn khi mọi thứ sai lầm.
