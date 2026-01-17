# HashWeb Extension - Deployment Guide

This guide will help you deploy the HashWeb browser extension for production use.

## 📋 Prerequisites

- Chrome/Edge/Brave browser (for Chromium-based browsers)
- Firefox browser (for Firefox deployment)
- Basic understanding of browser extensions

---

## 🚀 Quick Deployment

### For Testing (Local Development)

1. **Open Extension Manager**:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`

2. **Enable Developer Mode**:
   - Toggle "Developer mode" in the top-right corner

3. **Load Unpacked Extension**:
   - Click "Load unpacked"
   - Navigate to: `packages/extension`
   - Click "Select Folder"

4. **Configure for Local Server** (Optional):
   - Click extension icon
   - Open Settings
   - Change server URL to `http://localhost:3000`
   - Click "Save"

---

## 📦 Production Deployment

### Chrome Web Store

#### Step 1: Prepare Extension Package

```bash
cd packages/extension

# Create production ZIP (exclude development files)
zip -r extension-chrome-v2.0.0.zip \
  manifest.json \
  background.js \
  content.js \
  popup.html \
  popup.css \
  popup.js \
  crypto.js \
  icons/ \
  -x "*.md" "popup-old.js"
```

#### Step 2: Chrome Web Store Submission

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay one-time $5 developer fee (if not already paid)
3. Click "New Item"
4. Upload `extension-chrome-v2.0.0.zip`
5. Fill in store listing:
   - **Name**: HashWeb - Secure File Sharing
   - **Description**: (See below)
   - **Category**: Productivity
   - **Screenshots**: Add 1-5 screenshots
   - **Promotional Images**: Add required images
6. Submit for review
7. Wait for approval (usually 1-3 days)

#### Store Description Template:

```
🔷 Secure, ephemeral file and text sharing with end-to-end encryption.

KEY FEATURES:
✅ End-to-End AES-256 Encryption
✅ Self-Destructing Links (burn after read)
✅ Right-Click to Share Selected Text
✅ Instant Screenshot Capture & Share
✅ Drag & Drop File Upload
✅ QR Code Generation for Mobile
✅ No Account Required
✅ Zero-Knowledge Architecture

SECURITY:
• All data encrypted client-side before upload
• Encryption keys never sent to server
• Auto-delete after views or time limit
• No tracking, no cookies, no analytics

USAGE:
1. Select text → Right-click → "Share with HashWeb"
2. Click extension icon → Upload files or paste text
3. Share generated link (auto-copied to clipboard)
4. Link self-destructs after reading

Perfect for sharing:
• Passwords and sensitive credentials
• Confidential documents
• Private notes and messages
• Quick file transfers
• Screenshots for bug reports

PRIVACY-FIRST:
Your data is encrypted before leaving your browser. The server never sees your unencrypted data.
```

---

### Firefox Add-ons

#### Step 1: Prepare Firefox Package

```bash
cd packages/extension

# Create Firefox-specific ZIP
zip -r extension-firefox-v2.0.0.zip \
  manifest.json \
  background.js \
  content.js \
  popup.html \
  popup.css \
  popup.js \
  crypto.js \
  icons/ \
  -x "*.md" "popup-old.js"
```

#### Step 2: Firefox Add-ons Submission

1. Go to [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)
2. Sign in with Firefox Account
3. Click "Submit a New Add-on"
4. Upload `extension-firefox-v2.0.0.zip`
5. Fill in listing information
6. Submit for review
7. Wait for approval (usually 1-7 days)

---

## 🔧 Configuration

### Environment-Specific Settings

#### Production (default):
- Server URL: `https://hashweb.xyz`
- File size limit: 10MB
- No special configuration needed

#### Self-Hosted:
1. Deploy backend to your server
2. Configure extension:
   - Settings → Server URL → `https://your-domain.com`
   - Save settings
3. Ensure backend has CORS enabled

---

## 🧪 Testing Before Deployment

### Manual Testing Checklist

- [ ] **Text Sharing**:
  - [ ] Upload plain text
  - [ ] Link is generated and copied
  - [ ] Link opens correctly
  - [ ] Content is encrypted
  - [ ] Self-destructs after view

- [ ] **File Upload**:
  - [ ] Single file upload
  - [ ] Multiple files upload
  - [ ] Drag and drop works
  - [ ] File size validation
  - [ ] Encrypted files downloadable

- [ ] **Screenshot**:
  - [ ] Capture screenshot button works
  - [ ] Screenshot is uploaded
  - [ ] Screenshot opens correctly

- [ ] **Context Menu**:
  - [ ] Share selected text
  - [ ] Share image
  - [ ] Share link
  - [ ] Capture screenshot

- [ ] **Settings**:
  - [ ] Change server URL
  - [ ] Settings persist after reload
  - [ ] Invalid URL shows error

- [ ] **Error Handling**:
  - [ ] Network error shows message
  - [ ] File too large shows message
  - [ ] Invalid input shows message

---

## 📊 Version Management

### Version Numbering

Follow Semantic Versioning (SemVer):
- **MAJOR**: Incompatible API changes (e.g., 2.0.0 → 3.0.0)
- **MINOR**: New features, backward-compatible (e.g., 2.0.0 → 2.1.0)
- **PATCH**: Bug fixes, backward-compatible (e.g., 2.0.0 → 2.0.1)

### Releasing New Version

1. Update `manifest.json` version
2. Update `CHANGELOG.md`
3. Create new ZIP package
4. Upload to Chrome Web Store / Firefox Add-ons
5. Tag release in git: `git tag v2.0.0`

---

## 🔒 Security Considerations

### Pre-Deployment Checklist

- [ ] All console.logs removed or disabled in production
- [ ] Error messages don't expose sensitive information
- [ ] HTTPS enforced for production server
- [ ] Content Security Policy properly configured
- [ ] No hardcoded credentials or API keys
- [ ] Permissions minimized to necessary ones only

### Recommended CSP Headers (Backend):

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://hashweb.xyz;
```

---

## 📱 Post-Deployment

### Monitoring

- Monitor Chrome Web Store reviews
- Track error reports from users
- Monitor server logs for unusual activity
- Check analytics for usage patterns

### Support

- Respond to user reviews
- Fix reported bugs promptly
- Update extension for browser changes
- Maintain compatibility with backend API

---

## 🆘 Troubleshooting

### Common Issues

**Extension not loading:**
- Check manifest.json syntax
- Verify all referenced files exist
- Check browser console for errors

**CORS errors:**
- Ensure backend has CORS enabled
- Check `host_permissions` in manifest.json
- Verify server URL is correct

**Upload failures:**
- Check file size limits
- Verify network connectivity
- Ensure backend is running
- Check browser console for errors

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ardtys/HashWeb/issues)
- **Documentation**: [Main README](./README.md)
- **Website**: [hashweb.xyz](https://hashweb.xyz)

---

**Last Updated**: January 4, 2026
**Version**: 2.0.0
