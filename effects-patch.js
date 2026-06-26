(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  function wavePath(y, amp, phase) {
    var pts = '';
    var steps = 20;
    for (var i = 0; i <= steps; i++) {
      var px = (i / steps) * 100;
      var py = y + amp * Math.sin((i / steps) * 2 * Math.PI + phase);
      pts += (i === 0 ? 'M ' : 'L ') + px.toFixed(2) + ',' + py.toFixed(2) + ' ';
    }
    pts += 'L 100,110 L 0,110 Z';
    return pts;
  }

  function initLiquidBtn(btn) {
    if (btn.dataset.liquidDone) return;
    btn.dataset.liquidDone = 'true';

    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 110');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;border-radius:inherit;overflow:hidden;';

    var pathEl = document.createElementNS(svgNS, 'path');
    pathEl.setAttribute('fill', '#1a8fa8');
    pathEl.setAttribute('d', 'M 0,110 L 100,110 Z');
    svg.appendChild(pathEl);
    btn.insertBefore(svg, btn.firstChild);

    Array.from(btn.childNodes).forEach(function(n) {
      if (n === svg) return;
      if (n.nodeType === 3 && n.textContent.trim()) {
        var wrap = document.createElement('span');
        wrap.textContent = n.textContent;
        wrap.style.cssText = 'position:relative;z-index:2;';
        btn.replaceChild(wrap, n);
      } else if (n.nodeType === 1) {
        n.style.position = 'relative';
        n.style.zIndex = '2';
      }
    });

    var crestY = 110;
    var phase = 0;
    var amp = 8;
    var hovered = false;
    var raf = null;

    function frame() {
      var target = hovered ? -10 : 110;
      var spd = hovered ? 0.045 : 0.035;
      crestY += (target - crestY) * spd;
      phase -= 0.06;
      if (Math.abs(crestY - target) < 0.3) crestY = target;
      if (crestY >= 109) {
        pathEl.setAttribute('d', 'M 0,110 L 100,110 Z');
      } else {
        pathEl.setAttribute('d', wavePath(crestY, amp, phase));
      }
      var covered = crestY < 50;
      btn.querySelectorAll('span, a, div').forEach(function(el) {
        if (!el.closest('svg')) el.style.color = covered ? '#ffffff' : '';
      });
      btn.style.color = covered ? '#ffffff' : '';
      var done = (crestY === target);
      if (!done || hovered) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = null;
        if (!hovered) {
          btn.querySelectorAll('span, a, div').forEach(function(el) {
            if (!el.closest('svg')) el.style.color = '';
          });
          btn.style.color = '';
        }
      }
    }

    btn.addEventListener('mouseenter', function() {
      hovered = true;
      if (!raf) raf = requestAnimationFrame(frame);
    });
    btn.addEventListener('mouseleave', function() {
      hovered = false;
      if (!raf) raf = requestAnimationFrame(frame);
    });
  }

  function initLiquidButtons() {
    if (reduced) return;
    document.querySelectorAll('.btn-solid, .btn-ghost, .form-submit').forEach(initLiquidBtn);
  }

  function initMagnetic() {
    if (window.matchMedia('(hover: none)').matches || reduced) return;
    document.querySelectorAll('.btn-magnetic').forEach(function(btn) {
      btn.addEventListener('mousemove', function(e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width/2)) / (r.width/2);
        var dy = (e.clientY - (r.top + r.height/2)) / (r.height/2);
        btn.style.transform = 'translate('+(dx*6)+'px,'+(dy*4-2)+'px)';
      });
      btn.addEventListener('mouseleave', function() { btn.style.transform = ''; });
    });
  }

  function init() { initWordReveal(); initFloatUp(); initLiquidButtons(); initMagnetic(); }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init) : init();
})();
