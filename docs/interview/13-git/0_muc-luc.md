---
sidebar_position: 0
title: "Mục lục tra cứu 48 câu"
---

# Mục lục tra cứu — Git & Version Control (48 câu)

> *48 câu được gom theo chủ đề vào 7 file. Tra số câu ở bảng dưới để biết câu nằm ở file nào.*

| Câu | Nội dung | Level | File |
|----:|----------|-------|------|
| 1 | Git Flow là gì, các branching strategy phổ biến | Basic | [1. Branching Strategies](./1_branching-strategies.md) |
| 2 | GitHub Flow vs Git Flow — startup 5 người chọn gì | Intermediate | [1. Branching Strategies](./1_branching-strategies.md) |
| 3 | Khi nào chuyển từ Git Flow sang Trunk-based | Senior | [1. Branching Strategies](./1_branching-strategies.md) |
| 4 | Monorepo nhiều teams — branching tránh block lẫn nhau | Senior | [1. Branching Strategies](./1_branching-strategies.md) |
| 5 | Release branch để làm gì, khi nào là overhead | Intermediate | [1. Branching Strategies](./1_branching-strategies.md) |
| 6 | Polyrepo vs Monorepo — workflow khác nhau, khi nào migrate | Senior | [1. Branching Strategies](./1_branching-strategies.md) |
| 7 | Sửa commit nhầm (message/quên file) không tạo commit mới | Basic | [2. Commit & Lịch sử sạch](./2_commit-lich-su-sach.md) |
| 8 | Conventional Commits & tại sao enforce bằng commitlint | Intermediate | [2. Commit & Lịch sử sạch](./2_commit-lich-su-sach.md) |
| 9 | Atomic commits & tại sao commit gộp là anti-pattern | Intermediate | [2. Commit & Lịch sử sạch](./2_commit-lich-su-sach.md) |
| 10 | Interactive rebase — squash, fixup, reword, drop | Intermediate | [2. Commit & Lịch sử sạch](./2_commit-lich-su-sach.md) |
| 11 | Rebase interactive edit mode làm được gì hơn squash | Senior | [2. Commit & Lịch sử sạch](./2_commit-lich-su-sach.md) |
| 12 | Khi nào squash merge thay vì merge commit, trade-offs | Intermediate | [2. Commit & Lịch sử sạch](./2_commit-lich-su-sach.md) |
| 13 | Signed commits với GPG/SSH, khi nào enterprise enforce | Senior | [2. Commit & Lịch sử sạch](./2_commit-lich-su-sach.md) |
| 14 | Rebase vs merge & golden rule of rebasing | Intermediate | [3. Merge, Rebase & Conflict](./3_merge-rebase-conflict.md) |
| 15 | Fast-forward merge vs no-ff merge | Intermediate | [3. Merge, Rebase & Conflict](./3_merge-rebase-conflict.md) |
| 16 | 3-way merge là gì, khi nào phải manual resolve | Intermediate | [3. Merge, Rebase & Conflict](./3_merge-rebase-conflict.md) |
| 17 | Resolve conflict an toàn khi cả 2 sides refactor | Intermediate | [3. Merge, Rebase & Conflict](./3_merge-rebase-conflict.md) |
| 18 | git pull tạo merge commit thừa & fix với --rebase | Intermediate | [3. Merge, Rebase & Conflict](./3_merge-rebase-conflict.md) |
| 19 | Feature branch cách main 50 commits — merge an toàn | Senior | [3. Merge, Rebase & Conflict](./3_merge-rebase-conflict.md) |
| 20 | Rebase conflict nhiều commits — tránh "rebase hell" | Senior | [3. Merge, Rebase & Conflict](./3_merge-rebase-conflict.md) |
| 21 | git rerere — không resolve cùng conflict nhiều lần | Senior | [3. Merge, Rebase & Conflict](./3_merge-rebase-conflict.md) |
| 22 | git cherry-pick — khi nào đúng, khi nào là code smell | Senior | [3. Merge, Rebase & Conflict](./3_merge-rebase-conflict.md) |
| 23 | Hotfix production 2h sáng giữa sprint — quy trình chuẩn | Senior | [4. Undo, Recovery & Sự cố](./4_undo-recovery-disaster.md) |
| 24 | Undo public commit đã merge — revert vs reset | Intermediate | [4. Undo, Recovery & Sự cố](./4_undo-recovery-disaster.md) |
| 25 | Branch bị xóa nhầm chưa merge — recover | Intermediate | [4. Undo, Recovery & Sự cố](./4_undo-recovery-disaster.md) |
| 26 | git reset --hard xóa 3 commit chưa push — recover | Intermediate | [4. Undo, Recovery & Sự cố](./4_undo-recovery-disaster.md) |
| 27 | Teammate force push làm mất commit — recover | Senior | [4. Undo, Recovery & Sự cố](./4_undo-recovery-disaster.md) |
| 28 | Force push nhầm lên main — khôi phục khẩn cấp | Senior | [4. Undo, Recovery & Sự cố](./4_undo-recovery-disaster.md) |
| 29 | --force vs --force-with-lease & cách enforce | Intermediate | [4. Undo, Recovery & Sự cố](./4_undo-recovery-disaster.md) |
| 30 | Khi nào force push acceptable, khi nào tuyệt đối không | Intermediate | [4. Undo, Recovery & Sự cố](./4_undo-recovery-disaster.md) |
| 31 | Rollback production — git revert hay deploy previous tag | Senior | [4. Undo, Recovery & Sự cố](./4_undo-recovery-disaster.md) |
| 32 | Lỡ commit .env chứa credentials lên remote — xử lý | Senior | [4. Undo, Recovery & Sự cố](./4_undo-recovery-disaster.md) |
| 33 | Large file lọt vào history — xóa không phá vỡ cộng tác | Senior | [4. Undo, Recovery & Sự cố](./4_undo-recovery-disaster.md) |
| 34 | git log -S và -G (pickaxe) — cứu bạn khi debug | Senior | [5. Điều tra lịch sử & Debug](./5_dieu-tra-lich-su.md) |
| 35 | git blame — use case hữu ích ngoài "đổ lỗi" | Intermediate | [5. Điều tra lịch sử & Debug](./5_dieu-tra-lich-su.md) |
| 36 | git bisect — tìm commit gây regression | Senior | [5. Điều tra lịch sử & Debug](./5_dieu-tra-lich-su.md) |
| 37 | Branch protection rules — chặn push thẳng lên main | Intermediate | [6. Hooks, Automation & Governance](./6_hooks-automation-governance.md) |
| 38 | CODEOWNERS — enforce review đúng người trong team lớn | Intermediate | [6. Hooks, Automation & Governance](./6_hooks-automation-governance.md) |
| 39 | Husky + lint-staged — tại sao chỉ lint file staged | Intermediate | [6. Hooks, Automation & Governance](./6_hooks-automation-governance.md) |
| 40 | commit-msg hook với commitlint — không block WIP | Intermediate | [6. Hooks, Automation & Governance](./6_hooks-automation-governance.md) |
| 41 | pre-push hook chạy tests — trade-offs & cấu hình | Intermediate | [6. Hooks, Automation & Governance](./6_hooks-automation-governance.md) |
| 42 | Server-side hooks vs client-side hooks — enforce gì | Senior | [6. Hooks, Automation & Governance](./6_hooks-automation-governance.md) |
| 43 | semantic-release — tự động versioning & CHANGELOG | Senior | [6. Hooks, Automation & Governance](./6_hooks-automation-governance.md) |
| 44 | git stash nâng cao — push/pop/apply/list/show/drop | Intermediate | [7. Công cụ nâng cao](./7_cong-cu-nang-cao.md) |
| 45 | git worktree — khi nào tốt hơn stash/clone thứ 2 | Senior | [7. Công cụ nâng cao](./7_cong-cu-nang-cao.md) |
| 46 | Partial clone & shallow clone trong CI/CD | Senior | [7. Công cụ nâng cao](./7_cong-cu-nang-cao.md) |
| 47 | Git submodules vs subtrees — tại sao teams tránh cả hai | Senior | [7. Công cụ nâng cao](./7_cong-cu-nang-cao.md) |
| 48 | Git LFS — setup cho design files & build artifacts lớn | Intermediate | [7. Công cụ nâng cao](./7_cong-cu-nang-cao.md) |
