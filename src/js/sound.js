/* Tiktak Tijger - geluidjes, allemaal live gemaakt met de Web Audio API (geen bestanden nodig) */
(function (root) {
  'use strict';
  let ctx = null;
  let enabled = true;
  let tikTak = false;
  let noiseBuf = null;

  function ac() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, type, vol, slideTo) {
    const c = ac();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, c.currentTime + start);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + start + dur);
    g.gain.setValueAtTime(0.0001, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, c.currentTime + start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    o.connect(g).connect(c.destination);
    o.start(c.currentTime + start);
    o.stop(c.currentTime + start + dur + 0.05);
  }

  function noise(start, dur, freq, vol) {
    const c = ac();
    const src = c.createBufferSource();
    src.buffer = noiseBuf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = 3;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    src.connect(f).connect(g).connect(c.destination);
    src.start(c.currentTime + start);
    src.stop(c.currentTime + start + dur + 0.02);
  }

  const S = {
    setEnabled(v) { enabled = !!v; },
    isEnabled() { return enabled; },
    unlock() { try { ac(); } catch (e) { /* geen audio */ } },
    // Het typische tik-tak geluid: afwisselend hoog en laag
    tick() {
      if (!enabled) return;
      tikTak = !tikTak;
      noise(0, 0.045, tikTak ? 3200 : 2300, 0.5);
      tone(tikTak ? 1800 : 1300, 0, 0.03, 'square', 0.03);
    },
    error() {
      if (!enabled) return;
      tone(220, 0, 0.22, 'sawtooth', 0.08, 110);
      tone(180, 0.05, 0.2, 'sine', 0.12, 90);
    },
    pop() {
      if (!enabled) return;
      noise(0, 0.08, 900, 0.7);
      tone(600, 0, 0.12, 'sine', 0.15, 1400);
    },
    star(i) {
      if (!enabled) return;
      const base = [784, 988, 1175][i % 3];
      tone(base, 0, 0.35, 'triangle', 0.18);
      tone(base * 2, 0.05, 0.3, 'sine', 0.06);
    },
    combo() {
      if (!enabled) return;
      [660, 880, 1320].forEach((f, i) => tone(f, i * 0.06, 0.12, 'triangle', 0.1));
    },
    beep(high) {
      if (!enabled) return;
      tone(high ? 1046 : 523, 0, high ? 0.4 : 0.18, 'square', 0.06);
    },
    click() {
      if (!enabled) return;
      tone(900, 0, 0.06, 'triangle', 0.12, 1300);
    },
    fanfare() {
      if (!enabled) return;
      const notes = [523, 659, 784, 1046, 784, 1046];
      const times = [0, 0.12, 0.24, 0.36, 0.52, 0.62];
      notes.forEach((f, i) => {
        tone(f, times[i], i === notes.length - 1 ? 0.7 : 0.16, 'square', 0.07);
        tone(f / 2, times[i], 0.16, 'triangle', 0.08);
      });
    },
    sad() {
      if (!enabled) return;
      [392, 370, 349, 330].forEach((f, i) => tone(f, i * 0.2, 0.25, 'triangle', 0.1));
    },
    roar() {
      if (!enabled) return;
      noise(0, 0.6, 300, 0.6);
      tone(140, 0, 0.6, 'sawtooth', 0.08, 70);
    }
  };

  // Spraak: de tijger praat (Nederlandse stem van Windows, als die er is)
  let voice = null;
  let voiceEnabled = true;
  function findVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = speechSynthesis.getVoices();
    voice = voices.find((v) => /^nl(-|_)NL/i.test(v.lang)) || voices.find((v) => /^nl/i.test(v.lang)) || null;
    return voice;
  }
  if ('speechSynthesis' in window) {
    findVoice();
    speechSynthesis.onvoiceschanged = findVoice;
  }

  const Voice = {
    available() { return !!(voice || findVoice()); },
    setEnabled(v) { voiceEnabled = !!v; if (!v) this.stop(); },
    isEnabled() { return voiceEnabled; },
    say(text) {
      if (!voiceEnabled || !this.available()) return;
      try {
        speechSynthesis.cancel();
        // Emoji niet voorlezen
        const clean = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '');
        const u = new SpeechSynthesisUtterance(clean);
        u.voice = voice;
        u.lang = voice.lang;
        u.rate = 0.95;
        u.pitch = 1.15;
        speechSynthesis.speak(u);
      } catch (e) { /* negeren */ }
    },
    stop() { try { speechSynthesis.cancel(); } catch (e) { /* */ } }
  };

  root.TTSound = S;
  root.TTVoice = Voice;
})(window);
