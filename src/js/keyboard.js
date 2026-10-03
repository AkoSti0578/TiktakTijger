/* Tiktak Tijger - toetsenbord op het scherm met vingerkleuren en handen */
(function (root) {
  'use strict';

  // Vingers: lp = linker pink, lr = linker ringvinger, lm, li, ri, rm, rr, rp, th = duim
  const FINGER_NAMES = {
    lp: 'linker pink', lr: 'linker ringvinger', lm: 'linker middelvinger', li: 'linker wijsvinger',
    ri: 'rechter wijsvinger', rm: 'rechter middelvinger', rr: 'rechter ringvinger', rp: 'rechter pink',
    th: 'duim'
  };

  // Standaard (US-International) toetsenbord zoals op Nederlandse laptops
  const ROWS = [
    [['`', '~', 'lp'], ['1', '!', 'lp'], ['2', '@', 'lr'], ['3', '#', 'lm'], ['4', '$', 'li'], ['5', '%', 'li'],
      ['6', '^', 'ri'], ['7', '&', 'ri'], ['8', '*', 'rm'], ['9', '(', 'rr'], ['0', ')', 'rp'], ['-', '_', 'rp'],
      ['=', '+', 'rp'], ['Backspace', null, 'rp', 'wide2', '⌫']],
    [['Tab', null, 'lp', 'wide15', 'Tab'], ['q', null, 'lp'], ['w', null, 'lr'], ['e', null, 'lm'], ['r', null, 'li'],
      ['t', null, 'li'], ['y', null, 'ri'], ['u', null, 'ri'], ['i', null, 'rm'], ['o', null, 'rr'], ['p', null, 'rp'],
      ['[', '{', 'rp'], [']', '}', 'rp'], ['\\', '|', 'rp', 'wide15']],
    [['CapsLock', null, 'lp', 'wide175', 'Caps'], ['a', null, 'lp'], ['s', null, 'lr'], ['d', null, 'lm'],
      ['f', null, 'li', 'bump'], ['g', null, 'li'], ['h', null, 'ri'], ['j', null, 'ri', 'bump'], ['k', null, 'rm'],
      ['l', null, 'rr'], [';', ':', 'rp'], ["'", '"', 'rp'], ['Enter', null, 'rp', 'wide225', 'Enter']],
    [['ShiftLeft', null, 'lp', 'wide25', 'Shift'], ['z', null, 'lp'], ['x', null, 'lr'], ['c', null, 'lm'],
      ['v', null, 'li'], ['b', null, 'li'], ['n', null, 'ri'], ['m', null, 'ri'], [',', '<', 'rm'], ['.', '>', 'rr'],
      ['/', '?', 'rp'], ['ShiftRight', null, 'rp', 'wide25', 'Shift']],
    [[' ', null, 'th', 'space', 'spatie']]
  ];

  // Teken -> { key, shift, finger }
  const CHAR_MAP = {};
  ROWS.forEach((row) => row.forEach(([base, shifted, finger]) => {
    if (base.length === 1) {
      CHAR_MAP[base] = { key: base, shift: false, finger };
      if (/[a-z]/.test(base)) CHAR_MAP[base.toUpperCase()] = { key: base, shift: true, finger };
    }
    if (shifted) CHAR_MAP[shifted] = { key: base, shift: true, finger };
  }));

  function infoFor(ch) {
    const info = CHAR_MAP[ch];
    if (!info) return null;
    let shiftKey = null;
    if (info.shift) shiftKey = info.finger[0] === 'l' ? 'ShiftRight' : 'ShiftLeft';
    return Object.assign({}, info, { shiftKey, shiftFinger: shiftKey === 'ShiftRight' ? 'rp' : shiftKey ? 'lp' : null });
  }

  function keyId(k) { return 'key-' + k.charCodeAt(0) + '-' + k.length; }

  function render(container) {
    const kb = document.createElement('div');
    kb.className = 'keyboard';
    ROWS.forEach((row) => {
      const r = document.createElement('div');
      r.className = 'kb-row';
      row.forEach(([base, shifted, finger, extra, label]) => {
        const k = document.createElement('div');
        k.className = `kb-key f-${finger} ${extra || ''}`;
        k.id = keyId(base);
        k.dataset.key = base;
        const main = label || (base.length === 1 ? base.toUpperCase() : base);
        k.innerHTML = shifted && !/[a-z]/.test(base)
          ? `<span class="kb-shift">${escapeHtml(shifted)}</span><span class="kb-base">${escapeHtml(main)}</span>`
          : `<span class="kb-main">${escapeHtml(main)}</span>`;
        r.appendChild(k);
      });
      kb.appendChild(r);
    });
    container.innerHTML = '';
    container.appendChild(kb);
    return kb;
  }

  function handsSVG() {
    // Twee simpele handjes, iedere vinger met een eigen klasse
    const hand = (side) => {
      const mirror = side === 'r';
      const fingers = mirror
        ? [['ri', 62, 26, 64], ['rm', 88, 14, 76], ['rr', 114, 22, 68], ['rp', 138, 40, 52]]
        : [['lp', 22, 40, 52], ['lr', 46, 22, 68], ['lm', 72, 14, 76], ['li', 98, 26, 64]];
      const thumbX = mirror ? 20 : 140;
      const thumbRot = mirror ? -40 : 40;
      return `<svg class="hand hand-${side}" viewBox="0 0 180 170">
        ${fingers.map(([f, x, y, h]) => `<rect class="finger finger-${f}" x="${x - 11}" y="${y}" width="22" height="${h + 30}" rx="11"/>`).join('')}
        <rect class="finger finger-th" x="${thumbX - 11}" y="70" width="22" height="62" rx="11" transform="rotate(${thumbRot} ${thumbX} 120)"/>
        <rect class="palm" x="20" y="80" width="140" height="80" rx="34"/>
        ${fingers.map(([f, x, y]) => `<circle class="tip tip-${f}" cx="${x}" cy="${y + 12}" r="6"/>`).join('')}
      </svg>`;
    };
    return `<div class="hands">${hand('l')}${hand('r')}</div>`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Markeer welke toets en vinger nu nodig is
  function highlight(root, ch) {
    root.querySelectorAll('.kb-key.next, .kb-key.next-shift').forEach((k) => k.classList.remove('next', 'next-shift'));
    root.querySelectorAll('.finger.active, .tip.active').forEach((f) => f.classList.remove('active'));
    const info = infoFor(ch);
    if (!info) return null;
    const el = root.querySelector('#' + CSS.escape(keyId(info.key)));
    if (el) el.classList.add('next');
    const mark = (f) => root.querySelectorAll(`.finger-${f}, .tip-${f}`).forEach((x) => x.classList.add('active'));
    mark(info.finger);
    if (info.shiftKey) {
      const s = root.querySelector('#' + CSS.escape(keyId(info.shiftKey)));
      if (s) s.classList.add('next-shift');
      mark(info.shiftFinger);
    }
    return info;
  }

  function flashKey(root, keyChar, good) {
    const info = infoFor(keyChar);
    const id = info ? keyId(info.key) : null;
    const el = id && root.querySelector('#' + CSS.escape(id));
    if (!el) return;
    el.classList.remove('pressed-good', 'pressed-bad');
    void el.offsetWidth;
    el.classList.add(good ? 'pressed-good' : 'pressed-bad');
  }

  function describe(ch) {
    const info = infoFor(ch);
    if (!info) return '';
    const fname = FINGER_NAMES[info.finger];
    if (ch === ' ') return 'Spatie met je duim';
    let keyName = info.key.toUpperCase();
    if (info.key === '.') keyName = 'punt';
    else if (info.key === ',') keyName = 'komma';
    let s = `${keyName} met je ${fname}`;
    if (info.shiftKey) s += ` + Shift met je ${FINGER_NAMES[info.shiftFinger]}`;
    return s;
  }

  root.TTKeyboard = { render, handsSVG, highlight, flashKey, describe, infoFor, FINGER_NAMES };
})(window);
