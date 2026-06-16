---
sidebar_position: 5
title: "5. CI/CD cơ bản với GitHub Actions"
---

# CI/CD cơ bản với GitHub Actions

Bạn đã biết cách viết code, tạo branch, merge PR. Nhưng ai sẽ **kiểm tra code có lỗi không** trước khi merge? Ai sẽ **build và deploy** sau khi merge? Nếu làm thủ công -> chậm, dễ sai, không nhất quán. Đây là lúc **CI/CD** và **GitHub Actions** vào cuộc. Bài này sẽ giúp bạn hiểu CI/CD là gì, và hướng dẫn bạn xây dựng pipeline đầu tiên với GitHub Actions từ A đến Z.

---

## Mục lục

- [Vì sao cần CI/CD?](#vì-sao-cần-cicd)
- [1. CI/CD là gì?](#1-cicd-là-gì)
- [2. GitHub Actions Overview](#2-github-actions-overview)
- [3. Triggers (Events)](#3-triggers-events)
- [4. Ví dụ Workflow Node.js (đầy đủ)](#4-ví-dụ-workflow-nodejs-đầy-đủ)
- [5. Ví dụ Workflow Java](#5-ví-dụ-workflow-java)
- [6. Environment Variables và Secrets](#6-environment-variables-và-secrets)
- [7. Matrix Strategy — Test nhiều version](#7-matrix-strategy-test-nhiều-version)
- [8. Caching — Tăng tốc Pipeline](#8-caching-tăng-tốc-pipeline)
- [9. Artifacts — Lưu kết quả](#9-artifacts-lưu-kết-quả)
- [10. Branch Protection + Required Checks](#10-branch-protection-required-checks)
- [11. Deploy Workflow cơ bản](#11-deploy-workflow-cơ-bản)
- [12. GitHub Actions Marketplace — Popular Actions](#12-github-actions-marketplace-popular-actions)
- [13. Bảng tổng hợp Syntax YAML quan trọng](#13-bảng-tổng-hợp-syntax-yaml-quan-trọng)
- [14. Lỗi thường gặp](#14-lỗi-thường-gặp)
- [15. Câu hỏi phỏng vấn](#15-câu-hỏi-phỏng-vấn)
- [16. Tóm tắt](#16-tóm-tắt)

---

## Vì sao cần CI/CD?

**Vấn đề:** Sau mỗi thay đổi, mỗi người tự chạy test/build/deploy **thủ công** — hay quên, mỗi người làm một kiểu, lỗi lọt vào main vì không ai chạy test:

```yaml
# "Quy trình" thủ công, dựa vào trí nhớ từng người
# 1. Sửa code xong... có nhớ chạy test không?
# - npm run lint    ← Người A quên chạy
# - npm test        ← Người B chạy thiếu
# - npm run build   ← Người C build máy mình OK, máy khác fail
# 2. Deploy bằng tay: SSH lên server, copy file, restart...
#    → dễ sai từng bước, tốn 2-3 giờ mỗi lần
# Hậu quả: lỗi phát hiện muộn (tới khi lên prod) → rất tốn kém để sửa
```

**Giải pháp:** Dùng **CI/CD** để máy tự động làm thay con người, nhất quán mỗi lần:

```yaml
# .github/workflows/ci.yml — chạy TỰ ĐỘNG theo sự kiện git
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint   # CI tự lint mỗi lần, không ai quên
      - run: npm test       # CI tự test → bắt lỗi sớm, main luôn xanh
      - run: npm run build   # Build môi trường chuẩn, hết "máy tôi chạy được"
# CI (Continuous Integration): tự build + test mỗi khi push/PR
# CD (Continuous Delivery/Deployment): tự đóng gói và deploy
```

:::tip[Dùng thực tế]

- Tự chạy **test + lint trên mỗi PR** → biết ngay code có lỗi không trong vài phút.
- **Chặn merge** vào main khi CI đỏ → giữ nhánh chính luôn sạch, chạy được.
- Tự **build và deploy** mỗi khi merge vào main → ship nhanh, hết deploy tay.
- Tự **publish package / Docker image** khi gắn tag release → nhất quán, không sai thủ công.

:::

---

## 1. CI/CD là gì?

### 1.1. Continuous Integration (CI)

CI là quy trình **tự động kiểm tra code** mỗi khi developer push hoặc tạo PR.

```
  Developer push code
        |
        v
  +------------------+
  |  CI Pipeline     |
  |  1. Lint check   |  ← Code có đúng format?
  |  2. Unit tests   |  ← Logic có đúng?
  |  3. Build        |  ← Code có compile được?
  |  4. Integration  |  ← Các phần có làm việc cùng nhau?
  +------------------+
        |
    +---+---+
    |       |
  PASS    FAIL
    |       |
  Merge   Fix code
  allowed  trước
```

**Không có CI:**

- Developer A push code lỗi -> không ai biết
- Developer B pull code -> "Tại sao code của tôi không chạy?"
- Chiều thứ 6, toàn team mất 3 giờ debug code của A

**Có CI:**

- Developer A push code lỗi -> CI báo lỗi ngay trong 5 phút
- Developer A fix trước khi bất kỳ ai bị ảnh hưởng
- Team luôn có code base sạch, chạy được

### 1.2. Continuous Deployment / Delivery (CD)

```
  CI thành công (code đã kiểm tra)
        |
        v
  +---------------------+
  |  CD Pipeline        |
  |  1. Build artifact  |  ← Tạo bản build
  |  2. Deploy staging  |  ← Test trên môi trường giống production
  |  3. Smoke tests     |  ← Kiểm tra cơ bản trên staging
  |  4. Deploy prod     |  ← Lên production
  +---------------------+
```

| Khái niệm                 | Giải thích                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| **Continuous Delivery**   | Tự động build và chuẩn bị deploy, nhưng **cần người bấm nút** để deploy lên production              |
| **Continuous Deployment** | Tự động deploy lên production **không cần người bấm nút** — mỗi commit qua test -> tự động lên prod |

### 1.3. Tại sao CI/CD quan trọng?

| Lợi ích           | Không có CI/CD             | Có CI/CD                   |
| ----------------- | -------------------------- | -------------------------- |
| **Phát hiện lỗi** | Thứ 6 mới biết             | 5 phút sau khi push        |
| **Deploy**        | Thủ công, mất 2-3 giờ      | Tự động, 10-15 phút        |
| **Nhất quán**     | "Works on my machine"      | Môi trường giống nhau      |
| **Tự tin**        | "Không dám merge, sợ hỏng" | "CI xanh, merge thoải mái" |
| **Tốc độ ship**   | 1-2 lần/tháng              | Nhiều lần/ngày             |

---

## 2. GitHub Actions Overview

### 2.1. Các khái niệm cơ bản

```
+-------------------------------------------------------+
|  GitHub Actions Hierarchy                             |
+-------------------------------------------------------+
|                                                       |
|  Workflow (.yml file)                                 |
|  |                                                    |
|  +-- Job 1 (chạy trên 1 máy ảo)                     |
|  |   |                                               |
|  |   +-- Step 1: Checkout code                       |
|  |   +-- Step 2: Setup Node.js                       |
|  |   +-- Step 3: Install dependencies                |
|  |   +-- Step 4: Run tests                           |
|  |                                                    |
|  +-- Job 2 (chạy trên máy ảo khác, có thể song song) |
|      |                                               |
|      +-- Step 1: Checkout code                       |
|      +-- Step 2: Build                               |
|      +-- Step 3: Deploy                              |
+-------------------------------------------------------+
```

| Khái niệm         | Giải thích                            | Ví dụ                           |
| ----------------- | ------------------------------------- | ------------------------------- |
| **Workflow**      | File YAML định nghĩa toàn bộ pipeline | `.github/workflows/ci.yml`      |
| **Event/Trigger** | Sự kiện kích hoạt workflow            | push, pull_request, schedule    |
| **Job**           | Nhóm các bước chạy trên 1 runner      | test, build, deploy             |
| **Step**          | 1 bước cụ thể trong job               | checkout, install, run tests    |
| **Action**        | Bước được đóng gói sẵn, tái sử dụng   | `actions/checkout@v4`           |
| **Runner**        | Máy ảo chạy job                       | `ubuntu-latest`, `macos-latest` |

### 2.2. Cấu trúc file workflow

Workflow files nằm trong `.github/workflows/`:

```
my-project/
├── .github/
│   └── workflows/
│       ├── ci.yml          ← Chạy khi push/PR
│       ├── deploy.yml      ← Chạy khi merge vào main
│       └── scheduled.yml   ← Chạy theo lịch
├── src/
├── tests/
└── package.json
```

---

## 3. Triggers (Events)

### 3.1. Các trigger phổ biến

```yaml
# Trigger khi push lên bất kỳ branch nào
on: push

# Trigger khi push lên branch cụ thể
on:
  push:
    branches: [main, develop]

# Trigger khi tạo PR vào main
on:
  pull_request:
    branches: [main]

# Trigger khi push HOẶC tạo PR
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

# Trigger theo lịch (cron)
on:
  schedule:
    - cron: '0 9 * * 1'  # Mỗi thứ Hai lúc 9:00 UTC
    # Phút Giờ Ngày Tháng Thứ
    # 0     9   *   *    1

# Trigger thủ công (bấm nút trên GitHub)
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

### 3.2. Lọc theo path (chỉ chạy khi file cụ thể thay đổi)

```yaml
on:
  push:
    branches: [main]
    paths:
      - "src/**" # Chỉ khi file trong src/ thay đổi
      - "tests/**" # Hoặc file trong tests/ thay đổi
      - "package.json" # Hoặc package.json thay đổi
    paths-ignore:
      - "**/*.md" # Bỏ qua file markdown
      - "docs/**" # Bỏ qua folder docs
```

---

## 4. Ví dụ Workflow Node.js (đầy đủ)

### 4.1. CI cơ bản

```yaml
# .github/workflows/ci.yml
name: CI

# Khi nào chạy?
on:
  push:
    branches: [main, develop] # Push lên main hoặc develop
  pull_request:
    branches: [main] # PR vào main

# Các job cần chạy
jobs:
  # Job 1: Lint và Test
  test:
    name: Lint & Test # Tên hiển thị trên GitHub
    runs-on: ubuntu-latest # Máy ảo Ubuntu mới nhất

    steps:
      # Bước 1: Lấy code từ repo
      - name: Checkout code
        uses: actions/checkout@v4

      # Bước 2: Cài đặt Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20" # Version Node.js
          cache: "npm" # Cache npm để tăng tốc

      # Bước 3: Cài đặt dependencies
      - name: Install dependencies
        run: npm ci
        # npm ci nhanh hơn npm install, dùng cho CI
        # Nó cài đặt chính xác theo package-lock.json

      # Bước 4: Kiểm tra code format
      - name: Lint
        run: npm run lint

      # Bước 5: Kiểm tra TypeScript types
      - name: Type check
        run: npm run typecheck

      # Bước 6: Chạy tests
      - name: Run tests
        run: npm test -- --coverage
        # --coverage: tạo báo cáo coverage

      # Bước 7: Upload coverage report
      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/ # Folder chứa coverage report

  # Job 2: Build
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test # Chỉ chạy SAU khi test PASS
    # needs: đảm bảo test pass trước khi build

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: build/ # Folder chứa kết quả build
```

### 4.2. Giải thích từng phần

```yaml
# name: Tên workflow — hiển thị trên GitHub Actions tab
name: CI

# on: Định nghĩa khi nào workflow chạy
on:
  push:
    branches: [main]

# jobs: Định nghĩa các công việc cần làm
jobs:
  test: # ID của job (bạn đặt tên)
    name: "Lint & Test" # Tên hiển thị (tùy chọn)
    runs-on: ubuntu-latest # Máy ảo chạy job

    steps: # Danh sách các bước
      - name: "Checkout" # Tên bước (tùy chọn)
        uses: actions/checkout@v4 # Dùng action có sẵn
        # uses: gọi action từ Marketplace

      - name: "Run tests"
        run: npm test # Chạy lệnh shell
        # run: chạy lệnh trực tiếp
```

---

## 5. Ví dụ Workflow Java

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

      # Cài đặt JDK
      - name: Setup JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: "21"
          distribution: "temurin" # Eclipse Temurin (miễn phí)
          cache: "maven" # Cache Maven dependencies

      # Build và test với Maven
      - name: Build with Maven
        run: mvn -B package --file pom.xml
        # -B: batch mode (không interactive)
        # package: compile + test + package

      # Hoặc nếu dùng Gradle
      # - name: Build with Gradle
      #   run: ./gradlew build

      # Upload test results
      - name: Upload test results
        if: always() # Chạy cả khi test FAIL
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: target/surefire-reports/
```

---

## 6. Environment Variables và Secrets

### 6.1. Environment Variables

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest

    # Biến môi trường cho toàn bộ job
    env:
      NODE_ENV: production
      API_URL: https://api.example.com

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # Biến môi trường cho 1 step cụ thể
      - name: Build
        run: npm run build
        env:
          REACT_APP_VERSION: ${{ github.sha }}
          # github.sha: hash của commit hiện tại

      # Sử dụng biến trong command
      - name: Print info
        run: |
          echo "Branch: ${{ github.ref_name }}"
          echo "Commit: ${{ github.sha }}"
          echo "Actor: ${{ github.actor }}"
          echo "Node env: $NODE_ENV"
```

### 6.2. Secrets (bí mật)

Secrets là các giá trị nhạy cảm (API keys, passwords) được mã hóa và chỉ giải mã khi chạy workflow.

```bash
# Thiết lập secret trên GitHub:
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
        # secrets.DEPLOY_TOKEN: lấy giá trị từ GitHub Secrets
        # Giá trị này KHÔNG hiển thị trong logs

      - name: Docker login
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | \
            docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
```

**Lưu ý quan trọng:**

- Secrets được **mã hóa** và chỉ giải mã khi chạy
- Secrets **KHÔNG** hiển thị trong logs (được mask bằng `***`)
- Forked repos **KHÔNG** truy cập được secrets của repo gốc (bảo mật)

---

## 7. Matrix Strategy — Test nhiều version

Matrix cho phép bạn **chạy cùng 1 job trên nhiều cấu hình** đồng thời:

```yaml
jobs:
  test:
    name: Test on Node ${{ matrix.node-version }}
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        # Chạy trên 3 OS x 3 Node versions = 9 jobs song song
        os: [ubuntu-latest, macos-latest, windows-latest]
        node-version: [18, 20, 22]

        # Loại trừ cấu hình cụ thể
        exclude:
          - os: macos-latest
            node-version: 18 # Không test Node 18 trên macOS

        # Thêm cấu hình đặc biệt
        include:
          - os: ubuntu-latest
            node-version: 20
            experimental: true # Thêm biến tùy chọn

      fail-fast: false # Không dừng các job khác nếu 1 job fail

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
Kết quả trên GitHub: 9 jobs chạy song song
+-----------+----------+----------+----------+
|           | Node 18  | Node 20  | Node 22  |
+-----------+----------+----------+----------+
| Ubuntu    |   PASS   |   PASS   |   PASS   |
| macOS     |    —     |   PASS   |   PASS   |
| Windows   |   PASS   |   PASS   |   FAIL   |
+-----------+----------+----------+----------+
```

---

## 8. Caching — Tăng tốc Pipeline

Caching lưu lại dependencies để không phải download lại mỗi lần:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Cách 1: Cache tích hợp trong setup-node (đơn giản nhất)
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm" # Tự động cache node_modules

      # Cách 2: Cache thủ công (linh hoạt hơn)
      - name: Cache node_modules
        uses: actions/cache@v4
        with:
          path: node_modules # Folder cần cache
          key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
          # Key duy nhất dựa trên OS và nội dung package-lock.json
          # Khi package-lock.json thay đổi → cache miss → cài lại
          restore-keys: |
            ${{ runner.os }}-node-
            # Nếu không tìm thấy key chính xác, thử key gần giống

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
```

**So sánh tốc độ:**

```
Không có cache:
  Install dependencies: 45 giây (download từ npm registry)
  Tổng: ~2 phút

Có cache (cache hit):
  Restore cache: 5 giây
  Install dependencies: 3 giây (chỉ verify, không download)
  Tổng: ~45 giây

Tiết kiệm: ~60% thời gian!
```

---

## 9. Artifacts — Lưu kết quả

Artifacts là các file được tạo trong workflow mà bạn muốn giữ lại:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm test -- --coverage

      # Upload coverage report
      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        if: always() # Upload cả khi test fail
        with:
          name: coverage-report
          path: coverage/
          retention-days: 30 # Giữ 30 ngày

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
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
      # Download build artifact từ job trước
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

Kết hợp CI với branch protection để đảm bảo code trên main luôn sạch:

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
# Thiết lập bằng GitHub CLI
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["CI / Lint & Test","CI / Build"]}' \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field enforce_admins=true
```

**Kết quả:** Không ai có thể merge PR vào main khi:

- CI chưa pass (đỏ)
- Chưa có ít nhất 1 approval
- Branch chưa cập nhật với main mới nhất

---

## 11. Deploy Workflow cơ bản

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main] # Chỉ deploy khi merge vào main

jobs:
  # Bước 1: Test
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm test

  # Bước 2: Build
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test # Đợi test pass
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: build/

  # Bước 3: Deploy to staging
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    environment: staging # GitHub Environment (có thể thêm approval)
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-output
          path: ./build
      - name: Deploy to staging
        run: |
          echo "Deploying to staging..."
          # Ví dụ: deploy lên Vercel, Netlify, AWS, etc.

  # Bước 4: Deploy to production (cần approval)
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: deploy-staging
    environment: production # Có thể cấu hình required reviewers
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
                                    (người review bấm "Approve")
```

---

## 12. GitHub Actions Marketplace — Popular Actions

| Action                           | Mục đích              | Sử dụng                     |
| -------------------------------- | --------------------- | --------------------------- |
| `actions/checkout@v4`            | Lấy code từ repo      | Hầu như mọi workflow        |
| `actions/setup-node@v4`          | Cài đặt Node.js       | Dự án JavaScript/TypeScript |
| `actions/setup-java@v4`          | Cài đặt JDK           | Dự án Java                  |
| `actions/setup-python@v5`        | Cài đặt Python        | Dự án Python                |
| `actions/cache@v4`               | Cache files           | Tăng tốc pipeline           |
| `actions/upload-artifact@v4`     | Upload kết quả        | Lưu build output, reports   |
| `actions/download-artifact@v4`   | Download từ job trước | Deploy artifacts            |
| `softprops/action-gh-release@v2` | Tạo GitHub Release    | Release tự động             |
| `codecov/codecov-action@v4`      | Upload code coverage  | Theo dõi test coverage      |
| `docker/build-push-action@v5`    | Build và push Docker  | Container deployment        |

---

## 13. Bảng tổng hợp Syntax YAML quan trọng

| Syntax             | Mục đích                | Ví dụ                                 |
| ------------------ | ----------------------- | ------------------------------------- |
| `name:`            | Tên workflow/job/step   | `name: CI Pipeline`                   |
| `on:`              | Trigger events          | `on: push`, `on: pull_request`        |
| `jobs:`            | Định nghĩa các jobs     | `jobs: test: ...`                     |
| `runs-on:`         | Máy ảo chạy job         | `runs-on: ubuntu-latest`              |
| `steps:`           | Danh sách bước          | `steps: - name: ...`                  |
| `uses:`            | Dùng action có sẵn      | `uses: actions/checkout@v4`           |
| `run:`             | Chạy lệnh shell         | `run: npm test`                       |
| `with:`            | Tham số cho action      | `with: node-version: '20'`            |
| `env:`             | Biến môi trường         | `env: NODE_ENV: production`           |
| `if:`              | Điều kiện chạy          | `if: github.ref == 'refs/heads/main'` |
| `needs:`           | Phụ thuộc job khác      | `needs: test`                         |
| `strategy.matrix:` | Chạy nhiều cấu hình     | `matrix: node: [18, 20]`              |
| `secrets.*`        | Truy cập secrets        | `${{ secrets.API_KEY }}`              |
| `github.*`         | Thông tin sự kiện       | `${{ github.sha }}`                   |
| `always()`         | Luôn chạy (cả khi fail) | `if: always()`                        |
| `failure()`        | Chỉ chạy khi fail       | `if: failure()`                       |
| `success()`        | Chỉ chạy khi pass       | `if: success()`                       |

---

## 14. Lỗi thường gặp

### Lỗi 1: Workflow không chạy

```yaml
# SAI: file không đúng vị trí
# workflows/ci.yml         ← KHÔNG được!
# .github/ci.yml           ← KHÔNG được!

# ĐÚNG: phải đúng chính xác
# .github/workflows/ci.yml ← ĐÚNG!

# Kiểm tra:
# 1. File có nằm trong .github/workflows/?
# 2. File có đuôi .yml hoặc .yaml?
# 3. YAML syntax có đúng không?
# 4. Trigger có khớp với sự kiện không?
```

### Lỗi 2: npm ci fail vì thiếu package-lock.json

```bash
# npm ci YÊU CẦU package-lock.json tồn tại trong repo
# Nếu bạn có .gitignore bỏ qua nó → CI sẽ fail

# ĐÚNG: KHÔNG ignore package-lock.json
# File .gitignore:
node_modules/          # Ignore node_modules
# package-lock.json    ← KHÔNG ignore file này!
```

### Lỗi 3: Secrets bị lộ trong logs

```yaml
# SAI: In secret ra log
- name: Debug
  run: echo "Token: ${{ secrets.DEPLOY_TOKEN }}"
  # GitHub sẽ mask thành ***, nhưng vẫn nguy hiểm nếu dùng sai

# SAI: Truyền secret qua URL
- name: Deploy
  run: curl "https://api.example.com?token=${{ secrets.API_KEY }}"
  # URL có thể hiển thị trong logs!

# ĐÚNG: Dùng environment variable hoặc header
- name: Deploy
  run: |
    curl -X POST https://api.example.com/deploy \
      -H "Authorization: Bearer $DEPLOY_TOKEN"
  env:
    DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

### Lỗi 4: Job không đợi job trước

```yaml
# SAI: deploy chạy song song với test (không đợi)
jobs:
  test:
    runs-on: ubuntu-latest
    steps: ...
  deploy:
    runs-on: ubuntu-latest
    steps: ...
    # Deploy có thể chạy trước khi test pass!

# ĐÚNG: dùng needs để định nghĩa thứ tự
jobs:
  test:
    runs-on: ubuntu-latest
    steps: ...
  deploy:
    runs-on: ubuntu-latest
    needs: test              # ĐỢI test pass trước
    steps: ...
```

### Lỗi 5: Cache không hoạt động

```yaml
# SAI: Key không thay đổi khi dependencies thay đổi
- uses: actions/cache@v4
  with:
    path: node_modules
    key: my-cache # Key cố định → luôn dùng cache cũ!

# ĐÚNG: Key thay đổi khi package-lock.json thay đổi
- uses: actions/cache@v4
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
    # hashFiles: tạo hash từ nội dung file
    # Khi dependencies thay đổi → hash khác → cache miss → cài mới
```

---

## 15. Câu hỏi phỏng vấn

### Câu 1: CI/CD là gì? Phân biệt Continuous Integration, Continuous Delivery và Continuous Deployment.

**Trả lời:** **CI (Continuous Integration)** là quy trình tự động kiểm tra code (lint, test, build) mỗi khi developer push code, đảm bảo code base luôn ở trạng thái hoạt động. **Continuous Delivery** là tự động hóa toàn bộ quy trình từ code đến sẵn sàng deploy, nhưng cần người bấm nút để deploy lên production. **Continuous Deployment** tiến xa hơn — tự động deploy lên production mỗi khi code pass tất cả tests, không cần sự can thiệp của con người.

### Câu 2: Giải thích cấu trúc của 1 GitHub Actions workflow.

**Trả lời:** Một workflow gồm: (1) **name** — tên workflow, (2) **on** — trigger events (push, pull_request, schedule), (3) **jobs** — các công việc cần thực hiện, mỗi job chạy trên 1 runner (máy ảo) độc lập. Mỗi job gồm nhiều **steps** — các bước thực hiện tuần tự. Step có thể **uses** (dùng action có sẵn từ Marketplace) hoặc **run** (chạy lệnh shell trực tiếp). Jobs mặc định chạy song song; dùng **needs** để định nghĩa thứ tự phụ thuộc.

### Câu 3: Matrix strategy là gì? Cho ví dụ.

**Trả lời:** Matrix strategy cho phép chạy cùng 1 job trên nhiều cấu hình đồng thời. Ví dụ: test ứng dụng trên 3 phiên bản Node.js (18, 20, 22) và 2 OS (Ubuntu, Windows) — tạo ra 6 jobs song song. Định nghĩa bằng `strategy.matrix` trong workflow. Có thể dùng `exclude` để loại bỏ cấu hình cụ thể và `include` để thêm cấu hình đặc biệt. `fail-fast: false` đảm bảo các job khác vẫn chạy khi 1 job fail.

### Câu 4: Làm sao bảo vệ nhánh main bằng GitHub Actions?

**Trả lời:** Kết hợp **branch protection rules** với **required status checks**: (1) Trong repo Settings, tạo branch protection rule cho main, (2) Bật "Require status checks to pass before merging" và chọn các CI jobs cần pass (ví dụ "Lint & Test", "Build"), (3) Bật "Require pull request reviews" để bắt buộc ít nhất 1 người review, (4) Bật "Require branches to be up to date" để đảm bảo PR đã cập nhật với main mới nhất. Kết quả: không ai có thể merge PR khi CI đỏ hoặc chưa có approval.

### Câu 5: So sánh GitHub Actions với Jenkins. Khi nào chọn cái nào?

**Trả lời:** **GitHub Actions** là CI/CD native của GitHub, YAML config, hosted runners (không cần quản lý server), marketplace nhiều actions sẵn, miễn phí cho repo public. **Jenkins** là self-hosted, Groovy Jenkinsfile, cần quản lý server riêng, nhiều plugins, linh hoạt hơn nhưng phức tạp hơn. Chọn GitHub Actions khi: dự án trên GitHub, muốn đơn giản và nhanh, không muốn quản lý infrastructure. Chọn Jenkins khi: cần chạy on-premise (không dùng cloud), cần tùy biến cao, đã có Jenkins infrastructure, hoặc cần chạy trên nhiều Git platforms (GitLab, Bitbucket).

---

## 16. Tóm tắt

```
+--------------------------------------------------------------+
|  CI/CD — Tự động hóa kiểm tra và deploy code                 |
|  CI: lint → test → build (mỗi khi push/PR)                   |
|  CD: build → staging → production (khi merge vào main)       |
+--------------------------------------------------------------+
|  GitHub Actions:                                             |
|  - File: .github/workflows/*.yml                             |
|  - Trigger: push, pull_request, schedule, workflow_dispatch  |
|  - Cấu trúc: workflow → jobs → steps                         |
+--------------------------------------------------------------+
|  Best practices:                                             |
|  - Cache dependencies (tăng tốc 60%)                         |
|  - Matrix strategy (test nhiều version)                      |
|  - Branch protection + required checks                       |
|  - Secrets cho giá trị nhạy cảm                              |
|  - needs: để định nghĩa thứ tự jobs                          |
+--------------------------------------------------------------+
```
