---
sidebar_position: 2
title: "2. Cài đặt và cấu hình Git"
---

# Cài đặt và cấu hình Git

Trước khi dùng Git, bạn cần cài đặt nó trên máy và thiết lập cấu hình cơ bản. Bài này hướng dẫn chi tiết từng bước cho mỗi hệ điều hành.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Bắt buộc khai báo danh tính** — chạy `git config --global user.name` và `git config --global user.email` trước khi commit, nếu không mọi commit sẽ thiếu thông tin tác giả.
- ⭐ **Ba cấp cấu hình** — `system` (toàn máy) < `global` (mỗi user) < `local` (từng repo); cấp hẹp hơn ghi đè cấp rộng hơn.
- **Cài đặt tùy hệ điều hành** — Windows dùng Git for Windows / `winget` / `choco`, macOS dùng `brew`, Linux dùng trình quản lý gói của distro.
- **SSH Key để xác thực** — tạo và gắn SSH key giúp `push`/`pull` với GitHub mà không phải nhập mật khẩu mỗi lần.
- **Xem/sửa cấu hình** — dùng `git config --list` để kiểm tra, hoặc sửa trực tiếp file `.gitconfig`.

:::

---

## Mục lục

- [1. Cài đặt Git](#1-cài-đặt-git)
- [2. Cấu hình cơ bản (BẮT BUỘC)](#2-cấu-hình-cơ-bản-bắt-buộc)
- [3. Ba cấp cấu hình: System, Global, Local](#3-ba-cấp-cấu-hình-system-global-local)
- [4. Thiết lập editor mặc định](#4-thiết-lập-editor-mặc-định)
- [5. Thiết lập SSH Key](#5-thiết-lập-ssh-key)
- [6. Các cấu hình hữu ích khác](#6-các-cấu-hình-hữu-ích-khác)
- [7. Bảng tổng hợp cấu hình quan trọng](#7-bảng-tổng-hợp-cấu-hình-quan-trọng)
- [8. Xem và sửa file cấu hình trực tiếp](#8-xem-và-sửa-file-cấu-hình-trực-tiếp)
- [9. Lỗi thường gặp](#9-lỗi-thường-gặp)
- [10. Câu hỏi phỏng vấn](#10-câu-hỏi-phỏng-vấn)
- [Tổng kết](#tổng-kết)

---

## 1. Cài đặt Git

### 1.1 Windows

**Cách 1: Git for Windows (khuyên nghị)**

1. Truy cập [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Tải file `.exe` và chạy installer
3. Các tuỳ chọn quan trọng khi cài đặt:

```
[x] Git Bash Here          <-- Rất tiện, click phải để mở terminal
[x] Git GUI Here           <-- Tuỳ chọn, có thể bỏ qua
[x] Use Visual Studio Code as Git's default editor
[x] Override the default branch name: main
[x] Git from the command line and also from 3rd-party software
[x] Use bundled OpenSSH
[x] Use the OpenSSL library
[x] Checkout Windows-style, commit Unix-style line endings
[x] Use MinTTY
```

**Cách 2: Qua winget (Windows Package Manager)**

```powershell
# Mở PowerShell với quyền Admin
winget install --id Git.Git -e --source winget
```

**Cách 3: Qua Chocolatey**

```powershell
choco install git
```

Sau khi cài xong, mở **Git Bash** hoặc **Command Prompt** để kiểm tra:

```bash
git --version
# Kết quả mong đợi: git version 2.44.0.windows.1 (hoặc phiên bản mới hơn)
```

### 1.2 macOS

**Cách 1: Homebrew (khuyên nghị)**

```bash
# Cài Homebrew nếu chưa có
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Cài Git
brew install git
```

**Cách 2: Xcode Command Line Tools**

```bash
# Cách này cài phiên bản Git kèm theo macOS (thường cũ hơn)
xcode-select --install
```

**Cách 3: Tải từ website**

Truy cập [https://git-scm.com/download/mac](https://git-scm.com/download/mac) và tải installer.

Kiểm tra:

```bash
git --version
# git version 2.44.0

# Kiểm tra Git được cài từ đâu
which git
# /opt/homebrew/bin/git  (Homebrew)
# /usr/bin/git           (Xcode)
```

**Lưu ý:** Nếu `which git` trả về `/usr/bin/git`, bạn đang dùng phiên bản cũ của macOS. Nên cài qua Homebrew để có phiên bản mới nhất.

### 1.3 Linux

**Ubuntu / Debian:**

```bash
sudo apt update
sudo apt install git
```

**Fedora:**

```bash
sudo dnf install git
```

**CentOS / RHEL:**

```bash
sudo yum install git
```

**Arch Linux:**

```bash
sudo pacman -S git
```

Kiểm tra:

```bash
git --version
# git version 2.43.0
```

### 1.4 Kiểm tra cài đặt thành công

Bất kể hệ điều hành nào, sau khi cài xong hãy chạy:

```bash
# Kiểm tra phiên bản
git --version

# Kiểm tra Git có trong PATH không
which git      # macOS/Linux
where git      # Windows (cmd)
```

Nếu thấy phiên bản Git hiện ra, bạn đã cài thành công.

---

## 2. Cấu hình cơ bản (BẮT BUỘC)

Sau khi cài Git, việc **đầu tiên** phải làm là thiết lập tên và email. Git dùng thông tin này để gắn vào mỗi commit.

```bash
# Thiết lập tên (hiển thị trong lịch sử commit)
git config --global user.name "Nguyen Van A"

# Thiết lập email (nên trùng với email GitHub/GitLab)
git config --global user.email "nguyenvana@example.com"
```

### Tại sao bắt buộc?

Mỗi commit trong Git đều chứa thông tin người tạo:

```
commit a1b2c3d4e5f6...
Author: Nguyen Van A <nguyenvana@example.com>
Date:   Mon Mar 25 10:30:00 2025 +0700

    feat: them tinh nang dang nhap
```

Nếu bạn không cấu hình, Git sẽ **từ chối commit** hoặc dùng thông tin mặc định của hệ thống (có thể không chính xác).

### Kiểm tra cấu hình

```bash
# Xem tất cả cấu hình
git config --list

# Xem một cấu hình cụ thể
git config user.name
git config user.email
```

---

## 3. Ba cấp cấu hình: System, Global, Local

Git có 3 cấp cấu hình, **cấp dưới ghi đè cấp trên**:

```
+--------------------------------------------------+
|                   SYSTEM                          |
|  /etc/gitconfig (Linux/macOS)                     |
|  C:\Program Files\Git\etc\gitconfig (Windows)     |
|  Áp dụng cho TẤT CẢ user trên máy               |
+--------------------------------------------------+
            |
            v  (bị ghi đè bởi)
+--------------------------------------------------+
|                   GLOBAL                          |
|  ~/.gitconfig hoặc ~/.config/git/config           |
|  Áp dụng cho USER hiện tại, TẤT CẢ repo          |
+--------------------------------------------------+
            |
            v  (bị ghi đè bởi)
+--------------------------------------------------+
|                   LOCAL                           |
|  .git/config (trong thư mục repo)                 |
|  Chỉ áp dụng cho REPO hiện tại                   |
+--------------------------------------------------+
```

### Khi nào dùng cấp nào?

| Cấp        | Lệnh                  | Khi nào dùng                                    |
| ---------- | --------------------- | ----------------------------------------------- |
| `--system` | `git config --system` | IT admin thiết lập cho toàn máy (hiếm khi dùng) |
| `--global` | `git config --global` | Thiết lập cá nhân: tên, email, editor, alias    |
| `--local`  | `git config --local`  | Thiết lập riêng cho 1 repo: email công ty khác  |

### Ví dụ thực tế: Dùng email khác cho repo công ty

```bash
# Email cá nhân (global — dùng cho mọi repo)
git config --global user.email "personal@gmail.com"

# Email công ty (local — chỉ cho repo này)
cd ~/work/company-project
git config --local user.email "nguyenvana@company.com"

# Kiểm tra — email local sẽ được ưu tiên trong repo này
git config user.email
# nguyenvana@company.com
```

---

## 4. Thiết lập editor mặc định

Khi Git cần bạn nhập nội dung (viết commit message, resolve conflict...), nó sẽ mở text editor. Mặc định là **vim** — khó dùng với người mới.

### Đổi sang VS Code (khuyên nghị)

```bash
git config --global core.editor "code --wait"
```

`--wait` báo Git đợi cho đến khi bạn đóng file trong VS Code trước khi tiếp tục.

### Đổi sang các editor khác

```bash
# Nano (dễ dùng, trong terminal)
git config --global core.editor "nano"

# Vim (mạnh, nhưng cần học)
git config --global core.editor "vim"

# Sublime Text
git config --global core.editor "subl -n -w"

# Notepad++ (Windows)
git config --global core.editor "'C:/Program Files/Notepad++/notepad++.exe' -multiInst -notabbar -nosession -noPlugin"
```

### Kiểm tra editor hiện tại

```bash
git config core.editor
# code --wait
```

### Mẹo: Thoát khỏi vim khi vô tình vào

Nếu bạn bị "mắc kẹt" trong vim (chuyện thật sự xảy ra với người mới):

```
1. Nhấn phím Esc (đảm bảo ở Normal mode)
2. Gõ   :q!   rồi nhấn Enter (thoát không lưu)
   hoặc :wq   rồi nhấn Enter (lưu và thoát)
```

---

## 5. Thiết lập SSH Key

SSH Key cho phép bạn kết nối với GitHub/GitLab mà **không cần nhập mật khẩu** mỗi lần push/pull.

### 5.1 Kiểm tra SSH key hiện có

```bash
ls -la ~/.ssh
# Nếu thấy id_ed25519 và id_ed25519.pub (hoặc id_rsa, id_rsa.pub) là đã có
```

### 5.2 Tạo SSH key mới

```bash
# Tạo key với thuật toán Ed25519 (khuyên nghị, bảo mật hơn RSA)
ssh-keygen -t ed25519 -C "nguyenvana@example.com"
```

Khi được hỏi:

```
Enter file in which to save the key (/home/user/.ssh/id_ed25519):
# Nhấn Enter để dùng đường dẫn mặc định

Enter passphrase (empty for no passphrase):
# Nhập mật khẩu bảo vệ key (khuyên nghị) hoặc Enter để bỏ qua

Enter same passphrase again:
# Nhập lại mật khẩu
```

### 5.3 Thêm SSH key vào ssh-agent

```bash
# Khởi động ssh-agent
eval "$(ssh-agent -s)"
# Agent pid 12345

# Thêm key vào agent
ssh-add ~/.ssh/id_ed25519
```

**Trên macOS**, thêm vào `~/.ssh/config` để tự động load:

```
Host github.com
    AddKeysToAgent yes
    UseKeychain yes
    IdentityFile ~/.ssh/id_ed25519
```

### 5.4 Thêm public key vào GitHub

```bash
# Copy nội dung public key
# macOS:
pbcopy < ~/.ssh/id_ed25519.pub

# Linux:
xclip -selection clipboard < ~/.ssh/id_ed25519.pub

# Windows (Git Bash):
clip < ~/.ssh/id_ed25519.pub

# Hoặc đơn giản đọc file và copy bằng tay:
cat ~/.ssh/id_ed25519.pub
```

Sau đó vào GitHub:

1. **Settings** > **SSH and GPG keys** > **New SSH key**
2. Đặt tên (ví dụ: "MacBook Pro của tôi")
3. Dán public key vào
4. Click **Add SSH key**

### 5.5 Kiểm tra kết nối

```bash
ssh -T git@github.com
```

Kết quả thành công:

```
Hi nguyenvana! You've successfully authenticated, but GitHub does not provide shell access.
```

Nếu thấy lỗi `Permission denied`, kiểm tra lại:

- Key đã thêm vào ssh-agent chưa?
- Public key đã thêm vào GitHub chưa?
- Đúng key phải không?

---

## 6. Các cấu hình hữu ích khác

### 6.1 Line Ending (quan trọng khi làm việc nhóm Windows + macOS/Linux)

```bash
# Windows: Tự động chuyển LF -> CRLF khi checkout, CRLF -> LF khi commit
git config --global core.autocrlf true

# macOS/Linux: Chỉ cảnh báo nếu có CRLF, chuyển về LF khi commit
git config --global core.autocrlf input
```

**Tại sao quan trọng?** Windows dùng `CRLF` (\r\n), macOS/Linux dùng `LF` (\n). Nếu không cấu hình, bạn sẽ thấy "thay đổi" ở mọi dòng dù không sửa gì — chỉ vì line ending khác nhau.

### 6.2 Default Branch Name

```bash
# Đổi tên branch mặc định từ "master" sang "main"
git config --global init.defaultBranch main
```

Từ năm 2020, `main` trở thành tên mặc định trên GitHub. Nên đồng bộ để tránh nhầm lẫn.

### 6.3 Pull Strategy

```bash
# Dùng rebase thay vì merge khi pull (giữ lịch sử sạch hơn)
git config --global pull.rebase true

# Hoặc chỉ rebase khi có thể fast-forward
git config --global pull.ff only
```

### 6.4 Color Output

```bash
# Bật màu cho output Git (thường đã bật sẵn)
git config --global color.ui auto
```

### 6.5 Alias — Tạo lệnh tắt

```bash
# Alias cho các lệnh hay dùng
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --oneline --graph --all --decorate"
```

Sau khi thiết lập, bạn có thể dùng:

```bash
git st          # thay cho git status
git co main     # thay cho git checkout main
git br          # thay cho git branch
git lg          # xem log đẹp với graph
```

### 6.6 Credential Helper

```bash
# macOS: Lưu credential trong Keychain
git config --global credential.helper osxkeychain

# Windows: Lưu credential trong Windows Credential Manager
git config --global credential.helper manager

# Linux: Cache trong 1 giờ (3600 giây)
git config --global credential.helper 'cache --timeout=3600'
```

---

## 7. Bảng tổng hợp cấu hình quan trọng

| Cấu hình       | Lệnh                                            | Mô tả                     |
| -------------- | ----------------------------------------------- | ------------------------- |
| Tên            | `git config --global user.name "Tên"`           | Tên hiển thị trong commit |
| Email          | `git config --global user.email "email"`        | Email gắn với commit      |
| Editor         | `git config --global core.editor "code --wait"` | Editor cho commit message |
| Line ending    | `git config --global core.autocrlf true/input`  | Xử lý xuống dòng Win/Mac  |
| Default branch | `git config --global init.defaultBranch main`   | Tên branch mặc định       |
| Pull strategy  | `git config --global pull.rebase true`          | Rebase khi pull           |
| Color          | `git config --global color.ui auto`             | Output có màu             |
| Alias          | `git config --global alias.st status`           | Lệnh tắt                  |
| Credential     | `git config --global credential.helper ...`     | Lưu mật khẩu              |

---

## 8. Xem và sửa file cấu hình trực tiếp

Ngoài lệnh `git config`, bạn có thể sửa file cấu hình bằng tay:

```bash
# Mở file config global bằng editor
git config --global --edit

# Xem nội dung file config
cat ~/.gitconfig
```

Nội dung file `~/.gitconfig` tiêu biểu:

```ini
[user]
    name = Nguyen Van A
    email = nguyenvana@example.com

[core]
    editor = code --wait
    autocrlf = input

[init]
    defaultBranch = main

[pull]
    rebase = true

[color]
    ui = auto

[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    lg = log --oneline --graph --all --decorate

[credential]
    helper = osxkeychain
```

---

## 9. Lỗi thường gặp

### Lỗi 1: Quên cấu hình tên và email

```bash
git commit -m "first commit"
# ERROR:
# *** Please tell me who you are.
# Run
#   git config --global user.email "you@example.com"
#   git config --global user.name "Your Name"

# Cách sửa: cấu hình như trên
git config --global user.name "Nguyen Van A"
git config --global user.email "nguyenvana@example.com"
```

### Lỗi 2: SSH key không hoạt động

```bash
ssh -T git@github.com
# Permission denied (publickey).

# Kiểm tra:
# 1. Key đã tạo chưa?
ls ~/.ssh/id_ed25519.pub

# 2. Key đã thêm vào agent chưa?
ssh-add -l

# 3. Key đã thêm vào GitHub chưa?
# Vào GitHub > Settings > SSH keys để kiểm tra

# 4. Thử thêm lại key vào agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### Lỗi 3: Mắc kẹt trong vim

```
# Khi Git mở vim bất ngờ:
# 1. Nhấn Esc
# 2. Gõ :q! và Enter (thoát không lưu)
# Sau đó cấu hình editor khác:
git config --global core.editor "code --wait"
```

### Lỗi 4: Line ending gây ra diff giả

```bash
# Triệu chứng: git diff hiển thị mọi dòng đã thay đổi, dù bạn chỉ sửa 1 dòng
# Nguyên nhân: Line ending khác nhau (CRLF vs LF)

# Sửa:
git config --global core.autocrlf input   # macOS/Linux
git config --global core.autocrlf true    # Windows
```

### Lỗi 5: Dùng HTTPS thay vì SSH

```bash
# Triệu chứng: Phải nhập username/password mỗi lần push
# Kiểm tra remote URL:
git remote -v
# origin  https://github.com/user/repo.git  <-- HTTPS

# Đổi sang SSH:
git remote set-url origin git@github.com:user/repo.git

# Kiểm tra lại:
git remote -v
# origin  git@github.com:user/repo.git  <-- SSH
```

---

## 10. Câu hỏi phỏng vấn

### Câu 1: Có bao nhiêu cấp cấu hình trong Git? Giải thích thứ tự ưu tiên.

**Trả lời mẫu:**

> Git có 3 cấp cấu hình: system (/etc/gitconfig — toàn máy), global (~/.gitconfig — user hiện tại), và local (.git/config — repo hiện tại). Thứ tự ưu tiên từ cao đến thấp: local > global > system. Nghĩa là cấu hình local sẽ ghi đè global, và global ghi đè system. Điều này cho phép cấu hình chung ở global nhưng tuỳ chỉnh riêng cho từng repo ở local.

### Câu 2: Làm thế nào để dùng email khác nhau cho repo cá nhân và repo công ty?

**Trả lời mẫu:**

> Dùng `git config --global user.email` để thiết lập email mặc định (cá nhân). Trong repo công ty, dùng `git config --local user.email "email@company.com"` để ghi đè. Config local chỉ áp dụng cho repo hiện tại, không ảnh hưởng các repo khác.

### Câu 3: SSH và HTTPS khác nhau thế nào khi làm việc với remote repo?

**Trả lời mẫu:**

> HTTPS yêu cầu nhập username/password (hoặc Personal Access Token) mỗi lần push/pull, có thể cache bằng credential helper. SSH dùng cặp key (public/private), sau khi thiết lập một lần thì không cần nhập lại. SSH bảo mật hơn và tiện hơn cho việc sử dụng hàng ngày. HTTPS dễ thiết lập hơn ban đầu và không bị chặn bởi firewall công ty.

### Câu 4: `core.autocrlf` là gì và tại sao cần cấu hình?

**Trả lời mẫu:**

> `core.autocrlf` xử lý sự khác biệt về line ending giữa Windows (CRLF - \r\n) và Unix/macOS (LF - \n). Trên Windows, đặt `true` để Git tự động chuyển CRLF -> LF khi commit và LF -> CRLF khi checkout. Trên macOS/Linux, đặt `input` để chỉ chuyển CRLF -> LF khi commit. Điều này ngăn việc line ending tạo ra diff giả khi làm việc nhóm đa nền tảng.

### Câu 5: Làm sao để xem toàn bộ cấu hình Git hiện tại và biết cấu hình nào đến từ file nào?

**Trả lời mẫu:**

> Dùng `git config --list` để xem toàn bộ cấu hình. Để biết cấu hình đến từ file nào, dùng `git config --list --show-origin`. Lệnh này hiển thị đường dẫn file trước mỗi giá trị, giúp debug khi cấu hình không như mong đợi.

```bash
# Ví dụ output
git config --list --show-origin
# file:/home/user/.gitconfig    user.name=Nguyen Van A
# file:/home/user/.gitconfig    user.email=personal@gmail.com
# file:.git/config              user.email=work@company.com
```

---

## Tổng kết

| Bước | Lệnh                              | Mô tả                |
| ---- | --------------------------------- | -------------------- |
| 1    | `git --version`                   | Kiểm tra đã cài chưa |
| 2    | `git config --global user.name`   | Đặt tên              |
| 3    | `git config --global user.email`  | Đặt email            |
| 4    | `git config --global core.editor` | Chọn editor          |
| 5    | `ssh-keygen -t ed25519`           | Tạo SSH key          |
| 6    | Thêm key vào GitHub               | Kết nối SSH          |
| 7    | `ssh -T git@github.com`           | Kiểm tra kết nối     |

**Bước tiếp theo:** Tìm hiểu các khái niệm cốt lõi trong Git — Working Directory, Staging Area, Repository.
