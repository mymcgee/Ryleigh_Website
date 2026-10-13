(function () {
  'use strict';

  /* =========================================================
     THINGS YOU CAN CHANGE
     ========================================================= */

  // Her birthday. Months start at 0, so October is 9.
  var BIRTH_MONTH = 9;
  var BIRTH_DAY = 13;

  // false = she answers the question every time she opens the site.
  // true  = after she unlocks it once, her browser skips straight to the main page.
  var REMEMBER_UNLOCK = false;

  // Paste a share link from Apple Music here and an "Open it on Apple Music" button shows up.
  // In Apple Music: right click the playlist, Share, Copy Link.
  var APPLE_MUSIC_URL = '';

  // The words that float around the intro and rotate in the little bubble while she scrolls.
  var WORDS = [
    'I miss myry',
    'I love you (more)',
    'You\u2019re so beautiful',
    'C\u2019mere',
    'I wanna eat you'
  ];

  // Your six favorites. Edit the notes to say whatever you want about each song.
  var FAVORITES = [
    { title: 'It Had to Be You', artist: 'Frank Sinatra', note: 'The title speaks for itself.' },
    { title: "Who's Loving You", artist: 'Jackson 5', note: 'Listened to this a lot with you.' },
    { title: 'Japanese Denim', artist: 'Daniel Caesar', note: 'Its about our soon to be long lasting relationship' },
    { title: 'Dirty Diana', artist: 'Michael Jackson', note: 'Your favorite Michael J song' },
    { title: 'butterflies.', artist: 'Brent Faiyaz', note: 'That anxious new love feeling I get' },
    { title: "Let's Stay Together", artist: 'Al Green', note: 'You played this, I fell in love, simple' }
  ];

  // The whole shared playlist, in order.
  var PLAYLIST = [
    ['Sweet Love', 'Anita Baker'],
    ['Number One', 'Pharrell Williams & Kanye West'],
    ['BEST INTEREST', 'Tyler, The Creator'],
    ['King Kunta', 'Kendrick Lamar'],
    ['Remember the Time', 'Michael Jackson'],
    ['Forever Yours', 'Brent Faiyaz'],
    ['Chapter Six', 'Kendrick Lamar'],
    ['Half The Plot', 'Lil Tecca'],
    ['A Horse With No Name', 'America'],
    ['Everything She Wants', 'Wham!'],
    ['Sara Smile (A Mike Maurro Mix)', 'Daryl Hall & John Oates & Mike Maurro'],
    ["Who's Loving You", 'Jackson 5'],
    ["j's lullaby (darlin' i'd wait for you)", 'Delaney Bailey'],
    ['After Last Night (with Thundercat & Bootsy Collins)', 'Bruno Mars, Anderson .Paak & Silk Sonic'],
    ['Teenage Dream', 'Stephen Dawes'],
    ['Japanese Denim', 'Daniel Caesar'],
    ['It Had to Be You', 'Frank Sinatra'],
    ["Knockin' On Heaven's Door", 'Bob Dylan'],
    ['Pride and Joy', 'Stevie Ray Vaughan & Double Trouble'],
    ['Just To Keep You Satisfied (Remastered 2003)', 'Marvin Gaye'],
    ['Come & Talk To Me', 'Jodeci'],
    ['Dirty Diana', 'Michael Jackson'],
    ['Ex-Factor', 'Lauryn Hill'],
    ["Let's Stay Together", 'Al Green'],
    ['Tired of Being Alone', 'Al Green'],
    ['Who Knows', 'Daniel Caesar'],
    ['All I Want Is You (feat. J.Cole)', 'Miguel'],
    ['Coming Home', 'Leon Bridges'],
    ["She's My Vision Board", 'My Boy Arlo'],
    ['butterflies.', 'Brent Faiyaz']
  ];

  /* =========================================================
     SMALL HELPERS
     ========================================================= */

  var HEART_PATH = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';
  var HEART_COLORS = ['#f9b4cf', '#f48fb6', '#ec6a9c', '#ffd5e5', '#ff8fb8'];

  var params = new URLSearchParams(window.location.search);
  var testMode = params.get('test'); // ?test=birthday or ?test=normal for previewing
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function rand(min, max) { return min + Math.random() * (max - min); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function isBirthday() {
    if (testMode === 'birthday') return true;
    if (testMode === 'normal') return false;
    var now = new Date();
    return now.getMonth() === BIRTH_MONTH && now.getDate() === BIRTH_DAY;
  }

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* private mode, ignore */ }
  }

  function heartSvg(size, color) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', HEART_PATH);
    path.setAttribute('fill', color);
    svg.appendChild(path);
    return svg;
  }

  /* ---------- floating hearts (intro) ---------- */

  function spawnFloatingHeart(layer) {
    var wrap = make('span', 'float-heart');
    wrap.style.left = rand(0, 100) + '%';
    wrap.style.setProperty('--dur', rand(6, 11).toFixed(1) + 's');
    wrap.style.setProperty('--sway', rand(-50, 50).toFixed(0) + 'px');
    wrap.style.setProperty('--rot', rand(-30, 30).toFixed(0) + 'deg');
    wrap.appendChild(heartSvg(Math.round(rand(16, 52)), pick(HEART_COLORS)));
    layer.appendChild(wrap);
    wrap.addEventListener('animationend', function () { wrap.remove(); });
  }

  /* ---------- burst of hearts ---------- */

  function burst(x, y, count) {
    var layer = $('#fx-layer');
    if (!layer) return;
    for (var i = 0; i < count; i++) {
      var el = make('span', 'burst-heart');
      var angle = rand(0, Math.PI * 2);
      var distance = rand(90, 320);
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.setProperty('--dx', (Math.cos(angle) * distance).toFixed(0) + 'px');
      el.style.setProperty('--dy', (Math.sin(angle) * distance - 70).toFixed(0) + 'px');
      el.style.setProperty('--rot', rand(-40, 40).toFixed(0) + 'deg');
      el.appendChild(heartSvg(Math.round(rand(16, 38)), pick(HEART_COLORS)));
      layer.appendChild(el);
      el.addEventListener('animationend', function (e) { e.currentTarget.remove(); });
    }
  }

  /* =========================================================
     INTRO (only on her birthday)
     ========================================================= */

  var OVAL_SPOTS = [
    { top: 8,  side: 'left',  offset: 5 },
    { top: 20, side: 'right', offset: 5 },
    { top: 31, side: 'left',  offset: 9 },
    { top: 68, side: 'right', offset: 7 },
    { top: 80, side: 'left',  offset: 12 }
  ];

  function runIntro(onDone) {
    var intro = $('#intro');
    var heartsLayer = $('.hearts-layer', intro);
    var ovalsLayer = $('.ovals-layer', intro);
    var title = $('.birthday-title', intro);
    var skip = $('#skip-intro');
    var timers = [];
    var finished = false;

    intro.hidden = false;

    var heartTimer = setInterval(function () { spawnFloatingHeart(heartsLayer); }, reduceMotion ? 1200 : 300);
    for (var i = 0; i < 10; i++) {
      (function (n) { timers.push(setTimeout(function () { spawnFloatingHeart(heartsLayer); }, n * 90)); })(i);
    }

    WORDS.forEach(function (word, index) {
      timers.push(setTimeout(function () {
        var spot = OVAL_SPOTS[index % OVAL_SPOTS.length];
        var oval = make('span', 'oval', word);
        oval.style.top = spot.top + '%';
        oval.style[spot.side] = spot.offset + '%';
        oval.style.setProperty('--r', rand(-5, 5).toFixed(1) + 'deg');
        ovalsLayer.appendChild(oval);
      }, 500 + index * 650));
    });

    timers.push(setTimeout(function () {
      title.classList.add('show');
      burst(window.innerWidth / 2, window.innerHeight / 2, 46);
    }, 4200));
    timers.push(setTimeout(function () {
      burst(window.innerWidth * 0.25, window.innerHeight * 0.55, 24);
      burst(window.innerWidth * 0.75, window.innerHeight * 0.45, 24);
    }, 5600));
    timers.push(setTimeout(finish, 9800));

    function finish() {
      if (finished) return;
      finished = true;
      clearInterval(heartTimer);
      timers.forEach(clearTimeout);
      intro.classList.add('leaving');
      setTimeout(function () {
        intro.hidden = true;
        onDone();
      }, 900);
    }

    skip.addEventListener('click', finish);
  }

  /* =========================================================
     GATE
     ========================================================= */

  function showGate() {
    var gate = $('#gate');
    gate.hidden = false;
    if (isBirthday()) $('#gate-banner').hidden = false;
  }

  function setupGate() {
    var gate = $('#gate');
    var btnMyles = $('#btn-myles');
    var btnRy = $('#btn-ryleigh');
    var slot = $('#ry-slot');
    var hint = $('#gate-hint');
    var title = $('#gate-title');
    var banner = $('#gate-banner');

    var hints = [
      'Nice try.',
      'Still no.',
      'Okay, you know that is not the answer.',
      'It is just going to keep moving.',
      'I can do this all day momma.',
      'The other button is right there beautiful.'
    ];
    var clicks = 0;
    var loose = false;
    var unlocked = false;

    function overlaps(a, b, pad) {
      return !(a.right + pad < b.left || a.left - pad > b.right || a.bottom + pad < b.top || a.top - pad > b.bottom);
    }

    function pickSpot(width, height) {
      var margin = 16;
      var maxX = Math.max(margin, window.innerWidth - width - margin);
      var maxY = Math.max(margin, window.innerHeight - height - margin);
      var avoid = [btnMyles, title, banner].filter(function (el) { return el && !el.hidden; })
        .map(function (el) { return el.getBoundingClientRect(); });
      var fallback = { x: margin, y: margin };
      for (var i = 0; i < 40; i++) {
        var x = rand(margin, maxX);
        var y = rand(margin, maxY);
        var box = { left: x, top: y, right: x + width, bottom: y + height };
        fallback = { x: x, y: y };
        var blocked = avoid.some(function (r) { return overlaps(box, r, 10); });
        if (!blocked) return fallback;
      }
      return fallback;
    }

    // The "Ryleigh loves Myles more" button just hops somewhere new every time it is clicked.
    btnRy.addEventListener('click', function () {
      var rect = btnRy.getBoundingClientRect();
      if (!loose) {
        slot.style.minHeight = rect.height + 'px';
        btnRy.style.width = rect.width + 'px';
        btnRy.style.left = rect.left + 'px';
        btnRy.style.top = rect.top + 'px';
        btnRy.classList.add('is-loose');
        loose = true;
        void btnRy.offsetWidth; // let the browser register the starting spot
      }
      var spot = pickSpot(rect.width, rect.height);
      btnRy.style.left = spot.x + 'px';
      btnRy.style.top = spot.y + 'px';
      hint.textContent = hints[Math.min(clicks, hints.length - 1)];
      clicks += 1;
    });

    window.addEventListener('resize', function () {
      if (!loose) return;
      var rect = btnRy.getBoundingClientRect();
      var x = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - rect.width - 8));
      var y = Math.min(Math.max(8, rect.top), Math.max(8, window.innerHeight - rect.height - 8));
      btnRy.style.left = x + 'px';
      btnRy.style.top = y + 'px';
    });

    // The right answer unlocks the site with the heart animation.
    btnMyles.addEventListener('click', function () {
      if (unlocked) return;
      unlocked = true;
      btnMyles.disabled = true;
      btnRy.disabled = true;
      if (REMEMBER_UNLOCK) storageSet('ryleigh-unlocked', 'yes');
      heartWipe(function () {
        gate.hidden = true;
        revealSite();
      });
    });
  }

  /* ---------- pink heart grows over the screen, then fades away ---------- */

  function heartWipe(onCovered) {
    var wipe = $('#heart-wipe');
    var svg = $('svg', wipe);
    var diagonal = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight);
    var finalScale = (diagonal / 100) * 3; // big enough that the heart covers every corner
    var grow = reduceMotion ? 400 : 1500;

    wipe.style.transition = 'none';
    wipe.style.opacity = '1';
    svg.style.transition = 'none';
    svg.style.transform = 'scale(0)';
    void svg.getBoundingClientRect();

    svg.style.transition = 'transform ' + grow + 'ms cubic-bezier(0.5, 0.05, 0.8, 0.5)';
    svg.style.transform = 'scale(' + finalScale + ')';

    setTimeout(function () {
      onCovered();
      wipe.style.transition = 'opacity 1000ms ease';
      wipe.style.opacity = '0';
    }, grow * 0.8);

    setTimeout(function () {
      svg.style.transition = 'none';
      svg.style.transform = 'scale(0)';
    }, grow + 1200);
  }

  /* =========================================================
     MAIN SITE
     ========================================================= */

  var siteReady = false;

  function revealSite() {
    var site = $('#site');
    $('#hero-title').textContent = isBirthday() ? 'Happy birthday, Ryleigh' : 'You Made It <3, Myles Loves You';
    site.hidden = false;
    window.scrollTo(0, 0);
    if (!siteReady) {
      siteReady = true;
      setupWhisper();
      setupLetterReveal();
    }
    setTimeout(function () { $('#whisper').classList.add('show'); }, 1200);
  }

  /* ---------- rotating words bubble ---------- */

  function setupWhisper() {
    var whisper = $('#whisper');
    var text = $('#whisper-text');
    var lastIndex = 0;
    var ticking = false;

    text.textContent = WORDS[0];

    function update() {
      ticking = false;
      var step = Math.max(window.innerHeight * 0.9, 300);
      var index = Math.floor(window.scrollY / step) % WORDS.length;
      if (index === lastIndex) return;
      lastIndex = index;
      whisper.classList.add('swap');
      setTimeout(function () {
        text.textContent = WORDS[index];
        whisper.classList.remove('swap');
      }, 180);
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    // keep the bubble out of the way while she reads the letter
    var letterSection = $('#letter-section');
    if ('IntersectionObserver' in window) {
      var hider = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          whisper.classList.toggle('away', entry.isIntersecting);
        });
      }, { threshold: 0.2 });
      hider.observe(letterSection);
    }
  }

  /* ---------- letter paragraphs fade in as she reads ---------- */

  function setupLetterReveal() {
    var paragraphs = $$('#letter p');
    if (!('IntersectionObserver' in window)) {
      paragraphs.forEach(function (p) { p.classList.add('in'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    paragraphs.forEach(function (p) { observer.observe(p); });
  }

  /* =========================================================
     INSIDE JOKES
     ========================================================= */

  function setupJokes() {
    // "I miss you" / "I miss you more" back and forth
    var thread = $('#thread');
    var missBtn = $('#miss-btn');
    var roundCount = $('#round-count');
    var herLines = ['I miss you', 'I miss you more', 'I miss you even more', 'I miss you the most', 'I miss you infinity'];
    var myLines = ['I miss you more', 'No, I miss you more', 'Not possible, I miss you more', 'Okay but I miss you more', 'I miss you more, I win'];
    var round = 0;

    function addBubble(who, text) {
      thread.appendChild(make('div', 'bubble bubble--' + who, text));
      while (thread.children.length > 6) thread.removeChild(thread.firstChild);
    }

    missBtn.addEventListener('click', function () {
      missBtn.disabled = true;
      addBubble('her', herLines[round % herLines.length]);
      setTimeout(function () {
        var reply = (round > 0 && (round + 1) % 8 === 0)
          ? 'Okay, we can do this all day'
          : myLines[round % myLines.length];
        addBubble('me', reply);
        round += 1;
        roundCount.textContent = 'Round ' + round;
        missBtn.textContent = herLines[round % herLines.length];
        missBtn.disabled = false;
      }, 650);
    });

    // "I'm hungry" -> "hi hungry"
    var hungryBtn = $('#hungry-btn');
    var hungryReply = $('#hungry-reply');
    hungryBtn.addEventListener('click', function () {
      hungryReply.textContent = 'Hi hungry';
      var layer = $('#fx-layer');
      var snacks = ['\uD83C\uDF57', '\uD83C\uDF5F'];
      var total = reduceMotion ? 6 : 26;
      for (var i = 0; i < total; i++) {
        var snack = make('span', 'food', pick(snacks));
        snack.style.left = rand(2, 94) + '%';
        snack.style.setProperty('--dur', rand(1.8, 3.2).toFixed(1) + 's');
        snack.style.setProperty('--rot', rand(-200, 200).toFixed(0) + 'deg');
        snack.style.animationDelay = rand(0, 0.9).toFixed(2) + 's';
        layer.appendChild(snack);
        snack.addEventListener('animationend', function (e) { e.currentTarget.remove(); });
      }
    });
  }

  /* =========================================================
     POLAROIDS
     ========================================================= */

  function setupPolaroids() {
    $$('.polaroid').forEach(function (card) {
      function toggle() {
        var flipped = card.classList.toggle('flipped');
        card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
      }
      card.addEventListener('click', toggle);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  /* =========================================================
     MUSIC
     ========================================================= */

  function setupMusic() {
    var favTitles = FAVORITES.map(function (f) { return f.title; });
    var favList = $('#favorites');

    FAVORITES.forEach(function (song) {
      var item = make('li', 'track');
      item.appendChild(make('span', 'disc'));
      var info = make('div');
      info.appendChild(make('p', 'track-title', song.title));
      info.appendChild(make('p', 'track-artist', song.artist));
      info.appendChild(make('p', 'track-note', song.note));
      item.appendChild(info);
      favList.appendChild(item);
    });

    var list = $('#playlist');
    PLAYLIST.forEach(function (entry) {
      var item = make('li');
      if (favTitles.indexOf(entry[0]) !== -1) item.className = 'is-fav';
      item.appendChild(make('span', 'song-title', entry[0]));
      item.appendChild(make('span', 'song-artist', entry[1]));
      list.appendChild(item);
    });

    var apple = $('#apple-link');
    if (APPLE_MUSIC_URL) {
      apple.href = APPLE_MUSIC_URL;
      apple.hidden = false;
    }
  }

  /* =========================================================
     LETTER + FINALE
     ========================================================= */

  function setupLetter() {
    var envelope = $('#envelope');
    var wrap = $('#letter-wrap');
    var finaleBtn = $('#finale-btn');
    var finaleMessage = $('#finale-message');
    var opened = false;

    envelope.addEventListener('click', function () {
      if (opened) return;
      opened = true;
      envelope.classList.add('opened');
      envelope.setAttribute('aria-expanded', 'true');
      wrap.classList.add('open');
      setTimeout(function () { envelope.hidden = true; }, 600);
      setTimeout(function () { finaleBtn.hidden = false; }, 1400);
    });

    finaleBtn.addEventListener('click', function () {
      finaleMessage.textContent = isBirthday()
        ? 'Happy birthday, Ryleigh. I love you (more).'
        : 'I love you (more), Ryleigh.';
      finaleMessage.hidden = false;
      finaleBtn.hidden = true;

      var rect = finaleMessage.getBoundingClientRect();
      var cx = window.innerWidth / 2;
      var cy = Math.min(Math.max(rect.top + rect.height / 2, 120), window.innerHeight - 120);
      burst(cx, cy, 60);
      setTimeout(function () { burst(window.innerWidth * 0.25, cy, 30); }, 350);
      setTimeout(function () { burst(window.innerWidth * 0.75, cy, 30); }, 700);

      finaleMessage.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });
  }

  /* =========================================================
     START
     ========================================================= */

  function start() {
    setupGate();
    setupJokes();
    setupPolaroids();
    setupMusic();
    setupLetter();

    var remembered = REMEMBER_UNLOCK && storageGet('ryleigh-unlocked') === 'yes' && !testMode;
    if (remembered) {
      revealSite();
      return;
    }

    if (isBirthday()) {
      runIntro(showGate);
    } else {
      showGate();
    }
  }

  start();
})();
