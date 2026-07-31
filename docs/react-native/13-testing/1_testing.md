---
sidebar_position: 1
title: "1. Testing -- Jest, RNTL, Detox"
---

# Testing trong React Native

Test mobile khó hơn web -- cần test trên thiết bị/simulator, có nhiều tầng (unit, component, E2E). RN có hệ sinh thái testing tốt: **Jest**, **React Native Testing Library**, **Detox**, **Appium**.

**Tương tự đơn giản:** Testing giống **kiểm tra chất lượng** xe ô tô:

- **Unit test** = kiểm tra từng linh kiện (động cơ, bánh)
- **Component test** = kiểm tra cụm (hệ thống lái)
- **E2E test** = lái thử nguyên xe trên đường

---

:::note[Ghi nhớ nhanh]

- ⭐ **Test pyramid** — nhiều unit (Jest), vừa component (RNTL), ít E2E (Detox); luôn test behavior chứ không test implementation.
- **Jest** — test runner mặc định của RN cho utility, business logic, hooks; hỗ trợ `jest.mock` mock module.
- **React Native Testing Library** — test component như user dùng (`getByText`, `getByPlaceholderText`, `fireEvent`).
- **Detox vs Appium** — Detox E2E cho dev team (RN-specific, nhanh, ổn định); Appium cho QA automation đa platform.
- ⭐ **`testID`** — selector ổn định cho test, không vỡ khi text đổi (i18n).

:::

---

## Mục lục

- [Vì sao cần test app React Native?](#vì-sao-cần-test-app-react-native)
- [1. Jest -- unit test](#1-jest-unit-test)
- [2. React Native Testing Library](#2-react-native-testing-library)
- [3. Detox -- E2E test](#3-detox-e2e-test)
- [4. Appium](#4-appium)
- [5. Mock](#5-mock)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao cần test app React Native?

**Vấn đề:** Test app mobile bằng tay cực tốn công. Phải thử trên **nhiều thiết bị**, nhiều **OS version** (iOS/Android cũ và mới), nhiều **kích thước màn hình**. Mỗi lần phát hành lại phải qua **store review** mất nhiều ngày, nên một bug lọt ra ngoài rất khó vá nhanh. Và mỗi lần refactor là một lần dễ làm vỡ luồng đang chạy ổn mà không ai hay.

**Giải pháp:** Test tự động nhiều tầng. Tầng dưới chạy nhanh và nhiều: **unit/component** với **Jest** + **React Native Testing Library** (kiểm thử theo góc nhìn người dùng -- "user thấy gì, làm gì"). Tầng trên ít hơn nhưng sát thật: **E2E** trên simulator/emulator/thiết bị thật với **Detox** (hoặc **Appium** cho QA automation đa platform) cho các luồng quan trọng. Mục tiêu là bắt lỗi **trước khi lên store**, không phải sau khi user phàn nàn.

:::tip[Dùng thực tế]

- **Test component render + đổi state:** dùng RNTL kiểm tra form hiển thị đúng và đổi đúng khi user gõ/bấm.
- **Test luồng đăng nhập E2E:** Detox chạy app thật, nhập email/mật khẩu, bấm nút, kiểm tra đã vào màn hình chính.
- **Chống regression trước release:** chạy bộ test mỗi PR để refactor không làm vỡ luồng cũ.
- **Test trên nhiều cấu hình:** chạy E2E trên nhiều simulator/OS version để bắt lỗi đặc thù thiết bị.

:::

---

## 1. Jest -- unit test

Jest là test runner mặc định của RN.

```jsx
// utils.test.ts
import { add, formatPrice } from './utils';

describe('utils', () => {
  test('add two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  test('formatPrice', () => {
    expect(formatPrice(1000)).toBe('1.000 VND');
  });

  test('formatPrice -- 0', () => {
    expect(formatPrice(0)).toBe('0 VND');
  });
});
```

### Chạy

```bash
npm test
npm test -- --watch     # watch mode
npm test -- --coverage  # coverage report
```

### Mocking

```jsx
// Mock module
jest.mock('axios');
import axios from 'axios';

test('fetch user', async () => {
  axios.get.mockResolvedValue({ data: { id: 1, name: 'Alice' } });

  const user = await fetchUser(1);
  expect(user.name).toBe('Alice');
});
```

---

## 2. React Native Testing Library

`@testing-library/react-native` -- test component như user dùng.

```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native
```

```jsx
// LoginForm.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  test('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<LoginForm />);

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Mat khau')).toBeTruthy();
    expect(getByText('Dang nhap')).toBeTruthy();
  });

  test('submits with email and password', async () => {
    const onSubmit = jest.fn();
    const { getByPlaceholderText, getByText } = render(<LoginForm onSubmit={onSubmit} />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'a@b.com');
    fireEvent.changeText(getByPlaceholderText('Mat khau'), 'secret');
    fireEvent.press(getByText('Dang nhap'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'secret',
      });
    });
  });

  test('shows error if email invalid', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<LoginForm />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'invalid');
    fireEvent.press(getByText('Dang nhap'));

    expect(queryByText('Email khong hop le')).toBeTruthy();
  });
});
```

### Query selectors

| Method                  | Mô tả                                |
| ----------------------- | ------------------------------------ |
| `getByText`             | Text hiển thị                        |
| `getByPlaceholderText`  | TextInput placeholder                |
| `getByTestId`           | `testID` prop                        |
| `getByRole`             | Accessibility role                   |
| `getByLabelText`        | accessibilityLabel                   |
| `queryBy*`              | Tương tự nhưng trả null nếu không có |
| `findBy*`               | Async (chờ)                          |

### Best practice

```jsx
// Khong test implementation
expect(state.count).toBe(1); // SAI

// Test behavior (user thay gi)
expect(getByText('Count: 1')).toBeTruthy(); // DUNG
```

---

## 3. Detox -- E2E test

Detox -- E2E test framework dành riêng cho RN. Chạy app thật trên simulator/emulator.

### Setup

```bash
npm install --save-dev detox @types/detox
```

```js
// .detoxrc.js
module.exports = {
  testRunner: { args: { $0: 'jest', config: 'e2e/jest.config.js' } },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/MyApp.app',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 15' },
    },
  },
  configurations: {
    'ios.sim.debug': { device: 'simulator', app: 'ios.debug' },
  },
};
```

### Viết test

```js
// e2e/login.e2e.js
describe('Login flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should login successfully', async () => {
    await element(by.id('emailInput')).typeText('a@b.com');
    await element(by.id('passwordInput')).typeText('secret');
    await element(by.id('loginButton')).tap();

    await expect(element(by.id('homeScreen'))).toBeVisible();
  });

  it('should show error for invalid email', async () => {
    await element(by.id('emailInput')).typeText('invalid');
    await element(by.id('loginButton')).tap();

    await expect(element(by.text('Email khong hop le'))).toBeVisible();
  });
});
```

### Component cần có `testID`

```jsx
<TextInput testID="emailInput" />
<Pressable testID="loginButton" />
```

### Chạy

```bash
detox build --configuration ios.sim.debug
detox test --configuration ios.sim.debug
```

---

## 4. Appium

`Appium` -- E2E test framework đa platform (RN, native, web). Phổ biến cho automation QA.

```bash
npm install -g appium
```

```js
// test.js (WebdriverIO + Appium)
describe('App', () => {
  it('should login', async () => {
    const email = await $('~emailInput');
    await email.setValue('a@b.com');

    const button = await $('~loginButton');
    await button.click();

    const home = await $('~homeScreen');
    expect(await home.isDisplayed()).toBe(true);
  });
});
```

### Đặc điểm

- **Đa platform**: iOS, Android, web -- 1 framework
- **Đa ngôn ngữ**: JS, Python, Java, Ruby
- **Chậm hơn Detox** vì qua WebDriver protocol
- Phổ biến trong **QA team** -- ít dev animation cao

**Detox** ưu tiên cho dev team. **Appium** ưu tiên cho QA team automation.

---

## 5. Mock

### Mock native module

```jsx
// __mocks__/expo-secure-store.ts
export const setItemAsync = jest.fn();
export const getItemAsync = jest.fn(() => Promise.resolve('mock-token'));
export const deleteItemAsync = jest.fn();
```

### Mock navigation

```jsx
// Test screen voi mock navigation
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

test('navigates to detail', () => {
  const { getByText } = render(<UserList />);
  fireEvent.press(getByText('Alice'));
  expect(mockNavigate).toHaveBeenCalledWith('UserDetail', { id: 1 });
});
```

### Mock fetch

```jsx
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: [] }),
  })
);
```

Hoặc dùng `msw` (Mock Service Worker) -- mock network level.

---

## Khi nào dùng?

- **Jest**: utility, business logic, hooks (testRenderer)
- **RNTL**: component, integration
- **Detox**: critical flow E2E (login, checkout)
- **Appium**: QA automation
- **Best practice:**
  - Test pyramid: nhiều unit, ít E2E
  - **TestID** cho mọi element cần test
  - **Mock** external dependency (API, native module)
  - CI run test mỗi PR
  - Coverage > 70% cho code business

---

## Lỗi thường gặp

### Lỗi 1: Quên transform pattern

```js
// jest.config.js
module.exports = {
  preset: 'jest-expo',  // hoac 'react-native'
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-navigation)',
  ],
};
```

Một số package ESM cần transform.

### Lỗi 2: Test async không await

```jsx
// SAI
test('async', () => {
  loadData(); // promise khong await -> test fail luc khac
  expect(...);
});

// DUNG
test('async', async () => {
  await loadData();
  await waitFor(() => expect(...).toBeTruthy());
});
```

### Lỗi 3: E2E flaky

- Wait thay vì sleep (`waitFor` thay `setTimeout`)
- Retry nhẹ
- TestID rõ ràng, không phụ thuộc text (text đổi sẽ vỡ)

### Lỗi 4: Test implementation thay vì behavior

```jsx
// SAI -- check internal state
expect(component.state.count).toBe(1);

// DUNG -- check user thay gi
expect(getByText('Count: 1')).toBeTruthy();
```

### Lỗi 5: Detox chậm

- Reuse app state với `device.launchApp({ newInstance: false })`
- Parallel test trên multi-simulator
- Snapshot baseline DB

---

## Câu hỏi phỏng vấn

### Câu 1: Pyramid testing là gì?

**Trả lời:** Tỷ lệ test:

- **Unit** (nhiều nhất) -- nhanh, rẻ
- **Integration/Component** (vừa)
- **E2E** (ít nhất) -- chậm, đắt, flaky

Pyramid ngược (nhiều E2E, ít unit) -> bug nhiều, build chậm.

### Câu 2: RNTL vs Enzyme?

**Trả lời:**

- **Enzyme** (cũ): test implementation -- shallow render, snapshot
- **RNTL** (mới): test behavior -- "user thấy gì, làm gì"

RNTL philosophy: **test như user dùng**. Khuyến nghị cho project mới.

### Câu 3: Detox vs Appium?

**Trả lời:**

- **Detox**: dành riêng RN, dev viết, gray-box (biết internal RN), nhanh, ổn định
- **Appium**: đa platform/đa app, WebDriver, QA viết, chậm hơn

Dev team: Detox. QA team automation cross-app: Appium.

### Câu 4: TestID là gì?

**Trả lời:** Prop `testID` cho RN component -- selector ổn định cho test, không phụ thuộc text/style:

```jsx
<Button testID="submit-btn" title="Submit" />

// Test
await element(by.id('submit-btn')).tap();
```

Khi text đổi (i18n), test không vỡ.

### Câu 5: Mock native module sao cho đúng?

**Trả lời:**

- Tạo file `__mocks__/<module>.ts` cùng cấu trúc
- Hoặc dùng `jest.mock('module-name', () => ({...}))`
- Mock cả async (`Promise.resolve`) và sync function
- Reset mock giữa test với `beforeEach(() => jest.clearAllMocks())`
