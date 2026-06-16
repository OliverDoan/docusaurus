---
sidebar_position: 2
title: "2. GitHub Flow và Trunk-Based Development"
---

# GitHub Flow và Trunk-Based Development

Git Flow mạnh mẽ nhưng phức tạp. Nhiều team — đặc biệt những team deploy liên tục — cần một quy trình nhẹ hơn. Bài này giới thiệu 2 mô hình phổ biến thay thế Git Flow: **GitHub Flow** (đơn giản, hiệu quả cho hầu hết dự án) và **Trunk-Based Development** (tiêu chuẩn vàng của các ông lớn như Google, Facebook). Bạn sẽ hiểu mỗi mô hình hoạt động ra sao, ưu nhược điểm, và khi nào nên chọn cái nào.

---

## Mục lục

- [Vì sao có GitHub Flow & Trunk-based?](#vì-sao-có-github-flow--trunk-based)
- [1. GitHub Flow](#1-github-flow)
- [2. Trunk-Based Development (TBD)](#2-trunk-based-development-tbd)
- [3. So sánh chi tiết: Git Flow vs GitHub Flow vs TBD](#3-so-sánh-chi-tiết-git-flow-vs-github-flow-vs-tbd)
- [4. Lỗi thường gặp](#4-lỗi-thường-gặp)
- [5. Chuyển đổi giữa các mô hình](#5-chuyển-đổi-giữa-các-mô-hình)
- [6. Câu hỏi phỏng vấn](#6-câu-hỏi-phỏng-vấn)
- [7. Tóm tắt](#7-tóm-tắt)

---

## Vì sao có GitHub Flow & Trunk-based?

**Vấn đề:**

Git Flow với nhiều nhánh dài hạn (`develop`, `release`) trở nên nặng nề khi team triển khai liên tục (CD) nhiều lần mỗi ngày. Nhánh sống lâu khiến code drift xa nhau, merge khó, tích hợp muộn — dẫn tới "merge hell". Quy trình lắm bước cũng làm chậm tốc độ ship.

**Giải pháp:**

Hai quy trình gọn nhẹ hợp với CI/CD ra đời:

- **GitHub Flow** — chỉ giữ `main` cộng các feature branch ngắn: tạo branch → PR → merge → deploy ngay.
- **Trunk-based** — commit thẳng vào trunk (hoặc branch siêu ngắn < 1 ngày), tích hợp liên tục, dùng feature flag để giấu phần việc chưa xong.

Cả hai đề cao tích hợp sớm và deploy nhanh, tránh tích lũy thay đổi quá lớn.

:::tip[Dùng thực tế]

- SaaS deploy nhiều lần/ngày: nhánh ngắn merge nhanh, không chờ chu kỳ release.
- Tính năng còn dở: bọc trong feature flag, merge vào main mà user không thấy.
- Team nhỏ muốn quy trình đơn giản: GitHub Flow chỉ có main + feature branch.
- Đội theo CD nghiêm túc: Trunk-based giúp main luôn ở trạng thái deployable.

:::

---

## 1. GitHub Flow

### 1.1. GitHub Flow là gì?

GitHub Flow là mô hình branching **cực kỳ đơn giản** được GitHub giới thiệu. Chỉ có **1 quy tắc cốt lõi**: nhánh `main` luôn ở trạng thái deployable (có thể deploy bất kỳ lúc nào).

```
+--------------------------------------------------+
|           GITHUB FLOW — Chỉ có 6 bước            |
+--------------------------------------------------+
|  1. Tạo branch từ main                           |
|  2. Thêm commits                                 |
|  3. Mở Pull Request                              |
|  4. Review và thảo luận                          |
|  5. Merge vào main                               |
|  6. Deploy                                       |
+--------------------------------------------------+
```

### 1.2. Workflow chi tiết

```
  main:  ---o---o---o-------o---o-------o---o----->
              \     |      / \   \     /
  branch:      o---o---o--o   o---o---o
              feature/login  fix/header-bug
              |           |
              PR created  PR merged + deployed
```

**Bước 1: Tạo branch từ main**

```bash
# Luôn bắt đầu từ main mới nhất
git checkout main
git pull origin main

# Tạo branch với tên mô tả
git checkout -b feature/add-search-bar
# Hoặc: fix/broken-nav-link
# Hoặc: docs/update-readme
```

**Bước 2: Code và commit**

```bash
# Làm việc bình thường, commit thường xuyên
git add src/components/SearchBar.tsx
git commit -m "feat: add search bar component"

git add src/pages/Home.tsx
git commit -m "feat: integrate search bar into home page"

git add tests/SearchBar.test.tsx
git commit -m "test: add search bar unit tests"
```

**Bước 3: Push và tạo Pull Request**

```bash
# Push branch lên remote
git push -u origin feature/add-search-bar
```

Trên GitHub, tạo Pull Request (PR) với:

- **Title** ngắn gọn, rõ ý
- **Description** mô tả thay đổi, tại sao, cách test
- **Reviewers** — chỉ định người review
- **Labels** — feature, bug, docs...

**Bước 4: Review và thảo luận**

```
+---------------------------------------------+
|  Pull Request #42: Add search bar           |
+---------------------------------------------+
|  alice: "Nên thêm debounce cho search"      |
|  bob: "LGTM, đã test trên staging"          |
|  CI: All checks passed (green)              |
|  Review: 2/2 approved                       |
+---------------------------------------------+
```

- Team member review code, để lại comment
- CI/CD chạy tự động: lint, test, build
- Tác giả fix feedback, push commit mới
- Khi đủ approval và CI xanh -> sẵn sàng merge

**Bước 5: Merge vào main**

```bash
# Trên GitHub: click "Merge pull request"
# Hoặc dùng command line:
git checkout main
git pull origin main
git merge --no-ff feature/add-search-bar
git push origin main

# Xóa branch đã merge
git branch -d feature/add-search-bar
git push origin --delete feature/add-search-bar
```

**Bước 6: Deploy**

```bash
# Trong GitHub Flow, merge vào main = deploy
# Thường thông qua CI/CD tự động:
#   main merge → trigger pipeline → deploy to production
```

### 1.3. Các kiểu Merge trong GitHub Flow

Khi merge PR trên GitHub, bạn có 3 lựa chọn:

| Kiểu Merge           | Cách hoạt động                       | Khi nào dùng                                |
| -------------------- | ------------------------------------ | ------------------------------------------- |
| **Merge commit**     | Tạo merge commit, giữ tất cả commits | Muốn giữ lịch sử đầy đủ                     |
| **Squash and merge** | Gộp tất cả commits thành 1           | Feature nhỏ, muốn lịch sử gọn               |
| **Rebase and merge** | Đặt lại commits lên đầu main         | Muốn lịch sử tuyến tính, không merge commit |

```bash
# Squash merge — phổ biến nhất trong GitHub Flow
# 5 commits trên feature branch → 1 commit trên main
git checkout main
git merge --squash feature/add-search-bar
git commit -m "feat: add search bar with debounce (#42)"
```

### 1.4. Ưu nhược điểm của GitHub Flow

**Ưu điểm:**

| Ưu điểm             | Chi tiết                                          |
| ------------------- | ------------------------------------------------- |
| **Cực kỳ đơn giản** | Chỉ 1 nhánh chính, 1 loại branch phụ              |
| **CI/CD friendly**  | Merge = deploy, phù hợp continuous deployment     |
| **Code review tốt** | Mọi thay đổi đều qua PR review                    |
| **Linh hoạt**       | Không giới hạn tên branch, không quy tắc phức tạp |
| **Nhanh**           | Ít bước, ít ceremony, ship nhanh                  |

**Nhược điểm:**

| Nhược điểm                     | Chi tiết                                            |
| ------------------------------ | --------------------------------------------------- |
| **Không hỗ trợ nhiều version** | Chỉ 1 nhánh main, không có develop/release          |
| **Cần CI/CD tốt**              | Nếu không có CI, code lỗi có thể lên production     |
| **Không có staging riêng**     | Không có release branch để test trước               |
| **Khó rollback**               | Nếu deploy lỗi, phải fix forward hoặc revert commit |

---

## 2. Trunk-Based Development (TBD)

### 2.1. TBD là gì?

Trunk-Based Development là mô hình mà **tất cả developer commit trực tiếp vào 1 nhánh chính** (trunk, thường là `main`). Không có long-lived branches. Nếu có branch thì chỉ **sống dưới 1 ngày** (short-lived).

```
+----------------------------------------------------------+
|            TRUNK-BASED DEVELOPMENT                       |
+----------------------------------------------------------+
|                                                          |
|  main:  --o--o--o--o--o--o--o--o--o--o--o--o--o-->       |
|            |     |        |     |                        |
|            A     B        A     C    (developers)        |
|                                                          |
|  Hoặc với short-lived branches (< 1 ngày):               |
|                                                          |
|  main:  --o--o--o-----o--o-----o--o--o--o--o-->          |
|               \  |   / \  |   /                          |
|  branch:       o-o--o    o-o--o                          |
|               (< 24h)   (< 24h)                          |
+----------------------------------------------------------+
```

### 2.2. Nguyên tắc cốt lõi

```
+-------------------------------------------+
|  Quy tắc TBD:                             |
|  1. Mọi người làm việc trên main          |
|  2. Commit nhỏ, thường xuyên (nhiều lần/  |
|     ngày)                                 |
|  3. Branch (nếu có) < 1 ngày              |
|  4. Không long-lived feature branches     |
|  5. Feature chưa hoàn thành → Feature     |
|     Flag                                  |
|  6. CI chạy cho mọi commit                |
|  7. Main luôn deployable                  |
+-------------------------------------------+
```

### 2.3. Workflow chi tiết

**Cách 1: Commit trực tiếp vào main**

```bash
# Cách này phổ biến ở team nhỏ, tin tưởng cao
git checkout main
git pull origin main

# Làm thay đổi nhỏ, có focus
git add src/utils/formatDate.ts
git commit -m "feat: add relative date formatting"
git push origin main
# CI chạy tự động ngay khi push
```

**Cách 2: Short-lived branches (< 1 ngày)**

```bash
# Sáng: tạo branch
git checkout main
git pull origin main
git checkout -b alice/add-date-formatter

# Làm việc trong ngày
git add .
git commit -m "feat: add date formatter utility"
git add .
git commit -m "test: add date formatter tests"

# Chiều: push và tạo PR
git push -u origin alice/add-date-formatter
# Tạo PR, review nhanh, merge trong ngày

# KHÔNG để branch qua đêm!
```

### 2.4. Feature Flags — "Vũ khí bí mật" của TBD

Feature Flag (hay Feature Toggle) là cờ điều khiển bật/tắt tính năng mà **không cần deploy lại code**.

**Tại sao cần Feature Flags?**

Trong TBD, code chưa hoàn thành vẫn merge vào main. Nhưng bạn không muốn user thấy tính năng đang làm dở! Feature Flag giải quyết điều này.

```javascript
// Ví dụ Feature Flag đơn giản
const FEATURE_FLAGS = {
  NEW_SEARCH: false, // Đang phát triển, chưa bật
  DARK_MODE: true, // Đã hoàn thành, bật cho tất cả
  PREMIUM_PLAN: "beta", // Chỉ bật cho beta users
};

// Sử dụng trong code
function SearchBar() {
  // Kiểm tra flag trước khi hiển thị
  if (!FEATURE_FLAGS.NEW_SEARCH) {
    return <OldSearchBar />; // User thấy version cũ
  }
  return <NewSearchBar />; // Chỉ developer/tester thấy
}
```

```javascript
// Feature Flag nâng cao hơn với điều kiện
function getFeatureFlag(flagName, userId) {
  const flag = flags[flagName];

  // Tắt hoàn toàn
  if (flag === false) return false;

  // Bật hoàn toàn
  if (flag === true) return true;

  // Bật cho 1 nhóm cụ thể
  if (flag === "beta") {
    return betaUsers.includes(userId);
  }

  // Bật theo tỷ lệ (canary release)
  if (typeof flag === "number") {
    return hashUserId(userId) % 100 < flag; // flag = 10 → 10% user
  }

  return false;
}

// Sử dụng
if (getFeatureFlag("NEW_CHECKOUT", currentUser.id)) {
  // Hiển thị checkout mới
}
```

**Các công cụ Feature Flag phổ biến:**

| Tool                      | Miễn phí?    | Phù hợp                      |
| ------------------------- | ------------ | ---------------------------- |
| **LaunchDarkly**          | Có free tier | Enterprise, nhiều tính năng  |
| **Unleash**               | Open source  | Self-hosted, team trung bình |
| **Flagsmith**             | Open source  | Self-hosted hoặc cloud       |
| **Environment variables** | Miễn phí     | Dự án nhỏ, đơn giản          |
| **Config file**           | Miễn phí     | MVP, prototype               |

### 2.5. Yêu cầu để áp dụng TBD

```
+-----------------------------------------------------+
|  Yêu cầu tiên quyết cho TBD:                        |
+-----------------------------------------------------+
|  [x] CI/CD pipeline mạnh, chạy nhanh (< 10 phút)   |
|  [x] Test coverage cao (unit + integration)          |
|  [x] Code review nhanh (trong vòng vài giờ)          |
|  [x] Feature Flags infrastructure                    |
|  [x] Team có kỷ luật commit nhỏ, thường xuyên        |
|  [x] Monitoring và alerting tốt (biết lỗi ngay)      |
|  [x] Khả năng rollback nhanh                         |
+-----------------------------------------------------+
```

### 2.6. Ưu nhược điểm của TBD

**Ưu điểm:**

| Ưu điểm                   | Chi tiết                                  |
| ------------------------- | ----------------------------------------- |
| **Không merge conflict**  | Không có long-lived branch -> không drift |
| **CI liên tục**           | Mọi commit được test ngay                 |
| **Deploy nhanh**          | Main luôn sẵn sàng deploy                 |
| **Đơn giản**              | Không cần nhớ quy trình phức tạp          |
| **Google, Facebook dùng** | Đã chứng minh hiệu quả ở quy mô lớn       |

**Nhược điểm:**

| Nhược điểm                     | Chi tiết                              |
| ------------------------------ | ------------------------------------- |
| **Yêu cầu CI/CD hoàn chỉnh**   | Không có CI -> disaster               |
| **Cần Feature Flags**          | Thêm độ phức tạp (flag debt)          |
| **Khó cho team mới**           | Junior developer có thể push code lỗi |
| **Cần review nhanh**           | Nếu review chậm -> block pipeline     |
| **Không hỗ trợ nhiều version** | Chỉ có 1 nhánh duy nhất               |

---

## 3. So sánh chi tiết: Git Flow vs GitHub Flow vs TBD

### 3.1. Bảng so sánh tổng hợp

| Tiêu chí             | Git Flow             | GitHub Flow        | Trunk-Based               |
| -------------------- | -------------------- | ------------------ | ------------------------- |
| **Số nhánh**         | 5 loại               | 2 (main + feature) | 1 (main)                  |
| **Độ phức tạp**      | Cao                  | Thấp               | Rất thấp                  |
| **Phù hợp team**     | Lớn (>10)            | Trung bình (3-15)  | Mọi kích cỡ               |
| **Release cycle**    | Scheduled (2-4 tuần) | Bất kỳ lúc nào     | Liên tục (nhiều lần/ngày) |
| **CI/CD yêu cầu**    | Thấp                 | Trung bình         | Rất cao                   |
| **Feature branches** | Long-lived           | Medium (vài ngày)  | Không hoặc < 1 ngày       |
| **Version support**  | Nhiều version        | 1 version          | 1 version                 |
| **Merge conflicts**  | Nhiều                | Ít                 | Rất ít                    |
| **Learning curve**   | Khó                  | Dễ                 | Dễ (nhưng cần kỷ luật)    |
| **Deploy frequency** | Thấp                 | Trung bình-cao     | Rất cao                   |
| **Rollback**         | Hotfix branch        | Revert commit      | Tắt feature flag          |

### 3.2. Chọn mô hình nào?

```
                    Chọn branching model
                    ====================

  Bạn deploy bao nhiêu lần?
  |
  +-- Vài lần/tháng (scheduled) --> Git Flow
  |
  +-- Vài lần/tuần               --> GitHub Flow
  |
  +-- Nhiều lần/ngày             --> Trunk-Based Development


  Team bao nhiêu người?
  |
  +-- 1-3 người  --> GitHub Flow hoặc TBD
  |
  +-- 3-10 người --> GitHub Flow
  |
  +-- 10+ người  --> Git Flow hoặc TBD (với Feature Flags)


  Dự án loại gì?
  |
  +-- Mobile app (iOS/Android)   --> Git Flow
  |
  +-- Web app (SaaS)             --> GitHub Flow hoặc TBD
  |
  +-- Library/SDK                --> Git Flow
  |
  +-- Internal tool              --> GitHub Flow
  |
  +-- Open source                --> GitHub Flow
```

### 3.3. Real-world examples

| Công ty                 | Mô hình        | Lý do                                           |
| ----------------------- | -------------- | ----------------------------------------------- |
| **Google**              | Trunk-Based    | Monorepo khổng lồ, CI cực mạnh, deploy liên tục |
| **Facebook**            | Trunk-Based    | Như Google, dùng Feature Flags nhiều            |
| **Netflix**             | Trunk-Based    | Microservices, deploy độc lập từng service      |
| **GitHub**              | GitHub Flow    | "Dogfooding" — dùng chính sản phẩm của mình     |
| **Linux Kernel**        | Giống Git Flow | Release versioned, nhiều maintainer             |
| **React (open source)** | GitHub Flow    | Open source, PR-driven development              |
| **Enterprise banks**    | Git Flow       | Compliance, audit trail, scheduled release      |

---

## 4. Lỗi thường gặp

### Lỗi 1: Dùng GitHub Flow nhưng không có CI

```bash
# Không có CI → code lỗi vẫn merge vào main → production bị lỗi
# GitHub Flow YÊU CẦU ít nhất:
# - Lint check tự động
# - Unit tests tự động
# - Build check tự động

# Giải pháp: thiết lập CI tối thiểu trước khi dùng GitHub Flow
# .github/workflows/ci.yml
```

### Lỗi 2: Branch tồn tại quá lâu trong GitHub Flow

```bash
# GitHub Flow branch nên sống < 1 tuần
# Nếu branch tồn tại > 2 tuần → merge conflict nightmare

# Giải pháp: break feature nhỏ hơn
# Thay vì: feature/complete-checkout-system (3 tuần)
# Làm: feature/checkout-ui (2 ngày)
#       feature/checkout-api (2 ngày)
#       feature/checkout-payment (3 ngày)
```

### Lỗi 3: Áp dụng TBD khi chưa sẵn sàng

```bash
# TBD không có CI/CD = phá hoại
# Kiểm tra trước khi chuyển sang TBD:
# 1. CI pipeline chạy < 10 phút? (KHÔNG: chưa sẵn sàng)
# 2. Test coverage > 70%? (KHÔNG: chưa sẵn sàng)
# 3. Có feature flag system? (KHÔNG: chưa sẵn sàng)
# 4. Team có kỷ luật commit nhỏ? (KHÔNG: cần training)
```

### Lỗi 4: Feature Flag debt

```javascript
// Feature Flag tồn tại mãi mãi → code trở nên khó hiểu

// SAI: Flag từ 2 năm trước vẫn còn
if (FEATURE_FLAGS.NEW_SEARCH_V2) {
  // Flag này từ 2022!
  return <NewSearch />;
}
return <OldSearch />; // Code này không bao giờ chạy nữa

// ĐÚNG: Dọn dẹp flag sau khi feature ổn định (2-4 tuần)
// Xóa flag, xóa code cũ, chỉ giữ code mới
return <NewSearch />;
```

### Lỗi 5: Không bảo vệ nhánh main

```bash
# Main phải được bảo vệ (branch protection):
# - Require pull request reviews (ít nhất 1 người)
# - Require status checks to pass (CI xanh)
# - Không cho push trực tiếp (trừ trường hợp TBD có CI chặt)

# Thiết lập trên GitHub:
# Settings → Branches → Branch protection rules → Add rule
# Branch name pattern: main
# [x] Require a pull request before merging
# [x] Require status checks to pass before merging
```

---

## 5. Chuyển đổi giữa các mô hình

### Từ Git Flow sang GitHub Flow

```bash
# Bước 1: Merge develop vào main (đảm bảo đồng bộ)
git checkout main
git merge develop

# Bước 2: Xóa nhánh develop
git branch -d develop
git push origin --delete develop

# Bước 3: Thiết lập CI/CD cho main
# Bước 4: Branch protection cho main
# Bước 5: Thông báo team quy trình mới:
#          main → feature branch → PR → review → merge → deploy
```

### Từ GitHub Flow sang TBD

```bash
# Bước 1: Thiết lập Feature Flag system
# Bước 2: Tăng CI speed (target < 10 phút)
# Bước 3: Tăng test coverage (target > 80%)
# Bước 4: Training team: commit nhỏ, thường xuyên
# Bước 5: Dần chuyển: feature branches < 1 ngày
# Bước 6: Cuối cùng: cho phép commit trực tiếp vào main
```

---

## 6. Câu hỏi phỏng vấn

### Câu 1: So sánh GitHub Flow và Git Flow. Khi nào chọn cái nào?

**Trả lời:** GitHub Flow chỉ có 1 nhánh chính (main) và feature branches ngắn hạn, phù hợp cho CI/CD continuous deployment, team trung bình, web app. Git Flow có 5 loại nhánh (main, develop, feature, release, hotfix), phù hợp cho scheduled release, team lớn, sản phẩm có version. Chọn GitHub Flow khi cần ship nhanh và đơn giản. Chọn Git Flow khi cần kiểm soát release chặt và hỗ trợ nhiều version.

### Câu 2: Trunk-Based Development là gì? Tại sao Google và Facebook dùng?

**Trả lời:** TBD là mô hình mà tất cả developer commit trực tiếp vào 1 nhánh chính (trunk/main), không có long-lived branches. Google và Facebook dùng vì: (1) Loại bỏ merge conflict từ long-lived branches, (2) CI liên tục cho mọi commit đảm bảo chất lượng, (3) Deploy nhanh — main luôn deployable, (4) Feature Flags cho phép code chưa hoàn thành vẫn merge được an toàn. TBD yêu cầu CI/CD cực mạnh, test coverage cao, và feature flag infrastructure.

### Câu 3: Feature Flag là gì? Tại sao cần trong TBD?

**Trả lời:** Feature Flag là cờ điều khiển bật/tắt tính năng trong code mà không cần deploy lại. Trong TBD, vì không có feature branches, code chưa hoàn thành vẫn merge vào main. Feature Flag giấu tính năng chưa sẵn sàng khỏi end user. Ưu điểm khác: canary release (bật cho 10% user trước), A/B testing, kill switch (tắt tính năng lỗi ngay lập tức). Cần chú ý dọn dẹp flag sau khi feature ổn định để tránh "flag debt".

### Câu 4: Nếu team bạn đang dùng Git Flow và muốn chuyển sang GitHub Flow thì làm thế nào?

**Trả lời:** Chuyển đổi dần dần: (1) Đảm bảo CI/CD pipeline hoàn chỉnh cho nhánh main, (2) Thiết lập branch protection cho main (require PR, require CI pass), (3) Merge develop vào main để đồng bộ, (4) Ngừng tạo release branches — deploy trực tiếp từ main sau khi merge PR, (5) Ngừng tạo develop branch cho dự án mới, (6) Training team về quy trình mới, (7) Sau vài sprint, xóa nhánh develop cũ.

### Câu 5: So sánh ưu nhược điểm của Squash Merge, Merge Commit và Rebase Merge khi merge PR?

**Trả lời:** **Merge Commit** giữ toàn bộ lịch sử của feature branch trong 1 merge commit — lịch sử đầy đủ nhưng có thể phức tạp. **Squash Merge** gộp tất cả commits thành 1 — lịch sử sạch nhưng mất chi tiết. **Rebase Merge** đặt lại từng commit lên đầu main — lịch sử tuyến tính nhưng viết lại history (nguy hiểm nếu không hiểu rõ). Phổ biến nhất là Squash Merge cho feature nhỏ và Merge Commit cho feature lớn cần giữ lịch sử chi tiết.

---

## 7. Tóm tắt

```
+--------------------------------------------------------------+
|  GitHub Flow:                                                |
|  main → feature branch → PR → review → merge → deploy       |
|  Đơn giản, phù hợp hầu hết dự án                             |
+--------------------------------------------------------------+
|  Trunk-Based Development:                                    |
|  Commit trực tiếp vào main (hoặc branch < 1 ngày)           |
|  Feature Flags thay feature branches                         |
|  Yêu cầu: CI/CD mạnh, test cao, kỷ luật tốt                 |
+--------------------------------------------------------------+
|  Chọn dựa trên: deploy frequency, team size, CI maturity     |
+--------------------------------------------------------------+
```
