---
sidebar_position: 2
title: "Merge — Gop nhanh trong Git"
---

# Merge — Gop nhanh trong Git

Sau khi ban lam viec tren mot branch rieng va hoan thanh cong viec, buoc tiep theo la **gop (merge)** cac thay doi do vao branch chinh. Merge la mot trong nhung thao tac quan trong nhat trong Git, va hieu ro cac kieu merge se giup ban lam viec hieu qua hon trong nhom.

---

## 1. Merge la gi?

Merge la qua trinh **gop cac thay doi tu branch nay vao branch khac**. Thong thuong, ban merge branch tinh nang (feature) vao branch chinh (main).

```bash
# Dang o branch main, muon gop feature/login vao
git switch main
git merge feature/login
```

**Nguyen tac co ban:** Luon **chuyen sang branch nhan** truoc khi merge. Neu ban muon gop feature vao main, ban phai **dung tren main** roi merge feature vao.

```
# SAI: dang o feature/login, merge main
git switch feature/login
git merge main
# => Day la merge main vao feature (cap nhat feature), khong phai merge feature vao main

# DUNG: dang o main, merge feature/login
git switch main
git merge feature/login
# => Day la gop feature vao main
```

---

## 2. Fast-forward merge

### 2.1. Khi nao xay ra?

Fast-forward xay ra khi branch main **khong co commit moi nao** ke tu khi ban tao branch feature. Noi cach khac, lich su la mot duong thang:

```
# Truoc khi merge:
main:          A---B---C
                        \
feature/login:           D---E---F

# Main khong co commit moi sau C
# => Git chi can "di chuyen" pointer main len F

# Sau khi merge (fast-forward):
main:          A---B---C---D---E---F  (main pointer di chuyen len F)
```

### 2.2. Vi du thuc te

```bash
# Bat dau tu main
git switch main
git log --oneline
# abc1234 (HEAD -> main) Initial commit

# Tao va chuyen sang feature
git switch -c feature/header
echo "<header>Logo</header>" > header.html
git add header.html
git commit -m "Them header"

echo "<nav>Menu</nav>" >> header.html
git add header.html
git commit -m "Them navigation"

# Quay lai main va merge
git switch main
git merge feature/login
# Ket qua:
# Updating abc1234..def5678
# Fast-forward          <-- Git bao ban: day la fast-forward
#  header.html | 2 ++
#  1 file changed, 2 insertions(+)
```

### 2.3. Uu va nhuoc diem

| Uu diem | Nhuoc diem |
|---------|------------|
| Lich su sach, mot duong thang | Khong biet duoc "nhom commit nao thuoc feature nao" |
| Khong tao merge commit thua | Mat thong tin ve branch (branch da ton tai bao lau, merge khi nao) |
| De doc log | Kho rollback ca mot feature |

### 2.4. `--no-ff` -- Ep tao merge commit

Neu ban muon **giu lai dau vet** cua branch (biet rang nhom commit nay thuoc feature nao), dung `--no-ff`:

```bash
git switch main
git merge --no-ff feature/header
# Git se mo editor de ban nhap merge commit message
# Mac dinh: "Merge branch 'feature/header'"
```

```
# Voi --no-ff, lich su se nhu the nay:
main:   A---B---C-----------M  (merge commit)
                 \         /
feature/header:   D---E---F

# Thay vi fast-forward:
main:   A---B---C---D---E---F  (khong co merge commit)
```

**Khuyen nghi:** Nhieu team bat buoc dung `--no-ff` de lich su ro rang hon. Co the cau hinh mac dinh:

```bash
# Cau hinh --no-ff mac dinh cho branch main
git config branch.main.mergeoptions "--no-ff"
```

---

## 3. Three-way merge (3-way merge)

### 3.1. Khi nao xay ra?

3-way merge xay ra khi **ca hai branch deu co commit moi** ke tu diem re nhanh. Git khong the chi "di chuyen pointer" -- no phai **ket hop thay doi tu ca hai phia**.

```
# Truoc khi merge:
main:          A---B---C---D---E      (main co commit D, E)
                        \
feature/login:           F---G---H    (feature co commit F, G, H)

# Ca hai deu co commit moi tu diem re C
# Git can so sanh 3 diem: C (base), E (main), H (feature)
```

### 3.2. Quy trinh 3-way merge

Git thuc hien 3 buoc:

1. **Tim merge base** -- commit chung gan nhat (C trong vi du tren)
2. **So sanh** thay doi tu base den main (C -> E) va tu base den feature (C -> H)
3. **Ket hop** ca hai nhom thay doi va tao **merge commit** (M)

```
# Sau khi merge:
main:          A---B---C---D---E---M  (merge commit co 2 parent)
                        \         /
feature/login:           F---G---H

# Merge commit M co 2 parent: E va H
# No la "noi ket noi" hai dong lich su
```

### 3.3. Vi du thuc te

```bash
# Tao du an moi
mkdir merge-practice && cd merge-practice
git init

# Commit dau tien
echo "line 1" > file.txt
git add file.txt
git commit -m "A: initial"

# Tao feature branch
git switch -c feature/update

# Commit tren feature
echo "line 2 from feature" >> file.txt
git add file.txt
git commit -m "F: them dong 2 tu feature"

# Quay lai main va tao commit moi
git switch main
echo "# README" > README.md
git add README.md
git commit -m "D: them README"

# Bay gio ca main va feature deu co commit moi
# Merge se la 3-way merge
git merge feature/update
# Git se mo editor de nhap merge commit message
# Mac dinh: "Merge branch 'feature/update'"

# Xem lich su
git log --oneline --graph --all
# *   M (HEAD -> main) Merge branch 'feature/update'
# |\
# | * F (feature/update) them dong 2 tu feature
# * | D them README
# |/
# * A initial
```

---

## 4. Squash merge

### 4.1. Squash merge la gi?

Squash merge **gop tat ca commit tu feature branch thanh MOT commit** tren main, nhung **khong tao merge commit** va **khong luu lai lich su branch**.

```
# Branch feature co 5 commit nho:
feature:  F1---F2---F3---F4---F5

# Squash merge vao main:
main:     A---B---C---S
#                      ^
#                      S = 1 commit chua tat ca thay doi tu F1-F5
```

### 4.2. Cach dung

```bash
git switch main
git merge --squash feature/login
# Ket qua: tat ca thay doi duoc staged nhung CHUA COMMIT

# Ban phai tu commit
git commit -m "feat: them tinh nang dang nhap"
# Chi 1 commit gon gang tren main
```

### 4.3. Khi nao dung squash merge?

| Nen dung khi | Khong nen dung khi |
|-------------|-------------------|
| Feature branch co nhieu commit nho, messy | Moi commit deu co y nghia va can giu lai |
| Commit message nhu "fix typo", "wip", "test" | Can truy vet lich su chi tiet |
| Muon main branch co lich su sach | Team can biet ai lam gi khi nao |
| PR co nhieu commit chinh sua theo review | Branch dai ngay voi nhieu milestone |

**Luu y:** Sau squash merge, Git khong biet branch da duoc merge. `git branch --merged` se KHONG liet ke branch do. Ban can xoa branch thu cong.

```bash
git merge --squash feature/login
git commit -m "feat: them login"
# feature/login van hien thi la "chua merge"
git branch -d feature/login
# error: not fully merged
git branch -D feature/login  # Phai dung -D
```

---

## 5. Huy merge -- `--abort`

Khi merge gay ra conflict ma ban chua muon giai quyet:

```bash
git merge feature/complex
# CONFLICT: Merge conflict in app.js
# Automatic merge failed; fix conflicts and then commit the result.

# Ban chua san sang giai quyet? Huy merge:
git merge --abort
# Moi thu quay lai trang thai truoc khi merge
# Nhu chua co gi xay ra

# Kiem tra trang thai
git status
# On branch main
# nothing to commit, working tree clean
```

**Khi nao nen dung `--abort`?**
- Conflict phuc tap, can them thoi gian phan tich
- Merge nham branch
- Muon thao luan voi dong nghiep truoc khi resolve

---

## 6. So sanh cac kieu merge

| Dac diem | Fast-forward | 3-way merge | Squash merge |
|----------|-------------|-------------|--------------|
| Merge commit | Khong | Co (1 commit) | Khong (ban tu commit) |
| Lich su branch | Mat | Giu lai | Mat |
| Do phuc tap | Don gian nhat | Trung binh | Don gian |
| Rollback feature | Kho (nhieu commit) | De (revert merge commit) | De (revert 1 commit) |
| Lich su main | Phang, nhieu commit | Co nhanh re | Phang, it commit |
| Dieu kien | Main khong co commit moi | Ca hai co commit moi | Bat ky |
| Lenh | `git merge` (tu dong) | `git merge` (tu dong) | `git merge --squash` |

### Minh hoa truc quan

```
# Fast-forward:
main: A---B---C---D---E---F  (phang, khong thay branch)

# 3-way merge (--no-ff):
main: A---B---C---D---E---M  (thay ro branch)
               \         /
feature:        F---G---H

# Squash merge:
main: A---B---C---D---E---S  (phang, 1 commit gon)
```

---

## 7. Merge strategies

Git ho tro nhieu chien luoc merge. Thuong ban khong can chi dinh -- Git tu chon. Nhung trong mot so truong hop dac biet:

### 7.1. Recursive (mac dinh cho 3-way merge)

```bash
git merge feature/login
# Git tu dong dung recursive strategy
# Xu ly tot khi ca 2 branch co thay doi
```

### 7.2. Ours -- Giu phien ban cua main, bo feature

```bash
git merge -s ours feature/old-design
# Tao merge commit nhung GIU TOAN BO noi dung cua main
# Code tu feature/old-design bi BO HOAN TOAN
# Huu ich khi: can "danh dau" branch da merge nhung khong lay code
```

**Luu y:** `-s ours` (strategy) khac voi `-X ours` (strategy option):

```bash
# -s ours: Bo TOAN BO thay doi tu branch kia
git merge -s ours feature/old

# -X ours: Chi khi co CONFLICT moi chon phien ban cua minh
# Nhung thay doi khong conflict van duoc merge binh thuong
git merge -X ours feature/login
```

### 7.3. Theirs -- Khi conflict, uu tien phien ban cua branch kia

```bash
git merge -X theirs feature/redesign
# Khi co conflict, tu dong chon phien ban tu feature/redesign
# Thay doi khong conflict van merge binh thuong
```

**Luu y:** Khong co `-s theirs` strategy. Chi co `-X theirs` (strategy option).

---

## 8. Thuc hanh -- Trai nghiem tat ca cac kieu merge

### Bai tap 1: Fast-forward merge

```bash
mkdir merge-lab && cd merge-lab
git init

# Tao commit ban dau
echo "Hello World" > index.html
git add index.html
git commit -m "Initial: tao index.html"

# Tao feature branch va them commit
git switch -c feature/style
echo "body { margin: 0; }" > style.css
git add style.css
git commit -m "Them file CSS"

# Merge vao main (fast-forward)
git switch main
git merge feature/style
# Chu y dong: "Fast-forward"

git log --oneline --graph
# Lich su la mot duong thang
```

### Bai tap 2: 3-way merge

```bash
# Tao feature moi
git switch -c feature/script
echo "console.log('hello')" > app.js
git add app.js
git commit -m "Them JavaScript"

# Quay lai main va tao commit moi
git switch main
echo "<h1>Welcome</h1>" >> index.html
git add index.html
git commit -m "Cap nhat tieu de"

# Merge (3-way)
git switch main
git merge feature/script
# Git tao merge commit

git log --oneline --graph --all
# Thay ro 2 nhanh hop lai
```

### Bai tap 3: Squash merge

```bash
# Tao feature voi nhieu commit nho
git switch -c feature/footer
echo "<footer>" > footer.html
git add footer.html
git commit -m "wip: bat dau footer"

echo "<footer>Copyright</footer>" > footer.html
git add footer.html
git commit -m "wip: them noi dung"

echo "<footer>Copyright 2024</footer>" > footer.html
git add footer.html
git commit -m "fix: sua nam"

# Squash merge
git switch main
git merge --squash feature/footer
git commit -m "feat: them footer component"

git log --oneline
# Chi thay 1 commit gon gang cho footer
```

### Bai tap 4: So sanh lich su

```bash
# Xem su khac biet
git log --oneline --graph --all

# Thu dung format dep hon
git log --oneline --graph --all --decorate
```

---

## 9. Best practices khi merge

### 9.1. Truoc khi merge

```bash
# 1. Cap nhat main moi nhat
git switch main
git pull origin main

# 2. Merge main vao feature truoc (giai quyet conflict o feature)
git switch feature/login
git merge main
# Giai quyet conflict (neu co) tren feature branch
# Test lai de dam bao moi thu hoat dong

# 3. Bay gio merge feature vao main (se la clean merge)
git switch main
git merge feature/login
# Khong con conflict vi da giai quyet o buoc 2
```

### 9.2. Quy trinh chuan trong team

1. **Tao PR/MR** tren GitHub/GitLab
2. **Code review** boi it nhat 1 nguoi
3. **CI/CD chay xong** (tests pass, lint pass)
4. **Merge** bang nut tren GitHub (thuong la squash merge hoac merge commit)
5. **Xoa branch** sau khi merge

### 9.3. Merge commit message

```bash
# Mac dinh (tot):
Merge branch 'feature/login'

# Tot hon -- them context:
Merge branch 'feature/login'

Them he thong dang nhap voi email va mat khau.
Bao gom: form login, validation, API integration.
Reviewed by: @teammate

# Voi squash merge -- tom tat tat ca thay doi:
feat: them he thong dang nhap (#42)

- Tao form dang nhap voi validation
- Ket noi API authentication
- Them error handling va loading state
- Them unit tests cho login flow
```

---

## 10. Loi thuong gap

### Loi 1: Merge nham branch

```bash
# Vua merge nham feature/wrong vao main
git merge feature/wrong
# Oh no!

# Huy ngay (neu chua push):
git reset --hard HEAD~1
# Quay lai commit truoc merge commit

# Neu da push:
git revert -m 1 HEAD
# Tao commit moi "undo" merge commit
# -m 1 = giu main, bo feature
```

### Loi 2: Quen chuyen branch truoc khi merge

```bash
# Dang o feature/A, merge feature/B vao
git merge feature/B
# => feature/B merge vao feature/A, khong phai main!

# Huy:
git reset --hard HEAD~1
# Chuyen sang main roi merge lai
git switch main
git merge feature/B
```

### Loi 3: Merge co conflict nhung an Enter qua nhanh

```bash
# Conflict xay ra nhung ban commit ma chua sua
git add .
git commit
# File van con <<<<<<< markers!

# Sua: mo file, tim va sua tat ca conflict markers
# Roi amend commit:
git add .
git commit --amend
```

### Loi 4: Fast-forward khi ban muon merge commit

```bash
# Muon co merge commit nhung Git fast-forward
git merge feature/small
# Fast-forward -- mat dau vet branch!

# Phong tranh: luon dung --no-ff khi muon giu lich su
git reset --hard HEAD~1  # Quay lai
git merge --no-ff feature/small
# Bay gio co merge commit
```

---

## 11. Cau hoi phong van

### Cau 1: Giai thich su khac nhau giua fast-forward merge va 3-way merge.

**Tra loi:** **Fast-forward** xay ra khi branch dich khong co commit moi nao ke tu khi tao branch nguon -- Git chi di chuyen pointer, khong tao merge commit. **3-way merge** xay ra khi ca hai branch deu co commit moi -- Git phai so sanh 3 diem (merge base, tip cua moi branch), ket hop thay doi va tao merge commit co 2 parent. Fast-forward cho lich su phang nhung mat thong tin branch; 3-way merge giu lai lich su branch nhung phuc tap hon.

### Cau 2: `--no-ff` flag lam gi va tai sao nhieu team bat buoc dung no?

**Tra loi:** `--no-ff` (no fast-forward) ep Git **luon tao merge commit**, ke ca khi co the fast-forward. Nhieu team dung no vi: (1) merge commit la "moc" danh dau mot feature hoan thanh, (2) de rollback ca feature bang `git revert`, (3) `git log --graph` hien thi ro cau truc branch, (4) biet ai merge va khi nao. Day la cau hinh mac dinh trong nhieu Git workflow (Git Flow, GitHub Flow).

### Cau 3: Squash merge la gi? Khi nao nen dung va khong nen dung?

**Tra loi:** Squash merge gop tat ca commit tu branch nguon thanh mot thay doi duy nhat tren branch dich, roi ban tu commit. **Nen dung** khi feature branch co nhieu commit nho khong co y nghia (wip, fix typo, test), muon main co lich su sach. **Khong nen dung** khi moi commit trong branch deu quan trong va can truy vet, hoac khi nhieu nguoi cung lam tren mot branch (mat thong tin ai lam gi). Luu y: sau squash merge, Git khong biet branch da merge, can xoa branch thu cong bang `-D`.

### Cau 4: Ban dang o main va merge nham branch. Chua push. Lam sao khac phuc?

**Tra loi:** Dung `git reset --hard HEAD~1` de quay lai commit truoc merge commit (vi merge commit la commit moi nhat). Neu la squash merge (ban da commit), tuong tu dung `git reset --hard HEAD~1`. Neu da push len remote, dung `git revert -m 1 <merge-commit-hash>` de tao commit moi dao nguoc thay doi -- KHONG dung `reset --hard` tren branch da push vi se gay conflict cho dong nghiep.

### Cau 5: Giai thich `-s ours` va `-X ours` khac nhau the nao?

**Tra loi:** `-s ours` la **merge strategy** -- no bo **toan bo** thay doi tu branch kia, chi giu noi dung cua branch hien tai, nhung van tao merge commit (danh dau la da merge). Dung khi muon "dong" mot branch cu ma khong lay code. `-X ours` la **strategy option** cho recursive merge -- no chi ap dung khi co **conflict**: chon phien ban cua branch hien tai cho nhung dong conflict, con nhung thay doi khong conflict van duoc merge binh thuong. Tuong tu, `-X theirs` chon phien ban cua branch kia khi conflict.

---

## Tom tat

| Lenh | Chuc nang |
|------|-----------|
| `git merge <branch>` | Merge branch vao branch hien tai |
| `git merge --no-ff <branch>` | Merge voi merge commit (khong fast-forward) |
| `git merge --squash <branch>` | Gop tat ca commit thanh 1 (can commit thu cong) |
| `git merge --abort` | Huy merge dang co conflict |
| `git merge -X ours` | Khi conflict, uu tien phien ban hien tai |
| `git merge -X theirs` | Khi conflict, uu tien phien ban branch kia |
| `git merge -s ours <branch>` | Giu toan bo phien ban hien tai, bo branch kia |
| `git log --oneline --graph` | Xem lich su dang cay (de thay merge) |

**Ghi nho:** Merge la ky nang co ban nhat khi lam viec nhom voi Git. Hieu ro 3 kieu merge (fast-forward, 3-way, squash) va biet khi nao dung cai nao se giup ban lam viec hieu qua hon.
