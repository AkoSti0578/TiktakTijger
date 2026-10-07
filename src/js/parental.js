/* Tiktak Tijger - ouder-timer: pincode, timer instellen, waarschuwingen en slot */
(function (root) {
  'use strict';

  const $ = (s) => document.querySelector(s);

  /* ---------- Verbinding met het hoofdproces (of een nep-versie in de browser) ---------- */
  function browserFallback() {
    // Alleen voor testen buiten Windows: zelfde gedrag, maar opgeslagen in localStorage.
    const KEY = 'tiktak-parent';
    const listeners = {};
    let st;
    try { st = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { st = null; }
    st = st || { pin: null, endsAt: null, minutes: 0, locked: false };
    let timer = null;
    let warnTimer = null;
    const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* */ } };
    const emit = (ev, d) => (listeners[ev] || []).forEach((cb) => cb(d));
    const hash = async (pin) => {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('tiktak:' + pin));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    };
    const active = () => !!st.endsAt && !st.locked;
    const status = () => ({ hasPin: !!st.pin, endsAt: active() ? st.endsAt : null, minutes: st.minutes, locked: !!st.locked, now: Date.now() });
    const check = async (pin) => (st.pin && (await hash(pin)) === st.pin ? { ok: true } : { ok: false, error: st.pin ? 'wrong' : 'nopin' });
    const expire = () => {
      st.endsAt = null; st.locked = true; persist();
      emit('parent:expired'); emit('parent:changed', status());
    };
    const arm = () => {
      clearTimeout(timer); clearTimeout(warnTimer);
      if (!active()) return;
      const left = st.endsAt - Date.now();
      if (left <= 0) return expire();
      timer = setTimeout(expire, left);
      if (left > 15000) warnTimer = setTimeout(() => emit('parent:warn'), left - 15000);
    };
    if (st.endsAt && !st.locked && Date.now() >= st.endsAt) { st.endsAt = null; st.locked = true; persist(); }
    setTimeout(arm, 0);
    return {
      status: async () => status(),
      createPin: async (pin) => {
        if (st.pin) return { ok: false, error: 'exists' };
        if (!/^\d{4,6}$/.test(pin)) return { ok: false, error: 'invalid' };
        st.pin = await hash(pin); persist(); return { ok: true, status: status() };
      },
      verify: check,
      changePin: async (oldPin, newPin) => {
        const c = await check(oldPin); if (!c.ok) return c;
        if (!/^\d{4,6}$/.test(newPin)) return { ok: false, error: 'invalid' };
        st.pin = await hash(newPin); persist(); return { ok: true };
      },
      startTimer: async (pin, minutes) => {
        const c = await check(pin); if (!c.ok) return c;
        st.minutes = minutes; st.endsAt = Date.now() + minutes * 60000; st.locked = false; persist(); arm();
        emit('parent:changed', status()); return { ok: true, status: status() };
      },
      addTime: async (pin, minutes) => {
        const c = await check(pin); if (!c.ok) return c;
        if (!active()) return { ok: false, error: 'minutes' };
        st.endsAt += minutes * 60000; persist(); arm();
        emit('parent:changed', status()); return { ok: true, status: status() };
      },
      stopTimer: async (pin) => {
        const c = await check(pin); if (!c.ok) return c;
        st.endsAt = null; st.locked = false; persist(); arm();
        emit('parent:changed', status()); return { ok: true, status: status() };
      },
      on: (ev, cb) => { (listeners[ev] = listeners[ev] || []).push(cb); }
    };
  }

  const api = (root.tiktak && root.tiktak.parent) || browserFallback();

  /* ---------- Toestand ---------- */
  let st = { hasPin: false, endsAt: null, minutes: 0, locked: false };
  let offset = 0; // verschil tussen klok hoofdproces en pagina
  let pin = null; // alleen in het geheugen zolang het ouderscherm open is
  let warned5 = false;
  let tickTimer = null;
  const FINAL_MS = 15 * 1000; // aftelscherm in de laatste 15 seconden

  function remaining() { return st.endsAt ? st.endsAt - (Date.now() + offset) : null; }
  function fmt(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  }

  function apply(newStatus) {
    if (!newStatus) return;
    const hadEnd = st.endsAt;
    st = newStatus;
    offset = (newStatus.now || Date.now()) - Date.now();
    if (st.endsAt !== hadEnd) warned5 = false;
    render();
  }

  function render() {
    const badge = $('#timer-badge');
    const left = remaining();
    if (st.endsAt && left > 0) {
      badge.classList.remove('hidden');
      $('#timer-badge-time').textContent = fmt(left);
      badge.classList.toggle('low', left <= 5 * 60000);
      if (left <= 5 * 60000 && !warned5 && left > FINAL_MS) {
        warned5 = true;
        toast('⏰ Nog 5 minuten speeltijd!');
      }
      if (left <= FINAL_MS) showFinalMinute(left);
      else hideOverlay('final');
    } else {
      badge.classList.add('hidden');
      hideOverlay('final');
    }
    if (st.locked) showLocked(); else hideOverlay('locked');
    renderPanel();
  }

  function startTicking() {
    clearInterval(tickTimer);
    tickTimer = setInterval(render, 1000);
  }

  /* ---------- Meldingen & overlays ---------- */
  function toast(text) {
    const t = $('#parent-toast');
    t.textContent = text;
    t.classList.remove('hidden', 'show'); void t.offsetWidth; t.classList.add('show');
    if (root.TTSound) root.TTSound.beep(true);
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.add('hidden'), 6000);
  }

  function showFinalMinute(left) {
    const o = $('#timeup-overlay');
    o.classList.remove('hidden');
    o.dataset.mode = 'final';
    $('#timeup-title').textContent = 'De speeltijd is bijna om!';
    $('#timeup-count').textContent = Math.max(0, Math.ceil(left / 1000));
    $('#timeup-count').classList.remove('hidden');
    $('#timeup-text').textContent = 'Daarna gaat de laptop uit. Tot de volgende keer, typ-tijger! 🐯';
    $('#timeup-parent').textContent = '🔒 Ouder: tijd erbij';
  }

  function showLocked(shuttingDown) {
    const o = $('#timeup-overlay');
    o.classList.remove('hidden');
    o.dataset.mode = 'locked';
    $('#timeup-count').classList.add('hidden');
    if (shuttingDown) {
      $('#timeup-title').textContent = 'De speeltijd is op!';
      $('#timeup-text').textContent = 'De laptop gaat nu uit. Goed gedaan vandaag! 👋';
    } else if (!o.dataset.shutdown) {
      $('#timeup-title').textContent = 'De speeltijd is op!';
      $('#timeup-text').textContent = 'Vraag papa, mama of de juf om een nieuwe speeltijd.';
    }
    $('#timeup-parent').textContent = '🔒 Ouder';
  }

  function hideOverlay(mode) {
    const o = $('#timeup-overlay');
    if (o.dataset.mode === mode) { o.classList.add('hidden'); o.dataset.mode = ''; }
  }

  /* ---------- Ouderscherm ---------- */
  function openPanel() {
    pin = null;
    $('#parent-modal').classList.remove('hidden');
    $('#parent-error').textContent = '';
    showStep(st.hasPin ? 'enter' : 'create');
  }

  function closePanel() {
    pin = null;
    $('#parent-modal').classList.add('hidden');
    ['#pin-new', '#pin-new2', '#pin-enter', '#pin-old', '#pin-change'].forEach((s) => { $(s).value = ''; });
  }

  function showStep(step) {
    ['create', 'enter', 'timer'].forEach((s) => $('#parent-step-' + s).classList.toggle('hidden', s !== step));
    $('#parent-error').textContent = '';
    const focus = { create: '#pin-new', enter: '#pin-enter', timer: null }[step];
    if (focus) setTimeout(() => $(focus).focus(), 50);
    renderPanel();
  }

  function renderPanel() {
    if ($('#parent-step-timer').classList.contains('hidden')) return;
    const left = remaining();
    let txt;
    if (st.locked) txt = '🔒 De speeltijd is op. Start een nieuwe timer of ontgrendel de app.';
    else if (st.endsAt && left > 0) txt = `⏱️ Timer loopt: nog <b>${fmt(left)}</b> (ingesteld op ${st.minutes} min).`;
    else txt = 'Er loopt geen timer. Het kind kan onbeperkt spelen.';
    $('#parent-status').innerHTML = txt;
    const active = !!(st.endsAt && left > 0);
    $('#btn-add-time').classList.toggle('hidden', !active);
    $('#btn-stop-timer').textContent = st.locked ? '🔓 Ontgrendelen zonder timer' : '⏹️ Timer stoppen';
    $('#btn-stop-timer').classList.toggle('hidden', !active && !st.locked);
  }

  function errorText(res) {
    switch (res && res.error) {
      case 'wrong': return `Verkeerde pincode.${res.left ? ` Nog ${res.left} pogingen.` : ''}`;
      case 'blocked': return `Te vaak fout. Probeer het over ${res.wait} seconden opnieuw.`;
      case 'invalid': return 'Een pincode bestaat uit 4 tot 6 cijfers.';
      case 'minutes': return 'Kies een tijd tussen 1 minuut en 8 uur.';
      case 'exists': return 'Er is al een pincode.';
      default: return 'Er ging iets mis.';
    }
  }

  async function onCreate(e) {
    e.preventDefault();
    const a = $('#pin-new').value.trim();
    const b = $('#pin-new2').value.trim();
    if (!/^\d{4,6}$/.test(a)) { $('#parent-error').textContent = 'Een pincode bestaat uit 4 tot 6 cijfers.'; return; }
    if (a !== b) { $('#parent-error').textContent = 'De twee pincodes zijn niet gelijk.'; return; }
    const res = await api.createPin(a);
    if (!res.ok) { $('#parent-error').textContent = errorText(res); return; }
    pin = a;
    apply(res.status);
    showStep('timer');
  }

  async function onEnter(e) {
    e.preventDefault();
    const p = $('#pin-enter').value.trim();
    const res = await api.verify(p);
    $('#pin-enter').value = '';
    if (!res.ok) { $('#parent-error').textContent = errorText(res); return; }
    pin = p;
    showStep('timer');
  }

  async function act(promise) {
    const res = await promise;
    if (!res.ok) { $('#parent-error').textContent = errorText(res); return false; }
    $('#parent-error').textContent = '';
    apply(res.status || (await api.status()));
    return true;
  }

  function chosenMinutes() {
    const v = parseInt($('#timer-minutes').value, 10);
    return Number.isFinite(v) ? v : 0;
  }

  async function onStart() {
    const m = chosenMinutes();
    if (await act(api.startTimer(pin, m))) {
      const o = $('#timeup-overlay'); delete o.dataset.shutdown;
      toast(`⏱️ Speeltijd: ${m} minuten. Veel plezier!`);
      closePanel();
    }
  }

  async function onAdd() {
    if (await act(api.addTime(pin, 15))) toast('⏱️ 15 minuten erbij!');
  }

  async function onStop() {
    if (await act(api.stopTimer(pin))) { toast('⏹️ Timer gestopt.'); closePanel(); }
  }

  async function onChangePin(e) {
    e.preventDefault();
    const res = await api.changePin($('#pin-old').value.trim(), $('#pin-change').value.trim());
    $('#pin-old').value = ''; $('#pin-change').value = '';
    if (!res.ok) { $('#parent-error').textContent = errorText(res); return; }
    $('#parent-error').textContent = '';
    toast('🔑 Pincode gewijzigd.');
  }

  /* ---------- Opstarten ---------- */
  function init() {
    $('#pin-create-form').addEventListener('submit', onCreate);
    $('#pin-enter-form').addEventListener('submit', onEnter);
    $('#pin-change-form').addEventListener('submit', onChangePin);
    $('#btn-start-timer').addEventListener('click', onStart);
    $('#btn-add-time').addEventListener('click', onAdd);
    $('#btn-stop-timer').addEventListener('click', onStop);
    $('#btn-parent-close').addEventListener('click', closePanel);
    document.querySelectorAll('.timer-preset').forEach((b) => b.addEventListener('click', () => {
      $('#timer-minutes').value = b.dataset.min;
      document.querySelectorAll('.timer-preset').forEach((x) => x.classList.toggle('on', x === b));
    }));
    $('#timer-minutes').addEventListener('input', () => document.querySelectorAll('.timer-preset').forEach((x) => x.classList.remove('on')));
    document.querySelectorAll('[data-open-parent]').forEach((b) => b.addEventListener('click', openPanel));
    $('#timeup-parent').addEventListener('click', openPanel);

    api.on('parent:changed', apply);
    api.on('parent:warn', () => render());
    api.on('parent:expired', () => {
      st.endsAt = null; st.locked = true;
      $('#timeup-overlay').dataset.shutdown = '1';
      if (root.TTSound) root.TTSound.fanfare();
      showLocked(true);
      render();
    });
    api.status().then(apply);
    startTicking();
  }

  root.TTParent = {
    init,
    open: openPanel,
    // Typen en sneltoetsen negeren als een ouderscherm of het slotscherm open is
    blocksInput: () => !$('#parent-modal').classList.contains('hidden') || !$('#timeup-overlay').classList.contains('hidden'),
    modalOpen: () => !$('#parent-modal').classList.contains('hidden')
  };
})(window);
