/* Tiktak Tijger - de mascotte (SVG) en zijn renanimatie */
(function (root) {
  'use strict';

  const ORANGE = '#ff8c1a';
  const ORANGE_DARK = '#e8700c';
  const LINE = '#3b1d0a';
  const CREAM = '#fff4e0';

  function stripes(list) {
    return list.map((d) => `<path d="${d}" fill="${LINE}"/>`).join('');
  }

  function leg(id, x, far) {
    const fill = far ? ORANGE_DARK : ORANGE;
    return `<g class="tg-leg tg-${id}" style="transform-origin:${x + 9}px 128px">
      <rect x="${x}" y="122" width="18" height="50" rx="9" fill="${fill}" stroke="${LINE}" stroke-width="4"/>
      <path d="M${x + 3} 146 h12" stroke="${LINE}" stroke-width="3.5" stroke-linecap="round"/>
      <ellipse cx="${x + 10}" cy="172" rx="13" ry="7" fill="${CREAM}" stroke="${LINE}" stroke-width="4"/>
    </g>`;
  }

  /**
   * Maakt de SVG van Tiktak.
   * gear: lijst met accessoires: bandana, sweatband, sunglasses, cape, crown
   */
  function svg(opts) {
    opts = opts || {};
    const gear = new Set(opts.gear || []);
    const cls = opts.className || '';

    const cape = gear.has('cape') ? `<g class="tg-cape">
        <path d="M152 88 C 110 64, 46 66, 10 92 C 28 106, 14 126, -2 138 C 56 150, 118 134, 152 112 Z"
          fill="#e63946" stroke="${LINE}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M58 96 l10 -8 l4 12 l-14 -4 z M50 100 l-4 22 l14 -10 z" fill="#ffd60a" stroke="#3b1d0a" stroke-width="2"/>
      </g>` : '';

    const bandana = gear.has('bandana') ? `<g class="tg-bandana">
        <path d="M138 112 C 156 128, 186 130, 204 116 L 200 130 C 184 142, 154 140, 136 126 Z"
          fill="#e63946" stroke="${LINE}" stroke-width="3.5" stroke-linejoin="round"/>
        <circle cx="160" cy="128" r="2.5" fill="#fff"/><circle cx="178" cy="131" r="2.5" fill="#fff"/>
        <path class="tg-bandana-tip" d="M142 120 l-20 -4 l6 14 z" fill="#e63946" stroke="${LINE}" stroke-width="3" stroke-linejoin="round"/>
      </g>` : '';

    const sweatband = gear.has('sweatband') && !gear.has('crown') ? `
        <path d="M134 48 C 150 36, 190 36, 206 48 L 204 60 C 188 50, 152 50, 136 60 Z" fill="#4361ee" stroke="${LINE}" stroke-width="3.5"/>
        <path d="M160 46 l6 -2 M176 45 l6 1" stroke="#fff" stroke-width="3" stroke-linecap="round"/>` : '';

    const crown = gear.has('crown') ? `<g class="tg-crown">
        <path d="M144 40 L 150 14 L 162 30 L 170 8 L 178 30 L 190 14 L 196 40 Z" fill="#ffd60a" stroke="${LINE}" stroke-width="3.5" stroke-linejoin="round"/>
        <circle cx="170" cy="30" r="4" fill="#e63946"/><circle cx="154" cy="34" r="3" fill="#4cc9f0"/><circle cx="186" cy="34" r="3" fill="#4cc9f0"/>
      </g>` : '';

    const eyes = gear.has('sunglasses') ? `
        <path d="M140 66 h60" stroke="${LINE}" stroke-width="4"/>
        <path d="M142 64 h24 c0 14 -6 20 -14 20 c-8 0 -10 -8 -10 -20z" fill="#14213d" stroke="${LINE}" stroke-width="3"/>
        <path d="M174 64 h24 c0 14 -2 20 -10 20 c-8 0 -14 -6 -14 -20z" fill="#14213d" stroke="${LINE}" stroke-width="3"/>
        <path d="M148 68 l6 0 M180 68 l6 0" stroke="#7fd1ff" stroke-width="3" stroke-linecap="round"/>` : `
        <g class="tg-eyes">
          <ellipse cx="155" cy="70" rx="10" ry="12" fill="#fff" stroke="${LINE}" stroke-width="3"/>
          <ellipse cx="185" cy="70" rx="10" ry="12" fill="#fff" stroke="${LINE}" stroke-width="3"/>
          <circle class="tg-pupil" cx="158" cy="72" r="5.5" fill="${LINE}"/>
          <circle class="tg-pupil" cx="188" cy="72" r="5.5" fill="${LINE}"/>
          <circle cx="160" cy="69" r="2" fill="#fff"/><circle cx="190" cy="69" r="2" fill="#fff"/>
        </g>
        <path d="M144 54 l18 4 M196 54 l-18 4" stroke="${LINE}" stroke-width="4" stroke-linecap="round"/>`;

    return `<svg class="tiger ${cls}" viewBox="0 0 240 190" xmlns="http://www.w3.org/2000/svg" aria-label="Tiktak Tijger">
      <ellipse class="tg-shadow" cx="115" cy="180" rx="80" ry="8" fill="rgba(0,0,0,0.18)"/>
      ${cape}
      <g class="tg-body-group">
        <g class="tg-tail" style="transform-origin:58px 110px">
          <path d="M58 110 C 30 108, 18 84, 30 60 C 36 48, 50 46, 54 56" fill="none" stroke="${LINE}" stroke-width="17" stroke-linecap="round"/>
          <path d="M58 110 C 30 108, 18 84, 30 60 C 36 48, 50 46, 54 56" fill="none" stroke="${ORANGE}" stroke-width="10" stroke-linecap="round"/>
          <path d="M28 88 l10 -2 M26 72 l10 2" stroke="${LINE}" stroke-width="4" stroke-linecap="round"/>
          <circle cx="53" cy="55" r="6" fill="${LINE}"/>
        </g>
        ${leg('leg-bf', 70, true)}
        ${leg('leg-ff', 132, true)}
        <g class="tg-torso">
          <ellipse cx="110" cy="118" rx="62" ry="34" fill="${ORANGE}" stroke="${LINE}" stroke-width="4"/>
          <ellipse cx="114" cy="134" rx="40" ry="14" fill="${CREAM}"/>
          ${stripes([
            'M76 88 q6 14 0 26 q-8 -12 0 -26z',
            'M98 85 q7 16 0 30 q-9 -14 0 -30z',
            'M120 85 q7 16 0 30 q-9 -14 0 -30z',
            'M60 104 q10 6 8 18 q-12 -4 -8 -18z'
          ])}
        </g>
        ${leg('leg-bn', 84, false)}
        ${leg('leg-fn', 146, false)}
        ${bandana}
        <g class="tg-head" style="transform-origin:170px 110px">
          <circle cx="144" cy="40" r="15" fill="${ORANGE}" stroke="${LINE}" stroke-width="4"/>
          <circle cx="144" cy="40" r="7" fill="#ffadc6"/>
          <circle cx="196" cy="40" r="15" fill="${ORANGE}" stroke="${LINE}" stroke-width="4"/>
          <circle cx="196" cy="40" r="7" fill="#ffadc6"/>
          <path d="M126 80 C 122 50, 146 34, 170 34 C 194 34, 218 50, 214 80 C 212 104, 194 116, 170 116 C 146 116, 128 104, 126 80 Z"
            fill="${ORANGE}" stroke="${LINE}" stroke-width="4"/>
          <path d="M128 84 l-12 4 l12 6 l-10 6 l14 2 C 140 112, 156 118, 170 118 C 184 118, 200 112, 206 102 l14 -2 l-10 -6 l12 -6 l-12 -4
            C 206 98, 190 104, 170 104 C 150 104, 134 98, 128 84 Z" fill="${CREAM}" stroke="${LINE}" stroke-width="3.5" stroke-linejoin="round"/>
          ${stripes([
            'M162 36 q8 0 8 0 q-2 12 -4 14 q-2 -2 -4 -14z',
            'M172 36 q8 0 8 0 q-2 10 -4 12 q-2 -2 -4 -12z',
            'M152 38 q6 -1 6 -1 q0 9 -2 11 q-3 -3 -4 -10z',
            'M128 70 q10 2 14 6 q-10 2 -14 -2z',
            'M212 70 q-10 2 -14 6 q10 2 14 -2z'
          ])}
          ${sweatband}
          ${eyes}
          <ellipse cx="170" cy="94" rx="24" ry="15" fill="#fff" stroke="${LINE}" stroke-width="3"/>
          <path d="M162 86 h16 c0 6 -4 9 -8 9 c-4 0 -8 -3 -8 -9z" fill="#ff5d8f" stroke="${LINE}" stroke-width="3" stroke-linejoin="round"/>
          <path class="tg-mouth" d="M170 95 v5 M158 100 q6 8 12 0 q6 8 12 0" fill="none" stroke="${LINE}" stroke-width="3" stroke-linecap="round"/>
          <path class="tg-tongue" d="M164 104 q6 10 12 0 z" fill="#ff5d8f" stroke="${LINE}" stroke-width="2.5"/>
          <circle cx="152" cy="96" r="1.8" fill="${LINE}"/><circle cx="188" cy="96" r="1.8" fill="${LINE}"/>
          <circle cx="146" cy="92" r="1.8" fill="${LINE}"/><circle cx="194" cy="92" r="1.8" fill="${LINE}"/>
          <ellipse cx="140" cy="88" rx="6" ry="4" fill="#ff9eb5" opacity="0.6"/>
          <ellipse cx="200" cy="88" rx="6" ry="4" fill="#ff9eb5" opacity="0.6"/>
          ${crown}
        </g>
      </g>
    </svg>`;
  }

  /**
   * Laat een tijger-SVG rennen op basis van een snelheid (0 = stil, 1 = normaal, 3 = ZOEF).
   * Dit gebeurt met requestAnimationFrame zodat versnellen soepel verloopt.
   */
  class Runner {
    constructor(svgEl) {
      this.el = svgEl;
      this.legs = {
        bf: svgEl.querySelector('.tg-leg-bf'), ff: svgEl.querySelector('.tg-leg-ff'),
        bn: svgEl.querySelector('.tg-leg-bn'), fn: svgEl.querySelector('.tg-leg-fn')
      };
      this.body = svgEl.querySelector('.tg-body-group');
      this.head = svgEl.querySelector('.tg-head');
      this.tail = svgEl.querySelector('.tg-tail');
      this.cape = svgEl.querySelector('.tg-cape');
      this.speed = 0;
      this.target = 0;
      this.phase = 0;
      this.idle = 0;
      this.running = false;
      this._tick = this._tick.bind(this);
    }

    setSpeed(s) { this.target = Math.max(0, Math.min(3.2, s)); }

    start() {
      if (this.running) return;
      this.running = true;
      this.last = performance.now();
      requestAnimationFrame(this._tick);
    }

    stop() { this.running = false; }

    _tick(now) {
      if (!this.running) return;
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      // Soepel naar de doelsnelheid toe bewegen
      this.speed += (this.target - this.speed) * Math.min(1, dt * 3);
      const s = this.speed;
      this.phase += dt * (2 + s * 7);
      this.idle += dt;

      const swing = Math.min(1, s) * 34 + Math.max(0, s - 1) * 6;
      const p = this.phase;
      const a = Math.sin(p) * swing;
      const b = Math.sin(p + Math.PI) * swing;
      this.legs.fn.style.transform = `rotate(${a}deg)`;
      this.legs.bf.style.transform = `rotate(${a * 0.9}deg)`;
      this.legs.ff.style.transform = `rotate(${b}deg)`;
      this.legs.bn.style.transform = `rotate(${b * 0.9}deg)`;

      const bob = s > 0.05 ? Math.abs(Math.sin(p)) * -6 * Math.min(1.4, s) : Math.sin(this.idle * 2) * 1.5;
      const lean = Math.min(10, s * 4);
      this.body.style.transform = `translateY(${bob}px) rotate(${lean * 0.3}deg)`;
      this.body.style.transformOrigin = '120px 150px';
      this.head.style.transform = `rotate(${Math.sin(p * 0.5) * (2 + s)}deg)`;
      this.tail.style.transform = `rotate(${Math.sin(this.idle * (2 + s * 3)) * (8 + s * 6) - s * 8}deg)`;
      if (this.cape) {
        this.cape.style.transformOrigin = '150px 100px';
        this.cape.style.transform = `skewY(${Math.sin(p * 2) * 3}deg) scaleX(${0.8 + Math.min(0.4, s * 0.15)})`;
      }
      requestAnimationFrame(this._tick);
    }
  }

  root.TTTiger = { svg, Runner };
})(window);
