---
sidebar_position: 5
title: "5. Performance Optimization"
---

# Performance Optimization

Tối ưu hiệu năng giúp ứng dụng Node.js phản hồi nhanh hơn và phục vụ được nhiều người dùng hơn. Bài này giới thiệu các kỹ thuật như nén response, chạy đa tiến trình (clustering), caching, streaming dữ liệu lớn và giám sát hệ thống. Hiểu các cách này giúp bạn tránh nghẽn và tận dụng tối đa tài nguyên server.

---

## Mục lục

- [Compression](#compression)
- [Clustering](#clustering)
- [Caching Strategies](#caching-strategies)
- [Streaming cho large data](#streaming-cho-large-data)
- [Monitoring](#monitoring)
- [Checklist Performance](#checklist-performance)
- [Tóm tắt](#tóm-tắt)

---

## Compression

```bash
npm install compression
```

```js
const compression = require('compression');
app.use(compression()); // Gzip response
```

## Clustering

Tận dụng tất cả CPU cores:

```js
const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Primary ${process.pid} starting ${numCPUs} workers`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const app = require('./app');
  app.listen(3000, () => {
    console.log(`Worker ${process.pid} started`);
  });
}
```

## Caching Strategies

```js
// In-memory cache đơn giản
const cache = new Map();

function cacheMiddleware(ttl) {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return res.json(cached.data);
    }

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      cache.set(key, { data, timestamp: Date.now() });
      return originalJson(data);
    };

    next();
  };
}
```

## Streaming cho large data

```js
const fs = require('fs');

// BAD: Đọc toàn bộ file vào memory
app.get('/download', (req, res) => {
  const data = fs.readFileSync('large-file.csv');
  res.send(data); // Tốn RAM!
});

// GOOD: Stream file
app.get('/download', (req, res) => {
  const stream = fs.createReadStream('large-file.csv');
  res.setHeader('Content-Type', 'text/csv');
  stream.pipe(res); // Stream trực tiếp, không tốn RAM
});
```

## Monitoring

```bash
# Built-in profiler
node --prof app.js

# Memory usage
process.memoryUsage();

# Event loop lag
const start = Date.now();
setImmediate(() => {
  const lag = Date.now() - start;
  console.log(`Event loop lag: ${lag}ms`);
});
```

## Checklist Performance

- [ ] Compression enabled
- [ ] Cluster mode hoặc PM2 cluster
- [ ] Database queries optimized (indexes, N+1)
- [ ] Caching cho heavy queries
- [ ] Stream cho large files
- [ ] Connection pooling
- [ ] Avoid synchronous operations

## Tóm tắt

- Compression giảm bandwidth
- Clustering tận dụng multi-core
- Cache responses để giảm database load
- Stream cho large data thay vì load vào memory
- Monitor event loop lag và memory usage
