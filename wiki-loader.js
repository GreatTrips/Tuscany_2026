/**
 * wiki-loader.js — fixed version
 * Uses 1x1 GIF placeholder (no src="" loops), fetches real URLs via Wikimedia API.
 */
(function () {
  var PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  var THUMB_WIDTH = 600;
  var API = 'https://commons.wikimedia.org/w/api.php';
  var BATCH = 20;

  function init() {
    var imgs = Array.from(document.querySelectorAll('img[data-wiki-file]'));
    if (!imgs.length) return;

    imgs.forEach(function (img) {
      // Use transparent GIF placeholder - never triggers onerror or self-loading
      img.src = PLACEHOLDER;
      img.style.background = '#f0e6d3';
      img.style.minHeight = '80px';
    });

    for (var i = 0; i < imgs.length; i += BATCH) {
      fetchBatch(imgs.slice(i, i + BATCH));
    }
  }

  function fetchBatch(batch) {
    var titles = batch.map(function (img) {
      return 'File:' + img.getAttribute('data-wiki-file');
    }).join('|');

    var url = API + '?action=query'
      + '&titles=' + encodeURIComponent(titles)
      + '&prop=imageinfo&iiprop=url&iiurlwidth=' + THUMB_WIDTH
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
          if (map[k]) {
            setImage(img, map[k]);
          } else {
            useFallback(img);
          }
        });
      })
      .catch(function () { batch.forEach(useFallback); });
  }

  function setImage(img, src) {
    img.style.background = '';
    img.style.minHeight = '';
    img.onerror = function () {
      img.onerror = null;
      useFallback(img);
    };
    img.src = src;
  }

  function useFallback(img) {
    var fb = img.getAttribute('data-fallback-src');
    if (fb && fb !== img.src) {
      img.onerror = function () {
        img.onerror = null;
        img.style.visibility = 'hidden';
        img.style.background = '';
        img.style.minHeight = '';
      };
      img.src = fb;
    } else {
      img.style.visibility = 'hidden';
      img.style.background = '';
      img.style.minHeight = '';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
