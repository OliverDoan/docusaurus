---
sidebar_position: 3
title: "Cac khai niem cot loi trong Git"
---

# Cac khai niem cot loi trong Git

Truoc khi go bat ky lenh Git nao, ban can hieu **cach Git suy nghi**. Bai nay giai thich cac khai niem nen tang ma moi thu trong Git deu xay dung tren do.

---

## 1. Ba vung lam viec cua Git

Day la khai niem **quan trong nhat** de hieu Git. Moi file trong du an cua ban ton tai o mot trong 3 vung:

```
+-------------------+     git add     +-------------------+    git commit    +-------------------+
|                   | -------------> |                   | --------------> |                   |
|  WORKING          |                |  STAGING AREA     |                 |  REPOSITORY       |
|  DIRECTORY        |                |  (Index)          |                 |  (.git)           |
|                   |                |                   |                 |                   |
|  Noi ban VIET     |                |  Noi ban CHUAN    |                 |  Noi Git LUU      |
|  va CHINH SUA     |                |  BI cho commit    |                 |  VINH VIEN        |
|  code             |                |  tiep theo        |                 |                   |
|                   | <------------- |                   | <-------------- |                   |
+-------------------+  git restore   +-------------------+  git restore    +-------------------+
                                                            --staged
```

### 1.1 Working Directory (Thu muc lam viec)

Day la **thu muc thuc** tren may tinh cua ban — noi ban mo file, viet code, sua loi.

```bash
# Ban sua file index.html
# -> File index.html o trang thai "modified" trong Working Directory

# Ban tao file moi style.css
# -> File style.css o trang thai "untracked" trong Working Directory
```

**Trang thai file trong Working Directory:**

| Trang thai | Y nghia |
|------------|---------|
| **Untracked** | File moi, Git chua biet den |
| **Modified** | File da thay doi so voi lan commit cuoi |
| **Deleted** | File da bi xoa |
| **Unmodified** | File khong thay doi gi |

### 1.2 Staging Area (Vung chuan bi)

Day la vung **trung gian** — noi ban chon nhung thay doi nao se duoc dua vao commit tiep theo.

```bash
# Them file vao Staging Area
git add index.html
# -> index.html chuyen tu Working Directory sang Staging Area

# Them tat ca file da thay doi
git add .
```

**Tai sao can Staging Area? Tai sao khong commit thang?**

Vi du thuc te: Ban dang lam 2 viec cung luc:

```bash
# Ban sua 3 file:
# - login.js      (tinh nang dang nhap)
# - register.js   (tinh nang dang ky)
# - style.css     (sua giao dien)

# KHONG CO Staging Area (kieu SVN):
svn commit -m "them login va sua giao dien"
# -> Commit het, khong tach duoc

# CO Staging Area (Git):
git add login.js
git commit -m "feat: them tinh nang dang nhap"

git add register.js
git commit -m "feat: them tinh nang dang ky"

git add style.css
git commit -m "fix: sua loi giao dien trang chu"
# -> Tach thanh 3 commit ro rang!
```

Staging Area cho phep ban **chon loc** (selective commit) — chi commit nhung gi lien quan voi nhau.

### 1.3 Repository (Kho luu tru)

Day la **co so du lieu** cua Git, nam trong thu muc `.git/`. Khi ban `git commit`, Git lay snapshot tu Staging Area va luu vinh vien vao day.

```bash
git commit -m "feat: them tinh nang dang nhap"
# -> Tao 1 commit moi trong Repository
# -> Commit nay se ton tai MAI MAI (tru khi ban co y xoa)
```

### Toan canh dong chay

```
Ban sua file  --->  git add  --->  git commit
    |                  |               |
    v                  v               v
 Working           Staging         Repository
 Directory          Area           (.git/)
    |                  |               |
    |   "Toi da sua    |  "Toi muon    |  "Da luu thanh
    |    xong"         |   commit      |   cong vao
    |                  |   nhung       |   lich su"
    |                  |   thay doi    |
    |                  |   nay"        |
```

---

## 2. Commit la gi?

### Commit = Snapshot, khong phai Diff

Nhieu nguoi nghi commit la "luu su thay doi". **Sai.**

Commit la **anh chup toan bo trang thai** cua du an tai mot thoi diem.

```
Commit A:  [index.html v1] [style.css v1] [app.js v1]
    |
    v
Commit B:  [index.html v2] [style.css v1] [app.js v1]
    |       (da sua)        (khong doi,     (khong doi,
    v                        link den v1)    link den v1)
Commit C:  [index.html v2] [style.css v2] [app.js v2]
            (link den v2)   (da sua)        (da sua)
```

**Tuong tu nhu save game:**

| Game | Git |
|------|-----|
| Save game | git commit |
| Load game | git checkout |
| Save slot 1, 2, 3... | Commit A, B, C... |
| Moi save slot = trang thai day du | Moi commit = snapshot day du |
| Co the load bat ky save nao | Co the checkout bat ky commit nao |

### Cau truc cua mot commit

```bash
git log --format=fuller -1
```

```
commit a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0  <-- SHA-1 hash (dinh danh duy nhat)
Author:     Nguyen Van A <nguyenvana@example.com>    <-- Nguoi viet code
AuthorDate: Mon Mar 25 10:30:00 2025 +0700           <-- Ngay viet
Commit:     Nguyen Van A <nguyenvana@example.com>    <-- Nguoi commit
CommitDate: Mon Mar 25 10:30:00 2025 +0700           <-- Ngay commit
Parent:     f0e1d2c3b4a5...                          <-- Commit cha

    feat: them tinh nang dang nhap                   <-- Commit message
```

Moi commit chua:
- **SHA-1 hash** — dinh danh duy nhat (40 ky tu hex)
- **Author** — nguoi viet code
- **Committer** — nguoi tao commit (thuong la cung 1 nguoi)
- **Date** — thoi gian
- **Parent** — commit truoc do (commit dau tien khong co parent)
- **Tree** — snapshot cua tat ca file
- **Message** — mo ta thay doi

---

## 3. SHA-1 Hash — Dinh danh duy nhat

Moi doi tuong trong Git (commit, file, tree...) deu co mot **SHA-1 hash** — chuoi 40 ky tu hex:

```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

### Tai sao dung hash?

1. **Duy nhat:** Xac suat 2 commit co cung hash la gan nhu 0
2. **Toan ven:** Neu noi dung thay doi, hash se khac — phat hien duoc gia mao
3. **Nhanh:** So sanh 2 hash de biet 2 doi tuong co giong nhau khong

### Su dung hash trong thuc te

```bash
# Xem chi tiet 1 commit bang full hash
git show a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0

# Chi can 7 ky tu dau (Git tu tim)
git show a1b2c3d

# Xem diff giua 2 commit
git diff a1b2c3d f4e5d6c
```

Ban **khong can nho** full hash. Git chi can du ky tu dau de phan biet (thuong la 7 ky tu).

---

## 4. HEAD la gi?

**HEAD** la mot **con tro** (pointer) cho Git biet: "Ban dang o dau trong lich su?"

### Truong hop binh thuong: HEAD tro den branch

```
                       HEAD
                        |
                        v
                       main
                        |
                        v
commit A <--- commit B <--- commit C
```

HEAD -> main -> commit C. Nghia la ban dang o nhanh `main`, tai commit moi nhat `C`.

### Khi ban commit moi

```bash
git commit -m "commit D"
```

```
                                    HEAD
                                     |
                                     v
                                    main
                                     |
                                     v
commit A <--- commit B <--- commit C <--- commit D
```

HEAD van tro den `main`, nhung `main` tien len commit D.

### Xem HEAD dang o dau

```bash
# Xem HEAD
cat .git/HEAD
# ref: refs/heads/main   <-- HEAD tro den branch main

# Xem commit ma HEAD dang tro den
git rev-parse HEAD
# a1b2c3d4e5f6...
```

### Cac cach tham chieu tuong doi tu HEAD

```bash
HEAD          # Commit hien tai
HEAD~1        # Commit truoc do 1 buoc (parent)
HEAD~2        # Commit truoc do 2 buoc (grandparent)
HEAD~3        # Commit truoc do 3 buoc

# Vi du:
git show HEAD       # Xem commit hien tai
git show HEAD~1     # Xem commit truoc
git diff HEAD~2     # So sanh voi 2 commit truoc
```

```
HEAD~3 <--- HEAD~2 <--- HEAD~1 <--- HEAD
commit A     commit B     commit C    commit D
```

---

## 5. Branch (Nhanh)

### Branch chi la mot pointer

Day la dieu nhieu nguoi bat ngo: **branch trong Git chi la mot file nho chua hash cua commit**. Khong co "copy code", khong co "thu muc rieng".

```bash
# Xem noi dung cua branch
cat .git/refs/heads/main
# a1b2c3d4e5f6...   <-- Chi la 1 dong hash!
```

### Tai sao branch re va nhanh?

Vi tao branch = tao 1 file 41 bytes (40 ky tu hash + newline). So sanh:

| He thong | Tao branch | Kich thuoc |
|----------|-----------|------------|
| SVN | Copy toan bo thu muc | Hang MB-GB |
| Git | Tao 1 file 41 bytes | 41 bytes |

### Branch hoat dong nhu the nao

```
                       HEAD
                        |
                        v
                       main
                        |
                        v
commit A <--- commit B <--- commit C
```

Tao branch moi:

```bash
git branch feature
```

```
                       HEAD
                        |
                        v
                       main
                        |
                        v
commit A <--- commit B <--- commit C
                              ^
                              |
                           feature
```

Gio ca `main` va `feature` deu tro den commit C. Chuyen sang `feature`:

```bash
git checkout feature
```

```
                       main
                        |
                        v
commit A <--- commit B <--- commit C
                              ^
                              |
                           feature
                              ^
                              |
                             HEAD
```

HEAD chuyen sang `feature`. Commit moi se tien `feature` len:

```bash
git commit -m "them tinh nang moi"
```

```
                       main
                        |
                        v
commit A <--- commit B <--- commit C
                              \
                               \
                                commit D
                                  ^
                                  |
                               feature
                                  ^
                                  |
                                 HEAD
```

`main` van o commit C. `feature` tien len commit D. Day la cach Git ho tro **lam viec song song** tren nhieu nhanh.

---

## 6. Detached HEAD

### Khi nao xay ra?

Khi ban checkout truc tiep mot commit (thay vi mot branch):

```bash
git checkout a1b2c3d
# Warning: You are in 'detached HEAD' state...
```

```
                       main
                        |
                        v
commit A <--- commit B <--- commit C
   ^
   |
  HEAD        <-- HEAD KHONG tro den branch nao!
(detached)
```

### Tai sao nguy hiem?

Neu ban tao commit trong trang thai detached HEAD:

```bash
git commit -m "thu nghiem"
```

```
                       main
                        |
                        v
commit A <--- commit B <--- commit C
   \
    \
     commit X   <-- Commit nay khong thuoc branch nao!
       ^
       |
      HEAD
```

Khi ban chuyen ve `main`, commit X se **khong co branch nao tro den** va co the bi Git don dep (garbage collect) sau mot thoi gian.

### Cach xu ly

```bash
# Cach 1: Tao branch moi tai vi tri hien tai
git checkout -b save-my-work

# Cach 2: Quay ve branch cu (bo mat commit trong detached HEAD)
git checkout main

# Cach 3: Neu da quay ve main nhung muon cuu commit cu
git reflog                    # Tim hash cua commit da mat
git branch save-my-work abc123   # Tao branch tai commit do
```

**Quy tac:** Luon lam viec tren branch, tranh trang thai detached HEAD tru khi chi muon **xem** code cu.

---

## 7. So do Commit History

Commit history trong Git la mot **Directed Acyclic Graph (DAG)** — do thi co huong, khong co vong lap.

### Lich su tuyen tinh (don gian)

```
commit A <--- commit B <--- commit C <--- commit D
(init)                                    (HEAD -> main)
```

Moi commit tro ve parent cua no (commit truoc do).

### Lich su co branching va merging

```
commit A <--- commit B <--- commit C <--- commit F (merge) <--- commit G
                \                          /                     (HEAD -> main)
                 \                        /
                  commit D <--- commit E
                  (feature branch)
```

Commit F la **merge commit** — co 2 parent (C va E).

### Doc lich su bang `git log --graph`

```bash
git log --oneline --graph --all
```

```
*   f1a2b3c (HEAD -> main) Merge branch 'feature'
|\
| * e4d5c6b (feature) them validation
| * d7e8f9a them form login
|/
* c1b2a3d sua trang chu
* b4c5d6e them CSS
* a7b8c9d init project
```

Cach doc:
- `*` = 1 commit
- `|` = dong lich su cua 1 branch
- `\` va `/` = branch tach ra hoac merge vao
- `(HEAD -> main)` = HEAD dang o branch main tai commit nay

---

## 8. Thu muc .git

Khi ban `git init`, Git tao thu muc `.git/` — **toan bo "bo nao" cua Git** nam o day.

```bash
ls -la .git/
```

```
.git/
├── HEAD            # Con tro den branch hien tai
├── config          # Cau hinh local cua repo nay
├── description     # Mo ta repo (dung cho GitWeb, it khi can)
├── hooks/          # Scripts chay tu dong (pre-commit, post-commit...)
├── index           # Staging Area (binary file)
├── info/           # Thong tin bo sung
│   └── exclude     # Gitignore local (khong commit)
├── objects/        # TAT CA du lieu: commits, trees, blobs
│   ├── pack/       # Du lieu da nen
│   └── info/
└── refs/           # BRANCH va TAG pointers
    ├── heads/      # Local branches
    │   └── main    # File nho chua hash cua commit moi nhat tren main
    ├── tags/       # Tags
    └── remotes/    # Remote tracking branches
        └── origin/
            └── main
```

### Cac thanh phan quan trong

| Thu muc/File | Chuc nang | Ghi chu |
|-------------|-----------|---------|
| `HEAD` | Tro den branch hien tai | `ref: refs/heads/main` |
| `objects/` | Luu tat ca du lieu | commits, files (blobs), trees |
| `refs/heads/` | Cac branch local | Moi branch = 1 file chua hash |
| `refs/remotes/` | Cac branch remote | Tracking branches |
| `refs/tags/` | Cac tag | Danh dau phien ban |
| `index` | Staging Area | File binary, dung `git ls-files` de doc |
| `config` | Config local | Ghi de global config |
| `hooks/` | Hook scripts | Tu dong chay khi commit, push... |

### Xem noi dung objects

Git luu 3 loai object:

```
+-----------+     +-----------+     +-----------+
|   BLOB    |     |   TREE    |     |  COMMIT   |
| (noi dung |     | (thu muc) |     | (snapshot)|
|  file)    |     |           |     |           |
| "hello"   |     | blob a1.. |     | tree b2.. |
|           |     | blob c3.. |     | parent d4 |
|           |     | tree e5.. |     | author... |
+-----------+     +-----------+     +-----------+
```

- **Blob:** Noi dung cua 1 file (khong co ten file!)
- **Tree:** Giong nhu thu muc — chua danh sach blobs va trees con
- **Commit:** Metadata + pointer den tree (snapshot)

```bash
# Xem loai object
git cat-file -t a1b2c3d
# commit

# Xem noi dung object
git cat-file -p a1b2c3d
# tree b4c5d6e7...
# parent f8a9b0c1...
# author Nguyen Van A <email> 1711234567 +0700
# committer Nguyen Van A <email> 1711234567 +0700
#
# feat: them tinh nang dang nhap
```

**Ban khong can nho chi tiet nay cho cong viec hang ngay.** Nhung hieu cach Git luu du lieu se giup ban debug khi gap van de.

---

## 9. File States trong Git

Tong hop trang thai cua file trong Git:

```
                    Untracked        Unmodified       Modified         Staged
                        |                |                |               |
                        |   git add      |                |               |
                        |--------------->|                |               |
                        |                |   Sua file     |               |
                        |                |--------------->|               |
                        |                |                |   git add     |
                        |                |                |-------------->|
                        |                |                |               |
                        |                |   git commit   |               |
                        |                |<-------------------------------|
                        |   git rm       |                |               |
                        |<---------------|                |               |
                        |                |                |               |
```

| Trang thai | Mo ta | Hien thi trong `git status` |
|-----------|-------|----------------------------|
| **Untracked** | File moi, Git chua quan ly | `Untracked files:` (do) |
| **Unmodified** | File khong thay doi | Khong hien thi |
| **Modified** | File da sua nhung chua stage | `Changes not staged:` (do) |
| **Staged** | File da duoc add, san sang commit | `Changes to be committed:` (xanh) |

---

## 10. Loi thuong gap

### Loi 1: Khong hieu tai sao can `git add` truoc `git commit`

```bash
# Nguoi moi thuong hoi: "Tai sao khong commit thang?"
# Tra loi: Staging Area cho phep ban CHON LOC thay doi

# Vi du: ban sua 5 file nhung chi muon commit 2 file
git add file1.js file2.js
git commit -m "feat: them tinh nang A"
# -> Chi 2 file duoc commit

# 3 file con lai commit rieng
git add file3.js file4.js file5.js
git commit -m "fix: sua loi B"
```

### Loi 2: Nham HEAD voi branch

```
HEAD  = "Ban dang o dau?"     (con tro di dong)
Branch = "Nhom commit nay"    (ten nhan cho commit)

HEAD thuong tro den 1 branch.
Khi commit, branch tien len, HEAD di theo.
```

### Loi 3: Nghi branch la "copy" cua code

```
SAI:  "Tao branch = copy toan bo code"
DUNG: "Tao branch = tao 1 pointer 41 bytes"

Git KHONG copy bat ky file nao khi tao branch.
Tat ca branches chia se cung du lieu objects.
```

### Loi 4: Hoang so khi thay "detached HEAD"

```bash
# Khong phai loi! Chi la canh bao.
# Git noi: "Ban dang khong o tren branch nao"

# Cach xu ly an toan:
git checkout -b ten-branch-moi    # Tao branch tai day
# hoac
git checkout main                  # Quay ve branch cu
```

### Loi 5: Xoa thu muc .git

```bash
# TUYET DOI KHONG XOA .git/
rm -rf .git   # MAT HET LICH SU!

# .git chua TOAN BO lich su, branches, configs
# Xoa no = mat het moi thu, chi con file hien tai
```

---

## 11. Cau hoi phong van

### Cau 1: Giai thich 3 vung lam viec cua Git.

**Tra loi mau:**

> Git co 3 vung: (1) Working Directory — noi ban chinh sua file truc tiep, (2) Staging Area (Index) — vung trung gian, chon nhung thay doi can commit, va (3) Repository (.git) — co so du lieu luu tru vinh vien cac commit. Luong lam viec: sua file o Working Directory -> `git add` de dua vao Staging -> `git commit` de luu vao Repository. Staging Area cho phep selective commit — chi commit nhung thay doi lien quan voi nhau.

### Cau 2: Commit trong Git la snapshot hay diff? Giai thich.

**Tra loi mau:**

> Commit la snapshot — anh chup toan bo trang thai cua du an tai thoi diem commit. Git khong luu diff giua cac version. Tuy nhien, Git toi uu bang cach: neu file khong thay doi, Git chi luu mot link (reference) den blob cu thay vi copy lai. Nho vay Git vua nhanh (truy xuat truc tiep snapshot) vua tiet kiem dung luong (khong luu trung lap).

### Cau 3: HEAD la gi? Detached HEAD la gi?

**Tra loi mau:**

> HEAD la con tro cho biet vi tri hien tai trong lich su Git. Binh thuong, HEAD tro den mot branch (vi du main), va khi commit, branch do tien len commit moi. Detached HEAD xay ra khi checkout truc tiep mot commit thay vi branch — khi do HEAD tro den commit cu the thay vi branch. Commit trong trang thai nay se khong thuoc branch nao va co the bi mat khi chuyen branch. Cach xu ly: tao branch moi tai vi tri do bang `git checkout -b ten-branch`.

### Cau 4: Branch trong Git la gi ve mat ky thuat?

**Tra loi mau:**

> Ve ky thuat, branch chi la mot file nho (41 bytes) chua SHA-1 hash cua commit moi nhat tren branch do. Vi du, file `.git/refs/heads/main` chua hash cua commit cuoi tren main. Vi tao branch chi la tao 1 file nho, nen thao tac branching trong Git cuc nhanh, khac voi SVN phai copy toan bo thu muc.

### Cau 5: Git luu du lieu nhu the nao ben trong thu muc .git?

**Tra loi mau:**

> Git luu 3 loai object trong `.git/objects/`: (1) Blob — noi dung file (khong co ten file), (2) Tree — giong thu muc, chua danh sach blobs va trees con, (3) Commit — metadata (author, date, message) + pointer den tree root. Moi object duoc dinh danh bang SHA-1 hash cua noi dung. HEAD la file tro den branch hien tai, refs/heads/ chua cac branch pointer, va index la Staging Area.

---

## Tong ket

| Khai niem | Mo ta | Vi von |
|-----------|-------|--------|
| Working Directory | Noi ban lam viec | Ban lam viec |
| Staging Area | Noi chuan bi commit | Gio hang truoc khi thanh toan |
| Repository | Noi luu vinh vien | Kho hang sau khi thanh toan |
| Commit | Snapshot cua du an | Save game |
| SHA-1 Hash | Dinh danh duy nhat | So CMND cua commit |
| HEAD | Vi tri hien tai | "Ban dang o day" |
| Branch | Pointer den commit | Nhan dan trang sach |
| .git/ | Co so du lieu Git | "Bo nao" cua Git |

**Buoc tiep theo:** Thuc hanh cac lenh Git co ban — init, add, commit, log, diff.
