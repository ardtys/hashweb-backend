# Changelog

All notable changes to the HashWeb Browser Extension will be documented in this file.

## [2.0.0] - 2026-01-04

### 🎉 Major Release - Production Ready

### ✨ Added
- **Proper End-to-End Encryption**: Implemented AES-GCM encryption using Web Crypto API
  - 256-bit encryption keys
  - Secure random IV generation
  - Encryption key embedded in URL fragment (never sent to server)

- **Enhanced File Handling**:
  - File size validation (500MB for local, 10MB for production)
  - Multiple file upload support
  - Drag-and-drop file upload
  - File size display in human-readable format
  - Individual file removal from upload queue

- **Improved User Experience**:
  - Real-time loading states with descriptive messages
  - Comprehensive error handling with user-friendly messages
  - Success notifications
  - Auto-copy link to clipboard
  - QR code generation for easy mobile sharing

- **Server Configuration**:
  - Production/Local server mode toggle
  - Server URL validation
  - Visual server status indicator
  - Persistent settings storage

- **Better Security**:
  - XSS prevention with HTML escaping
  - CORS support for cross-origin requests
  - Secure encryption key generation
  - No plaintext data sent to server

### 🔧 Improved
- **Error Messages**: More specific and actionable error messages
- **File Upload**: Better validation and error handling for large files
- **Screenshot Capture**: Enhanced error recovery and user feedback
- **Clipboard Integration**: Better permission handling
- **Context Menus**: More reliable right-click sharing

### 🐛 Fixed
- Icon loading issues (added placeholder icons)
- CORS errors when connecting to backend
- Base64 encoding issues replaced with proper encryption
- Port mismatch between manifest and backend
- Notification icon errors

### 📝 Changed
- Default server changed to production (`https://hashweb.xyz`)
- Version bumped to 2.0.0
- Improved manifest permissions structure
- Updated popup UI with better loading states

### 🗑️ Removed
- Simplified base64 encoding (replaced with AES-GCM)
- Removed hardcoded development server URLs

---

## [1.0.0] - Initial Release

### Added
- Basic text sharing
- File upload functionality
- Screenshot capture
- Context menu integration
- Right-click sharing
- Extension popup interface
