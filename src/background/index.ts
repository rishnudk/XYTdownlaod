console.log('Background service worker initialized.');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message.action === 'DOWNLOAD_MEDIA') {
    const { url, filename } = message.payload;
    
    chrome.downloads.download({
      url,
      filename,
      saveAs: false,
    }, (downloadId?: number) => {
      if (chrome.runtime.lastError) {
        console.error('Download failed:', chrome.runtime.lastError.message);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log('Download started with ID:', downloadId);
        sendResponse({ success: true, downloadId });
      }
    });

    return true; // Keep the message channel open for async response
  }
});
