---
sidebar_position: 1
title: "Máy tính hoạt động thế nào"
---

# Máy tính hoạt động thế nào

## 1. Cấu tạo máy tính

Bài học: [1. Cấu tạo máy tính](../../computer-science/01-how-computers-work/1_cau-tao-may-tinh.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Kiến trúc von Neumann là gì? Nút thắt von Neumann là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Kiến trúc von Neumann gồm CPU (khối điều khiển + ALU + thanh ghi), **một bộ nhớ chứa cả lệnh lẫn dữ liệu**, thiết bị vào/ra, nối nhau bằng bus. Ý tưởng cốt lõi là **chương trình được lưu trong bộ nhớ** như dữ liệu.

**Nút thắt von Neumann:** lệnh và dữ liệu cùng đi qua đường truyền tới bộ nhớ, mà bộ nhớ chậm hơn CPU rất nhiều, nên CPU thường phải chờ. Cache, prefetch, pipeline là các kỹ thuật giảm thiểu nút thắt này.

</details>

**2. RAM và SSD khác nhau thế nào? Vì sao không dùng SSD thay RAM?**

<details className="qa">
<summary>Xem đáp án</summary>

- **RAM:** volatile, độ trễ khoảng 100 ns, CPU truy cập trực tiếp theo byte, đắt, dung lượng nhỏ.
- **SSD:** non-volatile, độ trễ khoảng chục đến trăm µs (chậm hơn khoảng 1.000 lần), truy cập theo khối qua driver, rẻ, dung lượng lớn.

Không thay được vì SSD quá chậm cho việc CPU đọc ghi liên tục, và flash NAND có giới hạn số lần ghi. Khi hệ điều hành buộc phải dùng SSD làm "RAM phụ" (swap), máy chậm đi rõ rệt.

</details>

**3. Mô tả quá trình khởi động máy tính từ lúc bấm nút nguồn.**

<details className="qa">
<summary>Xem đáp án</summary>

1. PSU ổn định điện, báo Power Good.
2. CPU reset, chạy lệnh tại địa chỉ cố định trỏ vào chip firmware.
3. Firmware (BIOS/UEFI) chạy POST, khởi tạo phần cứng, tìm thiết bị boot.
4. Firmware nạp **bootloader** (GRUB, Windows Boot Manager...) vào RAM.
5. Bootloader nạp **kernel** (và initramfs) vào RAM rồi chuyển quyền.
6. Kernel khởi tạo bộ nhớ ảo, driver, scheduler, mount filesystem, chạy tiến trình đầu tiên (systemd/launchd), từ đó khởi động dịch vụ và giao diện.

</details>

**4. Khi chạy một chương trình, dữ liệu đi từ SSD tới CPU thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Kernel tạo tiến trình, ánh xạ file thực thi vào không gian địa chỉ ảo. Khi CPU truy cập trang chưa có trong RAM → **page fault** → kernel đọc trang từ SSD (hoặc lấy từ page cache) vào RAM. Sau đó CPU đọc lệnh và dữ liệu từ RAM qua các tầng cache L3 → L2 → L1 rồi vào thanh ghi để thực thi. Lần chạy thứ hai thường nhanh hơn vì file đã nằm trong page cache.

</details>

**5. BIOS và UEFI khác nhau ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- BIOS chạy ở chế độ 16-bit, dùng MBR (ổ tối đa khoảng 2 TB, 4 phân vùng chính), đọc 512 byte đầu ổ để tìm bootloader.
- UEFI chạy 32/64-bit, dùng GPT (ổ rất lớn, nhiều phân vùng), đọc file `.efi` trong phân vùng EFI, hỗ trợ **Secure Boot** để chỉ chạy bootloader có chữ ký hợp lệ.

</details>

**6. CPU và GPU khác nhau thế nào? Khi nào dùng GPU?**

<details className="qa">
<summary>Xem đáp án</summary>

CPU có ít nhân mạnh, tối ưu cho logic tuần tự, nhiều rẽ nhánh, độ trễ thấp. GPU có hàng nghìn nhân đơn giản, tối ưu cho **cùng một phép tính trên lượng dữ liệu lớn** (song song dữ liệu). Dùng GPU cho đồ hoạ, xử lý ảnh/video, nhân ma trận trong machine learning; web server, database, logic nghiệp vụ vẫn chạy trên CPU.

</details>

---

## 2. Máy tính tính toán thế nào

Bài học: [2. Máy tính tính toán thế nào](../../computer-science/01-how-computers-work/2_may-tinh-tinh-toan-the-nao.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao `0.1 + 0.2 !== 0.3` trong JavaScript? Xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`number` là double IEEE 754 (64-bit, 52 bit định trị). 0,1 và 0,2 là phân số lặp vô hạn trong hệ nhị phân nên bị làm tròn khi lưu. Tổng hai giá trị đã làm tròn được làm tròn tiếp ra `0.30000000000000004`, khác với giá trị double gần nhất của 0,3.

Cách xử lý: so sánh với sai số (`Math.abs(a - b) < Number.EPSILON`, hoặc epsilon phù hợp với độ lớn), tính tiền bằng số nguyên đơn vị nhỏ nhất hoặc thư viện decimal, làm tròn khi hiển thị.

</details>

**2. Bù 2 là gì? Vì sao máy tính dùng nó để biểu diễn số âm?**

<details className="qa">
<summary>Xem đáp án</summary>

Số đối của x trong bù 2 = đảo tất cả bit của x rồi cộng 1. Bit cao nhất là bit dấu. Với n bit, dải là -2^(n-1) đến 2^(n-1) - 1 (8 bit: -128 đến 127).

Lý do dùng: chỉ có **một số 0**, và **phép trừ trở thành phép cộng** (`a - b = a + (~b + 1)`), nên CPU dùng chung một bộ cộng cho cả số có dấu và không dấu, mạch đơn giản hơn.

</details>

**3. `Number.MAX_SAFE_INTEGER` là bao nhiêu và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`2^53 - 1 = 9007199254740991`. Double có 52 bit định trị cộng 1 bit ẩn = 53 bit chính xác. Sau ngưỡng này, khoảng cách giữa hai số double liền kề lớn hơn 1, nên không phải số nguyên nào cũng biểu diễn được (`2**53 === 2**53 + 1` là `true`). Cần số nguyên lớn hơn thì dùng `BigInt`.

</details>

**4. Half adder và full adder khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Half adder** cộng 2 bit: Sum = A XOR B, Carry = A AND B. Không nhận số nhớ từ cột trước.
- **Full adder** cộng 3 bit (A, B và số nhớ vào Cin): Sum = A XOR B XOR Cin, Cout = (A AND B) OR (Cin AND (A XOR B)).

Nối n full adder thành chuỗi được bộ cộng n-bit (ripple-carry). CPU thực tế dùng carry-lookahead để nhanh hơn.

</details>

**5. Tràn số là gì? Java và JavaScript xử lý khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Tràn số xảy ra khi kết quả vượt dải biểu diễn của kiểu có kích thước cố định; bit thừa bị bỏ và giá trị quay vòng.

- **Java:** `int`/`long` quay vòng im lặng (`Integer.MAX_VALUE + 1` thành `Integer.MIN_VALUE`); dùng `Math.addExact` để phát hiện.
- **JavaScript `number`:** không quay vòng mà mất chính xác sau `2^53 - 1`, rất lớn thì thành `Infinity`. Nhưng phép toán bit và typed array thì quay vòng theo 32-bit hoặc kích thước phần tử. `BigInt` không bị tràn.

</details>

**6. Unicode và UTF-8 khác nhau thế nào? Vì sao `'😀'.length === 2`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Unicode** là bảng gán mỗi ký tự một số (code point, ví dụ U+1F600). **UTF-8** là cách mã hoá code point thành 1–4 byte (tương thích ASCII). Chuỗi JS lưu theo **UTF-16**: code point vượt U+FFFF (như emoji) cần 2 đơn vị 16-bit (cặp surrogate), mà `.length` đếm đơn vị UTF-16 nên ra 2. Đếm theo code point dùng `[...str].length`, đếm theo ký tự hiển thị dùng `Intl.Segmenter`.

</details>

---

## 3. Thanh ghi và RAM

Bài học: [3. Thanh ghi và RAM](../../computer-science/01-how-computers-work/3_thanh-ghi-va-ram.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Thanh ghi là gì? Kể tên vài thanh ghi đặc biệt và vai trò của chúng.**

<details className="qa">
<summary>Xem đáp án</summary>

Thanh ghi là ô nhớ nhỏ nhất, nhanh nhất, nằm trong CPU, rộng bằng word size. CPU tính toán trên dữ liệu trong thanh ghi.

- **Program Counter** (`rip`, `pc`): địa chỉ lệnh kế tiếp; lệnh nhảy/gọi hàm thay đổi PC.
- **Stack Pointer** (`rsp`, `sp`): địa chỉ đỉnh stack, thay đổi khi gọi hàm, return, push, pop.
- **Flags** (`rflags`, `nzcv`): cờ Zero, Negative, Carry, Overflow từ phép tính trước, dùng cho lệnh nhảy có điều kiện.
- **Thanh ghi đa dụng**: chứa toán hạng, địa chỉ, tham số hàm, giá trị trả về.

</details>

**2. SRAM và DRAM khác nhau thế nào? Vì sao DRAM cần refresh?**

<details className="qa">
<summary>Xem đáp án</summary>

- **SRAM:** khoảng 6 transistor mỗi bit, nhanh, đắt, mật độ thấp, không cần refresh → dùng làm cache.
- **DRAM:** 1 transistor + 1 tụ điện mỗi bit, chậm hơn, rẻ, mật độ cao → dùng làm RAM chính.

DRAM lưu bit bằng điện tích trong tụ điện, tụ rò điện dần nên sau vài chục ms dữ liệu sẽ mất. Bộ điều khiển phải đọc rồi ghi lại từng hàng theo chu kỳ (chuẩn JEDEC: trong vòng 64 ms ở nhiệt độ thường). Đọc DRAM cũng là đọc phá huỷ nên phải ghi lại.

</details>

**3. Big-endian và little-endian là gì? Khi nào dev web cần quan tâm?**

<details className="qa">
<summary>Xem đáp án</summary>

Là thứ tự đặt các byte của một số nhiều byte trong bộ nhớ. Big-endian đặt byte lớn nhất ở địa chỉ thấp nhất; little-endian đặt byte nhỏ nhất ở địa chỉ thấp nhất. `0x12345678` lưu big-endian là `12 34 56 78`, little-endian là `78 56 34 12`.

x86 và ARM (thông dụng) là little-endian; mạng TCP/IP và nhiều định dạng file (PNG) là big-endian. Dev web gặp khi đọc ghi dữ liệu nhị phân: `DataView` (mặc định big-endian, có tham số `littleEndian`), `Buffer.readUInt32BE/LE`, WebSocket frame, file âm thanh, ảnh.

</details>

**4. Vì sao duyệt mảng 2 chiều theo hàng thường nhanh hơn theo cột?**

<details className="qa">
<summary>Xem đáp án</summary>

Mảng row-major lưu các phần tử cùng hàng liền nhau trong RAM. CPU nạp dữ liệu theo **cache line** (thường 64 byte), nên duyệt theo hàng dùng hết các phần tử trong mỗi cache line đã nạp (tính cục bộ không gian) và bộ prefetch dự đoán được. Duyệt theo cột nhảy cách quãng, mỗi bước có thể là một cache miss phải xuống RAM — tốn khoảng vài trăm chu kỳ mỗi lần.

</details>

**5. Hệ thống 32-bit giới hạn RAM bao nhiêu và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Địa chỉ 32 bit đánh số được 2³² byte = 4 GiB, nên không gian địa chỉ tối đa là 4 GiB, và một phần còn bị dành cho thiết bị (memory-mapped I/O), nên thực tế hệ điều hành thường chỉ thấy khoảng 3,x GB. Mỗi tiến trình thường chỉ dùng được 2–3 GiB. CPU 64-bit (x86-64 dùng 48 bit địa chỉ ảo = 256 TiB) gỡ bỏ giới hạn này, đổi lại con trỏ 8 byte tốn bộ nhớ hơn (V8 và JVM có kỹ thuật nén con trỏ để bù).

</details>

**6. Khi máy hết RAM thì điều gì xảy ra?**

<details className="qa">
<summary>Xem đáp án</summary>

Hệ điều hành lần lượt: thu hồi page cache, nén bộ nhớ (nếu hỗ trợ), đẩy trang ít dùng ra **swap** trên ổ đĩa — làm máy chậm đi rất nhiều vì ổ đĩa chậm hơn RAM hàng nghìn lần. Nếu vẫn thiếu, Linux chạy **OOM killer** giết tiến trình tốn RAM nhất (container báo `OOMKilled`). Độc lập với đó, runtime như V8/JVM có giới hạn heap riêng và ném lỗi out of memory khi chạm giới hạn.

</details>

---

## 4. Lệnh và chương trình

Bài học: [4. Lệnh và chương trình](../../computer-science/01-how-computers-work/4_lenh-va-chuong-trinh.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. ISA là gì? Khác gì với vi kiến trúc?**

<details className="qa">
<summary>Xem đáp án</summary>

**ISA** (Instruction Set Architecture) là đặc tả giao diện giữa phần mềm và CPU: danh sách lệnh, thanh ghi, kiểu dữ liệu, chế độ địa chỉ, cách mã hoá lệnh, mô hình bộ nhớ. Ví dụ x86-64, ARM64, RISC-V.

**Vi kiến trúc** là cách hiện thực ISA trong silicon: pipeline bao sâu, bao nhiêu ALU, cache lớn cỡ nào, dự đoán rẽ nhánh ra sao. Intel Core và AMD Zen khác vi kiến trúc nhưng cùng ISA x86-64 nên chạy cùng phần mềm.

</details>

**2. CISC và RISC khác nhau thế nào? x86 và ARM thuộc loại nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **CISC** (x86): lệnh dài ngắn khác nhau (1–15 byte), nhiều chế độ địa chỉ, lệnh tính toán có thể dùng toán hạng trong bộ nhớ, giải mã phức tạp.
- **RISC** (ARM, RISC-V): lệnh cố định (4 byte), kiến trúc load/store (chỉ load/store chạm bộ nhớ), nhiều thanh ghi, giải mã đơn giản, tiết kiệm điện.

Ngày nay ranh giới mờ dần: x86 dịch lệnh thành micro-ops kiểu RISC bên trong. Khác biệt thực tế nằm ở độ khó giải mã song song và hệ sinh thái.

</details>

**3. Compiler, assembler và linker làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Compiler:** dịch mã nguồn thành assembly (hoặc thẳng ra mã máy) cho ISA đích, kèm kiểm tra kiểu và tối ưu.
- **Assembler:** chuyển assembly thành mã máy trong object file (`.o`), còn để trống địa chỉ các symbol ở file khác.
- **Linker:** ghép các object file và thư viện, giải quyết symbol (hàm nào ở đâu), sắp xếp địa chỉ, tạo file thực thi (ELF, Mach-O, PE). Liên kết tĩnh chép thư viện vào file; liên kết động để loader nạp thư viện lúc chạy.

</details>

**4. Biên dịch, thông dịch và JIT khác nhau thế nào? V8 và JVM thuộc loại nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **AOT:** dịch ra mã máy trước khi chạy — khởi động nhanh, chạy nhanh, nhưng phải build theo từng target.
- **Thông dịch:** interpreter đọc và thực hiện từng lệnh — di động, khởi động nhanh, chạy chậm.
- **JIT:** chạy bằng interpreter/bytecode trước, đoạn code nóng được biên dịch ra mã máy lúc chạy, có thể tối ưu dựa trên dữ liệu thực tế; cần thời gian warm-up.

**V8** là JIT nhiều tầng (Ignition bytecode → Sparkplug → Maglev → TurboFan, có deoptimize). **HotSpot JVM** thông dịch bytecode từ `javac` rồi JIT bằng C1/C2 (tiered compilation). Cả hai đều kết hợp thông dịch và JIT.

</details>

**5. Vì sao file chạy build trên Mac M1 không chạy được trên Windows x86? Làm sao để phần mềm chạy được trên cả hai?**

<details className="qa">
<summary>Xem đáp án</summary>

Khác cả ba thứ: **ISA** (ARM64 vs x86-64 — CPU không hiểu lệnh), **định dạng file** (Mach-O vs PE — loader không nhận), **hệ điều hành và ABI** (system call, thư viện, quy ước gọi hàm khác nhau).

Cách giải quyết: build riêng cho từng target (CI build matrix, Docker multi-arch), universal binary trên macOS, dùng lớp dịch/giả lập (Rosetta 2, Prism, QEMU), hoặc dùng runtime trung gian độc lập ISA (JVM, Node.js, WebAssembly).

</details>

**6. Opcode và operand là gì? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi lệnh máy gồm **opcode** — mã cho biết phép toán (cộng, nạp, nhảy...) — và **operand** — các toán hạng (thanh ghi, hằng số, địa chỉ bộ nhớ). Ví dụ `add eax, esi` trên x86-64: opcode là ADD (byte `01`), operand là hai thanh ghi `eax` (đích) và `esi` (nguồn), được mã hoá trong byte ModRM `F0`. Trên ARM64, `add w0, w0, w1` gói opcode và cả ba thanh ghi vào một lệnh 32-bit `0x0B010000`.

</details>

---

## 5. CPU thực thi chương trình

Bài học: [5. CPU thực thi chương trình](../../computer-science/01-how-computers-work/5_cpu-thuc-thi-chuong-trinh.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Mô tả chu trình fetch – decode – execute của CPU. Program counter có vai trò gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Fetch:** đọc lệnh tại địa chỉ mà **program counter (PC)** trỏ tới, rồi tăng PC sang lệnh kế tiếp.
- **Decode:** control unit giải mã lệnh — phép toán gì, toán hạng ở đâu.
- **Execute:** ALU tính toán hoặc tính địa chỉ; lệnh load/store truy cập bộ nhớ.
- **Write-back:** ghi kết quả vào thanh ghi đích.

PC quyết định "lệnh nào chạy tiếp". Lệnh nhảy, gọi hàm, `return` thực chất là ghi giá trị mới vào PC.

</details>

**2. Vì sao CPU 3 GHz có thể nhanh hơn CPU 4 GHz?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì thời gian chạy = số lệnh / (IPC × tần số). CPU đời mới thường có **IPC cao hơn** (pipeline rộng hơn, dự đoán rẽ nhánh tốt hơn, cửa sổ out-of-order lớn hơn, cache lớn hơn). Ngoài ra còn tập lệnh mới (SIMD), số nhân, và khả năng giữ xung dưới tải. GHz chỉ so sánh có ý nghĩa giữa hai CPU **cùng kiến trúc**.

</details>

**3. Pipeline là gì? Kể các loại hazard.**

<details className="qa">
<summary>Xem đáp án</summary>

Pipeline chia việc xử lý lệnh thành nhiều giai đoạn và cho nhiều lệnh **chồng lên nhau** ở các giai đoạn khác nhau — độ trễ mỗi lệnh không đổi nhưng thông lượng tăng.

- **Data hazard:** lệnh sau cần kết quả của lệnh trước → forwarding hoặc stall.
- **Control hazard:** chưa biết nhánh nào → dự đoán rẽ nhánh, đoán sai thì xả pipeline.
- **Structural hazard:** hai lệnh tranh cùng một khối phần cứng → nhân đôi tài nguyên.

</details>

**4. Vì sao xử lý mảng đã sắp xếp có thể nhanh hơn mảng chưa sắp xếp, dù cùng số phần tử?**

<details className="qa">
<summary>Xem đáp án</summary>

Do **branch prediction**. Với điều kiện như `if (arr[i] >= 128)`, mảng ngẫu nhiên làm kết quả đúng/sai lộn xộn → predictor đoán sai khoảng 50% → mỗi lần sai mất khoảng 15–20 chu kỳ để xả pipeline. Mảng đã sắp xếp tạo chuỗi "sai...sai, đúng...đúng" → predictor gần như luôn đúng. Nếu trình biên dịch sinh mã không rẽ nhánh (`cmov`) thì chênh lệch biến mất.

</details>

**5. Hyper-threading là gì? "8 nhân 16 luồng" có nghĩa là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Hyper-threading (SMT) cho một nhân vật lý chạy hai luồng phần cứng: mỗi luồng có thanh ghi và PC riêng nhưng dùng chung ALU, cache, pipeline. Khi một luồng chờ bộ nhớ, luồng kia dùng tài nguyên rảnh. "8 nhân 16 luồng" = 8 nhân vật lý, OS thấy 16 CPU logic. Lợi ích thường khoảng 10–30%, không gấp đôi.

</details>

**6. Node.js là single-thread, vậy làm sao tận dụng server nhiều nhân?**

<details className="qa">
<summary>Xem đáp án</summary>

Code JS chạy trên một luồng chính, nhưng:

- I/O được libuv/OS xử lý bất đồng bộ (libuv còn có thread pool cho file, DNS, crypto).
- Việc tính toán nặng: dùng **`worker_threads`** để chạy song song trên nhân khác.
- Scale HTTP: chạy nhiều process bằng **`cluster`**, PM2 cluster mode, hoặc nhiều container sau load balancer.

Số worker tính toán hợp lý ≈ số CPU logic (`os.availableParallelism()`).

</details>

---

## 6. CPU cache

Bài học: [6. CPU cache](../../computer-science/01-how-computers-work/6_cpu-cache.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao CPU cần cache? Phân biệt L1, L2, L3.**

<details className="qa">
<summary>Xem đáp án</summary>

Vì RAM chậm hơn CPU rất nhiều: một lần đọc RAM khoảng 80–100 ns, tương đương vài trăm chu kỳ CPU. Cache SRAM nhỏ và nhanh giữ dữ liệu vừa/sắp dùng để giảm thời gian chờ.

- **L1:** riêng mỗi nhân, nhỏ nhất (khoảng 32–64 KB), nhanh nhất (khoảng 1 ns), tách L1i (lệnh) và L1d (dữ liệu).
- **L2:** thường riêng mỗi nhân, khoảng 256 KB – 2 MB, khoảng 3–5 ns.
- **L3:** dùng chung giữa các nhân, vài MB tới vài chục MB, khoảng 10–20 ns.

</details>

**2. Cache line là gì? Nó ảnh hưởng tới cách viết code thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Cache line là đơn vị trao đổi giữa cache và RAM, thường 64 byte. Đọc 1 byte sẽ kéo cả line về. Vì vậy:

- Duyệt dữ liệu **tuần tự** tận dụng hết line (spatial locality) và giúp prefetcher.
- Dữ liệu hay dùng cùng nhau nên nằm gần nhau.
- Biến được nhiều luồng ghi nên nằm ở line riêng để tránh false sharing.

</details>

**3. Vì sao duyệt mảng 2 chiều theo hàng nhanh hơn theo cột?**

<details className="qa">
<summary>Xem đáp án</summary>

Ma trận lưu theo hàng (row-major) trong JS typed array phẳng, C, Java (từng hàng). Duyệt theo hàng → địa chỉ tăng đều 8 byte → mỗi line 64 byte dùng hết 8 phần tử, prefetcher đoán được. Duyệt theo cột → mỗi bước nhảy cả một hàng (ví dụ 32 KB) → mỗi lần đọc là một line mới, chỉ dùng 1/8, line bị đuổi trước khi được dùng lại → miss liên tục. Cùng O(N²) nhưng có thể chậm hơn nhiều lần.

</details>

**4. Giải thích temporal locality và spatial locality, cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Temporal:** dữ liệu vừa dùng sẽ sớm dùng lại — biến tích luỹ `sum` trong vòng lặp, thân vòng lặp được fetch lặp lại.
- **Spatial:** dữ liệu gần dữ liệu vừa dùng sẽ sớm được dùng — duyệt `arr[i]`, `arr[i + 1]`, lệnh máy nằm liên tiếp nhau.

Cache khai thác temporal bằng cách giữ lại dữ liệu vừa dùng, khai thác spatial bằng cách nạp cả line và prefetch.

</details>

**5. False sharing là gì? Làm sao phát hiện và khắc phục?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai luồng ghi vào **hai biến khác nhau** nằm **chung một cache line**. Giao thức coherence (MESI) làm việc theo line nên mỗi lần ghi buộc line ở nhân kia bị huỷ (Invalid) → line bị chuyển qua lại liên tục, hiệu năng giảm mạnh dù logic không chia sẻ gì.

Phát hiện: benchmark thấy thêm luồng mà không nhanh hơn; công cụ như `perf c2c` trên Linux. Khắc phục: padding/căn lề để mỗi biến nóng ở line riêng (`@Contended`, `LongAdder` trong Java, `alignas(64)` trong C++, giãn chỉ số trong `SharedArrayBuffer`), hoặc cho mỗi luồng đếm cục bộ rồi gộp cuối cùng.

</details>

**6. So sánh write-through và write-back. Liên hệ với cache Redis.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Write-through:** ghi cache đồng thời ghi xuống tầng dưới → tầng dưới luôn mới, nhưng mỗi lần ghi đều chậm và tốn băng thông.
- **Write-back:** chỉ ghi cache, đánh dấu dirty, ghi xuống khi bị đuổi → nhanh, ít lưu lượng, nhưng có lúc tầng dưới cũ và có rủi ro mất dữ liệu nếu cache mất trước khi ghi.

Ở tầng ứng dụng: write-through = ghi DB và cập nhật Redis cùng lúc; write-behind (write-back) = ghi Redis trước, đẩy xuống DB bất đồng bộ qua queue — nhanh hơn nhưng có nguy cơ mất dữ liệu nếu Redis sập.

</details>

---

## 7. Ngắt (interrupt)

Bài học: [7. Ngắt (interrupt)](../../computer-science/01-how-computers-work/7_ngat-cpu.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Interrupt là gì? So sánh polling và interrupt.**

<details className="qa">
<summary>Xem đáp án</summary>

Interrupt là tín hiệu làm CPU tạm dừng việc đang làm, lưu trạng thái, chạy trình xử lý ngắt (ISR) của kernel rồi quay lại. 

- **Polling:** CPU định kỳ hỏi thiết bị — lãng phí khi sự kiện hiếm, độ trễ phụ thuộc chu kỳ hỏi, nhưng hiệu quả khi tải cực cao.
- **Interrupt:** thiết bị chủ động báo — tiết kiệm CPU, phản hồi nhanh, nhưng tải quá cao có thể gây bão ngắt.

Thực tế dùng lai, ví dụ NAPI của Linux chuyển từ ngắt sang polling khi gói tin dồn dập.

</details>

**2. Phân biệt ngắt phần cứng, trap và exception (fault).**

<details className="qa">
<summary>Xem đáp án</summary>

- **Ngắt phần cứng:** bất đồng bộ, đến từ thiết bị (bàn phím, card mạng, timer) qua interrupt controller.
- **Trap:** đồng bộ, do lệnh **cố ý** gọi vào kernel — system call, breakpoint. Quay về lệnh kế tiếp.
- **Fault/exception:** đồng bộ, do lệnh gặp vấn đề — page fault (kernel sửa được rồi chạy lại lệnh), chia số nguyên cho 0 (thường dẫn tới `SIGFPE`), vi phạm quyền (`SIGSEGV`).

</details>

**3. Điều gì xảy ra từ lúc CPU nhận ngắt tới lúc chương trình chạy tiếp?**

<details className="qa">
<summary>Xem đáp án</summary>

1. CPU hoàn tất lệnh hiện tại.
2. Phần cứng lưu PC, cờ, con trỏ stack lên stack kernel.
3. Chuyển sang kernel mode.
4. Tra bảng vector (IDT trên x86) để lấy địa chỉ ISR.
5. ISR lưu thêm thanh ghi, xử lý, báo EOI; phần nặng hoãn sang bottom half.
6. Lệnh quay về từ ngắt (`iretq`) khôi phục trạng thái và chế độ. Nếu kernel quyết định lập lịch lại, trạng thái được khôi phục có thể là của tiến trình khác (context switch).

</details>

**4. System call là gì? Vì sao ứng dụng không thể truy cập phần cứng trực tiếp?**

<details className="qa">
<summary>Xem đáp án</summary>

System call là giao diện để code user mode yêu cầu kernel làm việc đặc quyền (I/O, cấp phát bộ nhớ, tạo tiến trình). Ứng dụng đặt số hiệu syscall và tham số vào thanh ghi, rồi chạy lệnh trap (`syscall` trên x86-64) để vào kernel ở một điểm vào cố định.

Ứng dụng chạy ở user mode (ring 3): lệnh đặc quyền bị CPU chặn, bộ nhớ bị giới hạn trong không gian địa chỉ riêng. Điều này bảo vệ hệ thống — một app lỗi không thể ghi đè dữ liệu app khác hay làm sập kernel. Ví dụ `fs.readFile` trong Node cuối cùng gọi các syscall `openat`, `read`, `close` từ thread pool của libuv.

</details>

**5. Timer interrupt liên quan gì tới đa nhiệm?**

<details className="qa">
<summary>Xem đáp án</summary>

Timer phần cứng phát ngắt định kỳ (hoặc theo hẹn giờ ở chế độ tickless). Mỗi lần ngắt, kernel giành lại CPU dù tiến trình đang chạy có tự nhường hay không, kiểm tra lượt chạy, và có thể context switch sang tiến trình khác. Nhờ vậy một chương trình `while (true)` không chiếm CPU mãi — đó là **đa nhiệm ưu tiên** (preemptive). Ngược lại, event loop của JS là đa nhiệm hợp tác: callback không nhường thì callback khác không chạy được.

</details>

**6. DMA là gì? Nó giúp Node.js xử lý nhiều kết nối như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

DMA cho phép thiết bị tự chép dữ liệu giữa thiết bị và RAM mà CPU không phải chép từng phần; xong mới phát một ngắt. Khi request tới, card mạng DMA gói tin vào RAM rồi ngắt; kernel xử lý TCP/IP và đánh dấu socket sẵn sàng trong epoll/kqueue; event loop của libuv đang ngủ trong `epoll_wait` được đánh thức, đọc dữ liệu và chạy callback JS. Không có luồng nào phải ngồi chờ từng kết nối, nên một luồng JS phục vụ được hàng nghìn kết nối đồng thời.

</details>
