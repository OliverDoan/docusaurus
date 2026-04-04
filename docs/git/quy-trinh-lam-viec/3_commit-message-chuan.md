---
sidebar_position: 3
title: "Commit Message chuan — Conventional Commits"
---

# Commit Message chuan — Conventional Commits

Commit message la "nhat ky" cua du an. Mot commit message tot giup ban (va dong nghiep) hieu **tai sao** thay doi duoc thuc hien, khong chi **thay doi gi**. Bai nay se giup ban viet commit message chuyen nghiep theo chuan Conventional Commits — chuan duoc su dung boi hang ngan du an open source va enterprise tren the gioi.

---

## 1. Tai sao commit message quan trong?

Truoc khi hoc cach viet, hay hieu **tai sao** commit message tot lai quan trong den vay:

### 1.1. Git log — Lich su du an

```bash
# Commit message xau — doc khong hieu gi
git log --oneline
# a1b2c3d fix
# d4e5f6g update
# g7h8i9j change stuff
# j0k1l2m WIP
# m3n4o5p done

# Commit message tot — hieu ngay du an dang lam gi
git log --oneline
# a1b2c3d fix: resolve login timeout on slow networks
# d4e5f6g feat: add dark mode toggle to settings page
# g7h8i9j refactor: extract validation logic to shared utils
# j0k1l2m docs: add API authentication guide
# m3n4o5p perf: optimize image loading with lazy load
```

### 1.2. Git blame — Ai viet dong nay va tai sao?

```bash
# git blame cho ban thay ai thay doi dong code nao, va commit message giai thich tai sao
git blame src/auth/login.ts

# Ket qua:
# a1b2c3d (Alice 2024-01-15) const TIMEOUT = 30000;
#   → Commit: "fix: increase login timeout from 5s to 30s for slow networks"
#   → Ban hieu NGAY tai sao timeout la 30000 ma khong phai 5000
```

### 1.3. Git bisect — Tim bug nhanh

```bash
# git bisect dung binary search de tim commit gay ra bug
git bisect start
git bisect bad          # Commit hien tai co bug
git bisect good v1.0.0  # Version 1.0 khong co bug

# Git se checkout tung commit — ban test va bao good/bad
# Neu commit message ro rang, ban biet ngay commit nao gay bug:
# "feat: add new payment gateway" ← A ha! Bug o day!
```

### 1.4. Changelog tu dong

```bash
# Voi commit message theo chuan, tools co the tu dong tao changelog:
# CHANGELOG.md
# ## v2.1.0 (2024-03-15)
# ### Features
# - Add dark mode toggle to settings page
# - Add export to PDF feature
# ### Bug Fixes
# - Resolve login timeout on slow networks
# - Fix broken image upload on Safari
```

---

## 2. 7 Quy tac viet commit message tot (Chris Beams)

Chris Beams tong hop 7 quy tac ma hau het developer chuyen nghiep deu dong y:

### Quy tac 1: Tach subject va body bang dong trong

```bash
# SAI: tron lan subject va chi tiet
git commit -m "Fix login bug that happened when user enters wrong password 3 times and the system locks the account but doesnt show error message to user"

# DUNG: tach ro rang
git commit -m "fix: show error message when account is locked

When a user enters wrong password 3 times, the account gets locked.
Previously, no error message was shown. Now we display a clear
message explaining the lockout duration."
```

### Quy tac 2: Gioi han subject line ~ 50 ky tu (toi da 72)

```bash
# SAI: qua dai
git commit -m "fix: resolve the issue where the login page crashes when the user enters a very long email address that exceeds 255 characters"

# DUNG: ngan gon, du y
git commit -m "fix: prevent crash on oversized email input"
```

### Quy tac 3: Viet hoa chu cai dau (cho style truyen thong)

```bash
# Style truyen thong (viet hoa)
git commit -m "Add search functionality"

# Style Conventional Commits (khong viet hoa sau type)
git commit -m "feat: add search functionality"
# ← "add" viet thuong vi da co prefix "feat:"
```

### Quy tac 4: Khong ket thuc subject bang dau cham

```bash
# SAI
git commit -m "feat: add login page."

# DUNG
git commit -m "feat: add login page"
```

### Quy tac 5: Dung the menh lenh (imperative mood)

```bash
# SAI: qua khu hoac hien tai tien trinh
git commit -m "feat: added login page"
git commit -m "feat: adding login page"
git commit -m "fix: fixed the bug"
git commit -m "fix: fixes the bug"

# DUNG: the menh lenh — nhu ra lenh cho code
git commit -m "feat: add login page"
git commit -m "fix: resolve the crash on login"

# Meo nho: commit message nen hoan thanh cau:
# "If applied, this commit will ___"
# "If applied, this commit will ADD LOGIN PAGE" ← ok!
# "If applied, this commit will ADDED LOGIN PAGE" ← sai ngu phap!
```

### Quy tac 6: Body giai thich WHAT va WHY (khong phai HOW)

```bash
# SAI: giai thich HOW (doc code cung thay)
git commit -m "fix: change timeout from 5000 to 30000

Changed the TIMEOUT constant in login.ts from 5000 to 30000.
Also updated the config file."

# DUNG: giai thich WHY
git commit -m "fix: increase login timeout for slow networks

Users on 3G networks reported frequent timeout errors during
login. The previous 5-second timeout was too short for slow
connections. Increased to 30 seconds based on P95 latency data
from production monitoring.

Reported in issue #1234."
```

### Quy tac 7: Moi commit la 1 thay doi logic

```bash
# SAI: 1 commit lam qua nhieu thu
git commit -m "fix login, add dark mode, update readme, fix typo"

# DUNG: tach thanh nhieu commit
git commit -m "fix: resolve login timeout on slow networks"
git commit -m "feat: add dark mode toggle to settings"
git commit -m "docs: update API authentication guide"
git commit -m "fix: correct typo in error message"
```

---

## 3. Conventional Commits — Chuan cong nghiep

### 3.1. Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Chi tiet:**

```
feat(auth): add two-factor authentication
  |    |              |
  |    |              +-- description: mo ta ngan gon (imperative mood)
  |    +-- scope: pham vi thay doi (optional)
  +-- type: loai thay doi

Multi-factor authentication is now required for all admin
accounts. Users can choose between TOTP app or SMS.
  |
  +-- body: giai thich chi tiet (optional)

BREAKING CHANGE: Admin accounts must set up 2FA within 7 days
Closes #456
  |
  +-- footer: breaking changes, issue references (optional)
```

### 3.2. Cac types

| Type | Muc dich | Vi du |
|------|---------|-------|
| **feat** | Tinh nang moi | `feat: add user search` |
| **fix** | Sua loi | `fix: resolve login crash` |
| **docs** | Tai lieu | `docs: add API guide` |
| **style** | Format code (khong doi logic) | `style: fix indentation` |
| **refactor** | Tai cau truc (khong doi behavior) | `refactor: extract auth utils` |
| **perf** | Cai thien hieu nang | `perf: optimize image loading` |
| **test** | Them/sua test | `test: add login unit tests` |
| **build** | Thay doi build system | `build: update webpack config` |
| **ci** | Thay doi CI config | `ci: add GitHub Actions workflow` |
| **chore** | Cong viec bao tri | `chore: update dependencies` |
| **revert** | Revert commit truoc | `revert: revert "feat: add search"` |

### 3.3. Scope (pham vi)

Scope la optional nhung rat huu ich cho du an lon:

```bash
# Khong co scope — ok cho du an nho
git commit -m "feat: add dark mode"

# Co scope — tot cho du an lon
git commit -m "feat(ui): add dark mode toggle"
git commit -m "fix(auth): resolve token refresh issue"
git commit -m "refactor(api): extract common error handler"
git commit -m "test(payment): add integration tests for Stripe"
git commit -m "ci(deploy): add staging environment workflow"

# Scope giup loc commit theo module
git log --oneline --grep="auth"
# Chi thay cac commit lien quan den auth
```

### 3.4. Breaking Changes

Khi thay doi khong tuong thich nguoc (backward incompatible):

```bash
# Cach 1: Dung dau ! sau type/scope
git commit -m "feat(api)!: change response format from XML to JSON"

# Cach 2: Dung BREAKING CHANGE footer
git commit -m "feat(api): change response format to JSON

BREAKING CHANGE: All API responses now return JSON instead of XML.
Clients using XML parsing must update their code.
Migration guide: https://docs.example.com/migrate-to-json"

# Cach 3: Ket hop ca 2 (khong bat buoc nhung ro rang)
git commit -m "feat(api)!: change response format to JSON

BREAKING CHANGE: API responses are now JSON only. XML deprecated."
```

---

## 4. Vi du commit message tot vs xau

### Xau — Khong ai hieu

```bash
git commit -m "fix"
git commit -m "update"
git commit -m "WIP"
git commit -m "done"
git commit -m "changes"
git commit -m "stuff"
git commit -m "asdfgh"
git commit -m "fix bug"
git commit -m "please work"
git commit -m "final fix (for real this time)"
git commit -m "Monday morning commit"
```

### Tot — Chuyen nghiep va ro rang

```bash
# Feature moi
git commit -m "feat(search): add full-text search with Elasticsearch"
git commit -m "feat(auth): implement OAuth2 login with Google"
git commit -m "feat(export): add CSV export for transaction history"

# Sua loi
git commit -m "fix(cart): prevent duplicate items when clicking fast"
git commit -m "fix(upload): handle file size > 10MB gracefully"
git commit -m "fix(email): correct template rendering on Outlook"

# Refactor
git commit -m "refactor(db): migrate from callbacks to async/await"
git commit -m "refactor(auth): extract JWT logic to shared middleware"

# Performance
git commit -m "perf(images): add WebP conversion and lazy loading"
git commit -m "perf(api): add Redis caching for product listing"

# Tests
git commit -m "test(checkout): add e2e tests for payment flow"
git commit -m "test(auth): increase coverage from 65% to 90%"

# Voi body giai thich chi tiet
git commit -m "fix(payment): retry failed transactions up to 3 times

Payment gateway occasionally returns timeout errors during peak
hours. Added exponential backoff retry (1s, 2s, 4s) to handle
transient failures. After 3 retries, show user-friendly error.

Closes #789"
```

---

## 5. Semantic Versioning va Conventional Commits

Conventional Commits lien ket truc tiep voi **Semantic Versioning (SemVer)**:

```
Version: MAJOR.MINOR.PATCH
         |     |     |
         |     |     +-- fix: sua loi → tang PATCH (1.0.0 → 1.0.1)
         |     +-- feat: tinh nang moi → tang MINOR (1.0.0 → 1.1.0)
         +-- BREAKING CHANGE → tang MAJOR (1.0.0 → 2.0.0)
```

| Commit type | SemVer | Vi du |
|------------|--------|-------|
| `fix:` | PATCH (x.x.1 → x.x.2) | Bug fix, khong doi API |
| `feat:` | MINOR (x.1.x → x.2.0) | Tinh nang moi, backward compatible |
| `feat!:` hoac `BREAKING CHANGE:` | MAJOR (1.x.x → 2.0.0) | Thay doi khong tuong thich nguoc |
| `docs:`, `style:`, `refactor:`, etc. | Khong tang version | Khong anh huong end user |

```bash
# Vi du vong doi version
v1.0.0   # Release dau tien
v1.0.1   # fix: resolve login crash
v1.0.2   # fix: correct date formatting
v1.1.0   # feat: add dark mode
v1.1.1   # fix: dark mode flickering
v1.2.0   # feat: add export to PDF
v2.0.0   # feat!: redesign entire API (breaking change)
```

---

## 6. Tools tu dong hoa

### 6.1. Commitlint — Validate commit message

Commitlint kiem tra commit message co dung format hay khong. Neu sai → reject commit.

```bash
# Cai dat
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

Tao file cau hinh `commitlint.config.js`:

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type phai la 1 trong cac gia tri nay
    'type-enum': [
      2,          // 2 = error (0 = disabled, 1 = warning)
      'always',
      [
        'feat', 'fix', 'docs', 'style', 'refactor',
        'perf', 'test', 'build', 'ci', 'chore', 'revert',
      ],
    ],
    // Subject khong duoc trong
    'subject-empty': [2, 'never'],
    // Subject toi da 72 ky tu
    'subject-max-length': [2, 'always', 72],
    // Type khong duoc trong
    'type-empty': [2, 'never'],
    // Type phai viet thuong
    'type-case': [2, 'always', 'lower-case'],
    // Subject khong ket thuc bang dau cham
    'subject-full-stop': [2, 'never', '.'],
  },
};
```

### 6.2. Husky — Git Hooks tu dong

Husky tu dong chay commitlint (va cac tool khac) moi khi commit.

```bash
# Cai dat Husky
npm install --save-dev husky

# Khoi tao Husky
npx husky init

# Tao commit-msg hook
# File .husky/commit-msg se duoc tao
```

Noi dung file `.husky/commit-msg`:

```bash
#!/usr/bin/env sh

# Chay commitlint de validate commit message
npx --no -- commitlint --edit "$1"
```

**Ket qua khi commit sai format:**

```bash
git commit -m "fix bug"
# => ERROR: subject may not be empty [subject-empty]
# => ERROR: type may not be empty [type-empty]
# => Commit bi reject!

git commit -m "fix: resolve login crash"
# => Commit thanh cong!
```

### 6.3. Commitizen — Commit tuong tac

Commitizen huong dan ban viet commit message dung format qua cac buoc tuong tac.

```bash
# Cai dat
npm install --save-dev commitizen cz-conventional-changelog

# Cau hinh trong package.json
# "config": {
#   "commitizen": {
#     "path": "cz-conventional-changelog"
#   }
# }
```

```bash
# Thay vi git commit, dung:
npx cz
# Hoac neu cai global: git cz

# Se hien menu tuong tac:
# ? Select the type of change:
#   feat:     A new feature
#   fix:      A bug fix
#   docs:     Documentation only changes
#   ...
#
# ? What is the scope? (optional): auth
# ? Short description: add two-factor authentication
# ? Longer description? (optional): ...
# ? Breaking changes? (optional): ...
# ? Issues closed? (optional): #456
#
# => Commit: "feat(auth): add two-factor authentication"
```

### 6.4. Thiet lap day du (step-by-step)

```bash
# Buoc 1: Cai dat tat ca packages
npm install --save-dev \
  @commitlint/cli \
  @commitlint/config-conventional \
  husky \
  commitizen \
  cz-conventional-changelog

# Buoc 2: Khoi tao Husky
npx husky init

# Buoc 3: Tao commitlint config
# Tao file commitlint.config.js (nhu tren)

# Buoc 4: Tao commit-msg hook
# Noi dung .husky/commit-msg:
# npx --no -- commitlint --edit "$1"

# Buoc 5: Cau hinh commitizen trong package.json
# "config": {
#   "commitizen": {
#     "path": "cz-conventional-changelog"
#   }
# }

# Buoc 6: Them script vao package.json
# "scripts": {
#   "commit": "cz",
#   "prepare": "husky"
# }

# Su dung:
npm run commit    # Commit tuong tac voi commitizen
git commit -m "feat: ..." # Commit thu cong (van duoc validate)
```

---

## 7. Auto-generate CHANGELOG

Voi commit message theo chuan, ban co the tu dong tao CHANGELOG:

```bash
# Cai dat standard-version (hoac release-please)
npm install --save-dev standard-version

# Them script
# "scripts": {
#   "release": "standard-version"
# }

# Chay
npm run release
```

**Ket qua CHANGELOG.md:**

```markdown
# Changelog

## [2.1.0] - 2024-03-15

### Features

* **search:** add full-text search with Elasticsearch ([a1b2c3d])
* **auth:** implement OAuth2 login with Google ([d4e5f6g])

### Bug Fixes

* **cart:** prevent duplicate items when clicking fast ([g7h8i9j])
* **email:** correct template rendering on Outlook ([j0k1l2m])

### Performance Improvements

* **images:** add WebP conversion and lazy loading ([m3n4o5p])

## [2.0.0] - 2024-02-01

### BREAKING CHANGES

* **api:** change response format from XML to JSON ([p6q7r8s])
```

---

## 8. Bang tom tat Types voi Emoji (optional)

Nhieu team thich dung emoji de commit message de doc hon:

| Type | Emoji | Vi du |
|------|-------|-------|
| feat | :sparkles: | `feat: add user search` |
| fix | :bug: | `fix: resolve login crash` |
| docs | :memo: | `docs: update API guide` |
| style | :art: | `style: format code` |
| refactor | :recycle: | `refactor: extract utils` |
| perf | :zap: | `perf: optimize queries` |
| test | :white_check_mark: | `test: add unit tests` |
| build | :package: | `build: update webpack` |
| ci | :construction_worker: | `ci: add deploy pipeline` |
| chore | :wrench: | `chore: update deps` |
| revert | :rewind: | `revert: undo last feat` |

**Luu y:** Emoji la optional va tuy team. Nhieu du an open source lon KHONG dung emoji vi commitlint mac dinh khong cho phep. Neu muon dung, can cau hinh them.

---

## 9. Loi thuong gap

### Loi 1: Commit message qua chung chung

```bash
# SAI — doc khong hieu gi
git commit -m "fix: fix bug"
git commit -m "feat: add feature"
git commit -m "update: update code"

# DUNG — cu the va ro rang
git commit -m "fix: prevent crash when email field is empty"
git commit -m "feat: add password strength indicator"
git commit -m "refactor: simplify date formatting logic"
```

### Loi 2: 1 commit lam qua nhieu thu

```bash
# SAI — commit khong lo
git add .
git commit -m "feat: add login, register, forgot password, and refactor database"

# DUNG — tach thanh nhieu commit nho
git add src/auth/login.ts tests/login.test.ts
git commit -m "feat(auth): add login page"

git add src/auth/register.ts tests/register.test.ts
git commit -m "feat(auth): add registration page"

git add src/auth/forgot-password.ts
git commit -m "feat(auth): add forgot password flow"

git add src/db/
git commit -m "refactor(db): simplify connection pooling"
```

### Loi 3: Dung sai type

```bash
# SAI: dung feat cho viec sua loi
git commit -m "feat: fix login crash"  # Day la fix, khong phai feat!

# SAI: dung fix cho refactor
git commit -m "fix: rename variables for clarity"  # Day la refactor!

# DUNG: chon type chinh xac
git commit -m "fix: resolve login crash on empty password"
git commit -m "refactor: rename variables for clarity"
```

### Loi 4: Khong thiet lap validation

```bash
# Khong co commitlint/husky → team viet tuy y → CHANGELOG loi → khon gian

# Giai phap: LUON thiet lap commitlint + husky ngay tu dau du an
# Chi mat 5 phut setup nhung tiet kiem hang tram gio ve sau
```

### Loi 5: Body giai thich HOW thay vi WHY

```bash
# SAI: giai thich HOW (doc diff cung thay)
git commit -m "fix: change MAX_RETRIES from 1 to 3

Changed the constant MAX_RETRIES from 1 to 3 in config.ts line 42."

# DUNG: giai thich WHY
git commit -m "fix: increase payment retry count to 3

Payment gateway has ~2% transient failure rate during peak hours.
Single retry was insufficient — increasing to 3 with exponential
backoff reduces user-visible errors by 95% based on staging tests."
```

---

## 10. Cau hoi phong van

### Cau 1: Conventional Commits la gi? Tai sao nen dung?

**Tra loi:** Conventional Commits la quy uoc viet commit message theo format `type(scope): description`. Nen dung vi: (1) Git log de doc va hieu, (2) Co the tu dong tao CHANGELOG, (3) Tu dong xac dinh version moi (SemVer) dua tren commit types, (4) Giup team thong nhat cach viet, (5) De tim kiem va loc commits theo type/scope.

### Cau 2: Commit types nao tang version SemVer?

**Tra loi:** `fix` tang PATCH (1.0.0 → 1.0.1), `feat` tang MINOR (1.0.0 → 1.1.0), commit co `BREAKING CHANGE` hoac dau `!` tang MAJOR (1.0.0 → 2.0.0). Cac types khac nhu docs, style, refactor, test, chore khong tang version vi khong anh huong den end user.

### Cau 3: Giai thich cach thiet lap commit message validation cho du an?

**Tra loi:** Su dung 3 tools: (1) **commitlint** de validate format — cai dat `@commitlint/cli` va `@commitlint/config-conventional`, tao file config dinh nghia rules. (2) **Husky** de chay commitlint tu dong — tao commit-msg hook goi commitlint. (3) **Commitizen** (optional) de ho tro viet commit tuong tac — nguoi dung chon type, nhap scope va description qua menu. Tat ca cai dat nhu dev dependencies va commit vao repo de tat ca team members dung chung.

### Cau 4: Viet commit message cho tinh huong: ban fix bug khien app crash khi user upload file > 5MB tren trang profile.

**Tra loi mau:**

```
fix(profile): handle file upload exceeding 5MB size limit

The profile image upload crashed when file size exceeded 5MB due to
missing size validation before upload initiation. Added client-side
file size check with user-friendly error message. Server-side
validation was already in place but the client crash prevented the
request from reaching it.

Closes #1234
```

### Cau 5: Su khac nhau giua `refactor` va `fix`? Giua `style` va `refactor`?

**Tra loi:** `refactor` thay doi cau truc code nhung **khong doi behavior** — input va output van giong nhau (vi du: doi ten bien, tach function, thay doi design pattern). `fix` sua **behavior sai** — truoc khi fix thi output sai, sau khi fix thi output dung. Con `style` chi thay doi **format** code (indentation, spacing, semicolons) ma **khong doi logic** — ngay ca khong thay doi cau truc. `refactor` co the doi cau truc nhung khong doi behavior; `style` khong doi ca cau truc lan behavior.

---

## 11. Tom tat

```
+--------------------------------------------------------------+
|  Conventional Commits Format                                 |
|  <type>[scope]: <description>                                |
|                                                              |
|  Types: feat, fix, docs, style, refactor, perf, test,       |
|         build, ci, chore, revert                             |
|                                                              |
|  Breaking: feat!: ... hoac BREAKING CHANGE: footer           |
|                                                              |
|  SemVer: fix→PATCH, feat→MINOR, breaking→MAJOR              |
|                                                              |
|  Tools: commitlint (validate) + Husky (hooks) +             |
|         Commitizen (interactive) + standard-version          |
|         (auto CHANGELOG)                                     |
+--------------------------------------------------------------+
```
