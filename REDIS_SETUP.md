# HashWeb - Redis Setup Guide

## Upstash Redis Configuration

HashWeb menggunakan **Upstash Redis** sebagai database untuk menyimpan encrypted notes dengan TTL (Time To Live).

### 📋 Database Info

- **Provider**: Upstash Redis
- **Host**: `innocent-lamprey-6412.upstash.io`
- **Port**: `6379`
- **TLS**: Enabled (rediss://)
- **Region**: Auto-selected optimal region

### 🔐 Connection String

```bash
rediss://default:ARkMAAImcDI1NmM2OTI5NDcwMjc0NWUyYmJiYWFhZjY1YTI1YTg3OXAyNjQxMg@innocent-lamprey-6412.upstash.io:6379
```

## 🚀 Setup untuk Development

### 1. Update `.env.dev`

```bash
# Redis Configuration
REDIS=rediss://default:ARkMAAImcDI1NmM2OTI5NDcwMjc0NWUyYmJiYWFhZjY1YTI1YTg3OXAyNjQxMg@innocent-lamprey-6412.upstash.io:6379

# Application Settings
SIZE_LIMIT=500MiB
VERBOSITY=debug
ALLOW_ADVANCED=true
ALLOW_FILES=true
MAX_VIEWS=100
MAX_EXPIRATION=360
```

### 2. Test Koneksi dengan Redis CLI

```bash
# Install redis-cli (jika belum ada)
# Windows: https://github.com/microsoftarchive/redis/releases
# Mac: brew install redis
# Linux: sudo apt-get install redis-tools

# Test koneksi dengan TLS
redis-cli --tls -u rediss://default:ARkMAAImcDI1NmM2OTI5NDcwMjc0NWUyYmJiYWFhZjY1YTI1YTg3OXAyNjQxMg@innocent-lamprey-6412.upstash.io:6379

# Test basic commands
> PING
PONG

> SET test "Hello HashWeb"
OK

> GET test
"Hello HashWeb"

> TTL test
(integer) -1

> EXPIRE test 60
(integer) 1

> TTL test
(integer) 59
```

### 3. Test dengan Backend Rust

```bash
cd packages/backend

# Set environment variable
export REDIS=rediss://default:ARkMAAImcDI1NmM2OTI5NDcwMjc0NWUyYmJiYWFhZjY1YTI1YTg3OXAyNjQxMg@innocent-lamprey-6412.upstash.io:6379

# Run backend
cargo run
```

## 🔧 Backend Configuration (Rust)

Backend HashWeb sudah dikonfigurasi untuk mendukung Redis dengan TLS. File konfigurasi ada di `packages/backend/src/store.rs`.

### Features:
- ✅ TLS/SSL Support (rediss://)
- ✅ Connection pooling
- ✅ Automatic TTL management
- ✅ Encrypted data storage
- ✅ Auto-cleanup expired data

## 📊 Monitoring

### Upstash Dashboard
- Login ke: https://console.upstash.com
- Lihat metrics: Memory usage, Request count, Latency
- Monitor active keys

### Redis Commands untuk Monitoring

```bash
# Cek jumlah keys
> DBSIZE

# Lihat info server
> INFO

# Lihat memory usage
> MEMORY STATS

# List semua keys (HATI-HATI di production!)
> KEYS *

# Monitor real-time commands
> MONITOR
```

## 🔒 Security Best Practices

1. **Jangan commit credentials** ke Git
   - `.env.dev` sudah di `.gitignore`
   - Gunakan environment variables di production

2. **Rotate password** secara berkala
   - Update di Upstash Console
   - Update di semua deployment configs

3. **Gunakan TLS** (rediss://)
   - Semua koneksi terenkripsi
   - Data aman saat transit

4. **Set proper TTL**
   - Notes otomatis expire
   - Tidak ada data yang tertinggal

## 🚀 Deployment

### Fly.io

```bash
# Set secret
fly secrets set REDIS="rediss://default:ARkMAAImcDI1NmM2OTI5NDcwMjc0NWUyYmJiYWFhZjY1YTI1YTg3OXAyNjQxMg@innocent-lamprey-6412.upstash.io:6379" --app hashweb

# Deploy
fly deploy
```

### Railway

```bash
# Add environment variable di Railway Dashboard
REDIS=rediss://default:ARkMAAImcDI1NmM2OTI5NDcwMjc0NWUyYmJiYWFhZjY1YTI1YTg3OXAyNjQxMg@innocent-lamprey-6412.upstash.io:6379
```

### Docker

```bash
# Run with environment variable
docker run -e REDIS="rediss://default:ARkMAAImcDI1NmM2OTI5NDcwMjc0NWUyYmJiYWFhZjY1YTI1YTg3OXAyNjQxMg@innocent-lamprey-6412.upstash.io:6379" hashweb
```

## 🐛 Troubleshooting

### Error: Connection refused
- Cek internet connection
- Verify credentials di Upstash Console
- Pastikan menggunakan `rediss://` (dengan s)

### Error: TLS handshake failed
- Pastikan redis-cli support TLS
- Gunakan flag `--tls`
- Cek firewall settings

### Error: AUTH failed
- Verify password benar
- Check di Upstash Console
- Pastikan tidak ada karakter extra di URL

## 📚 Resources

- [Upstash Documentation](https://docs.upstash.com/redis)
- [Redis Commands Reference](https://redis.io/commands)
- [HashWeb Backend Code](packages/backend/src/store.rs)

---

**Made with ❤️ for HashWeb**
