---
sidebar_position: 5
title: "5. JMeter (Performance Testing)"
---

# Apache JMeter -- Load & Performance Testing

**JMeter** là tool **load testing** và **performance testing** mã nguồn mở. Dùng để **mô phỏng hàng nghìn user** truy cập app cùng lúc, đo throughput, latency, error rate.

**Tương tự đơn giản:** JMeter giống **máy giả lập giao thông** cho con đường (app). Bạn bật 1000 xe ảo cùng đi qua, đo xem đường chịu được không, có kẹt xe ở đâu.

---

## Mục lục

- [1. JMeter là gì?](#1-jmeter-là-gì)
- [2. Cài đặt](#2-cài-đặt)
- [3. Test Plan](#3-test-plan)
- [4. Thread Group](#4-thread-group)
- [5. Samplers (HTTP Request)](#5-samplers-http-request)
- [6. Listeners (Kết quả)](#6-listeners-kết-quả)
- [7. CLI mode (non-GUI)](#7-cli-mode-non-gui)
- [8. CI/CD integration](#8-cicd-integration)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. JMeter là gì?

JMeter có thể test:

- **HTTP/HTTPS** -- REST API, web
- **WebSocket, MQTT**
- **Database** (JDBC)
- **JMS, FTP, SMTP, LDAP**
- **gRPC** (qua plugin)

Loại test:

- **Load test**: tải bình thường (N user)
- **Stress test**: tải vượt giới hạn
- **Spike test**: tăng đột ngột
- **Soak/Endurance test**: tải lâu (giờ -- ngày)

---

## 2. Cài đặt

### Yêu cầu

- Java 8+
- Tải https://jmeter.apache.org/download_jmeter.cgi

### Chạy

```bash
# GUI mode (chi de design test)
./bin/jmeter

# Linux/Mac
./jmeter.sh
```

---

## 3. Test Plan

Cấu trúc 1 test plan:

```
Test Plan
├── Thread Group (Users)
│   ├── HTTP Request Defaults (config chung)
│   ├── HTTP Cookie Manager
│   ├── HTTP Header Manager
│   ├── HTTP Request (GET /api/users)
│   │   └── Response Assertion (200)
│   ├── HTTP Request (POST /api/users)
│   └── Listener (Summary Report, Graph)
└── Listener
```

---

## 4. Thread Group

Định nghĩa **bao nhiêu user**, **bao lâu**, **bao nhiêu lần**.

```
Number of Threads (users): 100         <- 100 user ao
Ramp-up period: 30 (seconds)            <- start 100 user trong 30s
Loop Count: 10                          <- moi user lap 10 lan
Duration: 600 (seconds)                 <- chay 10 phut
```

### Các loại Thread Group

- **Thread Group**: cố định số user
- **Stepping Thread Group**: tăng dần
- **Ultimate Thread Group**: linh hoạt (plugin)

---

## 5. Samplers (HTTP Request)

```
HTTP Request:
  Server: api.example.com
  Port: 443
  Protocol: https
  Method: GET / POST / PUT / DELETE
  Path: /api/users
  Body: {"name": "Alice"}
  Parameters: id=1
```

### Variables

```
${userId}             <- bien
${__Random(1, 100)}   <- function: so random
${__time(yyyy-MM-dd)} <- time
```

### CSV Data Set Config

Đọc data từ file CSV.

```
File: users.csv
Variables: username,password
```

```
HTTP POST /login
Body: {"username": "${username}", "password": "${password}"}
```

### Assertion

```
Response Assertion:
  Field: Response Code
  Pattern: 200

JSON Assertion:
  JSON Path: $.id
  Expected Value: not null

Duration Assertion:
  Maximum: 500 (ms)
```

---

## 6. Listeners (Kết quả)

| Listener            | Mô tả                              |
| ------------------- | ---------------------------------- |
| **Summary Report**  | Bảng tổng quan (avg, p90, errors)  |
| **Aggregate Report**| Chi tiết theo endpoint             |
| **View Results Tree** | Xem từng request (chỉ dev)       |
| **Graph Results**   | Biểu đồ throughput, latency        |
| **Backend Listener**| Push metric tới InfluxDB/Grafana   |

### Chỉ số quan trọng

- **Average**: thời gian trung bình
- **Median (p50)**: 50% request dưới mức này
- **p90, p95, p99**: percentile -- quan trọng hơn average
- **Throughput**: request/sec
- **Error %**: tỉ lệ lỗi
- **Std. Dev**: độ phân tán

---

## 7. CLI mode (non-GUI)

**Khuyến nghị production:** chạy CLI -- không tốn resource cho GUI.

```bash
jmeter -n -t test.jmx -l result.jtl -e -o report/
```

- `-n`: non-GUI
- `-t`: file test plan
- `-l`: file log kết quả
- `-e`: generate HTML report
- `-o`: thư mục output report

### HTML report

JMeter sinh report đẹp -- có graph throughput, response time, error...

---

## 8. CI/CD integration

### Jenkins/GitLab CI

```yaml
load-test:
  image: justb4/jmeter:latest
  script:
    - jmeter -n -t tests/load-test.jmx -l result.jtl -e -o report/
  artifacts:
    paths:
      - report/
      - result.jtl
```

### So sánh với baseline

Dùng plugin **JMeter Performance Plugin** hoặc tool như **Taurus** -- so sánh result giữa các lần build.

---

## Khi nào dùng?

- **Dùng JMeter khi:**
  - Capacity planning -- "app chịu được bao nhiêu user?"
  - Stress test trước release
  - Tìm bottleneck (DB, network, code)
  - SLA verification -- "p95 < 500ms?"
- **Alternative:**
  - **Gatling**: Scala-based, code-first, đẹp hơn
  - **k6**: JavaScript, modern, cloud-native
  - **Locust**: Python, distributed
- **Best practice:**
  - **Chạy CLI** -- GUI chỉ để design
  - **Realistic data** -- không repeat 1 user 1000 lần
  - **Ramp-up dần** -- không spike ngay
  - **Test môi trường giống production**
  - **Monitor server** -- CPU, RAM, network, DB

---

## Lỗi thường gặp

### Lỗi 1: Chạy GUI mode cho load test thật

GUI tốn resource -- không đo chính xác. **Luôn dùng CLI** cho test thật.

### Lỗi 2: Quá ít user nhưng nói "load test"

100 user/server trong test, real load = 10k user -> không phát hiện bottleneck.

### Lỗi 3: Không xem percentile

Average che giấu tail latency. **p95, p99** quan trọng hơn -- 1% user chậm = trải nghiệm xấu.

### Lỗi 4: Test trên dev env

DB nhỏ, network nội bộ -> kết quả không phản ánh production. Test trên môi trường **giống production** (staging).

### Lỗi 5: Không cleanup

Test tạo 1M record vào DB, không cleanup -> ảnh hưởng test sau và data thật.

---

## Câu hỏi phỏng vấn

### Câu 1: Load test, Stress test, Spike test khác gì?

**Trả lời:**

- **Load test**: tải bình thường (peak production) -- kiểm tra app hoạt động OK
- **Stress test**: tải vượt giới hạn -- tìm breaking point
- **Spike test**: tăng đột ngột (Black Friday) -- check auto-scaling
- **Soak/Endurance**: tải bình thường nhưng lâu (giờ-ngày) -- tìm memory leak, resource exhaustion

### Câu 2: Tại sao percentile quan trọng hơn average?

**Trả lời:**

- **Average** có thể che giấu **outlier** -- 99 request 100ms + 1 request 10000ms = average 200ms (vẻ ok)
- **p99** = 99% request dưới giá trị này -- thấy ngay 1% user trải nghiệm tệ

SLA thường dựa percentile (p95/p99), không phải average.

### Câu 3: GUI vs CLI mode?

**Trả lời:**

- **GUI**: design, debug test plan -- tốn resource
- **CLI** (`-n`): chạy thực thi -- nhẹ, chính xác

**Luôn chạy CLI** cho test production. GUI chỉ dùng dev.

### Câu 4: Cách giải quyết "test machine bị bottleneck"?

**Trả lời:**

- **Distributed mode**: 1 master + nhiều slave (server) -- chia tải
- **Cloud-based**: BlazeMeter, k6 Cloud, AWS Load Testing
- **Giảm number of thread** mỗi node -- spread ra nhiều node

JMeter master có thể gửi test plan cho slave, gom kết quả về.

### Câu 5: JMeter vs Gatling vs k6?

**Trả lời:**

- **JMeter**: GUI design, XML-based, Java, hệ sinh thái lâu
- **Gatling**: Scala/Java DSL, code-first, đẹp report HTML, tiết kiệm resource
- **k6**: JavaScript, modern, cloud-native, CLI-first

Chọn theo team: JMeter dễ học (GUI), Gatling/k6 cho code-as-config.
