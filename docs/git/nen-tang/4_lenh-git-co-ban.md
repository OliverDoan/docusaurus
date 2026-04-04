---
sidebar_position: 4
title: "Cac lenh Git co ban"
---

# Cac lenh Git co ban

Bai nay huong dan chi tiet cac lenh Git ban se dung **hang ngay**. Moi lenh deu duoc giai thich **tai sao dung** va **khi nao dung**, khong chi la cu phap.

---

## 1. git init — Tao repository moi

### Cong dung

Khoi tao mot Git repository moi trong thu muc hien tai. Lenh nay tao thu muc `.git/` chua toan bo co so du lieu cua Git.

### Cu phap va vi du

```bash
# Tao thu muc du an va khoi tao Git
mkdir my-project
cd my-project
git init
```

Output:

```
Initialized empty Git repository in /home/user/my-project/.git/
```

### Dieu gi xay ra khi chay `git init`?

```bash
# Truoc khi init
my-project/
└── (trong)

# Sau khi init
my-project/
└── .git/           <-- Thu muc an, chua toan bo Git database
    ├── HEAD
    ├── config
    ├── objects/
    ├── refs/
    └── ...
```

### Luu y quan trong

```bash
# DUNG init trong thu muc da co Git repo
cd my-project
git init              # Lan dau: OK
git init              # Lan hai: KHONG loi, nhung khong can thiet
                      # Git se noi "Reinitialized existing..."

# DUNG init trong thu muc Home (loi pho bien!)
cd ~
git init              # SAI! Se bien toan bo home thanh 1 repo
                      # De go: rm -rf ~/.git
```

### Khi nao dung `git init`?

- Bat dau du an moi tu dau
- Muon quan ly phien ban cho thu muc co san
- Khong dung khi muon lay code tu server (dung `git clone`)

---

## 2. git clone — Sao chep repository

### Cong dung

Tao ban sao day du cua mot remote repository (bao gom toan bo lich su) ve may local.

### Cu phap va vi du

```bash
# Clone bang SSH (khuyen nghi — khong can nhap mat khau)
git clone git@github.com:username/repo-name.git

# Clone bang HTTPS
git clone https://github.com/username/repo-name.git

# Clone vao thu muc co ten khac
git clone git@github.com:username/repo-name.git my-folder

# Clone chi 1 branch cu the (tiet kiem thoi gian)
git clone -b develop git@github.com:username/repo-name.git

# Shallow clone — chi lay N commit gan nhat (nhanh hon nhieu)
git clone --depth 1 git@github.com:username/repo-name.git
# Phu hop khi: repo lon, chi can code moi nhat, CI/CD pipeline
```

### Clone lam gi chinh xac?

```bash
git clone git@github.com:username/repo-name.git
```

Tuong duong voi:

```bash
mkdir repo-name
cd repo-name
git init
git remote add origin git@github.com:username/repo-name.git
git fetch origin
git checkout main
```

Nen `git clone` lam tat ca trong 1 lenh.

### git init vs git clone

| Tinh huong | Dung lenh |
|-----------|-----------|
| Du an moi, chua co tren server | `git init` |
| Lay du an da co tren GitHub/GitLab | `git clone` |
| Da co repo local, muon ket noi remote | `git init` + `git remote add` |

---

## 3. git status — Xem trang thai hien tai

### Cong dung

Hien thi trang thai cua Working Directory va Staging Area. Day la lenh ban se chay **nhieu nhat**.

### Cu phap va vi du

```bash
git status
```

### Doc output cua git status

```bash
On branch main                              # <- Ban dang o branch nao
Your branch is up to date with 'origin/main'. # <- So voi remote

Changes to be committed:                     # <- DA STAGE (xanh la)
  (use "git restore --staged <file>..." to unstage)
        new file:   login.js                 #    File moi da stage
        modified:   index.html               #    File sua da stage

Changes not staged for commit:               # <- CHUA STAGE (do)
  (use "git add <file>..." to update)
        modified:   style.css                #    File sua chua stage

Untracked files:                             # <- FILE MOI, Git chua biet (do)
  (use "git add <file>..." to include)
        README.md                            #    File moi chua track
```

### Phien ban ngan gon

```bash
git status -s
# hoac
git status --short
```

```
A  login.js         # A  = Added (da stage file moi)
M  index.html       # M  = Modified va da stage
 M style.css        #  M = Modified nhung chua stage
?? README.md        # ?? = Untracked (file moi)
```

**Cach doc 2 cot:**
- **Cot trai:** Trang thai trong Staging Area
- **Cot phai:** Trang thai trong Working Directory

| Ky hieu | Cot trai (Staging) | Cot phai (Working) |
|---------|-------------------|-------------------|
| `M` | Da sua va stage | Da sua, chua stage |
| `A` | File moi da stage | — |
| `D` | Da xoa va stage | Da xoa, chua stage |
| `?` | — | File moi, untracked |
| ` ` | Khong thay doi | Khong thay doi |

---

## 4. git add — Dua file vao Staging Area

### Cong dung

Chuyen thay doi tu Working Directory vao Staging Area, chuan bi cho commit tiep theo.

### Cu phap va vi du

```bash
# Them 1 file cu the
git add index.html

# Them nhieu file
git add index.html style.css app.js

# Them tat ca file trong thu muc hien tai (va con)
git add .

# Them tat ca file da thay doi (tracked files only, khong them untracked)
git add -u

# Them tat ca file (bao gom untracked)
git add -A
# hoac
git add --all
```

### git add -p — Them tung phan cua file (NANG CAO nhung RAT HAY)

Khi ban sua nhieu cho trong 1 file nhung chi muon stage mot phan:

```bash
git add -p style.css
```

Git se hien thi tung "hunk" (doan thay doi) va hoi ban:

```diff
@@ -10,6 +10,8 @@
 body {
   margin: 0;
   padding: 0;
+  background: #f5f5f5;     <-- Thay doi 1
+  font-family: sans-serif; <-- Thay doi 2
 }

Stage this hunk [y,n,q,a,d,s,e,?]?
```

| Phim | Y nghia |
|------|---------|
| `y` | Stage doan nay (yes) |
| `n` | Bo qua doan nay (no) |
| `q` | Thoat (khong stage gi them) |
| `a` | Stage doan nay va tat ca cac doan con lai |
| `d` | Bo qua doan nay va tat ca cac doan con lai |
| `s` | Chia doan nay thanh cac doan nho hon |
| `e` | Sua bang tay doan nao muon stage |

**Tai sao dung `git add -p`?**

Vi du ban dang sua file va vo tinh them 1 dong `console.log` de debug. Ban muon commit tinh nang nhung khong muon commit dong debug:

```bash
git add -p app.js
# Doan 1: tinh nang moi -> y (stage)
# Doan 2: console.log debug -> n (bo qua)
```

---

## 5. git commit — Luu thay doi vao Repository

### Cong dung

Tao mot commit moi tu nhung gi dang o Staging Area. Day la "save game" cua Git.

### Cu phap va vi du

```bash
# Commit voi message ngan gon
git commit -m "feat: them tinh nang dang nhap"

# Commit voi message nhieu dong
git commit -m "feat: them tinh nang dang nhap

- Them form dang nhap
- Them validation email
- Them xu ly loi 401"

# Mo editor de viet message (huu ich cho message dai)
git commit
# -> Editor mo ra, viet message, luu va dong

# Commit tat ca file da tracked va modified (bo qua git add)
git commit -am "fix: sua loi hien thi"
# Chu y: -am CHI ap dung cho file DA TRACKED, khong them file moi
```

### git commit --amend — Sua commit cuoi cung

```bash
# Tinh huong: Ban vua commit nhung quen add 1 file
git add forgotten-file.js
git commit --amend
# -> Gop file moi vao commit cuoi, khong tao commit moi

# Sua commit message cuoi cung
git commit --amend -m "feat: them tinh nang dang nhap hoan chinh"
```

**CANH BAO:** Chi dung `--amend` cho commit **chua push** len remote. Neu da push, amend se thay doi lich su va gay conflict cho nguoi khac.

### Viet commit message tot

```bash
# SAI: Mo ho, khong ro lam gi
git commit -m "fix bug"
git commit -m "update"
git commit -m "asdfgh"

# DUNG: Ro rang, theo Conventional Commits
git commit -m "feat: them chuc nang tim kiem san pham"
git commit -m "fix: sua loi khong hien thi avatar user"
git commit -m "refactor: tach component UserCard thanh file rieng"
git commit -m "docs: them huong dan cai dat"
git commit -m "test: them unit test cho UserService"
```

**Format Conventional Commits:**

```
<type>: <mo ta ngan gon>

<body - giai thich chi tiet (tuy chon)>
```

| Type | Khi nao dung |
|------|-------------|
| `feat` | Them tinh nang moi |
| `fix` | Sua loi |
| `refactor` | Refactor code (khong doi hanh vi) |
| `docs` | Thay doi documentation |
| `test` | Them/sua test |
| `chore` | Cong viec bao tri (update dependency...) |
| `perf` | Cai thien hieu nang |
| `style` | Sua format code (khong doi logic) |
| `ci` | Thay doi CI/CD pipeline |

---

## 6. git diff — So sanh su khac biet

### Cong dung

Hien thi su khac biet giua cac trang thai cua file. Giup ban biet chinh xac da thay doi gi truoc khi commit.

### Cu phap va vi du

```bash
# So sanh Working Directory vs Staging Area
# (nhung thay doi CHUA STAGE)
git diff

# So sanh Staging Area vs Repository
# (nhung thay doi DA STAGE, sap duoc commit)
git diff --staged
# hoac
git diff --cached    # Giong --staged

# So sanh Working Directory vs Repository
# (TAT CA thay doi, ca staged va unstaged)
git diff HEAD

# So sanh giua 2 commit
git diff abc1234 def5678

# So sanh giua 2 branch
git diff main feature

# Chi xem ten file da thay doi (khong xem noi dung)
git diff --name-only

# Xem thong ke thay doi (so dong them/xoa)
git diff --stat
```

### Doc output cua git diff

```diff
diff --git a/index.html b/index.html    <-- File duoc so sanh
index 1234567..abcdefg 100644           <-- Hash cua 2 version
--- a/index.html                        <-- Phien ban cu (truoc thay doi)
+++ b/index.html                        <-- Phien ban moi (sau thay doi)
@@ -10,6 +10,8 @@                       <-- Vi tri thay doi: dong 10, 6 dong cu -> 8 dong moi
 <body>                                  <-- Dong khong doi (context)
   <h1>Hello</h1>                        <-- Dong khong doi
+  <nav>                                 <-- Dong THEM MOI (dau +, mau xanh)
+    <a href="/">Home</a>                <-- Dong THEM MOI
+  </nav>                                <-- Dong THEM MOI
-  <p>Old paragraph</p>                  <-- Dong DA XOA (dau -, mau do)
+  <p>New paragraph</p>                  <-- Dong THAY THE (them dong moi)
   <script src="app.js"></script>         <-- Dong khong doi
 </body>
```

### Cac truong hop so sanh

```
                    git diff           git diff --staged        git diff HEAD
                   (unstaged)            (staged)              (tat ca)
                       |                    |                      |
Working Directory  <---|                    |                      |
        |              |    Staging Area <--|                      |
        |              |         |          |     Repository  <----|
        v              v         v          v         |            |
   [file da sua]   [chua add]  [da add]   [sap      [da          [moi thay
                                           commit]   commit]      doi]
```

---

## 7. git log — Xem lich su commit

### Cong dung

Hien thi lich su cac commit, tu moi nhat den cu nhat.

### Cu phap va cac option huu ich

```bash
# Xem log mac dinh (day du thong tin)
git log

# Moi commit tren 1 dong (ngan gon)
git log --oneline

# Xem voi so do branching
git log --oneline --graph

# Xem tat ca branches (khong chi branch hien tai)
git log --oneline --graph --all

# Xem voi ten branch va tag
git log --oneline --graph --all --decorate

# Gioi han so luong commit
git log -5                    # Chi xem 5 commit gan nhat
git log --oneline -10        # 10 commit, dang ngan gon

# Loc theo tac gia
git log --author="Nguyen Van A"

# Loc theo thoi gian
git log --since="2025-01-01"
git log --since="2 weeks ago"
git log --after="2025-03-01" --before="2025-03-31"

# Loc theo noi dung commit message
git log --grep="fix"          # Tim commit co "fix" trong message
git log --grep="login" -i     # Tim khong phan biet hoa thuong

# Loc theo file cu the
git log -- index.html         # Chi xem commit lien quan den file nay

# Loc theo noi dung code
git log -S "function login"   # Tim commit thay doi chua chuoi nay
# (rat huu ich khi muon biet ai them/xoa 1 doan code)

# Format tuy chinh
git log --pretty=format:"%h - %an, %ar : %s"
# abc1234 - Nguyen Van A, 2 hours ago : feat: them login
```

### Doc output cua git log

```bash
git log
```

```
commit a1b2c3d4e5f6 (HEAD -> main, origin/main)  <-- Hash, branches
Author: Nguyen Van A <email>                       <-- Tac gia
Date:   Mon Mar 25 10:30:00 2025 +0700            <-- Ngay

    feat: them tinh nang dang nhap                 <-- Message

commit f4e5d6c7b8a9                               <-- Commit truoc do
Author: Tran Van B <email>
Date:   Sun Mar 24 15:00:00 2025 +0700

    fix: sua loi hien thi trang chu
```

### Lenh log toi khuyen nghi thiet lap alias

```bash
git config --global alias.lg "log --oneline --graph --all --decorate"
```

Sau do dung:

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

## 8. git show — Xem chi tiet 1 commit

### Cong dung

Hien thi chi tiet noi dung cua mot commit cu the — bao gom metadata va diff.

### Cu phap va vi du

```bash
# Xem commit moi nhat
git show

# Xem commit cu the
git show a1b2c3d

# Chi xem metadata, khong xem diff
git show --stat a1b2c3d

# Xem noi dung 1 file tai 1 commit cu the
git show a1b2c3d:index.html
# -> Hien thi noi dung file index.html tai thoi diem commit a1b2c3d

# Xem file tai HEAD (commit hien tai)
git show HEAD:src/app.js
```

### Vi du output

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

## 9. Bang tong hop cac lenh

| Lenh | Cong dung | Dung khi |
|------|-----------|----------|
| `git init` | Tao repo moi | Bat dau du an moi |
| `git clone <url>` | Sao chep repo | Lay code tu server |
| `git status` | Xem trang thai | Truoc khi add/commit |
| `git add <file>` | Stage file | Chuan bi commit |
| `git add .` | Stage tat ca | Commit toan bo thay doi |
| `git add -p` | Stage tung phan | Chon loc thay doi |
| `git commit -m "msg"` | Luu thay doi | Sau khi stage |
| `git commit -am "msg"` | Add + commit | Nhanh, chi file tracked |
| `git commit --amend` | Sua commit cuoi | Quen file/sai message |
| `git diff` | Xem thay doi chua stage | Truoc khi add |
| `git diff --staged` | Xem thay doi da stage | Truoc khi commit |
| `git log` | Xem lich su | Kiem tra lich su |
| `git log --oneline --graph` | Xem lich su dep | Tong quan nhanh |
| `git show <hash>` | Chi tiet 1 commit | Xem commit cu the |

---

## 10. Workflow thuc te: Tu 0 den commit dau tien

Hay lam theo tung buoc:

```bash
# Buoc 1: Tao thu muc du an
mkdir todo-app
cd todo-app

# Buoc 2: Khoi tao Git
git init
# -> Initialized empty Git repository

# Buoc 3: Tao file dau tien
echo '<!DOCTYPE html>
<html>
<head><title>Todo App</title></head>
<body>
  <h1>My Todo App</h1>
</body>
</html>' > index.html

# Buoc 4: Kiem tra trang thai
git status
# -> Untracked files: index.html (do)

# Buoc 5: Stage file
git add index.html
git status
# -> Changes to be committed: new file: index.html (xanh)

# Buoc 6: Commit
git commit -m "feat: tao trang HTML co ban cho todo app"
# -> [main (root-commit) abc1234] feat: tao trang HTML co ban

# Buoc 7: Kiem tra log
git log --oneline
# abc1234 (HEAD -> main) feat: tao trang HTML co ban

# Buoc 8: Tiep tuc lam viec — them CSS
echo 'body { font-family: sans-serif; margin: 2rem; }
h1 { color: #333; }' > style.css

# Buoc 9: Kiem tra thay doi
git status
# -> Untracked files: style.css

git add style.css
git commit -m "feat: them file CSS co ban"

# Buoc 10: Xem lich su
git log --oneline
# def5678 (HEAD -> main) feat: them file CSS co ban
# abc1234 feat: tao trang HTML co ban

# Buoc 11: Sua file va xem diff
# (Sua index.html, them link CSS)
git diff
# -> Hien thi dong da them/xoa

git add .
git commit -m "feat: ket noi CSS vao trang HTML"

# Xem lich su hoan chinh
git log --oneline --graph
# * ghi7890 (HEAD -> main) feat: ket noi CSS vao trang HTML
# * def5678 feat: them file CSS co ban
# * abc1234 feat: tao trang HTML co ban
```

---

## 11. Loi thuong gap

### Loi 1: Commit khong co gi (empty commit)

```bash
git commit -m "them tinh nang"
# nothing to commit, working tree clean

# Nguyen nhan: Chua git add!
# Sua:
git add .
git commit -m "them tinh nang"
```

### Loi 2: Dung `git add .` o thu muc sai

```bash
# Ban dang o thu muc con nhung muon add tat ca
cd src/
git add .       # Chi add file trong src/, khong phai toan bo project!

# Sua: Quay ve root hoac dung duong dan
cd ..
git add .       # Add tu root

# Hoac dung -A tu bat ky dau
git add -A      # Add toan bo thay doi trong repo
```

### Loi 3: Commit nham file

```bash
# Tinh huong: vua commit nham file .env (chua mat khau!)

# Cach 1: Xoa file khoi commit cuoi (neu CHUA push)
git reset HEAD~1                    # Undo commit cuoi
git reset HEAD .env                 # Unstage file .env
echo ".env" >> .gitignore          # Them vao gitignore
git add .gitignore
git commit -m "chore: them .env vao gitignore"

# Cach 2: Neu DA push — can xoa khoi toan bo lich su
# (Xem bai ve .gitignore va quan ly file)
```

### Loi 4: Quen message khi commit

```bash
# Git mo editor (thuong la vim) khi khong co -m
git commit
# -> vim mo ra, ban khong biet cach dung

# Cach 1: Trong vim, nhan i de vao Insert mode, go message
#          Nhan Esc, go :wq Enter

# Cach 2: Doi editor (xem bai Cai dat va cau hinh)
git config --global core.editor "code --wait"

# Cach 3: Luon dung -m
git commit -m "message cua ban"
```

### Loi 5: `git commit -am` khong them file moi

```bash
# Tao file moi
touch new-feature.js

git commit -am "them tinh nang moi"
# -> new-feature.js KHONG duoc commit!

# Ly do: -a chi add file DA TRACKED (da commit truoc do)
# File moi (untracked) phai dung git add truoc

# Sua:
git add new-feature.js
git commit -m "them tinh nang moi"
```

---

## 12. Cau hoi phong van

### Cau 1: Su khac nhau giua `git add .` va `git add -A`?

**Tra loi mau:**

> `git add .` them tat ca file moi, da sua, da xoa **trong thu muc hien tai va cac thu muc con**. `git add -A` (hoac `--all`) them tat ca thay doi **trong toan bo repository**, bat ke ban dang o thu muc nao. Khi ban dang o root cua repo, 2 lenh cho ket qua giong nhau. Khac biet chi xuat hien khi ban dang o thu muc con.

### Cau 2: `git diff` va `git diff --staged` khac nhau the nao?

**Tra loi mau:**

> `git diff` so sanh Working Directory voi Staging Area — cho thay nhung thay doi chua duoc `git add`. `git diff --staged` (hoac `--cached`) so sanh Staging Area voi commit cuoi cung — cho thay nhung thay doi da `git add` va se duoc commit. De xem tat ca thay doi (ca staged va unstaged), dung `git diff HEAD`.

### Cau 3: Lam sao de undo commit cuoi cung?

**Tra loi mau:**

> Co 3 cach tuy theo muc do:
> - `git reset --soft HEAD~1`: Undo commit, giu file trong Staging Area. Thich hop khi muon sua message hoac them file.
> - `git reset --mixed HEAD~1` (mac dinh): Undo commit, chuyen file ve Working Directory. Thich hop khi muon stage lai theo cach khac.
> - `git reset --hard HEAD~1`: Undo commit VA xoa moi thay doi. **NGUY HIEM** — mat du lieu vinh vien.
> - `git commit --amend`: Khong undo ma sua commit cuoi (doi message, them file). Chi dung khi chua push.

### Cau 4: Giai thich `git commit -am` va han che cua no.

**Tra loi mau:**

> `git commit -am "message"` ket hop `git add` va `git commit` trong 1 lenh. Flag `-a` tu dong stage tat ca file **da tracked** (da commit truoc do) ma co thay doi. Han che: no **khong** them file moi (untracked files). File moi phai duoc `git add` rieng truoc khi commit. Nen `-am` chi tien khi lam viec voi file da co, khong phu hop khi tao file moi.

### Cau 5: `git clone --depth 1` la gi va khi nao nen dung?

**Tra loi mau:**

> `--depth 1` tao mot "shallow clone" — chi tai commit moi nhat, khong tai toan bo lich su. Dieu nay lam giam dang ke thoi gian va dung luong khi clone repo lon. Su dung trong: CI/CD pipeline (chi can build code moi nhat), thu nhanh code nguoi khac, repo co lich su qua lon. Han che: khong the xem full log, khong the push thay doi (trong mot so truong hop), va mot so thao tac Git se bi gioi han.

---

## Tong ket luong lam viec hang ngay

```
+-------+     +--------+     +--------+     +---------+
| Viet  | --> | Kiem    | --> | Stage  | --> | Commit  |
| code  |     | tra     |     | (add)  |     |         |
+-------+     +--------+     +--------+     +---------+
                  |
              git status
              git diff
```

10 lenh ban dung moi ngay:

```bash
git status              # 1. Xem trang thai
git diff                # 2. Xem thay doi
git add <file>          # 3. Stage file
git commit -m "msg"     # 4. Commit
git log --oneline       # 5. Xem lich su
git show                # 6. Xem commit cuoi
git diff --staged       # 7. Xem thay doi da stage
git add -p              # 8. Stage chon loc
git commit --amend      # 9. Sua commit cuoi
git clone               # 10. Clone repo
```

**Buoc tiep theo:** Tim hieu ve `.gitignore` va cach quan ly file trong Git.
