---
sidebar_position: 6
title: "6. Hooks, Automation & Governance"
---

# Hooks, Automation & Governance

> *Nhóm câu này kiểm tra khả năng tự động hoá quy trình Git và enforce chất lượng ở quy mô team: từ branch protection, CODEOWNERS, Git hooks (Husky/lint-staged/commitlint) cho tới CI/CD và semantic-release. Người phỏng vấn muốn xem bạn hiểu đâu là "nguồn enforce thật" (server/CI) và đâu chỉ là "tiện cho dev" (client hooks), cũng như cách thiết kế guardrail mà không làm developer khó chịu.*

---

## Câu 37: Branch protection rules trên GitHub `[Intermediate]`

### Câu hỏi
> "Team của bạn liên tục bị tình trạng có người push thẳng lên `main` làm hỏng build. Bạn sẽ cấu hình GitHub thế nào để ngăn việc này và đảm bảo mọi thay đổi vào `main` đều được review và pass CI?"

### Giải thích lý thuyết

Branch protection rules là cơ chế **server-side** của GitHub, áp vào một branch (hoặc pattern như `main`, `release/*`). Vì chạy trên server nên **không thể bypass bằng `--no-verify`** như client hook — đây là nơi enforce thật sự.

Các tuỳ chọn quan trọng và ý nghĩa:

| Tuỳ chọn | Tác dụng | Vì sao cần |
|----------|----------|------------|
| **Require a pull request before merging** | Cấm push trực tiếp, mọi thay đổi phải qua PR | Chặn `git push origin main` thẳng |
| **Require approvals** (≥1, thường 2) | PR cần N người approve mới merge được | Bắt buộc peer review |
| **Dismiss stale approvals** | Approve cũ bị huỷ khi có commit mới | Tránh approve "ma" cho code đã đổi |
| **Require status checks to pass** | CI (lint/test/build) phải xanh mới merge | Chặn merge code hỏng |
| **Require branches to be up to date** | Branch phải rebase/merge `main` mới nhất trước khi merge | Tránh "merge xanh nhưng main đỏ" (semantic conflict) |
| **Require conversation resolution** | Mọi comment review phải resolved | Không bỏ sót feedback |
| **Require linear history** | Cấm merge commit, chỉ squash/rebase | Lịch sử sạch, dễ revert |
| **Require signed commits** | Commit phải ký GPG/SSH | Chống giả mạo author |
| **Restrict who can push** | Chỉ team/người cụ thể được push (kể cả qua PR) | Kiểm soát release branch |
| **Do not allow force pushes** | Cấm `push --force` ghi đè lịch sử | Bảo vệ lịch sử chung |
| **Do not allow deletions** | Cấm xoá branch | Tránh mất `main` |
| **Include administrators** | Áp luôn cho admin | Không ai được "đặc cách" lách rule |

> **Insight phỏng vấn:** Hai mục hay bị quên nhưng tạo ấn tượng mạnh là **"Require branches to be up to date"** (chống semantic conflict — CI xanh trên branch cũ nhưng merge vào lại làm hỏng `main`) và **"Include administrators"** (rule chỉ có giá trị khi không ai được lách, kể cả tech lead). Nhấn rằng đây là enforce server-side nên đáng tin hơn mọi client hook.

### Code minh hoạ
```bash
# Cấu hình branch protection bằng GitHub CLI (gh) thay vì click UI
gh api -X PUT repos/OWNER/REPO/branches/main/protection \
  --input - <<'JSON'
{
  "required_pull_request_reviews": {
    "required_approving_review_count": 2,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true
  },
  "required_status_checks": {
    "strict": true,
    "contexts": ["build", "lint", "test"]
  },
  "required_linear_history": true,
  "required_conversation_resolution": true,
  "enforce_admins": true,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON

# "strict": true  -> tương đương "Require branches to be up to date"
# "enforce_admins": true -> "Include administrators"
# Modern GitHub khuyến nghị dùng Rulesets (repos/REPO/rulesets) cho org-level
```

### Đáp án mẫu
> "Em sẽ bật branch protection cho `main`: require PR before merging để chặn push thẳng, require ít nhất 2 approvals và dismiss stale approvals, require status checks (lint/test/build) pass, và quan trọng là require branch up-to-date để tránh semantic conflict. Thêm no force push, no deletion, linear history cho lịch sử sạch, và bật Include administrators để không ai lách được. Em nhấn là đây là enforce server-side nên đáng tin hơn client hook — client hook chỉ để feedback nhanh thôi ạ."

---

## Câu 38: CODEOWNERS file `[Intermediate]`

### Câu hỏi
> "Repo của bạn có nhiều module (frontend, backend, infra). Làm sao để mỗi PR đụng vào module nào thì tự động yêu cầu đúng team sở hữu module đó review, mà không cần nhắc nhau thủ công?"

### Giải thích lý thuyết

`CODEOWNERS` là file ánh xạ **đường dẫn → người/team chịu trách nhiệm review**. GitHub đọc file này để **tự động request review** đúng owner khi PR đụng vào file/thư mục tương ứng.

Vị trí hợp lệ (GitHub tìm theo thứ tự): `.github/CODEOWNERS`, hoặc root `CODEOWNERS`, hoặc `docs/CODEOWNERS`. Phổ biến nhất là `.github/CODEOWNERS`.

Cú pháp giống `.gitignore`:
- Pattern bên trái là glob đường dẫn; bên phải là một hay nhiều `@user` / `@org/team` / email.
- **Rule sau ghi đè rule trước** (last match wins) cho cùng một file — nên đặt rule chung ở trên, rule cụ thể ở dưới.
- Glob: `*` khớp trong một segment, `**` khớp nhiều cấp, `/` đầu neo từ root, `/` cuối nghĩa là thư mục.

| Pattern | Khớp |
|---------|------|
| `*` | Mọi file (owner mặc định toàn repo) |
| `*.ts` | Mọi file `.ts` ở mọi nơi |
| `/docs/` | Toàn bộ thư mục `docs` ở root |
| `apps/web/**` | Mọi file dưới `apps/web` |
| `/infra/*.tf` | File `.tf` ngay trong `infra` |

Bản thân CODEOWNERS chỉ **request** review. Để **bắt buộc**, phải kết hợp branch protection: bật **"Require review from Code Owners"** — khi đó PR đụng file của owner nào thì owner đó *phải* approve mới merge được.

> **Insight phỏng vấn:** Điểm dễ ăn điểm: nói rõ CODEOWNERS một mình chỉ là "auto-assign reviewer", nó **không enforce** gì cả; muốn enforce phải bật "Require review from Code Owners" trong branch protection. Và nhấn quy tắc **last match wins** — nhiều người tưởng nhiều owner cùng được cộng dồn, thực ra với một file thì chỉ rule khớp cuối cùng có hiệu lực.

### Code minh hoạ
```bash
# .github/CODEOWNERS

# Owner mặc định cho toàn repo (rule chung đặt trên cùng)
*                       @acme/tech-leads

# Frontend
/apps/web/**            @acme/frontend
*.tsx                   @acme/frontend

# Backend
/services/api/**        @acme/backend @alice

# Infra & CI nhạy cảm -> đặt dưới cùng để ghi đè, cần cả 2 team duyệt
/infra/**               @acme/platform @acme/security
/.github/workflows/**   @acme/platform

# File phụ thuộc -> chỉ tech-lead duyệt
package-lock.json       @acme/tech-leads
```

### Đáp án mẫu
> "Em tạo file `.github/CODEOWNERS`, ánh xạ từng đường dẫn module tới team sở hữu, ví dụ `/apps/web/**` cho `@acme/frontend`, `/infra/**` cho `@acme/platform`. GitHub sẽ tự request đúng team review khi PR đụng vào đó. Lưu ý cú pháp là last-match-wins nên rule chung em đặt trên, rule cụ thể đặt dưới. Để biến nó từ 'gợi ý' thành 'bắt buộc', em bật thêm 'Require review from Code Owners' trong branch protection ạ."

---

## Câu 39: Pre-commit hook với Husky + lint-staged `[Intermediate]`

### Câu hỏi
> "Bạn muốn mỗi commit đều được format và lint tự động, nhưng team phàn nàn chạy ESLint/Prettier toàn project trước mỗi commit quá chậm. Bạn giải quyết thế nào?"

### Giải thích lý thuyết

Vấn đề là **phạm vi lint**. Chạy lint/format toàn repo trước mỗi commit vừa chậm (vài chục giây tới phút), vừa **format cả những file bạn không hề động vào** — tạo diff khổng lồ, gây noise và conflict.

Giải pháp gồm 2 mảnh ghép:

| Công cụ | Vai trò |
|---------|---------|
| **Husky** | Quản lý Git hooks bằng cách trỏ `core.hooksPath` vào thư mục `.husky/`, version-control được, tự cài qua `npm install` (script `prepare`) |
| **lint-staged** | Chỉ chạy command trên **danh sách file đang staged** (`git diff --cached`), không phải toàn repo |

Vì sao chỉ lint file staged:
1. **Nhanh** — chỉ vài file bạn thật sự sửa, feedback gần như tức thì.
2. **Không nhiễu** — không format file người khác đang sửa → tránh conflict và diff rác.
3. **Incremental, an toàn** — không "format ồ ạt" cả codebase trong một commit khó review.
4. lint-staged tự động `git add` lại file sau khi format, nên file đã fix vào đúng commit.

> **Insight phỏng vấn:** Câu trả lời "chỉ lint file staged cho nhanh" mới là một nửa. Nửa quan trọng hơn là **tránh format ồ ạt cả repo** trong một commit — điều đó sinh diff khổng lồ, đè lên thay đổi của người khác và gây conflict. Đồng thời nhớ rằng client hook có thể bị bypass bằng `--no-verify`, nên lint thật sự vẫn phải lặp lại ở CI.

### Code minh hoạ
```jsonc
// package.json
{
  "scripts": {
    "prepare": "husky"          // tự cài hook sau mỗi npm install
  },
  "devDependencies": {
    "husky": "^9.1.0",
    "lint-staged": "^15.2.0",
    "prettier": "^3.3.0",
    "eslint": "^9.0.0"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix --max-warnings=0",
      "prettier --write"
    ],
    "*.{json,md,css}": "prettier --write"
  }
}
```

```bash
# Khởi tạo Husky và tạo hook pre-commit
npx husky init           # tạo .husky/ + set core.hooksPath
echo "npx lint-staged" > .husky/pre-commit
```

```bash
# .husky/pre-commit  (nội dung cuối cùng)
npx lint-staged
```

### Đáp án mẫu
> "Em dùng Husky để quản lý git hook và lint-staged để chỉ chạy ESLint với Prettier trên các file đang staged thôi, không phải cả repo. Lý do chính không chỉ là nhanh, mà còn để tránh format ồ ạt cả codebase trong một commit — điều đó tạo diff khổng lồ và đè lên thay đổi của người khác gây conflict. lint-staged còn tự add lại file sau khi fix. Em cũng lưu là hook này bypass được bằng `--no-verify` nên CI vẫn phải chạy lint lại để enforce thật ạ."

---

## Câu 40: commit-msg hook với commitlint `[Intermediate]`

### Câu hỏi
> "Bạn muốn enforce commit message theo Conventional Commits, nhưng developer phản đối vì họ hay commit WIP liên tục khi đang code dở. Bạn setup commitlint thế nào để vẫn đảm bảo chất lượng mà không cản trở dev?"

### Giải thích lý thuyết

`commit-msg` là Git hook nhận **đường dẫn tới file chứa message** đang commit. commitlint đọc message đó và kiểm tra theo rule (thường là `@commitlint/config-conventional`: `type(scope): subject`, type thuộc `feat|fix|docs|chore|...`).

Mấu chốt là **đặt điểm enforce đúng chỗ**. Nếu chặn cứng từng commit local, dev không thể commit WIP — phản tác dụng. Các hướng giải quyết:

| Cách | Mô tả | Đánh đổi |
|------|-------|----------|
| **Squash khi merge + chỉ enforce PR title** | Dev commit WIP thoải mái trên branch cá nhân; lúc squash-merge chỉ một message cuối cần đúng convention (lint PR title ở CI) | Tốt nhất cho team — không cản dev, vẫn enforce kết quả |
| **Cho phép tiền tố WIP** | commitlint ignore message bắt đầu `WIP`, hoặc dùng `wip` type | Lịch sử còn commit WIP nếu không squash |
| **`--no-verify`** để skip tạm | Bỏ qua hook một lần | Bypass được → không đáng tin, chỉ là van xả |
| **Chỉ enforce ở CI** | Hook local là gợi ý, CI mới fail PR | Nguồn enforce thật |

Nguyên tắc: **commit-msg hook local chỉ để feedback sớm; nguồn enforce thật phải nằm ở CI** (lint toàn bộ commit của PR, hoặc lint PR title). Vì hook local share không tự động và bypass được bằng `--no-verify`.

> **Insight phỏng vấn:** Đừng trả lời kiểu "chặn cứng mọi commit". Câu trả lời chín hơn: cho dev commit WIP tự do trên branch cá nhân, dùng **squash merge** để gộp thành một commit đúng convention, và **enforce ở CI** (lint PR title hoặc các commit trong PR). Nhấn rằng hook local bypass được nên không bao giờ là lớp enforce cuối cùng.

### Code minh hoạ
```jsonc
// .commitlintrc.json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [2, "always",
      ["feat", "fix", "docs", "refactor", "test", "chore", "perf", "ci"]],
    "subject-max-length": [2, "always", 72]
  },
  // Cho phép WIP commit local để không cản dev (sẽ squash khi merge)
  "ignores": ["(message) => message.startsWith('WIP')"]
}
```

```bash
# .husky/commit-msg
npx --no-install commitlint --edit "$1"   # $1 = file chứa message
```

```yaml
# .github/workflows/commitlint.yml — NGUỒN ENFORCE THẬT (không bypass được)
name: Lint PR Title
on:
  pull_request:
    types: [opened, edited, synchronize]
jobs:
  lint-title:
    runs-on: ubuntu-latest
    steps:
      - uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Đáp án mẫu
> "Em setup commitlint qua `commit-msg` hook với config-conventional để feedback sớm, nhưng cho phép tiền tố WIP để dev commit dở thoải mái. Quan trọng là nguồn enforce thật em đặt ở CI: dev commit WIP tự do trên branch, lúc merge thì squash thành một commit, và CI lint PR title theo convention. Như vậy không cản dev nhưng lịch sử cuối vẫn sạch và đúng chuẩn. Hook local bypass được bằng `--no-verify` nên em không coi nó là lớp enforce cuối ạ."

---

## Câu 41: Pre-push hook chạy tests `[Intermediate]`

### Câu hỏi
> "Có người đề xuất thêm pre-push hook chạy toàn bộ test suite trước khi push để không bao giờ đẩy code hỏng lên remote. Bạn thấy có vấn đề gì và sẽ configure thế nào cho hợp lý?"

### Giải thích lý thuyết

`pre-push` chạy **trước khi push lên remote**. Ý tưởng "chạy test trước push" hợp lý về mục tiêu (chặn code hỏng) nhưng có trade-off rõ:

**Lợi:** bắt lỗi sớm ngay trên máy dev, tránh CI đỏ và tránh làm hỏng branch chung.

**Hại:** nếu chạy **full test suite** (vài phút), mỗi lần push đều phải chờ → dev khó chịu → và họ sẽ học cách `git push --no-verify` để né, biến hook thành vô dụng. Hook quá chậm còn phá vỡ thói quen "commit/push nhỏ thường xuyên".

Cách cân bằng feedback nhanh vs an toàn:

| Chiến lược | Cách làm |
|-----------|----------|
| **Chỉ chạy test liên quan/affected** | `jest --onlyChanged`, `nx affected:test`, `turbo run test --filter=...[origin/main]` — chỉ test phần code thay đổi |
| **Chạy nhanh ở pre-push, full ở CI** | pre-push chỉ typecheck + unit test nhanh; CI chạy full suite + e2e |
| **Đặt ngân sách thời gian** | Mục tiêu pre-push < 15–30s; gì lâu hơn đẩy sang CI |
| **Cho phép skip có chủ đích** | `--no-verify` cho trường hợp khẩn, nhưng CI vẫn bắt lại |

Nguyên tắc: **pre-push cho feedback nhanh, CI là lưới an toàn cuối cùng**. Hook càng nhanh thì dev càng không né.

> **Insight phỏng vấn:** Câu chốt ăn điểm: "Hook chậm thì dev sẽ `--no-verify` để né, nên một hook chậm còn tệ hơn không có hook." Giải pháp là chỉ chạy **affected/changed tests** ở pre-push để giữ dưới ~30 giây, còn **full suite + e2e dồn vào CI** — nơi không bypass được. Đây là cân bằng feedback-loop nhanh với an toàn.

### Code minh hoạ
```bash
# .husky/pre-push
# Chỉ chạy typecheck + test cho phần code thay đổi so với main → nhanh
npm run typecheck

# Jest: chỉ chạy test liên quan tới file đã đổi
npx jest --bail --changedSince=origin/main --passWithNoTests

# Hoặc monorepo Nx: chỉ test các project bị ảnh hưởng
# npx nx affected --target=test --base=origin/main

# Hoặc Turborepo:
# npx turbo run test --filter='...[origin/main]'
```

```yaml
# .github/workflows/ci.yml — full suite chạy ở CI (lưới an toàn cuối)
name: CI
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npm test -- --ci --coverage   # FULL suite ở đây
      - run: npm run test:e2e
```

### Đáp án mẫu
> "Em ủng hộ mục tiêu nhưng không chạy full suite ở pre-push — nó chậm và dev sẽ `--no-verify` để né, làm hook vô dụng. Thay vào đó pre-push em chỉ chạy typecheck và test cho phần code thay đổi, ví dụ `jest --changedSince=origin/main` hoặc `nx affected`, giữ dưới khoảng 30 giây. Còn full suite và e2e em dồn hết vào CI — đó mới là lưới an toàn cuối, không bypass được. Nguyên tắc là pre-push cho feedback nhanh, CI để enforce ạ."

---

## Câu 42: Server-side hooks (CI) vs client-side hooks (Husky) `[Senior]`

### Câu hỏi
> "Phân biệt server-side hooks (như GitHub Actions / CI) và client-side hooks (như Husky). Cái nào nên dùng để enforce cái gì, và tại sao bạn không thể chỉ dựa vào client hooks?"

### Giải thích lý thuyết

Hai loại hook phục vụ hai mục đích khác nhau và **không thay thế cho nhau**.

**Client-side hooks** (Husky → `.git/hooks` qua `core.hooksPath`): chạy trên máy dev (`pre-commit`, `commit-msg`, `pre-push`).
- Ưu: **feedback cực nhanh**, sửa lỗi ngay trước khi đẩy đi.
- Nhược chí mạng:
  1. **Bypass được** bằng `--no-verify` / `-n`.
  2. **Không tự share** — Git không clone `.git/hooks`; phải có Husky + `npm install` thì dev mới có hook (ai skip install là không có).
  3. Phụ thuộc môi trường local của dev (version Node, tool cài đủ chưa).
  → Vì vậy client hook **không bao giờ đáng tin để enforce**.

**Server-side hooks / CI** (GitHub Actions, branch protection, hoặc `pre-receive` trên Git server tự host): chạy trên server, sau khi code tới remote.
- Ưu: **không bypass được**, áp đồng nhất cho mọi người, là **single source of truth** về chất lượng.
- Nhược: feedback chậm hơn (phải push rồi chờ CI).

Nguyên tắc vàng: **Client để tiện (fast feedback), Server để enforce (source of truth).** Mọi thứ enforce ở client thì phải **lặp lại ở CI** vì client bypass được; CI là tầng cuối.

| Việc cần làm | Nên ở client (Husky) | Nên ở server (CI / branch protection) |
|--------------|:--------------------:|:-------------------------------------:|
| Format file staged | ✅ (nhanh) | ✅ (kiểm tra lại) |
| Lint nhanh trước commit | ✅ | ✅ (enforce) |
| Validate commit message | ✅ (gợi ý) | ✅ (lint PR title — enforce) |
| Chặn test hỏng vào main | ⚠️ (affected, nhanh) | ✅ (full suite — enforce) |
| Require ≥2 approvals | ❌ (không làm được) | ✅ (branch protection) |
| Require status checks pass | ❌ | ✅ (branch protection) |
| Chặn secret/credential | ✅ (gitleaks nhanh) | ✅ (secret scanning — enforce) |
| Quét bảo mật / coverage gate | ❌ (chậm) | ✅ |

> **Insight phỏng vấn:** Câu chốt để gây ấn tượng: "Client hooks là gợi ý, không phải hàng rào — chúng bypass được và không tự share. Bất cứ gì thật sự cần enforce đều phải nằm ở CI/branch protection vì đó là nơi duy nhất không thể lách. Em thiết kế client để tăng tốc dev, server để bảo vệ branch chung — và mọi check quan trọng đều xuất hiện ở cả hai nơi, chấp nhận trùng lặp có chủ đích."

### Code minh hoạ
```bash
# CLIENT (Husky) — feedback nhanh, BYPASS được bằng --no-verify
# .husky/pre-commit
npx lint-staged
npx gitleaks protect --staged --no-banner   # quét secret nhanh
```

```yaml
# SERVER (GitHub Actions) — NGUỒN ENFORCE, không bypass được
# .github/workflows/guard.yml
name: Quality Gate
on: [pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint            # lặp lại lint (client bypass được)
      - run: npm test -- --coverage  # full test + coverage gate
      - uses: gitleaks/gitleaks-action@v2   # secret scan enforce
```

```bash
# Branch protection bắt status check "quality" phải pass mới merge được
gh api -X PUT repos/OWNER/REPO/branches/main/protection \
  -f 'required_status_checks[strict]=true' \
  -f 'required_status_checks[contexts][]=quality'
```

### Đáp án mẫu
> "Client hooks như Husky chạy trên máy dev, cho feedback cực nhanh nhưng bypass được bằng `--no-verify` và không tự share vì Git không clone `.git/hooks` — nên không đáng tin để enforce. Server-side như GitHub Actions với branch protection chạy trên server, không bypass được, là source of truth thật. Nguyên tắc của em là client để tiện, server để enforce: format và lint nhanh ở client, nhưng mọi check quan trọng như test, coverage, secret scan, require approvals đều phải lặp lại và enforce ở CI ạ."

---

## Câu 43: semantic-release `[Senior]`

### Câu hỏi
> "Team muốn bỏ việc bump version và viết CHANGELOG thủ công. Làm sao tự động hoá versioning, tag, CHANGELOG và release hoàn toàn từ commit history?"

### Giải thích lý thuyết

`semantic-release` tự động hoá toàn bộ vòng release dựa trên **Conventional Commits**. Nó **phân tích các commit kể từ release trước**, suy ra version theo SemVer, rồi tag/changelog/publish/release — tất cả trong CI, **không có thao tác tay**.

Cách suy ra version (semver bump):

| Loại commit | Bump | Ví dụ |
|-------------|------|-------|
| `fix:` | **patch** (x.y.**Z**) | 1.2.3 → 1.2.4 |
| `feat:` | **minor** (x.**Y**.0) | 1.2.3 → 1.3.0 |
| `BREAKING CHANGE:` trong footer, hoặc `feat!:` | **major** (**X**.0.0) | 1.2.3 → 2.0.0 |
| `chore/docs/refactor/test...` | không release | — |

Pipeline mặc định chạy theo plugin, thứ tự:
1. **commit-analyzer** — đọc commit, quyết định loại bump.
2. **release-notes-generator** — sinh release notes từ commit.
3. **changelog** — ghi/append vào `CHANGELOG.md`.
4. **npm** — bump `package.json` và `npm publish` (nếu publish package).
5. **github** — tạo Git tag + GitHub Release, đính kèm assets.
6. **git** — commit lại `CHANGELOG.md` + `package.json` (với `[skip ci]`).

Điều kiện tiên quyết: **mọi commit (hoặc ít nhất commit cuối khi squash) phải đúng Conventional Commits** — nếu không, semantic-release không suy ra được bump. Vì thế nó đi cặp với commitlint (Câu 40). Thường chạy trên nhánh `main` sau khi merge, trong CI, dùng `GITHUB_TOKEN` và `NPM_TOKEN`.

> **Insight phỏng vấn:** Điểm thể hiện chiều sâu: nhấn rằng semantic-release **chỉ hoạt động nếu commit theo Conventional Commits** — nên nó khép kín vòng "commitlint enforce format → semantic-release tiêu thụ format đó để quyết version". Và nói rõ nó chạy **trong CI trên `main`** (không phải local), loại bỏ hoàn toàn yếu tố con người trong việc bump version — chống lỗi quên bump hay đặt version sai theo cảm tính.

### Code minh hoạ
```jsonc
// .releaserc.json
{
  "branches": ["main", { "name": "beta", "prerelease": true }],
  "plugins": [
    "@semantic-release/commit-analyzer",       // feat->minor, fix->patch, BREAKING->major
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", { "changelogFile": "CHANGELOG.md" }],
    "@semantic-release/npm",                    // bump package.json + publish
    "@semantic-release/github",                 // tạo tag + GitHub Release
    ["@semantic-release/git", {
      "assets": ["CHANGELOG.md", "package.json"],
      "message": "chore(release): ${nextRelease.version} [skip ci]"
    }]
  ]
}
```

```yaml
# .github/workflows/release.yml — chạy trên main, trong CI
name: Release
on:
  push:
    branches: [main]
permissions:
  contents: write       # tạo tag + commit changelog
  issues: write
  pull-requests: write
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }   # cần full history để phân tích commit
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

```bash
# Ví dụ tác động của commit lên version:
git commit -m "fix: handle null user in profile"     # -> patch  1.4.2 -> 1.4.3
git commit -m "feat: add export to CSV"               # -> minor  1.4.3 -> 1.5.0
git commit -m "feat!: drop Node 16 support

BREAKING CHANGE: yêu cầu Node >= 20"                   # -> major  1.5.0 -> 2.0.0
```

### Đáp án mẫu
> "Em dùng semantic-release chạy trong CI trên nhánh `main` sau mỗi merge. Nó phân tích commit theo Conventional Commits từ lần release trước: `fix` thành patch, `feat` thành minor, `BREAKING CHANGE` thành major theo SemVer; rồi tự sinh CHANGELOG, tạo Git tag, GitHub Release và publish npm — không cần ai bump version tay. Điều kiện là commit phải đúng convention, nên em ghép nó với commitlint: commitlint enforce format, semantic-release tiêu thụ format đó để quyết version. Nhờ chạy trong CI nên loại bỏ hoàn toàn lỗi người quên bump hay đặt sai version ạ."
