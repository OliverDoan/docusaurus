---
sidebar_position: 2
title: "MCP Servers"
---

# MCP Servers

**MCP (Model Context Protocol)** cho phép Claude Code kết nối với các nguồn dữ liệu và công cụ bên ngoài. Hiểu MCP giúp bạn mở rộng khả năng của Claude Code.

---

## 1. MCP là gì?

```
Claude Code (mặc định):
  Đọc file, chạy lệnh, dùng git → OK

Claude Code + MCP:
  + Truy cập database trực tiếp
  + Đọc Figma designs
  + Tìm kiếm web
  + Kết nối Slack, GitHub Issues...
  + Bất kỳ tool nào có MCP server
```

**Nói đơn giản**: MCP = plugin system cho Claude Code.

---

## 2. Cách thêm MCP Server

### Config trong project

Tạo file `.claude/settings.json`:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-figma"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/mydb"
      }
    }
  }
}
```

### Config global

File `~/.claude/settings.json` — áp dụng cho mọi project.

---

## 3. MCP Servers phổ biến

| Server | Chức năng | Khi nào dùng |
|--------|-----------|-------------|
| **Figma** | Đọc designs từ Figma | Design-to-code |
| **PostgreSQL** | Query database | Debug data |
| **GitHub** | Issues, PRs, Actions | Project management |
| **Filesystem** | Đọc file ngoài project | Tham khảo code khác |
| **Web Search** | Tìm kiếm web | Research docs |
| **Context7** | Đọc library docs | Tra cứu API |

---

## 4. Ví dụ: Figma MCP

Sau khi config Figma MCP, bạn có thể:

```
> Implement UI từ Figma design này:
  https://figma.com/design/abc123/MyApp?node-id=1-2

Claude Code sẽ:
1. Đọc design từ Figma (qua MCP)
2. Xem screenshot, layout, colors
3. Tạo component React + CSS
4. Match với design system có sẵn
```

---

## 5. Ví dụ: Database MCP

```
> Xem 10 orders gần nhất có status = 'pending'

Claude Code sẽ:
1. Query PostgreSQL qua MCP
2. Hiển thị kết quả
3. Phân tích nếu bạn hỏi thêm
```

---

## 6. Khi nào cần MCP?

| Tình huống | Cần MCP? |
|-----------|---------|
| Code bình thường | Không |
| Implement từ Figma design | Figma MCP |
| Debug dữ liệu trong DB | Database MCP |
| Tra cứu docs thư viện mới | Context7 MCP |
| Tìm giải pháp trên web | Web Search MCP |

**Mới bắt đầu?** Không cần MCP. Claude Code mặc định đã đủ mạnh. Thêm MCP khi gặp use case cụ thể.

---

## Tips

| Tip | Giải thích |
|-----|-----------|
| Bắt đầu không MCP | Dùng mặc định trước |
| Thêm khi cần | Gặp use case → thêm MCP tương ứng |
| Config trong project | Để team dùng chung |
| Cẩn thận secrets | Đừng commit DB password |
