// Content script for HashWeb extension
// This script runs on all web pages and can interact with the page content

console.log('HashWeb extension loaded');

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);

  if (message.action === 'get-selected-text') {
    const selectedText = window.getSelection().toString();
    sendResponse({ text: selectedText });
  }

  return true;
});

// Future enhancements:
// - Add visual feedback when sharing
// - Show inline share buttons for images
// - Auto-detect credentials/sensitive data and offer to share securely
