// Travel with Mkay v7 (13 Oct): menu, header shadow, typed destination, stats one by one (the featured logos take
// their turns in CSS), testimonial players, offer tabs, world map sneak peeks, checklist form, closing line. Everything degrades to readable static content without JS.
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

  // Header picks up a soft shadow once the page scrolls
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', (window.scrollY || 0) > 8); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
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

  // Credibility band: the three stats arrive one by one, then their emoji take turns, in slow motion.
  // Each emoji is a sprite strip; adding .emo-run runs it once (CSS), animationend hands over to the next stat.
  var cred = document.querySelector('.cred');
  if (cred) {
    var stats = $$('.stat', cred);
    if (reduce || !('IntersectionObserver' in window)) {
      stats.forEach(function (s) { s.classList.add('in'); });
    } else {
      var turn = -1, timer = null, running = false, first = true;
      var next = function () {
        stats.forEach(function (s) { s.classList.remove('on'); var e = s.querySelector('.emo-s'); if (e) e.classList.remove('emo-run'); });
        if (!running) return;
        turn = (turn + 1) % stats.length;
        var s = stats[turn], e = s.querySelector('.emo-s');
        s.classList.add('on');
        if (e) { void e.offsetWidth; e.classList.add('emo-run'); }
      };
      stats.forEach(function (s) {
        var e = s.querySelector('.emo-s');
        if (e) e.addEventListener('animationend', function () { e.classList.remove('emo-run'); s.classList.remove('on'); clearTimeout(timer); timer = setTimeout(next, 700); });
      });
      new IntersectionObserver(function (entries) {
        var vis = entries[0].isIntersecting;
        if (vis && first) stats.forEach(function (s, i) { setTimeout(function () { s.classList.add('in'); }, 200 + i * 450); });
        if (vis && !running) { running = true; clearTimeout(timer); timer = setTimeout(next, first ? 1900 : 600); first = false; }
        if (!vis && running) { running = false; clearTimeout(timer); next(); }
      }, { threshold: 0.3 }).observe(cred);
    }
  }

  // Client videos load nothing until someone presses play. Once playing, the overlay hides and the native
  // controls take over (v6 fix: a CSS display rule beat [hidden], so the overlay stayed on top and swallowed pause).
  function pauseOthers(video) { $$('video').forEach(function (v) { if (v !== video && v !== hv) v.pause(); }); }
  function start(video) {
    pauseOthers(video);
    video.controls = true;
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }
  $$('.vmedia').forEach(function (box) {
    var btn = box.querySelector('.play');
    var video = box.querySelector('video');
    if (!btn || !video) return;
    btn.addEventListener('click', function () { start(video); video.focus(); });
    video.addEventListener('play', function () { btn.hidden = true; });
  });

  // Testimonial theater: pick a story from the reel, it plays on the stage. The big button shows whenever it is paused.
  var stage = document.querySelector('.stage');
  if (stage) {
    var sv = stage.querySelector('video'), sb = stage.querySelector('.play-big');
    var quote = document.querySelector('.now blockquote'), who = document.querySelector('.now cite');
    sb.addEventListener('click', function () { start(sv); });
    sv.addEventListener('click', function () { if (!sv.controls) start(sv); });
    sv.addEventListener('play', function () { sb.hidden = true; });
    sv.addEventListener('pause', function () { sb.hidden = false; });
    $$('.reel button').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.reel button').forEach(function (o) { o.setAttribute('aria-current', 'false'); });
        b.setAttribute('aria-current', 'true');
        sv.src = b.getAttribute('data-src'); sv.poster = b.getAttribute('data-poster');
        var tr = sv.querySelector('track'); if (tr) tr.src = b.getAttribute('data-vtt');
        quote.textContent = b.getAttribute('data-quote'); who.textContent = b.getAttribute('data-who');
        start(sv);
      });
    });
  }

  // Offer tabs: [role=tablist] shows the panel named by aria-controls; arrow keys move between tabs.
  // A link like coaching.html#bootcamp opens that tab (the home page "work with me" rows use this).
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
    function fromHash() {
      var h = location.hash.slice(1);
      var t = h && tabs.filter(function (o) { return o.getAttribute('data-hash') === h; })[0];
      if (!t) return;
      sel(t);
      var sec = document.getElementById('options');
      if (sec) sec.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    }
    fromHash();
    window.addEventListener('hashchange', fromHash);
    tabs.forEach(function (t, idx) {
      t.addEventListener('click', function () {
        sel(t);
        var h = t.getAttribute('data-hash');
        if (h && history.replaceState) history.replaceState(null, '', '#' + h);
      });
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

  // Checklist sign-up: posts to the live site's Contact Form 7 form (#4081), the same one its pop-up uses.
  // Without JS the form falls back to opening the travel kit page.
  $$('form.cf7').forEach(function (form) {
    var card = form.parentElement, thanks = card.querySelector('.thanks');
    var note = form.querySelector('.form-note'), btn = form.querySelector('button[type="submit"]');
    var kit = form.getAttribute('action');
    function fieldError(name, msg) {
      var input = form.querySelector('[name="' + name + '"]'), slot = form.querySelector('.err[data-for="' + name + '"]');
      if (input) input.setAttribute('aria-invalid', 'true');
      if (slot) slot.textContent = msg;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      note.textContent = '';
      $$('.err', form).forEach(function (s) { s.textContent = ''; });
      $$('input[required]', form).forEach(function (i) { i.removeAttribute('aria-invalid'); });
      var name = form.querySelector('[name="your-name"]'), email = form.querySelector('[name="your-email"]');
      if (!name.value.trim()) fieldError('your-name', 'Please tell me your name.');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) fieldError('your-email', 'Please enter a valid email address.');
      var bad = form.querySelector('[aria-invalid="true"]');
      if (bad) { bad.focus(); return; }
      var label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending…';
      fetch(form.getAttribute('data-endpoint'), { method: 'POST', body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.status === 'mail_sent') {
            $$(':scope > h3, :scope > p', card).forEach(function (el) { el.hidden = true; });
            form.hidden = true; thanks.hidden = false;
          } else if (d.status === 'validation_failed' && d.invalid_fields) {
            d.invalid_fields.forEach(function (f) { fieldError(f.field, f.message); });
          } else {
            note.innerHTML = (d.message ? d.message + ' ' : 'That did not go through. ') + 'You can also <a href="' + kit + '">get the kit here</a>.';
          }
        })
        .catch(function () { note.innerHTML = 'That did not go through just now. Please try again, or <a href="' + kit + '">get the kit here</a>.'; })
        .then(function () { btn.disabled = false; btn.textContent = label; });
    });
  });

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
