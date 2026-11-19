---
sidebar_position: 2
title: "2. Cài đặt và cấu hình Git"
---

# Cài đặt và cấu hình Git

Trước khi dùng Git, bạn cần cài đặt nó trên máy và thiết lập cấu hình cơ bản. Bài này hướng dẫn chi tiết từng bước cho mỗi hệ điều hành.

[![Sơ đồ tóm tắt bài: Cài đặt & cấu hình Git](/img/git/cai-dat-va-cau-hinh.webp)](pathname:///img/git/cai-dat-va-cau-hinh.webp)

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

`git pull` thực chất chạy hai lệnh liên tiếp:

```
git pull  =  git fetch  +  (merge HOẶC rebase)
```

`fetch` tải commit mới từ remote về. Bước sau là **ghép** commit đó với commit của bạn ở máy local. Pull strategy quyết định bước ghép này chạy theo cách nào.

#### Tình huống chung để so sánh

Bạn và đồng nghiệp cùng làm trên `main`, bắt đầu từ commit `B`:

```
Remote (origin/main):   A ── B ── D        ← đồng nghiệp đã push D
Local  (main):          A ── B ── C        ← bạn commit C nhưng chưa push
```

Hai nhánh đã **rẽ đôi** (diverged). Mỗi bên có một commit bên kia chưa có. Giờ bạn chạy `git pull`.

#### Cách 1: Merge (`pull.rebase false`)

```bash
git config --global pull.rebase false
```

Git tạo thêm một **merge commit** `M` để nối hai nhánh:

```
A ── B ── C ──── M      ← main
      \         /
       └── D ──┘
```

```bash
$ git log --oneline --graph
*   f3a1b2c (HEAD -> main) Merge branch 'main' of github.com:team/repo
|\
| * 9d8e7f6 (origin/main) feat: thêm API login      ← D
* | 4c5d6e7 fix: sửa validate email                  ← C
|/
* 1a2b3c4 init                                       ← B
```

- **Ưu điểm:** giữ đúng lịch sử thật, không viết lại commit nào. Gặp conflict thì chỉ giải quyết một lần.
- **Nhược điểm:** mỗi lần pull lại sinh thêm một commit "Merge branch 'main' of ...". Team đông người pull nhiều lần một ngày thì graph thành mạng nhện, khó đọc.

#### Cách 2: Rebase (`pull.rebase true`)

```bash
git config --global pull.rebase true
```

Git tạm cất commit `C` của bạn, kéo `D` về, rồi **chép lại** `C` lên trên `D` thành commit mới `C'`:

```
A ── B ── D ── C'      ← main (thẳng một đường)
```

```bash
$ git log --oneline --graph
* 7b8c9d0 (HEAD -> main) fix: sửa validate email     ← C' (hash MỚI)
* 9d8e7f6 (origin/main) feat: thêm API login         ← D
* 1a2b3c4 init                                       ← B
```

- **Ưu điểm:** lịch sử thẳng, không có merge commit thừa, trông như bạn viết `C` sau khi đã có `D`.
- **Nhược điểm:**
  - `C'` có **hash khác** `C`, vì commit đã bị viết lại.
  - Có N commit local thì có thể phải giải quyết conflict tới N lần, mỗi commit một lần.

Khi gặp conflict trong lúc rebase:

```bash
# Sửa file bị conflict, rồi:
git add <file>
git rebase --continue    # tiếp tục với commit kế tiếp
git rebase --abort       # hoặc huỷ, quay về trạng thái trước khi pull
```

Việc viết lại commit ở đây khá an toàn, vì Git chỉ chép lại những commit **chưa push**. Chưa ai khác có các commit đó.

#### Cách 3: Chỉ fast-forward (`pull.ff only`)

```bash
git config --global pull.ff only
```

Git **chỉ** cập nhật khi có thể "tua nhanh", tức là local không có commit riêng nào. Khi đó Git chỉ dời con trỏ nhánh, không merge, không rebase, không tạo commit mới:

```
Trước:  Local  A ── B
        Remote A ── B ── D
Sau:    Local  A ── B ── D       ✅ chỉ dời con trỏ
```

Nếu hai nhánh đã rẽ đôi như tình huống chung, Git **từ chối**:

```bash
$ git pull
fatal: Not possible to fast-forward, aborting.
```

Lúc đó bạn tự chọn cách xử lý: `git pull --rebase` hoặc `git pull --no-ff`.

- **Ưu điểm:** an toàn nhất. Git không bao giờ tự tạo commit hay tự viết lại lịch sử sau lưng bạn.
- **Nhược điểm:** gặp nhánh rẽ đôi là phải xử lý tay.

#### Bảng so sánh

| Tiêu chí              | Merge                             | Rebase                       | FF only                       |
| --------------------- | --------------------------------- | ---------------------------- | ----------------------------- |
| Config                | `pull.rebase false`               | `pull.rebase true`           | `pull.ff only`                |
| Khi nhánh rẽ đôi      | Tạo merge commit                  | Chép commit local lên trên   | Báo lỗi, dừng                 |
| Hình dạng lịch sử     | Phân nhánh                        | Thẳng                        | Thẳng                         |
| Viết lại commit?      | Không                             | Có (commit chưa push)        | Không                         |
| Số lần giải conflict  | 1 lần                             | Có thể N lần                 | Không xảy ra (tự xử lý)       |
| Hợp với               | Người mới, cần lịch sử chính xác  | Team muốn log sạch           | Người muốn kiểm soát hoàn toàn |

#### Nên chọn cái nào?

Cấu hình phổ biến nhất là rebase, kèm tự cất các thay đổi chưa commit:

```bash
git config --global pull.rebase true
git config --global rebase.autoStash true   # tự stash file đang sửa dở trước khi rebase, xong tự lấy lại
```

Nếu chưa quen xử lý conflict khi rebase, dùng `pull.ff only` để Git dừng lại báo cho bạn biết, thay vì tự làm thay.

:::tip
Các bản Git mới (khoảng từ 2.33 trở đi) sẽ báo lỗi `Need to specify how to reconcile divergent branches` nếu bạn chưa cấu hình gì mà nhánh đã rẽ đôi. Đó là lý do nên cấu hình mục này ngay từ đầu.
:::

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

**Triệu chứng:** bạn chỉ sửa 1 dòng nhưng `git diff` báo **toàn bộ file** bị xoá rồi thêm lại.

#### Line ending là gì?

Cuối mỗi dòng trong file text có một ký tự vô hình đánh dấu xuống dòng. Mỗi hệ điều hành dùng một kiểu:

| Hệ điều hành  | Ký hiệu | Byte                 | Tên                         |
| ------------- | ------- | -------------------- | --------------------------- |
| Windows       | `CRLF`  | `\r\n` (0x0D 0x0A)   | Carriage Return + Line Feed |
| macOS / Linux | `LF`    | `\n` (0x0A)          | Line Feed                   |

Tên gọi đến từ máy đánh chữ: CR là kéo đầu in về đầu dòng, LF là cuộn giấy xuống một dòng. Windows giữ cả hai, Unix chỉ giữ LF.

#### Vì sao sinh ra diff giả?

Git so sánh từng byte, nên `hello\n` và `hello\r\n` là **hai dòng khác nhau**. Tình huống thường gặp:

1. Bạn A dùng macOS, commit file `App.java` với LF.
2. Bạn B dùng Windows, sửa đúng 1 dòng. Editor tự đổi cả file sang CRLF khi lưu.
3. `git diff` hiện mọi dòng đều thay đổi:

```diff
-public class App {
-    int x = 1;
+public class App {^M
+    int x = 2;^M
```

Ký tự `^M` chính là `\r`. Nội dung không đổi, chỉ ký tự xuống dòng đổi. Hậu quả:

- Code review không nhìn ra dòng nào thật sự thay đổi.
- `git blame` ghi tên bạn B cho mọi dòng, mất lịch sử tác giả thật.
- Dễ conflict khi merge vì nhánh nào cũng "sửa" mọi dòng.
- Script shell lưu dạng CRLF chạy trên Linux báo lỗi `/bin/bash^M: bad interpreter`.

#### Cách 1: `core.autocrlf` (cấu hình trên từng máy)

```bash
git config --global core.autocrlf input   # macOS/Linux
git config --global core.autocrlf true    # Windows
```

Git chuyển đổi ký tự xuống dòng ở hai thời điểm: khi **commit** và khi **checkout**.

| Giá trị | Khi commit | Khi checkout | Dùng cho                             |
| ------- | ---------- | ------------ | ------------------------------------ |
| `true`  | CRLF → LF  | LF → CRLF    | Windows                              |
| `input` | CRLF → LF  | giữ nguyên   | macOS/Linux                          |
| `false` | giữ nguyên | giữ nguyên   | Không khuyến nghị cho team nhiều OS  |

Cả hai cách cấu hình đều nhắm tới một điều: **trong repo luôn lưu LF**. Windows được đổi sang CRLF khi checkout để editor hiển thị đúng; macOS/Linux dùng `input` để chặn file CRLF lỡ lọt vào khi commit.

Hạn chế: đây là cấu hình riêng từng máy. Chỉ cần một người trong team quên cấu hình là lỗi quay lại.

#### Cách 2: `.gitattributes` (khuyến nghị khi làm theo team)

Tạo file `.gitattributes` ở gốc repo và commit nó. Quy tắc này áp dụng cho mọi người clone repo, và được ưu tiên hơn `core.autocrlf`:

```gitattributes
# Mặc định: Git tự nhận file text, lưu LF trong repo
* text=auto eol=lf

# File chỉ chạy trên Windows thì giữ CRLF
*.bat text eol=crlf
*.cmd text eol=crlf

# File nhị phân: không bao giờ chuyển đổi
*.png binary
*.jpg binary
*.jar binary
```

#### Repo đã lẫn file CRLF thì sao?

Bật `autocrlf` hay thêm `.gitattributes` **không tự sửa file đã commit sai**. Cần chuẩn hoá lại một lần, commit riêng để không lẫn với thay đổi thật:

```bash
git add --renormalize .
git commit -m "chore: normalize line endings to LF"
```

#### Cách chẩn đoán

```bash
# Xem line ending của từng file (i/ = trong repo, w/ = working dir)
git ls-files --eol
# i/lf    w/crlf  attr/text=auto  src/App.java

# Diff bỏ qua khác biệt CR ở cuối dòng: phần còn lại mới là thay đổi thật
git diff --ignore-cr-at-eol

# Kiểm tra một file cụ thể
file src/App.java
# src/App.java: ASCII text, with CRLF line terminators
```

Nên cấu hình editor cho đồng bộ: trong VS Code đặt `"files.eol": "\n"`, hoặc thêm `.editorconfig` với `end_of_line = lf` để editor không tự đổi khi lưu.

| Tình huống              | Cách xử lý                                                       |
| ----------------------- | ---------------------------------------------------------------- |
| Làm một mình            | `core.autocrlf` (`input` trên macOS/Linux, `true` trên Windows)  |
| Làm theo team           | Commit `.gitattributes` với `* text=auto eol=lf`                 |
| Repo đã lẫn CRLF        | `git add --renormalize .` rồi commit riêng                       |
| Muốn xem diff thật      | `git diff --ignore-cr-at-eol`                                    |

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
