---
sidebar_position: 2
title: "Cai dat va cau hinh Git"
---

# Cai dat va cau hinh Git

Truoc khi dung Git, ban can cai dat no tren may va thiet lap cau hinh co ban. Bai nay huong dan chi tiet tung buoc cho moi he dieu hanh.

---

## 1. Cai dat Git

### 1.1 Windows

**Cach 1: Git for Windows (khuyen nghi)**

1. Truy cap [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Tai file `.exe` va chay installer
3. Cac tuy chon quan trong khi cai dat:

```
[x] Git Bash Here          <-- Rat tien, click phai de mo terminal
[x] Git GUI Here           <-- Tuy chon, co the bo qua
[x] Use Visual Studio Code as Git's default editor
[x] Override the default branch name: main
[x] Git from the command line and also from 3rd-party software
[x] Use bundled OpenSSH
[x] Use the OpenSSL library
[x] Checkout Windows-style, commit Unix-style line endings
[x] Use MinTTY
```

**Cach 2: Qua winget (Windows Package Manager)**

```powershell
# Mo PowerShell voi quyen Admin
winget install --id Git.Git -e --source winget
```

**Cach 3: Qua Chocolatey**

```powershell
choco install git
```

Sau khi cai xong, mo **Git Bash** hoac **Command Prompt** de kiem tra:

```bash
git --version
# Ket qua mong doi: git version 2.44.0.windows.1 (hoac phien ban moi hon)
```

### 1.2 macOS

**Cach 1: Homebrew (khuyen nghi)**

```bash
# Cai Homebrew neu chua co
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Cai Git
brew install git
```

**Cach 2: Xcode Command Line Tools**

```bash
# Cach nay cai phien ban Git kem theo macOS (thuong cu hon)
xcode-select --install
```

**Cach 3: Tai tu website**

Truy cap [https://git-scm.com/download/mac](https://git-scm.com/download/mac) va tai installer.

Kiem tra:

```bash
git --version
# git version 2.44.0

# Kiem tra Git duoc cai tu dau
which git
# /opt/homebrew/bin/git  (Homebrew)
# /usr/bin/git           (Xcode)
```

**Luu y:** Neu `which git` tra ve `/usr/bin/git`, ban dang dung phien ban cu cua macOS. Nen cai qua Homebrew de co phien ban moi nhat.

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

Kiem tra:

```bash
git --version
# git version 2.43.0
```

### 1.4 Kiem tra cai dat thanh cong

Bat ke he dieu hanh nao, sau khi cai xong hay chay:

```bash
# Kiem tra phien ban
git --version

# Kiem tra Git co trong PATH khong
which git      # macOS/Linux
where git      # Windows (cmd)
```

Neu thay phien ban Git hien ra, ban da cai thanh cong.

---

## 2. Cau hinh co ban (BAT BUOC)

Sau khi cai Git, viec **dau tien** phai lam la thiet lap ten va email. Git dung thong tin nay de gan vao moi commit.

```bash
# Thiet lap ten (hien thi trong lich su commit)
git config --global user.name "Nguyen Van A"

# Thiet lap email (nen trung voi email GitHub/GitLab)
git config --global user.email "nguyenvana@example.com"
```

### Tai sao bat buoc?

Moi commit trong Git deu chua thong tin nguoi tao:

```
commit a1b2c3d4e5f6...
Author: Nguyen Van A <nguyenvana@example.com>
Date:   Mon Mar 25 10:30:00 2025 +0700

    feat: them tinh nang dang nhap
```

Neu ban khong cau hinh, Git se **tu choi commit** hoac dung thong tin mac dinh cua he thong (co the khong chinh xac).

### Kiem tra cau hinh

```bash
# Xem tat ca cau hinh
git config --list

# Xem mot cau hinh cu the
git config user.name
git config user.email
```

---

## 3. Ba cap cau hinh: System, Global, Local

Git co 3 cap cau hinh, **cap duoi ghi de cap tren**:

```
+--------------------------------------------------+
|                   SYSTEM                          |
|  /etc/gitconfig (Linux/macOS)                     |
|  C:\Program Files\Git\etc\gitconfig (Windows)     |
|  Ap dung cho TAT CA user tren may                 |
+--------------------------------------------------+
            |
            v  (bi ghi de boi)
+--------------------------------------------------+
|                   GLOBAL                          |
|  ~/.gitconfig hoac ~/.config/git/config           |
|  Ap dung cho USER hien tai, TAT CA repo           |
+--------------------------------------------------+
            |
            v  (bi ghi de boi)
+--------------------------------------------------+
|                   LOCAL                           |
|  .git/config (trong thu muc repo)                 |
|  Chi ap dung cho REPO hien tai                    |
+--------------------------------------------------+
```

### Khi nao dung cap nao?

| Cap | Lenh | Khi nao dung |
|-----|------|-------------|
| `--system` | `git config --system` | IT admin thiet lap cho toan may (hiem khi dung) |
| `--global` | `git config --global` | Thiet lap ca nhan: ten, email, editor, alias |
| `--local` | `git config --local` | Thiet lap rieng cho 1 repo: email cong ty khac |

### Vi du thuc te: Dung email khac cho repo cong ty

```bash
# Email ca nhan (global — dung cho moi repo)
git config --global user.email "personal@gmail.com"

# Email cong ty (local — chi cho repo nay)
cd ~/work/company-project
git config --local user.email "nguyenvana@company.com"

# Kiem tra — email local se duoc uu tien trong repo nay
git config user.email
# nguyenvana@company.com
```

---

## 4. Thiet lap editor mac dinh

Khi Git can ban nhap noi dung (viet commit message, resolve conflict...), no se mo text editor. Mac dinh la **vim** — kho dung voi nguoi moi.

### Doi sang VS Code (khuyen nghi)

```bash
git config --global core.editor "code --wait"
```

`--wait` bao Git doi cho den khi ban dong file trong VS Code truoc khi tiep tuc.

### Doi sang cac editor khac

```bash
# Nano (de dung, trong terminal)
git config --global core.editor "nano"

# Vim (manh, nhung can hoc)
git config --global core.editor "vim"

# Sublime Text
git config --global core.editor "subl -n -w"

# Notepad++ (Windows)
git config --global core.editor "'C:/Program Files/Notepad++/notepad++.exe' -multiInst -notabbar -nosession -noPlugin"
```

### Kiem tra editor hien tai

```bash
git config core.editor
# code --wait
```

### Meo: Thoat khoi vim khi vo tinh vao

Neu ban bi "mac ket" trong vim (chuyen that su xay ra voi nguoi moi):

```
1. Nhan phim Esc (dam bao o Normal mode)
2. Go   :q!   roi nhan Enter (thoat khong luu)
   hoac :wq   roi nhan Enter (luu va thoat)
```

---

## 5. Thiet lap SSH Key

SSH Key cho phep ban ket noi voi GitHub/GitLab ma **khong can nhap mat khau** moi lan push/pull.

### 5.1 Kiem tra SSH key hien co

```bash
ls -la ~/.ssh
# Neu thay id_ed25519 va id_ed25519.pub (hoac id_rsa, id_rsa.pub) la da co
```

### 5.2 Tao SSH key moi

```bash
# Tao key voi thuat toan Ed25519 (khuyen nghi, bao mat hon RSA)
ssh-keygen -t ed25519 -C "nguyenvana@example.com"
```

Khi duoc hoi:

```
Enter file in which to save the key (/home/user/.ssh/id_ed25519):
# Nhan Enter de dung duong dan mac dinh

Enter passphrase (empty for no passphrase):
# Nhap mat khau bao ve key (khuyen nghi) hoac Enter de bo qua

Enter same passphrase again:
# Nhap lai mat khau
```

### 5.3 Them SSH key vao ssh-agent

```bash
# Khoi dong ssh-agent
eval "$(ssh-agent -s)"
# Agent pid 12345

# Them key vao agent
ssh-add ~/.ssh/id_ed25519
```

**Tren macOS**, them vao `~/.ssh/config` de tu dong load:

```
Host github.com
    AddKeysToAgent yes
    UseKeychain yes
    IdentityFile ~/.ssh/id_ed25519
```

### 5.4 Them public key vao GitHub

```bash
# Copy noi dung public key
# macOS:
pbcopy < ~/.ssh/id_ed25519.pub

# Linux:
xclip -selection clipboard < ~/.ssh/id_ed25519.pub

# Windows (Git Bash):
clip < ~/.ssh/id_ed25519.pub

# Hoac don gian doc file va copy bang tay:
cat ~/.ssh/id_ed25519.pub
```

Sau do vao GitHub:
1. **Settings** > **SSH and GPG keys** > **New SSH key**
2. Dat ten (vi du: "MacBook Pro cua toi")
3. Dan public key vao
4. Click **Add SSH key**

### 5.5 Kiem tra ket noi

```bash
ssh -T git@github.com
```

Ket qua thanh cong:

```
Hi nguyenvana! You've successfully authenticated, but GitHub does not provide shell access.
```

Neu thay loi `Permission denied`, kiem tra lai:
- Key da them vao ssh-agent chua?
- Public key da them vao GitHub chua?
- Dung key phai khong?

---

## 6. Cac cau hinh huu ich khac

### 6.1 Line Ending (quan trong khi lam viec nhom Windows + macOS/Linux)

```bash
# Windows: Tu dong chuyen LF -> CRLF khi checkout, CRLF -> LF khi commit
git config --global core.autocrlf true

# macOS/Linux: Chi canh bao neu co CRLF, chuyen ve LF khi commit
git config --global core.autocrlf input
```

**Tai sao quan trong?** Windows dung `CRLF` (\r\n), macOS/Linux dung `LF` (\n). Neu khong cau hinh, ban se thay "thay doi" o moi dong du khong sua gi — chi vi line ending khac nhau.

### 6.2 Default Branch Name

```bash
# Doi ten branch mac dinh tu "master" sang "main"
git config --global init.defaultBranch main
```

Tu nam 2020, `main` tro thanh ten mac dinh tren GitHub. Nen dong bo de tranh nham lan.

### 6.3 Pull Strategy

```bash
# Dung rebase thay vi merge khi pull (giu lich su sach hon)
git config --global pull.rebase true

# Hoac chi rebase khi co the fast-forward
git config --global pull.ff only
```

### 6.4 Color Output

```bash
# Bat mau cho output Git (thuong da bat san)
git config --global color.ui auto
```

### 6.5 Alias — Tao lenh tat

```bash
# Alias cho cac lenh hay dung
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --oneline --graph --all --decorate"
```

Sau khi thiet lap, ban co the dung:

```bash
git st          # thay cho git status
git co main     # thay cho git checkout main
git br          # thay cho git branch
git lg          # xem log dep voi graph
```

### 6.6 Credential Helper

```bash
# macOS: Luu credential trong Keychain
git config --global credential.helper osxkeychain

# Windows: Luu credential trong Windows Credential Manager
git config --global credential.helper manager

# Linux: Cache trong 1 gio (3600 giay)
git config --global credential.helper 'cache --timeout=3600'
```

---

## 7. Bang tong hop cau hinh quan trong

| Cau hinh | Lenh | Mo ta |
|----------|------|-------|
| Ten | `git config --global user.name "Ten"` | Ten hien thi trong commit |
| Email | `git config --global user.email "email"` | Email gan voi commit |
| Editor | `git config --global core.editor "code --wait"` | Editor cho commit message |
| Line ending | `git config --global core.autocrlf true/input` | Xu ly xuong dong Win/Mac |
| Default branch | `git config --global init.defaultBranch main` | Ten branch mac dinh |
| Pull strategy | `git config --global pull.rebase true` | Rebase khi pull |
| Color | `git config --global color.ui auto` | Output co mau |
| Alias | `git config --global alias.st status` | Lenh tat |
| Credential | `git config --global credential.helper ...` | Luu mat khau |

---

## 8. Xem va sua file cau hinh truc tiep

Ngoai lenh `git config`, ban co the sua file cau hinh bang tay:

```bash
# Mo file config global bang editor
git config --global --edit

# Xem noi dung file config
cat ~/.gitconfig
```

Noi dung file `~/.gitconfig` tieu bieu:

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

## 9. Loi thuong gap

### Loi 1: Quen cau hinh ten va email

```bash
git commit -m "first commit"
# ERROR:
# *** Please tell me who you are.
# Run
#   git config --global user.email "you@example.com"
#   git config --global user.name "Your Name"

# Cach sua: cau hinh nhu tren
git config --global user.name "Nguyen Van A"
git config --global user.email "nguyenvana@example.com"
```

### Loi 2: SSH key khong hoat dong

```bash
ssh -T git@github.com
# Permission denied (publickey).

# Kiem tra:
# 1. Key da tao chua?
ls ~/.ssh/id_ed25519.pub

# 2. Key da them vao agent chua?
ssh-add -l

# 3. Key da them vao GitHub chua?
# Vao GitHub > Settings > SSH keys de kiem tra

# 4. Thu them lai key vao agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### Loi 3: Mac ket trong vim

```
# Khi Git mo vim bat ngo:
# 1. Nhan Esc
# 2. Go :q! va Enter (thoat khong luu)
# Sau do cau hinh editor khac:
git config --global core.editor "code --wait"
```

### Loi 4: Line ending gay ra diff gia

```bash
# Trieu chung: git diff hien thi moi dong da thay doi, du ban chi sua 1 dong
# Nguyen nhan: Line ending khac nhau (CRLF vs LF)

# Sua:
git config --global core.autocrlf input   # macOS/Linux
git config --global core.autocrlf true    # Windows
```

### Loi 5: Dung HTTPS thay vi SSH

```bash
# Trieu chung: Phai nhap username/password moi lan push
# Kiem tra remote URL:
git remote -v
# origin  https://github.com/user/repo.git  <-- HTTPS

# Doi sang SSH:
git remote set-url origin git@github.com:user/repo.git

# Kiem tra lai:
git remote -v
# origin  git@github.com:user/repo.git  <-- SSH
```

---

## 10. Cau hoi phong van

### Cau 1: Co bao nhieu cap cau hinh trong Git? Giai thich thu tu uu tien.

**Tra loi mau:**

> Git co 3 cap cau hinh: system (/etc/gitconfig — toan may), global (~/.gitconfig — user hien tai), va local (.git/config — repo hien tai). Thu tu uu tien tu cao den thap: local > global > system. Nghia la cau hinh local se ghi de global, va global ghi de system. Dieu nay cho phep cau hinh chung o global nhung tuy chinh rieng cho tung repo o local.

### Cau 2: Lam the nao de dung email khac nhau cho repo ca nhan va repo cong ty?

**Tra loi mau:**

> Dung `git config --global user.email` de thiet lap email mac dinh (ca nhan). Trong repo cong ty, dung `git config --local user.email "email@company.com"` de ghi de. Config local chi ap dung cho repo hien tai, khong anh huong cac repo khac.

### Cau 3: SSH va HTTPS khac nhau the nao khi lam viec voi remote repo?

**Tra loi mau:**

> HTTPS yeu cau nhap username/password (hoac Personal Access Token) moi lan push/pull, co the cache bang credential helper. SSH dung cap key (public/private), sau khi thiet lap mot lan thi khong can nhap lai. SSH bao mat hon va tien hon cho viec su dung hang ngay. HTTPS de thiet lap hon ban dau va khong bi chon boi firewall cong ty.

### Cau 4: `core.autocrlf` la gi va tai sao can cau hinh?

**Tra loi mau:**

> `core.autocrlf` xu ly su khac biet ve line ending giua Windows (CRLF - \r\n) va Unix/macOS (LF - \n). Tren Windows, dat `true` de Git tu dong chuyen CRLF -> LF khi commit va LF -> CRLF khi checkout. Tren macOS/Linux, dat `input` de chi chuyen CRLF -> LF khi commit. Dieu nay ngan viec line ending tao ra diff gia khi lam viec nhom da nen tang.

### Cau 5: Lam sao de xem toan bo cau hinh Git hien tai va biet cau hinh nao den tu file nao?

**Tra loi mau:**

> Dung `git config --list` de xem toan bo cau hinh. De biet cau hinh den tu file nao, dung `git config --list --show-origin`. Lenh nay hien thi duong dan file truoc moi gia tri, giup debug khi cau hinh khong nhu mong doi.

```bash
# Vi du output
git config --list --show-origin
# file:/home/user/.gitconfig    user.name=Nguyen Van A
# file:/home/user/.gitconfig    user.email=personal@gmail.com
# file:.git/config              user.email=work@company.com
```

---

## Tong ket

| Buoc | Lenh | Mo ta |
|------|------|-------|
| 1 | `git --version` | Kiem tra da cai chua |
| 2 | `git config --global user.name` | Dat ten |
| 3 | `git config --global user.email` | Dat email |
| 4 | `git config --global core.editor` | Chon editor |
| 5 | `ssh-keygen -t ed25519` | Tao SSH key |
| 6 | Them key vao GitHub | Ket noi SSH |
| 7 | `ssh -T git@github.com` | Kiem tra ket noi |

**Buoc tiep theo:** Tim hieu cac khai niem cot loi trong Git — Working Directory, Staging Area, Repository.
