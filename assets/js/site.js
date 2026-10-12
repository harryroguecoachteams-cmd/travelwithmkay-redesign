// Travel with Mkay preview: menu, testimonial players, departures board, "I'm going to" line.
(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Testimonial videos load nothing until someone presses play.
  document.querySelectorAll('.story-media').forEach(function (box) {
    var btn = box.querySelector('.play');
    var video = box.querySelector('video');
    if (!btn || !video) return;
    btn.addEventListener('click', function () {
      document.querySelectorAll('.story-media video').forEach(function (v) { if (v !== video) v.pause(); });
      btn.hidden = true;
      video.controls = true;
      video.play();
      video.focus();
    });
  });

  // Departures board: flip the rows in once, when it scrolls into view.
  var board = document.querySelector('.board');
  if (board) {
    var flaps = board.querySelectorAll('.flap');
    flaps.forEach(function (el, i) { el.style.setProperty('--d', (i * 0.035) + 's'); });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { board.classList.add('is-flipping'); io.disconnect(); }
        });
      }, { threshold: 0.25 });
      io.observe(board);
    }
  }

  // Closing line: "I'm going to ____." The button repeats what they typed.
  var dest = document.getElementById('going-to');
  var cta = document.getElementById('going-cta');
  if (dest && cta) {
    var base = cta.textContent;
    dest.addEventListener('input', function () {
      var v = dest.value.trim().slice(0, 40);
      cta.textContent = v ? 'Plan my trip to ' + v : base;
    });
  }
})();
