/**
 * art-id.js — injected into all location pages
 * Adds:
 *  1. Floating 🔍 camera button linking to identify.html
 *  2. Hover overlay on artwork images showing title/attribution
 */

(function() {

  // ── 1. FLOATING IDENTIFIER BUTTON ────────────────────────────────────────
  const fab = document.createElement('a');
  fab.href = 'identify.html';
  fab.innerHTML = '🔍';
  fab.title = 'Identify any artwork with your camera';
  fab.setAttribute('aria-label', 'Art identifier');
  Object.assign(fab.style, {
    position: 'fixed',
    bottom: '24px',
    right: '20px',
    zIndex: '999',
    width: '52px',
    height: '52px',
    background: '#C4622D',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    boxShadow: '0 4px 20px rgba(196,98,45,0.5)',
    textDecoration: 'none',
    transition: 'transform 0.2s, box-shadow 0.2s',
    lineHeight: '1',
  });
  fab.addEventListener('mouseenter', () => {
    fab.style.transform = 'scale(1.08)';
    fab.style.boxShadow = '0 6px 28px rgba(196,98,45,0.7)';
  });
  fab.addEventListener('mouseleave', () => {
    fab.style.transform = '';
    fab.style.boxShadow = '0 4px 20px rgba(196,98,45,0.5)';
  });

  // Add tooltip label
  const tooltip = document.createElement('div');
  tooltip.textContent = 'Identify artwork';
  Object.assign(tooltip.style, {
    position: 'fixed',
    bottom: '84px',
    right: '16px',
    background: '#2C1F14',
    color: '#E8956A',
    fontSize: '11px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    padding: '5px 10px',
    borderRadius: '3px',
    whiteSpace: 'nowrap',
    opacity: '0',
    transition: 'opacity 0.2s',
    pointerEvents: 'none',
    zIndex: '998',
    border: '1px solid rgba(196,98,45,0.3)',
  });
  fab.addEventListener('mouseenter', () => tooltip.style.opacity = '1');
  fab.addEventListener('mouseleave', () => tooltip.style.opacity = '0');

  document.body.appendChild(fab);
  document.body.appendChild(tooltip);


  // ── 2. HOVER TOOLTIPS ON ARTWORK IMAGES ──────────────────────────────────
  // Create a shared tooltip element
  const imgTooltip = document.createElement('div');
  Object.assign(imgTooltip.style, {
    position: 'fixed',
    background: 'rgba(24,17,10,0.95)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(196,98,45,0.35)',
    color: '#FAF5ED',
    padding: '8px 12px',
    borderRadius: '3px',
    fontSize: '12px',
    lineHeight: '1.5',
    maxWidth: '240px',
    pointerEvents: 'none',
    opacity: '0',
    transition: 'opacity 0.2s',
    zIndex: '997',
    fontFamily: "'Jost', sans-serif",
    fontWeight: '300',
  });
  document.body.appendChild(imgTooltip);

  // Add scan overlay to all artwork images
  document.querySelectorAll('.artwork-img-wrap img, .painting-img-wrap img, .prisoners-grid img, .img-row img, figure img').forEach(img => {
    const alt = img.getAttribute('alt') || '';
    if (!alt) return;

    // Make parent relative if needed
    const parent = img.parentElement;
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    // Create scan overlay
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'absolute',
      inset: '0',
      background: 'linear-gradient(135deg, rgba(196,98,45,0.12) 0%, transparent 60%)',
      opacity: '0',
      transition: 'opacity 0.25s',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
      padding: '8px',
      cursor: 'pointer',
    });

    const badge = document.createElement('div');
    Object.assign(badge.style, {
      background: 'rgba(196,98,45,0.85)',
      color: '#FAF5ED',
      fontSize: '10px',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      padding: '3px 7px',
      borderRadius: '2px',
      fontFamily: "'Jost', sans-serif",
    });
    badge.textContent = '🔍 Identify';
    overlay.appendChild(badge);

    // Click → go to identify page
    overlay.addEventListener('click', () => {
      window.location.href = 'identify.html';
    });

    parent.appendChild(overlay);

    // Show/hide on hover
    parent.addEventListener('mouseenter', (e) => {
      overlay.style.opacity = '1';
      // Show tooltip with alt text
      imgTooltip.innerHTML = `<span style="color:#E8956A;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;display:block;margin-bottom:3px;">Artwork</span>${alt}`;
      const rect = parent.getBoundingClientRect();
      let left = rect.left + window.scrollX;
      let top = rect.bottom + window.scrollY + 6;
      // Keep in viewport
      const tw = 240;
      if (left + tw > window.innerWidth - 16) left = window.innerWidth - tw - 16;
      imgTooltip.style.left = left + 'px';
      imgTooltip.style.top = (rect.bottom + 6) + 'px';
      imgTooltip.style.opacity = '1';
    });

    parent.addEventListener('mouseleave', () => {
      overlay.style.opacity = '0';
      imgTooltip.style.opacity = '0';
    });
  });

})();
