---
sidebar_position: 5
title: "5. .gitignore va quan ly file"
---

# .gitignore và quản lý file

Không phải mọi file trong dự án đều nên được Git theo dõi. File tạm, mật khẩu, thư mục build, dependency... nên được **loại trừ** khỏi version control. Bài này hướng dẫn cách làm điều đó và quản lý file hiệu quả trong Git.

---


---

## Mục lục

- [1. .gitignore là gì?](#1-gitignore-là-gì)
- [2. Cú pháp .gitignore](#2-cú-pháp-gitignore)
- [3. Template .gitignore cho các loại project](#3-template-gitignore-cho-các-loại-project)
- [4. Global .gitignore](#4-global-gitignore)
- [5. .gitkeep — Track thư mục rỗng](#5-gitkeep-track-thư-mục-rỗng)
- [6. git rm — Xoá file khỏi Git](#6-git-rm-xoá-file-khỏi-git)
- [7. git mv — Đổi tên / Di chuyển file](#7-git-mv-đổi-tên-di-chuyển-file)
- [8. Xử lý file đã commit nhầm](#8-xử-lý-file-đã-commit-nhầm)
- [9. git clean — Dọn dẹp untracked files](#9-git-clean-dọn-dẹp-untracked-files)
- [10. Kiểm tra .gitignore có hoạt động không](#10-kiểm-tra-gitignore-có-hoạt-động-không)
- [11. Bảng cú pháp .gitignore patterns](#11-bảng-cú-pháp-gitignore-patterns)
- [12. Lỗi thường gặp](#12-lỗi-thường-gặp)
- [13. Câu hỏi phỏng vấn](#13-câu-hỏi-phỏng-vấn)
- [Tổng kết](#tổng-kết)

---

## 1. .gitignore là gì?

`.gitignore` là file đặc biệt mà Git đọc để biết **những file/thư mục nào cần bỏ qua** — không track, không commit.

### Tại sao cần .gitignore?

| Loại file | Lý do bỏ qua | Ví dụ |
|-----------|-------------|-------|
| **Dependencies** | Có thể tải lại bằng package manager | `node_modules/`, `venv/` |
| **Build output** | Được tạo từ source code | `dist/`, `build/`, `*.class` |
| **File tạm** | Không có giá trị | `*.tmp`, `*.swp`, `.DS_Store` |
| **Secrets** | **NGUY HIỂM** nếu commit | `.env`, `credentials.json` |
| **IDE config** | Riêng từng người | `.idea/`, `.vscode/settings.json` |
| **OS files** | Hệ điều hành tạo ra | `.DS_Store`, `Thumbs.db` |
| **Log files** | Dữ liệu runtime | `*.log`, `logs/` |

### Ví dụ thực tế

```bash
# KHÔNG CÓ .gitignore:
git status
# Hiển thị 10,000+ file trong node_modules/  <-- Hỗn loạn!

# CÓ .gitignore:
echo "node_modules/" >> .gitignore
git status
# Chỉ hiển thị file CỦA BẠN  <-- Sạch sẽ!
```

---

## 2. Cú pháp .gitignore

### Các pattern cơ bản

```gitignore
# Đây là comment — Git sẽ bỏ qua dòng này

# Bỏ qua 1 file cụ thể
secret.key
config.local.json

# Bỏ qua toàn bộ thư mục (chú ý dấu / ở cuối)
node_modules/
dist/
build/
.cache/

# Bỏ qua tất cả file có đuôi cụ thể
*.log
*.tmp
*.swp
*.class
*.pyc

# Bỏ qua file bắt đầu bằng dấu chấm
.env
.DS_Store

# Bỏ qua tất cả file .env (bao gồm .env.local, .env.production...)
.env*
```

### Ký tự đặc biệt (Wildcards)

| Pattern | Ý nghĩa | Ví dụ |
|---------|---------|-------|
| `*` | Bất kỳ chuỗi nào (không chứa `/`) | `*.log` = tất cả file .log |
| `**` | Bất kỳ chuỗi nào (BAO GỒM `/`) | `**/logs` = thư mục logs ở bất kỳ đâu |
| `?` | Bất kỳ 1 ký tự | `file?.txt` = file1.txt, fileA.txt |
| `[abc]` | Một trong các ký tự | `file[123].txt` = file1.txt, file2.txt |
| `[0-9]` | Phạm vi ký tự | `file[0-9].txt` = file0.txt đến file9.txt |
| `/` ở đầu | Chỉ ở thư mục root | `/build` = chỉ thư mục build ở root |
| `/` ở cuối | Chỉ áp dụng cho thư mục | `logs/` = thư mục logs, không phải file logs |
| `!` | Ngoại lệ — KHÔNG bỏ qua | `!important.log` = track file này dù có `*.log` |

### Ví dụ nâng cao

```gitignore
# Bỏ qua tất cả file .log
*.log

# NHƯNG giữ lại error.log (dấu ! là ngoại lệ)
!error.log

# Bỏ qua thư mục build ở root, nhưng không bỏ qua src/build/
/build/

# Bỏ qua tất cả file .txt trong thư mục doc/ và các thư mục con
doc/**/*.txt

# Bỏ qua tất cả thư mục tên "temp" ở bất kỳ cấp nào
**/temp/

# Bỏ qua tất cả file trong logs/ nhưng giữ thư mục logs/
logs/*
!logs/.gitkeep
```

### Thứ tự ưu tiên

Khi có nhiều rule mâu thuẫn, **rule cuối cùng thắng**:

```gitignore
# Rule 1: Bỏ qua tất cả file .log
*.log

# Rule 2: Nhưng giữ error.log
!error.log

# Kết quả: tất cả .log bị bỏ qua TRỪ error.log
```

**CẢNH BÁO:** Không thể "un-ignore" file trong thư mục đã bị ignore:

```gitignore
# Không hoạt động như mong đợi!
build/
!build/important.js    # KHÔNG CÓ TÁC DỤNG vì build/ đã bị ignore hoàn toàn

# Sửa: Dùng pattern cụ thể hơn
build/*                 # Ignore nội dung trong build/
!build/important.js     # Giữ file này — BÂY GIỜ HOẠT ĐỘNG
```

---

## 3. Template .gitignore cho các loại project

### Node.js / JavaScript / TypeScript

```gitignore
# Dependencies
node_modules/
package-lock.json    # Tuỳ dự án — nhiều team MUỐN commit file này

# Build output
dist/
build/
.next/
out/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Test coverage
coverage/

# Cache
.cache/
.eslintcache
.parcel-cache/
```

### Java

```gitignore
# Compiled
*.class
*.jar
*.war
*.ear

# Build tools
target/             # Maven
build/              # Gradle
.gradle/

# IDE
.idea/
*.iml
*.iws
.classpath
.project
.settings/
bin/

# OS
.DS_Store
Thumbs.db

# Environment
.env

# Logs
*.log
```

### Python

```gitignore
# Byte-compiled
__pycache__/
*.py[cod]
*.pyo
*.pyd

# Virtual environment
venv/
.venv/
env/
.env/

# Distribution
dist/
build/
*.egg-info/
*.egg

# IDE
.idea/
.vscode/
*.swp

# Environment
.env
.env.local

# Jupyter
.ipynb_checkpoints/

# Test
.pytest_cache/
htmlcov/
.coverage
.tox/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
```

### Đâu tìm template?

GitHub cung cấp template cho hầu hết ngôn ngữ tại: `github.com/github/gitignore`

```bash
# Khi tạo repo trên GitHub, có thể chọn template sẵn
# Hoặc tải về:
curl -o .gitignore https://raw.githubusercontent.com/github/gitignore/main/Node.gitignore
```

---

## 4. Global .gitignore

Những file **riêng của bạn** (IDE config, OS files) nên được ignore **toàn cục** thay vì thêm vào mỗi dự án.

### Thiết lập

```bash
# Tạo file global gitignore
touch ~/.gitignore_global

# Cấu hình Git sử dụng nó
git config --global core.excludesFile ~/.gitignore_global
```

### Nội dung gợi ý cho ~/.gitignore_global

```gitignore
# macOS
.DS_Store
.AppleDouble
.LSOverride
._*

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini

# Linux
*~
.Trash-*

# IDE — Visual Studio Code
.vscode/
*.code-workspace

# IDE — JetBrains (IntelliJ, WebStorm, PyCharm...)
.idea/
*.iml

# IDE — Vim
*.swp
*.swo
*~

# IDE — Sublime Text
*.sublime-project
*.sublime-workspace
```

**Tại sao dùng global thay vì local?**

| Cách | Khi nào dùng |
|------|-------------|
| Global gitignore | File riêng của BẠN: IDE, OS (không liên quan dự án) |
| Local .gitignore (trong repo) | File riêng của DỰ ÁN: node_modules, build, .env |

Không nên thêm `.idea/` hay `.DS_Store` vào `.gitignore` của dự án — vì không phải ai cũng dùng IntelliJ hay macOS. Mỗi người tự cấu hình global của mình.

---

## 5. .gitkeep — Track thư mục rỗng

Git **không track thư mục rỗng**. Nếu bạn cần giữ một thư mục trong repo (ví dụ: `uploads/`, `logs/`), tạo file `.gitkeep` bên trong:

```bash
# Git sẽ bỏ qua thư mục rỗng
mkdir uploads
git add uploads/
# -> Không có gì để add!

# Giải pháp: Thêm file .gitkeep
mkdir uploads
touch uploads/.gitkeep
git add uploads/.gitkeep
git commit -m "chore: tao thu muc uploads"
```

**Lưu ý:** `.gitkeep` không phải tính năng của Git — nó chỉ là **convention** (quy ước) của cộng đồng. Bạn có thể đặt tên bất kỳ (`.keep`, `.placeholder`...) nhưng `.gitkeep` là phổ biến nhất.

### Kết hợp với .gitignore

Trường hợp phổ biến: Giữ thư mục `logs/` nhưng không track nội dung:

```gitignore
# .gitignore
logs/*           # Ignore tất cả file trong logs/
!logs/.gitkeep   # Ngoại trừ .gitkeep
```

---

## 6. git rm — Xoá file khỏi Git

### Xoá file khỏi cả Git và ổ cứng

```bash
# Xoá file khỏi Git tracking VÀ xoá file thực trên ổ cứng
git rm old-file.js
git commit -m "chore: xoa file khong con dung"

# Kết quả: file bị xoá khỏi thư mục VÀ khỏi Git tracking
```

### Xoá file khỏi Git nhưng GIỮ trên ổ cứng

```bash
# Chỉ xoá khỏi Git tracking, giữ file trên máy
git rm --cached secret.env
git commit -m "chore: xoa secret.env khoi Git tracking"

# File secret.env vẫn còn trên máy nhưng Git không track nữa
# Nhớ thêm vào .gitignore để không vô tình add lại:
echo "secret.env" >> .gitignore
git add .gitignore
git commit -m "chore: them secret.env vao gitignore"
```

**Khi nào dùng `--cached`?**

| Tình huống | Lệnh |
|-----------|------|
| File không cần nữa, xoá luôn | `git rm file.txt` |
| File cần giữ trên máy, chỉ xoá khỏi Git | `git rm --cached file.txt` |
| Xoá cả thư mục | `git rm -r folder/` |
| Xoá thư mục khỏi Git, giữ trên máy | `git rm -r --cached folder/` |

### Ví dụ thực tế: Xoá node_modules đã commit nhầm

```bash
# Ôi không! Ai đó đã commit node_modules/
git rm -r --cached node_modules/
echo "node_modules/" >> .gitignore
git add .gitignore
git commit -m "fix: xoa node_modules va them vao gitignore"
```

---

## 7. git mv — Đổi tên / Di chuyển file

### Cú pháp

```bash
# Đổi tên file
git mv old-name.js new-name.js

# Di chuyển file sang thư mục khác
git mv app.js src/app.js

# Di chuyển và đổi tên cùng lúc
git mv utils.js src/helpers.js
```

### Tại sao dùng `git mv` thay vì `mv`?

```bash
# Dùng mv thông thường:
mv old.js new.js
git status
# -> deleted: old.js     (Git nghĩ bạn XOÁ file)
# -> untracked: new.js   (Git nghĩ đây là file MỚI)
# Bạn phải:
git add new.js
git rm old.js

# Dùng git mv:
git mv old.js new.js
git status
# -> renamed: old.js -> new.js   (Git hiểu bạn ĐỔI TÊN)
# Tự động stage, chỉ cần commit
```

`git mv` giúp Git **nhận ra** đây là đổi tên/di chuyển, giữ lại lịch sử của file.

---

## 8. Xử lý file đã commit nhầm

### Trường hợp 1: File thường (chưa push)

```bash
# Xoá file khỏi commit cuối
git reset HEAD~1              # Undo commit
git reset HEAD secret.txt     # Unstage file
git rm --cached secret.txt    # Xoá khỏi tracking
echo "secret.txt" >> .gitignore
git add .
git commit -m "fix: xoa file nhay cam va them gitignore"
```

### Trường hợp 2: Secrets đã push lên remote (NGUY HIỂM!)

**QUAN TRỌNG:** Nếu bạn commit file chứa mật khẩu, API key, hoặc bất kỳ secret nào và **đã push**, bạn phải:

1. **NGAY LẬP TỨC rotate (đổi) tất cả secrets đã lộ**
2. Xoá file khỏi lịch sử Git
3. Force push (sau khi thông báo team)

```bash
# Bước 1: Đổi mật khẩu/API key NGAY (quan trọng nhất!)
# -> Vào dashboard của dịch vụ và đổi key

# Bước 2: Xoá file khỏi lịch sử bằng git filter-branch
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch secrets.env' \
  --prune-empty --tag-name-filter cat -- --all

# Bước 3: Force push (CẢNH BÁO: thông báo team trước!)
git push origin --force --all

# Bước 4: Tất cả thành viên team phải clone lại repo
```

### BFG Repo-Cleaner — Dễ dùng hơn git filter-branch

```bash
# Cài đặt BFG (cần Java)
# Tải từ: https://rtyley.github.io/bfg-repo-cleaner/

# Xoá file cụ thể khỏi toàn bộ lịch sử
java -jar bfg.jar --delete-files secrets.env

# Xoá file lớn (ví dụ: > 100MB)
java -jar bfg.jar --strip-blobs-bigger-than 100M

# Thay thế chuỗi nhạy cảm trong tất cả file
java -jar bfg.jar --replace-text passwords.txt
# (passwords.txt chứa danh sách các chuỗi cần thay thế)

# Sau khi BFG chạy xong:
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

**Tại sao BFG tốt hơn git filter-branch?**

| Tiêu chí | git filter-branch | BFG Repo-Cleaner |
|----------|-------------------|-----------------|
| Tốc độ | Chậm (xử lý từng commit) | Nhanh hơn 10-720x |
| Cú pháp | Phức tạp | Đơn giản |
| An toàn | Có thể làm hỏng repo | An toàn hơn |
| Git docs | "Không khuyên nghị dùng" | Được khuyên nghị |

---

## 9. git clean — Dọn dẹp untracked files

### Công dụng

Xoá các file và thư mục **untracked** (không được Git theo dõi). Hữu ích khi muốn "reset" thư mục làm việc về trạng thái sạch.

### Cú pháp

```bash
# Xem những gì sẽ bị xoá (DRY RUN — không xoá thật)
git clean -n
# hoặc
git clean --dry-run

# Xoá các file untracked
git clean -f

# Xoá cả file và thư mục untracked
git clean -fd

# Xoá cả file bị ignore (cẩn thận!)
git clean -fX

# Xoá TẤT CẢ: untracked + ignored (NGUY HIỂM)
git clean -fdx

# Xoá theo từng file (hỏi trước khi xoá)
git clean -i
```

### Ví dụ thực tế

```bash
# Trước khi clean — kiểm tra trước
git clean -n
# Would remove temp.txt
# Would remove debug.log
# Would remove test-output/

# Chắc chắn muốn xoá? Clean thật sự
git clean -fd
# Removing temp.txt
# Removing debug.log
# Removing test-output/
```

**CẢNH BÁO:** `git clean -f` **không thể undo**! File bị xoá sẽ mất vĩnh viễn (vì chúng không được Git track). Luôn chạy `git clean -n` trước.

### Bảng tổng hợp git clean flags

| Flag | Ý nghĩa | Ví dụ |
|------|---------|-------|
| `-n` | Dry run (chỉ hiển thị, không xoá) | `git clean -n` |
| `-f` | Force — xoá thật | `git clean -f` |
| `-d` | Bao gồm thư mục | `git clean -fd` |
| `-x` | Bao gồm file bị ignore | `git clean -fx` |
| `-X` | CHỈ xoá file bị ignore | `git clean -fX` |
| `-i` | Interactive (hỏi từng file) | `git clean -i` |

---

## 10. Kiểm tra .gitignore có hoạt động không

### Xem file nào đang bị ignore

```bash
# Kiểm tra 1 file cụ thể
git check-ignore -v secret.env
# .gitignore:3:secret.env    secret.env
# -> Dòng 3 của .gitignore đang ignore file này

# Kiểm tra nếu file KHÔNG bị ignore (không hiển thị gì)
git check-ignore -v app.js
# (không có output = file không bị ignore)
```

### Xem tất cả file đang bị ignore

```bash
git status --ignored
```

### Vấn đề: .gitignore không có tác dụng với file đã tracked

```bash
# Tình huống: Bạn thêm .env vào .gitignore NHƯNG .env đã được commit trước đó
echo ".env" >> .gitignore
git add .gitignore
git commit -m "them .env vao gitignore"

# .env VẪN BỊ TRACKED! Vì gitignore chỉ ảnh hưởng file CHƯA tracked

# Sửa: Xoá file khỏi tracking trước
git rm --cached .env
git commit -m "xoa .env khoi tracking"
# Bây giờ .gitignore mới có tác dụng với .env
```

**Quy tắc:** `.gitignore` chỉ ảnh hưởng file **chưa được track**. Nếu file đã commit, phải `git rm --cached` trước.

---

## 11. Bảng cú pháp .gitignore patterns

| Pattern | Ý nghĩa | Match | Không match |
|---------|---------|-------|------------|
| `*.log` | Tất cả file .log | `error.log`, `debug.log` | `logs/` (thư mục) |
| `logs/` | Thư mục tên "logs" | `logs/`, `src/logs/` | `logs` (file) |
| `/logs` | Thư mục "logs" Ở ROOT | `logs/` (root) | `src/logs/` |
| `logs/*` | Nội dung trong logs | `logs/a.txt` | `logs/` (giữ thư mục) |
| `**/logs` | "logs" ở bất kỳ cấp | `logs/`, `a/logs/`, `a/b/logs/` | — |
| `*.py[cod]` | .pyc, .pyo, .pyd | `file.pyc`, `file.pyo` | `file.py` |
| `!important.log` | Ngoại lệ | Giữ `important.log` | — |
| `doc/**/*.pdf` | .pdf trong doc/ | `doc/a.pdf`, `doc/b/c.pdf` | `other/a.pdf` |
| `temp?` | temp + 1 ký tự | `temp1`, `tempA` | `temp`, `temp12` |
| `#` | Comment | (bị bỏ qua) | — |
| Dòng trống | (bị bỏ qua) | — | — |

---

## 12. Lỗi thường gặp

### Lỗi 1: Thêm .gitignore sau khi đã commit file

```bash
# Vấn đề: Đã commit node_modules/ rồi mới thêm .gitignore
# Gitignore KHÔNG có tác dụng với file đã tracked!

# Sửa:
git rm -r --cached node_modules/    # Xoá khỏi tracking
echo "node_modules/" >> .gitignore  # Thêm vào gitignore
git add .
git commit -m "fix: xoa node_modules va them gitignore"
```

### Lỗi 2: Commit file .env chứa secrets

```bash
# NGUY HIỂM! Đã commit .env chứa API key

# Nếu CHƯA push:
git reset HEAD~1                    # Undo commit
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "fix: xoa .env va them gitignore"

# Nếu ĐÃ push: Đổi NGAY tất cả credentials đã lộ!
# Rồi dùng BFG hoặc filter-branch để xoá khỏi lịch sử
```

### Lỗi 3: .gitignore không hoạt động

```bash
# Kiểm tra:
# 1. File .gitignore có ở đúng vị trí? (root của repo)
ls -la .gitignore

# 2. Pattern có đúng không?
git check-ignore -v ten-file

# 3. File đã được tracked từ trước?
git ls-files ten-file   # Nếu có output = file đã tracked
git rm --cached ten-file  # Xoá khỏi tracking

# 4. Có khoảng trắng thừa trong .gitignore?
cat -A .gitignore   # Kiểm tra ký tự ẩn (^I = tab, $ = end of line)
```

### Lỗi 4: Xoá nhầm file bằng git clean

```bash
# git clean -f là KHÔNG THỂ UNDO!
# File untracked bị xoá sẽ MẤT VĨNH VIỄN

# Phòng tránh: LUÔN chạy dry-run trước
git clean -n      # Xem trước những gì sẽ bị xoá
git clean -f      # Xoá thật (sau khi chắc chắn)
```

### Lỗi 5: Không phân biệt `git rm` và `rm`

```bash
# rm thường: Xoá file trên ổ cứng, Git thấy là "deleted"
rm old-file.js
git status
# -> deleted: old-file.js (chưa stage)
# Phải: git add old-file.js (hoặc git rm old-file.js)

# git rm: Xoá file VÀ tự động stage thay đổi
git rm old-file.js
git status
# -> deleted: old-file.js (ĐÃ stage, sẵn sàng commit)
```

---

## 13. Câu hỏi phỏng vấn

### Câu 1: .gitignore là gì và tại sao quan trọng?

**Trả lời mẫu:**

> `.gitignore` là file đặc biệt cho Git biết những file/thư mục nào không nên track. Quan trọng vì: (1) Giữ repo sạch — không commit dependencies (node_modules), build output (dist), file tạm, (2) Bảo mật — tránh commit secrets (.env, credentials), (3) Giảm kích thước repo — không lưu file có thể tải lại. Mỗi dự án nên có .gitignore từ đầu.

### Câu 2: Làm sao để bỏ qua file đã được Git track?

**Trả lời mẫu:**

> `.gitignore` chỉ ảnh hưởng file chưa được track. Nếu file đã commit, phải xoá khỏi tracking trước bằng `git rm --cached <file>`, sau đó thêm vào `.gitignore` rồi commit. Lệnh `git rm --cached` chỉ xoá file khỏi Git index, không xoá file thực trên ổ cứng.

### Câu 3: Phân biệt global gitignore và local gitignore.

**Trả lời mẫu:**

> Local `.gitignore` nằm trong repo, được commit và chia sẻ với team — dùng cho file liên quan đến dự án (node_modules, build, .env). Global gitignore (`~/.gitignore_global`) là cấu hình cá nhân, chỉ trên máy của bạn — dùng cho file liên quan đến IDE (.idea, .vscode) và OS (.DS_Store, Thumbs.db). Global gitignore không ảnh hưởng repo của người khác.

### Câu 4: Đã commit nhầm file chứa secret và push lên remote. Phải làm gì?

**Trả lời mẫu:**

> Bước 1 (NGAY LẬP TỨC): Rotate tất cả secrets đã lộ — đổi mật khẩu, revoke API keys, tạo tokens mới. Đây là bước quan trọng nhất vì dù bạn xoá file khỏi Git, người khác có thể đã clone repo. Bước 2: Dùng BFG Repo-Cleaner hoặc `git filter-branch` để xoá file khỏi toàn bộ lịch sử Git. Bước 3: Force push và yêu cầu team clone lại. Bước 4: Thêm file vào .gitignore để tránh lặp lại.

### Câu 5: `git rm --cached` khác `git rm` như thế nào?

**Trả lời mẫu:**

> `git rm <file>` xoá file khỏi cả Git tracking VÀ xoá file thực trên ổ cứng. `git rm --cached <file>` chỉ xoá file khỏi Git tracking (Staging Area), giữ file nguyên trên ổ cứng. Dùng `--cached` khi bạn muốn ngừng track file nhưng vẫn giữ nó trên máy — ví dụ: xoá .env khỏi Git nhưng vẫn cần file để chạy ứng dụng local.

---

## Tổng kết

| Công việc | Lệnh / File |
|-----------|------------|
| Bỏ qua file | Thêm vào `.gitignore` |
| Bỏ qua file cá nhân (IDE, OS) | Thêm vào `~/.gitignore_global` |
| Giữ thư mục rỗng | Thêm `.gitkeep` |
| Xoá file khỏi Git + ổ cứng | `git rm file` |
| Xoá file khỏi Git, giữ ổ cứng | `git rm --cached file` |
| Đổi tên / di chuyển file | `git mv old new` |
| Dọn dẹp file untracked | `git clean -fd` (cẩn thận!) |
| Xoá file khỏi toàn bộ lịch sử | BFG Repo-Cleaner |
| Kiểm tra .gitignore | `git check-ignore -v file` |

**Nhớ:** `.gitignore` chỉ ảnh hưởng file CHƯA tracked. File đã commit phải `git rm --cached` trước.
