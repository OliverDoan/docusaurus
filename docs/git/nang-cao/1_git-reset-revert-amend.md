---
sidebar_position: 1
title: "1. Reset, Revert, Amend — Sửa lỗi trong Git"
---

# Reset, Revert, Amend — Sửa lỗi trong Git

Ai cũng mắc sai lầm khi commit — viết sai message, quên thêm file, hoặc commit nhầm code. Đừng lo, Git có những công cụ mạnh mẽ giúp bạn sửa lỗi. Trong bài này, mình sẽ đi qua ba "vũ khí" chính: `amend`, `reset`, và `revert` — mỗi cái phù hợp với một tình huống khác nhau.

---

## Mục lục

- [1. git commit --amend](#1-git-commit-amend)
- [2. git reset](#2-git-reset)
- [3. git revert](#3-git-revert)
- [4. Bảng so sánh: Amend vs Reset vs Revert](#4-bảng-so-sánh-amend-vs-reset-vs-revert)
- [5. Decision Tree: Chọn lệnh nào?](#5-decision-tree-chọn-lệnh-nào)
- [6. Ví dụ thực tế: Undo sai lầm phổ biến](#6-ví-dụ-thực-tế-undo-sai-lầm-phổ-biến)
- [7. Lỗi thường gặp](#7-lỗi-thường-gặp)
- [8. Câu hỏi phỏng vấn](#8-câu-hỏi-phỏng-vấn)
- [Tóm tắt](#tóm-tắt)

---

## 1. git commit --amend

### Sửa commit message cuối cùng

Bạn vừa commit xong nhưng nhận ra message bị lỗi chính tả? Dùng `--amend`:

```bash
# Commit ban đầu với message sai
git commit -m "fxi: sửa lỗi đăng nhập"

# Sửa lại message (mở editor)
git commit --amend

# Hoặc sửa trực tiếp trên command line
git commit --amend -m "fix: sửa lỗi đăng nhập"
```

### Thêm file quên stage vào commit cuối

Bạn commit xong rồi mới nhớ quên thêm một file? Không cần tạo commit mới:

```bash
# Commit ban đầu — quên thêm file utils.js
git add main.js
git commit -m "feat: thêm tính năng tìm kiếm"

# Ối, quên utils.js!
git add utils.js
git commit --amend --no-edit
# --no-edit giữ nguyên message cũ, chỉ thêm file mới vào commit
```

### Cơ chế hoạt động

```
Trước amend:
  A --- B --- C (HEAD)
              |
              message: "fxi: sửa lỗi"

Sau amend:
  A --- B --- C' (HEAD)     ← C' là commit MỚI, SHA khác C
              |
              message: "fix: sửa lỗi"

  (C cũ vẫn tồn tại trong reflog nhưng không còn trên branch)
```

### Lưu ý quan trọng

`--amend` THAY ĐỔI SHA của commit. Điều này có nghĩa:

- Nếu bạn **chưa push** → an toàn, dùng thoải mái
- Nếu bạn **đã push** → NGUY HIỂM! Đồng nghiệp đã có commit cũ, bạn sửa sẽ gây conflict

```bash
# NGUY HIỂM: Amend sau khi đã push
git commit --amend -m "fix: sửa lỗi đăng nhập"
git push              # Lỗi! rejected vì history khác
git push --force      # Ép push → có thể xóa code đồng nghiệp!

# AN TOÀN: Chỉ amend khi chưa push
git commit --amend -m "fix: sửa lỗi đăng nhập"
git push              # OK, lần push đầu tiên
```

---

## 2. git reset

`git reset` di chuyển HEAD (và có thể branch pointer) về một commit trước đó. Có 3 chế độ, mỗi chế độ ảnh hưởng khác nhau đến 3 vùng của Git.

### Ba vùng trong Git

```
+-------------------+    +-------------------+    +-------------------+
|  Working Directory|    |   Staging Area    |    |    Repository     |
|  (thư mục làm    | => |   (Index/Stage)   | => |   (commit history)|
|   việc của bạn)   |    |   git add vào đây |    |   git commit ở đây|
+-------------------+    +-------------------+    +-------------------+
```

### --soft: Chỉ di chuyển HEAD

```bash
git reset --soft HEAD~1
```

```
Trước reset --soft HEAD~1:
  Working Dir: file.js (đã sửa + committed)
  Staging:     file.js (đã committed)
  Repository:  A --- B --- C (HEAD)

Sau reset --soft HEAD~1:
  Working Dir: file.js (giữ nguyên nội dung của C)
  Staging:     file.js (thay đổi từ C nằm ở đây, sẵn sàng commit lại)
  Repository:  A --- B (HEAD)    ← C bị "gỡ" khỏi branch

  => Thay đổi của commit C chuyển về Staging Area
  => Bạn có thể sửa rồi commit lại
```

**Dùng khi nào:** Muốn gộp nhiều commit thành một, hoặc sửa nội dung commit cuối.

```bash
# Ví dụ: Gộp 3 commit cuối thành 1
git reset --soft HEAD~3
git commit -m "feat: hoàn thành tính năng tìm kiếm"
```

### --mixed (mặc định): Di chuyển HEAD + reset Staging

```bash
git reset HEAD~1          # --mixed là mặc định
git reset --mixed HEAD~1  # tường minh hơn
```

```
Trước reset --mixed HEAD~1:
  Working Dir: file.js (nội dung commit C)
  Staging:     file.js (nội dung commit C)
  Repository:  A --- B --- C (HEAD)

Sau reset --mixed HEAD~1:
  Working Dir: file.js (giữ nguyên nội dung của C)
  Staging:     (trống — file bị unstage)
  Repository:  A --- B (HEAD)

  => Thay đổi của C chuyển về Working Directory (unstaged)
  => Bạn cần git add lại rồi mới commit được
```

**Dùng khi nào:** Muốn undo commit và chọn lại file nào cần stage.

```bash
# Ví dụ: Undo commit cuối, chỉ giữ lại một số thay đổi
git reset HEAD~1
git add file-can-giu.js
git commit -m "feat: chỉ thêm tính năng cần thiết"
# file-khong-can.js vẫn nằm trong working dir, chưa staged
```

### --hard: Reset tất cả (NGUY HIỂM)

```bash
git reset --hard HEAD~1
```

```
Trước reset --hard HEAD~1:
  Working Dir: file.js (nội dung commit C)
  Staging:     file.js (nội dung commit C)
  Repository:  A --- B --- C (HEAD)

Sau reset --hard HEAD~1:
  Working Dir: (quay lại trạng thái commit B)
  Staging:     (quay lại trạng thái commit B)
  Repository:  A --- B (HEAD)

  => MỌI THỨ của commit C bị xóa!
  => Working directory cũng bị reset!
  => Nếu có thay đổi chưa commit → MẤT LUÔN!
```

**Dùng khi nào:** Muốn xóa sạch mọi thứ và quay về trạng thái cũ. Hãy chắc chắn 100%!

```bash
# Ví dụ: Code lung tung quá, muốn quay về commit sạch
git reset --hard HEAD~1

# Quay về remote branch (xóa mọi thay đổi local)
git reset --hard origin/main
```

### Bảng so sánh 3 mode reset

| Mode      | HEAD      | Staging Area | Working Directory | Mức độ nguy hiểm |
| --------- | --------- | ------------ | ----------------- | ---------------- |
| `--soft`  | Di chuyển | Giữ nguyên   | Giữ nguyên        | Thấp             |
| `--mixed` | Di chuyển | Reset        | Giữ nguyên        | Trung bình       |
| `--hard`  | Di chuyển | Reset        | Reset             | CAO              |

### Reset file cụ thể (unstage)

```bash
# Unstage một file (không ảnh hưởng commit history)
git reset HEAD file.js
# Tương đương với:
git restore --staged file.js   # Git 2.23+, rõ ràng hơn

# Unstage tất cả files
git reset HEAD
```

### reset vs checkout cho files

```bash
# reset: bỏ file khỏi staging area (unstage)
git reset HEAD file.js
# => file.js vẫn có thay đổi trong working dir, chỉ bị unstage

# checkout: khôi phục file về trạng thái commit (XÓA thay đổi)
git checkout -- file.js
# => file.js bị ghi đè bởi version trong commit, MẤT thay đổi!

# Git 2.23+ (rõ ràng hơn):
git restore --staged file.js   # thay cho reset
git restore file.js            # thay cho checkout --
```

---

## 3. git revert

### Tạo commit "đảo ngược"

`git revert` không xóa history mà tạo một commit MỚI để undo thay đổi:

```bash
git revert abc1234
```

```
Trước revert:
  A --- B --- C --- D (HEAD)
              |
              commit gây bug

Sau revert:
  A --- B --- C --- D --- D' (HEAD)
                          |
                          commit mới, nội dung đảo ngược C

  => History vẫn giữ nguyên!
  => D' chứa thay đổi ngược lại với C
  => An toàn cho shared branches
```

### Cú pháp cơ bản

```bash
# Revert commit cụ thể (mở editor để viết message)
git revert abc1234

# Revert không mở editor (dùng message mặc định)
git revert abc1234 --no-edit

# Revert commit cuối cùng
git revert HEAD

# Revert nhiều commits (tạo nhiều revert commits)
git revert HEAD~3..HEAD

# Revert nhiều commits thành 1 commit
git revert HEAD~3..HEAD --no-commit
git commit -m "revert: undo 3 commits cuối"
```

### Revert merge commit

Merge commit có 2 parents, nên bạn phải chỉ rõ giữ parent nào:

```bash
# Xem merge commit
git log --oneline
# a1b2c3d Merge branch 'feature' into main

# Revert merge commit, giữ lại main (parent 1)
git revert a1b2c3d -m 1
# -m 1: giữ parent thứ nhất (thường là main/nhánh đích)
# -m 2: giữ parent thứ hai (thường là feature/nhánh nguồn)

# Cách nhớ: -m 1 = "undo merge, giữ main"
```

### Tại sao revert an toàn hơn reset?

```bash
# Reset: XÓA history → conflict khi đồng nghiệp pull
git reset --hard HEAD~1    # Commit biến mất
git push --force           # Ép remote, gây rối cho team

# Revert: THÊM history → không conflict
git revert HEAD            # Commit mới được tạo
git push                   # Push bình thường, team nhận revert commit
```

---

## 4. Bảng so sánh: Amend vs Reset vs Revert

| Tiêu chí                  | `amend`                | `reset`                     | `revert`                 |
| ------------------------- | ---------------------- | --------------------------- | ------------------------ |
| Cơ chế                    | Thay thế commit cuối   | Di chuyển HEAD về commit cũ | Tạo commit mới đảo ngược |
| Thay đổi history          | Co (SHA mới)           | Co (xoa commits)            | Khong (chi them commit)  |
| An toàn cho shared branch | KHONG                  | KHONG                       | CO                       |
| Phạm vi                   | Chỉ commit cuối        | Bất kỳ commit nào           | Bất kỳ commit nào        |
| Khi nào dùng              | Sửa nhỏ commit vừa tạo | Undo trên local branch      | Undo trên shared branch  |
| Cần force push?           | Co (nếu đã push)       | Co (nếu đã push)            | Không                    |

---

## 5. Decision Tree: Chọn lệnh nào?

```
Bạn muốn sửa gì?
│
├── Sửa commit message cuối?
│   └── Đã push chưa?
│       ├── Chưa → git commit --amend
│       └── Rồi → git revert HEAD, rồi commit lại
│
├── Thêm file quên vào commit cuối?
│   └── Đã push chưa?
│       ├── Chưa → git add file && git commit --amend --no-edit
│       └── Rồi → git add file && git commit -m "fix: thêm file thiếu"
│
├── Undo commit cuối nhưng giữ thay đổi?
│   └── git reset --soft HEAD~1 (hoặc --mixed)
│
├── Undo commit cuối, xóa sạch thay đổi?
│   └── git reset --hard HEAD~1
│       (cẩn thận! kiểm tra git stash trước)
│
├── Undo commit trên shared branch (main/develop)?
│   └── git revert <commit-hash>
│
└── Unstage file (bỏ khỏi staging area)?
    └── git reset HEAD <file>
        hoặc git restore --staged <file>
```

---

## 6. Ví dụ thực tế: Undo sai lầm phổ biến

### Tình huống 1: "Tôi commit nhầm file .env"

```bash
# .env đã bị commit vào Git!
git log --oneline
# a1b2c3d feat: thêm cấu hình database  ← commit chứa .env

# Cách fix: Xóa file khỏi Git nhưng giữ trên máy
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "fix: xóa .env khỏi tracking, thêm vào .gitignore"

# Nếu chưa push, có thể amend luôn:
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit --amend --no-edit
```

### Tình huống 2: "Tôi commit lên nhầm branch"

```bash
# Đang ở main, lỡ commit rồi!
git log --oneline
# x1y2z3 feat: tính năng mới  ← commit nhầm trên main

# Bước 1: Tạo branch mới chứa commit đó
git branch feature-moi

# Bước 2: Reset main về trạng thái trước
git reset --hard HEAD~1

# Bước 3: Chuyển sang branch mới
git switch feature-moi
# Commit x1y2z3 giờ nằm trên feature-moi, main sạch sẽ
```

### Tình huống 3: "Tôi muốn undo commit cuối trên branch đã share"

```bash
# Đang ở develop (shared branch), commit cuối bị lỗi
git log --oneline
# d4e5f6 fix: sửa logic tính toán  ← commit này gây bug

# ĐÚNG: Dùng revert
git revert d4e5f6 --no-edit
git push

# SAI: Dùng reset rồi force push
git reset --hard HEAD~1
git push --force   # ĐỒNG NGHIỆP SẼ GHÉT BẠN!
```

### Tình huống 4: "Tôi reset --hard nhầm!"

```bash
# Đừng panic! Dùng reflog để khôi phục
git reflog
# abc1234 HEAD@{0}: reset: moving to HEAD~3
# def5678 HEAD@{1}: commit: feat: tính năng quan trọng  ← đây!

git reset --hard def5678
# Khôi phục thành công!
```

---

## 7. Lỗi thường gặp

### Lỗi 1: Amend sau khi đã push

```bash
# SAI
git commit --amend -m "fix message"
git push
# ERROR: rejected, non-fast-forward

# CÁCH SỬA: Hoặc force push (nếu branch cá nhân)
git push --force-with-lease   # an toàn hơn --force

# HOẶC: Tạo commit mới thay vì amend
git commit -m "fix: sửa lại message"
```

### Lỗi 2: Reset --hard mất code chưa commit

```bash
# Bạn đang code, chưa commit, rồi:
git reset --hard HEAD
# Mọi thay đổi chưa commit → MẤT!

# PHÒNG TRÁNH: Luôn stash trước khi reset
git stash
git reset --hard HEAD
git stash pop   # lấy lại nếu cần
```

### Lỗi 3: Revert nhầm rồi revert lại

```bash
# Revert commit A
git revert A   # tạo commit A'

# Ối, revert nhầm! Muốn lấy A lại
git revert A'  # revert cái revert → khôi phục A
# Kết quả: A --- A' --- A'' (nội dung giống A)
```

### Lỗi 4: Không hiểu reset --mixed vs --soft

```bash
# --soft: thay đổi vẫn ở staging (sẵn sàng commit)
git reset --soft HEAD~1
git status
# Changes to be committed: (staged)

# --mixed: thay đổi ở working dir (cần git add lại)
git reset --mixed HEAD~1
git status
# Changes not staged for commit: (unstaged)
```

---

## 8. Câu hỏi phỏng vấn

### Câu 1: Sự khác nhau giữa `git reset` và `git revert`?

**Trả lời:**

- `git reset` thay đổi history bằng cách di chuyển HEAD về commit trước. Commits bị "xóa" khỏi branch. Nguy hiểm trên shared branches vì thay đổi history mà người khác đã có.
- `git revert` tạo một commit MỚI chứa nội dung đảo ngược. History được giữ nguyên, chỉ thêm commit. An toàn cho shared branches.
- Nguyên tắc: dùng `reset` cho local, `revert` cho shared branches.

### Câu 2: Giải thích 3 mode của `git reset`.

**Trả lời:**

- `--soft`: Chỉ di chuyển HEAD. Staging area và working directory giữ nguyên. Thay đổi nằm ở staged.
- `--mixed` (mặc định): Di chuyển HEAD + reset staging area. Working directory giữ nguyên. Thay đổi nằm ở unstaged.
- `--hard`: Di chuyển HEAD + reset staging area + reset working directory. Mọi thay đổi bị xóa. Nguy hiểm nhất.

### Câu 3: Làm sao undo commit cuối mà không mất code?

**Trả lời:**

```bash
git reset --soft HEAD~1
```

Commit cuối bị undo, nhưng mọi thay đổi vẫn nằm trong staging area, sẵn sàng commit lại. Đây là cách an toàn nhất để undo commit trên local.

### Câu 4: `git commit --amend` có tạo commit mới không?

**Trả lời:**
Có. `--amend` thực chất tạo một commit hoàn toàn mới (SHA khác) thay thế commit cuối. Commit cũ vẫn tồn tại trong reflog nhưng không còn được branch nào trỏ tới. Đó là lý do amend sau khi push sẽ gây conflict.

### Câu 5: Khi nào dùng `--force-with-lease` thay vì `--force`?

**Trả lời:**
`--force-with-lease` an toàn hơn `--force` vì nó kiểm tra xem remote branch có commit mới (từ người khác) hay không trước khi force push. Nếu có, lệnh sẽ bị từ chối thay vì ghi đè code đồng nghiệp. Luôn ưu tiên `--force-with-lease` khi cần force push.

---

## Tóm tắt

| Tình huống                            | Lệnh                                           |
| ------------------------------------- | ---------------------------------------------- |
| Sửa message commit cuối (chưa push)   | `git commit --amend`                           |
| Thêm file vào commit cuối (chưa push) | `git add file && git commit --amend --no-edit` |
| Undo commit, giữ thay đổi staged      | `git reset --soft HEAD~1`                      |
| Undo commit, giữ thay đổi unstaged    | `git reset HEAD~1`                             |
| Undo commit, xóa sạch thay đổi        | `git reset --hard HEAD~1`                      |
| Undo commit trên shared branch        | `git revert <commit-hash>`                     |
| Unstage file                          | `git restore --staged <file>`                  |
