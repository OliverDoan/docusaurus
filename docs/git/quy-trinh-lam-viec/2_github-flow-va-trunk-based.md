---
sidebar_position: 2
title: "GitHub Flow va Trunk-Based Development"
---

# GitHub Flow va Trunk-Based Development

Git Flow manh me nhung phuc tap. Nhieu team — dac biet nhung team deploy lien tuc — can mot quy trinh nhe hon. Bai nay gioi thieu 2 mo hinh pho bien thay the Git Flow: **GitHub Flow** (don gian, hieu qua cho hau het du an) va **Trunk-Based Development** (tieu chuan vang cua cac ong lon nhu Google, Facebook). Ban se hieu moi mo hinh hoat dong ra sao, uu nhuoc diem, va khi nao nen chon cai nao.

---

## 1. GitHub Flow

### 1.1. GitHub Flow la gi?

GitHub Flow la mo hinh branching **cuc ky don gian** duoc GitHub gioi thieu. Chi co **1 quy tac cot loi**: nhanh `main` luon o trang thai deployable (co the deploy bat ky luc nao).

```
+--------------------------------------------------+
|           GITHUB FLOW — Chi co 6 buoc            |
+--------------------------------------------------+
|  1. Tao branch tu main                           |
|  2. Them commits                                 |
|  3. Mo Pull Request                              |
|  4. Review va thao luan                          |
|  5. Merge vao main                               |
|  6. Deploy                                       |
+--------------------------------------------------+
```

### 1.2. Workflow chi tiet

```
  main:  ---o---o---o-------o---o-------o---o----->
              \     |      / \   \     /
  branch:      o---o---o--o   o---o---o
              feature/login  fix/header-bug
              |           |
              PR created  PR merged + deployed
```

**Buoc 1: Tao branch tu main**

```bash
# Luon bat dau tu main moi nhat
git checkout main
git pull origin main

# Tao branch voi ten mo ta
git checkout -b feature/add-search-bar
# Hoac: fix/broken-nav-link
# Hoac: docs/update-readme
```

**Buoc 2: Code va commit**

```bash
# Lam viec binh thuong, commit thuong xuyen
git add src/components/SearchBar.tsx
git commit -m "feat: add search bar component"

git add src/pages/Home.tsx
git commit -m "feat: integrate search bar into home page"

git add tests/SearchBar.test.tsx
git commit -m "test: add search bar unit tests"
```

**Buoc 3: Push va tao Pull Request**

```bash
# Push branch len remote
git push -u origin feature/add-search-bar
```

Tren GitHub, tao Pull Request (PR) voi:
- **Title** ngan gon, ro y
- **Description** mo ta thay doi, tai sao, cach test
- **Reviewers** — chi dinh nguoi review
- **Labels** — feature, bug, docs...

**Buoc 4: Review va thao luan**

```
+---------------------------------------------+
|  Pull Request #42: Add search bar           |
+---------------------------------------------+
|  alice: "Nen them debounce cho search"      |
|  bob: "LGTM, da test tren staging"          |
|  CI: All checks passed (green)              |
|  Review: 2/2 approved                       |
+---------------------------------------------+
```

- Team member review code, de lai comment
- CI/CD chay tu dong: lint, test, build
- Tac gia fix feedback, push commit moi
- Khi du approval va CI xanh → san sang merge

**Buoc 5: Merge vao main**

```bash
# Tren GitHub: click "Merge pull request"
# Hoac dung command line:
git checkout main
git pull origin main
git merge --no-ff feature/add-search-bar
git push origin main

# Xoa branch da merge
git branch -d feature/add-search-bar
git push origin --delete feature/add-search-bar
```

**Buoc 6: Deploy**

```bash
# Trong GitHub Flow, merge vao main = deploy
# Thuong thong qua CI/CD tu dong:
#   main merge → trigger pipeline → deploy to production
```

### 1.3. Cac kieu Merge trong GitHub Flow

Khi merge PR tren GitHub, ban co 3 lua chon:

| Kieu Merge | Cach hoat dong | Khi nao dung |
|------------|---------------|--------------|
| **Merge commit** | Tao merge commit, giu tat ca commits | Muon giu lich su day du |
| **Squash and merge** | Gop tat ca commits thanh 1 | Feature nho, muon lich su gon |
| **Rebase and merge** | Dat lai commits len dau main | Muon lich su tuyen tinh, khong merge commit |

```bash
# Squash merge — pho bien nhat trong GitHub Flow
# 5 commits tren feature branch → 1 commit tren main
git checkout main
git merge --squash feature/add-search-bar
git commit -m "feat: add search bar with debounce (#42)"
```

### 1.4. Uu nhuoc diem cua GitHub Flow

**Uu diem:**

| Uu diem | Chi tiet |
|---------|---------|
| **Cuc ky don gian** | Chi 1 nhanh chinh, 1 loai branch phu |
| **CI/CD friendly** | Merge = deploy, phu hop continuous deployment |
| **Code review tot** | Moi thay doi deu qua PR review |
| **Linh hoat** | Khong gioi han ten branch, khong quy tac phuc tap |
| **Nhanh** | It buoc, it ceremony, ship nhanh |

**Nhuoc diem:**

| Nhuoc diem | Chi tiet |
|------------|---------|
| **Khong ho tro nhieu version** | Chi 1 nhanh main, khong co develop/release |
| **Can CI/CD tot** | Neu khong co CI, code loi co the len production |
| **Khong co staging rieng** | Khong co release branch de test truoc |
| **Kho rollback** | Neu deploy loi, phai fix forward hoac revert commit |

---

## 2. Trunk-Based Development (TBD)

### 2.1. TBD la gi?

Trunk-Based Development la mo hinh ma **tat ca developer commit truc tiep vao 1 nhanh chinh** (trunk, thuong la `main`). Khong co long-lived branches. Neu co branch thi chi **song duoi 1 ngay** (short-lived).

```
+----------------------------------------------------------+
|            TRUNK-BASED DEVELOPMENT                       |
+----------------------------------------------------------+
|                                                          |
|  main:  --o--o--o--o--o--o--o--o--o--o--o--o--o-->       |
|            |     |        |     |                        |
|            A     B        A     C    (developers)        |
|                                                          |
|  Hoac voi short-lived branches (< 1 ngay):               |
|                                                          |
|  main:  --o--o--o-----o--o-----o--o--o--o--o-->          |
|               \  |   / \  |   /                          |
|  branch:       o-o--o    o-o--o                          |
|               (< 24h)   (< 24h)                          |
+----------------------------------------------------------+
```

### 2.2. Nguyen tac cot loi

```
+-------------------------------------------+
|  Quy tac TBD:                             |
|  1. Moi nguoi lam viec tren main          |
|  2. Commit nho, thuong xuyen (nhieu lan/  |
|     ngay)                                 |
|  3. Branch (neu co) < 1 ngay              |
|  4. Khong long-lived feature branches     |
|  5. Feature chua hoan thanh → Feature     |
|     Flag                                  |
|  6. CI chay cho moi commit                |
|  7. Main luon deployable                  |
+-------------------------------------------+
```

### 2.3. Workflow chi tiet

**Cach 1: Commit truc tiep vao main**

```bash
# Cach nay pho bien o team nho, tin tuong cao
git checkout main
git pull origin main

# Lam thay doi nho, co focus
git add src/utils/formatDate.ts
git commit -m "feat: add relative date formatting"
git push origin main
# CI chay tu dong ngay khi push
```

**Cach 2: Short-lived branches (< 1 ngay)**

```bash
# Sang: tao branch
git checkout main
git pull origin main
git checkout -b alice/add-date-formatter

# Lam viec trong ngay
git add .
git commit -m "feat: add date formatter utility"
git add .
git commit -m "test: add date formatter tests"

# Chieu: push va tao PR
git push -u origin alice/add-date-formatter
# Tao PR, review nhanh, merge trong ngay

# KHONG de branch qua dem!
```

### 2.4. Feature Flags — "Vu khi bi mat" cua TBD

Feature Flag (hay Feature Toggle) la co dieu khien bat/tat tinh nang ma **khong can deploy lai code**.

**Tai sao can Feature Flags?**

Trong TBD, code chua hoan thanh van merge vao main. Nhung ban khong muon user thay tinh nang dang lam do! Feature Flag giai quyet dieu nay.

```javascript
// Vi du Feature Flag don gian
const FEATURE_FLAGS = {
  NEW_SEARCH: false,       // Dang phat trien, chua bat
  DARK_MODE: true,         // Da hoan thanh, bat cho tat ca
  PREMIUM_PLAN: 'beta',    // Chi bat cho beta users
};

// Su dung trong code
function SearchBar() {
  // Kiem tra flag truoc khi hien thi
  if (!FEATURE_FLAGS.NEW_SEARCH) {
    return <OldSearchBar />;  // User thay version cu
  }
  return <NewSearchBar />;    // Chi developer/tester thay
}
```

```javascript
// Feature Flag nang cao hon voi dieu kien
function getFeatureFlag(flagName, userId) {
  const flag = flags[flagName];

  // Tat hoan toan
  if (flag === false) return false;

  // Bat hoan toan
  if (flag === true) return true;

  // Bat cho 1 nhom cu the
  if (flag === 'beta') {
    return betaUsers.includes(userId);
  }

  // Bat theo ty le (canary release)
  if (typeof flag === 'number') {
    return (hashUserId(userId) % 100) < flag;  // flag = 10 → 10% user
  }

  return false;
}

// Su dung
if (getFeatureFlag('NEW_CHECKOUT', currentUser.id)) {
  // Hien thi checkout moi
}
```

**Cac cong cu Feature Flag pho bien:**

| Tool | Mien phi? | Phu hop |
|------|-----------|---------|
| **LaunchDarkly** | Co free tier | Enterprise, nhieu tinh nang |
| **Unleash** | Open source | Self-hosted, team trung binh |
| **Flagsmith** | Open source | Self-hosted hoac cloud |
| **Environment variables** | Mien phi | Du an nho, don gian |
| **Config file** | Mien phi | MVP, prototype |

### 2.5. Yeu cau de ap dung TBD

```
+-----------------------------------------------------+
|  Yeu cau tien quyet cho TBD:                        |
+-----------------------------------------------------+
|  [x] CI/CD pipeline manh, chay nhanh (< 10 phut)   |
|  [x] Test coverage cao (unit + integration)          |
|  [x] Code review nhanh (trong vong vai gio)          |
|  [x] Feature Flags infrastructure                    |
|  [x] Team co ky luat commit nho, thuong xuyen        |
|  [x] Monitoring va alerting tot (biet loi ngay)      |
|  [x] Kha nang rollback nhanh                         |
+-----------------------------------------------------+
```

### 2.6. Uu nhuoc diem cua TBD

**Uu diem:**

| Uu diem | Chi tiet |
|---------|---------|
| **Khong merge conflict** | Khong co long-lived branch → khong drift |
| **CI lien tuc** | Moi commit duoc test ngay |
| **Deploy nhanh** | Main luon san sang deploy |
| **Don gian** | Khong can nho quy trinh phuc tap |
| **Google, Facebook dung** | Da chung minh hieu qua o quy mo lon |

**Nhuoc diem:**

| Nhuoc diem | Chi tiet |
|------------|---------|
| **Yeu cau CI/CD hoan chinh** | Khong co CI → disaster |
| **Can Feature Flags** | Them do phuc tap (flag debt) |
| **Kho cho team moi** | Junior developer co the push code loi |
| **Can review nhanh** | Neu review cham → block pipeline |
| **Khong ho tro nhieu version** | Chi co 1 nhanh duy nhat |

---

## 3. So sanh chi tiet: Git Flow vs GitHub Flow vs TBD

### 3.1. Bang so sanh tong hop

| Tieu chi | Git Flow | GitHub Flow | Trunk-Based |
|----------|----------|-------------|-------------|
| **So nhanh** | 5 loai | 2 (main + feature) | 1 (main) |
| **Do phuc tap** | Cao | Thap | Rat thap |
| **Phu hop team** | Lon (>10) | Trung binh (3-15) | Moi kich co |
| **Release cycle** | Scheduled (2-4 tuan) | Bat ky luc nao | Lien tuc (nhieu lan/ngay) |
| **CI/CD yeu cau** | Thap | Trung binh | Rat cao |
| **Feature branches** | Long-lived | Medium (vai ngay) | Khong hoac < 1 ngay |
| **Version support** | Nhieu version | 1 version | 1 version |
| **Merge conflicts** | Nhieu | It | Rat it |
| **Learning curve** | Kho | De | De (nhung can ky luat) |
| **Deploy frequency** | Thap | Trung binh-cao | Rat cao |
| **Rollback** | Hotfix branch | Revert commit | Tat feature flag |

### 3.2. Chon mo hinh nao?

```
                    Chon branching model
                    ====================

  Ban deploy bao nhieu lan?
  |
  +-- Vai lan/thang (scheduled) --> Git Flow
  |
  +-- Vai lan/tuan               --> GitHub Flow
  |
  +-- Nhieu lan/ngay             --> Trunk-Based Development


  Team bao nhieu nguoi?
  |
  +-- 1-3 nguoi  --> GitHub Flow hoac TBD
  |
  +-- 3-10 nguoi --> GitHub Flow
  |
  +-- 10+ nguoi  --> Git Flow hoac TBD (voi Feature Flags)


  Du an loai gi?
  |
  +-- Mobile app (iOS/Android)   --> Git Flow
  |
  +-- Web app (SaaS)             --> GitHub Flow hoac TBD
  |
  +-- Library/SDK                --> Git Flow
  |
  +-- Internal tool              --> GitHub Flow
  |
  +-- Open source                --> GitHub Flow
```

### 3.3. Real-world examples

| Cong ty | Mo hinh | Ly do |
|---------|---------|-------|
| **Google** | Trunk-Based | Monorepo khong lo, CI cuc manh, deploy lien tuc |
| **Facebook** | Trunk-Based | Nhu Google, dung Feature Flags nhieu |
| **Netflix** | Trunk-Based | Microservices, deploy doc lap tung service |
| **GitHub** | GitHub Flow | "Dogfooding" — dung chinh san pham cua minh |
| **Linux Kernel** | Giong Git Flow | Release versioned, nhieu maintainer |
| **React (open source)** | GitHub Flow | Open source, PR-driven development |
| **Enterprise banks** | Git Flow | Compliance, audit trail, scheduled release |

---

## 4. Loi thuong gap

### Loi 1: Dung GitHub Flow nhung khong co CI

```bash
# Khong co CI → code loi van merge vao main → production bi loi
# GitHub Flow YEU CAU it nhat:
# - Lint check tu dong
# - Unit tests tu dong
# - Build check tu dong

# Giai phap: thiet lap CI toi thieu truoc khi dung GitHub Flow
# .github/workflows/ci.yml
```

### Loi 2: Branch ton tai qua lau trong GitHub Flow

```bash
# GitHub Flow branch nen song < 1 tuan
# Neu branch ton tai > 2 tuan → merge conflict nightmare

# Giai phap: break feature nho hon
# Thay vi: feature/complete-checkout-system (3 tuan)
# Lam: feature/checkout-ui (2 ngay)
#       feature/checkout-api (2 ngay)
#       feature/checkout-payment (3 ngay)
```

### Loi 3: Ap dung TBD khi chua san sang

```bash
# TBD khong co CI/CD = pha hoai
# Kiem tra truoc khi chuyen sang TBD:
# 1. CI pipeline chay < 10 phut? (KHONG: chua san sang)
# 2. Test coverage > 70%? (KHONG: chua san sang)
# 3. Co feature flag system? (KHONG: chua san sang)
# 4. Team co ky luat commit nho? (KHONG: can training)
```

### Loi 4: Feature Flag debt

```javascript
// Feature Flag ton tai mai mai → code tro nen kho hieu

// SAI: Flag tu 2 nam truoc van con
if (FEATURE_FLAGS.NEW_SEARCH_V2) {  // Flag nay tu 2022!
  return <NewSearch />;
}
return <OldSearch />;  // Code nay khong bao gio chay nua

// DUNG: Don dep flag sau khi feature on dinh (2-4 tuan)
// Xoa flag, xoa code cu, chi giu code moi
return <NewSearch />;
```

### Loi 5: Khong bao ve nhanh main

```bash
# Main phai duoc bao ve (branch protection):
# - Require pull request reviews (it nhat 1 nguoi)
# - Require status checks to pass (CI xanh)
# - Khong cho push truc tiep (tru truong hop TBD co CI chat)

# Thiet lap tren GitHub:
# Settings → Branches → Branch protection rules → Add rule
# Branch name pattern: main
# [x] Require a pull request before merging
# [x] Require status checks to pass before merging
```

---

## 5. Chuyen doi giua cac mo hinh

### Tu Git Flow sang GitHub Flow

```bash
# Buoc 1: Merge develop vao main (dam bao dong bo)
git checkout main
git merge develop

# Buoc 2: Xoa nhanh develop
git branch -d develop
git push origin --delete develop

# Buoc 3: Thiet lap CI/CD cho main
# Buoc 4: Branch protection cho main
# Buoc 5: Thong bao team quy trinh moi:
#          main → feature branch → PR → review → merge → deploy
```

### Tu GitHub Flow sang TBD

```bash
# Buoc 1: Thiet lap Feature Flag system
# Buoc 2: Tang CI speed (target < 10 phut)
# Buoc 3: Tang test coverage (target > 80%)
# Buoc 4: Training team: commit nho, thuong xuyen
# Buoc 5: Dan chuyen: feature branches < 1 ngay
# Buoc 6: Cuoi cung: cho phep commit truc tiep vao main
```

---

## 6. Cau hoi phong van

### Cau 1: So sanh GitHub Flow va Git Flow. Khi nao chon cai nao?

**Tra loi:** GitHub Flow chi co 1 nhanh chinh (main) va feature branches ngan han, phu hop cho CI/CD continuous deployment, team trung binh, web app. Git Flow co 5 loai nhanh (main, develop, feature, release, hotfix), phu hop cho scheduled release, team lon, san pham co version. Chon GitHub Flow khi can ship nhanh va don gian. Chon Git Flow khi can kiem soat release chat va ho tro nhieu version.

### Cau 2: Trunk-Based Development la gi? Tai sao Google va Facebook dung?

**Tra loi:** TBD la mo hinh ma tat ca developer commit truc tiep vao 1 nhanh chinh (trunk/main), khong co long-lived branches. Google va Facebook dung vi: (1) Loai bo merge conflict tu long-lived branches, (2) CI lien tuc cho moi commit dam bao chat luong, (3) Deploy nhanh — main luon deployable, (4) Feature Flags cho phep code chua hoan thanh van merge duoc an toan. TBD yeu cau CI/CD cuc manh, test coverage cao, va feature flag infrastructure.

### Cau 3: Feature Flag la gi? Tai sao can trong TBD?

**Tra loi:** Feature Flag la co dieu khien bat/tat tinh nang trong code ma khong can deploy lai. Trong TBD, vi khong co feature branches, code chua hoan thanh van merge vao main. Feature Flag giau tinh nang chua san sang khoi end user. Uu diem khac: canary release (bat cho 10% user truoc), A/B testing, kill switch (tat tinh nang loi ngay lap tuc). Can chu y don dep flag sau khi feature on dinh de tranh "flag debt".

### Cau 4: Neu team ban dang dung Git Flow va muon chuyen sang GitHub Flow thi lam the nao?

**Tra loi:** Chuyen doi dan dan: (1) Dam bao CI/CD pipeline hoan chinh cho nhanh main, (2) Thiet lap branch protection cho main (require PR, require CI pass), (3) Merge develop vao main de dong bo, (4) Ngung tao release branches — deploy truc tiep tu main sau khi merge PR, (5) Ngung tao develop branch cho du an moi, (6) Training team ve quy trinh moi, (7) Sau vai sprint, xoa nhanh develop cu.

### Cau 5: So sanh uu nhuoc diem cua Squash Merge, Merge Commit va Rebase Merge khi merge PR?

**Tra loi:** **Merge Commit** giu toan bo lich su cua feature branch trong 1 merge commit — lich su day du nhung co the phuc tap. **Squash Merge** gop tat ca commits thanh 1 — lich su sach nhung mat chi tiet. **Rebase Merge** dat lai tung commit len dau main — lich su tuyen tinh nhung viet lai history (nguy hiem neu khong hieu ro). Pho bien nhat la Squash Merge cho feature nho va Merge Commit cho feature lon can giu lich su chi tiet.

---

## 7. Tom tat

```
+--------------------------------------------------------------+
|  GitHub Flow:                                                |
|  main → feature branch → PR → review → merge → deploy       |
|  Don gian, phu hop hau het du an                             |
+--------------------------------------------------------------+
|  Trunk-Based Development:                                    |
|  Commit truc tiep vao main (hoac branch < 1 ngay)           |
|  Feature Flags thay feature branches                         |
|  Yeu cau: CI/CD manh, test cao, ky luat tot                 |
+--------------------------------------------------------------+
|  Chon dua tren: deploy frequency, team size, CI maturity     |
+--------------------------------------------------------------+
```
