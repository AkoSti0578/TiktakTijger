/* Tiktak Tijger - mini-spel: ballonnen knallen */
(function (root) {
  'use strict';
  const Sound = root.TTSound;
  const COLORS = ['#ff6b6b', '#ffd166', '#06d6a0', '#4cc9f0', '#9b5de5', '#f15bb5', '#ff9f1c'];

  let opts = null;
  let G = null;
  const $ = (s) => document.querySelector(s);

  function open(o) {
    opts = o;
    stop();
    $('#balloon-tiger').innerHTML = root.TTTiger.svg({ gear: o.gear, className: 'tiger-idle tiger-bounce' });
    $('#balloon-msg-title').textContent = 'Ballonnen knallen!';
    $('#balloon-msg').innerHTML = `Typ de letter op de ballon om hem te laten knallen.<br>Laat er niet meer dan 3 wegvliegen!<br>
      <small>Jouw record: <b>${o.high}</b></small>`;
    $('#balloon-start').textContent = 'Start! 🎈';
    $('#balloon-overlay').classList.remove('hidden');
    $('#balloon-score').textContent = '0';
    $('#balloon-lives').innerHTML = '❤️❤️❤️';
    $('#balloon-field').querySelectorAll('.balloon, .pop-burst').forEach((b) => b.remove());
  }

  function start() {
    stop();
    $('#balloon-overlay').classList.add('hidden');
    $('#balloon-field').querySelectorAll('.balloon, .pop-burst').forEach((b) => b.remove());
    G = { score: 0, lives: 3, balloons: [], spawnIn: 0.3, elapsed: 0, last: performance.now(), running: true };
    renderHud();
    G.raf = requestAnimationFrame(loop);
  }

  function stop() {
    if (G) { G.running = false; cancelAnimationFrame(G.raf); }
  }

  function close() { stop(); G = null; }

  function renderHud() {
    $('#balloon-score').textContent = G.score;
    $('#balloon-lives').innerHTML = '❤️'.repeat(G.lives) + '🤍'.repeat(Math.max(0, 3 - G.lives));
  }

  function spawn() {
    const field = $('#balloon-field');
    const letter = opts.keys[Math.floor(Math.random() * opts.keys.length)];
    const el = document.createElement('div');
    el.className = 'balloon';
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    el.style.setProperty('--bc', color);
    el.innerHTML = `<div class="balloon-body"><span>${letter}</span></div><div class="balloon-string"></div>`;
    const w = field.clientWidth;
    const x = 60 + Math.random() * (w - 180);
    el.style.left = x + 'px';
    field.appendChild(el);
    // Snelheid groeit langzaam mee met de tijd
    const speed = 45 + Math.min(110, G.elapsed * 1.6) + Math.random() * 20;
    G.balloons.push({ el, letter, y: field.clientHeight + 20, speed, wobble: Math.random() * 6, x });
  }

  function loop(now) {
    if (!G || !G.running) return;
    const dt = Math.min(0.05, (now - G.last) / 1000);
    G.last = now;
    G.elapsed += dt;
    G.spawnIn -= dt;
    if (G.spawnIn <= 0) {
      spawn();
      G.spawnIn = Math.max(0.7, 2.0 - G.elapsed * 0.02);
    }
    for (const b of G.balloons.slice()) {
      b.y -= b.speed * dt;
      const sway = Math.sin(now / 500 + b.wobble) * 12;
      b.el.style.transform = `translate(${sway}px, ${b.y}px)`;
      if (b.y < -150) {
        b.el.remove();
        G.balloons.splice(G.balloons.indexOf(b), 1);
        G.lives--;
        Sound.error();
        renderHud();
        if (G.lives <= 0) return gameOver();
      }
    }
    G.raf = requestAnimationFrame(loop);
  }

  function gameOver() {
    G.running = false;
    G.balloons.forEach((b) => b.el.classList.add('fly-away'));
    const isRecord = G.score > opts.high;
    if (isRecord) {
      opts.high = G.score;
      opts.onHigh(G.score);
      Sound.fanfare();
      root.TTConfetti.rain(2);
    } else {
      Sound.sad();
    }
    $('#balloon-msg-title').textContent = isRecord ? 'NIEUW RECORD! 🏆' : 'Klaar!';
    $('#balloon-msg').innerHTML = `Je hebt <b>${G.score}</b> ballonnen geknald!<br><small>Jouw record: <b>${opts.high}</b></small>`;
    $('#balloon-start').textContent = 'Nog een keer! 🎈';
    setTimeout(() => $('#balloon-overlay').classList.remove('hidden'), 700);
  }

  function key(e) {
    if (!G || !G.running) {
      if ((e.key === ' ' || e.key === 'Enter') && !$('#balloon-overlay').classList.contains('hidden')) {
        e.preventDefault();
        start();
      }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); stop(); open(opts); return; }
    if (e.repeat || e.key.length !== 1) return;
    e.preventDefault();
    const k = e.key.toLowerCase();
    // De hoogste ballon met deze letter knalt
    const targets = G.balloons.filter((b) => b.letter === k).sort((a, b) => a.y - b.y);
    if (!targets.length) { Sound.error(); return; }
    const b = targets[0];
    G.balloons.splice(G.balloons.indexOf(b), 1);
    const rect = b.el.getBoundingClientRect();
    const fieldRect = $('#balloon-field').getBoundingClientRect();
    const burst = document.createElement('div');
    burst.className = 'pop-burst';
    burst.style.left = (rect.left - fieldRect.left + rect.width / 2) + 'px';
    burst.style.top = (rect.top - fieldRect.top + 50) + 'px';
    burst.style.setProperty('--bc', b.el.style.getPropertyValue('--bc'));
    burst.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><b>+1</b>';
    $('#balloon-field').appendChild(burst);
    setTimeout(() => burst.remove(), 700);
    b.el.remove();
    Sound.pop();
    G.score++;
    renderHud();
    const t = $('#balloon-tiger');
    t.classList.remove('cheer'); void t.offsetWidth; t.classList.add('cheer');
  }

  root.TTBalloons = { open, start, close, key };
  document.getElementById('balloon-start').addEventListener('click', () => { Sound.unlock(); start(); });
})(window);
