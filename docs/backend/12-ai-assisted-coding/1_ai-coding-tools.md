---
sidebar_position: 1
title: "1. AI Coding Tools và Applications"
---

# AI Coding Tools và Applications

---

## Mục lục

- [Tools chính 2026](#tools-chính-2026)
- [Claude Code](#claude-code)
- [Cursor](#cursor)
- [GitHub Copilot](#github-copilot)
- [Antigravity](#antigravity)
- [Applications](#applications)
- [Best practices](#best-practices)

---

## Tools chính 2026

| Tool | Type | Vendor | Strength |
|------|------|--------|----------|
| **Claude Code** | CLI / agent | Anthropic | Best autonomous coding |
| **Cursor** | AI-first IDE | Anysphere | Smooth UX, fast |
| **GitHub Copilot** | IDE extension | Microsoft | Mature, multi-model |
| **Windsurf** | AI IDE | Codeium | Cascade agent |
| **Antigravity** | AI agent | Google | Multi-agent system |
| **Cody** | IDE assist | Sourcegraph | Enterprise code search |
| **Continue** | Open source | OSS | Customizable, self-host |

---

## Claude Code

[Claude Code](https://docs.claude.com/en/docs/claude-code/overview) — CLI
agent của Anthropic, **chạy trong terminal**, có quyền edit file + run
command.

```bash
# Install
npm install -g @anthropic-ai/claude-code

# Run trong project
cd my-project
claude
```

Tính năng:

- **Autonomous coding** — multi-step task không cần babysit.
- **File edit + Bash** — tự sửa file, chạy test.
- **Plan mode** — propose trước khi execute.
- **MCP support** — tích hợp tool ngoài.
- **Subagent** — delegate sub-task.
- **Sessions** — continue project lâu dài.

Phù hợp:

- **Refactor lớn** — đụng nhiều file.
- **Debug complex** — multi-file trace.
- **Setup project** — init boilerplate.
- **Migration** — đổi framework, version.

---

## Cursor

[Cursor](https://cursor.com) — IDE fork VSCode, AI-first.

Features:

- **Tab completion** AI predict tiếp.
- **Cmd+K** inline edit.
- **Composer** multi-file edit.
- **Agent mode** autonomous.
- **Codebase indexing** — context full project.
- **Multi-model** — pick Claude, GPT, Gemini.

Pricing: $20/month Pro với rate limit, $200/month Ultra.

Phù hợp:

- Dev đã quen VSCode.
- Project size vừa-lớn.
- Workflow code-along (AI assist khi code, không autonomous hết).

---

## GitHub Copilot

Lâu đời nhất (2021), mature.

**Plans**:

- Individual $10/month.
- Business $19/user.
- Enterprise $39/user.

Features:

- **Inline completion** — phổ biến nhất.
- **Copilot Chat** — Q&A trong IDE.
- **Copilot Agent** — autonomous task (2024+).
- **Multi-model** — Claude, GPT, Gemini select.
- **Tích hợp GitHub** — PR description, review.

Phù hợp:

- Team đã trong GitHub ecosystem.
- Enterprise need SSO, audit log.
- Developer thoải mái với tab-completion style.

---

## Antigravity

[Antigravity](https://antigravity.google) — Google AI agent platform.

Đặc biệt:

- **Multi-agent collaboration**.
- **Long-running task** — đếm bằng giờ.
- **Browser + terminal** access.
- **Gemini 2.5 Pro** under hood.

Mới ra 2024+. Đang evolve nhanh.

---

## Applications

**Code generation**:

```
Prompt: "Tạo Express endpoint POST /users với Zod validation,
         Prisma DB call, error handling."

→ AI sinh code đầy đủ, type-safe.
```

**Refactoring**:

```
Select code → "Refactor for testability"
→ AI extract function, inject dependency.

Select code → "Convert callback to async/await"
→ AI rewrite preserving behavior.
```

**Code Review**:

```
"Review this PR for security issues"
→ AI flag SQL injection, XSS, secret leak.

"Suggest improvements for performance"
→ AI find N+1, missing index, inefficient loop.
```

**Test Generation**:

```
"Generate Vitest tests for this function with edge cases"
→ AI sinh test happy path + null + boundary + error.
```

**Documentation**:

```
"Generate JSDoc for these exports"
"Write README for this package"
"Explain this algorithm step by step"
```

**Bug Detection**:

```
"Why is this test failing?"
"Find race condition in this code"
"Detect potential null reference"
```

---

## Best practices

:::tip[Mẹo]

**1. Give clear context**:

```
# Tệ
"Fix this bug"

# Tốt
"In file user-service.ts, function `createUser` throw `Duplicate email`
even when email is unique in DB. Production logs show this happens
~5% of requests. Investigate concurrency issue."
```

**2. Reference specific files/lines**:

```
"Check the error handling in src/api/users.ts:45-60.
The catch block re-throws but loses stack trace."
```

**3. Show desired output**:

```
"Refactor to match this pattern (from auth.ts):

class UserService {
  async create(data: CreateUserDto): Promise<User> {
    // validate, transform, persist
  }
}"
```

**4. Iterate**:

```
First pass: "Generate basic structure"
Second pass: "Add error handling"
Third pass: "Add unit tests"
```

Mỗi step focused → AI làm tốt hơn 1 prompt huge.

:::

:::warning[Cần lưu ý]

**Pitfalls dùng AI coding**:

**1. Don't blindly trust** — AI có thể:

- Hallucinate function/library không tồn tại.
- Outdated API (training cutoff).
- Subtle bug (off-by-one, race condition).
- Security flaw (`eval`, unsafe deserialization).

→ **Review code** trước khi commit. Test thoroughly.

**2. Sensitive data**:

- Không paste secret, password, customer data vào prompt.
- Enterprise tool có data retention policy → check.
- Self-host model cho project ultra-sensitive (banking).

**3. Code style consistency**:

- AI sinh code đôi khi không match team style.
- Define style guide trong system prompt.
- Run prettier/lint sau khi AI generate.

**4. Architecture decisions**:

- AI tốt cho **implementation**, không tốt cho **architecture**.
- Decide pattern + technology stack → AI làm phần code.
- Đừng để AI "decide" cách tổ chức codebase.

**5. Over-reliance**:

- Vẫn phải **hiểu code** AI sinh ra.
- Junior dev dùng AI mà không học → kiến thức nông.
- Senior: AI là leverage, không thay nền tảng.

:::

:::info[Phân tích]

**AI coding workflow chuẩn 2026**:

```
1. Plan (human + AI)
   - Discuss approach.
   - Define interface.
   - Identify edge case.

2. Generate scaffold (AI)
   - Boilerplate, type, function signature.

3. Implement (AI + human review)
   - AI sinh logic.
   - Human review, adjust.

4. Test (AI generate, human verify)
   - AI sinh unit test.
   - Human check edge case AI miss.

5. Review (AI + human)
   - AI flag issue.
   - Human approve.

6. Commit (human)
   - Conventional commit message.
   - Push, PR.
```

Pattern: **AI accelerate**, không **replace** dev.

Productivity gain với AI coding 2026: **2-4x** cho coding task, ít hơn
cho **architecture, debugging production, customer interaction**.

:::
