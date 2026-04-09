/**
 * art-id.js
 * 1. Floating 🔍 camera button → identify.html
 * 2. Hover-only overlay on artwork images (desktop hover only, never on mobile tap)
 */
(function () {

  // ── FLOATING BUTTON ──────────────────────────────────────────────────────
  var fab = document.createElement('a');
  fab.href = 'identify.html';
  fab.innerHTML = '🔍';
  fab.title = 'Identify any artwork with your camera';
  fab.setAttribute('aria-label', 'Art identifier');
  var fabStyle = {
    position: 'fixed', bottom: '24px', right: '20px', zIndex: '999',
    width: '52px', height: '52px', background: '#C4622D', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '22px', boxShadow: '0 4px 20px rgba(196,98,45,0.5)',
    textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
    lineHeight: '1',
  };
  Object.assign(fab.style, fabStyle);
  fab.addEventListener('mouseenter', function () {
    fab.style.transform = 'scale(1.08)';
    fab.style.boxShadow = '0 6px 28px rgba(196,98,45,0.7)';
  });
  fab.addEventListener('mouseleave', function () {
    fab.style.transform = '';
    fab.style.boxShadow = '0 4px 20px rgba(196,98,45,0.5)';
  });
  document.body.appendChild(fab);

  // Tooltip
  var tooltip = document.createElement('div');
  tooltip.textContent = 'Identify artwork';
  Object.assign(tooltip.style, {
    position: 'fixed', bottom: '84px', right: '16px',
    background: '#2C1F14', color: '#E8956A',
    fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
    padding: '5px 10px', borderRadius: '3px', whiteSpace: 'nowrap',
    opacity: '0', transition: 'opacity 0.2s', pointerEvents: 'none',
    zIndex: '998', border: '1px solid rgba(196,98,45,0.3)',
  });
  fab.addEventListener('mouseenter', function () { tooltip.style.opacity = '1'; });
  fab.addEventListener('mouseleave', function () { tooltip.style.opacity = '0'; });
  document.body.appendChild(tooltip);

  // ── IMAGE HOVER OVERLAYS (desktop only) ──────────────────────────────────
  // Only add overlays on non-touch devices to avoid interfering with mobile taps
  var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  if (isTouchDevice) return;

  // Shared tooltip element
  var imgTooltip = document.createElement('div');
  Object.assign(imgTooltip.style, {
    position: 'fixed', background: 'rgba(24,17,10,0.95)', backdropFilter: 'blur(8px)',
    border: '1px solid rgba(196,98,45,0.35)', color: '#FAF5ED',
    padding: '8px 12px', borderRadius: '3px', fontSize: '12px',
    lineHeight: '1.5', maxWidth: '240px', pointerEvents: 'none',
    opacity: '0', transition: 'opacity 0.2s', zIndex: '997',
    fontFamily: "'Jost', sans-serif", fontWeight: '300',
  });
  document.body.appendChild(imgTooltip);

  var SELECTORS = '.artwork-img-wrap img, .painting-img-wrap img, .prisoners-grid img, .img-row img, figure img';
  document.querySelectorAll(SELECTORS).forEach(function (img) {
    var alt = img.getAttribute('alt') || '';
    if (!alt) return;

    var parent = img.parentElement;
    if (!parent) return;
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    // Overlay: hidden by default, shown ONLY on mouseenter
    var overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'absolute', inset: '0',
      background: 'linear-gradient(135deg,rgba(196,98,45,0.15) 0%,transparent 60%)',
      opacity: '0', transition: 'opacity 0.25s',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start',
      padding: '8px', cursor: 'pointer', pointerEvents: 'none', // <-- non-interactive until hovered
    });

    var badge = document.createElement('div');
    Object.assign(badge.style, {
      background: 'rgba(196,98,45,0.85)', color: '#FAF5ED',
      fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase',
      padding: '3px 7px', borderRadius: '2px', fontFamily: "'Jost', sans-serif",
    });
    badge.textContent = '🔍 Identify';
    overlay.appendChild(badge);
    parent.appendChild(overlay);

    parent.addEventListener('mouseenter', function () {
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'auto';
      imgTooltip.innerHTML = '<span style="color:#E8956A;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;display:block;margin-bottom:3px;">Artwork</span>' + alt;
      var rect = parent.getBoundingClientRect();
      var left = rect.left;
      if (left + 240 > window.innerWidth - 16) left = window.innerWidth - 256;
      imgTooltip.style.left = left + 'px';
      imgTooltip.style.top = (rect.bottom + 6) + 'px';
      imgTooltip.style.opacity = '1';
    });

    parent.addEventListener('mouseleave', function () {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      imgTooltip.style.opacity = '0';
    });

    overlay.addEventListener('click', function () {
      window.location.href = 'identify.html';
    });
  });

})();
