---
sidebar_position: 3
title: "Rebase — Viet lai lich su commit"
---

# Rebase — Viet lai lich su commit

Neu merge la cach "an toan va trung thuc" de gop nhanh, thi rebase la cach "sach se va tinh te". Rebase viet lai lich su commit de tao ra mot **dong thoi gian thang tap**, nhu the ban lam moi thu theo trinh tu hoan hao. Day la cong cu manh me nhung cung la **con dao hai luoi** -- dung dung thi tuyet voi, dung sai thi tham hoa.

---

## 1. Rebase la gi?

### 1.1. Dinh nghia don gian

Rebase = **di chuyen base (goc) cua branch** den mot vi tri moi. Thay vi gop 2 dong lich su lai (nhu merge), rebase **dat lai cac commit cua ban len dau** branch dich.

### 1.2. ASCII diagram -- Truoc va sau rebase

```
# TRUOC REBASE:
# feature/login duoc tao tu commit C cua main
# Sau do, main co them commit D, E

main:          A---B---C---D---E
                        \
feature/login:           F---G---H

# Base cua feature/login la commit C
# Nhung main da di xa hon (D, E)
```

```
# SAU REBASE (git rebase main):
# Cac commit F, G, H duoc "nho ra" va "dat lai" sau E

main:          A---B---C---D---E
                                \
feature/login:                   F'---G'---H'

# F', G', H' la cac commit MOI (hash moi, noi dung tuong tu)
# Base moi cua feature/login la commit E (tip cua main)
# Lich su la mot duong thang -- nhu the ban lam F, G, H sau E
```

**Dieu quan trong:** F', G', H' la cac commit **hoan toan moi** -- chung co hash khac voi F, G, H goc. Git da tao lai chung tren nen tang moi (E thay vi C).

### 1.3. Tai sao goi la "rebase"?

- **Base** = diem goc ma branch cua ban bat dau (commit C)
- **Rebase** = thay doi base do (tu C sang E)
- Noi cach khac: "dat lai nen tang" cho branch cua ban

---

## 2. Rebase co ban

### 2.1. Lenh co ban

```bash
# Dang o feature/login
git switch feature/login

# Rebase len main (dat lai base la tip cua main)
git rebase main

# Ket qua: cac commit cua feature/login duoc dat lai sau main
# Applying: F - Tao form login
# Applying: G - Them validation
# Applying: H - Ket noi API
```

### 2.2. Quy trinh chi tiet

```bash
# Buoc 1: Cap nhat main moi nhat
git switch main
git pull origin main

# Buoc 2: Chuyen sang feature branch
git switch feature/login

# Buoc 3: Rebase len main
git rebase main
# Neu khong co conflict -> Xong!
# Neu co conflict -> Giai quyet tung commit mot

# Buoc 4: Kiem tra ket qua
git log --oneline --graph
# Lich su la mot duong thang dep
```

### 2.3. Vi du thuc te

```bash
# Setup
mkdir rebase-lab && cd rebase-lab
git init

echo "line 1" > file.txt
git add file.txt
git commit -m "A: initial"

echo "line 2" >> file.txt
git add file.txt
git commit -m "B: them dong 2"

# Tao feature branch
git switch -c feature/update
echo "feature line" >> file.txt
git add file.txt
git commit -m "F: them dong feature"

# Quay lai main, them commit moi
git switch main
echo "main line" > main.txt
git add main.txt
git commit -m "C: them file main.txt"

# Bay gio: main co commit C, feature co commit F
# Rebase feature len main
git switch feature/update
git rebase main
# Applying: F: them dong feature

# Kiem tra
git log --oneline --graph --all
# * F' (HEAD -> feature/update) them dong feature
# * C (main) them file main.txt
# * B them dong 2
# * A initial
# => Mot duong thang dep!
```

---

## 3. Rebase vs Merge -- So sanh chi tiet

### 3.1. Bang so sanh

| Dac diem | Merge | Rebase |
|----------|-------|--------|
| **Lich su** | Giu nguyen, co nhanh re | Viet lai, mot duong thang |
| **Merge commit** | Co (voi 3-way merge) | Khong |
| **Commit goc** | Giu nguyen hash | Tao commit moi (hash moi) |
| **An toan** | An toan hon (khong thay doi lich su) | Nguy hiem neu dung tren shared branch |
| **Conflict** | Giai quyet 1 lan | Co the giai quyet nhieu lan (tung commit) |
| **Git log** | Phuc tap, nhieu nhanh | Sach, de doc |
| **Rollback** | De (revert merge commit) | Kho hon (commits da bi viet lai) |
| **Thong tin** | Giu day du (ai, khi nao, branch nao) | Mat thong tin ve branch goc |

### 3.2. Minh hoa truc quan

```
# MERGE: Giu nguyen lich su, co merge commit
main: A---B---C---D---E---M
               \         /
feature:        F---G---H

# REBASE: Viet lai lich su, mot duong thang
main: A---B---C---D---E
                        \
feature:                 F'---G'---H'

# Sau khi merge feature vao main (fast-forward vi rebase):
main: A---B---C---D---E---F'---G'---H'
# Mot duong thang hoan hao!
```

### 3.3. Khi nao dung merge, khi nao dung rebase?

**Dung MERGE khi:**
- Gop feature vao main/develop (shared branch)
- Muon giu lai lich su day du
- Lam viec nhom va branch da push len remote
- Can rollback de dang

**Dung REBASE khi:**
- Cap nhat feature branch voi thay doi moi tu main
- Don dep lich su truoc khi tao PR
- Branch chi co minh ban lam viec (chua push hoac chi minh ban push)
- Muon lich su sach truoc khi merge vao main

**Workflow pho bien nhat:**
```bash
# 1. Rebase feature branch len main (cap nhat va don dep)
git switch feature/login
git rebase main

# 2. Merge vao main voi --no-ff (giu dau vet)
git switch main
git merge --no-ff feature/login
# Ket qua: lich su sach + biet feature nao da merge
```

---

## 4. Golden Rule -- Quy tac vang

:::danger KHONG BAO GIO REBASE NHANH PUBLIC/SHARED

Neu branch cua ban da duoc push len remote va **nguoi khac dang lam viec tren do**, TUYET DOI KHONG REBASE.

:::

### 4.1. Tai sao?

```
# Ban va dong nghiep cung lam tren feature/login:

# Truoc khi ban rebase:
origin:        A---B---C
                        \
feature/login:           F---G---H   (dong nghiep co F, G, H)

# Ban rebase:
origin:        A---B---C---D---E
                                \
feature/login:                   F'---G'---H'  (hash MOI!)

# Ban force push len remote
# Dong nghiep pull ve:
# - Git thay F, G, H (cu) va F', G', H' (moi) la cac commit KHAC NHAU
# - Xay ra conflict, duplicate commits, lich su hon don
# - Dong nghiep rat kho chiu voi ban!
```

### 4.2. Quy tac don gian

- **Branch chi minh ban dung** -> Rebase thoai mai
- **Branch nhieu nguoi dung** -> Chi dung merge, KHONG rebase
- **Da push len remote?** -> Rebase chi khi ban la nguoi duy nhat lam viec tren branch do (va ban hieu hau qua cua force push)

```bash
# Sau khi rebase branch da push, ban PHAI force push:
git push --force-with-lease origin feature/login
# --force-with-lease an toan hon --force
# No kiem tra: remote co thay doi khong tu lan push cuoi?
# Neu co -> Tu choi (co the nguoi khac da push)
# Neu khong -> Force push
```

---

## 5. Interactive rebase -- Suc manh thuc su

### 5.1. Interactive rebase la gi?

Interactive rebase (`git rebase -i`) cho phep ban **chinh sua lich su commit** -- doi thu tu, gop commit, sua message, xoa commit, va nhieu hon.

```bash
# Rebase 3 commit gan nhat
git rebase -i HEAD~3
```

Git se mo editor voi danh sach commit:

```
pick abc1234 Tao form login
pick def5678 fix typo
pick ghi9012 Them validation

# Rebase abc1234..ghi9012 onto xyz7890 (3 commands)
#
# Commands:
# p, pick   = su dung commit nay
# r, reword = su dung commit, nhung sua message
# e, edit   = su dung commit, dung lai de ban chinh sua
# s, squash = gop vao commit truoc, giu ca 2 message
# f, fixup  = gop vao commit truoc, bo message cua commit nay
# d, drop   = xoa commit nay
```

### 5.2. Cac lenh trong interactive rebase

| Lenh | Chuc nang | Khi nao dung |
|------|-----------|-------------|
| `pick` (p) | Giu commit nhu cu | Mac dinh, khong thay doi gi |
| `reword` (r) | Sua commit message | Sua typo trong message, them chi tiet |
| `edit` (e) | Dung lai de ban sua commit | Tach 1 commit thanh nhieu commit |
| `squash` (s) | Gop vao commit truoc | Gop nhieu commit nho thanh 1 |
| `fixup` (f) | Gop vao commit truoc, bo message | Gop commit "fix typo" vao commit chinh |
| `drop` (d) | Xoa commit | Bo commit khong can thiet |

### 5.3. Vi du 1: Gop 3 commit thanh 1

```bash
# Lich su hien tai:
git log --oneline -4
# ghi9012 fix: sua loi validation
# def5678 fix: sua typo
# abc1234 feat: tao form login
# xyz7890 initial commit

# Muon gop 3 commit thanh 1:
git rebase -i HEAD~3
```

Editor hien thi:
```
pick abc1234 feat: tao form login
pick def5678 fix: sua typo
pick ghi9012 fix: sua loi validation
```

Sua thanh:
```
pick abc1234 feat: tao form login
fixup def5678 fix: sua typo
fixup ghi9012 fix: sua loi validation
```

Ket qua: Chi con **1 commit** "feat: tao form login" chua tat ca thay doi.

### 5.4. Vi du 2: Sua commit message

```bash
git rebase -i HEAD~2
```

Editor:
```
pick abc1234 feat: tao form logn    <-- co typo!
pick def5678 them validation
```

Sua thanh:
```
reword abc1234 feat: tao form logn
pick def5678 them validation
```

Luu lai. Git se mo editor lan nua de ban sua message:
```
feat: tao form login
# Sua typo: logn -> login
```

### 5.5. Vi du 3: Doi thu tu commit

```bash
git rebase -i HEAD~3
```

Editor:
```
pick abc1234 Them footer
pick def5678 Them header
pick ghi9012 Them navigation
```

Doi thu tu (header truoc, navigation, roi footer):
```
pick def5678 Them header
pick ghi9012 Them navigation
pick abc1234 Them footer
```

**Luu y:** Doi thu tu co the gay conflict neu cac commit phu thuoc nhau.

### 5.6. Vi du 4: Xoa commit

```bash
git rebase -i HEAD~3
```

```
pick abc1234 Them tinh nang A
pick def5678 debug: them console.log     <-- Muon xoa!
pick ghi9012 Them tinh nang B
```

Sua thanh:
```
pick abc1234 Them tinh nang A
drop def5678 debug: them console.log
pick ghi9012 Them tinh nang B
```

Hoac don gian xoa dong do:
```
pick abc1234 Them tinh nang A
pick ghi9012 Them tinh nang B
```

---

## 6. `git rebase --onto` -- Rebase nang cao

### 6.1. Khi nao can `--onto`?

Khi ban muon **di chuyen mot nhom commit** tu base nay sang base khac.

```
# Tinh huong: Ban tao feature-B tu feature-A (khong phai tu main)
main:       A---B---C
                 \
feature-A:        D---E
                       \
feature-B:              F---G

# feature-A da merge vao main.
# Ban muon feature-B dua tren main thay vi feature-A

# Dung --onto:
git rebase --onto main feature-A feature-B
```

### 6.2. Cu phap

```bash
git rebase --onto <new-base> <old-base> <branch>
# Di chuyen cac commit tu <old-base> den <branch>
# Dat chung len <new-base>
```

### 6.3. Vi du thuc te

```bash
# Truoc:
# main:       A---B---C---D
#                  \
# feature-A:       E---F
#                        \
# feature-B:              G---H

# Muon di chuyen feature-B (G, H) len main
git rebase --onto main feature-A feature-B

# Sau:
# main:       A---B---C---D
#                  \        \
# feature-A:       E---F    G'---H'  (feature-B)
```

```
# Mot truong hop khac: bo mot so commit o giua

# Truoc:
# feature: A---B---C---D---E---F
#              (bo C va D, chi giu A, B, E, F)

git rebase --onto B D feature
# "Lay cac commit sau D tren feature, dat len sau B"

# Sau:
# feature: A---B---E'---F'
```

---

## 7. Xu ly conflict trong rebase

### 7.1. Conflict trong rebase khac merge

Khi rebase, Git ap dung **tung commit mot**. Nen ban co the phai giai quyet conflict **nhieu lan** (moi commit co the co conflict rieng).

```bash
git rebase main
# CONFLICT: file.txt
# error: could not apply abc1234... Them header

# Buoc 1: Giai quyet conflict trong file
# Mo file.txt, sua conflict markers

# Buoc 2: Stage file da sua
git add file.txt

# Buoc 3: Tiep tuc rebase
git rebase --continue
# Git ap dung commit tiep theo
# Co the co conflict nua...

# Lap lai cho den khi xong
```

### 7.2. Cac lenh trong qua trinh rebase

```bash
# Tiep tuc sau khi giai quyet conflict
git rebase --continue

# Bo qua commit hien tai (khong ap dung commit nay)
git rebase --skip

# HUY TOAN BO rebase -- quay lai trang thai ban dau
git rebase --abort
# An toan 100% -- nhu chua bao gio rebase
```

### 7.3. Khi nao nen abort?

- Conflict qua phuc tap, can thoi gian phan tich
- Nhan ra rebase la sai lam (vi du: rebase nham branch)
- Muon thao luan voi team truoc

---

## 8. Workflow thuc te: Feature branch + Rebase

### 8.1. Quy trinh hoan chinh

```bash
# 1. Tao feature branch tu main
git switch main
git pull origin main
git switch -c feature/user-profile

# 2. Lam viec va commit tren feature branch
echo "<div>Profile</div>" > profile.html
git add profile.html
git commit -m "Tao trang profile"

echo "<form>Edit</form>" > edit-profile.html
git add edit-profile.html
git commit -m "Them form chinh sua profile"

# 3. Truoc khi tao PR, cap nhat voi main
git switch main
git pull origin main
git switch feature/user-profile

# Rebase len main (cap nhat base)
git rebase main
# Giai quyet conflict neu co

# 4. Don dep commit (interactive rebase)
git rebase -i HEAD~2
# Gop commit neu can, sua message cho ro rang

# 5. Push len remote
git push -u origin feature/user-profile
# Hoac neu da push truoc do:
git push --force-with-lease origin feature/user-profile

# 6. Tao Pull Request tren GitHub

# 7. Sau khi PR duoc approve, merge vao main
# (Thuong lam tren GitHub UI)
```

### 8.2. Cap nhat feature branch hang ngay

```bash
# Moi sang, cap nhat feature branch voi main moi nhat
git switch main
git pull origin main
git switch feature/user-profile
git rebase main

# Neu co conflict -> giai quyet ngay
# Viec nay giup conflict nho va de giai quyet
# Thay vi doi den cuoi roi conflict lon
```

---

## 9. Risks va cach phong tranh

### 9.1. Risk 1: Mat commit

```bash
# Sau khi rebase, commit goc (F, G, H) van ton tai
# nhung khong thuoc branch nao
# Chung se bi garbage collected sau ~30 ngay

# Phong tranh: dung reflog de phuc hoi
git reflog
# Tim commit truoc khi rebase
# abc1234 HEAD@{5}: rebase (start): checkout main

git switch -c recovery abc1234
# Phuc hoi thanh cong!
```

### 9.2. Risk 2: Force push de len code cua nguoi khac

```bash
# SAI: dung --force (nguy hiem)
git push --force origin feature/shared
# Neu nguoi khac da push commit moi -> mat commit do!

# DUNG: dung --force-with-lease (an toan hon)
git push --force-with-lease origin feature/shared
# Kiem tra truoc: co ai push gi moi khong?
# Neu co -> tu choi, ban phai pull truoc
```

### 9.3. Risk 3: Rebase nham branch

```bash
# Dang o main, vo tinh rebase
git rebase feature/experiment
# OH NO! Lich su main bi thay doi!

# Cuu bang reflog:
git reflog
# Tim vi tri main truoc khi rebase
git reset --hard HEAD@{n}
```

---

## 10. Loi thuong gap

### Loi 1: Rebase branch da push va nhieu nguoi dung

```bash
# Ban rebase va force push
git push --force origin develop
# Dong nghiep pull:
# error: Your local changes would be overwritten

# Cach xu ly cho dong nghiep:
git fetch origin
git reset --hard origin/develop
# Mat cac thay doi chua push cua dong nghiep!

# Bai hoc: KHONG rebase branch chung
```

### Loi 2: Conflict lien tuc khi rebase nhieu commit

```bash
# Rebase 10 commit, phai giai quyet conflict 10 lan!
# Moi commit co the co conflict khac

# Giai phap 1: Dung rerere (reuse recorded resolution)
git config --global rerere.enabled true
# Git nho cach ban giai quyet conflict va tu dong ap dung

# Giai phap 2: Squash commit truoc khi rebase
git rebase -i HEAD~10  # Gop thanh 1-2 commit
git rebase main         # Rebase chi 1-2 commit -> it conflict hon
```

### Loi 3: Nham lan giua rebase va merge

```bash
# Muon cap nhat feature voi main moi nhat

# Dung MERGE (an toan hon, tao merge commit):
git switch feature/login
git merge main

# Dung REBASE (lich su sach hon, viet lai commit):
git switch feature/login
git rebase main

# Ca hai deu cap nhat feature voi main
# Khac nhau o lich su commit
```

### Loi 4: Quen `--continue` sau khi resolve conflict

```bash
# Sau khi sua conflict va git add
# KHONG DUNG git commit (nhu merge)!
# DUNG: git rebase --continue

git add file.txt
git rebase --continue   # DUNG!
# Khong phai:
git commit              # SAI! (voi rebase)
```

---

## 11. Cau hoi phong van

### Cau 1: Giai thich su khac nhau giua merge va rebase. Khi nao dung cai nao?

**Tra loi:** **Merge** giu nguyen lich su va tao merge commit -- an toan, khong thay doi commit da ton tai. **Rebase** viet lai lich su bang cach tao commit moi tren base moi -- lich su sach nhung thay doi commit hash. Dung merge khi gop branch vao main (shared branch). Dung rebase khi cap nhat feature branch ca nhan voi thay doi moi tu main. Workflow pho bien: rebase feature len main (cap nhat), roi merge vao main voi `--no-ff` (ghi nhan).

### Cau 2: "Golden Rule of Rebasing" la gi? Tai sao quan trong?

**Tra loi:** Golden Rule: **Khong bao gio rebase branch public/shared** -- tuc la branch ma nguoi khac dang lam viec tren do. Ly do: rebase tao commit moi voi hash moi. Neu ban rebase va force push, dong nghiep da co commit cu tren may ho. Khi ho pull, Git thay 2 bo commit khac nhau (cu va moi) cho cung noi dung -> duplicate commits, conflict, lich su hon don. Chi rebase branch ca nhan ma chi minh ban lam viec.

### Cau 3: Interactive rebase dung de lam gi? Cho vi du cu the.

**Tra loi:** Interactive rebase (`git rebase -i`) cho phep chinh sua lich su commit: gop commit (squash/fixup), sua message (reword), xoa commit (drop), doi thu tu, tach commit (edit). Vi du: truoc khi tao PR, ban co 5 commit nho ("wip", "fix typo", "test", "update", "final"). Dung `git rebase -i HEAD~5` va `fixup` 4 commit cuoi vao commit dau tien, `reword` commit dau de co message ro rang. Ket qua: 1 commit sach, de review.

### Cau 4: Dang rebase ma gap conflict. Ban lam gi?

**Tra loi:** Khi rebase gap conflict: (1) Git dung lai o commit gay conflict, (2) Mo file co conflict, doc conflict markers va sua, (3) `git add <file>` cac file da sua, (4) `git rebase --continue` de tiep tuc. Neu conflict qua phuc tap, dung `git rebase --abort` de huy toan bo va quay lai trang thai ban dau. Khac voi merge (giai quyet 1 lan), rebase co the yeu cau giai quyet conflict nhieu lan (moi commit ap dung co the co conflict rieng).

### Cau 5: `git rebase --onto` dung de lam gi? Cho vi du.

**Tra loi:** `git rebase --onto new-base old-base branch` di chuyen mot nhom commit tu base cu sang base moi. Vi du: ban tao feature-B tu feature-A, nhung feature-A da merge vao main va bi xoa. Bay gio feature-B van dua tren feature-A (cu). Dung `git rebase --onto main feature-A feature-B` de di chuyen cac commit cua feature-B (nhung commit sau feature-A) len main. Ket qua: feature-B dua tren main thay vi feature-A.

---

## Tom tat

| Lenh | Chuc nang |
|------|-----------|
| `git rebase main` | Rebase branch hien tai len main |
| `git rebase -i HEAD~n` | Interactive rebase n commit gan nhat |
| `git rebase --continue` | Tiep tuc sau khi giai quyet conflict |
| `git rebase --skip` | Bo qua commit hien tai |
| `git rebase --abort` | Huy toan bo rebase |
| `git rebase --onto A B C` | Di chuyen commit tu B..C len A |
| `git push --force-with-lease` | Force push an toan (sau rebase) |

**Ghi nho:** Rebase la cong cu manh me de giu lich su sach. Nhung luon nho Golden Rule -- chi rebase branch cua rieng ban. Khi nghi ngo, dung merge.
