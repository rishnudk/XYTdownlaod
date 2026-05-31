console.log('Twitter content script loaded');

// Basic boilerplate to observe DOM for tweets
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      // Find tweets and inject buttons
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });
