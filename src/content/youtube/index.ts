console.log('YouTube content script loaded');

function injectDownloadButton() {
  // Prevent duplicate injection
  if (document.querySelector('.xyt-yt-download-btn')) return;

  // The most reliable element on the YouTube watch page is the video player itself
  const player = document.getElementById('movie_player') || document.querySelector('.html5-video-player');
  if (!player) return;

  const btnContainer = document.createElement('div');
  btnContainer.className = 'xyt-yt-download-btn';
  btnContainer.style.position = 'absolute';
  btnContainer.style.top = '16px';
  btnContainer.style.right = '16px';
  btnContainer.style.zIndex = '9999';

  const btn = document.createElement('button');
  btn.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  btn.style.color = 'white';
  btn.style.border = '1px solid rgba(255,255,255,0.2)';
  btn.style.borderRadius = '8px';
  btn.style.padding = '8px 12px';
  btn.style.fontSize = '14px';
  btn.style.fontWeight = '500';
  btn.style.cursor = 'pointer';
  btn.style.display = 'flex';
  btn.style.alignItems = 'center';
  btn.style.gap = '6px';
  btn.style.backdropFilter = 'blur(4px)';
  btn.style.fontFamily = 'Roboto, Arial, sans-serif';
  btn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
  
  btn.onmouseover = () => btn.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  btn.onmouseout = () => btn.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';

  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`;
  
  btn.innerHTML = `${iconSvg} <span>Download Video</span>`;

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
    
    try {
      // Cobalt is currently down for YouTube due to Google's SABR rollout.
      // We'll use a reliable commercial downloader (SaveFrom/ssyoutube) as the fallback.
      const ytUrl = new URL(window.location.href);
      const ssUrl = `https://www.ssyoutube.com${ytUrl.pathname}${ytUrl.search}`;
      window.open(ssUrl, '_blank');
      
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> <span>Opened</span>`;
      btn.style.borderColor = '#22c55e';
      setTimeout(() => { 
        btn.innerHTML = originalHTML; 
        btn.style.borderColor = 'rgba(255,255,255,0.2)';
      }, 3000);
      
    } catch (err) {
      console.error('YouTube download failed:', err);
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg> <span>Failed</span>`;
      btn.style.borderColor = '#ef4444';
      setTimeout(() => { 
        btn.innerHTML = originalHTML; 
        btn.style.borderColor = 'rgba(255,255,255,0.2)';
      }, 3000);
    }
  });

  btnContainer.appendChild(btn);
  player.appendChild(btnContainer);
}

// Keep trying to inject until player is found
function tryInject() {
  if (window.location.pathname === '/watch' && !document.querySelector('.xyt-yt-download-btn')) {
    injectDownloadButton();
  }
}

document.addEventListener('yt-navigate-finish', () => {
  setTimeout(tryInject, 1000);
  setTimeout(tryInject, 3000);
});

const observer = new MutationObserver(() => {
  tryInject();
});

observer.observe(document.body, { childList: true, subtree: true });

if (window.location.pathname === '/watch') {
  setTimeout(tryInject, 1000);
  setTimeout(tryInject, 3000);
}

export {};
