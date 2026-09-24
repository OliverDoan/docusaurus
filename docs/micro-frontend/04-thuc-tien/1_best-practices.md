---
sidebar_position: 1
title: "1. Best Practices & Lỗi thường gặp"
---

# Best Practices & Lỗi thường gặp

Bài cuối tổng hợp các **thực hành tốt** khi làm micro-frontend trong thực tế và
những **lỗi phổ biến** khiến dự án trả giá đắt. Đây là phần đúc kết để bạn áp dụng,
sau khi đã nắm khái niệm (mục 1) và kỹ thuật (mục 2–3).

---

:::note[Ghi nhớ nhanh]

- ⭐ **`Design system` dùng chung là bắt buộc** — không có nó, micro-frontend gần như chắc chắn dẫn tới UI chắp vá.
- ⭐ **Tránh các lỗi kinh điển** — dùng khi nhóm nhỏ, quên `singleton` cho React, shared store khổng lồ, thiếu design system, bỏ qua xử lý lỗi tải remote.
- **Chia sẻ dependency nền dạng `singleton`, thống nhất version** — và chỉ chia sẻ thứ thực sự dùng chung.
- **Cô lập style** bằng `CSS Modules` / prefix / `Shadow DOM` để tránh rò rỉ CSS giữa các mảnh.
- **Định nghĩa hợp đồng (`contract`) rõ ràng cho mỗi remote** — props nhận vào, sự kiện phát ra; tận dụng manifest/type hinting của MF 2.0.
- **Lo hiệu năng và vận hành** — chống tải trùng, lazy-load, CDN; `Error Boundary`, observability theo mảnh và fallback khi remote lỗi.

:::

---

## Mục lục

- [Design system: nền tảng của sự nhất quán](#design-system-nền-tảng-của-sự-nhất-quán)
- [Quản lý dependency chung](#quản-lý-dependency-chung)
- [Cô lập style](#cô-lập-style)
- [Versioning & hợp đồng](#versioning--hợp-đồng)
- [Hiệu năng](#hiệu-năng)
- [Vận hành & quan sát](#vận-hành--quan-sát)
- [Checklist & các lỗi thường gặp](#checklist--các-lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Design system: nền tảng của sự nhất quán

Vì mỗi mảnh do một nhóm làm, nguy cơ lớn nhất là **giao diện rời rạc** (nút mỗi
nơi một kiểu). Giải pháp: một **design system** (hệ thống thiết kế) dùng chung.

- Đóng gói component dùng chung (Button, Input, Modal...) thành **một thư viện**
  hoặc **một remote chia sẻ**.
- Chia sẻ **design token** (màu, khoảng cách, font) qua biến CSS hoặc theme chung.
- Coi design system như một mảnh có **chủ sở hữu rõ ràng** và versioning cẩn thận.

> Không có design system, micro-frontend gần như chắc chắn dẫn tới UI chắp vá.

## Quản lý dependency chung

- **Chia sẻ thư viện nền** (`react`, `react-dom`, router) dạng **`singleton`** để
  tránh tải trùng và lỗi đa-bản (xem mục Module Federation).
- **Thống nhất phiên bản** các thư viện chia sẻ giữa các nhóm; lệch version lớn là
  nguồn lỗi runtime khó chịu.
- **Đừng chia sẻ mọi thứ** — chỉ chia sẻ thứ thực sự dùng chung. Chia sẻ tràn lan
  làm các mảnh dính chặt vào nhau.

## Cô lập style

CSS toàn cục dễ "rò rỉ" giữa các mảnh. Các cách cô lập:

| Cách | Mô tả |
| --- | --- |
| **CSS Modules** | Tự sinh tên class cục bộ, tránh đụng tên |
| **Quy ước tiền tố** | Mỗi mảnh prefix class riêng (vd `.cart-…`) |
| **Shadow DOM** | (qua Web Components) cô lập style triệt để |
| **Utility CSS** (Tailwind…) | Giảm CSS tự viết; lưu ý cấu hình nhất quán giữa các mảnh |

> Tránh CSS toàn cục không có phạm vi (global, không scope) — đây là nguồn lỗi
> "mảnh A làm vỡ giao diện mảnh B".

## Versioning & hợp đồng

- Định nghĩa **hợp đồng (contract)** rõ ràng cho mỗi remote: props nhận vào, sự
  kiện phát ra. Coi đó như API công khai.
- **Không phá hợp đồng đột ngột** — đổi breaking thì tăng version và thông báo.
- Cân nhắc **manifest + type hinting** của Module Federation 2.0 để bắt lệch hợp
  đồng sớm (lúc biên dịch thay vì lúc chạy).

## Hiệu năng

- **Theo dõi tải trùng** — kiểm tra Network/bundle xem React hay thư viện lớn có
  bị tải nhiều lần không.
- **Lazy-load mảnh** — chỉ tải remote khi cần (route/tương tác), dùng `Suspense`.
- **Đặt remote gần CDN** — vì host tải remote qua mạng, độ trễ ảnh hưởng trực tiếp.
- **Đo bundle từng mảnh** bằng bundle analyzer; mỗi nhóm chịu trách nhiệm "ngân
  sách" kích thước của mình.

## Vận hành & quan sát

- **Mỗi mảnh một pipeline** build/deploy độc lập — đó là cả điểm mạnh lẫn chi phí.
- **Error Boundary cho từng remote** để một mảnh sập không kéo sập trang (xem demo
  React).
- **Quan sát (observability)**: gắn log/metric kèm *tên mảnh + version* để truy
  vết lỗi xuyên mảnh — vốn là điểm khó nhất khi debug.
- **Fallback khi remote lỗi**: hiển thị thông báo thân thiện thay vì màn hình
  trắng.

## Checklist & các lỗi thường gặp

:::tip Checklist trước khi lên production
- [ ] React/router chia sẻ dạng **`singleton`**, version thống nhất
- [ ] Mỗi remote có **Error Boundary** + trạng thái loading
- [ ] CSS được **cô lập** (CSS Modules / prefix / Shadow DOM)
- [ ] Có **design system** dùng chung cho component & token
- [ ] **Hợp đồng** props/sự kiện của mỗi remote được tài liệu hoá
- [ ] Đã kiểm tra **không tải trùng** dependency lớn
- [ ] Log/metric kèm **tên mảnh + version**
- [ ] Có **fallback** khi remote không tải được
:::

:::danger Các lỗi khiến dự án trả giá
- **Dùng micro-frontend cho nhóm nhỏ** — phức tạp gấp bội mà chẳng được lợi. (Xem
  lại mục 1: nó trị vấn đề *tổ chức*.)
- **Quên `singleton` cho React** → lỗi *"Invalid hook call"* khó hiểu.
- **Shared store khổng lồ** → monolith trá hình, mất luôn tính độc lập.
- **Không có design system** → UI chắp vá, trải nghiệm rời rạc.
- **Bỏ qua xử lý lỗi tải remote** → một mảnh sập làm trắng cả trang.
- **Chia sẻ quá nhiều** giữa các mảnh → coupling chặt, không deploy độc lập được
  nữa.
:::

## Tóm tắt

- **Design system** là bắt buộc để giữ UI nhất quán.
- Chia sẻ dependency nền dạng **`singleton`**, **thống nhất version**, và **chỉ
  chia sẻ thứ thực sự cần**.
- **Cô lập style** (CSS Modules / prefix / Shadow DOM) tránh rò rỉ CSS.
- Định nghĩa **hợp đồng rõ ràng** cho remote; tận dụng manifest/type hinting của
  MF 2.0.
- Lo **hiệu năng** (chống tải trùng, lazy-load, CDN) và **vận hành** (Error
  Boundary, observability theo mảnh, fallback).
- Tránh các lỗi kinh điển: dùng khi nhóm nhỏ, quên `singleton`, shared store
  khổng lồ, thiếu design system, bỏ qua xử lý lỗi.

🎉 Đây là bài cuối của topic **Micro-frontend**. Bạn đã đi từ *khái niệm* → *cách
tích hợp* → *Module Federation thực hành* → *Next.js* → *best practices*. Khi áp
dụng, hãy luôn nhớ: micro-frontend là công cụ cho **quy mô tổ chức**, dùng đúng
chỗ mới phát huy giá trị.

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Micro-frontend giải quyết vấn đề gì? Vì sao nói nó trị vấn đề *tổ chức* nhiều hơn vấn đề kỹ thuật?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó giải quyết bài toán **nhiều nhóm cùng làm trên một frontend lớn**: chia giao diện thành các mảnh độc lập, mỗi mảnh do một nhóm tự chủ phát triển và **deploy riêng**, rồi ghép lại thành một trang liền mạch. Nhờ đó hết cảnh giẫm chân nhau, hết xếp hàng chờ release, và mỗi nhóm nâng cấp công nghệ theo nhịp của mình.

Nói đây là vấn đề tổ chức vì thứ được tháo gỡ là **chi phí phối hợp giữa người với người**, không phải một giới hạn kỹ thuật. Xét thuần kỹ thuật, một monolith viết tốt còn nhẹ hơn, nhanh hơn và dễ debug hơn — micro-frontend thêm chứ không bớt độ phức tạp.

Hệ quả thực dụng: nếu vấn đề của bạn là code rối thì hãy refactor, vì chẻ nhỏ chỉ biến mớ rối trong một app thành mớ rối trải khắp nhiều app. Micro-frontend là công cụ cho **quy mô tổ chức**, dùng đúng chỗ mới phát huy giá trị.

</details>

**2. Khi nào bạn khuyên KHÔNG dùng micro-frontend? Dấu hiệu nào cho thấy team đang trả chi phí phức tạp mà không được lợi?**

<details className="qa">
<summary>Xem đáp án</summary>

Khuyên không dùng khi: **nhóm nhỏ** một đến hai đội, app **vừa và nhỏ** hoặc yêu cầu còn chưa ổn định, chỉ muốn **chia code cho gọn**, hoặc đội **chưa vững build tooling và CI/CD**.

Dấu hiệu đang trả chi phí mà không được lợi:

- Mọi mảnh vẫn **deploy cùng lúc** — tức là chưa hề có độc lập deploy.
- Một thay đổi nhỏ vẫn phải **phối hợp nhiều nhóm**, thường vì shared store hoặc model dùng chung quá lớn.
- **Shell phình to** thành monolith mới, ai muốn thêm gì cũng phải sửa shell.
- Người dùng tải **nhiều bản React**, thời gian tải đầu xấu đi rõ rệt.
- Thời gian dành cho hạ tầng và gỡ lỗi ghép nối nhiều hơn thời gian làm tính năng.
- Không ai trả lời được câu hỏi: **mảnh này thuộc nhóm nào**.

Khi thấy các dấu hiệu trên, phương án lành mạnh thường là gộp lại thành **modular monolith** thay vì cố chữa.

</details>

**3. Vì sao `design system` dùng chung gần như bắt buộc? Bạn phân phối nó bằng thư viện `npm` hay một remote chia sẻ, và đánh đổi của từng cách?**

<details className="qa">
<summary>Xem đáp án</summary>

Bắt buộc vì mỗi mảnh do một nhóm làm, nguy cơ lớn nhất là **giao diện rời rạc** — nút mỗi nơi một kiểu. Không có design system, micro-frontend gần như chắc chắn dẫn tới UI chắp vá.

| | Thư viện npm | Remote chia sẻ |
| --- | --- | --- |
| Cập nhật | Mỗi mảnh nâng version và build lại | Mọi mảnh nhận ngay bản mới |
| Nhất quán | Có thể lệch tạm thời giữa các mảnh | Nhất quán tuyệt đối |
| Tự chủ của nhóm | Cao — tự chọn thời điểm nâng | Thấp — bị đổi giao diện ngoài ý muốn |
| Rủi ro | Nhiều bản cùng tồn tại, bundle nặng hơn | Một lỗi làm hỏng UI toàn trang |
| Type safety | Sẵn có | Phải thêm khai báo |

Cách dung hoà phổ biến: **design token** (màu, khoảng cách, font) chia sẻ lúc runtime qua biến CSS để theme luôn đồng nhất, còn **component** phân phối qua npm để mỗi nhóm chủ động lịch nâng cấp. Dù chọn cách nào, design system phải có **chủ sở hữu rõ ràng** và versioning cẩn thận, đúng như một mảnh thật sự.

</details>

**4. So sánh các cách cô lập style: `CSS Modules`, quy ước tiền tố, `Shadow DOM`, utility CSS. Bạn chọn cách nào trong hoàn cảnh nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Cách | Mô tả | Chọn khi |
| --- | --- | --- |
| **CSS Modules** | Tự sinh tên class cục bộ, tránh đụng tên | Mặc định cho phần lớn dự án cùng dùng bundler |
| **Quy ước tiền tố** | Mỗi mảnh prefix class riêng (vd `.cart-…`) | Hệ thống cũ, CSS viết tay, không đổi được công cụ |
| **Shadow DOM** | Qua Web Components, cô lập style triệt để | Nhúng vào app lạ hoặc hệ thống cũ có CSS hỗn loạn |
| **Utility CSS** | Giảm CSS tự viết | Nhiều nhóm, muốn thống nhất ngôn ngữ thiết kế |

Đánh đổi cần nhớ: Shadow DOM mạnh nhất nhưng khó chia sẻ theme và một số thư viện UI hoạt động không đúng bên trong; tiền tố rẻ nhất nhưng dựa hoàn toàn vào kỷ luật con người; utility CSS cần **cấu hình nhất quán giữa các mảnh**, nếu mỗi nhóm cấu hình khác nhau thì cùng một tên class lại ra kết quả khác nhau.

Điều quan trọng nhất, dù chọn cách nào: **tránh CSS toàn cục không có phạm vi** — đó là nguồn của lỗi "mảnh A làm vỡ giao diện mảnh B".

</details>

**5. Nguyên tắc chia sẻ dependency giữa các mảnh: chia sẻ gì và không chia sẻ gì? Chuyện gì xảy ra khi lệch version?**

<details className="qa">
<summary>Xem đáp án</summary>

**Nên chia sẻ:** thư viện nền giữ trạng thái toàn cục hoặc quá lớn để tải trùng — `react`, `react-dom`, router, và thư viện state nếu thật sự dùng chung. Những thứ này để dạng `singleton` và **thống nhất phiên bản** giữa các nhóm.

**Không nên chia sẻ:** thư viện tiện ích nhỏ, thư viện chỉ một mảnh dùng, và nói chung là mọi thứ không thực sự dùng chung. Chia sẻ tràn lan làm các mảnh **dính chặt vào nhau** — mỗi lần nâng cấp lại phải đồng bộ toàn tổ chức, tức là mất dần độc lập deploy.

Khi lệch version:

- Với `singleton`, cả trang dùng một bản duy nhất, bên yêu cầu bản khác chỉ nhận **cảnh báo** rồi vẫn chạy — nên có thể gọi API chưa tồn tại và lỗi chỉ lộ ra lúc runtime.
- Không dùng `singleton` thì mỗi bên dùng bản riêng: tải trùng, và với React là lỗi hook cùng Context bị thủng.

Đây là loại lỗi khó chịu nhất vì nó không vỡ lúc build. Cách phòng: khai `requiredVersion` rõ ràng và có lịch nâng cấp chung.

</details>

**6. Lỗi *Invalid hook call* trong micro-frontend thường bắt nguồn từ đâu, và khắc phục thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Gần như luôn là do **trang có nhiều bản React cùng chạy**. Hook ghi vào state nội bộ của chính bản React đang render; component từ remote dùng bản khác nên lời gọi hook rơi vào một bản không đang render.

Nguyên nhân cụ thể thường gặp:

- Quên khai `shared` cho `react` và `react-dom` — hoặc chỉ khai ở **một bên**.
- Khai `shared` nhưng thiếu `singleton: true`.
- Khai thiếu `react-dom`, trong khi hai gói này phải cùng bản.

Khắc phục:

```js
shared: {
  react: { singleton: true, requiredVersion: deps.react },
  'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
}
```

Khai giống hệt ở **cả host lẫn remote**, rồi kiểm tra tab Network xem còn bao nhiêu file React được tải — nhiều hơn một là chưa xong. Triệu chứng đi kèm thường là Context bị "thủng": theme, router, store dùng chung im lặng không hoạt động.

</details>

**7. Các mảnh nên giao tiếp với nhau ra sao (custom event, props/callback, shared store)? Vì sao *shared store khổng lồ* là phản mẫu?**

<details className="qa">
<summary>Xem đáp án</summary>

Thứ tự ưu tiên từ lỏng tới chặt:

1. **Props & callback** — host truyền dữ liệu và hàm xuống remote. Rõ ràng nhất, hợp quan hệ cha–con.
2. **Custom events** — các mảnh ngang hàng phát/nghe sự kiện, không cần biết nhau.
3. **Shared store** — chỉ cho dữ liệu toàn cục tối thiểu như người dùng, theme, ngôn ngữ.

Nguyên tắc: chọn **cơ chế lỏng nhất mà vẫn đủ giải quyết bài toán**.

**Shared store khổng lồ** là phản mẫu vì khi mọi mảnh đọc/ghi chung một kho state lớn, bạn đã tái tạo lại monolith — chỉ khác là khó debug hơn. Cụ thể: đổi hình dạng state buộc mọi mảnh phải sửa và deploy cùng lúc (mất độc lập deploy), không ai truy được mảnh nào ghi giá trị sai, mọi mảnh bị khoá vào một thư viện và một phiên bản, và thứ tự khởi tạo giữa các mảnh trở thành nguồn lỗi chỉ xuất hiện lúc chạy.

</details>

**8. Hợp đồng (`contract`) của một remote gồm những gì? Làm sao phát hiện lệch hợp đồng lúc build thay vì lúc chạy?**

<details className="qa">
<summary>Xem đáp án</summary>

Hợp đồng là **API công khai** của một remote, gồm:

- Danh sách **module được expose** và tên của chúng.
- **Props nhận vào** — tên, kiểu, cái nào bắt buộc.
- **Sự kiện phát ra** — tên sự kiện và cấu trúc payload.
- **Kỳ vọng về môi trường**: phiên bản thư viện dùng chung, ngữ cảnh mà host phải cung cấp.

Để bắt lệch sớm thay vì đợi lúc chạy:

- Dùng **manifest và type hinting của Module Federation 2.0** — remote sinh khai báo kiểu khi build, host tải về dùng, nên đổi props là TypeScript báo ngay.
- Hoặc một **package hợp đồng chỉ chứa type**, cả hai bên cùng phụ thuộc.
- Thêm **contract test** trong pipeline của remote, kiểm tra nó vẫn phơi ra đúng những gì đã cam kết.
- Kiểm tra **phiên bản thư viện chia sẻ** trong pipeline thay vì chờ cảnh báo trên production.

Nguyên tắc nền: **không phá hợp đồng đột ngột** — đổi phá vỡ thì tăng version và thông báo trước.

</details>

**9. Bạn xử lý một breaking change của remote đang được nhiều host dùng như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không bao giờ đổi tại chỗ, mà theo mẫu **mở rộng trước, thu hẹp sau**:

1. **Phơi ra phiên bản mới song song** — thêm một tên module mới (hoặc prop mới tuỳ chọn), giữ nguyên bản cũ vẫn chạy.
2. **Thông báo và ghi tài liệu** rõ ràng: cái gì đổi, hạn chót chuyển, cách chuyển.
3. **Từng host chuyển sang bản mới** theo nhịp của mình — đây chính là điểm khiến kiến trúc này có giá trị.
4. **Đo mức sử dụng** bản cũ bằng số liệu thực tế, đừng đoán.
5. Khi không còn ai dùng, **mới gỡ bản cũ** và cũng nên gỡ dần, có đường lùi.

Điều luôn phải nhớ: ngay cả khi mọi host đã deploy, vẫn có người dùng đang giữ **bản cũ trong tab đang mở**, nên giai đoạn chạy song song phải đủ dài. Nếu bản cũ có lỗi buộc phải gỡ gấp, hãy chuẩn bị fallback ở phía host và phối hợp thời điểm — lúc đó chuyện đã trở lại thành một cuộc phối hợp giữa các nhóm, đúng thứ ta đang cố tránh.

</details>

**10. Làm sao đảm bảo một mảnh sập không kéo sập cả trang? Mô tả chiến lược `Error Boundary` và fallback.**

<details className="qa">
<summary>Xem đáp án</summary>

Quy tắc: **mỗi remote một Error Boundary riêng**, không dùng một cái chung bọc cả trang — vì boundary chỉ thay thế phần cây nằm dưới nó, bọc chung thì một mảnh hỏng sẽ xoá sạch giao diện.

Chiến lược đầy đủ:

- **Boundary riêng cho từng mảnh**, kèm trạng thái loading qua `Suspense`.
- **Fallback theo mức quan trọng**: mảnh phụ thì ẩn hẳn ô đó; mảnh thiết yếu thì báo thân thiện kèm nút thử lại. Tuyệt đối không để màn hình trắng.
- **Giữ khung kích thước** của ô để layout không nhảy khi mảnh hỏng.
- **Timeout và retry có giới hạn** khi tải remote, giãn cách giữa các lần thử.
- **Ghi log kèm tên mảnh và version** để biết nhóm nào xử lý.

Cần nhớ giới hạn: Error Boundary **không bắt** lỗi trong event handler, trong code bất đồng bộ, hay trong chính boundary đó — những chỗ này phải tự try/catch. Và cô lập lỗi không bao giờ tuyệt đối, vì mọi mảnh vẫn chung một tab, chung DOM và chung global.

</details>

**11. Bạn đo và chống việc tải trùng dependency lớn (React, router...) bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Đo:**

- Mở tab **Network** trên môi trường thật, đếm xem React hay router có bị tải nhiều lần không — cách nhanh và trung thực nhất.
- Dùng **bundle analyzer** cho từng mảnh để thấy thư viện nào bị đóng gói lặp lại.
- Theo dõi số liệu người dùng thật (thời gian tải, Core Web Vitals), không chỉ nhìn kích thước lúc build.

**Chống:**

- Khai `shared` dạng **`singleton`** cho thư viện nền ở **cả host lẫn mọi remote** — thiếu một bên là hỏng.
- **Thống nhất phiên bản** giữa các nhóm và có lịch nâng cấp chung.
- **Chỉ chia sẻ thứ thực sự dùng chung**, tránh chia sẻ tràn lan gây coupling.
- **Lazy-load mảnh** theo route hoặc tương tác, để những gì không cần thì không tải.
- Đặt **ngân sách bundle** cho từng mảnh, mỗi nhóm chịu trách nhiệm phần của mình và đưa kiểm tra vào pipeline.

</details>

**12. Chiến lược đăng nhập dùng chung giữa các mảnh: token đặt ở đâu, `SSO` / `JWT` hoạt động thế nào, rủi ro bảo mật là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: **một nơi duy nhất sở hữu phiên đăng nhập**, thường là shell. Các mảnh không tự đăng nhập, không tự lưu, không tự làm mới token.

- **`SSO`** đưa người dùng tới một nhà cung cấp danh tính duy nhất, đăng nhập một lần rồi dùng cho mọi mảnh — rất hợp với kiến trúc này vì tránh mỗi mảnh làm một kiểu.
- **`JWT`** là token có chữ ký, mang sẵn thông tin người dùng nên backend xác minh mà không cần tra phiên; đổi lại nó **khó thu hồi trước hạn**, nên thường để hạn ngắn kèm cơ chế làm mới.
- **Nơi đặt an toàn nhất là cookie `HttpOnly`** do server đặt — token không tồn tại trong JavaScript. Kém an toàn hơn là giữ trong bộ nhớ của shell và chỉ truyền xuống mảnh một hàm gọi API đã kèm xác thực. Nên tránh `localStorage`.

Rủi ro: mọi mảnh chạy **chung một origin**, nên một mảnh bị chiếm quyền là đọc được mọi thứ — ranh giới ở đây là kỷ luật thiết kế chứ không phải rào chắn kỹ thuật. Vì vậy phải kiểm soát chặt nguồn gốc các remote, dùng CSP, và để shell lo việc làm mới token cùng phát sự kiện đăng xuất cho mọi mảnh dọn dẹp.

</details>

**13. Observability xuyên mảnh: bạn gắn thông tin gì vào log và metric để truy vết lỗi? Vì sao debug xuyên mảnh khó?**

<details className="qa">
<summary>Xem đáp án</summary>

Khó vì một luồng nghiệp vụ đi qua nhiều ứng dụng do nhiều nhóm sở hữu, mỗi mảnh có build riêng, log riêng, thậm chí phiên bản khác nhau trên cùng một phiên người dùng — và không có một lần build chung nào để đối chiếu. Stack trace lại thường bị rút gọn nên khó biết lỗi thuộc mảnh nào.

Những gì nên gắn kèm mọi log và metric:

- **Tên mảnh và phiên bản** — đây là thứ tối thiểu, để biết ngay nhóm nào chịu trách nhiệm.
- **Correlation id** tạo ở shell, truyền xuống mọi mảnh và đính vào request tới backend, để nối được toàn tuyến.
- **Định danh phiên và người dùng** ở mức đã ẩn danh hợp lý.
- **Route hiện tại** và mảnh nào đang được mount.

Kèm theo nên có: upload source map của từng mảnh lên hệ thống theo dõi lỗi, ghi lại các sự kiện giao tiếp giữa các mảnh làm dấu vết, dashboard riêng cho từng mảnh cộng một dashboard chung ở cấp trang, và session replay cho vài luồng quan trọng.

</details>

**14. CI/CD cho micro-frontend: mỗi mảnh một pipeline thì test tích hợp và rollback làm ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Mỗi mảnh một pipeline** build/deploy độc lập — đó vừa là điểm mạnh vừa là chi phí, vì không còn thời điểm nào mọi mảnh được kiểm thử cùng nhau trước khi ra production.

Cách tổ chức test:

- **Unit/component test** trong pipeline của từng mảnh, chặn merge khi hỏng.
- **Contract test** ở pipeline của mảnh, đảm bảo nó vẫn phơi ra đúng cam kết — lớp quan trọng nhất vì nó thay cho việc build chung.
- **Integration/E2E** chạy trên môi trường đã ghép đầy đủ, **sau khi deploy** chứ không phải trước; nhóm sở hữu shell hoặc nhóm nền tảng chịu trách nhiệm các luồng xuyên mảnh.

Rollback:

- Đơn vị rollback là **một mảnh**, bằng cách trỏ lại artifact của bản trước mà không đụng phần còn lại.
- Giữ lại artifact vài bản build gần nhất, vì tab đang mở có thể còn tham chiếu chunk cũ.
- Cache của file entry phải ngắn, nếu không rollback cũng không tới được người dùng.
- Kèm theo cần giám sát production đủ tốt, vì test trước deploy không còn phủ được toàn hệ thống.

</details>

**15. Làm sao giữ hiệu năng khi số lượng mảnh tăng — lazy-load, CDN, ngân sách bundle cho từng nhóm?**

<details className="qa">
<summary>Xem đáp án</summary>

Càng nhiều mảnh, chi phí càng cộng dồn: nhiều request hơn, nhiều JavaScript hơn, chuỗi tải nối tiếp dài hơn. Những việc cần làm:

- **Lazy-load mảnh** — chỉ tải remote khi cần theo route hoặc tương tác, dùng `Suspense` cho trạng thái chờ. Đây là đòn bẩy lớn nhất khi số mảnh tăng.
- **Chống tải trùng** bằng `shared` dạng `singleton` và thống nhất version — nếu không, mỗi mảnh mới lại thêm một bản React.
- **Đặt remote gần CDN** — vì host tải remote qua mạng, độ trễ ảnh hưởng trực tiếp tới thời gian hiển thị.
- **Prefetch** manifest của các mảnh quan trọng ngay từ shell, để rút ngắn chuỗi nối tiếp.
- **Ngân sách bundle cho từng mảnh** — mỗi nhóm chịu trách nhiệm kích thước của mình, đo bằng bundle analyzer và kiểm tra trong pipeline.
- **Skeleton kích thước cố định** cho mỗi ô, tránh layout nhảy khi các mảnh xuất hiện lệch thời điểm.
- Theo dõi bằng **số liệu người dùng thật**, vì chỉ có production mới cho thấy hiệu ứng cộng dồn.

</details>
