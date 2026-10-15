---
sidebar_position: 16
title: "Publishing Apps"
---

# Publishing Apps

## 1. Publishing -- App Store và Play Store

Bài học: [1. Publishing -- App Store và Play Store](../../react-native/16-publishing/1_publishing.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. EAS Build là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Expo cloud build service. Build .ipa/.aab trên cloud -- **không cần Mac** cho iOS. Tự quản lý cert/keystore. Trade-off: phụ thuộc Expo (free tier có limit), nhưng tiết kiệm setup CI/CD.

</details>

**2. TestFlight và Play Console Internal Testing?**

<details className="qa">
<summary>Xem đáp án</summary>

- **TestFlight** (iOS): tester join qua email/code, 10k tester external, 90 ngày
- **Play Console Internal Testing**: tester join qua link/email, 100 tester internal

Beta test trước production -- bắt bug, gather feedback.

</details>

**3. OTA Update có an toàn không?**

<details className="qa">
<summary>Xem đáp án</summary>

Có nếu dùng đúng. **App Store policy**:

- Update **chỉ JS code** (bug fix, content)
- KHÔNG thay đổi function chính ("bait and switch")

Lạm dụng -> Apple có thể ban developer account. Sử dụng có trách nhiệm.

</details>

**4. APK vs AAB?**

<details className="qa">
<summary>Xem đáp án</summary>

- **APK**: file install Android cũ, 1 file cho mọi device
- **AAB** (App Bundle, từ 2021): chỉ upload, Google tự sinh APK cho từng device -- app size nhỏ hơn 15-30%

Play Store **bắt buộc AAB** cho app mới.

</details>

**5. Phased release là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Release tăng dần: 1% user ngày 1, 5% ngày 2, 10% ngày 3... -> 100% ngày 7. Lợi:

- Detect bug sớm (crash rate)
- Có thể **rollback** nếu vấn đề lớn
- Server scale dần

Play Console + App Store Connect đều hỗ trợ.

</details>
