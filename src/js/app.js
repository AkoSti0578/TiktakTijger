/* Tiktak Tijger - de app zelf: schermen, kaart, typles en uitslag */
(function () {
  'use strict';

  const { WORLDS, LEVELS, levelById, generateText, starsFor, rankFor } = window.TTLevels;
  const Sound = window.TTSound;
  const Store = window.TTStore;
  const KB = window.TTKeyboard;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  let profile = null;

  const PRAISE = ['Goed zo!', 'Super!', 'Wauw!', 'Knap hoor!', 'Toppie!', 'Jij kunt het!', 'Grrroar, goed!',
    'Wat ben jij snel!', 'Ga zo door!', 'Fantastisch!', 'Tiktak, tiktak!', 'Zoef!'];
  const OOPS = ['Oeps!', 'Bijna!', 'Rustig aan...', 'Kijk goed!', 'Geeft niks!'];

  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---------- Schermen ---------- */
  function show(id) {
    $$('.screen').forEach((s) => s.classList.add('hidden'));
    const el = $('#' + id);
    el.classList.remove('hidden');
    el.classList.remove('screen-in');
    void el.offsetWidth;
    el.classList.add('screen-in');
    document.body.dataset.screen = id;
  }

  function modal(id, open) {
    $('#' + id).classList.toggle('hidden', !open);
  }

  function gearFor(p) { return rankFor((p && p.bestCpm) || 0).gear; }

  function tigerInto(el, extraClass, gear) {
    el.innerHTML = window.TTTiger.svg({ gear: gear || gearFor(profile), className: extraClass || 'tiger-idle' });
  }

  /* ---------- Logo ---------- */
  function renderLogo() {
    const text = 'Tiktak Tijger';
    $('.logo').innerHTML = [...text].map((c, i) => c === ' '
      ? '<span class="logo-space"></span>'
      : `<span class="logo-letter" style="animation-delay:${i * 0.08}s;--i:${i}">${c}</span>`).join('');
  }

  /* ---------- Welkom ---------- */
  function showWelcome() {
    const profiles = Store.data.profiles;
    show('screen-welcome');
    tigerInto($('#welcome-tiger'), 'tiger-idle tiger-wave', profiles.length ? gearFor(Store.getProfile(Store.data.lastProfileId)) : []);
    if (profiles.length) {
      $('#new-player').classList.add('hidden');
      $('#pick-player').classList.remove('hidden');
      renderPlayers();
    } else {
      showNewPlayer(false);
    }
  }

  function showNewPlayer(canGoBack) {
    $('#pick-player').classList.add('hidden');
    $('#new-player').classList.remove('hidden');
    $('#back-to-players').classList.toggle('hidden', !canGoBack);
    $('#welcome-bubble').textContent = 'Hoi! Ik ben Tiktak Tijger. Hoe heet jij?';
    const input = $('#name-input');
    input.value = '';
    setTimeout(() => input.focus(), 50);
  }

  function renderPlayers() {
    const list = $('#player-list');
    const profiles = Store.data.profiles.slice().sort((a, b) => (a.id === Store.data.lastProfileId ? -1 : b.id === Store.data.lastProfileId ? 1 : 0));
    list.innerHTML = profiles.map((p) => {
      const stars = totalStars(p);
      return `<button class="player-card" data-id="${p.id}" style="--pc:${p.color}">
        <span class="player-avatar">${esc(p.name.charAt(0).toUpperCase())}</span>
        <span class="player-name">${esc(p.name)}</span>
        <span class="player-stars">⭐ ${stars}</span>
      </button>`;
    }).join('');
    list.querySelectorAll('.player-card').forEach((b) => b.addEventListener('click', () => {
      Sound.unlock(); Sound.click();
      selectProfile(b.dataset.id, true);
    }));
  }

  function selectProfile(id, greet) {
    profile = Store.getProfile(id);
    if (!profile) return showWelcome();
    profile.settings = profile.settings || { sound: true };
    Store.setCurrent(id);
    Sound.setEnabled(profile.settings.sound !== false);
    showMap();
    if (greet) {
      const msg = rand([`Hoi ${profile.name}! Klaar voor een typavontuur?`, `Welkom terug, ${profile.name}! Grrroar!`,
        `Daar ben je weer, ${profile.name}! Zullen we gaan typen?`]);
      mapSay(msg);
    }
  }

  $('#name-form').addEventListener('submit', (e) => {
    e.preventDefault();
    Sound.unlock();
    const name = $('#name-input').value.replace(/\s+/g, ' ').trim();
    if (!name) {
      $('#welcome-bubble').textContent = 'Typ eerst je naam, dan weet ik hoe je heet!';
      $('#name-input').classList.remove('shake'); void $('#name-input').offsetWidth;
      $('#name-input').classList.add('shake');
      Sound.error();
      return;
    }
    const nice = name.charAt(0).toUpperCase() + name.slice(1);
    const p = Store.createProfile(nice);
    Sound.fanfare();
    window.TTConfetti.burst(120);
    selectProfile(p.id, false);
    mapSay(`Hoi ${p.name}! Wat een mooie naam. Ik ga jou helpen met typen. Klik op level 1 om te beginnen!`);
  });
  $('#add-player').addEventListener('click', () => { Sound.click(); showNewPlayer(true); });
  $('#back-to-players').addEventListener('click', () => { Sound.click(); showWelcome(); });

  /* ---------- Kaart ---------- */
  function levelData(p, id) { return (p.levels && p.levels[id]) || null; }
  function totalStars(p) { return Object.values(p.levels || {}).reduce((s, l) => s + (l.stars || 0), 0); }
  function isUnlocked(id) {
    if (id === 1) return true;
    const prev = levelData(profile, id - 1);
    return !!(prev && prev.stars > 0);
  }
  function currentLevelId() {
    let cur = 1;
    for (const lv of LEVELS) if (isUnlocked(lv.id)) cur = lv.id;
    return cur;
  }

  const DECOR = {
    1: ['🌴', '🦜', '🐒', '🌺', '🍌', '🦋'],
    2: ['🏔️', '🦅', '❄️', '🐐', '🌲', '☁️'],
    3: ['🐠', '🐙', '🐳', '🐚', '🦀', '🐬'],
    4: ['🎈', '🌈', '🌻', '🐞', '🎪', '🦄'],
    5: ['🌋', '🔥', '🦖', '💎', '⭐', '🐉']
  };

  function renderTopbar() {
    const rank = rankFor(profile.bestCpm || 0);
    $('#player-badge').innerHTML = `<span class="player-avatar small" style="--pc:${profile.color}">${esc(profile.name.charAt(0).toUpperCase())}</span> ${esc(profile.name)}`;
    $('#rank-badge').innerHTML = `🐯 ${rank.name}`;
    $('#rank-badge').title = `Beste snelheid: ${Math.round(profile.bestCpm || 0)} tekens per minuut`;
    $('#star-count').textContent = `⭐ ${totalStars(profile)} / ${LEVELS.length * 3}`;
  }

  function showMap() {
    show('screen-map');
    renderTopbar();
    const map = $('#map');
    const width = Math.min(960, $('#map-scroll').clientWidth - 40);
    const cur = currentLevelId();
    const points = [];
    let y = 130;
    let html = '';
    let lastWorld = 0;

    LEVELS.forEach((lv, i) => {
      if (lv.world !== lastWorld) {
        const w = WORLDS.find((x) => x.id === lv.world);
        // Wereld-band met titel
        const startY = y;
        html += `<div class="world-title" style="top:${startY}px;--wc:${w.color};--wd:${w.dark}">
          <span class="world-emoji">${w.emoji}</span> Wereld ${w.id}: ${esc(w.name)}</div>`;
        y += 90;
        lastWorld = lv.world;
      }
      const x = width / 2 + Math.sin(i * 1.05) * width * 0.32;
      points.push({ x, y: y + 45, lv });
      y += 130;
    });

    // Achtergrondbanden per wereld
    let bands = '';
    WORLDS.forEach((w) => {
      const pts = points.filter((p) => p.lv.world === w.id);
      const top = pts[0].y - 45 - 100;
      const bottom = pts[pts.length - 1].y + 80;
      bands += `<div class="world-band" style="top:${top}px;height:${bottom - top}px;--wc:${w.color}"></div>`;
      // Versiering
      const emojis = DECOR[w.id];
      for (let k = 0; k < 6; k++) {
        const left = k % 2 === 0 ? 2 + Math.random() * 14 : 84 + Math.random() * 12;
        const t = top + 100 + Math.random() * (bottom - top - 160);
        bands += `<div class="decor" style="left:${left}%;top:${t}px;animation-delay:${Math.random() * 3}s">${emojis[k % emojis.length]}</div>`;
      }
    });

    // Pad als vloeiende lijn
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i];
      const my = (a.y + b.y) / 2;
      d += ` C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`;
    }
    const curPt = points.find((p) => p.lv.id === cur);
    const svg = `<svg class="map-path" width="${width}" height="${y + 40}" viewBox="0 0 ${width} ${y + 40}">
      <path d="${d}" class="path-shadow"/><path d="${d}" class="path-main"/><path d="${d}" class="path-dash"/>
    </svg>`;

    let nodes = '';
    points.forEach(({ x, y: py, lv }) => {
      const ld = levelData(profile, lv.id);
      const unlocked = isUnlocked(lv.id);
      const stars = ld ? ld.stars : 0;
      const w = WORLDS.find((q) => q.id === lv.world);
      const cls = ['level-node', unlocked ? 'unlocked' : 'locked', lv.id === cur ? 'current' : '', stars ? 'done' : '',
        lv.id === LEVELS.length ? 'boss' : ''].join(' ');
      const keys = lv.newKeys.filter((k) => k !== 'shift').slice(0, 4).map((k) => k.toUpperCase()).join(' ');
      nodes += `<button class="${cls}" data-id="${lv.id}" style="left:${x}px;top:${py}px;--wc:${w.color};--wd:${w.dark}" ${unlocked ? '' : 'disabled'}>
        <span class="node-num">${unlocked ? lv.id : '🔒'}</span>
        <span class="node-stars">${[0, 1, 2].map((s) => `<i class="${s < stars ? 'on' : ''}">★</i>`).join('')}</span>
        <span class="node-label">${esc(lv.title)}${keys && lv.type === 'keys' ? '' : ''}</span>
      </button>`;
    });

    const tigerLeft = curPt.x - 215 >= 0 ? curPt.x - 215 : curPt.x + 250;
    const mapTiger = `<div class="map-tiger" style="left:${tigerLeft}px;top:${curPt.y - 80}px">
      <div class="map-bubble hidden" id="map-bubble"></div>
      ${window.TTTiger.svg({ gear: gearFor(profile), className: 'tiger-idle tiger-bounce' })}</div>`;

    map.style.width = width + 'px';
    map.style.height = (y + 40) + 'px';
    map.innerHTML = bands + svg + html + nodes + mapTiger;

    map.querySelectorAll('.level-node.unlocked').forEach((b) => b.addEventListener('click', () => {
      Sound.unlock(); Sound.click();
      startLevel(+b.dataset.id);
    }));

    // Scroll naar het huidige level
    requestAnimationFrame(() => {
      const sc = $('#map-scroll');
      sc.scrollTop = Math.max(0, curPt.y - sc.clientHeight / 2);
    });
  }

  let mapBubbleTimer = null;
  function mapSay(text) {
    const b = $('#map-bubble');
    if (!b) return;
    b.textContent = text;
    b.classList.remove('hidden', 'pop'); void b.offsetWidth; b.classList.add('pop');
    clearTimeout(mapBubbleTimer);
    mapBubbleTimer = setTimeout(() => b.classList.add('hidden'), 7000);
  }

  /* ---------- Typen ---------- */
  let S = null; // huidige sessie
  let parallaxRAF = null;

  function startLevel(id) {
    const level = levelById(id);
    const text = generateText(level, { seed: Date.now() ^ Math.floor(Math.random() * 1e9), name: profile.name });
    S = {
      level, text, index: 0, correct: 0, errors: 0, streak: 0, bestStreak: 0,
      started: false, startTime: 0, endTime: 0, times: [], errorChars: {}, playing: false,
      paused: false, pausedAt: 0, speed: 0, bgOffset: 0, wrongAtIndex: false, finished: false
    };

    show('screen-play');
    $('#play-title').innerHTML = `<span class="lvl-num">${level.id}</span> ${esc(level.title)}`;
    KB.render($('#keyboard'));
    $('#hands').innerHTML = KB.handsSVG();
    renderText();

    const runner = $('#runner');
    runner.innerHTML = window.TTTiger.svg({ gear: gearFor(profile), className: 'tiger-run' });
    if (S.runnerAnim) S.runnerAnim.stop();
    S.runnerAnim = new window.TTTiger.Runner(runner.querySelector('svg'));
    S.runnerAnim.start();
    updateProgress();
    updateSpeedMeter(0);
    speech('');
    $('#caps-warning').classList.add('hidden');
    highlightCurrent();
    startParallax();
    showIntro();
  }

  function renderText() {
    const box = $('#text');
    // Woorden blijven heel; de spatie hoort bij het woord ervoor
    const tokens = S.text.match(/\S+\s?|\s/g) || [];
    let idx = 0;
    box.innerHTML = tokens.map((tok) => {
      const chars = [...tok].map((c) => {
        const html = c === ' ' ? '<span class="ch space" data-i="' + idx + '">&nbsp;</span>'
          : `<span class="ch" data-i="${idx}">${esc(c)}</span>`;
        idx++;
        return html;
      }).join('');
      return `<span class="word">${chars}</span>`;
    }).join('');
    S.charEls = box.querySelectorAll('.ch');
    $('#text-box').scrollTop = 0;
  }

  function showIntro() {
    const level = S.level;
    const cd = $('#countdown');
    const keys = level.newKeys.filter((k) => k !== 'shift');
    const keyChips = level.newKeys.map((k) => {
      if (k === 'shift') return '<span class="chip f-lp">Shift</span>';
      const info = KB.infoFor(k);
      return `<span class="chip f-${info ? info.finger : 'th'}">${esc(k.toUpperCase())}</span>`;
    }).join('');
    const fingerTips = keys.slice(0, 3).map((k) => `<div class="intro-tip">${esc(KB.describe(k))}</div>`).join('');
    cd.innerHTML = `<div class="card intro-card">
      <div class="intro-tiger">${window.TTTiger.svg({ gear: gearFor(profile), className: 'tiger-idle tiger-wave' })}</div>
      <div class="intro-body">
        <div class="intro-level">Level ${level.id}</div>
        <h2>${esc(level.title)}</h2>
        ${keyChips ? `<div class="intro-keys">${keyChips}</div>` : ''}
        <p class="intro-text">${esc(level.intro)}</p>
        ${fingerTips}
        <button class="btn btn-big btn-go" id="btn-ready">Ik ben klaar! <small>(spatie)</small></button>
      </div>
    </div>`;
    cd.classList.remove('hidden');
    S.introOpen = true;
    $('#btn-ready').addEventListener('click', () => { Sound.unlock(); beginCountdown(); });
  }

  function beginCountdown() {
    if (!S || !S.introOpen) return;
    S.introOpen = false;
    const cd = $('#countdown');
    const steps = ['3', '2', '1', 'Typen!'];
    let i = 0;
    const next = () => {
      if (!S || S.finished) return;
      if (i >= steps.length) {
        cd.classList.add('hidden');
        S.playing = true;
        speech(KB.describe(S.text[0]) ? 'Begin maar! ' + KB.describe(S.text[0]) : 'Begin maar!');
        return;
      }
      cd.innerHTML = `<div class="count-num ${i === 3 ? 'go' : ''}">${steps[i]}</div>`;
      Sound.beep(i === 3);
      i++;
      S.countTimer = setTimeout(next, i === 4 ? 600 : 750);
    };
    next();
  }

  function highlightCurrent() {
    S.charEls.forEach((el) => el.classList.remove('current'));
    const el = S.charEls[S.index];
    if (!el) return;
    el.classList.add('current');
    const ch = S.text[S.index];
    KB.highlight($('.kb-area'), ch);
    $('#next-char').textContent = ch === ' ' ? '␣' : ch;
    $('#next-char').classList.toggle('is-space', ch === ' ');
    const info = KB.infoFor(ch);
    $('#next-letter').className = 'next-letter f-' + (info ? info.finger : 'th');
    $('#next-hint').textContent = KB.describe(ch);
    // Huidige regel in beeld houden
    const box = $('#text-box');
    const top = el.offsetTop;
    if (top - box.scrollTop > box.clientHeight - 60 || top < box.scrollTop) {
      box.scrollTo({ top: Math.max(0, top - 10), behavior: 'smooth' });
    }
  }

  function currentCpm() {
    if (!S.started) return 0;
    const now = performance.now();
    const windowMs = Math.min(7000, Math.max(1500, now - S.startTime));
    const recent = S.times.filter((t) => now - t <= windowMs).length;
    return recent / (windowMs / 60000);
  }

  function speedWord(s) {
    if (s < 0.05) return 'klaar?';
    if (s < 0.4) return 'sloom 🐢';
    if (s < 0.75) return 'rustig 🐾';
    if (s < 1.1) return 'snel! 🐯';
    if (s < 1.6) return 'super snel! 🚀';
    return 'ZOEF! ⚡';
  }

  function updateSpeedMeter(s) {
    $('#speed-fill').style.width = Math.min(100, (s / 2) * 100) + '%';
    $('#speed-word').textContent = speedWord(s);
    $('#track').classList.toggle('fast', s >= 1.1);
    $('#track').classList.toggle('turbo', s >= 1.6);
  }

  function updateProgress() {
    const p = S.text.length ? S.index / S.text.length : 0;
    $('#progress-fill').style.width = (p * 100) + '%';
    $('#runner-wrap').style.left = `calc(${4 + p * 74}% )`;
  }

  function startParallax() {
    cancelAnimationFrame(parallaxRAF);
    let last = performance.now();
    let meterTimer = 0;
    const hills = $('.layer-hills'), trees = $('.layer-trees'), ground = $('.layer-ground');
    const loop = (now) => {
      if (!S) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (S.playing && !S.paused) {
        const cpm = currentCpm();
        S.speed = cpm / S.level.target;
        meterTimer += dt;
        if (meterTimer > 0.15) { meterTimer = 0; updateSpeedMeter(S.speed); }
        S.runnerAnim.setSpeed(S.speed);
      } else if (!S.finished) {
        S.runnerAnim.setSpeed(0);
      }
      const v = S.runnerAnim.speed;
      S.bgOffset += v * dt * 160;
      hills.style.backgroundPositionX = -(S.bgOffset * 0.2) + 'px';
      trees.style.backgroundPositionX = -(S.bgOffset * 0.5) + 'px';
      ground.style.backgroundPositionX = -(S.bgOffset) + 'px';
      $('#dust').classList.toggle('on', v > 0.9);
      parallaxRAF = requestAnimationFrame(loop);
    };
    parallaxRAF = requestAnimationFrame(loop);
  }

  let speechTimer = null;
  function speech(text, ms) {
    const el = $('#speech');
    clearTimeout(speechTimer);
    if (!text) { el.classList.remove('show'); return; }
    el.textContent = text;
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    speechTimer = setTimeout(() => el.classList.remove('show'), ms || 2600);
  }

  function showCombo(text) {
    const c = $('#combo');
    c.textContent = text;
    c.classList.remove('show'); void c.offsetWidth; c.classList.add('show');
  }

  function handlePlayKey(e) {
    if (S.introOpen) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); Sound.unlock(); beginCountdown(); }
      if (e.key === 'Escape') { e.preventDefault(); quitLevel(); }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); if (S.playing) pause(); return; }
    if (!S.playing || S.paused) { if (e.key === ' ' || e.key === 'Tab') e.preventDefault(); return; }

    const caps = e.getModifierState && e.getModifierState('CapsLock');
    $('#caps-warning').classList.toggle('hidden', !caps);

    if (e.key === 'Tab' || e.key === ' ' || e.key === "'" || e.key === '/') e.preventDefault();
    if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key.length !== 1) return; // Shift, Dead, Backspace, enz.
    e.preventDefault();

    const expected = S.text[S.index];
    const now = performance.now();
    if (!S.started) { S.started = true; S.startTime = now; }

    if (e.key === expected) {
      S.charEls[S.index].classList.add(S.wrongAtIndex ? 'fixed' : 'ok');
      S.charEls[S.index].classList.remove('wrong-now');
      S.wrongAtIndex = false;
      S.index++;
      S.correct++;
      S.streak++;
      S.bestStreak = Math.max(S.bestStreak, S.streak);
      S.times.push(now);
      Sound.tick();
      KB.flashKey($('.kb-area'), expected.toLowerCase() === expected ? expected : expected.toLowerCase(), true);
      $('#runner').classList.remove('hop'); void $('#runner').offsetWidth; $('#runner').classList.add('hop');

      if (S.streak > 0 && S.streak % 15 === 0) {
        Sound.combo();
        showCombo(`${S.streak} op rij! 🔥`);
        speech(rand(PRAISE));
      } else if (S.correct % 25 === 0) {
        speech(rand(PRAISE));
      }
      updateProgress();
      if (S.index >= S.text.length) return finishLevel();
      highlightCurrent();
    } else {
      S.errors++;
      S.streak = 0;
      S.errorChars[expected] = (S.errorChars[expected] || 0) + 1;
      S.wrongAtIndex = true;
      const el = S.charEls[S.index];
      el.classList.remove('wrong-now'); void el.offsetWidth; el.classList.add('wrong-now');
      Sound.error();
      KB.flashKey($('.kb-area'), e.key.toLowerCase(), false);
      $('#text-box').classList.remove('shake'); void $('#text-box').offsetWidth; $('#text-box').classList.add('shake');
      $('#runner').classList.remove('stumble'); void $('#runner').offsetWidth; $('#runner').classList.add('stumble');
      S.runnerAnim.speed *= 0.5;
      if (caps && expected.toLowerCase() === e.key.toLowerCase()) speech('Caps Lock staat aan!');
      else speech(`${rand(OOPS)} ${KB.describe(expected)}`);
    }
  }

  function pause() {
    if (!S || !S.playing || S.paused) return;
    S.paused = true;
    S.pausedAt = performance.now();
    tigerInto($('#pause-tiger'), 'tiger-idle');
    modal('pause-modal', true);
  }

  function resume() {
    if (!S || !S.paused) return;
    const d = performance.now() - S.pausedAt;
    S.startTime += d;
    S.times = S.times.map((t) => t + d);
    S.paused = false;
    modal('pause-modal', false);
  }

  function quitLevel() {
    if (S) {
      clearTimeout(S.countTimer);
      S.finished = true;
      if (S.runnerAnim) S.runnerAnim.stop();
    }
    cancelAnimationFrame(parallaxRAF);
    S = null;
    modal('pause-modal', false);
    showMap();
  }

  function finishLevel() {
    S.playing = false;
    S.finished = true;
    S.endTime = performance.now();
    const secs = Math.max(1, (S.endTime - S.startTime) / 1000);
    const cpm = Math.round(S.correct / (secs / 60));
    const acc = Math.round((S.correct / (S.correct + S.errors)) * 100);
    const stars = starsFor(S.level, acc, cpm);

    // Tijger sprint naar de finish
    S.runnerAnim.setSpeed(2.6);
    $('#runner-wrap').style.left = '84%';
    KB.highlight($('.kb-area'), null);
    speech(stars ? 'FINISH! 🏁' : 'Finish!');
    Sound.roar();

    // Opslaan
    const rankBefore = rankFor(profile.bestCpm || 0);
    const prev = profile.levels[S.level.id] || { stars: 0, bestCpm: 0, bestAcc: 0, plays: 0 };
    const isNewBest = cpm > (prev.bestCpm || 0) && stars > 0;
    profile.levels[S.level.id] = {
      stars: Math.max(prev.stars || 0, stars),
      bestCpm: stars > 0 ? Math.max(prev.bestCpm || 0, cpm) : prev.bestCpm || 0,
      bestAcc: Math.max(prev.bestAcc || 0, acc),
      plays: (prev.plays || 0) + 1,
      last: new Date().toISOString()
    };
    profile.totalChars = (profile.totalChars || 0) + S.correct;
    // Snelheid telt alleen mee als er netjes getypt is
    if (acc >= 80) profile.bestCpm = Math.max(profile.bestCpm || 0, cpm);
    const rankAfter = rankFor(profile.bestCpm || 0);
    Store.saveNow();

    const result = { level: S.level, cpm, acc, secs, stars, isNewBest, rankUp: rankAfter.index > rankBefore.index ? rankAfter : null,
      unlockedNext: stars > 0 && !prev.stars && S.level.id < LEVELS.length, errorChars: S.errorChars, bestStreak: S.bestStreak };
    setTimeout(() => {
      if (S && S.runnerAnim) S.runnerAnim.stop();
      cancelAnimationFrame(parallaxRAF);
      showResult(result);
    }, 1300);
  }

  /* ---------- Uitslag ---------- */
  let lastResult = null;
  function showResult(r) {
    lastResult = r;
    r.shownAt = performance.now();
    show('screen-result');
    const titles = ['Bijna! Probeer het nog eens 💪', 'Gehaald! 🎉', 'Super goed! 🌟', 'FANTASTISCH! 🏆'];
    $('#result-title').textContent = titles[r.stars];
    $('#result-stars').innerHTML = [0, 1, 2].map((i) => `<span class="big-star" data-i="${i}">★</span>`).join('');
    tigerInto($('#result-tiger'), r.stars ? 'tiger-idle tiger-dance' : 'tiger-idle tiger-sad');
    $('#stat-cpm').textContent = r.cpm;
    $('#stat-acc').textContent = r.acc + '%';
    $('#stat-time').textContent = Math.round(r.secs);
    $('#btn-next').disabled = !(r.stars > 0 && r.level.id < LEVELS.length);
    $('#btn-next').classList.toggle('hidden', r.level.id >= LEVELS.length);

    const extra = $('#rank-up');
    const hard = Object.entries(r.errorChars).sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([c]) => `<span class="chip f-${(KB.infoFor(c) || {}).finger || 'th'}">${c === ' ' ? 'spatie' : esc(c)}</span>`).join(' ');
    let msg = '';
    if (r.rankUp) {
      msg = `<div class="rank-up-title">🎉 Je tijger is nu een <b>${esc(r.rankUp.name)}</b>!</div>
        <div class="rank-up-sub">Hij heeft iets nieuws gekregen. Kijk maar!</div>`;
    } else if (r.stars === 0) {
      msg = `Probeer minder foutjes te maken. Rustig typen is beter dan snel!`;
    } else if (r.stars < 3) {
      msg = r.acc < 93 ? 'Tip: typ heel netjes voor meer sterren!' : `Tip: typ iets sneller voor 3 sterren! (doel: ${r.level.target} tekens per minuut)`;
    } else {
      msg = 'Alle sterren! Jij bent een echte typ-tijger! 🐯';
    }
    if (hard && r.stars < 3) msg += `<div class="hard-letters">Lastige letters: ${hard}</div>`;
    if (r.bestStreak >= 10) msg += `<div class="hard-letters">Langste reeks zonder fout: <b>${r.bestStreak}</b> 🔥</div>`;
    extra.innerHTML = msg;
    extra.classList.remove('hidden');
    extra.classList.toggle('celebrate', !!r.rankUp);

    // Sterren een voor een laten verschijnen
    $$('.big-star').forEach((s, i) => {
      setTimeout(() => {
        if (i < r.stars) {
          s.classList.add('on');
          Sound.star(i);
          const rect = s.getBoundingClientRect();
          window.TTConfetti.burst(40, rect.left + rect.width / 2, rect.top + rect.height / 2);
        } else {
          s.classList.add('off');
        }
      }, 500 + i * 450);
    });

    setTimeout(() => {
      if (r.stars > 0) {
        Sound.fanfare();
        window.TTConfetti.rain(r.stars === 3 ? 2.5 : 1.2);
      } else {
        Sound.sad();
      }
      if (r.rankUp) { setTimeout(() => { Sound.roar(); window.TTConfetti.burst(200); }, 800); }
    }, 500 + 3 * 450);
  }

  $('#btn-again').addEventListener('click', () => { Sound.click(); if (lastResult) startLevel(lastResult.level.id); });
  $('#btn-next').addEventListener('click', () => {
    Sound.click();
    if (lastResult && lastResult.level.id < LEVELS.length) startLevel(lastResult.level.id + 1);
  });
  $('#btn-map').addEventListener('click', () => {
    Sound.click(); showMap();
    if (lastResult && lastResult.unlockedNext) mapSay(`Level ${lastResult.level.id + 1} is open! Kom je?`);
  });

  /* ---------- Pauze ---------- */
  $('#btn-pause').addEventListener('click', () => { Sound.click(); if (S && S.introOpen) quitLevel(); else pause(); });
  $('#btn-resume').addEventListener('click', () => { Sound.click(); resume(); });
  $('#btn-restart').addEventListener('click', () => {
    Sound.click(); const id = S.level.id; modal('pause-modal', false);
    S.finished = true; S.runnerAnim.stop(); startLevel(id);
  });
  $('#btn-quit-level').addEventListener('click', () => { Sound.click(); quitLevel(); });

  /* ---------- Instellingen ---------- */
  function openSettings() {
    $('#set-sound').checked = profile.settings.sound !== false;
    renderReport();
    modal('settings-modal', true);
  }

  function renderReport() {
    const rows = LEVELS.map((lv) => {
      const d = levelData(profile, lv.id);
      return `<tr><td>${lv.id}</td><td>${esc(lv.title)}</td><td>${d ? '★'.repeat(d.stars) + '☆'.repeat(3 - d.stars) : '-'}</td>
        <td>${d ? d.bestCpm : '-'}</td><td>${d ? d.bestAcc + '%' : '-'}</td><td>${d ? d.plays : 0}</td></tr>`;
    }).join('');
    $('#report').innerHTML = `<p><b>${esc(profile.name)}</b> - beste snelheid: ${Math.round(profile.bestCpm || 0)} tekens per minuut
      (${rankFor(profile.bestCpm || 0).name}), totaal ${profile.totalChars || 0} tekens getypt.
      ${profile.balloonHigh ? `Ballonnen record: ${profile.balloonHigh}.` : ''}</p>
      <table class="report"><thead><tr><th>#</th><th>Les</th><th>Sterren</th><th>TPM</th><th>Goed</th><th>Keer</th></tr></thead>
      <tbody>${rows}</tbody></table>`;
  }

  $('#btn-settings').addEventListener('click', () => { Sound.click(); openSettings(); });
  $('#btn-close-settings').addEventListener('click', () => { Sound.click(); modal('settings-modal', false); });
  $('#set-sound').addEventListener('change', (e) => {
    profile.settings.sound = e.target.checked; Sound.setEnabled(e.target.checked); Sound.click(); Store.save();
  });
  $('#btn-fullscreen').addEventListener('click', () => {
    if (window.tiktak && window.tiktak.toggleFullscreen) window.tiktak.toggleFullscreen();
    else if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {});
  });
  $('#btn-switch').addEventListener('click', () => { Sound.click(); modal('settings-modal', false); showWelcome(); });
  $('#btn-exit').addEventListener('click', () => {
    Store.saveNow();
    if (window.tiktak && window.tiktak.quit) window.tiktak.quit(); else window.close();
  });

  let confirmAction = null;
  function confirmBox(text, action) {
    $('#confirm-text').textContent = text;
    confirmAction = action;
    modal('confirm-modal', true);
  }
  $('#confirm-yes').addEventListener('click', () => { modal('confirm-modal', false); if (confirmAction) confirmAction(); });
  $('#confirm-no').addEventListener('click', () => modal('confirm-modal', false));
  $('#btn-reset').addEventListener('click', () => confirmBox(`Alle voortgang van ${profile.name} wissen?`, () => {
    profile.levels = {}; profile.bestCpm = 0; profile.totalChars = 0; profile.balloonHigh = 0;
    Store.saveNow(); modal('settings-modal', false); showMap();
  }));
  $('#btn-delete').addEventListener('click', () => confirmBox(`Speler ${profile.name} helemaal verwijderen?`, () => {
    Store.removeProfile(profile.id); profile = null; modal('settings-modal', false); showWelcome();
  }));

  /* ---------- Ballonnen ---------- */
  function learnedKeys() {
    let keys = ['f', 'j', 'd', 'k'];
    for (const lv of LEVELS) {
      if (lv.type !== 'keys') continue;
      if (isUnlocked(lv.id)) keys = lv.keys.slice();
    }
    return keys;
  }
  $('#btn-balloons').addEventListener('click', () => {
    Sound.unlock(); Sound.click();
    show('screen-balloons');
    window.TTBalloons.open({
      keys: learnedKeys(),
      high: profile.balloonHigh || 0,
      gear: gearFor(profile),
      name: profile.name,
      onHigh: (score) => { profile.balloonHigh = score; Store.saveNow(); }
    });
  });
  $('#btn-balloons-back').addEventListener('click', () => { Sound.click(); window.TTBalloons.close(); showMap(); });

  /* ---------- Toetsen ---------- */
  document.addEventListener('keydown', (e) => {
    const screen = document.body.dataset.screen;
    if (!$('#confirm-modal').classList.contains('hidden')) return;
    if (!$('#settings-modal').classList.contains('hidden')) {
      if (e.key === 'Escape') modal('settings-modal', false);
      return;
    }
    if (!$('#pause-modal').classList.contains('hidden')) {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); resume(); }
      return;
    }
    if (screen === 'screen-play' && S) return handlePlayKey(e);
    if (screen === 'screen-balloons') return window.TTBalloons.key(e);
    if (screen === 'screen-result' && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      // Niet per ongeluk doorklikken terwijl het kind nog aan het typen was
      if (!lastResult || performance.now() - lastResult.shownAt < 2500) return;
      if (!$('#btn-next').disabled && !$('#btn-next').classList.contains('hidden')) $('#btn-next').click();
      else $('#btn-again').click();
    }
  });

  // Klik ergens = audio aanzetten (browsers eisen een eerste interactie)
  document.addEventListener('pointerdown', () => Sound.unlock(), { once: true });

  /* ---------- Opstarten ---------- */
  async function boot() {
    renderLogo();
    await Store.load();
    const last = Store.data.lastProfileId && Store.getProfile(Store.data.lastProfileId);
    showWelcome();
    if (last) {
      // Alleen begroeten; het kind kiest zelf wie er speelt
      $('#pick-player .bubble').textContent = `Welkom terug! Ben jij ${last.name}? Klik op je naam.`;
    }
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (document.body.dataset.screen === 'screen-map' && profile) showMap(); }, 250);
    });
  }

  boot();
})();
