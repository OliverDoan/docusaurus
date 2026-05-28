---
sidebar_position: 6
title: "6. Cucumber-JVM (BDD)"
---

# Cucumber-JVM -- Behavior-Driven Development

**Cucumber** là tool **BDD** (Behavior-Driven Development) -- viết test bằng ngôn ngữ **gần ngôn ngữ tự nhiên** (Gherkin). Cho phép **Product, Tester, Developer** cùng đọc/viết test.

**Tương tự đơn giản:** Cucumber giống **biên bản cuộc họp** -- mô tả "Khi tôi làm X, hệ thống phản ứng Y" bằng tiếng Anh dễ hiểu. Sau đó dev viết code "dịch" sang test thật.

---

## Mục lục

- [1. BDD và Cucumber là gì?](#1-bdd-và-cucumber-là-gì)
- [2. Cài đặt](#2-cài-đặt)
- [3. Gherkin -- ngôn ngữ test](#3-gherkin-ngôn-ngữ-test)
- [4. Step Definitions](#4-step-definitions)
- [5. Hooks](#5-hooks)
- [6. Data table và Scenario outline](#6-data-table-và-scenario-outline)
- [7. Tags](#7-tags)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. BDD và Cucumber là gì?

**BDD** (Behavior-Driven Development) tập trung **hành vi** từ góc nhìn user. Test mô tả:

```
Khi user dang nhap voi mat khau dung
Thi user duoc chuyen den trang chu
Va hien thi loi chao "Welcome"
```

**Cucumber** đọc các file **.feature** viết bằng Gherkin, gắn với code Java (Step Definitions).

---

## 2. Cài đặt

```xml
<dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-java</artifactId>
    <version>7.14.0</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>io.cucumber</groupId>
    <artifactId>cucumber-junit-platform-engine</artifactId>
    <version>7.14.0</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.junit.platform</groupId>
    <artifactId>junit-platform-suite</artifactId>
    <version>1.10.0</version>
    <scope>test</scope>
</dependency>
```

### Cấu trúc

```
src/test/
├── java/com/example/
│   ├── steps/
│   │   └── UserSteps.java
│   └── RunCucumberTest.java
└── resources/
    └── features/
        └── login.feature
```

---

## 3. Gherkin -- ngôn ngữ test

```gherkin
# src/test/resources/features/login.feature
Feature: Dang nhap user
  As a user
  I want to dang nhap
  So that toi co the truy cap trang ca nhan

  Background:
    Given Co user voi email "alice@example.com" va mat khau "secret"

  Scenario: Dang nhap thanh cong
    When Toi dang nhap voi email "alice@example.com" va mat khau "secret"
    Then He thong tra ve token JWT
    And Toi duoc chuyen den trang chu

  Scenario: Dang nhap sai mat khau
    When Toi dang nhap voi email "alice@example.com" va mat khau "wrong"
    Then He thong tra ve loi "Sai mat khau"
    And Status code la 401

  Scenario Outline: Dang nhap voi nhieu input
    When Toi dang nhap voi email "<email>" va mat khau "<password>"
    Then Status code la <status>

    Examples:
      | email             | password | status |
      | alice@example.com | secret   | 200    |
      | alice@example.com | wrong    | 401    |
      | unknown@x.com     | any      | 404    |
```

### Keyword Gherkin

| Keyword       | Mô tả                              |
| ------------- | ---------------------------------- |
| `Feature`     | Tính năng                          |
| `Scenario`    | Kịch bản                           |
| `Given`       | Điều kiện ban đầu                  |
| `When`        | Hành động                          |
| `Then`        | Kết quả mong đợi                   |
| `And`, `But`  | Nối thêm                           |
| `Background`  | Setup chung cho mọi scenario       |
| `Scenario Outline` + `Examples` | Parameterized scenario |

---

## 4. Step Definitions

Mỗi step trong .feature có method Java tương ứng.

```java
package com.example.steps;

import io.cucumber.java.en.*;
import static org.assertj.core.api.Assertions.*;

public class LoginSteps {

    private String email;
    private String password;
    private LoginResponse response;
    private final UserService service = new UserService();

    @Given("Co user voi email {string} va mat khau {string}")
    public void coUser(String email, String password) {
        service.createUser(email, password);
    }

    @When("Toi dang nhap voi email {string} va mat khau {string}")
    public void toiDangNhap(String email, String password) {
        response = service.login(email, password);
    }

    @Then("He thong tra ve token JWT")
    public void heThongTraVeToken() {
        assertThat(response.getToken()).isNotNull();
    }

    @Then("Status code la {int}")
    public void statusCodeLa(int status) {
        assertThat(response.getStatusCode()).isEqualTo(status);
    }

    @Then("He thong tra ve loi {string}")
    public void heThongTraVeLoi(String error) {
        assertThat(response.getError()).isEqualTo(error);
    }
}
```

### Capture parameter

| Pattern        | Java type        |
| -------------- | ---------------- |
| `{string}`     | String           |
| `{int}`        | int              |
| `{double}`     | double           |
| `{word}`       | String (1 từ)    |
| `{}`           | Object (custom)  |

---

## 5. Hooks

```java
import io.cucumber.java.*;

public class Hooks {

    @Before
    public void setUp() {
        // truoc moi scenario
    }

    @After
    public void tearDown(Scenario scenario) {
        if (scenario.isFailed()) {
            // chup screenshot, log
        }
    }

    @Before("@db")
    public void setUpDb() {
        // chi cho scenario co @db
    }
}
```

---

## 6. Data table và Scenario outline

### Data table

```gherkin
Scenario: Tao nhieu user
  When Toi tao nhung user sau:
    | email          | name  |
    | a@example.com  | Alice |
    | b@example.com  | Bob   |
```

```java
@When("Toi tao nhung user sau:")
public void taoUsers(io.cucumber.datatable.DataTable table) {
    List<Map<String, String>> rows = table.asMaps();
    for (Map<String, String> row : rows) {
        service.createUser(row.get("email"), row.get("name"));
    }
}
```

### Scenario Outline

```gherkin
Scenario Outline: Validate email
  When Validate email "<email>"
  Then Ket qua la <valid>

  Examples:
    | email           | valid |
    | a@b.com         | true  |
    | invalid-email   | false |
    | @b.com          | false |
```

---

## 7. Tags

```gherkin
@smoke @login
Scenario: Login thanh cong
  ...

@regression @login
Scenario: Login thieu thong tin
  ...
```

### Chạy theo tag

```xml
<!-- JUnit Suite -->
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = FILTER_TAGS_PROPERTY_NAME, value = "@smoke")
public class RunCucumberTest { }
```

Hoặc CLI:

```bash
mvn test -Dcucumber.filter.tags="@smoke and not @slow"
```

---

## Khi nào dùng?

- **Cucumber khi:**
  - Cần **Product/QA non-tech** đọc/viết test
  - Acceptance test, E2E test
  - Documentation living -- feature file = doc
- **KHÔNG dùng Cucumber khi:**
  - Unit test -- overhead cao
  - Team không có người non-dev tham gia
  - Test "what" cụ thể kỹ thuật -- JUnit đơn giản hơn
- **Best practice:**
  - Feature **theo nghiệp vụ** (login, checkout) -- không theo class
  - Step **business language** -- không kỹ thuật
  - Step **reusable** -- tránh trùng lặp
  - Background cho setup chung
  - Tag theo môi trường, speed, feature

---

## Lỗi thường gặp

### Lỗi 1: Step quá kỹ thuật

```gherkin
# SAI -- ngon ngu code
When Goi POST /api/users voi body {"name": "Alice"}

# DUNG -- ngon ngu nghiep vu
When Toi tao user "Alice"
```

### Lỗi 2: Step không reusable

```gherkin
# SAI -- moi scenario step khac nhau
When Toi click button Submit cua form dang ky
When Toi click button Submit cua form dang nhap

# DUNG -- generic
When Toi click button "Submit"
```

### Lỗi 3: State giữa scenario

```java
// SAI -- field giua scenario, scenario sau bi anh huong
private User user;

// DUNG -- @Before clean state, hoac DI scenario scope
```

### Lỗi 4: Quá nhiều "And"

```gherkin
# SAI -- scenario dai
Given ...
And ...
And ...
And ...

# DUNG -- tach scenario hoac dung Background
```

---

## Câu hỏi phỏng vấn

### Câu 1: BDD là gì? Khác TDD?

**Trả lời:**

- **TDD** (Test-Driven Development): viết test trước, code sau -- góc nhìn dev
- **BDD** (Behavior-Driven Development): mô tả hành vi từ user -- góc nhìn business

BDD bao gồm TDD nhưng thêm communication với non-dev. Cucumber thực thi BDD.

### Câu 2: Gherkin là gì?

**Trả lời:** Ngôn ngữ **đọc gần tự nhiên** của Cucumber -- viết test với keyword `Given`, `When`, `Then`. File `.feature` chứa scenario. Có thể viết bằng nhiều ngôn ngữ -- bao gồm tiếng Việt (`Cho rằng`, `Khi`, `Thì`).

### Câu 3: Step Definition là gì?

**Trả lời:** Method Java **gắn với step** trong feature file. Cucumber match step text với regex/cucumber expression của step definition để chạy code tương ứng.

```java
@When("Toi tao user {string}")
public void taoUser(String name) { ... }
```

### Câu 4: Khi nào KHÔNG nên dùng Cucumber?

**Trả lời:**

- **Unit test** -- overhead lớn, JUnit đơn giản hơn
- **Team không có non-dev** -- viết Gherkin không có ý nghĩa thêm
- **Test kỹ thuật cụ thể** -- "trả về JSON đúng schema" -- Gherkin không phù hợp
- **Project không stable** -- feature file phải maintain

### Câu 5: Tags lợi ích gì?

**Trả lời:** Phân nhóm scenario -- chạy subset theo nhu cầu:

- `@smoke`: chạy mỗi PR
- `@regression`: chạy mỗi đêm
- `@slow`: chạy weekend
- `@wip`: skip khi CI

Linh hoạt CI pipeline.
