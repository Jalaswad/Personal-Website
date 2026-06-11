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

// --- TIMELINE ---
function initTimeline() {
  const panelIds = ['rp-phan','rp-permian','rp-cenozoic','rp-future'];
  const items    = Array.from(document.querySelectorAll('.rt-item'));
  const aside    = document.querySelector('.research-layout > aside');
  if (!items.length || !aside) return;

  function positionNodes() {
    const asideTop = aside.getBoundingClientRect().top + window.scrollY;
    const asideH   = aside.offsetHeight;
    if (asideH < 50) return;
    panelIds.forEach((id, i) => {
      const panel = document.getElementById(id);
      if (!panel || !items[i]) return;
      const pct = ((panel.getBoundingClientRect().top + window.scrollY) - asideTop) / asideH * 100;
      items[i].style.top = Math.max(1, Math.min(97, pct)) + '%';
    });
  }

  function updateLine() {
    const asideTop = aside.getBoundingClientRect().top + window.scrollY;
    const asideH   = aside.offsetHeight;
    if (asideH < 50) return;
    const pct = Math.max(0, Math.min(100,
      ((window.scrollY + window.innerHeight * 0.45) - asideTop) / asideH * 100));
    aside.style.setProperty('--progress', pct + '%');
  }

  function updateActive() {
    const mid = window.innerHeight / 2;
    let activeIdx = -1, closest = Infinity;
    panelIds.forEach((id, i) => {
      const el = document.getElementById(id); if (!el) return;
      const r  = el.getBoundingClientRect();
      const dist = Math.abs(r.top + r.height / 2 - mid);
      if (r.top < window.innerHeight && r.bottom > 0 && dist < closest) { closest = dist; activeIdx = i; }
    });
    items.forEach((item, i) => {
      item.classList.toggle('active',  i === activeIdx);
      item.classList.toggle('visited', i < activeIdx);
    });
  }

  items.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const el = document.getElementById(item.getAttribute('data-target'));
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' });
    });
  });

  function update() { updateLine(); updateActive(); }
  positionNodes(); update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', () => { positionNodes(); update(); }, { passive: true });
  window.addEventListener('load',   () => { positionNodes(); update(); });
  setTimeout(() => { positionNodes(); update(); }, 300);
  setTimeout(() => { positionNodes(); update(); }, 900);
}
document.addEventListener('DOMContentLoaded', initTimeline);

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
