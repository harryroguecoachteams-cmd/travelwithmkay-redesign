// Travel with Mkay v4 (v2 + liked v3 pieces): menu, typed destination, testimonial players and theater,
// offer tabs, world map sneak peeks, closing line. Everything degrades to readable static content without JS.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Hero: "I'm Going To ____." types through real destinations (static for reduced motion)
  var typed = document.querySelector('.typed');
  if (typed && !reduce) {
    var words = (typed.getAttribute('data-words') || '').split('|').filter(Boolean);
    var w = 0, i = typed.textContent.length, deleting = true;
    setTimeout(function tick() {
      var word = words[w];
      if (deleting) {
        i--;
        typed.textContent = word.slice(0, Math.max(i, 0));
        if (i <= 0) { deleting = false; w = (w + 1) % words.length; }
        setTimeout(tick, i <= 0 ? 350 : 55);
      } else {
        word = words[w];
        i++;
        typed.textContent = word.slice(0, i);
        if (i >= word.length) { deleting = true; setTimeout(tick, 2200); return; }
        setTimeout(tick, 95);
      }
    }, 2600);
  }

  // Hero video: skip it for reduced motion or data saver, keep the poster image
  var hv = document.querySelector('.hero video');
  if (hv) {
    var saver = navigator.connection && navigator.connection.saveData;
    if (reduce || saver) { hv.removeAttribute('autoplay'); hv.pause(); hv.remove(); }
  }

  // Client videos load nothing until someone presses play
  function pauseOthers(video) { $$('video').forEach(function (v) { if (v !== video && v !== hv) v.pause(); }); }
  $$('.vmedia').forEach(function (box) {
    var btn = box.querySelector('.play');
    var video = box.querySelector('video');
    if (!btn || !video) return;
    btn.addEventListener('click', function () {
      pauseOthers(video);
      btn.hidden = true;
      video.controls = true;
      video.play();
      video.focus();
    });
  });
  $$('.play-big').forEach(function (btn) {
    var video = btn.parentElement.querySelector('video');
    if (!video) return;
    btn.addEventListener('click', function () {
      pauseOthers(video);
      btn.hidden = true; video.controls = true; video.play(); video.focus();
    });
  });

  // Testimonial theater: pick a story from the reel, it plays on the stage
  var stage = document.querySelector('.stage');
  if (stage) {
    var sv = stage.querySelector('video'), sb = stage.querySelector('.play-big');
    var quote = document.querySelector('.now blockquote'), who = document.querySelector('.now cite');
    $$('.reel button').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.reel button').forEach(function (o) { o.setAttribute('aria-current', 'false'); });
        b.setAttribute('aria-current', 'true');
        pauseOthers(sv);
        sv.pause(); sv.src = b.getAttribute('data-src'); sv.poster = b.getAttribute('data-poster');
        var tr = sv.querySelector('track'); if (tr) tr.src = b.getAttribute('data-vtt');
        quote.textContent = b.getAttribute('data-quote'); who.textContent = b.getAttribute('data-who');
        sb.hidden = true; sv.controls = true; sv.play();
      });
    });
  }

  // Offer tabs: [role=tablist] shows the panel named by aria-controls; arrow keys move between tabs
  $$('[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    function sel(t) {
      tabs.forEach(function (o) {
        o.setAttribute('aria-selected', o === t ? 'true' : 'false');
        o.tabIndex = o === t ? 0 : -1;
        var p = document.getElementById(o.getAttribute('aria-controls'));
        if (p) p.hidden = o !== t;
      });
    }
    tabs.forEach(function (t, idx) {
      t.addEventListener('click', function () { sel(t); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var n = tabs[(idx + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        sel(n); n.focus();
      });
    });
  });

  // World map: a sneak peek card for each country
  var dataEl = document.getElementById('map-data');
  var inner = document.querySelector('.map-inner');
  var card = document.querySelector('.map-card');
  if (dataEl && inner && card) {
    var data = JSON.parse(dataEl.textContent);
    var active = null;
    var small = window.matchMedia('(max-width: 800px)');
    function show(g) {
      var d = data[+g.getAttribute('data-i')];
      if (active) active.classList.remove('active');
      active = g; g.classList.add('active');
      var html = '<button class="x" type="button" aria-label="Close">×</button>' +
        '<div class="n">' + (d.n === 1 ? 'Home' : 'Country ' + d.n + ' of 100') + '</div>' +
        '<h4>' + d.c + '</h4>' +
        '<div class="meta">' + (d.n === 1 ? 'Where it all started' : 'First visit ' + d.y) + ' · ' + d.k + '</div>' +
        (d.p ? '<p class="place">' + d.p + '</p>' : '') +
        (d.s ? '<a href="' + d.s + '">Read the story →</a>' : '');
      card.innerHTML = html;
      var x = small.matches ? d.dx : d.bx, y = small.matches ? d.dy : d.by;
      var px = x / 1400 * inner.clientWidth, py = y / 602 * inner.clientHeight;
      var half = 135;
      px = Math.min(Math.max(px, half + 6), inner.clientWidth - half - 6);
      card.style.left = px + 'px';
      card.style.top = py + 'px';
      card.classList.toggle('below', py - card.offsetHeight - 22 < 0);
      card.classList.add('show');
      card.querySelector('.x').addEventListener('click', hide);
    }
    function hide() {
      card.classList.remove('show');
      if (active) { active.classList.remove('active'); active = null; }
    }
    inner.querySelectorAll('.pin').forEach(function (g) {
      g.addEventListener('mouseenter', function () { show(g); });
      g.addEventListener('focus', function () { show(g); });
      g.addEventListener('click', function (e) { e.stopPropagation(); show(g); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
    });
    inner.addEventListener('mouseleave', function (e) { if (!card.contains(e.relatedTarget)) hide(); });
    card.addEventListener('mouseleave', function (e) { if (!inner.contains(e.relatedTarget)) hide(); });
    document.addEventListener('click', function (e) { if (!card.contains(e.target)) hide(); });

    // Start the scrollable map centred on Africa on small screens
    var holder = document.querySelector('.map-holder');
    function centre() { if (holder.scrollWidth > holder.clientWidth) holder.scrollLeft = holder.scrollWidth * 0.545 - holder.clientWidth / 2; }
    centre(); window.addEventListener('load', centre);
  }

  // Closing line: "I'm going to ____." The button repeats what they typed.
  var dest = document.getElementById('going-to');
  var cta = document.getElementById('going-cta');
  if (dest && cta) {
    var label = cta.querySelector('span') || cta;
    var base = label.textContent;
    dest.addEventListener('input', function () {
      var v = dest.value.trim().slice(0, 40);
      label.textContent = v ? 'Plan my trip to ' + v : base;
    });
  }
})();
