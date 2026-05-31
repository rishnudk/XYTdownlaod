console.log('YouTube content script loaded');

function injectDownloadButton() {
  // Prevent duplicate injection
  if (document.querySelector('.xyt-yt-download-btn')) return;

  // Modern YouTube places the action buttons in a flexible container below the video title.
  // We'll target the top level buttons container.
  const actionMenu = document.querySelector('ytd-menu-renderer #top-level-buttons-computed') || 
                     document.querySelector('#flexible-item-buttons');
                     
  if (!actionMenu) return;

  const btnContainer = document.createElement('div');
  btnContainer.className = 'xyt-yt-download-btn';
  btnContainer.style.display = 'flex';
  btnContainer.style.alignItems = 'center';
  btnContainer.style.marginRight = '8px';

  const btn = document.createElement('button');
  // Make it look like a YouTube pill button
  btn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  btn.style.color = '#f1f1f1';
  btn.style.border = 'none';
  btn.style.borderRadius = '18px';
  btn.style.padding = '0 16px';
  btn.style.height = '36px';
  btn.style.fontSize = '14px';
  btn.style.fontWeight = '500';
  btn.style.cursor = 'pointer';
  btn.style.display = 'flex';
  btn.style.alignItems = 'center';
  btn.style.gap = '6px';
  btn.style.fontFamily = 'Roboto, Arial, sans-serif';
  
  btn.onmouseover = () => btn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
  btn.onmouseout = () => btn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';

  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`;
  
  btn.innerHTML = `${iconSvg} <span>XYT Download</span>`;

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const originalHTML = btn.innerHTML;
    // Show loading spinner
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> <span>Processing...</span>`;
    
    if (!document.getElementById('xyt-spin-style')) {
      const style = document.createElement('style');
      style.id = 'xyt-spin-style';
      style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
    }
    
    // Cobalt API expects a POST request
    try {
      const res = await fetch('https://api.cobalt.tools/api/json', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: window.location.href,
          vQuality: "1080",
          filenamePattern: "classic"
        })
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data = await res.json();
      
      if (data.status === 'stream' || data.status === 'redirect' || data.status === 'success') {
        const videoUrl = data.url;
        
        let title = document.querySelector('title')?.innerText.replace(' - YouTube', '') || 'youtube_video';
        title = title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_');
        
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> <span>Downloading...</span>`;
        
        chrome.runtime.sendMessage({
          action: 'DOWNLOAD_MEDIA',
          payload: {
            url: videoUrl,
            filename: `${title}_1080p.mp4`
          }
        }, (response: any) => {
          if (response && response.success) {
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> <span>Done</span>`;
            btn.style.color = '#22c55e';
            setTimeout(() => { 
              btn.innerHTML = originalHTML; 
              btn.style.color = '#f1f1f1';
            }, 3000);
          } else {
            throw new Error('Download failed in background worker');
          }
        });
      } else {
        throw new Error('API did not return a valid URL');
      }
    } catch (err) {
      console.error('YouTube download failed:', err);
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg> <span>Failed</span>`;
      btn.style.color = '#ef4444';
      setTimeout(() => { 
        btn.innerHTML = originalHTML; 
        btn.style.color = '#f1f1f1';
      }, 3000);
    }
  });

  btnContainer.appendChild(btn);
  
  // Insert at the beginning of the action menu
  actionMenu.insertBefore(btnContainer, actionMenu.firstChild);
}

// Ensure it runs on normal navigation
document.addEventListener('yt-navigate-finish', () => {
  setTimeout(injectDownloadButton, 1000);
});

// Observation is better for dynamically loaded parts of YouTube
const observer = new MutationObserver(() => {
  if (window.location.pathname === '/watch' && !document.querySelector('.xyt-yt-download-btn')) {
    injectDownloadButton();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial load fallback
if (window.location.pathname === '/watch') {
  setTimeout(injectDownloadButton, 1500);
}

export {};
