---
sidebar_position: 0
title: "Giới thiệu"
---

# Lộ trình học React Native

## React Native là gì?

React Native là một framework (bộ khung phát triển phần mềm) cho phép bạn dùng
React để viết ứng dụng di động chạy trên cả iOS và Android. Thay vì học hai ngôn
ngữ và hai công cụ riêng biệt (Swift/Objective-C cho iOS, Kotlin/Java cho
Android), bạn chỉ cần viết bằng JavaScript và React.

Điểm đặc biệt là React Native không tạo ra giao diện web nhúng trong app. Nó dịch
các thành phần (component) của bạn thành các thành phần giao diện gốc (native UI)
thật sự của hệ điều hành. Nhờ vậy ứng dụng trông và chạy mượt như một app được
viết thuần túy cho từng nền tảng.

## Vì sao nên dùng React Native?

- **Một codebase (mã nguồn dùng chung) cho hai nền tảng**: viết một lần, chạy
  được trên cả iOS lẫn Android, tiết kiệm rất nhiều thời gian và chi phí.
- **Tận dụng kiến thức React**: nếu bạn đã biết React thì học React Native rất
  nhanh vì cùng tư duy component và state (trạng thái).
- **Cộng đồng lớn**: nhiều thư viện, tài liệu và công cụ hỗ trợ sẵn có.
- **Hot Reload (tải lại nóng)**: thấy ngay thay đổi trên màn hình mà không cần
  biên dịch lại toàn bộ app.

## Khác React web thế nào?

- React web render (kết xuất) ra các thẻ HTML như `<div>`, `<p>`, `<span>`.
  React Native thì dùng các component riêng như `<View>`, `<Text>`, `<Image>`.
- React web tạo style bằng CSS. React Native dùng đối tượng JavaScript với
  `StyleSheet`, không có file CSS truyền thống.
- React web chạy trong trình duyệt (browser). React Native chạy trực tiếp trên
  thiết bị di động và gọi tới các API gốc của hệ điều hành.
- Việc điều hướng (navigation) giữa các màn hình trong React Native dùng thư viện
  riêng, không phải URL như trên web.

## Cần biết React trước

Bạn nên nắm vững React căn bản trước khi học React Native, bao gồm:
component, props (thuộc tính truyền vào), state, hooks (như `useState`,
`useEffect`) và cách quản lý dữ liệu. React Native chỉ thay đổi phần giao diện và
cách chạy, còn tư duy cốt lõi vẫn là React.

## Lộ trình học

| #  | Chủ đề                  | Mô tả                                                          |
|----|-------------------------|----------------------------------------------------------------|
| 1  | Introduction            | Giới thiệu tổng quan về React Native và hệ sinh thái           |
| 2  | Pre-requisites          | Kiến thức nền cần có: JavaScript, React, lập trình cơ bản      |
| 3  | Environment Setup       | Cài đặt môi trường: Node, trình giả lập, Xcode, Android Studio |
| 4  | Development Workflow     | Quy trình phát triển: chạy app, debug, hot reload              |
| 5  | Core Components         | Các component lõi: View, Text, Image, TextInput                |
| 6  | Lists & Scrolling       | Hiển thị danh sách và cuộn: FlatList, ScrollView, SectionList  |
| 7  | Platform Specific Code  | Viết mã riêng cho từng nền tảng iOS và Android                 |
| 8  | Styling                 | Tạo kiểu giao diện với StyleSheet và Flexbox                   |
| 9  | Interactions            | Xử lý tương tác: chạm, vuốt, cử chỉ, hoạt ảnh (animation)      |
| 10 | Networking              | Gọi API, lấy dữ liệu từ server qua fetch hoặc axios            |
| 11 | Security                | Bảo mật ứng dụng: lưu token an toàn, mã hóa dữ liệu nhạy cảm   |
| 12 | Storage                 | Lưu trữ dữ liệu trên thiết bị: AsyncStorage, SQLite, MMKV      |
| 13 | Testing                 | Kiểm thử: unit test, integration test, end-to-end test         |
| 14 | Native Modules          | Module gốc: kết nối React Native với mã native iOS/Android     |
| 15 | Performance             | Tối ưu hiệu năng: giảm render thừa, tối ưu danh sách và ảnh    |
| 16 | Publishing Apps         | Phát hành app lên App Store và Google Play                     |

## Học theo thứ tự nào?

Hãy đi tuần tự từ trên xuống theo bảng lộ trình. Các chủ đề được sắp xếp từ nền
tảng đến nâng cao, mỗi phần xây dựng dựa trên kiến thức của phần trước.

- Bắt đầu với phần **1–4** để hiểu React Native là gì và cài đặt được môi trường
  chạy thử app đầu tiên.
- Tiếp tục với **5–9** để làm chủ giao diện: dựng màn hình, danh sách, kiểu dáng
  và xử lý tương tác của người dùng.
- Sau đó học **10–12** để app kết nối được với server và lưu trữ dữ liệu an toàn.
- Cuối cùng đi vào **13–16** gồm kiểm thử, tích hợp native, tối ưu hiệu năng và
  phát hành sản phẩm thật ra thị trường.

Lời khuyên: học đến đâu thực hành đến đó. Hãy tự dựng một app nhỏ và áp dụng từng
chủ đề bạn vừa học, vì làm thực tế giúp ghi nhớ tốt hơn nhiều so với chỉ đọc.
