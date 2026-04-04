---
sidebar_position: 5
title: "CI/CD co ban voi GitHub Actions"
---

# CI/CD co ban voi GitHub Actions

Ban da biet cach viet code, tao branch, merge PR. Nhung ai se **kiem tra code co loi khong** truoc khi merge? Ai se **build va deploy** sau khi merge? Neu lam thu cong → cham, de sai, khong nhat quan. Day la luc **CI/CD** va **GitHub Actions** vao cuoc. Bai nay se giup ban hieu CI/CD la gi, va huong dan ban xay dung pipeline dau tien voi GitHub Actions tu A den Z.

---

## 1. CI/CD la gi?

### 1.1. Continuous Integration (CI)

CI la quy trinh **tu dong kiem tra code** moi khi developer push hoac tao PR.

```
  Developer push code
        |
        v
  +------------------+
  |  CI Pipeline     |
  |  1. Lint check   |  ← Code co dung format?
  |  2. Unit tests   |  ← Logic co dung?
  |  3. Build        |  ← Code co compile duoc?
  |  4. Integration  |  ← Cac phan co lam viec cung nhau?
  +------------------+
        |
    +---+---+
    |       |
  PASS    FAIL
    |       |
  Merge   Fix code
  allowed  truoc
```

**Khong co CI:**
- Developer A push code loi → khong ai biet
- Developer B pull code → "Tai sao code cua toi khong chay?"
- Chieu thu 6, toan team mat 3 gio debug code cua A

**Co CI:**
- Developer A push code loi → CI bao loi ngay trong 5 phut
- Developer A fix truoc khi bat ky ai bi anh huong
- Team luon co code base sach, chay duoc

### 1.2. Continuous Deployment / Delivery (CD)

```
  CI thanh cong (code da kiem tra)
        |
        v
  +---------------------+
  |  CD Pipeline        |
  |  1. Build artifact  |  ← Tao ban build
  |  2. Deploy staging  |  ← Test tren moi truong giong production
  |  3. Smoke tests     |  ← Kiem tra co ban tren staging
  |  4. Deploy prod     |  ← Len production
  +---------------------+
```

| Khai niem | Giai thich |
|-----------|-----------|
| **Continuous Delivery** | Tu dong build va chuan bi deploy, nhung **can nguoi bam nut** de deploy len production |
| **Continuous Deployment** | Tu dong deploy len production **khong can nguoi bam nut** — moi commit qua test → tu dong len prod |

### 1.3. Tai sao CI/CD quan trong?

| Loi ich | Khong co CI/CD | Co CI/CD |
|---------|---------------|----------|
| **Phat hien loi** | Thu 6 moi biet | 5 phut sau khi push |
| **Deploy** | Thu cong, mat 2-3 gio | Tu dong, 10-15 phut |
| **Nhat quan** | "Works on my machine" | Moi truong giong nhau |
| **Tu tin** | "Khong dam merge, so hong" | "CI xanh, merge thoai mai" |
| **Toc do ship** | 1-2 lan/thang | Nhieu lan/ngay |

---

## 2. GitHub Actions Overview

### 2.1. Cac khai niem co ban

```
+-------------------------------------------------------+
|  GitHub Actions Hierarchy                             |
+-------------------------------------------------------+
|                                                       |
|  Workflow (.yml file)                                 |
|  |                                                    |
|  +-- Job 1 (chay tren 1 may ao)                     |
|  |   |                                               |
|  |   +-- Step 1: Checkout code                       |
|  |   +-- Step 2: Setup Node.js                       |
|  |   +-- Step 3: Install dependencies                |
|  |   +-- Step 4: Run tests                           |
|  |                                                    |
|  +-- Job 2 (chay tren may ao khac, co the song song) |
|      |                                               |
|      +-- Step 1: Checkout code                       |
|      +-- Step 2: Build                               |
|      +-- Step 3: Deploy                              |
+-------------------------------------------------------+
```

| Khai niem | Giai thich | Vi du |
|-----------|-----------|-------|
| **Workflow** | File YAML dinh nghia toan bo pipeline | `.github/workflows/ci.yml` |
| **Event/Trigger** | Su kien kich hoat workflow | push, pull_request, schedule |
| **Job** | Nhom cac buoc chay tren 1 runner | test, build, deploy |
| **Step** | 1 buoc cu the trong job | checkout, install, run tests |
| **Action** | Buoc duoc dong goi san, tai su dung | `actions/checkout@v4` |
| **Runner** | May ao chay job | `ubuntu-latest`, `macos-latest` |

### 2.2. Cau truc file workflow

Workflow files nam trong `.github/workflows/`:

```
my-project/
├── .github/
│   └── workflows/
│       ├── ci.yml          ← Chay khi push/PR
│       ├── deploy.yml      ← Chay khi merge vao main
│       └── scheduled.yml   ← Chay theo lich
├── src/
├── tests/
└── package.json
```

---

## 3. Triggers (Events)

### 3.1. Cac trigger pho bien

```yaml
# Trigger khi push len bat ky branch nao
on: push

# Trigger khi push len branch cu the
on:
  push:
    branches: [main, develop]

# Trigger khi tao PR vao main
on:
  pull_request:
    branches: [main]

# Trigger khi push HOAC tao PR
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# Trigger khi push tag
on:
  push:
    tags:
      - 'v*'    # v1.0.0, v2.1.0, etc.

# Trigger theo lich (cron)
on:
  schedule:
    - cron: '0 9 * * 1'  # Moi thu Hai luc 9:00 UTC
    # Phut Gio Ngay Thang Thu
    # 0     9   *   *    1

# Trigger thu cong (bam nut tren GitHub)
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deploy environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
```

### 3.2. Loc theo path (chi chay khi file cu the thay doi)

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'src/**'           # Chi khi file trong src/ thay doi
      - 'tests/**'         # Hoac file trong tests/ thay doi
      - 'package.json'     # Hoac package.json thay doi
    paths-ignore:
      - '**/*.md'          # Bo qua file markdown
      - 'docs/**'          # Bo qua folder docs
```

---

## 4. Vi du Workflow Node.js (day du)

### 4.1. CI co ban

```yaml
# .github/workflows/ci.yml
name: CI

# Khi nao chay?
on:
  push:
    branches: [main, develop]     # Push len main hoac develop
  pull_request:
    branches: [main]              # PR vao main

# Cac job can chay
jobs:
  # Job 1: Lint va Test
  test:
    name: Lint & Test             # Ten hien thi tren GitHub
    runs-on: ubuntu-latest        # May ao Ubuntu moi nhat

    steps:
      # Buoc 1: Lay code tu repo
      - name: Checkout code
        uses: actions/checkout@v4

      # Buoc 2: Cai dat Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'           # Version Node.js
          cache: 'npm'                 # Cache npm de tang toc

      # Buoc 3: Cai dat dependencies
      - name: Install dependencies
        run: npm ci
        # npm ci nhanh hon npm install, dung cho CI
        # No cai dat chinh xac theo package-lock.json

      # Buoc 4: Kiem tra code format
      - name: Lint
        run: npm run lint

      # Buoc 5: Kiem tra TypeScript types
      - name: Type check
        run: npm run typecheck

      # Buoc 6: Chay tests
      - name: Run tests
        run: npm test -- --coverage
        # --coverage: tao bao cao coverage

      # Buoc 7: Upload coverage report
      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/              # Folder chua coverage report

  # Job 2: Build
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test                        # Chi chay SAU khi test PASS
    # needs: dam bao test pass truoc khi build

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: build/                 # Folder chua ket qua build
```

### 4.2. Giai thich tung phan

```yaml
# name: Ten workflow — hien thi tren GitHub Actions tab
name: CI

# on: Dinh nghia khi nao workflow chay
on:
  push:
    branches: [main]

# jobs: Dinh nghia cac cong viec can lam
jobs:
  test:                          # ID cua job (ban dat ten)
    name: "Lint & Test"          # Ten hien thi (tuy chon)
    runs-on: ubuntu-latest       # May ao chay job

    steps:                       # Danh sach cac buoc
      - name: "Checkout"         # Ten buoc (tuy chon)
        uses: actions/checkout@v4  # Dung action co san
        # uses: goi action tu Marketplace

      - name: "Run tests"
        run: npm test            # Chay lenh shell
        # run: chay lenh truc tiep
```

---

## 5. Vi du Workflow Java

```yaml
# .github/workflows/java-ci.yml
name: Java CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    name: Build & Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # Cai dat JDK
      - name: Setup JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'    # Eclipse Temurin (mien phi)
          cache: 'maven'             # Cache Maven dependencies

      # Build va test voi Maven
      - name: Build with Maven
        run: mvn -B package --file pom.xml
        # -B: batch mode (khong interactive)
        # package: compile + test + package

      # Hoac neu dung Gradle
      # - name: Build with Gradle
      #   run: ./gradlew build

      # Upload test results
      - name: Upload test results
        if: always()                 # Chay ca khi test FAIL
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: target/surefire-reports/
```

---

## 6. Environment Variables va Secrets

### 6.1. Environment Variables

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest

    # Bien moi truong cho toan bo job
    env:
      NODE_ENV: production
      API_URL: https://api.example.com

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # Bien moi truong cho 1 step cu the
      - name: Build
        run: npm run build
        env:
          REACT_APP_VERSION: ${{ github.sha }}
          # github.sha: hash cua commit hien tai

      # Su dung bien trong command
      - name: Print info
        run: |
          echo "Branch: ${{ github.ref_name }}"
          echo "Commit: ${{ github.sha }}"
          echo "Actor: ${{ github.actor }}"
          echo "Node env: $NODE_ENV"
```

### 6.2. Secrets (bi mat)

Secrets la cac gia tri nhay cam (API keys, passwords) duoc ma hoa va chi giai ma khi chay workflow.

```bash
# Thiet lap secret tren GitHub:
# Repo → Settings → Secrets and variables → Actions → New repository secret
# Name: DEPLOY_TOKEN
# Value: ghp_xxxxxxxxxxxx
```

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        run: |
          curl -X POST https://api.example.com/deploy \
            -H "Authorization: Bearer ${{ secrets.DEPLOY_TOKEN }}"
        # secrets.DEPLOY_TOKEN: lay gia tri tu GitHub Secrets
        # Gia tri nay KHONG hien thi trong logs

      - name: Docker login
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | \
            docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
```

**Luu y quan trong:**
- Secrets duoc **ma hoa** va chi giai ma khi chay
- Secrets **KHONG** hien thi trong logs (duoc mask bang `***`)
- Forked repos **KHONG** truy cap duoc secrets cua repo goc (bao mat)

---

## 7. Matrix Strategy — Test nhieu version

Matrix cho phep ban **chay cung 1 job tren nhieu cau hinh** dong thoi:

```yaml
jobs:
  test:
    name: Test on Node ${{ matrix.node-version }}
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        # Chay tren 3 OS x 3 Node versions = 9 jobs song song
        os: [ubuntu-latest, macos-latest, windows-latest]
        node-version: [18, 20, 22]

        # Loai tru cau hinh cu the
        exclude:
          - os: macos-latest
            node-version: 18    # Khong test Node 18 tren macOS

        # Them cau hinh dac biet
        include:
          - os: ubuntu-latest
            node-version: 20
            experimental: true  # Them bien tuy chon

      fail-fast: false  # Khong dung cac job khac neu 1 job fail

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - run: npm ci
      - run: npm test
```

```
Ket qua tren GitHub: 9 jobs chay song song
+-----------+----------+----------+----------+
|           | Node 18  | Node 20  | Node 22  |
+-----------+----------+----------+----------+
| Ubuntu    |   PASS   |   PASS   |   PASS   |
| macOS     |    —     |   PASS   |   PASS   |
| Windows   |   PASS   |   PASS   |   FAIL   |
+-----------+----------+----------+----------+
```

---

## 8. Caching — Tang toc Pipeline

Caching luu lai dependencies de khong phai download lai moi lan:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Cach 1: Cache tich hop trong setup-node (don gian nhat)
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'           # Tu dong cache node_modules

      # Cach 2: Cache thu cong (linh hoat hon)
      - name: Cache node_modules
        uses: actions/cache@v4
        with:
          path: node_modules           # Folder can cache
          key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
          # Key duy nhat dua tren OS va noi dung package-lock.json
          # Khi package-lock.json thay doi → cache miss → cai lai
          restore-keys: |
            ${{ runner.os }}-node-
            # Neu khong tim thay key chinh xac, thu key gan giong

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
```

**So sanh toc do:**

```
Khong co cache:
  Install dependencies: 45 giay (download tu npm registry)
  Tong: ~2 phut

Co cache (cache hit):
  Restore cache: 5 giay
  Install dependencies: 3 giay (chi verify, khong download)
  Tong: ~45 giay

Tiet kiem: ~60% thoi gian!
```

---

## 9. Artifacts — Luu ket qua

Artifacts la cac file duoc tao trong workflow ma ban muon giu lai:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage

      # Upload coverage report
      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        if: always()                     # Upload ca khi test fail
        with:
          name: coverage-report
          path: coverage/
          retention-days: 30             # Giu 30 ngay

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build

      # Upload build output
      - name: Upload build
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: build/

  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      # Download build artifact tu job truoc
      - name: Download build
        uses: actions/download-artifact@v4
        with:
          name: build-output
          path: ./build

      - name: Deploy
        run: |
          echo "Deploying from ./build ..."
          # Deploy command here
```

---

## 10. Branch Protection + Required Checks

Ket hop CI voi branch protection de dam bao code tren main luon sach:

```
+----------------------------------------------------+
|  Branch Protection Rules cho main:                 |
|                                                    |
|  [x] Require pull request before merging           |
|      [x] Require 1 approval                       |
|                                                    |
|  [x] Require status checks to pass                |
|      [x] CI / Lint & Test  (required)              |
|      [x] CI / Build        (required)              |
|                                                    |
|  [x] Require branches to be up to date             |
|                                                    |
|  [x] Do not allow bypassing settings               |
+----------------------------------------------------+
```

```bash
# Thiet lap bang GitHub CLI
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["CI / Lint & Test","CI / Build"]}' \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field enforce_admins=true
```

**Ket qua:** Khong ai co the merge PR vao main khi:
- CI chua pass (do)
- Chua co it nhat 1 approval
- Branch chua cap nhat voi main moi nhat

---

## 11. Deploy Workflow co ban

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]    # Chi deploy khi merge vao main

jobs:
  # Buoc 1: Test
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test

  # Buoc 2: Build
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test             # Doi test pass
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: build/

  # Buoc 3: Deploy to staging
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    environment: staging     # GitHub Environment (co the them approval)
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-output
          path: ./build
      - name: Deploy to staging
        run: |
          echo "Deploying to staging..."
          # Vi du: deploy len Vercel, Netlify, AWS, etc.

  # Buoc 4: Deploy to production (can approval)
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: deploy-staging
    environment: production  # Co the cau hinh required reviewers
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-output
          path: ./build
      - name: Deploy to production
        run: |
          echo "Deploying to production..."
```

```
  Pipeline visualization:
  =======================

  test ──> build ──> deploy-staging ──> deploy-production
                                          |
                                    [Require approval]
                                    (nguoi review bam "Approve")
```

---

## 12. GitHub Actions Marketplace — Popular Actions

| Action | Muc dich | Su dung |
|--------|---------|---------|
| `actions/checkout@v4` | Lay code tu repo | Hau nhu moi workflow |
| `actions/setup-node@v4` | Cai dat Node.js | Du an JavaScript/TypeScript |
| `actions/setup-java@v4` | Cai dat JDK | Du an Java |
| `actions/setup-python@v5` | Cai dat Python | Du an Python |
| `actions/cache@v4` | Cache files | Tang toc pipeline |
| `actions/upload-artifact@v4` | Upload ket qua | Luu build output, reports |
| `actions/download-artifact@v4` | Download tu job truoc | Deploy artifacts |
| `softprops/action-gh-release@v2` | Tao GitHub Release | Release tu dong |
| `codecov/codecov-action@v4` | Upload code coverage | Theo doi test coverage |
| `docker/build-push-action@v5` | Build va push Docker | Container deployment |

---

## 13. Bang tong hop Syntax YAML quan trong

| Syntax | Muc dich | Vi du |
|--------|---------|-------|
| `name:` | Ten workflow/job/step | `name: CI Pipeline` |
| `on:` | Trigger events | `on: push`, `on: pull_request` |
| `jobs:` | Dinh nghia cac jobs | `jobs: test: ...` |
| `runs-on:` | May ao chay job | `runs-on: ubuntu-latest` |
| `steps:` | Danh sach buoc | `steps: - name: ...` |
| `uses:` | Dung action co san | `uses: actions/checkout@v4` |
| `run:` | Chay lenh shell | `run: npm test` |
| `with:` | Tham so cho action | `with: node-version: '20'` |
| `env:` | Bien moi truong | `env: NODE_ENV: production` |
| `if:` | Dieu kien chay | `if: github.ref == 'refs/heads/main'` |
| `needs:` | Phu thuoc job khac | `needs: test` |
| `strategy.matrix:` | Chay nhieu cau hinh | `matrix: node: [18, 20]` |
| `secrets.*` | Truy cap secrets | `${{ secrets.API_KEY }}` |
| `github.*` | Thong tin su kien | `${{ github.sha }}` |
| `always()` | Luon chay (ca khi fail) | `if: always()` |
| `failure()` | Chi chay khi fail | `if: failure()` |
| `success()` | Chi chay khi pass | `if: success()` |

---

## 14. Loi thuong gap

### Loi 1: Workflow khong chay

```yaml
# SAI: file khong dung vi tri
# workflows/ci.yml         ← KHONG duoc!
# .github/ci.yml           ← KHONG duoc!

# DUNG: phai dung chinh xac
# .github/workflows/ci.yml ← DUNG!

# Kiem tra:
# 1. File co nam trong .github/workflows/?
# 2. File co duoi .yml hoac .yaml?
# 3. YAML syntax co dung khong?
# 4. Trigger co khop voi su kien khong?
```

### Loi 2: npm ci fail vi thieu package-lock.json

```bash
# npm ci YEU CAU package-lock.json ton tai trong repo
# Neu ban co .gitignore bo qua no → CI se fail

# DUNG: KHONG ignore package-lock.json
# File .gitignore:
node_modules/          # Ignore node_modules
# package-lock.json    ← KHONG ignore file nay!
```

### Loi 3: Secrets bi lo trong logs

```yaml
# SAI: In secret ra log
- name: Debug
  run: echo "Token: ${{ secrets.DEPLOY_TOKEN }}"
  # GitHub se mask thanh ***, nhung van nguy hiem neu dung sai

# SAI: Truyen secret qua URL
- name: Deploy
  run: curl "https://api.example.com?token=${{ secrets.API_KEY }}"
  # URL co the hien thi trong logs!

# DUNG: Dung environment variable hoac header
- name: Deploy
  run: |
    curl -X POST https://api.example.com/deploy \
      -H "Authorization: Bearer $DEPLOY_TOKEN"
  env:
    DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

### Loi 4: Job khong doi job truoc

```yaml
# SAI: deploy chay song song voi test (khong doi)
jobs:
  test:
    runs-on: ubuntu-latest
    steps: ...
  deploy:
    runs-on: ubuntu-latest
    steps: ...
    # Deploy co the chay truoc khi test pass!

# DUNG: dung needs de dinh nghia thu tu
jobs:
  test:
    runs-on: ubuntu-latest
    steps: ...
  deploy:
    runs-on: ubuntu-latest
    needs: test              # DOI test pass truoc
    steps: ...
```

### Loi 5: Cache khong hoat dong

```yaml
# SAI: Key khong thay doi khi dependencies thay doi
- uses: actions/cache@v4
  with:
    path: node_modules
    key: my-cache           # Key co dinh → luon dung cache cu!

# DUNG: Key thay doi khi package-lock.json thay doi
- uses: actions/cache@v4
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
    # hashFiles: tao hash tu noi dung file
    # Khi dependencies thay doi → hash khac → cache miss → cai moi
```

---

## 15. Cau hoi phong van

### Cau 1: CI/CD la gi? Phan biet Continuous Integration, Continuous Delivery va Continuous Deployment.

**Tra loi:** **CI (Continuous Integration)** la quy trinh tu dong kiem tra code (lint, test, build) moi khi developer push code, dam bao code base luon o trang thai hoat dong. **Continuous Delivery** la tu dong hoa toan bo quy trinh tu code den san sang deploy, nhung can nguoi bam nut de deploy len production. **Continuous Deployment** tien xa hon — tu dong deploy len production moi khi code pass tat ca tests, khong can su can thiep cua con nguoi.

### Cau 2: Giai thich cau truc cua 1 GitHub Actions workflow.

**Tra loi:** Mot workflow gom: (1) **name** — ten workflow, (2) **on** — trigger events (push, pull_request, schedule), (3) **jobs** — cac cong viec can thuc hien, moi job chay tren 1 runner (may ao) doc lap. Moi job gom nhieu **steps** — cac buoc thuc hien tuan tu. Step co the **uses** (dung action co san tu Marketplace) hoac **run** (chay lenh shell truc tiep). Jobs mac dinh chay song song; dung **needs** de dinh nghia thu tu phu thuoc.

### Cau 3: Matrix strategy la gi? Cho vi du.

**Tra loi:** Matrix strategy cho phep chay cung 1 job tren nhieu cau hinh dong thoi. Vi du: test ung dung tren 3 phien ban Node.js (18, 20, 22) va 2 OS (Ubuntu, Windows) — tao ra 6 jobs song song. Dinh nghia bang `strategy.matrix` trong workflow. Co the dung `exclude` de loai bo cau hinh cu the va `include` de them cau hinh dac biet. `fail-fast: false` dam bao cac job khac van chay khi 1 job fail.

### Cau 4: Lam sao bao ve nhanh main bang GitHub Actions?

**Tra loi:** Ket hop **branch protection rules** voi **required status checks**: (1) Trong repo Settings, tao branch protection rule cho main, (2) Bat "Require status checks to pass before merging" va chon cac CI jobs can pass (vi du "Lint & Test", "Build"), (3) Bat "Require pull request reviews" de bat buoc it nhat 1 nguoi review, (4) Bat "Require branches to be up to date" de dam bao PR da cap nhat voi main moi nhat. Ket qua: khong ai co the merge PR khi CI do hoac chua co approval.

### Cau 5: So sanh GitHub Actions voi Jenkins. Khi nao chon cai nao?

**Tra loi:** **GitHub Actions** la CI/CD native cua GitHub, YAML config, hosted runners (khong can quan ly server), marketplace nhieu actions san, mien phi cho repo public. **Jenkins** la self-hosted, Groovy Jenkinsfile, can quan ly server rieng, nhieu plugins, linh hoat hon nhung phuc tap hon. Chon GitHub Actions khi: du an tren GitHub, muon don gian va nhanh, khong muon quan ly infrastructure. Chon Jenkins khi: can chay on-premise (khong dung cloud), can tuy bien cao, da co Jenkins infrastructure, hoac can chay tren nhieu Git platforms (GitLab, Bitbucket).

---

## 16. Tom tat

```
+--------------------------------------------------------------+
|  CI/CD — Tu dong hoa kiem tra va deploy code                 |
|  CI: lint → test → build (moi khi push/PR)                   |
|  CD: build → staging → production (khi merge vao main)       |
+--------------------------------------------------------------+
|  GitHub Actions:                                             |
|  - File: .github/workflows/*.yml                             |
|  - Trigger: push, pull_request, schedule, workflow_dispatch  |
|  - Cau truc: workflow → jobs → steps                         |
+--------------------------------------------------------------+
|  Best practices:                                             |
|  - Cache dependencies (tang toc 60%)                         |
|  - Matrix strategy (test nhieu version)                      |
|  - Branch protection + required checks                       |
|  - Secrets cho gia tri nhay cam                              |
|  - needs: de dinh nghia thu tu jobs                          |
+--------------------------------------------------------------+
```
