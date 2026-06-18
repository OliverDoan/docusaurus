---
sidebar_position: 5
title: "5. Điều tra lịch sử & Debug"
---

# Điều tra lịch sử & Debug

> *Nhóm câu này kiểm tra khả năng dùng Git như một công cụ điều tra — không chỉ để lưu code mà để truy nguồn gốc của một dòng code, một biến, hay một con bug regression. Người phỏng vấn muốn xem bạn có biết "khảo cổ" lịch sử commit để trả lời câu hỏi "ai, khi nào, và quan trọng nhất là TẠI SAO" hay không.*

---

## Câu 34: `git log -S` và `git log -G` (pickaxe) `[Senior]`

### Câu hỏi
> "`git log -S` và `git log -G` dùng để làm gì? Khi nào chúng cứu bạn trong lúc debug? Sự khác nhau giữa hai cờ này là gì?"

### Giải thích lý thuyết

Hai cờ này thường được gọi là **"pickaxe"** (cái cuốc) — vì chúng giúp bạn "đào" xuyên qua toàn bộ lịch sử để tìm chính xác commit nào đã chạm vào một đoạn code cụ thể. Đây là cứu tinh khi bạn nhìn thấy một dòng code/biến lạ và cần biết nó đến từ đâu, hoặc khi một thứ gì đó **đã từng tồn tại rồi biến mất**.

**`git log -S<string>` (pickaxe theo số lần xuất hiện):**

`-S` tìm các commit mà tại đó **số lần xuất hiện (count)** của chuỗi `<string>` thay đổi giữa trước và sau commit. Nói cách khác: commit đó đã **thêm vào** hoặc **xóa bỏ** dòng/đoạn chứa chuỗi này. Đây chính là cách trả lời câu hỏi: *"Biến `MAX_RETRY` này được introduce ở commit nào?"* hoặc *"Hàm `calculateTax` bị xóa lúc nào?"*.

Lưu ý quan trọng: `-S` mặc định so sánh theo chuỗi con (substring), nó **không** hiển thị các commit chỉ di chuyển dòng đó qua lại mà không làm thay đổi tổng số lần xuất hiện. Thêm `--pickaxe-regex` nếu muốn `-S` hiểu chuỗi như regex.

**`git log -G<regex>` (tìm theo diff khớp regex):**

`-G` tìm các commit mà **nội dung diff** (các dòng được thêm `+` hoặc xóa `-`) khớp với regex — bất kể số lần xuất hiện có đổi hay không. Nghĩa là chỉ cần một dòng đụng tới pattern xuất hiện trong diff của commit, commit đó sẽ được liệt kê.

**Khác biệt cốt lõi giữa `-S` và `-G`:**

| | `-S<string>` | `-G<regex>` |
|---|---|---|
| Tiêu chí | Số LẦN xuất hiện của chuỗi thay đổi | Diff có dòng nào khớp regex |
| Bắt commit chỉ chỉnh sửa cùng dòng (count không đổi) | Không (mặc định) | Có |
| Phù hợp khi | "Dòng này được thêm/xóa ở đâu" | "Mọi commit từng động vào pattern này" |
| Mặc định regex | Không (phải thêm `--pickaxe-regex`) | Có (luôn là regex) |

Ví dụ: nếu một commit đổi `foo(1)` thành `foo(2)`, số lần xuất hiện của chuỗi `foo` **không đổi** → `-S foo` bỏ qua, nhưng `-G foo` **bắt được** vì diff có dòng chứa `foo`.

> **Insight phỏng vấn:** Câu chốt để ghi điểm là phân biệt được "count change" của `-S` với "diff match" của `-G`. Nhấn mạnh use case kinh điển: một feature flag/biến đã bị xóa, code search trên branch hiện tại không thấy gì cả, nhưng `git log -S` đào ra ngay commit đã xóa nó cùng context PR. Đó là lúc pickaxe vượt trội hơn `grep` — `grep` chỉ thấy hiện tại, pickaxe thấy cả quá khứ.

### Code minh hoạ
```bash
# Tìm mọi commit làm thay đổi SỐ LẦN xuất hiện của chuỗi "MAX_RETRY"
# (tức là commit đã thêm hoặc xóa dòng chứa nó)
git log -S 'MAX_RETRY'

# Kèm patch để thấy chính xác diff trong từng commit
git log -S 'MAX_RETRY' -p

# Giới hạn trong một file/đường dẫn cụ thể -> nhanh và tập trung hơn
git log -S 'calculateTax' -- src/services/tax.ts

# -S coi chuỗi như regex (mặc định -S là literal substring)
git log -S 'get(User|Profile)' --pickaxe-regex

# -G: bắt MỌI commit có dòng diff khớp regex,
# kể cả khi chỉ sửa tham số mà không đổi số lần xuất hiện
git log -G 'foo\(.*\)' -- src/

# Kết hợp: tìm commit xóa biến apiKey, xem ai và khi nào
git log -S 'apiKey' --oneline --all -- config/
```

### Đáp án mẫu
> "Pickaxe là hai cờ của `git log` để đào lịch sử theo nội dung code. `-S<chuỗi>` tìm commit nơi số lần xuất hiện của chuỗi đó thay đổi — tức là commit đã thêm hoặc xóa nó. Em hay dùng khi một biến hay feature flag biến mất khỏi codebase, search hiện tại không ra, thì `git log -S` đào ra ngay commit đã xóa cùng context. Còn `-G<regex>` thì rộng hơn: nó bắt mọi commit có dòng diff khớp regex, kể cả khi chỉ sửa cùng một dòng mà số lần xuất hiện không đổi. Nên nếu chỉ đổi `foo(1)` thành `foo(2)` thì `-S foo` bỏ qua nhưng `-G foo` bắt được. Em thường thêm `-- path` để giới hạn phạm vi cho nhanh."

---

## Câu 35: `git blame` trong thực tế `[Intermediate]`

### Câu hỏi
> "`git blame` trong thực tế dùng để làm gì? Nó không chỉ để 'đổ lỗi' — vậy những use case thực sự hữu ích là gì, và bạn dùng những cờ nào?"

### Giải thích lý thuyết

`git blame` gán cho **mỗi dòng** của một file thông tin về commit cuối cùng đã chạm vào dòng đó — gồm hash, tác giả và thời gian. Cái tên "blame" (đổ lỗi) gây hiểu nhầm; trong thực tế giá trị lớn nhất của nó là **tìm context để hiểu WHY**, không phải để tìm người mà trách.

Use case thực sự hữu ích:

**1. Truy ngược ra commit → PR → lý do.** Khi gặp một dòng code khó hiểu (một `if` lạ, một magic number, một workaround), `blame` cho bạn hash commit. Từ hash, bạn đọc commit message, lần ra PR, đọc mô tả và thảo luận — và hiểu được tại sao dòng đó tồn tại. Rất nhiều dòng code "kỳ cục" thực ra là fix cho một bug cụ thể; xóa bừa sẽ làm bug tái xuất.

**2. Giới hạn phạm vi với `-L`.** File lớn thì blame toàn bộ rất nhiễu. `-L 50,80` chỉ blame dòng 50 đến 80, hoặc `-L :functionName:file` blame đúng một hàm.

**3. Bỏ qua nhiễu định dạng:**
- `-w` bỏ qua thay đổi whitespace → không bị quy về commit chỉ reformat indent.
- `-M` theo dõi dòng **di chuyển trong cùng file** (move/copy).
- `-C` theo dõi dòng được **copy từ file khác** sang. Cực kỳ hữu ích khi code bị refactor tách file — blame thường sẽ "đổ" mọi dòng cho commit refactor, mất hết lịch sử thật; `-C -C -C` lần được về tác giả gốc.

**4. `.git-blame-ignore-revs` để loại commit format lớn.** Khi bạn chạy một commit format toàn repo (Prettier, gofmt...), commit đó "nuốt" blame của gần như mọi dòng. Cách xử lý chuẩn: liệt kê các hash commit format đó vào file `.git-blame-ignore-revs`, rồi cấu hình Git/GitHub bỏ qua chúng khi blame — blame sẽ nhảy qua commit format để chỉ về commit có ý nghĩa.

**5. Blame trên IDE/GitHub.** Trên thực tế ít ai gõ `git blame` trên terminal; phổ biến hơn là GitLens trong VS Code (inline blame ngay trên dòng) hoặc nút "Blame" trên GitHub — kèm tính năng "view blame prior to this change" để nhảy ngược qua từng lớp lịch sử.

> **Insight phỏng vấn:** Người phỏng vấn muốn nghe văn hóa "tìm context, không đổ lỗi" (blameless culture). Hãy nói rõ: blame là công cụ khảo cổ để hiểu quyết định trong quá khứ, không phải để chỉ tay vào đồng nghiệp. Ghi điểm thêm bằng cách nhắc tới `.git-blame-ignore-revs` và cờ `-C` — đây là dấu hiệu của người đã thật sự đụng vào codebase có refactor và format hàng loạt, không chỉ học vẹt lý thuyết.

### Code minh hoạ
```bash
# Blame cơ bản: mỗi dòng kèm hash + tác giả + thời gian
git blame src/services/payment.ts

# Chỉ blame dòng 40 -> 60 (file lớn đỡ nhiễu)
git blame -L 40,60 src/services/payment.ts

# Blame đúng một hàm theo tên
git blame -L :processRefund:src/services/payment.ts

# Bỏ qua thay đổi whitespace + theo dõi dòng move/copy
git blame -w -M -C src/services/payment.ts

# Từ hash blame trả về, đọc context đầy đủ của commit đó
git show a1b2c3d

# Bỏ qua các commit format toàn repo khi blame
# 1) Tạo file liệt kê hash của các commit format:
#    echo "<hash-commit-format>" >> .git-blame-ignore-revs
# 2) Cấu hình git dùng nó mặc định:
git config blame.ignoreRevsFile .git-blame-ignore-revs
git blame src/services/payment.ts   # giờ sẽ bỏ qua commit format
```

### Đáp án mẫu
> "Tên là 'blame' nhưng em dùng nó để tìm context chứ không phải đổ lỗi. Mỗi dòng code lạ đều có lý do, nên em blame ra commit cuối chạm vào dòng đó, rồi lần tới commit message và PR để hiểu tại sao nó được viết như vậy — tránh xóa nhầm một workaround đang fix bug. Em hay dùng `-L` để giới hạn theo dòng hoặc theo hàm cho đỡ nhiễu, `-w` để bỏ qua thay đổi whitespace, và `-C -M` để blame xuyên qua code bị di chuyển hay copy giữa các file. Với repo từng format hàng loạt, em thêm các commit format đó vào `.git-blame-ignore-revs` để blame nhảy qua chúng. Thực tế thì em blame chủ yếu qua GitLens trong VS Code hoặc nút Blame trên GitHub."

---

## Câu 36: `git bisect` `[Senior]`

### Câu hỏi
> "`git bisect` hoạt động như thế nào? Cho một scenario thực tế bạn dùng nó để tìm commit gây ra regression."

### Giải thích lý thuyết

`git bisect` thực hiện **binary search (tìm kiếm nhị phân) trên lịch sử commit** để xác định chính xác commit đầu tiên làm hỏng một thứ gì đó. Tiền đề: bạn biết một thời điểm **good** (mọi thứ còn chạy đúng, ví dụ tag của bản release cũ) và một thời điểm **bad** (hiện tại đã hỏng), nhưng không biết commit nào ở giữa là thủ phạm.

Cách hoạt động:

1. `git bisect start` — bắt đầu phiên bisect.
2. `git bisect bad` — đánh dấu commit hiện tại là hỏng.
3. `git bisect good <tag/commit>` — đánh dấu một commit cũ là tốt.
4. Git tự động `checkout` commit nằm **giữa** khoảng good–bad.
5. Bạn test commit đó (chạy app, chạy test) rồi báo lại: `git bisect good` hoặc `git bisect bad`.
6. Git thu hẹp khoảng còn một nửa và checkout commit giữa mới. Lặp lại cho tới khi chỉ còn một commit — đó là **commit đầu tiên gây lỗi**, Git in ra hash kèm thông tin.

Độ phức tạp là **O(log n)**: 1000 commit chỉ cần khoảng 10 lần test thay vì kiểm tra tuần tự cả nghìn lần. Đây là điểm mạnh quyết định khi khoảng commit giữa hai release rất rộng.

**Tự động hóa với `git bisect run`:** thay vì test thủ công từng bước, bạn đưa một script vào — script phải trả về exit code `0` nếu commit **good**, và khác `0` (1–124, trừ 125) nếu **bad** (exit code `125` nghĩa là "không test được / skip"). Git tự chạy script qua từng bước và tự kết luận. Có thể là một file test cụ thể, một lệnh build, hoặc một script reproduce bug.

**Dọn dẹp khi xong:** `git bisect reset` đưa bạn về branch/commit ban đầu (HEAD trước khi bisect). Luôn nhớ chạy lệnh này, vì trong lúc bisect bạn đang ở trạng thái "detached HEAD".

> **Insight phỏng vấn:** Điểm nhấn để ghi điểm là `git bisect run` với script tự động — nó biến một việc thủ công mệt mỏi thành chạy một lệnh rồi đi pha cà phê. Hãy nói rõ quy ước exit code (0 = good, khác 0 = bad, 125 = skip cho commit không build được). Một câu chốt mạnh: bisect chỉ hiệu quả khi bug **tái lập được một cách xác định (deterministic)** và mỗi commit ở trạng thái buildable — nếu bug bữa có bữa không thì binary search sẽ kết luận sai. Đề cập điều này cho thấy bạn hiểu giới hạn của công cụ, không chỉ thuộc lệnh.

### Code minh hoạ
```bash
# Scenario: bản v2.3.0 chạy tốt, nhưng main hiện tại bị lỗi tính sai tổng tiền.
# Có ~400 commit giữa hai mốc, không biết commit nào gây ra.

# 1) Bắt đầu bisect
git bisect start

# 2) Đánh dấu HEAD hiện tại là hỏng
git bisect bad

# 3) Đánh dấu mốc release cũ là tốt
git bisect good v2.3.0

# -> Git tự checkout commit giữa. Chạy app/test để kiểm tra,
#    rồi báo lại kết quả cho từng bước:
git bisect good     # nếu commit này còn chạy đúng
# hoặc
git bisect bad      # nếu commit này đã lỗi

# ... lặp lại vài lần (O(log n)) cho tới khi Git in ra:
# "<hash> is the first bad commit"

# 4) Tự động hóa hoàn toàn bằng script trả exit code:
#    0 = good, khác 0 = bad, 125 = không test được (skip)
git bisect start HEAD v2.3.0
git bisect run npm test -- tests/checkout.spec.ts

# Hoặc dùng script reproduce bug tự viết
git bisect run ./scripts/repro-bug.sh

# 5) Dọn dẹp: quay về branch ban đầu (thoát detached HEAD)
git bisect reset
```

### Đáp án mẫu
> "`git bisect` là binary search trên lịch sử commit để tìm chính xác commit đầu tiên gây regression. Em chỉ cho nó biết một mốc good — thường là tag release cũ còn chạy đúng — và một mốc bad là hiện tại. Git tự checkout commit ở giữa, em test rồi báo `good` hay `bad`, nó thu hẹp khoảng còn một nửa và lặp lại. Vì là tìm nhị phân nên với vài trăm commit em chỉ cần khoảng chục lần test, O(log n). Nếu có sẵn test hoặc script reproduce bug thì em dùng `git bisect run <script>` để Git tự chạy theo quy ước exit code 0 là good, khác 0 là bad, rồi nó tự in ra commit thủ phạm. Xong việc em luôn `git bisect reset` để thoát detached HEAD về branch cũ. Một lưu ý là bug phải tái lập được ổn định thì bisect mới đáng tin."
