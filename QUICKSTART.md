# HashWeb - Quick Start Guide 🚀

## Prerequisites

- Node.js >= 18
- Rust >= 1.85
- pnpm (package manager)

## 🎯 Quick Start (5 minutes)

### 1. Install Dependencies

```bash
# Install pnpm if not installed
npm install -g pnpm

# Install all dependencies
pnpm install
```

### 2. Setup Environment

```bash
# Copy environment file
cp .env.example .env.dev

# .env.dev is already configured with Upstash Redis!
cat .env.dev
```

### 3. Run Development Servers

#### Option A: Frontend Only (Recommended for UI development)

```bash
cd packages/frontend
pnpm dev
```

Frontend akan running di: **http://localhost:3002**

#### Option B: Full Stack (Frontend + Backend)

```bash
# Terminal 1 - Backend (Rust)
cd packages/backend
cargo run

# Terminal 2 - Frontend (Svelte)
cd packages/frontend
pnpm dev
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3002

## 🎨 Features Available

### ✅ Already Configured:
- ✅ Upstash Redis Database (TLS enabled)
- ✅ Blue Tech Theme dengan Sky Blue (#0EA5E9)
- ✅ HashWeb branding complete
- ✅ Favicon & icons implemented
- ✅ End-to-end encryption (AES-256-GCM)
- ✅ Self-destructing notes
- ✅ File upload support (up to 500MiB)

### 🔧 Environment Variables (.env.dev)

```bash
# Redis (Upstash with TLS)
REDIS=rediss://default:ARk...@innocent-lamprey-6412.upstash.io:6379

# Features
SIZE_LIMIT=500MiB          # Max upload size
ALLOW_ADVANCED=true        # Advanced parameters
ALLOW_FILES=true           # File upload
MAX_VIEWS=100             # Max view count
MAX_EXPIRATION=360        # Max expiration (minutes)

# Logging
VERBOSITY=debug           # Log level
```

## 📦 Browser Extension

### Install Extension (Chrome/Edge)

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `packages/extension` folder
5. Extension installed! 🎉

**Features:**
- 📸 Capture & share screenshots
- 📋 Share clipboard content
- 🖱️ Right-click to share text, images, links
- 🔵 Blue Tech Theme UI

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific tests
pnpm test:local
```

## 📊 Database Management

### Check Redis Connection

```bash
# Install redis-cli (Windows)
# Download from: https://github.com/microsoftarchive/redis/releases

# Test connection
redis-cli --tls -u rediss://default:ARk...@innocent-lamprey-6412.upstash.io:6379

# Basic commands
> PING
PONG

> DBSIZE
(integer) 0
```

### Monitor Redis (Upstash Console)

Visit: https://console.upstash.com
- View active keys
- Monitor memory usage
- Check request metrics

## 🏗️ Project Structure

```
hashweb/
├── packages/
│   ├── backend/          # Rust backend (Axum + Redis)
│   ├── frontend/         # Svelte 5 frontend
│   ├── cli/             # CLI tool (Node.js)
│   └── extension/       # Browser extension
├── design/              # Logos & assets
├── .env.dev            # Development config (✓ Configured)
├── REDIS_SETUP.md      # Redis documentation
└── QUICKSTART.md       # This file
```

## 🎨 UI Preview

### Frontend Features:
- ✅ Create encrypted notes
- ✅ Upload files (drag & drop)
- ✅ Set view limit (1-100 views)
- ✅ Set expiration time (1-360 minutes)
- ✅ QR code generation
- ✅ Password protection
- ✅ Dashboard for tracking notes

### Color Palette (Blue Tech Theme):
- Primary: #0EA5E9 (Sky Blue)
- Light: #38BDF8
- Dark: #0284C7
- Background: #0a0a0f
- Text: #94A3B8

## 🚀 Deployment

### Deploy to Fly.io

```bash
# Login to Fly.io
fly auth login

# Deploy
./deploy-flyio.sh

# Or manual
fly secrets set REDIS="rediss://default:ARk...@innocent-lamprey-6412.upstash.io:6379"
fly deploy
```

### Deploy to Railway

1. Connect GitHub repository
2. Add environment variables:
   ```
   REDIS=rediss://default:ARk...@innocent-lamprey-6412.upstash.io:6379
   SIZE_LIMIT=500MiB
   ```
3. Deploy!

## 🐛 Troubleshooting

### Frontend won't start
```bash
cd packages/frontend
rm -rf node_modules .svelte-kit
pnpm install
pnpm dev
```

### Backend won't compile
```bash
cd packages/backend
cargo clean
cargo build
```

### Redis connection failed
- Check internet connection
- Verify `.env.dev` has correct REDIS URL
- Ensure using `rediss://` (with 's' for TLS)

## 📚 Documentation

- [Redis Setup Guide](REDIS_SETUP.md) - Database configuration
- [Extension README](packages/extension/README.md) - Browser extension docs
- [CLI README](packages/cli/README.md) - Command-line tool docs
- [Frontend README](packages/frontend/README.md) - Frontend development

## ✨ What's Next?

1. ✅ Open http://localhost:3002
2. ✅ Create your first encrypted note
3. ✅ Test file upload (drag & drop)
4. ✅ Install browser extension
5. ✅ Try CLI tool: `npx hashweb`

## 🎯 Quick Commands

```bash
# Development
pnpm dev                    # Run all services
cd packages/frontend && pnpm dev  # Frontend only

# Build
pnpm build                  # Build all packages

# Test
pnpm test                   # Run tests

# Deploy
fly deploy                  # Deploy to Fly.io
```

## 🔐 Security

- ✅ End-to-end encryption (client-side)
- ✅ Zero-knowledge architecture
- ✅ TLS/SSL for all connections
- ✅ Automatic data expiration
- ✅ No permanent storage

---

**Made with ❤️ for HashWeb - Secure Encryption | SHA-256**

Need help? Check the documentation or visit GitHub Issues.
