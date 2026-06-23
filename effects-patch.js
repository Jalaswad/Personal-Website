(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- WORD REVEAL ---- */
  function makeWordSpan(text, idx) {
    var outer = document.createElement('span'); outer.className = 'rw-word';
    var inner = document.createElement('span'); inner.className = 'rw-inner';
    inner.style.setProperty('--i', idx); inner.textContent = text;
    outer.appendChild(inner); return outer;
  }
  function splitIntoWords(el) {
    var nodes = Array.from(el.childNodes); el.innerHTML = ''; var idx = 0;
    nodes.forEach(function(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach(function(chunk) {
          if (/^\s+$/.test(chunk)) el.appendChild(document.createTextNode(chunk));
          else if (chunk.length) el.appendChild(makeWordSpan(chunk, idx++));
        });
      } else if (['EM','I','STRONG'].indexOf((node.tagName||'')) > -1) {
        node.textContent.split(/(\s+)/).forEach(function(chunk) {
          if (/^\s+$/.test(chunk)) el.appendChild(document.createTextNode(chunk));
          else if (chunk.length) {
            var o = document.createElement('span'); o.className = 'rw-word';
            var t = node.tagName.toLowerCase();
            o.innerHTML = '<span class="rw-inner" style="--i:'+idx+'"><'+t+'>'+chunk+'</'+t+'></span>';
            idx++; el.appendChild(o);
          }
        });
      } else el.appendChild(node.cloneNode(true));
    });
  }
  function initWordReveal() {
    var targets = document.querySelectorAll('.reveal-words');
    if (!targets.length) return;
    targets.forEach(function(el) { if (!el.dataset.rwDone) { splitIntoWords(el); el.dataset.rwDone='true'; } });
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.05, rootMargin: '0px 0px 60px 0px' });
    targets.forEach(function(el) {
      var r = el.getBoundingClientRect();
      (r.top < window.innerHeight && r.bottom > 0) ? el.classList.add('visible') : io.observe(el);
    });
  }

  /* ---- SECTION FLOAT-UP ---- */
  function initFloatUp() {
    if (reduced) return;
    var sections = Array.from(document.querySelectorAll('section')).slice(1);
    if (!sections.length) return;
    sections.forEach(function(el) { el.classList.add('section-float'); });
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { e.target.classList.add('section-float-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -60px 0px' });
    sections.forEach(function(el) {
      var r = el.getBoundingClientRect();
      (r.top < window.innerHeight && r.bottom > 0) ? el.classList.add('section-float-visible') : io.observe(el);
    });
  }

  /* ---- WAVE BUTTONS ---- */
  function initWaveBtn(btn) {
    if (btn.dataset.waveDone) return;
    btn.dataset.waveDone = 'true';

    var isGhost = btn.classList.contains('btn-ghost');
    var bodyColor = isGhost ? '#7a9e8e' : '#4a7060';
    var waveColor = isGhost ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.28)';

    var cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;left:0;bottom:0;width:100%;height:100%;pointer-events:none;border-radius:inherit;z-index:-1;';
    btn.appendChild(cv);
    btn.style.isolation = 'isolate';

    var hovered = false, fill = 0, phase = 0, raf = null;

    function resize() { cv.width = btn.offsetWidth; cv.height = btn.offsetHeight; }
    resize();

    function draw() {
      var W = cv.width, H = cv.height;
      if (!W || !H) return;
      var ctx = cv.getContext('2d');
      ctx.clearRect(0, 0, W, H);
      if (fill <= 0.001) return;

      var amp = 5;
      var freq = (2 * Math.PI * 3) / W;
      // When fill=1, waveTop = -amp so the entire wave is above the canvas
      // meaning the full button is covered with no visible sine edge
      var waveTop = H * (1 - fill) - amp;

      // Full fill: trace sine, close to well below canvas
      ctx.beginPath();
      ctx.moveTo(0, waveTop + amp * Math.sin(phase));
      for (var x = 0; x <= W; x++) {
        ctx.lineTo(x, waveTop + amp * Math.sin(freq * x + phase));
      }
      ctx.lineTo(W, H + 20);
      ctx.lineTo(0, H + 20);
      ctx.closePath();
      ctx.fillStyle = bodyColor;
      ctx.fill();

      // Crest highlight strip — only visible while wave is partially risen
      if (waveTop > -amp) {
        ctx.beginPath();
        ctx.moveTo(0, waveTop + amp * Math.sin(phase));
        for (var x2 = 0; x2 <= W; x2++) {
          ctx.lineTo(x2, waveTop + amp * Math.sin(freq * x2 + phase));
        }
        ctx.lineTo(W, waveTop + amp + 7);
        ctx.lineTo(0, waveTop + amp + 7);
        ctx.closePath();
        ctx.fillStyle = waveColor;
        ctx.fill();
      }

      if (isGhost) btn.style.color = fill > 0.55 ? '#ffffff' : '';
    }

    function loop() {
      var target = hovered ? 1 : 0;
      // Use faster speed and snap to target when close enough
      var speed = hovered ? 0.07 : 0.07;
      fill += (target - fill) * speed;
      if (Math.abs(target - fill) < 0.01) fill = target;
      phase -= 0.09;
      draw();
      if (fill !== target || hovered) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    }

    btn.addEventListener('mouseenter', function() { hovered = true; resize(); if (!raf) raf = requestAnimationFrame(loop); });
    btn.addEventListener('mouseleave', function() { hovered = false; if (!raf) raf = requestAnimationFrame(loop); });
    window.addEventListener('resize', resize, { passive: true });
  }

  function initWaveButtons() {
    if (reduced) return;
    document.querySelectorAll('.btn-solid, .btn-ghost, .form-submit').forEach(initWaveBtn);
  }

  /* ---- MAGNETIC ---- */
  function initMagnetic() {
    if (window.matchMedia('(hover: none)').matches || reduced) return;
    document.querySelectorAll('.btn-magnetic').forEach(function(btn) {
      btn.addEventListener('mousemove', function(e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width/2))  / (r.width/2);
        var dy = (e.clientY - (r.top  + r.height/2)) / (r.height/2);
        btn.style.transform = 'translate('+(dx*6)+'px,'+(dy*4-2)+'px)';
      });
      btn.addEventListener('mouseleave', function() { btn.style.transform = ''; });
    });
  }

  function init() { initWordReveal(); initFloatUp(); initWaveButtons(); initMagnetic(); }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init) : init();
})();
