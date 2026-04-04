---
sidebar_position: 1
title: "Branch la gi? Tao va quan ly nhanh"
---

# Branch la gi? Tao va quan ly nhanh

Khi lam viec voi Git, ban se nhanh chong nhan ra rang lam tat ca moi thu tren mot dong thoi gian duy nhat la mot y tuong toi te. Tuong tuong ban dang viet tinh nang moi, dong nghiep dang sua bug, nguoi khac dang thi nghiem -- tat ca tren cung mot noi. Hon don la dieu chac chan. **Branch** (nhanh) chinh la giai phap cho van de nay.

---

## 1. Branch la gi?

### 1.1. Metaphor cay -- Than chinh va nhanh cay

Hay tuong tuong du an cua ban nhu mot **cai cay**:

- **Than chinh (trunk)** = nhanh `main` -- day la phien ban on dinh, chinh thuc
- **Nhanh cay (branch)** = cac nhanh lam viec -- moi nhanh la mot huong phat trien doc lap

```
        feature/login
       /
main ----*----*----*----*
       \
        bugfix/header
```

Moi nhanh cay co the **phat trien doc lap** ma khong anh huong den than chinh. Khi nhanh da "chin" (hoan thanh), ban **ghep no lai** vao than chinh.

### 1.2. Dinh nghia ky thuat -- Branch la mot pointer

Trong Git, branch **khong phai la mot ban sao cua toan bo du an**. No chi la mot **con tro (pointer)** tro den mot commit cu the.

```
                    main (pointer)
                      |
                      v
commit-A --> commit-B --> commit-C
                            ^
                            |
                       feature/login (pointer)
```

- Moi branch chi la mot file nho (41 bytes) chua hash cua commit ma no tro den
- Tao branch moi **cuc nhanh** vi Git chi can tao them mot pointer
- Khong sao chep file, khong ton dung luong

**Dieu nay khac voi SVN** -- noi tao branch nghia la sao chep toan bo thu muc du an. Git thong minh hon nhieu.

### 1.3. HEAD -- Ban dang o dau?

`HEAD` la mot pointer dac biet, tro den **branch hien tai** ma ban dang lam viec:

```
HEAD --> main --> commit-C

# Khi chuyen sang feature/login:
HEAD --> feature/login --> commit-C
```

Khi ban commit, branch ma HEAD dang tro den se **di chuyen len phia truoc** (tro den commit moi). Cac branch khac giu nguyen.

---

## 2. Tai sao can branch?

### 2.1. Parallel development -- Lam viec song song

Khong co branch:
```
Developer A: dang sua file login.js
Developer B: cung sua file login.js
=> CONFLICT lien tuc, mat thoi gian giai quyet
```

Co branch:
```
Developer A: lam tren feature/login
Developer B: lam tren feature/dashboard
=> Moi nguoi mot nhanh, khong can nhau
```

### 2.2. Isolation -- Co lap thay doi

Branch tao ra mot **khong gian lam viec rieng**. Neu ban lam hong gi do tren branch cua minh, **main van an toan**. Ban co the:

- Xoa branch do va bat dau lai
- Sua xong roi moi merge vao main
- De dong nghiep review truoc khi merge

### 2.3. Experimentation -- Thi nghiem tu do

Muon thu mot y tuong moi? Tao branch, thi nghiem thoai mai:

```bash
# Tao nhanh thi nghiem
git switch -c experiment/new-algorithm

# Lam gi thi lam...
# Neu thanh cong -> merge vao main
# Neu that bai -> xoa branch, khong ai biet :)
git branch -d experiment/new-algorithm
```

---

## 3. Cac lenh co ban ve branch

### 3.1. Liet ke branches

```bash
# Xem tat ca branch local
git branch
# Ket qua:
#   feature/login
# * main              <-- dau * chi branch hien tai
#   bugfix/header

# Xem branch local kem commit cuoi
git branch -v
# Ket qua:
#   feature/login  a1b2c3d Them form dang nhap
# * main           e4f5g6h Update README
#   bugfix/header  i7j8k9l Sua header responsive

# Xem TAT CA branch (ca local va remote)
git branch -a
# Ket qua:
#   feature/login
# * main
#   bugfix/header
#   remotes/origin/main
#   remotes/origin/feature/login
#   remotes/origin/develop

# Xem chi branch da merge vao branch hien tai
git branch --merged

# Xem branch CHUA merge (can than khi xoa)
git branch --no-merged
```

### 3.2. Tao branch moi

```bash
# Tao branch moi (nhung KHONG chuyen sang)
git branch feature/login
# Ban van dang o branch cu

# Tao branch moi TU mot commit cu the
git branch hotfix/urgent abc1234
# Tao branch tu commit co hash abc1234

# Tao branch moi tu mot branch khac
git branch feature/v2 develop
# Tao feature/v2 tu vi tri cua develop
```

### 3.3. Xoa branch

```bash
# Xoa branch da merge (an toan)
git branch -d feature/login
# Git se kiem tra: branch nay da merge chua?
# Neu chua merge -> Git tu choi xoa, bao ve ban

# Xoa branch CHUA merge (ep buoc -- can than!)
git branch -D feature/login
# -D = --delete --force
# Mat het commit tren branch nay (tru khi co reflog)

# Xoa branch tren remote
git push origin --delete feature/login
# Hoac cu phap ngan:
git push origin :feature/login
```

**Luu y quan trong:** Khong the xoa branch ma ban dang dung tren do. Phai chuyen sang branch khac truoc.

```bash
# KHONG DUOC: dang o main ma xoa main
git branch -d main
# error: Cannot delete branch 'main' checked out

# DUNG: chuyen sang branch khac truoc
git switch develop
git branch -d feature/old
```

---

## 4. Chuyen doi giua cac branch

### 4.1. `git switch` (hien dai -- tu Git 2.23+)

```bash
# Chuyen sang branch da ton tai
git switch feature/login

# Tao branch moi VA chuyen sang luon
git switch -c feature/dashboard
# -c = --create

# Tao branch moi tu mot diem cu the
git switch -c hotfix/urgent main
# Tao hotfix/urgent tu main va chuyen sang

# Quay lai branch truoc do (nhu cd -)
git switch -
# Rat tien loi khi chuyen qua lai giua 2 branch
```

### 4.2. `git checkout` (cu -- van hoat dong)

```bash
# Chuyen branch
git checkout feature/login

# Tao va chuyen
git checkout -b feature/dashboard
```

### 4.3. Tai sao `git switch` tot hon `git checkout`?

`git checkout` la lenh "da nang" qua muc -- no lam qua nhieu viec:

| Hanh dong | `git checkout` | Lenh hien dai |
|-----------|---------------|---------------|
| Chuyen branch | `git checkout feature` | `git switch feature` |
| Tao + chuyen branch | `git checkout -b feature` | `git switch -c feature` |
| Khoi phuc file | `git checkout -- file.txt` | `git restore file.txt` |
| Khoi phuc tu commit | `git checkout abc123 -- file.txt` | `git restore --source abc123 file.txt` |

Van de cua `git checkout`:

```bash
# Chuyen sang branch ten "main"? Hay khoi phuc file ten "main"?
git checkout main
# Git phai doan y ban -- de gay nham lan!

# Voi git switch/restore -- ro rang hon:
git switch main          # Chuyen branch
git restore main         # Khoi phuc file ten "main"
```

**Khuyen nghi:** Luon dung `git switch` va `git restore`. Chi dung `git checkout` khi lam viec voi Git phien ban cu (truoc 2.23).

---

## 5. Naming conventions -- Quy tac dat ten branch

### 5.1. Cac prefix pho bien

| Prefix | Muc dich | Vi du |
|--------|----------|-------|
| `feature/` | Tinh nang moi | `feature/user-authentication` |
| `bugfix/` | Sua loi (khong khan cap) | `bugfix/login-redirect` |
| `hotfix/` | Sua loi khan cap tren production | `hotfix/payment-crash` |
| `release/` | Chuan bi release phien ban moi | `release/v2.1.0` |
| `docs/` | Cap nhat tai lieu | `docs/api-guide` |
| `refactor/` | Tai cau truc code | `refactor/auth-module` |
| `test/` | Them hoac sua test | `test/integration-api` |
| `chore/` | Cong viec bao tri | `chore/update-dependencies` |

### 5.2. Quy tac dat ten tot

```bash
# TOT -- mo ta ro rang, co prefix
feature/user-authentication
bugfix/fix-login-redirect-loop
hotfix/payment-null-pointer

# XAU -- khong ro rang
my-branch
fix
test123
thuans-branch
```

**Nguyen tac:**
- Dung chu thuong va dau gach noi `-` (khong dung dau cach, underscore)
- Bat dau bang prefix phan loai
- Mo ta ngan gon nhung du hieu
- Co the them ticket ID: `feature/JIRA-123-user-auth`

---

## 6. Branch tracking -- Local vs Remote

### 6.1. Local branch vs Remote branch

```
Local (may ban)              Remote (GitHub/GitLab)
-----------------            ---------------------
main                    -->  origin/main
feature/login           -->  origin/feature/login
bugfix/header           -->  (chua push len)
                              origin/develop (chua pull ve)
```

- **Local branch:** Chi ton tai tren may ban
- **Remote-tracking branch:** Ban sao cua branch tren remote, luu o local voi ten `origin/<branch>`
- **Tracking relationship:** Lien ket giua local va remote branch

### 6.2. Thiet lap tracking

```bash
# Push branch moi len remote va thiet lap tracking
git push -u origin feature/login
# -u = --set-upstream
# Lan sau chi can: git push (khong can chi dinh remote va branch)

# Xem tracking information
git branch -vv
# Ket qua:
#   feature/login  a1b2c3d [origin/feature/login] Them form login
# * main           e4f5g6h [origin/main] Update README
#   bugfix/header  i7j8k9l Sua header  <-- khong co tracking

# Thiet lap tracking cho branch da ton tai
git branch --set-upstream-to=origin/feature/login feature/login
# Hoac ngan hon:
git branch -u origin/feature/login
```

### 6.3. Fetch vs Pull

```bash
# Fetch: tai ve thong tin tu remote (KHONG merge)
git fetch origin
# Cap nhat tat ca remote-tracking branches
# Ban co the xem thay doi truoc khi merge

# Pull: fetch + merge (hoac rebase)
git pull origin main
# Tuong duong:
# git fetch origin
# git merge origin/main
```

---

## 7. ASCII diagram -- Branch diverge va merge

```
# Ban dau: chi co main
main: A---B---C

# Tao feature/login tu commit C
main:          A---B---C
                        \
feature/login:           (dang o C)

# Lam viec tren ca 2 branch
main:          A---B---C---D---E
                        \
feature/login:           F---G---H

# Merge feature/login vao main
main:          A---B---C---D---E---M  (merge commit)
                        \         /
feature/login:           F---G---H

# Sau khi merge, co the xoa feature/login
main:          A---B---C---D---E---M
```

Xem truc quan bang lenh:
```bash
git log --oneline --graph --all
# Ket qua:
# *   M (HEAD -> main) Merge branch 'feature/login'
# |\
# | * H (feature/login) Hoan thien login
# | * G Them validation
# | * F Tao form login
# * | E Update homepage
# * | D Them footer
# |/
# * C Initial commit
# * B Them README
# * A First commit
```

---

## 8. Quan ly branches -- Khi nao tao, khi nao xoa

### 8.1. Khi nao tao branch moi?

- **Bat dau tinh nang moi** -- luon tao branch rieng
- **Sua bug** -- tao branch tu main hoac release
- **Thi nghiem** -- tao branch de thu y tuong
- **Review code** -- moi PR tuong ung voi mot branch

**Nguyen tac vang:** Moi don vi cong viec (feature, bugfix, task) = 1 branch.

### 8.2. Khi nao xoa branch?

```bash
# Sau khi da merge thanh cong
git branch -d feature/login

# Kiem tra cac branch da merge (an toan de xoa)
git branch --merged main
# Liet ke cac branch da merge vao main

# Doc dep branch remote da merge
git fetch --prune
# Xoa cac remote-tracking branch ma remote da xoa
```

### 8.3. Don dep branch dinh ky

```bash
# Xem cac branch cu (khong hoat dong > 3 thang)
git for-each-ref --sort=-committerdate --format='%(committerdate:short) %(refname:short)' refs/heads/

# Xoa tat ca branch da merge (tru main va develop)
git branch --merged main | grep -v "main\|develop" | xargs git branch -d
```

---

## 9. Thuc hanh -- Bai tap tu lam

### Bai tap 1: Tao va quan ly branch

```bash
# 1. Tao thu muc du an moi
mkdir git-branch-practice && cd git-branch-practice
git init

# 2. Tao commit dau tien tren main
echo "# My Project" > README.md
git add README.md
git commit -m "Initial commit"

# 3. Tao branch feature/header
git switch -c feature/header

# 4. Lam viec tren feature/header
echo "<header>My Header</header>" > header.html
git add header.html
git commit -m "Them header"

# 5. Quay lai main
git switch main

# 6. Tao branch feature/footer
git switch -c feature/footer
echo "<footer>My Footer</footer>" > footer.html
git add footer.html
git commit -m "Them footer"

# 7. Xem tat ca branches
git branch -v

# 8. Xem graph
git log --oneline --graph --all
```

### Bai tap 2: Xoa branch

```bash
# Merge feature/header vao main truoc
git switch main
git merge feature/header

# Xoa branch da merge
git branch -d feature/header
# Thanh cong!

# Thu xoa branch chua merge
git branch -d feature/footer
# error: The branch 'feature/footer' is not fully merged
# Git bao ve ban! Dung -D neu chac chan muon xoa
```

---

## 10. Loi thuong gap

### Loi 1: Quen commit truoc khi chuyen branch

```bash
# Dang edit file tren feature/login
# Chuyen sang main ma chua commit
git switch main
# Cac thay doi CHUA COMMIT se di theo ban sang main!
# => Dung git stash hoac commit truoc khi chuyen

# Cach xu ly:
git stash                    # Cat tam thay doi
git switch main              # Chuyen branch
# ... lam viec ...
git switch feature/login     # Quay lai
git stash pop                # Lay lai thay doi
```

### Loi 2: Xoa nham branch chua merge

```bash
# Xoa nham bang -D
git branch -D feature/important
# OH NO!

# Cuu bang reflog (trong vong 30 ngay)
git reflog
# Tim hash commit cuoi cua branch da xoa
# abc1234 HEAD@{5}: commit: Tinh nang quan trong

git switch -c feature/important abc1234
# Phuc hoi thanh cong!
```

### Loi 3: Tao branch tu sai vi tri

```bash
# Muon tao branch tu main nhung dang o feature/old
git switch -c feature/new
# Branch moi se bat dau tu feature/old, khong phai main!

# Cach dung:
git switch -c feature/new main
# Chi dinh ro: tao tu main
```

### Loi 4: Ten branch co dau cach hoac ky tu dac biet

```bash
# SAI:
git switch -c "feature/my feature"    # Dau cach
git switch -c feature/login@v2        # Ky tu @

# DUNG:
git switch -c feature/my-feature      # Dau gach noi
git switch -c feature/login-v2        # Dau gach noi
```

---

## 11. Cau hoi phong van

### Cau 1: Branch trong Git hoat dong nhu the nao? Tai sao tao branch trong Git nhanh hon SVN?

**Tra loi:** Trong Git, branch chi la mot **pointer (con tro) nhe** tro den mot commit cu the. Tao branch chi can tao mot file 41 bytes chua commit hash -- thao tac O(1). Trong SVN, tao branch nghia la **sao chep toan bo thu muc** du an -- thao tac O(n) voi n la kich thuoc du an. Day la ly do Git khuyen khich su dung branch nhieu, trong khi SVN coi branch la thao tac "nang".

### Cau 2: HEAD la gi? Detached HEAD la gi va khi nao xay ra?

**Tra loi:** `HEAD` la pointer tro den branch hien tai. Binh thuong: `HEAD -> main -> commit-C`. **Detached HEAD** xay ra khi HEAD tro truc tiep vao mot commit thay vi mot branch (vi du: `git checkout abc1234`). Trong trang thai nay, cac commit moi se khong thuoc branch nao va co the bi mat khi chuyen branch. Cach xu ly: tao branch moi tu vi tri do bang `git switch -c branch-name`.

### Cau 3: Su khac nhau giua `git switch` va `git checkout` la gi?

**Tra loi:** `git checkout` la lenh cu, lam nhieu viec cung luc: chuyen branch, khoi phuc file, tao branch. Tu Git 2.23, lenh nay duoc tach thanh hai lenh rieng biet: `git switch` (chuyen/tao branch) va `git restore` (khoi phuc file). `git switch` an toan hon vi no **chi lam mot viec** -- chuyen branch, tranh nham lan giua chuyen branch va khoi phuc file.

### Cau 4: Lam the nao de biet branch nao da merge va co the xoa an toan?

**Tra loi:** Dung `git branch --merged main` de liet ke cac branch da merge vao main. Nhung branch nay co the xoa an toan bang `git branch -d`. Dung `git branch --no-merged main` de xem cac branch chua merge -- can than khi xoa nhung branch nay. Trong teamwork, thuong don dep branch sau khi PR da merge tren GitHub/GitLab.

### Cau 5: Giai thich su khac nhau giua local branch, remote branch va remote-tracking branch.

**Tra loi:**
- **Local branch** (`main`): ton tai tren may ban, ban co the commit truc tiep
- **Remote branch** (`origin/main` tren server): ton tai tren server (GitHub/GitLab)
- **Remote-tracking branch** (`origin/main` tren may ban): ban sao local cua remote branch, duoc cap nhat khi `git fetch`. Day la "anh chup" trang thai cua remote, giup ban so sanh local voi remote ma khong can ket noi mang

Lenh `git fetch` cap nhat remote-tracking branches. Lenh `git pull` = `git fetch` + `git merge`.

---

## Tom tat

| Lenh | Chuc nang |
|------|-----------|
| `git branch` | Liet ke branches |
| `git branch <ten>` | Tao branch moi |
| `git branch -d <ten>` | Xoa branch da merge |
| `git branch -D <ten>` | Xoa branch (ep buoc) |
| `git branch -a` | Xem tat ca branches (ca remote) |
| `git branch -vv` | Xem tracking info |
| `git switch <ten>` | Chuyen branch |
| `git switch -c <ten>` | Tao va chuyen branch |
| `git switch -` | Quay lai branch truoc do |
| `git push -u origin <ten>` | Push va thiet lap tracking |

**Ghi nho:** Branch trong Git re va nhanh. Hay tao branch cho moi don vi cong viec -- dung ngai tao nhieu branch!
