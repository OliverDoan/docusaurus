---
sidebar_position: 1
title: "1. Cơ bản"
---

# 1. Cơ bản

## 1. Micro-frontend là gì?

Bài học: [1. Micro-frontend là gì?](../../micro-frontend/01-co-ban/1_micro-frontend-la-gi.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Micro-frontend` là gì? Giải thích cho người chưa biết bằng ví dụ một trang thương mại điện tử.**

<details className="qa">
<summary>Xem đáp án</summary>

Micro-frontend là kiến trúc chia ứng dụng frontend thành nhiều **mảnh nhỏ độc lập**, mỗi mảnh phụ trách một mảng tính năng, do một nhóm tự chủ phát triển và **deploy riêng**, rồi được **ghép lại lúc chạy** thành một trang duy nhất.

Ví dụ trang thương mại điện tử:

- **Header/Navbar** — nhóm A
- **Bộ lọc + danh sách sản phẩm** — nhóm B
- **Gợi ý "có thể bạn thích"** — nhóm C
- **Giỏ hàng mini** — nhóm D

Nhóm D sửa giỏ hàng và release mà không cần A/B/C build lại gì cả. Người dùng mở trang chỉ thấy một website liền mạch, hoàn toàn không biết bên dưới là bốn ứng dụng khác nhau.

Thường có thêm một app **"vỏ" (shell/container)** đóng vai trò bộ khung: tải các mảnh, sắp xếp layout và lo điều hướng chung.

</details>

**2. Frontend `monolith` gặp những vấn đề gì khi nhiều nhóm cùng làm? Đó là vấn đề kỹ thuật hay vấn đề tổ chức?**

<details className="qa">
<summary>Xem đáp án</summary>

Monolith là toàn bộ frontend nằm trong một codebase, một lần build, một lần deploy. Khi app lớn và nhiều nhóm cùng làm:

- **Giẫm chân nhau** — nhiều nhóm sửa chung một repo, merge conflict liên tục.
- **Deploy rủi ro** — một thay đổi nhỏ ở góc trang cũng bắt build & deploy lại toàn bộ; lỗi một chỗ có thể làm sập cả trang.
- **Kẹt công nghệ** — muốn nâng cấp framework hay đổi thư viện thì "đụng đâu vỡ đó" vì mọi thứ dính chặt nhau.
- **Build chậm** — codebase càng lớn, build/test càng lâu.

Đây chủ yếu là **vấn đề về quy mô tổ chức**, không phải vấn đề thuần kỹ thuật: bản thân monolith không hề chậm hay sai, nó chỉ trở thành điểm nghẽn khi số nhóm cùng chạm vào tăng lên. Vì vậy micro-frontend chỉ đáng giá khi app *và* đội ngũ đủ lớn.

</details>

**3. Vì sao "độc lập deploy" được coi là đặc tính quan trọng nhất? Làm sao kiểm chứng hệ thống của bạn thật sự đạt được điều đó?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì đó chính là thứ giải quyết vấn đề gốc: mỗi nhóm release theo nhịp riêng, không phải xếp hàng chờ nhau, không kéo cả trang vào rủi ro khi sửa một góc nhỏ. Mọi lợi ích khác (nhóm tự chủ, giảm giẫm chân, giảm thời gian build) đều là hệ quả của nó.

Cách kiểm chứng rất đơn giản: thử **deploy một mảnh mà không build lại bất kỳ mảnh nào khác**, và xem thay đổi có lên production không.

- Nếu phải build lại shell hoặc các mảnh khác → chưa độc lập.
- Nếu phải release đồng bộ nhiều repo cùng lúc → chưa độc lập.
- Nếu mỗi nhóm có pipeline riêng, artifact riêng, và trang tự lấy phiên bản mới lúc runtime → đạt.

Nếu các "mảnh" vẫn phải build và deploy cùng nhau thì đó chỉ là chia thư mục cho gọn, chưa phải micro-frontend thật.

</details>

**4. Chia thư mục hoặc dựng `monorepo` nhiều package đã phải là micro-frontend chưa? Khác nhau ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Chưa. Chia thư mục hay tách package trong monorepo là **tách mã nguồn**, còn micro-frontend là **tách vòng đời release**.

| Tiêu chí | Monorepo nhiều package | Micro-frontend |
| --- | --- | --- |
| Ranh giới | Thư mục / package | Ứng dụng chạy độc lập |
| Build | Một lần build chung | Mỗi mảnh build riêng |
| Deploy | Một artifact duy nhất | Nhiều artifact, release riêng nhịp |
| Khi sửa 1 mảnh | Phải phát hành lại cả app | Chỉ đẩy mảnh đó lên |

Monorepo vẫn rất tốt cho việc chia sẻ code, chuẩn hoá lint/test và refactor xuyên package — nhưng nếu cuối cùng vẫn chỉ có một lần build và một lần deploy, thì nó vẫn là monolith được sắp xếp gọn gàng. Thước đo duy nhất vẫn là: có deploy riêng được không.

</details>

**5. So sánh micro-frontend với `microservices`: điểm giống, điểm khác, và cái giá phải trả.**

<details className="qa">
<summary>Xem đáp án</summary>

Micro-frontend là tư tưởng microservices áp dụng cho tầng giao diện.

| | Microservices (backend) | Micro-frontend (frontend) |
| --- | --- | --- |
| Chia nhỏ cái gì | Dịch vụ phía server | Giao diện phía client |
| Đơn vị độc lập | Mỗi service tự deploy | Mỗi mảnh UI tự deploy |
| Giao tiếp | Qua API/mạng | Ghép lúc build hoặc lúc runtime |
| Mục tiêu chung | Nhóm tự chủ, deploy độc lập, scale tổ chức | |

**Giống:** cùng hướng tới nhóm tự chủ, ranh giới theo mảng nghiệp vụ, độc lập deploy.

**Khác:** service chạy trên nhiều tiến trình/máy riêng, còn các mảnh frontend cuối cùng vẫn **chung một tab trình duyệt** — chung DOM, chung CSS, chung bộ nhớ, chung ngân sách tải. Vì vậy cô lập khó hơn nhiều so với backend.

**Cái giá:** phức tạp vận hành, trùng lặp dependency, bundle phình, khó debug xuyên mảnh và hợp đồng giữa các mảnh phải quản lý cẩn thận.

</details>

**6. Vai trò của app `shell` (container) là gì? Nó lo những việc nào và rủi ro gì khi shell phình to?**

<details className="qa">
<summary>Xem đáp án</summary>

Shell (container app) là "nhạc trưởng" — bộ khung tải và sắp xếp các mảnh. Việc của nó:

- **Tải các micro-frontend** và quyết định mảnh nào hiển thị ở đâu.
- **Layout chung** — khung trang, vùng chứa cho từng mảnh.
- **Điều hướng chung** — route cấp cao, quyết định route nào thuộc mảnh nào.
- Các mối quan tâm xuyên suốt: xác thực, theme, cô lập lỗi khi một mảnh hỏng.

**Rủi ro khi shell phình to:** shell dần trở thành một monolith mới. Mọi nhóm đều phải sửa shell để thêm tính năng, nên nó lại thành điểm nghẽn và phải deploy liên tục — đúng thứ mà kiến trúc này muốn tránh. Nguyên tắc là giữ shell **mỏng**: chỉ lo ghép mảnh và điều hướng, đẩy logic nghiệp vụ xuống các mảnh.

</details>

**7. Kể các cách tích hợp micro-frontend (build-time, `iframe`, Web Components, `Module Federation`, server-side include) và đánh đổi của từng cách.**

<details className="qa">
<summary>Xem đáp án</summary>

| Cách | Ghép lúc nào | Đánh đổi |
| --- | --- | --- |
| Build-time (npm package) | Lúc build | Đơn giản, tối ưu tốt — nhưng **mất độc lập deploy**, phải build lại shell mỗi lần mảnh đổi |
| `iframe` | Runtime | Cô lập CSS/JS mạnh nhất — nhưng khó chia sẻ state, routing và kích thước động, UX kém |
| Web Components | Runtime | Chuẩn của trình duyệt, không phụ thuộc framework, Shadow DOM cô lập style — cần bọc thêm cho React/Vue |
| `Module Federation` | Runtime | Chia sẻ được dependency, giữ độc lập deploy, DX tốt — phụ thuộc bundler và cấu hình version |
| Server-side include / SSR | Lúc render trên server | Tốt cho SEO và first paint — cần hạ tầng server, tương tác phía client vẫn phải xử lý riêng |

Nguyên tắc chọn: ưu tiên cách đơn giản nhất đáp ứng được yêu cầu độc lập deploy. Nếu tất cả dùng chung một framework và một bundler thì Module Federation thường là lựa chọn cân bằng nhất.

</details>

**8. `Module Federation` khác `single-spa` ở điểm nào? Khi nào bạn chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai thứ giải quyết hai lớp vấn đề khác nhau và có thể dùng chung.

| | `Module Federation` | `single-spa` |
| --- | --- | --- |
| Bản chất | Cơ chế của bundler để **nạp module từ app khác lúc runtime** | Framework **điều phối vòng đời** các app con |
| Lo việc gì | Tải code, chia sẻ dependency | Mount/unmount app theo route |
| Phụ thuộc | Bundler (webpack/Rspack/Vite plugin) | Không phụ thuộc bundler |

Chọn **Module Federation** khi bạn kiểm soát được bundler, muốn chia sẻ `react`/`react-dom` để tránh tải trùng, và chủ yếu cần "mượn component/module" giữa các app.

Chọn **single-spa** khi cần ghép nhiều app viết bằng framework khác nhau, mỗi app có vòng đời riêng theo route.

Thực tế nhiều hệ thống dùng single-spa để điều phối và Module Federation để nạp code.

</details>

**9. Cô lập CSS giữa các mảnh làm bằng cách nào (`Shadow DOM`, CSS Modules, quy ước prefix)? Đánh đổi của mỗi cách?**

<details className="qa">
<summary>Xem đáp án</summary>

| Cách | Mức cô lập | Đánh đổi |
| --- | --- | --- |
| `Shadow DOM` | Mạnh nhất, style không rò cả hai chiều | Khó chia sẻ theme/biến chung, một số thư viện UI và portal hoạt động không đúng |
| CSS Modules / CSS-in-JS | Tốt — tên class được băm tự động | Không chặn được selector toàn cục và reset CSS của mảnh khác |
| Quy ước prefix (BEM, namespace) | Yếu nhất, dựa vào kỷ luật con người | Rẻ và dễ áp dụng, nhưng chỉ cần một người quên là rò style |

Thực tế hay kết hợp: CSS Modules cho phần lớn component, cộng thêm quy ước prefix cho class toàn cục, và cấm tuyệt đối việc một mảnh ghi đè selector toàn cục như `body` hay thẻ trần. Biến CSS (`custom properties`) là cách chia sẻ theme an toàn nhất vì chúng xuyên qua được ranh giới mà không mang theo quy tắc layout.

</details>

**10. Các mảnh giao tiếp với nhau ra sao mà không coupling chặt (custom event, props/callback từ shell, shared store)? Vì sao nên hạn chế shared global state?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc chung là các mảnh giao tiếp qua **hợp đồng rõ ràng**, không "thò tay" vào ruột nhau.

- **Props/callback từ shell** — shell truyền dữ liệu xuống và nhận callback lên. Rõ ràng nhất, hợp với quan hệ cha–con.
- **Custom event trên `window`** — mảnh này phát sự kiện, mảnh kia lắng nghe, hai bên không cần biết nhau. Hợp với thông báo kiểu "đã thêm vào giỏ".
- **Shared store** — một store dùng chung cho nhiều mảnh.

Nên **hạn chế shared global state** vì nó tạo coupling ngầm: các mảnh phải cùng biết hình dạng state, đổi một field là phải deploy đồng bộ nhiều mảnh — mất luôn tính độc lập deploy. Nó còn khiến việc debug khó hơn (ai đã sửa state?) và buộc các mảnh dùng chung một thư viện state. Nếu bắt buộc phải có, hãy giữ nó tối thiểu: chỉ dữ liệu thật sự dùng chung như người dùng đăng nhập, theme, ngôn ngữ.

</details>

**11. Xử lý dependency trùng lặp thế nào khi mỗi mảnh bundle React riêng? `Shared singleton` có rủi ro gì nếu version lệch nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

Nếu mỗi mảnh tự bundle React, người dùng phải tải React nhiều lần — bundle phình và có thể xuất hiện nhiều bản React cùng chạy, làm hỏng hook và context. Cách xử lý phổ biến:

- Khai báo các thư viện lõi (`react`, `react-dom`, router) là **shared**, để chỉ một bản được tải và dùng chung.
- Đánh dấu `singleton` cho những thư viện **bắt buộc chỉ tồn tại một instance** — đặc biệt là React, vì hook dựa vào state nội bộ của chính bản React đó.
- Khai báo khoảng version chấp nhận được để bundler chọn bản phù hợp.

**Rủi ro khi version lệch:** với `singleton`, cả hệ thống buộc phải dùng một bản duy nhất, nên một mảnh cần API mới hơn có thể chạy sai hoặc cảnh báo version không tương thích. Ngược lại, nếu tắt singleton để mỗi bên tự dùng bản riêng thì lại vỡ hook/context. Thực tế phải thống nhất lịch nâng cấp React chung cho mọi nhóm — đây là ràng buộc lớn nhất của kiến trúc này.

</details>

**12. Routing giữa shell và các mảnh phân chia trách nhiệm ra sao? Deep link cùng nút back/forward xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Chia hai tầng:

- **Shell giữ route cấp cao** — quyết định tiền tố URL nào thuộc mảnh nào, ví dụ `/cart` thuộc mảnh giỏ hàng, `/search` thuộc mảnh tìm kiếm.
- **Mỗi mảnh tự lo route con** bên trong tiền tố của mình, không được biết gì về route của mảnh khác.

Để deep link và nút back/forward hoạt động đúng, cả hệ thống phải dùng **một nguồn sự thật duy nhất là URL của trình duyệt** (History API), không được mỗi mảnh giữ state điều hướng riêng. Thực tế nghĩa là: chỉ một router instance sở hữu history, các mảnh còn lại nhận history đó từ shell thay vì tự tạo. Nếu hai router cùng ghi vào history, back sẽ nhảy sai hoặc phải bấm hai lần. Khi mở thẳng một deep link, shell phải đọc URL, tải đúng mảnh tương ứng rồi mới render — nên cần trạng thái loading cho khoảng thời gian tải mảnh đó.

</details>

**13. Cô lập lỗi: một mảnh crash thì làm sao để không sập cả trang? Bạn cài đặt cơ chế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Cô lập lỗi là một trong bốn đặc tính cốt lõi: lỗi của mảnh này không được làm hỏng mảnh khác. Cách làm:

- Bọc mỗi mảnh trong một **error boundary** ở shell, hiển thị nội dung thay thế thay vì trang trắng.
- Xử lý cả **lỗi lúc tải** mảnh (mạng lỗi, remote deploy hỏng) — có fallback hoặc ẩn khu vực đó đi.
- Gửi lỗi về hệ thống giám sát kèm nhãn của mảnh, để biết nhóm nào phải xử lý.

```jsx
<ErrorBoundary fallback={<CartUnavailable />}>
  <Suspense fallback={<Skeleton />}>
    <RemoteCart />
  </Suspense>
</ErrorBoundary>
```

Lưu ý error boundary chỉ bắt lỗi lúc render; lỗi trong event handler hoặc promise phải tự bắt. Ngoài ra nên phân loại mảnh: mảnh không thiết yếu (gợi ý sản phẩm) thì ẩn luôn, mảnh thiết yếu (giỏ hàng) thì cần thông báo rõ và cho người dùng thử lại.

</details>

**14. Mỗi nhóm dùng một framework khác nhau nghe rất hấp dẫn — thực tế bạn có khuyến khích không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Không khuyến khích. Đây là khả năng *có thể* của micro-frontend, không phải mục tiêu — bài học nói rõ mỗi mảnh "có thể (không bắt buộc) dùng công nghệ riêng".

Cái giá khi trộn framework:

- **Bundle phình** — người dùng tải cả React lẫn Vue lẫn Angular cho một trang.
- **Không chia sẻ được gì** — component chung, design system, util đều phải viết lại nhiều lần.
- **Khó luân chuyển người** — lập trình viên không sang giúp nhóm khác được.
- **Cô lập và giao tiếp phức tạp hơn** — phải bọc qua Web Components hoặc lớp adapter.

Giá trị thật của kiến trúc này là **độc lập deploy và nhóm tự chủ**, không phải tự do chọn framework. Trường hợp trộn framework hợp lý nhất là **di trú dần** một hệ thống cũ: mảnh mới viết bằng framework mới, mảnh cũ giữ nguyên, và đó là trạng thái tạm thời có lộ trình kết thúc.

</details>

**15. Micro-frontend ảnh hưởng thế nào tới bundle size, thời gian tải lần đầu và `Core Web Vitals`? Giảm thiểu bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Ảnh hưởng thường là **xấu đi** nếu không cẩn thận:

- **Bundle size** tăng do dependency trùng lặp giữa các mảnh.
- **Thời gian tải lần đầu** dài hơn vì phải tải shell trước, rồi mới biết cần tải mảnh nào — thêm một vòng mạng nối tiếp.
- **Core Web Vitals**: LCP chậm do chuỗi tải nối tiếp; CLS dễ tăng vì các mảnh xuất hiện lệch thời điểm làm layout nhảy.

Giảm thiểu:

- Khai báo **shared dependency** cho các thư viện lõi để không tải trùng.
- **Lazy load** mảnh dưới màn hình đầu, chỉ tải khi cần.
- **Preload/prefetch** manifest của các mảnh quan trọng ngay từ shell để rút ngắn chuỗi nối tiếp.
- Đặt **skeleton có kích thước cố định** cho mỗi vùng để tránh layout nhảy.
- Cân nhắc render phía server cho phần trên màn hình đầu.
- Đặt **ngân sách bundle** cho từng mảnh và giám sát bằng số liệu thực tế.

</details>

**16. Quản lý version và hợp đồng giữa shell với các remote ra sao? Nếu một remote deploy hỏng thì chuyện gì xảy ra và bạn rollback thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì các mảnh được ghép **lúc chạy**, shell không biết trước nội dung của remote — nên hợp đồng phải rõ ràng và ổn định: mỗi remote chỉ phơi ra một số module đã thống nhất, với props và sự kiện cố định. Thay đổi hợp đồng phải theo kiểu cộng thêm, đổi phá vỡ thì phải phơi ra tên module mới thay vì sửa tại chỗ.

Về version, thường có hai hướng: shell trỏ tới địa chỉ "mới nhất" của remote (mảnh tự chủ hoàn toàn, nhưng rủi ro cao hơn), hoặc trỏ tới một phiên bản cố định và nâng có kiểm soát (an toàn hơn, bớt tự chủ).

**Khi một remote deploy hỏng:** trang vẫn phải sống — vùng đó hiện fallback nhờ error boundary, phần còn lại hoạt động bình thường. Rollback là **trỏ lại artifact phiên bản trước** của chính remote đó, không cần đụng tới shell hay các mảnh khác. Đây cũng chính là lợi ích của độc lập deploy: phạm vi sự cố và phạm vi rollback đều được thu hẹp.

</details>

**17. Testing và `CI/CD` của kiến trúc này khác monolith ra sao? `Integration test` chạy ở đâu và ai chịu trách nhiệm?**

<details className="qa">
<summary>Xem đáp án</summary>

Khác biệt lớn nhất: monolith có **một pipeline** kiểm thử toàn bộ trước khi deploy; micro-frontend có **nhiều pipeline độc lập**, và không bao giờ có thời điểm mọi mảnh được test cùng nhau trước khi ra production.

Cách tổ chức thường thấy:

- **Unit/component test** — mỗi nhóm tự chạy trong pipeline của mình, chặn merge nếu hỏng.
- **Contract test** — kiểm tra mảnh vẫn phơi ra đúng module và đúng hình dạng props/sự kiện đã cam kết. Đây là lớp thay thế cho việc build chung.
- **Integration/E2E test** — chạy trên một môi trường đã ghép đầy đủ shell và các mảnh, sau khi deploy chứ không phải trước.

Trách nhiệm: mỗi nhóm chịu trách nhiệm test mảnh của mình và không phá hợp đồng; nhóm sở hữu shell (hoặc nhóm nền tảng) chịu trách nhiệm bộ E2E cho các luồng xuyên mảnh. Kèm theo cần giám sát production và khả năng rollback nhanh, vì test trước deploy không còn phủ được toàn hệ thống.

</details>

**18. Khi nào KHÔNG nên dùng micro-frontend? Ngưỡng nào về số nhóm và quy mô app thì đánh đổi mới đáng?**

<details className="qa">
<summary>Xem đáp án</summary>

Không nên dùng khi:

- **App nhỏ, một nhóm làm** — monolith là lựa chọn tốt nhất: đơn giản, dễ hiểu, build nhanh.
- Vấn đề thật ra là **code lộn xộn**, không phải xung đột giữa các nhóm — cái cần là refactor và tách module, không phải tách deploy.
- Đội chưa có **hạ tầng CI/CD, giám sát, rollback** đủ mạnh — micro-frontend sẽ nhân số mảnh cần vận hành lên nhiều lần.
- Sản phẩm cần **first load cực nhanh** và không chịu được chi phí tải nối tiếp.

Về ngưỡng, không có con số tuyệt đối, chỉ có tín hiệu: từ khoảng **ba nhóm trở lên cùng chạm vào một codebase**, merge conflict và lịch release bắt đầu chặn nhau, build chậm tới mức làm chậm vòng phản hồi. Nói cách khác, dùng micro-frontend khi **chi phí phối hợp giữa các nhóm đã lớn hơn chi phí vận hành nhiều ứng dụng** — vì đây là giải pháp cho vấn đề tổ chức, không phải vấn đề kỹ thuật.

</details>

---

## 2. Các cách tích hợp

Bài học: [2. Các cách tích hợp](../../micro-frontend/01-co-ban/2_cac-cach-tich-hop.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt tích hợp `build-time` và `runtime`. Vì sao chỉ tích hợp runtime mới cho phép độc lập deploy thật sự?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Build-time** (lúc đóng gói): mảnh được nhúng vào app chính *khi build*, kết quả là **một gói duy nhất**.
- **Runtime** (lúc chạy): mảnh được tải về *khi trình duyệt chạy*, host độc lập với app chính.

Chỉ runtime mới cho độc lập deploy thật sự, vì với build-time, code của mảnh đã nằm sẵn trong gói của app chính. Mảnh đổi một dòng thì phải publish version mới, app chính phải nâng version, **build lại và deploy lại** — nghĩa là mọi thay đổi vẫn phải đi qua nhịp release của app chính.

Với runtime, shell chỉ giữ **địa chỉ** của mảnh chứ không giữ code. Nhóm sở hữu mảnh đẩy bản mới lên host của mình là người dùng nhận được ngay ở lần tải sau, không ai phải build lại gì cả.

</details>

**2. Kể các cách tích hợp micro-frontend bạn biết và nêu tiêu chí bạn dùng để chọn giữa chúng.**

<details className="qa">
<summary>Xem đáp án</summary>

| Cách | Thời điểm | Độc lập deploy | Cô lập | Độ phức tạp |
| --- | --- | --- | --- | --- |
| Build-time (npm) | Build | Không | Thấp | Thấp |
| Iframe | Runtime | Có | Rất cao | Thấp |
| Server-side | Server | Có | Trung bình | Cao |
| **Runtime JS** | **Runtime** | **Có** | Trung bình | Trung bình–cao |
| Web Components | Runtime | Có | Cao (Shadow DOM) | Trung bình |

Tiêu chí chọn:

- **Có thật sự cần deploy riêng không?** Nếu không, build-time là đủ và đơn giản nhất.
- **Mức cô lập cần thiết** — nhúng code bên thứ ba hoặc hệ thống cũ thì iframe hợp lý.
- **Yêu cầu SEO và tốc độ tải đầu** — nghiêng về server-side composition.
- **Mức độ liền mạch của trải nghiệm** và nhu cầu chia sẻ state/routing — nghiêng về runtime JS.
- **Năng lực vận hành của đội** — hạ tầng càng phức tạp càng cần đội trưởng thành.

</details>

**3. Tích hợp qua npm package khác gì so với chia module trong một monolith? Khi nào cách này vẫn chấp nhận được?**

<details className="qa">
<summary>Xem đáp án</summary>

Về bản chất thực thi thì **gần như không khác**: cả hai đều cho ra một gói duy nhất sau khi build. Khác biệt chỉ nằm ở khâu tổ chức — package có ranh giới rõ, có version, có thể test và phát hành riêng, và nhóm sở hữu package không cần quyền ghi vào repo chính.

Nhưng cái giá vẫn còn nguyên: mỗi lần mảnh đổi, app chính phải cập nhật version, build lại, deploy lại. Vì vậy tài liệu gọi đây thực chất là **monolith chia module**.

Cách này vẫn chấp nhận được khi:

- Bạn chỉ muốn **chia sẻ component dùng chung** (design system, thư viện tiện ích).
- Nhịp release của app chính vốn đã đủ nhanh, không ai bị chặn.
- Bạn ưu tiên đơn giản và **type-safe** hơn là tự chủ deploy.

</details>

**4. `Iframe` cô lập CSS và JavaScript bằng cơ chế nào? Những hạn chế nào khiến nó hiếm khi được chọn cho sản phẩm chính?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi `iframe` là một **tài liệu (document) riêng** với ngữ cảnh duyệt riêng: DOM riêng, CSSOM riêng, đối tượng toàn cục riêng. CSS trong iframe không rò ra ngoài và ngược lại; biến toàn cục cũng không đụng nhau. Nếu khác origin thì trình duyệt còn chặn truy cập chéo theo chính sách same-origin, nên mức cô lập là **tuyệt đối**.

Chính sự cô lập đó tạo ra hạn chế:

- **Khó chia sẻ state** — hai bên không đọc được biến của nhau, phải nhắn tin qua lại.
- **Khó đồng bộ routing** — URL của trang cha không phản ánh trạng thái bên trong iframe, deep link và nút back hoạt động sai.
- **Khó responsive** — iframe không tự co giãn theo nội dung, phải tự tính chiều cao.
- **Trải nghiệm rời rạc** — modal, dropdown, tooltip bị cắt ở biên iframe; focus và phím tắt không liền mạch.
- **SEO kém** — nội dung trong iframe thường không được tính cho trang cha.

Vì vậy iframe hợp cho widget bên thứ ba hoặc dashboard ghép công cụ cũ hơn là sản phẩm chính.

</details>

**5. Với `iframe`, làm sao chia sẻ dữ liệu và đồng bộ điều hướng giữa trang cha và mảnh con? Nêu rủi ro của cơ chế đó.**

<details className="qa">
<summary>Xem đáp án</summary>

Cách chuẩn là dùng `postMessage` — cha và con nhắn tin cho nhau qua sự kiện `message`:

```js
// Trang cha gửi xuống
iframe.contentWindow.postMessage({ type: 'user', id: 7 }, 'https://cart.company.com')

// Mảnh con nhận
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://shop.company.com') return
  handle(e.data)
})
```

Điều hướng thì đồng bộ hai chiều: con báo cha khi route bên trong đổi để cha cập nhật URL, và cha báo con khi người dùng bấm back.

Rủi ro:

- **Bảo mật** — nếu không kiểm tra `e.origin` và không chỉ định origin đích (dùng `*`), bất kỳ trang nào cũng có thể gửi hoặc nghe lén thông điệp.
- **Hợp đồng ngầm** — định dạng thông điệp trở thành API không kiểu, dễ lệch khi một bên đổi.
- **Bất đồng bộ** — mọi thứ thành gửi/nhận, khó đảm bảo thứ tự và khó debug.
- **URL dễ lệch** với trạng thái thật bên trong, làm hỏng deep link.

</details>

**6. So sánh `server-side composition` với `client-side composition` về SEO, thời gian tải đầu và khả năng tương tác động.**

<details className="qa">
<summary>Xem đáp án</summary>

| Tiêu chí | Server-side composition | Client-side composition |
| --- | --- | --- |
| SEO | Tốt — trình duyệt và bot nhận HTML đã đầy đủ | Kém hơn — nội dung chỉ có sau khi JS chạy |
| Thời gian tải đầu | Nhanh, thấy nội dung ngay | Chậm hơn — phải tải shell rồi mới tải từng mảnh |
| Tương tác động | Cần thêm giải pháp phía client | Sẵn có, mảnh tự quản lý state và sự kiện |
| Hạ tầng | Phức tạp — cần tầng ghép ở server/edge | Đơn giản hơn, chỉ cần host tĩnh |
| Cập nhật không reload | Khó, thường phải tải lại trang | Dễ, chuyển mảnh ngay trong trình duyệt |

Nói ngắn gọn: server-side thắng ở **lần hiển thị đầu tiên**, client-side thắng ở **mọi tương tác sau đó**. Nhiều hệ thống lớn dùng cả hai — ghép ở server cho phần trên màn hình đầu, rồi để client tiếp quản phần tương tác.

</details>

**7. `SSI` và `ESI` (edge-side includes) chạy ở vị trí nào trong đường đi của request, và giải quyết được điều gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều là cơ chế **chèn mảnh HTML vào một trang HTML khác** dựa trên các chỉ thị include nhúng trong nội dung, khác nhau ở chỗ ai xử lý chỉ thị đó:

- **SSI (Server Side Includes)** — được xử lý ở **web server gốc** (Apache, Nginx) khi trả trang về. Server đọc trang khung, gặp chỉ thị include thì lấy nội dung mảnh tương ứng ghép vào rồi mới gửi đi.
- **ESI (Edge Side Includes)** — được xử lý ở **tầng edge / CDN / reverse proxy**, tức là gần người dùng hơn, trước khi request chạm tới server gốc.

Điều chúng giải quyết: cho phép **mỗi mảnh được cache riêng với thời hạn riêng**. Khung trang và phần tin tức có thể cache lâu, còn ô "giỏ hàng của bạn" thì cache ngắn hoặc không cache. Nhờ đó trang vẫn ghép từ nhiều nguồn độc lập mà trình duyệt vẫn nhận HTML đã đầy đủ — tốt cho SEO và tốc độ tải đầu.

</details>

**8. Mô tả cơ chế của cách tích hợp `runtime JS`: shell tải và mount một mảnh ra sao? Những rủi ro chính là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Shell không chứa code của mảnh, nó chỉ biết **địa chỉ** của mảnh. Lúc chạy, shell tải file entry của mảnh từ host riêng của mảnh đó, lấy ra hàm mount mà mảnh phơi ra, rồi gọi hàm đó với một phần tử DOM làm chỗ gắn:

```ts
const { mount } = await import('https://cart.company.com/remoteEntry.js')
mount(document.getElementById('cart-slot'))
```

Từ lúc này mảnh tự render và tự quản lý bên trong ô của nó. Khi rời khỏi màn hình, shell gọi hàm unmount tương ứng để dọn dẹp.

Rủi ro chính:

- **Phiên bản và hợp đồng** — shell gọi một hàm mà nó không build cùng, nên mảnh đổi chữ ký là vỡ lúc chạy chứ không vỡ lúc build.
- **Dependency trùng** — mỗi mảnh tự mang React thì bundle phình và hook có thể hỏng.
- **Lỗi khi tải** — mạng lỗi hoặc mảnh deploy hỏng thì ô đó trống, cần fallback.
- **Rò rỉ** — mảnh không dọn listener/timer lúc unmount sẽ tích tụ theo thời gian.

</details>

**9. `Web Components` kết hợp `Shadow DOM` cô lập được tới mức nào? Truyền dữ liệu phức tạp và bắn sự kiện ra ngoài xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Shadow DOM cô lập **CSS và cấu trúc DOM**: style bên trong không rò ra ngoài, selector bên ngoài không với vào trong, và `querySelector` của trang cha không thấy nội dung bên trong. Nhưng nó **không cô lập JavaScript** — vẫn chung một global, chung bộ nhớ, nên lỗi runtime hay biến toàn cục vẫn ảnh hưởng lẫn nhau. Mức cô lập vì thế nằm giữa iframe và cách runtime JS thuần.

**Truyền dữ liệu phức tạp:** thuộc tính HTML chỉ nhận chuỗi, nên object/array phải gán qua **property** của phần tử thay vì attribute:

```js
const el = document.querySelector('product-list')
el.items = [{ id: 1, name: 'Sách' }]
```

**Bắn sự kiện ra ngoài:** dùng `CustomEvent` với `bubbles: true` và `composed: true` để sự kiện vượt được ranh giới shadow, kèm dữ liệu trong `detail`. Trang cha chỉ cần `addEventListener` như với sự kiện DOM thường.

</details>

**10. Vì sao người ta hay kết hợp `Web Components` với `Module Federation` thay vì chọn một trong hai?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì hai thứ giải quyết hai bài toán khác nhau, không cạnh tranh nhau:

- **Web Components** trả lời câu hỏi *"mảnh trông như thế nào từ bên ngoài"* — nó là **bao bì**: một thẻ HTML chuẩn, không phụ thuộc framework, có Shadow DOM để cô lập CSS.
- **Module Federation** trả lời câu hỏi *"code của mảnh đến từ đâu"* — nó lo việc **tải code lúc runtime** và chia sẻ dependency giữa các mảnh.

Nếu chỉ dùng Web Components, bạn vẫn phải tự nghĩ cách nạp file JS của mảnh và tránh tải trùng React. Nếu chỉ dùng Module Federation, bạn tải được code nhưng ranh giới giữa các mảnh vẫn mỏng — CSS vẫn rò, và shell phải biết mảnh viết bằng framework gì.

Ghép lại: Module Federation lo vận chuyển, Web Component lo ranh giới và giao diện tiếp xúc — shell chỉ việc đặt một thẻ tuỳ chỉnh vào DOM.

</details>

**11. So sánh `single-spa` và `Module Federation` — mỗi thứ giải quyết tầng nào của bài toán tích hợp?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `single-spa` | `Module Federation` |
| --- | --- | --- |
| Tầng giải quyết | **Điều phối** — quyết định mảnh nào chạy khi nào | **Vận chuyển code** — nạp module từ app khác lúc runtime |
| Lo việc gì | Vòng đời mount/unmount theo route | Tải entry, chia sẻ dependency |
| Phụ thuộc | Không phụ thuộc bundler | Gắn với bundler (webpack/Rspack, plugin cho Vite) |
| Chia sẻ React | Phải tự xử lý | Có cơ chế shared sẵn |

Cả hai đều thuộc nhóm **runtime JS** trong bài. single-spa mạnh ở việc ghép nhiều app có vòng đời riêng, kể cả khác framework; Module Federation mạnh ở việc cho nhiều app dùng chung một bản React và mượn module của nhau.

Vì vậy chúng thường được dùng **cùng nhau**: single-spa điều phối vòng đời, Module Federation lo phần nạp code và chia sẻ dependency.

</details>

**12. Một trang ghép nhiều mảnh viết bằng nhiều framework khác nhau: bạn xử lý trùng `dependency` và kích thước bundle thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Trường hợp xấu nhất: mỗi mảnh mang theo framework của mình, người dùng tải cả React lẫn Vue lẫn Angular cho một trang. Cách xử lý:

- **Giảm số framework trước đã** — đây là cách hiệu quả nhất. Đa framework nên là trạng thái tạm thời trong lộ trình di trú, không phải mục tiêu.
- **Chia sẻ dependency** cho những mảnh dùng chung framework, để chỉ tải một bản React duy nhất.
- **Lazy load** mảnh dưới màn hình đầu — framework thứ hai chỉ tải khi người dùng thật sự cuộn tới hoặc mở màn hình đó.
- **Đặt ngân sách bundle** cho từng mảnh và đưa vào pipeline để chặn khi vượt ngưỡng.
- **Tránh trùng thư viện phụ** (date, icon, UI kit) bằng cách thống nhất một lựa chọn cho cả tổ chức.
- Đo bằng số liệu thực tế chứ không chỉ nhìn kích thước lúc build.

</details>

**13. Tình huống: app cũ chạy jQuery, cần nhúng dần các màn hình React mới mà không viết lại toàn bộ. Bạn chọn cách tích hợp nào và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Hướng hợp lý nhất là **tích hợp runtime**: app jQuery cũ đóng vai trò shell, chừa ra các "ô" trống trong DOM, còn màn hình React mới được tải lúc chạy và mount vào ô đó.

Vì sao:

- Không phải viết lại app cũ, cũng không phải build chung — hai bên giữ pipeline riêng.
- Nhóm làm React **deploy độc lập**, thay từng màn hình theo lộ trình, rủi ro được chia nhỏ.
- Nếu màn hình mới có vấn đề, chỉ cần trỏ ngược về màn hình cũ — rollback rất rẻ.

Nếu muốn ranh giới chặt hơn, có thể bọc màn hình React thành **Web Component** để Shadow DOM chặn CSS cũ của app jQuery rò vào — đây là điểm đáng lo nhất khi ghép với hệ thống cũ.

`Iframe` cũng dùng được và cô lập mạnh nhất, nhưng đổi lại trải nghiệm rời rạc và khó đồng bộ điều hướng, nên chỉ chọn khi CSS cũ quá hỗn loạn.

</details>

**14. Với tích hợp runtime, một mảnh tải thất bại thì trang phản ứng ra sao? Bạn thiết kế fallback và cô lập lỗi thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định, một lời gọi tải mảnh thất bại chỉ là một promise bị reject — nhưng nếu không ai bắt, nó có thể làm hỏng luồng render của shell và kéo theo cả trang. Vì vậy phải chủ động cô lập.

Thiết kế nên có:

- **Bắt lỗi ngay ở chỗ tải** — bọc lời gọi động trong try/catch, có timeout để không treo vô hạn.
- **Error boundary quanh mỗi ô mảnh**, hiển thị nội dung thay thế thay vì trang trắng.
- **Phân loại mảnh**: mảnh không thiết yếu (gợi ý sản phẩm) thì ẩn luôn ô đó; mảnh thiết yếu (giỏ hàng) thì báo rõ và cho người dùng thử lại.
- **Giữ khung kích thước** của ô dù mảnh hỏng, để layout không nhảy.
- **Thử lại có giới hạn** và ghi log kèm nhãn mảnh, để biết nhóm nào cần xử lý.

Nguyên tắc chung: một mảnh hỏng chỉ được làm mất chức năng của chính nó, phần còn lại của trang vẫn phải dùng được.

</details>

---

## 3. Ưu/nhược & khi nào nên dùng

Bài học: [3. Ưu/nhược & khi nào nên dùng](../../micro-frontend/01-co-ban/3_uu-nhuoc-khi-nao-dung.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Lợi ích lớn nhất của micro-frontend là gì, và vì sao nói nó giải quyết vấn đề *tổ chức* chứ không phải vấn đề kỹ thuật?**

<details className="qa">
<summary>Xem đáp án</summary>

Lợi ích lớn nhất là **nhóm tự chủ và deploy độc lập** — mỗi nhóm release theo nhịp riêng, không phải chờ nhau. Các lợi ích còn lại (nâng cấp dần, cô lập lỗi, scale theo tổ chức, build nhanh hơn theo mảnh) đều bắt nguồn từ đó.

Nói đây là vấn đề tổ chức vì thứ mà kiến trúc này tháo gỡ là **chi phí phối hợp giữa người với người**: merge conflict, xếp hàng chờ release, một nhóm lỡ hẹn kéo cả lịch phát hành. Về mặt thuần kỹ thuật, một monolith được viết tốt chạy nhanh hơn, nhẹ hơn và dễ debug hơn micro-frontend.

Hệ quả thực dụng: nếu đội bạn chỉ có một hai nhóm thì chia mảnh không giải quyết được gì, chỉ thêm chi phí vận hành. Micro-frontend chỉ có lãi khi nỗi đau phối hợp đã lớn hơn nỗi đau vận hành nhiều ứng dụng.

</details>

**2. "Độc lập deploy" cụ thể nghĩa là gì? Cần những điều kiện kỹ thuật nào để thực sự đạt được nó?**

<details className="qa">
<summary>Xem đáp án</summary>

Nghĩa là: đẩy một mảnh lên production mà **không build lại và không deploy lại** bất kỳ mảnh nào khác, kể cả shell.

Điều kiện kỹ thuật:

- **Tích hợp lúc runtime**, không phải build-time — shell chỉ giữ địa chỉ của mảnh, không giữ code của mảnh.
- **Mỗi mảnh có pipeline và artifact riêng**, host riêng.
- **Hợp đồng ổn định** giữa shell và mảnh (tên module phơi ra, props, sự kiện), để đổi bên trong không làm vỡ bên ngoài.
- **Chiến lược cache đúng** — file entry không được cache lâu, nếu không bản mới sẽ không tới người dùng.
- **Rollback theo từng mảnh** — trỏ lại artifact phiên bản trước mà không đụng phần còn lại.
- **Cô lập lỗi** để một mảnh deploy hỏng không kéo sập trang.

Nếu thiếu tích hợp runtime thì mọi thứ còn lại vô nghĩa — đó là điều kiện cần.

</details>

**3. Micro-frontend hỗ trợ nâng cấp framework dần dần ra sao? Hãy phác một lộ trình kiểu `strangler` cho một app cũ.**

<details className="qa">
<summary>Xem đáp án</summary>

Vì mỗi mảnh deploy độc lập, bạn có thể đổi framework **từng mảnh một** thay vì viết lại toàn bộ ("big bang rewrite") — rủi ro được chia nhỏ và luôn có đường lùi.

Lộ trình kiểu strangler (bóp nghẹt dần):

1. Giữ app cũ làm **shell** và chừa sẵn các ô trống trong DOM cho mảnh mới.
2. Chọn **một màn hình ít rủi ro nhất** làm thí điểm, viết lại bằng framework mới, host riêng.
3. Shell tải mảnh mới lúc runtime vào đúng ô đó; giữ nguyên màn hình cũ làm đường lùi.
4. Bật dần cho một phần người dùng, đo lỗi và hiệu năng trước khi mở rộng.
5. Lặp lại cho các màn hình tiếp theo, mỗi lần là một lần release nhỏ.
6. Khi phần lớn màn hình đã chuyển, **đảo vai trò shell** sang app mới rồi gỡ bỏ app cũ.

Điểm mấu chốt: mỗi bước đều chạy được trên production, không có giai đoạn "viết xong mới biết đúng sai".

</details>

**4. "Cô lập lỗi" đạt được nhờ cơ chế nào? Nó có tuyệt đối không, và trường hợp nào một mảnh vẫn kéo sập cả trang?**

<details className="qa">
<summary>Xem đáp án</summary>

Cơ chế thường dùng: bọc mỗi mảnh trong một **error boundary** ở shell, bắt lỗi khi tải mảnh (kèm timeout và fallback), và chia mảnh thành thiết yếu / không thiết yếu để quyết định ẩn đi hay báo lỗi.

Nhưng **không tuyệt đối** — bài học ghi rõ "lý tưởng là không làm sập cả trang". Lý do: mọi mảnh vẫn chung một tab, chung DOM, chung global, chung luồng JS. Những trường hợp vẫn kéo sập cả trang:

- Lỗi **ngoài phạm vi render** — trong event handler, `setTimeout`, promise không bắt — error boundary không thấy.
- Mảnh ghi đè hoặc phá hỏng **global** (sửa prototype, ghi đè `fetch`, khai báo biến toàn cục trùng tên).
- **CSS rò ra** làm hỏng layout toàn trang, dù JS vẫn chạy bình thường.
- Vòng lặp vô hạn hoặc rò bộ nhớ làm **đơ cả tab**.
- Mảnh làm hỏng **state dùng chung** mà các mảnh khác đang dựa vào.

Vì vậy cô lập lỗi cần cả kỷ luật code lẫn cơ chế kỹ thuật.

</details>

**5. Chi phí hiệu năng lớn nhất của micro-frontend là gì? Bạn đo và giảm trùng lặp `dependency` bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Chi phí lớn nhất là **trùng lặp dependency**: nếu không chia sẻ tốt, mỗi mảnh tự tải React của riêng nó, trang nặng và chậm hẳn. Kèm theo là chuỗi tải nối tiếp — phải tải shell trước rồi mới biết tải mảnh nào.

**Đo:**

- Phân tích bundle từng mảnh để xem thư viện nào bị đóng gói nhiều lần.
- Xem danh sách request thực tế trên production, tìm các file trùng nội dung khác tên.
- Theo dõi số liệu người dùng thật (thời gian tải, Core Web Vitals) chứ không chỉ kích thước lúc build.

**Giảm:**

- Khai báo **shared dependency** cho các thư viện lõi để chỉ tải một bản — đây chính là lý do Module Federation ra đời.
- Thống nhất một phiên bản React chung cho toàn tổ chức và có lịch nâng cấp đồng bộ.
- Lazy load mảnh dưới màn hình đầu; prefetch mảnh quan trọng.
- Đặt **ngân sách bundle** cho mỗi mảnh và kiểm tra trong pipeline.

</details>

**6. Làm sao giữ nhất quán UI/UX khi mỗi nhóm tự làm một mảnh? Vai trò và cách quản lý phiên bản của `design system` chung?**

<details className="qa">
<summary>Xem đáp án</summary>

Nhất quán UI là một trong những cái giá lớn nhất — mỗi nhóm làm một kiểu. Cần cả công cụ lẫn kỷ luật:

- **Design system chung** làm nguồn sự thật cho màu, khoảng cách, typography và các component nền.
- **Design token dưới dạng biến CSS** — cách chia sẻ theme an toàn nhất vì nó xuyên qua ranh giới giữa các mảnh mà không kéo theo logic.
- **Quy ước chung** về trạng thái loading, thông báo lỗi, form, để trải nghiệm đồng đều.
- **Review chéo** hoặc một nhóm nền tảng giữ vai trò gác cổng cho những thay đổi ảnh hưởng nhiều mảnh.

Về phiên bản: design system nên phát hành qua **npm package có version rõ ràng**, tuân thủ ngữ nghĩa version và tuyệt đối tránh đổi phá vỡ. Điểm cần cân nhắc là nếu chia sẻ nó lúc runtime như một singleton thì mọi mảnh buộc phải dùng chung một bản — nhất quán tuyệt đối nhưng mất tự chủ. Cách dung hoà phổ biến: chia sẻ token lúc runtime, còn component thì mỗi mảnh tự nâng version theo lịch của mình.

</details>

**7. Vì sao chia sẻ state và routing xuyên mảnh lại khó? Nêu vài rủi ro cụ thể bạn từng gặp hoặc lường trước.**

<details className="qa">
<summary>Xem đáp án</summary>

Khó vì state và routing vốn là thứ **toàn cục**, trong khi kiến trúc này cố tình dựng ranh giới giữa các mảnh. Hễ hai mảnh cùng đọc/ghi một dữ liệu là chúng lại phụ thuộc nhau, và phụ thuộc thì đối nghịch với độc lập deploy.

Rủi ro cụ thể:

- **Đổi hình dạng state dùng chung** buộc nhiều mảnh phải deploy đồng bộ — mất luôn lợi ích chính.
- **Hai router cùng ghi vào history** khiến nút back nhảy sai hoặc phải bấm hai lần.
- **Deep link hỏng** vì trạng thái thật nằm trong bộ nhớ của một mảnh, không nằm trên URL.
- **Race condition** khi một mảnh đọc state trước lúc mảnh sở hữu kịp khởi tạo.
- **Rò bộ nhớ** do mảnh không huỷ đăng ký khỏi store lúc unmount.
- **Khó truy nguồn** — khi giá trị sai, không biết mảnh nào đã ghi.

Cách an toàn: giữ state dùng chung ở mức tối thiểu (người dùng, theme, ngôn ngữ), coi URL là nguồn sự thật cho điều hướng, và giao tiếp qua sự kiện thay vì đọc chéo state của nhau.

</details>

**8. Debug và `observability` một luồng nghiệp vụ đi qua nhiều mảnh khó ở chỗ nào? Bạn dựng gì để truy vết đầu–cuối?**

<details className="qa">
<summary>Xem đáp án</summary>

Khó vì một luồng (ví dụ: tìm sản phẩm → xem chi tiết → thêm vào giỏ → thanh toán) đi qua nhiều ứng dụng do nhiều nhóm sở hữu, mỗi mảnh có build riêng, log riêng, thậm chí phiên bản khác nhau trên cùng một phiên người dùng. Stack trace lại thường bị rút gọn nên không rõ lỗi thuộc mảnh nào.

Những thứ nên dựng:

- **Gắn nhãn mảnh và phiên bản** vào mọi log, lỗi và số liệu — để biết ngay ai chịu trách nhiệm.
- **Correlation id** tạo ở shell, truyền xuống mọi mảnh và đính kèm vào request tới backend, để nối được toàn tuyến.
- **Upload source map** của từng mảnh lên hệ thống theo dõi lỗi.
- **Ghi lại sự kiện giao tiếp giữa các mảnh** (mảnh nào phát, mảnh nào nhận) làm dấu vết.
- **Giám sát riêng cho từng mảnh** cộng một dashboard chung ở cấp trang.
- **Session replay** cho các luồng quan trọng, vì tái hiện lỗi xuyên mảnh rất tốn công.

</details>

**9. Bạn quản lý hợp đồng và tương thích phiên bản giữa shell và các mảnh ra sao? Có nên có contract test không?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì ghép lúc runtime, shell gọi những thứ nó không build cùng — nên hợp đồng phải được định nghĩa tường minh: mảnh phơi ra module nào, nhận props gì, phát sự kiện gì, và những thứ đó được coi là API công khai.

Nguyên tắc quản lý:

- **Chỉ thay đổi theo hướng cộng thêm** — thêm props tuỳ chọn, thêm sự kiện mới.
- Khi buộc phải đổi phá vỡ, **phơi ra tên module mới**, để shell chuyển sang khi sẵn sàng, rồi mới gỡ bản cũ.
- Ghi rõ **khoảng phiên bản dependency dùng chung** mà mảnh chấp nhận.
- Có quy trình rollback theo từng mảnh khi phát hiện lệch.

**Nên có contract test** — thậm chí là bắt buộc. Trong monolith, trình biên dịch và một lần build chung đã bắt lỗi giao diện; ở đây không còn ai bắt hộ, lỗi sẽ chỉ lộ ra lúc chạy trên production. Contract test chạy trong pipeline của mảnh, kiểm tra nó vẫn phơi ra đúng những gì đã cam kết, và chặn deploy nếu vi phạm.

</details>

**10. Nêu các tiêu chí bạn dùng để quyết định *có* áp dụng micro-frontend. Quy mô bao nhiêu nhóm thì bắt đầu hợp lý?**

<details className="qa">
<summary>Xem đáp án</summary>

Nên cân nhắc khi **đa số** các điều sau đúng:

- **Nhiều nhóm** cùng làm trên một sản phẩm và đang giẫm chân nhau.
- Ứng dụng **thực sự lớn**, nhiều mảng tính năng tách bạch rõ ràng.
- Cần **deploy độc lập** vì các mảng có nhịp phát hành rất khác nhau.
- Cần **tích hợp app cũ** với phần mới mà không viết lại tất cả.
- Tổ chức **chấp nhận đầu tư** hạ tầng và DevOps tương xứng.

Về quy mô, ngưỡng thường được nhắc là từ **khoảng 3–4 nhóm trở lên**. Nhưng con số chỉ là chỉ dấu; điều quan trọng hơn là triệu chứng thật: merge conflict thường xuyên, lịch release phải xếp hàng, thời gian build đủ lâu để làm chậm vòng phản hồi, và ranh giới nghiệp vụ giữa các nhóm đã rõ ràng. Nếu chưa thấy những triệu chứng đó thì dù đông người vẫn chưa cần tách.

</details>

**11. Khi nào KHÔNG nên dùng micro-frontend? Dấu hiệu nào cho thấy một đội đang chọn nó vì trào lưu?**

<details className="qa">
<summary>Xem đáp án</summary>

Không nên dùng khi:

- **Nhóm nhỏ** (một đến hai nhóm) — chi phí phức tạp lớn hơn lợi ích rất nhiều.
- App **vừa và nhỏ**, hoặc còn đang tìm hướng đi, yêu cầu chưa ổn định.
- Chỉ muốn **"chia code cho gọn"** — việc đó dùng module hoặc thư mục là đủ.
- Đội **chưa vững build tooling và CI/CD** — micro-frontend sẽ nhân đôi nỗi đau.

Dấu hiệu chọn theo trào lưu:

- Lý do đưa ra là "code rối quá" hoặc "cho hiện đại", chứ không phải các nhóm đang chặn nhau.
- Không ai nêu được **ai sở hữu mảnh nào** — chia theo tầng kỹ thuật thay vì theo nghiệp vụ.
- Chưa có kế hoạch cho design system, giám sát, rollback và contract test.
- Kết quả cuối vẫn **deploy tất cả cùng lúc** — tức là chỉ đổi cách xếp thư mục.
- Không ai trả lời được câu hỏi "vấn đề này modular monolith giải quyết được không?".

</details>

**12. `Modular monolith` khác micro-frontend ở những điểm nào? Vì sao thường nên bắt đầu từ đó?**

<details className="qa">
<summary>Xem đáp án</summary>

Modular monolith vẫn là **một codebase, một lần deploy**, nhưng có ranh giới module rõ ràng bên trong.

| | Modular monolith | Micro-frontend |
| --- | --- | --- |
| Codebase | Một | Nhiều |
| Deploy | Một lần | Độc lập từng mảnh |
| Độ phức tạp | Thấp | Cao |
| Phù hợp | Đa số dự án | Tổ chức lớn, nhiều nhóm |

Nên bắt đầu từ đó vì nó mang lại **phần lớn lợi ích về tổ chức code** (ranh giới rõ, quyền sở hữu rõ, dễ refactor) mà gần như **không phải trả cái giá vận hành**: không trùng dependency, không cần contract test, không phải lo ghép lúc runtime hay debug xuyên mảnh.

Quan trọng hơn, ranh giới module tốt chính là bước chuẩn bị cho việc tách sau này: khi nỗi đau tổ chức thực sự xuất hiện, bạn chỉ việc nhấc từng module ra thành mảnh riêng. Ngược lại, tách sớm khi ranh giới còn mơ hồ sẽ tạo ra những mảnh phụ thuộc chằng chịt, rất khó sửa.

</details>

**13. Quản lý yêu cầu chẻ app thành micro-frontend vì "code rối quá" — bạn phản biện và đề xuất phương án thay thế thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Đây đúng là **sai lầm phổ biến nhất**: dùng micro-frontend để trị vấn đề kỹ thuật, trong khi nó là giải pháp cho vấn đề tổ chức. Chẻ nhỏ một mớ rối chỉ biến mớ rối trong một app thành **mớ rối trải khắp nhiều app** — cộng thêm chi phí vận hành.

Cách phản biện: chỉ ra rằng ranh giới giữa các mảnh sẽ được vẽ đúng trên chính những chỗ đang rối, nên coupling không biến mất mà chỉ chuyển từ lời gọi hàm (compiler bắt được) thành lời gọi qua mạng lúc runtime (chỉ vỡ trên production).

Đề xuất thay thế, theo thứ tự:

1. **Refactor và module hoá** — làm rõ ranh giới ngay trong codebase hiện tại, đó là việc phải làm dù sau này có tách hay không.
2. **Modular monolith** — cố định ranh giới bằng quy tắc phụ thuộc và quyền sở hữu module.
3. Nếu sau đó **nỗi đau tổ chức thật sự xuất hiện** (nhiều nhóm chặn nhau), lúc đó tách mảnh sẽ vừa dễ vừa đúng chỗ.

</details>

**14. Nên chia mảnh theo miền nghiệp vụ hay theo tầng kỹ thuật? Vì sao cách chia sai lại phá hỏng lợi ích của kiến trúc?**

<details className="qa">
<summary>Xem đáp án</summary>

Chia theo **miền nghiệp vụ** — tìm kiếm, giỏ hàng, thanh toán, hồ sơ người dùng — chứ không theo tầng kỹ thuật kiểu "mảnh component", "mảnh gọi API", "mảnh state".

Vì sao chia theo tầng phá hỏng mọi thứ: một yêu cầu nghiệp vụ bình thường ("thêm mã giảm giá vào giỏ hàng") sẽ chạm vào **tất cả** các mảnh cùng lúc. Hậu quả:

- Phải **deploy đồng bộ** nhiều mảnh cho một tính năng — mất độc lập deploy.
- Không nhóm nào **sở hữu trọn vẹn** một tính năng — mất tự chủ.
- Lỗi lan ngang qua mọi mảnh — cô lập lỗi vô nghĩa.
- Chi phí vận hành vẫn còn nguyên, còn lợi ích thì bằng không.

Chia theo nghiệp vụ thì phần lớn thay đổi nằm gọn trong một mảnh, một nhóm tự làm tự release. Đây cũng chính là tinh thần mà microservices theo đuổi ở backend: ranh giới kiến trúc nên trùng với ranh giới đội ngũ và nghiệp vụ.

</details>

**15. Nếu một thay đổi ở model dùng chung buộc mọi mảnh phải deploy lại cùng lúc thì kiến trúc đang sai ở đâu, và sửa theo hướng nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Sai ở chỗ các mảnh đang **coupling chặt qua một model dùng chung**. Khi mọi mảnh phải deploy đồng bộ, bạn đã mất đặc tính quan trọng nhất — độc lập deploy — và về bản chất đang vận hành một monolith phân tán: chịu đủ chi phí của micro-frontend mà không có lợi ích nào.

Hướng sửa:

- **Thu nhỏ bề mặt dùng chung** — chỉ giữ lại những gì thật sự chung (người dùng đăng nhập, theme, ngôn ngữ), còn lại để mỗi mảnh tự định nghĩa model của riêng nó, kể cả khi phải lặp một ít.
- **Thay đọc chéo state bằng sự kiện** — mảnh này thông báo "đã thêm vào giỏ", mảnh kia tự quyết định phản ứng, không ai phụ thuộc hình dạng dữ liệu của ai.
- **Đổi theo hướng cộng thêm** — thêm field mới, giữ field cũ cho tới khi mọi mảnh đã chuyển, rồi mới gỡ.
- **Xem lại ranh giới chia mảnh** — nếu một model chạm vào mọi mảnh, rất có thể bạn đang chia theo tầng kỹ thuật thay vì theo miền nghiệp vụ.

</details>
