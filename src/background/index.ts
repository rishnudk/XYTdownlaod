console.log('Background service worker initialized.');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

function downloadFile(url: string, filename: string, sendResponse: (response?: any) => void) {
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
}

function normalizePngFilename(filename: string) {
  const baseName = filename.replace(/\.[^.]+$/, '');
  return `${baseName}.png`;
}

async function fetchBlobFromCandidates(urls: string[]) {
  let lastError: string | null = null;

  for (const url of urls) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        lastError = `Fetch failed for ${url} with status ${response.status}`;
        continue;
      }

      return await response.blob();
    } catch (error) {
      lastError = error instanceof Error ? error.message : `Fetch failed for ${url}`;
    }
  }

  throw new Error(lastError || 'Unable to fetch any image candidate');
}

async function downloadImageCandidatesAsPng(urls: string[], filename: string) {
  const blob = await fetchBlobFromCandidates(urls);
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext('2d');

  if (!context) {
    bitmap.close();
    throw new Error('Failed to create canvas context');
  }

  context.drawImage(bitmap, 0, 0);
  bitmap.close();

  const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
  const buffer = await pngBlob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';

  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }

  const dataUrl = `data:image/png;base64,${btoa(binary)}`;

  await new Promise<void>((resolve, reject) => {
    chrome.downloads.download({
      url: dataUrl,
      filename: normalizePngFilename(filename),
      saveAs: false,
    }, (downloadId?: number) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      console.log('PNG download started with ID:', downloadId);
      resolve();
    });
  });
}

chrome.runtime.onMessage.addListener((message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message.action === 'DOWNLOAD_MEDIA') {
    const { url, filename } = message.payload;
    downloadFile(url, filename, sendResponse);
    return true;
  }

  if (message.action === 'DOWNLOAD_IMAGE_AS_PNG') {
    const { url, urlCandidates, filename } = message.payload;

    (async () => {
      try {
        const candidates = Array.isArray(urlCandidates) && urlCandidates.length > 0 ? urlCandidates : [url];
        await downloadImageCandidatesAsPng(candidates, filename);
        sendResponse({ success: true });
      } catch (error) {
        const messageText = error instanceof Error ? error.message : 'Unknown PNG conversion error';
        console.error('PNG download failed:', messageText);
        sendResponse({ success: false, error: messageText });
      }
    })();

    return true;
  }
});
