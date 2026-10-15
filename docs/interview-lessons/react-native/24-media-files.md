---
sidebar_position: 24
title: "Media & Files"
---

# Media & Files

## 1. Media & File: ảnh, video, tài liệu, upload/download

Bài học: [1. Media & File: ảnh, video, tài liệu, upload/download](../../react-native/24-media-files/1_media-files.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao khi upload multipart bằng `fetch` không nên tự set header `Content-Type`?**

<details className="qa">
<summary>Xem đáp án</summary>

`multipart/form-data` cần một `boundary` (chuỗi phân tách các phần trong body) do runtime tự sinh dựa trên nội dung `FormData`. Nếu tự set `Content-Type` thủ công, giá trị đó thường thiếu `boundary`, khiến server không parse được các phần trong request và trả lỗi 400/415. Cứ để `fetch`/`XMLHttpRequest` tự thêm header khi thấy body là `FormData`.

</details>

**2. Phần tử file trong `FormData` trên React Native có gì khác so với trên web?**

<details className="qa">
<summary>Xem đáp án</summary>

Trên web, `FormData` nhận `Blob`/`File` thật. Trên RN, không có `Blob` đọc từ input như vậy — thay vào đó truyền một object mô tả `{ uri, name, type }`, RN tự đọc nội dung file tại `uri` đó khi build request ở tầng native.

</details>

**3. `content://`, `file://`, `ph://` khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- `file://`: đường dẫn file thật trên đĩa, đọc/ghi trực tiếp được.
- `content://` (Android): URI trỏ tới content provider (có thể là Google Drive, Files app...), không phải file vật lý cố định — một số thao tác cần "xuất" ra file thật trước (`keepLocalCopy`).
- `ph://` (iOS): URI asset trong thư viện ảnh Photos, chỉ truy cập được qua API dành riêng cho Photos.

</details>

**4. Tại sao nên dùng `react-native-fast-image` thay vì `Image` cho danh sách ảnh dài?**

<details className="qa">
<summary>Xem đáp án</summary>

`Image` built-in không có cơ chế cache đĩa mạnh và ổn định giữa các nền tảng, dễ tải lại ảnh từ mạng khi re-render hoặc cuộn qua cuộn lại. `react-native-fast-image` dùng thư viện cache ảnh native (SDWebImage/Glide), hỗ trợ `priority` để ưu tiên tải, và `cache: 'immutable'` cho ảnh có URL không đổi nội dung.

</details>

**5. Resumable upload nghĩa là gì, và vì sao cần chia chunk?**

<details className="qa">
<summary>Xem đáp án</summary>

Resumable upload là khả năng tiếp tục một lượt tải lên dang dở thay vì gửi lại từ đầu khi bị gián đoạn (mất mạng, tắt app). Chia file thành các chunk nhỏ giúp: (1) mỗi request nhỏ hơn, ít khả năng timeout hơn; (2) khi một phần thất bại chỉ cần gửi lại đúng phần đó; (3) server có thể theo dõi tiến độ ghép file theo từng chunk đã nhận.

</details>

**6. Presigned URL là gì và giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Presigned URL là một URL có chữ ký tạm thời, cho phép client upload/tải file **thẳng** tới nơi lưu trữ (ví dụ object storage) mà không cần đi qua backend như một trạm trung chuyển. Backend chỉ cấp URL đó (kèm quyền và thời hạn), còn dữ liệu file đi thẳng client-storage — giảm tải băng thông và CPU cho backend, đặc biệt quan trọng với file lớn.

</details>

**7. Vì sao cần thư mục cache riêng (`CachesDirectoryPath`) thay vì chỉ dùng `DocumentDirectoryPath`?**

<details className="qa">
<summary>Xem đáp án</summary>

`CachesDirectoryPath` là nơi hệ điều hành được phép tự xoá bớt khi máy thiếu dung lượng — phù hợp cho dữ liệu có thể tải lại (ảnh cache, file tạm để share). `DocumentDirectoryPath` bền hơn (được backup, không bị hệ điều hành tự xoá) — dùng cho dữ liệu người dùng cần giữ chắc chắn, như file đã tải về để xem offline lâu dài.

</details>

**8. Vì sao gọi `Share.open` hoặc `launchImageLibrary` xong thấy "lỗi" khi người dùng chỉ bấm Huỷ?**

<details className="qa">
<summary>Xem đáp án</summary>

Nhiều API dạng dialog hệ thống coi việc người dùng bấm Huỷ là một nhánh phản hồi bình thường chứ không phải ngoại lệ thật: `launchImageLibrary` trả `didCancel: true`, document picker ném lỗi mã `OPERATION_CANCELED`, còn `Share.open` có thể reject promise khi người dùng đóng sheet chia sẻ. Cần phân biệt rõ nhánh này với lỗi thật (permission, network...) để tránh hiện thông báo lỗi sai cho người dùng.

</details>

**9. Vì sao nên kiểm tra dung lượng file ở client trước khi upload, thay vì để server kiểm tra?**

<details className="qa">
<summary>Xem đáp án</summary>

Kiểm tra sớm ở client tiết kiệm băng thông và thời gian chờ của người dùng — không mất công gửi cả trăm MB lên rồi mới nhận lỗi. Tuy nhiên kiểm tra client không thay thế được kiểm tra ở server: client có thể bị bỏ qua hoặc sai lệch, nên trần dung lượng vẫn phải được backend xác nhận lại.

</details>

**10. `react-native-fs` và `react-native-blob-util` khác nhau ở điểm nào, khi nào chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều thao tác được với hệ thống file, nhưng `react-native-fs` thiên về quản lý đường dẫn/thư mục và tải file đơn giản có tiến độ; `react-native-blob-util` mạnh hơn ở phần network — đặc biệt là upload multipart có theo dõi tiến độ chi tiết (`uploadProgress`) và tích hợp `DownloadManager` của Android cho tải file nền. Nhiều dự án dùng cả hai: `react-native-fs` cho quản lý file cục bộ, `react-native-blob-util` cho phần upload/download nặng.

</details>

**11. Vì sao ảnh chụp bằng camera đôi khi không xuất hiện trong thư viện ảnh dù chụp thành công?**

<details className="qa">
<summary>Xem đáp án</summary>

`launchCamera` mặc định chỉ trả về asset cho app dùng (upload, hiển thị) — không tự động lưu vào thư viện ảnh của máy trừ khi bật tuỳ chọn `saveToPhotos: true`. Nếu cần cả hai (dùng trong app và lưu vào Gallery/Photos), phải bật tuỳ chọn đó hoặc gọi thêm `CameraRoll.saveAsset` sau khi chụp.

</details>

**12. MIME type trả về từ picker không đáng tin ở trường hợp nào, và nên xử lý ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Trên Android, một số content provider (đặc biệt các provider của bên thứ ba) không trả đúng MIME type, có thể trả `null` hoặc giá trị chung chung. Chiến lược an toàn: ưu tiên MIME server xác nhận sau khi nhận file; nếu chưa có, suy ra từ phần đuôi file; chỉ dùng `application/octet-stream` khi không còn cách nào khác để xác định.

</details>
