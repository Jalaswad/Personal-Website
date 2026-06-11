// DR. JOOD AL ASWAD — SHARED JS

// --- SCROLL REVEAL ---
document.addEventListener('DOMContentLoaded', () => {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 80px 0px' });
  document.querySelectorAll('.sr').forEach(el => {
    const r = el.getBoundingClientRect();
    (r.top < window.innerHeight && r.bottom > 0)
      ? el.classList.add('visible')
      : io.observe(el);
  });

  // --- ACTIVE NAV LINK ---
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    if (href === current || (current === '' && href === 'index.html'))
      a.classList.add('active');
  });

  // --- HAMBURGER ---
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        links.classList.remove('open');
      })
    );
  }

  // --- TIMELINE (research.html) ---
  initTimeline();
});

// --- TIMELINE — IntersectionObserver on panels, grows line as you scroll ---
function initTimeline() {
  const panels = Array.from(document.querySelectorAll('.rp-panel'));
  const fill   = document.querySelector('.tl-fill');
  const layout = document.querySelector('.research-layout');
  if (!panels.length) return;

  // Add the glowing fill element if not present
  if (!fill && layout) {
    const f = document.createElement('div');
    f.className = 'tl-fill';
    layout.appendChild(f);
  }

  function updateFill() {
    const f = document.querySelector('.tl-fill');
    if (!f || !layout) return;
    // Find the last in-view panel, grow line to its center
    const inView = panels.filter(p => p.classList.contains('in-view'));
    if (!inView.length) { f.style.height = '0'; return; }
    const last  = inView[inView.length - 1];
    const lRect = last.getBoundingClientRect();
    const pRect = layout.getBoundingClientRect();
    const h = (lRect.top + lRect.height * 0.3) - pRect.top + layout.scrollTop;
    f.style.height = Math.max(0, h) + 'px';
  }

  // Observe each panel — add in-view when it enters viewport
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('in-view');
      else e.target.classList.remove('in-view');
    });
    updateFill();
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  panels.forEach(p => io.observe(p));

  // Also update fill on scroll for smooth growth
  window.addEventListener('scroll', updateFill, { passive: true });
  window.addEventListener('resize', updateFill, { passive: true });
}

// --- RARE FISH ---
(function spawnPageFish() {
  const seed = document.querySelector('.fish-seed');
  if (!seed) return;
  function spawnOne() {
    const fish = document.createElement('div');
    fish.className = 'fish';
    const size     = 14 + Math.random() * 12;
    const top      = 20 + Math.random() * 65;
    const duration = 90 + Math.random() * 60;
    fish.style.cssText = `position:fixed;top:${top}vh;animation-duration:${duration}s;width:${size}px;`;
    fish.style.filter = 'drop-shadow(0 0 5px rgba(58,139,170,0.55)) drop-shadow(0 0 10px rgba(58,139,170,0.28))';
    const img = document.createElement('img');
    img.src = seed.src; img.alt = '';
    fish.appendChild(img);
    document.body.appendChild(fish);
    setTimeout(() => { fish.remove(); scheduleNext(); }, duration * 1000);
  }
  function scheduleNext() { setTimeout(spawnOne, 18000 + Math.random() * 30000); }
  scheduleNext();
})();

// --- LIGHTBOX ---
function openLightbox(src, caption) {
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const vid = document.getElementById('lightbox-video');
  const cap = document.getElementById('lightbox-caption');
  if (!lb) return;
  const isVideo = /\.(mp4|webm|ogg)$/i.test(src);
  if (isVideo) {
    img.style.display = 'none'; vid.style.display = 'block'; vid.src = src; vid.play();
  } else {
    vid.style.display = 'none'; vid.pause(); vid.src = '';
    img.style.transform = 'scale(.92)'; img.style.opacity = '0';
    img.style.display = 'block'; img.src = src;
  }
  if (cap) cap.textContent = caption || '';
  lb.style.display = 'flex';
  document.addEventListener('keydown', escHandler);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    lb.classList.add('open');
    if (!isVideo) { img.style.transform = 'scale(1)'; img.style.opacity = '1'; }
  }));
}
function closeLightbox() {
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const vid = document.getElementById('lightbox-video');
  if (!lb) return;
  lb.classList.remove('open');
  if (img) { img.style.transform = 'scale(.92)'; img.style.opacity = '0'; }
  setTimeout(() => {
    lb.style.display = 'none';
    if (img) img.style.display = 'none';
  }, 320);
  if (vid) { vid.pause(); vid.src = ''; }
  document.removeEventListener('keydown', escHandler);
}
function escHandler(e) { if (e.key === 'Escape') closeLightbox(); }
document.addEventListener('click', e => {
  const lb = e.target.closest('#lightbox');
  if (lb && !e.target.closest('#lightbox-img') && !e.target.closest('#lightbox-video')) closeLightbox();
  const cell = e.target.closest('.photo-cell');
  if (cell) {
    const img = cell.querySelector('img');
    const lbl = cell.querySelector('.photo-label');
    if (img) openLightbox(img.src, lbl?.textContent || img.alt || '');
  }
});

// --- CONTACT FORM ---
function submitForm() {
  const name    = document.getElementById('name')?.value.trim();
  const email   = document.getElementById('email')?.value.trim();
  const subject = document.getElementById('subject')?.value.trim() || 'Hello from geojood.com';
  const message = document.getElementById('message')?.value.trim();
  if (!name || !email || !message) { alert('Please fill in your name, email, and message.'); return; }
  const body   = `From: ${name} <${email}>\n\n${message}`;
  const mailto = `mailto:jood${String.fromCharCode(64)}vt.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  const success = document.getElementById('formSuccess');
  if (success) { success.style.display = 'block'; success.textContent = '✦ Opening your mail app… send the message to complete.'; }
}
