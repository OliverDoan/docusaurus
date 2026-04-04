---
sidebar_position: 5
title: ".gitignore va quan ly file"
---

# .gitignore va quan ly file

Khong phai moi file trong du an deu nen duoc Git theo doi. File tam, mat khau, thu muc build, dependency... nen duoc **loai tru** khoi version control. Bai nay huong dan cach lam dieu do va quan ly file hieu qua trong Git.

---

## 1. .gitignore la gi?

`.gitignore` la file dac biet ma Git doc de biet **nhung file/thu muc nao can bo qua** — khong track, khong commit.

### Tai sao can .gitignore?

| Loai file | Ly do bo qua | Vi du |
|-----------|-------------|-------|
| **Dependencies** | Co the tai lai bang package manager | `node_modules/`, `venv/` |
| **Build output** | Duoc tao tu source code | `dist/`, `build/`, `*.class` |
| **File tam** | Khong co gia tri | `*.tmp`, `*.swp`, `.DS_Store` |
| **Secrets** | **NGUY HIEM** neu commit | `.env`, `credentials.json` |
| **IDE config** | Rieng tung nguoi | `.idea/`, `.vscode/settings.json` |
| **OS files** | He dieu hanh tao ra | `.DS_Store`, `Thumbs.db` |
| **Log files** | Du lieu runtime | `*.log`, `logs/` |

### Vi du thuc te

```bash
# KHONG CO .gitignore:
git status
# Hien thi 10,000+ file trong node_modules/  <-- Hon loan!

# CO .gitignore:
echo "node_modules/" >> .gitignore
git status
# Chi hien thi file CUA BAN  <-- Sach se!
```

---

## 2. Cu phap .gitignore

### Cac pattern co ban

```gitignore
# Day la comment — Git se bo qua dong nay

# Bo qua 1 file cu the
secret.key
config.local.json

# Bo qua toan bo thu muc (chu y dau / o cuoi)
node_modules/
dist/
build/
.cache/

# Bo qua tat ca file co duoi cu the
*.log
*.tmp
*.swp
*.class
*.pyc

# Bo qua file bat dau bang dau cham
.env
.DS_Store

# Bo qua tat ca file .env (bao gom .env.local, .env.production...)
.env*
```

### Ky tu dac biet (Wildcards)

| Pattern | Y nghia | Vi du |
|---------|---------|-------|
| `*` | Bat ky chuoi nao (khong chua `/`) | `*.log` = tat ca file .log |
| `**` | Bat ky chuoi nao (BAO GOM `/`) | `**/logs` = thu muc logs o bat ky dau |
| `?` | Bat ky 1 ky tu | `file?.txt` = file1.txt, fileA.txt |
| `[abc]` | Mot trong cac ky tu | `file[123].txt` = file1.txt, file2.txt |
| `[0-9]` | Pham vi ky tu | `file[0-9].txt` = file0.txt den file9.txt |
| `/` o dau | Chi o thu muc root | `/build` = chi thu muc build o root |
| `/` o cuoi | Chi ap dung cho thu muc | `logs/` = thu muc logs, khong phai file logs |
| `!` | Ngoai le — KHONG bo qua | `!important.log` = track file nay du co `*.log` |

### Vi du nang cao

```gitignore
# Bo qua tat ca file .log
*.log

# NHUNG giu lai error.log (dau ! la ngoai le)
!error.log

# Bo qua thu muc build o root, nhung khong bo qua src/build/
/build/

# Bo qua tat ca file .txt trong thu muc doc/ va cac thu muc con
doc/**/*.txt

# Bo qua tat ca thu muc ten "temp" o bat ky cap nao
**/temp/

# Bo qua tat ca file trong logs/ nhung giu thu muc logs/
logs/*
!logs/.gitkeep
```

### Thu tu uu tien

Khi co nhieu rule mau thuan, **rule cuoi cung thang**:

```gitignore
# Rule 1: Bo qua tat ca file .log
*.log

# Rule 2: Nhung giu error.log
!error.log

# Ket qua: tat ca .log bi bo qua TRU error.log
```

**CANH BAO:** Khong the "un-ignore" file trong thu muc da bi ignore:

```gitignore
# Khong hoat dong nhu mong doi!
build/
!build/important.js    # KHONG CO TAC DUNG vi build/ da bi ignore hoan toan

# Sua: Dung pattern cu the hon
build/*                 # Ignore noi dung trong build/
!build/important.js     # Giu file nay — BAY GIO HOAT DONG
```

---

## 3. Template .gitignore cho cac loai project

### Node.js / JavaScript / TypeScript

```gitignore
# Dependencies
node_modules/
package-lock.json    # Tuy du an — nhieu team MUON commit file nay

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

### Dau tim template?

GitHub cung cap template cho hau het ngon ngu tai: `github.com/github/gitignore`

```bash
# Khi tao repo tren GitHub, co the chon template san
# Hoac tai ve:
curl -o .gitignore https://raw.githubusercontent.com/github/gitignore/main/Node.gitignore
```

---

## 4. Global .gitignore

Nhung file **rieng cua ban** (IDE config, OS files) nen duoc ignore **toan cuc** thay vi them vao moi du an.

### Thiet lap

```bash
# Tao file global gitignore
touch ~/.gitignore_global

# Cau hinh Git su dung no
git config --global core.excludesFile ~/.gitignore_global
```

### Noi dung goi y cho ~/.gitignore_global

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

**Tai sao dung global thay vi local?**

| Cach | Khi nao dung |
|------|-------------|
| Global gitignore | File rieng cua BAN: IDE, OS (khong lien quan du an) |
| Local .gitignore (trong repo) | File rieng cua DU AN: node_modules, build, .env |

Khong nen them `.idea/` hay `.DS_Store` vao `.gitignore` cua du an — vi khong phai ai cung dung IntelliJ hay macOS. Moi nguoi tu cau hinh global cua minh.

---

## 5. .gitkeep — Track thu muc rong

Git **khong track thu muc rong**. Neu ban can giu mot thu muc trong repo (vi du: `uploads/`, `logs/`), tao file `.gitkeep` ben trong:

```bash
# Git se bo qua thu muc rong
mkdir uploads
git add uploads/
# -> Khong co gi de add!

# Giai phap: Them file .gitkeep
mkdir uploads
touch uploads/.gitkeep
git add uploads/.gitkeep
git commit -m "chore: tao thu muc uploads"
```

**Luu y:** `.gitkeep` khong phai tinh nang cua Git — no chi la **convention** (quy uoc) cua cong dong. Ban co the dat ten bat ky (`.keep`, `.placeholder`...) nhung `.gitkeep` la pho bien nhat.

### Ket hop voi .gitignore

Truong hop pho bien: Giu thu muc `logs/` nhung khong track noi dung:

```gitignore
# .gitignore
logs/*           # Ignore tat ca file trong logs/
!logs/.gitkeep   # Ngoai tru .gitkeep
```

---

## 6. git rm — Xoa file khoi Git

### Xoa file khoi ca Git va o cung

```bash
# Xoa file khoi Git tracking VA xoa file thuc tren o cung
git rm old-file.js
git commit -m "chore: xoa file khong con dung"

# Ket qua: file bi xoa khoi thu muc VA khoi Git tracking
```

### Xoa file khoi Git nhung GIU tren o cung

```bash
# Chi xoa khoi Git tracking, giu file tren may
git rm --cached secret.env
git commit -m "chore: xoa secret.env khoi Git tracking"

# File secret.env van con tren may nhung Git khong track nua
# Nho them vao .gitignore de khong vo tinh add lai:
echo "secret.env" >> .gitignore
git add .gitignore
git commit -m "chore: them secret.env vao gitignore"
```

**Khi nao dung `--cached`?**

| Tinh huong | Lenh |
|-----------|------|
| File khong can nua, xoa luon | `git rm file.txt` |
| File can giu tren may, chi xoa khoi Git | `git rm --cached file.txt` |
| Xoa ca thu muc | `git rm -r folder/` |
| Xoa thu muc khoi Git, giu tren may | `git rm -r --cached folder/` |

### Vi du thuc te: Xoa node_modules da commit nham

```bash
# Oi khong! Ai do da commit node_modules/
git rm -r --cached node_modules/
echo "node_modules/" >> .gitignore
git add .gitignore
git commit -m "fix: xoa node_modules va them vao gitignore"
```

---

## 7. git mv — Doi ten / Di chuyen file

### Cu phap

```bash
# Doi ten file
git mv old-name.js new-name.js

# Di chuyen file sang thu muc khac
git mv app.js src/app.js

# Di chuyen va doi ten cung luc
git mv utils.js src/helpers.js
```

### Tai sao dung `git mv` thay vi `mv`?

```bash
# Dung mv thong thuong:
mv old.js new.js
git status
# -> deleted: old.js     (Git nghi ban XOA file)
# -> untracked: new.js   (Git nghi day la file MOI)
# Ban phai:
git add new.js
git rm old.js

# Dung git mv:
git mv old.js new.js
git status
# -> renamed: old.js -> new.js   (Git hieu ban DOI TEN)
# Tu dong stage, chi can commit
```

`git mv` giup Git **nhan ra** day la doi ten/di chuyen, giu lai lich su cua file.

---

## 8. Xu ly file da commit nham

### Truong hop 1: File thuong (chua push)

```bash
# Xoa file khoi commit cuoi
git reset HEAD~1              # Undo commit
git reset HEAD secret.txt     # Unstage file
git rm --cached secret.txt    # Xoa khoi tracking
echo "secret.txt" >> .gitignore
git add .
git commit -m "fix: xoa file nhay cam va them gitignore"
```

### Truong hop 2: Secrets da push len remote (NGUY HIEM!)

**QUAN TRONG:** Neu ban commit file chua mat khau, API key, hoac bat ky secret nao va **da push**, ban phai:

1. **NGAY LAP TUC rotate (doi) tat ca secrets da lo**
2. Xoa file khoi lich su Git
3. Force push (sau khi thong bao team)

```bash
# Buoc 1: Doi mat khau/API key NGAY (quan trong nhat!)
# -> Vao dashboard cua dich vu va doi key

# Buoc 2: Xoa file khoi lich su bang git filter-branch
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch secrets.env' \
  --prune-empty --tag-name-filter cat -- --all

# Buoc 3: Force push (CANH BAO: thong bao team truoc!)
git push origin --force --all

# Buoc 4: Tat ca thanh vien team phai clone lai repo
```

### BFG Repo-Cleaner — De dung hon git filter-branch

```bash
# Cai dat BFG (can Java)
# Tai tu: https://rtyley.github.io/bfg-repo-cleaner/

# Xoa file cu the khoi toan bo lich su
java -jar bfg.jar --delete-files secrets.env

# Xoa file lon (vi du: > 100MB)
java -jar bfg.jar --strip-blobs-bigger-than 100M

# Thay the chuoi nhay cam trong tat ca file
java -jar bfg.jar --replace-text passwords.txt
# (passwords.txt chua danh sach cac chuoi can thay the)

# Sau khi BFG chay xong:
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

**Tai sao BFG tot hon git filter-branch?**

| Tieu chi | git filter-branch | BFG Repo-Cleaner |
|----------|-------------------|-----------------|
| Toc do | Cham (xu ly tung commit) | Nhanh hon 10-720x |
| Cu phap | Phuc tap | Don gian |
| An toan | Co the lam hong repo | An toan hon |
| Git docs | "Khong khuyen nghi dung" | Duoc khuyen nghi |

---

## 9. git clean — Don dep untracked files

### Cong dung

Xoa cac file va thu muc **untracked** (khong duoc Git theo doi). Huu ich khi muon "reset" thu muc lam viec ve trang thai sach.

### Cu phap

```bash
# Xem nhung gi se bi xoa (DRY RUN — khong xoa that)
git clean -n
# hoac
git clean --dry-run

# Xoa cac file untracked
git clean -f

# Xoa ca file va thu muc untracked
git clean -fd

# Xoa ca file bi ignore (can than!)
git clean -fX

# Xoa TAT CA: untracked + ignored (NGUY HIEM)
git clean -fdx

# Xoa theo tung file (hoi truoc khi xoa)
git clean -i
```

### Vi du thuc te

```bash
# Truoc khi clean — kiem tra truoc
git clean -n
# Would remove temp.txt
# Would remove debug.log
# Would remove test-output/

# Chac chan muon xoa? Clean that su
git clean -fd
# Removing temp.txt
# Removing debug.log
# Removing test-output/
```

**CANH BAO:** `git clean -f` **khong the undo**! File bi xoa se mat vinh vien (vi chung khong duoc Git track). Luon chay `git clean -n` truoc.

### Bang tong hop git clean flags

| Flag | Y nghia | Vi du |
|------|---------|-------|
| `-n` | Dry run (chi hien thi, khong xoa) | `git clean -n` |
| `-f` | Force — xoa that | `git clean -f` |
| `-d` | Bao gom thu muc | `git clean -fd` |
| `-x` | Bao gom file bi ignore | `git clean -fx` |
| `-X` | CHI xoa file bi ignore | `git clean -fX` |
| `-i` | Interactive (hoi tung file) | `git clean -i` |

---

## 10. Kiem tra .gitignore co hoat dong khong

### Xem file nao dang bi ignore

```bash
# Kiem tra 1 file cu the
git check-ignore -v secret.env
# .gitignore:3:secret.env    secret.env
# -> Dong 3 cua .gitignore dang ignore file nay

# Kiem tra neu file KHONG bi ignore (khong hien thi gi)
git check-ignore -v app.js
# (khong co output = file khong bi ignore)
```

### Xem tat ca file dang bi ignore

```bash
git status --ignored
```

### Van de: .gitignore khong co tac dung voi file da tracked

```bash
# Tinh huong: Ban them .env vao .gitignore NHUNG .env da duoc commit truoc do
echo ".env" >> .gitignore
git add .gitignore
git commit -m "them .env vao gitignore"

# .env VAN BI TRACKED! Vi gitignore chi anh huong file CHUA tracked

# Sua: Xoa file khoi tracking truoc
git rm --cached .env
git commit -m "xoa .env khoi tracking"
# Bay gio .gitignore moi co tac dung voi .env
```

**Quy tac:** `.gitignore` chi anh huong file **chua duoc track**. Neu file da commit, phai `git rm --cached` truoc.

---

## 11. Bang cu phap .gitignore patterns

| Pattern | Y nghia | Match | Khong match |
|---------|---------|-------|------------|
| `*.log` | Tat ca file .log | `error.log`, `debug.log` | `logs/` (thu muc) |
| `logs/` | Thu muc ten "logs" | `logs/`, `src/logs/` | `logs` (file) |
| `/logs` | Thu muc "logs" O ROOT | `logs/` (root) | `src/logs/` |
| `logs/*` | Noi dung trong logs | `logs/a.txt` | `logs/` (giu thu muc) |
| `**/logs` | "logs" o bat ky cap | `logs/`, `a/logs/`, `a/b/logs/` | — |
| `*.py[cod]` | .pyc, .pyo, .pyd | `file.pyc`, `file.pyo` | `file.py` |
| `!important.log` | Ngoai le | Giu `important.log` | — |
| `doc/**/*.pdf` | .pdf trong doc/ | `doc/a.pdf`, `doc/b/c.pdf` | `other/a.pdf` |
| `temp?` | temp + 1 ky tu | `temp1`, `tempA` | `temp`, `temp12` |
| `#` | Comment | (bi bo qua) | — |
| Dong trong | (bi bo qua) | — | — |

---

## 12. Loi thuong gap

### Loi 1: Them .gitignore sau khi da commit file

```bash
# Van de: Da commit node_modules/ roi moi them .gitignore
# Gitignore KHONG co tac dung voi file da tracked!

# Sua:
git rm -r --cached node_modules/    # Xoa khoi tracking
echo "node_modules/" >> .gitignore  # Them vao gitignore
git add .
git commit -m "fix: xoa node_modules va them gitignore"
```

### Loi 2: Commit file .env chua secrets

```bash
# NGUY HIEM! Da commit .env chua API key

# Neu CHUA push:
git reset HEAD~1                    # Undo commit
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "fix: xoa .env va them gitignore"

# Neu DA push: Doi NGAY tat ca credentials da lo!
# Roi dung BFG hoac filter-branch de xoa khoi lich su
```

### Loi 3: .gitignore khong hoat dong

```bash
# Kiem tra:
# 1. File .gitignore co o dung vi tri? (root cua repo)
ls -la .gitignore

# 2. Pattern co dung khong?
git check-ignore -v ten-file

# 3. File da duoc tracked tu truoc?
git ls-files ten-file   # Neu co output = file da tracked
git rm --cached ten-file  # Xoa khoi tracking

# 4. Co khoang trang thua trong .gitignore?
cat -A .gitignore   # Kiem tra ky tu an (^I = tab, $ = end of line)
```

### Loi 4: Xoa nham file bang git clean

```bash
# git clean -f la KHONG THE UNDO!
# File untracked bi xoa se MAT VINH VIEN

# Phong tranh: LUON chay dry-run truoc
git clean -n      # Xem truoc nhung gi se bi xoa
git clean -f      # Xoa that (sau khi chac chan)
```

### Loi 5: Khong phan biet `git rm` va `rm`

```bash
# rm thuong: Xoa file tren o cung, Git thay la "deleted"
rm old-file.js
git status
# -> deleted: old-file.js (chua stage)
# Phai: git add old-file.js (hoac git rm old-file.js)

# git rm: Xoa file VA tu dong stage thay doi
git rm old-file.js
git status
# -> deleted: old-file.js (DA stage, san sang commit)
```

---

## 13. Cau hoi phong van

### Cau 1: .gitignore la gi va tai sao quan trong?

**Tra loi mau:**

> `.gitignore` la file dac biet cho Git biet nhung file/thu muc nao khong nen track. Quan trong vi: (1) Giu repo sach — khong commit dependencies (node_modules), build output (dist), file tam, (2) Bao mat — tranh commit secrets (.env, credentials), (3) Giam kich thuoc repo — khong luu file co the tai lai. Moi du an nen co .gitignore tu dau.

### Cau 2: Lam sao de bo qua file da duoc Git track?

**Tra loi mau:**

> `.gitignore` chi anh huong file chua duoc track. Neu file da commit, phai xoa khoi tracking truoc bang `git rm --cached <file>`, sau do them vao `.gitignore` roi commit. Lenh `git rm --cached` chi xoa file khoi Git index, khong xoa file thuc tren o cung.

### Cau 3: Phan biet global gitignore va local gitignore.

**Tra loi mau:**

> Local `.gitignore` nam trong repo, duoc commit va chia se voi team — dung cho file lien quan den du an (node_modules, build, .env). Global gitignore (`~/.gitignore_global`) la cau hinh ca nhan, chi tren may cua ban — dung cho file lien quan den IDE (.idea, .vscode) va OS (.DS_Store, Thumbs.db). Global gitignore khong anh huong repo cua nguoi khac.

### Cau 4: Da commit nham file chua secret va push len remote. Phai lam gi?

**Tra loi mau:**

> Buoc 1 (NGAY LAP TUC): Rotate tat ca secrets da lo — doi mat khau, revoke API keys, tao tokens moi. Day la buoc quan trong nhat vi du ban xoa file khoi Git, nguoi khac co the da clone repo. Buoc 2: Dung BFG Repo-Cleaner hoac `git filter-branch` de xoa file khoi toan bo lich su Git. Buoc 3: Force push va yeu cau team clone lai. Buoc 4: Them file vao .gitignore de tranh lap lai.

### Cau 5: `git rm --cached` khac `git rm` nhu the nao?

**Tra loi mau:**

> `git rm <file>` xoa file khoi ca Git tracking VA xoa file thuc tren o cung. `git rm --cached <file>` chi xoa file khoi Git tracking (Staging Area), giu file nguyen tren o cung. Dung `--cached` khi ban muon ngung track file nhung van giu no tren may — vi du: xoa .env khoi Git nhung van can file de chay ung dung local.

---

## Tong ket

| Cong viec | Lenh / File |
|-----------|------------|
| Bo qua file | Them vao `.gitignore` |
| Bo qua file ca nhan (IDE, OS) | Them vao `~/.gitignore_global` |
| Giu thu muc rong | Them `.gitkeep` |
| Xoa file khoi Git + o cung | `git rm file` |
| Xoa file khoi Git, giu o cung | `git rm --cached file` |
| Doi ten / di chuyen file | `git mv old new` |
| Don dep file untracked | `git clean -fd` (can than!) |
| Xoa file khoi toan bo lich su | BFG Repo-Cleaner |
| Kiem tra .gitignore | `git check-ignore -v file` |

**Nho:** `.gitignore` chi anh huong file CHUA tracked. File da commit phai `git rm --cached` truoc.
