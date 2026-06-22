console.log('Twitter content script loaded');

function createDownloadButton(url: string, filename: string, isVideo: boolean = false) {
  const container = document.createElement('div');
  container.className = 'x-media-downloader-container';
  container.style.position = 'absolute';
  container.style.top = '8px';
  container.style.right = '8px';
  container.style.zIndex = '9999';

  const btn = document.createElement('div');
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`;
  btn.style.backgroundColor = 'rgba(0,0,0,0.6)';
  btn.style.color = 'white';
  btn.style.borderRadius = '50%';
  btn.style.padding = '6px';
  btn.style.cursor = 'pointer';
  btn.style.display = 'flex';
  btn.style.alignItems = 'center';
  btn.style.justifyContent = 'center';
  
  container.appendChild(btn);

  let dropdown: HTMLDivElement | null = null;

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isVideo) {
      if (dropdown) {
        dropdown.remove();
        dropdown = null;
        return;
      }
      
      // Fetch video details
      btn.style.opacity = '0.5';
      const tweetId = url; // for video, we pass the tweetId as URL
      try {
        const res = await fetch(`https://api.vxtwitter.com/x/status/${tweetId}`);
        const data = await res.json();
        
        const videos = data.media_extended?.filter((m: any) => m.type === 'video' || m.type === 'gif') || [];
        
        btn.style.opacity = '1';

        const currentDropdown = document.createElement('div');
        dropdown = currentDropdown;
        currentDropdown.style.position = 'absolute';
        currentDropdown.style.top = '100%';
        currentDropdown.style.right = '0';
        currentDropdown.style.marginTop = '4px';
        currentDropdown.style.backgroundColor = 'white';
        currentDropdown.style.color = 'black';
        currentDropdown.style.borderRadius = '8px';
        currentDropdown.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        currentDropdown.style.padding = '4px';
        currentDropdown.style.minWidth = '120px';
        currentDropdown.style.display = 'flex';
        currentDropdown.style.flexDirection = 'column';
        currentDropdown.style.gap = '2px';

        if (videos.length === 0) {
          const item = document.createElement('div');
          item.innerText = 'No video found';
          item.style.padding = '8px 12px';
          item.style.fontSize = '12px';
          currentDropdown.appendChild(item);
        }

        videos.forEach((vid: any, index: number) => {
          const item = document.createElement('div');
          const resolution = vid.size ? `${vid.size.width}x${vid.size.height}` : 'Video';
          item.innerText = `Download ${resolution}`;
          item.style.padding = '8px 12px';
          item.style.fontSize = '13px';
          item.style.cursor = 'pointer';
          item.style.borderRadius = '4px';
          item.style.fontWeight = '500';
          
          item.onmouseover = () => item.style.backgroundColor = '#f3f4f6';
          item.onmouseout = () => item.style.backgroundColor = 'transparent';

          item.onclick = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const vidUrl = vid.url;
            const ext = vidUrl.split('.').pop() || 'mp4';
            const vidFilename = `x_video_${tweetId}_${index}.${ext}`;
            
            item.innerText = 'Downloading...';
            chrome.runtime.sendMessage({
              action: 'DOWNLOAD_MEDIA',
              payload: { url: vidUrl, filename: vidFilename }
            }, (response: any) => {
              if (response && response.success) {
                dropdown?.remove();
                dropdown = null;
                btn.style.backgroundColor = 'rgba(34, 197, 94, 0.8)';
                setTimeout(() => { btn.style.backgroundColor = 'rgba(0,0,0,0.6)'; }, 1000);
              } else {
                item.innerText = 'Failed';
                item.style.color = 'red';
              }
            });
          };
          currentDropdown.appendChild(item);
        });

        container.appendChild(currentDropdown);

      } catch (err) {
        btn.style.opacity = '1';
        btn.style.backgroundColor = 'rgba(239, 68, 68, 0.8)';
        console.error('Failed to fetch video', err);
      }
    } else {
      // Photo download logic
      const origUrl = url.replace(/name=[^&]+/, 'name=orig');
      chrome.runtime.sendMessage({
        action: 'DOWNLOAD_IMAGE_AS_PNG',
        payload: {
          urlCandidates: [origUrl, url],
          filename: filename.replace(/\.[^.]+$/, '.png')
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
    }
  });

  // Close dropdown if clicked outside
  document.addEventListener('click', (e) => {
    if (dropdown && !container.contains(e.target as Node)) {
      dropdown.remove();
      dropdown = null;
    }
  });
  
  return container;
}

function getTweetIdFromElement(el: Element): string | null {
  const article = el.closest('article');
  if (!article) return null;
  const links = article.querySelectorAll('a[href*="/status/"]');
  for (const link of links) {
    const match = (link as HTMLAnchorElement).href.match(/\/status\/(\d+)/);
    if (match) return match[1];
  }
  return null;
}

function processMedia() {
  // Process Photos
  const photos = document.querySelectorAll('img[src*="pbs.twimg.com/media/"]:not([data-injected="true"])');
  photos.forEach((img: Element) => {
    img.setAttribute('data-injected', 'true');
    const imgSrc = (img as HTMLImageElement).src;
    if (imgSrc) {
      const filename = `x_photo_${Date.now()}.png`;
      
      const btn = createDownloadButton(imgSrc, filename, false);
      
      const photoEl = img.parentElement as HTMLElement;
      if (photoEl) {
        if (window.getComputedStyle(photoEl).position === 'static') {
          photoEl.style.position = 'relative';
        }
        photoEl.appendChild(btn);
      }
    }
  });

  // Process Videos
  const videos = document.querySelectorAll('video:not([data-injected="true"])');
  videos.forEach((video: Element) => {
    video.setAttribute('data-injected', 'true');
    const tweetId = getTweetIdFromElement(video);
    
    if (tweetId) {
      const btn = createDownloadButton(tweetId, '', true);
      
      // The video element is usually deep inside divs. We find a suitable wrapper.
      // Usually, the immediate parent or grandparent works.
      const videoWrapper = video.parentElement?.parentElement as HTMLElement;
      if (videoWrapper) {
        if (window.getComputedStyle(videoWrapper).position === 'static') {
          videoWrapper.style.position = 'relative';
        }
        videoWrapper.appendChild(btn);
      }
    }
  });
}

const observer = new MutationObserver(() => {
  processMedia();
});

observer.observe(document.body, { childList: true, subtree: true });
// Run once on load
processMedia();

export {};
