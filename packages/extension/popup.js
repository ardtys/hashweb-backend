// Popup JavaScript for HashWeb Extension - Production Ready Version

// Configuration
const DEFAULT_SERVERS = {
  production: 'https://hashweb.xyz',
  local: 'http://localhost:3002',
};

let serverUrl = DEFAULT_SERVERS.local; // Default to local for development
let selectedFiles = [];
let isUploading = false;

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    // Load server URL from storage
    const result = await chrome.storage.sync.get(['serverUrl', 'serverMode']);
    if (result.serverUrl) {
      serverUrl = result.serverUrl;
    } else if (result.serverMode) {
      serverUrl = DEFAULT_SERVERS[result.serverMode] || DEFAULT_SERVERS.production;
    }

    document.getElementById('server-url').value = serverUrl;

    // Setup event listeners
    setupEventListeners();

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener(handleMessage);

    // Check for pending data
    await checkPendingData();

    // Show which server we're connected to
    updateServerStatus();
  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to initialize extension. Please try reloading.');
  }
}

function setupEventListeners() {
  // Quick actions
  document.getElementById('capture-screenshot')?.addEventListener('click', captureScreenshot);
  document.getElementById('share-clipboard')?.addEventListener('click', shareClipboard);

  // Text input
  const textInput = document.getElementById('text-input');
  textInput?.addEventListener('input', updateShareButton);

  // File upload
  const fileInput = document.getElementById('file-input');
  fileInput?.addEventListener('change', handleFileSelect);

  // Drag and drop
  const fileLabel = document.querySelector('.file-label');
  if (fileLabel) {
    fileLabel.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      fileLabel.style.borderColor = '#8b5cf6';
      fileLabel.style.backgroundColor = '#8b5cf610';
    });

    fileLabel.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      fileLabel.style.borderColor = '';
      fileLabel.style.backgroundColor = '';
    });

    fileLabel.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      fileLabel.style.borderColor = '';
      fileLabel.style.backgroundColor = '';

      const files = Array.from(e.dataTransfer.files);
      addFiles(files);
    });
  }

  // Share button
  document.getElementById('share-btn')?.addEventListener('click', handleShare);

  // Copy button
  document.getElementById('copy-btn')?.addEventListener('click', copyToClipboard);

  // New share button
  document.getElementById('new-share-btn')?.addEventListener('click', resetForm);

  // Settings
  document.getElementById('save-settings')?.addEventListener('click', saveSettings);

  // Server mode toggle (if implemented)
  document.querySelectorAll('input[name="server-mode"]').forEach((radio) => {
    radio.addEventListener('change', handleServerModeChange);
  });

  // Expiry options
  document.querySelectorAll('input[name="expiry"]').forEach((radio) => {
    radio.addEventListener('change', updateShareButton);
  });

  document.getElementById('views-count')?.addEventListener('input', updateShareButton);
  document.getElementById('time-minutes')?.addEventListener('input', updateShareButton);
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  addFiles(files);
}

function addFiles(files) {
  if (files.length === 0) return;

  // Validate file sizes (max 500MB total for local, 10MB for production)
  const maxSize = serverUrl.includes('localhost') ? 500 * 1024 * 1024 : 10 * 1024 * 1024;
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (totalSize > maxSize) {
    showError(`Total file size exceeds limit (${formatBytes(maxSize)})`);
    return;
  }

  selectedFiles = [...selectedFiles, ...files];
  renderFileList();
  updateShareButton();
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  renderFileList();
  updateShareButton();
}

function renderFileList() {
  const fileList = document.getElementById('file-list');
  if (!fileList) return;

  if (selectedFiles.length === 0) {
    fileList.innerHTML = '';
    const labelText = document.getElementById('file-label-text');
    if (labelText) labelText.textContent = 'Choose files or drop here';
    return;
  }

  const labelText = document.getElementById('file-label-text');
  if (labelText) {
    const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);
    labelText.textContent = `${selectedFiles.length} file(s) selected (${formatBytes(totalSize)})`;
  }

  fileList.innerHTML = selectedFiles
    .map(
      (file, index) => `
        <div class="file-item">
          <span class="file-name" title="${escapeHtml(file.name)}">
            ${escapeHtml(truncate(file.name, 30))}
            <small>(${formatBytes(file.size)})</small>
          </span>
          <button class="remove-file" onclick="window.removeFile(${index})" aria-label="Remove file">×</button>
        </div>
      `
    )
    .join('');
}

// Expose removeFile to global scope for onclick
window.removeFile = removeFile;

function updateShareButton() {
  const textInput = document.getElementById('text-input');
  const shareBtn = document.getElementById('share-btn');
  if (!shareBtn) return;

  const hasText = textInput?.value.trim().length > 0;
  const hasFiles = selectedFiles.length > 0;

  shareBtn.disabled = isUploading || (!hasText && !hasFiles);
}

async function captureScreenshot() {
  try {
    setLoadingState('Capturing screenshot...');

    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const file = new File([blob], `screenshot-${timestamp}.png`, { type: 'image/png' });

    selectedFiles = [file];
    renderFileList();
    updateShareButton();

    clearLoadingState();
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    showError('Failed to capture screenshot. Please grant permission and try again.');
    clearLoadingState();
  }
}

async function shareClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      const textInput = document.getElementById('text-input');
      if (textInput) {
        textInput.value = text;
        updateShareButton();
      }
    } else {
      showError('Clipboard is empty');
    }
  } catch (error) {
    console.error('Clipboard read failed:', error);
    showError('Failed to read clipboard. Please grant permission or paste manually.');
  }
}

async function handleShare() {
  if (isUploading) return;

  const textInput = document.getElementById('text-input');
  const text = textInput?.value.trim();
  const expiryType = document.querySelector('input[name="expiry"]:checked')?.value;
  const viewsCount = parseInt(document.getElementById('views-count')?.value || '1');
  const timeMinutes = parseInt(document.getElementById('time-minutes')?.value || '60');

  // Validate input
  if (!text && selectedFiles.length === 0) {
    showError('Please enter text or select files to share');
    return;
  }

  if (expiryType === 'views' && (viewsCount < 1 || viewsCount > 100)) {
    showError('Views must be between 1 and 100');
    return;
  }

  if (expiryType === 'time' && (timeMinutes < 1 || timeMinutes > 360)) {
    showError('Time must be between 1 and 360 minutes');
    return;
  }

  setLoadingState('Encrypting and uploading...');

  try {
    let noteData;

    if (selectedFiles.length > 0) {
      noteData = await uploadFiles(selectedFiles, expiryType, viewsCount, timeMinutes);
    } else if (text) {
      noteData = await uploadText(text, expiryType, viewsCount, timeMinutes);
    }

    showResult(noteData.url);

    // Notify background script
    chrome.runtime.sendMessage({
      action: 'upload-success',
      url: noteData.url
    });
  } catch (error) {
    console.error('Upload failed:', error);
    let errorMessage = 'Upload failed. ';

    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      errorMessage += 'Cannot connect to server. Please check your internet connection and server URL.';
    } else if (error.message.includes('413') || error.message.includes('too large')) {
      errorMessage += 'File size too large. Please reduce file size and try again.';
    } else {
      errorMessage += error.message || 'Please try again.';
    }

    showError(errorMessage);

    chrome.runtime.sendMessage({
      action: 'upload-error',
      error: errorMessage
    });
  } finally {
    clearLoadingState();
  }
}

async function uploadText(text, expiryType, viewsCount, timeMinutes) {
  // Generate encryption key
  const key = await CryptoUtils.generateKey();

  // Encrypt text
  const encryptedContents = await CryptoUtils.encryptText(text, key);

  // Prepare note data
  const data = {
    contents: encryptedContents,
    meta: JSON.stringify({ type: 'text' }),
    ...(expiryType === 'views' ? { views: viewsCount } : { expiration: timeMinutes })
  };

  // Upload to server
  const response = await fetch(`${serverUrl}/api/notes/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error('Content too large');
    }
    throw new Error(`Upload failed with status ${response.status}`);
  }

  const result = await response.json();

  // Generate URL with encryption key in fragment
  const keyHex = await CryptoUtils.keyToHex(key);
  const url = `${serverUrl}/note/${result.id}#${keyHex}`;

  return { url, id: result.id };
}

async function uploadFiles(files, expiryType, viewsCount, timeMinutes) {
  // Generate encryption key
  const key = await CryptoUtils.generateKey();

  // Encrypt files
  const encryptedContents = await CryptoUtils.encryptFiles(files, key);

  // Prepare note data
  const data = {
    contents: encryptedContents,
    meta: JSON.stringify({ type: 'file' }),
    ...(expiryType === 'views' ? { views: viewsCount } : { expiration: timeMinutes })
  };

  // Upload to server
  const response = await fetch(`${serverUrl}/api/notes/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error('Files too large');
    }
    throw new Error(`Upload failed with status ${response.status}`);
  }

  const result = await response.json();

  // Generate URL with encryption key in fragment
  const keyHex = await CryptoUtils.keyToHex(key);
  const url = `${serverUrl}/note/${result.id}#${keyHex}`;

  return { url, id: result.id };
}

function showResult(url) {
  // Hide input sections
  const inputSection = document.querySelector('.input-section');
  const options = document.querySelector('.options');
  const shareBtn = document.querySelector('.share-btn');

  if (inputSection) inputSection.hidden = true;
  if (options) options.hidden = true;
  if (shareBtn) shareBtn.hidden = true;

  // Show result
  const result = document.getElementById('result');
  if (!result) return;

  result.hidden = false;

  const resultUrl = document.getElementById('result-url');
  if (resultUrl) resultUrl.value = url;

  // Generate QR code
  generateQRCode(url);

  // Auto-copy to clipboard
  copyToClipboard();
}

function generateQRCode(url) {
  const qrCode = document.getElementById('qr-code');
  if (!qrCode) return;

  // Use a simple QR code API
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;

  qrCode.innerHTML = `
    <img src="${qrApiUrl}" alt="QR Code" style="width: 150px; height: 150px; border-radius: 8px;" />
    <small style="display: block; margin-top: 8px; color: #666;">Scan to open on mobile</small>
  `;
}

function copyToClipboard() {
  const resultUrl = document.getElementById('result-url');
  if (!resultUrl) return;

  resultUrl.select();
  resultUrl.setSelectionRange(0, 99999); // For mobile devices

  navigator.clipboard.writeText(resultUrl.value).then(() => {
    const copyIcon = document.getElementById('copy-icon');
    if (copyIcon) {
      copyIcon.textContent = '✅';
      setTimeout(() => {
        copyIcon.textContent = '📋';
      }, 2000);
    }
  }).catch(err => {
    console.error('Failed to copy:', err);
    // Fallback for older browsers
    document.execCommand('copy');
  });
}

function resetForm() {
  // Show input sections
  const inputSection = document.querySelector('.input-section');
  const options = document.querySelector('.options');
  const shareBtn = document.querySelector('.share-btn');

  if (inputSection) inputSection.hidden = false;
  if (options) options.hidden = false;
  if (shareBtn) shareBtn.hidden = false;

  // Hide result
  const result = document.getElementById('result');
  if (result) result.hidden = true;

  // Clear form
  const textInput = document.getElementById('text-input');
  if (textInput) textInput.value = '';

  selectedFiles = [];
  renderFileList();
  updateShareButton();
  clearError();
}

async function saveSettings() {
  const serverUrlInput = document.getElementById('server-url');
  if (!serverUrlInput) return;

  const newServerUrl = serverUrlInput.value.trim();

  if (!newServerUrl) {
    showError('Please enter a valid server URL');
    return;
  }

  // Validate URL format
  try {
    new URL(newServerUrl);
  } catch (e) {
    showError('Invalid server URL format');
    return;
  }

  serverUrl = newServerUrl;
  await chrome.storage.sync.set({ serverUrl: newServerUrl });

  showSuccess('Settings saved successfully!');
  updateServerStatus();
}

function handleServerModeChange(e) {
  const mode = e.target.value;
  const serverUrlInput = document.getElementById('server-url');

  if (serverUrlInput && DEFAULT_SERVERS[mode]) {
    serverUrlInput.value = DEFAULT_SERVERS[mode];
  }
}

function handleMessage(message) {
  if (message.action === 'share-text') {
    const textInput = document.getElementById('text-input');
    if (textInput) {
      textInput.value = message.text;
      updateShareButton();
    }
  } else if (message.action === 'share-screenshot') {
    fetch(message.dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], message.fileName, { type: 'image/png' });
        selectedFiles = [file];
        renderFileList();
        updateShareButton();
      })
      .catch(err => {
        console.error('Failed to process screenshot:', err);
        showError('Failed to process screenshot');
      });
  }
}

async function checkPendingData() {
  try {
    const result = await chrome.storage.local.get(['pendingText', 'pendingFile']);

    if (result.pendingText) {
      const textInput = document.getElementById('text-input');
      if (textInput) {
        textInput.value = result.pendingText;
        updateShareButton();
      }
      await chrome.storage.local.remove('pendingText');
    }

    if (result.pendingFile) {
      // Handle pending file if needed
      await chrome.storage.local.remove('pendingFile');
    }
  } catch (error) {
    console.error('Error checking pending data:', error);
  }
}

// UI Helper Functions

function setLoadingState(message) {
  isUploading = true;
  const shareBtn = document.getElementById('share-btn');
  const shareBtnText = document.getElementById('share-btn-text');
  const shareBtnLoader = document.getElementById('share-btn-loader');

  if (shareBtn) shareBtn.disabled = true;
  if (shareBtnText) {
    shareBtnText.textContent = message || 'Processing...';
    shareBtnText.hidden = false;
  }
  if (shareBtnLoader) shareBtnLoader.hidden = false;
}

function clearLoadingState() {
  isUploading = false;
  const shareBtn = document.getElementById('share-btn');
  const shareBtnText = document.getElementById('share-btn-text');
  const shareBtnLoader = document.getElementById('share-btn-loader');

  if (shareBtnText) {
    shareBtnText.textContent = 'Create Secure Link';
  }
  if (shareBtnLoader) shareBtnLoader.hidden = true;

  updateShareButton();
}

function showError(message) {
  // Create or update error message element
  let errorEl = document.getElementById('error-message');

  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.id = 'error-message';
    errorEl.style.cssText = `
      background: #fee;
      color: #c33;
      padding: 12px;
      border-radius: 8px;
      margin: 12px 0;
      font-size: 14px;
      border: 1px solid #fcc;
    `;

    const container = document.querySelector('.container main');
    if (container) container.insertBefore(errorEl, container.firstChild);
  }

  errorEl.textContent = message;
  errorEl.hidden = false;

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (errorEl) errorEl.hidden = true;
  }, 5000);
}

function showSuccess(message) {
  // Create or update success message element
  let successEl = document.getElementById('success-message');

  if (!successEl) {
    successEl = document.createElement('div');
    successEl.id = 'success-message';
    successEl.style.cssText = `
      background: #efe;
      color: #3c3;
      padding: 12px;
      border-radius: 8px;
      margin: 12px 0;
      font-size: 14px;
      border: 1px solid #cfc;
    `;

    const container = document.querySelector('.container main');
    if (container) container.insertBefore(successEl, container.firstChild);
  }

  successEl.textContent = message;
  successEl.hidden = false;

  // Auto-hide after 3 seconds
  setTimeout(() => {
    if (successEl) successEl.hidden = true;
  }, 3000);
}

function clearError() {
  const errorEl = document.getElementById('error-message');
  if (errorEl) errorEl.hidden = true;
}

function updateServerStatus() {
  // Show current server in UI
  const statusEl = document.getElementById('server-status');
  if (statusEl) {
    const isLocal = serverUrl.includes('localhost');
    statusEl.textContent = isLocal ? '🟢 Local' : '🌐 Production';
    statusEl.style.color = isLocal ? '#4ade80' : '#8b5cf6';
  }
}

// Utility Functions

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function truncate(str, length) {
  if (str.length <= length) return str;
  return str.substring(0, length - 3) + '...';
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
