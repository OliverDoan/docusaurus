---
sidebar_position: 1
title: "Git Flow — Mo hinh phan nhanh kinh dien"
---

# Git Flow — Mo hinh phan nhanh kinh dien

Khi lam viec trong mot team lon, ban se gap cau hoi: "Ai lam nhanh nao? Merge vao dau? Release luc nao?" Git Flow ra doi de tra loi tat ca nhung cau hoi do. Day la **mo hinh phan nhanh (branching model)** noi tieng nhat trong lich su Git, duoc hang ngan team tren the gioi ap dung. Bai nay se giup ban hieu chi tiet Git Flow la gi, cach hoat dong, va khi nao nen (hoac khong nen) dung no.

---

## 1. Git Flow la gi?

Git Flow la mo hinh phan nhanh duoc **Vincent Driessen** gioi thieu nam 2010 trong bai blog kinh dien "A successful Git branching model". Mo hinh nay dinh nghia ro rang:

- **Nhanh nao** dung cho **muc dich nao**
- **Merge tu dau** vao **dau**
- **Quy trinh** tu luc bat dau code den luc release

```
+------------------------------------------------------------------+
|                     GIT FLOW OVERVIEW                            |
+------------------------------------------------------------------+
|                                                                  |
|  main      ---*-----------*-----------*--------> (production)    |
|                \         / \         /                            |
|  hotfix         \--*--*-/   \       /                            |
|                              \     /                             |
|  release                      *---*                              |
|                              /     \                             |
|  develop   ---*---*---*---*-*-------*---*---*---> (integration)  |
|                \     / \     /                                   |
|  feature        *---*   *---*                                    |
|                                                                  |
+------------------------------------------------------------------+
```

**Y tuong cot loi:** Tach biet hoan toan giua code dang phat trien (develop), code da san sang (release), va code dang chay tren production (main).

---

## 2. Cac nhanh chinh (Main Branches)

Git Flow co **2 nhanh song song vinh vien** — chung ton tai suot vong doi du an:

### 2.1. Nhanh `main` (hoac `master`)

```bash
# Nhanh main luon phan anh trang thai PRODUCTION
# Moi commit tren main = 1 phien ban da release
git log --oneline main
# a1b2c3d (tag: v2.1.0) Release 2.1.0
# d4e5f6g (tag: v2.0.0) Release 2.0.0
# h7i8j9k (tag: v1.0.0) Release 1.0.0
```

| Dac diem | Mo ta |
|----------|-------|
| Muc dich | Chua code production, da duoc test ky |
| Ai duoc merge vao | Chi `release/*` va `hotfix/*` |
| Ai duoc commit truc tiep | **KHONG AI** — tuyet doi khong commit truc tiep |
| Tag | Moi merge vao main deu duoc tag version |

### 2.2. Nhanh `develop`

```bash
# Nhanh develop la "trung tam tich hop"
# Noi tat ca feature branches merge vao
git checkout develop
git log --oneline
# f1a2b3c feat: add payment module
# c4d5e6f feat: add user profile page
# g7h8i9j fix: correct email validation
```

| Dac diem | Mo ta |
|----------|-------|
| Muc dich | Tich hop tat ca feature moi |
| Ai duoc merge vao | `feature/*` branches |
| Trang thai | Luon co code moi nhat, co the chua on dinh |
| Tao tu | Duoc tao tu `main` khi khoi tao du an |

---

## 3. Cac nhanh ho tro (Supporting Branches)

Ngoai 2 nhanh chinh, Git Flow co **3 loai nhanh tam thoi** — duoc tao ra roi xoa di sau khi hoan thanh:

### 3.1. Feature Branches (`feature/*`)

Moi tinh nang moi = 1 feature branch.

```
Workflow:
  develop ----*--------*--------*----> develop (updated)
               \      /
  feature/      *----*
  login         |    |
              start finish
```

```bash
# Buoc 1: Tao feature branch tu develop
git checkout develop
git pull origin develop
git checkout -b feature/login

# Buoc 2: Code binh thuong, commit nhieu lan
git add .
git commit -m "feat: add login form UI"

git add .
git commit -m "feat: add login API integration"

git add .
git commit -m "test: add login unit tests"

# Buoc 3: Merge lai vao develop khi hoan thanh
git checkout develop
git pull origin develop
git merge --no-ff feature/login
# --no-ff: tao merge commit, giu lai lich su nhanh

# Buoc 4: Xoa feature branch
git branch -d feature/login
git push origin --delete feature/login
```

**Tai sao dung `--no-ff`?** Vi no tao mot merge commit rieng, giup ban thay ro rang "feature nay duoc merge vao luc nao" trong git log. Neu dung fast-forward, cac commit se nam tren 1 duong thang va ban khong phan biet duoc feature nao voi feature nao.

```
# Voi --no-ff (Git Flow khuyen dung)
*   Merge feature/login into develop   <-- thay ro rang
|\
| * feat: add login tests
| * feat: add login API
| * feat: add login form
|/
*   Previous develop commit

# Khong co --no-ff (fast-forward) — kho theo doi
* feat: add login tests
* feat: add login API
* feat: add login form
* Previous develop commit
```

### 3.2. Release Branches (`release/*`)

Khi develop da co du feature cho phien ban moi, tao release branch de "dong bang" va chuan bi release.

```
Workflow:
  main    --------*------------------*------> (tag v1.0)
                                    /
  release/                   *---*-*
  1.0                       /     \
  develop ---*---*---*---*-*-------*---*---> (continue developing)
```

```bash
# Buoc 1: Tao release branch tu develop
git checkout develop
git checkout -b release/1.0.0

# Buoc 2: Chi fix bug, cap nhat version, documentation
# KHONG them feature moi tren release branch!
git commit -m "chore: bump version to 1.0.0"
git commit -m "fix: correct typo in error message"
git commit -m "docs: update changelog for v1.0.0"

# Buoc 3: Merge vao MAIN va tag
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"

# Buoc 4: Merge nguoc lai vao DEVELOP (de giu cac bug fix)
git checkout develop
git merge --no-ff release/1.0.0

# Buoc 5: Xoa release branch
git branch -d release/1.0.0
```

**Luu y quan trong:** Trong khi release branch dang ton tai, team van co the tiep tuc code feature moi tren develop. Day la uu diem lon cua Git Flow — phat trien song song!

### 3.3. Hotfix Branches (`hotfix/*`)

Bug khẩn cap tren production! Khong the doi den release tiep theo.

```
Workflow:
  main    ---*-----------*----> (tag v1.0.1)
              \         /
  hotfix/      *---*---*
  fix-crash   (sua bug khan cap)
              \         \
  develop      *---------*----> (nhan duoc hotfix)
```

```bash
# Buoc 1: Tao hotfix branch tu MAIN (khong phai develop!)
git checkout main
git checkout -b hotfix/fix-payment-crash

# Buoc 2: Sua bug khan cap
git commit -m "fix: resolve payment gateway crash on null response"

# Buoc 3: Merge vao MAIN va tag
git checkout main
git merge --no-ff hotfix/fix-payment-crash
git tag -a v1.0.1 -m "Hotfix: payment crash resolved"

# Buoc 4: Merge vao DEVELOP (de develop cung co ban sua)
git checkout develop
git merge --no-ff hotfix/fix-payment-crash

# Buoc 5: Xoa hotfix branch
git branch -d hotfix/fix-payment-crash
```

**Chu y:** Neu dang co release branch ton tai, hotfix nen merge vao release branch thay vi develop (vi release branch se merge vao develop sau).

---

## 4. Git Flow CLI Tool

Thay vi nho tat ca cac buoc tren, ban co the dung tool `git-flow` de tu dong hoa:

```bash
# Cai dat (macOS)
brew install git-flow-avh

# Cai dat (Ubuntu/Debian)
apt-get install git-flow

# Cai dat (Windows) — co san trong Git for Windows
```

### 4.1. Khoi tao Git Flow

```bash
git flow init

# Tool se hoi ban dat ten cho cac nhanh:
# Branch name for production releases: [main]
# Branch name for "next release" development: [develop]
# Feature branches prefix: [feature/]
# Release branches prefix: [release/]
# Hotfix branches prefix: [hotfix/]
# Version tag prefix: [v]

# Ket qua: tu dong tao nhanh develop tu main
```

### 4.2. Feature workflow voi git-flow CLI

```bash
# Bat dau feature moi (tu dong tao branch tu develop)
git flow feature start login
# Tuong duong: git checkout -b feature/login develop

# Lam viec binh thuong...
git add .
git commit -m "feat: implement login"

# Publish feature len remote (de team khac thay)
git flow feature publish login
# Tuong duong: git push -u origin feature/login

# Ket thuc feature (tu dong merge vao develop va xoa branch)
git flow feature finish login
# Tuong duong:
#   git checkout develop
#   git merge --no-ff feature/login
#   git branch -d feature/login
```

### 4.3. Release va Hotfix voi git-flow CLI

```bash
# === RELEASE ===
git flow release start 1.0.0
# ... fix bugs, update version ...
git flow release finish 1.0.0
# Tu dong: merge vao main + develop, tag v1.0.0, xoa branch

# === HOTFIX ===
git flow hotfix start fix-crash
# ... fix bug khan cap ...
git flow hotfix finish fix-crash
# Tu dong: merge vao main + develop, tag, xoa branch
```

---

## 5. Uu diem va Nhuoc diem

### Uu diem

| Uu diem | Giai thich |
|---------|-----------|
| **Ro rang, co cau truc** | Moi nguoi biet chinh xac code o dau, merge vao dau |
| **Parallel development** | Team co the lam nhieu feature cung luc |
| **Release co kiem soat** | Release branch cho phep test ky truoc khi len production |
| **Hotfix doc lap** | Sua bug khan cap ma khong anh huong development |
| **Lich su sach** | `--no-ff` giu lai lich su merge ro rang |
| **Phu hop versioned release** | Ly tuong cho phan mem co version (v1.0, v2.0, v3.0) |

### Nhuoc diem

| Nhuoc diem | Giai thich |
|------------|-----------|
| **Phuc tap** | Nhieu loai nhanh, nhieu buoc merge, de nham |
| **Overhead** | Qua nang ne cho du an nho hoac 1-2 nguoi |
| **Merge conflicts** | Cang nhieu nhanh song song → cang nhieu conflict |
| **Khong hop CI/CD** | Git Flow thiet ke cho scheduled release, khong phai continuous deployment |
| **Long-lived branches** | Feature branch ton tai lau → drift xa khoi develop → merge kho |
| **Cham** | Qua trinh release mat nhieu buoc manual |

---

## 6. Khi nao nen dung Git Flow?

### Nen dung khi:

```
+---------------------------------------------------+
|  Dung Git Flow khi:                               |
|  [x] Team >= 5 nguoi                              |
|  [x] Release theo lich trinh (2 tuan, 1 thang)    |
|  [x] San pham co version ro rang (v1.0, v2.0)     |
|  [x] Can ho tro nhieu version cung luc            |
|  [x] Moi truong production rieng biet             |
|  [x] Quy trinh QA nghiem ngat                     |
+---------------------------------------------------+
```

**Vi du thuc te:**
- Ung dung mobile (iOS/Android) — phai submit review, release theo version
- Phan mem enterprise (ERP, CRM) — khach hang dung version cu, can hotfix
- Library/SDK — phai duy tri nhieu version (v1.x, v2.x)

### Khong nen dung khi:

```
+---------------------------------------------------+
|  KHONG dung Git Flow khi:                         |
|  [ ] Team 1-3 nguoi                               |
|  [ ] Deploy lien tuc (nhieu lan/ngay)             |
|  [ ] Web app deploy tu dong (CI/CD hoan chinh)    |
|  [ ] Du an nho, prototype, MVP                    |
|  [ ] Khong can ho tro nhieu version               |
+---------------------------------------------------+
```

---

## 7. Tong quan quy trinh day du

```
                            Git Flow - Toan canh
                            ====================

  Tag:   v1.0          v1.1      v1.1.1        v2.0
          |             |          |             |
  main:  -o-------------o----------o-------------o---------->
          |            / \          |            /
          |           /   \         |           /
  hotfix: |          /     ---------o----------/
          |         /               |
  release:|        o---o---o        |
          |       /         \       |
  develop:o--o---o---o---o---o---o--o---o---o---o---o------->
             |  / \     /           |  / \     /
  feature:   o-o   o---o            o-o   o---o
             login  profile        search  dashboard
```

**Buoc theo buoc:**

1. Du an bat dau: tao `main` va `develop`
2. Developer A: `feature/login` tu develop → code → merge lai develop
3. Developer B: `feature/profile` tu develop → code → merge lai develop
4. PM quyet dinh release: `release/1.0` tu develop
5. QA test tren release branch, fix bug tren release branch
6. Release xong: merge vao main (tag v1.0) + merge nguoc develop
7. Bug khan cap tren production: `hotfix/fix-crash` tu main
8. Hotfix xong: merge vao main (tag v1.0.1) + merge nguoc develop
9. Lap lai tu buoc 2

---

## 8. Loi thuong gap

### Loi 1: Commit truc tiep vao main hoac develop

```bash
# SAI: commit truc tiep vao develop
git checkout develop
git commit -m "feat: add new feature"  # KHONG duoc lam!

# DUNG: luon tao branch rieng
git checkout -b feature/new-feature develop
git commit -m "feat: add new feature"
```

### Loi 2: Khong merge hotfix vao develop

```bash
# Sau khi merge hotfix vao main, nhieu nguoi QUEN merge vao develop
# Hau qua: develop khong co ban sua bug → bug xuat hien lai o release sau

# LUON LUON merge hotfix vao ca main VA develop
git checkout main
git merge --no-ff hotfix/fix-crash
git checkout develop
git merge --no-ff hotfix/fix-crash  # DUNG quen buoc nay!
```

### Loi 3: Them feature moi tren release branch

```bash
# Release branch chi de fix bug va chuan bi release
# KHONG them feature moi tren release branch!

# SAI
git checkout release/1.0
git commit -m "feat: add cool new button"  # KHONG!

# DUNG — feature moi phai tren feature branch, merge vao develop
git checkout -b feature/cool-button develop
```

### Loi 4: Dung fast-forward merge

```bash
# SAI: fast-forward lam mat lich su nhanh
git checkout develop
git merge feature/login  # Fast-forward neu co the

# DUNG: luon dung --no-ff
git checkout develop
git merge --no-ff feature/login  # Tao merge commit
```

### Loi 5: Feature branch song qua lau

```bash
# Feature branch ton tai > 1-2 tuan → drift xa khoi develop
# Merge se rat dau dau voi conflicts

# Giai phap: thuong xuyen merge develop vao feature branch
git checkout feature/long-feature
git merge develop  # Cap nhat code moi nhat tu develop
# Hoac dung rebase (nhung can hieu ro rebase truoc khi dung)
```

---

## 9. Cau hoi phong van

### Cau 1: Git Flow la gi? Giai thich cac nhanh chinh.

**Tra loi:** Git Flow la mo hinh branching duoc Vincent Driessen gioi thieu nam 2010. No dinh nghia 5 loai nhanh: 2 nhanh vinh vien (main cho production, develop cho tich hop) va 3 nhanh tam thoi (feature cho tinh nang moi, release cho chuan bi phat hanh, hotfix cho sua loi khan cap tren production). Moi loai nhanh co quy tac ro rang ve viec tao tu dau va merge vao dau.

### Cau 2: Tai sao Git Flow dung `--no-ff` khi merge?

**Tra loi:** Flag `--no-ff` (no fast-forward) buoc Git tao mot merge commit rieng biet, ngay ca khi co the fast-forward. Dieu nay giu lai lich su cua feature branch trong git log — ban co the thay ro rang feature nao duoc merge vao luc nao, bao gom tat ca cac commit cua no. Neu dung fast-forward, cac commit se "phang" tren 1 dong va ban khong phan biet duoc boundary giua cac feature.

### Cau 3: Khi nao tao hotfix branch? No khac gi voi feature branch?

**Tra loi:** Hotfix branch duoc tao khi co bug khan cap tren production can sua ngay lap tuc, khong the doi den release tiep theo. Khac biet lon nhat: hotfix tao tu `main` (code production) va merge vao ca `main` lan `develop`. Feature branch tao tu `develop` va chi merge vao `develop`. Hotfix cung duoc tag version (patch increment, vi du v1.0.0 → v1.0.1).

### Cau 4: Git Flow co nhuoc diem gi? Khi nao khong nen dung?

**Tra loi:** Git Flow phuc tap voi nhieu loai nhanh va buoc merge, tao overhead lon cho team nho. No khong phu hop voi CI/CD continuous deployment vi duoc thiet ke cho scheduled release. Long-lived feature branches co the drift xa khoi develop gay merge conflict lon. Nen can nhac GitHub Flow (don gian hon) cho web app deploy lien tuc, hoac Trunk-Based Development cho team co CI/CD hoan chinh.

### Cau 5: Trong Git Flow, neu dang co release branch va phat hien bug tren production thi xu ly the nao?

**Tra loi:** Tao hotfix branch tu main nhu binh thuong. Sau khi fix xong, merge hotfix vao main (tag version moi) va merge vao **release branch** (thay vi develop). Ly do: release branch cuoi cung se merge vao develop, nen bug fix se duoc truyen xuong develop thong qua release branch. Neu merge hotfix truc tiep vao develop ma khong qua release branch, co the gay conflict khi release branch merge vao develop sau do.

---

## 10. Tom tat

```
+----------------------------------------------------------+
|  Git Flow — Tom tat nhanh                                |
+----------------------------------------------------------+
|  main       = production (chi release va hotfix)         |
|  develop    = integration (noi feature hop nhat)         |
|  feature/*  = tinh nang moi (tu develop, vao develop)    |
|  release/*  = chuan bi release (tu develop, vao main)    |
|  hotfix/*   = sua khan cap (tu main, vao main+develop)   |
+----------------------------------------------------------+
|  CLI tool: git flow init / feature / release / hotfix    |
|  Luon dung: --no-ff khi merge                            |
|  Phu hop: team lon, scheduled release, versioned product |
+----------------------------------------------------------+
```
