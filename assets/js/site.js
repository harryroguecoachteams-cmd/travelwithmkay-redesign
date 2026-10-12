// Travel with Mkay v3 interactions. Everything degrades to readable static content without JS.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Menu + header shadow
  var toggle = $('.menu-toggle'), nav = $('#site-nav');
  if (toggle && nav) toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  var header = $('.site-header'), mcta = $('.mobile-cta');
  function onScroll() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle('scrolled', y > 10);
    if (mcta) mcta.classList.toggle('show', y > 640);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Typed destination in the headline
  var typed = $('.typed');
  if (typed && !reduce) {
    var words = (typed.getAttribute('data-words') || '').split('|').filter(Boolean), w = 0, i = typed.textContent.length, del = true;
    setTimeout(function tick() {
      var word = words[w];
      if (del) { i--; typed.textContent = word.slice(0, Math.max(i, 0)); if (i <= 0) { del = false; w = (w + 1) % words.length; } setTimeout(tick, i <= 0 ? 320 : 50); }
      else { word = words[w]; i++; typed.textContent = word.slice(0, i); if (i >= word.length) { del = true; setTimeout(tick, 2300); return; } setTimeout(tick, 90); }
    }, 2600);
  }

  // Hero photo stack
  var stack = $('.stack');
  if (stack) {
    var slides = $$('.slide', stack), dots = $$('.stack-dots i', stack), cap = $('.cap', stack), k = 0, timer;
    function show(n) {
      slides[k].classList.remove('on'); if (dots[k]) dots[k].classList.remove('on');
      k = (n + slides.length) % slides.length;
      slides[k].classList.add('on'); if (dots[k]) dots[k].classList.add('on');
      if (cap) { cap.querySelector('b').textContent = slides[k].getAttribute('data-place'); cap.querySelector('span').textContent = slides[k].getAttribute('data-n'); }
    }
    function start() { if (!reduce) timer = setInterval(function () { show(k + 1); }, 3800); }
    stack.addEventListener('mouseenter', function () { clearInterval(timer); });
    stack.addEventListener('mouseleave', start);
    start();
  }

  // Big play buttons (film + stage) load nothing until pressed
  $$('.play-big').forEach(function (btn) {
    var v = btn.parentElement.querySelector('video'); if (!v) return;
    btn.addEventListener('click', function () {
      $$('video').forEach(function (o) { if (o !== v) o.pause(); });
      btn.hidden = true; v.controls = true; v.play(); v.focus();
    });
  });

  // Testimonial theater
  var stage = $('.stage');
  if (stage) {
    var sv = $('video', stage), sb = $('.play-big', stage), quote = $('.now blockquote'), who = $('.now cite');
    $$('.reel button').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.reel button').forEach(function (o) { o.setAttribute('aria-current', 'false'); });
        b.setAttribute('aria-current', 'true');
        sv.pause(); sv.src = b.getAttribute('data-src'); sv.poster = b.getAttribute('data-poster');
        var tr = sv.querySelector('track'); if (tr) tr.src = b.getAttribute('data-vtt');
        quote.textContent = b.getAttribute('data-quote'); who.textContent = b.getAttribute('data-who');
        sb.hidden = true; sv.controls = true; sv.play();
      });
    });
  }

  // Flip cards (tap or keyboard)
  $$('.flip button').forEach(function (b) {
    b.addEventListener('click', function () { var f = b.parentElement; var on = f.classList.toggle('on'); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  });

  // Generic tab sets: [role=tablist] controls panels by aria-controls
  $$('[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    function sel(t) {
      tabs.forEach(function (o) { o.setAttribute('aria-selected', o === t ? 'true' : 'false'); o.tabIndex = o === t ? 0 : -1; var p = document.getElementById(o.getAttribute('aria-controls')); if (p) p.hidden = o !== t; });
    }
    tabs.forEach(function (t, idx) {
      t.addEventListener('click', function () { sel(t); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var n = tabs[(idx + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; sel(n); n.focus(); }
      });
    });
  });

  // Photo strip arrows
  var strip = $('.strip');
  $$('.strip-nav button').forEach(function (b) {
    b.addEventListener('click', function () { strip.scrollBy({ left: (b.getAttribute('data-dir') === 'next' ? 1 : -1) * Math.min(strip.clientWidth * .8, 760), behavior: reduce ? 'auto' : 'smooth' }); });
  });

  // World map sneak peeks
  var dataEl = $('#map-data'), inner = $('.map-inner'), card = $('.map-card');
  if (dataEl && inner && card) {
    var data = JSON.parse(dataEl.textContent), active = null, small = window.matchMedia('(max-width: 800px)');
    function hide() { card.classList.remove('show'); if (active) { active.classList.remove('active'); active = null; } }
    function showPin(g) {
      var d = data[+g.getAttribute('data-i')];
      if (active) active.classList.remove('active'); active = g; g.classList.add('active');
      card.innerHTML = '<button class="x" type="button" aria-label="Close">×</button>' +
        '<div class="n">' + (d.n === 1 ? 'Home' : 'Country ' + d.n + ' of 100') + '</div><h4>' + d.c + '</h4>' +
        '<div class="meta">' + (d.n === 1 ? 'Where it all started' : 'First visit ' + d.y) + ' · ' + d.k + '</div>' +
        (d.p ? '<p class="place">' + d.p + '</p>' : '') + (d.s ? '<a href="' + d.s + '">Read the story →</a>' : '');
      var x = small.matches ? d.dx : d.bx, y = small.matches ? d.dy : d.by;
      var px = x / 1400 * inner.clientWidth, py = y / 602 * inner.clientHeight;
      px = Math.min(Math.max(px, 146), inner.clientWidth - 146);
      card.style.left = px + 'px'; card.style.top = py + 'px';
      card.classList.toggle('below', py - card.offsetHeight - 22 < 0); card.classList.add('show');
      card.querySelector('.x').addEventListener('click', hide);
    }
    $$('.pin', inner).forEach(function (g) {
      g.addEventListener('mouseenter', function () { showPin(g); });
      g.addEventListener('focus', function () { showPin(g); });
      g.addEventListener('click', function (e) { e.stopPropagation(); showPin(g); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
    });
    inner.addEventListener('mouseleave', function (e) { if (!card.contains(e.relatedTarget)) hide(); });
    card.addEventListener('mouseleave', function (e) { if (!inner.contains(e.relatedTarget)) hide(); });
    document.addEventListener('click', function (e) { if (!card.contains(e.target)) hide(); });
    var holder = $('.map-holder');
    function centre() { if (holder.scrollWidth > holder.clientWidth) holder.scrollLeft = holder.scrollWidth * .545 - holder.clientWidth / 2; }
    centre(); window.addEventListener('load', centre);
  }

  // Closing line
  var dest = $('#going-to'), cta = $('#going-cta');
  if (dest && cta) { var base = cta.textContent; dest.addEventListener('input', function () { var v = dest.value.trim().slice(0, 40); cta.textContent = v ? 'Plan my trip to ' + v : base; }); }

  // Reveal on scroll
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0, rootMargin: '0px 0px 12% 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else { $$('.reveal').forEach(function (el) { el.classList.add('in'); }); }
})();
