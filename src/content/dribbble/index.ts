console.log('Dribbble content script loaded');

function buildImageCandidates(src: string) {
  const candidates = [src];

  try {
    const url = new URL(src);
    url.search = '';
    const stripped = url.toString();
    if (!candidates.includes(stripped)) {
      candidates.push(stripped);
    }
  } catch {
    const stripped = src.split('?')[0];
    if (!candidates.includes(stripped)) {
      candidates.push(stripped);
    }
  }

  return candidates;
}

function createDownloadButton(urlCandidates: string[], filename: string) {
  const container = document.createElement('div');
  container.className = 'xyt-dribbble-download-container';
  container.style.position = 'absolute';
  container.style.top = '8px';
  container.style.right = '8px';
  container.style.zIndex = '2147483647';

  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', 'Download image as PNG');
  button.title = 'Download image as PNG';
  button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`;
  button.style.width = '32px';
  button.style.height = '32px';
  button.style.border = '1px solid rgba(255,255,255,0.18)';
  button.style.borderRadius = '999px';
  button.style.backgroundColor = 'rgba(17, 24, 39, 0.78)';
  button.style.color = 'white';
  button.style.cursor = 'pointer';
  button.style.display = 'grid';
  button.style.placeItems = 'center';
  button.style.backdropFilter = 'blur(6px)';
  button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.24)';
  button.style.transition = 'transform 120ms ease, background-color 120ms ease, border-color 120ms ease';

  button.onmouseenter = () => {
    button.style.transform = 'scale(1.04)';
    button.style.backgroundColor = 'rgba(15, 23, 42, 0.92)';
  };
  button.onmouseleave = () => {
    button.style.transform = 'scale(1)';
    button.style.backgroundColor = 'rgba(17, 24, 39, 0.78)';
  };

  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    const originalHtml = button.innerHTML;
    button.disabled = true;
    button.style.opacity = '0.75';
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: xyt-dribbble-spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;

    if (!document.getElementById('xyt-dribbble-spin-style')) {
      const style = document.createElement('style');
      style.id = 'xyt-dribbble-spin-style';
      style.textContent = '@keyframes xyt-dribbble-spin { 100% { transform: rotate(360deg); } }';
      document.head.appendChild(style);
    }

    chrome.runtime.sendMessage({
      action: 'DOWNLOAD_IMAGE_AS_PNG',
      payload: {
        urlCandidates,
        filename,
      },
    }, (response: { success?: boolean; error?: string } | undefined) => {
      button.disabled = false;
      button.style.opacity = '1';

      if (response?.success) {
        button.style.borderColor = 'rgba(34, 197, 94, 0.9)';
        button.style.backgroundColor = 'rgba(22, 101, 52, 0.9)';
        button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbf7d0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
        setTimeout(() => {
          button.style.borderColor = 'rgba(255,255,255,0.18)';
          button.style.backgroundColor = 'rgba(17, 24, 39, 0.78)';
          button.innerHTML = originalHtml;
        }, 1200);
      } else {
        button.style.borderColor = 'rgba(239, 68, 68, 0.9)';
        button.style.backgroundColor = 'rgba(127, 29, 29, 0.9)';
        button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fecaca" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>`;
        setTimeout(() => {
          button.style.borderColor = 'rgba(255,255,255,0.18)';
          button.style.backgroundColor = 'rgba(17, 24, 39, 0.78)';
          button.innerHTML = originalHtml;
        }, 1400);
      }
    });
  });

  container.appendChild(button);
  return container;
}

function findOverlayHost(img: HTMLImageElement) {
  const anchorHost = img.closest('a[href*="/shots/"]') || img.closest('a[href*="/shot/"]');
  const host = (anchorHost?.parentElement || img.closest('article') || img.closest('figure') || img.parentElement) as HTMLElement | null;
  return host;
}

function injectButtonForImage(img: HTMLImageElement) {
  if (img.dataset.xytInjected === 'true') {
    return;
  }

  const src = img.currentSrc || img.src;
  if (!src || !/dribbble\.com/.test(src)) {
    return;
  }

  const pageLooksLikeShot = /\/shots?\//.test(window.location.pathname);
  const isLikelyShotImage = Boolean(
    img.closest('a[href*="/shots/"]') ||
    img.closest('a[href*="/shot/"]') ||
    img.closest('article') ||
    img.closest('figure'),
  );

  const width = img.clientWidth || img.naturalWidth;
  const height = img.clientHeight || img.naturalHeight;
  const maxSize = Math.max(width, height);

  if (!pageLooksLikeShot && !isLikelyShotImage && maxSize < 220) {
    return;
  }

  const host = findOverlayHost(img);
  if (!host) {
    return;
  }

  if (window.getComputedStyle(host).position === 'static') {
    host.style.position = 'relative';
  }

  img.dataset.xytInjected = 'true';
  const filename = `dribbble_image_${Date.now()}.png`;
  host.appendChild(createDownloadButton(buildImageCandidates(src), filename));
}

function processImages() {
  const images = document.querySelectorAll('img[src*="dribbble.com"]:not([data-xyt-injected="true"])');
  images.forEach((image) => injectButtonForImage(image as HTMLImageElement));
}

const observer = new MutationObserver(() => {
  processImages();
});

observer.observe(document.body, { childList: true, subtree: true });
processImages();

export {};
