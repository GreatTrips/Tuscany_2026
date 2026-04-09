/**
 * wiki-loader.js — v3
 *
 * Two lookup modes on <img> tags:
 *
 * 1. data-wiki-file="Exact_Filename.jpg"
 *    → Wikimedia Commons API (use for verified exact filenames)
 *
 * 2. data-wiki-article="Article Title"
 *    → Wikipedia pageimages API (use article names — reliable, no guessing)
 *
 * Both work from any origin including file:// and GitHub Pages.
 * Images start as a 1×1 transparent GIF; real URLs are loaded asynchronously.
 */
(function () {
  var GIF1 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  var W = 600;
  var COMMONS = 'https://commons.wikimedia.org/w/api.php';
  var WIKIPEDIA = 'https://en.wikipedia.org/w/api.php';
  var BATCH = 20;

  function init() {
    var fileImgs = Array.from(document.querySelectorAll('img[data-wiki-file]'));
    var artImgs  = Array.from(document.querySelectorAll('img[data-wiki-article]'));
    var all = fileImgs.concat(artImgs);
    if (!all.length) return;

    all.forEach(function (img) {
      img.src = GIF1;
      img.style.background = '#f0e6d3';
      img.style.minHeight = '80px';
    });

    // --- Batch file-based lookups (Commons) ---
    for (var i = 0; i < fileImgs.length; i += BATCH) {
      fetchByFile(fileImgs.slice(i, i + BATCH));
    }

    // --- Batch article-based lookups (Wikipedia pageimages) ---
    for (var j = 0; j < artImgs.length; j += BATCH) {
      fetchByArticle(artImgs.slice(j, j + BATCH));
    }
  }

  // ── COMMONS FILE API ────────────────────────────────────────────────────
  function fetchByFile(batch) {
    var titles = batch.map(function (img) {
      return 'File:' + img.getAttribute('data-wiki-file');
    }).join('|');

    var url = COMMONS + '?action=query'
      + '&titles=' + encodeURIComponent(titles)
      + '&prop=imageinfo&iiprop=url&iiurlwidth=' + W
      + '&format=json&origin=*';

    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var pages = (data.query || {}).pages || {};
        var map = {};
        Object.values(pages).forEach(function (p) {
          var info = (p.imageinfo || [{}])[0];
          var src = info.thumburl || info.url;
          if (src) {
            var key = (p.title || '').replace(/^File:/i, '').replace(/_/g, ' ').toLowerCase().trim();
            map[key] = src;
          }
        });
        batch.forEach(function (img) {
          var k = (img.getAttribute('data-wiki-file') || '').replace(/_/g, ' ').toLowerCase().trim();
          if (map[k]) setImage(img, map[k]);
          else useFallback(img);
        });
      })
      .catch(function () { batch.forEach(useFallback); });
  }

  // ── WIKIPEDIA PAGEIMAGES API ─────────────────────────────────────────────
  function fetchByArticle(batch) {
    var titles = batch.map(function (img) {
      return img.getAttribute('data-wiki-article');
    }).join('|');

    var url = WIKIPEDIA + '?action=query'
      + '&titles=' + encodeURIComponent(titles)
      + '&prop=pageimages'
      + '&pithumbsize=' + W
      + '&format=json&origin=*';

    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var pages = (data.query || {}).pages || {};
        var map = {};
        Object.values(pages).forEach(function (p) {
          var src = (p.thumbnail || {}).source;
          if (src) {
            var key = (p.title || '').toLowerCase().trim();
            map[key] = src;
          }
        });
        batch.forEach(function (img) {
          var k = (img.getAttribute('data-wiki-article') || '').toLowerCase().trim();
          if (map[k]) setImage(img, map[k]);
          else useFallback(img);
        });
      })
      .catch(function () { batch.forEach(useFallback); });
  }

  // ── HELPERS ──────────────────────────────────────────────────────────────
  function setImage(img, src) {
    img.style.background = '';
    img.style.minHeight = '';
    img.onerror = function () { img.onerror = null; useFallback(img); };
    img.src = src;
  }

  function useFallback(img) {
    var fb = img.getAttribute('data-fallback-src');
    if (fb && fb !== img.src) {
      img.onerror = function () {
        img.onerror = null;
        // Show subtle dark placeholder instead of invisible gap
        img.style.opacity = '0.15';
        img.style.background = '';
        img.style.minHeight = '';
      };
      img.src = fb;
    } else {
      // No fallback — keep placeholder background visible
      img.style.opacity = '0.15';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
