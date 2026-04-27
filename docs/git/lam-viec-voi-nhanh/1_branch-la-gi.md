---
sidebar_position: 1
title: "1. Branch la gi? Tao va quan ly nhanh"
---

# Branch là gì? Tạo và quản lý nhánh

Khi làm việc với Git, bạn sẽ nhanh chóng nhận ra rằng làm tất cả mọi thứ trên một dòng thời gian duy nhất là một ý tưởng tồi tệ. Tưởng tượng bạn đang viết tính năng mới, đồng nghiệp đang sửa bug, người khác đang thí nghiệm -- tất cả trên cùng một nơi. Hỗn độn là điều chắc chắn. **Branch** (nhánh) chính là giải pháp cho vấn đề này.

---


---

## Mục lục

- [1. Branch là gì?](#1-branch-là-gì)
- [2. Tại sao cần branch?](#2-tại-sao-cần-branch)
- [3. Các lệnh cơ bản về branch](#3-các-lệnh-cơ-bản-về-branch)
- [4. Chuyển đổi giữa các branch](#4-chuyển-đổi-giữa-các-branch)
- [5. Naming conventions -- Quy tắc đặt tên branch](#5-naming-conventions-quy-tắc-đặt-tên-branch)
- [6. Branch tracking -- Local vs Remote](#6-branch-tracking-local-vs-remote)
- [7. ASCII diagram -- Branch diverge và merge](#7-ascii-diagram-branch-diverge-và-merge)
- [8. Quản lý branches -- Khi nào tạo, khi nào xoá](#8-quản-lý-branches-khi-nào-tạo-khi-nào-xoá)
- [9. Thực hành -- Bài tập tự làm](#9-thực-hành-bài-tập-tự-làm)
- [10. Lỗi thường gặp](#10-lỗi-thường-gặp)
- [11. Câu hỏi phỏng vấn](#11-câu-hỏi-phỏng-vấn)
- [Tóm tắt](#tóm-tắt)

---

## 1. Branch là gì?

### 1.1. Metaphor cây -- Thân chính và nhánh cây

Hãy tưởng tượng dự án của bạn như một **cái cây**:

- **Thân chính (trunk)** = nhánh `main` -- đây là phiên bản ổn định, chính thức
- **Nhánh cây (branch)** = các nhánh làm việc -- mỗi nhánh là một hướng phát triển độc lập

```
        feature/login
       /
main ----*----*----*----*
       \
        bugfix/header
```

Mỗi nhánh cây có thể **phát triển độc lập** mà không ảnh hưởng đến thân chính. Khi nhánh đã "chín" (hoàn thành), bạn **ghép nó lại** vào thân chính.

### 1.2. Định nghĩa kỹ thuật -- Branch là một pointer

Trong Git, branch **không phải là một bản sao của toàn bộ dự án**. Nó chỉ là một **con trỏ (pointer)** trỏ đến một commit cụ thể.

```
                    main (pointer)
                      |
                      v
commit-A --> commit-B --> commit-C
                            ^
                            |
                       feature/login (pointer)
```

- Mỗi branch chỉ là một file nhỏ (41 bytes) chứa hash của commit mà nó trỏ đến
- Tạo branch mới **cực nhanh** vì Git chỉ cần tạo thêm một pointer
- Không sao chép file, không tốn dung lượng

**Điều này khác với SVN** -- nơi tạo branch nghĩa là sao chép toàn bộ thư mục dự án. Git thông minh hơn nhiều.

### 1.3. HEAD -- Bạn đang ở đâu?

`HEAD` là một pointer đặc biệt, trỏ đến **branch hiện tại** mà bạn đang làm việc:

```
HEAD --> main --> commit-C

# Khi chuyển sang feature/login:
HEAD --> feature/login --> commit-C
```

Khi bạn commit, branch mà HEAD đang trỏ đến sẽ **di chuyển lên phía trước** (trỏ đến commit mới). Các branch khác giữ nguyên.

---

## 2. Tại sao cần branch?

### 2.1. Parallel development -- Làm việc song song

Không có branch:
```
Developer A: đang sửa file login.js
Developer B: cũng sửa file login.js
=> CONFLICT liên tục, mất thời gian giải quyết
```

Có branch:
```
Developer A: làm trên feature/login
Developer B: làm trên feature/dashboard
=> Mỗi người một nhánh, không cản nhau
```

### 2.2. Isolation -- Cô lập thay đổi

Branch tạo ra một **không gian làm việc riêng**. Nếu bạn làm hỏng gì đó trên branch của mình, **main vẫn an toàn**. Bạn có thể:

- Xoá branch đó và bắt đầu lại
- Sửa xong rồi mới merge vào main
- Để đồng nghiệp review trước khi merge

### 2.3. Experimentation -- Thí nghiệm tự do

Muốn thử một ý tưởng mới? Tạo branch, thí nghiệm thoải mái:

```bash
# Tạo nhánh thí nghiệm
git switch -c experiment/new-algorithm

# Làm gì thì làm...
# Nếu thành công -> merge vào main
# Nếu thất bại -> xoá branch, không ai biết :)
git branch -d experiment/new-algorithm
```

---

## 3. Các lệnh cơ bản về branch

### 3.1. Liệt kê branches

```bash
# Xem tất cả branch local
git branch
# Kết quả:
#   feature/login
# * main              <-- dấu * chỉ branch hiện tại
#   bugfix/header

# Xem branch local kèm commit cuối
git branch -v
# Kết quả:
#   feature/login  a1b2c3d Thêm form đăng nhập
# * main           e4f5g6h Update README
#   bugfix/header  i7j8k9l Sửa header responsive

# Xem TẤT CẢ branch (cả local và remote)
git branch -a
# Kết quả:
#   feature/login
# * main
#   bugfix/header
#   remotes/origin/main
#   remotes/origin/feature/login
#   remotes/origin/develop

# Xem chỉ branch đã merge vào branch hiện tại
git branch --merged

# Xem branch CHƯA merge (cẩn thận khi xoá)
git branch --no-merged
```

### 3.2. Tạo branch mới

```bash
# Tạo branch mới (nhưng KHÔNG chuyển sang)
git branch feature/login
# Bạn vẫn đang ở branch cũ

# Tạo branch mới TỪ một commit cụ thể
git branch hotfix/urgent abc1234
# Tạo branch từ commit có hash abc1234

# Tạo branch mới từ một branch khác
git branch feature/v2 develop
# Tạo feature/v2 từ vị trí của develop
```

### 3.3. Xoá branch

```bash
# Xoá branch đã merge (an toàn)
git branch -d feature/login
# Git sẽ kiểm tra: branch này đã merge chưa?
# Nếu chưa merge -> Git từ chối xoá, bảo vệ bạn

# Xoá branch CHƯA merge (ép buộc -- cẩn thận!)
git branch -D feature/login
# -D = --delete --force
# Mất hết commit trên branch này (trừ khi có reflog)

# Xoá branch trên remote
git push origin --delete feature/login
# Hoặc cú pháp ngắn:
git push origin :feature/login
```

**Lưu ý quan trọng:** Không thể xoá branch mà bạn đang đứng trên đó. Phải chuyển sang branch khác trước.

```bash
# KHÔNG ĐƯỢC: đang ở main mà xoá main
git branch -d main
# error: Cannot delete branch 'main' checked out

# ĐÚNG: chuyển sang branch khác trước
git switch develop
git branch -d feature/old
```

---

## 4. Chuyển đổi giữa các branch

### 4.1. `git switch` (hiện đại -- từ Git 2.23+)

```bash
# Chuyển sang branch đã tồn tại
git switch feature/login

# Tạo branch mới VÀ chuyển sang luôn
git switch -c feature/dashboard
# -c = --create

# Tạo branch mới từ một điểm cụ thể
git switch -c hotfix/urgent main
# Tạo hotfix/urgent từ main và chuyển sang

# Quay lại branch trước đó (như cd -)
git switch -
# Rất tiện lợi khi chuyển qua lại giữa 2 branch
```

### 4.2. `git checkout` (cũ -- vẫn hoạt động)

```bash
# Chuyển branch
git checkout feature/login

# Tạo và chuyển
git checkout -b feature/dashboard
```

### 4.3. Tại sao `git switch` tốt hơn `git checkout`?

`git checkout` là lệnh "đa năng" quá mức -- nó làm quá nhiều việc:

| Hành động | `git checkout` | Lệnh hiện đại |
|-----------|---------------|---------------|
| Chuyển branch | `git checkout feature` | `git switch feature` |
| Tạo + chuyển branch | `git checkout -b feature` | `git switch -c feature` |
| Khôi phục file | `git checkout -- file.txt` | `git restore file.txt` |
| Khôi phục từ commit | `git checkout abc123 -- file.txt` | `git restore --source abc123 file.txt` |

Vấn đề của `git checkout`:

```bash
# Chuyển sang branch tên "main"? Hay khôi phục file tên "main"?
git checkout main
# Git phải đoán ý bạn -- dễ gây nhầm lẫn!

# Với git switch/restore -- rõ ràng hơn:
git switch main          # Chuyển branch
git restore main         # Khôi phục file tên "main"
```

**Khuyên nghị:** Luôn dùng `git switch` và `git restore`. Chỉ dùng `git checkout` khi làm việc với Git phiên bản cũ (trước 2.23).

---

## 5. Naming conventions -- Quy tắc đặt tên branch

### 5.1. Các prefix phổ biến

| Prefix | Mục đích | Ví dụ |
|--------|----------|-------|
| `feature/` | Tính năng mới | `feature/user-authentication` |
| `bugfix/` | Sửa lỗi (không khẩn cấp) | `bugfix/login-redirect` |
| `hotfix/` | Sửa lỗi khẩn cấp trên production | `hotfix/payment-crash` |
| `release/` | Chuẩn bị release phiên bản mới | `release/v2.1.0` |
| `docs/` | Cập nhật tài liệu | `docs/api-guide` |
| `refactor/` | Tái cấu trúc code | `refactor/auth-module` |
| `test/` | Thêm hoặc sửa test | `test/integration-api` |
| `chore/` | Công việc bảo trì | `chore/update-dependencies` |

### 5.2. Quy tắc đặt tên tốt

```bash
# TỐT -- mô tả rõ ràng, có prefix
feature/user-authentication
bugfix/fix-login-redirect-loop
hotfix/payment-null-pointer

# XẤU -- không rõ ràng
my-branch
fix
test123
thuans-branch
```

**Nguyên tắc:**
- Dùng chữ thường và dấu gạch nối `-` (không dùng dấu cách, underscore)
- Bắt đầu bằng prefix phân loại
- Mô tả ngắn gọn nhưng đủ hiểu
- Có thể thêm ticket ID: `feature/JIRA-123-user-auth`

---

## 6. Branch tracking -- Local vs Remote

### 6.1. Local branch vs Remote branch

```
Local (máy bạn)              Remote (GitHub/GitLab)
-----------------            ---------------------
main                    -->  origin/main
feature/login           -->  origin/feature/login
bugfix/header           -->  (chưa push lên)
                              origin/develop (chưa pull về)
```

- **Local branch:** Chỉ tồn tại trên máy bạn
- **Remote-tracking branch:** Bản sao của branch trên remote, lưu ở local với tên `origin/<branch>`
- **Tracking relationship:** Liên kết giữa local và remote branch

### 6.2. Thiết lập tracking

```bash
# Push branch mới lên remote và thiết lập tracking
git push -u origin feature/login
# -u = --set-upstream
# Lần sau chỉ cần: git push (không cần chỉ định remote và branch)

# Xem tracking information
git branch -vv
# Kết quả:
#   feature/login  a1b2c3d [origin/feature/login] Thêm form login
# * main           e4f5g6h [origin/main] Update README
#   bugfix/header  i7j8k9l Sửa header  <-- không có tracking

# Thiết lập tracking cho branch đã tồn tại
git branch --set-upstream-to=origin/feature/login feature/login
# Hoặc ngắn hơn:
git branch -u origin/feature/login
```

### 6.3. Fetch vs Pull

```bash
# Fetch: tải về thông tin từ remote (KHÔNG merge)
git fetch origin
# Cập nhật tất cả remote-tracking branches
# Bạn có thể xem thay đổi trước khi merge

# Pull: fetch + merge (hoặc rebase)
git pull origin main
# Tương đương:
# git fetch origin
# git merge origin/main
```

---

## 7. ASCII diagram -- Branch diverge và merge

```
# Ban đầu: chỉ có main
main: A---B---C

# Tạo feature/login từ commit C
main:          A---B---C
                        \
feature/login:           (đang ở C)

# Làm việc trên cả 2 branch
main:          A---B---C---D---E
                        \
feature/login:           F---G---H

# Merge feature/login vào main
main:          A---B---C---D---E---M  (merge commit)
                        \         /
feature/login:           F---G---H

# Sau khi merge, có thể xoá feature/login
main:          A---B---C---D---E---M
```

Xem trực quan bằng lệnh:
```bash
git log --oneline --graph --all
# Kết quả:
# *   M (HEAD -> main) Merge branch 'feature/login'
# |\
# | * H (feature/login) Hoàn thiện login
# | * G Thêm validation
# | * F Tạo form login
# * | E Update homepage
# * | D Thêm footer
# |/
# * C Initial commit
# * B Thêm README
# * A First commit
```

---

## 8. Quản lý branches -- Khi nào tạo, khi nào xoá

### 8.1. Khi nào tạo branch mới?

- **Bắt đầu tính năng mới** -- luôn tạo branch riêng
- **Sửa bug** -- tạo branch từ main hoặc release
- **Thí nghiệm** -- tạo branch để thử ý tưởng
- **Review code** -- mỗi PR tương ứng với một branch

**Nguyên tắc vàng:** Mỗi đơn vị công việc (feature, bugfix, task) = 1 branch.

### 8.2. Khi nào xoá branch?

```bash
# Sau khi đã merge thành công
git branch -d feature/login

# Kiểm tra các branch đã merge (an toàn để xoá)
git branch --merged main
# Liệt kê các branch đã merge vào main

# Dọn dẹp branch remote đã merge
git fetch --prune
# Xoá các remote-tracking branch mà remote đã xoá
```

### 8.3. Dọn dẹp branch định kỳ

```bash
# Xem các branch cũ (không hoạt động > 3 tháng)
git for-each-ref --sort=-committerdate --format='%(committerdate:short) %(refname:short)' refs/heads/

# Xoá tất cả branch đã merge (trừ main và develop)
git branch --merged main | grep -v "main\|develop" | xargs git branch -d
```

---

## 9. Thực hành -- Bài tập tự làm

### Bài tập 1: Tạo và quản lý branch

```bash
# 1. Tạo thư mục dự án mới
mkdir git-branch-practice && cd git-branch-practice
git init

# 2. Tạo commit đầu tiên trên main
echo "# My Project" > README.md
git add README.md
git commit -m "Initial commit"

# 3. Tạo branch feature/header
git switch -c feature/header

# 4. Làm việc trên feature/header
echo "<header>My Header</header>" > header.html
git add header.html
git commit -m "Thêm header"

# 5. Quay lại main
git switch main

# 6. Tạo branch feature/footer
git switch -c feature/footer
echo "<footer>My Footer</footer>" > footer.html
git add footer.html
git commit -m "Thêm footer"

# 7. Xem tất cả branches
git branch -v

# 8. Xem graph
git log --oneline --graph --all
```

### Bài tập 2: Xoá branch

```bash
# Merge feature/header vào main trước
git switch main
git merge feature/header

# Xoá branch đã merge
git branch -d feature/header
# Thành công!

# Thử xoá branch chưa merge
git branch -d feature/footer
# error: The branch 'feature/footer' is not fully merged
# Git bảo vệ bạn! Dùng -D nếu chắc chắn muốn xoá
```

---

## 10. Lỗi thường gặp

### Lỗi 1: Quên commit trước khi chuyển branch

```bash
# Đang edit file trên feature/login
# Chuyển sang main mà chưa commit
git switch main
# Các thay đổi CHƯA COMMIT sẽ đi theo bạn sang main!
# => Dùng git stash hoặc commit trước khi chuyển

# Cách xử lý:
git stash                    # Cất tạm thay đổi
git switch main              # Chuyển branch
# ... làm việc ...
git switch feature/login     # Quay lại
git stash pop                # Lấy lại thay đổi
```

### Lỗi 2: Xoá nhầm branch chưa merge

```bash
# Xoá nhầm bằng -D
git branch -D feature/important
# OH NO!

# Cứu bằng reflog (trong vòng 30 ngày)
git reflog
# Tìm hash commit cuối của branch đã xoá
# abc1234 HEAD@{5}: commit: Tính năng quan trọng

git switch -c feature/important abc1234
# Phục hồi thành công!
```

### Lỗi 3: Tạo branch từ sai vị trí

```bash
# Muốn tạo branch từ main nhưng đang ở feature/old
git switch -c feature/new
# Branch mới sẽ bắt đầu từ feature/old, không phải main!

# Cách đúng:
git switch -c feature/new main
# Chỉ định rõ: tạo từ main
```

### Lỗi 4: Tên branch có dấu cách hoặc ký tự đặc biệt

```bash
# SAI:
git switch -c "feature/my feature"    # Dấu cách
git switch -c feature/login@v2        # Ký tự @

# ĐÚNG:
git switch -c feature/my-feature      # Dấu gạch nối
git switch -c feature/login-v2        # Dấu gạch nối
```

---

## 11. Câu hỏi phỏng vấn

### Câu 1: Branch trong Git hoạt động như thế nào? Tại sao tạo branch trong Git nhanh hơn SVN?

**Trả lời:** Trong Git, branch chỉ là một **pointer (con trỏ) nhẹ** trỏ đến một commit cụ thể. Tạo branch chỉ cần tạo một file 41 bytes chứa commit hash -- thao tác O(1). Trong SVN, tạo branch nghĩa là **sao chép toàn bộ thư mục** dự án -- thao tác O(n) với n là kích thước dự án. Đây là lý do Git khuyến khích sử dụng branch nhiều, trong khi SVN coi branch là thao tác "nặng".

### Câu 2: HEAD là gì? Detached HEAD là gì và khi nào xảy ra?

**Trả lời:** `HEAD` là pointer trỏ đến branch hiện tại. Bình thường: `HEAD -> main -> commit-C`. **Detached HEAD** xảy ra khi HEAD trỏ trực tiếp vào một commit thay vì một branch (ví dụ: `git checkout abc1234`). Trong trạng thái này, các commit mới sẽ không thuộc branch nào và có thể bị mất khi chuyển branch. Cách xử lý: tạo branch mới từ vị trí đó bằng `git switch -c branch-name`.

### Câu 3: Sự khác nhau giữa `git switch` và `git checkout` là gì?

**Trả lời:** `git checkout` là lệnh cũ, làm nhiều việc cùng lúc: chuyển branch, khôi phục file, tạo branch. Từ Git 2.23, lệnh này được tách thành hai lệnh riêng biệt: `git switch` (chuyển/tạo branch) và `git restore` (khôi phục file). `git switch` an toàn hơn vì nó **chỉ làm một việc** -- chuyển branch, tránh nhầm lẫn giữa chuyển branch và khôi phục file.

### Câu 4: Làm thế nào để biết branch nào đã merge và có thể xoá an toàn?

**Trả lời:** Dùng `git branch --merged main` để liệt kê các branch đã merge vào main. Những branch này có thể xoá an toàn bằng `git branch -d`. Dùng `git branch --no-merged main` để xem các branch chưa merge -- cẩn thận khi xoá những branch này. Trong teamwork, thường dọn dẹp branch sau khi PR đã merge trên GitHub/GitLab.

### Câu 5: Giải thích sự khác nhau giữa local branch, remote branch và remote-tracking branch.

**Trả lời:**
- **Local branch** (`main`): tồn tại trên máy bạn, bạn có thể commit trực tiếp
- **Remote branch** (`origin/main` trên server): tồn tại trên server (GitHub/GitLab)
- **Remote-tracking branch** (`origin/main` trên máy bạn): bản sao local của remote branch, được cập nhật khi `git fetch`. Đây là "ảnh chụp" trạng thái của remote, giúp bạn so sánh local với remote mà không cần kết nối mạng

Lệnh `git fetch` cập nhật remote-tracking branches. Lệnh `git pull` = `git fetch` + `git merge`.

---

## Tóm tắt

| Lệnh | Chức năng |
|------|-----------|
| `git branch` | Liệt kê branches |
| `git branch <tên>` | Tạo branch mới |
| `git branch -d <tên>` | Xoá branch đã merge |
| `git branch -D <tên>` | Xoá branch (ép buộc) |
| `git branch -a` | Xem tất cả branches (cả remote) |
| `git branch -vv` | Xem tracking info |
| `git switch <tên>` | Chuyển branch |
| `git switch -c <tên>` | Tạo và chuyển branch |
| `git switch -` | Quay lại branch trước đó |
| `git push -u origin <tên>` | Push và thiết lập tracking |

**Ghi nhớ:** Branch trong Git rẻ và nhanh. Hãy tạo branch cho mỗi đơn vị công việc -- đừng ngại tạo nhiều branch!
