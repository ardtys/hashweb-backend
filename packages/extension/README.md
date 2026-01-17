# 🔷 HashWeb Browser Extension

**Version 2.0.0** - Production Ready

Secure file and text sharing with end-to-end encryption using SHA-256 directly from your browser.

## ✨ Features

- **🔐 End-to-End AES-256-GCM Encryption**: Military-grade encryption happens in your browser
- **🖱️ Right-Click Sharing**: Share selected text, images, and links with a simple right-click
- **📸 Screenshot Capture**: Instantly capture and share screenshots
- **📋 Clipboard Integration**: Share clipboard content with one click
- **🎯 Drag & Drop**: Drag files directly into the extension popup
- **💣 Self-Destructing Links**: Files auto-delete after views or time limit
- **📱 QR Code Generation**: Easy mobile sharing with QR codes
- **⚙️ Customizable Server**: Use production or your own HashWeb instance
- **📦 Multiple File Upload**: Upload multiple files at once with size validation
- **⚡ Smart Error Handling**: User-friendly error messages and recovery

## Installation

### Chrome/Edge

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `packages/extension` folder
6. The extension is now installed!

### Firefox

1. Download or clone this repository
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from `packages/extension`
5. The extension is now installed!

## Usage

### Quick Share

1. **Text**: Select text on any webpage → Right-click → "Share with HashWeb"
2. **Images**: Right-click on any image → "Share image with HashWeb"
3. **Screenshots**: Right-click → "Capture & Share Screenshot"
4. **Clipboard**: Click extension icon → "Share Clipboard"

### Manual Upload

1. Click the extension icon in your browser toolbar
2. Type or paste text, or drag & drop files
3. Choose expiry options (views or time)
4. Click "Create Secure Link"
5. Link is automatically copied to clipboard!

### Settings

- Click extension icon
- Expand "Settings" section
- Enter your custom server URL (optional)
- Click "Save"

## Server Options

### Default Server
The extension uses `https://hashweb.xyz` by default.

### Self-Hosted
You can point the extension to your own HashWeb instance:
1. Deploy HashWeb using Docker, Fly.io, or Railway
2. In extension settings, enter your server URL
3. All data will now go to your server

## 🔒 Security

- **Zero-Knowledge Architecture**: The server never sees your unencrypted data
- **AES-256-GCM Encryption**: Industry-standard encryption using Web Crypto API
- **Secure Key Management**: Encryption keys stored in URL fragment (never sent to server)
- **Random IV Generation**: Each encryption uses a cryptographically secure random IV
- **No Tracking**: No analytics, no cookies, no user profiling
- **Auto-Delete**: Data is automatically destroyed after viewing or time limit
- **XSS Protection**: Input sanitization and HTML escaping

## Development

### Prerequisites
- Node.js 18+
- Chrome or Firefox

### Build from Source

```bash
cd packages/extension
npm install
npm run build
```

### Load in Browser
Follow the installation instructions above, but select the `dist` folder instead.

## 🗺️ Roadmap

### ✅ Completed (v2.0.0)
- [x] Basic text sharing
- [x] File upload support with validation
- [x] Screenshot capture
- [x] Context menu integration
- [x] Proper AES-GCM encryption
- [x] QR code generation
- [x] Multiple file uploads
- [x] Server configuration (production/local)
- [x] Comprehensive error handling

### 🚧 Planned
- [ ] QR code scanning for receiving files
- [ ] Password protection for links
- [ ] Safari support
- [ ] Mobile extension (Firefox Android)
- [ ] File preview before upload
- [ ] Custom expiry times
- [ ] Share history (local only)

## 📋 Permissions

The extension requests these permissions:
- **contextMenus**: Add right-click menu options
- **activeTab**: Capture screenshots and selected text
- **storage**: Save settings (server URL, preferences)
- **notifications**: Show upload success/failure notifications
- **host_permissions**: Connect to HashWeb servers (production and localhost)

## 📚 Documentation

- **[CHANGELOG.md](./CHANGELOG.md)**: Detailed release notes and version history
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Complete guide for deploying to Chrome Web Store and Firefox Add-ons
- **Testing Checklist**: See DEPLOYMENT.md for comprehensive testing procedures
- **Security Considerations**: Pre-deployment security checklist in DEPLOYMENT.md

## 💬 Support

- [GitHub Issues](https://github.com/ardtys/HashWeb/issues)
- [Website](https://hashweb.xyz)
- [Documentation](https://github.com/ardtys/HashWeb)

## License

MIT License - See main project for details.

---

**Made with ❤️ for privacy-conscious users**

*HashWeb - Because some things should disappear.*
