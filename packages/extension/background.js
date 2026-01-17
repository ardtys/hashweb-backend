// Background service worker for HashWeb extension

const DEFAULT_SERVER = 'http://localhost:3002';

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('HashWeb extension installed');

  // Get server URL from storage or use default
  chrome.storage.sync.get(['serverUrl'], (result) => {
    if (!result.serverUrl) {
      chrome.storage.sync.set({ serverUrl: DEFAULT_SERVER });
    }
  });

  // Create context menus
  createContextMenus();
});

// Create context menu items
function createContextMenus() {
  // Remove existing menus
  chrome.contextMenus.removeAll(() => {
    // Share selected text
    chrome.contextMenus.create({
      id: 'share-text',
      title: 'Share with HashWeb',
      contexts: ['selection']
    });

    // Share image
    chrome.contextMenus.create({
      id: 'share-image',
      title: 'Share image with HashWeb',
      contexts: ['image']
    });

    // Share link
    chrome.contextMenus.create({
      id: 'share-link',
      title: 'Share link with HashWeb',
      contexts: ['link']
    });

    // Capture screenshot
    chrome.contextMenus.create({
      id: 'capture-screenshot',
      title: 'Capture & Share Screenshot',
      contexts: ['page']
    });
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'share-text':
      shareText(info.selectionText);
      break;
    case 'share-image':
      shareImage(info.srcUrl);
      break;
    case 'share-link':
      shareLink(info.linkUrl);
      break;
    case 'capture-screenshot':
      captureScreenshot(tab.id);
      break;
  }
});

// Share selected text
async function shareText(text) {
  try {
    const result = await chrome.storage.sync.get(['serverUrl']);
    const serverUrl = result.serverUrl || DEFAULT_SERVER;

    // Show loading notification
    chrome.notifications.create({
      type: 'basic',
      title: 'HashWeb',
      message: 'Encrypting and uploading text...',
      iconUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="%238b5cf6"/><text x="24" y="32" font-size="32" text-anchor="middle" fill="white">🔷</text></svg>'
    });

    // Send message to popup or create new window
    chrome.runtime.sendMessage({
      action: 'share-text',
      text: text,
      serverUrl: serverUrl
    });
  } catch (error) {
    console.error('Error sharing text:', error);
    showErrorNotification('Failed to share text');
  }
}

// Share image URL
async function shareImage(imageUrl) {
  try {
    chrome.notifications.create({
      type: 'basic',
      title: 'HashWeb',
      message: 'Downloading and encrypting image...',
      iconUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="%238b5cf6"/><text x="24" y="32" font-size="32" text-anchor="middle" fill="white">🔷</text></svg>'
    });

    // Fetch image as blob
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Convert to file
    const file = new File([blob], 'image.png', { type: blob.type });

    chrome.runtime.sendMessage({
      action: 'share-file',
      file: file,
      fileName: 'image.png'
    });
  } catch (error) {
    console.error('Error sharing image:', error);
    showErrorNotification('Failed to share image');
  }
}

// Share link
async function shareLink(linkUrl) {
  const text = `Shared link: ${linkUrl}`;
  await shareText(text);
}

// Capture screenshot
async function captureScreenshot(tabId) {
  try {
    chrome.notifications.create({
      type: 'basic',
      title: 'HashWeb',
      message: 'Capturing screenshot...',
      iconUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="%238b5cf6"/><text x="24" y="32" font-size="32" text-anchor="middle" fill="white">🔷</text></svg>'
    });

    // Capture visible tab
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png'
    });

    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `screenshot-${timestamp}.png`;

    chrome.runtime.sendMessage({
      action: 'share-screenshot',
      dataUrl: dataUrl,
      fileName: fileName
    });

    // Open popup to complete the upload
    chrome.action.openPopup();
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    showErrorNotification('Failed to capture screenshot');
  }
}

// Show success notification with link
function showSuccessNotification(shareUrl) {
  chrome.notifications.create({
    type: 'basic',
    title: 'HashWeb - Success!',
    message: 'Link copied to clipboard!',
    iconUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="%238b5cf6"/><text x="24" y="32" font-size="32" text-anchor="middle" fill="white">✅</text></svg>',
    buttons: [
      { title: 'Open Link' }
    ]
  }, (notificationId) => {
    // Store the URL for the notification click handler
    chrome.storage.local.set({ [`notification_${notificationId}`]: shareUrl });
  });
}

// Show error notification
function showErrorNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    title: 'HashWeb - Error',
    message: message,
    iconUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="%23ef4444"/><text x="24" y="32" font-size="32" text-anchor="middle" fill="white">❌</text></svg>'
  });
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.storage.local.get([`notification_${notificationId}`], (result) => {
    const url = result[`notification_${notificationId}`];
    if (url) {
      chrome.tabs.create({ url: url });
      chrome.storage.local.remove(`notification_${notificationId}`);
    }
  });
});

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    chrome.storage.local.get([`notification_${notificationId}`], (result) => {
      const url = result[`notification_${notificationId}`];
      if (url) {
        chrome.tabs.create({ url: url });
        chrome.storage.local.remove(`notification_${notificationId}`);
      }
    });
  }
});

// Listen for messages from popup/content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'upload-success') {
    showSuccessNotification(message.url);
  } else if (message.action === 'upload-error') {
    showErrorNotification(message.error);
  }
  return true;
});
