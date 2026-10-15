---
sidebar_position: 1
title: "Nền tảng"
---

# Nền tảng

## 1. Git là gì? Tại sao phải học Git?

Bài học: [1. Git là gì? Tại sao phải học Git?](../../git/nen-tang/1_git-la-gi.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Git là gì? Giải thích ngắn gọn.**

<details className="qa">
<summary>Xem đáp án</summary>

Git là một Distributed Version Control System (hệ thống quản lý phiên bản phân tán). Nó cho phép nhiều người làm việc trên cùng một dự án, theo dõi mọi thay đổi, và quay lại bất kỳ phiên bản nào trước đó. Git lưu trữ toàn bộ lịch sử trên máy mỗi developer, cho phép làm việc offline và không phụ thuộc vào server trung tâm.

</details>

**2. Phân biệt Git và GitHub.**

<details className="qa">
<summary>Xem đáp án</summary>

Git là phần mềm cài trên máy local, quản lý phiên bản code. GitHub là dịch vụ web cho phép lưu trữ Git repository trên cloud, kèm theo các tính năng cộng tác như Pull Request, Issues, Actions. Git có thể hoạt động độc lập mà không cần GitHub.

</details>

**3. Tại sao Git dùng mô hình distributed thay vì centralized?**

<details className="qa">
<summary>Xem đáp án</summary>

Distributed model cho phép mỗi developer có bản sao đầy đủ của repository, bao gồm toàn bộ lịch sử. Điều này mang lại: (1) Làm việc offline, (2) Tốc độ nhanh vì thao tác trên local, (3) Không có single point of failure, (4) Mỗi clone là một backup tự nhiên. Đây là lý do Git được thiết kế bởi Linus Torvalds để phục vụ hàng ngàn developer của Linux kernel.

</details>

**4. Git lưu dữ liệu như thế nào — snapshot hay diff?**

<details className="qa">
<summary>Xem đáp án</summary>

Git lưu dữ liệu dạng snapshot. Mỗi commit là một ảnh chụp toàn bộ trạng thái của project tại thời điểm đó. Nếu file không thay đổi, Git không copy lại mà tạo một link đến phiên bản trước. Điều này khác với SVN lưu theo dạng delta (chỉ lưu phần thay đổi). Cách lưu snapshot giúp Git nhanh hơn khi chuyển branch và xem lịch sử.

</details>

**5. Kể tên các VCS khác ngoài Git và so sánh.**

<details className="qa">
<summary>Xem đáp án</summary>

- **SVN (Subversion):** Centralized, phổ biến trước Git, vẫn dùng ở một số công ty lớn.
- **Mercurial:** Distributed như Git, cú pháp dễ hơn nhưng ít phổ biến hơn.
- **Perforce:** Centralized, mạnh về file lớn (game development, media).
- **CVS:** Thế hệ đầu của centralized VCS, hiện đã lỗi thời. Git thống trị nhờ tốc độ, branching mạnh, cộng đồng lớn, và sự tích hợp với GitHub/GitLab.

</details>

---

## 2. Cài đặt và cấu hình Git

Bài học: [2. Cài đặt và cấu hình Git](../../git/nen-tang/2_cai-dat-va-cau-hinh.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Có bao nhiêu cấp cấu hình trong Git? Giải thích thứ tự ưu tiên.**

<details className="qa">
<summary>Xem đáp án</summary>

Git có 3 cấp cấu hình: system (/etc/gitconfig — toàn máy), global (~/.gitconfig — user hiện tại), và local (.git/config — repo hiện tại). Thứ tự ưu tiên từ cao đến thấp: local > global > system. Nghĩa là cấu hình local sẽ ghi đè global, và global ghi đè system. Điều này cho phép cấu hình chung ở global nhưng tuỳ chỉnh riêng cho từng repo ở local.

</details>

**2. Làm thế nào để dùng email khác nhau cho repo cá nhân và repo công ty?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng `git config --global user.email` để thiết lập email mặc định (cá nhân). Trong repo công ty, dùng `git config --local user.email "email@company.com"` để ghi đè. Config local chỉ áp dụng cho repo hiện tại, không ảnh hưởng các repo khác.

</details>

**3. SSH và HTTPS khác nhau thế nào khi làm việc với remote repo?**

<details className="qa">
<summary>Xem đáp án</summary>

HTTPS yêu cầu nhập username/password (hoặc Personal Access Token) mỗi lần push/pull, có thể cache bằng credential helper. SSH dùng cặp key (public/private), sau khi thiết lập một lần thì không cần nhập lại. SSH bảo mật hơn và tiện hơn cho việc sử dụng hàng ngày. HTTPS dễ thiết lập hơn ban đầu và không bị chặn bởi firewall công ty.

</details>

**4. `core.autocrlf` là gì và tại sao cần cấu hình?**

<details className="qa">
<summary>Xem đáp án</summary>

`core.autocrlf` xử lý sự khác biệt về line ending giữa Windows (CRLF - \r\n) và Unix/macOS (LF - \n). Trên Windows, đặt `true` để Git tự động chuyển CRLF -> LF khi commit và LF -> CRLF khi checkout. Trên macOS/Linux, đặt `input` để chỉ chuyển CRLF -> LF khi commit. Điều này ngăn việc line ending tạo ra diff giả khi làm việc nhóm đa nền tảng.

</details>

**5. Làm sao để xem toàn bộ cấu hình Git hiện tại và biết cấu hình nào đến từ file nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng `git config --list` để xem toàn bộ cấu hình. Để biết cấu hình đến từ file nào, dùng `git config --list --show-origin`. Lệnh này hiển thị đường dẫn file trước mỗi giá trị, giúp debug khi cấu hình không như mong đợi.

```bash
# Ví dụ output
git config --list --show-origin
# file:/home/user/.gitconfig    user.name=Nguyen Van A
# file:/home/user/.gitconfig    user.email=personal@gmail.com
# file:.git/config              user.email=work@company.com
```

</details>

---

## 3. Các khái niệm cốt lõi trong Git

Bài học: [3. Các khái niệm cốt lõi trong Git](../../git/nen-tang/3_khai-niem-co-ban.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Giải thích 3 vùng làm việc của Git.**

<details className="qa">
<summary>Xem đáp án</summary>

Git có 3 vùng: (1) Working Directory — nơi bạn chỉnh sửa file trực tiếp, (2) Staging Area (Index) — vùng trung gian, chọn những thay đổi cần commit, và (3) Repository (.git) — cơ sở dữ liệu lưu trữ vĩnh viễn các commit. Luồng làm việc: sửa file ở Working Directory -> `git add` để đưa vào Staging -> `git commit` để lưu vào Repository. Staging Area cho phép selective commit — chỉ commit những thay đổi liên quan với nhau.

</details>

**2. Commit trong Git là snapshot hay diff? Giải thích.**

<details className="qa">
<summary>Xem đáp án</summary>

Commit là snapshot — ảnh chụp toàn bộ trạng thái của dự án tại thời điểm commit. Git không lưu diff giữa các version. Tuy nhiên, Git tối ưu bằng cách: nếu file không thay đổi, Git chỉ lưu một link (reference) đến blob cũ thay vì copy lại. Nhờ vậy Git vừa nhanh (truy xuất trực tiếp snapshot) vừa tiết kiệm dung lượng (không lưu trùng lặp).

</details>

**3. HEAD là gì? Detached HEAD là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

HEAD là con trỏ cho biết vị trí hiện tại trong lịch sử Git. Bình thường, HEAD trỏ đến một branch (ví dụ main), và khi commit, branch đó tiến lên commit mới. Detached HEAD xảy ra khi checkout trực tiếp một commit thay vì branch — khi đó HEAD trỏ đến commit cụ thể thay vì branch. Commit trong trạng thái này sẽ không thuộc branch nào và có thể bị mất khi chuyển branch. Cách xử lý: tạo branch mới tại vị trí đó bằng `git checkout -b ten-branch`.

</details>

**4. Branch trong Git là gì về mặt kỹ thuật?**

<details className="qa">
<summary>Xem đáp án</summary>

Về kỹ thuật, branch chỉ là một file nhỏ (41 bytes) chứa SHA-1 hash của commit mới nhất trên branch đó. Ví dụ, file `.git/refs/heads/main` chứa hash của commit cuối trên main. Vì tạo branch chỉ là tạo 1 file nhỏ, nên thao tác branching trong Git cực nhanh, khác với SVN phải copy toàn bộ thư mục.

</details>

**5. Git lưu dữ liệu như thế nào bên trong thư mục .git?**

<details className="qa">
<summary>Xem đáp án</summary>

Git lưu 3 loại object trong `.git/objects/`: (1) Blob — nội dung file (không có tên file), (2) Tree — giống thư mục, chứa danh sách blobs và trees con, (3) Commit — metadata (author, date, message) + pointer đến tree root. Mỗi object được định danh bằng SHA-1 hash của nội dung. HEAD là file trỏ đến branch hiện tại, refs/heads/ chứa các branch pointer, và index là Staging Area.

</details>

---

## 4. Các lệnh Git cơ bản

Bài học: [4. Các lệnh Git cơ bản](../../git/nen-tang/4_lenh-git-co-ban.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Sự khác nhau giữa `git add .` và `git add -A`?**

<details className="qa">
<summary>Xem đáp án</summary>

`git add .` thêm tất cả file mới, đã sửa, đã xoá **trong thư mục hiện tại và các thư mục con**. `git add -A` (hoặc `--all`) thêm tất cả thay đổi **trong toàn bộ repository**, bất kể bạn đang ở thư mục nào. Khi bạn đang ở root của repo, 2 lệnh cho kết quả giống nhau. Khác biệt chỉ xuất hiện khi bạn đang ở thư mục con.

</details>

**2. `git diff` và `git diff --staged` khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`git diff` so sánh Working Directory với Staging Area — cho thấy những thay đổi chưa được `git add`. `git diff --staged` (hoặc `--cached`) so sánh Staging Area với commit cuối cùng — cho thấy những thay đổi đã `git add` và sẽ được commit. Để xem tất cả thay đổi (cả staged và unstaged), dùng `git diff HEAD`.

</details>

**3. Làm sao để undo commit cuối cùng?**

<details className="qa">
<summary>Xem đáp án</summary>

Có 3 cách tuỳ theo mức độ:

- `git reset --soft HEAD~1`: Undo commit, giữ file trong Staging Area. Thích hợp khi muốn sửa message hoặc thêm file.
- `git reset --mixed HEAD~1` (mặc định): Undo commit, chuyển file về Working Directory. Thích hợp khi muốn stage lại theo cách khác.
- `git reset --hard HEAD~1`: Undo commit VÀ xoá mọi thay đổi. **NGUY HIỂM** — mất dữ liệu vĩnh viễn.
- `git commit --amend`: Không undo mà sửa commit cuối (đổi message, thêm file). Chỉ dùng khi chưa push.

</details>

**4. Giải thích `git commit -am` và hạn chế của nó.**

<details className="qa">
<summary>Xem đáp án</summary>

`git commit -am "message"` kết hợp `git add` và `git commit` trong 1 lệnh. Flag `-a` tự động stage tất cả file **đã tracked** (đã commit trước đó) mà có thay đổi. Hạn chế: nó **không** thêm file mới (untracked files). File mới phải được `git add` riêng trước khi commit. Nên `-am` chỉ tiện khi làm việc với file đã có, không phù hợp khi tạo file mới.

</details>

**5. `git clone --depth 1` là gì và khi nào nên dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

`--depth 1` tạo một "shallow clone" — chỉ tải commit mới nhất, không tải toàn bộ lịch sử. Điều này làm giảm đáng kể thời gian và dung lượng khi clone repo lớn. Sử dụng trong: CI/CD pipeline (chỉ cần build code mới nhất), thử nhanh code người khác, repo có lịch sử quá lớn. Hạn chế: không thể xem full log, không thể push thay đổi (trong một số trường hợp), và một số thao tác Git sẽ bị giới hạn.

</details>

---

## 5. .gitignore và quản lý file

Bài học: [5. .gitignore và quản lý file](../../git/nen-tang/5_gitignore-va-quan-ly-file.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. .gitignore là gì và tại sao quan trọng?**

<details className="qa">
<summary>Xem đáp án</summary>

`.gitignore` là file đặc biệt cho Git biết những file/thư mục nào không nên track. Quan trọng vì: (1) Giữ repo sạch — không commit dependencies (node_modules), build output (dist), file tạm, (2) Bảo mật — tránh commit secrets (.env, credentials), (3) Giảm kích thước repo — không lưu file có thể tải lại. Mỗi dự án nên có .gitignore từ đầu.

</details>

**2. Làm sao để bỏ qua file đã được Git track?**

<details className="qa">
<summary>Xem đáp án</summary>

`.gitignore` chỉ ảnh hưởng file chưa được track. Nếu file đã commit, phải xoá khỏi tracking trước bằng `git rm --cached <file>`, sau đó thêm vào `.gitignore` rồi commit. Lệnh `git rm --cached` chỉ xoá file khỏi Git index, không xoá file thực trên ổ cứng.

</details>

**3. Phân biệt global gitignore và local gitignore.**

<details className="qa">
<summary>Xem đáp án</summary>

Local `.gitignore` nằm trong repo, được commit và chia sẻ với team — dùng cho file liên quan đến dự án (node_modules, build, .env). Global gitignore (`~/.gitignore_global`) là cấu hình cá nhân, chỉ trên máy của bạn — dùng cho file liên quan đến IDE (.idea, .vscode) và OS (.DS_Store, Thumbs.db). Global gitignore không ảnh hưởng repo của người khác.

</details>

**4. Đã commit nhầm file chứa secret và push lên remote. Phải làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Bước 1 (NGAY LẬP TỨC): Rotate tất cả secrets đã lộ — đổi mật khẩu, revoke API keys, tạo tokens mới. Đây là bước quan trọng nhất vì dù bạn xoá file khỏi Git, người khác có thể đã clone repo. Bước 2: Dùng BFG Repo-Cleaner hoặc `git filter-branch` để xoá file khỏi toàn bộ lịch sử Git. Bước 3: Force push và yêu cầu team clone lại. Bước 4: Thêm file vào .gitignore để tránh lặp lại.

</details>

**5. `git rm --cached` khác `git rm` như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`git rm <file>` xoá file khỏi cả Git tracking VÀ xoá file thực trên ổ cứng. `git rm --cached <file>` chỉ xoá file khỏi Git tracking (Staging Area), giữ file nguyên trên ổ cứng. Dùng `--cached` khi bạn muốn ngừng track file nhưng vẫn giữ nó trên máy — ví dụ: xoá .env khỏi Git nhưng vẫn cần file để chạy ứng dụng local.

</details>
