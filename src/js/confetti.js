/* Tiktak Tijger - confetti! */
(function (root) {
  'use strict';
  const COLORS = ['#ff6b6b', '#ffd166', '#06d6a0', '#4cc9f0', '#9b5de5', '#f15bb5', '#ff9f1c'];
  let canvas, c2d, parts = [], running = false;

  function setup() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    document.body.appendChild(canvas);
    c2d = canvas.getContext('2d');
    const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
    resize();
    addEventListener('resize', resize);
  }

  function burst(count, x, y) {
    setup();
    const ox = x == null ? innerWidth / 2 : x;
    const oy = y == null ? innerHeight / 3 : y;
    for (let i = 0; i < (count || 150); i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 6 + Math.random() * 12;
      parts.push({
        x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 8,
        w: 8 + Math.random() * 8, h: 6 + Math.random() * 10,
        r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        color: COLORS[i % COLORS.length], life: 1, shape: Math.random() < 0.3 ? 'circle' : 'rect'
      });
    }
    if (!running) { running = true; requestAnimationFrame(loop); }
  }

  function rain(seconds) {
    const end = performance.now() + (seconds || 2) * 1000;
    const drop = () => {
      burst(12, Math.random() * innerWidth, -20);
      if (performance.now() < end) setTimeout(drop, 120);
    };
    drop();
  }

  function loop() {
    c2d.clearRect(0, 0, canvas.width, canvas.height);
    parts = parts.filter((p) => p.y < canvas.height + 40 && p.life > 0);
    for (const p of parts) {
      p.vy += 0.35; p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= 0.004;
      c2d.save();
      c2d.translate(p.x, p.y); c2d.rotate(p.r);
      c2d.fillStyle = p.color;
      if (p.shape === 'circle') { c2d.beginPath(); c2d.arc(0, 0, p.w / 2.5, 0, Math.PI * 2); c2d.fill(); }
      else c2d.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)));
      c2d.restore();
    }
    if (parts.length) requestAnimationFrame(loop);
    else { running = false; c2d.clearRect(0, 0, canvas.width, canvas.height); }
  }

  root.TTConfetti = { burst, rain };
})(window);
