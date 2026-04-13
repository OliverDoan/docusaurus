---
sidebar_position: 4
title: "4. Cac lenh Git co ban"
---

# Các lệnh Git cơ bản

Bài này hướng dẫn chi tiết các lệnh Git bạn sẽ dùng **hàng ngày**. Mỗi lệnh đều được giải thích **tại sao dùng** và **khi nào dùng**, không chỉ là cú pháp.

---

## 1. git init — Tạo repository mới

### Công dụng

Khởi tạo một Git repository mới trong thư mục hiện tại. Lệnh này tạo thư mục `.git/` chứa toàn bộ cơ sở dữ liệu của Git.

### Cú pháp và ví dụ

```bash
# Tạo thư mục dự án và khởi tạo Git
mkdir my-project
cd my-project
git init
```

Output:

```
Initialized empty Git repository in /home/user/my-project/.git/
```

### Điều gì xảy ra khi chạy `git init`?

```bash
# Trước khi init
my-project/
└── (trống)

# Sau khi init
my-project/
└── .git/           <-- Thư mục ẩn, chứa toàn bộ Git database
    ├── HEAD
    ├── config
    ├── objects/
    ├── refs/
    └── ...
```

### Lưu ý quan trọng

```bash
# ĐỪNG init trong thư mục đã có Git repo
cd my-project
git init              # Lần đầu: OK
git init              # Lần hai: KHÔNG lỗi, nhưng không cần thiết
                      # Git sẽ nói "Reinitialized existing..."

# ĐỪNG init trong thư mục Home (lỗi phổ biến!)
cd ~
git init              # SAI! Sẽ biến toàn bộ home thành 1 repo
                      # Để gỡ: rm -rf ~/.git
```

### Khi nào dùng `git init`?

- Bắt đầu dự án mới từ đầu
- Muốn quản lý phiên bản cho thư mục có sẵn
- Không dùng khi muốn lấy code từ server (dùng `git clone`)

---

## 2. git clone — Sao chép repository

### Công dụng

Tạo bản sao đầy đủ của một remote repository (bao gồm toàn bộ lịch sử) về máy local.

### Cú pháp và ví dụ

```bash
# Clone bằng SSH (khuyên nghị — không cần nhập mật khẩu)
git clone git@github.com:username/repo-name.git

# Clone bằng HTTPS
git clone https://github.com/username/repo-name.git

# Clone vào thư mục có tên khác
git clone git@github.com:username/repo-name.git my-folder

# Clone chỉ 1 branch cụ thể (tiết kiệm thời gian)
git clone -b develop git@github.com:username/repo-name.git

# Shallow clone — chỉ lấy N commit gần nhất (nhanh hơn nhiều)
git clone --depth 1 git@github.com:username/repo-name.git
# Phù hợp khi: repo lớn, chỉ cần code mới nhất, CI/CD pipeline
```

### Clone làm gì chính xác?

```bash
git clone git@github.com:username/repo-name.git
```

Tương đương với:

```bash
mkdir repo-name
cd repo-name
git init
git remote add origin git@github.com:username/repo-name.git
git fetch origin
git checkout main
```

Nên `git clone` làm tất cả trong 1 lệnh.

### git init vs git clone

| Tình huống | Dùng lệnh |
|-----------|-----------|
| Dự án mới, chưa có trên server | `git init` |
| Lấy dự án đã có trên GitHub/GitLab | `git clone` |
| Đã có repo local, muốn kết nối remote | `git init` + `git remote add` |

---

## 3. git status — Xem trạng thái hiện tại

### Công dụng

Hiển thị trạng thái của Working Directory và Staging Area. Đây là lệnh bạn sẽ chạy **nhiều nhất**.

### Cú pháp và ví dụ

```bash
git status
```

### Đọc output của git status

```bash
On branch main                              # <- Bạn đang ở branch nào
Your branch is up to date with 'origin/main'. # <- So với remote

Changes to be committed:                     # <- ĐÃ STAGE (xanh lá)
  (use "git restore --staged <file>..." to unstage)
        new file:   login.js                 #    File mới đã stage
        modified:   index.html               #    File sửa đã stage

Changes not staged for commit:               # <- CHƯA STAGE (đỏ)
  (use "git add <file>..." to update)
        modified:   style.css                #    File sửa chưa stage

Untracked files:                             # <- FILE MỚI, Git chưa biết (đỏ)
  (use "git add <file>..." to include)
        README.md                            #    File mới chưa track
```

### Phiên bản ngắn gọn

```bash
git status -s
# hoặc
git status --short
```

```
A  login.js         # A  = Added (đã stage file mới)
M  index.html       # M  = Modified và đã stage
 M style.css        #  M = Modified nhưng chưa stage
?? README.md        # ?? = Untracked (file mới)
```

**Cách đọc 2 cột:**
- **Cột trái:** Trạng thái trong Staging Area
- **Cột phải:** Trạng thái trong Working Directory

| Ký hiệu | Cột trái (Staging) | Cột phải (Working) |
|---------|-------------------|-------------------|
| `M` | Đã sửa và stage | Đã sửa, chưa stage |
| `A` | File mới đã stage | — |
| `D` | Đã xoá và stage | Đã xoá, chưa stage |
| `?` | — | File mới, untracked |
| ` ` | Không thay đổi | Không thay đổi |

---

## 4. git add — Đưa file vào Staging Area

### Công dụng

Chuyển thay đổi từ Working Directory vào Staging Area, chuẩn bị cho commit tiếp theo.

### Cú pháp và ví dụ

```bash
# Thêm 1 file cụ thể
git add index.html

# Thêm nhiều file
git add index.html style.css app.js

# Thêm tất cả file trong thư mục hiện tại (và con)
git add .

# Thêm tất cả file đã thay đổi (tracked files only, không thêm untracked)
git add -u

# Thêm tất cả file (bao gồm untracked)
git add -A
# hoặc
git add --all
```

### git add -p — Thêm từng phần của file (NÂNG CAO nhưng RẤT HAY)

Khi bạn sửa nhiều chỗ trong 1 file nhưng chỉ muốn stage một phần:

```bash
git add -p style.css
```

Git sẽ hiển thị từng "hunk" (đoạn thay đổi) và hỏi bạn:

```diff
@@ -10,6 +10,8 @@
 body {
   margin: 0;
   padding: 0;
+  background: #f5f5f5;     <-- Thay đổi 1
+  font-family: sans-serif; <-- Thay đổi 2
 }

Stage this hunk [y,n,q,a,d,s,e,?]?
```

| Phím | Ý nghĩa |
|------|---------|
| `y` | Stage đoạn này (yes) |
| `n` | Bỏ qua đoạn này (no) |
| `q` | Thoát (không stage gì thêm) |
| `a` | Stage đoạn này và tất cả các đoạn còn lại |
| `d` | Bỏ qua đoạn này và tất cả các đoạn còn lại |
| `s` | Chia đoạn này thành các đoạn nhỏ hơn |
| `e` | Sửa bằng tay đoạn nào muốn stage |

**Tại sao dùng `git add -p`?**

Ví dụ bạn đang sửa file và vô tình thêm 1 dòng `console.log` để debug. Bạn muốn commit tính năng nhưng không muốn commit dòng debug:

```bash
git add -p app.js
# Đoạn 1: tính năng mới -> y (stage)
# Đoạn 2: console.log debug -> n (bỏ qua)
```

---

## 5. git commit — Lưu thay đổi vào Repository

### Công dụng

Tạo một commit mới từ những gì đang ở Staging Area. Đây là "save game" của Git.

### Cú pháp và ví dụ

```bash
# Commit với message ngắn gọn
git commit -m "feat: them tinh nang dang nhap"

# Commit với message nhiều dòng
git commit -m "feat: them tinh nang dang nhap

- Them form dang nhap
- Them validation email
- Them xu ly loi 401"

# Mở editor để viết message (hữu ích cho message dài)
git commit
# -> Editor mở ra, viết message, lưu và đóng

# Commit tất cả file đã tracked và modified (bỏ qua git add)
git commit -am "fix: sua loi hien thi"
# Chú ý: -am CHỈ áp dụng cho file ĐÃ TRACKED, không thêm file mới
```

### git commit --amend — Sửa commit cuối cùng

```bash
# Tình huống: Bạn vừa commit nhưng quên add 1 file
git add forgotten-file.js
git commit --amend
# -> Gộp file mới vào commit cuối, không tạo commit mới

# Sửa commit message cuối cùng
git commit --amend -m "feat: them tinh nang dang nhap hoan chinh"
```

**CẢNH BÁO:** Chỉ dùng `--amend` cho commit **chưa push** lên remote. Nếu đã push, amend sẽ thay đổi lịch sử và gây conflict cho người khác.

### Viết commit message tốt

```bash
# SAI: Mơ hồ, không rõ làm gì
git commit -m "fix bug"
git commit -m "update"
git commit -m "asdfgh"

# ĐÚNG: Rõ ràng, theo Conventional Commits
git commit -m "feat: them chuc nang tim kiem san pham"
git commit -m "fix: sua loi khong hien thi avatar user"
git commit -m "refactor: tach component UserCard thanh file rieng"
git commit -m "docs: them huong dan cai dat"
git commit -m "test: them unit test cho UserService"
```

**Format Conventional Commits:**

```
<type>: <mô tả ngắn gọn>

<body - giải thích chi tiết (tuỳ chọn)>
```

| Type | Khi nào dùng |
|------|-------------|
| `feat` | Thêm tính năng mới |
| `fix` | Sửa lỗi |
| `refactor` | Refactor code (không đổi hành vi) |
| `docs` | Thay đổi documentation |
| `test` | Thêm/sửa test |
| `chore` | Công việc bảo trì (update dependency...) |
| `perf` | Cải thiện hiệu năng |
| `style` | Sửa format code (không đổi logic) |
| `ci` | Thay đổi CI/CD pipeline |

---

## 6. git diff — So sánh sự khác biệt

### Công dụng

Hiển thị sự khác biệt giữa các trạng thái của file. Giúp bạn biết chính xác đã thay đổi gì trước khi commit.

### Cú pháp và ví dụ

```bash
# So sánh Working Directory vs Staging Area
# (những thay đổi CHƯA STAGE)
git diff

# So sánh Staging Area vs Repository
# (những thay đổi ĐÃ STAGE, sắp được commit)
git diff --staged
# hoặc
git diff --cached    # Giống --staged

# So sánh Working Directory vs Repository
# (TẤT CẢ thay đổi, cả staged và unstaged)
git diff HEAD

# So sánh giữa 2 commit
git diff abc1234 def5678

# So sánh giữa 2 branch
git diff main feature

# Chỉ xem tên file đã thay đổi (không xem nội dung)
git diff --name-only

# Xem thống kê thay đổi (số dòng thêm/xoá)
git diff --stat
```

### Đọc output của git diff

```diff
diff --git a/index.html b/index.html    <-- File được so sánh
index 1234567..abcdefg 100644           <-- Hash của 2 version
--- a/index.html                        <-- Phiên bản cũ (trước thay đổi)
+++ b/index.html                        <-- Phiên bản mới (sau thay đổi)
@@ -10,6 +10,8 @@                       <-- Vị trí thay đổi: dòng 10, 6 dòng cũ -> 8 dòng mới
 <body>                                  <-- Dòng không đổi (context)
   <h1>Hello</h1>                        <-- Dòng không đổi
+  <nav>                                 <-- Dòng THÊM MỚI (dấu +, màu xanh)
+    <a href="/">Home</a>                <-- Dòng THÊM MỚI
+  </nav>                                <-- Dòng THÊM MỚI
-  <p>Old paragraph</p>                  <-- Dòng ĐÃ XOÁ (dấu -, màu đỏ)
+  <p>New paragraph</p>                  <-- Dòng THAY THẾ (thêm dòng mới)
   <script src="app.js"></script>         <-- Dòng không đổi
 </body>
```

### Các trường hợp so sánh

```
                    git diff           git diff --staged        git diff HEAD
                   (unstaged)            (staged)              (tất cả)
                       |                    |                      |
Working Directory  <---|                    |                      |
        |              |    Staging Area <--|                      |
        |              |         |          |     Repository  <----|
        v              v         v          v         |            |
   [file đã sửa]   [chưa add]  [đã add]   [sắp      [đã          [mọi thay
                                           commit]   commit]      đổi]
```

---

## 7. git log — Xem lịch sử commit

### Công dụng

Hiển thị lịch sử các commit, từ mới nhất đến cũ nhất.

### Cú pháp và các option hữu ích

```bash
# Xem log mặc định (đầy đủ thông tin)
git log

# Mỗi commit trên 1 dòng (ngắn gọn)
git log --oneline

# Xem với sơ đồ branching
git log --oneline --graph

# Xem tất cả branches (không chỉ branch hiện tại)
git log --oneline --graph --all

# Xem với tên branch và tag
git log --oneline --graph --all --decorate

# Giới hạn số lượng commit
git log -5                    # Chỉ xem 5 commit gần nhất
git log --oneline -10        # 10 commit, dạng ngắn gọn

# Lọc theo tác giả
git log --author="Nguyen Van A"

# Lọc theo thời gian
git log --since="2025-01-01"
git log --since="2 weeks ago"
git log --after="2025-03-01" --before="2025-03-31"

# Lọc theo nội dung commit message
git log --grep="fix"          # Tìm commit có "fix" trong message
git log --grep="login" -i     # Tìm không phân biệt hoa thường

# Lọc theo file cụ thể
git log -- index.html         # Chỉ xem commit liên quan đến file này

# Lọc theo nội dung code
git log -S "function login"   # Tìm commit thay đổi chứa chuỗi này
# (rất hữu ích khi muốn biết ai thêm/xoá 1 đoạn code)

# Format tuỳ chỉnh
git log --pretty=format:"%h - %an, %ar : %s"
# abc1234 - Nguyen Van A, 2 hours ago : feat: them login
```

### Đọc output của git log

```bash
git log
```

```
commit a1b2c3d4e5f6 (HEAD -> main, origin/main)  <-- Hash, branches
Author: Nguyen Van A <email>                       <-- Tác giả
Date:   Mon Mar 25 10:30:00 2025 +0700            <-- Ngày

    feat: them tinh nang dang nhap                 <-- Message

commit f4e5d6c7b8a9                               <-- Commit trước đó
Author: Tran Van B <email>
Date:   Sun Mar 24 15:00:00 2025 +0700

    fix: sua loi hien thi trang chu
```

### Lệnh log tôi khuyên nghị thiết lập alias

```bash
git config --global alias.lg "log --oneline --graph --all --decorate"
```

Sau đó dùng:

```bash
git lg
```

```
* a1b2c3d (HEAD -> main) feat: them login
* f4e5d6c fix: sua loi trang chu
| * b7c8d9e (feature/register) feat: them dang ky
|/
* e0f1a2b init project
```

---

## 8. git show — Xem chi tiết 1 commit

### Công dụng

Hiển thị chi tiết nội dung của một commit cụ thể — bao gồm metadata và diff.

### Cú pháp và ví dụ

```bash
# Xem commit mới nhất
git show

# Xem commit cụ thể
git show a1b2c3d

# Chỉ xem metadata, không xem diff
git show --stat a1b2c3d

# Xem nội dung 1 file tại 1 commit cụ thể
git show a1b2c3d:index.html
# -> Hiển thị nội dung file index.html tại thời điểm commit a1b2c3d

# Xem file tại HEAD (commit hiện tại)
git show HEAD:src/app.js
```

### Ví dụ output

```bash
git show a1b2c3d
```

```
commit a1b2c3d4e5f6
Author: Nguyen Van A <nguyenvana@example.com>
Date:   Mon Mar 25 10:30:00 2025 +0700

    feat: them tinh nang dang nhap

diff --git a/login.js b/login.js
new file mode 100644
index 0000000..1234567
--- /dev/null
+++ b/login.js
@@ -0,0 +1,15 @@
+function login(email, password) {
+  // Kiem tra dau vao
+  if (!email || !password) {
+    throw new Error('Email va password bat buoc')
+  }
+  // Goi API
+  return fetch('/api/login', {
+    method: 'POST',
+    body: JSON.stringify({ email, password })
+  })
+}
```

---

## 9. Bảng tổng hợp các lệnh

| Lệnh | Công dụng | Dùng khi |
|------|-----------|----------|
| `git init` | Tạo repo mới | Bắt đầu dự án mới |
| `git clone <url>` | Sao chép repo | Lấy code từ server |
| `git status` | Xem trạng thái | Trước khi add/commit |
| `git add <file>` | Stage file | Chuẩn bị commit |
| `git add .` | Stage tất cả | Commit toàn bộ thay đổi |
| `git add -p` | Stage từng phần | Chọn lọc thay đổi |
| `git commit -m "msg"` | Lưu thay đổi | Sau khi stage |
| `git commit -am "msg"` | Add + commit | Nhanh, chỉ file tracked |
| `git commit --amend` | Sửa commit cuối | Quên file/sai message |
| `git diff` | Xem thay đổi chưa stage | Trước khi add |
| `git diff --staged` | Xem thay đổi đã stage | Trước khi commit |
| `git log` | Xem lịch sử | Kiểm tra lịch sử |
| `git log --oneline --graph` | Xem lịch sử đẹp | Tổng quan nhanh |
| `git show <hash>` | Chi tiết 1 commit | Xem commit cụ thể |

---

## 10. Workflow thực tế: Từ 0 đến commit đầu tiên

Hãy làm theo từng bước:

```bash
# Bước 1: Tạo thư mục dự án
mkdir todo-app
cd todo-app

# Bước 2: Khởi tạo Git
git init
# -> Initialized empty Git repository

# Bước 3: Tạo file đầu tiên
echo '<!DOCTYPE html>
<html>
<head><title>Todo App</title></head>
<body>
  <h1>My Todo App</h1>
</body>
</html>' > index.html

# Bước 4: Kiểm tra trạng thái
git status
# -> Untracked files: index.html (đỏ)

# Bước 5: Stage file
git add index.html
git status
# -> Changes to be committed: new file: index.html (xanh)

# Bước 6: Commit
git commit -m "feat: tao trang HTML co ban cho todo app"
# -> [main (root-commit) abc1234] feat: tao trang HTML co ban

# Bước 7: Kiểm tra log
git log --oneline
# abc1234 (HEAD -> main) feat: tao trang HTML co ban

# Bước 8: Tiếp tục làm việc — thêm CSS
echo 'body { font-family: sans-serif; margin: 2rem; }
h1 { color: #333; }' > style.css

# Bước 9: Kiểm tra thay đổi
git status
# -> Untracked files: style.css

git add style.css
git commit -m "feat: them file CSS co ban"

# Bước 10: Xem lịch sử
git log --oneline
# def5678 (HEAD -> main) feat: them file CSS co ban
# abc1234 feat: tao trang HTML co ban

# Bước 11: Sửa file và xem diff
# (Sửa index.html, thêm link CSS)
git diff
# -> Hiển thị dòng đã thêm/xoá

git add .
git commit -m "feat: ket noi CSS vao trang HTML"

# Xem lịch sử hoàn chỉnh
git log --oneline --graph
# * ghi7890 (HEAD -> main) feat: ket noi CSS vao trang HTML
# * def5678 feat: them file CSS co ban
# * abc1234 feat: tao trang HTML co ban
```

---

## 11. Lỗi thường gặp

### Lỗi 1: Commit không có gì (empty commit)

```bash
git commit -m "them tinh nang"
# nothing to commit, working tree clean

# Nguyên nhân: Chưa git add!
# Sửa:
git add .
git commit -m "them tinh nang"
```

### Lỗi 2: Dùng `git add .` ở thư mục sai

```bash
# Bạn đang ở thư mục con nhưng muốn add tất cả
cd src/
git add .       # Chỉ add file trong src/, không phải toàn bộ project!

# Sửa: Quay về root hoặc dùng đường dẫn
cd ..
git add .       # Add từ root

# Hoặc dùng -A từ bất kỳ đâu
git add -A      # Add toàn bộ thay đổi trong repo
```

### Lỗi 3: Commit nhầm file

```bash
# Tình huống: vừa commit nhầm file .env (chứa mật khẩu!)

# Cách 1: Xoá file khỏi commit cuối (nếu CHƯA push)
git reset HEAD~1                    # Undo commit cuối
git reset HEAD .env                 # Unstage file .env
echo ".env" >> .gitignore          # Thêm vào gitignore
git add .gitignore
git commit -m "chore: them .env vao gitignore"

# Cách 2: Nếu ĐÃ push — cần xoá khỏi toàn bộ lịch sử
# (Xem bài về .gitignore và quản lý file)
```

### Lỗi 4: Quên message khi commit

```bash
# Git mở editor (thường là vim) khi không có -m
git commit
# -> vim mở ra, bạn không biết cách dùng

# Cách 1: Trong vim, nhấn i để vào Insert mode, gõ message
#          Nhấn Esc, gõ :wq Enter

# Cách 2: Đổi editor (xem bài Cài đặt và cấu hình)
git config --global core.editor "code --wait"

# Cách 3: Luôn dùng -m
git commit -m "message của bạn"
```

### Lỗi 5: `git commit -am` không thêm file mới

```bash
# Tạo file mới
touch new-feature.js

git commit -am "them tinh nang moi"
# -> new-feature.js KHÔNG được commit!

# Lý do: -a chỉ add file ĐÃ TRACKED (đã commit trước đó)
# File mới (untracked) phải dùng git add trước

# Sửa:
git add new-feature.js
git commit -m "them tinh nang moi"
```

---

## 12. Câu hỏi phỏng vấn

### Câu 1: Sự khác nhau giữa `git add .` và `git add -A`?

**Trả lời mẫu:**

> `git add .` thêm tất cả file mới, đã sửa, đã xoá **trong thư mục hiện tại và các thư mục con**. `git add -A` (hoặc `--all`) thêm tất cả thay đổi **trong toàn bộ repository**, bất kể bạn đang ở thư mục nào. Khi bạn đang ở root của repo, 2 lệnh cho kết quả giống nhau. Khác biệt chỉ xuất hiện khi bạn đang ở thư mục con.

### Câu 2: `git diff` và `git diff --staged` khác nhau thế nào?

**Trả lời mẫu:**

> `git diff` so sánh Working Directory với Staging Area — cho thấy những thay đổi chưa được `git add`. `git diff --staged` (hoặc `--cached`) so sánh Staging Area với commit cuối cùng — cho thấy những thay đổi đã `git add` và sẽ được commit. Để xem tất cả thay đổi (cả staged và unstaged), dùng `git diff HEAD`.

### Câu 3: Làm sao để undo commit cuối cùng?

**Trả lời mẫu:**

> Có 3 cách tuỳ theo mức độ:
> - `git reset --soft HEAD~1`: Undo commit, giữ file trong Staging Area. Thích hợp khi muốn sửa message hoặc thêm file.
> - `git reset --mixed HEAD~1` (mặc định): Undo commit, chuyển file về Working Directory. Thích hợp khi muốn stage lại theo cách khác.
> - `git reset --hard HEAD~1`: Undo commit VÀ xoá mọi thay đổi. **NGUY HIỂM** — mất dữ liệu vĩnh viễn.
> - `git commit --amend`: Không undo mà sửa commit cuối (đổi message, thêm file). Chỉ dùng khi chưa push.

### Câu 4: Giải thích `git commit -am` và hạn chế của nó.

**Trả lời mẫu:**

> `git commit -am "message"` kết hợp `git add` và `git commit` trong 1 lệnh. Flag `-a` tự động stage tất cả file **đã tracked** (đã commit trước đó) mà có thay đổi. Hạn chế: nó **không** thêm file mới (untracked files). File mới phải được `git add` riêng trước khi commit. Nên `-am` chỉ tiện khi làm việc với file đã có, không phù hợp khi tạo file mới.

### Câu 5: `git clone --depth 1` là gì và khi nào nên dùng?

**Trả lời mẫu:**

> `--depth 1` tạo một "shallow clone" — chỉ tải commit mới nhất, không tải toàn bộ lịch sử. Điều này làm giảm đáng kể thời gian và dung lượng khi clone repo lớn. Sử dụng trong: CI/CD pipeline (chỉ cần build code mới nhất), thử nhanh code người khác, repo có lịch sử quá lớn. Hạn chế: không thể xem full log, không thể push thay đổi (trong một số trường hợp), và một số thao tác Git sẽ bị giới hạn.

---

## Tổng kết luồng làm việc hàng ngày

```
+-------+     +--------+     +--------+     +---------+
| Viết  | --> | Kiểm   | --> | Stage  | --> | Commit  |
| code  |     | tra    |     | (add)  |     |         |
+-------+     +--------+     +--------+     +---------+
                  |
              git status
              git diff
```

10 lệnh bạn dùng mỗi ngày:

```bash
git status              # 1. Xem trạng thái
git diff                # 2. Xem thay đổi
git add <file>          # 3. Stage file
git commit -m "msg"     # 4. Commit
git log --oneline       # 5. Xem lịch sử
git show                # 6. Xem commit cuối
git diff --staged       # 7. Xem thay đổi đã stage
git add -p              # 8. Stage chọn lọc
git commit --amend      # 9. Sửa commit cuối
git clone               # 10. Clone repo
```

**Bước tiếp theo:** Tìm hiểu về `.gitignore` và cách quản lý file trong Git.
