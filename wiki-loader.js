/**
 * wiki-loader.js
 * Dynamically resolves Wikimedia Commons image URLs via their public API.
 * Works from any origin including local file:// testing.
 *
 * Usage: add data-wiki-file="Filename.jpg" to any <img> tag.
 * The loader will fetch the real URL and set src automatically.
 */

(function() {
  const BATCH_SIZE = 20;
  const THUMB_WIDTH = 600;
  const API = 'https://commons.wikimedia.org/w/api.php';

  function resolveImages() {
    const imgs = Array.from(document.querySelectorAll('img[data-wiki-file]'));
    if (!imgs.length) return;

    // Add a loading placeholder style
    imgs.forEach(img => {
      if (!img.src || img.src === window.location.href) {
        img.style.background = 'linear-gradient(135deg, #2C1F14 0%, #3D2B1A 100%)';
        img.style.minHeight = '120px';
      }
    });

    // Batch the files
    for (let i = 0; i < imgs.length; i += BATCH_SIZE) {
      const batch = imgs.slice(i, i + BATCH_SIZE);
      const titles = batch.map(img => 'File:' + img.getAttribute('data-wiki-file')).join('|');

      const url = API + '?action=query' +
        '&titles=' + encodeURIComponent(titles) +
        '&prop=imageinfo' +
        '&iiprop=url' +
        '&iiurlwidth=' + THUMB_WIDTH +
        '&format=json' +
        '&origin=*';

      fetch(url, { headers: { 'Accept': 'application/json' } })
        .then(r => r.json())
        .then(data => {
          const pages = data?.query?.pages || {};
          // Build a map of normalised filename → URL
          const urlMap = {};
          Object.values(pages).forEach(page => {
            if (page.imageinfo && page.imageinfo[0]) {
              const info = page.imageinfo[0];
              const src = info.thumburl || info.url;
              // Normalise the title key: strip "File:" prefix, lowercase, replace spaces
              const key = (page.title || '').replace(/^File:/i, '').replace(/_/g, ' ').toLowerCase();
              urlMap[key] = src;
            }
          });

          // Apply to images in this batch
          batch.forEach(img => {
            const fileAttr = img.getAttribute('data-wiki-file') || '';
            const key = fileAttr.replace(/_/g, ' ').toLowerCase();
            const src = urlMap[key];
            if (src) {
              img.src = src;
              img.style.background = '';
              img.style.minHeight = '';
            } else {
              // API found nothing — use the precomputed URL as fallback
              const precomputed = img.getAttribute('data-fallback-src');
              if (precomputed) img.src = precomputed;
            }
          });
        })
        .catch(() => {
          // On network error, use precomputed fallback URLs
          batch.forEach(img => {
            const precomputed = img.getAttribute('data-fallback-src');
            if (precomputed) img.src = precomputed;
          });
        });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', resolveImages);
  } else {
    resolveImages();
  }
})();
