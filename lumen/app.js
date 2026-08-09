/* Lumen — interaction layer
   Vanilla JS, no dependencies. Everything degrades gracefully without it. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- nav */
  var nav = document.querySelector('.nav');
  var burger = document.querySelector('.nav__burger');
  var drawer = document.querySelector('.drawer');

  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = drawer.getAttribute('data-open') === 'true';
      drawer.setAttribute('data-open', String(!open));
      burger.setAttribute('aria-expanded', String(!open));
      document.body.style.overflow = !open ? 'hidden' : '';
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        drawer.setAttribute('data-open', 'false');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* Nav inverts while a dark section sits behind it. */
  var darkZones = Array.prototype.slice.call(
    document.querySelectorAll('.chapter--dark, .tile--dark, .story, [data-nav="dark"]')
  );

  function syncNav() {
    if (!nav || !darkZones.length) return;
    var probe = nav.getBoundingClientRect().bottom - 2;
    var dark = darkZones.some(function (el) {
      var r = el.getBoundingClientRect();
      return r.top <= probe && r.bottom >= probe;
    });
    nav.classList.toggle('nav--dark', dark);
  }

  /* ------------------------------------------------------------- reveal */
  var revealables = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* -------------------------------------------------------- story scrub */
  var story = document.querySelector('.story');
  if (story) {
    var steps = story.querySelectorAll('.story__step');
    var art = story.querySelector('.story__art');

    if ('IntersectionObserver' in window) {
      var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          en.target.classList.toggle('is-in', en.isIntersecting);
        });
      }, { threshold: 0.55 });
      steps.forEach(function (s) { sio.observe(s); });
    } else {
      steps.forEach(function (s) { s.classList.add('is-in'); });
    }

    if (art && !reduced) {
      var scrub = function () {
        var r = story.getBoundingClientRect();
        var total = r.height - window.innerHeight;
        if (total <= 0) return;
        var p = Math.min(1, Math.max(0, -r.top / total));
        art.style.transform =
          'rotate(' + (p * 360).toFixed(2) + 'deg) scale(' + (0.82 + p * 0.24).toFixed(3) + ')';
      };
      story.__scrub = scrub;
    }
  }

  /* --------------------------------------------------- scroll dispatcher */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      syncNav();
      if (story && story.__scrub) story.__scrub();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* -------------------------------------------------------- colour dots */
  document.querySelectorAll('[data-swatches]').forEach(function (group) {
    var art = group.parentElement.querySelector('[data-tintable]');
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('.swatch');
      if (!btn) return;
      group.querySelectorAll('.swatch').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      if (art) {
        art.style.filter = btn.dataset.filter || 'none';
        art.style.transition = 'filter .45s cubic-bezier(.28,.11,.32,1)';
      }
      var label = group.parentElement.querySelector('[data-colour-label]');
      if (label) label.textContent = btn.getAttribute('aria-label') || '';
    });
  });

  /* ------------------------------------------------------- store filter */
  var chipBar = document.querySelector('[data-filter-bar]');
  if (chipBar) {
    var cards = document.querySelectorAll('[data-cat]');
    chipBar.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      var cat = chip.dataset.cat;
      chipBar.querySelectorAll('.chip').forEach(function (c) {
        c.setAttribute('aria-pressed', String(c === chip));
      });
      cards.forEach(function (card) {
        var show = cat === 'all' || card.dataset.cat === cat;
        card.style.display = show ? '' : 'none';
      });
    });
  }

  /* --------------------------------------------------------- rail arrows */
  document.querySelectorAll('[data-rail]').forEach(function (rail) {
    var track = rail.querySelector('.rail__track');
    rail.querySelectorAll('[data-rail-nav]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = btn.dataset.railNav === 'prev' ? -1 : 1;
        var card = track.querySelector('.card');
        var step = card ? card.getBoundingClientRect().width + 20 : 320;
        track.scrollBy({ left: dir * step, behavior: reduced ? 'auto' : 'smooth' });
      });
    });
  });

  /* ------------------------------------------------------- current year */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = String(new Date().getFullYear());
})();
