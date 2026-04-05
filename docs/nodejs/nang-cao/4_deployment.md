---
sidebar_position: 4
title: "Deployment"
---

# Deployment

## Chuẩn bị Production

```js
// Kiểm tra NODE_ENV
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
  app.use(compression());
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
```

## Docker

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files first (tận dụng Docker cache)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
```

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## PM2 — Process Manager

```bash
npm install -g pm2

# Start app
pm2 start index.js --name my-app

# Cluster mode (tận dụng multi-core)
pm2 start index.js -i max

# Monitoring
pm2 monit

# Logs
pm2 logs my-app

# Auto-restart on file change (dev)
pm2 start index.js --watch
```

## Environment Variables trong Production

```bash
# Không dùng .env file trong production
# Set biến qua hosting platform hoặc CI/CD

# Heroku
heroku config:set DATABASE_URL=postgresql://...

# Docker
docker run -e DATABASE_URL=postgresql://... my-app

# Linux
export DATABASE_URL=postgresql://...
```

## Tóm tắt

- Docker cho reproducible deployments
- PM2 cluster mode tận dụng multi-core CPU
- Set env vars qua hosting platform, không dùng .env
- Graceful shutdown xử lý SIGTERM
