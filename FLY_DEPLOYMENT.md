# HashWeb - Fly.io Deployment Guide 🚀

## Prerequisites

- Fly.io account (gratis untuk testing)
- `flyctl` CLI installed
- Redis Upstash account (gratis tier available)

## 📦 Step 1: Install Fly.io CLI

### Windows
```powershell
# Using PowerShell
iwr https://fly.io/install.ps1 -useb | iex
```

### macOS/Linux
```bash
curl -L https://fly.io/install.sh | sh
```

### Verify Installation
```bash
flyctl version
# Atau
fly version
```

## 🔐 Step 2: Login to Fly.io

```bash
fly auth login
```

Browser akan terbuka untuk login. Setelah login, kembali ke terminal.

## 🗄️ Step 3: Setup Redis (Upstash)

**Kita sudah punya Redis Upstash yang configured!**

Database Info:
- Host: `innocent-lamprey-6412.upstash.io`
- Port: `6379`
- TLS: Enabled

**Tidak perlu create Redis baru di Fly.io** karena kita pakai Upstash Redis yang lebih murah dan reliable!

### Alternative: Fly.io Redis (Optional)

Jika ingin pakai Fly.io Redis (lebih mahal):

```bash
# Create Redis on Fly.io
fly redis create

# Pilih:
# - Name: hashweb-redis
# - Region: Singapore (sin) atau terdekat
# - Plan: Free (256MB)
```

## 🚀 Step 4: Initialize Fly.io App

```bash
# Di root folder hashweb
fly launch --no-deploy

# Pilih:
# - App name: hashweb (atau nama lain)
# - Region: Singapore (sin) atau terdekat
# - Overwrite existing fly.toml? Yes
```

## ⚙️ Step 5: Configure Secrets

### Set Redis URL (PENTING!)

```bash
# Gunakan Redis Upstash yang sudah ada
fly secrets set REDIS="rediss://default:ARkMAAImcDI1NmM2OTI5NDcwMjc0NWUyYmJiYWFhZjY1YTI1YTg3OXAyNjQxMg@innocent-lamprey-6412.upstash.io:6379"

# Set additional secrets (optional)
fly secrets set SIZE_LIMIT="500MiB"
fly secrets set VERBOSITY="info"
fly secrets set ALLOW_ADVANCED="true"
fly secrets set ALLOW_FILES="true"
fly secrets set MAX_VIEWS="100"
fly secrets set MAX_EXPIRATION="360"
```

### Verify Secrets

```bash
fly secrets list

# Output:
# NAME              DIGEST
# REDIS             abc123...
# SIZE_LIMIT        def456...
```

## 📝 Step 6: Update fly.toml

File `fly.toml` sudah dikonfigurasi. Verify:

```bash
cat fly.toml
```

Should contain:

```toml
app = 'hashweb-backend'
primary_region = 'sin'

[build]

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0
  processes = ['app']

[[vm]]
  memory = '1gb'
  cpu_kind = 'shared'
  cpus = 1
  memory_mb = 1024
```

**Update app name jika berbeda:**

```bash
# Edit fly.toml
nano fly.toml

# Change:
app = 'hashweb'  # atau nama app Anda
```

## 🏗️ Step 7: Build & Deploy

### Option A: Auto Script (Recommended)

```bash
# Linux/Mac
./deploy-flyio.sh

# Windows
deploy-flyio.bat
```

### Option B: Manual Deploy

```bash
# Deploy to Fly.io
fly deploy

# Wait for build...
# ✓ Building image done
# ✓ Pushing image done
# ✓ Deploying done
```

## ✅ Step 8: Verify Deployment

### Check Status

```bash
fly status

# Output:
# Name     = hashweb
# Status   = running
# Version  = v1
```

### Open App

```bash
fly open
```

Browser akan membuka app di: `https://hashweb.fly.dev`

### Check Logs

```bash
# Real-time logs
fly logs

# Filter errors only
fly logs --severity error
```

## 🔍 Step 9: Test Redis Connection

### SSH into Machine

```bash
fly ssh console

# Inside machine, test Redis
curl localhost:8000/api/status

# Should return:
# {"status":"ok","redis":"connected"}
```

### Create Test Note

```bash
# Via web
# 1. Open https://hashweb.fly.dev
# 2. Create note
# 3. Check logs: fly logs

# Via CLI
npx hashweb send text "Hello Fly.io" --server https://hashweb.fly.dev
```

### Check Upstash Console

1. Login: https://console.upstash.com
2. Select: `innocent-lamprey-6412`
3. Check:
   - Active keys increasing
   - Request metrics
   - Memory usage

## 🔧 Configuration Options

### Scale Resources

```bash
# Scale memory
fly scale memory 2048

# Scale to multiple machines
fly scale count 2

# Scale to different regions
fly regions add sin nrt syd
```

### Custom Domain

```bash
# Add custom domain
fly certs add hashweb.xyz

# Configure DNS:
# A    @    <fly-ip>
# AAAA @    <fly-ipv6>

# Get IPs
fly ips list
```

### Environment Variables

```bash
# Set any env var
fly secrets set MY_SECRET="value"

# Remove secret
fly secrets unset MY_SECRET
```

## 📊 Monitoring

### Metrics Dashboard

```bash
# Open dashboard
fly dashboard

# Or visit: https://fly.io/apps/hashweb
```

### Check Health

```bash
# Health check endpoint
curl https://hashweb.fly.dev/api/health

# Response:
# {
#   "status": "healthy",
#   "redis": "connected",
#   "uptime": 3600
# }
```

### Logs

```bash
# Real-time
fly logs

# Last 100 lines
fly logs -n 100

# Follow
fly logs -f

# Specific instance
fly logs -i <instance-id>
```

## 🐛 Troubleshooting

### Error: App not starting

```bash
# Check logs
fly logs

# Common issues:
# 1. Redis URL wrong → fly secrets set REDIS="..."
# 2. Build failed → fly deploy --verbose
# 3. Memory limit → fly scale memory 2048
```

### Error: Connection to Redis failed

```bash
# Verify Redis URL
fly secrets list

# Test locally first
redis-cli --tls -u rediss://default:ARk...@innocent-lamprey-6412.upstash.io:6379

# Update secret
fly secrets set REDIS="rediss://..."
```

### Error: 502 Bad Gateway

```bash
# Check if app is running
fly status

# Restart app
fly apps restart hashweb

# Check health endpoint
curl https://hashweb.fly.dev/api/health
```

### Error: Build failed

```bash
# Clean build
fly deploy --no-cache

# Check Dockerfile
cat Dockerfile

# Verify Rust version
rustc --version
```

## 💰 Cost Estimation

### Free Tier Includes:
- ✅ 3 shared-cpu-1x machines (256MB RAM)
- ✅ 160GB outbound data transfer
- ✅ SSL certificates

### Upstash Redis Free Tier:
- ✅ 10,000 commands/day
- ✅ 256MB storage
- ✅ Global replication

### Estimated Monthly Cost:
- **Development**: $0 (within free tier)
- **Light Production**: ~$5/month
- **Production**: ~$20-50/month (with scaling)

## 🔄 Update & Redeploy

```bash
# Make changes to code
# ...

# Redeploy
fly deploy

# Or with script
./deploy-flyio.sh
```

## 📋 Useful Commands

```bash
# SSH into machine
fly ssh console

# Run command in machine
fly ssh console -C "ls -la"

# Download logs
fly logs > logs.txt

# Destroy app (CAREFUL!)
fly apps destroy hashweb

# List all apps
fly apps list

# Switch app context
fly app list
```

## 🚀 Production Checklist

Before going to production:

- [ ] Custom domain configured
- [ ] SSL certificate verified
- [ ] Redis backups enabled (Upstash)
- [ ] Monitoring alerts setup
- [ ] Health checks working
- [ ] Logs retention configured
- [ ] Secrets properly set
- [ ] Auto-scaling configured
- [ ] Multiple regions (optional)
- [ ] Load testing completed

## 📚 Resources

- [Fly.io Documentation](https://fly.io/docs/)
- [Fly.io Pricing](https://fly.io/docs/about/pricing/)
- [Upstash Redis](https://upstash.com/)
- [HashWeb GitHub](https://github.com/ardtys/HashWeb)

## 🎯 Quick Deploy Script

Create `.github/workflows/deploy.yml` for auto-deploy:

```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Get token: `fly auth token`

---

## ✨ Success!

Your HashWeb is now deployed at:
🌐 **https://hashweb.fly.dev**

Features enabled:
- ✅ Redis Upstash (TLS)
- ✅ Auto-scaling
- ✅ SSL certificate
- ✅ Global CDN
- ✅ Zero-downtime deploys

**Made with ❤️ for HashWeb - Secure Encryption | SHA-256**
