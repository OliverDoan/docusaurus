---
sidebar_position: 5
title: "Cherry-pick va Stash"
---

# Cherry-pick va Stash

Trong cong viec hang ngay voi Git, ban se gap hai tinh huong rat thuong xuyen: (1) can **tam cat thay doi dang lam do** de chuyen sang viec khac, va (2) can **lay mot commit cu the** tu branch khac ma khong merge toan bo. **Stash** va **Cherry-pick** la hai cong cu giup ban xu ly chinh xac hai tinh huong nay.

---

## Phan 1: Git Stash -- Tam cat thay doi

## 1. Stash la gi va tai sao can?

### 1.1. Tinh huong thuc te

Ban dang code tinh nang moi tren `feature/dashboard`, viet duoc nua chung thi sep bao: "Co bug khan cap tren production, sua ngay!". Ban can:

1. Chuyen sang branch `hotfix/urgent`
2. Sua bug
3. Quay lai `feature/dashboard` va tiep tuc

**Van de:** Ban chua muon commit code dang lam do (chua xong, chua test). Nhung Git khong cho chuyen branch khi co uncommitted changes (trong mot so truong hop).

**Giai phap:** `git stash` -- **tam cat (chua) thay doi** vao mot noi an toan, lam sach working directory, de ban chuyen branch tu do.

### 1.2. Stash hoat dong the nao?

```
# Truoc khi stash:
Working Directory: co thay doi (modified files)
Staging Area: co the co files da staged

# Sau khi stash:
Working Directory: SACH (nhu vua commit xong)
Staging Area: SACH
Stash stack: thay doi cua ban duoc luu o day

# Khi stash pop:
Working Directory: thay doi duoc khoi phuc
Stash stack: entry bi xoa
```

Stash hoat dong nhu mot **ngan xep (stack)** -- Last In, First Out (LIFO):

```
+-------------------+
| stash@{0}: moi nhat |  <-- pop lay cai nay truoc
+-------------------+
| stash@{1}: cu hon   |
+-------------------+
| stash@{2}: cu nhat  |
+-------------------+
```

---

## 2. Cac lenh stash co ban

### 2.1. `git stash` -- Tam cat thay doi

```bash
# Dang lam viec tren feature/dashboard
echo "new feature code" >> dashboard.js
echo "new styles" >> dashboard.css
git add dashboard.js  # Stage 1 file

# Tam cat tat ca thay doi (ca staged va unstaged)
git stash
# Saved working directory and index state WIP on feature/dashboard: abc1234 Last commit message

# Kiem tra: working directory sach
git status
# On branch feature/dashboard
# nothing to commit, working tree clean

# Bay gio co the chuyen branch tu do
git switch hotfix/urgent
```

### 2.2. `git stash list` -- Xem danh sach stash

```bash
git stash list
# stash@{0}: WIP on feature/dashboard: abc1234 Them dashboard layout
# stash@{1}: WIP on feature/login: def5678 Tao form login
# stash@{2}: WIP on main: ghi9012 Update README

# Moi entry co:
# stash@{n}  -- index (0 = moi nhat)
# WIP on <branch>  -- branch khi stash
# <hash> <message>  -- commit message gan nhat
```

### 2.3. `git stash pop` -- Lay lai va xoa khoi stash

```bash
# Lay lai thay doi moi nhat (stash@{0})
git stash pop
# On branch feature/dashboard
# Changes not staged for commit:
#         modified:   dashboard.js
#         modified:   dashboard.css
# Dropped refs/stash@{0} (abc1234...)

# stash@{0} da bi XOA khoi stash list
git stash list
# stash@{1} bay gio thanh stash@{0}
# (cac entry dich len 1 bac)
```

### 2.4. `git stash apply` -- Lay lai nhung GIU trong stash

```bash
# Lay lai thay doi nhung KHONG xoa khoi stash
git stash apply
# Thay doi duoc khoi phuc
# Nhung stash entry VAN CON trong list

git stash list
# stash@{0}: WIP on feature/dashboard: abc1234 ...
# Van con!

# Huu ich khi: muon apply cung stash vao nhieu branch
git stash apply           # Apply stash@{0}
git stash apply stash@{2} # Apply stash cu the
```

### 2.5. `git stash drop` va `git stash clear`

```bash
# Xoa 1 stash cu the
git stash drop stash@{1}
# Dropped stash@{1} (abc1234...)

# Xoa stash moi nhat
git stash drop
# Dropped refs/stash@{0} (def5678...)

# Xoa TAT CA stash (can than!)
git stash clear
# Xoa sach, khong lay lai duoc!
```

---

## 3. Stash nang cao

### 3.1. Stash co message -- `git stash push -m`

```bash
# Mac dinh: message la "WIP on <branch>: <commit>" -- khong mo ta
# Tot hon: them message mo ta
git stash push -m "Dashboard: dang lam bieu do doanh thu"
git stash push -m "Login: them remember me checkbox"

# Bay gio stash list ro rang hon:
git stash list
# stash@{0}: On feature/login: Login: them remember me checkbox
# stash@{1}: On feature/dashboard: Dashboard: dang lam bieu do doanh thu

# De tim va apply dung stash khi can
```

### 3.2. Stash specific files

```bash
# Chi stash 1 hoac vai file cu the
git stash push -m "Chi stash file CSS" style.css layout.css

# Cac file khac KHONG bi stash (van o working directory)

# Hoac dung pattern:
git stash push -m "Stash tat ca JS" -- "*.js"
```

### 3.3. Stash untracked files -- `--include-untracked`

```bash
# Mac dinh: git stash CHI cat file da tracked (da co trong Git)
# File moi tao (untracked) se KHONG duoc stash!

echo "new file" > brand-new.js
git stash
# brand-new.js VAN CON trong working directory!

# De stash ca untracked files:
git stash push --include-untracked -m "Ca file moi"
# Hoac viet tat:
git stash push -u -m "Ca file moi"

# Bay gio brand-new.js cung duoc stash
git status
# nothing to commit, working tree clean
```

### 3.4. Stash ca ignored files -- `--all`

```bash
# Stash tat ca, ke ca file trong .gitignore
git stash push --all -m "Tat ca ke ca node_modules"
# Hoac:
git stash push -a -m "Tat ca"

# Hiem khi can, nhung huu ich khi muon "reset" hoan toan
```

### 3.5. Xem noi dung stash

```bash
# Xem danh sach file trong stash
git stash show
# dashboard.js | 5 +++++
# dashboard.css | 3 +++
# 2 files changed, 8 insertions(+)

# Xem chi tiet diff
git stash show -p
# diff --git a/dashboard.js b/dashboard.js
# +new feature code
# ...

# Xem stash cu the
git stash show -p stash@{2}
```

### 3.6. Tao branch tu stash

```bash
# Khi stash co conflict khi pop (vi branch da thay doi nhieu)
# Giai phap: tao branch moi tu stash
git stash branch feature/recovered-work stash@{0}
# Tao branch moi tu commit khi stash
# Apply stash va xoa khoi list
# Khong bao gio co conflict vi quay ve dung trang thai cu
```

---

## 4. Stash workflow thuc te

### 4.1. Workflow "sua bug khan cap"

```bash
# Dang lam feature/dashboard
# Co file da sua nhung chua muon commit
git status
# modified: dashboard.js
# modified: chart.js
# new file: utils.js

# Buoc 1: Stash thay doi
git stash push -u -m "Dashboard: chart va utils dang lam"

# Buoc 2: Chuyen sang hotfix
git switch main
git pull origin main
git switch -c hotfix/payment-bug

# Buoc 3: Sua bug
# ... sua code ...
git add .
git commit -m "fix: sua loi thanh toan null pointer"
git push -u origin hotfix/payment-bug

# Buoc 4: Quay lai feature
git switch feature/dashboard

# Buoc 5: Lay lai thay doi
git stash pop
# Tiep tuc lam viec nhu chua co gi xay ra!
```

### 4.2. Workflow "thu y tuong nhanh"

```bash
# Dang lam feature/A, nay ra y tuong cho feature/B
# Khong muon tron lan code

# Stash cong viec hien tai
git stash push -u -m "Feature A: dang lam UI"

# Thu y tuong tren branch moi
git switch -c experiment/idea-B
# ... viet code thu ...
# Khong ok? Xoa branch
git switch feature/A
git branch -D experiment/idea-B

# Lay lai cong viec
git stash pop
```

---

## Phan 2: Git Cherry-pick -- Chon commit cu the

## 5. Cherry-pick la gi?

### 5.1. Dinh nghia

Cherry-pick cho phep ban **chon mot (hoac vai) commit cu the** tu branch khac va **ap dung vao branch hien tai**. Khong can merge toan bo branch -- chi lay nhung gi ban can.

```
# Branch develop co 5 commits:
develop: A---B---C---D---E

# Ban chi can commit C (sua bug quan trong)
# Cherry-pick C vao main:

main:    X---Y---Z---C'
                      ^
                      C' = ban sao cua C (hash moi, noi dung giong)

# develop khong bi anh huong
```

### 5.2. Tai sao goi la "cherry-pick"?

Tuong tuong mot cay cherry co nhieu qua. Ban khong hai ca cay (merge), ma chi **nhat (pick) nhung qua chin (cherry)** -- nhung commit cu the ma ban can.

### 5.3. ASCII diagram chi tiet

```
# Truoc cherry-pick:
main:    A---B---C
                  \
develop:           D---E---F---G---H

# Cherry-pick commit F vao main:
main:    A---B---C---F'
                  \
develop:           D---E---F---G---H
#                          ^
#                     Commit goc van o develop

# F' co noi dung giong F nhung HASH KHAC
# Vi F' co parent khac (C thay vi E)
```

---

## 6. Cherry-pick co ban

### 6.1. Cherry-pick mot commit

```bash
# Buoc 1: Tim commit hash can cherry-pick
git log --oneline develop
# ghi9012 (develop) Them feature H
# def5678 Sua bug F          <-- Can commit nay!
# abc1234 Them feature E
# ...

# Buoc 2: Chuyen sang branch dich
git switch main

# Buoc 3: Cherry-pick
git cherry-pick def5678
# [main abc1111] Sua bug F
#  1 file changed, 5 insertions(+)

# Commit moi tren main voi noi dung giong F
# Nhung hash khac (abc1111 thay vi def5678)
```

### 6.2. Cherry-pick nhieu commits

```bash
# Cherry-pick nhieu commit rieng le
git cherry-pick abc1234 def5678 ghi9012
# Ap dung 3 commit theo thu tu

# Cherry-pick mot RANGE (tu commit A den commit B)
git cherry-pick abc1234..ghi9012
# Ap dung tat ca commit SAU abc1234 den ghi9012
# CHU Y: KHONG bao gom abc1234!

# Bao gom ca commit dau:
git cherry-pick abc1234^..ghi9012
# ^ nghia la "cha cua abc1234" -> bao gom abc1234
```

### 6.3. `--no-commit` flag

```bash
# Mac dinh: cherry-pick tao commit moi ngay lap tuc
git cherry-pick def5678
# Commit moi duoc tao

# Voi --no-commit: chi ap dung thay doi, KHONG commit
git cherry-pick --no-commit def5678
# Thay doi duoc staged nhung CHUA commit
# Ban co the:
# - Chinh sua them truoc khi commit
# - Gop nhieu cherry-pick thanh 1 commit
# - Review thay doi truoc khi commit

git cherry-pick --no-commit abc1234
git cherry-pick --no-commit def5678
# Gop 2 cherry-pick thanh 1 commit
git commit -m "Backport: sua 2 bug tu develop"
```

### 6.4. Cherry-pick va conflict

```bash
git cherry-pick def5678
# CONFLICT: Merge conflict in app.js

# Giai quyet giong nhu merge conflict:
# 1. Mo file, sua conflict markers
# 2. git add app.js
# 3. git cherry-pick --continue

# Hoac huy:
git cherry-pick --abort

# Bo qua commit nay va tiep tuc:
git cherry-pick --skip
```

---

## 7. Khi nao dung cherry-pick?

### 7.1. Hotfix -- Sua bug khan cap

```bash
# Bug duoc phat hien va sua tren develop
# Can deploy fix ngay len production (main)

# Tren develop:
git switch develop
# ... sua bug ...
git commit -m "fix: sua loi crash khi user chua dang nhap"
# Commit hash: abc1234

# Cherry-pick vao main (production)
git switch main
git cherry-pick abc1234
git push origin main
# Deploy ngay!

# Khong can merge toan bo develop (co the co feature chua san sang)
```

### 7.2. Backport -- Sua bug cho phien ban cu

```bash
# Bug duoc sua tren main (phien ban 3.0)
# Can sua cho ca phien ban 2.x (branch release/2.x)

git switch release/2.x
git cherry-pick abc1234  # Commit sua bug tu main
# Bug duoc sua cho ca phien ban cu
```

### 7.3. Lay tinh nang cu the

```bash
# Team B co mot tien ich (utility) hay tren branch cua ho
# Ban muon lay chi tien ich do, khong phai toan bo branch

git log --oneline team-b/feature
# ... nhieu commit ...
# def5678 feat: them date formatter utility  <-- Chi can cai nay

git switch feature/my-feature
git cherry-pick def5678
```

---

## 8. Risks cua cherry-pick

### 8.1. Duplicate commits

```
# Sau khi cherry-pick F vao main:
main:    A---B---C---F'
                  \
develop:           D---E---F---G---H

# Khi merge develop vao main sau do:
main:    A---B---C---F'---M  (merge commit)
                  \      /
develop:           D---E---F---G---H

# F va F' co CUNG NOI DUNG nhung KHAC HASH
# Git thuong xu ly tot (khong conflict)
# Nhung lich su se co 2 commit giong nhau -- confusing
```

### 8.2. Mat context

```bash
# Commit F tren develop phu thuoc vao commit E (refactor truoc do)
# Cherry-pick chi F vao main -- khong co E
# => Code co the bi loi vi thieu context tu E

# Cach phong tranh:
# 1. Cherry-pick ca E va F
git cherry-pick E F

# 2. Hoac kiem tra ky commit co phu thuoc gi khong
git show def5678  # Xem noi dung commit truoc khi cherry-pick
```

### 8.3. Khi nao KHONG nen dung cherry-pick?

| Khong nen | Nen dung thay the |
|-----------|-------------------|
| Lay nhieu commit lien tiep tu branch khac | `git merge` hoac `git rebase` |
| "Sao chep" feature toan bo | `git merge feature-branch` |
| Thuong xuyen cherry-pick giua 2 branch | Xem lai branching strategy |
| Commit phu thuoc nhieu commit khac | Merge ca nhom commit |

---

## 9. So sanh Stash vs Branch cho viec tam luu

| Dac diem | `git stash` | Tao branch moi |
|----------|------------|----------------|
| Toc do | Nhanh (1 lenh) | Cham hon (3 lenh: switch, add, commit) |
| Pham vi | Tam thoi, ngan han | Dai han, co ten ro rang |
| Chia se | Khong (chi local) | Co (push len remote) |
| Lich su | Khong hien thi trong git log | Co commit, hien thi trong log |
| Tim lai | Kho (stash list khong truc quan) | De (git branch liet ke) |
| Khi nao dung | Chuyen viec nhanh (vai phut - vai gio) | Tam dung lau (vai ngay+) |

### Vi du so sanh

```bash
# Stash: chuyen viec nhanh
git stash push -u -m "Dang lam X"
git switch hotfix/urgent
# ... sua bug (30 phut) ...
git switch feature/X
git stash pop

# Branch: tam dung lau
git switch -c wip/feature-X-paused
git add .
git commit -m "WIP: tam dung feature X"
git switch hotfix/urgent
# ... sua bug ...
# Vai ngay sau:
git switch wip/feature-X-paused
# Tiep tuc lam
```

---

## 10. ASCII diagrams cho cherry-pick flow

### 10.1. Hotfix flow

```
# 1. Bug phat hien tren production (main)
main:     A---B---C              (production)
                   \
develop:            D---E---F    (development)

# 2. Sua bug tren develop
develop:            D---E---F---G  (G = bug fix)

# 3. Cherry-pick G vao main
main:     A---B---C---G'         (G' = cherry-pick cua G)
                   \
develop:            D---E---F---G

# 4. Deploy main (co fix)
# 5. Khi develop merge vao main sau do, Git xu ly G va G' tu dong
```

### 10.2. Backport flow

```
# Main da o phien ban 3.0, can fix cho 2.x
main (v3.0):      A---B---C---D---FIX---E---F
                                   ^
                                   |
release/2.x:  X---Y---Z---FIX'   (cherry-pick FIX)
```

### 10.3. Feature pick flow

```
# Team A can 1 utility tu team B
team-B/feature:    P---Q---R---S---T
                               ^
                               | cherry-pick
team-A/feature:    X---Y---S'---Z
```

---

## 11. Thuc hanh tong hop

### Bai tap 1: Stash workflow

```bash
mkdir stash-lab && cd stash-lab
git init

# Tao commit ban dau
echo "version 1" > app.js
git add app.js
git commit -m "Initial commit"

# Bat dau lam feature
git switch -c feature/new-ui
echo "new ui code" >> app.js
echo "styles" > style.css

# Dot nhien can chuyen viec!
git stash push -u -m "New UI: dang lam"

# Kiem tra
git status             # Clean
git stash list         # Thay stash

# Chuyen sang sua bug
git switch main
echo "bugfix" >> app.js
git add app.js
git commit -m "fix: sua bug"

# Quay lai feature
git switch feature/new-ui
git stash pop
git status             # Thay doi duoc khoi phuc!
```

### Bai tap 2: Cherry-pick workflow

```bash
mkdir cherry-lab && cd cherry-lab
git init

# Setup main
echo "main v1" > app.js
git add app.js
git commit -m "A: initial"

# Tao develop va them commits
git switch -c develop
echo "feature 1" > f1.js
git add f1.js
git commit -m "D: them feature 1"

echo "bugfix" >> app.js
git add app.js
git commit -m "E: sua bug trong app.js"

echo "feature 2" > f2.js
git add f2.js
git commit -m "F: them feature 2"

# Chi can commit E (bugfix) cho main
git log --oneline
# abc3 F: them feature 2
# abc2 E: sua bug trong app.js    <-- Can cai nay
# abc1 D: them feature 1
# abc0 A: initial

# Cherry-pick vao main
git switch main
git cherry-pick abc2  # Thay abc2 bang hash thuc te
# Chi commit bugfix duoc ap dung, feature 1 va 2 khong

git log --oneline
# def1 (HEAD -> main) E: sua bug trong app.js
# abc0 A: initial
```

### Bai tap 3: Cherry-pick voi --no-commit

```bash
# Tiep tuc tu bai tap 2
# Muon lay ca feature 1 va 2 nhung gop thanh 1 commit

git cherry-pick --no-commit abc1  # Feature 1
git cherry-pick --no-commit abc3  # Feature 2

git status
# Thay doi tu ca 2 commit duoc staged

git commit -m "feat: backport feature 1 va 2 tu develop"
# Chi 1 commit gon gang
```

---

## 12. Loi thuong gap

### Loi 1: Stash pop bi conflict

```bash
# Stash luc truoc, nhung branch da thay doi nhieu
git stash pop
# CONFLICT: Merge conflict in app.js

# Cach 1: Giai quyet conflict
# Mo file, sua conflict markers
git add app.js
# CHU Y: stash KHONG bi xoa khi pop co conflict!
# Phai drop thu cong sau khi giai quyet:
git stash drop

# Cach 2: Tao branch moi tu stash (khong bao gio conflict)
git stash branch feature/recovered stash@{0}
```

### Loi 2: Stash nhung khong thay file moi

```bash
# Tao file moi
echo "new" > new-file.js
git stash
# new-file.js VAN CON! (untracked)

# Dung -u de stash ca untracked files
git stash push -u -m "Ca file moi"
```

### Loi 3: Cherry-pick nham commit

```bash
# Cherry-pick nham
git cherry-pick wrong-hash
# Oh no!

# Huy commit vua tao (chua push):
git reset --hard HEAD~1
# Quay lai trang thai truoc cherry-pick
```

### Loi 4: Cherry-pick ma quen dependency

```bash
# Commit B phu thuoc commit A (B dung function tao o A)
# Chi cherry-pick B:
git cherry-pick B
# Code bi loi vi thieu function tu A!

# Cach dung:
git cherry-pick A B  # Cherry-pick ca hai, theo thu tu
```

### Loi 5: Quen stash va lam mat

```bash
# Stash roi quen mat
# Sau 1 thoi gian, stash van con (khong tu dong het han)
git stash list
# Nhung neu ban lam git stash clear hoac drop...

# Phong tranh:
# 1. Luon dung message: git stash push -m "mo ta"
# 2. Kiem tra stash list dinh ky
# 3. Neu tam dung lau -> dung branch thay vi stash
```

---

## 13. Cau hoi phong van

### Cau 1: Git stash la gi? Khi nao ban su dung no?

**Tra loi:** `git stash` tam cat (luu tru) cac thay doi chua commit (ca staged va unstaged) vao mot ngan xep (stack), lam sach working directory. Dung khi: (1) can chuyen branch nhung chua muon commit (code chua xong), (2) can pull tu remote nhung co local changes, (3) muon thu nghiem tren clean state. `git stash pop` lay lai thay doi va xoa khoi stack. `git stash apply` lay lai nhung giu trong stack. Mac dinh, stash khong bao gom untracked files -- dung `-u` de bao gom.

### Cau 2: Phan biet `git stash pop` va `git stash apply`.

**Tra loi:** Ca hai deu khoi phuc thay doi tu stash. Khac biet: `pop` = apply + drop (lay ra va xoa khoi stack), `apply` = chi lay ra (khong xoa, stash van con trong stack). Dung `apply` khi: muon apply cung stash vao nhieu branch, hoac muon giu stash lam backup. Luu y: neu `pop` gap conflict, stash se **khong bi xoa** -- ban phai giai quyet conflict roi tu `git stash drop`.

### Cau 3: Cherry-pick la gi? Cho vi du tinh huong thuc te.

**Tra loi:** Cherry-pick ap dung mot commit cu the tu branch nay sang branch khac, tao commit moi voi cung noi dung nhung hash khac. Tinh huong thuc te: team phat hien bug tren production, bug da duoc sua tren branch develop (commit abc123). Thay vi merge toan bo develop (co the co feature chua san sang), dung `git cherry-pick abc123` tren main de chi lay commit sua bug. Deploy ngay ma khong anh huong cac feature dang phat trien.

### Cau 4: Cherry-pick co nhung rui ro gi?

**Tra loi:** (1) **Duplicate commits**: commit goc va cherry-pick co cung noi dung nhung hash khac, gay nham lan khi doc lich su va co the conflict khi merge sau do. (2) **Mat context**: commit co the phu thuoc commit khac (vi du: dung function duoc tao o commit truoc) -- cherry-pick chi 1 commit se thieu dependency. (3) **Conflict**: commit duoc tao tren context khac nen de gay conflict khi ap dung. Cach giam rui ro: chi cherry-pick khi that su can thiet, uu tien merge/rebase, va luon test sau khi cherry-pick.

### Cau 5: So sanh stash va tao branch moi de tam luu code. Khi nao dung cai nao?

**Tra loi:** **Stash** phu hop cho tam dung ngan (vai phut den vai gio): nhanh (1 lenh), chi o local, khong tao commit. **Branch** phu hop cho tam dung dai (vai ngay+): co ten ro rang, co the push len remote chia se, co commit trong lich su de tim lai. Quy tac: neu ban quay lai trong cung ngay -> stash. Neu khong chac bao gio quay lai, hoac can chia se voi nguoi khac -> branch. Khong nen de stash qua nhieu (> 5 entries) vi kho quan ly.

---

## Tom tat

### Stash

| Lenh | Chuc nang |
|------|-----------|
| `git stash` | Tam cat thay doi (chi tracked files) |
| `git stash push -u -m "msg"` | Stash voi message, ca untracked files |
| `git stash push file1 file2` | Stash chi dinh files |
| `git stash list` | Xem danh sach stash |
| `git stash show -p` | Xem noi dung stash (diff) |
| `git stash pop` | Lay lai va xoa khoi stack |
| `git stash apply` | Lay lai nhung giu trong stack |
| `git stash drop stash@{n}` | Xoa 1 stash cu the |
| `git stash clear` | Xoa tat ca stash |
| `git stash branch <name>` | Tao branch tu stash |

### Cherry-pick

| Lenh | Chuc nang |
|------|-----------|
| `git cherry-pick <hash>` | Ap dung 1 commit |
| `git cherry-pick A B C` | Ap dung nhieu commit |
| `git cherry-pick A..B` | Ap dung range (khong gom A) |
| `git cherry-pick A^..B` | Ap dung range (gom ca A) |
| `git cherry-pick --no-commit <hash>` | Ap dung nhung khong commit |
| `git cherry-pick --continue` | Tiep tuc sau khi resolve conflict |
| `git cherry-pick --abort` | Huy cherry-pick |
| `git cherry-pick --skip` | Bo qua commit hien tai |

**Ghi nho:** Stash de "tam cat", cherry-pick de "nhat chon". Ca hai la cong cu khong the thieu trong workflow hang ngay cua developer.
