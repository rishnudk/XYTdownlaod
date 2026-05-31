console.log('Twitter content script loaded');

function createDownloadButton(url: string, filename: string) {
  const btn = document.createElement('div');
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`;
  btn.style.position = 'absolute';
  btn.style.top = '8px';
  btn.style.right = '8px';
  btn.style.zIndex = '9999';
  btn.style.backgroundColor = 'rgba(0,0,0,0.6)';
  btn.style.color = 'white';
  btn.style.borderRadius = '50%';
  btn.style.padding = '6px';
  btn.style.cursor = 'pointer';
  btn.style.display = 'flex';
  btn.style.alignItems = 'center';
  btn.style.justifyContent = 'center';
  btn.className = 'x-media-downloader-btn';
  
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Convert url to original quality if it's twimg
    // Format: https://pbs.twimg.com/media/XXXX?format=jpg&name=large -> name=orig
    const origUrl = url.replace(/name=[^&]+/, 'name=orig');
    
    chrome.runtime.sendMessage({
      action: 'DOWNLOAD_MEDIA',
      payload: {
        url: origUrl,
        filename: filename
      }
    }, (response: any) => {
      if (response && response.success) {
        btn.style.backgroundColor = 'rgba(34, 197, 94, 0.8)'; // green-500
        setTimeout(() => {
          btn.style.backgroundColor = 'rgba(0,0,0,0.6)';
        }, 1000);
      } else {
        btn.style.backgroundColor = 'rgba(239, 68, 68, 0.8)'; // red-500
      }
    });
  });
  
  return btn;
}

function processPhotos() {
  const photos = document.querySelectorAll('div[data-testid="tweetPhoto"]:not([data-injected="true"])');
  photos.forEach(photo => {
    photo.setAttribute('data-injected', 'true');
    const img = photo.querySelector('img');
    if (img && img.src) {
      // Create a unique filename
      const extMatch = img.src.match(/format=([^&]+)/);
      const ext = extMatch ? extMatch[1] : 'jpg';
      const filename = `x_photo_${Date.now()}.${ext}`;
      
      const btn = createDownloadButton(img.src, filename);
      
      // Make sure parent has relative positioning
      const wrapper = photo.parentElement;
      if (wrapper) {
        wrapper.style.position = 'relative';
        wrapper.appendChild(btn);
      }
    }
  });
}

const observer = new MutationObserver(() => {
  processPhotos();
});

observer.observe(document.body, { childList: true, subtree: true });
// Run once on load
processPhotos();
