---
sidebar_position: 13
title: "Testing"
---

# Testing

## 1. Testing -- Jest, RNTL, Detox

Bài học: [1. Testing -- Jest, RNTL, Detox](../../react-native/13-testing/1_testing.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Pyramid testing là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Tỷ lệ test:

- **Unit** (nhiều nhất) -- nhanh, rẻ
- **Integration/Component** (vừa)
- **E2E** (ít nhất) -- chậm, đắt, flaky

Pyramid ngược (nhiều E2E, ít unit) -> bug nhiều, build chậm.

</details>

**2. RNTL vs Enzyme?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Enzyme** (cũ): test implementation -- shallow render, snapshot
- **RNTL** (mới): test behavior -- "user thấy gì, làm gì"

RNTL philosophy: **test như user dùng**. Khuyến nghị cho project mới.

</details>

**3. Detox vs Appium?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Detox**: dành riêng RN, dev viết, gray-box (biết internal RN), nhanh, ổn định
- **Appium**: đa platform/đa app, WebDriver, QA viết, chậm hơn

Dev team: Detox. QA team automation cross-app: Appium.

</details>

**4. TestID là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Prop `testID` cho RN component -- selector ổn định cho test, không phụ thuộc text/style:

```jsx
<Button testID="submit-btn" title="Submit" />

// Test
await element(by.id('submit-btn')).tap();
```

Khi text đổi (i18n), test không vỡ.

</details>

**5. Mock native module sao cho đúng?**

<details className="qa">
<summary>Xem đáp án</summary>

- Tạo file `__mocks__/<module>.ts` cùng cấu trúc
- Hoặc dùng `jest.mock('module-name', () => ({...}))`
- Mock cả async (`Promise.resolve`) và sync function
- Reset mock giữa test với `beforeEach(() => jest.clearAllMocks())`

</details>
