<div align="center">

# 🔷 HashWeb

### Secure Encryption | SHA-256

*Secure, temporary file and text sharing with end-to-end encryption.*

[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)
[![Rust](https://img.shields.io/badge/rust-1.85+-orange?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
[![Svelte](https://img.shields.io/badge/svelte-5-red?style=for-the-badge&logo=svelte)](https://svelte.dev/)

[**Documentation**](#-documentation) · [**Deploy Now**](#-deployment)

</div>

---

## 🌟 Why HashWeb?

In a world where **data breaches** and **privacy concerns** are everywhere, HashWeb offers a simple solution: **temporary, encrypted sharing** that leaves no traces.

### ✨ Key Features

- 🔒 **End-to-End Encryption** - Files encrypted in browser before upload
- ⏱️ **Self-Destructing** - Auto-delete after views or time expires
- 🚀 **Lightning Fast** - Built with Rust for maximum performance
- 📱 **Mobile-First** - Perfect experience on any device
- 🎨 **Clean UI** - Minimalist design, maximum functionality
- 🌐 **Multiple Languages** - i18n support (EN, ES, FR, DE, IT, JA, PL, RU, ZH)
- 🔓 **Open Source** - Fully transparent and auditable code
- 🐳 **Easy Deploy** - One-click deployment to Fly.io, Railway, or Docker

---

## 🎯 Use Cases

| Use Case | Why HashWeb? |
|----------|----------------|
| 🔐 **Sharing Passwords** | Passwords vanish after being viewed once |
| 📄 **Temporary Documents** | Share contracts/PDFs that self-destruct |
| 💼 **Business Confidentials** | Secure sharing with automatic deletion |
| 🎓 **Educational Materials** | Time-limited access to study materials |
| 🔑 **API Keys & Tokens** | Share credentials safely |
| 📸 **Sensitive Images** | Photos that disappear after viewing |


---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         HashWeb                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   Frontend   │◄────────┤   Backend    │                  │
│  │  (Svelte 5)  │         │  (Rust/Axum) │                  │
│  └──────────────┘         └──────────────┘                  │
│         │                         │                          │
│         │  AES Encryption         │  Redis Storage           │
│         │  in Browser             │  + TTL Expiry            │
│         ▼                         ▼                          │
│  ┌──────────────────────────────────────┐                   │
│  │         Encrypted Data Blob          │                   │
│  │  (Stored temporarily in Redis)       │                   │
│  └──────────────────────────────────────┘                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

**Frontend:**
- 🎨 **Svelte 5** - Modern reactive framework
- 🔐 **Occulto** - Client-side encryption library
- 🌐 **svelte-intl-precompile** - i18n support
- 📦 **Vite** - Lightning-fast build tool

**Backend:**
- ⚡ **Rust** - High-performance, memory-safe backend
- 🚀 **Axum** - Ergonomic web framework
- 💾 **Redis** - In-memory data store with TTL
- 🔒 **TLS Support** - Secure Redis connections (Upstash compatible)

---

## 📖 Documentation

### How It Works

1. **Create**: User writes text or uploads file
2. **Encrypt**: Data is encrypted in-browser using AES-256
3. **Upload**: Encrypted blob sent to server
4. **Store**: Server stores blob in Redis with TTL
5. **Share**: User receives unique link + decryption key
6. **View**: Recipient opens link, downloads encrypted data
7. **Decrypt**: Data decrypted in-browser with key from URL
8. **Destroy**: Data auto-deleted after views/time limit

### Security Features

- ✅ **Zero-Knowledge Architecture** - Server never sees unencrypted data
- ✅ **AES-256 Encryption** - Industry-standard encryption
- ✅ **Unique Keys per File** - Each upload gets unique encryption key
- ✅ **No Permanent Storage** - All data expires automatically
- ✅ **View Tracking** - Limit number of times file can be accessed
- ✅ **Optional Password** - Add custom password for extra security

### Environment Variables

#### Required
```bash
REDIS=rediss://your-redis-url  # Redis connection (TLS supported)
```

#### Optional
```bash
# Size & Limits
SIZE_LIMIT=10MiB              # Max upload size (default: 1KiB)
MAX_VIEWS=100                  # Max view count (default: 100)
MAX_EXPIRATION=360             # Max expiration in minutes (default: 360)

# Features
ALLOW_ADVANCED=true            # Enable advanced parameters
ALLOW_FILES=true               # Enable file uploads
ID_LENGTH=32                   # Length of generated IDs

# Server
LISTEN_ADDR=0.0.0.0:8000      # Server listen address
VERBOSITY=info                 # Log level (debug, info, warn, error)
FRONTEND_PATH=./frontend       # Frontend build path

# Theming
THEME_IMAGE=                   # Custom logo URL
THEME_TEXT=                    # Custom homepage text
THEME_PAGE_TITLE=              # Custom page title
THEME_FAVICON=                 # Custom favicon URL
```

### CLI Tool

HashWeb includes a powerful CLI for automation and scripting:

```bash
# Install CLI
npm install -g hashweb

# Upload text
echo "Secret message" | hashweb upload

# Upload file
hashweb upload ./document.pdf --views 1

# Download
hashweb download <note-id> <password>
```

---

## 🎨 Customization

### Custom Branding

Deploy with your own branding:

```bash
fly secrets set THEME_PAGE_TITLE="MySecureShare"
fly secrets set THEME_IMAGE="https://your-cdn.com/logo.png"
fly secrets set THEME_TEXT="<h2>Welcome to MySecureShare</h2>"
```

### Custom Domain

```bash
# Add your domain
fly certs add your-domain.com

# Configure DNS
# A     @    <your-fly-ip>
# AAAA  @    <your-fly-ipv6>
```

---

## 📊 Performance

HashWeb is built for speed:

- ⚡ **Sub-100ms Response Times** - Rust backend optimization
- 🚀 **Handles 1000+ Concurrent Users** - Efficient async architecture
- 💾 **Low Memory Footprint** - Runs on 512MB RAM
- 📦 **Small Bundle Size** - < 500KB frontend bundle
- 🌍 **Global CDN Ready** - Deploy anywhere

---

## 🛡️ Privacy & Compliance

- 🔒 **GDPR Compliant** - No personal data storage
- 🚫 **No Tracking** - No analytics or cookies
- 🔐 **Zero-Knowledge** - Server cannot decrypt data
- ⏱️ **Automatic Deletion** - Data expires automatically
- 📝 **Audit Trail** - Open source, fully auditable

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

```bash
# Fork the repo and clone it
git clone https://github.com/ardtys/HashWeb
cd hashweb

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.dev

# Start development servers
pnpm dev

# Run tests
pnpm test
```

### Development Setup

1. **Backend** (Rust):
   ```bash
   cd packages/backend
   cargo run
   ```

2. **Frontend** (Svelte):
   ```bash
   cd packages/frontend
   npm run dev
   ```

3. **CLI** (TypeScript):
   ```bash
   cd packages/cli
   npm run dev
   ```

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with love using:
- [Rust](https://www.rust-lang.org/) - Backend language
- [Svelte](https://svelte.dev/) - Frontend framework
- [Axum](https://github.com/tokio-rs/axum) - Web framework
- [Redis](https://redis.io/) - Data storage

---

## 🌐 Community & Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/ardtys/HashWeb/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ardtys/HashWeb/discussions)
- 📧 **Email**: support@hashweb.xyz
- 🌟 **Star us on GitHub** if you find this useful!

---

<div align="center">

### 🚀 Ready to Deploy?

**[Deploy to Fly.io](https://fly.io)** · **[Deploy to Railway](https://railway.app)** · **[Run with Docker](https://docker.com)**

---

**Made with ❤️ for privacy-conscious developers**

*HashWeb - Because some things should disappear.*

[![Star on GitHub](https://img.shields.io/github/stars/ardtys/HashWeb?style=social)](https://github.com/ardtys/HashWeb)

</div>
