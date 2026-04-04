---
sidebar_position: 4
title: "Giai quyet conflict trong Git"
---

# Giai quyet conflict trong Git

Conflict (xung dot) la dieu **khong the tranh khoi** khi lam viec nhom voi Git. Nhung thay vi so hai, ban nen xem conflict nhu mot **co hoi de review va cai thien code**. Bai nay se giup ban hieu tai sao conflict xay ra, cach doc conflict markers, va quy trinh giai quyet conflict tu co ban den nang cao.

---

## 1. Conflict xay ra khi nao va tai sao?

### 1.1. Dieu kien de xay ra conflict

Conflict xay ra khi **hai nguoi (hoac hai branch) cung sua mot dong** trong cung mot file, va Git **khong biet nen chon phien ban nao**.

```
# Developer A (tren feature/header):
# Sua dong 5 cua file style.css
body { color: red; }        -->  body { color: blue; }

# Developer B (tren feature/theme):
# Cung sua dong 5 cua file style.css
body { color: red; }        -->  body { color: green; }

# Khi merge: Git khong biet chon blue hay green
# => CONFLICT!
```

### 1.2. Khi nao KHONG co conflict?

Git thong minh hon ban nghi. Nhieu truong hop Git tu dong giai quyet:

```
# Truong hop 1: Sua KHAC FILE
# A sua header.html, B sua footer.html
# => Khong conflict, Git merge binh thuong

# Truong hop 2: Sua KHAC DONG trong cung file
# A sua dong 5, B sua dong 20
# => Khong conflict, Git gop ca hai

# Truong hop 3: Mot nguoi sua, nguoi kia khong
# A sua file.txt, B khong dong file.txt
# => Khong conflict, Git lay phien ban cua A
```

### 1.3. Cac tinh huong gay conflict

| Tinh huong | Xay ra khi |
|-----------|-----------|
| **Merge conflict** | `git merge branch` -- hai branch cung sua mot dong |
| **Rebase conflict** | `git rebase main` -- commit cua ban conflict voi main |
| **Pull conflict** | `git pull` -- remote va local cung sua mot dong |
| **Cherry-pick conflict** | `git cherry-pick hash` -- commit chon conflict voi branch hien tai |
| **Stash pop conflict** | `git stash pop` -- stash conflict voi thay doi hien tai |

---

## 2. Conflict markers -- Doc va hieu

### 2.1. Cau truc conflict markers

Khi conflict xay ra, Git chen cac **markers** vao file:

```
<<<<<<< HEAD
// Day la code cua BRANCH HIEN TAI (branch ban dang dung tren)
body { color: blue; }
=======
// Day la code cua BRANCH DANG MERGE VAO
body { color: green; }
>>>>>>> feature/theme
```

Giai thich:

```
<<<<<<< HEAD              <-- Bat dau vung conflict (phien ban cua ban)
[code tu branch hien tai]
=======                   <-- Ranh gioi giua 2 phien ban
[code tu branch dang merge]
>>>>>>> feature/theme     <-- Ket thuc vung conflict (ten branch kia)
```

### 2.2. Vi du thuc te

```javascript
// File: app.js
const config = {
<<<<<<< HEAD
  theme: 'dark',
  fontSize: 16,
  language: 'vi',
=======
  theme: 'light',
  fontSize: 14,
  language: 'en',
>>>>>>> feature/settings
  debug: false,
};
```

Ban co 4 lua chon:

```javascript
// Lua chon 1: Giu phien ban cua ban (HEAD)
const config = {
  theme: 'dark',
  fontSize: 16,
  language: 'vi',
  debug: false,
};

// Lua chon 2: Lay phien ban tu branch kia
const config = {
  theme: 'light',
  fontSize: 14,
  language: 'en',
  debug: false,
};

// Lua chon 3: Ket hop ca hai
const config = {
  theme: 'dark',         // Giu dark tu HEAD
  fontSize: 16,          // Giu 16 tu HEAD
  language: 'en',        // Lay en tu feature
  debug: false,
};

// Lua chon 4: Viet lai hoan toan
const config = {
  theme: 'auto',         // Hoan toan moi
  fontSize: 15,
  language: 'vi',
  debug: false,
};
```

### 2.3. Nhieu vung conflict trong mot file

Mot file co the co **nhieu vung conflict**. Ban phai giai quyet **tat ca** truoc khi commit:

```python
# file: settings.py

<<<<<<< HEAD
DATABASE_URL = "postgresql://localhost/mydb"
=======
DATABASE_URL = "postgresql://localhost/testdb"
>>>>>>> feature/testing

SECRET_KEY = "shared-secret"  # Dong nay khong conflict

<<<<<<< HEAD
DEBUG = False
LOG_LEVEL = "WARNING"
=======
DEBUG = True
LOG_LEVEL = "DEBUG"
>>>>>>> feature/testing
```

**Quan trong:** Sau khi sua xong, dam bao **KHONG con bat ky marker nao** (`<<<<<<<`, `=======`, `>>>>>>>`) trong file. Mot marker sot lai = code bi hong.

---

## 3. Quy trinh giai quyet conflict tung buoc

### Buoc 1: Nhan biet conflict

```bash
git merge feature/login
# Auto-merging app.js
# CONFLICT (content): Merge conflict in app.js
# Auto-merging style.css
# CONFLICT (content): Merge conflict in style.css
# Automatic merge failed; fix conflicts and then commit the result.

# Xem trang thai
git status
# On branch main
# You have unmerged paths.
#   (fix conflicts and run "git commit")
#   (use "git merge --abort" to abort the merge)
#
# Unmerged paths:
#   (use "git add <file>..." to mark resolution)
#         both modified:   app.js
#         both modified:   style.css
```

### Buoc 2: Mo file va tim conflict markers

```bash
# Tim tat ca file co conflict markers
grep -rn "<<<<<<< " .
# ./app.js:10:<<<<<<< HEAD
# ./style.css:5:<<<<<<< HEAD

# Hoac xem danh sach file conflict
git diff --name-only --diff-filter=U
# app.js
# style.css
```

### Buoc 3: Sua file -- loai bo markers va chon code dung

Mo file trong editor, tim cac vung `<<<<<<<`, quyet dinh giu code nao:

```javascript
// TRUOC (co conflict markers):
function getGreeting(user) {
<<<<<<< HEAD
  return `Xin chao, ${user.name}!`;
=======
  return `Hello, ${user.fullName}!`;
>>>>>>> feature/i18n
}

// SAU (da giai quyet -- ket hop ca hai):
function getGreeting(user) {
  return `Xin chao, ${user.fullName}!`;
  // Giu "Xin chao" tu HEAD, dung "fullName" tu feature
}
```

### Buoc 4: Stage file da sua

```bash
# Stage tung file
git add app.js
git add style.css

# Hoac stage tat ca file da sua
git add .
```

### Buoc 5: Commit

```bash
# Voi merge conflict:
git commit
# Git tu dong tao message: "Merge branch 'feature/login'"
# Hoac ban co the sua message

# Voi rebase conflict:
git rebase --continue
# KHONG dung git commit voi rebase!
```

### Buoc 6: Xac nhan

```bash
# Kiem tra khong con conflict
git status
# On branch main
# nothing to commit, working tree clean

# Kiem tra ket qua merge
git log --oneline --graph -5
# *   abc1234 (HEAD -> main) Merge branch 'feature/login'
# |\
# ...

# Kiem tra code hoat dong dung
# Chay tests, build, etc.
```

---

## 4. Dung VS Code de resolve conflict

### 4.1. Giao dien VS Code

Khi mo file co conflict trong VS Code, ban se thay:

```
<<<<<<< HEAD (Current Change)     <-- Highlight mau xanh la
  theme: 'dark',
=======
  theme: 'light',
>>>>>>> feature/theme (Incoming Change)  <-- Highlight mau xanh duong
```

VS Code hien thi cac nut:
- **Accept Current Change** -- Giu code cua ban (HEAD)
- **Accept Incoming Change** -- Lay code tu branch kia
- **Accept Both Changes** -- Giu ca hai (xep chong len nhau)
- **Compare Changes** -- Mo diff view de so sanh

### 4.2. Cach dung

```
1. Mo file co conflict
2. Tim vung highlight mau
3. Click nut phu hop:
   - "Accept Current" neu code cua ban dung
   - "Accept Incoming" neu code cua branch kia dung
   - "Accept Both" neu can ca hai
   - Hoac sua thu cong
4. Luu file
5. Lap lai cho tat ca vung conflict trong file
6. Lap lai cho tat ca file co conflict
7. git add . && git commit
```

### 4.3. Source Control panel

```
1. Click bieu tuong Source Control (nhanh cay) tren sidebar
2. Trong muc "Merge Changes", thay danh sach file conflict
3. Click vao file -> mo diff view
4. Su dung toolbar trong diff view de accept/reject
5. Sau khi sua xong, click dau "+" de stage file
6. Nhap commit message va commit
```

---

## 5. `git mergetool` -- Cong cu resolve chuyen dung

### 5.1. Cau hinh mergetool

```bash
# Dung VS Code lam mergetool
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait --merge $REMOTE $LOCAL $BASE $MERGED'

# Dung vimdiff (co san tren Linux/Mac)
git config --global merge.tool vimdiff

# Khong tao file .orig (file backup)
git config --global mergetool.keepBackup false
```

### 5.2. Su dung mergetool

```bash
# Khi dang co conflict
git mergetool
# Git se mo tung file conflict trong tool da cau hinh

# Voi VS Code: mo 3-way merge editor
# Panel trai: LOCAL (code cua ban)
# Panel phai: REMOTE (code tu branch kia)
# Panel duoi: KET QUA (ban chinh sua o day)
# Panel tren: BASE (phien ban chung truoc khi ca hai sua)
```

### 5.3. 3-way merge editor trong VS Code

```
+------------------+------------------+
|   LOCAL (Ours)   |  REMOTE (Theirs) |
|  body {          |  body {          |
|    color: blue;  |    color: green; |
|  }               |  }               |
+------------------+------------------+
|            RESULT (Merged)           |
|  body {                              |
|    color: ???    <-- Ban chon o day  |
|  }                                   |
+--------------------------------------+
```

---

## 6. Conflict trong merge vs rebase

### 6.1. Conflict khi merge

```bash
git switch main
git merge feature/login
# CONFLICT in app.js

# Dac diem:
# - Giai quyet TAT CA conflict 1 lan
# - Sau khi sua: git add . && git commit
# - Tao merge commit
```

### 6.2. Conflict khi rebase

```bash
git switch feature/login
git rebase main
# CONFLICT in app.js  (commit 1/3)

# Dac diem:
# - Giai quyet conflict cho TUNG COMMIT
# - Sau khi sua: git add . && git rebase --continue
# - Khong tao merge commit
# - Co the phai giai quyet conflict NHIEU LAN
```

### 6.3. So sanh

| Dac diem | Merge conflict | Rebase conflict |
|----------|---------------|-----------------|
| So lan giai quyet | 1 lan | Co the nhieu lan (tung commit) |
| Sau khi resolve | `git commit` | `git rebase --continue` |
| Huy bo | `git merge --abort` | `git rebase --abort` |
| Merge commit | Co | Khong |
| Do phuc tap | Thuong don gian hon | Co the phuc tap hon (nhieu lan) |

### 6.4. Vi du so sanh

```bash
# Feature branch co 5 commits, main co thay doi

# Voi MERGE:
git merge feature/login
# 1 lan giai quyet conflict (gop tat ca thay doi)
git add .
git commit

# Voi REBASE:
git rebase main
# Conflict o commit 1 -> sua -> git add . -> git rebase --continue
# Conflict o commit 3 -> sua -> git add . -> git rebase --continue
# Commit 2, 4, 5 khong conflict -> tu dong apply
# Tong cong: giai quyet 2 lan
```

---

## 7. `--ours` vs `--theirs`

### 7.1. Khi dung voi merge

```bash
# Khi merge va gap conflict:
git merge feature/login

# Chon TOAN BO phien ban cua ban cho 1 file:
git checkout --ours app.js
git add app.js

# Chon TOAN BO phien ban cua branch kia cho 1 file:
git checkout --theirs style.css
git add style.css

# Ap dung cho TAT CA conflict files:
git merge -X ours feature/login     # Uu tien phien ban ban
git merge -X theirs feature/login   # Uu tien phien ban branch kia
```

### 7.2. Ours va Theirs tro den dau?

```
# Khi MERGE:
# ours   = branch hien tai (branch ban dang dung tren) = HEAD
# theirs = branch dang merge vao

git switch main
git merge feature/login
# ours   = main
# theirs = feature/login
```

```
# Khi REBASE (CHU Y: NGUOC LAI!):
# ours   = branch dang rebase LEN (main)
# theirs = branch cua ban (feature/login)

git switch feature/login
git rebase main
# ours   = main          <-- NGUOC voi merge!
# theirs = feature/login  <-- NGUOC voi merge!
```

**Day la dieu gay nham lan nhat!** Khi rebase, Git "dat ban sang mot ben" va ap dung tung commit cua ban len main. Nen "ours" la main (base moi), "theirs" la commit cua ban.

### 7.3. Bang tom tat

| Thao tac | `--ours` la | `--theirs` la |
|----------|------------|--------------|
| `git merge feature` (dang o main) | main | feature |
| `git rebase main` (dang o feature) | main | feature |
| `git cherry-pick abc` | branch hien tai | commit abc |

---

## 8. Vi du thuc te -- Tao conflict co y va giai quyet

### 8.1. Tao conflict

```bash
# Setup
mkdir conflict-lab && cd conflict-lab
git init

# Tao file ban dau
cat > app.js << 'EOF'
const app = {
  name: 'My App',
  version: '1.0',
  theme: 'default',
  language: 'vi',
};

function start() {
  console.log('Starting...');
}
EOF

git add app.js
git commit -m "Initial: tao app.js"

# Tao branch A va sua
git switch -c feature/dark-theme
cat > app.js << 'EOF'
const app = {
  name: 'My App',
  version: '1.1',
  theme: 'dark',
  language: 'vi',
  darkMode: true,
};

function start() {
  console.log('Starting in dark mode...');
}
EOF

git add app.js
git commit -m "Chuyen sang dark theme"

# Quay lai main va sua CUNG file
git switch main
cat > app.js << 'EOF'
const app = {
  name: 'My App Pro',
  version: '2.0',
  theme: 'light',
  language: 'en',
};

function start() {
  console.log('Starting My App Pro...');
}
EOF

git add app.js
git commit -m "Nang cap len Pro version"
```

### 8.2. Giai quyet conflict

```bash
# Merge
git merge feature/dark-theme
# Auto-merging app.js
# CONFLICT (content): Merge conflict in app.js

# Xem noi dung file
cat app.js
# const app = {
# <<<<<<< HEAD
#   name: 'My App Pro',
#   version: '2.0',
#   theme: 'light',
#   language: 'en',
# =======
#   name: 'My App',
#   version: '1.1',
#   theme: 'dark',
#   language: 'vi',
#   darkMode: true,
# >>>>>>> feature/dark-theme
# };
#
# function start() {
# <<<<<<< HEAD
#   console.log('Starting My App Pro...');
# =======
#   console.log('Starting in dark mode...');
# >>>>>>> feature/dark-theme
# }
```

```bash
# Giai quyet: ket hop ca hai phien ban
cat > app.js << 'EOF'
const app = {
  name: 'My App Pro',
  version: '2.0',
  theme: 'dark',
  language: 'vi',
  darkMode: true,
};

function start() {
  console.log('Starting My App Pro in dark mode...');
}
EOF

# Stage va commit
git add app.js
git commit -m "Merge feature/dark-theme: ket hop Pro + dark mode"

# Xac nhan
git log --oneline --graph
# *   abc1234 (HEAD -> main) Merge feature/dark-theme
# |\
# | * def5678 (feature/dark-theme) Chuyen sang dark theme
# * | ghi9012 Nang cap len Pro version
# |/
# * jkl3456 Initial: tao app.js
```

---

## 9. Tips phong tranh conflict

### 9.1. Pull thuong xuyen

```bash
# Moi sang khi bat dau lam viec:
git switch main
git pull origin main
git switch feature/my-feature
git merge main  # Hoac git rebase main

# Cang pull thuong xuyen -> conflict cang nho -> cang de giai quyet
```

### 9.2. Chia nho Pull Request

```
# XAU: 1 PR lon, sua 50 files, 2000 dong code
# => Rat nhieu conflict, kho review

# TOT: 5 PR nho, moi PR sua 10 files, 400 dong code
# => It conflict, de review, merge nhanh
```

### 9.3. Phan chia cong viec ro rang

```
# XAU: A va B cung lam tinh nang login
# => Conflict chac chan

# TOT: A lam frontend login, B lam backend API
# => It kha nang conflict (khac file)
```

### 9.4. Giao tiep trong team

```
# Truoc khi sua file quan trong (config, shared utils):
# 1. Thong bao tren Slack/Teams
# 2. Merge nhanh, khong de branch ton dong lau
# 3. Review va merge PR som
```

### 9.5. Su dung `.gitattributes`

```bash
# File: .gitattributes
# Chi dinh merge strategy cho cac file cu the

# Luon giu phien ban cua branch hien tai cho lock files
package-lock.json merge=ours
yarn.lock merge=ours

# Binary files: khong merge, chon manual
*.png binary
*.jpg binary
```

---

## 10. Conflict trong file binary

### 10.1. Van de

Git **khong the merge file binary** (hinh anh, PDF, file nen...). Khi conflict:

```bash
git merge feature/new-logo
# CONFLICT (content): Merge conflict in logo.png
# warning: Cannot merge binary files: logo.png

# File logo.png o trang thai hong -- khong mo duoc!
```

### 10.2. Cach giai quyet

```bash
# Chon phien ban cua ban:
git checkout --ours logo.png
git add logo.png

# Hoac chon phien ban cua branch kia:
git checkout --theirs logo.png
git add logo.png

# Commit
git commit -m "Resolve: chon logo moi tu feature/new-logo"
```

### 10.3. Phong tranh conflict binary

- Dung **Git LFS** (Large File Storage) cho file lon
- **Khong sua cung mot file binary** tren nhieu branch
- Dat ten khac nhau neu can nhieu phien ban: `logo-v1.png`, `logo-v2.png`
- Dung `.gitattributes` de chi dinh cach xu ly

```bash
# Cau hinh Git LFS
git lfs install
git lfs track "*.png"
git lfs track "*.psd"
git add .gitattributes
```

---

## 11. Loi thuong gap

### Loi 1: Commit ma van con conflict markers

```bash
# Ban commit nhung file van con <<<<<<< markers
git add .
git commit -m "resolve conflict"
# Code bi hong vi con markers trong file!

# Kiem tra truoc khi commit:
grep -rn "<<<<<<< " .
grep -rn "=======" .
grep -rn ">>>>>>> " .
# Neu con ket qua -> chua sua het!

# Sua va amend:
# Sua file...
git add .
git commit --amend
```

### Loi 2: Merge --abort khong hoat dong

```bash
git merge --abort
# error: Entry 'file.txt' would be overwritten by merge. Cannot merge.

# Nguyen nhan: ban co thay doi chua commit
# Cach xu ly:
git stash
git merge --abort
git stash pop
```

### Loi 3: Nham lan ours/theirs khi rebase

```bash
# Dang rebase feature len main
git rebase main

# Muon giu code cua FEATURE (code cua ban):
git checkout --theirs file.txt    # DUNG (theirs = feature khi rebase)
# KHONG PHAI:
git checkout --ours file.txt      # SAI (ours = main khi rebase)

# Nho: khi rebase, ours va theirs BI DAO NGUOC so voi merge!
```

### Loi 4: Quen giai quyet conflict o mot file

```bash
# Merge co conflict o 3 file, ban chi sua 2 file
git add app.js style.css
git commit
# error: Committing is not possible because you have unmerged paths.
# Hint: Fix them up in the work tree, and then use 'git add <file>'

# Xem file nao chua resolve:
git status
# Unmerged paths:
#         both modified:   config.js    <-- Chua sua!

# Sua config.js, roi:
git add config.js
git commit
```

### Loi 5: Merge tao ra code sai nhung khong co conflict

```bash
# Doi khi Git merge "thanh cong" nhung ket qua sai
# Vi du: A xoa function, B goi function do
# Git merge khong conflict (khac dong) nhung code bi loi runtime

# Cach phong tranh:
# 1. LUON chay tests sau khi merge
# 2. Review ket qua merge (git diff HEAD~1)
# 3. Build va test truoc khi push
```

---

## 12. Cau hoi phong van

### Cau 1: Conflict trong Git xay ra khi nao? Cho vi du cu the.

**Tra loi:** Conflict xay ra khi hai branch cung thay doi **cung dong** trong **cung file**. Vi du: developer A sua dong 10 cua `app.js` thanh `color: blue`, developer B cung sua dong 10 thanh `color: green`. Khi merge, Git khong biet chon phien ban nao nen danh dau conflict. Conflict KHONG xay ra khi: sua khac file, sua khac dong trong cung file, hoac chi mot phia sua.

### Cau 2: Mo ta quy trinh giai quyet merge conflict.

**Tra loi:** (1) Chay `git merge` va nhan thong bao conflict, (2) dung `git status` de xem file nao conflict, (3) mo tung file, tim conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`), (4) quyet dinh giu code nao (ours, theirs, hoac ket hop), (5) xoa tat ca conflict markers, (6) `git add` cac file da sua, (7) `git commit` de hoan tat merge. Truoc khi commit, nen kiem tra bang `grep "<<<<<<< "` de dam bao khong con markers.

### Cau 3: `--ours` va `--theirs` trong merge va rebase co gi khac nhau?

**Tra loi:** Trong **merge**: `--ours` = branch hien tai (dang dung tren), `--theirs` = branch dang merge vao. Trong **rebase**: bi **dao nguoc** -- `--ours` = branch base (main), `--theirs` = branch cua ban (feature). Ly do: khi rebase, Git tam thoi "bo ban sang mot ben" va ap dung commit cua ban len base, nen base tro thanh "ours". Day la diem gay nham lan nhat va thuong bi hoi trong phong van.

### Cau 4: Lam sao phong tranh conflict khi lam viec nhom?

**Tra loi:** (1) **Pull thuong xuyen** -- cap nhat main moi ngay va merge/rebase vao feature branch, (2) **Chia nho PR** -- PR nho it conflict hon va merge nhanh hon, (3) **Phan chia cong viec ro** -- tranh 2 nguoi cung sua 1 file, (4) **Giao tiep** -- thong bao khi sua file quan trong, (5) **Merge PR som** -- khong de branch ton dong qua lau, (6) dung `.gitattributes` cho file dac biet nhu lock files.

### Cau 5: Giai quyet conflict khi merge va khi rebase khac nhau the nao?

**Tra loi:** Khi **merge**, ban giai quyet **tat ca conflict 1 lan** roi commit (merge commit). Khi **rebase**, Git ap dung **tung commit mot**, nen ban co the phai giai quyet conflict **nhieu lan** (moi commit co the gay conflict rieng). Sau khi resolve conflict khi merge, dung `git commit`. Sau khi resolve conflict khi rebase, dung `git rebase --continue` (khong dung `git commit`). Ca hai deu co the huy bang `--abort`.

---

## Tom tat

| Lenh | Chuc nang |
|------|-----------|
| `git status` | Xem file nao dang conflict |
| `git diff --name-only --diff-filter=U` | Liet ke file conflict |
| `git checkout --ours <file>` | Chon phien ban cua branch hien tai |
| `git checkout --theirs <file>` | Chon phien ban cua branch kia |
| `git merge --abort` | Huy merge |
| `git rebase --abort` | Huy rebase |
| `git rebase --continue` | Tiep tuc rebase sau khi resolve |
| `git merge -X ours` | Merge, uu tien ours khi conflict |
| `git merge -X theirs` | Merge, uu tien theirs khi conflict |
| `git mergetool` | Mo cong cu resolve chuyen dung |

**Ghi nho:** Conflict la binh thuong -- khong phai loi. Giai quyet conflict la ky nang quan trong cua moi developer. Cang lam nhieu, ban cang tu tin va nhanh nhen khi gap conflict.
